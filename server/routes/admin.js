const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Payment = require('../models/Payment');
const Job = require('../models/Job');
const Course = require('../models/Course');
const Institution = require('../models/Institution');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Mini Admin or Super Admin)
router.get('/dashboard', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const isSuper = req.user.role === 'super_admin';
    
    // Basic statistics
    const stats = {
      users: {
        total: await User.countDocuments({ isActive: true }),
        students: await User.countDocuments({ role: 'student', isActive: true }),
        activeSubscriptions: await User.countDocuments({ 
          'subscription.isActive': true,
          'subscription.endDate': { $gte: new Date() }
        })
      },
      resources: {
        total: await Resource.countDocuments({ isActive: true }),
        pending: await Resource.countDocuments({ approvalStatus: 'pending' }),
        approved: await Resource.countDocuments({ approvalStatus: 'approved' }),
        premium: await Resource.countDocuments({ isPremium: true, isActive: true })
      },
      jobs: {
        total: await Job.countDocuments({ isActive: true }),
        active: await Job.countDocuments({ 
          isActive: true, 
          applicationDeadline: { $gte: new Date() } 
        })
      }
    };

    // Super admin gets additional financial stats
    if (isSuper) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      stats.revenue = {
        totalRevenue: await Payment.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        monthlyRevenue: await Payment.aggregate([
          { 
            $match: { 
              status: 'completed',
              createdAt: { $gte: thirtyDaysAgo }
            } 
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        subscriptionRevenue: await Payment.aggregate([
          { 
            $match: { 
              status: 'completed',
              type: 'subscription'
            } 
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        jobUnlockRevenue: await Payment.aggregate([
          { 
            $match: { 
              status: 'completed',
              type: 'job_unlock'
            } 
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0)
      };

      stats.institutions = {
        total: await Institution.countDocuments({ isActive: true })
      };

      stats.courses = {
        total: await Course.countDocuments({ isActive: true })
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/resources/pending
// @desc    Get pending resources for approval
// @access  Private (Mini Admin or Super Admin)
router.get('/resources/pending', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const resources = await Resource.find({ 
      approvalStatus: 'pending',
      isActive: true 
    })
    .populate('institution', 'name shortName')
    .populate('course', 'name code')
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Resource.countDocuments({ 
      approvalStatus: 'pending',
      isActive: true 
    });

    res.json({
      resources,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get pending resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get users with filters
// @access  Private (Super Admin only)
router.get('/users', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const { role, institution, search, page = 1, limit = 20 } = req.query;
    let query = { isActive: true };

    if (role) query.role = role;
    if (institution) query.institution = institution;
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .populate('institution', 'name shortName')
      .populate('course', 'name code')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Super Admin only)
router.put('/users/:id/role', [
  auth,
  authorize('super_admin'),
  body('role').isIn(['student', 'mini_admin', 'super_admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/deactivate
// @desc    Deactivate user account
// @access  Private (Super Admin only)
router.put('/users/:id/deactivate', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/payments
// @desc    Get payment history
// @access  Private (Super Admin only)
router.get('/payments', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('metadata.jobId', 'title company.name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Super Admin only)
router.get('/analytics', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Revenue trends
    const revenueTrends = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Most popular courses
    const popularCourses = await User.aggregate([
      {
        $match: {
          role: 'student',
          isActive: true
        }
      },
      {
        $group: {
          _id: '$course',
          studentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      { $sort: { studentCount: -1 } },
      { $limit: 10 }
    ]);

    // Most accessed resources
    const popularResources = await Resource.find({
      isActive: true,
      approvalStatus: 'approved'
    })
    .populate('course', 'name code')
    .populate('institution', 'name shortName')
    .sort({ viewCount: -1 })
    .limit(10)
    .select('title type viewCount downloadCount course institution');

    res.json({
      userRegistrations,
      revenueTrends,
      popularCourses,
      popularResources
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/assessments
// @desc    Get all assessments uploaded by this admin
// @access  Private (Mini Admin, Super Admin)
router.get('/assessments', [auth, authorize('mini_admin', 'super_admin')], async (req, res) => {
  try {
    console.log('📚 Fetching assessments for admin:', req.user.id);
    
    const courses = await Course.find({});
    const assessments = [];
    
    courses.forEach(course => {
      course.units.forEach(unit => {
        if (unit.assessments) {
          ['cats', 'assignments', 'pastExams'].forEach(type => {
            if (unit.assessments[type] && unit.assessments[type].length > 0) {
              unit.assessments[type].forEach(assessment => {
                // Only return assessments uploaded by this admin
                if (assessment.uploadedBy && assessment.uploadedBy.toString() === req.user.id) {
                  assessments.push({
                    _id: assessment._id,
                    type: type,
                    title: assessment.title,
                    description: assessment.description,
                    status: assessment.status,
                    filename: assessment.filename,
                    uploadDate: assessment.uploadDate,
                    dueDate: assessment.dueDate,
                    totalMarks: assessment.totalMarks,
                    duration: assessment.duration,
                    instructions: assessment.instructions,
                    course: {
                      _id: course._id,
                      name: course.name,
                      code: course.code
                    },
                    unit: {
                      _id: unit._id,
                      unitName: unit.unitName,
                      year: unit.year,
                      semester: unit.semester
                    },
                    reviewNotes: assessment.reviewNotes,
                    reviewDate: assessment.reviewDate,
                    isPremium: assessment.isPremium || false
                  });
                }
              });
            }
          });
        }
      });
    });
    
    console.log(`📊 Found ${assessments.length} assessments for admin`);
    
    res.json({
      success: true,
      assessments,
      totalCount: assessments.length
    });
    
  } catch (error) {
    console.error('Error fetching admin assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessments',
      error: error.message
    });
  }
});

module.exports = router;

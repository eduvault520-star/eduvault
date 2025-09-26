const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/jobs
// @desc    Get jobs with filters
// @access  Public (limited info for non-unlocked jobs)
router.get('/', async (req, res) => {
  try {
    const { course, employmentType, experienceLevel, search, limit = 20, page = 1 } = req.query;
    let query = { isActive: true, applicationDeadline: { $gte: new Date() } };

    if (course) {
      query.relatedCourses = course;
    }

    if (employmentType) {
      query.employmentType = employmentType;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const jobs = await Job.find(query)
      .populate('relatedCourses', 'name code')
      .select('title company.name company.location employmentType experienceLevel salary.min salary.max salary.currency applicationDeadline skills viewCount isPremium unlockPrice')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    res.json({ 
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job (full details if unlocked)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('relatedCourses', 'name code department')
      .populate('postedBy', 'firstName lastName');

    if (!job || !job.isActive) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findById(req.user.userId);
    const hasUnlocked = user.hasUnlockedJob(job._id);

    // Increment view count
    job.viewCount += 1;
    await job.save();

    // Return limited info if not unlocked and is premium
    if (job.isPremium && !hasUnlocked) {
      return res.json({
        job: {
          _id: job._id,
          title: job.title,
          company: {
            name: job.company.name,
            location: job.company.location
          },
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          salary: job.salary,
          applicationDeadline: job.applicationDeadline,
          skills: job.skills,
          description: job.description.substring(0, 200) + '...',
          requirements: job.requirements.slice(0, 3),
          isPremium: true,
          unlockPrice: job.unlockPrice,
          isLocked: true
        }
      });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private (Mini Admin or Super Admin)
router.post('/', [
  auth,
  authorize('mini_admin', 'super_admin'),
  body('title').trim().isLength({ min: 5 }),
  body('company.name').trim().isLength({ min: 2 }),
  body('description').trim().isLength({ min: 50 }),
  body('employmentType').isIn(['full_time', 'part_time', 'contract', 'internship', 'volunteer']),
  body('experienceLevel').isIn(['entry', 'junior', 'mid', 'senior', 'executive']),
  body('applicationDeadline').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobData = {
      ...req.body,
      postedBy: req.user.userId,
      applicationDeadline: new Date(req.body.applicationDeadline)
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (Mini Admin or Super Admin)
router.put('/:id', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Deactivate job posting
// @access  Private (Mini Admin or Super Admin)
router.delete('/:id', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deactivated successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/my/unlocked
// @desc    Get user's unlocked jobs
// @access  Private
router.get('/my/unlocked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'jobUnlocks.jobId',
        populate: {
          path: 'relatedCourses',
          select: 'name code'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const unlockedJobs = user.jobUnlocks
      .filter(unlock => unlock.jobId && unlock.jobId.isActive)
      .map(unlock => ({
        job: unlock.jobId,
        unlockedAt: unlock.unlockedAt,
        transactionId: unlock.transactionId
      }));

    res.json({ unlockedJobs });
  } catch (error) {
    console.error('Get unlocked jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

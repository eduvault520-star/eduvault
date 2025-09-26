const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/content-approval/pending
// @desc    Get all pending content for approval
// @access  Private (Super Admin only)
router.get('/pending', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    console.log('🔍 Content approval: Fetching courses for super admin...');
    console.log('👤 Requested by user:', req.user.id, req.user.email);
    
    const courses = await Course.find({});
    
    console.log('📊 Found courses:', courses.length);

    const pendingContent = [];

    courses.forEach(course => {
      course.units.forEach(unit => {
        unit.topics.forEach(topic => {
          // Check lecture videos
          if (topic.content?.lectureVideo?.status === 'pending') {
            pendingContent.push({
              type: 'video',
              courseId: course._id,
              courseName: course.name,
              unitId: unit._id,
              unitName: unit.unitName,
              topicId: topic._id,
              topicTitle: topic.title,
              content: topic.content.lectureVideo,
              uploadDate: topic.content.lectureVideo.uploadDate
            });
          }

          // Check notes
          if (topic.content?.notes?.status === 'pending') {
            pendingContent.push({
              type: 'notes',
              courseId: course._id,
              courseName: course.name,
              unitId: unit._id,
              unitName: unit.unitName,
              topicId: topic._id,
              topicTitle: topic.title,
              content: topic.content.notes,
              uploadDate: topic.content.notes.uploadDate
            });
          }
        });

        // Check assessments
        console.log(`🔍 Checking assessments for unit: ${unit.unitName} (Course: ${course.name})`);
        if (unit.assessments) {
          console.log(`📊 Assessment counts:`, {
            cats: unit.assessments.cats?.length || 0,
            assignments: unit.assessments.assignments?.length || 0,
            pastExams: unit.assessments.pastExams?.length || 0
          });
          
          // Log details of each assessment
          ['cats', 'assignments', 'pastExams'].forEach(type => {
            if (unit.assessments[type] && unit.assessments[type].length > 0) {
              console.log(`📋 ${type} details:`, unit.assessments[type].map(a => ({
                id: a._id,
                title: a.title,
                status: a.status,
                uploadDate: a.uploadDate
              })));
            }
          });
        } else {
          console.log(`❌ No assessments object found for unit: ${unit.unitName}`);
        }
        
        ['cats', 'assignments', 'pastExams'].forEach(assessmentType => {
          const assessments = unit.assessments?.[assessmentType];
          if (assessments && assessments.length > 0) {
            console.log(`📋 Found ${assessments.length} ${assessmentType} in ${unit.unitName}`);
            assessments.forEach((assessment, index) => {
              console.log(`📝 ${assessmentType}[${index}]:`, {
                title: assessment.title,
                status: assessment.status,
                uploadDate: assessment.uploadDate,
                hasId: !!assessment._id
              });
              
              if (assessment.status === 'pending') {
                console.log(`✅ Adding pending ${assessmentType}: ${assessment.title}`);
                pendingContent.push({
                  type: assessmentType,
                  courseId: course._id,
                  courseName: course.name,
                  unitId: unit._id,
                  unitName: unit.unitName,
                  assessmentId: assessment._id,
                  content: assessment,
                  uploadDate: assessment.uploadDate
                });
              }
            });
          } else {
            console.log(`❌ No ${assessmentType} found in ${unit.unitName}`);
          }
        });
      });
    });

    // Sort by upload date (newest first)
    pendingContent.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    console.log(`📊 Total pending content found: ${pendingContent.length}`);
    if (pendingContent.length > 0) {
      console.log(`📋 Pending content summary:`, pendingContent.map(c => ({
        type: c.type,
        title: c.content?.title || c.topicTitle,
        course: c.courseName,
        unit: c.unitName
      })));
    }

    res.json({
      pendingContent,
      totalPending: pendingContent.length
    });
  } catch (error) {
    console.error('❌ Get pending content error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/content-approval/approve
// @desc    Approve content
// @access  Private (Super Admin only)
router.post('/approve', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const { 
      courseId, 
      unitId, 
      topicId, 
      assessmentId, 
      contentType, 
      reviewNotes,
      isPremium = false
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    let contentUpdated = false;

    if (topicId) {
      const topic = unit.topics.id(topicId);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }

      if (contentType === 'video' && topic.content?.lectureVideo) {
        topic.content.lectureVideo.status = 'approved';
        topic.content.lectureVideo.reviewedBy = req.user.id;
        topic.content.lectureVideo.reviewDate = new Date();
        topic.content.lectureVideo.reviewNotes = reviewNotes;
        topic.content.lectureVideo.isPremium = isPremium;
        contentUpdated = true;
      } else if (contentType === 'notes' && topic.content?.notes) {
        topic.content.notes.status = 'approved';
        topic.content.notes.reviewedBy = req.user.id;
        topic.content.notes.reviewDate = new Date();
        topic.content.notes.reviewNotes = reviewNotes;
        topic.content.notes.isPremium = isPremium;
        contentUpdated = true;
      }
    } else if (assessmentId) {
      const assessmentTypes = ['cats', 'assignments', 'pastExams'];
      for (const type of assessmentTypes) {
        const assessment = unit.assessments?.[type]?.id(assessmentId);
        if (assessment) {
          assessment.status = 'approved';
          assessment.reviewedBy = req.user.id;
          assessment.reviewDate = new Date();
          assessment.reviewNotes = reviewNotes;
          assessment.isPremium = isPremium;
          contentUpdated = true;
          break;
        }
      }
    }

    if (!contentUpdated) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await course.save();

    res.json({
      message: 'Content approved successfully',
      course
    });
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/content-approval/reject
// @desc    Reject content
// @access  Private (Super Admin only)
router.post('/reject', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const { 
      courseId, 
      unitId, 
      topicId, 
      assessmentId, 
      contentType, 
      reviewNotes 
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    let contentUpdated = false;

    if (topicId) {
      const topic = unit.topics.id(topicId);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }

      if (contentType === 'video' && topic.content?.lectureVideo) {
        topic.content.lectureVideo.status = 'rejected';
        topic.content.lectureVideo.reviewedBy = req.user.id;
        topic.content.lectureVideo.reviewDate = new Date();
        topic.content.lectureVideo.reviewNotes = reviewNotes;
        contentUpdated = true;
      } else if (contentType === 'notes' && topic.content?.notes) {
        topic.content.notes.status = 'rejected';
        topic.content.notes.reviewedBy = req.user.id;
        topic.content.notes.reviewDate = new Date();
        topic.content.notes.reviewNotes = reviewNotes;
        contentUpdated = true;
      }
    } else if (assessmentId) {
      const assessmentTypes = ['cats', 'assignments', 'pastExams'];
      for (const type of assessmentTypes) {
        const assessment = unit.assessments?.[type]?.id(assessmentId);
        if (assessment) {
          assessment.status = 'rejected';
          assessment.reviewedBy = req.user.id;
          assessment.reviewDate = new Date();
          assessment.reviewNotes = reviewNotes;
          contentUpdated = true;
          break;
        }
      }
    }

    if (!contentUpdated) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await course.save();

    res.json({
      message: 'Content rejected successfully',
      course
    });
  } catch (error) {
    console.error('Reject content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/content-approval/stats
// @desc    Get content approval statistics
// @access  Private (Super Admin only)
router.get('/stats', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const courses = await Course.find({});

    let stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    courses.forEach(course => {
      course.units.forEach(unit => {
        unit.topics.forEach(topic => {
          // Count video content
          if (topic.content?.lectureVideo?.status) {
            stats[topic.content.lectureVideo.status]++;
            stats.total++;
          }

          // Count notes content
          if (topic.content?.notes?.status) {
            stats[topic.content.notes.status]++;
            stats.total++;
          }
        });

        // Count assessments
        ['cats', 'assignments', 'pastExams'].forEach(assessmentType => {
          unit.assessments?.[assessmentType]?.forEach(assessment => {
            if (assessment.status) {
              stats[assessment.status]++;
              stats.total++;
            }
          });
        });
      });
    });

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/content-approval/delete
// @desc    Delete content permanently from database
// @access  Private (Super Admin only)
router.delete('/delete', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const { 
      courseId, 
      unitId, 
      topicId, 
      assessmentId, 
      contentType
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    let contentDeleted = false;

    if (topicId) {
      const topic = unit.topics.id(topicId);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }

      if (contentType === 'video' && topic.content?.lectureVideo) {
        topic.content.lectureVideo = undefined;
        contentDeleted = true;
      } else if (contentType === 'notes' && topic.content?.notes) {
        topic.content.notes = undefined;
        contentDeleted = true;
      }
    } else if (assessmentId) {
      const assessmentTypes = ['cats', 'assignments', 'pastExams'];
      for (const type of assessmentTypes) {
        const assessmentIndex = unit.assessments?.[type]?.findIndex(
          assessment => assessment._id.toString() === assessmentId
        );
        if (assessmentIndex !== -1) {
          unit.assessments[type].splice(assessmentIndex, 1);
          contentDeleted = true;
          break;
        }
      }
    }

    if (!contentDeleted) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await course.save();

    console.log(`✅ Content deleted by ${req.user.firstName} ${req.user.lastName}`);
    console.log(`   Course: ${course.name}`);
    console.log(`   Content Type: ${contentType}`);

    res.json({
      message: 'Content deleted successfully',
      deletedBy: req.user.id,
      deletedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Delete content error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/content-approval/approved
// @desc    Get all approved content for management
// @access  Private (Super Admin only)
router.get('/approved', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const courses = await Course.find({});
    const approvedContent = [];

    courses.forEach(course => {
      course.units.forEach(unit => {
        // Check approved topics with content
        unit.topics?.forEach(topic => {
          if (topic.content?.lectureVideo?.status === 'approved') {
            approvedContent.push({
              topicId: topic._id,
              topicTitle: topic.title,
              type: 'video',
              courseId: course._id,
              courseName: course.name,
              unitId: unit._id,
              unitName: unit.unitName,
              uploadDate: topic.content.lectureVideo.uploadDate,
              content: {
                filename: topic.content.lectureVideo.filename,
                filePath: topic.content.lectureVideo.filePath,
                uploadedBy: topic.content.lectureVideo.uploadedBy,
                isPremium: topic.content.lectureVideo.isPremium,
                reviewDate: topic.content.lectureVideo.reviewDate,
                reviewNotes: topic.content.lectureVideo.reviewNotes
              }
            });
          }

          if (topic.content?.notes?.status === 'approved') {
            approvedContent.push({
              topicId: topic._id,
              topicTitle: topic.title,
              type: 'notes',
              courseId: course._id,
              courseName: course.name,
              unitId: unit._id,
              unitName: unit.unitName,
              uploadDate: topic.content.notes.uploadDate,
              content: {
                filename: topic.content.notes.filename,
                filePath: topic.content.notes.filePath,
                uploadedBy: topic.content.notes.uploadedBy,
                isPremium: topic.content.notes.isPremium,
                reviewDate: topic.content.notes.reviewDate,
                reviewNotes: topic.content.notes.reviewNotes
              }
            });
          }
        });

        // Check approved assessments
        ['cats', 'assignments', 'pastExams'].forEach(assessmentType => {
          unit.assessments?.[assessmentType]?.forEach(assessment => {
            if (assessment.status === 'approved') {
              approvedContent.push({
                assessmentId: assessment._id,
                type: assessmentType,
                courseId: course._id,
                courseName: course.name,
                unitId: unit._id,
                unitName: unit.unitName,
                uploadDate: assessment.uploadDate,
                content: {
                  title: assessment.title,
                  filename: assessment.filename,
                  filePath: assessment.filePath,
                  uploadedBy: assessment.uploadedBy,
                  isPremium: assessment.isPremium,
                  reviewDate: assessment.reviewDate,
                  reviewNotes: assessment.reviewNotes
                }
              });
            }
          });
        });
      });
    });

    // Sort by approval date (newest first)
    approvedContent.sort((a, b) => {
      const dateA = new Date(a.content.reviewDate || a.uploadDate);
      const dateB = new Date(b.content.reviewDate || b.uploadDate);
      return dateB - dateA;
    });

    console.log(`📊 Found ${approvedContent.length} approved content items`);

    res.json({
      success: true,
      count: approvedContent.length,
      approvedContent
    });

  } catch (error) {
    console.error('❌ Error fetching approved content:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PUT /api/content-approval/premium
// @desc    Toggle premium status of approved content
// @access  Private (Super Admin only)
router.put('/premium', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const { 
      courseId, 
      unitId, 
      topicId, 
      assessmentId, 
      contentType,
      isPremium
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    let updated = false;

    if (topicId) {
      const topic = unit.topics.id(topicId);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }

      if (contentType === 'video' && topic.content?.lectureVideo) {
        topic.content.lectureVideo.isPremium = isPremium;
        updated = true;
      } else if (contentType === 'notes' && topic.content?.notes) {
        topic.content.notes.isPremium = isPremium;
        updated = true;
      }
    } else if (assessmentId) {
      const assessmentTypes = ['cats', 'assignments', 'pastExams'];
      for (const type of assessmentTypes) {
        const assessment = unit.assessments?.[type]?.id(assessmentId);
        if (assessment) {
          assessment.isPremium = isPremium;
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await course.save();

    console.log(`✅ Premium status updated: ${isPremium ? 'Premium' : 'Free'}`);

    res.json({
      success: true,
      message: `Content ${isPremium ? 'marked as premium' : 'removed from premium'}`,
      isPremium
    });

  } catch (error) {
    console.error('❌ Error updating premium status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Temporary debug route without auth
router.get('/pending-debug', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Content approval pending (no auth)...');
    
    const courses = await Course.find({});
    console.log('📊 Found courses:', courses.length);

    const pendingContent = [];

    courses.forEach(course => {
      course.units.forEach(unit => {
        // Check assessments only for debugging
        if (unit.assessments) {
          ['cats', 'assignments', 'pastExams'].forEach(assessmentType => {
            const assessments = unit.assessments[assessmentType];
            if (assessments && assessments.length > 0) {
              assessments.forEach(assessment => {
                console.log(`🔍 Found ${assessmentType}: ${assessment.title}, status: ${assessment.status}`);
                if (assessment.status === 'pending') {
                  console.log(`✅ Adding pending ${assessmentType}: ${assessment.title}`);
                  pendingContent.push({
                    type: assessmentType,
                    courseId: course._id,
                    courseName: course.name,
                    unitId: unit._id,
                    unitName: unit.unitName,
                    assessmentId: assessment._id,
                    content: assessment,
                    uploadDate: assessment.uploadDate
                  });
                }
              });
            }
          });
        }
      });
    });

    console.log(`📊 Total pending content found: ${pendingContent.length}`);

    res.json({
      success: true,
      pendingContent,
      totalPending: pendingContent.length
    });

  } catch (error) {
    console.error('Error fetching pending content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

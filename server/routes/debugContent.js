const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');

// Debug endpoint to check what content exists in the database (no auth for testing)
router.get('/debug/content', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Fetching all courses and their content...');
    
    const courses = await Course.find({})
      .populate('institution', 'name shortName')
      .select('name code units');

    const contentSummary = [];

    courses.forEach(course => {
      const courseInfo = {
        courseId: course._id,
        courseName: course.name,
        courseCode: course.code,
        institution: course.institution?.name,
        units: []
      };

      course.units.forEach(unit => {
        const unitInfo = {
          unitId: unit._id,
          unitName: unit.unitName,
          year: unit.year,
          semester: unit.semester,
          topics: unit.topics?.length || 0,
          assessments: {
            cats: [],
            assignments: [],
            pastExams: []
          }
        };

        // Check assessments
        if (unit.assessments) {
          ['cats', 'assignments', 'pastExams'].forEach(type => {
            if (unit.assessments[type] && unit.assessments[type].length > 0) {
              unit.assessments[type].forEach(assessment => {
                unitInfo.assessments[type].push({
                  id: assessment._id,
                  title: assessment.title,
                  status: assessment.status,
                  uploadDate: assessment.uploadDate,
                  filename: assessment.filename,
                  uploadedBy: assessment.uploadedBy,
                  isPremium: assessment.isPremium || false
                });
              });
            }
          });
        }

        courseInfo.units.push(unitInfo);
      });

      contentSummary.push(courseInfo);
    });

    console.log('📊 Content summary generated');
    
    res.json({
      success: true,
      totalCourses: courses.length,
      contentSummary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content debug info',
      error: error.message
    });
  }
});

// Debug endpoint to check pending content for approval (no auth for testing)
router.get('/debug/pending', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Checking pending content...');
    
    const courses = await Course.find({});
    const pendingContent = [];

    courses.forEach(course => {
      course.units.forEach(unit => {
        // Check assessments
        if (unit.assessments) {
          ['cats', 'assignments', 'pastExams'].forEach(assessmentType => {
            const assessments = unit.assessments[assessmentType];
            if (assessments && assessments.length > 0) {
              assessments.forEach(assessment => {
                if (assessment.status === 'pending') {
                  pendingContent.push({
                    type: assessmentType,
                    courseId: course._id,
                    courseName: course.name,
                    unitId: unit._id,
                    unitName: unit.unitName,
                    assessmentId: assessment._id,
                    title: assessment.title,
                    uploadDate: assessment.uploadDate,
                    uploadedBy: assessment.uploadedBy,
                    filename: assessment.filename
                  });
                }
              });
            }
          });
        }
      });
    });

    console.log(`📊 Found ${pendingContent.length} pending items`);
    
    res.json({
      success: true,
      pendingCount: pendingContent.length,
      pendingContent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug pending error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending content debug info',
      error: error.message
    });
  }
});

// Debug endpoint to manually approve content
router.post('/debug/approve/:courseId/:unitId/:assessmentId', [auth, authorize('super_admin')], async (req, res) => {
  try {
    const { courseId, unitId, assessmentId } = req.params;
    const { assessmentType } = req.body; // 'cats', 'assignments', or 'pastExams'

    console.log(`🔍 DEBUG: Manually approving ${assessmentType} assessment...`);

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    if (!unit.assessments || !unit.assessments[assessmentType]) {
      return res.status(404).json({ message: `No ${assessmentType} found in unit` });
    }

    const assessment = unit.assessments[assessmentType].id(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Approve the assessment
    assessment.status = 'approved';
    assessment.reviewedBy = req.user.id;
    assessment.reviewDate = new Date();
    assessment.reviewNotes = 'Manually approved via debug endpoint';

    await course.save();

    console.log(`✅ Assessment approved: ${assessment.title}`);

    res.json({
      success: true,
      message: 'Assessment approved successfully',
      assessment: {
        id: assessment._id,
        title: assessment.title,
        status: assessment.status,
        reviewDate: assessment.reviewDate
      }
    });

  } catch (error) {
    console.error('❌ Debug approve error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving assessment',
      error: error.message
    });
  }
});

module.exports = router;

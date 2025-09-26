const express = require('express');
const Course = require('../models/Course');
const Subscription = require('../models/Subscription');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/student/course/:courseId/content
// @desc    Get approved content for a course (for students)
// @access  Private (Students)
router.get('/course/:courseId/content', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { year, semester } = req.query;
    const userId = req.user.id;

    console.log('📚 Fetching approved content for course:', courseId, 'user:', userId);

    const course = await Course.findById(courseId)
      .populate('institution', 'name shortName')
      .select('name code department units institution');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check user's subscriptions for different years
    const userSubscriptions = {};
    if (year) {
      userSubscriptions[year] = await Subscription.hasActiveSubscription(userId, courseId, parseInt(year));
    } else {
      // Check subscriptions for all years (1-6)
      for (let y = 1; y <= 6; y++) {
        userSubscriptions[y] = await Subscription.hasActiveSubscription(userId, courseId, y);
      }
    }

    const approvedContent = [];

    // Filter units by year and semester if provided
    let filteredUnits = course.units;
    if (year) {
      filteredUnits = filteredUnits.filter(unit => unit.year == year);
    }
    if (semester) {
      filteredUnits = filteredUnits.filter(unit => unit.semester == semester);
    }

    filteredUnits.forEach(unit => {
      // Process topics and their content
      unit.topics.forEach(topic => {
        const hasSubscription = userSubscriptions[unit.year] || false;

        // Add approved lecture videos
        if (topic.content?.lectureVideo?.status === 'approved') {
          const isVideoPremium = topic.content.lectureVideo.isPremium || false;
          const canAccess = !isVideoPremium || hasSubscription;

          approvedContent.push({
            id: `${unit._id}-${topic._id}-video`,
            type: 'video',
            title: topic.content.lectureVideo.title || topic.title,
            description: topic.description,
            filename: canAccess ? topic.content.lectureVideo.filename : null,
            fileSize: topic.content.lectureVideo.fileSize,
            duration: topic.content.lectureVideo.duration,
            isPremium: isVideoPremium,
            hasAccess: canAccess,
            requiresSubscription: isVideoPremium && !hasSubscription,
            uploadDate: topic.content.lectureVideo.uploadDate,
            accessRules: {
              canStream: canAccess,
              canDownload: false, // Videos never downloadable
              preventScreenshot: true,
              preventRecording: true
            },
            unit: {
              id: unit._id,
              name: unit.unitName,
              code: unit.unitCode,
              year: unit.year,
              semester: unit.semester
            },
            topic: {
              id: topic._id,
              title: topic.title,
              number: topic.topicNumber
            }
          });
        }

        // Add approved notes (download only with subscription)
        if (topic.content?.notes?.status === 'approved') {
          const isNotesPremium = topic.content.notes.isPremium || false;
          const canDownload = !isNotesPremium || hasSubscription;

          approvedContent.push({
            id: `${unit._id}-${topic._id}-notes`,
            type: 'notes',
            title: topic.content.notes.title || `${topic.title} - Notes`,
            description: topic.description,
            filename: topic.content.notes.filename,
            fileSize: topic.content.notes.fileSize,
            isPremium: isNotesPremium,
            hasAccess: true, // Can always view, but download requires subscription
            requiresSubscription: isNotesPremium && !hasSubscription,
            uploadDate: topic.content.notes.uploadDate,
            accessRules: {
              canView: true,
              canDownload: canDownload,
              downloadRequiresSubscription: isNotesPremium
            },
            unit: {
              id: unit._id,
              name: unit.unitName,
              code: unit.unitCode,
              year: unit.year,
              semester: unit.semester
            },
            topic: {
              id: topic._id,
              title: topic.title,
              number: topic.topicNumber
            }
          });
        }

        // Add YouTube resources
        if (topic.content?.youtubeResources?.length > 0) {
          topic.content.youtubeResources.forEach((youtube, index) => {
            approvedContent.push({
              id: `${unit._id}-${topic._id}-youtube-${index}`,
              type: 'youtube',
              title: youtube.title,
              description: youtube.description,
              url: youtube.url,
              isPremium: youtube.isPremium || false,
              unit: {
                id: unit._id,
                name: unit.unitName,
                code: unit.unitCode,
                year: unit.year,
                semester: unit.semester
              },
              topic: {
                id: topic._id,
                title: topic.title,
                number: topic.topicNumber
              }
            });
          });
        }
      });

      // Process assessments with specific access rules
      if (unit.assessments) {
        ['cats', 'assignments', 'pastExams'].forEach(assessmentType => {
          if (unit.assessments[assessmentType]) {
            unit.assessments[assessmentType].forEach(assessment => {
              if (assessment.status === 'approved') {
                const hasSubscription = userSubscriptions[unit.year] || false;
                const isAssessmentPremium = assessment.isPremium || false;
                
                // Access rules based on assessment type
                let accessRules = {};
                if (assessmentType === 'assignments') {
                  // Assignments are always free per unit
                  accessRules = {
                    canView: true,
                    canDownload: true,
                    isFree: true,
                    preventScreenshot: false
                  };
                } else if (assessmentType === 'cats' || assessmentType === 'pastExams') {
                  // CATs and Exams: view only on site, prevent screenshots
                  const canAccess = !isAssessmentPremium || hasSubscription;
                  accessRules = {
                    canView: canAccess,
                    canDownload: false, // Never downloadable
                    viewOnlyOnSite: true,
                    preventScreenshot: true,
                    preventRecording: true,
                    requiresSubscription: isAssessmentPremium && !hasSubscription
                  };
                }

                approvedContent.push({
                  id: `${unit._id}-${assessment._id}-${assessmentType}`,
                  type: assessmentType,
                  title: assessment.title,
                  description: assessment.description,
                  filename: accessRules.canView ? assessment.filename : null,
                  fileSize: assessment.fileSize,
                  isPremium: isAssessmentPremium,
                  hasAccess: accessRules.canView || accessRules.isFree,
                  requiresSubscription: accessRules.requiresSubscription || false,
                  uploadDate: assessment.uploadDate,
                  dueDate: assessment.dueDate,
                  totalMarks: assessment.totalMarks,
                  accessRules,
                  unit: {
                    id: unit._id,
                    name: unit.unitName,
                    code: unit.unitCode,
                    year: unit.year,
                    semester: unit.semester
                  }
                });
              }
            });
          }
        });
      }
    });

    // Sort content by upload date (newest first)
    approvedContent.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.json({
      course: {
        id: course._id,
        name: course.name,
        code: course.code,
        department: course.department,
        institution: course.institution
      },
      content: approvedContent,
      totalContent: approvedContent.length,
      premiumContent: approvedContent.filter(c => c.isPremium).length,
      freeContent: approvedContent.filter(c => !c.isPremium).length,
      subscriptions: userSubscriptions,
      subscriptionInfo: {
        price: 100,
        currency: 'KSH',
        duration: '1 month',
        perYear: true,
        perCourse: true
      }
    });

  } catch (error) {
    console.error('❌ Error fetching student content:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
});

// @route   GET /api/student/course/:courseId/units
// @desc    Get course units structure for navigation
// @access  Private (Students)
router.get('/course/:courseId/units', auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .select('name code units.unitName units.unitCode units.year units.semester units._id');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Group units by year and semester
    const unitsStructure = {};
    
    course.units.forEach(unit => {
      const yearKey = `year${unit.year}`;
      const semesterKey = `semester${unit.semester}`;
      
      if (!unitsStructure[yearKey]) {
        unitsStructure[yearKey] = {};
      }
      
      if (!unitsStructure[yearKey][semesterKey]) {
        unitsStructure[yearKey][semesterKey] = [];
      }
      
      unitsStructure[yearKey][semesterKey].push({
        id: unit._id,
        name: unit.unitName,
        code: unit.unitCode,
        year: unit.year,
        semester: unit.semester
      });
    });

    res.json({
      course: {
        id: course._id,
        name: course.name,
        code: course.code
      },
      unitsStructure
    });

  } catch (error) {
    console.error('❌ Error fetching course units:', error);
    res.status(500).json({ message: 'Server error fetching units' });
  }
});

module.exports = router;

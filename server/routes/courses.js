const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/courses
// @desc    Get courses by institution
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { institution, search, department } = req.query;
    let query = { isActive: true };

    if (institution) {
      query.institution = institution;
    }

    if (department) {
      query.department = new RegExp(department, 'i');
    }

    if (search) {
      query.$text = { $search: search };
    }

    const courses = await Course.find(query)
      .populate('institution', 'name shortName logo')
      .select('name code department duration description requirements careerProspects popularity')
      .sort({ popularity: -1, name: 1 });

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID with units
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('institution', 'name shortName logo colors');

    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Increment popularity
    course.popularity += 1;
    await course.save();

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id/units/:year
// @desc    Get units for a specific year
// @access  Public
router.get('/:id/units/:year', async (req, res) => {
  try {
    const { id, year } = req.params;
    const course = await Course.findById(id);

    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const units = course.units.filter(unit => unit.year === parseInt(year));
    
    // Group units by semester
    const unitsBySemester = units.reduce((acc, unit) => {
      if (!acc[unit.semester]) {
        acc[unit.semester] = [];
      }
      acc[unit.semester].push(unit);
      return acc;
    }, {});

    res.json({ 
      course: {
        id: course._id,
        name: course.name,
        code: course.code
      },
      year: parseInt(year),
      units: unitsBySemester
    });
  } catch (error) {
    console.error('Get course units error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Mini Admin or Super Admin)
router.post('/', [
  auth,
  authorize('mini_admin', 'super_admin'),
  body('name').trim().isLength({ min: 2 }),
  body('code').trim().isLength({ min: 2 }),
  body('institution').isMongoId(),
  body('department').trim().isLength({ min: 2 }),
  body('duration.years').isInt({ min: 1, max: 6 }),
  body('duration.semesters').isInt({ min: 2, max: 12 }),
  body('description').trim().isLength({ min: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = new Course(req.body);
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Course with this code already exists for this institution' 
      });
    }
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Mini Admin or Super Admin)
router.put('/:id', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses/:id/units
// @desc    Add unit to course
// @access  Private (Mini Admin or Super Admin)
router.post('/:id/units', [
  auth,
  authorize('mini_admin', 'super_admin'),
  body('year').isInt({ min: 1, max: 6 }),
  body('semester').isInt({ min: 1, max: 2 }),
  body('unitCode').trim().isLength({ min: 2 }),
  body('unitName').trim().isLength({ min: 2 }),
  body('creditHours').isInt({ min: 1, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if unit code already exists in the course
    const existingUnit = course.units.find(unit => 
      unit.unitCode === req.body.unitCode.toUpperCase()
    );

    if (existingUnit) {
      return res.status(400).json({ 
        message: 'Unit with this code already exists in the course' 
      });
    }

    course.units.push({
      ...req.body,
      unitCode: req.body.unitCode.toUpperCase()
    });

    await course.save();

    res.status(201).json({
      message: 'Unit added successfully',
      course
    });
  } catch (error) {
    console.error('Add unit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id/units/:unitId
// @desc    Update unit in course
// @access  Private (Mini Admin or Super Admin)
router.put('/:id/units/:unitId', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unitIndex = course.units.findIndex(unit => 
      unit._id.toString() === req.params.unitId
    );

    if (unitIndex === -1) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Check if unit code already exists in other units
    const existingUnit = course.units.find((unit, index) => 
      unit.unitCode === req.body.unitCode.toUpperCase() && index !== unitIndex
    );

    if (existingUnit) {
      return res.status(400).json({ 
        message: 'Unit with this code already exists in the course' 
      });
    }

    // Update the unit
    course.units[unitIndex] = {
      ...course.units[unitIndex].toObject(),
      ...req.body,
      unitCode: req.body.unitCode.toUpperCase()
    };

    await course.save();

    res.json({
      message: 'Unit updated successfully',
      course
    });
  } catch (error) {
    console.error('Update unit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id/units/:unitId
// @desc    Delete unit from course
// @access  Private (Mini Admin or Super Admin)
router.delete('/:id/units/:unitId', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unitIndex = course.units.findIndex(unit => 
      unit._id.toString() === req.params.unitId
    );

    if (unitIndex === -1) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    course.units.splice(unitIndex, 1);
    await course.save();

    res.json({
      message: 'Unit deleted successfully',
      course
    });
  } catch (error) {
    console.error('Delete unit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses/:id/units/:unitId/topics
// @desc    Add topic to unit
// @access  Private (Mini Admin or Super Admin)
router.post('/:id/units/:unitId/topics', [
  auth,
  authorize('mini_admin', 'super_admin'),
  body('title').trim().isLength({ min: 2 }),
  body('topicNumber').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Check if topic number already exists
    const existingTopic = unit.topics.find(topic => 
      topic.topicNumber === req.body.topicNumber
    );

    if (existingTopic) {
      return res.status(400).json({ 
        message: 'Topic with this number already exists in the unit' 
      });
    }

    unit.topics.push(req.body);
    await course.save();

    res.status(201).json({
      message: 'Topic added successfully',
      course
    });
  } catch (error) {
    console.error('Add topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id/units/:unitId/topics/:topicId
// @desc    Update topic in unit
// @access  Private (Mini Admin or Super Admin)
router.put('/:id/units/:unitId/topics/:topicId', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const topic = unit.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Update topic
    Object.assign(topic, req.body);
    await course.save();

    res.json({
      message: 'Topic updated successfully',
      course
    });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id/units/:unitId/topics/:topicId
// @desc    Delete topic from unit
// @access  Private (Mini Admin or Super Admin)
router.delete('/:id/units/:unitId/topics/:topicId', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    unit.topics.pull(req.params.topicId);
    await course.save();

    res.json({
      message: 'Topic deleted successfully',
      course
    });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses/:id/units/:unitId/assessments/:type
// @desc    Add assessment to unit (cats, assignments, pastExams)
// @access  Private (Mini Admin or Super Admin)
router.post('/:id/units/:unitId/assessments/:type', [
  auth,
  authorize('mini_admin', 'super_admin'),
  body('title').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type } = req.params;
    if (!['cats', 'assignments', 'pastExams'].includes(type)) {
      return res.status(400).json({ message: 'Invalid assessment type' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    if (!unit.assessments) {
      unit.assessments = { cats: [], assignments: [], pastExams: [] };
    }

    unit.assessments[type].push(req.body);
    await course.save();

    res.status(201).json({
      message: `${type.slice(0, -1)} added successfully`,
      course
    });
  } catch (error) {
    console.error('Add assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id/units/:unitId/assessments/:type/:assessmentId
// @desc    Update assessment in unit
// @access  Private (Mini Admin or Super Admin)
router.put('/:id/units/:unitId/assessments/:type/:assessmentId', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const { type } = req.params;
    if (!['cats', 'assignments', 'pastExams'].includes(type)) {
      return res.status(400).json({ message: 'Invalid assessment type' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const assessment = unit.assessments[type].id(req.params.assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    Object.assign(assessment, req.body);
    await course.save();

    res.json({
      message: `${type.slice(0, -1)} updated successfully`,
      course
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id/units/:unitId/assessments/:type/:assessmentId
// @desc    Delete assessment from unit
// @access  Private (Mini Admin or Super Admin)
router.delete('/:id/units/:unitId/assessments/:type/:assessmentId', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const { type } = req.params;
    if (!['cats', 'assignments', 'pastExams'].includes(type)) {
      return res.status(400).json({ message: 'Invalid assessment type' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unit = course.units.id(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    unit.assessments[type].pull(req.params.assessmentId);
    await course.save();

    res.json({
      message: `${type.slice(0, -1)} deleted successfully`,
      course
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const Institution = require('../models/Institution');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/institutions
// @desc    Get all active institutions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = { isActive: true };

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const institutions = await Institution.find(query)
      .select('name shortName type location logo colors')
      .sort({ name: 1 });

    res.json({ institutions });
  } catch (error) {
    console.error('Get institutions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/institutions/:id
// @desc    Get institution by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution || !institution.isActive) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json({ institution });
  } catch (error) {
    console.error('Get institution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/institutions
// @desc    Create new institution
// @access  Private (Super Admin only)
router.post('/', [
  auth,
  authorize('super_admin'),
  body('name').trim().isLength({ min: 2 }),
  body('shortName').trim().isLength({ min: 2 }),
  body('type').isIn(['university', 'technical_college', 'medical_college', 'polytechnic', 'other']),
  body('location.county').trim().isLength({ min: 2 }),
  body('location.town').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const institution = new Institution(req.body);
    await institution.save();

    res.status(201).json({
      message: 'Institution created successfully',
      institution
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Institution with this name or short name already exists' 
      });
    }
    console.error('Create institution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/institutions/:id
// @desc    Update institution
// @access  Private (Super Admin only)
router.put('/:id', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json({
      message: 'Institution updated successfully',
      institution
    });
  } catch (error) {
    console.error('Update institution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/institutions/:id
// @desc    Deactivate institution
// @access  Private (Super Admin only)
router.delete('/:id', [
  auth,
  authorize('super_admin')
], async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json({ message: 'Institution deactivated successfully' });
  } catch (error) {
    console.error('Delete institution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

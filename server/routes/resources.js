const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const { auth, authorize, checkSubscription } = require('../middleware/auth');
const QRCode = require('qrcode');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eduvault/resources',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'mp4', 'avi', 'mov', 'mkv', 'wmv'],
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and video files are allowed.'));
    }
  }
});

// Helper function to generate QR code
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data);
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    return null;
  }
};

// Helper function to add watermark to videos (for premium content)
const addWatermarkToVideo = async (videoUrl, institutionName) => {
  try {
    // Use Cloudinary's video transformation to add text overlay
    const watermarkedUrl = cloudinary.url(videoUrl, {
      resource_type: 'video',
      transformation: [
        {
          overlay: {
            font_family: 'Arial',
            font_size: 40,
            font_weight: 'bold',
            text: institutionName
          },
          gravity: 'south_east',
          x: 20,
          y: 20,
          opacity: 70
        }
      ]
    });
    return watermarkedUrl;
  } catch (error) {
    console.error('Watermark error:', error);
    return videoUrl; // Return original if watermarking fails
  }
};

// @route   GET /api/resources
// @desc    Get resources by filters
// @access  Public (with premium restrictions)
router.get('/', async (req, res) => {
  try {
    const { institution, course, year, semester, type, unitCode } = req.query;
    let query = { isActive: true, approvalStatus: 'approved' };

    if (institution) query.institution = institution;
    if (course) query.course = course;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (type) query.type = type;
    if (unitCode) query.unitCode = unitCode.toUpperCase();

    const resources = await Resource.find(query)
      .populate('institution', 'name shortName')
      .populate('course', 'name code')
      .populate('uploadedBy', 'firstName lastName')
      .select('-file.publicId') // Don't expose Cloudinary public IDs
      .sort({ createdAt: -1 });

    // Filter out premium content details for non-subscribers
    const filteredResources = resources.map(resource => {
      if (resource.isPremium) {
        return {
          ...resource.toObject(),
          file: resource.file ? { 
            originalName: resource.file.originalName,
            size: resource.file.size,
            mimeType: resource.file.mimeType
          } : null,
          description: resource.description ? resource.description.substring(0, 100) + '...' : null,
          isPremiumLocked: true
        };
      }
      return resource.toObject();
    });

    res.json({ resources: filteredResources });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Private (premium content requires subscription)
router.get('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('institution', 'name shortName logo')
      .populate('course', 'name code')
      .populate('uploadedBy', 'firstName lastName');

    if (!resource || !resource.isActive || resource.approvalStatus !== 'approved') {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if premium content requires subscription
    if (resource.isPremium) {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);
      
      if (!user.hasActiveSubscription()) {
        return res.status(403).json({ 
          message: 'Premium subscription required to access this resource',
          subscriptionRequired: true
        });
      }
    }

    // Increment view count
    resource.viewCount += 1;
    await resource.save();

    res.json({ resource });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources
// @desc    Upload new resource
// @access  Private (Mini Admin or Super Admin)
router.post('/', [
  auth,
  authorize('mini_admin', 'super_admin'),
  upload.single('file'),
  body('title').trim().isLength({ min: 2 }),
  body('type').isIn(['lecture_video', 'past_paper', 'cat', 'notes', 'youtube_link', 'assignment']),
  body('institution').isMongoId(),
  body('course').isMongoId(),
  body('unitCode').trim().isLength({ min: 2 }),
  body('unitName').trim().isLength({ min: 2 }),
  body('year').isInt({ min: 1, max: 6 }),
  body('semester').isInt({ min: 1, max: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resourceData = {
      ...req.body,
      unitCode: req.body.unitCode.toUpperCase(),
      uploadedBy: req.user.userId,
      year: parseInt(req.body.year),
      semester: parseInt(req.body.semester),
      isPremium: req.body.isPremium === 'true'
    };

    // Handle file upload
    if (req.file) {
      let fileUrl = req.file.path; // Cloudinary URL
      
      // Add watermark for premium video content
      if (resourceData.isPremium && req.file.mimetype.startsWith('video/')) {
        const Institution = require('../models/Institution');
        const institution = await Institution.findById(resourceData.institution);
        if (institution) {
          fileUrl = await addWatermarkToVideo(req.file.filename, institution.name);
        }
      }
      
      resourceData.file = {
        url: fileUrl,
        publicId: req.file.filename, // Cloudinary public ID
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      };
    }

    // Validate YouTube URL if type is youtube_link
    if (req.body.type === 'youtube_link' && req.body.youtubeUrl) {
      const youtubeRegex = /^https:\/\/(www\.)?(youtube\.com|youtu\.be)/;
      if (!youtubeRegex.test(req.body.youtubeUrl)) {
        return res.status(400).json({ message: 'Invalid YouTube URL' });
      }
      resourceData.youtubeUrl = req.body.youtubeUrl;
    }

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/resources/:id/approve
// @desc    Approve resource
// @access  Private (Mini Admin or Super Admin)
router.put('/:id/approve', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.approvalStatus = 'approved';
    resource.approvedBy = req.user.userId;
    resource.approvedAt = new Date();

    // Add legitimacy stamp for premium content
    if (resource.isPremium) {
      resource.legitimacyStamp.isVerified = true;
      resource.legitimacyStamp.verifiedBy = req.user.userId;
      resource.legitimacyStamp.verifiedAt = new Date();
      
      // Generate QR code for legitimacy verification
      const verificationData = {
        resourceId: resource._id,
        stampId: resource.legitimacyStamp.stampId,
        verifiedAt: resource.legitimacyStamp.verifiedAt,
        verificationUrl: `${process.env.FRONTEND_URL}/verify/${resource.legitimacyStamp.stampId}`
      };
      
      const qrCode = await generateQRCode(JSON.stringify(verificationData));
      if (qrCode) {
        resource.legitimacyStamp.qrCode = qrCode;
      }
    }

    await resource.save();

    res.json({
      message: 'Resource approved successfully',
      resource
    });
  } catch (error) {
    console.error('Approve resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/resources/:id/reject
// @desc    Reject resource
// @access  Private (Mini Admin or Super Admin)
router.put('/:id/reject', [
  auth,
  authorize('mini_admin', 'super_admin'),
  body('rejectionReason').trim().isLength({ min: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.approvalStatus = 'rejected';
    resource.rejectionReason = req.body.rejectionReason;
    resource.approvedBy = req.user.userId;
    resource.approvedAt = new Date();

    await resource.save();

    res.json({
      message: 'Resource rejected',
      resource
    });
  } catch (error) {
    console.error('Reject resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources/:id/download
// @desc    Track resource download
// @access  Private
router.post('/:id/download', [auth, checkSubscription], async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource || !resource.isActive || resource.approvalStatus !== 'approved') {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    res.json({ 
      message: 'Download tracked',
      downloadUrl: resource.file.url
    });
  } catch (error) {
    console.error('Track download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/verify/:stampId
// @desc    Verify legitimacy stamp
// @access  Public
router.get('/verify/:stampId', async (req, res) => {
  try {
    const resource = await Resource.findOne({
      'legitimacyStamp.stampId': req.params.stampId,
      'legitimacyStamp.isVerified': true
    })
      .populate('institution', 'name shortName logo')
      .populate('course', 'name code')
      .populate('legitimacyStamp.verifiedBy', 'firstName lastName');

    if (!resource) {
      return res.status(404).json({ 
        message: 'Invalid or unverified stamp ID',
        isValid: false 
      });
    }

    res.json({
      isValid: true,
      resource: {
        title: resource.title,
        type: resource.type,
        institution: resource.institution,
        course: resource.course,
        unitCode: resource.unitCode,
        unitName: resource.unitName,
        year: resource.year,
        semester: resource.semester,
        verifiedBy: resource.legitimacyStamp.verifiedBy,
        verifiedAt: resource.legitimacyStamp.verifiedAt,
        stampId: resource.legitimacyStamp.stampId
      }
    });
  } catch (error) {
    console.error('Verify stamp error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { auth, authorize } = require('../middleware/auth');

// @route   POST /api/upload/video
// @desc    Upload lecture video
// @access  Private (Mini Admin or Super Admin)
router.post('/video', [
  auth,
  authorize('mini_admin', 'super_admin'),
  uploadSingle,
  handleUploadError
], async (req, res) => {
  try {
    console.log('🎥 Video upload request received');
    console.log('📊 Request details:', {
      contentLength: req.headers['content-length'],
      contentType: req.headers['content-type'],
      hasFile: !!req.file
    });

    if (!req.file) {
      console.log('❌ No video file in request');
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    console.log('✅ Video file received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: new Date()
    };

    res.json({
      message: 'Video uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('❌ Video upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during video upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/upload/notes
// @desc    Upload PDF notes
// @access  Private (Mini Admin or Super Admin)
router.post('/notes', [
  auth,
  authorize('mini_admin', 'super_admin'),
  uploadSingle,
  handleUploadError
], async (req, res) => {
  try {
    console.log('📄 Notes upload request received');
    console.log('📊 Request details:', {
      contentLength: req.headers['content-length'],
      contentType: req.headers['content-type'],
      hasFile: !!req.file
    });

    if (!req.file) {
      console.log('❌ No PDF file in request');
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    console.log('✅ PDF file received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: new Date()
    };

    res.json({
      message: 'Notes uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('❌ Notes upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during notes upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/upload/assessment
// @desc    Upload assessment image (CAT, assignment, exam) and save to database
// @access  Private (Mini Admin or Super Admin)
router.post('/assessment', [
  auth,
  authorize('mini_admin', 'super_admin'),
  uploadSingle,
  handleUploadError
], async (req, res) => {
  try {
    const Course = require('../models/Course');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const {
      title,
      courseId,
      unitId,
      description,
      dueDate,
      totalMarks,
      duration,
      instructions,
      assessmentType // 'cat', 'assignment', or 'exam'
    } = req.body;

    // Validate required fields
    if (!title || !courseId || !unitId || !assessmentType) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, courseId, unitId, assessmentType' 
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find the unit
    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Create assessment object
    const assessmentData = {
      title,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : null,
      totalMarks: totalMarks ? parseInt(totalMarks) : null,
      duration: duration ? parseInt(duration) : null,
      instructions: instructions || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/assessments/${req.file.filename}`,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadDate: new Date(),
      status: 'pending' // Requires approval
    };

    // Determine which assessment array to add to
    let assessmentArrayName;
    if (assessmentType === 'cat') {
      assessmentArrayName = 'cats';
    } else if (assessmentType === 'assignment') {
      assessmentArrayName = 'assignments';
    } else if (assessmentType === 'exam') {
      assessmentArrayName = 'pastExams';
    } else {
      return res.status(400).json({ message: 'Invalid assessment type' });
    }

    // Initialize assessments object if it doesn't exist
    if (!unit.assessments) {
      unit.assessments = {};
    }
    if (!unit.assessments[assessmentArrayName]) {
      unit.assessments[assessmentArrayName] = [];
    }

    // Add assessment to the appropriate array
    unit.assessments[assessmentArrayName].push(assessmentData);

    // Save the course
    await course.save();

    console.log(`✅ ${assessmentType.toUpperCase()} assessment saved successfully`);
    console.log(`📊 Course: ${course.name}, Unit: ${unit.unitName}`);
    console.log(`👤 Uploaded by: ${req.user.firstName} ${req.user.lastName}`);
    console.log(`🔍 Assessment details:`, {
      assessmentId: unit.assessments[assessmentArrayName][unit.assessments[assessmentArrayName].length - 1]._id,
      title: assessmentData.title,
      status: assessmentData.status,
      filename: assessmentData.filename
    });

    res.json({
      message: `${assessmentType.toUpperCase()} assessment uploaded and saved successfully`,
      assessment: {
        id: unit.assessments[assessmentArrayName][unit.assessments[assessmentArrayName].length - 1]._id,
        title,
        courseId,
        unitId,
        status: 'pending',
        filename: req.file.filename,
        uploadDate: assessmentData.uploadDate
      }
    });
  } catch (error) {
    console.error('Assessment upload error:', error);
    res.status(500).json({ message: 'Server error during assessment upload', error: error.message });
  }
});

// @route   OPTIONS /api/upload/file/:filename
// @desc    Handle preflight requests for file serving
// @access  Public
router.options('/file/:filename', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Authorization, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.status(200).end();
});

// @route   GET /api/upload/file/:filename
// @desc    Serve uploaded files with streaming support
// @access  Private (Authenticated users)
router.get('/file/:filename', async (req, res) => {
  // Handle authentication from header or query parameter
  let token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const { filename } = req.params;
    
    // Search in all upload directories
    const uploadDirs = [
      path.join(__dirname, '../uploads/videos'),
      path.join(__dirname, '../uploads/notes'),
      path.join(__dirname, '../uploads/assessments')
    ];

    let filePath = null;
    let isVideo = false;
    for (const dir of uploadDirs) {
      const testPath = path.join(dir, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        isVideo = dir.includes('videos');
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get file stats for streaming
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filename).toLowerCase();
    
    // Set appropriate headers based on file type
    let contentType = 'application/octet-stream';
    
    if (['.mp4', '.avi', '.mov', '.webm', '.ogg'].includes(ext)) {
      contentType = `video/${ext.substring(1) === 'mov' ? 'quicktime' : ext.substring(1)}`;
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    }

    // Add CORS headers for video streaming
    const origin = req.headers.origin || 'http://localhost:3002';
    console.log('🔧 Setting CORS headers for origin:', origin);
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Authorization, Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Handle video streaming with range requests
    if (isVideo && req.headers.range) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const file = fs.createReadStream(filePath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length'
      });
      
      file.pipe(res);
    } else {
      // Regular file serving
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', fileSize);
      
      // Add security headers for videos
      if (isVideo) {
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Length');
      }
      
      res.sendFile(filePath);
    }
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ message: 'Server error serving file' });
  }
});

// @route   DELETE /api/upload/file/:filename
// @desc    Delete uploaded file
// @access  Private (Mini Admin or Super Admin)
router.delete('/file/:filename', [
  auth,
  authorize('mini_admin', 'super_admin')
], async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Search in all upload directories
    const uploadDirs = [
      path.join(__dirname, '../uploads/videos'),
      path.join(__dirname, '../uploads/notes'),
      path.join(__dirname, '../uploads/assessments')
    ];

    let filePath = null;
    for (const dir of uploadDirs) {
      const testPath = path.join(dir, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ message: 'Server error deleting file' });
  }
});

module.exports = router;

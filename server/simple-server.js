const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'EduVault API is running'
  });
});

// Simple auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo login
  if (email === 'admin@eduvault.co.ke' && password === 'admin123') {
    res.json({
      message: 'Login successful',
      token: 'demo-token-admin',
      user: {
        id: 'admin-1',
        email: 'admin@eduvault.co.ke',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin'
      }
    });
  } else if (email === 'student@example.com' && password === 'student123') {
    res.json({
      message: 'Login successful',
      token: 'demo-token-student',
      user: {
        id: 'student-1',
        email: 'student@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get institutions
app.get('/api/institutions', (req, res) => {
  res.json({
    institutions: [
      {
        _id: 'kmtc-1',
        name: 'Kenya Medical Training College',
        shortName: 'KMTC',
        type: 'medical_college',
        location: { county: 'Nairobi', town: 'Nairobi' }
      },
      {
        _id: 'uon-1',
        name: 'University of Nairobi',
        shortName: 'UON',
        type: 'university',
        location: { county: 'Nairobi', town: 'Nairobi' }
      },
      {
        _id: 'ku-1',
        name: 'Kenyatta University',
        shortName: 'KU',
        type: 'university',
        location: { county: 'Kiambu', town: 'Kahawa' }
      }
    ]
  });
});

// Get courses
app.get('/api/courses', (req, res) => {
  const { institution } = req.query;
  
  let courses = [];
  if (institution === 'kmtc-1') {
    courses = [
      {
        _id: 'course-1',
        name: 'Diploma in Clinical Medicine and Community Health',
        code: 'DCMCH',
        department: 'Clinical Medicine',
        duration: { years: 3, semesters: 6 }
      },
      {
        _id: 'course-2',
        name: 'Diploma in Nursing',
        code: 'DN',
        department: 'Nursing',
        duration: { years: 3, semesters: 6 }
      }
    ];
  }
  
  res.json({ courses });
});

// Get resources
app.get('/api/resources', (req, res) => {
  res.json({
    resources: [
      {
        _id: 'resource-1',
        title: 'Human Anatomy Lecture 1',
        type: 'lecture_video',
        unitCode: 'ANAT101',
        unitName: 'Human Anatomy I',
        isPremium: true,
        viewCount: 1234,
        downloadCount: 567
      },
      {
        _id: 'resource-2',
        title: 'Past Paper - Anatomy Final Exam',
        type: 'past_paper',
        unitCode: 'ANAT101',
        unitName: 'Human Anatomy I',
        isPremium: true,
        viewCount: 892,
        downloadCount: 445
      }
    ]
  });
});

// Get jobs
app.get('/api/jobs', (req, res) => {
  res.json({
    jobs: [
      {
        _id: 'job-1',
        title: 'Clinical Officer - Nairobi Hospital',
        company: { name: 'Nairobi Hospital', location: { county: 'Nairobi' } },
        salary: { min: 80000, max: 120000, currency: 'KSH' },
        employmentType: 'full_time',
        experienceLevel: 'junior',
        isPremium: true,
        unlockPrice: 200
      },
      {
        _id: 'job-2',
        title: 'Software Developer - Tech Startup',
        company: { name: 'InnovateTech Kenya', location: { county: 'Nairobi' } },
        salary: { min: 100000, max: 180000, currency: 'KSH' },
        employmentType: 'full_time',
        experienceLevel: 'entry',
        isPremium: true,
        unlockPrice: 200
      }
    ]
  });
});

// Chatbot endpoint
app.post('/api/chatbot/query', (req, res) => {
  const { message } = req.body;
  
  let response = "I'm here to help with your studies! ";
  
  if (message.toLowerCase().includes('quiz')) {
    response += "I can help you create quizzes. What topic would you like to be quizzed on?";
  } else if (message.toLowerCase().includes('explain')) {
    response += "I can explain concepts. What would you like me to explain?";
  } else {
    response += "Ask me about creating quizzes, explaining topics, or study tips!";
  }
  
  res.json({
    message: response,
    timestamp: new Date().toISOString()
  });
});

// Admin dashboard stats
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    stats: {
      users: { total: 150, students: 140, activeSubscriptions: 45 },
      resources: { total: 89, pending: 5, approved: 84, premium: 32 },
      jobs: { total: 12, active: 8 }
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EduVault API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Demo Admin: admin@eduvault.co.ke / admin123`);
  console.log(`👨‍🎓 Demo Student: student@example.com / student123`);
});

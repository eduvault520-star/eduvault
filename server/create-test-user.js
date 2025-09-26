// Create a test user for login testing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduvault');
    console.log('Connected to MongoDB');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'student@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists: student@example.com');
      console.log('Password: student123');
      return;
    }
    
    // Create test user (as admin to avoid institution/course requirements)
    const testUser = new User({
      email: 'student@example.com',
      password: 'student123', // Will be hashed by the pre-save hook
      firstName: 'Test',
      lastName: 'Student',
      phoneNumber: '+254700000001',
      role: 'mini_admin', // Admin role doesn't require institution/course
      isActive: true
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: student@example.com');
    console.log('Password: student123');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('✅ Test user already exists: student@example.com');
      console.log('Password: student123');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestUser();

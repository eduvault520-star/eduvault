// Create a test user for login testing
const path = require('path');
process.chdir(path.join(__dirname, 'backend'));
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple User schema for testing
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: { type: String, default: 'student' },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  yearOfStudy: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  hasSubscription: { type: Boolean, default: false },
  subscriptionExpiry: Date,
  unlockedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/eduvault', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists: test@example.com');
      console.log('Password: testpassword');
      return;
    }
    
    // Create test user
    const testUser = new User({
      email: 'test@example.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+254700000000',
      role: 'student',
      yearOfStudy: 1,
      isActive: true,
      hasSubscription: false
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: testpassword');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('✅ Test user already exists: test@example.com');
      console.log('Password: testpassword');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestUser();

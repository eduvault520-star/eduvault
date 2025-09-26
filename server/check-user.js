// Check if test user exists and verify password
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const checkUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduvault');
    console.log('Connected to MongoDB');
    
    // Find the test user
    const user = await User.findOne({ email: 'student@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log('✅ User found:');
    console.log('- Email:', user.email);
    console.log('- Name:', user.firstName, user.lastName);
    console.log('- Role:', user.role);
    console.log('- Active:', user.isActive);
    console.log('- Password hash:', user.password.substring(0, 20) + '...');
    
    // Test password comparison
    const testPassword = 'student123';
    console.log('\n🔐 Testing password comparison...');
    console.log('- Test password:', testPassword);
    
    const isMatch = await user.comparePassword(testPassword);
    console.log('- Password match:', isMatch ? '✅ YES' : '❌ NO');
    
    // Also test with bcrypt directly
    const directMatch = await bcrypt.compare(testPassword, user.password);
    console.log('- Direct bcrypt match:', directMatch ? '✅ YES' : '❌ NO');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

checkUser();

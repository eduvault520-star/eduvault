const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true
    });

    console.log('✅ Connected to MongoDB Atlas');

    // Test the exact login flow
    const email = 'superadmin@eduvault.co.ke';
    const password = 'superadmin123';

    console.log('\n🔍 Testing login flow...');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);

    // Find user
    console.log('\n1. Finding user...');
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('👑 Role:', user.role);
    console.log('🔄 Active:', user.isActive);
    console.log('🔐 Password hash (first 30 chars):', user.password.substring(0, 30));

    // Test password comparison
    console.log('\n2. Testing password comparison...');
    try {
      const isMatch = await user.comparePassword(password);
      console.log('🔐 Password match result:', isMatch);
      
      if (isMatch) {
        console.log('✅ Password comparison successful!');
      } else {
        console.log('❌ Password comparison failed');
        
        // Try other common passwords
        const testPasswords = ['miniadmin123', 'admin123', 'password123'];
        console.log('\n🧪 Testing other passwords...');
        
        for (const testPwd of testPasswords) {
          const testMatch = await user.comparePassword(testPwd);
          console.log(`🔑 "${testPwd}": ${testMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        }
      }
    } catch (compareError) {
      console.log('❌ Error during password comparison:', compareError.message);
    }

    // Test with mini admin too
    console.log('\n3. Testing mini admin...');
    const miniAdmin = await User.findOne({ email: 'admin@eduvault.co.ke' });
    
    if (miniAdmin) {
      console.log('✅ Mini admin found:', miniAdmin.email);
      const miniMatch = await miniAdmin.comparePassword('miniadmin123');
      console.log('🔐 Mini admin password match:', miniMatch);
    } else {
      console.log('❌ Mini admin not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

testLogin();

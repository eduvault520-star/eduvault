const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const checkCredentials = async () => {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true
    });

    console.log('✅ Connected to MongoDB Atlas');

    // Find all admin users
    const adminUsers = await User.find({ 
      role: { $in: ['mini_admin', 'super_admin'] } 
    });

    console.log(`\n👥 Found ${adminUsers.length} admin users:`);
    
    for (const user of adminUsers) {
      console.log(`\n📧 Email: ${user.email}`);
      console.log(`👑 Role: ${user.role}`);
      console.log(`✅ Active: ${user.isActive}`);
      console.log(`🔐 Password Hash: ${user.password.substring(0, 20)}...`);
      
      // Test common passwords
      const testPasswords = ['superadmin123', 'miniadmin123', 'admin123', 'password123'];
      
      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          if (isMatch) {
            console.log(`🔑 ✅ Password "${testPassword}" WORKS for ${user.email}`);
          }
        } catch (error) {
          console.log(`🔑 ❌ Error testing password "${testPassword}":`, error.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

checkCredentials();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const debugSuperAdmin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true
    });

    console.log('✅ Connected to MongoDB Atlas');

    // Check for existing admin users
    console.log('\n👥 Checking existing admin users...');
    const adminUsers = await User.find({ 
      role: { $in: ['mini_admin', 'super_admin'] } 
    }).select('email role firstName lastName isActive');

    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`📧 ${user.email} - Role: ${user.role} - Active: ${user.isActive}`);
    });

    // Check for super admin specifically
    const superAdmin = await User.findOne({ role: 'super_admin', isActive: true });
    
    if (!superAdmin) {
      console.log('\n❌ No active super admin found. Creating one...');
      
      const hashedPassword = await bcrypt.hash('superadmin123', 12);
      
      const newSuperAdmin = new User({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@eduvault.co.ke',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
        isVerified: true,
        phoneNumber: '+254700000000'
      });

      await newSuperAdmin.save();
      console.log('✅ Super admin created successfully');
      console.log('📧 Email: superadmin@eduvault.co.ke');
      console.log('🔑 Password: superadmin123');
    } else {
      console.log('\n✅ Super admin exists:', superAdmin.email);
    }

    // Check for mini admin
    const miniAdmin = await User.findOne({ role: 'mini_admin', isActive: true });
    
    if (!miniAdmin) {
      console.log('\n❌ No active mini admin found. Creating one...');
      
      const hashedPassword = await bcrypt.hash('miniadmin123', 12);
      
      const newMiniAdmin = new User({
        firstName: 'Mini',
        lastName: 'Admin',
        email: 'admin@eduvault.co.ke',
        password: hashedPassword,
        role: 'mini_admin',
        isActive: true,
        isVerified: true,
        phoneNumber: '+254700000001'
      });

      await newMiniAdmin.save();
      console.log('✅ Mini admin created successfully');
      console.log('📧 Email: admin@eduvault.co.ke');
      console.log('🔑 Password: miniadmin123');
    } else {
      console.log('\n✅ Mini admin exists:', miniAdmin.email);
    }

    console.log('\n🎯 Admin Login Credentials:');
    console.log('Super Admin: superadmin@eduvault.co.ke / superadmin123');
    console.log('Mini Admin: admin@eduvault.co.ke / miniadmin123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

debugSuperAdmin();

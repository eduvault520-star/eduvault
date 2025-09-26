const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createLocalAdmin = async () => {
  try {
    console.log('🔌 Connecting to Local MongoDB...');
    
    await mongoose.connect('mongodb://localhost:27017/eduvault', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });

    console.log('✅ Connected to Local MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@eduvault.co.ke' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👑 Role:', existingAdmin.role);
      return;
    }

    // Create test admin user
    const hashedPassword = await bcrypt.hash('miniadmin123', 12);
    
    const adminUser = new User({
      firstName: 'Mini',
      lastName: 'Admin',
      email: 'admin@eduvault.co.ke',
      password: hashedPassword,
      role: 'mini_admin',
      isVerified: true,
      institution: 'EduVault Platform'
    });

    await adminUser.save();
    console.log('✅ Test admin user created successfully!');
    console.log('📧 Email: admin@eduvault.co.ke');
    console.log('🔑 Password: miniadmin123');
    console.log('👑 Role: mini_admin');

    // Also create a super admin user
    const superAdminExists = await User.findOne({ email: 'superadmin@eduvault.co.ke' });
    
    if (!superAdminExists) {
      const superHashedPassword = await bcrypt.hash('superadmin123', 12);
      
      const superAdminUser = new User({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@eduvault.co.ke',
        password: superHashedPassword,
        role: 'super_admin',
        isVerified: true,
        institution: 'EduVault Platform'
      });

      await superAdminUser.save();
      console.log('✅ Test super admin user created successfully!');
      console.log('📧 Email: superadmin@eduvault.co.ke');
      console.log('🔑 Password: superadmin123');
      console.log('👑 Role: super_admin');
    }

  } catch (error) {
    console.error('❌ Error creating local admin:', error);
    console.log('💡 Make sure MongoDB is running locally on port 27017');
    console.log('💡 You can install MongoDB Community Server from: https://www.mongodb.com/try/download/community');
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

createLocalAdmin();

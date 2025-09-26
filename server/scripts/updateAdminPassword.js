const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const updateAdminPassword = async () => {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true
    });

    console.log('✅ Connected to MongoDB Atlas');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@eduvault.co.ke' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('👤 Found admin user:');
    console.log('📧 Email:', adminUser.email);
    console.log('👑 Role:', adminUser.role);
    console.log('🆔 ID:', adminUser._id);

    // Update password to miniadmin123
    const newPassword = 'miniadmin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email: admin@eduvault.co.ke');
    console.log('🔑 New Password: miniadmin123');
    console.log('👑 Role:', adminUser.role);

    // Also check if there are other admin users
    const allAdmins = await User.find({ 
      role: { $in: ['mini_admin', 'super_admin'] } 
    });

    console.log('\n📋 All admin users in database:');
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} - ${admin.role}`);
    });

  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

updateAdminPassword();

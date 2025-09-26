const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const debugAdmin = async () => {
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

    console.log('👤 Admin user details:');
    console.log('📧 Email:', adminUser.email);
    console.log('👑 Role:', adminUser.role);
    console.log('🆔 ID:', adminUser._id);
    console.log('🔐 Password Hash:', adminUser.password);
    console.log('🔐 Hash Length:', adminUser.password.length);

    // Test password comparison
    const testPasswords = ['miniadmin123', 'admin123', 'password123'];
    
    console.log('\n🧪 Testing passwords:');
    for (const testPassword of testPasswords) {
      const isMatch = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`🔑 "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }

    // Create a new hash for miniadmin123 and compare
    console.log('\n🔧 Creating fresh hash for "miniadmin123":');
    const freshHash = await bcrypt.hash('miniadmin123', 12);
    console.log('🔐 Fresh Hash:', freshHash);
    
    const freshMatch = await bcrypt.compare('miniadmin123', freshHash);
    console.log('🔑 Fresh hash test:', freshMatch ? '✅ WORKS' : '❌ BROKEN');

    // Update with fresh hash
    console.log('\n🔄 Updating admin password with fresh hash...');
    adminUser.password = freshHash;
    await adminUser.save();
    console.log('✅ Password updated with fresh hash');

    // Test again
    const finalTest = await bcrypt.compare('miniadmin123', adminUser.password);
    console.log('🔑 Final test:', finalTest ? '✅ SUCCESS' : '❌ STILL BROKEN');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

debugAdmin();

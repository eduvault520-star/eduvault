const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Institution = require('../models/Institution');
const Course = require('../models/Course');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduvault', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedUsers = async () => {
  try {
    console.log('👥 Starting user seeding...');

    // Get existing institutions and courses (assuming they exist from main seed)
    const kmtc = await Institution.findOne({ shortName: { $regex: 'KMTC', $options: 'i' } });
    const uon = await Institution.findOne({ shortName: 'UON' });
    const courses = await Course.find().limit(3);

    if (!kmtc || courses.length === 0) {
      console.log('⚠️  No institutions or courses found. Please run the main seed script first.');
      console.log('Run: npm run seed');
      process.exit(1);
    }

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create Super Admin User
    console.log('👑 Creating Super Admin...');
    const superAdmin = await User.create({
      email: 'superadmin@eduvault.co.ke',
      password: 'admin123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phoneNumber: '0700000001',
      role: 'super_admin',
      isEmailVerified: true,
      lastLogin: new Date()
    });

    // Create Mini Admin User
    console.log('🛡️  Creating Mini Admin...');
    const miniAdmin = await User.create({
      email: 'admin@eduvault.co.ke',
      password: 'miniadmin123',
      firstName: 'Michael',
      lastName: 'Ochieng',
      phoneNumber: '0700000002',
      role: 'mini_admin',
      isEmailVerified: true,
      lastLogin: new Date()
    });

    // Create Student User
    console.log('🎓 Creating Student...');
    const student = await User.create({
      email: 'student@eduvault.co.ke',
      password: 'student123',
      firstName: 'Grace',
      lastName: 'Wanjiku',
      phoneNumber: '0700000003',
      role: 'student',
      institution: kmtc._id,
      course: courses[0]._id,
      yearOfStudy: 2,
      isEmailVerified: true,
      subscription: {
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        transactionId: 'MPESA_TEST_001'
      },
      lastLogin: new Date()
    });

    // Create Additional Test Users
    console.log('👥 Creating additional test users...');
    
    // Another student without premium
    const student2 = await User.create({
      email: 'john.doe@student.co.ke',
      password: 'student123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '0700000004',
      role: 'student',
      institution: uon ? uon._id : kmtc._id,
      course: courses[1] ? courses[1]._id : courses[0]._id,
      yearOfStudy: 1,
      isEmailVerified: true,
      lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });

    // Another mini admin
    const miniAdmin2 = await User.create({
      email: 'content.admin@eduvault.co.ke',
      password: 'miniadmin123',
      firstName: 'Jane',
      lastName: 'Muthoni',
      phoneNumber: '0700000005',
      role: 'mini_admin',
      isEmailVerified: true,
      lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });

    console.log('✅ User seeding completed successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔴 SUPER ADMIN (Executive Command Center):');
    console.log('   Email: superadmin@eduvault.co.ke');
    console.log('   Password: admin123');
    console.log('   Access: http://localhost:3002');
    console.log('');
    console.log('🟢 MINI ADMIN (Content Admin Hub):');
    console.log('   Email: admin@eduvault.co.ke');
    console.log('   Password: miniadmin123');
    console.log('   Access: http://localhost:3001');
    console.log('');
    console.log('🔵 STUDENT (Student Portal):');
    console.log('   Email: student@eduvault.co.ke');
    console.log('   Password: student123');
    console.log('   Access: http://localhost:3000');
    console.log('   Note: Has premium subscription');
    console.log('');
    console.log('📝 ADDITIONAL TEST ACCOUNTS:');
    console.log('   • john.doe@student.co.ke / student123 (Free student)');
    console.log('   • content.admin@eduvault.co.ke / miniadmin123 (Mini admin)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log(`\n📊 SUMMARY:`);
    console.log(`   • Super Admins: 1`);
    console.log(`   • Mini Admins: 2`);
    console.log(`   • Students: 2`);
    console.log(`   • Total Users: 5`);

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the seeding
seedUsers();

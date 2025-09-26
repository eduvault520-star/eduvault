const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

const checkCourses = async () => {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true
    });

    console.log('✅ Connected to MongoDB Atlas');

    // Check if courses exist
    console.log('\n📚 Checking courses...');
    const courseCount = await Course.countDocuments();
    console.log(`📊 Total courses: ${courseCount}`);

    if (courseCount > 0) {
      console.log('\n🔍 Fetching first few courses...');
      const courses = await Course.find({}).limit(3);
      
      courses.forEach((course, index) => {
        console.log(`\n📖 Course ${index + 1}:`);
        console.log(`   Name: ${course.name}`);
        console.log(`   Code: ${course.code}`);
        console.log(`   Units: ${course.units?.length || 0}`);
        
        if (course.units && course.units.length > 0) {
          console.log(`   First unit: ${course.units[0].unitName}`);
          console.log(`   Topics in first unit: ${course.units[0].topics?.length || 0}`);
        }
      });

      // Test the populate operation that's failing
      console.log('\n🧪 Testing populate operation...');
      try {
        const populatedCourses = await Course.find({})
          .populate('uploadedBy', 'name email')
          .populate('reviewedBy', 'name email')
          .limit(1);
        
        console.log('✅ Populate operation successful');
        console.log('📊 Populated courses:', populatedCourses.length);
      } catch (populateError) {
        console.log('❌ Populate operation failed:', populateError.message);
      }

    } else {
      console.log('❌ No courses found in database');
      console.log('💡 You may need to seed the database with courses');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

checkCourses();

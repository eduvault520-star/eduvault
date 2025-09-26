const mongoose = require('mongoose');
const Course = require('../models/Course');
const Institution = require('../models/Institution');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for course-institution linking fix');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const fixCourseInstitutionLinks = async () => {
  try {
    await connectDB();
    
    console.log('\n🔧 FIXING COURSE-INSTITUTION LINKS:');
    console.log('=' .repeat(50));
    
    // Find Egerton University
    const egerton = await Institution.findOne({ name: /egerton/i });
    if (!egerton) {
      console.log('❌ Egerton University not found');
      return;
    }
    
    console.log(`✅ Found Egerton University: ${egerton.name}`);
    console.log(`   ID: ${egerton._id}`);
    
    // Check courses that might belong to Egerton but aren't linked
    const allCourses = await Course.find();
    console.log(`📖 Total courses in database: ${allCourses.length}`);
    
    // Look for courses that mention Egerton or have no institution
    const egertonKeywords = ['egerton', 'agriculture', 'agricultural', 'veterinary', 'engineering'];
    const potentialEgertonCourses = allCourses.filter(course => {
      // Check if course has no institution or wrong institution
      const hasNoInstitution = !course.institution;
      const nameContainsEgerton = egertonKeywords.some(keyword => 
        course.name.toLowerCase().includes(keyword) ||
        (course.description && course.description.toLowerCase().includes(keyword))
      );
      
      return hasNoInstitution || nameContainsEgerton;
    });
    
    console.log(`🔍 Found ${potentialEgertonCourses.length} potential Egerton courses:`);
    
    let updatedCount = 0;
    
    for (const course of potentialEgertonCourses) {
      console.log(`\n📚 Course: ${course.name} (${course.code})`);
      console.log(`   Current institution: ${course.institution || 'NONE'}`);
      console.log(`   Description: ${course.description?.substring(0, 100) || 'No description'}...`);
      
      // Update course to link to Egerton
      const result = await Course.updateOne(
        { _id: course._id },
        { institution: egerton._id }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`   ✅ Updated to link with Egerton University`);
        updatedCount++;
      } else {
        console.log(`   ⚠️ No update needed or failed`);
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Updated ${updatedCount} courses to link with Egerton University`);
    
    // Verify the fix
    const egertonCoursesAfter = await Course.find({ institution: egerton._id });
    console.log(`   Egerton now has ${egertonCoursesAfter.length} linked courses`);
    
    // Show some examples
    console.log(`\n📋 Sample Egerton courses:`);
    egertonCoursesAfter.slice(0, 5).forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.name} (${course.code})`);
    });
    
    console.log('\n✅ Course-institution linking fix completed');
    
  } catch (error) {
    console.error('❌ Error fixing course-institution links:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixCourseInstitutionLinks();

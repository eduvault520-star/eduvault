const mongoose = require('mongoose');
const Course = require('../models/Course');
const Institution = require('../models/Institution');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for advanced Egerton course fix');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const fixEgertonCoursesAdvanced = async () => {
  try {
    await connectDB();
    
    console.log('\n🔧 ADVANCED EGERTON COURSE FIX:');
    console.log('=' .repeat(50));
    
    // Find Egerton University
    const egerton = await Institution.findOne({ name: /egerton/i });
    if (!egerton) {
      console.log('❌ Egerton University not found');
      return;
    }
    
    console.log(`✅ Found Egerton University: ${egerton.name}`);
    console.log(`   ID: ${egerton._id}`);
    
    // Get all courses
    const allCourses = await Course.find();
    console.log(`📖 Total courses in database: ${allCourses.length}`);
    
    // Find courses already linked to Egerton
    const existingEgertonCourses = await Course.find({ institution: egerton._id });
    console.log(`📚 Courses already linked to Egerton: ${existingEgertonCourses.length}`);
    
    // Define Egerton-specific courses based on their academic programs
    const egertonPrograms = [
      // Agriculture and related
      { keywords: ['agriculture', 'agricultural', 'agribusiness', 'agronomy', 'horticulture'], department: 'Agriculture' },
      { keywords: ['veterinary', 'animal', 'livestock'], department: 'Veterinary Medicine' },
      { keywords: ['food', 'nutrition', 'dietetics'], department: 'Food Science' },
      { keywords: ['forestry', 'natural resources', 'environmental'], department: 'Natural Resources' },
      // Engineering (Egerton has engineering programs)
      { keywords: ['engineering', 'civil', 'mechanical', 'electrical', 'agricultural engineering'], department: 'Engineering' },
      // Education
      { keywords: ['education', 'teaching', 'curriculum'], department: 'Education' },
      // Business
      { keywords: ['business', 'commerce', 'economics', 'management'], department: 'Business' },
      // Sciences
      { keywords: ['computer science', 'information technology', 'mathematics', 'statistics'], department: 'Sciences' }
    ];
    
    let processedCount = 0;
    let duplicatesHandled = 0;
    let newlyLinked = 0;
    
    // Process each course
    for (const course of allCourses) {
      // Skip if already linked to Egerton
      if (course.institution && course.institution.toString() === egerton._id.toString()) {
        continue;
      }
      
      // Check if this course should belong to Egerton
      let shouldBelongToEgerton = false;
      let matchedDepartment = '';
      
      for (const program of egertonPrograms) {
        const courseText = `${course.name} ${course.description || ''}`.toLowerCase();
        if (program.keywords.some(keyword => courseText.includes(keyword))) {
          shouldBelongToEgerton = true;
          matchedDepartment = program.department;
          break;
        }
      }
      
      if (shouldBelongToEgerton) {
        console.log(`\n📚 Processing: ${course.name} (${course.code})`);
        console.log(`   Matched department: ${matchedDepartment}`);
        console.log(`   Current institution: ${course.institution || 'NONE'}`);
        
        // Check if there's already a course with this code at Egerton
        const existingCourse = await Course.findOne({ 
          institution: egerton._id, 
          code: course.code 
        });
        
        if (existingCourse) {
          console.log(`   ⚠️ Duplicate found! Course ${course.code} already exists at Egerton`);
          console.log(`   Existing: ${existingCourse.name}`);
          console.log(`   Current:  ${course.name}`);
          
          // Keep the one with more content (units, description, etc.)
          const existingScore = (existingCourse.units?.length || 0) + 
                               (existingCourse.description?.length || 0) + 
                               (existingCourse.entryRequirements?.length || 0);
          const currentScore = (course.units?.length || 0) + 
                              (course.description?.length || 0) + 
                              (course.entryRequirements?.length || 0);
          
          if (currentScore > existingScore) {
            console.log(`   🔄 Current course has more content, replacing existing`);
            // Delete the existing one and update current
            await Course.deleteOne({ _id: existingCourse._id });
            await Course.updateOne(
              { _id: course._id },
              { 
                institution: egerton._id,
                department: matchedDepartment
              }
            );
            newlyLinked++;
          } else {
            console.log(`   🗑️ Existing course has more content, removing duplicate`);
            // Delete the current duplicate
            await Course.deleteOne({ _id: course._id });
          }
          duplicatesHandled++;
        } else {
          // No duplicate, safe to link
          await Course.updateOne(
            { _id: course._id },
            { 
              institution: egerton._id,
              department: matchedDepartment
            }
          );
          console.log(`   ✅ Successfully linked to Egerton University`);
          newlyLinked++;
        }
        
        processedCount++;
      }
    }
    
    // Final verification
    const finalEgertonCourses = await Course.find({ institution: egerton._id });
    
    console.log(`\n📊 FINAL SUMMARY:`);
    console.log(`   Courses processed: ${processedCount}`);
    console.log(`   Duplicates handled: ${duplicatesHandled}`);
    console.log(`   Newly linked courses: ${newlyLinked}`);
    console.log(`   Total Egerton courses now: ${finalEgertonCourses.length}`);
    
    console.log(`\n📋 Sample Egerton courses by department:`);
    const coursesByDept = {};
    finalEgertonCourses.forEach(course => {
      const dept = course.department || 'Unassigned';
      if (!coursesByDept[dept]) coursesByDept[dept] = [];
      coursesByDept[dept].push(course);
    });
    
    Object.keys(coursesByDept).forEach(dept => {
      console.log(`\n   ${dept} (${coursesByDept[dept].length} courses):`);
      coursesByDept[dept].slice(0, 3).forEach(course => {
        console.log(`     - ${course.name} (${course.code})`);
      });
      if (coursesByDept[dept].length > 3) {
        console.log(`     ... and ${coursesByDept[dept].length - 3} more`);
      }
    });
    
    console.log('\n✅ Advanced Egerton course fix completed');
    
  } catch (error) {
    console.error('❌ Error in advanced Egerton course fix:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixEgertonCoursesAdvanced();

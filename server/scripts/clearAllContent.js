const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

const clearAllContent = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // First, let's see what content we have
    console.log('\n📋 Current content in database:');
    const allCourses = await Course.find({});
    
    let totalUnits = 0;
    let totalTopics = 0;
    let totalContent = 0;
    let totalAssessments = 0;

    console.log(`📚 Found ${allCourses.length} courses:`);
    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} (${course.code})`);
      console.log(`   Institution: ${course.institution}`);
      console.log(`   Units: ${course.units?.length || 0}`);
      
      if (course.units) {
        totalUnits += course.units.length;
        course.units.forEach(unit => {
          if (unit.topics) {
            totalTopics += unit.topics.length;
            unit.topics.forEach(topic => {
              if (topic.content) {
                if (topic.content.lectureVideo) totalContent++;
                if (topic.content.notes) totalContent++;
              }
            });
          }
          if (unit.assessments) {
            if (unit.assessments.cats) totalAssessments += unit.assessments.cats.length;
            if (unit.assessments.assignments) totalAssessments += unit.assessments.assignments.length;
            if (unit.assessments.pastExams) totalAssessments += unit.assessments.pastExams.length;
          }
        });
      }
      console.log('---');
    });

    console.log(`\n📊 Content Summary:`);
    console.log(`📚 Courses: ${allCourses.length}`);
    console.log(`📖 Units: ${totalUnits}`);
    console.log(`📝 Topics: ${totalTopics}`);
    console.log(`🎥 Content Items: ${totalContent}`);
    console.log(`📋 Assessments: ${totalAssessments}`);

    if (allCourses.length === 0) {
      console.log('✅ No content found. Database is already clean.');
      process.exit(0);
    }

    // Confirm deletion
    console.log('\n⚠️  This will delete ALL educational content:');
    console.log('- All courses and their details');
    console.log('- All units within courses');
    console.log('- All topics and their content (videos, notes)');
    console.log('- All assessments (CATs, assignments, past exams)');
    console.log('- All uploaded files and media');
    console.log('\n🚨 This action CANNOT be undone!');
    console.log('🤔 Do you want to proceed with deletion?');
    console.log('Type "YES" to confirm or anything else to cancel:');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Confirm deletion: ', async (answer) => {
      if (answer.trim().toUpperCase() === 'YES') {
        try {
          console.log('\n🗑️  Deleting all content...');
          
          const deleteResult = await Course.deleteMany({});

          console.log(`✅ Successfully deleted ${deleteResult.deletedCount} courses`);
          console.log(`✅ All units, topics, content, and assessments removed`);

          // Verify final state
          const remainingCourses = await Course.find({});
          console.log(`\n📊 Final state: ${remainingCourses.length} courses remaining`);
          
          if (remainingCourses.length === 0) {
            console.log('🎉 Database is now clean and ready for fresh content!');
            console.log('📝 Mini admins can now start posting new courses and content.');
          }

        } catch (error) {
          console.error('❌ Error during deletion:', error);
        }
      } else {
        console.log('❌ Deletion cancelled by user');
      }
      
      rl.close();
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Script error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted by user');
  await mongoose.disconnect();
  process.exit(0);
});

console.log('🎯 EduVault Content Cleanup Script');
console.log('📝 This script will remove ALL educational content from the database');
console.log('⚠️  This includes courses, units, topics, videos, notes, and assessments');
console.log('🔄 After cleanup, mini admins can start posting fresh content');
console.log('');

clearAllContent();

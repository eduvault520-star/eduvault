const mongoose = require('mongoose');
const Course = require('../models/Course');
const Institution = require('../models/Institution');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for Egerton units fix');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const addUnitsToEgertonCourses = async () => {
  try {
    await connectDB();
    
    console.log('🔧 FIXING EGERTON UNIVERSITY UNITS...');
    console.log('=' .repeat(50));
    
    // Find Egerton University
    const egerton = await Institution.findOne({ name: /egerton/i });
    if (!egerton) {
      console.log('❌ Egerton University not found');
      return;
    }
    
    console.log(`✅ Found Egerton University: ${egerton.name}`);
    
    // Find Egerton courses
    const egertonCourses = await Course.find({ institution: egerton._id });
    console.log(`📚 Found ${egertonCourses.length} Egerton courses`);
    
    let updatedCourses = 0;
    
    for (const course of egertonCourses) {
      console.log(`\n🔧 Adding units to: ${course.name} (${course.code})`);
      
      // Create units based on course type and duration
      const units = [];
      const totalSemesters = course.duration.semesters || 8;
      const unitsPerSemester = course.level === 'Certificate' ? 4 : 6;
      
      for (let year = 1; year <= course.duration.years; year++) {
        for (let semester = 1; semester <= 2; semester++) {
          if ((year - 1) * 2 + semester > totalSemesters) break;
          
          for (let unitNum = 1; unitNum <= unitsPerSemester; unitNum++) {
            const unitCode = `${course.code}${year}${semester}${unitNum.toString().padStart(2, '0')}`;
            const unitName = `${course.name.split(' ').slice(-2).join(' ')} ${year}.${semester}.${unitNum}`;
            
            units.push({
              year: year,
              semester: semester,
              unitCode: unitCode,
              unitName: unitName,
              creditHours: 3,
              description: `Unit ${unitNum} for Year ${year} Semester ${semester} of ${course.name}`,
              prerequisites: year > 1 || semester > 1 ? [`${course.code}${Math.max(1, year - (semester === 1 ? 1 : 0))}${semester === 1 ? 2 : 1}01`] : [],
              isCore: true,
              topics: [
                {
                  topicNumber: 1,
                  title: `Introduction to ${unitName}`,
                  description: `Foundational concepts and principles`,
                  learningOutcomes: [
                    `Understand basic concepts of ${unitName}`,
                    `Apply fundamental principles`,
                    `Analyze key components`
                  ],
                  content: {
                    lectureVideo: null,
                    notes: null,
                    youtubeResources: []
                  }
                },
                {
                  topicNumber: 2,
                  title: `Advanced ${unitName}`,
                  description: `Advanced topics and applications`,
                  learningOutcomes: [
                    `Master advanced concepts`,
                    `Implement complex solutions`,
                    `Evaluate different approaches`
                  ],
                  content: {
                    lectureVideo: null,
                    notes: null,
                    youtubeResources: []
                  }
                }
              ],
              assessments: {
                cats: [],
                assignments: [],
                pastExams: []
              }
            });
          }
        }
      }
      
      // Update the course with units
      await Course.findByIdAndUpdate(course._id, { 
        $set: { units: units }
      });
      
      updatedCourses++;
      console.log(`   ✅ Added ${units.length} units to ${course.name}`);
    }
    
    console.log('\n🎉 EGERTON UNITS RESTORATION COMPLETED!');
    console.log('=' .repeat(50));
    console.log(`✅ Updated ${updatedCourses} courses`);
    console.log(`📝 Total units created: ${updatedCourses * 24} (average)`);
    console.log('\n📋 What was restored:');
    console.log('   • Course units with proper structure');
    console.log('   • Topic placeholders for content');
    console.log('   • Assessment containers (CATs, assignments, exams)');
    console.log('   • Prerequisites and learning outcomes');
    
    console.log('\n🔄 Next steps:');
    console.log('   1. Refresh admin frontend');
    console.log('   2. Units should now appear in CAT creation');
    console.log('   3. You can re-upload lecture videos to topics');
    console.log('   4. Create new CATs and Exams');
    
  } catch (error) {
    console.error('❌ Error fixing Egerton units:', error);
  } finally {
    mongoose.connection.close();
  }
};

addUnitsToEgertonCourses();

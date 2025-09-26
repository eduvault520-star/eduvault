const mongoose = require('mongoose');
const Course = require('../models/Course');
const Institution = require('../models/Institution');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for database check');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const checkDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 DATABASE CONTENT CHECK:');
    console.log('=' .repeat(50));
    
    // Check Institutions
    const institutions = await Institution.find();
    console.log(`📚 Institutions: ${institutions.length}`);
    
    // Find Egerton University specifically
    const egerton = await Institution.findOne({ name: /egerton/i });
    if (egerton) {
      console.log(`✅ Egerton University found: ${egerton.name}`);
      console.log(`   ID: ${egerton._id}`);
    } else {
      console.log('❌ Egerton University not found');
    }
    
    // Check Courses
    const courses = await Course.find();
    console.log(`📖 Total Courses: ${courses.length}`);
    
    // Check courses with units
    const coursesWithUnits = await Course.find({ 'units.0': { $exists: true } });
    console.log(`📝 Courses with Units: ${coursesWithUnits.length}`);
    
    // Check Egerton courses specifically
    if (egerton) {
      const egertonCourses = await Course.find({ institution: egerton._id });
      console.log(`🎓 Egerton Courses: ${egertonCourses.length}`);
      
      egertonCourses.forEach(course => {
        console.log(`   - ${course.name} (${course.code}) - ${course.units?.length || 0} units`);
        if (course.units && course.units.length > 0) {
          course.units.forEach(unit => {
            console.log(`     * ${unit.unitCode}: ${unit.unitName}`);
            if (unit.topics && unit.topics.length > 0) {
              unit.topics.forEach(topic => {
                if (topic.content?.lectureVideo?.filename) {
                  console.log(`       📹 Video: ${topic.content.lectureVideo.filename}`);
                }
              });
            }
          });
        }
      });
    }
    
    // Check Assessments
    const assessments = await Assessment.find();
    console.log(`📋 Assessments: ${assessments.length}`);
    
    // Check Users
    const users = await User.find();
    console.log(`👥 Users: ${users.length}`);
    
    console.log('\n🔍 RECENT DATA:');
    console.log('=' .repeat(30));
    
    // Check recent courses (last 24 hours)
    const recentCourses = await Course.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });
    console.log(`📅 Recent Courses (24h): ${recentCourses.length}`);
    
    // Check recent assessments
    const recentAssessments = await Assessment.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });
    console.log(`📅 Recent Assessments (24h): ${recentAssessments.length}`);
    
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkDatabase();

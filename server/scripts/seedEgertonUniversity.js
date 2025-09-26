const mongoose = require('mongoose');
require('dotenv').config();

const Institution = require('../models/Institution');
const Course = require('../models/Course');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for Egerton University seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Egerton University Institution Data
const egertonUniversity = {
  name: 'Egerton University',
  shortName: 'EU',
  type: 'public_university',
  location: { 
    county: 'Nakuru', 
    town: 'Njoro',
    address: 'P.O. Box 536-20115, Egerton'
  },
  establishedYear: 1987,
  isActive: true,
  colors: { 
    primary: '#228B22', 
    secondary: '#FFD700' 
  },
  description: 'Premier public university with strong focus on agriculture, offering over 215 academic programs across 10 faculties.',
  website: 'www.egerton.ac.ke',
  contact: {
    email: 'info@egerton.ac.ke',
    phone: '+254-51-2217711',
    website: 'www.egerton.ac.ke'
  },
  studentCapacity: 40000,
  accreditation: {
    body: 'Commission for University Education (CUE)',
    status: 'accredited'
  }
};

// Comprehensive Egerton University Courses
const egertonCourses = [
  // PhD Programs (Doctoral Level)
  {
    name: 'Doctor of Philosophy in Agribusiness Management',
    code: 'PhD-ABM',
    department: 'Faculty of Agriculture',
    level: 'PhD',
    duration: { years: 4, semesters: 8 },
    description: 'Advanced research program in agribusiness management, marketing, and agricultural value chains.',
    entryRequirements: 'Master\'s degree with minimum B grade in relevant field',
    careerProspects: ['Agricultural Researcher', 'University Lecturer', 'Policy Analyst', 'Agribusiness Consultant'],
    fees: { local: 180000, international: 350000 }
  },
  {
    name: 'Doctor of Philosophy in Agricultural Economics',
    code: 'PhD-AGECON',
    department: 'Faculty of Agriculture',
    level: 'PhD',
    duration: { years: 4, semesters: 8 },
    description: 'Research-focused program in agricultural economics, policy analysis, and rural development.',
    entryRequirements: 'Master\'s degree with minimum B grade in Economics or related field',
    careerProspects: ['Agricultural Economist', 'Policy Researcher', 'Development Consultant', 'University Professor'],
    fees: { local: 180000, international: 350000 }
  },
  {
    name: 'Doctor of Philosophy in Plant Breeding',
    code: 'PhD-PB',
    department: 'Faculty of Agriculture',
    level: 'PhD',
    duration: { years: 4, semesters: 8 },
    description: 'Advanced research in crop improvement, genetics, and biotechnology applications.',
    entryRequirements: 'Master\'s degree with minimum B grade in Plant Sciences or related field',
    careerProspects: ['Plant Breeder', 'Research Scientist', 'Biotechnology Specialist', 'Seed Company Director'],
    fees: { local: 180000, international: 350000 }
  },
  {
    name: 'Doctor of Philosophy in Environmental Science',
    code: 'PhD-ENVSCI',
    department: 'Faculty of Environment and Resources Development',
    level: 'PhD',
    duration: { years: 4, semesters: 8 },
    description: 'Research program focusing on environmental conservation, climate change, and sustainability.',
    entryRequirements: 'Master\'s degree with minimum B grade in Environmental Science or related field',
    careerProspects: ['Environmental Scientist', 'Climate Change Researcher', 'Conservation Specialist', 'Environmental Consultant'],
    fees: { local: 180000, international: 350000 }
  },

  // Master's Programs
  {
    name: 'Master of Science in Agribusiness Management',
    code: 'MSc-ABM',
    department: 'Faculty of Agriculture',
    level: 'Masters',
    duration: { years: 2, semesters: 4 },
    description: 'Advanced program combining business principles with agricultural production and marketing.',
    entryRequirements: 'Upper second-class Bachelor\'s honors in Agriculture, Business, or related field',
    careerProspects: ['Agribusiness Manager', 'Agricultural Marketing Specialist', 'Farm Manager', 'Agricultural Consultant'],
    fees: { local: 120000, international: 250000 }
  },
  {
    name: 'Master of Science in Agricultural Economics',
    code: 'MSc-AGECON',
    department: 'Faculty of Agriculture',
    level: 'Masters',
    duration: { years: 2, semesters: 4 },
    description: 'Program focusing on economic analysis of agricultural systems and policy development.',
    entryRequirements: 'Upper second-class Bachelor\'s honors in Economics, Agriculture, or related field',
    careerProspects: ['Agricultural Economist', 'Policy Analyst', 'Development Officer', 'Research Analyst'],
    fees: { local: 120000, international: 250000 }
  },
  {
    name: 'Master of Science in Food Science',
    code: 'MSc-FS',
    department: 'Faculty of Agriculture',
    level: 'Masters',
    duration: { years: 2, semesters: 4 },
    description: 'Advanced study of food processing, preservation, safety, and nutrition.',
    entryRequirements: 'Upper second-class Bachelor\'s honors in Food Science, Chemistry, or related field',
    careerProspects: ['Food Technologist', 'Quality Assurance Manager', 'Food Safety Inspector', 'Product Development Specialist'],
    fees: { local: 120000, international: 250000 }
  },
  {
    name: 'Master of Science in Environmental Science',
    code: 'MSc-ENVSCI',
    department: 'Faculty of Environment and Resources Development',
    level: 'Masters',
    duration: { years: 2, semesters: 4 },
    description: 'Comprehensive program in environmental assessment, management, and conservation.',
    entryRequirements: 'Upper second-class Bachelor\'s honors in Environmental Science or related field',
    careerProspects: ['Environmental Consultant', 'Conservation Officer', 'Environmental Impact Assessor', 'Sustainability Manager'],
    fees: { local: 120000, international: 250000 }
  },
  {
    name: 'Master of Education in Curriculum and Instruction',
    code: 'MEd-CI',
    department: 'Faculty of Education and Community Studies',
    level: 'Masters',
    duration: { years: 2, semesters: 4 },
    description: 'Advanced program for educators focusing on curriculum development and instructional methods.',
    entryRequirements: 'Upper second-class Bachelor\'s honors in Education or teaching qualification',
    careerProspects: ['Curriculum Developer', 'Education Officer', 'School Principal', 'Education Consultant'],
    fees: { local: 100000, international: 200000 }
  },

  // Bachelor's Programs
  {
    name: 'Bachelor of Science in Agriculture',
    code: 'BSc-AGR',
    department: 'Faculty of Agriculture',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Comprehensive program covering crop production, animal husbandry, and agricultural management.',
    entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
    careerProspects: ['Agricultural Officer', 'Farm Manager', 'Agricultural Consultant', 'Extension Officer'],
    fees: { local: 80000, international: 180000 }
  },
  {
    name: 'Bachelor of Science in Agribusiness Management',
    code: 'BSc-ABM',
    department: 'Faculty of Agriculture',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Business-focused agricultural program combining production with marketing and management.',
    entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, English, and two other subjects',
    careerProspects: ['Agribusiness Manager', 'Agricultural Marketing Officer', 'Farm Business Advisor', 'Agricultural Banker'],
    fees: { local: 80000, international: 180000 }
  },
  {
    name: 'Bachelor of Science in Food Science and Technology',
    code: 'BSc-FST',
    department: 'Faculty of Agriculture',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Program focusing on food processing, preservation, quality control, and nutrition.',
    entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
    careerProspects: ['Food Technologist', 'Quality Control Manager', 'Food Safety Officer', 'Product Development Manager'],
    fees: { local: 85000, international: 190000 }
  },
  {
    name: 'Bachelor of Science in Horticulture',
    code: 'BSc-HORT',
    department: 'Faculty of Agriculture',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Specialized program in fruit, vegetable, and ornamental plant production.',
    entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
    careerProspects: ['Horticulturist', 'Greenhouse Manager', 'Landscape Designer', 'Crop Production Specialist'],
    fees: { local: 80000, international: 180000 }
  },
  {
    name: 'Bachelor of Medicine and Bachelor of Surgery',
    code: 'MBChB',
    department: 'Faculty of Health Sciences',
    level: 'Undergraduate',
    duration: { years: 6, semesters: 12 },
    description: 'Comprehensive medical degree program preparing students for medical practice.',
    entryRequirements: 'KCSE mean grade A- with A- in Biology, Chemistry, Physics, and Mathematics or English',
    careerProspects: ['Medical Doctor', 'Surgeon', 'Medical Researcher', 'Public Health Officer'],
    fees: { local: 150000, international: 400000 }
  },
  {
    name: 'Bachelor of Science in Nursing',
    code: 'BSc-NURS',
    department: 'Faculty of Health Sciences',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Professional nursing program covering patient care, health promotion, and healthcare management.',
    entryRequirements: 'KCSE mean grade B- with B- in Biology, Chemistry, Physics, and Mathematics or English',
    careerProspects: ['Registered Nurse', 'Nurse Manager', 'Public Health Nurse', 'Clinical Nurse Specialist'],
    fees: { local: 100000, international: 220000 }
  },
  {
    name: 'Bachelor of Science in Computer Science',
    code: 'BSc-CS',
    department: 'Faculty of Science',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Comprehensive computer science program covering programming, algorithms, and software development.',
    entryRequirements: 'KCSE mean grade B- with B- in Mathematics, Physics, and English',
    careerProspects: ['Software Developer', 'Systems Analyst', 'IT Consultant', 'Database Administrator'],
    fees: { local: 90000, international: 200000 }
  },
  {
    name: 'Bachelor of Commerce',
    code: 'BCom',
    department: 'Faculty of Commerce',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Business degree covering accounting, finance, marketing, and management principles.',
    entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, English, and two other subjects',
    careerProspects: ['Accountant', 'Financial Analyst', 'Marketing Manager', 'Business Consultant'],
    fees: { local: 75000, international: 170000 }
  },
  {
    name: 'Bachelor of Education (Science)',
    code: 'BEd-SCI',
    department: 'Faculty of Education and Community Studies',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Teacher training program for secondary school science subjects.',
    entryRequirements: 'KCSE mean grade C+ with C+ in two teaching subjects (Biology, Chemistry, Physics, Mathematics)',
    careerProspects: ['Secondary School Teacher', 'Education Officer', 'Curriculum Developer', 'School Administrator'],
    fees: { local: 70000, international: 160000 }
  },
  {
    name: 'Bachelor of Laws',
    code: 'LLB',
    department: 'Faculty of Law',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Legal studies program preparing students for legal practice and public service.',
    entryRequirements: 'KCSE mean grade B with B in English and any other two subjects',
    careerProspects: ['Advocate', 'Magistrate', 'Legal Counsel', 'Legal Researcher'],
    fees: { local: 85000, international: 190000 }
  },
  {
    name: 'Bachelor of Science in Environmental Science',
    code: 'BSc-ENVSCI',
    department: 'Faculty of Environment and Resources Development',
    level: 'Undergraduate',
    duration: { years: 4, semesters: 8 },
    description: 'Interdisciplinary program focusing on environmental conservation and sustainability.',
    entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Geography, and Mathematics',
    careerProspects: ['Environmental Officer', 'Conservation Specialist', 'Environmental Consultant', 'Climate Change Analyst'],
    fees: { local: 80000, international: 180000 }
  },

  // Diploma Programs
  {
    name: 'Diploma in Agricultural Education and Extension',
    code: 'DIP-AEE',
    department: 'Faculty of Agriculture',
    level: 'Diploma',
    duration: { years: 3, semesters: 6 },
    description: 'Program training agricultural extension officers and educators.',
    entryRequirements: 'KCSE mean grade C- with C- in Agriculture, Biology, and English',
    careerProspects: ['Agricultural Extension Officer', 'Agricultural Educator', 'Farm Advisor', 'Rural Development Officer'],
    fees: { local: 50000, international: 120000 }
  },
  {
    name: 'Diploma in Animal Health and Production',
    code: 'DIP-AHP',
    department: 'Faculty of Agriculture',
    level: 'Diploma',
    duration: { years: 3, semesters: 6 },
    description: 'Program focusing on livestock health, nutrition, and production management.',
    entryRequirements: 'KCSE mean grade C- with C- in Biology, Chemistry, and English',
    careerProspects: ['Animal Health Assistant', 'Livestock Production Officer', 'Veterinary Assistant', 'Farm Manager'],
    fees: { local: 55000, international: 125000 }
  },
  {
    name: 'Diploma in Horticulture',
    code: 'DIP-HORT',
    department: 'Faculty of Agriculture',
    level: 'Diploma',
    duration: { years: 3, semesters: 6 },
    description: 'Practical program in fruit, vegetable, and ornamental plant production.',
    entryRequirements: 'KCSE mean grade C- with C- in Biology, Agriculture, and English',
    careerProspects: ['Horticultural Technician', 'Greenhouse Supervisor', 'Garden Manager', 'Crop Production Assistant'],
    fees: { local: 50000, international: 120000 }
  },
  {
    name: 'Diploma in Business Management',
    code: 'DIP-BM',
    department: 'Faculty of Commerce',
    level: 'Diploma',
    duration: { years: 3, semesters: 6 },
    description: 'Business management program covering entrepreneurship and organizational management.',
    entryRequirements: 'KCSE mean grade C- with C- in Mathematics, English, and Business Studies',
    careerProspects: ['Business Administrator', 'Operations Manager', 'Sales Manager', 'Entrepreneur'],
    fees: { local: 45000, international: 110000 }
  },
  {
    name: 'Diploma in Computer Science',
    code: 'DIP-CS',
    department: 'Faculty of Science',
    level: 'Diploma',
    duration: { years: 3, semesters: 6 },
    description: 'Practical computer science program covering programming and system administration.',
    entryRequirements: 'KCSE mean grade C- with C- in Mathematics, English, and Physics',
    careerProspects: ['Computer Technician', 'System Administrator', 'Web Developer', 'IT Support Specialist'],
    fees: { local: 55000, international: 125000 }
  }
];

const seedEgertonUniversity = async () => {
  try {
    console.log('🌱 Starting Egerton University seeding...');
    
    // Clear existing Egerton data
    await Institution.deleteOne({ shortName: 'EU' });
    console.log('🗑️  Cleared existing Egerton University data');

    // Create Egerton University
    const institution = await Institution.create(egertonUniversity);
    console.log('✅ Created Egerton University institution');

    // Clear existing Egerton courses
    await Course.deleteMany({ institution: institution._id });
    console.log('🗑️  Cleared existing Egerton courses');

    // Add institution reference to courses
    const coursesWithInstitution = egertonCourses.map(course => ({
      ...course,
      institution: institution._id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insert courses
    const courses = await Course.insertMany(coursesWithInstitution);
    console.log(`✅ Successfully seeded ${courses.length} Egerton University courses`);

    // Display summary by level
    const summary = {};
    courses.forEach(course => {
      summary[course.level] = (summary[course.level] || 0) + 1;
    });

    console.log('\n📊 Egerton University Course Summary:');
    Object.entries(summary).forEach(([level, count]) => {
      console.log(`   ${level.toUpperCase()}: ${count} programs`);
    });

    console.log('\n🎯 Sample Egerton courses created:');
    courses.slice(0, 8).forEach(course => {
      console.log(`   • ${course.name} (${course.code}) - ${course.duration.years} years`);
    });

    console.log('\n🏛️ Egerton University Details:');
    console.log(`   📍 Location: ${institution.location.town}, ${institution.location.county}`);
    console.log(`   🎓 Total Programs: ${courses.length}`);
    console.log(`   👥 Student Capacity: ${institution.studentCapacity.toLocaleString()}`);
    console.log(`   🌐 Website: ${institution.website}`);
    console.log(`   📞 Contact: ${institution.contact.phone}`);

    console.log('\n🚀 Egerton University seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding Egerton University:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedEgertonUniversity();
    console.log('\n✨ Egerton University is ready for students to explore!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
main();

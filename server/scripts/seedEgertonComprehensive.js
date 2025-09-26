const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');
const Institution = require('../models/Institution');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for Egerton comprehensive seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Comprehensive Egerton University Bachelor's Programs
const egertonPrograms = {
  agriculture_natural_resources: [
    {
      name: 'Bachelor of Science in Agriculture',
      code: 'BSC-AGR',
      department: 'Faculty of Agriculture',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Comprehensive agricultural science program covering crop production, soil management, and sustainable farming practices.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
      careerProspects: ['Agricultural Officer', 'Farm Manager', 'Agricultural Consultant', 'Extension Officer']
    },
    {
      name: 'Bachelor of Science in Agribusiness Management',
      code: 'BSC-ABM',
      department: 'Faculty of Agriculture',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Business-focused agricultural program combining farming knowledge with business management skills.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, English, and any two of Biology, Chemistry, Physics',
      careerProspects: ['Agribusiness Manager', 'Agricultural Marketing Specialist', 'Farm Business Consultant', 'Agricultural Banker']
    },
    {
      name: 'Bachelor of Science in Agricultural Economics',
      code: 'BSC-AGECON',
      department: 'Faculty of Agriculture',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Economic analysis of agricultural systems, markets, and policy development.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, English, and any two of Biology, Chemistry, Physics',
      careerProspects: ['Agricultural Economist', 'Policy Analyst', 'Market Research Analyst', 'Development Officer']
    },
    {
      name: 'Bachelor of Science in Animal Science and Technology',
      code: 'BSC-AST',
      department: 'Faculty of Agriculture',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Comprehensive animal husbandry program covering livestock production, breeding, and management.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
      careerProspects: ['Animal Scientist', 'Livestock Production Manager', 'Animal Nutritionist', 'Veterinary Assistant']
    },
    {
      name: 'Bachelor of Science in Applied Aquatic Sciences',
      code: 'BSC-AAS',
      department: 'Faculty of Agriculture',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Aquaculture and fisheries science program focusing on sustainable aquatic resource management.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
      careerProspects: ['Aquaculture Specialist', 'Fisheries Officer', 'Marine Biologist', 'Aquatic Resource Manager']
    },
    {
      name: 'Bachelor of Science in Dairy Technology and Management',
      code: 'BSC-DTM',
      department: 'Faculty of Agriculture',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Specialized program in dairy production, processing, and quality management.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
      careerProspects: ['Dairy Technologist', 'Dairy Farm Manager', 'Quality Control Officer', 'Dairy Processing Specialist']
    },
    {
      name: 'Bachelor of Science in Dryland Resources Management',
      code: 'BSC-DRM',
      department: 'Faculty of Agriculture',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Sustainable management of arid and semi-arid land resources.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
      careerProspects: ['Dryland Specialist', 'Environmental Consultant', 'Land Use Planner', 'Conservation Officer']
    },
    {
      name: 'Bachelor of Science in Environmental Science',
      code: 'BSC-ENV',
      department: 'Faculty of Environment and Resources Development',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Interdisciplinary program addressing environmental challenges and conservation.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
      careerProspects: ['Environmental Scientist', 'Conservation Officer', 'Environmental Consultant', 'Climate Change Analyst']
    }
  ],

  sciences: [
    {
      name: 'Bachelor of Science in Applied Computer Science',
      code: 'BSC-ACS',
      department: 'Faculty of Science',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Practical computer science program with emphasis on software development and system design.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, Physics, and English',
      careerProspects: ['Software Developer', 'Systems Analyst', 'IT Consultant', 'Database Administrator']
    },
    {
      name: 'Bachelor of Science in Biochemistry',
      code: 'BSC-BIOCHEM',
      department: 'Faculty of Science',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Study of chemical processes within living organisms.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
      careerProspects: ['Biochemist', 'Research Scientist', 'Laboratory Technologist', 'Pharmaceutical Researcher']
    },
    {
      name: 'Bachelor of Science in Computer Science',
      code: 'BSC-CS',
      department: 'Faculty of Science',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Comprehensive computer science program covering algorithms, programming, and theoretical foundations.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, Physics, and English',
      careerProspects: ['Software Engineer', 'Data Scientist', 'Cybersecurity Specialist', 'AI/ML Engineer']
    },
    {
      name: 'Bachelor of Science in Mathematics',
      code: 'BSC-MATH',
      department: 'Faculty of Science',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Pure and applied mathematics with emphasis on problem-solving and analytical thinking.',
      entryRequirements: 'KCSE mean grade C+ with B in Mathematics, C+ in Physics, and C+ in English',
      careerProspects: ['Mathematician', 'Statistician', 'Data Analyst', 'Actuarial Scientist']
    },
    {
      name: 'Bachelor of Science in Physics',
      code: 'BSC-PHYS',
      department: 'Faculty of Science',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Fundamental physics principles with applications in technology and research.',
      entryRequirements: 'KCSE mean grade C+ with B in Physics, C+ in Mathematics, and C+ in English',
      careerProspects: ['Physicist', 'Research Scientist', 'Engineering Physicist', 'Science Teacher']
    }
  ],

  business_commerce: [
    {
      name: 'Bachelor of Science in Commerce',
      code: 'BSC-COM',
      department: 'Faculty of Commerce',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Comprehensive business program covering accounting, finance, marketing, and management.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, English, and any two other subjects',
      careerProspects: ['Business Analyst', 'Financial Manager', 'Marketing Specialist', 'Operations Manager']
    },
    {
      name: 'Bachelor of Science in Entrepreneurship and Small Business Management',
      code: 'BSC-ESBM',
      department: 'Faculty of Commerce',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Entrepreneurship-focused program developing business creation and management skills.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, English, and any two other subjects',
      careerProspects: ['Entrepreneur', 'Business Consultant', 'Small Business Manager', 'Innovation Specialist']
    },
    {
      name: 'Bachelor of Science in Procurement and Supply Chain Management',
      code: 'BSC-PSCM',
      department: 'Faculty of Commerce',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Specialized program in procurement processes and supply chain optimization.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, English, and any two other subjects',
      careerProspects: ['Procurement Officer', 'Supply Chain Manager', 'Logistics Coordinator', 'Operations Analyst']
    }
  ],

  education: [
    {
      name: 'Bachelor of Education (Arts)',
      code: 'BED-ARTS',
      department: 'Faculty of Education',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Teacher training program for secondary school arts subjects.',
      entryRequirements: 'KCSE mean grade C+ with C+ in two teaching subjects and C in English',
      careerProspects: ['Secondary School Teacher', 'Education Officer', 'Curriculum Developer', 'School Administrator']
    },
    {
      name: 'Bachelor of Education (Science)',
      code: 'BED-SCI',
      department: 'Faculty of Education',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Teacher training program for secondary school science subjects.',
      entryRequirements: 'KCSE mean grade C+ with C+ in two science teaching subjects and C in English',
      careerProspects: ['Science Teacher', 'Education Officer', 'Science Curriculum Developer', 'School Administrator']
    },
    {
      name: 'Bachelor of Education in Agricultural Education',
      code: 'BED-AGED',
      department: 'Faculty of Education',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Specialized teacher training for agricultural education in schools.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Agriculture, Biology, and English',
      careerProspects: ['Agriculture Teacher', 'Extension Officer', 'Agricultural Education Specialist', 'Curriculum Developer']
    }
  ],

  arts_social_sciences: [
    {
      name: 'Bachelor of Arts in Communication and Media',
      code: 'BA-CM',
      department: 'Faculty of Arts and Social Sciences',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Media and communication program covering journalism, broadcasting, and digital media.',
      entryRequirements: 'KCSE mean grade C+ with C+ in English and any two other subjects',
      careerProspects: ['Journalist', 'Media Producer', 'Communication Specialist', 'Public Relations Officer']
    },
    {
      name: 'Bachelor of Arts in Economics',
      code: 'BA-ECON',
      department: 'Faculty of Arts and Social Sciences',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Economic theory and analysis with applications to policy and development.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics, English, and any two other subjects',
      careerProspects: ['Economist', 'Policy Analyst', 'Research Analyst', 'Development Officer']
    },
    {
      name: 'Bachelor of Arts in Development Studies',
      code: 'BA-DS',
      department: 'Faculty of Arts and Social Sciences',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Interdisciplinary program focusing on sustainable development and social change.',
      entryRequirements: 'KCSE mean grade C+ with C+ in English and any two other subjects',
      careerProspects: ['Development Officer', 'Project Coordinator', 'NGO Worker', 'Community Development Specialist']
    },
    {
      name: 'Bachelor of Arts in Sociology',
      code: 'BA-SOC',
      department: 'Faculty of Arts and Social Sciences',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Study of society, social behavior, and social institutions.',
      entryRequirements: 'KCSE mean grade C+ with C+ in English and any two other subjects',
      careerProspects: ['Social Worker', 'Research Officer', 'Community Organizer', 'Policy Analyst']
    }
  ],

  engineering_other: [
    {
      name: 'Bachelor of Science in Agricultural Engineering',
      code: 'BSC-AGENG',
      department: 'Faculty of Engineering',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Engineering principles applied to agricultural production and processing.',
      entryRequirements: 'KCSE mean grade B- with B- in Mathematics, Physics, and English',
      careerProspects: ['Agricultural Engineer', 'Irrigation Specialist', 'Farm Mechanization Expert', 'Food Processing Engineer']
    },
    {
      name: 'Bachelor of Laws',
      code: 'LLB',
      department: 'Faculty of Law',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Comprehensive legal education covering various areas of law.',
      entryRequirements: 'KCSE mean grade B with B in English and any other two subjects',
      careerProspects: ['Advocate', 'Legal Counsel', 'Magistrate', 'Legal Researcher']
    }
  ],

  health_sciences: [
    {
      name: 'Bachelor of Medicine and Bachelor of Surgery',
      code: 'MBCHB',
      department: 'Faculty of Health Sciences',
      level: 'Undergraduate',
      duration: { years: 6, semesters: 12 },
      description: 'Comprehensive medical degree program preparing doctors for clinical practice.',
      entryRequirements: 'KCSE mean grade A- with A- in Biology, Chemistry, Physics, and Mathematics',
      careerProspects: ['Medical Doctor', 'Surgeon', 'Medical Researcher', 'Public Health Officer']
    },
    {
      name: 'Bachelor of Science in Clinical Medicine',
      code: 'BSC-CM',
      department: 'Faculty of Health Sciences',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Clinical medicine program preparing clinical officers for primary healthcare.',
      entryRequirements: 'KCSE mean grade B with B in Biology, Chemistry, Physics, and Mathematics',
      careerProspects: ['Clinical Officer', 'Medical Officer', 'Healthcare Administrator', 'Public Health Officer']
    },
    {
      name: 'Bachelor of Science in Foods Nutrition and Dietetics',
      code: 'BSC-FND',
      department: 'Faculty of Health Sciences',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Nutrition science program focusing on food, health, and dietary management.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
      careerProspects: ['Nutritionist', 'Dietitian', 'Food Safety Officer', 'Public Health Nutritionist']
    },
    {
      name: 'Bachelor of Science in Nursing',
      code: 'BSC-NURS',
      department: 'Faculty of Health Sciences',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Professional nursing program with clinical practice and healthcare management.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Physics, and English',
      careerProspects: ['Registered Nurse', 'Nurse Manager', 'Clinical Nurse Specialist', 'Public Health Nurse']
    },
    {
      name: 'Bachelor of Science in Public Health',
      code: 'BSC-PH',
      department: 'Faculty of Health Sciences',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Community health program focusing on disease prevention and health promotion.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Biology, Chemistry, Mathematics, and English',
      careerProspects: ['Public Health Officer', 'Epidemiologist', 'Health Educator', 'Community Health Specialist']
    }
  ]
};

const seedEgertonComprehensive = async () => {
  try {
    console.log('🌱 Starting comprehensive Egerton University seeding...');
    
    // Find Egerton University
    const egerton = await Institution.findOne({ shortName: 'EU' });
    if (!egerton) {
      console.log('❌ Egerton University not found. Please run institution seeding first.');
      process.exit(1);
    }

    console.log('🎓 Found Egerton University:', egerton.name);

    // Remove existing Egerton courses
    await Course.deleteMany({ institution: egerton._id });
    console.log('🗑️  Cleared existing Egerton courses');

    const allCourses = [];

    // Add all program categories
    Object.values(egertonPrograms).forEach(categoryPrograms => {
      categoryPrograms.forEach(program => {
        allCourses.push({
          ...program,
          institution: egerton._id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });

    // Insert all courses
    const courses = await Course.insertMany(allCourses);
    console.log(`✅ Successfully seeded ${courses.length} Egerton University courses`);

    // Display summary
    console.log('\n📊 Egerton University Course Summary:');
    console.log(`   Agriculture & Natural Resources: ${egertonPrograms.agriculture_natural_resources.length} programs`);
    console.log(`   Sciences: ${egertonPrograms.sciences.length} programs`);
    console.log(`   Business & Commerce: ${egertonPrograms.business_commerce.length} programs`);
    console.log(`   Education: ${egertonPrograms.education.length} programs`);
    console.log(`   Arts & Social Sciences: ${egertonPrograms.arts_social_sciences.length} programs`);
    console.log(`   Engineering & Other: ${egertonPrograms.engineering_other.length} programs`);
    console.log(`   Health Sciences: ${egertonPrograms.health_sciences.length} programs`);
    console.log(`   Total Programs: ${courses.length}`);

    console.log('\n🎯 Sample programs created:');
    courses.slice(0, 5).forEach(course => {
      console.log(`   • ${course.name} (${course.code}) - ${course.duration.years} years`);
    });

    console.log('\n🚀 Egerton University comprehensive seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding Egerton courses:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedEgertonComprehensive();
    console.log('\n✨ Egerton University is now fully loaded with comprehensive programs!');
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

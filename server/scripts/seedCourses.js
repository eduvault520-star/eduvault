const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');
const Institution = require('../models/Institution');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for course seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Course templates by institution type
const courseTemplates = {
  public_university: [
    {
      name: 'Bachelor of Medicine and Bachelor of Surgery',
      code: 'MBCHB',
      department: 'School of Medicine',
      level: 'Undergraduate',
      duration: { years: 6, semesters: 12 },
      description: 'Comprehensive medical degree program preparing students for medical practice.',
      entryRequirements: 'KCSE mean grade A- with A- in Biology, Chemistry, Physics, and Mathematics or English',
      careerProspects: ['Medical Doctor', 'Surgeon', 'Medical Researcher', 'Public Health Officer']
    },
    {
      name: 'Bachelor of Engineering (Civil)',
      code: 'BENG-CIVIL',
      department: 'School of Engineering',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Engineering program focusing on design and construction of infrastructure.',
      entryRequirements: 'KCSE mean grade B+ with B+ in Mathematics and Physics',
      careerProspects: ['Civil Engineer', 'Project Manager', 'Construction Manager', 'Consultant']
    },
    {
      name: 'Bachelor of Commerce',
      code: 'BCOM',
      department: 'School of Business',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Business degree covering accounting, finance, marketing, and management.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics and English',
      careerProspects: ['Accountant', 'Financial Analyst', 'Marketing Manager', 'Business Consultant']
    },
    {
      name: 'Bachelor of Education (Arts)',
      code: 'BED-ARTS',
      department: 'School of Education',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Teacher training program for secondary school arts subjects.',
      entryRequirements: 'KCSE mean grade C+ with C+ in two teaching subjects',
      careerProspects: ['Secondary School Teacher', 'Education Officer', 'Curriculum Developer', 'School Administrator']
    },
    {
      name: 'Bachelor of Science (Computer Science)',
      code: 'BSC-CS',
      department: 'School of Computing',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Computer science program covering programming, algorithms, and software development.',
      entryRequirements: 'KCSE mean grade B- with B- in Mathematics and Physics',
      careerProspects: ['Software Developer', 'Systems Analyst', 'IT Consultant', 'Data Scientist']
    },
    {
      name: 'Bachelor of Laws',
      code: 'LLB',
      department: 'School of Law',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Legal studies program preparing students for legal practice.',
      entryRequirements: 'KCSE mean grade B with B in English and any other two subjects',
      careerProspects: ['Advocate', 'Magistrate', 'Legal Counsel', 'Legal Researcher']
    }
  ],
  
  private_university: [
    {
      name: 'Bachelor of Business Administration',
      code: 'BBA',
      department: 'School of Business',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'Comprehensive business administration program with modern management practices.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics and English',
      careerProspects: ['Business Manager', 'Entrepreneur', 'Project Coordinator', 'Operations Manager']
    },
    {
      name: 'Bachelor of Information Technology',
      code: 'BIT',
      department: 'School of ICT',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'IT program focusing on practical technology solutions and innovation.',
      entryRequirements: 'KCSE mean grade C+ with C+ in Mathematics and English',
      careerProspects: ['IT Specialist', 'Network Administrator', 'Web Developer', 'Tech Entrepreneur']
    },
    {
      name: 'Bachelor of International Relations',
      code: 'BIR',
      department: 'School of Humanities',
      level: 'Undergraduate',
      duration: { years: 4, semesters: 8 },
      description: 'International relations program covering diplomacy, global politics, and international law.',
      entryRequirements: 'KCSE mean grade C+ with C+ in English and History/Government',
      careerProspects: ['Diplomat', 'International Relations Officer', 'NGO Worker', 'Policy Analyst']
    }
  ],

  medical_college: [
    {
      name: 'Diploma in Clinical Medicine and Community Health',
      code: 'DCMCH',
      department: 'Clinical Medicine',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Comprehensive program preparing clinical officers for primary healthcare delivery.',
      entryRequirements: 'KCSE mean grade C with C in Biology, Chemistry, Physics, and Mathematics or English',
      careerProspects: ['Clinical Officer', 'Community Health Officer', 'Public Health Specialist', 'Healthcare Administrator']
    },
    {
      name: 'Diploma in Nursing',
      code: 'DN',
      department: 'Nursing Sciences',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Professional nursing program covering patient care and healthcare management.',
      entryRequirements: 'KCSE mean grade C with C in Biology, Chemistry, Physics, and Mathematics or English',
      careerProspects: ['Registered Nurse', 'Nurse Manager', 'Community Health Nurse', 'Specialized Nurse']
    },
    {
      name: 'Diploma in Medical Laboratory Sciences',
      code: 'DMLS',
      department: 'Medical Laboratory Sciences',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Laboratory sciences program for diagnostic and research laboratory work.',
      entryRequirements: 'KCSE mean grade C with C in Biology, Chemistry, Physics, and Mathematics',
      careerProspects: ['Medical Laboratory Technologist', 'Research Assistant', 'Quality Control Officer', 'Laboratory Manager']
    },
    {
      name: 'Diploma in Pharmacy',
      code: 'DP',
      department: 'Pharmaceutical Sciences',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Pharmaceutical sciences program covering drug dispensing and patient counseling.',
      entryRequirements: 'KCSE mean grade C with C in Biology, Chemistry, Physics, and Mathematics',
      careerProspects: ['Pharmaceutical Technologist', 'Hospital Pharmacist', 'Community Pharmacist', 'Drug Inspector']
    },
    {
      name: 'Diploma in Public Health',
      code: 'DPH',
      department: 'Public Health',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Public health program focusing on community health promotion and disease prevention.',
      entryRequirements: 'KCSE mean grade C with C in Biology, Chemistry, and Mathematics or English',
      careerProspects: ['Public Health Officer', 'Health Educator', 'Epidemiologist', 'Health Program Coordinator']
    }
  ],

  polytechnic: [
    {
      name: 'Diploma in Mechanical Engineering',
      code: 'DME',
      department: 'Engineering',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Mechanical engineering program covering design, manufacturing, and maintenance.',
      entryRequirements: 'KCSE mean grade C- with C- in Mathematics, Physics, and English',
      careerProspects: ['Mechanical Technician', 'Maintenance Engineer', 'Production Supervisor', 'Quality Control Inspector']
    },
    {
      name: 'Diploma in Electrical and Electronics Engineering',
      code: 'DEEE',
      department: 'Engineering',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Electrical engineering program covering power systems and electronics.',
      entryRequirements: 'KCSE mean grade C- with C- in Mathematics, Physics, and English',
      careerProspects: ['Electrical Technician', 'Electronics Technician', 'Power Systems Operator', 'Instrumentation Technician']
    },
    {
      name: 'Diploma in Civil Engineering',
      code: 'DCE',
      department: 'Engineering',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Civil engineering program focusing on construction and infrastructure development.',
      entryRequirements: 'KCSE mean grade C- with C- in Mathematics, Physics, and English',
      careerProspects: ['Civil Engineering Technician', 'Site Supervisor', 'Quantity Surveyor Assistant', 'Construction Manager']
    },
    {
      name: 'Diploma in Information Communication Technology',
      code: 'DICT',
      department: 'ICT',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'ICT program covering computer systems, networking, and software development.',
      entryRequirements: 'KCSE mean grade C- with C- in Mathematics and English',
      careerProspects: ['ICT Technician', 'Network Administrator', 'Software Developer', 'Database Administrator']
    },
    {
      name: 'Diploma in Business Management',
      code: 'DBM',
      department: 'Business Studies',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Business management program covering entrepreneurship and organizational management.',
      entryRequirements: 'KCSE mean grade C- with C- in Mathematics and English',
      careerProspects: ['Business Administrator', 'Operations Manager', 'Sales Manager', 'Entrepreneur']
    }
  ],

  teachers_college: [
    {
      name: 'Diploma in Primary Teacher Education',
      code: 'DPTE',
      department: 'Education',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Primary teacher training program covering pedagogy and subject content.',
      entryRequirements: 'KCSE mean grade C (plain) with C in English and Mathematics',
      careerProspects: ['Primary School Teacher', 'Head Teacher', 'Education Officer', 'Curriculum Developer']
    },
    {
      name: 'Diploma in Early Childhood Development and Education',
      code: 'DECDE',
      department: 'Education',
      level: 'Diploma',
      duration: { years: 3, semesters: 6 },
      description: 'Early childhood education program focusing on child development and learning.',
      entryRequirements: 'KCSE mean grade C (plain) with C in English',
      careerProspects: ['ECD Teacher', 'Child Development Specialist', 'Preschool Manager', 'Education Coordinator']
    }
  ],

  technical_institute: [
    {
      name: 'Certificate in Motor Vehicle Mechanics',
      code: 'CMVM',
      department: 'Automotive Technology',
      level: 'Certificate',
      duration: { years: 2, semesters: 4 },
      description: 'Automotive mechanics program covering vehicle maintenance and repair.',
      entryRequirements: 'KCSE mean grade D+ with D+ in Mathematics and English',
      careerProspects: ['Motor Vehicle Mechanic', 'Automotive Technician', 'Service Advisor', 'Workshop Supervisor']
    },
    {
      name: 'Certificate in Welding and Fabrication',
      code: 'CWF',
      department: 'Mechanical Engineering',
      level: 'Certificate',
      duration: { years: 2, semesters: 4 },
      description: 'Welding and fabrication program covering various welding techniques and metal work.',
      entryRequirements: 'KCSE mean grade D+ with D+ in Mathematics and English',
      careerProspects: ['Welder', 'Fabricator', 'Metal Worker', 'Construction Technician']
    },
    {
      name: 'Certificate in Plumbing',
      code: 'CP',
      department: 'Building Technology',
      level: 'Certificate',
      duration: { years: 2, semesters: 4 },
      description: 'Plumbing program covering water systems installation and maintenance.',
      entryRequirements: 'KCSE mean grade D+ with D+ in Mathematics and English',
      careerProspects: ['Plumber', 'Pipe Fitter', 'Water Systems Technician', 'Maintenance Supervisor']
    }
  ]
};

const seedCourses = async () => {
  try {
    console.log('🌱 Starting course seeding...');
    
    // Get all institutions
    const institutions = await Institution.find({});
    console.log(`📚 Found ${institutions.length} institutions`);

    // Clear existing courses
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing courses');

    const allCourses = [];

    // Create courses for each institution
    for (const institution of institutions) {
      const templates = courseTemplates[institution.type] || [];
      
      for (const template of templates) {
        const course = {
          ...template,
          institution: institution._id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        allCourses.push(course);
      }
    }

    // Insert all courses
    const courses = await Course.insertMany(allCourses);
    console.log(`✅ Successfully seeded ${courses.length} courses`);

    // Display summary by institution type
    const summary = {};
    for (const institution of institutions) {
      const institutionCourses = courses.filter(course => 
        course.institution.toString() === institution._id.toString()
      );
      summary[institution.type] = (summary[institution.type] || 0) + institutionCourses.length;
    }

    console.log('\n📊 Course Summary by Institution Type:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`   ${type.replace('_', ' ').toUpperCase()}: ${count} courses`);
    });

    console.log('\n🎯 Sample courses created:');
    courses.slice(0, 8).forEach(course => {
      console.log(`   • ${course.name} (${course.code}) - ${course.duration.years} years`);
    });

    console.log('\n🚀 Course seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedCourses();
    console.log('\n✨ All done! Courses are ready for students to explore.');
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

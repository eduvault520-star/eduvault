const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Institution = require('../models/Institution');
const Course = require('../models/Course');
const User = require('../models/User');
const Job = require('../models/Job');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduvault', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Institution.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({});
    await Job.deleteMany({});

    // Seed Institutions
    console.log('📚 Seeding institutions...');
    const institutions = await Institution.insertMany([
      {
        name: 'Kenya Medical Training College',
        shortName: 'KMTC',
        type: 'medical_college',
        location: {
          county: 'Nairobi',
          town: 'Nairobi',
          address: 'Off Ngong Road'
        },
        colors: {
          primary: '#1976d2',
          secondary: '#dc004e'
        },
        contact: {
          email: 'info@kmtc.ac.ke',
          phone: '+254 20 2725711',
          website: 'https://kmtc.ac.ke'
        },
        establishedYear: 1927,
        accreditation: {
          body: 'Commission for University Education',
          status: 'accredited'
        }
      },
      {
        name: 'University of Nairobi',
        shortName: 'UON',
        type: 'university',
        location: {
          county: 'Nairobi',
          town: 'Nairobi',
          address: 'University Way'
        },
        colors: {
          primary: '#003366',
          secondary: '#ff6600'
        },
        contact: {
          email: 'info@uonbi.ac.ke',
          phone: '+254 20 4913000',
          website: 'https://uonbi.ac.ke'
        },
        establishedYear: 1956,
        accreditation: {
          body: 'Commission for University Education',
          status: 'accredited'
        }
      },
      {
        name: 'Kenyatta University',
        shortName: 'KU',
        type: 'university',
        location: {
          county: 'Kiambu',
          town: 'Kahawa',
          address: 'Thika Road'
        },
        colors: {
          primary: '#2e7d32',
          secondary: '#ffc107'
        },
        contact: {
          email: 'info@ku.ac.ke',
          phone: '+254 67 52711',
          website: 'https://ku.ac.ke'
        },
        establishedYear: 1985,
        accreditation: {
          body: 'Commission for University Education',
          status: 'accredited'
        }
      },
      {
        name: 'Technical University of Kenya',
        shortName: 'TUK',
        type: 'technical_college',
        location: {
          county: 'Nairobi',
          town: 'Nairobi',
          address: 'Haile Selassie Avenue'
        },
        colors: {
          primary: '#d32f2f',
          secondary: '#1976d2'
        },
        contact: {
          email: 'info@tukenya.ac.ke',
          phone: '+254 20 2219929',
          website: 'https://tukenya.ac.ke'
        },
        establishedYear: 2013,
        accreditation: {
          body: 'Commission for University Education',
          status: 'accredited'
        }
      }
    ]);

    // Seed Courses for KMTC
    console.log('📖 Seeding courses...');
    const kmtc = institutions.find(inst => inst.shortName === 'KMTC');
    const uon = institutions.find(inst => inst.shortName === 'UON');
    const ku = institutions.find(inst => inst.shortName === 'KU');
    const tuk = institutions.find(inst => inst.shortName === 'TUK');

    const courses = await Course.insertMany([
      // KMTC Courses
      {
        name: 'Diploma in Clinical Medicine and Community Health',
        code: 'DCMCH',
        institution: kmtc._id,
        department: 'Clinical Medicine',
        duration: { years: 3, semesters: 6 },
        description: 'Comprehensive training in clinical medicine and community health practices.',
        requirements: {
          minimumGrade: 'C+',
          subjects: ['Biology', 'Chemistry', 'Mathematics', 'English'],
          other: ['Medical certificate of fitness']
        },
        careerProspects: ['Clinical Officer', 'Community Health Officer', 'Public Health Officer'],
        units: [
          {
            year: 1,
            semester: 1,
            unitCode: 'ANAT101',
            unitName: 'Human Anatomy I',
            creditHours: 4,
            isCore: true
          },
          {
            year: 1,
            semester: 1,
            unitCode: 'PHYS101',
            unitName: 'Human Physiology I',
            creditHours: 4,
            isCore: true
          },
          {
            year: 1,
            semester: 2,
            unitCode: 'ANAT102',
            unitName: 'Human Anatomy II',
            creditHours: 4,
            isCore: true
          },
          {
            year: 2,
            semester: 1,
            unitCode: 'PATH201',
            unitName: 'General Pathology',
            creditHours: 3,
            isCore: true
          }
        ],
        fees: {
          local: { perSemester: 25000, perYear: 50000 },
          international: { perSemester: 50000, perYear: 100000 }
        }
      },
      {
        name: 'Diploma in Nursing',
        code: 'DN',
        institution: kmtc._id,
        department: 'Nursing',
        duration: { years: 3, semesters: 6 },
        description: 'Professional nursing training program.',
        requirements: {
          minimumGrade: 'C+',
          subjects: ['Biology', 'Chemistry', 'Mathematics', 'English'],
          other: ['Medical certificate of fitness']
        },
        careerProspects: ['Registered Nurse', 'Community Health Nurse', 'Hospital Nurse'],
        units: [
          {
            year: 1,
            semester: 1,
            unitCode: 'NURS101',
            unitName: 'Fundamentals of Nursing',
            creditHours: 4,
            isCore: true
          }
        ],
        fees: {
          local: { perSemester: 30000, perYear: 60000 }
        }
      },
      // UON Courses
      {
        name: 'Bachelor of Medicine and Bachelor of Surgery',
        code: 'MBCHB',
        institution: uon._id,
        department: 'Medicine',
        duration: { years: 6, semesters: 12 },
        description: 'Comprehensive medical degree program.',
        requirements: {
          minimumGrade: 'A-',
          subjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics'],
          other: ['KCSE certificate']
        },
        careerProspects: ['Medical Doctor', 'Surgeon', 'Specialist'],
        units: [
          {
            year: 1,
            semester: 1,
            unitCode: 'MED101',
            unitName: 'Basic Medical Sciences',
            creditHours: 5,
            isCore: true
          }
        ],
        fees: {
          local: { perSemester: 80000, perYear: 160000 }
        }
      },
      // TUK Courses
      {
        name: 'Bachelor of Technology in Information Technology',
        code: 'BTIT',
        institution: tuk._id,
        department: 'Information Technology',
        duration: { years: 4, semesters: 8 },
        description: 'Comprehensive IT program covering software development, networking, and systems administration.',
        requirements: {
          minimumGrade: 'C+',
          subjects: ['Mathematics', 'Physics', 'English'],
          other: ['KCSE certificate']
        },
        careerProspects: ['Software Developer', 'Systems Administrator', 'IT Consultant'],
        units: [
          {
            year: 1,
            semester: 1,
            unitCode: 'IT101',
            unitName: 'Introduction to Computing',
            creditHours: 3,
            isCore: true
          },
          {
            year: 1,
            semester: 1,
            unitCode: 'PROG101',
            unitName: 'Programming Fundamentals',
            creditHours: 4,
            isCore: true
          }
        ],
        fees: {
          local: { perSemester: 45000, perYear: 90000 }
        }
      }
    ]);

    // Create Super Admin User
    console.log('👤 Creating admin users...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await User.create({
      email: 'admin@eduvault.co.ke',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: '0700000000',
      role: 'super_admin',
      isEmailVerified: true
    });

    // Create sample student
    const studentPassword = await bcrypt.hash('student123', 12);
    const studentUser = await User.create({
      email: 'student@example.com',
      password: studentPassword,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '0700000001',
      role: 'student',
      institution: kmtc._id,
      course: courses[0]._id,
      yearOfStudy: 2,
      isEmailVerified: true
    });

    // Seed Sample Jobs
    console.log('💼 Seeding job opportunities...');
    await Job.insertMany([
      {
        title: 'Clinical Officer - Nairobi Hospital',
        company: {
          name: 'Nairobi Hospital',
          location: {
            county: 'Nairobi',
            town: 'Nairobi',
            isRemote: false
          }
        },
        description: 'We are seeking a qualified Clinical Officer to join our team at Nairobi Hospital. The successful candidate will provide quality healthcare services to patients.',
        requirements: [
          'Diploma in Clinical Medicine and Community Health',
          'Valid license from Kenya Medical Practitioners Board',
          'Minimum 2 years experience',
          'Good communication skills'
        ],
        responsibilities: [
          'Examine and treat patients',
          'Maintain patient records',
          'Collaborate with medical team',
          'Provide health education'
        ],
        benefits: [
          'Competitive salary',
          'Medical insurance',
          'Professional development opportunities'
        ],
        salary: {
          min: 80000,
          max: 120000,
          currency: 'KSH',
          period: 'monthly'
        },
        employmentType: 'full_time',
        experienceLevel: 'junior',
        relatedCourses: [courses[0]._id],
        skills: ['Patient Care', 'Medical Diagnosis', 'Emergency Response'],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        applicationMethod: {
          email: 'hr@nairobihosp.org',
          instructions: 'Send CV and cover letter'
        },
        postedBy: adminUser._id,
        isPremium: true,
        unlockPrice: 200
      },
      {
        title: 'Software Developer - Tech Startup',
        company: {
          name: 'InnovateTech Kenya',
          location: {
            county: 'Nairobi',
            town: 'Nairobi',
            isRemote: true
          }
        },
        description: 'Join our dynamic team as a Software Developer. Work on cutting-edge projects and grow your career in technology.',
        requirements: [
          'Bachelor\'s degree in IT or related field',
          'Proficiency in JavaScript, Python, or Java',
          'Experience with web frameworks',
          'Problem-solving skills'
        ],
        responsibilities: [
          'Develop web applications',
          'Write clean, maintainable code',
          'Collaborate with cross-functional teams',
          'Participate in code reviews'
        ],
        benefits: [
          'Flexible working hours',
          'Remote work options',
          'Learning and development budget',
          'Health insurance'
        ],
        salary: {
          min: 100000,
          max: 180000,
          currency: 'KSH',
          period: 'monthly'
        },
        employmentType: 'full_time',
        experienceLevel: 'entry',
        relatedCourses: [courses[3]._id],
        skills: ['JavaScript', 'Python', 'React', 'Node.js'],
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        applicationMethod: {
          email: 'careers@innovatetech.co.ke',
          website: 'https://innovatetech.co.ke/careers',
          instructions: 'Apply through our website with portfolio'
        },
        postedBy: adminUser._id,
        isPremium: true,
        unlockPrice: 200
      }
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`- Institutions: ${institutions.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Users: 2 (1 admin, 1 student)`);
    console.log(`- Jobs: 2`);
    console.log('\n🔐 Admin credentials:');
    console.log('Email: admin@eduvault.co.ke');
    console.log('Password: admin123');
    console.log('\n👨‍🎓 Student credentials:');
    console.log('Email: student@example.com');
    console.log('Password: student123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();

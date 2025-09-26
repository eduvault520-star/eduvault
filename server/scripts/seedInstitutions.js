const mongoose = require('mongoose');
require('dotenv').config();

const Institution = require('../models/Institution');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for institution seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Comprehensive institution data based on the provided information
const institutionsData = [
  // Public Universities
  {
    name: 'University of Nairobi',
    shortName: 'UoN',
    type: 'public_university',
    location: { county: 'Nairobi', town: 'Nairobi' },
    establishedYear: 1970,
    isActive: true,
    colors: { primary: '#003366', secondary: '#FFD700' },
    description: 'Kenya\'s premier university, established in 1970, offering diverse academic programs.',
    website: 'www.uonbi.ac.ke',
    studentCapacity: 84000
  },
  {
    name: 'Kenyatta University',
    shortName: 'KU',
    type: 'public_university',
    location: { county: 'Kiambu', town: 'Kahawa' },
    establishedYear: 1985,
    isActive: true,
    colors: { primary: '#0066CC', secondary: '#FF6600' },
    description: 'A leading public university known for education, health sciences, and research.',
    website: 'www.ku.ac.ke',
    studentCapacity: 70000
  },
  {
    name: 'Moi University',
    shortName: 'MU',
    type: 'public_university',
    location: { county: 'Uasin Gishu', town: 'Eldoret' },
    establishedYear: 1984,
    isActive: true,
    colors: { primary: '#006633', secondary: '#FFCC00' },
    description: 'Second oldest university in Kenya, known for medicine, engineering, and agriculture.',
    website: 'www.mu.ac.ke',
    studentCapacity: 65000
  },
  {
    name: 'Egerton University',
    shortName: 'EU',
    type: 'public_university',
    location: { county: 'Nakuru', town: 'Njoro' },
    establishedYear: 1987,
    isActive: true,
    colors: { primary: '#228B22', secondary: '#FFD700' },
    description: 'Leading agricultural university in Kenya with strong research programs.',
    website: 'www.egerton.ac.ke',
    studentCapacity: 40000
  },
  {
    name: 'Maseno University',
    shortName: 'MASENO',
    type: 'public_university',
    location: { county: 'Kisumu', town: 'Maseno' },
    establishedYear: 2001,
    isActive: true,
    colors: { primary: '#4169E1', secondary: '#32CD32' },
    description: 'Public university known for arts, sciences, and teacher education.',
    website: 'www.maseno.ac.ke',
    studentCapacity: 35000
  },
  {
    name: 'Jomo Kenyatta University of Agriculture and Technology',
    shortName: 'JKUAT',
    type: 'public_university',
    location: { county: 'Kiambu', town: 'Juja' },
    establishedYear: 1994,
    isActive: true,
    colors: { primary: '#006400', secondary: '#FFD700' },
    description: 'Leading technological university specializing in agriculture, engineering, and technology.',
    website: 'www.jkuat.ac.ke',
    studentCapacity: 50000
  },
  {
    name: 'Dedan Kimathi University of Technology',
    shortName: 'DKUT',
    type: 'public_university',
    location: { county: 'Nyeri', town: 'Nyeri' },
    establishedYear: 2012,
    isActive: true,
    colors: { primary: '#8B0000', secondary: '#FFD700' },
    description: 'Technology-focused university offering engineering and applied sciences.',
    website: 'www.dkut.ac.ke',
    studentCapacity: 25000
  },
  {
    name: 'Technical University of Kenya',
    shortName: 'TUK',
    type: 'public_university',
    location: { county: 'Nairobi', town: 'Nairobi' },
    establishedYear: 2013,
    isActive: true,
    colors: { primary: '#FF4500', secondary: '#4169E1' },
    description: 'Premier technical university offering engineering and technology programs.',
    website: 'www.tukenya.ac.ke',
    studentCapacity: 30000
  },

  // Private Universities (Chartered)
  {
    name: 'Strathmore University',
    shortName: 'SU',
    type: 'private_university',
    location: { county: 'Nairobi', town: 'Nairobi' },
    establishedYear: 2002,
    isActive: true,
    colors: { primary: '#8B0000', secondary: '#FFD700' },
    description: 'Leading private university known for business, ICT, and governance programs.',
    website: 'www.strathmore.edu',
    studentCapacity: 15000
  },
  {
    name: 'United States International University - Africa',
    shortName: 'USIU-A',
    type: 'private_university',
    location: { county: 'Nairobi', town: 'Nairobi' },
    establishedYear: 1999,
    isActive: true,
    colors: { primary: '#000080', secondary: '#FFD700' },
    description: 'American-style liberal arts university offering diverse programs.',
    website: 'www.usiu.ac.ke',
    studentCapacity: 8000
  },
  {
    name: 'Mount Kenya University',
    shortName: 'MKU',
    type: 'private_university',
    location: { county: 'Kiambu', town: 'Thika' },
    establishedYear: 2011,
    isActive: true,
    colors: { primary: '#006633', secondary: '#FFFFFF' },
    description: 'Fast-growing private university with multiple campuses across Kenya.',
    website: 'www.mku.ac.ke',
    studentCapacity: 45000
  },
  {
    name: 'Daystar University',
    shortName: 'DSU',
    type: 'private_university',
    location: { county: 'Nairobi', town: 'Athi River' },
    establishedYear: 1994,
    isActive: true,
    colors: { primary: '#4169E1', secondary: '#FFD700' },
    description: 'Christian university known for communication, business, and social sciences.',
    website: 'www.daystar.ac.ke',
    studentCapacity: 12000
  },

  // Kenya Medical Training Colleges (KMTC)
  {
    name: 'Kenya Medical Training College - Nairobi',
    shortName: 'KMTC Nairobi',
    type: 'medical_college',
    location: { county: 'Nairobi', town: 'Nairobi' },
    establishedYear: 1927,
    isActive: true,
    colors: { primary: '#008000', secondary: '#FFFFFF' },
    description: 'Main KMTC campus offering comprehensive health sciences programs.',
    website: 'www.kmtc.ac.ke',
    studentCapacity: 5000,
    contact: '020-2081823'
  },
  {
    name: 'Kenya Medical Training College - Mombasa',
    shortName: 'KMTC Mombasa',
    type: 'medical_college',
    location: { county: 'Mombasa', town: 'Mombasa' },
    establishedYear: 1960,
    isActive: true,
    colors: { primary: '#008000', secondary: '#FFFFFF' },
    description: 'Coastal KMTC campus serving the coastal region with health programs.',
    website: 'www.kmtc.ac.ke',
    studentCapacity: 3000,
    contact: '041-2312562'
  },
  {
    name: 'Kenya Medical Training College - Nakuru',
    shortName: 'KMTC Nakuru',
    type: 'medical_college',
    location: { county: 'Nakuru', town: 'Nakuru' },
    establishedYear: 1965,
    isActive: true,
    colors: { primary: '#008000', secondary: '#FFFFFF' },
    description: 'Rift Valley KMTC campus offering medical and health sciences training.',
    website: 'www.kmtc.ac.ke',
    studentCapacity: 2500,
    contact: '051-2210250'
  },
  {
    name: 'Kenya Medical Training College - Kisumu',
    shortName: 'KMTC Kisumu',
    type: 'medical_college',
    location: { county: 'Kisumu', town: 'Kisumu' },
    establishedYear: 1970,
    isActive: true,
    colors: { primary: '#008000', secondary: '#FFFFFF' },
    description: 'Western Kenya KMTC campus serving Nyanza region.',
    website: 'www.kmtc.ac.ke',
    studentCapacity: 2200,
    contact: '057-2023706'
  },
  {
    name: 'Kenya Medical Training College - Eldoret',
    shortName: 'KMTC Eldoret',
    type: 'medical_college',
    location: { county: 'Uasin Gishu', town: 'Eldoret' },
    establishedYear: 1975,
    isActive: true,
    colors: { primary: '#008000', secondary: '#FFFFFF' },
    description: 'North Rift KMTC campus offering health sciences programs.',
    website: 'www.kmtc.ac.ke',
    studentCapacity: 2000,
    contact: '053-2033522'
  },

  // National Polytechnics
  {
    name: 'The Nairobi National Polytechnic',
    shortName: 'NNP',
    type: 'polytechnic',
    location: { county: 'Nairobi', town: 'Nairobi' },
    establishedYear: 1961,
    isActive: true,
    colors: { primary: '#FF4500', secondary: '#000080' },
    description: 'Premier polytechnic offering engineering, business, and technical programs.',
    website: 'www.nairobipolytechnic.ac.ke',
    studentCapacity: 8000
  },
  {
    name: 'Eldoret National Polytechnic',
    shortName: 'ENP',
    type: 'polytechnic',
    location: { county: 'Uasin Gishu', town: 'Eldoret' },
    establishedYear: 1980,
    isActive: true,
    colors: { primary: '#006633', secondary: '#FFD700' },
    description: 'Leading polytechnic in Rift Valley offering science and technology programs.',
    website: 'www.eldoretpolytechnic.ac.ke',
    studentCapacity: 6000
  },
  {
    name: 'Kisumu National Polytechnic',
    shortName: 'KNP',
    type: 'polytechnic',
    location: { county: 'Kisumu', town: 'Kisumu' },
    establishedYear: 1972,
    isActive: true,
    colors: { primary: '#4169E1', secondary: '#32CD32' },
    description: 'Western Kenya polytechnic specializing in vocational trades and technology.',
    website: 'www.kisumupolytechnic.ac.ke',
    studentCapacity: 5500
  },
  {
    name: 'Mombasa National Polytechnic',
    shortName: 'MNP',
    type: 'polytechnic',
    location: { county: 'Mombasa', town: 'Mombasa' },
    establishedYear: 1978,
    isActive: true,
    colors: { primary: '#008B8B', secondary: '#FFD700' },
    description: 'Coastal polytechnic focusing on maritime and engineering programs.',
    website: 'www.mombasapolytechnic.ac.ke',
    studentCapacity: 4500
  },

  // Teachers Training Colleges
  {
    name: 'Kagumo Teachers Training College',
    shortName: 'Kagumo TTC',
    type: 'teachers_college',
    location: { county: 'Nyeri', town: 'Nyeri' },
    establishedYear: 1928,
    isActive: true,
    colors: { primary: '#8B0000', secondary: '#FFD700' },
    description: 'Historic teachers college offering diploma in primary teacher education.',
    website: 'www.kagumo.ac.ke',
    studentCapacity: 2000
  },
  {
    name: 'Machakos Teachers Training College',
    shortName: 'Machakos TTC',
    type: 'teachers_college',
    location: { county: 'Machakos', town: 'Machakos' },
    establishedYear: 1956,
    isActive: true,
    colors: { primary: '#228B22', secondary: '#FFD700' },
    description: 'Eastern Kenya teachers college for primary and early childhood education.',
    website: 'www.machakosttc.ac.ke',
    studentCapacity: 1800
  },
  {
    name: 'Maseno Teachers Training College',
    shortName: 'Maseno TTC',
    type: 'teachers_college',
    location: { county: 'Kisumu', town: 'Maseno' },
    establishedYear: 1938,
    isActive: true,
    colors: { primary: '#4169E1', secondary: '#32CD32' },
    description: 'Western Kenya teachers college with strong education programs.',
    website: 'www.masenotc.ac.ke',
    studentCapacity: 1600
  },

  // Technical Training Institutes
  {
    name: 'Thika Technical Training Institute',
    shortName: 'Thika TTI',
    type: 'technical_institute',
    location: { county: 'Kiambu', town: 'Thika' },
    establishedYear: 1983,
    isActive: true,
    colors: { primary: '#FF4500', secondary: '#4169E1' },
    description: 'Technical institute offering industrial and business training programs.',
    website: 'www.thikatech.ac.ke',
    studentCapacity: 3000
  },
  {
    name: 'Kabete National Polytechnic',
    shortName: 'Kabete Poly',
    type: 'polytechnic',
    location: { county: 'Kiambu', town: 'Kabete' },
    establishedYear: 1924,
    isActive: true,
    colors: { primary: '#006400', secondary: '#FFD700' },
    description: 'Historic polytechnic specializing in automotive and construction trades.',
    website: 'www.kabetepolytechnic.ac.ke',
    studentCapacity: 4000
  }
];

const seedInstitutions = async () => {
  try {
    console.log('🌱 Starting institution seeding...');
    
    // Clear existing institutions
    await Institution.deleteMany({});
    console.log('🗑️  Cleared existing institutions');

    // Insert new institutions
    const institutions = await Institution.insertMany(institutionsData);
    console.log(`✅ Successfully seeded ${institutions.length} institutions`);

    // Display summary by type
    const summary = {};
    institutions.forEach(inst => {
      summary[inst.type] = (summary[inst.type] || 0) + 1;
    });

    console.log('\n📊 Institution Summary:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`   ${type.replace('_', ' ').toUpperCase()}: ${count}`);
    });

    console.log('\n🎯 Sample institutions created:');
    institutions.slice(0, 5).forEach(inst => {
      console.log(`   • ${inst.name} (${inst.shortName}) - ${inst.location.county}`);
    });

    console.log('\n🚀 Institution seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding institutions:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedInstitutions();
    console.log('\n✨ All done! Institutions are ready for students to explore.');
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

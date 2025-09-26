#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 EduVault Setup Script');
console.log('========================');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js 16+ is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version:', nodeVersion);

// Check if MongoDB is running (optional)
try {
  execSync('mongod --version', { stdio: 'ignore' });
  console.log('✅ MongoDB is available');
} catch (error) {
  console.log('⚠️  MongoDB not found locally - you can use MongoDB Atlas');
}

// Create environment files if they don't exist
const createEnvFile = (templatePath, targetPath, description) => {
  if (!fs.existsSync(targetPath)) {
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, targetPath);
      console.log(`✅ Created ${description} environment file: ${targetPath}`);
    } else {
      console.log(`⚠️  Template not found: ${templatePath}`);
    }
  } else {
    console.log(`✅ ${description} environment file already exists`);
  }
};

// Setup environment files
createEnvFile(
  path.join(__dirname, 'backend', '.env.example'),
  path.join(__dirname, 'backend', '.env'),
  'Backend'
);

// Create frontend .env if it doesn't exist
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
if (!fs.existsSync(frontendEnvPath)) {
  const frontendEnvContent = `REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FRONTEND_URL=http://localhost:3000
`;
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created frontend environment file');
} else {
  console.log('✅ Frontend environment file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');

try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing backend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
  
  console.log('Installing frontend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Check if we should seed the database
console.log('\n🌱 Database Setup');
console.log('To seed the database with sample data, run:');
console.log('cd backend && npm run seed');

console.log('\n🎉 Setup Complete!');
console.log('==================');
console.log('Next steps:');
console.log('1. Configure your environment variables in backend/.env');
console.log('2. Set up MongoDB (local or Atlas)');
console.log('3. Run: npm run dev (to start both frontend and backend)');
console.log('4. Access the app at: http://localhost:3000');
console.log('\nDefault credentials after seeding:');
console.log('Admin: admin@eduvault.co.ke / admin123');
console.log('Student: student@example.com / student123');
console.log('\n📚 See README.md and DEPLOYMENT_GUIDE.md for more details');

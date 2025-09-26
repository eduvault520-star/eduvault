const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Setting up EduVault database...');
console.log('This will seed institutions, courses, and create test users.');
console.log('');

// Run main seed first
console.log('📚 Step 1: Seeding institutions and courses...');
exec('node scripts/seedDatabase.js', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running main seed:', error);
    return;
  }
  
  console.log(stdout);
  if (stderr) console.error(stderr);
  
  // Then run user seed
  console.log('\n👥 Step 2: Creating test users...');
  exec('node scripts/seedUsers.js', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error seeding users:', error);
      return;
    }
    
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('\n🎉 Database setup complete!');
    console.log('You can now start the server and test all three interfaces.');
  });
});

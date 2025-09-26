const mongoose = require('mongoose');
const Institution = require('../models/Institution');
require('dotenv').config();

const keepOnlyEgerton = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // First, let's see what institutions we have
    console.log('\n📋 Current institutions in database:');
    const allInstitutions = await Institution.find({});
    allInstitutions.forEach((inst, index) => {
      console.log(`${index + 1}. ${inst.name} (ID: ${inst._id})`);
      console.log(`   Location: ${inst.location?.town}, ${inst.location?.county}`);
      console.log(`   Type: ${inst.type}`);
      console.log('---');
    });

    // Find Egerton University (case-insensitive search)
    const egertonRegex = /egerton/i;
    const egertonInstitution = await Institution.findOne({
      name: { $regex: egertonRegex }
    });

    if (!egertonInstitution) {
      console.log('❌ Egerton University not found in database!');
      console.log('Available institutions:');
      allInstitutions.forEach(inst => {
        console.log(`- ${inst.name}`);
      });
      process.exit(1);
    }

    console.log(`\n✅ Found Egerton University: ${egertonInstitution.name}`);
    console.log(`   ID: ${egertonInstitution._id}`);
    console.log(`   Location: ${egertonInstitution.location?.town}, ${egertonInstitution.location?.county}`);

    // Count institutions to be deleted
    const institutionsToDelete = await Institution.find({
      _id: { $ne: egertonInstitution._id }
    });

    console.log(`\n⚠️  About to delete ${institutionsToDelete.length} institutions:`);
    institutionsToDelete.forEach(inst => {
      console.log(`- ${inst.name} (${inst.location?.town}, ${inst.location?.county})`);
    });

    if (institutionsToDelete.length === 0) {
      console.log('✅ Only Egerton University exists. No institutions to delete.');
      process.exit(0);
    }

    // Confirm deletion
    console.log('\n🤔 Do you want to proceed with deletion? (This action cannot be undone)');
    console.log('Type "YES" to confirm or anything else to cancel:');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Confirm deletion: ', async (answer) => {
      if (answer.trim().toUpperCase() === 'YES') {
        try {
          console.log('\n🗑️  Deleting institutions...');
          
          const deleteResult = await Institution.deleteMany({
            _id: { $ne: egertonInstitution._id }
          });

          console.log(`✅ Successfully deleted ${deleteResult.deletedCount} institutions`);
          console.log(`✅ Egerton University preserved: ${egertonInstitution.name}`);

          // Verify final state
          const remainingInstitutions = await Institution.find({});
          console.log(`\n📊 Final state: ${remainingInstitutions.length} institution(s) remaining:`);
          remainingInstitutions.forEach(inst => {
            console.log(`✅ ${inst.name} (${inst.location?.town}, ${inst.location?.county})`);
          });

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

console.log('🎯 EduVault Institution Cleanup Script');
console.log('📝 This script will remove all institutions except Egerton University');
console.log('⚠️  This action is irreversible - make sure you have backups!');
console.log('');

keepOnlyEgerton();

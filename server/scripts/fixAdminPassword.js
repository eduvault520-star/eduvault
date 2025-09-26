const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixAdminPassword = async () => {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true
    });

    console.log('✅ Connected to MongoDB Atlas');

    // Create the correct hash
    const password = 'miniadmin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('🔐 Creating hash for:', password);
    console.log('🔐 Hash created:', hashedPassword);

    // Update directly in database to bypass pre-save hook
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin@eduvault.co.ke' },
      { $set: { password: hashedPassword } }
    );

    console.log('📝 Update result:', result);

    if (result.matchedCount === 0) {
      console.log('❌ No user found with email admin@eduvault.co.ke');
      return;
    }

    if (result.modifiedCount === 0) {
      console.log('⚠️ User found but password not modified');
      return;
    }

    console.log('✅ Password updated successfully!');

    // Test the password
    const user = await mongoose.connection.db.collection('users').findOne(
      { email: 'admin@eduvault.co.ke' }
    );

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🧪 Password test:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
      
      if (isMatch) {
        console.log('🎉 Admin login should now work!');
        console.log('📧 Email: admin@eduvault.co.ke');
        console.log('🔑 Password: miniadmin123');
        console.log('👑 Role:', user.role);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

fixAdminPassword();

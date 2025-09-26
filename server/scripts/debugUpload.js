const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const debugUpload = async () => {
  console.log('🔧 Upload Debug Tool');
  console.log('==================');

  // Test server connectivity
  console.log('\n1. Testing server connectivity...');
  try {
    const response = await axios.get('http://localhost:5001/api/health', {
      timeout: 5000
    });
    console.log('✅ Server is reachable');
  } catch (error) {
    console.log('❌ Server connectivity issue:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solution: Start the server with "npm run dev"');
      return;
    }
  }

  // Test authentication
  console.log('\n2. Testing authentication...');
  try {
    // Try to login with admin credentials
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@eduvault.co.ke',
      password: 'miniadmin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful');
    console.log('🔑 Token received:', token ? 'Yes' : 'No');

    // Test upload endpoints with authentication
    console.log('\n3. Testing upload endpoints...');
    
    // Test video upload endpoint
    try {
      const videoFormData = new FormData();
      // Create a small test file
      const testContent = Buffer.from('test video content');
      videoFormData.append('file', testContent, {
        filename: 'test-video.mp4',
        contentType: 'video/mp4'
      });

      const videoResponse = await axios.post('http://localhost:5001/api/upload/video', videoFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...videoFormData.getHeaders()
        }
      });
      console.log('✅ Video upload endpoint working');
    } catch (error) {
      console.log('❌ Video upload failed:', error.response?.data?.message || error.message);
      console.log('📊 Status:', error.response?.status);
      console.log('📋 Headers:', error.response?.headers);
    }

    // Test notes upload endpoint
    try {
      const notesFormData = new FormData();
      const testPdfContent = Buffer.from('%PDF-1.4 test content');
      notesFormData.append('file', testPdfContent, {
        filename: 'test-notes.pdf',
        contentType: 'application/pdf'
      });

      const notesResponse = await axios.post('http://localhost:5001/api/upload/notes', notesFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...notesFormData.getHeaders()
        }
      });
      console.log('✅ Notes upload endpoint working');
    } catch (error) {
      console.log('❌ Notes upload failed:', error.response?.data?.message || error.message);
      console.log('📊 Status:', error.response?.status);
    }

  } catch (loginError) {
    console.log('❌ Authentication failed:', loginError.response?.data?.message || loginError.message);
    console.log('💡 Check admin credentials in database');
  }

  console.log('\n4. Checking upload directories...');
  const uploadDirs = [
    path.join(__dirname, '../uploads/videos'),
    path.join(__dirname, '../uploads/notes'),
    path.join(__dirname, '../uploads/assessments')
  ];

  uploadDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${path.basename(dir)} directory exists`);
    } else {
      console.log(`❌ ${path.basename(dir)} directory missing`);
    }
  });

  console.log('\n🔍 Debug Summary:');
  console.log('- Check if server is running on port 5001');
  console.log('- Verify admin credentials are correct');
  console.log('- Ensure upload directories exist');
  console.log('- Check file size and type restrictions');
  console.log('- Verify CORS settings allow file uploads');
};

debugUpload().catch(console.error);

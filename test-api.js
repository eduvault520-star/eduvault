// Simple test to verify API configuration
const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('Testing backend API...');
    
    // Test health endpoint
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend is running:', response.data);
    
    // Test institutions endpoint
    const institutionsResponse = await axios.get('http://localhost:5000/api/institutions');
    console.log('✅ Institutions endpoint working, found:', institutionsResponse.data.institutions?.length || 0, 'institutions');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on port 5000');
      console.log('Please start the backend server first:');
      console.log('cd backend && npm run dev');
    } else {
      console.error('❌ API Error:', error.response?.data || error.message);
    }
  }
};

testAPI();

const axios = require('axios');
require('dotenv').config();

const testContentApproval = async () => {
  console.log('🧪 Testing Content Approval Endpoints');
  console.log('=====================================');

  try {
    // First, login as super admin
    console.log('\n1. Logging in as super admin...');
    console.log('📧 Using email: superadmin@eduvault.co.ke');
    console.log('🔑 Using password: admin123');
    
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'superadmin@eduvault.co.ke',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test the content-approval/pending endpoint
    console.log('\n2. Testing /api/content-approval/pending...');
    try {
      const pendingResponse = await axios.get('http://localhost:5001/api/content-approval/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Content approval endpoint working');
      console.log('📊 Pending content items:', pendingResponse.data.totalPending);
    } catch (error) {
      console.log('❌ Content approval endpoint failed');
      console.log('📊 Status:', error.response?.status);
      console.log('📋 Error:', error.response?.data?.message || error.message);
      console.log('📋 Full error:', error.response?.data);
    }

    // Test the admin dashboard endpoint
    console.log('\n3. Testing /api/admin/dashboard...');
    try {
      const dashboardResponse = await axios.get('http://localhost:5001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Admin dashboard endpoint working');
      console.log('📊 Dashboard stats:', Object.keys(dashboardResponse.data.stats));
    } catch (error) {
      console.log('❌ Admin dashboard endpoint failed');
      console.log('📊 Status:', error.response?.status);
      console.log('📋 Error:', error.response?.data?.message || error.message);
    }

    // Test with mini admin
    console.log('\n4. Testing with mini admin...');
    const miniLoginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@eduvault.co.ke',
      password: 'miniadmin123'
    });

    const miniToken = miniLoginResponse.data.token;
    console.log('✅ Mini admin login successful');

    try {
      const miniDashboardResponse = await axios.get('http://localhost:5001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${miniToken}`
        }
      });
      
      console.log('✅ Mini admin dashboard access working');
    } catch (error) {
      console.log('❌ Mini admin dashboard access failed');
      console.log('📊 Status:', error.response?.status);
      console.log('📋 Error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📋 Data:', error.response.data);
    }
  }
};

testContentApproval().catch(console.error);

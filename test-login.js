// Test login endpoint specifically
const http = require('http');

const testLogin = () => {
  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Testing login endpoint...');
  console.log('POST http://localhost:5000/api/auth/login');
  console.log('Body:', postData);

  const req = http.request(options, (res) => {
    let data = '';
    
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 401) {
        console.log('✅ Login endpoint is working (401 = invalid credentials expected)');
      } else if (res.statusCode === 200) {
        console.log('✅ Login endpoint is working (200 = login successful)');
      } else {
        console.log(`⚠️ Unexpected status code: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Error testing login:', err.message);
  });

  req.setTimeout(5000, () => {
    console.log('❌ Request timeout');
    req.destroy();
  });

  req.write(postData);
  req.end();
};

testLogin();

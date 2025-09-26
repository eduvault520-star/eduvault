// Simple test to check if backend is accessible
const http = require('http');

const testBackend = (port) => {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ Backend responding on port ${port}:`, data);
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Backend not accessible on port ${port}:`, err.message);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log(`❌ Timeout connecting to port ${port}`);
      req.destroy();
      resolve(false);
    });
  });
};

const testPorts = async () => {
  console.log('Testing backend connectivity...\n');
  
  const ports = [5000, 5001, 3001, 8000];
  
  for (const port of ports) {
    await testBackend(port);
  }
  
  console.log('\nIf no backend is responding, you need to start it:');
  console.log('cd backend && npm run dev');
};

testPorts();

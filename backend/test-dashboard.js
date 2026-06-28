const axios = require('axios');

async function testAll() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'arun@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('Login success');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test endpoints
    const endpoints = [
      '/api/quotations',
      '/api/clients',
      '/api/company',
      '/api/auth/me',
      '/api/auth/sessions'
    ];
    
    for (const ep of endpoints) {
      try {
        const res = await axios.get(`http://localhost:5000${ep}`, { headers });
        console.log(`SUCCESS: ${ep} -> ${res.status}`);
      } catch (err) {
        console.error(`FAIL: ${ep} -> ${err.response ? err.response.status : err.message}`);
        if (err.response) console.error(err.response.data);
      }
    }
    
  } catch (err) {
    console.log('Login failed', err.response ? err.response.data : err.message);
  }
}

testAll();

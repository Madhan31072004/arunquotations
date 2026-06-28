const axios = require('axios');

async function testLogin() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'arun@demo.com',
      password: 'password123'
    });
    
    console.log('Login success! Token:', loginRes.data.token.substring(0, 10) + '...');
    console.log('User:', loginRes.data.user);
    
    const token = loginRes.data.token;
    
    console.log('Testing /api/quotations...');
    const qRes = await axios.get('http://localhost:5000/api/quotations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Quotations status:', qRes.status);
    console.log('Quotations count:', qRes.data.length);
    
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();

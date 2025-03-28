import fetch from 'node-fetch';

describe('Test GET /test-llama', () => {
  test('should return valid response', async () => {
    const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
    const url = `${BASE_URL}/test-llama`;
    
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },

    };

    console.log('Testing endpoint:', url);
    console.log('Method:', 'GET');

    
    const response = await fetch(url, options);
    
    console.log('Status:', response.status);
    
    let responseData;
    try {
      responseData = await response.json();
      console.log('Response:', JSON.stringify(responseData, null, 2));
    } catch (err) {
      const text = await response.text();
      console.log('Response (text):', text);
      responseData = text;
    }
    
    expect(response.status).toBeLessThan(500); // No server errors
    
    if (response.ok) {
      expect(responseData).toBeDefined();
    }
  }, 30000);
});

const http = require('http');
const fs = require('fs');
const path = require('path');

// Check for arguments
if (process.argv.length < 3) {
  console.log('Usage: node direct-test.js <endpoint-path> [method]');
  console.log('Example: node direct-test.js /departments GET');
  console.log('Example: node direct-test.js /workforce/forecasting POST');
  process.exit(1);
}

// Try to load environment variables from .env.local
try {
  const dotenvPath = path.join(__dirname, '..', '.env.local');
  const envConfig = fs.readFileSync(dotenvPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.split('=').map(part => part.trim()))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  Object.keys(envConfig).forEach(key => {
    process.env[key] = process.env[key] || envConfig[key];
  });
  console.log('Loaded environment variables from .env.local');
} catch (error) {
  console.log('Could not load .env.local, using default environment variables');
}

// Get endpoint and method from arguments
const endpoint = process.argv[2];
const method = process.argv[3] || 'GET';

// Define default test values
process.env.TEST_DEPARTMENT_ID = process.env.TEST_DEPARTMENT_ID || '9af54c45-848c-48f0-9b76-681f58054076'; // Engineering department
process.env.TEST_SKILL_ID = process.env.TEST_SKILL_ID || '550e8400-e29b-41d4-a716-446655440000'; // Example UUID

// Determine request body based on the endpoint and method
function getRequestBody() {
  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
    return null;
  }

  if (endpoint.includes('/workforce/forecasting')) {
    return {
      department_id: process.env.TEST_DEPARTMENT_ID,
      months: 6
    };
  }
  
  if (endpoint.includes('/workforce/skill-gap')) {
    return {
      department_id: process.env.TEST_DEPARTMENT_ID,
      skill_id: process.env.TEST_SKILL_ID
    };
  }
  
  if (endpoint.includes('/workforce/workload')) {
    return {
      department_id: process.env.TEST_DEPARTMENT_ID
    };
  }
  
  if (endpoint.includes('/workforce/project-feasibility')) {
    return {
      project_name: "Test Project",
      required_skills: ["JavaScript", "React"],
      estimated_duration: 3,
      deadline: "2023-12-31"
    };
  }
  
  // Default empty body for POST/PUT/PATCH
  return {};
}

// Prepare the request
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const url = new URL(`${BASE_URL}${endpoint}`);
const requestBody = getRequestBody();

const options = {
  hostname: url.hostname,
  port: url.port || 3000,
  path: url.pathname,
  method: method,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Log request details
console.log(`\n📤 REQUEST: ${method} ${url}`);
if (requestBody) {
  console.log('📋 REQUEST BODY:', JSON.stringify(requestBody, null, 2));
}

// Make the request
const req = http.request(options, (res) => {
  let data = '';
  
  // Log response status
  console.log(`\n📥 RESPONSE STATUS: ${res.statusCode} ${res.statusMessage}`);
  console.log('📋 RESPONSE HEADERS:', JSON.stringify(res.headers, null, 2));
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      console.log('📋 RESPONSE (JSON):', JSON.stringify(jsonData, null, 2));
    } catch (e) {
      // If not JSON, show as text
      console.log('📋 RESPONSE (TEXT):', data);
    }
    
    // Exit with appropriate code
    process.exit(res.statusCode >= 400 ? 1 : 0);
  });
});

req.on('error', (error) => {
  console.error(`❌ ERROR: ${error.message}`);
  process.exit(1);
});

// Send request body if needed
if (requestBody) {
  req.write(JSON.stringify(requestBody));
}

req.end(); 
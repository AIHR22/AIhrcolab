const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  console.log('No .env.local file found, using default environment variables.');
}

// Default values for testing
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user-id';
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true';

// Define specific routes to test
const routesToTest = [
  { path: '/employees', method: 'GET' },
  { path: '/employees', method: 'POST' },
  { path: '/employees/[id]', method: 'GET' },
  { path: '/employees/[id]', method: 'PUT' },
  { path: '/employees/[id]', method: 'DELETE' },
  { path: '/projects', method: 'GET' },
  { path: '/projects', method: 'POST' },
  { path: '/projects/[id]', method: 'GET' },
  { path: '/projects/[id]', method: 'PUT' },
  { path: '/projects/[id]', method: 'DELETE' },
  { path: '/payroll', method: 'GET' },
  { path: '/payroll', method: 'POST' },
  { path: '/payroll/[id]', method: 'GET' },
  { path: '/payroll/[id]', method: 'PUT' },
  { path: '/payroll/[id]', method: 'DELETE' },
  { path: '/revenue', method: 'GET' },
  { path: '/revenue', method: 'POST' },
  { path: '/revenue/[id]', method: 'GET' },
  { path: '/revenue/[id]', method: 'PUT' },
  { path: '/revenue/[id]', method: 'DELETE' },
  { path: '/skills', method: 'GET' },
  { path: '/skills', method: 'POST' },
  { path: '/skills/[id]', method: 'GET' },
  { path: '/skills/[id]', method: 'PUT' },
  { path: '/skills/[id]', method: 'DELETE' },
];

const generateRequestBody = (route, method) => {
  // Simple test data based on route pattern
  if (route.includes('/employees') && (method === 'POST' || method === 'PUT')) {
    return {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      position: 'Test Position',
      hire_date: new Date().toISOString().split('T')[0],
    };
  }
  
  if (route.includes('/projects') && (method === 'POST' || method === 'PUT')) {
    return {
      name: 'Test Project',
      description: 'Test project description',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  }

  if (route.includes('/revenue') && (method === 'POST' || method === 'PUT')) {
    return {
      amount: 1000,
      date: new Date().toISOString().split('T')[0],
      source: 'Test Source',
      description: 'Test revenue description',
    };
  }

  if (route.includes('/payroll') && (method === 'POST' || method === 'PUT')) {
    return {
      employee_id: '00000000-0000-0000-0000-000000000001',
      payment_date: new Date().toISOString().split('T')[0],
      base_salary: 5000,
      bonus: 500,
      deductions: 1000,
    };
  }

  if (route.includes('/skills') && (method === 'POST' || method === 'PUT')) {
    return {
      name: 'Test Skill',
      category: 'Technical',
      description: 'Test skill description',
    };
  }

  // Default test body for any other routes
  return {
    test: true,
    timestamp: new Date().toISOString(),
  };
};

const testEndpoint = async (route, method, testId) => {
  const url = `${API_URL}${route.path.replace(/\[([^\]]+)\]/g, (_, param) => {
    // If testId is provided and the parameter is 'id', use that
    if (param === 'id' && testId) {
      return testId;
    }
    
    // Use a realistic test UUID for IDs
    if (param === 'id') {
      return '00000000-0000-0000-0000-000000000001';
    }
    
    return 'test';
  })}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (BYPASS_AUTH) {
    headers['x-test-user-id'] = TEST_USER_ID;
    headers['x-test-email'] = TEST_EMAIL;
  }

  const requestOptions = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'DELETE') {
    requestOptions.body = JSON.stringify(generateRequestBody(route.path, method));
  }

  try {
    const startTime = Date.now();
    const response = await fetch(url, requestOptions);
    const endTime = Date.now();
    const duration = endTime - startTime;

    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    const success = response.status >= 200 && response.status < 300;
    const timingColor = duration < 100 ? chalk.green : duration < 500 ? chalk.yellow : chalk.red;
    
    console.log(
      `${success ? chalk.green("✓") : chalk.red("✗")} ${method} ${route.path} - ${response.status} ${response.statusText} ${timingColor(`[${duration}ms]`)}`
    );

    if (!success) {
      const errorMessage = typeof responseData === 'object' && responseData.error 
        ? responseData.error 
        : JSON.stringify(responseData).substring(0, 100);
      console.log(chalk.red(`  Error: ${errorMessage}`));
    }

    // Extract ID from response data if it's a POST request
    let extractedId = null;
    if (method === 'POST' && success && responseData && responseData.id) {
      extractedId = responseData.id;
    }

    return {
      route: route.path,
      method,
      url,
      success,
      status: response.status,
      statusText: response.statusText,
      response: responseData,
      error: !success && responseData && responseData.error ? responseData.error : null,
      duration,
      extractedId,
    };
  } catch (error) {
    console.log(chalk.red(`✗ ${method} ${route.path} - Failed to connect: ${error.message}`));
    return {
      route: route.path,
      method,
      success: false,
      error: error.message,
      response: null,
      status: "CONNECTION_ERROR",
    };
  }
};

// Main function to run all tests
const runAllTests = async () => {
  const startTime = Date.now();
  console.log(chalk.cyan(`Starting API tests on ${API_URL}...`));
  console.log(chalk.cyan("Loading environment variables from .env.local..."));
  
  // Check if server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      console.log(chalk.red("Warning: Server is not responding correctly. Tests may fail."));
    }
  } catch (error) {
    console.log(chalk.red(`Error: Cannot connect to server at ${BASE_URL}. Is it running?`));
    return [];
  }

  console.log(chalk.cyan(`Testing ${routesToTest.length} endpoints...`));
  console.log("");
  
  const results = [];
  const idsMap = new Map();

  // Group routes by base path for cleaner testing flow
  const routeGroups = {};
  routesToTest.forEach(route => {
    const basePath = route.path.split('/')[1]; // Gets the first segment after /
    if (!routeGroups[basePath]) {
      routeGroups[basePath] = [];
    }
    routeGroups[basePath].push(route);
  });

  // Test routes by groups
  for (const [group, groupRoutes] of Object.entries(routeGroups)) {
    console.log(chalk.yellow(`\nTesting ${group} endpoints:`));
    
    for (const route of groupRoutes) {
      // For routes with an ID parameter, check if we have a corresponding ID from a POST request
      let idToUse = null;
      if (route.path.includes('[id]')) {
        const basePath = route.path.split('/[id]')[0];
        idToUse = idsMap.get(basePath);
      }
      
      const result = await testEndpoint(route, route.method, idToUse);
      results.push(result);
      
      // If this was a successful POST request that returned an ID, store it for later use with ID endpoints
      if (result.success && result.method === 'POST' && result.extractedId) {
        const basePath = route.path;
        idsMap.set(basePath, result.extractedId);
      }
    }
  }

  // Calculate success rate
  const totalEndpoints = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalEndpoints - successfulTests;
  const successRate = ((successfulTests / totalEndpoints) * 100).toFixed(1);
  
  // Print a summary of the results
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log("");
  console.log(chalk.yellow("=".repeat(80)));
  console.log(chalk.yellow(`API Testing Summary (Completed in ${duration.toFixed(2)}s):`));
  console.log(chalk.yellow("=".repeat(80)));
  console.log(chalk.cyan(`Total endpoints tested: ${totalEndpoints}`));
  console.log(chalk.green(`Successful: ${successfulTests} (${successRate}%)`));
  console.log(chalk.red(`Failed: ${failedTests} (${(100 - successRate).toFixed(1)}%)`));
  
  if (failedTests > 0) {
    console.log("");
    console.log(chalk.red("Failed endpoints:"));
    for (const result of results.filter(r => !r.success)) {
      console.log(chalk.red(`  ${result.method} ${result.route} - ${result.status}: ${result.error || 'Unknown error'}`));
    }
  }
  
  // Save the results to a file
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const resultsFilePath = path.join(process.cwd(), "tests", `api-test-results-${timestamp}.json`);
  
  try {
    // Ensure the tests directory exists
    if (!fs.existsSync(path.join(process.cwd(), "tests"))) {
      fs.mkdirSync(path.join(process.cwd(), "tests"));
    }
    
    const resultData = {
      summary: {
        totalEndpoints,
        successfulTests,
        failedTests,
        successRate: `${successRate}%`,
        timestamp: new Date().toISOString(),
        duration: `${duration.toFixed(2)}s`
      },
      results: results.map(result => ({
        ...result,
        response: result.response ? JSON.stringify(result.response).substring(0, 200) : null
      }))
    };
    
    fs.writeFileSync(resultsFilePath, JSON.stringify(resultData, null, 2));
    console.log(chalk.green(`\nFull test results saved to ${resultsFilePath}`));
  } catch (error) {
    console.error(chalk.red(`Error saving results: ${error.message}`));
  }
  
  return results;
};

// Main execution if run directly
if (require.main === module) {
  runAllTests();
} 
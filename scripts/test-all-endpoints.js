const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Load environment variables from .env.local
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

// Endpoints to ignore during testing (setup schemas and database-related endpoints)
const ignoredEndpoints = [
  '/setup*',
  '/setup/create-employees-table',
  '/setup/create-departments-table',
  '/setup/create-skills-table',
  '/setup/create-projects-table',
  '/setup/create-time-off-table',
  '/setup/create-performance-reviews-table',
  '/setup/create-employee-skills-table',
  '/setup/create-project-allocations-table',
  '/setup/seed',
  '/setup/time-off-tables',
  '/seed*',
  '/auth/test',
  '/auth/create-profile'
];

const findApiRoutes = () => {
  // Only test revenue endpoints
  return [
    { path: 'revenue/forecast', method: 'POST' },
    { path: 'revenue/metrics?periodType=monthly&date=2025-04-01', method: 'GET' },
    { path: 'revenue', method: 'GET' },
    { path: 'revenue', method: 'POST' },
    { path: 'revenue/[id]', method: 'GET' },
    { path: 'revenue/[id]', method: 'PUT' },
    { path: 'revenue/[id]', method: 'DELETE' }
  ];

  /* Original route discovery code:
  const apiDir = path.join(process.cwd(), 'app', 'api');
  const routes = [];

  const findRoutesInDir = (dir, basePath = '') => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const newBasePath = path.join(basePath, file);
        const routeFiles = fs.readdirSync(filePath);
        
        // Check if this directory has a route file
        if (routeFiles.some(f => f === 'route.js' || f === 'route.ts')) {
          const routePath = path.join(basePath, file);
          const methods = getMethodsFromRouteFile(path.join(filePath, 'route.js')) || 
                        getMethodsFromRouteFile(path.join(filePath, 'route.ts')) || 
                        ['GET'];
          
          for (const method of methods) {
            routes.push({ path: routePath.replace(/\\/g, '/'), method });
          }
        }
        
        findRoutesInDir(filePath, newBasePath);
      } else if ((file === 'route.js' || file === 'route.ts') && basePath) {
        const methods = getMethodsFromRouteFile(filePath) || ['GET'];
        
        for (const method of methods) {
          routes.push({ path: basePath.replace(/\\/g, '/'), method });
        }
      }
    }
  };

  const getMethodsFromRouteFile = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const methods = [];
    
    // Look for export async function METHOD or export function METHOD patterns
    const methodRegex = /export\s+(async)?\s*function\s+(GET|POST|PUT|DELETE|PATCH)/g;
    let match;
    
    while ((match = methodRegex.exec(content)) !== null) {
      methods.push(match[2]);
    }
    
    return methods.length > 0 ? methods : null;
  };

  findRoutesInDir(apiDir);
  return routes;
  */
};

const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const TEST_REVENUE_ID = '00000000-0000-0000-0000-000000000002';

const generateRequestBody = (route, method) => {
  if (route.includes('revenue')) {
    if (route.includes('forecast')) {
      return {
        tenant_id: TEST_TENANT_ID,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_type: 'monthly'
      };
    }
    if (method === 'POST' || method === 'PUT') {
      return {
        tenant_id: TEST_TENANT_ID,
        amount: 10000,
        period_date: new Date().toISOString().split('T')[0],
        period_type: 'monthly',
        is_projected: false,
        growth_rate: 0.05,
        company_wide: true
      };
    }
  }

  // Original request body generation:
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
  
  if (route.includes('/departments') && (method === 'POST' || method === 'PUT')) {
    return {
      name: 'Test Department',
      description: 'Test department description',
    };
  }
  
  if (route.includes('/skills') && (method === 'POST' || method === 'PUT')) {
    return {
      name: 'Test Skill',
      category: 'Technical',
      description: 'Test skill description',
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

  // Default test body for any other routes
  return {
    test: true,
    timestamp: new Date().toISOString(),
  };
};

const testEndpoint = async (route, method, testId) => {
  const url = `${BASE_URL}/api/${route.path.replace(/^\//, '')}`;
  const fullUrl = url.replace(/\[([^\]]+)\]/g, (_, param) => {
    if (param === 'id' && testId) {
      return testId;
    }
    // Use a realistic test UUID for IDs
    if (param === 'id') {
      return TEST_REVENUE_ID;
    }
    return 'test';
  });

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

  // Find all API routes
  const routes = findApiRoutes();
  
  // Filter out ignored endpoints
  const filteredRoutes = routes.filter(route => {
    return !ignoredEndpoints.some(pattern => {
      if (pattern.endsWith('*')) {
        // Check if the route path starts with the pattern (minus the *)
        return route.path.startsWith(pattern.slice(0, -1));
      }
      return route.path === pattern;
    });
  });
  
  console.log(chalk.cyan(`Found ${routes.length} API endpoints (${routes.length - filteredRoutes.length} ignored).`));
  console.log(chalk.cyan(`Testing ${filteredRoutes.length} endpoints...`));
  console.log("");
  
  const results = [];
  const idsMap = new Map();

  // Group routes by base path for cleaner testing flow
  const routeGroups = {};
  filteredRoutes.forEach(route => {
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

// Package test results for reporting
const packageTestResults = (results) => {
  const totalEndpoints = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalEndpoints - successfulTests;
  const successRate = ((successfulTests / totalEndpoints) * 100).toFixed(1);
  
  return {
    summary: {
      totalEndpoints,
      successfulTests,
      failedTests,
      successRate,
    },
    details: results,
  };
};

// Main execution if run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length >= 2) {
    // If path and method are provided, test a single endpoint
    const path = args[0];
    const method = args[1].toUpperCase();
    
    console.log(`Testing single endpoint: ${method} ${path}`);
    testEndpoint({ path, method }).then(result => {
      console.log(JSON.stringify(result, null, 2));
    });
  } else {
    // Otherwise run all tests
    runAllTests();
  }
} 
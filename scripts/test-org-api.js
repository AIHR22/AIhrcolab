// Test script for organization chart API
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

async function testOrgApiEndpoint() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/organization/generate`;
  
  // Test prompts to generate charts
  const testPrompts = [
    {
      name: "basic",
      prompt: "Create a basic organization chart"
    },
    {
      name: "brad-marketing",
      prompt: "Create an org chart with Brad as head of Marketing"
    },
    {
      name: "farzana-sales",
      prompt: "Create an org chart with Farzana in Sales"
    }
  ];
  
  // Create the tests directory if it doesn't exist
  const testsDir = path.join(process.cwd(), 'tests');
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir);
  }
  
  // Run tests for each prompt
  for (const test of testPrompts) {
    console.log(`\nTesting API with prompt: "${test.prompt}"`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: test.prompt,
          structureType: 'detailed',
          useAI: false // Set to false to test the fallback generator
        })
      });
      
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      // Save result to file
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `tests/api-org-chart-${test.name}-${timestamp}.json`;
      
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      console.log(`Test result saved to ${filename}`);
      
      // Check if Brad or Farzana are in the result
      const findEmployeeInChart = (name, chart) => {
        if (chart.name && chart.name.includes(name)) {
          return { 
            found: true, 
            node: chart, 
            path: [chart.name] 
          };
        }
        
        if (!chart.children) return { found: false };
        
        for (const child of chart.children) {
          const result = findEmployeeInChart(name, child);
          if (result.found) {
            return { 
              found: true, 
              node: result.node, 
              path: [chart.name, ...result.path] 
            };
          }
        }
        
        return { found: false };
      };
      
      // Check for Brad and Farzana
      const bradResult = findEmployeeInChart('Brad', data);
      if (bradResult.found) {
        console.log(`Brad found: ${bradResult.node.title} in ${bradResult.node.department}`);
        console.log(`Path: ${bradResult.path.join(' > ')}`);
      } else {
        console.log('Brad not found in the chart');
      }
      
      const farzanaResult = findEmployeeInChart('Farzana', data);
      if (farzanaResult.found) {
        console.log(`Farzana found: ${farzanaResult.node.title} in ${farzanaResult.node.department}`);
        console.log(`Path: ${farzanaResult.path.join(' > ')}`);
      } else {
        console.log('Farzana not found in the chart');
      }
      
    } catch (error) {
      console.error(`Error testing ${test.name}:`, error.message);
    }
  }
}

// Run test
testOrgApiEndpoint()
  .then(() => console.log('\nAPI tests completed'))
  .catch(err => console.error('Test error:', err))
  .finally(() => process.exit()); 
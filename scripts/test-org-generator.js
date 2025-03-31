// Simple test script for organization chart generator
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create our own generateSimpleOrgChart function that mimics the one in the API route
function generateSimpleOrgChart(
  employees,
  departments,
  structureType,
  promptText = ""
) {
  console.log("Simulating org chart generation with the following inputs:");
  console.log(`Prompt: ${promptText}`);
  console.log(`Structure type: ${structureType}`);
  
  // Extract potential employee names from the prompt with improved name matching
  const promptWords = promptText.split(/\s+/);
  // Parse the prompt more carefully to extract placement instructions
  const requestedPlacements = new Map();
  
  // Look for patterns like "Brad as head of Engineering" or "Farzana in Marketing"
  const headOfPattern = /(\w+)\s+as\s+(?:head|manager|director|lead)(?:\s+of)?\s+(\w+)/gi;
  const inDeptPattern = /(\w+)\s+in\s+(?:the\s+)?(\w+)/gi;
  
  let headOfMatch;
  while ((headOfMatch = headOfPattern.exec(promptText)) !== null) {
    const employeeName = headOfMatch[1].toLowerCase();
    const deptName = headOfMatch[2].toLowerCase();
    requestedPlacements.set(employeeName, {
      department: deptName,
      isManager: true
    });
  }
  
  let inDeptMatch;
  while ((inDeptMatch = inDeptPattern.exec(promptText)) !== null) {
    const employeeName = inDeptMatch[1].toLowerCase();
    const deptName = inDeptMatch[2].toLowerCase();
    // Only set if not already set as a manager
    if (!requestedPlacements.has(employeeName)) {
      requestedPlacements.set(employeeName, {
        department: deptName,
        isManager: false
      });
    }
  }
  
  // Find matching employees - with improved name matching logic
  const mentionedEmployees = employees.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const firstName = emp.first_name.toLowerCase();
    const lastName = emp.last_name.toLowerCase();
    
    // Check if any of the potential names match this employee
    return promptWords.some(name => {
      const lowerName = name.toLowerCase().replace(/[.,;:!?]$/g, ''); // Remove punctuation
      
      // Direct matches
      if (fullName.includes(lowerName)) return true;
      if (firstName === lowerName || lastName === lowerName) return true;
      
      // Partial matches (for names like Brad/Bradley, Farzana/Farzan)
      if (firstName.startsWith(lowerName) && lowerName.length >= 4) return true;
      if (lastName.startsWith(lowerName) && lowerName.length >= 4) return true;
      
      return false;
    });
  });
  
  console.log(`Found ${mentionedEmployees.length} mentioned employees`);
  mentionedEmployees.forEach(emp => console.log(`- ${emp.first_name} ${emp.last_name} (${emp.position || 'No position'})`));
  
  // Enrich mentioned employees with their requested placements
  const enrichedMentionedEmployees = mentionedEmployees.map(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const firstName = emp.first_name.toLowerCase();
    const lastName = emp.last_name.toLowerCase();
    
    // Find if this employee has a requested placement
    // Convert Map entries to array to avoid TypeScript downlevelIteration error
    for (const [name, placement] of Array.from(requestedPlacements.entries())) {
      if (fullName.includes(name) || firstName === name || lastName === name ||
          (firstName.startsWith(name) && name.length >= 4) ||
          (lastName.startsWith(name) && name.length >= 4)) {
            
        // Find matching department
        const requestedDepartment = departments.find(d => 
          d.name.toLowerCase().includes(placement.department)
        );
        
        if (requestedDepartment) {
          console.log(`Found requested placement for ${emp.first_name} ${emp.last_name}: department=${requestedDepartment.name}, isManager=${placement.isManager}`);
          return {
            ...emp,
            requested_department_id: requestedDepartment.id,
            requested_department_name: requestedDepartment.name,
            requested_is_manager: placement.isManager
          };
        }
      }
    }
    
    return emp;
  });
  
  // Create CEO node
  const ceoEmployee = employees.find(e => 
    e.position?.toLowerCase().includes('ceo') || 
    e.position?.toLowerCase().includes('chief executive')
  );
  
  const rootNode = {
    id: ceoEmployee?.id || 'org-1',
    name: ceoEmployee ? `${ceoEmployee.first_name} ${ceoEmployee.last_name}` : 'CEO',
    title: ceoEmployee?.position || 'CEO',
    department: 'Executive',
    children: []
  };
  
  // Group employees by department
  const deptEmployees = {};
  
  employees.forEach(emp => {
    const deptId = emp.department_id;
    if (!deptEmployees[deptId]) {
      deptEmployees[deptId] = [];
    }
    deptEmployees[deptId].push(emp);
  });
  
  // Find mentioned departments or fallback to all departments
  let deptsToBuild = departments;
  
  // Extract department names from the prompt
  const departmentWords = promptText.toLowerCase().match(/\b(engineering|marketing|sales|finance|hr|human resources|operations|product|executive|management)\b/gi) || [];
  
  if (departmentWords.length > 0) {
    deptsToBuild = departments.filter(d => {
      const deptName = d.name.toLowerCase();
      return departmentWords.some(word => 
        deptName.includes(word.toLowerCase())
      );
    });
    
    if (deptsToBuild.length === 0) {
      // If no departments matched, fall back to all departments
      deptsToBuild = departments;
    }
  }
  
  // Add departments for any requested placements
  enrichedMentionedEmployees.forEach(emp => {
    if (emp.requested_department_id) {
      const dept = departments.find(d => d.id === emp.requested_department_id);
      if (dept && !deptsToBuild.some(d => d.id === dept.id)) {
        deptsToBuild.push(dept);
      }
    }
  });
  
  console.log(`Building org chart with departments: ${deptsToBuild.map(d => d.name).join(', ')}`);
  
  // Create department nodes
  deptsToBuild.forEach(dept => {
    // Find employees in this department (including those requested to be in this department)
    const actualDeptEmps = deptEmployees[dept.id] || [];
    
    // Find employees requested to be in this department
    const requestedDeptEmps = enrichedMentionedEmployees.filter(e => 
      e.requested_department_name?.toLowerCase() === dept.name.toLowerCase()
    );
    
    const emps = [...actualDeptEmps];
    
    // Check if any mentioned employees are in this department or requested to be
    const mentionedDeptEmps = enrichedMentionedEmployees.filter(e => 
      e.department_id === dept.id || e.requested_department_id === dept.id
    );
    
    console.log(`Department ${dept.name} has ${mentionedDeptEmps.length} mentioned employees`);
    
    // Choose department head prioritizing requested placements:
    // 1. Mentioned employee requested to be head of this department
    // 2. Mentioned employee with manager/head/lead position in this department
    // 3. Any mentioned employee in this department
    // 4. Employee with manager/head/lead position
    // 5. First employee
    const deptHead = 
      mentionedDeptEmps.find(e => e.requested_is_manager && e.requested_department_id === dept.id) ||
      mentionedDeptEmps.find(e => 
        e.position?.toLowerCase().includes('head') || 
        e.position?.toLowerCase().includes('manager') ||
        e.position?.toLowerCase().includes('director') ||
        e.position?.toLowerCase().includes('lead')
      ) ||
      mentionedDeptEmps[0] ||
      emps.find(e => 
        e.position?.toLowerCase().includes('head') || 
        e.position?.toLowerCase().includes('manager') ||
        e.position?.toLowerCase().includes('director') ||
        e.position?.toLowerCase().includes('lead')
      ) || 
      (emps.length > 0 ? emps[0] : null);
    
    if (deptHead || emps.length > 0 || requestedDeptEmps.length > 0) {
      const deptNode = {
        id: deptHead?.id || `dept-${dept.id}`,
        name: deptHead ? `${deptHead.first_name} ${deptHead.last_name}` : dept.name,
        title: deptHead ? deptHead.position || `Head of ${dept.name}` : `Head of ${dept.name}`,
        department: dept.name,
        children: [],
        metadata: {
          employeeCount: emps.length,
          budget: emps.length * 100000 // Simple budget estimation
        }
      };
      
      // Add other employees as children
      emps.forEach(emp => {
        // Skip department head
        if (deptHead && emp.id === deptHead.id) return;
        
        // Prioritize mentioned employees
        const isMentioned = enrichedMentionedEmployees.some(m => m.id === emp.id);
        
        // Always include mentioned employees and heads of departments
        // For others, only include if we're doing a detailed view
        if (isMentioned || structureType === 'detailed' || emp.position?.toLowerCase().includes('lead')) {
          deptNode.children.push({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            title: emp.position || `${dept.name} Staff`,
            department: dept.name,
            children: []
          });
        }
      });
      
      // Add employees requested to be in this department but not already in it
      requestedDeptEmps.forEach(emp => {
        if (!emps.some(e => e.id === emp.id) && (!deptHead || emp.id !== deptHead.id)) {
          deptNode.children.push({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            title: emp.position || `${dept.name} Staff`,
            department: dept.name,
            children: []
          });
        }
      });
      
      rootNode.children.push(deptNode);
    }
  });
  
  // Make sure all mentioned employees are included even if they weren't included above
  enrichedMentionedEmployees.forEach(emp => {
    // Check if this employee is already in the chart
    const isAlreadyIncluded = (
      // Check if they're the CEO
      (rootNode.id === emp.id) ||
      // Check if they're a department head
      rootNode.children.some(deptNode => deptNode.id === emp.id) ||
      // Check if they're included as a child of a department
      rootNode.children.some(deptNode => 
        deptNode.children.some(childNode => childNode.id === emp.id)
      )
    );
    
    if (!isAlreadyIncluded) {
      // If not included, add them to their department
      const deptId = emp.requested_department_id || emp.department_id;
      const deptName = departments.find(d => d.id === deptId)?.name || 'Unknown';
      
      // Find the department node
      let deptNode = rootNode.children.find(d => d.department === deptName);
      
      if (!deptNode) {
        // If department doesn't exist in the chart yet, create it
        deptNode = {
          id: `dept-${deptId}`,
          name: deptName,
          title: `${deptName} Department`,
          department: deptName,
          children: [],
          metadata: {
            employeeCount: deptEmployees[deptId]?.length || 1,
            budget: (deptEmployees[deptId]?.length || 1) * 100000
          }
        };
        rootNode.children.push(deptNode);
      }
      
      // Add the employee to the department
      deptNode.children.push({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        title: emp.position || `${deptName} Staff`,
        department: deptName,
        children: []
      });
    }
  });
  
  return rootNode;
}

async function testOrgGenerator() {
  console.log('Testing organization chart generator with employee placements...');
  
  // Fetch employees and departments
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('*');
  
  if (empError) {
    console.error('Error fetching employees:', empError);
    return;
  }
  
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*');
  
  if (deptError) {
    console.error('Error fetching departments:', deptError);
    return;
  }
  
  console.log(`Found ${employees.length} employees and ${departments.length} departments`);
  
  // Test different prompts
  const testPrompts = [
    {
      name: "Brad as head of Marketing",
      prompt: "Create an org chart with Brad as head of Marketing department"
    },
    {
      name: "Farzana in Engineering",
      prompt: "Create an org chart with Farzana in Engineering department"
    },
    {
      name: "Multiple placements",
      prompt: "Create an org chart with Brad as head of Marketing and Farzana in Sales"
    }
  ];
  
  // Create the tests directory if it doesn't exist
  const testsDir = path.join(process.cwd(), 'tests');
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir);
  }
  
  // Run tests
  for (const test of testPrompts) {
    console.log(`\nRunning test: ${test.name}`);
    console.log(`Prompt: ${test.prompt}`);
    
    // Generate organization chart
    const chart = generateSimpleOrgChart(employees, departments, 'detailed', test.prompt);
    
    // Save result to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `tests/org-chart-test-${test.name.replace(/\s+/g, '-')}-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(chart, null, 2));
    console.log(`Test result saved to ${filename}`);
    
    // Simple verification
    // Find Brad and Farzana in the chart
    const findEmployeeInChart = (name, chart) => {
      if (chart.name.includes(name)) {
        return { 
          found: true, 
          node: chart, 
          path: [chart.name] 
        };
      }
      
      for (const child of chart.children || []) {
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
    
    // Check Brad
    const bradResult = findEmployeeInChart('Brad', chart);
    if (bradResult.found) {
      console.log(`Brad found: ${bradResult.node.title} in ${bradResult.node.department}`);
      console.log(`Path: ${bradResult.path.join(' > ')}`);
    } else {
      console.log('Brad not found in the chart');
    }
    
    // Check Farzana
    const farzanaResult = findEmployeeInChart('Farzana', chart);
    if (farzanaResult.found) {
      console.log(`Farzana found: ${farzanaResult.node.title} in ${farzanaResult.node.department}`);
      console.log(`Path: ${farzanaResult.path.join(' > ')}`);
    } else {
      console.log('Farzana not found in the chart');
    }
  }
}

// Run the test
testOrgGenerator()
  .then(() => console.log('Tests completed'))
  .catch(err => console.error('Test error:', err))
  .finally(() => process.exit()); 
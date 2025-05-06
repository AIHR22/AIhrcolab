import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { OrgChartNode } from "@/types/organization"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Together AI API configuration
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"

// Llama model system prompt
const LLAMA_SYSTEM_PROMPT = 
  "You are an expert HR consultant specializing in organizational design. " +
  "Your task is to analyze a company description and generate an organizational structure. " + 
  "Respond ONLY with valid JSON matching the expected schema, with no additional text or explanation."

// Create the org_structures table if it doesn't exist
async function ensureOrgStructuresTable() {
  console.log("Checking if org_structures table exists")
  
  // Check if the table exists
  const { data, error } = await supabase
    .from('org_structures')
    .select('id')
    .limit(1)
  
  if (error && error.code === '42P01') {
    console.log("org_structures table doesn't exist, creating it now")
    
    // Table doesn't exist, create it
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.org_structures (
        id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        name TEXT NOT NULL,
        structure JSONB NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS org_structures_is_active_idx ON public.org_structures (is_active);
    `
    
    const { error: createError } = await supabase.rpc('pgql', { query: createTableQuery })
    
    if (createError) {
      console.error("Error creating org_structures table:", createError)
      return false
    }
    
    console.log("Successfully created org_structures table")
    return true
  }
  
  console.log("org_structures table already exists")
  return true
}

// Interface for Llama response
interface LlamaOrgResponse {
  structure_type?: string;
  company_size?: string;
  industry?: string;
  departments?: string[];
  positions?: string[];
  org_chart?: {
    name: string;
    title: string;
    department: string;
    children?: LlamaOrgNode[];
  };
}

interface LlamaOrgNode {
  name: string;
  title: string;
  department: string;
  children?: LlamaOrgNode[];
}

// Alternative response format with departments and heads
interface LlamaDepartmentResponse {
  name: string;
  head: string;
  employees: {
    name: string;
    position: string;
  }[];
}

// Alternative response format with reports
interface LlamaReportsResponse {
  name: string;
  reports?: {
    name: string;
    position?: string;
    reports?: LlamaReportsResponse[];
  }[];
}

async function fetchEmployeesAndDepartments() {
  // Fetch employees
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, first_name, last_name, position, department_id, email')
    .order('first_name')

  if (empError) {
    console.error('Error fetching employees:', empError)
    throw new Error('Failed to fetch employees')
  }

  // Fetch departments
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('id, name')
    .order('name')

  if (deptError) {
    console.error('Error fetching departments:', deptError)
    throw new Error('Failed to fetch departments')
  }

  return { employees, departments }
}

// Add proper debug logging
function debugLog(message: string, data?: any) {
  console.log(`[OrgChart Generator] ${message}`, data ? data : '')
}

async function generateOrgChartWithAI(prompt: string): Promise<OrgChartNode> {
  try {
    debugLog("Starting AI generation with prompt", prompt.substring(0, 100) + "...")
    
    // Fetch actual employees and departments
    const { employees, departments } = await fetchEmployeesAndDepartments()
    debugLog(`Fetched ${employees.length} employees and ${departments.length} departments`)

    // Create a mapping of department IDs to names
    const departmentMap = new Map(departments.map(d => [d.id, d.name]))

    // Create a mapping of employee IDs to full names
    const employeeMap = new Map(employees.map(e => [e.id, `${e.first_name} ${e.last_name}`]))

    // Extract potential employee names from the prompt with improved name matching
    const promptWords = prompt.split(/\s+/);
    // Parse the prompt more carefully to extract placement instructions
    const requestedPlacements = new Map<string, { department: string, isManager: boolean }>();
    
    // Look for patterns like "Brad as head of Engineering" or "Farzana in Marketing"
    const headOfPattern = /(\w+)\s+as\s+(?:head|manager|director|lead)(?:\s+of)?\s+(\w+)/gi;
    const inDeptPattern = /(\w+)\s+in\s+(?:the\s+)?(\w+)/gi;
    
    let headOfMatch;
    while ((headOfMatch = headOfPattern.exec(prompt)) !== null) {
      const employeeName = headOfMatch[1].toLowerCase();
      const deptName = headOfMatch[2].toLowerCase();
      requestedPlacements.set(employeeName, {
        department: deptName,
        isManager: true
      });
    }
    
    let inDeptMatch;
    while ((inDeptMatch = inDeptPattern.exec(prompt)) !== null) {
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
    
    debugLog(`Detected potential employee mentions: ${promptWords.join(', ')}`);
    debugLog(`Found matching employees: ${mentionedEmployees.map(e => `${e.first_name} ${e.last_name}`).join(', ')}`);

    const systemPrompt = `You are an expert in organizational design and HR management. 
    Your task is to generate a detailed organization chart based on the provided description,
    but you MUST ONLY use the following actual employees and departments from our database:

    Available Departments:
    ${departments.map(d => `- ${d.name}`).join('\n')}

    Available Employees:
    ${employees.map(e => `- ${e.first_name} ${e.last_name} (${e.position || 'No position'})`).join('\n')}
    
    Key employees mentioned in the prompt:
    ${mentionedEmployees.length > 0 
      ? mentionedEmployees.map(e => `- ${e.first_name} ${e.last_name} (${e.position || 'No position'})`).join('\n')
      : '- None specifically identified'}

    The output should be a JSON object representing a hierarchical organization structure.
    Each node should have:
    - id: a unique string identifier (use the actual employee id when available)
    - name: the person's name or department name
    - title: the position title (for positions)
    - department: the department name
    - children: array of child nodes
    - metadata: object containing additional info like employeeCount, budget, etc.
    
    IMPORTANT RULES:
    1. Only use employees and departments from the list above
    2. Make sure to include any specifically requested employees (${mentionedEmployees.map(e => `${e.first_name} ${e.last_name}`).join(', ')})
    3. Maintain the correct reporting relationships based on the prompt
    4. Keep employees in their actual departments
    5. Use actual employee positions where available
    6. Generate realistic metadata based on department sizes
    
    Example format:
    {
      "id": "org-1",
      "name": "CEO",
      "title": "Chief Executive Officer",
      "department": "Executive",
      "children": [
        {
          "id": "dept-1",
          "name": "Engineering",
          "title": "Head of Engineering",
          "department": "Engineering",
          "metadata": {
            "employeeCount": 50,
            "budget": 5000000
          },
          "children": [...]
        }
      ]
    }
    
    YOUR RESPONSE MUST BE VALID JSON ONLY - no additional text, no markdown formatting, just the JSON object.`

    debugLog("Sending request to Together AI")
    
    // Check if API key is available
    if (!TOGETHER_API_KEY) {
      throw new Error("Together AI API key is not configured")
    }
    
    // Add timeout for API request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60-second timeout
    
    const response = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: controller.signal
    })
    
    // Clear timeout
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      debugLog("Together AI API error", errorText)
      throw new Error(`Together AI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    debugLog("Received response from Together AI", data.choices ? data.choices[0].message.content.substring(0, 100) + "..." : "No choices returned")
    
    try {
      // Try to parse the response as JSON
      let jsonString = data.choices[0].message.content
      
      // Handle common JSON formatting issues
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\n/, '').replace(/\n```$/, '')
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\n/, '').replace(/\n```$/, '')
      }
      
      // Remove any trailing or leading non-JSON content
      const jsonRegex = /(\{[\s\S]*\})/;
      const match = jsonString.match(jsonRegex);
      if (match && match[1]) {
        jsonString = match[1];
      }
      
      // Fix common JSON issues that might cause parsing errors
      jsonString = jsonString
        // Remove trailing commas in arrays and objects
        .replace(/,\s*([}\]])/g, '$1')
        // Ensure string values are properly quoted
        .replace(/"([^"]*)":\s*'([^']*)'/g, '"$1":"$2"')
        // Handle escaped quotes in strings
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
      
      debugLog("Cleaned JSON string", jsonString.substring(0, 200) + "...")
      
      // Attempt to parse the JSON
      let generatedChart;
      try {
        generatedChart = JSON.parse(jsonString);
      } catch (parseError) {
        debugLog("Initial JSON parse error", parseError);
        // Try with a more aggressive approach - find anything that looks like JSON
        const objectRegex = /(\{[\s\S]*?\})/g;
        const matches = [...jsonString.matchAll(objectRegex)];
        
        if (matches.length > 0) {
          // Find the largest match which is likely the full JSON
          const largestMatch = matches.reduce((prev, current) => 
            (prev[1].length > current[1].length) ? prev : current
          );
          
          try {
            generatedChart = JSON.parse(largestMatch[1]);
            debugLog("Successfully parsed JSON using regex extraction");
          } catch (finalError) {
            throw new Error("Could not parse AI response into valid JSON");
          }
        } else {
          throw new Error("No valid JSON found in AI response");
        }
      }
      
      // Validate and clean the generated chart
      const validatedChart = validateAndCleanOrgChart(generatedChart, employees, departments);
      debugLog("Successfully generated and validated org chart");
      return validatedChart;
    } catch (error) {
      debugLog("Error parsing AI response", error)
      // Fall back to a simple org chart
      debugLog("Falling back to simple org chart")
      return generateSimpleOrgChart(employees, departments, "hierarchical", prompt)
    }
  } catch (error) {
    debugLog("Error in generateOrgChartWithAI", error)
    throw error
  }
}

function validateAndCleanOrgChart(
  chart: OrgChartNode,
  employees: any[],
  departments: any[]
): OrgChartNode {
  // Create maps for quick lookups
  const employeeMap = new Map(employees.map(e => [e.id, e]))
  const departmentMap = new Map(departments.map(d => [d.id, d.name]))

  function cleanNode(node: OrgChartNode): OrgChartNode | undefined {
    // If this is an employee node, ensure it exists in our database
    if (node.id.startsWith('emp-')) {
      const employee = employeeMap.get(node.id)
      if (!employee) {
        // If employee doesn't exist, remove this node
        return undefined
      }
      // Update node with actual employee data
      return {
        ...node,
        name: `${employee.first_name} ${employee.last_name}`,
        title: employee.position || node.title,
        department: departmentMap.get(employee.department_id) || node.department,
      }
    }

    // If this is a department node, ensure it exists in our database
    if (node.id.startsWith('dept-')) {
      const department = departments.find(d => d.name === node.department)
      if (!department) {
        // If department doesn't exist, remove this node
        return undefined
      }
    }

    // Clean children recursively
    if (node.children && node.children.length > 0) {
      node.children = node.children
        .map(child => cleanNode(child))
        .filter((child): child is OrgChartNode => child !== undefined)
    }

    return node
  }

  const cleanedChart = cleanNode(chart)
  if (!cleanedChart) {
    throw new Error("Failed to generate valid organization chart with existing employees and departments")
  }
  return cleanedChart
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const prompt: string = requestData.prompt || "";
    const structureType: string = requestData.structureType || "detailed";
    const useAI: boolean = requestData.useAI !== undefined ? requestData.useAI : true;

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: "Prompt is required" },
        { status: 400 }
      );
    }

    // Log request details to help debug
    console.log(`[OrgChart API] Processing request with prompt: ${prompt.substring(0, 50)}...`);
    console.log(`[OrgChart API] useAI: ${useAI}, structureType: ${structureType}`);

    // Fetch employees and departments data
    const { employees, departments } = await fetchEmployeesAndDepartments();
    console.log(`[OrgChart API] Fetched ${employees.length} employees and ${departments.length} departments`);

    let generatedChart;
    if (useAI && TOGETHER_API_KEY) {
      // Generate using AI
      console.log("[OrgChart API] Using AI generation");
      try {
        generatedChart = await generateWithAI(prompt, employees, departments, TOGETHER_API_KEY, structureType);
      } catch (aiError) {
        console.error("[OrgChart API] AI generation failed, falling back to simple generation", aiError);
        generatedChart = generateSimpleOrgChart(employees, departments, structureType, prompt);
      }
        } else {
      // Use simple generation
      console.log("[OrgChart API] Using simple generation");
      generatedChart = generateSimpleOrgChart(employees, departments, structureType, prompt);
    }

    // Store the generated chart in Supabase
    try {
      const { data: orgData, error: orgError } = await supabase
        .from("organization_charts")
        .insert([
          {
            name: "AI Generated Chart",
            description: prompt,
            structure: generatedChart,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
          .select()
        .single();

      if (orgError) {
        console.error("Error storing organization chart:", orgError);
        // Continue even if storage fails
        } else {
        console.log("[OrgChart API] Successfully stored chart in database");
      }
    } catch (storageError) {
      console.error("[OrgChart API] Error in storage operation:", storageError);
      // Continue execution even if storage fails
    }

    return NextResponse.json({
      success: true,
      data: generatedChart,
      message: "Organization chart generated successfully",
    });
  } catch (error) {
    console.error("Error generating organization chart:", error);
    
    // If primary generation fails, try the fallback
    try {
      console.log("Primary generation failed, trying fallback generation");
      const { employees, departments } = await fetchEmployeesAndDepartments();
      const requestData = await request.clone().json();
      const promptText: string = requestData.prompt || "";
      const structureType: string = requestData.structureType || "detailed";
      const fallbackChart = generateSimpleOrgChart(employees, departments, structureType, promptText);
      
      return NextResponse.json({
        success: true,
        data: fallbackChart,
        message: "Organization chart generated with fallback method",
      });
    } catch (fallbackError) {
      // If even the fallback fails, return the original error
      return NextResponse.json(
        { 
        success: false, 
          message: error instanceof Error ? error.message : "Failed to generate organization chart" 
        },
        { status: 500 }
      );
    }
  }
}

// Parse text-based org chart into structured format
function parseTextToOrgChart(
  text: string,
  employees: any[],
  departments: any[]
): OrgChartNode {
  console.log("Parsing text response to org chart");
  
  // Create CEO node
  const rootNode: OrgChartNode = {
    id: 'org-1',
    name: 'CEO',
    title: 'CEO',
    department: 'Executive',
    children: []
  };
  
  try {
    // Extract lines from the text
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let currentDeptNode: OrgChartNode | null = null;
    
    // Process each line
    lines.forEach(line => {
      // Skip the CEO line (already created)
      if (line.trim().toLowerCase() === 'ceo') return;
      
      // Check if this is a department head line (starts with ├── or ├─ or similar)
      if (line.match(/^[├│└]\s*─+\s*\[.*\]/)) {
        const nameMatch = line.match(/\[(.*?)\]/);
        const deptMatch = line.match(/\((.*?)\)/);
        
        if (nameMatch && nameMatch[1]) {
          const headName = nameMatch[1].trim();
          const deptName = deptMatch && deptMatch[1] ? deptMatch[1].trim() : 'Unknown';
          
          // Find matching employee
          const headEmployee = employees.find(e => 
            `${e.first_name} ${e.last_name}`.toLowerCase() === headName.toLowerCase()
          );
          
          // Find matching department
          const department = departments.find(d => 
            d.name.toLowerCase() === deptName.toLowerCase()
          );
          
          currentDeptNode = {
            id: headEmployee?.id || `dept-${Math.random().toString(36).substring(2, 9)}`,
            name: headName,
            title: `Head of ${deptName}`,
            department: deptName,
            children: []
          };
          
          rootNode.children.push(currentDeptNode);
        }
      } 
      // Check if this is an employee line (starts with │   ├── or similar)
      else if (currentDeptNode && line.match(/^[│\s]*[├└]\s*─+\s*\[.*\]/)) {
        const nameMatch = line.match(/\[(.*?)\]/);
        const posMatch = line.match(/\((.*?)\)/);
        
        if (nameMatch && nameMatch[1]) {
          const empName = nameMatch[1].trim();
          const position = posMatch && posMatch[1] ? posMatch[1].trim() : 'Staff';
          
          // Find matching employee
          const employee = employees.find(e => 
            `${e.first_name} ${e.last_name}`.toLowerCase() === empName.toLowerCase()
          );
          
          if (employee) {
            currentDeptNode.children.push({
              id: employee.id,
              name: empName,
              title: position,
              department: currentDeptNode.department,
              children: []
            });
          }
        }
      }
    });
    
    // If no departments were found, fall back to simple org chart
    if (rootNode.children.length === 0) {
      return generateSimpleOrgChart(employees, departments, 'hierarchical', text);
    }
    
    return rootNode;
  } catch (error) {
    console.error("Error parsing text to org chart:", error);
    return generateSimpleOrgChart(employees, departments, 'hierarchical', text);
  }
}

// Generate a simple organization chart when AI fails
function generateSimpleOrgChart(
  employees: any[],
  departments: any[],
  structureType: string,
  promptText: string = ""
): OrgChartNode {
  debugLog("Generating simple fallback org chart");
  
  // Extract potential employee names from the prompt with improved name matching
  const promptWords = promptText.split(/\s+/);
  // Parse the prompt more carefully to extract placement instructions
  const requestedPlacements = new Map<string, { department: string, isManager: boolean }>();
  
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
  
  debugLog(`Found ${mentionedEmployees.length} mentioned employees for fallback chart`);
  mentionedEmployees.forEach(emp => debugLog(`- ${emp.first_name} ${emp.last_name} (${emp.position || 'No position'})`));
  
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
          debugLog(`Found requested placement for ${emp.first_name} ${emp.last_name}: department=${requestedDepartment.name}, isManager=${placement.isManager}`);
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
  
  const rootNode: OrgChartNode = {
    id: ceoEmployee?.id || 'org-1',
    name: ceoEmployee ? `${ceoEmployee.first_name} ${ceoEmployee.last_name}` : 'CEO',
    title: ceoEmployee?.position || 'CEO',
    department: 'Executive',
    children: []
  };
  
  // Group employees by department
  const deptEmployees: Record<string, any[]> = {};
  
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
  
  debugLog(`Building fallback chart with departments: ${deptsToBuild.map(d => d.name).join(', ')}`);
  
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
    
    debugLog(`Department ${dept.name} has ${mentionedDeptEmps.length} mentioned employees`);
    
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
      const deptNode: OrgChartNode = {
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

async function generateWithAI(
  promptText: string,
  employees: any[],
  departments: any[],
  apiKey: string,
  structureType: string
): Promise<OrgChartNode> {
  try {
    debugLog("Generating org chart with AI");

    // Extract potential employee names from the prompt with improved name matching
    const promptWords = promptText.split(/\s+/);
    // Parse the prompt more carefully to extract placement instructions
    const requestedPlacements = new Map<string, { department: string, isManager: boolean }>();
    
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

    // Prepare context about existing employees and departments
    const employeeContext = employees.map(e => {
      const deptName = departments.find(d => d.id === e.department_id)?.name || 'Unknown';
      return `${e.first_name} ${e.last_name} - ${e.position || 'No position'} (${deptName} Department)`;
    }).join('\n');

    // Enhanced employee recognition - build a lookup table for name matching
    const employeeLookup = employees.map(emp => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      const firstName = emp.first_name.toLowerCase();
      const lastName = emp.last_name.toLowerCase();
      return {
        employee: emp,
        fullName,
        firstName,
        lastName,
        department: departments.find(d => d.id === emp.department_id)?.name || 'Unknown'
      };
    });

    // Find any specifically mentioned employees with improved matching
    const mentionedEmployees = promptWords.flatMap(word => {
      const lowerWord = word.toLowerCase().replace(/[.,;:!?]$/g, ''); // Remove punctuation
      if (lowerWord.length < 3) return []; // Skip very short words
      
      return employeeLookup
        .filter(entry => 
          entry.fullName.includes(lowerWord) || 
          entry.firstName === lowerWord || 
          entry.lastName === lowerWord ||
          (entry.firstName.startsWith(lowerWord) && lowerWord.length >= 4) ||
          (entry.lastName.startsWith(lowerWord) && lowerWord.length >= 4)
        )
        .map(entry => entry.employee);
    });
    
    // Remove duplicates from mentioned employees
    const uniqueMentionedEmployees = Array.from(
      new Map(mentionedEmployees.map(emp => [emp.id, emp])).values()
    );
    
    const mentionedNames = uniqueMentionedEmployees.map(emp => 
      `${emp.first_name} ${emp.last_name} (${emp.position || 'No position'})`
    ).join(', ');
    
    debugLog(`Found ${uniqueMentionedEmployees.length} mentioned employees: ${mentionedNames}`);
    
    // Enrich mentioned employees with their requested placements
    const enrichedMentionedEmployees = uniqueMentionedEmployees.map(emp => {
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
            debugLog(`Found AI requested placement for ${emp.first_name} ${emp.last_name}: department=${requestedDepartment.name}, isManager=${placement.isManager}`);
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

    const systemPrompt = `You are an organizational structure expert. Create a detailed organizational chart for a company based on the provided prompt.

Here is information about the existing employees:
${employeeContext}

The organizational chart should be in JSON format with this structure:
{
  "id": "1", // Employee ID or generated ID
  "name": "John Doe", // Employee name
  "title": "CEO", // Employee title/position
  "department": "Executive", // Department name
  "children": [ // Reports/subordinates
    { 
      // Same structure as parent
    }
  ],
  "metadata": { // Optional additional data
    "employeeCount": 10,
    "budget": 1000000
  }
}

Follow these rules:
1. Use ONLY the employees mentioned in the context AND in the user's prompt.
2. If specific employee assignments are mentioned (like "Brad as head of Engineering"), honor these placements.
3. Department heads should be at the top level of each department.
4. Create a hierarchical structure based on positions and departments.
5. Include ONLY real employees from the provided list.
6. Your output must be valid JSON with NO explanation before or after.`;

    debugLog("Calling Together AI");
    debugLog("SystemPrompt: " + systemPrompt);
    debugLog("UserPrompt: " + promptText);

    const response = await fetch("https://api.together.xyz/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt: `<s>[INST] ${systemPrompt} [/INST]

${promptText}

[INST] Respond with the organizational chart JSON only. [/INST]</s>`,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.7
      })
    });

    if (!response.ok) {
      debugLog(`API error: ${response.status} ${response.statusText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const textResponse = result.choices[0]?.text;

    if (!textResponse) {
      debugLog("No text in API response");
      throw new Error("No text in API response");
    }

    debugLog("Raw API response: " + textResponse);

    // Extract JSON from the text response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      debugLog("No JSON found in response");
      throw new Error("No JSON found in response");
    }

    let jsonText = jsonMatch[0];
    // Clean up any potential leading/trailing text
    jsonText = jsonText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

    try {
      const orgChart = JSON.parse(jsonText);
      
      // Process the returned chart to ensure validity and consistency
      return processAIGeneratedChart(orgChart, employees, departments, enrichedMentionedEmployees);
      
    } catch (parseError) {
      debugLog(`JSON parse error: ${parseError}`);
      debugLog(`Invalid JSON: ${jsonText}`);
      throw new Error(`Failed to parse JSON: ${parseError}`);
    }
  } catch (error) {
    debugLog(`AI generation error: ${error}`);
    console.error("Error generating with AI:", error);
    
    // Fall back to simple generation
    return generateSimpleOrgChart(employees, departments, structureType, promptText);
  }
}

function processAIGeneratedChart(
  chart: any, 
  employees: any[], 
  departments: any[],
  enrichedMentionedEmployees: any[]
): OrgChartNode {
  // Recursively process the chart to ensure validity
  function processNode(node: any): OrgChartNode {
    // Check if this is a real employee
    const matchedEmployee = employees.find(e => 
      `${e.first_name} ${e.last_name}`.toLowerCase() === node.name.toLowerCase()
    );
    
    // Check for requested department placements
    const enrichedEmployee = enrichedMentionedEmployees.find(e => 
      `${e.first_name} ${e.last_name}`.toLowerCase() === node.name.toLowerCase()
    );
    
    // If we have a requested department, override the department in the chart
    if (enrichedEmployee?.requested_department_name) {
      node.department = enrichedEmployee.requested_department_name;
    }
    
    const processedNode: OrgChartNode = {
      id: matchedEmployee?.id || node.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
      name: node.name,
      title: node.title || (matchedEmployee?.position || `${node.department} Staff`),
      department: node.department || (
        matchedEmployee ? 
          departments.find(d => d.id === matchedEmployee.department_id)?.name || 'Unknown' : 
          'Unknown'
      ),
      children: Array.isArray(node.children) ? node.children.map(processNode) : [],
    };
    
    if (node.metadata) {
      processedNode.metadata = node.metadata;
    }
    
    return processedNode;
  }
  
  return processNode(chart);
}

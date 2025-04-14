import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  WorkdayClient, SapClient, OracleClient, DynamicsClient,
  type WorkdayCredentials, type SapCredentials, 
  type OracleCredentials, type DynamicsCredentials 
} from '@/lib/integrations/apiClients';

// Initialize Supabase Admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for backend operations
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Define expected employee structure for the database
interface EmployeeRecord {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  department_id: string; // Changed from department name
  hire_date?: string;
  status?: string;
  employee_id?: string;
}

// Helper to get or create department ID
async function getOrCreateDepartmentId(departmentName: string): Promise<string> {
  if (!departmentName || departmentName.trim() === '') {
    departmentName = 'Unknown'; // Default if empty
  }

  const trimmedName = departmentName.trim();

  try {
    let { data: departments, error: selectError } = await supabaseAdmin
      .from('departments')
      .select('id')
      .ilike('name', trimmedName)
      .limit(1);

    if (selectError) throw selectError;

    if (departments && departments.length > 0) {
      return departments[0].id;
    }

    // Create department if it doesn't exist
    const { data: newDepartment, error: insertError } = await supabaseAdmin
      .from('departments')
      .insert([{ name: trimmedName }])
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!newDepartment) throw new Error('Failed to create department and retrieve ID.');

    console.log(`Created department: ${trimmedName} with ID: ${newDepartment.id}`);
    return newDepartment.id;
  } catch (error) {
    console.error(`Error handling department '${trimmedName}':`, error);
    // Fallback: Try to find/create a generic error department
    const errorDeptName = 'Integration Error Department';
    let { data: errorDepts } = await supabaseAdmin.from('departments').select('id').eq('name', errorDeptName).limit(1);
    if (errorDepts && errorDepts.length > 0) return errorDepts[0].id;
    const { data: newErrorDept } = await supabaseAdmin.from('departments').insert([{ name: errorDeptName }]).select('id').single();
    return newErrorDept!.id; // Assume creation succeeds or handle further
  }
}

// More robust CSV Parser - handles quoted fields containing commas and newlines
function parseCsvAdvanced(csvText: string): Record<string, string>[] {
    const rows: Record<string, string>[] = [];
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return rows; // Need header and data

    // Extract headers (handle quoted headers)
    const headers = lines[0].match(/("[^"]*"|[^,]+)/g)?.map(h => h.trim().replace(/^"|"$/g, '')) || [];
    if (headers.length === 0) return rows;

    let currentRecord: Record<string, string> = {}; // Explicit type
    let currentFieldIndex = 0;
    let inQuotes = false;
    let currentField = '';

    // Process data lines
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        currentRecord = {};
        currentFieldIndex = 0;
        inQuotes = false;
        currentField = '';

        for (let j = 0; j < line.length; j++) {
            const char = line[j];

            if (char === '\"' && (j === 0 || line[j - 1] !== '\\')) { // Handle quotes (basic escaping)
                if (inQuotes && line[j+1] === '\"') { // Handle escaped double quotes ""
                    currentField += '\"';
                    j++; // Skip the next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of a field
                if (currentFieldIndex < headers.length) {
                    currentRecord[headers[currentFieldIndex]] = currentField.trim();
                }
                currentField = '';
                currentFieldIndex++;
            } else {
                currentField += char;
            }
        }

        // Add the last field
        if (currentFieldIndex < headers.length) {
             currentRecord[headers[currentFieldIndex]] = currentField.trim();
        }

        // Check if the row has the expected number of fields (can be slightly off due to parsing limits)
        if (Object.keys(currentRecord).length > 0) { // Add if not empty
           // Basic check - might need refinement for edge cases
           if (Object.keys(currentRecord).length <= headers.length) {
               rows.push(currentRecord);
           } else {
                console.warn(`Skipping row ${i+1} due to potential parsing issue (more fields than headers):`, currentRecord);
           }
        }
    }

    return rows;
}

type CredentialFormData = Record<string, FormDataEntryValue>;

function validateCredentials<T>(formData: CredentialFormData, requiredFields: (keyof T)[]): T {
  const result: Partial<T> = {};
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    const fieldName = field as string;
    const value = formData[fieldName];
    
    if (!value || typeof value !== 'string') {
      errors.push(`Missing or invalid value for required field: ${fieldName}`);
      continue;
    }
    
    result[field] = value as any;
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  return result as T;
}

export async function POST(request: Request) {
  console.log('Direct import API called');
  try {
    const formData = await request.formData();
    const systemType = formData.get('systemType') as string;
    const file = formData.get('file') as File | null;
    const mappingString = formData.get('mapping') as string | null; // Get mapping from form data
    const apiFieldMappingString = formData.get('apiFieldMapping') as string | null;

    let processedCount = 0;
    let createdCount = 0; // We don't track creates vs updates easily with upsert
    let updatedOrCreatedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    if (systemType === 'csv' && file && mappingString) {
      console.log('Processing CSV file with manual mapping using advanced parser');
      let columnMapping: Record<string, string>;
      try {
        columnMapping = JSON.parse(mappingString);
      } catch (e) {
        return NextResponse.json({ success: false, message: 'Invalid column mapping format.' }, { status: 400 });
      }

      const fileContent = await file.text();
      const data = parseCsvAdvanced(fileContent); // Use the advanced parser

      if (!data || data.length === 0) {
        return NextResponse.json({ success: false, message: 'Failed to parse CSV file or file is empty.' }, { status: 400 });
      }

      console.log(`Parsed ${data.length} data rows from CSV`);
      processedCount = data.length;

      for (const rawRow of data) {
        try {
          const mappedRow = {} as Partial<EmployeeRecord & { department_name: string }>; // Use type assertion

          // Apply the user-defined mapping
          for (const csvHeader in columnMapping) {
            const targetField = columnMapping[csvHeader];
            if (targetField !== 'ignore' && rawRow[csvHeader] !== undefined) {
              // Assign value from rawRow using csvHeader to the targetField in mappedRow
              (mappedRow as any)[targetField] = String(rawRow[csvHeader]).trim(); // Lint ID: 56504883-85e6-4398-85d1-d812d7a3c230 - Using any here as targetField is dynamic
            }
          }

          // Check for essential fields based on mapping
          if (!mappedRow.first_name || !mappedRow.last_name || !mappedRow.email || !mappedRow.department_name) {
            errors.push(`Skipping row due to missing required mapped fields (First Name, Last Name, Email, Department Name): ${JSON.stringify(rawRow)}`);
            failedCount++;
            continue;
          }

          const departmentId = await getOrCreateDepartmentId(mappedRow.department_name);

          const employeeRecord: Omit<EmployeeRecord, 'department_id'> & { department_id: string } = {
            first_name: mappedRow.first_name,
            last_name: mappedRow.last_name,
            email: mappedRow.email,
            phone: mappedRow.phone,
            position: mappedRow.position,
            department_id: departmentId,
            hire_date: mappedRow.hire_date,
            status: mappedRow.status,
            employee_id: mappedRow.employee_id,
          };

          const { error: upsertError } = await supabaseAdmin
            .from('employees')
            .upsert(employeeRecord, { onConflict: 'email' }); // Still upserting on email conflict

          if (upsertError) {
            throw upsertError;
          }
          updatedOrCreatedCount++;

        } catch (rowError: any) {
          console.error('Error processing row:', rawRow, rowError);
          errors.push(`Failed to process row: ${JSON.stringify(rawRow)} - Error: ${rowError.message}`);
          failedCount++;
        }
      }

    } else if (['sap', 'workday', 'oracle', 'microsoft_dynamics'].includes(systemType)) {
      // Get API field mapping
      const apiFieldMappingString = formData.get('apiFieldMapping') as string | null;
      let apiFieldMapping: Record<string, string> = {
        'firstName': 'first_name',
        'lastName': 'last_name',
        'email': 'email',
        'department': 'department_name'
      };
      
      if (apiFieldMappingString) {
        try {
          apiFieldMapping = JSON.parse(apiFieldMappingString);
        } catch (e) {
          console.error('Failed to parse API field mapping', e);
        }
      }

      let apiData: Record<string, any>[] = [];
      try {
        const formDataObj = Object.fromEntries(formData.entries());
        let client;
        
        switch(systemType) {
          case 'workday':
            client = new WorkdayClient(
              validateCredentials<WorkdayCredentials>(formDataObj, ['instanceUrl', 'clientId', 'clientSecret', 'tenantId'])
            );
            break;
          case 'sap':
            client = new SapClient(
              validateCredentials<SapCredentials>(formDataObj, ['apiUrl', 'username', 'password', 'companyId'])
            );
            break;
          case 'oracle':
            client = new OracleClient(
              validateCredentials<OracleCredentials>(formDataObj, ['instanceUrl', 'username', 'password', 'serviceName'])
            );
            break;
          case 'microsoft_dynamics':
            client = new DynamicsClient(
              validateCredentials<DynamicsCredentials>(formDataObj, ['instanceUrl', 'clientId', 'clientSecret', 'tenantId'])
            );
            break;
          default:
            throw new Error('Unsupported API integration');
        }

        // Test connection first
        const isConnected = await client.testConnection();
        if (!isConnected) {
          throw new Error('Failed to connect to API');
        }

        apiData = await client.getEmployees();
      } catch (apiError: any) {
        let errorMessage = 'API connection failed';
        
        if (apiError.message.includes('Missing or invalid value')) {
          errorMessage = `Invalid credentials: ${apiError.message}`;
        } else {
          errorMessage = `API connection failed: ${apiError.message}`;
        }
        
        errors.push(errorMessage);
        return NextResponse.json({ 
          success: false, 
          errors,
          errorType: apiError.message.includes('Missing or invalid value') ? 'invalid_credentials' : 'api_connection_error'
        }, { status: 400 });
      }

      processedCount = apiData.length;

      for (const apiRow of apiData) {
        try {
          const mappedRow: Partial<EmployeeRecord & { department_name: string }> = {};
          
          // Apply API field mapping
          for (const [apiField, targetField] of Object.entries(apiFieldMapping)) {
            if (targetField !== 'ignore' && apiRow[apiField] !== undefined) {
              (mappedRow as any)[targetField] = String(apiRow[apiField]).trim();
            }
          }

          if (!mappedRow.first_name || !mappedRow.last_name || !mappedRow.email || !mappedRow.department_name) {
            errors.push(`Skipping row due to missing required mapped fields: ${JSON.stringify(apiRow)}`);
            failedCount++;
            continue;
          }

          const departmentId = await getOrCreateDepartmentId(mappedRow.department_name);

          const employeeRecord = {
            first_name: mappedRow.first_name,
            last_name: mappedRow.last_name,
            email: mappedRow.email,
            phone: mappedRow.phone,
            position: mappedRow.position,
            department_id: departmentId,
            hire_date: mappedRow.hire_date,
            status: mappedRow.status,
            employee_id: mappedRow.employee_id,
          };

          const { error: upsertError } = await supabaseAdmin
            .from('employees')
            .upsert(employeeRecord, { onConflict: 'email' });

          if (upsertError) throw upsertError;
          updatedOrCreatedCount++;
        } catch (rowError: any) {
          console.error('Error processing row:', apiRow, rowError);
          errors.push(`Failed to process row: ${JSON.stringify(apiRow)} - Error: ${rowError.message}`);
          failedCount++;
        }
      }
    } else {
      return NextResponse.json({ success: false, message: 'Invalid system type or missing required data (file, mapping, credentials)' }, { status: 400 });
    }

    console.log(`Import finished. Processed: ${processedCount}, Succeeded: ${updatedOrCreatedCount}, Failed: ${failedCount}`);
    return NextResponse.json({
      success: failedCount === 0,
      message: `Import completed. Processed: ${processedCount}, Succeeded: ${updatedOrCreatedCount}, Failed: ${failedCount}.`,
      created: createdCount, // Note: Simplified - we don't distinguish create/update easily
      updated: updatedOrCreatedCount, // Note: Simplified
      failed: failedCount,
      errors: errors,
    });

  } catch (error: any) {
    console.error('Direct import API error:', error);
    return NextResponse.json({ success: false, message: `An unexpected error occurred: ${error.message}` }, { status: 500 });
  }
}

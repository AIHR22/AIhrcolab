"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SimpleIntegrationPage() {
  const [step, setStep] = useState('select'); // select, configure, map, import
  const [selectedSystem, setSelectedSystem] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  // Available systems
  const systems = [
    { id: 'sap', name: 'SAP SuccessFactors', type: 'api' },
    { id: 'workday', name: 'Workday', type: 'api' },
    { id: 'oracle', name: 'Oracle HCM Cloud', type: 'api' },
    { id: 'microsoft_dynamics', name: 'Microsoft Dynamics 365', type: 'api' },
    { id: 'csv', name: 'CSV File Upload', type: 'file' }
  ];
  
  // Target schema fields
  const targetFields = [
    { id: 'first_name', name: 'First Name', required: true },
    { id: 'last_name', name: 'Last Name', required: true },
    { id: 'email', name: 'Email Address', required: true },
    { id: 'phone', name: 'Phone Number', required: false },
    { id: 'position', name: 'Job Title/Position', required: false },
    { id: 'department', name: 'Department', required: true },
    { id: 'hire_date', name: 'Hire Date', required: false },
    { id: 'manager', name: 'Manager', required: false },
    { id: 'employee_id', name: 'Employee ID', required: false },
    { id: 'status', name: 'Employment Status', required: false }
  ];
  
  // System-specific credential fields
  const getCredentialFields = (systemId: string) => {
    switch (systemId) {
      case 'sap':
        return [
          { id: 'api_url', name: 'API Base URL', type: 'text', required: true },
          { id: 'client_id', name: 'Client ID', type: 'text', required: true },
          { id: 'client_secret', name: 'Client Secret', type: 'password', required: true },
          { id: 'company_id', name: 'Company ID', type: 'text', required: true }
        ];
      case 'workday':
        return [
          { id: 'tenant_url', name: 'Tenant URL', type: 'text', required: true },
          { id: 'client_id', name: 'Client ID', type: 'text', required: true },
          { id: 'client_secret', name: 'Client Secret', type: 'password', required: true },
          { id: 'tenant_name', name: 'Tenant Name', type: 'text', required: true }
        ];
      case 'oracle':
        return [
          { id: 'instance_url', name: 'Instance URL', type: 'text', required: true },
          { id: 'username', name: 'Username', type: 'text', required: true },
          { id: 'password', name: 'Password', type: 'password', required: true },
          { id: 'access_key', name: 'Access Key', type: 'password', required: false }
        ];
      case 'microsoft_dynamics':
        return [
          { id: 'tenant_id', name: 'Tenant ID', type: 'text', required: true },
          { id: 'client_id', name: 'Client ID', type: 'text', required: true },
          { id: 'client_secret', name: 'Client Secret', type: 'password', required: true },
          { id: 'environment_url', name: 'Environment URL', type: 'text', required: true }
        ];
      default:
        return [];
    }
  };
  
  // Handle system selection
  const handleSystemSelect = (systemId: string) => {
    setSelectedSystem(systemId);
    setCredentials({});
    setConnectionStatus('idle');
    setErrorMessage('');
    setStep('configure');
  };
  
  // Handle credential input change
  const handleCredentialChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle file selection for CSV upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  // Test connection with provided credentials
  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    
    try {
      if (selectedSystem === 'csv') {
        if (!file) {
          throw new Error('Please select a CSV file');
        }
        
        // Parse CSV file to get sample data
        const text = await file.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Get sample data from first few rows
        const sampleRows = [];
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          sampleRows.push(row);
        }
        
        setSampleData(sampleRows);
        
        // Pre-populate mappings with best guesses
        const mappings: Record<string, string> = {};
        headers.forEach(header => {
          const normalizedHeader = header.toLowerCase();
          
          if (normalizedHeader.includes('first') || normalizedHeader.includes('fname')) {
            mappings[header] = 'first_name';
          } else if (normalizedHeader.includes('last') || normalizedHeader.includes('lname')) {
            mappings[header] = 'last_name';
          } else if (normalizedHeader.includes('email')) {
            mappings[header] = 'email';
          } else if (normalizedHeader.includes('phone')) {
            mappings[header] = 'phone';
          } else if (normalizedHeader.includes('title') || normalizedHeader.includes('position') || normalizedHeader.includes('job')) {
            mappings[header] = 'position';
          } else if (normalizedHeader.includes('dept') || normalizedHeader.includes('department')) {
            mappings[header] = 'department';
          } else if (normalizedHeader.includes('hire') || normalizedHeader.includes('start')) {
            mappings[header] = 'hire_date';
          } else if (normalizedHeader.includes('manager')) {
            mappings[header] = 'manager';
          } else if (normalizedHeader.includes('id') || normalizedHeader.includes('emp_id')) {
            mappings[header] = 'employee_id';
          } else if (normalizedHeader.includes('status')) {
            mappings[header] = 'status';
          }
        });
        
        setFieldMappings(mappings);
        setConnectionStatus('success');
        setStep('map');
      } else {
        // For API-based systems, we'd normally make an API call here
        // Since we can't make actual external API calls in this demo, we'll simulate it
        
        // Check if required credentials are provided
        const requiredFields = getCredentialFields(selectedSystem).filter(f => f.required);
        for (const field of requiredFields) {
          if (!credentials[field.id]) {
            throw new Error(`${field.name} is required`);
          }
        }
        
        // Simulate API connection delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate field mappings from API
        // In a real implementation, we'd get these from the API response
        const systemFieldMappings: Record<string, string> = {};
        
        if (selectedSystem === 'sap') {
          systemFieldMappings['firstName'] = 'first_name';
          systemFieldMappings['lastName'] = 'last_name';
          systemFieldMappings['email'] = 'email';
          systemFieldMappings['phoneNumber'] = 'phone';
          systemFieldMappings['jobTitle'] = 'position';
          systemFieldMappings['department'] = 'department';
          systemFieldMappings['startDate'] = 'hire_date';
        } else if (selectedSystem === 'workday') {
          systemFieldMappings['Worker_FirstName'] = 'first_name';
          systemFieldMappings['Worker_LastName'] = 'last_name';
          systemFieldMappings['Worker_Email'] = 'email';
          systemFieldMappings['Worker_Phone'] = 'phone';
          systemFieldMappings['Worker_Position'] = 'position';
          systemFieldMappings['Worker_Organization'] = 'department';
          systemFieldMappings['Worker_HireDate'] = 'hire_date';
        } else if (selectedSystem === 'oracle') {
          systemFieldMappings['PersonFirstName'] = 'first_name';
          systemFieldMappings['PersonLastName'] = 'last_name';
          systemFieldMappings['EmailAddress'] = 'email';
          systemFieldMappings['PhoneNumber'] = 'phone';
          systemFieldMappings['PositionName'] = 'position';
          systemFieldMappings['DepartmentName'] = 'department';
          systemFieldMappings['StartDate'] = 'hire_date';
        } else if (selectedSystem === 'microsoft_dynamics') {
          systemFieldMappings['givenname'] = 'first_name';
          systemFieldMappings['surname'] = 'last_name';
          systemFieldMappings['emailaddress1'] = 'email';
          systemFieldMappings['telephone1'] = 'phone';
          systemFieldMappings['jobtitle'] = 'position';
          systemFieldMappings['department'] = 'department';
          systemFieldMappings['hiredate'] = 'hire_date';
        }
        
        setFieldMappings(systemFieldMappings);
        setSampleData([]);
        setConnectionStatus('success');
        setStep('map');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };
  
  // Handle field mapping changes
  const handleMappingChange = (sourceField: string, targetField: string) => {
    setFieldMappings(prev => ({ ...prev, [sourceField]: targetField }));
  };
  
  // Import data using mappings
  const importData = async () => {
    setImportStatus('importing');
    
    try {
      // In a real application, we would:
      // 1. Connect to the selected system using credentials
      // 2. Fetch the data using the appropriate API
      // 3. Transform the data using the field mappings
      // 4. Import the data into our database
      
      // For demo purposes, we'll simulate this process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Log the successful integration
      await supabase.from('integration_configs').insert([
        {
          name: `${getSystemName(selectedSystem)} Integration`,
          system_type: selectedSystem,
          auth_type: 'api_key',
          is_active: true,
          config: credentials,
          sync_frequency: 'daily'
        }
      ]);
      
      setImportStatus('success');
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };
  
  // Get system name by ID
  const getSystemName = (systemId: string) => {
    const system = systems.find(s => s.id === systemId);
    return system ? system.name : systemId;
  };
  
  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 'select':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Select Integration System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systems.map((system) => (
                <button
                  key={system.id}
                  className="p-4 border rounded-lg hover:bg-blue-50 flex items-center"
                  onClick={() => handleSystemSelect(system.id)}
                >
                  <div>
                    <p className="font-semibold">{system.name}</p>
                    <p className="text-sm text-gray-500">
                      {system.type === 'api' ? 'API Integration' : 'File Upload'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'configure':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Configure {getSystemName(selectedSystem)}</h2>
            
            {selectedSystem === 'csv' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="border p-2 w-full rounded"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Upload a CSV file containing employee data. The first row should contain column headers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getCredentialFields(selectedSystem).map((field) => (
                  <div key={field.id} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.name}{field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type}
                      value={credentials[field.id] || ''}
                      onChange={(e) => handleCredentialChange(field.id, e.target.value)}
                      className="border p-2 w-full rounded"
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {connectionStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                {errorMessage}
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep('select')}
                className="px-4 py-2 border rounded"
              >
                Back
              </button>
              <button
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        );
        
      case 'map':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Map Fields</h2>
            <p className="mb-4 text-gray-600">
              Map the fields from {getSystemName(selectedSystem)} to the corresponding fields in your system.
            </p>
            
            {selectedSystem === 'csv' && sampleData.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Sample Data Preview</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr>
                        {Object.keys(sampleData[0]).map((header) => (
                          <th key={header} className="border px-4 py-2 bg-gray-50">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, colIndex) => (
                            <td key={colIndex} className="border px-4 py-2">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {Object.keys(fieldMappings).map((sourceField) => (
                <div key={sourceField} className="flex items-center space-x-4">
                  <div className="w-1/2">
                    <p className="font-medium">{sourceField}</p>
                  </div>
                  <div className="w-1/2">
                    <select
                      value={fieldMappings[sourceField] || ''}
                      onChange={(e) => handleMappingChange(sourceField, e.target.value)}
                      className="border p-2 w-full rounded"
                    >
                      <option value="">-- Do not import --</option>
                      {targetFields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.name}{field.required ? ' *' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep('configure')}
                className="px-4 py-2 border rounded"
              >
                Back
              </button>
              <button
                onClick={importData}
                disabled={importStatus === 'importing'}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
              >
                {importStatus === 'importing' ? 'Importing...' : 'Import Data'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Simple HR Integration</h1>
      
      <div className="mb-8">
        <div className="flex items-center mb-8">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step === 'select' ? 'bg-blue-600' : 'bg-gray-300'} text-white font-bold mr-2`}>1</div>
          <div className={`mr-4 ${step === 'select' ? 'font-medium' : 'text-gray-500'}`}>Select System</div>
          
          <div className="h-0.5 w-8 bg-gray-300 mr-2"></div>
          
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step === 'configure' ? 'bg-blue-600' : 'bg-gray-300'} text-white font-bold mr-2`}>2</div>
          <div className={`mr-4 ${step === 'configure' ? 'font-medium' : 'text-gray-500'}`}>Configure</div>
          
          <div className="h-0.5 w-8 bg-gray-300 mr-2"></div>
          
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step === 'map' ? 'bg-blue-600' : 'bg-gray-300'} text-white font-bold mr-2`}>3</div>
          <div className={`${step === 'map' ? 'font-medium' : 'text-gray-500'}`}>Map Fields</div>
        </div>
      </div>
      
      {renderStep()}
      
      {importStatus === 'success' && (
        <div className="mt-8 p-4 bg-green-100 text-green-800 rounded">
          <h3 className="font-bold mb-2">Integration Complete!</h3>
          <p>
            Successfully configured integration with {getSystemName(selectedSystem)}. 
            Employee data will now be synchronized according to your mappings. This data will be 
            available in your Strategic Growth Planner for headcount projections based on revenue targets.
          </p>
          <div className="mt-4">
            <button
              onClick={() => {
                setStep('select');
                setSelectedSystem('');
                setCredentials({});
                setConnectionStatus('idle');
                setErrorMessage('');
                setFieldMappings({});
                setImportStatus('idle');
                setSampleData([]);
                setFile(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Set Up Another Integration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

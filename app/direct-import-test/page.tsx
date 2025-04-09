'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

// Define the target schema fields we want to map to
const targetSchemaFields = [
  { id: 'ignore', name: 'Ignore this column' },
  { id: 'first_name', name: 'First Name' },
  { id: 'last_name', name: 'Last Name' },
  { id: 'email', name: 'Email Address' },
  { id: 'phone', name: 'Phone Number' },
  { id: 'position', name: 'Position / Job Title' },
  { id: 'department_name', name: 'Department Name' },
  { id: 'hire_date', name: 'Hire Date' },
  { id: 'status', name: 'Employment Status' },
  { id: 'employee_id', name: 'Employee ID' },
];

// Utility to parse CSV header (handles basic quotes)
const parseCsvHeader = (file: File, callback: (headers: string[]) => void) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target?.result as string;
    if (!text) {
        callback([]);
        return;
    }
    const firstLine = text.split(/\r?\n/)[0];
    // Basic handling for quoted headers containing commas
    const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    callback(headers);
  };
  reader.onerror = () => {
      console.error("Error reading file");
      callback([]);
  }
  reader.readAsText(file);
};

export default function DirectImportTestPage() {
  const [selectedSystem, setSelectedSystem] = useState('csv');
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [apiFieldMapping, setApiFieldMapping] = useState<Record<string, string>>({
    'FirstName': 'first_name',
    'LastName': 'last_name',
    'Email': 'email',
    'Department': 'department_name'
  });
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const systems = [
    { id: 'csv', name: 'CSV File Upload', type: 'file' },
    { id: 'sap', name: 'SAP SuccessFactors', type: 'api' },
    { id: 'workday', name: 'Workday', type: 'api' },
    { id: 'oracle', name: 'Oracle HCM Cloud', type: 'api' },
    { id: 'microsoft_dynamics', name: 'Microsoft Dynamics 365', type: 'api' },
  ];

  const getCredentialFields = (systemId: string) => {
    switch (systemId) {
      case 'workday':
        return [
          { id: 'instanceUrl', name: 'Instance URL', required: true },
          { id: 'clientId', name: 'Client ID', required: true },
          { id: 'clientSecret', name: 'Client Secret', required: true },
          { id: 'tenantId', name: 'Tenant ID', required: true }
        ];
      case 'sap':
        return [
          { id: 'apiUrl', name: 'API URL', required: true },
          { id: 'username', name: 'Username', required: true },
          { id: 'password', name: 'Password', required: true },
          { id: 'companyId', name: 'Company ID', required: true }
        ];
      case 'oracle':
        return [
          { id: 'instanceUrl', name: 'Instance URL', required: true },
          { id: 'username', name: 'Username', required: true },
          { id: 'password', name: 'Password', required: true },
          { id: 'serviceName', name: 'Service Name', required: true }
        ];
      case 'microsoft_dynamics':
        return [
          { id: 'instanceUrl', name: 'Instance URL', required: true },
          { id: 'clientId', name: 'Client ID', required: true },
          { id: 'clientSecret', name: 'Client Secret', required: true },
          { id: 'tenantId', name: 'Tenant ID', required: true }
        ];
      default:
        return [];
    }
  };

  const handleSystemChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSystem(e.target.value);
    setCredentials({});
    setFile(null);
    setCsvHeaders([]);
    setColumnMapping({});
    setApiFieldMapping({
      'FirstName': 'first_name',
      'LastName': 'last_name',
      'Email': 'email',
      'Department': 'department_name'
    });
    setResult(null);
    setError(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null);
      setError(null);
      // Parse header and auto-suggest mapping
      parseCsvHeader(selectedFile, (headers) => {
        setCsvHeaders(headers);
        const initialMapping: Record<string, string> = {};
        headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            const foundField = targetSchemaFields.find(field =>
                field.id !== 'ignore' &&
                (lowerHeader.includes(field.id.replace('_', '')) ||
                 lowerHeader.includes(field.id.replace('_', ' ')) ||
                 field.name.toLowerCase().includes(lowerHeader) ||
                 lowerHeader === field.name.toLowerCase() // Direct match for name
                )
            );
            initialMapping[header] = foundField ? foundField.id : 'ignore';
        });
        setColumnMapping(initialMapping);
      });
    } else {
        setFile(null);
        setCsvHeaders([]);
        setColumnMapping({});
    }
  };

  const handleMappingChange = (csvHeader: string, targetFieldId: string) => {
    setColumnMapping(prev => ({ ...prev, [csvHeader]: targetFieldId }));
  };

  const handleApiMappingChange = (apiField: string, targetField: string) => {
    setApiFieldMapping(prev => ({ ...prev, [apiField]: targetField }));
  };

  const handleCredentialChange = (fieldId: string, value: string) => {
    setCredentials(prev => ({ ...prev, [fieldId]: value }));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    // Validation
    if (selectedSystem === 'csv') {
      if (!file) {
        setError('Please select a CSV file to upload.');
        setIsLoading(false);
        return;
      }
      // Check if essential fields are mapped
      const mappedFields = Object.values(columnMapping);
      if (!mappedFields.includes('first_name') || !mappedFields.includes('last_name') || !mappedFields.includes('email') || !mappedFields.includes('department_name')) {
          setError('Please map columns for First Name, Last Name, Email, and Department Name.');
          setIsLoading(false);
          return;
      }
    } else {
      const fields = getCredentialFields(selectedSystem);
      if (fields.length > 0 && fields.some(field => !credentials[field.id])) {
          setError(`Please fill in all credential fields for ${selectedSystem.toUpperCase()}.`);
          setIsLoading(false);
          return;
      }
    }

    const formData = new FormData();
    formData.append('systemType', selectedSystem);

    if (selectedSystem === 'csv' && file) {
      formData.append('file', file);
      // Send the mapping configuration to the backend
      formData.append('mapping', JSON.stringify(columnMapping));
    } else if (['sap', 'workday', 'oracle', 'microsoft_dynamics'].includes(selectedSystem)) {
      // Add API field mapping to form data
      formData.append('apiFieldMapping', JSON.stringify(apiFieldMapping));
      Object.keys(credentials).forEach(key => {
        formData.append(key, credentials[key]);
      });
    }

    try {
      const response = await fetch('/api/integrations/direct-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Import failed. Check server logs.');
      }

      setResult(data);
      // Optionally reset file/mapping after successful import
      // setFile(null);
      // setCsvHeaders([]);
      // setColumnMapping({});
    } catch (err: any) {
      console.error('Import Error:', err);
      setError(err.message || 'An unexpected error occurred during import.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Direct Data Import</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="systemType" className="block text-sm font-medium text-gray-700 mb-1">
            Select System:
          </label>
          <select
            id="systemType"
            value={selectedSystem}
            onChange={handleSystemChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {systems.map(system => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSystem === 'csv' && (
          <div className="space-y-4 p-4 border border-gray-200 rounded-md">
            <h2 className="text-lg font-medium text-gray-900">CSV Upload & Mapping</h2>
            <div>
              <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-1">
                1. Upload CSV File:
              </label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleFileChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">First row must contain headers.</p>
            </div>

            {csvHeaders.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Map Columns to Database Fields:
                </label>
                <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 p-3 rounded-md bg-gray-50">
                  {csvHeaders.map((header, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 items-center">
                      <span className="text-sm font-medium text-gray-600 truncate" title={header}>{header}</span>
                      <select
                        value={columnMapping[header] || 'ignore'}
                        onChange={(e) => handleMappingChange(header, e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {targetSchemaFields.map(field => (
                          <option key={field.id} value={field.id}>
                            {field.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                 <p className="mt-1 text-xs text-gray-500">Ensure First Name, Last Name, Email, and Department Name are mapped.</p>
              </div>
            )}
          </div>
        )}

        {selectedSystem !== 'csv' && (
           <div className="space-y-4">
             <div className="p-4 border border-gray-200 rounded-md">
               <h2 className="text-lg font-medium text-gray-900">API Credentials ({systems.find(s => s.id === selectedSystem)?.name})</h2>
                {getCredentialFields(selectedSystem).map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.name}:
                    </label>
                    <input
                      type={field.id.includes('secret') || field.id.includes('password') ? 'password' : 'text'}
                      id={field.id}
                      value={credentials[field.id] || ''}
                      onChange={(e) => handleCredentialChange(field.id, e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
              <div className="p-4 border border-gray-200 rounded-md">
                <h2 className="text-lg font-medium text-gray-900">API Field Mapping</h2>
                <div className="space-y-3 mt-2">
                  {Object.entries({
                    'FirstName': 'First Name',
                    'LastName': 'Last Name',
                    'Email': 'Email',
                    'Department': 'Department'
                  }).map(([apiField, displayName]) => (
                    <div key={apiField} className="grid grid-cols-2 gap-4 items-center">
                      <span className="text-sm font-medium text-gray-600">{displayName}</span>
                      <select
                        value={apiFieldMapping[apiField] || 'ignore'}
                        onChange={(e) => handleApiMappingChange(apiField, e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
                      >
                        {targetSchemaFields
                          .filter(f => f.id !== 'ignore')
                          .map(field => (
                            <option key={field.id} value={field.id}>{field.name}</option>
                          ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (selectedSystem === 'csv' && !file)}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Importing...' : 'Import Data'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className={`mt-6 p-3 rounded-md text-sm ${result.success ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-100 border border-red-200 text-red-800'}`}>
          <p className="font-bold">Import Result:</p>
          <p>{result.message}</p>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold">Details ({result.failed} failed):</p>
              <ul className="list-disc list-inside max-h-40 overflow-y-auto text-xs bg-white p-2 rounded border border-red-200">
                {result.errors.map((errMsg: string, index: number) => (
                  <li key={index}>{errMsg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

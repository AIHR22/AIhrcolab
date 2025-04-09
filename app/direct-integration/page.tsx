"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Simple standalone integration page
export default function DirectIntegrationPage() {
  const [status, setStatus] = useState('Loading...');
  const [result, setResult] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Function to sync demo data directly
  const syncDemoData = async () => {
    try {
      setLoading(true);
      setStatus('Syncing demo data...');
      
      // Create supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Mock employees data
      const demoEmployees = [
        {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          phone: "555-123-4567",
          position: "Software Engineer",
          department: "Engineering",
          hire_date: "2023-01-15"
        },
        {
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@example.com",
          phone: "555-234-5678",
          position: "Product Manager",
          department: "Product",
          hire_date: "2022-11-20"
        },
        {
          first_name: "Michael",
          last_name: "Johnson",
          email: "michael.johnson@example.com",
          phone: "555-345-6789",
          position: "UX Designer",
          department: "Design",
          hire_date: "2023-03-05"
        }
      ];
      
      // First check if departments exist, create if not
      for (const employee of demoEmployees) {
        // Check if department exists
        const { data: departments, error: deptError } = await supabase
          .from('departments')
          .select('id, name')
          .eq('name', employee.department);
          
        if (deptError) {
          console.error("Error checking department:", deptError);
          setStatus(`Error checking department: ${deptError.message}`);
          continue;
        }
        
        // If department doesn't exist, create it
        if (!departments || departments.length === 0) {
          const { data: newDept, error: createDeptError } = await supabase
            .from('departments')
            .insert([{ name: employee.department }])
            .select();
            
          if (createDeptError) {
            console.error("Error creating department:", createDeptError);
            setStatus(`Error creating department: ${createDeptError.message}`);
            continue;
          }
          
          console.log(`Created department: ${employee.department}`);
        }
      }
      
      // Fetch departments to get IDs
      const { data: allDepartments, error: fetchDeptError } = await supabase
        .from('departments')
        .select('id, name');
        
      if (fetchDeptError) {
        throw new Error(`Error fetching departments: ${fetchDeptError.message}`);
      }
      
      // Create a map of department names to IDs
      const departmentMap: Record<string, string> = {};
      allDepartments?.forEach(dept => {
        departmentMap[dept.name] = dept.id;
      });
      
      // Insert employees with correct department IDs
      const results = [];
      for (const employee of demoEmployees) {
        const departmentId = departmentMap[employee.department];
        
        if (!departmentId) {
          console.error(`Department ID not found for ${employee.department}`);
          continue;
        }
        
        // Check if employee already exists
        const { data: existingEmployees, error: checkError } = await supabase
          .from('employees')
          .select('id')
          .eq('email', employee.email);
          
        if (checkError) {
          console.error("Error checking employee:", checkError);
          setStatus(`Error checking employee: ${checkError.message}`);
          continue;
        }
        
        let result;
        if (existingEmployees && existingEmployees.length > 0) {
          // Update existing employee
          const { data, error } = await supabase
            .from('employees')
            .update({
              first_name: employee.first_name,
              last_name: employee.last_name,
              phone: employee.phone,
              position: employee.position,
              department_id: departmentId,
              hire_date: employee.hire_date
            })
            .eq('id', existingEmployees[0].id)
            .select();
            
          if (error) {
            console.error("Error updating employee:", error);
            setStatus(`Error updating employee: ${error.message}`);
            continue;
          }
          
          result = { action: 'updated', employee: data?.[0] };
        } else {
          // Create new employee
          const { data, error } = await supabase
            .from('employees')
            .insert([{
              first_name: employee.first_name,
              last_name: employee.last_name,
              email: employee.email,
              phone: employee.phone,
              position: employee.position,
              department_id: departmentId,
              hire_date: employee.hire_date
            }])
            .select();
            
          if (error) {
            console.error("Error creating employee:", error);
            setStatus(`Error creating employee: ${error.message}`);
            continue;
          }
          
          result = { action: 'created', employee: data?.[0] };
        }
        
        results.push(result);
      }
      
      setResult({
        success: true,
        message: `Successfully processed ${results.length} employees`,
        details: results
      });
      
      setStatus('Integration successful!');
      
      // Fetch employees to display
      fetchEmployees();
    } catch (error) {
      console.error("Integration error:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch employees
  const fetchEmployees = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*, departments(*)')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        throw error;
      }
      
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };
  
  // Initial load
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Direct Integration Test</h1>
      
      <div className="mb-8">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={syncDemoData}
          disabled={loading}
        >
          {loading ? 'Syncing...' : 'Sync Demo Data'}
        </button>
        
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <p className="font-semibold">Status:</p>
          <p>{status}</p>
          
          {result && (
            <div className="mt-4">
              <p className="font-semibold">Result:</p>
              <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Employees</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Position</th>
                <th className="border px-4 py-2">Department</th>
                <th className="border px-4 py-2">Hire Date</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="border px-4 py-2">{`${employee.first_name} ${employee.last_name}`}</td>
                    <td className="border px-4 py-2">{employee.email}</td>
                    <td className="border px-4 py-2">{employee.position}</td>
                    <td className="border px-4 py-2">{employee.departments?.name || 'N/A'}</td>
                    <td className="border px-4 py-2">{employee.hire_date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border px-4 py-2 text-center">No employees found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-bold mb-2">Integration with Strategic Growth Planner</h2>
        <p>
          This integration directly syncs employee and department data that can be used in your Strategic Growth Planner scenarios. 
          The synced data will be available for department-level headcount projections based on revenue targets.
        </p>
      </div>
    </div>
  );
}

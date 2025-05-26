'use client';

import { useEffect, useState } from 'react';

export default function SimpleDebugPage() {
  const [status, setStatus] = useState('Initializing...');
  const [envVars, setEnvVars] = useState({
    supabaseUrl: 'Not loaded',
    hasAnonKey: false,
  });

  useEffect(() => {
    // Basic check to see if we can run client-side code
    setStatus('Running client-side checks...');
    
    // Check environment variables
    setEnvVars({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not found',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    
    // Simple test to see if we can set state
    const timer = setTimeout(() => {
      setStatus('Client-side checks completed');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Simple Debug Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <h2 className="font-semibold mb-2">Status</h2>
            <p>{status}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <h2 className="font-semibold mb-2">Environment Variables</h2>
            <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify({
                NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
                NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
              }, null, 2)}
            </pre>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <h2 className="font-semibold mb-2">Next.js Info</h2>
            <div className="space-y-2">
              <p>Running in browser: {typeof window !== 'undefined' ? '✅ Yes' : '❌ No'}</p>
              <p>NODE_ENV: {process.env.NODE_ENV}</p>
              <p>NEXT_PHASE: {process.env.NEXT_PHASE || 'Not available'}</p>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded border border-purple-200">
            <h2 className="font-semibold mb-2">Simple Test</h2>
            <p>If you can see this, the page is rendering correctly.</p>
            <p className="mt-2">Current time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

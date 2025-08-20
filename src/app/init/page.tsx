'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initApi } from '@/lib/services/api';
import AppLayout from '@/components/AppLayout';

export default function InitializePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; data: { organizations: number; users: number; cohorts: number; students: number; assignments: number } } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await initApi.initialize();
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-center py-16">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Database Initialization
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Click the button below to initialize the database with demo data.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-medium">Success!</h3>
              <p className="text-green-700 text-sm mt-1">{result.message}</p>
              {result.data && (
                <div className="mt-2 text-sm text-green-600">
                  <p>Created:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>{result.data.organizations} organization</li>
                    <li>{result.data.users} user</li>
                    <li>{result.data.cohorts} cohorts</li>
                    <li>{result.data.students} students</li>
                    <li>{result.data.assignments} assignments</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Initializing...' : 'Initialize Database'}
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}
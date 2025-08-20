'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Vocational Scheduler
            </h1>
            <nav className="flex space-x-4">
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </button>
              <button 
                onClick={() => router.push('/students')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Students
              </button>
              <button 
                onClick={() => router.push('/schedules')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Schedules
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Vocational Scheduler
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Manage student schedules, assignments, and classes with ease
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add New Assignment
                </h3>
                <p className="text-gray-600 mb-4">
                  Create a new assignment with student, location, time, and duration
                </p>
                <button 
                  onClick={() => router.push('/assignments/new')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Assignment
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  View Schedules
                </h3>
                <p className="text-gray-600 mb-4">
                  View individual student schedules or class schedules
                </p>
                <button 
                  onClick={() => router.push('/schedules')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  View Schedules
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Manage Students
                </h3>
                <p className="text-gray-600 mb-4">
                  Add, edit, or organize students and classes
                </p>
                <button 
                  onClick={() => router.push('/students')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Manage Students
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
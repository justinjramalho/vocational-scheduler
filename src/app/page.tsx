'use client';

import { useRouter } from 'next/navigation';
import SkipNavigation from '@/components/SkipNavigation';
import AccessibleButton from '@/components/AccessibleButton';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  const router = useRouter();
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <SkipNavigation />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b" role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">
                Vocational Scheduler
              </h1>
              <nav 
                id="navigation"
                className="flex space-x-4" 
                role="navigation"
                aria-label="Main navigation"
              >
                <AccessibleButton
                  variant="tertiary"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  aria-describedby="dashboard-description"
                >
                  Dashboard
                </AccessibleButton>
                <AccessibleButton
                  variant="tertiary"
                  onClick={() => router.push('/students')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  aria-describedby="students-description"
                >
                  Students
                </AccessibleButton>
                <AccessibleButton
                  variant="tertiary"
                  onClick={() => router.push('/schedules')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  aria-describedby="schedules-description"
                >
                  Schedules
                </AccessibleButton>
              </nav>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main 
        id="main-content"
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" 
        role="main"
      >
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Vocational Scheduler
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Accessible schedule management for special education vocational programs
            </p>
            
            {/* Quick Actions */}
            <section 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
              aria-labelledby="quick-actions-heading"
            >
              <h3 id="quick-actions-heading" className="sr-only">
                Quick Actions
              </h3>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add New Assignment
                </h3>
                <p className="text-gray-600 mb-4">
                  Create a new assignment with student, location, time, and duration
                </p>
                <AccessibleButton 
                  onClick={() => router.push('/assignments/new')}
                  variant="primary"
                  aria-describedby="add-assignment-description"
                >
                  Add Assignment
                </AccessibleButton>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  View Schedules
                </h3>
                <p className="text-gray-600 mb-4">
                  View individual student schedules or class schedules
                </p>
                <AccessibleButton 
                  onClick={() => router.push('/schedules')}
                  variant="primary"
                  className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  aria-describedby="view-schedules-description"
                >
                  View Schedules
                </AccessibleButton>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Manage Students
                </h3>
                <p className="text-gray-600 mb-4">
                  Add, edit, or organize students and classes
                </p>
                <AccessibleButton 
                  onClick={() => router.push('/students')}
                  variant="primary"
                  className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                  aria-describedby="manage-students-description"
                >
                  Manage Students
                </AccessibleButton>
              </div>
            </section>

            {/* Screen reader descriptions */}
            <div className="sr-only">
              <p id="dashboard-description">Navigate to the main dashboard overview</p>
              <p id="students-description">View and manage student information</p>
              <p id="schedules-description">Access student and class schedules</p>
              <p id="add-assignment-description">Create new assignments for students</p>
              <p id="view-schedules-description">Browse existing student schedules</p>
              <p id="manage-students-description">Add, edit, or remove students from the system</p>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}
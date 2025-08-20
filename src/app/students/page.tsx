'use client';

import { useRouter } from 'next/navigation';
import StudentManagement from '@/components/StudentManagement';
import SkipNavigation from '@/components/SkipNavigation';
import AccessibleButton from '@/components/AccessibleButton';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function StudentsPage() {
  const router = useRouter();

  const handleAddAssignment = (studentId: string) => {
    // Navigate to assignment form with student pre-selected
    router.push(`/assignments/new?studentId=${studentId}`);
  };

  const handleViewSchedule = (studentId: string) => {
    // Navigate to individual student schedule
    router.push(`/schedules/student/${studentId}`);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <SkipNavigation />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b" role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">
                <AccessibleButton 
                  variant="tertiary"
                  onClick={() => router.push('/')}
                  className="hover:text-blue-600 transition-colors p-0 min-h-auto"
                  aria-describedby="home-navigation-description"
                >
                  Vocational Scheduler
                </AccessibleButton>
              </h1>
              <nav 
                id="navigation"
                className="flex space-x-4" 
                role="navigation"
                aria-label="Main navigation"
              >
                <AccessibleButton 
                  variant="tertiary"
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  aria-describedby="dashboard-navigation-description"
                >
                  Dashboard
                </AccessibleButton>
                <AccessibleButton 
                  variant="tertiary"
                  className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  aria-current="page"
                  aria-describedby="students-current-page-description"
                >
                  Students
                </AccessibleButton>
                <AccessibleButton 
                  variant="tertiary"
                  onClick={() => router.push('/schedules')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  aria-describedby="schedules-navigation-description"
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
          <div className="px-4 sm:px-0">
            <StudentManagement
              onAddAssignment={handleAddAssignment}
              onViewSchedule={handleViewSchedule}
            />
          </div>
        </main>
        
        {/* Screen reader descriptions */}
        <div className="sr-only">
          <p id="home-navigation-description">Navigate to the home page</p>
          <p id="dashboard-navigation-description">Navigate to the main dashboard</p>
          <p id="students-current-page-description">Currently viewing students page</p>
          <p id="schedules-navigation-description">Navigate to schedules page</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}
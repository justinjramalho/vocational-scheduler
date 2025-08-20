'use client';

import { useRouter } from 'next/navigation';
import StudentManagement from '@/components/StudentManagement';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              <button 
                onClick={() => router.push('/')}
                className="hover:text-blue-600 transition-colors"
              >
                Vocational Scheduler
              </button>
            </h1>
            <nav className="flex space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 rounded-md text-sm font-medium">
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
        <div className="px-4 sm:px-0">
          <StudentManagement
            onAddAssignment={handleAddAssignment}
            onViewSchedule={handleViewSchedule}
          />
        </div>
      </main>
    </div>
  );
}
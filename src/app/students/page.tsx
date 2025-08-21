'use client';

import { useRouter } from 'next/navigation';
import StudentManagement from '@/components/StudentManagement';
import AppLayout from '@/components/AppLayout';
import AccessibleButton from '@/components/AccessibleButton';

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
    <AppLayout>
      <div className="px-4 sm:px-0">
        <StudentManagement
          onAddAssignment={handleAddAssignment}
          onViewSchedule={handleViewSchedule}
        />

        {/* Quick Actions Section */}
        <section 
          className="mt-12"
          aria-labelledby="quick-actions-heading"
        >
          <h3 id="quick-actions-heading" className="text-xl font-semibold text-gray-900 mb-6">
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AccessibleButton
              onClick={() => router.push('/assignments/new')}
              variant="secondary"
              className="bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-center flex-col"
              aria-describedby="add-assignment-quick-description"
            >
              <div className="text-4xl mb-1" aria-hidden="true">📝</div>
              <div className="text-sm font-medium">Create Assignment</div>
            </AccessibleButton>
            
            <AccessibleButton
              onClick={() => router.push('/schedules')}
              variant="secondary"
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center flex-col"
              aria-describedby="view-schedules-quick-description"
            >
              <div className="text-4xl mb-1" aria-hidden="true">📅</div>
              <div className="text-sm font-medium">View Schedules</div>
            </AccessibleButton>
            
            <AccessibleButton
              disabled
              variant="secondary"
              className="bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors text-center flex-col cursor-not-allowed disabled:opacity-100 disabled:bg-blue-600"
              aria-describedby="export-students-description"
            >
              <div className="text-4xl mb-1" aria-hidden="true">📋</div>
              <div className="text-sm font-medium">Export Students Data</div>
              <div className="text-xs opacity-75">(Coming Soon)</div>
            </AccessibleButton>
          </div>
          
          {/* Screen reader descriptions */}
          <div className="sr-only">
            <p id="add-assignment-quick-description">Create a new assignment for students</p>
            <p id="view-schedules-quick-description">Navigate to the schedules page to view student and cohort schedules</p>
            <p id="export-students-description">Export student data and information - feature coming soon</p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
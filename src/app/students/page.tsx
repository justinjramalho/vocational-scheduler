'use client';

import { useRouter } from 'next/navigation';
import StudentManagement from '@/components/StudentManagement';
import AppLayout from '@/components/AppLayout';

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
      </div>
    </AppLayout>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Program } from '@/types';
import StudentManagement from '@/components/StudentManagement';
import AppLayout from '@/components/AppLayout';
import AccessibleButton from '@/components/AccessibleButton';
import ProgramSelectionModal from '@/components/ProgramSelectionModal';
import { useProgramSelection } from '@/hooks/useProgramSelection';

export default function StudentsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    currentProgramId,
    defaultProgramId,
    currentProgramName,
    setCurrentProgram,
    setDefaultProgram,
  } = useProgramSelection(programs);

  // Load programs data
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs');
        if (response.ok) {
          const programsData = await response.json();
          setPrograms(programsData);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, []);

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
        {/* Program Title Header */}
        <div className="text-center mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="hidden sm:block flex-1"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 order-1 sm:order-none">
              {currentProgramName}
            </h1>
            <div className="flex-1 flex justify-center sm:justify-end order-2 sm:order-none">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 sm:px-0 sm:py-0 min-h-[44px] sm:min-h-0"
                aria-label="Change program selection"
              >
                Change Program
              </button>
            </div>
          </div>
        </div>

        <StudentManagement
          onAddAssignment={handleAddAssignment}
          onViewSchedule={handleViewSchedule}
          currentProgramId={currentProgramId}
          currentProgramName={currentProgramName}
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
              variant="primary"
              className="!bg-purple-600 !text-white px-4 py-3 rounded-lg !hover:bg-purple-700 transition-colors text-center flex-col"
              aria-describedby="add-assignment-quick-description"
            >
              <div className="text-4xl mb-1" aria-hidden="true">📝</div>
              <div className="text-sm font-medium">Create Activity</div>
            </AccessibleButton>
            
            <AccessibleButton
              onClick={() => router.push('/schedules')}
              variant="primary"
              className="!bg-green-600 !text-white px-4 py-3 rounded-lg !hover:bg-green-700 transition-colors text-center flex-col"
              aria-describedby="view-schedules-quick-description"
            >
              <div className="text-4xl mb-1" aria-hidden="true">📅</div>
              <div className="text-sm font-medium">View Schedules</div>
            </AccessibleButton>
            
            <AccessibleButton
              disabled
              variant="primary"
              className="!bg-blue-600 !text-white px-4 py-3 rounded-lg transition-colors text-center flex-col cursor-not-allowed !disabled:opacity-100 !disabled:bg-blue-600"
              aria-describedby="export-students-description"
            >
              <div className="text-4xl mb-1" aria-hidden="true">📋</div>
              <div className="text-sm font-medium">Export Students Data</div>
              <div className="text-xs opacity-75">(Coming Soon)</div>
            </AccessibleButton>
          </div>
          
          {/* Screen reader descriptions */}
          <div className="sr-only">
            <p id="add-assignment-quick-description">Create a new activity for students</p>
            <p id="view-schedules-quick-description">Navigate to the schedules page to view student and cohort schedules</p>
            <p id="export-students-description">Export student data and information - feature coming soon</p>
          </div>
        </section>

        {/* Program Selection Modal */}
        <ProgramSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          programs={programs}
          currentProgramId={currentProgramId}
          defaultProgramId={defaultProgramId}
          onProgramSelect={setCurrentProgram}
          onDefaultProgramChange={setDefaultProgram}
        />
      </div>
    </AppLayout>
  );
}
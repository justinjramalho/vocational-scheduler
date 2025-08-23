'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ScheduleView from '@/components/ScheduleView';
import { Program } from '@/types';
import AppLayout from '@/components/AppLayout';

export default function ProgramSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const programId = params.id as string;
        const response = await fetch('/api/programs');
        
        if (response.ok) {
          const programsData = await response.json();
          const foundProgram = programsData.find((p: Program) => p.id === programId);
          setProgram(foundProgram || null);
        } else {
          setProgram(null);
        }
      } catch (error) {
        console.error('Error fetching program:', error);
        setProgram(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [params.id]);

  const handleNavigateToMenu = () => {
    router.push('/');
  };

  const handleAddAssignment = () => {
    router.push(`/assignments/new?programId=${params.id}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Loading program schedule...</span>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!program) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">😞</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Program Not Found</h1>
            <p className="text-gray-600 mb-4">The requested program could not be found.</p>
            <button
              onClick={() => router.push('/schedules')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Schedules
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScheduleView
        viewType="program"
        targetId={program.id}
        program={program}
        onNavigateToMenu={handleNavigateToMenu}
        onAddAssignment={handleAddAssignment}
      />
    </AppLayout>
  );
}

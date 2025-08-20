'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ScheduleView from '@/components/ScheduleView';
import { StudentCohort } from '@/types';

export default function CohortSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const [cohort, setCohort] = useState<StudentCohort | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCohort = async () => {
      try {
        const cohortId = params.id as string;
        const response = await fetch('/api/cohorts');
        
        if (response.ok) {
          const cohortsData = await response.json();
          const foundCohort = cohortsData.find((c: StudentCohort) => c.id === cohortId);
          setCohort(foundCohort || null);
        } else {
          setCohort(null);
        }
      } catch (error) {
        console.error('Error fetching cohort:', error);
        setCohort(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCohort();
  }, [params.id]);

  const handleNavigateToMenu = () => {
    router.push('/');
  };

  const handleAddAssignment = () => {
    router.push(`/assignments/new?cohortId=${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading cohort schedule...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">😞</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Cohort Not Found</h1>
          <p className="text-gray-600 mb-4">The requested cohort could not be found.</p>
          <button
            onClick={() => router.push('/schedules')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Schedules
          </button>
        </div>
      </div>
    );
  }

  return (
    <ScheduleView
      viewType="cohort"
      targetId={cohort.id}
      cohort={cohort}
      onNavigateToMenu={handleNavigateToMenu}
      onAddAssignment={handleAddAssignment}
    />
  );
}

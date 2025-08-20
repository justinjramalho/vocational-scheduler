'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AssignmentForm from '@/components/AssignmentForm';
import { AssignmentFormData, Student } from '@/types';

function NewAssignmentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [initialFormData, setInitialFormData] = useState<Partial<AssignmentFormData>>({});

  // Fetch students and handle pre-selected student from URL params
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students');
        if (response.ok) {
          const studentsData = await response.json();
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();

    const studentId = searchParams.get('studentId');
    const cohortId = searchParams.get('cohortId');
    
    if (studentId) {
      setInitialFormData({ studentId });
    } else if (cohortId) {
      // For cohort assignments, we'll let user select from cohort students
      setInitialFormData({ cohortId });
    }
  }, [searchParams]);

  const handleSubmit = async (formData: AssignmentFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Assignment created successfully!');
        router.push('/schedules');
      } else {
        throw new Error('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Error creating assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
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
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
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
      <main className="py-6">
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Creating assignment...</span>
              </div>
            </div>
          </div>
        )}
        
        <AssignmentForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          students={students}
          initialData={initialFormData}
          loading={loadingStudents}
        />
      </main>
    </div>
  );
}

export default function NewAssignmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <NewAssignmentPageInner />
    </Suspense>
  );
}
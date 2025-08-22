'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AssignmentForm from '@/components/AssignmentForm';
import { AssignmentFormData, Student } from '@/types';
import AppLayout from '@/components/AppLayout';

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
      // Note: cohortId is used for form context but not part of AssignmentFormData
      setInitialFormData({});
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
    <AppLayout>
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
    </AppLayout>
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
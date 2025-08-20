'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ScheduleView from '@/components/ScheduleView';
import { Student } from '@/types';

export default function StudentSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentId = params.id as string;
        const response = await fetch(`/api/students/${studentId}`);
        
        if (response.ok) {
          const studentData = await response.json();
          setStudent(studentData);
        } else {
          setStudent(null);
        }
      } catch (error) {
        console.error('Error fetching student:', error);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params.id]);

  const handleNavigateToMenu = () => {
    router.push('/');
  };

  const handleAddAssignment = () => {
    router.push(`/assignments/new?studentId=${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading schedule...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">😞</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Student Not Found</h1>
          <p className="text-gray-600 mb-4">The requested student could not be found.</p>
          <button
            onClick={() => router.push('/students')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <ScheduleView
      viewType="student"
      targetId={student.id}
      student={student}
      onNavigateToMenu={handleNavigateToMenu}
      onAddAssignment={handleAddAssignment}
    />
  );
}
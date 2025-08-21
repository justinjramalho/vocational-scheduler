'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Student, StudentCohort } from '@/types';
import AppLayout from '@/components/AppLayout';
import AccessibleButton from '@/components/AccessibleButton';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SchedulesPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [cohorts, setCohorts] = useState<StudentCohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, cohortsResponse] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/cohorts')
        ]);
        
        if (studentsResponse.ok && cohortsResponse.ok) {
          const studentsData = await studentsResponse.json();
          const cohortsData = await cohortsResponse.json();
          setStudents(studentsData);
          setCohorts(cohortsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AppLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Views</h2>
          <p className="text-gray-600">View individual student schedules or cohort-wide schedules</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Individual Student Schedules */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Individual Students</h3>
              <p className="text-gray-600">View daily schedules for specific students</p>
            </div>
            <div className="p-6">
              {loading ? (
                <LoadingSpinner aria-label="Loading students" />
              ) : students.length > 0 ? (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.fullName}</h4>
                        <p className="text-sm text-gray-600">{student.grade} | {student.cohortName || student.program}</p>
                      </div>
                      <AccessibleButton
                        onClick={() => router.push(`/schedules/student/${student.id}`)}
                        variant="primary"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        View Schedule
                      </AccessibleButton>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-2xl mb-2">👥</div>
                  <p className="text-gray-600">No students available</p>
                </div>
              )}
            </div>
          </div>

          {/* Cohort Schedules */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cohort Schedules</h3>
              <p className="text-gray-600">View schedules for entire groups or classes</p>
            </div>
            <div className="p-6">
              {loading ? (
                <LoadingSpinner aria-label="Loading cohorts" />
              ) : cohorts.length > 0 ? (
                <div className="space-y-3">
                  {cohorts.map((cohort) => (
                    <div key={cohort.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="font-medium text-gray-900">{cohort.name}</h4>
                        <p className="text-sm text-gray-600">{cohort.description}</p>
                      </div>
                      <AccessibleButton
                        onClick={() => router.push(`/schedules/cohort/${cohort.id}`)}
                        variant="primary"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        View Schedule
                      </AccessibleButton>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-2xl mb-2">🎓</div>
                  <p className="text-gray-600">No cohorts available</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
              onClick={() => router.push('/students')}
              variant="secondary"
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center flex-col"
              aria-describedby="manage-students-quick-description"
            >
              <div className="text-4xl mb-1" aria-hidden="true">👥</div>
              <div className="text-sm font-medium">Manage Students</div>
            </AccessibleButton>
            
            <AccessibleButton
              disabled
              variant="secondary"
              className="bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors text-center flex-col cursor-not-allowed disabled:opacity-100 disabled:bg-blue-600"
              aria-describedby="export-schedules-description"
            >
              <div className="text-4xl mb-1" aria-hidden="true">📊</div>
              <div className="text-sm font-medium">Export Schedules</div>
              <div className="text-xs opacity-75">(Coming Soon)</div>
            </AccessibleButton>
          </div>
          
          {/* Screen reader descriptions */}
          <div className="sr-only">
            <p id="add-assignment-quick-description">Create a new assignment for students</p>
            <p id="manage-students-quick-description">Add, edit, or view student information</p>
            <p id="export-schedules-description">Export schedule data - feature coming soon</p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Student, StudentCohort } from '@/types';

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
              <button 
                onClick={() => router.push('/students')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Students
              </button>
              <button className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Schedules
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Views</h2>
            <p className="text-gray-600">View individual student schedules or cohort-wide schedules</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Individual Student Schedules */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Individual Student Schedules</h3>
                <p className="text-sm text-gray-600 mt-1">View daily schedules for specific students</p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading students...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.filter(s => s.active).map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.fullName}</p>
                          <p className="text-xs text-gray-600">{student.cohortName || 'No cohort'} • {student.grade || 'No grade'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/schedules/student/${student.id}`)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        View Schedule
                      </button>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cohort Schedules */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Cohort Schedules</h3>
                <p className="text-sm text-gray-600 mt-1">View schedules for entire cohorts or classes</p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading cohorts...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cohorts.filter(c => c.active).map(cohort => (
                    <div key={cohort.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: (cohort.color || '#3B82F6') + '20', color: cohort.color || '#3B82F6' }}
                        >
                          <span className="text-sm font-medium">
                            {cohort.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cohort.name}</p>
                          <p className="text-xs text-gray-600">
                            {cohort.studentCount || 0} student{cohort.studentCount !== 1 ? 's' : ''} • {cohort.teacherName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/schedules/cohort/${cohort.id}`)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        View Schedule
                      </button>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/assignments/new')}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                <div className="text-lg mb-1">📅</div>
                <div className="text-sm font-medium">Add New Assignment</div>
              </button>
              
              <button
                onClick={() => router.push('/students')}
                className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center"
              >
                <div className="text-lg mb-1">👥</div>
                <div className="text-sm font-medium">Manage Students</div>
              </button>

              <button
                className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
                disabled
              >
                <div className="text-lg mb-1">📊</div>
                <div className="text-sm font-medium">Export Schedules</div>
                <div className="text-xs opacity-75">(Coming Soon)</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
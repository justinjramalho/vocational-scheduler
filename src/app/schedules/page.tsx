'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Student, StudentCohort } from '@/types';
import SkipNavigation from '@/components/SkipNavigation';
import AccessibleButton from '@/components/AccessibleButton';
import ErrorBoundary from '@/components/ErrorBoundary';
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
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <SkipNavigation />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b" role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">
                <AccessibleButton 
                  variant="tertiary"
                  onClick={() => router.push('/')}
                  className="hover:text-blue-600 transition-colors p-0 min-h-auto"
                  aria-describedby="home-navigation-description"
                >
                  Vocational Scheduler
                </AccessibleButton>
              </h1>
              <nav 
                id="navigation"
                className="flex space-x-4" 
                role="navigation"
                aria-label="Main navigation"
              >
                <AccessibleButton 
                  variant="tertiary"
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  aria-describedby="dashboard-navigation-description"
                >
                  Dashboard
                </AccessibleButton>
                <AccessibleButton 
                  variant="tertiary"
                  onClick={() => router.push('/students')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  aria-describedby="students-navigation-description"
                >
                  Students
                </AccessibleButton>
                <AccessibleButton 
                  variant="tertiary"
                  className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  aria-current="page"
                  aria-describedby="schedules-current-page-description"
                >
                  Schedules
                </AccessibleButton>
              </nav>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main 
        id="main-content"
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" 
        role="main"
      >
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
                  <LoadingSpinner 
                    message="Loading students..." 
                    aria-label="Loading student information"
                  />
                ) : (
                  <div className="space-y-3" role="list" aria-label="Student list">
                    {students.filter(s => s.active).map(student => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      role="listitem"
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600" aria-hidden="true">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.fullName}</p>
                          <p className="text-xs text-gray-600">{student.cohortName || 'No cohort'} • {student.grade || 'No grade'}</p>
                        </div>
                      </div>
                      <AccessibleButton
                        onClick={() => router.push(`/schedules/student/${student.id}`)}
                        variant="secondary"
                        size="sm"
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                        aria-describedby={`view-schedule-${student.id}-description`}
                      >
                        View Schedule
                      </AccessibleButton>
                      <span className="sr-only" id={`view-schedule-${student.id}-description`}>
                        View daily schedule for {student.fullName}
                      </span>
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
                  <LoadingSpinner 
                    message="Loading cohorts..." 
                    aria-label="Loading cohort information"
                  />
                ) : (
                  <div className="space-y-3" role="list" aria-label="Cohort list">
                    {cohorts.filter(c => c.active).map(cohort => (
                    <div 
                      key={cohort.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      role="listitem"
                    >
                      <div className="flex items-center">
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: (cohort.color || '#3B82F6') + '20', color: cohort.color || '#3B82F6' }}
                          aria-hidden="true"
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
                      <AccessibleButton
                        onClick={() => router.push(`/schedules/cohort/${cohort.id}`)}
                        variant="secondary"
                        size="sm"
                        className="bg-green-100 hover:bg-green-200 text-green-700"
                        aria-describedby={`view-cohort-schedule-${cohort.id}-description`}
                      >
                        View Schedule
                      </AccessibleButton>
                      <span className="sr-only" id={`view-cohort-schedule-${cohort.id}-description`}>
                        View cohort schedule for {cohort.name} with {cohort.studentCount || 0} students
                      </span>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="mt-8 bg-white rounded-lg shadow p-6" aria-labelledby="quick-actions-heading">
            <h3 id="quick-actions-heading" className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AccessibleButton
                onClick={() => router.push('/assignments/new')}
                variant="primary"
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center flex-col"
                aria-describedby="add-assignment-quick-description"
              >
                <div className="text-lg mb-1" aria-hidden="true">📅</div>
                <div className="text-sm font-medium">Add New Assignment</div>
              </AccessibleButton>
              
              <AccessibleButton
                onClick={() => router.push('/students')}
                variant="primary"
                className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center flex-col"
                aria-describedby="manage-students-quick-description"
              >
                <div className="text-lg mb-1" aria-hidden="true">👥</div>
                <div className="text-sm font-medium">Manage Students</div>
              </AccessibleButton>

              <AccessibleButton
                disabled
                variant="secondary"
                className="bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors text-center flex-col opacity-50 cursor-not-allowed"
                aria-describedby="export-schedules-description"
              >
                <div className="text-lg mb-1" aria-hidden="true">📊</div>
                <div className="text-sm font-medium">Export Schedules</div>
                <div className="text-xs opacity-75">(Coming Soon)</div>
              </AccessibleButton>
            </div>
            
            {/* Screen reader descriptions */}
            <div className="sr-only">
              <p id="home-navigation-description">Navigate to the home page</p>
              <p id="dashboard-navigation-description">Navigate to the main dashboard</p>
              <p id="students-navigation-description">Navigate to student management</p>
              <p id="schedules-current-page-description">Currently viewing schedules page</p>
              <p id="add-assignment-quick-description">Create a new assignment for students</p>
              <p id="manage-students-quick-description">Add, edit, or view student information</p>
              <p id="export-schedules-description">Export schedule data - feature coming soon</p>
            </div>
          </section>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AccessibleButton from '@/components/AccessibleButton';

export default function Home() {
  const router = useRouter();
  return (
    <AppLayout className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
          {/* Enhanced Welcome Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to Vocational Scheduler
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              A comprehensive scheduling and management system designed for vocational education programs in special education settings.
            </p>
          </div>
            
          {/* Enhanced Quick Actions Cards */}
          <section 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            aria-labelledby="quick-actions-heading"
          >
            <h3 id="quick-actions-heading" className="sr-only">
              Quick Actions
            </h3>
            
            {/* Card 1: View Schedules (First on mobile) */}
            <article className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto bg-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  View Schedules
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Browse and manage all student schedules
                </p>
              </div>
              <AccessibleButton 
                onClick={() => router.push('/schedules')}
                variant="primary"
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full"
                aria-describedby="view-schedules-description"
              >
                View Schedules
              </AccessibleButton>
            </article>
            
            {/* Card 2: Manage Students (Second on mobile) */}
            <article className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Manage Students
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Manage student information and schedules
                </p>
              </div>
              <AccessibleButton 
                onClick={() => router.push('/students')}
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 w-full"
                aria-describedby="manage-students-description"
              >
                Manage Students
              </AccessibleButton>
            </article>
            
            {/* Card 3: Create Assignment (Third on mobile) */}
            <article className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto bg-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Create Activity
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Add new activities for students
                </p>
              </div>
              <AccessibleButton 
                onClick={() => router.push('/assignments/new')}
                variant="primary"
                className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 w-full"
                aria-describedby="add-assignment-description"
              >
                Create Activity
              </AccessibleButton>
            </article>
          </section>

          {/* System Features Section */}
          <section className="mb-16" aria-labelledby="system-features-heading">
            <div className="text-center mb-12">
              <h3 id="system-features-heading" className="text-3xl font-bold text-gray-900 mb-4">
                System Features
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Individual Scheduling */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors duration-300">
                  <span className="text-4xl" role="img" aria-label="Individual scheduling">
                    👤
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Individual Scheduling</h4>
                <p className="text-gray-600 text-sm">Customized schedules for each student&apos;s unique needs</p>
              </div>
              
              {/* LMS Integration */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <span className="text-4xl" role="img" aria-label="LMS integration">
                    💻
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">LMS Integration</h4>
                <p className="text-gray-600 text-sm">Seamless integration with learning management systems and educational platforms</p>
              </div>
              
              {/* Vocational Training */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors duration-300">
                  <span className="text-4xl" role="img" aria-label="Vocational training">
                    🔧
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Vocational Training</h4>
                <p className="text-gray-600 text-sm">Manage job site placements and training schedules</p>
              </div>
              
              {/* Multi-Role Support */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-300">
                  <span className="text-4xl" role="img" aria-label="Multi-role support">
                    👥
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Multi-Role Support</h4>
                <p className="text-gray-600 text-sm">Supports administrators, teachers, therapists, and staff</p>
              </div>
            </div>
          </section>

          {/* Screen reader descriptions */}
          <div className="sr-only">
            <p id="add-assignment-description">Create new activities for students</p>
            <p id="view-schedules-description">Browse existing student schedules</p>
            <p id="manage-students-description">Add, edit, or remove students from the system</p>
          </div>
        
      </div>
    </AppLayout>
  );
}
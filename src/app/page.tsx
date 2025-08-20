'use client';

import { useRouter } from 'next/navigation';
import SkipNavigation from '@/components/SkipNavigation';
import AccessibleButton from '@/components/AccessibleButton';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  const router = useRouter();
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <SkipNavigation />
        
        {/* Enhanced Elevated Header */}
        <header className="bg-white shadow-lg border-b border-gray-100" role="banner" style={{boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo/Brand */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">
                  Vocational Scheduler
                </h1>
              </div>
              
              {/* Centered Navigation with Icons */}
              <nav 
                id="navigation"
                className="hidden md:flex items-center justify-center flex-1 space-x-8" 
                role="navigation"
                aria-label="Main navigation"
              >
                <AccessibleButton
                  variant="tertiary"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors border-transparent focus:border-blue-500"
                  aria-current="page"
                  aria-describedby="dashboard-description"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Dashboard</span>
                </AccessibleButton>
                
                <AccessibleButton
                  variant="tertiary"
                  onClick={() => router.push('/students')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors border-transparent focus:border-blue-500"
                  aria-describedby="students-description"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Students</span>
                </AccessibleButton>
                
                <AccessibleButton
                  variant="tertiary"
                  onClick={() => router.push('/schedules')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors border-transparent focus:border-blue-500"
                  aria-describedby="schedules-description"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Schedules</span>
                </AccessibleButton>
                
                <AccessibleButton
                  variant="tertiary"
                  onClick={() => router.push('/assignments/new')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors border-transparent focus:border-blue-500"
                  aria-describedby="assignments-description"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Assignments</span>
                </AccessibleButton>
              </nav>

              {/* Authentication Area (Prepared for Future) */}
              <div className="flex items-center space-x-4">
                {/* Placeholder for Sign In Button */}
                <div className="hidden md:block">
                  <AccessibleButton
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    aria-describedby="signin-description"
                    disabled
                  >
                    Sign In
                  </AccessibleButton>
                </div>
                
                {/* Mobile menu button */}
                <div className="md:hidden">
                  <AccessibleButton
                    variant="tertiary"
                    className="text-gray-600 hover:text-gray-900 p-2"
                    aria-label="Open mobile menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </AccessibleButton>
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main 
        id="main-content"
        className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8" 
        role="main"
      >
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
                  Create Assignment
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Add new assignments for students
                </p>
              </div>
              <AccessibleButton 
                onClick={() => router.push('/assignments/new')}
                variant="primary"
                className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 w-full"
                aria-describedby="add-assignment-description"
              >
                Create Assignment
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
                <p className="text-gray-600 text-sm">Customized schedules for each student's unique needs</p>
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
            <p id="dashboard-description">Navigate to the main dashboard</p>
            <p id="students-description">View and manage student information</p>
            <p id="schedules-description">Access student and class schedules</p>
            <p id="assignments-description">Create and manage assignments</p>
            <p id="signin-description">Sign in to access your account (feature coming soon)</p>
            <p id="add-assignment-description">Create new assignments for students</p>
            <p id="view-schedules-description">Browse existing student schedules</p>
            <p id="manage-students-description">Add, edit, or remove students from the system</p>
          </div>
        </div>
      </main>

      {/* Simple Footer - Expandable for Future Development */}
      <footer 
        className="bg-white border-t border-gray-200 mt-16" 
        role="contentinfo"
        aria-labelledby="footer-heading"
      >
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Footer Brand */}
            <h2 id="footer-heading" className="text-lg font-semibold text-blue-600 mb-4">
              Vocational Scheduler
            </h2>
            
            {/* Footer Description */}
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Empowering special education vocational programs with accessible, comprehensive scheduling solutions.
            </p>
            
            {/* Footer Links - Prepared for Future Development */}
            <nav 
              className="flex flex-wrap justify-center gap-6 mb-6"
              aria-label="Footer navigation"
            >
              <AccessibleButton
                variant="tertiary"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium border-transparent focus:border-blue-500 transition-colors"
                disabled
                aria-describedby="about-description"
              >
                About
              </AccessibleButton>
              
              <AccessibleButton
                variant="tertiary"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium border-transparent focus:border-blue-500 transition-colors"
                disabled
                aria-describedby="privacy-description"
              >
                Privacy Policy
              </AccessibleButton>
              
              <AccessibleButton
                variant="tertiary"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium border-transparent focus:border-blue-500 transition-colors"
                disabled
                aria-describedby="terms-description"
              >
                Terms of Service
              </AccessibleButton>
              
              <AccessibleButton
                variant="tertiary"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium border-transparent focus:border-blue-500 transition-colors"
                disabled
                aria-describedby="support-description"
              >
                Support
              </AccessibleButton>
            </nav>
            
            {/* Copyright and Accessibility Statement */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-500">
                <p>
                  © 2025 Vocational Scheduler. Built for accessibility.
                </p>
                
                {/* Accessibility Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    WCAG 2.1 AA
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    508 Compliant
                  </span>
                </div>
              </div>
              
              {/* Version Info - Hidden but available for development */}
              <p className="text-xs text-gray-400 mt-2">
                Version 1.0.0 | Special Education Focus
              </p>
            </div>
          </div>
        </div>
        
        {/* Screen reader descriptions for footer links */}
        <div className="sr-only">
          <p id="about-description">Learn more about Vocational Scheduler (coming soon)</p>
          <p id="privacy-description">Read our privacy policy (coming soon)</p>
          <p id="terms-description">View terms of service (coming soon)</p>
          <p id="support-description">Get help and support (coming soon)</p>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}
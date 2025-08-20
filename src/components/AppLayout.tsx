'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AccessibleButton from './AccessibleButton';
import SkipNavigation from './SkipNavigation';
import ErrorBoundary from './ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    description: 'Navigate to the main dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: '/students',
    label: 'Students',
    description: 'View and manage student information',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    href: '/schedules',
    label: 'Schedules',
    description: 'Access student and class schedules',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/assignments/new',
    label: 'Assignments',
    description: 'Create and manage assignments',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
];

export default function AppLayout({ children, className }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href === '/students' && pathname === '/students') return true;
    if (href === '/schedules' && (pathname.startsWith('/schedules') || pathname.includes('schedule'))) return true;
    if (href === '/assignments' && pathname.startsWith('/assignments')) return true;
    return false;
  };

  const getNavButtonClass = (href: string) => {
    const baseClass = "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border-transparent focus:border-blue-500";
    return isActive(href) 
      ? `${baseClass} text-blue-600 hover:text-blue-700`
      : `${baseClass} text-gray-600 hover:text-gray-900`;
  };

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
              
              {/* Desktop Navigation with Icons */}
              <nav 
                id="navigation"
                className="hidden md:flex items-center justify-center flex-1 space-x-8" 
                role="navigation"
                aria-label="Main navigation"
              >
                {navigationItems.map((item) => (
                  <AccessibleButton
                    key={item.href}
                    variant="tertiary"
                    onClick={() => handleNavigation(item.href)}
                    className={getNavButtonClass(item.href)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    aria-describedby={`${item.label.toLowerCase()}-description`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </AccessibleButton>
                ))}
              </nav>

              {/* Authentication Area & Mobile Menu */}
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
                    onClick={toggleMobileMenu}
                    className="text-gray-600 hover:text-gray-900 p-2 border-transparent focus:border-blue-500"
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                    aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  >
                    {isMobileMenuOpen ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </AccessibleButton>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                onClick={toggleMobileMenu}
                aria-hidden="true"
              />
              
              {/* Mobile Menu Panel */}
              <nav
                id="mobile-menu"
                className="fixed top-0 left-0 z-50 h-full w-80 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden"
                role="navigation"
                aria-label="Mobile navigation"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-blue-600">Navigation</h2>
                  <AccessibleButton
                    onClick={toggleMobileMenu}
                    variant="tertiary"
                    className="p-2 border-transparent focus:border-blue-500"
                    aria-label="Close navigation menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </AccessibleButton>
                </div>

                <div className="px-4 py-4 space-y-2">
                  {navigationItems.map((item) => (
                    <AccessibleButton
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      variant={isActive(item.href) ? 'primary' : 'tertiary'}
                      className={`
                        w-full justify-start px-4 py-3 text-left border-transparent focus:border-blue-500
                        ${isActive(item.href) 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      aria-describedby={`mobile-${item.label.toLowerCase()}-description`}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      <span className="flex items-center space-x-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </span>
                    </AccessibleButton>
                  ))}
                  
                  {/* Mobile Sign In Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <AccessibleButton
                      variant="primary"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors"
                      disabled
                      aria-describedby="mobile-signin-description"
                    >
                      Sign In
                    </AccessibleButton>
                  </div>
                </div>
              </nav>
            </>
          )}
        </header>

        {/* Main Content */}
        <main 
          id="main-content"
          className={className || "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"} 
          role="main"
        >
          {children}
        </main>

        {/* Professional Footer */}
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
                
                {/* Version Info */}
                <p className="text-xs text-gray-400 mt-2">
                  Version 1.0.0 | Special Education Focus
                </p>
              </div>
            </div>
          </div>
          
          {/* Screen reader descriptions */}
          <div className="sr-only">
            {/* Navigation descriptions */}
            {navigationItems.map((item) => (
              <p key={item.href} id={`${item.label.toLowerCase()}-description`}>
                {item.description}
              </p>
            ))}
            {navigationItems.map((item) => (
              <p key={`mobile-${item.href}`} id={`mobile-${item.label.toLowerCase()}-description`}>
                {item.description}
              </p>
            ))}
            
            {/* Other descriptions */}
            <p id="signin-description">Sign in to access your account (feature coming soon)</p>
            <p id="mobile-signin-description">Sign in to access your account (feature coming soon)</p>
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

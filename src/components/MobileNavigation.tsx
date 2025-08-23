'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AccessibleButton from './AccessibleButton';

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
    description: 'Main dashboard overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v10H8V5z" />
      </svg>
    ),
  },
  {
    href: '/students',
    label: 'Students',
    description: 'Manage student information',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    href: '/schedules',
    label: 'Schedules',
    description: 'View and manage schedules',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/assignments/new',
    label: '+ Activity',
    description: 'Create new activity',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
];

export default function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Vocational Scheduler
          </h1>
          
          <AccessibleButton
            onClick={toggleMenu}
            variant="tertiary"
            className="p-2"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? (
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

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={toggleMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu Panel */}
        <nav
          id="mobile-menu"
          className={`
            fixed top-0 left-0 z-50 h-full w-80 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          role="navigation"
          aria-label="Mobile navigation"
          aria-hidden={!isMenuOpen}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <AccessibleButton
              onClick={toggleMenu}
              variant="tertiary"
              className="p-2"
              aria-label="Close navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </AccessibleButton>
          </div>

          <div className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <AccessibleButton
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  variant={isActive ? 'primary' : 'tertiary'}
                  className={`
                    w-full justify-start px-4 py-3 text-left
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  aria-describedby={`nav-${item.href.replace('/', '')}-description`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </span>
                </AccessibleButton>
              );
            })}
          </div>

          {/* Screen reader descriptions */}
          <div className="sr-only">
            {navigationItems.map((item) => (
              <p 
                key={item.href}
                id={`nav-${item.href.replace('/', '')}-description`}
              >
                {item.description}
              </p>
            ))}
          </div>
        </nav>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
        role="navigation"
        aria-label="Bottom navigation"
      >
        <div className="grid grid-cols-4 py-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <AccessibleButton
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                variant="tertiary"
                className={`
                  flex flex-col items-center justify-center py-2 px-1 text-xs
                  ${isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                aria-describedby={`bottom-nav-${item.href.replace('/', '')}-description`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span className="mt-1 text-xs font-medium truncate">{item.label}</span>
              </AccessibleButton>
            );
          })}
        </div>

        {/* Screen reader descriptions for bottom nav */}
        <div className="sr-only">
          {navigationItems.map((item) => (
            <p 
              key={item.href}
              id={`bottom-nav-${item.href.replace('/', '')}-description`}
            >
              Navigate to {item.description}
            </p>
          ))}
        </div>
      </nav>
    </>
  );
}

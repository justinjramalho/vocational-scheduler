'use client';

import { useRouter, usePathname } from 'next/navigation';
import AccessibleButton from './AccessibleButton';

interface AppHeaderProps {
  onNavigateToMenu?: () => void;
}

export default function AppHeader({ onNavigateToMenu }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    if (onNavigateToMenu && path === '/') {
      onNavigateToMenu();
    } else {
      router.push(path);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/students' && pathname === '/students') return true;
    if (path === '/schedules' && (pathname.startsWith('/schedules') || pathname.includes('schedule'))) return true;
    if (path === '/assignments' && pathname.startsWith('/assignments')) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900">
            <AccessibleButton 
              variant="tertiary"
              onClick={() => handleNavigation('/')}
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
              onClick={() => handleNavigation('/')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
              aria-describedby="dashboard-navigation-description"
            >
              Dashboard
            </AccessibleButton>
            <AccessibleButton 
              variant="tertiary"
              onClick={() => handleNavigation('/students')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/students') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/students') ? 'page' : undefined}
              aria-describedby="students-navigation-description"
            >
              Students
            </AccessibleButton>
            <AccessibleButton 
              variant="tertiary"
              onClick={() => handleNavigation('/schedules')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/schedules') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/schedules') ? 'page' : undefined}
              aria-describedby="schedules-navigation-description"
            >
              Schedules
            </AccessibleButton>
          </nav>
        </div>
      </div>
      
      {/* Screen reader descriptions */}
      <div className="sr-only">
        <p id="home-navigation-description">Navigate to the home page</p>
        <p id="dashboard-navigation-description">Navigate to the main dashboard</p>
        <p id="students-navigation-description">Navigate to student management</p>
        <p id="schedules-navigation-description">Navigate to schedules page</p>
      </div>
    </header>
  );
}

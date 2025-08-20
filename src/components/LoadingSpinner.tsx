'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  'aria-label'?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...',
  'aria-label': ariaLabel = 'Loading content'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div 
      className={`flex items-center justify-center ${containerSizeClasses[size]}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="flex items-center space-x-3">
        <svg
          className={`animate-spin ${sizeClasses[size]} text-blue-600`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  );
}

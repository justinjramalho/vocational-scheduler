'use client';

import { useState, useEffect } from 'react';
import { Program } from '@/types';
import AccessibleButton from './AccessibleButton';

interface ProgramSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: Program[];
  currentProgramId: string | null;
  defaultProgramId: string | null;
  onProgramSelect: (programId: string | null) => void;
  onDefaultProgramChange: (programId: string | null) => void;
}

export default function ProgramSelectionModal({
  isOpen,
  onClose,
  programs,
  currentProgramId,
  defaultProgramId,
  onProgramSelect,
  onDefaultProgramChange,
}: ProgramSelectionModalProps) {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(currentProgramId);
  const [selectedDefault, setSelectedDefault] = useState<string | null>(defaultProgramId);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    setSelectedProgram(currentProgramId);
  }, [currentProgramId]);

  useEffect(() => {
    setSelectedDefault(defaultProgramId);
  }, [defaultProgramId]);

  // Handle modal backdrop clicks
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle program selection
  const handleProgramSelect = (programId: string | null) => {
    setSelectedProgram(programId);
  };

  // Handle default program change
  const handleDefaultChange = (programId: string | null) => {
    // Only one program can be default at a time
    setSelectedDefault(selectedDefault === programId ? null : programId);
  };

  // Handle tooltip display
  const handleTooltipToggle = (programId: string) => {
    setShowTooltip(showTooltip === programId ? null : programId);
    // Auto-hide tooltip after 2 seconds
    setTimeout(() => setShowTooltip(null), 2000);
  };

  // Handle save
  const handleSave = () => {
    onProgramSelect(selectedProgram);
    onDefaultProgramChange(selectedDefault);
    onClose();
  };

  if (!isOpen) return null;

  const allProgramsOption = { id: null, name: 'All Programs' };
  const programOptions = [allProgramsOption, ...programs];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="program-selection-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto min-h-0 max-h-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2
              id="program-selection-title"
              className="text-lg font-semibold text-gray-900"
            >
              Select Program
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-4 sm:px-6 py-4 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-3">
            {programOptions.map((program) => {
              const programId = program.id;
              const isSelected = selectedProgram === programId;
              const isDefault = selectedDefault === programId;
              const showingTooltip = showTooltip === programId;

              return (
                <div
                  key={programId || 'all-programs'}
                  className={`
                    relative flex items-center justify-between p-3 sm:p-4 border rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => handleProgramSelect(programId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProgramSelect(programId);
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-describedby={`program-${programId || 'all'}-description`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {program.name}
                    </h3>
                    {program.id && (
                      <p
                        id={`program-${program.id}-description`}
                        className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}
                      >
                        {program.description || 'No description available'}
                      </p>
                    )}
                    {!program.id && (
                      <p
                        id="program-all-description"
                        className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}
                      >
                        View all programs and students
                      </p>
                    )}
                  </div>

                  {/* Star Icon for Default Selection */}
                  <div className="relative ml-3 sm:ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDefaultChange(programId);
                        handleTooltipToggle(programId || 'all');
                      }}
                      className={`
                        p-2 sm:p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center
                        ${isDefault 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-gray-300 hover:text-gray-400'
                        }
                      `}
                      aria-label={`${isDefault ? 'Remove as' : 'Set as'} default program`}
                      aria-pressed={isDefault}
                    >
                      <svg 
                        className="w-6 h-6 sm:w-6 sm:h-6" 
                        fill={isDefault ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={isDefault ? 0 : 2} 
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                        />
                      </svg>
                    </button>

                    {/* Tooltip */}
                    {showingTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          Set as Default
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <AccessibleButton
              onClick={onClose}
              variant="secondary"
              className="w-full sm:w-auto px-4 py-3 sm:py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors font-medium"
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton
              onClick={handleSave}
              variant="primary"
              className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
            >
              Save
            </AccessibleButton>
          </div>
        </div>
      </div>
    </div>
  );
}

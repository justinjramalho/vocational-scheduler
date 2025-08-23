'use client';

import { useState, useEffect, useRef } from 'react';
import { Assignment, Student, StudentCohort, Program, EventType } from '@/types';

// Event type CSS class mapping for new visual themes
const getEventTypeClass = (eventType: EventType): string => {
  const classMap: Record<EventType, string> = {
    'Academic': 'event-type-academic',
    'Elective': 'event-type-elective', 
    'Therapy': 'event-type-therapy',
    'Vocational': 'event-type-vocational',
    'Testing': 'event-type-testing',
    'Extra-curricular': 'event-type-extra-curricular',
  };
  return classMap[eventType] || 'event-type-academic';
};

interface ScheduleViewProps {
  viewType: 'student' | 'cohort' | 'program';
  targetId: string; // student ID, cohort ID, or program ID
  student?: Student;
  cohort?: StudentCohort;
  program?: Program;
  onNavigateToMenu: () => void;
  onAddAssignment: () => void;
}

const DAYS_OF_WEEK = [
  { short: 'Mon', long: 'Monday', index: 1 },
  { short: 'Tue', long: 'Tuesday', index: 2 },
  { short: 'Wed', long: 'Wednesday', index: 3 },
  { short: 'Thu', long: 'Thursday', index: 4 },
  { short: 'Fri', long: 'Friday', index: 5 },
  { short: 'Sat', long: 'Saturday', index: 6 },
  { short: 'Sun', long: 'Sunday', index: 0 },
];

export default function ScheduleView({
  viewType,
  targetId,
  student,
  cohort,
  program,
  onAddAssignment
}: ScheduleViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [, setCurrentTime] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Load assignments when date or target changes
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        let url = '/api/assignments?';
        
        if (viewType === 'student') {
          url += `studentId=${targetId}&date=${dateStr}`;
        } else if (viewType === 'cohort') {
          url += `cohortId=${targetId}&date=${dateStr}`;
        } else if (viewType === 'program') {
          url += `programId=${targetId}&date=${dateStr}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const assignmentsData = await response.json();
          setAssignments(assignmentsData);
        } else {
          setAssignments([]);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAssignments([]);
      }
    };

    fetchAssignments();
  }, [viewType, targetId, selectedDate]);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current && assignments.length > 0) {
      const now = new Date();
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Find the next assignment after current time
      const nextAssignment = assignments.find(assignment => {
        const startTime = typeof assignment.startTime === 'string' ? new Date(assignment.startTime) : assignment.startTime;
        const assignmentTime = startTime.getHours() * 60 + startTime.getMinutes();
        return assignmentTime >= currentTimeMinutes;
      });

      if (nextAssignment) {
        const assignmentIndex = assignments.indexOf(nextAssignment);
        const scrollTop = Math.max(0, (assignmentIndex - 1) * 120); // Approximate card height
        scrollContainerRef.current.scrollTop = scrollTop;
      }
    }
  }, [assignments]);

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCurrentEvent = (assignment: Assignment) => {
    const now = new Date();
    const startTime = typeof assignment.startTime === 'string' ? new Date(assignment.startTime) : assignment.startTime;
    const endTime = typeof assignment.endTime === 'string' ? new Date(assignment.endTime) : assignment.endTime;
    return now >= startTime && now <= endTime;
  };

  const getWeekDates = () => {
    const startOfWeek = new Date(selectedDate);
    // Calculate Monday as start of week (day.getDay() === 1)
    const dayOfWeek = selectedDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday (0), go back 6 days
    startOfWeek.setDate(selectedDate.getDate() + daysToMonday);
    
    return DAYS_OF_WEEK.map(day => {
      const date = new Date(startOfWeek);
      const dayOffset = day.index === 0 ? 6 : day.index - 1; // Sunday (0) becomes 6, others are index-1
      date.setDate(startOfWeek.getDate() + dayOffset);
      return { ...day, date };
    });
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const scheduleTitle = viewType === 'student' 
    ? `Schedule: ${student?.fullName || 'Student'}`
    : viewType === 'cohort'
    ? `Schedule: ${cohort?.name || 'Cohort'}`
    : `Schedule: ${program?.name || 'Program'}`;

  return (
    <div className="bg-gray-50 flex flex-col">

      {/* Centered Title */}
      <div className="bg-white border-b">
        <div className="text-center py-4">
          <h2 className="text-xl font-semibold text-gray-900">{scheduleTitle}</h2>
        </div>
      </div>

      {/* Day Navigation - Horizontal Swipe */}
      <div className="bg-white border-b">
        <div className="flex justify-center">
          <div className="flex overflow-x-auto scrollbar-hide px-4 py-3">
            {getWeekDates().map(({ short, date, index }) => (
              <button
                key={index}
                onClick={() => setSelectedDate(new Date(date))}
                className={`flex-shrink-0 px-4 py-2 mx-1 rounded-lg text-sm font-medium transition-colors ${
                  isSelectedDate(date)
                    ? 'bg-blue-600 text-white'
                    : isToday(date)
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{short}</div>
                  <div className="text-xs mt-1">{date.getDate()}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Date Display */}
      <div className="bg-white px-4 py-3 border-b text-center">
        <h3 className="text-lg font-medium text-gray-900">{formatDate(selectedDate)}</h3>
        <p className="text-sm text-gray-600">{assignments.length} assignment{assignments.length !== 1 ? 's' : ''} scheduled</p>
      </div>

      {/* Timeline List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments scheduled</h3>
            <p className="text-gray-600 mb-4">This day is free of scheduled assignments.</p>
            <button
              onClick={onAddAssignment}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Assignment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const eventTypeClass = getEventTypeClass(assignment.eventType);
              const isCurrent = isCurrentEvent(assignment);
              
              return (
                <div
                  key={assignment.id}
                  className={`event-card ${eventTypeClass} shadow-sm hover:shadow-md ${
                    isCurrent ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                >
                  {/* Time */}
                  <div className="flex-shrink-0 w-20 text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatTime(assignment.startTime)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {assignment.duration}m
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 ml-4 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold truncate">
                        {assignment.eventTitle}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="event-badge">
                          {assignment.eventType}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                            Now
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs opacity-90">
                      
                      <div className="flex items-center text-xs text-gray-600">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {assignment.location}
                      </div>
                      
                      {(viewType === 'cohort' || viewType === 'program') && (
                        <div className="flex items-center text-xs text-gray-600">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {assignment.studentName}
                        </div>
                      )}

                      <div className="flex items-center text-xs text-gray-600">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {assignment.responsibleParty}
                      </div>
                    </div>

                    {assignment.notes && (
                      <div className="mt-2 text-xs text-gray-600 italic">
                        {assignment.notes}
                      </div>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="flex-shrink-0 text-right text-xs text-gray-500 ml-2">
                    Ends {formatTime(assignment.endTime)}
                  </div>
                </div>
              );
            })}
            
            {/* Add Assignment Block */}
            <div className="relative flex items-center p-4 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow border-gray-300 hover:bg-gray-50">
              {/* Empty Time Space */}
              <div className="flex-shrink-0 w-20 text-left">
                <div className="text-sm font-semibold text-gray-400">
                  +
                </div>
              </div>

              {/* Add Assignment Content */}
              <div className="flex-1 ml-4 min-w-0">
                <button
                  onClick={onAddAssignment}
                  className="w-full text-left flex items-center justify-between group"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                      Add New Assignment
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Create a new assignment for this day
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="p-2 bg-blue-600 text-white rounded-md group-hover:bg-blue-700 transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
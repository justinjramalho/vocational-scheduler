'use client';

import { useState, useEffect } from 'react';
import { AssignmentFormData, EventType, RecurrenceType, Student, Class } from '@/types';

interface AssignmentFormProps {
  onSubmit: (data: AssignmentFormData) => void;
  onCancel: () => void;
  initialData?: Partial<AssignmentFormData>;
  students: Student[];
  loading?: boolean;
}

export default function AssignmentForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  students
}: AssignmentFormProps) {
  const [formData, setFormData] = useState<AssignmentFormData>({
    studentId: '',
    classId: '',
    eventType: '',
    eventTitle: '',
    location: '',
    startTime: '',
    duration: 60, // default 1 hour
    recurrence: 'None',
    recurrenceEndDate: '',
    notes: '',
    responsibleParty: '',
    pointOfContact: '',
    ...initialData
  });

  type FormErrors = {
    [K in keyof AssignmentFormData]?: string;
  };

  const [errors, setErrors] = useState<FormErrors>({});
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showNewClassTitle, setShowNewClassTitle] = useState(false);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Fetch available classes when student and event type change
  useEffect(() => {
    const fetchClasses = async () => {
      const timestamp = new Date().toISOString();
      console.log(`[ASSIGNMENT-FORM] ${timestamp} - Starting class fetch`, {
        studentId: formData.studentId,
        eventType: formData.eventType
      });

      if (!formData.studentId || !formData.eventType || 
          (formData.eventType !== 'Academic' && formData.eventType !== 'Elective')) {
        console.log(`[ASSIGNMENT-FORM] ${timestamp} - Skipping class fetch (invalid conditions)`);
        setAvailableClasses([]);
        setSelectedClass(null);
        setShowNewClassTitle(false);
        return;
      }

      setLoadingClasses(true);
      try {
        const selectedStudent = students.find(s => s.id === formData.studentId);
        if (!selectedStudent) {
          console.log(`[ASSIGNMENT-FORM] ${timestamp} - Student not found in local list`);
          setAvailableClasses([]);
          return;
        }

        console.log(`[ASSIGNMENT-FORM] ${timestamp} - Selected student:`, selectedStudent.fullName);

        // Get the student's program information to fetch relevant classes
        const studentUrl = `/api/students/${formData.studentId}`;
        console.log(`[ASSIGNMENT-FORM] ${timestamp} - Fetching student details from:`, studentUrl);
        
        const response = await fetch(studentUrl);
        if (response.ok) {
          const studentDetails = await response.json();
          console.log(`[ASSIGNMENT-FORM] ${timestamp} - Student details:`, {
            name: studentDetails.fullName,
            program: studentDetails.program,
            cohort: studentDetails.cohort
          });
          
          const programId = studentDetails.cohort?.programId || null;
          
          if (programId) {
            // Fetch classes for this program
            const classesUrl = `/api/classes?programId=${programId}`;
            console.log(`[ASSIGNMENT-FORM] ${timestamp} - Fetching classes from:`, classesUrl);
            
            const classesResponse = await fetch(classesUrl);
            if (classesResponse.ok) {
              const classes: Class[] = await classesResponse.json();
              console.log(`[ASSIGNMENT-FORM] ${timestamp} - Fetched ${classes.length} classes:`, 
                classes.map(c => ({ name: c.name, eventType: c.eventType, active: c.active }))
              );
              
              // Filter classes by event type
              const filteredClasses = classes.filter(c => 
                c.eventType === formData.eventType && c.active
              );
              
              console.log(`[ASSIGNMENT-FORM] ${timestamp} - Filtered to ${filteredClasses.length} ${formData.eventType} classes:`,
                filteredClasses.map(c => c.name)
              );
              
              setAvailableClasses(filteredClasses);
            } else {
              console.error(`[ASSIGNMENT-FORM] ${timestamp} - Classes API error:`, classesResponse.status);
            }
          } else {
            console.log(`[ASSIGNMENT-FORM] ${timestamp} - No program ID found for student`);
          }
        } else {
          console.error(`[ASSIGNMENT-FORM] ${timestamp} - Student API error:`, response.status);
        }
      } catch (error) {
        console.error(`[ASSIGNMENT-FORM] ${timestamp} - Error fetching classes:`, error);
        setAvailableClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [formData.studentId, formData.eventType, students]);

  const eventTypeOptions: EventType[] = [
    'Academic',
    'Elective',
    'Therapy',
    'Vocational',
    'Testing',
    'Extra-curricular'
  ];

  const recurrenceOptions: RecurrenceType[] = [
    'None',
    'Daily',
    'Weekly',
    'Monthly'
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.studentId) newErrors.studentId = 'Student is required';
    if (!formData.eventType) newErrors.eventType = 'Event type is required';
    if (!formData.eventTitle) newErrors.eventTitle = 'Event title is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.duration || formData.duration < 1 || formData.duration > 720) {
      newErrors.duration = 'Duration must be between 1 and 720 minutes';
    }
    if (!formData.responsibleParty) {
      newErrors.responsibleParty = 'Responsible party is required';
    }
    
    // Validate recurrence end date if recurrence is set
    if (formData.recurrence !== 'None' && !formData.recurrenceEndDate) {
      newErrors.recurrenceEndDate = 'End date is required for recurring assignments';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (
    field: keyof AssignmentFormData,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClassSelection = (value: string) => {
    if (value === 'new') {
      // Create new class
      setSelectedClass(null);
      setShowNewClassTitle(true);
      setFormData(prev => ({ 
        ...prev, 
        classId: '',
        eventTitle: ''
      }));
    } else if (value === '') {
      // No selection
      setSelectedClass(null);
      setShowNewClassTitle(false);
      setFormData(prev => ({ 
        ...prev, 
        classId: '',
        eventTitle: ''
      }));
    } else {
      // Existing class selected
      const selectedClass = availableClasses.find(c => c.id === value);
      if (selectedClass) {
        setSelectedClass(selectedClass);
        setShowNewClassTitle(false);
        // Auto-populate form fields from class
        setFormData(prev => ({
          ...prev,
          classId: selectedClass.id,
          eventTitle: selectedClass.name,
          location: selectedClass.location || prev.location,
          duration: selectedClass.defaultDuration || prev.duration
        }));
      }
    }
  };

  const incrementDuration = () => {
    if (formData.duration < 720) {
      setFormData(prev => ({ ...prev, duration: prev.duration + 1 }));
    }
  };

  const decrementDuration = () => {
    if (formData.duration > 1) {
      setFormData(prev => ({ ...prev, duration: prev.duration - 1 }));
    }
  };

  const handleDurationChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    // Clamp value between 1 and 720 minutes (12 hours)
    const clampedValue = Math.max(1, Math.min(720, numValue));
    handleInputChange('duration', clampedValue);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Assignment
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Selection */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
              Student Name *
            </label>
            <select
              id="studentId"
              value={formData.studentId}
              onChange={(e) => handleInputChange('studentId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.studentId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
            )}
          </div>

          {/* Spacer */}
          <div className="h-4"></div>

          {/* Event Type & Title/Class Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                Event Type *
              </label>
              <select
                id="eventType"
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.eventType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select event type</option>
                {eventTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.eventType && (
                <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>
              )}
            </div>

            <div>
              {(formData.eventType === 'Academic' || formData.eventType === 'Elective') ? (
                // Class dropdown for Academic/Elective
                <>
                  <label htmlFor="classSelection" className="block text-sm font-medium text-gray-700 mb-1">
                    Program Classes *
                  </label>
                  <select
                    id="classSelection"
                    value={selectedClass?.id || (showNewClassTitle ? 'new' : '')}
                    onChange={(e) => handleClassSelection(e.target.value)}
                    disabled={!formData.eventType || !formData.studentId || loadingClasses}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.eventTitle ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a class</option>
                    <option value="new">📝 Create New Class</option>
                    {availableClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.programName || 'Unknown Program'})
                      </option>
                    ))}
                  </select>
                  {loadingClasses && (
                    <p className="mt-1 text-sm text-gray-500">Loading available classes...</p>
                  )}
                  {errors.eventTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.eventTitle}</p>
                  )}
                </>
              ) : (
                // Regular event title input for other types
                <>
                  <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="eventTitle"
                    value={formData.eventTitle}
                    onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                    disabled={!formData.eventType}
                    placeholder="Enter event title"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.eventTitle ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.eventTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.eventTitle}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* New Class Title Input - only show when creating new class */}
          {showNewClassTitle && (
            <div className="mt-4">
              <label htmlFor="newClassTitle" className="block text-sm font-medium text-gray-700 mb-1">
                New Class Title *
              </label>
              <input
                type="text"
                id="newClassTitle"
                value={formData.eventTitle}
                onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                placeholder="Enter new class title"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.eventTitle ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.eventTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.eventTitle}</p>
              )}
            </div>
          )}

          {/* Dynamic Class Title Label - only show for new class creation */}
          {showNewClassTitle && formData.eventTitle && (
            <div className="mt-2 mb-2">
              <div className="text-sm text-gray-700">
                <span className="font-bold">Class Title:</span>
                <span className="ml-1">&quot;{formData.eventTitle}&quot;</span>
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="h-4"></div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter location"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.location ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Spacer */}
          <div className="h-4"></div>

          {/* Start Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={decrementDuration}
                  className="px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  -
                </button>
                <input
                  type="number"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  min="1"
                  max="720"
                  step="1"
                  placeholder="60"
                  className={`w-full px-3 py-2 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.duration ? 'border-red-300' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={incrementDuration}
                  className="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  +
                </button>
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Recurrence & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 mb-1">
                Recurrence
              </label>
              <select
                id="recurrence"
                value={formData.recurrence}
                onChange={(e) => handleInputChange('recurrence', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {recurrenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                Recurrence End Date {formData.recurrence !== 'None' && '*'}
              </label>
              <input
                type="date"
                id="recurrenceEndDate"
                value={formData.recurrenceEndDate}
                onChange={(e) => handleInputChange('recurrenceEndDate', e.target.value)}
                disabled={formData.recurrence === 'None'}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.recurrenceEndDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.recurrenceEndDate && (
                <p className="mt-1 text-sm text-red-600">{errors.recurrenceEndDate}</p>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="h-4"></div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Spacer */}
          <div className="h-4"></div>

          {/* Responsible Party & Point of Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="responsibleParty" className="block text-sm font-medium text-gray-700 mb-1">
                Responsible Party *
              </label>
              <input
                type="text"
                id="responsibleParty"
                value={formData.responsibleParty}
                onChange={(e) => handleInputChange('responsibleParty', e.target.value)}
                placeholder="Enter responsible party"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.responsibleParty ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.responsibleParty && (
                <p className="mt-1 text-sm text-red-600">{errors.responsibleParty}</p>
              )}
            </div>

            <div>
              <label htmlFor="pointOfContact" className="block text-sm font-medium text-gray-700 mb-1">
                Point of Contact
              </label>
              <input
                type="text"
                id="pointOfContact"
                value={formData.pointOfContact}
                onChange={(e) => handleInputChange('pointOfContact', e.target.value)}
                placeholder="Enter point of contact"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
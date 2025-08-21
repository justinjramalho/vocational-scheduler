'use client';

import { useState, useEffect } from 'react';
import { Student, StudentCohort, StudentFormData } from '@/types';

interface StudentModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit' | 'delete';
  student: Student | null;
  cohorts: StudentCohort[];
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
  onDelete: () => void;
}

const gradeOptions = [
  '9th', 
  '10th', 
  '11th', 
  '12th', 
  'Transition Year (1)', 
  'Transition Year (2)', 
  'Transition Year (3)', 
  'Transition Year (4)', 
  'Post-Secondary (Year 1)', 
  'Post-Secondary (Year 2)'
];

const commonAccommodations = [
  'Extended time',
  'Frequent breaks',
  'Visual aids',
  'Reduced distractions',
  'Small group instruction',
  'Social stories',
  'Job coach support',
  'Assistive technology',
  'Modified assignments',
  'Verbal instructions',
  'Picture schedules',
  'Sensory breaks'
];

export default function StudentModal({
  isOpen,
  mode,
  student,
  cohorts,
  onClose,
  onSubmit,
  onDelete
}: StudentModalProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    grade: '',
    program: '',
    cohortId: '',
    notes: '',
    emergencyContact: '',
    accommodations: []
  });

  const [errors, setErrors] = useState<Partial<StudentFormData>>({});

  // Reset form when modal opens/closes or student changes
  useEffect(() => {
    if (isOpen && student && mode !== 'add') {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email || '',
        studentId: student.studentId || '',
        grade: student.grade || '',
        program: student.program || '',
        cohortId: student.cohortId || '',
        notes: student.notes || '',
        emergencyContact: student.emergencyContact || '',
        accommodations: student.accommodations || []
      });
    } else if (isOpen && mode === 'add') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        studentId: '',
        grade: '',
        program: '',
        cohortId: '',
        notes: '',
        emergencyContact: '',
        accommodations: []
      });
    }
    setErrors({});
  }, [isOpen, student, mode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentFormData> = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
    
    // Required for Google Classroom integration
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required for Google Classroom integration';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade level is required for Google Classroom integration';
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

  const handleInputChange = (field: keyof StudentFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAccommodationToggle = (accommodation: string) => {
    const currentAccommodations = formData.accommodations;
    const newAccommodations = currentAccommodations.includes(accommodation)
      ? currentAccommodations.filter(a => a !== accommodation)
      : [...currentAccommodations, accommodation];
    
    handleInputChange('accommodations', newAccommodations);
  };

  if (!isOpen) return null;

  // Delete confirmation modal
  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Student</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{student?.fullName}</strong>? 
              This will remove the student from the roster but preserve their assignment history.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'add' ? 'Add New Student' : 'Edit Student'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="student@school.edu"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                id="studentId"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.studentId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ST001"
              />
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level *
              </label>
              <select
                id="grade"
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.grade ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select grade</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {errors.grade && (
                <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
              )}
            </div>

            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                Program
              </label>
              <input
                type="text"
                id="program"
                value={formData.program}
                onChange={(e) => handleInputChange('program', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter program name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cohortId" className="block text-sm font-medium text-gray-700 mb-1">
              Cohort
            </label>
            <input
              type="text"
              id="cohortId"
              value={formData.cohortId}
              onChange={(e) => handleInputChange('cohortId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter cohort name"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact *
            </label>
            <input
              type="text"
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.emergencyContact ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Jane Smith (Mother) - 908-555-0123"
            />
            {errors.emergencyContact && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>
            )}
          </div>

          {/* Accommodations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accommodations
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonAccommodations.map(accommodation => (
                <label key={accommodation} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.accommodations.includes(accommodation)}
                    onChange={() => handleAccommodationToggle(accommodation)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{accommodation}</span>
                </label>
              ))}
            </div>
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes about the student..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {mode === 'add' ? 'Add Student' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
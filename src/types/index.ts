// Core data models for the Vocational Scheduler

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string; // computed: firstName + lastName
  email?: string | null;
  studentId?: string | null; // school ID number
  grade?: string | null;
  program?: string | null; // student's program
  cohortId?: string | null; // assigned class/cohort
  cohortName?: string | null; // denormalized for display
  active: boolean;
  notes?: string | null;
  emergencyContact?: string | null;
  accommodations?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  studentId: string;
  classId?: string | null; // link to class if this is an Academic/Elective assignment
  studentName: string; // denormalized for easier display
  eventType: EventType;
  eventTitle: string;
  location: string;
  startTime: Date;
  duration: number; // in minutes
  endTime: Date; // computed: startTime + duration
  recurrence: RecurrenceType;
  recurrenceEndDate?: Date | null; // required if recurrence is not 'None'
  notes?: string | null;
  responsibleParty: string;
  pointOfContact?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type EventType = 
  | 'Academic'
  | 'Elective' 
  | 'Therapy'
  | 'Vocational'
  | 'Testing'
  | 'Extra-curricular';

export type RecurrenceType = 
  | 'None'
  | 'Daily'
  | 'Weekly'
  | 'Monthly';

// Class interface for Academic/Elective assignments
export interface Class {
  id: string;
  name: string;
  description?: string | null;
  code?: string | null;
  department?: string | null;
  credits?: number | null;
  duration?: string | null;
  color: string;
  academicYear?: string | null;
  eventType?: EventType | null; // Academic or Elective
  programId?: string | null;
  programName?: string | null; // denormalized for display
  assignmentId?: string | null; // original assignment that created this class
  location?: string | null; // default location
  defaultDuration?: number | null; // default duration in minutes
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  cohortCount?: number; // computed field
  studentCount?: number; // computed field
}

// Form data interface for creating/editing assignments
export interface AssignmentFormData {
  studentId: string;
  classId?: string; // for existing class assignments
  eventType: EventType | '';
  eventTitle: string;
  location: string;
  startTime: string; // ISO date string for form inputs
  endTime?: string; // optional - for imports (e.g., Google Sheets)
  duration: number;
  recurrence: RecurrenceType;
  recurrenceEndDate: string; // ISO date string for form inputs
  notes: string;
  responsibleParty: string;
  pointOfContact: string;
}

// Class/Group definitions for organizing students
export interface StudentCohort {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null; // for visual identification
  studentIds: string[];
  teacherName?: string | null;
  academicYear?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Form data for student management
export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  grade: string;
  program: string;
  cohortId: string;
  notes: string;
  emergencyContact: string;
  accommodations: string[];
}

// Import/Export interfaces for future Google integration
export interface StudentImportData {
  firstName: string;
  lastName: string;
  email?: string;
  studentId?: string;
  grade?: string;
  cohortName?: string;
}

export interface GoogleClassroomIntegration {
  classId: string;
  className: string;
  students: StudentImportData[];
}

// Schedule view options
export interface ScheduleViewOptions {
  viewType: 'individual' | 'class' | 'custom';
  studentIds?: string[];
  classId?: string;
  startDate: Date;
  endDate: Date;
}
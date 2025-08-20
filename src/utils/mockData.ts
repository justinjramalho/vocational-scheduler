import { Assignment, Student, StudentCohort, EventType } from '@/types';

// Mock Students Data
export const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    fullName: 'John Smith',
    email: 'john.smith@school.edu',
    studentId: 'ST001',
    grade: '9th',
    cohortId: '1',
    cohortName: 'Morning Cohort A',
    active: true,
    notes: 'Excellent progress in vocational training',
    emergencyContact: 'Jane Smith (Mother) - 555-0123',
    accommodations: ['Extended time', 'Frequent breaks'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    firstName: 'Emma',
    lastName: 'Johnson',
    fullName: 'Emma Johnson',
    email: 'emma.johnson@school.edu',
    studentId: 'ST002',
    grade: '10th',
    cohortId: '1',
    cohortName: 'Morning Cohort A',
    active: true,
    notes: 'Strong communication skills',
    emergencyContact: 'Robert Johnson (Father) - 555-0456',
    accommodations: ['Visual aids', 'Reduced distractions'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    fullName: 'Michael Brown',
    email: 'michael.brown@school.edu',
    studentId: 'ST003',
    grade: '11th',
    cohortId: '2',
    cohortName: 'Afternoon Cohort B',
    active: true,
    notes: 'Needs additional support with social skills',
    emergencyContact: 'Lisa Brown (Guardian) - 555-0789',
    accommodations: ['Small group instruction', 'Social stories'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    firstName: 'Sophia',
    lastName: 'Davis',
    fullName: 'Sophia Davis',
    email: 'sophia.davis@school.edu',
    studentId: 'ST004',
    grade: '12th',
    cohortId: '2',
    cohortName: 'Afternoon Cohort B',
    active: true,
    notes: 'Ready for independent work placement',
    emergencyContact: 'Mark Davis (Father) - 555-0012',
    accommodations: ['Job coach support'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock Cohorts Data
export const mockCohorts: StudentCohort[] = [
  {
    id: '1',
    name: 'Morning Cohort A',
    description: 'Advanced vocational training group',
    color: '#3B82F6',
    studentIds: ['1', '2'],
    teacherName: 'Ms. Johnson',
    academicYear: '2024-2025',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2', 
    name: 'Afternoon Cohort B',
    description: 'Foundational skills development',
    color: '#10B981',
    studentIds: ['3', '4'],
    teacherName: 'Mr. Smith',
    academicYear: '2024-2025',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Generate mock assignments for the current week
function generateMockAssignments(): Assignment[] {
  const assignments: Assignment[] = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

  // Available event types for reference
  // const eventTypes: EventType[] = ['Academic', 'Elective', 'Therapy', 'Vocational', 'Testing', 'Extra-curricular'];
  
  const sampleEvents = [
    { title: 'Math Class', type: 'Academic' as EventType, duration: 60 },
    { title: 'Reading Comprehension', type: 'Academic' as EventType, duration: 45 },
    { title: 'Art Therapy', type: 'Therapy' as EventType, duration: 30 },
    { title: 'Physical Therapy', type: 'Therapy' as EventType, duration: 45 },
    { title: 'Job Training - Retail', type: 'Vocational' as EventType, duration: 120 },
    { title: 'Computer Skills', type: 'Elective' as EventType, duration: 60 },
    { title: 'Speech Therapy', type: 'Therapy' as EventType, duration: 30 },
    { title: 'Life Skills Training', type: 'Vocational' as EventType, duration: 90 },
    { title: 'Music Class', type: 'Elective' as EventType, duration: 45 },
    { title: 'Behavioral Assessment', type: 'Testing' as EventType, duration: 60 },
    { title: 'Social Skills Group', type: 'Extra-curricular' as EventType, duration: 45 },
    { title: 'Lunch Break', type: 'Academic' as EventType, duration: 30 },
  ];

  // Generate assignments for each day of the week
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + dayOffset);
    
    // Skip weekends for most assignments
    if (dayOffset === 0 || dayOffset === 6) {
      // Only add a few weekend assignments
      if (Math.random() > 0.7) {
        const event = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
        const startHour = 10 + Math.floor(Math.random() * 4); // 10 AM to 2 PM
        const startTime = new Date(currentDate);
        startTime.setHours(startHour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + event.duration);

        assignments.push({
          id: `${dayOffset}-weekend-${Math.random().toString(36).substr(2, 9)}`,
          studentId: mockStudents[Math.floor(Math.random() * mockStudents.length)].id,
          studentName: mockStudents[Math.floor(Math.random() * mockStudents.length)].fullName,
          eventType: event.type,
          eventTitle: event.title,
          location: 'Room ' + (Math.floor(Math.random() * 20) + 100),
          startTime,
          duration: event.duration,
          endTime,
          recurrence: 'None',
          responsibleParty: 'Staff Member',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      continue;
    }

    // Generate 4-8 assignments per weekday
    const assignmentsPerDay = 4 + Math.floor(Math.random() * 5);
    const usedTimes = new Set<string>();

    for (let i = 0; i < assignmentsPerDay; i++) {
      const event = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      let startHour, startMinute;
      let timeKey;
      
      // Ensure no time conflicts
      do {
        startHour = 8 + Math.floor(Math.random() * 8); // 8 AM to 4 PM
        startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
        timeKey = `${startHour}:${startMinute.toString().padStart(2, '0')}`;
      } while (usedTimes.has(timeKey));
      
      usedTimes.add(timeKey);

      const startTime = new Date(currentDate);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + event.duration);

      const student = mockStudents[Math.floor(Math.random() * mockStudents.length)];

      assignments.push({
        id: `${dayOffset}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        studentId: student.id,
        studentName: student.fullName,
        eventType: event.type,
        eventTitle: event.title,
        location: 'Room ' + (Math.floor(Math.random() * 20) + 100),
        startTime,
        duration: event.duration,
        endTime,
        recurrence: 'None',
        responsibleParty: 'Staff Member',
        pointOfContact: Math.random() > 0.5 ? 'Contact Person' : undefined,
        notes: Math.random() > 0.7 ? 'Special instructions for this assignment' : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // Sort assignments by start time
  return assignments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export const mockAssignments = generateMockAssignments();

// Helper function to get assignments for a specific student on a specific date
export function getStudentAssignments(studentId: string, date: Date): Assignment[] {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return mockAssignments
    .filter(assignment => 
      assignment.studentId === studentId &&
      assignment.startTime >= startOfDay &&
      assignment.startTime <= endOfDay
    )
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// Helper function to get assignments for a specific cohort on a specific date
export function getCohortAssignments(cohortId: string, date: Date): Assignment[] {
  const cohort = mockCohorts.find(c => c.id === cohortId);
  if (!cohort) return [];

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return mockAssignments
    .filter(assignment => 
      cohort.studentIds.includes(assignment.studentId) &&
      assignment.startTime >= startOfDay &&
      assignment.startTime <= endOfDay
    )
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// Event type color mapping
export const eventTypeColors: Record<EventType, { bg: string; border: string; text: string }> = {
  'Academic': { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  'Elective': { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
  'Therapy': { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
  'Vocational': { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
  'Testing': { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' },
  'Extra-curricular': { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
};
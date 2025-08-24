import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// Create the database connection
export const db = drizzle(sql, { schema });

// For development, we'll track the default organization
export let DEFAULT_ORG_ID: string | null = null;
export let DEFAULT_USER_ID: string | null = null;

// Utility function to convert dates to local timezone
export function convertToLocalTimezone(utcDate: Date): Date {
  // This is a simplified version - in production you'd want more sophisticated timezone handling
  const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
  return localDate;
}

// Database initialization and seeding
export async function initializeDatabase() {
  try {
    // Check if Demo School District already exists
    const existingOrg = await db.query.organizations.findFirst({
      where: (orgs, { eq }) => eq(orgs.slug, 'demo-school-district')
    });

    if (existingOrg) {
      // Data already exists, just set the globals
      DEFAULT_ORG_ID = existingOrg.id;
      
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.organizationId, existingOrg.id)
      });
      
      if (existingUser) {
        DEFAULT_USER_ID = existingUser.id;
      }

      console.log('Demo School District already exists, using existing data');
      return true;
    }

    console.log('Creating Demo School District organization with demo data...');

    // Create Demo School District organization
    const [demoOrg] = await db.insert(schema.organizations).values({
      name: 'Demo School District',
      slug: 'demo-school-district',
      inviteCode: 'DEMO2024',
      settings: {
        timezone: 'America/New_York',
        schoolYear: '2024-2025'
      }
        }).returning();

    DEFAULT_ORG_ID = demoOrg.id;

    // Create 5 demo users with different roles
    const demoUsers = await db.insert(schema.users).values([
      {
        email: 'alexa.admin@demoschool.edu',
        name: 'Alexa Administrator',
        role: 'administrator',
        organizationId: demoOrg.id
      },
      {
        email: 'ian.instructor@demoschool.edu',
        name: 'Ian Instructor',
        role: 'instructor',
        organizationId: demoOrg.id
      },
      {
        email: 'sam.specialist@demoschool.edu',
        name: 'Sam Specialist',
        role: 'specialist',
        organizationId: demoOrg.id
      },
      {
        email: 'paul.para@demoschool.edu',
        name: 'Paul Paraprofessional',
        role: 'paraprofessional',
        organizationId: demoOrg.id
      },
      {
        email: 'sophie.staff@demoschool.edu',
        name: 'Sophie Staff',
        role: 'staff',
        organizationId: demoOrg.id
      }
    ]).returning();

    DEFAULT_USER_ID = demoUsers[0].id;

    // Create both programs
    const [spedProgram] = await db.insert(schema.programs).values({
      name: 'SPED Vocation Program',
      organizationId: demoOrg.id,
      description: 'Special Education Vocational Training Program'
    }).returning();

    const [jrotcProgram] = await db.insert(schema.programs).values({
      name: 'Air Force Junior ROTC Program',
      organizationId: demoOrg.id,
      description: 'Air Force Junior Reserve Officer Training Corps Program'
    }).returning();

    // Create 20 classes: 10 for SPED + 10 for JROTC (Academic, Elective, Vocational)
    await db.insert(schema.classes).values([
      // SPED Program Classes
      {
        name: 'Math Fundamentals',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[1].id, // Ian Instructor
        location: 'Room 101',
        defaultDuration: 60 // 60 minutes
      },
      {
        name: 'English Language Arts',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[1].id,
        location: 'Room 102',
        defaultDuration: 90
      },
      {
        name: 'Life Science',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[2].id, // Sam Specialist
        location: 'Lab 201',
        defaultDuration: 90
      },
      {
        name: 'Social Studies',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[1].id,
        location: 'Room 103',
        defaultDuration: 60
      },
      {
        name: 'Art Therapy',
        eventType: 'Elective',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[2].id,
        location: 'Art Studio',
        defaultDuration: 120
      },
      {
        name: 'Music Appreciation',
        eventType: 'Elective',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[4].id, // Sophie Staff
        location: 'Music Room',
        defaultDuration: 60
      },
      {
        name: 'Physical Education',
        eventType: 'Elective',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[3].id, // Paul Paraprofessional
        location: 'Gymnasium',
        defaultDuration: 60
      },
      {
        name: 'Automotive Basics',
        eventType: 'Vocational',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[1].id,
        location: 'Auto Shop',
        defaultDuration: 120
      },
      {
        name: 'Culinary Arts',
        eventType: 'Vocational',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[2].id,
        location: 'Kitchen Lab',
        defaultDuration: 120
      },
      {
        name: 'Computer Skills',
        eventType: 'Vocational',
        organizationId: demoOrg.id,
        programId: spedProgram.id,
        createdBy: demoUsers[4].id,
        location: 'Computer Lab',
        defaultDuration: 120
      },
      // JROTC Program Classes
      {
        name: 'Military Mathematics',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[1].id, // Ian Instructor
        location: 'JROTC Classroom A',
        defaultDuration: 50
      },
      {
        name: 'Leadership Studies',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[1].id,
        location: 'JROTC Classroom B',
        defaultDuration: 50
      },
      {
        name: 'Military History',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[2].id, // Sam Specialist
        location: 'JROTC Classroom C',
        defaultDuration: 50
      },
      {
        name: 'Aerospace Science',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[1].id,
        location: 'Science Lab',
        defaultDuration: 50
      },
      {
        name: 'Color Guard Practice',
        eventType: 'Elective',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[2].id,
        location: 'Drill Hall',
        defaultDuration: 60
      },
      {
        name: 'Military Band',
        eventType: 'Elective',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[4].id, // Sophie Staff
        location: 'Band Room',
        defaultDuration: 60
      },
      {
        name: 'Physical Training',
        eventType: 'Elective',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[3].id, // Paul Paraprofessional
        location: 'Fitness Center',
        defaultDuration: 60
      },
      {
        name: 'Drill and Ceremony',
        eventType: 'Vocational',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[1].id,
        location: 'Parade Grounds',
        defaultDuration: 90
      },
      {
        name: 'Aviation Technology',
        eventType: 'Vocational',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[2].id,
        location: 'Aviation Lab',
        defaultDuration: 90
      },
      {
        name: 'Communications Systems',
        eventType: 'Vocational',
        organizationId: demoOrg.id,
        programId: jrotcProgram.id,
        createdBy: demoUsers[4].id,
        location: 'Communications Center',
        defaultDuration: 90
      }
    ]).returning();

    // Create 4 cohorts: 2 for SPED and 2 for JROTC
    const demoCohorts = await db.insert(schema.cohorts).values([
      // SPED Program Cohorts
      {
        name: 'Cohort A',
        programId: spedProgram.id,
        organizationId: demoOrg.id
      },
      {
        name: 'Cohort B',
        programId: spedProgram.id,
        organizationId: demoOrg.id
      },
      // JROTC Program Cohorts
      {
        name: 'Squadron Alpha',
        programId: jrotcProgram.id,
        organizationId: demoOrg.id
      },
      {
        name: 'Squadron Bravo',
        programId: jrotcProgram.id,
        organizationId: demoOrg.id
      }
    ]).returning();

    // Create 12 students: 6 SPED + 6 JROTC students
    const demoStudents = await db.insert(schema.students).values([
      // SPED Cohort A students
      {
        firstName: 'Emma',
        lastName: 'Johnson',
        studentId: 'ST001',
        email: 'emma.johnson@demoschool.edu',
        grade: 'Transition Year 2',
        program: 'SPED Vocation Program',
        cohortId: demoCohorts[0].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Mary Johnson (Mother) - 908-555-0101',
        active: true
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        studentId: 'ST002',
        email: 'michael.brown@demoschool.edu',
        grade: 'Post-Secondary Year 1',
        program: 'SPED Vocation Program',
        cohortId: demoCohorts[0].id,
        organizationId: demoOrg.id,
        emergencyContact: 'David Brown (Father) - 908-555-0102',
        active: true
      },
      {
        firstName: 'Sophia',
        lastName: 'Davis',
        studentId: 'ST003',
        email: 'sophia.davis@demoschool.edu',
        grade: 'Transition Year 3',
        program: 'SPED Vocation Program',
        cohortId: demoCohorts[0].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Lisa Davis (Mother) - 908-555-0103',
        active: true
      },
      // SPED Cohort B students
      {
        firstName: 'John',
        lastName: 'Smith',
        studentId: 'ST004',
        email: 'john.smith@demoschool.edu',
        grade: 'Transition Year 1',
        program: 'SPED Vocation Program',
        cohortId: demoCohorts[1].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Jennifer Smith (Guardian) - 908-555-0104',
        active: true
      },
      {
        firstName: 'Olivia',
        lastName: 'Wilson',
        studentId: 'ST005',
        email: 'olivia.wilson@demoschool.edu',
        grade: 'Post-Secondary Year 2',
        program: 'SPED Vocation Program',
        cohortId: demoCohorts[1].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Robert Wilson (Father) - 908-555-0105',
        active: true
      },
      {
        firstName: 'Lucas',
        lastName: 'Martinez',
        studentId: 'ST006',
        email: 'lucas.martinez@demoschool.edu',
        grade: 'Transition Year 4',
        program: 'SPED Vocation Program',
        cohortId: demoCohorts[1].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Carmen Martinez (Mother) - 908-555-0106',
        active: true
      },
      // JROTC Squadron Alpha students
      {
        firstName: 'Lucas',
        lastName: 'Rivers',
        studentId: 'JR001',
        email: 'lucas.rivers@demo.edu',
        grade: '10th',
        program: 'Air Force Junior ROTC Program',
        cohortId: demoCohorts[2].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Carmen Rivers (Mother) - 908-555-0201',
        active: true
      },
      {
        firstName: 'Maya',
        lastName: 'Thompson',
        studentId: 'JR002',
        email: 'maya.thompson@demo.edu',
        grade: '11th',
        program: 'Air Force Junior ROTC Program',
        cohortId: demoCohorts[2].id,
        organizationId: demoOrg.id,
        emergencyContact: 'James Thompson (Father) - 908-555-0202',
        active: true
      },
      {
        firstName: 'Ethan',
        lastName: 'Parker',
        studentId: 'JR003',
        email: 'ethan.parker@demo.edu',
        grade: '12th',
        program: 'Air Force Junior ROTC Program',
        cohortId: demoCohorts[2].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Linda Parker (Mother) - 908-555-0203',
        active: true
      },
      // JROTC Squadron Bravo students
      {
        firstName: 'Ava',
        lastName: 'Rodriguez',
        studentId: 'JR004',
        email: 'ava.rodriguez@demo.edu',
        grade: '9th',
        program: 'Air Force Junior ROTC Program',
        cohortId: demoCohorts[3].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Maria Rodriguez (Mother) - 908-555-0204',
        active: true
      },
      {
        firstName: 'Noah',
        lastName: 'Williams',
        studentId: 'JR005',
        email: 'noah.williams@demo.edu',
        grade: '10th',
        program: 'Air Force Junior ROTC Program',
        cohortId: demoCohorts[3].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Robert Williams (Father) - 908-555-0205',
        active: true
      },
      {
        firstName: 'Isabella',
        lastName: 'Garcia',
        studentId: 'JR006',
        email: 'isabella.garcia@demo.edu',
        grade: '11th',
        program: 'Air Force Junior ROTC Program',
        cohortId: demoCohorts[3].id,
        organizationId: demoOrg.id,
        emergencyContact: 'Ana Garcia (Mother) - 908-555-0206',
        active: true
      }
    ]).returning();

    // Create comprehensive weekly recurring assignments for all students
    // Week starts Monday August 18, 2025 and recurs weekly through August 18, 2026
    const recurrenceEndDate = new Date('2026-08-18T23:59:59');
    
    const demoAssignments = [];
    
    // Split students into SPED (first 6) and JROTC (last 6)
    const spedStudents = demoStudents.slice(0, 6);
    const jrotcStudents = demoStudents.slice(6, 12);
    
    // Create SPED student schedules
    for (let i = 0; i < spedStudents.length; i++) {
      const student = spedStudents[i];
      
      // Monday: Math Classes (9:00-10:00 AM)
      demoAssignments.push({
        eventTitle: 'Math Fundamentals',
        eventType: 'Academic',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-18T09:00:00'),
        endTime: new Date('2025-08-18T10:00:00'),
        duration: 60,
        location: 'Room 101',
        notes: 'Weekly recurring math class',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Ian Instructor',
        pointOfContact: 'ian.instructor@demoschool.edu'
      });
      
      // Monday: Physical Education (2:00-3:00 PM)
      demoAssignments.push({
        eventTitle: 'Physical Education',
        eventType: 'Elective',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-18T14:00:00'),
        endTime: new Date('2025-08-18T15:00:00'),
        duration: 60,
        location: 'Gymnasium',
        notes: 'Weekly physical education class',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Paul Paraprofessional',
        pointOfContact: 'paul.para@demoschool.edu'
      });
      
      // Tuesday: Science Classes (10:00-11:30 AM)
      demoAssignments.push({
        eventTitle: 'Life Science',
        eventType: 'Academic',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-19T10:00:00'),
        endTime: new Date('2025-08-19T11:30:00'),
        duration: 90,
        location: 'Lab 201',
        notes: 'Weekly science laboratory session',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      });
      
      // Tuesday: English Language Arts (1:00-2:30 PM)
      demoAssignments.push({
        eventTitle: 'English Language Arts',
        eventType: 'Academic',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-19T13:00:00'),
        endTime: new Date('2025-08-19T14:30:00'),
        duration: 90,
        location: 'Room 102',
        notes: 'Weekly English language arts class',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Ian Instructor',
        pointOfContact: 'ian.instructor@demoschool.edu'
      });
      
      // Wednesday: Vocational Training (9:00-11:00 AM)
      demoAssignments.push({
        eventTitle: i % 3 === 0 ? 'Automotive Basics' : i % 3 === 1 ? 'Culinary Arts' : 'Computer Skills',
        eventType: 'Vocational',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-20T09:00:00'),
        endTime: new Date('2025-08-20T11:00:00'),
        duration: 120,
        location: i % 3 === 0 ? 'Auto Shop' : i % 3 === 1 ? 'Kitchen Lab' : 'Computer Lab',
        notes: 'Weekly vocational training session',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      });
      
      // Wednesday: Social Studies (1:00-2:00 PM)
      demoAssignments.push({
        eventTitle: 'Social Studies',
        eventType: 'Academic',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-20T13:00:00'),
        endTime: new Date('2025-08-20T14:00:00'),
        duration: 60,
        location: 'Room 103',
        notes: 'Weekly social studies class',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Ian Instructor',
        pointOfContact: 'ian.instructor@demoschool.edu'
      });
      
      // Thursday: Art Therapy (10:00-12:00 PM)
      demoAssignments.push({
        eventTitle: 'Art Therapy',
        eventType: 'Elective',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-21T10:00:00'),
        endTime: new Date('2025-08-21T12:00:00'),
        duration: 120,
        location: 'Art Studio',
        notes: 'Weekly creative expression therapy',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      });
      
      // Thursday: Music Appreciation (2:00-3:00 PM)
      demoAssignments.push({
        eventTitle: 'Music Appreciation',
        eventType: 'Elective',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-21T14:00:00'),
        endTime: new Date('2025-08-21T15:00:00'),
        duration: 60,
        location: 'Music Room',
        notes: 'Weekly music appreciation class',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Sophie Staff',
        pointOfContact: 'sophie.staff@demoschool.edu'
      });
      
      // Friday: Physical Therapy (every other student gets alternating therapy times)
      if (i % 2 === 0) {
        demoAssignments.push({
          eventTitle: 'Physical Therapy Session',
          eventType: 'Therapy',
          studentId: student.id,
          organizationId: demoOrg.id,
          startTime: new Date('2025-08-22T09:00:00'),
          endTime: new Date('2025-08-22T10:00:00'),
          duration: 60,
          location: 'PT Room',
          notes: 'Weekly physical therapy session',
          recurrence: 'Weekly',
          recurrenceEndDate: recurrenceEndDate,
          responsibleParty: 'Paul Paraprofessional',
          pointOfContact: 'paul.para@demoschool.edu'
        });
      } else {
        demoAssignments.push({
          eventTitle: 'Occupational Therapy',
          eventType: 'Therapy',
          studentId: student.id,
          organizationId: demoOrg.id,
          startTime: new Date('2025-08-22T10:00:00'),
          endTime: new Date('2025-08-22T11:00:00'),
          duration: 60,
          location: 'OT Room',
          notes: 'Weekly occupational therapy session',
          recurrence: 'Weekly',
          recurrenceEndDate: recurrenceEndDate,
          responsibleParty: 'Sam Specialist',
          pointOfContact: 'sam.specialist@demoschool.edu'
        });
      }
      
      // Friday: Free Activity Period (alternating activities)
      demoAssignments.push({
        eventTitle: i % 3 === 0 ? 'Study Hall' : i % 3 === 1 ? 'Library Time' : 'Peer Tutoring',
        eventType: 'Extra-curricular',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-22T14:00:00'),
        endTime: new Date('2025-08-22T15:00:00'),
        duration: 60,
        location: i % 3 === 0 ? 'Study Room' : i % 3 === 1 ? 'Library' : 'Tutoring Center',
        notes: 'Weekly free activity period',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Sophie Staff',
        pointOfContact: 'sophie.staff@demoschool.edu'
      });
    }
    
    // Create JROTC student schedules 
    for (let i = 0; i < jrotcStudents.length; i++) {
      const student = jrotcStudents[i];
      
      // Monday: Military Mathematics (8:00-8:50 AM)
      demoAssignments.push({
        eventTitle: 'Military Mathematics',
        eventType: 'Academic',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-18T08:00:00'),
        endTime: new Date('2025-08-18T08:50:00'),
        duration: 50,
        location: 'JROTC Classroom A',
        notes: 'Military-focused mathematics curriculum',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Ian Instructor',
        pointOfContact: 'ian.instructor@demoschool.edu'
      });
      
      // Monday: Physical Training (3:00-4:00 PM)
      demoAssignments.push({
        eventTitle: 'Physical Training',
        eventType: 'Elective',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-18T15:00:00'),
        endTime: new Date('2025-08-18T16:00:00'),
        duration: 60,
        location: 'Fitness Center',
        notes: 'Military physical fitness training',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Paul Paraprofessional',
        pointOfContact: 'paul.para@demoschool.edu'
      });
      
      // Tuesday: Leadership Studies (8:00-8:50 AM)
      demoAssignments.push({
        eventTitle: 'Leadership Studies',
        eventType: 'Academic',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-19T08:00:00'),
        endTime: new Date('2025-08-19T08:50:00'),
        duration: 50,
        location: 'JROTC Classroom B',
        notes: 'Leadership principles and military structure',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Ian Instructor',
        pointOfContact: 'ian.instructor@demoschool.edu'
      });
      
      // Tuesday: Color Guard Practice (2:00-3:00 PM)
      demoAssignments.push({
        eventTitle: 'Color Guard Practice',
        eventType: 'Elective',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-19T14:00:00'),
        endTime: new Date('2025-08-19T15:00:00'),
        duration: 60,
        location: 'Drill Hall',
        notes: 'Color guard and ceremonial training',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      });
      
      // Wednesday: Drill and Ceremony (8:00-9:30 AM)
      demoAssignments.push({
        eventTitle: 'Drill and Ceremony',
        eventType: 'Vocational',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-20T08:00:00'),
        endTime: new Date('2025-08-20T09:30:00'),
        duration: 90,
        location: 'Parade Grounds',
        notes: 'Military drill and ceremonial procedures',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Ian Instructor',
        pointOfContact: 'ian.instructor@demoschool.edu'
      });
      
      // Wednesday: Military History (1:00-1:50 PM)
      demoAssignments.push({
        eventTitle: 'Military History',
        eventType: 'Academic',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-20T13:00:00'),
        endTime: new Date('2025-08-20T13:50:00'),
        duration: 50,
        location: 'JROTC Classroom C',
        notes: 'Study of military history and traditions',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      });
      
      // Thursday: Aviation Technology (8:00-9:30 AM)
      demoAssignments.push({
        eventTitle: 'Aviation Technology',
        eventType: 'Vocational',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-21T08:00:00'),
        endTime: new Date('2025-08-21T09:30:00'),
        duration: 90,
        location: 'Aviation Lab',
        notes: 'Aircraft technology and aerospace systems',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      });
      
      // Thursday: Military Band (2:00-3:00 PM)
      demoAssignments.push({
        eventTitle: 'Military Band',
        eventType: 'Elective',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-21T14:00:00'),
        endTime: new Date('2025-08-21T15:00:00'),
        duration: 60,
        location: 'Band Room',
        notes: 'Military band and ceremonial music',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Sophie Staff',
        pointOfContact: 'sophie.staff@demoschool.edu'
      });
      
      // Friday: Leadership Counseling (alternating students get different times)
      if (i % 2 === 0) {
        demoAssignments.push({
          eventTitle: 'Leadership Counseling',
          eventType: 'Therapy',
          studentId: student.id,
          organizationId: demoOrg.id,
          startTime: new Date('2025-08-22T09:00:00'),
          endTime: new Date('2025-08-22T10:00:00'),
          duration: 60,
          location: 'Counseling Office',
          notes: 'Leadership development and counseling',
          recurrence: 'Weekly',
          recurrenceEndDate: recurrenceEndDate,
          responsibleParty: 'Sam Specialist',
          pointOfContact: 'sam.specialist@demoschool.edu'
        });
      } else {
        demoAssignments.push({
          eventTitle: 'Communications Systems',
          eventType: 'Vocational',
          studentId: student.id,
          organizationId: demoOrg.id,
          startTime: new Date('2025-08-22T10:00:00'),
          endTime: new Date('2025-08-22T11:30:00'),
          duration: 90,
          location: 'Communications Center',
          notes: 'Military communications and technology',
          recurrence: 'Weekly',
          recurrenceEndDate: recurrenceEndDate,
          responsibleParty: 'Sophie Staff',
          pointOfContact: 'sophie.staff@demoschool.edu'
        });
      }
      
      // Friday: Aerospace Science (alternating activities)
      demoAssignments.push({
        eventTitle: i % 3 === 0 ? 'Aerospace Science' : i % 3 === 1 ? 'Flight Simulation' : 'Weather Systems',
        eventType: 'Academic',
        studentId: student.id,
        organizationId: demoOrg.id,
        startTime: new Date('2025-08-22T14:00:00'),
        endTime: new Date('2025-08-22T14:50:00'),
        duration: 50,
        location: i % 3 === 0 ? 'Science Lab' : i % 3 === 1 ? 'Flight Simulator' : 'Weather Station',
        notes: 'Aerospace science and aviation studies',
        recurrence: 'Weekly',
        recurrenceEndDate: recurrenceEndDate,
        responsibleParty: 'Ian Instructor',
        pointOfContact: 'ian.instructor@demoschool.edu'
      });
    }
    
    // Add some one-time testing events (non-recurring)
    demoAssignments.push({
      eventTitle: 'State Assessment Testing',
      eventType: 'Testing',
      studentId: demoStudents[0].id,
      organizationId: demoOrg.id,
      startTime: new Date('2025-09-15T09:00:00'),
      endTime: new Date('2025-09-15T11:00:00'),
      duration: 120,
      location: 'Testing Center',
      notes: 'Annual state-mandated assessment',
      recurrence: 'None',
      recurrenceEndDate: null,
      responsibleParty: 'Sophie Staff',
      pointOfContact: 'sophie.staff@demoschool.edu'
    });

    console.log('Creating assignments...');
    const createdAssignments = await db.insert(schema.assignments).values(demoAssignments).returning();
    console.log(`Created ${createdAssignments.length} assignments`);

    console.log('Database successfully initialized with:');
    console.log('- Demo School District organization');
    console.log('- 5 users with different roles');
    console.log('- 2 programs: SPED Vocation Program + Air Force Junior ROTC Program');
    console.log('- 20 classes: 10 SPED + 10 JROTC (Academic, Elective, Vocational)');
    console.log('- 4 cohorts: SPED (Cohort A, B) + JROTC (Squadron Alpha, Bravo)');
    console.log('- 12 students: 6 SPED + 6 JROTC students');
    console.log(`- ${createdAssignments.length} weekly recurring assignments starting Aug 18, 2025`);
    console.log('- SPED schedules: Mon (Math, PE), Tue (Science, English), Wed (Vocational, Social Studies)');
    console.log('- JROTC schedules: Mon (Military Math, PT), Tue (Leadership, Color Guard), Wed (Drill, History)');
    console.log('- Thu (Aviation/Art, Band/Music), Fri (Counseling/Communications, Aerospace/Activities)');
    console.log('- All assignments recur weekly through August 18, 2026');

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}
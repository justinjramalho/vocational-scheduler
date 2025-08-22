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

    // Create SPED Vocation Program
    const [program] = await db.insert(schema.programs).values({
      name: 'SPED Vocation Program',
      organizationId: demoOrg.id,
      description: 'Special Education Vocational Training Program'
        }).returning();

    // Create 10 classes (Academic, Elective, Vocational)
    await db.insert(schema.classes).values([
      // Academic Classes
      {
        name: 'Math Fundamentals',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[1].id, // Ian Instructor
        location: 'Room 101',
        defaultDuration: 60 // 60 minutes
      },
      {
        name: 'English Language Arts',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[1].id,
        location: 'Room 102',
        defaultDuration: 90
      },
      {
        name: 'Life Science',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[2].id, // Sam Specialist
        location: 'Lab 201',
        defaultDuration: 90
      },
      {
        name: 'Social Studies',
        eventType: 'Academic',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[1].id,
        location: 'Room 103',
        defaultDuration: 60
      },
      // Elective Classes
      {
        name: 'Art Therapy',
        eventType: 'Elective',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[2].id,
        location: 'Art Studio',
        defaultDuration: 120
      },
      {
        name: 'Music Appreciation',
        eventType: 'Elective',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[4].id, // Sophie Staff
        location: 'Music Room',
        defaultDuration: 60
      },
      {
        name: 'Physical Education',
        eventType: 'Elective',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[3].id, // Paul Paraprofessional
        location: 'Gymnasium',
        defaultDuration: 60
      },
      // Vocational Classes
      {
        name: 'Automotive Basics',
        eventType: 'Vocational',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[1].id,
        location: 'Auto Shop',
        defaultDuration: 120
      },
      {
        name: 'Culinary Arts',
        eventType: 'Vocational',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[2].id,
        location: 'Kitchen Lab',
        defaultDuration: 120
      },
      {
        name: 'Computer Skills',
        eventType: 'Vocational',
        organizationId: demoOrg.id,
        programId: program.id,
        createdBy: demoUsers[4].id,
        location: 'Computer Lab',
        defaultDuration: 120
      }
    ]).returning();

    // Create 2 cohorts tied to the SPED Vocation Program
    const demoCohorts = await db.insert(schema.cohorts).values([
      {
        name: 'Cohort A',
        programId: program.id,
        organizationId: demoOrg.id
      },
      {
        name: 'Cohort B',
        programId: program.id,
        organizationId: demoOrg.id
      }
    ]).returning();

    // Create 6 students split between cohorts
    const demoStudents = await db.insert(schema.students).values([
      // Cohort A students
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
      // Cohort B students
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
      }
    ]).returning();

    // Create 8 diverse assignments (class-based and non-class-based)
    const demoAssignments = [
      // Class-based assignments
      {
        eventTitle: 'Math Fundamentals',
        eventType: 'Academic',
        studentId: demoStudents[0].id,
        organizationId: demoOrg.id,
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T10:00:00'),
        duration: 60,
        location: 'Room 101',
        notes: 'Weekly recurring math class',
        recurrence: 'Weekly',
        responsibleParty: 'Ian Instructor',
        pointOfContact: 'ian.instructor@demoschool.edu'
      },
      {
        eventTitle: 'Culinary Arts',
        eventType: 'Vocational',
        studentId: demoStudents[1].id,
        organizationId: demoOrg.id,
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T16:00:00'),
        duration: 120,
        location: 'Kitchen Lab',
        notes: 'Hands-on cooking training',
        recurrence: 'Weekly',
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      },
      {
        eventTitle: 'Art Therapy',
        eventType: 'Elective',
        studentId: demoStudents[2].id,
        organizationId: demoOrg.id,
        startTime: new Date('2024-01-19T10:00:00'),
        endTime: new Date('2024-01-19T12:00:00'),
        duration: 120,
        location: 'Art Studio',
        notes: 'Creative expression therapy',
        recurrence: 'Weekly',
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      },
      // Non-class-based assignments (Therapy, Testing, Extra-curricular)
      {
        eventTitle: 'Physical Therapy Session',
        eventType: 'Therapy',
        studentId: demoStudents[0].id,
        organizationId: demoOrg.id,
        startTime: new Date('2024-01-16T11:00:00'),
        endTime: new Date('2024-01-16T12:00:00'),
        duration: 60,
        location: 'PT Room',
        notes: 'Weekly physical therapy session',
        recurrence: 'Weekly',
        responsibleParty: 'Paul Paraprofessional',
        pointOfContact: 'paul.para@demoschool.edu'
      },
      {
        eventTitle: 'Speech Therapy',
        eventType: 'Therapy',
        studentId: demoStudents[3].id,
        organizationId: demoOrg.id,
        startTime: new Date('2024-01-17T13:00:00'),
        endTime: new Date('2024-01-17T14:00:00'),
        duration: 60,
        location: 'Speech Room',
        notes: 'Individual speech therapy',
        recurrence: 'Weekly',
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      },
      {
        eventTitle: 'State Assessment Testing',
        eventType: 'Testing',
        studentId: demoStudents[4].id,
        organizationId: demoOrg.id,
        startTime: new Date('2024-01-18T09:00:00'),
        endTime: new Date('2024-01-18T11:00:00'),
        duration: 120,
        location: 'Testing Center',
        notes: 'Annual state-mandated assessment',
        recurrence: 'None',
        responsibleParty: 'Sophie Staff',
        pointOfContact: 'sophie.staff@demoschool.edu'
      },
      {
        eventTitle: 'Basketball Practice',
        eventType: 'Extra-curricular',
        studentId: demoStudents[1].id,
        organizationId: demoOrg.id,
        startTime: new Date('2024-01-15T15:30:00'),
        endTime: new Date('2024-01-15T17:00:00'),
        duration: 90,
        location: 'Gymnasium',
        notes: 'After-school basketball team practice',
        recurrence: 'Weekly',
        responsibleParty: 'Paul Paraprofessional',
        pointOfContact: 'paul.para@demoschool.edu'
      },
      {
        eventTitle: 'Occupational Therapy',
        eventType: 'Therapy',
        studentId: demoStudents[5].id,
        organizationId: demoOrg.id,
        startTime: new Date('2024-01-16T10:00:00'),
        endTime: new Date('2024-01-16T11:00:00'),
        duration: 60,
        location: 'OT Room',
        notes: 'Fine motor skills development',
        recurrence: 'Weekly',
        responsibleParty: 'Sam Specialist',
        pointOfContact: 'sam.specialist@demoschool.edu'
      }
    ];

    console.log('Creating assignments...');
    const createdAssignments = await db.insert(schema.assignments).values(demoAssignments).returning();
    console.log(`Created ${createdAssignments.length} assignments`);

    console.log('Database successfully initialized with:');
    console.log('- Demo School District organization');
    console.log('- 5 users with different roles');
    console.log('- 1 SPED Vocation Program');
    console.log('- 10 classes (Academic, Elective, Vocational)');
    console.log('- 2 cohorts (Cohort A, Cohort B)');
    console.log('- 6 students split between cohorts');
    console.log('- 8 assignments (class-based and therapy/testing/extra-curricular)');

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}
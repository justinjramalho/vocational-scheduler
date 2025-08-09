import { NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID } from '@/lib/db/connection';
import { organizations, users, cohorts, students, assignments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/init - Initialize database with demo data
export async function POST() {
  try {
    // Check if already initialized
    const existingOrg = await db.query.organizations.findFirst({
      where: eq(organizations.id, DEFAULT_ORG_ID)
    });

    if (existingOrg) {
      return NextResponse.json({ message: 'Database already initialized' });
    }

    // Create default organization
    await db.insert(organizations).values({
      id: DEFAULT_ORG_ID,
      name: 'Demo Vocational School',
      slug: 'demo-school',
      inviteCode: 'DEMO2024',
      domain: 'demo.edu',
      settings: {
        timezone: 'America/New_York',
        schoolYear: '2024-2025'
      }
    });

    // Create default user
    await db.insert(users).values({
      id: DEFAULT_USER_ID,
      email: 'demo@demo.edu',
      name: 'Demo Teacher',
      role: 'teacher',
      organizationId: DEFAULT_ORG_ID,
      emailVerified: new Date()
    });

    // Create sample cohorts
    const [cohort1] = await db.insert(cohorts).values({
      name: 'Morning Cohort A',
      description: 'Advanced vocational training group',
      color: '#3B82F6',
      teacherName: 'Ms. Johnson',
      academicYear: '2024-2025',
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    const [cohort2] = await db.insert(cohorts).values({
      name: 'Afternoon Cohort B',
      description: 'Foundational skills development',
      color: '#10B981',
      teacherName: 'Mr. Smith',
      academicYear: '2024-2025',
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    // Create sample students
    const [student1] = await db.insert(students).values({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@demo.edu',
      studentId: 'ST001',
      grade: '9th',
      cohortId: cohort1.id,
      notes: 'Excellent progress in vocational training',
      emergencyContact: 'Jane Smith (Mother) - 555-0123',
      accommodations: ['Extended time', 'Frequent breaks'],
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    const [student2] = await db.insert(students).values({
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma.johnson@demo.edu',
      studentId: 'ST002',
      grade: '10th',
      cohortId: cohort1.id,
      notes: 'Strong communication skills',
      emergencyContact: 'Robert Johnson (Father) - 555-0456',
      accommodations: ['Visual aids', 'Reduced distractions'],
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    const [student3] = await db.insert(students).values({
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@demo.edu',
      studentId: 'ST003',
      grade: '11th',
      cohortId: cohort2.id,
      notes: 'Needs additional support with social skills',
      emergencyContact: 'Lisa Brown (Guardian) - 555-0789',
      accommodations: ['Small group instruction', 'Social stories'],
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    const [student4] = await db.insert(students).values({
      firstName: 'Sophia',
      lastName: 'Davis',
      email: 'sophia.davis@demo.edu',
      studentId: 'ST004',
      grade: '12th',
      cohortId: cohort2.id,
      notes: 'Ready for independent work placement',
      emergencyContact: 'Mark Davis (Father) - 555-0012',
      accommodations: ['Job coach support'],
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    // Use student4 variable to avoid lint warning
    console.log('Created student:', student4.firstName);

    // Create sample assignments for today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Today's assignments
    const todayAssignments = [
      {
        studentId: student1.id,
        eventType: 'Academic',
        eventTitle: 'Math Class',
        location: 'Room 101',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
        duration: 60,
        responsibleParty: 'Mr. Anderson'
      },
      {
        studentId: student1.id,
        eventType: 'Therapy',
        eventTitle: 'Speech Therapy',
        location: 'Therapy Room 1',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
        duration: 30,
        responsibleParty: 'Dr. Wilson'
      },
      {
        studentId: student2.id,
        eventType: 'Vocational',
        eventTitle: 'Job Training - Retail',
        location: 'Training Store',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
        duration: 120,
        responsibleParty: 'Ms. Taylor'
      },
      {
        studentId: student3.id,
        eventType: 'Elective',
        eventTitle: 'Computer Skills',
        location: 'Computer Lab',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
        duration: 60,
        responsibleParty: 'Mr. Tech'
      }
    ];

    // Insert sample assignments
    for (const assignment of todayAssignments) {
      const endTime = new Date(assignment.startTime.getTime() + (assignment.duration * 60 * 1000));
      
      await db.insert(assignments).values({
        ...assignment,
        endTime,
        recurrence: 'None',
        organizationId: DEFAULT_ORG_ID,
        createdBy: DEFAULT_USER_ID,
      });
    }

    return NextResponse.json({ 
      message: 'Database initialized successfully with demo data',
      data: {
        organizations: 1,
        users: 1,
        cohorts: 2,
        students: 4,
        assignments: todayAssignments.length
      }
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
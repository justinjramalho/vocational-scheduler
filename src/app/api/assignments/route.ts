import { NextRequest, NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID, convertToUTC, initializeDatabase } from '@/lib/db/connection';
import { assignments, students } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

// GET /api/assignments - Get assignments with optional filters
export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    // Check if DEFAULT_ORG_ID is available
    if (!DEFAULT_ORG_ID) {
      return NextResponse.json(
        { error: 'Database not initialized. Please call /api/init first.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const date = searchParams.get('date');
    const cohortId = searchParams.get('cohortId');

    // Build conditions dynamically
    const conditions = [
      eq(assignments.organizationId, DEFAULT_ORG_ID),
      eq(assignments.active, true),
      eq(students.active, true)
    ];

    if (studentId) {
      conditions.push(eq(assignments.studentId, studentId));
    }

    if (cohortId) {
      conditions.push(eq(students.cohortId, cohortId));
    }

    if (date) {
      // Filter by specific date
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      conditions.push(
        gte(assignments.startTime, startOfDay),
        lte(assignments.startTime, endOfDay)
      );
    }

    const assignmentResults = await db
      .select({
        id: assignments.id,
        studentId: assignments.studentId,
        studentName: sql<string>`CONCAT(${students.firstName}, ' ', ${students.lastName})`,
        eventType: assignments.eventType,
        eventTitle: assignments.eventTitle,
        location: assignments.location,
        startTime: assignments.startTime,
        duration: assignments.duration,
        endTime: assignments.endTime,
        recurrence: assignments.recurrence,
        recurrenceEndDate: assignments.recurrenceEndDate,
        notes: assignments.notes,
        responsibleParty: assignments.responsibleParty,
        pointOfContact: assignments.pointOfContact,
        createdAt: assignments.createdAt,
        updatedAt: assignments.updatedAt,
      })
      .from(assignments)
      .innerJoin(students, eq(assignments.studentId, students.id))
      .where(and(...conditions))
      .orderBy(assignments.startTime);

    return NextResponse.json(assignmentResults);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/assignments - Create a new assignment
export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    // Check if DEFAULT_ORG_ID and DEFAULT_USER_ID are available
    if (!DEFAULT_ORG_ID || !DEFAULT_USER_ID) {
      return NextResponse.json(
        { error: 'Database not initialized. Please call /api/init first.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    const {
      studentId,
      eventType,
      eventTitle,
      location,
      startTime,
      duration,
      recurrence,
      recurrenceEndDate,
      notes,
      responsibleParty,
      pointOfContact
    } = body;

    // Validate required fields
    if (!studentId || !eventType || !eventTitle || !location || !startTime || !duration || !responsibleParty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert local time to UTC for storage
    const startDateTime = convertToUTC(new Date(startTime));
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 1000));

    // Validate recurrence end date if recurrence is set
    if (recurrence && recurrence !== 'None' && !recurrenceEndDate) {
      return NextResponse.json(
        { error: 'Recurrence end date is required for recurring assignments' },
        { status: 400 }
      );
    }

    // Get student name for response
    const student = await db.query.students.findFirst({
      where: and(
        eq(students.id, studentId),
        eq(students.organizationId, DEFAULT_ORG_ID)
      )
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Insert new assignment
    const [newAssignment] = await db.insert(assignments).values({
      studentId,
      eventType,
      eventTitle,
      location,
      startTime: startDateTime,
      duration,
      endTime: endDateTime,
      recurrence: recurrence || 'None',
      recurrenceEndDate: recurrenceEndDate ? convertToUTC(new Date(recurrenceEndDate)) : null,
      notes: notes || null,
      responsibleParty,
      pointOfContact: pointOfContact || null,
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    const response = {
      ...newAssignment,
      studentName: `${student.firstName} ${student.lastName}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
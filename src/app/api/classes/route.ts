import { NextRequest, NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID, initializeDatabase } from '@/lib/db/connection';
import { classes, cohorts, students, programs } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/classes?programId=xxx - Get classes, optionally filtered by program
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
    const programId = searchParams.get('programId');

    // Build where conditions
    const whereConditions = [
      eq(classes.organizationId, DEFAULT_ORG_ID),
      eq(classes.active, true)
    ];

    if (programId) {
      whereConditions.push(eq(classes.programId, programId));
    }

    const classesWithCounts = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        code: classes.code,
        department: classes.department,
        credits: classes.credits,
        duration: classes.duration,
        color: classes.color,
        academicYear: classes.academicYear,
        eventType: classes.eventType,
        programId: classes.programId,
        assignmentId: classes.assignmentId,
        location: classes.location,
        defaultDuration: classes.defaultDuration,
        active: classes.active,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        programName: programs.name,
        cohortCount: sql<number>`COUNT(DISTINCT ${cohorts.id})::int`,
        studentCount: sql<number>`COUNT(DISTINCT ${students.id})::int`,
      })
      .from(classes)
      .leftJoin(programs, eq(classes.programId, programs.id))
      .leftJoin(cohorts, and(
        eq(classes.id, cohorts.classId),
        eq(cohorts.active, true)
      ))
      .leftJoin(students, and(
        eq(classes.id, students.classId),
        eq(students.active, true)
      ))
      .where(and(...whereConditions))
      .groupBy(classes.id, programs.name)
      .orderBy(desc(classes.createdAt));

    return NextResponse.json(classesWithCounts);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST /api/classes - Create a new class from assignment data
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
      name, // class title from assignment
      eventType, // Academic or Elective
      programId, // from student's program
      assignmentId, // reference to original assignment
      location, // from assignment
      defaultDuration, // from assignment duration
      description,
      code,
      department,
      credits,
      color,
      academicYear
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 }
      );
    }

    if (!eventType || (eventType !== 'Academic' && eventType !== 'Elective')) {
      return NextResponse.json(
        { error: 'Event type must be Academic or Elective for class creation' },
        { status: 400 }
      );
    }

    if (!programId) {
      return NextResponse.json(
        { error: 'Program ID is required for class creation' },
        { status: 400 }
      );
    }

    // Check if class already exists (name + eventType + programId)
    const existingClass = await db
      .select()
      .from(classes)
      .where(and(
        eq(classes.name, name),
        eq(classes.eventType, eventType),
        eq(classes.programId, programId),
        eq(classes.organizationId, DEFAULT_ORG_ID),
        eq(classes.active, true)
      ))
      .limit(1);

    if (existingClass.length > 0) {
      return NextResponse.json(
        { 
          error: 'Class already exists',
          existingClass: existingClass[0]
        },
        { status: 409 }
      );
    }

    // Insert new class
    const [newClass] = await db.insert(classes).values({
      name,
      eventType,
      programId,
      assignmentId: assignmentId || null,
      location: location || null,
      defaultDuration: defaultDuration || null,
      description: description || null,
      code: code || null,
      department: department || null,
      credits: credits || null,
      duration: duration || null,
      color: color || '#3B82F6',
      academicYear: academicYear || null,
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    const response = {
      ...newClass,
      cohortCount: 0,
      studentCount: 0,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID, initializeDatabase } from '@/lib/db/connection';
import { classes, cohorts, students } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/classes - Get all classes/programs
export async function GET() {
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
        active: classes.active,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        cohortCount: sql<number>`COUNT(DISTINCT ${cohorts.id})::int`,
        studentCount: sql<number>`COUNT(DISTINCT ${students.id})::int`,
      })
      .from(classes)
      .leftJoin(cohorts, and(
        eq(classes.id, cohorts.classId),
        eq(cohorts.active, true)
      ))
      .leftJoin(students, and(
        eq(classes.id, students.classId),
        eq(students.active, true)
      ))
      .where(and(
        eq(classes.organizationId, DEFAULT_ORG_ID),
        eq(classes.active, true)
      ))
      .groupBy(classes.id)
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

// POST /api/classes - Create a new class/program
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
      name,
      description,
      code,
      department,
      credits,
      duration,
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

    // Insert new class
    const [newClass] = await db.insert(classes).values({
      name,
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

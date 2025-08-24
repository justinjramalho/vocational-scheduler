import { NextRequest, NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID, initializeDatabase } from '@/lib/db/connection';
import { programs, cohorts, students } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/cohorts - Get all cohorts
export async function GET() {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    // Check if DEFAULT_ORG_ID is available after initialization
    if (!DEFAULT_ORG_ID) {
      // Try initialization once more
      await initializeDatabase();
      if (!DEFAULT_ORG_ID) {
        return NextResponse.json(
          { error: 'Database initialization failed. Please try again.' },
          { status: 503 }
        );
      }
    }

    const cohortsWithStudentCount = await db
      .select({
        id: cohorts.id,
        name: cohorts.name,
        description: cohorts.description,
        programId: cohorts.programId,
        programName: programs.name,
        active: cohorts.active,
        createdAt: cohorts.createdAt,
        updatedAt: cohorts.updatedAt,
        studentCount: sql<number>`COUNT(${students.id})::int`,
      })
      .from(cohorts)
      .innerJoin(programs, eq(cohorts.programId, programs.id))
      .leftJoin(students, and(
        eq(cohorts.id, students.cohortId),
        eq(students.active, true)
      ))
      .where(and(
        eq(cohorts.organizationId, DEFAULT_ORG_ID),
        eq(cohorts.active, true)
      ))
      .groupBy(cohorts.id, programs.id)
      .orderBy(desc(cohorts.createdAt));

    // Transform to include studentIds array for compatibility
    const transformedCohorts = await Promise.all(
      cohortsWithStudentCount.map(async (cohort) => {
        const cohortStudents = await db
          .select({ id: students.id })
          .from(students)
          .where(and(
            eq(students.cohortId, cohort.id),
            eq(students.active, true)
          ));

        return {
          ...cohort,
          studentIds: cohortStudents.map(s => s.id),
        };
      })
    );

    return NextResponse.json(transformedCohorts);
  } catch (error) {
    console.error('Error fetching cohorts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohorts' },
      { status: 500 }
    );
  }
}

// POST /api/cohorts - Create a new cohort
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
      programId
    } = body;

    // Validate required fields
    if (!name || !programId) {
      return NextResponse.json(
        { error: 'Cohort name and program ID are required' },
        { status: 400 }
      );
    }

    // Verify the program exists
    const parentProgram = await db.query.programs.findFirst({
      where: and(
        eq(programs.id, programId),
        eq(programs.organizationId, DEFAULT_ORG_ID)
      )
    });

    if (!parentProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Insert new cohort
    const [newCohort] = await db.insert(cohorts).values({
      name,
      description: description || null,
      programId,
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    const response = {
      ...newCohort,
      programName: parentProgram.name,
      studentIds: [],
      studentCount: 0,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating cohort:', error);
    return NextResponse.json(
      { error: 'Failed to create cohort' },
      { status: 500 }
    );
  }
}
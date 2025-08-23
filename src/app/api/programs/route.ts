import { NextRequest, NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID, initializeDatabase } from '@/lib/db/connection';
import { programs, cohorts, students } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/programs - Get all programs
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

    const programsWithCohortCount = await db
      .select({
        id: programs.id,
        name: programs.name,
        description: programs.description,
        organizationId: programs.organizationId,
        active: programs.active,
        createdAt: programs.createdAt,
        updatedAt: programs.updatedAt,
        cohortCount: sql<number>`COUNT(${cohorts.id})::int`,
      })
      .from(programs)
      .leftJoin(cohorts, and(
        eq(programs.id, cohorts.programId),
        eq(cohorts.active, true)
      ))
      .where(and(
        eq(programs.organizationId, DEFAULT_ORG_ID),
        eq(programs.active, true)
      ))
      .groupBy(programs.id)
      .orderBy(desc(programs.createdAt));

    // Transform to include cohortIds array and student count for compatibility
    const transformedPrograms = await Promise.all(
      programsWithCohortCount.map(async (program) => {
        const programCohorts = await db
          .select({ id: cohorts.id })
          .from(cohorts)
          .where(and(
            eq(cohorts.programId, program.id),
            eq(cohorts.active, true)
          ));

        // Get student count for this program
        const studentCount = await db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(students)
          .where(and(
            eq(students.program, program.name),
            eq(students.active, true)
          ));

        return {
          ...program,
          cohortIds: programCohorts.map(c => c.id),
          studentCount: studentCount[0]?.count || 0,
        };
      })
    );

    return NextResponse.json(transformedPrograms);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST /api/programs - Create a new program
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
      description
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Program name is required' },
        { status: 400 }
      );
    }

    // Insert new program
    const [newProgram] = await db.insert(programs).values({
      name,
      description: description || null,
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    const response = {
      ...newProgram,
      cohortIds: [],
      cohortCount: 0,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}

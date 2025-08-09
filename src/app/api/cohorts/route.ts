import { NextRequest, NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID } from '@/lib/db/connection';
import { cohorts, students } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/cohorts - Get all cohorts
export async function GET() {
  try {
    const cohortsWithStudentCount = await db
      .select({
        id: cohorts.id,
        name: cohorts.name,
        description: cohorts.description,
        color: cohorts.color,
        teacherName: cohorts.teacherName,
        academicYear: cohorts.academicYear,
        active: cohorts.active,
        createdAt: cohorts.createdAt,
        updatedAt: cohorts.updatedAt,
        studentCount: sql<number>`COUNT(${students.id})::int`,
      })
      .from(cohorts)
      .leftJoin(students, and(
        eq(cohorts.id, students.cohortId),
        eq(students.active, true)
      ))
      .where(and(
        eq(cohorts.organizationId, DEFAULT_ORG_ID),
        eq(cohorts.active, true)
      ))
      .groupBy(cohorts.id)
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
    const body = await request.json();
    
    const {
      name,
      description,
      color,
      teacherName,
      academicYear
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Cohort name is required' },
        { status: 400 }
      );
    }

    // Insert new cohort
    const [newCohort] = await db.insert(cohorts).values({
      name,
      description: description || null,
      color: color || '#3B82F6',
      teacherName: teacherName || null,
      academicYear: academicYear || null,
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    const response = {
      ...newCohort,
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
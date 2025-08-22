import { NextRequest, NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID, initializeDatabase } from '@/lib/db/connection';
import { students, cohorts } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/students - Get all students
export async function GET() {
  try {
    // Initialize database if needed
    if (!DEFAULT_ORG_ID) {
      await initializeDatabase();
    }
    
    // Double-check if constants are now available
    if (!DEFAULT_ORG_ID) {
      return NextResponse.json(
        { error: 'Database initialization failed' },
        { status: 500 }
      );
    }

    // Query students with all fields including program
    const studentsData = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        email: students.email,
        studentId: students.studentId,
        grade: students.grade,
        program: students.program,
        cohortId: students.cohortId,
        notes: students.notes,
        emergencyContact: students.emergencyContact,
        accommodations: students.accommodations,
        active: students.active,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
      })
      .from(students)
      .where(and(
        eq(students.organizationId, DEFAULT_ORG_ID),
        eq(students.active, true)
      ))
      .orderBy(desc(students.createdAt));

    // Then get cohort names separately
    const studentsWithCohorts = await Promise.all(
      studentsData.map(async (student) => {
        let cohortName = null;
        if (student.cohortId) {
          const cohort = await db.query.cohorts.findFirst({
            where: eq(cohorts.id, student.cohortId)
          });
          cohortName = cohort?.name || null;
        }
        return {
          ...student,
          cohortName,
        };
      })
    );

    // Transform to match our existing interface
    const transformedStudents = studentsWithCohorts.map(student => ({
      ...student,
      fullName: `${student.firstName} ${student.lastName}`,
      accommodations: Array.isArray(student.accommodations) ? student.accommodations : [],
    }));

    return NextResponse.json(transformedStudents);
  } catch (error: unknown) {
    console.error('Error fetching students:', error);
    const errorObj = error as Record<string, unknown>;
    console.error('Error details:', errorObj?.message);
    console.error('Error stack:', errorObj?.stack);
    return NextResponse.json(
      { error: 'Failed to fetch students', details: (errorObj?.message as string) || 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    // Check if DEFAULT_ORG_ID and DEFAULT_USER_ID are available
    if (!DEFAULT_ORG_ID || !DEFAULT_USER_ID) {
      return NextResponse.json(
        { error: 'Database not initialized. Please call /api/init first.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    const {
      firstName,
      lastName,
      email,
      studentId,
      grade,
      program,
      cohortId,
      notes,
      emergencyContact,
      accommodations
    } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    if (!program || !program.trim()) {
      return NextResponse.json(
        { error: 'Program is required' },
        { status: 400 }
      );
    }

    // Insert new student
    const [newStudent] = await db.insert(students).values({
      firstName,
      lastName,
      email: email || null,
      studentId: studentId || null,
      grade: grade || null,
      program: program || null,
      cohortId: cohortId || null, // now stores cohort name directly
      notes: notes || null,
      emergencyContact: emergencyContact || null,
      accommodations: accommodations || [],
      organizationId: DEFAULT_ORG_ID,
      createdBy: DEFAULT_USER_ID,
    }).returning();

    // Get cohort name if cohort is assigned
    let cohortName = null;
    if (newStudent.cohortId) {
      const cohort = await db.query.cohorts.findFirst({
        where: eq(cohorts.id, newStudent.cohortId)
      });
      cohortName = cohort?.name || null;
    }

    const response = {
      ...newStudent,
      fullName: `${newStudent.firstName} ${newStudent.lastName}`,
      cohortName,
      accommodations: Array.isArray(newStudent.accommodations) ? newStudent.accommodations : [],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
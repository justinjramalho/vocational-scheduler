import { NextRequest, NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID, initializeDatabase } from '@/lib/db/connection';
import { students, cohorts } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/students - Get all students
export async function GET() {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    if (!DEFAULT_ORG_ID) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const studentsWithCohorts = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        email: students.email,
        studentId: students.studentId,
        grade: students.grade,
        cohortId: students.cohortId,
        cohortName: cohorts.name,
        notes: students.notes,
        emergencyContact: students.emergencyContact,
        accommodations: students.accommodations,
        active: students.active,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
      })
      .from(students)
      .leftJoin(cohorts, eq(students.cohortId, cohorts.id))
      .where(and(
        eq(students.organizationId, DEFAULT_ORG_ID),
        eq(students.active, true)
      ))
      .orderBy(desc(students.createdAt));

    // Transform to match our existing interface
    const transformedStudents = studentsWithCohorts.map(student => ({
      ...student,
      fullName: `${student.firstName} ${student.lastName}`,
      accommodations: Array.isArray(student.accommodations) ? student.accommodations : [],
    }));

    return NextResponse.json(transformedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
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

    // Insert new student
    const [newStudent] = await db.insert(students).values({
      firstName,
      lastName,
      email: email || null,
      studentId: studentId || null,
      grade: grade || null,
      cohortId: cohortId || null,
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
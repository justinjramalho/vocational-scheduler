import { NextRequest, NextResponse } from 'next/server';
import { db, DEFAULT_ORG_ID, initializeDatabase } from '@/lib/db/connection';
import { students, cohorts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface Props {
  params: Promise<{ id: string }>;
}

// GET /api/students/[id] - Get a specific student
export async function GET(request: NextRequest, { params }: Props) {
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

    const { id } = await params;
    
    const student = await db
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
        eq(students.id, id),
        eq(students.organizationId, DEFAULT_ORG_ID),
        eq(students.active, true)
      ))
      .limit(1);

    if (student.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const response = {
      ...student[0],
      fullName: `${student[0].firstName} ${student[0].lastName}`,
      accommodations: Array.isArray(student[0].accommodations) ? student[0].accommodations : [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Update a student
export async function PUT(request: NextRequest, { params }: Props) {
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

    const { id } = await params;
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

    // Update student
    const [updatedStudent] = await db.update(students)
      .set({
        firstName,
        lastName,
        email: email || null,
        studentId: studentId || null,
        grade: grade || null,
        cohortId: cohortId || null,
        notes: notes || null,
        emergencyContact: emergencyContact || null,
        accommodations: accommodations || [],
        updatedAt: new Date(),
      })
      .where(and(
        eq(students.id, id),
        eq(students.organizationId, DEFAULT_ORG_ID)
      ))
      .returning();

    if (!updatedStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get cohort name if cohort is assigned
    let cohortName = null;
    if (updatedStudent.cohortId) {
      const cohort = await db.query.cohorts.findFirst({
        where: eq(cohorts.id, updatedStudent.cohortId)
      });
      cohortName = cohort?.name || null;
    }

    const response = {
      ...updatedStudent,
      fullName: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
      cohortName,
      accommodations: Array.isArray(updatedStudent.accommodations) ? updatedStudent.accommodations : [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - Soft delete a student
export async function DELETE(request: NextRequest, { params }: Props) {
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

    const { id } = await params;

    // Soft delete by setting active to false
    const [deletedStudent] = await db.update(students)
      .set({
        active: false,
        updatedAt: new Date(),
      })
      .where(and(
        eq(students.id, id),
        eq(students.organizationId, DEFAULT_ORG_ID)
      ))
      .returning();

    if (!deletedStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import * as schema from '@/lib/db/schema';
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const cohortId = searchParams.get('cohortId');
    const date = searchParams.get('date');

    if (!studentId && !cohortId) {
      return NextResponse.json({ error: 'Either studentId or cohortId is required' }, { status: 400 });
    }

    let assignments;

    if (studentId) {
      // Get assignments for a specific student
      let query = db
        .select({
          id: schema.assignments.id,
          studentId: schema.assignments.studentId,
          studentName: sql<string>`${schema.students.firstName} || ' ' || ${schema.students.lastName}`,
          eventType: schema.assignments.eventType,
          eventTitle: schema.assignments.eventTitle,
          location: schema.assignments.location,
          startTime: schema.assignments.startTime,
          duration: schema.assignments.duration,
          endTime: schema.assignments.endTime,
          recurrence: schema.assignments.recurrence,
          responsibleParty: schema.assignments.responsibleParty,
          pointOfContact: schema.assignments.pointOfContact,
          notes: schema.assignments.notes,
          createdAt: schema.assignments.createdAt,
          updatedAt: schema.assignments.updatedAt,
        })
        .from(schema.assignments)
        .leftJoin(schema.students, eq(schema.assignments.studentId, schema.students.id))
        .where(and(
          eq(schema.assignments.studentId, studentId),
          eq(schema.assignments.active, true)
        ));

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query.where(and(
          eq(schema.assignments.studentId, studentId),
          eq(schema.assignments.active, true),
          gte(schema.assignments.startTime, startOfDay),
          lte(schema.assignments.startTime, endOfDay)
        ));
      }

      assignments = await query.orderBy(schema.assignments.startTime);
    } else {
      // Get assignments for a cohort (all students in the cohort)
      const cohortStudents = await db
        .select({ id: schema.students.id })
        .from(schema.students)
        .where(and(
          eq(schema.students.cohortId, cohortId!),
          eq(schema.students.active, true)
        ));

      if (cohortStudents.length === 0) {
        return NextResponse.json([]);
      }

      const studentIds = cohortStudents.map(s => s.id);

      let query = db
        .select({
          id: schema.assignments.id,
          studentId: schema.assignments.studentId,
          studentName: sql<string>`${schema.students.firstName} || ' ' || ${schema.students.lastName}`,
          eventType: schema.assignments.eventType,
          eventTitle: schema.assignments.eventTitle,
          location: schema.assignments.location,
          startTime: schema.assignments.startTime,
          duration: schema.assignments.duration,
          endTime: schema.assignments.endTime,
          recurrence: schema.assignments.recurrence,
          responsibleParty: schema.assignments.responsibleParty,
          pointOfContact: schema.assignments.pointOfContact,
          notes: schema.assignments.notes,
          createdAt: schema.assignments.createdAt,
          updatedAt: schema.assignments.updatedAt,
        })
        .from(schema.assignments)
        .leftJoin(schema.students, eq(schema.assignments.studentId, schema.students.id))
        .where(and(
          inArray(schema.assignments.studentId, studentIds),
          eq(schema.assignments.active, true)
        ));

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query.where(and(
          inArray(schema.assignments.studentId, studentIds),
          eq(schema.assignments.active, true),
          gte(schema.assignments.startTime, startOfDay),
          lte(schema.assignments.startTime, endOfDay)
        ));
      }

      assignments = await query.orderBy(schema.assignments.startTime);
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    // Calculate end time
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (duration * 60000)); // duration is in minutes

    // Get organization ID from student
    const student = await db.query.students.findFirst({
      where: eq(schema.students.id, studentId),
      columns: { organizationId: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const [newAssignment] = await db.insert(schema.assignments).values({
      studentId,
      eventType,
      eventTitle,
      location,
      startTime: start,
      duration,
      endTime: end,
      recurrence: recurrence || 'None',
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
      notes,
      responsibleParty,
      pointOfContact,
      organizationId: student.organizationId,
    }).returning();

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error('Database insert error:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
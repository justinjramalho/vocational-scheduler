import { NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import * as schema from '@/lib/db/schema';
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm';

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const cohortId = searchParams.get('cohortId');
    const date = searchParams.get('date');

    console.log(`[ASSIGNMENTS-API] ${timestamp} - GET request`, {
      studentId,
      cohortId,
      date
    });

    if (!studentId && !cohortId) {
      console.error(`[ASSIGNMENTS-API] ${timestamp} - Missing required parameters`);
      return NextResponse.json({ error: 'Either studentId or cohortId is required' }, { status: 400 });
    }

    let assignments;

    if (studentId) {
      // Get assignments for a specific student
      // Build where conditions
      const whereConditions = [
        eq(schema.assignments.studentId, studentId),
        eq(schema.assignments.active, true)
      ];

      if (date) {
        // Create UTC date range for the specified date
        const startOfDay = new Date(date + 'T00:00:00.000Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');

        console.log(`[ASSIGNMENTS-API] ${timestamp} - Date filter:`, {
          date,
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString()
        });

        whereConditions.push(
          gte(schema.assignments.startTime, startOfDay),
          lte(schema.assignments.startTime, endOfDay)
        );
      }

      const query = db
        .select({
          id: schema.assignments.id,
          studentId: schema.assignments.studentId,
          classId: schema.assignments.classId, // FIXED: Added missing classId field
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
        .where(and(...whereConditions));

      assignments = await query.orderBy(schema.assignments.startTime);
      console.log(`[ASSIGNMENTS-API] ${timestamp} - Found ${assignments.length} assignments for student ${studentId}`);
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

            // Build where conditions for cohort
      const whereConditions = [
        inArray(schema.assignments.studentId, studentIds),
        eq(schema.assignments.active, true)
      ];

      if (date) {
        // Create UTC date range for the specified date
        const startOfDay = new Date(date + 'T00:00:00.000Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');

        console.log(`[ASSIGNMENTS-API] ${timestamp} - Cohort date filter:`, {
          date,
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString()
        });

        whereConditions.push(
          gte(schema.assignments.startTime, startOfDay),
          lte(schema.assignments.startTime, endOfDay)
        );
      }

      const query = db
        .select({
          id: schema.assignments.id,
          studentId: schema.assignments.studentId,
          classId: schema.assignments.classId, // FIXED: Added missing classId field
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
        .where(and(...whereConditions));

      assignments = await query.orderBy(schema.assignments.startTime);
      console.log(`[ASSIGNMENTS-API] ${timestamp} - Found ${assignments.length} assignments for cohort ${cohortId}`);
    }

    console.log(`[ASSIGNMENTS-API] ${timestamp} - Returning assignments:`, 
      assignments.map(a => ({ 
        eventType: a.eventType, 
        eventTitle: a.eventTitle, 
        studentName: a.studentName,
        startTime: a.startTime 
      }))
    );

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[ASSIGNMENTS-API] ${timestamp} - POST request started`);
  
  let body: Record<string, unknown> = {};
  
  try {
    body = await request.json();
    console.log(`[ASSIGNMENTS-API] ${timestamp} - Request body:`, JSON.stringify(body, null, 2));
    
    const {
      studentId,
      classId, // RESTORED for class assignments
      eventType,
      eventTitle,
      location,
      startTime,
      endTime, // optional - for imports (e.g., Google Sheets)
      duration,
      recurrence,
      recurrenceEndDate,
      notes,
      responsibleParty,
      pointOfContact
    } = body as {
      studentId: string;
      classId?: string;
      eventType: string;
      eventTitle: string;
      location: string;
      startTime: string;
      endTime?: string;
      duration?: number;
      recurrence?: string;
      recurrenceEndDate?: string;
      notes?: string;
      responsibleParty: string;
      pointOfContact?: string;
    };

    // Flexible time calculation - support multiple input scenarios
    let finalStartTime: Date;
    let finalEndTime: Date;
    let finalDuration: number;

    if (startTime && endTime) {
      // Import scenario: Both start and end time provided (e.g., Google Sheets import)
      finalStartTime = new Date(startTime);
      finalEndTime = new Date(endTime);
      finalDuration = Math.round((finalEndTime.getTime() - finalStartTime.getTime()) / 60000); // Calculate duration in minutes
      
      // Validate calculated duration
      if (finalDuration < 1 || finalDuration > 720) {
        return NextResponse.json({ 
          error: 'Calculated duration must be between 1 and 720 minutes',
          calculatedDuration: finalDuration 
        }, { status: 400 });
      }

      // If duration was also provided, validate consistency
      if (duration && Math.abs(finalDuration - duration) > 0) {
        return NextResponse.json({
          error: 'Time mismatch: startTime + duration ≠ endTime',
          details: `Calculated duration (${finalDuration} min) doesn't match provided duration (${duration} min)`,
          calculatedDuration: finalDuration,
          providedDuration: duration
        }, { status: 400 });
      }
    } else if (startTime && duration) {
      // Manual entry scenario: Start time and duration provided
      finalStartTime = new Date(startTime);
      finalDuration = duration;
      finalEndTime = new Date(finalStartTime.getTime() + (finalDuration * 60000));
      
      // Validate provided duration
      if (finalDuration < 1 || finalDuration > 720) {
        return NextResponse.json({ 
          error: 'Duration must be between 1 and 720 minutes' 
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: 'Either (startTime + duration) or (startTime + endTime) must be provided' 
      }, { status: 400 });
    }

    console.log(`[ASSIGNMENTS-API] ${timestamp} - Time calculation completed:`, {
      startTime: finalStartTime.toISOString(),
      endTime: finalEndTime.toISOString(),
      duration: finalDuration,
      calculationMethod: endTime ? 'endTime-derived' : 'duration-based'
    });

    console.log(`[ASSIGNMENTS-API] ${timestamp} - Fetching student details for ID: ${studentId}`);

    // Get student details - simplified query without problematic relations
    const student = await db.query.students.findFirst({
      where: eq(schema.students.id, studentId),
      columns: { 
        organizationId: true, 
        program: true
      }
    });

    console.log(`[ASSIGNMENTS-API] ${timestamp} - Student lookup result:`, student ? 'Found' : 'Not found');

    if (!student) {
      console.log(`[ASSIGNMENTS-API] ${timestamp} - Student not found for ID: ${studentId}`);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    console.log(`[ASSIGNMENTS-API] ${timestamp} - Student found:`, {
      organizationId: student.organizationId,
      program: student.program
    });

    // TEMPORARILY COMMENTED OUT CLASS LOGIC FOR TESTING
    // let finalClassId = classId;
    // if ((eventType === 'Academic' || eventType === 'Elective') && !classId) {
    //   ... class creation logic ...
    // }
    const finalClassId = null; // TEMPORARILY SET TO NULL

    console.log(`[ASSIGNMENTS-API] ${timestamp} - Creating assignment with values:`, {
      studentId,
      classId: finalClassId,
      eventType,
      eventTitle,
      location,
      startTime: finalStartTime.toISOString(),
      duration: finalDuration,
      endTime: finalEndTime.toISOString(),
      organizationId: student.organizationId
    });
    
    // Create the assignment with classId support
    const [newAssignment] = await db.insert(schema.assignments).values({
      studentId,
      classId: classId || null, // RESTORED classId field
      eventType,
      eventTitle,
      location,
      startTime: finalStartTime,
      duration: finalDuration,
      endTime: finalEndTime,
      recurrence: recurrence || 'None',
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
      notes: notes || null,
      responsibleParty,
      pointOfContact: pointOfContact || null,
      organizationId: student.organizationId,
    }).returning();

        // TEMPORARILY COMMENTED OUT CLASS UPDATE LOGIC
    // if (finalClassId && (eventType === 'Academic' || eventType === 'Elective')) {
    //   ... class update logic ...
    // }

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error: unknown) {
    console.error('[ASSIGNMENTS-API] ERROR CAUGHT:', error);
    
    const errorObj = error as Record<string, unknown>;
    console.error('[ASSIGNMENTS-API] Error message:', errorObj?.message);
    console.error('[ASSIGNMENTS-API] Error stack:', errorObj?.stack);
    console.error('[ASSIGNMENTS-API] Error name:', errorObj?.name);
    console.error('[ASSIGNMENTS-API] Error code:', errorObj?.code);
    console.error('[ASSIGNMENTS-API] Error detail:', errorObj?.detail);
    console.error('[ASSIGNMENTS-API] Error constraint:', errorObj?.constraint);
    console.error('[ASSIGNMENTS-API] Request body was:', JSON.stringify(body || {}, null, 2));
    
    return NextResponse.json({ 
      error: 'Failed to create assignment',
      details: (errorObj?.message as string) || 'Unknown error',
      errorName: (errorObj?.name as string) || 'Unknown',
      code: errorObj?.code,
      detail: errorObj?.detail,
      constraint: errorObj?.constraint,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { initializeDatabase, db, DEFAULT_ORG_ID } from '@/lib/db/connection';
import { organizations, users, classes, cohorts, students, assignments } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

// GET /api/init - Initialize database with demo data (for browser testing)
export async function GET() {
  return await handleInit();
}

// POST /api/init - Initialize database with demo data
export async function POST() {
  return await handleInit();
}

async function handleInit() {
  try {
    await initializeDatabase();
    
    // Count actual data in the database
    const orgCount = await db.select({ count: count() }).from(organizations);
    const userCount = await db.select({ count: count() }).from(users);
    const classCount = DEFAULT_ORG_ID ? 
      await db.select({ count: count() }).from(classes).where(eq(classes.organizationId, DEFAULT_ORG_ID)) :
      [{ count: 0 }];
    const cohortCount = DEFAULT_ORG_ID ? 
      await db.select({ count: count() }).from(cohorts).where(eq(cohorts.organizationId, DEFAULT_ORG_ID)) :
      [{ count: 0 }];
    const studentCount = DEFAULT_ORG_ID ? 
      await db.select({ count: count() }).from(students).where(eq(students.organizationId, DEFAULT_ORG_ID)) :
      [{ count: 0 }];
    const assignmentCount = DEFAULT_ORG_ID ? 
      await db.select({ count: count() }).from(assignments).where(eq(assignments.organizationId, DEFAULT_ORG_ID)) :
      [{ count: 0 }];
    
    return NextResponse.json({ 
      message: 'Database initialized successfully',
      data: {
        organizations: orgCount[0]?.count || 0,
        users: userCount[0]?.count || 0,
        classes: classCount[0]?.count || 0,
        cohorts: cohortCount[0]?.count || 0,
        students: studentCount[0]?.count || 0,
        assignments: assignmentCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

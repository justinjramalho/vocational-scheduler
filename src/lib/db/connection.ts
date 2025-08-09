import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// Create the database connection
export const db = drizzle(sql, { schema });

// For development, we'll track the default organization
export let DEFAULT_ORG_ID: string | null = null;
export let DEFAULT_USER_ID: string | null = null;

// Timezone utility functions
export function convertToUserTimezone(utcDate: Date, timezone?: string): Date {
  if (!timezone) {
    // Use browser's timezone if none specified
    return new Date(utcDate.toLocaleString());
  }
  
  // Convert UTC to specific timezone
  return new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
}

export function convertToUTC(localDate: Date, timezone?: string): Date {
  if (!timezone) {
    return new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
  }
  
  // More sophisticated timezone conversion would go here
  // For now, assume the input is already in the correct format
  return localDate;
}

// Database initialization and seeding
export async function initializeDatabase() {
  try {
    // Check if default organization exists
    const existingOrg = await db.query.organizations.findFirst({
      where: (orgs, { eq }) => eq(orgs.slug, 'demo-school')
    });

    if (!existingOrg) {
      // Create default organization for demo
      const [newOrg] = await db.insert(schema.organizations).values({
        name: 'Demo Vocational School',
        slug: 'demo-school',
        inviteCode: 'DEMO2024',
        domain: 'demo.edu',
        settings: {
          timezone: 'America/New_York',
          schoolYear: '2024-2025'
        }
      }).returning();

      DEFAULT_ORG_ID = newOrg.id;

      // Create default user
      const [newUser] = await db.insert(schema.users).values({
        email: 'demo@demo.edu',
        name: 'Demo Teacher',
        role: 'teacher',
        organizationId: newOrg.id,
        emailVerified: new Date()
      }).returning();

      DEFAULT_USER_ID = newUser.id;

      // Add demo cohorts and students
      const [cohort1] = await db.insert(schema.cohorts).values({
        name: 'Morning Cohort A',
        description: 'Morning vocational training group',
        color: '#3B82F6',
        teacherName: 'Ms. Johnson',
        academicYear: '2024-2025',
        organizationId: newOrg.id,
        createdBy: newUser.id,
      }).returning();

      const [cohort2] = await db.insert(schema.cohorts).values({
        name: 'Afternoon Cohort B',
        description: 'Afternoon vocational training group',
        color: '#10B981',
        teacherName: 'Mr. Smith',
        academicYear: '2024-2025',
        organizationId: newOrg.id,
        createdBy: newUser.id,
      }).returning();

      // Add demo students
      await db.insert(schema.students).values([
        {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@demo.edu',
          studentId: 'ST001',
          grade: '9th',
          cohortId: cohort1.id,
          notes: 'Excellent progress in hands-on activities',
          emergencyContact: 'Jane Smith (Mother) - 555-0123',
          accommodations: ['Extended time', 'Preferential seating'],
          organizationId: newOrg.id,
          createdBy: newUser.id,
        },
        {
          firstName: 'Emma',
          lastName: 'Johnson',
          email: 'emma.johnson@demo.edu',
          studentId: 'ST002',
          grade: '10th',
          cohortId: cohort1.id,
          notes: 'Shows strong leadership skills',
          emergencyContact: 'Robert Johnson (Father) - 555-0456',
          accommodations: ['Verbal instructions'],
          organizationId: newOrg.id,
          createdBy: newUser.id,
        },
        {
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@demo.edu',
          studentId: 'ST003',
          grade: '11th',
          cohortId: cohort2.id,
          notes: 'Enjoys working with technology',
          emergencyContact: 'Lisa Brown (Mother) - 555-0789',
          accommodations: ['Small group instruction', 'Social stories'],
          organizationId: newOrg.id,
          createdBy: newUser.id,
        },
        {
          firstName: 'Sophia',
          lastName: 'Davis',
          email: 'sophia.davis@demo.edu',
          studentId: 'ST004',
          grade: '12th',
          cohortId: cohort2.id,
          notes: 'Ready for independent work placement',
          emergencyContact: 'Mark Davis (Father) - 555-0012',
          accommodations: ['Job coach support'],
          organizationId: newOrg.id,
          createdBy: newUser.id,
        }
      ]);

      console.log('Database initialized with demo data');
    } else {
      DEFAULT_ORG_ID = existingOrg.id;
      
      // Get the default user
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.organizationId, existingOrg.id)
      });
      
      if (existingUser) {
        DEFAULT_USER_ID = existingUser.id;
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}
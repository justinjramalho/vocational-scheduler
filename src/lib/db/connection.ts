import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// Create the database connection
export const db = drizzle(sql, { schema });

// For development, we'll create a default organization
export const DEFAULT_ORG_ID = 'default-org-id';
export const DEFAULT_USER_ID = 'default-user-id';

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
      await db.insert(schema.organizations).values({
        id: DEFAULT_ORG_ID,
        name: 'Demo Vocational School',
        slug: 'demo-school',
        inviteCode: 'DEMO2024',
        domain: 'demo.edu',
        settings: {
          timezone: 'America/New_York',
          schoolYear: '2024-2025'
        }
      });

      // Create default user
      await db.insert(schema.users).values({
        id: DEFAULT_USER_ID,
        email: 'demo@demo.edu',
        name: 'Demo Teacher',
        role: 'teacher',
        organizationId: DEFAULT_ORG_ID,
        emailVerified: new Date()
      });

      console.log('Database initialized with demo data');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}
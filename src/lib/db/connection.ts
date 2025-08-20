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

      // Add demo classes/programs
      const [autoClass] = await db.insert(schema.classes).values({
        name: 'Automotive Technology',
        description: 'Comprehensive automotive repair and maintenance program',
        code: 'AUTO101',
        department: 'Transportation',
        credits: 3,
        duration: 'Full Year',
        color: '#3B82F6',
        academicYear: '2024-2025',
        organizationId: newOrg.id,
        createdBy: newUser.id,
      }).returning();

      const [culinaryClass] = await db.insert(schema.classes).values({
        name: 'Culinary Arts',
        description: 'Professional cooking and food service management',
        code: 'CULI101',
        department: 'Hospitality',
        credits: 4,
        duration: 'Full Year',
        color: '#10B981',
        academicYear: '2024-2025',
        organizationId: newOrg.id,
        createdBy: newUser.id,
      }).returning();

      // Add demo cohorts/sections for each class
      const [autoMorning] = await db.insert(schema.cohorts).values({
        name: 'Period 1',
        description: 'Morning automotive section',
        classId: autoClass.id,
        teacherName: 'Ms. Johnson',
        room: 'Auto Shop A',
        schedule: 'Mon/Wed/Fri 8:00-10:30',
        maxStudents: 15,
        academicYear: '2024-2025',
        organizationId: newOrg.id,
        createdBy: newUser.id,
      }).returning();

      const [culinaryAfternoon] = await db.insert(schema.cohorts).values({
        name: 'Period 5',
        description: 'Afternoon culinary section',
        classId: culinaryClass.id,
        teacherName: 'Mr. Smith',
        room: 'Kitchen Lab',
        schedule: 'Tue/Thu 1:00-3:30',
        maxStudents: 12,
        academicYear: '2024-2025',
        organizationId: newOrg.id,
        createdBy: newUser.id,
      }).returning();

      // Add demo students
      const students = await db.insert(schema.students).values([
        {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@demo.edu',
          studentId: 'ST001',
          grade: '9th',
          classId: autoClass.id,
          cohortId: autoMorning.id,
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
          classId: autoClass.id,
          cohortId: autoMorning.id,
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
          classId: culinaryClass.id,
          cohortId: culinaryAfternoon.id,
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
          classId: culinaryClass.id,
          cohortId: culinaryAfternoon.id,
          notes: 'Ready for independent work placement',
          emergencyContact: 'Mark Davis (Father) - 555-0012',
          accommodations: ['Job coach support'],
          organizationId: newOrg.id,
          createdBy: newUser.id,
        }
      ]).returning();

      // Add sample assignments for today and tomorrow
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Sample assignments for today
      const todayAssignments = [
        {
          studentId: students[0].id, // John Smith
          eventType: 'Academic',
          eventTitle: 'Math Review Session',
          location: 'Room 101',
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
          duration: 60,
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
          responsibleParty: 'Ms. Johnson',
          pointOfContact: 'Math Department',
          organizationId: newOrg.id,
          createdBy: newUser.id,
        },
        {
          studentId: students[0].id, // John Smith
          eventType: 'Vocational',
          eventTitle: 'Automotive Shop Practice',
          location: 'Auto Shop A',
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
          duration: 120,
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
          responsibleParty: 'Mr. Rodriguez',
          pointOfContact: 'Auto Shop Supervisor',
          organizationId: newOrg.id,
          createdBy: newUser.id,
        },
        {
          studentId: students[1].id, // Emma Johnson
          eventType: 'Therapy',
          eventTitle: 'Speech Therapy Session',
          location: 'Therapy Room B',
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
          duration: 45,
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 15),
          responsibleParty: 'Dr. Williams',
          pointOfContact: 'Speech Therapist',
          organizationId: newOrg.id,
          createdBy: newUser.id,
        },
        {
          studentId: students[2].id, // Michael Brown
          eventType: 'Vocational',
          eventTitle: 'Culinary Arts - Baking',
          location: 'Kitchen Lab',
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
          duration: 90,
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30),
          responsibleParty: 'Chef Martinez',
          pointOfContact: 'Culinary Instructor',
          organizationId: newOrg.id,
          createdBy: newUser.id,
        },
        {
          studentId: students[3].id, // Sophia Davis
          eventType: 'Extra-curricular',
          eventTitle: 'Job Interview Practice',
          location: 'Conference Room',
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
          duration: 60,
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
          responsibleParty: 'Career Counselor',
          pointOfContact: 'Ms. Thompson',
          organizationId: newOrg.id,
          createdBy: newUser.id,
        }
      ];

      await db.insert(schema.assignments).values(todayAssignments);

      console.log('Database initialized with demo data and sample assignments');
    } else {
      DEFAULT_ORG_ID = existingOrg.id;
      
      // Get the default user
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.organizationId, existingOrg.id)
      });
      
      if (existingUser) {
        DEFAULT_USER_ID = existingUser.id;
      }

      // Check if demo data already exists, if not create it
      const existingCohorts = await db.query.cohorts.findMany({
        where: (cohorts, { eq }) => eq(cohorts.organizationId, existingOrg.id)
      });

      if (existingCohorts.length === 0 && existingUser) {
        console.log('Creating demo classes, cohorts and students for existing organization...');
        
        // Add demo classes/programs
        const [autoClass] = await db.insert(schema.classes).values({
          name: 'Automotive Technology',
          description: 'Comprehensive automotive repair and maintenance program',
          code: 'AUTO101',
          department: 'Transportation',
          credits: 3,
          duration: 'Full Year',
          color: '#3B82F6',
          academicYear: '2024-2025',
          organizationId: existingOrg.id,
          createdBy: existingUser.id,
        }).returning();

        const [culinaryClass] = await db.insert(schema.classes).values({
          name: 'Culinary Arts',
          description: 'Professional cooking and food service management',
          code: 'CULI101',
          department: 'Hospitality',
          credits: 4,
          duration: 'Full Year',
          color: '#10B981',
          academicYear: '2024-2025',
          organizationId: existingOrg.id,
          createdBy: existingUser.id,
        }).returning();

        // Add demo cohorts/sections for each class
        const [autoMorning] = await db.insert(schema.cohorts).values({
          name: 'Period 1',
          description: 'Morning automotive section',
          classId: autoClass.id,
          teacherName: 'Ms. Johnson',
          room: 'Auto Shop A',
          schedule: 'Mon/Wed/Fri 8:00-10:30',
          maxStudents: 15,
          academicYear: '2024-2025',
          organizationId: existingOrg.id,
          createdBy: existingUser.id,
        }).returning();

        const [culinaryAfternoon] = await db.insert(schema.cohorts).values({
          name: 'Period 5',
          description: 'Afternoon culinary section',
          classId: culinaryClass.id,
          teacherName: 'Mr. Smith',
          room: 'Kitchen Lab',
          schedule: 'Tue/Thu 1:00-3:30',
          maxStudents: 12,
          academicYear: '2024-2025',
          organizationId: existingOrg.id,
          createdBy: existingUser.id,
        }).returning();

        // Add demo students
        const existingStudents = await db.insert(schema.students).values([
          {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@demo.edu',
            studentId: 'ST001',
            grade: '9th',
            classId: autoClass.id,
            cohortId: autoMorning.id,
            notes: 'Excellent progress in hands-on activities',
            emergencyContact: 'Jane Smith (Mother) - 555-0123',
            accommodations: ['Extended time', 'Preferential seating'],
            organizationId: existingOrg.id,
            createdBy: existingUser.id,
          },
          {
            firstName: 'Emma',
            lastName: 'Johnson',
            email: 'emma.johnson@demo.edu',
            studentId: 'ST002',
            grade: '10th',
            classId: autoClass.id,
            cohortId: autoMorning.id,
            notes: 'Shows strong leadership skills',
            emergencyContact: 'Robert Johnson (Father) - 555-0456',
            accommodations: ['Verbal instructions'],
            organizationId: existingOrg.id,
            createdBy: existingUser.id,
          },
          {
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@demo.edu',
            studentId: 'ST003',
            grade: '11th',
            classId: culinaryClass.id,
            cohortId: culinaryAfternoon.id,
            notes: 'Enjoys working with technology',
            emergencyContact: 'Lisa Brown (Mother) - 555-0789',
            accommodations: ['Small group instruction', 'Social stories'],
            organizationId: existingOrg.id,
            createdBy: existingUser.id,
          },
          {
            firstName: 'Sophia',
            lastName: 'Davis',
            email: 'sophia.davis@demo.edu',
            studentId: 'ST004',
            grade: '12th',
            classId: culinaryClass.id,
            cohortId: culinaryAfternoon.id,
            notes: 'Ready for independent work placement',
            emergencyContact: 'Mark Davis (Father) - 555-0012',
            accommodations: ['Job coach support'],
            organizationId: existingOrg.id,
            createdBy: existingUser.id,
          }
        ]).returning();

        // Add sample assignments for existing organization
        const today = new Date();
        const existingAssignments = [
          {
            studentId: existingStudents[0].id, // John Smith
            eventType: 'Academic',
            eventTitle: 'Math Review Session',
            location: 'Room 101',
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
            duration: 60,
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
            responsibleParty: 'Ms. Johnson',
            pointOfContact: 'Math Department',
            organizationId: existingOrg.id,
            createdBy: existingUser.id,
          },
          {
            studentId: existingStudents[1].id, // Emma Johnson
            eventType: 'Therapy',
            eventTitle: 'Speech Therapy Session',
            location: 'Therapy Room B',
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
            duration: 45,
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 15),
            responsibleParty: 'Dr. Williams',
            pointOfContact: 'Speech Therapist',
            organizationId: existingOrg.id,
            createdBy: existingUser.id,
          }
        ];

        await db.insert(schema.assignments).values(existingAssignments);

        console.log('Demo classes, cohorts, students and assignments created for existing organization');
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}
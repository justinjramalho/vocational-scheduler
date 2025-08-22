// sql import removed - not used in this file
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  integer,
  jsonb,
  index
} from 'drizzle-orm/pg-core';

// Organizations/Schools table for multi-tenancy
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(), // e.g., 'mount-olive-high'
  inviteCode: varchar('invite_code', { length: 20 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }), // e.g., 'school.edu'
  settings: jsonb('settings').default('{}'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('org_slug_idx').on(table.slug),
  inviteCodeIdx: index('org_invite_code_idx').on(table.inviteCode),
}));

// Users table for future authentication
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }), // for future password auth
  role: varchar('role', { length: 50 }).default('teacher').notNull(), // teacher, admin, staff
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  emailVerified: timestamp('email_verified'),
  active: boolean('active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('user_email_idx').on(table.email),
  orgIdx: index('user_org_idx').on(table.organizationId),
}));

// Programs (vocational training programs within organizations)
export const programs = pgTable('programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('program_org_idx').on(table.organizationId),
  nameIdx: index('program_name_idx').on(table.name),
}));

// Classes/Programs (e.g., "Automotive Technology", "Culinary Arts")
export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // e.g., "Automotive Technology"
  description: text('description'),
  code: varchar('code', { length: 20 }), // e.g., "AUTO101"
  department: varchar('department', { length: 100 }), // e.g., "Transportation"
  credits: integer('credits'), // credit hours
  duration: varchar('duration', { length: 50 }), // e.g., "1 semester", "Full year"
  color: varchar('color', { length: 7 }).default('#3B82F6'), // hex color for UI
  academicYear: varchar('academic_year', { length: 20 }),
  eventType: varchar('event_type', { length: 50 }), // Academic, Elective (for class assignments)
  programId: uuid('program_id').references(() => programs.id), // scoped to program for uniqueness
  // assignmentId: uuid('assignment_id'), // TEMPORARILY COMMENTED OUT FOR TESTING
  location: varchar('location', { length: 255 }), // default location for this class
  defaultDuration: integer('default_duration'), // default duration in minutes
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('class_org_idx').on(table.organizationId),
  codeIdx: index('class_code_idx').on(table.code),
  programIdx: index('class_program_idx').on(table.programId),
  // assignmentIdx: index('class_assignment_idx').on(table.assignmentId), // TEMPORARILY COMMENTED OUT
}));

// Student Cohorts/Groups (tied to Programs, not Classes)
export const cohorts = pgTable('cohorts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // e.g., "Cohort A", "Cohort B"
  description: text('description'),
  programId: uuid('program_id').references(() => programs.id).notNull(), // belongs to a program
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('cohort_org_idx').on(table.organizationId),
  programIdx: index('cohort_program_idx').on(table.programId),
}));

// Students
export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  studentId: varchar('student_id', { length: 50 }), // school ID
  grade: varchar('grade', { length: 50 }),
  program: varchar('program', { length: 200 }), // student's program
  // classId: uuid('class_id').references(() => classes.id), // TEMPORARILY COMMENTED OUT FOR TESTING
  cohortId: uuid('cohort_id').references(() => cohorts.id), // section within the class
  notes: text('notes'),
  emergencyContact: varchar('emergency_contact', { length: 500 }),
  accommodations: jsonb('accommodations').default('[]'), // array of strings
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('student_org_idx').on(table.organizationId),
  // classIdx: index('student_class_idx').on(table.classId), // TEMPORARILY COMMENTED OUT
  cohortIdx: index('student_cohort_idx').on(table.cohortId),
  nameIdx: index('student_name_idx').on(table.lastName, table.firstName),
}));

// Assignments/Events - MINIMAL VERSION FOR INCREMENTAL TESTING
export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').references(() => students.id).notNull(),
  classId: uuid('class_id').references(() => classes.id), // ONE-WAY RELATIONSHIP - nullable
  eventType: varchar('event_type', { length: 50 }).notNull(),
  eventTitle: varchar('event_title', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  duration: integer('duration').notNull(), // in minutes
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  recurrence: varchar('recurrence', { length: 20 }).default('None').notNull(),
  recurrenceEndDate: timestamp('recurrence_end_date', { withTimezone: true }),
  notes: text('notes'),
  responsibleParty: varchar('responsible_party', { length: 255 }).notNull(),
  pointOfContact: varchar('point_of_contact', { length: 255 }),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(), // RESTORED FOREIGN KEY
  // Batch import/export metadata (preparation for future bulk operations)
  importBatchId: uuid('import_batch_id'), // Groups assignments from same import operation
  importTimestamp: timestamp('import_timestamp', { withTimezone: true }), // When imported
  importSource: varchar('import_source', { length: 50 }), // 'csv', 'google_sheets', 'google_classroom', 'manual'
  importUserId: uuid('import_user_id').references(() => users.id), // Who performed the import
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  studentIdx: index('assignment_student_idx').on(table.studentId),
  classIdx: index('assignment_class_idx').on(table.classId),
  orgIdx: index('assignment_org_idx').on(table.organizationId),
  startTimeIdx: index('assignment_start_time_idx').on(table.startTime),
  // Bulk operations indexes (preparation for future import/export)
  duplicateCheckIdx: index('assignment_duplicate_check_idx').on(table.studentId, table.startTime, table.eventType), // For skip-duplicate logic
  batchIdx: index('assignment_batch_idx').on(table.importBatchId), // Group by import batch
  importSourceIdx: index('assignment_import_source_idx').on(table.importSource), // Filter by import source
}));

// OAuth integration tokens (preparation for Google Classroom sync)
export const oauthTokens = pgTable('oauth_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'google_classroom', 'google_sheets', etc.
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenType: varchar('token_type', { length: 20 }).default('Bearer').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  scope: text('scope'), // OAuth scopes granted
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userProviderIdx: index('oauth_user_provider_idx').on(table.userId, table.provider), // One token per user per provider
  orgIdx: index('oauth_org_idx').on(table.organizationId),
}));

// Session management for NextAuth.js
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sessionTokenIdx: index('session_token_idx').on(table.sessionToken),
  userIdx: index('session_user_idx').on(table.userId),
}));

// Account linking for OAuth providers (Google, etc.)
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // google, email
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: timestamp('expires_at'),
  tokenType: varchar('token_type', { length: 50 }),
  scope: text('scope'),
  idToken: text('id_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('account_user_idx').on(table.userId),
  providerIdx: index('account_provider_idx').on(table.provider, table.providerAccountId),
}));

// Audit log for tracking changes
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // student, assignment, etc.
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 20 }).notNull(), // create, update, delete
  changes: jsonb('changes'), // old vs new values
  userId: uuid('user_id').references(() => users.id),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('audit_entity_idx').on(table.entityType, table.entityId),
  orgIdx: index('audit_org_idx').on(table.organizationId),
  userIdx: index('audit_user_idx').on(table.userId),
}));

// Export types for TypeScript
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

export type Cohort = typeof cohorts.$inferSelect;
export type NewCohort = typeof cohorts.$inferInsert;

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;

export type OAuthToken = typeof oauthTokens.$inferSelect;
export type NewOAuthToken = typeof oauthTokens.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
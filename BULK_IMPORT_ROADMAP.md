# Bulk Import/Export Roadmap

## **Status: PREPARATION COMPLETE** 
Schema and types are ready for future bulk operations. **No endpoints implemented yet.**

---

## **Phase 1: CSV/Google Sheets Templates** 
*Implementation planned after auth setup*

### **Core CSV Template Fields**
```csv
studentId,eventType,eventTitle,startTime,duration,endTime,classId,location,responsibleParty,pointOfContact,notes
826ba13a-6021-4bc9-9370-8599c4e0f140,Academic,Math Fundamentals,2025-08-21T09:00:00Z,60,2025-08-21T10:00:00Z,10d24adc-bfaa-4a70-9001-9ca4ca0455f1,Room 101,Math Teacher,teacher@school.edu,Weekly math class
```

### **Template Requirements**
- **studentId**: Valid UUID (required) 
- **eventType**: Academic|Elective|Therapy|Vocational|Testing|Extra-curricular
- **startTime**: ISO 8601 UTC format (e.g., 2025-08-21T09:00:00Z)
- **duration**: 1-720 minutes
- **endTime**: ISO 8601 UTC format (must match startTime + duration)
- **classId**: Optional UUID for Academic/Elective events only
- **location**: Text (required)
- **responsibleParty**: Text (required)

### **Validation Strategy: FAIL-FAST**
- Validate ALL rows before importing ANY data
- Reject entire batch if ANY row has errors
- Log errors with line numbers: "Line 5: Invalid UUID for studentId"
- No partial imports allowed

---

## **Phase 2: Batch Import API** 
*Implementation planned after auth setup*

### **Endpoint Design**
```typescript
POST /api/assignments/import
Content-Type: multipart/form-data

Response: BulkImportResult {
  success: boolean;
  totalRows: number;
  validRows: number; 
  skippedDuplicates: number;
  errors: ImportValidationError[];
  batchId?: string;
}
```

### **Duplicate Detection Logic**
**Skip duplicates based on**: `studentId + startTime + eventType`
- Default behavior: Skip existing, continue with new
- Future: Add admin override options (overwrite/create new)

### **Bulk Insert Performance**
- Use prepared statements with batch inserts
- Transaction rollback on validation failures
- Leverage duplicate check index: `(studentId, startTime, eventType)`

---

## **Phase 3: Google Classroom Integration**
*Implementation planned after auth setup and naming finalization*

### **OAuth 2.0 Setup**
- Store tokens in `oauth_tokens` table
- Support for ongoing sync (refresh tokens)
- Scope: `https://www.googleapis.com/auth/classroom.rosters.readonly`

### **Student Roster Sync Only**
- **Focus**: Sync student userIDs to our studentId field
- **No course mapping**: Do not map Google course IDs to our classId
- **No class linkage**: Wait until auth and naming are solid

### **Sync Strategy**
```typescript
POST /api/google-classroom/sync-students
Authorization: Bearer <oauth_token>

Response: {
  studentsAdded: number;
  studentsUpdated: number;
  studentsSkipped: number;
  batchId: string;
}
```

---

## **Phase 4: Export Functionality**
*Implementation planned after import is stable*

### **Export Endpoints**
```typescript
GET /api/assignments/export?format=csv&studentId=xxx&startDate=xxx&endDate=xxx
GET /api/assignments/export?format=xlsx&cohortId=xxx&startDate=xxx&endDate=xxx
```

### **Export Filters**
- Date ranges (startDate/endDate)
- Individual students (studentId) 
- Cohorts (cohortId)
- Event types (eventType)
- Import sources (importSource)

---

## **Database Schema Status**

### **✅ COMPLETED**
```sql
-- Assignments table enhanced with batch metadata
ALTER TABLE assignments ADD COLUMN import_batch_id UUID;
ALTER TABLE assignments ADD COLUMN import_timestamp TIMESTAMP WITH TIME ZONE;
ALTER TABLE assignments ADD COLUMN import_source VARCHAR(50); -- 'csv', 'google_sheets', 'google_classroom', 'manual'
ALTER TABLE assignments ADD COLUMN import_user_id UUID REFERENCES users(id);

-- Performance indexes for bulk operations
CREATE INDEX assignment_duplicate_check_idx ON assignments (student_id, start_time, event_type);
CREATE INDEX assignment_batch_idx ON assignments (import_batch_id);
CREATE INDEX assignment_import_source_idx ON assignments (import_source);

-- OAuth tokens table for Google Classroom
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  provider VARCHAR(50) NOT NULL, -- 'google_classroom', 'google_sheets'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(20) DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **✅ TypeScript Types**
- `BulkImportResult` interface
- `ImportValidationError` interface  
- `CSVTemplate` interface
- `OAuthToken` interface
- Enhanced `AssignmentFormData` with import metadata

---

## **Next Steps**
1. **Complete auth setup** (required for import endpoints)
2. **Finalize naming conventions** (required for Google Classroom mapping)
3. **Implement CSV validation library** (papaparse + custom validation)
4. **Create batch import endpoint** with fail-fast validation
5. **Set up Google OAuth flow** for Classroom integration
6. **Build export functionality** for data management

---

## **Risk Mitigation**
- ✅ **Schema prepared** for bulk operations
- ✅ **Indexes optimized** for duplicate detection
- ✅ **Fail-fast validation** prevents partial imports
- ✅ **Transaction safety** via batch rollback
- ✅ **Audit trail** via import metadata tracking

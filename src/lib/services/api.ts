import { Student, Assignment, StudentCohort, AssignmentFormData, StudentFormData } from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app' 
  : 'http://localhost:3000';

// Students API
export const studentsApi = {
  async getAll(): Promise<Student[]> {
    const response = await fetch(`${API_BASE_URL}/api/students`);
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    return response.json();
  },

  async getById(id: string): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/api/students/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch student');
    }
    return response.json();
  },

  async create(data: StudentFormData): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create student');
    }
    
    return response.json();
  },

  async update(id: string, data: StudentFormData): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update student');
    }
    
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete student');
    }
  },
};

// Cohorts API
export const cohortsApi = {
  async getAll(): Promise<StudentCohort[]> {
    const response = await fetch(`${API_BASE_URL}/api/cohorts`);
    if (!response.ok) {
      throw new Error('Failed to fetch cohorts');
    }
    return response.json();
  },

  async create(data: Partial<StudentCohort>): Promise<StudentCohort> {
    const response = await fetch(`${API_BASE_URL}/api/cohorts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create cohort');
    }
    
    return response.json();
  },
};

// Assignments API
export const assignmentsApi = {
  async getAll(filters?: {
    studentId?: string;
    cohortId?: string;
    date?: string;
  }): Promise<Assignment[]> {
    const params = new URLSearchParams();
    
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.cohortId) params.append('cohortId', filters.cohortId);
    if (filters?.date) params.append('date', filters.date);

    const response = await fetch(`${API_BASE_URL}/api/assignments?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    
    const data = await response.json();
    // Convert date strings back to Date objects
    return data.map((assignment: Assignment & { startTime: string; endTime: string; recurrenceEndDate?: string; createdAt: string; updatedAt: string }) => ({
      ...assignment,
      startTime: new Date(assignment.startTime),
      endTime: new Date(assignment.endTime),
      recurrenceEndDate: assignment.recurrenceEndDate ? new Date(assignment.recurrenceEndDate) : null,
      createdAt: new Date(assignment.createdAt),
      updatedAt: new Date(assignment.updatedAt),
    }));
  },

  async create(data: AssignmentFormData): Promise<Assignment> {
    const response = await fetch(`${API_BASE_URL}/api/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create assignment');
    }
    
    const result = await response.json();
    // Convert date strings back to Date objects
    return {
      ...result,
      startTime: new Date(result.startTime),
      endTime: new Date(result.endTime),
      recurrenceEndDate: result.recurrenceEndDate ? new Date(result.recurrenceEndDate) : null,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  },
};

// Database initialization
export const initApi = {
  async initialize(): Promise<{ message: string; data: { organizations: number; users: number; cohorts: number; students: number; assignments: number } }> {
    const response = await fetch(`${API_BASE_URL}/api/init`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize database');
    }
    
    return response.json();
  },
};

// Helper function to determine API base URL on client side
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server side
    return API_BASE_URL;
  }
  
  // Client side - use current origin
  return window.location.origin;
}
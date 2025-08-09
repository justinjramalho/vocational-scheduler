import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/connection';

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
    
    return NextResponse.json({ 
      message: 'Database initialized successfully',
      data: {
        organizations: 1,
        users: 1,
        cohorts: 0,
        students: 0,
        assignments: 0
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

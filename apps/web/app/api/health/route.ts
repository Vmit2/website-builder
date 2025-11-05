import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

/**
 * GET /api/health
 * Simple health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const dbCheck = await checkDatabaseConnection();
    
    if (dbCheck.connected) {
      return NextResponse.json(
        {
          status: 'ok',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        error: dbCheck.error,
      },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}

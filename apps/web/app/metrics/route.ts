import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

/**
 * GET /metrics
 * Health check and metrics endpoint for monitoring tools
 * This endpoint is called directly at /metrics (not /api/metrics)
 */
export async function GET(request: NextRequest) {
  try {
    // Basic health check - don't fail if DB isn't ready yet
    let dbCheck;
    try {
      dbCheck = await checkDatabaseConnection();
    } catch (error: any) {
      dbCheck = {
        connected: false,
        error: error.message || 'Database check failed',
      };
    }
    
    const health = {
      status: dbCheck.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbCheck.connected,
        error: dbCheck.error || null,
      },
      uptime: Math.floor(process.uptime()),
    };

    // Return 200 for monitoring tools
    return NextResponse.json(health, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

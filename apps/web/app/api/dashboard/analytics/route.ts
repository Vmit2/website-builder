import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

/**
 * GET /api/dashboard/analytics - Get visitor analytics
 * Returns basic analytics data (would integrate with Plausible/Umami)
 */

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;
    const period = request.nextUrl.searchParams.get('period') || '7d';

    // TODO: Fetch real analytics from Plausible or Umami
    // For MVP, return mock data
    const mockAnalytics = {
      totalVisitors: 42,
      uniqueVisitors: 38,
      pageViews: 127,
      bounceRate: 32.5,
      avgSessionDuration: 245, // seconds
      topPages: [
        { path: '/', views: 85, uniqueVisitors: 32 },
        { path: '/about', views: 28, uniqueVisitors: 15 },
        { path: '/portfolio', views: 14, uniqueVisitors: 8 },
      ],
      referrers: [
        { source: 'Direct', visitors: 20 },
        { source: 'Google', visitors: 15 },
        { source: 'Instagram', visitors: 5 },
      ],
      period,
    };

    return NextResponse.json(
      {
        success: true,
        analytics: mockAnalytics,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

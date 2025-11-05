import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/**
 * Get all sites for admin dashboard
 * GET /api/admin/sites?status=pending&limit=10&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('sites')
      .select(
        `
        id,
        user_id,
        username,
        theme_slug,
        status,
        coming_soon,
        launch_time,
        created_at,
        users(email, full_name)
      `,
        { count: 'exact' }
      );

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Order and pagination
    const { data: sites, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching sites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sites.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        sites: sites || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          pages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get sites error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

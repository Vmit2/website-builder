import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

/**
 * GET /api/plans - Get all pricing plans
 */
export async function GET(request: NextRequest) {
  try {
    const { data: plans, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .order('price_cents', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch plans.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        plans: plans || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

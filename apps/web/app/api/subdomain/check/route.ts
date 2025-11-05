import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

/**
 * GET /api/subdomain/check?username=xxx
 * Check if a subdomain/username is available
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required.' },
        { status: 400 }
      );
    }

    // Check if username exists in sites table
    const { data: site, error } = await supabaseAdmin
      .from('sites')
      .select('username')
      .eq('username', username)
      .single();

    // If error and it's "not found" error, subdomain is available
    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        {
          success: true,
          available: true,
          username: username,
        },
        { status: 200 }
      );
    }

    // If site exists, subdomain is taken
    if (site) {
      return NextResponse.json(
        {
          success: true,
          available: false,
          username: username,
        },
        { status: 200 }
      );
    }

    // Unexpected error
    return NextResponse.json(
      { error: 'Failed to check subdomain availability.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Subdomain check error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

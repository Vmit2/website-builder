import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

/**
 * GET /api/content/load?themeName=minimal-creative&siteId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const themeName = searchParams.get('themeName');
    const siteId = searchParams.get('siteId');

    if (!themeName) {
      return NextResponse.json(
        { error: 'themeName is required.' },
        { status: 400 }
      );
    }

    // Try to get user content
    let query = supabaseAdmin
      .from('user_content')
      .select('*')
      .eq('user_id', user.id)
      .eq('theme_name', themeName);

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data: contentData, error } = await query.single();

    // If content exists, return it
    if (contentData && !error) {
      return NextResponse.json(
        {
          success: true,
          content: contentData.content_json || {},
          lastUpdated: contentData.last_updated,
        },
        { status: 200 }
      );
    }

    // If no content found, return empty object (will use default boilerplate)
    return NextResponse.json(
      {
        success: true,
        content: {},
        lastUpdated: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Load content error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

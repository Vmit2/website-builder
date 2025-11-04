import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * GET /api/dashboard/site - Get user's site data
 * PUT /api/dashboard/site - Update site content
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const userId = request.headers.get('x-user-id');
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // For now, get from query parameter (in production, use auth)
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const { data: site, error } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !site) {
      return NextResponse.json(
        { error: 'Site not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        site: {
          id: site.id,
          username: site.username,
          themeSlug: site.theme_slug,
          paletteId: site.palette_id,
          status: site.status,
          comingSoon: site.coming_soon,
          launchTime: site.launch_time,
          content: site.content,
          images: site.images,
          createdAt: site.created_at,
          updatedAt: site.updated_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get site error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Add authentication check
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { headline, bio, services, socialLinks } = body;

    // Get user's site first
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found.' },
        { status: 404 }
      );
    }

    // Update site content
    const { error: updateError } = await supabase
      .from('sites')
      .update({
        content: {
          headline: headline || '',
          bio: bio || '',
          services: services || [],
          socialLinks: socialLinks || [],
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', site.id);

    if (updateError) {
      console.error('Error updating site:', updateError);
      return NextResponse.json(
        { error: 'Failed to update site.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Site updated successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update site error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

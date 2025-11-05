import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

/**
 * POST /api/dashboard/theme - Update site theme and palette
 */

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { themeSlug, paletteId } = body;

    if (!themeSlug) {
      return NextResponse.json(
        { error: 'Theme slug is required.' },
        { status: 400 }
      );
    }

    // Verify theme exists
    const { data: theme, error: themeError } = await supabaseAdmin
      .from('themes')
      .select('id')
      .eq('slug', themeSlug)
      .single();

    if (themeError || !theme) {
      return NextResponse.json(
        { error: 'Theme not found.' },
        { status: 404 }
      );
    }

    // Update user's site
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    // Verify user owns the site (unless admin)
    if (site && site.user_id !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found.' },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('sites')
      .update({
        theme_slug: themeSlug,
        palette_id: paletteId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', site.id);

    if (updateError) {
      console.error('Error updating theme:', updateError);
      return NextResponse.json(
        { error: 'Failed to update theme.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Theme updated successfully.',
        theme: {
          slug: themeSlug,
          paletteId: paletteId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

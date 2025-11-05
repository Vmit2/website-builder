import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

/**
 * GET /api/dashboard/settings - Get user's site design settings
 * POST /api/dashboard/settings - Save user's site design settings
 */

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const siteId = request.nextUrl.searchParams.get('siteId');
    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    // Get user's site settings
    const { data: settings, error } = await supabaseAdmin
      .from('user_site_settings')
      .select('*')
      .eq('site_id', siteId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for new sites
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Return defaults if no settings found
    const defaultSettings = {
      font_family: 'Poppins',
      color_palette: {},
      logo_url: null,
      seo_title: '',
      seo_description: '',
      seo_keywords: [],
    };

    return NextResponse.json({
      success: true,
      settings: settings || defaultSettings,
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siteId, fontFamily, colorPalette, logoUrl, seoTitle, seoDescription, seoKeywords } = body;

    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    // Verify user owns the site
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('id, user_id')
      .eq('id', siteId)
      .single();

    if (siteError || !site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (site.user_id !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Upsert settings (insert or update)
    const settingsData: any = {
      user_id: user.id,
      site_id: siteId,
      updated_at: new Date().toISOString(),
    };

    if (fontFamily !== undefined) settingsData.font_family = fontFamily;
    if (colorPalette !== undefined) settingsData.color_palette = colorPalette;
    if (logoUrl !== undefined) settingsData.logo_url = logoUrl;
    if (seoTitle !== undefined) settingsData.seo_title = seoTitle;
    if (seoDescription !== undefined) settingsData.seo_description = seoDescription;
    if (seoKeywords !== undefined) settingsData.seo_keywords = seoKeywords;

    const { data: settings, error: upsertError } = await supabaseAdmin
      .from('user_site_settings')
      .upsert(settingsData, {
        onConflict: 'site_id',
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error saving settings:', upsertError);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      settings,
    });
  } catch (error) {
    console.error('Error in POST /api/dashboard/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

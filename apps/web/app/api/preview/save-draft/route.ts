import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { themeId, draftContent } = body;

    if (!themeId || !draftContent) {
      return NextResponse.json(
        { success: false, error: 'Missing themeId or draftContent' },
        { status: 400 }
      );
    }

    // Get userId from localStorage token or session
    // For now, get it from the request body (client should send it)
    // TODO: Implement proper session-based auth
    const userId = body.userId || request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated. Please login.' },
        { status: 401 }
      );
    }

    // Get user's site
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { success: false, error: 'Site not found' },
        { status: 404 }
      );
    }

    // Update site with draft content
    const { error: updateError } = await supabaseAdmin
      .from('sites')
      .update({
        draft_content_json: draftContent,
        theme_slug: themeId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', site.id);

    if (updateError) {
      console.error('Error saving draft:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully',
    });
  } catch (error: any) {
    console.error('Error in save-draft endpoint:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

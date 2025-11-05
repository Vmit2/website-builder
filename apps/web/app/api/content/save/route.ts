import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

/**
 * POST /api/content/save - Save user content
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siteId, themeName, contentJson } = body;

    if (!themeName || !contentJson) {
      return NextResponse.json(
        { error: 'themeName and contentJson are required.' },
        { status: 400 }
      );
    }

    // Get user's site if siteId not provided
    let finalSiteId = siteId;
    if (!finalSiteId) {
      const { data: site } = await supabaseAdmin
        .from('sites')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (site) {
        finalSiteId = site.id;
      }
    }

    // Upsert content (insert or update)
    const { data, error } = await supabaseAdmin
      .from('user_content')
      .upsert(
        {
          user_id: user.id,
          site_id: finalSiteId || null,
          theme_name: themeName,
          content_json: contentJson,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,site_id,theme_name',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving content:', error);
      return NextResponse.json(
        { error: 'Failed to save content.' },
        { status: 500 }
      );
    }

    // Also update the sites.content field for backward compatibility
    if (finalSiteId) {
      await supabaseAdmin
        .from('sites')
        .update({ content: contentJson, updated_at: new Date().toISOString() })
        .eq('id', finalSiteId);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Content saved successfully.',
        content: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save content error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

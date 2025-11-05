import { NextRequest, NextResponse } from 'next/server';
import { getThemes } from '@/lib/db';

/**
 * Get all available themes
 * GET /api/themes
 */
export async function GET(request: NextRequest) {
  try {
    const themes = await getThemes();

    if (!themes || themes.length === 0) {
      return NextResponse.json(
        { error: 'No themes found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        themes: themes.map((theme) => ({
          id: theme.id,
          slug: theme.slug,
          name: theme.name,
          description: theme.description,
          demoUrl: theme.demo_url,
          previewImageUrl: theme.preview_image_url,
          comingSoon: theme.coming_soon || false,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get themes error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

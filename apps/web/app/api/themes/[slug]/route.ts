import { NextRequest, NextResponse } from 'next/server';
import { getThemeBySlug } from '@/lib/db';

/**
 * GET /api/themes/[slug]
 * Get a specific theme by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Theme slug is required.' },
        { status: 400 }
      );
    }

    const theme = await getThemeBySlug(slug);

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        theme: {
          id: theme.id,
          slug: theme.slug,
          name: theme.name,
          description: theme.description,
          demoUrl: theme.demo_url,
          previewImageUrl: theme.preview_image_url,
          comingSoon: theme.coming_soon || false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

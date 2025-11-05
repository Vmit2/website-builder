import { NextRequest, NextResponse } from 'next/server';
import { getImageLibraryByTheme } from '@/lib/db';
import { supabase } from '@/lib/db';

/**
 * GET /api/images/library
 * Get image library, optionally filtered by theme and category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const themeId = searchParams.get('themeId');
    const category = searchParams.get('category');

    let query = supabase
      .from('image_library')
      .select('*')
      .order('category', { ascending: true })
      .order('created_at', { ascending: false });

    // Filter by theme if provided
    if (themeId) {
      const themeIdNum = parseInt(themeId, 10);
      if (isNaN(themeIdNum)) {
        return NextResponse.json(
          { error: 'Invalid theme ID.' },
          { status: 400 }
        );
      }
      query = query.eq('theme_id', themeIdNum);
    }

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data: images, error } = await query;

    if (error) {
      console.error('Error fetching image library:', error);
      return NextResponse.json(
        { error: 'Failed to fetch image library.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        images: (images || []).map((img) => ({
          id: img.id,
          themeId: img.theme_id,
          url: img.url,
          altText: img.alt_text,
          category: img.category,
          createdAt: img.created_at,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get image library error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

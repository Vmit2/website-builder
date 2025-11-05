import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

/**
 * GET /api/faqs - Get all FAQs
 */
export async function GET(request: NextRequest) {
  try {
    const { data: faqs, error } = await supabaseAdmin
      .from('faqs')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs:', error);
      
      // Check for table not found error
      if (error.code === 'PGRST205' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'FAQs table not found. Please run the migration to create it.',
            details: 'Run docs/migrations/create_faqs_table.sql in Supabase SQL Editor',
            faqs: [] // Return empty array as fallback
          },
          { status: 200 } // Return 200 with empty array so frontend doesn't break
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch FAQs.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        faqs: faqs || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get FAQs error:', error);
    
    // If table doesn't exist, return empty array instead of error
    if (error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
      return NextResponse.json(
        { 
          success: true,
          faqs: [],
          warning: 'FAQs table not found. Run docs/migrations/create_faqs_table.sql in Supabase SQL Editor'
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error.', details: error?.message },
      { status: 500 }
    );
  }
}

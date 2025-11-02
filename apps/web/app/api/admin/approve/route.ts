import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { createAuditLog } from '@/lib/db';

/**
 * Admin approval endpoint
 * POST /api/admin/approve
 * Body: { siteId: string, adminId: string, comment?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const adminId = request.headers.get('x-admin-id');
    // if (!adminId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { siteId, adminId, comment } = body;

    if (!siteId || !adminId) {
      return NextResponse.json(
        { error: 'Site ID and Admin ID are required.' },
        { status: 400 }
      );
    }

    // Get site details
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found.' },
        { status: 404 }
      );
    }

    // Update site status
    const { error: updateError } = await supabaseAdmin
      .from('sites')
      .update({
        status: 'approved',
        coming_soon: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Error updating site:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve site.' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog(
      adminId,
      'SITE_APPROVED',
      'sites',
      siteId,
      { comment }
    );

    // TODO: Send approval email to user via Resend
    // TODO: Trigger n8n workflow for optional static export

    return NextResponse.json(
      {
        success: true,
        message: 'Site approved successfully.',
        site: {
          id: site.id,
          username: site.username,
          status: 'approved',
          coming_soon: false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

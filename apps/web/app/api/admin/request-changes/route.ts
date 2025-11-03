import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { createAuditLog } from '@/lib/db';

/**
 * POST /api/admin/request-changes
 * Admin requests changes from user before approval
 */

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const body = await request.json();
    const { siteId, adminId, comment } = body;

    if (!siteId || !adminId) {
      return NextResponse.json(
        { error: 'Site ID and Admin ID are required.' },
        { status: 400 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment is required.' },
        { status: 400 }
      );
    }

    // Get site details
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('*, users(email, full_name)')
      .eq('id', siteId)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found.' },
        { status: 404 }
      );
    }

    // Update site status to 'pending' (if not already)
    const { error: updateError } = await supabaseAdmin
      .from('sites')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Error updating site:', updateError);
      return NextResponse.json(
        { error: 'Failed to request changes.' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog(
      adminId,
      'CHANGES_REQUESTED',
      'sites',
      siteId,
      { comment }
    );

    // TODO: Send email to user with change request
    // await sendEmail({
    //   to: site.users.email,
    //   subject: 'Changes Requested for Your Portfolio',
    //   template: 'request-changes',
    //   data: {
    //     userName: site.users.full_name,
    //     comment,
    //     siteUrl: `https://${site.username}.brand.com`
    //   }
    // });

    return NextResponse.json(
      {
        success: true,
        message: 'Change request sent to user.',
        site: {
          id: site.id,
          username: site.username,
          status: 'pending',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Request changes error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

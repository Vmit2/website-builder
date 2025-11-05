import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getTrialExpiryTime } from '@/lib/utils';
import { getUserFromRequest } from '@/lib/auth';

/**
 * GET /api/dashboard/site - Get user's site data
 * PUT /api/dashboard/site - Update site content
 */

export async function GET(request: NextRequest) {
  try {
    // Try to get authenticated user (optional for public site viewing via username)
    const user = await getUserFromRequest(request);
    const username = request.nextUrl.searchParams.get('username');
    
    // If username provided, allow viewing (for public sites)
    // Otherwise require authentication
    if (!username && !user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          details: 'Either provide a username query parameter (?username=xxx) or authenticate with a valid session token.'
        },
        { status: 401 }
      );
    }

    // Use admin client for reliable access
    let query = supabaseAdmin.from('sites').select('*');

    // Prioritize username since it's more direct and reliable
    if (username) {
      query = query.eq('username', username);
    } else if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data: site, error } = await query.single();
    
    // If authenticated, verify user owns the site (unless admin)
    if (user && site && site.user_id !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error) {
      console.error('Error fetching site:', error);
      console.error('Query params:', { userId: user?.id, username });
      
      // If single() fails with PGRST116, it means no rows found
      if (error.code === 'PGRST116') {
        // No site found - check if user exists and create site if they do
        let userToCheck = null;
        
        // Get user info to create site
        if (user?.id) {
          userToCheck = {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
          };
        } else if (username) {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, username, full_name')
            .eq('username', username)
            .single();
          userToCheck = user;
        }
        
        // If user exists but no site, create one automatically
        if (userToCheck) {
          const launchTime = getTrialExpiryTime();
          
          const { data: newSite, error: createError } = await supabaseAdmin
            .from('sites')
            .insert({
              user_id: userToCheck.id,
              username: userToCheck.username,
              theme_slug: 'minimal-creative', // Default theme
              status: 'pending',
              coming_soon: true,
              launch_time: launchTime.toISOString(),
              content: {
                headline: `Welcome to ${userToCheck.full_name || userToCheck.username}'s portfolio`,
                bio: 'Your portfolio is ready to be customized.',
              },
            })
            .select()
            .single();
          
          if (createError) {
            // If duplicate key error, site already exists - fetch it
            if (createError.code === '23505' || createError.message?.includes('duplicate key')) {
              console.log('Site already exists, fetching it...');
              const { data: existingSite } = await supabaseAdmin
                .from('sites')
                .select('*')
                .eq('username', userToCheck.username)
                .single();
              
              if (existingSite) {
                return NextResponse.json(
                  {
                    success: true,
                    site: {
                      id: existingSite.id,
                      username: existingSite.username,
                      themeSlug: existingSite.theme_slug,
                      paletteId: existingSite.palette_id,
                      status: existingSite.status,
                      comingSoon: existingSite.coming_soon,
                      launchTime: existingSite.launch_time,
                      content: existingSite.content,
                      images: existingSite.images,
                      createdAt: existingSite.created_at,
                      updatedAt: existingSite.updated_at,
                    },
                  },
                  { status: 200 }
                );
              }
            }
            
            console.error('Error creating site automatically:', createError);
            return NextResponse.json(
              { error: 'Site not found and could not be created.', details: createError?.message },
              { status: 500 }
            );
          }
          
          if (!newSite) {
            return NextResponse.json(
              { error: 'Site not found and could not be created.' },
              { status: 500 }
            );
          }
          
          // Return the newly created site
          return NextResponse.json(
            {
              success: true,
              site: {
                id: newSite.id,
                username: newSite.username,
                themeSlug: newSite.theme_slug,
                paletteId: newSite.palette_id,
                status: newSite.status,
                comingSoon: newSite.coming_soon,
                launchTime: newSite.launch_time,
                content: newSite.content,
                images: newSite.images,
                createdAt: newSite.created_at,
                updatedAt: newSite.updated_at,
              },
            },
            { status: 200 }
          );
        }
        
        // User doesn't exist either
        return NextResponse.json(
          { error: 'Site not found.', details: `No site found for userId: ${user?.id || 'N/A'}, username: ${username || 'N/A'}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch site.', details: error.message },
        { status: 500 }
      );
    }

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        site: {
          id: site.id,
          username: site.username,
          themeSlug: site.theme_slug,
          paletteId: site.palette_id,
          status: site.status,
          comingSoon: site.coming_soon,
          launchTime: site.launch_time,
          content: site.content,
          images: site.images,
          createdAt: site.created_at,
          updatedAt: site.updated_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get site error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require authentication for updates
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { headline, bio, services, socialLinks } = body;

    // Get user's site first
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

    // Update site content
    const { error: updateError } = await supabaseAdmin
      .from('sites')
      .update({
        content: {
          headline: headline || '',
          bio: bio || '',
          services: services || [],
          socialLinks: socialLinks || [],
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', site.id);

    if (updateError) {
      console.error('Error updating site:', updateError);
      return NextResponse.json(
        { error: 'Failed to update site.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Site updated successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update site error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

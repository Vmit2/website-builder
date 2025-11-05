import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import HomePage from '@/components/HomePage';
import SitePage from '@/components/SitePage';
import { supabaseAdmin } from '@/lib/db';

export default async function Home() {
  try {
    const headersList = await headers();
    const subdomain = headersList.get('x-subdomain');
    
    // Don't show header on subdomain routes (portfolio sites)
    // The header will be conditionally hidden via CSS or component logic

    // If subdomain exists, check site status and handle routing
    if (subdomain) {
    // Fetch site status from database
    const { data: site, error } = await supabaseAdmin
      .from('sites')
      .select('id, username, expires_at, status')
      .eq('username', subdomain)
      .single();

    // Site not found - redirect to subdomain availability page
    if (error || !site) {
      redirect(`/subdomain-availability?username=${subdomain}`);
    }

    const now = new Date();
    const status = site.status;
    const expiresAt = site.expires_at ? new Date(site.expires_at) : null;

    // Handle different status states according to new state machine

    // 1. Approved sites - always render
    if (status === 'approved') {
      return <SitePage subdomain={subdomain} />;
    }

    // 2. Deleted sites - redirect to deleted-site page
    if (status === 'deleted') {
      redirect(`/deleted-site?subdomain=${subdomain}`);
    }

    // 3. Expired status (marked by check-trials function)
    if (status === 'expired') {
      redirect(`/upgrade?from=${subdomain}`);
    }

    // 4. Pending or trial status - check expiry
    if (status === 'pending' || status === 'trial') {
      if (expiresAt && now > expiresAt) {
        // Trial expired but status not yet updated by check-trials
        // Redirect to trial-expired page
        redirect(`/trial-expired?subdomain=${subdomain}`);
      }

      // Active trial - render site
      return <SitePage subdomain={subdomain} />;
    }

    // 5. Rejected status - can still view but show warning
    if (status === 'rejected') {
      // For now, render site but could redirect to rejection page in future
      return <SitePage subdomain={subdomain} />;
    }

    // Default: render site
    return <SitePage subdomain={subdomain} />;
    }

    // No subdomain - render home page with pricing, features, FAQs, etc.
    return <HomePage />;
  } catch (error) {
    console.error('Error in Home page:', error);
    // Fallback to home page if there's an error
    return <HomePage />;
  }
}

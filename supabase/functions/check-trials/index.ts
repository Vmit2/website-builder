// Supabase Edge Function: check-trials
// Sends email reminders 3 hours before trial expiry and after expiry
// Run via Supabase Scheduler (cron: 0 * * * *) every hour
//
// Note: This code runs in Deno runtime (not Node.js)
// TypeScript errors about Deno imports can be ignored - they work in Supabase Edge Functions

// @ts-ignore - Deno runtime imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore - Deno runtime globals
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
// @ts-ignore - Deno runtime globals
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
// @ts-ignore - Deno runtime globals
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Solvexx <no-reply@at-solvexx.com>',
        to: data.to,
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

serve(async (req) => {
  try {
    // Validate environment variables
    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    let stats = {
      expiringRemindersSent: 0,
      expiredEmailsSent: 0,
      errors: [] as string[],
    };

    // 1️⃣ Find trials expiring within 3 hours
    const { data: expiringTrials, error: expiringError } = await supabase
      .from('sites')
      .select(`
        id,
        username,
        expires_at,
        user_id,
        status,
        reminder_sent,
        users!inner (
          email,
          full_name,
          username
        )
      `)
      .in('status', ['pending', 'trial'])
      .lte('expires_at', threeHoursLater.toISOString())
      .gte('expires_at', now.toISOString())
      .eq('reminder_sent', false)
      .not('expires_at', 'is', null);

    if (expiringError) {
      console.error('Error fetching expiring trials:', expiringError);
      stats.errors.push(`Error fetching expiring trials: ${expiringError.message}`);
    }

    // Send reminder emails for expiring trials
    if (expiringTrials && expiringTrials.length > 0) {
      for (const trial of expiringTrials) {
        try {
          const user = trial.users as any;
          const userEmail = user?.email;
          const userName = user?.full_name || user?.username || 'there';
          const siteUrl = `https://${trial.username}.at-solvexx.com`;

          if (!userEmail) {
            stats.errors.push(`No email found for trial ${trial.id}`);
            continue;
          }

          // Calculate remaining hours
          const expiryDate = new Date(trial.expires_at);
          const remainingMs = expiryDate.getTime() - now.getTime();
          const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));

          const emailHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Trial Expiring Soon!</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Hey ${userName} 👋,
                  </p>
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Your free trial site <strong>${trial.username}.at-solvexx.com</strong> will expire in <strong>${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}</strong>.
                  </p>
                  <p style="font-size: 16px; margin-bottom: 30px;">
                    Upgrade now to keep your site live and unlock advanced features like custom domains, unlimited images, and priority support.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://at-solvexx.com/upgrade?username=${trial.username}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Upgrade Now →
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <a href="${siteUrl}" style="color: #667eea; text-decoration: none;">View your site</a> | 
                    <a href="https://at-solvexx.com/dashboard" style="color: #667eea; text-decoration: none;">Go to Dashboard</a>
                  </p>
                  <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; text-align: center;">
                    Thanks,<br>The Solvexx Team 🚀
                  </p>
                </div>
              </body>
            </html>
          `;

          const emailSent = await sendEmail({
            to: userEmail,
            subject: `⚠️ Your free trial expires in ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}!`,
            html: emailHtml,
          });

          if (emailSent) {
            // Update reminder_sent flag
            await supabase
              .from('sites')
              .update({ reminder_sent: true })
              .eq('id', trial.id);

            stats.expiringRemindersSent++;
          } else {
            stats.errors.push(`Failed to send email for trial ${trial.id}`);
          }
        } catch (error) {
          console.error(`Error processing trial ${trial.id}:`, error);
          stats.errors.push(`Error processing trial ${trial.id}: ${error}`);
        }
      }
    }

    // 2️⃣ Handle expired trials (send expiry email)
    const { data: expiredTrials, error: expiredError } = await supabase
      .from('sites')
      .select(`
        id,
        username,
        expires_at,
        user_id,
        status,
        expired_email_sent,
        users!inner (
          email,
          full_name,
          username
        )
      `)
      .in('status', ['pending', 'trial'])
      .lt('expires_at', now.toISOString())
      .eq('expired_email_sent', false)
      .not('expires_at', 'is', null);

    if (expiredError) {
      console.error('Error fetching expired trials:', expiredError);
      stats.errors.push(`Error fetching expired trials: ${expiredError.message}`);
    }

    // Send expiry emails
    if (expiredTrials && expiredTrials.length > 0) {
      for (const trial of expiredTrials) {
        try {
          const user = trial.users as any;
          const userEmail = user?.email;
          const userName = user?.full_name || user?.username || 'there';

          if (!userEmail) {
            stats.errors.push(`No email found for expired trial ${trial.id}`);
            continue;
          }

          const emailHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">😔 Your Trial Has Expired</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Hi ${userName},
                  </p>
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Your free trial website <strong>${trial.username}.at-solvexx.com</strong> has now expired.
                  </p>
                  <p style="font-size: 16px; margin-bottom: 30px;">
                    Don't worry! Upgrade your plan within the next 24 hours to restore your site instantly and keep all your customizations.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://at-solvexx.com/upgrade?username=${trial.username}" 
                       style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Reactivate Site →
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <a href="https://at-solvexx.com/dashboard" style="color: #667eea; text-decoration: none;">Go to Dashboard</a>
                  </p>
                  <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; text-align: center;">
                    Thanks,<br>The Solvexx Team 🚀
                  </p>
                </div>
              </body>
            </html>
          `;

          const emailSent = await sendEmail({
            to: userEmail,
            subject: 'Your free trial has expired 😔',
            html: emailHtml,
          });

          if (emailSent) {
            // Update expired_email_sent flag and status
            await supabase
              .from('sites')
              .update({ 
                expired_email_sent: true,
                status: 'expired',
                updated_at: now.toISOString(),
              })
              .eq('id', trial.id);

            stats.expiredEmailsSent++;
          } else {
            stats.errors.push(`Failed to send expiry email for trial ${trial.id}`);
          }
        } catch (error) {
          console.error(`Error processing expired trial ${trial.id}:`, error);
          stats.errors.push(`Error processing expired trial ${trial.id}: ${error}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${stats.expiringRemindersSent} expiring reminders and ${stats.expiredEmailsSent} expired emails.`,
        stats,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email utility functions using Resend
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email via Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return false;
    }

    const { error } = await resend.emails.send({
      from: 'Solvexx <no-reply@at-solvexx.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send site approval email
 */
export async function sendApprovalEmail(
  email: string,
  userName: string,
  siteUrl: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">🎉 Your Portfolio Has Been Approved!</h2>
      <p style="color: #666; font-size: 16px;">Hi ${userName},</p>
      <p style="color: #666; font-size: 16px;">
        Great news! Your portfolio site has been reviewed and approved by our team.
      </p>
      <div style="margin: 30px 0;">
        <a href="${siteUrl}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Your Live Site
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Your portfolio is now live at <strong>${siteUrl}</strong>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Need help? Contact us at support@at-solvexx.com
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Your Portfolio Has Been Approved 🎉',
    html,
  });
}

/**
 * Send site rejection email
 */
export async function sendRejectionEmail(
  email: string,
  userName: string,
  reason: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Portfolio Review - Changes Needed</h2>
      <p style="color: #666; font-size: 16px;">Hi ${userName},</p>
      <p style="color: #666; font-size: 16px;">
        Thank you for submitting your portfolio. After review, we need a few changes before we can approve it.
      </p>
      <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Feedback:</h3>
        <p style="color: #666; margin-bottom: 0;">${reason}</p>
      </div>
      <p style="color: #666; font-size: 14px;">
        Please make the necessary changes and resubmit your portfolio. If you have any questions, feel free to reach out to us.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Questions? Contact us at support@at-solvexx.com
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Portfolio Review - Changes Needed',
    html,
  });
}

/**
 * Send change request email
 */
export async function sendChangeRequestEmail(
  email: string,
  userName: string,
  comment: string,
  siteUrl: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Portfolio Review - Updates Requested</h2>
      <p style="color: #666; font-size: 16px;">Hi ${userName},</p>
      <p style="color: #666; font-size: 16px;">
        Our team has reviewed your portfolio and would like to request a few updates.
      </p>
      <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Requested Changes:</h3>
        <p style="color: #666; margin-bottom: 0;">${comment}</p>
      </div>
      <div style="margin: 30px 0;">
        <a href="${siteUrl}/dashboard" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Update Your Portfolio
        </a>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Questions? Contact us at support@at-solvexx.com
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Portfolio Review - Updates Requested',
    html,
  });
}

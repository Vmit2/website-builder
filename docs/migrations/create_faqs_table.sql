-- Migration: Create FAQs table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs(order_index);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, order_index) VALUES
  ('What happens after my 24-hour free trial?', 'After your 24-hour free trial expires, your site will be temporarily deactivated. You can upgrade to any paid plan (Basic, Pro, or Premium) to reactivate and continue using your portfolio. Upgrade anytime within 48 hours to keep your content and settings.', 1),
  ('Can I use my own domain?', 'Yes! Pro and Premium plans include custom domain support. You can connect your own domain (e.g., yourname.com) to your portfolio. We''ll guide you through the simple setup process. Free trial users get a subdomain (username.at-solvexx.com).', 2),
  ('Is there a refund policy?', 'Yes, we offer a 14-day money-back guarantee on all paid plans. If you''re not satisfied with our service, contact our support team within 14 days of your purchase for a full refund, no questions asked.', 3),
  ('How can I upgrade my plan?', 'You can upgrade anytime from your dashboard. Simply go to the "Upgrade" section, select your desired plan, and complete the payment. Your new features will be activated immediately. You can also downgrade or cancel your subscription at any time.', 4),
  ('Do I need technical knowledge to create my portfolio?', 'Not at all! Our platform is designed for everyone, regardless of technical experience. Simply choose a theme, add your content, and publish. Our intuitive CMS editor makes it easy to customize your portfolio in minutes.', 5),
  ('What payment methods do you accept?', 'We accept all major credit cards, debit cards, UPI, and net banking through Razorpay. All payments are secure and encrypted. We support both one-time payments (Basic plan) and monthly/yearly subscriptions (Pro and Premium plans).', 6)
ON CONFLICT DO NOTHING;

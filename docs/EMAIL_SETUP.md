# Email Configuration Guide

## Overview

The Aspidus platform supports **two email providers** for sending system emails
(portal invitations, KYC notifications, offers, invoices, etc.):

1. **Resend** (recommended) — HTTP API, works on any hosting
2. **SMTP** — traditional, but blocked on Render free plan

Each tenant admin configures their own email settings in **Settings → Communications**.

## Why Resend is Recommended

| Issue | SMTP | Resend |
|-------|------|--------|
| Render free plan | ❌ Blocks ports 465/587 (timeout) | ✅ HTTP API, no port blocks |
| Setup complexity | Host + port + user + password | Just API key |
| Deliverability | Depends on your SMTP server | High (Resend manages reputation) |
| Free tier | Depends on provider | 100 emails/day, 3,000/month |
| Attachments | ✅ | ✅ |
| HTML emails | ✅ | ✅ |
| Tracking | ❌ | ✅ Opens, clicks, bounces |

## Setting Up Resend (5 minutes)

### Step 1: Create a Resend account
1. Go to https://resend.com
2. Sign up (free, no credit card required)
3. Verify your email

### Step 2: Get your API key
1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it "Aspidus CRM"
4. Select **Sending access** permission
5. Copy the key (starts with `re_...`)

### Step 3: Configure in Aspidus
1. Log in as admin at https://aspidus.onrender.com
2. Go to **Settings → Communications**
3. Select **Resend** provider (recommended)
4. Fill in:
   - **From name**: Your company name (e.g. "Aspidus")
   - **From email**: Your sending email
   - **Resend API key**: Paste the key from step 2
   - **Resend from email**: Use one of:
     - `onboarding@resend.dev` (for testing — Resend's shared domain)
     - `noreply@yourdomain.com` (for production — requires domain verification)
5. Click **Save**
6. In the **Test Email Configuration** section:
   - Enter your email address
   - Click **Send test email**
   - Check your inbox for the test message

### Step 4: Verify your domain (production only)
For production sending (not using `onboarding@resend.dev`):
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g. `aspidus.co`)
4. Add the DNS records Resend shows you:
   - SPF record (TXT)
   - DKIM record (TXT or CNAME)
   - DMARC record (TXT, optional but recommended)
5. Wait for verification (usually 5-30 minutes)
6. Once verified, use `noreply@yourdomain.com` as the from email

## Setting Up SMTP (alternative)

Only use SMTP if:
- You have a paid hosting plan that allows outbound SMTP
- You have an existing SMTP server (Gmail, SendGrid, Mailgun, etc.)

### Gmail SMTP
1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password (16 chars)
4. In Aspidus Settings → Communications:
   - Provider: SMTP
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: your Gmail address
   - Password: the App Password (NOT your account password)
   - From email: your Gmail address

### Other SMTP providers
| Provider | Host | Port |
|----------|------|------|
| SendGrid | smtp.sendgrid.net | 587 |
| Mailgun | smtp.mailgun.org | 587 |
| Amazon SES | email-smtp.[region].amazonaws.com | 587 |
| Outlook/Office365 | smtp.office365.com | 587 |
| Zoho | smtp.zoho.com | 587 |

## Testing Your Configuration

### From the UI
1. Settings → Communications
2. Scroll to **Test Email Configuration**
3. Enter a recipient email
4. Click **Send test email**
5. Result shows:
   - ✅ Success: message ID + provider used
   - ❌ Failure: error message + category-specific hint

### Common errors and solutions

| Error | Category | Solution |
|-------|----------|----------|
| Connection timeout | timeout | SMTP blocked — switch to Resend |
| Invalid API key | auth_failed | Check that you copied the full key |
| Domain not verified | domain_not_verified | Use `onboarding@resend.dev` for testing, or verify your domain |
| Rate limit exceeded | rate_limit | Resend free: 100/day. Wait or upgrade |
| Host unreachable | host_unreachable | Check SMTP host spelling |
| TLS/certificate | tls | Try port 587 with STARTTLS |

## Email Queue

If no provider is configured (or sending fails), emails are stored in the
**Mail Queue** table with status:
- `queued` — waiting for a provider to be configured
- `sent` — successfully delivered
- `failed` — error occurred (see error field)

View the queue in **Mail Queue** module. Failed emails can be retried.

## What Triggers Emails

| Event | Email sent | Template |
|-------|-----------|----------|
| Admin activates portal | Welcome email | tpl-welcome |
| Admin sends invite | Welcome email | tpl-welcome |
| KYC approved | KYC Approved | tpl-kyc |
| KYC rejected | KYC Rejected (with reason) | tpl-kyc |
| KYC resubmit requested | KYC Update Required | tpl-kyc |
| Offer sent to partner | Offer Notification | tpl-offer |
| Invoice sent to partner | Invoice Notification | tpl-invoice |
| Invoice due soon | Payment Reminder | tpl-reminder |
| Invoice overdue | Payment Reminder | tpl-reminder |

All templates are customizable in **Email Templates** module.

## Multi-Tenant Email

Each tenant has their own email configuration. This means:
- Tenant A can use Resend with `noreply@company-a.com`
- Tenant B can use SMTP with their own server
- Tenant C can have email disabled (queue only)

The admin of each tenant configures their own settings — there is no
platform-wide email config.

## Security Notes

- API keys and SMTP passwords are stored in the settings table (encrypted at
  rest by Supabase)
- The API never returns passwords/API keys in plain text after saving
- Test emails use the values currently in the form (so you can test before
  saving)
- All email sends are audit-logged with recipient, subject, and result

# Settings Module

## Purpose
Configure tenant-level settings: company info, security policy, SMTP/email, ERP defaults, and user preferences.

## Tabs

### 1. Company
- Company name, legal name, country, currency
- Tax ID, VAT number, registration number
- Address (line, city, state, postal code, country)
- Bank details (bank name, account, IBAN, SWIFT)
- Branding (logo upload, primary color)
- Subscription plan, max users, status

### 2. Security
- Password policy: min length, require uppercase/lowercase/numbers/symbols
- Session timeout (minutes)
- Max failed login attempts before lockout
- Lockout duration (minutes)
- 2FA requirement toggle
- IP allowlist (comma-separated CIDRs)

### 3. Communications (SMTP)
- SMTP host, port, user, password
- From name, From email
- **Test SMTP** section:
  - Enter recipient email
  - Click "Send test email"
  - Verifies connection (transporter.verify())
  - Sends formatted HTML test email
  - Shows success (green) with message ID, or failure (red) with category + hint:
    - host_unreachable → "check host and port"
    - auth_failed → "wrong credentials, use App Password for Gmail"
    - timeout → "try port 465 (SSL) or 587 (STARTTLS)"
    - tls → "TLS/certificate problem"

### 4. Preferences (per user)
- UI language (en / sr)
- Default landing view
- Date format (YYYY-MM-DD / DD-MM-YYYY / MM-DD-YYYY)
- Number format
- Items per page (10/25/50/100)
- Compact mode
- Email notifications
- Push notifications
- Auto-refresh dashboard (off / 30s / 60s / 5min)

## Actions
| Action | What it does |
|--------|-------------|
| Save | Persists the current tab's settings |
| Test SMTP | Sends a test email (Communications tab) |
| Upload logo | Uploads company logo (Company tab) |

## Tips
- SMTP test uses the values currently in the form — you can test BEFORE saving
- For Gmail: use an App Password (not your account password), port 587, STARTTLS
- Preferences are per-user, not per-tenant
- Logo upload requires the file to be < 2MB, PNG or JPG

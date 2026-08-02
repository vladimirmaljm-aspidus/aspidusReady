# Mail Queue Module

## Purpose
Track all outbound emails. Failed sends retry automatically. Use this to debug email delivery issues.

## Key Features
- List all emails (filter by status: queued / sent / failed)
- See recipient, subject, body (HTML preview)
- Retry failed sends
- Delete queued sends
- View error messages

## Tips
- If SMTP is not configured, all emails go to "queued" status
- Once SMTP is configured + working, queued emails send on next retry cycle
- Failed emails show the SMTP error message — use it to diagnose
- The mail queue is per-tenant

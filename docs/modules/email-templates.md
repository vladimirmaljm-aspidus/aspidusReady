# Email Templates Module

## Purpose
Manage reusable HTML email templates for system-generated emails. Templates support variables (e.g. `{{partnerName}}`) that are filled in at send time.

## Default Templates (5)

| ID | Name | Category | When sent |
|----|------|----------|-----------|
| tpl-welcome | Welcome Email | transactional | New portal account created |
| tpl-kyc | KYC Status Notification | compliance | KYC approved / rejected / resubmit |
| tpl-offer | Offer Notification | transactional | New offer sent to partner |
| tpl-invoice | Invoice Notification | transactional | New invoice sent to partner |
| tpl-reminder | Payment Reminder | notification | Invoice due soon / overdue |

## Key Features
- **List view** with category filter and search
- **Preview** — renders HTML in a sandboxed iframe
- **Edit** — full HTML editor with variable hints
- **Variables** — each template declares which variables it uses
- **Categories**: transactional, marketing, notification, compliance
- **Default flag** — one template per category is the default
- **Duplicate** — copy an existing template as a starting point
- **Test send** — send a test email with sample data

## Actions

| Action | What it does |
|--------|-------------|
| New Template | Opens editor with blank template |
| Edit | Opens editor with existing template |
| Duplicate | Creates a copy with "(copy)" suffix |
| Preview | Shows rendered HTML in a dialog |
| Test send | Sends the template with sample variables to a recipient |
| Delete | Removes template (default templates cannot be deleted) |
| Set as default | Marks this template as the default for its category |

## Template Editor

- **Name** — human-readable label
- **Subject** — email subject (supports variables)
- **Category** — transactional / marketing / notification / compliance
- **Variables** — comma-separated list of available variables
- **HTML body** — full HTML editor (Textarea with monospace font)
- **Description** — what this template is for
- **Default toggle** — make this the default for its category

### Available Variables (by template)

**Welcome Email**: `{{tenantName}}`, `{{partnerName}}`, `{{portalEmail}}`, `{{setupUrl}}`, `{{tier}}`

**KYC Status**: `{{tenantName}}`, `{{partnerName}}`, `{{status}}`, `{{reason}}`

**Offer/Invoice Notification**: `{{tenantName}}`, `{{partnerName}}`, `{{docNumber}}`, `{{amount}}`, `{{currency}}`, `{{dueDate}}`

**Payment Reminder**: `{{tenantName}}`, `{{partnerName}}`, `{{invoiceNumber}}`, `{{amount}}`, `{{currency}}`, `{{dueDate}}`, `{{daysOverdue}}`

## Tips
- Always use inline CSS — most email clients strip `<style>` tags
- Test in Gmail, Outlook, and Apple Mail — they render differently
- Keep width ≤ 600px for mobile compatibility
- Use the Test send button before making a template default
- Variables are case-sensitive — `{{partnerName}}` works, `{{partnername}}` does not

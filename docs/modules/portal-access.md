# Portal Access Management

## Purpose
Admin manages client portal accounts — create, invite, activate, suspend, revoke, change tier, set test password.

## Who Can Access
- **admin / super_admin** only

## Key Features
- List all portal accounts for the current tenant
- See status (pending_approval / approved / invited / active / suspended / revoked)
- See tier (Premium / Business / Standard / Basic)
- See last login time + IP
- Send welcome/invite emails
- Change tier
- Suspend / revoke access
- Set a test password (for phone support)

## Actions

### From Partners → open partner → Portal Access section
| Action | What it does |
|--------|-------------|
| Activate Portal | Opens activation dialog (choose tier + email) |
| Send invite | Sends welcome email with password-setup link |
| Set test password | Generates a random password, sets it on the account, shows it once |
| Edit tier | Changes the tier (takes effect on next login) |
| Suspend | Sets status=suspended — client cannot log in |
| Revoke | Sets status=revoked — client cannot log in, audit logged |

### Portal Access list (top-level view)
- Filter by status, tier
- Search by email or partner name
- Bulk actions (future)

## Portal Access Lifecycle

```
[Partner created]
       ↓
[Admin activates portal] → status=approved, welcome_email_sent=false
       ↓
[Admin clicks "Send invite"] → status=invited, welcome_email_sent=true
       ↓
[Client sets password at /portal/login?access_id=...] → status=active
       ↓
[Client logs in] → can use portal
       ↓
[Admin suspends] → status=suspended (client locked out)
       ↓
[Admin reactivates] → status=active
       ↓
[Admin revokes] → status=revoked (permanent unless re-created)
```

## Automated Email Chain

When admin clicks "Activate Portal":
1. Creates PortalAccess row with chosen tier
2. Sets tier-based exemptions (Premium: exempt_kyc, exempt_document_upload, exempt_location_share)
3. Audit log: "portal_access.create"

When admin clicks "Send invite":
1. Updates status → "invited", welcome_email_sent=true
2. Sends welcome email with `/portal/login?access_id=...` link
3. Email contains: partner name, tier, setup button, what they can do in portal
4. Audit log: "portal.invite"

When client sets password:
1. Client visits the link from email
2. Enters new password (min 8 chars)
3. Password hashed with bcrypt, stored on PortalAccess
4. Status → "active", must_set_password=false
5. Client can now log in normally

## Related Modules
- [Partners](./partners.md) — portal access is created from a partner
- [KYC Review](./kyc-review.md) — approval auto-provisions portal access
- [Portal Tiers](./portal-tiers.md) — tier determines exemptions
- [Email Templates](./email-templates.md) — welcome email template
- [Mail Queue](./mail-queue.md) — failed emails retry from here

## Common Workflows

### Activate portal for a new client (manual)
1. Partners → find the partner → open detail
2. Click "Activate Portal"
3. Confirm email (auto-filled), choose tier:
   - Premium for VIPs (no KYC/docs/location needed)
   - Business for regular clients
   - Standard for trial
   - Basic for read-only
4. Save → partner appears in Portal Access list with status=approved
5. Click "Send invite" → client receives welcome email
6. Client clicks link in email → sets password → logs in

### Activate portal automatically (via KYC approval)
1. Client submits KYC via portal
2. Admin reviews in KYC Review → clicks "Approve & Transfer"
3. System auto-creates PortalAccess (status=invited), sends welcome email
4. Client sets password → logs in

### Suspend a client temporarily
1. Portal Access list → find the client
2. Click "Suspend" → status=suspended
3. Client cannot log in (gets "Account suspended" error)
4. To reactivate: click "Reactivate" → status=active

## Tips
- The welcome email link expires — if client didn't set password in time, just click "Send invite" again
- "Set test password" is for phone support — generates a 10-char password, shows it once (copy it!)
- Suspending preserves the account; revoking is permanent
- Premium clients can be created and made active immediately without KYC

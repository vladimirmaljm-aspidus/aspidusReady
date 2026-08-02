# Portal Login

## URL
`/portal/login`

## Purpose
Login page for client portal users (partners). Separate from admin login at `/`.

## Key Features
- Email + password login
- "First time? Set up your password" link (opens setup dialog)
- Pre-fill email from URL parameter: `/portal/login?email=...`
- Auto-open setup dialog with: `/portal/login?access_id=...`
- Geolocation permission prompt (for non-Premium tiers — see [Portal Tiers](./portal-tiers.md))
- Branded with tenant logo/name (right-side panel)
- HTTPS-only, httpOnly session cookie

## Login Flow

### Normal login
1. Client visits `/portal/login`
2. Enters email + password
3. POST `/api/portal/login` → validates credentials
4. If OK: session cookie set, redirect to `/portal/dashboard`
5. If fail: "Invalid credentials or account not active"

### First-time setup (from welcome email)
1. Admin activates portal → sends invite
2. Client receives email with link: `/portal/login?access_id=pa_xxx`
3. Page auto-opens setup dialog
4. Client enters new password (min 8 chars)
5. POST `/api/portal/setup-password` → password hashed, must_set_password=false
6. Client can now log in normally

## Geolocation Behavior

After successful login, the portal shell checks the tier:

| Tier | Geolocation | Behavior |
|------|-------------|----------|
| Premium | Not required | Portal renders immediately |
| Business / Standard / Basic | Required | Browser prompts for location |

If location is required and:
- **Granted**: lat/lng logged, portal renders
- **Denied**: error screen with "Reload" and "Sign out" buttons
- **Timeout**: same as denied

Location is re-captured every 5 minutes during the session.

## Security
- Rate limited: 10 login attempts per minute per IP
- Account lockout after 5 failed attempts (15-minute lock)
- Password hashed with bcrypt (10 rounds)
- Session token version tracked — admin can invalidate all sessions by bumping token_version
- Session cookie: httpOnly, secure (production), sameSite=lax

## Related
- [Portal Access](./portal-access.md) — admin manages accounts
- [Portal Tiers](./portal-tiers.md) — tier determines requirements
- [Admin Login](./admin-login.md) — separate login for staff

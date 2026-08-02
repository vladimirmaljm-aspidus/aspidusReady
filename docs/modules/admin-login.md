# Admin Login

## URL
`/` (root)

## Purpose
Login page for internal staff (admins, managers, staff, viewers). Separate from client portal login.

## Layout
- **Left panel** (52% width on desktop): branding with emerald gradient, highlights (multi-tenant, landed cost, KYC compliance), Aspidus logo
- **Right panel**: login form (username, password, sign in button)
- On mobile: stacked vertically, branding compact at top

## Login Flow
1. Staff visits `/`
2. Enters username + password
3. POST `/api/auth/login` → validates credentials
4. If OK: session cookie set, AppShell renders
5. If fail: "Incorrect password" or "User does not exist or is deactivated"

## Security
- Rate limited: 10 login attempts per minute per IP
- Account lockout after 5 failed attempts (15-minute lock)
- Password hashed with bcrypt (10 rounds)
- Session token version tracked — admin can invalidate sessions
- Session cookie: httpOnly, secure (production), sameSite=lax
- Audit log: every login attempt recorded (success + failure)
- Last login time + IP stored on user record

## Default Credentials (demo)
- Username: `vladimir`
- Password: `Vladimir2026`

## Tips
- After login, you land on the Dashboard
- Use the global search (top bar) to quickly find any entity
- Click your avatar (top right) to sign out
- Session expires after 24 hours of inactivity (configurable in Settings → Security)

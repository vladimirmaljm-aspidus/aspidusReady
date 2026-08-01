# Security Center Module

## Purpose
Monitor and control security: active sessions, login history, known IPs, trusted devices.

## Sub-tabs

### Sessions
- List all active sessions (user, IP, user agent, last activity)
- Revoke any session (forces re-login)
- See your own current session highlighted

### Login History
- Last 100 logins (successful + failed)
- User, IP, country (geo-IP), timestamp, success/fail
- Filter by user

### Known IPs
- IPs that have logged in before
- Mark as trusted / untrusted
- Forget IP (removes from list)

### Trusted Devices
- Devices that have been explicitly trusted (skip 2FA in future)
- Revoke trust (device will need to re-authenticate)

## Tips
- If you suspect a breach: revoke all sessions → users must re-login
- Failed logins show IP + user agent — look for patterns (same IP, many users)
- Trusted devices expire after 30 days (configurable)

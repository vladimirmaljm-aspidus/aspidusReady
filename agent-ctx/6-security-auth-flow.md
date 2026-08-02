# Task 6 — Security Auth Flow Wiring

**Agent:** Security Auth Flow Subagent
**Date:** 2026-08-02
**Status:** Complete

## What was done

Wired the Security module auth flow so that login/logout creates SecuritySession, LoginHistoryEntry, KnownIp, TrustedDevice records. The Security Center UI (`src/components/views/security-view.tsx`) previously showed empty tabs because nothing was writing these records.

## Files changed (7)

1. **src/app/api/auth/login/route.ts** — rewrote:
   - On successful login: calls `store.createSession`, `store.recordLoginHistory`, `store.upsertKnownIp`, `store.upsertTrustedDevice` (all try/catch wrapped)
   - On wrong password: records `LoginHistoryEntry` with `success:false, reason:"Wrong password"`
   - On locked account: records `LoginHistoryEntry` with `success:false, reason:"Account locked"`
   - On non-existent/inactive user: skips `LoginHistoryEntry` (FK constraint), writes `appendAudit` with `user_id:null` instead
   - Added helpers: `getRequestIp`, `deriveDeviceName` (UA → "Chrome on macOS"), `coarseIpBucket` (/24 IPv4, /64 IPv6), `deviceFingerprint` (sha256 of UA + IP bucket)

2. **src/app/api/auth/logout/route.ts** — added: after `bumpUserTokenVersion`, finds the user's most recent non-revoked current session via `listSessions` and calls `revokeSessionById` on it. Wrapped in try/catch.

3-6. **src/app/api/security/{sessions,login-history,known-ips,trusted-devices}/route.ts** — replaced `auth.tenantId!` with `auth.tenantId ?? ""`, and made super_admin (no `?user_id=` query) see ALL records system-wide. Tenant admins/users still default to their own.

7. **src/lib/data/prisma-store.ts** — fixed 2 pre-existing bugs (NOT security methods — auth/upsert helpers):
   - `getUserByUsername`: changed `findUnique` → `findFirst` (username is not `@unique` in schema)
   - `upsertUser`: rewrote to skip `undefined` fields instead of clobbering them with defaults (was destroying `password_hash` on partial updates like `{id, failed_attempts, locked_until}`)

## Files NOT touched (per task constraints)
- prisma/schema.prisma
- src/lib/data/store.ts
- src/lib/data/prisma-store.ts (security methods only — only modified auth/upsert helpers)
- supabase-store.ts
- src/components/views/security-view.tsx
- src/lib/api/helpers.ts (touch was deemed unnecessary)

## Test results (all passed)

```
login (vladimir/Vladimir2026): 200
/api/security/sessions: 4 records (1 current, 3 revoked)
/api/security/login-history: 6 records (mix of success/failed)
/api/security/known-ips: 1 record (upserted, last_seen updated)
/api/security/trusted-devices: 1 record (upserted, last_used updated)
logout: 200, prior session revoked
login-logout-login: works (no password corruption)
non-existent user: 401, audit log written, no FK error
IP trust toggle: 200, flag flipped
Device revoke: 200, flag flipped
```

Lint passes clean. Dev log shows no compile errors.

## Known limitations / Future work

- **Tenant isolation for security records**: PrismaStore's security list methods ignore `_tenantId` and filter by `user_id` only. Super_admin sees all system records (intended). Tenant admins currently see only their OWN records — they don't see other tenant users' sessions. To enable tenant-wide visibility for tenant admins, would need to either (a) modify PrismaStore to filter via `user.tenant_id` relation (forbidden by task constraints), or (b) fetch the tenant's user list and filter results client-side.
- **Session touch in `requireAuth`**: skipped per task instructions. `last_used_at` is set at session creation only.
- **Geo-IP lookup**: country is left null in dev (no geo-IP service available).

## Notes for next agent

- The `getUserByUsername` fix (findUnique → findFirst) was needed because the orchestrator's schema has `username String` without `@unique` — this allows duplicate usernames across tenants. If you ever want to enforce unique usernames per tenant, add `@@unique([tenant_id, username])` to the schema and regenerate the Prisma client.
- The `upsertUser` rewrite is the correct partial-update behavior — it does NOT change the create-with-defaults behavior because Prisma's schema defaults kick in for missing fields on `db.user.create`.

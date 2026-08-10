# Deep Audit — Database + Security + Permissions

**Scope**: `/home/z/aspidusReady/` (aspidusReady platform)
**Date**: 2026-08-10
**Agent**: db-security-auditor
**Method**: Read-only static analysis of source + schema files. No live DB connection was available (no `.env`); findings are verified against `supabase-schema-live.sql` (auto-generated from live DB 2026-08-06) and the application code.
**Total routes scanned**: 212 `route.ts` files under `src/app/api/`
**Total Prisma models**: 50 / **Live DB tables**: 69

---

## Part A: Database Integrity

### A1. Orphaned Records Risk — **CRITICAL**

**Finding**: The live Supabase database has **NO foreign-key constraints at all**. A full-text search of `supabase-schema-live.sql` returns **zero** matches for `FOREIGN KEY`, `REFERENCES`, or `ON DELETE` (only one false-positive match in a comment about `user_preferences`). The intended schema in `supabase-schema.sql` declares 100+ FK constraints with proper `ON DELETE CASCADE` / `SET NULL` rules, but **migration was never applied to the live DB**.

This means every parent-delete in the application creates orphans:

| Parent delete | Orphaned children (live DB) | Code that triggers it |
|---|---|---|
| `deleteTenant(id)` | users, partners, deals, offers, invoices, proformas, demands, portal_access, kyc_submissions, audit_logs, settings, vault_secrets, sessions, login_history, … | `src/app/api/tenants/[id]/route.ts:153` |
| `deletePartner(id)` | deals.partner_id, offers.partner_id, invoices.partner_id, proformas.partner_id, demands.partner_id, portal_access.partner_id, kyc_submissions.partner_id, commission_agents.partner_id, deal_commissions.partner_id, inventory_movements.partner_id, entity_notes about partners, notifications.partner_id | `src/app/api/partners/[id]/route.ts:65` |
| `deleteProduct(id)` | inventory_movements.product_id, deals.product_id (now unused but historically linked), supplier_offers.product_id, trade_calculations.product_id | `src/app/api/products/[id]/route.ts:63` |
| `deleteDeal(id)` | offers.deal_id, deal_commissions.deal_id (commission payouts), erp_journal_entries (auto-journals) | `src/app/api/deals/[id]/route.ts:63` |
| `deleteOffer(id)` | invoices.offer_id, proformas.offer_id, portal_rfqs.linked_offer_id, document_revisions on offer | `src/app/api/offers/[id]/route.ts:120` |
| `deletePortalAccess(id)` | portal_messages.portal_access_id, portal_rfqs.portal_access_id, portal_uploads.portal_access_id, notifications.partner_id (linked), login_history | `src/app/api/portal-access/[id]/route.ts:26` |

**Store implementation** (`src/lib/data/supabase-store.ts`):
```ts
// line 240
async deletePartner(id: string): Promise<void> {
  const { error } = await this.sb().from("partners").delete().eq("id", id);
  if (error) throw error;
}
```
No `DELETE FROM … WHERE partner_id = $1` clean-up; no soft-delete flag; no cascade.

**Specific orphan risks called out in the task brief**:

- **Offers with `deal_id` pointing to deleted deals** — `offers.deal_id` is nullable (`text`, no FK). After `deleteDeal(id)` the offer's `deal_id` still references the deleted deal ID. Reading `offer.deal_id` then calling `getDeal(offer.deal_id)` returns null but the UI still shows the dead reference.
- **Invoices with `offer_id` pointing to deleted offers** — same pattern. `invoices.offer_id` is `text`, nullable, no FK. The auto-cascade in `record-payment` (`src/app/api/invoices/[id]/record-payment/route.ts:194-207`) follows `invoice.offer_id` → `offer.deal_id` → commissions — if either is orphaned the cascade silently no-ops.
- **Deal commissions with `deal_id` pointing to deleted deals** — `deal_commissions.deal_id` is `text NOT NULL` with no FK. After `deleteDeal(id)`, all commission rows on that deal stay in the table with no parent. `approveDealCommission` / `markDealCommissionPaid` would still work on orphan rows.
- **Portal access with `partner_id` pointing to deleted partners** — `portal_access.partner_id` is `text NOT NULL` no FK. After `deletePartner(id)` the portal account is left alive with no partner; portal login still works and the `access.partner_id` lookup in `verifyPortalCredentialsByEmail` returns `null` for `partner`, but the session is still valid.

**Severity**: CRITICAL — silently broken referential integrity; queries that join these tables return partial/missing data and cascades no-op.

### A2. Missing CASCADE — **CRITICAL**

The intended `supabase-schema.sql` declares these cascade rules that are NOT enforced on the live DB:

| Parent | Children (intended CASCADE) | Live behavior |
|---|---|---|
| `tenants` | api_keys, audit_logs, commission_agents, commission_payouts, deal_commissions, deals, demands, document_register, erp_*, feature_flags, fiscal_periods, invoices, kyc_submissions, logistics_*, mail_queue, notifications, offers, partners, portal_*, proformas, product_catalog, products, project_*, quick_notes, settings, shared_documents, supplier_offers, trade_calculations, user_*, vault_secrets, webhooks (≈45 tables) | ALL rows orphaned |
| `partners` | commission_agents, deals, demands, inventory_movements, invoices, kyc_submissions, logistics_requests, offers, portal_access, portal_messages, portal_rfqs, portal_uploads, proformas | ALL rows orphaned |
| `products` | inventory_movements (CASCADE), deals.product_id (SET NULL), supplier_offers.product_id (SET NULL), trade_calculations.product_id (SET NULL) | No cascade — inventory_movements stay, deals.supplier_id stays |
| `users` | sessions, login_history, known_ips, trusted_devices (CASCADE); deals.owner_id, offers.owner_id, audits.user_id, documents.uploaded_by, etc. (SET NULL) | ALL rows orphaned (sessions remain active even after user delete!) |
| `portal_access` | portal_messages, portal_rfqs, portal_uploads (SET NULL) | No set-null — child rows still carry the dead `portal_access_id` |
| `deals` | offers.deal_id (SET NULL), deal_commissions.deal_id (CASCADE), erp_journal_entries (no FK but referenced) | offers keep dead deal_id, commissions stay |
| `commission_agents` | deal_commissions (CASCADE), commission_payouts (no FK) | commissions stay |

**`deleteUser`** is particularly dangerous: `src/lib/data/supabase-store.ts:200` just deletes the user row. The user's `sessions` rows (active JWTs!) stay in the `sessions` table — but `requireAuth` checks `token_version` against the session, and `bumpUserTokenVersion` is only called when an admin *updates* a user. Pure `deleteUser` does **not** invalidate sessions, so a deleted user's cookie remains valid until session TTL (7 days). Note: `deleteUser` is not currently called by any API route (it's only used by the legacy MockStore test path), so the live risk is low.

**Fix**: Apply `supabase/migrations/001_fix_rls_policies.sql` (which also creates the FK constraints in its companion migration), or write a dedicated `007_add_foreign_keys.sql` migration that adds the missing FK constraints idempotently.

### A3. Data Type Mismatches — **HIGH**

The `prisma/schema.prisma` is severely out of sync with the live DB. While `PrismaStore` is deprecated (only `SupabaseStore` is used in production), the drift misleads any developer consulting the Prisma schema as documentation.

| Table | Column | Prisma type | Live DB type | Impact |
|---|---|---|---|---|
| `products` | `price` | `Float` | `numeric` | Float loses precision on money; live DB is correct |
| `products` | `attributes` | `String?` ("JSON object") | (no column in live DB) | Field doesn't exist in live DB |
| `offers` | `items` | `String` ("JSON array") | `jsonb NOT NULL DEFAULT '[]'` | PrismaStore would store JSON as text, SupabaseStore sends object directly (works) but Prisma schema is wrong |
| `offers` | `selling_price` | `Float?` | `numeric` | Same precision issue |
| `offers` | (multiple) | (not in Prisma) | `pdf_file_url`, `pdf_generated_at`, `quantity`, `unit`, `product_id`, `services`, `payment_bank_idx`, `client_accepted_at`, `client_signature`, `client_note`, `admin_reviewed_by_client`, `old_id`, `deleted_at`, `pol_country`, `pod_country`, `delivery_address`, `delivery_city`, `delivery_country`, `specification`, `origin_country`, `exchange_rate`, `exchange_rate_date`, `exchange_rate_note`, `viewed_at`, `viewed_by_email`, `view_count`, `version` | 25+ live columns missing from Prisma schema | PrismaStore is broken; live DB has evolved significantly |
| `tenant.bank_accounts` | `Json?` | `jsonb` | (matches, but Prisma's `Json` type maps to TEXT in SQLite) | N/A in production (Supabase) |
| Many tables | `id` | `String @id @default(cuid())` | `text DEFAULT (gen_random_uuid())::text` | Prisma generates CUIDs, live DB generates UUIDs. Mixed IDs would break PrismaStore. |
| All models | (model name) | CamelCase (`ApiKey`, `Offer`) | snake_case (`api_keys`, `offers`) | No `@@map` directives — Prisma would query `ApiKey` table, not `api_keys`. **PrismaStore is hopelessly broken against the live DB.** |

**Nullable vs NOT NULL mismatches**: Most live-DB `text` columns have explicit `NOT NULL` defaults that Prisma marks as nullable. Examples: `offers.unit`, `offers.exchange_rate` (nullable live, not declared in Prisma). New `NOT NULL` columns added in production aren't reflected in Prisma, so PrismaStore inserts would crash.

**`platform-access.last_login_country`** (`supabase/migrations/005_portal_access_last_login_country.sql`): the live DB may not have this column yet — the store defensively retries the upsert without it (`src/lib/data/supabase-store.ts:1010-1024`).

### A4. Unused Tables — **MEDIUM**

11 tables exist in the live DB but are **never queried by any code path** (verified with `grep -r '.from("table_name")' src/`):

| Table | Purpose (inferred) | Recommendation |
|---|---|---|
| `document_sequences` | Old document-number counter (replaced by SEQUENCE objects in migration 004) | Drop — schema says `last_number`/`year`/`prefix` columns but `get_next_doc_number` RPC uses Postgres SEQUENCEs, not this table |
| `expense_entries` | Expense tracking module | Drop or implement (referenced only in `workspace-view.tsx` description text) |
| `file_manager` | Generic file storage (replaced by `shared_documents` + `portal_uploads`) | Drop |
| `meeting_notes` | Calendar meeting notes | Drop or implement |
| `module_groups` | UI module grouping | Drop (UI uses static `sidebar.tsx` config) |
| `partner_connections` | Partner relationship graph (parent/subsidiary) | Drop or implement — currently no API to create/read connections |
| `project_tasks` | Project management tasks (replaced by `user_tasks`) | Drop |
| `recurring_expenses` | Recurring expense templates | Drop or implement |
| `reminders` | Personal reminders (replaced by `user_tasks` with due dates) | Drop |
| `team_chat_messages` | Team chat feature | Drop or implement |
| `time_entries` | Time tracking | Drop or implement |

These tables occupy DB storage and complicate backups/migrations but represent no functional risk (no code reads them).

---

## Part B: Security

### B1. Routes Without Auth — **LOW**

After scanning all 212 `route.ts` files with `grep -rL "requireAuth|requireAdmin|requireSuperAdmin|requireAuthOrApiKey|requirePortalSession|getPortalSessionAccess"`, the following routes have no auth check:

| Route | Why it's OK |
|---|---|
| `src/app/api/auth/login/route.ts` | Login endpoint — by definition pre-auth |
| `src/app/api/auth/logout/route.ts` | Logout — reads cookie, no DB read |
| `src/app/api/auth/me/route.ts` | Returns current user from cookie (returns 401 if not authed) |
| `src/app/api/health/route.ts` | Health check — returns tenant count only |
| `src/app/api/portal/login/route.ts` | Portal login |
| `src/app/api/portal/forgot-password/route.ts` | Password reset initiator |
| `src/app/api/portal/reset-password/route.ts` | Password reset (token-gated) |
| `src/app/api/portal/setup-password/route.ts` | First-time password setup (access_id-gated) |
| `src/app/api/portal/me/route.ts` | Portal self-info (cookie-gated) |
| `src/app/api/integrations/ports/route.ts` | Static embedded data (3,700 ports) — safe to expose |
| `src/app/api/route.ts` | API root — returns "Aspidus API" |
| `src/app/api/setup/route.ts` | One-time bootstrap — guarded by `if (existingAdmin) return 403` (`src/app/api/setup/route.ts:57-62`) |
| `src/app/api/verify/[code]/route.ts` | Public QR document verification — intentional (analogous to a public notary lookup) |

All 13 are legitimately public or pre-auth. **No unauthenticated data leak found.**

### B2. Tenant Isolation Gaps — **HIGH**

The `resolveTenantId` helper (`src/lib/api/helpers.ts:211`) returns `null` for super-admins without `?tenant_id=`, but several routes then silently fall back to the FIRST tenant's data:

```ts
// src/app/api/portal-rfqs/route.ts:18-21
if (!tenantId && auth.isSuperAdmin) {
  const tenants = await auth.store.listTenants();
  tenantId = tenants[0]?.id || null;
}
```

Same pattern in:
- `src/app/api/email-templates/route.ts:166-169`
- `src/app/api/kyc/route.ts:20-23`

This is not a cross-tenant access vulnerability (super-admins can legitimately access any tenant), but it's a **silent cross-tenant data leak** — a super-admin who forgets to pass `?tenant_id=` sees tenant #1's data without realizing it. Audit logs will show "tenant X accessed" but the super-admin thought they were looking at tenant Y.

**Defense-in-depth post-filter**: Routes like `partners`, `offers`, `invoices`, `documents`, `vault`, `deals` (GET) all include a post-filter:
```ts
if (!auth.isSuperAdmin && auth.tenantId) {
  result.items = result.items.filter((p) => p.tenant_id === auth.tenantId);
}
```
This is correctly applied for regular users. The store layer (`src/lib/data/supabase-store.ts:222-223`) skips the tenant filter when tenantId is falsy:
```ts
let q = this.sb().from("partners").select("*");
if (tenantId) q = q.eq("tenant_id", tenantId);  // empty string → no filter → returns ALL
```
This is intended for super-admin platform-wide queries, but it means any code path that passes `""` (empty string) instead of `null` returns all tenants' data. Found callers passing `""`:
- `src/app/api/super-admin/overview/route.ts:14-19` — `store.listUsers("")`, `store.listPartners("", ...)`, `store.listDeals("", ...)`, etc. (intentional super-admin-only)

### B3. Permission Gaps — **HIGH**

#### B3.1 API keys bypass `requirePermission`

Routes using `requireAuthOrApiKey` routinely skip the permission check for API-key auth:
```ts
// src/app/api/dashboard/route.ts:10-11
if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "dashboard.read"); if (_d) return _d; }
```

`requirePermission(auth, ...)` is typed `auth: AuthContext` (session only) — it cannot accept `ApiKeyAuthContext`. The bypass is therefore *intentional* in the type system. **But** only 9 of the 16 `requireAuthOrApiKey` routes also call `hasPermission(auth.permissions, …)` for API keys:

Routes that DO check API-key permissions (`grep hasPermission`):
- `src/app/api/api-keys/test/route.ts`
- `src/app/api/deals/route.ts`
- `src/app/api/erp/settings/route.ts`
- `src/app/api/invoices/route.ts`
- `src/app/api/offers/route.ts`
- `src/app/api/partners/route.ts`
- `src/app/api/plans/[id]/route.ts`
- `src/app/api/products/route.ts`
- `src/app/api/proformas/route.ts`

Routes that DO NOT check API-key permissions (silent bypass):
- `src/app/api/automation/create-demand-from-portal-rfq/route.ts` — creates a demand from a portal RFQ using an API key with `permissions: []`
- `src/app/api/automation/create-offer-from-deal/route.ts` — creates an offer from a deal
- `src/app/api/supplier-offers/route.ts` (GET) — lists supplier offers
- `src/app/api/dashboard/route.ts` — full tenant dashboard insights
- `src/app/api/trade-calculator/route.ts` (GET, POST) — list + create trade calculations
- `src/app/api/trade-calculator/[id]/route.ts` (GET, PUT, DELETE)
- `src/app/api/trade-calculator/[id]/create-offer/route.ts`

A tenant admin who creates an API key with `permissions: []` (the default — see `src/app/api/api-keys/route.ts:50-58`) can use that key to access all of the above routes with no permission scoping. The key is still scoped to the tenant (`requireApiKeyAuth` returns `tenantId` from the key's row), so it's not cross-tenant — but it bypasses the role-based permission model entirely within the tenant.

**Severity**: HIGH within-tenant — a "viewer"-role user (no permissions) can convince an admin to mint an API key, then use it to access routes their role would deny.

#### B3.2 The `permissions: ["*"]` wildcard

In `src/lib/permissions/can.ts:38`:
```ts
if (perms.includes("*")) return true;
```

A regular `user`-role account with `permissions: ["*"]` gets implicit access to every non-platform permission. There's **no route-level validation** that prevents a tenant admin from granting `["*"]` to a regular user via `POST /api/users` (`src/app/api/users/route.ts` — the `whitelistUserFields` allows `permissions` and there's no check rejecting `["*"]` for non-super-admin roles). The `setup` bootstrap seeds the tenant admin with `permissions: ["*"]` (`prisma/seed.ts:88`).

#### B3.3 API key `permissions: ["*"]` grants tenant-wide superuser

Any tenant admin can mint an API key with `permissions: ["*"]` via `POST /api/api-keys` (no validation). The `hasPermission(["*"], anything)` returns `true` (`src/lib/api/helpers.ts:156`). Combined with B3.1 (some routes don't even call `hasPermission`), a `"*"` API key is effectively a tenant-scoped superuser.

### B4. Super-Admin Bypass — **MEDIUM**

- ✅ **Can access any tenant's data**: `resolveTenantId` honors `?tenant_id=` for super-admins (`src/lib/api/helpers.ts:217-222`). Post-filters skip super-admin (`if (!auth.isSuperAdmin && …)`).
- ⚠️ **Mutate without audit log**: All super-admin mutation routes I sampled (`tenants/[id]/route.ts:144`, `super-admin/impersonate/route.ts:77`, `super-admin/impersonate/end/route.ts:34`) call `audit()`. ✅
- ⚠️ **Impersonate**: `requireAuth` swaps the effective user when `session.impersonating` is set AND `baseUser.role === "super_admin"` AND not expired (`src/lib/api/helpers.ts:50-62`). The impersonated user's `tenant_id` is correctly used for `resolveTenantId`. `auth.isSuperAdmin` is `false` during impersonation (`src/lib/api/helpers.ts:65`), so platform-permission checks correctly deny. Audit entries are attributed to the original super_admin (`src/app/api/super-admin/impersonate/route.ts:79`). ✅
- ❌ **However**: during impersonation, `auth.user` is the target user — but `audit()` is called with `auth.user` (the target) in most routes (e.g. `deals/route.ts:64`), NOT with the original super_admin. So mutations performed during impersonation are logged as if the impersonated user did them, with only the `super_admin.impersonate.start` audit entry as a paper trail. This is acceptable for diagnostics but forensically weak — a malicious super_admin could impersonate a user, perform destructive mutations, end the session, and the audit log would show the impersonated user as the actor.

### B5. API Key Security — **MEDIUM**

- ✅ **Hashed with SHA-256**: `src/lib/data/supabase-store.ts:715` — `createHash("sha256").update(rawKey).digest("hex")`. Stored in `api_keys.key_hash`.
- ✅ **Strong entropy**: `src/app/api/api-keys/route.ts:61` — `randomBytes(24).toString("hex")` (192 bits).
- ✅ **Prefix match**: Stores `key_prefix` (first 12 chars) for fast DB lookup before hash comparison. The DB query filters both `key_prefix` and `key_hash`, so it's a 2-stage check (no row returned if prefix doesn't match). This is fine — it just speeds up the lookup; security still relies on the SHA-256.
- ✅ **Expiration enforced**: `src/lib/data/supabase-store.ts:728` checks `expires_at`.
- ⚠️ **Active flag checked** but not the tenant's `status` — an API key for a suspended tenant still works. `requireAuth` blocks suspended tenants (returns 402), but `requireApiKeyAuth` does NOT. So a suspended tenant's API integrations keep working until the key expires. This may be intentional (so a suspended tenant can still extract their data via API) but is inconsistent with the session-auth path.
- ❌ **No constant-time comparison**: The DB equality check on `key_hash` is server-side (Postgres `=`), so timing attacks are not practically exploitable. However, `key_prefix` is also matched with `=` — an attacker who could time the prefix match could narrow the keyspace. Low practical risk because SHA-256 of a 192-bit random value is unbruteforceable.
- ❌ **No rate limiting on API-key auth**: `requireApiKeyAuth` does not implement failed-attempt tracking or lockout (unlike `auth/login`'s 5-attempt lockout). An attacker with a leaked hash could brute-force the `asp_…` prefix offline; online brute-force is only limited by Supabase's own rate limits.

### B6. Vault Secrets Are NOT Encrypted — **CRITICAL**

The `vault_secrets.encrypted_value` column is `text NOT NULL` (live DB schema). The vault UI accepts a plaintext value, sends it directly as `encrypted_value` in the POST body, and SupabaseStore writes it verbatim:

```ts
// src/components/views/vault-view.tsx:315
if (value) body.encrypted_value = value;

// src/app/api/vault/route.ts:51
const created = await auth.store.upsertVaultSecret(body);
```

A `grep -r "encrypt\|cipher\|createCipher\|aes-" src/` returns ZERO matches in any code path (only the `name-cipher.ts` util for masking names, which is unrelated). The column name `encrypted_value` is a lie — values are stored as **plaintext** in the database. The UI text "Value is encrypted at rest" (`src/components/views/vault-view.tsx:394`) is a false claim.

Anyone with read access to the `vault_secrets` table (Supabase dashboard, DB dump, backup, SQL injection elsewhere, a leaked service_role key) can read every secret in clear.

**Severity**: CRITICAL — false advertising of encryption for sensitive credentials.

### B7. Hardcoded Credentials in Seed — **HIGH**

`prisma/seed.ts:59-61`:
```ts
const superAdminHash = await bcrypt.hash("Vladimir2026", 10);
const adminHash = await bcrypt.hash("Admin2026", 10);
const userHash = await bcrypt.hash("User2026", 10);
```

If this seed was ever run against a production DB, the platform has well-known default credentials. The setup endpoint (`src/app/api/setup/route.ts:42-45`) falls back to `process.env.ADMIN_USERNAME` / `process.env.ADMIN_PASSWORD` if not provided in the body, but accepts body-supplied credentials too.

**Recommendation**: Audit the live `users` table for these specific usernames (`vladimir`, `admin`, `user@aspidus.com`); if present, force password reset immediately.

---

## Part C: Missing Features / Gaps

### C1. Missing Audit Logs — **MEDIUM**

Mutation routes (POST/PUT/DELETE/PATCH) that do NOT call `audit()` or `store.appendAudit()`:

| Route | What's not logged |
|---|---|
| `src/app/api/banking/validate-iban/route.ts` | IBAN lookups (low-risk — read-only validation) |
| `src/app/api/commission-calculate/route.ts` | Commission calculations (no DB write — pure compute) |
| `src/app/api/portal/kyc/document/[id]/route.ts` (DELETE) | KYC document deletion by portal client — **HIGH**: a portal user can delete uploaded KYC docs and there's no audit trail |
| `src/app/api/portal/logistics/route.ts` (POST) | Portal logistics request creation — actually creates a `logistics_event` (timeline) but no `audit_logs` row |
| `src/app/api/portal/notifications/[id]/read/route.ts` | Read-state mutation (low-risk) |
| `src/app/api/portal/setup-password/route.ts` | Portal password setup — **MEDIUM**: password is set/changed with no audit log |
| `src/app/api/setup/route.ts` | One-time bootstrap (acceptable — gate is "no admin exists yet") |
| `src/app/api/verify/[code]/route.ts` | Public verification (uses `document_verification_logs` table separately, so it IS logged — just not via `audit()`) |

**Critical gap**: `src/app/api/portal/kyc/document/[id]/route.ts` DELETE has no audit. A portal client can delete their own KYC documents and there's no record of who deleted what when.

### C2. Missing Quota Checks — **MEDIUM**

`enforceQuota()` (defined in `src/lib/api/plan-limits.ts:89`) is only called from 10 routes:
- `src/app/api/automation/create-invoice-from-offer/route.ts`
- `src/app/api/automation/create-invoice-from-proforma/route.ts`
- `src/app/api/automation/create-offer-from-deal/route.ts`
- `src/app/api/automation/create-proforma-from-offer/route.ts`
- `src/app/api/invoices/route.ts`
- `src/app/api/offers/route.ts`
- `src/app/api/partners/route.ts`
- `src/app/api/products/route.ts`
- `src/app/api/proformas/route.ts`
- `src/app/api/users/route.ts`

`QuotaResource` is limited to `users | partners | products | monthly_documents` (the four limits the `plans` table tracks). Other "create" routes that consume tenant resources but are NOT quota-checked:

| Route | Resource consumed |
|---|---|
| `src/app/api/deals/route.ts` (POST) | Deal row (no plan limit defined) |
| `src/app/api/demands/route.ts` (POST) | Demand row |
| `src/app/api/logistics-requests/route.ts` (POST) | Logistics request |
| `src/app/api/tasks/route.ts` (POST) | Task |
| `src/app/api/quick-notes/route.ts` (POST) | Quick note |
| `src/app/api/documents/route.ts` (POST) | Shared document (file upload) |
| `src/app/api/supplier-offers/route.ts` (POST) | Supplier offer |
| `src/app/api/trade-calculator/route.ts` (POST) | Trade calculation |
| `src/app/api/commission-agents/route.ts` (POST) | Commission agent |
| `src/app/api/deal-commissions/route.ts` (POST) | Deal commission |
| `src/app/api/commission-payouts/route.ts` (POST) | Commission payout |
| `src/app/api/webhooks/route.ts` (POST) | Webhook |
| `src/app/api/api-keys/route.ts` (POST) | API key |
| `src/app/api/vault/route.ts` (POST) | Vault secret |
| `src/app/api/document-templates/route.ts` (POST) | Document template |
| `src/app/api/tenants/route.ts` (POST) | Tenant (super-admin only — bypass) |
| `src/app/api/letterheads/route.ts` (POST) | Letterhead |
| `src/app/api/seals/route.ts` (POST) | Seal |
| `src/app/api/portal-access/route.ts` (POST) | Portal access |
| `src/app/api/portal-rfqs/route.ts` (POST) | Portal RFQ (portal-side) |
| `src/app/api/portal/messages/route.ts` (POST) | Portal message (portal-side) |
| `src/app/api/portal/upload/route.ts` (POST) | Portal upload (portal-side) |
| `src/app/api/portal/logistics/route.ts` (POST) | Portal logistics request (portal-side) |
| `src/app/api/portal/rfqs/route.ts` (POST) | Portal RFQ submission (portal-side) |
| `src/app/api/portal/kyc/route.ts` (POST) | Portal KYC submission (portal-side) |
| `src/app/api/portal/kyc/submit/route.ts` (POST) | Portal KYC submit (portal-side) |
| `src/app/api/portal/kyc/document/route.ts` (POST) | Portal KYC doc upload (portal-side) |
| `src/app/api/portal/offers/[id]/respond/route.ts` (POST) | Portal offer response (portal-side) |
| `src/app/api/portal/messages/route.ts` (POST) | Portal message send (portal-side) |
| All `*/[id]/to-offer` / `*/[id]/send` routes | Side-effecting mutations |

The current `QuotaResource` enum doesn't even have categories for these. The intent is that `monthly_documents` covers invoices+proformas+offers (see `countCurrent` in `src/lib/api/plan-limits.ts:55-72`), but documents, demands, and other "soft" resources are completely uncounted.

**Severity**: MEDIUM — a Trial tenant can create unlimited deals, demands, tasks, documents, webhooks, API keys, etc., bypassing the plan-tier monetization model.

### C3. Missing Error Handling — **MEDIUM**

77 routes have at least one handler (GET/POST/PUT/DELETE/PATCH) without a `try { … } catch` wrapper. These will return an unhandled 500 with a stack-trace leak in development mode.

Top offenders (2 handlers without try/catch):

| File | Handlers without try |
|---|---|
| `src/app/api/trade-calculator/[id]/route.ts` | GET + DELETE (PUT has try) |
| `src/app/api/supplier-offers/[id]/route.ts` | 2 handlers bare |
| `src/app/api/seals/[id]/route.ts` | 2 handlers bare |
| `src/app/api/product-catalog/[id]/route.ts` | 2 handlers bare |
| `src/app/api/portal-uploads/[id]/route.ts` | 2 handlers bare |
| `src/app/api/letterheads/[id]/route.ts` | 2 handlers bare |
| `src/app/api/documents/[id]/route.ts` | 2 handlers bare |
| `src/app/api/document-templates/[id]/route.ts` | 2 handlers bare |
| `src/app/api/document-register/[id]/route.ts` | 2 handlers bare |

Single-handler bare routes include `vault/[id]/route.ts` (DELETE), `vault/route.ts` (POST), `webhooks/route.ts` (POST), `tasks/route.ts` (POST), all 4 export routes (`offers/export`, `invoices/export`, `partners/export`, `products/export`), most security routes, the cron route, and `super-admin/audit/route.ts`.

Even the routes that DO have try/catch leak Postgres error messages verbatim:
```ts
} catch (error: any) {
  return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
}
```
This is in `deals/route.ts`, `partners/[id]/route.ts`, `users/route.ts`, `tenants/[id]/route.ts`, `vault/route.ts`, etc. A 500 response exposes Supabase/Postgres internal errors (column names, constraint names, schema details) to the client — useful for attackers probing the schema.

### C4. Other Gaps Found

#### C4.1 Cron token uses `===` string comparison — **LOW**

`src/app/api/cron/subscription-sweep/route.ts:20`:
```ts
let authorised = !!expected && token === expected;
```
Vulnerable to timing attacks in theory, but the token is a high-entropy random string and the comparison happens once per call — practical risk is negligible. Use `crypto.timingSafeEqual` for defense-in-depth.

#### C4.2 `document_sequences` table is a ghost — **LOW**

Migration 004 creates Postgres `SEQUENCE` objects (`offer_number_seq`, `invoice_number_seq`, `proforma_number_seq`) and an `get_next_doc_number` RPC function. The `document_sequences` table exists in the live DB but is **never queried** (verified — `src/lib/api/doc-number.ts:40` calls `sb.rpc("get_next_doc_number", …)` only). It's leftover from a previous counter implementation. See A4.

#### C4.3 `auth/login` skips login_history for non-existent users — **LOW**

`src/app/api/auth/login/route.ts:92-113`: when the username doesn't exist, the route writes an `audit_logs` entry but skips `login_history` because of the FK constraint (which doesn't actually exist in the live DB — see A1). The code comment says "LoginHistoryEntry model has a non-nullable user_id with a FK to User. For non-existent users we cannot persist a row without violating the FK constraint." Since the FK doesn't exist on the live DB, this skip is unnecessary — but harmless.

#### C4.4 Super-admin overview fetches ALL rows — **MEDIUM**

`src/app/api/super-admin/overview/route.ts:12-20` calls `listUsers("")`, `listPartners("", {limit:1000})`, `listDeals("", {limit:1000})`, `listOffers("", {limit:1000})`, `listInvoices("", {limit:1000})`, `listAudit("", {limit:50})` in parallel. For a platform with >1000 tenants this will be OOM-slow. Each list query also returns ALL columns including `password_hash` for users (the route then strips it client-side via `.map(({password_hash, …}) => …)` — but the data still crosses the wire).

---

## Critical Issues (ranked)

1. **CRITICAL — No foreign-key constraints on live DB** (`supabase-schema-live.sql` — zero `FOREIGN KEY` / `REFERENCES` matches). Every parent delete orphans child rows. Apply `supabase/migrations/001_fix_rls_policies.sql` companion FK migration or write `007_add_foreign_keys.sql`. [A1, A2]

2. **CRITICAL — `vault_secrets.encrypted_value` stores plaintext, not ciphertext** (`src/app/api/vault/route.ts:51`, `src/components/views/vault-view.tsx:315`). UI claims "encrypted at rest" — false. Apply AES-256-GCM encryption with a key from `process.env.VAULT_KEY` before insert; decrypt on read.

3. **CRITICAL — No Row-Level Security on live DB** (verified: `grep ROW LEVEL SECURITY supabase-schema-live.sql` returns zero matches). All tenant isolation depends on app-layer `.eq("tenant_id", …)` filters. Migration `001_fix_rls_policies.sql` exists but was never applied. Defense-in-depth is gone.

4. **HIGH — API keys bypass `requirePermission` on 7 routes** (`dashboard`, `supplier-offers`, `trade-calculator/*`, `automation/create-demand-from-portal-rfq`, `automation/create-offer-from-deal`). A tenant admin can mint `permissions: []` API key that grants unscoped access to these routes. Fix: call `hasPermission(auth.permissions, "…:read")` in every `requireAuthOrApiKey` route, or refactor `requirePermission` to accept `ApiKeyAuthContext`. [B3.1]

5. **HIGH — Prisma schema drift makes `PrismaStore` dangerously broken** (`prisma/schema.prisma` — 25+ missing columns on `offers`, no `@@map` directives, `Float` vs `numeric` mismatches, `String` vs `jsonb` for `items`). PrismaStore is deprecated but the schema misleads developers. Either delete PrismaStore + schema, or regenerate from live DB. [A3]

6. **HIGH — Hardcoded seed credentials** (`prisma/seed.ts:59-61`: "Vladimir2026", "Admin2026", "User2026"). If seed was ever run in prod, the platform has well-known logins. Audit `users` table for these usernames and force-reset. [B7]

7. **HIGH — `deleteUser` doesn't invalidate sessions** (`src/lib/data/supabase-store.ts:200`). `bumpUserTokenVersion` is not called, so deleted users' cookies stay valid for the 7-day session TTL. Not currently called by any API route (legacy only), but the method exists and is dangerous if ever wired up. [A2]

8. **HIGH — Tenant admin can grant `permissions: ["*"]` to regular users** (`src/app/api/users/route.ts` — `whitelistUserFields` allows `permissions` with no `"*"` rejection). Any tenant admin can promote a regular user to tenant-wide superuser-equivalent. Reject `"*"` and platform-prefixed permissions for non-super-admin roles. [B3.2]

9. **MEDIUM — Silent fall-back to first tenant for super-admin without `?tenant_id=`** (`portal-rfqs/route.ts:18-21`, `email-templates/route.ts:166-169`, `kyc/route.ts:20-23`). Returns tenant #1's data without warning. Return 400 "tenant_id required" instead. [B2]

10. **MEDIUM — No quota enforcement on most resource-creating routes** (deals, demands, tasks, documents, webhooks, API keys, vault, templates, seals, letterheads, portal-access, portal uploads/messages/RFQs/logistics). Trial tenants can create unlimited resources. Extend `QuotaResource` enum and add `enforceQuota` calls. [C2]

11. **MEDIUM — Portal KYC document deletion has no audit log** (`src/app/api/portal/kyc/document/[id]/route.ts` DELETE). Portal clients can delete their own KYC docs with no paper trail. Add `audit()` call. [C1]

12. **MEDIUM — 77 routes lack try/catch on at least one handler**. Postgres errors leak to client as `error.message` (column names, constraint names). Wrap all handlers and return generic messages; log details server-side only. [C3]

13. **MEDIUM — API keys for suspended tenants remain active** (`requireApiKeyAuth` doesn't check tenant status, unlike `requireAuth`'s 402 suspension gate). Either block suspended tenants' API keys or document the intentional behavior. [B5]

14. **MEDIUM — Impersonation mutations logged as the impersonated user, not the super-admin** (`audit(auth.store, auth.user, …)` where `auth.user` is the effective/impersonated user). Add `audit.impersonated_by` field or attribute audit to the original super_admin. [B4]

15. **LOW — Cron token uses `===` (timing-attack vulnerable in theory)**. Use `crypto.timingSafeEqual`. [C4.1]

16. **LOW — 11 unused tables in live DB** (document_sequences, expense_entries, file_manager, meeting_notes, module_groups, partner_connections, project_tasks, recurring_expenses, reminders, team_chat_messages, time_entries). Drop or implement. [A4]

---

## Files Inspected (highlights)

- `prisma/schema.prisma` (1775 lines, 50 models)
- `supabase-schema-live.sql` (1565 lines, 69 tables — live DB dump 2026-08-06)
- `supabase-schema.sql` (1277 lines — intended schema with FK + RLS, never applied)
- `src/lib/data/supabase-store.ts` (2656 lines — production store)
- `src/lib/api/helpers.ts` (261 lines — `requireAuth`, `requireApiKeyAuth`, `audit`)
- `src/lib/permissions/can.ts` + `catalog.ts` (491 lines)
- `src/lib/api/plan-limits.ts` (130 lines — `enforceQuota`)
- `src/lib/api/feature-guard.ts` (84 lines — `requireFeature`)
- All 212 `src/app/api/**/route.ts` files (audit-per-route grep)
- `supabase/migrations/001_fix_rls_policies.sql` (238 lines — pending migration)
- `prisma/seed.ts` (223 lines — contains hardcoded credentials)

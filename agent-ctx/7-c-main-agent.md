# Task 7-c: Fix and Improve Users View & Deals View

## Agent: Main Agent
## Task ID: 7-c

## Summary

Completed all 9 sub-tasks across two view components and two API routes. All modified files pass lint with zero errors.

## Changes Made

### 1. src/components/views/users-view.tsx

**Fix useMemo misuse → useEffect**
- Replaced `useMemo` for form initialization side effects with `useEffect` (line 391)
- This was the primary bug: `useMemo` was being used to run side effects (setForm, setAdvancedOpen, etc.) which is incorrect usage

**Add tenant linking to user creation**
- Added tenant data fetching via `useQuery` for `/api/tenants` (line 104-110)
- Added `tenant_id` field to `UserForm` type (line 286)
- Added Tenant dropdown in the form: super_admin sees all tenants as a Select, regular admin sees a disabled Input showing their own tenant (lines 447-467)
- Added Tenant column in the table showing tenant name with Building2 icon (lines 252-258)
- When creating a new user, `tenant_id` is included in the POST body (line 418)
- Auto-sets default tenant_id based on user role (line 393)

**Simplify user creation form**
- Essential fields: Full Name, Email, Role, Tenant, Password (auto-generated)
- Password field with Generate button and copy button
- All other fields (Username, Active toggle, Custom permissions) in collapsible "Advanced settings" section

**Add pagination (20 items/page)**
- Added `PAGE_SIZE = 20` constant
- Client-side pagination using `effectivePage` computed value
- Pagination controls with page numbers, Previous/Next buttons

**Remove password from toast**
- Replaced toast showing password with a green "User created!" banner in the dialog showing username and password with copy button
- Toast now only says "User created successfully!" without the password

**Other fixes:**
- Added `super_admin` role to ROLE_LABEL and ROLE_DESCRIPTION maps
- Added `super_admin` badge styling (destructive variant)
- Added `isSuperAdmin` import from app-store
- Added `Tenant` type import from supabase/types
- Added `Building2` icon import from lucide-react
- Added `Pagination` component imports

### 2. src/components/views/deals-view.tsx

**Fix useMemo misuse → useEffect**
- Replaced `useMemo` for form initialization side effects with `useEffect` (line 939)
- Changed from `useMemo(() => { if (open) { ... } }, [open, deal, partners])` to `useEffect(() => { if (open) { ... } }, [open, deal, partners])`

**Simplify deal creation form**
- Essential fields: Title (required), Partner (dropdown), Stage, Value, Currency
- Smart defaults: currency "USD", stage "qualified", probability 20
- Collapsible "More Details" section (renamed from "Details") for probability, close date, notes
- "Line Items" and "Commission" sections remain collapsible

**Add pagination (20 items/page)**
- Added `PAGE_SIZE = 20` constant
- Client-side pagination using `effectivePage` computed value
- Pagination controls shown only in table layout
- Removed `useMemo` for `selected`, `pipelineValue`, `byStage` — replaced with direct computation and IIFE to avoid React Compiler warnings

**Fix detail sheet to display all imported data**
- Added "Deal Details" section in the detail sheet showing:
  - Buy Cost (if present)
  - Profit (value - buy_cost)
  - Quantity + Unit
  - Commission Agent ID
- Added `Package` and `Scale` icon imports
- Added `partners` prop to `DealDetail` component

**Other fixes:**
- Removed unused imports: `useMemo`, `useCallback`, `COUNTRIES`, `DEAL_STAGES`
- Added `Pagination` component imports
- Currency default changed from "EUR" to "USD" for new deals

### 3. src/app/api/tenants/route.ts

**Allow admins to see their own tenant**
- Changed from `requireSuperAdmin()` to `requireAuth()` for GET endpoint
- Super-admin sees all tenants (unchanged behavior)
- Regular admin/staff sees only their own tenant via `auth.store.getTenant(auth.tenantId)`
- POST endpoint still requires `requireSuperAdmin()` (unchanged)

### 4. src/app/api/users/route.ts

**Allow super_admin to set tenant_id**
- When `auth.isSuperAdmin && body.tenant_id`, the explicitly chosen tenant_id is preserved
- For regular admin, tenant_id is auto-set to their own tenant (unchanged behavior)
- Fixed admin count check to use the target tenant_id instead of auth.tenantId (was a bug when super_admin creates admin for a different tenant)
- Added `?tenant_id=` query parameter support for super_admins listing users in a specific tenant

## Lint Results
- All 4 modified source files pass ESLint with zero errors
- Only pre-existing errors in migration scripts (migrate-data.js, etc.) remain

## Files Modified
1. `src/components/views/users-view.tsx` — Complete rewrite
2. `src/components/views/deals-view.tsx` — Complete rewrite
3. `src/app/api/tenants/route.ts` — Modified GET handler
4. `src/app/api/users/route.ts` — Modified GET and POST handlers

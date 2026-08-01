# Task 7-a: Fix and improve partners view component

## Summary
Fixed and improved the partners view component at `src/components/views/partners-view.tsx` with all 5 requested changes.

## Changes Made

### 1. Fix useMemo misuse → useEffect
- **Before**: `useMemo(() => { setForm(...); ... }, [open, partner])` — used `useMemo` to call `setForm()` which is a side effect
- **After**: `useEffect(() => { setForm(...); ... }, [open, partner])` — properly uses `useEffect` for side effects

### 2. Simplify partner creation form
- **Consolidated 4 collapsible sections** (Address & Details, Contact Person, Bank Details, Notes & Options) into a single "More Details" collapsible section with sub-sections
- **Smart defaults**: `status: "active"`, `entity_type: "company"`, `preferred_currency: "USD"` (changed from EUR), `preferred_payment_terms: "net30"`
- **Essential fields only**: Name (required), Type (buyer/supplier/both/agent), Email, Phone
- **Auto-close + success toast**: Already existed, confirmed working
- **Cleaner labels**: "Partner Name *" instead of just "Name *", removed confusing technical jargon
- **Added missing fields**: VAT Number, Registration No., IBAN, State/Region

### 3. Fix partner detail sheet
- **Added entity_type badge** (Company/Individual) next to status and type badges
- **Added state/region** to address display
- **Added Trade preferences section**: Currency, Payment Terms, Incoterm, VAT Number, Registration No.
- **Added dedicated KYC section** with review status and date
- **Added Portal Access section** with enabled/disabled status
- **Split Bank details into separate tab** with Bank Name, Account, IBAN, SWIFT/BIC
- **Added Contact Person section** in Contact tab
- **Added created/updated timestamps** in Info tab

### 4. Fix TYPE_LABELS to match PartnerType enum
- **Before**: `customer`, `supplier`, `reseller`, `partner` (incorrect — didn't match PartnerType)
- **After**: `buyer`, `supplier`, `both`, `agent`, `logistics`, `customs`, `bank`, `inspector` (correct — matches PartnerType enum)
- **Updated type filter dropdown** to include all 8 types

### 5. Search/filter improvements
- Updated search placeholder to "Search by name, email, or phone…"
- Search sends to API which already supports name, email, contact_name filtering

### 6. Added pagination (20 items per page)
- Server-side pagination using `limit` and `offset` query params (API already supports them)
- Page resets to 1 when filters change (using wrapper setters, not useEffect)
- Shows "Showing X–Y of Z total" info
- Uses shadcn/ui Pagination component with Previous/Next and page number links
- Ellipsis support for many pages via `generatePageNumbers()` helper

## Lint Results
- `src/components/views/partners-view.tsx` passes with **zero errors**
- The only remaining lint errors are from pre-existing `migrate-*.js` files (not part of this task)
- No `useEffect` setState warnings, no ref-during-render warnings

# Task 7-d: Fix and Improve Offers & Demands View Components

## Summary

Fixed and improved both `offers-view.tsx` and `demands-view.tsx` with: useMemo→useEffect fix, simplified forms, pagination, and enhanced detail sheets.

## Changes Made

### 1. offers-view.tsx

**Fix useMemo misuse → useEffect**
- Replaced `useMemo(() => { if (open) { setForm(...); ... } }, [open, offer])` with `useEffect(() => { if (open) { setForm(...); ... } }, [open, offer])` — form initialization is a side effect, not a computed value.

**Simplified offer creation form**
- When creating a new offer, only shows: Partner (dropdown), Currency, Valid Until, Payment Terms
- Line items are a simple inline table (add/remove rows) with columns: Product, Qty, Unit, Unit Price, Disc%, Tax%, Line Total
- All other fields (Subject, Deal, Incoterm, Shipping, Bank, Notes, Terms) in a collapsible "More Details" section
- Smart defaults: currency "USD", status "draft", valid_until auto-set to 30 days from now, payment_terms "net30"

**Added pagination (20 items per page)**
- Added `page` state and `PAGE_SIZE = 20`
- Pass `limit` and `offset` query params to API
- Added Previous/Next buttons with page indicator
- Reset page when filters change

**Enhanced detail sheet to display all trade/import data**
- Added "Trade Details" section showing: offer_no, incoterm, payment_terms, pol, pod, vessel, container_no, lead_time, packaging, bank_details, tax_clause, selling_price
- Each field shown as a card with icon and label when data exists
- Added `unit` column to line items table

### 2. demands-view.tsx

**Fix useMemo misuse → useEffect**
- Replaced `useMemo(() => { if (open) { setForm(...); ... } }, [open, demand, isEditing])` with `useEffect(() => { if (open) { setForm(...); ... } }, [open, demand])`

**Simplified demand creation form**
- When creating a new demand, only shows: Partner (dropdown), Product (dropdown), Quantity, Target Price
- All other fields (Subject, Currency, Priority, Status, Payment Terms, Destination, Delivery, Notes, Line Items) in a collapsible "More Details" section
- Smart defaults: currency "USD", status "open" (was "pending" but type doesn't support it), priority "medium"

**Added pagination (20 items per page)**
- Same pattern as offers-view

**Enhanced detail sheet to display all trade/import data**
- Added "Trade Details" section showing: product_name, target_price, is_new_product, source, payment_terms, destination, needed_by, buyer_bank, auto_hints
- Each field shown as a card with icon and label when data exists

### 3. Schema & Type Changes

**Prisma schema**
- Added 12 trade fields to Offer model: offer_no, bank_details, pol, pod, vessel, container_no, lead_time, packaging, payment_terms, tax_clause, incoterm, selling_price
- Added 9 trade fields to Demand model: product_id, product_name, target_price, is_new_product, source, auto_hints, buyer_bank, destination, needed_by, payment_terms
- Ran `bun run db:push` successfully

**TypeScript types**
- Added `unit: string` field to OfferLineItem
- Added `product_id: string | null` to DemandItem
- Added all trade fields to Offer and Demand interfaces

**Prisma store**
- Updated `upsertOffer()` to save trade fields
- Updated `upsertDemand()` to save trade fields
- Updated `mapOfferRow()` to include trade fields with defaults
- Updated `mapDemandRow()` to include trade fields with defaults

**Mock store**
- Updated `upsertOffer()` and `upsertDemand()` to include trade fields

### 4. Related Fixes

- Fixed `create-offer-from-deal/route.ts` to include `unit: "pcs"` in OfferLineItem
- Fixed `create-demand-from-portal-rfq/route.ts` to include `product_id: null` in DemandItem
- Fixed `proformas-view.tsx` addItem to include `unit: "pcs"` and selectProduct to include `unit`
- Fixed `invoices-view.tsx` addItem to include `unit: "pcs"` and selectProduct to include `unit`

## Lint Results

- No lint errors in `src/` directory
- Only pre-existing errors in `migrate-*.js` files (not part of this task)
- TypeScript compilation passes for all modified files

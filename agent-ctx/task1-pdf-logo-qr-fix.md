# Task 1: Fix PDF Logo and QR Code

## Summary
Fixed two issues: (1) company logo not showing in PDFs due to unresolvable logo URLs, and (2) QR code verification page crashing when database tables don't exist.

## Changes Made

### 1. PDF Generator (`src/lib/pdf/generator.ts`)
- Added `resolveLogoUrl()` function that:
  - Handles null/undefined logo URLs → returns null
  - For full URLs (http…): extracts the Supabase Storage path and generates a signed URL (works for private buckets)
  - For relative paths (e.g. "tenant-id/logo.png"): generates a signed URL using the Supabase client
  - Falls back to constructing the public URL manually if signing fails
  - Falls back to the original URL as last resort
- Updated `generatePdf()` to call `resolveLogoUrl(tenant?.logo_url)` before passing to the template
- Added imports for `getSupabase` and `isSupabaseConfigured` from `@/lib/supabase/client`

### 2. Settings View (`src/components/views/settings-view.tsx`)
- Added `resolveLogoUrlForDisplay()` helper to construct full public URLs from relative paths on the client side
- Added `NEXT_PUBLIC_SUPABASE_URL` env variable to `.env` for client-side URL construction
- Enhanced `LogoUpload` component:
  - Larger logo preview (24x24) with dashed border
  - Hover-to-reveal "Remove Logo" button (X icon, destructive style)
  - Green status indicator when logo is set
  - File input reset after upload for re-selection
  - Better visual feedback with "No logo" placeholder
- Added `X` and `ImageIcon` to lucide-react imports

### 3. Supabase Store (`src/lib/data/supabase-store.ts`)
- Made `getDocumentVerificationByCode()` resilient: catches errors and returns null instead of throwing
- Made `getDocumentVerificationByDoc()` resilient: catches errors and returns null instead of throwing
- Made `logVerification()` more resilient: added try-catch wrapper around existing error handling
- Made `listVerificationLogs()` more resilient: added try-catch wrapper

### 4. Verify Page (`src/app/verify/[code]/page.tsx`)
- Wrapped entire verification lookup in try-catch to prevent page crashes
- Added `DocumentVerification` type import for proper typing
- Made `verification_count` access resilient with `?? 0` fallback
- Made `issued_at` display resilient with fallback to "N/A"

## Files Modified
- `/home/z/my-project/src/lib/pdf/generator.ts`
- `/home/z/my-project/src/components/views/settings-view.tsx`
- `/home/z/my-project/src/lib/data/supabase-store.ts`
- `/home/z/my-project/src/app/verify/[code]/page.tsx`
- `/home/z/my-project/.env` (added NEXT_PUBLIC_SUPABASE_URL)

## Lint Status
All changes pass ESLint checks.

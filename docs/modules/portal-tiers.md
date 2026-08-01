# Portal Tiers

## Purpose
The portal has 4 access tiers that control what a client can do, what verification they need, and what compliance requirements apply. Tiers are set by the admin when activating portal access for a partner.

## Tier Comparison

| Feature | Premium | Business | Standard | Basic |
|---------|:-------:|:--------:|:--------:|:-----:|
| **KYC full verification** | Optional | Required | Required | Required |
| **Document upload** | Optional | Required | Required | Required |
| **Geolocation tracking** | Not required | Required | Required | Required |
| **View offers** | ✅ | ✅ | ✅ | ✅ |
| **View documents** | ✅ | ✅ | ✅ | ✅ |
| **View catalog** | ✅ | ✅ | ✅ | ✅ |
| **View invoices** | ✅ | ✅ | ❌ | ❌ |
| **View company info** | ✅ | ✅ | ❌ | ❌ |
| **Submit RFQs** | ✅ | ✅ | ✅ | ❌ |
| **Download PDFs** | ✅ | ✅ | ❌ | ❌ |
| **Profile editing** | ✅ | ✅ | ✅ | ✅ |
| **KYC exemption** | ✅ | ❌ | ❌ | ❌ |
| **Document upload exemption** | ✅ | ❌ | ❌ | ❌ |
| **Location share exemption** | ✅ | ❌ | ❌ | ❌ |

## Tier Details

### Premium
**Use for:** VIP clients, long-term trusted partners, internal team members
- **KYC**: Light review only — admin can approve without full document verification
- **Documents**: Upload optional
- **Geolocation**: Not captured on login
- **Features**: Full access including PDF downloads, RFQ submission, company info
- **Badge color**: Amber (👑 Crown icon)

### Business
**Use for:** Regular paying clients who have completed full onboarding
- **KYC**: Full verification required (passport, license, etc.)
- **Documents**: Upload required
- **Geolocation**: Required on every login (re-logged every 5 minutes)
- **Features**: Full access including PDF downloads, RFQ submission, company info
- **Badge color**: Emerald (💼 Briefcase icon)

### Standard
**Use for:** New clients, trial accounts, those in onboarding
- **KYC**: Full verification required
- **Documents**: Upload required
- **Geolocation**: Required on every login
- **Features**: Can view offers/documents/catalog and submit RFQs, but **cannot download PDFs** and **cannot see invoices/company info**
- **Badge color**: Sky blue (🛡 Shield icon)

### Basic
**Use for:** Entry-level / trial / read-only clients
- **KYC**: Full verification required
- **Documents**: Upload required
- **Geolocation**: Required on every login
- **Features**: Read-only — view catalog and own offers, **no RFQ submission, no PDF download, no invoices**
- **Badge color**: Muted gray (📦 Boxes icon)

### Limited (legacy)
**Do not use for new accounts.** This is a backward-compatibility alias for `basic`. Existing rows created before the 4-tier system was introduced map to this. The platform treats them identically to Basic.

## Geolocation Behavior

For non-Premium tiers, the portal shell blocks content rendering until the browser grants geolocation permission:

1. Client logs in at `/portal/login`
2. Browser prompts: "Allow location access?"
3. If granted: lat/lng/accuracy logged to audit trail, portal content renders
4. If denied: error screen with "Reload" and "Sign out" buttons
5. Geolocation is re-captured every 5 minutes during the session

All location entries are stored in `audit_logs` with:
- latitude, longitude, accuracy
- source (browser / ip)
- IP address
- user agent
- tier (for context)
- required flag (true for non-Premium)

Premium clients: location sharing is still *asked* once, but if denied, the portal renders normally (no blocking).

## How Tiers Affect KYC Flow

| Tier | KYC submission required? | On approve | On reject | On resubmit |
|------|-------------------------|------------|-----------|-------------|
| Premium | No (but can submit voluntarily) | If submitted: auto-provision portal access with welcome email | Email sent | Email sent |
| Business / Standard / Basic | Yes | Auto-provision portal access + welcome email + set tier exemptions | Email sent with reason | Email sent with note |

## Changing Tiers

Admins can change a client's tier at any time from Partners → open partner → Portal Access section → Edit. The change takes effect immediately on next login.

## Technical Reference

- Type: `PortalTier` in `src/lib/supabase/types.ts`
- Metadata + business rules: `src/lib/portal/tiers.ts`
- Helper functions:
  - `getTierMeta(tier)` — returns full metadata
  - `tierRequiresLocation(tier)` — boolean
  - `tierRequiresKyc(tier)` — boolean
  - `normalizeTier(tier)` — maps "limited" → "basic"
- ORDERED_TIERS — array sorted from most to least privileged (Premium → Business → Standard → Basic)

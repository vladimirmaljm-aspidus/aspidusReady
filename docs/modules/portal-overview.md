# Portal Overview

## Purpose
The client portal is a separate, branded workspace where your partners (clients) can log in to view their offers, download documents, browse your product catalog, submit RFQs, and complete KYC.

## URLs
- **Login**: `/portal/login`
- **Dashboard**: `/portal/dashboard`
- **Offers**: `/portal/offers`
- **Documents**: `/portal/documents`
- **Catalog**: `/portal/catalog`
- **KYC**: `/portal/kyc`
- **Profile**: `/portal/profile`
- **RFQ**: `/portal/rfq`

## Portal Sections (by sidebar)

### Dashboard
- Welcome card with partner name + tier badge
- KPI cards: active offers, pending invoices, recent documents
- Recent offers list
- Quick links to catalog + RFQ

### My Offers
- List of offers sent to this partner
- View offer details (line items, totals, status)
- Download PDF (Premium/Business only)
- Accept/Reject (if status=sent)

### My Documents
- Shared documents (contracts, specs, invoices)
- Download (if permitted)
- Filter by category

### Product Catalog
- Grid of available products (with images, specs, origin)
- Search + category filter
- Click for detail sheet (full specifications, logistics, COA)
- "Request Quote" button (Premium/Business/Standard only)

### KYC Verification
- Status: not_submitted / draft / submitted / under_review / approved / rejected / resubmit
- If not submitted: form to fill (company info, contact, address, bank, beneficial owners, AML)
- Document upload (passport, license, certificates)
- Submit for review
- If resubmit: see admin's note, update, resubmit

### My Profile
- View company info (read-only for most fields)
- Edit contact details (email, phone)
- View tier + permissions
- Change password

### Request Quote (RFQ)
- Form: product name, description, category, quantity, unit, target price, currency
- Delivery: country, port, date, incoterm
- Specifications (free text)
- Submit → creates a PortalRfq → admin sees it in Portal RFQs module

## Portal Tier Differences

| Section | Premium | Business | Standard | Basic |
|---------|:-------:|:--------:|:--------:|:-----:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Offers | ✅ | ✅ | ✅ | ✅ (view only) |
| Documents | ✅ | ✅ | ✅ | ✅ |
| Catalog | ✅ | ✅ | ✅ | ✅ |
| KYC | Optional | Required | Required | Required |
| Profile | ✅ | ✅ | ✅ | ✅ |
| RFQ submit | ✅ | ✅ | ✅ | ❌ |
| PDF download | ✅ | ✅ | ❌ | ❌ |
| Invoices view | ✅ | ✅ | ❌ | ❌ |
| Company info | ✅ | ✅ | ❌ | ❌ |
| Geolocation | Not required | Required | Required | Required |

## Related
- [Portal Login](./portal-login.md)
- [Portal Tiers](./portal-tiers.md)
- [Portal Access](./portal-access.md) — admin manages accounts
- [KYC Review](./kyc-review.md) — admin reviews submissions
- [Portal RFQs](./portal-rfqs.md) — admin sees RFQs from portal

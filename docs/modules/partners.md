# Partners Module

## Purpose
Manage all business relationships — customers, suppliers, agents, customs brokers, banks, and inspectors. Each partner belongs to exactly one tenant and can have portal access, KYC status, commission settings, and linked deals/offers.

## Who Can Access
- **admin** — full CRUD
- **super_admin** — full CRUD across all tenants
- **manager** — read + create + update (no delete)
- **staff** — read only
- **viewer** — read only

## Key Features
- Full CRUD with search, type/status/risk filters, and pagination (20/page)
- 8 partner types: buyer, supplier, both, agent, logistics, customs, bank, inspector
- Entity types: company or individual
- KYC status tracking (not_submitted → pending → approved / rejected)
- Portal access activation with 4 tier levels
- Commission agent flag — mark a partner as someone who earns commissions
- Bank details, contact person, address, trade preferences (currency, incoterm, payment terms)
- Tags, notes, risk score (0–100)
- Partner 360° view — see everything related to one partner in one place

## Actions

### List View
| Action | What it does |
|--------|-------------|
| Search | Filter by name, email, or phone |
| Type filter | Filter by partner type (buyer/supplier/both/agent/...) |
| Status filter | Active / Inactive / Blacklisted |
| New Partner | Opens creation dialog |
| Click row | Opens detail sheet |
| Edit | Opens edit dialog |
| Delete | Removes partner (with confirmation) |
| Activate Portal | Opens portal activation dialog |

### Create/Edit Dialog
- **Essential fields** (always visible): Name (required), Type, Email, Phone
- **More Details** (collapsible): Status, Entity Type, Tax ID, VAT, Registration, Address, Contact person, Bank details, Notes, Tags, Trade preferences
- Smart defaults: status=active, entity_type=company, currency=USD, payment_terms=net30
- When editing, "More Details" auto-expands

### Detail Sheet
Shows everything about the partner in tabs:
- **Overview** — contact info, address, type badges, KYC status, portal status
- **Trade** — currency, payment terms, incoterm, VAT, registration
- **KYC** — review status, reviewer, review date
- **Portal Access** — enabled/disabled, tier, email, last login
- **Bank** — bank name, account, IBAN, SWIFT
- **Contact** — contact person details
- **Info** — created/updated timestamps

### Portal Activation Dialog
- Choose portal email (auto-filled from partner email)
- Pick tier: Premium / Business / Standard / Basic
- Tier description shown for each option
- On activation: creates PortalAccess row with status=approved, sets tier-based exemptions
- "Send invite" button sends welcome email with password-setup link

## Related Modules
- [Partner 360°](./partner-360.md) — comprehensive view
- [Deals](./deals.md) — partners are linked to deals
- [Offers](./offers.md) — partners receive offers
- [KYC Review](./kyc-review.md) — admin reviews KYC submissions
- [Portal Access](./portal-access.md) — manage portal accounts
- [Commissions](./commissions.md) — partners can be commission agents

## Common Workflows

### Onboard a new client
1. Partners → New Partner → fill name, type=buyer, email → Save
2. Open partner → Activate Portal → choose tier → Save
3. Click "Send invite" → client receives welcome email with setup link
4. Client sets password at /portal/login?access_id=...
5. Client logs in, completes KYC (if required by tier)
6. Admin reviews KYC → approve → partner record auto-updated

### Activate portal for existing partner
1. Open partner detail sheet
2. Click "Activate Portal"
3. Confirm email, pick tier (Premium for VIP, Business for regular, Standard/Basic for others)
4. Save → partner gets welcome email
5. (For non-Premium) Partner must complete KYC + share geolocation on login

## Tips
- Premium tier clients skip KYC, document upload, and geolocation — use for trusted VIPs
- "is_commissioner" flag is auto-set when you create a commission agent from this partner
- Tags are free-form — use them for segmentation (e.g. "VIP", "New", "Strategic")
- Risk score 0–30 = low (green), 31–60 = medium (amber), 61+ = high (red)

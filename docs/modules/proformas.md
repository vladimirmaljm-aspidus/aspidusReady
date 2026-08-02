# Proformas Module

## Purpose
Proforma invoices — preliminary documents sent before the actual invoice. Same structure as invoices but with "PROFORMA" watermark and no accounting impact.

## Key Features
- Same line item editor as invoices
- Status: draft → sent → paid / expired
- Issue date + valid until
- PDF generation with PROFORMA watermark
- Email to partner
- Convert to invoice (when deal closes)
- Link to offer

## Actions
| Action | What it does |
|--------|-------------|
| New Proforma | Opens creation dialog |
| Edit | Opens edit dialog |
| Send | Emails proforma to partner with PDF |
| Download PDF | Generates and downloads PDF |
| Convert to Invoice | Creates a real invoice from the proforma |
| Mark as Paid | Sets status=paid (record keeping only — no accounting impact) |

## Tips
- Proformas are NOT accounting documents — they don't post to ERP
- Use proformas when a client needs a document for import permits, advance payment, or LC opening
- Once the deal closes, convert the proforma to a real invoice
- Proforma numbers can differ from invoice numbers (e.g. PF-2026-001 vs INV-2026-001)

# Offers Module

## Purpose
Create and manage commercial offers (quotes) sent to partners. Includes line items, auto-total calculation, PDF generation, and email sending.

## Key Features
- Line item editor: product, qty, unit, unit price, discount %, tax %, line total
- Auto-calculation: subtotal, discount total, tax total, grand total
- Status workflow: draft → sent → accepted / rejected / expired
- Trade/import fields: offer_no, incoterm, payment_terms, POL, POD, vessel, container_no, lead_time, packaging, bank_details, tax_clause, selling_price
- PDF generation with QR verification code
- Email offer to partner (with PDF attachment)
- Convert to invoice or proforma
- Link to deal

## Actions
| Action | What it does |
|--------|-------------|
| New Offer | Opens creation dialog |
| Edit | Opens edit dialog |
| Delete | Removes offer |
| Send | Emails offer to partner with PDF |
| Download PDF | Generates and downloads PDF |
| Convert to Invoice | Creates invoice from offer |
| Convert to Proforma | Creates proforma from offer |
| Accept / Reject | Sets status (after partner response) |

## Offer Create Dialog
- **Essential**: Partner (dropdown), Currency, Valid until, Payment terms
- **Line items**: inline table (add/remove rows)
- **More Details** (collapsible): Subject, Deal, Incoterm, Shipping (POL/POD/vessel/container), Bank details, Notes, Terms, Tax clause, Selling price

## Tips
- Offer number auto-generates (e.g. "1/2026") — don't change unless you have a custom numbering scheme
- "Send" emails the partner with the PDF attached — only do this when the offer is final
- QR code on the PDF links to /verify/[code] for authenticity checking
- Set Valid until (default 30 days) — expired offers show a warning

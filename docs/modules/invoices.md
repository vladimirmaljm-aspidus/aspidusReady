# Invoices Module

## Purpose
Create and manage customer invoices. Generated from offers or created standalone. PDF generation + email + payment tracking.

## Key Features
- Line item editor (same as offers)
- Status: draft → sent → paid / overdue / cancelled
- Issue date + due date (auto-calculated from payment terms)
- PDF generation with QR verification
- Email invoice to partner
- Mark as paid (with payment date + reference)
- Auto-post to ERP (journal entry) if auto_post_journal enabled
- Link to offer

## Actions
| Action | What it does |
|--------|-------------|
| New Invoice | Opens creation dialog |
| Edit | Opens edit dialog |
| Delete | Removes invoice |
| Send | Emails invoice to partner with PDF |
| Download PDF | Generates and downloads PDF |
| Mark as Paid | Sets status=paid, records payment date |
| Cancel | Sets status=cancelled |
| Post to ERP | Creates journal entry (if not auto-posted) |

## Tips
- Due date auto-calculated from payment terms (Net 7/15/30/60) — override manually if needed
- "Overdue" status is auto-set when due_date < today and status=sent
- Posting to ERP creates a journal entry: debit AR, credit Revenue + VAT
- Paid invoices cannot be edited — cancel and create a credit note instead

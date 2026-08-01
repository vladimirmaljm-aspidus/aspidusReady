# Document Verification Module

## Purpose
Public QR code verification — anyone with a PDF can scan the QR code to verify authenticity.

## How It Works
1. When a PDF is generated (offer/invoice/proforma), a verification code + SHA-256 hash is created
2. QR code embedded in the PDF links to /verify/[code]
3. Visitor scans QR → visits /verify/[code]
4. System looks up the code → shows: valid / revoked / superseded / invalid
5. Verification attempt is logged (IP, user agent, timestamp)

## Status Meanings
- **valid**: document is authentic and current
- **revoked**: issuer has revoked the document
- **superseded**: a newer version exists
- **invalid**: code not found (possible fraud)

## Admin View
- List all verifications (filter by status, document type)
- See verification count + last verified time
- Revoke a verification (marks document as revoked)
- View verification logs (who scanned, when, from where)

## Tips
- The QR code is tamper-proof — it links to our servers, not the PDF itself
- SHA-256 hash detects any modification to the PDF
- Use this to prove to banks/customers that a document is genuine

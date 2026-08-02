# Portal RFQs Module

## Purpose
RFQs submitted by portal clients. Admin reviews and converts to demands or offers.

## Key Features
- List all RFQs from portal clients (filter by status, partner)
- Status: new / reviewing / quoted / closed
- Fields: partner, product name, description, category, quantity, unit, target price, currency, delivery country/port/date, incoterm, specifications, notes
- Convert to Demand (creates a demand in the CRM)
- Convert to Offer (creates an offer directly)
- Admin notes (internal)
- Link to resulting demand/offer

## Workflow
1. Client submits RFQ via portal → status=new
2. Admin reviews → status=reviewing
3. Admin converts to demand (for tracking) OR directly creates offer
4. Admin sends offer → status=quoted
5. Client accepts/rejects → status=closed

## Tips
- "New" RFQs need attention — they appear as a notification badge
- Convert to Demand first if you need to source the product, then create the offer
- Admin notes are internal — clients don't see them

# Demands Module (RFQ)

## Purpose
Track inbound Requests for Quote (RFQ) from clients. Convert to offers when ready.

## Key Features
- Status: open → quoted → closed
- Priority: low / medium / high
- Link to partner + product
- Line items (multiple products per demand)
- Trade fields: target_price, is_new_product, source, payment_terms, destination, needed_by, buyer_bank
- Convert to offer (creates offer with demand's items)

## Actions
| Action | What it does |
|--------|-------------|
| New Demand | Opens creation dialog |
| Edit | Opens edit dialog |
| Delete | Removes demand |
| Convert to Offer | Creates offer from demand |
| Mark as Quoted | Sets status=quoted (after sending offer) |
| Close | Sets status=closed |

## Tips
- Demands can come from the portal (clients submit RFQs) or be created manually by staff
- "Target price" is what the client wants to pay — use it to guide your offer
- "Is new product" flag indicates this product isn't in your catalog yet

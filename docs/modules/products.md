# Products Module

## Purpose
Internal product master — items you sell or trade. Used in deals, offers, invoices. Distinct from Product Catalog (which is the client-facing catalog shown in the portal).

## Key Features
- CRUD with search, category filter, pagination (20/page)
- Fields: SKU (auto-generate from name), name, description, category, unit, price, currency, cost, stock, reorder level, active
- Auto-generate SKU from name (e.g. "Cocoa Beans" → "COCOA-BEANS-001")
- Low-stock warnings (stock ≤ reorder level)
- Attributes JSON (free-form key-value pairs for extra fields)
- Import from old system (preserves hs_code, brand, shelf_life, etc.)

## Actions
| Action | What it does |
|--------|-------------|
| New Product | Opens creation dialog |
| Edit | Opens edit dialog |
| Delete | Removes product |
| Auto-gen SKU | Generates SKU from name |

## Tips
- SKU is auto-generated but editable — change it to match your existing numbering
- Stock is manual — for automatic tracking, use the Inventory module
- Set reorder level to get low-stock alerts on the dashboard
- Attributes JSON can store anything: hs_code, brand, shelf_life, image_url, tags, etc.

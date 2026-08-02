# Product Catalog Module

## Purpose
Client-facing product catalog shown in the portal. Each entry has full specifications, origin country, HS code, images, and detailed descriptions. This is what portal clients browse.

## Key Features
- CRUD with search, category filter, pagination (20/page)
- Fields: name, category, HS code, base unit, origin country, description, active
- **Specifications**: array of {name, value} pairs (e.g. Moisture: 6% Max, Admixture: 0.2% Max)
- **Images**: multiple image URLs
- **Detailed spec**: long-form text (lab analysis, phytosanitary, packaging, logistics)
- **Tags**: e.g. "New Crop", "Premium", "Organic"
- **Logistics**: 20ft/40ft container capacity
- **Inventory**: batches with expiry dates

## Portal Visibility
- Portal clients see catalog entries marked `active=true`
- Each partner can have `portal_visible_products` filter (specific products only)
- Premium/Business/Standard/Basic tiers all see the catalog
- Specifications display in both card grid and detail sheet

## Actions
| Action | What it does |
|--------|-------------|
| New Entry | Opens creation dialog |
| Edit | Opens edit dialog |
| Delete | Removes entry |
| Set active/inactive | Toggles portal visibility |

## Tips
- Specifications support both array format [{name, value}] and Record format {key: value} — the portal normalizes both
- Use the detailed_spec field for long-form analysis (lab results, packaging standards)
- Set active=false to hide from portal without deleting
- HS code helps with customs documentation

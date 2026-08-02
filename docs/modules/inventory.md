# Inventory Module

## Purpose
Track stock movements (in/out) per product per warehouse. Real-time stock levels.

## Key Features
- List all movements (filter by product, partner, type, date)
- Record movement: product, partner, type (in/out/adjustment), quantity, notes
- Stock level = sum of all movements for a product
- Low-stock alerts (stock ≤ reorder level)

## Movement Types
- **in**: goods received (purchase)
- **out**: goods shipped (sale)
- **adjustment**: correction (damage, loss, recount)

## Tips
- Stock is calculated from movements — don't edit the product's stock field directly
- Use "adjustment" type for corrections with a note explaining why
- Each movement is audit-logged

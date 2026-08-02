# Supplier Offers Module

## Purpose
Track offers from your suppliers (what you can buy). Used in trade calculations to compute landed cost.

## Key Features
- CRUD with search, filter by supplier, status
- Fields: supplier (partner), product (catalog entry), price, currency, min quantity, available quantity, valid until, specifications
- Status: active / expired / on_hold / consumed
- Link to product catalog entry
- Used by Trade Calculator for landed cost computation

## Tips
- Set valid_until — expired offers show a warning
- "Consumed" status means you've used this offer for a deal
- Use multiple supplier offers per product to compare prices in Trade Calculator

# Trade Calculator Module

## Purpose
Compute landed cost for import/export deals. Combine supplier offer + logistics + customs + margins to get the final cost per unit.

## Key Features
- Select product + supplier offer
- Enter: origin country, destination country, unit price, currency, quantity, incoterm
- Add cost components: freight, insurance, customs duty, VAT, handling, inland freight
- Auto-calculate: total cost, cost per unit, suggested selling price, margin %
- Save calculation for future reference
- Link to a deal

## Calculation
- Total cost = unit price × quantity + all cost components
- Cost per unit = total cost / quantity
- Margin = (selling price - cost per unit) / cost per unit × 100
- Suggested selling price = cost per unit × (1 + target margin / 100)

## Tips
- Save calculations to compare different suppliers or scenarios
- Use the incoterm to determine who pays for freight/insurance
- Customs duty is usually a % of CIF value (cost + insurance + freight)

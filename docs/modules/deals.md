# Deals Module (Pipeline)

## Purpose
Sales pipeline — track opportunities from lead to won/lost. Kanban + table view, 6 stages, commission linking.

## Stages
`lead → qualified → proposal → negotiation → won | lost`

## Key Features
- **2 views**: Kanban (drag-and-drop) and Table
- 6 stages with stage colors and auto-probability
- Link to partner, owner, commission agent
- Value + currency + buy_cost (for profit calculation)
- Quantity + unit
- Expected close date, probability %
- Lost reason (when stage=lost)
- Line items (optional)
- Commission linking (assign agent + auto-calculate)

## Actions
| Action | What it does |
|--------|-------------|
| New Deal | Opens creation dialog |
| Drag card | Changes stage (Kanban view) |
| Click card | Opens detail sheet |
| Edit | Opens edit dialog |
| Delete | Removes deal |
| Convert to Offer | Creates an offer from the deal |

## Deal Create Dialog
- **Essential**: Title (required), Partner (dropdown), Stage, Value, Currency
- **More Details** (collapsible): Probability, Expected close, Buy cost, Quantity, Unit, Description, Commission agent

## Tips
- Probability auto-sets based on stage (lead=10, qualified=20, proposal=50, negotiation=75, won=100, lost=0)
- Buy cost is used to calculate profit → drives commission calculations
- Won deals with buy_cost=0 have profit=full value — set buy_cost for accurate commissions

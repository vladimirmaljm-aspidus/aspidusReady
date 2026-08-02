# Dashboard Module

## Purpose
The landing page after admin login. Shows KPIs, charts, and recent activity for the current tenant.

## Key Features
- **KPI cards**: partners total/active, deals open, deals won value, pipeline value, offers pending, low stock count, invoices outstanding, inventory movements (30d)
- **Deals by stage** — bar chart showing count + value per stage (lead, qualified, proposal, negotiation, won, lost)
- **Offers last 30 days** — line chart of daily offer count
- **Revenue last 30 days** — line chart of daily revenue
- **Recent activity** — last 10 audit log entries
- **Top partners** — top 5 by deal value
- **Low stock products** — products at or below reorder level

## Actions
| Action | What it does |
|--------|-------------|
| Click KPI card | Navigates to the related module |
| Click chart bar | (Future) drill-down to filtered list |
| Click activity row | Navigates to the related entity |
| Refresh | Auto-refreshes every 60s (configurable in Preferences) |

## Tips
- Dashboard data is tenant-scoped — super_admin sees the active tenant's data
- Use the global search (top bar) to quickly find any entity
- Set your default landing view in Settings → Preferences

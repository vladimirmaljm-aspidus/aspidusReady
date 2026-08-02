# Commissions Module

## Purpose
Track commission agents (people/firms who earn from deals they introduce), calculate commissions per deal, approve them, and process payouts. Fully integrated with the Deals and Partners modules.

## Who Can Access
- **admin / super_admin** — full CRUD + approve + payout
- **manager** — read + create + update (no approve/payout)
- **staff / viewer** — read only

## Key Features
- **3 tabs**: Agents, Commissions, Payouts
- 5 commission types: % of profit, % of revenue, fixed amount, per unit, custom formula
- Auto-calculation based on deal value, profit, quantity, and agent rate
- Approval workflow: pending → approved → paid (or cancelled)
- Payouts bundle multiple commissions into one payment
- Summary cards: total pending, approved, paid, agent count
- Filter by status, agent, date range

## Actions

### Agents Tab
| Action | What it does |
|--------|-------------|
| New Agent | Opens creation dialog |
| Search | Filter by partner name |
| Click row | Opens detail sheet |
| Edit | Opens edit dialog |
| Delete | Removes agent (commissions remain for audit) |

#### Agent Create/Edit Dialog
- **Partner** (required) — select from existing partners
- **Commission type** — profit_percent / revenue_percent / fixed / per_unit / custom
- **Rate** — percentage (e.g. 5 = 5%) or fixed amount
- **Per unit amount** — shown only when type = per_unit
- **Custom formula** — shown only when type = custom
- **Currency** — USD, EUR, RSD, AED, etc.
- **Is default** — auto-apply to new deals with this partner
- **Active** — toggle
- **Notes**

When you create an agent, the partner's `is_commissioner` flag is automatically set to true.

### Commissions Tab
| Action | What it does |
|--------|-------------|
| New Commission | Opens creation dialog (links a deal to an agent) |
| Filter by status | Pending / Approved / Paid / Cancelled |
| Filter by agent | Show only one agent's commissions |
| Approve | Mark as approved (admin only) |
| Mark paid | Include in a payout |
| Cancel | Cancel commission |
| Delete | Remove (admin only) |

#### Commission Create Dialog
- **Agent** (required) — select
- **Deal** (required) — select
- **Commission type / rate / currency** — auto-filled from agent, editable
- **Deal value / profit / quantity** — auto-filled from deal, editable
- **Preview** — auto-calculated commission amount (updates live as you type)
- Save → commission created with status=pending

### Payouts Tab
| Action | What it does |
|--------|-------------|
| New Payout | Bundle approved commissions into one payment |
| Search | Filter by agent or reference |
| Click row | Opens detail sheet showing all included commissions |
| Mark completed | Marks payout as completed, all included commissions → paid |
| Cancel | Cancels payout |

#### Payout Create Dialog
- **Agent** (required) — select
- **Commissions** — multi-select of approved commissions for this agent
- **Total amount** — auto-sum of selected commissions
- **Currency** — auto from agent
- **Payment method** — bank / cash / check / other
- **Payment reference** — optional (e.g. check number, transaction ID)
- **Payment date**
- **Status** — pending / completed / cancelled
- **Notes**

## Commission Calculation Formula

| Type | Formula |
|------|---------|
| profit_percent | `deal_profit × rate / 100` |
| revenue_percent | `deal_value × rate / 100` |
| fixed | `rate` (flat amount) |
| per_unit | `deal_quantity × per_unit_amount` |
| custom | Manual — admin enters calculated amount |

## Related Modules
- [Deals](./deals.md) — commissions link to deals
- [Partners](./partners.md) — agents are partners with is_commissioner=true
- [ERP](./erp.md) — paid commissions auto-post as journal entries (if auto_post_journal enabled)

## Common Workflows

### Set up a commission agent
1. Ensure the agent exists as a Partner first (type=agent or both)
2. Commissions → Agents tab → New Agent
3. Select partner, set type (e.g. % of profit), rate (e.g. 5%), currency
4. Save → partner's is_commissioner flag auto-set

### Add commission to a deal
1. Commissions → Commissions tab → New Commission
2. Select agent → select deal → rate auto-fills from agent
3. Deal value/profit/quantity auto-fill from deal
4. Preview shows calculated amount → Save
5. Commission created with status=pending

### Process a payout
1. Approve all commissions to include (status must be "approved")
2. Commissions → Payouts tab → New Payout
3. Select agent → select approved commissions → total auto-sums
4. Add payment method + reference → Save with status=completed
5. All included commissions auto-marked as paid

## Tips
- The "Default" flag on agents auto-applies them to new deals — use for your main agents
- Commissions can't be deleted once paid (audit trail) — cancel instead
- Custom formula type lets you override the calculated amount manually
- Currency defaults to the agent's currency but can be overridden per commission

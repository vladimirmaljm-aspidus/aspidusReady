# Audit Log Module

## Purpose
Every action in the system is logged — who did what, when, from which IP, with what details. Immutable trail for compliance and troubleshooting.

## Key Features
- List all actions (filter by user, action type, entity, date range)
- Search by username, action, entity_id
- Pagination (50/page)
- Export to CSV (future)
- Location logs (portal clients' geolocation pings)

## Logged Actions
- **Auth**: login, logout, failed_login
- **CRUD**: create, update, delete for every entity type
- **Status changes**: approve, reject, resubmit, suspend, revoke
- **Email**: send, invite, test_smtp
- **Portal**: portal.location (geolocation ping), portal.invite
- **ERP**: erp.initialize, journal.post, journal.reverse
- **Commissions**: commission_agent.create, deal_commission.create, commission.approve

## Entry Structure
- user_id, username, tenant_id
- action (e.g. "partner.create")
- entity_type, entity_id
- details (JSON — e.g. {name: "Acme Corp", type: "buyer"})
- ip, user_agent
- created_at

## Tips
- Audit logs cannot be deleted (immutable)
- Portal location pings appear here with action="portal.location"
- Super_admin can see all tenants' logs; regular admin sees only their tenant
- Use the search to find "what happened to this partner" — search by entity_id

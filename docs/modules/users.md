# Users & Permissions Module

## Purpose
Manage internal team members who can access the admin CRM (not the client portal). Each user belongs to a tenant and has a role that determines their permissions.

## Who Can Access
- **super_admin** — can manage users across all tenants, assign users to any tenant
- **admin** — can manage users in their own tenant only

## Roles

| Role | Description | Default Permissions |
|------|-------------|---------------------|
| **super_admin** | Platform owner — sees all tenants | `*` (everything) |
| **admin** | Tenant administrator — full access within tenant | `*` (everything in tenant) |
| **accountant** | Finance team — ERP + invoices + commissions | `erp.*, invoices.*, proformas.*, commissions.*` |
| **manager** | Sales manager — CRUD on CRM entities | `partners.*, deals.*, offers.*, demands.*, documents.*` |
| **staff** | Regular employee — read + create + update | `partners.read, partners.create, partners.update, deals.read, ...` |
| **viewer** | Read-only access | `*.read` for all modules |

## Key Features
- Create / edit / deactivate / delete users
- Auto-generate username from email, or enter manually
- Auto-generate secure password (10 chars), or enter manually
- Show password once on creation (copy it!)
- Assign user to a tenant (super_admin only)
- Set custom permissions via checkbox tree (overrides role defaults)
- Activate / deactivate users (deactivated users cannot sign in)
- Last login tracking (time + IP)

## Actions

### User List
| Action | What it does |
|--------|-------------|
| New User | Opens creation dialog |
| Search | Filter by name, email, username |
| Filter by role | All / admin / manager / staff / viewer |
| Click row | Opens edit dialog |
| Edit | Change name, email, role, tenant, password, active state, permissions |
| Deactivate | Sets active=false (user cannot sign in) |
| Delete | Permanently removes user |

### Create User Dialog
**Essential fields:**
- Full Name (required)
- Email (required, must be unique)
- Role (dropdown: super_admin / admin / accountant / manager / staff / viewer)
- Tenant (super_admin sees all tenants; regular admin sees only their own)
- Password — auto-generated with "Generate" button, or type your own

**Advanced settings (collapsible):**
- Username (auto-generated from email, editable)
- Active toggle (default: on)
- Custom permissions — checkbox tree (see below)

On creation:
- Password shown once in a green banner with copy button
- Toast: "User created successfully!" (no password in toast)

### Custom Permissions Tree

The permission tree shows 22 modules, each expandable to show its actions:

**Modules**: partners, products, deals, offers, demands, invoices, proformas, documents, tasks, inventory, vault, portal, kyc, users, tenants, audit, settings, reports, erp, commissions, webhooks, api_keys, mail

**Actions per module** (varies): read, create, update, delete, export, send, pdf, approve, post, reverse, etc.

**Top bar:**
- "Full access" checkbox — sets `*` (all permissions)
- "Select all" — checks every action in every module
- "Clear" — unchecks everything
- "Reset to role defaults" — clears custom permissions, falls back to role defaults

**Per module:**
- Checkbox with indeterminate state (when some actions selected)
- Badge showing X/Y actions selected
- Click to expand/collapse action list

## How Permissions Work

1. If `permissions` is null/empty → use role defaults
2. If `permissions` is set → those permissions override the role
3. Permission format: `module.action` (e.g. `partners.read`), `module.*` (all actions in module), or `*` (everything)
4. Checked at runtime by `hasPermission(permissions, "module:action")`

## Related Modules
- [Tenants](./tenants.md) — users belong to tenants
- [Audit Log](./audit.md) — all user actions logged
- [Security](./security.md) — sessions, login history, IP allowlist

## Common Workflows

### Add a new sales rep
1. Users → New User
2. Full Name: "Marko Petrović", Email: marko@company.com
3. Role: staff (read + create + update, no delete)
4. Tenant: auto-filled with your tenant
5. Password: click "Generate" → copy it
6. Create User → give password to Marko
7. Marko logs in, can change password in Profile (future) or via Settings

### Give a user custom permissions
1. Users → find user → Edit
2. Expand "Advanced settings"
3. In the permission tree, check specific modules/actions:
   - e.g. check `partners.read`, `partners.create`, `partners.update`
   - but NOT `partners.delete`
4. Save → user now has exactly those permissions (role defaults no longer apply)

### Deactivate a departing employee
1. Users → find user → Edit
2. Toggle "Active" to off
3. Save → user cannot sign in
4. (Their data remains; audit trail preserved)

## Tips
- Use roles for 95% of users — only set custom permissions for special cases
- Super_admin can assign users to any tenant; regular admin can only manage their own tenant
- Deactivating is reversible; deleting is permanent (audit trail preserved either way)
- The password is shown ONCE on creation — if you lose it, set a new one via Edit

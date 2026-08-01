# Tenants Module

## Purpose
Super-admin only — manage the companies (tenants) that use the platform. Each tenant is an isolated workspace.

## Key Features
- List all tenants
- Create / edit / suspend / delete tenants
- Set plan (trial / starter / business / enterprise), max users, status
- Configure branding (logo, primary color)
- Set bank details (for invoices)
- View tenant stats (users, partners, deals, offers, invoices)

## Actions
| Action | What it does |
|--------|-------------|
| New Tenant | Opens creation dialog |
| Edit | Opens edit dialog |
| Suspend | Sets status=suspended (all users locked out) |
| Delete | Permanently removes tenant + all data |
| Upload Logo | Sets tenant logo (shown in portal + PDFs) |

## Tips
- Only super_admin can access this module
- Suspending a tenant locks out all its users but preserves data
- Deleting a tenant cascades to all related data (partners, deals, etc.)
- Each tenant's data is isolated — they cannot see each other's data

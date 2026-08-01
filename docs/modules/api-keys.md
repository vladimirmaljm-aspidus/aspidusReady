# API Keys Module

## Purpose
Create programmatic API keys for external integrations. Keys are tenant-scoped and can have granular permissions.

## Key Features
- Create keys with name + permissions
- Key format: `asp_` + 48 hex chars
- Permissions: same as user permissions (module.action, module.*, *)
- Hash stored (SHA-256) — full key shown ONCE on creation
- Prefix stored (first 12 chars) for identification
- Expiration date (optional)
- Active/inactive toggle
- Last used tracking (timestamp + IP)

## Actions
| Action | What it does |
|--------|-------------|
| New Key | Opens creation dialog (name + permissions) |
| Test | Tests the key against /api/api-keys/test |
| Deactivate | Sets active=false (key stops working) |
| Delete | Permanently removes key |

## Usage
```
curl -H "Authorization: Bearer asp_xxx" https://aspidus.onrender.com/api/partners
```

## Tips
- Copy the full key on creation — you cannot see it again
- Use specific permissions (partners.read) rather than * for security
- Set expiration dates for temporary integrations
- The test endpoint shows what permissions the key has + data access

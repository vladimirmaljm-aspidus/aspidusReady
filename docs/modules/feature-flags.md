# Feature Flags Module

## Purpose
Super-admin only — enable/disable platform modules per tenant. Useful for tiered pricing or gradual rollouts.

## Toggleable Modules
- CRM (partners, deals, offers, demands)
- Trade (product catalog, supplier offers, trade calculator)
- Finance (invoices, proformas)
- Inventory
- Portal (client portal)
- KYC verification
- Document templates
- Document register
- Commissions
- ERP / Accounting
- API integrations
- Custom dashboards
- Audit log
- Mail queue
- Webhooks
- Vault

## Tips
- Disabling a module hides it from the sidebar for that tenant
- Existing data is preserved when a module is disabled — just hidden
- Use this for tiered pricing: starter plan = CRM only, business = +Finance+Trade, enterprise = all

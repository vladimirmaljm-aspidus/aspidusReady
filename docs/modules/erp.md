# ERP / Accounting Module

## Purpose
Full double-entry accounting system — chart of accounts, journal entries, fiscal periods, bank reconciliation, and financial reports.

## Key Features
- **Chart of Accounts**: EU or UAE standard templates (26 accounts each)
- **Journal Entries**: manual + auto-generated from invoices/deals/commissions
- **Fiscal Periods**: open / close periods (closed periods block new entries)
- **Cost Centers**: track departments / projects
- **Bank Accounts**: reconcile bank transactions with journal entries
- **Reports**: Trial Balance, Balance Sheet, Profit & Loss, General Ledger
- **Settings**: accounting standard, fiscal year, VAT rate, auto-post toggle

## Sub-tabs

### Accounts
- List all accounts (filter by type: asset / liability / equity / revenue / expense)
- Create / edit / deactivate
- System accounts (marked) cannot be deleted
- Initialize EU or UAE standard chart with one click

### Journal Entries
- List all entries (filter by period, status, account)
- Create manual entry (debit/credit lines must balance)
- Post entry (draft → posted)
- Reverse entry (creates a counter-entry)
- Auto-generated entries (from invoices/deals) are linked to their source

### Fiscal Periods
- Create periods (monthly / quarterly / yearly)
- Close period (blocks new entries — used for month-end close)
- Reopen period (admin only)

### Cost Centers
- Create / edit / delete
- Assign to journal lines for departmental tracking

### Bank Accounts
- Register bank accounts (number, currency, balance)
- Import bank transactions (CSV)
- Reconcile transactions with journal entries

### Reports
- **Trial Balance**: all accounts with debit/credit balances as of a date
- **Balance Sheet**: assets = liabilities + equity
- **Profit & Loss**: revenue - expenses for a period
- **General Ledger**: all journal entries for an account

### Settings
- Accounting standard (EU / UAE / custom)
- Fiscal year start/end
- Default currency
- VAT enabled + rate
- Auto-post journal entries (from invoices/deals)
- Default account IDs (revenue, expense, AR, AP, VAT, cash, bank)

## Actions

### Initialize Chart of Accounts
1. ERP → Settings → click "Initialize EU Standard" or "Initialize UAE Standard"
2. Creates 26 default accounts (Share Capital, AR, AP, Sales Revenue, COGS, etc.)
3. Creates default ERP settings (VAT rate, fiscal year, default account IDs)
4. Once initialized, you can add custom accounts

### Create Journal Entry
1. ERP → Journal Entries → New Entry
2. Enter date, reference, description
3. Add lines: select account, enter debit OR credit (must balance)
4. Optionally assign cost center
5. Save as draft → Post when ready

### Close a Fiscal Period
1. ERP → Fiscal Periods → find the period
2. Click "Close" → confirm
3. No new entries can be posted to this period
4. To reopen: click "Reopen" (admin only)

## Tips
- Initialize the chart of accounts BEFORE creating any invoices (so auto-post works)
- Auto-post creates entries when invoices are sent, deals are won, commissions are paid
- Closed periods are a hard lock — even admins can't post to them (reopen first)
- Bank reconciliation matches transactions to journal entries by amount + date
- The Trial Balance is the best starting point — if debits ≠ credits, something is wrong

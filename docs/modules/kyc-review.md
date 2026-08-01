# KYC Review Module

## Purpose
Admin reviews Know-Your-Customer submissions from portal clients. On approval, KYC data is auto-transferred to the partner record and a portal account is auto-provisioned with a welcome email.

## Who Can Access
- **admin / super_admin** only

## Key Features
- **List view** with filters: all / draft / submitted / under_review / approved / rejected / resubmit
- **KPI cards**: counts by status
- **Detail dialog** (full-screen) with tabs:
  - Company info (legal name, registration, tax ID, VAT)
  - Contact (name, email, phone, position)
  - Address
  - Beneficial owners / directors
  - Bank details
  - Documents (passport, license, certificates — preview + download)
  - AML check (PEP, sanctions, dual-use, litigation)
  - Source of funds, expected monthly volume, business activity
  - Review notes (editable)
- **3 action buttons**: Request update / Reject / Approve & Transfer

## Actions

### Approve & Transfer (automated chain)
1. Updates submission status → "approved"
2. Auto-transfers all KYC data to the partner record:
   - Name ← legal_name
   - Tax ID, VAT, registration number
   - Address, city, state, postal code, country
   - Contact name/email/phone
   - Bank details
   - Full KYC blob stored in `kyc_data`
3. Sends "KYC Approved" email to the client
4. Auto-provisions PortalAccess row (status=invited) if none exists
5. Sets tier-based exemptions (Premium skips KYC/docs/location)
6. Sends portal welcome email with password-setup link
7. Audit log entry created

### Reject
1. Updates submission status → "rejected"
2. Stores rejection reason
3. Sends "KYC Rejected" email with reason to client
4. Audit log entry created

### Request update (resubmit)
1. Updates submission status → "resubmit"
2. Stores admin note
3. Sends "KYC Update Required" email with the note to client
4. Client logs into portal, sees what needs updating, resubmits
5. Status returns to "submitted" for next review cycle

## Related Modules
- [Partners](./partners.md) — KYC data transfers here on approval
- [Portal Access](./portal-access.md) — auto-provisioned on approval
- [Email Templates](./email-templates.md) — KYC status emails
- [Audit Log](./audit.md) — all KYC actions logged

## Common Workflows

### Review and approve a KYC submission
1. KYC Review → open the "submitted" tab → click a submission
2. Review all tabs: company info, contact, documents, AML
3. Verify documents (passport, license) by opening them
4. If everything is OK → click "Approve & Transfer"
5. Confirmation toast: "Approved — partner updated, portal access auto-provisioned, welcome email sent"
6. Partner record now has full KYC data, portal account is active, client received 2 emails (KYC approved + portal welcome)

### Request more information
1. Open submission → review
2. Find what's missing (e.g. passport blurry)
3. Click "Request update" → enter note: "Please re-upload passport — current scan is blurry"
4. Client receives email with the note → logs into portal → updates → resubmits
5. You'll see the submission back in "submitted" tab

## Tips
- Premium tier clients don't need full KYC — you can approve with minimal review
- The AML check fields (PEP, sanctions) are self-declared by the client — verify externally for high-risk clients
- Documents are stored in Supabase Storage — preview them by clicking the eye icon
- All 3 actions (approve/reject/resubmit) send an email and create an audit log entry

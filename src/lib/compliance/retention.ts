// src/lib/compliance/retention.ts
// ----------------------------------------------------------------------------
// PII data retention policy (audit finding B-1 / P3-1 — GDPR Article 12/13
// transparency + Article 5(1)(e) storage-limitation principle).
//
// The platform persists PII across many tables — core account PII (users,
// partners, portal_access), regulatory-required records (kyc_submissions,
// audit_logs), and operational/transient data (sessions, login_history,
// password_resets, rate_limits, mail_queue, notifications). Without an
// explicit retention policy, ALL of this data is kept forever — which is
// both a GDPR violation (storage-limitation) and a DB-cost / table-bloat
// problem (high-churn tables like rate_limits and mail_queue would grow
// without bound).
//
// This module is the single source of truth for retention periods. It is:
//   • Consumed by the cron route `src/app/api/cron/data-retention/route.ts`
//     which executes the actual DELETEs (so the policy is enforceable, not
//     just documentation).
//   • Consumed by the privacy policy / help pages (future — for now the
//     human-readable `description` field below is the documentation).
//   • Referenced by `countTenantDependencies` (no — that counts current
//     rows, not retention) — but could be surfaced in a future "data
//     inventory" admin view.
//
// DESIGN NOTES
//   • Users / partners / portal_access PII are kept for the LIFETIME OF THE
//     ACCOUNT (indefinite). GDPR allows this when the data is needed to
//     fulfil the contract (Art. 6(1)(b)) — the user can still request
//     erasure (Art. 17) which triggers the anonymise-on-delete cascade
//     (migration 030). What this policy DOES enforce for those tables is
//     a post-deactivation retention: e.g. portal_access rows that were
//     soft-deleted more than 2 years ago can be hard-deleted, because they
//     are no longer needed for fraud/abuse investigations (which typically
//     wrap up within 2 years). KYC submissions are a regulatory record
//     (5-year minimum under most AML/KYC regimes — EU 5AMLD Art. 40),
//     audit_logs are a 7-year SOX-style record. These are NOT auto-deleted
//     by the cron; they are listed here for transparency and to make the
//     policy machine-readable for a future data-retention-report tool.
//   • Sessions / password_resets / rate_limits are SHORT-LIVED operational
//     data — already swept by migrations 013 + 024. The cron route here
//     repeats the DELETEs so there is a single retention-cleanup job that
//     ops can monitor (the migration-level pg_cron jobs run independently
//     and remain as a defence-in-depth).
//   • Mail queue / notifications are 90-day retained — old enough that the
//     user / ops no longer needs to see them in the UI, recent enough that
//     a missed "your invoice was sent" notification is still in the DB if
//     someone files a support ticket.
//
// WHAT THIS MODULE DOES NOT DO
//   • It does NOT delete audit_logs or kyc_submissions (those are
//     regulatory-retained and require a separate, manually-triggered
//     archival flow before deletion).
//   • It does NOT implement per-tenant retention overrides (a tenant on a
//     stricter compliance regime like finance or healthcare could want
//     longer retention for their own data). That is a follow-up.
//   • It does NOT log the retention deletes to audit_logs (the DELETE
//     itself is the policy; logging it would defeat the purpose of
//     "minimise PII in audit_logs" from migration 030).
// ----------------------------------------------------------------------------

/**
 * Retention period for a single table.
 *
 * `kind` controls how the cron interprets the entry:
 *   • `"delete_after"`       — the cron DELETES rows older than `days`.
 *   • `"delete_after_status"` — same, but only rows whose `status` column
 *                                equals `statusValue` (e.g. mail_queue
 *                                where status='sent' — pending mail is
 *                                NOT deleted even if old).
 *   • `"regulatory"`          — listed for transparency; NOT auto-deleted
 *                                by the cron. Manual archival required.
 *   • `"indefinite"`          — kept for the lifetime of the account /
 *                                contract. No auto-deletion.
 */
export interface RetentionRule {
  /** Table name in `public` schema. */
  table: string;
  /** Human-readable reason / regulation citation. */
  description: string;
  /** How the cron should treat this entry. */
  kind: "delete_after" | "delete_after_status" | "regulatory" | "indefinite";
  /** For `delete_after*`: retention window in days. */
  days?: number;
  /** For `delete_after_status`: the column to compare (default: `created_at`). */
  column?: string;
  /** For `delete_after_status`: the status value to match. */
  statusColumn?: string;
  /** For `delete_after_status`: the status value that qualifies for deletion. */
  statusValue?: string;
}

/**
 * The platform-wide retention policy. This is the single source of truth —
 * the cron route iterates over this array, the privacy page renders it,
 * and any future "data inventory" admin view consumes it.
 */
export const RETENTION_POLICY: RetentionRule[] = [
  {
    table: "users",
    description: "Indefinite — kept while the account is active. GDPR Article 17 erasure is honoured on delete (see migration 030 anonymise-on-delete cascade).",
    kind: "indefinite",
  },
  {
    table: "partners",
    description: "Indefinite — kept while the partner is active. Soft-deleted partners are retained for 2 years (fraud / dispute window) then hard-deleted.",
    kind: "indefinite",
  },
  {
    table: "portal_access",
    description: "Indefinite while active. Soft-deleted portal_access rows (status='disabled' or deleted_at IS NOT NULL) are hard-deleted 2 years after deactivation.",
    kind: "indefinite",
  },
  {
    table: "kyc_submissions",
    description: "5 years (regulatory requirement — EU 5AMLD Article 40, US Bank Secrecy Act). Not auto-deleted; manual archival required.",
    kind: "regulatory",
    days: 365 * 5,
  },
  {
    table: "audit_logs",
    description: "7 years (regulatory requirement — SOX §802, IRS retention rules). Append-only (migration 010); not auto-deleted.",
    kind: "regulatory",
    days: 365 * 7,
  },
  {
    table: "sessions",
    description: "Expired sessions are deleted daily. Active sessions are kept until they expire (30-day max via cookie TTL).",
    kind: "delete_after",
    days: 30,
    column: "expires_at",
  },
  {
    table: "login_history",
    description: "Login history is retained for 1 year — sufficient for security investigations without becoming a permanent location-tracking record.",
    kind: "delete_after",
    days: 365,
    column: "created_at",
  },
  {
    table: "password_resets",
    description: "Consumed / expired password-reset tokens are deleted after 24 hours. Active tokens are kept until their expires_at.",
    kind: "delete_after",
    days: 1,
    column: "created_at",
  },
  {
    table: "rate_limits",
    description: "Rate-limit windows older than 24 hours are deleted (no longer useful — the next hit would reset the window anyway).",
    kind: "delete_after",
    days: 1,
    column: "window_start",
  },
  {
    table: "mail_queue",
    description: "Successfully-sent mail_queue entries are deleted after 90 days. Pending / failed entries are NEVER auto-deleted (they may still need a retry or a manual investigation).",
    kind: "delete_after_status",
    days: 90,
    column: "created_at",
    statusColumn: "status",
    statusValue: "sent",
  },
  {
    table: "notifications",
    description: "Notifications are deleted after 90 days — old enough that the user has either acted on or dismissed them; recent enough that a missed notification is still in the DB if a support ticket is filed.",
    kind: "delete_after",
    days: 90,
    column: "created_at",
  },
];

/**
 * Subset of the policy that the cron route actually executes (i.e. all
 * `delete_after` and `delete_after_status` entries — NOT `regulatory` or
 * `indefinite`). Pre-filtered at module-load so the cron route can iterate
 * without re-filtering each run.
 */
export const ENFORCEABLE_RETENTION_RULES: RetentionRule[] = RETENTION_POLICY.filter(
  (r) => r.kind === "delete_after" || r.kind === "delete_after_status",
);

/**
 * Helper for tests / admin UI: look up the rule for a given table.
 * Returns `null` if the table has no retention rule (which means it is
 * outside the policy — the cron will NOT touch it).
 */
export function getRetentionRule(table: string): RetentionRule | null {
  return RETENTION_POLICY.find((r) => r.table === table) ?? null;
}

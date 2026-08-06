/**
 * Redact sensitive keys from an audit-log details object.
 *
 * Audit logs are for tracing who did what — not for exposing live credentials
 * (e.g. portal password-reset tokens) to anyone who can read the log. This
 * helper returns a shallow copy of `details` with every key listed in
 * `keysToRedact` replaced by the literal string "[redacted]". Non-object
 * inputs are returned unchanged so callers can pipe arbitrary `details`
 * values through without type-narrowing first.
 *
 * @param details       The original details value (object, null, primitive, …)
 * @param keysToRedact  Array of keys whose values should be masked
 */
export function redactDetails(details: unknown, keysToRedact: string[]): unknown {
  if (!details || typeof details !== "object") return details;
  const copy: Record<string, unknown> = { ...(details as Record<string, unknown>) };
  for (const k of keysToRedact) {
    if (k in copy) copy[k] = "[redacted]";
  }
  return copy;
}

/** Standard redaction keys for tenant-scoped audit logs. */
export const TENANT_REDACT_KEYS = ["reset_token"];

/** Extended redaction keys for super-admin (cross-tenant) audit logs. */
export const SUPER_ADMIN_REDACT_KEYS = ["reset_token", "password", "token"];

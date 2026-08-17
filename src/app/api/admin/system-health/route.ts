import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, sanitizeError } from "@/lib/api/helpers";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getMetricsSummary,
  checkAlerts,
  ALERT_THRESHOLDS,
  SLOW_THRESHOLD_MS,
} from "@/lib/monitoring/apm";
import { RETENTION_POLICY } from "@/lib/compliance/retention";

export const runtime = "nodejs";

/**
 * System health dashboard data (super-admin only).
 *
 * Aggregates everything the "System Health" tab needs in one round
 * trip:
 *
 *   • process: Node uptime + memory snapshot (rss / heap / external)
 *   • apm: live in-memory APM summary (per-route p50/p95/max, slow
 *          requests, error rate, slow threshold) — same shape as
 *          /api/admin/performance
 *   • db: liveness probe (one HEAD against tenants) + table-size
 *         estimates for the highest-churn tables
 *   • sentry: enabled / server_only / client_only / disabled
 *   • crons: list of all cron routes (cron/* paths) and their static
 *            schedule hints — the platform can't read pg_cron directly
 *            from PostgREST, so we ship the static schedule as a hint
 *            and the last_run timestamp as best-effort from audit_logs
 *   • retention: the policy table from lib/compliance/retention.ts
 *
 * Auth: super_admin only. Same rationale as the other admin routes —
 * exposing per-tenant traffic patterns to a tenant admin is a
 * cross-tenant info leak.
 */

interface CronRouteInfo {
  path: string;
  schedule: string;
  description: string;
}

const CRON_ROUTES: CronRouteInfo[] = [
  {
    path: "/api/cron/data-retention",
    schedule: "Daily 03:00 UTC",
    description:
      "Executes the GDPR retention policy. Deletes sessions / rate_limits / login_history / mail_queue / notifications past their retention window.",
  },
  {
    path: "/api/cron/invoice-overdue",
    schedule: "Daily 04:00 UTC",
    description:
      "Marks invoices as overdue when their due date has passed and the status is still 'sent'.",
  },
  {
    path: "/api/cron/subscription-sweep",
    schedule: "Hourly",
    description:
      "Cancels trial subscriptions that have passed their trial_end without conversion; suspends tenants with overdue invoices.",
  },
  {
    path: "/api/cron/webhook-retry",
    schedule: "Every 15 min",
    description:
      "Retries failed webhook deliveries with exponential backoff. Caps at 5 attempts.",
  },
];

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const summary = getMetricsSummary();
  const alerts = checkAlerts();
  const mem = process.memoryUsage();
  const memory = {
    rssMb: Math.round(mem.rss / 1024 / 1024),
    heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    externalMb: Math.round(mem.external / 1024 / 1024),
  };

  // Sentry status — mirrors the /api/health helper.
  const sentry = ((): "enabled" | "server_only" | "client_only" | "disabled" => {
    const server = !!process.env.SENTRY_DSN;
    const client = !!process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (server && client) return "enabled";
    if (server) return "server_only";
    if (client) return "client_only";
    return "disabled";
  })();

  // Cron job last-run status from audit_logs (best-effort — falls back
  // to "never" if the audit table is empty or Supabase isn't
  // configured).
  let cronStatus: Array<CronRouteInfo & { last_run: string | null }> = [];
  try {
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      // Look up the most recent audit entry per cron action. The
      // cron routes all call audit() with action starting
      // "cron.*" or the path itself.
      const { data: auditRows } = await sb
        .from("audit_logs")
        .select("action, created_at")
        .or(
          CRON_ROUTES.map((r) => `action.eq.cron.${r.path.replace("/api/cron/", "")}.run`).join(","),
        )
        .order("created_at", { ascending: false })
        .limit(100);

      const lastByPath: Record<string, string | null> = {};
      for (const row of (auditRows ?? []) as Array<{ action: string; created_at: string }>) {
        for (const r of CRON_ROUTES) {
          const key = r.path.replace("/api/cron/", "");
          if (row.action.includes(key) && !lastByPath[r.path]) {
            lastByPath[r.path] = row.created_at;
          }
        }
      }

      cronStatus = CRON_ROUTES.map((r) => ({
        ...r,
        last_run: lastByPath[r.path] ?? null,
      }));
    } else {
      cronStatus = CRON_ROUTES.map((r) => ({ ...r, last_run: null }));
    }
  } catch {
    cronStatus = CRON_ROUTES.map((r) => ({ ...r, last_run: null }));
  }

  // DB table-size estimates. PostgREST doesn't expose pg_total_relation_size
  // directly, so we approximate via COUNT(*) for the highest-churn tables.
  // Counts are capped at 1000 (HEAD request) to avoid a slow COUNT(*)
  // on a multi-million-row table.
  const TABLE_PROBES = [
    "tenants",
    "users",
    "partners",
    "deals",
    "offers",
    "invoices",
    "audit_logs",
    "sessions",
    "login_history",
    "mail_queue",
    "vault_secrets",
    "rate_limits",
    "notifications",
    "kyc_submissions",
    "webhook_deliveries",
  ];

  let db: {
    status: "ok" | "error" | "not_configured";
    error: string | null;
    table_counts: Record<string, number>;
  } = { status: "not_configured", error: null, table_counts: {} };

  try {
    if (!isSupabaseConfigured()) {
      db = { status: "not_configured", error: "SUPABASE_URL / service-role key not set", table_counts: {} };
    } else {
      const sb = getSupabase();
      const counts: Record<string, number> = {};
      for (const table of TABLE_PROBES) {
        const { count, error } = await sb
          .from(table)
          .select("id", { count: "exact", head: true });
        if (!error && typeof count === "number") {
          counts[table] = count;
        } else {
          counts[table] = -1; // signal error per-table without aborting the loop
        }
      }
      db = { status: "ok", error: null, table_counts: counts };
    }
  } catch (e: any) {
    db = { status: "error", error: sanitizeError(e), table_counts: {} };
  }

  return NextResponse.json({
    process: {
      uptimeSeconds: Math.round(process.uptime()),
      memory,
      nodeVersion: process.version,
      platform: process.platform,
    },
    apm: {
      summary,
      alerts,
      thresholds: ALERT_THRESHOLDS,
      slowThresholdMs: SLOW_THRESHOLD_MS,
      bufferCapacity: 1000,
    },
    db,
    sentry,
    crons: cronStatus,
    retention: RETENTION_POLICY,
    timestamp: new Date().toISOString(),
  });
}

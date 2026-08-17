"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Server, Database, Activity, Clock, Gauge, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store/app-store";
import { useApiUrl } from "@/lib/hooks/use-api-url";
import { fmtRelative, fmtDateTime } from "@/lib/utils/format";
import {
  SettingsCardHeader, SectionLabel, LoadingCard, ErrorCard,
} from "./_shared";

interface SystemHealthData {
  process: {
    uptimeSeconds: number;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
      externalMb: number;
    };
    nodeVersion: string;
    platform: string;
  };
  apm: {
    summary: {
      totalRequests: number;
      avgResponseTime: number;
      slowRequests: number;
      errorRate: number;
      byRoute: Record<string, any>;
    };
    alerts: string[];
    thresholds: { avgResponseTimeMs: number; errorRate: number; slowRequests: number };
    slowThresholdMs: number;
    bufferCapacity: number;
  };
  db: {
    status: "ok" | "error" | "not_configured";
    error: string | null;
    table_counts: Record<string, number>;
  };
  sentry: "enabled" | "server_only" | "client_only" | "disabled";
  crons: Array<{
    path: string;
    schedule: string;
    description: string;
    last_run: string | null;
  }>;
  retention: Array<{
    table: string;
    description: string;
    kind: string;
    days?: number;
  }>;
  timestamp: string;
}

export function SystemHealth() {
  const api = useApiUrl();
  const user = useAppStore((s) => s.user);
  const setView = useAppStore((s) => s.setView);

  const [data, setData] = React.useState<SystemHealthData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(api("/api/admin/system-health"), { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setData(d);
    } catch (e: any) {
      setError(e?.message || "Failed to load system health");
    } finally {
      setLoading(false);
    }
  }, [api]);

  React.useEffect(() => {
    const id = setInterval(load, 30_000); // refresh every 30s
    return () => clearInterval(id);
  }, [load]);

  if (loading && !data) return <LoadingCard title="System Health" />;
  if (error || !data) return <ErrorCard title="System Health" message={error || "No data"} />;

  const memPct = data.process.memory.heapTotalMb > 0
    ? Math.round((data.process.memory.heapUsedMb / data.process.memory.heapTotalMb) * 100)
    : 0;
  const uptimeHours = Math.floor(data.process.uptimeSeconds / 3600);
  const uptimeMin = Math.floor((data.process.uptimeSeconds % 3600) / 60);
  const uptimeStr = uptimeHours > 0 ? `${uptimeHours}h ${uptimeMin}m` : `${uptimeMin}m`;

  return (
    <div className="space-y-6">
      {/* Top refresh bar */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className={`size-4 ${data.apm.alerts.length > 0 ? "text-amber-500" : "text-emerald-500"}`} />
            <span className="text-sm font-medium">System Health</span>
            <span className="text-xs text-muted-foreground">last updated {fmtRelative(data.timestamp)}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => { void load(); }}>
            <RefreshCw className={`size-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardContent>
      </Card>

      {/* APM quick KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile
          icon={Gauge}
          label="Avg Response"
          value={`${data.apm.summary.avgResponseTime}ms`}
          tone={data.apm.summary.avgResponseTime > data.apm.thresholds.avgResponseTimeMs ? "warn" : "ok"}
          hint={`Threshold: ${data.apm.thresholds.avgResponseTimeMs}ms`}
        />
        <Tile
          icon={AlertTriangle}
          label="Error Rate"
          value={`${(data.apm.summary.errorRate * 100).toFixed(1)}%`}
          tone={data.apm.summary.errorRate > data.apm.thresholds.errorRate ? "warn" : "ok"}
          hint={`Threshold: ${(data.apm.thresholds.errorRate * 100).toFixed(1)}%`}
        />
        <Tile
          icon={Clock}
          label="Slow Requests"
          value={String(data.apm.summary.slowRequests)}
          tone={data.apm.summary.slowRequests > data.apm.thresholds.slowRequests ? "warn" : "ok"}
          hint={`>${data.apm.slowThresholdMs}ms · ${data.apm.summary.totalRequests} total`}
        />
        <Tile
          icon={Server}
          label="Uptime"
          value={uptimeStr}
          tone="info"
          hint={`Node ${data.process.nodeVersion} · ${data.process.platform}`}
        />
      </div>

      {/* APM alerts banner */}
      {data.apm.alerts.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="size-4 text-amber-600" />
              <span className="font-medium text-sm text-amber-700 dark:text-amber-400">{data.apm.alerts.length} active alert(s)</span>
            </div>
            <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-400">
              {data.apm.alerts.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500/60">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setView("performance")}>
              Open Performance Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Memory & process */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Process & Memory"
          description={`In-memory snapshot for the current instance. Heap usage: ${data.process.memory.heapUsedMb}MB / ${data.process.memory.heapTotalMb}MB (${memPct}%). RSS: ${data.process.memory.rssMb}MB · External: ${data.process.memory.externalMb}MB.`}
          dirty={false}
          saving={false}
        />
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile icon={Server} label="RSS (Resident)" value={`${data.process.memory.rssMb} MB`} tone="info" />
          <Tile icon={Database} label="Heap Used" value={`${data.process.memory.heapUsedMb} MB`} tone={memPct > 80 ? "warn" : "ok"} hint={`${memPct}% of heap total`} />
          <Tile icon={Database} label="Heap Total" value={`${data.process.memory.heapTotalMb} MB`} tone="info" />
          <Tile icon={Database} label="External" value={`${data.process.memory.externalMb} MB`} tone="info" hint="C++ objects (Buffer, etc.)" />
        </CardContent>
      </Card>

      {/* DB table counts */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Database Metrics"
          description={`Liveness: ${data.db.status}. Table counts (HEAD request, capped at 1000 — counts above 1000 show as "1000+").`}
          dirty={false}
          saving={false}
        />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead className="text-right">Row Count</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(data.db.table_counts).map(([table, count]) => (
                <TableRow key={table}>
                  <TableCell><code className="text-[11px] font-mono">{table}</code></TableCell>
                  <TableCell className="text-right tabular">{count < 0 ? "—" : count >= 1000 ? "1000+" : count}</TableCell>
                  <TableCell className="text-right">
                    {count >= 0 ? <CheckCircle2 className="size-4 text-emerald-500 inline" /> : <XCircle className="size-4 text-destructive inline" />}
                  </TableCell>
                </TableRow>
              ))}
              {data.db.error && (
                <TableRow>
                  <TableCell colSpan={3} className="text-destructive text-xs">DB error: {data.db.error}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sentry */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Sentry / Render Service Status"
          description="Sentry DSN configuration is read from env vars. Render service status is available in the Render dashboard — link below."
          dirty={false}
          saving={false}
        />
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sentry status</span>
            <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${
              data.sentry === "enabled" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" :
              data.sentry === "disabled" ? "bg-destructive/10 text-destructive border-destructive/30" :
              "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
            }`}>
              {data.sentry}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://dashboard.render.com" target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                Open Render Dashboard
              </Button>
            </a>
            <a href="https://sentry.io" target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                Open Sentry Dashboard
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Cron status */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Cron Job Status"
          description="Static schedule (the platform doesn't read pg_cron directly — these are the canonical schedule hints). Last-run timestamps are best-effort from audit_logs."
          dirty={false}
          saving={false}
        />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.crons.map((c) => (
                <TableRow key={c.path}>
                  <TableCell><code className="text-[11px] font-mono">{c.path}</code></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{c.schedule}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular">
                    {c.last_run ? fmtDateTime(c.last_run) : "never"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Retention policy mirror */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Retention Policy (mirror)"
          description="The platform-wide retention policy is enforced by /api/cron/data-retention. This table is the same one shown under Data Protection — repeated here for ops context."
          dirty={false}
          saving={false}
        />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Window</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.retention.map((r) => (
                <TableRow key={r.table}>
                  <TableCell><code className="text-[11px] font-mono">{r.table}</code></TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] uppercase tracking-wider">{r.kind}</Badge></TableCell>
                  <TableCell className="text-xs tabular">
                    {r.days ? `${r.days} days` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center">
        Auto-refreshing every 30s · Snapshot taken {fmtDateTime(data.timestamp)} · Process uptime {uptimeStr}
      </p>
    </div>
  );
}

function Tile({
  icon: Icon, label, value, tone, hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "ok" | "warn" | "info" | "critical";
  hint?: string;
}) {
  const cls = {
    ok: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    warn: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    info: "border-primary/30 bg-primary/5",
    critical: "border-destructive/30 bg-destructive/5 text-destructive",
  }[tone];
  return (
    <div className={`rounded-xl border ${cls} p-3`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
          <p className="text-xl font-bold tabular mt-1">{value}</p>
        </div>
        <Icon className="size-4 opacity-60" />
      </div>
      {hint && <p className="text-[10px] opacity-70 mt-1">{hint}</p>}
    </div>
  );
}

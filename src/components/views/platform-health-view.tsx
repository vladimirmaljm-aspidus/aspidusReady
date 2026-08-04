"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Database, Building2, Users, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { fmtDateTime } from "@/lib/utils/format";

interface Health {
  db_status: "ok" | "error";
  tenant_count: number;
  user_count: number;
  active_subscriptions: number;
  suspended_tenants: number;
  expiring_within_7d: number;
  permission_consistency_issues: number;
  generated_at: string;
}

export function PlatformHealthView() {
  const healthQ = useQuery({
    queryKey: ["platform-health"],
    queryFn: async () => {
      const r = await fetch("/api/super-admin/health");
      if (!r.ok) throw new Error("Failed to load health");
      return r.json() as Promise<Health>;
    },
    refetchInterval: 30_000,
  });
  const h = healthQ.data;
  const generated = h?.generated_at ? fmtDateTime(h.generated_at) : "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base"><Heart className="size-4 text-primary" /> Platform health</CardTitle>
              <CardDescription className="text-xs">Live snapshot of core platform metrics. Auto-refreshes every 30 seconds.</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {generated && <span>Updated {generated}</span>}
              <Button size="sm" variant="outline" onClick={() => healthQ.refetch()}><RefreshCw className={`size-3.5 mr-1 ${healthQ.isFetching ? "animate-spin" : ""}`} /> Refresh</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {healthQ.isLoading && <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading health snapshot…</CardContent></Card>}
      {healthQ.error && <Card><CardContent className="p-6 text-sm text-destructive">Failed to load health.</CardContent></Card>}

      {h && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Tile
              icon={Database}
              label="Database"
              value={h.db_status === "ok" ? "OK" : "ERROR"}
              tone={h.db_status === "ok" ? "ok" : "critical"}
              hint={h.db_status === "ok" ? "Connected" : "Store connection failed"}
            />
            <Tile icon={Building2} label="Tenants" value={h.tenant_count} tone="info" hint="Registered companies" />
            <Tile icon={Users} label="Users" value={h.user_count} tone="info" hint="Across all tenants" />
            <Tile icon={TrendingUp} label="Active subscriptions" value={h.active_subscriptions} tone={h.active_subscriptions > 0 ? "ok" : "warn"} hint="Status = active" />
            <Tile icon={Clock} label="Expiring ≤7d" value={h.expiring_within_7d} tone={h.expiring_within_7d > 0 ? "warn" : "ok"} hint="Subscriptions about to lapse" />
            <Tile icon={AlertTriangle} label="Suspended" value={h.suspended_tenants} tone={h.suspended_tenants > 0 ? "critical" : "ok"} hint="Tenants blocked from login" />
            <Tile icon={AlertTriangle} label="Perm inconsistencies" value={h.permission_consistency_issues} tone={h.permission_consistency_issues > 0 ? "warn" : "ok"} hint="Users with perms on suspended tenants" />
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Signals</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              {h.db_status === "ok" ? <Signal ok label="Database connection is healthy." /> : <Signal error label="Database connection failed." />}
              {h.suspended_tenants > 0
                ? <Signal warn label={`${h.suspended_tenants} tenant(s) are suspended — their users cannot log in.`} />
                : <Signal ok label="No suspended tenants." />}
              {h.expiring_within_7d > 0
                ? <Signal warn label={`${h.expiring_within_7d} subscription(s) expiring within 7 days — contact tenants to renew.`} />
                : <Signal ok label="No subscriptions expiring in the next 7 days." />}
              {h.permission_consistency_issues > 0
                ? <Signal warn label={`${h.permission_consistency_issues} user(s) still hold permissions while their tenant is suspended.`} />
                : <Signal ok label="No permission-consistency issues detected." />}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

const TONE = {
  ok: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  info: "border-primary/30 bg-primary/5",
  warn: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  critical: "border-destructive/30 bg-destructive/5 text-destructive",
} as const;
type Tone = keyof typeof TONE;

function Tile({ icon: Icon, label, value, tone, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; tone: Tone; hint?: string }) {
  return (
    <Card className={`rounded-xl ${TONE[tone]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div><p className="text-[10px] uppercase tracking-wider">{label}</p><p className="text-2xl font-bold tabular mt-1">{value}</p></div>
          <Icon className="size-4 opacity-60" />
        </div>
        {hint && <p className="text-[10px] opacity-70 mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Signal({ ok, warn, error, label }: { ok?: boolean; warn?: boolean; error?: boolean; label: string }) {
  const Icon = error ? XCircle : warn ? AlertTriangle : CheckCircle2;
  const cls = error ? "text-destructive" : warn ? "text-amber-600" : "text-emerald-600";
  return <div className="flex items-center gap-2"><Icon className={`size-4 ${cls}`} /><span>{label}</span></div>;
}

"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, AlertTriangle, Activity, Webhook, Bell } from "lucide-react";
import { toast } from "sonner";
import { useApiUrl } from "@/lib/hooks/use-api-url";
import { useQueryClient } from "@tanstack/react-query";
import {
  SettingsCardHeader, SectionLabel, FieldRow, LoadingCard, ErrorCard,
} from "./_shared";

interface MonitoringConfig {
  sentry: {
    dsn_configured: boolean;
    client_dsn_configured: boolean;
    environment: string;
    sampleRate: number;
  };
  securityWebhook: {
    enabled: boolean;
    url: string;
    events: string[];
    includePayload: boolean;
  };
  anomaly: {
    avgResponseTimeMs: number;
    errorRatePct: number;
    slowRequests: number;
    loginFailsPerHour: number;
  };
  alertRouting: Array<{
    type: string;
    recipients: string[];
    severity: "low" | "medium" | "high" | "critical";
    active: boolean;
  }>;
}

function dirtyEq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function MonitoringSettings() {
  const api = useApiUrl();
  const qc = useQueryClient();

  const [config, setConfig] = React.useState<MonitoringConfig | null>(null);
  const [defaults, setDefaults] = React.useState<MonitoringConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(api("/api/admin/monitoring-settings"), { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setConfig(d.config);
      setDefaults(d.defaults);
    } catch (e: any) {
      setError(e?.message || "Failed to load monitoring config");
    } finally {
      setLoading(false);
    }
  }, [api]);

  React.useEffect(() => { void load(); }, [load]);

  function patch<K extends keyof MonitoringConfig>(key: K, value: MonitoringConfig[K]) {
    setConfig((c) => c ? { ...c, [key]: value } : c);
  }
  function patchNested<K extends keyof MonitoringConfig, SK extends keyof MonitoringConfig[K]>(
    key: K, sub: SK, value: any,
  ) {
    setConfig((c) => {
      if (!c) return c;
      return { ...c, [key]: { ...(c[key] as any), [sub]: value } };
    });
  }

  const dirty = config && defaults ? !dirtyEq(config, defaults) : false;

  async function save() {
    if (!config) return;
    setSaving(true);
    try {
      const r = await fetch(api("/api/admin/monitoring-settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
      setConfig(d.config);
      toast.success("Monitoring & alerts saved");
      qc.invalidateQueries({ queryKey: ["monitoring-config"] });
    } catch (e: any) {
      toast.error("Failed to save monitoring config", { description: e?.message });
    } finally {
      setSaving(false);
    }
  }

  function patchAlertRouting(i: number, patch: Partial<MonitoringConfig["alertRouting"][number]>) {
    setConfig((c) => {
      if (!c) return c;
      return {
        ...c,
        alertRouting: c.alertRouting.map((r, idx) => idx === i ? { ...r, ...patch } : r),
      };
    });
  }
  function addRouting() {
    setConfig((c) => c ? {
      ...c,
      alertRouting: [...c.alertRouting, { type: "new-alert", recipients: [], severity: "medium", active: true }],
    } : c);
  }
  function deleteRouting(i: number) {
    setConfig((c) => c ? { ...c, alertRouting: c.alertRouting.filter((_, idx) => idx !== i) } : c);
  }

  if (loading) return <LoadingCard title="Monitoring & Alerts" />;
  if (error || !config) return <ErrorCard title="Monitoring & Alerts" message={error || "No data"} />;

  const sentryStatus = config.sentry.dsn_configured && config.sentry.client_dsn_configured
    ? "enabled"
    : config.sentry.dsn_configured
    ? "server-only"
    : config.sentry.client_dsn_configured
    ? "client-only"
    : "disabled";

  return (
    <div className="space-y-6">
      {/* Sentry */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Sentry Error Monitoring"
          description="Sentry DSN configuration is read from environment variables (SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN). The toggles here can't change env vars — they show the current state for ops visibility."
          dirty={false}
          saving={saving}
        />
        <CardContent className="space-y-3">
          <FieldRow label="Status" hint="Server + client DSNs need to be set for full coverage.">
            <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${
              sentryStatus === "enabled" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" :
              sentryStatus === "disabled" ? "bg-destructive/10 text-destructive border-destructive/30" :
              "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
            }`}>
              {sentryStatus}
            </Badge>
          </FieldRow>
          <FieldRow label="Environment" hint="Node env (development / production).">
            <Badge variant="outline" className="text-xs">{config.sentry.environment}</Badge>
          </FieldRow>
          <FieldRow label="Sample Rate" hint="Fraction of transactions sampled (0–1). Defaults to 1.0 in dev, lower in prod.">
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              className="w-28 tabular"
              value={String(config.sentry.sampleRate)}
              onChange={(e) => patchNested("sentry", "sampleRate", Number(e.target.value))}
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* Security event webhook */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Security Event Webhook"
          description="A platform-level webhook sink that receives POST notifications on significant security events (login lockouts, SoD violations, vault rotations, role changes). Distinct from per-tenant webhooks."
          dirty={!dirtyEq(config.securityWebhook, defaults?.securityWebhook)}
          saving={saving}
          onSave={save}
          onReset={() => defaults && patch("securityWebhook", defaults.securityWebhook)}
        />
        <CardContent className="space-y-3">
          <FieldRow label="Enabled" hint="When off, no notifications are sent. Toggle on after the URL is set.">
            <Switch checked={config.securityWebhook.enabled} onCheckedChange={(v) => patchNested("securityWebhook", "enabled", v)} />
          </FieldRow>
          <FieldRow label="URL" hint="HTTPS endpoint that accepts POST application/json.">
            <Input
              value={config.securityWebhook.url}
              onChange={(e) => patchNested("securityWebhook", "url", e.target.value)}
              placeholder="https://hooks.example.com/velos-security"
              className="w-full max-w-md"
            />
          </FieldRow>
          <FieldRow label="Include Raw Payload" hint="Off = send a digest (event type + IDs only); On = send the full audit row.">
            <Switch checked={config.securityWebhook.includePayload} onCheckedChange={(v) => patchNested("securityWebhook", "includePayload", v)} />
          </FieldRow>
          <div className="space-y-2 mt-2">
            <Label className="text-xs">Subscribed Events</Label>
            <div className="flex flex-wrap gap-1.5 border rounded-md p-2 min-h-[60px]">
              {config.securityWebhook.events.map((e) => (
                <Badge key={e} variant="outline" className="text-[10px] font-mono">
                  {e}
                  <button
                    onClick={() => patchNested("securityWebhook", "events", config.securityWebhook.events.filter((x) => x !== e))}
                    className="ml-1 hover:text-destructive"
                  >×</button>
                </Badge>
              ))}
              {config.securityWebhook.events.length === 0 && (
                <span className="text-xs text-muted-foreground">No events subscribed. Add one below.</span>
              )}
            </div>
            <EventAdder
              onAdd={(ev) => {
                if (!config.securityWebhook.events.includes(ev)) {
                  patchNested("securityWebhook", "events", [...config.securityWebhook.events, ev]);
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Anomaly detection */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Anomaly Detection Thresholds"
          description="When the APM buffer or the login-history log exceeds any of these thresholds, an alert is surfaced on the Performance dashboard (and on the System Health tab in this view)."
          dirty={!dirtyEq(config.anomaly, defaults?.anomaly)}
          saving={saving}
          onSave={save}
          onReset={() => defaults && patch("anomaly", defaults.anomaly)}
        />
        <CardContent className="space-y-3">
          <FieldRow label="Avg Response Time (ms)" hint="Sustained avg above this triggers an alert. Default 2000ms = 2s.">
            <Input
              type="number"
              min={100}
              step={100}
              className="w-28 tabular"
              value={String(config.anomaly.avgResponseTimeMs)}
              onChange={(e) => patchNested("anomaly", "avgResponseTimeMs", Number(e.target.value))}
            />
          </FieldRow>
          <FieldRow label="Error Rate (%)" hint="5xx response share above this triggers an alert. Default 5%.">
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              className="w-28 tabular"
              value={String(config.anomaly.errorRatePct)}
              onChange={(e) => patchNested("anomaly", "errorRatePct", Number(e.target.value))}
            />
          </FieldRow>
          <FieldRow label="Slow Request Count" hint="Number of >2s requests in the buffer that triggers an alert.">
            <Input
              type="number"
              min={1}
              className="w-28 tabular"
              value={String(config.anomaly.slowRequests)}
              onChange={(e) => patchNested("anomaly", "slowRequests", Number(e.target.value))}
            />
          </FieldRow>
          <FieldRow label="Login Fails / Hour" hint="Per-IP failed login attempts per hour that triggers a security alert.">
            <Input
              type="number"
              min={1}
              className="w-28 tabular"
              value={String(config.anomaly.loginFailsPerHour)}
              onChange={(e) => patchNested("anomaly", "loginFailsPerHour", Number(e.target.value))}
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* Alert routing */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Alert Routing"
          description="Map alert types to recipient emails. Recipients are notified (via the security webhook + email) when the matching alert fires. Use 'severity' to control paging."
          dirty={!dirtyEq(config.alertRouting, defaults?.alertRouting)}
          saving={saving}
          onSave={save}
          onReset={() => defaults && patch("alertRouting", defaults.alertRouting)}
        />
        <CardContent className="space-y-3">
          <div className="flex items-center justify-end">
            <Button size="sm" variant="outline" onClick={addRouting}>
              <Plus className="size-3.5 mr-1" /> Add Route
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert Type</TableHead>
                <TableHead>Recipients (comma-separated)</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {config.alertRouting.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Input
                      value={r.type}
                      onChange={(e) => patchAlertRouting(i, { type: e.target.value })}
                      className="h-8 font-mono text-[11px]"
                      placeholder="auth.login_locked"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={r.recipients.join(", ")}
                      onChange={(e) => patchAlertRouting(i, { recipients: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                      className="h-8 text-[11px]"
                      placeholder="security@example.com, dpo@example.com"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={r.severity}
                      onValueChange={(v) => patchAlertRouting(i, { severity: v as any })}
                    >
                      <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">low</SelectItem>
                        <SelectItem value="medium">medium</SelectItem>
                        <SelectItem value="high">high</SelectItem>
                        <SelectItem value="critical">critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch checked={r.active} onCheckedChange={(v) => patchAlertRouting(i, { active: v })} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteRouting(i)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {config.alertRouting.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No alert routes. Add one or reset to defaults.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const EVENT_SUGGESTIONS = [
  "auth.login_locked",
  "auth.sod_violation",
  "vault.rotate",
  "settings.security.update",
  "settings.role_override.create",
  "settings.role_override.delete",
  "settings.sod_matrix.update",
  "settings.gdpr.update",
  "incident.create",
  "incident.update",
];

function EventAdder({ onAdd }: { onAdd: (event: string) => void }) {
  const [value, setValue] = React.useState("");
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="h-8 w-64 text-xs"><SelectValue placeholder="Pick event…" /></SelectTrigger>
        <SelectContent>
          {EVENT_SUGGESTIONS.map((e) => (
            <SelectItem key={e} value={e}><code className="text-[11px]">{e}</code></SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        disabled={!value}
        onClick={() => { if (value) { onAdd(value); setValue(""); } }}
      >
        <Plus className="size-3.5 mr-1" /> Add
      </Button>
    </div>
  );
}

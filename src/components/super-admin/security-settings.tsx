"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Key, Lock } from "lucide-react";
import { toast } from "sonner";
import { useApiUrl } from "@/lib/hooks/use-api-url";
import { useQueryClient } from "@tanstack/react-query";
import { RateLimitsCard } from "@/components/views/rate-limits-card";
import {
  SettingsCardHeader,
  SectionLabel,
  FieldRow,
  LoadingCard,
  ErrorCard,
} from "./_shared";

interface SecurityConfig {
  totp: {
    forceSuperAdmin: boolean;
    forceAdmin: boolean;
    forceStaff: boolean;
    enrollmentGraceHours: number;
  };
  session: {
    superAdminTtlMinutes: number;
    adminTtlMinutes: number;
    userTtlMinutes: number;
    idleTimeoutMinutes: number;
    maxConcurrentSessions: number;
  };
  csrf: {
    enforceOrigin: boolean;
    sameSiteStrict: boolean;
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expiryDays: number;
    historyCount: number;
  };
}

function minutesToHHMM(min: number): string {
  if (min <= 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 && m > 0 ? `${h}h ${m}m` : h > 0 ? `${h}h` : `${m}m`;
}

function dirtyEq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function SecuritySettings() {
  const api = useApiUrl();
  const qc = useQueryClient();

  const [config, setConfig] = React.useState<SecurityConfig | null>(null);
  const [defaults, setDefaults] = React.useState<SecurityConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(api("/api/admin/security-settings"), { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setConfig(d.config);
      setDefaults(d.defaults);
    } catch (e: any) {
      setError(e?.message || "Failed to load security config");
    } finally {
      setLoading(false);
    }
  }, [api]);

  React.useEffect(() => {
    void load();
  }, [load]);

  function patch<K extends keyof SecurityConfig>(key: K, value: SecurityConfig[K]) {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  }
  function patchNested<K extends keyof SecurityConfig, SK extends keyof SecurityConfig[K]>(
    key: K,
    sub: SK,
    value: any,
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
      const r = await fetch(api("/api/admin/security-settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
      setConfig(d.config);
      toast.success("Security settings saved", {
        description: "2FA, session, CSRF, and password policy applied platform-wide.",
      });
      qc.invalidateQueries({ queryKey: ["security-config"] });
    } catch (e: any) {
      toast.error("Failed to save security settings", { description: e?.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingCard title="Security Settings" />;
  if (error || !config) return <ErrorCard title="Security Settings" message={error || "No data"} />;

  return (
    <div className="space-y-6">
      {/* 2FA / TOTP */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Two-Factor Authentication (TOTP)"
          description="Enforce time-based one-time passwords per role. Super-admins are forced on by default — turn it off only in a break-glass scenario."
          dirty={!dirtyEq(config.totp, defaults?.totp)}
          saving={saving}
          onSave={save}
          onReset={() => defaults && patch("totp", defaults.totp)}
        />
        <CardContent className="space-y-3">
          <FieldRow label="Force 2FA for Super Admin" hint="Required for the most privileged role. Recommended ON.">
            <Switch
              checked={config.totp.forceSuperAdmin}
              onCheckedChange={(v) => patchNested("totp", "forceSuperAdmin", v)}
            />
          </FieldRow>
          <FieldRow label="Force 2FA for Admins" hint="Tenant admins manage users and ERP — strong 2FA recommended.">
            <Switch
              checked={config.totp.forceAdmin}
              onCheckedChange={(v) => patchNested("totp", "forceAdmin", v)}
            />
          </FieldRow>
          <FieldRow label="Force 2FA for Staff" hint="Regular users with CRM/finance access.">
            <Switch
              checked={config.totp.forceStaff}
              onCheckedChange={(v) => patchNested("totp", "forceStaff", v)}
            />
          </FieldRow>
          <FieldRow label="Enrollment Grace (hours)" hint="Window after login before 2FA must be set up — prevents lockouts on first enable.">
            <Input
              type="number"
              min={0}
              className="w-28 tabular"
              value={String(config.totp.enrollmentGraceHours)}
              onChange={(e) => patchNested("totp", "enrollmentGraceHours", Number(e.target.value))}
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* Session TTL */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Session TTL & Idle Timeout"
          description="Per-role session lifetimes. Idle timeout is the inactivity window before a session is killed; the absolute TTL is the hard ceiling regardless of activity."
          dirty={!dirtyEq(config.session, defaults?.session)}
          saving={saving}
          onSave={save}
          onReset={() => defaults && patch("session", defaults.session)}
        />
        <CardContent className="space-y-3">
          <FieldRow label="Super-Admin TTL" hint={`Absolute session ceiling. Currently ${minutesToHHMM(config.session.superAdminTtlMinutes)}.`}>
            <Input
              type="number"
              min={1}
              className="w-28 tabular"
              value={String(config.session.superAdminTtlMinutes)}
              onChange={(e) => patchNested("session", "superAdminTtlMinutes", Number(e.target.value))}
            />
            <span className="text-[11px] text-muted-foreground">min</span>
          </FieldRow>
          <FieldRow label="Admin TTL" hint={`Currently ${minutesToHHMM(config.session.adminTtlMinutes)}.`}>
            <Input
              type="number"
              min={1}
              className="w-28 tabular"
              value={String(config.session.adminTtlMinutes)}
              onChange={(e) => patchNested("session", "adminTtlMinutes", Number(e.target.value))}
            />
            <span className="text-[11px] text-muted-foreground">min</span>
          </FieldRow>
          <FieldRow label="User TTL" hint={`Currently ${minutesToHHMM(config.session.userTtlMinutes)}.`}>
            <Input
              type="number"
              min={1}
              className="w-28 tabular"
              value={String(config.session.userTtlMinutes)}
              onChange={(e) => patchNested("session", "userTtlMinutes", Number(e.target.value))}
            />
            <span className="text-[11px] text-muted-foreground">min</span>
          </FieldRow>
          <FieldRow label="Idle Timeout" hint="Inactivity window before session expires (any role).">
            <Input
              type="number"
              min={1}
              className="w-28 tabular"
              value={String(config.session.idleTimeoutMinutes)}
              onChange={(e) => patchNested("session", "idleTimeoutMinutes", Number(e.target.value))}
            />
            <span className="text-[11px] text-muted-foreground">min</span>
          </FieldRow>
          <FieldRow label="Max Concurrent Sessions" hint="Hard cap per user (0 = unlimited). New logins beyond this kill the oldest session.">
            <Input
              type="number"
              min={0}
              className="w-28 tabular"
              value={String(config.session.maxConcurrentSessions)}
              onChange={(e) => patchNested("session", "maxConcurrentSessions", Number(e.target.value))}
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* CSRF */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="CSRF & Cookie Policy"
          description="Origin-header check on state-changing requests + SameSite cookie attribute. SameSite=Lax is the default; Strict blocks top-level navigations from third parties."
          dirty={!dirtyEq(config.csrf, defaults?.csrf)}
          saving={saving}
          onSave={save}
          onReset={() => defaults && patch("csrf", defaults.csrf)}
        />
        <CardContent className="space-y-3">
          <FieldRow label="Enforce Origin check" hint="Verifies the Origin header on POST/PUT/PATCH/DELETE. Disabling is NOT recommended — only for legacy clients that send no Origin.">
            <Switch
              checked={config.csrf.enforceOrigin}
              onCheckedChange={(v) => patchNested("csrf", "enforceOrigin", v)}
            />
          </FieldRow>
          <FieldRow label="SameSite=Strict" hint="Lax (default) allows top-level navigations; Strict blocks them entirely.">
            <Switch
              checked={config.csrf.sameSiteStrict}
              onCheckedChange={(v) => patchNested("csrf", "sameSiteStrict", v)}
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title="Password Policy"
          description="Enforced at user create / password set / password change. The weak-password list (password, 12345678, qwerty, …) is always enforced regardless of these toggles."
          dirty={!dirtyEq(config.passwordPolicy, defaults?.passwordPolicy)}
          saving={saving}
          onSave={save}
          onReset={() => defaults && patch("passwordPolicy", defaults.passwordPolicy)}
        />
        <CardContent className="space-y-3">
          <FieldRow label="Minimum Length" hint="GDPR / SOC2 best practice is ≥ 8 chars; NIST 800-63B recommends ≥ 8 with MFA.">
            <Input
              type="number"
              min={4}
              max={256}
              className="w-28 tabular"
              value={String(config.passwordPolicy.minLength)}
              onChange={(e) => patchNested("passwordPolicy", "minLength", Number(e.target.value))}
            />
          </FieldRow>
          <FieldRow label="Require Uppercase">
            <Switch
              checked={config.passwordPolicy.requireUppercase}
              onCheckedChange={(v) => patchNested("passwordPolicy", "requireUppercase", v)}
            />
          </FieldRow>
          <FieldRow label="Require Lowercase">
            <Switch
              checked={config.passwordPolicy.requireLowercase}
              onCheckedChange={(v) => patchNested("passwordPolicy", "requireLowercase", v)}
            />
          </FieldRow>
          <FieldRow label="Require Numbers">
            <Switch
              checked={config.passwordPolicy.requireNumbers}
              onCheckedChange={(v) => patchNested("passwordPolicy", "requireNumbers", v)}
            />
          </FieldRow>
          <FieldRow label="Require Symbols" hint="Off by default — portal clients on mobile keyboards.">
            <Switch
              checked={config.passwordPolicy.requireSymbols}
              onCheckedChange={(v) => patchNested("passwordPolicy", "requireSymbols", v)}
            />
          </FieldRow>
          <FieldRow label="Password Expiry (days)" hint="Force rotation every N days. 0 = never expire. SOC2 regimes often require 90 days.">
            <Input
              type="number"
              min={0}
              className="w-28 tabular"
              value={String(config.passwordPolicy.expiryDays)}
              onChange={(e) => patchNested("passwordPolicy", "expiryDays", Number(e.target.value))}
            />
          </FieldRow>
          <FieldRow label="History Count" hint="Prevent reuse of the last N passwords. 0 = no history check.">
            <Input
              type="number"
              min={0}
              className="w-28 tabular"
              value={String(config.passwordPolicy.historyCount)}
              onChange={(e) => patchNested("passwordPolicy", "historyCount", Number(e.target.value))}
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* Rate Limits — re-uses the existing card */}
      <RateLimitsCard />
    </div>
  );
}

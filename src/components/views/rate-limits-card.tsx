"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Save, RotateCcw, ShieldCheck, Loader2 } from "lucide-react";

/**
 * RateLimitsCard — super-admin only.
 *
 * Loads the platform-wide rate-limit configuration from
 * GET /api/settings/rate-limits and lets the super-admin tune the
 * `maxAttempts` and `windowMs` (shown as minutes) for each sensitive
 * auth route. Saving calls PUT /api/settings/rate-limits.
 *
 * The config is cached for 5 min on the server (see rate-limit-config.ts);
 * saving invalidates that cache so the new limits take effect immediately.
 */

interface RateLimitConfig {
  loginMaxAttempts: number;
  loginWindowMs: number;
  portalLoginMaxAttempts: number;
  portalLoginWindowMs: number;
  forgotPasswordMaxAttempts: number;
  forgotPasswordWindowMs: number;
  setupPasswordMaxAttempts: number;
  setupPasswordWindowMs: number;
  middlewareLoginMaxRequests: number;
  middlewarePortalLoginMaxRequests: number;
}

const MS_PER_MIN = 60 * 1000;

/** Convert a config (windowMs in ms) into an editable form (windowMin in min). */
type EditForm = Omit<RateLimitConfig, "loginWindowMs" | "portalLoginWindowMs" | "forgotPasswordWindowMs" | "setupPasswordWindowMs"> & {
  loginWindowMin: number;
  portalLoginWindowMin: number;
  forgotPasswordWindowMin: number;
  setupPasswordWindowMin: number;
};

function configToForm(c: RateLimitConfig): EditForm {
  return {
    loginMaxAttempts: c.loginMaxAttempts,
    loginWindowMin: Math.round(c.loginWindowMs / MS_PER_MIN),
    portalLoginMaxAttempts: c.portalLoginMaxAttempts,
    portalLoginWindowMin: Math.round(c.portalLoginWindowMs / MS_PER_MIN),
    forgotPasswordMaxAttempts: c.forgotPasswordMaxAttempts,
    forgotPasswordWindowMin: Math.round(c.forgotPasswordWindowMs / MS_PER_MIN),
    setupPasswordMaxAttempts: c.setupPasswordMaxAttempts,
    setupPasswordWindowMin: Math.round(c.setupPasswordWindowMs / MS_PER_MIN),
    middlewareLoginMaxRequests: c.middlewareLoginMaxRequests,
    middlewarePortalLoginMaxRequests: c.middlewarePortalLoginMaxRequests,
  };
}

function formToConfig(f: EditForm): RateLimitConfig {
  return {
    loginMaxAttempts: Number(f.loginMaxAttempts),
    loginWindowMs: Number(f.loginWindowMin) * MS_PER_MIN,
    portalLoginMaxAttempts: Number(f.portalLoginMaxAttempts),
    portalLoginWindowMs: Number(f.portalLoginWindowMin) * MS_PER_MIN,
    forgotPasswordMaxAttempts: Number(f.forgotPasswordMaxAttempts),
    forgotPasswordWindowMs: Number(f.forgotPasswordWindowMin) * MS_PER_MIN,
    setupPasswordMaxAttempts: Number(f.setupPasswordMaxAttempts),
    setupPasswordWindowMs: Number(f.setupPasswordWindowMin) * MS_PER_MIN,
    middlewareLoginMaxRequests: Number(f.middlewareLoginMaxRequests),
    middlewarePortalLoginMaxRequests: Number(f.middlewarePortalLoginMaxRequests),
  };
}

interface FieldDef {
  attemptsKey: keyof EditForm;
  windowKey: keyof EditForm;
  label: string;
  hint: string;
}

const FIELD_GROUPS: Array<{ title: string; fields: FieldDef[] }> = [
  {
    title: "Staff login",
    fields: [
      {
        attemptsKey: "loginMaxAttempts",
        windowKey: "loginWindowMin",
        label: "Staff login (/api/auth/login)",
        hint: "Per-IP DB-backed limit. Combined with the per-account lockout (5 fails → 15 min).",
      },
    ],
  },
  {
    title: "Portal login",
    fields: [
      {
        attemptsKey: "portalLoginMaxAttempts",
        windowKey: "portalLoginWindowMin",
        label: "Portal login (/api/portal/login)",
        hint: "Per-IP limit for client-portal sign-in.",
      },
    ],
  },
  {
    title: "Password flows",
    fields: [
      {
        attemptsKey: "forgotPasswordMaxAttempts",
        windowKey: "forgotPasswordWindowMin",
        label: "Forgot password (/api/portal/forgot-password)",
        hint: "Tighter cap — each request triggers an outbound email.",
      },
      {
        attemptsKey: "setupPasswordMaxAttempts",
        windowKey: "setupPasswordWindowMin",
        label: "Setup password (/api/portal/setup-password)",
        hint: "Caps brute-force on the invite-link token.",
      },
    ],
  },
];

export function RateLimitsCard() {
  const [form, setForm] = useState<EditForm | null>(null);
  const [defaults, setDefaults] = useState<RateLimitConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/rate-limits", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setForm(configToForm(data.config));
      setDefaults(data.defaults);
    } catch (e: any) {
      toast.error("Failed to load rate-limit config", { description: e?.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateField(key: keyof EditForm, value: string) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      const payload = formToConfig(form);
      const res = await fetch("/api/settings/rate-limits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.errors?.join(" ") || data.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setForm(configToForm(data.config));
      toast.success("Rate limits updated", {
        description: "New limits are in effect (server cache was invalidated).",
      });
    } catch (e: any) {
      toast.error("Failed to save rate limits", { description: e?.message });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!defaults) return;
    setForm(configToForm(defaults));
    toast.info("Reset to defaults", {
      description: "Click “Save Changes” to persist the defaults.",
    });
  }

  return (
    <Card className="border-border/60 shadow-soft rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" /> Rate Limits
        </CardTitle>
        <CardDescription className="text-xs">
          Platform-wide rate limits for sensitive auth routes. Values are cached on the
          server for 5 minutes; saving applies changes immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading || !form ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <>
            {FIELD_GROUPS.map((group) => (
              <div key={group.title} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{group.title}</h4>
                  <Separator className="flex-1" />
                </div>
                {group.fields.map((f) => (
                  <div
                    key={f.attemptsKey}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-end gap-3"
                  >
                    <div className="space-y-1">
                      <Label htmlFor={String(f.attemptsKey)} className="text-xs">
                        {f.label}
                      </Label>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {f.hint}
                      </p>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={String(f.attemptsKey)} className="text-[11px] text-muted-foreground">
                          Max attempts
                        </Label>
                        <Input
                          id={String(f.attemptsKey)}
                          type="number"
                          min={1}
                          className="w-28 tabular"
                          value={String(form[f.attemptsKey])}
                          onChange={(e) => updateField(f.attemptsKey, e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={String(f.windowKey)} className="text-[11px] text-muted-foreground">
                          Window (min)
                        </Label>
                        <Input
                          id={String(f.windowKey)}
                          type="number"
                          min={1}
                          className="w-28 tabular"
                          value={String(form[f.windowKey])}
                          onChange={(e) => updateField(f.windowKey, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Middleware caps (in-memory, per-instance defense-in-depth) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Middleware caps (per-instance)</h4>
                <Separator className="flex-1" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                In-memory requests-per-minute caps applied by the edge middleware on every
                instance. These are defense-in-depth on top of the DB-backed limits above.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="middlewareLoginMaxRequests" className="text-[11px] text-muted-foreground">
                    Staff login (req/min)
                  </Label>
                  <Input
                    id="middlewareLoginMaxRequests"
                    type="number"
                    min={1}
                    className="w-28 tabular"
                    value={String(form.middlewareLoginMaxRequests)}
                    onChange={(e) => updateField("middlewareLoginMaxRequests", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="middlewarePortalLoginMaxRequests" className="text-[11px] text-muted-foreground">
                    Portal login (req/min)
                  </Label>
                  <Input
                    id="middlewarePortalLoginMaxRequests"
                    type="number"
                    min={1}
                    className="w-28 tabular"
                    value={String(form.middlewarePortalLoginMaxRequests)}
                    onChange={(e) => updateField("middlewarePortalLoginMaxRequests", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleReset} disabled={saving || !defaults}>
                <RotateCcw className="size-4 mr-1" /> Reset to Defaults
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Save className="size-4 mr-1" />}
                Save Changes
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default RateLimitsCard;

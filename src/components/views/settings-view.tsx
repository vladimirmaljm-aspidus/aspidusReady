"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { ShieldAlert, Building2, ShieldCheck, Mail, Upload, Loader2, UserCog, X, ImageIcon, Send, CheckCircle2, XCircle, Zap, AlertTriangle, Globe, Info } from "lucide-react";
import { useAppStore, isAdmin } from "@/lib/store/app-store";
import { CURRENCIES } from "@/lib/data/reference";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

type CompanyForm = {
  name: string;
  address: string;
  pib: string;
  mb: string;
  bank: string;
  account: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  tax_rate: number;
};

type SecurityForm = {
  min_password_length: number;
  require_uppercase: boolean;
  require_digit: boolean;
  require_symbol: boolean;
  password_expiry_days: number;
  max_failed_attempts: number;
  lockout_minutes: number;
  two_factor_required: boolean;
};

type CommsForm = {
  email_provider: "resend" | "postmark" | "smtp" | "none";
  // SMTP
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  // Resend
  resend_api_key: string;
  resend_from_email: string;
  // Postmark
  postmark_server_token: string;
  postmark_from_email: string;
  postmark_message_stream: string;
  // Common
  from_name: string;
  from_email: string;
  reply_to: string;
};

const DEFAULT_COMPANY: CompanyForm = {
  name: "", address: "", pib: "", mb: "", bank: "", account: "",
  phone: "", email: "", website: "", currency: "USD", tax_rate: 20,
};

const DEFAULT_SECURITY: SecurityForm = {
  min_password_length: 8,
  require_uppercase: true,
  require_digit: true,
  require_symbol: false,
  password_expiry_days: 90,
  max_failed_attempts: 5,
  lockout_minutes: 15,
  two_factor_required: false,
};

const DEFAULT_COMMS: CommsForm = {
  email_provider: "resend",
  smtp_host: "", smtp_port: 587, smtp_user: "", smtp_password: "",
  resend_api_key: "", resend_from_email: "",
  postmark_server_token: "", postmark_from_email: "", postmark_message_stream: "outbound",
  from_name: "", from_email: "", reply_to: "",
};

/**
 * Resolve a logo URL for display in the browser.
 * If the URL is a relative Supabase Storage path (e.g. "tenant-id/logo.png"),
 * construct the full public URL using NEXT_PUBLIC_SUPABASE_URL.
 */
function resolveLogoUrlForDisplay(logoUrl: string | null): string | null {
  if (!logoUrl) return null;
  // Already a full URL
  if (logoUrl.startsWith("http")) return logoUrl;
  // Mock URL (dev mode) — can't display
  if (logoUrl.startsWith("mock://")) return null;
  // Relative Supabase Storage path — construct the public URL
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (sbUrl) {
    return `${sbUrl}/storage/v1/object/public/tenant-logos/${logoUrl}`;
  }
  return null;
}

async function fetchSetting<T>(key: string, fallback: T, api: (path: string) => string): Promise<T> {
  const r = await fetch(api(`/api/settings?key=${key}`));
  if (!r.ok) throw new Error("Failed to load setting");
  const data = await r.json();
  return { ...fallback, ...(data.value || {}) } as T;
}

export function SettingsView() {
  const currentUser = useAppStore((s) => s.user);
  const admin = isAdmin(currentUser);

  if (!admin) {
    return (
      <div>
        <PageHeader title="Settings" />
        <Card className="border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
          <CardContent className="p-6 flex items-center gap-3">
            <ShieldAlert className="size-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Admin access required
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" description="Configure company, security, and communications." />
      <Tabs defaultValue="company">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="comms">Communications</TabsTrigger>
          <TabsTrigger value="integrations">API Keys</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <CompanyTab />
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="comms" className="mt-4">
          <CommsTab />
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="preferences" className="mt-4">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function useSettingLoader<T>(key: string, fallback: T) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [value, setValue] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSetting<T>(key, fallback, api)
      .then((v) => { if (active) setValue(v); })
      .catch(() => toast.error("Failed to load settings."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key]);
  void fallback;

  async function save(next: T) {
    setSaving(true);
    try {
      const r = await fetch(api("/api/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: next }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save settings");
      }
      toast.success("Settings saved.");
    } catch (e: any) {
      toast.error(e.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return { value, setValue, loading, saving, save };
}

function CompanyTab() {
  const { value, setValue, loading, saving, save } = useSettingLoader<CompanyForm>("company", DEFAULT_COMPANY);

  function set<K extends keyof CompanyForm>(k: K, v: CompanyForm[K]) {
    setValue((prev) => ({ ...prev, [k]: v }));
  }

  if (loading) {
    return (
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-soft rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building2 className="size-5" /> Company</CardTitle>
        <CardDescription>Company details used on offers and invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <Label>Name</Label>
            <Input value={value.name} onChange={(e) => set("name", e.target.value)} placeholder="Acme Inc." />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label>Address</Label>
            <Input value={value.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St, Springfield" />
          </div>
          <div className="space-y-1.5">
            <Label>Tax ID</Label>
            <Input value={value.pib} onChange={(e) => set("pib", e.target.value)} placeholder="100000000" className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Company Registration No.</Label>
            <Input value={value.mb} onChange={(e) => set("mb", e.target.value)} placeholder="00000000" className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Bank</Label>
            <Input value={value.bank} onChange={(e) => set("bank", e.target.value)} placeholder="Acme Bank" />
          </div>
          <div className="space-y-1.5">
            <Label>Account</Label>
            <Input value={value.account} onChange={(e) => set("account", e.target.value)} placeholder="123-4567890123456-78" className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={value.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={value.email} onChange={(e) => set("email", e.target.value)} placeholder="info@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input value={value.website} onChange={(e) => set("website", e.target.value)} placeholder="www.company.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={value.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tax rate (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={value.tax_rate}
              onChange={(e) => set("tax_rate", Number(e.target.value))}
              className="tabular"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <LogoUpload />

        <div className="mt-4 flex justify-end">
          <Button onClick={() => save(value)} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LogoUpload() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch tenant to get current logo
    fetch(api("/api/auth/me")).then(r => r.json()).then(data => {
      if (data.user?.tenant_id) {
        setTenantId(data.user.tenant_id);
        fetch(api(`/api/tenants`)).then(r => r.json()).then(tenants => {
          const t = tenants.items?.find((x: any) => x.id === data.user.tenant_id);
          if (t?.logo_url) setLogoUrl(t.logo_url);
        });
      }
    });
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const me = await fetch(api("/api/auth/me")).then(r => r.json());
      const tid = me.user?.tenant_id;
      if (!tid) { toast.error("No tenant context."); return; }
      setTenantId(tid);
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch(api(`/api/tenants/${tid}/logo`), { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Upload failed."); return; }
      setLogoUrl(data.url);
      toast.success("Logo uploaded. It will appear on all PDF documents.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!tenantId) return;
    setUploading(true);
    try {
      // Update tenant to clear logo_url
      const res = await fetch(api(`/api/tenants`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tenantId, logo_url: null }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        toast.error(e.error || "Failed to remove logo.");
        return;
      }
      setLogoUrl(null);
      toast.success("Logo removed.");
    } catch {
      toast.error("Failed to remove logo.");
    } finally {
      setUploading(false);
    }
  }

  const displayUrl = resolveLogoUrlForDisplay(logoUrl);

  return (
    <div className="mt-6 pt-6 border-t">
      <Label className="text-sm font-medium flex items-center gap-2">
        <ImageIcon className="size-4" />
        Company Logo
      </Label>
      <p className="text-xs text-muted-foreground mt-1 mb-4">
        Upload your company logo. It will appear in the top-right corner of all PDF documents (offers, invoices, proformas).
      </p>
      <div className="flex items-start gap-4">
        <div className="size-24 rounded-lg border-2 border-dashed border-border/60 flex items-center justify-center bg-muted/30 overflow-hidden relative group">
          {displayUrl ? (
            <>
              <img src={displayUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="absolute top-1 right-1 size-6 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                title="Remove logo"
              >
                <X className="size-3.5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground/40">
              <Building2 className="size-8" />
              <span className="text-[10px]">No logo</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleUpload}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Upload className="size-4 mr-1.5" />}
            {uploading ? "Uploading…" : "Upload Logo"}
          </Button>
          <p className="text-xs text-muted-foreground">PNG, JPEG, WebP or SVG · Max 2MB</p>
          {displayUrl && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ImageIcon className="size-3" /> Logo set — visible on PDFs
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const { value, setValue, loading, saving, save } = useSettingLoader<SecurityForm>("security_policy", DEFAULT_SECURITY);

  function set<K extends keyof SecurityForm>(k: K, v: SecurityForm[K]) {
    setValue((prev) => ({ ...prev, [k]: v }));
  }

  if (loading) {
    return (
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-soft rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5" /> Security</CardTitle>
        <CardDescription>Password policy and system access rules.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Minimum password length</Label>
            <Input type="number" min={4} max={128} value={value.min_password_length} onChange={(e) => set("min_password_length", Number(e.target.value))} className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Password expiry (days)</Label>
            <Input type="number" min={0} value={value.password_expiry_days} onChange={(e) => set("password_expiry_days", Number(e.target.value))} className="tabular" />
            <p className="text-xs text-muted-foreground">0 = never expires.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Max failed attempts</Label>
            <Input type="number" min={1} value={value.max_failed_attempts} onChange={(e) => set("max_failed_attempts", Number(e.target.value))} className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Lockout (minutes)</Label>
            <Input type="number" min={1} value={value.lockout_minutes} onChange={(e) => set("lockout_minutes", Number(e.target.value))} className="tabular" />
          </div>

          <ToggleRow
            label="Require uppercase"
            checked={value.require_uppercase}
            onCheckedChange={(v) => set("require_uppercase", v)}
          />
          <ToggleRow
            label="Require digit"
            checked={value.require_digit}
            onCheckedChange={(v) => set("require_digit", v)}
          />
          <ToggleRow
            label="Require symbol"
            checked={value.require_symbol}
            onCheckedChange={(v) => set("require_symbol", v)}
          />
          <ToggleRow
            label="Two-factor required"
            checked={value.two_factor_required}
            onCheckedChange={(v) => set("two_factor_required", v)}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => save(value)} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CommsTab() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const { value, setValue, loading, saving, save } = useSettingLoader<CommsForm>("comms", DEFAULT_COMMS);

  function set<K extends keyof CommsForm>(k: K, v: CommsForm[K]) {
    setValue((prev) => ({ ...prev, [k]: v }));
  }

  if (loading) {
    return (
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-soft rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mail className="size-5" /> Communications</CardTitle>
        <CardDescription>Configure how the system sends emails — portal invitations, KYC notifications, offers, invoices.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Provider picker */}
        <div className="space-y-2">
          <Label>Email provider</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <ProviderCard
              active={value.email_provider === "resend"}
              onClick={() => set("email_provider", "resend")}
              title="Resend"
              subtitle="Recommended"
              description="HTTP API — no SMTP blocks. Free: 100/day."
              badge="BEST"
            />
            <ProviderCard
              active={value.email_provider === "postmark"}
              onClick={() => set("email_provider", "postmark")}
              title="Postmark"
              subtitle="Transactional"
              description="Reliable HTTP API. Trial: 100/month."
            />
            <ProviderCard
              active={value.email_provider === "smtp"}
              onClick={() => set("email_provider", "smtp")}
              title="SMTP"
              subtitle="Traditional"
              description="Standard SMTP. May be blocked on free hosting."
            />
            <ProviderCard
              active={value.email_provider === "none"}
              onClick={() => set("email_provider", "none")}
              title="None"
              subtitle="Disabled"
              description="Queue emails for later (dev mode)."
            />
          </div>
        </div>

        {/* Common fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>From name</Label>
            <Input value={value.from_name} onChange={(e) => set("from_name", e.target.value)} placeholder="Aspidus CRM" />
          </div>
          <div className="space-y-1.5">
            <Label>From email</Label>
            <Input type="email" value={value.from_email} onChange={(e) => set("from_email", e.target.value)} placeholder="noreply@company.com" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Reply-to email (optional)</Label>
            <Input type="email" value={value.reply_to} onChange={(e) => set("reply_to", e.target.value)} placeholder="support@company.com" />
          </div>
        </div>

        {/* Resend fields */}
        {value.email_provider === "resend" && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Resend Configuration</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Resend is a modern email API that works reliably from any hosting
              provider (no SMTP port blocks). Free tier: 100 emails/day,
              3,000/month.
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">resend.com</a> (free)</li>
              <li>Go to API Keys → Create API Key → copy it (starts with <code className="bg-muted px-1 rounded">re_</code>)</li>
              <li>Paste the key below</li>
              <li>For production: add &amp; verify your domain in Resend dashboard</li>
              <li>For testing: use <code className="bg-muted px-1 rounded">onboarding@resend.dev</code> as the from email</li>
            </ol>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Resend API key</Label>
                <Input
                  type="password"
                  value={value.resend_api_key}
                  onChange={(e) => set("resend_api_key", e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Resend from email</Label>
                <Input
                  type="email"
                  value={value.resend_from_email}
                  onChange={(e) => set("resend_from_email", e.target.value)}
                  placeholder="onboarding@resend.dev (testing) or noreply@yourdomain.com (production)"
                />
                <p className="text-[11px] text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">onboarding@resend.dev</code> for testing.
                  For production, use an email on a domain you've verified in Resend.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SMTP fields */}
        {value.email_provider === "smtp" && (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <h4 className="text-sm font-semibold">SMTP Configuration</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: SMTP on ports 465/587 is blocked on Render free plan.
              If your test email times out, switch to Resend or Postmark.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>SMTP host</Label>
                <Input value={value.smtp_host} onChange={(e) => set("smtp_host", e.target.value)} placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-1.5">
                <Label>SMTP port</Label>
                <Input type="number" min={1} max={65535} value={value.smtp_port} onChange={(e) => set("smtp_port", Number(e.target.value))} placeholder="587" className="tabular" />
              </div>
              <div className="space-y-1.5">
                <Label>SMTP user</Label>
                <Input value={value.smtp_user} onChange={(e) => set("smtp_user", e.target.value)} placeholder="user@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label>SMTP password</Label>
                <Input type="password" value={value.smtp_password} onChange={(e) => set("smtp_password", e.target.value)} placeholder="••••••••" />
              </div>
            </div>
          </div>
        )}

        {/* Postmark fields */}
        {value.email_provider === "postmark" && (
          <div className="rounded-lg border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-sky-600" />
              <h4 className="text-sm font-semibold text-sky-900 dark:text-sky-200">Postmark Configuration</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Postmark is a reliable transactional email API by Wildbit.
              Excellent deliverability, no SMTP port blocks.
              Trial: 100 emails/month free.
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Sign up at <a href="https://postmarkapp.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">postmarkapp.com</a> (free trial)</li>
              <li>Create a Server → go to <strong>API Tokens</strong> → copy the <strong>Server API token</strong></li>
              <li>Go to <strong>Sender Signatures</strong> → add &amp; confirm your sending email</li>
              <li>Paste the server token below</li>
              <li>Use the confirmed email as the from email</li>
            </ol>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Postmark server token</Label>
                <Input
                  type="password"
                  value={value.postmark_server_token}
                  onChange={(e) => set("postmark_server_token", e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Postmark from email</Label>
                <Input
                  type="email"
                  value={value.postmark_from_email}
                  onChange={(e) => set("postmark_from_email", e.target.value)}
                  placeholder="noreply@yourdomain.com"
                />
                <p className="text-[11px] text-muted-foreground">
                  Must match a confirmed sender signature in Postmark.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Message stream</Label>
                <Input
                  value={value.postmark_message_stream}
                  onChange={(e) => set("postmark_message_stream", e.target.value)}
                  placeholder="outbound"
                />
                <p className="text-[11px] text-muted-foreground">
                  Default is "outbound". Use "broadcast" for bulk emails.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* None */}
        {value.email_provider === "none" && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="size-4 text-amber-600" />
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Email Disabled</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Emails will be queued in the Mail Queue but not sent. Choose
              Resend or SMTP above to enable sending.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={() => save(value)} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>

        <EmailTestSection value={value} />
      </CardContent>
    </Card>
  );
}

/** Provider picker card */
function ProviderCard({
  active, onClick, title, subtitle, description, badge,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative text-left p-3 rounded-lg border-2 transition-all smooth " +
        (active
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/60 hover:border-border hover:bg-muted/30")
      }
    >
      {badge && (
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-600 text-white">
          {badge}
        </span>
      )}
      <div className="flex items-baseline justify-between gap-1">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{subtitle}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </button>
  );
}

/**
 * Email test panel — sends a real test email using the currently-selected
 * provider. Lets the admin verify the config BEFORE saving.
 */
function EmailTestSection({ value }: { value: CommsForm }) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<
    | { ok: true; messageId?: string; provider?: string; testedAt?: string }
    | { ok: false; error: string; category?: string }
    | null
  >(null);

  async function runTest() {
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      setResult({ ok: false, error: "Enter a valid recipient email address." });
      return;
    }
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch(api("/api/settings/test-email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          provider: value.email_provider,
          // Resend
          resend_api_key: value.resend_api_key,
          resend_from_email: value.resend_from_email,
          // Postmark
          postmark_server_token: value.postmark_server_token,
          postmark_from_email: value.postmark_from_email,
          postmark_message_stream: value.postmark_message_stream,
          // SMTP
          smtp_host: value.smtp_host,
          smtp_port: value.smtp_port,
          smtp_user: value.smtp_user,
          smtp_password: value.smtp_password,
          // Common
          from_name: value.from_name,
          from_email: value.from_email,
          reply_to: value.reply_to,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ ok: false, error: e?.message || "Network error" });
    } finally {
      setTesting(false);
    }
  }

  const canTest =
    value.email_provider === "resend"
      ? !!value.resend_api_key
      : value.email_provider === "postmark"
        ? !!value.postmark_server_token
        : value.email_provider === "smtp"
          ? !!value.smtp_host && !!value.smtp_user
          : false;

  return (
    <div className="mt-2 pt-5 border-t border-border/60">
      <div className="flex items-center gap-2 mb-2">
        <Send className="size-4 text-primary" />
        <h4 className="text-sm font-semibold">Test Email Configuration</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Send a test email to verify your {value.email_provider === "resend" ? "Resend" : value.email_provider === "smtp" ? "SMTP" : ""} settings work.
        Uses the values currently entered above (you can test before saving).
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="recipient@example.com"
          className="flex-1"
          disabled={testing}
          onKeyDown={(e) => {
            if (e.key === "Enter") runTest();
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={runTest}
          disabled={testing || !canTest}
          className="gap-2"
        >
          {testing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending test…
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send test email
            </>
          )}
        </Button>
      </div>

      {result && (
        <div
          className={
            "mt-3 p-3 rounded-lg border text-sm " +
            (result.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-destructive/10 border-destructive/30 text-destructive")
          }
        >
          {result.ok ? (
            <div className="space-y-1">
              <p className="font-medium flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                Test email sent successfully via {result.provider || "provider"}
              </p>
              {result.messageId && (
                <p className="text-xs opacity-80 font-mono">
                  Message ID: {result.messageId}
                </p>
              )}
              <p className="text-xs opacity-80">
                Check the recipient inbox (and spam folder) for the test message.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-medium flex items-center gap-1.5">
                <XCircle className="size-4" />
                Test failed
              </p>
              <p className="text-xs">{result.error}</p>
              {result.category && (
                <p className="text-xs opacity-80">
                  {result.category === "host_unreachable" &&
                    "Hint: check that the SMTP host and port are correct and that your network allows outbound SMTP."}
                  {result.category === "auth_failed" &&
                    "Hint: the username or password / API key is incorrect. For Gmail, use an App Password, not your account password."}
                  {result.category === "timeout" &&
                    "Hint: the server did not respond in time. SMTP on ports 465/587 is blocked on Render free plan — switch to Resend."}
                  {result.category === "tls" &&
                    "Hint: TLS/certificate problem. If you trust the server, try port 587 with STARTTLS."}
                  {result.category === "domain_not_verified" &&
                    "Hint: your Resend sending domain is not verified. Use onboarding@resend.dev for testing, or verify your domain in Resend dashboard."}
                  {result.category === "rate_limit" &&
                    "Hint: Resend free tier allows 100 emails/day. Upgrade or wait until tomorrow."}
                  {result.category === "missing_config" &&
                    "Hint: fill in the provider configuration above first."}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── API Integrations Tab ─────────────────────────────────────────────

type IntegrationsForm = {
  exchangerate_api_key: string;
  alphavantage_api_key: string;
  openweather_api_key: string;
  searates_api_key: string;
  uncomtrade_api_key: string;
};

const DEFAULT_INTEGRATIONS: IntegrationsForm = {
  exchangerate_api_key: "",
  alphavantage_api_key: "",
  openweather_api_key: "",
  searates_api_key: "",
  uncomtrade_api_key: "",
};

function IntegrationsTab() {
  const { value, setValue, loading, saving, save } = useSettingLoader<IntegrationsForm>("integrations", DEFAULT_INTEGRATIONS);

  function set<K extends keyof IntegrationsForm>(k: K, v: IntegrationsForm[K]) {
    setValue((prev) => ({ ...prev, [k]: v }));
  }

  if (loading) {
    return (
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Intro */}
      <Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Globe className="size-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">API Integrations</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Connect external data services to enrich your trade platform. Each integration
                provides different data — currency rates, commodity prices, container tracking,
                weather, sanctions checks, and more. All keys are stored securely and only visible to admins.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1. ExchangeRate-API */}
      <ApiIntegrationCard
        title="Exchange Rate API"
        description="Live currency conversion for offers, invoices, and trade calculations."
        icon="💱"
        badge="1,500/month FREE"
        badgeColor="emerald"
        apiKey={value.exchangerate_api_key}
        onChange={(v) => set("exchangerate_api_key", v)}
        steps={[
          "Go to https://www.exchangerate-api.com",
          "Click 'Get Free API Key' (no credit card needed)",
          "Sign up with your email",
          "Copy the API key from your dashboard (starts with a hex string)",
          "Paste it below and click Save",
        ]}
        testUrl="/api/integrations/exchange-rates?from=USD&to=EUR&amount=100"
        testLabel="Test: Convert 100 USD → EUR"
        note="Works without API key too (uses free ECB fallback rates, updated daily at 16:00 CET). API key gives real-time rates."
      />

      {/* 2. Alpha Vantage */}
      <ApiIntegrationCard
        title="Alpha Vantage — Commodity Prices"
        description="Live prices for sugar, coffee, cocoa, corn, wheat, copper, oil, cotton, and more."
        icon="📈"
        badge="25/day FREE"
        badgeColor="amber"
        apiKey={value.alphavantage_api_key}
        onChange={(v) => set("alphavantage_api_key", v)}
        steps={[
          "Go to https://www.alphavantage.co/support/#api-key",
          "Fill in the form (name, email)",
          "You'll receive your API key instantly (starts with letters/numbers)",
          "Paste it below and click Save",
        ]}
        testUrl="/api/integrations/commodities?symbol=SUGAR"
        testLabel="Test: Get current sugar price"
        note="25 API calls per day. Data is cached for 12 hours so each commodity only uses 1 call per day."
      />

      {/* 3. OpenWeatherMap */}
      <ApiIntegrationCard
        title="OpenWeatherMap — Port Weather"
        description="Current weather conditions at shipping ports for logistics planning."
        icon="🌤️"
        badge="1,000/day FREE"
        badgeColor="sky"
        apiKey={value.openweather_api_key}
        onChange={(v) => set("openweather_api_key", v)}
        steps={[
          "Go to https://openweathermap.org/api",
          "Click 'Sign Up' (free, no credit card)",
          "After registration, go to your profile → API Keys",
          "Copy the default API key (32-character hex string)",
          "Paste it below and click Save",
        ]}
        testUrl="/api/integrations/weather?lat=25.01&lon=55.06"
        testLabel="Test: Weather at Jebel Ali port (Dubai)"
        note="Weather data is cached for 30 minutes. Shows temperature, wind, humidity, and conditions."
      />

      {/* 4. SeaRates */}
      <ApiIntegrationCard
        title="SeaRates — Container Tracking"
        description="Track shipping containers in real-time across 150+ shipping lines (MAERSK, MSC, CMA CGM, etc.)."
        icon="🚢"
        badge="100/month FREE"
        badgeColor="blue"
        apiKey={value.searates_api_key}
        onChange={(v) => set("searates_api_key", v)}
        steps={[
          "Go to https://www.searates.com",
          "Click 'Sign Up' and create a free account",
          "After login, go to 'My Profile' → 'API Access'",
          "Click 'Generate API Key'",
          "Copy the key and paste it below",
        ]}
        testUrl={null}
        testLabel="Test with a container number in the Logistics module"
        note="100 tracking requests per month. Covers MAERSK, MSC, CMA CGM, COSCO, Hapag-Lloyd, ONE, Yang Ming, and more."
      />

      {/* 5. UN Comtrade */}
      <ApiIntegrationCard
        title="UN Comtrade — Trade Statistics"
        description="Official UN international trade data: import/export values by country pair and HS code."
        icon="🌐"
        badge="500/day FREE"
        badgeColor="violet"
        apiKey={value.uncomtrade_api_key}
        onChange={(v) => set("uncomtrade_api_key", v)}
        steps={[
          "Go to https://comtradeapi.un.org",
          "Click 'Register' and fill in your details",
          "After email verification, log in",
          "Go to 'Profile' → copy your 'Subscription Key' (32-character hex string)",
          "Paste it below and click Save",
        ]}
        testUrl={null}
        testLabel="Test in the Trade module — search import/export data by country"
        note="500 API calls per day. Shows official trade statistics: how much of a product was imported/exported between any two countries."
      />

      {/* Always-on (no key needed) integrations */}
      <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="size-5 text-emerald-600" />
            Always Active (No Setup Needed)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/40">
            <span className="text-xl">🌍</span>
            <div>
              <p className="text-sm font-medium">Countries & Cities Database</p>
              <p className="text-xs text-muted-foreground">125 countries with 15+ cities each, flags, currencies, calling codes. Our own embedded data — always works.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/40">
            <span className="text-xl">⚓</span>
            <div>
              <p className="text-sm font-medium">World Port Index</p>
              <p className="text-xs text-muted-foreground">120+ major ports with UN/LOCODE and coordinates. Auto-completes POL/POD fields.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/40">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-sm font-medium">Address Autocomplete (Nominatim/OSM)</p>
              <p className="text-xs text-muted-foreground">Free address search via OpenStreetMap. No API key needed — just start typing an address.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/40">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium">OFAC Sanctions Check</p>
              <p className="text-xs text-muted-foreground">Search the US Treasury SDN list. Free public data. Check any partner name before doing business.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/40">
            <span className="text-xl">📋</span>
            <div>
              <p className="text-sm font-medium">Trade Advisor (FTA + Tariffs)</p>
              <p className="text-xs text-muted-foreground">Checks Free Trade Agreements, tariff rates, and required documents between any two countries. Built-in FTA database.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save(value)} disabled={saving}>
          {saving ? "Saving…" : "Save API Keys"}
        </Button>
      </div>
    </div>
  );
}

function ApiIntegrationCard({
  title,
  description,
  icon,
  badge,
  badgeColor,
  apiKey,
  onChange,
  steps,
  testUrl,
  testLabel,
  note,
}: {
  title: string;
  description: string;
  icon: string;
  badge: string;
  badgeColor: "emerald" | "amber" | "sky" | "blue" | "violet";
  apiKey: string;
  onChange: (v: string) => void;
  steps: string[];
  testUrl: string | null;
  testLabel: string;
  note?: string;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [showSteps, setShowSteps] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function runTest() {
    if (!testUrl || !apiKey) return;
    setTesting(true);
    setTestResult(null);
    try {
      const r = await fetch(testUrl);
      const data = await r.json();
      if (data.error) {
        setTestResult(`❌ ${data.error}`);
      } else if (data.rate) {
        setTestResult(`✅ Success! Rate: ${data.rate} (source: ${data.source})`);
      } else if (data.price) {
        setTestResult(`✅ Success! Price: $${data.price} (change: ${data.changePct}%)`);
      } else if (data.temperature !== undefined) {
        setTestResult(`✅ Success! ${data.location}: ${data.temperature}°C, ${data.description}`);
      } else if (data.items) {
        setTestResult(`✅ Success! ${data.items.length || data.total} results`);
      } else {
        setTestResult(`✅ Connected successfully`);
      }
    } catch (e: any) {
      setTestResult(`❌ ${e.message}`);
    } finally {
      setTesting(false);
    }
  }

  const badgeClasses: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    sky: "bg-sky-500/10 text-sky-700 border-sky-500/30",
    blue: "bg-blue-500/10 text-blue-700 border-blue-500/30",
    violet: "bg-violet-500/10 text-violet-700 border-violet-500/30",
  };

  return (
    <Card className="border-border/60 shadow-soft rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={badgeClasses[badgeColor]}>{badge}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>API Key</Label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your API key here…"
            className="font-mono"
          />
        </div>

        {note && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 text-xs text-muted-foreground">
            <Info className="size-3.5 shrink-0 mt-0.5" />
            <span>{note}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {testUrl && (
            <Button
              variant="secondary"
              size="sm"
              onClick={runTest}
              disabled={testing || !apiKey}
              className="gap-1.5"
            >
              {testing ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
              {testLabel}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSteps(!showSteps)}
            className="gap-1.5"
          >
            <Info className="size-3.5" />
            {showSteps ? "Hide setup guide" : "How to get API key?"}
          </Button>
        </div>

        {testResult && (
          <div className={`p-2.5 rounded-lg text-xs ${testResult.startsWith("✅") ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive"}`}>
            {testResult}
          </div>
        )}

        {showSteps && (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold mb-2">Step-by-step setup guide:</p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              {steps.map((step, i) => (
                <li key={i} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label, checked, onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
      <p className="text-sm font-medium">{label}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ─── User Preferences Tab ────────────────────────────────────────────────

const PREF_DEFAULTS: Record<string, string> = {
  ui_language: "en",
  default_view: "dashboard",
  date_format: "YYYY-MM-DD",
  number_format: "1,234.56",
  items_per_page: "25",
  compact_mode: "false",
  email_notifications: "true",
  push_notifications: "true",
  auto_refresh_dashboard: "false",
  auto_refresh_interval: "60",
};

function PreferencesTab() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [prefs, setPrefs] = useState<Record<string, string>>(PREF_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(api("/api/user-preferences"))
      .then((r) => r.json())
      .then((data) => {
        if (active && data.map) {
          setPrefs((prev) => {
            const next = { ...prev };
            for (const [k, v] of Object.entries(data.map as Record<string, unknown>)) {
              next[k] = String(v);
            }
            return next;
          });
        }
      })
      .catch(() => toast.error("Failed to load preferences."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function savePref(key: string, value: string) {
    setSaving(true);
    try {
      const r = await fetch(api("/api/user-preferences"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save");
      }
      setPrefs((prev) => ({ ...prev, [key]: value }));
      toast.success("Preference saved.");
    } catch (e: any) {
      toast.error(e.message || "Failed to save preference.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    setSaving(true);
    try {
      const entries = Object.entries(prefs);
      await Promise.all(
        entries.map(([key, value]) =>
          fetch(api("/api/user-preferences"), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value }),
          })
        )
      );
      toast.success("All preferences saved.");
    } catch {
      toast.error("Failed to save some preferences.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-soft rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UserCog className="size-5" /> My Preferences</CardTitle>
        <CardDescription>Personalize your experience — language, display, and notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language */}
          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select value={prefs.ui_language} onValueChange={(v) => savePref("ui_language", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Default View */}
          <div className="space-y-1.5">
            <Label>Default View</Label>
            <Select value={prefs.default_view} onValueChange={(v) => savePref("default_view", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="partners">Partners</SelectItem>
                <SelectItem value="deals">Deals</SelectItem>
                <SelectItem value="offers">Offers</SelectItem>
                <SelectItem value="invoices">Invoices</SelectItem>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-1.5">
            <Label>Date Format</Label>
            <Select value={prefs.date_format} onValueChange={(v) => savePref("date_format", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number Format */}
          <div className="space-y-1.5">
            <Label>Number Format</Label>
            <Select value={prefs.number_format} onValueChange={(v) => savePref("number_format", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1,234.56">1,234.56 (comma thousands)</SelectItem>
                <SelectItem value="1.234,56">1.234,56 (dot thousands)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Per Page */}
          <div className="space-y-1.5">
            <Label>Items Per Page</Label>
            <Select value={prefs.items_per_page} onValueChange={(v) => savePref("items_per_page", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto-refresh Interval (shown when auto-refresh is on) */}
          <div className="space-y-1.5">
            <Label>Auto-refresh Interval</Label>
            <Select
              value={prefs.auto_refresh_interval}
              onValueChange={(v) => savePref("auto_refresh_interval", v)}
              disabled={prefs.auto_refresh_dashboard !== "true"}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium text-muted-foreground mb-3">Display &amp; Notifications</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleRow
              label="Compact Mode (dense table rows)"
              checked={prefs.compact_mode === "true"}
              onCheckedChange={(v) => savePref("compact_mode", String(v))}
            />
            <ToggleRow
              label="Email Notifications"
              checked={prefs.email_notifications === "true"}
              onCheckedChange={(v) => savePref("email_notifications", String(v))}
            />
            <ToggleRow
              label="Push Notifications"
              checked={prefs.push_notifications === "true"}
              onCheckedChange={(v) => savePref("push_notifications", String(v))}
            />
            <ToggleRow
              label="Auto-refresh Dashboard"
              checked={prefs.auto_refresh_dashboard === "true"}
              onCheckedChange={(v) => savePref("auto_refresh_dashboard", String(v))}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={saveAll} disabled={saving}>
            {saving ? "Saving…" : "Save All"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

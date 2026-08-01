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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { ShieldAlert, Building2, ShieldCheck, Mail, Upload, Loader2, UserCog, X, ImageIcon, Send, CheckCircle2, XCircle } from "lucide-react";
import { useAppStore, isAdmin } from "@/lib/store/app-store";
import { CURRENCIES } from "@/lib/data/reference";

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
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_name: string;
  from_email: string;
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
  smtp_host: "", smtp_port: 587, smtp_user: "", smtp_password: "",
  from_name: "", from_email: "",
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

async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  const r = await fetch(`/api/settings?key=${key}`);
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
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="comms">Communications</TabsTrigger>
          <TabsTrigger value="preferences">My Preferences</TabsTrigger>
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
        <TabsContent value="preferences" className="mt-4">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function useSettingLoader<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSetting<T>(key, fallback)
      .then((v) => { if (active) setValue(v); })
      .catch(() => toast.error("Failed to load settings."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key]);
  void fallback;

  async function save(next: T) {
    setSaving(true);
    try {
      const r = await fetch("/api/settings", {
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
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch tenant to get current logo
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.user?.tenant_id) {
        setTenantId(data.user.tenant_id);
        fetch(`/api/tenants`).then(r => r.json()).then(tenants => {
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
      const me = await fetch("/api/auth/me").then(r => r.json());
      const tid = me.user?.tenant_id;
      if (!tid) { toast.error("No tenant context."); return; }
      setTenantId(tid);
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch(`/api/tenants/${tid}/logo`, { method: "POST", body: formData });
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
      const res = await fetch(`/api/tenants`, {
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
        <CardDescription>SMTP configuration for sending email from the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="space-y-1.5">
            <Label>From name</Label>
            <Input value={value.from_name} onChange={(e) => set("from_name", e.target.value)} placeholder="CRM Acme" />
          </div>
          <div className="space-y-1.5">
            <Label>From email</Label>
            <Input type="email" value={value.from_email} onChange={(e) => set("from_email", e.target.value)} placeholder="noreply@company.com" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => save(value)} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>

        <SMTPTestSection value={value} />
      </CardContent>
    </Card>
  );
}

/**
 * SMTP test panel — lets the admin verify the saved SMTP configuration by
 * sending a real test email to any address. Uses the values currently typed
 * into the form (so the admin can test BEFORE saving).
 */
function SMTPTestSection({ value }: { value: CommsForm }) {
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<
    | { ok: true; messageId?: string; response?: string; testedAt?: string }
    | { ok: false; error: string; category?: string }
    | null
  >(null);

  async function runTest() {
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      setResult({ ok: false, error: "Enter a valid recipient email address." });
      return;
    }
    if (!value.smtp_host || !value.smtp_user) {
      setResult({
        ok: false,
        error: "Fill in SMTP host and user above first.",
      });
      return;
    }
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch("/api/settings/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          smtp_host: value.smtp_host,
          smtp_port: value.smtp_port,
          smtp_user: value.smtp_user,
          smtp_password: value.smtp_password,
          from_email: value.from_email,
          from_name: value.from_name,
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

  return (
    <div className="mt-6 pt-6 border-t border-border/60">
      <div className="flex items-center gap-2 mb-2">
        <Send className="size-4 text-primary" />
        <h4 className="text-sm font-semibold">Test SMTP Configuration</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Send a test email to verify your SMTP settings work. Uses the values
        currently entered above (you can test before saving).
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
          disabled={testing || !value.smtp_host}
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
                Test email sent successfully
              </p>
              {result.messageId && (
                <p className="text-xs opacity-80 font-mono">
                  Message ID: {result.messageId}
                </p>
              )}
              <p className="text-xs opacity-80">
                Check the recipient inbox (and spam folder) for the test
                message.
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
                    "Hint: the username or password is incorrect. For Gmail, use an App Password, not your account password."}
                  {result.category === "timeout" &&
                    "Hint: the server did not respond in time. Try a different port (465 for SSL, 587 for STARTTLS)."}
                  {result.category === "tls" &&
                    "Hint: TLS/certificate problem. If you trust the server, try port 587 with STARTTLS."}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
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
  const [prefs, setPrefs] = useState<Record<string, string>>(PREF_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/user-preferences")
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
      const r = await fetch("/api/user-preferences", {
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
          fetch("/api/user-preferences", {
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

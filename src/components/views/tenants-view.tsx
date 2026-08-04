"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus, Pencil, Trash2, Building2, ShieldAlert, Users, Globe, CreditCard,
  CheckCircle2, Layers, ChevronDown, ImageIcon, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard } from "@/components/common/kpi-card";
import { fmtDate } from "@/lib/utils/format";
import { Tenant } from "@/lib/supabase/types";
import { useAppStore, isSuperAdmin } from "@/lib/store/app-store";
import { COUNTRIES, CURRENCIES } from "@/lib/data/reference";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

// ---- helpers ----
function flagEmoji(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const cc = countryCode.toUpperCase();
  const codePoints = [...cc].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

function countryLabel(code: string | null | undefined): string {
  if (!code) return "—";
  const c = COUNTRIES.find((x) => x.code === code);
  return c ? c.name : code;
}

type Plan = Tenant["plan"];
type TenantStatus = Tenant["status"];

const PLAN_LABELS: Record<Plan, string> = {
  trial: "Trial", starter: "Starter", business: "Business", enterprise: "Enterprise",
};

const PLAN_BADGE: Record<Plan, string> = {
  trial: "bg-secondary text-secondary-foreground",
  starter: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  business: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  enterprise: "bg-primary/10 text-primary border-primary/30",
};

const STATUS_LABELS: Record<TenantStatus, string> = {
  active: "Active", suspended: "Suspended", cancelled: "Cancelled",
};

const STATUS_BADGE: Record<TenantStatus, string> = {
  active: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export function TenantsView({ embedded = false }: { embedded?: boolean } = {}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const user = useAppStore((s) => s.user);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isSuper = isSuperAdmin(user);

  const { data, isLoading } = useQuery({
    queryKey: ["tenants", tenantKey],
    queryFn: async () => {
      const r = await fetch(api("/api/tenants"));
      if (!r.ok) throw new Error("Failed to load tenants");
      return r.json() as Promise<{ items: Tenant[] }>;
    },
    enabled: isSuper,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/tenants/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Tenant deleted.");
      qc.invalidateQueries({ queryKey: ["tenants", tenantKey] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  if (!isSuper) {
    return (
      <div>
        <PageHeader title="Tenants" description="Platform-wide tenant administration." />
        <Card className="border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/5">
          <CardContent className="p-6 flex items-start gap-3">
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="font-medium">Platform admin access required.</p>
              <p className="text-sm text-muted-foreground mt-1">
                This area is restricted to platform super-administrators. Contact your platform operator if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = data?.items || [];
  const totalTenants = items.length;
  const activeCount = items.filter((t) => t.status === "active").length;
  const planBreakdown: Record<Plan, number> = { trial: 0, starter: 0, business: 0, enterprise: 0 };
  items.forEach((t) => { planBreakdown[t.plan]++; });

  return (
    <div>
      <PageHeader
        title="Tenants"
        description={`${totalTenants} total`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> New Tenant
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Tenants" value={totalTenants} icon={Building2} sub="Across platform" />
        <KpiCard label="Active" value={activeCount} icon={CheckCircle2} sub={`${totalTenants > 0 ? Math.round((activeCount / totalTenants) * 100) : 0}% of total`} />
        <KpiCard
          label="Plan Breakdown"
          value={`${planBreakdown.business}b · ${planBreakdown.enterprise}e`}
          icon={Layers}
          sub={`trial ${planBreakdown.trial} · starter ${planBreakdown.starter}`}
        />
        <KpiCard label="Total User Seats" value={items.reduce((s, t) => s + (t.max_users || 0), 0)} icon={Users} sub="Allocated capacity" />
      </div>

      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Building2 className="size-6" />}
              title="No tenants"
              description="Create your first tenant to get started."
              action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New Tenant</Button>}
            />
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Country</TableHead>
                    <TableHead className="hidden lg:table-cell">Currency</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {t.primary_color && (
                            <span className="size-3 rounded-full border border-border/60 shrink-0" style={{ backgroundColor: t.primary_color }} />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate">{t.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{t.legal_name || "—"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-base leading-none">{flagEmoji(t.country) || "🏳️"}</span>
                          <span>{countryLabel(t.country)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="font-mono tabular">{t.currency}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={PLAN_BADGE[t.plan]}>{PLAN_LABELS[t.plan]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_BADGE[t.status]}>{STATUS_LABELS[t.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular text-sm">{t.max_users}</TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground tabular">{fmtDate(t.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditing(t); setShowForm(true); }} title="Edit">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(t.id)} title="Delete">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TenantFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        tenant={editing}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["tenants", tenantKey] });
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All tenant data, users, and configuration will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMut.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Form dialog ----
function TenantFormDialog({
  open, onOpenChange, tenant, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tenant: Tenant | null;
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [form, setForm] = useState<Partial<Tenant>>({});
  const [saving, setSaving] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [bankingOpen, setBankingOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const isEditing = !!tenant;

  useEffect(() => {
    if (open) {
      setForm(tenant
        ? { ...tenant }
        : ({
            name: "", legal_name: "", country: "", currency: "EUR",
            tax_id: "", vat_number: "", registration_number: "",
            address_line: "", city: "", postal_code: "",
            bank_name: "", bank_iban: "", bank_swift: "",
            plan: "business", status: "active", max_users: 10, primary_color: "",
          } as Partial<Tenant>));
      setLogoFile(null);
      setLogoPreview(tenant?.logo_url || null);
      // When editing, expand sections that have data
      if (tenant) {
        const hasAddress = tenant.address_line || tenant.city || tenant.postal_code;
        const hasBanking = tenant.bank_name || tenant.bank_iban || tenant.bank_swift;
        setAddressOpen(!!hasAddress);
        setBankingOpen(!!hasBanking);
        setSubscriptionOpen(true); // always show subscription when editing
      } else {
        setAddressOpen(false);
        setBankingOpen(false);
        setSubscriptionOpen(false);
      }
    }
  }, [open, tenant]);

  function set<K extends keyof Tenant>(k: K, v: Tenant[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadLogo(tenantId: string, file: File) {
    const formData = new FormData();
    formData.append("logo", file);
    const r = await fetch(api(`/api/tenants/${tenantId}/logo`), {
      method: "POST",
      body: formData,
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || "Logo upload failed");
    }
    return r.json();
  }

  async function save() {
    if (!form.name) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      const method = tenant ? "PUT" : "POST";
      const url = tenant ? api(`/api/tenants/${tenant.id}`) : api("/api/tenants");
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Request failed");
      }
      const result = await r.json();
      const savedId = tenant?.id || result?.id;

      // Upload logo if a new file was selected
      if (logoFile && savedId) {
        try {
          await uploadLogo(savedId, logoFile);
        } catch (uploadErr: unknown) {
          toast.error(uploadErr instanceof Error ? uploadErr.message : "Logo upload failed.");
          // Still consider the tenant saved, just the logo failed
          onSaved();
          return;
        }
      }

      toast.success(tenant ? "Tenant updated." : `"${form.name}" created successfully!`);
      onSaved();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  // Helper: check if a collapsed section has data
  const sectionBadge = (hasData: boolean) =>
    hasData ? <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">Filled</Badge> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{tenant ? "Edit tenant" : "New tenant"}</DialogTitle>
          <DialogDescription>
            {tenant ? "Update the tenant details." : "Start with the basics — you can add more details later."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-4 py-2">

            {/* ── Logo ── */}
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="size-16 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="size-full object-contain" />
                  ) : (
                    <ImageIcon className="size-8 text-muted-foreground/40" />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <Label className="text-sm">Company Logo</Label>
                <div className="flex items-center gap-2">
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                      <Upload className="size-3.5" />
                      Upload Logo
                    </span>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setLogoFile(f);
                          const reader = new FileReader();
                          reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
                          reader.readAsDataURL(f);
                        }
                      }}
                    />
                  </label>
                </div>
                {logoFile && (
                  <p className="text-xs text-muted-foreground truncate">{logoFile.name}</p>
                )}
                <p className="text-xs text-muted-foreground">PNG, JPEG, WebP or SVG. Max 2MB.</p>
              </div>
            </div>

            <Separator />

            {/* ── Essential fields (always visible) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Company Name *</Label>
                <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Acme Trading" autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Select value={form.country || ""} onValueChange={(v) => set("country", v)}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="mr-2">{flagEmoji(c.code)}</span>{c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={form.currency || "EUR"} onValueChange={(v) => set("currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="font-mono mr-2">{c.value}</span> {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Legal & Tax (collapsible) ── */}
            <Collapsible open={addressOpen} onOpenChange={setAddressOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between px-0 hover:bg-transparent">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Legal & Address
                    {sectionBadge(!!(form.legal_name || form.tax_id || form.vat_number || form.registration_number || form.address_line || form.city || form.postal_code))}
                  </span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${addressOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <Label>Legal name</Label>
                    <Input value={form.legal_name || ""} onChange={(e) => set("legal_name", e.target.value)} placeholder="Acme Trading Ltd." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tax ID</Label>
                    <Input value={form.tax_id || ""} onChange={(e) => set("tax_id", e.target.value)} placeholder="e.g. 123456789" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>VAT number</Label>
                    <Input value={form.vat_number || ""} onChange={(e) => set("vat_number", e.target.value)} placeholder="e.g. RS123456789" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Registration number</Label>
                    <Input value={form.registration_number || ""} onChange={(e) => set("registration_number", e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Address</Label>
                    <Input value={form.address_line || ""} onChange={(e) => set("address_line", e.target.value)} placeholder="Street and number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Postal code</Label>
                    <Input value={form.postal_code || ""} onChange={(e) => set("postal_code", e.target.value)} />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* ── Banking (collapsible) ── */}
            <Collapsible open={bankingOpen} onOpenChange={setBankingOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between px-0 hover:bg-transparent">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Bank Details
                    {sectionBadge(!!(form.bank_name || form.bank_iban || form.bank_swift))}
                  </span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${bankingOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <Label>Bank name</Label>
                    <Input value={form.bank_name || ""} onChange={(e) => set("bank_name", e.target.value)} placeholder="e.g. National Bank" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>IBAN</Label>
                    <Input value={form.bank_iban || ""} onChange={(e) => set("bank_iban", e.target.value)} placeholder="e.g. RS35107007000000123456" className="font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>SWIFT / BIC</Label>
                    <Input value={form.bank_swift || ""} onChange={(e) => set("bank_swift", e.target.value)} placeholder="e.g. NBORCSBG" className="font-mono" />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* ── Subscription (collapsible) ── */}
            <Collapsible open={subscriptionOpen} onOpenChange={setSubscriptionOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between px-0 hover:bg-transparent">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Subscription & Settings
                    {sectionBadge(true)}
                  </span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${subscriptionOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <Label>Plan</Label>
                    <Select value={form.plan || "business"} onValueChange={(v) => set("plan", v as Plan)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={form.status || "active"} onValueChange={(v) => set("status", v as TenantStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max users</Label>
                    <Input type="number" min={1} value={form.max_users ?? 10} onChange={(e) => set("max_users", Number(e.target.value))} className="tabular" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Primary color (optional)</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.primary_color || "#0f766e"}
                        onChange={(e) => set("primary_color", e.target.value)}
                        className="size-9 rounded-md border border-border cursor-pointer bg-background p-1"
                        aria-label="Primary color"
                      />
                      <Input
                        value={form.primary_color || ""}
                        onChange={(e) => set("primary_color", e.target.value)}
                        placeholder="#0f766e"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : tenant ? "Save changes" : "Create tenant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

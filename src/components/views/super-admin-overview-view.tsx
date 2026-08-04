"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Building2, Users, Handshake, FileText, ShieldAlert, Globe, ArrowRight,
  Activity, Server, Heart, CircleDot, Clock, Plus, Pencil, Trash2,
  ShieldCheck, Eye, Repeat, Loader2, HardDrive, PieChart,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { KpiCard } from "@/components/common/kpi-card";
import { EmptyState } from "@/components/common/empty-state";
import { fmtDate, fmtDateTime, fmtNumber, fmtRelative } from "@/lib/utils/format";
import { Tenant, AuditLog } from "@/lib/supabase/types";
import { useAppStore, isSuperAdmin } from "@/lib/store/app-store";
import { CURRENCIES, COUNTRIES } from "@/lib/data/reference";
import { toast } from "sonner";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

type Plan = Tenant["plan"];
type TenantStatus = Tenant["status"];

interface TenantStats {
  tenant: Tenant;
  partner_count: number;
  deal_count: number;
  offer_count: number;
  invoice_count: number;
  user_count: number;
}

interface OverviewData {
  total_tenants: number;
  total_users: number;
  total_partners: number;
  total_offers: number;
  total_invoices: number;
  active_tenants: number;
  tenants: TenantStats[];
  recent_activity: AuditLog[];
}

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial", starter: "Starter", business: "Business", enterprise: "Enterprise",
};

const PLAN_BADGE: Record<string, string> = {
  trial: "bg-secondary text-secondary-foreground border-border",
  starter: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  business: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  enterprise: "bg-primary/10 text-primary border-primary/30",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active", suspended: "Suspended", cancelled: "Cancelled",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const PLAN_OPTIONS = ["trial", "starter", "business", "enterprise"] as const;
const STATUS_OPTIONS = ["active", "suspended", "cancelled"] as const;

function flagEmoji(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return "🏳️";
  const cc = countryCode.toUpperCase();
  const codePoints = [...cc].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

function countryLabel(code: string | null | undefined): string {
  if (!code) return "—";
  const c = COUNTRIES.find((x) => x.code === code);
  return c ? c.name : code;
}

// ─── Company Form Dialog ────────────────────────────────────────────────

interface CompanyForm {
  name: string;
  legal_name: string;
  country: string;
  currency: string;
  plan: string;
  status: string;
}

const EMPTY_COMPANY: CompanyForm = {
  name: "", legal_name: "", country: "", currency: "USD", plan: "trial", status: "active",
};

function CompanyDialog({
  open, onOpenChange, initial, onSubmit, title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: CompanyForm;
  onSubmit: (f: CompanyForm) => Promise<void>;
  title: string;
}) {
  const [form, setForm] = useState<CompanyForm>(initial);
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens
  useState(() => { setForm(initial); });

  function set<K extends keyof CompanyForm>(k: K, v: CompanyForm[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Enter the company details below.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="md:col-span-2 space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Acme Inc." />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label>Legal Name</Label>
            <Input value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} placeholder="Acme Corporation Ltd." />
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Select value={form.country || "_none"} onValueChange={(v) => set("country", v === "_none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select value={form.plan} onValueChange={(v) => set("plan", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((p) => <SelectItem key={p} value={p}>{PLAN_LABELS[p]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── View Users Dialog ──────────────────────────────────────────────────

function ViewUsersDialog({
  open, onOpenChange, tenantId, tenantName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenantId: string;
  tenantName: string;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const { data: users, isLoading } = useQuery({
    queryKey: ["tenant-users", tenantKey, tenantId],
    queryFn: async () => {
      const r = await fetch(api(`/api/users?tenant_id=${tenantId}`));
      if (!r.ok) throw new Error("Failed to load users");
      const d = await r.json();
      return (d.items || []) as Array<{ id: string; username: string; email: string; full_name: string | null; role: string; active: boolean }>;
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Users — {tenantName}</DialogTitle>
          <DialogDescription>All users assigned to this tenant.</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 overflow-y-auto custom-scroll">
          {isLoading ? (
            <div className="space-y-2 p-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !users || users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.full_name || u.username}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={u.active ? "bg-chart-1/15 text-chart-1 border-chart-1/30" : "bg-muted text-muted-foreground"}>
                        {u.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Admin Dialog ────────────────────────────────────────────────

function AssignAdminDialog({
  open, onOpenChange, tenantId, tenantName, onAssigned,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenantId: string;
  tenantName: string;
  onAssigned: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch all users for assignment
  const { data: allUsers } = useQuery({
    queryKey: ["super-admin-all-users", tenantKey],
    queryFn: async () => {
      const r = await fetch(api("/api/super-admin/users"));
      if (!r.ok) return [];
      const d = await r.json();
      return (d.items || []) as Array<{ id: string; username: string; email: string; full_name: string | null; role: string; tenant_id: string | null }>;
    },
    enabled: open,
  });

  const availableUsers = useMemo(() => {
    if (!allUsers) return [];
    // Users without a tenant or already in this tenant (non-admin)
    return allUsers.filter((u) => !u.tenant_id || u.tenant_id === tenantId);
  }, [allUsers, tenantId]);

  async function handleAssign() {
    if (!userId) { toast.error("Select a user."); return; }
    setSaving(true);
    try {
      const r = await fetch(api("/api/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, tenant_id: tenantId, role: "admin" }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to assign admin");
      }
      toast.success("Admin assigned successfully.");
      onAssigned();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to assign admin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Admin — {tenantName}</DialogTitle>
          <DialogDescription>Promote a user to admin for this tenant. Max 2 admins per tenant.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Select User</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Choose a user…" /></SelectTrigger>
              <SelectContent>
                {availableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name || u.username} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={saving || !userId}>
            {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
            Assign Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export function SuperAdminOverviewView({ embedded = false }: { embedded?: boolean } = {}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const user = useAppStore((s) => s.user);
  const setView = useAppStore((s) => s.setView);
  const isSuper = isSuperAdmin(user);
  const queryClient = useQueryClient();

  // Dialogs state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<TenantStats | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<TenantStats | null>(null);
  const [viewUsersTenant, setViewUsersTenant] = useState<TenantStats | null>(null);
  const [assignAdminTenant, setAssignAdminTenant] = useState<TenantStats | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-overview", tenantKey],
    queryFn: async () => {
      const r = await fetch(api("/api/super-admin/overview"));
      if (!r.ok) throw new Error("Failed to load overview");
      return r.json() as Promise<OverviewData>;
    },
    enabled: isSuper,
  });

  const recentActivity = useMemo(() => (data?.recent_activity || []).slice(0, 10), [data]);

  // Plan distribution for platform health
  const planDistribution = useMemo(() => {
    if (!data) return [];
    const counts: Record<string, number> = {};
    for (const ts of data.tenants) {
      counts[ts.tenant.plan] = (counts[ts.tenant.plan] || 0) + 1;
    }
    return Object.entries(counts).map(([plan, count]) => ({ plan, count, label: PLAN_LABELS[plan] || plan }));
  }, [data]);

  // Storage estimate (rough: partners + offers + invoices × average size)
  const storageEstimate = useMemo(() => {
    if (!data) return "0 MB";
    const totalEntities = data.total_partners + data.total_offers + data.total_invoices + data.total_users;
    const mb = Math.max(totalEntities * 0.05, 0.1); // ~50KB per entity estimate
    return mb < 1 ? `${Math.round(mb * 1000)} KB` : `${mb.toFixed(1)} MB`;
  }, [data]);

  async function handleCreateCompany(form: CompanyForm) {
    const r = await fetch(api("/api/tenants"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || "Failed to create tenant");
    }
    toast.success("Company created.");
    queryClient.invalidateQueries({ queryKey: ["super-admin-overview", tenantKey] });
  }

  async function handleEditCompany(form: CompanyForm) {
    if (!editTenant) return;
    const r = await fetch(api(`/api/tenants/${editTenant.tenant.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editTenant.tenant.id }),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || "Failed to update tenant");
    }
    toast.success("Company updated.");
    setEditTenant(null);
    queryClient.invalidateQueries({ queryKey: ["super-admin-overview", tenantKey] });
  }

  async function handleDeleteTenant() {
    if (!deleteTenant) return;
    const r = await fetch(api(`/api/tenants/${deleteTenant.tenant.id}`), { method: "DELETE" });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || "Failed to delete tenant");
    }
    toast.success("Company deleted.");
    setDeleteTenant(null);
    queryClient.invalidateQueries({ queryKey: ["super-admin-overview", tenantKey] });
  }

  function handleSwitchTenant(t: Tenant) {
    // Store tenant context via query param — the URL and resolveTenantId will pick it up
    const url = new URL(window.location.href);
    url.searchParams.set("tenant_id", t.id);
    window.history.pushState({}, "", url.toString());
    toast.success(`Switched context to ${t.name}. Reload to apply.`);
  }

  if (!isSuper) {
    return (
      <div>
        <PageHeader title="System Overview" description="Monitor all tenants and platform activity." />
        <Card className="border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/5">
          <CardContent className="p-6 flex items-start gap-3">
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="font-medium">Super-admin access required.</p>
              <p className="text-sm text-muted-foreground mt-1">
                This dashboard is restricted to platform super-administrators. Contact your platform operator if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="System Overview" description="Monitor all tenants and platform activity." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  const activeRate = data.total_tenants > 0 ? Math.round((data.active_tenants / data.total_tenants) * 100) : 0;
  const inactiveTenants = data.total_tenants - data.active_tenants;

  return (
    <div>
      {!embedded ? <PageHeader
        title="System Overview"
        description="Monitor all tenants and platform activity."
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-1" /> Create Company
            </Button>
            <Button variant="outline" onClick={() => setView("platform-dashboard")}>
              <Building2 className="size-4 mr-1" /> Manage Tenants
            </Button>
          </div>
        }
      /> : null}

      {/* Create Company Dialog */}
      <CompanyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={EMPTY_COMPANY}
        onSubmit={handleCreateCompany}
        title="Create Company"
      />

      {/* Edit Company Dialog */}
      {editTenant && (
        <CompanyDialog
          open={!!editTenant}
          onOpenChange={(v) => { if (!v) setEditTenant(null); }}
          initial={{
            name: editTenant.tenant.name,
            legal_name: editTenant.tenant.legal_name || "",
            country: editTenant.tenant.country || "",
            currency: editTenant.tenant.currency,
            plan: editTenant.tenant.plan,
            status: editTenant.tenant.status,
          }}
          onSubmit={handleEditCompany}
          title="Edit Company"
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTenant} onOpenChange={(v) => { if (!v) setDeleteTenant(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTenant?.tenant.name}</strong>?
              {deleteTenant && deleteTenant.user_count > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  This tenant has {deleteTenant.user_count} user(s). Remove all users first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTenant}
              disabled={!!deleteTenant && deleteTenant.user_count > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Users Dialog */}
      {viewUsersTenant && (
        <ViewUsersDialog
          open={!!viewUsersTenant}
          onOpenChange={(v) => { if (!v) setViewUsersTenant(null); }}
          tenantId={viewUsersTenant.tenant.id}
          tenantName={viewUsersTenant.tenant.name}
        />
      )}

      {/* Assign Admin Dialog */}
      {assignAdminTenant && (
        <AssignAdminDialog
          open={!!assignAdminTenant}
          onOpenChange={(v) => { if (!v) setAssignAdminTenant(null); }}
          tenantId={assignAdminTenant.tenant.id}
          tenantName={assignAdminTenant.tenant.name}
          onAssigned={() => queryClient.invalidateQueries({ queryKey: ["super-admin-overview", tenantKey] })}
        />
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Total Tenants"
          value={fmtNumber(data.total_tenants)}
          sub={`${data.active_tenants} active · ${activeRate}%`}
          icon={Building2}
        />
        <KpiCard
          label="Total Users"
          value={fmtNumber(data.total_users)}
          sub="Across all tenants"
          icon={Users}
        />
        <KpiCard
          label="Total Partners"
          value={fmtNumber(data.total_partners)}
          sub="CRM contacts"
          icon={Handshake}
        />
        <KpiCard
          label="Total Offers"
          value={fmtNumber(data.total_offers)}
          sub={`${fmtNumber(data.total_invoices)} invoices`}
          icon={FileText}
        />
      </div>

      {/* Tenant table */}
      <Card className="border-border/60 shadow-soft rounded-xl mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="size-4 text-primary" /> Tenant Registry
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                All tenants on the platform with live counters.
              </CardDescription>
            </div>
            <Badge variant="outline" className="tabular">{data.tenants.length} tenants</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[420px] overflow-y-auto custom-scroll">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Country</TableHead>
                  <TableHead className="hidden lg:table-cell">Currency</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Partners</TableHead>
                  <TableHead className="hidden xl:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tenants.map((ts) => (
                  <TableRow key={ts.tenant.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ts.tenant.primary_color && (
                          <span
                            className="size-2.5 rounded-full border border-border/60 shrink-0"
                            style={{ backgroundColor: ts.tenant.primary_color }}
                          />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate">{ts.tenant.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {ts.tenant.legal_name || "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="text-base leading-none">{flagEmoji(ts.tenant.country)}</span>
                        <span className="truncate max-w-[140px]">{countryLabel(ts.tenant.country)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="font-mono tabular text-xs">{ts.tenant.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={PLAN_BADGE[ts.tenant.plan] || ""}>
                        {PLAN_LABELS[ts.tenant.plan] || ts.tenant.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_BADGE[ts.tenant.status] || ""}>
                        <CircleDot className="size-3 mr-1" />
                        {STATUS_LABELS[ts.tenant.status] || ts.tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular text-sm">{ts.user_count}</TableCell>
                    <TableCell className="text-right tabular text-sm hidden sm:table-cell">{ts.partner_count}</TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground tabular">
                      {fmtDate(ts.tenant.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditTenant(ts)} title="Edit">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setViewUsersTenant(ts)} title="View Users">
                          <Eye className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setAssignAdminTenant(ts)} title="Assign Admin">
                          <ShieldCheck className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleSwitchTenant(ts.tenant)} title="Switch to Tenant">
                          <Repeat className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteTenant(ts)} title="Delete">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Two-column: activity + platform health */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent activity */}
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="size-4 text-primary" /> Platform Activity
              </CardTitle>
              <Badge variant="outline" className="text-xs">Last {recentActivity.length}</Badge>
            </div>
            <CardDescription className="text-xs">Recent audit log entries across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<Activity className="size-5" />}
                  title="No recent activity"
                  description="Audit log entries will appear here."
                />
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto custom-scroll">
                <ul className="divide-y divide-border/60">
                  {recentActivity.map((a) => (
                    <li key={a.id} className="px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-[10px] font-mono">{a.action}</Badge>
                            {a.entity_type && (
                              <span className="text-xs text-muted-foreground">
                                on <span className="font-mono">{a.entity_type}</span>
                                {a.entity_id && <span className="font-mono ml-1 text-[10px]">#{a.entity_id.slice(0, 8)}</span>}
                              </span>
                            )}
                          </div>
                          <div className="text-xs mt-1 flex items-center gap-2 flex-wrap text-muted-foreground">
                            <span className="font-medium text-foreground/80">{a.username || "system"}</span>
                            <span>·</span>
                            <span className="tabular">{fmtDateTime(a.created_at)}</span>
                            {a.ip && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-[10px]">{a.ip}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular shrink-0">
                          {fmtRelative(a.created_at)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="size-4 text-primary" /> Platform Health
              </CardTitle>
              <Badge variant="outline" className="text-xs tabular">{data.tenants.length} tenants</Badge>
            </div>
            <CardDescription className="text-xs">Active/inactive tenants, plan distribution, storage.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.tenants.length === 0 ? (
              <EmptyState
                icon={<Building2 className="size-5" />}
                title="No tenants yet"
                description="Create a tenant to populate this dashboard."
              />
            ) : (
              <div className="space-y-5">
                {/* Active vs Inactive */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tenant Status</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-chart-1/10 border border-chart-1/20 p-3">
                      <div className="text-2xl font-bold tabular text-chart-1">{data.active_tenants}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Active Tenants</div>
                    </div>
                    <div className="rounded-lg bg-muted/40 border border-border/40 p-3">
                      <div className="text-2xl font-bold tabular text-muted-foreground">{inactiveTenants}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Inactive / Suspended</div>
                    </div>
                  </div>
                </div>

                {/* Plan Distribution */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <PieChart className="size-3" /> Subscription Plan Distribution
                  </p>
                  <div className="space-y-2">
                    {planDistribution.map(({ plan, count, label }) => {
                      const pct = data.total_tenants > 0 ? Math.round((count / data.total_tenants) * 100) : 0;
                      return (
                        <div key={plan} className="flex items-center gap-3">
                          <Badge variant="outline" className={`w-24 justify-center text-[10px] ${PLAN_BADGE[plan] || ""}`}>
                            {label}
                          </Badge>
                          <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                            <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs tabular text-muted-foreground w-16 text-right">{count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Storage Estimate */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <HardDrive className="size-3" /> Estimated Storage
                  </p>
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-3 flex items-center gap-3">
                    <HardDrive className="size-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-semibold tabular">{storageEstimate}</div>
                      <div className="text-xs text-muted-foreground">Approximate total usage</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3" />
        <span>Snapshot loaded <span className="tabular">{fmtDateTime(new Date().toISOString())}</span></span>
      </div>
    </div>
  );
}

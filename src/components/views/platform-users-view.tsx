"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, KeyRound, ShieldOff, Search, Loader2, Users, Filter } from "lucide-react";
import { toast } from "sonner";
import { ALL_PERMISSIONS, PLATFORM_PERMISSIONS, PORTAL_CLIENT_PERMISSIONS } from "@/lib/permissions/catalog";

interface PlatformUser {
  id: string; tenant_id: string | null; username: string; email: string;
  full_name: string | null; role: string; permissions: string[] | null;
  active: boolean; last_login_at?: string | null;
}
interface Tenant { id: string; name: string; plan: string; }

const TENANT_PERMS = ALL_PERMISSIONS.filter(
  (p) => !PLATFORM_PERMISSIONS.includes(p as any) && !PORTAL_CLIENT_PERMISSIONS.includes(p as any),
);

/** Groups a flat permission list by its resource prefix ("partners.*"). */
function groupPerms(perms: readonly string[]) {
  const g: Record<string, string[]> = {};
  perms.forEach((p) => {
    const dot = p.indexOf(".");
    const res = dot > 0 ? p.slice(0, dot) : p;
    (g[res] ??= []).push(p);
  });
  return g;
}
const GROUPED = groupPerms(TENANT_PERMS);

export function PlatformUsersView() {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [tenantFilter, setTenantFilter] = React.useState<string>("all");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [editing, setEditing] = React.useState<PlatformUser | null>(null);

  const usersQ = useQuery({
    queryKey: ["platform-users"],
    queryFn: async () => {
      const r = await fetch("/api/super-admin/users");
      if (!r.ok) throw new Error("Failed to load users");
      return r.json() as Promise<{ items: PlatformUser[] }>;
    },
  });
  const tenantsQ = useQuery({
    queryKey: ["platform-users-tenants"],
    queryFn: async () => {
      const r = await fetch("/api/tenants");
      return r.ok ? (r.json() as Promise<{ items: Tenant[] }>) : { items: [] };
    },
  });

  const items = usersQ.data?.items || [];
  const tenants = tenantsQ.data?.items || [];
  const tenantName = React.useMemo(() => new Map(tenants.map((t) => [t.id, t.name])), [tenants]);

  const filtered = items.filter((u) => {
    if (tenantFilter === "__platform__") { if (u.tenant_id) return false; }
    else if (tenantFilter !== "all" && (u.tenant_id || "") !== tenantFilter) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q);
    }
    return true;
  });

  const impersonateMut = useMutation({
    mutationFn: async (u: PlatformUser) => {
      const r = await fetch("/api/super-admin/impersonate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: u.id, tenant_id: u.tenant_id, duration_minutes: 60 }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Failed to impersonate");
    },
    onSuccess: () => { toast.success("Impersonation started."); setTimeout(() => window.location.reload(), 400); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div><CardTitle className="flex items-center gap-2 text-base"><Users className="size-4 text-primary" /> All users</CardTitle><CardDescription className="text-xs">Cross-tenant user manager. Edit permissions, reset password, impersonate.</CardDescription></div>
            <Badge variant="outline">{filtered.length} of {items.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input placeholder="Search username / email / name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" /></div>
            <Select value={tenantFilter} onValueChange={setTenantFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tenants</SelectItem>
                <SelectItem value="__platform__">Platform (super_admin)</SelectItem>
                {tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Perms</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQ.isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
                {!usersQ.isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No users match.</TableCell></TableRow>}
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell><div className="min-w-0"><p className="text-sm font-medium">{u.username}</p><p className="text-xs text-muted-foreground truncate max-w-[200px]">{u.email}</p></div></TableCell>
                    <TableCell className="text-sm">{u.tenant_id ? tenantName.get(u.tenant_id) || u.tenant_id.slice(0, 8) : <span className="text-primary font-semibold">Platform</span>}</TableCell>
                    <TableCell><Badge variant={u.role === "super_admin" ? "destructive" : "outline"}>{u.role}</Badge></TableCell>
                    <TableCell className="text-right tabular text-sm">{(u.permissions?.length) ?? 0}</TableCell>
                    <TableCell>{u.active ? <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Active</Badge> : <Badge variant="secondary">Off</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u.role !== "super_admin" && u.active && (
                          <Button size="icon" variant="ghost" className="size-8 text-amber-600" title="Impersonate" onClick={() => { if (confirm(`Impersonate ${u.username}?`)) impersonateMut.mutate(u); }}>
                            <UserCheck className="size-4" />
                          </Button>
                        )}
                        {u.role !== "super_admin" && (
                          <Button size="icon" variant="ghost" className="size-8" title="Edit permissions" onClick={() => setEditing(u)}>
                            <KeyRound className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editing && <PermissionEditor user={editing} tenantName={editing.tenant_id ? tenantName.get(editing.tenant_id) || editing.tenant_id : "Platform"} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["platform-users"] }); setEditing(null); }} />}
    </div>
  );
}

function PermissionEditor({ user, tenantName, onClose, onSaved }: {
  user: PlatformUser; tenantName: string; onClose: () => void; onSaved: () => void;
}) {
  const [perms, setPerms] = React.useState<string[]>(user.permissions || []);
  const [saving, setSaving] = React.useState(false);
  const [wildcard, setWildcard] = React.useState(user.permissions?.includes("*") || false);

  function togglePerm(p: string) {
    setPerms((cur) => cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]);
  }
  function toggleResource(res: string, all: string[], on: boolean) {
    setPerms((cur) => {
      const cleared = cur.filter((p) => !all.includes(p) && p !== `${res}.*`);
      if (!on) return cleared;
      return [...cleared, `${res}.*`];
    });
  }

  async function save() {
    setSaving(true);
    try {
      const final = wildcard ? ["*"] : perms;
      const r = await fetch(`/api/users/${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: final }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Failed to save (HTTP ${r.status})`);
      toast.success(`Permissions updated for ${user.username}.`);
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally { setSaving(false); }
  }

  const isAdmin = user.role === "admin";

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><KeyRound className="size-5 text-primary" /> {user.username}</SheetTitle>
          <SheetDescription>{tenantName} · role: <Badge variant="outline">{user.role}</Badge></SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          {isAdmin && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              Admin role implicitly holds every non-platform permission. Entries below act as a record only.
            </div>
          )}
          <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
            <Checkbox checked={wildcard} onCheckedChange={(v) => setWildcard(v === true)} />
            <div><p className="text-sm font-medium">Grant everything (wildcard *)</p><p className="text-xs text-muted-foreground">Overrides individual permissions. Rare — for trusted internal users only.</p></div>
          </label>
          {!wildcard && (
            <div className="space-y-3">
              {Object.entries(GROUPED).map(([res, list]) => {
                const allChecked = list.every((p) => perms.includes(p)) || perms.includes(`${res}.*`);
                const someChecked = list.some((p) => perms.includes(p)) || perms.includes(`${res}.*`);
                return (
                  <div key={res} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={allChecked} onCheckedChange={(v) => toggleResource(res, list, v === true)} />
                        <span className="text-sm font-semibold capitalize">{res.replace(/-/g, " ")}</span>
                        {someChecked && !allChecked && <span className="text-xs text-muted-foreground">(partial)</span>}
                      </label>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pl-6">
                      {list.map((p) => (
                        <label key={p} className="flex items-center gap-2 text-xs cursor-pointer">
                          <Checkbox checked={perms.includes(p) || perms.includes(`${res}.*`)} onCheckedChange={() => togglePerm(p)} disabled={perms.includes(`${res}.*`)} />
                          {p.replace(`${res}.`, "")}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            Save permissions
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

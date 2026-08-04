"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { fmtDateTime } from "@/lib/utils/format";
import { MapLink } from "@/components/common/map-link";

interface AuditRow {
  id: string; tenant_id: string | null; user_id: string | null; username: string | null;
  action: string; entity_type: string | null; entity_id: string | null;
  details: Record<string, unknown> | null; ip: string | null; user_agent: string | null;
  created_at: string;
}
interface Tenant { id: string; name: string; }

const PAGE_SIZE = 50;

export function PlatformAuditView() {
  const [tenantId, setTenantId] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [action, setAction] = React.useState("");
  const [user, setUser] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const tenantsQ = useQuery({
    queryKey: ["platform-audit-tenants"],
    queryFn: async () => {
      const r = await fetch("/api/tenants");
      return r.ok ? (r.json() as Promise<{ items: Tenant[] }>) : { items: [] };
    },
  });
  const tenants = tenantsQ.data?.items || [];

  const q = new URLSearchParams();
  if (tenantId) q.set("tenant_id", tenantId);
  if (action) q.set("action", action);
  if (user) q.set("user", user);
  if (search) q.set("search", search);
  q.set("limit", String(PAGE_SIZE));
  q.set("offset", String(page * PAGE_SIZE));

  const auditQ = useQuery({
    queryKey: ["platform-audit", tenantId, action, user, search, page],
    queryFn: async () => {
      const r = await fetch(`/api/super-admin/audit?${q.toString()}`);
      if (!r.ok) throw new Error("Failed to load audit");
      return r.json() as Promise<{ total: number; items: AuditRow[] }>;
    },
    refetchOnWindowFocus: false,
  });

  const items = auditQ.data?.items || [];
  const total = auditQ.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tenantName = React.useMemo(() => new Map(tenants.map((t) => [t.id, t.name])), [tenants]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div><CardTitle className="flex items-center gap-2 text-base"><ScrollText className="size-4 text-primary" /> Cross-tenant audit</CardTitle><CardDescription className="text-xs">Every action logged, across every tenant.</CardDescription></div>
          <Button size="sm" variant="outline" onClick={() => auditQ.refetch()}><RefreshCw className={`size-3.5 mr-1 ${auditQ.isFetching ? "animate-spin" : ""}`} /> Refresh</Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px]"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input placeholder="Search…" value={search} onChange={(e) => { setPage(0); setSearch(e.target.value); }} className="pl-8" /></div>
          <Select value={tenantId || "all"} onValueChange={(v) => { setPage(0); setTenantId(v === "all" ? "" : v); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tenant" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All tenants</SelectItem>{tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Action contains…" value={action} onChange={(e) => { setPage(0); setAction(e.target.value); }} className="w-[160px]" />
          <Input placeholder="Username…" value={user} onChange={(e) => { setPage(0); setUser(e.target.value); }} className="w-[140px]" />
        </div>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">When</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditQ.isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
              {!auditQ.isLoading && items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No entries.</TableCell></TableRow>}
              {items.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow className="cursor-pointer" onClick={() => setExpanded((e) => e === row.id ? null : row.id)}>
                    <TableCell className="text-xs tabular text-muted-foreground">{fmtDateTime(row.created_at)}</TableCell>
                    <TableCell className="text-sm">{row.tenant_id ? tenantName.get(row.tenant_id) || row.tenant_id.slice(0, 8) : <span className="text-primary font-semibold">Platform</span>}</TableCell>
                    <TableCell className="text-sm">{row.username || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="font-mono text-[10px]">{row.action}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.entity_type ? `${row.entity_type}${row.entity_id ? "#" + row.entity_id.slice(0, 8) : ""}` : "—"}</TableCell>
                    <TableCell className="text-xs tabular"><span className="inline-flex items-center gap-1.5">{row.ip || "—"}{row.ip && <MapLink ip={row.ip} />}</span></TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{expanded === row.id ? "Hide" : "Show"}</TableCell>
                  </TableRow>
                  {expanded === row.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/40">
                        <pre className="text-[11px] font-mono whitespace-pre-wrap break-all overflow-x-auto">{JSON.stringify({ details: row.details, user_agent: row.user_agent }, null, 2)}</pre>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>{total.toLocaleString()} entries · page {page + 1} of {totalPages}</div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}><ChevronLeft className="size-3.5" /> Prev</Button>
            <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="size-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, ShieldCheck, ShieldAlert, History, Network, Laptop,
  Lock, Trash2, Ban, Globe2, Monitor, CheckCircle2, XCircle, Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { KpiCard } from "@/components/common/kpi-card";
import { EmptyState } from "@/components/common/empty-state";
import { fmtDateTime, fmtRelative } from "@/lib/utils/format";
import { useAppStore, isAdmin } from "@/lib/store/app-store";
import { MapLink } from "@/components/common/map-link";
import type {
  SecuritySession, LoginHistoryEntry, KnownIp, TrustedDevice,
} from "@/lib/supabase/types";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

function AdminRequired() {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
      <CardContent className="p-6 flex items-start gap-3">
        <Lock className="size-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Admin access required</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            The Security Center is only available to administrators. Contact your administrator if you need access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function parseUa(ua: string | null): { icon: typeof Monitor; label: string } {
  if (!ua) return { icon: Globe2, label: "Unknown" };
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return { icon: Smartphone, label: "Mobile" };
  }
  if (lower.includes("mac")) return { icon: Monitor, label: "macOS" };
  if (lower.includes("windows")) return { icon: Monitor, label: "Windows" };
  if (lower.includes("linux")) return { icon: Monitor, label: "Linux" };
  return { icon: Globe2, label: "Web" };
}

export function SecurityView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const user = useAppStore((s) => s.user);
  const admin = isAdmin(user);
  const [tab, setTab] = useState("sessions");

  const sessionsQ = useQuery({
    queryKey: ["security", tenantKey, "sessions"],
    queryFn: async () => {
      const r = await fetch(api("/api/security/sessions"));
      if (!r.ok) throw new Error("Failed to load sessions");
      return r.json() as Promise<{ items: SecuritySession[] }>;
    },
    enabled: admin,
  });
  const loginQ = useQuery({
    queryKey: ["security", tenantKey, "login-history"],
    queryFn: async () => {
      const r = await fetch(api("/api/security/login-history?limit=200"));
      if (!r.ok) throw new Error("Failed to load login history");
      return r.json() as Promise<{ items: LoginHistoryEntry[] }>;
    },
    enabled: admin,
  });
  const ipsQ = useQuery({
    queryKey: ["security", tenantKey, "known-ips"],
    queryFn: async () => {
      const r = await fetch(api("/api/security/known-ips"));
      if (!r.ok) throw new Error("Failed to load known IPs");
      return r.json() as Promise<{ items: KnownIp[] }>;
    },
    enabled: admin,
  });
  const devicesQ = useQuery({
    queryKey: ["security", tenantKey, "trusted-devices"],
    queryFn: async () => {
      const r = await fetch(api("/api/security/trusted-devices"));
      if (!r.ok) throw new Error("Failed to load trusted devices");
      return r.json() as Promise<{ items: TrustedDevice[] }>;
    },
    enabled: admin,
  });

  if (!admin) {
    return (
      <div>
        <PageHeader
          title="Security Center"
          description="Manage sessions, login history, and trusted devices."
        />
        <AdminRequired />
      </div>
    );
  }

  const sessions = sessionsQ.data?.items || [];
  const logins = loginQ.data?.items || [];
  const ips = ipsQ.data?.items || [];
  const devices = devicesQ.data?.items || [];

  const activeSessions = sessions.filter((s) => !s.revoked).length;
  const failed24h = logins.filter((l) => {
    if (l.success) return false;
    const d = new Date(l.created_at).getTime();
    return Date.now() - d < 24 * 3600 * 1000;
  }).length;
  const trustedIps = ips.filter((i) => i.trusted).length;
  const trustedDevices = devices.filter((d) => !d.revoked).length;

  return (
    <div>
      <PageHeader
        title="Security Center"
        description="Manage sessions, login history, and trusted devices."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Active sessions"
          value={activeSessions}
          icon={ShieldCheck}
          sub="Not revoked"
        />
        <KpiCard
          label="Failed logins (24h)"
          value={failed24h}
          icon={ShieldAlert}
          iconClassName={failed24h > 0 ? "text-destructive" : undefined}
          sub="Last 24 hours"
        />
        <KpiCard
          label="Trusted IPs"
          value={trustedIps}
          icon={Network}
          sub={`${ips.length} known`}
        />
        <KpiCard
          label="Trusted devices"
          value={trustedDevices}
          icon={Laptop}
          sub={`${devices.length} total`}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="sessions" className="gap-1.5"><Shield className="size-3.5" /> Sessions</TabsTrigger>
          <TabsTrigger value="logins" className="gap-1.5"><History className="size-3.5" /> Login History</TabsTrigger>
          <TabsTrigger value="ips" className="gap-1.5"><Network className="size-3.5" /> Known IPs</TabsTrigger>
          <TabsTrigger value="devices" className="gap-1.5"><Laptop className="size-3.5" /> Trusted Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <SessionsTab items={sessions} loading={sessionsQ.isLoading} />
        </TabsContent>
        <TabsContent value="logins" className="mt-4">
          <LoginHistoryTab items={logins} loading={loginQ.isLoading} />
        </TabsContent>
        <TabsContent value="ips" className="mt-4">
          <KnownIpsTab items={ips} loading={ipsQ.isLoading} />
        </TabsContent>
        <TabsContent value="devices" className="mt-4">
          <TrustedDevicesTab items={devices} loading={devicesQ.isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Sessions tab ----------
function SessionsTab({ items, loading }: { items: SecuritySession[]; loading: boolean }) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const revokeMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/security/sessions/${id}`), { method: "POST" });
      if (!r.ok) throw new Error("Failed to revoke session");
    },
    onSuccess: () => {
      toast.success("Session revoked.");
      qc.invalidateQueries({ queryKey: ["security", tenantKey, "sessions"] });
    },
    onError: () => toast.error("Failed to revoke session."),
  });

  return (
    <Card className="border-border/60 shadow-soft">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Shield className="size-6" />}
            title="No sessions"
            description="There are no recorded sessions yet."
          />
        ) : (
          <div className="max-h-[calc(100vh-380px)] overflow-y-auto custom-scroll">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Device / UA</TableHead>
                  <TableHead className="hidden md:table-cell">IP</TableHead>
                  <TableHead className="hidden lg:table-cell">Country</TableHead>
                  <TableHead className="hidden xl:table-cell">Created</TableHead>
                  <TableHead className="hidden md:table-cell">Last used</TableHead>
                  <TableHead className="hidden lg:table-cell">Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => {
                  const ua = parseUa(s.user_agent);
                  const UaIcon = ua.icon;
                  return (
                    <TableRow key={s.id} className={s.current ? "bg-emerald-50/40 dark:bg-emerald-950/10" : ""}>
                      <TableCell>
                        <div className="flex items-start gap-2 min-w-0">
                          <UaIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{ua.label}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[260px]" title={s.user_agent || ""}>
                              {s.user_agent || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs tabular">
                        <span className="inline-flex items-center gap-1.5">{s.ip || "—"}{s.ip && <MapLink ip={s.ip} />}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{s.country || "—"}</TableCell>
                      <TableCell className="hidden xl:table-cell text-xs">{fmtDateTime(s.created_at)}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{fmtRelative(s.last_used_at)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">{fmtDateTime(s.expires_at)}</TableCell>
                      <TableCell>
                        {s.current ? (
                          <Badge className="bg-emerald-600 text-white">Current</Badge>
                        ) : s.revoked ? (
                          <Badge variant="destructive">Revoked</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!s.current && !s.revoked && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => revokeMut.mutate(s.id)}
                            disabled={revokeMut.isPending}
                          >
                            <Ban className="size-4 mr-1" /> Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Login History tab ----------
function LoginHistoryTab({ items, loading }: { items: LoginHistoryEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <Card className="border-border/60 shadow-soft">
        <CardContent className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }
  if (items.length === 0) {
    return (
      <Card className="border-border/60 shadow-soft">
        <EmptyState
          icon={<History className="size-6" />}
          title="No login history"
          description="Login attempts will appear here."
        />
      </Card>
    );
  }
  return (
    <Card className="border-border/60 shadow-soft">
      <CardContent className="p-0">
        <div className="max-h-[calc(100vh-380px)] overflow-y-auto custom-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
                <TableHead className="hidden lg:table-cell">Country</TableHead>
                <TableHead className="hidden xl:table-cell">User agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((l) => (
                <TableRow
                  key={l.id}
                  className={l.success ? "" : "bg-destructive/5"}
                >
                  <TableCell className="text-xs whitespace-nowrap">{fmtDateTime(l.created_at)}</TableCell>
                  <TableCell className="font-medium">{l.username}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs tabular">
                    <span className="inline-flex items-center gap-1.5">{l.ip || "—"}{l.ip && <MapLink ip={l.ip} />}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{l.country || "—"}</TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <p className="text-xs text-muted-foreground truncate max-w-[280px]" title={l.user_agent || ""}>
                      {l.user_agent || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {l.success ? (
                      <Badge className="bg-emerald-600 text-white gap-1">
                        <CheckCircle2 className="size-3" /> Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="size-3" /> Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {l.reason || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Known IPs tab ----------
function KnownIpsTab({ items, loading }: { items: KnownIp[]; loading: boolean }) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const trustMut = useMutation({
    mutationFn: async ({ id, trusted }: { id: string; trusted: boolean }) => {
      const r = await fetch(api(`/api/security/known-ips/${id}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trusted }),
      });
      if (!r.ok) throw new Error("Failed to update IP");
    },
    onSuccess: (_v, vars) => {
      toast.success(vars.trusted ? "IP marked as trusted." : "IP untrusted.");
      qc.invalidateQueries({ queryKey: ["security", tenantKey, "known-ips"] });
    },
    onError: () => toast.error("Failed to update IP."),
  });
  const forgetMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/security/known-ips/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to forget IP");
    },
    onSuccess: () => {
      toast.success("IP forgotten.");
      qc.invalidateQueries({ queryKey: ["security", tenantKey, "known-ips"] });
    },
    onError: () => toast.error("Failed to forget IP."),
  });

  if (loading) {
    return (
      <Card className="border-border/60 shadow-soft">
        <CardContent className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }
  if (items.length === 0) {
    return (
      <Card className="border-border/60 shadow-soft">
        <EmptyState
          icon={<Network className="size-6" />}
          title="No known IPs"
          description="IPs that have logged in will appear here."
        />
      </Card>
    );
  }
  return (
    <Card className="border-border/60 shadow-soft">
      <CardContent className="p-0">
        <div className="max-h-[calc(100vh-380px)] overflow-y-auto custom-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead className="hidden md:table-cell">Country</TableHead>
                <TableHead className="hidden lg:table-cell">First seen</TableHead>
                <TableHead className="hidden lg:table-cell">Last seen</TableHead>
                <TableHead>Trusted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell className="font-mono text-sm tabular">
                    <span className="inline-flex items-center gap-1.5">{ip.ip}<MapLink ip={ip.ip} /></span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{ip.country || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">{fmtDateTime(ip.first_seen)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">{fmtRelative(ip.last_seen)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={ip.trusted}
                      onCheckedChange={(v) => trustMut.mutate({ id: ip.id, trusted: v })}
                      disabled={trustMut.isPending}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => forgetMut.mutate(ip.id)}
                      disabled={forgetMut.isPending}
                    >
                      <Trash2 className="size-4 mr-1" /> Forget
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Trusted Devices tab ----------
function TrustedDevicesTab({ items, loading }: { items: TrustedDevice[]; loading: boolean }) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const revokeMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/security/trusted-devices/${id}`), { method: "POST" });
      if (!r.ok) throw new Error("Failed to revoke device");
    },
    onSuccess: () => {
      toast.success("Device revoked.");
      qc.invalidateQueries({ queryKey: ["security", tenantKey, "trusted-devices"] });
    },
    onError: () => toast.error("Failed to revoke device."),
  });

  if (loading) {
    return (
      <Card className="border-border/60 shadow-soft">
        <CardContent className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }
  if (items.length === 0) {
    return (
      <Card className="border-border/60 shadow-soft">
        <EmptyState
          icon={<Laptop className="size-6" />}
          title="No trusted devices"
          description="Trusted devices will appear here once registered."
        />
      </Card>
    );
  }
  return (
    <Card className="border-border/60 shadow-soft">
      <CardContent className="p-0">
        <div className="max-h-[calc(100vh-380px)] overflow-y-auto custom-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead className="hidden md:table-cell">Fingerprint</TableHead>
                <TableHead className="hidden lg:table-cell">IP</TableHead>
                <TableHead className="hidden md:table-cell">Last used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.device_name}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground tabular">
                    {d.fingerprint}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs tabular">
                    <span className="inline-flex items-center gap-1.5">{d.ip || "—"}{d.ip && <MapLink ip={d.ip} />}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs">{fmtRelative(d.last_used)}</TableCell>
                  <TableCell>
                    {d.revoked ? (
                      <Badge variant="destructive">Revoked</Badge>
                    ) : (
                      <Badge className="bg-emerald-600 text-white gap-1">
                        <ShieldCheck className="size-3" /> Trusted
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!d.revoked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => revokeMut.mutate(d.id)}
                        disabled={revokeMut.isPending}
                      >
                        <Ban className="size-4 mr-1" /> Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

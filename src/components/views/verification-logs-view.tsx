"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield, Monitor, Smartphone, Globe, ExternalLink, Search,
  Tablet, Bot, Loader2, AlertCircle,
} from "lucide-react";
import {
  Card, CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/common/page-header";
import { useDebounced } from "@/lib/hooks/use-debounced";
import { fmtDateTime } from "@/lib/utils/format";

// ─── Row type returned by /api/super-admin/verification-logs ─────────────────
interface VerificationLogRow {
  id: string;
  tenant_id: string | null;
  verification_code: string;
  document_type: string | null;
  document_id: string | null;
  document_number: string | null;
  ip: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  device_name: string | null;
  result: "valid" | "invalid" | "revoked" | "modified";
  verification_id: string | null;
  verified_at: string;
  referrer: string | null;
  accept_language: string | null;
}

interface LogsResponse {
  items: VerificationLogRow[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Result badge styling ───────────────────────────────────────────────────
const RESULT_BADGE: Record<VerificationLogRow["result"], string> = {
  valid: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  invalid: "bg-destructive/10 text-destructive border-destructive/30",
  revoked: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  modified: "bg-chart-4/15 text-chart-4 border-chart-4/30",
};

// ─── Device icon ────────────────────────────────────────────────────────────
function DeviceIcon({ type }: { type: string | null }) {
  switch (type) {
    case "mobile":
      return <Smartphone className="size-3 inline" />;
    case "tablet":
      return <Tablet className="size-3 inline" />;
    case "bot":
      return <Bot className="size-3 inline" />;
    default:
      return <Monitor className="size-3 inline" />;
  }
}

// ─── Google Maps link ────────────────────────────────────────────────────────
// Lat/lng → maps with a pin. IP fallback → maps with a text query (Google
// will geocode the IP, may or may not return a location).
function mapLinkForRow(log: VerificationLogRow): string | null {
  if (log.latitude != null && log.longitude != null) {
    return `https://www.google.com/maps?q=${log.latitude},${log.longitude}`;
  }
  if (log.ip && log.ip !== "unknown") {
    return `https://www.google.com/maps?q=${encodeURIComponent(log.ip)}`;
  }
  return null;
}

// ============================================================
// Main view
// ============================================================
export function VerificationLogsView() {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounced(search, 300);

  const { data, isLoading, error } = useQuery<LogsResponse>({
    queryKey: ["super-admin-verification-logs", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (debouncedSearch) params.set("code", debouncedSearch);
      const r = await fetch(`/api/super-admin/verification-logs?${params}`);
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: r.statusText }));
        throw new Error(err.error || "Failed to load verification logs");
      }
      return r.json();
    },
  });

  const logs = data?.items || [];
  const total = data?.total || 0;

  return (
    <div>
      <PageHeader
        title="Verification Logs"
        description="Track who verified documents, from where, and on what device. Super-admin only."
      />

      {/* ─── Summary + Search ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Shield className="size-3 mr-1" />
            {total} total verifications
          </Badge>
          {error && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="size-3 mr-1" />
              API error
            </Badge>
          )}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Filter by verification code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* ─── Error state ───────────────────────────────────────────── */}
      {error && (
        <Card className="mb-4 border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-2 text-sm">
            <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-destructive">Failed to load logs</p>
              <p className="text-muted-foreground text-xs break-words">
                {error instanceof Error ? error.message : String(error)}
              </p>
              <p className="text-xs text-muted-foreground">
                If the migration <code className="px-1 py-0.5 rounded bg-muted">006_document_verification_logs.sql</code>{" "}
                has not been applied yet, apply it via Supabase Studio → SQL Editor.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Logs table ────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="text-xs">Code</TableHead>
                  <TableHead className="text-xs">Doc Type</TableHead>
                  <TableHead className="text-xs">Doc #</TableHead>
                  <TableHead className="text-xs">IP</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">Browser</TableHead>
                  <TableHead className="text-xs">Result</TableHead>
                  <TableHead className="text-xs">Time</TableHead>
                  <TableHead className="text-xs">Map</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <Loader2 className="size-5 animate-spin inline mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading…</span>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && logs.length === 0 && !error && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-sm text-muted-foreground">
                      No verification logs found{debouncedSearch ? ` for "${debouncedSearch}"` : ""}.
                    </TableCell>
                  </TableRow>
                )}

                {logs.map((log) => {
                  const mapUrl = mapLinkForRow(log);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-[11px]">{log.verification_code}</TableCell>
                      <TableCell className="text-xs">{log.document_type || "—"}</TableCell>
                      <TableCell className="font-mono text-[11px]">{log.document_number || "—"}</TableCell>
                      <TableCell className="font-mono text-[11px]">{log.ip || "—"}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          {log.country && <div className="font-medium">{log.country}</div>}
                          {log.city && <div className="text-muted-foreground">{log.city}{log.region ? `, ${log.region}` : ""}</div>}
                          {!log.country && !log.city && <span className="text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1">
                            <DeviceIcon type={log.device_type} />
                            <span>{log.device_name || log.device_type || "—"}</span>
                          </div>
                          {log.os && <div className="text-muted-foreground text-[11px]">{log.os}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{log.browser || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[11px] ${RESULT_BADGE[log.result]}`}>
                          {log.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {fmtDateTime(log.verified_at)}
                      </TableCell>
                      <TableCell>
                        {mapUrl ? (
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-blue-600 hover:underline"
                            title="Open in Google Maps"
                          >
                            <ExternalLink className="size-3.5" />
                            <span className="sr-only">Open in Google Maps</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ─── Footer hint ───────────────────────────────────────────── */}
      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
        <Globe className="size-3" />
        Showing the most recent {logs.length} of {total} verifications.
        Use the code filter above to focus on a specific document.
      </p>
    </div>
  );
}

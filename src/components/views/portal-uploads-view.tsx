"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { FolderOpen, Download, Trash2, Search, RefreshCw, ChevronLeft, Building2, FileText, Image, FileArchive, File, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import type { Partner } from "@/lib/supabase/types";
import { fmtDateTime, fmtRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface PortalUpload {
  id: string;
  tenant_id: string;
  partner_id: string;
  category: "kyc" | "rfq" | "message" | "general" | "other";
  doc_type: string | null;
  filename: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
  uploaded_by_email: string | null;
  description: string | null;
  deleted_at: string | null;
  storage_bucket: string;
  storage_path: string;
}
interface PartnerSummary {
  partner_id: string;
  total: number;
  last_upload: string;
  categories: Record<string, number>;
}

const CAT_STYLE: Record<string, string> = {
  kyc: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  rfq: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  message: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  general: "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/30",
  other: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function mimeIcon(mime: string) {
  if (mime.startsWith("image/")) return Image;
  if (mime === "application/pdf") return FileText;
  if (mime.includes("zip") || mime.includes("archive")) return FileArchive;
  return File;
}

export function PortalUploadsView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();
  const qc = useQueryClient();

  const [openPartner, setOpenPartner] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [catFilter, setCatFilter] = React.useState<string>("all");
  const [includeDeleted, setIncludeDeleted] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<PortalUpload | null>(null);
  const [hardDelete, setHardDelete] = React.useState(false);

  // Load partner names for pretty display
  const partnersQ = useQuery({
    queryKey: ["portal-uploads-partners", tenantKey],
    queryFn: async () => {
      const r = await fetch(api("/api/partners?limit=500"));
      return r.ok ? (r.json() as Promise<{ items: Partner[] }>) : { items: [] };
    },
  });
  const partnerMap = React.useMemo(() => new Map((partnersQ.data?.items || []).map((p) => [p.id, p])), [partnersQ.data]);

  // Summary (folder view)
  const summaryQ = useQuery({
    queryKey: ["portal-uploads-summary", tenantKey],
    queryFn: async () => {
      const r = await fetch(api("/api/portal-uploads?summary=1"));
      if (!r.ok) throw new Error("Failed to load summary");
      return r.json() as Promise<{ partners: PartnerSummary[] }>;
    },
  });

  // Detail listing (when a partner folder is opened)
  const detailQ = useQuery({
    queryKey: ["portal-uploads-detail", tenantKey, openPartner, search, catFilter, includeDeleted],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (openPartner) q.set("partner_id", openPartner);
      if (catFilter !== "all") q.set("category", catFilter);
      if (search) q.set("search", search);
      if (includeDeleted) q.set("include_deleted", "1");
      q.set("limit", "500");
      const r = await fetch(api(`/api/portal-uploads?${q.toString()}`));
      if (!r.ok) throw new Error("Failed to load uploads");
      return r.json() as Promise<{ items: PortalUpload[]; total: number }>;
    },
    enabled: !!openPartner,
  });

  const delMut = useMutation({
    mutationFn: async ({ id, hard }: { id: string; hard: boolean }) => {
      const r = await fetch(api(`/api/portal-uploads/${id}${hard ? "?hard=1" : ""}`), { method: "DELETE" });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Delete failed");
    },
    onSuccess: (_d, { hard }) => {
      toast.success(hard ? "File permanently deleted." : "File moved to deleted.");
      qc.invalidateQueries({ queryKey: ["portal-uploads-summary", tenantKey] });
      qc.invalidateQueries({ queryKey: ["portal-uploads-detail"] });
      setToDelete(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const partners = summaryQ.data?.partners || [];
  const totalFiles = partners.reduce((a, b) => a + b.total, 0);

  // Folder (partner list) view
  if (!openPartner) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Portal Uploads"
          description="Documents uploaded by portal clients. Organised as one folder per partner."
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <StatTile label="Partners with uploads" value={partners.length} />
          <StatTile label="Total files" value={totalFiles} />
          <StatTile label="KYC files" value={partners.reduce((a, b) => a + (b.categories.kyc || 0), 0)} />
          <StatTile label="Message attachments" value={partners.reduce((a, b) => a + (b.categories.message || 0), 0)} />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><FolderOpen className="size-4 text-primary" /> Client folders</CardTitle>
                <CardDescription className="text-xs">Click a folder to see everything that partner has uploaded.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => summaryQ.refetch()}>
                <RefreshCw className={cn("size-3.5 mr-1", summaryQ.isFetching && "animate-spin")} /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {summaryQ.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!summaryQ.isLoading && partners.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">No portal uploads yet.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {partners.map((p) => {
                const partner = partnerMap.get(p.partner_id);
                return (
                  <button
                    key={p.partner_id}
                    onClick={() => setOpenPartner(p.partner_id)}
                    className="text-left rounded-xl border border-border/60 bg-card p-4 hover:border-primary/50 hover:shadow-soft smooth"
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{partner?.name || p.partner_id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {partner?.country || "—"} · {partner?.email || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="tabular font-medium">{p.total} file{p.total !== 1 ? "s" : ""}</span>
                      <span className="text-muted-foreground">Last: {fmtRelative(p.last_upload)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(p.categories).map(([c, n]) => (
                        <Badge key={c} variant="outline" className={cn("text-[10px] capitalize", CAT_STYLE[c] || "")}>
                          {c} {n}
                        </Badge>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Detail view: files for a partner
  const partner = partnerMap.get(openPartner);
  const items = detailQ.data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpenPartner(null)}>
          <ChevronLeft className="size-4 mr-1" /> Back to folders
        </Button>
      </div>
      <PageHeader
        title={partner?.name || "Client uploads"}
        description={partner ? `${partner.country || ""} · ${partner.email || ""}` : ""}
      />

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input placeholder="Filename contains…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="kyc">KYC</SelectItem>
                <SelectItem value="rfq">RFQ</SelectItem>
                <SelectItem value="message">Message</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={includeDeleted ? "default" : "outline"} size="sm" onClick={() => setIncludeDeleted(!includeDeleted)}>
              {includeDeleted ? "Hide deleted" : "Include deleted"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => detailQ.refetch()}>
              <RefreshCw className={cn("size-3.5 mr-1", detailQ.isFetching && "animate-spin")} /> Refresh
            </Button>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Uploader</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailQ.isLoading && <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Loading…</TableCell></TableRow>}
                {!detailQ.isLoading && items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No files match.</TableCell></TableRow>}
                {items.map((f) => {
                  const Icon = mimeIcon(f.mime_type);
                  const isDeleted = !!f.deleted_at;
                  return (
                    <TableRow key={f.id} className={isDeleted ? "opacity-50" : ""}>
                      <TableCell>
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <Icon className="size-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[280px]">{f.filename}</p>
                            {f.doc_type && <p className="text-xs text-muted-foreground">{f.doc_type}</p>}
                            {f.description && <p className="text-xs text-muted-foreground italic truncate max-w-[280px]">{f.description}</p>}
                            {isDeleted && <Badge variant="destructive" className="text-[10px] mt-1">Deleted {fmtRelative(f.deleted_at!)}</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] capitalize", CAT_STYLE[f.category])}>{f.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular text-sm">{fmtBytes(f.size_bytes)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground" title={fmtDateTime(f.uploaded_at)}>{fmtRelative(f.uploaded_at)}</TableCell>
                      <TableCell className="text-xs">
                        <span className="inline-flex items-center gap-1"><User className="size-3" />{f.uploaded_by_email || "—"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isDeleted && (
                            <a
                              href={api(`/api/portal-uploads/${f.id}/download`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1 rounded hover:bg-primary/5"
                            >
                              <Download className="size-3.5" /> Download
                            </a>
                          )}
                          <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => { setToDelete(f); setHardDelete(isDeleted); }} title={isDeleted ? "Permanently delete" : "Delete"}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-destructive" />
              {hardDelete ? "Permanently delete this file?" : "Delete this file?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.filename}
              <br />
              {hardDelete
                ? "This will remove both the storage object and the database row. It cannot be undone."
                : "The file will be soft-deleted — hidden by default but still recoverable from storage. Use the “Include deleted” toggle to see it again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => toDelete && delMut.mutate({ id: toDelete.id, hard: hardDelete })}>
              {hardDelete ? "Delete permanently" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 p-3 bg-card">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular mt-0.5">{value.toLocaleString()}</p>
    </div>
  );
}

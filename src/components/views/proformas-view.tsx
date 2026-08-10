"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNewShortcut } from "@/lib/hooks/use-new-shortcut";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent,
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
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Plus, Search, Pencil, Trash2, Eye, X, Calendar, Send, CheckCircle2, Clock, Download, FileCheck, Wallet, AlertCircle,
  Sparkles, Loader2, Building2, MapPin, Hash, Mail, Phone, ArrowRight, ArrowLeftRight, ChevronDown, FileText, History,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard } from "@/components/common/kpi-card";
import { fmtMoney, fmtDate, fmtDateTime, fmtNumber } from "@/lib/utils/format";
import { Proforma, ProformaStatus, OfferLineItem, Offer, Partner, Product } from "@/lib/supabase/types";
import { CURRENCIES, OFFER_STATUSES, PAYMENT_TERMS_LOCAL } from "@/lib/data/reference";
import { UnitSelect } from "@/components/common/unit-select";
import { convertUnitPrice, describeConversion } from "@/lib/utils/unit-conversion";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import { useDebounced } from "@/lib/hooks/use-debounced";
import { usePageSize } from "@/lib/hooks/use-page-size";
import { PageSizeSelector } from "@/components/common/page-size-selector";
import { downloadPdf } from "@/lib/utils/download";

const STATUS_LABELS: Record<ProformaStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  paid: "Paid",
  expired: "Expired",
};

// Status-specific Tailwind class (used by both StatusBadge and filter dropdown).
// Mirrors the offer-view styling for consistency.
const STATUS_STYLES: Record<ProformaStatus, string> = {
  draft: "bg-secondary text-secondary-foreground",
  sent: "border-transparent bg-[var(--chart-1)] text-white",
  accepted: "border-transparent bg-emerald-600 text-white",
  paid: "border-transparent bg-emerald-700 text-white",
  expired: "border-transparent bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: ProformaStatus }) {
  if (status === "draft") return <Badge variant="secondary">{STATUS_LABELS[status]}</Badge>;
  return <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>;
}

function lineTotal(it: OfferLineItem): number {
  const line = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
  const disc = line * (Number(it.discount) || 0) / 100;
  const net = line - disc;
  const tax = net * (Number(it.tax_rate) || 0) / 100;
  return net + tax;
}

function computeTotals(items: OfferLineItem[]) {
  let subtotal = 0, discount_total = 0, tax_total = 0, total = 0;
  for (const it of items) {
    const line = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
    const disc = line * (Number(it.discount) || 0) / 100;
    const net = line - disc;
    const tax = net * (Number(it.tax_rate) || 0) / 100;
    subtotal += line;
    discount_total += disc;
    tax_total += tax;
    total += net + tax;
  }
  return { subtotal, discount_total, tax_total, total };
}

function isExpired(proforma: Proforma): boolean {
  if (proforma.status === "expired" || proforma.status === "paid") return proforma.status === "expired";
  if (!proforma.valid_until) return false;
  return new Date(proforma.valid_until).getTime() < Date.now();
}

// ─── Partner context type ───
interface PartnerContext {
  partner: Partner;
  deals: any[];
  offers: any[];
  invoices: any[];
  proformas: any[];
  productCatalog: any[];
  supplierOffers: any[];
  portalAccess: any;
  kyc: { status: string; submitted_at: string; reviewed_at: string; review_notes: string } | null;
  tradeCalculations: any[];
  inventoryMovements: any[];
}

export function ProformasView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Proforma | null>(null);
  const [showForm, setShowForm] = useState(false);
  useNewShortcut(() => { setEditing(null); setShowForm(true); });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFromOffer, setShowFromOffer] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const { pageSize: PAGE_SIZE, setPageSize, options: pageSizeOptions } = usePageSize("proformas", 20);
  useEffect(() => { setPage(0); }, [PAGE_SIZE, debouncedSearch, statusFilter, partnerFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ["proformas", tenantKey, debouncedSearch, statusFilter, partnerFilter, page, PAGE_SIZE],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (partnerFilter !== "all") params.set("partner_id", partnerFilter);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(page * PAGE_SIZE));
      const r = await fetch(api(`/api/proformas?${params}`));
      if (!r.ok) throw new Error("Failed to load proformas");
      return r.json() as Promise<{ items: Proforma[]; total: number }>;
    },
  });
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Unfiltered list for KPI rollups
  const kpiQuery = useQuery({
    queryKey: ["proformas", tenantKey, "kpi"],
    queryFn: async () => {
      const r = await fetch(api(`/api/proformas?limit=500`));
      if (!r.ok) throw new Error("Failed to load KPI data");
      return r.json() as Promise<{ items: Proforma[]; total: number }>;
    },
  });

  const partners = useQuery({
    queryKey: ["partners", tenantKey, "list", "200"],
    queryFn: async () => {
      const r = await fetch(api(`/api/partners?limit=200`));
      if (!r.ok) throw new Error("Failed to load partners");
      return r.json() as Promise<{ items: Partner[]; total: number }>;
    },
  });

  const detail = useQuery({
    queryKey: ["proforma", tenantKey, detailId],
    queryFn: async () => {
      const r = await fetch(api(`/api/proformas/${detailId}`));
      if (!r.ok) throw new Error("Failed to load proforma");
      return r.json() as Promise<Proforma>;
    },
    enabled: !!detailId,
  });

  const markPaidMut = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const r = await fetch(api(`/api/proformas/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid", paid_at: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error("Failed to mark as paid");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Proforma marked as paid.");
      qc.invalidateQueries({ queryKey: ["proformas", tenantKey] });
      if (detailId) qc.invalidateQueries({ queryKey: ["proforma", tenantKey, detailId] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
    },
    onError: () => toast.error("Could not update proforma."),
  });

  // ─── Mark proforma as accepted (client confirmed) ───
  // Promotes draft/sent → accepted. Once accepted, an invoice can be created.
  const markAcceptedMut = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const r = await fetch(api(`/api/proformas/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      if (!r.ok) throw new Error("Failed to mark as accepted");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Proforma marked as accepted.");
      setAcceptingId(null);
      qc.invalidateQueries({ queryKey: ["proformas", tenantKey] });
      if (detailId) qc.invalidateQueries({ queryKey: ["proforma", tenantKey, detailId] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
    },
    onError: () => {
      setAcceptingId(null);
      toast.error("Could not update proforma.");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/proformas/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete proforma");
    },
    onSuccess: () => {
      toast.success("Proforma deleted.");
      qc.invalidateQueries({ queryKey: ["proformas", tenantKey] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  // ─── Send proforma to portal (email + status + portal notification) ───
  const sendMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/proformas/${id}/send`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to send proforma");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Proforma sent to portal");
      qc.invalidateQueries({ queryKey: ["proformas", tenantKey] });
      if (detailId) qc.invalidateQueries({ queryKey: ["proforma", tenantKey, detailId] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to send proforma."),
  });

  // ─── Create invoice from proforma (linear flow: Offer → Proforma → Invoice) ───
  const createInvoiceMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/automation/create-invoice-from-proforma`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proforma_id: id }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create invoice");
      }
      return r.json();
    },
    onSuccess: (data: any) => {
      toast.success(`Invoice ${data?.number || ""} created from proforma`);
      qc.invalidateQueries({ queryKey: ["invoices", tenantKey] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to create invoice."),
  });

  const items = data?.items || [];
  const partnerList = partners.data?.items || [];
  const partnerName = (id: string) => partnerList.find((p) => p.id === id)?.name || "—";

  // KPI computations
  const kpis = useMemo(() => {
    const all = kpiQuery.data?.items || [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let outstanding = 0;
    let expiredCount = 0;
    let paidThisMonth = 0;
    for (const p of all) {
      if (p.status === "draft" || p.status === "sent" || p.status === "accepted") {
        outstanding += Number(p.total) || 0;
      }
      if (p.status === "expired" || ((p.status === "sent" || p.status === "accepted") && isExpired(p))) expiredCount += 1;
      if (p.status === "paid" && p.paid_at && new Date(p.paid_at) >= monthStart) {
        paidThisMonth += Number(p.total) || 0;
      }
    }
    return { outstanding, expiredCount, paidThisMonth };
  }, [kpiQuery.data]);

  return (
    <div>
      <PageHeader
        title="Proformas"
        description={`${data?.total ?? 0} total`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowFromOffer(true)}>
              <ArrowRight className="size-4 mr-1" /> From Offer
            </Button>
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="size-4 mr-1" /> New proforma
            </Button>
          </div>
        }
      />

      {/* KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <KpiCard
          label="Outstanding"
          value={fmtMoney(kpis.outstanding, "USD")}
          sub="Draft + sent + accepted"
          icon={Wallet}
        />
        <KpiCard
          label="Expired"
          value={kpis.expiredCount}
          sub="Past valid date"
          icon={AlertCircle}
          iconClassName={kpis.expiredCount > 0 ? "text-destructive" : undefined}
        />
        <KpiCard
          label="Paid this month"
          value={fmtMoney(kpis.paidThisMonth, "USD")}
          sub={new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
          icon={CheckCircle2}
          iconClassName="text-success"
        />
      </div>

      <Card className="mb-4 border-border/60 shadow-soft">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by number or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={partnerFilter} onValueChange={setPartnerFilter}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Partner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All partners</SelectItem>
              {partnerList.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<FileCheck className="size-6" />}
              title="No proformas"
              description="Create your first proforma to start tracking prepayments."
              action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New proforma</Button>}
            />
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead className="hidden md:table-cell">Subject</TableHead>
                    <TableHead className="hidden lg:table-cell">Partner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="hidden xl:table-cell">Issued</TableHead>
                    <TableHead className="hidden xl:table-cell">Valid until</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((p) => {
                    const expired = isExpired(p);
                    return (
                      <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(p.id)}>
                        <TableCell className="font-mono text-xs">{p.number}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="font-medium truncate max-w-[200px]">{p.subject || "—"}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{partnerName(p.partner_id)}</TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                        <TableCell className="text-right tabular">{fmtMoney(p.total, p.currency)}</TableCell>
                        <TableCell className="hidden xl:table-cell">{fmtDate(p.issue_date)}</TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span className={expired ? "text-destructive font-medium" : ""}>{fmtDate(p.valid_until)}</span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="size-8" onClick={() => setDetailId(p.id)} title="View">
                              <Eye className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditing(p); setShowForm(true); }} title="Edit">
                              <Pencil className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(p.id)} title="Delete">
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
          )}
          {/* Pagination + Page size */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {total > 0
                ? <>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</>
                : <>No results</>}
            </p>
            <div className="flex items-center gap-3">
              <PageSizeSelector value={PAGE_SIZE} onChange={setPageSize} options={pageSizeOptions} />
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  <span className="text-sm px-2 tabular-nums">{page + 1} / {totalPages}</span>
                  <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form dialog */}
      <ProformaFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        proforma={editing}
        partners={partnerList}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["proformas", tenantKey] });
          qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
        }}
      />

      {/* From Offer dialog */}
      <CreateFromOfferDialog
        open={showFromOffer}
        onOpenChange={setShowFromOffer}
        onCreated={() => {
          setShowFromOffer(false);
          qc.invalidateQueries({ queryKey: ["proformas", tenantKey] });
          qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
        }}
      />

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileCheck className="size-5" />
              <span className="font-mono text-base">{detail.data?.number || "Proforma"}</span>
            </SheetTitle>
            <SheetDescription>{detail.data?.subject || "Proforma details"}</SheetDescription>
          </SheetHeader>
          {detail.isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detail.data ? (
            <ProformaDetail
              proforma={detail.data}
              partnerName={partnerName(detail.data.partner_id)}
              onMarkPaid={() => detailId && markPaidMut.mutate({ id: detailId })}
              onMarkAccepted={() => detailId && setAcceptingId(detailId)}
              onSend={() => detailId && sendMut.mutate(detailId)}
              onCreateInvoice={() => detailId && createInvoiceMut.mutate(detailId)}
              markingPaid={markPaidMut.isPending}
              markingAccepted={markAcceptedMut.isPending}
              sending={sendMut.isPending}
              creatingInvoice={createInvoiceMut.isPending}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Accept confirm */}
      <AlertDialog open={!!acceptingId} onOpenChange={(o) => !o && setAcceptingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark proforma as accepted?</AlertDialogTitle>
            <AlertDialogDescription>
              This records that the client has confirmed the proforma. Once accepted, you can create an invoice from it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => acceptingId && markAcceptedMut.mutate({ id: acceptingId })}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="size-4 mr-1" /> Mark Accepted
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete proforma?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The proforma and its line items will be permanently removed.
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

// ---- Detail panel ----
function ProformaDetail({
  proforma, partnerName, onMarkPaid, onMarkAccepted, onSend, onCreateInvoice, markingPaid, markingAccepted, sending, creatingInvoice,
}: {
  proforma: Proforma;
  partnerName: string;
  onMarkPaid: () => void;
  onMarkAccepted: () => void;
  onSend: () => void;
  onCreateInvoice: () => void;
  markingPaid: boolean;
  markingAccepted: boolean;
  sending: boolean;
  creatingInvoice: boolean;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();
  const [downloading, setDownloading] = useState(false);
  const totals = computeTotals(proforma.items || []);
  const expired = isExpired(proforma);

  // Invoice creation is unlocked at "accepted" (primary) or "sent" (secondary —
  // for cases where the client agreed verbally but didn't go through the
  // explicit accept step). We also allow invoicing from a "paid" proforma
  // for retroactive record-keeping.
  const canCreateInvoice =
    proforma.status === "accepted" ||
    proforma.status === "sent" ||
    proforma.status === "paid";
  // When the proforma is only "sent" (not yet explicitly accepted), warn
  // the user before creating the invoice.
  const needsAcceptWarning = proforma.status === "sent";

  // ─── Auto-saved revisions (from recordRevision in the API layer) ───
  const revisions = useQuery({
    queryKey: ["document-revisions", tenantKey, proforma.id],
    queryFn: async () => {
      try {
        const r = await fetch(api(`/api/document-revisions/${proforma.id}`));
        if (!r.ok) return [];
        const data = await r.json();
        return ((data.items || []) as any[]).sort(
          (a, b) => (b.version || 0) - (a.version || 0),
        );
      } catch {
        return [];
      }
    },
    enabled: !!proforma.id,
  });
  const revisionList = revisions.data || [];

  return (
    <div className="px-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={proforma.status} />
          <span className="text-sm text-muted-foreground">{partnerName}</span>
        </div>
        <div className="flex items-center gap-2">
          {proforma.status === "draft" && (
            <Button size="sm" onClick={onSend} disabled={sending} variant="default" className="gap-1">
              {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Send
            </Button>
          )}
          {proforma.status === "sent" && (
            <Button
              size="sm"
              onClick={onMarkAccepted}
              disabled={markingAccepted}
              variant="default"
              className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
              title="Mark this proforma as accepted by the client"
            >
              {markingAccepted ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />} Mark Accepted
            </Button>
          )}
          <Button
            size="sm"
            variant="default"
            onClick={onCreateInvoice}
            disabled={creatingInvoice || !canCreateInvoice}
            title={
              canCreateInvoice
                ? needsAcceptWarning
                  ? "Proforma is sent but not yet accepted. Click to create an invoice anyway."
                  : "Create a new invoice from this proforma"
                : "Proforma must be sent or accepted before an invoice can be created"
            }
          >
            {creatingInvoice ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <FileText className="size-4 mr-1" />
            )}
            Create Invoice
          </Button>
          {proforma.status !== "paid" && proforma.status !== "expired" && (
            <Button size="sm" onClick={onMarkPaid} disabled={markingPaid} className="bg-emerald-600 text-white hover:bg-emerald-700">
              <CheckCircle2 className="size-4 mr-1" /> Mark as paid
            </Button>
          )}
        </div>
      </div>

      {/* Key-value header */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="size-3" /> Issue date</p>
          <p className="text-sm font-medium">{fmtDate(proforma.issue_date)}</p>
        </div>
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" /> Valid until</p>
          <p className={`text-sm font-medium ${expired ? "text-destructive" : ""}`}>{fmtDate(proforma.valid_until)}</p>
        </div>
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Send className="size-3" /> Sent</p>
          <p className="text-sm font-medium">{fmtDateTime(proforma.sent_at)}</p>
        </div>
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="size-3" /> Paid</p>
          <p className="text-sm font-medium">{fmtDateTime(proforma.paid_at)}</p>
        </div>
      </div>

      {/* Line items table */}
      <div className="rounded-md border overflow-hidden mb-4">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">SKU</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Disc %</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Tax %</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(proforma.items || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                  No line items.
                </TableCell>
              </TableRow>
            ) : (proforma.items || []).map((it, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="font-medium">{it.product_name || "—"}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">{it.sku || "—"}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell font-mono text-xs">{it.sku || "—"}</TableCell>
                <TableCell className="text-right tabular">{fmtNumber(it.quantity)}</TableCell>
                <TableCell className="text-right tabular">{fmtMoney(it.unit_price, proforma.currency)}</TableCell>
                <TableCell className="text-right tabular hidden sm:table-cell">{it.discount}%</TableCell>
                <TableCell className="text-right tabular hidden sm:table-cell">{it.tax_rate}%</TableCell>
                <TableCell className="text-right tabular font-medium">{fmtMoney(lineTotal(it), proforma.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      <div className="ml-auto w-full sm:w-72 space-y-1 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular">{fmtMoney(proforma.subtotal ?? totals.subtotal, proforma.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span className="tabular">- {fmtMoney(proforma.discount_total ?? totals.discount_total, proforma.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="tabular">{fmtMoney(proforma.tax_total ?? totals.tax_total, proforma.currency)}</span>
        </div>
        <div className="flex justify-between border-t pt-1 mt-1 text-base font-semibold">
          <span>Total</span>
          <span className="tabular">{fmtMoney(proforma.total ?? totals.total, proforma.currency)}</span>
        </div>
      </div>

      {/* Notes */}
      {proforma.notes && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/40">{proforma.notes}</p>
        </div>
      )}

      {/* Download */}
      <div className="pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          disabled={downloading}
          onClick={async () => {
            try {
              setDownloading(true);
              const filename = `Proforma_${proforma.number || proforma.id}.pdf`;
              await downloadPdf(api(`/api/proformas/${proforma.id}/pdf`), filename);
              toast.success("PDF downloaded");
            } catch (e: any) {
              toast.error(e?.message || "Failed to download PDF");
            } finally {
              setDownloading(false);
            }
          }}
        >
          {downloading ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Download className="size-4 mr-1" />}
          Download PDF
        </Button>
      </div>

      {/* Version History (auto-saved revisions) */}
      <div className="pt-4 mt-4 border-t">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
          <History className="size-4" /> Version History
          <Badge variant="outline" className="ml-1 font-mono text-xs">
            v{(proforma as any).version || 1}
          </Badge>
        </h4>
        {revisions.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : revisionList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
            <History className="size-6 text-muted-foreground/40 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">No revisions yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every edit to this proforma is automatically saved as a version.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-20">Version</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead className="hidden sm:table-cell w-32">Author</TableHead>
                  <TableHead className="w-36">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revisionList.map((rev: any, i: number) => {
                  const fields: any[] = Array.isArray(rev.changed_fields) ? rev.changed_fields : [];
                  return (
                    <TableRow key={rev.id || i}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          V{rev.version}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm align-top">
                        {rev.change_note ? (
                          <p className="mb-1">{rev.change_note}</p>
                        ) : null}
                        {fields.length > 0 ? (
                          <div className="space-y-1">
                            {fields.slice(0, 4).map((c: any, idx: number) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium">{c.field}:</span>{" "}
                                <span className="text-red-600 dark:text-red-400 line-through">
                                  {String(c.before ?? "").slice(0, 40) || "∅"}
                                </span>{" "}
                                →{" "}
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {String(c.after ?? "").slice(0, 40) || "∅"}
                                </span>
                              </div>
                            ))}
                            {fields.length > 4 ? (
                              <div className="text-xs text-muted-foreground">
                                +{fields.length - 4} more field{fields.length - 4 === 1 ? "" : "s"}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground align-top">
                        {rev.changed_by_username || rev.created_by || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground tabular-nums align-top">
                        {fmtDateTime(rev.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Create from Offer dialog ----
function CreateFromOfferDialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [creating, setCreating] = useState<string | null>(null);

  const offers = useQuery({
    queryKey: ["offers", tenantKey, "for-proforma"],
    queryFn: async () => {
      const r = await fetch(api(`/api/offers?limit=100`));
      if (!r.ok) throw new Error("Failed to load offers");
      return r.json() as Promise<{ items: Offer[]; total: number }>;
    },
    enabled: open,
  });

  const partners = useQuery({
    queryKey: ["partners", tenantKey, "list", "200"],
    queryFn: async () => {
      const r = await fetch(api(`/api/partners?limit=200`));
      if (!r.ok) throw new Error("Failed to load partners");
      return r.json() as Promise<{ items: Partner[]; total: number }>;
    },
    enabled: open,
  });

  const partnerList = partners.data?.items || [];
  const partnerName = (id: string) => partnerList.find((p) => p.id === id)?.name || "—";
  const offerList = offers.data?.items || [];

  async function createFromOffer(offerId: string) {
    setCreating(offerId);
    try {
      const r = await fetch(api("/api/automation/create-proforma-from-offer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id: offerId }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create proforma");
      }
      const created = await r.json();
      toast.success(`Proforma ${created.number} created from offer`, {
        description: "All offer data, partner info and items auto-filled. Valid until set to 30 days.",
      });
      onCreated();
    } catch (e: any) {
      toast.error(e.message || "Failed to create proforma from offer.");
    } finally {
      setCreating(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="size-5" />
            Create Proforma from Offer
          </DialogTitle>
          <DialogDescription>
            Select an offer to auto-create a proforma. All data, including partner info, items, and pricing will be auto-filled. Valid until is set to 30 days.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">

        {offers.isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : offerList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileCheck className="size-8 mx-auto mb-2 opacity-50" />
            <p>No offers available to create proformas from.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {offerList.map((o) => (
              <Card key={o.id} className="border-border/60 hover:border-foreground/20 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs">{o.number}</span>
                        <Badge variant="outline" className="text-xs">{o.status}</Badge>
                      </div>
                      <p className="font-medium text-sm truncate">{o.subject || "—"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {partnerName(o.partner_id)} · {fmtMoney(o.total, o.currency)} · {(o.items || []).length} items
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createFromOffer(o.id)}
                      disabled={creating === o.id}
                    >
                      {creating === o.id ? (
                        <><Loader2 className="size-4 mr-1 animate-spin" /> Creating…</>
                      ) : (
                        <><Sparkles className="size-4 mr-1" /> Create</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Form dialog ----
function ProformaFormDialog({
  open, onOpenChange, proforma, partners, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  proforma: Proforma | null;
  partners: Partner[];
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const isEditing = !!proforma;

  const [form, setForm] = useState<Partial<Proforma> & { items: OfferLineItem[] }>({ items: [] });

  // Ref mirror of `form` so event handlers (handleUnitChange, selectProduct)
  // can read the latest line items without capturing stale state.
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  const [saving, setSaving] = useState(false);
  const [partnerContext, setPartnerContext] = useState<PartnerContext | null>(null);
  const [loadingPartner, setLoadingPartner] = useState(false);

  // Collapsible sections: open by default for new, all open for edit
  const [itemsOpen, setItemsOpen] = useState(!isEditing);
  const [notesOpen, setNotesOpen] = useState(false);

  const offers = useQuery({
    queryKey: ["offers", tenantKey, "list", "100"],
    queryFn: async () => {
      const r = await fetch(api(`/api/offers?limit=100`));
      if (!r.ok) throw new Error("Failed to load offers");
      return r.json() as Promise<{ items: Offer[]; total: number }>;
    },
    enabled: open,
  });

  const products = useQuery({
    queryKey: ["products", tenantKey, "list", "200"],
    queryFn: async () => {
      const r = await fetch(api(`/api/products?limit=200`));
      if (!r.ok) throw new Error("Failed to load products");
      return r.json() as Promise<{ items: Product[]; total: number }>;
    },
    enabled: open,
  });

  // Reset form when opening / when proforma changes
  useEffect(() => {
    if (open) {
      const now = new Date();
      const validUntil = new Date(now);
      validUntil.setDate(validUntil.getDate() + 30);

      setForm(proforma ? {
        ...proforma,
        items: (proforma.items || []).map((i) => ({ ...i })),
      } : {
        currency: "EUR",
        issue_date: now.toISOString(),
        valid_until: validUntil.toISOString(),
        notes: "",
        status: "draft",
        subject: "",
        items: [],
      });

      // When editing, expand all sections so the user can see all fields
      if (proforma) {
        setItemsOpen(true);
        setNotesOpen(true);
      } else {
        setItemsOpen(true);
        setNotesOpen(false);
      }

      setPartnerContext(null);
    }
  }, [open, proforma]);

  function set<K extends keyof Proforma>(k: K, v: Proforma[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setItem(idx: number, patch: Partial<OfferLineItem>) {
    setForm((f) => {
      const items = [...(f.items || [])];
      items[idx] = { ...items[idx], ...patch };
      return { ...f, items };
    });
  }

  /**
   * Handle a unit-of-measure change on a line item.
   *
   * Same-category changes (e.g. kg → MT) auto-convert the unit_price so the
   * line total stays the same. Cross-category changes (e.g. kg → piece) leave
   * the price untouched and warn the user.
   */
  function handleUnitChange(idx: number, newUnit: string) {
    const items = formRef.current.items || [];
    const item = items[idx];
    if (!item) {
      setItem(idx, { unit: newUnit });
      return;
    }
    const oldUnit = item.unit || "";

    if (!oldUnit || oldUnit === newUnit) {
      setItem(idx, { unit: newUnit });
      return;
    }

    const currentPrice = Number(item.unit_price) || 0;
    const convertedPrice = convertUnitPrice(currentPrice, oldUnit, newUnit);

    if (convertedPrice != null && currentPrice > 0) {
      setItem(idx, { unit: newUnit, unit_price: convertedPrice });
      toast.info(`Price auto-converted: ${currentPrice} ${oldUnit} → ${convertedPrice.toFixed(2)} ${newUnit}`);
    } else {
      setItem(idx, { unit: newUnit });
      if (currentPrice > 0) {
        toast.warning(`Cannot auto-convert price from ${oldUnit} to ${newUnit} (different unit categories). Please enter price manually.`);
      }
    }
  }

  function selectProduct(idx: number, productId: string) {
    const p = (products.data?.items || []).find((x) => x.id === productId);
    if (!p) return;

    // Unit-conversion aware: if the user already picked a non-default unit on
    // this line (e.g. they set "MT" while the product is priced per "kg"),
    // preserve their choice and convert the product price into that unit so
    // the form stays internally consistent. If the line still has the default
    // "pcs" unit we adopt the product's native unit instead.
    const supplierUnit = p.unit || null;
    const currentLineUnit = formRef.current.items?.[idx]?.unit || null;
    const preserveLineUnit =
      currentLineUnit && currentLineUnit !== "pcs" ? currentLineUnit : null;
    const lineUnit = preserveLineUnit || supplierUnit || "pcs";

    const basePrice = Number(p.price) || 0;
    let priceToUse = basePrice;
    if (supplierUnit && lineUnit !== supplierUnit && basePrice > 0) {
      const converted = convertUnitPrice(basePrice, supplierUnit, lineUnit);
      if (converted != null) priceToUse = converted;
    }

    setItem(idx, {
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      unit: lineUnit,
      unit_price: priceToUse,
      hs_code: (p as any).hs_code ?? null,
      description: (p as any).description ?? null,
      detailed_spec: (p as any).detailed_spec ?? null,
      brand: (p as any).brand ?? null,
      origin_country: (p as any).origin_country ?? null,
      specifications: (p as any).specifications ?? null,
    });
  }

  function addItem() {
    setForm((f) => ({
      ...f,
      items: [...(f.items || []), {
        product_id: "", product_name: "", sku: "", unit: "pcs",
        quantity: 1, unit_price: 0, discount: 0, tax_rate: 20, total: 0,
      }],
    }));
  }

  function removeItem(idx: number) {
    setForm((f) => ({
      ...f,
      items: (f.items || []).filter((_, i) => i !== idx),
    }));
  }

  // ─── Partner auto-fill ───
  const fetchPartnerContext = useCallback(async (partnerId: string) => {
    if (!partnerId) {
      setPartnerContext(null);
      return;
    }
    setLoadingPartner(true);
    try {
      const r = await fetch(api(`/api/automation/partner-context?partner_id=${partnerId}`));
      if (!r.ok) throw new Error("Failed to load partner context");
      const ctx: PartnerContext = await r.json();
      setPartnerContext(ctx);

      // Auto-fill partner preferences
      const p = ctx.partner;
      setForm((f) => ({
        ...f,
        partner_id: partnerId,
        currency: p.preferred_currency || f.currency || "EUR",
      }));

      toast.success(`Partner data loaded: ${p.name}`, { description: "Currency & preferences auto-filled." });
    } catch {
      toast.error("Failed to load partner context.");
      setPartnerContext(null);
    } finally {
      setLoadingPartner(false);
    }
  }, []);

  const selectedPartner = form.partner_id ? partners.find((p) => p.id === form.partner_id) : undefined;

  const totals = computeTotals(form.items || []);

  async function save() {
    if (!form.partner_id) { toast.error("Select a partner."); return; }
    setSaving(true);
    try {
      const method = proforma ? "PUT" : "POST";
      const url = proforma ? api(`/api/proformas/${proforma.id}`) : api("/api/proformas");
      const body = {
        ...form,
        subject: form.subject || `Proforma for ${selectedPartner?.name || "partner"}`,
        items: (form.items || []).map((it) => ({ ...it, total: lineTotal(it) })),
        ...computeTotals(form.items || []),
      };
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save");
      }
      const saved = await r.json();
      if (proforma) {
        toast.success("Proforma updated.", { description: `Reference: ${saved.number || proforma.number}` });
      } else {
        toast.success("Proforma created!", { description: `Reference: ${saved.number}` });
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const offerList = offers.data?.items || [];
  const productList = products.data?.items || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            {isEditing ? "Edit proforma" : "New proforma"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the proforma details below."
              : "Start by choosing a partner, then add your line items. Defaults are pre-filled for you."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-4 py-2">

            {/* ─── Essential section (always visible) ─── */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Partner select with auto-fill */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    Partner *
                    {loadingPartner && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                    {partnerContext && !loadingPartner && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                        <Sparkles className="size-2.5 text-amber-500" /> Auto-filled
                      </Badge>
                    )}
                  </Label>
                  <Select
                    value={form.partner_id || ""}
                    onValueChange={(v) => {
                      set("partner_id", v);
                      fetchPartnerContext(v);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            <span>{p.name}</span>
                            <span className="text-xs text-muted-foreground">({p.type})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency */}
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={form.currency || "EUR"} onValueChange={(v) => set("currency", v)}>
                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment terms - removed, not in DB schema */}

                {/* Subject (optional, smaller) */}
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">Subject <span className="text-xs">(optional)</span></Label>
                  <Input
                    value={form.subject || ""}
                    onChange={(e) => set("subject", e.target.value)}
                    placeholder="Auto-generated if left empty"
                  />
                </div>
              </div>

              {/* Partner context panel */}
              {selectedPartner && partnerContext && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="size-4 text-amber-600" />
                    <span className="text-sm font-medium">{selectedPartner.name}</span>
                    <Badge variant="outline" className="text-xs">{selectedPartner.type}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    {selectedPartner.address_line && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{[selectedPartner.address_line, selectedPartner.city, selectedPartner.country].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {selectedPartner.vat_number && (
                      <div className="flex items-center gap-1.5">
                        <Hash className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">VAT: {selectedPartner.vat_number}</span>
                      </div>
                    )}
                    {selectedPartner.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">{selectedPartner.email}</span>
                      </div>
                    )}
                    {selectedPartner.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">{selectedPartner.phone}</span>
                      </div>
                    )}
                    {selectedPartner.preferred_currency && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Currency: {selectedPartner.preferred_currency}</span>
                      </div>
                    )}
                    {selectedPartner.bank_name && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Bank: {selectedPartner.bank_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ─── Line Items (collapsible, open by default for new) ─── */}
            <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full group">
                <ChevronDown className={`size-4 transition-transform ${itemsOpen ? "" : "-rotate-90"}`} />
                <span className="text-sm font-semibold">Line items</span>
                {(form.items || []).length > 0 && (
                  <Badge variant="secondary" className="text-xs">{(form.items || []).length}</Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {fmtMoney(totals.total, form.currency || "EUR")}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-3">
                  {/* Dates & linked offer (inside line items, compact) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Issue date</Label>
                      <Input
                        type="date"
                        className="h-9"
                        value={form.issue_date ? form.issue_date.slice(0, 10) : ""}
                        onChange={(e) => set("issue_date", e.target.value ? new Date(e.target.value).toISOString() : null as unknown as string)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        Valid until
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 gap-0.5">
                          <Sparkles className="size-2 text-amber-500" /> 30d
                        </Badge>
                      </Label>
                      <Input
                        type="date"
                        className="h-9"
                        value={form.valid_until ? form.valid_until.slice(0, 10) : ""}
                        onChange={(e) => set("valid_until", e.target.value ? new Date(e.target.value).toISOString() : null as unknown as string)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Linked offer <span className="text-muted-foreground">(optional)</span></Label>
                      <Select
                        value={form.offer_id || "__none__"}
                        onValueChange={(v) => set("offer_id", v === "__none__" ? null : v)}
                      >
                        <SelectTrigger className="h-9"><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— No offer —</SelectItem>
                          {offerList.map((o) => (
                            <SelectItem key={o.id} value={o.id}>{o.number} · {o.subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Add products or services to this proforma</p>
                    <Button type="button" size="sm" variant="outline" onClick={addItem}>
                      <Plus className="size-4 mr-1" /> Add item
                    </Button>
                  </div>

                  {(form.items || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6 border rounded-md border-dashed">
                      No items yet. Click &ldquo;Add item&rdquo; to start building your proforma.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll pr-1">
                      {(form.items || []).map((it, idx) => (
                        <div key={idx} className="rounded-md border p-2.5 grid grid-cols-12 gap-1.5 items-end">
                          <div className="col-span-12 sm:col-span-4 space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Select
                              value={it.product_id || "__custom__"}
                              onValueChange={(v) => {
                                if (v === "__custom__") return;
                                selectProduct(idx, v);
                              }}
                            >
                              <SelectTrigger className="h-9"><SelectValue placeholder="Select product or type" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__custom__">— Manual entry —</SelectItem>
                                {productList.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              className="h-8 text-xs"
                              placeholder="Product name"
                              value={it.product_name || ""}
                              onChange={(e) => setItem(idx, { product_name: e.target.value })}
                            />
                          </div>
                          <div className="col-span-3 sm:col-span-2 space-y-1">
                            <Label className="text-xs">Qty</Label>
                            <Input
                              type="number"
                              className="h-9"
                              value={it.quantity}
                              onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })}
                            />
                          </div>
                          <div className="col-span-4 sm:col-span-2 space-y-1">
                            <Label className="text-xs">Unit</Label>
                            <UnitSelect
                              value={it.unit || ""}
                              onChange={(v) => handleUnitChange(idx, v)}
                              placeholder="pcs"
                            />
                          </div>
                          <div className="col-span-4 sm:col-span-2 space-y-1">
                            <Label className="text-xs">Unit price</Label>
                            <Input
                              type="number"
                              className="h-9"
                              value={it.unit_price}
                              onChange={(e) => setItem(idx, { unit_price: Number(e.target.value) })}
                            />
                            {it.product_id &&
                              it.unit &&
                              (() => {
                                const p = (products.data?.items || []).find((x) => x.id === it.product_id);
                                const supplierUnit = p?.unit || null;
                                if (!supplierUnit || supplierUnit === it.unit) return null;
                                const desc = describeConversion(supplierUnit, it.unit);
                                if (!desc) return null;
                                return (
                                  <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5 mt-0.5">
                                    <ArrowLeftRight className="size-2.5 shrink-0" />
                                    <span>{desc}</span>
                                  </div>
                                );
                              })()}
                          </div>
                          <div className="col-span-2 sm:col-span-1 space-y-1">
                            <Label className="text-xs">VAT %</Label>
                            <Input
                              type="number"
                              className="h-9"
                              value={it.tax_rate}
                              onChange={(e) => setItem(idx, { tax_rate: Number(e.target.value) })}
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-9 text-destructive"
                              onClick={() => removeItem(idx)}
                              title="Remove item"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                          <div className="col-span-12 text-right text-xs text-muted-foreground -mt-1">
                            Line total: <span className="tabular font-medium text-foreground">{fmtMoney(lineTotal(it), form.currency || "EUR")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Computed totals */}
                  <div className="ml-auto w-full sm:w-72 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular">{fmtMoney(totals.subtotal, form.currency || "EUR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="tabular">- {fmtMoney(totals.discount_total, form.currency || "EUR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="tabular">{fmtMoney(totals.tax_total, form.currency || "EUR")}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1 text-base font-semibold">
                      <span>Total</span>
                      <span className="tabular">{fmtMoney(totals.total, form.currency || "EUR")}</span>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* ─── Notes (collapsible, closed by default for new) ─── */}
            <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full group">
                <ChevronDown className={`size-4 transition-transform ${notesOpen ? "" : "-rotate-90"}`} />
                <span className="text-sm font-semibold">Notes</span>
                {form.notes && (
                  <Badge variant="secondary" className="text-xs">Has notes</Badge>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3">
                  <Textarea
                    rows={3}
                    value={form.notes || ""}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Add any internal notes or payment instructions…"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : isEditing ? "Save changes" : "Create proforma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

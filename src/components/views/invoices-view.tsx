"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Plus, Search, FileText, Pencil, Trash2, Eye, X, Calendar, Send, CheckCircle2, Clock, Download, AlertTriangle, Wallet, Receipt, ChevronDown, ChevronRight, Sparkles, Zap, FileDown,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard } from "@/components/common/kpi-card";
import { fmtMoney, fmtDate, fmtDateTime, fmtNumber } from "@/lib/utils/format";
import { Invoice, InvoiceStatus, OfferLineItem, Offer, Partner, Product } from "@/lib/supabase/types";
import { CURRENCIES, INVOICE_STATUSES, PAYMENT_TERMS_LOCAL } from "@/lib/data/reference";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

const PAYMENT_TERMS_OPTIONS = [
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 45", label: "Net 45" },
  { value: "Net 60", label: "Net 60" },
  { value: "Net 90", label: "Net 90" },
  { value: "Due on Receipt", label: "Due on Receipt" },
  { value: "Custom", label: "Custom" },
];

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "draft") return <Badge variant="secondary">{STATUS_LABELS[status]}</Badge>;
  if (status === "overdue") return <Badge variant="destructive">{STATUS_LABELS[status]}</Badge>;
  if (status === "paid") return <Badge className="border-transparent bg-emerald-600 text-white">{STATUS_LABELS[status]}</Badge>;
  if (status === "sent") return <Badge className="border-transparent bg-[var(--chart-1)] text-white">{STATUS_LABELS[status]}</Badge>;
  return <Badge className="border-transparent bg-muted text-muted-foreground">{STATUS_LABELS[status]}</Badge>;
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

function isOverdue(inv: Invoice): boolean {
  if (inv.status === "overdue" || inv.status === "paid" || inv.status === "cancelled") return inv.status === "overdue";
  if (!inv.due_date) return false;
  return new Date(inv.due_date).getTime() < Date.now();
}

/** Calculate due date from payment terms */
function calculateDueDate(paymentTerms: string): Date {
  const now = new Date();
  const match = paymentTerms.match(/Net\s+(\d+)/i);
  if (match) {
    const days = parseInt(match[1], 10);
    now.setDate(now.getDate() + days);
    return now;
  }
  if (paymentTerms === "Due on Receipt") {
    return now;
  }
  // Default to Net 30
  now.setDate(now.getDate() + 30);
  return now;
}

export function InvoicesView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  useNewShortcut(() => { setEditing(null); setShowForm(true); });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showOfferPicker, setShowOfferPicker] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", tenantKey, search, statusFilter, partnerFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (partnerFilter !== "all") params.set("partner_id", partnerFilter);
      const r = await fetch(api(`/api/invoices?${params}`));
      if (!r.ok) throw new Error("Failed to load invoices");
      return r.json() as Promise<{ items: Invoice[]; total: number }>;
    },
  });

  // Unfiltered list for KPI rollups
  const kpiQuery = useQuery({
    queryKey: ["invoices", tenantKey, "kpi"],
    queryFn: async () => {
      const r = await fetch(api(`/api/invoices?limit=500`));
      if (!r.ok) throw new Error("Failed to load KPI data");
      return r.json() as Promise<{ items: Invoice[]; total: number }>;
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
    queryKey: ["invoice", tenantKey, detailId],
    queryFn: async () => {
      const r = await fetch(api(`/api/invoices/${detailId}`));
      if (!r.ok) throw new Error("Failed to load invoice");
      return r.json() as Promise<Invoice>;
    },
    enabled: !!detailId,
  });

  // Mark as sent mutation
  const markSentMut = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const r = await fetch(api(`/api/invoices/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error("Failed to mark as sent");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Invoice marked as sent.");
      qc.invalidateQueries({ queryKey: ["invoices", tenantKey] });
      if (detailId) qc.invalidateQueries({ queryKey: ["invoice", tenantKey, detailId] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
    },
    onError: () => toast.error("Could not update invoice."),
  });

  const markPaidMut = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const r = await fetch(api(`/api/invoices/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid", paid_at: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error("Failed to mark as paid");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Invoice marked as paid.");
      qc.invalidateQueries({ queryKey: ["invoices", tenantKey] });
      if (detailId) qc.invalidateQueries({ queryKey: ["invoice", tenantKey, detailId] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
    },
    onError: () => toast.error("Could not update invoice."),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/invoices/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete invoice");
    },
    onSuccess: () => {
      toast.success("Invoice deleted.");
      qc.invalidateQueries({ queryKey: ["invoices", tenantKey] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  // Create invoice from offer mutation
  const createFromOfferMut = useMutation({
    mutationFn: async ({ offer_id }: { offer_id: string }) => {
      const r = await fetch(api(`/api/automation/create-invoice-from-offer`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create invoice from offer");
      }
      return r.json() as Promise<Invoice>;
    },
    onSuccess: (created) => {
      toast.success(`Invoice ${created.number} created from offer.`);
      qc.invalidateQueries({ queryKey: ["invoices", tenantKey] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
      setShowOfferPicker(false);
      // Open the newly created invoice for editing
      setEditing(created);
      setShowForm(true);
    },
    onError: (e: any) => toast.error(e.message || "Failed to create invoice from offer."),
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
    let overdueCount = 0;
    let paidThisMonth = 0;
    for (const inv of all) {
      if (inv.status === "sent" || inv.status === "overdue") {
        outstanding += Number(inv.total) || 0;
      }
      if (inv.status === "overdue") overdueCount += 1;
      if (inv.status === "paid" && inv.paid_at && new Date(inv.paid_at) >= monthStart) {
        paidThisMonth += Number(inv.total) || 0;
      }
    }
    return { outstanding, overdueCount, paidThisMonth };
  }, [kpiQuery.data]);

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={`${data?.total ?? 0} total`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.open("/api/invoices/export?format=csv", "_blank")}>
              <Download className="size-4 mr-1" /> Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowOfferPicker(true)}
              className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
            >
              <Zap className="size-4" /> From Offer
            </Button>
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="size-4 mr-1" /> New invoice
            </Button>
          </div>
        }
      />

      {/* KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <KpiCard
          label="Total outstanding"
          value={fmtMoney(kpis.outstanding, "USD")}
          sub="Sent + overdue"
          icon={Wallet}
        />
        <KpiCard
          label="Overdue"
          value={kpis.overdueCount}
          sub="Past due date"
          icon={AlertTriangle}
          iconClassName={kpis.overdueCount > 0 ? "text-destructive" : undefined}
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
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
              icon={<Receipt className="size-6" />}
              title="No invoices"
              description="Create your first invoice or auto-generate one from an accepted offer."
              action={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowOfferPicker(true)} className="gap-1.5 border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                    <Zap className="size-4" /> From Offer
                  </Button>
                  <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New invoice</Button>
                </div>
              }
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
                    <TableHead className="hidden xl:table-cell">Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((inv) => {
                    const overdue = isOverdue(inv);
                    return (
                      <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(inv.id)}>
                        <TableCell className="font-mono text-xs">{inv.number}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="font-medium truncate max-w-[200px]">{inv.subject || "—"}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{partnerName(inv.partner_id)}</TableCell>
                        <TableCell><StatusBadge status={inv.status} /></TableCell>
                        <TableCell className="text-right tabular">{fmtMoney(inv.total, inv.currency)}</TableCell>
                        <TableCell className="hidden xl:table-cell">{fmtDate(inv.issue_date)}</TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span className={overdue ? "text-destructive font-medium" : ""}>{fmtDate(inv.due_date)}</span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="size-8" title="Quick actions">
                                  <ChevronDown className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">Quick Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {inv.status === "draft" && (
                                  <DropdownMenuItem onClick={() => markSentMut.mutate({ id: inv.id })} disabled={markSentMut.isPending}>
                                    <Send className="size-4 mr-2" /> Mark as Sent
                                  </DropdownMenuItem>
                                )}
                                {(inv.status === "sent" || inv.status === "overdue") && (
                                  <DropdownMenuItem onClick={() => markPaidMut.mutate({ id: inv.id })} disabled={markPaidMut.isPending}>
                                    <CheckCircle2 className="size-4 mr-2" /> Mark as Paid
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" download className="flex items-center">
                                    <FileDown className="size-4 mr-2" /> Download PDF
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDetailId(inv.id)}>
                                  <Eye className="size-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditing(inv); setShowForm(true); }}>
                                  <Pencil className="size-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteId(inv.id)}
                                >
                                  <Trash2 className="size-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button size="icon" variant="ghost" className="size-8" onClick={() => setDetailId(inv.id)} title="View">
                              <Eye className="size-4" />
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
        </CardContent>
      </Card>

      {/* Form dialog */}
      <InvoiceFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        invoice={editing}
        partners={partnerList}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["invoices", tenantKey] });
          qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
        }}
      />

      {/* Create from Offer dialog */}
      <CreateFromOfferDialog
        open={showOfferPicker}
        onOpenChange={setShowOfferPicker}
        onCreateFromOffer={(offerId) => createFromOfferMut.mutate({ offer_id: offerId })}
        isCreating={createFromOfferMut.isPending}
      />

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Receipt className="size-5" />
              <span className="font-mono text-base">{detail.data?.number || "Invoice"}</span>
            </SheetTitle>
            <SheetDescription>{detail.data?.subject || "Invoice details"}</SheetDescription>
          </SheetHeader>
          {detail.isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detail.data ? (
            <InvoiceDetail
              invoice={detail.data}
              partnerName={partnerName(detail.data.partner_id)}
              onMarkPaid={() => detailId && markPaidMut.mutate({ id: detailId })}
              onMarkSent={() => detailId && markSentMut.mutate({ id: detailId })}
              markingPaid={markPaidMut.isPending}
              markingSent={markSentMut.isPending}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The invoice and its line items will be permanently removed.
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

// ---- Create from Offer dialog ----
function CreateFromOfferDialog({
  open, onOpenChange, onCreateFromOffer, isCreating,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreateFromOffer: (offerId: string) => void;
  isCreating: boolean;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [searchOffer, setSearchOffer] = useState("");

  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: ["offers", tenantKey, "accepted-sent"],
    queryFn: async () => {
      const r = await fetch(api(`/api/offers?limit=100`));
      if (!r.ok) throw new Error("Failed to load offers");
      return r.json() as Promise<{ items: Offer[]; total: number }>;
    },
    enabled: open,
  });

  const acceptedOffers = useMemo(() => {
    const all = offersData?.items || [];
    return all
      .filter((o) => o.status === "accepted" || o.status === "sent")
      .filter((o) =>
        !searchOffer ||
        o.number.toLowerCase().includes(searchOffer.toLowerCase()) ||
        o.subject.toLowerCase().includes(searchOffer.toLowerCase())
      );
  }, [offersData, searchOffer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-500" />
            Create Invoice from Offer
          </DialogTitle>
          <DialogDescription>
            Select an accepted or sent offer to auto-generate an invoice with all fields pre-filled.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search offers by number or subject…"
            value={searchOffer}
            onChange={(e) => setSearchOffer(e.target.value)}
            className="pl-9"
          />
        </div>

        {offersLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : acceptedOffers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No accepted or sent offers found.</p>
            <p className="text-xs mt-1">Accept an offer first to create an invoice from it.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scroll pr-1">
            {acceptedOffers.map((offer) => (
              <Card
                key={offer.id}
                className="border-border/60 hover:border-emerald-400/50 hover:shadow-soft cursor-pointer transition-all duration-200"
                onClick={() => onCreateFromOffer(offer.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-medium">{offer.number}</span>
                        <Badge
                          variant="secondary"
                          className={
                            offer.status === "accepted"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                          }
                        >
                          {offer.status === "accepted" ? "Accepted" : "Sent"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{offer.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {offer.currency} {fmtMoney(offer.total, offer.currency)} · {offer.items?.length || 0} item(s)
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={isCreating}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
                      onClick={(e) => { e.stopPropagation(); onCreateFromOffer(offer.id); }}
                    >
                      {isCreating ? (
                        <span className="flex items-center gap-1"><span className="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Creating…</span>
                      ) : (
                        <>
                          <Zap className="size-3.5 mr-1" /> Create
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Detail panel ----
function InvoiceDetail({
  invoice, partnerName, onMarkPaid, onMarkSent, markingPaid, markingSent,
}: {
  invoice: Invoice;
  partnerName: string;
  onMarkPaid: () => void;
  onMarkSent: () => void;
  markingPaid: boolean;
  markingSent: boolean;
}) {
  const totals = computeTotals(invoice.items || []);
  const overdue = isOverdue(invoice);

  return (
    <div className="px-4 pb-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={invoice.status} />
          <span className="text-sm text-muted-foreground">{partnerName}</span>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === "draft" && (
            <Button size="sm" onClick={onMarkSent} disabled={markingSent} variant="outline" className="gap-1">
              <Send className="size-3.5" /> Mark as Sent
            </Button>
          )}
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <Button size="sm" onClick={onMarkPaid} disabled={markingPaid} className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1">
              <CheckCircle2 className="size-3.5" /> Mark as Paid
            </Button>
          )}
        </div>
      </div>

      {/* Key-value header */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="size-3" /> Issue date</p>
          <p className="text-sm font-medium">{fmtDate(invoice.issue_date)}</p>
        </div>
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" /> Due date</p>
          <p className={`text-sm font-medium ${overdue ? "text-destructive" : ""}`}>{fmtDate(invoice.due_date)}</p>
        </div>
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Send className="size-3" /> Sent</p>
          <p className="text-sm font-medium">{fmtDateTime(invoice.sent_at)}</p>
        </div>
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="size-3" /> Paid</p>
          <p className="text-sm font-medium">{fmtDateTime(invoice.paid_at)}</p>
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
            {(invoice.items || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                  No line items.
                </TableCell>
              </TableRow>
            ) : (invoice.items || []).map((it, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="font-medium">{it.product_name || "—"}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">{it.sku || "—"}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell font-mono text-xs">{it.sku || "—"}</TableCell>
                <TableCell className="text-right tabular">{fmtNumber(it.quantity)}</TableCell>
                <TableCell className="text-right tabular">{fmtMoney(it.unit_price, invoice.currency)}</TableCell>
                <TableCell className="text-right tabular hidden sm:table-cell">{it.discount}%</TableCell>
                <TableCell className="text-right tabular hidden sm:table-cell">{it.tax_rate}%</TableCell>
                <TableCell className="text-right tabular font-medium">{fmtMoney(lineTotal(it), invoice.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      <div className="ml-auto w-full sm:w-72 space-y-1 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular">{fmtMoney(invoice.subtotal ?? totals.subtotal, invoice.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span className="tabular">- {fmtMoney(invoice.discount_total ?? totals.discount_total, invoice.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="tabular">{fmtMoney(invoice.tax_total ?? totals.tax_total, invoice.currency)}</span>
        </div>
        <div className="flex justify-between border-t pt-1 mt-1 text-base font-semibold">
          <span>Total</span>
          <span className="tabular">{fmtMoney(invoice.total ?? totals.total, invoice.currency)}</span>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/40">{invoice.notes}</p>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="pt-3 border-t flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" download>
            <Download className="size-4 mr-1" /> Download PDF
          </a>
        </Button>
        {invoice.status === "draft" && (
          <Button size="sm" variant="outline" onClick={onMarkSent} disabled={markingSent} className="gap-1">
            <Send className="size-3.5" /> Mark as Sent
          </Button>
        )}
        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
          <Button size="sm" onClick={onMarkPaid} disabled={markingPaid} className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1">
            <CheckCircle2 className="size-3.5" /> Mark as Paid
          </Button>
        )}
      </div>
    </div>
  );
}

// ---- Form dialog ----
function InvoiceFormDialog({
  open, onOpenChange, invoice, partners, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  invoice: Invoice | null;
  partners: Partner[];
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [form, setForm] = useState<Partial<Invoice> & { items: OfferLineItem[]; payment_terms?: string }>({ items: [] });
  const [saving, setSaving] = useState(false);
  const [partnerContextLoading, setPartnerContextLoading] = useState(false);
  const [partnerContext, setPartnerContext] = useState<{
    partner: Partner;
    deals: any[];
    offers: Offer[];
    invoices: any[];
    proformas: any[];
  } | null>(null);

  // Collapsible section states
  const isEditing = !!invoice;
  const [lineItemsOpen, setLineItemsOpen] = useState(true);
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

  // Reset form when opening / when invoice changes
  useEffect(() => {
    if (open) {
      setPartnerContext(null);
      if (invoice) {
        setForm({
          ...invoice,
          items: (invoice.items || []).map((i) => ({ ...i })),
        });
        // When editing, expand all sections
        setLineItemsOpen(true);
        setNotesOpen(true);
      } else {
        setForm({
          currency: "EUR",
          issue_date: new Date().toISOString(),
          due_date: calculateDueDate("Net 30").toISOString(),
          notes: "",
          status: "draft",
          items: [],
          payment_terms: "Net 30",
        });
        // When creating new, line items open, notes closed
        setLineItemsOpen(true);
        setNotesOpen(false);
      }
    }
  }, [open, invoice]);

  // Fetch partner context when a partner is selected
  const fetchPartnerContext = useCallback(async (partnerId: string) => {
    if (!partnerId) return;
    setPartnerContextLoading(true);
    try {
      const r = await fetch(api(`/api/automation/partner-context?partner_id=${partnerId}`));
      if (!r.ok) throw new Error("Failed to load partner context");
      const data = await r.json();
      setPartnerContext(data);
      return data;
    } catch (e) {
      console.error("Failed to load partner context:", e);
      toast.error("Could not load partner details for auto-fill.");
      return null;
    } finally {
      setPartnerContextLoading(false);
    }
  }, []);

  // Auto-fill partner data when partner is selected
  const handlePartnerChange = useCallback(async (partnerId: string) => {
    setForm((f) => ({ ...f, partner_id: partnerId }));

    if (!partnerId) return;

    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) return;

    // Auto-fill from partner data immediately
    setForm((f) => {
      const updates: Partial<Invoice> & { items: OfferLineItem[]; payment_terms?: string } = { ...f };

      // Auto-fill currency from partner preference
      if (partner.preferred_currency && !f.currency) {
        updates.currency = partner.preferred_currency;
      }

      // Auto-fill payment terms from partner preference
      if (partner.preferred_payment_terms) {
        updates.payment_terms = partner.preferred_payment_terms;
        // Auto-calculate due date based on payment terms
        const dueDate = calculateDueDate(partner.preferred_payment_terms);
        updates.due_date = dueDate.toISOString();
      }

      return updates;
    });

    // Fetch full partner context for additional data
    const ctx = await fetchPartnerContext(partnerId);
    if (ctx?.partner) {
      const p = ctx.partner as Partner;
      setForm((f) => {
        const updates: Partial<Invoice> & { items: OfferLineItem[]; payment_terms?: string } = { ...f };

        // Fill currency if not already set
        if (p.preferred_currency && f.currency === "EUR") {
          updates.currency = p.preferred_currency;
        }

        // Fill payment terms and due date
        if (p.preferred_payment_terms && !f.payment_terms) {
          updates.payment_terms = p.preferred_payment_terms;
          const dueDate = calculateDueDate(p.preferred_payment_terms);
          updates.due_date = dueDate.toISOString();
        }

        // Append notes with partner info
        if (p.vat_number || p.bank_name || p.bank_iban) {
          const partnerInfo = [
            p.vat_number ? `VAT: ${p.vat_number}` : "",
            p.bank_name ? `Bank: ${p.bank_name}` : "",
            p.bank_iban ? `IBAN: ${p.bank_iban}` : "",
            p.bank_swift ? `SWIFT: ${p.bank_swift}` : "",
            p.bank_account ? `Account: ${p.bank_account}` : "",
          ].filter(Boolean).join(" | ");

          if (partnerInfo) {
            updates.notes = f.notes
              ? `${f.notes}\n\nPartner: ${p.name} — ${partnerInfo}`
              : `Partner: ${p.name} — ${partnerInfo}`;
          }
        }

        return updates;
      });
    }
  }, [partners, fetchPartnerContext]);

  // Auto-fill from offer when selected
  const handleOfferChange = useCallback(async (offerId: string | null) => {
    if (!offerId) {
      setForm((f) => ({ ...f, offer_id: null }));
      return;
    }

    setForm((f) => ({ ...f, offer_id: offerId }));

    // Fetch the offer data
    try {
      const r = await fetch(api(`/api/offers/${offerId}`));
      if (!r.ok) throw new Error("Failed to load offer");
      const offer: Offer = await r.json();

      setForm((f) => ({
        ...f,
        offer_id: offerId,
        partner_id: offer.partner_id,
        subject: offer.subject,
        currency: offer.currency,
        items: (offer.items || []).map((i) => ({ ...i })),
        notes: f.notes
          ? `${f.notes}\n\nAuto-filled from offer: ${offer.number}`
          : `Auto-filled from offer: ${offer.number}`,
        payment_terms: offer.terms || "Net 30",
        due_date: calculateDueDate(offer.terms || "Net 30").toISOString(),
      }));

      // Also trigger partner auto-fill for bank details
      if (offer.partner_id) {
        fetchPartnerContext(offer.partner_id);
      }

      toast.success(`Auto-filled from offer ${offer.number}`);
    } catch (e) {
      toast.error("Failed to load offer data.");
    }
  }, [fetchPartnerContext]);

  function set<K extends keyof Invoice>(k: K, v: Invoice[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // Handle payment terms change — auto-calculate due date
  function handlePaymentTermsChange(terms: string) {
    const dueDate = calculateDueDate(terms);
    setForm((f) => ({
      ...f,
      payment_terms: terms,
      due_date: dueDate.toISOString(),
    }));
  }

  function setItem(idx: number, patch: Partial<OfferLineItem>) {
    setForm((f) => {
      const items = [...(f.items || [])];
      items[idx] = { ...items[idx], ...patch };
      return { ...f, items };
    });
  }

  function selectProduct(idx: number, productId: string) {
    const p = (products.data?.items || []).find((x) => x.id === productId);
    if (!p) return;
    setItem(idx, {
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      unit: p.unit || "pcs",
      unit_price: p.price,
      hs_code: (p as any).hs_code ?? null,
      description: (p as any).description ?? null,
      detailed_spec: (p as any).detailed_spec ?? null,
      brand: (p as any).brand ?? null,
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

  // Auto-calculate totals when items change
  const totals = useMemo(() => computeTotals(form.items || []), [form.items]);

  async function save() {
    if (!form.partner_id) { toast.error("Select a partner."); return; }
    setSaving(true);
    try {
      const method = invoice ? "PUT" : "POST";
      const url = invoice ? api(`/api/invoices/${invoice.id}`) : api("/api/invoices");
      const computed = computeTotals(form.items || []);
      const body = {
        ...form,
        items: (form.items || []).map((it) => ({ ...it, total: lineTotal(it) })),
        subtotal: computed.subtotal,
        discount_total: computed.discount_total,
        tax_total: computed.tax_total,
        total: computed.total,
      };
      // Remove non-invoice fields
      delete (body as any).payment_terms;
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
      if (invoice) {
        toast.success(`Invoice ${saved.number || invoice.number} updated.`);
      } else {
        toast.success(`Invoice ${saved.number || ""} created successfully!`);
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
            {isEditing ? "Edit invoice" : "New invoice"}
            {partnerContextLoading && (
              <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the invoice details below."
              : "Fill in the essentials, then add line items. Fields auto-fill when you select a partner."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">

          {/* ── Essential section (always visible) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Partner *
                {partnerContextLoading && (
                  <span className="size-3 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
                )}
                {partnerContext && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <Sparkles className="size-3" /> Auto-filled
                  </span>
                )}
              </Label>
              <Select value={form.partner_id || ""} onValueChange={handlePartnerChange}>
                <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                <SelectContent>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={form.currency || "EUR"} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Payment Terms
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <Zap className="size-3" /> Auto-due
                </span>
              </Label>
              <Select
                value={form.payment_terms || "Net 30"}
                onValueChange={handlePaymentTermsChange}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Due date
                {form.payment_terms && form.payment_terms !== "Custom" && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">Auto from {form.payment_terms}</span>
                )}
              </Label>
              <Input
                type="date"
                value={form.due_date ? form.due_date.slice(0, 10) : ""}
                onChange={(e) => set("due_date", e.target.value ? new Date(e.target.value).toISOString() : null as unknown as string)}
              />
            </div>

            {/* Partner context info card */}
            {partnerContext?.partner && (
              <div className="md:col-span-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Partner Auto-fill</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {partnerContext.partner.vat_number && (
                    <div>
                      <span className="text-muted-foreground">VAT:</span>{" "}
                      <span className="font-medium">{partnerContext.partner.vat_number}</span>
                    </div>
                  )}
                  {partnerContext.partner.bank_name && (
                    <div>
                      <span className="text-muted-foreground">Bank:</span>{" "}
                      <span className="font-medium">{partnerContext.partner.bank_name}</span>
                    </div>
                  )}
                  {partnerContext.partner.bank_iban && (
                    <div>
                      <span className="text-muted-foreground">IBAN:</span>{" "}
                      <span className="font-mono font-medium">{partnerContext.partner.bank_iban}</span>
                    </div>
                  )}
                  {partnerContext.partner.bank_swift && (
                    <div>
                      <span className="text-muted-foreground">SWIFT:</span>{" "}
                      <span className="font-mono font-medium">{partnerContext.partner.bank_swift}</span>
                    </div>
                  )}
                  {partnerContext.partner.preferred_payment_terms && (
                    <div>
                      <span className="text-muted-foreground">Terms:</span>{" "}
                      <span className="font-medium">{partnerContext.partner.preferred_payment_terms}</span>
                    </div>
                  )}
                  {partnerContext.partner.address_line && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Address:</span>{" "}
                      <span className="font-medium">
                        {partnerContext.partner.address_line}
                        {partnerContext.partner.city ? `, ${partnerContext.partner.city}` : ""}
                        {partnerContext.partner.country ? `, ${partnerContext.partner.country}` : ""}
                      </span>
                    </div>
                  )}
                </div>
                {partnerContext.offers?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
                    <span className="text-xs text-muted-foreground">
                      {partnerContext.offers.length} previous offer(s) · {partnerContext.invoices?.length || 0} invoice(s)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Line Items section (collapsible) ── */}
          <Collapsible open={lineItemsOpen} onOpenChange={setLineItemsOpen} className="border-t pt-2 mt-1">
            <CollapsibleTrigger asChild>
              <button type="button" className="flex items-center gap-2 w-full py-2 text-sm font-medium hover:text-foreground/80 transition-colors group">
                {lineItemsOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
                <span>Line Items</span>
                {(form.items || []).length > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({(form.items || []).length} item{(form.items || []).length !== 1 ? "s" : ""} · {fmtMoney(totals.total, form.currency || "EUR")})
                  </span>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pb-2">
                {/* Linked offer + Add item row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex-1 space-y-1 w-full">
                    <Label className="flex items-center gap-1.5 text-xs">
                      Linked offer
                      <span className="text-muted-foreground">(auto-fills all fields)</span>
                    </Label>
                    <Select
                      value={form.offer_id || "__none__"}
                      onValueChange={(v) => handleOfferChange(v === "__none__" ? null : v)}
                    >
                      <SelectTrigger className="h-9"><SelectValue placeholder="No linked offer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— No offer —</SelectItem>
                        {offerList
                          .filter((o) => o.status === "accepted" || o.status === "sent")
                          .map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              <span className="flex items-center gap-1.5">
                                <span className="font-mono text-xs">{o.number}</span>
                                <span className="text-muted-foreground">· {o.subject}</span>
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                                  {o.status === "accepted" ? "✓" : "→"}
                                </Badge>
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addItem} className="mt-auto shrink-0">
                    <Plus className="size-4 mr-1" /> Add item
                  </Button>
                </div>

                {(form.items || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                    No items yet. Click &quot;Add item&quot; or select an offer to auto-fill.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll pr-1">
                    {(form.items || []).map((it, idx) => (
                      <div key={idx} className="rounded-md border p-2 grid grid-cols-12 gap-1.5 items-end">
                        <div className="col-span-12 sm:col-span-5 space-y-1">
                          <Label className="text-xs">Product</Label>
                          <Select
                            value={it.product_id || "__custom__"}
                            onValueChange={(v) => {
                              if (v === "__custom__") return;
                              selectProduct(idx, v);
                            }}
                          >
                            <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__custom__">— Manual —</SelectItem>
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
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            className="h-9"
                            value={it.unit_price}
                            onChange={(e) => setItem(idx, { unit_price: Number(e.target.value) })}
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-xs">Disc%</Label>
                          <Input
                            type="number"
                            className="h-9"
                            value={it.discount}
                            onChange={(e) => setItem(idx, { discount: Number(e.target.value) })}
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-xs">VAT%</Label>
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
                {(form.items || []).length > 0 && (
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
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* ── Notes section (collapsible) ── */}
          <Collapsible open={notesOpen} onOpenChange={setNotesOpen} className="border-t pt-2 mt-1">
            <CollapsibleTrigger asChild>
              <button type="button" className="flex items-center gap-2 w-full py-2 text-sm font-medium hover:text-foreground/80 transition-colors group">
                {notesOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
                <span>Notes</span>
                {form.notes && (
                  <span className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">
                    — {form.notes.slice(0, 40)}{form.notes.length > 40 ? "…" : ""}
                  </span>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pb-2 space-y-1.5">
                <Textarea
                  rows={3}
                  value={form.notes || ""}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Payment instructions, special conditions, etc."
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* ── More details (collapsible, only for edit) ── */}
          {isEditing && (
            <Collapsible defaultOpen className="border-t pt-2 mt-1">
              <CollapsibleTrigger asChild>
                <button type="button" className="flex items-center gap-2 w-full py-2 text-sm font-medium hover:text-foreground/80 transition-colors group">
                  <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>More Details</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Subject</Label>
                    <Input
                      value={form.subject || ""}
                      onChange={(e) => set("subject", e.target.value)}
                      placeholder="Invoice for equipment supply 2026"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Issue date</Label>
                    <Input
                      type="date"
                      value={form.issue_date ? form.issue_date.slice(0, 10) : ""}
                      onChange={(e) => set("issue_date", e.target.value ? new Date(e.target.value).toISOString() : null as unknown as string)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={form.status || "draft"} onValueChange={(v) => set("status", v as InvoiceStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INVOICE_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : isEditing ? "Save changes" : "Create invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useNewShortcut } from "@/lib/hooks/use-new-shortcut";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PortAutocomplete } from "@/components/ui/port-autocomplete";
import { TradeAdvisor } from "@/components/common/trade-advisor";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Plus, Search, FileText, Pencil, Trash2, Eye, ChevronDown, ChevronRight, X, Calendar, Send, CheckCircle2, XCircle, Clock, Download, Loader2, Sparkles, Building2, Receipt, FileSpreadsheet, ArrowRight, Info, Landmark, MapPin, Hash, Globe, CreditCard, Handshake, Package, Ship, Container, Banknote, FileCheck, Timer, History, GitBranch, Save,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtMoney, fmtDate, fmtDateTime, fmtNumber } from "@/lib/utils/format";
import { Offer, OfferLineItem, OfferStatus, Partner, Product, Deal, DocumentRevision } from "@/lib/supabase/types";
import { CURRENCIES, OFFER_STATUSES, PAYMENT_TERMS_LOCAL } from "@/lib/data/reference";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<OfferStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

function StatusBadge({ status }: { status: OfferStatus }) {
  if (status === "draft") return <Badge variant="secondary">{STATUS_LABELS[status]}</Badge>;
  if (status === "rejected") return <Badge variant="destructive">{STATUS_LABELS[status]}</Badge>;
  if (status === "accepted") return <Badge className="border-transparent bg-emerald-600 text-white">{STATUS_LABELS[status]}</Badge>;
  if (status === "sent") return <Badge className="border-transparent bg-primary text-primary-foreground">{STATUS_LABELS[status]}</Badge>;
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

// ─── Partner context type ───
interface PartnerContext {
  partner: Partner;
  deals: Deal[];
  offers: Offer[];
  invoices: any[];
  proformas: any[];
  productCatalog: any[];
  supplierOffers: any[];
  portalAccess: any;
  kyc: { status: string; submitted_at: string; reviewed_at: string; review_notes: string } | null;
  tradeCalculations: any[];
  inventoryMovements: any[];
}

// ─── Product context type ───
interface ProductContext {
  product: Product;
  catalogEntry: any;
  supplierOffers: any[];
  tradeCalculations: any[];
  inventoryStatus: { stock: number; reorder_level: number; low_stock: boolean; unit: string } | null;
  priceHistory: Array<{ date: string; source: string; source_number: string; unit_price: number; currency: string; quantity: number }>;
}

// ─── Helper: 30 days from today ───
function thirtyDaysFromNow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

export function OffersView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Offer | null>(null);
  const [showForm, setShowForm] = useState(false);
  useNewShortcut(() => { setEditing(null); setShowForm(true); });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDealPicker, setShowDealPicker] = useState(false);
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["offers", tenantKey, search, statusFilter, partnerFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (partnerFilter !== "all") params.set("partner_id", partnerFilter);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(page * PAGE_SIZE));
      const r = await fetch(api(`/api/offers?${params}`));
      if (!r.ok) throw new Error("Failed to load offers");
      return r.json() as Promise<{ items: Offer[]; total: number }>;
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
    queryKey: ["offer", tenantKey, detailId],
    queryFn: async () => {
      const r = await fetch(api(`/api/offers/${detailId}`));
      if (!r.ok) throw new Error("Failed to load offer");
      return r.json() as Promise<Offer>;
    },
    enabled: !!detailId,
  });

  const statusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OfferStatus }) => {
      const r = await fetch(api(`/api/offers/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error("Status change failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Status updated.");
      qc.invalidateQueries({ queryKey: ["offers", tenantKey] });
      if (detailId) qc.invalidateQueries({ queryKey: ["offer", tenantKey, detailId] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
    },
    onError: () => toast.error("Status change failed."),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/offers/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Offer deleted.");
      qc.invalidateQueries({ queryKey: ["offers", tenantKey] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  // ─── Create Offer from Deal ───
  const createFromDealMut = useMutation({
    mutationFn: async (deal_id: string) => {
      const r = await fetch(api("/api/automation/create-offer-from-deal"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create offer from deal");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Offer created from deal successfully!");
      qc.invalidateQueries({ queryKey: ["offers", tenantKey] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
      setShowDealPicker(false);
    },
    onError: (e: any) => toast.error(e.message || "Failed to create offer from deal."),
  });

  // ─── Create Invoice from Offer ───
  const createInvoiceMut = useMutation({
    mutationFn: async (offer_id: string) => {
      const r = await fetch(api("/api/automation/create-invoice-from-offer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create invoice");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Invoice created from offer!");
      qc.invalidateQueries({ queryKey: ["offers", tenantKey] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to create invoice."),
  });

  // ─── Create Proforma from Offer ───
  const createProformaMut = useMutation({
    mutationFn: async (offer_id: string) => {
      const r = await fetch(api("/api/automation/create-proforma-from-offer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create proforma");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Proforma created from offer!");
      qc.invalidateQueries({ queryKey: ["offers", tenantKey] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to create proforma."),
  });

  const items = data?.items || [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const partnerList = partners.data?.items || [];
  const partnerName = (id: string) => partnerList.find((p) => p.id === id)?.name || "—";

  return (
    <div>
      <PageHeader
        title="Offers"
        description={`${total} total`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.open("/api/offers/export?format=csv", "_blank")}>
              <Download className="size-4 mr-1" /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => setShowDealPicker(true)}>
              <Handshake className="size-4 mr-1" /> From Deal
            </Button>
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="size-4 mr-1" /> New offer
            </Button>
          </div>
        }
      />

      <Card className="mb-4 border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by number, subject…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={partnerFilter} onValueChange={(v) => { setPartnerFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Partner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All partners</SelectItem>
              {partnerList.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} <span className="text-muted-foreground ml-1 text-xs">({p.type})</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-6" />}
              title="No offers"
              description="Create your first offer to get started."
              action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New offer</Button>}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead className="hidden md:table-cell">Subject</TableHead>
                      <TableHead className="hidden lg:table-cell">Partner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="hidden xl:table-cell">Valid Until</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((o) => (
                      <TableRow
                        key={o.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setDetailId(o.id)}
                      >
                        <TableCell className="font-mono text-xs tabular">{o.number}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="font-medium truncate max-w-[200px]">{o.subject || "—"}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{partnerName(o.partner_id)}</TableCell>
                        <TableCell><StatusBadge status={o.status} /></TableCell>
                        <TableCell className="text-right font-mono tabular">{fmtMoney(o.total, o.currency)}</TableCell>
                        <TableCell className="hidden xl:table-cell">{fmtDate(o.valid_until)}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="size-8" onClick={() => setDetailId(o.id)} title="View">
                              <Eye className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditing(o); setShowForm(true); }} title="Edit">
                              <Pencil className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(o.id)} title="Delete">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/60">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>
                    <span className="text-sm px-2 tabular-nums">{page + 1} / {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form dialog */}
      <OfferFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        offer={editing}
        partners={partnerList}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["offers", tenantKey] });
          qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
        }}
      />

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              <span className="font-mono text-base">{detail.data?.number || "Offer"}</span>
            </SheetTitle>
            <SheetDescription>{detail.data?.subject || "Offer details"}</SheetDescription>
          </SheetHeader>
          {detail.isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detail.data ? (
            <OfferDetail
              offer={detail.data}
              partnerName={partnerName(detail.data.partner_id)}
              onStatusChange={(status) => detailId && statusMut.mutate({ id: detailId, status })}
              onCreateInvoice={() => detailId && createInvoiceMut.mutate(detailId)}
              onCreateProforma={() => detailId && createProformaMut.mutate(detailId)}
              isCreatingInvoice={createInvoiceMut.isPending}
              isCreatingProforma={createProformaMut.isPending}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The offer and its line items will be permanently deleted.
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

      {/* Create Offer from Deal dialog */}
      <DealPickerDialog
        open={showDealPicker}
        onOpenChange={setShowDealPicker}
        onSelect={(dealId) => createFromDealMut.mutate(dealId)}
        isCreating={createFromDealMut.isPending}
      />
    </div>
  );
}

// ─── Deal Picker Dialog ───
function DealPickerDialog({
  open, onOpenChange, onSelect, isCreating,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSelect: (dealId: string) => void;
  isCreating: boolean;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [dealSearch, setDealSearch] = useState("");

  const deals = useQuery({
    queryKey: ["deals", tenantKey, "list", "100"],
    queryFn: async () => {
      const r = await fetch(api(`/api/deals?limit=100`));
      if (!r.ok) throw new Error("Failed to load deals");
      return r.json() as Promise<{ items: Deal[]; total: number }>;
    },
    enabled: open,
  });

  const dealList = deals.data?.items || [];
  const filtered = dealSearch
    ? dealList.filter((d) =>
        d.title.toLowerCase().includes(dealSearch.toLowerCase()) ||
        d.stage.toLowerCase().includes(dealSearch.toLowerCase())
      )
    : dealList;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            Create Offer from Deal
          </DialogTitle>
          <DialogDescription>Select a deal to automatically create an offer with all partner and product data pre-filled.</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search deals…"
              value={dealSearch}
              onChange={(e) => setDealSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {deals.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No deals found.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto custom-scroll space-y-2">
              {filtered.map((d) => (
                <button
                  key={d.id}
                  className="w-full text-left rounded-lg border border-border/60 p-3 hover:bg-muted/50 transition-colors flex items-center gap-3"
                  onClick={() => onSelect(d.id)}
                  disabled={isCreating}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{d.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{d.stage}</Badge>
                      <span className="text-xs text-muted-foreground">{fmtMoney(d.value, d.currency)}</span>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Detail panel ───
function OfferDetail({
  offer, partnerName, onStatusChange, onCreateInvoice, onCreateProforma, isCreatingInvoice, isCreatingProforma,
}: {
  offer: Offer;
  partnerName: string;
  onStatusChange: (s: OfferStatus) => void;
  onCreateInvoice: () => void;
  onCreateProforma: () => void;
  isCreatingInvoice: boolean;
  isCreatingProforma: boolean;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const statuses: OfferStatus[] = ["draft", "sent", "accepted", "rejected", "expired"];
  const totals = computeTotals(offer.items || []);

  // ─── Version / Revision tracking ───
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [savingVersion, setSavingVersion] = useState(false);

  const revisions = useQuery({
    queryKey: ["document-revisions", tenantKey, offer.id],
    queryFn: async () => {
      try {
        // /api/document-register/[id] expects the register-entry id, not the
        // offer id, so we list-and-filter by reference_id instead.
        const r = await fetch(api(`/api/document-register?type=offer`));
        if (!r.ok) return [];
        const data = await r.json();
        return ((data.items || []) as any[])
          .filter((e) => e.reference_id === offer.id && e.type === "offer")
          .sort((a, b) => (b.version || 0) - (a.version || 0)) as DocumentRevision[];
      } catch {
        return [];
      }
    },
    enabled: !!offer.id,
  });

  const revisionList = revisions.data || [];

  async function handleSaveVersion() {
    if (!changeNote.trim()) {
      toast.error("Please enter a change note.");
      return;
    }
    setSavingVersion(true);
    try {
      // 1. Find existing register entries for THIS offer only.
      // /api/document-register ignores reference_id/type params and returns
      // every entry in the tenant — filter client-side so we don't touch
      // unrelated documents.
      const regRes = await fetch(api(`/api/document-register?type=offer`));
      const regData = await regRes.json().catch(() => ({ items: [] }));
      const existingEntries = (regData.items || []).filter(
        (e: any) => e.reference_id === offer.id && e.type === "offer",
      );
      const maxVersion = existingEntries.reduce((max: number, e: any) => Math.max(max, e.version || 0), 0);
      const nextVersion = maxVersion + 1;

      // 2. Mark previous entries as superseded — scoped strictly to this offer.
      for (const entry of existingEntries) {
        if (entry.status === "current") {
          await fetch(api(`/api/document-register`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...entry, status: "superseded" }),
          });
        }
      }

      // 3. Create new document register entry
      const registerEntry = {
        number: `${offer.number || "OF"}-V${nextVersion}`,
        type: "offer",
        version: nextVersion,
        reference_id: offer.id,
        partner_id: offer.partner_id,
        title: offer.subject || `Offer ${offer.number}`,
        status: "current",
        metadata: {
          total: offer.total,
          currency: offer.currency,
          status: offer.status,
          items_count: offer.items?.length || 0,
        },
      };
      const regRes2 = await fetch(api(`/api/document-register`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerEntry),
      });
      if (!regRes2.ok) {
        const e = await regRes2.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create document register entry");
      }
      const regEntry = await regRes2.json();

      // 4. Create revision record
      const revRes = await fetch(api(`/api/document-revisions`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: regEntry.id,
          version: nextVersion,
          change_note: changeNote.trim(),
        }),
      });
      if (!revRes.ok) {
        const e = await revRes.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create revision");
      }

      toast.success("Version saved!", { description: `Version ${nextVersion} saved successfully.` });
      setChangeNote("");
      setShowVersionDialog(false);
      qc.invalidateQueries({ queryKey: ["document-revisions", tenantKey, offer.id] });
    } catch (e: any) {
      toast.error(e.message || "Failed to save version.");
    } finally {
      setSavingVersion(false);
    }
  }

  // Check if any trade fields have data
  const hasTradeData = !!(offer.offer_no || offer.bank_details || offer.pol || offer.pod || offer.vessel || offer.container_no || offer.lead_time || offer.packaging || offer.payment_terms || offer.tax_clause || offer.incoterm || offer.selling_price);

  return (
    <div className="px-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={offer.status} />
          <span className="text-sm text-muted-foreground">{partnerName}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Change status <ChevronDown className="size-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statuses.map((s) => (
              <DropdownMenuItem
                key={s}
                disabled={s === offer.status}
                onClick={() => onStatusChange(s)}
              >
                {STATUS_LABELS[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionDialog(true)}
            >
              <Save className="size-4 mr-1" /> Save Version
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save a new version of this offer with a change note</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateInvoice}
              disabled={isCreatingInvoice || (offer.status !== "accepted" && offer.status !== "sent")}
            >
              {isCreatingInvoice ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Receipt className="size-4 mr-1" />}
              Create Invoice
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {offer.status !== "accepted" && offer.status !== "sent"
              ? "Offer must be accepted or sent to create an invoice"
              : "Auto-create an invoice from this offer"}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateProforma}
              disabled={isCreatingProforma}
            >
              {isCreatingProforma ? <Loader2 className="size-4 mr-1 animate-spin" /> : <FileSpreadsheet className="size-4 mr-1" />}
              Create Proforma
            </Button>
          </TooltipTrigger>
          <TooltipContent>Auto-create a proforma invoice from this offer</TooltipContent>
        </Tooltip>
      </div>

      {/* Key dates */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="size-3" /> Valid until</p>
          <p className="text-sm font-medium">{fmtDate(offer.valid_until)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Send className="size-3" /> Sent</p>
          <p className="text-sm font-medium">{fmtDateTime(offer.sent_at)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="size-3" /> Responded</p>
          <p className="text-sm font-medium">{fmtDateTime(offer.responded_at)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" /> Created</p>
          <p className="text-sm font-medium">{fmtDate(offer.created_at)}</p>
        </div>
      </div>

      {/* Trade / Import Details */}
      {hasTradeData && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Ship className="size-4" /> Trade Details
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {offer.offer_no && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="size-3" /> Supplier Ref</p>
                <p className="text-sm font-medium">{offer.offer_no}</p>
              </div>
            )}
            {offer.incoterm && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="size-3" /> Incoterm</p>
                <p className="text-sm font-medium">{offer.incoterm}</p>
              </div>
            )}
            {offer.payment_terms && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="size-3" /> Payment Terms</p>
                <p className="text-sm font-medium">{offer.payment_terms}</p>
              </div>
            )}
            {offer.pol && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" /> Port of Loading</p>
                <p className="text-sm font-medium">{offer.pol}</p>
              </div>
            )}
            {offer.pod && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" /> Port of Discharge</p>
                <p className="text-sm font-medium">{offer.pod}</p>
              </div>
            )}
            {offer.vessel && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Ship className="size-3" /> Vessel</p>
                <p className="text-sm font-medium">{offer.vessel}</p>
              </div>
            )}
            {offer.container_no && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Container className="size-3" /> Container No.</p>
                <p className="text-sm font-medium">{offer.container_no}</p>
              </div>
            )}
            {offer.lead_time && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Timer className="size-3" /> Lead Time</p>
                <p className="text-sm font-medium">{offer.lead_time}</p>
              </div>
            )}
            {offer.packaging && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Package className="size-3" /> Packaging</p>
                <p className="text-sm font-medium">{offer.packaging}</p>
              </div>
            )}
            {offer.bank_details && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Banknote className="size-3" /> Bank Details</p>
                <p className="text-sm font-medium whitespace-pre-wrap">{offer.bank_details}</p>
              </div>
            )}
            {offer.tax_clause && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><FileCheck className="size-3" /> Tax Clause</p>
                <p className="text-sm font-medium">{offer.tax_clause}</p>
              </div>
            )}
            {offer.selling_price != null && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Landmark className="size-3" /> Selling Price</p>
                <p className="text-sm font-medium">{fmtMoney(offer.selling_price, offer.currency)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Line items */}
      <div className="rounded-lg border border-border/60 overflow-hidden mb-4">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="hidden sm:table-cell">Unit</TableHead>
              <TableHead className="text-right">Unit price</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Discount %</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Tax %</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(offer.items || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                  No line items.
                </TableCell>
              </TableRow>
            ) : (offer.items || []).map((it, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="font-medium">{it.product_name || "—"}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">{it.sku || "—"}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell font-mono text-xs tabular">{it.sku || "—"}</TableCell>
                <TableCell className="text-right font-mono tabular">{fmtNumber(it.quantity)}</TableCell>
                <TableCell className="hidden sm:table-cell">{it.unit || "—"}</TableCell>
                <TableCell className="text-right font-mono tabular">{fmtMoney(it.unit_price, offer.currency)}</TableCell>
                <TableCell className="text-right font-mono tabular hidden sm:table-cell">{it.discount}%</TableCell>
                <TableCell className="text-right font-mono tabular hidden sm:table-cell">{it.tax_rate}%</TableCell>
                <TableCell className="text-right font-mono tabular font-medium">{fmtMoney(lineTotal(it), offer.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      <div className="ml-auto w-full sm:w-72 space-y-1 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono tabular">{fmtMoney(offer.subtotal ?? totals.subtotal, offer.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-mono tabular">- {fmtMoney(offer.discount_total ?? totals.discount_total, offer.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-mono tabular">{fmtMoney(offer.tax_total ?? totals.tax_total, offer.currency)}</span>
        </div>
        <div className="flex justify-between border-t pt-1 mt-1 text-base font-semibold">
          <span>Total</span>
          <span className="font-mono tabular">{fmtMoney(offer.total ?? totals.total, offer.currency)}</span>
        </div>
      </div>

      {offer.notes && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/40">{offer.notes}</p>
        </div>
      )}
      {offer.terms && typeof offer.terms === "string" && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Terms</p>
          <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/40">{offer.terms}</p>
        </div>
      )}

      {/* Download PDF */}
      <div className="pt-3 border-t">
        <Button asChild variant="outline" size="sm">
          <a href={`/api/offers/${offer.id}/pdf`} target="_blank" download>
            <Download className="size-4 mr-1" /> Download PDF
          </a>
        </Button>
      </div>

      {/* Version History */}
      <div className="pt-4 mt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <History className="size-4" /> Version History
          </h4>
          <Button variant="outline" size="sm" onClick={() => setShowVersionDialog(true)}>
            <GitBranch className="size-4 mr-1" /> Save New Version
          </Button>
        </div>

        {revisions.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : revisionList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
            <GitBranch className="size-6 text-muted-foreground/40 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">No versions saved yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">Click &ldquo;Save New Version&rdquo; to create the first version</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-20">Version</TableHead>
                  <TableHead>Change Note</TableHead>
                  <TableHead className="hidden sm:table-cell w-32">Author</TableHead>
                  <TableHead className="w-36">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revisionList.map((rev, i) => (
                  <TableRow key={rev.id || i}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">V{rev.version}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{rev.change_note || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{rev.created_by || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">{fmtDateTime(rev.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Save Version Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="size-5" /> Save New Version
            </DialogTitle>
            <DialogDescription>
              Save a snapshot of this offer as a new version. Previous versions will be marked as superseded.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Change Note *</Label>
              <Textarea
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="Describe what changed in this version…"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                A brief description of the changes made, e.g. &ldquo;Updated pricing for Q3&rdquo; or &ldquo;Added shipping details&rdquo;.
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-sm">Offer Summary</p>
              <div className="flex justify-between">
                <span>Number</span>
                <span className="font-mono">{offer.number}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span>{offer.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-mono">{fmtMoney(offer.total, offer.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Items</span>
                <span>{offer.items?.length || 0}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionDialog(false)} disabled={savingVersion}>Cancel</Button>
            <Button onClick={handleSaveVersion} disabled={savingVersion || !changeNote.trim()}>
              {savingVersion ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="size-4 mr-1" /> Save Version
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Form dialog ───
function OfferFormDialog({
  open, onOpenChange, offer, partners, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  offer: Offer | null;
  partners: Partner[];
  onSaved: (offerNumber?: string) => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const isEditing = !!offer;

  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);
  const [form, setForm] = useState<Partial<Offer> & { items: OfferLineItem[] }>({ items: [] });
  const [saving, setSaving] = useState(false);
  const [partnerContext, setPartnerContext] = useState<PartnerContext | null>(null);
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [productContextMap, setProductContextMap] = useState<Record<string, ProductContext>>({});
  const [loadingProductIdx, setLoadingProductIdx] = useState<number | null>(null);

  const deals = useQuery({
    queryKey: ["deals", tenantKey, "list", "100"],
    queryFn: async () => {
      const r = await fetch(api(`/api/deals?limit=100`));
      if (!r.ok) throw new Error("Failed to load deals");
      return r.json() as Promise<{ items: Deal[]; total: number }>;
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

  // ─── Fix: useMemo → useEffect for form initialization ───
  useEffect(() => {
    if (open) {
      if (offer) {
        setForm({
          ...offer,
          items: (offer.items || []).map((i) => ({ ...i })),
        });
        setMoreDetailsOpen(true);
      } else {
        setForm({
          status: "draft",
          currency: "USD",
          payment_terms: "net30",
          valid_until: thirtyDaysFromNow(),
          notes: "",
          terms: "",
          items: [],
        });
        setMoreDetailsOpen(false);
      }
      setPartnerContext(null);
      setProductContextMap({});
    }
  }, [open, offer]);

  function set<K extends keyof Offer>(k: K, v: Offer[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setItem(idx: number, patch: Partial<OfferLineItem>) {
    setForm((f) => {
      const items = [...(f.items || [])];
      items[idx] = { ...items[idx], ...patch };
      return { ...f, items };
    });
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

      const p = ctx.partner;
      setForm((f) => ({
        ...f,
        partner_id: partnerId,
        currency: p.preferred_currency || f.currency || "USD",
        terms: p.preferred_payment_terms || f.terms || "",
      }));

      toast.success(`Partner data loaded: ${p.name}`, { description: "Currency, terms & preferences auto-filled." });
    } catch {
      toast.error("Failed to load partner context.");
      setPartnerContext(null);
    } finally {
      setLoadingPartner(false);
    }
  }, []);

  // ─── Product auto-fill ───
  const selectProduct = useCallback(async (idx: number, productId: string) => {
    const p = (products.data?.items || []).find((x) => x.id === productId);
    if (!p) return;

    setItem(idx, {
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      unit_price: p.price,
      unit: p.unit || "pcs",
      hs_code: (p as any).hs_code ?? null,
      description: (p as any).description ?? null,
      detailed_spec: (p as any).detailed_spec ?? null,
      brand: (p as any).brand ?? null,
    });

    setLoadingProductIdx(idx);
    try {
      const r = await fetch(api(`/api/automation/product-context?product_id=${productId}`));
      if (!r.ok) throw new Error("Failed to load product context");
      const ctx: ProductContext = await r.json();
      setProductContextMap((prev) => ({ ...prev, [idx]: ctx }));

      // If a matching catalog spec-sheet entry was found, prefer its richer
      // metadata (HS code, specifications, origin) on the line item.
      const ce = ctx.catalogEntry;
      if (ce) {
        setItem(idx, {
          hs_code: ce.hs_code ?? (p as any).hs_code ?? null,
          detailed_spec: ce.detailed_spec ?? (p as any).detailed_spec ?? null,
          specifications: ce.specifications ?? null,
          origin_country: ce.origin_country ?? null,
          brand: ce.brand ?? (p as any).brand ?? null,
          description: ce.description ?? (p as any).description ?? null,
        });
        if (ce.price) setItem(idx, { unit_price: ce.price });
      }

      toast.success(`Product loaded: ${p.name}`, { description: `Price: ${fmtMoney(p.price, p.currency)} | SKU: ${p.sku}` });
    } catch {
      // Context is optional — basic info already filled
    } finally {
      setLoadingProductIdx(null);
    }
  }, [products.data]);

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
    setProductContextMap((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  }

  const totals = computeTotals(form.items || []);

  async function save() {
    if (!form.partner_id) { toast.error("Select a partner."); return; }
    setSaving(true);
    try {
      const method = offer ? "PUT" : "POST";
      const url = offer ? api(`/api/offers/${offer.id}`) : api("/api/offers");
      const body = {
        ...form,
        status: form.status || "draft",
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
        throw new Error(e.error || "Request failed");
      }
      const result = await r.json().catch(() => ({}));
      const offerNumber = result.number || result.id || "";
      if (offer) {
        toast.success("Offer updated.", { description: offerNumber ? `Reference: ${offerNumber}` : undefined });
      } else {
        toast.success("Offer created!", { description: offerNumber ? `Reference: ${offerNumber}` : "Your new offer has been saved as draft." });
      }
      onSaved(offerNumber);
    } catch (e: any) {
      toast.error(e.message || "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  const dealList = deals.data?.items || [];
  const productList = products.data?.items || [];
  const selectedPartner = partnerContext?.partner || partners.find((p) => p.id === form.partner_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {offer ? "Edit offer" : "New offer"}
            <Sparkles className="size-4 text-amber-500" />
          </DialogTitle>
          <DialogDescription>
            {offer
              ? "Update the offer details below."
              : "Fill in the essentials, add your line items, and you're done."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-4 py-2">

          {/* ─── Essential Section (always visible) ─── */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Partner select */}
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
                  <SelectTrigger><SelectValue placeholder="Select a partner" /></SelectTrigger>
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
                <Select value={form.currency || "USD"} onValueChange={(v) => set("currency", v)}>
                  <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
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
                  {selectedPartner.bank_name && (
                    <div className="flex items-center gap-1.5">
                      <Landmark className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{selectedPartner.bank_name}{selectedPartner.bank_iban ? ` · ${selectedPartner.bank_iban}` : ""}</span>
                    </div>
                  )}
                  {selectedPartner.preferred_currency && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Currency: {selectedPartner.preferred_currency}</span>
                    </div>
                  )}
                  {selectedPartner.preferred_incoterm && (
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Incoterm: {selectedPartner.preferred_incoterm}</span>
                    </div>
                  )}
                  {selectedPartner.preferred_payment_terms && (
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Terms: {selectedPartner.preferred_payment_terms}</span>
                    </div>
                  )}
                </div>

                {/* Recent activity */}
                {(partnerContext.deals?.length > 0 || partnerContext.offers?.length > 0 || partnerContext.invoices?.length > 0) && (
                  <div className="mt-3 pt-2 border-t border-amber-500/10">
                    <Tabs defaultValue="offers" className="w-full">
                      <TabsList className="h-7">
                        <TabsTrigger value="offers" className="text-xs h-5 px-2">
                          Offers ({partnerContext.offers?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="deals" className="text-xs h-5 px-2">
                          Deals ({partnerContext.deals?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="invoices" className="text-xs h-5 px-2">
                          Invoices ({partnerContext.invoices?.length || 0})
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="offers" className="mt-1">
                        <div className="max-h-24 overflow-y-auto custom-scroll">
                          {(partnerContext.offers || []).slice(0, 5).map((o: Offer) => (
                            <div key={o.id} className="flex items-center justify-between text-xs py-0.5">
                              <span className="font-mono">{o.number}</span>
                              <span className="text-muted-foreground truncate max-w-[120px]">{o.subject}</span>
                              <span className="font-mono">{fmtMoney(o.total, o.currency)}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="deals" className="mt-1">
                        <div className="max-h-24 overflow-y-auto custom-scroll">
                          {(partnerContext.deals || []).slice(0, 5).map((d: Deal) => (
                            <div key={d.id} className="flex items-center justify-between text-xs py-0.5">
                              <span className="truncate max-w-[140px]">{d.title}</span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1">{d.stage}</Badge>
                              <span className="font-mono">{fmtMoney(d.value, d.currency)}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="invoices" className="mt-1">
                        <div className="max-h-24 overflow-y-auto custom-scroll">
                          {(partnerContext.invoices || []).slice(0, 5).map((inv: any) => (
                            <div key={inv.id} className="flex items-center justify-between text-xs py-0.5">
                              <span className="font-mono">{inv.number}</span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1">{inv.status}</Badge>
                              <span className="font-mono">{fmtMoney(inv.total, inv.currency)}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            )}

            {/* Valid Until + Payment Terms row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valid until</Label>
                <Input
                  type="date"
                  value={form.valid_until ? form.valid_until.slice(0, 10) : ""}
                  onChange={(e) => set("valid_until", e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Payment Terms</Label>
                <Select value={form.payment_terms || "net30"} onValueChange={(v) => set("payment_terms", v)}>
                  <SelectTrigger><SelectValue placeholder="Select payment terms" /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS_LOCAL.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ─── Line Items Section (inline table) ─── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">Line Items</span>
                <Sparkles className="size-3.5 text-amber-500" />
                <span className="text-xs text-muted-foreground">Auto-fill enabled</span>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addItem}>
                <Plus className="size-4 mr-1" /> Add item
              </Button>
            </div>

            {(form.items || []).length === 0 ? (
              <div className="border rounded-md border-dashed border-border/60 p-6 text-center">
                <Package className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No line items yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click &ldquo;Add item&rdquo; to add products or services</p>
              </div>
            ) : (
              <div className="rounded-md border border-border/60 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="min-w-[180px]">Product</TableHead>
                      <TableHead className="w-20 text-right">Qty</TableHead>
                      <TableHead className="w-20">Unit</TableHead>
                      <TableHead className="w-28 text-right">Unit Price</TableHead>
                      <TableHead className="w-16 text-right hidden sm:table-cell">Disc%</TableHead>
                      <TableHead className="w-16 text-right hidden sm:table-cell">Tax%</TableHead>
                      <TableHead className="w-28 text-right">Line Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(form.items || []).map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="space-y-1">
                            <Select
                              value={it.product_id || "__custom__"}
                              onValueChange={(v) => {
                                if (v === "__custom__") return;
                                selectProduct(idx, v);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__custom__">— Manual —</SelectItem>
                                {productList.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{p.name}</span>
                                      <span className="text-xs text-muted-foreground font-mono">{p.sku}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              className="h-7 text-xs"
                              placeholder="Product name"
                              value={it.product_name || ""}
                              onChange={(e) => setItem(idx, { product_name: e.target.value })}
                            />
                            {(it as any).hs_code || (it as any).brand || productContextMap[idx] ? (
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                                {(it as any).hs_code && (
                                  <span className="font-mono px-1.5 py-0.5 rounded bg-muted">HS {(it as any).hs_code}</span>
                                )}
                                {(it as any).brand && (
                                  <span>{(it as any).brand}</span>
                                )}
                                {productContextMap[idx]?.inventoryStatus && (
                                  <span className="flex items-center gap-0.5">
                                    <Package className="size-2.5" />
                                    Stock: {productContextMap[idx].inventoryStatus!.stock}
                                  </span>
                                )}
                                {productContextMap[idx]?.priceHistory && productContextMap[idx].priceHistory.length > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    <Info className="size-2.5" />
                                    Last: {fmtMoney(productContextMap[idx].priceHistory[0].unit_price, productContextMap[idx].priceHistory[0].currency)}
                                  </span>
                                )}
                              </div>
                            ) : null}
                            {loadingProductIdx === idx && (
                              <Loader2 className="size-3 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            className="h-8 text-xs w-16 text-right"
                            value={it.quantity}
                            onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-8 text-xs w-16"
                            value={it.unit || "pcs"}
                            onChange={(e) => setItem(idx, { unit: e.target.value })}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            className="h-8 text-xs w-24 text-right"
                            value={it.unit_price}
                            onChange={(e) => setItem(idx, { unit_price: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          <Input
                            type="number"
                            className="h-8 text-xs w-14 text-right"
                            value={it.discount}
                            onChange={(e) => setItem(idx, { discount: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          <Input
                            type="number"
                            className="h-8 text-xs w-14 text-right"
                            value={it.tax_rate}
                            onChange={(e) => setItem(idx, { tax_rate: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono tabular text-sm">
                          {fmtMoney(lineTotal(it), form.currency || "USD")}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 text-destructive"
                            onClick={() => removeItem(idx)}
                            title="Remove"
                          >
                            <X className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Auto-calculated totals */}
            {(form.items || []).length > 0 && (
              <div className="ml-auto w-full sm:w-72 space-y-1 text-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="size-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Auto-calculated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono tabular">{fmtMoney(totals.subtotal, form.currency || "USD")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-mono tabular">- {fmtMoney(totals.discount_total, form.currency || "USD")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-mono tabular">{fmtMoney(totals.tax_total, form.currency || "USD")}</span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1 text-base font-semibold">
                  <span>Total</span>
                  <span className="font-mono tabular">{fmtMoney(totals.total, form.currency || "USD")}</span>
                </div>
              </div>
            )}
          </div>

          {/* ─── More Details Section (collapsible) ─── */}
          <Collapsible open={moreDetailsOpen} onOpenChange={setMoreDetailsOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 w-full rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
              >
                {moreDetailsOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-medium">More Details</span>
                <span className="text-xs text-muted-foreground">Subject, deal, incoterm, shipping, bank, notes…</span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-3 space-y-4">
                {/* Subject + Deal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Subject</Label>
                    <Input
                      value={form.subject || ""}
                      onChange={(e) => set("subject", e.target.value)}
                      placeholder="Equipment supply 2026"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Linked Deal</Label>
                    <Select
                      value={form.deal_id || "__none__"}
                      onValueChange={(v) => set("deal_id", v === "__none__" ? null : v)}
                    >
                      <SelectTrigger><SelectValue placeholder="No deal" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— No deal —</SelectItem>
                        {dealList.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Trade fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Supplier Ref (offer_no)</Label>
                    <Input value={form.offer_no || ""} onChange={(e) => set("offer_no", e.target.value)} placeholder="SUP-2026-001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Incoterm</Label>
                    <Select value={form.incoterm || "__none__"} onValueChange={(v) => set("incoterm", v === "__none__" ? null : v)}>
                      <SelectTrigger><SelectValue placeholder="Select incoterm" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— None —</SelectItem>
                        <SelectItem value="EXW">EXW</SelectItem>
                        <SelectItem value="FOB">FOB</SelectItem>
                        <SelectItem value="CIF">CIF</SelectItem>
                        <SelectItem value="CFR">CFR</SelectItem>
                        <SelectItem value="DDP">DDP</SelectItem>
                        <SelectItem value="DAP">DAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Selling Price</Label>
                    <Input type="number" value={form.selling_price ?? ""} onChange={(e) => set("selling_price", e.target.value === "" ? null : Number(e.target.value))} placeholder="Per unit" />
                  </div>
                </div>

                {/* Shipping */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <PortAutocomplete
                      label="Port of Loading (POL)"
                      value={form.pol || ""}
                      onChange={(v) => set("pol", v)}
                      placeholder="Start typing port name…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <PortAutocomplete
                      label="Port of Discharge (POD)"
                      value={form.pod || ""}
                      onChange={(v) => set("pod", v)}
                      placeholder="Start typing port name…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Vessel</Label>
                    <Input value={form.vessel || ""} onChange={(e) => set("vessel", e.target.value)} placeholder="MV Ever Given" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Container No.</Label>
                    <Input value={form.container_no || ""} onChange={(e) => set("container_no", e.target.value)} placeholder="MSKU-1234567" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Lead Time</Label>
                    <Input value={form.lead_time || ""} onChange={(e) => set("lead_time", e.target.value)} placeholder="14 days" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Packaging</Label>
                    <Input value={form.packaging || ""} onChange={(e) => set("packaging", e.target.value)} placeholder="50 kg PP bags" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tax Clause</Label>
                    <Input value={form.tax_clause || ""} onChange={(e) => set("tax_clause", e.target.value)} placeholder="VAT reverse charge" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Bank Details</Label>
                    <Input value={form.bank_details || ""} onChange={(e) => set("bank_details", e.target.value)} placeholder="Bank name · IBAN" />
                  </div>
                </div>

                {/* Notes & Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea rows={2} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Additional notes visible to the partner…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Terms</Label>
                    <Textarea rows={2} value={typeof form.terms === "string" ? form.terms : ""} onChange={(e) => set("terms", e.target.value)} placeholder="Delivery time, payment terms…" />
                  </div>
                </div>

                {/* Trade Advisor — auto-shows FTA + tariff info when countries are known */}
                {selectedPartner?.country && (
                  <TradeAdvisor
                    reporterCode={selectedPartner.country}
                    partnerCode={undefined}
                    hsCode={(form.items?.[0] as any)?.hs_code}
                  />
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" />
                Saving…
              </>
            ) : offer ? (
              "Save changes"
            ) : (
              <>
                <Plus className="size-4 mr-1" />
                Create offer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import {
  Plus, Search, Inbox, Pencil, Trash2, Eye, X, Calendar, FileInput, ArrowRightLeft,
  Sparkles, Loader2, Building2, MapPin, Hash, Mail, Phone, FileCheck, Import,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtMoney, fmtDate, fmtDateTime } from "@/lib/utils/format";
import { Demand, DemandItem, DemandStatus, Partner, Product, PortalRfq } from "@/lib/supabase/types";
import { CURRENCIES } from "@/lib/data/reference";

const STATUS_LABELS: Record<DemandStatus, string> = {
  open: "Open",
  quoted: "Quoted",
  closed: "Closed",
};

function StatusBadge({ status }: { status: DemandStatus }) {
  if (status === "open")
    return <Badge className="border-transparent bg-primary text-primary-foreground">{STATUS_LABELS[status]}</Badge>;
  if (status === "quoted")
    return <Badge className="border-transparent bg-[var(--chart-4)] text-black">{STATUS_LABELS[status]}</Badge>;
  return <Badge className="border-transparent bg-muted text-muted-foreground">{STATUS_LABELS[status]}</Badge>;
}

const UNIT_OPTIONS = ["pcs", "kg", "l", "m", "m²", "m³", "hr", "can", "set", "t"];

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

// ─── Product context type ───
interface ProductContext {
  product: Product;
  catalogEntry: any;
  supplierOffers: any[];
  tradeCalculations: any[];
  inventoryStatus: { stock: number; reorder_level: number; low_stock: boolean; unit: string } | null;
  priceHistory: Array<{ date: string; source: string; source_number: string; unit_price: number; currency: string; quantity: number }>;
}

export function DemandsView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Demand | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showRfqPicker, setShowRfqPicker] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["demands", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const r = await fetch(`/api/demands?${params}`);
      if (!r.ok) throw new Error("Failed to load demands");
      return r.json() as Promise<{ items: Demand[]; total: number }>;
    },
  });

  const partners = useQuery({
    queryKey: ["partners", "list", "200"],
    queryFn: async () => {
      const r = await fetch(`/api/partners?limit=200`);
      if (!r.ok) throw new Error("Failed to load partners");
      return r.json() as Promise<{ items: Partner[]; total: number }>;
    },
  });

  const detail = useQuery({
    queryKey: ["demand", detailId],
    queryFn: async () => {
      const r = await fetch(`/api/demands/${detailId}`);
      if (!r.ok) throw new Error("Failed to load demand");
      return r.json() as Promise<Demand>;
    },
    enabled: !!detailId,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/demands/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Demand deleted.");
      qc.invalidateQueries({ queryKey: ["demands"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const items = data?.items || [];
  const partnerList = partners.data?.items || [];
  const partnerName = (id: string) => partnerList.find((p) => p.id === id)?.name || "—";

  return (
    <div>
      <PageHeader
        title="Demands"
        description={`${data?.total ?? 0} total`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowRfqPicker(true)}>
              <Import className="size-4 mr-1" /> From Portal RFQ
            </Button>
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="size-4 mr-1" /> New demand
            </Button>
          </div>
        }
      />

      <Card className="mb-4 border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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
              icon={<Inbox className="size-6" />}
              title="No demands"
              description="Create your first demand (RFQ) to get started."
              action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New demand</Button>}
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
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="hidden xl:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((d) => (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setDetailId(d.id)}
                    >
                      <TableCell className="font-mono text-xs tabular">{d.number}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="font-medium truncate max-w-[220px]">{d.subject || "—"}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{partnerName(d.partner_id)}</TableCell>
                      <TableCell><StatusBadge status={d.status} /></TableCell>
                      <TableCell className="text-right font-mono tabular">{(d.items || []).length}</TableCell>
                      <TableCell className="hidden xl:table-cell">{fmtDate(d.created_at)}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="size-8" onClick={() => setDetailId(d.id)} title="View">
                            <Eye className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditing(d); setShowForm(true); }} title="Edit">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(d.id)} title="Delete">
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

      {/* Form dialog */}
      <DemandFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        demand={editing}
        partners={partnerList}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["demands"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />

      {/* Portal RFQ picker dialog */}
      <PortalRfqPickerDialog
        open={showRfqPicker}
        onOpenChange={setShowRfqPicker}
        onCreated={() => {
          setShowRfqPicker(false);
          qc.invalidateQueries({ queryKey: ["demands"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Inbox className="size-5" />
              <span className="font-mono text-base">{detail.data?.number || "Demand"}</span>
            </SheetTitle>
            <SheetDescription>{detail.data?.subject || "Demand details"}</SheetDescription>
          </SheetHeader>
          {detail.isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detail.data ? (
            <DemandDetail
              demand={detail.data}
              partnerName={partnerName(detail.data.partner_id)}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete demand?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The demand and its items will be permanently deleted.
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
function DemandDetail({
  demand, partnerName,
}: {
  demand: Demand;
  partnerName: string;
}) {
  return (
    <div className="px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <StatusBadge status={demand.status} />
        <span className="text-sm text-muted-foreground">{partnerName}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="size-3" /> Requested delivery</p>
          <p className="text-sm font-medium">{fmtDate(demand.requested_delivery)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><FileInput className="size-3" /> Created</p>
          <p className="text-sm font-medium">{fmtDateTime(demand.created_at)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-lg border border-border/60 overflow-hidden mb-4">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="hidden sm:table-cell">Unit</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Target price</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(demand.items || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                  No items.
                </TableCell>
              </TableRow>
            ) : (demand.items || []).map((it, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{it.product_name || "—"}</TableCell>
                <TableCell className="text-right font-mono tabular">{it.quantity}</TableCell>
                <TableCell className="hidden sm:table-cell">{it.unit}</TableCell>
                <TableCell className="text-right font-mono tabular hidden sm:table-cell">
                  {it.target_price != null ? fmtMoney(it.target_price, demand.currency) : "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[220px] truncate">
                  {it.notes || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {demand.description && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/40">{demand.description}</p>
        </div>
      )}

      <div className="pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              const res = await fetch(`/api/automation/create-offer-from-deal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ demandId: demand.id }),
              });
              if (!res.ok) throw new Error("Failed to create offer");
              const data = await res.json();
              toast.success(`Offer created: ${data.offer?.offer_number || data.id}`);
            } catch {
              toast.error("Failed to convert demand to offer");
            }
          }}
        >
          <ArrowRightLeft className="size-4 mr-1" /> Convert to offer
        </Button>
      </div>
    </div>
  );
}

// ---- Portal RFQ Picker Dialog ----
function PortalRfqPickerDialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}) {
  const [creating, setCreating] = useState<string | null>(null);

  const rfqs = useQuery({
    queryKey: ["portal-rfqs", "pending"],
    queryFn: async () => {
      const r = await fetch(`/api/portal-rfqs?status=pending`);
      if (!r.ok) throw new Error("Failed to load portal RFQs");
      return r.json() as Promise<{ items: PortalRfq[]; total: number }>;
    },
    enabled: open,
  });

  const partners = useQuery({
    queryKey: ["partners", "list", "200"],
    queryFn: async () => {
      const r = await fetch(`/api/partners?limit=200`);
      if (!r.ok) throw new Error("Failed to load partners");
      return r.json() as Promise<{ items: Partner[]; total: number }>;
    },
    enabled: open,
  });

  const partnerList = partners.data?.items || [];
  const partnerName = (id: string) => partnerList.find((p) => p.id === id)?.name || "—";

  async function createFromRfq(rfq: PortalRfq) {
    setCreating(rfq.id);
    try {
      const r = await fetch("/api/automation/create-demand-from-portal-rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfq_id: rfq.id }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create demand");
      }
      toast.success(`Demand created from RFQ ${rfq.number}`);
      onCreated();
    } catch (e: any) {
      toast.error(e.message || "Failed to create demand from RFQ.");
    } finally {
      setCreating(null);
    }
  }

  const rfqItems = rfqs.data?.items || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Import className="size-5" />
            Create Demand from Portal RFQ
          </DialogTitle>
          <DialogDescription>
            Select a pending portal RFQ to auto-create a demand. Partner and product details will be auto-filled.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        {rfqs.isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : rfqItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileCheck className="size-8 mx-auto mb-2 opacity-50" />
            <p>No pending portal RFQs available.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rfqItems.map((rfq) => (
              <Card key={rfq.id} className="border-border/60 hover:border-foreground/20 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs">{rfq.number}</span>
                        <Badge variant="outline" className="text-xs">{rfq.status}</Badge>
                      </div>
                      <p className="font-medium text-sm">{rfq.product_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rfq.quantity} {rfq.unit} · {partnerName(rfq.partner_id)}
                        {rfq.target_price != null && ` · Target: ${fmtMoney(rfq.target_price, rfq.currency)}`}
                      </p>
                      {rfq.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-[400px]">{rfq.notes}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createFromRfq(rfq)}
                      disabled={creating === rfq.id}
                    >
                      {creating === rfq.id ? (
                        <><Loader2 className="size-4 mr-1 animate-spin" /> Creating…</>
                      ) : (
                        <><Plus className="size-4 mr-1" /> Create</>
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
function DemandFormDialog({
  open, onOpenChange, demand, partners, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  demand: Demand | null;
  partners: Partner[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Demand> & { items: DemandItem[] }>({ items: [] });
  const [saving, setSaving] = useState(false);
  const [partnerContext, setPartnerContext] = useState<PartnerContext | null>(null);
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [autoNumber, setAutoNumber] = useState<string | null>(null);

  const products = useQuery({
    queryKey: ["products", "list", "200"],
    queryFn: async () => {
      const r = await fetch(`/api/products?limit=200`);
      if (!r.ok) throw new Error("Failed to load products");
      return r.json() as Promise<{ items: Product[]; total: number }>;
    },
    enabled: open,
  });

  const productList = products.data?.items || [];

  // Auto-generate demand number when creating new
  useEffect(() => {
    if (open && !demand) {
      const year = new Date().getFullYear();
      const seq = Math.floor(Math.random() * 900) + 100;
      const num = `RFQ-${year}-${seq}`;
      setAutoNumber(num);
    } else {
      setAutoNumber(null);
    }
  }, [open, demand]);

  useMemo(() => {
    if (open) {
      setForm(demand ? {
        ...demand,
        items: (demand.items || []).map((i) => ({ ...i })),
      } : {
        currency: "USD",
        status: "open",
        items: [],
        description: "",
        requested_delivery: null,
      });
      setPartnerContext(null);
    }
  }, [open, demand]);

  function set<K extends keyof Demand>(k: K, v: Demand[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setItem(idx: number, patch: Partial<DemandItem>) {
    setForm((f) => {
      const items = [...(f.items || [])];
      items[idx] = { ...items[idx], ...patch };
      return { ...f, items };
    });
  }

  function addItem() {
    setForm((f) => ({
      ...f,
      items: [...(f.items || []), {
        product_name: "", quantity: 1, unit: "pcs", target_price: null, notes: "",
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
      const r = await fetch(`/api/automation/partner-context?partner_id=${partnerId}`);
      if (!r.ok) throw new Error("Failed to load partner context");
      const ctx: PartnerContext = await r.json();
      setPartnerContext(ctx);

      // Auto-fill partner preferences
      const p = ctx.partner;
      setForm((f) => ({
        ...f,
        partner_id: partnerId,
        currency: p.preferred_currency || f.currency || "USD",
      }));

      toast.success(`Partner data loaded: ${p.name}`, { description: "Currency & preferences auto-filled." });
    } catch {
      toast.error("Failed to load partner context.");
      setPartnerContext(null);
    } finally {
      setLoadingPartner(false);
    }
  }, []);

  // ─── Product auto-fill ───
  const selectProductForItem = useCallback(async (idx: number, productId: string) => {
    const p = productList.find((x) => x.id === productId);
    if (!p) return;

    // Immediately fill basic product info
    setItem(idx, {
      product_name: p.name,
      unit: p.unit,
      target_price: p.price || null,
    });

    // Fetch product context for richer data
    try {
      const r = await fetch(`/api/automation/product-context?product_id=${productId}`);
      if (!r.ok) throw new Error("Failed to load product context");
      const ctx: ProductContext = await r.json();

      // Update price from catalog if available
      if (ctx.product?.price) {
        setItem(idx, { target_price: ctx.product.price });
      }

      toast.success(`Product data loaded: ${p.name}`, { description: "Price, unit & currency auto-filled." });
    } catch {
      // Basic fill already done, no need to show error
    }
  }, [productList]);

  const selectedPartner = form.partner_id ? partners.find((p) => p.id === form.partner_id) : undefined;

  async function save() {
    if (!form.subject) { toast.error("Subject is required."); return; }
    if (!form.partner_id) { toast.error("Select a partner."); return; }
    setSaving(true);
    try {
      const method = demand ? "PUT" : "POST";
      const url = demand ? `/api/demands/${demand.id}` : "/api/demands";
      const body = {
        ...form,
        number: form.number || autoNumber || undefined,
        items: form.items || [],
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
      toast.success(demand ? "Demand updated." : "Demand created.");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            {demand ? "Edit demand" : "New demand"}
          </DialogTitle>
          <DialogDescription>Fill in the header and items for this demand. Auto-fill is enabled for partners and products.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
          {/* Auto-number badge */}
          {!demand && autoNumber && (
            <div className="md:col-span-2 flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                <Sparkles className="size-3 text-amber-500 mr-1" />
                {autoNumber}
              </Badge>
              <span className="text-xs text-muted-foreground">Auto-generated number</span>
            </div>
          )}

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

          {/* Partner context panel */}
          {selectedPartner && partnerContext && (
            <div className="md:col-span-2 rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10 p-3">
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
                {selectedPartner.preferred_incoterm && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Incoterm: {selectedPartner.preferred_incoterm}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="md:col-span-2 space-y-1.5">
            <Label>Subject *</Label>
            <Input
              value={form.subject || ""}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Equipment inquiry"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={form.currency || "USD"} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Requested delivery</Label>
            <Input
              type="date"
              value={form.requested_delivery ? form.requested_delivery.slice(0, 10) : ""}
              onChange={(e) => set("requested_delivery", e.target.value ? new Date(e.target.value).toISOString() : null)}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Demand details…"
            />
          </div>

          {/* Items editor */}
          <div className="md:col-span-2 border-t pt-3 mt-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Items</p>
              <Button type="button" size="sm" variant="outline" onClick={addItem}>
                <Plus className="size-4 mr-1" /> Add item
              </Button>
            </div>

            {(form.items || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                No items. Click &ldquo;Add item&quot; to start.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll pr-1">
                {(form.items || []).map((it, idx) => (
                  <div key={idx} className="rounded-md border border-border/60 p-2 grid grid-cols-12 gap-1.5 items-end">
                    <div className="col-span-12 sm:col-span-5 space-y-1">
                      <Label className="text-xs">Product</Label>
                      <Select
                        value={it.product_name ? "__selected__" : "__custom__"}
                        onValueChange={(v) => {
                          if (v === "__custom__") return;
                          // Find product by name (workaround for non-id based items)
                          const prod = productList.find((p) => p.name === v);
                          if (prod) selectProductForItem(idx, prod.id);
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          <SelectItem value="__custom__">— Manual entry —</SelectItem>
                          {productList.map((p) => (
                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="h-9"
                        value={it.product_name || ""}
                        onChange={(e) => setItem(idx, { product_name: e.target.value })}
                        placeholder="e.g. Laptop 16GB"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        className="h-9"
                        value={it.quantity}
                        onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Select value={it.unit} onValueChange={(v) => setItem(idx, { unit: v })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Target price</Label>
                      <Input
                        type="number"
                        className="h-9"
                        value={it.target_price ?? ""}
                        onChange={(e) => setItem(idx, { target_price: e.target.value === "" ? null : Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-9 text-destructive"
                        onClick={() => removeItem(idx)}
                        title="Remove"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="col-span-12 space-y-1">
                      <Label className="text-xs">Notes</Label>
                      <Input
                        className="h-8 text-xs"
                        value={it.notes || ""}
                        onChange={(e) => setItem(idx, { notes: e.target.value })}
                        placeholder="Additional requirements…"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

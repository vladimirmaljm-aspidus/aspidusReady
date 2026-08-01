"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import {
  Plus, Search, Pencil, Trash2, Eye, Handshake, ArrowLeftRight,
  DollarSign, Package, Ship, ShieldCheck, FileText, MapPin, Clock, CreditCard,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtMoney, fmtDate } from "@/lib/utils/format";
import {
  SupplierOffer, SupplierOfferStatus, ProductCatalogEntry, Partner,
} from "@/lib/supabase/types";
import {
  INCOTERMS, CURRENCIES, COUNTRIES, PAYMENT_TERMS,
  getCountry, getCurrency, getIncoterm,
} from "@/lib/data/reference";

function flagEmoji(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const cc = countryCode.toUpperCase();
  const codePoints = [...cc].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

const STATUS_LABELS: Record<SupplierOfferStatus, string> = {
  active: "Active", expired: "Expired", on_hold: "On Hold", consumed: "Consumed",
};

const STATUS_BADGE: Record<SupplierOfferStatus, string> = {
  active: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  expired: "bg-muted text-muted-foreground border-border",
  on_hold: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  consumed: "bg-secondary text-secondary-foreground border-border",
};

const STATUS_VALUES: { code: string; label: string }[] = [
  { code: "active", label: "Active" },
  { code: "expired", label: "Expired" },
  { code: "on_hold", label: "On Hold" },
  { code: "consumed", label: "Consumed" },
];

function incotermLabel(code: string): string {
  const i = getIncoterm(code);
  return i ? `${i.code} — ${i.name}` : code;
}

export function SupplierOffersView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<SupplierOffer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["supplier-offers", search, productFilter, supplierFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (productFilter !== "all") params.set("product_id", productFilter);
      if (supplierFilter !== "all") params.set("supplier_id", supplierFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const r = await fetch(`/api/supplier-offers?${params}`);
      if (!r.ok) throw new Error("Failed to load supplier offers");
      return r.json() as Promise<{ items: SupplierOffer[]; total: number }>;
    },
  });

  // Catalog & partners for dropdowns + lookups
  const catalog = useQuery({
    queryKey: ["product-catalog", "all"],
    queryFn: async () => {
      const r = await fetch("/api/product-catalog?limit=500");
      if (!r.ok) throw new Error("Failed to load product catalog");
      return r.json() as Promise<{ items: ProductCatalogEntry[] }>;
    },
  });
  const partners = useQuery({
    queryKey: ["partners", "all"],
    queryFn: async () => {
      const r = await fetch("/api/partners?limit=500");
      if (!r.ok) throw new Error("Failed to load partners");
      return r.json() as Promise<{ items: Partner[] }>;
    },
  });

  const catalogMap = new Map((catalog.data?.items || []).map((p) => [p.id, p]));
  const partnerMap = new Map((partners.data?.items || []).map((p) => [p.id, p]));
  // Suppliers = partners whose type is supplier or both
  const supplierPartners = (partners.data?.items || []).filter((p) => p.type === "supplier" || p.type === "both");

  const detail = useQuery({
    queryKey: ["supplier-offer", detailId],
    queryFn: async () => {
      const r = await fetch(`/api/supplier-offers/${detailId}`);
      if (!r.ok) throw new Error("Failed to load offer");
      return r.json() as Promise<SupplierOffer>;
    },
    enabled: !!detailId,
  });

  // Other offers for the same product (for comparison)
  const comparison = useQuery({
    queryKey: ["supplier-offers", "compare", detail.data?.product_id],
    queryFn: async () => {
      const r = await fetch(`/api/supplier-offers?product_id=${detail.data?.product_id}`);
      if (!r.ok) throw new Error("Failed to load comparison offers");
      return r.json() as Promise<{ items: SupplierOffer[] }>;
    },
    enabled: !!detail.data?.product_id,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/supplier-offers/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Offer deleted.");
      qc.invalidateQueries({ queryKey: ["supplier-offers"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title="Supplier Offers"
        description={`${data?.total ?? 0} offers`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> New Offer
          </Button>
        }
      />

      <Card className="mb-4 border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by offer #, packaging…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Product" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">All products</SelectItem>
              {(catalog.data?.items || []).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Supplier" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">All suppliers</SelectItem>
              {supplierPartners.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_VALUES.map((s) => (
                <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>
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
              icon={<Handshake className="size-6" />}
              title="No supplier offers"
              description="Add your first supplier offer to get started."
              action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New Offer</Button>}
            />
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Offer #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden md:table-cell">Supplier</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Min Order</TableHead>
                    <TableHead className="hidden md:table-cell">Incoterm</TableHead>
                    <TableHead className="hidden xl:table-cell">Origin</TableHead>
                    <TableHead className="hidden xl:table-cell text-right">Lead</TableHead>
                    <TableHead className="hidden lg:table-cell">Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((o) => {
                    const product = catalogMap.get(o.product_id);
                    const supplier = partnerMap.get(o.supplier_id);
                    return (
                      <TableRow
                        key={o.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setDetailId(o.id)}
                      >
                        <TableCell>
                          <span className="font-mono text-xs tabular">{o.offer_number || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm truncate max-w-[200px]">{product?.name || "Unknown product"}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{supplier?.name || "—"}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{supplier?.name || "—"}</TableCell>
                        <TableCell className="text-right tabular text-sm font-medium">
                          {fmtMoney(o.unit_price, o.currency)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-right tabular text-sm">
                          {o.min_order_qty ? o.min_order_qty.toLocaleString() : "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="font-mono">{o.incoterm}</Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">
                          <span className="mr-1">{flagEmoji(o.origin_country)}</span>
                          <span className="text-muted-foreground">{o.origin_country ? getCountry(o.origin_country)?.code : "—"}</span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-right tabular text-sm">
                          {o.lead_time_days ? `${o.lead_time_days}d` : "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm tabular text-muted-foreground">
                          {fmtDate(o.price_valid_until)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_BADGE[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                        </TableCell>
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <OfferFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        offer={editing}
        catalog={catalog.data?.items || []}
        supplierPartners={supplierPartners}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["supplier-offers"] });
        }}
      />

      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Handshake className="size-5" />
              {detail.data?.offer_number || "Supplier Offer"}
            </SheetTitle>
            <SheetDescription>Offer details and supplier comparison</SheetDescription>
          </SheetHeader>
          {detail.isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detail.data ? (
            <OfferDetail
              offer={detail.data}
              product={catalogMap.get(detail.data.product_id)}
              supplier={partnerMap.get(detail.data.supplier_id)}
              comparison={comparison.data?.items || []}
              partnerMap={partnerMap}
              currentId={detail.data.id}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Trade calculations referencing this offer may lose their source.
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
function OfferSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
        <Icon className="size-3.5" /> {title}
      </p>
      <div className="border border-border/60 rounded-md divide-y divide-border/60 bg-card">
        {children}
      </div>
    </div>
  );
}

function OfferRow({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between p-2.5 gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right font-medium ${mono ? "font-mono tabular" : ""}`}>{value || "—"}</span>
    </div>
  );
}

function OfferDetail({
  offer, product, supplier, comparison, partnerMap, currentId,
}: {
  offer: SupplierOffer;
  product?: ProductCatalogEntry;
  supplier?: Partner;
  comparison: SupplierOffer[];
  partnerMap: Map<string, Partner>;
  currentId: string;
}) {
  const otherOffers = comparison.filter((o) => o.id !== currentId);
  const cur = getCurrency(offer.currency);
  const incoterm = getIncoterm(offer.incoterm);

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={STATUS_BADGE[offer.status]}>{STATUS_LABELS[offer.status]}</Badge>
        <Badge variant="outline" className="font-mono">{offer.incoterm}</Badge>
        {offer.origin_country && (
          <Badge variant="outline">
            <span className="mr-1">{flagEmoji(offer.origin_country)}</span>{getCountry(offer.origin_country)?.name}
          </Badge>
        )}
        <Badge variant="secondary">{cur?.code || offer.currency}</Badge>
      </div>

      {/* Heading summary */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Product</p>
          <p className="font-medium">{product?.name || "Unknown product"}</p>
          <p className="text-xs text-muted-foreground mt-2">Supplier</p>
          <p className="font-medium">{supplier?.name || "Unknown supplier"}</p>
        </CardContent>
      </Card>

      <OfferSection icon={DollarSign} title="Pricing">
        <OfferRow label="Unit price" value={`${fmtMoney(offer.unit_price, offer.currency)} / ${product?.base_unit || "unit"}`} mono />
        <OfferRow label="Currency" value={`${cur?.code} — ${cur?.name}`} />
        <OfferRow label="Minimum order qty" value={offer.min_order_qty ? offer.min_order_qty.toLocaleString() : null} mono />
        <OfferRow label="Price valid until" value={fmtDate(offer.price_valid_until)} mono />
      </OfferSection>

      <OfferSection icon={Package} title="Packaging & Loadability">
        <OfferRow label="Packaging" value={offer.packaging} />
        <OfferRow label="Packing details" value={offer.packing_details} />
        <OfferRow label="Loadability" value={offer.loadability} />
        <OfferRow label="Specification notes" value={offer.specification_notes} />
      </OfferSection>

      <OfferSection icon={Ship} title="Trade Terms">
        <OfferRow label="Incoterm" value={incoterm ? `${incoterm.code} — ${incoterm.name}` : offer.incoterm} />
        <OfferRow label="Loading port" value={<span className="flex items-center gap-1"><MapPin className="size-3 text-muted-foreground" />{offer.loading_port}</span>} />
        <OfferRow label="Delivery port" value={<span className="flex items-center gap-1"><MapPin className="size-3 text-muted-foreground" />{offer.delivery_port}</span>} />
        <OfferRow label="Lead time" value={<span className="flex items-center gap-1"><Clock className="size-3 text-muted-foreground" />{offer.lead_time_days ? `${offer.lead_time_days} days` : null}</span>} />
        <OfferRow label="Payment terms" value={<span className="flex items-center gap-1"><CreditCard className="size-3 text-muted-foreground" />{PAYMENT_TERMS.find((p) => p.code === offer.payment_terms)?.name || offer.payment_terms}</span>} />
      </OfferSection>

      <OfferSection icon={ShieldCheck} title="Quality">
        <OfferRow label="Inspection" value={offer.inspection} />
        <OfferRow label="Certificate" value={offer.certificate} />
      </OfferSection>

      {offer.notes && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><FileText className="size-3.5" /> Notes</p>
          <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/50 border border-border/60">{offer.notes}</p>
        </div>
      )}

      <Separator />

      {/* Compare with other suppliers */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <ArrowLeftRight className="size-3.5" /> Compare with other suppliers ({otherOffers.length})
        </p>
        {otherOffers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other offers for this product.</p>
        ) : (
          <div className="border border-border/60 rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="h-8 text-xs">Supplier</TableHead>
                  <TableHead className="h-8 text-xs text-right">Unit price</TableHead>
                  <TableHead className="h-8 text-xs">Incoterm</TableHead>
                  <TableHead className="h-8 text-xs hidden sm:table-cell">Origin</TableHead>
                  <TableHead className="h-8 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherOffers.map((o) => {
                  const sup = partnerMap.get(o.supplier_id);
                  return (
                    <TableRow key={o.id} className="text-xs">
                      <TableCell className="font-medium">{sup?.name || "—"}</TableCell>
                      <TableCell className="text-right tabular">{fmtMoney(o.unit_price, o.currency)}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono">{o.incoterm}</Badge></TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="mr-1">{flagEmoji(o.origin_country)}</span>
                        <span className="text-muted-foreground">{o.origin_country ? getCountry(o.origin_country)?.code : "—"}</span>
                      </TableCell>
                      <TableCell><Badge variant="outline" className={STATUS_BADGE[o.status]}>{STATUS_LABELS[o.status]}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="pt-3 border-t">
        <p className="text-xs text-muted-foreground">Created {fmtDate(offer.created_at)}</p>
      </div>
    </div>
  );
}

// ---- Form dialog ----
function OfferFormDialog({
  open, onOpenChange, offer, catalog, supplierPartners, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  offer: SupplierOffer | null;
  catalog: ProductCatalogEntry[];
  supplierPartners: Partner[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<SupplierOffer>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(offer
        ? { ...offer }
        : ({
            status: "active", unit_price: 0, currency: "USD", min_order_qty: null,
            price_valid_until: null, packaging: "", packing_details: "", loadability: "",
            specification_notes: "", origin_country: null, incoterm: "FOB",
            loading_port: "", delivery_port: "", lead_time_days: null, payment_terms: null,
            inspection: "", certificate: "", notes: "", offer_number: "",
          } as Partial<SupplierOffer>));
    }
  }, [open, offer]);

  function set<K extends keyof SupplierOffer>(k: K, v: SupplierOffer[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.product_id) { toast.error("Product is required."); return; }
    if (!form.supplier_id) { toast.error("Supplier is required."); return; }
    setSaving(true);
    try {
      const method = offer ? "PUT" : "POST";
      const url = offer ? `/api/supplier-offers/${offer.id}` : "/api/supplier-offers";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Request failed");
      }
      toast.success(offer ? "Offer updated." : "Offer created.");
      onSaved();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{offer ? "Edit offer" : "New offer"}</DialogTitle>
          <DialogDescription>Per-supplier pricing and trade terms for a catalog product.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
          <div className="space-y-1.5">
            <Label>Product *</Label>
            <Select value={form.product_id || ""} onValueChange={(v) => set("product_id", v)}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {catalog.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Supplier *</Label>
            <Select value={form.supplier_id || ""} onValueChange={(v) => set("supplier_id", v)}>
              <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {supplierPartners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Offer number</Label>
            <Input value={form.offer_number || ""} onChange={(e) => set("offer_number", e.target.value)} placeholder="Supplier's reference (optional)" className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status || "active"} onValueChange={(v) => set("status", v as SupplierOfferStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_VALUES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2"><Separator className="my-1" /><p className="text-xs text-muted-foreground">Pricing</p></div>
          <div className="space-y-1.5">
            <Label>Unit price *</Label>
            <Input type="number" min={0} step="0.01" value={form.unit_price ?? 0} onChange={(e) => set("unit_price", Number(e.target.value))} className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={form.currency || "USD"} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="font-mono mr-2">{c.value}</span> {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Minimum order qty</Label>
            <Input type="number" min={0} value={form.min_order_qty ?? ""} onChange={(e) => set("min_order_qty", e.target.value ? Number(e.target.value) : null)} className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Price valid until</Label>
            <Input type="date" value={form.price_valid_until ? form.price_valid_until.slice(0, 10) : ""} onChange={(e) => set("price_valid_until", e.target.value ? new Date(e.target.value).toISOString() : null)} className="tabular" />
          </div>

          <div className="md:col-span-2"><Separator className="my-1" /><p className="text-xs text-muted-foreground">Packaging & Loadability</p></div>
          <div className="md:col-span-2 space-y-1.5">
            <Label>Packaging</Label>
            <Input value={form.packaging || ""} onChange={(e) => set("packaging", e.target.value)} placeholder='e.g. "50 kg PP bags"' />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label>Packing details</Label>
            <Textarea rows={2} value={form.packing_details || ""} onChange={(e) => set("packing_details", e.target.value)} placeholder="Palletizing, wrapping, etc." />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label>Loadability</Label>
            <Input value={form.loadability || ""} onChange={(e) => set("loadability", e.target.value)} placeholder='e.g. "28 MT per 40&apos; HC container"' />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label>Specification notes</Label>
            <Textarea rows={2} value={form.specification_notes || ""} onChange={(e) => set("specification_notes", e.target.value)} placeholder="Deviations from base product spec" />
          </div>
          <div className="space-y-1.5">
            <Label>Origin country</Label>
            <Select value={form.origin_country || "__none__"} onValueChange={(v) => set("origin_country", v === "__none__" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Not specified" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__none__">Not specified</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="mr-2">{flagEmoji(c.code)}</span>{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2"><Separator className="my-1" /><p className="text-xs text-muted-foreground">Trade Terms</p></div>
          <div className="space-y-1.5">
            <Label>Incoterm</Label>
            <Select value={form.incoterm || "FOB"} onValueChange={(v) => set("incoterm", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {INCOTERMS.map((i) => (
                  <SelectItem key={i.code} value={i.code}>
                    <span className="font-mono mr-2">{i.code}</span> {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Payment terms</Label>
            <Select value={form.payment_terms || "__none__"} onValueChange={(v) => set("payment_terms", v === "__none__" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Not specified" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__none__">Not specified</SelectItem>
                {PAYMENT_TERMS.map((p) => (
                  <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Loading port</Label>
            <Input value={form.loading_port || ""} onChange={(e) => set("loading_port", e.target.value)} placeholder="e.g. Santos" />
          </div>
          <div className="space-y-1.5">
            <Label>Delivery port</Label>
            <Input value={form.delivery_port || ""} onChange={(e) => set("delivery_port", e.target.value)} placeholder="e.g. Bar" />
          </div>
          <div className="space-y-1.5">
            <Label>Lead time (days)</Label>
            <Input type="number" min={0} value={form.lead_time_days ?? ""} onChange={(e) => set("lead_time_days", e.target.value ? Number(e.target.value) : null)} className="tabular" />
          </div>

          <div className="md:col-span-2"><Separator className="my-1" /><p className="text-xs text-muted-foreground">Quality</p></div>
          <div className="space-y-1.5">
            <Label>Inspection</Label>
            <Input value={form.inspection || ""} onChange={(e) => set("inspection", e.target.value)} placeholder="e.g. SGS" />
          </div>
          <div className="space-y-1.5">
            <Label>Certificate</Label>
            <Input value={form.certificate || ""} onChange={(e) => set("certificate", e.target.value)} placeholder="e.g. ISO 22000, Halal" />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
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

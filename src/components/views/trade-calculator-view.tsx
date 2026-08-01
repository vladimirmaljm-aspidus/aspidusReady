"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
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
  Plus, Pencil, Trash2, Eye, Calculator, X, TrendingUp, TrendingDown,
  DollarSign, Ship, Container, ArrowLeftRight, Sparkles, Loader2, Building2,
  MapPin, Lightbulb, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtMoney, fmtDate, fmtNumber } from "@/lib/utils/format";
import {
  TradeCalculation, TradeCostLine, ProductCatalogEntry, SupplierOffer, Partner,
} from "@/lib/supabase/types";
import {
  TRADE_COST_TYPES, INCOTERMS, CURRENCIES, UNITS_OF_MEASURE,
  CONTAINER_TYPES, TRANSPORT_MODES,
} from "@/lib/data/reference";

// Cost types available for the user to add (BUY_PRICE and SELL_PRICE are implicit
// — derived from buy_price_per_unit / sell_price_per_unit).
const EDITABLE_COST_TYPES = TRADE_COST_TYPES.filter(
  (t) => t.code !== "BUY_PRICE" && t.code !== "SELL_PRICE",
);

function costTypeLabel(code: string): string {
  return TRADE_COST_TYPES.find((t) => t.code === code)?.name || code;
}
function unitName(code: string): string {
  return UNITS_OF_MEASURE.find((u) => u.code === code)?.name || code;
}
function containerName(code: string | null): string {
  if (!code) return "—";
  return CONTAINER_TYPES.find((c) => c.code === code)?.name || code;
}

const CHART_COLORS = [
  "bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5",
  "bg-primary", "bg-amber-500", "bg-teal-500",
];

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
  product: any;
  catalogEntry: any;
  supplierOffers: any[];
  tradeCalculations: any[];
  inventoryStatus: { stock: number; reorder_level: number; low_stock: boolean; unit: string } | null;
  priceHistory: Array<{ date: string; source: string; source_number: string; unit_price: number; currency: string; quantity: number }>;
}

// ─── Incoterm-based cost line suggestions ───
const INCOTERM_COST_SUGGESTIONS: Record<string, Array<{ type: string; label: string; basis: "unit" | "percent" | "fixed" | "per_container"; default_value: number }>> = {
  FOB: [
    { type: "FREIGHT", label: "Ocean Freight", basis: "per_container", default_value: 2500 },
    { type: "INSURANCE", label: "Cargo Insurance", basis: "percent", default_value: 0.5 },
    { type: "LOCAL_CHARGES", label: "Local Port Charges", basis: "fixed", default_value: 500 },
  ],
  CIF: [
    { type: "CUSTOMS_DUTY", label: "Customs Duty", basis: "percent", default_value: 5 },
    { type: "VAT", label: "VAT / GST", basis: "percent", default_value: 20 },
    { type: "PORT_CHARGES", label: "Port & Handling Charges", basis: "fixed", default_value: 800 },
    { type: "DELIVERY", label: "Inland Delivery", basis: "fixed", default_value: 1200 },
  ],
  DDP: [
    { type: "FREIGHT", label: "Ocean Freight", basis: "per_container", default_value: 2500 },
    { type: "INSURANCE", label: "Cargo Insurance", basis: "percent", default_value: 0.5 },
    { type: "CUSTOMS_DUTY", label: "Customs Duty", basis: "percent", default_value: 5 },
    { type: "VAT", label: "VAT / GST", basis: "percent", default_value: 20 },
    { type: "PORT_CHARGES", label: "Port & Handling Charges", basis: "fixed", default_value: 800 },
    { type: "DELIVERY", label: "Inland Delivery", basis: "fixed", default_value: 1200 },
    { type: "LOCAL_DELIVERY", label: "Local Delivery to Door", basis: "fixed", default_value: 500 },
  ],
  EXW: [
    { type: "FREIGHT", label: "Transport to Port", basis: "fixed", default_value: 1500 },
    { type: "INSURANCE", label: "Cargo Insurance", basis: "percent", default_value: 0.5 },
    { type: "CUSTOMS_DUTY", label: "Customs Duty", basis: "percent", default_value: 5 },
    { type: "VAT", label: "VAT / GST", basis: "percent", default_value: 20 },
    { type: "PORT_CHARGES", label: "Port & Handling Charges", basis: "fixed", default_value: 800 },
    { type: "DELIVERY", label: "Inland Delivery", basis: "fixed", default_value: 1200 },
  ],
  CFR: [
    { type: "INSURANCE", label: "Cargo Insurance", basis: "percent", default_value: 0.5 },
    { type: "CUSTOMS_DUTY", label: "Customs Duty", basis: "percent", default_value: 5 },
    { type: "VAT", label: "VAT / GST", basis: "percent", default_value: 20 },
    { type: "PORT_CHARGES", label: "Port & Handling Charges", basis: "fixed", default_value: 800 },
    { type: "DELIVERY", label: "Inland Delivery", basis: "fixed", default_value: 1200 },
  ],
};

// Client-side mirror of the backend computation in /api/trade-calculator/route.ts.
function computeTotals(form: Partial<TradeCalculation>) {
  const qty = form.quantity || 0;
  const numContainers = form.num_containers || 1;
  const buyTotal = (form.buy_price_per_unit || 0) * qty;

  let landedCost = buyTotal;
  const lines = (form.cost_lines || []).filter(
    (l) => l.type !== "BUY_PRICE" && l.type !== "SELL_PRICE",
  );
  const computedLines = lines.map((line) => {
    let amount = 0;
    if (line.basis === "unit") amount = (line.value || 0) * qty;
    else if (line.basis === "fixed") amount = line.value || 0;
    else if (line.basis === "per_container") amount = (line.value || 0) * numContainers;
    else if (line.basis === "percent") amount = (landedCost * (line.value || 0)) / 100;
    landedCost += amount;
    return { ...line, amount: Math.round(amount * 100) / 100 };
  });

  const sellTotal = (form.sell_price_per_unit || 0) * qty;
  const margin = sellTotal - landedCost;
  const marginPct = sellTotal > 0 ? (margin / sellTotal) * 100 : 0;
  return {
    buyTotal: Math.round(buyTotal * 100) / 100,
    landedCost: Math.round(landedCost * 100) / 100,
    sellTotal: Math.round(sellTotal * 100) / 100,
    margin: Math.round(margin * 100) / 100,
    marginPct: Math.round(marginPct * 100) / 100,
    computedLines,
  };
}

export function TradeCalculatorView() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<TradeCalculation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["trade-calculator"],
    queryFn: async () => {
      const r = await fetch("/api/trade-calculator");
      if (!r.ok) throw new Error("Failed to load trade calculations");
      return r.json() as Promise<{ items: TradeCalculation[]; total: number }>;
    },
  });

  const catalog = useQuery({
    queryKey: ["product-catalog", "all"],
    queryFn: async () => {
      const r = await fetch("/api/product-catalog?limit=500");
      if (!r.ok) throw new Error("Failed to load product catalog");
      return r.json() as Promise<{ items: ProductCatalogEntry[] }>;
    },
  });
  const offers = useQuery({
    queryKey: ["supplier-offers", "all"],
    queryFn: async () => {
      const r = await fetch("/api/supplier-offers?limit=500");
      if (!r.ok) throw new Error("Failed to load supplier offers");
      return r.json() as Promise<{ items: SupplierOffer[] }>;
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
  const offerMap = new Map((offers.data?.items || []).map((o) => [o.id, o]));
  const partnerMap = new Map((partners.data?.items || []).map((p) => [p.id, p]));

  const detail = useQuery({
    queryKey: ["trade-calc", detailId],
    queryFn: async () => {
      const r = await fetch(`/api/trade-calculator/${detailId}`);
      if (!r.ok) throw new Error("Failed to load calculation");
      return r.json() as Promise<TradeCalculation>;
    },
    enabled: !!detailId,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/trade-calculator/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Calculation deleted.");
      qc.invalidateQueries({ queryKey: ["trade-calculator"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title="Trade Calculator"
        description={`${data?.total ?? 0} saved calculations`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> New Calculation
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Calculator className="size-6" />}
          title="No calculations"
          description="Create your first landed cost calculation to analyze margins."
          action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New Calculation</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[calc(100vh-220px)] overflow-y-auto custom-scroll pr-1 -mr-1">
          {items.map((c) => {
            const product = catalogMap.get(c.product_id || "");
            const supplier = partnerMap.get(c.supplier_id || "");
            const marginPositive = c.gross_margin >= 0;
            return (
              <Card
                key={c.id}
                className="border-border/60 shadow-soft rounded-xl hover:shadow-soft-md transition-shadow cursor-pointer hover:border-foreground/20"
                onClick={() => setDetailId(c.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{product?.name || "No product"}</p>
                    </div>
                    <Badge variant="outline" className="font-mono shrink-0">{c.transport_mode}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Buy / unit</p>
                      <p className="font-medium tabular">{fmtMoney(c.buy_price_per_unit, c.buy_currency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sell / unit</p>
                      <p className="font-medium tabular">{fmtMoney(c.sell_price_per_unit, c.sell_currency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium tabular">{fmtNumber(c.quantity)} {c.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Supplier</p>
                      <p className="font-medium truncate">{supplier?.name || "—"}</p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Gross margin</p>
                      <p className={`text-lg font-semibold tabular ${marginPositive ? "text-chart-1" : "text-destructive"}`}>
                        {fmtMoney(c.gross_margin, c.sell_currency)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={marginPositive
                        ? "bg-chart-1/15 text-chart-1 border-chart-1/30"
                        : "bg-destructive/10 text-destructive border-destructive/30"}
                    >
                      {marginPositive ? <TrendingUp className="size-3 mr-1" /> : <TrendingDown className="size-3 mr-1" />}
                      {c.margin_percent.toFixed(1)}%
                    </Badge>
                    <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="size-8" onClick={() => setDetailId(c.id)} title="View">
                        <Eye className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditing(c); setShowForm(true); }} title="Edit">
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(c.id)} title="Delete">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CalcFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        calc={editing}
        catalog={catalog.data?.items || []}
        offers={offers.data?.items || []}
        partners={partners.data?.items || []}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["trade-calculator"] });
        }}
      />

      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Calculator className="size-5" />
              {detail.data?.name || "Trade Calculation"}
            </SheetTitle>
            <SheetDescription>Landed cost & margin breakdown</SheetDescription>
          </SheetHeader>
          {detail.isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detail.data ? (
            <CalcDetail
              calc={detail.data}
              product={catalogMap.get(detail.data.product_id || "")}
              offer={detail.data.supplier_offer_id ? offerMap.get(detail.data.supplier_offer_id) : undefined}
              supplier={partnerMap.get(detail.data.supplier_id || "")}
              buyer={partnerMap.get(detail.data.buyer_id || "")}
            />
          ) : null}
          {detail.data && (
            <SheetFooter className="mt-4 pt-4 border-t border-border/60">
              <Button
                onClick={async () => {
                  try {
                    const r = await fetch(`/api/trade-calculator/${detail.data!.id}/create-offer`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({}),
                    });
                    if (!r.ok) {
                      const e = await r.json().catch(() => ({}));
                      throw new Error(e.error || "Failed to create offer");
                    }
                    const offer = await r.json();
                    toast.success(`Offer ${offer.number} created!`);
                    setDetailId(null);
                  } catch (e: any) {
                    toast.error(e.message || "Failed to create offer");
                  }
                }}
                className="gap-2"
              >
                <FileText className="size-4" /> Create Offer from Calculation
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete calculation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The saved calculation will be removed.
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
function CalcDetail({
  calc, product, offer, supplier, buyer,
}: {
  calc: TradeCalculation;
  product?: ProductCatalogEntry;
  offer?: SupplierOffer;
  supplier?: Partner;
  buyer?: Partner;
}) {
  const marginPositive = calc.gross_margin >= 0;
  const displayCurrency = calc.sell_currency || calc.buy_currency || "USD";
  const lines = (calc.cost_lines || []);
  const totalForBar = Math.max(calc.total_landed_cost, 1);

  // For the bar, show buy price + each cost line. BUY_PRICE/SELL_PRICE may exist in seed data.
  const barSegments: { label: string; amount: number; color: string }[] = [];
  // Buy price (implicit)
  barSegments.push({
    label: "Buy Price",
    amount: calc.total_buy_cost,
    color: CHART_COLORS[0],
  });
  lines.filter((l) => l.type !== "BUY_PRICE" && l.type !== "SELL_PRICE").forEach((l, i) => {
    barSegments.push({
      label: l.label || costTypeLabel(l.type),
      amount: l.amount,
      color: CHART_COLORS[(i + 1) % CHART_COLORS.length],
    });
  });

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono">{calc.transport_mode}</Badge>
        <Badge variant="outline">
          <Ship className="size-3 mr-1" />
          {calc.buy_incoterm} → {calc.sell_incoterm}
        </Badge>
        {calc.container_type && (
          <Badge variant="secondary">
            <Container className="size-3 mr-1" />
            {containerName(calc.container_type)} × {calc.num_containers}
          </Badge>
        )}
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Buy Total</p>
            <p className="text-lg font-semibold tabular">{fmtMoney(calc.total_buy_cost, calc.buy_currency)}</p>
            <p className="text-[11px] text-muted-foreground tabular">
              {fmtMoney(calc.buy_price_per_unit, calc.buy_currency)} × {fmtNumber(calc.quantity)} {calc.unit}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Landed Cost</p>
            <p className="text-lg font-semibold tabular">{fmtMoney(calc.total_landed_cost, displayCurrency)}</p>
            <p className="text-[11px] text-muted-foreground tabular">
              {fmtMoney(calc.total_landed_cost / Math.max(calc.quantity, 1), displayCurrency)} / {calc.unit}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Sell Revenue</p>
            <p className="text-lg font-semibold tabular">{fmtMoney(calc.total_sell_revenue, calc.sell_currency)}</p>
            <p className="text-[11px] text-muted-foreground tabular">
              {fmtMoney(calc.sell_price_per_unit, calc.sell_currency)} × {fmtNumber(calc.quantity)} {calc.unit}
            </p>
          </CardContent>
        </Card>
        <Card className={`border-border/60 shadow-soft rounded-xl ${marginPositive ? "" : "border-destructive/30"}`}>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Gross Margin</p>
            <p className={`text-lg font-semibold tabular ${marginPositive ? "text-chart-1" : "text-destructive"}`}>
              {fmtMoney(calc.gross_margin, displayCurrency)}
            </p>
            <p className={`text-[11px] tabular ${marginPositive ? "text-chart-1" : "text-destructive"}`}>
              {marginPositive ? <TrendingUp className="size-3 inline mr-0.5" /> : <TrendingDown className="size-3 inline mr-0.5" />}
              {calc.margin_percent.toFixed(2)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost lines table */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <DollarSign className="size-3.5" /> Cost Lines ({lines.length})
        </p>
        <div className="border border-border/60 rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="h-8 text-xs">Type</TableHead>
                <TableHead className="h-8 text-xs">Label</TableHead>
                <TableHead className="h-8 text-xs">Basis</TableHead>
                <TableHead className="h-8 text-xs text-right">Value</TableHead>
                <TableHead className="h-8 text-xs text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((l, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell><Badge variant="secondary" className="font-mono">{l.type}</Badge></TableCell>
                  <TableCell className="font-medium">{l.label || costTypeLabel(l.type)}</TableCell>
                  <TableCell className="text-muted-foreground">{l.basis}</TableCell>
                  <TableCell className="text-right tabular">
                    {l.basis === "percent" ? `${l.value}%` : fmtMoney(l.value, l.currency)}
                  </TableCell>
                  <TableCell className="text-right tabular font-medium">{fmtMoney(l.amount, l.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Visual breakdown bar */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Cost Breakdown</p>
        <div className="flex h-3 w-full rounded-full overflow-hidden border border-border/60 bg-muted/30">
          {barSegments.map((s, i) => (
            <div
              key={i}
              className={`${s.color} h-full`}
              style={{ width: `${(s.amount / totalForBar) * 100}%` }}
              title={`${s.label}: ${fmtMoney(s.amount, displayCurrency)}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3">
          {barSegments.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={`size-2.5 rounded-sm ${s.color} shrink-0`} />
              <span className="text-muted-foreground truncate flex-1">{s.label}</span>
              <span className="tabular font-medium">{fmtMoney(s.amount, displayCurrency)}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Trade context */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <ArrowLeftRight className="size-3.5" /> Trade Context
        </p>
        <div className="border border-border/60 rounded-md divide-y divide-border/60 bg-card text-sm">
          <DetailRow label="Product" value={product?.name || "—"} />
          <DetailRow label="Supplier" value={supplier?.name || "—"} />
          <DetailRow label="Buyer" value={buyer?.name || "—"} />
          <DetailRow label="Supplier offer" value={offer?.offer_number || "—"} mono />
          <DetailRow label="Quantity" value={`${fmtNumber(calc.quantity)} ${unitName(calc.unit)}`} mono />
          <DetailRow label="Containers" value={calc.num_containers ? `${calc.num_containers} × ${containerName(calc.container_type)}` : "—"} />
          <DetailRow label="Loading port" value={calc.loading_port || "—"} />
          <DetailRow label="Delivery port" value={calc.delivery_port || "—"} />
          <DetailRow label="Exchange rate" value={calc.exchange_rate.toString()} mono />
        </div>
      </div>

      <div className="pt-3 border-t">
        <p className="text-xs text-muted-foreground">Created {fmtDate(calc.created_at)}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between p-2.5 gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right font-medium truncate ${mono ? "font-mono tabular" : ""}`}>{value}</span>
    </div>
  );
}

// ---- Form dialog ----
function CalcFormDialog({
  open, onOpenChange, calc, catalog, offers, partners, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  calc: TradeCalculation | null;
  catalog: ProductCatalogEntry[];
  offers: SupplierOffer[];
  partners: Partner[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<TradeCalculation>>({});
  const [lines, setLines] = useState<TradeCostLine[]>([]);
  const [saving, setSaving] = useState(false);
  const [supplierContext, setSupplierContext] = useState<PartnerContext | null>(null);
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [productContext, setProductContext] = useState<ProductContext | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    if (open) {
      const baseForm: Partial<TradeCalculation> = calc
        ? { ...calc }
        : {
            name: "", product_id: null, supplier_offer_id: null,
            supplier_id: null, buyer_id: null,
            quantity: 0, unit: "MT", num_containers: 1, container_type: "40HC",
            buy_price_per_unit: 0, buy_currency: "USD", buy_incoterm: "FOB",
            sell_price_per_unit: 0, sell_currency: "USD", sell_incoterm: "CIF",
            transport_mode: "SEA", loading_port: "", delivery_port: "",
            exchange_rate: 1,
          };
      // Filter out BUY_PRICE/SELL_PRICE rows — they're implicit
      const editableLines = (calc?.cost_lines || []).filter(
        (l) => l.type !== "BUY_PRICE" && l.type !== "SELL_PRICE",
      );
      setForm(baseForm);
      setLines(editableLines);
      setSupplierContext(null);
      setProductContext(null);
    }
  }, [open, calc]);

  function set<K extends keyof TradeCalculation>(k: K, v: TradeCalculation[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // Filter offers by selected product (if any)
  const availableOffers = form.product_id
    ? offers.filter((o) => o.product_id === form.product_id)
    : offers;
  const selectedSupplier = form.supplier_id ? partners.find((p) => p.id === form.supplier_id) : undefined;
  const buyerPartners = partners.filter((p) => p.type === "buyer" || p.type === "both");
  const supplierPartners = partners.filter((p) => p.type === "supplier" || p.type === "both");

  // ─── Supplier auto-fill ───
  const fetchSupplierContext = useCallback(async (supplierId: string) => {
    if (!supplierId) {
      setSupplierContext(null);
      return;
    }
    setLoadingSupplier(true);
    try {
      const r = await fetch(`/api/automation/partner-context?partner_id=${supplierId}`);
      if (!r.ok) throw new Error("Failed to load supplier context");
      const ctx: PartnerContext = await r.json();
      setSupplierContext(ctx);

      // Auto-fill supplier preferences
      const p = ctx.partner;
      setForm((f) => ({
        ...f,
        supplier_id: supplierId,
        buy_currency: p.preferred_currency || f.buy_currency || "USD",
        buy_incoterm: p.preferred_incoterm || f.buy_incoterm || "FOB",
        loading_port: f.loading_port || (ctx.supplierOffers?.[0]?.loading_port) || "",
      }));

      toast.success(`Supplier data loaded: ${p.name}`, { description: "Currency, incoterm & preferences auto-filled." });
    } catch {
      toast.error("Failed to load supplier context.");
      setSupplierContext(null);
    } finally {
      setLoadingSupplier(false);
    }
  }, []);

  // ─── Product auto-fill ───
  function selectProduct(productId: string | null) {
    setForm((f) => {
      // Reset supplier offer if it doesn't match new product
      const offerStillValid = productId && f.supplier_offer_id
        ? offers.find((o) => o.id === f.supplier_offer_id)?.product_id === productId
        : false;
      const catEntry = productId ? catalog.find((p) => p.id === productId) : null;
      return {
        ...f,
        product_id: productId,
        supplier_offer_id: offerStillValid ? f.supplier_offer_id : null,
        unit: catEntry?.base_unit || f.unit,
      };
    });

    // Fetch product context for richer data
    if (productId) {
      setLoadingProduct(true);
      fetch(`/api/automation/product-context?catalog_entry_id=${productId}`)
        .then((r) => {
          if (!r.ok) throw new Error("Failed to load product context");
          return r.json() as Promise<ProductContext>;
        })
        .then((ctx) => {
          setProductContext(ctx);
          // Auto-fill from catalog entry
          const catEntry = ctx.catalogEntry;
          if (catEntry) {
            setForm((f) => ({
              ...f,
              buy_price_per_unit: catEntry.base_price || f.buy_price_per_unit,
              unit: catEntry.base_unit || f.unit,
              loading_port: f.loading_port || "",
            }));
          }
          toast.success("Product data loaded", { description: "Price, unit & HS code auto-filled." });
        })
        .catch(() => {
          toast.error("Failed to load product context.");
          setProductContext(null);
        })
        .finally(() => setLoadingProduct(false));
    } else {
      setProductContext(null);
    }
  }

  function selectOffer(offerId: string | null) {
    setForm((f) => {
      if (!offerId) {
        return { ...f, supplier_offer_id: null };
      }
      const offer = offers.find((o) => o.id === offerId);
      if (!offer) return f;
      return {
        ...f,
        supplier_offer_id: offer.id,
        product_id: offer.product_id,
        supplier_id: offer.supplier_id,
        buy_price_per_unit: offer.unit_price,
        buy_currency: offer.currency,
        buy_incoterm: offer.incoterm,
        loading_port: f.loading_port || offer.loading_port || "",
        unit: catalog.find((p) => p.id === offer.product_id)?.base_unit || f.unit,
      };
    });
  }

  function updateLine(idx: number, patch: Partial<TradeCostLine>) {
    setLines((arr) => arr.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function addLine() {
    const defaultType = "FREIGHT";
    const ref = TRADE_COST_TYPES.find((t) => t.code === defaultType)!;
    setLines((arr) => [
      ...arr,
      {
        type: defaultType,
        label: ref.name,
        basis: ref.basis,
        value: 0,
        currency: form.buy_currency || "USD",
        amount: 0,
      },
    ]);
  }
  function removeLine(idx: number) {
    setLines((arr) => arr.filter((_, i) => i !== idx));
  }
  function changeLineType(idx: number, typeCode: string) {
    const ref = TRADE_COST_TYPES.find((t) => t.code === typeCode);
    if (!ref) return;
    setLines((arr) => arr.map((l, i) =>
      i === idx
        ? { ...l, type: typeCode, label: ref.name, basis: ref.basis }
        : l,
    ));
  }

  // ─── Auto-suggest cost lines based on incoterm ───
  function applyIncotermSuggestions() {
    const incoterm = form.buy_incoterm || "FOB";
    const suggestions = INCOTERM_COST_SUGGESTIONS[incoterm];
    if (!suggestions || suggestions.length === 0) {
      toast.info(`No suggestions available for ${incoterm}.`);
      return;
    }

    // Check if lines already exist with these types
    const existingTypes = new Set(lines.map((l) => l.type));
    const newLines: TradeCostLine[] = [];
    let added = 0;

    for (const sug of suggestions) {
      if (!existingTypes.has(sug.type)) {
        newLines.push({
          type: sug.type,
          label: sug.label,
          basis: sug.basis,
          value: sug.default_value,
          currency: form.buy_currency || "USD",
          amount: 0,
        });
        added++;
      }
    }

    if (added > 0) {
      setLines((arr) => [...arr, ...newLines]);
      toast.success(`Added ${added} cost line${added > 1 ? "s" : ""} for ${incoterm}`, {
        description: "Review and adjust values as needed.",
      });
    } else {
      toast.info("All suggested cost lines already exist.");
    }
  }

  // Live preview computation
  const preview = useMemo(() => computeTotals({ ...form, cost_lines: lines }), [form, lines]);

  async function save() {
    if (!form.name) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      const payload = { ...form, cost_lines: lines };
      const method = calc ? "PUT" : "POST";
      const url = calc ? `/api/trade-calculator/${calc.id}` : "/api/trade-calculator";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Request failed");
      }
      toast.success(calc ? "Calculation updated." : "Calculation created.");
      onSaved();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            {calc ? "Edit calculation" : "New calculation"}
          </DialogTitle>
          <DialogDescription>Build a landed cost & margin model with auto-fill and cost line suggestions.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
          <div className="md:col-span-2 space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sugar IC45 — Brazil → Montenegro (CIF)" />
          </div>

          <div className="md:col-span-2"><Separator className="my-1" /><p className="text-xs text-muted-foreground">Source</p></div>

          {/* Product select with auto-fill */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              Product
              {loadingProduct && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              {productContext && !loadingProduct && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                  <Sparkles className="size-2.5 text-amber-500" /> Auto-filled
                </Badge>
              )}
            </Label>
            <Select
              value={form.product_id || "__none__"}
              onValueChange={(v) => selectProduct(v === "__none__" ? null : v)}
            >
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__none__">No product</SelectItem>
                {catalog.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product context panel */}
          {productContext && form.product_id && (
            <div className="md:col-span-2 rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-4 text-amber-600" />
                <span className="text-sm font-medium">{productContext.catalogEntry?.name || "Product"}</span>
                {productContext.catalogEntry?.hs_code && (
                  <Badge variant="outline" className="text-xs font-mono">HS: {productContext.catalogEntry.hs_code}</Badge>
                )}
                {productContext.catalogEntry?.origin_country && (
                  <Badge variant="outline" className="text-xs">{productContext.catalogEntry.origin_country}</Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {productContext.catalogEntry?.base_unit && (
                  <div className="text-muted-foreground">Unit: {productContext.catalogEntry.base_unit}</div>
                )}
                {productContext.supplierOffers?.length > 0 && (
                  <div className="text-muted-foreground">
                    {productContext.supplierOffers.length} supplier offer{productContext.supplierOffers.length > 1 ? "s" : ""} available
                  </div>
                )}
                {productContext.tradeCalculations?.length > 0 && (
                  <div className="text-muted-foreground">
                    {productContext.tradeCalculations.length} prior calculation{productContext.tradeCalculations.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Supplier offer</Label>
            <Select
              value={form.supplier_offer_id || "__none__"}
              onValueChange={(v) => selectOffer(v === "__none__" ? null : v)}
            >
              <SelectTrigger><SelectValue placeholder="Select offer (auto-fills buy price)" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__none__">No offer</SelectItem>
                {availableOffers.map((o) => {
                  const sup = partners.find((p) => p.id === o.supplier_id);
                  return (
                    <SelectItem key={o.id} value={o.id}>
                      {sup?.name || "Unknown"} — {fmtMoney(o.unit_price, o.currency)} {o.incoterm}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Supplier select with auto-fill */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              Supplier
              {loadingSupplier && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              {supplierContext && !loadingSupplier && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                  <Sparkles className="size-2.5 text-amber-500" /> Auto-filled
                </Badge>
              )}
            </Label>
            <Select
              value={form.supplier_id || "__none__"}
              onValueChange={(v) => {
                const sid = v === "__none__" ? null : v;
                set("supplier_id", sid as string | null);
                if (sid) fetchSupplierContext(sid);
                else setSupplierContext(null);
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__none__">No supplier</SelectItem>
                {supplierPartners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supplier context panel */}
          {supplierContext && form.supplier_id && (
            <div className="md:col-span-2 rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="size-4 text-amber-600" />
                <span className="text-sm font-medium">{supplierContext.partner.name}</span>
                <Badge variant="outline" className="text-xs">{supplierContext.partner.type}</Badge>
                {supplierContext.partner.country && (
                  <Badge variant="outline" className="text-xs">{supplierContext.partner.country}</Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {supplierContext.partner.preferred_incoterm && (
                  <div className="flex items-center gap-1.5">
                    <Ship className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Incoterm: {supplierContext.partner.preferred_incoterm}</span>
                  </div>
                )}
                {supplierContext.partner.preferred_currency && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Currency: {supplierContext.partner.preferred_currency}</span>
                  </div>
                )}
                {supplierContext.partner.address_line && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{[supplierContext.partner.address_line, supplierContext.partner.city, supplierContext.partner.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {supplierContext.supplierOffers?.length > 0 && (
                  <div className="text-muted-foreground">
                    {supplierContext.supplierOffers.length} active offer{supplierContext.supplierOffers.length > 1 ? "s" : ""}
                  </div>
                )}
                {supplierContext.tradeCalculations?.length > 0 && (
                  <div className="text-muted-foreground">
                    {supplierContext.tradeCalculations.length} prior calculation{supplierContext.tradeCalculations.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Buyer</Label>
            <Select
              value={form.buyer_id || "__none__"}
              onValueChange={(v) => set("buyer_id", v === "__none__" ? null : v)}
            >
              <SelectTrigger><SelectValue placeholder="Select buyer" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__none__">No buyer</SelectItem>
                {buyerPartners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2"><Separator className="my-1" /><p className="text-xs text-muted-foreground">Quantity & Transport</p></div>
          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input type="number" min={0} value={form.quantity ?? 0} onChange={(e) => set("quantity", Number(e.target.value))} className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={form.unit || "MT"} onValueChange={(v) => set("unit", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {UNITS_OF_MEASURE.map((u) => (
                  <SelectItem key={u.code} value={u.code}>
                    <span className="font-mono mr-2">{u.code}</span> {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Num containers</Label>
            <Input type="number" min={0} value={form.num_containers ?? 1} onChange={(e) => set("num_containers", Number(e.target.value))} className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Container type</Label>
            <Select value={form.container_type || "40HC"} onValueChange={(v) => set("container_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {CONTAINER_TYPES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="font-mono mr-2">{c.code}</span> {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Transport mode</Label>
            <Select value={form.transport_mode || "SEA"} onValueChange={(v) => set("transport_mode", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRANSPORT_MODES.map((t) => (
                  <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2"><Separator className="my-1" /><p className="text-xs text-muted-foreground">Buy Side</p></div>
          <div className="space-y-1.5">
            <Label>Buy price / unit</Label>
            <Input type="number" min={0} step="0.01" value={form.buy_price_per_unit ?? 0} onChange={(e) => set("buy_price_per_unit", Number(e.target.value))} className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Buy currency</Label>
            <Select value={form.buy_currency || "USD"} onValueChange={(v) => set("buy_currency", v)}>
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
            <Label>Buy incoterm</Label>
            <Select value={form.buy_incoterm || "FOB"} onValueChange={(v) => set("buy_incoterm", v)}>
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
            <Label>Loading port</Label>
            <Input value={form.loading_port || ""} onChange={(e) => set("loading_port", e.target.value)} placeholder="e.g. Santos" />
          </div>

          <div className="md:col-span-2"><Separator className="my-1" /><p className="text-xs text-muted-foreground">Sell Side</p></div>
          <div className="space-y-1.5">
            <Label>Sell price / unit</Label>
            <Input type="number" min={0} step="0.01" value={form.sell_price_per_unit ?? 0} onChange={(e) => set("sell_price_per_unit", Number(e.target.value))} className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label>Sell currency</Label>
            <Select value={form.sell_currency || "USD"} onValueChange={(v) => set("sell_currency", v)}>
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
            <Label>Sell incoterm</Label>
            <Select value={form.sell_incoterm || "CIF"} onValueChange={(v) => set("sell_incoterm", v)}>
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
            <Label>Delivery port</Label>
            <Input value={form.delivery_port || ""} onChange={(e) => set("delivery_port", e.target.value)} placeholder="e.g. Bar" />
          </div>
          <div className="space-y-1.5">
            <Label>Exchange rate</Label>
            <Input type="number" min={0} step="0.0001" value={form.exchange_rate ?? 1} onChange={(e) => set("exchange_rate", Number(e.target.value))} className="tabular" />
          </div>

          {/* Cost lines editor */}
          <div className="md:col-span-2">
            <Separator className="my-1" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Cost lines (freight, duties, fees…)</p>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={applyIncotermSuggestions} title="Auto-suggest cost lines based on selected incoterm">
                  <Lightbulb className="size-3.5 mr-1" /> Suggest for {form.buy_incoterm || "FOB"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={addLine}>
                  <Plus className="size-3.5 mr-1" /> Add cost line
                </Button>
              </div>
            </div>
            {lines.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center border border-dashed border-border rounded-md">
                No cost lines. Click &ldquo;Suggest&rdquo; to auto-add based on incoterm, or &ldquo;Add cost line&rdquo; manually.
              </p>
            ) : (
              <div className="space-y-2">
                {lines.map((l, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12 sm:col-span-3">
                      <Select value={l.type} onValueChange={(v) => changeLineType(idx, v)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {EDITABLE_COST_TYPES.map((t) => (
                            <SelectItem key={t.code} value={t.code}>
                              <span className="font-mono mr-2 text-xs">{t.code}</span> <span className="text-xs">{t.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-12 sm:col-span-3">
                      <Input
                        value={l.label}
                        onChange={(e) => updateLine(idx, { label: e.target.value })}
                        placeholder="Label"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Badge variant="secondary" className="font-mono w-full justify-center py-1.5">{l.basis}</Badge>
                    </div>
                    <div className="col-span-5 sm:col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={l.value}
                        onChange={(e) => updateLine(idx, { value: Number(e.target.value) })}
                        className="h-9 text-xs tabular"
                        placeholder={l.basis === "percent" ? "%" : "Amount"}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Select value={l.currency} onValueChange={(v) => updateLine(idx, { currency: v })}>
                        <SelectTrigger className="h-9 text-xs px-2"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.value} value={c.value} className="text-xs">
                              <span className="font-mono">{c.value}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button type="button" size="icon" variant="ghost" className="size-9 text-destructive" onClick={() => removeLine(idx)} title="Remove">
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live preview */}
          <div className="md:col-span-2">
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground mb-2">Live preview (auto-calculated)</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 rounded-md bg-muted/30 border border-border/60">
              <PreviewCell label="Buy Total" value={fmtMoney(preview.buyTotal, form.buy_currency || "USD")} />
              <PreviewCell label="Landed Cost" value={fmtMoney(preview.landedCost, form.buy_currency || "USD")} />
              <PreviewCell label="Sell Revenue" value={fmtMoney(preview.sellTotal, form.sell_currency || "USD")} />
              <PreviewCell
                label="Margin"
                value={fmtMoney(preview.margin, form.sell_currency || "USD")}
                accent={preview.margin >= 0 ? "text-chart-1" : "text-destructive"}
              />
              <PreviewCell
                label="Margin %"
                value={`${preview.marginPct.toFixed(2)}%`}
                accent={preview.marginPct >= 0 ? "text-chart-1" : "text-destructive"}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Backend recomputes final totals on save using the same algorithm.
            </p>
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

function PreviewCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold tabular ${accent || ""}`}>{value}</p>
    </div>
  );
}

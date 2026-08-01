"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Plus, Search, Package, Pencil, Trash2, Eye, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronRight, Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtMoney, fmtNumber, fmtDate, fmtRelative } from "@/lib/utils/format";
import { Product } from "@/lib/supabase/types";
import { CURRENCIES, PRODUCT_CATEGORIES_LOCAL, PRODUCT_UNITS } from "@/lib/data/reference";

// Units and categories are now sourced from reference data

type StockStatus = "ok" | "low" | "out";

function stockStatus(p: Product): StockStatus {
  if (p.stock <= 0) return "out";
  if (p.stock <= p.reorder_level) return "low";
  return "ok";
}

export function ProductsView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      const r = await fetch(`/api/products?${params}`);
      if (!r.ok) throw new Error("Failed to load products");
      return r.json() as Promise<{ items: Product[]; total: number }>;
    },
  });

  const items = data?.items || [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => { if (p.category) set.add(p.category); });
    return Array.from(set).sort();
  }, [items]);

  const selected = useMemo(
    () => items.find((p) => p.id === detailId) || null,
    [items, detailId],
  );

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Product deleted.");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${data?.total ?? 0} total`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> New product
          </Button>
        }
      />

      <Card className="mb-4 border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
              icon={<Package className="size-6" />}
              title="No products"
              description="Add your first product to populate the catalog."
              action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New product</Button>}
            />
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-28">SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((p) => {
                    const st = stockStatus(p);
                    return (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setDetailId(p.id)}
                      >
                        <TableCell className="font-mono text-xs tabular">{p.sku}</TableCell>
                        <TableCell>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.unit}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {p.category
                            ? <Badge variant="outline">{p.category}</Badge>
                            : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular">{fmtMoney(p.price, p.currency)}</TableCell>
                        <TableCell className="text-right">
                          {st === "out" ? (
                            <span className="inline-flex items-center gap-1 text-destructive font-medium tabular">
                              <AlertTriangle className="size-3.5" /> {fmtNumber(p.stock)}
                            </span>
                          ) : st === "low" ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-medium tabular">
                              <AlertTriangle className="size-3.5" /> {fmtNumber(p.stock)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium tabular">
                              <CheckCircle2 className="size-3.5" /> {fmtNumber(p.stock)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.active
                            ? <Badge>Active</Badge>
                            : <Badge variant="secondary">Inactive</Badge>}
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
        </CardContent>
      </Card>

      {/* Form dialog */}
      <ProductFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        product={editing}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["products"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="size-5" />
              {selected?.name || "Product"}
            </SheetTitle>
            <SheetDescription className="font-mono">{selected?.sku}</SheetDescription>
          </SheetHeader>
          {selected ? (
            <ProductDetail product={selected} />
          ) : (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Inventory history and related offers may lose their reference.
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
function ProductDetail({ product }: { product: Product }) {
  const st = stockStatus(product);
  const margin = product.cost && product.cost > 0 && product.price > 0
    ? Math.round(((product.price - product.cost) / product.price) * 100)
    : null;

  const info = [
    { label: "Unit", value: product.unit },
    { label: "Category", value: product.category || null },
    { label: "Price", value: fmtMoney(product.price, product.currency) },
    { label: "Cost", value: product.cost ? fmtMoney(product.cost, product.currency) : null },
    { label: "Margin", value: margin !== null ? `${margin}%` : null },
    { label: "Stock", value: fmtNumber(product.stock) },
    { label: "Reorder level", value: fmtNumber(product.reorder_level) },
  ].filter((x) => x.value);

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={product.active ? "default" : "secondary"}>
          {product.active ? "Active" : "Inactive"}
        </Badge>
        {product.category && <Badge variant="outline">{product.category}</Badge>}
        {st === "out" && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="size-3" /> Out of stock
          </Badge>
        )}
        {st === "low" && (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
            <AlertTriangle className="size-3" /> Low stock
          </Badge>
        )}
        {st === "ok" && (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
            <CheckCircle2 className="size-3" /> In stock
          </Badge>
        )}
      </div>

      {product.description && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/50">{product.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {info.map((x) => (
          <Card key={x.label} className="border-border/60 shadow-soft rounded-xl">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{x.label}</p>
              <p className="text-sm font-medium mt-0.5 break-words tabular">{x.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Attributes</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(product.attributes).map(([k, v]) => (
              <Badge key={k} variant="secondary" className="font-mono text-xs">
                {k}: {String(v)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t space-y-1">
        <p className="text-xs text-muted-foreground">Created: {fmtDate(product.created_at)}</p>
        <p className="text-xs text-muted-foreground">Updated: {fmtRelative(product.updated_at)}</p>
      </div>
    </div>
  );
}

// ---- SKU auto-generation ----
function generateSku(name: string): string {
  if (!name.trim()) return "";
  const words = name.trim().split(/\s+/);
  const parts = words.map((w) =>
    w.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "")
  );
  const suffix = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return parts.join("-") + "-" + suffix;
}

// ---- Form dialog ----
function ProductFormDialog({
  open, onOpenChange, product, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useMemo(() => {
    if (open) {
      setForm(product ? { ...product } : {
        unit: "pcs",
        currency: "EUR",
        stock: 0,
        reorder_level: 0,
        active: true,
        price: 0,
        cost: 0,
        attributes: null,
      });
      // Open collapsibles when editing (so user can see all fields)
      setPricingOpen(!!product);
      setDetailsOpen(!!product);
    }
  }, [open, product]);

  function set<K extends keyof Product>(k: K, v: Product[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const handleAutoSku = useCallback(() => {
    const sku = generateSku(form.name || "");
    if (sku) set("sku", sku);
  }, [form.name]);

  async function save() {
    if (!form.name) { toast.error("Name is required."); return; }
    // Auto-generate SKU if not provided
    if (!form.sku && form.name) {
      set("sku", generateSku(form.name));
    }
    setSaving(true);
    try {
      const method = product ? "PUT" : "POST";
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const body = { ...form, sku: form.sku || generateSku(form.name || "") };
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Request failed");
      }
      toast.success(product ? "Product updated." : "Product created.");
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
          <DialogTitle>{product ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product details." : "Start with the basics — you can add more details later."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="space-y-4 py-2">
          {/* ── Essential fields (always visible) ── */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Product name *</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Aluminum Rod"
                className="h-11 text-base"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price *</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price ?? 0}
                  onChange={(e) => set("price", Number(e.target.value))}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ── Pricing & Inventory (collapsible) ── */}
          <Collapsible open={pricingOpen} onOpenChange={setPricingOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {pricingOpen ? (
                  <ChevronDown className="size-4 transition-transform" />
                ) : (
                  <ChevronRight className="size-4 transition-transform" />
                )}
                Pricing & Inventory
                {!pricingOpen && (form.cost || form.stock || form.reorder_level) && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">filled</Badge>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 pb-2">
                <div className="space-y-1.5">
                  <Label>Cost</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.cost ?? 0}
                    onChange={(e) => set("cost", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.stock ?? 0}
                    onChange={(e) => set("stock", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Reorder level</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.reorder_level ?? 0}
                    onChange={(e) => set("reorder_level", Number(e.target.value))}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* ── Details (collapsible) ── */}
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {detailsOpen ? (
                  <ChevronDown className="size-4 transition-transform" />
                ) : (
                  <ChevronRight className="size-4 transition-transform" />
                )}
                Details
                {!detailsOpen && (form.sku || form.category || form.description) && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">filled</Badge>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-1 pb-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>SKU</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      onClick={handleAutoSku}
                    >
                      <Wand2 className="size-3" /> Auto
                    </Button>
                  </div>
                  <Input
                    value={form.sku || ""}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="Auto-generated from name"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={form.category || ""} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {PRODUCT_CATEGORIES_LOCAL.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={form.description || ""}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Optional product description…"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
                  <Switch checked={!!form.active} onCheckedChange={(v) => set("active", v)} />
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Active products are available for new offers.</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
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

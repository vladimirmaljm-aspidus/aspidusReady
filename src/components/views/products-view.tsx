"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis,
} from "@/components/ui/pagination";
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

const PAGE_SIZE = 20;

type StockStatus = "ok" | "low" | "out";

function stockStatus(p: Product): StockStatus {
  if (p.stock <= 0) return "out";
  if (p.stock <= p.reorder_level) return "low";
  return "ok";
}

// ---- Pagination helper ----
function generatePageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function ProductsView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSearchChange = useCallback((v: string) => { setSearch(v); setPage(1); }, []);
  const handleCategoryChange = useCallback((v: string) => { setCategoryFilter(v); setPage(1); }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, categoryFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String((page - 1) * PAGE_SIZE));
      const r = await fetch(`/api/products?${params}`);
      if (!r.ok) throw new Error("Failed to load products");
      return r.json() as Promise<{ items: Product[]; total: number }>;
    },
  });

  const items = data?.items || [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
        description={`${total} total`}
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
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
            <>
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto custom-scroll">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {generatePageNumbers(page, totalPages).map((p, i) =>
                        p === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={page === p}
                              onClick={() => setPage(p as number)}
                              className="cursor-pointer"
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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

  // Known imported data keys that should be displayed with nice labels
  const IMPORTED_KEY_LABELS: Record<string, string> = {
    hs_code: "HS Code",
    brand: "Brand",
    shelf_life: "Shelf Life",
    image_url: "Image URL",
    logistics: "Logistics",
    coa_params: "COA Parameters",
    tags: "Tags",
    inventory: "Inventory",
  };

  // Separate imported data fields from generic attributes
  const attributes = product.attributes || {};
  const importedEntries = Object.entries(attributes).filter(([k]) => k in IMPORTED_KEY_LABELS);
  const otherEntries = Object.entries(attributes).filter(([k]) => !(k in IMPORTED_KEY_LABELS));

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

      {/* Imported data fields (hs_code, brand, shelf_life, image_url, logistics, coa_params, tags, inventory) */}
      {importedEntries.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Product Details</p>
          <div className="grid grid-cols-2 gap-2">
            {importedEntries.map(([k, v]) => (
              <Card key={k} className="border-border/60 shadow-soft rounded-xl">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">{IMPORTED_KEY_LABELS[k]}</p>
                  <p className="text-sm font-medium mt-0.5 break-words">
                    {k === "image_url" && typeof v === "string" ? (
                      <a href={v} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{v}</a>
                    ) : k === "tags" && Array.isArray(v) ? (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {v.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    ) : k === "inventory" && typeof v === "object" && v !== null ? (
                      <span className="font-mono text-xs">{JSON.stringify(v)}</span>
                    ) : k === "coa_params" && typeof v === "object" && v !== null ? (
                      <div className="space-y-0.5 mt-0.5">
                        {Object.entries(v as Record<string, unknown>).map(([pk, pv]) => (
                          <div key={pk} className="text-xs">
                            <span className="text-muted-foreground">{pk}:</span> {String(pv)}
                          </div>
                        ))}
                      </div>
                    ) : k === "logistics" && typeof v === "object" && v !== null ? (
                      <div className="space-y-0.5 mt-0.5">
                        {Object.entries(v as Record<string, unknown>).map(([pk, pv]) => (
                          <div key={pk} className="text-xs">
                            <span className="text-muted-foreground">{pk}:</span> {String(pv)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      String(v)
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other attributes */}
      {otherEntries.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Attributes</p>
          <div className="flex flex-wrap gap-1.5">
            {otherEntries.map(([k, v]) => (
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
  const [moreOpen, setMoreOpen] = useState(false);

  // FIX: Use useEffect instead of useMemo for side effects
  useEffect(() => {
    if (open) {
      setForm(product ? { ...product } : {
        unit: "pcs",
        currency: "USD",
        stock: 0,
        reorder_level: 0,
        active: true,
        price: 0,
        cost: 0,
        attributes: null,
      });
      // Open "More Details" when editing (so user can see all fields)
      setMoreOpen(!!product);
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
    const finalSku = form.sku || generateSku(form.name || "");
    setSaving(true);
    try {
      const method = product ? "PUT" : "POST";
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const body = { ...form, sku: finalSku };
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Request failed");
      }
      toast.success(product ? "Product updated." : "Product created successfully!");
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Price</Label>
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
                <Select value={form.unit || "pcs"} onValueChange={(v) => set("unit", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category || ""} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {PRODUCT_CATEGORIES_LOCAL.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prominent SKU auto-generate */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label>SKU</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={handleAutoSku}
                >
                  <Wand2 className="size-3.5" /> Auto-generate
                </Button>
              </div>
              <Input
                value={form.sku || ""}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="Auto-generated from name"
                className="font-mono"
              />
            </div>
          </div>

          {/* ── More Details (collapsible) ── */}
          <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {moreOpen ? (
                  <ChevronDown className="size-4 transition-transform" />
                ) : (
                  <ChevronRight className="size-4 transition-transform" />
                )}
                More Details
                {!moreOpen && (form.cost || form.description || form.currency !== "USD" || form.reorder_level) && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">filled</Badge>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-1 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <Select value={form.currency || "USD"} onValueChange={(v) => set("currency", v)}>
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
            {saving ? "Saving…" : product ? "Update" : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

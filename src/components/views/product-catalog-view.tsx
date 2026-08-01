"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  Plus, Search, Pencil, Trash2, Eye, Package, X, Boxes, Hash, Globe, Tag,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtMoney, fmtDate } from "@/lib/utils/format";
import { ProductCatalogEntry, SupplierOffer, Partner } from "@/lib/supabase/types";
import {
  PRODUCT_CATEGORIES, UNITS_OF_MEASURE, COUNTRIES, getCountry,
} from "@/lib/data/reference";

function flagEmoji(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const cc = countryCode.toUpperCase();
  const codePoints = [...cc].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

function categoryLabel(code: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.code === code)?.name || code;
}

function unitLabel(code: string): string {
  return UNITS_OF_MEASURE.find((u) => u.code === code)?.name || code;
}

const CATEGORY_BADGE: Record<string, string> = {
  AGRI: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  FOOD: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  SUGAR: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  GRAIN: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  OIL: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  METAL: "bg-muted text-muted-foreground border-border",
  CHEM: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  CMT: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  ENERGY: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  TEXTILE: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  MACHINERY: "bg-muted text-muted-foreground border-border",
  PACKAGING: "bg-secondary text-secondary-foreground border-border",
  OTHER: "bg-secondary text-secondary-foreground border-border",
};

export function ProductCatalogView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [editing, setEditing] = useState<ProductCatalogEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["product-catalog", search, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      const r = await fetch(`/api/product-catalog?${params}`);
      if (!r.ok) throw new Error("Failed to load product catalog");
      return r.json() as Promise<{ items: ProductCatalogEntry[]; total: number }>;
    },
  });

  const detail = useQuery({
    queryKey: ["product-catalog", detailId],
    queryFn: async () => {
      const r = await fetch(`/api/product-catalog/${detailId}`);
      if (!r.ok) throw new Error("Failed to load product");
      return r.json() as Promise<ProductCatalogEntry>;
    },
    enabled: !!detailId,
  });

  // Linked supplier offers for the product shown in the detail sheet
  const linkedOffers = useQuery({
    queryKey: ["supplier-offers", "by-product", detailId],
    queryFn: async () => {
      const r = await fetch(`/api/supplier-offers?product_id=${detailId}`);
      if (!r.ok) throw new Error("Failed to load offers");
      return r.json() as Promise<{ items: SupplierOffer[] }>;
    },
    enabled: !!detailId,
  });

  // Partners lookup for supplier names
  const partners = useQuery({
    queryKey: ["partners", "all"],
    queryFn: async () => {
      const r = await fetch("/api/partners?limit=500");
      if (!r.ok) throw new Error("Failed to load partners");
      return r.json() as Promise<{ items: Partner[] }>;
    },
  });

  const partnerMap = new Map((partners.data?.items || []).map((p) => [p.id, p]));

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/product-catalog/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Product deleted.");
      qc.invalidateQueries({ queryKey: ["product-catalog"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title="Product Catalog"
        description={`${data?.total ?? 0} products`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> New Product
          </Button>
        }
      />

      <Card className="mb-4 border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, HS code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">All categories</SelectItem>
              {PRODUCT_CATEGORIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
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
              icon={<Package className="size-6" />}
              title="No products"
              description="Add your first catalog product to get started."
              action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New Product</Button>}
            />
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">HS Code</TableHead>
                    <TableHead className="hidden xl:table-cell">Base Unit</TableHead>
                    <TableHead className="hidden lg:table-cell">Origin</TableHead>
                    <TableHead className="hidden xl:table-cell">Specs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((p) => {
                    const specs = p.specifications ? Object.entries(p.specifications).slice(0, 2) : [];
                    return (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setDetailId(p.id)}
                      >
                        <TableCell>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{categoryLabel(p.category)}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className={CATEGORY_BADGE[p.category] || ""}>{categoryLabel(p.category)}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="font-mono text-xs tabular text-muted-foreground">{p.hs_code || "—"}</span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">{unitLabel(p.base_unit)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm">
                            <span>{flagEmoji(p.origin_country) || "—"}</span>
                            <span className="text-muted-foreground">{p.origin_country ? getCountry(p.origin_country)?.name : "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {specs.length === 0 ? <span className="text-xs text-muted-foreground">—</span> : specs.map(([k, v]) => (
                              <Badge key={k} variant="secondary" className="font-normal">
                                <span className="text-muted-foreground mr-1">{k}:</span>{v}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.active ? "outline" : "secondary"} className={p.active ? "bg-chart-1/15 text-chart-1 border-chart-1/30" : ""}>
                            {p.active ? "Active" : "Inactive"}
                          </Badge>
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

      <ProductFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        product={editing}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["product-catalog"] });
        }}
      />

      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="size-5" />
              {detail.data?.name || "Product"}
            </SheetTitle>
            <SheetDescription>Product catalog entry</SheetDescription>
          </SheetHeader>
          {detail.isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detail.data ? (
            <ProductDetail
              product={detail.data}
              offers={linkedOffers.data?.items || []}
              partnerMap={partnerMap}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Supplier offers linked to this product may lose their reference.
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
function ProductDetail({
  product, offers, partnerMap,
}: {
  product: ProductCatalogEntry;
  offers: SupplierOffer[];
  partnerMap: Map<string, Partner>;
}) {
  const specs = product.specifications ? Object.entries(product.specifications) : [];

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={CATEGORY_BADGE[product.category] || ""}>{categoryLabel(product.category)}</Badge>
        <Badge variant={product.active ? "outline" : "secondary"} className={product.active ? "bg-chart-1/15 text-chart-1 border-chart-1/30" : ""}>
          {product.active ? "Active" : "Inactive"}
        </Badge>
        {product.origin_country && (
          <Badge variant="outline">
            <span className="mr-1">{flagEmoji(product.origin_country)}</span>{getCountry(product.origin_country)?.name}
          </Badge>
        )}
      </div>

      {product.description && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm whitespace-pre-wrap">{product.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="size-3" /> HS Code</p>
            <p className="text-sm font-mono tabular mt-1">{product.hs_code || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Boxes className="size-3" /> Base unit</p>
            <p className="text-sm mt-1">{unitLabel(product.base_unit)}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Tag className="size-3" /> Specifications</p>
        {specs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No specifications recorded.</p>
        ) : (
          <div className="border border-border/60 rounded-md divide-y divide-border/60">
            {specs.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between p-2 text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium tabular">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="size-3" /> Supplier offers ({offers.length})</p>
        </div>
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No supplier offers linked to this product yet.</p>
        ) : (
          <div className="border border-border/60 rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="h-8 text-xs">Supplier</TableHead>
                  <TableHead className="h-8 text-xs text-right">Unit price</TableHead>
                  <TableHead className="h-8 text-xs">Incoterm</TableHead>
                  <TableHead className="h-8 text-xs hidden sm:table-cell">Origin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((o) => {
                  const supplier = partnerMap.get(o.supplier_id);
                  return (
                    <TableRow key={o.id} className="text-xs">
                      <TableCell className="font-medium">{supplier?.name || "—"}</TableCell>
                      <TableCell className="text-right tabular">{fmtMoney(o.unit_price, o.currency)}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono">{o.incoterm}</Badge></TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="mr-1">{flagEmoji(o.origin_country)}</span>
                        <span className="text-muted-foreground">{o.origin_country ? getCountry(o.origin_country)?.name : "—"}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="pt-3 border-t">
        <p className="text-xs text-muted-foreground">Updated {fmtDate(product.updated_at)}</p>
      </div>
    </div>
  );
}

// ---- Form dialog ----
function ProductFormDialog({
  open, onOpenChange, product, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: ProductCatalogEntry | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<ProductCatalogEntry>>({});
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const baseSpecs = product?.specifications
        ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) }))
        : [];
      setForm(product
        ? { ...product }
        : ({
            name: "", category: "OTHER", hs_code: "", description: "",
            base_unit: "MT", origin_country: null, active: true,
          } as Partial<ProductCatalogEntry>));
      setSpecs(baseSpecs);
    }
  }, [open, product]);

  function set<K extends keyof ProductCatalogEntry>(k: K, v: ProductCatalogEntry[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function updateSpec(idx: number, field: "key" | "value", v: string) {
    setSpecs((s) => s.map((row, i) => (i === idx ? { ...row, [field]: v } : row)));
  }
  function addSpec() {
    setSpecs((s) => [...s, { key: "", value: "" }]);
  }
  function removeSpec(idx: number) {
    setSpecs((s) => s.filter((_, i) => i !== idx));
  }

  async function save() {
    if (!form.name) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      const specObj: Record<string, string> = {};
      specs.forEach((s) => {
        const k = s.key.trim();
        if (k) specObj[k] = s.value.trim();
      });
      const payload = { ...form, specifications: Object.keys(specObj).length ? specObj : null };
      const method = product ? "PUT" : "POST";
      const url = product ? `/api/product-catalog/${product.id}` : "/api/product-catalog";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Request failed");
      }
      toast.success(product ? "Product updated." : "Product created.");
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
          <DialogTitle>{product ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>Define a base catalog product with specifications.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
          <div className="md:col-span-2 space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Refined White Sugar ICUMSA 45" />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category || "OTHER"} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>HS code</Label>
            <Input value={form.hs_code || ""} onChange={(e) => set("hs_code", e.target.value)} placeholder="1701.99.10" className="font-mono tabular" />
          </div>

          <div className="space-y-1.5">
            <Label>Base unit</Label>
            <Select value={form.base_unit || "MT"} onValueChange={(v) => set("base_unit", v)}>
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

          <div className="md:col-span-2 space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-muted/30">
            <Switch checked={!!form.active} onCheckedChange={(v) => set("active", v)} />
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Inactive products are hidden from new offers.</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <Separator className="my-2" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Specifications (key / value pairs)</p>
              <Button type="button" size="sm" variant="outline" onClick={addSpec}>
                <Plus className="size-3.5 mr-1" /> Add spec
              </Button>
            </div>
            {specs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center border border-dashed border-border rounded-md">
                No specifications yet. Click &quot;Add spec&quot; to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {specs.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={s.key}
                      onChange={(e) => updateSpec(idx, "key", e.target.value)}
                      placeholder="Key (e.g. icumsa)"
                      className="flex-1"
                    />
                    <Input
                      value={s.value}
                      onChange={(e) => updateSpec(idx, "value", e.target.value)}
                      placeholder="Value (e.g. 45 RBU)"
                      className="flex-1"
                    />
                    <Button type="button" size="icon" variant="ghost" className="size-9 text-destructive shrink-0" onClick={() => removeSpec(idx)} title="Remove">
                      <X className="size-4" />
                    </Button>
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

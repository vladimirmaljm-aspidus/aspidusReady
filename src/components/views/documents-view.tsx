"use client";

import { useState, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Plus, Search, FileText, Trash2, Eye, EyeOff, Download, FolderOpen, Calendar, HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtDate, fmtDateTime } from "@/lib/utils/format";
import { SharedDocument, Partner } from "@/lib/supabase/types";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import { useDebounced } from "@/lib/hooks/use-debounced";

type DocCategory = SharedDocument["category"];

const CATEGORY_LABELS: Record<DocCategory, string> = {
  contract: "Contract",
  invoice: "Invoice",
  spec: "Spec",
  other: "Other",
};

function CategoryBadge({ category }: { category: DocCategory }) {
  if (category === "contract")
    return <Badge className="border-transparent bg-chart-1 text-white">{CATEGORY_LABELS[category]}</Badge>;
  if (category === "invoice")
    return <Badge className="border-transparent bg-chart-4 text-white">{CATEGORY_LABELS[category]}</Badge>;
  if (category === "spec")
    return <Badge className="border-transparent bg-chart-2 text-white">{CATEGORY_LABELS[category]}</Badge>;
  return <Badge variant="secondary">{CATEGORY_LABELS[category]}</Badge>;
}

function fmtSize(size: number | null | undefined): string {
  const s = Number(size) || 0;
  if (s < 1024) return `${s} B`;
  return `${(s / 1024).toFixed(0)} KB`;
}

export function DocumentsView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 300);
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["documents", tenantKey, debouncedSearch, partnerFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (partnerFilter !== "all") params.set("partner_id", partnerFilter);
      const r = await fetch(api(`/api/documents?${params}`));
      if (!r.ok) throw new Error("Failed to load documents");
      return r.json() as Promise<{ items: SharedDocument[]; total: number }>;
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

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/documents/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      toast.success("Document deleted.");
      qc.invalidateQueries({ queryKey: ["documents", tenantKey] });
      qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete document."),
  });

  const partnerList = partners.data?.items || [];
  const partnerName = (id: string) => partnerList.find((p) => p.id === id)?.name || "—";

  const allItems = data?.items || [];
  const items = categoryFilter === "all"
    ? allItems
    : allItems.filter((d) => d.category === categoryFilter);

  // Find selected document from list (no detail fetch — list returns all fields)
  const detail = items.find((d) => d.id === detailId) || null;

  return (
    <div>
      <PageHeader
        title="Documents"
        description={`${data?.total ?? 0} total`}
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4 mr-1" /> Add document
          </Button>
        }
      />

      <Card className="mb-4 border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by file name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={partnerFilter} onValueChange={setPartnerFilter}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Partner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All partners</SelectItem>
              {partnerList.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="spec">Spec</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title="No documents"
          description="Upload your first document."
          action={<Button onClick={() => setShowForm(true)}><Plus className="size-4 mr-1" /> Add document</Button>}
        />
      ) : (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll pr-1 -mr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-1">
            {items.map((doc) => (
              <Card
                key={doc.id}
                className="border-border/60 shadow-soft rounded-xl cursor-pointer hover:shadow-soft-md transition-shadow hover:border-foreground/20"
                onClick={() => setDetailId(doc.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="size-10 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0">
                      <FileText className="size-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <CategoryBadge category={doc.category} />
                      <span
                        className="inline-flex items-center justify-center size-6 rounded text-muted-foreground"
                        title={doc.visible_to_partner ? "Visible to partner" : "Hidden from partner"}
                      >
                        {doc.visible_to_partner ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      </span>
                    </div>
                  </div>
                  <p className="font-medium text-sm truncate" title={doc.filename}>{doc.filename}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{partnerName(doc.partner_id)}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground tabular">
                    <span>{fmtSize(doc.size)}</span>
                    <span>{fmtDate(doc.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Form dialog */}
      <DocumentFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        partners={partnerList}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["documents", tenantKey] });
          qc.invalidateQueries({ queryKey: ["dashboard", tenantKey] });
        }}
      />

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              <span className="truncate text-base">{detail?.filename || "Document"}</span>
            </SheetTitle>
            <SheetDescription>Document details</SheetDescription>
          </SheetHeader>
          {detail ? (
            <DocumentDetail
              doc={detail}
              partnerName={partnerName(detail.partner_id)}
              onDelete={() => setDeleteId(detail.id)}
            />
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
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
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
function DocumentDetail({
  doc, partnerName, onDelete,
}: {
  doc: SharedDocument;
  partnerName: string;
  onDelete: () => void;
}) {
  const info = [
    { icon: FileText, label: "File name", value: doc.filename },
    { icon: FolderOpen, label: "Category", value: CATEGORY_LABELS[doc.category] },
    { icon: HardDrive, label: "Size", value: fmtSize(doc.size) },
    { icon: FileText, label: "MIME type", value: doc.mime_type || "—" },
    { icon: Calendar, label: "Uploaded", value: fmtDateTime(doc.created_at) },
  ];

  return (
    <div className="px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <CategoryBadge category={doc.category} />
        <Badge variant={doc.visible_to_partner ? "default" : "secondary"} className="gap-1">
          {doc.visible_to_partner ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
          {doc.visible_to_partner ? "Visible to partner" : "Hidden"}
        </Badge>
      </div>

      <div className="rounded-md border border-border/60 mb-4">
        {info.map((x, i) => {
          const Icon = x.icon;
          return (
            <div
              key={x.label}
              className={`flex items-start gap-3 p-3 ${i > 0 ? "border-t" : ""}`}
            >
              <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{x.label}</p>
                <p className="text-sm break-words font-medium">{x.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground">Partner</p>
          <p className="text-sm font-medium truncate">{partnerName}</p>
        </div>
        <div className="p-3 rounded-md bg-muted/40">
          <p className="text-xs text-muted-foreground">Path</p>
          <p className="text-xs font-mono truncate" title={doc.storage_path}>{doc.storage_path || "—"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t">
        <Button variant="default" size="sm" onClick={() => {
          if (doc.storage_path) {
            const a = document.createElement("a");
            a.href = `/api/documents/${doc.id}/download`;
            a.download = doc.filename || "download";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            toast.error("No file available for download");
          }
        }}>
          <Download className="size-4 mr-1" /> Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4 mr-1" /> Delete
        </Button>
      </div>
    </div>
  );
}

// ---- Form dialog ----
function DocumentFormDialog({
  open, onOpenChange, partners, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  partners: Partner[];
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [form, setForm] = useState<Partial<SharedDocument>>({});
  const [saving, setSaving] = useState(false);

  useMemo(() => {
    if (open) {
      setForm({
        filename: "",
        partner_id: "",
        category: "other",
        visible_to_partner: false,
        mime_type: "application/pdf",
        size: 0,
        storage_path: "",
      });
    }
  }, [open]);

  function set<K extends keyof SharedDocument>(k: K, v: SharedDocument[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.filename) { toast.error("Please enter a file name."); return; }
    if (!form.partner_id) { toast.error("Please select a partner."); return; }
    setSaving(true);
    try {
      const r = await fetch(api("/api/documents"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to add document");
      }
      toast.success("Document added.");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to add document.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
          <DialogDescription>Register a new document in the library.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 py-2">
          <div className="space-y-1.5">
            <Label>File name *</Label>
            <Input
              value={form.filename || ""}
              onChange={(e) => set("filename", e.target.value)}
              placeholder="contract-2026-001.pdf"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Partner *</Label>
              <Select value={form.partner_id || ""} onValueChange={(v) => set("partner_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category || "other"} onValueChange={(v) => set("category", v as DocCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="spec">Spec</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>MIME type</Label>
              <Input
                value={form.mime_type || ""}
                onChange={(e) => set("mime_type", e.target.value)}
                placeholder="application/pdf"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Size (B)</Label>
              <Input
                type="number"
                value={form.size ?? 0}
                onChange={(e) => set("size", Number(e.target.value))}
                placeholder="0"
                className="tabular"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Storage path</Label>
            <Input
              value={form.storage_path || ""}
              onChange={(e) => set("storage_path", e.target.value)}
              placeholder="documents/2026/001.pdf"
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
            <Switch
              checked={!!form.visible_to_partner}
              onCheckedChange={(v) => set("visible_to_partner", v)}
            />
            <div>
              <p className="text-sm font-medium">Visible to partner</p>
              <p className="text-xs text-muted-foreground">Allow the partner to see this document in the portal.</p>
            </div>
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

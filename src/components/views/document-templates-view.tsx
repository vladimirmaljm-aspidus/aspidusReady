"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Pencil, Trash2, FileText, Star, Copy, Save, Eye, LayoutTemplate,
  Type, Palette, Table as TableIcon, AlignCenter, AlignJustify,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtDate } from "@/lib/utils/format";
import { DocumentTemplate } from "@/lib/supabase/types";
import { useAppStore, isAdmin } from "@/lib/store/app-store";

type TemplateType = DocumentTemplate["type"];

const TYPE_LABELS: Record<TemplateType, string> = {
  offer: "Offer", invoice: "Invoice", proforma: "Proforma", contract: "Contract", generic: "Generic",
};

const TYPE_BADGE: Record<TemplateType, string> = {
  offer: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  invoice: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  proforma: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  contract: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  generic: "bg-muted text-muted-foreground border-border",
};

const AVAILABLE_VARIABLES: { token: string; label: string }[] = [
  { token: "{{company_name}}", label: "Company name" },
  { token: "{{company_legal_name}}", label: "Legal name" },
  { token: "{{company_address}}", label: "Address" },
  { token: "{{company_email}}", label: "Email" },
  { token: "{{company_phone}}", label: "Phone" },
  { token: "{{company_vat}}", label: "VAT" },
  { token: "{{company_bank}}", label: "Bank" },
  { token: "{{company_iban}}", label: "IBAN" },
  { token: "{{company_swift}}", label: "SWIFT" },
  { token: "{{payment_terms}}", label: "Payment terms" },
];

type TemplateFormState = Omit<DocumentTemplate, "id" | "tenant_id" | "created_by" | "created_at" | "updated_at">;

function defaultTemplate(name = "Untitled template"): TemplateFormState {
  return {
    name,
    type: "offer",
    is_default: false,
    page_size: "A4",
    page_margin_top: 20,
    page_margin_bottom: 20,
    page_margin_left: 18,
    page_margin_right: 18,
    header_enabled: true,
    header_height: 24,
    header_content: "{{company_name}}\n{{company_address}} · {{company_email}} · {{company_phone}}",
    header_show_logo: true,
    header_show_company_name: true,
    header_show_contact: true,
    footer_enabled: true,
    footer_height: 18,
    footer_content: "{{company_bank}} — IBAN: {{company_iban}} — SWIFT: {{company_swift}}",
    footer_show_page_number: true,
    footer_show_bank_details: true,
    footer_show_tax_id: true,
    body_font_family: "Inter, system-ui, sans-serif",
    body_font_size: 11,
    body_line_height: 1.5,
    heading_font_family: "Helvetica-Bold",
    primary_color: "#0f766e",
    accent_color: "#0d9488",
    table_header_bg: "#0f766e",
    table_header_color: "#ffffff",
    table_border_color: "#e2e8f0",
    table_stripe: true,
  };
}

// Substitute variables in a content string with generic placeholders for preview.
function substituteForPreview(text: string): string {
  return (text || "")
    .replace(/{{company_name}}/g, "Your Company")
    .replace(/{{company_legal_name}}/g, "Your Company LLC")
    .replace(/{{company_address}}/g, "Your Address")
    .replace(/{{company_email}}/g, "info@yourcompany.com")
    .replace(/{{company_phone}}/g, "+1 000 000 0000")
    .replace(/{{company_vat}}/g, "VAT000000000")
    .replace(/{{company_bank}}/g, "Your Bank")
    .replace(/{{company_iban}}/g, "XX00 0000 0000 0000 0000 00")
    .replace(/{{company_swift}}/g, "XXXXXXXX")
    .replace(/{{payment_terms}}/g, "As agreed");
}

export function DocumentTemplatesView() {
  const qc = useQueryClient();
  const user = useAppStore((s) => s.user);
  const [editing, setEditing] = useState<DocumentTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<DocumentTemplate | null>(null);

  const admin = isAdmin(user);

  const { data, isLoading } = useQuery({
    queryKey: ["document-templates"],
    queryFn: async () => {
      const r = await fetch("/api/document-templates");
      if (!r.ok) throw new Error("Failed to load templates");
      return r.json() as Promise<{ items: DocumentTemplate[] }>;
    },
    enabled: admin,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/document-templates/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Template deleted.");
      qc.invalidateQueries({ queryKey: ["document-templates"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const setDefaultMut = useMutation({
    mutationFn: async (t: DocumentTemplate) => {
      const r = await fetch(`/api/document-templates/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...t, is_default: true }),
      });
      if (!r.ok) throw new Error("Update failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Default template updated.");
      qc.invalidateQueries({ queryKey: ["document-templates"] });
    },
    onError: () => toast.error("Failed to set default."),
  });

  const duplicateMut = useMutation({
    mutationFn: async (t: DocumentTemplate) => {
      const copy = { ...defaultTemplate(t.name + " (copy)"), type: t.type };
      const r = await fetch("/api/document-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });
      if (!r.ok) throw new Error("Duplicate failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Template duplicated.");
      qc.invalidateQueries({ queryKey: ["document-templates"] });
      setDuplicating(null);
    },
    onError: () => toast.error("Duplicate failed."),
  });

  if (!admin) {
    return (
      <div>
        <PageHeader title="Document Templates" description="Manage printable document layouts." />
        <Card className="border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/5">
          <CardContent className="p-6 flex items-start gap-3">
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <LayoutTemplate className="size-5" />
            </div>
            <div>
              <p className="font-medium">Administrator access required.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Only admin and super-admin users can manage document templates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title="Document Templates"
        description={`${items.length} template${items.length === 1 ? "" : "s"} configured`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> New Template
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title="No document templates"
          description="Create your first template to start generating branded PDFs."
          action={
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="size-4 mr-1" /> New Template
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <Card
              key={t.id}
              className="border-border/60 shadow-soft hover:shadow-soft-md transition-shadow duration-200 flex flex-col"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base truncate">{t.name}</CardTitle>
                      {t.is_default && (
                        <Star className="size-4 fill-amber-400 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={TYPE_BADGE[t.type]}>{TYPE_LABELS[t.type]}</Badge>
                      <span className="text-xs">{t.page_size}</span>
                      <span className="text-xs">·</span>
                      <span className="text-xs">{t.body_font_size}px</span>
                    </CardDescription>
                  </div>
                  <div className="size-9 rounded-lg border border-border/60 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: t.primary_color + "15" }}>
                    <div className="size-3 rounded-full" style={{ backgroundColor: t.primary_color }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end gap-3">
                <div className="text-xs text-muted-foreground">
                  Updated <span className="tabular">{fmtDate(t.updated_at)}</span>
                </div>
                <Separator />
                <div className="flex items-center gap-1 flex-wrap">
                  {!t.is_default && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => setDefaultMut.mutate(t)}
                      disabled={setDefaultMut.isPending}
                    >
                      <Star className="size-3.5 mr-1" /> Set default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={() => { setEditing(t); setShowForm(true); }}
                    title="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={() => setDuplicating(t)}
                    title="Duplicate"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-destructive"
                    onClick={() => setDeleteId(t.id)}
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <TemplateEditorDialog
        open={showForm}
        onOpenChange={setShowForm}
        template={editing}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["document-templates"] });
        }}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Documents already generated with this template will not be affected.
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

      {/* Duplicate confirm */}
      <AlertDialog open={!!duplicating} onOpenChange={(o) => !o && setDuplicating(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate template?</AlertDialogTitle>
            <AlertDialogDescription>
              Create a copy of <span className="font-medium">{duplicating?.name}</span> with the same settings. The copy will not be marked as default.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => duplicating && duplicateMut.mutate(duplicating)}
            >
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// Template editor with live preview
// ============================================================
function TemplateEditorDialog({
  open, onOpenChange, template, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  template: DocumentTemplate | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TemplateFormState>(defaultTemplate());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(template ? { ...template } : defaultTemplate());
    }
  }, [open, template]);

  function set<K extends keyof TemplateFormState>(k: K, v: TemplateFormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    if (!form.name?.trim()) {
      toast.error("Template name is required.");
      return;
    }
    setSaving(true);
    try {
      const method = template ? "PUT" : "POST";
      const url = template ? `/api/document-templates/${template.id}` : "/api/document-templates";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error("Save failed");
      toast.success(template ? "Template updated." : "Template created.");
      onSaved();
    } catch {
      toast.error("Failed to save template.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full" className="p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="size-5 text-primary" />
            {template ? "Edit template" : "New template"}
          </DialogTitle>
          <DialogDescription>
            Configure page layout, headers, footers, and table styling. Changes preview live.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
          {/* Left: settings form */}
          <div className="border-r border-border/60 min-h-0 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-6">
                {/* Basics */}
                <Section icon={FileText} title="Basics">
                  <Field label="Name">
                    <Input
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Default offer template"
                    />
                  </Field>
                  <Field label="Type">
                    <Select value={form.type} onValueChange={(v) => set("type", v as TemplateType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="proforma">Proforma</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="generic">Generic</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Default template">
                    <div className="flex items-center gap-2">
                      <Switch checked={form.is_default} onCheckedChange={(v) => set("is_default", v)} />
                      <span className="text-sm text-muted-foreground">Use as the default for this document type</span>
                    </div>
                  </Field>
                </Section>

                {/* Page */}
                <Section icon={LayoutTemplate} title="Page">
                  <Field label="Page size">
                    <Select value={form.page_size} onValueChange={(v) => set("page_size", v as "A4" | "Letter")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                        <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Margins (mm)">
                    <div className="grid grid-cols-4 gap-2">
                      <MarginInput label="Top" value={form.page_margin_top} onChange={(v) => set("page_margin_top", v)} />
                      <MarginInput label="Bottom" value={form.page_margin_bottom} onChange={(v) => set("page_margin_bottom", v)} />
                      <MarginInput label="Left" value={form.page_margin_left} onChange={(v) => set("page_margin_left", v)} />
                      <MarginInput label="Right" value={form.page_margin_right} onChange={(v) => set("page_margin_right", v)} />
                    </div>
                  </Field>
                </Section>

                {/* Header */}
                <Section icon={AlignCenter} title="Header">
                  <Field label="Enabled">
                    <div className="flex items-center gap-2">
                      <Switch checked={form.header_enabled} onCheckedChange={(v) => set("header_enabled", v)} />
                      <span className="text-sm text-muted-foreground">Show header on every page</span>
                    </div>
                  </Field>
                  {form.header_enabled && (
                    <>
                      <Field label="Height (mm)">
                        <NumberInput value={form.header_height} onChange={(v) => set("header_height", v)} min={5} max={80} />
                      </Field>
                      <Field label="Header content">
                        <Textarea
                          value={form.header_content}
                          onChange={(e) => set("header_content", e.target.value)}
                          rows={3}
                          placeholder="{{company_name}} — {{company_address}}"
                          className="font-mono text-xs"
                        />
                      </Field>
                      <div className="grid grid-cols-3 gap-2">
                        <ToggleField label="Logo" checked={form.header_show_logo} onChange={(v) => set("header_show_logo", v)} />
                        <ToggleField label="Name" checked={form.header_show_company_name} onChange={(v) => set("header_show_company_name", v)} />
                        <ToggleField label="Contact" checked={form.header_show_contact} onChange={(v) => set("header_show_contact", v)} />
                      </div>
                    </>
                  )}
                </Section>

                {/* Footer */}
                <Section icon={AlignJustify} title="Footer">
                  <Field label="Enabled">
                    <div className="flex items-center gap-2">
                      <Switch checked={form.footer_enabled} onCheckedChange={(v) => set("footer_enabled", v)} />
                      <span className="text-sm text-muted-foreground">Show footer on every page</span>
                    </div>
                  </Field>
                  {form.footer_enabled && (
                    <>
                      <Field label="Height (mm)">
                        <NumberInput value={form.footer_height} onChange={(v) => set("footer_height", v)} min={5} max={60} />
                      </Field>
                      <Field label="Footer content">
                        <Textarea
                          value={form.footer_content}
                          onChange={(e) => set("footer_content", e.target.value)}
                          rows={3}
                          placeholder="{{company_bank}} — IBAN {{company_iban}}"
                          className="font-mono text-xs"
                        />
                      </Field>
                      <div className="grid grid-cols-3 gap-2">
                        <ToggleField label="Page #" checked={form.footer_show_page_number} onChange={(v) => set("footer_show_page_number", v)} />
                        <ToggleField label="Bank" checked={form.footer_show_bank_details} onChange={(v) => set("footer_show_bank_details", v)} />
                        <ToggleField label="Tax ID" checked={form.footer_show_tax_id} onChange={(v) => set("footer_show_tax_id", v)} />
                      </div>
                    </>
                  )}
                </Section>

                {/* Body */}
                <Section icon={Type} title="Body">
                  <Field label="Font family">
                    <Input
                      value={form.body_font_family}
                      onChange={(e) => set("body_font_family", e.target.value)}
                      placeholder="Inter, system-ui, sans-serif"
                      className="font-mono text-xs"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Font size (px)">
                      <NumberInput value={form.body_font_size} onChange={(v) => set("body_font_size", v)} min={7} max={24} />
                    </Field>
                    <Field label="Line height">
                      <NumberInput value={form.body_line_height} onChange={(v) => set("body_line_height", v)} min={1} max={2.5} step={0.1} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField label="Primary color" value={form.primary_color} onChange={(v) => set("primary_color", v)} />
                    <ColorField label="Accent color" value={form.accent_color} onChange={(v) => set("accent_color", v)} />
                  </div>
                </Section>

                {/* Table */}
                <Section icon={TableIcon} title="Table">
                  <div className="grid grid-cols-1 gap-3">
                    <ColorField label="Header background" value={form.table_header_bg} onChange={(v) => set("table_header_bg", v)} />
                    <ColorField label="Header text color" value={form.table_header_color} onChange={(v) => set("table_header_color", v)} />
                    <ColorField label="Border color" value={form.table_border_color} onChange={(v) => set("table_border_color", v)} />
                    <Field label="Striped rows">
                      <div className="flex items-center gap-2">
                        <Switch checked={form.table_stripe} onCheckedChange={(v) => set("table_stripe", v)} />
                        <span className="text-sm text-muted-foreground">Alternate row background</span>
                      </div>
                    </Field>
                  </div>
                </Section>

                {/* Variables helper */}
                <Card className="bg-muted/40 border-border/60">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium mb-2">Available variables</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Use these tokens in header and footer content. They are replaced with company data at render time.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_VARIABLES.map((v) => (
                        <code
                          key={v.token}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-card border border-border/60 font-mono"
                          title={v.label}
                        >
                          {v.token}
                        </code>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>

          {/* Right: live preview */}
          <div className="bg-muted/30 min-h-0 flex flex-col">
            <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Live preview</span>
              </div>
              <Badge variant="outline" className="text-xs">{form.page_size}</Badge>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6 flex justify-center">
                <TemplatePreview form={form} />
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-5 py-4 border-t border-border/60 bg-card">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Save className="size-4 mr-1 animate-pulse" /> : <Save className="size-4 mr-1" />}
            Save template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Live preview — scaled A4 page rendering all settings
// ============================================================
function TemplatePreview({ form }: { form: TemplateFormState }) {
  // A4 = 210 × 297 mm; render at ~50% scale (1mm ≈ 1.6px is fine, but we keep aspect 1:1.414)
  const pageWidthPx = 480;
  const pageHeightPx = Math.round(pageWidthPx * 1.414);
  const mmToPx = (mm: number) => (mm / 210) * pageWidthPx;

  const headerText = useMemo(() => substituteForPreview(form.header_content), [form.header_content]);
  const footerText = useMemo(() => substituteForPreview(form.footer_content), [form.footer_content]);

  // sample data for the offer table
  const rows = [
    { sku: "SUG-IC45", name: "Refined White Sugar ICUMSA 45", qty: 24, unit: "MT", price: 540, total: 12960 },
    { sku: "WHT-1250", name: "Hard Red Winter Wheat", qty: 5000, unit: "MT", price: 285, total: 1425000 },
    { sku: "OIL-SUN", name: "Refined Sunflower Oil", qty: 80, unit: "MT", price: 1180, total: 94400 },
  ];

  return (
    <div
      className="bg-white shadow-soft-lg rounded-sm mx-auto relative overflow-hidden"
      style={{
        width: pageWidthPx,
        height: pageHeightPx,
        fontFamily: form.body_font_family,
        fontSize: form.body_font_size,
        lineHeight: form.body_line_height,
        color: "#0f172a",
        paddingTop: mmToPx(form.page_margin_top),
        paddingBottom: mmToPx(form.page_margin_bottom),
        paddingLeft: mmToPx(form.page_margin_left),
        paddingRight: mmToPx(form.page_margin_right),
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      {form.header_enabled && (
        <div
          style={{
            minHeight: mmToPx(form.header_height),
            borderBottom: `2px solid ${form.primary_color}`,
            paddingBottom: 6,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {form.header_show_logo && (
              <div
                className="rounded-md flex items-center justify-center shrink-0"
                style={{
                  width: 28, height: 28,
                  backgroundColor: form.primary_color,
                  color: form.table_header_color,
                  fontWeight: 700, fontSize: 14,
                }}
              >
                A
              </div>
            )}
            {form.header_show_company_name && (
              <div className="min-w-0">
                <div style={{ color: form.primary_color, fontWeight: 700, fontSize: 14 }}>
                  Aspidus Trading
                </div>
                {form.header_show_contact && (
                  <div style={{ fontSize: 8, color: "#64748b", whiteSpace: "pre-line" }}>
                    {headerText}
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", fontSize: 8, color: "#64748b" }}>
            <div style={{ fontWeight: 700, color: form.primary_color, fontSize: 11 }}>OFFER</div>
            <div>OF-2026-0014</div>
            <div>Date: 14 Mar 2026</div>
            <div>Valid: 14 Apr 2026</div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 min-h-0">
        {/* Recipient block */}
        <div style={{ marginBottom: 10, fontSize: 9 }}>
          <div style={{ color: "#94a3b8", fontSize: 7, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
            Bill to
          </div>
          <div style={{ fontWeight: 700 }}>Mediterra Exports GmbH</div>
          <div style={{ color: "#64748b" }}>Hafenstraße 4, 20457 Hamburg, Germany</div>
          <div style={{ color: "#64748b" }}>VAT: DE876543210</div>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.5 }}>
          <thead>
            <tr style={{ backgroundColor: form.table_header_bg, color: form.table_header_color }}>
              <th style={{ padding: "4px 6px", textAlign: "left", border: `1px solid ${form.table_border_color}` }}>SKU</th>
              <th style={{ padding: "4px 6px", textAlign: "left", border: `1px solid ${form.table_border_color}` }}>Product</th>
              <th style={{ padding: "4px 6px", textAlign: "right", border: `1px solid ${form.table_border_color}` }}>Qty</th>
              <th style={{ padding: "4px 6px", textAlign: "right", border: `1px solid ${form.table_border_color}` }}>Unit price</th>
              <th style={{ padding: "4px 6px", textAlign: "right", border: `1px solid ${form.table_border_color}` }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.sku}
                style={{
                  backgroundColor: form.table_stripe && i % 2 === 1 ? form.table_border_color + "55" : "transparent",
                }}
              >
                <td style={{ padding: "3px 6px", border: `1px solid ${form.table_border_color}`, color: form.accent_color, fontWeight: 600 }}>{r.sku}</td>
                <td style={{ padding: "3px 6px", border: `1px solid ${form.table_border_color}` }}>{r.name}</td>
                <td style={{ padding: "3px 6px", border: `1px solid ${form.table_border_color}`, textAlign: "right" }}>{r.qty} {r.unit}</td>
                <td style={{ padding: "3px 6px", border: `1px solid ${form.table_border_color}`, textAlign: "right" }}>${r.price.toLocaleString()}</td>
                <td style={{ padding: "3px 6px", border: `1px solid ${form.table_border_color}`, textAlign: "right", fontWeight: 600 }}>${r.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ fontSize: 9, minWidth: 160 }}>
            <Row label="Subtotal" value="$1,532,360" />
            <Row label="Discount (5%)" value="-$76,618" />
            <Row label="VAT (10%)" value="$145,574" />
            <div
              style={{
                marginTop: 4, paddingTop: 4,
                borderTop: `2px solid ${form.primary_color}`,
                display: "flex", justifyContent: "space-between",
                fontWeight: 700, color: form.primary_color,
              }}
            >
              <span>Total</span>
              <span>$1,601,316</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 8, color: "#64748b" }}>
          <div style={{ color: form.primary_color, fontWeight: 600, marginBottom: 2 }}>Payment terms</div>
          30% advance, 70% before shipment. Delivery CIF Hamburg port. Inspection by SGS at loading.
        </div>
      </div>

      {/* Footer */}
      {form.footer_enabled && (
        <div
          style={{
            minHeight: mmToPx(form.footer_height),
            borderTop: `1px solid ${form.table_border_color}`,
            paddingTop: 6,
            marginTop: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 7.5,
            color: "#64748b",
            gap: 8,
          }}
        >
          <div style={{ whiteSpace: "pre-line", flex: 1 }}>
            {footerText}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {form.footer_show_tax_id && <div>VAT: RS123456789</div>}
            {form.footer_show_page_number && <div style={{ color: form.accent_color, fontWeight: 600 }}>Page 1 of 1</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1px 0", color: "#475569" }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ============================================================
// Form building blocks
// ============================================================
function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="size-3.5" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-3 pl-1">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function MarginInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-8 text-sm tabular"
        min={0}
        max={60}
      />
    </div>
  );
}

function NumberInput({
  value, onChange, min, max, step,
}: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="h-8 text-sm tabular"
      min={min}
      max={max}
      step={step}
    />
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 px-2 py-1.5">
      <Switch checked={checked} onCheckedChange={onChange} className="scale-90" />
      <span className="text-xs">{label}</span>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 rounded-md border border-border/60 cursor-pointer bg-card p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 font-mono text-xs flex-1"
        />
      </div>
    </div>
  );
}

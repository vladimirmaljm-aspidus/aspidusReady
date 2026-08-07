"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  Plus, Pencil, Trash2, FileText, Star, Copy, Save, Eye, LayoutTemplate,
  Type, Palette, Table as TableIcon, AlignCenter, AlignJustify,
  Building2, Stamp, ShieldCheck, Upload, ImageIcon, X, Lock,
  Waves, Droplet, RotateCw, MapPin, Pen, Layers, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { TemplateVisualEditor } from "@/components/common/template-visual-editor";
import { BankAccountSelector } from "@/components/common/bank-account-selector";
import {
  TemplateContentEditor,
  parseContentConfig,
  substitutePlaceholders,
  DEFAULT_HEADER_CONTENT_JSON,
  DEFAULT_FOOTER_CONTENT_JSON,
  type ContentSegment,
} from "@/components/common/template-content-editor";
import { fmtDate } from "@/lib/utils/format";
import {
  DocumentTemplate, TenantLetterhead, TenantSeal, Tenant,
} from "@/lib/supabase/types";
import { useAppStore, isAdmin, isSuperAdmin } from "@/lib/store/app-store";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  STARTER_TEMPLATES,
  type StarterTemplate,
} from "@/lib/data/starter-templates";

// ============================================================
// Constants
// ============================================================

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
  { token: "{{page_number}}", label: "Page #" },
  { token: "{{doc_number}}", label: "Doc #" },
];

const HEADER_LAYOUTS = [
  { value: "logo-left-info-right", label: "Logo left · info right" },
  { value: "logo-right-info-left", label: "Logo right · info left" },
  { value: "logo-center", label: "Logo centered" },
  { value: "text-only", label: "Text only (no logo)" },
  { value: "two-column", label: "Two columns" },
];

const FOOTER_LAYOUTS = [
  { value: "bank-contact-tax", label: "Bank · contact · tax" },
  { value: "bank-only", label: "Bank only" },
  { value: "contact-only", label: "Contact only" },
  { value: "tax-id-only", label: "Tax ID only" },
  { value: "custom", label: "Custom footer text" },
];

const SEAL_POSITIONS: { value: TenantSeal["position"]; label: string }[] = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
];

const SEAL_DOC_TYPES: { value: string; label: string }[] = [
  { value: "offer", label: "Offers" },
  { value: "invoice", label: "Invoices" },
  { value: "proforma", label: "Proformas" },
  { value: "contract", label: "Contracts" },
];

// ============================================================
// Helpers
// ============================================================

function substituteForPreview(text: string): string {
  return (text || "")
    .replace(/{{company_name}}/g, "Aspidus Trading")
    .replace(/{{company_legal_name}}/g, "Aspidus Trading LLC")
    .replace(/{{company_address}}/g, "Trg Republike 5, Belgrade")
    .replace(/{{company_email}}/g, "office@aspidus.com")
    .replace(/{{company_phone}}/g, "+381 11 555 0100")
    .replace(/{{company_vat}}/g, "RS123456789")
    .replace(/{{company_bank}}/g, "Raiffeisen Bank")
    .replace(/{{company_iban}}/g, "RS35 2600 0560 0012 3456 78")
    .replace(/{{company_swift}}/g, "RAFRCSBG")
    .replace(/{{payment_terms}}/g, "30% advance, 70% before shipment")
    .replace(/{{page_number}}/g, "1")
    .replace(/{{doc_number}}/g, "OF-2026-0014");
}

// Sample data used by the live preview to substitute the new {placeholder}
// tokens introduced by the TemplateContentEditor. The legacy {{token}}
// syntax is handled by substituteForPreview() above.
const PREVIEW_PLACEHOLDER_DATA = {
  company_name: "Aspidus Trading",
  company_address: "Trg Republike 5, Belgrade",
  company_city: "Belgrade",
  company_country: "Serbia",
  company_reg: "RS-12345678",
  company_vat: "RS123456789",
  company_tax_id: "Tax-001",
  company_phone: "+381 11 555 0100",
  company_email: "office@aspidus.com",
  company_website: "aspidus.com",
  bank_name: "Raiffeisen Bank",
  bank_iban: "RS35 2600 0560 0012 3456 78",
  bank_swift: "RAFRCSBG",
  doc_number: "OF-2026-0014",
  doc_date: "14 Mar 2026",
  valid_until: "14 Apr 2026",
  due_date: "14 Apr 2026",
  partner_name: "Mediterra Exports GmbH",
  partner_address: "Hafenstraße 4, 20457 Hamburg, Germany",
  total: "$1,601,316",
  currency: "USD",
  page_number: 1,
  total_pages: 1,
};

/**
 * Resolve raw `header_content` / `footer_content` (which may be either the
 * new JSON {segments:[…]} format or the legacy plain-text format) into a
 * list of styled segments with placeholders substituted for the live preview.
 */
function resolvePreviewSegments(content: string): ContentSegment[] {
  const cfg = parseContentConfig(content);
  if (cfg) {
    return cfg.segments.map((s) => ({
      ...s,
      text: substitutePlaceholders(s.text, PREVIEW_PLACEHOLDER_DATA),
    }));
  }
  // Fallback: legacy plain text — render as one muted line.
  return [
    {
      id: "legacy",
      text: substituteForPreview(content || ""),
      fontSize: 8,
      bold: false,
      italic: false,
      color: "#64748b",
      alignment: "left",
    },
  ];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function parseApplyToTypes(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.filter((x) => typeof x === "string");
  } catch {
    // ignore
  }
  return [];
}

function serializeApplyToTypes(arr: string[]): string {
  return JSON.stringify(arr);
}

// ============================================================
// Default form states
// ============================================================

type LetterheadFormState = Omit<TenantLetterhead, "id" | "tenant_id" | "created_by" | "created_at" | "updated_at">;

function defaultLetterhead(name = "Untitled letterhead"): LetterheadFormState {
  return {
    name,
    is_default: false,
    company_name: "",
    company_legal_name: "",
    company_address_line: "",
    company_city: "",
    company_postal_code: "",
    company_country: "",
    company_email: "",
    company_phone: "",
    company_website: "",
    company_vat_number: "",
    company_tax_id: "",
    company_registration_number: "",
    bank_name: "",
    bank_iban: "",
    bank_swift: "",
    bank_account_holder: "",
    logo_url: null,
    logo_position: "left",
    logo_width_mm: 40,
    logo_height_mm: 15,
    logo_lock_aspect: true,
    primary_color: "#0f766e",
    accent_color: "#0d9488",
    text_color: "#0f172a",
    muted_text_color: "#64748b",
    page_size: "A4",
    margin_top_mm: 25,
    margin_bottom_mm: 25,
    margin_left_mm: 20,
    margin_right_mm: 20,
    header_height_mm: 35,
    footer_height_mm: 28,
    header_layout: "logo-left-info-right",
    header_show_logo: true,
    header_show_company_name: true,
    header_show_contact: true,
    header_show_vat: false,
    header_divider: true,
    header_divider_color: "#e2e8f0",
    header_custom_html: null,
    footer_layout: "bank-contact-tax",
    footer_show_bank_details: true,
    footer_show_contact: true,
    footer_show_tax_id: true,
    footer_show_page_number: true,
    footer_divider: true,
    footer_divider_color: "#e2e8f0",
    footer_custom_html: null,
    footer_text: "",
    watermark_enabled: false,
    watermark_text: "DRAFT",
    watermark_color: "#94a3b8",
    watermark_opacity: 0.08,
    watermark_rotation: -45,
    body_font_family: "Inter, system-ui, sans-serif",
    body_font_size_pt: 11,
    heading_font_family: "Inter, system-ui, sans-serif",
    heading_font_size_pt: 16,
  };
}

type SealFormState = Omit<TenantSeal, "id" | "tenant_id" | "created_by" | "created_at" | "updated_at">;

function defaultSeal(name = "Untitled seal"): SealFormState {
  return {
    name,
    is_default: false,
    image_url: "",
    image_width_mm: 35,
    image_height_mm: 35,
    image_format: "png",
    position: "bottom-right",
    offset_x_mm: 0,
    offset_y_mm: 0,
    opacity: 1,
    rotation_deg: 0,
    apply_to_types: "[]",
    signature_enabled: false,
    signature_label: "Authorized signature",
    signature_name: "",
  };
}

type TemplateFormState = Omit<DocumentTemplate, "id" | "tenant_id" | "created_by" | "created_at" | "updated_at" | "letterhead" | "seal">;

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
    header_content: DEFAULT_HEADER_CONTENT_JSON,
    header_show_logo: true,
    header_show_company_name: true,
    header_show_contact: true,
    footer_enabled: true,
    footer_height: 18,
    footer_content: DEFAULT_FOOTER_CONTENT_JSON,
    footer_show_page_number: true,
    footer_show_bank_details: true,
    footer_show_tax_id: true,
    body_font_family: "Inter, system-ui, sans-serif",
    body_font_size: 11,
    body_line_height: 1.5,
    primary_color: "#0f766e",
    accent_color: "#0d9488",
    table_header_bg: "#0f766e",
    table_header_color: "#ffffff",
    table_border_color: "#e2e8f0",
    table_stripe: true,
    letterhead_id: null,
    seal_id: null,
    seal_enabled: true,
    selected_bank_accounts: null,
  };
}

// ============================================================
// Main view component
// ============================================================

export function DocumentTemplatesView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const user = useAppStore((s) => s.user);
  const admin = isAdmin(user);
  const superAdmin = isSuperAdmin(user);
  const [activeTab, setActiveTab] = useState<string>("letterheads");

  // Tenant selector state — only used when super_admin
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(user?.tenant_id ?? null);

  const tenantsQ = useQuery<{ items: Tenant[] }>({
    queryKey: ["tenants", tenantKey, "list"],
    queryFn: async () => {
      const r = await fetch(api("/api/tenants"));
      if (!r.ok) throw new Error("Failed to load tenants");
      return r.json();
    },
    enabled: superAdmin,
  });

  const tenants = tenantsQ.data?.items ?? [];

  // Auto-select first tenant when super_admin and none selected
  if (superAdmin && !selectedTenantId && tenants.length > 0) {
    setSelectedTenantId(tenants[0].id);
  }

  // Build query string for tenant-scoped API calls
  const tenantQuery = superAdmin && selectedTenantId ? `?tenant_id=${encodeURIComponent(selectedTenantId)}` : "";

  if (!admin) {
    return (
      <div>
        <PageHeader title="Document Templates" description="Manage branded letterheads, company seals, and document templates." />
        <Card className="border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/5">
          <CardContent className="p-6 flex items-start gap-3">
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <Lock className="size-5" />
            </div>
            <div>
              <p className="font-medium">Administrator access required.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Only admin and super-admin users can manage document templates, letterheads, and seals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Templates"
        description="Configure branded letterheads (memorandum firme), company seals (zigled), and per-document templates."
      />

      {superAdmin && (
        <Card className="border-border/60">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium shrink-0">
              <Building2 className="size-4 text-primary" />
              Managing tenant
            </div>
            {tenantsQ.isLoading ? (
              <Skeleton className="h-9 w-full sm:w-72" />
            ) : tenants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tenants found.</p>
            ) : (
              <Select value={selectedTenantId ?? undefined} onValueChange={(v) => setSelectedTenantId(v)}>
                <SelectTrigger className="w-full sm:w-72 h-9">
                  <SelectValue placeholder="Choose a tenant…" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        <span className="truncate">{t.name}</span>
                        <Badge variant="outline" className="ml-1 text-[10px] capitalize">{t.plan}</Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="hidden sm:block text-xs text-muted-foreground ml-auto">
              Super-admin can manage templates for any tenant.
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-fit">
          <TabsTrigger value="letterheads">
            <Building2 className="size-3.5 mr-1" /> Memorandum
          </TabsTrigger>
          <TabsTrigger value="seals">
            <Stamp className="size-3.5 mr-1" /> Zigled
          </TabsTrigger>
          <TabsTrigger value="templates">
            <LayoutTemplate className="size-3.5 mr-1" /> Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="letterheads" className="mt-6">
          <LetterheadsTab tenantQuery={tenantQuery} />
        </TabsContent>
        <TabsContent value="seals" className="mt-6">
          <SealsTab tenantQuery={tenantQuery} />
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
          <TemplatesTab tenantQuery={tenantQuery} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Tab 1: Letterheads (Memorandum firme)
// ============================================================

function LetterheadsTab({ tenantQuery }: { tenantQuery: string }) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();
  // Super-admins must explicitly pick a tenant before we can list letterheads
  // (the backend requires ?tenant_id= for super-admin — otherwise it returns
  // 400, which previously surfaced as an empty result + console error).
  const isSuperAdminUser = isSuperAdmin(useAppStore((s) => s.user));
  const queryEnabled = !!tenantQuery || !isSuperAdminUser;

  const qc = useQueryClient();
  const [editing, setEditing] = useState<TenantLetterhead | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<TenantLetterhead | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["letterheads", tenantKey, tenantQuery],
    queryFn: async () => {
      const r = await fetch(api(`/api/letterheads${tenantQuery}`));
      if (!r.ok) throw new Error("Failed to load letterheads");
      return r.json() as Promise<{ items: TenantLetterhead[] }>;
    },
    enabled: queryEnabled,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/letterheads/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Letterhead deleted.");
      qc.invalidateQueries({ queryKey: ["letterheads", tenantKey, tenantQuery] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const duplicateMut = useMutation({
    mutationFn: async (l: TenantLetterhead) => {
      const { id, tenant_id, created_by, created_at, updated_at, ...rest } = l;
      const copy = { ...rest, name: l.name + " (copy)", is_default: false };
      const r = await fetch(api(`/api/letterheads${tenantQuery}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });
      if (!r.ok) throw new Error("Duplicate failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Letterhead duplicated.");
      qc.invalidateQueries({ queryKey: ["letterheads", tenantKey, tenantQuery] });
      setDuplicating(null);
    },
    onError: () => toast.error("Duplicate failed."),
  });

  const items = data?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Memorandum firme</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} letterhead{items.length === 1 ? "" : "s"} configured
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="size-4 mr-1" /> New Letterhead
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-6" />}
          title="No letterheads"
          description="Create your first company letterhead (memorandum firme) to brand all your documents."
          action={
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="size-4 mr-1" /> New Letterhead
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((l) => (
            <Card key={l.id} className="border-border/60 shadow-soft hover:shadow-soft-md transition-shadow duration-200 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base truncate">{l.name}</CardTitle>
                      {l.is_default && (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                          <Star className="size-3 fill-amber-400 text-amber-500" /> Default
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1 text-xs">
                      {l.company_name || "—"} · {l.company_city || "—"} · {l.company_country || "—"}
                    </CardDescription>
                  </div>
                  <div
                    className="size-9 rounded-lg border border-border/60 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: l.primary_color + "15" }}
                  >
                    <div className="size-3 rounded-full" style={{ backgroundColor: l.primary_color }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end gap-3">
                <div className="text-xs text-muted-foreground">
                  Updated <span className="tabular">{fmtDate(l.updated_at)}</span>
                </div>
                <Separator />
                <div className="flex items-center gap-1 flex-wrap">
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => { setEditing(l); setShowForm(true); }} title="Edit">
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setDuplicating(l)} title="Duplicate">
                    <Copy className="size-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => setDeleteId(l.id)} title="Delete">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LetterheadEditorDialog
        open={showForm}
        onOpenChange={setShowForm}
        letterhead={editing}
        tenantQuery={tenantQuery}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["letterheads", tenantKey, tenantQuery] });
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete letterhead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Templates linked to this letterhead will be unlinked automatically.
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

      <AlertDialog open={!!duplicating} onOpenChange={(o) => !o && setDuplicating(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate letterhead?</AlertDialogTitle>
            <AlertDialogDescription>
              Create a copy of <span className="font-medium">{duplicating?.name}</span> with the same settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => duplicating && duplicateMut.mutate(duplicating)}>
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================================
// Tab 2: Seals (Zigled)
// ============================================================

function SealsTab({ tenantQuery }: { tenantQuery: string }) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();
  // Super-admins must explicitly pick a tenant before we can list seals
  // (same reason as LetterheadsTab — backend requires ?tenant_id=).
  const isSuperAdminUser = isSuperAdmin(useAppStore((s) => s.user));
  const queryEnabled = !!tenantQuery || !isSuperAdminUser;

  const qc = useQueryClient();
  const [editing, setEditing] = useState<TenantSeal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<TenantSeal | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["seals", tenantKey, tenantQuery],
    queryFn: async () => {
      const r = await fetch(api(`/api/seals${tenantQuery}`));
      if (!r.ok) throw new Error("Failed to load seals");
      return r.json() as Promise<{ items: TenantSeal[] }>;
    },
    enabled: queryEnabled,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/seals/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Seal deleted.");
      qc.invalidateQueries({ queryKey: ["seals", tenantKey, tenantQuery] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const duplicateMut = useMutation({
    mutationFn: async (s: TenantSeal) => {
      const { id, tenant_id, created_by, created_at, updated_at, ...rest } = s;
      const copy = { ...rest, name: s.name + " (copy)", is_default: false };
      const r = await fetch(api(`/api/seals${tenantQuery}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });
      if (!r.ok) throw new Error("Duplicate failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Seal duplicated.");
      qc.invalidateQueries({ queryKey: ["seals", tenantKey, tenantQuery] });
      setDuplicating(null);
    },
    onError: () => toast.error("Duplicate failed."),
  });

  const items = data?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Zigled (company seals)</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} seal{items.length === 1 ? "" : "s"} configured
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="size-4 mr-1" /> New Seal
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Stamp className="size-6" />}
          title="No seals configured"
          description="Upload a company seal (PNG with transparency preferred) and configure its placement on documents."
          action={
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="size-4 mr-1" /> New Seal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => {
            const appliesTo = parseApplyToTypes(s.apply_to_types);
            return (
              <Card key={s.id} className="border-border/60 shadow-soft hover:shadow-soft-md transition-shadow duration-200 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base truncate">{s.name}</CardTitle>
                        {s.is_default && (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                            <Star className="size-3 fill-amber-400 text-amber-500" /> Default
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1 text-xs capitalize">
                        {s.position.replace(/-/g, " ")} · {s.image_width_mm}×{s.image_height_mm}mm
                      </CardDescription>
                    </div>
                    <div className="size-12 rounded-lg border border-border/60 bg-card flex items-center justify-center shrink-0 overflow-hidden">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.name} className="size-full object-contain" />
                      ) : (
                        <Stamp className="size-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end gap-3">
                  {appliesTo.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {appliesTo.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] capitalize">{TYPE_LABELS[t as TemplateType] || t}</Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Applies to all document types</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Updated <span className="tabular">{fmtDate(s.updated_at)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-1 flex-wrap">
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => { setEditing(s); setShowForm(true); }} title="Edit">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setDuplicating(s)} title="Duplicate">
                      <Copy className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => setDeleteId(s.id)} title="Delete">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SealEditorDialog
        open={showForm}
        onOpenChange={setShowForm}
        seal={editing}
        tenantQuery={tenantQuery}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["seals", tenantKey, tenantQuery] });
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete seal?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Templates linked to this seal will be unlinked automatically.
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

      <AlertDialog open={!!duplicating} onOpenChange={(o) => !o && setDuplicating(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate seal?</AlertDialogTitle>
            <AlertDialogDescription>
              Create a copy of <span className="font-medium">{duplicating?.name}</span> with the same image and placement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => duplicating && duplicateMut.mutate(duplicating)}>
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================================
// Tab 3: Templates (Offers / Invoices / Proformas / etc.)
// ============================================================

/**
 * "New Template" dropdown button — exposes a blank template option plus
 * the three professional starter templates (offer / invoice / proforma).
 * Used in both the page header and the empty-state CTA so users always
 * have the same starter-picker available.
 */
function NewTemplateDropdown({
  onBlank,
  onStarter,
}: {
  onBlank: () => void;
  onStarter: (starter: StarterTemplate) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="size-4 mr-1" /> New Template
          <ChevronDown className="size-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuItem onClick={onBlank}>
          <FileText className="size-4 mr-2" />
          <span>Blank template</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Start from a starter
        </DropdownMenuLabel>
        {STARTER_TEMPLATES.map((starter) => (
          <DropdownMenuItem
            key={starter.type}
            onClick={() => onStarter(starter)}
            className="items-start py-2"
          >
            <LayoutTemplate className="size-4 mr-2 mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium leading-tight">{starter.name}</span>
              <span className="text-xs text-muted-foreground leading-snug">
                {starter.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TemplatesTab({ tenantQuery }: { tenantQuery: string }) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();
  // Super-admins must explicitly pick a tenant before we can list templates
  // (same reason as LetterheadsTab — backend requires ?tenant_id= for the
  // templates/letterheads/seals list endpoints).
  const isSuperAdminUser = isSuperAdmin(useAppStore((s) => s.user));
  const queryEnabled = !!tenantQuery || !isSuperAdminUser;

  const qc = useQueryClient();
  const [editing, setEditing] = useState<DocumentTemplate | null>(null);
  // `draft` holds the initial form values for a brand-new template that
  // was created from a starter (e.g. "Professional Offer Template"). When
  // set, the editor dialog seeds the form from `draft` instead of the
  // built-in `defaultTemplate()`. Cleared on dialog close.
  const [draft, setDraft] = useState<TemplateFormState | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<DocumentTemplate | null>(null);

  // Open the editor with a blank form (uses defaultTemplate()).
  function handleNewBlank() {
    setEditing(null);
    setDraft(null);
    setShowForm(true);
  }

  // Open the editor pre-filled with a starter template's settings.
  // `starter.template` is a `Partial<DocumentTemplate>` containing every
  // TemplateFormState field, so a cast is safe here.
  function handleNewFromStarter(starter: StarterTemplate) {
    setEditing(null);
    setDraft(starter.template as TemplateFormState);
    setShowForm(true);
  }

  const { data, isLoading } = useQuery({
    queryKey: ["document-templates", tenantKey, tenantQuery],
    queryFn: async () => {
      const r = await fetch(api(`/api/document-templates${tenantQuery}`));
      if (!r.ok) throw new Error("Failed to load templates");
      return r.json() as Promise<{ items: DocumentTemplate[] }>;
    },
    enabled: queryEnabled,
  });

  // Load letterheads + seals so we can show their names on the cards
  const letterheadsQ = useQuery({
    queryKey: ["letterheads", tenantKey, tenantQuery],
    queryFn: async () => {
      const r = await fetch(api(`/api/letterheads${tenantQuery}`));
      if (!r.ok) throw new Error("Failed to load letterheads");
      return r.json() as Promise<{ items: TenantLetterhead[] }>;
    },
    enabled: queryEnabled,
  });
  const sealsQ = useQuery({
    queryKey: ["seals", tenantKey, tenantQuery],
    queryFn: async () => {
      const r = await fetch(api(`/api/seals${tenantQuery}`));
      if (!r.ok) throw new Error("Failed to load seals");
      return r.json() as Promise<{ items: TenantSeal[] }>;
    },
    enabled: queryEnabled,
  });

  // Fetch the active tenant so we can read its bank_accounts array — needed by
  // the BankAccountSelector in the template editor.
  //   • Regular admin: GET /api/tenants returns only their own tenant.
  //   • Super-admin: returns ALL tenants, and we filter by ?tenant_id= in
  //     `tenantQuery` (set by the tenant switcher above).
  const tenantsQ = useQuery<{ items: Tenant[] }>({
    queryKey: ["tenants", tenantKey, "for-templates", tenantQuery],
    queryFn: async () => {
      const r = await fetch(api("/api/tenants"));
      if (!r.ok) throw new Error("Failed to load tenants");
      return r.json();
    },
    enabled: queryEnabled,
  });
  const activeTenantId = tenantQuery.startsWith("?tenant_id=")
    ? decodeURIComponent(tenantQuery.slice("?tenant_id=".length))
    : null;
  const tenant = (tenantsQ.data?.items ?? []).find((t) =>
    activeTenantId ? t.id === activeTenantId : true,
  ) ?? null;

  const letterheads = letterheadsQ.data?.items ?? [];
  const seals = sealsQ.data?.items ?? [];

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/document-templates/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Template deleted.");
      qc.invalidateQueries({ queryKey: ["document-templates", tenantKey, tenantQuery] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const setDefaultMut = useMutation({
    mutationFn: async (t: DocumentTemplate) => {
      const r = await fetch(api(`/api/document-templates/${t.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...t, is_default: true }),
      });
      if (!r.ok) throw new Error("Update failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Default template updated.");
      qc.invalidateQueries({ queryKey: ["document-templates", tenantKey, tenantQuery] });
    },
    onError: () => toast.error("Failed to set default."),
  });

  const duplicateMut = useMutation({
    mutationFn: async (t: DocumentTemplate) => {
      const { id, tenant_id, created_by, created_at, updated_at, letterhead, seal, ...rest } = t;
      const copy = { ...rest, name: t.name + " (copy)", is_default: false };
      const r = await fetch(api(`/api/document-templates${tenantQuery}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });
      if (!r.ok) throw new Error("Duplicate failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Template duplicated.");
      qc.invalidateQueries({ queryKey: ["document-templates", tenantKey, tenantQuery] });
      setDuplicating(null);
    },
    onError: () => toast.error("Duplicate failed."),
  });

  const items = data?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Document templates</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} template{items.length === 1 ? "" : "s"} configured
          </p>
        </div>
        <NewTemplateDropdown onBlank={handleNewBlank} onStarter={handleNewFromStarter} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title="No document templates"
          description="Create your first template to start generating branded PDFs for offers, invoices, and proformas."
          action={
            <NewTemplateDropdown onBlank={handleNewBlank} onStarter={handleNewFromStarter} />
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => {
            const linkedLetterhead = t.letterhead || letterheads.find((l) => l.id === t.letterhead_id);
            const linkedSeal = t.seal || seals.find((s) => s.id === t.seal_id);
            return (
              <Card key={t.id} className="border-border/60 shadow-soft hover:shadow-soft-md transition-shadow duration-200 flex flex-col">
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
                      </CardDescription>
                    </div>
                    <div
                      className="size-9 rounded-lg border border-border/60 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: t.primary_color + "15" }}
                    >
                      <div className="size-3 rounded-full" style={{ backgroundColor: t.primary_color }} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end gap-2">
                  <div className="text-xs text-muted-foreground space-y-1">
                    {linkedLetterhead ? (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="size-3" /> <span className="truncate">{linkedLetterhead.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 italic">
                        <Building2 className="size-3" /> No letterhead
                      </div>
                    )}
                    {linkedSeal && t.seal_enabled ? (
                      <div className="flex items-center gap-1.5">
                        <Stamp className="size-3" /> <span className="truncate">{linkedSeal.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 italic">
                        <Stamp className="size-3" /> No seal
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated <span className="tabular">{fmtDate(t.updated_at)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-1 flex-wrap">
                    {!t.is_default && (
                      <Button size="sm" variant="outline" className="h-8" onClick={() => setDefaultMut.mutate(t)} disabled={setDefaultMut.isPending}>
                        <Star className="size-3.5 mr-1" /> Set default
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => { setEditing(t); setShowForm(true); }} title="Edit">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setDuplicating(t)} title="Duplicate">
                      <Copy className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => setDeleteId(t.id)} title="Delete">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TemplateEditorDialog
        open={showForm}
        onOpenChange={(o) => {
          setShowForm(o);
          if (!o) setDraft(null);
        }}
        template={editing}
        draft={draft}
        tenantQuery={tenantQuery}
        tenant={tenant}
        letterheads={letterheads}
        seals={seals}
        onSaved={() => {
          setShowForm(false);
          setDraft(null);
          qc.invalidateQueries({ queryKey: ["document-templates", tenantKey, tenantQuery] });
        }}
      />

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
            <AlertDialogAction onClick={() => duplicating && duplicateMut.mutate(duplicating)}>
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================================
// Letterhead editor with live A4 preview
// ============================================================

function LetterheadEditorDialog({
  open, onOpenChange, letterhead, tenantQuery, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  letterhead: TenantLetterhead | null;
  tenantQuery: string;
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [form, setForm] = useState<LetterheadFormState>(defaultLetterhead());
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(letterhead ? { ...letterhead } : defaultLetterhead());
    }
  }, [open, letterhead]);

  function set<K extends keyof LetterheadFormState>(k: K, v: LetterheadFormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleLogoUpload(file: File) {
    if (file.size > 1_500_000) {
      toast.error("Logo too large (max ~1.5MB).");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      set("logo_url", dataUrl);
      toast.success("Logo uploaded.");
    } catch {
      toast.error("Failed to read image.");
    }
  }

  async function handleSave() {
    if (!form.name?.trim()) {
      toast.error("Letterhead name is required.");
      return;
    }
    setSaving(true);
    try {
      const method = letterhead ? "PUT" : "POST";
      const url = letterhead ? api(`/api/letterheads/${letterhead.id}`) : api(`/api/letterheads${tenantQuery}`);
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error("Save failed");
      toast.success(letterhead ? "Letterhead updated." : "Letterhead created.");
      onSaved();
    } catch {
      toast.error("Failed to save letterhead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full" className="p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            {letterhead ? "Edit letterhead" : "New letterhead"}
          </DialogTitle>
          <DialogDescription>
            Configure company identity, branding, header/footer layout, watermark, and typography. Changes preview live.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
          {/* Left: form */}
          <div className="border-r border-border/60 min-h-0 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-5">
                <Accordion type="multiple" defaultValue={["basics", "logo", "colors"]} className="w-full">
                  <AccordionItem value="basics">
                    <AccordionTrigger><SectionLabel icon={FileText} label="Basics & company identity" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Letterhead name">
                          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Official 2026 Letterhead" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Company name"><Input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} /></Field>
                          <Field label="Legal name"><Input value={form.company_legal_name ?? ""} onChange={(e) => set("company_legal_name", e.target.value)} /></Field>
                        </div>
                        <Field label="Address line"><Input value={form.company_address_line ?? ""} onChange={(e) => set("company_address_line", e.target.value)} /></Field>
                        <div className="grid grid-cols-3 gap-3">
                          <Field label="City"><Input value={form.company_city ?? ""} onChange={(e) => set("company_city", e.target.value)} /></Field>
                          <Field label="Postal code"><Input value={form.company_postal_code ?? ""} onChange={(e) => set("company_postal_code", e.target.value)} /></Field>
                          <Field label="Country"><Input value={form.company_country ?? ""} onChange={(e) => set("company_country", e.target.value)} placeholder="RS" /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Email"><Input value={form.company_email ?? ""} onChange={(e) => set("company_email", e.target.value)} /></Field>
                          <Field label="Phone"><Input value={form.company_phone ?? ""} onChange={(e) => set("company_phone", e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Website"><Input value={form.company_website ?? ""} onChange={(e) => set("company_website", e.target.value)} /></Field>
                          <Field label="VAT number"><Input value={form.company_vat_number ?? ""} onChange={(e) => set("company_vat_number", e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Tax ID"><Input value={form.company_tax_id ?? ""} onChange={(e) => set("company_tax_id", e.target.value)} /></Field>
                          <Field label="Registration #"><Input value={form.company_registration_number ?? ""} onChange={(e) => set("company_registration_number", e.target.value)} /></Field>
                        </div>
                        <Field label="Default letterhead">
                          <div className="flex items-center gap-2">
                            <Switch checked={form.is_default} onCheckedChange={(v) => set("is_default", v)} />
                            <span className="text-sm text-muted-foreground">Use as the default for this tenant</span>
                          </div>
                        </Field>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bank">
                    <AccordionTrigger><SectionLabel icon={Layers} label="Bank details" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Bank name"><Input value={form.bank_name ?? ""} onChange={(e) => set("bank_name", e.target.value)} /></Field>
                          <Field label="Account holder"><Input value={form.bank_account_holder ?? ""} onChange={(e) => set("bank_account_holder", e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="IBAN"><Input value={form.bank_iban ?? ""} onChange={(e) => set("bank_iban", e.target.value)} className="font-mono text-xs" /></Field>
                          <Field label="SWIFT/BIC"><Input value={form.bank_swift ?? ""} onChange={(e) => set("bank_swift", e.target.value)} className="font-mono text-xs" /></Field>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="logo">
                    <AccordionTrigger><SectionLabel icon={ImageIcon} label="Logo" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Logo image">
                          <div className="flex items-center gap-3">
                            <div className="size-16 rounded-lg border border-border/60 bg-card flex items-center justify-center overflow-hidden shrink-0">
                              {form.logo_url ? (
                                <img src={form.logo_url} alt="Logo" className="size-full object-contain" />
                              ) : (
                                <ImageIcon className="size-5 text-muted-foreground" />
                              )}
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleLogoUpload(f);
                                e.target.value = "";
                              }}
                            />
                            <div className="flex flex-col gap-1">
                              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="size-3.5 mr-1" /> Upload
                              </Button>
                              {form.logo_url && (
                                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => set("logo_url", null)}>
                                  <X className="size-3.5 mr-1" /> Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </Field>
                        <Field label="Logo position">
                          <Select value={form.logo_position} onValueChange={(v) => set("logo_position", v as "left" | "center" | "right")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Width (mm)"><NumberInput value={form.logo_width_mm} onChange={(v) => set("logo_width_mm", v)} min={5} max={150} /></Field>
                          <Field label="Height (mm)"><NumberInput value={form.logo_height_mm} onChange={(v) => set("logo_height_mm", v)} min={5} max={80} /></Field>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="colors">
                    <AccordionTrigger><SectionLabel icon={Palette} label="Branding colors" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Primary color" value={form.primary_color} onChange={(v) => set("primary_color", v)} />
                        <ColorField label="Accent color" value={form.accent_color} onChange={(v) => set("accent_color", v)} />
                        <ColorField label="Body text color" value={form.text_color} onChange={(v) => set("text_color", v)} />
                        <ColorField label="Muted text color" value={form.muted_text_color} onChange={(v) => set("muted_text_color", v)} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="page">
                    <AccordionTrigger><SectionLabel icon={LayoutTemplate} label="Page layout" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
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
                            <MarginInput label="Top" value={form.margin_top_mm} onChange={(v) => set("margin_top_mm", v)} />
                            <MarginInput label="Bottom" value={form.margin_bottom_mm} onChange={(v) => set("margin_bottom_mm", v)} />
                            <MarginInput label="Left" value={form.margin_left_mm} onChange={(v) => set("margin_left_mm", v)} />
                            <MarginInput label="Right" value={form.margin_right_mm} onChange={(v) => set("margin_right_mm", v)} />
                          </div>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Header height (mm)"><NumberInput value={form.header_height_mm} onChange={(v) => set("header_height_mm", v)} min={5} max={80} /></Field>
                          <Field label="Footer height (mm)"><NumberInput value={form.footer_height_mm} onChange={(v) => set("footer_height_mm", v)} min={5} max={60} /></Field>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="header">
                    <AccordionTrigger><SectionLabel icon={AlignCenter} label="Header layout" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Header layout">
                          <Select value={form.header_layout} onValueChange={(v) => set("header_layout", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {HEADER_LAYOUTS.map((h) => (
                                <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <ToggleField label="Logo" checked={form.header_show_logo} onChange={(v) => set("header_show_logo", v)} />
                          <ToggleField label="Name" checked={form.header_show_company_name} onChange={(v) => set("header_show_company_name", v)} />
                          <ToggleField label="Contact" checked={form.header_show_contact} onChange={(v) => set("header_show_contact", v)} />
                          <ToggleField label="VAT" checked={form.header_show_vat} onChange={(v) => set("header_show_vat", v)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Divider">
                            <div className="flex items-center gap-2">
                              <Switch checked={form.header_divider} onCheckedChange={(v) => set("header_divider", v)} />
                              <span className="text-sm text-muted-foreground">Show below header</span>
                            </div>
                          </Field>
                          {form.header_divider && (
                            <ColorField label="Divider color" value={form.header_divider_color} onChange={(v) => set("header_divider_color", v)} />
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="footer">
                    <AccordionTrigger><SectionLabel icon={AlignJustify} label="Footer layout" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Footer layout">
                          <Select value={form.footer_layout} onValueChange={(v) => set("footer_layout", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {FOOTER_LAYOUTS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <ToggleField label="Bank" checked={form.footer_show_bank_details} onChange={(v) => set("footer_show_bank_details", v)} />
                          <ToggleField label="Contact" checked={form.footer_show_contact} onChange={(v) => set("footer_show_contact", v)} />
                          <ToggleField label="Tax ID" checked={form.footer_show_tax_id} onChange={(v) => set("footer_show_tax_id", v)} />
                          <ToggleField label="Page #" checked={form.footer_show_page_number} onChange={(v) => set("footer_show_page_number", v)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Divider">
                            <div className="flex items-center gap-2">
                              <Switch checked={form.footer_divider} onCheckedChange={(v) => set("footer_divider", v)} />
                              <span className="text-sm text-muted-foreground">Show above footer</span>
                            </div>
                          </Field>
                          {form.footer_divider && (
                            <ColorField label="Divider color" value={form.footer_divider_color} onChange={(v) => set("footer_divider_color", v)} />
                          )}
                        </div>
                        <Field label="Footer custom text">
                          <Input value={form.footer_text ?? ""} onChange={(e) => set("footer_text", e.target.value)} placeholder="Small-print line (optional)" />
                        </Field>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="watermark">
                    <AccordionTrigger><SectionLabel icon={Waves} label="Watermark" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Enabled">
                          <div className="flex items-center gap-2">
                            <Switch checked={form.watermark_enabled} onCheckedChange={(v) => set("watermark_enabled", v)} />
                            <span className="text-sm text-muted-foreground">Overlay a watermark on every page</span>
                          </div>
                        </Field>
                        {form.watermark_enabled && (
                          <>
                            <Field label="Watermark text"><Input value={form.watermark_text ?? ""} onChange={(e) => set("watermark_text", e.target.value)} placeholder="DRAFT" /></Field>
                            <div className="grid grid-cols-2 gap-3">
                              <ColorField label="Color" value={form.watermark_color} onChange={(v) => set("watermark_color", v)} />
                              <Field label={`Opacity (${Math.round(form.watermark_opacity * 100)}%)`}>
                                <Slider
                                  value={[form.watermark_opacity]}
                                  min={0.02} max={0.5} step={0.02}
                                  onValueChange={(v) => set("watermark_opacity", v[0])}
                                />
                              </Field>
                            </div>
                            <Field label={`Rotation (${form.watermark_rotation}°)`}>
                              <Slider
                                value={[form.watermark_rotation]}
                                min={-180} max={180} step={1}
                                onValueChange={(v) => set("watermark_rotation", v[0])}
                              />
                            </Field>
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="typography">
                    <AccordionTrigger><SectionLabel icon={Type} label="Typography" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Body font family"><Input value={form.body_font_family} onChange={(e) => set("body_font_family", e.target.value)} className="font-mono text-xs" /></Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Body size (pt)"><NumberInput value={form.body_font_size_pt} onChange={(v) => set("body_font_size_pt", v)} min={7} max={24} /></Field>
                          <Field label="Heading size (pt)"><NumberInput value={form.heading_font_size_pt} onChange={(v) => set("heading_font_size_pt", v)} min={10} max={48} /></Field>
                        </div>
                        <Field label="Heading font family"><Input value={form.heading_font_family} onChange={(e) => set("heading_font_family", e.target.value)} className="font-mono text-xs" /></Field>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollArea>
          </div>

          {/* Right: live A4 preview */}
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
                <LetterheadPreview form={form} />
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-5 py-4 border-t border-border/60 bg-card">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="size-4 mr-1" /> Save letterhead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Letterhead live preview — scaled A4
// ============================================================

function LetterheadPreview({ form }: { form: LetterheadFormState }) {
  const pageWidthPx = 480;
  const pageHeightPx = Math.round(pageWidthPx * 1.414);
  const mmToPx = (mm: number) => (mm / 210) * pageWidthPx;

  // Header layout helpers
  const isLogoLeft = form.header_layout === "logo-left-info-right" || form.header_layout === "two-column";
  const isLogoRight = form.header_layout === "logo-right-info-left";
  const isLogoCenter = form.header_layout === "logo-center";
  const isTextOnly = form.header_layout === "text-only";

  const Logo = (
    <div style={{ width: mmToPx(form.logo_width_mm), height: mmToPx(form.logo_height_mm) }} className="flex items-center justify-center shrink-0 overflow-hidden">
      {form.logo_url ? (
        <img src={form.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
      ) : (
        <div
          className="w-full h-full rounded-md flex items-center justify-center text-white"
          style={{ backgroundColor: form.primary_color, fontWeight: 700, fontSize: 14 }}
        >
          {(form.company_name || "C")[0]}
        </div>
      )}
    </div>
  );

  const CompanyInfo = (
    <div className="min-w-0">
      {form.header_show_company_name && (
        <div style={{ color: form.primary_color, fontWeight: 700, fontSize: form.heading_font_size_pt * 0.7 }}>
          {form.company_name || "Your Company"}
        </div>
      )}
      {form.header_show_contact && (
        <div style={{ fontSize: 8, color: form.muted_text_color, lineHeight: 1.4, marginTop: 2 }}>
          {[
            form.company_address_line,
            [form.company_postal_code, form.company_city].filter(Boolean).join(" "),
            form.company_country,
          ].filter(Boolean).join(" · ")}
          <br />
          {[form.company_email, form.company_phone, form.company_website].filter(Boolean).join(" · ")}
          {form.header_show_vat && form.company_vat_number && (
            <><br />VAT: {form.company_vat_number}</>
          )}
        </div>
      )}
    </div>
  );

  const headerContent = isTextOnly ? (
    <div className="w-full text-center">{CompanyInfo}</div>
  ) : isLogoCenter ? (
    <div className="w-full flex flex-col items-center gap-2">
      {form.header_show_logo && Logo}
      {CompanyInfo}
    </div>
  ) : isLogoRight ? (
    <div className="w-full flex items-center justify-between gap-3">
      <div className="flex-1 text-right">{CompanyInfo}</div>
      {form.header_show_logo && Logo}
    </div>
  ) : (
    <div className="w-full flex items-center justify-between gap-3">
      {form.header_show_logo && Logo}
      <div className="flex-1">{CompanyInfo}</div>
    </div>
  );

  return (
    <div
      className="bg-white shadow-soft-lg rounded-sm mx-auto relative overflow-hidden"
      style={{
        width: pageWidthPx,
        height: pageHeightPx,
        fontFamily: form.body_font_family,
        fontSize: form.body_font_size_pt,
        color: form.text_color,
        paddingTop: mmToPx(form.margin_top_mm),
        paddingBottom: mmToPx(form.margin_bottom_mm),
        paddingLeft: mmToPx(form.margin_left_mm),
        paddingRight: mmToPx(form.margin_right_mm),
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          minHeight: mmToPx(form.header_height_mm),
          borderBottom: form.header_divider ? `1px solid ${form.header_divider_color}` : "none",
          paddingBottom: 8,
          marginBottom: 14,
        }}
      >
        {headerContent}
      </div>

      {/* Body placeholder */}
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        <div style={{ color: form.muted_text_color, fontSize: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Document body
        </div>
        {[60, 90, 75, 100, 50].map((w, i) => (
          <div key={i} className="rounded-sm" style={{ width: `${w}%`, height: 6, backgroundColor: form.muted_text_color + "30" }} />
        ))}
        <div className="mt-2" style={{ height: 80, backgroundColor: form.accent_color + "10", border: `1px solid ${form.accent_color}30`, borderRadius: 4 }} />
      </div>

      {/* Footer */}
      <div
        style={{
          minHeight: mmToPx(form.footer_height_mm),
          borderTop: form.footer_divider ? `1px solid ${form.footer_divider_color}` : "none",
          paddingTop: 8,
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          fontSize: 7.5,
          color: form.muted_text_color,
        }}
      >
        <div className="flex-1 space-y-0.5">
          {form.footer_show_bank_details && (form.bank_name || form.bank_iban) && (
            <div>
              <span style={{ color: form.primary_color, fontWeight: 600 }}>Bank:</span>{" "}
              {form.bank_name || "—"} {form.bank_iban && `· IBAN ${form.bank_iban}`} {form.bank_swift && `· SWIFT ${form.bank_swift}`}
            </div>
          )}
          {form.footer_show_contact && form.company_email && (
            <div>
              <span style={{ color: form.primary_color, fontWeight: 600 }}>Contact:</span>{" "}
              {form.company_email} {form.company_phone && `· ${form.company_phone}`}
            </div>
          )}
          {form.footer_show_tax_id && (form.company_vat_number || form.company_tax_id) && (
            <div>
              <span style={{ color: form.primary_color, fontWeight: 600 }}>Tax:</span>{" "}
              {form.company_vat_number ? `VAT ${form.company_vat_number}` : ""}
              {form.company_tax_id && ` · ID ${form.company_tax_id}`}
            </div>
          )}
          {form.footer_text && (
            <div style={{ fontStyle: "italic", marginTop: 4 }}>{form.footer_text}</div>
          )}
        </div>
        {form.footer_show_page_number && (
          <div style={{ textAlign: "right", color: form.accent_color, fontWeight: 600 }}>Page 1</div>
        )}
      </div>

      {/* Watermark */}
      {form.watermark_enabled && form.watermark_text && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: form.watermark_opacity,
            transform: `rotate(${form.watermark_rotation}deg)`,
            color: form.watermark_color,
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: 4,
          }}
        >
          {form.watermark_text}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Seal editor with placement preview
// ============================================================

function SealEditorDialog({
  open, onOpenChange, seal, tenantQuery, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  seal: TenantSeal | null;
  tenantQuery: string;
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [form, setForm] = useState<SealFormState>(defaultSeal());
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(seal ? { ...seal } : defaultSeal());
    }
  }, [open, seal]);

  function set<K extends keyof SealFormState>(k: K, v: SealFormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleImageUpload(file: File) {
    if (file.size > 1_500_000) {
      toast.error("Image too large (max ~1.5MB).");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      const format = file.type.includes("png") ? "png" : file.type.includes("svg") ? "svg" : "jpg";
      set("image_url", dataUrl);
      set("image_format", format as TenantSeal["image_format"]);
      toast.success("Seal image uploaded.");
    } catch {
      toast.error("Failed to read image.");
    }
  }

  async function handleSave() {
    if (!form.name?.trim()) {
      toast.error("Seal name is required.");
      return;
    }
    if (!form.image_url) {
      toast.error("Please upload a seal image.");
      return;
    }
    setSaving(true);
    try {
      const method = seal ? "PUT" : "POST";
      const url = seal ? api(`/api/seals/${seal.id}`) : api(`/api/seals${tenantQuery}`);
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error("Save failed");
      toast.success(seal ? "Seal updated." : "Seal created.");
      onSaved();
    } catch {
      toast.error("Failed to save seal.");
    } finally {
      setSaving(false);
    }
  }

  const applyToTypes = parseApplyToTypes(form.apply_to_types);
  function toggleApplyTo(type: string) {
    const next = applyToTypes.includes(type)
      ? applyToTypes.filter((t) => t !== type)
      : [...applyToTypes, type];
    set("apply_to_types", serializeApplyToTypes(next));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full" className="p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2">
            <Stamp className="size-5 text-primary" />
            {seal ? "Edit seal" : "New seal"}
          </DialogTitle>
          <DialogDescription>
            Upload a seal image (PNG with transparency recommended) and configure placement, opacity, rotation, and which document types it applies to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
          {/* Left: form */}
          <div className="border-r border-border/60 min-h-0 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-5">
                <Accordion type="multiple" defaultValue={["basics", "image"]} className="w-full">
                  <AccordionItem value="basics">
                    <AccordionTrigger><SectionLabel icon={FileText} label="Basics" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Seal name">
                          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Official Round Seal" />
                        </Field>
                        <Field label="Default seal">
                          <div className="flex items-center gap-2">
                            <Switch checked={form.is_default} onCheckedChange={(v) => set("is_default", v)} />
                            <span className="text-sm text-muted-foreground">Use as the default seal for this tenant</span>
                          </div>
                        </Field>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="image">
                    <AccordionTrigger><SectionLabel icon={ImageIcon} label="Seal image" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Seal image">
                          <div className="flex items-center gap-3">
                            <div className="size-24 rounded-lg border border-border/60 bg-card flex items-center justify-center overflow-hidden shrink-0">
                              {form.image_url ? (
                                <img src={form.image_url} alt="Seal" className="size-full object-contain" />
                              ) : (
                                <Stamp className="size-8 text-muted-foreground" />
                              )}
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleImageUpload(f);
                                e.target.value = "";
                              }}
                            />
                            <div className="flex flex-col gap-1">
                              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="size-3.5 mr-1" /> Upload
                              </Button>
                              {form.image_url && (
                                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => set("image_url", "")}>
                                  <X className="size-3.5 mr-1" /> Remove
                                </Button>
                              )}
                              <p className="text-[11px] text-muted-foreground max-w-[180px]">
                                PNG with transparency recommended. Max ~1.5MB.
                              </p>
                            </div>
                          </div>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Width (mm)"><NumberInput value={form.image_width_mm} onChange={(v) => set("image_width_mm", v)} min={5} max={120} /></Field>
                          <Field label="Height (mm)"><NumberInput value={form.image_height_mm} onChange={(v) => set("image_height_mm", v)} min={5} max={120} /></Field>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="placement">
                    <AccordionTrigger><SectionLabel icon={MapPin} label="Placement" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Position on page">
                          <Select value={form.position} onValueChange={(v) => set("position", v as TenantSeal["position"])}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {SEAL_POSITIONS.map((p) => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Offset X (mm)"><NumberInput value={form.offset_x_mm} onChange={(v) => set("offset_x_mm", v)} min={-100} max={100} /></Field>
                          <Field label="Offset Y (mm)"><NumberInput value={form.offset_y_mm} onChange={(v) => set("offset_y_mm", v)} min={-100} max={100} /></Field>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="appearance">
                    <AccordionTrigger><SectionLabel icon={Droplet} label="Appearance" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label={`Opacity (${Math.round(form.opacity * 100)}%)`}>
                          <Slider value={[form.opacity]} min={0.05} max={1} step={0.05} onValueChange={(v) => set("opacity", v[0])} />
                        </Field>
                        <Field label={`Rotation (${form.rotation_deg}°)`}>
                          <Slider value={[form.rotation_deg]} min={-180} max={180} step={1} onValueChange={(v) => set("rotation_deg", v[0])} />
                        </Field>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <RotateCw className="size-3.5" />
                          Rotation: <span className="tabular">{form.rotation_deg}°</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="apply">
                    <AccordionTrigger><SectionLabel icon={ShieldCheck} label="Apply to document types" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Select which document types this seal should be stamped on. Leave empty to apply to all types.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {SEAL_DOC_TYPES.map((t) => (
                            <label
                              key={t.value}
                              className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 cursor-pointer hover:bg-accent/40 transition-colors"
                            >
                              <Checkbox
                                checked={applyToTypes.includes(t.value)}
                                onCheckedChange={() => toggleApplyTo(t.value)}
                              />
                              <span className="text-sm">{t.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="signature">
                    <AccordionTrigger><SectionLabel icon={Pen} label="Signature line" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Enabled">
                          <div className="flex items-center gap-2">
                            <Switch checked={form.signature_enabled} onCheckedChange={(v) => set("signature_enabled", v)} />
                            <span className="text-sm text-muted-foreground">Show a signature line beside the seal</span>
                          </div>
                        </Field>
                        {form.signature_enabled && (
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Label"><Input value={form.signature_label ?? ""} onChange={(e) => set("signature_label", e.target.value)} placeholder="Authorized signature" /></Field>
                            <Field label="Name"><Input value={form.signature_name ?? ""} onChange={(e) => set("signature_name", e.target.value)} placeholder="Vladimir, Director" /></Field>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollArea>
          </div>

          {/* Right: live preview */}
          <div className="bg-muted/30 min-h-0 flex flex-col">
            <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Placement preview</span>
              </div>
              <Badge variant="outline" className="text-xs capitalize">{form.position.replace(/-/g, " ")}</Badge>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6 flex justify-center">
                <SealPreview form={form} />
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-5 py-4 border-t border-border/60 bg-card">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="size-4 mr-1" /> Save seal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Seal placement preview
// ============================================================

function SealPreview({ form }: { form: SealFormState }) {
  const pageWidthPx = 480;
  const pageHeightPx = Math.round(pageWidthPx * 1.414);
  const mmToPx = (mm: number) => (mm / 210) * pageWidthPx;

  // Position the seal absolutely based on `position` + offsets
  const sealWidth = mmToPx(form.image_width_mm);
  const sealHeight = mmToPx(form.image_height_mm);
  const offsetX = mmToPx(form.offset_x_mm);
  const offsetY = mmToPx(form.offset_y_mm);
  const margin = 16;

  const posStyle: React.CSSProperties = {
    position: "absolute",
    width: sealWidth,
    height: sealHeight,
    opacity: form.opacity,
    transform: `rotate(${form.rotation_deg}deg)`,
  };

  if (form.position === "bottom-right") {
    Object.assign(posStyle, { bottom: margin + offsetY, right: margin - offsetX });
  } else if (form.position === "bottom-left") {
    Object.assign(posStyle, { bottom: margin + offsetY, left: margin + offsetX });
  } else if (form.position === "bottom-center") {
    Object.assign(posStyle, { bottom: margin + offsetY, left: "50%", marginLeft: -sealWidth / 2 + offsetX });
  } else if (form.position === "top-right") {
    Object.assign(posStyle, { top: margin - offsetY, right: margin - offsetX });
  } else if (form.position === "top-left") {
    Object.assign(posStyle, { top: margin - offsetY, left: margin + offsetX });
  } else if (form.position === "top-center") {
    Object.assign(posStyle, { top: margin - offsetY, left: "50%", marginLeft: -sealWidth / 2 + offsetX });
  }

  return (
    <div
      className="bg-white shadow-soft-lg rounded-sm mx-auto relative overflow-hidden"
      style={{
        width: pageWidthPx,
        height: pageHeightPx,
        padding: margin,
      }}
    >
      {/* Outline placeholder for the page */}
      <div className="w-full h-full rounded-sm border border-dashed border-border/60 flex flex-col items-center justify-center text-muted-foreground">
        <FileText className="size-10 mb-2 opacity-30" />
        <p className="text-xs">A4 page outline</p>
        <p className="text-[10px] mt-1 opacity-70">Seal is positioned relative to page edges</p>
      </div>

      {/* Seal */}
      {form.image_url && (
        <div style={posStyle}>
          <img src={form.image_url} alt="Seal" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Signature line beside seal */}
      {form.signature_enabled && (
        <div
          style={{
            position: "absolute",
            ...(form.position.startsWith("bottom")
              ? { bottom: margin + offsetY + 4 }
              : { top: margin - offsetY + sealHeight + 4 }),
            ...(form.position.endsWith("right")
              ? { right: margin - offsetX + sealWidth + 8 }
              : form.position.endsWith("left")
                ? { left: margin + offsetX + sealWidth + 8 }
                : { left: "50%", marginLeft: sealWidth / 2 + 8 }),
            minWidth: 120,
          }}
        >
          <div style={{ borderTop: "1px solid #475569", width: 100 }} />
          <div style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>
            {form.signature_label || "Signature"}
          </div>
          {form.signature_name && (
            <div style={{ fontSize: 9, color: "#0f172a", fontWeight: 600, marginTop: 1 }}>
              {form.signature_name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Template editor with full document preview
// ============================================================

function TemplateEditorDialog({
  open, onOpenChange, template, draft, tenantQuery, tenant, letterheads, seals, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  template: DocumentTemplate | null;
  /**
   * Optional initial form values for a brand-new template created from a
   * starter (e.g. "Professional Offer Template"). Only consulted when
   * `template` is null. Ignored when editing an existing template.
   */
  draft?: TemplateFormState | null;
  tenantQuery: string;
  tenant: Tenant | null;
  letterheads: TenantLetterhead[];
  seals: TenantSeal[];
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [form, setForm] = useState<TemplateFormState>(defaultTemplate());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // Edit-existing takes priority, then starter draft, then blank default.
      setForm(template ? { ...template } : draft ? { ...draft } : defaultTemplate());
    }
  }, [open, template, draft]);

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
      // Always include ?tenant_id= for super-admin so the backend can resolve
      // the tenant scope (POST uses resolveTenantId, PUT just ignores it but
      // it's safer to keep the URL consistent). For PUT we read it from the
      // existing template row; for POST we use tenantQuery (already built).
      const saveUrl = template
        ? `/api/document-templates/${template.id}${template.tenant_id ? `?tenant_id=${encodeURIComponent(template.tenant_id)}` : tenantQuery}`
        : `/api/document-templates${tenantQuery}`;
      const url = api(saveUrl);
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${r.status}`);
      }
      toast.success(template ? "Template updated." : "Template created.");
      onSaved();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save template.";
      toast.error(message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  }

  const linkedLetterhead = letterheads.find((l) => l.id === form.letterhead_id) || null;
  const linkedSeal = seals.find((s) => s.id === form.seal_id) || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full" className="p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="size-5 text-primary" />
            {template ? "Edit template" : "New template"}
          </DialogTitle>
          <DialogDescription>
            Configure page layout, header/footer content, fonts, colors, table styling, and link a letterhead + seal.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="form" className="flex-1 min-h-0 flex flex-col gap-0">
          <div className="px-5 pt-3">
            <TabsList className="w-fit">
              <TabsTrigger value="form">
                <FileText className="size-4" /> Form editor
              </TabsTrigger>
              <TabsTrigger value="visual">
                <LayoutTemplate className="size-4" /> Visual editor
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="form" className="flex-1 min-h-0 flex flex-col mt-0">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
          {/* Left: form */}
          <div className="border-r border-border/60 min-h-0 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-5">
                <Accordion type="multiple" defaultValue={["basics", "links"]} className="w-full">
                  <AccordionItem value="basics">
                    <AccordionTrigger><SectionLabel icon={FileText} label="Basics" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Template name">
                          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Default offer template" />
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="links">
                    <AccordionTrigger><SectionLabel icon={Layers} label="Linked memorandum & seal" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Letterhead (memorandum firme)">
                          <Select
                            value={form.letterhead_id ?? "__none__"}
                            onValueChange={(v) => set("letterhead_id", v === "__none__" ? null : v)}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">— Use tenant default —</SelectItem>
                              {letterheads.map((l) => (
                                <SelectItem key={l.id} value={l.id}>
                                  {l.name}{l.is_default ? " (default)" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Seal (zigled)">
                          <Select
                            value={form.seal_id ?? "__none__"}
                            onValueChange={(v) => set("seal_id", v === "__none__" ? null : v)}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">— No seal —</SelectItem>
                              {seals.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}{s.is_default ? " (default)" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Stamp seal on this template">
                          <div className="flex items-center gap-2">
                            <Switch checked={form.seal_enabled} onCheckedChange={(v) => set("seal_enabled", v)} />
                            <span className="text-sm text-muted-foreground">
                              {form.seal_id ? "Apply the selected seal to generated PDFs" : "Select a seal first"}
                            </span>
                          </div>
                        </Field>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="page">
                    <AccordionTrigger><SectionLabel icon={LayoutTemplate} label="Page layout" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="header">
                    <AccordionTrigger><SectionLabel icon={AlignCenter} label="Header" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Enabled">
                          <div className="flex items-center gap-2">
                            <Switch checked={form.header_enabled} onCheckedChange={(v) => set("header_enabled", v)} />
                            <span className="text-sm text-muted-foreground">Show header on every page</span>
                          </div>
                        </Field>
                        {form.header_enabled && (
                          <>
                            <Field label="Height (mm)"><NumberInput value={form.header_height} onChange={(v) => set("header_height", v)} min={5} max={80} /></Field>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Header content</Label>
                              <p className="text-xs text-muted-foreground">
                                Define what text appears in the document header. Use placeholders to auto-fill company data.
                              </p>
                              <TemplateContentEditor
                                value={form.header_content || DEFAULT_HEADER_CONTENT_JSON}
                                onChange={(val) => set("header_content", val)}
                                label="Header Content"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <ToggleField label="Logo" checked={form.header_show_logo} onChange={(v) => set("header_show_logo", v)} />
                              <ToggleField label="Name" checked={form.header_show_company_name} onChange={(v) => set("header_show_company_name", v)} />
                              <ToggleField label="Contact" checked={form.header_show_contact} onChange={(v) => set("header_show_contact", v)} />
                            </div>
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="footer">
                    <AccordionTrigger><SectionLabel icon={AlignJustify} label="Footer" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Enabled">
                          <div className="flex items-center gap-2">
                            <Switch checked={form.footer_enabled} onCheckedChange={(v) => set("footer_enabled", v)} />
                            <span className="text-sm text-muted-foreground">Show footer on every page</span>
                          </div>
                        </Field>
                        {form.footer_enabled && (
                          <>
                            <Field label="Height (mm)"><NumberInput value={form.footer_height} onChange={(v) => set("footer_height", v)} min={5} max={60} /></Field>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Footer content</Label>
                              <p className="text-xs text-muted-foreground">
                                Define what text appears in the document footer. Use placeholders to auto-fill company data.
                              </p>
                              <TemplateContentEditor
                                value={form.footer_content || DEFAULT_FOOTER_CONTENT_JSON}
                                onChange={(val) => set("footer_content", val)}
                                label="Footer Content"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <ToggleField label="Page #" checked={form.footer_show_page_number} onChange={(v) => set("footer_show_page_number", v)} />
                              <ToggleField label="Bank" checked={form.footer_show_bank_details} onChange={(v) => set("footer_show_bank_details", v)} />
                              <ToggleField label="Tax ID" checked={form.footer_show_tax_id} onChange={(v) => set("footer_show_tax_id", v)} />
                            </div>
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bank-accounts">
                    <AccordionTrigger><SectionLabel icon={Building2} label="Bank accounts" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Select which of your bank accounts should appear in PDFs generated with this template.
                          Leave empty to show all accounts.
                        </p>
                        <BankAccountSelector
                          accounts={tenant?.bank_accounts ?? null}
                          selected={form.selected_bank_accounts ?? null}
                          onChange={(sel) => set("selected_bank_accounts", sel)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="body">
                    <AccordionTrigger><SectionLabel icon={Type} label="Body styling" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Field label="Font family"><Input value={form.body_font_family} onChange={(e) => set("body_font_family", e.target.value)} placeholder="Inter, system-ui, sans-serif" className="font-mono text-xs" /></Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Font size (px)"><NumberInput value={form.body_font_size} onChange={(v) => set("body_font_size", v)} min={7} max={24} /></Field>
                          <Field label="Line height"><NumberInput value={form.body_line_height} onChange={(v) => set("body_line_height", v)} min={1} max={2.5} step={0.1} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <ColorField label="Primary color" value={form.primary_color} onChange={(v) => set("primary_color", v)} />
                          <ColorField label="Accent color" value={form.accent_color} onChange={(v) => set("accent_color", v)} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="table">
                    <AccordionTrigger><SectionLabel icon={TableIcon} label="Table styling" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
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
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="variables">
                    <AccordionTrigger><SectionLabel icon={Type} label="Available variables" /></AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
              <div className="flex items-center gap-1.5">
                {linkedLetterhead && <Badge variant="outline" className="text-[10px]"><Building2 className="size-3" /> {linkedLetterhead.name}</Badge>}
                {linkedSeal && form.seal_enabled && <Badge variant="outline" className="text-[10px]"><Stamp className="size-3" /> {linkedSeal.name}</Badge>}
                <Badge variant="outline" className="text-xs">{form.page_size}</Badge>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6 flex items-center justify-center min-h-full">
                <div className="text-center text-muted-foreground max-w-sm">
                  <Eye className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Switch to "Visual Editor" tab to see the live layout</p>
                  <p className="text-xs mt-1.5">
                    This tab is for form-based settings (page size, colors, fonts, toggles).
                    The visual editor renders the actual field positions.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
          </div>
          </TabsContent>
          <TabsContent value="visual" className="flex-1 min-h-0 mt-0">
            <TemplateVisualEditor
              template={form}
              onChange={(updates) => setForm((p) => ({ ...p, ...updates }))}
              pageSize={form.page_size === "Letter" ? "Letter" : "A4"}
              letterhead={linkedLetterhead}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-5 py-4 border-t border-border/60 bg-card">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="size-4 mr-1" /> Save template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Shared form building blocks
// ============================================================

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </span>
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
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 rounded-md border border-border/60 cursor-pointer bg-card p-0.5"
        />
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 font-mono text-xs flex-1"
        />
      </div>
    </div>
  );
}

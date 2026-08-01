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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Plus, Search, Users, Pencil, Trash2, Eye, Mail, Phone, Globe, MapPin,
  Building2, ShieldCheck, Star, Maximize2, DollarSign,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtMoney, fmtDate, fmtRelative } from "@/lib/utils/format";
import { Partner, PartnerType } from "@/lib/supabase/types";
import { useAppStore } from "@/lib/store/app-store";
import { CURRENCIES, ENTITY_TYPES, PARTNER_TYPES, PARTNER_CATEGORIES, PAYMENT_TERMS_LOCAL, COUNTRIES } from "@/lib/data/reference";

const TYPE_LABELS: Record<PartnerType, string> = {
  customer: "Customer", supplier: "Supplier", reseller: "Reseller", partner: "Partner",
};

const STATUS_LABELS = {
  active: "Active", inactive: "Inactive", blacklisted: "Blacklisted",
} as const;

const STATUS_BADGE = {
  active: "default", inactive: "secondary", blacklisted: "destructive",
} as const;

const KYC_LABELS = {
  not_submitted: "Not submitted", pending: "Pending", approved: "Approved", rejected: "Rejected",
} as const;

function riskColor(score: number): string {
  if (score < 30) return "text-emerald-600";
  if (score < 60) return "text-amber-600";
  return "text-destructive";
}

export function PartnersView() {
  const qc = useQueryClient();
  const setView = useAppStore((s) => s.setView);
  const setSelectedId = useAppStore((s) => s.setSelectedId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Partner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["partners", search, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      const r = await fetch(`/api/partners?${params}`);
      if (!r.ok) throw new Error("Failed to load partners");
      return r.json() as Promise<{ items: Partner[]; total: number }>;
    },
  });

  const detail = useQuery({
    queryKey: ["partner", detailId],
    queryFn: async () => {
      const r = await fetch(`/api/partners/${detailId}`);
      if (!r.ok) throw new Error("Failed to load partner");
      return r.json() as Promise<Partner>;
    },
    enabled: !!detailId,
  });

  const partnerDeals = useQuery({
    queryKey: ["deals", "partner", detailId],
    queryFn: async () => {
      const r = await fetch(`/api/deals?partner_id=${detailId}`);
      if (!r.ok) throw new Error("Failed to load deals");
      return r.json() as Promise<{ items: any[] }>;
    },
    enabled: !!detailId,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/partners/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Partner deleted.");
      qc.invalidateQueries({ queryKey: ["partners"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title="Partners"
        description={`${data?.total ?? 0} total`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> New partner
          </Button>
        }
      />

      <Card className="mb-4 border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, contact…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blacklisted">Blacklisted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="supplier">Supplier</SelectItem>
              <SelectItem value="reseller">Reseller</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
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
              icon={<Users className="size-6" />}
              title="No partners"
              description="Add your first partner to get started."
              action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New partner</Button>}
            />
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Risk</TableHead>
                    <TableHead className="hidden xl:table-cell">KYC</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setDetailId(p.id)}
                    >
                      <TableCell>
                        <div className="font-medium flex items-center gap-1.5">
                          {p.name}
                          {p.is_commissioner && (
                            <DollarSign className="size-3.5 text-primary" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {[p.city, p.country].filter(Boolean).join(", ") || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{TYPE_LABELS[p.type]}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">{p.contact_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{p.contact_email || p.email || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={p.risk_score} className="h-1.5 w-16" />
                          <span className={`text-xs tabular ${riskColor(p.risk_score)}`}>{p.risk_score}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Badge variant={p.kyc_status === "approved" ? "default" : p.kyc_status === "pending" ? "secondary" : "outline"}>
                          {KYC_LABELS[p.kyc_status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="size-8" onClick={() => setDetailId(p.id)} title="View">
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-primary"
                            title="View 360°"
                            onClick={() => {
                              setSelectedId(p.id);
                              setView("partner-360");
                            }}
                          >
                            <Maximize2 className="size-4" />
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form dialog */}
      <PartnerFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        partner={editing}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["partners"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              {detail.data?.name || "Partner"}
            </SheetTitle>
            <SheetDescription>Partner details</SheetDescription>
          </SheetHeader>
          {detail.isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detail.data ? (
            <PartnerDetail partner={detail.data} deals={partnerDeals.data?.items || []} />
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete partner?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Related offers and deals may lose their reference.
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
function PartnerDetail({ partner, deals }: { partner: Partner; deals: any[] }) {
  const info = [
    { icon: Mail, label: "Email", value: partner.email },
    { icon: Phone, label: "Phone", value: partner.phone },
    { icon: Globe, label: "Website", value: partner.website },
    { icon: MapPin, label: "Address", value: [partner.address_line, partner.postal_code, partner.city, partner.country].filter(Boolean).join(", ") || null },
    { icon: Building2, label: "Tax ID", value: partner.tax_id },
  ].filter((x) => x.value);

  return (
    <div className="px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={STATUS_BADGE[partner.status]}>{STATUS_LABELS[partner.status]}</Badge>
        <Badge variant="outline">{TYPE_LABELS[partner.type]}</Badge>
        <Badge variant={partner.kyc_status === "approved" ? "default" : "outline"} className="gap-1">
          <ShieldCheck className="size-3" /> {KYC_LABELS[partner.kyc_status]}
        </Badge>
        {partner.portal_enabled && (
          <Badge variant="secondary" className="gap-1">
            <Star className="size-3" /> Portal: {partner.portal_level}
          </Badge>
        )}
        {partner.is_commissioner && (
          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
            <DollarSign className="size-3" /> Commission Agent
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Risk</p>
            <p className={`text-2xl font-semibold tabular ${riskColor(partner.risk_score)}`}>{partner.risk_score}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Deals</p>
            <p className="text-2xl font-semibold tabular">{deals.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-2 mt-3">
          <div className="text-sm">
            <p className="text-xs text-muted-foreground mb-1">Created</p>
            <p>{fmtDate(partner.created_at)}</p>
          </div>
          {partner.notes && (
            <div className="text-sm mt-3">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="whitespace-pre-wrap p-3 rounded-md bg-muted/50">{partner.notes}</p>
            </div>
          )}
          {partner.tags && partner.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {partner.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-2 mt-3">
          {info.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No contact information.</p>
          ) : info.map((x) => {
            const Icon = x.icon;
            return (
              <div key={x.label} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/30">
                <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{x.label}</p>
                  <p className="text-sm break-words">{x.value}</p>
                </div>
              </div>
            );
          })}
          <div className="pt-3 border-t mt-3">
            <p className="text-xs text-muted-foreground mb-2">Bank</p>
            <div className="text-sm space-y-0.5">
              <p>{partner.bank_name || "—"}</p>
              <p className="font-mono text-xs tabular">{partner.bank_account || "—"}</p>
              <p className="font-mono text-xs text-muted-foreground tabular">{partner.bank_swift || ""}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deals" className="mt-3">
          {deals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No deals yet.</p>
          ) : (
            <div className="space-y-2">
              {deals.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-md border border-border/60">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{d.stage} · {fmtDate(d.expected_close)}</p>
                  </div>
                  <span className="text-sm font-mono tabular">{fmtMoney(d.value, d.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">Updated {fmtRelative(partner.updated_at)}</p>
      </div>
    </div>
  );
}

// ---- Simplified type options ----
const SIMPLIFIED_TYPES = [
  { value: "buyer", label: "Customer (Buyer)", description: "Buys from you" },
  { value: "supplier", label: "Supplier", description: "Sells to you" },
  { value: "both", label: "Both", description: "Both buyer and supplier" },
  { value: "agent", label: "Agent", description: "Commission agent" },
] as const;

const OTHER_TYPES = [
  { value: "logistics", label: "Logistics Provider" },
  { value: "customs", label: "Customs Broker" },
  { value: "bank", label: "Bank / Financial" },
  { value: "inspector", label: "Inspection Agency" },
];

// ---- Form dialog ----
function PartnerFormDialog({
  open, onOpenChange, partner, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  partner: Partner | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Partner>>({});
  const [saving, setSaving] = useState(false);
  const [showOtherTypes, setShowOtherTypes] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const isEditing = !!partner;

  useMemo(() => {
    if (open) {
      if (partner) {
        setForm({ ...partner });
        // When editing, open sections that have data
        const hasAddress = partner.address_line || partner.city || partner.postal_code || partner.country;
        const hasContact = partner.contact_name || partner.contact_email || partner.contact_phone;
        const hasBank = partner.bank_name || partner.bank_account || partner.bank_swift;
        const hasNotes = partner.notes || partner.portal_enabled || partner.is_commissioner;
        setAddressOpen(!!hasAddress);
        setContactOpen(!!hasContact);
        setBankOpen(!!hasBank);
        setNotesOpen(!!hasNotes);
        setShowOtherTypes(["logistics", "customs", "bank", "inspector"].includes(partner.type));
      } else {
        setForm({
          type: "buyer", status: "active", risk_score: 0, preferred_currency: "EUR",
          entity_type: "company", category: "new", preferred_payment_terms: "net30",
          portal_enabled: false, portal_level: "none", kyc_status: "not_submitted",
        } as Partial<Partner>);
        setAddressOpen(false);
        setContactOpen(false);
        setBankOpen(false);
        setNotesOpen(false);
        setShowOtherTypes(false);
      }
    }
  }, [open, partner]);

  function set<K extends keyof Partner>(k: K, v: Partner[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const handleTypeChange = useCallback((v: string) => {
    if (v === "other") {
      setShowOtherTypes(true);
      // Don't change the actual type yet — user must pick from sub-list
    } else {
      setShowOtherTypes(false);
      set("type", v as PartnerType);
      // Smart category defaults for new partners
      if (!isEditing) {
        if (v === "buyer") {
          set("category", "new");
        } else if (v === "supplier") {
          set("category", "regular");
        }
      }
    }
  }, [isEditing]);

  async function save() {
    if (!form.name) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      const method = partner ? "PUT" : "POST";
      const url = partner ? `/api/partners/${partner.id}` : "/api/partners";
      const payload = { ...form, risk_score: form.risk_score ?? 0 };
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Request failed");
      }
      toast.success(partner ? "Partner updated." : `"${form.name}" created successfully!`);
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  // Determine the simplified type value for display
  const simplifiedTypeValue = SIMPLIFIED_TYPES.find((t) => t.value === form.type)
    ? (form.type as string)
    : (showOtherTypes ? "other" : form.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{partner ? "Edit partner" : "New partner"}</DialogTitle>
          <DialogDescription>
            {partner ? "Update partner information." : "Start with the essentials — you can add more details later."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1 custom-scroll">
          <div className="space-y-4 py-2">

            {/* === Essential Fields (always visible) === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Name *</Label>
                <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Acme Trading Ltd." />
              </div>

              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={simplifiedTypeValue || "buyer"} onValueChange={handleTypeChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SIMPLIFIED_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex flex-col">
                          <span>{t.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                    <SelectItem value="other">
                      <span>Other…</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {/* Show description hint for selected simplified type */}
                {form.type && SIMPLIFIED_TYPES.find((t) => t.value === form.type) && (
                  <p className="text-xs text-muted-foreground">
                    {SIMPLIFIED_TYPES.find((t) => t.value === form.type)?.description}
                  </p>
                )}
              </div>

              {/* Sub-select for "Other" types */}
              {showOtherTypes && (
                <div className="space-y-1.5">
                  <Label>Specific Type</Label>
                  <Select value={form.type || "logistics"} onValueChange={(v) => set("type", v as PartnerType)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {OTHER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="contact@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 123 4567" />
              </div>
            </div>

            {/* === Address & Details (collapsible) === */}
            <Collapsible open={addressOpen} onOpenChange={setAddressOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {addressOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  Address &amp; Details
                  {!addressOpen && (form.address_line || form.city || form.tax_id) && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Filled</Badge>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 pb-2">
                  <div className="space-y-1.5">
                    <Label>Entity Type</Label>
                    <Select value={form.entity_type || "company"} onValueChange={(v) => set("entity_type", v)}>
                      <SelectTrigger><SelectValue placeholder="Select entity type" /></SelectTrigger>
                      <SelectContent>
                        {ENTITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => set("status", v as Partner["status"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blacklisted">Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={form.category || "regular"} onValueChange={(v) => set("category", v)}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {PARTNER_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tax ID</Label>
                    <Input value={form.tax_id || ""} onChange={(e) => set("tax_id", e.target.value)} placeholder="e.g. VAT number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Website</Label>
                    <Input value={form.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select value={form.preferred_currency || "EUR"} onValueChange={(v) => set("preferred_currency", v)}>
                      <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment Terms</Label>
                    <Select value={form.preferred_payment_terms || "net30"} onValueChange={(v) => set("preferred_payment_terms", v)}>
                      <SelectTrigger><SelectValue placeholder="Select payment terms" /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS_LOCAL.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Address</Label>
                    <Input value={form.address_line || ""} onChange={(e) => set("address_line", e.target.value)} placeholder="Street and number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Postal code</Label>
                    <Input value={form.postal_code || ""} onChange={(e) => set("postal_code", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Country</Label>
                    <Select value={form.country || ""} onValueChange={(v) => set("country", v)}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* === Contact Person (collapsible) === */}
            <Collapsible open={contactOpen} onOpenChange={setContactOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {contactOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  Contact Person
                  {!contactOpen && (form.contact_name || form.contact_email) && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Filled</Badge>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 pb-2">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input value={form.contact_name || ""} onChange={(e) => set("contact_name", e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={form.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} placeholder="john@company.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input value={form.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+1 555 123 4567" />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* === Bank Details (collapsible) === */}
            <Collapsible open={bankOpen} onOpenChange={setBankOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {bankOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  Bank Details
                  {!bankOpen && (form.bank_name || form.bank_account) && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Filled</Badge>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 pb-2">
                  <div className="space-y-1.5">
                    <Label>Bank Name</Label>
                    <Input value={form.bank_name || ""} onChange={(e) => set("bank_name", e.target.value)} placeholder="e.g. Deutsche Bank" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Account</Label>
                    <Input value={form.bank_account || ""} onChange={(e) => set("bank_account", e.target.value)} placeholder="IBAN or account number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>SWIFT / BIC</Label>
                    <Input value={form.bank_swift || ""} onChange={(e) => set("bank_swift", e.target.value)} placeholder="e.g. DEUTDEFF" />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* === Notes & Options (collapsible) === */}
            <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {notesOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  Notes &amp; Options
                  {!notesOpen && form.notes && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Filled</Badge>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3 pt-1 pb-2">
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea rows={3} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Any additional notes about this partner…" />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
                    <Switch checked={!!form.portal_enabled} onCheckedChange={(v) => set("portal_enabled", v)} />
                    <div>
                      <p className="text-sm font-medium">Portal access</p>
                      <p className="text-xs text-muted-foreground">Allow partner portal access.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-md bg-primary/5 border border-primary/20">
                    <Switch checked={!!form.is_commissioner} onCheckedChange={(v) => set("is_commissioner", v)} />
                    <div>
                      <p className="text-sm font-medium text-primary">Commission Agent (Komisionar)</p>
                      <p className="text-xs text-muted-foreground">Mark this partner as a commission agent who earns a percentage or fixed amount from deals they introduce.</p>
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
            {saving ? "Saving…" : (partner ? "Save changes" : "Create partner")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

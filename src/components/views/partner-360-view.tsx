"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Pencil, FileText, Handshake, Mail, Phone, Globe, MapPin,
  Building2, ShieldCheck, Star, Landmark, Receipt, FileCheck2,
  CheckCircle2, Clock, XCircle, AlertTriangle, Send, Ban, Plus,
  Download, Eye, FileSignature, Calculator, Inbox, UserX,
  Calendar, Tag, FileBadge, Trash2, KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useAppStore, useCan } from "@/lib/store/app-store";
import { EmptyState } from "@/components/common/empty-state";
import {
  fmtMoney, fmtNumber, fmtDate, fmtDateTime, fmtRelative, fmtBytes,
} from "@/lib/utils/format";
import { getCountry } from "@/lib/data/reference";
import {
  Partner, Deal, DealStage, Offer, Invoice, SharedDocument,
  KycSubmission, PortalRfq, PortalAccess,
} from "@/lib/supabase/types";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import { cn } from "@/lib/utils";

// Local KYC status union (pre-existing duplicate KycStatus export collapses
// the imported symbol — same workaround used in kyc-review-view.tsx).
type KycSubmissionStatus =
  | "draft" | "submitted" | "under_review" | "approved" | "rejected" | "resubmit";

const KYC_STATUS_LABELS: Record<KycSubmissionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  resubmit: "Resubmit",
};

function asKycStatus(s: string | null | undefined): KycSubmissionStatus | null {
  if (!s) return null;
  if (s in KYC_STATUS_LABELS) return s as KycSubmissionStatus;
  return null;
}

// ---------- deal stage lookups ----------
const STAGE_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

function stageBadgeClass(stage: DealStage): string {
  switch (stage) {
    case "won": return "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "lost": return "border-transparent bg-destructive text-white";
    case "negotiation": return "border-transparent bg-primary/15 text-primary";
    case "proposal": return "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    case "qualified": return "border-transparent bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200";
    default: return "border-transparent bg-muted text-muted-foreground";
  }
}

// ---------- offer status lookups ----------
const OFFER_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

function offerStatusClass(status: string): string {
  switch (status) {
    case "accepted": return "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "rejected": return "border-transparent bg-destructive text-white";
    case "sent": return "border-transparent bg-primary/15 text-primary";
    case "expired": return "border-transparent bg-muted text-muted-foreground";
    default: return "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
  }
}

// ---------- invoice status lookups ----------
const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

function invoiceStatusClass(status: string): string {
  switch (status) {
    case "paid": return "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "overdue": return "border-transparent bg-destructive text-white";
    case "sent": return "border-transparent bg-primary/15 text-primary";
    case "cancelled": return "border-transparent bg-muted text-muted-foreground";
    default: return "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
  }
}

// ---------- portal access ----------
const PORTAL_TIER_LABELS: Record<string, string> = {
  limited: "Basic (legacy)",
  basic: "Basic",
  standard: "Standard",
  business: "Business",
  premium: "Premium",
};

// Ordered from most to least privileged, matching src/lib/portal/tiers.ts
const TIER_ORDER: { value: string; label: string; hint: string }[] = [
  { value: "premium",  label: "Premium",  hint: "VIP · KYC optional · full features" },
  { value: "business", label: "Business", hint: "Full KYC · PDF download · RFQ" },
  { value: "standard", label: "Standard", hint: "Full KYC · RFQ · no PDF download" },
  { value: "basic",    label: "Basic",    hint: "Read-only, no RFQ / PDF" },
];

function portalStatusClass(status: string): string {
  switch (status) {
    case "active": return "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "suspended": return "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    case "revoked": return "border-transparent bg-destructive text-white";
    case "invited": return "border-transparent bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200";
    default: return "border-transparent bg-muted text-muted-foreground";
  }
}

// ---------- helpers ----------
function riskColor(score: number): string {
  if (score < 30) return "text-emerald-600";
  if (score < 60) return "text-amber-600";
  return "text-destructive";
}

function riskStroke(score: number): string {
  if (score < 30) return "stroke-emerald-500";
  if (score < 60) return "stroke-amber-500";
  return "stroke-destructive";
}

// ============================================================
// Main view
// ============================================================
export function Partner360View() {
  const selectedId = useAppStore((s) => s.selectedId);
  const setSelectedId = useAppStore((s) => s.setSelectedId);
  const setView = useAppStore((s) => s.setView);
  const user = useAppStore((s) => s.user);

  if (!selectedId) {
    return (
      <div className="max-w-2xl mx-auto pt-12">
        <EmptyState
          icon={<Building2 className="size-6" />}
          title="Select a partner to view 360° details"
          description="Open a partner from the Partners list and click 'View 360°' to see their complete profile — deals, offers, invoices, documents, KYC and portal activity in one place."
          action={
            <Button onClick={() => setView("partners")}>
              <Building2 className="size-4 mr-1.5" /> Open partners
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <Partner360Content
      partnerId={selectedId}
      onBack={() => {
        setSelectedId(null);
        setView("partners");
      }}
      canAdmin={!!user && (user.role === "admin" || user.role === "super_admin")}
    />
  );
}

// ============================================================
// Content (only mounts when we have an id)
// ============================================================
function Partner360Content({
  partnerId, onBack, canAdmin,
}: {
  partnerId: string;
  onBack: () => void;
  canAdmin: boolean;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const setView = useAppStore((s) => s.setView);
  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);

  // ---------- parallel queries ----------
  const partnerQ = useQuery<Partner>({
    queryKey: ["partner", tenantKey, partnerId],
    queryFn: async () => {
      const r = await fetch(api(`/api/partners/${partnerId}`));
      if (!r.ok) throw new Error("Failed to load partner");
      return r.json();
    },
  });

  const dealsQ = useQuery<{ items: Deal[] }>({
    queryKey: ["deals", tenantKey, "partner360", partnerId],
    queryFn: async () => {
      const r = await fetch(api(`/api/deals?partner_id=${partnerId}&limit=500`));
      if (!r.ok) throw new Error("Failed to load deals");
      return r.json();
    },
  });

  const offersQ = useQuery<{ items: Offer[] }>({
    queryKey: ["offers", tenantKey, "partner360", partnerId],
    queryFn: async () => {
      const r = await fetch(api(`/api/offers?partner_id=${partnerId}&limit=500`));
      if (!r.ok) throw new Error("Failed to load offers");
      return r.json();
    },
  });

  const invoicesQ = useQuery<{ items: Invoice[] }>({
    queryKey: ["invoices", tenantKey, "partner360", partnerId],
    queryFn: async () => {
      const r = await fetch(api(`/api/invoices?partner_id=${partnerId}&limit=500`));
      if (!r.ok) throw new Error("Failed to load invoices");
      return r.json();
    },
  });

  const documentsQ = useQuery<{ items: SharedDocument[] }>({
    queryKey: ["documents", tenantKey, "partner360", partnerId],
    queryFn: async () => {
      const r = await fetch(api(`/api/documents?partner_id=${partnerId}&limit=500`));
      if (!r.ok) throw new Error("Failed to load documents");
      return r.json();
    },
  });

  const kycQ = useQuery<{ items: KycSubmission[] }>({
    queryKey: ["kyc", tenantKey, "partner360", partnerId],
    queryFn: async () => {
      const r = await fetch(api("/api/kyc"));
      if (!r.ok) throw new Error("Failed to load KYC");
      return r.json();
    },
  });

  const rfqsQ = useQuery<{ items: PortalRfq[] }>({
    queryKey: ["portal-rfqs", tenantKey, "partner360", partnerId],
    queryFn: async () => {
      const r = await fetch(api(`/api/portal-rfqs?partner_id=${partnerId}`));
      if (!r.ok) throw new Error("Failed to load RFQs");
      return r.json();
    },
  });

  const portalAccessQ = useQuery<{ items: PortalAccess[] }>({
    queryKey: ["portal-access", tenantKey, "partner360", partnerId],
    queryFn: async () => {
      const r = await fetch(api("/api/portal-access"));
      if (!r.ok) throw new Error("Failed to load portal access");
      return r.json();
    },
  });

  // ---------- derived ----------
  const partner = partnerQ.data;
  const deals = dealsQ.data?.items || [];
  const offers = offersQ.data?.items || [];
  const invoices = invoicesQ.data?.items || [];
  const documents = documentsQ.data?.items || [];

  const kycSubmission = useMemo(() => {
    const items = kycQ.data?.items || [];
    return items.find((k) => k.partner_id === partnerId) || null;
  }, [kycQ.data, partnerId]);

  const portalAccess = useMemo(() => {
    const items = portalAccessQ.data?.items || [];
    return items.find((p) => p.partner_id === partnerId) || null;
  }, [portalAccessQ.data, partnerId]);

  const rfqs = useMemo(() => {
    const items = rfqsQ.data?.items || [];
    return items.filter((r) => r.partner_id === partnerId);
  }, [rfqsQ.data, partnerId]);

  const totalDealValue = useMemo(
    () => deals.reduce((s, d) => s + (d.value || 0), 0),
    [deals],
  );
  const openDeals = useMemo(
    () => deals.filter((d) => d.stage !== "won" && d.stage !== "lost").length,
    [deals],
  );
  const outstandingInvoices = useMemo(
    () => invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + (i.total || 0), 0),
    [invoices],
  );
  const lastActivity = useMemo(() => {
    const all: string[] = [];
    if (partner?.updated_at) all.push(partner.updated_at);
    for (const d of deals) if (d.updated_at) all.push(d.updated_at);
    for (const o of offers) if (o.updated_at) all.push(o.updated_at);
    for (const i of invoices) if (i.updated_at) all.push(i.updated_at);
    all.sort((a, b) => b.localeCompare(a));
    return all[0] || null;
  }, [partner, deals, offers, invoices]);

  const loading = partnerQ.isLoading;

  if (loading) return <Partner360Skeleton onBack={onBack} />;

  if (!partner) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="size-4 mr-1" /> Back to partners
        </Button>
        <EmptyState
          icon={<AlertTriangle className="size-6" />}
          title="Partner not found"
          description="This partner may have been deleted."
          action={<Button onClick={onBack}>Back to partners</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4 mr-1" /> Back to partners
      </Button>

      {/* ---------- Header card ---------- */}
      <HeaderCard
        partner={partner}
        portalAccess={portalAccess}
        dealsCount={deals.length}
        onEdit={() => setEditOpen(true)}
        onNewOffer={() => setView("offers")}
        onNewDeal={() => setView("deals")}
        canAdmin={canAdmin}
      />

      {/* ---------- Tabs ---------- */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto custom-scroll h-auto flex-wrap sm:flex-nowrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">
            Deals <Badge variant="secondary" className="ml-1.5 tabular">{deals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="finance">
            Offers &amp; Invoices <Badge variant="secondary" className="ml-1.5 tabular">{offers.length + invoices.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents <Badge variant="secondary" className="ml-1.5 tabular">{documents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="kyc">
            KYC &amp; Compliance
          </TabsTrigger>
          <TabsTrigger value="portal">
            Portal Activity
          </TabsTrigger>
        </TabsList>

        {/* ---------- Overview tab ---------- */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* mini KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniKpi label="Total Deal Value" value={fmtMoney(totalDealValue, partner.preferred_currency || "USD")} icon={Handshake} />
            <MiniKpi label="Open Deals" value={fmtNumber(openDeals)} icon={FileText} />
            <MiniKpi label="Outstanding Invoices" value={fmtMoney(outstandingInvoices, partner.preferred_currency || "USD")} icon={Receipt} />
            <MiniKpi label="Last Activity" value={lastActivity ? fmtRelative(lastActivity) : "—"} icon={Clock} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Company info */}
            <Card className="card-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="size-4 text-primary" /> Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <DefRow label="Legal name" value={partner.name} />
                <DefRow label="Entity type" value={partner.entity_type === "company" ? "Company" : "Individual"} />
                <DefRow label="Trade name" value={partner.website || "—"} icon={Globe} />
                <DefRow label="Tax ID" value={partner.tax_id} mono />
                <DefRow label="VAT number" value={partner.vat_number} mono />
                <DefRow label="Registration #" value={partner.registration_number} mono />
                <Separator className="my-2" />
                <DefRow
                  label="Country"
                  value={partner.country ? `${getCountry(partner.country)?.name || partner.country} (${partner.country})` : "—"}
                  icon={MapPin}
                />
                <DefRow
                  label="Address"
                  value={[
                    partner.address_line,
                    [partner.postal_code, partner.city].filter(Boolean).join(" "),
                    partner.state,
                  ].filter(Boolean).join(", ") || "—"}
                  icon={MapPin}
                />
              </CardContent>
            </Card>

            {/* Contact & Bank */}
            <Card className="card-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="size-4 text-primary" /> Contact &amp; Bank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <DefRow label="Contact person" value={partner.contact_name} icon={UserX} />
                <DefRow label="Email" value={partner.contact_email || partner.email} icon={Mail} />
                <DefRow label="Phone" value={partner.contact_phone || partner.phone} icon={Phone} />
                <Separator className="my-2" />
                <DefRow label="Bank name" value={partner.bank_name} icon={Landmark} />
                <DefRow label="Account" value={partner.bank_account} mono />
                <DefRow label="IBAN" value={partner.bank_iban} mono />
                <DefRow label="SWIFT" value={partner.bank_swift} mono />
              </CardContent>
            </Card>

            {/* Trade preferences */}
            <Card className="card-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="size-4 text-primary" /> Trade Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <DefRow label="Preferred currency" value={partner.preferred_currency} mono />
                <DefRow label="Incoterm" value={partner.preferred_incoterm} mono />
                <DefRow label="Payment terms" value={partner.preferred_payment_terms} />
                <DefRow label="Partner type" value={partner.type} />
                <DefRow label="Status" value={partner.status} />
              </CardContent>
            </Card>

            {/* Tags + notes */}
            <Card className="card-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="size-4 text-primary" /> Tags &amp; Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Tags</p>
                  {partner.tags && partner.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {partner.tags.map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags.</p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Notes</p>
                  {partner.notes ? (
                    <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/50">{partner.notes}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No notes.</p>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created <span className="tabular">{fmtDate(partner.created_at)}</span></span>
                  <span>Updated <span className="tabular">{fmtRelative(partner.updated_at)}</span></span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------- Deals tab ---------- */}
        <TabsContent value="deals" className="mt-4 space-y-4">
          {/* Pipeline summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {(["lead", "qualified", "proposal", "negotiation", "won", "lost"] as DealStage[]).map((s) => {
              const items = deals.filter((d) => d.stage === s);
              return (
                <Card key={s} className="card-premium p-4">
                  <p className="text-xs text-muted-foreground">{STAGE_LABELS[s]}</p>
                  <p className="text-2xl font-semibold mt-1 tabular">{items.length}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 tabular">
                    {fmtMoney(items.reduce((sum, d) => sum + (d.value || 0), 0))}
                  </p>
                </Card>
              );
            })}
          </div>

          <Card className="card-premium">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">All Deals</CardTitle>
              <CardDescription>Click a deal to open it in the deals view</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No deals yet for this partner.</p>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto custom-scroll">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Probability</TableHead>
                        <TableHead className="hidden lg:table-cell">Expected Close</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deals.map((d) => (
                        <TableRow
                          key={d.id}
                          className="cursor-pointer hover:bg-muted/40 smooth-fast"
                          onClick={() => {
                            useAppStore.getState().setSelectedId(d.id);
                            setView("deals");
                          }}
                        >
                          <TableCell className="font-medium">{d.title}</TableCell>
                          <TableCell>
                            <Badge className={stageBadgeClass(d.stage)}>{STAGE_LABELS[d.stage]}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular">{fmtMoney(d.value, d.currency)}</TableCell>
                          <TableCell className="text-right hidden md:table-cell tabular">{d.probability}%</TableCell>
                          <TableCell className="hidden lg:table-cell tabular text-muted-foreground">
                            {d.expected_close ? fmtDate(d.expected_close) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="size-7" aria-label="View" title="View">
                              <Eye className="size-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Offers & Invoices tab ---------- */}
        <TabsContent value="finance" className="mt-4 space-y-4">
          {/* Offers */}
          <Card className="card-premium">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4 text-primary" /> Offers
                    <Badge variant="secondary" className="tabular">{offers.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Total: <span className="tabular font-medium">
                      {fmtMoney(offers.reduce((s, o) => s + (o.total || 0), 0))}
                    </span>
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setView("offers")}>
                  <Plus className="size-4 mr-1" /> New offer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {offers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No offers yet for this partner.</p>
              ) : (
                <div className="max-h-80 overflow-y-auto custom-scroll">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead>Number</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">PDF</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs tabular">{o.number}</TableCell>
                          <TableCell className="font-medium truncate max-w-[200px]">{o.subject}</TableCell>
                          <TableCell><Badge className={offerStatusClass(o.status)}>{OFFER_STATUS_LABELS[o.status] || o.status}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell tabular text-muted-foreground text-xs">{fmtDate(o.created_at)}</TableCell>
                          <TableCell className="text-right tabular">{fmtMoney(o.total, o.currency)}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="icon" variant="ghost" className="size-7" title="Download" aria-label="Download">
                              <a href={`/api/offers/${o.id}/pdf`} target="_blank" rel="noreferrer" download>
                                <Download className="size-3.5" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="card-premium">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="size-4 text-primary" /> Invoices
                    <Badge variant="secondary" className="tabular">{invoices.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Total: <span className="tabular font-medium">
                      {fmtMoney(invoices.reduce((s, i) => s + (i.total || 0), 0))}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No invoices yet for this partner.</p>
              ) : (
                <div className="max-h-80 overflow-y-auto custom-scroll">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead>Number</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Due</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">PDF</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((i) => (
                        <TableRow key={i.id}>
                          <TableCell className="font-mono text-xs tabular">{i.number}</TableCell>
                          <TableCell className="font-medium truncate max-w-[200px]">{i.subject}</TableCell>
                          <TableCell><Badge className={invoiceStatusClass(i.status)}>{INVOICE_STATUS_LABELS[i.status] || i.status}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell tabular text-muted-foreground text-xs">{fmtDate(i.due_date)}</TableCell>
                          <TableCell className="text-right tabular">{fmtMoney(i.total, i.currency)}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="icon" variant="ghost" className="size-7" title="Download" aria-label="Download">
                              <a href={`/api/invoices/${i.id}/pdf`} target="_blank" rel="noreferrer" download>
                                <Download className="size-3.5" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Documents tab ---------- */}
        <TabsContent value="documents" className="mt-4">
          <DocumentsTab
            partnerId={partnerId}
            documents={documents}
            canAdmin={canAdmin}
            onUploaded={() => {
              qc.invalidateQueries({ queryKey: ["documents", tenantKey, "partner360", partnerId] });
            }}
          />
        </TabsContent>

        {/* ---------- KYC & Compliance tab ---------- */}
        <TabsContent value="kyc" className="mt-4">
          <KycTab
            submission={kycSubmission}
            partnerName={partner.name}
            onReview={() => setView("kyc-review")}
            canAdmin={canAdmin}
          />
        </TabsContent>

        {/* ---------- Portal Activity tab ---------- */}
        <TabsContent value="portal" className="mt-4">
          <PortalTab
            partnerId={partnerId}
            partnerName={partner.name}
            portalAccess={portalAccess}
            rfqs={rfqs}
            canAdmin={canAdmin}
          />
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      {editOpen && partner && (
        <QuickEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          partner={partner}
          onSaved={() => {
            setEditOpen(false);
            qc.invalidateQueries({ queryKey: ["partner", tenantKey, partnerId] });
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Header card
// ============================================================
function HeaderCard({
  partner, portalAccess, dealsCount, onEdit, onNewOffer, onNewDeal, canAdmin,
}: {
  partner: Partner;
  portalAccess: PortalAccess | null;
  dealsCount: number;
  onEdit: () => void;
  onNewOffer: () => void;
  onNewDeal: () => void;
  canAdmin: boolean;
}) {
  const statusClass =
    partner.status === "active"
      ? "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
      : partner.status === "blacklisted"
      ? "border-transparent bg-destructive text-white"
      : "border-transparent bg-muted text-muted-foreground";

  return (
    <div className="border-gradient bg-mesh rounded-[var(--radius-xl)] p-5 md:p-6 shadow-soft">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="size-14 rounded-2xl bg-gradient-emerald text-white flex items-center justify-center font-semibold text-lg shrink-0 shadow-soft-md">
            {partner.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight truncate">
              {partner.name}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge variant="outline" className="capitalize">
                <Building2 className="size-3 mr-1" />
                {partner.entity_type === "company" ? "Company" : "Individual"}
              </Badge>
              <Badge className={`${statusClass} capitalize`}>
                {partner.status}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {partner.type}
              </Badge>
              {portalAccess && (
                <Badge className="border-transparent bg-primary/15 text-primary">
                  <Star className="size-3 mr-1" />
                  {PORTAL_TIER_LABELS[portalAccess.tier] || portalAccess.tier}
                </Badge>
              )}
              {partner.kyc_status === "approved" && (
                <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                  <ShieldCheck className="size-3 mr-1" /> KYC approved
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Risk gauge */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-card/60 backdrop-blur border border-border/60 shrink-0">
          <RiskGauge score={partner.risk_score} />
          <div className="text-sm">
            <p className="text-xs text-muted-foreground">Risk score</p>
            <p className={`text-2xl font-semibold tabular ${riskColor(partner.risk_score)}`}>
              {partner.risk_score}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {partner.risk_score < 30 ? "Low" : partner.risk_score < 60 ? "Medium" : "High"}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 lg:border-l lg:pl-5 border-border/60">
          <div>
            <p className="text-xs text-muted-foreground">Deals</p>
            <p className="text-lg font-semibold tabular">{dealsCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Country</p>
            <p className="text-lg font-semibold">{partner.country || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Currency</p>
            <p className="text-lg font-semibold">{partner.preferred_currency || "—"}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {canAdmin && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="size-4 mr-1" /> Edit
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onNewOffer}>
            <FileText className="size-4 mr-1" /> New offer
          </Button>
          <Button size="sm" onClick={onNewDeal}>
            <Handshake className="size-4 mr-1" /> New deal
          </Button>
        </div>
      </div>
    </div>
  );
}

function RiskGauge({ score }: { score: number }) {
  // Circular SVG gauge (0–100)
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--muted)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={riskStroke(score)}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
    </div>
  );
}

// ============================================================
// Mini KPI
// ============================================================
function MiniKpi({
  label, value, icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="card-premium p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-semibold mt-1 tabular truncate">{value}</p>
        </div>
        <div className="size-8 rounded-lg bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
          <Icon className="size-4" />
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Definition row
// ============================================================
function DefRow({
  label, value, icon: Icon, mono,
}: {
  label: string;
  value: string | null | undefined;
  icon?: LucideIcon;
  mono?: boolean;
}) {
  const text = value && value.trim() !== "" ? value : "—";
  return (
    <div className="flex items-start gap-3 py-1">
      {Icon && <Icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
        <p className="text-xs text-muted-foreground shrink-0">{label}</p>
        <p className={`text-sm text-right truncate ${mono ? "font-mono tabular" : ""}`}>{text}</p>
      </div>
    </div>
  );
}

// ============================================================
// Documents tab
// ============================================================
function DocumentsTab({
  partnerId, documents, canAdmin, onUploaded,
}: {
  partnerId: string;
  documents: SharedDocument[];
  canAdmin: boolean;
  onUploaded: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const CATEGORY_LABELS: Record<string, string> = {
    contract: "Contract",
    invoice: "Invoice",
    spec: "Spec",
    other: "Other",
  };

  const CATEGORY_ICON: Record<string, LucideIcon> = {
    contract: FileSignature,
    invoice: Receipt,
    spec: FileCheck2,
    other: FileText,
  };

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/documents/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast.success("Document deleted.");
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["documents", tenantKey, "partner360", partnerId] });
    },
    onError: () => toast.error("Delete failed."),
  });

  return (
    <Card className="card-premium">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Documents</CardTitle>
            <CardDescription>{documents.length} document(s) shared with this partner</CardDescription>
          </div>
          {canAdmin && (
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Plus className="size-4 mr-1" /> Upload
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No documents yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((d) => {
              const Icon = CATEGORY_ICON[d.category] || FileText;
              return (
                <div
                  key={d.id}
                  className="group p-4 rounded-xl border border-border/60 hover:shadow-soft-md smooth-fast relative"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" title={d.filename}>{d.filename}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {CATEGORY_LABELS[d.category] || d.category} · {fmtBytes(d.size)}
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular mt-0.5">
                        {fmtRelative(d.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/40">
                    <Badge variant={d.visible_to_partner ? "default" : "secondary"} className="text-[10px]">
                      {d.visible_to_partner ? "Visible" : "Hidden"}
                    </Badge>
                    <div className="ml-auto flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => { if (d.storage_path) { window.open(`/api/documents/${d.id}`, "_blank"); } else { toast.info("No file available for preview"); } }} title="View" aria-label="View">
                        <Eye className="size-3.5" />
                      </Button>
                      {canAdmin && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive"
                          onClick={() => setDeleteId(d.id)}
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {uploadOpen && (
        <UploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          partnerId={partnerId}
          onUploaded={() => {
            setUploadOpen(false);
            onUploaded();
          }}
        />
      )}

      {deleteId && (
        <ConfirmDelete
          open={!!deleteId}
          onOpenChange={(o) => !o && setDeleteId(null)}
          onConfirm={() => deleteMut.mutate(deleteId)}
          loading={deleteMut.isPending}
        />
      )}
    </Card>
  );
}

// ============================================================
// KYC tab
// ============================================================
function KycTab({
  submission, partnerName, onReview, canAdmin,
}: {
  submission: KycSubmission | null;
  partnerName: string;
  onReview: () => void;
  canAdmin: boolean;
}) {
  if (!submission) {
    return (
      <Card className="card-premium">
        <CardContent className="py-10 flex flex-col items-center text-center">
          <div className="size-14 rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-3">
            <ShieldCheck className="size-6" />
          </div>
          <p className="text-sm font-medium">No KYC submission</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {partnerName} has not submitted a KYC application yet. Once they submit one via the client portal, it will appear here for review.
          </p>
          {canAdmin && (
            <Button className="mt-4" variant="outline" onClick={onReview}>
              <ShieldCheck className="size-4 mr-1.5" /> Open KYC review
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const status = asKycStatus(submission.status);
  const steps: KycSubmissionStatus[] = ["draft", "submitted", "under_review", "approved"];
  const currentIdx = status ? steps.indexOf(status) : -1;

  return (
    <div className="space-y-4">
      {/* Status stepper */}
      <Card className="card-premium">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> KYC Submission
              </CardTitle>
              <CardDescription>
                {submission.legal_name || partnerName} · submitted{" "}
                <span className="tabular">{fmtRelative(submission.submitted_at || submission.created_at)}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {submission.auto_transferred && (
                <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                  <CheckCircle2 className="size-3 mr-1" /> Data transferred
                </Badge>
              )}
              <Badge className={statusBadgeClass(status || "draft")}>
                {KYC_STATUS_LABELS[status || "draft"]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between max-w-2xl">
            {steps.map((s, i) => {
              const done = i <= currentIdx;
              const isCurrent = i === currentIdx;
              const isRejected = status === "rejected" && i === currentIdx;
              const icon =
                isRejected ? XCircle :
                done ? CheckCircle2 :
                isCurrent ? Clock :
                Clock;
              const StepIcon = icon;
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`size-9 rounded-full flex items-center justify-center ${
                      isRejected ? "bg-destructive text-white" :
                      done ? "bg-emerald-500 text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      <StepIcon className="size-4" />
                    </div>
                    <p className="text-[10px] text-muted-foreground capitalize">{KYC_STATUS_LABELS[s]}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 -mt-5 ${i < currentIdx ? "bg-emerald-500" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transferred fields (if approved + auto_transferred) */}
      {submission.auto_transferred && (
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck2 className="size-4 text-emerald-600" /> Transferred Fields
            </CardTitle>
            <CardDescription>Auto-synced to the partner record on approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                ["Legal name", submission.legal_name],
                ["Registration #", submission.registration_number],
                ["Tax ID", submission.tax_id],
                ["VAT number", submission.vat_number],
                ["Address", [submission.address_line, submission.city, submission.country].filter(Boolean).join(", ")],
                ["Contact name", submission.contact_name],
                ["Contact email", submission.contact_email],
                ["Bank name", submission.bank_name],
                ["Bank account", submission.bank_account],
                ["IBAN", submission.bank_iban],
                ["SWIFT", submission.bank_swift],
                ["Website", submission.company_website],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-muted/40">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="text-sm font-medium tabular truncate max-w-[60%] text-right">{(v as string) || "—"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Business Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <DefRow label="Entity type" value={submission.entity_type === "company" ? "Company" : "Individual"} />
            <DefRow label="Legal name" value={submission.legal_name} />
            <DefRow label="Trade name" value={submission.trade_name} />
            <DefRow label="Registration #" value={submission.registration_number} mono />
            <DefRow label="Tax ID" value={submission.tax_id} mono />
            <DefRow label="VAT number" value={submission.vat_number} mono />
            <DefRow label="Website" value={submission.company_website} icon={Globe} />
            <DefRow label="Business activity" value={submission.business_activity} />
            <DefRow label="Expected volume" value={submission.expected_monthly_volume} />
            <DefRow label="Source of funds" value={submission.source_of_funds} />
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Beneficial Owner &amp; Bank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <DefRow label="Owner name" value={submission.owner_name} />
            <DefRow label="Owner ID type" value={submission.owner_id_type} />
            <DefRow label="Owner ID number" value={submission.owner_id_number} mono />
            <DefRow label="Owner nationality" value={submission.owner_nationality ? (getCountry(submission.owner_nationality)?.name || submission.owner_nationality) : "—"} />
            <DefRow label="Owner DOB" value={submission.owner_dob ? fmtDate(submission.owner_dob) : "—"} />
            <Separator className="my-2" />
            <DefRow label="Bank name" value={submission.bank_name} icon={Landmark} />
            <DefRow label="Account" value={submission.bank_account} mono />
            <DefRow label="IBAN" value={submission.bank_iban} mono />
            <DefRow label="SWIFT" value={submission.bank_swift} mono />
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card className="card-premium">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileBadge className="size-4 text-primary" /> KYC Documents
            <Badge variant="secondary" className="tabular">{submission.documents?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submission.documents && submission.documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {submission.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60">
                  <div className="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate" title={doc.filename}>{doc.filename}</p>
                    <p className="text-[11px] text-muted-foreground tabular">
                      {fmtBytes(doc.size)} · {fmtRelative(doc.uploaded_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">No documents uploaded.</p>
          )}
        </CardContent>
      </Card>

      {/* Review info / actions */}
      <Card className="card-premium">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {submission.reviewed_at && (
            <p className="text-sm text-muted-foreground">
              Reviewed <span className="tabular">{fmtDateTime(submission.reviewed_at)}</span>
            </p>
          )}
          {submission.review_notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Review notes</p>
              <p className="text-sm p-3 rounded-md bg-muted/50 whitespace-pre-wrap">{submission.review_notes}</p>
            </div>
          )}
          {submission.rejection_reason && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rejection reason</p>
              <p className="text-sm p-3 rounded-md bg-destructive/10 text-destructive whitespace-pre-wrap">{submission.rejection_reason}</p>
            </div>
          )}
          {canAdmin && (
            <Button onClick={onReview} className="mt-2">
              Open in KYC review <Eye className="size-4 ml-1.5" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function statusBadgeClass(status: KycSubmissionStatus): string {
  switch (status) {
    case "approved":
      return "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "rejected":
      return "border-transparent bg-destructive text-white";
    case "under_review":
      return "border-transparent bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200";
    case "submitted":
      return "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    case "resubmit":
      return "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200";
    default:
      return "border-transparent bg-muted text-muted-foreground";
  }
}

// ============================================================
// Portal tab
// ============================================================
function PortalTab({
  partnerId, partnerName, portalAccess, rfqs, canAdmin,
}: {
  partnerId: string;
  partnerName: string;
  portalAccess: PortalAccess | null;
  rfqs: PortalRfq[];
  canAdmin: boolean;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const [inviteSending, setInviteSending] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showChangeTier, setShowChangeTier] = useState(false);
  const [nextTier, setNextTier] = useState<string>("");

  // Per-action permission gating. `canAdmin` still guards the whole card,
  // but individual buttons now respect the fine-grained catalog entries so
  // users with role="user" and specific grants can be limited to just the
  // actions they should perform.
  const canInvite = useCan("portal.invite");
  const canChangeEmail = useCan("portal.change_email");
  const canChangeTier = useCan("portal.change_tier");
  const canResetPw = useCan("portal.reset_password");
  const canSuspend = useCan("portal.suspend");
  const canRevoke = useCan("portal.revoke");

  const inviteMut = useMutation({
    mutationFn: async () => {
      if (!portalAccess) throw new Error("No portal access record");
      const r = await fetch(api(`/api/portal-access/${portalAccess.id}/invite`), { method: "POST" });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Invite failed");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Portal invite sent.");
      qc.invalidateQueries({ queryKey: ["portal-access", tenantKey, "partner360", partnerId] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setInviteSending(false),
  });

  const setStatusMut = useMutation({
    mutationFn: async (status: "suspended" | "revoked" | "active") => {
      if (!portalAccess) throw new Error("No portal access");
      const r = await fetch(api("/api/portal-access"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: portalAccess.id, status }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Update failed");
      }
      return r.json();
    },
    onSuccess: (_data, status) => {
      toast.success(`Portal access ${status}.`);
      qc.invalidateQueries({ queryKey: ["portal-access", tenantKey, "partner360", partnerId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const forceResetMut = useMutation({
    mutationFn: async () => {
      if (!portalAccess) throw new Error("No portal access");
      // Flip must_set_password=true and bump token_version so the current
      // session is invalidated. Admin then clicks "Send invite" to email
      // the setup link again — or shares the /portal/login?access_id=… URL
      // manually if the client can't receive the email.
      const r = await fetch(api("/api/portal-access"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: portalAccess.id,
          must_set_password: true,
          password_hash: null,
          token_version: (portalAccess.token_version || 0) + 1,
        }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Reset failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Password reset. Click 'Send invite' to email the setup link, or share it manually.");
      qc.invalidateQueries({ queryKey: ["portal-access", tenantKey, "partner360", partnerId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeTierMut = useMutation({
    mutationFn: async (tier: string) => {
      if (!portalAccess) throw new Error("No portal access");
      const r = await fetch(api("/api/portal-access"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: portalAccess.id, tier }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Change tier failed");
      return r.json();
    },
    onSuccess: (_d, tier) => {
      toast.success(`Tier changed to ${PORTAL_TIER_LABELS[tier] || tier}.`);
      qc.invalidateQueries({ queryKey: ["portal-access", tenantKey, "partner360", partnerId] });
      setShowChangeTier(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeEmailMut = useMutation({
    mutationFn: async (email: string) => {
      if (!portalAccess) throw new Error("No portal access");
      const r = await fetch(api(`/api/portal-access/${portalAccess.id}/change-email`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_email: email, send_reset_link: true }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Change email failed");
      }
      return r.json();
    },
    onSuccess: (data: any) => {
      toast.success(data?.email_sent ? `Login email changed. Set-password email sent to ${data.email_sent}.` : "Login email changed.");
      qc.invalidateQueries({ queryKey: ["portal-access", tenantKey, "partner360", partnerId] });
      setShowChangeEmail(false);
      setNewEmail("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Create portal access (initial)
  const createMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(api("/api/portal-access"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: partnerId,
          tier: "standard",
          status: "approved",
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Create failed");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Portal access created.");
      qc.invalidateQueries({ queryKey: ["portal-access", tenantKey, "partner360", partnerId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {/* Portal access card */}
      <Card className="card-premium">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="size-4 text-primary" /> Portal Access
              </CardTitle>
              <CardDescription>
                {portalAccess
                  ? `Tier: ${PORTAL_TIER_LABELS[portalAccess.tier] || portalAccess.tier}`
                  : "No portal access configured"}
              </CardDescription>
            </div>
            {portalAccess && (
              <Badge className={`${portalStatusClass(portalAccess.status)} capitalize`}>
                {portalAccess.status.replace("_", " ")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {portalAccess ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <DefRow label="Portal email" value={portalAccess.portal_email} icon={Mail} />
                <DefRow label="Tier" value={PORTAL_TIER_LABELS[portalAccess.tier] || portalAccess.tier} />
                <DefRow label="Invited" value={portalAccess.invited_at ? fmtDateTime(portalAccess.invited_at) : "—"} icon={Calendar} />
                <DefRow label="Last login" value={portalAccess.last_login_at ? fmtRelative(portalAccess.last_login_at) : "Never"} icon={Clock} />
                <DefRow label="Last login IP" value={portalAccess.last_login_ip} mono />
                <DefRow label="Welcome email" value={portalAccess.welcome_email_sent ? "Sent" : "Not sent"} />
              </div>

              {/* Feature permissions */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ["Offers", portalAccess.can_view_offers],
                    ["Documents", portalAccess.can_view_documents],
                    ["Catalog", portalAccess.can_view_catalog],
                    ["Invoices", portalAccess.can_view_invoices],
                    ["Profile", portalAccess.can_view_profile],
                    ["Company", portalAccess.can_view_company_info],
                    ["Submit RFQ", portalAccess.can_submit_rfq],
                    ["Download PDF", portalAccess.can_download_pdf],
                  ].map(([label, on]) => (
                    <Badge
                      key={label as string}
                      variant={on ? "default" : "secondary"}
                      className={on ? "border-transparent bg-primary/15 text-primary" : ""}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {canAdmin && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                  {canInvite && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setInviteSending(true);
                        inviteMut.mutate();
                      }}
                      disabled={inviteSending || portalAccess.status === "active"}
                    >
                      <Send className="size-4 mr-1.5" /> Send invite
                    </Button>
                  )}
                  {canChangeEmail && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setNewEmail(portalAccess.portal_email || ""); setShowChangeEmail(true); }}
                    >
                      <Mail className="size-4 mr-1.5" /> Change email
                    </Button>
                  )}
                  {canChangeTier && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setNextTier(portalAccess.tier); setShowChangeTier(true); }}
                    >
                      <Star className="size-4 mr-1.5" /> Change tier
                    </Button>
                  )}
                  {canResetPw && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Reset password for ${partnerName}? Their current session will be invalidated and they'll have to set a new password from the invite email.`)) {
                          forceResetMut.mutate();
                        }
                      }}
                      disabled={forceResetMut.isPending}
                    >
                      <KeyRound className="size-4 mr-1.5" /> Reset password
                    </Button>
                  )}
                  {canSuspend && portalAccess.status === "active" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatusMut.mutate("suspended")}
                      disabled={setStatusMut.isPending}
                    >
                      <Ban className="size-4 mr-1.5" /> Suspend access
                    </Button>
                  ) : canSuspend && portalAccess.status === "suspended" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatusMut.mutate("active")}
                      disabled={setStatusMut.isPending}
                    >
                      <CheckCircle2 className="size-4 mr-1.5" /> Reactivate
                    </Button>
                  ) : null}
                  {canRevoke && portalAccess.status !== "revoked" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm(`Revoke portal access for ${partnerName}? They will no longer be able to log in.`)) {
                          setStatusMut.mutate("revoked");
                        }
                      }}
                      disabled={setStatusMut.isPending}
                    >
                      <UserX className="size-4 mr-1.5" /> Revoke access
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {partnerName} does not have portal access yet.
              </p>
              {canAdmin && (
                <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
                  <Plus className="size-4 mr-1.5" /> Create portal access
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showChangeTier} onOpenChange={setShowChangeTier}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Change portal tier</DialogTitle>
            <DialogDescription>
              Higher tiers unlock more features (RFQ, PDF download, KYC-exempt). Downgrading revokes those features immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {TIER_ORDER.map((t) => {
              const current = portalAccess?.tier === t.value;
              return (
                <label key={t.value} className={cn("flex items-start gap-3 rounded-lg border p-3 cursor-pointer smooth", nextTier === t.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40")}>
                  <input
                    type="radio"
                    name="tier"
                    value={t.value}
                    checked={nextTier === t.value}
                    onChange={() => setNextTier(t.value)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{t.label}</span>
                      {current && <Badge variant="outline" className="text-[10px]">Current</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{t.hint}</p>
                  </div>
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeTier(false)}>Cancel</Button>
            <Button
              onClick={() => changeTierMut.mutate(nextTier)}
              disabled={changeTierMut.isPending || !nextTier || nextTier === portalAccess?.tier}
            >
              {changeTierMut.isPending ? "Saving…" : "Apply tier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showChangeEmail} onOpenChange={setShowChangeEmail}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Change portal login email</DialogTitle>
            <DialogDescription>
              The client&apos;s existing session will be invalidated. A welcome email with a set-password link is sent to the new address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>New email</Label>
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="client@example.com" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeEmail(false)}>Cancel</Button>
            <Button onClick={() => changeEmailMut.mutate(newEmail)} disabled={changeEmailMut.isPending || !newEmail}>
              {changeEmailMut.isPending ? "Saving…" : "Change email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RFQs */}
      <Card className="card-premium">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Inbox className="size-4 text-primary" /> Portal RFQs
            <Badge variant="secondary" className="tabular">{rfqs.length}</Badge>
          </CardTitle>
          <CardDescription>Requests for quotation submitted by this partner via the portal</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rfqs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No RFQs submitted yet.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfqs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs tabular">{r.number}</TableCell>
                      <TableCell className="font-medium truncate max-w-[180px]">{r.product_name}</TableCell>
                      <TableCell className="text-right tabular">{fmtNumber(r.quantity)} {r.unit}</TableCell>
                      <TableCell className="text-right tabular">{r.target_price ? fmtMoney(r.target_price, r.currency) : "—"}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{r.status}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell tabular text-muted-foreground text-xs">{fmtRelative(r.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Upload dialog (simplified — registers metadata)
// ============================================================
function UploadDialog({
  open, onOpenChange, partnerId, onUploaded,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  partnerId: string;
  onUploaded: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [filename, setFilename] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!filename.trim()) {
      toast.error("Filename is required.");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(api("/api/documents"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: partnerId,
          filename: filename.trim(),
          mime_type: "application/octet-stream",
          size: 0,
          storage_path: `uploads/${partnerId}/${Date.now()}_${filename.trim()}`,
          category,
          visible_to_partner: visible,
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Upload failed");
      }
      toast.success("Document registered.");
      setFilename("");
      setCategory("other");
      setVisible(true);
      onUploaded();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>Register a document for this partner.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Filename *</Label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="contract-2026.pdf"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="spec">Spec</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
            <input
              type="checkbox"
              id="visible"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="size-4"
            />
            <Label htmlFor="visible" className="text-sm font-normal cursor-pointer">
              Visible to partner in portal
            </Label>
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

// ============================================================
// Confirm delete dialog
// ============================================================
function ConfirmDelete({
  open, onOpenChange, onConfirm, loading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Delete document?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Quick edit dialog
// ============================================================
function QuickEditDialog({
  open, onOpenChange, partner, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  partner: Partner;
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [form, setForm] = useState<Partial<Partner>>({ ...partner });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Partner>(k: K, v: Partner[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.name) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(api(`/api/partners/${partner.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Save failed");
      }
      toast.success("Partner updated.");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Edit partner</DialogTitle>
          <DialogDescription>Update basic partner information.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tax ID</Label>
              <Input value={form.tax_id || ""} onChange={(e) => set("tax_id", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>VAT number</Label>
              <Input value={form.vat_number || ""} onChange={(e) => set("vat_number", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input value={form.address_line || ""} onChange={(e) => set("address_line", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={form.country || ""} onChange={(e) => set("country", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Preferred currency</Label>
              <Input value={form.preferred_currency || ""} onChange={(e) => set("preferred_currency", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Risk score (0-100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.risk_score ?? 0}
                onChange={(e) => set("risk_score", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Skeleton
// ============================================================
function Partner360Skeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 text-muted-foreground">
        <ArrowLeft className="size-4 mr-1" /> Back to partners
      </Button>
      <div className="border-gradient bg-mesh rounded-[var(--radius-xl)] p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>
      <Skeleton className="h-9 w-full max-w-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

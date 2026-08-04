"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Inbox, Eye, Clock, FileText, Package, CheckCircle2, XCircle,
  ArrowRightLeft, FilePlus2, Save, Loader2, MapPin, Ship, CalendarDays,
  Tag, Hash, DollarSign, Boxes, Building2, StickyNote, FileCheck2,
  Users as UsersIcon, Zap, RefreshCw, Factory, ShieldCheck, Globe2, Wallet, Repeat, User,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard } from "@/components/common/kpi-card";
import { fmtMoney, fmtDate, fmtRelative, fmtDateTime, fmtNumber } from "@/lib/utils/format";
import {
  PortalRfq, PortalRfqStatus, Partner,
} from "@/lib/supabase/types";
import {
  COUNTRIES, INCOTERMS, PRODUCT_CATEGORIES, UNITS_OF_MEASURE, getCountry, getIncoterm,
} from "@/lib/data/reference";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

// ---------- static lookups ----------

const STATUS_LABELS: Record<PortalRfqStatus, string> = {
  pending: "Pending",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

function statusBadgeClass(status: PortalRfqStatus): string {
  switch (status) {
    case "pending":
      return "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    case "quoted":
      return "border-transparent bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200";
    case "accepted":
      return "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "declined":
      return "border-transparent bg-destructive text-white";
    case "expired":
    default:
      return "border-transparent bg-muted text-muted-foreground";
  }
}

function categoryLabel(code: string | null): string {
  if (!code) return "—";
  return PRODUCT_CATEGORIES.find((c) => c.code === code)?.name || code;
}

function unitLabel(code: string): string {
  return UNITS_OF_MEASURE.find((u) => u.code === code)?.name || code;
}

function incotermLabel(code: string | null): string {
  if (!code) return "—";
  return getIncoterm(code)?.name || code;
}

function countryLabel(code: string | null): string {
  if (!code) return "—";
  return getCountry(code)?.name || code;
}

// ---------- main view ----------

export function PortalRfqsView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [detailId, setDetailId] = useState<string | null>(null);

  // RFQ list
  const { data, isLoading } = useQuery({
    queryKey: ["portal-rfqs", tenantKey, search, statusFilter, partnerFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (partnerFilter !== "all") params.set("partner_id", partnerFilter);
      const r = await fetch(api(`/api/portal-rfqs?${params}`));
      if (!r.ok) throw new Error("Failed to load client requests");
      return r.json() as Promise<{ items: PortalRfq[]; total: number }>;
    },
  });

  // Partners lookup
  const partnersQ = useQuery({
    queryKey: ["partners", tenantKey, "lookup", "rfqs"],
    queryFn: async () => {
      const r = await fetch(api(`/api/partners?limit=500`));
      if (!r.ok) throw new Error("Failed to load partners");
      return r.json() as Promise<{ items: Partner[]; total: number }>;
    },
  });

  const partnerMap = useMemo(() => {
    const m = new Map<string, Partner>();
    partnersQ.data?.items.forEach((p) => m.set(p.id, p));
    return m;
  }, [partnersQ.data]);

  const items = data?.items || [];

  const kpis = useMemo(() => {
    return {
      pending: items.filter((r) => r.status === "pending").length,
      quoted: items.filter((r) => r.status === "quoted").length,
      accepted: items.filter((r) => r.status === "accepted").length,
      declined: items.filter((r) => r.status === "declined").length,
    };
  }, [items]);

  function resolvePartnerName(rfq: PortalRfq): string {
    return partnerMap.get(rfq.partner_id)?.name || "Unknown partner";
  }

  return (
    <div>
      <PageHeader
        title="Client Requests"
        description="RFQs submitted by portal clients for products not in catalog."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard
          label="Pending"
          value={kpis.pending}
          sub="Awaiting quote"
          icon={Clock}
          iconClassName={kpis.pending > 0 ? "text-warning" : undefined}
        />
        <KpiCard
          label="Quoted"
          value={kpis.quoted}
          sub="Awaiting client"
          icon={FileText}
        />
        <KpiCard
          label="Accepted"
          value={kpis.accepted}
          sub="Won orders"
          icon={CheckCircle2}
          iconClassName="text-success"
        />
        <KpiCard
          label="Declined"
          value={kpis.declined}
          sub="Lost / refused"
          icon={XCircle}
          iconClassName="text-destructive"
        />
      </div>

      {/* Filters */}
      <Card className="mb-4 border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by RFQ number or product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={partnerFilter} onValueChange={setPartnerFilter}>
            <SelectTrigger className="w-full md:w-52">
              <SelectValue placeholder="Partner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All partners</SelectItem>
              {(partnersQ.data?.items || []).slice(0, 100).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Inbox className="size-6" />}
              title="No client requests"
              description="When portal clients submit RFQs for products not in your catalog, they will appear here."
            />
          ) : (
            <div className="max-h-[calc(100vh-380px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden md:table-cell">Partner</TableHead>
                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((rfq) => (
                    <TableRow
                      key={rfq.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setDetailId(rfq.id)}
                    >
                      <TableCell>
                        <span className="font-mono text-xs tabular text-foreground/80">{rfq.number}</span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium truncate max-w-[220px]">{rfq.product_name}</div>
                        {rfq.product_description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                            {rfq.product_description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[160px]">{resolvePartnerName(rfq)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="text-[11px]">
                          {categoryLabel(rfq.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular text-sm">
                        {fmtNumber(rfq.quantity)} <span className="text-muted-foreground text-xs">{rfq.unit}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular text-sm">
                        {rfq.target_price ? (
                          <span>{fmtMoney(rfq.target_price, rfq.currency)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClass(rfq.status)}>{STATUS_LABELS[rfq.status]}</Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-xs text-muted-foreground tabular">
                        {fmtRelative(rfq.created_at)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => setDetailId(rfq.id)}
                        >
                          <Eye className="size-3.5 mr-1" />
                          View
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

      {/* Detail sheet */}
      <RfqDetailSheet
        id={detailId}
        open={!!detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
        partnerMap={partnerMap}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["portal-rfqs", tenantKey] });
        }}
      />
    </div>
  );
}

// ---------- detail sheet ----------

function RfqDetailSheet({
  id, open, onOpenChange, partnerMap, onSaved,
}: {
  id: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  partnerMap: Map<string, Partner>;
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [status, setStatus] = useState<PortalRfqStatus | "">("");
  const [adminNotes, setAdminNotes] = useState("");
  const [linkedOfferId, setLinkedOfferId] = useState("");
  const [dirty, setDirty] = useState(false);
  // Track the entity we've initialised the form for, so we can re-sync when it changes
  // (React 19 pattern: store info from previous render to derive state without useEffect).
  const [lastInitId, setLastInitId] = useState<string | null>(null);

  // Load full RFQ
  const q = useQuery({
    queryKey: ["portal-rfq", tenantKey, id],
    queryFn: async () => {
      // The list route already returns full records; refetch for safety / freshness
      const r = await fetch(api(`/api/portal-rfqs?search=&status=&partner_id=`));
      if (!r.ok) throw new Error("Failed to load");
      const data = await r.json() as { items: PortalRfq[] };
      return data.items.find((x) => x.id === id) || null;
    },
    enabled: !!id,
  });

  // For lookup simplicity, also try fetching via the PUT (only endpoint on [id]).
  // We use the list approach since no GET /api/portal-rfqs/[id] exists.

  if (open && id && id !== lastInitId && q.data) {
    setLastInitId(id);
    setStatus(q.data.status);
    setAdminNotes(q.data.admin_notes || "");
    setLinkedOfferId(q.data.linked_offer_id || "");
    setDirty(false);
  }
  if (!open && lastInitId !== null) {
    setLastInitId(null);
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(api(`/api/portal-rfqs/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status || undefined,
          admin_notes: adminNotes,
          linked_offer_id: linkedOfferId || null,
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Save failed");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Client request updated.");
      setDirty(false);
      onSaved();
    },
    onError: (e: any) => toast.error(e.message || "Could not save."),
  });

  const rfq = q.data;
  const partner = rfq ? partnerMap.get(rfq.partner_id) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 sticky top-0 bg-card z-20">
          <SheetTitle className="flex items-center gap-2 pr-8">
            <Inbox className="size-5 text-primary" />
            <span className="truncate">{rfq?.product_name || "Client Request"}</span>
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2 mt-1">
            {rfq && (
              <>
                <span className="font-mono tabular text-xs">{rfq.number}</span>
                <Badge className={statusBadgeClass(rfq.status)}>{STATUS_LABELS[rfq.status]}</Badge>
                <span className="text-xs text-muted-foreground">Created {fmtRelative(rfq.created_at)}</span>
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        {q.isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : !rfq ? (
          <div className="p-6">
            <EmptyState title="Request not found" description="This RFQ may have been deleted." />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {/* Product summary */}
            <Card className="border-border/60 shadow-soft">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="size-4 text-primary" />
                  Product Requested
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <p className="text-base font-medium">{rfq.product_name}</p>
                  {rfq.product_description && (
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{rfq.product_description}</p>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <InfoRow icon={Tag} label="Category" value={categoryLabel(rfq.category)} />
                  <InfoRow icon={Boxes} label="Quantity" value={`${fmtNumber(rfq.quantity)} ${unitLabel(rfq.unit)}`} />
                  <InfoRow
                    icon={DollarSign}
                    label="Target Price"
                    value={rfq.target_price ? `${fmtMoney(rfq.target_price, rfq.currency)} / ${rfq.unit}` : "—"}
                  />
                  <InfoRow icon={Hash} label="Currency" value={rfq.currency} />
                </div>
                {rfq.specifications && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Specifications</p>
                      <p className="text-sm whitespace-pre-wrap">{rfq.specifications}</p>
                    </div>
                  </>
                )}
                {rfq.notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Client Notes</p>
                    <p className="text-sm whitespace-pre-wrap p-2.5 rounded-md bg-muted/40 border border-border/40">
                      {rfq.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery + Partner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-border/60 shadow-soft">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Ship className="size-4 text-primary" />
                    Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <InfoRow icon={MapPin} label="Country" value={countryLabel(rfq.delivery_country)} />
                  <InfoRow icon={Ship} label="Port" value={rfq.delivery_port || "—"} />
                  <InfoRow icon={CalendarDays} label="Date" value={rfq.delivery_date ? fmtDate(rfq.delivery_date) : "—"} />
                  <InfoRow icon={ArrowRightLeft} label="Incoterm" value={incotermLabel(rfq.incoterm)} />
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-soft">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    Partner
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {partner ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-base font-medium">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">{partner.email || "—"}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 text-xs">
                        <PartnerRow label="Type" value={partner.type} />
                        <PartnerRow label="Contact" value={partner.contact_name || partner.contact_email || "—"} />
                        <PartnerRow label="Country" value={countryLabel(partner.country)} />
                        <PartnerRow label="Phone" value={partner.contact_phone || partner.phone || "—"} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Partner record not found.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Commercial terms + delivery schedule */}
            {(rfq.payment_method || rfq.payment_terms || rfq.urgency || rfq.delivery_schedule) && (
              <Card className="border-border/60 shadow-soft">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wallet className="size-4 text-primary" />
                    Commercial &amp; Delivery Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <InfoRow icon={DollarSign} label="Payment method" value={rfq.payment_method ? rfq.payment_method.toUpperCase() : "—"} />
                    <InfoRow icon={Wallet} label="Payment terms" value={rfq.payment_terms || "—"} />
                    <InfoRow icon={Zap} label="Urgency" value={rfq.urgency || "—"} />
                    <InfoRow icon={Repeat} label="Schedule" value={rfq.delivery_schedule || "—"} />
                    {rfq.delivery_schedule && rfq.delivery_schedule !== "one_time" && (
                      <>
                        <InfoRow icon={Boxes} label="Qty per shipment" value={rfq.per_shipment_qty != null ? `${fmtNumber(rfq.per_shipment_qty)} ${unitLabel(rfq.unit)}` : "—"} />
                        <InfoRow icon={RefreshCw} label="Shipments / period" value={rfq.shipments_per_period != null ? String(rfq.shipments_per_period) : "—"} />
                        <InfoRow icon={CalendarDays} label="Contract duration" value={rfq.contract_duration_months != null ? `${rfq.contract_duration_months} months` : "—"} />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Use case + certifications */}
            {(rfq.target_market || rfq.end_use || rfq.quality_standard || rfq.certifications_required || rfq.packaging_requirements) && (
              <Card className="border-border/60 shadow-soft">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Factory className="size-4 text-primary" />
                    Use case &amp; requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <InfoRow icon={Factory} label="Target market" value={rfq.target_market || "—"} />
                    <InfoRow icon={ShieldCheck} label="Quality standard" value={rfq.quality_standard || "—"} />
                  </div>
                  {rfq.end_use && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">End use</p>
                      <p className="text-sm whitespace-pre-wrap p-2.5 rounded-md bg-muted/40 border border-border/40">{rfq.end_use}</p>
                    </div>
                  )}
                  {rfq.certifications_required && (
                    <InfoRow icon={ShieldCheck} label="Certifications required" value={rfq.certifications_required} />
                  )}
                  {rfq.packaging_requirements && (
                    <InfoRow icon={Package} label="Packaging" value={rfq.packaging_requirements} />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Buyer identity */}
            {rfq.buyer_type && (
              <Card className={`border-shadow-soft ${rfq.buyer_type === "third_party" ? "border-amber-500/40 bg-amber-500/[0.03]" : "border-border/60"}`}>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {rfq.buyer_type === "third_party" ? <UsersIcon className="size-4 text-amber-600" /> : <User className="size-4 text-primary" />}
                    Buyer &mdash; {rfq.buyer_type === "third_party" ? "Third-party (sourcing on behalf)" : "Client is the buyer"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {rfq.buyer_type === "third_party" ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <InfoRow icon={Building2} label="Company" value={rfq.third_party_company_name || "—"} />
                      <InfoRow icon={Factory} label="Business type" value={rfq.third_party_business_type || "—"} />
                      <InfoRow icon={Globe2} label="Country" value={countryLabel(rfq.third_party_country)} />
                      <InfoRow icon={Hash} label="Tax ID" value={rfq.third_party_tax_id || "—"} />
                      <InfoRow icon={FileText} label="Email" value={rfq.third_party_contact_email || "—"} />
                      <InfoRow icon={FileText} label="Phone" value={rfq.third_party_contact_phone || "—"} />
                      {rfq.third_party_website && (
                        <div className="col-span-2 text-sm"><span className="text-xs text-muted-foreground">Website:</span> <a href={rfq.third_party_website} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">{rfq.third_party_website}</a></div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">The requesting client's company is the buyer of record.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Admin response */}
            <Card className="border-border/60 shadow-soft">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCheck2 className="size-4 text-primary" />
                  Admin Response
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(v) => { setStatus(v as PortalRfqStatus); setDirty(true); }}
                    >
                      <SelectTrigger><SelectValue placeholder="Set status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Linked Offer ID (optional)</Label>
                    <Input
                      placeholder="e.g. OF-2026-0123"
                      value={linkedOfferId}
                      onChange={(e) => { setLinkedOfferId(e.target.value); setDirty(true); }}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <StickyNote className="size-3.5" />
                    Admin Notes
                  </Label>
                  <Textarea
                    placeholder="Internal notes about this RFQ — pricing strategy, supplier availability, response plan…"
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => { setAdminNotes(e.target.value); setDirty(true); }}
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const res = await fetch(api(`/api/automation/create-demand-from-portal-rfq`), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ portalRfqId: rfq?.id }),
                          });
                          if (!res.ok) throw new Error("Failed to create demand");
                          const data = await res.json();
                          toast.success(`Demand created: ${data.demand?.demand_number || data.id}`);
                        } catch {
                          toast.error("Failed to convert RFQ to demand");
                        }
                      }}
                    >
                      <ArrowRightLeft className="size-3.5 mr-1" />
                      Convert to Demand
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const res = await fetch(api(`/api/automation/create-offer-from-deal`), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ dealId: rfq?.linked_demand_id ?? rfq?.id }),
                          });
                          if (!res.ok) throw new Error("Failed to create offer");
                          const data = await res.json();
                          toast.success(`Offer created: ${data.offer?.offer_number || data.id}`);
                        } catch {
                          toast.error("Failed to create offer from RFQ");
                        }
                      }}
                    >
                      <FilePlus2 className="size-3.5 mr-1" />
                      Create Offer
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={!dirty || saveMut.isPending}
                    onClick={() => saveMut.mutate()}
                  >
                    {saveMut.isPending ? (
                      <Loader2 className="size-3.5 mr-1 animate-spin" />
                    ) : (
                      <Save className="size-3.5 mr-1" />
                    )}
                    Save changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {rfq.linked_offer_id && !dirty && (
              <div className="text-xs text-muted-foreground">
                Linked offer: <span className="font-mono tabular">{rfq.linked_offer_id}</span>
              </div>
            )}

            <div className="pt-3 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                Last updated {fmtDateTime(rfq.updated_at)}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---------- helpers ----------

function InfoRow({
  icon: Icon, label, value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm break-words">{value}</p>
      </div>
    </div>
  );
}

function PartnerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium truncate max-w-[60%] text-right">{value}</span>
    </div>
  );
}

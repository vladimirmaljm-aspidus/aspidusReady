"use client";

import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext,
} from "@/components/ui/pagination";
import {
  Plus, Search, Handshake, Pencil, Trash2, Eye, Calendar, User, TrendingUp, LayoutGrid, List,
  FileText, Loader2, MapPin, Mail, Phone, DollarSign, BarChart3, Target, CheckCircle2,
  ChevronDown, ChevronUp, ArrowRight, Package, Scale,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtMoney, fmtDate, fmtRelative } from "@/lib/utils/format";
import { Deal, DealStage, Partner, Offer, CommissionAgent } from "@/lib/supabase/types";
import { useAppStore } from "@/lib/store/app-store";
import { CURRENCIES, DEAL_STAGES, COUNTRIES } from "@/lib/data/reference";

const STAGES: DealStage[] = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];

const STAGE_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const STAGE_TEXT: Record<DealStage, string> = {
  lead: "text-muted-foreground",
  qualified: "text-chart-3",
  proposal: "text-chart-4",
  negotiation: "text-chart-1",
  won: "text-primary",
  lost: "text-destructive",
};

const STAGE_BORDER: Record<DealStage, string> = {
  lead: "border-l-muted-foreground",
  qualified: "border-l-chart-3",
  proposal: "border-l-chart-4",
  negotiation: "border-l-chart-1",
  won: "border-l-primary",
  lost: "border-l-destructive",
};

const STAGE_DOT: Record<DealStage, string> = {
  lead: "bg-muted-foreground",
  qualified: "bg-chart-3",
  proposal: "bg-chart-4",
  negotiation: "bg-chart-1",
  won: "bg-primary",
  lost: "bg-destructive",
};

const STAGE_BADGE: Record<DealStage, string> = {
  lead: "bg-muted text-muted-foreground",
  qualified: "bg-[var(--chart-3)]/15 text-chart-3",
  proposal: "bg-[var(--chart-4)]/15 text-chart-4",
  negotiation: "bg-[var(--chart-1)]/15 text-chart-1",
  won: "bg-primary/15 text-primary",
  lost: "bg-destructive/10 text-destructive",
};

const CURRENCIES_LIST = CURRENCIES; // from reference data

const OPEN_STAGES: DealStage[] = ["lead", "qualified", "proposal", "negotiation"];

// ---- Partner context type ----
interface PartnerContext {
  partner: Partner;
  deals: Deal[];
  offers: Offer[];
  invoices: any[];
  proformas: any[];
  productCatalog: any[];
  supplierOffers: any[];
  portalAccess: any;
  kyc: any;
  tradeCalculations: any[];
  inventoryMovements: any[];
}

// ---- Partner quick stats ----
interface PartnerQuickStats {
  totalDealsValue: number;
  totalDeals: number;
  wonDeals: number;
  winRate: number;
  avgDealSize: number;
  currency: string;
}

function computePartnerQuickStats(ctx: PartnerContext | null): PartnerQuickStats | null {
  if (!ctx || !ctx.deals.length) return null;
  const totalDeals = ctx.deals.length;
  const wonDeals = ctx.deals.filter((d) => d.stage === "won").length;
  const totalDealsValue = ctx.deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const avgDealSize = totalDealsValue / totalDeals;
  const winRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;
  const currency = ctx.partner.preferred_currency || ctx.deals[0]?.currency || "EUR";
  return { totalDealsValue, totalDeals, wonDeals, winRate, avgDealSize, currency };
}

const PAGE_SIZE = 20;

export function DealsView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [partnerId, setPartnerId] = useState<string>("all");
  const [layout, setLayout] = useState<"pipeline" | "table">("pipeline");
  const [editing, setEditing] = useState<Deal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["deals", search, stageFilter, partnerId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (stageFilter !== "all") params.set("stage", stageFilter);
      if (partnerId !== "all") params.set("partner_id", partnerId);
      const r = await fetch(`/api/deals?${params}`);
      if (!r.ok) throw new Error("Failed to load deals");
      return r.json() as Promise<{ items: Deal[]; total: number }>;
    },
  });

  const { data: partnersData } = useQuery({
    queryKey: ["partners", "list", 200],
    queryFn: async () => {
      const r = await fetch(`/api/partners?limit=200`);
      if (!r.ok) throw new Error("Failed to load partners");
      return r.json() as Promise<{ items: Partner[]; total: number }>;
    },
  });

  const partners = partnersData?.items || [];
  const partnerName = useMemo(() => {
    const map = new Map<string, string>();
    partners.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [partners]);

  const allItems = data?.items || [];
  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const items = allItems.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE);

  const selected = allItems.find((d) => d.id === detailId) || null;

  const pipelineValue = allItems
    .filter((d) => OPEN_STAGES.includes(d.stage))
    .reduce((sum, d) => sum + (d.value || 0), 0);

  const byStage = (() => {
    const map = new Map<DealStage, Deal[]>();
    STAGES.forEach((s) => map.set(s, []));
    allItems.forEach((d) => {
      if (map.has(d.stage)) map.get(d.stage)!.push(d);
    });
    return map;
  })();

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/deals/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Deal deleted.");
      qc.invalidateQueries({ queryKey: ["deals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const stageMut = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: DealStage }) => {
      const r = await fetch(`/api/deals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!r.ok) throw new Error("Stage change failed");
      return r.json();
    },
    onSuccess: (_data, variables) => {
      toast.success(`Stage changed to ${STAGE_LABELS[variables.stage]}.`);
      qc.invalidateQueries({ queryKey: ["deals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Stage change failed."),
  });

  return (
    <div>
      <PageHeader
        title="Deals"
        description={`${data?.total ?? 0} total · Pipeline ${fmtMoney(pipelineValue)}`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> New deal
          </Button>
        }
      />

      <Card className="mb-4 border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={partnerId} onValueChange={setPartnerId}>
            <SelectTrigger className="w-full md:w-52"><SelectValue placeholder="Partner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All partners</SelectItem>
              {partners.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <Button
              size="sm"
              variant={layout === "pipeline" ? "default" : "ghost"}
              className="h-7"
              onClick={() => setLayout("pipeline")}
              title="Pipeline view"
            >
              <LayoutGrid className="size-4 mr-1" /> Pipeline
            </Button>
            <Button
              size="sm"
              variant={layout === "table" ? "default" : "ghost"}
              className="h-7"
              onClick={() => setLayout("table")}
              title="Table view"
            >
              <List className="size-4 mr-1" /> Table
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </CardContent>
        </Card>
      ) : allItems.length === 0 ? (
        <EmptyState
          icon={<Handshake className="size-6" />}
          title="No deals"
          description="Add your first deal to start tracking the pipeline."
          action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New deal</Button>}
        />
      ) : layout === "pipeline" ? (
        <PipelineView
          byStage={byStage}
          partnerName={partnerName}
          onOpen={setDetailId}
        />
      ) : (
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Partner</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="hidden lg:table-cell w-40">Probability</TableHead>
                    <TableHead className="hidden md:table-cell">Expected</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((d) => (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setDetailId(d.id)}
                    >
                      <TableCell>
                        <div className="font-medium">{d.title}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{partnerName.get(d.partner_id) || "—"}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{partnerName.get(d.partner_id) || "—"}</TableCell>
                      <TableCell>
                        <Badge className={`${STAGE_BADGE[d.stage]} hover:opacity-90`}>
                          <span className={`size-1.5 rounded-full ${STAGE_DOT[d.stage]} mr-1`} />
                          {STAGE_LABELS[d.stage]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular">{fmtMoney(d.value, d.currency)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress value={d.probability} className="h-1.5 w-20" />
                          <span className="text-xs font-mono tabular text-muted-foreground">{d.probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{fmtDate(d.expected_close)}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="size-8" onClick={() => setDetailId(d.id)} title="View">
                            <Eye className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditing(d); setShowForm(true); }} title="Edit">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(d.id)} title="Delete">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && layout === "table" && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="icon"
                    className="size-8"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </PaginationItem>
              ))}
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

      {/* Form dialog */}
      <DealFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        deal={editing}
        partners={partners}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["deals"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Handshake className="size-5" />
              {selected?.title || "Deal"}
            </SheetTitle>
            <SheetDescription>Deal details</SheetDescription>
          </SheetHeader>
          {selected ? (
            <DealDetail
              deal={selected}
              partnerName={partnerName.get(selected.partner_id) || "—"}
              partners={partners}
              onStageChange={(stage) => stageMut.mutate({ id: selected.id, stage })}
              onEdit={() => { setEditing(selected); setShowForm(true); setDetailId(null); }}
              onDelete={() => { setDeleteId(selected.id); setDetailId(null); }}
              changing={stageMut.isPending}
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
            <AlertDialogTitle>Delete deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Related offers may lose their reference.
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

// ---- Pipeline view ----
function PipelineView({
  byStage, partnerName, onOpen,
}: {
  byStage: Map<DealStage, Deal[]>;
  partnerName: Map<string, string>;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto custom-scroll pb-2">
      <div className="flex gap-3 min-w-max">
        {STAGES.map((stage) => {
          const list = byStage.get(stage) || [];
          const total = list.reduce((sum, d) => sum + (d.value || 0), 0);
          return (
            <div key={stage} className="w-72 shrink-0">
              <div className="rounded-xl bg-muted/40 border border-border/60 shadow-soft">
                <div className="p-3 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${STAGE_DOT[stage]}`} />
                      <span className="text-sm font-medium">{STAGE_LABELS[stage]}</span>
                    </div>
                    <Badge variant="secondary" className="font-mono tabular text-xs">{list.length}</Badge>
                  </div>
                  <p className={`text-xs font-mono tabular mt-1 ${STAGE_TEXT[stage]}`}>{fmtMoney(total)}</p>
                </div>
                <div className="p-2 space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto custom-scroll">
                  {list.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No deals.</p>
                  )}
                  {list.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onOpen(d.id)}
                      className={`w-full text-left bg-card rounded-lg border border-l-4 ${STAGE_BORDER[stage]} p-3 hover:shadow-soft-md hover:bg-muted/30 transition-all`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight break-words">{d.title}</p>
                        <span className="text-xs font-mono tabular shrink-0">{fmtMoney(d.value, d.currency)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <User className="size-3" />
                        <span className="truncate">{partnerName.get(d.partner_id) || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <Progress value={d.probability} className="h-1 w-16" />
                        <span className="text-[11px] font-mono tabular text-muted-foreground">{d.probability}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Detail panel ----
function DealDetail({
  deal, partnerName, partners, onStageChange, onEdit, onDelete, changing,
}: {
  deal: Deal;
  partnerName: string;
  partners: Partner[];
  onStageChange: (s: DealStage) => void;
  onEdit: () => void;
  onDelete: () => void;
  changing: boolean;
}) {
  const setView = useAppStore((s) => s.setView);
  const setSelectedId = useAppStore((s) => s.setSelectedId);

  // Fetch partner context for quick stats
  const { data: partnerCtx, isLoading: ctxLoading } = useQuery({
    queryKey: ["partner-context", deal.partner_id],
    queryFn: async () => {
      const r = await fetch(`/api/automation/partner-context?partner_id=${deal.partner_id}`);
      if (!r.ok) throw new Error("Failed to load partner context");
      return r.json() as Promise<PartnerContext>;
    },
    enabled: !!deal.partner_id,
    staleTime: 60_000,
  });

  // Check if this deal already has an associated offer
  const { data: dealOffers } = useQuery({
    queryKey: ["offers-for-deal", deal.id],
    queryFn: async () => {
      const r = await fetch(`/api/offers?limit=100`);
      if (!r.ok) throw new Error("Failed to load offers");
      const result = await r.json() as { items: Offer[]; total: number };
      return result.items.filter((o) => o.deal_id === deal.id);
    },
    enabled: !!deal.id,
    staleTime: 30_000,
  });

  const hasExistingOffer = dealOffers && dealOffers.length > 0;
  const quickStats = computePartnerQuickStats(partnerCtx ?? null);

  // Create offer from deal mutation
  const createOfferMut = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/automation/create-offer-from-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: deal.id }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create offer");
      }
      return r.json();
    },
    onSuccess: (data) => {
      toast.success("Offer created from deal!", {
        description: `Offer ${data.number || ""} has been created.`,
        action: {
          label: "View Offer",
          onClick: () => {
            setSelectedId(data.id);
            setView("offers");
          },
        },
      });
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to create offer from deal.");
    },
  });

  const profit = deal.value - (deal.buy_cost || 0);

  // Core info cards
  const info = [
    { icon: User, label: "Partner", value: partnerName },
    { icon: TrendingUp, label: "Value", value: fmtMoney(deal.value, deal.currency) },
    { icon: Calendar, label: "Expected close", value: fmtDate(deal.expected_close) },
  ];

  // Additional deal data
  const additionalInfo: { icon: typeof DollarSign; label: string; value: string }[] = [];
  if (deal.buy_cost) additionalInfo.push({ icon: DollarSign, label: "Buy Cost", value: fmtMoney(deal.buy_cost, deal.currency) });
  if (deal.value && deal.buy_cost) additionalInfo.push({ icon: TrendingUp, label: "Profit", value: fmtMoney(profit, deal.currency) });
  if (deal.quantity) additionalInfo.push({ icon: Package, label: "Quantity", value: `${deal.quantity} ${deal.unit || ""}` });
  if (deal.unit && !deal.quantity) additionalInfo.push({ icon: Scale, label: "Unit", value: deal.unit });
  if (deal.commission_agent_id) additionalInfo.push({ icon: User, label: "Commission Agent", value: deal.commission_agent_id });

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={`${STAGE_BADGE[deal.stage]} hover:opacity-90`}>
          <span className={`size-1.5 rounded-full ${STAGE_DOT[deal.stage]} mr-1`} />
          {STAGE_LABELS[deal.stage]}
        </Badge>
        <Badge variant="outline" className="font-mono tabular">{deal.probability}%</Badge>
        <Badge variant="secondary" className="font-mono">{deal.currency}</Badge>
      </div>

      {/* Quick stage change */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Quick stage change</p>
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((s) => (
            <button
              key={s}
              disabled={changing || s === deal.stage}
              onClick={() => onStageChange(s)}
              className={`text-xs px-2.5 py-1 rounded-md border transition ${
                s === deal.stage
                  ? `${STAGE_BADGE[s]} border-transparent font-medium`
                  : "bg-card hover:bg-muted/50 border-border text-muted-foreground"
              } disabled:opacity-60`}
            >
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Core info */}
      <div className="grid grid-cols-1 gap-2">
        {info.map((x) => {
          const Icon = x.icon;
          return (
            <Card key={x.label} className="border-border/60 shadow-soft rounded-xl">
              <CardContent className="p-3 flex items-center gap-3">
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{x.label}</p>
                  <p className="text-sm font-medium break-words">{x.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional deal data (cost tracking, commission, etc.) */}
      {additionalInfo.length > 0 && (
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Deal Details</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {additionalInfo.map((x) => {
                const Icon = x.icon;
                return (
                  <div key={x.label} className="p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="size-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">{x.label}</p>
                    </div>
                    <p className="text-xs font-medium font-mono tabular">{x.value}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partner Quick Stats */}
      {ctxLoading ? (
        <Card className="border-border/60 shadow-soft rounded-xl">
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : quickStats ? (
        <Card className="border-border/60 shadow-soft rounded-xl bg-gradient-to-br from-muted/30 to-muted/10">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Partner Quick Stats</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-card/80 border border-border/40">
                <DollarSign className="size-3.5 text-chart-3 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Total Value</p>
                <p className="text-xs font-semibold font-mono tabular">{fmtMoney(quickStats.totalDealsValue, quickStats.currency)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-card/80 border border-border/40">
                <Target className="size-3.5 text-chart-4 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Win Rate</p>
                <p className="text-xs font-semibold font-mono tabular">{quickStats.winRate}%</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-card/80 border border-border/40">
                <TrendingUp className="size-3.5 text-chart-1 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Avg Deal</p>
                <p className="text-xs font-semibold font-mono tabular">{fmtMoney(quickStats.avgDealSize, quickStats.currency)}</p>
              </div>
            </div>
            {partnerCtx && partnerCtx.deals.length > 0 && (
              <div className="pt-1">
                <p className="text-[10px] text-muted-foreground mb-1">Recent deals ({quickStats.wonDeals}/{quickStats.totalDeals} won)</p>
                <div className="space-y-1 max-h-24 overflow-y-auto custom-scroll">
                  {partnerCtx.deals.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded bg-muted/40">
                      <span className="truncate max-w-[60%]">{d.title}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono tabular text-muted-foreground">{fmtMoney(d.value, d.currency)}</span>
                        <Badge className={`${STAGE_BADGE[d.stage]} text-[9px] px-1 py-0`}>
                          {STAGE_LABELS[d.stage]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Create Offer from Deal */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <p className="text-xs font-medium">Create Offer from Deal</p>
          </div>
          {hasExistingOffer ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-chart-3" />
                <span>This deal already has an associated offer</span>
              </div>
              {dealOffers && dealOffers.length > 0 && (
                <div className="space-y-1">
                  {dealOffers.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSelectedId(o.id);
                        setView("offers");
                      }}
                      className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">{o.number}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{o.status}</Badge>
                        <span className="font-mono tabular">{fmtMoney(o.total, o.currency)}</span>
                        <ArrowRight className="size-3 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Automatically create a draft offer from this deal with all partner details pre-filled.
              </p>
              <Button
                size="sm"
                onClick={() => createOfferMut.mutate()}
                disabled={createOfferMut.isPending}
                className="w-full"
              >
                {createOfferMut.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-1 animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    <FileText className="size-4 mr-1" /> Create Offer from Deal
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {deal.description && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/50">{deal.description}</p>
        </div>
      )}

      {deal.lost_reason && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Lost reason</p>
          <p className="text-sm whitespace-pre-wrap p-3 rounded-md bg-destructive/5 text-destructive">{deal.lost_reason}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="size-4 mr-1" /> Edit
        </Button>
        <Button variant="outline" size="sm" className="text-destructive" onClick={onDelete}>
          <Trash2 className="size-4 mr-1" /> Delete
        </Button>
      </div>

      <div className="pt-4 border-t space-y-1">
        <p className="text-xs text-muted-foreground">Created: {fmtDate(deal.created_at)}</p>
        <p className="text-xs text-muted-foreground">Updated: {fmtRelative(deal.updated_at)}</p>
      </div>
    </div>
  );
}

// ---- Stage-to-probability mapping ----
const STAGE_PROBABILITY: Record<DealStage, number> = {
  lead: 20,
  qualified: 40,
  proposal: 60,
  negotiation: 80,
  won: 100,
  lost: 0,
};

// ---- Form dialog ----
function DealFormDialog({
  open, onOpenChange, deal, partners, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  deal: Deal | null;
  partners: Partner[];
  onSaved: () => void;
}) {
  const isEditing = !!deal;
  const [form, setForm] = useState<Partial<Deal>>({});
  const [saving, setSaving] = useState(false);

  // Collapsible section state — all open when editing, closed when creating
  const [detailsOpen, setDetailsOpen] = useState(isEditing);
  const [lineItemsOpen, setLineItemsOpen] = useState(isEditing);
  const [commissionOpen, setCommissionOpen] = useState(isEditing);

  // Partner auto-fill context
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [showPartnerContext, setShowPartnerContext] = useState(false);

  // Commission agents
  const { data: agentsData } = useQuery({
    queryKey: ["commission-agents"],
    queryFn: async () => {
      const r = await fetch(`/api/commission-agents?limit=200`);
      if (!r.ok) throw new Error("Failed to load commission agents");
      return r.json() as Promise<{ items: CommissionAgent[]; total: number }>;
    },
    enabled: open,
  });
  const commissionAgents = agentsData?.items || [];

  // Commission preview
  const { data: commissionPreview } = useQuery({
    queryKey: ["commission-preview", form.commission_agent_id, form.value, form.buy_cost, form.quantity],
    queryFn: async () => {
      if (!form.commission_agent_id) return null;
      const r = await fetch(`/api/commission-calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: form.commission_agent_id,
          deal_value: form.value || 0,
          deal_profit: (form.value || 0) - (form.buy_cost || 0),
          deal_quantity: form.quantity || 0,
          deal_unit: form.unit || "",
          currency: form.currency || "USD",
        }),
      });
      if (!r.ok) return null;
      return r.json();
    },
    enabled: !!form.commission_agent_id && open,
  });

  const { data: partnerCtx, isLoading: ctxLoading } = useQuery({
    queryKey: ["partner-context", selectedPartnerId],
    queryFn: async () => {
      const r = await fetch(`/api/automation/partner-context?partner_id=${selectedPartnerId}`);
      if (!r.ok) throw new Error("Failed to load partner context");
      return r.json() as Promise<PartnerContext>;
    },
    enabled: !!selectedPartnerId && open,
    staleTime: 60_000,
  });

  const quickStats = computePartnerQuickStats(partnerCtx ?? null);

  // Fix: useMemo → useEffect for form initialization side effects
  useEffect(() => {
    if (open) {
      const initial = deal ? { ...deal } : {
        stage: "qualified" as DealStage,
        value: 0,
        currency: "USD",
        probability: 20,
        partner_id: partners[0]?.id || "",
      };
      setForm(initial);
      setSelectedPartnerId(initial.partner_id || "");

      // Expand all sections when editing, collapse when creating
      if (deal) {
        setDetailsOpen(true);
        setLineItemsOpen(true);
        setCommissionOpen(true);
      } else {
        setDetailsOpen(false);
        setLineItemsOpen(false);
        setCommissionOpen(false);
      }
    }
  }, [open, deal, partners]);

  // Auto-fill partner data when partner context loads
  useEffect(() => {
    if (partnerCtx && open && !deal) {
      const partner = partnerCtx.partner;
      const updates: Partial<Deal> = {};

      // Auto-fill currency from partner preference
      if (partner.preferred_currency && !form.currency) {
        updates.currency = partner.preferred_currency;
      }

      // Auto-stage progression: if value > 0 and partner selected → "qualified", else → "lead"
      if (form.value && form.value > 0 && form.partner_id) {
        updates.stage = "qualified";
        updates.probability = STAGE_PROBABILITY["qualified"];
      } else if (!form.value || form.value === 0) {
        updates.stage = "lead";
        updates.probability = STAGE_PROBABILITY["lead"];
      }

      if (Object.keys(updates).length > 0) {
        setForm((f) => ({ ...f, ...updates }));
      }
    }
  }, [partnerCtx, open, deal]);

  function set<K extends keyof Deal>(k: K, v: Deal[K]) {
    setForm((f) => {
      const updated = { ...f, [k]: v };

      // Auto-stage progression: when value changes
      if (k === "value") {
        if (v && Number(v) > 0 && updated.partner_id) {
          updated.stage = "qualified";
          updated.probability = STAGE_PROBABILITY["qualified"];
        } else {
          updated.stage = "lead";
          updated.probability = STAGE_PROBABILITY["lead"];
        }
      }

      // Auto-stage progression: when partner changes
      if (k === "partner_id") {
        if (v && updated.value && Number(updated.value) > 0) {
          updated.stage = "qualified";
          updated.probability = STAGE_PROBABILITY["qualified"];
        } else if (!v || !updated.value || Number(updated.value) === 0) {
          updated.stage = "lead";
          updated.probability = STAGE_PROBABILITY["lead"];
        }
      }

      // Auto-probability: when stage changes, update probability to match
      if (k === "stage") {
        const stageVal = v as DealStage;
        if (stageVal in STAGE_PROBABILITY) {
          updated.probability = STAGE_PROBABILITY[stageVal];
        }
      }

      return updated;
    });
  }

  function handlePartnerChange(partnerId: string) {
    set("partner_id", partnerId as Deal["partner_id"]);
    setSelectedPartnerId(partnerId);

    // Auto-fill currency from partner if available
    const partner = partners.find((p) => p.id === partnerId);
    if (partner?.preferred_currency) {
      setForm((f) => ({ ...f, currency: partner.preferred_currency! as Deal["currency"] }));
    }
  }

  async function save() {
    if (!form.title) { toast.error("Title is required."); return; }
    if (!form.partner_id) { toast.error("Select a partner."); return; }
    setSaving(true);
    try {
      const method = deal ? "PUT" : "POST";
      const url = deal ? `/api/deals/${deal.id}` : "/api/deals";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Request failed");
      }
      toast.success(deal ? "Deal updated." : `Deal "${form.title}" created.`, {
        description: deal ? undefined : "It has been added to your pipeline.",
      });
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  const expectedCloseValue = form.expected_close
    ? new Date(form.expected_close).toISOString().slice(0, 10)
    : "";

  // Get the selected partner for auto-fill display
  const selectedPartner = partners.find((p) => p.id === form.partner_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit deal" : "New deal"}</DialogTitle>
          <DialogDescription>
            {deal
              ? "Update the deal details below."
              : "Start with the basics — expand sections for more options."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-4 py-2">
          {/* ===== Essential fields (always visible) ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2 space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Aluminium profile delivery" />
            </div>

            <div className="space-y-1.5">
              <Label>Partner *</Label>
              <Select value={form.partner_id} onValueChange={handlePartnerChange}>
                <SelectTrigger><SelectValue placeholder="Select a partner" /></SelectTrigger>
                <SelectContent>
                  {partners.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => set("stage", v as DealStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input type="number" min={0} step="0.01" value={form.value ?? 0} onChange={(e) => set("value", Number(e.target.value))} />
              {form.value && Number(form.value) > 0 && form.partner_id && (
                <p className="text-[10px] text-chart-3 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Auto-staged to &quot;Qualified&quot;
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {CURRENCIES_LIST.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto-fill info card when partner is selected */}
          {selectedPartner && (
            <Card className="border-primary/20 bg-primary/5 shadow-soft rounded-xl">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Auto-filled from partner</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setShowPartnerContext(!showPartnerContext)}
                  >
                    {showPartnerContext ? "Hide" : "Show"} details
                    {showPartnerContext ? <ChevronUp className="size-3 ml-1" /> : <ChevronDown className="size-3 ml-1" />}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {selectedPartner.address_line && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {selectedPartner.city || selectedPartner.country || selectedPartner.address_line}
                      </span>
                    </div>
                  )}
                  {selectedPartner.preferred_currency && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{selectedPartner.preferred_currency}</span>
                    </div>
                  )}
                  {selectedPartner.contact_email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">{selectedPartner.contact_email}</span>
                    </div>
                  )}
                  {selectedPartner.contact_phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{selectedPartner.contact_phone}</span>
                    </div>
                  )}
                </div>

                {/* Expandable partner context details */}
                {showPartnerContext && (
                  <div className="mt-3 pt-3 border-t border-primary/10 space-y-3">
                    {/* Quick stats */}
                    {ctxLoading ? (
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <div className="grid grid-cols-3 gap-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    ) : quickStats ? (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Partner Quick Stats</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-1.5 rounded bg-card/80 border border-border/40">
                            <p className="text-[9px] text-muted-foreground">Total Value</p>
                            <p className="text-[11px] font-semibold font-mono tabular">{fmtMoney(quickStats.totalDealsValue, quickStats.currency)}</p>
                          </div>
                          <div className="text-center p-1.5 rounded bg-card/80 border border-border/40">
                            <p className="text-[9px] text-muted-foreground">Win Rate</p>
                            <p className="text-[11px] font-semibold font-mono tabular">{quickStats.winRate}%</p>
                          </div>
                          <div className="text-center p-1.5 rounded bg-card/80 border border-border/40">
                            <p className="text-[9px] text-muted-foreground">Avg Deal</p>
                            <p className="text-[11px] font-semibold font-mono tabular">{fmtMoney(quickStats.avgDealSize, quickStats.currency)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">No historical data for this partner.</p>
                    )}

                    {/* Recent deals */}
                    {partnerCtx && partnerCtx.deals.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Recent deals</p>
                        <div className="space-y-1 max-h-28 overflow-y-auto custom-scroll">
                          {partnerCtx.deals.slice(0, 5).map((d) => (
                            <div key={d.id} className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-muted/40">
                              <span className="truncate max-w-[55%]">{d.title}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono tabular text-muted-foreground">{fmtMoney(d.value, d.currency)}</span>
                                <Badge className={`${STAGE_BADGE[d.stage]} text-[9px] px-1 py-0`}>
                                  {STAGE_LABELS[d.stage]}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent offers */}
                    {partnerCtx && partnerCtx.offers.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Recent offers</p>
                        <div className="space-y-1 max-h-28 overflow-y-auto custom-scroll">
                          {partnerCtx.offers.slice(0, 5).map((o) => (
                            <div key={o.id} className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-muted/40">
                              <span className="truncate max-w-[55%]">{o.number}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono tabular text-muted-foreground">{fmtMoney(o.total, o.currency)}</span>
                                <Badge variant="outline" className="text-[9px] px-1 py-0">{o.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ===== More Details (collapsible) ===== */}
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 hover:bg-muted/50 transition-colors">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1 text-left">More Details</span>
              <span className="text-xs text-muted-foreground mr-1">Probability, close date, notes</span>
              {detailsOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <div className="space-y-1.5">
                  <Label>Probability: {form.probability ?? 0}%</Label>
                  <div className="pt-2.5">
                    <Slider
                      value={[form.probability ?? 0]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(v) => set("probability", v[0])}
                    />
                  </div>
                  {form.stage && STAGE_PROBABILITY[form.stage] !== undefined && (
                    <p className="text-[10px] text-muted-foreground">
                      Suggested for {STAGE_LABELS[form.stage]}: {STAGE_PROBABILITY[form.stage]}%
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Expected close</Label>
                  <Input
                    type="date"
                    value={expectedCloseValue}
                    onChange={(e) => set("expected_close", e.target.value ? new Date(e.target.value).toISOString() : (null as any))}
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea rows={3} value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Additional details about this deal…" />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* ===== Line Items (collapsible) ===== */}
          <Collapsible open={lineItemsOpen} onOpenChange={setLineItemsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 hover:bg-muted/50 transition-colors">
              <BarChart3 className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1 text-left">Line Items</span>
              <span className="text-xs text-muted-foreground mr-1">Quantity, unit, buy cost</span>
              {lineItemsOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input type="number" min={0} step={1} value={form.quantity ?? 0} onChange={(e) => set("quantity", Number(e.target.value))} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit of Measure</Label>
                  <Input value={form.unit || ""} onChange={(e) => set("unit", e.target.value)} placeholder="pcs, kg, set, etc." />
                </div>
                <div className="space-y-1.5">
                  <Label>Buy Cost</Label>
                  <Input type="number" min={0} step="0.01" value={form.buy_cost ?? 0} onChange={(e) => set("buy_cost", Number(e.target.value))} placeholder="0.00" />
                  {form.buy_cost && Number(form.buy_cost) > 0 && form.value && Number(form.value) > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      Profit: {fmtMoney(Number(form.value) - Number(form.buy_cost), form.currency || "USD")}
                    </p>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* ===== Commission (collapsible) ===== */}
          <Collapsible open={commissionOpen} onOpenChange={setCommissionOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 hover:bg-muted/50 transition-colors">
              <DollarSign className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1 text-left">Commission</span>
              <span className="text-xs text-muted-foreground mr-1">Agent, type, value</span>
              {commissionOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Commission Agent</Label>
                    <Select value={form.commission_agent_id || "none"} onValueChange={(v) => set("commission_agent_id", v === "none" ? null : (v as any))}>
                      <SelectTrigger><SelectValue placeholder="No commission agent" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No commission agent</SelectItem>
                        {commissionAgents.filter(a => a.active).map((a) => {
                          const p = partners.find(p => p.id === a.partner_id);
                          return (
                            <SelectItem key={a.id} value={a.id}>
                              {p?.name || a.id} ({a.commission_type === "profit_percent" ? `${a.commission_rate}% profit` : a.commission_type === "per_unit" ? `${a.commission_per_unit}/unit` : a.commission_type === "fixed" ? `Fixed ${a.commission_rate}` : a.commission_type === "revenue_percent" ? `${a.commission_rate}% revenue` : "Custom"})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Commission preview */}
                {commissionPreview && form.commission_agent_id && (
                  <Card className="border-primary/20 bg-primary/5 shadow-soft rounded-xl">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">Estimated Commission</span>
                        </div>
                        <span className="text-lg font-bold font-mono tabular text-primary">
                          {fmtMoney(commissionPreview.calculated_commission, commissionPreview.currency)}
                        </span>
                      </div>
                      <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                        <p>Type: {commissionPreview.breakdown?.formula}</p>
                        <p>Deal Value: {fmtMoney(form.value || 0, form.currency || "USD")}</p>
                        <p>Deal Profit: {fmtMoney((form.value || 0) - (form.buy_cost || 0), form.currency || "USD")}</p>
                        {commissionPreview.commission_type === "per_unit" && (
                          <p>Quantity: {form.quantity || 0} {form.unit || ""}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Lost reason (conditional, always visible when stage is lost) */}
          {(form.stage === "lost" || deal?.stage === "lost") && (
            <div className="space-y-1.5">
              <Label>Lost reason</Label>
              <Textarea rows={2} value={form.lost_reason || ""} onChange={(e) => set("lost_reason", e.target.value)} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : deal ? "Save changes" : "Create deal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FolderOpen,
  Package,
  Clock,
  ArrowRight,
  Lock,
  Crown,
  Shield,
  Boxes,
  User,
  Building2,
  Loader2,
  Inbox,
  ShoppingCart,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { fmtMoney, fmtDate, fmtRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type {
  PortalAccess,
  PortalTier,
  Offer,
  SharedDocument,
  Partner,
  OfferStatus,
} from "@/lib/supabase/types";

const TIER_META: Record<
  PortalTier,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  premium: {
    label: "Premium",
    className: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
    icon: Crown,
  },
  standard: {
    label: "Standard",
    className: "border-transparent bg-primary/10 text-primary",
    icon: Shield,
  },
  limited: {
    label: "Limited",
    className: "border-transparent bg-muted text-muted-foreground",
    icon: Boxes,
  },
};

const STATUS_STYLES: Record<OfferStatus, string> = {
  draft: "bg-secondary text-secondary-foreground",
  sent: "border-transparent bg-chart-1 text-white",
  accepted: "border-transparent bg-emerald-600 text-white",
  rejected: "border-transparent bg-destructive text-destructive-foreground",
  expired: "bg-muted text-muted-foreground",
};

const DOC_CATEGORY_STYLES: Record<string, string> = {
  contract: "border-transparent bg-chart-1 text-white",
  invoice: "border-transparent bg-chart-4 text-white",
  spec: "border-transparent bg-chart-2 text-white",
  other: "bg-secondary text-secondary-foreground",
};

export function PortalDashboard() {
  const portalAccess = useAppStore((s) => s.portalAccess) as PortalAccess | null;
  const setView = useAppStore((s) => s.setView);

  const profileQ = useQuery<{ partner: Partner }>({
    queryKey: ["portal-profile"],
    queryFn: async () => {
      const r = await fetch("/api/portal/profile");
      if (!r.ok) throw new Error("Failed to load profile");
      return r.json();
    },
    enabled: !!portalAccess?.can_view_profile,
  });

  const offersQ = useQuery<{ items: Offer[]; total: number }>({
    queryKey: ["portal-offers"],
    queryFn: async () => {
      const r = await fetch("/api/portal/offers");
      if (!r.ok) throw new Error("Failed to load offers");
      return r.json();
    },
    enabled: !!portalAccess?.can_view_offers,
  });

  const docsQ = useQuery<{ items: SharedDocument[]; total: number }>({
    queryKey: ["portal-documents"],
    queryFn: async () => {
      const r = await fetch("/api/portal/documents");
      if (!r.ok) throw new Error("Failed to load documents");
      return r.json();
    },
    enabled: !!portalAccess?.can_view_documents,
  });

  const catalogQ = useQuery<{ items: unknown[]; total: number }>({
    queryKey: ["portal-catalog"],
    queryFn: async () => {
      const r = await fetch("/api/portal/catalog");
      if (!r.ok) throw new Error("Failed to load catalog");
      return r.json();
    },
    enabled: !!portalAccess?.can_view_catalog,
  });

  if (!portalAccess) return null;

  const tier = portalAccess.tier;
  const TierIcon = TIER_META[tier].icon;
  const partner = profileQ.data?.partner;
  const partnerName = partner?.name || "Client";
  const entityType = partner?.entity_type === "individual" ? "Individual" : "Company";

  const recentOffers = (offersQ.data?.items || []).slice(0, 5);
  const recentDocs = (docsQ.data?.items || []).slice(0, 5);
  const activeOffersCount =
    offersQ.data?.items?.filter((o) => o.status === "sent" || o.status === "draft")
      .length ?? 0;

  // KYC alert visibility — show if not exempt and partner KYC is pending/not submitted
  const kycPending =
    !portalAccess.exempt_kyc &&
    (partner?.kyc_status === "not_submitted" || partner?.kyc_status === "pending");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome hero card with mesh + gradient border */}
      <div className="border-gradient shadow-soft-lg">
        <div className="relative bg-card rounded-[calc(var(--radius-xl)-1px)] overflow-hidden">
          <div className="absolute inset-0 bg-mesh-portal opacity-70" />
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground mb-1.5">
                  {fmtDate(new Date().toISOString(), {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  Welcome back,{" "}
                  <span className="text-gradient-emerald">
                    {partnerName.split(" ")[0]}
                  </span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge className={cn("gap-1", TIER_META[tier].className)}>
                    <TierIcon className="size-3" />
                    {TIER_META[tier].label}
                  </Badge>
                  <Badge variant="outline" className="gap-1 bg-card/60">
                    {partner?.entity_type === "individual" ? (
                      <User className="size-3" />
                    ) : (
                      <Building2 className="size-3" />
                    )}
                    {entityType}
                  </Badge>
                  {portalAccess.last_login_at && (
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      Last login {fmtRelative(portalAccess.last_login_at)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {portalAccess.can_view_offers && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView("portal-offers")}
                    className="bg-card/60 backdrop-blur-sm smooth hover:shadow-soft-md"
                  >
                    <FileText className="size-4 mr-1" /> View offers
                  </Button>
                )}
                {portalAccess.can_view_catalog && (
                  <Button
                    size="sm"
                    onClick={() => setView("portal-catalog")}
                    className="smooth hover:shadow-soft-md"
                  >
                    <Package className="size-4 mr-1" /> Browse catalog
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC pending alert */}
      {kycPending && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 sm:p-5 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  Complete your KYC verification to unlock all features
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {partner?.kyc_status === "not_submitted"
                    ? "We need a few documents to verify your account. Takes ~5 minutes."
                    : "Your KYC submission is under review. We'll notify you once approved."}
                </p>
              </div>
            </div>
            {partner?.kyc_status === "not_submitted" && (
              <Button
                size="sm"
                onClick={() => setView("portal-kyc")}
                className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 smooth hover:shadow-soft-md"
              >
                <ShieldCheck className="size-4 mr-1" /> Start KYC
              </Button>
            )}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {portalAccess.can_view_offers ? (
          <KpiPremium
            label="Active Offers"
            value={offersQ.isLoading ? "—" : activeOffersCount}
            sub={`${offersQ.data?.total ?? 0} total`}
            icon={FileText}
          />
        ) : (
          <LockedKpi label="Active Offers" icon={FileText} />
        )}

        {portalAccess.can_view_documents ? (
          <KpiPremium
            label="Documents Available"
            value={docsQ.isLoading ? "—" : docsQ.data?.total ?? 0}
            sub="Shared with you"
            icon={FolderOpen}
          />
        ) : (
          <LockedKpi label="Documents Available" icon={FolderOpen} />
        )}

        {portalAccess.can_view_catalog ? (
          <KpiPremium
            label="Catalog Items"
            value={catalogQ.isLoading ? "—" : catalogQ.data?.total ?? 0}
            sub="Products available"
            icon={Package}
          />
        ) : (
          <LockedKpi label="Catalog Items" icon={Package} />
        )}

        <KpiPremium
          label="Last Login"
          value={fmtRelative(portalAccess.last_login_at)}
          sub={portalAccess.last_login_ip || undefined}
          icon={Clock}
          accent="text-amber-600"
        />
      </div>

      {/* Recent offers + documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent offers */}
        <div className="card-premium">
          <div className="flex flex-row items-center justify-between p-5 pb-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Recent Offers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your latest proposals
              </p>
            </div>
            {portalAccess.can_view_offers && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("portal-offers")}
                className="text-primary"
              >
                View all <ArrowRight className="size-3.5 ml-1" />
              </Button>
            )}
          </div>
          <div className="px-2 pb-2">
            {!portalAccess.can_view_offers ? (
              <LockedNotice />
            ) : offersQ.isLoading ? (
              <LoadingRow />
            ) : recentOffers.length === 0 ? (
              <EmptyRow
                icon={Inbox}
                title="No offers yet"
                desc="Your account manager will send offers here."
              />
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto custom-scroll">
                {recentOffers.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setView("portal-offers")}
                    className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent smooth"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground shrink-0 tabular">
                          {o.number}
                        </span>
                        <Badge
                          className={cn("text-[10px] px-1.5 py-0 capitalize", STATUS_STYLES[o.status])}
                        >
                          {o.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate mt-0.5">{o.subject}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular">
                        {fmtMoney(o.total, o.currency)}
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular">
                        {fmtDate(o.created_at)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent documents */}
        <div className="card-premium">
          <div className="flex flex-row items-center justify-between p-5 pb-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Recent Documents</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Files shared with you
              </p>
            </div>
            {portalAccess.can_view_documents && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("portal-documents")}
                className="text-primary"
              >
                View all <ArrowRight className="size-3.5 ml-1" />
              </Button>
            )}
          </div>
          <div className="px-2 pb-2">
            {!portalAccess.can_view_documents ? (
              <LockedNotice />
            ) : docsQ.isLoading ? (
              <LoadingRow />
            ) : recentDocs.length === 0 ? (
              <EmptyRow
                icon={FolderOpen}
                title="No documents available"
                desc="Shared documents will appear here."
              />
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto custom-scroll">
                {recentDocs.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-accent smooth"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="size-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.filename}</p>
                        <p className="text-[11px] text-muted-foreground tabular">
                          {fmtDate(d.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] px-1.5 py-0 capitalize",
                        DOC_CATEGORY_STYLES[d.category]
                      )}
                    >
                      {d.category}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick action cards with gradient backgrounds */}
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-muted-foreground mb-3 px-1">
          Quick actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Browse Catalog"
            desc="Explore products"
            icon={Package}
            onClick={() => setView("portal-catalog")}
            locked={!portalAccess.can_view_catalog}
          />
          <QuickAction
            title="Request a Quote"
            desc="Send us your needs"
            icon={ShoppingCart}
            onClick={() => setView("portal-rfq")}
            locked={!portalAccess.can_submit_rfq}
          />
          <QuickAction
            title="View Documents"
            desc="Contracts & invoices"
            icon={FolderOpen}
            onClick={() => setView("portal-documents")}
            locked={!portalAccess.can_view_documents}
          />
          <QuickAction
            title="Complete KYC"
            desc="Unlock all features"
            icon={ShieldCheck}
            onClick={() => setView("portal-kyc")}
            locked={portalAccess.exempt_kyc}
            highlight={kycPending}
          />
        </div>
      </div>
    </div>
  );
}

function KpiPremium({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <div className="card-premium p-5 group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
          <p className={cn("text-2xl font-semibold tracking-tight mt-1.5 tabular truncate", accent)}>
            {value}
          </p>
          {sub && <p className="text-[11px] text-muted-foreground mt-1 truncate">{sub}</p>}
        </div>
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center shrink-0 smooth group-hover:scale-110",
            accent ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function LockedKpi({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-5 opacity-80">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <Lock className="size-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Locked</span>
          </div>
        </div>
        <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}

function LockedNotice() {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-center m-2">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
        <Lock className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">This section is locked</p>
      <p className="text-xs text-muted-foreground mt-1">
        Upgrade your access tier to unlock this feature.
      </p>
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function EmptyRow({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center m-2">
      <div className="size-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3">
        <Icon className="size-5 text-primary" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{desc}</p>
    </div>
  );
}

function QuickAction({
  title,
  desc,
  icon: Icon,
  onClick,
  locked,
  highlight,
}: {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  locked?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={cn(
        "group relative text-left rounded-xl p-5 smooth overflow-hidden border",
        locked
          ? "border-dashed border-border/60 bg-muted/30 opacity-70 cursor-not-allowed"
          : highlight
            ? "border-amber-500/30 bg-amber-500/[0.06] shadow-soft hover:shadow-soft-md hover:-translate-y-0.5"
            : "border-border/60 bg-card shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 hover:border-primary/30"
      )}
    >
      {!locked && (
        <div className="absolute top-0 right-0 h-20 w-20 bg-primary/[0.06] blur-2xl rounded-full opacity-0 group-hover:opacity-100 smooth" />
      )}
      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "size-11 rounded-xl flex items-center justify-center shrink-0 smooth group-hover:scale-105",
            locked
              ? "bg-muted text-muted-foreground"
              : highlight
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-gradient-to-br from-primary/15 to-primary/5 text-primary"
          )}
        >
          {locked ? <Lock className="size-5" /> : <Icon className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{desc}</p>
        </div>
        {!locked && (
          <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 smooth" />
        )}
      </div>
    </button>
  );
}

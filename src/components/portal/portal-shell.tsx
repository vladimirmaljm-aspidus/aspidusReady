"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Package,
  ShoppingCart,
  ShieldCheck,
  User,
  Building2,
  LogOut,
  Crown,
  Shield,
  Boxes,
  Briefcase,
  Loader2,
  Menu,
  X,
  MapPin,
  ShieldAlert,
  MessageSquare,
} from "lucide-react";
import { useAppStore, ViewKey } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, fmtRelative } from "@/lib/utils/format";
import { toast } from "sonner";
import type { PortalAccess, PortalTier, Partner } from "@/lib/supabase/types";
import { getTierMeta } from "@/lib/portal/tiers";
import { usePortalGeolocation } from "@/lib/portal/use-geolocation";

const PortalDashboard = dynamic(
  () => import("@/components/portal/portal-dashboard").then((m) => m.PortalDashboard),
  { ssr: false }
);
const PortalOffers = dynamic(
  () => import("@/components/portal/portal-offers").then((m) => m.PortalOffers),
  { ssr: false }
);
const PortalDocuments = dynamic(
  () => import("@/components/portal/portal-documents").then((m) => m.PortalDocuments),
  { ssr: false }
);
const PortalCatalog = dynamic(
  () => import("@/components/portal/portal-catalog").then((m) => m.PortalCatalog),
  { ssr: false }
);
const PortalProfile = dynamic(
  () => import("@/components/portal/portal-profile").then((m) => m.PortalProfile),
  { ssr: false }
);
const PortalKyc = dynamic(
  () => import("@/components/portal/portal-kyc").then((m) => m.PortalKyc),
  { ssr: false }
);
const PortalRfq = dynamic(
  () => import("@/components/portal/portal-rfq").then((m) => m.PortalRfq),
  { ssr: false }
);
const PortalMessages = dynamic(
  () => import("@/components/portal/portal-messages").then((m) => m.PortalMessages),
  { ssr: false }
);
const PortalInvoices = dynamic(
  () => import("@/components/portal/portal-invoices").then((m) => m.PortalInvoices),
  { ssr: false }
);

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gate?: keyof PortalAccess;
}

const NAV_ITEMS: NavItem[] = [
  { key: "portal-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "portal-offers", label: "My Offers", icon: FileText, gate: "can_view_offers" },
  { key: "portal-invoices", label: "My Invoices", icon: FileText, gate: "can_view_invoices" },
  { key: "portal-messages", label: "Messages", icon: MessageSquare },
  { key: "portal-documents", label: "My Documents", icon: FolderOpen, gate: "can_view_documents" },
  { key: "portal-catalog", label: "Product Catalog", icon: Package, gate: "can_view_catalog" },
  { key: "portal-rfq", label: "Request a Quote", icon: ShoppingCart, gate: "can_submit_rfq" },
  { key: "portal-kyc", label: "KYC Verification", icon: ShieldCheck },
  { key: "portal-profile", label: "My Profile", icon: User, gate: "can_view_profile" },
  { key: "portal-profile", label: "Company Info", icon: Building2, gate: "can_view_company_info" },
];

const TIER_META: Record<
  PortalTier,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  premium: {
    label: "Premium",
    className: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
    icon: Crown,
  },
  business: {
    label: "Business",
    className: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    icon: Briefcase,
  },
  standard: {
    label: "Standard",
    className: "border-transparent bg-sky-500/15 text-sky-700 dark:text-sky-400",
    icon: Shield,
  },
  basic: {
    label: "Basic",
    className: "border-transparent bg-muted text-muted-foreground",
    icon: Boxes,
  },
  limited: {
    label: "Basic",
    className: "border-transparent bg-muted text-muted-foreground",
    icon: Boxes,
  },
};

const VIEW_TITLES: Record<string, string> = {
  "portal-dashboard": "Dashboard",
  "portal-offers": "My Offers",
  "portal-invoices": "My Invoices",
  "portal-documents": "My Documents",
  "portal-catalog": "Product Catalog",
  "portal-rfq": "Request a Quote",
  "portal-kyc": "KYC Verification",
  "portal-profile": "My Profile",
};

export function PortalShell({ initialView }: { initialView?: ViewKey } = {}) {
  const portalAccess = useAppStore((s) => s.portalAccess) as PortalAccess | null;
  const setPortalAccess = useAppStore((s) => s.setPortalAccess);
  const setAppMode = useAppStore((s) => s.setAppMode);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  // Apply the initial view once on mount (when navigating to a deep link like
  // /portal/offers the corresponding page passes initialView so the sidebar
  // highlights the right item).
  useEffect(() => {
    if (initialView) setView(initialView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Geolocation capture (required for non-Premium tiers; the hook handles
  // the audit logging and re-logs every 5 minutes).
  const geo = usePortalGeolocation(portalAccess);

  // Fetch partner profile once for sidebar/topbar display
  useEffect(() => {
    let mounted = true;
    fetch("/api/portal/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (mounted && data?.partner) setPartner(data.partner);
        if (mounted) setProfileLoading(false);
      })
      .catch(() => mounted && setProfileLoading(false));
    return () => {
      mounted = false;
    };
  }, [portalAccess?.id]);

  async function signOut() {
    try {
      await fetch("/api/portal/me", { method: "POST" });
    } catch {
      // ignore — still clear client state
    }
    setPortalAccess(null);
    setAppMode("crm");
    toast.success("Signed out of the client portal.");
  }

  if (!portalAccess) return null;

  // Geolocation gate — required for all non-Premium tiers. Block rendering
  // until the browser has granted (or denied) location permission. Premium
  // clients skip this entirely.
  if (geo.required && !geo.shared && (geo.loading || !geo.error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-portal p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MapPin className="size-8 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Sharing your location…</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your browser should be asking for permission to share your
              location. This is required for your tier
              (<strong>{getTierMeta(portalAccess.tier).label}</strong>) and is
              logged securely for compliance.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            Cancel & sign out
          </Button>
        </div>
      </div>
    );
  }

  if (geo.required && !geo.shared && geo.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-portal p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="size-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Location sharing required</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your portal tier (<strong>{getTierMeta(portalAccess.tier).label}</strong>)
              requires geolocation to be shared. Please enable location
              permissions in your browser and reload this page.
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Error: {geo.error}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Reload
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tier = portalAccess.tier;
  const TierIcon = TIER_META[tier].icon;
  const partnerName = partner?.name || "Client";

  const activeTitle =
    view === "portal-profile" ? "My Profile" : VIEW_TITLES[view] || "Client Portal";

  return (
    <div className="min-h-screen flex bg-background bg-mesh-portal">
      {/* Sidebar — portal (glass, client-facing) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/60 glass text-sidebar-foreground">
        <SidebarContent
          portalAccess={portalAccess}
          partnerName={partnerName}
          partner={partner}
          profileLoading={profileLoading}
          view={view}
          setView={(v) => {
            setView(v);
            setMobileNavOpen(false);
          }}
          signOut={signOut}
          tier={tier}
          TierIcon={TierIcon}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 glass-strong border-r border-border/60 flex flex-col smooth">
            <SidebarContent
              portalAccess={portalAccess}
              partnerName={partnerName}
              partner={partner}
              profileLoading={profileLoading}
              view={view}
              setView={(v) => {
                setView(v);
                setMobileNavOpen(false);
              }}
              signOut={signOut}
              tier={tier}
              TierIcon={TierIcon}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar — glass */}
        <header className="h-16 sticky top-0 z-30 border-b border-border/60 glass">
          <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden -ml-2 size-9"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight truncate">
                {activeTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium max-w-[180px] truncate">
                  {partnerName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Last login {fmtRelative(portalAccess.last_login_at)}
                </span>
              </div>
              <Badge className={cn("gap-1 capitalize", TIER_META[tier].className)}>
                <TierIcon className="size-3" />
                {TIER_META[tier].label}
              </Badge>
              <Avatar className="size-9 ring-1 ring-border shadow-soft">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials(partnerName)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* View router */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {view === "portal-dashboard" && <PortalDashboard />}
          {view === "portal-offers" && <PortalOffers />}
          {view === "portal-invoices" && <PortalInvoices />}
          {view === "portal-documents" && <PortalDocuments />}
          {view === "portal-catalog" && <PortalCatalog />}
          {view === "portal-kyc" && <PortalKyc />}
          {view === "portal-rfq" && <PortalRfq />}
          {view === "portal-messages" && <PortalMessages />}
          {view === "portal-profile" && <PortalProfile />}
        </main>
      </div>
    </div>
  );
}

// ---- Sidebar content (shared between desktop + mobile drawer) ----
function SidebarContent({
  portalAccess,
  partnerName,
  partner,
  profileLoading,
  view,
  setView,
  signOut,
  tier,
  TierIcon,
}: {
  portalAccess: PortalAccess;
  partnerName: string;
  partner: Partner | null;
  profileLoading: boolean;
  view: ViewKey;
  setView: (v: ViewKey) => void;
  signOut: () => void;
  tier: PortalTier;
  TierIcon: React.ComponentType<{ className?: string }>;
}) {
  const visibleItems = NAV_ITEMS.filter(
    (n) => !n.gate || (portalAccess[n.gate] as boolean)
  );

  // Group items: main workspace vs account
  const isAccountItem = (label: string) =>
    label === "My Profile" || label === "Company Info" || label === "KYC Verification";

  const workspaceItems = visibleItems.filter((n) => !isAccountItem(n.label));
  const accountItems = visibleItems.filter((n) => isAccountItem(n.label));

  function isActive(item: NavItem): boolean {
    // Company Info maps to portal-profile; only mark active when no other profile item is the visual anchor
    if (item.label === "Company Info" && view === "portal-profile") return false;
    return view === item.key;
  }

  return (
    <>
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border/60 shrink-0">
        <div className="size-9 rounded-lg bg-gradient-emerald text-primary-foreground flex items-center justify-center shrink-0 font-semibold text-sm tracking-tight shadow-soft-md">
          A
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm tracking-tight truncate">Client Portal</p>
          <p className="text-[10px] text-muted-foreground truncate">Aspidus Trading</p>
        </div>
      </div>

      {/* Partner card — premium feel */}
      <div className="px-3 py-4 border-b border-border/60 shrink-0">
        <div className="rounded-xl bg-card border border-border/60 shadow-soft p-3 relative overflow-hidden">
          {/* Subtle accent for premium */}
          {tier === "premium" && (
            <div className="absolute top-0 right-0 h-12 w-12 bg-amber-500/10 blur-2xl rounded-full" />
          )}
          {profileLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loading…</span>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="size-9 ring-1 ring-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-medium">
                    {initials(partnerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" title={partnerName}>
                    {partnerName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {partner?.entity_type === "individual" ? "Individual" : "Company"}
                    {partner?.country ? ` · ${partner.country}` : ""}
                  </p>
                </div>
              </div>
              <Badge
                className={cn("gap-1 capitalize w-full justify-center", TIER_META[tier].className)}
                variant="outline"
              >
                <TierIcon className="size-3" />
                {TIER_META[tier].label} tier
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Nav — workspace */}
      <nav className="flex-1 overflow-y-auto custom-scroll px-3 py-4 space-y-5">
        <div className="space-y-1">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Workspace
          </p>
          {workspaceItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={`ws-${idx}`}
                onClick={() => setView(item.key)}
                className={cn(
                  "group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium smooth",
                  active
                    ? "bg-primary/10 text-primary glow-emerald"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0 smooth",
                    active
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Account section */}
        <div className="space-y-1">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Account
          </p>
          {accountItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={`acc-${idx}`}
                onClick={() => setView(item.key)}
                className={cn(
                  "group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium smooth",
                  active
                    ? "bg-primary/10 text-primary glow-emerald"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0 smooth",
                    active
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sign out */}
      <div className="border-t border-border/60 p-3 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground smooth"
        >
          <LogOut className="size-4 mr-2" /> Sign out
        </Button>
      </div>
    </>
  );
}

"use client";

import * as React from "react";
import { useAppStore, isAdmin, isSuperAdmin } from "@/lib/store/app-store";
import { useI18nStore } from "@/lib/i18n/store";
import { t, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from "@/lib/i18n/dictionaries";
import { useThemeCustomStore, type ThemeAccent, ACCENT_MAP, ACCENT_LABELS } from "@/lib/store/theme-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LogOut,
  ChevronDown,
  Settings,
  ShieldCheck,
  ExternalLink,
  Search,
  Bell,
  PanelRight,
  Globe,
  Palette,
  Sun,
  Moon,
  Check,
  CheckCheck,
  Clock,
  Package,
  FileText,
  AlertTriangle,
  Info,
  Building2,
  Repeat,
} from "lucide-react";
import { toast } from "sonner";
import { initials } from "@/lib/utils/format";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useSearchStore } from "@/components/layout/global-search";
import { useTheme } from "next-themes";
import { fmtRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  partners: "Partners",
  products: "Products",
  deals: "Deals",
  offers: "Offers",
  demands: "Demands",
  documents: "Documents",
  tasks: "Tasks",
  audit: "Audit Log",
  users: "Users",
  settings: "Settings",
  security: "Security Center",
  vault: "Vault",
  "api-keys": "API Keys",
  webhooks: "Webhooks",
  "mail-queue": "Mail Queue",
  invoices: "Invoices",
  proformas: "Proformas",
  "document-register": "Document Register",
  "document-templates": "Document Templates",
  "document-verification": "Document Verification",
  inventory: "Inventory",
  "kyc-review": "KYC Review",
  "portal-rfqs": "Client Requests",
  "product-catalog": "Product Catalog",
  "supplier-offers": "Supplier Offers",
  "trade-calculator": "Trade Calculator",
  tenants: "Tenants",
  "super-admin-overview": "System Overview",
  "feature-flags": "Feature Flags",
  "partner-360": "Partner 360",
  "custom-dashboard": "Custom Dashboard",
  "email-templates": "Email Templates",
  "api-integrations": "API Integrations",
};

// Mock notifications for real-time demo
interface NotifItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  entity_type?: string | null;
}

export function Topbar() {
  const { user, setUser, view, setView, setAppMode } = useAppStore();
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const themeConfig = useThemeCustomStore((s) => s.config);
  const setThemeConfig = useThemeCustomStore((s) => s.setConfig);
  const { resolvedTheme, setTheme } = useTheme();
  const searchOpen = useSearchStore((s) => s.open);
  const admin = isAdmin(user);
  const superAdmin = isSuperAdmin(user);

  // Tenant context state for super-admins
  const [tenantName, setTenantName] = React.useState<string | null>(null);
  const [tenants, setTenants] = React.useState<Array<{ id: string; name: string }>>([]);
  const [tenantDropdownOpen, setTenantDropdownOpen] = React.useState(false);

  // Load tenant name for current user and tenants list for super-admins
  React.useEffect(() => {
    if (!user) return;
    // Check for tenant_id query param (super-admin context switching)
    const urlTenantId = new URLSearchParams(window.location.search).get("tenant_id");
    if (superAdmin) {
      fetch("/api/tenants")
        .then((r) => r.json())
        .then((data) => {
          const items = (data.items || []) as Array<{ id: string; name: string }>;
          setTenants(items);
          if (urlTenantId) {
            const t = items.find((x) => x.id === urlTenantId);
            if (t) setTenantName(t.name);
          }
        })
        .catch(() => {});
    } else if (user.tenant_id) {
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then(() => {
          // For regular users, we just show the tenant name from the tenants list
          fetch("/api/tenants")
            .then((r2) => r2.json())
            .then((data) => {
              const items = (data.items || []) as Array<{ id: string; name: string }>;
              const myTenant = items.find((x: { id: string }) => x.id === user.tenant_id);
              if (myTenant) setTenantName(myTenant.name);
            })
            .catch(() => {});
        })
        .catch(() => {});
    }
  }, [user, superAdmin]);

  function handleTenantSwitch(tenantId: string, name: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("tenant_id", tenantId);
    window.history.pushState({}, "", url.toString());
    setTenantName(name);
    setTenantDropdownOpen(false);
    toast.success(`Switched to ${name}`);
  }

  // Real-time notifications state
  const [notifications, setNotifications] = React.useState<NotifItem[]>([]);
  const [notifOpen, setNotifOpen] = React.useState(false);

  // Real-time notifications — loaded from API
  React.useEffect(() => {
    if (!user) return;
    fetch("/api/notifications?unreadOnly=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data.slice(0, 10));
      })
      .catch(() => {});
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications?markAllRead=true", { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
      }
    } catch {
      // silently fail
    }
  };

  function handleNotifClick(n: NotifItem) {
    setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, read: true } : item));
    if (n.entity_type) {
      const viewMap: Record<string, string> = {
        offers: "offers", invoices: "invoices", kyc: "kyc-review", deals: "deals",
        tasks: "tasks", portal_rfq: "portal-rfqs", documents: "documents",
      };
      const targetView = viewMap[n.entity_type];
      if (targetView) setView(targetView as any);
    }
    setNotifOpen(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setView("dashboard");
    toast.success("Signed out.");
  }

  function openPortal() {
    setAppMode("portal");
  }

  const viewTitle = VIEW_TITLES[view] || "CRM";

  return (
    <>
      {/* ── Left: Breadcrumb-style view title ── */}
      <div className="min-w-0 flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-muted-foreground/60 text-xs font-medium tracking-wide uppercase">
          <PanelRight className="size-3.5" />
          <span className="hidden sm:inline">Aspidus</span>
          <span className="text-muted-foreground/30">/</span>
        </div>
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground truncate smooth">
          {viewTitle}
        </h2>

        {/* Tenant Context Indicator */}
        {superAdmin ? (
          <DropdownMenu open={tenantDropdownOpen} onOpenChange={setTenantDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-md border border-border/50 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 smooth"
              >
                <Building2 className="size-3.5" />
                <span className="truncate max-w-[120px]">{tenantName || "Platform"}</span>
                <ChevronDown className="size-3 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl p-1.5 shadow-soft-lg border-border/50">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
                Switch Tenant Context
              </DropdownMenuLabel>
              <ScrollArea className="max-h-48">
                {tenants.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => handleTenantSwitch(t.id, t.name)}
                    className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm smooth", tenantName === t.name && "bg-accent/50")}
                  >
                    <Building2 className="size-3.5 mr-2 text-muted-foreground" />
                    <span className="truncate">{t.name}</span>
                    {tenantName === t.name && <Check className="size-3.5 ml-auto text-primary" />}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : tenantName ? (
          <Badge
            variant="outline"
            className="hidden sm:inline-flex gap-1 h-7 px-2 rounded-md border-border/50 text-[11px] font-medium text-muted-foreground smooth"
          >
            <Building2 className="size-3" />
            <span className="truncate max-w-[120px]">{tenantName}</span>
          </Badge>
        ) : null}
      </div>

      {/* ── Right: Action cluster ── */}
      <div className="flex items-center gap-1">
        {/* Search — opens command palette */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => searchOpen()}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 smooth"
            >
              <Search className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {t(locale, "search")} <kbd className="ml-1 text-[10px] bg-muted px-1 py-0.5 rounded">⌘K</kbd>
          </TooltipContent>
        </Tooltip>

        {/* Real-time Notifications */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 smooth"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-emerald-500 text-white text-[9px] font-semibold leading-none ring-2 ring-background">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[min(92vw,380px)] p-0 rounded-xl border border-border/60 shadow-soft-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-sm font-semibold truncate">{t(locale, "notifications")}</h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold tabular">
                    {unreadCount}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                disabled={unreadCount === 0}
                onClick={markAllRead}
              >
                <CheckCheck className="size-3.5 mr-1" />
                {t(locale, "mark-all-read")}
              </Button>
            </div>

            {/* Body */}
            <ScrollArea className="max-h-[60vh] custom-scroll">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 flex flex-col items-center text-center">
                  <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center mb-2">
                    <Bell className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{t(locale, "no-notifications")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t(locale, "all-caught-up")}</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/50">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleNotifClick(n)}
                        className={cn(
                          "w-full text-left px-4 py-3 flex items-start gap-3 smooth relative group",
                          !n.read && "bg-accent/30",
                          "hover:bg-accent/50 focus-visible:bg-accent/50",
                        )}
                      >
                        {!n.read && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-emerald-500" />
                        )}
                        <div className={cn(
                          "size-8 shrink-0 rounded-full bg-muted/60 flex items-center justify-center",
                          n.type.includes("overdue") || n.type.includes("rejected") ? "text-destructive" :
                          n.type.includes("accepted") || n.type.includes("won") || n.type.includes("paid") ? "text-emerald-600 dark:text-emerald-400" :
                          "text-muted-foreground"
                        )}>
                          {n.type.includes("overdue") || n.type.includes("rejected") ? <AlertTriangle className="size-4" /> :
                           n.type.includes("accepted") || n.type.includes("won") || n.type.includes("paid") ? <Check className="size-4" /> :
                           n.type.includes("kyc") ? <ShieldCheck className="size-4" /> :
                           n.type.includes("offer") ? <FileText className="size-4" /> :
                           n.type.includes("task") ? <Clock className="size-4" /> :
                           n.type.includes("stock") ? <Package className="size-4" /> :
                           <Info className="size-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <p className={cn("text-sm truncate", n.read ? "font-medium" : "font-semibold")}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground ml-auto shrink-0 tabular">
                              {fmtRelative(n.created_at)}
                            </span>
                          </div>
                          {n.message && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>

            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { setView("audit"); setNotifOpen(false); }}
              >
                {t(locale, "view-all")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Language Switcher */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 smooth"
                >
                  <Globe className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {t(locale, "switch-language")}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 shadow-soft-lg border-border/50">
            <DropdownMenuItem
              onClick={() => setLocale("en")}
              className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm smooth", locale === "en" && "bg-accent/50")}
            >
              <span className="mr-2">🇬🇧</span>
              English
              {locale === "en" && <Check className="size-3.5 ml-auto text-primary" />}
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Customization */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 smooth"
                >
                  <Palette className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {t(locale, "theme-customize")}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-soft-lg border-border/50">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
              {t(locale, "theme-mode")}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm smooth", resolvedTheme === "light" && "bg-accent/50")}
            >
              <Sun className="size-4 mr-2" />
              {t(locale, "theme-light")}
              {resolvedTheme === "light" && <Check className="size-3.5 ml-auto text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm smooth", resolvedTheme === "dark" && "bg-accent/50")}
            >
              <Moon className="size-4 mr-2" />
              {t(locale, "theme-dark")}
              {resolvedTheme === "dark" && <Check className="size-3.5 ml-auto text-primary" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-border/50" />

            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
              {t(locale, "theme-accent-color")}
            </DropdownMenuLabel>
            {(Object.keys(ACCENT_MAP) as ThemeAccent[]).map((accent) => {
              const colors = ACCENT_MAP[accent];
              return (
                <DropdownMenuItem
                  key={accent}
                  onClick={() => setThemeConfig({ accent })}
                  className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm smooth", themeConfig.accent === accent && "bg-accent/50")}
                >
                  <div
                    className="size-4 rounded-full mr-2 ring-1 ring-border/50"
                    style={{ background: colors.light }}
                  />
                  {ACCENT_LABELS[accent]}
                  {themeConfig.accent === accent && <Check className="size-3.5 ml-auto text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-border/50 hidden sm:block" />

        {/* Portal switch */}
        <Button
          variant="ghost"
          size="sm"
          onClick={openPortal}
          className="hidden sm:flex h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 smooth gap-1.5 px-2.5"
        >
          <ExternalLink className="size-3.5" />
          <span className="text-xs font-medium">{t(locale, "portal")}</span>
        </Button>

        {/* Role badge */}
        {user && (
          <Badge
            variant="outline"
            className="hidden md:inline-flex capitalize gap-1 h-7 px-2 rounded-md border-border/50 text-[11px] font-medium text-muted-foreground smooth"
          >
            {admin ? <ShieldCheck className="size-3 text-primary" /> : null}
            <span>{admin ? "Admin" : user.role}</span>
          </Badge>
        )}

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-border/50 hidden md:block" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-muted/50 smooth outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1"
            >
              <Avatar className="size-7 ring-1 ring-border/60 smooth">
                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold smooth">
                  {initials(user?.full_name || user?.username)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-[13px] font-medium text-foreground truncate max-w-[110px]">
                  {user?.full_name || user?.username}
                </span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                  {user?.email}
                </span>
              </div>
              <ChevronDown className="size-3 text-muted-foreground/60 hidden lg:block smooth" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-60 rounded-xl p-1.5 shadow-soft border-border/50 glass-strong"
            sideOffset={8}
          >
            {/* User info header */}
            <DropdownMenuLabel className="font-normal p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="size-9 ring-1 ring-border/60">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials(user?.full_name || user?.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user?.full_name || user?.username}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <Badge
                    variant="secondary"
                    className="w-fit mt-1 capitalize text-[10px] h-5 px-1.5 rounded-md font-medium"
                  >
                    {admin ? (
                      <ShieldCheck className="size-2.5 mr-0.5 text-primary" />
                    ) : null}
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1 bg-border/50" />

            <DropdownMenuItem
              onClick={() => setView("settings")}
              className="cursor-pointer rounded-lg mx-0.5 px-3 py-2 text-sm smooth"
            >
              <Settings className="size-4 mr-2.5 text-muted-foreground" />
              {t(locale, "settings")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setView("security")}
              className="cursor-pointer rounded-lg mx-0.5 px-3 py-2 text-sm smooth"
            >
              <ShieldCheck className="size-4 mr-2.5 text-muted-foreground" />
              {t(locale, "security")}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-border/50" />

            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer rounded-lg mx-0.5 px-3 py-2 text-sm text-destructive focus:text-destructive focus:bg-destructive/10 smooth"
            >
              <LogOut className="size-4 mr-2.5" />
              {t(locale, "sign-out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

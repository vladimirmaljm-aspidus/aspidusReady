"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Inbox,
  FileText,
  Send,
  Clock,
  AlertTriangle,
  Package,
  Mail,
  ListChecks,
  Info,
  UserPlus,
  CheckCheck,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppStore, type ViewKey } from "@/lib/store/app-store";
import { fmtRelative } from "@/lib/utils/format";
import type { Notification, NotificationType } from "@/lib/supabase/types";

type IconColor =
  | "emerald"
  | "amber"
  | "destructive"
  | "muted"
  | "chart-1"
  | "chart-2"
  | "chart-4";

interface IconSpec {
  Icon: React.ComponentType<{ className?: string }>;
  color: IconColor;
}

const NOTIF_ICON_MAP: Record<NotificationType, IconSpec> = {
  kyc_submitted: { Icon: ShieldCheck, color: "amber" },
  kyc_approved: { Icon: CheckCircle2, color: "emerald" },
  kyc_rejected: { Icon: XCircle, color: "destructive" },
  rfq_received: { Icon: Inbox, color: "chart-1" },
  rfq_quoted: { Icon: FileText, color: "chart-4" },
  offer_sent: { Icon: Send, color: "chart-1" },
  offer_accepted: { Icon: CheckCircle2, color: "emerald" },
  offer_rejected: { Icon: XCircle, color: "destructive" },
  offer_expired: { Icon: Clock, color: "muted" },
  invoice_overdue: { Icon: AlertTriangle, color: "destructive" },
  invoice_paid: { Icon: CheckCircle2, color: "emerald" },
  document_shared: { Icon: FileText, color: "chart-2" },
  portal_access_requested: { Icon: UserPlus, color: "chart-4" },
  portal_access_approved: { Icon: CheckCircle2, color: "emerald" },
  portal_invite_sent: { Icon: Mail, color: "chart-1" },
  task_assigned: { Icon: ListChecks, color: "chart-4" },
  task_due_soon: { Icon: Clock, color: "amber" },
  low_stock_alert: { Icon: Package, color: "amber" },
  system_message: { Icon: Info, color: "muted" },
};

const ICON_COLOR_CLASS: Record<IconColor, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
  "chart-1": "text-chart-1",
  "chart-2": "text-chart-2",
  "chart-4": "text-chart-4",
};

// Map notification.entity_type → CRM view key for click navigation.
const ENTITY_VIEW_MAP: Record<string, ViewKey> = {
  partner: "partners",
  partners: "partners",
  product: "products",
  products: "products",
  catalog: "product-catalog",
  supplier_offer: "supplier-offers",
  deal: "deals",
  deals: "deals",
  offer: "offers",
  offers: "offers",
  demand: "demands",
  demands: "demands",
  invoice: "invoices",
  invoices: "invoices",
  proforma: "proformas",
  proformas: "proformas",
  document: "documents",
  documents: "documents",
  task: "tasks",
  tasks: "tasks",
  kyc: "kyc-review",
  kyc_submission: "kyc-review",
  rfq: "portal-rfqs",
  portal_rfq: "portal-rfqs",
  user: "users",
  users: "users",
  portal_access: "users",
  inventory: "inventory",
  audit: "audit",
};

interface NotificationsResponse {
  items: Notification[];
  unread_count: number;
}

export function ActivityCenter() {
  const [open, setOpen] = React.useState(false);
  const qc = useQueryClient();
  const setView = useAppStore((s) => s.setView);
  const setSelectedId = useAppStore((s) => s.setSelectedId);

  const q = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const r = await fetch("/api/notifications");
      if (!r.ok) throw new Error("Failed to load notifications");
      return (await r.json()) as NotificationsResponse;
    },
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const markReadMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (!r.ok) throw new Error("Failed to mark as read");
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["notifications"] });
      const prev = qc.getQueryData<NotificationsResponse>(["notifications"]);
      if (prev) {
        qc.setQueryData<NotificationsResponse>(["notifications"], {
          ...prev,
          items: prev.items.map((n) =>
            n.id === id
              ? { ...n, read: true, read_at: new Date().toISOString() }
              : n,
          ),
          unread_count: Math.max(0, prev.unread_count - 1),
        });
      }
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["notifications"], ctx.prev);
      toast.error("Could not mark notification as read.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(
        `/api/notifications/all?action=mark_all_read`,
        { method: "POST" },
      );
      if (!r.ok) throw new Error("Failed to mark all as read");
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["notifications"] });
      const prev = qc.getQueryData<NotificationsResponse>(["notifications"]);
      if (prev) {
        qc.setQueryData<NotificationsResponse>(["notifications"], {
          ...prev,
          items: prev.items.map((n) => ({ ...n, read: true })),
          unread_count: 0,
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["notifications"], ctx.prev);
      toast.error("Could not mark all as read.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unread = q.data?.unread_count ?? 0;
  const items = (q.data?.items ?? []).slice(0, 10);
  const hasUnread = unread > 0;

  function handleNotificationClick(n: Notification) {
    if (!n.read) markReadMut.mutate(n.id);
    const viewKey = n.entity_type ? ENTITY_VIEW_MAP[n.entity_type] : null;
    if (viewKey) {
      setView(viewKey);
      if (n.entity_id) setSelectedId(n.entity_id);
    } else {
      // Fallback: audit log shows system activity (no dedicated notifications list view yet)
      setView("audit");
    }
    setOpen(false);
  }

  function handleMarkAll() {
    if (!hasUnread) return;
    markAllMut.mutate();
    toast.success("All notifications marked as read.");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          title="Notifications"
          className={cn(
            "relative rounded-full smooth text-muted-foreground hover:text-foreground hover:bg-muted/60",
            hasUnread && "text-foreground",
          )}
        >
          <Bell className="size-5" />
          {hasUnread &&
            (unread > 9 ? (
              <span
                aria-label={`${unread} unread notifications`}
                className="absolute top-1 right-1 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
              />
            ) : (
              <span
                aria-label={`${unread} unread notifications`}
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold leading-none shadow-soft ring-2 ring-background tabular"
              >
                {unread}
              </span>
            ))}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="glass w-[min(92vw,380px)] p-0 rounded-xl border border-border/60 shadow-soft-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm font-semibold truncate">Notifications</h3>
            {hasUnread && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold tabular">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            disabled={!hasUnread || markAllMut.isPending}
            onClick={handleMarkAll}
          >
            <CheckCheck className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Mark all as read</span>
            <span className="sm:hidden">Mark all</span>
          </Button>
        </div>

        {/* Body */}
        {q.isLoading ? (
          <div className="p-4 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="size-8 rounded-full shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded shimmer" />
                  <div className="h-3 w-full rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 px-4 flex flex-col items-center text-center">
            <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center mb-2">
              <Bell className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You're all caught up.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] custom-scroll">
            <ul className="divide-y divide-border/50">
              {items.map((n) => {
                const spec = NOTIF_ICON_MAP[n.type] ?? NOTIF_ICON_MAP.system_message;
                const Icon = spec.Icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "w-full text-left px-4 py-3 flex items-start gap-3 smooth relative group",
                        !n.read && "bg-accent/30",
                        "hover:bg-accent/50 focus-visible:bg-accent/50",
                      )}
                    >
                      {!n.read && (
                        <span
                          aria-hidden
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-emerald-500"
                        />
                      )}
                      <div
                        className={cn(
                          "size-8 shrink-0 rounded-full bg-muted/60 flex items-center justify-center",
                          ICON_COLOR_CLASS[spec.color],
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <p
                            className={cn(
                              "text-sm truncate",
                              n.read ? "font-medium" : "font-semibold",
                            )}
                          >
                            {n.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0 tabular">
                            {fmtRelative(n.created_at)}
                          </span>
                        </div>
                        {n.message && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}

        <Separator />
        {/* Footer */}
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setView("audit");
              setOpen(false);
            }}
          >
            View all
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

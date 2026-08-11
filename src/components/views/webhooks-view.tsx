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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Webhook, Trash2, Pencil, Lock, ShieldCheck, Link2, Zap, Clock, Activity,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtRelative } from "@/lib/utils/format";
import { useAppStore, isAdmin } from "@/lib/store/app-store";
import type { Webhook as WebhookType } from "@/lib/supabase/types";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import { useT } from "@/lib/i18n/store";

const EVENT_COLORS = [
  "bg-[var(--chart-1)] text-white",
  "bg-[var(--chart-2)] text-white",
  "bg-[var(--chart-3)] text-black",
  "bg-[var(--chart-4)] text-black",
  "bg-emerald-600 text-white",
  "bg-[var(--chart-5)] text-white",
];

function eventColor(event: string): string {
  let hash = 0;
  for (let i = 0; i < event.length; i++) hash = (hash * 31 + event.charCodeAt(i)) | 0;
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

function statusBadge(status: number | null) {
  if (status === null) return <Badge variant="secondary">Never</Badge>;
  if (status >= 200 && status < 300) {
    return <Badge className="bg-emerald-600 text-white">{status}</Badge>;
  }
  return <Badge variant="destructive">{status}</Badge>;
}

function truncateUrl(url: string, max = 60): string {
  if (url.length <= max) return url;
  return url.slice(0, max - 1) + "…";
}

function AdminRequired() {
  const t = useT();
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
      <CardContent className="p-6 flex items-start gap-3">
        <Lock className="size-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t("admin-access-required")}</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            {t("admin-webhooks-admin-only-desc")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function WebhooksView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();
  const t = useT();

  const user = useAppStore((s) => s.user);
  const admin = isAdmin(user);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<WebhookType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["webhooks", tenantKey],
    queryFn: async () => {
      const r = await fetch(api("/api/webhooks"));
      if (!r.ok) throw new Error("Failed to load webhooks");
      return r.json() as Promise<{ items: WebhookType[] }>;
    },
    enabled: admin,
  });

  const toggleMut = useMutation({
    mutationFn: async (wh: WebhookType) => {
      const r = await fetch(api("/api/webhooks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...wh, active: !wh.active }),
      });
      if (!r.ok) throw new Error("Failed to toggle webhook");
    },
    onSuccess: (_v, vars) => {
      toast.success(vars.active ? "Webhook disabled." : "Webhook enabled.");
      qc.invalidateQueries({ queryKey: ["webhooks", tenantKey] });
    },
    onError: () => toast.error("Failed to update webhook."),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/webhooks/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete webhook");
    },
    onSuccess: () => {
      toast.success("Webhook deleted.");
      qc.invalidateQueries({ queryKey: ["webhooks", tenantKey] });
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete webhook."),
  });

  if (!admin) {
    return (
      <div>
        <PageHeader title={t("admin-webhooks-title")} description={t("admin-webhooks-desc")} />
        <AdminRequired />
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title={t("admin-webhooks-title")}
        description={`${items.length} ${t("admin-webhooks-count")}`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> {t("admin-webhooks-new")}
          </Button>
        }
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldCheck className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t("admin-webhooks-signed-payloads")}</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {t("admin-webhooks-signed-payloads-desc")}
            </p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-border/60 shadow-soft">
          <EmptyState
            icon={<Webhook className="size-6" />}
            title={t("admin-webhooks-empty-title")}
            description={t("admin-webhooks-empty-desc")}
            action={
              <Button onClick={() => { setEditing(null); setShowForm(true); }}>
                <Plus className="size-4 mr-1" /> {t("admin-webhooks-new")}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scroll pr-1">
          {items.map((wh) => (
            <Card key={wh.id} className="border-border/60 shadow-soft hover:shadow-soft-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="size-4 text-primary shrink-0" />
                      <p className="font-semibold truncate">{wh.name}</p>
                      {!wh.active && <Badge variant="secondary">Disabled</Badge>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Link2 className="size-3 shrink-0" />
                      <code className="font-mono truncate" title={wh.url}>{truncateUrl(wh.url)}</code>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap gap-1 max-w-full">
                      {wh.events && wh.events.length > 0 ? (
                        wh.events.map((e) => (
                          <Badge key={e} className={eventColor(e) + " text-[10px]"}>{e}</Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("admin-webhooks-no-events")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 pt-3 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3" />
                    <span>{t("admin-col-last-triggered")}:</span>
                    <span className="text-foreground">{fmtRelative(wh.last_triggered_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Activity className="size-3" />
                    <span>{t("admin-col-last-status")}:</span>
                    {statusBadge(wh.last_status)}
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Label htmlFor={`wh-active-${wh.id}`} className="text-xs text-muted-foreground cursor-pointer">
                      {t("admin-webhooks-form-active")}
                    </Label>
                    <Switch
                      id={`wh-active-${wh.id}`}
                      checked={wh.active}
                      onCheckedChange={() => toggleMut.mutate(wh)}
                      disabled={toggleMut.isPending}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => { setEditing(wh); setShowForm(true); }}
                    >
                      <Pencil className="size-3.5 mr-1" /> {t("edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(wh.id)}
                    >
                      <Trash2 className="size-3.5 mr-1" /> {t("delete")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WebhookFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        webhook={editing}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["webhooks", tenantKey] });
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin-webhooks-delete-confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin-webhooks-delete-desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMut.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Create/Edit dialog ----
function WebhookFormDialog({
  open, onOpenChange, webhook, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  webhook: WebhookType | null;
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();
  const t = useT();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (webhook) {
      setName(webhook.name);
      setUrl(webhook.url);
      setEvents((webhook.events || []).join(", "));
      setActive(webhook.active);
    } else {
      setName("");
      setUrl("");
      setEvents("");
      setActive(true);
    }
  }, [open, webhook]);

  async function save() {
    if (!name.trim()) { toast.error("Name is required."); return; }
    if (!url.trim()) { toast.error("URL is required."); return; }
    try { new URL(url); } catch { toast.error("URL is not valid."); return; }
    setSaving(true);
    try {
      const eventList = events.split(",").map((s) => s.trim()).filter(Boolean);
      const body: Record<string, unknown> = {
        name: name.trim(),
        url: url.trim(),
        events: eventList,
        active,
      };
      if (webhook) body.id = webhook.id;
      const r = await fetch(api("/api/webhooks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save webhook");
      }
      toast.success(webhook ? "Webhook updated." : "Webhook created.");
      onSaved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save webhook";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{webhook ? t("admin-webhooks-form-title-edit") : t("admin-webhooks-form-title-new")}</DialogTitle>
          <DialogDescription>
            {t("admin-webhooks-form-desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid gap-3 py-2">
          <div className="space-y-1.5">
            <Label>{t("admin-webhooks-form-name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Slack notifications" />
          </div>

          <div className="space-y-1.5">
            <Label>{t("admin-webhooks-form-url")}</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhooks/crm" />
          </div>

          <div className="space-y-1.5">
            <Label>{t("admin-webhooks-form-events")}</Label>
            <Textarea
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              rows={3}
              placeholder="offer.sent, deal.won, deal.lost, invoice.overdue, partner.create"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              {t("admin-webhooks-form-events-help")} Suggestions: <code className="font-mono">offer.sent</code>,{" "}
              <code className="font-mono">deal.won</code>, <code className="font-mono">deal.lost</code>,{" "}
              <code className="font-mono">invoice.overdue</code>, <code className="font-mono">partner.create</code>.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
            <div>
              <p className="text-sm font-medium">{t("admin-webhooks-form-active")}</p>
              <p className="text-xs text-muted-foreground">{t("admin-webhooks-form-active-desc")}</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? t("admin-saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

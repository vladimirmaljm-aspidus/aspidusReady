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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
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
import {
  Plus, Search, Mail, Trash2, Eye, Lock, Inbox, CheckCircle2, XCircle, Clock, Loader2, Send, RotateCcw, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { KpiCard } from "@/components/common/kpi-card";
import { EmptyState } from "@/components/common/empty-state";
import { fmtRelative, fmtDateTime } from "@/lib/utils/format";
import { useAppStore, isAdmin } from "@/lib/store/app-store";
import type { MailQueueEntry, MailStatus } from "@/lib/supabase/types";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

const STATUS_META: Record<MailStatus, { label: string; className: string; icon: typeof Clock }> = {
  queued: { label: "Queued", className: "bg-[var(--chart-4)] text-black", icon: Clock },
  sending: { label: "Sending", className: "bg-[var(--chart-1)] text-white", icon: Loader2 },
  sent: { label: "Sent", className: "bg-emerald-600 text-white", icon: CheckCircle2 },
  failed: { label: "Failed", className: "bg-destructive text-white", icon: XCircle },
};

function AdminRequired() {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
      <CardContent className="p-6 flex items-start gap-3">
        <Lock className="size-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Admin access required</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            The mail queue monitor is only available to administrators.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function MailQueueView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const user = useAppStore((s) => s.user);
  const admin = isAdmin(user);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mail-queue", tenantKey, search, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      const r = await fetch(api(`/api/mail-queue?${params}`));
      if (!r.ok) throw new Error("Failed to load mail queue");
      return r.json() as Promise<{ items: MailQueueEntry[]; total: number }>;
    },
    enabled: admin,
  });

  const retryMut = useMutation({
    mutationFn: async (entry: MailQueueEntry) => {
      const r = await fetch(api("/api/mail-queue"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          status: "queued",
          attempts: 0,
          error: null,
        }),
      });
      if (!r.ok) throw new Error("Failed to retry");
    },
    onSuccess: () => {
      toast.success("Email queued for retry.");
      qc.invalidateQueries({ queryKey: ["mail-queue", tenantKey] });
    },
    onError: () => toast.error("Retry failed."),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/mail-queue/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete email");
    },
    onSuccess: () => {
      toast.success("Email deleted.");
      qc.invalidateQueries({ queryKey: ["mail-queue", tenantKey] });
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete email."),
  });

  if (!admin) {
    return (
      <div>
        <PageHeader title="Mail Queue" description="Monitor outgoing email delivery." />
        <AdminRequired />
      </div>
    );
  }

  const items = data?.items || [];
  const total = data?.total ?? 0;
  const queued = items.filter((m) => m.status === "queued").length;
  const sent24h = items.filter((m) => {
    if (m.status !== "sent" || !m.sent_at) return false;
    return Date.now() - new Date(m.sent_at).getTime() < 24 * 3600 * 1000;
  }).length;
  const failed = items.filter((m) => m.status === "failed").length;

  const detailItem = detailId ? items.find((m) => m.id === detailId) || null : null;

  return (
    <div>
      <PageHeader
        title="Mail Queue"
        description="Monitor outgoing email delivery."
        actions={
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="size-4 mr-1" /> Compose
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Queued"
          value={queued}
          icon={Inbox}
          sub="Waiting to send"
        />
        <KpiCard
          label="Sent (24h)"
          value={sent24h}
          icon={CheckCircle2}
          iconClassName="text-success"
          sub="Last 24 hours"
        />
        <KpiCard
          label="Failed"
          value={failed}
          icon={XCircle}
          iconClassName={failed > 0 ? "text-destructive" : undefined}
          sub="Needs attention"
        />
        <KpiCard
          label="Total"
          value={total}
          icon={Mail}
          sub="All in current view"
        />
      </div>

      <Card className="mb-4">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by recipient or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="sending">Sending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Mail className="size-6" />}
              title="No emails"
              description="The mail queue is empty for the current filter."
              action={
                <Button onClick={() => setShowCompose(true)}>
                  <Plus className="size-4 mr-1" /> Compose
                </Button>
              }
            />
          ) : (
            <div className="max-h-[calc(100vh-440px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Attempts</TableHead>
                    <TableHead className="hidden lg:table-cell">Error</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="hidden lg:table-cell">Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((m) => {
                    const meta = STATUS_META[m.status];
                    const Icon = meta.icon;
                    return (
                      <TableRow
                        key={m.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setDetailId(m.id)}
                      >
                        <TableCell className="font-medium text-sm truncate max-w-[200px]">{m.to_email}</TableCell>
                        <TableCell className="text-sm truncate max-w-[240px]">{m.subject || "—"}</TableCell>
                        <TableCell>
                          <Badge className={meta.className + " gap-1"}>
                            <Icon className="size-3" /> {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell tabular text-sm">{m.attempts}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-destructive truncate max-w-[180px]" title={m.error || ""}>
                          {m.error || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{fmtRelative(m.created_at)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">{fmtRelative(m.sent_at)}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="size-8" onClick={() => setDetailId(m.id)} title="View">
                              <Eye className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(m.id)} title="Delete">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              {detailItem?.subject || "Email"}
            </SheetTitle>
            <SheetDescription>Queue entry detail</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detailItem ? (
            <MailDetail entry={detailItem} onRetry={() => retryMut.mutate(detailItem)} retrying={retryMut.isPending} />
          ) : (
            <div className="p-4">
              <EmptyState
                icon={<Mail className="size-6" />}
                title="Email not found"
                description="This email may have been deleted or is not in the current view."
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ComposeDialog
        open={showCompose}
        onOpenChange={setShowCompose}
        onSaved={() => {
          setShowCompose(false);
          qc.invalidateQueries({ queryKey: ["mail-queue", tenantKey] });
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this email?</AlertDialogTitle>
            <AlertDialogDescription>
              The email will be removed from the queue permanently. If it has not been sent yet, the recipient will not receive it.
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
function MailDetail({
  entry, onRetry, retrying,
}: {
  entry: MailQueueEntry;
  onRetry: () => void;
  retrying: boolean;
}) {
  const meta = STATUS_META[entry.status];
  const Icon = meta.icon;
  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={meta.className + " gap-1"}>
          <Icon className="size-3" /> {meta.label}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <RotateCcw className="size-3" /> {entry.attempts} attempt{entry.attempts === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">To</p>
          <p className="text-sm font-medium truncate">{entry.to_email}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="text-sm">{fmtDateTime(entry.created_at)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Sent</p>
          <p className="text-sm">{fmtDateTime(entry.sent_at)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Last error</p>
          <p className="text-sm text-destructive truncate" title={entry.error || ""}>{entry.error || "—"}</p>
        </CardContent></Card>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Body</p>
        <pre className="text-xs font-mono whitespace-pre-wrap p-3 rounded-md bg-muted/50 border border-border/60 max-h-[400px] overflow-y-auto custom-scroll">
{entry.body || "(empty body)"}
        </pre>
      </div>

      {entry.status === "failed" && (
        <div className="rounded-md border border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 p-3 flex items-start gap-2">
          <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Retry sending</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              This will reset the attempt counter and re-queue the email.
            </p>
          </div>
        </div>
      )}

      <div className="pt-3 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={onRetry}
          disabled={retrying || entry.status === "sending"}
        >
          <RotateCcw className="size-4 mr-1" /> {retrying ? "Retrying…" : "Retry sending"}
        </Button>
      </div>
    </div>
  );
}

// ---- Compose dialog ----
function ComposeDialog({
  open, onOpenChange, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setTo("");
      setSubject("");
      setBody("");
    }
  }, [open]);

  async function save() {
    if (!to.trim()) { toast.error("Recipient is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) { toast.error("Recipient email is not valid."); return; }
    if (!subject.trim()) { toast.error("Subject is required."); return; }
    setSaving(true);
    try {
      const r = await fetch(api("/api/mail-queue"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: to.trim(),
          subject: subject.trim(),
          body,
          status: "queued",
          attempts: 0,
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to queue email");
      }
      toast.success("Email queued.");
      onSaved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to queue email";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-5" /> Compose email
          </DialogTitle>
          <DialogDescription>Queue a manual email for sending.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="space-y-1.5">
            <Label>To *</Label>
            <Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" />
          </div>

          <div className="space-y-1.5">
            <Label>Subject *</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
          </div>

          <div className="space-y-1.5">
            <Label>Body</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Write your email…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Queuing…" : "Queue email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

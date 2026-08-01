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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, KeyRound, Trash2, Lock, ShieldAlert, Copy, Check, AlertTriangle, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtRelative, fmtDate } from "@/lib/utils/format";
import { useAppStore, isAdmin } from "@/lib/store/app-store";
import type { ApiKey } from "@/lib/supabase/types";

type SafeApiKey = Omit<ApiKey, "key_hash">;

const PERM_COLORS = [
  "bg-[var(--chart-1)] text-white",
  "bg-[var(--chart-2)] text-white",
  "bg-[var(--chart-3)] text-black",
  "bg-[var(--chart-4)] text-black",
  "bg-emerald-600 text-white",
  "bg-[var(--chart-5)] text-white",
  "bg-secondary text-secondary-foreground",
];

function permColor(perm: string): string {
  let hash = 0;
  for (let i = 0; i < perm.length; i++) hash = (hash * 31 + perm.charCodeAt(i)) | 0;
  return PERM_COLORS[Math.abs(hash) % PERM_COLORS.length];
}

function AdminRequired() {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
      <CardContent className="p-6 flex items-start gap-3">
        <Lock className="size-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Admin access required</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            API key management is only available to administrators.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApiKeysView() {
  const user = useAppStore((s) => s.user);
  const admin = isAdmin(user);
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const r = await fetch("/api/api-keys");
      if (!r.ok) throw new Error("Failed to load API keys");
      return r.json() as Promise<{ items: SafeApiKey[] }>;
    },
    enabled: admin,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete key");
    },
    onSuccess: () => {
      toast.success("API key revoked.");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete key."),
  });

  if (!admin) {
    return (
      <div>
        <PageHeader title="API Keys" description="Manage keys for external integrations." />
        <AdminRequired />
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title="API Keys"
        description={`${items.length} key${items.length === 1 ? "" : "s"} issued`}
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4 mr-1" /> New API key
          </Button>
        }
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Keep keys secure</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              API keys allow external systems to access the CRM. Keep them secure and rotate them periodically.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<KeyRound className="size-6" />}
              title="No API keys"
              description="Create your first API key to enable external integrations."
              action={
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="size-4 mr-1" /> New API key
                </Button>
              }
            />
          ) : (
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead className="hidden lg:table-cell">Permissions</TableHead>
                    <TableHead className="hidden md:table-cell">Last used</TableHead>
                    <TableHead className="hidden xl:table-cell">Last IP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell>
                        <code className="text-xs font-mono tabular bg-muted px-1.5 py-0.5 rounded">{k.key_prefix}…</code>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[260px]">
                          {k.permissions && k.permissions.length > 0 ? (
                            k.permissions.map((p) => (
                              <Badge key={p} className={permColor(p) + " text-[10px]"}>{p}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{fmtRelative(k.last_used_at)}</TableCell>
                      <TableCell className="hidden xl:table-cell font-mono text-xs tabular">{k.last_used_ip || "—"}</TableCell>
                      <TableCell>
                        {k.active ? (
                          <Badge className="bg-emerald-600 text-white">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">
                        {k.expires_at ? fmtDate(k.expires_at) : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-destructive"
                          onClick={() => setDeleteId(k.id)}
                          title="Revoke"
                        >
                          <Trash2 className="size-4" />
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

      <CreateKeyDialog
        open={showForm}
        onOpenChange={setShowForm}
        onCreated={(fullKey) => {
          setShowForm(false);
          setNewKey(fullKey);
          qc.invalidateQueries({ queryKey: ["api-keys"] });
        }}
      />

      <KeyRevealDialog
        fullKey={newKey}
        onClose={() => setNewKey(null)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              Any external system using this key will immediately lose access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMut.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Create dialog ----
function CreateKeyDialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (fullKey: string) => void;
}) {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setPermissions("");
      setExpiresAt("");
    }
  }, [open]);

  async function save() {
    if (!name.trim()) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      const perms = permissions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const body: Record<string, unknown> = {
        name: name.trim(),
        permissions: perms,
        active: true,
      };
      if (expiresAt) body.expires_at = new Date(expiresAt).toISOString();
      const r = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create key");
      }
      const data = await r.json();
      if (!data.full_key) throw new Error("Server did not return a key.");
      toast.success("API key created.");
      onCreated(data.full_key as string);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create key";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>New API key</DialogTitle>
          <DialogDescription>Generate a key for an external system to access the CRM.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid gap-3 py-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Inventory sync service" />
          </div>

          <div className="space-y-1.5">
            <Label>Permissions</Label>
            <Textarea
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
              rows={3}
              placeholder="partners:read, offers:*, deals:read"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated. Use <code className="font-mono">:*</code> for wildcard scope.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Expires (optional)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">Leave empty for a key that never expires.</p>
          </div>
        </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Generating…" : "Generate key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- One-time key reveal dialog ----
function KeyRevealDialog({ fullKey, onClose }: { fullKey: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullKey || "");
      setCopied(true);
      toast.success("Key copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard not available. Copy manually.");
    }
  }

  return (
    <Dialog open={!!fullKey} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            Copy your API key
          </DialogTitle>
          <DialogDescription>
            This key will not be shown again. Copy it now and store it securely.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <div className="rounded-md border border-border/60 bg-muted/50 p-3">
            <code className="text-xs font-mono break-all block text-foreground">{fullKey}</code>
          </div>

          <Button onClick={copy} variant="outline" className="w-full">
            {copied ? <Check className="size-4 mr-1 text-emerald-600" /> : <Copy className="size-4 mr-1" />}
            {copied ? "Copied" : "Copy to clipboard"}
          </Button>

          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Lock className="size-3 mt-0.5 shrink-0" />
            Treat this key like a password. Anyone with this key can access the CRM at the permissions you granted.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>I&apos;ve saved my key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

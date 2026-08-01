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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, KeyRound, Trash2, Lock, ShieldAlert, Copy, Check, AlertTriangle, Calendar,
  Eye, Code, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtRelative, fmtDate } from "@/lib/utils/format";
import { useAppStore, isAdmin } from "@/lib/store/app-store";
import type { ApiKey } from "@/lib/supabase/types";

type SafeApiKey = Omit<ApiKey, "key_hash">;

// --- Permission presets ---
const PERMISSION_PRESETS: Record<string, { label: string; desc: string; perms: string[] }> = {
  full_access: { label: "Full Access", desc: "Complete read/write access to everything", perms: ["*"] },
  read_only: { label: "Read Only", desc: "Read access to all data, no modifications", perms: ["partners:read", "products:read", "offers:read", "deals:read", "invoices:read", "proformas:read", "documents:read"] },
  sales: { label: "Sales", desc: "Manage partners, offers, and deals", perms: ["partners:*", "offers:*", "deals:*", "products:read"] },
  finance: { label: "Finance", desc: "Manage invoices, proformas, and ERP", perms: ["invoices:*", "proformas:*", "erp:*", "partners:read", "offers:read"] },
  logistics: { label: "Logistics", desc: "Manage inventory and documents", perms: ["inventory:*", "documents:*", "products:read", "partners:read"] },
  api_tester: { label: "API Tester", desc: "Read access for testing integrations", perms: ["partners:read", "products:read", "offers:read"] },
};

// --- Permission categories ---
const PERMISSION_CATEGORIES: Record<string, { label: string; perms: { value: string; label: string }[] }> = {
  Partners: {
    label: "Partners / Clients",
    perms: [
      { value: "partners:read", label: "View partners" },
      { value: "partners:write", label: "Create/edit partners" },
      { value: "partners:delete", label: "Delete partners" },
      { value: "partners:*", label: "Full partner access" },
    ],
  },
  Products: {
    label: "Products / Goods",
    perms: [
      { value: "products:read", label: "View products" },
      { value: "products:write", label: "Create/edit products" },
      { value: "products:delete", label: "Delete products" },
      { value: "products:*", label: "Full product access" },
    ],
  },
  Offers: {
    label: "Offers / Quotes",
    perms: [
      { value: "offers:read", label: "View offers" },
      { value: "offers:write", label: "Create/edit offers" },
      { value: "offers:delete", label: "Delete offers" },
      { value: "offers:*", label: "Full offer access" },
    ],
  },
  Deals: {
    label: "Deals",
    perms: [
      { value: "deals:read", label: "View deals" },
      { value: "deals:write", label: "Create/edit deals" },
      { value: "deals:*", label: "Full deal access" },
    ],
  },
  Invoices: {
    label: "Invoices & Proformas",
    perms: [
      { value: "invoices:read", label: "View invoices" },
      { value: "invoices:write", label: "Create/edit invoices" },
      { value: "proformas:read", label: "View proformas" },
      { value: "proformas:write", label: "Create/edit proformas" },
    ],
  },
  Documents: {
    label: "Documents",
    perms: [
      { value: "documents:read", label: "View documents" },
      { value: "documents:write", label: "Upload/edit documents" },
      { value: "documents:*", label: "Full document access" },
    ],
  },
  ERP: {
    label: "Accounting / ERP",
    perms: [
      { value: "erp:read", label: "View accounting data" },
      { value: "erp:write", label: "Create journal entries" },
      { value: "erp:*", label: "Full ERP access" },
    ],
  },
  Portal: {
    label: "Portal",
    perms: [
      { value: "portal:read", label: "View portal data" },
      { value: "portal:write", label: "Manage portal access" },
    ],
  },
};

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
              Use <code className="font-mono text-xs bg-muted px-1 rounded">Authorization: Bearer asp_xxx</code> header to authenticate.
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
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setSelectedPreset("");
      setCustomPermissions([]);
      setExpiresAt("");
    }
  }, [open]);

  // When preset changes, apply it
  useEffect(() => {
    if (selectedPreset && PERMISSION_PRESETS[selectedPreset]) {
      setCustomPermissions(PERMISSION_PRESETS[selectedPreset].perms);
    } else if (selectedPreset === "custom") {
      setCustomPermissions([]);
    }
  }, [selectedPreset]);

  function togglePerm(perm: string) {
    setCustomPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
    setSelectedPreset("custom");
  }

  async function save() {
    if (!name.trim()) { toast.error("Name is required."); return; }
    if (customPermissions.length === 0) { toast.error("Select at least one permission."); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        permissions: customPermissions,
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
      <DialogContent size="lg" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            New API key
          </DialogTitle>
          <DialogDescription>Generate a key for an external system to access the CRM.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid gap-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Inventory sync service" />
          </div>

          {/* Preset selection */}
          <div className="space-y-1.5">
            <Label>Permission preset</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(PERMISSION_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPreset(key)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-colors ${
                    selectedPreset === key
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className="font-medium block">{preset.label}</span>
                  <span className="text-muted-foreground block mt-0.5">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom permissions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Permissions</Label>
              <Badge variant="secondary" className="text-xs">{customPermissions.length} selected</Badge>
            </div>
            <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
              {Object.entries(PERMISSION_CATEGORIES).map(([catKey, cat]) => (
                <div key={catKey}>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">{cat.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.perms.map((perm) => {
                      const isSelected = customPermissions.includes(perm.value);
                      const isWild = customPermissions.includes("*") || customPermissions.includes(`${perm.value.split(":")[0]}:*`);
                      return (
                        <button
                          key={perm.value}
                          type="button"
                          onClick={() => togglePerm(perm.value)}
                          className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                            isSelected || isWild
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-background border-border hover:border-primary/30"
                          }`}
                        >
                          {perm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expires */}
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
          <Button onClick={save} disabled={saving || !name.trim() || customPermissions.length === 0}>
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

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={copy} variant="outline" className="w-full">
              {copied ? <Check className="size-4 mr-1 text-emerald-600" /> : <Copy className="size-4 mr-1" />}
              {copied ? "Copied" : "Copy to clipboard"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const example = `curl -H "Authorization: Bearer ${fullKey}" /api/partners`;
                navigator.clipboard.writeText(example).catch(() => {});
                toast.success("Example command copied.");
              }}
            >
              <Code className="size-4 mr-1" />
              Copy example
            </Button>
          </div>

          <div className="rounded-lg border p-3 space-y-1.5">
            <p className="text-xs font-medium">Usage examples:</p>
            <div className="text-xs font-mono bg-muted/50 rounded p-2 space-y-1">
              <p className="text-muted-foreground"># Test your key</p>
              <p>curl -H &quot;Authorization: Bearer {fullKey?.slice(0, 12)}…&quot; /api/api-keys/test</p>
              <p className="text-muted-foreground mt-1"># List partners</p>
              <p>curl -H &quot;Authorization: Bearer {fullKey?.slice(0, 12)}…&quot; /api/partners</p>
            </div>
          </div>

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

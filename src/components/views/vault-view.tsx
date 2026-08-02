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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Search, KeyRound, Pencil, Trash2, Lock, ShieldCheck, EyeOff, Database, Mail, CreditCard, Box,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtRelative } from "@/lib/utils/format";
import { useAppStore, isAdmin } from "@/lib/store/app-store";
import type { VaultSecret } from "@/lib/supabase/types";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

type SecretCategory = VaultSecret["category"];
type SafeSecret = Omit<VaultSecret, "encrypted_value">;

const CATEGORY_META: Record<SecretCategory, { label: string; icon: typeof KeyRound; className: string }> = {
  api: { label: "API", icon: KeyRound, className: "bg-[var(--chart-1)] text-white" },
  smtp: { label: "SMTP", icon: Mail, className: "bg-[var(--chart-4)] text-black" },
  database: { label: "Database", icon: Database, className: "bg-[var(--chart-3)] text-black" },
  payment: { label: "Payment", icon: CreditCard, className: "bg-emerald-600 text-white" },
  other: { label: "Other", icon: Box, className: "bg-secondary text-secondary-foreground" },
};

function AdminRequired() {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
      <CardContent className="p-6 flex items-start gap-3">
        <Lock className="size-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Admin access required</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            The encrypted vault is only available to administrators.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function VaultView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const user = useAppStore((s) => s.user);
  const admin = isAdmin(user);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [editing, setEditing] = useState<SafeSecret | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["vault", tenantKey, search, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      const r = await fetch(api(`/api/vault?${params}`));
      if (!r.ok) throw new Error("Failed to load vault");
      return r.json() as Promise<{ items: SafeSecret[]; total: number }>;
    },
    enabled: admin,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/vault/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete secret");
    },
    onSuccess: () => {
      toast.success("Secret deleted.");
      qc.invalidateQueries({ queryKey: ["vault", tenantKey] });
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete secret."),
  });

  if (!admin) {
    return (
      <div>
        <PageHeader title="Vault" description="Encrypted secrets store." />
        <AdminRequired />
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title="Vault"
        description={`${data?.total ?? 0} encrypted secret${(data?.total ?? 0) === 1 ? "" : "s"}`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="size-4 mr-1" /> New secret
          </Button>
        }
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldCheck className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Encrypted at rest</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Vault secrets are encrypted and never displayed after creation. Store them in your password manager.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by key or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="smtp">SMTP</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
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
              icon={<KeyRound className="size-6" />}
              title="No secrets yet"
              description="Store API keys, SMTP passwords, database credentials and other secrets here."
              action={
                <Button onClick={() => { setEditing(null); setShowForm(true); }}>
                  <Plus className="size-4 mr-1" /> New secret
                </Button>
              }
            />
          ) : (
            <div className="max-h-[calc(100vh-380px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Last accessed</TableHead>
                    <TableHead className="hidden md:table-cell">Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s) => {
                    const meta = CATEGORY_META[s.category];
                    const Icon = meta.icon;
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <EyeOff className="size-3.5 text-muted-foreground shrink-0" />
                            <code className="text-sm font-semibold font-mono">{s.key}</code>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {s.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={meta.className + " gap-1"}>
                            <Icon className="size-3" /> {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">{fmtRelative(s.last_accessed_at)}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{fmtRelative(s.updated_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditing(s); setShowForm(true); }} title="Edit">
                              <Pencil className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(s.id)} title="Delete">
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

      <VaultFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        secret={editing}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["vault", tenantKey] });
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this secret?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. Any system using this secret will immediately lose access. Consider rotating the secret before deleting it.
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

// ---- Create/Edit dialog ----
function VaultFormDialog({
  open, onOpenChange, secret, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  secret: SafeSecret | null;
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [cat, setCat] = useState<SecretCategory>("api");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (secret) {
      setKey(secret.key);
      setDescription(secret.description || "");
      setCat(secret.category);
      setValue("");
    } else {
      setKey("");
      setDescription("");
      setCat("api");
      setValue("");
    }
  }, [open, secret]);

  async function save() {
    if (!key.trim()) { toast.error("Key is required."); return; }
    if (!secret && !value) { toast.error("Value is required for new secrets."); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        key: key.trim(),
        description: description.trim() || null,
        category: cat,
      };
      if (secret) body.id = secret.id;
      if (value) body.encrypted_value = value;
      const r = await fetch(api("/api/vault"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save secret");
      }
      toast.success(secret ? "Secret updated." : "Secret created.");
      onSaved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save secret";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{secret ? "Edit secret" : "New secret"}</DialogTitle>
          <DialogDescription>
            {secret
              ? "Update the description, category, or replace the value."
              : "Store a new encrypted secret."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid gap-3 py-2">
          <div className="space-y-1.5">
            <Label>Key *</Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="STRIPE_SECRET_KEY"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">A unique identifier for this secret.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Stripe production secret key"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={cat} onValueChange={(v) => setCat(v as SecretCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="smtp">SMTP</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{secret ? "New value (optional)" : "Value *"}</Label>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              placeholder="sk_live_…"
              className="font-mono [-webkit-text-security:disc]"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="size-3" />
              Value is encrypted at rest. You won&apos;t be able to view it after saving.
            </p>
          </div>
        </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

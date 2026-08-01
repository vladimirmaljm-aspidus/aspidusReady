"use client";

import { useState, useMemo } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, Users as UsersIcon, ShieldAlert, ChevronDown, Wand2, Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtRelative } from "@/lib/utils/format";
import { useAppStore, isAdmin, SafeUser } from "@/lib/store/app-store";
import { UserRole } from "@/lib/supabase/types";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin", accountant: "Accountant", manager: "Manager", staff: "Staff", viewer: "Viewer",
};

const ROLE_DESCRIPTION: Record<UserRole, string> = {
  admin: "Full access to all features and user management",
  accountant: "Access to financial data, invoices, and ERP",
  manager: "Can manage deals, offers, and client relationships",
  staff: "Can view and edit basic records",
  viewer: "Read-only access to view records",
};

// admin=default, manager=chart-4, staff=secondary, viewer=outline
const ROLE_BADGE: Record<UserRole, string> = {
  admin: "border-transparent bg-primary text-primary-foreground",
  accountant: "border-transparent bg-chart-3 text-white",
  manager: "border-transparent bg-chart-4 text-white",
  staff: "border-transparent bg-secondary text-secondary-foreground",
  viewer: "",
};

function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function generatePassword(): string {
  const letters = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const all = letters + numbers;
  let pwd = "";
  // Ensure at least 1 letter and 1 number
  pwd += letters[Math.floor(Math.random() * letters.length)];
  pwd += numbers[Math.floor(Math.random() * numbers.length)];
  for (let i = 2; i < 8; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  // Shuffle
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

export function UsersView() {
  const qc = useQueryClient();
  const currentUser = useAppStore((s) => s.user);
  const admin = isAdmin(currentUser);
  const [editing, setEditing] = useState<SafeUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const r = await fetch("/api/users");
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to load users");
      }
      return r.json() as Promise<{ items: SafeUser[] }>;
    },
    enabled: admin,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to delete user");
      }
    },
    onSuccess: () => {
      toast.success("User deleted.");
      qc.invalidateQueries({ queryKey: ["users"] });
      setDeleteId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete user."),
  });

  const items = data?.items || [];

  const handleToggleActive = async (userId: string, active: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(active ? "User activated" : "User deactivated");
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch {
      toast.error("Failed to update user status");
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description={`${items.length} total`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }} disabled={!admin}>
            <Plus className="size-4 mr-1" /> New user
          </Button>
        }
      />

      {!admin && (
        <Card className="mb-4 border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldAlert className="size-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Admin access required
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !admin ? (
            <EmptyState
              icon={<UsersIcon className="size-6" />}
              title="No access"
              description="An admin role is required to manage users."
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="size-6" />}
              title="No users"
              description="Add your first user to get started."
              action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New user</Button>}
            />
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="hidden lg:table-cell">Last login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">{initials(u.full_name || u.username)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{u.username}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.full_name || "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{u.email || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "viewer" ? "outline" : "default"} className={ROLE_BADGE[u.role as UserRole]}>
                            {ROLE_LABEL[u.role as UserRole] || u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch checked={!!u.active} onCheckedChange={(v) => handleToggleActive(u.id, v)} />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {fmtRelative((u as SafeUser & { last_login_at?: string | null }).last_login_at ?? null)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditing(u); setShowForm(true); }} title="Edit">
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive"
                              disabled={isSelf}
                              onClick={() => {
                                if (isSelf) {
                                  toast.error("You cannot delete yourself.");
                                  return;
                                }
                                setDeleteId(u.id);
                              }}
                              title={isSelf ? "You cannot delete yourself" : "Delete"}
                            >
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

      <UserFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        user={editing}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey: ["users"] });
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
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

type UserForm = {
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  password: string;
  active: boolean;
  permissions: string;
};

function UserFormDialog({
  open, onOpenChange, user, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: SafeUser | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<UserForm>({
    username: "", email: "", full_name: "", role: "staff", password: "", active: true, permissions: "",
  });
  const [saving, setSaving] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);

  // Whether the existing user has custom permissions (non-empty)
  const hasCustomPermissions = !!(user?.permissions && user.permissions.length > 0);

  useMemo(() => {
    if (open) {
      setForm({
        username: user?.username || "",
        email: user?.email || "",
        full_name: user?.full_name || "",
        role: (user?.role as UserRole) || "staff",
        password: "",
        active: user?.active ?? true,
        permissions: (user?.permissions || []).join(", "),
      });
      setAdvancedOpen(!!(user?.permissions && user.permissions.length > 0));
      setShowPassword(false);
      setCopied(false);
      setUsernameManuallyEdited(false);
    }
  }, [open, user]);

  function set<K extends keyof UserForm>(k: K, v: UserForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleEmailChange(email: string) {
    set("email", email);
    if (!usernameManuallyEdited) {
      const username = email.split("@")[0] || "";
      set("username", username);
    }
  }

  function handleUsernameChange(username: string) {
    set("username", username);
    setUsernameManuallyEdited(true);
  }

  function handleGeneratePassword() {
    const pwd = generatePassword();
    set("password", pwd);
    setShowPassword(true);
    setCopied(false);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  async function save() {
    if (!form.username.trim()) { toast.error("Please enter a username."); return; }
    if (!user && !form.password) { toast.error("Please enter or generate a password."); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        username: form.username.trim(),
        email: form.email.trim(),
        full_name: form.full_name.trim() || null,
        role: form.role,
        active: form.active,
      };

      // Permissions: only send custom permissions if the user explicitly set them
      // For new users, send null (use role defaults)
      // For existing users, only send if they had custom permissions AND the field is non-empty
      if (hasCustomPermissions && form.permissions.trim()) {
        const perms = form.permissions.split(",").map((s) => s.trim()).filter(Boolean);
        body.permissions = perms.length ? perms : null;
      } else {
        body.permissions = null;
      }

      if (form.password) body.password = form.password;

      const method = user ? "PUT" : "POST";
      const url = user ? `/api/users/${user.id}` : "/api/users";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save user");
      }

      if (user) {
        toast.success("User updated.");
      } else {
        // Show login details toast for new user creation
        toast.success("User created successfully!", {
          description: `Username: ${form.username.trim()}  |  Password: ${form.password}`,
          duration: 8000,
        });
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{user ? "Edit user" : "New user"}</DialogTitle>
          <DialogDescription>
            {user ? "Update the user details below." : "Fill in the details to create a new user account."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-4 py-2">

            {/* Full Name — first field */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="John Doe"
              />
            </div>

            {/* Email — auto-generates username */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="name@company.com"
              />
            </div>

            {/* Role — with descriptions */}
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select value={form.role} onValueChange={(v) => set("role", v as UserRole)}>
                <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["admin", "accountant", "manager", "staff", "viewer"] as UserRole[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex flex-col">
                        <span className="font-medium">{ROLE_LABEL[role]}</span>
                        <span className="text-xs text-muted-foreground">{ROLE_DESCRIPTION[role]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTION[form.role]}</p>
            </div>

            {/* Password — with auto-generate and visibility toggle */}
            {!user && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="••••••••"
                      className="pr-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    title="Auto-generate a secure password"
                  >
                    <Wand2 className="size-4 mr-1" />
                    Generate
                  </Button>
                </div>
                {form.password && showPassword && (
                  <div className="flex items-center gap-2 mt-1.5 p-2 bg-muted/50 rounded-md border">
                    <code className="text-sm font-mono flex-1 break-all">{form.password}</code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      onClick={() => copyToClipboard(form.password)}
                      title="Copy password"
                    >
                      {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5 text-muted-foreground" />}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Password for editing — only shown if user wants to change it */}
            {user && (
              <div className="space-y-1.5">
                <Label htmlFor="password">New password <span className="text-muted-foreground font-normal">(leave blank to keep current)</span></Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="••••••••"
                      className="pr-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    title="Auto-generate a secure password"
                  >
                    <Wand2 className="size-4 mr-1" />
                    Generate
                  </Button>
                </div>
                {form.password && showPassword && (
                  <div className="flex items-center gap-2 mt-1.5 p-2 bg-muted/50 rounded-md border">
                    <code className="text-sm font-mono flex-1 break-all">{form.password}</code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      onClick={() => copyToClipboard(form.password)}
                      title="Copy password"
                    >
                      {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5 text-muted-foreground" />}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Advanced settings — collapsible */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between px-0 hover:bg-transparent">
                  <span className="text-sm font-medium text-muted-foreground">Advanced settings</span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 pt-2">

                  {/* Username — auto-filled from email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={form.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="jdoe"
                    />
                    <p className="text-xs text-muted-foreground">Auto-filled from email. You can change it if needed.</p>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-xs text-muted-foreground">Inactive users cannot sign in.</p>
                    </div>
                    <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
                  </div>

                  {/* Permissions — only for existing users with custom permissions */}
                  {user && hasCustomPermissions && (
                    <div className="space-y-1.5">
                      <Label htmlFor="permissions">Custom permissions</Label>
                      <Textarea
                        id="permissions"
                        rows={2}
                        value={form.permissions}
                        onChange={(e) => set("permissions", e.target.value)}
                        placeholder="partner.*, deal.read, offer.create — leave blank for role defaults"
                      />
                      <p className="text-xs text-muted-foreground">
                        This user has custom permissions. Clear the field to use role defaults instead.
                        Rules: <code>*</code> for all, <code>module.*</code> for an entire module, <code>module.action</code> for a specific action.
                      </p>
                    </div>
                  )}

                </div>
              </CollapsibleContent>
            </Collapsible>

          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : user ? "Save changes" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

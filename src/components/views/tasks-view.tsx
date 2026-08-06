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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, ListChecks, CheckCircle2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtDate, fmtRelative, fmtNumber, fmtMoney } from "@/lib/utils/format";
import { UserTask } from "@/lib/supabase/types";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

type Priority = "low" | "medium" | "high";

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low", medium: "Medium", high: "High",
};

const PRIORITY_BADGE: Record<Priority, string> = {
  high: "border-transparent bg-destructive text-white",
  medium: "border-transparent bg-chart-4 text-white",
  low: "border-transparent bg-secondary text-secondary-foreground",
};

function isPast(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

function toInputDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function TasksView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const qc = useQueryClient();
  const [mine, setMine] = useState(true);
  const [editing, setEditing] = useState<UserTask | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryKey = useMemo(() => ["tasks", tenantKey, mine] as const, [mine, tenantKey]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const url = mine ? api("/api/tasks?mine=true") : api("/api/tasks");
      const r = await fetch(url);
      if (!r.ok) throw new Error("Failed to load tasks");
      return r.json() as Promise<{ items: UserTask[] }>;
    },
  });

  const items = data?.items || [];
  const active = items.filter((t) => !t.done);
  const done = items.filter((t) => t.done);

  const toggleMut = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const r = await fetch(api(`/api/tasks/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
      if (!r.ok) throw new Error("Failed to update task");
      return r.json();
    },
    onMutate: async ({ id, done }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<{ items: UserTask[] }>(queryKey);
      if (prev) {
        qc.setQueryData<{ items: UserTask[] }>(queryKey, {
          items: prev.items.map((t) => (t.id === id ? { ...t, done } : t)),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
      toast.error("Failed to update task.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(api(`/api/tasks/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      toast.success("Task deleted.");
      qc.invalidateQueries({ queryKey });
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete task."),
  });

  return (
    <div>
      <PageHeader
        title="Tasks"
        description={`${active.length} active · ${done.length} completed`}
        actions={
          <>
            <label className="flex items-center gap-2 text-sm text-muted-foreground mr-1">
              <Switch checked={mine} onCheckedChange={setMine} />
              Only mine
            </label>
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="size-4 mr-1" /> New task
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/60 shadow-soft rounded-xl">
              <CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-6" />}
          title="No tasks"
          description="Create your first task to keep track of your work."
          action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-4 mr-1" /> New task</Button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <TaskColumn
            title="Active"
            icon={<ListChecks className="size-4" />}
            count={active.length}
            tasks={active}
            onToggle={(t) => toggleMut.mutate({ id: t.id, done: !t.done })}
            onEdit={(t) => { setEditing(t); setShowForm(true); }}
            onDelete={(t) => setDeleteId(t.id)}
          />
          <TaskColumn
            title="Completed"
            icon={<CheckCircle2 className="size-4" />}
            count={done.length}
            tasks={done}
            onToggle={(t) => toggleMut.mutate({ id: t.id, done: !t.done })}
            onEdit={(t) => { setEditing(t); setShowForm(true); }}
            onDelete={(t) => setDeleteId(t.id)}
          />
        </div>
      )}

      <TaskFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        task={editing}
        onSaved={() => {
          setShowForm(false);
          qc.invalidateQueries({ queryKey });
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
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

function TaskColumn({
  title, icon, count, tasks, onToggle, onEdit, onDelete,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  tasks: UserTask[];
  onToggle: (t: UserTask) => void;
  onEdit: (t: UserTask) => void;
  onDelete: (t: UserTask) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
        <Badge variant="secondary" className="ml-1 tabular">{fmtNumber(count)}</Badge>
      </div>
      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll pr-1">
        {tasks.length === 0 ? (
          <Card className="border-border/60 shadow-soft rounded-xl">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No tasks here.
            </CardContent>
          </Card>
        ) : (
          tasks.map((t) => (
            <Card
              key={t.id}
              className="border-border/60 shadow-soft rounded-xl hover:shadow-soft-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={t.done}
                    onCheckedChange={() => onToggle(t)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>
                        {t.title}
                      </p>
                      <Badge className={PRIORITY_BADGE[t.priority]}>
                        {PRIORITY_LABEL[t.priority]}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Due:{" "}
                        <span className={`tabular ${isPast(t.due_date) && !t.done ? "text-destructive font-medium" : ""}`}>
                          {fmtDate(t.due_date)}
                        </span>
                      </span>
                      <span className="tabular">Created {fmtRelative(t.created_at)}</span>
                      {t.entity_type && t.entity_id && (
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Link2 className="size-3" />
                          {t.entity_type}:{t.entity_id.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => onEdit(t)} title="Edit">
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => onDelete(t)} title="Delete">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function TaskFormDialog({
  open, onOpenChange, task, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task: UserTask | null;
  onSaved: () => void;
}) {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useMemo(() => {
    if (open) {
      setTitle(task?.title || "");
      setPriority((task?.priority as Priority) || "medium");
      setDueDate(toInputDate(task?.due_date || null));
      setDone(!!task?.done);
    }
  }, [open, task]);

  async function save() {
    if (!title.trim()) { toast.error("Please enter a title."); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        priority,
        done,
      };
      if (dueDate) body.due_date = new Date(dueDate).toISOString();
      else body.due_date = null;

      // preserve entity link if editing
      if (task?.entity_type) body.entity_type = task.entity_type;
      if (task?.entity_id) body.entity_id = task.entity_id;

      const method = task ? "PUT" : "POST";
      const url = task ? api(`/api/tasks/${task.id}`) : api("/api/tasks");
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save task");
      }
      toast.success(task ? "Task updated." : "Task created.");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>Fill in the basic task details.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid gap-3 py-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Call the customer…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
            <div>
              <p className="text-sm font-medium">Done</p>
              <p className="text-xs text-muted-foreground">Mark this task as completed.</p>
            </div>
            <Switch checked={done} onCheckedChange={setDone} />
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

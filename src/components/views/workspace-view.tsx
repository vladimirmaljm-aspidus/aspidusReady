"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Clock, Receipt, FileText, Plus, Trash2, Play, Square, CheckCircle2, Circle, AlertCircle, DollarSign, Users, MessageSquare, FolderOpen, KanbanSquare, Send, File } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard } from "@/components/common/kpi-card";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import { fmtDate, fmtDateTime, fmtRelative, fmtMoney } from "@/lib/utils/format";

export function WorkspaceView() {
  const [tab, setTab] = useState("reminders");
  return <div><PageHeader title="Workspace" description="Personal productivity tools." />
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full sm:w-auto overflow-x-auto">
        <TabsTrigger value="reminders" className="gap-1.5"><Bell className="size-3.5" /> Reminders</TabsTrigger>
        <TabsTrigger value="time" className="gap-1.5"><Clock className="size-3.5" /> Time</TabsTrigger>
        <TabsTrigger value="expenses" className="gap-1.5"><Receipt className="size-3.5" /> Expenses</TabsTrigger>
        <TabsTrigger value="meetings" className="gap-1.5"><FileText className="size-3.5" /> Meetings</TabsTrigger>
        <TabsTrigger value="chat" className="gap-1.5"><MessageSquare className="size-3.5" /> Chat</TabsTrigger>
        <TabsTrigger value="files" className="gap-1.5"><FolderOpen className="size-3.5" /> Files</TabsTrigger>
        <TabsTrigger value="tasks" className="gap-1.5"><KanbanSquare className="size-3.5" /> Tasks</TabsTrigger>
      </TabsList>
      <TabsContent value="reminders" className="mt-6"><RemindersTab /></TabsContent>
      <TabsContent value="time" className="mt-6"><TimeTrackerTab /></TabsContent>
      <TabsContent value="expenses" className="mt-6"><ExpensesTab /></TabsContent>
      <TabsContent value="meetings" className="mt-6"><MeetingsTab /></TabsContent>
      <TabsContent value="chat" className="mt-6"><TeamChatTab /></TabsContent>
      <TabsContent value="files" className="mt-6"><FileManagerTab /></TabsContent>
      <TabsContent value="tasks" className="mt-6"><ProjectTasksTab /></TabsContent>
    </Tabs></div>;
}

// Each tab is a simplified functional component using the API
function useApi() { const api = useApiUrl(); const tk = useTenantKey(); const qc = useQueryClient(); return { api, tk, qc }; }

function RemindersTab() {
  const { api, tk, qc } = useApi(); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", due_at: "", priority: "normal" });
  const { data, isLoading } = useQuery({ queryKey: ["reminders", tk], queryFn: async () => { const r = await fetch(api("/api/reminders")); if (!r.ok) throw new Error("Failed"); return r.json(); } });
  const saveMut = useMutation({ mutationFn: async (b: any) => { const r = await fetch(api("/api/reminders"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: () => { toast.success("Saved."); qc.invalidateQueries({ queryKey: ["reminders", tk] }); setShowForm(false); setForm({ title: "", description: "", due_at: "", priority: "normal" }); } });
  const delMut = useMutation({ mutationFn: async (id: string) => { await fetch(api(`/api/reminders/${id}`), { method: "DELETE" }); }, onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["reminders", tk] }); } });
  const toggleMut = useMutation({ mutationFn: async (r: any) => { await fetch(api("/api/reminders"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, completed: !r.completed, completed_at: !r.completed ? new Date().toISOString() : null }) }); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders", tk] }) });
  const items = data?.items || []; const active = items.filter((r: any) => !r.completed);
  return <div className="space-y-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Active" value={active.length} icon={Bell} sub="Pending" /><KpiCard label="Completed" value={items.length - active.length} icon={CheckCircle2} sub="Done" /></div>
    <div className="flex justify-end"><Button onClick={() => setShowForm(!showForm)}><Plus className="size-4 mr-1" /> New</Button></div>
    {showForm && <Card className="border-border/60"><CardContent className="p-4 space-y-3"><Input placeholder="Title…" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /><Textarea placeholder="Description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /><div className="grid grid-cols-2 gap-3"><Input type="datetime-local" value={form.due_at} onChange={e => setForm({ ...form, due_at: e.target.value })} /><select className="h-9 rounded-md border px-3 text-sm" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={() => saveMut.mutate(form)} disabled={!form.title}>Save</Button></div></CardContent></Card>}
    {isLoading ? <Skeleton className="h-40" /> : items.length === 0 ? <EmptyState icon={<Bell className="size-6" />} title="No reminders" description="Create your first reminder." /> : <div className="space-y-2">{items.map((r: any) => <Card key={r.id} className="border-border/60"><CardContent className="p-3 flex items-center gap-3"><button onClick={() => toggleMut.mutate(r)}>{r.completed ? <CheckCircle2 className="size-5 text-emerald-500" /> : <Circle className="size-5 text-muted-foreground" />}</button><div className="flex-1"><p className={`text-sm font-medium ${r.completed ? "line-through opacity-60" : ""}`}>{r.title}</p>{r.due_at && <p className="text-xs text-muted-foreground">{fmtDateTime(r.due_at)}</p>}</div><Badge variant="outline" className="text-[10px]">{r.priority}</Badge><Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => delMut.mutate(r.id)}><Trash2 className="size-3.5" /></Button></CardContent></Card>)}</div>}
  </div>;
}

function TimeTrackerTab() {
  const { api, tk, qc } = useApi(); const [activeEntry, setActiveEntry] = useState<any>(null); const [desc, setDesc] = useState("");
  const { data } = useQuery({ queryKey: ["time-entries", tk], queryFn: async () => { const r = await fetch(api("/api/time-entries")); if (!r.ok) throw new Error("Failed"); return r.json(); } });
  const startMut = useMutation({ mutationFn: async () => { const r = await fetch(api("/api/time-entries"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: desc || "Working", start_time: new Date().toISOString(), status: "running" }) }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: (d) => { setActiveEntry(d); toast.success("Timer started."); qc.invalidateQueries({ queryKey: ["time-entries", tk] }); } });
  const stopMut = useMutation({ mutationFn: async () => { const r = await fetch(api("/api/time-entries"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activeEntry.id, end_time: new Date().toISOString() }) }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: () => { setActiveEntry(null); setDesc(""); toast.success("Stopped."); qc.invalidateQueries({ queryKey: ["time-entries", tk] }); } });
  const delMut = useMutation({ mutationFn: async (id: string) => { await fetch(api(`/api/time-entries/${id}`), { method: "DELETE" }); }, onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["time-entries", tk] }); } });
  const entries = (data?.items || []).filter((e: any) => e.status === "completed"); const totalMin = entries.reduce((s: number, e: any) => s + (e.duration_minutes || 0), 0); const fmtDur = (m: number) => `${Math.floor(m/60)}h ${m%60}m`;
  return <div className="space-y-4">
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3"><KpiCard label="Total Time" value={fmtDur(totalMin)} icon={Clock} /><KpiCard label="Entries" value={entries.length} icon={FileText} /></div>
    <Card className="border-primary/30 bg-primary/5"><CardContent className="p-4 flex items-center gap-3">{activeEntry ? <><div className="flex-1"><p className="text-sm font-medium">{activeEntry.description}</p><p className="text-xs text-muted-foreground">Started {fmtRelative(activeEntry.start_time)}</p></div><Button variant="destructive" onClick={() => stopMut.mutate()}><Square className="size-4 mr-1" /> Stop</Button></> : <><Input placeholder="What are you working on?" value={desc} onChange={e => setDesc(e.target.value)} className="flex-1" /><Button onClick={() => startMut.mutate()}><Play className="size-4 mr-1" /> Start</Button></>}</CardContent></Card>
    {entries.length === 0 ? <EmptyState icon={<Clock className="size-6" />} title="No time entries" description="Start the timer." /> : <div className="space-y-2">{entries.map((e: any) => <Card key={e.id} className="border-border/60"><CardContent className="p-3 flex items-center gap-3"><div className="flex-1"><p className="text-sm font-medium truncate">{e.description}</p><p className="text-xs text-muted-foreground">{fmtDate(e.start_time)} · {fmtDur(e.duration_minutes || 0)}</p></div>{e.billable && <Badge variant="outline" className="text-[10px]">Billable</Badge>}<Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => delMut.mutate(e.id)}><Trash2 className="size-3.5" /></Button></CardContent></Card>)}</div>}
  </div>;
}

function ExpensesTab() {
  const { api, tk, qc } = useApi(); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Travel", description: "", amount: 0, currency: "EUR", expense_date: new Date().toISOString().split("T")[0] });
  const { data } = useQuery({ queryKey: ["expenses", tk], queryFn: async () => { const r = await fetch(api("/api/expenses")); if (!r.ok) throw new Error("Failed"); return r.json(); } });
  const saveMut = useMutation({ mutationFn: async (b: any) => { const r = await fetch(api("/api/expenses"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: () => { toast.success("Saved."); qc.invalidateQueries({ queryKey: ["expenses", tk] }); setShowForm(false); setForm({ category: "Travel", description: "", amount: 0, currency: "EUR", expense_date: new Date().toISOString().split("T")[0] }); } });
  const delMut = useMutation({ mutationFn: async (id: string) => { await fetch(api(`/api/expenses/${id}`), { method: "DELETE" }); }, onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["expenses", tk] }); } });
  const expenses = data?.items || []; const total = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  return <div className="space-y-4">
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3"><KpiCard label="Total" value={fmtMoney(total, "EUR")} icon={Receipt} /><KpiCard label="Entries" value={expenses.length} icon={FileText} /></div>
    <div className="flex justify-end"><Button onClick={() => setShowForm(!showForm)}><Plus className="size-4 mr-1" /> New</Button></div>
    {showForm && <Card className="border-border/60"><CardContent className="p-4 space-y-3"><div className="grid grid-cols-2 gap-3"><select className="h-9 rounded-md border px-3 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Travel</option><option>Meals</option><option>Office</option><option>Software</option><option>Other</option></select><Input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div><Input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} /><Textarea placeholder="Description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={() => saveMut.mutate(form)} disabled={!form.amount}>Save</Button></div></CardContent></Card>}
    {expenses.length === 0 ? <EmptyState icon={<Receipt className="size-6" />} title="No expenses" description="Track expenses here." /> : <div className="space-y-2">{expenses.map((e: any) => <Card key={e.id} className="border-border/60"><CardContent className="p-3 flex items-center gap-3"><div className="flex-1"><p className="text-sm font-medium">{e.category}</p><p className="text-xs text-muted-foreground">{e.description || ""} · {fmtDate(e.expense_date)}</p></div><span className="text-sm font-semibold tabular">{fmtMoney(e.amount, e.currency)}</span><Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => delMut.mutate(e.id)}><Trash2 className="size-3.5" /></Button></CardContent></Card>)}</div>}
  </div>;
}

function MeetingsTab() {
  const { api, tk, qc } = useApi(); const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ title: "", participants: "", notes: "", action_items: "" });
  const { data } = useQuery({ queryKey: ["meeting-notes", tk], queryFn: async () => { const r = await fetch(api("/api/meeting-notes")); if (!r.ok) throw new Error("Failed"); return r.json(); } });
  const saveMut = useMutation({ mutationFn: async (b: any) => { const r = await fetch(api("/api/meeting-notes"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: () => { toast.success("Saved."); qc.invalidateQueries({ queryKey: ["meeting-notes", tk] }); setShowForm(false); setForm({ title: "", participants: "", notes: "", action_items: "" }); } });
  const delMut = useMutation({ mutationFn: async (id: string) => { await fetch(api(`/api/meeting-notes/${id}`), { method: "DELETE" }); }, onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["meeting-notes", tk] }); } });
  const notes = data?.items || [];
  return <div className="space-y-4">
    <div className="flex justify-end"><Button onClick={() => setShowForm(!showForm)}><Plus className="size-4 mr-1" /> New</Button></div>
    {showForm && <Card className="border-border/60"><CardContent className="p-4 space-y-3"><Input placeholder="Title…" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /><Input placeholder="Participants…" value={form.participants} onChange={e => setForm({ ...form, participants: e.target.value })} /><Textarea placeholder="Notes…" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /><Textarea placeholder="Action items…" value={form.action_items} onChange={e => setForm({ ...form, action_items: e.target.value })} rows={2} /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={() => saveMut.mutate(form)} disabled={!form.title}>Save</Button></div></CardContent></Card>}
    {notes.length === 0 ? <EmptyState icon={<FileText className="size-6" />} title="No meeting notes" description="Create your first note." /> : <div className="space-y-3">{notes.map((n: any) => <Card key={n.id} className="border-border/60"><CardContent className="p-4"><div className="flex items-start justify-between"><div className="flex-1"><h4 className="font-semibold text-sm">{n.title}</h4>{n.participants && <p className="text-xs text-muted-foreground"><Users className="size-3 inline mr-1" />{n.participants}</p>}{n.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.notes}</p>}</div><Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => delMut.mutate(n.id)}><Trash2 className="size-3.5" /></Button></div></CardContent></Card>)}</div>}
  </div>;
}

function TeamChatTab() {
  const { api, tk } = useApi(); const [channel, setChannel] = useState("general"); const [msg, setMsg] = useState(""); const scrollRef = useRef<HTMLDivElement>(null);
  const { data } = useQuery({ queryKey: ["team-chat", tk, channel], queryFn: async () => { const r = await fetch(api(`/api/team-chat?channel=${channel}`)); if (!r.ok) throw new Error("Failed"); return r.json(); }, refetchInterval: 5000 });
  const sendMut = useMutation({ mutationFn: async () => { const r = await fetch(api("/api/team-chat"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel, message: msg }) }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: () => { setMsg(""); } });
  const messages = data?.items || [];
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);
  const channels = ["general", "deals", "support", "random"];
  return <div className="space-y-4"><div className="flex gap-2 flex-wrap">{channels.map(c => <Button key={c} size="sm" variant={c === channel ? "default" : "outline"} onClick={() => setChannel(c)}>#{c}</Button>)}</div>
    <Card className="border-border/60 flex flex-col" style={{ height: "calc(100vh - 320px)", minHeight: "400px" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">{messages.length === 0 ? <EmptyState icon={<MessageSquare className="size-6" />} title="No messages" description={`Start #${channel}`} /> : messages.map((m: any) => <div key={m.id} className="flex gap-2"><div className="size-8 rounded-full bg-gradient-emerald text-white text-xs flex items-center justify-center shrink-0">{m.sender_id?.slice(0, 2).toUpperCase()}</div><div><div className="flex items-center gap-2"><span className="text-xs font-semibold">{m.sender_id?.slice(0, 8)}</span><span className="text-[10px] text-muted-foreground">{fmtRelative(m.created_at)}</span></div><p className="text-sm break-words">{m.message}</p></div></div>)}</div>
      <div className="border-t p-3 flex gap-2"><Input placeholder={`Message #${channel}…`} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && msg.trim()) sendMut.mutate(); }} className="flex-1" /><Button onClick={() => sendMut.mutate()} disabled={!msg.trim()}><Send className="size-4" /></Button></div>
    </Card></div>;
}

function FileManagerTab() {
  const { api, tk, qc } = useApi(); const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ filename: "", file_type: "", file_size: 0, description: "" });
  const { data } = useQuery({ queryKey: ["file-manager", tk], queryFn: async () => { const r = await fetch(api("/api/file-manager")); if (!r.ok) throw new Error("Failed"); return r.json(); } });
  const saveMut = useMutation({ mutationFn: async (b: any) => { const r = await fetch(api("/api/file-manager"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: () => { toast.success("Saved."); qc.invalidateQueries({ queryKey: ["file-manager", tk] }); setShowForm(false); setForm({ filename: "", file_type: "", file_size: 0, description: "" }); } });
  const delMut = useMutation({ mutationFn: async (id: string) => { await fetch(api(`/api/file-manager/${id}`), { method: "DELETE" }); }, onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["file-manager", tk] }); } });
  const files = data?.items || []; const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;
  return <div className="space-y-4"><div className="flex justify-end"><Button onClick={() => setShowForm(!showForm)}><Plus className="size-4 mr-1" /> Add File</Button></div>
    {showForm && <Card className="border-border/60"><CardContent className="p-4 space-y-3"><Input placeholder="Filename…" value={form.filename} onChange={e => setForm({ ...form, filename: e.target.value })} /><div className="grid grid-cols-2 gap-3"><Input placeholder="Type (pdf, doc)" value={form.file_type} onChange={e => setForm({ ...form, file_type: e.target.value })} /><Input type="number" placeholder="Size (bytes)" value={form.file_size} onChange={e => setForm({ ...form, file_size: Number(e.target.value) })} /></div><Textarea placeholder="Description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={() => saveMut.mutate(form)} disabled={!form.filename}>Save</Button></div></CardContent></Card>}
    {files.length === 0 ? <EmptyState icon={<FolderOpen className="size-6" />} title="No files" description="Add files here." /> : <div className="space-y-2">{files.map((f: any) => <Card key={f.id} className="border-border/60"><CardContent className="p-3 flex items-center gap-3"><File className="size-5 text-muted-foreground" /><div className="flex-1"><p className="text-sm font-medium truncate">{f.filename}</p><p className="text-xs text-muted-foreground">{f.file_type || "file"} · {fmtSize(f.file_size)}</p></div><Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => delMut.mutate(f.id)}><Trash2 className="size-3.5" /></Button></CardContent></Card>)}</div>}</div>;
}

function ProjectTasksTab() {
  const { api, tk, qc } = useApi(); const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ title: "", priority: "normal" });
  const { data } = useQuery({ queryKey: ["project-tasks", tk], queryFn: async () => { const r = await fetch(api("/api/project-tasks")); if (!r.ok) throw new Error("Failed"); return r.json(); } });
  const saveMut = useMutation({ mutationFn: async (b: any) => { const r = await fetch(api("/api/project-tasks"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: () => { toast.success("Saved."); qc.invalidateQueries({ queryKey: ["project-tasks", tk] }); setShowForm(false); setForm({ title: "", priority: "normal" }); } });
  const statusMut = useMutation({ mutationFn: async ({ id, status }: { id: string; status: string }) => { const r = await fetch(api("/api/project-tasks"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); if (!r.ok) throw new Error("Failed"); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["project-tasks", tk] }) });
  const delMut = useMutation({ mutationFn: async (id: string) => { await fetch(api(`/api/project-tasks/${id}`), { method: "DELETE" }); }, onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["project-tasks", tk] }); } });
  const allTasks = data?.items || []; const STATUSES = ["todo", "in_progress", "review", "done"]; const LABELS: Record<string, string> = { todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" };
  return <div className="space-y-4"><div className="flex justify-end"><Button onClick={() => setShowForm(!showForm)}><Plus className="size-4 mr-1" /> New Task</Button></div>
    {showForm && <Card className="border-border/60"><CardContent className="p-4 space-y-3"><Input placeholder="Task title…" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /><select className="h-9 rounded-md border px-3 text-sm w-full" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select><Button onClick={() => saveMut.mutate({ ...form, status: "todo" })} disabled={!form.title}>Save</Button></CardContent></Card>}
    {allTasks.length === 0 ? <EmptyState icon={<KanbanSquare className="size-6" />} title="No tasks" description="Create your first task." /> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{STATUSES.map(st => <div key={st} className="rounded-xl border border-border/60 p-3"><h3 className="text-sm font-semibold mb-2">{LABELS[st]} ({allTasks.filter((t: any) => t.status === st).length})</h3><div className="space-y-2">{allTasks.filter((t: any) => t.status === st).map((t: any) => <Card key={t.id} className="border-border/60 bg-card"><CardContent className="p-3"><div className="flex justify-between"><p className="text-sm font-medium flex-1">{t.title}</p><Button size="icon" variant="ghost" className="size-6 text-destructive" onClick={() => delMut.mutate(t.id)}><Trash2 className="size-3" /></Button></div><Badge variant="outline" className="text-[10px] mt-1">{t.priority}</Badge><div className="flex gap-1 mt-2">{STATUSES.filter(s => s !== t.status).map(s => <Button key={s} size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => statusMut.mutate({ id: t.id, status: s })}>→ {LABELS[s]}</Button>)}</div></CardContent></Card>)}</div></div>)}</div>}</div>;
}

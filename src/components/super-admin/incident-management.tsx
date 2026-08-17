"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, ShieldAlert, Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { useApiUrl } from "@/lib/hooks/use-api-url";
import { useQueryClient } from "@tanstack/react-query";
import { useT } from "@/lib/i18n/store";
import {
  SettingsCardHeader, SectionLabel, LoadingCard, ErrorCard,
} from "./_shared";
import { fmtDateTime, fmtRelative } from "@/lib/utils/format";

type IncidentStatus = "open" | "investigating" | "contained" | "resolved" | "closed";
type IncidentSeverity = "low" | "medium" | "high" | "critical";
type IncidentType =
  | "breach"
  | "sod_violation"
  | "unauthorized_access"
  | "data_loss"
  | "audit_finding"
  | "other";

interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  owner: string | null;
  detected_at: string;
  resolved_at: string | null;
  breach_notification_deadline: string | null;
  breach_notification_sent_at: string | null;
  timeline: Array<{
    id: string;
    at: string;
    by: string;
    kind: string;
    note: string;
  }>;
  created_at: string;
  updated_at: string;
}

const STATUS_BADGE: Record<IncidentStatus, string> = {
  open: "bg-destructive/10 text-destructive border-destructive/30",
  investigating: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  contained: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const SEVERITY_BADGE: Record<IncidentSeverity, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

const TYPE_LABEL: Record<IncidentType, string> = {
  breach: "Breach",
  sod_violation: "SoD Violation",
  unauthorized_access: "Unauthorized Access",
  data_loss: "Data Loss",
  audit_finding: "Audit Finding",
  other: "Other",
};

// Static runbook steps per incident type — surfaced read-only in the
// incident-detail dialog. Sourced from the SOC2 / GDPR playbook.
const RUNBOOKS: Record<IncidentType, Array<{ step: string; description: string }>> = {
  breach: [
    { step: "1. Detect & confirm", description: "Verify the breach is real (not a false positive from anomaly detection / monitoring)." },
    { step: "2. Contain", description: "Revoke sessions, rotate affected credentials (vault-management → rotate keys), block offending IPs." },
    { step: "3. Assess scope", description: "Identify affected tenants, users, PII fields. Document in this incident's description." },
    { step: "4. Notify DPO", description: "Alert the DPO (gdpr_config.dpoEmail) within 24h of detection." },
    { step: "5. Notify authority (72h)", description: "GDPR Art. 33: notify the supervisory authority within 72h. Mark breach_notification_sent_at." },
    { step: "6. Notify data subjects", description: "GDPR Art. 34: notify affected data subjects without undue delay if high risk." },
    { step: "7. Post-incident review", description: "Root-cause analysis; update SoD matrix / anomaly thresholds / access controls." },
  ],
  sod_violation: [
    { step: "1. Review the grant", description: "Identify the user + the two permissions that triggered the SoD rule." },
    { step: "2. Remediate", description: "Revoke one of the two permissions, or move the user to a different role." },
    { step: "3. Audit", description: "Pull audit_logs for the user over the last 30 days — look for actual misuse." },
    { step: "4. Update matrix", description: "If the rule was a 'warn', consider upgrading to 'block' if misuse is confirmed." },
  ],
  unauthorized_access: [
    { step: "1. Kill session", description: "Revoke all sessions for the user; rotate their password reset token." },
    { step: "2. Trace", description: "Audit login_history + audit_logs for the IP / device / time window." },
    { step: "3. Rotate secrets", description: "If vault or API keys were accessed, rotate them via vault-management." },
    { step: "4. Notify", description: "If PII was exposed, treat as a breach and follow the breach runbook." },
  ],
  data_loss: [
    { step: "1. Identify what was lost", description: "Pull audit_logs / backup diff to identify the rows / tables affected." },
    { step: "2. Restore", description: "Restore from the most recent backup. Document any unrecoverable data." },
    { step: "3. Notify affected users", description: "If user PII is permanently lost, notify them (GDPR Art. 34)." },
    { step: "4. Hardening", description: "Add a guard / backup cadence / cron to prevent recurrence." },
  ],
  audit_finding: [
    { step: "1. Acknowledge", description: "Add the finding as an incident so it's tracked to closure." },
    { step: "2. Plan remediation", description: "Assign an owner + a deadline. Document the plan in a timeline note." },
    { step: "3. Implement", description: "Ship the fix; mark status = contained → resolved." },
    { step: "4. Close", description: "Update the audit register; mark the finding as closed." },
  ],
  other: [
    { step: "1. Triage", description: "Assess severity and impact." },
    { step: "2. Contain", description: "Take immediate action to limit impact." },
    { step: "3. Document", description: "Keep timeline updated with every action." },
    { step: "4. Close", description: "Resolve once the impact is fully mitigated." },
  ],
};

export function IncidentManagement() {
  const api = useApiUrl();
  const qc = useQueryClient();
  const t = useT();

  const [incidents, setIncidents] = React.useState<Incident[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter
        ? api(`/api/admin/incidents?status=${encodeURIComponent(statusFilter)}`)
        : api("/api/admin/incidents");
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setIncidents(d.incidents);
    } catch (e: any) {
      setError(e?.message || "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter]);

  React.useEffect(() => { void load(); }, [load]);

  const selected = incidents?.find((i) => i.id === selectedId) || null;

  async function updateIncident(id: string, patch: any, note?: string) {
    try {
      const r = await fetch(api(`/api/admin/incidents?id=${encodeURIComponent(id)}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, note }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
      toast.success("Incident updated");
      qc.invalidateQueries({ queryKey: ["incidents"] });
      void load();
    } catch (e: any) {
      toast.error("Failed to update incident", { description: e?.message });
    }
  }

  if (loading) return <LoadingCard title={t("pf-sa-inc-title")} />;
  if (error || !incidents) return <ErrorCard title={t("pf-sa-inc-title")} message={error || "No data"} />;

  const openCount = incidents.filter((i) => i.status === "open" || i.status === "investigating").length;
  const breachCount = incidents.filter((i) => i.type === "breach").length;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label={t("pf-sa-inc-kpi-total")} value={String(incidents.length)} tone="info" />
        <Tile label={t("pf-sa-inc-kpi-open")} value={String(openCount)} tone={openCount > 0 ? "warn" : "ok"} />
        <Tile label={t("pf-sa-inc-kpi-breach")} value={String(breachCount)} tone={breachCount > 0 ? "critical" : "ok"} />
        <Tile label={t("pf-sa-inc-kpi-resolved")} value={String(incidents.filter((i) => i.status === "resolved" || i.status === "closed").length)} tone="ok" />
      </div>

      <Card className="border-border/60 shadow-soft rounded-xl">
        <SettingsCardHeader
          title={t("pf-sa-inc-list-title")}
          description={t("pf-sa-inc-list-desc")}
          dirty={false}
          saving={false}
        />
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="open">open</SelectItem>
                <SelectItem value="investigating">investigating</SelectItem>
                <SelectItem value="contained">contained</SelectItem>
                <SelectItem value="resolved">resolved</SelectItem>
                <SelectItem value="closed">closed</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="ml-auto bg-gradient-emerald text-white">
              <Plus className="size-3.5 mr-1" /> {t("pf-sa-inc-new")}
            </Button>
          </div>

          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No incidents recorded. Create one to start tracking.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Breach Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((i) => {
                  const deadlinePassed = i.breach_notification_deadline
                    && !i.breach_notification_sent_at
                    && new Date(i.breach_notification_deadline) < new Date();
                  return (
                    <TableRow key={i.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setSelectedId(i.id)}>
                      <TableCell className="font-medium">{i.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{TYPE_LABEL[i.type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${SEVERITY_BADGE[i.severity]}`}>
                          {i.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${STATUS_BADGE[i.status]}`}>{i.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground tabular">{fmtRelative(i.detected_at)}</TableCell>
                      <TableCell>
                        {i.breach_notification_deadline ? (
                          <span className={`text-xs tabular ${deadlinePassed ? "text-destructive font-semibold" : "text-amber-600"}`}>
                            {fmtDateTime(i.breach_notification_deadline)}
                            {i.breach_notification_sent_at && <Badge variant="outline" className="ml-2 text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">sent</Badge>}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedId(i.id); }}>
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateIncidentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => { void load(); qc.invalidateQueries({ queryKey: ["incidents"] }); }}
      />

      {selected && (
        <IncidentDetailDialog
          incident={selected}
          onOpenChange={(v) => { if (!v) setSelectedId(null); }}
          onUpdate={(patch, note) => updateIncident(selected.id, patch, note)}
        />
      )}
    </div>
  );
}

function CreateIncidentDialog({
  open, onOpenChange, onCreated,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const api = useApiUrl();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState<IncidentType>("other");
  const [severity, setSeverity] = React.useState<IncidentSeverity>("medium");
  const [detectedAt, setDetectedAt] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const r = await fetch(api("/api/admin/incidents"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, type, severity,
          detected_at: detectedAt || undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
      toast.success("Incident created", {
        description: type === "breach"
          ? "72-hour breach-notification deadline auto-computed."
          : "Incident is now tracked in the register.",
      });
      setTitle(""); setDescription(""); setType("other"); setSeverity("medium"); setDetectedAt("");
      onCreated();
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Failed to create incident", { description: e?.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Security Incident</DialogTitle>
          <DialogDescription>
            Document a security event for tracking. If type is "breach", the GDPR Art. 33 72-hour notification deadline is auto-computed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Suspected unauthorized access to vault" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What happened, what was affected, what's the initial assessment." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as IncidentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABEL) as IncidentType[]).map((t) => (
                    <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as IncidentSeverity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">low</SelectItem>
                  <SelectItem value="medium">medium</SelectItem>
                  <SelectItem value="high">high</SelectItem>
                  <SelectItem value="critical">critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Detected At</Label>
              <Input type="datetime-local" value={detectedAt} onChange={(e) => setDetectedAt(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()} className="bg-gradient-emerald text-white">
            {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
            Create Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IncidentDetailDialog({
  incident, onOpenChange, onUpdate,
}: {
  incident: Incident;
  onOpenChange: (v: boolean) => void;
  onUpdate: (patch: any, note?: string) => Promise<void>;
}) {
  const t = useT();
  const [note, setNote] = React.useState("");
  const [status, setStatus] = React.useState<IncidentStatus>(incident.status);
  const [savingNote, setSavingNote] = React.useState(false);
  const [savingStatus, setSavingStatus] = React.useState(false);

  React.useEffect(() => {
    setStatus(incident.status);
  }, [incident.id, incident.status]);

  const deadlinePassed = incident.breach_notification_deadline
    && !incident.breach_notification_sent_at
    && new Date(incident.breach_notification_deadline) < new Date();

  async function addNote() {
    if (!note.trim()) return;
    setSavingNote(true);
    await onUpdate({}, note);
    setNote("");
    setSavingNote(false);
  }
  async function saveStatus() {
    setSavingStatus(true);
    await onUpdate({ status });
    setSavingStatus(false);
  }
  async function markBreachSent() {
    setSavingStatus(true);
    await onUpdate({ breach_notification_sent_at: true });
    setSavingStatus(false);
  }

  return (
    <Dialog open={!!incident} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <ShieldAlert className="size-4 text-destructive" />
            {incident.title}
            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${SEVERITY_BADGE[incident.severity]}`}>
              {incident.severity}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            <Badge variant="outline" className="text-xs mr-2">{TYPE_LABEL[incident.type]}</Badge>
            Detected {fmtDateTime(incident.detected_at)} by <strong>{incident.owner || "—"}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {incident.description && (
            <div className="bg-muted/40 rounded-md p-3 text-sm">{incident.description}</div>
          )}

          {incident.type === "breach" && (
            <div className={`rounded-md border p-3 text-sm ${deadlinePassed ? "border-destructive/40 bg-destructive/5" : "border-amber-500/30 bg-amber-500/5"}`}>
              <div className="flex items-center gap-2 font-medium mb-1">
                <Clock className="size-4" />
                GDPR Art. 33 Breach Notification
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Deadline: <span className={`tabular font-mono ${deadlinePassed ? "text-destructive" : ""}`}>{fmtDateTime(incident.breach_notification_deadline!)}</span></p>
                {incident.breach_notification_sent_at ? (
                  <p className="text-emerald-600 font-medium">✓ Notification marked sent at {fmtDateTime(incident.breach_notification_sent_at)}</p>
                ) : deadlinePassed ? (
                  <p className="text-destructive font-semibold">⚠ Deadline passed — notify the supervisory authority immediately.</p>
                ) : (
                  <Button size="sm" variant="outline" className="mt-2" onClick={markBreachSent} disabled={savingStatus}>
                    Mark Breach Notification Sent
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Status editor */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">Status:</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as IncidentStatus)}>
              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">open</SelectItem>
                <SelectItem value="investigating">investigating</SelectItem>
                <SelectItem value="contained">contained</SelectItem>
                <SelectItem value="resolved">resolved</SelectItem>
                <SelectItem value="closed">closed</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={saveStatus} disabled={savingStatus || status === incident.status}>
              Update Status
            </Button>
          </div>

          {/* Runbook */}
          <div>
          <SectionLabel hint={`runbook · ${TYPE_LABEL[incident.type]}`}>{t("pf-sa-inc-runbook-title")}</SectionLabel>
            <ol className="space-y-2 text-sm">
              {RUNBOOKS[incident.type].map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-mono text-xs bg-muted/60 rounded px-1.5 py-0.5 h-fit">{i + 1}</span>
                  <div>
                    <p className="font-medium text-xs">{s.step}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Timeline */}
          <div>
            <SectionLabel hint={`${incident.timeline.length} events`}>{t("pf-sa-inc-timeline-title")}</SectionLabel>
            <div className="space-y-2 text-xs">
              {incident.timeline.slice().reverse().map((ev) => (
                <div key={ev.id} className="flex gap-2">
                  <div className="text-muted-foreground tabular w-32 shrink-0">{fmtDateTime(ev.at)}</div>
                  <div>
                    <span className="font-medium">{ev.by}</span>
                    <span className="text-muted-foreground mx-1">·</span>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider">{ev.kind}</Badge>
                    <p className="mt-0.5">{ev.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add note */}
          <div className="space-y-2">
            <Label>Add Timeline Note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Action taken, finding, next step…" />
            <Button size="sm" onClick={addNote} disabled={savingNote || !note.trim()}>
              {savingNote && <Loader2 className="size-3.5 mr-1 animate-spin" />}
              Add Note
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "info" | "critical" }) {
  const cls = {
    ok: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    warn: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    info: "border-primary/30 bg-primary/5",
    critical: "border-destructive/30 bg-destructive/5 text-destructive",
  }[tone];
  return (
    <div className={`rounded-xl border ${cls} p-3`}>
      <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-xl font-bold tabular mt-1">{value}</p>
    </div>
  );
}

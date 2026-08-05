"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Zap, Crown, Star, Check, X, TrendingUp, AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import { fmtMoney } from "@/lib/utils/format";
import { useAppStore, isSuperAdmin } from "@/lib/store/app-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface Plan {
  id: string; name: string; description: string;
  price_monthly: number; price_yearly: number; currency: string;
  max_users: number; max_partners: number; max_monthly_documents: number;
  storage_mb: number; trial_days: number; included_modules: string;
  custom_branding: boolean; api_access: boolean; priority_support: boolean; white_label: boolean;
}

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { trial: Sparkles, starter: Zap, business: Crown, enterprise: Star };

interface TenantSubscription {
  id: string; name: string; plan: string; status: string;
  is_trial: boolean; is_expired: boolean;
  subscription_start: string | null; subscription_end: string | null; trial_ends_at: string | null;
  days_remaining: number | null; billing_cycle: string | null;
  amount_paid: number; currency_paid: string; max_users: number;
  warning_level: "none" | "warning" | "critical" | "expired";
}

function StatusBadge({ level, isExpired, isTrial }: { level: string; isExpired: boolean; isTrial: boolean }) {
  if (isExpired) return <Badge className="bg-destructive/15 text-destructive border-destructive/30"><XCircle className="size-3 mr-1" />Expired</Badge>;
  if (level === "critical") return <Badge className="bg-red-500/15 text-red-600 border-red-500/30"><AlertTriangle className="size-3 mr-1" />Critical</Badge>;
  if (level === "warning") return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30"><Clock className="size-3 mr-1" />Warning</Badge>;
  if (isTrial) return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30"><Sparkles className="size-3 mr-1" />Trial</Badge>;
  return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30"><CheckCircle2 className="size-3 mr-1" />Active</Badge>;
}

function SuperAdminSubscriptionsPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-subscriptions"],
    queryFn: async () => {
      const r = await fetch("/api/super-admin/subscriptions");
      if (!r.ok) throw new Error("Failed to load subscriptions");
      return r.json() as Promise<{ items: TenantSubscription[]; totals: any }>;
    },
    refetchInterval: 60_000,
  });

  if (isLoading) return <Card className="mb-6"><CardContent className="p-6 text-sm text-muted-foreground">Loading subscriptions…</CardContent></Card>;
  if (error || !data) return <Card className="mb-6"><CardContent className="p-6 text-sm text-destructive">Failed to load subscription data.</CardContent></Card>;

  const { items, totals } = data;
  return (
    <div className="mb-6 space-y-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border/60 p-3 bg-card"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tenants</p><p className="text-xl font-bold tabular mt-0.5">{totals.total_tenants}</p></div>
        <div className="rounded-xl border border-emerald-500/30 p-3 bg-emerald-500/5"><p className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Active</p><p className="text-xl font-bold tabular mt-0.5 text-emerald-700 dark:text-emerald-400">{totals.active}</p></div>
        <div className="rounded-xl border border-blue-500/30 p-3 bg-blue-500/5"><p className="text-[10px] uppercase tracking-wider text-blue-700 dark:text-blue-400">Trial</p><p className="text-xl font-bold tabular mt-0.5 text-blue-700 dark:text-blue-400">{totals.trial}</p></div>
        <div className="rounded-xl border border-amber-500/30 p-3 bg-amber-500/5"><p className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">Exp. ≤7d</p><p className="text-xl font-bold tabular mt-0.5 text-amber-700 dark:text-amber-400">{totals.expiring_within_7d}</p></div>
        <div className="rounded-xl border border-destructive/30 p-3 bg-destructive/5"><p className="text-[10px] uppercase tracking-wider text-destructive">Expired</p><p className="text-xl font-bold tabular mt-0.5 text-destructive">{totals.expired}</p></div>
        <div className="rounded-xl border border-border/60 p-3 bg-card"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">MRR</p><p className="text-xl font-bold tabular mt-0.5">{fmtMoney(totals.monthly_recurring_revenue, "EUR")}</p></div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">All tenants — subscription state</CardTitle><CardDescription className="text-xs">Live per-tenant plan, expiry, and payment status.</CardDescription></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Starts</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead className="text-right">Days left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => {
                  const endDate = t.is_trial ? t.trial_ends_at : t.subscription_end;
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{t.plan}</Badge></TableCell>
                      <TableCell><StatusBadge level={t.warning_level} isExpired={t.is_expired} isTrial={t.is_trial} /></TableCell>
                      <TableCell className="text-right tabular">{fmtMoney(t.amount_paid, t.currency_paid)}</TableCell>
                      <TableCell className="capitalize text-sm text-muted-foreground">{t.billing_cycle || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.subscription_start ? format(new Date(t.subscription_start), "yyyy-MM-dd") : "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{endDate ? format(new Date(endDate), "yyyy-MM-dd") : "—"}</TableCell>
                      <TableCell className={`text-right tabular font-semibold ${t.warning_level === "expired" ? "text-destructive" : t.warning_level === "critical" ? "text-red-600" : t.warning_level === "warning" ? "text-amber-600" : ""}`}>
                        {t.days_remaining !== null ? (t.days_remaining < 0 ? `${t.days_remaining}` : t.days_remaining) : "∞"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PlansView() {
  const api = useApiUrl(); const tenantKey = useTenantKey();
  const [upgradeDialog, setUpgradeDialog] = useState<Plan | null>(null);
  const [message, setMessage] = useState("");
  const currentUser = useAppStore((s) => s.user);
  const isSA = isSuperAdmin(currentUser);

  const { data: plansData } = useQuery({
    queryKey: ["plans", tenantKey],
    queryFn: async () => { const r = await fetch(api("/api/plans")); if (!r.ok) throw new Error("Failed"); return r.json() as Promise<{ items: Plan[] }>; },
  });
  const { data: subData } = useQuery({
    queryKey: ["subscription-status", tenantKey],
    queryFn: async () => { const r = await fetch("/api/subscription/status"); if (!r.ok) return null; return r.json(); },
  });
  const upgradeMut = useMutation({
    mutationFn: async (plan: Plan) => {
      const r = await fetch("/api/plan-upgrade-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requested_plan: plan.name, message: message || undefined }) });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => { toast.success("Upgrade request sent!"); setUpgradeDialog(null); setMessage(""); },
    onError: () => toast.error("Failed to send request."),
  });

  const plans = plansData?.items || [];
  const currentPlan = (subData?.subscription?.plan || "").toLowerCase();
  const isTrial = subData?.subscription?.is_trial;

  return (
    <div>
      <PageHeader title="Plans & Subscriptions" description={isSA ? "Cross-tenant subscription overview and platform plan catalog." : "Your current plan and upgrade options."} />
      {isSA && <SuperAdminSubscriptionsPanel />}
      {subData?.subscription && !isSA && (
        <Card className={`mb-6 border-2 ${isTrial ? "border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/10" : "border-primary/30 bg-primary/5"}`}>
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Plan</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl font-bold capitalize">{currentPlan || "—"}</p>
                {isTrial && <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Trial</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{subData.subscription.days_remaining != null ? `${subData.subscription.days_remaining} days remaining` : "No expiry"}</p>
            </div>
            {isTrial && <div className="text-right"><p className="text-sm font-medium text-amber-600">Upgrade to unlock all features</p></div>}
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.name.toLowerCase()] || Star;
          const isCurrent = plan.name.toLowerCase() === currentPlan;
          const isFeatured = plan.name.toLowerCase() === "business";
          const included = (() => { try { return JSON.parse(plan.included_modules || "[]"); } catch { return []; } })();
          return (
            <Card key={plan.id} className={`relative rounded-xl overflow-hidden flex flex-col ${isFeatured ? "border-primary/50 shadow-soft-md ring-1 ring-primary/30" : "border-border/60"} ${isCurrent ? "ring-2 ring-emerald-500/40" : ""}`}>
              {(isFeatured || isCurrent) && <div className={`absolute top-0 inset-x-0 text-center py-1 text-[10px] font-semibold uppercase tracking-wider ${isCurrent ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"}`}>{isCurrent ? "Current Plan" : "Most Popular"}</div>}
              <CardHeader className={isFeatured || isCurrent ? "pt-8 pb-3" : "pb-3"}>
                <div className="flex items-center justify-between"><CardTitle className="text-lg flex items-center gap-2"><Icon className="size-4" />{plan.name}</CardTitle><Badge variant="outline" className="text-[10px]">{plan.currency}</Badge></div>
                {plan.description && <CardDescription className="text-xs">{plan.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div><div className="flex items-baseline gap-1"><span className="text-2xl font-bold">{fmtMoney(plan.price_monthly, plan.currency)}</span><span className="text-xs text-muted-foreground">/month</span></div><p className="text-xs text-muted-foreground mt-0.5">or {fmtMoney(plan.price_yearly, plan.currency)}/year</p></div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2"><Check className="size-3 text-emerald-500 shrink-0" /><span>{plan.max_users} users</span></div>
                  <div className="flex items-center gap-2"><Check className="size-3 text-emerald-500 shrink-0" /><span>{plan.max_partners === 0 ? "Unlimited" : plan.max_partners} partners</span></div>
                  <div className="flex items-center gap-2"><Check className="size-3 text-emerald-500 shrink-0" /><span>{plan.max_monthly_documents === 0 ? "Unlimited" : plan.max_monthly_documents} docs/mo</span></div>
                  <div className="flex items-center gap-2"><Check className="size-3 text-emerald-500 shrink-0" /><span>{plan.storage_mb >= 1000 ? `${plan.storage_mb / 1000}GB` : `${plan.storage_mb}MB`} storage</span></div>
                  <div className="flex items-center gap-2"><Check className="size-3 text-emerald-500 shrink-0" /><span>{plan.trial_days}-day trial</span></div>
                  {plan.custom_branding && <div className="flex items-center gap-2"><Check className="size-3 text-emerald-500 shrink-0" /><span>Custom branding</span></div>}
                  {plan.api_access && <div className="flex items-center gap-2"><Check className="size-3 text-emerald-500 shrink-0" /><span>API access</span></div>}
                  {plan.priority_support && <div className="flex items-center gap-2"><Check className="size-3 text-emerald-500 shrink-0" /><span>Priority support</span></div>}
                  {plan.white_label && <div className="flex items-center gap-2"><Check className="size-3 text-emerald-500 shrink-0" /><span>White-label</span></div>}
                  {!plan.custom_branding && <div className="flex items-center gap-2"><X className="size-3 text-muted-foreground shrink-0" /><span className="text-muted-foreground">No custom branding</span></div>}
                  {!plan.api_access && <div className="flex items-center gap-2"><X className="size-3 text-muted-foreground shrink-0" /><span className="text-muted-foreground">No API access</span></div>}
                </div>
                <div className="border-t border-border/40 pt-2"><p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Modules</p><div className="flex flex-wrap gap-1">{included.map((code: string, i: number) => <Badge key={i} variant="outline" className="text-[10px] py-0">{code}</Badge>)}</div></div>
              </CardContent>
              <CardFooter className="pt-0">
                {isCurrent ? <Button className="w-full" variant="outline" disabled>Current Plan</Button> : <Button className="w-full" variant={isFeatured ? "default" : "outline"} onClick={() => setUpgradeDialog(plan)}><TrendingUp className="size-4 mr-1.5" />{plan.price_monthly === 0 ? "Start Free Trial" : "Request Upgrade"}</Button>}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {upgradeDialog && (
        <Dialog open={!!upgradeDialog} onOpenChange={(o) => !o && setUpgradeDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><TrendingUp className="size-5 text-primary" />Request Upgrade to {upgradeDialog.name}</DialogTitle><DialogDescription>Send a request to the platform administrator.</DialogDescription></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="rounded-lg bg-muted/40 border border-border/60 p-3"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">{upgradeDialog.name}</span><span className="text-sm font-bold">{fmtMoney(upgradeDialog.price_monthly, upgradeDialog.currency)}/mo</span></div><div className="text-xs text-muted-foreground">{upgradeDialog.max_users} users · {upgradeDialog.max_partners === 0 ? "Unlimited" : upgradeDialog.max_partners} partners · {upgradeDialog.storage_mb >= 1000 ? `${upgradeDialog.storage_mb / 1000}GB` : `${upgradeDialog.storage_mb}MB`} storage</div></div>
              <div><label className="text-sm font-medium">Message (optional)</label><Textarea placeholder="Add any questions or special requests…" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="mt-1" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setUpgradeDialog(null)}>Cancel</Button><Button onClick={() => upgradeMut.mutate(upgradeDialog)} disabled={upgradeMut.isPending}>{upgradeMut.isPending ? "Sending…" : "Send Request"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

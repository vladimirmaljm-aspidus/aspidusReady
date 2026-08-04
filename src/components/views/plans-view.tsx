"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Zap, Crown, Star, Check, X, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import { fmtMoney } from "@/lib/utils/format";

interface Plan {
  id: string; name: string; description: string;
  price_monthly: number; price_yearly: number; currency: string;
  max_users: number; max_partners: number; max_monthly_documents: number;
  storage_mb: number; trial_days: number; included_modules: string;
  custom_branding: boolean; api_access: boolean; priority_support: boolean; white_label: boolean;
}

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { trial: Sparkles, starter: Zap, business: Crown, enterprise: Star };

export function PlansView() {
  const api = useApiUrl(); const tenantKey = useTenantKey();
  const [upgradeDialog, setUpgradeDialog] = useState<Plan | null>(null);
  const [message, setMessage] = useState("");

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
      const r = await fetch("/api/upgrade-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requested_plan: plan.name, message: message || undefined }) });
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
      {subData?.subscription && (
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

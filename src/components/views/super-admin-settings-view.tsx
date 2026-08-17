"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldCheck, Users, Lock, Activity, ShieldAlert, Settings2, Gauge } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { useAppStore, isSuperAdmin } from "@/lib/store/app-store";
import { useT } from "@/lib/i18n/store";
import { SecuritySettings } from "@/components/super-admin/security-settings";
import { RoleManagement } from "@/components/super-admin/role-management";
import { DataProtection } from "@/components/super-admin/data-protection";
import { MonitoringSettings } from "@/components/super-admin/monitoring-settings";
import { IncidentManagement } from "@/components/super-admin/incident-management";
import { PlatformConfig } from "@/components/super-admin/platform-config";
import { SystemHealth } from "@/components/super-admin/system-health";

/**
 * SuperAdminSettingsView — the unified settings interface for the
 * platform super-admin.
 *
 * Seven tabs, each owning its own data fetching + saving:
 *   1. Security        — 2FA, session TTL, CSRF, password policy, rate limits
 *   2. Roles & SoD      — per-tenant role overrides, SoD matrix, permission catalog
 *   3. Data Protection  — vault key mgmt, encrypted fields, retention, GDPR
 *   4. Monitoring       — Sentry status, security webhook, anomaly thresholds, alert routing
 *   5. Incidents        — security incident register + breach workflow + runbooks
 *   6. Platform Config  — feature flags per tenant, tenant mgmt, plan mgmt
 *   7. System Health    — APM, memory, DB metrics, Sentry/Render status, cron status
 *
 * The super-admin has NO limitations — every setting that exists on
 * the platform is visible and editable here (modulo the few that
 * require an env-var change — those are surfaced as read-only with
 * a hint about which env var to set).
 */
export function SuperAdminSettingsView() {
  const t = useT();
  const user = useAppStore((s) => s.user);
  const isSuper = isSuperAdmin(user);

  if (!isSuper) {
    return (
      <div>
        <PageHeader
          title="Platform Settings"
          description="Unified super-admin settings interface"
        />
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 shrink-0" />
            <div>
              <p className="font-medium">Super-admin access required</p>
              <p className="text-sm mt-1 opacity-80">
                This view is restricted to super_admin users. If you believe you should
                have access, contact your platform owner.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Platform Settings"
        description="Unified super-admin settings — every platform setting is visible and editable here."
      />

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="flex flex-wrap h-auto bg-muted/40 p-1 rounded-xl gap-1 mb-6">
          <TabTrigger value="security" icon={ShieldCheck} label="Security" />
          <TabTrigger value="roles" icon={Users} label="Roles & SoD" />
          <TabTrigger value="data" icon={Lock} label="Data Protection" />
          <TabTrigger value="monitoring" icon={Activity} label="Monitoring" />
          <TabTrigger value="incidents" icon={ShieldAlert} label="Incidents" />
          <TabTrigger value="platform" icon={Settings2} label="Platform" />
          <TabTrigger value="health" icon={Gauge} label="System Health" />
        </TabsList>

        <TabsContent value="security" className="mt-0">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="roles" className="mt-0">
          <RoleManagement />
        </TabsContent>
        <TabsContent value="data" className="mt-0">
          <DataProtection />
        </TabsContent>
        <TabsContent value="monitoring" className="mt-0">
          <MonitoringSettings />
        </TabsContent>
        <TabsContent value="incidents" className="mt-0">
          <IncidentManagement />
        </TabsContent>
        <TabsContent value="platform" className="mt-0">
          <PlatformConfig />
        </TabsContent>
        <TabsContent value="health" className="mt-0">
          <SystemHealth />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabTrigger({
  value, icon: Icon, label,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:bg-gradient-emerald data-[state=active]:text-white data-[state=active]:shadow-soft rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all"
    >
      <Icon className="size-3.5" />
      {label}
    </TabsTrigger>
  );
}

export default SuperAdminSettingsView;

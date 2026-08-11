"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuperAdminOverviewView } from "@/components/views/super-admin-overview-view";
import { TenantsView } from "@/components/views/tenants-view";
import { FeatureFlagsView } from "@/components/views/feature-flags-view";
import { PlansView } from "@/components/views/plans-view";
import { PlatformUsersView } from "@/components/views/platform-users-view";
import { PlatformAuditView } from "@/components/views/platform-audit-view";
import { PlatformHealthView } from "@/components/views/platform-health-view";
import { PageHeader } from "@/components/common/page-header";
import { LayoutDashboard, Building2, ToggleRight, CreditCard, Users, ScrollText, Heart } from "lucide-react";
import { useT } from "@/lib/i18n/store";

export function PlatformDashboardView() {
  const [tab, setTab] = useState("overview");
  const t = useT();

  return (
    <div>
      <PageHeader
        title={t("pf-dashboard-title")}
        description={t("pf-dashboard-desc")}
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <LayoutDashboard className="size-3.5" /> {t("pf-tab-overview")}
          </TabsTrigger>
          <TabsTrigger value="tenants" className="gap-1.5">
            <Building2 className="size-3.5" /> {t("pf-tab-tenants")}
          </TabsTrigger>
          <TabsTrigger value="flags" className="gap-1.5">
            <ToggleRight className="size-3.5" /> {t("pf-tab-flags")}
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-1.5">
            <CreditCard className="size-3.5" /> {t("pf-tab-plans")}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="size-3.5" /> {t("pf-tab-users")}
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5">
            <ScrollText className="size-3.5" /> {t("pf-tab-audit")}
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5">
            <Heart className="size-3.5" /> {t("pf-tab-health")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SuperAdminOverviewView embedded />
        </TabsContent>
        <TabsContent value="tenants" className="mt-6">
          <TenantsView embedded />
        </TabsContent>
        <TabsContent value="flags" className="mt-6">
          <FeatureFlagsView embedded />
        </TabsContent>
        <TabsContent value="plans" className="mt-6">
          <PlansView />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <PlatformUsersView />
        </TabsContent>
        <TabsContent value="audit" className="mt-6">
          <PlatformAuditView />
        </TabsContent>
        <TabsContent value="health" className="mt-6">
          <PlatformHealthView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

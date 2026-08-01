"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Save,
  Loader2,
  Crown,
  Shield,
  Boxes,
  Mail,
  Phone,
  User,
  MapPin,
  Hash,
  Landmark,
  FileText,
  Lock,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { fmtDate, fmtRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  PortalAccess,
  PortalTier,
  Partner,
  Tenant,
} from "@/lib/supabase/types";

const TIER_META: Record<
  PortalTier,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  premium: {
    label: "Premium",
    className: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
    icon: Crown,
  },
  standard: {
    label: "Standard",
    className: "border-transparent bg-primary/10 text-primary",
    icon: Shield,
  },
  limited: {
    label: "Limited",
    className: "border-transparent bg-muted text-muted-foreground",
    icon: Boxes,
  },
};

export function PortalProfile() {
  const portalAccess = useAppStore((s) => s.portalAccess) as PortalAccess | null;
  const setView = useAppStore((s) => s.setView);

  if (!portalAccess) return null;

  const canViewProfile = !!portalAccess.can_view_profile;
  const canViewCompany = !!portalAccess.can_view_company_info;

  // If user can't see either, show locked state
  if (!canViewProfile && !canViewCompany) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <PageHeader />
        <LockedCard label="My Account" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <PageHeader />

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {canViewProfile ? (
          <ProfileColumn portalAccess={portalAccess} />
        ) : (
          <LockedCard label="My Profile" />
        )}
        {canViewCompany ? (
          <CompanyColumn portalAccess={portalAccess} onGoProfile={() => setView("portal-profile")} />
        ) : (
          <LockedCard label="Company Info" />
        )}
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        My <span className="text-gradient-emerald">Account</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Manage your profile and view our firm details.
      </p>
    </div>
  );
}

// ---------------- My Profile column ----------------
function ProfileColumn({ portalAccess }: { portalAccess: PortalAccess }) {
  const profileQ = useQuery<{ partner: Partner; access: PortalAccess }>({
    queryKey: ["portal-profile"],
    queryFn: async () => {
      const r = await fetch("/api/portal/profile");
      if (!r.ok) throw new Error("Failed to load profile");
      return r.json();
    },
  });

  if (profileQ.isLoading) {
    return (
      <div className="card-premium p-12 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const partner = profileQ.data?.partner;
  if (!partner) {
    return (
      <div className="card-premium p-12 text-center text-sm text-muted-foreground">
        Unable to load your profile.
      </div>
    );
  }

  // Keyed remount initializes the form from the freshly loaded partner — no effect needed.
  return <ProfileForm key={partner.id} partner={partner} portalAccess={portalAccess} />;
}

function ProfileForm({ partner, portalAccess }: { partner: Partner; portalAccess: PortalAccess }) {
  const qc = useQueryClient();
  const tier = portalAccess.tier;
  const TierIcon = TIER_META[tier].icon;

  const [form, setForm] = useState({
    contact_name: partner.contact_name || "",
    contact_email: partner.contact_email || "",
    contact_phone: partner.contact_phone || "",
    phone: partner.phone || "",
  });

  const saveMut = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save profile");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      qc.invalidateQueries({ queryKey: ["portal-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveMut.mutate(form);
  }

  const dirty =
    form.contact_name !== (partner.contact_name || "") ||
    form.contact_email !== (partner.contact_email || "") ||
    form.contact_phone !== (partner.contact_phone || "") ||
    form.phone !== (partner.phone || "");

  return (
    <div className="space-y-5">
      {/* Identity card — premium with avatar + tier badge */}
      <div className="card-premium p-6 relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 right-0 h-24 w-24 bg-primary/[0.06] blur-3xl rounded-full" />
        <div className="relative">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
            <User className="size-4 text-primary" /> Account overview
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex items-center justify-center font-semibold text-2xl shadow-soft shrink-0">
              {(partner.name || "?").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate text-base">{partner.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {partner.entity_type === "individual" ? "Individual account" : "Company account"}
                {partner.country ? ` · ${partner.country}` : ""}
              </p>
              <Badge className={cn("mt-2 gap-1", TIER_META[tier].className)}>
                <TierIcon className="size-3" />
                {TIER_META[tier].label} tier
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
            <ReadTile label="Tier" value={TIER_META[tier].label} icon={TierIcon} accent={TIER_META[tier].className} />
            <ReadTile
              label="Entity type"
              value={partner.entity_type === "individual" ? "Individual" : "Company"}
              icon={Building2}
            />
            <ReadTile label="Partner ID" value={partner.id} icon={Hash} mono />
          </div>
          {portalAccess.last_login_at && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
              <Clock className="size-3.5" />
              Last login {fmtRelative(portalAccess.last_login_at)}
              {portalAccess.last_login_ip ? ` from ${portalAccess.last_login_ip}` : ""}
            </div>
          )}
        </div>
      </div>

      {/* Editable contact info */}
      <form onSubmit={submit} className="card-premium p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Mail className="size-4 text-primary" /> Contact information
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update the details your account manager uses to reach you.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact name" icon={User}>
            <Input
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              placeholder="Your name"
              className="h-10 smooth focus-visible:ring-primary/40 focus-visible:border-primary/40"
            />
          </Field>
          <Field label="Contact email" icon={Mail}>
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              placeholder="you@company.com"
              className="h-10 smooth focus-visible:ring-primary/40 focus-visible:border-primary/40"
            />
          </Field>
          <Field label="Contact phone" icon={Phone}>
            <Input
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              placeholder="+381 …"
              className="h-10 smooth focus-visible:ring-primary/40 focus-visible:border-primary/40"
            />
          </Field>
          <Field label="Company phone" icon={Phone}>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+381 …"
              className="h-10 smooth focus-visible:ring-primary/40 focus-visible:border-primary/40"
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button
            type="submit"
            disabled={saveMut.isPending || !dirty}
            className="smooth hover:shadow-soft-md"
          >
            {saveMut.isPending ? (
              <Loader2 className="size-4 animate-spin mr-1.5" />
            ) : (
              <Save className="size-4 mr-1.5" />
            )}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

// ---------------- Company Info column ----------------
function CompanyColumn({
  portalAccess,
  onGoProfile,
}: {
  portalAccess: PortalAccess;
  onGoProfile: () => void;
}) {
  const companyQ = useQuery<{ tenant: Tenant }>({
    queryKey: ["portal-company"],
    queryFn: async () => {
      const r = await fetch("/api/portal/company");
      if (!r.ok) throw new Error("Failed to load company info");
      return r.json();
    },
  });

  if (companyQ.isLoading) {
    return (
      <div className="card-premium p-12 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tenant = companyQ.data?.tenant;
  if (!tenant) {
    return (
      <div className="card-premium p-12 text-center text-sm text-muted-foreground">
        Unable to load company information.
      </div>
    );
  }

  const tier = portalAccess.tier;
  const showBasic = tier === "premium" || tier === "standard";
  const showFull = tier === "premium";
  const tierLabel = TIER_META[tier].label;

  return (
    <div className="card-premium p-6 relative overflow-hidden">
      {/* Glass effect — subtle layered background */}
      <div className="absolute inset-0 bg-mesh-portal opacity-30 pointer-events-none" />

      {/* Premium ribbon */}
      {tier === "premium" && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-emerald text-primary-foreground text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-soft">
            <Crown className="size-3" /> Premium
          </div>
        </div>
      )}

      <div className="relative space-y-5">
        <div className="flex items-start gap-3">
          <div className="size-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold truncate">
              {tenant.legal_name || tenant.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              The firm serving your account.
            </p>
            <Badge className={cn("mt-2 gap-1", TIER_META[tier].className)}>
              {tierLabel} access
            </Badge>
          </div>
        </div>

        {/* Basic identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow icon={Building2} label="Legal name" value={tenant.legal_name || tenant.name} />
          <InfoRow icon={MapPin} label="Country" value={tenant.country || "—"} />
          {showBasic && (
            <>
              <InfoRow icon={Hash} label="Tax ID" value={tenant.tax_id || "—"} mono />
              {tenant.vat_number && (
                <InfoRow icon={FileText} label="VAT number" value={tenant.vat_number} mono />
              )}
              {tenant.registration_number && (
                <InfoRow
                  icon={FileText}
                  label="Registration no."
                  value={tenant.registration_number}
                  mono
                />
              )}
            </>
          )}
        </div>

        {/* Limited tier notice */}
        {!showBasic && (
          <UpgradeNotice
            title="Limited company details"
            description={`Your ${tierLabel} tier shows only the firm name and country. Upgrade to Standard or Premium to see tax IDs, address, and bank details.`}
          />
        )}

        {/* Address (standard + premium) */}
        {showBasic && (tenant.address_line || tenant.city) && (
          <>
            <Separator />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Address
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={MapPin} label="Street" value={tenant.address_line || "—"} />
                <InfoRow
                  icon={MapPin}
                  label="City"
                  value={[tenant.postal_code, tenant.city].filter(Boolean).join(" ") || "—"}
                />
              </div>
            </div>
          </>
        )}

        {/* Bank details (premium only) */}
        {showFull && (tenant.bank_name || tenant.bank_iban) && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Bank details
                </p>
                <Badge className="gap-1 border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  <Crown className="size-3" /> Premium
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={Landmark} label="Bank" value={tenant.bank_name || "—"} />
                <InfoRow icon={Landmark} label="IBAN" value={tenant.bank_iban || "—"} mono />
                <InfoRow icon={Hash} label="SWIFT / BIC" value={tenant.bank_swift || "—"} mono />
                <InfoRow icon={Building2} label="Currency" value={tenant.currency || "—"} />
              </div>
            </div>
          </>
        )}

        {/* Standard tier upgrade hint */}
        {tier === "standard" && (
          <UpgradeNotice
            title="Bank details are premium-only"
            description="Upgrade to Premium to view bank account details for payments."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={onGoProfile}
                className="mt-2 smooth hover:shadow-soft"
              >
                Contact us <ArrowRight className="size-3.5 ml-1" />
              </Button>
            }
          />
        )}

        <Separator />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Member since {fmtDate(tenant.created_at)}</span>
          <span className="capitalize">Plan: {tenant.plan}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------- Small helpers ----------------
function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3.5" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function ReadTile({
  label,
  value,
  icon: Icon,
  accent,
  mono,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      {accent ? (
        <Badge className={cn("mt-1.5 text-[11px]", accent)}>{value}</Badge>
      ) : (
        <p className={cn("text-sm font-medium mt-1 truncate", mono && "font-mono tabular")}>
          {value}
        </p>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium truncate", mono && "font-mono tabular")}>{value}</p>
      </div>
    </div>
  );
}

function UpgradeNotice({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-4 flex items-start gap-2.5">
      <div className="size-9 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
        <Lock className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        {action}
      </div>
    </div>
  );
}

function LockedCard({ label }: { label: string }) {
  return (
    <div className="card-premium p-12 flex flex-col items-center justify-center text-center">
      <div className="size-14 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-3">
        <Lock className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{label} is locked</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        Upgrade your access tier to unlock this section.
      </p>
    </div>
  );
}

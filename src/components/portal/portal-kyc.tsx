"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  User,
  Crown,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  PencilLine,
  Send,
  Landmark,
  Mail,
  Phone,
  MapPin,
  Globe2,
  Calendar,
  Hash,
  Wallet,
  IdCard,
  ScrollText,
  Banknote,
  Receipt,
  Home,
  Briefcase,
  Scale,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fmtBytes, fmtDate, fmtDateTime } from "@/lib/utils/format";
import { COUNTRIES } from "@/lib/data/reference";
import type {
  KycSubmission,
  KycDocument,
  KycDocumentType,
  PartnerEntityType,
} from "@/lib/supabase/types";

// Local status code type — matches the actual KycSubmission.status values
// returned by the API ("draft" | "submitted" | "under_review" | "approved"
// | "rejected" | "resubmit"). Defined locally because the shared types file
// declares a separate KycStatus union used by Partner.kyc_status.
type KycStatusCode =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "resubmit";

// ============================================================
// Constants
// ============================================================

type FormState = Partial<KycSubmission> & { documents?: KycDocument[] };

const STEP_DEFS: Array<{
  id: number;
  label: string;
  short: string;
  companyOnly?: boolean;
}> = [
  { id: 1, label: "Entity Type", short: "Entity" },
  { id: 2, label: "Business Information", short: "Info" },
  { id: 3, label: "Address & Contact", short: "Address" },
  { id: 4, label: "Beneficial Owner", short: "Owner", companyOnly: true },
  { id: 5, label: "Bank Details", short: "Bank" },
  { id: 6, label: "Document Upload", short: "Documents" },
  { id: 7, label: "Review & Submit", short: "Review" },
];

const STATUS_META: Record<
  KycStatusCode,
  {
    label: string;
    tone: "amber" | "info" | "emerald" | "destructive" | "muted";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  draft: { label: "Draft", tone: "muted", icon: PencilLine },
  submitted: { label: "Submitted", tone: "info", icon: Send },
  under_review: { label: "Under Review", tone: "amber", icon: Clock },
  approved: { label: "Approved", tone: "emerald", icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "destructive", icon: AlertCircle },
  resubmit: { label: "Resubmit Required", tone: "amber", icon: AlertCircle },
};

const VOLUME_OPTIONS = [
  { value: "lt_50k", label: "Less than $50,000" },
  { value: "50k_100k", label: "$50,000 – $100,000" },
  { value: "100k_250k", label: "$100,000 – $250,000" },
  { value: "250k_plus", label: "More than $250,000" },
];

const ID_TYPE_OPTIONS = [
  { value: "passport", label: "Passport" },
  { value: "id_card", label: "National ID Card" },
];

interface DocTypeDef {
  type: KycDocumentType;
  label: string;
  description: string;
  requiredFor?: "company" | "all";
  optional?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const DOC_TYPES: DocTypeDef[] = [
  {
    type: "company_registration",
    label: "Company Registration Certificate",
    description: "Official certificate of incorporation.",
    requiredFor: "company",
    icon: Building2,
  },
  {
    type: "tax_certificate",
    label: "Tax Certificate",
    description: "Proof of tax registration.",
    requiredFor: "all",
    icon: Receipt,
  },
  {
    type: "vat_certificate",
    label: "VAT Certificate",
    description: "If your business is VAT-registered.",
    optional: true,
    icon: ScrollText,
  },
  {
    type: "id_card",
    label: "ID Card / Passport of Beneficial Owner",
    description: "Government-issued identification.",
    requiredFor: "all",
    icon: IdCard,
  },
  {
    type: "bank_statement",
    label: "Bank Statement",
    description: "Most recent statement (last 3 months).",
    requiredFor: "all",
    icon: Banknote,
  },
  {
    type: "utility_bill",
    label: "Utility Bill",
    description: "Optional — proof of address.",
    optional: true,
    icon: Home,
  },
  {
    type: "trade_license",
    label: "Trade License",
    description: "Optional — if applicable to your jurisdiction.",
    optional: true,
    icon: FileText,
  },
  {
    type: "chamber_of_commerce",
    label: "Chamber of Commerce Certificate",
    description: "Optional — official registry extract.",
    optional: true,
    icon: FileCheck2,
  },
];

// ============================================================
// Main component — routing by status
// ============================================================

export function PortalKyc() {
  const kycQ = useQuery<{ submission: KycSubmission | null; exempt: boolean }>({
    queryKey: ["portal-kyc"],
    queryFn: async () => {
      const r = await fetch("/api/portal/kyc");
      if (!r.ok) throw new Error("Failed to load KYC status");
      return r.json();
    },
  });

  const [forceEdit, setForceEdit] = useState(false);

  if (kycQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (kycQ.isError) {
    return (
      <Card className="border-destructive/30 shadow-soft">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <AlertCircle className="size-6 text-destructive mb-2" />
          <p className="text-sm font-medium">Unable to load KYC status.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please refresh the page or try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { submission, exempt } = kycQ.data!;

  if (exempt) return <ExemptCard />;

  // No submission yet → fresh wizard
  if (!submission) return <KycWizard initial={null} />;

  const status = submission.status as KycStatusCode;

  // Force-edit mode (after "Update & Resubmit")
  if (forceEdit || status === "draft" || status === "resubmit") {
    return (
      <KycWizard
        initial={submission}
        rejectionReason={
          status === "rejected" || status === "resubmit"
            ? submission.rejection_reason ?? undefined
            : undefined
        }
        onUnlockReset={() => setForceEdit(false)}
      />
    );
  }

  // Rejected with reason → status view + button to unlock
  if (status === "rejected") {
    return (
      <StatusView
        submission={submission}
        status={status}
        onUnlock={() => setForceEdit(true)}
      />
    );
  }

  // submitted / under_review / approved → read-only status view
  return <StatusView submission={submission} status={status} onUnlock={undefined} />;
}

// ============================================================
// Exempt card — premium tier skips KYC
// ============================================================

function ExemptCard() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          KYC <span className="text-gradient-emerald">Verification</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Know Your Customer compliance for your trading account.
        </p>
      </div>

      <Card className="border-amber-300/40 shadow-soft-lg overflow-hidden">
        <div className="relative bg-gradient-to-br from-amber-50 via-card to-card dark:from-amber-500/10 dark:via-card dark:to-card">
          <div className="absolute inset-0 bg-mesh-portal opacity-60 pointer-events-none" />
          <CardContent className="relative p-8 sm:p-10 flex flex-col items-center text-center">
            <div className="size-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-soft-md mb-5">
              <Crown className="size-8" />
            </div>
            <Badge className="mb-4 border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 gap-1.5">
              <Crown className="size-3" /> Premium client
            </Badge>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight max-w-lg">
              KYC verification is not required for your account.
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">
              You are a premium client — your account has been pre-approved by
              your account manager. No further compliance documentation is
              needed to trade with us.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              Account fully verified and active.
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// Status view — read-only banner for submitted / under_review / approved / rejected
// ============================================================

function StatusView({
  submission,
  status,
  onUnlock,
}: {
  submission: KycSubmission;
  status: KycStatusCode;
  onUnlock?: () => void;
}) {
  const meta = STATUS_META[status];
  const ToneIcon = meta.icon;
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          KYC <span className="text-gradient-emerald">Verification</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your compliance submission and its review status.
        </p>
      </div>

      <Card
        className={cn(
          "shadow-soft-lg overflow-hidden",
          isApproved && "border-emerald-300/50",
          isRejected && "border-destructive/30"
        )}
      >
        <div
          className={cn(
            "relative p-6 sm:p-8",
            isApproved &&
              "bg-gradient-to-br from-emerald-50 via-card to-card dark:from-emerald-500/10 dark:via-card dark:to-card",
            isRejected &&
              "bg-gradient-to-br from-destructive/5 via-card to-card",
            !isApproved &&
              !isRejected &&
              "bg-gradient-to-br from-amber-50 via-card to-card dark:from-amber-500/10 dark:via-card dark:to-card"
          )}
        >
          <div className="absolute inset-0 bg-mesh-portal opacity-50 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
            <div
              className={cn(
                "size-14 rounded-2xl flex items-center justify-center shadow-soft-md shrink-0",
                isApproved &&
                  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                isRejected && "bg-destructive/15 text-destructive",
                !isApproved &&
                  !isRejected &&
                  "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              )}
            >
              <ToneIcon className="size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={cn(
                    "border-transparent gap-1.5",
                    meta.tone === "emerald" && "bg-emerald-600 text-white",
                    meta.tone === "amber" && "bg-amber-500 text-white",
                    meta.tone === "info" && "bg-primary text-primary-foreground",
                    meta.tone === "destructive" &&
                      "bg-destructive text-destructive-foreground",
                    meta.tone === "muted" && "bg-muted text-muted-foreground"
                  )}
                >
                  <ToneIcon className="size-3" />
                  {meta.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Submitted{" "}
                  {submission.submitted_at
                    ? fmtDate(submission.submitted_at)
                    : "—"}
                </span>
              </div>
              <h2 className="text-lg font-semibold tracking-tight mt-3">
                {isApproved && "Your data has been verified and saved."}
                {isRejected && "Your submission needs attention."}
                {!isApproved &&
                  !isRejected &&
                  "Your KYC submission is under review."}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {isApproved &&
                  "Your account has been fully verified. Trade documentation is no longer required from you."}
                {isRejected &&
                  "Please review the reviewer notes below, update the highlighted fields, and resubmit."}
                {!isApproved &&
                  !isRejected &&
                  "Our compliance team will respond within 2–3 business days. You will be notified by email when the review is complete."}
              </p>

              {isRejected && submission.rejection_reason && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-1">
                    <AlertCircle className="size-3.5" />
                    Reviewer notes
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {submission.rejection_reason}
                  </p>
                </div>
              )}

              {isApproved && submission.reviewed_at && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" />
                  Approved on {fmtDate(submission.reviewed_at)}
                </div>
              )}

              {isRejected && onUnlock && (
                <div className="mt-5">
                  <Button onClick={onUnlock} className="gap-1.5">
                    <PencilLine className="size-4" />
                    Update & Resubmit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary of submitted data (read-only) */}
      <SubmissionSummary submission={submission} />
    </div>
  );
}

// ============================================================
// Submission summary — used both in read-only StatusView and review step
// ============================================================

function SubmissionSummary({ submission }: { submission: KycSubmission }) {
  const isCompany = submission.entity_type === "company";
  const sections: Array<{
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    rows: Array<{
      label: string;
      value: string | null | undefined;
      mono?: boolean;
    }>;
  }> = [
    {
      title: isCompany ? "Business Information" : "Personal Information",
      icon: isCompany ? Building2 : User,
      rows: isCompany
        ? [
            { label: "Legal name", value: submission.legal_name },
            { label: "Trade name", value: submission.trade_name },
            {
              label: "Registration no.",
              value: submission.registration_number,
              mono: true,
            },
            { label: "Tax ID", value: submission.tax_id, mono: true },
            { label: "VAT number", value: submission.vat_number, mono: true },
            { label: "Website", value: submission.company_website },
            { label: "Business activity", value: submission.business_activity },
            {
              label: "Expected monthly volume",
              value: submission.expected_monthly_volume,
            },
            { label: "Source of funds", value: submission.source_of_funds },
          ]
        : [
            { label: "Full legal name", value: submission.legal_name },
            {
              label: "ID type",
              value:
                submission.owner_id_type === "passport"
                  ? "Passport"
                  : "National ID Card",
            },
            {
              label: "ID number",
              value: submission.owner_id_number,
              mono: true,
            },
            {
              label: "Nationality",
              value: countryName(submission.owner_nationality),
            },
            { label: "Date of birth", value: submission.owner_dob },
            { label: "Occupation", value: submission.business_activity },
            { label: "Source of funds", value: submission.source_of_funds },
          ],
    },
    {
      title: "Address & Contact",
      icon: MapPin,
      rows: [
        { label: "Address", value: submission.address_line },
        { label: "City", value: submission.city },
        { label: "State / Province", value: submission.state },
        { label: "Postal code", value: submission.postal_code, mono: true },
        { label: "Country", value: countryName(submission.country) },
        { label: "Contact name", value: submission.contact_name },
        { label: "Contact email", value: submission.contact_email },
        { label: "Contact phone", value: submission.contact_phone },
        { label: "Position", value: submission.contact_position },
      ],
    },
    ...(isCompany
      ? [
          {
            title: "Beneficial Owner (AML)",
            icon: Scale,
            rows: [
              { label: "Owner name", value: submission.owner_name },
              {
                label: "ID type",
                value:
                  submission.owner_id_type === "passport"
                    ? "Passport"
                    : "National ID Card",
              },
              {
                label: "ID number",
                value: submission.owner_id_number,
                mono: true,
              },
              {
                label: "Nationality",
                value: countryName(submission.owner_nationality),
              },
              { label: "Date of birth", value: submission.owner_dob },
              { label: "Address", value: submission.owner_address },
            ],
          },
        ]
      : []),
    {
      title: "Bank Details",
      icon: Landmark,
      rows: [
        { label: "Bank name", value: submission.bank_name },
        { label: "Account number", value: submission.bank_account, mono: true },
        { label: "IBAN", value: submission.bank_iban, mono: true },
        { label: "SWIFT / BIC", value: submission.bank_swift, mono: true },
      ],
    },
    {
      title: "Documents",
      icon: FileText,
      rows: (submission.documents || []).map((d) => ({
        label: docTypeLabel(d.type),
        value: `${d.filename} · ${fmtBytes(d.size)}`,
      })),
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <Card key={s.title} className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <s.icon className="size-4 text-primary" />
              {s.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {s.rows.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No documents uploaded.
              </p>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {s.rows.map((r, i) => (
                  <div key={i} className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                      {r.label}
                    </dt>
                    <dd
                      className={cn(
                        "text-sm mt-0.5 break-words",
                        r.mono && "font-mono tabular",
                        !r.value && "text-muted-foreground italic"
                      )}
                    >
                      {r.value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// KYC Wizard — multi-step form
// ============================================================

function KycWizard({
  initial,
  rejectionReason,
  onUnlockReset,
}: {
  initial: KycSubmission | null;
  rejectionReason?: string;
  onUnlockReset?: () => void;
}) {
  // Build form state from initial submission (or empty defaults).
  const [form, setForm] = useState<FormState>(() => ({
    entity_type: initial?.entity_type,
    legal_name: initial?.legal_name ?? "",
    trade_name: initial?.trade_name ?? "",
    registration_number: initial?.registration_number ?? "",
    tax_id: initial?.tax_id ?? "",
    vat_number: initial?.vat_number ?? "",
    company_website: initial?.company_website ?? "",
    business_activity: initial?.business_activity ?? "",
    expected_monthly_volume: initial?.expected_monthly_volume ?? "",
    source_of_funds: initial?.source_of_funds ?? "",
    address_line: initial?.address_line ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    postal_code: initial?.postal_code ?? "",
    country: initial?.country ?? "",
    contact_name: initial?.contact_name ?? "",
    contact_email: initial?.contact_email ?? "",
    contact_phone: initial?.contact_phone ?? "",
    contact_position: initial?.contact_position ?? "",
    owner_name: initial?.owner_name ?? "",
    owner_id_type: initial?.owner_id_type ?? "passport",
    owner_id_number: initial?.owner_id_number ?? "",
    owner_nationality: initial?.owner_nationality ?? "",
    owner_dob: initial?.owner_dob ?? "",
    owner_address: initial?.owner_address ?? "",
    bank_name: initial?.bank_name ?? "",
    bank_account: initial?.bank_account ?? "",
    bank_iban: initial?.bank_iban ?? "",
    bank_swift: initial?.bank_swift ?? "",
    documents: initial?.documents ?? [],
  }));

  const [step, setStep] = useState<number>(1);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    initial?.updated_at ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<KycSubmission | null>(null);

  // Track which steps have been visited — drives step indicator "completed" state.
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(
    () => new Set([1])
  );

  const isCompany = form.entity_type === "company";
  const visibleSteps = useMemo(
    () => STEP_DEFS.filter((s) => !s.companyOnly || isCompany),
    [isCompany]
  );

  // ---- Auto-save (debounced) ----
  const loadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mark loaded after first paint so we skip the initial auto-save.
  useEffect(() => {
    loadedRef.current = true;
  }, []);

  const saveDraft = async (silent = true) => {
    if (!form.entity_type) return; // nothing to save until entity selected
    try {
      if (!silent) setSaving(true);
      const r = await fetch("/api/portal/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "draft" }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save draft");
      }
      const saved: KycSubmission = await r.json();
      setLastSavedAt(saved.updated_at);
      if (!silent) toast.success("Draft saved.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      if (silent) {
        toast.error(`Auto-save failed: ${msg}`);
      } else {
        toast.error(msg);
      }
    } finally {
      if (!silent) setSaving(false);
    }
  };

  // Debounced auto-save whenever form changes (after initial mount).
  useEffect(() => {
    if (!loadedRef.current) return;
    if (!form.entity_type) return; // skip until entity selected
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveDraft(true);
    }, 1500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function goToStep(target: number) {
    let next = target;
    if (next < 1) next = 1;
    if (next > visibleSteps.length) next = visibleSteps.length;
    setStep(next);
    setVisitedSteps((prev) => {
      const n = new Set(prev);
      n.add(next);
      return n;
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleContinue() {
    if (step === 1 && !form.entity_type) return;
    if (step < visibleSteps.length) goToStep(step + 1);
  }

  function handleBack() {
    if (step > 1) goToStep(step - 1);
  }

  async function handleSubmitForReview() {
    if (!declarationChecked) {
      toast.error("Please confirm the declaration before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/portal/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Submission failed");
      }
      const result: KycSubmission = await r.json();
      setSubmitted(result);
      toast.success("KYC submitted for review.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Success state after submission ----
  if (submitted) {
    return <SuccessState submission={submitted} />;
  }

  const currentStepDef = visibleSteps[step - 1];
  const isLastStep = step === visibleSteps.length;
  const readOnly = false; // wizard is always editable

  // Number for a step (1-based across visible steps)
  const stepNumber = (id: number) =>
    visibleSteps.findIndex((s) => s.id === id) + 1;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            KYC <span className="text-gradient-emerald">Verification</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete each step to submit your compliance information for review.
          </p>
        </div>
        {lastSavedAt && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Check className="size-3 text-emerald-600" />
            Draft saved {fmtDateTime(lastSavedAt)}
          </div>
        )}
      </div>

      {/* Rejection banner (only if resubmitting after rejection) */}
      {rejectionReason && (
        <Card className="border-destructive/30 shadow-soft">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="size-9 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
              <AlertCircle className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-destructive">
                Previous submission was rejected
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {rejectionReason}
              </p>
            </div>
            {onUnlockReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onUnlockReset}
                className="text-xs h-7"
              >
                Cancel
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step indicator */}
      <StepIndicator
        steps={visibleSteps}
        current={step}
        visited={visitedSteps}
        stepNumber={stepNumber}
      />

      {/* Step content */}
      <Card className="card-premium shadow-soft-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="tabular border-primary/30 text-primary bg-primary/5"
            >
              Step {step} / {visibleSteps.length}
            </Badge>
            <CardTitle className="text-base">{currentStepDef.label}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div
            key={step}
            className="animate-in fade-in-5 slide-in-from-bottom-1 duration-300"
          >
            {step === 1 && (
              <StepEntity
                value={form.entity_type}
                onChange={(v) => update("entity_type", v)}
              />
            )}
            {step === 2 && (
              <StepBusinessInfo
                isCompany={!!isCompany}
                form={form}
                update={update}
                readOnly={readOnly}
              />
            )}
            {step === 3 && (
              <StepAddressContact
                form={form}
                update={update}
                readOnly={readOnly}
              />
            )}
            {step === 4 && isCompany && (
              <StepBeneficialOwner
                form={form}
                update={update}
                readOnly={readOnly}
              />
            )}
            {step === 5 && (
              <StepBankDetails form={form} update={update} readOnly={readOnly} />
            )}
            {step === 6 && (
              <StepDocuments
                documents={form.documents || []}
                onChange={(docs) => update("documents", docs)}
                isCompany={!!isCompany}
              />
            )}
            {step === 7 && <StepReview form={form} isCompany={!!isCompany} />}
          </div>
        </CardContent>

        {/* Footer navigation */}
        <div className="border-t bg-muted/20 px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="ghost" onClick={handleBack} className="gap-1.5">
                <ArrowLeft className="size-4" />
                Back
              </Button>
            )}
            {!isLastStep && (
              <Button
                onClick={handleContinue}
                disabled={step === 1 && !form.entity_type}
                className="gap-1.5"
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveDraft(false)}
              disabled={saving || !form.entity_type}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              Save draft
            </Button>
            {isLastStep && (
              <Button
                onClick={handleSubmitForReview}
                disabled={submitting || !declarationChecked}
                className="gap-1.5"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Submit for Review
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Declaration checkbox on review step */}
      {isLastStep && (
        <Card className="shadow-soft border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Checkbox
              id="declaration"
              checked={declarationChecked}
              onCheckedChange={(v) => setDeclarationChecked(v === true)}
              className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="min-w-0">
              <Label
                htmlFor="declaration"
                className="text-sm font-medium cursor-pointer"
              >
                I confirm that the information provided is accurate and complete.
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Submitting false or misleading information may result in account
                suspension and termination of trading services.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Step indicator
// ============================================================

function StepIndicator({
  steps,
  current,
  visited,
  stepNumber,
}: {
  steps: typeof STEP_DEFS;
  current: number;
  visited: Set<number>;
  stepNumber: (id: number) => number;
}) {
  return (
    <div className="card-premium shadow-soft p-4 sm:p-5">
      <div className="flex items-center justify-between gap-1 overflow-x-auto custom-scroll">
        {steps.map((s, idx) => {
          const num = stepNumber(s.id);
          const isCurrent = num === current;
          const isCompleted = num < current || (visited.has(num) && num < current);
          const isFuture = num > current;
          const isLast = idx === steps.length - 1;
          return (
            <div key={s.id} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center text-sm font-semibold tabular transition-all duration-200",
                    isCurrent &&
                      "bg-primary text-primary-foreground shadow-soft-md glow-emerald",
                    isCompleted && "bg-primary/15 text-primary",
                    isFuture &&
                      "bg-muted text-muted-foreground border border-border/60"
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : num}
                </div>
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition-colors",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.short}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1.5 mb-5 rounded-full transition-all duration-300",
                    isCompleted ? "step-connector" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Step 1 — Entity type
// ============================================================

function StepEntity({
  value,
  onChange,
}: {
  value: PartnerEntityType | undefined;
  onChange: (v: PartnerEntityType) => void;
}) {
  const options: Array<{
    value: PartnerEntityType;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      value: "company",
      title: "Company",
      description:
        "Registered legal entity — corporation, LLC, partnership, or other business structure.",
      icon: Building2,
    },
    {
      value: "individual",
      title: "Individual",
      description:
        "Sole trader or private person trading in your own name, not through a company.",
      icon: User,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">
          Select the entity type that best describes your trading relationship
          with us. This determines the information we need to collect.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => {
          const selected = value === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "group relative text-left rounded-xl border p-5 transition-all duration-200",
                "hover:shadow-soft-md hover:-translate-y-0.5",
                selected
                  ? "border-primary bg-primary/5 shadow-soft-md glow-emerald"
                  : "border-border/60 bg-card hover:border-primary/40"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "size-12 rounded-xl flex items-center justify-center transition-colors shrink-0",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{opt.title}</h3>
                    {selected && <Check className="size-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Step 2 — Business (company) / Personal (individual) information
// ============================================================

function StepBusinessInfo({
  isCompany,
  form,
  update,
  readOnly,
}: {
  isCompany: boolean;
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-5">
      <SectionIntro
        icon={isCompany ? Building2 : User}
        title={isCompany ? "Business Information" : "Personal Information"}
        description={
          isCompany
            ? "Enter your company's registration and operational details."
            : "Enter your personal identification details."
        }
      />

      {isCompany ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldText
            label="Legal name"
            required
            icon={Building2}
            value={form.legal_name ?? ""}
            onChange={(v) => update("legal_name", v)}
            placeholder="Acme Trading Ltd."
            disabled={readOnly}
          />
          <FieldText
            label="Trade name"
            icon={Briefcase}
            value={form.trade_name ?? ""}
            onChange={(v) => update("trade_name", v)}
            placeholder="Acme Co."
            disabled={readOnly}
          />
          <FieldText
            label="Registration number"
            required
            icon={Hash}
            value={form.registration_number ?? ""}
            onChange={(v) => update("registration_number", v)}
            placeholder="e.g. 12345678"
            mono
            disabled={readOnly}
          />
          <FieldText
            label="Tax ID"
            required
            icon={Receipt}
            value={form.tax_id ?? ""}
            onChange={(v) => update("tax_id", v)}
            placeholder="Tax identification number"
            mono
            disabled={readOnly}
          />
          <FieldText
            label="VAT number"
            icon={ScrollText}
            value={form.vat_number ?? ""}
            onChange={(v) => update("vat_number", v)}
            placeholder="If applicable"
            mono
            disabled={readOnly}
          />
          <FieldText
            label="Website"
            icon={Globe2}
            value={form.company_website ?? ""}
            onChange={(v) => update("company_website", v)}
            placeholder="https://…"
            disabled={readOnly}
          />
          <div className="sm:col-span-2">
            <FieldTextarea
              label="Business activity"
              icon={Briefcase}
              value={form.business_activity ?? ""}
              onChange={(v) => update("business_activity", v)}
              placeholder="Describe your main business activity, products traded, and markets served."
              disabled={readOnly}
            />
          </div>
          <FieldSelect
            label="Expected monthly volume"
            icon={Wallet}
            value={form.expected_monthly_volume ?? ""}
            onChange={(v) => update("expected_monthly_volume", v)}
            options={VOLUME_OPTIONS}
            placeholder="Select range"
            disabled={readOnly}
          />
          <FieldText
            label="Source of funds"
            icon={Banknote}
            value={form.source_of_funds ?? ""}
            onChange={(v) => update("source_of_funds", v)}
            placeholder="e.g. Business revenue, investments"
            disabled={readOnly}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldText
            label="Full legal name"
            required
            icon={User}
            value={form.legal_name ?? ""}
            onChange={(v) => update("legal_name", v)}
            placeholder="As shown on your ID document"
            disabled={readOnly}
          />
          <FieldSelect
            label="ID type"
            icon={IdCard}
            value={form.owner_id_type ?? "passport"}
            onChange={(v) => update("owner_id_type", v)}
            options={ID_TYPE_OPTIONS}
            disabled={readOnly}
          />
          <FieldText
            label="ID number"
            required
            icon={Hash}
            value={form.owner_id_number ?? ""}
            onChange={(v) => update("owner_id_number", v)}
            placeholder="Document number"
            mono
            disabled={readOnly}
          />
          <FieldSelect
            label="Nationality"
            icon={Globe2}
            value={form.owner_nationality ?? ""}
            onChange={(v) => update("owner_nationality", v)}
            options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            placeholder="Select country"
            disabled={readOnly}
          />
          <FieldText
            label="Date of birth"
            icon={Calendar}
            type="date"
            value={form.owner_dob ?? ""}
            onChange={(v) => update("owner_dob", v)}
            disabled={readOnly}
          />
          <FieldText
            label="Occupation"
            icon={Briefcase}
            value={form.business_activity ?? ""}
            onChange={(v) => update("business_activity", v)}
            placeholder="Your profession or trade"
            disabled={readOnly}
          />
          <div className="sm:col-span-2">
            <FieldText
              label="Source of funds"
              icon={Banknote}
              value={form.source_of_funds ?? ""}
              onChange={(v) => update("source_of_funds", v)}
              placeholder="e.g. Salary, business income, savings"
              disabled={readOnly}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Step 3 — Address & Contact
// ============================================================

function StepAddressContact({
  form,
  update,
  readOnly,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-5">
      <SectionIntro
        icon={MapPin}
        title="Address & Contact"
        description="Your registered address and primary contact person."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <FieldText
            label="Address line"
            required
            icon={Home}
            value={form.address_line ?? ""}
            onChange={(v) => update("address_line", v)}
            placeholder="Street address"
            disabled={readOnly}
          />
        </div>
        <FieldText
          label="City"
          required
          icon={MapPin}
          value={form.city ?? ""}
          onChange={(v) => update("city", v)}
          placeholder="City"
          disabled={readOnly}
        />
        <FieldText
          label="State / Province"
          icon={MapPin}
          value={form.state ?? ""}
          onChange={(v) => update("state", v)}
          placeholder="State or province"
          disabled={readOnly}
        />
        <FieldText
          label="Postal code"
          icon={Hash}
          value={form.postal_code ?? ""}
          onChange={(v) => update("postal_code", v)}
          placeholder="Postal / ZIP code"
          mono
          disabled={readOnly}
        />
        <FieldSelect
          label="Country"
          required
          icon={Globe2}
          value={form.country ?? ""}
          onChange={(v) => update("country", v)}
          options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
          placeholder="Select country"
          disabled={readOnly}
        />
      </div>

      <Separator />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
          Contact person
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldText
            label="Name"
            required
            icon={User}
            value={form.contact_name ?? ""}
            onChange={(v) => update("contact_name", v)}
            placeholder="Full name"
            disabled={readOnly}
          />
          <FieldText
            label="Email"
            required
            type="email"
            icon={Mail}
            value={form.contact_email ?? ""}
            onChange={(v) => update("contact_email", v)}
            placeholder="name@company.com"
            disabled={readOnly}
          />
          <FieldText
            label="Phone"
            required
            icon={Phone}
            value={form.contact_phone ?? ""}
            onChange={(v) => update("contact_phone", v)}
            placeholder="+381 …"
            disabled={readOnly}
          />
          <FieldText
            label="Position"
            icon={Briefcase}
            value={form.contact_position ?? ""}
            onChange={(v) => update("contact_position", v)}
            placeholder="e.g. Procurement Manager"
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Step 4 — Beneficial Owner (company only)
// ============================================================

function StepBeneficialOwner({
  form,
  update,
  readOnly,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-5">
      <SectionIntro
        icon={Scale}
        title="Beneficial Owner"
        description="AML requirement — identify the person who ultimately owns or controls the company."
      />
      <div className="rounded-lg border border-amber-300/40 bg-amber-50/60 dark:bg-amber-500/10 p-3 flex items-start gap-2">
        <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-foreground/80 leading-relaxed">
          The beneficial owner is the person who ultimately owns or controls
          the company (typically &gt;25% ownership). This information is
          required under Anti-Money-Laundering regulations.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldText
          label="Owner full name"
          required
          icon={User}
          value={form.owner_name ?? ""}
          onChange={(v) => update("owner_name", v)}
          placeholder="Full legal name"
          disabled={readOnly}
        />
        <FieldSelect
          label="ID type"
          icon={IdCard}
          value={form.owner_id_type ?? "passport"}
          onChange={(v) => update("owner_id_type", v)}
          options={ID_TYPE_OPTIONS}
          disabled={readOnly}
        />
        <FieldText
          label="ID number"
          required
          icon={Hash}
          value={form.owner_id_number ?? ""}
          onChange={(v) => update("owner_id_number", v)}
          placeholder="Document number"
          mono
          disabled={readOnly}
        />
        <FieldSelect
          label="Nationality"
          icon={Globe2}
          value={form.owner_nationality ?? ""}
          onChange={(v) => update("owner_nationality", v)}
          options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
          placeholder="Select country"
          disabled={readOnly}
        />
        <FieldText
          label="Date of birth"
          icon={Calendar}
          type="date"
          value={form.owner_dob ?? ""}
          onChange={(v) => update("owner_dob", v)}
          disabled={readOnly}
        />
        <div className="sm:col-span-2">
          <FieldText
            label="Address"
            icon={Home}
            value={form.owner_address ?? ""}
            onChange={(v) => update("owner_address", v)}
            placeholder="Residential address"
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Step 5 — Bank Details
// ============================================================

function StepBankDetails({
  form,
  update,
  readOnly,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-5">
      <SectionIntro
        icon={Landmark}
        title="Bank Details"
        description="Account where payments will be settled. All fields are optional at draft stage but required before trading."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldText
          label="Bank name"
          icon={Landmark}
          value={form.bank_name ?? ""}
          onChange={(v) => update("bank_name", v)}
          placeholder="e.g. HSBC, Deutsche Bank"
          disabled={readOnly}
        />
        <FieldText
          label="Account number"
          icon={Hash}
          value={form.bank_account ?? ""}
          onChange={(v) => update("bank_account", v)}
          placeholder="Account number"
          mono
          disabled={readOnly}
        />
        <FieldText
          label="IBAN"
          icon={Hash}
          value={form.bank_iban ?? ""}
          onChange={(v) => update("bank_iban", v)}
          placeholder="International Bank Account Number"
          mono
          disabled={readOnly}
        />
        <FieldText
          label="SWIFT / BIC"
          icon={Globe2}
          value={form.bank_swift ?? ""}
          onChange={(v) => update("bank_swift", v)}
          placeholder="Bank identifier code"
          mono
          disabled={readOnly}
        />
      </div>
    </div>
  );
}

// ============================================================
// Step 6 — Document Upload
// ============================================================

function StepDocuments({
  documents,
  onChange,
  isCompany,
}: {
  documents: KycDocument[];
  onChange: (docs: KycDocument[]) => void;
  isCompany: boolean;
}) {
  const [uploadingType, setUploadingType] = useState<KycDocumentType | null>(
    null
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Filter doc types — skip "ID Card / Passport" duplicates if individual
  const visibleDocTypes = DOC_TYPES.filter((d) => {
    if (d.requiredFor === "company" && !isCompany) return false;
    return true;
  });

  async function handleFileSelect(dt: DocTypeDef, file: File | null) {
    if (!file) return;
    setUploadingType(dt.type);
    try {
      const r = await fetch("/api/portal/kyc/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: dt.type,
          filename: file.name,
          mime_type: file.type || "application/octet-stream",
          size: file.size,
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Upload failed");
      }
      const doc: KycDocument = await r.json();
      // Replace any existing document of the same type, otherwise append.
      const filtered = documents.filter((d) => d.type !== dt.type);
      onChange([...filtered, doc]);
      toast.success(`${dt.label} uploaded.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingType(null);
      // Reset file input so the same file can be re-selected
      const ref = fileInputRefs.current[dt.type];
      if (ref) ref.value = "";
    }
  }

  function handleRemove(dt: DocTypeDef) {
    const filtered = documents.filter((d) => d.type !== dt.type);
    onChange(filtered);
    toast.success(`${dt.label} removed.`);
  }

  return (
    <div className="space-y-5">
      <SectionIntro
        icon={FileText}
        title="Document Upload"
        description="Upload clear scans or photos of the required documents. PDF, JPG, PNG accepted."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleDocTypes.map((dt) => {
          const Icon = dt.icon;
          const uploaded = documents.find((d) => d.type === dt.type);
          const isUploading = uploadingType === dt.type;
          const isRequired =
            (dt.requiredFor === "all" ||
              (dt.requiredFor === "company" && isCompany)) && !dt.optional;
          return (
            <div
              key={dt.type}
              className={cn(
                "rounded-xl border p-4 transition-all",
                uploaded
                  ? "border-emerald-300/40 bg-emerald-50/40 dark:bg-emerald-500/5"
                  : isRequired
                    ? "border-border/60 bg-card"
                    : "border-border/60 bg-muted/20"
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={cn(
                    "size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    uploaded
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{dt.label}</p>
                    {isRequired ? (
                      <Badge className="text-[10px] py-0 h-4 border-transparent bg-primary/10 text-primary">
                        Required
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 h-4 text-muted-foreground"
                      >
                        Optional
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {dt.description}
                  </p>
                </div>
              </div>

              {uploaded ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-card p-2">
                  <FileCheck2 className="size-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {uploaded.filename}
                    </p>
                    <p className="text-[10px] text-muted-foreground tabular">
                      {fmtBytes(uploaded.size)} · {fmtDate(uploaded.uploaded_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(dt)}
                    aria-label={`Remove ${dt.label}`}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <label
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed cursor-pointer",
                    "px-3 py-5 transition-all hover:border-primary/40 hover:bg-primary/5",
                    isUploading && "opacity-60 pointer-events-none"
                  )}
                >
                  <input
                    ref={(el) => {
                      fileInputRefs.current[dt.type] = el;
                    }}
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileSelect(dt, e.target.files?.[0] ?? null)
                    }
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <UploadCloud className="size-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium">
                    {isUploading ? "Uploading…" : "Click to upload"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    PDF, JPG, PNG — up to 10 MB
                  </span>
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Step 7 — Review
// ============================================================

function StepReview({
  form,
  isCompany,
}: {
  form: FormState;
  isCompany: boolean;
}) {
  // Build a pseudo-submission object to reuse SubmissionSummary
  const submission = {
    ...form,
    documents: form.documents || [],
  } as KycSubmission;
  return (
    <div className="space-y-5">
      <SectionIntro
        icon={ShieldCheck}
        title="Review & Submit"
        description="Please review all information below. You can return to any step to make changes before submitting."
      />
      <SubmissionSummary submission={submission} />
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <ShieldCheck className="size-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-foreground/80 leading-relaxed">
          {isCompany
            ? "Once submitted, our compliance team will verify your company information and uploaded documents."
            : "Once submitted, our compliance team will verify your personal information and uploaded documents."}{" "}
          You will receive a response within 2–3 business days.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Success state — after submission
// ============================================================

function SuccessState({ submission }: { submission: KycSubmission }) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-emerald-300/40 shadow-soft-lg overflow-hidden">
        <div className="relative bg-gradient-to-br from-emerald-50 via-card to-card dark:from-emerald-500/10 dark:via-card dark:to-card">
          <div className="absolute inset-0 bg-mesh-portal opacity-60 pointer-events-none" />
          <CardContent className="relative p-8 sm:p-10 flex flex-col items-center text-center">
            <div className="size-16 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-soft-md mb-5">
              <CheckCircle2 className="size-8" />
            </div>
            <Badge className="mb-4 border-transparent bg-emerald-600 text-white gap-1.5">
              <CheckCircle2 className="size-3" /> Submitted
            </Badge>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight max-w-lg">
              Your KYC submission is under review.
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">
              We&apos;ll notify you within 2–3 business days. You can track the
              status of your submission here at any time.
            </p>
            {submission.submitted_at && (
              <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                Submitted {fmtDateTime(submission.submitted_at)}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
      <div className="mt-4 text-center">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh status
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Shared field components
// ============================================================

function SectionIntro({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldText({
  label,
  required,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
  disabled,
}: {
  label: string;
  required?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "date";
  mono?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3.5" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("h-10", mono && "font-mono tabular")}
      />
    </div>
  );
}

function FieldTextarea({
  label,
  required,
  icon: Icon,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  required?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3.5" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="resize-y"
      />
    </div>
  );
}

function FieldSelect({
  label,
  required,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  required?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3.5" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder={placeholder || "Select…"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

function docTypeLabel(type: KycDocumentType): string {
  return (
    DOC_TYPES.find((d) => d.type === type)?.label ?? type.replace(/_/g, " ")
  );
}

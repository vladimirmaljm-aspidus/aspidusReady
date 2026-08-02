"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldCheck, ShieldAlert, ShieldX, QrCode, ScanLine, FileSearch, Search,
  CheckCircle2, XCircle, Fingerprint, Upload, FileWarning, Hash, Loader2,
  ClipboardCopy, Calendar, Activity, Globe, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { fmtDate, fmtDateTime, fmtBytes, fmtRelative } from "@/lib/utils/format";
import { DocumentVerification, Offer, Invoice, Proforma } from "@/lib/supabase/types";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";

type DocType = "offer" | "invoice" | "proforma";

const DOC_TYPE_LABELS: Record<DocType, string> = {
  offer: "Offer", invoice: "Invoice", proforma: "Proforma",
};

const STATUS_LABELS: Record<DocumentVerification["status"], string> = {
  active: "Active", revoked: "Revoked", superseded: "Superseded",
};

const STATUS_BADGE: Record<DocumentVerification["status"], string> = {
  active: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  revoked: "bg-destructive/10 text-destructive border-destructive/30",
  superseded: "bg-chart-3/15 text-chart-3 border-chart-3/30",
};

// ============================================================
// Main view
// ============================================================
export function DocumentVerificationView() {
  const [tab, setTab] = useState("by-code");

  return (
    <div>
      <PageHeader
        title="Document Verification"
        description="Verify document authenticity and check for modifications."
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="by-code" className="text-xs sm:text-sm">
            <ScanLine className="size-3.5 mr-1.5" /> Verify by Code
          </TabsTrigger>
          <TabsTrigger value="by-doc" className="text-xs sm:text-sm">
            <FileSearch className="size-3.5 mr-1.5" /> Verify by Document
          </TabsTrigger>
          <TabsTrigger value="forensic" className="text-xs sm:text-sm">
            <Fingerprint className="size-3.5 mr-1.5" /> Forensic Check
          </TabsTrigger>
        </TabsList>

        <TabsContent value="by-code">
          <VerifyByCodeTab />
        </TabsContent>

        <TabsContent value="by-doc">
          <VerifyByDocTab />
        </TabsContent>

        <TabsContent value="forensic">
          <ForensicTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Tab 1: Verify by code
// ============================================================
interface VerifyResult {
  valid: boolean;
  result: "valid" | "invalid" | "revoked" | "superseded" | "modified";
  message: string;
  document_type?: DocType;
  document_number?: string;
  issued_at?: string;
  verification_count?: number;
  last_verified_at?: string;
}

function VerifyByCodeTab() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["verify-code", tenantKey, submittedCode],
    queryFn: async () => {
      const r = await fetch(api(`/api/verify/${submittedCode}`));
      const json = await r.json();
      if (!r.ok && !json.result) throw new Error("Verification failed");
      return json as VerifyResult;
    },
    enabled: !!submittedCode,
  });

  function handleVerify() {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Enter a verification code.");
      return;
    }
    setSubmittedCode(trimmed);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Input panel */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ScanLine className="size-4 text-primary" /> Code lookup
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the verification code printed on the document or embedded in its QR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs">Verification code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="e.g. ASP-OF-2026-0014-AB12"
              className="font-mono"
              autoCapitalize="characters"
            />
            <p className="text-[11px] text-muted-foreground">
              Codes are case-insensitive. They appear on the bottom of every issued PDF.
            </p>
          </div>
          <Button onClick={handleVerify} disabled={isLoading || isFetching} className="w-full">
            {(isLoading || isFetching) ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <Search className="size-4 mr-1" />
            )}
            Verify document
          </Button>
        </CardContent>
      </Card>

      {/* Result panel */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Result</CardTitle>
          <CardDescription className="text-xs">
            {submittedCode ? `Code: ${submittedCode}` : "Awaiting input."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submittedCode ? (
            <EmptyState
              icon={<ShieldCheck className="size-6" />}
              title="No verification submitted"
              description="Enter a code on the left to verify a document."
            />
          ) : isLoading || isFetching ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : data ? (
            <VerifyResultView result={data} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function VerifyResultView({ result }: { result: VerifyResult }) {
  if (result.valid) {
    return (
      <div className="space-y-4">
        <Alert className="border-chart-1/30 bg-chart-1/5">
          <CheckCircle2 className="size-4 text-chart-1" />
          <AlertTitle className="text-chart-1">Authentic document</AlertTitle>
          <AlertDescription className="text-sm">
            {result.message}
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-3">
          <DetailField icon={FileText} label="Document type" value={result.document_type ? DOC_TYPE_LABELS[result.document_type as DocType] : "—"} />
          <DetailField icon={Hash} label="Document number" value={result.document_number || "—"} mono />
          <DetailField icon={Calendar} label="Issued at" value={result.issued_at ? fmtDateTime(result.issued_at) : "—"} />
          <DetailField icon={Activity} label="Verification count" value={String(result.verification_count ?? "—")} mono />
        </div>

        {result.last_verified_at && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Globe className="size-3.5" />
            Last verified <span className="tabular">{fmtRelative(result.last_verified_at)}</span>
          </div>
        )}
      </div>
    );
  }

  // Invalid / revoked / superseded
  return (
    <div className="space-y-4">
      <Alert variant={result.result === "revoked" || result.result === "superseded" ? "default" : "destructive"}
        className={result.result === "invalid" ? "" : "border-chart-3/30 bg-chart-3/5"}>
        <ShieldX className="size-4" />
        <AlertTitle>
          {result.result === "invalid" ? "Invalid verification code"
            : result.result === "revoked" ? "Document revoked"
            : result.result === "superseded" ? "Document superseded"
            : "Verification failed"}
        </AlertTitle>
        <AlertDescription className="text-sm">{result.message}</AlertDescription>
      </Alert>

      {result.document_number && (
        <div className="grid grid-cols-2 gap-3">
          <DetailField icon={FileText} label="Document type" value={result.document_type ? DOC_TYPE_LABELS[result.document_type as DocType] : "—"} />
          <DetailField icon={Hash} label="Document number" value={result.document_number} mono />
          {result.issued_at && <DetailField icon={Calendar} label="Issued at" value={fmtDateTime(result.issued_at)} />}
        </div>
      )}
    </div>
  );
}

function DetailField({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1">
        <Icon className="size-3" /> {label}
      </div>
      <div className={`text-sm font-medium truncate ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

// ============================================================
// Tab 2: Verify by document
// ============================================================
function VerifyByDocTab() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [docType, setDocType] = useState<DocType>("offer");
  const [docId, setDocId] = useState<string>("");

  // Fetch document list based on type
  const docsQuery = useQuery({
    queryKey: ["docs-for-verify", tenantKey, docType],
    queryFn: async () => {
      const endpoint = docType === "offer" ? api("/api/offers") : docType === "invoice" ? api("/api/invoices") : api("/api/proformas");
      const r = await fetch(endpoint);
      if (!r.ok) throw new Error("Failed to load documents");
      const data = await r.json();
      return (data.items || []) as Array<Offer | Invoice | Proforma>;
    },
  });

  const verQuery = useQuery({
    queryKey: ["doc-verify-by-doc", tenantKey, docType, docId],
    queryFn: async () => {
      const r = await fetch(api(`/api/document-verify/by-doc?doc_type=${docType}&doc_id=${docId}`));
      if (!r.ok) throw new Error("Lookup failed");
      const data = await r.json();
      return data as { verification: DocumentVerification | null };
    },
    enabled: !!docId,
  });

  const docs = docsQuery.data || [];
  const verification = verQuery.data?.verification || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Selection */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSearch className="size-4 text-primary" /> Document lookup
          </CardTitle>
          <CardDescription className="text-xs">
            Select a document to view its verification record and QR code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Document type</Label>
            <Select value={docType} onValueChange={(v) => { setDocType(v as DocType); setDocId(""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="proforma">Proforma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Document</Label>
            {docsQuery.isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : docs.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">No {DOC_TYPE_LABELS[docType].toLowerCase()}s found.</div>
            ) : (
              <Select value={docId} onValueChange={setDocId}>
                <SelectTrigger><SelectValue placeholder="Select a document…" /></SelectTrigger>
                <SelectContent>
                  {docs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <span className="font-mono">{d.number}</span> · {d.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification record */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Verification record</CardTitle>
          <CardDescription className="text-xs">
            {!docId ? "Select a document to view its record." : verQuery.isLoading ? "Loading…" : verification ? "Verification metadata" : "No verification record exists for this document."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!docId ? (
            <EmptyState
              icon={<QrCode className="size-6" />}
              title="Nothing selected"
              description="Pick a document to inspect its verification."
            />
          ) : verQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !verification ? (
            <EmptyState
              icon={<ShieldAlert className="size-6" />}
              title="No verification issued"
              description="This document has not been registered for verification. Issue a verified PDF to enable QR verification."
            />
          ) : (
            <VerificationRecordView v={verification} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VerificationRecordView({ v }: { v: DocumentVerification }) {
  const code = v.verification_code;
  return (
    <div className="space-y-4">
      {/* QR placeholder */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="size-32 shrink-0 rounded-xl border-2 border-foreground/80 bg-card flex items-center justify-center p-3 relative">
          <div className="absolute inset-2 grid grid-cols-7 grid-rows-7 gap-0.5">
            {Array.from({ length: 49 }).map((_, i) => {
              const row = Math.floor(i / 7);
              const col = i % 7;
              // pseudo-random pattern from code hash (deterministic)
              const filled = (code.charCodeAt((row * 7 + col) % code.length) + row + col) % 3 !== 0;
              const corner = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
              return (
                <div
                  key={i}
                  className={filled || corner ? "bg-foreground" : "bg-transparent"}
                />
              );
            })}
          </div>
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Verification code</div>
          <div className="font-mono text-sm font-semibold break-all bg-muted/40 rounded-md p-2 border border-border/60">
            {code}
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-1.5">
            <ScanLine className="size-3" /> Scan with camera to verify
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <DetailField icon={FileText} label="Document type" value={DOC_TYPE_LABELS[v.document_type]} />
        <DetailField icon={Hash} label="Document number" value={v.document_number} mono />
        <DetailField icon={Calendar} label="Issued at" value={fmtDateTime(v.issued_at)} />
        <DetailField icon={Activity} label="Verification count" value={String(v.verification_count)} mono />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Stored PDF hash (SHA-256)</Label>
        <div className="font-mono text-[10px] break-all bg-muted/40 rounded-md p-2 border border-border/60">
          {v.pdf_hash}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={STATUS_BADGE[v.status]}>
            {STATUS_LABELS[v.status]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            PDF size <span className="tabular">{fmtBytes(v.pdf_size)}</span>
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            toast.success("Code copied to clipboard.");
          }}
        >
          <ClipboardCopy className="size-3.5 mr-1" /> Copy code
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 3: Forensic check
// ============================================================
interface ForensicResult {
  match: boolean;
  result: "valid" | "modified" | "invalid";
  message: string;
  document_number?: string;
  document_type?: DocType;
  issued_at?: string;
  stored_hash?: string;
  computed_hash?: string;
  pdf_size?: number;
}

function ForensicTab() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();

  const [code, setCode] = useState("");
  const [hash, setHash] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleFile(file: File) {
    setFileName(file.name);
    setComputing(true);
    setHash("");
    try {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", buffer);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setHash(`sha256:${hex}`);
      toast.success(`SHA-256 computed for ${file.name}.`);
    } catch {
      toast.error("Failed to hash file.");
    } finally {
      setComputing(false);
    }
  }

  async function handleCheck() {
    if (!code.trim()) {
      toast.error("Enter the verification code.");
      return;
    }
    if (!hash.trim()) {
      toast.error("Provide a hash by uploading a PDF or pasting a hash.");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const r = await fetch(api("/api/document-verify/forensic"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verification_code: code.trim(),
          pdf_hash: hash.trim().startsWith("sha256:") ? hash.trim() : `sha256:${hash.trim()}`,
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Forensic check failed");
      setResult(json as ForensicResult);
      if (json.match) toast.success("PDF is authentic.");
      else toast.error("PDF has been modified.");
    } catch (e: any) {
      toast.error(e.message || "Forensic check failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Input */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Fingerprint className="size-4 text-primary" /> Forensic check
          </CardTitle>
          <CardDescription className="text-xs">
            Compare a PDF against the original hash stored at issuance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fcode" className="text-xs">Verification code</Label>
            <Input
              id="fcode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ASP-OF-2026-0014-AB12"
              className="font-mono"
              autoCapitalize="characters"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Upload className="size-3.5" /> Upload PDF to hash
            </Label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 px-4 py-6 cursor-pointer hover:border-primary/40 hover:bg-muted/40 transition-colors">
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <Upload className="size-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {fileName ? (
                  <>Selected: <span className="font-medium text-foreground">{fileName}</span></>
                ) : (
                  "Click to choose a PDF (max ~20MB)"
                )}
              </span>
            </label>
            {computing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Computing SHA-256…
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fhash" className="text-xs flex items-center gap-1.5">
              <Hash className="size-3.5" /> Or paste hash directly
            </Label>
            <Textarea
              id="fhash"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              rows={3}
              placeholder="sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4…"
              className="font-mono text-xs"
            />
          </div>

          <Button onClick={handleCheck} disabled={submitting || computing} className="w-full">
            {submitting ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Fingerprint className="size-4 mr-1" />}
            Run forensic check
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      <Card className="border-border/60 shadow-soft rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Comparison result</CardTitle>
          <CardDescription className="text-xs">
            {!result ? "Awaiting forensic check." : result.match ? "PDF is authentic." : "PDF differs from original."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!result ? (
            <EmptyState
              icon={<Fingerprint className="size-6" />}
              title="No check run yet"
              description="Provide a verification code and a PDF (or hash) to compare against the original."
            />
          ) : (
            <ForensicResultView result={result} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ForensicResultView({ result }: { result: ForensicResult }) {
  if (result.result === "invalid") {
    return (
      <Alert variant="destructive">
        <ShieldX className="size-4" />
        <AlertTitle>Verification code not found</AlertTitle>
        <AlertDescription className="text-sm">{result.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert
        variant={result.match ? "default" : "destructive"}
        className={result.match ? "border-chart-1/30 bg-chart-1/5" : ""}
      >
        {result.match ? <CheckCircle2 className="size-4 text-chart-1" /> : <FileWarning className="size-4" />}
        <AlertTitle className={result.match ? "text-chart-1" : ""}>
          {result.match ? "Authentic — no modifications" : "Modified after issuance"}
        </AlertTitle>
        <AlertDescription className="text-sm">{result.message}</AlertDescription>
      </Alert>

      {result.document_number && (
        <div className="grid grid-cols-2 gap-3">
          <DetailField icon={FileText} label="Document type" value={result.document_type ? DOC_TYPE_LABELS[result.document_type] : "—"} />
          <DetailField icon={Hash} label="Document number" value={result.document_number} mono />
          {result.issued_at && <DetailField icon={Calendar} label="Issued at" value={fmtDateTime(result.issued_at)} />}
          {result.pdf_size != null && <DetailField icon={Activity} label="Original size" value={fmtBytes(result.pdf_size)} mono />}
        </div>
      )}

      {result.stored_hash && result.computed_hash && (
        <div className="space-y-3">
          <HashRow label="Stored hash (original)" value={result.stored_hash} match={result.match} />
          <HashRow label="Computed hash (uploaded)" value={result.computed_hash} match={result.match} />
          <div className={`text-xs flex items-center gap-2 ${result.match ? "text-chart-1" : "text-destructive"}`}>
            {result.match ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            <span className="font-medium">
              {result.match ? "Hashes match exactly." : "Hashes differ — the PDF was modified or is not the originally issued file."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function HashRow({ label, value, match }: { label: string; value: string; match: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {match ? (
          <Badge variant="outline" className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/30">match</Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">differ</Badge>
        )}
      </div>
      <div className="font-mono text-[10px] break-all bg-muted/40 rounded-md p-2 border border-border/60">
        {value}
      </div>
    </div>
  );
}

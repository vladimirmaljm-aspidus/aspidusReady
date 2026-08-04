import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { buildPdfDocument } from "./templates";
import { generateQrCodeDataUrl, generateVerificationCode, computePdfHash } from "./qr";
import { getStore } from "@/lib/data/store";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Offer, Invoice, Proforma, Partner, Tenant, DocumentTemplate } from "@/lib/supabase/types";

export interface GeneratePdfOptions {
  docType: "offer" | "invoice" | "proforma";
  docId: string;
  tenantId: string;
  createVerification?: boolean; // if true, creates a verification record with QR + hash
}

export interface GeneratePdfResult {
  buffer: Buffer;
  verificationCode?: string;
  pdfHash?: string;
  verificationId?: string;
}

/**
 * Resolve the tenant logo URL into a form that @react-pdf/renderer can fetch.
 *
 * Cases handled:
 *  1. null / undefined → null
 *  2. Full public URL (http…) → try to get a signed URL (works for private buckets);
 *     fall back to the original URL if signing fails.
 *  3. Relative storage path (e.g. "tenant-id/logo.png") → build a signed URL;
 *     fall back to constructing the public URL from SUPABASE_URL.
 */
async function resolveLogoUrl(logoUrl: string | null | undefined): Promise<string | null> {
  if (!logoUrl) return null;

  // If Supabase is not configured, return the URL as-is (dev/mock mode)
  if (!isSupabaseConfigured()) return logoUrl;

  try {
    const sb = getSupabase();
    const supabaseUrl = process.env.SUPABASE_URL || "";

    // Determine the storage path inside the "tenant-logos" bucket
    let storagePath: string | null = null;

    if (logoUrl.startsWith("http")) {
      // Full URL — extract the path after the bucket segment
      // Public URL format: https://{ref}.supabase.co/storage/v1/object/public/tenant-logos/{path}
      // Signed URL format: https://{ref}.supabase.co/storage/v1/object/sign/tenant-logos/{path}?token=...
      const publicPrefix = `/storage/v1/object/public/tenant-logos/`;
      const signedPrefix = `/storage/v1/object/sign/tenant-logos/`;
      const idx1 = logoUrl.indexOf(publicPrefix);
      const idx2 = logoUrl.indexOf(signedPrefix);

      if (idx1 !== -1) {
        storagePath = decodeURIComponent(logoUrl.substring(idx1 + publicPrefix.length)).split("?")[0];
      } else if (idx2 !== -1) {
        storagePath = decodeURIComponent(logoUrl.substring(idx2 + signedPrefix.length)).split("?")[0];
      } else {
        // Not a Supabase storage URL — return as-is (could be an external logo)
        return logoUrl;
      }
    } else {
      // Relative path — e.g. "tenant-id/logo.png"
      storagePath = logoUrl;
    }

    if (storagePath) {
      // Try to get a signed URL (works for both public and private buckets)
      const { data, error } = await sb.storage
        .from("tenant-logos")
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }

      // Fallback: construct the public URL manually
      console.warn(`[PDF] Signed URL failed for logo path "${storagePath}": ${error?.message}. Falling back to public URL.`);
      return `${supabaseUrl}/storage/v1/object/public/tenant-logos/${storagePath}`;
    }
  } catch (err) {
    console.warn("[PDF] Error resolving logo URL:", err);
  }

  // Last resort — return the original URL
  return logoUrl;
}

export async function generatePdf(opts: GeneratePdfOptions): Promise<GeneratePdfResult> {
  const store = await getStore();

  // Fetch the document
  let doc: Offer | Invoice | Proforma | null = null;
  if (opts.docType === "offer") doc = await store.getOffer(opts.docId);
  else if (opts.docType === "invoice") doc = await store.getInvoice(opts.docId);
  else if (opts.docType === "proforma") doc = await store.getProforma(opts.docId);

  if (!doc) throw new Error(`${opts.docType} not found`);

  // Fetch partner + tenant + template
  const partner = doc.partner_id ? await store.getPartner(doc.partner_id) : null;
  const tenant = await store.getTenant(opts.tenantId);
  const template = await store.getDefaultDocumentTemplate(opts.tenantId, opts.docType);

  // Handle verification
  let verificationCode: string | undefined;
  let qrCodeDataUrl: string | undefined;
  let pdfHash: string | undefined;
  let verificationId: string | undefined;

  if (opts.createVerification !== false) {
    // Check if verification already exists
    const existing = await store.getDocumentVerificationByDoc(opts.tenantId, opts.docType, opts.docId);
    if (existing && existing.status === "active") {
      verificationCode = existing.verification_code;
      verificationId = existing.id;
    } else {
      verificationCode = generateVerificationCode(opts.docType, doc.number);
    }
    qrCodeDataUrl = await generateQrCodeDataUrl(verificationCode);
  } else {
    // Even when NOT creating a new verification (portal-side PDF re-download),
    // if the admin already issued a verification for this document, we STILL
    // render its QR so scans keep working. Portal never creates a verification
    // but shouldn't strip an existing one either.
    const existing = await store.getDocumentVerificationByDoc(opts.tenantId, opts.docType, opts.docId);
    if (existing && existing.status === "active") {
      verificationCode = existing.verification_code;
      verificationId = existing.id;
      qrCodeDataUrl = await generateQrCodeDataUrl(verificationCode);
    }
  }

  // Resolve the logo URL so @react-pdf/renderer can fetch it
  const resolvedLogoUrl = await resolveLogoUrl(tenant?.logo_url);

  // Build PDF metadata (visible in the PDF document properties dialog)
  const docTitleLabel = opts.docType === "offer" ? "Offer" : opts.docType === "invoice" ? "Invoice" : "Proforma";
  const pdfMeta = {
    title: `${docTitleLabel} ${doc.number} — ${tenant?.name || "Aspidus"}`,
    author: tenant?.name || "Aspidus CRM",
    subject: `${docTitleLabel} issued to ${partner?.name || "client"} on ${new Date().toLocaleDateString("en-US")}`,
    creator: "Aspidus CRM System",
    keywords: [opts.docType, doc.number, partner?.name, doc.currency, verificationCode].filter(Boolean).join(", "),
  };

  // Build + render the PDF
  const element = React.createElement(buildPdfDocument, {
    doc,
    docType: opts.docType,
    partner,
    tenant,
    template,
    verificationCode,
    qrCodeDataUrl,
    logoUrl: resolvedLogoUrl,
    pdfMeta,
  });
  const buffer = await renderToBuffer(element as any);

  // Compute hash + create verification record
  if (opts.createVerification !== false && verificationCode) {
    pdfHash = await computePdfHash(buffer);
    if (!verificationId) {
      const v = await store.createDocumentVerification({
        tenant_id: opts.tenantId,
        document_type: opts.docType,
        document_id: opts.docId,
        document_number: doc.number,
        verification_code: verificationCode,
        pdf_hash: pdfHash,
        pdf_size: buffer.length,
        issued_to_partner_id: doc.partner_id,
        issued_at: new Date().toISOString(),
      });
      verificationId = v.id;
    }
  }

  // ── Auto-register in Document Register ───────────────────────────────
  // Every issued document (offer/invoice/proforma) must be recorded in the
  // document register with a sequential number so the firm has a complete
  // audit trail of all outbound documents. This is idempotent — if an entry
  // with the same reference_id + version already exists, we skip.
  try {
    const existing = await store.listDocumentRegister(opts.tenantId, {
      limit: 1000,
      filters: { reference_id: opts.docId },
    });
    const alreadyRegistered = existing.items.some(
      (e) => e.reference_id === opts.docId && e.type === opts.docType
    );
    if (!alreadyRegistered) {
      // Determine the next version number for this document
      const versions = existing.items.filter(
        (e) => e.reference_id === opts.docId && e.type === opts.docType
      );
      const nextVersion = versions.length + 1;

      await store.upsertDocumentRegisterEntry({
        tenant_id: opts.tenantId,
        number: `${doc.number}-V${nextVersion}`,
        type: opts.docType as any,
        version: nextVersion,
        reference_id: opts.docId,
        partner_id: doc.partner_id,
        title: `${docTitleLabel} ${doc.number}`,
        status: "current",
        created_by: null,
        metadata: {
          verification_code: verificationCode,
          verification_id: verificationId,
          pdf_hash: pdfHash,
          pdf_size: buffer.length,
          currency: doc.currency,
          total: doc.total,
          partner_name: partner?.name,
          generated_at: new Date().toISOString(),
        },
      } as any);
    }
  } catch (regErr) {
    // Don't fail the PDF generation if the register write fails — log it.
    console.error("[pdf.generator] Document register write failed:", regErr);
  }

  return { buffer, verificationCode, pdfHash, verificationId };
}

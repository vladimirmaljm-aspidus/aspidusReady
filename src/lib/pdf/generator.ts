import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { buildPdfDocument } from "./templates";
import { generateQrCodeDataUrl, generateVerificationCode, computePdfHash } from "./qr";
import { getStore } from "@/lib/data/store";
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
  }

  // Build + render the PDF
  const element = React.createElement(buildPdfDocument, {
    doc,
    docType: opts.docType,
    partner,
    tenant,
    template,
    verificationCode,
    qrCodeDataUrl,
    logoUrl: tenant?.logo_url,
  });
  const buffer = await renderToBuffer(element);

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

  return { buffer, verificationCode, pdfHash, verificationId };
}

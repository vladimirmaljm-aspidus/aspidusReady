import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font, Link } from "@react-pdf/renderer";
import type { Offer, Invoice, Proforma, OfferLineItem, Partner, Tenant, DocumentTemplate } from "@/lib/supabase/types";

Font.registerHyphenationCallback((word) => [word]);

interface PdfDocData {
  doc: Offer | Invoice | Proforma;
  docType: "offer" | "invoice" | "proforma";
  partner: Partner | null;
  tenant: Tenant | null;
  template: DocumentTemplate | null;
  verificationCode?: string;
  qrCodeDataUrl?: string;
  logoUrl?: string | null;
  /** Optional metadata for PDF properties (Author, Title, Subject, etc.) */
  pdfMeta?: {
    author?: string;
    title?: string;
    subject?: string;
    creator?: string;
    keywords?: string;
  };
}

const mmToPoints = (mm: number) => mm * 2.83465;

/**
 * Format a money value with exactly 2 decimal places.
 * Falls back to 0.00 when the value is null/undefined/NaN.
 * Uses the document's currency symbol when available.
 */
function fmtMoney(n: number | null | undefined, currency = "USD"): string {
  const v = typeof n === "number" && isFinite(n) ? n : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    // Fallback if currency code is invalid
    return `${v.toFixed(2)} ${currency}`;
  }
}

export function buildPdfDocument({ doc, docType, partner, tenant, template, verificationCode, qrCodeDataUrl, logoUrl, pdfMeta }: PdfDocData) {
  const tpl = template;
  const primaryColor = tpl?.primary_color || "#0d9488";
  const fontSize = tpl?.body_font_size || 10;
  const lineHeight = tpl?.body_line_height || 1.4;
  const marginTop = mmToPoints(tpl?.page_margin_top ?? 25);
  const marginBottom = mmToPoints(tpl?.page_margin_bottom ?? 25);
  const marginLeft = mmToPoints(tpl?.page_margin_left ?? 18);
  const marginRight = mmToPoints(tpl?.page_margin_right ?? 18);
  const tableHeaderBg = tpl?.table_header_bg || primaryColor;
  const tableHeaderColor = tpl?.table_header_color || "#ffffff";
  const tableBorderColor = tpl?.table_border_color || "#e5e7eb";

  // Resolve font family — default Helvetica. Templates can specify a custom
  // font family name that has been registered via Font.register.
  const fontFamily = tpl?.body_font_family || "Helvetica";
  const headingFontFamily = tpl?.heading_font_family || "Helvetica-Bold";

  const styles = StyleSheet.create({
    page: {
      fontSize,
      lineHeight,
      paddingTop: marginTop,
      paddingBottom: marginBottom + 30, // reserve space for footer
      paddingLeft: marginLeft,
      paddingRight: marginRight,
      fontFamily,
      color: "#1a1a1a",
    },

    // ── Header (repeats on every page via fixed positioning) ────────────
    header: {
      position: "absolute",
      top: mmToPoints(8),
      left: marginLeft,
      right: marginLeft,
      flexDirection: "row",
      justifyContent: "space-between",
      // Align to bottom so company name baseline matches the logo bottom edge
      alignItems: "flex-end",
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
    },
    headerLeft: { flexDirection: "column", flex: 1, paddingBottom: 2 },
    companyName: { fontSize: 15, fontFamily: headingFontFamily, color: primaryColor, marginBottom: 0 },
    companyTagline: { fontSize: 7.5, color: "#888", marginTop: 1 },
    headerRight: { flexDirection: "column", alignItems: "flex-end", gap: 0 },
    headerLogo: { width: 110, height: 42, objectFit: "contain" },

    // ── QR code (bottom-left corner, doesn't overlap with content) ─────
    qrSection: {
      position: "absolute",
      bottom: mmToPoints(8),
      left: marginLeft,
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
    },
    qrImage: { width: 50, height: 50 },
    qrLabel: { fontSize: 6, color: "#999", textAlign: "center" },

    // ── Document title + metadata ──────────────────────────────────────
    docHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 18,
      marginTop: 10,
    },
    docTitle: { fontSize: 20, fontFamily: headingFontFamily, color: "#1a1a1a", textTransform: "uppercase" },
    docSubtitle: { fontSize: 9, color: "#999", marginTop: 2 },
    docMeta: { flexDirection: "column", alignItems: "flex-end" },
    docMetaRow: { flexDirection: "row", marginBottom: 2 },
    docMetaLabel: { fontSize: 9, color: "#999", marginRight: 4 },
    docMetaValue: { fontSize: 9, fontFamily: headingFontFamily, color: "#333" },

    // ── Bill To / Ship To ──────────────────────────────────────────────
    partiesSection: { flexDirection: "row", gap: 10, marginBottom: 18 },
    partyBox: { flex: 1, borderWidth: 1, borderColor: tableBorderColor, borderRadius: 4 },
    partyHeader: { backgroundColor: "#f7f7f7", padding: 6, borderBottomWidth: 1, borderBottomColor: tableBorderColor },
    partyHeaderText: { fontSize: 8.5, fontFamily: headingFontFamily, color: "#555", textTransform: "uppercase" },
    partyBody: { padding: 8 },
    partyName: { fontSize: 10, fontFamily: headingFontFamily, color: "#1a1a1a", marginBottom: 3 },
    partyAddr: { fontSize: 8, color: "#666", lineHeight: 1.4 },

    // ── Product info grid ──────────────────────────────────────────────
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 0,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: tableBorderColor,
      borderRadius: 4,
    },
    infoCell: {
      width: "33.33%",
      padding: 7,
      borderRightWidth: 0.5,
      borderRightColor: tableBorderColor,
      borderBottomWidth: 0.5,
      borderBottomColor: tableBorderColor,
    },
    infoLabel: { fontSize: 7, color: "#999", textTransform: "uppercase", marginBottom: 2 },
    infoValue: { fontSize: 9, fontFamily: headingFontFamily, color: "#333" },
    infoValueRed: { fontSize: 9, fontFamily: headingFontFamily, color: "#cc0000" },

    // ── Description box ────────────────────────────────────────────────
    descBox: { borderWidth: 1, borderColor: tableBorderColor, borderRadius: 4, marginBottom: 18 },
    descHeader: { backgroundColor: "#f7f7f7", padding: 6, borderBottomWidth: 1, borderBottomColor: tableBorderColor },
    descHeaderText: { fontSize: 8.5, fontFamily: headingFontFamily, color: "#555", textTransform: "uppercase" },
    descBody: { padding: 8 },
    descText: { fontSize: 8, color: "#555", lineHeight: 1.5 },

    // ── Table (line items) — uses flex widths that fit A4 with margins ─
    table: { marginBottom: 10, borderWidth: 1, borderColor: tableBorderColor, borderRadius: 4, overflow: "hidden" },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: tableHeaderBg,
      paddingVertical: 8,
    },
    th: { fontSize: 8.5, fontFamily: headingFontFamily, color: tableHeaderColor, paddingHorizontal: 6 },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 7,
      borderBottomWidth: 0.5,
      borderBottomColor: tableBorderColor,
      alignItems: "stretch",
    },
    td: { fontSize: 9, paddingHorizontal: 6, color: "#333" },

    // ── Totals ─────────────────────────────────────────────────────────
    totals: { marginTop: 12, alignSelf: "flex-end", width: 220 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
    totalLabel: { fontSize: 9, color: "#666" },
    totalValue: { fontSize: 9, fontFamily: headingFontFamily, color: "#333" },
    grandTotal: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      marginTop: 6,
      borderTopWidth: 2,
      borderTopColor: primaryColor,
    },
    grandTotalLabel: { fontSize: 11, fontFamily: headingFontFamily, color: primaryColor },
    grandTotalValue: { fontSize: 14, fontFamily: headingFontFamily, color: primaryColor },

    // ── Remarks ────────────────────────────────────────────────────────
    remarks: { marginTop: 18 },
    remarksHeader: { fontSize: 9, fontFamily: headingFontFamily, color: "#333", marginBottom: 4, textDecoration: "underline" },
    remarksText: { fontSize: 8, color: "#666", lineHeight: 1.5 },

    // ── Footer (repeats on every page via fixed positioning) ───────────
    footer: {
      position: "absolute",
      bottom: mmToPoints(8),
      left: marginLeft,
      right: marginRight,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: tableBorderColor,
    },
    footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 },
    footerLeft: { flexDirection: "column", flex: 1 },
    footerRight: { flexDirection: "column", alignItems: "flex-end" },
    footerCompany: { fontSize: 8, fontFamily: headingFontFamily, color: "#555", marginBottom: 1 },
    footerAddr: { fontSize: 7, color: "#888" },
    footerContact: { fontSize: 7, color: "#888" },
    footerHash: { fontSize: 7, fontFamily: headingFontFamily, color: primaryColor, marginBottom: 2 },
    footerPage: { fontSize: 8, color: "#666", fontFamily: headingFontFamily },
    footerSys: { fontSize: 6.5, color: "#bbb", fontStyle: "italic", marginTop: 2, textAlign: "right" },
  });

  const docTitleMap = { offer: "Offer", invoice: "Invoice", proforma: "Proforma Invoice" };
  const items = (doc.items || []) as OfferLineItem[];
  const currency = doc.currency || "USD";

  // Build the footer content (shared across all pages)
  const FooterContent = () => (
    <View style={styles.footer} fixed>
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerCompany}>
            {tenant?.legal_name || tenant?.name || "Company"}
          </Text>
          {tenant?.address_line && (
            <Text style={styles.footerAddr}>
              {tenant.address_line}
              {tenant?.city ? `, ${tenant.city}` : ""}
              {tenant?.country ? `, ${tenant.country}` : ""}
            </Text>
          )}
          <Text style={styles.footerContact}>
            {[
              tenant?.email || (tenant as any)?.contact_email,
              tenant?.website,
              tenant?.phone || (tenant as any)?.contact_phone,
            ].filter(Boolean).join("  ·  ")}
          </Text>
        </View>
        <View style={styles.footerRight}>
          {verificationCode && (
            <Text style={styles.footerHash}>Verification: {verificationCode}</Text>
          )}
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <Text style={styles.footerSys}>
            Generated by {(pdfMeta?.creator || "Aspidus CRM")} · {new Date().toLocaleString("en-GB")}
          </Text>
        </View>
      </View>
    </View>
  );

  // Build the header content (shared across all pages)
  const HeaderContent = () => (
    <View style={styles.header} fixed>
      <View style={styles.headerLeft}>
        <Text style={styles.companyName}>
          {tenant?.legal_name || tenant?.name || "Company"}
        </Text>
        {tenant?.website && (
          <Text style={styles.companyTagline}>{tenant.website}</Text>
        )}
      </View>
      <View style={styles.headerRight}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {logoUrl && <Image style={styles.headerLogo} src={logoUrl} />}
      </View>
    </View>
  );

  return (
    <Document
      title={pdfMeta?.title || `${docTitleMap[docType]} ${doc.number}`}
      author={pdfMeta?.author || tenant?.name || "Aspidus CRM"}
      subject={pdfMeta?.subject || `${docTitleMap[docType]} for ${partner?.name || "client"}`}
      creator={pdfMeta?.creator || "Aspidus CRM System"}
      keywords={pdfMeta?.keywords || `${docType}, ${doc.number}, ${partner?.name || ""}, ${currency}`}
      producer="Aspidus CRM"
    >
      <Page size="A4" style={styles.page}>
        <HeaderContent />

        {/* Document title — separate row, full width */}
        <View style={{ marginBottom: 12, marginTop: 10 }}>
          <Text style={styles.docTitle}>{docTitleMap[docType]}</Text>
          {doc.subject && <Text style={styles.docSubtitle}>{doc.subject}</Text>}
        </View>

        {/* Document number + metadata — separate row below title */}
        <View style={[styles.docHeader, { marginBottom: 18 }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>Document No.:</Text>
              <Text style={styles.docMetaValue}>{doc.number}</Text>
            </View>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>Date of Issue:</Text>
              <Text style={styles.docMetaValue}>
                {new Date((doc as any).issue_date || doc.created_at).toLocaleDateString("en-GB")}
              </Text>
            </View>
            {docType === "offer" && (doc as Offer).valid_until && (
              <View style={styles.docMetaRow}>
                <Text style={styles.docMetaLabel}>Valid Until:</Text>
                <Text style={styles.docMetaValue}>
                  {new Date((doc as Offer).valid_until as string).toLocaleDateString("en-GB")}
                </Text>
              </View>
            )}
            {(docType === "invoice" || docType === "proforma") && (doc as any).due_date && (
              <View style={styles.docMetaRow}>
                <Text style={styles.docMetaLabel}>Due Date:</Text>
                <Text style={styles.docMetaValue}>
                  {new Date((doc as any).due_date).toLocaleDateString("en-GB")}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.docMeta}>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>Currency:</Text>
              <Text style={styles.docMetaValue}>{currency}</Text>
            </View>
            {partner?.name && (
              <View style={styles.docMetaRow}>
                <Text style={styles.docMetaLabel}>Issued to:</Text>
                <Text style={styles.docMetaValue}>{partner.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bill To / Ship To */}
        <View style={styles.partiesSection}>
          <View style={styles.partyBox}>
            <View style={styles.partyHeader}>
              <Text style={styles.partyHeaderText}>BILL TO (BUYER)</Text>
            </View>
            <View style={styles.partyBody}>
              <Text style={styles.partyName}>{partner?.name || "—"}</Text>
              {partner?.address_line && <Text style={styles.partyAddr}>{partner.address_line}</Text>}
              <Text style={styles.partyAddr}>
                {[partner?.postal_code, partner?.city, partner?.country].filter(Boolean).join(", ")}
              </Text>
              {partner?.tax_id && <Text style={styles.partyAddr}>Tax ID: {partner.tax_id}</Text>}
              {partner?.vat_number && <Text style={styles.partyAddr}>VAT: {partner.vat_number}</Text>}
              {partner?.email && <Text style={styles.partyAddr}>Email: {partner.email}</Text>}
              {partner?.phone && <Text style={styles.partyAddr}>Phone: {partner.phone}</Text>}
            </View>
          </View>
          <View style={styles.partyBox}>
            <View style={styles.partyHeader}>
              <Text style={styles.partyHeaderText}>SHIP TO (CONSIGNEE)</Text>
            </View>
            <View style={styles.partyBody}>
              <Text style={styles.partyName}>SAME AS BUYER</Text>
              {(doc as any).pod && (
                <Text style={styles.partyAddr}>Port of Discharge: {(doc as any).pod}</Text>
              )}
              {(doc as any).vessel && (
                <Text style={styles.partyAddr}>Vessel: {(doc as any).vessel}</Text>
              )}
              {(doc as any).container_no && (
                <Text style={styles.partyAddr}>Container: {(doc as any).container_no}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Product info grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Product</Text>
            <Text style={styles.infoValue}>{items[0]?.product_name || doc.subject || "—"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>HS Code</Text>
            <Text style={styles.infoValue}>{(items[0] as any)?.hs_code || "N/A"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Origin</Text>
            <Text style={styles.infoValue}>{(items[0] as any)?.origin_country || "Various"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Incoterm</Text>
            <Text style={styles.infoValue}>{(doc as any).incoterm || (items[0] as any)?.incoterm || "EXW"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Packaging</Text>
            <Text style={styles.infoValue}>{(items[0] as any)?.packaging || "Standard"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Payment Terms</Text>
            <Text style={styles.infoValueRed}>{(doc as any).payment_terms || (doc as any).terms || "T/T in Advance"}</Text>
          </View>
        </View>

        {/* Description / Specification */}
        {doc.notes && (
          <View style={styles.descBox}>
            <View style={styles.descHeader}>
              <Text style={styles.descHeaderText}>Description / Specification</Text>
            </View>
            <View style={styles.descBody}>
              <Text style={styles.descText}>{doc.notes}</Text>
            </View>
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 3 }]}>Description</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>HS Code</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Quantity</Text>
            <Text style={[styles.th, { flex: 1.1, textAlign: "right" }]}>Unit Price</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: "right" }]}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow} break={i > 0 && i % 18 === 0}>
              <Text style={[styles.td, { flex: 3 }]}>
                {item.product_name}
                {item.sku ? `\nSKU: ${item.sku}` : ""}
              </Text>
              <Text style={[styles.td, { flex: 0.8 }]}>{(item as any).hs_code || "—"}</Text>
              <Text style={[styles.td, { flex: 1.2 }]}>
                {item.quantity} {item.unit || "kg"}
              </Text>
              <Text style={[styles.td, { flex: 1.1, textAlign: "right" }]}>
                {fmtMoney(item.unit_price, currency)}
              </Text>
              <Text style={[styles.td, { flex: 1.2, textAlign: "right", fontFamily: headingFontFamily }]}>
                {fmtMoney(item.total, currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{fmtMoney(doc.subtotal, currency)}</Text>
          </View>
          {doc.discount_total > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-{fmtMoney(doc.discount_total, currency)}</Text>
            </View>
          )}
          {doc.tax_total > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{fmtMoney(doc.tax_total, currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{fmtMoney(doc.total, currency)}</Text>
          </View>
        </View>

        {/* Remarks */}
        {(doc as any).terms && (
          <View style={styles.remarks}>
            <Text style={styles.remarksHeader}>REMARKS / NOTES</Text>
            <Text style={styles.remarksText}>
              This {docType} is informational until confirmed. Prices are subject to change without notice. Payment terms as specified above.
              {(doc as any).bank_details ? ` Bank details: ${(doc as any).bank_details}.` : ""}
            </Text>
          </View>
        )}

        {/* QR code — bottom-left corner, positioned absolutely so it never
            overlaps with body content. The page has paddingBottom that
            reserves space below the footer line for it. */}
        {qrCodeDataUrl && verificationCode && (
          <View style={styles.qrSection} fixed>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.qrImage} src={qrCodeDataUrl} />
            <Text style={styles.qrLabel}>Scan to verify</Text>
          </View>
        )}

        <FooterContent />
      </Page>
    </Document>
  );
}

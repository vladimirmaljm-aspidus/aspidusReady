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
}

const mmToPoints = (mm: number) => mm * 2.83465;

export function buildPdfDocument({ doc, docType, partner, tenant, template, verificationCode, qrCodeDataUrl, logoUrl }: PdfDocData) {
  const tpl = template;
  const primaryColor = tpl?.primary_color || "#0d9488";
  const fontSize = tpl?.body_font_size || 10;
  const lineHeight = tpl?.body_line_height || 1.4;
  const marginTop = mmToPoints(tpl?.page_margin_top ?? 20);
  const marginBottom = mmToPoints(tpl?.page_margin_bottom ?? 20);
  const marginLeft = mmToPoints(tpl?.page_margin_left ?? 18);
  const marginRight = mmToPoints(tpl?.page_margin_right ?? 18);
  const tableHeaderBg = tpl?.table_header_bg || primaryColor;
  const tableHeaderColor = tpl?.table_header_color || "#ffffff";
  const tableBorderColor = tpl?.table_border_color || "#e5e7eb";

  const styles = StyleSheet.create({
    page: {
      fontSize,
      lineHeight,
      paddingTop: marginTop,
      paddingBottom: marginBottom + 50, // space for footer
      paddingLeft: marginLeft,
      paddingRight: marginRight,
      fontFamily: "Helvetica",
      color: "#1a1a1a",
    },
    // Header — company name left, logo right, blue line below
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingBottom: 10,
      borderBottomWidth: 2.5,
      borderBottomColor: primaryColor,
      marginBottom: 20,
    },
    headerLeft: { flexDirection: "column" },
    companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: primaryColor, marginBottom: 2 },
    companyAddr: { fontSize: 8, color: "#666" },
    companyContact: { fontSize: 8, color: "#999" },
    headerLogo: { width: 120, height: 50, objectFit: "contain" },

    // Document title + metadata
    docHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
    },
    docTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#1a1a1a", textTransform: "uppercase" },
    docMeta: { flexDirection: "column", alignItems: "flex-end" },
    docMetaRow: { flexDirection: "row", marginBottom: 2 },
    docMetaLabel: { fontSize: 9, color: "#999", marginRight: 4 },
    docMetaValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333" },

    // Bill To / Ship To
    partiesSection: { flexDirection: "row", gap: 10, marginBottom: 20 },
    partyBox: { flex: 1, borderWidth: 1, borderColor: tableBorderColor, borderRadius: 4 },
    partyHeader: { backgroundColor: "#f5f5f5", padding: 6, borderBottomWidth: 1, borderBottomColor: tableBorderColor },
    partyHeaderText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333" },
    partyBody: { padding: 8 },
    partyName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a1a1a", marginBottom: 3 },
    partyAddr: { fontSize: 8, color: "#666", lineHeight: 1.4 },

    // Product info grid
    infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 0, marginBottom: 20, borderWidth: 1, borderColor: tableBorderColor, borderRadius: 4 },
    infoCell: { width: "33.33%", padding: 8, borderRightWidth: 0.5, borderRightColor: tableBorderColor, borderBottomWidth: 0.5, borderBottomColor: tableBorderColor },
    infoLabel: { fontSize: 7.5, color: "#999", textTransform: "uppercase", marginBottom: 2 },
    infoValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333" },
    infoValueRed: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#cc0000" },

    // Description box
    descBox: { borderWidth: 1, borderColor: tableBorderColor, borderRadius: 4, marginBottom: 20 },
    descHeader: { backgroundColor: "#f5f5f5", padding: 6, borderBottomWidth: 1, borderBottomColor: tableBorderColor },
    descHeaderText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333" },
    descBody: { padding: 8 },
    descText: { fontSize: 8, color: "#555", lineHeight: 1.5 },

    // Table
    table: { marginBottom: 10 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: tableHeaderBg,
      paddingVertical: 8,
    },
    th: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: tableHeaderColor, paddingHorizontal: 8 },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: tableBorderColor,
    },
    td: { fontSize: 9, paddingHorizontal: 8, color: "#333" },

    // Totals
    totals: { marginTop: 12, alignSelf: "flex-end", width: 220 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
    totalLabel: { fontSize: 9, color: "#666" },
    totalValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333" },
    grandTotal: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      marginTop: 6,
      borderTopWidth: 2,
      borderTopColor: primaryColor,
    },
    grandTotalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: primaryColor },
    grandTotalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: primaryColor },

    // Remarks
    remarks: { marginTop: 20 },
    remarksHeader: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333", marginBottom: 4, textDecoration: "underline" },
    remarksText: { fontSize: 8, color: "#666", lineHeight: 1.5 },

    // Footer
    footer: {
      position: "absolute",
      bottom: marginBottom,
      left: marginLeft,
      right: marginRight,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: tableBorderColor,
    },
    footerTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    footerHash: { fontSize: 8, fontFamily: "Helvetica-Bold", color: primaryColor },
    footerPage: { fontSize: 8, color: "#999" },
    footerAddr: { fontSize: 7.5, color: "#666", marginBottom: 2 },
    footerSys: { fontSize: 7, color: "#bbb", fontStyle: "italic" },

    // QR code
    qrSection: {
      position: "absolute",
      bottom: marginBottom + 55,
      right: marginRight,
      flexDirection: "row",
      alignItems: "center",
    },
    qrImage: { width: 45, height: 45 },
    qrText: { fontSize: 6, color: "#999", marginLeft: 4, maxWidth: 70 },
  });

  const docTitleMap = { offer: "Firm Offer", invoice: "Invoice", proforma: "Proforma Invoice" };
  const items = (doc.items || []) as OfferLineItem[];
  const currency = doc.currency || "USD";
  const fmtMoney = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header — company left, logo right */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{tenant?.legal_name || tenant?.name || "Company"}</Text>
            {tenant?.address_line && <Text style={styles.companyAddr}>{tenant.address_line}</Text>}
            {tenant?.city && <Text style={styles.companyAddr}>{[tenant.postal_code, tenant.city, tenant.country].filter(Boolean).join(", ")}</Text>}
            {tenant?.bank_swift && <Text style={styles.companyContact}>SWIFT: {tenant.bank_swift} · IBAN: {tenant.bank_iban || "—"}</Text>}
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {logoUrl && <Image style={styles.headerLogo} src={logoUrl} />}
        </View>

        {/* Document title + metadata */}
        <View style={styles.docHeader}>
          <Text style={styles.docTitle}>{docTitleMap[docType]}</Text>
          <View style={styles.docMeta}>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>Document No.:</Text>
              <Text style={styles.docMetaValue}>{doc.number}</Text>
            </View>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>Date of Issue:</Text>
              <Text style={styles.docMetaValue}>{new Date((doc as any).issue_date || doc.created_at).toLocaleDateString("en-US")}</Text>
            </View>
            {docType === "offer" && (doc as Offer).valid_until && (
              <View style={styles.docMetaRow}>
                <Text style={styles.docMetaLabel}>Valid Until:</Text>
                <Text style={styles.docMetaValue}>{new Date((doc as Offer).valid_until as string).toLocaleDateString("en-US")}</Text>
              </View>
            )}
            {(docType === "invoice" || docType === "proforma") && (doc as any).due_date && (
              <View style={styles.docMetaRow}>
                <Text style={styles.docMetaLabel}>Due Date:</Text>
                <Text style={styles.docMetaValue}>{new Date((doc as any).due_date).toLocaleDateString("en-US")}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bill To / Ship To */}
        <View style={styles.partiesSection}>
          <View style={styles.partyBox}>
            <View style={styles.partyHeader}>
              <Text style={styles.partyHeaderText}>BILL TO (BUYER):</Text>
            </View>
            <View style={styles.partyBody}>
              <Text style={styles.partyName}>{partner?.name || "—"}</Text>
              <Text style={styles.partyAddr}>{partner?.address_line}</Text>
              <Text style={styles.partyAddr}>{[partner?.postal_code, partner?.city, partner?.country].filter(Boolean).join(", ")}</Text>
              {partner?.tax_id && <Text style={styles.partyAddr}>Tax ID: {partner.tax_id}</Text>}
              {partner?.vat_number && <Text style={styles.partyAddr}>VAT: {partner.vat_number}</Text>}
            </View>
          </View>
          <View style={styles.partyBox}>
            <View style={styles.partyHeader}>
              <Text style={styles.partyHeaderText}>SHIP TO (CONSIGNEE):</Text>
            </View>
            <View style={styles.partyBody}>
              <Text style={styles.partyName}>SAME AS BUYER</Text>
            </View>
          </View>
        </View>

        {/* Product info grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Product</Text>
            <Text style={styles.infoValue}>{items[0]?.product_name || doc.subject}</Text>
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
            <Text style={styles.infoValue}>{(doc as any).incoterm || (items[0] as any)?.incoterm || "EXW - Ex Works"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Packaging</Text>
            <Text style={styles.infoValue}>{(items[0] as any)?.packaging || "Standard"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Payment Terms</Text>
            <Text style={styles.infoValueRed}>{(doc as any).terms || "100% T/T in Advance"}</Text>
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
            <Text style={[styles.th, { flex: 3 }]}>Description / Specification</Text>
            <Text style={[styles.th, { flex: 1 }]}>HS Code</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Quantity</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Unit Price</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: "right" }]}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 3 }]}>{item.product_name}</Text>
              <Text style={[styles.td, { flex: 1 }]}>{(item as any).hs_code || "—"}</Text>
              <Text style={[styles.td, { flex: 1.2 }]}>{item.quantity} {(item as any).unit || "kg"}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{fmtMoney(item.unit_price)}</Text>
              <Text style={[styles.td, { flex: 1.2, textAlign: "right", fontFamily: "Helvetica-Bold" }]}>{fmtMoney(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{fmtMoney(doc.subtotal)}</Text>
          </View>
          {doc.discount_total > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-{fmtMoney(doc.discount_total)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>{fmtMoney(doc.tax_total)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{fmtMoney(doc.total)}</Text>
          </View>
        </View>

        {/* Remarks */}
        {(doc as any).terms && (
          <View style={styles.remarks}>
            <Text style={styles.remarksHeader}>REMARKS / NOTES</Text>
            <Text style={styles.remarksText}>
              This offer is informational until confirmed by a Proforma Invoice. Prices are subject to change without notice. Payment terms as specified above.
            </Text>
          </View>
        )}

        {/* QR Code */}
        {qrCodeDataUrl && verificationCode && (
          <View style={styles.qrSection}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.qrImage} src={qrCodeDataUrl} />
            <Text style={styles.qrText}>Scan to verify{"\n"}authenticity</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            {verificationCode && <Text style={styles.footerHash}>VERIFICATION HASH: {verificationCode}</Text>}
            <Text
              style={styles.footerPage}
              render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`}
            />
          </View>
          {tenant?.legal_name && (
            <Text style={styles.footerAddr}>{[tenant.legal_name, tenant.address_line, tenant.city, tenant.country].filter(Boolean).join(" · ")}</Text>
          )}
          <Text style={styles.footerSys}>Generated by Aspidus CRM System</Text>
        </View>
      </Page>
    </Document>
  );
}

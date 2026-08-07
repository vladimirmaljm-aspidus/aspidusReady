import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font, Link } from "@react-pdf/renderer";
import type { Offer, Invoice, Proforma, OfferLineItem, Partner, Tenant, DocumentTemplate } from "@/lib/supabase/types";

// Allow very long "words" (SKUs, HS codes like 1006.30.10.00, IBANs) to break
// across lines. Short words are kept intact so normal prose still looks clean.
Font.registerHyphenationCallback((word) => {
  if (word.length > 18) {
    const parts = word.match(/.{1,18}/g);
    return parts && parts.length > 1 ? parts : [word];
  }
  return [word];
});

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

/**
 * Convert a numeric amount into English words (e.g. 171000 → "ONE HUNDRED
 * SEVENTY-ONE THOUSAND"). Used by the "Amount in Words" line that
 * international trade documents (invoices, proformas, offers) legally
 * require. Handles up to billions, negative values, and cents.
 */
function amountInWords(amount: number, currency = "USD"): string {
  const currName =
    currency === "USD" ? "US DOLLARS"
    : currency === "EUR" ? "EUROS"
    : currency === "GBP" ? "POUNDS STERLING"
    : currency === "CHF" ? "SWISS FRANCS"
    : currency === "AED" ? "UAE DIRHAMS"
    : currency === "CNY" ? "CHINESE YUAN"
    : currency === "INR" ? "INDIAN RUPEES"
    : currency === "RUB" ? "RUSSIAN RUBLES"
    : currency === "JPY" ? "JAPANESE YEN"
    : currency === "SAR" ? "SAUDI RIYALS"
    : currency === "BRL" ? "BRAZILIAN REAL"
    : currency === "ZAR" ? "SOUTH AFRICAN RAND"
    : currency === "TRY" ? "TURKISH LIRA"
    : currency === "SGD" ? "SINGAPORE DOLLARS"
    : currency === "HKD" ? "HONG KONG DOLLARS"
    : currency;

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function threeDigitsToWords(n: number): string {
    if (n === 0) return "";
    let str = "";
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    if (hundred > 0) {
      str += ones[hundred] + " Hundred";
    }
    if (remainder > 0) {
      if (str) str += " ";
      if (remainder < 10) {
        str += ones[remainder];
      } else if (remainder < 20) {
        str += teens[remainder - 10];
      } else {
        const t = Math.floor(remainder / 10);
        const o = remainder % 10;
        str += tens[t];
        if (o > 0) str += "-" + ones[o];
      }
    }
    return str;
  }

  if (!isFinite(amount)) {
    return `SAY: ZERO ${currName} ONLY`;
  }

  const negative = amount < 0;
  const absAmount = Math.abs(amount);
  const whole = Math.floor(absAmount);
  const cents = Math.round((absAmount - whole) * 100);

  let words: string;
  if (whole === 0) {
    words = "Zero";
  } else {
    const billions = Math.floor(whole / 1000000000);
    const millions = Math.floor((whole % 1000000000) / 1000000);
    const thousands = Math.floor((whole % 1000000) / 1000);
    const remainder = whole % 1000;

    const parts: string[] = [];
    if (billions > 0) parts.push(threeDigitsToWords(billions) + " Billion");
    if (millions > 0) parts.push(threeDigitsToWords(millions) + " Million");
    if (thousands > 0) parts.push(threeDigitsToWords(thousands) + " Thousand");
    if (remainder > 0) parts.push(threeDigitsToWords(remainder));
    words = parts.join(" ");
  }

  let result = `SAY: ${negative ? "NEGATIVE " : ""}${words} ${currName}`;
  if (cents > 0) {
    result += ` AND ${cents}/100`;
  }
  result += " ONLY";
  return result;
}

export function buildPdfDocument({ doc, docType, partner, tenant, template, verificationCode, qrCodeDataUrl, logoUrl, pdfMeta }: PdfDocData) {
  const tpl = template;
  const primaryColor = tpl?.primary_color || "#0d9488";

  // ── Corporate typography (Helvetica family — clean, professional,
  //    standard for international business documents) ──────────────────
  const fontFamily = "Helvetica";
  const headingFontFamily = "Helvetica-Bold";
  const fontSize = 9;
  const lineHeight = 1.4;

  // ── Layout dimensions ──────────────────────────────────────────────
  // Header height accommodates: logo + company name + address + contact + reg line.
  // Footer height accommodates: company legal line + page/QR/generated row.
  const headerTop = mmToPoints(8);
  const headerHeight = 72;
  const footerBottom = mmToPoints(8);
  const footerHeight = 60;

  const marginLeft = mmToPoints(tpl?.page_margin_left ?? 18);
  const marginRight = mmToPoints(tpl?.page_margin_right ?? 18);
  const tableHeaderBg = tpl?.table_header_bg || primaryColor;
  const tableHeaderColor = tpl?.table_header_color || "#ffffff";
  const tableBorderColor = tpl?.table_border_color || "#e5e7eb";

  const styles = StyleSheet.create({
    page: {
      fontSize,
      lineHeight,
      paddingTop: headerTop + headerHeight + 14,
      paddingBottom: footerBottom + footerHeight + 14,
      paddingLeft: marginLeft,
      paddingRight: marginRight,
      fontFamily,
      color: "#1a1a1a",
    },

    // ── HEADER (memorandum — repeats on every page) ────────────────────
    // [Logo]  COMPANY NAME
    //         Address · Phone · Email · Website
    //         Reg# · VAT# · Tax#
    header: {
      position: "absolute",
      top: headerTop,
      left: marginLeft,
      right: marginRight,
      height: headerHeight,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
    },
    headerLogoWrap: { flexDirection: "column", justifyContent: "center", alignItems: "flex-start", width: 90 },
    headerLogo: { width: 80, height: 50, objectFit: "contain" },
    headerLeft: { flexDirection: "column", flex: 1, justifyContent: "center", paddingLeft: 12 },
    companyName: { fontSize: 14, fontFamily: headingFontFamily, color: primaryColor, marginBottom: 2 },
    companyAddr: { fontSize: 7.5, color: "#555", marginBottom: 1 },
    companyContact: { fontSize: 7.5, color: "#555", marginBottom: 1 },
    companyReg: { fontSize: 7.5, color: "#888", fontFamily: headingFontFamily },

    // ── FOOTER (memorandum — repeats on every page) ────────────────────
    // Top row: Company Name · Reg# · VAT#
    // Bottom row: Page X of Y (left)  [QR] (right)  Generated by (left under page)
    // Verification code is intentionally NOT shown — it lives in PDF metadata only.
    footer: {
      position: "absolute",
      bottom: footerBottom,
      left: marginLeft,
      right: marginRight,
      height: footerHeight,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: tableBorderColor,
      flexDirection: "column",
    },
    footerTopRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    footerCompanyLine: { fontSize: 7, color: "#666", fontFamily: headingFontFamily },
    footerBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    footerLeftInfo: { flexDirection: "column", flex: 1, justifyContent: "flex-end" },
    footerPage: { fontSize: 7.5, color: "#666", fontFamily: headingFontFamily },
    footerSys: { fontSize: 6.5, color: "#aaa", fontStyle: "italic", marginTop: 2 },
    footerQr: { flexDirection: "column", alignItems: "center", gap: 2 },
    footerQrImage: { width: 35, height: 35 },
    footerQrLabel: { fontSize: 5.5, color: "#aaa", textAlign: "center" },

    // ── Document title block ──────────────────────────────────────────
    docTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 14,
      marginTop: 0,
    },
    docTitleBlock: { flexDirection: "column" },
    docTitle: { fontSize: 18, fontFamily: headingFontFamily, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: 1 },
    docSubtitle: { fontSize: 8.5, color: "#888", marginTop: 3 },
    docMetaBlock: { flexDirection: "column", alignItems: "flex-end" },
    docMetaRow: { flexDirection: "row", marginBottom: 2 },
    docMetaLabel: { fontSize: 8, color: "#888", marginRight: 4 },
    docMetaValue: { fontSize: 8.5, fontFamily: headingFontFamily, color: "#333" },

    // ── Proforma banner ("PROFORMA — NOT A TAX INVOICE") ──────────────
    proformaBanner: {
      borderWidth: 1,
      borderColor: "#cc0000",
      backgroundColor: "#fff5f5",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 3,
      marginBottom: 10,
    },
    proformaBannerText: { fontSize: 8, fontFamily: headingFontFamily, color: "#cc0000", textTransform: "uppercase", textAlign: "center", letterSpacing: 0.5 },

    // ── Section header (FROM/TO/TRADE TERMS/LINE ITEMS/SPECIFICATIONS/...)
    sectionHeader: {
      fontSize: 9,
      fontFamily: headingFontFamily,
      color: primaryColor,
      textTransform: "uppercase",
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: tableBorderColor,
      marginBottom: 8,
      letterSpacing: 0.5,
    },

    // ── FROM / TO party boxes ─────────────────────────────────────────
    partiesSection: { flexDirection: "row", gap: 10, marginBottom: 14 },
    partyBox: { flex: 1, borderWidth: 1, borderColor: tableBorderColor, borderRadius: 3, overflow: "hidden" },
    partyHeader: { backgroundColor: "#f5f5f5", paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: tableBorderColor },
    partyHeaderText: { fontSize: 8, fontFamily: headingFontFamily, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 },
    partyBody: { padding: 8 },
    partyName: { fontSize: 9.5, fontFamily: headingFontFamily, color: "#1a1a1a", marginBottom: 3 },
    partyAddr: { fontSize: 8, color: "#555", lineHeight: 1.4, marginBottom: 1 },

    // ── Trade Terms box (3-column grid) ───────────────────────────────
    tradeTerms: { marginBottom: 14, borderWidth: 1, borderColor: tableBorderColor, borderRadius: 3, overflow: "hidden" },
    tradeTermsRow: { flexDirection: "row", borderBottomWidth: 0.25, borderBottomColor: tableBorderColor },
    tradeTermsCell: { flex: 1, flexDirection: "row", paddingHorizontal: 8, paddingVertical: 5, borderRightWidth: 0.25, borderRightColor: tableBorderColor },
    tradeTermsCellLast: { flex: 1, flexDirection: "row", paddingHorizontal: 8, paddingVertical: 5 },
    tradeTermsLabel: { fontSize: 7, color: "#999", textTransform: "uppercase", marginRight: 4, fontFamily: headingFontFamily },
    tradeTermsValue: { fontSize: 8.5, fontFamily: headingFontFamily, color: "#333", flex: 1 },

    // ── Line items table ──────────────────────────────────────────────
    table: { marginBottom: 10, borderWidth: 1, borderColor: tableBorderColor, borderRadius: 3, overflow: "hidden" },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: tableHeaderBg,
      paddingVertical: 7,
    },
    th: { fontSize: 8.5, fontFamily: headingFontFamily, color: tableHeaderColor, paddingHorizontal: 4 },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: tableBorderColor,
      alignItems: "stretch",
    },
    td: { fontSize: 8.5, paddingHorizontal: 4, color: "#333" },

    // ── Specifications (per product key/value table + free text) ──────
    specSection: { marginTop: 12, marginBottom: 10 },
    specItem: { marginTop: 6, marginBottom: 4 },
    specItemTitle: { fontSize: 8.5, fontFamily: headingFontFamily, color: primaryColor, marginBottom: 3 },
    specTable: { borderWidth: 0.5, borderColor: tableBorderColor, borderRadius: 3, overflow: "hidden" },
    specRow: { flexDirection: "row", borderBottomWidth: 0.25, borderBottomColor: tableBorderColor },
    specName: { flex: 1, fontSize: 8, paddingVertical: 3, paddingHorizontal: 6, color: "#666", fontFamily: headingFontFamily },
    specValue: { flex: 1, fontSize: 8, paddingVertical: 3, paddingHorizontal: 6, color: "#333" },
    specDetail: { fontSize: 7.5, color: "#555", lineHeight: 1.4, marginTop: 3, paddingHorizontal: 6 },

    // ── Totals ────────────────────────────────────────────────────────
    totals: { marginTop: 12, alignSelf: "flex-end", width: 250 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
    totalLabel: { fontSize: 8.5, color: "#666" },
    totalValue: { fontSize: 8.5, fontFamily: headingFontFamily, color: "#333" },
    grandTotal: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      marginTop: 4,
      borderTopWidth: 2,
      borderTopColor: primaryColor,
    },
    grandTotalLabel: { fontSize: 10, fontFamily: headingFontFamily, color: primaryColor },
    grandTotalValue: { fontSize: 13, fontFamily: headingFontFamily, color: primaryColor },
    amountInWords: {
      marginTop: 6,
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: "#fafafa",
      borderRadius: 3,
      borderWidth: 0.5,
      borderColor: tableBorderColor,
    },
    amountInWordsLabel: { fontSize: 7, color: "#999", textTransform: "uppercase", marginBottom: 2, fontFamily: headingFontFamily },
    amountInWordsValue: { fontSize: 8.5, fontFamily: headingFontFamily, color: "#333", textTransform: "uppercase" },

    // ── Offer Text / Terms / Bank Details ─────────────────────────────
    termsBox: { marginTop: 14, marginBottom: 8 },
    termsText: { fontSize: 8.5, color: "#444", lineHeight: 1.5, marginBottom: 4 },

    bankGrid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderColor: tableBorderColor, borderRadius: 3, overflow: "hidden" },
    bankCell: { width: "50%", flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderRightWidth: 0.5, borderRightColor: tableBorderColor, borderBottomWidth: 0.5, borderBottomColor: tableBorderColor },
    bankCellFull: { width: "100%", flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: tableBorderColor },
    bankLabel: { fontSize: 7, color: "#999", textTransform: "uppercase", marginRight: 4, fontFamily: headingFontFamily },
    bankValue: { fontSize: 8.5, color: "#333", fontFamily: headingFontFamily, flex: 1 },

    // ── Authorized Signatures ─────────────────────────────────────────
    signatureBlock: { marginTop: 20, flexDirection: "row", justifyContent: "space-between", gap: 24 },
    signatureCol: { flex: 1, flexDirection: "column" },
    signatureParty: { fontSize: 8, color: "#555", marginBottom: 2, fontFamily: headingFontFamily },
    signatureLine: { marginTop: 26, borderBottomWidth: 1, borderBottomColor: "#333" },
    signatureLabel: { fontSize: 8, color: "#666", marginTop: 3, textAlign: "center", fontFamily: headingFontFamily },

    // ── Document Notice (legally required disclaimer per doc type) ────
    noticeBox: {
      marginTop: 14,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: "#fafafa",
      borderLeftWidth: 3,
      borderLeftColor: primaryColor,
      borderRadius: 2,
    },
    noticeText: { fontSize: 7.5, color: "#555", fontStyle: "italic", lineHeight: 1.4 },
  });

  const docTitleMap = {
    offer: "Offer",
    invoice: "Commercial Invoice",
    proforma: "Proforma Invoice",
  } as const;
  const items = (doc.items || []) as OfferLineItem[];
  const currency = doc.currency || "USD";

  // ── Pull trade / shipping fields off the doc ───────────────────────
  // Offer carries these typed; invoice/proforma may carry them via the
  // extended DB row (we read defensively via `any`).
  const tradeFields = doc as any;
  const incoterm: string = tradeFields.incoterm || (items[0] as any)?.incoterm || "EXW";
  const pol: string = tradeFields.pol || "—";
  const pod: string = tradeFields.pod || "—";
  const vessel: string = tradeFields.vessel || "—";
  const containerNo: string = tradeFields.container_no || "—";
  const leadTime: string = tradeFields.lead_time || "—";
  const packaging: string = tradeFields.packaging || (items[0] as any)?.packaging || "—";
  const paymentTerms: string = tradeFields.payment_terms || tradeFields.terms || "T/T in Advance";
  const originCountry: string = (items[0] as any)?.origin_country || "—";
  const bankDetails: string = tradeFields.bank_details || "";

  // ── HEADER (memorandum — repeats on every page) ────────────────────
  const HeaderContent = () => (
    <View style={styles.header} fixed>
      {logoUrl ? (
        <View style={styles.headerLogoWrap}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.headerLogo} src={logoUrl} />
        </View>
      ) : null}
      <View style={styles.headerLeft}>
        <Text style={styles.companyName}>
          {tenant?.legal_name || tenant?.name || "Company"}
        </Text>
        {(tenant?.address_line || tenant?.city || tenant?.country) && (
          <Text style={styles.companyAddr}>
            {[
              tenant?.address_line,
              [tenant?.postal_code, tenant?.city].filter(Boolean).join(" "),
              tenant?.country,
            ].filter(Boolean).join(", ")}
          </Text>
        )}
        <Text style={styles.companyContact}>
          {[
            tenant?.phone,
            tenant?.email,
            tenant?.website,
          ].filter(Boolean).join("  ·  ")}
        </Text>
        {(tenant?.registration_number || tenant?.vat_number || tenant?.tax_id) && (
          <Text style={styles.companyReg}>
            {[
              tenant?.registration_number && `Reg# ${tenant.registration_number}`,
              tenant?.vat_number && `VAT# ${tenant.vat_number}`,
              tenant?.tax_id && `Tax# ${tenant.tax_id}`,
            ].filter(Boolean).join("  ·  ")}
          </Text>
        )}
      </View>
    </View>
  );

  // ── FOOTER (memorandum — repeats on every page) ────────────────────
  // NOTE: verification code is intentionally NOT rendered here — it is
  // embedded into the PDF Document metadata (subject/keywords) instead.
  const FooterContent = () => (
    <View style={styles.footer} fixed>
      <View style={styles.footerTopRow}>
        <Text style={styles.footerCompanyLine}>
          {[
            tenant?.legal_name || tenant?.name || "Company",
            tenant?.registration_number && `Reg# ${tenant.registration_number}`,
            tenant?.vat_number && `VAT# ${tenant.vat_number}`,
          ].filter(Boolean).join("  ·  ")}
        </Text>
      </View>
      <View style={styles.footerBottomRow}>
        <View style={styles.footerLeftInfo}>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <Text style={styles.footerSys}>
            Generated by {pdfMeta?.creator || "Aspidus CRM"} · {new Date().toLocaleString("en-GB")}
          </Text>
        </View>
        {qrCodeDataUrl && (
          <View style={styles.footerQr}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.footerQrImage} src={qrCodeDataUrl} />
            <Text style={styles.footerQrLabel}>Scan to verify</Text>
          </View>
        )}
      </View>
    </View>
  );

  // ── Party box helper (used for FROM / TO) ──────────────────────────
  const PartyBox = ({
    title,
    name,
    addressLine,
    city,
    postal,
    country,
    taxId,
    vat,
    reg,
    email,
    phone,
    website,
  }: {
    title: string;
    name: string;
    addressLine?: string | null;
    city?: string | null;
    postal?: string | null;
    country?: string | null;
    taxId?: string | null;
    vat?: string | null;
    reg?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
  }) => (
    <View style={styles.partyBox}>
      <View style={styles.partyHeader}>
        <Text style={styles.partyHeaderText}>{title}</Text>
      </View>
      <View style={styles.partyBody}>
        <Text style={styles.partyName}>{name}</Text>
        {addressLine && <Text style={styles.partyAddr}>{addressLine}</Text>}
        {(postal || city || country) && (
          <Text style={styles.partyAddr}>
            {[postal, city, country].filter(Boolean).join(", ")}
          </Text>
        )}
        {reg && <Text style={styles.partyAddr}>Reg#: {reg}</Text>}
        {taxId && <Text style={styles.partyAddr}>Tax ID: {taxId}</Text>}
        {vat && <Text style={styles.partyAddr}>VAT#: {vat}</Text>}
        {(phone || email || website) && (
          <Text style={styles.partyAddr}>
            {[phone, email, website].filter(Boolean).join("  ·  ")}
          </Text>
        )}
      </View>
    </View>
  );

  // ── Document notice (legally required disclaimer) per doc type ─────
  const docNotice =
    docType === "invoice"
      ? "This is a computer-generated commercial invoice and is valid without signature."
      : docType === "proforma"
      ? "This proforma invoice is issued for customs/bank purposes only and is not a tax invoice."
      : "This offer is valid until the date specified above. Prices are subject to confirmation at time of order.";

  // Format an ISO date as "06 Aug 2026"
  const fmtDate = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  // Verification code lives ONLY in the PDF metadata (subject/keywords) — never visible.
  const verificationMeta = verificationCode ? ` Verification: ${verificationCode}.` : "";

  return (
    <Document
      title={pdfMeta?.title || `${docTitleMap[docType]} ${doc.number}`}
      author={pdfMeta?.author || tenant?.legal_name || tenant?.name || "Aspidus CRM"}
      subject={pdfMeta?.subject || `${docTitleMap[docType]} ${doc.number} — ${partner?.name || "client"}.${verificationMeta}`}
      creator={pdfMeta?.creator || "Aspidus CRM System"}
      keywords={pdfMeta?.keywords || `${docType}, ${doc.number}, ${partner?.name || ""}, ${currency}${verificationCode ? `, verification: ${verificationCode}` : ""}`}
      producer="Aspidus CRM"
    >
      <Page size="A4" style={styles.page}>
        {/* ── HEADER (memorandum — fixed, repeats on every page) ── */}
        <HeaderContent />

        {/* Document title + meta block */}
        <View style={styles.docTitleRow}>
          <View style={styles.docTitleBlock}>
            <Text style={styles.docTitle}>{docTitleMap[docType]}</Text>
            {doc.subject && <Text style={styles.docSubtitle}>{doc.subject}</Text>}
          </View>
          <View style={styles.docMetaBlock}>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>Document No.:</Text>
              <Text style={styles.docMetaValue}>{doc.number}</Text>
            </View>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>Date of Issue:</Text>
              <Text style={styles.docMetaValue}>
                {fmtDate((doc as any).issue_date || doc.created_at)}
              </Text>
            </View>
            {docType === "offer" && (doc as Offer).valid_until && (
              <View style={styles.docMetaRow}>
                <Text style={styles.docMetaLabel}>Valid Until:</Text>
                <Text style={styles.docMetaValue}>
                  {fmtDate((doc as Offer).valid_until as string)}
                </Text>
              </View>
            )}
            {(docType === "invoice" || docType === "proforma") && (doc as any).due_date && (
              <View style={styles.docMetaRow}>
                <Text style={styles.docMetaLabel}>Due Date:</Text>
                <Text style={styles.docMetaValue}>
                  {fmtDate((doc as any).due_date)}
                </Text>
              </View>
            )}
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>Currency:</Text>
              <Text style={styles.docMetaValue}>{currency}</Text>
            </View>
          </View>
        </View>

        {/* Proforma banner — clearly marked "PROFORMA — NOT A TAX INVOICE" */}
        {docType === "proforma" && (
          <View style={styles.proformaBanner}>
            <Text style={styles.proformaBannerText}>PROFORMA — NOT A TAX INVOICE</Text>
          </View>
        )}

        {/* FROM (Seller) / TO (Buyer) — full legal details */}
        <View style={styles.partiesSection}>
          <PartyBox
            title="FROM (SELLER)"
            name={tenant?.legal_name || tenant?.name || "Company"}
            addressLine={tenant?.address_line}
            city={tenant?.city}
            postal={tenant?.postal_code}
            country={tenant?.country}
            reg={tenant?.registration_number}
            vat={tenant?.vat_number}
            taxId={tenant?.tax_id}
            phone={tenant?.phone}
            email={tenant?.email}
            website={tenant?.website}
          />
          <PartyBox
            title="TO (BUYER)"
            name={partner?.name || "—"}
            addressLine={partner?.address_line}
            city={partner?.city}
            postal={partner?.postal_code}
            country={partner?.country}
            reg={partner?.registration_number}
            vat={partner?.vat_number}
            taxId={partner?.tax_id}
            phone={partner?.phone}
            email={partner?.email}
            website={partner?.website}
          />
        </View>

        {/* TRADE TERMS (Incoterm, Origin, POL, POD, Payment, Lead time, Packaging, Vessel, Container) */}
        <Text style={styles.sectionHeader}>Trade Terms</Text>
        <View style={styles.tradeTerms} wrap={false}>
          <View style={styles.tradeTermsRow}>
            <View style={styles.tradeTermsCell}>
              <Text style={styles.tradeTermsLabel}>Incoterm</Text>
              <Text style={styles.tradeTermsValue}>{incoterm}{pol && pol !== "—" ? ` · ${pol}` : ""}</Text>
            </View>
            <View style={styles.tradeTermsCell}>
              <Text style={styles.tradeTermsLabel}>Origin</Text>
              <Text style={styles.tradeTermsValue}>{originCountry}</Text>
            </View>
            <View style={styles.tradeTermsCellLast}>
              <Text style={styles.tradeTermsLabel}>Payment</Text>
              <Text style={styles.tradeTermsValue}>{paymentTerms}</Text>
            </View>
          </View>
          <View style={styles.tradeTermsRow}>
            <View style={styles.tradeTermsCell}>
              <Text style={styles.tradeTermsLabel}>POL</Text>
              <Text style={styles.tradeTermsValue}>{pol}</Text>
            </View>
            <View style={styles.tradeTermsCell}>
              <Text style={styles.tradeTermsLabel}>POD</Text>
              <Text style={styles.tradeTermsValue}>{pod}</Text>
            </View>
            <View style={styles.tradeTermsCellLast}>
              <Text style={styles.tradeTermsLabel}>Lead Time</Text>
              <Text style={styles.tradeTermsValue}>{leadTime}</Text>
            </View>
          </View>
          <View style={styles.tradeTermsRow}>
            <View style={styles.tradeTermsCell}>
              <Text style={styles.tradeTermsLabel}>Packaging</Text>
              <Text style={styles.tradeTermsValue}>{packaging}</Text>
            </View>
            <View style={styles.tradeTermsCell}>
              <Text style={styles.tradeTermsLabel}>Vessel</Text>
              <Text style={styles.tradeTermsValue}>{vessel}</Text>
            </View>
            <View style={styles.tradeTermsCellLast}>
              <Text style={styles.tradeTermsLabel}>Container</Text>
              <Text style={styles.tradeTermsValue}>{containerNo}</Text>
            </View>
          </View>
        </View>

        {/* LINE ITEMS — header is `fixed` so it repeats on every page */}
        <Text style={styles.sectionHeader}>Line Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.th, { flex: 0.3 }]}>#</Text>
            <Text style={[styles.th, { flex: 3 }]}>Description</Text>
            <Text style={[styles.th, { flex: 1.1 }]}>HS Code</Text>
            <Text style={[styles.th, { flex: 0.9 }]}>Origin</Text>
            <Text style={[styles.th, { flex: 1.1 }]}>Quantity</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Unit Price</Text>
            <Text style={[styles.th, { flex: 1.1, textAlign: "right" }]}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 0.3 }]}>{i + 1}</Text>
              <Text style={[styles.td, { flex: 3 }]}>
                {item.product_name}
                {item.sku ? `\nSKU: ${item.sku}` : ""}
                {item.brand ? `\nBrand: ${item.brand}` : ""}
              </Text>
              <Text style={[styles.td, { flex: 1.1 }]}>{(item as any).hs_code || "—"}</Text>
              <Text style={[styles.td, { flex: 0.9 }]}>{(item as any).origin_country || "—"}</Text>
              <Text style={[styles.td, { flex: 1.1 }]}>
                {item.quantity} {item.unit || "kg"}
              </Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                {fmtMoney(item.unit_price, currency)}
              </Text>
              <Text style={[styles.td, { flex: 1.1, textAlign: "right", fontFamily: headingFontFamily }]}>
                {fmtMoney(item.total, currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* SPECIFICATIONS — coa_params (key/value table) + detailed_spec */}
        {items.some((it: any) => {
          const specs = it.specifications;
          const hasSpecs = Array.isArray(specs)
            ? specs.length > 0
            : (specs && typeof specs === "object" && Object.keys(specs).length > 0);
          return hasSpecs || it.detailed_spec;
        }) && (
          <View style={styles.specSection}>
            <Text style={styles.sectionHeader}>Specifications</Text>
            {items.map((item: any, i: number) => {
              const specs = item.specifications;
              const specArray: Array<{ name: string; value: string }> = Array.isArray(specs)
                ? specs
                : (specs && typeof specs === "object"
                    ? Object.entries(specs).map(([k, v]) => ({ name: k, value: String(v) }))
                    : []);
              return (specArray.length > 0 || item.detailed_spec) ? (
                <View key={`spec-${i}`} style={styles.specItem}>
                  <View wrap={false}>
                    <Text style={styles.specItemTitle}>{item.product_name}</Text>
                    {specArray.length > 0 && (
                      <View style={styles.specTable}>
                        {specArray.map((spec, j) => (
                          <View key={j} style={styles.specRow}>
                            <Text style={styles.specName}>{spec.name}</Text>
                            <Text style={styles.specValue}>{spec.value}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  {item.detailed_spec && (
                    <Text style={styles.specDetail}>{item.detailed_spec}</Text>
                  )}
                </View>
              ) : null;
            })}
          </View>
        )}

        {/* TOTALS + Amount in Words (kept together, never split across pages) */}
        <View style={styles.totals} wrap={false}>
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
              <Text style={styles.totalLabel}>{docType === "offer" ? "Tax / VAT:" : "VAT:"}</Text>
              <Text style={styles.totalValue}>{fmtMoney(doc.tax_total, currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{fmtMoney(doc.total, currency)}</Text>
          </View>
          <View style={styles.amountInWords}>
            <Text style={styles.amountInWordsLabel}>Amount in Words</Text>
            <Text style={styles.amountInWordsValue}>{amountInWords(doc.total, currency)}</Text>
          </View>
        </View>

        {/* OFFER TEXT / TERMS & CONDITIONS */}
        {((doc as any).terms || doc.notes) && (
          <View style={styles.termsBox}>
            <Text style={styles.sectionHeader} wrap={false}>
              {docType === "offer" ? "Offer Text / Terms" : "Terms & Conditions"}
            </Text>
            {(doc as any).terms && <Text style={styles.termsText}>{(doc as any).terms}</Text>}
            {doc.notes && (doc as any).terms !== doc.notes && (
              <Text style={styles.termsText}>{doc.notes}</Text>
            )}
          </View>
        )}

        {/* BANK DETAILS — seller bank info + optional per-doc bank_details string */}
        {(tenant?.bank_name || tenant?.bank_iban || tenant?.bank_swift || tenant?.bank_accounts || bankDetails) && (
          <View style={styles.termsBox}>
            <Text style={styles.sectionHeader} wrap={false}>Bank Details</Text>
            <View style={styles.bankGrid}>
              {tenant?.bank_name && (
                <View style={styles.bankCell}>
                  <Text style={styles.bankLabel}>Bank</Text>
                  <Text style={styles.bankValue}>{tenant.bank_name}</Text>
                </View>
              )}
              {tenant?.bank_iban && (
                <View style={styles.bankCell}>
                  <Text style={styles.bankLabel}>IBAN</Text>
                  <Text style={styles.bankValue}>{tenant.bank_iban}</Text>
                </View>
              )}
              {tenant?.bank_swift && (
                <View style={styles.bankCell}>
                  <Text style={styles.bankLabel}>SWIFT/BIC</Text>
                  <Text style={styles.bankValue}>{tenant.bank_swift}</Text>
                </View>
              )}
              {tenant?.bank_accounts && (
                <View style={styles.bankCell}>
                  <Text style={styles.bankLabel}>Account(s)</Text>
                  {/* bank_accounts can be a JSON array of {bankName, currency, swiftCode, accountNumber}
                      OR a plain string. Handle both safely. */}
                  {(() => {
                    const accts: any = tenant.bank_accounts;
                    if (typeof accts === "string") {
                      return <Text style={styles.bankValue}>{accts}</Text>;
                    }
                    if (Array.isArray(accts)) {
                      return accts.map((a: any, i: number) => (
                        <Text key={i} style={styles.bankValue}>
                          {a.bankName || a.bank_name || "Bank"}{a.accountNumber || a.account_number ? `: ${a.accountNumber || a.account_number}` : ""}{a.currency ? ` (${a.currency})` : ""}{a.swiftCode || a.swift_code ? ` SWIFT: ${a.swiftCode || a.swift_code}` : ""}
                        </Text>
                      ));
                    }
                    if (typeof accts === "object" && accts !== null) {
                      return <Text style={styles.bankValue}>{JSON.stringify(accts)}</Text>;
                    }
                    return null;
                  })()}
                </View>
              )}
              {bankDetails && (
                <View style={styles.bankCellFull}>
                  <Text style={styles.bankLabel}>Additional</Text>
                  <Text style={styles.bankValue}>{bankDetails}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* AUTHORIZED SIGNATURES — seller + buyer/acceptholder */}
        <View style={styles.signatureBlock} wrap={false}>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureParty}>For {tenant?.legal_name || tenant?.name || "Company"}:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureParty}>For {partner?.name || "Buyer"}:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Accepted &amp; Signed</Text>
          </View>
        </View>

        {/* DOCUMENT NOTICE — legally required disclaimer per doc type */}
        <View style={styles.noticeBox} wrap={false}>
          <Text style={styles.noticeText}>{docNotice}</Text>
        </View>

        {/* ── FOOTER (memorandum — fixed, repeats on every page) ── */}
        <FooterContent />
      </Page>
    </Document>
  );
}

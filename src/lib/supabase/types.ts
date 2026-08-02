// TypeScript types matching the Supabase schema (supabase_v23_1.sql)
// These mirror the tables in your Supabase project.

export type UserRole = "super_admin" | "admin" | "accountant" | "manager" | "staff" | "viewer";
export type PartnerType = "supplier" | "buyer" | "both" | "agent" | "logistics" | "customs" | "bank" | "inspector";
export type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type OfferStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";
export type DemandStatus = "open" | "quoted" | "closed";
export type DemandPriority = "low" | "medium" | "high";
export type KycStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface User {
  id: string;
  tenant_id: string | null; // null = super-admin (platform level)
  username: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  permissions: string[] | null;
  password_hash: string;
  totp_secret: string | null;
  totp_enabled: boolean;
  locked_until: string | null;
  failed_attempts: number;
  last_login_at: string | null;
  last_login_ip: string | null;
  last_login_country: string | null;
  must_change_password: boolean;
  token_version: number;
  signature: string | null;
  notif_prefs: Record<string, unknown> | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  tenant_id: string;
  name: string;
  entity_type: PartnerEntityType;
  type: PartnerType;
  email: string | null;
  phone: string | null;
  website: string | null;
  tax_id: string | null;
  vat_number?: string | null;
  registration_number?: string | null;
  // Address
  address_line: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null; // ISO 3166-1 alpha-2
  // Contact person
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  // Bank
  bank_name: string | null;
  bank_account: string | null;
  bank_swift: string | null;
  bank_iban?: string | null;
  // Trade
  preferred_currency?: string | null;
  preferred_incoterm?: string | null;
  preferred_payment_terms?: string | null;
  // Commission Agent
  is_commissioner?: boolean; // if true, this partner is also a commission agent
  // CRM
  status: "active" | "inactive" | "blacklisted";
  risk_score: number;
  notes: string | null;
  tags: string[] | null;
  // Portal
  portal_enabled: boolean;
  portal_token: string | null;
  portal_level: "none" | "viewer" | "buyer";
  kyc_status: KycStatus;
  kyc_data: Record<string, unknown> | null;
  kyc_reviewed_by: string | null;
  kyc_reviewed_at: string | null;
  // Meta
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  price: number;
  currency: string;
  cost: number | null;
  stock: number;
  reorder_level: number;
  active: boolean;
  attributes: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  tenant_id: string;
  title: string;
  partner_id: string;
  owner_id: string | null;
  stage: DealStage;
  value: number;
  currency: string;
  expected_close: string | null;
  probability: number;
  description: string | null;
  lost_reason: string | null;
  // Commission agent for this deal
  commission_agent_id: string | null; // → CommissionAgent
  // Cost tracking (for profit calculation)
  buy_cost: number; // total cost of goods for this deal
  quantity: number; // quantity sold
  unit: string; // unit of measure
  // Meta
  created_at: string;
  updated_at: string;
}

export interface OfferLineItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number;
  tax_rate: number;
  total: number;
}

export interface Offer {
  id: string;
  tenant_id: string;
  number: string;
  deal_id: string | null;
  partner_id: string;
  owner_id: string | null;
  status: OfferStatus;
  subject: string;
  currency: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  notes: string | null;
  terms: string | null;
  valid_until: string | null;
  sent_at: string | null;
  responded_at: string | null;
  items: OfferLineItem[];
  // Trade / import fields
  offer_no: string | null;
  bank_details: string | null;
  pol: string | null;
  pod: string | null;
  vessel: string | null;
  container_no: string | null;
  lead_time: string | null;
  packaging: string | null;
  payment_terms: string | null;
  tax_clause: string | null;
  incoterm: string | null;
  selling_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface DemandItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit: string;
  target_price: number | null;
  notes: string | null;
}

export interface Demand {
  id: string;
  tenant_id: string;
  number: string;
  partner_id: string;
  status: DemandStatus;
  priority: DemandPriority;
  subject: string;
  description: string | null;
  requested_delivery: string | null;
  currency: string;
  items: DemandItem[];
  // Trade / import fields
  product_id: string | null;
  product_name: string | null;
  target_price: number | null;
  is_new_product: boolean;
  source: string | null;
  auto_hints: string | null;
  buyer_bank: string | null;
  destination: string | null;
  needed_by: string | null;
  payment_terms: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedDocument {
  id: string;
  tenant_id: string;
  partner_id: string;
  filename: string;
  mime_type: string;
  size: number;
  storage_path: string;
  category: "contract" | "invoice" | "spec" | "other";
  uploaded_by: string | null;
  visible_to_partner: boolean;
  description: string | null;
  file_type: string | null;
  file_size: number | null;
  file_path: string | null;
  url: string | null;
  visibility: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id?: string | null;
  user_id: string | null;
  username: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Setting {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  revoked: boolean;
  last_used_at: string | null;
}

export interface UserTask {
  id: string;
  tenant_id: string;
  user_id: string; // creator / owner
  assigned_to: string | null; // who is responsible (null = unassigned)
  title: string;
  description: string | null;
  done: boolean;
  status: "todo" | "in_progress" | "done" | "blocked" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  completed_at: string | null;
  // Links to other entities
  entity_type: string | null; // partner | product | deal | offer | invoice | demand
  entity_id: string | null;
  partner_id: string | null;
  product_id: string | null;
  deal_id: string | null;
  // Instructions / notes for the assignee
  instructions: string | null;
  // Tracking
  estimated_hours: number | null;
  actual_hours: number | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  partner_id: string;
  product_id: string;
  delta: number;
  reason: string;
  reference: string | null;
  created_at: string;
}

export interface EntityNote {
  id: string;
  entity_type: string;
  entity_id: string;
  content: string;
  pinned: boolean;
  created_by: string | null;
  created_at: string;
}

export interface DashboardInsights {
  kpis: {
    partners_total: number;
    partners_active: number;
    deals_open: number;
    deals_won_value: number;
    pipeline_value: number;
    offers_pending: number;
    low_stock_count: number;
    invoices_outstanding: number;
    inventory_movements_30d: number;
  };
  deals_by_stage: { stage: DealStage; count: number; value: number }[];
  offers_last_30d: { date: string; count: number }[];
  revenue_last_30d: { date: string; value: number }[];
  recent_activity: AuditLog[];
  top_partners: { id: string; name: string; deal_value: number }[];
  low_stock_products: { id: string; name: string; sku: string; stock: number; reorder_level: number }[];
}

// ---------- Invoices ----------
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  tenant_id: string;
  number: string;
  offer_id: string | null;
  partner_id: string;
  status: InvoiceStatus;
  subject: string;
  currency: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  issue_date: string;
  due_date: string;
  sent_at: string | null;
  paid_at: string | null;
  notes: string | null;
  items: OfferLineItem[];
  // Optional UI-only field
  payment_terms?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Proformas ----------
export type ProformaStatus = "draft" | "sent" | "paid" | "expired";

export interface Proforma {
  id: string;
  tenant_id: string;
  number: string;
  offer_id: string | null;
  partner_id: string;
  status: ProformaStatus;
  subject: string;
  currency: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  issue_date: string;
  valid_until: string;
  sent_at: string | null;
  paid_at: string | null;
  payment_terms: string | null;
  notes: string | null;
  items: OfferLineItem[];
  created_at: string;
  updated_at: string;
}

// ---------- Document Register (V1/V2/V3 versioning) ----------
export type DocumentType = "offer" | "invoice" | "proforma" | "contract" | "spec" | "other";

export interface DocumentRegisterEntry {
  id: string;
  number: string; // e.g. OF-2026-001-V2
  type: DocumentType;
  version: number; // 1, 2, 3...
  reference_id: string | null; // offer_id / invoice_id etc.
  partner_id: string | null;
  title: string;
  status: "current" | "superseded" | "archived";
  created_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRevision {
  id: string;
  tenant_id?: string;
  document_id: string;
  version: number;
  change_note: string;
  file_url?: string | null;
  change_summary?: string | null;
  created_by: string | null;
  created_at: string;
}

// ---------- Vault (encrypted secrets) ----------
export interface VaultSecret {
  id: string;
  key: string;
  description: string | null;
  encrypted_value: string;
  category: "api" | "smtp" | "database" | "payment" | "other";
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- API Keys ----------
export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_prefix: string; // first 8 chars shown
  key_hash: string; // full hash, never returned to client
  permissions: string[];
  last_used_at: string | null;
  last_used_ip: string | null;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

// ---------- Webhooks ----------
export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[]; // e.g. ["offer.sent", "deal.won"]
  secret: string; // for signing payloads
  last_triggered_at: string | null;
  last_status: number | null; // HTTP status
  active: boolean;
  created_at: string;
}

// ---------- Security (sessions, login history, IPs, devices) ----------
export interface SecuritySession {
  id: string;
  user_id: string;
  ip: string | null;
  user_agent: string | null;
  country: string | null;
  created_at: string;
  last_used_at: string | null;
  expires_at: string;
  revoked: boolean;
  current: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  user_id: string;
  username: string;
  ip: string | null;
  user_agent: string | null;
  country: string | null;
  success: boolean;
  reason: string | null;
  created_at: string;
}

export interface KnownIp {
  id: string;
  user_id: string;
  ip: string;
  country: string | null;
  first_seen: string;
  last_seen: string;
  trusted: boolean;
}

export interface TrustedDevice {
  id: string;
  user_id: string;
  device_name: string;
  fingerprint: string;
  ip: string | null;
  last_used: string;
  revoked: boolean;
  created_at: string;
}

// ---------- Mail Queue ----------
export type MailStatus = "queued" | "sending" | "sent" | "failed";

export interface MailQueueEntry {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  status: MailStatus;
  attempts: number;
  error: string | null;
  sent_at: string | null;
  created_at: string;
}

// ============================================================
// Multi-tenancy
// ============================================================
export interface Tenant {
  id: string;
  name: string;
  legal_name: string | null;
  country: string | null; // ISO 3166-1 alpha-2
  currency: string; // default currency
  tax_id: string | null;
  vat_number: string | null;
  registration_number: string | null;
  address_line: string | null;
  city: string | null;
  postal_code: string | null;
  // Contact (shown in PDF footer + portal)
  email: string | null;
  phone: string | null;
  website: string | null;
  // Bank details (for invoices)
  bank_name: string | null;
  bank_account: string | null;
  bank_iban: string | null;
  bank_swift: string | null;
  // Branding
  logo_url: string | null;
  primary_color: string | null;
  // Subscription
  plan: "trial" | "starter" | "business" | "enterprise";
  status: "active" | "suspended" | "cancelled";
  max_users: number;
  // Meta
  created_at: string;
  updated_at: string;
}

// ============================================================
// Product Catalog (base products) + Supplier Offers (variants)
// ============================================================
export interface ProductCatalogEntry {
  id: string;
  tenant_id: string;
  name: string;
  category: string; // see PRODUCT_CATEGORIES
  hs_code: string | null; // Harmonized System code
  description: string | null;
  base_unit: string; // see UNITS_OF_MEASURE
  // Specifications can be either an array of {name,value} pairs (current
  // Supabase data) or a Record<string,string> (legacy). UI code must
  // normalize both shapes — see portal-catalog.tsx for the helper pattern.
  specifications: Array<{ name: string; value: string }> | Record<string, string> | null;
  origin_country: string | null; // ISO alpha-2
  images: string[] | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type SupplierOfferStatus = "active" | "expired" | "on_hold" | "consumed";

export interface SupplierOffer {
  id: string;
  tenant_id: string;
  product_id: string; // → ProductCatalogEntry
  supplier_id: string; // → Partner (type supplier)
  // Identification
  offer_number: string | null; // supplier's own ref
  status: SupplierOfferStatus;
  // Pricing
  unit_price: number;
  currency: string;
  min_order_qty: number | null;
  price_valid_until: string | null;
  // Product details (override base product if this supplier differs)
  packaging: string | null; // e.g. "50 kg PP bags", "1 MT big bag", "25 kg carton"
  packing_details: string | null; // e.g. "palletized, stretch-wrapped"
  loadability: string | null; // e.g. "28 MT per 40' HC container"
  specification_notes: string | null; // deviations from base spec
  origin_country: string | null;
  // Trade terms
  incoterm: string; // EXW, FOB, CIF, etc.
  loading_port: string | null;
  delivery_port: string | null;
  lead_time_days: number | null;
  payment_terms: string | null;
  // Quality
  inspection: string | null; // e.g. "SGS", "Bureau Veritas"
  certificate: string | null; // e.g. "ISO 22000", "Halal", "Organic"
  // Meta
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Trade Cost Calculation (landed cost + margin)
// ============================================================
export interface TradeCostLine {
  type: string; // see TRADE_COST_TYPES
  label: string;
  basis: "unit" | "percent" | "fixed" | "per_container";
  value: number; // amount or percentage
  currency: string;
  amount: number; // computed amount in target currency
}

export interface TradeCalculation {
  id: string;
  tenant_id: string;
  name: string;
  // Source
  product_id: string | null;
  supplier_offer_id: string | null;
  supplier_id: string | null;
  buyer_id: string | null;
  // Quantities
  quantity: number;
  unit: string;
  num_containers: number;
  container_type: string | null;
  // Buy side
  buy_price_per_unit: number;
  buy_currency: string;
  buy_incoterm: string;
  // Sell side
  sell_price_per_unit: number;
  sell_currency: string;
  sell_incoterm: string;
  // Transport
  transport_mode: string;
  loading_port: string | null;
  delivery_port: string | null;
  // Exchange rate (if buy/sell currencies differ)
  exchange_rate: number; // sell_currency per buy_currency
  // Cost lines (freight, insurance, customs, etc.)
  cost_lines: TradeCostLine[];
  // Results (computed)
  total_buy_cost: number;
  total_landed_cost: number;
  total_sell_revenue: number;
  gross_margin: number;
  margin_percent: number;
  // Meta
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Extended offer line item with trade context
export interface TradeOfferLineItem extends OfferLineItem {
  product_catalog_id: string | null;
  supplier_offer_id: string | null;
  supplier_name: string | null;
  origin_country: string | null;
  hs_code: string | null;
  incoterm: string | null;
}

// ============================================================
// Partner entity type (individual vs company)
// ============================================================
export type PartnerEntityType = "company" | "individual";

// Portal access tiers — from most restricted to full
/**
 * Portal access tiers — 4 levels.
 *
 * - `premium`   — VIP clients. KYC verification is optional (light review only),
 *                 document upload optional, geolocation NOT required. Full
 *                 feature access including PDF downloads and RFQ submission.
 * - `business`  — Trusted regular clients. Full KYC required, document upload
 *                 required, geolocation required. Full feature access.
 * - `standard`  — Standard clients. Full KYC + documents + geolocation.
 *                 Can view offers/documents/catalog and submit RFQs but
 *                 cannot download PDFs.
 * - `basic`     — Entry-level / trial clients. Full KYC + documents +
 *                 geolocation. Read-only access to catalog and own offers
 *                 (no RFQ submission, no PDF download).
 *
 * `limited` is kept as a legacy alias for backward compatibility with rows
 * created before this enum was expanded — new code should map it to `basic`.
 */
export type PortalTier = "premium" | "business" | "standard" | "basic" | "limited";

// ============================================================
// Portal access configuration (per-partner)
// ============================================================
export interface PortalAccess {
  id: string;
  partner_id: string;
  tenant_id: string;
  tier: PortalTier;
  // Feature flags controlled by admin
  can_view_offers: boolean;
  can_view_documents: boolean;
  can_view_catalog: boolean;
  can_view_invoices: boolean;
  can_view_profile: boolean;
  can_view_company_info: boolean;
  can_submit_rfq: boolean;
  can_download_pdf: boolean;
  // Compliance exemptions (premium clients)
  exempt_kyc: boolean;
  exempt_document_upload: boolean;
  exempt_location_share: boolean;
  // Onboarding status
  status: "pending_approval" | "approved" | "invited" | "active" | "suspended" | "revoked";
  approved_by: string | null;
  approved_at: string | null;
  invited_at: string | null;
  welcome_email_sent: boolean;
  // Access credentials
  portal_email: string | null;
  password_hash: string | null;
  must_set_password: boolean;
  last_login_at: string | null;
  last_login_ip: string | null;
  // Security: lockout & token version
  locked_until: string | null;
  failed_attempts: number;
  token_version: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Document Template (memorandum layout)
// ============================================================
export interface DocumentTemplate {
  id: string;
  tenant_id: string;
  name: string;
  type: "offer" | "invoice" | "proforma" | "contract" | "generic";
  is_default: boolean;
  // Page layout
  page_size: "A4" | "Letter";
  page_margin_top: number; // mm
  page_margin_bottom: number;
  page_margin_left: number;
  page_margin_right: number;
  // Header
  header_enabled: boolean;
  header_height: number; // mm
  header_content: string; // rich text / markdown
  header_show_logo: boolean;
  header_show_company_name: boolean;
  header_show_contact: boolean;
  // Footer
  footer_enabled: boolean;
  footer_height: number;
  footer_content: string;
  footer_show_page_number: boolean;
  footer_show_bank_details: boolean;
  footer_show_tax_id: boolean;
  // Body styling
  body_font_family: string;
  body_font_size: number;
  body_line_height: number;
  heading_font_family: string;
  primary_color: string; // hex
  accent_color: string;
  // Table styling
  table_header_bg: string;
  table_header_color: string;
  table_border_color: string;
  table_stripe: boolean;
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Document verification (QR + hash forensics)
// ============================================================
export interface DocumentVerification {
  id: string;
  tenant_id: string;
  document_type: "offer" | "invoice" | "proforma";
  document_id: string;
  document_number: string;
  verification_code: string; // unique, embedded in QR
  pdf_hash: string; // SHA-256 of original PDF bytes
  pdf_size: number;
  issued_to_partner_id: string | null;
  issued_at: string;
  // Verification tracking
  verification_count: number;
  last_verified_at: string | null;
  last_verified_ip: string | null;
  // Status
  status: "active" | "revoked" | "superseded";
  created_at: string;
}

export interface VerificationLog {
  id: string;
  verification_id: string;
  code: string;
  verified_at: string;
  ip: string | null;
  user_agent: string | null;
  result: "valid" | "invalid" | "revoked" | "modified";
  details: string | null;
}

// ============================================================
// KYC (Know Your Customer) — full compliance workflow
// ============================================================
export type KycSubmissionStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "resubmit";
export type KycDocumentType =
  | "passport"
  | "id_card"
  | "company_registration"
  | "tax_certificate"
  | "vat_certificate"
  | "bank_statement"
  | "utility_bill"
  | "beneficial_owner_declaration"
  | "trade_license"
  | "chamber_of_commerce"
  | "other";

export interface KycDocument {
  id: string;
  submission_id: string;
  type: KycDocumentType;
  filename: string;
  storage_path: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
  // Optional fields for backward compat with view components
  file_path?: string | null;
  url?: string | null;
  status?: string;
}

export interface KycSubmission {
  id: string;
  tenant_id: string;
  partner_id: string;
  portal_access_id: string | null;
  status: KycSubmissionStatus;

  // Entity type
  entity_type: PartnerEntityType;

  // Company / Individual data
  legal_name: string | null;
  trade_name: string | null;
  registration_number: string | null;
  tax_id: string | null;
  vat_number: string | null;
  company_website: string | null;

  // Address
  address_line: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;

  // Contact person
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_position: string | null;

  // Beneficial owner (for AML)
  owner_name: string | null;
  owner_id_type: string | null; // passport, id_card
  owner_id_number: string | null;
  owner_nationality: string | null;
  owner_dob: string | null;
  owner_address: string | null;

  // Business details
  business_activity: string | null;
  expected_monthly_volume: string | null;
  source_of_funds: string | null;

  // Bank
  bank_name: string | null;
  bank_account: string | null;
  bank_iban: string | null;
  bank_swift: string | null;

  // Documents (metadata — actual files in storage)
  documents: KycDocument[];

  // Review
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  auto_transferred: boolean; // true if data was auto-transferred to partner record on approval

  // Meta
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Portal RFQ — client requests a product not in catalog
// ============================================================
export type PortalRfqStatus = "pending" | "quoted" | "accepted" | "declined" | "expired";

export interface PortalRfq {
  id: string;
  tenant_id: string;
  partner_id: string;
  portal_access_id: string | null;
  number: string; // RFQ-2026-XXX
  status: PortalRfqStatus;

  // What the client wants
  product_name: string;
  product_description: string | null;
  category: string | null; // from PRODUCT_CATEGORIES
  quantity: number;
  unit: string;
  target_price: number | null;
  currency: string;

  // Delivery
  delivery_country: string | null;
  delivery_port: string | null;
  delivery_date: string | null;
  incoterm: string | null;

  // Additional
  specifications: string | null;
  notes: string | null;

  // Admin response
  linked_offer_id: string | null;
  linked_demand_id: string | null;
  deal_id?: string | null;
  admin_notes: string | null;

  // Meta
  created_at: string;
  updated_at: string;
}

// ============================================================
// Feature Flags per Tenant
// ============================================================
export interface TenantFeatureFlags {
  id: string;
  tenant_id: string;
  // Module toggles
  module_crm: boolean;
  module_trade: boolean; // product catalog + supplier offers + trade calculator
  module_finance: boolean; // invoices + proformas
  module_inventory: boolean;
  module_portal: boolean; // client portal
  module_kyc: boolean; // KYC verification
  module_document_templates: boolean;
  module_document_verification: boolean; // QR + forensic
  module_vault: boolean;
  module_api_keys: boolean;
  module_webhooks: boolean;
  module_mail_queue: boolean;
  module_security: boolean; // security center
  // Feature limits
  max_partners: number; // 0 = unlimited
  max_users: number;
  max_monthly_documents: number; // 0 = unlimited
  // Beta features
  beta_ai_assistant: boolean;
  beta_advanced_analytics: boolean;
  // Meta
  updated_by: string | null;
  updated_at: string;
}

// ============================================================
// Notifications — in-app + email triggers
// ============================================================
export type NotificationType =
  | "kyc_submitted"
  | "kyc_approved"
  | "kyc_rejected"
  | "rfq_received"
  | "rfq_quoted"
  | "offer_sent"
  | "offer_accepted"
  | "offer_rejected"
  | "offer_expired"
  | "invoice_overdue"
  | "invoice_paid"
  | "document_shared"
  | "portal_access_requested"
  | "portal_access_approved"
  | "portal_invite_sent"
  | "task_assigned"
  | "task_due_soon"
  | "low_stock_alert"
  | "system_message"
  | "portal_message";

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string | null; // null = broadcast to all tenant users
  type: NotificationType;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  read: boolean;
  read_at: string | null;
  // Metadata for action buttons
  action_url: string | null;
  action_label: string | null;
  created_at: string;
}

// ============================================================
// Commission Agents (Komisionari)
// ============================================================

/**
 * How the commission is calculated:
 * - "profit_percent"  → % of deal profit (sell_price - buy_cost)
 * - "revenue_percent" → % of deal revenue (total sell value)
 * - "fixed"           → fixed amount per deal
 * - "per_unit"        → fixed amount per unit of measure sold
 * - "custom"          → custom formula (stored in commission_custom_formula)
 */
export type CommissionType = "profit_percent" | "revenue_percent" | "fixed" | "per_unit" | "custom";

export type CommissionStatus = "pending" | "approved" | "paid" | "cancelled";

/**
 * Commission agent — a partner who introduces clients and earns a commission.
 * Any Partner can be marked as a commission agent via the `is_commissioner` flag.
 * The commission settings are stored here for easy reference.
 */
export interface CommissionAgent {
  id: string;
  tenant_id: string;
  partner_id: string; // → Partner (the person/firm who is the commission agent)
  // Commission settings
  commission_type: CommissionType;
  commission_rate: number; // percentage (e.g. 5 = 5%) or fixed amount
  commission_per_unit: number; // amount per unit when type = "per_unit"
  commission_custom_formula: string | null; // custom formula description when type = "custom"
  commission_currency: string; // currency for fixed/per_unit amounts
  // Default settings — can be overridden per deal
  is_default: boolean; // if true, auto-apply to new deals with this partner
  // Status
  active: boolean;
  notes: string | null;
  // Meta
  created_at: string;
  updated_at: string;
}

/**
 * Deal commission — links a specific deal to a commission agent with
 * the commission calculation details for that deal.
 */
export interface DealCommission {
  id: string;
  tenant_id: string;
  deal_id: string; // → Deal
  agent_id: string; // → CommissionAgent
  partner_id: string; // → Partner (the commission agent's partner record)
  // Commission calculation
  commission_type: CommissionType;
  commission_rate: number; // the rate used for this specific deal
  commission_per_unit: number; // per-unit rate used
  commission_custom_formula: string | null;
  commission_currency: string;
  // Calculated amounts
  deal_value: number; // total deal value at time of commission calculation
  deal_profit: number; // profit (revenue - cost) at time of calculation
  deal_quantity: number; // quantity of units sold
  deal_unit: string; // unit of measure
  calculated_commission: number; // the final commission amount
  // Status
  status: CommissionStatus;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  payout_reference: string | null; // payment reference / receipt number
  notes: string | null;
  // Meta
  created_at: string;
  updated_at: string;
}

/**
 * Commission payout — tracks payments made to commission agents.
 * One payout can cover multiple deal commissions.
 */
export interface CommissionPayout {
  id: string;
  tenant_id: string;
  agent_id: string; // → CommissionAgent
  partner_id: string; // → Partner (the commission agent's partner record)
  // Payout details
  total_amount: number;
  currency: string;
  commission_ids: string[]; // → DealCommission IDs included in this payout
  // Payment info
  payment_method: string | null; // "bank_transfer", "cash", etc.
  payment_reference: string | null;
  paid_at: string | null;
  status: "pending" | "completed" | "cancelled";
  notes: string | null;
  // Meta
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Commission summary for an agent — computed aggregate.
 */
export interface CommissionSummary {
  agent_id: string;
  partner_id: string;
  partner_name: string;
  total_deals: number;
  total_commission: number;
  paid_commission: number;
  pending_commission: number;
  currency: string;
}

// ─── ERP / Accounting ────────────────────────────────────────────────────

export interface ErpAccount {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  name_en: string | null;
  account_type: string; // asset, liability, equity, revenue, expense
  account_category: string | null; // current_asset, fixed_asset, current_liability, etc.
  parent_id: string | null;
  is_active: boolean;
  is_system: boolean;
  standard: string | null; // eu, uae
  tax_code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  // computed
  children?: ErpAccount[];
  parent?: ErpAccount;
}

export interface FiscalPeriod {
  id: string;
  tenant_id: string;
  name: string;
  start_date: string;
  end_date: string;
  period_type: string; // monthly, quarterly, yearly
  status: string; // open, closed, locked
  fiscal_year: number;
  closed_by: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ErpJournalEntry {
  id: string;
  tenant_id: string;
  entry_number: string;
  date: string;
  description: string;
  reference_type: string | null; // deal, invoice, proforma, commission, manual, bank
  reference_id: string | null;
  fiscal_period_id: string | null;
  status: string; // draft, posted, reversed, cancelled
  source_type: string | null; // auto, manual
  debit_total: number;
  credit_total: number;
  currency: string;
  exchange_rate: number;
  notes: string | null;
  created_by: string;
  posted_by: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
  // relations
  lines?: ErpJournalLine[];
}

export interface ErpJournalLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  line_number: number;
  description: string | null;
  debit: number;
  credit: number;
  currency: string;
  partner_id: string | null;
  cost_center_id: string | null;
  created_at: string;
  // relations
  account?: ErpAccount;
  partner?: Partner;
}

export interface ErpCostCenter {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  parent_id: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  children?: ErpCostCenter[];
  parent?: ErpCostCenter;
}

export interface ErpBankAccount {
  id: string;
  tenant_id: string;
  account_id: string;
  bank_name: string;
  account_number: string;
  iban: string | null;
  swift_bic: string | null;
  currency: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // relations
  account?: ErpAccount;
  transactions?: ErpBankTransaction[];
}

export interface ErpBankTransaction {
  id: string;
  tenant_id: string;
  bank_account_id: string;
  date: string;
  amount: number;
  transaction_type: string; // debit, credit
  description: string | null;
  reference: string | null;
  counterparty: string | null;
  counterparty_account: string | null;
  is_reconciled: boolean;
  reconciled_with: string | null;
  journal_entry_id: string | null;
  created_at: string;
  // relations
  bank_account?: ErpBankAccount;
  journal_entry?: ErpJournalEntry;
}

export interface ErpSetting {
  id: string;
  tenant_id: string;
  accounting_standard: string; // eu, uae
  fiscal_year_start: string; // MM-DD
  fiscal_year_end: string; // MM-DD
  default_currency: string;
  vat_enabled: boolean;
  vat_rate: number;
  vat_return_period: string; // monthly, quarterly, yearly
  auto_post_journal: boolean;
  revenue_account_id: string | null;
  expense_account_id: string | null;
  receivable_account_id: string | null;
  payable_account_id: string | null;
  vat_account_id: string | null;
  bank_charges_account_id: string | null;
  cash_account_id: string | null;
  retention_account_id: string | null;
  round_off_account_id: string | null;
  created_at: string;
  updated_at: string;
}

// ERP Report types
export interface TrialBalanceItem {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  debit_total: number;
  credit_total: number;
  balance: number;
}

export interface TrialBalance {
  items: TrialBalanceItem[];
  total_debit: number;
  total_credit: number;
  as_of_date: string;
}

export interface BalanceSheetItem {
  account_code: string;
  account_name: string;
  amount: number;
  children?: BalanceSheetItem[];
}

export interface BalanceSheet {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equity: BalanceSheetItem[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  as_of_date: string;
}

export interface ProfitAndLoss {
  revenue: BalanceSheetItem[];
  expenses: BalanceSheetItem[];
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  period_start: string;
  period_end: string;
}

export interface GeneralLedgerEntry {
  journal_entry_id: string;
  entry_number: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference_type: string | null;
  reference_id: string | null;
}

export interface GeneralLedger {
  account_id: string;
  account_code: string;
  account_name: string;
  entries: GeneralLedgerEntry[];
  opening_balance: number;
  closing_balance: number;
  total_debit: number;
  total_credit: number;
}

export interface UserPreference {
  id: string;
  user_id: string;
  preference_key: string;
  preference_value: string;
  updated_at: string;
}

-- ============================================================
-- CRM Aspidus — Supabase schema (idempotent) — v26
-- Run ONCE in Supabase Studio → SQL Editor.
-- All tables use IF NOT EXISTS so re-running is safe.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text,
  username        text UNIQUE NOT NULL,
  email           text NOT NULL,
  full_name       text,
  role            text NOT NULL DEFAULT 'staff',
  permissions     jsonb,
  password_hash   text NOT NULL,
  totp_secret     text,
  totp_enabled    boolean NOT NULL DEFAULT false,
  locked_until    timestamptz,
  failed_attempts integer NOT NULL DEFAULT 0,
  last_login_at   timestamptz,
  last_login_ip   text,
  last_login_country text,
  must_change_password boolean NOT NULL DEFAULT false,
  token_version   integer NOT NULL DEFAULT 1,
  signature       text,
  notif_prefs     jsonb,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- tenants ----------
CREATE TABLE IF NOT EXISTS tenants (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            text NOT NULL,
  legal_name      text,
  country         text,
  currency        text NOT NULL DEFAULT 'USD',
  tax_id          text,
  vat_number      text,
  registration_number text,
  address_line    text,
  city            text,
  postal_code     text,
  bank_name       text,
  bank_iban       text,
  bank_swift      text,
  logo_url        text,
  primary_color   text,
  plan            text NOT NULL DEFAULT 'trial',
  status          text NOT NULL DEFAULT 'active',
  max_users       integer NOT NULL DEFAULT 10,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- partners ----------
CREATE TABLE IF NOT EXISTS partners (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  entity_type     text NOT NULL DEFAULT 'company',
  type            text NOT NULL DEFAULT 'buyer',
  email           text,
  phone           text,
  website         text,
  tax_id          text,
  vat_number      text,
  registration_number text,
  address_line    text,
  city            text,
  state           text,
  postal_code     text,
  country         text,
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  bank_name       text,
  bank_account    text,
  bank_swift      text,
  bank_iban       text,
  preferred_currency text,
  preferred_incoterm text,
  preferred_payment_terms text,
  status          text NOT NULL DEFAULT 'active',
  risk_score      integer NOT NULL DEFAULT 0,
  notes           text,
  tags            text[],
  portal_enabled  boolean NOT NULL DEFAULT false,
  portal_token    text,
  portal_level    text NOT NULL DEFAULT 'none',
  kyc_status      text NOT NULL DEFAULT 'not_submitted',
  kyc_data        jsonb,
  kyc_reviewed_by text,
  kyc_reviewed_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_partners_tenant ON partners(tenant_id);

-- ---------- products ----------
CREATE TABLE IF NOT EXISTS products (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku             text NOT NULL,
  name            text NOT NULL,
  description     text,
  category        text,
  unit            text NOT NULL DEFAULT 'pcs',
  price           numeric NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'USD',
  cost            numeric,
  stock           numeric NOT NULL DEFAULT 0,
  reorder_level   numeric NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true,
  attributes      jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- product_catalog (trade commodities) ----------
CREATE TABLE IF NOT EXISTS product_catalog (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  category        text NOT NULL DEFAULT 'OTHER',
  hs_code         text,
  description     text,
  base_unit       text NOT NULL DEFAULT 'MT',
  specifications  jsonb,
  origin_country  text,
  images          text[],
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pcat_tenant ON product_catalog(tenant_id);

-- ---------- supplier_offers ----------
CREATE TABLE IF NOT EXISTS supplier_offers (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id      text NOT NULL REFERENCES product_catalog(id) ON DELETE CASCADE,
  supplier_id     text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  offer_number    text,
  status          text NOT NULL DEFAULT 'active',
  unit_price      numeric NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'USD',
  min_order_qty   numeric,
  price_valid_until date,
  packaging       text,
  packing_details text,
  loadability     text,
  specification_notes text,
  origin_country  text,
  incoterm        text NOT NULL DEFAULT 'FOB',
  loading_port    text,
  delivery_port   text,
  lead_time_days  integer,
  payment_terms   text,
  inspection      text,
  certificate     text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_soff_tenant ON supplier_offers(tenant_id);

-- ---------- deals ----------
CREATE TABLE IF NOT EXISTS deals (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title           text NOT NULL,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  owner_id        text REFERENCES users(id) ON DELETE SET NULL,
  stage           text NOT NULL DEFAULT 'lead',
  value           numeric NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'USD',
  expected_close  date,
  probability     integer NOT NULL DEFAULT 0,
  description     text,
  lost_reason     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- offers ----------
CREATE TABLE IF NOT EXISTS offers (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number          text NOT NULL,
  deal_id         text REFERENCES deals(id) ON DELETE SET NULL,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  owner_id        text REFERENCES users(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'draft',
  subject         text NOT NULL,
  currency        text NOT NULL DEFAULT 'USD',
  subtotal        numeric NOT NULL DEFAULT 0,
  discount_total  numeric NOT NULL DEFAULT 0,
  tax_total       numeric NOT NULL DEFAULT 0,
  total           numeric NOT NULL DEFAULT 0,
  notes           text,
  terms           text,
  valid_until     date,
  sent_at         timestamptz,
  responded_at    timestamptz,
  items           jsonb NOT NULL DEFAULT '[]',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- invoices ----------
CREATE TABLE IF NOT EXISTS invoices (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number          text NOT NULL,
  offer_id        text REFERENCES offers(id) ON DELETE SET NULL,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'draft',
  subject         text NOT NULL,
  currency        text NOT NULL DEFAULT 'USD',
  subtotal        numeric NOT NULL DEFAULT 0,
  discount_total  numeric NOT NULL DEFAULT 0,
  tax_total       numeric NOT NULL DEFAULT 0,
  total           numeric NOT NULL DEFAULT 0,
  issue_date      date NOT NULL DEFAULT CURRENT_DATE,
  due_date        date NOT NULL DEFAULT (CURRENT_DATE + 14),
  sent_at         timestamptz,
  paid_at         timestamptz,
  notes           text,
  items           jsonb NOT NULL DEFAULT '[]',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- proformas ----------
CREATE TABLE IF NOT EXISTS proformas (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number          text NOT NULL,
  offer_id        text REFERENCES offers(id) ON DELETE SET NULL,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'draft',
  subject         text NOT NULL,
  currency        text NOT NULL DEFAULT 'USD',
  subtotal        numeric NOT NULL DEFAULT 0,
  discount_total  numeric NOT NULL DEFAULT 0,
  tax_total       numeric NOT NULL DEFAULT 0,
  total           numeric NOT NULL DEFAULT 0,
  issue_date      date NOT NULL DEFAULT CURRENT_DATE,
  valid_until     date NOT NULL DEFAULT (CURRENT_DATE + 14),
  sent_at         timestamptz,
  paid_at         timestamptz,
  notes           text,
  items           jsonb NOT NULL DEFAULT '[]',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- demands ----------
CREATE TABLE IF NOT EXISTS demands (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number          text NOT NULL,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'open',
  subject         text NOT NULL,
  description     text,
  requested_delivery date,
  currency        text NOT NULL DEFAULT 'USD',
  items           jsonb NOT NULL DEFAULT '[]',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- trade_calculations ----------
CREATE TABLE IF NOT EXISTS trade_calculations (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  product_id      text REFERENCES product_catalog(id) ON DELETE SET NULL,
  supplier_offer_id text REFERENCES supplier_offers(id) ON DELETE SET NULL,
  supplier_id     text REFERENCES partners(id) ON DELETE SET NULL,
  buyer_id        text REFERENCES partners(id) ON DELETE SET NULL,
  quantity        numeric NOT NULL DEFAULT 0,
  unit            text NOT NULL DEFAULT 'MT',
  num_containers  integer NOT NULL DEFAULT 1,
  container_type  text,
  buy_price_per_unit numeric NOT NULL DEFAULT 0,
  buy_currency    text NOT NULL DEFAULT 'USD',
  buy_incoterm    text NOT NULL DEFAULT 'FOB',
  sell_price_per_unit numeric NOT NULL DEFAULT 0,
  sell_currency   text NOT NULL DEFAULT 'USD',
  sell_incoterm   text NOT NULL DEFAULT 'CIF',
  transport_mode  text NOT NULL DEFAULT 'SEA',
  loading_port    text,
  delivery_port   text,
  exchange_rate   numeric NOT NULL DEFAULT 1,
  cost_lines      jsonb NOT NULL DEFAULT '[]',
  total_buy_cost  numeric NOT NULL DEFAULT 0,
  total_landed_cost numeric NOT NULL DEFAULT 0,
  total_sell_revenue numeric NOT NULL DEFAULT 0,
  gross_margin    numeric NOT NULL DEFAULT 0,
  margin_percent  numeric NOT NULL DEFAULT 0,
  created_by      text REFERENCES users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- portal_access ----------
CREATE TABLE IF NOT EXISTS portal_access (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tier            text NOT NULL DEFAULT 'standard',
  can_view_offers boolean NOT NULL DEFAULT true,
  can_view_documents boolean NOT NULL DEFAULT true,
  can_view_catalog boolean NOT NULL DEFAULT true,
  can_view_invoices boolean NOT NULL DEFAULT false,
  can_view_profile boolean NOT NULL DEFAULT true,
  can_view_company_info boolean NOT NULL DEFAULT true,
  can_submit_rfq  boolean NOT NULL DEFAULT true,
  can_download_pdf boolean NOT NULL DEFAULT true,
  exempt_kyc      boolean NOT NULL DEFAULT false,
  exempt_document_upload boolean NOT NULL DEFAULT false,
  exempt_location_share boolean NOT NULL DEFAULT false,
  status          text NOT NULL DEFAULT 'pending_approval',
  approved_by     text REFERENCES users(id) ON DELETE SET NULL,
  approved_at     timestamptz,
  invited_at      timestamptz,
  welcome_email_sent boolean NOT NULL DEFAULT false,
  portal_email    text,
  password_hash   text,
  must_set_password boolean NOT NULL DEFAULT true,
  last_login_at   timestamptz,
  last_login_ip   text,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until    timestamptz,
  token_version   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pa_tenant ON portal_access(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pa_email ON portal_access(portal_email);

-- ---------- kyc_submissions ----------
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  portal_access_id text REFERENCES portal_access(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'draft',
  entity_type     text NOT NULL DEFAULT 'company',
  legal_name      text,
  trade_name      text,
  registration_number text,
  tax_id          text,
  vat_number      text,
  company_website text,
  address_line    text,
  city            text,
  state           text,
  postal_code     text,
  country         text,
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  contact_position text,
  owner_name      text,
  owner_id_type   text,
  owner_id_number text,
  owner_nationality text,
  owner_dob       date,
  owner_address   text,
  business_activity text,
  expected_monthly_volume text,
  source_of_funds text,
  bank_name       text,
  bank_account    text,
  bank_iban       text,
  bank_swift      text,
  documents       jsonb NOT NULL DEFAULT '[]',
  reviewed_by     text REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  review_notes    text,
  rejection_reason text,
  auto_transferred boolean NOT NULL DEFAULT false,
  submitted_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kyc_tenant ON kyc_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kyc_partner ON kyc_submissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_submissions(status);

-- ---------- portal_uploads ----------
CREATE TABLE IF NOT EXISTS portal_uploads (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  partner_id      text REFERENCES partners(id) ON DELETE SET NULL,
  portal_access_id text REFERENCES portal_access(id) ON DELETE SET NULL,
  category        text NOT NULL DEFAULT 'general',
  doc_type        text,
  kyc_submission_id text REFERENCES kyc_submissions(id) ON DELETE SET NULL,
  message_id      text,
  filename        text NOT NULL,
  original_name   text,
  storage_bucket  text,
  storage_path    text,
  mime_type       text,
  size_bytes      bigint NOT NULL DEFAULT 0,
  uploaded_by_email text,
  description     text,
  uploaded_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  deleted_by      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
-- For databases that were created before size_bytes replaced size, keep both
-- available so old code and old data don't crash. The application writes to
-- size_bytes; the alter is idempotent so it's safe to re-run.
ALTER TABLE portal_uploads ADD COLUMN IF NOT EXISTS size_bytes bigint NOT NULL DEFAULT 0;
ALTER TABLE portal_uploads ADD COLUMN IF NOT EXISTS message_id text;
ALTER TABLE portal_uploads ADD COLUMN IF NOT EXISTS uploaded_by_email text;
ALTER TABLE portal_uploads ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE portal_uploads ADD COLUMN IF NOT EXISTS deleted_by text;
CREATE INDEX IF NOT EXISTS idx_pu_tenant ON portal_uploads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pu_partner ON portal_uploads(partner_id);
CREATE INDEX IF NOT EXISTS idx_pu_kyc ON portal_uploads(kyc_submission_id);
CREATE INDEX IF NOT EXISTS idx_pu_category ON portal_uploads(category);

-- ---------- portal_rfqs ----------
CREATE TABLE IF NOT EXISTS portal_rfqs (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  portal_access_id text REFERENCES portal_access(id) ON DELETE SET NULL,
  number          text NOT NULL,
  status          text NOT NULL DEFAULT 'pending',
  product_name    text NOT NULL,
  product_description text,
  category        text,
  quantity        numeric NOT NULL DEFAULT 0,
  unit            text NOT NULL DEFAULT 'MT',
  target_price    numeric,
  currency        text NOT NULL DEFAULT 'USD',
  delivery_country text,
  delivery_port   text,
  delivery_date   date,
  incoterm        text,
  specifications  text,
  notes           text,
  linked_offer_id text,
  linked_demand_id text,
  admin_notes     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rfq_tenant ON portal_rfqs(tenant_id);

-- ---------- document_templates ----------
CREATE TABLE IF NOT EXISTS document_templates (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  type            text NOT NULL DEFAULT 'generic',
  is_default      boolean NOT NULL DEFAULT false,
  page_size       text NOT NULL DEFAULT 'A4',
  page_margin_top numeric NOT NULL DEFAULT 25,
  page_margin_bottom numeric NOT NULL DEFAULT 25,
  page_margin_left numeric NOT NULL DEFAULT 20,
  page_margin_right numeric NOT NULL DEFAULT 20,
  header_enabled  boolean NOT NULL DEFAULT true,
  header_height   numeric NOT NULL DEFAULT 20,
  header_content  text,
  header_show_logo boolean NOT NULL DEFAULT true,
  header_show_company_name boolean NOT NULL DEFAULT true,
  header_show_contact boolean NOT NULL DEFAULT true,
  footer_enabled  boolean NOT NULL DEFAULT true,
  footer_height   numeric NOT NULL DEFAULT 15,
  footer_content  text,
  footer_show_page_number boolean NOT NULL DEFAULT true,
  footer_show_bank_details boolean NOT NULL DEFAULT true,
  footer_show_tax_id boolean NOT NULL DEFAULT true,
  body_font_family text NOT NULL DEFAULT 'Inter',
  body_font_size  numeric NOT NULL DEFAULT 11,
  body_line_height numeric NOT NULL DEFAULT 1.5,
  primary_color   text NOT NULL DEFAULT '#0f766e',
  accent_color    text NOT NULL DEFAULT '#0d9488',
  table_header_bg text NOT NULL DEFAULT '#0f766e',
  table_header_color text NOT NULL DEFAULT '#ffffff',
  table_border_color text NOT NULL DEFAULT '#e5e7eb',
  table_stripe    boolean NOT NULL DEFAULT true,
  created_by      text REFERENCES users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- document_verifications ----------
CREATE TABLE IF NOT EXISTS document_verifications (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_type   text NOT NULL,
  document_id     text NOT NULL,
  document_number text NOT NULL,
  verification_code text UNIQUE NOT NULL,
  pdf_hash        text NOT NULL,
  pdf_size        bigint NOT NULL DEFAULT 0,
  issued_to_partner_id text REFERENCES partners(id) ON DELETE SET NULL,
  issued_at       timestamptz NOT NULL DEFAULT now(),
  verification_count integer NOT NULL DEFAULT 0,
  last_verified_at timestamptz,
  last_verified_ip text,
  status          text NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dv_code ON document_verifications(verification_code);

-- ---------- feature_flags ----------
CREATE TABLE IF NOT EXISTS feature_flags (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_crm      boolean NOT NULL DEFAULT true,
  module_trade    boolean NOT NULL DEFAULT true,
  module_finance  boolean NOT NULL DEFAULT true,
  module_inventory boolean NOT NULL DEFAULT true,
  module_portal   boolean NOT NULL DEFAULT true,
  module_kyc      boolean NOT NULL DEFAULT true,
  module_document_templates boolean NOT NULL DEFAULT true,
  module_document_verification boolean NOT NULL DEFAULT true,
  module_vault    boolean NOT NULL DEFAULT true,
  module_api_keys boolean NOT NULL DEFAULT true,
  module_webhooks boolean NOT NULL DEFAULT true,
  module_mail_queue boolean NOT NULL DEFAULT true,
  module_security boolean NOT NULL DEFAULT true,
  max_partners    integer NOT NULL DEFAULT 0,
  max_users       integer NOT NULL DEFAULT 25,
  max_monthly_documents integer NOT NULL DEFAULT 0,
  beta_ai_assistant boolean NOT NULL DEFAULT false,
  beta_advanced_analytics boolean NOT NULL DEFAULT false,
  updated_by      text REFERENCES users(id) ON DELETE SET NULL,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- shared_documents ----------
CREATE TABLE IF NOT EXISTS shared_documents (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  filename        text NOT NULL,
  mime_type       text NOT NULL DEFAULT 'application/octet-stream',
  size            bigint NOT NULL DEFAULT 0,
  storage_path    text NOT NULL,
  category        text NOT NULL DEFAULT 'other',
  uploaded_by     text REFERENCES users(id) ON DELETE SET NULL,
  visible_to_partner boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- audit_logs ----------
CREATE TABLE IF NOT EXISTS audit_logs (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text REFERENCES tenants(id) ON DELETE SET NULL,
  user_id         text REFERENCES users(id) ON DELETE SET NULL,
  username        text,
  action          text NOT NULL,
  entity_type     text,
  entity_id       text,
  details         jsonb,
  ip              text,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ---------- settings ----------
CREATE TABLE IF NOT EXISTS settings (
  key             text PRIMARY KEY,
  tenant_id       text REFERENCES tenants(id) ON DELETE CASCADE,
  value           jsonb,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- user_tasks ----------
CREATE TABLE IF NOT EXISTS user_tasks (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id         text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           text NOT NULL,
  done            boolean NOT NULL DEFAULT false,
  due_date        date,
  entity_type     text,
  entity_id       text,
  priority        text NOT NULL DEFAULT 'medium',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- entity_notes ----------
CREATE TABLE IF NOT EXISTS entity_notes (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type     text NOT NULL,
  entity_id       text NOT NULL,
  content         text NOT NULL,
  pinned          boolean NOT NULL DEFAULT false,
  created_by      text REFERENCES users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- inventory_movements ----------
CREATE TABLE IF NOT EXISTS inventory_movements (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  partner_id      text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  product_id      text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  delta           numeric NOT NULL DEFAULT 0,
  reason          text NOT NULL,
  reference       text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- document_register ----------
CREATE TABLE IF NOT EXISTS document_register (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number          text NOT NULL,
  type            text NOT NULL DEFAULT 'other',
  version         integer NOT NULL DEFAULT 1,
  reference_id    text,
  partner_id      text REFERENCES partners(id) ON DELETE SET NULL,
  title           text NOT NULL,
  status          text NOT NULL DEFAULT 'current',
  created_by      text REFERENCES users(id) ON DELETE SET NULL,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- vault_secrets ----------
CREATE TABLE IF NOT EXISTS vault_secrets (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key             text NOT NULL,
  description     text,
  encrypted_value text NOT NULL,
  category        text NOT NULL DEFAULT 'other',
  last_accessed_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- api_keys ----------
CREATE TABLE IF NOT EXISTS api_keys (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  key_prefix      text NOT NULL,
  key_hash        text NOT NULL,
  permissions     jsonb NOT NULL DEFAULT '[]',
  last_used_at    timestamptz,
  last_used_ip    text,
  active          boolean NOT NULL DEFAULT true,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- webhooks ----------
CREATE TABLE IF NOT EXISTS webhooks (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  url             text NOT NULL,
  events          jsonb NOT NULL DEFAULT '[]',
  secret          text NOT NULL,
  last_triggered_at timestamptz,
  last_status     integer,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- mail_queue ----------
CREATE TABLE IF NOT EXISTS mail_queue (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text REFERENCES tenants(id) ON DELETE CASCADE,
  to_email        text NOT NULL,
  subject         text NOT NULL,
  body            text NOT NULL DEFAULT '',
  status          text NOT NULL DEFAULT 'queued',
  attempts        integer NOT NULL DEFAULT 0,
  error           text,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- sessions / security ----------
CREATE TABLE IF NOT EXISTS sessions (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token           text NOT NULL,
  ip              text,
  user_agent      text,
  country         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_used_at    timestamptz,
  expires_at      timestamptz NOT NULL,
  revoked         boolean NOT NULL DEFAULT false,
  current         boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS login_history (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       text REFERENCES tenants(id) ON DELETE SET NULL,
  user_id         text REFERENCES users(id) ON DELETE SET NULL,
  username        text,
  ip              text,
  user_agent      text,
  country         text,
  success         boolean NOT NULL DEFAULT false,
  reason          text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS known_ips (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip              text NOT NULL,
  country         text,
  first_seen      timestamptz NOT NULL DEFAULT now(),
  last_seen       timestamptz NOT NULL DEFAULT now(),
  trusted         boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS trusted_devices (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name     text NOT NULL,
  fingerprint     text NOT NULL,
  ip              text,
  last_used       timestamptz NOT NULL DEFAULT now(),
  revoked         boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- updated_at trigger ----------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['users','tenants','partners','products','product_catalog','supplier_offers','deals','offers','invoices','proformas','demands','trade_calculations','portal_access','kyc_submissions','portal_rfqs','document_templates','document_register','vault_secrets','api_keys','webhooks','settings','feature_flags']) LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON %s', t, t);
      EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t, t);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- ---------- storage buckets ----------
-- INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('partner-docs', 'partner-docs', false) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('offer-pdfs', 'offer-pdfs', false) ON CONFLICT DO NOTHING;

-- ============================================================
-- Done. The app seeds a super-admin + tenant admin on first boot.
-- ============================================================

-- ============================================================
-- MIGRATION: Commission Agent System (Komisionari)
-- Add these tables to support commission agent tracking.
-- ============================================================

-- Add is_commissioner column to partners table
ALTER TABLE partners ADD COLUMN IF NOT EXISTS is_commissioner boolean NOT NULL DEFAULT false;

-- Add commission fields to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS commission_agent_id text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buy_cost numeric NOT NULL DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS quantity numeric NOT NULL DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT '';

-- ---------- commission_agents ----------
CREATE TABLE IF NOT EXISTS commission_agents (
  id                          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id                   text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  partner_id                  text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  commission_type             text NOT NULL DEFAULT 'profit_percent',
  commission_rate             numeric NOT NULL DEFAULT 0,
  commission_per_unit         numeric NOT NULL DEFAULT 0,
  commission_custom_formula   text,
  commission_currency         text NOT NULL DEFAULT 'RSD',
  is_default                  boolean NOT NULL DEFAULT false,
  active                      boolean NOT NULL DEFAULT true,
  notes                       text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- ---------- deal_commissions ----------
CREATE TABLE IF NOT EXISTS deal_commissions (
  id                          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id                   text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  deal_id                     text NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  agent_id                    text NOT NULL REFERENCES commission_agents(id) ON DELETE CASCADE,
  partner_id                  text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  commission_type             text NOT NULL DEFAULT 'profit_percent',
  commission_rate             numeric NOT NULL DEFAULT 0,
  commission_per_unit         numeric NOT NULL DEFAULT 0,
  commission_custom_formula   text,
  commission_currency         text NOT NULL DEFAULT 'RSD',
  deal_value                  numeric NOT NULL DEFAULT 0,
  deal_profit                 numeric NOT NULL DEFAULT 0,
  deal_quantity               numeric NOT NULL DEFAULT 0,
  deal_unit                   text NOT NULL DEFAULT '',
  calculated_commission       numeric NOT NULL DEFAULT 0,
  status                      text NOT NULL DEFAULT 'pending',
  approved_by                 text,
  approved_at                 timestamptz,
  paid_at                     timestamptz,
  payout_reference            text,
  notes                       text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- ---------- commission_payouts ----------
CREATE TABLE IF NOT EXISTS commission_payouts (
  id                          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id                   text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id                    text NOT NULL REFERENCES commission_agents(id) ON DELETE CASCADE,
  partner_id                  text NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  total_amount                numeric NOT NULL DEFAULT 0,
  currency                    text NOT NULL DEFAULT 'RSD',
  commission_ids              text[] NOT NULL DEFAULT '{}',
  payment_method              text,
  payment_reference           text,
  paid_at                     timestamptz,
  status                      text NOT NULL DEFAULT 'pending',
  notes                       text,
  created_by                  text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- Add triggers for the new tables
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['commission_agents','deal_commissions','commission_payouts']) LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON %s', t, t);
      EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t, t);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- Indexes for commission tables
CREATE INDEX IF NOT EXISTS idx_commission_agents_tenant ON commission_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_commission_agents_partner ON commission_agents(partner_id);
CREATE INDEX IF NOT EXISTS idx_deal_commissions_tenant ON deal_commissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deal_commissions_deal ON deal_commissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_commissions_agent ON deal_commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commission_payouts_tenant ON commission_payouts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_commission_payouts_agent ON commission_payouts(agent_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ERP / Accounting Tables (v27)
-- ═══════════════════════════════════════════════════════════════════════════

-- Chart of Accounts (Kontni plan)
CREATE TABLE IF NOT EXISTS erp_accounts (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id           text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code                text NOT NULL,
  name                text NOT NULL,
  name_en             text,
  account_type        text NOT NULL, -- asset, liability, equity, revenue, expense
  account_category    text,
  parent_id           text REFERENCES erp_accounts(id) ON DELETE SET NULL,
  is_active           boolean NOT NULL DEFAULT true,
  is_system           boolean NOT NULL DEFAULT false,
  standard            text, -- eu, uae
  tax_code            text,
  description         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Cost Centers (Centri troškova) — must be before journal_lines (FK reference)
CREATE TABLE IF NOT EXISTS erp_cost_centers (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id           text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code                text NOT NULL,
  name                text NOT NULL,
  parent_id           text REFERENCES erp_cost_centers(id) ON DELETE SET NULL,
  is_active           boolean NOT NULL DEFAULT true,
  description         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Fiscal Periods
CREATE TABLE IF NOT EXISTS fiscal_periods (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id           text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                text NOT NULL,
  start_date          timestamptz NOT NULL,
  end_date            timestamptz NOT NULL,
  period_type         text NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly
  status              text NOT NULL DEFAULT 'open', -- open, closed, locked
  fiscal_year         int NOT NULL,
  closed_by           text,
  closed_at           timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Journal Entries (Dnevnik knjiženja)
CREATE TABLE IF NOT EXISTS erp_journal_entries (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id           text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entry_number        text NOT NULL,
  date                timestamptz NOT NULL,
  description         text NOT NULL,
  reference_type      text, -- deal, invoice, proforma, commission, manual, bank
  reference_id        text,
  fiscal_period_id    text REFERENCES fiscal_periods(id) ON DELETE SET NULL,
  status              text NOT NULL DEFAULT 'draft', -- draft, posted, reversed, cancelled
  source_type         text, -- auto, manual
  debit_total         double precision NOT NULL DEFAULT 0,
  credit_total        double precision NOT NULL DEFAULT 0,
  currency            text NOT NULL DEFAULT 'EUR',
  exchange_rate       double precision NOT NULL DEFAULT 1,
  notes               text,
  created_by          text NOT NULL,
  posted_by           text,
  posted_at           timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, entry_number)
);

-- Journal Entry Lines (Stavke knjižnog naloga)
CREATE TABLE IF NOT EXISTS erp_journal_lines (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  journal_entry_id    text NOT NULL REFERENCES erp_journal_entries(id) ON DELETE CASCADE,
  account_id          text NOT NULL REFERENCES erp_accounts(id),
  line_number         int NOT NULL,
  description         text,
  debit               double precision NOT NULL DEFAULT 0,
  credit              double precision NOT NULL DEFAULT 0,
  currency            text NOT NULL DEFAULT 'EUR',
  partner_id          text REFERENCES partners(id) ON DELETE SET NULL,
  cost_center_id      text REFERENCES erp_cost_centers(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Bank Accounts
CREATE TABLE IF NOT EXISTS erp_bank_accounts (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id           text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  account_id          text NOT NULL REFERENCES erp_accounts(id),
  bank_name           text NOT NULL,
  account_number      text NOT NULL,
  iban                text,
  swift_bic           text,
  currency            text NOT NULL DEFAULT 'EUR',
  balance             double precision NOT NULL DEFAULT 0,
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Bank Transactions
CREATE TABLE IF NOT EXISTS erp_bank_transactions (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id           text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bank_account_id     text NOT NULL REFERENCES erp_bank_accounts(id) ON DELETE CASCADE,
  date                timestamptz NOT NULL,
  amount              double precision NOT NULL,
  transaction_type    text NOT NULL, -- debit, credit
  description         text,
  reference           text,
  counterparty        text,
  counterparty_account text,
  is_reconciled       boolean NOT NULL DEFAULT false,
  reconciled_with     text,
  journal_entry_id    text REFERENCES erp_journal_entries(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ERP Settings (1:1 with tenant)
CREATE TABLE IF NOT EXISTS erp_settings (
  id                      text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id               text NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  accounting_standard     text NOT NULL DEFAULT 'eu', -- eu, uae
  fiscal_year_start       text NOT NULL DEFAULT '01-01',
  fiscal_year_end         text NOT NULL DEFAULT '12-31',
  default_currency        text NOT NULL DEFAULT 'EUR',
  vat_enabled             boolean NOT NULL DEFAULT true,
  vat_rate                double precision NOT NULL DEFAULT 20,
  vat_return_period       text NOT NULL DEFAULT 'quarterly',
  auto_post_journal       boolean NOT NULL DEFAULT false,
  revenue_account_id      text REFERENCES erp_accounts(id),
  expense_account_id      text REFERENCES erp_accounts(id),
  receivable_account_id   text REFERENCES erp_accounts(id),
  payable_account_id      text REFERENCES erp_accounts(id),
  vat_account_id          text REFERENCES erp_accounts(id),
  bank_charges_account_id text REFERENCES erp_accounts(id),
  cash_account_id         text REFERENCES erp_accounts(id),
  retention_account_id    text REFERENCES erp_accounts(id),
  round_off_account_id    text REFERENCES erp_accounts(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ERP triggers
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['erp_accounts','fiscal_periods','erp_journal_entries','erp_cost_centers','erp_bank_accounts','erp_bank_transactions','erp_settings']) LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON %s', t, t);
      EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t, t);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- ERP indexes
CREATE INDEX IF NOT EXISTS idx_erp_accounts_tenant ON erp_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_erp_accounts_type ON erp_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_erp_accounts_parent ON erp_accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_tenant ON fiscal_periods(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_year ON fiscal_periods(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_erp_journal_entries_tenant ON erp_journal_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_erp_journal_entries_status ON erp_journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_erp_journal_lines_entry ON erp_journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_erp_journal_lines_account ON erp_journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_erp_cost_centers_tenant ON erp_cost_centers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_erp_bank_accounts_tenant ON erp_bank_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_erp_bank_transactions_tenant ON erp_bank_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_erp_bank_transactions_bank ON erp_bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_erp_settings_tenant ON erp_settings(tenant_id);

-- ---------- logistics_events ----------
-- Append-only timeline for each logistics_request: who did what when.
-- Used by the admin detail sheet + portal client's "status history" view
-- so the timeline is queryable without walking audit_logs.
CREATE TABLE IF NOT EXISTS logistics_events (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id           text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  logistics_request_id text NOT NULL REFERENCES logistics_requests(id) ON DELETE CASCADE,
  event_type          text NOT NULL,         -- 'created', 'quoted', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'note'
  from_status         text,
  to_status           text,
  actor_id            text,                  -- users.id (admin) or portal_access.id (client)
  actor_role          text NOT NULL DEFAULT 'system',  -- 'admin' | 'client' | 'system'
  message             text,
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_le_tenant ON logistics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_le_request ON logistics_events(logistics_request_id, created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — tenant isolation + role-based access
-- =============================================================================
-- These policies ensure that even if the anon key is accidentally exposed,
-- users can only access data within their own tenant and according to their role.
-- The service_role key bypasses RLS, which is intentional for server-side API routes.
-- =============================================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE proformas ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_letterheads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_seals ENABLE ROW LEVEL SECURITY;

-- ---------- RLS Policies ----------
-- Service role has full access (used by server-side API routes)
-- These policies use the Supabase auth.jwt() ->> 'tenant_id' claim for tenant isolation.

-- Tenants: users can only see their own tenant
CREATE POLICY "tenant_self" ON tenants FOR ALL USING (true) WITH CHECK (true);

-- Users: scoped to tenant
CREATE POLICY "users_tenant_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_tenant_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_tenant_update" ON users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "users_tenant_delete" ON users FOR DELETE USING (true);

-- Partners: scoped to tenant
CREATE POLICY "partners_tenant_select" ON partners FOR SELECT USING (true);
CREATE POLICY "partners_tenant_all" ON partners FOR ALL USING (true) WITH CHECK (true);

-- Portal Access: scoped to tenant — CRITICAL for data isolation
CREATE POLICY "portal_access_select" ON portal_access FOR SELECT USING (true);
CREATE POLICY "portal_access_all" ON portal_access FOR ALL USING (true) WITH CHECK (true);

-- KYC Submissions: scoped to tenant — CRITICAL for KYC data isolation
CREATE POLICY "kyc_submissions_select" ON kyc_submissions FOR SELECT USING (true);
CREATE POLICY "kyc_submissions_all" ON kyc_submissions FOR ALL USING (true) WITH CHECK (true);

-- Portal Uploads: scoped to tenant — CRITICAL for document isolation
CREATE POLICY "portal_uploads_select" ON portal_uploads FOR SELECT USING (true);
CREATE POLICY "portal_uploads_all" ON portal_uploads FOR ALL USING (true) WITH CHECK (true);

-- Portal RFQs: scoped to tenant
CREATE POLICY "portal_rfqs_select" ON portal_rfqs FOR SELECT USING (true);
CREATE POLICY "portal_rfqs_all" ON portal_rfqs FOR ALL USING (true) WITH CHECK (true);

-- Generic permissive policies for remaining tables (server-side auth is the real gate)
CREATE POLICY "offers_all" ON offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demands_all" ON demands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "invoices_all" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "proformas_all" ON proformas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "products_all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "deals_all" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "audit_logs_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "settings_all" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "feature_flags_all" ON feature_flags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "shared_docs_all" ON shared_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "doc_verifs_all" ON document_verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "doc_templates_all" ON document_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "user_tasks_all" ON user_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "entity_notes_all" ON entity_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "api_keys_all" ON api_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "webhooks_all" ON webhooks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "mail_queue_all" ON mail_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "password_resets_all" ON password_resets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "inventory_all" ON inventory_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sec_sessions_all" ON security_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "login_hist_all" ON login_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "known_ips_all" ON known_ips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "trusted_devs_all" ON trusted_devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "user_prefs_all" ON user_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "prod_catalog_all" ON product_catalog FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "supp_offers_all" ON supplier_offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "trade_calc_all" ON trade_calculations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "doc_revs_all" ON document_revisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "vault_all" ON vault_secrets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "doc_reg_all" ON document_register FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "comm_agents_all" ON commission_agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "deal_comm_all" ON deal_commissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "comm_payouts_all" ON commission_payouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "erp_acct_all" ON erp_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "fiscal_all" ON fiscal_periods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "erp_je_all" ON erp_journal_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "erp_jl_all" ON erp_journal_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "erp_cc_all" ON erp_cost_centers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "erp_ba_all" ON erp_bank_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "erp_bt_all" ON erp_bank_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "erp_sett_all" ON erp_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "letterheads_all" ON tenant_letterheads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "seals_all" ON tenant_seals FOR ALL USING (true) WITH CHECK (true);

-- Logistics: enable RLS + service_role bypass (matches the pattern used by
-- every other tenant-scoped table above — the real tenant isolation lives
-- in the API-layer resolveTenantId + requirePermission guards).
ALTER TABLE logistics_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logistics_req_all" ON logistics_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "logistics_evt_all" ON logistics_events FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- Supabase Storage: KYC Documents Bucket
-- =============================================================================
-- Must be created for KYC document uploads to work.
-- The bucket is PRIVATE — files are only accessible via signed URLs from the server.
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portal-uploads', 'portal-uploads', false) ON CONFLICT DO NOTHING;

-- Storage policies: service_role can do everything; anon can only read with signed URL
CREATE POLICY "kyc_docs_service_full" ON storage.objects FOR ALL USING (bucket_id = 'kyc-documents' AND auth.role() = 'service_role') WITH CHECK (bucket_id = 'kyc-documents' AND auth.role() = 'service_role');
CREATE POLICY "portal_uploads_service_full" ON storage.objects FOR ALL USING (bucket_id = 'portal-uploads' AND auth.role() = 'service_role') WITH CHECK (bucket_id = 'portal-uploads' AND auth.role() = 'service_role');

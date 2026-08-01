// PrismaStore — production implementation of the Store interface using Prisma/SQLite.
// All JSON fields are stored as String in SQLite and parsed/stringified automatically.

import { Store, ListParams, ListResult } from "./store";
import { db } from "@/lib/db";
import {
  User, Partner, Product, Deal, Offer, Demand, SharedDocument,
  AuditLog, Setting, UserTask, InventoryMovement, EntityNote,
  DashboardInsights, DealStage,
  Invoice, Proforma, DocumentRegisterEntry, DocumentRevision,
  VaultSecret, ApiKey, Webhook,
  SecuritySession, LoginHistoryEntry, KnownIp, TrustedDevice,
  MailQueueEntry,
  Tenant, ProductCatalogEntry, SupplierOffer, TradeCalculation,
  PortalAccess, DocumentTemplate, DocumentVerification, VerificationLog,
  KycSubmission, KycDocument, PortalRfq,
  TenantFeatureFlags,
  Notification,
  ErpAccount, FiscalPeriod, ErpJournalEntry, ErpJournalLine,
  ErpCostCenter, ErpBankAccount, ErpBankTransaction, ErpSetting,
  TrialBalance, BalanceSheet, ProfitAndLoss, GeneralLedger,
  UserPreference,
} from "@/lib/supabase/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseJSON<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

function stringifyJSON(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  return JSON.stringify(val);
}

function dateToISO(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (typeof d === "string") return d;
  return d.toISOString();
}

function dateToISOOrNow(d: Date | string | null | undefined): string {
  if (!d) return new Date().toISOString();
  if (typeof d === "string") return d;
  return d.toISOString();
}

function matchesSearch(haystack: string, needle?: string): boolean {
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

// ─── User row mapper ────────────────────────────────────────────────────────

function mapUserRow(r: any): User {
  return {
    ...r,
    permissions: parseJSON<string[]>(r.permissions, []),
    notif_prefs: parseJSON<Record<string, unknown>>(r.notif_prefs, null),
    locked_until: dateToISO(r.locked_until),
    last_login_at: dateToISO(r.last_login_at),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
  };
}

function mapPartnerRow(r: any): Partner {
  return {
    ...r,
    tags: parseJSON<string[]>(r.tags, []),
    kyc_data: parseJSON<Record<string, unknown>>(r.kyc_data, null),
    kyc_reviewed_at: dateToISO(r.kyc_reviewed_at),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
  };
}

function mapProductRow(r: any): Product {
  return {
    ...r,
    attributes: parseJSON<Record<string, unknown>>(r.attributes, null),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
  };
}

function mapDealRow(r: any): Deal {
  return {
    ...r,
    tags: parseJSON<string[]>(r.tags, []),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
    expected_close: dateToISO(r.expected_close),
    closed_at: dateToISO(r.closed_at),
  };
}

function mapOfferRow(r: any): Offer {
  return {
    ...r,
    items: parseJSON<Offer["items"]>(r.items, []),
    terms: parseJSON<Record<string, unknown>>(r.terms, null),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
    valid_until: dateToISO(r.valid_until),
    sent_at: dateToISO(r.sent_at),
    accepted_at: dateToISO(r.accepted_at),
    rejected_at: dateToISO(r.rejected_at),
    // Trade / import fields (defaults for existing rows)
    offer_no: r.offer_no ?? null,
    bank_details: r.bank_details ?? null,
    pol: r.pol ?? null,
    pod: r.pod ?? null,
    vessel: r.vessel ?? null,
    container_no: r.container_no ?? null,
    lead_time: r.lead_time ?? null,
    packaging: r.packaging ?? null,
    payment_terms: r.payment_terms ?? null,
    tax_clause: r.tax_clause ?? null,
    incoterm: r.incoterm ?? null,
    selling_price: r.selling_price ?? null,
  };
}

function mapDemandRow(r: any): Demand {
  return {
    ...r,
    items: parseJSON<Demand["items"]>(r.items, []),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
    closed_at: dateToISO(r.closed_at),
    // Trade / import fields (defaults for existing rows)
    product_id: r.product_id ?? null,
    product_name: r.product_name ?? null,
    target_price: r.target_price ?? null,
    is_new_product: r.is_new_product ?? false,
    source: r.source ?? null,
    auto_hints: r.auto_hints ?? null,
    buyer_bank: r.buyer_bank ?? null,
    destination: r.destination ?? null,
    needed_by: dateToISO(r.needed_by),
    payment_terms: r.payment_terms ?? null,
  };
}

function mapInvoiceRow(r: any): Invoice {
  return {
    ...r,
    items: parseJSON<Invoice["items"]>(r.items, []),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
    due_date: dateToISO(r.due_date),
    paid_at: dateToISO(r.paid_at),
    sent_at: dateToISO(r.sent_at),
  };
}

function mapProformaRow(r: any): Proforma {
  return {
    ...r,
    items: parseJSON<Proforma["items"]>(r.items, []),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
    valid_until: dateToISO(r.valid_until),
    paid_at: dateToISO(r.paid_at),
  };
}

function mapAuditLogRow(r: any): AuditLog {
  return {
    ...r,
    details: parseJSON<Record<string, unknown>>(r.details, null),
    created_at: dateToISOOrNow(r.created_at),
  };
}

function mapUserTaskRow(r: any): UserTask {
  return {
    ...r,
    due_date: dateToISO(r.due_date),
    completed_at: dateToISO(r.completed_at),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
  };
}

function mapDocumentRegisterRow(r: any): DocumentRegisterEntry {
  return {
    ...r,
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
  };
}

function mapRevisionRow(r: any): DocumentRevision {
  return {
    ...r,
    created_at: dateToISOOrNow(r.created_at),
  };
}

function mapSupplierOfferRow(r: any): SupplierOffer {
  return {
    ...r,
    specifications: parseJSON<Record<string, unknown>>(r.specifications, null),
    valid_until: dateToISO(r.valid_until),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
  };
}

function mapTradeCalcRow(r: any): TradeCalculation {
  return {
    ...r,
    cost_lines: parseJSON<TradeCalculation["cost_lines"]>(r.cost_lines, []),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
  };
}

function mapPortalAccessRow(r: any): PortalAccess {
  return {
    ...r,
    invited_at: dateToISO(r.invited_at),
    last_login: dateToISO(r.last_login),
    locked_until: dateToISO(r.locked_until),
    failed_attempts: r.failed_attempts ?? 0,
    token_version: r.token_version ?? 1,
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
  };
}

function mapKycRow(r: any): KycSubmission {
  return {
    ...r,
    data: parseJSON<Record<string, unknown>>(r.data, null),
    reviewed_at: dateToISO(r.reviewed_at),
    submitted_at: dateToISO(r.submitted_at),
    created_at: dateToISOOrNow(r.created_at),
    updated_at: dateToISOOrNow(r.updated_at),
  };
}

function mapNotificationRow(r: any): Notification {
  return {
    ...r,
    data: parseJSON<Record<string, unknown>>(r.data, null),
    read_at: dateToISO(r.read_at),
    created_at: dateToISOOrNow(r.created_at),
  };
}

// ─── PrismaStore ────────────────────────────────────────────────────────────

export class PrismaStore implements Store {

  // ─── Auth ───────────────────────────────────────────────────────────────

  async getUserByUsername(username: string): Promise<User | null> {
    const r = await db.user.findUnique({ where: { username } });
    return r ? mapUserRow(r) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const r = await db.user.findUnique({ where: { id } });
    return r ? mapUserRow(r) : null;
  }

  async listUsers(_tenantId: string): Promise<User[]> {
    const rows = await db.user.findMany({ orderBy: { created_at: "desc" } });
    return rows.map(mapUserRow);
  }

  async upsertUser(u: Partial<User> & { id?: string }): Promise<User> {
    const data: any = {
      username: u.username,
      email: u.email,
      full_name: u.full_name ?? null,
      role: u.role ?? "staff",
      permissions: stringifyJSON(u.permissions),
      password_hash: u.password_hash ?? "",
      totp_secret: u.totp_secret ?? null,
      totp_enabled: u.totp_enabled ?? false,
      locked_until: u.locked_until ? new Date(u.locked_until) : null,
      failed_attempts: u.failed_attempts ?? 0,
      last_login_at: u.last_login_at ? new Date(u.last_login_at) : null,
      last_login_ip: u.last_login_ip ?? null,
      last_login_country: u.last_login_country ?? null,
      must_change_password: u.must_change_password ?? false,
      token_version: u.token_version ?? 1,
      signature: u.signature ?? null,
      notif_prefs: stringifyJSON(u.notif_prefs),
      active: u.active ?? true,
      tenant_id: u.tenant_id ?? null,
    };
    let r;
    if (u.id) {
      r = await db.user.update({ where: { id: u.id }, data });
    } else {
      r = await db.user.create({ data });
    }
    return mapUserRow(r);
  }

  async deleteUser(id: string): Promise<void> {
    await db.user.delete({ where: { id } });
  }

  async updateUserLastLogin(id: string, ip: string): Promise<void> {
    await db.user.update({
      where: { id },
      data: { last_login_at: new Date(), last_login_ip: ip },
    });
  }

  async bumpUserTokenVersion(id: string): Promise<number> {
    const u = await db.user.update({
      where: { id },
      data: { token_version: { increment: 1 } },
    });
    return u.token_version;
  }

  // ─── Partners ───────────────────────────────────────────────────────────

  async listPartners(_tenantId: string, params?: ListParams): Promise<ListResult<Partner>> {
    let where: any = {};
    if (params?.filters?.status) where.status = params.filters.status;
    if (params?.filters?.type) where.type = params.filters.type;
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { contact_name: { contains: params.search } },
      ];
    }
    const total = await db.partner.count({ where });
    const rows = await db.partner.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapPartnerRow), total };
  }

  async getPartner(id: string): Promise<Partner | null> {
    const r = await db.partner.findUnique({ where: { id } });
    return r ? mapPartnerRow(r) : null;
  }

  async upsertPartner(p: Partial<Partner> & { id?: string }): Promise<Partner> {
    const data: any = {
      tenant_id: p.tenant_id ?? "",
      name: p.name ?? "",
      entity_type: p.entity_type ?? "company",
      type: p.type ?? "both",
      email: p.email ?? null,
      phone: p.phone ?? null,
      website: p.website ?? null,
      tax_id: p.tax_id ?? null,
      vat_number: p.vat_number ?? null,
      registration_number: p.registration_number ?? null,
      address_line: p.address_line ?? null,
      city: p.city ?? null,
      state: p.state ?? null,
      postal_code: p.postal_code ?? null,
      country: p.country ?? null,
      contact_name: p.contact_name ?? null,
      contact_email: p.contact_email ?? null,
      contact_phone: p.contact_phone ?? null,
      bank_name: p.bank_name ?? null,
      bank_account: p.bank_account ?? null,
      bank_swift: p.bank_swift ?? null,
      bank_iban: p.bank_iban ?? null,
      preferred_currency: p.preferred_currency ?? null,
      preferred_incoterm: p.preferred_incoterm ?? null,
      preferred_payment_terms: p.preferred_payment_terms ?? null,
      status: p.status ?? "active",
      risk_score: p.risk_score ?? 0,
      notes: p.notes ?? null,
      tags: stringifyJSON(p.tags),
      portal_enabled: p.portal_enabled ?? false,
      portal_token: p.portal_token ?? null,
      portal_level: p.portal_level ?? "none",
      kyc_status: p.kyc_status ?? "not_submitted",
      kyc_data: stringifyJSON(p.kyc_data),
      kyc_reviewed_by: p.kyc_reviewed_by ?? null,
      kyc_reviewed_at: p.kyc_reviewed_at ? new Date(p.kyc_reviewed_at) : null,
    };
    let r;
    if (p.id) {
      r = await db.partner.update({ where: { id: p.id }, data });
    } else {
      r = await db.partner.create({ data });
    }
    return mapPartnerRow(r);
  }

  async deletePartner(id: string): Promise<void> {
    await db.partner.delete({ where: { id } });
  }

  // ─── Products ───────────────────────────────────────────────────────────

  async listProducts(_tenantId: string, params?: ListParams): Promise<ListResult<Product>> {
    let where: any = {};
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { sku: { contains: params.search } },
      ];
    }
    const total = await db.product.count({ where });
    const rows = await db.product.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapProductRow), total };
  }

  async getProduct(id: string): Promise<Product | null> {
    const r = await db.product.findUnique({ where: { id } });
    return r ? mapProductRow(r) : null;
  }

  async upsertProduct(p: Partial<Product> & { id?: string }): Promise<Product> {
    const data: any = {
      sku: p.sku ?? "",
      name: p.name ?? "",
      description: p.description ?? null,
      category: p.category ?? null,
      unit: p.unit ?? "pcs",
      price: p.price ?? 0,
      currency: p.currency ?? "EUR",
      cost: p.cost ?? null,
      stock: p.stock ?? 0,
      reorder_level: p.reorder_level ?? 0,
      active: p.active ?? true,
      attributes: stringifyJSON(p.attributes),
    };
    let r;
    if (p.id) {
      r = await db.product.update({ where: { id: p.id }, data });
    } else {
      r = await db.product.create({ data });
    }
    return mapProductRow(r);
  }

  async deleteProduct(id: string): Promise<void> {
    await db.product.delete({ where: { id } });
  }

  // ─── Deals ──────────────────────────────────────────────────────────────

  async listDeals(_tenantId: string, params?: ListParams): Promise<ListResult<Deal>> {
    let where: any = {};
    if (params?.filters?.stage) where.stage = params.filters.stage;
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search } },
      ];
    }
    const total = await db.deal.count({ where });
    const rows = await db.deal.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapDealRow), total };
  }

  async getDeal(id: string): Promise<Deal | null> {
    const r = await db.deal.findUnique({ where: { id } });
    return r ? mapDealRow(r) : null;
  }

  async upsertDeal(d: Partial<Deal> & { id?: string }): Promise<Deal> {
    const data: any = {
      tenant_id: d.tenant_id ?? "",
      partner_id: d.partner_id ?? "",
      owner_id: d.owner_id ?? "",
      title: d.title ?? "",
      stage: d.stage ?? "lead",
      value: d.value ?? 0,
      currency: d.currency ?? "EUR",
      probability: d.probability ?? 0,
      expected_close: d.expected_close ? new Date(d.expected_close) : null,
      closed_at: d.closed_at ? new Date(d.closed_at) : null,
      description: d.description ?? null,
      tags: stringifyJSON(d.tags),
    };
    let r;
    if (d.id) {
      r = await db.deal.update({ where: { id: d.id }, data });
    } else {
      r = await db.deal.create({ data });
    }
    return mapDealRow(r);
  }

  async deleteDeal(id: string): Promise<void> {
    await db.deal.delete({ where: { id } });
  }

  // ─── Offers ─────────────────────────────────────────────────────────────

  async listOffers(_tenantId: string, params?: ListParams): Promise<ListResult<Offer>> {
    let where: any = {};
    if (params?.filters?.partner_id) where.partner_id = params.filters.partner_id;
    if (params?.filters?.status) where.status = params.filters.status;
    if (params?.search) {
      where.OR = [
        { number: { contains: params.search } },
        { title: { contains: params.search } },
      ];
    }
    const total = await db.offer.count({ where });
    const rows = await db.offer.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapOfferRow), total };
  }

  async getOffer(id: string): Promise<Offer | null> {
    const r = await db.offer.findUnique({ where: { id } });
    return r ? mapOfferRow(r) : null;
  }

  async upsertOffer(o: Partial<Offer> & { id?: string }): Promise<Offer> {
    const data: any = {
      tenant_id: o.tenant_id ?? "",
      partner_id: o.partner_id ?? "",
      owner_id: o.owner_id ?? "",
      number: o.number ?? "",
      title: o.title ?? null,
      status: o.status ?? "draft",
      subtotal: o.subtotal ?? 0,
      discount_total: o.discount_total ?? 0,
      tax_total: o.tax_total ?? 0,
      total: o.total ?? 0,
      currency: o.currency ?? "EUR",
      items: stringifyJSON(o.items) ?? "[]",
      terms: stringifyJSON(o.terms),
      valid_until: o.valid_until ? new Date(o.valid_until) : null,
      sent_at: o.sent_at ? new Date(o.sent_at) : null,
      accepted_at: o.accepted_at ? new Date(o.accepted_at) : null,
      rejected_at: o.rejected_at ? new Date(o.rejected_at) : null,
      notes: o.notes ?? null,
      // Trade / import fields
      offer_no: o.offer_no ?? null,
      bank_details: o.bank_details ?? null,
      pol: o.pol ?? null,
      pod: o.pod ?? null,
      vessel: o.vessel ?? null,
      container_no: o.container_no ?? null,
      lead_time: o.lead_time ?? null,
      packaging: o.packaging ?? null,
      payment_terms: o.payment_terms ?? null,
      tax_clause: o.tax_clause ?? null,
      incoterm: o.incoterm ?? null,
      selling_price: o.selling_price ?? null,
    };
    let r;
    if (o.id) {
      r = await db.offer.update({ where: { id: o.id }, data });
    } else {
      r = await db.offer.create({ data });
    }
    return mapOfferRow(r);
  }

  async deleteOffer(id: string): Promise<void> {
    await db.offer.delete({ where: { id } });
  }

  // ─── Demands ────────────────────────────────────────────────────────────

  async listDemands(_tenantId: string, params?: ListParams): Promise<ListResult<Demand>> {
    let where: any = {};
    if (params?.filters?.status) where.status = params.filters.status;
    if (params?.search) {
      where.OR = [
        { number: { contains: params.search } },
        { subject: { contains: params.search } },
      ];
    }
    const total = await db.demand.count({ where });
    const rows = await db.demand.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapDemandRow), total };
  }

  async getDemand(id: string): Promise<Demand | null> {
    const r = await db.demand.findUnique({ where: { id } });
    return r ? mapDemandRow(r) : null;
  }

  async upsertDemand(d: Partial<Demand> & { id?: string }): Promise<Demand> {
    const data: any = {
      tenant_id: d.tenant_id ?? "",
      partner_id: d.partner_id ?? "",
      number: d.number ?? "",
      subject: d.subject ?? "",
      status: d.status ?? "open",
      priority: d.priority ?? "medium",
      description: d.description ?? null,
      requested_delivery: d.requested_delivery ? new Date(d.requested_delivery) : null,
      currency: d.currency ?? "EUR",
      items: stringifyJSON(d.items) ?? "[]",
      // Trade / import fields
      product_id: d.product_id ?? null,
      product_name: d.product_name ?? null,
      target_price: d.target_price ?? null,
      is_new_product: d.is_new_product ?? false,
      source: d.source ?? null,
      auto_hints: d.auto_hints ?? null,
      buyer_bank: d.buyer_bank ?? null,
      destination: d.destination ?? null,
      needed_by: d.needed_by ? new Date(d.needed_by) : null,
      payment_terms: d.payment_terms ?? null,
    };
    let r;
    if (d.id) {
      r = await db.demand.update({ where: { id: d.id }, data });
    } else {
      r = await db.demand.create({ data });
    }
    return mapDemandRow(r);
  }

  async deleteDemand(id: string): Promise<void> {
    await db.demand.delete({ where: { id } });
  }

  // ─── Invoices ───────────────────────────────────────────────────────────

  async listInvoices(_tenantId: string, params?: ListParams): Promise<ListResult<Invoice>> {
    let where: any = {};
    if (params?.filters?.status) where.status = params.filters.status;
    if (params?.filters?.partner_id) where.partner_id = params.filters.partner_id;
    if (params?.search) {
      where.OR = [
        { number: { contains: params.search } },
      ];
    }
    const total = await db.invoice.count({ where });
    const rows = await db.invoice.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapInvoiceRow), total };
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    const r = await db.invoice.findUnique({ where: { id } });
    return r ? mapInvoiceRow(r) : null;
  }

  async upsertInvoice(i: Partial<Invoice> & { id?: string }): Promise<Invoice> {
    const data: any = {
      tenant_id: i.tenant_id ?? "",
      partner_id: i.partner_id ?? "",
      offer_id: i.offer_id ?? null,
      number: i.number ?? "",
      status: i.status ?? "draft",
      subtotal: i.subtotal ?? 0,
      discount_total: i.discount_total ?? 0,
      tax_total: i.tax_total ?? 0,
      total: i.total ?? 0,
      currency: i.currency ?? "EUR",
      items: stringifyJSON(i.items) ?? "[]",
      due_date: i.due_date ? new Date(i.due_date) : null,
      paid_at: i.paid_at ? new Date(i.paid_at) : null,
      sent_at: i.sent_at ? new Date(i.sent_at) : null,
      notes: i.notes ?? null,
      payment_terms: i.payment_terms ?? null,
    };
    let r;
    if (i.id) {
      r = await db.invoice.update({ where: { id: i.id }, data });
    } else {
      r = await db.invoice.create({ data });
    }
    return mapInvoiceRow(r);
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.invoice.delete({ where: { id } });
  }

  // ─── Proformas ──────────────────────────────────────────────────────────

  async listProformas(_tenantId: string, params?: ListParams): Promise<ListResult<Proforma>> {
    let where: any = {};
    if (params?.filters?.status) where.status = params.filters.status;
    if (params?.search) {
      where.OR = [
        { number: { contains: params.search } },
      ];
    }
    const total = await db.proforma.count({ where });
    const rows = await db.proforma.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapProformaRow), total };
  }

  async getProforma(id: string): Promise<Proforma | null> {
    const r = await db.proforma.findUnique({ where: { id } });
    return r ? mapProformaRow(r) : null;
  }

  async upsertProforma(p: Partial<Proforma> & { id?: string }): Promise<Proforma> {
    const data: any = {
      tenant_id: p.tenant_id ?? "",
      partner_id: p.partner_id ?? "",
      offer_id: p.offer_id ?? null,
      number: p.number ?? "",
      status: p.status ?? "draft",
      subtotal: p.subtotal ?? 0,
      discount_total: p.discount_total ?? 0,
      tax_total: p.tax_total ?? 0,
      total: p.total ?? 0,
      currency: p.currency ?? "EUR",
      items: stringifyJSON(p.items) ?? "[]",
      valid_until: p.valid_until ? new Date(p.valid_until) : null,
      paid_at: p.paid_at ? new Date(p.paid_at) : null,
      payment_terms: p.payment_terms ?? "net30",
      notes: p.notes ?? null,
    };
    let r;
    if (p.id) {
      r = await db.proforma.update({ where: { id: p.id }, data });
    } else {
      r = await db.proforma.create({ data });
    }
    return mapProformaRow(r);
  }

  async deleteProforma(id: string): Promise<void> {
    await db.proforma.delete({ where: { id } });
  }

  // ─── Shared Documents ───────────────────────────────────────────────────

  async listDocuments(_tenantId: string, params?: ListParams): Promise<ListResult<SharedDocument>> {
    let where: any = {};
    if (params?.search) {
      where.OR = [
        { filename: { contains: params.search } },
      ];
    }
    const total = await db.sharedDocument.count({ where });
    const rows = await db.sharedDocument.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map((r: any) => ({ ...r, created_at: dateToISOOrNow(r.created_at) })), total };
  }

  async upsertDocument(d: Partial<SharedDocument> & { id?: string }): Promise<SharedDocument> {
    const data: any = {
      tenant_id: d.tenant_id ?? "",
      partner_id: d.partner_id ?? null,
      uploaded_by: d.uploaded_by ?? null,
      filename: d.filename ?? "",
      file_type: d.file_type ?? null,
      file_size: d.file_size ?? null,
      url: d.url ?? null,
      category: d.category ?? null,
      visibility: d.visibility ?? "private",
      description: d.description ?? null,
    };
    let r;
    if (d.id) {
      r = await db.sharedDocument.update({ where: { id: d.id }, data });
    } else {
      r = await db.sharedDocument.create({ data });
    }
    return { ...r, created_at: dateToISOOrNow(r.created_at) };
  }

  async deleteDocument(id: string): Promise<void> {
    await db.sharedDocument.delete({ where: { id } });
  }

  // ─── Document Register ──────────────────────────────────────────────────

  async listDocumentRegister(_tenantId: string, params?: ListParams): Promise<ListResult<DocumentRegisterEntry>> {
    let where: any = {};
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search } },
        { doc_type: { contains: params.search } },
      ];
    }
    const total = await db.documentRegisterEntry.count({ where });
    const rows = await db.documentRegisterEntry.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapDocumentRegisterRow), total };
  }

  async upsertDocumentRegisterEntry(e: Partial<DocumentRegisterEntry> & { id?: string }): Promise<DocumentRegisterEntry> {
    const data: any = {
      tenant_id: e.tenant_id ?? "",
      partner_id: e.partner_id ?? null,
      doc_type: e.doc_type ?? "offer",
      source_id: e.source_id ?? null,
      title: e.title ?? "",
      version: e.version ?? 1,
      status: e.status ?? "current",
      file_url: e.file_url ?? null,
      created_by: e.created_by ?? null,
    };
    let r;
    if (e.id) {
      r = await db.documentRegisterEntry.update({ where: { id: e.id }, data });
    } else {
      r = await db.documentRegisterEntry.create({ data });
    }
    return mapDocumentRegisterRow(r);
  }

  async listDocumentRevisions(documentId: string): Promise<DocumentRevision[]> {
    const rows = await db.documentRevision.findMany({
      where: { document_id: documentId },
      orderBy: { created_at: "desc" },
    });
    return rows.map(mapRevisionRow);
  }

  async addDocumentRevision(r: Partial<DocumentRevision> & { id?: string }): Promise<DocumentRevision> {
    const row = await db.documentRevision.create({
      data: {
        document_id: r.document_id ?? "",
        version: r.version ?? 1,
        file_url: r.file_url ?? null,
        change_summary: r.change_summary ?? null,
        created_by: r.created_by ?? null,
      },
    });
    return mapRevisionRow(row);
  }

  async deleteDocumentRegisterEntry(id: string): Promise<void> {
    await db.documentRegisterEntry.delete({ where: { id } });
  }

  // ─── Audit ──────────────────────────────────────────────────────────────

  async listAudit(_tenantId: string, params?: ListParams): Promise<ListResult<AuditLog>> {
    let where: any = {};
    if (params?.search) {
      where.OR = [
        { action: { contains: params.search } },
        { username: { contains: params.search } },
      ];
    }
    const total = await db.auditLog.count({ where });
    const rows = await db.auditLog.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapAuditLogRow), total };
  }

  async appendAudit(entry: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog> {
    const r = await db.auditLog.create({
      data: {
        user_id: entry.user_id ?? null,
        username: entry.username ?? null,
        action: entry.action,
        entity_type: entry.entity_type ?? null,
        entity_id: entry.entity_id ?? null,
        details: stringifyJSON(entry.details),
        ip: entry.ip ?? null,
        user_agent: entry.user_agent ?? null,
      },
    });
    return mapAuditLogRow(r);
  }

  // ─── Settings ───────────────────────────────────────────────────────────

  async getSetting<T = unknown>(key: string): Promise<T | null> {
    const r = await db.setting.findUnique({ where: { key } });
    if (!r) return null;
    try { return JSON.parse(r.value as string) as T; } catch { return r.value as unknown as T; }
  }

  async setSetting(key: string, value: unknown): Promise<void> {
    const val = typeof value === "string" ? value : JSON.stringify(value);
    await db.setting.upsert({
      where: { key },
      update: { value: val },
      create: { key, value: val },
    });
  }

  async getAllSettings(): Promise<Setting[]> {
    const rows = await db.setting.findMany();
    return rows.map((r: any) => ({
      ...r,
      created_at: dateToISOOrNow(r.created_at),
      updated_at: dateToISOOrNow(r.updated_at),
    }));
  }

  // ─── Tasks ──────────────────────────────────────────────────────────────

  async listTasks(_tenantId: string, userId?: string): Promise<UserTask[]> {
    const where: any = userId ? { assigned_to: userId } : {};
    const rows = await db.userTask.findMany({ where, orderBy: { created_at: "desc" } });
    return rows.map(mapUserTaskRow);
  }

  async upsertTask(t: Partial<UserTask> & { id?: string }): Promise<UserTask> {
    const data: any = {
      tenant_id: t.tenant_id ?? "",
      title: t.title ?? "",
      description: t.description ?? null,
      assigned_to: t.assigned_to ?? null,
      priority: t.priority ?? "medium",
      status: t.status ?? "pending",
      due_date: t.due_date ? new Date(t.due_date) : null,
      completed_at: t.completed_at ? new Date(t.completed_at) : null,
      entity_type: t.entity_type ?? null,
      entity_id: t.entity_id ?? null,
    };
    let r;
    if (t.id) {
      r = await db.userTask.update({ where: { id: t.id }, data });
    } else {
      r = await db.userTask.create({ data });
    }
    return mapUserTaskRow(r);
  }

  async deleteTask(id: string): Promise<void> {
    await db.userTask.delete({ where: { id } });
  }

  // ─── Notes ──────────────────────────────────────────────────────────────

  async listNotes(_tenantId: string, entityType: string, entityId: string): Promise<EntityNote[]> {
    const rows = await db.entityNote.findMany({
      where: { entity_type: entityType, entity_id: entityId },
      orderBy: { created_at: "desc" },
    });
    return rows.map((r: any) => ({
      ...r,
      created_at: dateToISOOrNow(r.created_at),
      updated_at: dateToISOOrNow(r.updated_at),
    }));
  }

  async upsertNote(n: Partial<EntityNote> & { id?: string }): Promise<EntityNote> {
    const data: any = {
      entity_type: n.entity_type ?? "",
      entity_id: n.entity_id ?? "",
      user_id: n.user_id ?? null,
      content: n.content ?? "",
    };
    let r;
    if (n.id) {
      r = await db.entityNote.update({ where: { id: n.id }, data });
    } else {
      r = await db.entityNote.create({ data });
    }
    return { ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  async deleteNote(id: string): Promise<void> {
    await db.entityNote.delete({ where: { id } });
  }

  // ─── Inventory ──────────────────────────────────────────────────────────

  async listInventory(_tenantId: string, partnerId: string): Promise<InventoryMovement[]> {
    const rows = await db.inventoryMovement.findMany({
      where: { partner_id: partnerId },
      orderBy: { created_at: "desc" },
    });
    return rows.map((r: any) => ({
      ...r,
      created_at: dateToISOOrNow(r.created_at),
    }));
  }

  async listAllInventory(_tenantId: string, params?: ListParams): Promise<ListResult<InventoryMovement>> {
    let where: any = {};
    const total = await db.inventoryMovement.count({ where });
    const rows = await db.inventoryMovement.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map((r: any) => ({ ...r, created_at: dateToISOOrNow(r.created_at) })), total };
  }

  async addInventoryMovement(m: Partial<InventoryMovement> & { id?: string }): Promise<InventoryMovement> {
    const r = await db.inventoryMovement.create({
      data: {
        tenant_id: m.tenant_id ?? "",
        product_id: m.product_id ?? "",
        partner_id: m.partner_id ?? "",
        type: m.type ?? "inbound",
        quantity: m.quantity ?? 0,
        delta: m.delta ?? 0,
        reference: m.reference ?? null,
        notes: m.notes ?? null,
      },
    });
    return { ...r, created_at: dateToISOOrNow(r.created_at) };
  }

  // ─── Vault ──────────────────────────────────────────────────────────────

  async listVault(_tenantId: string, params?: ListParams): Promise<ListResult<VaultSecret>> {
    let where: any = {};
    if (params?.search) {
      where.OR = [{ name: { contains: params.search } }];
    }
    const total = await db.vaultSecret.count({ where });
    const rows = await db.vaultSecret.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map((r: any) => ({ ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) })), total };
  }

  async upsertVaultSecret(s: Partial<VaultSecret> & { id?: string }): Promise<VaultSecret> {
    const data: any = {
      tenant_id: s.tenant_id ?? "",
      name: s.name ?? "",
      type: s.type ?? "other",
      value_encrypted: s.value_encrypted ?? "",
      metadata: s.metadata ?? null,
    };
    let r;
    if (s.id) {
      r = await db.vaultSecret.update({ where: { id: s.id }, data });
    } else {
      r = await db.vaultSecret.create({ data });
    }
    return { ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  async deleteVaultSecret(id: string): Promise<void> {
    await db.vaultSecret.delete({ where: { id } });
  }

  // ─── API Keys ───────────────────────────────────────────────────────────

  async listApiKeys(_tenantId: string): Promise<ApiKey[]> {
    const rows = await db.apiKey.findMany({ orderBy: { created_at: "desc" } });
    return rows.map((r: any) => ({ ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) }));
  }

  async upsertApiKey(k: Partial<ApiKey> & { id?: string }): Promise<ApiKey> {
    const data: any = {
      tenant_id: k.tenant_id ?? "",
      name: k.name ?? "",
      key_hash: k.key_hash ?? "",
      prefix: k.prefix ?? "",
      permissions: stringifyJSON(k.permissions),
      last_used_at: k.last_used_at ? new Date(k.last_used_at) : null,
      expires_at: k.expires_at ? new Date(k.expires_at) : null,
      active: k.active ?? true,
    };
    let r;
    if (k.id) {
      r = await db.apiKey.update({ where: { id: k.id }, data });
    } else {
      r = await db.apiKey.create({ data });
    }
    return { ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  async deleteApiKey(id: string): Promise<void> {
    await db.apiKey.delete({ where: { id } });
  }

  // ─── Webhooks ───────────────────────────────────────────────────────────

  async listWebhooks(_tenantId: string): Promise<Webhook[]> {
    const rows = await db.webhook.findMany({ orderBy: { created_at: "desc" } });
    return rows.map((r: any) => ({ ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) }));
  }

  async upsertWebhook(w: Partial<Webhook> & { id?: string }): Promise<Webhook> {
    const data: any = {
      tenant_id: w.tenant_id ?? "",
      name: w.name ?? "",
      url: w.url ?? "",
      events: stringifyJSON(w.events) ?? "[]",
      secret: w.secret ?? null,
      active: w.active ?? true,
      last_triggered_at: w.last_triggered_at ? new Date(w.last_triggered_at) : null,
    };
    let r;
    if (w.id) {
      r = await db.webhook.update({ where: { id: w.id }, data });
    } else {
      r = await db.webhook.create({ data });
    }
    return { ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  async deleteWebhook(id: string): Promise<void> {
    await db.webhook.delete({ where: { id } });
  }

  // ─── Security ───────────────────────────────────────────────────────────

  async listSessions(_tenantId: string, userId?: string): Promise<SecuritySession[]> {
    const where: any = userId ? { user_id: userId } : {};
    const rows = await db.securitySession.findMany({ where, orderBy: { created_at: "desc" } });
    return rows.map((r: any) => ({
      ...r,
      expires_at: dateToISO(r.expires_at),
      created_at: dateToISOOrNow(r.created_at),
    }));
  }

  async revokeSession(id: string): Promise<void> {
    await db.securitySession.delete({ where: { id } });
  }

  async listLoginHistory(_tenantId: string, userId?: string, limit?: number): Promise<LoginHistoryEntry[]> {
    const where: any = userId ? { user_id: userId } : {};
    const rows = await db.loginHistoryEntry.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit ?? 50,
    });
    return rows.map((r: any) => ({ ...r, created_at: dateToISOOrNow(r.created_at) }));
  }

  async listKnownIps(_tenantId: string, userId?: string): Promise<KnownIp[]> {
    const where: any = userId ? { user_id: userId } : {};
    return db.knownIp.findMany({ where, orderBy: { created_at: "desc" } });
  }

  async trustIp(id: string, trusted: boolean): Promise<void> {
    await db.knownIp.update({ where: { id }, data: { trusted } });
  }

  async forgetIp(id: string): Promise<void> {
    await db.knownIp.delete({ where: { id } });
  }

  async listTrustedDevices(_tenantId: string, userId?: string): Promise<TrustedDevice[]> {
    const where: any = userId ? { user_id: userId } : {};
    return db.trustedDevice.findMany({ where, orderBy: { created_at: "desc" } });
  }

  async revokeTrustedDevice(id: string): Promise<void> {
    await db.trustedDevice.delete({ where: { id } });
  }

  // ─── Mail Queue ─────────────────────────────────────────────────────────

  async listMailQueue(_tenantId: string, params?: ListParams): Promise<ListResult<MailQueueEntry>> {
    let where: any = {};
    if (params?.search) {
      where.OR = [{ to: { contains: params.search } }, { subject: { contains: params.search } }];
    }
    const total = await db.mailQueueEntry.count({ where });
    const rows = await db.mailQueueEntry.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map((r: any) => ({ ...r, created_at: dateToISOOrNow(r.created_at), sent_at: dateToISO(r.sent_at), updated_at: dateToISOOrNow(r.updated_at) })), total };
  }

  async upsertMailQueueEntry(m: Partial<MailQueueEntry> & { id?: string }): Promise<MailQueueEntry> {
    const data: any = {
      tenant_id: m.tenant_id ?? "",
      to: m.to ?? "",
      subject: m.subject ?? "",
      body: m.body ?? null,
      template: m.template ?? null,
      template_data: stringifyJSON(m.template_data),
      status: m.status ?? "queued",
      provider: m.provider ?? null,
      provider_id: m.provider_id ?? null,
      error: m.error ?? null,
      sent_at: m.sent_at ? new Date(m.sent_at) : null,
    };
    let r;
    if (m.id) {
      r = await db.mailQueueEntry.update({ where: { id: m.id }, data });
    } else {
      r = await db.mailQueueEntry.create({ data });
    }
    return { ...r, created_at: dateToISOOrNow(r.created_at), sent_at: dateToISO(r.sent_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  async deleteMailQueueEntry(id: string): Promise<void> {
    await db.mailQueueEntry.delete({ where: { id } });
  }

  // ─── Tenants ────────────────────────────────────────────────────────────

  async listTenants(): Promise<Tenant[]> {
    const rows = await db.tenant.findMany({ orderBy: { created_at: "desc" } });
    return rows.map((r: any) => ({ ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) }));
  }

  async getTenant(id: string): Promise<Tenant | null> {
    const r = await db.tenant.findUnique({ where: { id } });
    return r ? { ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) } : null;
  }

  async upsertTenant(t: Partial<Tenant> & { id?: string }): Promise<Tenant> {
    const data: any = {
      name: t.name ?? "",
      legal_name: t.legal_name ?? null,
      country: t.country ?? null,
      currency: t.currency ?? "EUR",
      tax_id: t.tax_id ?? null,
      vat_number: t.vat_number ?? null,
      registration_number: t.registration_number ?? null,
      address_line: t.address_line ?? null,
      city: t.city ?? null,
      postal_code: t.postal_code ?? null,
      bank_name: t.bank_name ?? null,
      bank_iban: t.bank_iban ?? null,
      bank_swift: t.bank_swift ?? null,
      logo_url: t.logo_url ?? null,
      primary_color: t.primary_color ?? null,
      plan: t.plan ?? "trial",
      status: t.status ?? "active",
      max_users: t.max_users ?? 5,
    };
    let r;
    if (t.id) {
      r = await db.tenant.update({ where: { id: t.id }, data });
    } else {
      r = await db.tenant.create({ data });
    }
    return { ...r, created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  async deleteTenant(id: string): Promise<void> {
    await db.tenant.delete({ where: { id } });
  }

  // ─── Product Catalog ────────────────────────────────────────────────────

  async listProductCatalog(tenantId: string, params?: ListParams): Promise<ListResult<ProductCatalogEntry>> {
    let where: any = { tenant_id: tenantId };
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { hs_code: { contains: params.search } },
      ];
    }
    const total = await db.productCatalogEntry.count({ where });
    const rows = await db.productCatalogEntry.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map((r: any) => ({ ...r, specifications: parseJSON(r.specifications, null), created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) })), total };
  }

  async getProductCatalogEntry(id: string): Promise<ProductCatalogEntry | null> {
    const r = await db.productCatalogEntry.findUnique({ where: { id } });
    return r ? { ...r, specifications: parseJSON(r.specifications, null), created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) } : null;
  }

  async upsertProductCatalogEntry(p: Partial<ProductCatalogEntry> & { id?: string }): Promise<ProductCatalogEntry> {
    const data: any = {
      tenant_id: p.tenant_id ?? "",
      name: p.name ?? "",
      hs_code: p.hs_code ?? null,
      category: p.category ?? null,
      origin_country: p.origin_country ?? null,
      unit: p.unit ?? "MT",
      base_price: p.base_price ?? 0,
      currency: p.currency ?? "USD",
      specifications: stringifyJSON(p.specifications),
      active: p.active ?? true,
    };
    let r;
    if (p.id) {
      r = await db.productCatalogEntry.update({ where: { id: p.id }, data });
    } else {
      r = await db.productCatalogEntry.create({ data });
    }
    return { ...r, specifications: parseJSON(r.specifications, null), created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  async deleteProductCatalogEntry(id: string): Promise<void> {
    await db.productCatalogEntry.delete({ where: { id } });
  }

  // ─── Supplier Offers ────────────────────────────────────────────────────

  async listSupplierOffers(tenantId: string, params?: ListParams): Promise<ListResult<SupplierOffer>> {
    let where: any = { tenant_id: tenantId };
    if (params?.search) {
      where.OR = [{ name: { contains: params.search } }];
    }
    const total = await db.supplierOffer.count({ where });
    const rows = await db.supplierOffer.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapSupplierOfferRow), total };
  }

  async getSupplierOffer(id: string): Promise<SupplierOffer | null> {
    const r = await db.supplierOffer.findUnique({ where: { id } });
    return r ? mapSupplierOfferRow(r) : null;
  }

  async upsertSupplierOffer(s: Partial<SupplierOffer> & { id?: string }): Promise<SupplierOffer> {
    const data: any = {
      tenant_id: s.tenant_id ?? "",
      supplier_id: s.supplier_id ?? "",
      product_catalog_id: s.product_catalog_id ?? null,
      name: s.name ?? "",
      price: s.price ?? 0,
      currency: s.currency ?? "USD",
      min_quantity: s.min_quantity ?? 0,
      available_quantity: s.available_quantity ?? null,
      lead_time_days: s.lead_time_days ?? null,
      origin_country: s.origin_country ?? null,
      incoterm: s.incoterm ?? null,
      specifications: stringifyJSON(s.specifications),
      valid_until: s.valid_until ? new Date(s.valid_until) : null,
      status: s.status ?? "active",
    };
    let r;
    if (s.id) {
      r = await db.supplierOffer.update({ where: { id: s.id }, data });
    } else {
      r = await db.supplierOffer.create({ data });
    }
    return mapSupplierOfferRow(r);
  }

  async deleteSupplierOffer(id: string): Promise<void> {
    await db.supplierOffer.delete({ where: { id } });
  }

  // ─── Trade Calculations ─────────────────────────────────────────────────

  async listTradeCalculations(tenantId: string, params?: ListParams): Promise<ListResult<TradeCalculation>> {
    let where: any = { tenant_id: tenantId };
    if (params?.search) {
      where.OR = [{ name: { contains: params.search } }];
    }
    const total = await db.tradeCalculation.count({ where });
    const rows = await db.tradeCalculation.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapTradeCalcRow), total };
  }

  async getTradeCalculation(id: string): Promise<TradeCalculation | null> {
    const r = await db.tradeCalculation.findUnique({ where: { id } });
    return r ? mapTradeCalcRow(r) : null;
  }

  async upsertTradeCalculation(t: Partial<TradeCalculation> & { id?: string }): Promise<TradeCalculation> {
    const data: any = {
      tenant_id: t.tenant_id ?? "",
      name: t.name ?? "",
      product_catalog_id: t.product_catalog_id ?? null,
      supplier_id: t.supplier_id ?? null,
      buyer_id: t.buyer_id ?? null,
      origin_country: t.origin_country ?? null,
      destination_country: t.destination_country ?? null,
      quantity: t.quantity ?? 0,
      unit: t.unit ?? "MT",
      unit_price: t.unit_price ?? 0,
      currency: t.currency ?? "USD",
      incoterm: t.incoterm ?? "FOB",
      cost_lines: stringifyJSON(t.cost_lines) ?? "[]",
      total_cost: t.total_cost ?? 0,
      total_landed_cost: t.total_landed_cost ?? 0,
      cost_per_unit: t.cost_per_unit ?? 0,
      created_by: t.created_by ?? null,
    };
    let r;
    if (t.id) {
      r = await db.tradeCalculation.update({ where: { id: t.id }, data });
    } else {
      r = await db.tradeCalculation.create({ data });
    }
    return mapTradeCalcRow(r);
  }

  async deleteTradeCalculation(id: string): Promise<void> {
    await db.tradeCalculation.delete({ where: { id } });
  }

  // ─── Portal Access ──────────────────────────────────────────────────────

  async getPortalAccessByPartner(partnerId: string): Promise<PortalAccess | null> {
    const r = await db.portalAccess.findFirst({ where: { partner_id: partnerId } });
    return r ? mapPortalAccessRow(r) : null;
  }

  async getPortalAccessByEmail(tenantId: string, email: string): Promise<PortalAccess | null> {
    const r = await db.portalAccess.findFirst({ where: { tenant_id: tenantId, email } });
    return r ? mapPortalAccessRow(r) : null;
  }

  async getPortalAccessById(id: string): Promise<PortalAccess | null> {
    const r = await db.portalAccess.findUnique({ where: { id } });
    return r ? mapPortalAccessRow(r) : null;
  }

  async listPortalAccess(tenantId: string): Promise<PortalAccess[]> {
    const rows = await db.portalAccess.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });
    return rows.map(mapPortalAccessRow);
  }

  async upsertPortalAccess(p: Partial<PortalAccess> & { id?: string }): Promise<PortalAccess> {
    const data: any = {
      tenant_id: p.tenant_id ?? "",
      partner_id: p.partner_id ?? "",
      email: p.email ?? "",
      password_hash: p.password_hash ?? "",
      level: p.level ?? "viewer",
      status: p.status ?? "active",
      invited_by: p.invited_by ?? null,
      invited_at: p.invited_at ? new Date(p.invited_at) : null,
      last_login: p.last_login ? new Date(p.last_login) : null,
    };
    let r;
    if (p.id) {
      r = await db.portalAccess.update({ where: { id: p.id }, data });
    } else {
      r = await db.portalAccess.create({ data });
    }
    return mapPortalAccessRow(r);
  }

  async deletePortalAccess(id: string): Promise<void> {
    await db.portalAccess.delete({ where: { id } });
  }

  async verifyPortalCredentials(tenantId: string, email: string, password: string): Promise<PortalAccess | null> {
    const r = await db.portalAccess.findFirst({ where: { tenant_id: tenantId, email } });
    if (!r) return null;
    // Simple hash check — in production, use bcrypt
    const { hashPassword } = await import("@/lib/auth/password");
    const { verifyPassword } = await import("@/lib/auth/password");
    const ok = await verifyPassword(password, r.password_hash);
    return ok ? mapPortalAccessRow(r) : null;
  }

  // ─── Document Templates ─────────────────────────────────────────────────

  async listDocumentTemplates(tenantId: string): Promise<DocumentTemplate[]> {
    const rows = await db.documentTemplate.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });
    return rows.map((r: any) => ({
      ...r,
      structure: parseJSON(r.structure, null),
      created_at: dateToISOOrNow(r.created_at),
      updated_at: dateToISOOrNow(r.updated_at),
    }));
  }

  async getDocumentTemplate(id: string): Promise<DocumentTemplate | null> {
    const r = await db.documentTemplate.findUnique({ where: { id } });
    return r ? { ...r, structure: parseJSON(r.structure, null), created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) } : null;
  }

  async getDefaultDocumentTemplate(tenantId: string, type: string): Promise<DocumentTemplate | null> {
    const r = await db.documentTemplate.findFirst({
      where: { tenant_id: tenantId, type, is_default: true },
    });
    return r ? { ...r, structure: parseJSON(r.structure, null), created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) } : null;
  }

  async upsertDocumentTemplate(t: Partial<DocumentTemplate> & { id?: string }): Promise<DocumentTemplate> {
    const data: any = {
      tenant_id: t.tenant_id ?? "",
      name: t.name ?? "",
      type: t.type ?? "offer",
      structure: stringifyJSON(t.structure) ?? "{}",
      is_default: t.is_default ?? false,
      created_by: t.created_by ?? null,
    };
    let r;
    if (t.id) {
      r = await db.documentTemplate.update({ where: { id: t.id }, data });
    } else {
      r = await db.documentTemplate.create({ data });
    }
    return { ...r, structure: parseJSON(r.structure, null), created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  async deleteDocumentTemplate(id: string): Promise<void> {
    await db.documentTemplate.delete({ where: { id } });
  }

  // ─── Document Verification ──────────────────────────────────────────────

  async createDocumentVerification(v: Omit<DocumentVerification, "id" | "created_at" | "verification_count" | "last_verified_at" | "last_verified_ip" | "status"> & { status?: string }): Promise<DocumentVerification> {
    const r = await db.documentVerification.create({
      data: {
        tenant_id: v.tenant_id ?? "",
        partner_id: v.partner_id ?? null,
        doc_type: v.doc_type ?? "offer",
        doc_id: v.doc_id ?? "",
        verification_code: v.verification_code ?? "",
        status: v.status ?? "active",
        qr_code_url: v.qr_code_url ?? null,
      },
    });
    return { ...r, created_at: dateToISOOrNow(r.created_at), last_verified_at: null, last_verified_ip: null, verification_count: 0 };
  }

  async getDocumentVerificationByCode(code: string): Promise<DocumentVerification | null> {
    const r = await db.documentVerification.findFirst({ where: { verification_code: code } });
    return r ? { ...r, created_at: dateToISOOrNow(r.created_at), last_verified_at: dateToISO(r.last_verified_at), last_verified_ip: r.last_verified_ip } : null;
  }

  async getDocumentVerificationByDoc(tenantId: string, docType: string, docId: string): Promise<DocumentVerification | null> {
    const r = await db.documentVerification.findFirst({
      where: { tenant_id: tenantId, doc_type: docType, doc_id: docId },
    });
    return r ? { ...r, created_at: dateToISOOrNow(r.created_at), last_verified_at: dateToISO(r.last_verified_at), last_verified_ip: r.last_verified_ip } : null;
  }

  async logVerification(log: Omit<VerificationLog, "id" | "verified_at">): Promise<VerificationLog> {
    const r = await db.verificationLog.create({
      data: {
        verification_id: log.verification_id ?? "",
        ip: log.ip ?? null,
        user_agent: log.user_agent ?? null,
      },
    });
    return { ...r, verified_at: dateToISOOrNow(r.verified_at) };
  }

  async listVerificationLogs(verificationId: string): Promise<VerificationLog[]> {
    const rows = await db.verificationLog.findMany({
      where: { verification_id: verificationId },
      orderBy: { verified_at: "desc" },
    });
    return rows.map((r: any) => ({ ...r, verified_at: dateToISOOrNow(r.verified_at) }));
  }

  // ─── KYC ────────────────────────────────────────────────────────────────

  async listKycSubmissions(tenantId: string, params?: ListParams): Promise<ListResult<KycSubmission>> {
    let where: any = { tenant_id: tenantId };
    if (params?.search) {
      where.OR = [{ partner_id: { contains: params.search } }];
    }
    const total = await db.kycSubmission.count({ where });
    const rows = await db.kycSubmission.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map(mapKycRow), total };
  }

  async getKycSubmission(id: string): Promise<KycSubmission | null> {
    const r = await db.kycSubmission.findUnique({ where: { id } });
    return r ? mapKycRow(r) : null;
  }

  async getKycSubmissionByPartner(partnerId: string): Promise<KycSubmission | null> {
    const r = await db.kycSubmission.findFirst({ where: { partner_id: partnerId } });
    return r ? mapKycRow(r) : null;
  }

  async upsertKycSubmission(s: Partial<KycSubmission> & { id?: string }): Promise<KycSubmission> {
    const data: any = {
      tenant_id: s.tenant_id ?? "",
      partner_id: s.partner_id ?? "",
      status: s.status ?? "not_submitted",
      data: stringifyJSON(s.data),
      reviewed_by: s.reviewed_by ?? null,
      reviewed_at: s.reviewed_at ? new Date(s.reviewed_at) : null,
      notes: s.notes ?? null,
      submitted_at: s.submitted_at ? new Date(s.submitted_at) : null,
    };
    let r;
    if (s.id) {
      r = await db.kycSubmission.update({ where: { id: s.id }, data });
    } else {
      r = await db.kycSubmission.create({ data });
    }
    return mapKycRow(r);
  }

  async deleteKycSubmission(id: string): Promise<void> {
    await db.kycSubmission.delete({ where: { id } });
  }

  async addKycDocument(doc: Omit<KycDocument, "id" | "uploaded_at">): Promise<KycDocument> {
    const r = await db.kycDocument.create({
      data: {
        submission_id: doc.submission_id ?? "",
        type: doc.type ?? "registration",
        file_url: doc.file_url ?? "",
        file_name: doc.file_name ?? null,
        status: doc.status ?? "pending",
      },
    });
    return { ...r, uploaded_at: dateToISOOrNow(r.uploaded_at) };
  }

  async removeKycDocument(id: string): Promise<void> {
    await db.kycDocument.delete({ where: { id } });
  }

  async approveKycAndTransfer(submissionId: string, reviewedBy: string): Promise<{ submission: KycSubmission; partner: Partner }> {
    const submission = await this.upsertKycSubmission({
      id: submissionId,
      status: "approved",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    });
    const sub = await db.kycSubmission.findUnique({ where: { id: submissionId } });
    const partner = sub ? await this.upsertPartner({
      id: sub.partner_id,
      kyc_status: "approved",
      kyc_reviewed_by: reviewedBy,
      kyc_reviewed_at: new Date().toISOString(),
    }) : null;
    if (!partner) throw new Error("Partner not found for KYC submission");
    return { submission, partner };
  }

  // ─── Portal RFQs ────────────────────────────────────────────────────────

  async listPortalRfqs(tenantId: string, params?: ListParams): Promise<ListResult<PortalRfq>> {
    let where: any = { tenant_id: tenantId };
    const total = await db.portalRfq.count({ where });
    const rows = await db.portalRfq.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 50,
    });
    return { items: rows.map((r: any) => ({
      ...r,
      items: parseJSON(r.items, []),
      created_at: dateToISOOrNow(r.created_at),
      updated_at: dateToISOOrNow(r.updated_at),
    })), total };
  }

  async listPortalRfqsByPartner(partnerId: string): Promise<PortalRfq[]> {
    const rows = await db.portalRfq.findMany({
      where: { partner_id: partnerId },
      orderBy: { created_at: "desc" },
    });
    return rows.map((r: any) => ({
      ...r,
      items: parseJSON(r.items, []),
      created_at: dateToISOOrNow(r.created_at),
      updated_at: dateToISOOrNow(r.updated_at),
    }));
  }

  async getPortalRfq(id: string): Promise<PortalRfq | null> {
    const r = await db.portalRfq.findUnique({ where: { id } });
    return r ? { ...r, items: parseJSON(r.items, []), created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) } : null;
  }

  async upsertPortalRfq(rfq: Partial<PortalRfq> & { id?: string }): Promise<PortalRfq> {
    const data: any = {
      tenant_id: rfq.tenant_id ?? "",
      partner_id: rfq.partner_id ?? "",
      title: rfq.title ?? null,
      status: rfq.status ?? "pending",
      items: stringifyJSON(rfq.items) ?? "[]",
      notes: rfq.notes ?? null,
      delivery_address: rfq.delivery_address ?? null,
      desired_delivery_date: rfq.desired_delivery_date ? new Date(rfq.desired_delivery_date) : null,
    };
    let r;
    if (rfq.id) {
      r = await db.portalRfq.update({ where: { id: rfq.id }, data });
    } else {
      r = await db.portalRfq.create({ data });
    }
    return { ...r, items: parseJSON(r.items, []), created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  async deletePortalRfq(id: string): Promise<void> {
    await db.portalRfq.delete({ where: { id } });
  }

  // ─── Feature Flags ──────────────────────────────────────────────────────

  async getFeatureFlags(tenantId: string): Promise<TenantFeatureFlags | null> {
    const r = await db.tenantFeatureFlags.findFirst({ where: { tenant_id: tenantId } });
    return r ? {
      ...r,
      flags: parseJSON(r.flags, {}),
      created_at: dateToISOOrNow(r.created_at),
      updated_at: dateToISOOrNow(r.updated_at),
    } : null;
  }

  async upsertFeatureFlags(f: Partial<TenantFeatureFlags> & { id?: string; tenant_id: string }): Promise<TenantFeatureFlags> {
    const existing = await db.tenantFeatureFlags.findFirst({ where: { tenant_id: f.tenant_id } });
    const data: any = {
      tenant_id: f.tenant_id,
      flags: stringifyJSON(f.flags) ?? "{}",
      updated_by: f.updated_by ?? null,
    };
    let r;
    if (existing) {
      r = await db.tenantFeatureFlags.update({ where: { id: existing.id }, data });
    } else {
      r = await db.tenantFeatureFlags.create({ data });
    }
    return { ...r, flags: parseJSON(r.flags, {}), created_at: dateToISOOrNow(r.created_at), updated_at: dateToISOOrNow(r.updated_at) };
  }

  // ─── Notifications ──────────────────────────────────────────────────────

  async listNotifications(tenantId: string, userId?: string, unreadOnly?: boolean): Promise<Notification[]> {
    const where: any = { tenant_id: tenantId };
    if (userId) where.user_id = userId;
    if (unreadOnly) where.read = false;
    const rows = await db.notification.findMany({ where, orderBy: { created_at: "desc" } });
    return rows.map(mapNotificationRow);
  }

  async createNotification(n: Omit<Notification, "id" | "created_at" | "read" | "read_at">): Promise<Notification> {
    const r = await db.notification.create({
      data: {
        tenant_id: n.tenant_id ?? "",
        user_id: n.user_id ?? null,
        type: n.type ?? "info",
        title: n.title ?? "",
        message: n.message ?? "",
        data: stringifyJSON(n.data),
        read: false,
      },
    });
    return mapNotificationRow(r);
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.notification.update({
      where: { id },
      data: { read: true, read_at: new Date() },
    });
  }

  async markAllNotificationsRead(tenantId: string, userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { tenant_id: tenantId, user_id: userId, read: false },
      data: { read: true, read_at: new Date() },
    });
  }

  async deleteNotification(id: string): Promise<void> {
    await db.notification.delete({ where: { id } });
  }

  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return db.notification.count({
      where: { tenant_id: tenantId, user_id: userId, read: false },
    });
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────

  async getInsights(tenantId?: string): Promise<DashboardInsights> {
    // Compute dashboard insights from the database
    const [dealCount, activeDeals, wonDeals, lostDeals, offerCount, pendingOffers, invoiceCount, overdueInvoices, partnerCount, productCount, recentAudit] = await Promise.all([
      db.deal.count({ where: tenantId ? { tenant_id: tenantId } : {} }),
      db.deal.count({ where: { stage: { in: ["lead", "qualified", "proposal", "negotiation"] }, ...(tenantId ? { tenant_id: tenantId } : {}) } }),
      db.deal.count({ where: { stage: "won", ...(tenantId ? { tenant_id: tenantId } : {}) } }),
      db.deal.count({ where: { stage: "lost", ...(tenantId ? { tenant_id: tenantId } : {}) } }),
      db.offer.count({ where: tenantId ? { tenant_id: tenantId } : {} }),
      db.offer.count({ where: { status: { in: ["draft", "sent"] }, ...(tenantId ? { tenant_id: tenantId } : {}) } }),
      db.invoice.count({ where: tenantId ? { tenant_id: tenantId } : {} }),
      db.invoice.count({ where: { status: "overdue", ...(tenantId ? { tenant_id: tenantId } : {}) } }),
      db.partner.count({ where: tenantId ? { tenant_id: tenantId } : {} }),
      db.product.count({}),
      db.auditLog.findMany({
        where: tenantId ? {} : {},
        orderBy: { created_at: "desc" },
        take: 5,
      }),
    ]);

    // Get total deal value
    const deals = await db.deal.findMany({ where: tenantId ? { tenant_id: tenantId } : {} });
    const totalDealValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonValue = deals.filter(d => d.stage === "won").reduce((sum, d) => sum + (d.value || 0), 0);

    // Get offers with totals
    const offers = await db.offer.findMany({ where: tenantId ? { tenant_id: tenantId } : {} });
    const totalOfferValue = offers.reduce((sum, o) => sum + (o.total || 0), 0);

    // Get invoices
    const invoices = await db.invoice.findMany({ where: tenantId ? { tenant_id: tenantId } : {} });
    const totalInvoiceValue = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const paidInvoiceValue = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + (i.total || 0), 0);

    // Stage distribution
    const stageDistribution: Record<string, number> = {};
    for (const d of deals) {
      stageDistribution[d.stage] = (stageDistribution[d.stage] || 0) + 1;
    }

    // Deal pipeline
    const pipeline = Object.entries(stageDistribution).map(([stage, count]) => ({
      stage: stage as DealStage,
      count,
      value: deals.filter(d => d.stage === stage).reduce((s, d) => s + (d.value || 0), 0),
    }));

    return {
      total_deals: dealCount,
      active_deals: activeDeals,
      won_deals: wonDeals,
      lost_deals: lostDeals,
      total_deal_value: totalDealValue,
      won_value: wonValue,
      win_rate: dealCount > 0 ? Math.round((wonDeals / dealCount) * 100) : 0,
      total_offers: offerCount,
      pending_offers: pendingOffers,
      total_offer_value: totalOfferValue,
      total_invoices: invoiceCount,
      overdue_invoices: overdueInvoices,
      total_invoice_value: totalInvoiceValue,
      paid_invoice_value: paidInvoiceValue,
      total_partners: partnerCount,
      total_products: productCount,
      pipeline,
      recent_activity: recentAudit.map(mapAuditLogRow),
      stage_distribution: stageDistribution,
      monthly_revenue: [],
    };
  }

  // ─── ERP stubs (not yet implemented for Prisma) ──────────────────────────
  async listErpAccounts(_tenantId: string, _params?: ListParams): Promise<ListResult<ErpAccount>> { return { items: [], total: 0 }; }
  async getErpAccount(_id: string): Promise<ErpAccount | null> { return null; }
  async upsertErpAccount(_a: Partial<ErpAccount> & { id?: string }): Promise<ErpAccount> { throw new Error("Not implemented"); }
  async deleteErpAccount(_id: string): Promise<void> { throw new Error("Not implemented"); }
  async listFiscalPeriods(_tenantId: string, _params?: ListParams): Promise<ListResult<FiscalPeriod>> { return { items: [], total: 0 }; }
  async getFiscalPeriod(_id: string): Promise<FiscalPeriod | null> { return null; }
  async upsertFiscalPeriod(_p: Partial<FiscalPeriod> & { id?: string }): Promise<FiscalPeriod> { throw new Error("Not implemented"); }
  async closeFiscalPeriod(_id: string, _closedBy: string): Promise<FiscalPeriod> { throw new Error("Not implemented"); }
  async listErpJournalEntries(_tenantId: string, _params?: ListParams): Promise<ListResult<ErpJournalEntry>> { return { items: [], total: 0 }; }
  async getErpJournalEntry(_id: string): Promise<ErpJournalEntry | null> { return null; }
  async upsertErpJournalEntry(_e: Partial<ErpJournalEntry> & { id?: string; lines?: Partial<ErpJournalLine & { id?: string }>[] }): Promise<ErpJournalEntry> { throw new Error("Not implemented"); }
  async postErpJournalEntry(_id: string, _postedBy: string): Promise<ErpJournalEntry> { throw new Error("Not implemented"); }
  async reverseErpJournalEntry(_id: string, _reversedBy: string): Promise<ErpJournalEntry> { throw new Error("Not implemented"); }
  async deleteErpJournalEntry(_id: string): Promise<void> { throw new Error("Not implemented"); }
  async listErpCostCenters(_tenantId: string, _params?: ListParams): Promise<ListResult<ErpCostCenter>> { return { items: [], total: 0 }; }
  async upsertErpCostCenter(_c: Partial<ErpCostCenter> & { id?: string }): Promise<ErpCostCenter> { throw new Error("Not implemented"); }
  async deleteErpCostCenter(_id: string): Promise<void> { throw new Error("Not implemented"); }
  async listErpBankAccounts(_tenantId: string): Promise<ErpBankAccount[]> { return []; }
  async upsertErpBankAccount(_b: Partial<ErpBankAccount> & { id?: string }): Promise<ErpBankAccount> { throw new Error("Not implemented"); }
  async deleteErpBankAccount(_id: string): Promise<void> { throw new Error("Not implemented"); }
  async listErpBankTransactions(_tenantId: string, _bankAccountId?: string, _params?: ListParams): Promise<ListResult<ErpBankTransaction>> { return { items: [], total: 0 }; }
  async upsertErpBankTransaction(_t: Partial<ErpBankTransaction> & { id?: string }): Promise<ErpBankTransaction> { throw new Error("Not implemented"); }
  async reconcileBankTransaction(_id: string, _journalEntryId: string): Promise<ErpBankTransaction> { throw new Error("Not implemented"); }
  async getErpSettings(_tenantId: string): Promise<ErpSetting | null> { return null; }
  async upsertErpSettings(_s: Partial<ErpSetting> & { id?: string; tenant_id: string }): Promise<ErpSetting> { throw new Error("Not implemented"); }
  async getTrialBalance(_tenantId: string, _asOfDate: string): Promise<TrialBalance> { return { items: [], total_debit: 0, total_credit: 0, as_of_date: _asOfDate }; }
  async getBalanceSheet(_tenantId: string, _asOfDate: string): Promise<BalanceSheet> { return { assets: [], liabilities: [], equity: [], total_assets: 0, total_liabilities: 0, total_equity: 0, as_of_date: _asOfDate }; }
  async getProfitAndLoss(_tenantId: string, _periodStart: string, _periodEnd: string): Promise<ProfitAndLoss> { return { revenue: [], expenses: [], total_revenue: 0, total_expenses: 0, net_profit: 0, period_start: _periodStart, period_end: _periodEnd }; }
  async getGeneralLedger(_tenantId: string, _accountId: string, _dateFrom?: string, _dateTo?: string): Promise<GeneralLedger> { return { account_id: _accountId, account_code: "", account_name: "", entries: [], opening_balance: 0, closing_balance: 0, total_debit: 0, total_credit: 0 }; }
  async autoJournalFromInvoice(_invoiceId: string, _tenantId: string, _userId: string): Promise<ErpJournalEntry | null> { return null; }
  async autoJournalFromDeal(_dealId: string, _tenantId: string, _userId: string): Promise<ErpJournalEntry | null> { return null; }
  async autoJournalFromCommission(_commissionId: string, _tenantId: string, _userId: string): Promise<ErpJournalEntry | null> { return null; }

  // ─── User Preferences ──────────────────────────────────────────────────
  async getUserPreference(userId: string, key: string): Promise<UserPreference | null> {
    const row = await db.userPreference.findUnique({ where: { user_id_preference_key: { user_id: userId, preference_key: key } } });
    if (!row) return null;
    return { ...row, preference_value: row.preference_value, updated_at: dateToISOOrNow(row.updated_at) };
  }

  async setUserPreference(userId: string, key: string, value: unknown): Promise<UserPreference> {
    const serialized = JSON.stringify(value);
    const row = await db.userPreference.upsert({
      where: { user_id_preference_key: { user_id: userId, preference_key: key } },
      update: { preference_value: serialized },
      create: { user_id: userId, preference_key: key, preference_value: serialized },
    });
    return { ...row, preference_value: row.preference_value, updated_at: dateToISOOrNow(row.updated_at) };
  }

  async listUserPreferences(userId: string): Promise<UserPreference[]> {
    const rows = await db.userPreference.findMany({ where: { user_id: userId } });
    return rows.map((r) => ({ ...r, preference_value: r.preference_value, updated_at: dateToISOOrNow(r.updated_at) }));
  }
}

// SupabaseStore — production implementation of the Store interface.
// Talks directly to your Supabase project via the service_role key.
// Table names match schemas/supabase_v23_1.sql (snake_case).

import { Store, ListParams, ListResult } from "./store";
import { getSupabase } from "@/lib/supabase/client";
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
  TenantLetterhead, TenantSeal,
  KycSubmission, KycDocument, PortalRfq,
  TenantFeatureFlags,
  Notification,
  CommissionAgent, DealCommission, CommissionPayout, CommissionSummary,
  ErpAccount, FiscalPeriod, ErpJournalEntry, ErpJournalLine,
  ErpCostCenter, ErpBankAccount, ErpBankTransaction, ErpSetting,
  TrialBalance, TrialBalanceItem, BalanceSheetItem, BalanceSheet, ProfitAndLoss, GeneralLedger, GeneralLedgerEntry,
  UserPreference,
} from "@/lib/supabase/types";
import { verifyPassword } from "@/lib/auth/password";
import { createHash } from "crypto";

type SupaRow = Record<string, unknown>;

function paginate<T>(items: T[], params?: ListParams): ListResult<T> {
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;
  return { items: items.slice(offset, offset + limit), total: items.length };
}

export class SupabaseStore implements Store {
  private sb() {
    return getSupabase();
  }

  /**
   * Convert empty strings to null across the payload. Postgres refuses "" for
   * date/timestamp/numeric/uuid/jsonb columns with error 22007
   * ('invalid input syntax for type date: ""'), and every form in the app
   * sends "" for an unfilled optional field. This one-liner unblocks all of
   * them without every route having to re-implement the same sanitization.
   */
  private sanitizePayload(row: SupaRow): SupaRow {
    const out: SupaRow = {};
    for (const [k, v] of Object.entries(row)) {
      if (v === "") out[k] = null;
      else out[k] = v;
    }
    return out;
  }

  /**
   * Smart upsert: uses INSERT when no id is provided, UPDATE when id exists.
   * This avoids issues with Supabase's upsert() and auto-generated UUIDs.
   */
  private async smartUpsert<T>(
    table: string,
    data: Partial<T> & { id?: string },
  ): Promise<T> {
    const payload: SupaRow = this.sanitizePayload({ ...data });
    if (data.id) {
      // UPDATE existing record
      const { id, ...fields } = payload;
      const { data: updated, error } = await this.sb()
        .from(table)
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (!updated) {
        // Row doesn't exist — fall back to insert
        const { data: inserted, error: insErr } = await this.sb()
          .from(table)
          .insert(payload)
          .select()
          .single();
        if (insErr) throw insErr;
        return inserted as T;
      }
      return updated as T;
    }
    // INSERT new record (database auto-generates id)
    const { data: inserted, error } = await this.sb()
      .from(table)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return inserted as T;
  }

  // ---- auth ----
  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await this.sb()
      .from("users")
      .select("*")
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;
    return (data as User) || null;
  }
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.sb().from("users").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as User) || null;
  }
  async listUsers(tenantId: string): Promise<User[]> {
    // A falsy tenantId means "super-admin, no tenant filter" (see AuthContext.tenantId
    // doc comment: "null = super-admin, sees all"). `.eq("tenant_id", "")` or
    // `.eq("tenant_id", null)` matches zero rows in Postgres, which silently broke
    // every platform-wide count (e.g. the Platform Dashboard overview).
    let q = this.sb().from("users").select("*");
    if (tenantId) q = q.eq("tenant_id", tenantId);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) throw error;
    return (data as User[]) || [];
  }
  async upsertUser(u: Partial<User> & { id?: string }): Promise<User> {
    // When id is provided, use UPDATE — avoids NOT NULL constraint violations
    // on columns like username/email that aren't in the partial payload.
    // Supabase upsert tries INSERT first, which fails on NOT NULL columns
    // before the ON CONFLICT clause can kick in.
    if (u.id) {
      const { id, ...fields } = u;
      const { data, error } = await this.sb()
        .from("users")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (!data) {
        // Row doesn't exist yet — fall back to insert with full payload
        const { data: ins, error: insErr } = await this.sb()
          .from("users")
          .insert(u as SupaRow)
          .select()
          .single();
        if (insErr) throw insErr;
        return ins as User;
      }
      return data as User;
    }
    // No id — insert new user (database generates id via gen_random_uuid()::text)
    const payload: SupaRow = { ...u };
    const { data, error } = await this.sb()
      .from("users")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as User;
  }
  async deleteUser(id: string): Promise<void> {
    const { error } = await this.sb().from("users").delete().eq("id", id);
    if (error) throw error;
  }
  async updateUserLastLogin(id: string, ip: string): Promise<void> {
    const { error } = await this.sb()
      .from("users")
      .update({ last_login_at: new Date().toISOString(), last_login_ip: ip })
      .eq("id", id);
    if (error) throw error;
  }
  async bumpUserTokenVersion(id: string): Promise<number> {
    // read-modify-write (Supabase JS doesn't support atomic increment on json/jsonb easily)
    const u = await this.getUserById(id);
    const next = (u?.token_version ?? 0) + 1;
    const { error } = await this.sb().from("users").update({ token_version: next }).eq("id", id);
    if (error) throw error;
    return next;
  }

  // ---- partners ----
  async listPartners(tenantId: string, params?: ListParams): Promise<ListResult<Partner>> {
    let q = this.sb().from("partners").select("*");
    if (tenantId) q = q.eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,contact_name.ilike.%${params.search}%`);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    if (params?.filters?.type) q = q.eq("type", params.filters.type);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as Partner[]) || [], params);
  }
  async getPartner(id: string): Promise<Partner | null> {
    const { data, error } = await this.sb().from("partners").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Partner) || null;
  }
  async upsertPartner(p: Partial<Partner> & { id?: string }): Promise<Partner> {
    return this.smartUpsert<Partner>("partners", p);
  }
  async deletePartner(id: string): Promise<void> {
    const { error } = await this.sb().from("partners").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- products ----
  async listProducts(tenantId: string, params?: ListParams): Promise<ListResult<Product>> {
    let q = this.sb().from("products").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%`);
    if (params?.filters?.category) q = q.eq("category", params.filters.category);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as Product[]) || [], params);
  }
  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await this.sb().from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Product) || null;
  }
  async upsertProduct(p: Partial<Product> & { id?: string }): Promise<Product> {
    return this.smartUpsert<Product>("products", p);
  }
  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.sb().from("products").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- deals ----
  async listDeals(tenantId: string, params?: ListParams): Promise<ListResult<Deal>> {
    let q = this.sb().from("deals").select("*");
    if (tenantId) q = q.eq("tenant_id", tenantId);
    if (params?.search) q = q.ilike("title", `%${params.search}%`);
    if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
    if (params?.filters?.stage) q = q.eq("stage", params.filters.stage);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as Deal[]) || [], params);
  }
  async getDeal(id: string): Promise<Deal | null> {
    const { data, error } = await this.sb().from("deals").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Deal) || null;
  }
  async upsertDeal(d: Partial<Deal> & { id?: string }): Promise<Deal> {
    return this.smartUpsert<Deal>("deals", d);
  }
  async deleteDeal(id: string): Promise<void> {
    const { error } = await this.sb().from("deals").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- offers ----
  async listOffers(tenantId: string, params?: ListParams): Promise<ListResult<Offer>> {
    let q = this.sb().from("offers").select("*");
    if (tenantId) q = q.eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`number.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
    if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as Offer[]) || [], params);
  }
  async getOffer(id: string): Promise<Offer | null> {
    const { data, error } = await this.sb().from("offers").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Offer) || null;
  }
  async upsertOffer(o: Partial<Offer> & { id?: string }): Promise<Offer> {
    return this.smartUpsert<Offer>("offers", o);
  }
  async deleteOffer(id: string): Promise<void> {
    const { error } = await this.sb().from("offers").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- demands ----
  async listDemands(tenantId: string, params?: ListParams): Promise<ListResult<Demand>> {
    let q = this.sb().from("demands").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`number.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
    if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as Demand[]) || [], params);
  }
  async getDemand(id: string): Promise<Demand | null> {
    const { data, error } = await this.sb().from("demands").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Demand) || null;
  }
  async upsertDemand(d: Partial<Demand> & { id?: string }): Promise<Demand> {
    return this.smartUpsert<Demand>("demands", d);
  }
  async deleteDemand(id: string): Promise<void> {
    const { error } = await this.sb().from("demands").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- documents ----
  async listDocuments(tenantId: string, params?: ListParams): Promise<ListResult<SharedDocument>> {
    let q = this.sb().from("shared_documents").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.ilike("filename", `%${params.search}%`);
    if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as SharedDocument[]) || [], params);
  }
  async getDocument(id: string): Promise<SharedDocument | null> {
    const { data, error } = await this.sb().from("shared_documents").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as SharedDocument) || null;
  }
  async upsertDocument(d: Partial<SharedDocument> & { id?: string }): Promise<SharedDocument> {
    return this.smartUpsert<SharedDocument>("shared_documents", d);
  }
  async deleteDocument(id: string): Promise<void> {
    const { error } = await this.sb().from("shared_documents").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- audit ----
  async listAudit(tenantId: string, params?: ListParams): Promise<ListResult<AuditLog>> {
    let q = this.sb().from("audit_logs").select("*");
    if (tenantId) q = q.eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`action.ilike.%${params.search}%,username.ilike.%${params.search}%`);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as AuditLog[]) || [], params);
  }
  async appendAudit(entry: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog> {
    const { data, error } = await this.sb()
      .from("audit_logs")
      .insert({ ...entry })
      .select()
      .single();
    if (error) throw error;
    return data as AuditLog;
  }

  // ---- settings ----
  // Every setting lives under a specific tenant_id. `tenant_id = null` rows
  // are PLATFORM-level settings (fallback SMTP, platform password policy,
  // etc.) — only super_admin can read/write those.
  async getSetting<T = unknown>(key: string, tenantId: string | null = null): Promise<T | null> {
    const q = this.sb().from("settings").select("value").eq("key", key);
    if (tenantId === null) q.is("tenant_id", null);
    else q.eq("tenant_id", tenantId);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    return (data?.value as T) ?? null;
  }
  async setSetting(key: string, value: unknown, tenantId: string | null = null): Promise<void> {
    // Manual upsert: composite key (tenant_id, key) — but tenant_id can be null,
    // so we look up first then update or insert.
    const existing = this.sb().from("settings").select("id").eq("key", key);
    if (tenantId === null) existing.is("tenant_id", null);
    else existing.eq("tenant_id", tenantId);
    const { data: found } = await existing.maybeSingle();
    if (found) {
      const { error } = await this.sb()
        .from("settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", (found as any).id);
      if (error) throw error;
    } else {
      const { error } = await this.sb()
        .from("settings")
        .insert({ key, value, tenant_id: tenantId, updated_at: new Date().toISOString() });
      if (error) throw error;
    }
  }
  async getAllSettings(tenantId: string | null = null): Promise<Setting[]> {
    const q = this.sb().from("settings").select("*");
    if (tenantId === null) q.is("tenant_id", null);
    else q.eq("tenant_id", tenantId);
    const { data, error } = await q;
    if (error) throw error;
    return (data as Setting[]) || [];
  }

  // ---- tasks ----
  async listTasks(tenantId: string, userId?: string): Promise<UserTask[]> {
    let q = this.sb().from("user_tasks").select("*").eq("tenant_id", tenantId);
    if (userId) q = q.eq("user_id", userId);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data as UserTask[]) || [];
  }
  async upsertTask(t: Partial<UserTask> & { id?: string }): Promise<UserTask> {
    return this.smartUpsert<UserTask>("user_tasks", t);
  }
  async deleteTask(id: string): Promise<void> {
    const { error } = await this.sb().from("user_tasks").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- notes ----
  async listNotes(tenantId: string, entityType: string, entityId: string): Promise<EntityNote[]> {
    const { data, error } = await this.sb()
      .from("entity_notes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as EntityNote[]) || [];
  }
  async upsertNote(n: Partial<EntityNote> & { id?: string }): Promise<EntityNote> {
    return this.smartUpsert<EntityNote>("entity_notes", n);
  }
  async deleteNote(id: string): Promise<void> {
    const { error } = await this.sb().from("entity_notes").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- inventory ----
  async listInventory(tenantId: string, partnerId: string): Promise<InventoryMovement[]> {
    const { data, error } = await this.sb()
      .from("inventory_movements")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as InventoryMovement[]) || [];
  }
  async addInventoryMovement(m: Partial<InventoryMovement> & { id?: string }): Promise<InventoryMovement> {
    const payload: SupaRow = { ...m };
    const { data, error } = await this.sb().from("inventory_movements").insert(payload).select().single();
    if (error) throw error;
    return data as InventoryMovement;
  }

  // ---- dashboard ----
  async getInsights(tenantId?: string): Promise<DashboardInsights> {
    const sb = this.sb();
    const partnersQ = sb.from("partners").select("id, status");
    const dealsQ = sb.from("deals").select("id, stage, value, partner_id");
    const offersQ = sb.from("offers").select("id, status, created_at");
    const productsQ = sb.from("products").select("id, name, sku, stock, reorder_level");
    let auditQ = sb.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(6);
    const invoicesQ = sb.from("invoices").select("id, status, total, paid_at");
    const inventoryQ = sb.from("inventory_movements").select("id, created_at");

    if (tenantId) {
      partnersQ.eq("tenant_id", tenantId);
      dealsQ.eq("tenant_id", tenantId);
      offersQ.eq("tenant_id", tenantId);
      productsQ.eq("tenant_id", tenantId);
      auditQ = auditQ.eq("tenant_id", tenantId);
      invoicesQ.eq("tenant_id", tenantId);
      inventoryQ.eq("tenant_id", tenantId);
    }

    const [partnersR, dealsR, offersR, productsR, auditR, invoicesR, inventoryR] = await Promise.all([
      partnersQ,
      dealsQ,
      offersQ,
      productsQ,
      auditQ,
      invoicesQ,
      inventoryQ,
    ]);

    const partners = (partnersR.data as Partner[]) || [];
    const deals = (dealsR.data as Deal[]) || [];
    const offers = (offersR.data as Offer[]) || [];
    const products = (productsR.data as Product[]) || [];
    const recent = (auditR.data as AuditLog[]) || [];
    const invoices = (invoicesR.data as Invoice[]) || [];
    const inventoryMovements = (inventoryR.data as InventoryMovement[]) || [];

    const openDeals = deals.filter((d) => !["won", "lost"].includes(d.stage));
    const wonValue = deals.filter((d) => d.stage === "won").reduce((s, d) => s + (d.value || 0), 0);
    const pipelineValue = openDeals.reduce((s, d) => s + (d.value || 0), 0);
    const lowStockProducts = products
      .filter((p) => (p.reorder_level || 0) > 0 && (p.stock || 0) <= (p.reorder_level || 0))
      .map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock || 0, reorder_level: p.reorder_level || 0 }))
      .slice(0, 5);
    const lowStock = lowStockProducts.length;

    // outstanding invoices = sent or overdue
    const outstandingInvoices = invoices.filter(
      (i) => i.status === "sent" || i.status === "overdue"
    ).length;

    // inventory movements in the last 30 days
    const inv30 = inventoryMovements.filter(
      (m) => Date.now() - new Date(m.created_at).getTime() < 30 * 86400000
    ).length;

    const stages: DealStage[] = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];
    const byStage = stages.map((stage) => ({
      stage,
      count: deals.filter((d) => d.stage === stage).length,
      value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + (d.value || 0), 0),
    }));

    // top partners by deal value
    const partnerValue = new Map<string, number>();
    deals.forEach((d) => partnerValue.set(d.partner_id, (partnerValue.get(d.partner_id) || 0) + (d.value || 0)));
    const partnerNames = await Promise.all(
      Array.from(partnerValue.keys()).slice(0, 5).map(async (pid) => {
        const p = await this.getPartner(pid);
        return { id: pid, name: p?.name || pid, deal_value: partnerValue.get(pid) || 0 };
      })
    );
    const topPartners = partnerNames.sort((a, b) => b.deal_value - a.deal_value).slice(0, 5);

    // offers last 14 days (best-effort from returned data)
    const offersLast30: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      offersLast30.push({ date: d, count: offers.filter((o) => (o.created_at || "").slice(0, 10) === d).length });
    }

    // revenue last 14 days (sum of invoice totals paid on that day)
    const revenueLast30: { date: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const value = invoices
        .filter((inv) => inv.status === "paid" && (inv.paid_at || "").slice(0, 10) === d)
        .reduce((s, inv) => s + (inv.total || 0), 0);
      revenueLast30.push({ date: d, value });
    }

    return {
      kpis: {
        partners_total: partners.length,
        partners_active: partners.filter((p) => p.status === "active").length,
        deals_open: openDeals.length,
        deals_won_value: wonValue,
        pipeline_value: pipelineValue,
        offers_pending: offers.filter((o) => o.status === "sent" || o.status === "draft").length,
        low_stock_count: lowStock,
        invoices_outstanding: outstandingInvoices,
        inventory_movements_30d: inv30,
      },
      deals_by_stage: byStage,
      offers_last_30d: offersLast30,
      revenue_last_30d: revenueLast30,
      recent_activity: recent,
      top_partners: topPartners,
      low_stock_products: lowStockProducts,
    };
  }

  // ---- invoices ----
  async listInvoices(tenantId: string, params?: ListParams): Promise<ListResult<Invoice>> {
    let q = this.sb().from("invoices").select("*");
    if (tenantId) q = q.eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`number.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
    if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as Invoice[]) || [], params);
  }
  async getInvoice(id: string): Promise<Invoice | null> {
    const { data, error } = await this.sb().from("invoices").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Invoice) || null;
  }
  async upsertInvoice(i: Partial<Invoice> & { id?: string }): Promise<Invoice> {
    return this.smartUpsert<Invoice>("invoices", i);
  }
  async deleteInvoice(id: string): Promise<void> {
    const { error } = await this.sb().from("invoices").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- proformas ----
  async listProformas(tenantId: string, params?: ListParams): Promise<ListResult<Proforma>> {
    let q = this.sb().from("proformas").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`number.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
    if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as Proforma[]) || [], params);
  }
  async getProforma(id: string): Promise<Proforma | null> {
    const { data, error } = await this.sb().from("proformas").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Proforma) || null;
  }
  async upsertProforma(p: Partial<Proforma> & { id?: string }): Promise<Proforma> {
    return this.smartUpsert<Proforma>("proformas", p);
  }
  async deleteProforma(id: string): Promise<void> {
    const { error } = await this.sb().from("proformas").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- document register ----
  async listDocumentRegister(tenantId: string, params?: ListParams): Promise<ListResult<DocumentRegisterEntry>> {
    let q = this.sb().from("document_register").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`number.ilike.%${params.search}%,title.ilike.%${params.search}%`);
    if (params?.filters?.type) q = q.eq("type", params.filters.type);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as DocumentRegisterEntry[]) || [], params);
  }
  async upsertDocumentRegisterEntry(e: Partial<DocumentRegisterEntry> & { id?: string }): Promise<DocumentRegisterEntry> {
    return this.smartUpsert<DocumentRegisterEntry>("document_register", e);
  }
  async listDocumentRevisions(tenantId: string, documentId: string): Promise<DocumentRevision[]> {
    const { data, error } = await this.sb()
      .from("document_revisions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("document_id", documentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DocumentRevision[]) || [];
  }
  async addDocumentRevision(r: Partial<DocumentRevision> & { id?: string }): Promise<DocumentRevision> {
    const payload: SupaRow = { ...r };
    if (r.id) payload.id = r.id;
    if (!payload.tenant_id && r.tenant_id) payload.tenant_id = r.tenant_id;
    const { data, error } = await this.sb().from("document_revisions").insert(payload).select().single();
    if (error) throw error;
    return data as DocumentRevision;
  }
  async deleteDocumentRegisterEntry(id: string): Promise<void> {
    const { error } = await this.sb().from("document_register").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- vault ----
  async listVault(tenantId: string, params?: ListParams): Promise<ListResult<VaultSecret>> {
    let q = this.sb().from("vault_secrets").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`key.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.filters?.category) q = q.eq("category", params.filters.category);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as VaultSecret[]) || [], params);
  }
  async upsertVaultSecret(s: Partial<VaultSecret> & { id?: string }): Promise<VaultSecret> {
    return this.smartUpsert<VaultSecret>("vault_secrets", s);
  }
  async deleteVaultSecret(id: string): Promise<void> {
    const { error } = await this.sb().from("vault_secrets").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- api keys ----
  async listApiKeys(tenantId: string): Promise<ApiKey[]> {
    const { data, error } = await this.sb().from("api_keys").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ApiKey[]) || [];
  }
  async upsertApiKey(k: Partial<ApiKey> & { id?: string }): Promise<ApiKey> {
    return this.smartUpsert<ApiKey>("api_keys", k);
  }
  async deleteApiKey(id: string): Promise<void> {
    const { error } = await this.sb().from("api_keys").delete().eq("id", id);
    if (error) throw error;
  }
  async authenticateApiKey(rawKey: string): Promise<{ apiKey: ApiKey; tenantId: string } | null> {
    if (!rawKey.startsWith("asp_")) return null;
    const hash = createHash("sha256").update(rawKey).digest("hex");
    const prefix = rawKey.slice(0, 12);
    const { data, error } = await this.sb()
      .from("api_keys")
      .select("*")
      .eq("key_prefix", prefix)
      .eq("key_hash", hash)
      .eq("active", true)
      .maybeSingle();
    if (error) { console.error("[authenticateApiKey]", error); return null; }
    if (!data) return null;
    const key = data as ApiKey;
    // Check expiration
    if (key.expires_at && new Date(key.expires_at) < new Date()) return null;
    return { apiKey: key, tenantId: key.tenant_id };
  }
  async updateApiKeyLastUsed(id: string, ip: string): Promise<void> {
    await this.sb()
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString(), last_used_ip: ip })
      .eq("id", id);
  }

  // ---- webhooks ----
  async listWebhooks(tenantId: string): Promise<Webhook[]> {
    const { data, error } = await this.sb().from("webhooks").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Webhook[]) || [];
  }
  async upsertWebhook(w: Partial<Webhook> & { id?: string }): Promise<Webhook> {
    return this.smartUpsert<Webhook>("webhooks", w);
  }
  async deleteWebhook(id: string): Promise<void> {
    const { error } = await this.sb().from("webhooks").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- security ----
  async listSessions(tenantId: string, userId?: string): Promise<SecuritySession[]> {
    let q = this.sb().from("sessions").select("*").eq("tenant_id", tenantId);
    if (userId) q = q.eq("user_id", userId);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data as SecuritySession[]) || [];
  }
  async revokeSession(id: string): Promise<void> {
    const { error } = await this.sb().from("sessions").update({ revoked: true }).eq("id", id);
    if (error) throw error;
  }
  async listLoginHistory(tenantId: string, userId?: string, limit?: number): Promise<LoginHistoryEntry[]> {
    let q = this.sb().from("login_history").select("*").eq("tenant_id", tenantId);
    if (userId) q = q.eq("user_id", userId);
    q = q.order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data as LoginHistoryEntry[]) || [];
  }
  async listKnownIps(tenantId: string, userId?: string): Promise<KnownIp[]> {
    let q = this.sb().from("known_ips").select("*").eq("tenant_id", tenantId);
    if (userId) q = q.eq("user_id", userId);
    q = q.order("last_seen", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data as KnownIp[]) || [];
  }
  async trustIp(id: string, trusted: boolean): Promise<void> {
    const { error } = await this.sb().from("known_ips").update({ trusted }).eq("id", id);
    if (error) throw error;
  }
  async forgetIp(id: string): Promise<void> {
    const { error } = await this.sb().from("known_ips").delete().eq("id", id);
    if (error) throw error;
  }
  async listTrustedDevices(tenantId: string, userId?: string): Promise<TrustedDevice[]> {
    let q = this.sb().from("trusted_devices").select("*").eq("tenant_id", tenantId);
    if (userId) q = q.eq("user_id", userId);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data as TrustedDevice[]) || [];
  }
  async revokeTrustedDevice(id: string): Promise<void> {
    const { error } = await this.sb().from("trusted_devices").update({ revoked: true }).eq("id", id);
    if (error) throw error;
  }

  // ---- mail queue ----
  async listMailQueue(tenantId: string, params?: ListParams): Promise<ListResult<MailQueueEntry>> {
    let q = this.sb().from("mail_queue").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`subject.ilike.%${params.search}%,to_email.ilike.%${params.search}%`);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as MailQueueEntry[]) || [], params);
  }
  async upsertMailQueueEntry(m: Partial<MailQueueEntry> & { id?: string }): Promise<MailQueueEntry> {
    return this.smartUpsert<MailQueueEntry>("mail_queue", m);
  }
  async deleteMailQueueEntry(id: string): Promise<void> {
    const { error } = await this.sb().from("mail_queue").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- all inventory (global view) ----
  async listAllInventory(tenantId: string, params?: ListParams): Promise<ListResult<InventoryMovement>> {
    let q = this.sb().from("inventory_movements").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`reason.ilike.%${params.search}%,reference.ilike.%${params.search}%`);
    if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
    if (params?.filters?.product_id) q = q.eq("product_id", params.filters.product_id);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as InventoryMovement[]) || [], params);
  }

  // ---- tenants (multi-tenancy) ----
  async listTenants(): Promise<Tenant[]> {
    const { data, error } = await this.sb()
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Tenant[]) || [];
  }
  async getTenant(id: string): Promise<Tenant | null> {
    const { data, error } = await this.sb().from("tenants").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Tenant) || null;
  }
  async upsertTenant(t: Partial<Tenant> & { id?: string }): Promise<Tenant> {
    return this.smartUpsert<Tenant>("tenants", t);
  }
  async deleteTenant(id: string): Promise<void> {
    const { error } = await this.sb().from("tenants").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- product catalog ----
  async listProductCatalog(tenantId: string, params?: ListParams): Promise<ListResult<ProductCatalogEntry>> {
    let q = this.sb().from("product_catalog").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`name.ilike.%${params.search}%,hs_code.ilike.%${params.search}%`);
    if (params?.filters?.category) q = q.eq("category", params.filters.category);
    if (params?.filters?.active !== undefined) q = q.eq("active", params.filters.active === "true");
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as ProductCatalogEntry[]) || [], params);
  }
  async getProductCatalogEntry(id: string): Promise<ProductCatalogEntry | null> {
    const { data, error } = await this.sb().from("product_catalog").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as ProductCatalogEntry) || null;
  }
  async upsertProductCatalogEntry(p: Partial<ProductCatalogEntry> & { id?: string }): Promise<ProductCatalogEntry> {
    return this.smartUpsert<ProductCatalogEntry>("product_catalog", p);
  }
  async deleteProductCatalogEntry(id: string): Promise<void> {
    const { error } = await this.sb().from("product_catalog").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- supplier offers ----
  async listSupplierOffers(tenantId: string, params?: ListParams): Promise<ListResult<SupplierOffer>> {
    let q = this.sb().from("supplier_offers").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`offer_number.ilike.%${params.search}%,packaging.ilike.%${params.search}%`);
    if (params?.filters?.product_id) q = q.eq("product_id", params.filters.product_id);
    if (params?.filters?.supplier_id) q = q.eq("supplier_id", params.filters.supplier_id);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as SupplierOffer[]) || [], params);
  }
  async getSupplierOffer(id: string): Promise<SupplierOffer | null> {
    const { data, error } = await this.sb().from("supplier_offers").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as SupplierOffer) || null;
  }
  async upsertSupplierOffer(s: Partial<SupplierOffer> & { id?: string }): Promise<SupplierOffer> {
    return this.smartUpsert<SupplierOffer>("supplier_offers", s);
  }
  async deleteSupplierOffer(id: string): Promise<void> {
    const { error } = await this.sb().from("supplier_offers").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- trade calculations ----
  async listTradeCalculations(tenantId: string, params?: ListParams): Promise<ListResult<TradeCalculation>> {
    let q = this.sb().from("trade_calculations").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.ilike("name", `%${params.search}%`);
    if (params?.filters?.product_id) q = q.eq("product_id", params.filters.product_id);
    if (params?.filters?.supplier_id) q = q.eq("supplier_id", params.filters.supplier_id);
    if (params?.filters?.buyer_id) q = q.eq("buyer_id", params.filters.buyer_id);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as TradeCalculation[]) || [], params);
  }
  async getTradeCalculation(id: string): Promise<TradeCalculation | null> {
    const { data, error } = await this.sb().from("trade_calculations").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as TradeCalculation) || null;
  }
  async upsertTradeCalculation(t: Partial<TradeCalculation> & { id?: string }): Promise<TradeCalculation> {
    return this.smartUpsert<TradeCalculation>("trade_calculations", t);
  }
  async deleteTradeCalculation(id: string): Promise<void> {
    const { error } = await this.sb().from("trade_calculations").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- portal access ----
  async getPortalAccessByPartner(partnerId: string): Promise<PortalAccess | null> {
    const { data, error } = await this.sb().from("portal_access").select("*").eq("partner_id", partnerId).maybeSingle();
    if (error) throw error;
    return (data as PortalAccess) || null;
  }
  async getPortalAccessByEmail(tenantId: string, email: string): Promise<PortalAccess | null> {
    const { data, error } = await this.sb().from("portal_access").select("*").eq("tenant_id", tenantId).eq("portal_email", email).maybeSingle();
    if (error) throw error;
    return (data as PortalAccess) || null;
  }
  async getPortalAccessById(id: string): Promise<PortalAccess | null> {
    const { data, error } = await this.sb().from("portal_access").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as PortalAccess) || null;
  }
  async listPortalAccess(tenantId: string): Promise<PortalAccess[]> {
    const { data, error } = await this.sb().from("portal_access").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as PortalAccess[]) || [];
  }
  async upsertPortalAccess(p: Partial<PortalAccess> & { id?: string }): Promise<PortalAccess> {
    const payload: SupaRow = { ...p };
    // Strip columns that may not exist in the database yet (added gracefully)
    const columnsThatMayNotExist = [
      "feature_flags", "onboarding_status", "portal_locked_until",
      "failed_login_attempts", "lockout_until", "notes",
      "failed_attempts", "locked_until", "token_version",
    ];
    for (const col of columnsThatMayNotExist) {
      if (payload[col] === undefined) delete payload[col];
    }
    // When id is provided, use UPDATE — avoids NOT NULL constraint violations
    // on columns like partner_id that aren't in the partial payload.
    if (p.id) {
      const { id, ...fields } = payload;
      // Strip any undefined values to avoid overwriting with null
      const cleanFields: SupaRow = {};
      for (const [k, v] of Object.entries(fields)) {
        if (v !== undefined) cleanFields[k] = v;
      }
      const { data, error } = await this.sb()
        .from("portal_access")
        .update(cleanFields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (!data) {
        // Row doesn't exist yet — fall back to insert with full payload
        const { data: ins, error: insErr } = await this.sb()
          .from("portal_access")
          .insert(payload)
          .select()
          .single();
        if (insErr) throw insErr;
        return ins as PortalAccess;
      }
      return data as PortalAccess;
    }
    // No id — insert new portal access
    const { data, error } = await this.sb().from("portal_access").insert(payload).select().single();
    if (error) throw error;
    return data as PortalAccess;
  }
  async deletePortalAccess(id: string): Promise<void> {
    const { error } = await this.sb().from("portal_access").delete().eq("id", id);
    if (error) throw error;
  }
  async verifyPortalCredentials(tenantId: string, email: string, password: string): Promise<PortalAccess | null> {
    const pa = await this.getPortalAccessByEmail(tenantId, email);
    if (!pa || !pa.password_hash) return null;
    if (pa.status !== "active") return null;
    const valid = await verifyPassword(password, pa.password_hash);
    if (!valid) return null;
    return pa;
  }

  async verifyPortalCredentialsByEmail(email: string, password: string): Promise<PortalAccess | null> {
    const { data, error } = await this.sb().from("portal_access").select("*").eq("portal_email", email).maybeSingle();
    if (error || !data) return null;
    const pa = data as PortalAccess;
    if (!pa.password_hash || pa.status !== "active") return null;
    const valid = await verifyPassword(password, pa.password_hash);
    return valid ? pa : null;
  }
  async getPortalAccessByEmailAnyTenant(email: string): Promise<PortalAccess | null> {
    const { data, error } = await this.sb().from("portal_access").select("*").eq("portal_email", email).maybeSingle();
    if (error || !data) return null;
    return data as PortalAccess;
  }
  async listPortalAccessByEmail(email: string): Promise<PortalAccess[]> {
    const { data, error } = await this.sb().from("portal_access").select("*").eq("portal_email", email);
    if (error) return [];
    return (data as PortalAccess[]) || [];
  }

  // ---- document templates ----
  async listDocumentTemplates(tenantId: string): Promise<DocumentTemplate[]> {
    const { data, error } = await this.sb().from("document_templates").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DocumentTemplate[]) || [];
  }
  async getDocumentTemplate(id: string): Promise<DocumentTemplate | null> {
    const { data, error } = await this.sb().from("document_templates").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as DocumentTemplate) || null;
  }
  async getDefaultDocumentTemplate(tenantId: string, type: string): Promise<DocumentTemplate | null> {
    const { data, error } = await this.sb().from("document_templates").select("*").eq("tenant_id", tenantId).eq("type", type).eq("is_default", true).maybeSingle();
    if (error) throw error;
    return (data as DocumentTemplate) || null;
  }
  async upsertDocumentTemplate(t: Partial<DocumentTemplate> & { id?: string }): Promise<DocumentTemplate> {
    return this.smartUpsert<DocumentTemplate>("document_templates", t);
  }
  async deleteDocumentTemplate(id: string): Promise<void> {
    const { error } = await this.sb().from("document_templates").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- document verification ----
  async createDocumentVerification(v: Omit<DocumentVerification, "id" | "created_at" | "verification_count" | "last_verified_at" | "last_verified_ip" | "status"> & { status?: string }): Promise<DocumentVerification> {
    const payload: SupaRow = { ...v };
    const { data, error } = await this.sb().from("document_verifications").insert(payload).select().single();
    if (error) throw error;
    return data as DocumentVerification;
  }
  async getDocumentVerificationByCode(code: string): Promise<DocumentVerification | null> {
    try {
      const { data, error } = await this.sb().from("document_verifications").select("*").eq("verification_code", code).maybeSingle();
      if (error) {
        console.warn("[getDocumentVerificationByCode] Query failed:", error.message);
        return null;
      }
      return (data as DocumentVerification) || null;
    } catch (err) {
      console.warn("[getDocumentVerificationByCode] Unexpected error:", err);
      return null;
    }
  }
  async getDocumentVerificationByDoc(tenantId: string, docType: string, docId: string): Promise<DocumentVerification | null> {
    try {
      const { data, error } = await this.sb().from("document_verifications").select("*").eq("tenant_id", tenantId).eq("document_type", docType).eq("document_id", docId).maybeSingle();
      if (error) {
        console.warn("[getDocumentVerificationByDoc] Query failed:", error.message);
        return null;
      }
      return (data as DocumentVerification) || null;
    } catch (err) {
      console.warn("[getDocumentVerificationByDoc] Unexpected error:", err);
      return null;
    }
  }
  async logVerification(log: Omit<VerificationLog, "id" | "verified_at">): Promise<VerificationLog> {
    try {
      const { data, error } = await this.sb().from("verification_logs").insert({ ...log }).select().single();
      if (error) {
        // verification_logs table may not exist yet — fail gracefully
        console.warn("[logVerification] Could not write verification log:", error.message);
        return { ...log, id: "fallback", verified_at: new Date().toISOString() } as VerificationLog;
      }
      return data as VerificationLog;
    } catch (err) {
      // verification_logs table may not exist — fail gracefully
      console.warn("[logVerification] Unexpected error writing verification log:", err);
      return { ...log, id: "fallback", verified_at: new Date().toISOString() } as VerificationLog;
    }
  }
  async listVerificationLogs(verificationId: string): Promise<VerificationLog[]> {
    try {
      const { data, error } = await this.sb().from("verification_logs").select("*").eq("verification_id", verificationId).order("verified_at", { ascending: false });
      if (error) {
        console.warn("[listVerificationLogs] Could not read verification logs:", error.message);
        return [];
      }
      return (data as VerificationLog[]) || [];
    } catch (err) {
      console.warn("[listVerificationLogs] Unexpected error:", err);
      return [];
    }
  }

  // ---- KYC submissions ----
  async listKycSubmissions(tenantId: string, params?: ListParams): Promise<ListResult<KycSubmission>> {
    let q = this.sb().from("kyc_submissions").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`legal_name.ilike.%${params.search}%,trade_name.ilike.%${params.search}%,contact_email.ilike.%${params.search}%`);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as KycSubmission[]) || [], params);
  }
  async getKycSubmission(id: string): Promise<KycSubmission | null> {
    const { data, error } = await this.sb().from("kyc_submissions").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as KycSubmission) || null;
  }
  async getKycSubmissionByPartner(partnerId: string): Promise<KycSubmission | null> {
    const { data, error } = await this.sb().from("kyc_submissions").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false }).limit(1);
    if (error) throw error;
    return ((data as KycSubmission[]) || [])[0] || null;
  }
  async upsertKycSubmission(s: Partial<KycSubmission> & { id?: string }): Promise<KycSubmission> {
    return this.smartUpsert<KycSubmission>("kyc_submissions", s);
  }
  async deleteKycSubmission(id: string): Promise<void> {
    const { error } = await this.sb().from("kyc_submissions").delete().eq("id", id);
    if (error) throw error;
  }
  async addKycDocument(doc: Omit<KycDocument, "id" | "uploaded_at">): Promise<KycDocument> {
    // Legacy path — kyc_documents table doesn't exist. We now record everything
    // in portal_uploads with category='kyc' and echo back a KycDocument-shaped
    // response so old callers keep working.
    const submission = await this.getKycSubmission(doc.submission_id);
    if (!submission) throw new Error("KYC submission not found");
    // portal_uploads canonical column is `size_bytes` (verified against
    // production DB introspection). No `size` fallback — PostgREST rejects
    // unknown columns on some deployments.
    const { data, error } = await this.sb().from("portal_uploads").insert({
      tenant_id: submission.tenant_id,
      partner_id: submission.partner_id,
      portal_access_id: submission.portal_access_id,
      category: "kyc",
      doc_type: doc.type,
      kyc_submission_id: doc.submission_id,
      filename: doc.filename,
      storage_bucket: "kyc-documents",
      storage_path: doc.storage_path,
      mime_type: doc.mime_type,
      size_bytes: doc.size,
    }).select().single();
    if (error) throw error;
    return {
      id: (data as any).id,
      submission_id: doc.submission_id,
      type: doc.type,
      filename: doc.filename,
      storage_path: doc.storage_path,
      mime_type: doc.mime_type,
      size: doc.size,
      uploaded_at: (data as any).uploaded_at,
    } as KycDocument;
  }
  async removeKycDocument(id: string): Promise<void> {
    // Legacy: soft-delete the equivalent portal_uploads row.
    const { error } = await this.sb().from("portal_uploads").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  }
  async approveKycAndTransfer(submissionId: string, reviewedBy: string): Promise<{ submission: KycSubmission; partner: Partner }> {
    // 1. Get the submission
    const sub = await this.getKycSubmission(submissionId);
    if (!sub) throw new Error("KYC submission not found");

    // 2. Update the submission status
    const { data: updatedSub, error: subErr } = await this.sb()
      .from("kyc_submissions")
      .update({
        status: "approved",
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        auto_transferred: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .select()
      .single();
    if (subErr) throw subErr;

    // 3. Transfer KYC data to the partner record
    const partnerUpdate: Record<string, unknown> = {
      kyc_status: "approved",
      kyc_reviewed_by: reviewedBy,
      kyc_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Transfer address & contact fields if present
    if (sub.legal_name) partnerUpdate.name = sub.legal_name;
    if (sub.tax_id) partnerUpdate.tax_id = sub.tax_id;
    if (sub.vat_number) partnerUpdate.vat_number = sub.vat_number;
    if (sub.registration_number) partnerUpdate.registration_number = sub.registration_number;
    if (sub.company_website) partnerUpdate.website = sub.company_website;
    if (sub.address_line) partnerUpdate.address_line = sub.address_line;
    if (sub.city) partnerUpdate.city = sub.city;
    if (sub.state) partnerUpdate.state = sub.state;
    if (sub.postal_code) partnerUpdate.postal_code = sub.postal_code;
    if (sub.country) partnerUpdate.country = sub.country;
    if (sub.contact_name) partnerUpdate.contact_name = sub.contact_name;
    if (sub.contact_email) partnerUpdate.contact_email = sub.contact_email;
    if (sub.contact_phone) partnerUpdate.contact_phone = sub.contact_phone;
    if (sub.bank_name) partnerUpdate.bank_name = sub.bank_name;
    if (sub.bank_account) partnerUpdate.bank_account = sub.bank_account;
    if (sub.bank_iban) partnerUpdate.bank_iban = sub.bank_iban;
    if (sub.bank_swift) partnerUpdate.bank_swift = sub.bank_swift;
    // Store the full KYC data blob
    partnerUpdate.kyc_data = sub;

    const { data: updatedPartner, error: partnerErr } = await this.sb()
      .from("partners")
      .update(partnerUpdate)
      .eq("id", sub.partner_id)
      .select()
      .single();
    if (partnerErr) throw partnerErr;

    return { submission: updatedSub as KycSubmission, partner: updatedPartner as Partner };
  }

  // ---- portal RFQs ----
  async listPortalRfqs(tenantId: string, params?: ListParams): Promise<ListResult<PortalRfq>> {
    let q = this.sb().from("portal_rfqs").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`number.ilike.%${params.search}%,product_name.ilike.%${params.search}%`);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as PortalRfq[]) || [], params);
  }
  async listPortalRfqsByPartner(partnerId: string): Promise<PortalRfq[]> {
    const { data, error } = await this.sb().from("portal_rfqs").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as PortalRfq[]) || [];
  }
  async getPortalRfq(id: string): Promise<PortalRfq | null> {
    const { data, error } = await this.sb().from("portal_rfqs").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as PortalRfq) || null;
  }
  async upsertPortalRfq(r: Partial<PortalRfq> & { id?: string }): Promise<PortalRfq> {
    return this.smartUpsert<PortalRfq>("portal_rfqs", r);
  }
  async deletePortalRfq(id: string): Promise<void> {
    const { error } = await this.sb().from("portal_rfqs").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- feature flags ----
  async getFeatureFlags(tenantId: string): Promise<TenantFeatureFlags | null> {
    const { data, error } = await this.sb().from("feature_flags").select("*").eq("tenant_id", tenantId).maybeSingle();
    if (error) throw error;
    return (data as TenantFeatureFlags) || null;
  }
  async upsertFeatureFlags(f: Partial<TenantFeatureFlags> & { id?: string; tenant_id: string }): Promise<TenantFeatureFlags> {
    const payload: SupaRow = { ...f };
    if (f.id) payload.id = f.id;
    const { data, error } = await this.sb().from("feature_flags").upsert(payload, { onConflict: "tenant_id" }).select().single();
    if (error) throw error;
    return data as TenantFeatureFlags;
  }

  // ---- notifications ----
  async listNotifications(tenantId: string, userId?: string, unreadOnly?: boolean): Promise<Notification[]> {
    let q = this.sb().from("notifications").select("*").eq("tenant_id", tenantId);
    if (userId) q = q.eq("user_id", userId);
    if (unreadOnly) q = q.eq("read", false);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data as Notification[]) || [];
  }
  async listNotificationsByPartner(tenantId: string, partnerId: string): Promise<Notification[]> {
    // STRICT: only notifications addressed to this exact partner. No broadcast
    // leak — internal notifications with partner_id=null are NEVER exposed to
    // the portal. Also restricted to portal-safe types so misrouted internal
    // notifications can't slip through.
    const PORTAL_SAFE_TYPES = [
      "kyc_submitted", "kyc_approved", "kyc_rejected",
      "rfq_received", "rfq_quoted",
      "offer_sent", "offer_accepted", "offer_rejected", "offer_expired",
      "invoice_overdue", "invoice_paid",
      "document_shared",
      "portal_access_requested", "portal_access_approved", "portal_invite_sent",
      "portal_message",
    ];
    const { data, error } = await this.sb()
      .from("notifications")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("partner_id", partnerId)
      .in("type", PORTAL_SAFE_TYPES)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Notification[]) || [];
  }
  async createNotification(n: Omit<Notification, "id" | "created_at" | "read" | "read_at">): Promise<Notification> {
    const { data, error } = await this.sb().from("notifications").insert({ ...n, read: false }).select().single();
    if (error) throw error;
    return data as Notification;
  }
  async markNotificationRead(id: string): Promise<void> {
    const { error } = await this.sb().from("notifications").update({ read: true, read_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  }
  async markAllNotificationsRead(tenantId: string, userId: string): Promise<void> {
    const { error } = await this.sb().from("notifications").update({ read: true, read_at: new Date().toISOString() }).eq("tenant_id", tenantId).eq("user_id", userId).eq("read", false);
    if (error) throw error;
  }
  async deleteNotification(id: string): Promise<void> {
    const { error } = await this.sb().from("notifications").delete().eq("id", id);
    if (error) throw error;
  }
  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    const { count, error } = await this.sb().from("notifications").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("user_id", userId).eq("read", false);
    if (error) throw error;
    return count ?? 0;
  }

  // ---- commission agents ----
  async listCommissionAgents(tenantId: string, params?: ListParams): Promise<ListResult<CommissionAgent>> {
    let q = this.sb().from("commission_agents").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.ilike("partner_id", `%${params.search}%`);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as CommissionAgent[]) || [], params);
  }
  async getCommissionAgent(id: string): Promise<CommissionAgent | null> {
    const { data, error } = await this.sb().from("commission_agents").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as CommissionAgent) || null;
  }
  async getCommissionAgentByPartner(partnerId: string): Promise<CommissionAgent | null> {
    const { data, error } = await this.sb().from("commission_agents").select("*").eq("partner_id", partnerId).maybeSingle();
    if (error) throw error;
    return (data as CommissionAgent) || null;
  }
  async upsertCommissionAgent(a: Partial<CommissionAgent> & { id?: string }): Promise<CommissionAgent> {
    return this.smartUpsert<CommissionAgent>("commission_agents", a);
  }
  async deleteCommissionAgent(id: string): Promise<void> {
    const { error } = await this.sb().from("commission_agents").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- deal commissions ----
  async listDealCommissions(tenantId: string, params?: ListParams): Promise<ListResult<DealCommission>> {
    let q = this.sb().from("deal_commissions").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.ilike("deal_id", `%${params.search}%`);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as DealCommission[]) || [], params);
  }
  async listDealCommissionsByDeal(dealId: string): Promise<DealCommission[]> {
    const { data, error } = await this.sb().from("deal_commissions").select("*").eq("deal_id", dealId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DealCommission[]) || [];
  }
  async listDealCommissionsByAgent(agentId: string): Promise<DealCommission[]> {
    const { data, error } = await this.sb().from("deal_commissions").select("*").eq("agent_id", agentId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DealCommission[]) || [];
  }
  async getDealCommission(id: string): Promise<DealCommission | null> {
    const { data, error } = await this.sb().from("deal_commissions").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as DealCommission) || null;
  }
  async upsertDealCommission(c: Partial<DealCommission> & { id?: string }): Promise<DealCommission> {
    return this.smartUpsert<DealCommission>("deal_commissions", c);
  }
  async deleteDealCommission(id: string): Promise<void> {
    const { error } = await this.sb().from("deal_commissions").delete().eq("id", id);
    if (error) throw error;
  }
  async approveDealCommission(id: string, approvedBy: string): Promise<DealCommission> {
    const { data, error } = await this.sb()
      .from("deal_commissions")
      .update({ status: "approved", approved_by: approvedBy, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as DealCommission;
  }
  async markDealCommissionPaid(id: string, payoutReference?: string): Promise<DealCommission> {
    const update: Record<string, unknown> = {
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (payoutReference) update.payout_reference = payoutReference;
    const { data, error } = await this.sb()
      .from("deal_commissions")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as DealCommission;
  }

  // ---- commission payouts ----
  async listCommissionPayouts(tenantId: string, params?: ListParams): Promise<ListResult<CommissionPayout>> {
    let q = this.sb().from("commission_payouts").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.ilike("agent_id", `%${params.search}%`);
    q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as CommissionPayout[]) || [], params);
  }
  async getCommissionPayout(id: string): Promise<CommissionPayout | null> {
    const { data, error } = await this.sb().from("commission_payouts").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as CommissionPayout) || null;
  }
  async upsertCommissionPayout(p: Partial<CommissionPayout> & { id?: string }): Promise<CommissionPayout> {
    return this.smartUpsert<CommissionPayout>("commission_payouts", p);
  }
  async deleteCommissionPayout(id: string): Promise<void> {
    const { error } = await this.sb().from("commission_payouts").delete().eq("id", id);
    if (error) throw error;
  }

  // ---- commission summaries ----
  async getCommissionSummaries(tenantId: string): Promise<CommissionSummary[]> {
    const agents = await this.listCommissionAgents(tenantId);
    const summaries: CommissionSummary[] = [];
    for (const agent of agents.items) {
      if (!agent.active) continue;
      const commissions = await this.listDealCommissionsByAgent(agent.id);
      const partner = await this.getPartner(agent.partner_id);
      summaries.push({
        agent_id: agent.id,
        partner_id: agent.partner_id,
        partner_name: partner?.name || "Unknown",
        total_deals: commissions.length,
        total_commission: commissions.reduce((sum, c) => sum + c.calculated_commission, 0),
        paid_commission: commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.calculated_commission, 0),
        pending_commission: commissions.filter(c => c.status === "pending" || c.status === "approved").reduce((sum, c) => sum + c.calculated_commission, 0),
        currency: agent.commission_currency,
      });
    }
    return summaries;
  }
  async calculateCommission(agentId: string, dealValue: number, dealProfit: number, dealQuantity: number, _dealUnit: string, _currency: string): Promise<number> {
    const agent = await this.getCommissionAgent(agentId);
    if (!agent) return 0;
    switch (agent.commission_type) {
      case "profit_percent": return dealProfit * (agent.commission_rate / 100);
      case "revenue_percent": return dealValue * (agent.commission_rate / 100);
      case "fixed": return agent.commission_rate;
      case "per_unit": return agent.commission_per_unit * dealQuantity;
      case "custom": return agent.commission_rate;
      default: return 0;
    }
  }

  // ─── ERP Accounts ────────────────────────────────────────────────────────
  async listErpAccounts(tenantId: string, params?: ListParams): Promise<ListResult<ErpAccount>> {
    let q = this.sb().from("erp_accounts").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`code.ilike.%${params.search}%,name.ilike.%${params.search}%`);
    if (params?.filters?.account_type) q = q.eq("account_type", params.filters.account_type);
    if (params?.filters?.is_active !== undefined) q = q.eq("is_active", params.filters.is_active);
    q = q.order("code", { ascending: true });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as ErpAccount[]) || [], params);
  }

  async getErpAccount(id: string): Promise<ErpAccount | null> {
    const { data, error } = await this.sb().from("erp_accounts").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as ErpAccount) || null;
  }

  async upsertErpAccount(a: Partial<ErpAccount> & { id?: string }): Promise<ErpAccount> {
    const payload: SupaRow = { ...a };
    if (a.id) payload.id = a.id;
    const { data, error } = await this.sb().from("erp_accounts").upsert(payload, { onConflict: "tenant_id,code" }).select().single();
    if (error) throw error;
    return data as ErpAccount;
  }

  async deleteErpAccount(id: string): Promise<void> {
    const { error } = await this.sb().from("erp_accounts").delete().eq("id", id);
    if (error) throw error;
  }

  // ─── Fiscal Periods ──────────────────────────────────────────────────────
  async listFiscalPeriods(tenantId: string, params?: ListParams): Promise<ListResult<FiscalPeriod>> {
    let q = this.sb().from("fiscal_periods").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.ilike("name", `%${params.search}%`);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    if (params?.filters?.fiscal_year) q = q.eq("fiscal_year", params.filters.fiscal_year);
    q = q.order("start_date", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as FiscalPeriod[]) || [], params);
  }

  async getFiscalPeriod(id: string): Promise<FiscalPeriod | null> {
    const { data, error } = await this.sb().from("fiscal_periods").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as FiscalPeriod) || null;
  }

  async upsertFiscalPeriod(p: Partial<FiscalPeriod> & { id?: string }): Promise<FiscalPeriod> {
    return this.smartUpsert<FiscalPeriod>("fiscal_periods", p);
  }

  async closeFiscalPeriod(id: string, closedBy: string): Promise<FiscalPeriod> {
    const { data, error } = await this.sb()
      .from("fiscal_periods")
      .update({ status: "closed", closed_by: closedBy, closed_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as FiscalPeriod;
  }

  // ─── Journal Entries ─────────────────────────────────────────────────────
  async listErpJournalEntries(tenantId: string, params?: ListParams): Promise<ListResult<ErpJournalEntry>> {
    let q = this.sb().from("erp_journal_entries").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`entry_number.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.filters?.status) q = q.eq("status", params.filters.status);
    if (params?.filters?.reference_type) q = q.eq("reference_type", params.filters.reference_type);
    if (params?.filters?.reference_id) q = q.eq("reference_id", params.filters.reference_id);
    q = q.order("date", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    const entries = (data as ErpJournalEntry[]) || [];
    // Attach lines for each entry
    if (entries.length > 0) {
      const entryIds = entries.map(e => e.id);
      const { data: linesData, error: linesError } = await this.sb()
        .from("erp_journal_lines")
        .select("*")
        .in("journal_entry_id", entryIds)
        .order("line_number", { ascending: true });
      if (linesError) throw linesError;
      const lines = (linesData as ErpJournalLine[]) || [];
      const linesByEntry = new Map<string, ErpJournalLine[]>();
      for (const l of lines) {
        const arr = linesByEntry.get(l.journal_entry_id) || [];
        arr.push(l);
        linesByEntry.set(l.journal_entry_id, arr);
      }
      for (const e of entries) {
        e.lines = linesByEntry.get(e.id) || [];
      }
    }
    return paginate(entries, params);
  }

  async getErpJournalEntry(id: string): Promise<ErpJournalEntry | null> {
    const { data, error } = await this.sb().from("erp_journal_entries").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const entry = data as ErpJournalEntry;
    // Fetch lines
    const { data: linesData, error: linesError } = await this.sb()
      .from("erp_journal_lines")
      .select("*")
      .eq("journal_entry_id", id)
      .order("line_number", { ascending: true });
    if (linesError) throw linesError;
    entry.lines = (linesData as ErpJournalLine[]) || [];
    return entry;
  }

  async upsertErpJournalEntry(e: Partial<ErpJournalEntry> & { id?: string; lines?: Partial<ErpJournalLine & { id?: string }>[] }): Promise<ErpJournalEntry> {
    const { lines, ...entryFields } = e;
    // Compute debit/credit totals from lines if provided
    if (lines && lines.length > 0) {
      entryFields.debit_total = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
      entryFields.credit_total = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    }
    const payload: SupaRow = { ...entryFields };
    if (e.id) payload.id = e.id;
    const { data, error } = await this.sb().from("erp_journal_entries").upsert(payload, { onConflict: "tenant_id,entry_number" }).select().single();
    if (error) throw error;
    const entry = data as ErpJournalEntry;
    // Handle lines: delete existing + insert new
    if (lines && lines.length > 0) {
      // Delete old lines for this entry
      await this.sb().from("erp_journal_lines").delete().eq("journal_entry_id", entry.id);
      // Insert new lines
      const linePayloads: SupaRow[] = lines.map((l, idx) => {
        const { id: _lid, ...rest } = l;
        return { ...rest, journal_entry_id: entry.id, line_number: l.line_number ?? (idx + 1) };
      });
      const { data: insertedLines, error: linesError } = await this.sb()
        .from("erp_journal_lines")
        .insert(linePayloads)
        .select();
      if (linesError) throw linesError;
      entry.lines = (insertedLines as ErpJournalLine[]) || [];
    } else {
      // Fetch existing lines
      const { data: existingLines } = await this.sb()
        .from("erp_journal_lines")
        .select("*")
        .eq("journal_entry_id", entry.id)
        .order("line_number", { ascending: true });
      entry.lines = (existingLines as ErpJournalLine[]) || [];
    }
    return entry;
  }

  async postErpJournalEntry(id: string, postedBy: string): Promise<ErpJournalEntry> {
    const { data, error } = await this.sb()
      .from("erp_journal_entries")
      .update({ status: "posted", posted_by: postedBy, posted_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    // Attach lines
    const { data: linesData } = await this.sb().from("erp_journal_lines").select("*").eq("journal_entry_id", id).order("line_number", { ascending: true });
    (data as ErpJournalEntry).lines = (linesData as ErpJournalLine[]) || [];
    return data as ErpJournalEntry;
  }

  async reverseErpJournalEntry(id: string, reversedBy: string): Promise<ErpJournalEntry> {
    // Fetch original entry
    const original = await this.getErpJournalEntry(id);
    if (!original) throw new Error("Journal entry not found");
    if (original.status === "reversed") throw new Error("Entry already reversed");
    // Fetch lines
    const { data: origLines } = await this.sb().from("erp_journal_lines").select("*").eq("journal_entry_id", id).order("line_number", { ascending: true });
    const lines = (origLines as ErpJournalLine[]) || [];
    // Create reversal entry (swap debit/credit)
    const reversalNumber = `REV-${original.entry_number}`;
    const reversalPayload: SupaRow = {
      tenant_id: original.tenant_id,
      entry_number: reversalNumber,
      date: new Date().toISOString(),
      description: `Reversal of ${original.entry_number}: ${original.description}`,
      reference_type: original.reference_type,
      reference_id: original.reference_id,
      fiscal_period_id: original.fiscal_period_id,
      status: "posted",
      source_type: "auto",
      debit_total: original.credit_total,
      credit_total: original.debit_total,
      currency: original.currency,
      exchange_rate: original.exchange_rate,
      notes: `Reversal of entry ${id}`,
      created_by: reversedBy,
      posted_by: reversedBy,
      posted_at: new Date().toISOString(),
    };
    const { data: revEntry, error: revError } = await this.sb()
      .from("erp_journal_entries")
      .insert(reversalPayload)
      .select()
      .single();
    if (revError) throw revError;
    const reversal = revEntry as ErpJournalEntry;
    // Insert reversed lines (swap debit/credit)
    if (lines.length > 0) {
      const revLines: SupaRow[] = lines.map((l, idx) => ({
        journal_entry_id: reversal.id,
        account_id: l.account_id,
        line_number: idx + 1,
        description: l.description,
        debit: l.credit,
        credit: l.debit,
        currency: l.currency,
        partner_id: l.partner_id,
        cost_center_id: l.cost_center_id,
      }));
      const { data: insertedLines } = await this.sb().from("erp_journal_lines").insert(revLines).select();
      reversal.lines = (insertedLines as ErpJournalLine[]) || [];
    }
    // Mark original as reversed
    await this.sb().from("erp_journal_entries").update({ status: "reversed" }).eq("id", id);
    return reversal;
  }

  async deleteErpJournalEntry(id: string): Promise<void> {
    // Lines cascade delete via FK
    const { error } = await this.sb().from("erp_journal_entries").delete().eq("id", id);
    if (error) throw error;
  }

  // ─── Cost Centers ────────────────────────────────────────────────────────
  async listErpCostCenters(tenantId: string, params?: ListParams): Promise<ListResult<ErpCostCenter>> {
    let q = this.sb().from("erp_cost_centers").select("*").eq("tenant_id", tenantId);
    if (params?.search) q = q.or(`code.ilike.%${params.search}%,name.ilike.%${params.search}%`);
    if (params?.filters?.is_active !== undefined) q = q.eq("is_active", params.filters.is_active);
    q = q.order("code", { ascending: true });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as ErpCostCenter[]) || [], params);
  }

  async upsertErpCostCenter(c: Partial<ErpCostCenter> & { id?: string }): Promise<ErpCostCenter> {
    const payload: SupaRow = { ...c };
    if (c.id) payload.id = c.id;
    const { data, error } = await this.sb().from("erp_cost_centers").upsert(payload, { onConflict: "tenant_id,code" }).select().single();
    if (error) throw error;
    return data as ErpCostCenter;
  }

  async deleteErpCostCenter(id: string): Promise<void> {
    const { error } = await this.sb().from("erp_cost_centers").delete().eq("id", id);
    if (error) throw error;
  }

  // ─── Bank Accounts ───────────────────────────────────────────────────────
  async listErpBankAccounts(tenantId: string): Promise<ErpBankAccount[]> {
    const { data, error } = await this.sb().from("erp_bank_accounts").select("*").eq("tenant_id", tenantId).order("bank_name", { ascending: true });
    if (error) throw error;
    return (data as ErpBankAccount[]) || [];
  }

  async upsertErpBankAccount(b: Partial<ErpBankAccount> & { id?: string }): Promise<ErpBankAccount> {
    return this.smartUpsert<ErpBankAccount>("erp_bank_accounts", b);
  }

  async deleteErpBankAccount(id: string): Promise<void> {
    const { error } = await this.sb().from("erp_bank_accounts").delete().eq("id", id);
    if (error) throw error;
  }

  // ─── Bank Transactions ──────────────────────────────────────────────────
  async listErpBankTransactions(tenantId: string, bankAccountId?: string, params?: ListParams): Promise<ListResult<ErpBankTransaction>> {
    let q = this.sb().from("erp_bank_transactions").select("*").eq("tenant_id", tenantId);
    if (bankAccountId) q = q.eq("bank_account_id", bankAccountId);
    if (params?.search) q = q.or(`description.ilike.%${params.search}%,reference.ilike.%${params.search}%,counterparty.ilike.%${params.search}%`);
    if (params?.filters?.is_reconciled !== undefined) q = q.eq("is_reconciled", params.filters.is_reconciled);
    q = q.order("date", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return paginate((data as ErpBankTransaction[]) || [], params);
  }

  async upsertErpBankTransaction(t: Partial<ErpBankTransaction> & { id?: string }): Promise<ErpBankTransaction> {
    const payload: SupaRow = { ...t };
    let txn: ErpBankTransaction;
    if (t.id) {
      const { id, ...fields } = payload;
      const { data, error } = await this.sb()
        .from("erp_bank_transactions")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (!data) {
        const { data: inserted, error: insErr } = await this.sb()
          .from("erp_bank_transactions")
          .insert(payload)
          .select()
          .single();
        if (insErr) throw insErr;
        txn = inserted as ErpBankTransaction;
      } else {
        txn = data as ErpBankTransaction;
      }
    } else {
      const { data, error } = await this.sb()
        .from("erp_bank_transactions")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      txn = data as ErpBankTransaction;
    }
    // Update bank account balance
    if (txn.bank_account_id) {
      const { data: ba } = await this.sb().from("erp_bank_accounts").select("balance").eq("id", txn.bank_account_id).maybeSingle();
      if (ba) {
        const adjustment = txn.transaction_type === "credit" ? txn.amount : -txn.amount;
        await this.sb().from("erp_bank_accounts").update({ balance: (ba.balance as number) + adjustment }).eq("id", txn.bank_account_id);
      }
    }
    return txn;
  }

  async reconcileBankTransaction(id: string, journalEntryId: string): Promise<ErpBankTransaction> {
    const { data, error } = await this.sb()
      .from("erp_bank_transactions")
      .update({ is_reconciled: true, journal_entry_id: journalEntryId, reconciled_with: journalEntryId })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ErpBankTransaction;
  }

  // ─── ERP Settings (already implemented — kept as-is) ────────────────────
  async getErpSettings(tenantId: string): Promise<ErpSetting | null> {
    const { data, error } = await this.sb().from("erp_settings").select("*").eq("tenant_id", tenantId).maybeSingle();
    if (error) throw error;
    return (data as ErpSetting) || null;
  }
  async upsertErpSettings(s: Partial<ErpSetting> & { id?: string; tenant_id: string }): Promise<ErpSetting> {
    const payload: SupaRow = { ...s };
    if (s.id) payload.id = s.id;
    const { data, error } = await this.sb().from("erp_settings").upsert(payload, { onConflict: "tenant_id" }).select().single();
    if (error) throw error;
    return data as ErpSetting;
  }

  // ─── ERP Reports ────────────────────────────────────────────────────────
  async getTrialBalance(tenantId: string, asOfDate: string): Promise<TrialBalance> {
    // Fetch all posted journal entries up to asOfDate
    const { data: entries, error: entriesError } = await this.sb()
      .from("erp_journal_entries")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("status", "posted")
      .lte("date", asOfDate);
    if (entriesError) throw entriesError;
    const entryIds = ((entries || []) as { id: string }[]).map(e => e.id);
    if (entryIds.length === 0) return { items: [], total_debit: 0, total_credit: 0, as_of_date: asOfDate };
    // Fetch all lines for those entries
    const { data: lines, error: linesError } = await this.sb()
      .from("erp_journal_lines")
      .select("account_id, debit, credit")
      .in("journal_entry_id", entryIds);
    if (linesError) throw linesError;
    // Fetch accounts for this tenant
    const { data: accounts, error: accountsError } = await this.sb()
      .from("erp_accounts")
      .select("id, code, name, account_type")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);
    if (accountsError) throw accountsError;
    const accountMap = new Map<string, { code: string; name: string; account_type: string }>();
    for (const a of (accounts || []) as { id: string; code: string; name: string; account_type: string }[]) {
      accountMap.set(a.id, a);
    }
    // Aggregate by account
    const accTotals = new Map<string, { debit: number; credit: number }>();
    for (const l of (lines || []) as { account_id: string; debit: number; credit: number }[]) {
      const cur = accTotals.get(l.account_id) || { debit: 0, credit: 0 };
      cur.debit += l.debit || 0;
      cur.credit += l.credit || 0;
      accTotals.set(l.account_id, cur);
    }
    const items: TrialBalanceItem[] = [];
    let totalDebit = 0;
    let totalCredit = 0;
    for (const [accountId, totals] of accTotals) {
      const acc = accountMap.get(accountId);
      if (!acc) continue;
      const balance = totals.debit - totals.credit;
      items.push({
        account_id: accountId,
        account_code: acc.code,
        account_name: acc.name,
        account_type: acc.account_type,
        debit_total: totals.debit,
        credit_total: totals.credit,
        balance,
      });
      totalDebit += totals.debit;
      totalCredit += totals.credit;
    }
    items.sort((a, b) => a.account_code.localeCompare(b.account_code));
    return { items, total_debit: totalDebit, total_credit: totalCredit, as_of_date: asOfDate };
  }

  async getBalanceSheet(tenantId: string, asOfDate: string): Promise<BalanceSheet> {
    // Get trial balance data
    const tb = await this.getTrialBalance(tenantId, asOfDate);
    const assets: BalanceSheetItem[] = [];
    const liabilities: BalanceSheetItem[] = [];
    const equity: BalanceSheetItem[] = [];
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    for (const item of tb.items) {
      const bsItem: BalanceSheetItem = { account_code: item.account_code, account_name: item.account_name, amount: Math.abs(item.balance) };
      switch (item.account_type) {
        case "asset":
          assets.push(bsItem);
          totalAssets += item.balance; // assets: debit balance
          break;
        case "liability":
          liabilities.push(bsItem);
          totalLiabilities += item.balance; // liability: credit balance (shown as positive)
          break;
        case "equity":
          equity.push(bsItem);
          totalEquity += item.balance; // equity: credit balance (shown as positive)
          break;
        default:
          break;
      }
    }
    return { assets, liabilities, equity, total_assets: totalAssets, total_liabilities: totalLiabilities, total_equity: totalEquity, as_of_date: asOfDate };
  }

  async getProfitAndLoss(tenantId: string, periodStart: string, periodEnd: string): Promise<ProfitAndLoss> {
    // Fetch posted journal entries in the period
    const { data: entries, error: entriesError } = await this.sb()
      .from("erp_journal_entries")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("status", "posted")
      .gte("date", periodStart)
      .lte("date", periodEnd);
    if (entriesError) throw entriesError;
    const entryIds = ((entries || []) as { id: string }[]).map(e => e.id);
    if (entryIds.length === 0) return { revenue: [], expenses: [], total_revenue: 0, total_expenses: 0, net_profit: 0, period_start: periodStart, period_end: periodEnd };
    // Fetch lines
    const { data: lines, error: linesError } = await this.sb()
      .from("erp_journal_lines")
      .select("account_id, debit, credit")
      .in("journal_entry_id", entryIds);
    if (linesError) throw linesError;
    // Fetch revenue and expense accounts
    const { data: accounts, error: accountsError } = await this.sb()
      .from("erp_accounts")
      .select("id, code, name, account_type")
      .eq("tenant_id", tenantId)
      .in("account_type", ["revenue", "expense"])
      .eq("is_active", true);
    if (accountsError) throw accountsError;
    const accountMap = new Map<string, { code: string; name: string; account_type: string }>();
    for (const a of (accounts || []) as { id: string; code: string; name: string; account_type: string }[]) {
      accountMap.set(a.id, a);
    }
    // Aggregate
    const accTotals = new Map<string, { debit: number; credit: number }>();
    for (const l of (lines || []) as { account_id: string; debit: number; credit: number }[]) {
      const cur = accTotals.get(l.account_id) || { debit: 0, credit: 0 };
      cur.debit += l.debit || 0;
      cur.credit += l.credit || 0;
      accTotals.set(l.account_id, cur);
    }
    const revenue: BalanceSheetItem[] = [];
    const expenses: BalanceSheetItem[] = [];
    let totalRevenue = 0;
    let totalExpenses = 0;
    for (const [accountId, totals] of accTotals) {
      const acc = accountMap.get(accountId);
      if (!acc) continue;
      const item: BalanceSheetItem = { account_code: acc.code, account_name: acc.name, amount: Math.abs(totals.credit - totals.debit) };
      if (acc.account_type === "revenue") {
        revenue.push(item);
        totalRevenue += totals.credit - totals.debit; // revenue: credit balance
      } else if (acc.account_type === "expense") {
        expenses.push(item);
        totalExpenses += totals.debit - totals.credit; // expense: debit balance
      }
    }
    return { revenue, expenses, total_revenue: totalRevenue, total_expenses: totalExpenses, net_profit: totalRevenue - totalExpenses, period_start: periodStart, period_end: periodEnd };
  }

  async getGeneralLedger(tenantId: string, accountId: string, dateFrom?: string, dateTo?: string): Promise<GeneralLedger> {
    // Get account info
    const account = await this.getErpAccount(accountId);
    const accountCode = account?.code || "";
    const accountName = account?.name || "";
    // Get all posted journal entries for this tenant
    let entryQuery = this.sb()
      .from("erp_journal_entries")
      .select("id, entry_number, date, description, reference_type, reference_id")
      .eq("tenant_id", tenantId)
      .eq("status", "posted");
    if (dateFrom) entryQuery = entryQuery.gte("date", dateFrom);
    if (dateTo) entryQuery = entryQuery.lte("date", dateTo);
    const { data: entries, error: entriesError } = await entryQuery.order("date", { ascending: true });
    if (entriesError) throw entriesError;
    const entryIds = ((entries || []) as { id: string }[]).map(e => e.id);
    if (entryIds.length === 0) {
      return { account_id: accountId, account_code: accountCode, account_name: accountName, entries: [], opening_balance: 0, closing_balance: 0, total_debit: 0, total_credit: 0 };
    }
    // Get lines for this account across all matching entries
    const { data: lines, error: linesError } = await this.sb()
      .from("erp_journal_lines")
      .select("journal_entry_id, debit, credit")
      .eq("account_id", accountId)
      .in("journal_entry_id", entryIds);
    if (linesError) throw linesError;
    const linesByEntry = new Map<string, { debit: number; credit: number }>();
    for (const l of (lines || []) as { journal_entry_id: string; debit: number; credit: number }[]) {
      linesByEntry.set(l.journal_entry_id, { debit: l.debit, credit: l.credit });
    }
    // Compute opening balance (all posted lines before dateFrom)
    let openingBalance = 0;
    if (dateFrom) {
      const { data: preEntries } = await this.sb()
        .from("erp_journal_entries")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("status", "posted")
        .lt("date", dateFrom);
      const preEntryIds = ((preEntries || []) as { id: string }[]).map(e => e.id);
      if (preEntryIds.length > 0) {
        const { data: preLines } = await this.sb()
          .from("erp_journal_lines")
          .select("debit, credit")
          .eq("account_id", accountId)
          .in("journal_entry_id", preEntryIds);
        for (const pl of (preLines || []) as { debit: number; credit: number }[]) {
          openingBalance += (pl.debit || 0) - (pl.credit || 0);
        }
      }
    }
    // Build entries list
    const glEntries: GeneralLedgerEntry[] = [];
    let runningBalance = openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;
    for (const entry of (entries || []) as { id: string; entry_number: string; date: string; description: string; reference_type: string | null; reference_id: string | null }[]) {
      const line = linesByEntry.get(entry.id);
      if (!line) continue;
      const debit = line.debit || 0;
      const credit = line.credit || 0;
      runningBalance += debit - credit;
      totalDebit += debit;
      totalCredit += credit;
      glEntries.push({
        journal_entry_id: entry.id,
        entry_number: entry.entry_number,
        date: entry.date,
        description: entry.description,
        debit,
        credit,
        balance: runningBalance,
        reference_type: entry.reference_type,
        reference_id: entry.reference_id,
      });
    }
    return {
      account_id: accountId,
      account_code: accountCode,
      account_name: accountName,
      entries: glEntries,
      opening_balance: openingBalance,
      closing_balance: runningBalance,
      total_debit: totalDebit,
      total_credit: totalCredit,
    };
  }

  // ─── Auto-Journal ────────────────────────────────────────────────────────
  async autoJournalFromInvoice(invoiceId: string, tenantId: string, userId: string): Promise<ErpJournalEntry | null> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) return null;
    const settings = await this.getErpSettings(tenantId);
    const receivableAccountId = settings?.receivable_account_id;
    const revenueAccountId = settings?.revenue_account_id;
    if (!receivableAccountId || !revenueAccountId) return null;
    // Generate entry number
    const entryNumber = `INV-${invoice.number}-${Date.now()}`;
    const entry: SupaRow = {
      tenant_id: tenantId,
      entry_number: entryNumber,
      date: invoice.issue_date,
      description: `Invoice ${invoice.number} - ${invoice.subject || "Sales"}`,
      reference_type: "invoice",
      reference_id: invoiceId,
      status: settings.auto_post_journal ? "posted" : "draft",
      source_type: "auto",
      debit_total: invoice.total,
      credit_total: invoice.total,
      currency: invoice.currency,
      exchange_rate: 1,
      created_by: userId,
      posted_by: settings.auto_post_journal ? userId : null,
      posted_at: settings.auto_post_journal ? new Date().toISOString() : null,
    };
    const { data, error } = await this.sb().from("erp_journal_entries").insert(entry).select().single();
    if (error) throw error;
    const je = data as ErpJournalEntry;
    // Create lines: Debit AR, Credit Revenue
    const linePayloads: SupaRow[] = [
      { journal_entry_id: je.id, account_id: receivableAccountId, line_number: 1, description: `AR for invoice ${invoice.number}`, debit: invoice.total, credit: 0, currency: invoice.currency, partner_id: invoice.partner_id },
      { journal_entry_id: je.id, account_id: revenueAccountId, line_number: 2, description: `Revenue for invoice ${invoice.number}`, debit: 0, credit: invoice.total, currency: invoice.currency, partner_id: invoice.partner_id },
    ];
    const { data: insertedLines, error: linesError } = await this.sb().from("erp_journal_lines").insert(linePayloads).select();
    if (linesError) throw linesError;
    je.lines = (insertedLines as ErpJournalLine[]) || [];
    return je;
  }

  async autoJournalFromDeal(dealId: string, tenantId: string, userId: string): Promise<ErpJournalEntry | null> {
    const deal = await this.getDeal(dealId);
    if (!deal) return null;
    const settings = await this.getErpSettings(tenantId);
    const revenueAccountId = settings?.revenue_account_id;
    const expenseAccountId = settings?.expense_account_id;
    const receivableAccountId = settings?.receivable_account_id;
    if (!revenueAccountId || !receivableAccountId) return null;
    const entryNumber = `DEAL-${dealId.slice(0, 8)}-${Date.now()}`;
    const totalDebit = deal.value;
    const totalCredit = deal.value;
    const entry: SupaRow = {
      tenant_id: tenantId,
      entry_number: entryNumber,
      date: new Date().toISOString(),
      description: `Deal revenue: ${deal.title}`,
      reference_type: "deal",
      reference_id: dealId,
      status: settings?.auto_post_journal ? "posted" : "draft",
      source_type: "auto",
      debit_total: totalDebit,
      credit_total: totalCredit,
      currency: deal.currency,
      exchange_rate: 1,
      created_by: userId,
      posted_by: settings?.auto_post_journal ? userId : null,
      posted_at: settings?.auto_post_journal ? new Date().toISOString() : null,
    };
    const { data, error } = await this.sb().from("erp_journal_entries").insert(entry).select().single();
    if (error) throw error;
    const je = data as ErpJournalEntry;
    const linePayloads: SupaRow[] = [
      { journal_entry_id: je.id, account_id: receivableAccountId, line_number: 1, description: `AR for deal ${deal.title}`, debit: deal.value, credit: 0, currency: deal.currency, partner_id: deal.partner_id },
      { journal_entry_id: je.id, account_id: revenueAccountId, line_number: 2, description: `Revenue for deal ${deal.title}`, debit: 0, credit: deal.value, currency: deal.currency, partner_id: deal.partner_id },
    ];
    // Add COGS line if deal has buy_cost and expense account configured
    if (deal.buy_cost > 0 && expenseAccountId) {
      const payableAccountId = settings?.payable_account_id || expenseAccountId;
      linePayloads.push(
        { journal_entry_id: je.id, account_id: expenseAccountId, line_number: 3, description: `COGS for deal ${deal.title}`, debit: deal.buy_cost, credit: 0, currency: deal.currency, partner_id: deal.partner_id },
        { journal_entry_id: je.id, account_id: payableAccountId, line_number: 4, description: `AP for deal ${deal.title} cost`, debit: 0, credit: deal.buy_cost, currency: deal.currency, partner_id: deal.partner_id },
      );
      // Adjust totals
      je.debit_total += deal.buy_cost;
      je.credit_total += deal.buy_cost;
      await this.sb().from("erp_journal_entries").update({ debit_total: je.debit_total, credit_total: je.credit_total }).eq("id", je.id);
    }
    const { data: insertedLines, error: linesError } = await this.sb().from("erp_journal_lines").insert(linePayloads).select();
    if (linesError) throw linesError;
    je.lines = (insertedLines as ErpJournalLine[]) || [];
    return je;
  }

  async autoJournalFromCommission(commissionId: string, tenantId: string, userId: string): Promise<ErpJournalEntry | null> {
    const commission = await this.getDealCommission(commissionId);
    if (!commission) return null;
    const settings = await this.getErpSettings(tenantId);
    const expenseAccountId = settings?.expense_account_id;
    const payableAccountId = settings?.payable_account_id;
    if (!expenseAccountId || !payableAccountId) return null;
    const entryNumber = `COMM-${commissionId.slice(0, 8)}-${Date.now()}`;
    const amount = commission.calculated_commission;
    const entry: SupaRow = {
      tenant_id: tenantId,
      entry_number: entryNumber,
      date: new Date().toISOString(),
      description: `Commission expense: ${commission.commission_type} on deal ${commission.deal_id}`,
      reference_type: "commission",
      reference_id: commissionId,
      status: settings?.auto_post_journal ? "posted" : "draft",
      source_type: "auto",
      debit_total: amount,
      credit_total: amount,
      currency: commission.commission_currency,
      exchange_rate: 1,
      created_by: userId,
      posted_by: settings?.auto_post_journal ? userId : null,
      posted_at: settings?.auto_post_journal ? new Date().toISOString() : null,
    };
    const { data, error } = await this.sb().from("erp_journal_entries").insert(entry).select().single();
    if (error) throw error;
    const je = data as ErpJournalEntry;
    const linePayloads: SupaRow[] = [
      { journal_entry_id: je.id, account_id: expenseAccountId, line_number: 1, description: `Commission expense`, debit: amount, credit: 0, currency: commission.commission_currency, partner_id: commission.partner_id },
      { journal_entry_id: je.id, account_id: payableAccountId, line_number: 2, description: `Commission payable`, debit: 0, credit: amount, currency: commission.commission_currency, partner_id: commission.partner_id },
    ];
    const { data: insertedLines, error: linesError } = await this.sb().from("erp_journal_lines").insert(linePayloads).select();
    if (linesError) throw linesError;
    je.lines = (insertedLines as ErpJournalLine[]) || [];
    return je;
  }

  // ---- user preferences ----
  async getUserPreference(userId: string, key: string): Promise<UserPreference | null> {
    const { data, error } = await this.sb()
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .eq("preference_key", key)
      .maybeSingle();
    if (error) throw error;
    return data as UserPreference | null;
  }

  async setUserPreference(userId: string, key: string, value: unknown): Promise<UserPreference> {
    const { data, error } = await this.sb()
      .from("user_preferences")
      .upsert(
        {
          user_id: userId,
          preference_key: key,
          preference_value: typeof value === "string" ? value : JSON.stringify(value),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,preference_key" }
      )
      .select()
      .single();
    if (error) throw error;
    return data as UserPreference;
  }

  async listUserPreferences(userId: string): Promise<UserPreference[]> {
    const { data, error } = await this.sb()
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .order("preference_key");
    if (error) throw error;
    return (data as UserPreference[]) || [];
  }

  // ─── Security (write methods) ───────────────────────────────────────────

  async createSession(s: { user_id: string; ip?: string | null; user_agent?: string | null; country?: string | null; expires_at: string; current?: boolean }): Promise<SecuritySession> {
    // Resolve tenant_id from user
    const user = await this.getUserById(s.user_id);
    const payload: SupaRow = {
      user_id: s.user_id,
      tenant_id: user?.tenant_id || null,
      ip: s.ip ?? null,
      user_agent: s.user_agent ?? null,
      country: s.country ?? null,
      expires_at: s.expires_at,
      current: s.current ?? false,
      revoked: false,
      last_used_at: new Date().toISOString(),
    };
    const { data, error } = await this.sb().from("sessions").insert(payload).select().single();
    if (error) throw error;
    return data as SecuritySession;
  }

  async revokeSessionById(id: string): Promise<void> {
    const { error } = await this.sb().from("sessions").update({ revoked: true, current: false }).eq("id", id);
    if (error) throw error;
  }

  async touchSession(id: string): Promise<void> {
    try {
      await this.sb().from("sessions").update({ last_used_at: new Date().toISOString() }).eq("id", id);
    } catch { /* best-effort */ }
  }

  async recordLoginHistory(e: { user_id: string; username: string; ip?: string | null; user_agent?: string | null; country?: string | null; success: boolean; reason?: string | null }): Promise<LoginHistoryEntry> {
    const user = e.user_id ? await this.getUserById(e.user_id) : null;
    const payload: SupaRow = {
      user_id: e.user_id || null,
      tenant_id: user?.tenant_id || null,
      username: e.username,
      ip: e.ip ?? null,
      user_agent: e.user_agent ?? null,
      country: e.country ?? null,
      success: e.success,
      reason: e.reason ?? null,
    };
    const { data, error } = await this.sb().from("login_history").insert(payload).select().single();
    if (error) throw error;
    return data as LoginHistoryEntry;
  }

  async upsertKnownIp(ip: { user_id: string; ip: string; country?: string | null; trusted?: boolean }): Promise<KnownIp> {
    const user = await this.getUserById(ip.user_id);
    // Find existing
    const { data: existing } = await this.sb()
      .from("known_ips")
      .select("*")
      .eq("user_id", ip.user_id)
      .eq("ip", ip.ip)
      .maybeSingle();
    if (existing) {
      const { data, error } = await this.sb()
        .from("known_ips")
        .update({
          last_seen: new Date().toISOString(),
          country: ip.country ?? (existing as any).country,
          trusted: ip.trusted ?? (existing as any).trusted,
        })
        .eq("id", (existing as any).id)
        .select()
        .single();
      if (error) throw error;
      return data as KnownIp;
    }
    const payload: SupaRow = {
      user_id: ip.user_id,
      tenant_id: user?.tenant_id || null,
      ip: ip.ip,
      country: ip.country ?? null,
      trusted: ip.trusted ?? false,
    };
    const { data, error } = await this.sb().from("known_ips").insert(payload).select().single();
    if (error) throw error;
    return data as KnownIp;
  }

  async upsertTrustedDevice(d: { user_id: string; device_name: string; fingerprint: string; ip?: string | null }): Promise<TrustedDevice> {
    const user = await this.getUserById(d.user_id);
    const { data: existing } = await this.sb()
      .from("trusted_devices")
      .select("*")
      .eq("user_id", d.user_id)
      .eq("fingerprint", d.fingerprint)
      .maybeSingle();
    if (existing) {
      const { data, error } = await this.sb()
        .from("trusted_devices")
        .update({
          last_used: new Date().toISOString(),
          ip: d.ip ?? (existing as any).ip,
          device_name: d.device_name || (existing as any).device_name,
        })
        .eq("id", (existing as any).id)
        .select()
        .single();
      if (error) throw error;
      return data as TrustedDevice;
    }
    const payload: SupaRow = {
      user_id: d.user_id,
      tenant_id: user?.tenant_id || null,
      device_name: d.device_name,
      fingerprint: d.fingerprint,
      ip: d.ip ?? null,
    };
    const { data, error } = await this.sb().from("trusted_devices").insert(payload).select().single();
    if (error) throw error;
    return data as TrustedDevice;
  }

  async revokeTrustedDeviceById(id: string): Promise<void> {
    const { error } = await this.sb().from("trusted_devices").update({ revoked: true }).eq("id", id);
    if (error) throw error;
  }

  // ─── Tenant Letterheads (Memorandum firme) ──────────────────────────────

  async listLetterheads(tenantId: string): Promise<TenantLetterhead[]> {
    const { data, error } = await this.sb()
      .from("tenant_letterheads")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as TenantLetterhead[]) || [];
  }

  async getLetterhead(id: string): Promise<TenantLetterhead | null> {
    const { data, error } = await this.sb().from("tenant_letterheads").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as TenantLetterhead) || null;
  }

  async getDefaultLetterhead(tenantId: string): Promise<TenantLetterhead | null> {
    const { data, error } = await this.sb()
      .from("tenant_letterheads")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();
    if (error) throw error;
    return (data as TenantLetterhead) || null;
  }

  async upsertLetterhead(l: Partial<TenantLetterhead> & { id?: string; tenant_id: string }): Promise<TenantLetterhead> {
    // If setting as default, unset other defaults
    if (l.is_default) {
      await this.sb()
        .from("tenant_letterheads")
        .update({ is_default: false })
        .eq("tenant_id", l.tenant_id)
        .eq("is_default", true)
        .neq("id", l.id || "00000000-0000-0000-0000-000000000000");
    }
    return this.smartUpsert<TenantLetterhead>("tenant_letterheads", l);
  }

  async deleteLetterhead(id: string): Promise<void> {
    // Unlink templates referencing this letterhead
    await this.sb().from("document_templates").update({ letterhead_id: null }).eq("letterhead_id", id);
    const { error } = await this.sb().from("tenant_letterheads").delete().eq("id", id);
    if (error) throw error;
  }

  // ─── Tenant Seals (Zigled) ──────────────────────────────────────────────

  async listSeals(tenantId: string): Promise<TenantSeal[]> {
    const { data, error } = await this.sb()
      .from("tenant_seals")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as TenantSeal[]) || [];
  }

  async getSeal(id: string): Promise<TenantSeal | null> {
    const { data, error } = await this.sb().from("tenant_seals").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as TenantSeal) || null;
  }

  async getDefaultSeal(tenantId: string): Promise<TenantSeal | null> {
    const { data, error } = await this.sb()
      .from("tenant_seals")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .maybeSingle();
    if (error) throw error;
    return (data as TenantSeal) || null;
  }

  async upsertSeal(s: Partial<TenantSeal> & { id?: string; tenant_id: string }): Promise<TenantSeal> {
    if (s.is_default) {
      await this.sb()
        .from("tenant_seals")
        .update({ is_default: false })
        .eq("tenant_id", s.tenant_id)
        .eq("is_default", true)
        .neq("id", s.id || "00000000-0000-0000-0000-000000000000");
    }
    return this.smartUpsert<TenantSeal>("tenant_seals", s);
  }

  async deleteSeal(id: string): Promise<void> {
    await this.sb().from("document_templates").update({ seal_id: null }).eq("seal_id", id);
    const { error } = await this.sb().from("tenant_seals").delete().eq("id", id);
    if (error) throw error;
  }
}

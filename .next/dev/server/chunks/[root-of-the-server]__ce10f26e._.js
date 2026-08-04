module.exports = [
"[project]/src/lib/supabase/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabase",
    ()=>getSupabase,
    "getSupabaseAnon",
    ()=>getSupabaseAnon,
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
/**
 * Server-side Supabase client using the service_role key.
 * Bypasses RLS — safe because this only ever runs on the server
 * (API routes / server components) and the key never reaches the browser.
 */ let cached = null;
function isSupabaseConfigured() {
    return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
function getSupabase() {
    if (cached) return cached;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.");
    }
    cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });
    return cached;
}
function getSupabaseAnon() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error("SUPABASE_ANON_KEY not configured.");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key, {
        auth: {
            persistSession: false
        }
    });
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/auth/password.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hashPassword",
    ()=>hashPassword,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
async function verifyPassword(plain, hash) {
    if (hash.startsWith("mock$")) {
        return Buffer.from(plain).toString("base64") === hash.slice(5);
    }
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(plain, hash);
    } catch  {
        return false;
    }
}
async function hashPassword(plain) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(plain, 10);
}
}),
"[project]/src/lib/data/supabase-store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// SupabaseStore — production implementation of the Store interface.
// Talks directly to your Supabase project via the service_role key.
// Table names match schemas/supabase_v23_1.sql (snake_case).
__turbopack_context__.s([
    "SupabaseStore",
    ()=>SupabaseStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/password.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
;
function paginate(items, params) {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    return {
        items: items.slice(offset, offset + limit),
        total: items.length
    };
}
class SupabaseStore {
    sb() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabase"])();
    }
    /**
   * Smart upsert: uses INSERT when no id is provided, UPDATE when id exists.
   * This avoids issues with Supabase's upsert() and auto-generated UUIDs.
   */ async smartUpsert(table, data) {
        const payload = {
            ...data
        };
        if (data.id) {
            // UPDATE existing record
            const { id, ...fields } = payload;
            const { data: updated, error } = await this.sb().from(table).update(fields).eq("id", id).select().single();
            if (error) throw error;
            if (!updated) {
                // Row doesn't exist — fall back to insert
                const { data: inserted, error: insErr } = await this.sb().from(table).insert(payload).select().single();
                if (insErr) throw insErr;
                return inserted;
            }
            return updated;
        }
        // INSERT new record (database auto-generates id)
        const { data: inserted, error } = await this.sb().from(table).insert(payload).select().single();
        if (error) throw error;
        return inserted;
    }
    // ---- auth ----
    async getUserByUsername(username) {
        const { data, error } = await this.sb().from("users").select("*").eq("username", username).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async getUserById(id) {
        const { data, error } = await this.sb().from("users").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async listUsers(tenantId) {
        const { data, error } = await this.sb().from("users").select("*").eq("tenant_id", tenantId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async upsertUser(u) {
        // When id is provided, use UPDATE — avoids NOT NULL constraint violations
        // on columns like username/email that aren't in the partial payload.
        // Supabase upsert tries INSERT first, which fails on NOT NULL columns
        // before the ON CONFLICT clause can kick in.
        if (u.id) {
            const { id, ...fields } = u;
            const { data, error } = await this.sb().from("users").update(fields).eq("id", id).select().single();
            if (error) throw error;
            if (!data) {
                // Row doesn't exist yet — fall back to insert with full payload
                const { data: ins, error: insErr } = await this.sb().from("users").insert(u).select().single();
                if (insErr) throw insErr;
                return ins;
            }
            return data;
        }
        // No id — insert new user (database generates id via gen_random_uuid()::text)
        const payload = {
            ...u
        };
        const { data, error } = await this.sb().from("users").insert(payload).select().single();
        if (error) throw error;
        return data;
    }
    async deleteUser(id) {
        const { error } = await this.sb().from("users").delete().eq("id", id);
        if (error) throw error;
    }
    async updateUserLastLogin(id, ip) {
        const { error } = await this.sb().from("users").update({
            last_login_at: new Date().toISOString(),
            last_login_ip: ip
        }).eq("id", id);
        if (error) throw error;
    }
    async bumpUserTokenVersion(id) {
        // read-modify-write (Supabase JS doesn't support atomic increment on json/jsonb easily)
        const u = await this.getUserById(id);
        const next = (u?.token_version ?? 0) + 1;
        const { error } = await this.sb().from("users").update({
            token_version: next
        }).eq("id", id);
        if (error) throw error;
        return next;
    }
    // ---- partners ----
    async listPartners(tenantId, params) {
        let q = this.sb().from("partners").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,contact_name.ilike.%${params.search}%`);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        if (params?.filters?.type) q = q.eq("type", params.filters.type);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getPartner(id) {
        const { data, error } = await this.sb().from("partners").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertPartner(p) {
        return this.smartUpsert("partners", p);
    }
    async deletePartner(id) {
        const { error } = await this.sb().from("partners").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- products ----
    async listProducts(tenantId, params) {
        let q = this.sb().from("products").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%`);
        if (params?.filters?.category) q = q.eq("category", params.filters.category);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getProduct(id) {
        const { data, error } = await this.sb().from("products").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertProduct(p) {
        return this.smartUpsert("products", p);
    }
    async deleteProduct(id) {
        const { error } = await this.sb().from("products").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- deals ----
    async listDeals(tenantId, params) {
        let q = this.sb().from("deals").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.ilike("title", `%${params.search}%`);
        if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
        if (params?.filters?.stage) q = q.eq("stage", params.filters.stage);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getDeal(id) {
        const { data, error } = await this.sb().from("deals").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertDeal(d) {
        return this.smartUpsert("deals", d);
    }
    async deleteDeal(id) {
        const { error } = await this.sb().from("deals").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- offers ----
    async listOffers(tenantId, params) {
        let q = this.sb().from("offers").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`number.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
        if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getOffer(id) {
        const { data, error } = await this.sb().from("offers").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertOffer(o) {
        return this.smartUpsert("offers", o);
    }
    async deleteOffer(id) {
        const { error } = await this.sb().from("offers").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- demands ----
    async listDemands(tenantId, params) {
        let q = this.sb().from("demands").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`number.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
        if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getDemand(id) {
        const { data, error } = await this.sb().from("demands").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertDemand(d) {
        return this.smartUpsert("demands", d);
    }
    async deleteDemand(id) {
        const { error } = await this.sb().from("demands").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- documents ----
    async listDocuments(tenantId, params) {
        let q = this.sb().from("shared_documents").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.ilike("filename", `%${params.search}%`);
        if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getDocument(id) {
        const { data, error } = await this.sb().from("shared_documents").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertDocument(d) {
        return this.smartUpsert("shared_documents", d);
    }
    async deleteDocument(id) {
        const { error } = await this.sb().from("shared_documents").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- audit ----
    async listAudit(tenantId, params) {
        let q = this.sb().from("audit_logs").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`action.ilike.%${params.search}%,username.ilike.%${params.search}%`);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async appendAudit(entry) {
        const { data, error } = await this.sb().from("audit_logs").insert({
            ...entry
        }).select().single();
        if (error) throw error;
        return data;
    }
    // ---- settings ----
    async getSetting(key) {
        const { data, error } = await this.sb().from("settings").select("value").eq("key", key).maybeSingle();
        if (error) throw error;
        return data?.value ?? null;
    }
    async setSetting(key, value) {
        const { error } = await this.sb().from("settings").upsert({
            key,
            value,
            updated_at: new Date().toISOString()
        }, {
            onConflict: "key"
        });
        if (error) throw error;
    }
    async getAllSettings() {
        const { data, error } = await this.sb().from("settings").select("*");
        if (error) throw error;
        return data || [];
    }
    // ---- tasks ----
    async listTasks(tenantId, userId) {
        let q = this.sb().from("user_tasks").select("*").eq("tenant_id", tenantId);
        if (userId) q = q.eq("user_id", userId);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    }
    async upsertTask(t) {
        return this.smartUpsert("user_tasks", t);
    }
    async deleteTask(id) {
        const { error } = await this.sb().from("user_tasks").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- notes ----
    async listNotes(tenantId, entityType, entityId) {
        const { data, error } = await this.sb().from("entity_notes").select("*").eq("tenant_id", tenantId).eq("entity_type", entityType).eq("entity_id", entityId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async upsertNote(n) {
        return this.smartUpsert("entity_notes", n);
    }
    async deleteNote(id) {
        const { error } = await this.sb().from("entity_notes").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- inventory ----
    async listInventory(tenantId, partnerId) {
        const { data, error } = await this.sb().from("inventory_movements").select("*").eq("tenant_id", tenantId).eq("partner_id", partnerId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async addInventoryMovement(m) {
        const payload = {
            ...m
        };
        const { data, error } = await this.sb().from("inventory_movements").insert(payload).select().single();
        if (error) throw error;
        return data;
    }
    // ---- dashboard ----
    async getInsights(tenantId) {
        const sb = this.sb();
        const partnersQ = sb.from("partners").select("id, status");
        const dealsQ = sb.from("deals").select("id, stage, value, partner_id");
        const offersQ = sb.from("offers").select("id, status, created_at");
        const productsQ = sb.from("products").select("id, name, sku, stock, reorder_level");
        let auditQ = sb.from("audit_logs").select("*").order("created_at", {
            ascending: false
        }).limit(6);
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
            inventoryQ
        ]);
        const partners = partnersR.data || [];
        const deals = dealsR.data || [];
        const offers = offersR.data || [];
        const products = productsR.data || [];
        const recent = auditR.data || [];
        const invoices = invoicesR.data || [];
        const inventoryMovements = inventoryR.data || [];
        const openDeals = deals.filter((d)=>![
                "won",
                "lost"
            ].includes(d.stage));
        const wonValue = deals.filter((d)=>d.stage === "won").reduce((s, d)=>s + (d.value || 0), 0);
        const pipelineValue = openDeals.reduce((s, d)=>s + (d.value || 0), 0);
        const lowStockProducts = products.filter((p)=>(p.reorder_level || 0) > 0 && (p.stock || 0) <= (p.reorder_level || 0)).map((p)=>({
                id: p.id,
                name: p.name,
                sku: p.sku,
                stock: p.stock || 0,
                reorder_level: p.reorder_level || 0
            })).slice(0, 5);
        const lowStock = lowStockProducts.length;
        // outstanding invoices = sent or overdue
        const outstandingInvoices = invoices.filter((i)=>i.status === "sent" || i.status === "overdue").length;
        // inventory movements in the last 30 days
        const inv30 = inventoryMovements.filter((m)=>Date.now() - new Date(m.created_at).getTime() < 30 * 86400000).length;
        const stages = [
            "lead",
            "qualified",
            "proposal",
            "negotiation",
            "won",
            "lost"
        ];
        const byStage = stages.map((stage)=>({
                stage,
                count: deals.filter((d)=>d.stage === stage).length,
                value: deals.filter((d)=>d.stage === stage).reduce((s, d)=>s + (d.value || 0), 0)
            }));
        // top partners by deal value
        const partnerValue = new Map();
        deals.forEach((d)=>partnerValue.set(d.partner_id, (partnerValue.get(d.partner_id) || 0) + (d.value || 0)));
        const partnerNames = await Promise.all(Array.from(partnerValue.keys()).slice(0, 5).map(async (pid)=>{
            const p = await this.getPartner(pid);
            return {
                id: pid,
                name: p?.name || pid,
                deal_value: partnerValue.get(pid) || 0
            };
        }));
        const topPartners = partnerNames.sort((a, b)=>b.deal_value - a.deal_value).slice(0, 5);
        // offers last 14 days (best-effort from returned data)
        const offersLast30 = [];
        for(let i = 13; i >= 0; i--){
            const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
            offersLast30.push({
                date: d,
                count: offers.filter((o)=>(o.created_at || "").slice(0, 10) === d).length
            });
        }
        // revenue last 14 days (sum of invoice totals paid on that day)
        const revenueLast30 = [];
        for(let i = 13; i >= 0; i--){
            const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
            const value = invoices.filter((inv)=>inv.status === "paid" && (inv.paid_at || "").slice(0, 10) === d).reduce((s, inv)=>s + (inv.total || 0), 0);
            revenueLast30.push({
                date: d,
                value
            });
        }
        return {
            kpis: {
                partners_total: partners.length,
                partners_active: partners.filter((p)=>p.status === "active").length,
                deals_open: openDeals.length,
                deals_won_value: wonValue,
                pipeline_value: pipelineValue,
                offers_pending: offers.filter((o)=>o.status === "sent" || o.status === "draft").length,
                low_stock_count: lowStock,
                invoices_outstanding: outstandingInvoices,
                inventory_movements_30d: inv30
            },
            deals_by_stage: byStage,
            offers_last_30d: offersLast30,
            revenue_last_30d: revenueLast30,
            recent_activity: recent,
            top_partners: topPartners,
            low_stock_products: lowStockProducts
        };
    }
    // ---- invoices ----
    async listInvoices(tenantId, params) {
        let q = this.sb().from("invoices").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`number.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
        if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getInvoice(id) {
        const { data, error } = await this.sb().from("invoices").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertInvoice(i) {
        return this.smartUpsert("invoices", i);
    }
    async deleteInvoice(id) {
        const { error } = await this.sb().from("invoices").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- proformas ----
    async listProformas(tenantId, params) {
        let q = this.sb().from("proformas").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`number.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
        if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getProforma(id) {
        const { data, error } = await this.sb().from("proformas").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertProforma(p) {
        return this.smartUpsert("proformas", p);
    }
    async deleteProforma(id) {
        const { error } = await this.sb().from("proformas").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- document register ----
    async listDocumentRegister(tenantId, params) {
        let q = this.sb().from("document_register").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`number.ilike.%${params.search}%,title.ilike.%${params.search}%`);
        if (params?.filters?.type) q = q.eq("type", params.filters.type);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async upsertDocumentRegisterEntry(e) {
        return this.smartUpsert("document_register", e);
    }
    async listDocumentRevisions(tenantId, documentId) {
        const { data, error } = await this.sb().from("document_revisions").select("*").eq("tenant_id", tenantId).eq("document_id", documentId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async addDocumentRevision(r) {
        const payload = {
            ...r
        };
        if (r.id) payload.id = r.id;
        if (!payload.tenant_id && r.tenant_id) payload.tenant_id = r.tenant_id;
        const { data, error } = await this.sb().from("document_revisions").insert(payload).select().single();
        if (error) throw error;
        return data;
    }
    async deleteDocumentRegisterEntry(id) {
        const { error } = await this.sb().from("document_register").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- vault ----
    async listVault(tenantId, params) {
        let q = this.sb().from("vault_secrets").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`key.ilike.%${params.search}%,description.ilike.%${params.search}%`);
        if (params?.filters?.category) q = q.eq("category", params.filters.category);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async upsertVaultSecret(s) {
        return this.smartUpsert("vault_secrets", s);
    }
    async deleteVaultSecret(id) {
        const { error } = await this.sb().from("vault_secrets").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- api keys ----
    async listApiKeys(tenantId) {
        const { data, error } = await this.sb().from("api_keys").select("*").eq("tenant_id", tenantId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async upsertApiKey(k) {
        return this.smartUpsert("api_keys", k);
    }
    async deleteApiKey(id) {
        const { error } = await this.sb().from("api_keys").delete().eq("id", id);
        if (error) throw error;
    }
    async authenticateApiKey(rawKey) {
        if (!rawKey.startsWith("asp_")) return null;
        const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(rawKey).digest("hex");
        const prefix = rawKey.slice(0, 12);
        const { data, error } = await this.sb().from("api_keys").select("*").eq("key_prefix", prefix).eq("key_hash", hash).eq("active", true).maybeSingle();
        if (error) {
            console.error("[authenticateApiKey]", error);
            return null;
        }
        if (!data) return null;
        const key = data;
        // Check expiration
        if (key.expires_at && new Date(key.expires_at) < new Date()) return null;
        return {
            apiKey: key,
            tenantId: key.tenant_id
        };
    }
    async updateApiKeyLastUsed(id, ip) {
        await this.sb().from("api_keys").update({
            last_used_at: new Date().toISOString(),
            last_used_ip: ip
        }).eq("id", id);
    }
    // ---- webhooks ----
    async listWebhooks(tenantId) {
        const { data, error } = await this.sb().from("webhooks").select("*").eq("tenant_id", tenantId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async upsertWebhook(w) {
        return this.smartUpsert("webhooks", w);
    }
    async deleteWebhook(id) {
        const { error } = await this.sb().from("webhooks").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- security ----
    async listSessions(tenantId, userId) {
        let q = this.sb().from("sessions").select("*").eq("tenant_id", tenantId);
        if (userId) q = q.eq("user_id", userId);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    }
    async revokeSession(id) {
        const { error } = await this.sb().from("sessions").update({
            revoked: true
        }).eq("id", id);
        if (error) throw error;
    }
    async listLoginHistory(tenantId, userId, limit) {
        let q = this.sb().from("login_history").select("*").eq("tenant_id", tenantId);
        if (userId) q = q.eq("user_id", userId);
        q = q.order("created_at", {
            ascending: false
        });
        if (limit) q = q.limit(limit);
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    }
    async listKnownIps(tenantId, userId) {
        let q = this.sb().from("known_ips").select("*").eq("tenant_id", tenantId);
        if (userId) q = q.eq("user_id", userId);
        q = q.order("last_seen", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    }
    async trustIp(id, trusted) {
        const { error } = await this.sb().from("known_ips").update({
            trusted
        }).eq("id", id);
        if (error) throw error;
    }
    async forgetIp(id) {
        const { error } = await this.sb().from("known_ips").delete().eq("id", id);
        if (error) throw error;
    }
    async listTrustedDevices(tenantId, userId) {
        let q = this.sb().from("trusted_devices").select("*").eq("tenant_id", tenantId);
        if (userId) q = q.eq("user_id", userId);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    }
    async revokeTrustedDevice(id) {
        const { error } = await this.sb().from("trusted_devices").update({
            revoked: true
        }).eq("id", id);
        if (error) throw error;
    }
    // ---- mail queue ----
    async listMailQueue(tenantId, params) {
        let q = this.sb().from("mail_queue").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`subject.ilike.%${params.search}%,to_email.ilike.%${params.search}%`);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async upsertMailQueueEntry(m) {
        return this.smartUpsert("mail_queue", m);
    }
    async deleteMailQueueEntry(id) {
        const { error } = await this.sb().from("mail_queue").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- all inventory (global view) ----
    async listAllInventory(tenantId, params) {
        let q = this.sb().from("inventory_movements").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`reason.ilike.%${params.search}%,reference.ilike.%${params.search}%`);
        if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
        if (params?.filters?.product_id) q = q.eq("product_id", params.filters.product_id);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    // ---- tenants (multi-tenancy) ----
    async listTenants() {
        const { data, error } = await this.sb().from("tenants").select("*").order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async getTenant(id) {
        const { data, error } = await this.sb().from("tenants").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertTenant(t) {
        return this.smartUpsert("tenants", t);
    }
    async deleteTenant(id) {
        const { error } = await this.sb().from("tenants").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- product catalog ----
    async listProductCatalog(tenantId, params) {
        let q = this.sb().from("product_catalog").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`name.ilike.%${params.search}%,hs_code.ilike.%${params.search}%`);
        if (params?.filters?.category) q = q.eq("category", params.filters.category);
        if (params?.filters?.active !== undefined) q = q.eq("active", params.filters.active === "true");
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getProductCatalogEntry(id) {
        const { data, error } = await this.sb().from("product_catalog").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertProductCatalogEntry(p) {
        return this.smartUpsert("product_catalog", p);
    }
    async deleteProductCatalogEntry(id) {
        const { error } = await this.sb().from("product_catalog").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- supplier offers ----
    async listSupplierOffers(tenantId, params) {
        let q = this.sb().from("supplier_offers").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`offer_number.ilike.%${params.search}%,packaging.ilike.%${params.search}%`);
        if (params?.filters?.product_id) q = q.eq("product_id", params.filters.product_id);
        if (params?.filters?.supplier_id) q = q.eq("supplier_id", params.filters.supplier_id);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getSupplierOffer(id) {
        const { data, error } = await this.sb().from("supplier_offers").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertSupplierOffer(s) {
        return this.smartUpsert("supplier_offers", s);
    }
    async deleteSupplierOffer(id) {
        const { error } = await this.sb().from("supplier_offers").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- trade calculations ----
    async listTradeCalculations(tenantId, params) {
        let q = this.sb().from("trade_calculations").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.ilike("name", `%${params.search}%`);
        if (params?.filters?.product_id) q = q.eq("product_id", params.filters.product_id);
        if (params?.filters?.supplier_id) q = q.eq("supplier_id", params.filters.supplier_id);
        if (params?.filters?.buyer_id) q = q.eq("buyer_id", params.filters.buyer_id);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getTradeCalculation(id) {
        const { data, error } = await this.sb().from("trade_calculations").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertTradeCalculation(t) {
        return this.smartUpsert("trade_calculations", t);
    }
    async deleteTradeCalculation(id) {
        const { error } = await this.sb().from("trade_calculations").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- portal access ----
    async getPortalAccessByPartner(partnerId) {
        const { data, error } = await this.sb().from("portal_access").select("*").eq("partner_id", partnerId).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async getPortalAccessByEmail(tenantId, email) {
        const { data, error } = await this.sb().from("portal_access").select("*").eq("tenant_id", tenantId).eq("portal_email", email).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async getPortalAccessById(id) {
        const { data, error } = await this.sb().from("portal_access").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async listPortalAccess(tenantId) {
        const { data, error } = await this.sb().from("portal_access").select("*").eq("tenant_id", tenantId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async upsertPortalAccess(p) {
        const payload = {
            ...p
        };
        // Strip columns that may not exist in the database yet (added gracefully)
        const columnsThatMayNotExist = [
            "feature_flags",
            "onboarding_status",
            "portal_locked_until",
            "failed_login_attempts",
            "lockout_until",
            "notes",
            "failed_attempts",
            "locked_until",
            "token_version"
        ];
        for (const col of columnsThatMayNotExist){
            if (payload[col] === undefined) delete payload[col];
        }
        // When id is provided, use UPDATE — avoids NOT NULL constraint violations
        // on columns like partner_id that aren't in the partial payload.
        if (p.id) {
            const { id, ...fields } = payload;
            // Strip any undefined values to avoid overwriting with null
            const cleanFields = {};
            for (const [k, v] of Object.entries(fields)){
                if (v !== undefined) cleanFields[k] = v;
            }
            const { data, error } = await this.sb().from("portal_access").update(cleanFields).eq("id", id).select().single();
            if (error) throw error;
            if (!data) {
                // Row doesn't exist yet — fall back to insert with full payload
                const { data: ins, error: insErr } = await this.sb().from("portal_access").insert(payload).select().single();
                if (insErr) throw insErr;
                return ins;
            }
            return data;
        }
        // No id — insert new portal access
        const { data, error } = await this.sb().from("portal_access").insert(payload).select().single();
        if (error) throw error;
        return data;
    }
    async deletePortalAccess(id) {
        const { error } = await this.sb().from("portal_access").delete().eq("id", id);
        if (error) throw error;
    }
    async verifyPortalCredentials(tenantId, email, password) {
        const pa = await this.getPortalAccessByEmail(tenantId, email);
        if (!pa || !pa.password_hash) return null;
        if (pa.status !== "active") return null;
        const valid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyPassword"])(password, pa.password_hash);
        if (!valid) return null;
        return pa;
    }
    async verifyPortalCredentialsByEmail(email, password) {
        const { data, error } = await this.sb().from("portal_access").select("*").eq("portal_email", email).maybeSingle();
        if (error || !data) return null;
        const pa = data;
        if (!pa.password_hash || pa.status !== "active") return null;
        const valid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyPassword"])(password, pa.password_hash);
        return valid ? pa : null;
    }
    // ---- document templates ----
    async listDocumentTemplates(tenantId) {
        const { data, error } = await this.sb().from("document_templates").select("*").eq("tenant_id", tenantId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async getDocumentTemplate(id) {
        const { data, error } = await this.sb().from("document_templates").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async getDefaultDocumentTemplate(tenantId, type) {
        const { data, error } = await this.sb().from("document_templates").select("*").eq("tenant_id", tenantId).eq("type", type).eq("is_default", true).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertDocumentTemplate(t) {
        return this.smartUpsert("document_templates", t);
    }
    async deleteDocumentTemplate(id) {
        const { error } = await this.sb().from("document_templates").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- document verification ----
    async createDocumentVerification(v) {
        const payload = {
            ...v
        };
        const { data, error } = await this.sb().from("document_verifications").insert(payload).select().single();
        if (error) throw error;
        return data;
    }
    async getDocumentVerificationByCode(code) {
        try {
            const { data, error } = await this.sb().from("document_verifications").select("*").eq("verification_code", code).maybeSingle();
            if (error) {
                console.warn("[getDocumentVerificationByCode] Query failed:", error.message);
                return null;
            }
            return data || null;
        } catch (err) {
            console.warn("[getDocumentVerificationByCode] Unexpected error:", err);
            return null;
        }
    }
    async getDocumentVerificationByDoc(tenantId, docType, docId) {
        try {
            const { data, error } = await this.sb().from("document_verifications").select("*").eq("tenant_id", tenantId).eq("document_type", docType).eq("document_id", docId).maybeSingle();
            if (error) {
                console.warn("[getDocumentVerificationByDoc] Query failed:", error.message);
                return null;
            }
            return data || null;
        } catch (err) {
            console.warn("[getDocumentVerificationByDoc] Unexpected error:", err);
            return null;
        }
    }
    async logVerification(log) {
        try {
            const { data, error } = await this.sb().from("verification_logs").insert({
                ...log
            }).select().single();
            if (error) {
                // verification_logs table may not exist yet — fail gracefully
                console.warn("[logVerification] Could not write verification log:", error.message);
                return {
                    ...log,
                    id: "fallback",
                    verified_at: new Date().toISOString()
                };
            }
            return data;
        } catch (err) {
            // verification_logs table may not exist — fail gracefully
            console.warn("[logVerification] Unexpected error writing verification log:", err);
            return {
                ...log,
                id: "fallback",
                verified_at: new Date().toISOString()
            };
        }
    }
    async listVerificationLogs(verificationId) {
        try {
            const { data, error } = await this.sb().from("verification_logs").select("*").eq("verification_id", verificationId).order("verified_at", {
                ascending: false
            });
            if (error) {
                console.warn("[listVerificationLogs] Could not read verification logs:", error.message);
                return [];
            }
            return data || [];
        } catch (err) {
            console.warn("[listVerificationLogs] Unexpected error:", err);
            return [];
        }
    }
    // ---- KYC submissions ----
    async listKycSubmissions(tenantId, params) {
        let q = this.sb().from("kyc_submissions").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`legal_name.ilike.%${params.search}%,trade_name.ilike.%${params.search}%,contact_email.ilike.%${params.search}%`);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getKycSubmission(id) {
        const { data, error } = await this.sb().from("kyc_submissions").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async getKycSubmissionByPartner(partnerId) {
        const { data, error } = await this.sb().from("kyc_submissions").select("*").eq("partner_id", partnerId).order("created_at", {
            ascending: false
        }).limit(1);
        if (error) throw error;
        return (data || [])[0] || null;
    }
    async upsertKycSubmission(s) {
        return this.smartUpsert("kyc_submissions", s);
    }
    async deleteKycSubmission(id) {
        const { error } = await this.sb().from("kyc_submissions").delete().eq("id", id);
        if (error) throw error;
    }
    async addKycDocument(doc) {
        const { data, error } = await this.sb().from("kyc_documents").insert({
            ...doc
        }).select().single();
        if (error) throw error;
        return data;
    }
    async removeKycDocument(id) {
        const { error } = await this.sb().from("kyc_documents").delete().eq("id", id);
        if (error) throw error;
    }
    async approveKycAndTransfer(submissionId, reviewedBy) {
        // 1. Get the submission
        const sub = await this.getKycSubmission(submissionId);
        if (!sub) throw new Error("KYC submission not found");
        // 2. Update the submission status
        const { data: updatedSub, error: subErr } = await this.sb().from("kyc_submissions").update({
            status: "approved",
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
            auto_transferred: true,
            updated_at: new Date().toISOString()
        }).eq("id", submissionId).select().single();
        if (subErr) throw subErr;
        // 3. Transfer KYC data to the partner record
        const partnerUpdate = {
            kyc_status: "approved",
            kyc_reviewed_by: reviewedBy,
            kyc_reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
        const { data: updatedPartner, error: partnerErr } = await this.sb().from("partners").update(partnerUpdate).eq("id", sub.partner_id).select().single();
        if (partnerErr) throw partnerErr;
        return {
            submission: updatedSub,
            partner: updatedPartner
        };
    }
    // ---- portal RFQs ----
    async listPortalRfqs(tenantId, params) {
        let q = this.sb().from("portal_rfqs").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`number.ilike.%${params.search}%,product_name.ilike.%${params.search}%`);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        if (params?.filters?.partner_id) q = q.eq("partner_id", params.filters.partner_id);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async listPortalRfqsByPartner(partnerId) {
        const { data, error } = await this.sb().from("portal_rfqs").select("*").eq("partner_id", partnerId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async getPortalRfq(id) {
        const { data, error } = await this.sb().from("portal_rfqs").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertPortalRfq(r) {
        return this.smartUpsert("portal_rfqs", r);
    }
    async deletePortalRfq(id) {
        const { error } = await this.sb().from("portal_rfqs").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- feature flags ----
    async getFeatureFlags(tenantId) {
        const { data, error } = await this.sb().from("feature_flags").select("*").eq("tenant_id", tenantId).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertFeatureFlags(f) {
        const payload = {
            ...f
        };
        if (f.id) payload.id = f.id;
        const { data, error } = await this.sb().from("feature_flags").upsert(payload, {
            onConflict: "tenant_id"
        }).select().single();
        if (error) throw error;
        return data;
    }
    // ---- notifications ----
    async listNotifications(tenantId, userId, unreadOnly) {
        let q = this.sb().from("notifications").select("*").eq("tenant_id", tenantId);
        if (userId) q = q.eq("user_id", userId);
        if (unreadOnly) q = q.eq("read", false);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    }
    async listNotificationsByPartner(tenantId, partnerId) {
        let q = this.sb().from("notifications").select("*").eq("tenant_id", tenantId);
        q = q.or(`partner_id.eq.${partnerId},partner_id.is.null`);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    }
    async createNotification(n) {
        const { data, error } = await this.sb().from("notifications").insert({
            ...n,
            read: false
        }).select().single();
        if (error) throw error;
        return data;
    }
    async markNotificationRead(id) {
        const { error } = await this.sb().from("notifications").update({
            read: true,
            read_at: new Date().toISOString()
        }).eq("id", id);
        if (error) throw error;
    }
    async markAllNotificationsRead(tenantId, userId) {
        const { error } = await this.sb().from("notifications").update({
            read: true,
            read_at: new Date().toISOString()
        }).eq("tenant_id", tenantId).eq("user_id", userId).eq("read", false);
        if (error) throw error;
    }
    async deleteNotification(id) {
        const { error } = await this.sb().from("notifications").delete().eq("id", id);
        if (error) throw error;
    }
    async getUnreadCount(tenantId, userId) {
        const { count, error } = await this.sb().from("notifications").select("*", {
            count: "exact",
            head: true
        }).eq("tenant_id", tenantId).eq("user_id", userId).eq("read", false);
        if (error) throw error;
        return count ?? 0;
    }
    // ---- commission agents ----
    async listCommissionAgents(tenantId, params) {
        let q = this.sb().from("commission_agents").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.ilike("partner_id", `%${params.search}%`);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getCommissionAgent(id) {
        const { data, error } = await this.sb().from("commission_agents").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async getCommissionAgentByPartner(partnerId) {
        const { data, error } = await this.sb().from("commission_agents").select("*").eq("partner_id", partnerId).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertCommissionAgent(a) {
        return this.smartUpsert("commission_agents", a);
    }
    async deleteCommissionAgent(id) {
        const { error } = await this.sb().from("commission_agents").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- deal commissions ----
    async listDealCommissions(tenantId, params) {
        let q = this.sb().from("deal_commissions").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.ilike("deal_id", `%${params.search}%`);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async listDealCommissionsByDeal(dealId) {
        const { data, error } = await this.sb().from("deal_commissions").select("*").eq("deal_id", dealId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async listDealCommissionsByAgent(agentId) {
        const { data, error } = await this.sb().from("deal_commissions").select("*").eq("agent_id", agentId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async getDealCommission(id) {
        const { data, error } = await this.sb().from("deal_commissions").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertDealCommission(c) {
        return this.smartUpsert("deal_commissions", c);
    }
    async deleteDealCommission(id) {
        const { error } = await this.sb().from("deal_commissions").delete().eq("id", id);
        if (error) throw error;
    }
    async approveDealCommission(id, approvedBy) {
        const { data, error } = await this.sb().from("deal_commissions").update({
            status: "approved",
            approved_by: approvedBy,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).eq("id", id).select().single();
        if (error) throw error;
        return data;
    }
    async markDealCommissionPaid(id, payoutReference) {
        const update = {
            status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        if (payoutReference) update.payout_reference = payoutReference;
        const { data, error } = await this.sb().from("deal_commissions").update(update).eq("id", id).select().single();
        if (error) throw error;
        return data;
    }
    // ---- commission payouts ----
    async listCommissionPayouts(tenantId, params) {
        let q = this.sb().from("commission_payouts").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.ilike("agent_id", `%${params.search}%`);
        q = q.order("created_at", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getCommissionPayout(id) {
        const { data, error } = await this.sb().from("commission_payouts").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertCommissionPayout(p) {
        return this.smartUpsert("commission_payouts", p);
    }
    async deleteCommissionPayout(id) {
        const { error } = await this.sb().from("commission_payouts").delete().eq("id", id);
        if (error) throw error;
    }
    // ---- commission summaries ----
    async getCommissionSummaries(tenantId) {
        const agents = await this.listCommissionAgents(tenantId);
        const summaries = [];
        for (const agent of agents.items){
            if (!agent.active) continue;
            const commissions = await this.listDealCommissionsByAgent(agent.id);
            const partner = await this.getPartner(agent.partner_id);
            summaries.push({
                agent_id: agent.id,
                partner_id: agent.partner_id,
                partner_name: partner?.name || "Unknown",
                total_deals: commissions.length,
                total_commission: commissions.reduce((sum, c)=>sum + c.calculated_commission, 0),
                paid_commission: commissions.filter((c)=>c.status === "paid").reduce((sum, c)=>sum + c.calculated_commission, 0),
                pending_commission: commissions.filter((c)=>c.status === "pending" || c.status === "approved").reduce((sum, c)=>sum + c.calculated_commission, 0),
                currency: agent.commission_currency
            });
        }
        return summaries;
    }
    async calculateCommission(agentId, dealValue, dealProfit, dealQuantity, _dealUnit, _currency) {
        const agent = await this.getCommissionAgent(agentId);
        if (!agent) return 0;
        switch(agent.commission_type){
            case "profit_percent":
                return dealProfit * (agent.commission_rate / 100);
            case "revenue_percent":
                return dealValue * (agent.commission_rate / 100);
            case "fixed":
                return agent.commission_rate;
            case "per_unit":
                return agent.commission_per_unit * dealQuantity;
            case "custom":
                return agent.commission_rate;
            default:
                return 0;
        }
    }
    // ─── ERP Accounts ────────────────────────────────────────────────────────
    async listErpAccounts(tenantId, params) {
        let q = this.sb().from("erp_accounts").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`code.ilike.%${params.search}%,name.ilike.%${params.search}%`);
        if (params?.filters?.account_type) q = q.eq("account_type", params.filters.account_type);
        if (params?.filters?.is_active !== undefined) q = q.eq("is_active", params.filters.is_active);
        q = q.order("code", {
            ascending: true
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getErpAccount(id) {
        const { data, error } = await this.sb().from("erp_accounts").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertErpAccount(a) {
        const payload = {
            ...a
        };
        if (a.id) payload.id = a.id;
        const { data, error } = await this.sb().from("erp_accounts").upsert(payload, {
            onConflict: "tenant_id,code"
        }).select().single();
        if (error) throw error;
        return data;
    }
    async deleteErpAccount(id) {
        const { error } = await this.sb().from("erp_accounts").delete().eq("id", id);
        if (error) throw error;
    }
    // ─── Fiscal Periods ──────────────────────────────────────────────────────
    async listFiscalPeriods(tenantId, params) {
        let q = this.sb().from("fiscal_periods").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.ilike("name", `%${params.search}%`);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        if (params?.filters?.fiscal_year) q = q.eq("fiscal_year", params.filters.fiscal_year);
        q = q.order("start_date", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async getFiscalPeriod(id) {
        const { data, error } = await this.sb().from("fiscal_periods").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertFiscalPeriod(p) {
        return this.smartUpsert("fiscal_periods", p);
    }
    async closeFiscalPeriod(id, closedBy) {
        const { data, error } = await this.sb().from("fiscal_periods").update({
            status: "closed",
            closed_by: closedBy,
            closed_at: new Date().toISOString()
        }).eq("id", id).select().single();
        if (error) throw error;
        return data;
    }
    // ─── Journal Entries ─────────────────────────────────────────────────────
    async listErpJournalEntries(tenantId, params) {
        let q = this.sb().from("erp_journal_entries").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`entry_number.ilike.%${params.search}%,description.ilike.%${params.search}%`);
        if (params?.filters?.status) q = q.eq("status", params.filters.status);
        if (params?.filters?.reference_type) q = q.eq("reference_type", params.filters.reference_type);
        if (params?.filters?.reference_id) q = q.eq("reference_id", params.filters.reference_id);
        q = q.order("date", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        const entries = data || [];
        // Attach lines for each entry
        if (entries.length > 0) {
            const entryIds = entries.map((e)=>e.id);
            const { data: linesData, error: linesError } = await this.sb().from("erp_journal_lines").select("*").in("journal_entry_id", entryIds).order("line_number", {
                ascending: true
            });
            if (linesError) throw linesError;
            const lines = linesData || [];
            const linesByEntry = new Map();
            for (const l of lines){
                const arr = linesByEntry.get(l.journal_entry_id) || [];
                arr.push(l);
                linesByEntry.set(l.journal_entry_id, arr);
            }
            for (const e of entries){
                e.lines = linesByEntry.get(e.id) || [];
            }
        }
        return paginate(entries, params);
    }
    async getErpJournalEntry(id) {
        const { data, error } = await this.sb().from("erp_journal_entries").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        if (!data) return null;
        const entry = data;
        // Fetch lines
        const { data: linesData, error: linesError } = await this.sb().from("erp_journal_lines").select("*").eq("journal_entry_id", id).order("line_number", {
            ascending: true
        });
        if (linesError) throw linesError;
        entry.lines = linesData || [];
        return entry;
    }
    async upsertErpJournalEntry(e) {
        const { lines, ...entryFields } = e;
        // Compute debit/credit totals from lines if provided
        if (lines && lines.length > 0) {
            entryFields.debit_total = lines.reduce((sum, l)=>sum + (l.debit || 0), 0);
            entryFields.credit_total = lines.reduce((sum, l)=>sum + (l.credit || 0), 0);
        }
        const payload = {
            ...entryFields
        };
        if (e.id) payload.id = e.id;
        const { data, error } = await this.sb().from("erp_journal_entries").upsert(payload, {
            onConflict: "tenant_id,entry_number"
        }).select().single();
        if (error) throw error;
        const entry = data;
        // Handle lines: delete existing + insert new
        if (lines && lines.length > 0) {
            // Delete old lines for this entry
            await this.sb().from("erp_journal_lines").delete().eq("journal_entry_id", entry.id);
            // Insert new lines
            const linePayloads = lines.map((l, idx)=>{
                const { id: _lid, ...rest } = l;
                return {
                    ...rest,
                    journal_entry_id: entry.id,
                    line_number: l.line_number ?? idx + 1
                };
            });
            const { data: insertedLines, error: linesError } = await this.sb().from("erp_journal_lines").insert(linePayloads).select();
            if (linesError) throw linesError;
            entry.lines = insertedLines || [];
        } else {
            // Fetch existing lines
            const { data: existingLines } = await this.sb().from("erp_journal_lines").select("*").eq("journal_entry_id", entry.id).order("line_number", {
                ascending: true
            });
            entry.lines = existingLines || [];
        }
        return entry;
    }
    async postErpJournalEntry(id, postedBy) {
        const { data, error } = await this.sb().from("erp_journal_entries").update({
            status: "posted",
            posted_by: postedBy,
            posted_at: new Date().toISOString()
        }).eq("id", id).select().single();
        if (error) throw error;
        // Attach lines
        const { data: linesData } = await this.sb().from("erp_journal_lines").select("*").eq("journal_entry_id", id).order("line_number", {
            ascending: true
        });
        data.lines = linesData || [];
        return data;
    }
    async reverseErpJournalEntry(id, reversedBy) {
        // Fetch original entry
        const original = await this.getErpJournalEntry(id);
        if (!original) throw new Error("Journal entry not found");
        if (original.status === "reversed") throw new Error("Entry already reversed");
        // Fetch lines
        const { data: origLines } = await this.sb().from("erp_journal_lines").select("*").eq("journal_entry_id", id).order("line_number", {
            ascending: true
        });
        const lines = origLines || [];
        // Create reversal entry (swap debit/credit)
        const reversalNumber = `REV-${original.entry_number}`;
        const reversalPayload = {
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
            posted_at: new Date().toISOString()
        };
        const { data: revEntry, error: revError } = await this.sb().from("erp_journal_entries").insert(reversalPayload).select().single();
        if (revError) throw revError;
        const reversal = revEntry;
        // Insert reversed lines (swap debit/credit)
        if (lines.length > 0) {
            const revLines = lines.map((l, idx)=>({
                    journal_entry_id: reversal.id,
                    account_id: l.account_id,
                    line_number: idx + 1,
                    description: l.description,
                    debit: l.credit,
                    credit: l.debit,
                    currency: l.currency,
                    partner_id: l.partner_id,
                    cost_center_id: l.cost_center_id
                }));
            const { data: insertedLines } = await this.sb().from("erp_journal_lines").insert(revLines).select();
            reversal.lines = insertedLines || [];
        }
        // Mark original as reversed
        await this.sb().from("erp_journal_entries").update({
            status: "reversed"
        }).eq("id", id);
        return reversal;
    }
    async deleteErpJournalEntry(id) {
        // Lines cascade delete via FK
        const { error } = await this.sb().from("erp_journal_entries").delete().eq("id", id);
        if (error) throw error;
    }
    // ─── Cost Centers ────────────────────────────────────────────────────────
    async listErpCostCenters(tenantId, params) {
        let q = this.sb().from("erp_cost_centers").select("*").eq("tenant_id", tenantId);
        if (params?.search) q = q.or(`code.ilike.%${params.search}%,name.ilike.%${params.search}%`);
        if (params?.filters?.is_active !== undefined) q = q.eq("is_active", params.filters.is_active);
        q = q.order("code", {
            ascending: true
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async upsertErpCostCenter(c) {
        const payload = {
            ...c
        };
        if (c.id) payload.id = c.id;
        const { data, error } = await this.sb().from("erp_cost_centers").upsert(payload, {
            onConflict: "tenant_id,code"
        }).select().single();
        if (error) throw error;
        return data;
    }
    async deleteErpCostCenter(id) {
        const { error } = await this.sb().from("erp_cost_centers").delete().eq("id", id);
        if (error) throw error;
    }
    // ─── Bank Accounts ───────────────────────────────────────────────────────
    async listErpBankAccounts(tenantId) {
        const { data, error } = await this.sb().from("erp_bank_accounts").select("*").eq("tenant_id", tenantId).order("bank_name", {
            ascending: true
        });
        if (error) throw error;
        return data || [];
    }
    async upsertErpBankAccount(b) {
        return this.smartUpsert("erp_bank_accounts", b);
    }
    async deleteErpBankAccount(id) {
        const { error } = await this.sb().from("erp_bank_accounts").delete().eq("id", id);
        if (error) throw error;
    }
    // ─── Bank Transactions ──────────────────────────────────────────────────
    async listErpBankTransactions(tenantId, bankAccountId, params) {
        let q = this.sb().from("erp_bank_transactions").select("*").eq("tenant_id", tenantId);
        if (bankAccountId) q = q.eq("bank_account_id", bankAccountId);
        if (params?.search) q = q.or(`description.ilike.%${params.search}%,reference.ilike.%${params.search}%,counterparty.ilike.%${params.search}%`);
        if (params?.filters?.is_reconciled !== undefined) q = q.eq("is_reconciled", params.filters.is_reconciled);
        q = q.order("date", {
            ascending: false
        });
        const { data, error } = await q;
        if (error) throw error;
        return paginate(data || [], params);
    }
    async upsertErpBankTransaction(t) {
        const payload = {
            ...t
        };
        let txn;
        if (t.id) {
            const { id, ...fields } = payload;
            const { data, error } = await this.sb().from("erp_bank_transactions").update(fields).eq("id", id).select().single();
            if (error) throw error;
            if (!data) {
                const { data: inserted, error: insErr } = await this.sb().from("erp_bank_transactions").insert(payload).select().single();
                if (insErr) throw insErr;
                txn = inserted;
            } else {
                txn = data;
            }
        } else {
            const { data, error } = await this.sb().from("erp_bank_transactions").insert(payload).select().single();
            if (error) throw error;
            txn = data;
        }
        // Update bank account balance
        if (txn.bank_account_id) {
            const { data: ba } = await this.sb().from("erp_bank_accounts").select("balance").eq("id", txn.bank_account_id).maybeSingle();
            if (ba) {
                const adjustment = txn.transaction_type === "credit" ? txn.amount : -txn.amount;
                await this.sb().from("erp_bank_accounts").update({
                    balance: ba.balance + adjustment
                }).eq("id", txn.bank_account_id);
            }
        }
        return txn;
    }
    async reconcileBankTransaction(id, journalEntryId) {
        const { data, error } = await this.sb().from("erp_bank_transactions").update({
            is_reconciled: true,
            journal_entry_id: journalEntryId,
            reconciled_with: journalEntryId
        }).eq("id", id).select().single();
        if (error) throw error;
        return data;
    }
    // ─── ERP Settings (already implemented — kept as-is) ────────────────────
    async getErpSettings(tenantId) {
        const { data, error } = await this.sb().from("erp_settings").select("*").eq("tenant_id", tenantId).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertErpSettings(s) {
        const payload = {
            ...s
        };
        if (s.id) payload.id = s.id;
        const { data, error } = await this.sb().from("erp_settings").upsert(payload, {
            onConflict: "tenant_id"
        }).select().single();
        if (error) throw error;
        return data;
    }
    // ─── ERP Reports ────────────────────────────────────────────────────────
    async getTrialBalance(tenantId, asOfDate) {
        // Fetch all posted journal entries up to asOfDate
        const { data: entries, error: entriesError } = await this.sb().from("erp_journal_entries").select("id").eq("tenant_id", tenantId).eq("status", "posted").lte("date", asOfDate);
        if (entriesError) throw entriesError;
        const entryIds = (entries || []).map((e)=>e.id);
        if (entryIds.length === 0) return {
            items: [],
            total_debit: 0,
            total_credit: 0,
            as_of_date: asOfDate
        };
        // Fetch all lines for those entries
        const { data: lines, error: linesError } = await this.sb().from("erp_journal_lines").select("account_id, debit, credit").in("journal_entry_id", entryIds);
        if (linesError) throw linesError;
        // Fetch accounts for this tenant
        const { data: accounts, error: accountsError } = await this.sb().from("erp_accounts").select("id, code, name, account_type").eq("tenant_id", tenantId).eq("is_active", true);
        if (accountsError) throw accountsError;
        const accountMap = new Map();
        for (const a of accounts || []){
            accountMap.set(a.id, a);
        }
        // Aggregate by account
        const accTotals = new Map();
        for (const l of lines || []){
            const cur = accTotals.get(l.account_id) || {
                debit: 0,
                credit: 0
            };
            cur.debit += l.debit || 0;
            cur.credit += l.credit || 0;
            accTotals.set(l.account_id, cur);
        }
        const items = [];
        let totalDebit = 0;
        let totalCredit = 0;
        for (const [accountId, totals] of accTotals){
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
                balance
            });
            totalDebit += totals.debit;
            totalCredit += totals.credit;
        }
        items.sort((a, b)=>a.account_code.localeCompare(b.account_code));
        return {
            items,
            total_debit: totalDebit,
            total_credit: totalCredit,
            as_of_date: asOfDate
        };
    }
    async getBalanceSheet(tenantId, asOfDate) {
        // Get trial balance data
        const tb = await this.getTrialBalance(tenantId, asOfDate);
        const assets = [];
        const liabilities = [];
        const equity = [];
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        for (const item of tb.items){
            const bsItem = {
                account_code: item.account_code,
                account_name: item.account_name,
                amount: Math.abs(item.balance)
            };
            switch(item.account_type){
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
        return {
            assets,
            liabilities,
            equity,
            total_assets: totalAssets,
            total_liabilities: totalLiabilities,
            total_equity: totalEquity,
            as_of_date: asOfDate
        };
    }
    async getProfitAndLoss(tenantId, periodStart, periodEnd) {
        // Fetch posted journal entries in the period
        const { data: entries, error: entriesError } = await this.sb().from("erp_journal_entries").select("id").eq("tenant_id", tenantId).eq("status", "posted").gte("date", periodStart).lte("date", periodEnd);
        if (entriesError) throw entriesError;
        const entryIds = (entries || []).map((e)=>e.id);
        if (entryIds.length === 0) return {
            revenue: [],
            expenses: [],
            total_revenue: 0,
            total_expenses: 0,
            net_profit: 0,
            period_start: periodStart,
            period_end: periodEnd
        };
        // Fetch lines
        const { data: lines, error: linesError } = await this.sb().from("erp_journal_lines").select("account_id, debit, credit").in("journal_entry_id", entryIds);
        if (linesError) throw linesError;
        // Fetch revenue and expense accounts
        const { data: accounts, error: accountsError } = await this.sb().from("erp_accounts").select("id, code, name, account_type").eq("tenant_id", tenantId).in("account_type", [
            "revenue",
            "expense"
        ]).eq("is_active", true);
        if (accountsError) throw accountsError;
        const accountMap = new Map();
        for (const a of accounts || []){
            accountMap.set(a.id, a);
        }
        // Aggregate
        const accTotals = new Map();
        for (const l of lines || []){
            const cur = accTotals.get(l.account_id) || {
                debit: 0,
                credit: 0
            };
            cur.debit += l.debit || 0;
            cur.credit += l.credit || 0;
            accTotals.set(l.account_id, cur);
        }
        const revenue = [];
        const expenses = [];
        let totalRevenue = 0;
        let totalExpenses = 0;
        for (const [accountId, totals] of accTotals){
            const acc = accountMap.get(accountId);
            if (!acc) continue;
            const item = {
                account_code: acc.code,
                account_name: acc.name,
                amount: Math.abs(totals.credit - totals.debit)
            };
            if (acc.account_type === "revenue") {
                revenue.push(item);
                totalRevenue += totals.credit - totals.debit; // revenue: credit balance
            } else if (acc.account_type === "expense") {
                expenses.push(item);
                totalExpenses += totals.debit - totals.credit; // expense: debit balance
            }
        }
        return {
            revenue,
            expenses,
            total_revenue: totalRevenue,
            total_expenses: totalExpenses,
            net_profit: totalRevenue - totalExpenses,
            period_start: periodStart,
            period_end: periodEnd
        };
    }
    async getGeneralLedger(tenantId, accountId, dateFrom, dateTo) {
        // Get account info
        const account = await this.getErpAccount(accountId);
        const accountCode = account?.code || "";
        const accountName = account?.name || "";
        // Get all posted journal entries for this tenant
        let entryQuery = this.sb().from("erp_journal_entries").select("id, entry_number, date, description, reference_type, reference_id").eq("tenant_id", tenantId).eq("status", "posted");
        if (dateFrom) entryQuery = entryQuery.gte("date", dateFrom);
        if (dateTo) entryQuery = entryQuery.lte("date", dateTo);
        const { data: entries, error: entriesError } = await entryQuery.order("date", {
            ascending: true
        });
        if (entriesError) throw entriesError;
        const entryIds = (entries || []).map((e)=>e.id);
        if (entryIds.length === 0) {
            return {
                account_id: accountId,
                account_code: accountCode,
                account_name: accountName,
                entries: [],
                opening_balance: 0,
                closing_balance: 0,
                total_debit: 0,
                total_credit: 0
            };
        }
        // Get lines for this account across all matching entries
        const { data: lines, error: linesError } = await this.sb().from("erp_journal_lines").select("journal_entry_id, debit, credit").eq("account_id", accountId).in("journal_entry_id", entryIds);
        if (linesError) throw linesError;
        const linesByEntry = new Map();
        for (const l of lines || []){
            linesByEntry.set(l.journal_entry_id, {
                debit: l.debit,
                credit: l.credit
            });
        }
        // Compute opening balance (all posted lines before dateFrom)
        let openingBalance = 0;
        if (dateFrom) {
            const { data: preEntries } = await this.sb().from("erp_journal_entries").select("id").eq("tenant_id", tenantId).eq("status", "posted").lt("date", dateFrom);
            const preEntryIds = (preEntries || []).map((e)=>e.id);
            if (preEntryIds.length > 0) {
                const { data: preLines } = await this.sb().from("erp_journal_lines").select("debit, credit").eq("account_id", accountId).in("journal_entry_id", preEntryIds);
                for (const pl of preLines || []){
                    openingBalance += (pl.debit || 0) - (pl.credit || 0);
                }
            }
        }
        // Build entries list
        const glEntries = [];
        let runningBalance = openingBalance;
        let totalDebit = 0;
        let totalCredit = 0;
        for (const entry of entries || []){
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
                reference_id: entry.reference_id
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
            total_credit: totalCredit
        };
    }
    // ─── Auto-Journal ────────────────────────────────────────────────────────
    async autoJournalFromInvoice(invoiceId, tenantId, userId) {
        const invoice = await this.getInvoice(invoiceId);
        if (!invoice) return null;
        const settings = await this.getErpSettings(tenantId);
        const receivableAccountId = settings?.receivable_account_id;
        const revenueAccountId = settings?.revenue_account_id;
        if (!receivableAccountId || !revenueAccountId) return null;
        // Generate entry number
        const entryNumber = `INV-${invoice.number}-${Date.now()}`;
        const entry = {
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
            posted_at: settings.auto_post_journal ? new Date().toISOString() : null
        };
        const { data, error } = await this.sb().from("erp_journal_entries").insert(entry).select().single();
        if (error) throw error;
        const je = data;
        // Create lines: Debit AR, Credit Revenue
        const linePayloads = [
            {
                journal_entry_id: je.id,
                account_id: receivableAccountId,
                line_number: 1,
                description: `AR for invoice ${invoice.number}`,
                debit: invoice.total,
                credit: 0,
                currency: invoice.currency,
                partner_id: invoice.partner_id
            },
            {
                journal_entry_id: je.id,
                account_id: revenueAccountId,
                line_number: 2,
                description: `Revenue for invoice ${invoice.number}`,
                debit: 0,
                credit: invoice.total,
                currency: invoice.currency,
                partner_id: invoice.partner_id
            }
        ];
        const { data: insertedLines, error: linesError } = await this.sb().from("erp_journal_lines").insert(linePayloads).select();
        if (linesError) throw linesError;
        je.lines = insertedLines || [];
        return je;
    }
    async autoJournalFromDeal(dealId, tenantId, userId) {
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
        const entry = {
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
            posted_at: settings?.auto_post_journal ? new Date().toISOString() : null
        };
        const { data, error } = await this.sb().from("erp_journal_entries").insert(entry).select().single();
        if (error) throw error;
        const je = data;
        const linePayloads = [
            {
                journal_entry_id: je.id,
                account_id: receivableAccountId,
                line_number: 1,
                description: `AR for deal ${deal.title}`,
                debit: deal.value,
                credit: 0,
                currency: deal.currency,
                partner_id: deal.partner_id
            },
            {
                journal_entry_id: je.id,
                account_id: revenueAccountId,
                line_number: 2,
                description: `Revenue for deal ${deal.title}`,
                debit: 0,
                credit: deal.value,
                currency: deal.currency,
                partner_id: deal.partner_id
            }
        ];
        // Add COGS line if deal has buy_cost and expense account configured
        if (deal.buy_cost > 0 && expenseAccountId) {
            const payableAccountId = settings?.payable_account_id || expenseAccountId;
            linePayloads.push({
                journal_entry_id: je.id,
                account_id: expenseAccountId,
                line_number: 3,
                description: `COGS for deal ${deal.title}`,
                debit: deal.buy_cost,
                credit: 0,
                currency: deal.currency,
                partner_id: deal.partner_id
            }, {
                journal_entry_id: je.id,
                account_id: payableAccountId,
                line_number: 4,
                description: `AP for deal ${deal.title} cost`,
                debit: 0,
                credit: deal.buy_cost,
                currency: deal.currency,
                partner_id: deal.partner_id
            });
            // Adjust totals
            je.debit_total += deal.buy_cost;
            je.credit_total += deal.buy_cost;
            await this.sb().from("erp_journal_entries").update({
                debit_total: je.debit_total,
                credit_total: je.credit_total
            }).eq("id", je.id);
        }
        const { data: insertedLines, error: linesError } = await this.sb().from("erp_journal_lines").insert(linePayloads).select();
        if (linesError) throw linesError;
        je.lines = insertedLines || [];
        return je;
    }
    async autoJournalFromCommission(commissionId, tenantId, userId) {
        const commission = await this.getDealCommission(commissionId);
        if (!commission) return null;
        const settings = await this.getErpSettings(tenantId);
        const expenseAccountId = settings?.expense_account_id;
        const payableAccountId = settings?.payable_account_id;
        if (!expenseAccountId || !payableAccountId) return null;
        const entryNumber = `COMM-${commissionId.slice(0, 8)}-${Date.now()}`;
        const amount = commission.calculated_commission;
        const entry = {
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
            posted_at: settings?.auto_post_journal ? new Date().toISOString() : null
        };
        const { data, error } = await this.sb().from("erp_journal_entries").insert(entry).select().single();
        if (error) throw error;
        const je = data;
        const linePayloads = [
            {
                journal_entry_id: je.id,
                account_id: expenseAccountId,
                line_number: 1,
                description: `Commission expense`,
                debit: amount,
                credit: 0,
                currency: commission.commission_currency,
                partner_id: commission.partner_id
            },
            {
                journal_entry_id: je.id,
                account_id: payableAccountId,
                line_number: 2,
                description: `Commission payable`,
                debit: 0,
                credit: amount,
                currency: commission.commission_currency,
                partner_id: commission.partner_id
            }
        ];
        const { data: insertedLines, error: linesError } = await this.sb().from("erp_journal_lines").insert(linePayloads).select();
        if (linesError) throw linesError;
        je.lines = insertedLines || [];
        return je;
    }
    // ---- user preferences ----
    async getUserPreference(userId, key) {
        const { data, error } = await this.sb().from("user_preferences").select("*").eq("user_id", userId).eq("preference_key", key).maybeSingle();
        if (error) throw error;
        return data;
    }
    async setUserPreference(userId, key, value) {
        const { data, error } = await this.sb().from("user_preferences").upsert({
            user_id: userId,
            preference_key: key,
            preference_value: typeof value === "string" ? value : JSON.stringify(value),
            updated_at: new Date().toISOString()
        }, {
            onConflict: "user_id,preference_key"
        }).select().single();
        if (error) throw error;
        return data;
    }
    async listUserPreferences(userId) {
        const { data, error } = await this.sb().from("user_preferences").select("*").eq("user_id", userId).order("preference_key");
        if (error) throw error;
        return data || [];
    }
    // ─── Security (write methods) ───────────────────────────────────────────
    async createSession(s) {
        // Resolve tenant_id from user
        const user = await this.getUserById(s.user_id);
        const payload = {
            user_id: s.user_id,
            tenant_id: user?.tenant_id || null,
            ip: s.ip ?? null,
            user_agent: s.user_agent ?? null,
            country: s.country ?? null,
            expires_at: s.expires_at,
            current: s.current ?? false,
            revoked: false,
            last_used_at: new Date().toISOString()
        };
        const { data, error } = await this.sb().from("sessions").insert(payload).select().single();
        if (error) throw error;
        return data;
    }
    async revokeSessionById(id) {
        const { error } = await this.sb().from("sessions").update({
            revoked: true,
            current: false
        }).eq("id", id);
        if (error) throw error;
    }
    async touchSession(id) {
        try {
            await this.sb().from("sessions").update({
                last_used_at: new Date().toISOString()
            }).eq("id", id);
        } catch  {}
    }
    async recordLoginHistory(e) {
        const user = e.user_id ? await this.getUserById(e.user_id) : null;
        const payload = {
            user_id: e.user_id || null,
            tenant_id: user?.tenant_id || null,
            username: e.username,
            ip: e.ip ?? null,
            user_agent: e.user_agent ?? null,
            country: e.country ?? null,
            success: e.success,
            reason: e.reason ?? null
        };
        const { data, error } = await this.sb().from("login_history").insert(payload).select().single();
        if (error) throw error;
        return data;
    }
    async upsertKnownIp(ip) {
        const user = await this.getUserById(ip.user_id);
        // Find existing
        const { data: existing } = await this.sb().from("known_ips").select("*").eq("user_id", ip.user_id).eq("ip", ip.ip).maybeSingle();
        if (existing) {
            const { data, error } = await this.sb().from("known_ips").update({
                last_seen: new Date().toISOString(),
                country: ip.country ?? existing.country,
                trusted: ip.trusted ?? existing.trusted
            }).eq("id", existing.id).select().single();
            if (error) throw error;
            return data;
        }
        const payload = {
            user_id: ip.user_id,
            tenant_id: user?.tenant_id || null,
            ip: ip.ip,
            country: ip.country ?? null,
            trusted: ip.trusted ?? false
        };
        const { data, error } = await this.sb().from("known_ips").insert(payload).select().single();
        if (error) throw error;
        return data;
    }
    async upsertTrustedDevice(d) {
        const user = await this.getUserById(d.user_id);
        const { data: existing } = await this.sb().from("trusted_devices").select("*").eq("user_id", d.user_id).eq("fingerprint", d.fingerprint).maybeSingle();
        if (existing) {
            const { data, error } = await this.sb().from("trusted_devices").update({
                last_used: new Date().toISOString(),
                ip: d.ip ?? existing.ip,
                device_name: d.device_name || existing.device_name
            }).eq("id", existing.id).select().single();
            if (error) throw error;
            return data;
        }
        const payload = {
            user_id: d.user_id,
            tenant_id: user?.tenant_id || null,
            device_name: d.device_name,
            fingerprint: d.fingerprint,
            ip: d.ip ?? null
        };
        const { data, error } = await this.sb().from("trusted_devices").insert(payload).select().single();
        if (error) throw error;
        return data;
    }
    async revokeTrustedDeviceById(id) {
        const { error } = await this.sb().from("trusted_devices").update({
            revoked: true
        }).eq("id", id);
        if (error) throw error;
    }
    // ─── Tenant Letterheads (Memorandum firme) ──────────────────────────────
    async listLetterheads(tenantId) {
        const { data, error } = await this.sb().from("tenant_letterheads").select("*").eq("tenant_id", tenantId).order("is_default", {
            ascending: false
        }).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async getLetterhead(id) {
        const { data, error } = await this.sb().from("tenant_letterheads").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async getDefaultLetterhead(tenantId) {
        const { data, error } = await this.sb().from("tenant_letterheads").select("*").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertLetterhead(l) {
        // If setting as default, unset other defaults
        if (l.is_default) {
            await this.sb().from("tenant_letterheads").update({
                is_default: false
            }).eq("tenant_id", l.tenant_id).eq("is_default", true).neq("id", l.id || "00000000-0000-0000-0000-000000000000");
        }
        return this.smartUpsert("tenant_letterheads", l);
    }
    async deleteLetterhead(id) {
        // Unlink templates referencing this letterhead
        await this.sb().from("document_templates").update({
            letterhead_id: null
        }).eq("letterhead_id", id);
        const { error } = await this.sb().from("tenant_letterheads").delete().eq("id", id);
        if (error) throw error;
    }
    // ─── Tenant Seals (Zigled) ──────────────────────────────────────────────
    async listSeals(tenantId) {
        const { data, error } = await this.sb().from("tenant_seals").select("*").eq("tenant_id", tenantId).order("is_default", {
            ascending: false
        }).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    }
    async getSeal(id) {
        const { data, error } = await this.sb().from("tenant_seals").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async getDefaultSeal(tenantId) {
        const { data, error } = await this.sb().from("tenant_seals").select("*").eq("tenant_id", tenantId).eq("is_default", true).maybeSingle();
        if (error) throw error;
        return data || null;
    }
    async upsertSeal(s) {
        if (s.is_default) {
            await this.sb().from("tenant_seals").update({
                is_default: false
            }).eq("tenant_id", s.tenant_id).eq("is_default", true).neq("id", s.id || "00000000-0000-0000-0000-000000000000");
        }
        return this.smartUpsert("tenant_seals", s);
    }
    async deleteSeal(id) {
        await this.sb().from("document_templates").update({
            seal_id: null
        }).eq("seal_id", id);
        const { error } = await this.sb().from("tenant_seals").delete().eq("id", id);
        if (error) throw error;
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ce10f26e._.js.map
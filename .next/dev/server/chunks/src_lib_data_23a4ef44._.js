module.exports = [
"[project]/src/lib/data/mock.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// mock.ts — emptied for production. No demo data.
// All data comes from Supabase in production.
__turbopack_context__.s([
    "apiKeys",
    ()=>apiKeys,
    "auditLogs",
    ()=>auditLogs,
    "commissionAgents",
    ()=>commissionAgents,
    "commissionPayouts",
    ()=>commissionPayouts,
    "computeInsights",
    ()=>computeInsights,
    "dealCommissions",
    ()=>dealCommissions,
    "deals",
    ()=>deals,
    "demands",
    ()=>demands,
    "documentRegister",
    ()=>documentRegister,
    "documentRevisions",
    ()=>documentRevisions,
    "documentTemplates",
    ()=>documentTemplates,
    "documentVerifications",
    ()=>documentVerifications,
    "documents",
    ()=>documents,
    "featureFlags",
    ()=>featureFlags,
    "getInsights",
    ()=>getInsights,
    "inventoryMovements",
    ()=>inventoryMovements,
    "invoices",
    ()=>invoices,
    "knownIps",
    ()=>knownIps,
    "kycSubmissions",
    ()=>kycSubmissions,
    "loginHistory",
    ()=>loginHistory,
    "mailQueue",
    ()=>mailQueue,
    "mockHash",
    ()=>mockHash,
    "mockVerify",
    ()=>mockVerify,
    "nid",
    ()=>nid,
    "notes",
    ()=>notes,
    "notifications",
    ()=>notifications,
    "offers",
    ()=>offers,
    "partners",
    ()=>partners,
    "portalAccess",
    ()=>portalAccess,
    "portalRfqs",
    ()=>portalRfqs,
    "productCatalog",
    ()=>productCatalog,
    "products",
    ()=>products,
    "proformas",
    ()=>proformas,
    "securitySessions",
    ()=>securitySessions,
    "settings",
    ()=>settings,
    "supplierOffers",
    ()=>supplierOffers,
    "tasks",
    ()=>tasks,
    "tenants",
    ()=>tenants,
    "tradeCalculations",
    ()=>tradeCalculations,
    "trustedDevices",
    ()=>trustedDevices,
    "users",
    ()=>users,
    "vaultSecrets",
    ()=>vaultSecrets,
    "webhooks",
    ()=>webhooks
]);
function nid(prefix = "") {
    return `${prefix}${Date.now().toString(36)}`;
}
function mockHash(pw) {
    return `mock$${Buffer.from(pw).toString("base64")}`;
}
function mockVerify(pw, hash) {
    return mockHash(pw) === hash;
}
const users = [];
const partners = [];
const products = [];
const deals = [];
const offers = [];
const demands = [];
const documents = [];
const auditLogs = [];
const settings = [];
const tasks = [];
const inventoryMovements = [];
const notes = [];
const tenants = [];
const invoices = [];
const proformas = [];
const documentRegister = [];
const documentRevisions = [];
const vaultSecrets = [];
const apiKeys = [];
const webhooks = [];
const securitySessions = [];
const loginHistory = [];
const knownIps = [];
const trustedDevices = [];
const mailQueue = [];
const productCatalog = [];
const supplierOffers = [];
const tradeCalculations = [];
const portalAccess = [];
const documentTemplates = [];
const documentVerifications = [];
const kycSubmissions = [];
const portalRfqs = [];
const featureFlags = [];
const notifications = [];
const commissionAgents = [];
const dealCommissions = [];
const commissionPayouts = [];
function computeInsights() {
    return {
        kpis: {
            partners_total: 0,
            partners_active: 0,
            deals_open: 0,
            deals_won_value: 0,
            pipeline_value: 0,
            offers_pending: 0,
            low_stock_count: 0,
            invoices_outstanding: 0,
            inventory_movements_30d: 0
        },
        deals_by_stage: [],
        offers_last_30d: [],
        revenue_last_30d: [],
        recent_activity: [],
        top_partners: [],
        low_stock_products: []
    };
}
const getInsights = computeInsights;
}),
"[project]/src/lib/data/mock-store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// MockStore — implements the Store interface over the in-memory seed data.
// Mutations persist for the lifetime of the process (fine for dev/demo).
// NOTE: This store is used only when DB_BACKEND=mock (testing only).
// Production uses SupabaseStore. Type errors are suppressed because the
// mock seed data has drifted from the multi-tenant types in supabase/types.ts.
// @ts-nocheck
__turbopack_context__.s([
    "MockStore",
    ()=>MockStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/mock.ts [app-route] (ecmascript)");
;
function matchesSearch(haystack, needle) {
    if (!needle) return true;
    return haystack.toLowerCase().includes(needle.toLowerCase());
}
function paginate(items, params) {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    return {
        items: items.slice(offset, offset + limit),
        total: items.length
    };
}
class MockStore {
    // ---- ERP in-memory maps ----
    erpAccounts = new Map();
    fiscalPeriods = new Map();
    erpJournalEntries = new Map();
    erpJournalLines = new Map();
    erpCostCenters = new Map();
    erpBankAccounts = new Map();
    erpBankTransactions = new Map();
    erpSettings = new Map();
    journalEntryCounter = 0;
    // ---- auth ----
    async getUserByUsername(username) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"].find((u)=>u.username === username) || null;
    }
    async getUserById(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"].find((u)=>u.id === id) || null;
    }
    async listUsers(_tenantId) {
        return [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"]
        ];
    }
    async upsertUser(u) {
        const existing = u.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"].find((x)=>x.id === u.id) : null;
        if (existing) {
            Object.assign(existing, u, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newUser = {
            id: u.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("u_"),
            tenant_id: u.tenant_id || null,
            username: u.username || "",
            email: u.email || "",
            full_name: u.full_name || null,
            role: u.role || "staff",
            permissions: u.permissions || null,
            password_hash: u.password_hash || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockHash"]("password"),
            totp_secret: u.totp_secret || null,
            totp_enabled: u.totp_enabled ?? false,
            locked_until: u.locked_until || null,
            failed_attempts: u.failed_attempts ?? 0,
            last_login_at: u.last_login_at || null,
            last_login_ip: u.last_login_ip || null,
            last_login_country: u.last_login_country || null,
            must_change_password: u.must_change_password ?? false,
            token_version: u.token_version ?? 1,
            signature: u.signature || null,
            notif_prefs: u.notif_prefs || null,
            active: u.active ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"].push(newUser);
        return newUser;
    }
    async deleteUser(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"].findIndex((u)=>u.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"].splice(idx, 1);
    }
    async updateUserLastLogin(id, ip) {
        const u = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"].find((x)=>x.id === id);
        if (u) {
            u.last_login_at = new Date().toISOString();
            u.last_login_ip = ip;
        }
    }
    async bumpUserTokenVersion(id) {
        const u = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"].find((x)=>x.id === id);
        if (u) {
            u.token_version += 1;
            return u.token_version;
        }
        return 1;
    }
    // ---- partners ----
    async listPartners(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partners"]
        ];
        if (params?.search) {
            items = items.filter((p)=>matchesSearch(`${p.name} ${p.email || ""} ${p.contact_name || ""}`, params.search));
        }
        if (params?.filters?.status) items = items.filter((p)=>p.status === params.filters.status);
        if (params?.filters?.type) items = items.filter((p)=>p.type === params.filters.type);
        return paginate(items, params);
    }
    async getPartner(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partners"].find((p)=>p.id === id) || null;
    }
    async upsertPartner(p) {
        const existing = p.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partners"].find((x)=>x.id === p.id) : null;
        if (existing) {
            Object.assign(existing, p, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newP = {
            id: p.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("p_"),
            tenant_id: p.tenant_id || "",
            name: p.name || "New Partner",
            entity_type: p.entity_type || "company",
            type: p.type || "buyer",
            email: p.email || null,
            phone: p.phone || null,
            website: p.website || null,
            tax_id: p.tax_id || null,
            address_line: p.address_line || null,
            city: p.city || null,
            state: p.state || null,
            postal_code: p.postal_code || null,
            country: p.country || null,
            contact_name: p.contact_name || null,
            contact_email: p.contact_email || null,
            contact_phone: p.contact_phone || null,
            bank_name: p.bank_name || null,
            bank_account: p.bank_account || null,
            bank_swift: p.bank_swift || null,
            status: p.status || "active",
            risk_score: p.risk_score ?? 0,
            notes: p.notes || null,
            tags: p.tags || null,
            portal_enabled: p.portal_enabled ?? false,
            portal_token: p.portal_token || null,
            portal_level: p.portal_level || "none",
            kyc_status: p.kyc_status || "not_submitted",
            kyc_data: p.kyc_data || null,
            kyc_reviewed_by: p.kyc_reviewed_by || null,
            kyc_reviewed_at: p.kyc_reviewed_at || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partners"].push(newP);
        return newP;
    }
    async deletePartner(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partners"].findIndex((p)=>p.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partners"].splice(idx, 1);
    }
    // ---- products ----
    async listProducts(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["products"]
        ];
        if (params?.search) {
            items = items.filter((p)=>matchesSearch(`${p.name} ${p.sku} ${p.category || ""}`, params.search));
        }
        if (params?.filters?.category) items = items.filter((p)=>p.category === params.filters.category);
        return paginate(items, params);
    }
    async getProduct(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["products"].find((p)=>p.id === id) || null;
    }
    async upsertProduct(p) {
        const existing = p.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["products"].find((x)=>x.id === p.id) : null;
        if (existing) {
            Object.assign(existing, p, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newP = {
            id: p.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("pr_"),
            sku: p.sku || "",
            name: p.name || "",
            description: p.description || null,
            category: p.category || null,
            unit: p.unit || "kom",
            price: p.price ?? 0,
            currency: p.currency || "USD",
            cost: p.cost ?? null,
            stock: p.stock ?? 0,
            reorder_level: p.reorder_level ?? 0,
            active: p.active ?? true,
            attributes: p.attributes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["products"].push(newP);
        return newP;
    }
    async deleteProduct(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["products"].findIndex((p)=>p.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["products"].splice(idx, 1);
    }
    // ---- deals ----
    async listDeals(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deals"]
        ];
        if (params?.search) items = items.filter((d)=>matchesSearch(d.title, params.search));
        if (params?.filters?.partner_id) items = items.filter((d)=>d.partner_id === params.filters.partner_id);
        if (params?.filters?.stage) items = items.filter((d)=>d.stage === params.filters.stage);
        return paginate(items, params);
    }
    async getDeal(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deals"].find((d)=>d.id === id) || null;
    }
    async upsertDeal(d) {
        const existing = d.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deals"].find((x)=>x.id === d.id) : null;
        if (existing) {
            Object.assign(existing, d, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newD = {
            id: d.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("d_"),
            title: d.title || "New Deal",
            partner_id: d.partner_id || "",
            owner_id: d.owner_id || null,
            stage: d.stage || "lead",
            value: d.value ?? 0,
            currency: d.currency || "USD",
            expected_close: d.expected_close || null,
            probability: d.probability ?? 0,
            description: d.description || null,
            lost_reason: d.lost_reason || null,
            commission_agent_id: d.commission_agent_id ?? null,
            buy_cost: d.buy_cost ?? 0,
            quantity: d.quantity ?? 0,
            unit: d.unit || "pcs",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deals"].push(newD);
        return newD;
    }
    async deleteDeal(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deals"].findIndex((d)=>d.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deals"].splice(idx, 1);
    }
    // ---- offers ----
    async listOffers(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["offers"]
        ];
        if (params?.search) items = items.filter((o)=>matchesSearch(`${o.number} ${o.subject}`, params.search));
        if (params?.filters?.partner_id) items = items.filter((o)=>o.partner_id === params.filters.partner_id);
        if (params?.filters?.status) items = items.filter((o)=>o.status === params.filters.status);
        return paginate(items, params);
    }
    async getOffer(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["offers"].find((o)=>o.id === id) || null;
    }
    async upsertOffer(o) {
        const existing = o.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["offers"].find((x)=>x.id === o.id) : null;
        if (existing) {
            Object.assign(existing, o, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const num = `OF-2026-${String(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["offers"].length + 1).padStart(3, "0")}`;
        const newO = {
            id: o.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("o_"),
            number: o.number || num,
            deal_id: o.deal_id || null,
            partner_id: o.partner_id || "",
            owner_id: o.owner_id || null,
            status: o.status || "draft",
            subject: o.subject || "Nova ponuda",
            currency: o.currency || "USD",
            subtotal: o.subtotal ?? 0,
            discount_total: o.discount_total ?? 0,
            tax_total: o.tax_total ?? 0,
            total: o.total ?? 0,
            notes: o.notes || null,
            terms: o.terms || null,
            valid_until: o.valid_until || null,
            sent_at: o.sent_at || null,
            responded_at: o.responded_at || null,
            items: o.items || [],
            // Trade / import fields
            offer_no: o.offer_no || null,
            bank_details: o.bank_details || null,
            pol: o.pol || null,
            pod: o.pod || null,
            vessel: o.vessel || null,
            container_no: o.container_no || null,
            lead_time: o.lead_time || null,
            packaging: o.packaging || null,
            payment_terms: o.payment_terms || null,
            tax_clause: o.tax_clause || null,
            incoterm: o.incoterm || null,
            selling_price: o.selling_price ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["offers"].push(newO);
        return newO;
    }
    async deleteOffer(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["offers"].findIndex((o)=>o.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["offers"].splice(idx, 1);
    }
    // ---- demands ----
    async listDemands(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demands"]
        ];
        if (params?.search) items = items.filter((d)=>matchesSearch(`${d.number} ${d.subject}`, params.search));
        if (params?.filters?.partner_id) items = items.filter((d)=>d.partner_id === params.filters.partner_id);
        if (params?.filters?.status) items = items.filter((d)=>d.status === params.filters.status);
        return paginate(items, params);
    }
    async getDemand(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demands"].find((d)=>d.id === id) || null;
    }
    async upsertDemand(d) {
        const existing = d.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demands"].find((x)=>x.id === d.id) : null;
        if (existing) {
            Object.assign(existing, d, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const num = `RFQ-2026-${String(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demands"].length + 1).padStart(3, "0")}`;
        const newD = {
            id: d.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("dm_"),
            number: d.number || num,
            partner_id: d.partner_id || "",
            status: d.status || "open",
            priority: d.priority || "medium",
            subject: d.subject || "Nova potražnja",
            description: d.description || null,
            requested_delivery: d.requested_delivery || null,
            currency: d.currency || "EUR",
            items: d.items || [],
            // Trade / import fields
            product_id: d.product_id || null,
            product_name: d.product_name || null,
            target_price: d.target_price ?? null,
            is_new_product: d.is_new_product ?? false,
            source: d.source || null,
            auto_hints: d.auto_hints || null,
            buyer_bank: d.buyer_bank || null,
            destination: d.destination || null,
            needed_by: d.needed_by || null,
            payment_terms: d.payment_terms || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demands"].push(newD);
        return newD;
    }
    async deleteDemand(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demands"].findIndex((d)=>d.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demands"].splice(idx, 1);
    }
    // ---- documents ----
    async listDocuments(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documents"]
        ];
        if (params?.search) items = items.filter((d)=>matchesSearch(d.filename, params.search));
        if (params?.filters?.partner_id) items = items.filter((d)=>d.partner_id === params.filters.partner_id);
        return paginate(items, params);
    }
    async getDocument(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documents"].find((d)=>d.id === id) || null;
    }
    async upsertDocument(d) {
        const existing = d.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documents"].find((x)=>x.id === d.id) : null;
        if (existing) {
            Object.assign(existing, d);
            return existing;
        }
        const newD = {
            id: d.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("doc_"),
            partner_id: d.partner_id || "",
            filename: d.filename || "document",
            mime_type: d.mime_type || "application/octet-stream",
            size: d.size ?? 0,
            storage_path: d.storage_path || "",
            category: d.category || "other",
            uploaded_by: d.uploaded_by || null,
            visible_to_partner: d.visible_to_partner ?? false,
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documents"].push(newD);
        return newD;
    }
    async deleteDocument(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documents"].findIndex((d)=>d.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documents"].splice(idx, 1);
    }
    // ---- audit ----
    async listAudit(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auditLogs"]
        ].sort((a, b)=>b.created_at.localeCompare(a.created_at));
        if (params?.search) items = items.filter((a)=>matchesSearch(`${a.action} ${a.username || ""}`, params.search));
        return paginate(items, params);
    }
    async appendAudit(entry) {
        const log = {
            ...entry,
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("a_"),
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auditLogs"].unshift(log);
        return log;
    }
    // ---- settings ----
    async getSetting(key) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["settings"][key] ?? null;
    }
    async setSetting(key, value) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["settings"][key] = value;
    }
    async getAllSettings() {
        return Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["settings"]).map(([k, v])=>({
                key: k,
                value: v,
                updated_at: new Date().toISOString()
            }));
    }
    // ---- tasks ----
    async listTasks(_tenantId, userId) {
        return userId ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tasks"].filter((t)=>t.user_id === userId) : [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tasks"]
        ];
    }
    async upsertTask(t) {
        const existing = t.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tasks"].find((x)=>x.id === t.id) : null;
        if (existing) {
            Object.assign(existing, t);
            return existing;
        }
        const newT = {
            id: t.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("t_"),
            user_id: t.user_id || "",
            title: t.title || "",
            done: t.done ?? false,
            due_date: t.due_date || null,
            entity_type: t.entity_type || null,
            entity_id: t.entity_id || null,
            priority: t.priority || "medium",
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tasks"].push(newT);
        return newT;
    }
    async deleteTask(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tasks"].findIndex((t)=>t.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tasks"].splice(idx, 1);
    }
    // ---- notes ----
    async listNotes(_tenantId, entityType, entityId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notes"].filter((n)=>n.entity_type === entityType && n.entity_id === entityId);
    }
    async upsertNote(n) {
        const existing = n.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notes"].find((x)=>x.id === n.id) : null;
        if (existing) {
            Object.assign(existing, n);
            return existing;
        }
        const newN = {
            id: n.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("n_"),
            entity_type: n.entity_type || "",
            entity_id: n.entity_id || "",
            content: n.content || "",
            pinned: n.pinned ?? false,
            created_by: n.created_by || null,
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notes"].push(newN);
        return newN;
    }
    async deleteNote(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notes"].findIndex((n)=>n.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notes"].splice(idx, 1);
    }
    // ---- inventory ----
    async listInventory(_tenantId, partnerId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inventoryMovements"].filter((m)=>m.partner_id === partnerId);
    }
    async addInventoryMovement(m) {
        const newM = {
            id: m.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("im_"),
            partner_id: m.partner_id || "",
            product_id: m.product_id || "",
            delta: m.delta ?? 0,
            reason: m.reason || "",
            reference: m.reference || null,
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inventoryMovements"].push(newM);
        return newM;
    }
    // ---- dashboard ----
    async getInsights() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeInsights"]();
    }
    // ---- invoices ----
    async listInvoices(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"]
        ];
        if (params?.search) items = items.filter((i)=>matchesSearch(`${i.number} ${i.subject}`, params.search));
        if (params?.filters?.partner_id) items = items.filter((i)=>i.partner_id === params.filters.partner_id);
        if (params?.filters?.status) items = items.filter((i)=>i.status === params.filters.status);
        return paginate(items, params);
    }
    async getInvoice(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"].find((i)=>i.id === id) || null;
    }
    async upsertInvoice(i) {
        const existing = i.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"].find((x)=>x.id === i.id) : null;
        if (existing) {
            Object.assign(existing, i, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const num = `INV-2026-${String(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"].length + 1).padStart(3, "0")}`;
        const newI = {
            id: i.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("inv_"),
            number: i.number || num,
            offer_id: i.offer_id || null,
            partner_id: i.partner_id || "",
            status: i.status || "draft",
            subject: i.subject || "New invoice",
            currency: i.currency || "USD",
            subtotal: i.subtotal ?? 0,
            discount_total: i.discount_total ?? 0,
            tax_total: i.tax_total ?? 0,
            total: i.total ?? 0,
            issue_date: i.issue_date || new Date().toISOString(),
            due_date: i.due_date || new Date(Date.now() + 14 * 86400000).toISOString(),
            sent_at: i.sent_at || null,
            paid_at: i.paid_at || null,
            notes: i.notes || null,
            items: i.items || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"].push(newI);
        return newI;
    }
    async deleteInvoice(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"].findIndex((i)=>i.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"].splice(idx, 1);
    }
    // ---- proformas ----
    async listProformas(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proformas"]
        ];
        if (params?.search) items = items.filter((i)=>matchesSearch(`${i.number} ${i.subject}`, params.search));
        if (params?.filters?.partner_id) items = items.filter((i)=>i.partner_id === params.filters.partner_id);
        if (params?.filters?.status) items = items.filter((i)=>i.status === params.filters.status);
        return paginate(items, params);
    }
    async getProforma(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proformas"].find((i)=>i.id === id) || null;
    }
    async upsertProforma(p) {
        const existing = p.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proformas"].find((x)=>x.id === p.id) : null;
        if (existing) {
            Object.assign(existing, p, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const num = `PRO-2026-${String(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proformas"].length + 1).padStart(3, "0")}`;
        const newP = {
            id: p.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("pro_"),
            number: p.number || num,
            offer_id: p.offer_id || null,
            partner_id: p.partner_id || "",
            status: p.status || "draft",
            subject: p.subject || "New proforma",
            currency: p.currency || "EUR",
            subtotal: p.subtotal ?? 0,
            discount_total: p.discount_total ?? 0,
            tax_total: p.tax_total ?? 0,
            total: p.total ?? 0,
            issue_date: p.issue_date || new Date().toISOString(),
            valid_until: p.valid_until || new Date(Date.now() + 14 * 86400000).toISOString(),
            sent_at: p.sent_at || null,
            paid_at: p.paid_at || null,
            payment_terms: p.payment_terms || "net30",
            notes: p.notes || null,
            items: p.items || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proformas"].push(newP);
        return newP;
    }
    async deleteProforma(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proformas"].findIndex((i)=>i.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proformas"].splice(idx, 1);
    }
    // ---- document register ----
    async listDocumentRegister(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentRegister"]
        ];
        if (params?.search) items = items.filter((e)=>matchesSearch(`${e.number} ${e.title}`, params.search));
        if (params?.filters?.type) items = items.filter((e)=>e.type === params.filters.type);
        if (params?.filters?.status) items = items.filter((e)=>e.status === params.filters.status);
        return paginate(items, params);
    }
    async upsertDocumentRegisterEntry(e) {
        const existing = e.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentRegister"].find((x)=>x.id === e.id) : null;
        if (existing) {
            Object.assign(existing, e, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newE = {
            id: e.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("dr_"),
            number: e.number || "",
            type: e.type || "other",
            version: e.version ?? 1,
            reference_id: e.reference_id || null,
            partner_id: e.partner_id || null,
            title: e.title || "",
            status: e.status || "current",
            created_by: e.created_by || null,
            metadata: e.metadata || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentRegister"].push(newE);
        return newE;
    }
    async listDocumentRevisions(tenantId, documentId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentRevisions"].filter((r)=>r.document_id === documentId && r.tenant_id === tenantId);
    }
    async addDocumentRevision(r) {
        const newR = {
            id: r.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("rev_"),
            document_id: r.document_id || "",
            version: r.version ?? 1,
            change_note: r.change_note || "",
            created_by: r.created_by || null,
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentRevisions"].push(newR);
        return newR;
    }
    async deleteDocumentRegisterEntry(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentRegister"].findIndex((e)=>e.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentRegister"].splice(idx, 1);
    }
    // ---- vault ----
    async listVault(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["vaultSecrets"]
        ];
        if (params?.search) items = items.filter((s)=>matchesSearch(`${s.key} ${s.description || ""}`, params.search));
        if (params?.filters?.category) items = items.filter((s)=>s.category === params.filters.category);
        return paginate(items, params);
    }
    async upsertVaultSecret(s) {
        const existing = s.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["vaultSecrets"].find((x)=>x.id === s.id) : null;
        if (existing) {
            Object.assign(existing, s, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newS = {
            id: s.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("vs_"),
            key: s.key || "",
            description: s.description || null,
            encrypted_value: s.encrypted_value || "",
            category: s.category || "other",
            last_accessed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["vaultSecrets"].push(newS);
        return newS;
    }
    async deleteVaultSecret(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["vaultSecrets"].findIndex((s)=>s.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["vaultSecrets"].splice(idx, 1);
    }
    // ---- api keys ----
    async listApiKeys(_tenantId) {
        return [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiKeys"]
        ];
    }
    async upsertApiKey(k) {
        const existing = k.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiKeys"].find((x)=>x.id === k.id) : null;
        if (existing) {
            Object.assign(existing, k);
            return existing;
        }
        const prefix = "asp_" + (k.name || "key").toLowerCase().replace(/\s+/g, "_").slice(0, 8) + "_";
        const newK = {
            id: k.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("ak_"),
            name: k.name || "API Key",
            key_prefix: prefix,
            key_hash: "hash_" + Date.now(),
            permissions: k.permissions || [],
            last_used_at: null,
            last_used_ip: null,
            active: k.active ?? true,
            expires_at: k.expires_at || null,
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiKeys"].push(newK);
        return newK;
    }
    async deleteApiKey(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiKeys"].findIndex((k)=>k.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiKeys"].splice(idx, 1);
    }
    async authenticateApiKey(_rawKey) {
        return null;
    }
    async updateApiKeyLastUsed(_id, _ip) {}
    // ---- webhooks ----
    async listWebhooks(_tenantId) {
        return [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["webhooks"]
        ];
    }
    async upsertWebhook(w) {
        const existing = w.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["webhooks"].find((x)=>x.id === w.id) : null;
        if (existing) {
            Object.assign(existing, w);
            return existing;
        }
        const newW = {
            id: w.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("wh_"),
            name: w.name || "Webhook",
            url: w.url || "",
            events: w.events || [],
            secret: "whsec_" + Math.random().toString(36).slice(2),
            last_triggered_at: null,
            last_status: null,
            active: w.active ?? true,
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["webhooks"].push(newW);
        return newW;
    }
    async deleteWebhook(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["webhooks"].findIndex((w)=>w.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["webhooks"].splice(idx, 1);
    }
    // ---- security ----
    async listSessions(_tenantId, userId) {
        return userId ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["securitySessions"].filter((s)=>s.user_id === userId) : [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["securitySessions"]
        ];
    }
    async revokeSession(id) {
        const s = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["securitySessions"].find((x)=>x.id === id);
        if (s) s.revoked = true;
    }
    async listLoginHistory(_tenantId, userId, limit) {
        let items = userId ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loginHistory"].filter((l)=>l.user_id === userId) : [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loginHistory"]
        ];
        items.sort((a, b)=>b.created_at.localeCompare(a.created_at));
        return limit ? items.slice(0, limit) : items;
    }
    async listKnownIps(_tenantId, userId) {
        return userId ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["knownIps"].filter((i)=>i.user_id === userId) : [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["knownIps"]
        ];
    }
    async trustIp(id, trusted) {
        const ip = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["knownIps"].find((i)=>i.id === id);
        if (ip) ip.trusted = trusted;
    }
    async forgetIp(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["knownIps"].findIndex((i)=>i.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["knownIps"].splice(idx, 1);
    }
    async listTrustedDevices(_tenantId, userId) {
        return userId ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trustedDevices"].filter((d)=>d.user_id === userId) : [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trustedDevices"]
        ];
    }
    async revokeTrustedDevice(id) {
        const d = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trustedDevices"].find((x)=>x.id === id);
        if (d) d.revoked = true;
    }
    // ---- mail queue ----
    async listMailQueue(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mailQueue"]
        ].sort((a, b)=>b.created_at.localeCompare(a.created_at));
        if (params?.search) items = items.filter((m)=>matchesSearch(`${m.subject} ${m.to_email}`, params.search));
        if (params?.filters?.status) items = items.filter((m)=>m.status === params.filters.status);
        return paginate(items, params);
    }
    async upsertMailQueueEntry(m) {
        const existing = m.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mailQueue"].find((x)=>x.id === m.id) : null;
        if (existing) {
            Object.assign(existing, m);
            return existing;
        }
        const newM = {
            id: m.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("mq_"),
            to_email: m.to_email || "",
            subject: m.subject || "",
            body: m.body || "",
            status: m.status || "queued",
            attempts: 0,
            error: null,
            sent_at: null,
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mailQueue"].push(newM);
        return newM;
    }
    async deleteMailQueueEntry(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mailQueue"].findIndex((m)=>m.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mailQueue"].splice(idx, 1);
    }
    // ---- all inventory (for global view) ----
    async listAllInventory(_tenantId, params) {
        let items = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inventoryMovements"]
        ].sort((a, b)=>b.created_at.localeCompare(a.created_at));
        if (params?.filters?.partner_id) items = items.filter((m)=>m.partner_id === params.filters.partner_id);
        return paginate(items, params);
    }
    // ---- tenants ----
    async listTenants() {
        return [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"]
        ];
    }
    async getTenant(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].find((t)=>t.id === id) || null;
    }
    async upsertTenant(t) {
        const existing = t.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].find((x)=>x.id === t.id) : null;
        if (existing) {
            Object.assign(existing, t, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newT = {
            id: t.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("t_"),
            name: t.name || "New Tenant",
            legal_name: t.legal_name || null,
            country: t.country || null,
            currency: t.currency || "USD",
            tax_id: t.tax_id || null,
            vat_number: t.vat_number || null,
            registration_number: t.registration_number || null,
            address_line: t.address_line || null,
            city: t.city || null,
            postal_code: t.postal_code || null,
            bank_name: t.bank_name || null,
            bank_iban: t.bank_iban || null,
            bank_swift: t.bank_swift || null,
            logo_url: null,
            primary_color: t.primary_color || null,
            plan: t.plan || "trial",
            status: t.status || "active",
            max_users: t.max_users ?? 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].push(newT);
        return newT;
    }
    async deleteTenant(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].findIndex((t)=>t.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].splice(idx, 1);
    }
    // ---- product catalog ----
    async listProductCatalog(tenantId, params) {
        let items = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["productCatalog"].filter((p)=>p.tenant_id === tenantId);
        if (params?.search) items = items.filter((p)=>matchesSearch(`${p.name} ${p.hs_code || ""}`, params.search));
        if (params?.filters?.category) items = items.filter((p)=>p.category === params.filters.category);
        return paginate(items, params);
    }
    async getProductCatalogEntry(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["productCatalog"].find((p)=>p.id === id) || null;
    }
    async upsertProductCatalogEntry(p) {
        const existing = p.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["productCatalog"].find((x)=>x.id === p.id) : null;
        if (existing) {
            Object.assign(existing, p, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newP = {
            id: p.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("pc_"),
            tenant_id: p.tenant_id || "",
            name: p.name || "New Product",
            category: p.category || "OTHER",
            hs_code: p.hs_code || null,
            description: p.description || null,
            base_unit: p.base_unit || "MT",
            specifications: p.specifications || null,
            origin_country: p.origin_country || null,
            images: null,
            active: p.active ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["productCatalog"].push(newP);
        return newP;
    }
    async deleteProductCatalogEntry(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["productCatalog"].findIndex((p)=>p.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["productCatalog"].splice(idx, 1);
    }
    // ---- supplier offers ----
    async listSupplierOffers(tenantId, params) {
        let items = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supplierOffers"].filter((s)=>s.tenant_id === tenantId);
        if (params?.search) items = items.filter((s)=>matchesSearch(`${s.offer_number || ""} ${s.packaging || ""}`, params.search));
        if (params?.filters?.product_id) items = items.filter((s)=>s.product_id === params.filters.product_id);
        if (params?.filters?.supplier_id) items = items.filter((s)=>s.supplier_id === params.filters.supplier_id);
        if (params?.filters?.status) items = items.filter((s)=>s.status === params.filters.status);
        return paginate(items, params);
    }
    async getSupplierOffer(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supplierOffers"].find((s)=>s.id === id) || null;
    }
    async upsertSupplierOffer(s) {
        const existing = s.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supplierOffers"].find((x)=>x.id === s.id) : null;
        if (existing) {
            Object.assign(existing, s, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newS = {
            id: s.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("so_"),
            tenant_id: s.tenant_id || "",
            product_id: s.product_id || "",
            supplier_id: s.supplier_id || "",
            offer_number: s.offer_number || null,
            status: s.status || "active",
            unit_price: s.unit_price ?? 0,
            currency: s.currency || "USD",
            min_order_qty: s.min_order_qty || null,
            price_valid_until: s.price_valid_until || null,
            packaging: s.packaging || null,
            packing_details: s.packing_details || null,
            loadability: s.loadability || null,
            specification_notes: s.specification_notes || null,
            origin_country: s.origin_country || null,
            incoterm: s.incoterm || "FOB",
            loading_port: s.loading_port || null,
            delivery_port: s.delivery_port || null,
            lead_time_days: s.lead_time_days || null,
            payment_terms: s.payment_terms || null,
            inspection: s.inspection || null,
            certificate: s.certificate || null,
            notes: s.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supplierOffers"].push(newS);
        return newS;
    }
    async deleteSupplierOffer(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supplierOffers"].findIndex((s)=>s.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supplierOffers"].splice(idx, 1);
    }
    // ---- trade calculations ----
    async listTradeCalculations(tenantId, params) {
        let items = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tradeCalculations"].filter((t)=>t.tenant_id === tenantId);
        if (params?.search) items = items.filter((t)=>matchesSearch(t.name, params.search));
        return paginate(items, params);
    }
    async getTradeCalculation(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tradeCalculations"].find((t)=>t.id === id) || null;
    }
    async upsertTradeCalculation(t) {
        const existing = t.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tradeCalculations"].find((x)=>x.id === t.id) : null;
        if (existing) {
            Object.assign(existing, t, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newT = {
            id: t.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("tc_"),
            tenant_id: t.tenant_id || "",
            name: t.name || "New Calculation",
            product_id: t.product_id || null,
            supplier_offer_id: t.supplier_offer_id || null,
            supplier_id: t.supplier_id || null,
            buyer_id: t.buyer_id || null,
            quantity: t.quantity ?? 0,
            unit: t.unit || "MT",
            num_containers: t.num_containers ?? 1,
            container_type: t.container_type || null,
            buy_price_per_unit: t.buy_price_per_unit ?? 0,
            buy_currency: t.buy_currency || "USD",
            buy_incoterm: t.buy_incoterm || "FOB",
            sell_price_per_unit: t.sell_price_per_unit ?? 0,
            sell_currency: t.sell_currency || "USD",
            sell_incoterm: t.sell_incoterm || "CIF",
            transport_mode: t.transport_mode || "SEA",
            loading_port: t.loading_port || null,
            delivery_port: t.delivery_port || null,
            exchange_rate: t.exchange_rate ?? 1,
            cost_lines: t.cost_lines || [],
            total_buy_cost: t.total_buy_cost ?? 0,
            total_landed_cost: t.total_landed_cost ?? 0,
            total_sell_revenue: t.total_sell_revenue ?? 0,
            gross_margin: t.gross_margin ?? 0,
            margin_percent: t.margin_percent ?? 0,
            created_by: t.created_by || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tradeCalculations"].push(newT);
        return newT;
    }
    async deleteTradeCalculation(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tradeCalculations"].findIndex((t)=>t.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tradeCalculations"].splice(idx, 1);
    }
    // ---- portal access ----
    async getPortalAccessByPartner(partnerId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].find((p)=>p.partner_id === partnerId) || null;
    }
    async getPortalAccessByEmail(tenantId, email) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].find((p)=>p.tenant_id === tenantId && p.portal_email === email) || null;
    }
    async getPortalAccessById(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].find((p)=>p.id === id) || null;
    }
    async listPortalAccess(tenantId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].filter((p)=>p.tenant_id === tenantId);
    }
    async upsertPortalAccess(p) {
        const existing = p.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].find((x)=>x.id === p.id) : null;
        if (existing) {
            Object.assign(existing, p, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const tier = p.tier || "standard";
        const newP = {
            id: p.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("pa_"),
            partner_id: p.partner_id || "",
            tenant_id: p.tenant_id || "",
            tier,
            can_view_offers: p.can_view_offers ?? true,
            can_view_documents: p.can_view_documents ?? true,
            can_view_catalog: p.can_view_catalog ?? true,
            can_view_invoices: p.can_view_invoices ?? false,
            can_view_profile: p.can_view_profile ?? true,
            can_view_company_info: p.can_view_company_info ?? true,
            can_submit_rfq: p.can_submit_rfq ?? true,
            can_download_pdf: p.can_download_pdf ?? true,
            exempt_kyc: p.exempt_kyc ?? tier === "premium",
            exempt_document_upload: p.exempt_document_upload ?? tier === "premium",
            exempt_location_share: p.exempt_location_share ?? tier === "premium",
            status: p.status || "pending_approval",
            approved_by: p.approved_by || null,
            approved_at: p.approved_at || null,
            invited_at: p.invited_at || null,
            welcome_email_sent: p.welcome_email_sent ?? false,
            portal_email: p.portal_email || null,
            password_hash: p.password_hash || null,
            must_set_password: p.must_set_password ?? true,
            last_login_at: null,
            last_login_ip: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].push(newP);
        return newP;
    }
    async deletePortalAccess(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].findIndex((p)=>p.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].splice(idx, 1);
    }
    async verifyPortalCredentials(tenantId, email, password) {
        const pa = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].find((p)=>p.tenant_id === tenantId && p.portal_email === email && p.password_hash);
        if (!pa) return null;
        if (pa.status !== "active") return null;
        if (pa.password_hash === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockHash"](password)) {
            pa.last_login_at = new Date().toISOString();
            return pa;
        }
        return null;
    }
    async verifyPortalCredentialsByEmail(email, password) {
        const pa = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalAccess"].find((p)=>p.portal_email === email && p.password_hash);
        if (!pa) return null;
        if (pa.status !== "active") return null;
        if (pa.password_hash === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockHash"](password)) {
            pa.last_login_at = new Date().toISOString();
            return pa;
        }
        return null;
    }
    // ---- document templates ----
    async listDocumentTemplates(tenantId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentTemplates"].filter((t)=>t.tenant_id === tenantId);
    }
    async getDocumentTemplate(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentTemplates"].find((t)=>t.id === id) || null;
    }
    async getDefaultDocumentTemplate(tenantId, type) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentTemplates"].find((t)=>t.tenant_id === tenantId && t.type === type && t.is_default) || null;
    }
    async upsertDocumentTemplate(t) {
        const existing = t.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentTemplates"].find((x)=>x.id === t.id) : null;
        if (existing) {
            Object.assign(existing, t, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newT = {
            id: t.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("dt_"),
            tenant_id: t.tenant_id || "",
            name: t.name || "New Template",
            type: t.type || "generic",
            is_default: t.is_default ?? false,
            page_size: t.page_size || "A4",
            page_margin_top: t.page_margin_top ?? 25,
            page_margin_bottom: t.page_margin_bottom ?? 25,
            page_margin_left: t.page_margin_left ?? 20,
            page_margin_right: t.page_margin_right ?? 20,
            header_enabled: t.header_enabled ?? true,
            header_height: t.header_height ?? 20,
            header_content: t.header_content || "",
            header_show_logo: t.header_show_logo ?? true,
            header_show_company_name: t.header_show_company_name ?? true,
            header_show_contact: t.header_show_contact ?? true,
            footer_enabled: t.footer_enabled ?? true,
            footer_height: t.footer_height ?? 15,
            footer_content: t.footer_content || "",
            footer_show_page_number: t.footer_show_page_number ?? true,
            footer_show_bank_details: t.footer_show_bank_details ?? true,
            footer_show_tax_id: t.footer_show_tax_id ?? true,
            body_font_family: t.body_font_family || "Inter",
            body_font_size: t.body_font_size ?? 11,
            body_line_height: t.body_line_height ?? 1.5,
            primary_color: t.primary_color || "#0f766e",
            accent_color: t.accent_color || "#0d9488",
            table_header_bg: t.table_header_bg || "#0f766e",
            table_header_color: t.table_header_color || "#ffffff",
            table_border_color: t.table_border_color || "#e5e7eb",
            table_stripe: t.table_stripe ?? true,
            created_by: t.created_by || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentTemplates"].push(newT);
        return newT;
    }
    async deleteDocumentTemplate(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentTemplates"].findIndex((t)=>t.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentTemplates"].splice(idx, 1);
    }
    // ---- document verification ----
    async createDocumentVerification(v) {
        const newV = {
            ...v,
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("dv_"),
            verification_count: 0,
            last_verified_at: null,
            last_verified_ip: null,
            status: v.status || "active",
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentVerifications"].push(newV);
        return newV;
    }
    async getDocumentVerificationByCode(code) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentVerifications"].find((v)=>v.verification_code === code) || null;
    }
    async getDocumentVerificationByDoc(tenantId, docType, docId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentVerifications"].find((v)=>v.tenant_id === tenantId && v.document_type === docType && v.document_id === docId) || null;
    }
    async logVerification(log) {
        // increment verification count
        const v = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentVerifications"].find((x)=>x.id === log.verification_id);
        if (v) {
            v.verification_count += 1;
            v.last_verified_at = new Date().toISOString();
            v.last_verified_ip = log.ip;
        }
        return {
            ...log,
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("vl_"),
            verified_at: new Date().toISOString()
        };
    }
    async listVerificationLogs(_verificationId) {
        return [];
    }
    // ---- KYC submissions ----
    async listKycSubmissions(tenantId, params) {
        let items = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"].filter((k)=>k.tenant_id === tenantId);
        if (params?.search) items = items.filter((k)=>matchesSearch(`${k.legal_name || ""} ${k.contact_name || ""}`, params.search));
        if (params?.filters?.status) items = items.filter((k)=>k.status === params.filters.status);
        items.sort((a, b)=>b.updated_at.localeCompare(a.updated_at));
        return paginate(items, params);
    }
    async getKycSubmission(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"].find((k)=>k.id === id) || null;
    }
    async getKycSubmissionByPartner(partnerId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"].find((k)=>k.partner_id === partnerId) || null;
    }
    async upsertKycSubmission(s) {
        const existing = s.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"].find((x)=>x.id === s.id) : null;
        if (existing) {
            Object.assign(existing, s, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newS = {
            id: s.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("kyc_"),
            tenant_id: s.tenant_id || "",
            partner_id: s.partner_id || "",
            portal_access_id: s.portal_access_id || null,
            status: s.status || "draft",
            entity_type: s.entity_type || "company",
            legal_name: s.legal_name || null,
            trade_name: s.trade_name || null,
            registration_number: s.registration_number || null,
            tax_id: s.tax_id || null,
            vat_number: s.vat_number || null,
            company_website: s.company_website || null,
            address_line: s.address_line || null,
            city: s.city || null,
            state: s.state || null,
            postal_code: s.postal_code || null,
            country: s.country || null,
            contact_name: s.contact_name || null,
            contact_email: s.contact_email || null,
            contact_phone: s.contact_phone || null,
            contact_position: s.contact_position || null,
            owner_name: s.owner_name || null,
            owner_id_type: s.owner_id_type || null,
            owner_id_number: s.owner_id_number || null,
            owner_nationality: s.owner_nationality || null,
            owner_dob: s.owner_dob || null,
            owner_address: s.owner_address || null,
            business_activity: s.business_activity || null,
            expected_monthly_volume: s.expected_monthly_volume || null,
            source_of_funds: s.source_of_funds || null,
            bank_name: s.bank_name || null,
            bank_account: s.bank_account || null,
            bank_iban: s.bank_iban || null,
            bank_swift: s.bank_swift || null,
            documents: s.documents || [],
            reviewed_by: null,
            reviewed_at: null,
            review_notes: null,
            rejection_reason: null,
            auto_transferred: false,
            submitted_at: s.submitted_at || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"].push(newS);
        return newS;
    }
    async deleteKycSubmission(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"].findIndex((k)=>k.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"].splice(idx, 1);
    }
    async addKycDocument(doc) {
        const newD = {
            ...doc,
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("kd_"),
            uploaded_at: new Date().toISOString()
        };
        const sub = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"].find((k)=>k.id === doc.submission_id);
        if (sub) sub.documents.push(newD);
        return newD;
    }
    async removeKycDocument(id) {
        for (const sub of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"]){
            const idx = sub.documents.findIndex((d)=>d.id === id);
            if (idx >= 0) {
                sub.documents.splice(idx, 1);
                return;
            }
        }
    }
    // KEY AUTOMATION: approve KYC + auto-transfer data to partner record
    async approveKycAndTransfer(submissionId, reviewedBy) {
        const sub = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kycSubmissions"].find((k)=>k.id === submissionId);
        if (!sub) throw new Error("KYC submission not found");
        // Mark submission as approved
        sub.status = "approved";
        sub.reviewed_by = reviewedBy;
        sub.reviewed_at = new Date().toISOString();
        sub.auto_transferred = true;
        sub.updated_at = new Date().toISOString();
        // Auto-transfer data to partner record
        const partner = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partners"].find((p)=>p.id === sub.partner_id);
        if (partner) {
            partner.entity_type = sub.entity_type;
            if (sub.legal_name) partner.name = sub.legal_name;
            if (sub.tax_id) partner.tax_id = sub.tax_id;
            if (sub.vat_number) partner.vat_number = sub.vat_number;
            if (sub.registration_number) partner.registration_number = sub.registration_number;
            if (sub.address_line) partner.address_line = sub.address_line;
            if (sub.city) partner.city = sub.city;
            if (sub.state) partner.state = sub.state;
            if (sub.postal_code) partner.postal_code = sub.postal_code;
            if (sub.country) partner.country = sub.country;
            if (sub.contact_name) partner.contact_name = sub.contact_name;
            if (sub.contact_email) partner.contact_email = sub.contact_email;
            if (sub.contact_phone) partner.contact_phone = sub.contact_phone;
            if (sub.bank_name) partner.bank_name = sub.bank_name;
            if (sub.bank_account) partner.bank_account = sub.bank_account;
            if (sub.bank_iban) partner.bank_iban = sub.bank_iban;
            if (sub.bank_swift) partner.bank_swift = sub.bank_swift;
            partner.kyc_status = "approved";
            partner.kyc_reviewed_by = reviewedBy;
            partner.kyc_reviewed_at = new Date().toISOString();
            partner.updated_at = new Date().toISOString();
        }
        return {
            submission: sub,
            partner: partner
        };
    }
    // ---- portal RFQs ----
    async listPortalRfqs(tenantId, params) {
        let items = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalRfqs"].filter((r)=>r.tenant_id === tenantId);
        if (params?.search) items = items.filter((r)=>matchesSearch(`${r.number} ${r.product_name}`, params.search));
        if (params?.filters?.status) items = items.filter((r)=>r.status === params.filters.status);
        if (params?.filters?.partner_id) items = items.filter((r)=>r.partner_id === params.filters.partner_id);
        items.sort((a, b)=>b.created_at.localeCompare(a.created_at));
        return paginate(items, params);
    }
    async listPortalRfqsByPartner(partnerId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalRfqs"].filter((r)=>r.partner_id === partnerId).sort((a, b)=>b.created_at.localeCompare(a.created_at));
    }
    async getPortalRfq(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalRfqs"].find((r)=>r.id === id) || null;
    }
    async upsertPortalRfq(r) {
        const existing = r.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalRfqs"].find((x)=>x.id === r.id) : null;
        if (existing) {
            Object.assign(existing, r, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const num = `RFQ-2026-${String(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalRfqs"].length + 1).padStart(3, "0")}`;
        const newR = {
            id: r.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("rfq_"),
            tenant_id: r.tenant_id || "",
            partner_id: r.partner_id || "",
            portal_access_id: r.portal_access_id || null,
            number: r.number || num,
            status: r.status || "pending",
            product_name: r.product_name || "",
            product_description: r.product_description || null,
            category: r.category || null,
            quantity: r.quantity ?? 0,
            unit: r.unit || "MT",
            target_price: r.target_price || null,
            currency: r.currency || "USD",
            delivery_country: r.delivery_country || null,
            delivery_port: r.delivery_port || null,
            delivery_date: r.delivery_date || null,
            incoterm: r.incoterm || null,
            specifications: r.specifications || null,
            notes: r.notes || null,
            linked_offer_id: null,
            linked_demand_id: null,
            admin_notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalRfqs"].push(newR);
        return newR;
    }
    async deletePortalRfq(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalRfqs"].findIndex((r)=>r.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["portalRfqs"].splice(idx, 1);
    }
    // ---- feature flags ----
    async getFeatureFlags(tenantId) {
        const existing = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["featureFlags"].find((f)=>f.tenant_id === tenantId);
        if (existing) return existing;
        // Auto-create default flags if not exist
        return this.upsertFeatureFlags({
            tenant_id: tenantId
        });
    }
    async upsertFeatureFlags(f) {
        const existing = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["featureFlags"].find((x)=>x.tenant_id === f.tenant_id);
        if (existing) {
            Object.assign(existing, f, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newF = {
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("ff_"),
            tenant_id: f.tenant_id,
            module_crm: f.module_crm ?? true,
            module_trade: f.module_trade ?? true,
            module_finance: f.module_finance ?? true,
            module_inventory: f.module_inventory ?? true,
            module_portal: f.module_portal ?? true,
            module_kyc: f.module_kyc ?? true,
            module_document_templates: f.module_document_templates ?? true,
            module_document_verification: f.module_document_verification ?? true,
            module_vault: f.module_vault ?? true,
            module_api_keys: f.module_api_keys ?? true,
            module_webhooks: f.module_webhooks ?? true,
            module_mail_queue: f.module_mail_queue ?? true,
            module_security: f.module_security ?? true,
            max_partners: f.max_partners ?? 0,
            max_users: f.max_users ?? 25,
            max_monthly_documents: f.max_monthly_documents ?? 0,
            beta_ai_assistant: f.beta_ai_assistant ?? false,
            beta_advanced_analytics: f.beta_advanced_analytics ?? false,
            updated_by: f.updated_by || null,
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["featureFlags"].push(newF);
        return newF;
    }
    // ---- notifications ----
    async listNotifications(tenantId, userId, unreadOnly) {
        let items = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifications"].filter((n)=>n.tenant_id === tenantId);
        if (userId) items = items.filter((n)=>n.user_id === null || n.user_id === userId);
        if (unreadOnly) items = items.filter((n)=>!n.read);
        return items.sort((a, b)=>b.created_at.localeCompare(a.created_at));
    }
    async listNotificationsByPartner(tenantId, partnerId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifications"].filter((n)=>n.tenant_id === tenantId && (n.partner_id === partnerId || n.partner_id === null)).sort((a, b)=>b.created_at.localeCompare(a.created_at));
    }
    async createNotification(n) {
        const newN = {
            ...n,
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("ntf_"),
            read: false,
            read_at: null,
            created_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifications"].unshift(newN);
        return newN;
    }
    async markNotificationRead(id) {
        const n = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifications"].find((x)=>x.id === id);
        if (n && !n.read) {
            n.read = true;
            n.read_at = new Date().toISOString();
        }
    }
    async markAllNotificationsRead(tenantId, userId) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifications"].forEach((n)=>{
            if (n.tenant_id === tenantId && (n.user_id === null || n.user_id === userId) && !n.read) {
                n.read = true;
                n.read_at = new Date().toISOString();
            }
        });
    }
    async deleteNotification(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifications"].findIndex((n)=>n.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifications"].splice(idx, 1);
    }
    async getUnreadCount(tenantId, userId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifications"].filter((n)=>n.tenant_id === tenantId && !n.read && (n.user_id === null || n.user_id === userId)).length;
    }
    // ---- commission agents ----
    async listCommissionAgents(tenantId, params) {
        let items = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionAgents"].filter((a)=>a.tenant_id === tenantId);
        if (params?.search) {
            items = items.filter((a)=>{
                const partner = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partners"].find((p)=>p.id === a.partner_id);
                return matchesSearch(`${partner?.name || ""} ${a.notes || ""}`, params.search);
            });
        }
        if (params?.filters?.active !== undefined) items = items.filter((a)=>String(a.active) === params.filters.active);
        return paginate(items, params);
    }
    async getCommissionAgent(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionAgents"].find((a)=>a.id === id) || null;
    }
    async getCommissionAgentByPartner(partnerId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionAgents"].find((a)=>a.partner_id === partnerId) || null;
    }
    async upsertCommissionAgent(a) {
        const existing = a.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionAgents"].find((x)=>x.id === a.id) : null;
        if (existing) {
            Object.assign(existing, a, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newA = {
            id: a.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("ca_"),
            tenant_id: a.tenant_id || "",
            partner_id: a.partner_id || "",
            commission_type: a.commission_type || "profit_percent",
            commission_rate: a.commission_rate ?? 0,
            commission_per_unit: a.commission_per_unit ?? 0,
            commission_custom_formula: a.commission_custom_formula || null,
            commission_currency: a.commission_currency || "USD",
            is_default: a.is_default ?? false,
            active: a.active ?? true,
            notes: a.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionAgents"].push(newA);
        return newA;
    }
    async deleteCommissionAgent(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionAgents"].findIndex((a)=>a.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionAgents"].splice(idx, 1);
    }
    // ---- deal commissions ----
    async listDealCommissions(tenantId, params) {
        let items = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].filter((c)=>c.tenant_id === tenantId);
        if (params?.search) {
            items = items.filter((c)=>matchesSearch(`${c.deal_id} ${c.status} ${c.payout_reference || ""}`, params.search));
        }
        if (params?.filters?.status) items = items.filter((c)=>c.status === params.filters.status);
        if (params?.filters?.agent_id) items = items.filter((c)=>c.agent_id === params.filters.agent_id);
        return paginate(items, params);
    }
    async listDealCommissionsByDeal(dealId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].filter((c)=>c.deal_id === dealId);
    }
    async listDealCommissionsByAgent(agentId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].filter((c)=>c.agent_id === agentId);
    }
    async getDealCommission(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].find((c)=>c.id === id) || null;
    }
    async upsertDealCommission(c) {
        const existing = c.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].find((x)=>x.id === c.id) : null;
        if (existing) {
            Object.assign(existing, c, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newC = {
            id: c.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("dc_"),
            tenant_id: c.tenant_id || "",
            deal_id: c.deal_id || "",
            agent_id: c.agent_id || "",
            partner_id: c.partner_id || "",
            commission_type: c.commission_type || "profit_percent",
            commission_rate: c.commission_rate ?? 0,
            commission_per_unit: c.commission_per_unit ?? 0,
            commission_custom_formula: c.commission_custom_formula || null,
            commission_currency: c.commission_currency || "USD",
            deal_value: c.deal_value ?? 0,
            deal_profit: c.deal_profit ?? 0,
            deal_quantity: c.deal_quantity ?? 0,
            deal_unit: c.deal_unit || "pcs",
            calculated_commission: c.calculated_commission ?? 0,
            status: c.status || "pending",
            approved_by: c.approved_by || null,
            approved_at: c.approved_at || null,
            paid_at: c.paid_at || null,
            payout_reference: c.payout_reference || null,
            notes: c.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].push(newC);
        return newC;
    }
    async deleteDealCommission(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].findIndex((c)=>c.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].splice(idx, 1);
    }
    async approveDealCommission(id, approvedBy) {
        const c = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].find((x)=>x.id === id);
        if (!c) throw new Error(`DealCommission ${id} not found`);
        c.status = "approved";
        c.approved_by = approvedBy;
        c.approved_at = new Date().toISOString();
        c.updated_at = new Date().toISOString();
        return c;
    }
    async markDealCommissionPaid(id, payoutReference) {
        const c = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].find((x)=>x.id === id);
        if (!c) throw new Error(`DealCommission ${id} not found`);
        c.status = "paid";
        c.paid_at = new Date().toISOString();
        if (payoutReference) c.payout_reference = payoutReference;
        c.updated_at = new Date().toISOString();
        return c;
    }
    // ---- commission payouts ----
    async listCommissionPayouts(tenantId, params) {
        let items = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionPayouts"].filter((p)=>p.tenant_id === tenantId);
        if (params?.search) {
            items = items.filter((p)=>matchesSearch(`${p.payment_reference || ""} ${p.status}`, params.search));
        }
        if (params?.filters?.status) items = items.filter((p)=>p.status === params.filters.status);
        return paginate(items, params);
    }
    async getCommissionPayout(id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionPayouts"].find((p)=>p.id === id) || null;
    }
    async upsertCommissionPayout(p) {
        const existing = p.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionPayouts"].find((x)=>x.id === p.id) : null;
        if (existing) {
            Object.assign(existing, p, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newP = {
            id: p.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("cp_"),
            tenant_id: p.tenant_id || "",
            agent_id: p.agent_id || "",
            partner_id: p.partner_id || "",
            total_amount: p.total_amount ?? 0,
            currency: p.currency || "USD",
            commission_ids: p.commission_ids || [],
            payment_method: p.payment_method || null,
            payment_reference: p.payment_reference || null,
            paid_at: p.paid_at || null,
            status: p.status || "pending",
            notes: p.notes || null,
            created_by: p.created_by || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionPayouts"].push(newP);
        return newP;
    }
    async deleteCommissionPayout(id) {
        const idx = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionPayouts"].findIndex((p)=>p.id === id);
        if (idx >= 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionPayouts"].splice(idx, 1);
    }
    // ---- commission summaries ----
    async getCommissionSummaries(tenantId) {
        const agents = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionAgents"].filter((a)=>a.tenant_id === tenantId && a.active);
        return agents.map((agent)=>{
            const commissions = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].filter((c)=>c.agent_id === agent.id && c.tenant_id === tenantId);
            const partner = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partners"].find((p)=>p.id === agent.partner_id);
            const totalCommission = commissions.reduce((sum, c)=>sum + c.calculated_commission, 0);
            const paidCommission = commissions.filter((c)=>c.status === "paid").reduce((sum, c)=>sum + c.calculated_commission, 0);
            const pendingCommission = commissions.filter((c)=>c.status === "pending" || c.status === "approved").reduce((sum, c)=>sum + c.calculated_commission, 0);
            return {
                agent_id: agent.id,
                partner_id: agent.partner_id,
                partner_name: partner?.name || "Unknown",
                total_deals: commissions.length,
                total_commission: totalCommission,
                paid_commission: paidCommission,
                pending_commission: pendingCommission,
                currency: agent.commission_currency
            };
        });
    }
    async calculateCommission(agentId, dealValue, dealProfit, dealQuantity, dealUnit, currency) {
        const agent = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commissionAgents"].find((a)=>a.id === agentId);
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
                return agent.commission_rate; // fallback, custom formula would need manual calculation
            default:
                return 0;
        }
    }
    // ================================================================
    // ERP / Accounting
    // ================================================================
    // ---- Chart of Accounts ----
    async listErpAccounts(tenantId, params) {
        let items = [
            ...this.erpAccounts.values()
        ].filter((a)=>a.tenant_id === tenantId);
        if (params?.search) {
            const q = params.search.toLowerCase();
            items = items.filter((a)=>a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q));
        }
        if (params?.filters) {
            for (const [k, v] of Object.entries(params.filters)){
                if (v !== undefined) items = items.filter((a)=>String(a[k]) === v);
            }
        }
        return paginate(items, params);
    }
    async getErpAccount(id) {
        return this.erpAccounts.get(id) || null;
    }
    async upsertErpAccount(a) {
        const existing = a.id ? this.erpAccounts.get(a.id) : undefined;
        if (existing) {
            Object.assign(existing, a, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newA = {
            id: a.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("acc_"),
            tenant_id: a.tenant_id || "",
            code: a.code || "",
            name: a.name || "",
            name_en: a.name_en || null,
            account_type: a.account_type || "asset",
            account_category: a.account_category || null,
            parent_id: a.parent_id || null,
            is_active: a.is_active ?? true,
            is_system: a.is_system ?? false,
            standard: a.standard || null,
            tax_code: a.tax_code || null,
            description: a.description || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.erpAccounts.set(newA.id, newA);
        return newA;
    }
    async deleteErpAccount(id) {
        this.erpAccounts.delete(id);
    }
    // ---- Fiscal Periods ----
    async listFiscalPeriods(tenantId, params) {
        let items = [
            ...this.fiscalPeriods.values()
        ].filter((p)=>p.tenant_id === tenantId);
        if (params?.search) {
            const q = params.search.toLowerCase();
            items = items.filter((p)=>p.name.toLowerCase().includes(q));
        }
        return paginate(items, params);
    }
    async getFiscalPeriod(id) {
        return this.fiscalPeriods.get(id) || null;
    }
    async upsertFiscalPeriod(p) {
        const existing = p.id ? this.fiscalPeriods.get(p.id) : undefined;
        if (existing) {
            Object.assign(existing, p, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newP = {
            id: p.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("fp_"),
            tenant_id: p.tenant_id || "",
            name: p.name || "",
            start_date: p.start_date || "",
            end_date: p.end_date || "",
            period_type: p.period_type || "monthly",
            status: p.status || "open",
            fiscal_year: p.fiscal_year || new Date().getFullYear(),
            closed_by: p.closed_by || null,
            closed_at: p.closed_at || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.fiscalPeriods.set(newP.id, newP);
        return newP;
    }
    async closeFiscalPeriod(id, closedBy) {
        const fp = this.fiscalPeriods.get(id);
        if (!fp) throw new Error(`FiscalPeriod ${id} not found`);
        fp.status = "closed";
        fp.closed_by = closedBy;
        fp.closed_at = new Date().toISOString();
        fp.updated_at = new Date().toISOString();
        return fp;
    }
    // ---- Journal Entries ----
    async listErpJournalEntries(tenantId, params) {
        let items = [
            ...this.erpJournalEntries.values()
        ].filter((e)=>e.tenant_id === tenantId);
        if (params?.search) {
            const q = params.search.toLowerCase();
            items = items.filter((e)=>e.entry_number.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
        }
        if (params?.filters) {
            for (const [k, v] of Object.entries(params.filters)){
                if (v !== undefined) items = items.filter((e)=>String(e[k]) === v);
            }
        }
        // Attach lines
        items = items.map((e)=>({
                ...e,
                lines: [
                    ...this.erpJournalLines.values()
                ].filter((l)=>l.journal_entry_id === e.id)
            }));
        return paginate(items, params);
    }
    async getErpJournalEntry(id) {
        const entry = this.erpJournalEntries.get(id);
        if (!entry) return null;
        return {
            ...entry,
            lines: [
                ...this.erpJournalLines.values()
            ].filter((l)=>l.journal_entry_id === id)
        };
    }
    async upsertErpJournalEntry(e) {
        const existing = e.id ? this.erpJournalEntries.get(e.id) : undefined;
        if (existing) {
            Object.assign(existing, e, {
                updated_at: new Date().toISOString()
            });
            // Update lines if provided
            if (e.lines) {
                // Remove old lines
                for (const [lid, line] of this.erpJournalLines){
                    if (line.journal_entry_id === existing.id) this.erpJournalLines.delete(lid);
                }
                // Add new lines
                let lineNum = 0;
                for (const l of e.lines){
                    lineNum++;
                    const newL = {
                        id: l.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("jl_"),
                        journal_entry_id: existing.id,
                        account_id: l.account_id || "",
                        line_number: l.line_number ?? lineNum,
                        description: l.description || null,
                        debit: l.debit ?? 0,
                        credit: l.credit ?? 0,
                        currency: l.currency || existing.currency,
                        partner_id: l.partner_id || null,
                        cost_center_id: l.cost_center_id || null,
                        created_at: new Date().toISOString()
                    };
                    this.erpJournalLines.set(newL.id, newL);
                }
                // Recalculate totals
                const allLines = [
                    ...this.erpJournalLines.values()
                ].filter((l)=>l.journal_entry_id === existing.id);
                existing.debit_total = allLines.reduce((s, l)=>s + l.debit, 0);
                existing.credit_total = allLines.reduce((s, l)=>s + l.credit, 0);
            }
            return existing;
        }
        this.journalEntryCounter++;
        const newE = {
            id: e.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("je_"),
            tenant_id: e.tenant_id || "",
            entry_number: e.entry_number || `JE-${String(this.journalEntryCounter).padStart(5, "0")}`,
            date: e.date || new Date().toISOString().slice(0, 10),
            description: e.description || "",
            reference_type: e.reference_type || null,
            reference_id: e.reference_id || null,
            fiscal_period_id: e.fiscal_period_id || null,
            status: e.status || "draft",
            source_type: e.source_type || "manual",
            debit_total: 0,
            credit_total: 0,
            currency: e.currency || "EUR",
            exchange_rate: e.exchange_rate ?? 1,
            notes: e.notes || null,
            created_by: e.created_by || "",
            posted_by: e.posted_by || null,
            posted_at: e.posted_at || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.erpJournalEntries.set(newE.id, newE);
        // Add lines if provided
        if (e.lines) {
            let lineNum = 0;
            for (const l of e.lines){
                lineNum++;
                const newL = {
                    id: l.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("jl_"),
                    journal_entry_id: newE.id,
                    account_id: l.account_id || "",
                    line_number: l.line_number ?? lineNum,
                    description: l.description || null,
                    debit: l.debit ?? 0,
                    credit: l.credit ?? 0,
                    currency: l.currency || newE.currency,
                    partner_id: l.partner_id || null,
                    cost_center_id: l.cost_center_id || null,
                    created_at: new Date().toISOString()
                };
                this.erpJournalLines.set(newL.id, newL);
            }
            const allLines = [
                ...this.erpJournalLines.values()
            ].filter((l)=>l.journal_entry_id === newE.id);
            newE.debit_total = allLines.reduce((s, l)=>s + l.debit, 0);
            newE.credit_total = allLines.reduce((s, l)=>s + l.credit, 0);
        }
        return newE;
    }
    async postErpJournalEntry(id, postedBy) {
        const entry = this.erpJournalEntries.get(id);
        if (!entry) throw new Error(`JournalEntry ${id} not found`);
        entry.status = "posted";
        entry.posted_by = postedBy;
        entry.posted_at = new Date().toISOString();
        entry.updated_at = new Date().toISOString();
        return entry;
    }
    async reverseErpJournalEntry(id, reversedBy) {
        const entry = this.erpJournalEntries.get(id);
        if (!entry) throw new Error(`JournalEntry ${id} not found`);
        entry.status = "reversed";
        entry.updated_at = new Date().toISOString();
        // Create a reversal entry
        const lines = [
            ...this.erpJournalLines.values()
        ].filter((l)=>l.journal_entry_id === id);
        this.journalEntryCounter++;
        const reversal = {
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("je_"),
            tenant_id: entry.tenant_id,
            entry_number: `JE-${String(this.journalEntryCounter).padStart(5, "0")}`,
            date: new Date().toISOString().slice(0, 10),
            description: `Reversal of ${entry.entry_number}`,
            reference_type: "manual",
            reference_id: id,
            fiscal_period_id: entry.fiscal_period_id,
            status: "posted",
            source_type: "auto",
            debit_total: entry.credit_total,
            credit_total: entry.debit_total,
            currency: entry.currency,
            exchange_rate: entry.exchange_rate,
            notes: `Reversed by ${reversedBy}`,
            created_by: reversedBy,
            posted_by: reversedBy,
            posted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.erpJournalEntries.set(reversal.id, reversal);
        // Create reversal lines (swap debit/credit)
        let lineNum = 0;
        for (const l of lines){
            lineNum++;
            const rl = {
                id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("jl_"),
                journal_entry_id: reversal.id,
                account_id: l.account_id,
                line_number: lineNum,
                description: l.description ? `Reversal: ${l.description}` : "Reversal",
                debit: l.credit,
                credit: l.debit,
                currency: l.currency,
                partner_id: l.partner_id,
                cost_center_id: l.cost_center_id,
                created_at: new Date().toISOString()
            };
            this.erpJournalLines.set(rl.id, rl);
        }
        return entry;
    }
    async deleteErpJournalEntry(id) {
        this.erpJournalEntries.delete(id);
        // Remove associated lines
        for (const [lid, line] of this.erpJournalLines){
            if (line.journal_entry_id === id) this.erpJournalLines.delete(lid);
        }
    }
    // ---- Cost Centers ----
    async listErpCostCenters(tenantId, params) {
        let items = [
            ...this.erpCostCenters.values()
        ].filter((c)=>c.tenant_id === tenantId);
        if (params?.search) {
            const q = params.search.toLowerCase();
            items = items.filter((c)=>c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
        }
        return paginate(items, params);
    }
    async upsertErpCostCenter(c) {
        const existing = c.id ? this.erpCostCenters.get(c.id) : undefined;
        if (existing) {
            Object.assign(existing, c, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newC = {
            id: c.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("cc_"),
            tenant_id: c.tenant_id || "",
            code: c.code || "",
            name: c.name || "",
            parent_id: c.parent_id || null,
            is_active: c.is_active ?? true,
            description: c.description || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.erpCostCenters.set(newC.id, newC);
        return newC;
    }
    async deleteErpCostCenter(id) {
        this.erpCostCenters.delete(id);
    }
    // ---- Bank Accounts ----
    async listErpBankAccounts(tenantId) {
        return [
            ...this.erpBankAccounts.values()
        ].filter((b)=>b.tenant_id === tenantId);
    }
    async upsertErpBankAccount(b) {
        const existing = b.id ? this.erpBankAccounts.get(b.id) : undefined;
        if (existing) {
            Object.assign(existing, b, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newB = {
            id: b.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("ba_"),
            tenant_id: b.tenant_id || "",
            account_id: b.account_id || "",
            bank_name: b.bank_name || "",
            account_number: b.account_number || "",
            iban: b.iban || null,
            swift_bic: b.swift_bic || null,
            currency: b.currency || "EUR",
            balance: b.balance ?? 0,
            is_active: b.is_active ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.erpBankAccounts.set(newB.id, newB);
        return newB;
    }
    async deleteErpBankAccount(id) {
        this.erpBankAccounts.delete(id);
    }
    // ---- Bank Transactions ----
    async listErpBankTransactions(tenantId, bankAccountId, params) {
        let items = [
            ...this.erpBankTransactions.values()
        ].filter((t)=>t.tenant_id === tenantId);
        if (bankAccountId) {
            items = items.filter((t)=>t.bank_account_id === bankAccountId);
        }
        if (params?.search) {
            const q = params.search.toLowerCase();
            items = items.filter((t)=>(t.description || "").toLowerCase().includes(q) || (t.reference || "").toLowerCase().includes(q));
        }
        return paginate(items, params);
    }
    async upsertErpBankTransaction(t) {
        const existing = t.id ? this.erpBankTransactions.get(t.id) : undefined;
        if (existing) {
            Object.assign(existing, t);
            return existing;
        }
        const newT = {
            id: t.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("bt_"),
            tenant_id: t.tenant_id || "",
            bank_account_id: t.bank_account_id || "",
            date: t.date || new Date().toISOString().slice(0, 10),
            amount: t.amount ?? 0,
            transaction_type: t.transaction_type || "credit",
            description: t.description || null,
            reference: t.reference || null,
            counterparty: t.counterparty || null,
            counterparty_account: t.counterparty_account || null,
            is_reconciled: t.is_reconciled ?? false,
            reconciled_with: t.reconciled_with || null,
            journal_entry_id: t.journal_entry_id || null,
            created_at: new Date().toISOString()
        };
        this.erpBankTransactions.set(newT.id, newT);
        return newT;
    }
    async reconcileBankTransaction(id, journalEntryId) {
        const tx = this.erpBankTransactions.get(id);
        if (!tx) throw new Error(`BankTransaction ${id} not found`);
        tx.is_reconciled = true;
        tx.reconciled_with = journalEntryId;
        tx.journal_entry_id = journalEntryId;
        return tx;
    }
    // ---- ERP Settings ----
    async getErpSettings(tenantId) {
        for (const s of this.erpSettings.values()){
            if (s.tenant_id === tenantId) return s;
        }
        return null;
    }
    async upsertErpSettings(s) {
        const existing = await this.getErpSettings(s.tenant_id);
        if (existing) {
            Object.assign(existing, s, {
                updated_at: new Date().toISOString()
            });
            return existing;
        }
        const newS = {
            id: s.id || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nid"]("es_"),
            tenant_id: s.tenant_id,
            accounting_standard: s.accounting_standard || "eu",
            fiscal_year_start: s.fiscal_year_start || "01-01",
            fiscal_year_end: s.fiscal_year_end || "12-31",
            default_currency: s.default_currency || "EUR",
            vat_enabled: s.vat_enabled ?? true,
            vat_rate: s.vat_rate ?? 20,
            vat_return_period: s.vat_return_period || "quarterly",
            auto_post_journal: s.auto_post_journal ?? false,
            revenue_account_id: s.revenue_account_id || null,
            expense_account_id: s.expense_account_id || null,
            receivable_account_id: s.receivable_account_id || null,
            payable_account_id: s.payable_account_id || null,
            vat_account_id: s.vat_account_id || null,
            bank_charges_account_id: s.bank_charges_account_id || null,
            cash_account_id: s.cash_account_id || null,
            retention_account_id: s.retention_account_id || null,
            round_off_account_id: s.round_off_account_id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.erpSettings.set(newS.id, newS);
        return newS;
    }
    // ---- ERP Reports ----
    async getTrialBalance(tenantId, asOfDate) {
        const accounts = [
            ...this.erpAccounts.values()
        ].filter((a)=>a.tenant_id === tenantId);
        const postedEntries = [
            ...this.erpJournalEntries.values()
        ].filter((e)=>e.tenant_id === tenantId && e.status === "posted" && e.date <= asOfDate);
        const postedEntryIds = new Set(postedEntries.map((e)=>e.id));
        const allLines = [
            ...this.erpJournalLines.values()
        ].filter((l)=>postedEntryIds.has(l.journal_entry_id));
        const items = accounts.map((acc)=>{
            const accLines = allLines.filter((l)=>l.account_id === acc.id);
            const debitTotal = accLines.reduce((s, l)=>s + l.debit, 0);
            const creditTotal = accLines.reduce((s, l)=>s + l.credit, 0);
            return {
                account_id: acc.id,
                account_code: acc.code,
                account_name: acc.name,
                account_type: acc.account_type,
                debit_total: debitTotal,
                credit_total: creditTotal,
                balance: debitTotal - creditTotal
            };
        });
        const totalDebit = items.reduce((s, i)=>s + i.debit_total, 0);
        const totalCredit = items.reduce((s, i)=>s + i.credit_total, 0);
        return {
            items,
            total_debit: totalDebit,
            total_credit: totalCredit,
            as_of_date: asOfDate
        };
    }
    async getBalanceSheet(tenantId, asOfDate) {
        const tb = await this.getTrialBalance(tenantId, asOfDate);
        const assets = [];
        const liabilities = [];
        const equity = [];
        for (const item of tb.items){
            const bsItem = {
                account_code: item.account_code,
                account_name: item.account_name,
                amount: item.balance
            };
            if (item.account_type === "asset") assets.push(bsItem);
            else if (item.account_type === "liability") liabilities.push(bsItem);
            else if (item.account_type === "equity") equity.push(bsItem);
        }
        const totalAssets = assets.reduce((s, i)=>s + i.amount, 0);
        const totalLiabilities = liabilities.reduce((s, i)=>s + i.amount, 0);
        const totalEquity = equity.reduce((s, i)=>s + i.amount, 0);
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
        const accounts = [
            ...this.erpAccounts.values()
        ].filter((a)=>a.tenant_id === tenantId);
        const postedEntries = [
            ...this.erpJournalEntries.values()
        ].filter((e)=>e.tenant_id === tenantId && e.status === "posted" && e.date >= periodStart && e.date <= periodEnd);
        const postedEntryIds = new Set(postedEntries.map((e)=>e.id));
        const allLines = [
            ...this.erpJournalLines.values()
        ].filter((l)=>postedEntryIds.has(l.journal_entry_id));
        const revenue = [];
        const expenses = [];
        for (const acc of accounts){
            const accLines = allLines.filter((l)=>l.account_id === acc.id);
            const debitTotal = accLines.reduce((s, l)=>s + l.debit, 0);
            const creditTotal = accLines.reduce((s, l)=>s + l.credit, 0);
            const balance = creditTotal - debitTotal; // revenue is credit-normal
            if (acc.account_type === "revenue" && balance !== 0) {
                revenue.push({
                    account_code: acc.code,
                    account_name: acc.name,
                    amount: balance
                });
            } else if (acc.account_type === "expense" && balance !== 0) {
                expenses.push({
                    account_code: acc.code,
                    account_name: acc.name,
                    amount: debitTotal - creditTotal
                }); // expense is debit-normal
            }
        }
        const totalRevenue = revenue.reduce((s, i)=>s + i.amount, 0);
        const totalExpenses = expenses.reduce((s, i)=>s + i.amount, 0);
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
        const account = this.erpAccounts.get(accountId);
        const accountCode = account?.code || "";
        const accountName = account?.name || "";
        let postedEntries = [
            ...this.erpJournalEntries.values()
        ].filter((e)=>e.tenant_id === tenantId && e.status === "posted");
        if (dateFrom) postedEntries = postedEntries.filter((e)=>e.date >= dateFrom);
        if (dateTo) postedEntries = postedEntries.filter((e)=>e.date <= dateTo);
        const postedEntryIds = new Set(postedEntries.map((e)=>e.id));
        const accLines = [
            ...this.erpJournalLines.values()
        ].filter((l)=>postedEntryIds.has(l.journal_entry_id) && l.account_id === accountId);
        // Sort by date then entry number
        const entryMap = new Map();
        for (const e of postedEntries)entryMap.set(e.id, e);
        const sortedLines = accLines.sort((a, b)=>{
            const ea = entryMap.get(a.journal_entry_id);
            const eb = entryMap.get(b.journal_entry_id);
            const da = ea?.date || "";
            const db = eb?.date || "";
            return da < db ? -1 : da > db ? 1 : 0;
        });
        let runningBalance = 0;
        const entries = sortedLines.map((l)=>{
            const je = entryMap.get(l.journal_entry_id);
            runningBalance += l.debit - l.credit;
            return {
                journal_entry_id: l.journal_entry_id,
                entry_number: je?.entry_number || "",
                date: je?.date || "",
                description: je?.description || "",
                debit: l.debit,
                credit: l.credit,
                balance: runningBalance,
                reference_type: je?.reference_type || null,
                reference_id: je?.reference_id || null
            };
        });
        const totalDebit = accLines.reduce((s, l)=>s + l.debit, 0);
        const totalCredit = accLines.reduce((s, l)=>s + l.credit, 0);
        return {
            account_id: accountId,
            account_code: accountCode,
            account_name: accountName,
            entries,
            opening_balance: 0,
            closing_balance: runningBalance,
            total_debit: totalDebit,
            total_credit: totalCredit
        };
    }
    // ---- Auto-journal from business events ----
    async autoJournalFromInvoice(invoiceId, tenantId, userId) {
        const invoice = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"].find((i)=>i.id === invoiceId);
        if (!invoice) return null;
        const settings = await this.getErpSettings(tenantId);
        const receivableAccountId = settings?.receivable_account_id || "acc_receivable";
        const revenueAccountId = settings?.revenue_account_id || "acc_revenue";
        const vatAccountId = settings?.vat_account_id || "acc_vat";
        const vatRate = settings?.vat_enabled ? (settings?.vat_rate ?? 0) / 100 : 0;
        const subtotal = invoice.total_amount / (1 + vatRate);
        const vatAmount = invoice.total_amount - subtotal;
        const lines = [
            {
                account_id: receivableAccountId,
                debit: invoice.total_amount,
                credit: 0,
                description: `Invoice ${invoice.invoice_number} - Receivable`
            },
            {
                account_id: revenueAccountId,
                debit: 0,
                credit: subtotal,
                description: `Invoice ${invoice.invoice_number} - Revenue`
            }
        ];
        if (vatAmount > 0) {
            lines.push({
                account_id: vatAccountId,
                debit: 0,
                credit: vatAmount,
                description: `Invoice ${invoice.invoice_number} - VAT`
            });
        }
        return this.upsertErpJournalEntry({
            tenant_id: tenantId,
            date: invoice.issue_date || new Date().toISOString().slice(0, 10),
            description: `Auto-journal for Invoice ${invoice.invoice_number}`,
            reference_type: "invoice",
            reference_id: invoiceId,
            status: settings?.auto_post_journal ? "posted" : "draft",
            source_type: "auto",
            currency: invoice.currency || "EUR",
            created_by: userId,
            lines
        });
    }
    async autoJournalFromDeal(dealId, tenantId, userId) {
        const deal = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deals"].find((d)=>d.id === dealId);
        if (!deal) return null;
        const settings = await this.getErpSettings(tenantId);
        const revenueAccountId = settings?.revenue_account_id || "acc_revenue";
        const receivableAccountId = settings?.receivable_account_id || "acc_receivable";
        const lines = [
            {
                account_id: receivableAccountId,
                debit: deal.value || 0,
                credit: 0,
                description: `Deal ${deal.title} - Receivable`
            },
            {
                account_id: revenueAccountId,
                debit: 0,
                credit: deal.value || 0,
                description: `Deal ${deal.title} - Revenue`
            }
        ];
        return this.upsertErpJournalEntry({
            tenant_id: tenantId,
            date: new Date().toISOString().slice(0, 10),
            description: `Auto-journal for Deal ${deal.title}`,
            reference_type: "deal",
            reference_id: dealId,
            status: settings?.auto_post_journal ? "posted" : "draft",
            source_type: "auto",
            currency: deal.currency || "EUR",
            created_by: userId,
            lines
        });
    }
    async autoJournalFromCommission(commissionId, tenantId, userId) {
        const commission = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dealCommissions"].find((c)=>c.id === commissionId);
        if (!commission) return null;
        const settings = await this.getErpSettings(tenantId);
        const expenseAccountId = settings?.expense_account_id || "acc_expense";
        const payableAccountId = settings?.payable_account_id || "acc_payable";
        const lines = [
            {
                account_id: expenseAccountId,
                debit: commission.calculated_commission,
                credit: 0,
                description: `Commission ${commissionId} - Expense`
            },
            {
                account_id: payableAccountId,
                debit: 0,
                credit: commission.calculated_commission,
                description: `Commission ${commissionId} - Payable`
            }
        ];
        return this.upsertErpJournalEntry({
            tenant_id: tenantId,
            date: new Date().toISOString().slice(0, 10),
            description: `Auto-journal for Commission ${commissionId}`,
            reference_type: "commission",
            reference_id: commissionId,
            status: settings?.auto_post_journal ? "posted" : "draft",
            source_type: "auto",
            currency: commission.commission_currency || "EUR",
            created_by: userId,
            lines
        });
    }
    // ---- user preferences ----
    userPreferences = new Map();
    async getUserPreference(userId, key) {
        return this.userPreferences.get(`${userId}:${key}`) || null;
    }
    async setUserPreference(userId, key, value) {
        const pref = {
            id: `up_${userId}_${key}`,
            user_id: userId,
            preference_key: key,
            preference_value: typeof value === "string" ? value : JSON.stringify(value),
            updated_at: new Date().toISOString()
        };
        this.userPreferences.set(`${userId}:${key}`, pref);
        return pref;
    }
    async listUserPreferences(userId) {
        return Array.from(this.userPreferences.values()).filter((p)=>p.user_id === userId).sort((a, b)=>a.preference_key.localeCompare(b.preference_key));
    }
}
}),
];

//# sourceMappingURL=src_lib_data_23a4ef44._.js.map
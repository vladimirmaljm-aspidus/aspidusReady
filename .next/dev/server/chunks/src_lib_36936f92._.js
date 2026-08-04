module.exports = [
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        'error',
        'warn'
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
}),
"[project]/src/lib/data/prisma-store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// PrismaStore — legacy implementation of the Store interface using Prisma/SQLite.
// NOTE: This store is DEPRECATED. The production runtime uses SupabaseStore
// (DB_BACKEND=supabase). This file is kept for dev/legacy reference and the
// Prisma schema has drifted from the multi-tenant types in supabase/types.ts.
// Type errors are suppressed intentionally to keep the legacy file importable.
// @ts-nocheck
__turbopack_context__.s([
    "PrismaStore",
    ()=>PrismaStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
// ─── Helpers ────────────────────────────────────────────────────────────────
function parseJSON(val, fallback) {
    if (!val) return fallback;
    try {
        return JSON.parse(val);
    } catch  {
        return fallback;
    }
}
function stringifyJSON(val) {
    if (val === null || val === undefined) return null;
    return JSON.stringify(val);
}
function dateToISO(d) {
    if (!d) return null;
    if (typeof d === "string") return d;
    return d.toISOString();
}
function dateToISOOrNow(d) {
    if (!d) return new Date().toISOString();
    if (typeof d === "string") return d;
    return d.toISOString();
}
function matchesSearch(haystack, needle) {
    if (!needle) return true;
    return haystack.toLowerCase().includes(needle.toLowerCase());
}
// ─── User row mapper ────────────────────────────────────────────────────────
function mapUserRow(r) {
    return {
        ...r,
        permissions: parseJSON(r.permissions, []),
        notif_prefs: parseJSON(r.notif_prefs, null),
        locked_until: dateToISO(r.locked_until),
        last_login_at: dateToISO(r.last_login_at),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at)
    };
}
function mapPartnerRow(r) {
    return {
        ...r,
        tags: parseJSON(r.tags, []),
        kyc_data: parseJSON(r.kyc_data, null),
        kyc_reviewed_at: dateToISO(r.kyc_reviewed_at),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at)
    };
}
function mapProductRow(r) {
    return {
        ...r,
        attributes: parseJSON(r.attributes, null),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at)
    };
}
function mapDealRow(r) {
    return {
        ...r,
        tags: parseJSON(r.tags, []),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at),
        expected_close: dateToISO(r.expected_close),
        closed_at: dateToISO(r.closed_at)
    };
}
function mapOfferRow(r) {
    return {
        ...r,
        items: parseJSON(r.items, []),
        terms: parseJSON(r.terms, null),
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
        selling_price: r.selling_price ?? null
    };
}
function mapDemandRow(r) {
    return {
        ...r,
        items: parseJSON(r.items, []),
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
        payment_terms: r.payment_terms ?? null
    };
}
function mapInvoiceRow(r) {
    return {
        ...r,
        items: parseJSON(r.items, []),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at),
        due_date: dateToISO(r.due_date),
        paid_at: dateToISO(r.paid_at),
        sent_at: dateToISO(r.sent_at)
    };
}
function mapProformaRow(r) {
    return {
        ...r,
        items: parseJSON(r.items, []),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at),
        valid_until: dateToISO(r.valid_until),
        paid_at: dateToISO(r.paid_at)
    };
}
function mapAuditLogRow(r) {
    return {
        ...r,
        details: parseJSON(r.details, null),
        created_at: dateToISOOrNow(r.created_at)
    };
}
function mapUserTaskRow(r) {
    return {
        ...r,
        due_date: dateToISO(r.due_date),
        completed_at: dateToISO(r.completed_at),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at)
    };
}
function mapDocumentRegisterRow(r) {
    return {
        ...r,
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at)
    };
}
function mapRevisionRow(r) {
    return {
        ...r,
        created_at: dateToISOOrNow(r.created_at)
    };
}
function mapSupplierOfferRow(r) {
    return {
        ...r,
        specifications: parseJSON(r.specifications, null),
        valid_until: dateToISO(r.valid_until),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at)
    };
}
function mapTradeCalcRow(r) {
    return {
        ...r,
        cost_lines: parseJSON(r.cost_lines, []),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at)
    };
}
function mapPortalAccessRow(r) {
    return {
        ...r,
        invited_at: dateToISO(r.invited_at),
        last_login: dateToISO(r.last_login),
        locked_until: dateToISO(r.locked_until),
        failed_attempts: r.failed_attempts ?? 0,
        token_version: r.token_version ?? 1,
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at)
    };
}
function mapKycRow(r) {
    return {
        ...r,
        data: parseJSON(r.data, null),
        reviewed_at: dateToISO(r.reviewed_at),
        submitted_at: dateToISO(r.submitted_at),
        created_at: dateToISOOrNow(r.created_at),
        updated_at: dateToISOOrNow(r.updated_at)
    };
}
function mapNotificationRow(r) {
    return {
        ...r,
        data: parseJSON(r.data, null),
        read_at: dateToISO(r.read_at),
        created_at: dateToISOOrNow(r.created_at)
    };
}
class PrismaStore {
    // ─── Auth ───────────────────────────────────────────────────────────────
    async getUserByUsername(username) {
        // username is not @unique in the schema (tenants may share usernames),
        // so use findFirst instead of findUnique to avoid a Prisma validation error.
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findFirst({
            where: {
                username
            }
        });
        return r ? mapUserRow(r) : null;
    }
    async getUserById(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
            where: {
                id
            }
        });
        return r ? mapUserRow(r) : null;
    }
    async listUsers(_tenantId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findMany({
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map(mapUserRow);
    }
    async upsertUser(u) {
        // Only set fields that are explicitly provided. Previously this method
        // always wrote every column (defaulting missing ones to "" / null / 0),
        // which clobbered password_hash when callers did partial updates like
        // { id, failed_attempts, locked_until }. Now undefined fields are skipped.
        const data = {};
        if (u.username !== undefined) data.username = u.username;
        if (u.email !== undefined) data.email = u.email;
        if (u.full_name !== undefined) data.full_name = u.full_name;
        if (u.role !== undefined) data.role = u.role;
        if (u.permissions !== undefined) data.permissions = stringifyJSON(u.permissions);
        if (u.password_hash !== undefined) data.password_hash = u.password_hash;
        if (u.totp_secret !== undefined) data.totp_secret = u.totp_secret;
        if (u.totp_enabled !== undefined) data.totp_enabled = u.totp_enabled;
        if (u.locked_until !== undefined) data.locked_until = u.locked_until ? new Date(u.locked_until) : null;
        if (u.failed_attempts !== undefined) data.failed_attempts = u.failed_attempts;
        if (u.last_login_at !== undefined) data.last_login_at = u.last_login_at ? new Date(u.last_login_at) : null;
        if (u.last_login_ip !== undefined) data.last_login_ip = u.last_login_ip;
        if (u.last_login_country !== undefined) data.last_login_country = u.last_login_country;
        if (u.must_change_password !== undefined) data.must_change_password = u.must_change_password;
        if (u.token_version !== undefined) data.token_version = u.token_version;
        if (u.signature !== undefined) data.signature = u.signature;
        if (u.notif_prefs !== undefined) data.notif_prefs = stringifyJSON(u.notif_prefs);
        if (u.active !== undefined) data.active = u.active;
        if (u.tenant_id !== undefined) data.tenant_id = u.tenant_id;
        let r;
        if (u.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.update({
                where: {
                    id: u.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.create({
                data
            });
        }
        return mapUserRow(r);
    }
    async deleteUser(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.delete({
            where: {
                id
            }
        });
    }
    async updateUserLastLogin(id, ip) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.update({
            where: {
                id
            },
            data: {
                last_login_at: new Date(),
                last_login_ip: ip
            }
        });
    }
    async bumpUserTokenVersion(id) {
        const u = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.update({
            where: {
                id
            },
            data: {
                token_version: {
                    increment: 1
                }
            }
        });
        return u.token_version;
    }
    // ─── Partners ───────────────────────────────────────────────────────────
    async listPartners(_tenantId, params) {
        let where = {};
        if (params?.filters?.status) where.status = params.filters.status;
        if (params?.filters?.type) where.type = params.filters.type;
        if (params?.search) {
            where.OR = [
                {
                    name: {
                        contains: params.search
                    }
                },
                {
                    email: {
                        contains: params.search
                    }
                },
                {
                    contact_name: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].partner.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].partner.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapPartnerRow),
            total
        };
    }
    async getPartner(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].partner.findUnique({
            where: {
                id
            }
        });
        return r ? mapPartnerRow(r) : null;
    }
    async upsertPartner(p) {
        const data = {
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
            kyc_reviewed_at: p.kyc_reviewed_at ? new Date(p.kyc_reviewed_at) : null
        };
        let r;
        if (p.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].partner.update({
                where: {
                    id: p.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].partner.create({
                data
            });
        }
        return mapPartnerRow(r);
    }
    async deletePartner(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].partner.delete({
            where: {
                id
            }
        });
    }
    // ─── Products ───────────────────────────────────────────────────────────
    async listProducts(_tenantId, params) {
        let where = {};
        if (params?.search) {
            where.OR = [
                {
                    name: {
                        contains: params.search
                    }
                },
                {
                    sku: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].product.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].product.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapProductRow),
            total
        };
    }
    async getProduct(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].product.findUnique({
            where: {
                id
            }
        });
        return r ? mapProductRow(r) : null;
    }
    async upsertProduct(p) {
        const data = {
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
            attributes: stringifyJSON(p.attributes)
        };
        let r;
        if (p.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].product.update({
                where: {
                    id: p.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].product.create({
                data
            });
        }
        return mapProductRow(r);
    }
    async deleteProduct(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].product.delete({
            where: {
                id
            }
        });
    }
    // ─── Deals ──────────────────────────────────────────────────────────────
    async listDeals(_tenantId, params) {
        let where = {};
        if (params?.filters?.stage) where.stage = params.filters.stage;
        if (params?.search) {
            where.OR = [
                {
                    title: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapDealRow),
            total
        };
    }
    async getDeal(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.findUnique({
            where: {
                id
            }
        });
        return r ? mapDealRow(r) : null;
    }
    async upsertDeal(d) {
        const data = {
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
            tags: stringifyJSON(d.tags)
        };
        let r;
        if (d.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.update({
                where: {
                    id: d.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.create({
                data
            });
        }
        return mapDealRow(r);
    }
    async deleteDeal(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.delete({
            where: {
                id
            }
        });
    }
    // ─── Offers ─────────────────────────────────────────────────────────────
    async listOffers(_tenantId, params) {
        let where = {};
        if (params?.filters?.partner_id) where.partner_id = params.filters.partner_id;
        if (params?.filters?.status) where.status = params.filters.status;
        if (params?.search) {
            where.OR = [
                {
                    number: {
                        contains: params.search
                    }
                },
                {
                    title: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].offer.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].offer.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapOfferRow),
            total
        };
    }
    async getOffer(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].offer.findUnique({
            where: {
                id
            }
        });
        return r ? mapOfferRow(r) : null;
    }
    async upsertOffer(o) {
        const data = {
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
            selling_price: o.selling_price ?? null
        };
        let r;
        if (o.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].offer.update({
                where: {
                    id: o.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].offer.create({
                data
            });
        }
        return mapOfferRow(r);
    }
    async deleteOffer(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].offer.delete({
            where: {
                id
            }
        });
    }
    // ─── Demands ────────────────────────────────────────────────────────────
    async listDemands(_tenantId, params) {
        let where = {};
        if (params?.filters?.status) where.status = params.filters.status;
        if (params?.search) {
            where.OR = [
                {
                    number: {
                        contains: params.search
                    }
                },
                {
                    subject: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].demand.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].demand.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapDemandRow),
            total
        };
    }
    async getDemand(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].demand.findUnique({
            where: {
                id
            }
        });
        return r ? mapDemandRow(r) : null;
    }
    async upsertDemand(d) {
        const data = {
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
            payment_terms: d.payment_terms ?? null
        };
        let r;
        if (d.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].demand.update({
                where: {
                    id: d.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].demand.create({
                data
            });
        }
        return mapDemandRow(r);
    }
    async deleteDemand(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].demand.delete({
            where: {
                id
            }
        });
    }
    // ─── Invoices ───────────────────────────────────────────────────────────
    async listInvoices(tenantId, params) {
        let where = {
            tenant_id: tenantId
        };
        if (params?.filters?.status) where.status = params.filters.status;
        if (params?.filters?.partner_id) where.partner_id = params.filters.partner_id;
        if (params?.search) {
            where.OR = [
                {
                    number: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoice.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoice.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapInvoiceRow),
            total
        };
    }
    async getInvoice(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoice.findUnique({
            where: {
                id
            }
        });
        return r ? mapInvoiceRow(r) : null;
    }
    async upsertInvoice(i) {
        const data = {
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
            payment_terms: i.payment_terms ?? null
        };
        let r;
        if (i.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoice.update({
                where: {
                    id: i.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoice.create({
                data
            });
        }
        return mapInvoiceRow(r);
    }
    async deleteInvoice(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoice.delete({
            where: {
                id
            }
        });
    }
    // ─── Proformas ──────────────────────────────────────────────────────────
    async listProformas(tenantId, params) {
        let where = {
            tenant_id: tenantId
        };
        if (params?.filters?.status) where.status = params.filters.status;
        if (params?.search) {
            where.OR = [
                {
                    number: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].proforma.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].proforma.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapProformaRow),
            total
        };
    }
    async getProforma(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].proforma.findUnique({
            where: {
                id
            }
        });
        return r ? mapProformaRow(r) : null;
    }
    async upsertProforma(p) {
        const data = {
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
            notes: p.notes ?? null
        };
        let r;
        if (p.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].proforma.update({
                where: {
                    id: p.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].proforma.create({
                data
            });
        }
        return mapProformaRow(r);
    }
    async deleteProforma(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].proforma.delete({
            where: {
                id
            }
        });
    }
    // ─── Shared Documents ───────────────────────────────────────────────────
    async listDocuments(_tenantId, params) {
        let where = {};
        if (params?.search) {
            where.OR = [
                {
                    filename: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].sharedDocument.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].sharedDocument.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map((r)=>({
                    ...r,
                    created_at: dateToISOOrNow(r.created_at)
                })),
            total
        };
    }
    async getDocument(id) {
        const row = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].sharedDocument.findUnique({
            where: {
                id
            }
        });
        return row ? {
            ...row,
            created_at: dateToISOOrNow(row.created_at)
        } : null;
    }
    async upsertDocument(d) {
        const data = {
            tenant_id: d.tenant_id ?? "",
            partner_id: d.partner_id ?? null,
            uploaded_by: d.uploaded_by ?? null,
            filename: d.filename ?? "",
            file_type: d.file_type ?? null,
            file_size: d.file_size ?? null,
            url: d.url ?? null,
            category: d.category ?? null,
            visibility: d.visibility ?? "private",
            description: d.description ?? null
        };
        let r;
        if (d.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].sharedDocument.update({
                where: {
                    id: d.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].sharedDocument.create({
                data
            });
        }
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at)
        };
    }
    async deleteDocument(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].sharedDocument.delete({
            where: {
                id
            }
        });
    }
    // ─── Document Register ──────────────────────────────────────────────────
    async listDocumentRegister(_tenantId, params) {
        let where = {};
        if (params?.search) {
            where.OR = [
                {
                    title: {
                        contains: params.search
                    }
                },
                {
                    doc_type: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentRegisterEntry.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentRegisterEntry.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapDocumentRegisterRow),
            total
        };
    }
    async upsertDocumentRegisterEntry(e) {
        const data = {
            tenant_id: e.tenant_id ?? "",
            partner_id: e.partner_id ?? null,
            doc_type: e.doc_type ?? "offer",
            source_id: e.source_id ?? null,
            title: e.title ?? "",
            version: e.version ?? 1,
            status: e.status ?? "current",
            file_url: e.file_url ?? null,
            created_by: e.created_by ?? null
        };
        let r;
        if (e.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentRegisterEntry.update({
                where: {
                    id: e.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentRegisterEntry.create({
                data
            });
        }
        return mapDocumentRegisterRow(r);
    }
    async listDocumentRevisions(documentId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentRevision.findMany({
            where: {
                document_id: documentId
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map(mapRevisionRow);
    }
    async addDocumentRevision(r) {
        const row = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentRevision.create({
            data: {
                document_id: r.document_id ?? "",
                version: r.version ?? 1,
                file_url: r.file_url ?? null,
                change_summary: r.change_summary ?? null,
                created_by: r.created_by ?? null
            }
        });
        return mapRevisionRow(row);
    }
    async deleteDocumentRegisterEntry(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentRegisterEntry.delete({
            where: {
                id
            }
        });
    }
    // ─── Audit ──────────────────────────────────────────────────────────────
    async listAudit(_tenantId, params) {
        let where = {};
        if (params?.search) {
            where.OR = [
                {
                    action: {
                        contains: params.search
                    }
                },
                {
                    username: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].auditLog.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].auditLog.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapAuditLogRow),
            total
        };
    }
    async appendAudit(entry) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].auditLog.create({
            data: {
                user_id: entry.user_id ?? null,
                username: entry.username ?? null,
                action: entry.action,
                entity_type: entry.entity_type ?? null,
                entity_id: entry.entity_id ?? null,
                details: stringifyJSON(entry.details),
                ip: entry.ip ?? null,
                user_agent: entry.user_agent ?? null
            }
        });
        return mapAuditLogRow(r);
    }
    // ─── Settings ───────────────────────────────────────────────────────────
    async getSetting(key) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].setting.findUnique({
            where: {
                key
            }
        });
        if (!r) return null;
        try {
            return JSON.parse(r.value);
        } catch  {
            return r.value;
        }
    }
    async setSetting(key, value) {
        const val = typeof value === "string" ? value : JSON.stringify(value);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].setting.upsert({
            where: {
                key
            },
            update: {
                value: val
            },
            create: {
                key,
                value: val
            }
        });
    }
    async getAllSettings() {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].setting.findMany();
        return rows.map((r)=>({
                ...r,
                created_at: dateToISOOrNow(r.created_at),
                updated_at: dateToISOOrNow(r.updated_at)
            }));
    }
    // ─── Tasks ──────────────────────────────────────────────────────────────
    async listTasks(_tenantId, userId) {
        const where = userId ? {
            assigned_to: userId
        } : {};
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].userTask.findMany({
            where,
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map(mapUserTaskRow);
    }
    async upsertTask(t) {
        const data = {
            tenant_id: t.tenant_id ?? "",
            title: t.title ?? "",
            description: t.description ?? null,
            assigned_to: t.assigned_to ?? null,
            priority: t.priority ?? "medium",
            status: t.status ?? "pending",
            due_date: t.due_date ? new Date(t.due_date) : null,
            completed_at: t.completed_at ? new Date(t.completed_at) : null,
            entity_type: t.entity_type ?? null,
            entity_id: t.entity_id ?? null
        };
        let r;
        if (t.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].userTask.update({
                where: {
                    id: t.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].userTask.create({
                data
            });
        }
        return mapUserTaskRow(r);
    }
    async deleteTask(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].userTask.delete({
            where: {
                id
            }
        });
    }
    // ─── Notes ──────────────────────────────────────────────────────────────
    async listNotes(_tenantId, entityType, entityId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].entityNote.findMany({
            where: {
                entity_type: entityType,
                entity_id: entityId
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                created_at: dateToISOOrNow(r.created_at),
                updated_at: dateToISOOrNow(r.updated_at)
            }));
    }
    async upsertNote(n) {
        const data = {
            entity_type: n.entity_type ?? "",
            entity_id: n.entity_id ?? "",
            user_id: n.user_id ?? null,
            content: n.content ?? ""
        };
        let r;
        if (n.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].entityNote.update({
                where: {
                    id: n.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].entityNote.create({
                data
            });
        }
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async deleteNote(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].entityNote.delete({
            where: {
                id
            }
        });
    }
    // ─── Inventory ──────────────────────────────────────────────────────────
    async listInventory(_tenantId, partnerId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].inventoryMovement.findMany({
            where: {
                partner_id: partnerId
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                created_at: dateToISOOrNow(r.created_at)
            }));
    }
    async listAllInventory(_tenantId, params) {
        let where = {};
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].inventoryMovement.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].inventoryMovement.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map((r)=>({
                    ...r,
                    created_at: dateToISOOrNow(r.created_at)
                })),
            total
        };
    }
    async addInventoryMovement(m) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].inventoryMovement.create({
            data: {
                tenant_id: m.tenant_id ?? "",
                product_id: m.product_id ?? "",
                partner_id: m.partner_id ?? "",
                type: m.type ?? "inbound",
                quantity: m.quantity ?? 0,
                delta: m.delta ?? 0,
                reference: m.reference ?? null,
                notes: m.notes ?? null
            }
        });
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at)
        };
    }
    // ─── Vault ──────────────────────────────────────────────────────────────
    async listVault(_tenantId, params) {
        let where = {};
        if (params?.search) {
            where.OR = [
                {
                    name: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].vaultSecret.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].vaultSecret.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map((r)=>({
                    ...r,
                    created_at: dateToISOOrNow(r.created_at),
                    updated_at: dateToISOOrNow(r.updated_at)
                })),
            total
        };
    }
    async upsertVaultSecret(s) {
        const data = {
            tenant_id: s.tenant_id ?? "",
            name: s.name ?? "",
            type: s.type ?? "other",
            value_encrypted: s.value_encrypted ?? "",
            metadata: s.metadata ?? null
        };
        let r;
        if (s.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].vaultSecret.update({
                where: {
                    id: s.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].vaultSecret.create({
                data
            });
        }
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async deleteVaultSecret(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].vaultSecret.delete({
            where: {
                id
            }
        });
    }
    // ─── API Keys ───────────────────────────────────────────────────────────
    async listApiKeys(_tenantId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].apiKey.findMany({
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                created_at: dateToISOOrNow(r.created_at),
                updated_at: dateToISOOrNow(r.updated_at)
            }));
    }
    async upsertApiKey(k) {
        const data = {
            tenant_id: k.tenant_id ?? "",
            name: k.name ?? "",
            key_hash: k.key_hash ?? "",
            prefix: k.prefix ?? "",
            permissions: stringifyJSON(k.permissions),
            last_used_at: k.last_used_at ? new Date(k.last_used_at) : null,
            expires_at: k.expires_at ? new Date(k.expires_at) : null,
            active: k.active ?? true
        };
        let r;
        if (k.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].apiKey.update({
                where: {
                    id: k.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].apiKey.create({
                data
            });
        }
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async deleteApiKey(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].apiKey.delete({
            where: {
                id
            }
        });
    }
    async authenticateApiKey(_rawKey) {
        return null;
    }
    async updateApiKeyLastUsed(_id, _ip) {}
    // ─── Webhooks ───────────────────────────────────────────────────────────
    async listWebhooks(_tenantId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].webhook.findMany({
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                created_at: dateToISOOrNow(r.created_at),
                updated_at: dateToISOOrNow(r.updated_at)
            }));
    }
    async upsertWebhook(w) {
        const data = {
            tenant_id: w.tenant_id ?? "",
            name: w.name ?? "",
            url: w.url ?? "",
            events: stringifyJSON(w.events) ?? "[]",
            secret: w.secret ?? null,
            active: w.active ?? true,
            last_triggered_at: w.last_triggered_at ? new Date(w.last_triggered_at) : null
        };
        let r;
        if (w.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].webhook.update({
                where: {
                    id: w.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].webhook.create({
                data
            });
        }
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async deleteWebhook(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].webhook.delete({
            where: {
                id
            }
        });
    }
    // ─── Security ───────────────────────────────────────────────────────────
    async listSessions(_tenantId, userId) {
        const where = userId ? {
            user_id: userId
        } : {};
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].securitySession.findMany({
            where,
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                last_used_at: dateToISO(r.last_used_at),
                expires_at: dateToISO(r.expires_at),
                created_at: dateToISOOrNow(r.created_at)
            }));
    }
    async revokeSession(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].securitySession.update({
            where: {
                id
            },
            data: {
                revoked: true,
                current: false
            }
        });
    }
    async revokeSessionById(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].securitySession.update({
            where: {
                id
            },
            data: {
                revoked: true,
                current: false
            }
        });
    }
    async createSession(s) {
        // If current=true, unset any other current sessions for this user first
        if (s.current) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].securitySession.updateMany({
                where: {
                    user_id: s.user_id,
                    current: true
                },
                data: {
                    current: false
                }
            });
        }
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].securitySession.create({
            data: {
                user_id: s.user_id,
                ip: s.ip ?? null,
                user_agent: s.user_agent ?? null,
                country: s.country ?? null,
                expires_at: new Date(s.expires_at),
                current: s.current ?? false,
                revoked: false,
                last_used_at: new Date()
            }
        });
        return {
            ...r,
            last_used_at: dateToISO(r.last_used_at),
            expires_at: dateToISO(r.expires_at),
            created_at: dateToISOOrNow(r.created_at)
        };
    }
    async touchSession(id) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].securitySession.update({
                where: {
                    id
                },
                data: {
                    last_used_at: new Date()
                }
            });
        } catch  {}
    }
    async listLoginHistory(_tenantId, userId, limit) {
        const where = userId ? {
            user_id: userId
        } : {};
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].loginHistoryEntry.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            take: limit ?? 50
        });
        return rows.map((r)=>({
                ...r,
                created_at: dateToISOOrNow(r.created_at)
            }));
    }
    async recordLoginHistory(e) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].loginHistoryEntry.create({
            data: {
                user_id: e.user_id,
                username: e.username,
                ip: e.ip ?? null,
                user_agent: e.user_agent ?? null,
                country: e.country ?? null,
                success: e.success,
                reason: e.reason ?? null
            }
        });
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at)
        };
    }
    async listKnownIps(_tenantId, userId) {
        const where = userId ? {
            user_id: userId
        } : {};
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].knownIp.findMany({
            where,
            orderBy: {
                last_seen: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                first_seen: dateToISOOrNow(r.first_seen),
                last_seen: dateToISOOrNow(r.last_seen)
            }));
    }
    async trustIp(id, trusted) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].knownIp.update({
            where: {
                id
            },
            data: {
                trusted
            }
        });
    }
    async forgetIp(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].knownIp.delete({
            where: {
                id
            }
        });
    }
    async upsertKnownIp(ip) {
        // Find existing by user_id + ip
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].knownIp.findFirst({
            where: {
                user_id: ip.user_id,
                ip: ip.ip
            }
        });
        if (existing) {
            const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].knownIp.update({
                where: {
                    id: existing.id
                },
                data: {
                    last_seen: new Date(),
                    country: ip.country ?? existing.country,
                    trusted: ip.trusted ?? existing.trusted
                }
            });
            return {
                ...r,
                first_seen: dateToISOOrNow(r.first_seen),
                last_seen: dateToISOOrNow(r.last_seen)
            };
        }
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].knownIp.create({
            data: {
                user_id: ip.user_id,
                ip: ip.ip,
                country: ip.country ?? null,
                trusted: ip.trusted ?? false
            }
        });
        return {
            ...r,
            first_seen: dateToISOOrNow(r.first_seen),
            last_seen: dateToISOOrNow(r.last_seen)
        };
    }
    async listTrustedDevices(_tenantId, userId) {
        const where = userId ? {
            user_id: userId
        } : {};
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].trustedDevice.findMany({
            where,
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                last_used: dateToISOOrNow(r.last_used),
                created_at: dateToISOOrNow(r.created_at)
            }));
    }
    async revokeTrustedDevice(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].trustedDevice.update({
            where: {
                id
            },
            data: {
                revoked: true
            }
        });
    }
    async revokeTrustedDeviceById(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].trustedDevice.update({
            where: {
                id
            },
            data: {
                revoked: true
            }
        });
    }
    async upsertTrustedDevice(d) {
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].trustedDevice.findFirst({
            where: {
                user_id: d.user_id,
                fingerprint: d.fingerprint
            }
        });
        if (existing) {
            const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].trustedDevice.update({
                where: {
                    id: existing.id
                },
                data: {
                    last_used: new Date(),
                    ip: d.ip ?? existing.ip,
                    device_name: d.device_name || existing.device_name
                }
            });
            return {
                ...r,
                last_used: dateToISOOrNow(r.last_used),
                created_at: dateToISOOrNow(r.created_at)
            };
        }
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].trustedDevice.create({
            data: {
                user_id: d.user_id,
                device_name: d.device_name,
                fingerprint: d.fingerprint,
                ip: d.ip ?? null
            }
        });
        return {
            ...r,
            last_used: dateToISOOrNow(r.last_used),
            created_at: dateToISOOrNow(r.created_at)
        };
    }
    // ─── Mail Queue ─────────────────────────────────────────────────────────
    async listMailQueue(_tenantId, params) {
        let where = {};
        if (params?.search) {
            where.OR = [
                {
                    to: {
                        contains: params.search
                    }
                },
                {
                    subject: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].mailQueueEntry.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].mailQueueEntry.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map((r)=>({
                    ...r,
                    created_at: dateToISOOrNow(r.created_at),
                    sent_at: dateToISO(r.sent_at),
                    updated_at: dateToISOOrNow(r.updated_at)
                })),
            total
        };
    }
    async upsertMailQueueEntry(m) {
        const data = {
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
            sent_at: m.sent_at ? new Date(m.sent_at) : null
        };
        let r;
        if (m.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].mailQueueEntry.update({
                where: {
                    id: m.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].mailQueueEntry.create({
                data
            });
        }
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            sent_at: dateToISO(r.sent_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async deleteMailQueueEntry(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].mailQueueEntry.delete({
            where: {
                id
            }
        });
    }
    // ─── Tenants ────────────────────────────────────────────────────────────
    async listTenants() {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenant.findMany({
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                created_at: dateToISOOrNow(r.created_at),
                updated_at: dateToISOOrNow(r.updated_at)
            }));
    }
    async getTenant(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenant.findUnique({
            where: {
                id
            }
        });
        return r ? {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        } : null;
    }
    async upsertTenant(t) {
        const data = {
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
            max_users: t.max_users ?? 5
        };
        let r;
        if (t.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenant.update({
                where: {
                    id: t.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenant.create({
                data
            });
        }
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async deleteTenant(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenant.delete({
            where: {
                id
            }
        });
    }
    // ─── Product Catalog ────────────────────────────────────────────────────
    async listProductCatalog(tenantId, params) {
        let where = {
            tenant_id: tenantId
        };
        if (params?.search) {
            where.OR = [
                {
                    name: {
                        contains: params.search
                    }
                },
                {
                    hs_code: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].productCatalogEntry.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].productCatalogEntry.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map((r)=>({
                    ...r,
                    specifications: parseJSON(r.specifications, null),
                    created_at: dateToISOOrNow(r.created_at),
                    updated_at: dateToISOOrNow(r.updated_at)
                })),
            total
        };
    }
    async getProductCatalogEntry(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].productCatalogEntry.findUnique({
            where: {
                id
            }
        });
        return r ? {
            ...r,
            specifications: parseJSON(r.specifications, null),
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        } : null;
    }
    async upsertProductCatalogEntry(p) {
        const data = {
            tenant_id: p.tenant_id ?? "",
            name: p.name ?? "",
            hs_code: p.hs_code ?? null,
            category: p.category ?? null,
            origin_country: p.origin_country ?? null,
            unit: p.unit ?? "MT",
            base_price: p.base_price ?? 0,
            currency: p.currency ?? "USD",
            specifications: stringifyJSON(p.specifications),
            active: p.active ?? true
        };
        let r;
        if (p.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].productCatalogEntry.update({
                where: {
                    id: p.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].productCatalogEntry.create({
                data
            });
        }
        return {
            ...r,
            specifications: parseJSON(r.specifications, null),
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async deleteProductCatalogEntry(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].productCatalogEntry.delete({
            where: {
                id
            }
        });
    }
    // ─── Supplier Offers ────────────────────────────────────────────────────
    async listSupplierOffers(tenantId, params) {
        let where = {
            tenant_id: tenantId
        };
        if (params?.search) {
            where.OR = [
                {
                    name: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].supplierOffer.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].supplierOffer.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapSupplierOfferRow),
            total
        };
    }
    async getSupplierOffer(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].supplierOffer.findUnique({
            where: {
                id
            }
        });
        return r ? mapSupplierOfferRow(r) : null;
    }
    async upsertSupplierOffer(s) {
        const data = {
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
            status: s.status ?? "active"
        };
        let r;
        if (s.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].supplierOffer.update({
                where: {
                    id: s.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].supplierOffer.create({
                data
            });
        }
        return mapSupplierOfferRow(r);
    }
    async deleteSupplierOffer(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].supplierOffer.delete({
            where: {
                id
            }
        });
    }
    // ─── Trade Calculations ─────────────────────────────────────────────────
    async listTradeCalculations(tenantId, params) {
        let where = {
            tenant_id: tenantId
        };
        if (params?.search) {
            where.OR = [
                {
                    name: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tradeCalculation.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tradeCalculation.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapTradeCalcRow),
            total
        };
    }
    async getTradeCalculation(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tradeCalculation.findUnique({
            where: {
                id
            }
        });
        return r ? mapTradeCalcRow(r) : null;
    }
    async upsertTradeCalculation(t) {
        const data = {
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
            created_by: t.created_by ?? null
        };
        let r;
        if (t.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tradeCalculation.update({
                where: {
                    id: t.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tradeCalculation.create({
                data
            });
        }
        return mapTradeCalcRow(r);
    }
    async deleteTradeCalculation(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tradeCalculation.delete({
            where: {
                id
            }
        });
    }
    // ─── Portal Access ──────────────────────────────────────────────────────
    async getPortalAccessByPartner(partnerId) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalAccess.findFirst({
            where: {
                partner_id: partnerId
            }
        });
        return r ? mapPortalAccessRow(r) : null;
    }
    async getPortalAccessByEmail(tenantId, email) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalAccess.findFirst({
            where: {
                tenant_id: tenantId,
                portal_email: email
            }
        });
        return r ? mapPortalAccessRow(r) : null;
    }
    async getPortalAccessById(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalAccess.findUnique({
            where: {
                id
            }
        });
        return r ? mapPortalAccessRow(r) : null;
    }
    async listPortalAccess(tenantId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalAccess.findMany({
            where: {
                tenant_id: tenantId
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map(mapPortalAccessRow);
    }
    async upsertPortalAccess(p) {
        const data = {
            tenant_id: p.tenant_id ?? "",
            partner_id: p.partner_id ?? "",
            tier: p.tier ?? "standard",
            // Feature flags
            can_view_offers: p.can_view_offers ?? false,
            can_view_documents: p.can_view_documents ?? false,
            can_view_catalog: p.can_view_catalog ?? false,
            can_view_invoices: p.can_view_invoices ?? false,
            can_view_profile: p.can_view_profile ?? true,
            can_view_company_info: p.can_view_company_info ?? false,
            can_submit_rfq: p.can_submit_rfq ?? false,
            can_download_pdf: p.can_download_pdf ?? false,
            // Compliance exemptions
            exempt_kyc: p.exempt_kyc ?? false,
            exempt_document_upload: p.exempt_document_upload ?? false,
            exempt_location_share: p.exempt_location_share ?? false,
            // Onboarding status
            status: p.status ?? "pending_approval",
            approved_by: p.approved_by ?? null,
            approved_at: p.approved_at ? new Date(p.approved_at) : null,
            invited_at: p.invited_at ? new Date(p.invited_at) : null,
            welcome_email_sent: p.welcome_email_sent ?? false,
            // Access credentials
            portal_email: p.portal_email ?? null,
            password_hash: p.password_hash ?? null,
            must_set_password: p.must_set_password ?? true,
            // Last login
            last_login_at: p.last_login_at ? new Date(p.last_login_at) : null,
            last_login_ip: p.last_login_ip ?? null,
            // Security
            locked_until: p.locked_until ? new Date(p.locked_until) : null,
            failed_attempts: p.failed_attempts ?? 0,
            token_version: p.token_version ?? 1
        };
        let r;
        if (p.id) {
            // Only update fields that are explicitly provided (not undefined)
            const cleanData = {};
            for (const [k, v] of Object.entries(data)){
                if (p[k] !== undefined) cleanData[k] = v;
            }
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalAccess.update({
                where: {
                    id: p.id
                },
                data: cleanData
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalAccess.create({
                data
            });
        }
        return mapPortalAccessRow(r);
    }
    async deletePortalAccess(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalAccess.delete({
            where: {
                id
            }
        });
    }
    async verifyPortalCredentials(tenantId, email, password) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalAccess.findFirst({
            where: {
                tenant_id: tenantId,
                portal_email: email
            }
        });
        if (!r) return null;
        if (!r.password_hash) return null;
        const { verifyPassword } = await __turbopack_context__.A("[project]/src/lib/auth/password.ts [app-route] (ecmascript, async loader)");
        const ok = await verifyPassword(password, r.password_hash);
        return ok ? mapPortalAccessRow(r) : null;
    }
    async verifyPortalCredentialsByEmail(email, password) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalAccess.findFirst({
            where: {
                portal_email: email
            }
        });
        if (!r) return null;
        if (!r.password_hash) return null;
        if (r.status !== "active") return null;
        const { verifyPassword } = await __turbopack_context__.A("[project]/src/lib/auth/password.ts [app-route] (ecmascript, async loader)");
        const ok = await verifyPassword(password, r.password_hash);
        return ok ? mapPortalAccessRow(r) : null;
    }
    // ─── Document Templates ─────────────────────────────────────────────────
    async listDocumentTemplates(tenantId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.findMany({
            where: {
                tenant_id: tenantId
            },
            orderBy: {
                created_at: "desc"
            },
            include: {
                letterhead: true,
                seal: true
            }
        });
        return rows.map((r)=>({
                ...r,
                created_at: dateToISOOrNow(r.created_at),
                updated_at: dateToISOOrNow(r.updated_at),
                letterhead: r.letterhead ? this._mapLetterhead(r.letterhead) : null,
                seal: r.seal ? this._mapSeal(r.seal) : null
            }));
    }
    async getDocumentTemplate(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.findUnique({
            where: {
                id
            },
            include: {
                letterhead: true,
                seal: true
            }
        });
        if (!r) return null;
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at),
            letterhead: r.letterhead ? this._mapLetterhead(r.letterhead) : null,
            seal: r.seal ? this._mapSeal(r.seal) : null
        };
    }
    async getDefaultDocumentTemplate(tenantId, type) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.findFirst({
            where: {
                tenant_id: tenantId,
                type,
                is_default: true
            },
            include: {
                letterhead: true,
                seal: true
            }
        });
        if (!r) return null;
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at),
            letterhead: r.letterhead ? this._mapLetterhead(r.letterhead) : null,
            seal: r.seal ? this._mapSeal(r.seal) : null
        };
    }
    async upsertDocumentTemplate(t) {
        // If setting as default, unset other defaults of the same type for this tenant
        if (t.is_default && t.tenant_id && t.type && !t.id) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.updateMany({
                where: {
                    tenant_id: t.tenant_id,
                    type: t.type,
                    is_default: true
                },
                data: {
                    is_default: false
                }
            });
        } else if (t.is_default && t.id) {
            const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.findUnique({
                where: {
                    id: t.id
                }
            });
            if (existing) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.updateMany({
                    where: {
                        tenant_id: existing.tenant_id,
                        type: existing.type,
                        is_default: true,
                        id: {
                            not: t.id
                        }
                    },
                    data: {
                        is_default: false
                    }
                });
            }
        }
        const data = {
            tenant_id: t.tenant_id,
            name: t.name,
            type: t.type,
            is_default: t.is_default,
            created_by: t.created_by,
            // Page layout
            page_size: t.page_size,
            page_margin_top: t.page_margin_top,
            page_margin_bottom: t.page_margin_bottom,
            page_margin_left: t.page_margin_left,
            page_margin_right: t.page_margin_right,
            // Header
            header_enabled: t.header_enabled,
            header_height: t.header_height,
            header_content: t.header_content,
            header_show_logo: t.header_show_logo,
            header_show_company_name: t.header_show_company_name,
            header_show_contact: t.header_show_contact,
            // Footer
            footer_enabled: t.footer_enabled,
            footer_height: t.footer_height,
            footer_content: t.footer_content,
            footer_show_page_number: t.footer_show_page_number,
            footer_show_bank_details: t.footer_show_bank_details,
            footer_show_tax_id: t.footer_show_tax_id,
            // Body styling
            body_font_family: t.body_font_family,
            body_font_size: t.body_font_size,
            body_line_height: t.body_line_height,
            primary_color: t.primary_color,
            accent_color: t.accent_color,
            // Table styling
            table_header_bg: t.table_header_bg,
            table_header_color: t.table_header_color,
            table_border_color: t.table_border_color,
            table_stripe: t.table_stripe,
            // Branding links
            letterhead_id: t.letterhead_id === undefined ? undefined : t.letterhead_id,
            seal_id: t.seal_id === undefined ? undefined : t.seal_id,
            seal_enabled: t.seal_enabled
        };
        // Strip undefined values so Prisma doesn't overwrite with null on update
        Object.keys(data).forEach((k)=>data[k] === undefined && delete data[k]);
        let r;
        if (t.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.update({
                where: {
                    id: t.id
                },
                data,
                include: {
                    letterhead: true,
                    seal: true
                }
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.create({
                data,
                include: {
                    letterhead: true,
                    seal: true
                }
            });
        }
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at),
            letterhead: r.letterhead ? this._mapLetterhead(r.letterhead) : null,
            seal: r.seal ? this._mapSeal(r.seal) : null
        };
    }
    async deleteDocumentTemplate(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.delete({
            where: {
                id
            }
        });
    }
    // ─── Tenant Letterheads (Memorandum firme) ──────────────────────────────
    _mapLetterhead(r) {
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async listLetterheads(tenantId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantLetterhead.findMany({
            where: {
                tenant_id: tenantId
            },
            orderBy: [
                {
                    is_default: "desc"
                },
                {
                    created_at: "desc"
                }
            ]
        });
        return rows.map((r)=>this._mapLetterhead(r));
    }
    async getLetterhead(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantLetterhead.findUnique({
            where: {
                id
            }
        });
        return r ? this._mapLetterhead(r) : null;
    }
    async getDefaultLetterhead(tenantId) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantLetterhead.findFirst({
            where: {
                tenant_id: tenantId,
                is_default: true
            }
        });
        return r ? this._mapLetterhead(r) : null;
    }
    async upsertLetterhead(l) {
        // If setting as default, unset other defaults for this tenant
        if (l.is_default) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantLetterhead.updateMany({
                where: {
                    tenant_id: l.tenant_id,
                    is_default: true,
                    id: l.id ? {
                        not: l.id
                    } : undefined
                },
                data: {
                    is_default: false
                }
            });
        }
        const data = {
            tenant_id: l.tenant_id,
            name: l.name,
            is_default: l.is_default,
            company_name: l.company_name,
            company_legal_name: l.company_legal_name,
            company_address_line: l.company_address_line,
            company_city: l.company_city,
            company_postal_code: l.company_postal_code,
            company_country: l.company_country,
            company_email: l.company_email,
            company_phone: l.company_phone,
            company_website: l.company_website,
            company_vat_number: l.company_vat_number,
            company_tax_id: l.company_tax_id,
            company_registration_number: l.company_registration_number,
            bank_name: l.bank_name,
            bank_iban: l.bank_iban,
            bank_swift: l.bank_swift,
            bank_account_holder: l.bank_account_holder,
            logo_url: l.logo_url,
            logo_position: l.logo_position,
            logo_width_mm: l.logo_width_mm,
            logo_height_mm: l.logo_height_mm,
            logo_lock_aspect: l.logo_lock_aspect,
            primary_color: l.primary_color,
            accent_color: l.accent_color,
            text_color: l.text_color,
            muted_text_color: l.muted_text_color,
            page_size: l.page_size,
            margin_top_mm: l.margin_top_mm,
            margin_bottom_mm: l.margin_bottom_mm,
            margin_left_mm: l.margin_left_mm,
            margin_right_mm: l.margin_right_mm,
            header_height_mm: l.header_height_mm,
            footer_height_mm: l.footer_height_mm,
            header_layout: l.header_layout,
            header_show_logo: l.header_show_logo,
            header_show_company_name: l.header_show_company_name,
            header_show_contact: l.header_show_contact,
            header_show_vat: l.header_show_vat,
            header_divider: l.header_divider,
            header_divider_color: l.header_divider_color,
            header_custom_html: l.header_custom_html,
            footer_layout: l.footer_layout,
            footer_show_bank_details: l.footer_show_bank_details,
            footer_show_contact: l.footer_show_contact,
            footer_show_tax_id: l.footer_show_tax_id,
            footer_show_page_number: l.footer_show_page_number,
            footer_divider: l.footer_divider,
            footer_divider_color: l.footer_divider_color,
            footer_custom_html: l.footer_custom_html,
            footer_text: l.footer_text,
            watermark_enabled: l.watermark_enabled,
            watermark_text: l.watermark_text,
            watermark_color: l.watermark_color,
            watermark_opacity: l.watermark_opacity,
            watermark_rotation: l.watermark_rotation,
            body_font_family: l.body_font_family,
            body_font_size_pt: l.body_font_size_pt,
            heading_font_family: l.heading_font_family,
            heading_font_size_pt: l.heading_font_size_pt,
            created_by: l.created_by
        };
        Object.keys(data).forEach((k)=>data[k] === undefined && delete data[k]);
        let r;
        if (l.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantLetterhead.update({
                where: {
                    id: l.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantLetterhead.create({
                data
            });
        }
        return this._mapLetterhead(r);
    }
    async deleteLetterhead(id) {
        // Unlink templates that reference this letterhead, then delete
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.updateMany({
            where: {
                letterhead_id: id
            },
            data: {
                letterhead_id: null
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantLetterhead.delete({
            where: {
                id
            }
        });
    }
    // ─── Tenant Seals (Zigled) ──────────────────────────────────────────────
    _mapSeal(r) {
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async listSeals(tenantId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantSeal.findMany({
            where: {
                tenant_id: tenantId
            },
            orderBy: [
                {
                    is_default: "desc"
                },
                {
                    created_at: "desc"
                }
            ]
        });
        return rows.map((r)=>this._mapSeal(r));
    }
    async getSeal(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantSeal.findUnique({
            where: {
                id
            }
        });
        return r ? this._mapSeal(r) : null;
    }
    async getDefaultSeal(tenantId) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantSeal.findFirst({
            where: {
                tenant_id: tenantId,
                is_default: true
            }
        });
        return r ? this._mapSeal(r) : null;
    }
    async upsertSeal(s) {
        if (s.is_default) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantSeal.updateMany({
                where: {
                    tenant_id: s.tenant_id,
                    is_default: true,
                    id: s.id ? {
                        not: s.id
                    } : undefined
                },
                data: {
                    is_default: false
                }
            });
        }
        const data = {
            tenant_id: s.tenant_id,
            name: s.name,
            is_default: s.is_default,
            image_url: s.image_url,
            image_width_mm: s.image_width_mm,
            image_height_mm: s.image_height_mm,
            image_format: s.image_format,
            position: s.position,
            offset_x_mm: s.offset_x_mm,
            offset_y_mm: s.offset_y_mm,
            opacity: s.opacity,
            rotation_deg: s.rotation_deg,
            apply_to_types: s.apply_to_types,
            signature_enabled: s.signature_enabled,
            signature_label: s.signature_label,
            signature_name: s.signature_name,
            created_by: s.created_by
        };
        Object.keys(data).forEach((k)=>data[k] === undefined && delete data[k]);
        let r;
        if (s.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantSeal.update({
                where: {
                    id: s.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantSeal.create({
                data
            });
        }
        return this._mapSeal(r);
    }
    async deleteSeal(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentTemplate.updateMany({
            where: {
                seal_id: id
            },
            data: {
                seal_id: null
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantSeal.delete({
            where: {
                id
            }
        });
    }
    // ─── Document Verification ──────────────────────────────────────────────
    async createDocumentVerification(v) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentVerification.create({
            data: {
                tenant_id: v.tenant_id ?? "",
                partner_id: v.partner_id ?? null,
                doc_type: v.doc_type ?? "offer",
                doc_id: v.doc_id ?? "",
                verification_code: v.verification_code ?? "",
                status: v.status ?? "active",
                qr_code_url: v.qr_code_url ?? null
            }
        });
        return {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            last_verified_at: null,
            last_verified_ip: null,
            verification_count: 0
        };
    }
    async getDocumentVerificationByCode(code) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentVerification.findFirst({
            where: {
                verification_code: code
            }
        });
        return r ? {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            last_verified_at: dateToISO(r.last_verified_at),
            last_verified_ip: r.last_verified_ip
        } : null;
    }
    async getDocumentVerificationByDoc(tenantId, docType, docId) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].documentVerification.findFirst({
            where: {
                tenant_id: tenantId,
                doc_type: docType,
                doc_id: docId
            }
        });
        return r ? {
            ...r,
            created_at: dateToISOOrNow(r.created_at),
            last_verified_at: dateToISO(r.last_verified_at),
            last_verified_ip: r.last_verified_ip
        } : null;
    }
    async logVerification(log) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].verificationLog.create({
            data: {
                verification_id: log.verification_id ?? "",
                ip: log.ip ?? null,
                user_agent: log.user_agent ?? null
            }
        });
        return {
            ...r,
            verified_at: dateToISOOrNow(r.verified_at)
        };
    }
    async listVerificationLogs(verificationId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].verificationLog.findMany({
            where: {
                verification_id: verificationId
            },
            orderBy: {
                verified_at: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                verified_at: dateToISOOrNow(r.verified_at)
            }));
    }
    // ─── KYC ────────────────────────────────────────────────────────────────
    async listKycSubmissions(tenantId, params) {
        let where = {
            tenant_id: tenantId
        };
        if (params?.search) {
            where.OR = [
                {
                    partner_id: {
                        contains: params.search
                    }
                }
            ];
        }
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycSubmission.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycSubmission.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map(mapKycRow),
            total
        };
    }
    async getKycSubmission(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycSubmission.findUnique({
            where: {
                id
            }
        });
        return r ? mapKycRow(r) : null;
    }
    async getKycSubmissionByPartner(partnerId) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycSubmission.findFirst({
            where: {
                partner_id: partnerId
            }
        });
        return r ? mapKycRow(r) : null;
    }
    async upsertKycSubmission(s) {
        const data = {
            tenant_id: s.tenant_id ?? "",
            partner_id: s.partner_id ?? "",
            status: s.status ?? "not_submitted",
            data: stringifyJSON(s.data),
            reviewed_by: s.reviewed_by ?? null,
            reviewed_at: s.reviewed_at ? new Date(s.reviewed_at) : null,
            notes: s.notes ?? null,
            submitted_at: s.submitted_at ? new Date(s.submitted_at) : null
        };
        let r;
        if (s.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycSubmission.update({
                where: {
                    id: s.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycSubmission.create({
                data
            });
        }
        return mapKycRow(r);
    }
    async deleteKycSubmission(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycSubmission.delete({
            where: {
                id
            }
        });
    }
    async addKycDocument(doc) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycDocument.create({
            data: {
                submission_id: doc.submission_id ?? "",
                type: doc.type ?? "registration",
                file_url: doc.file_url ?? "",
                file_name: doc.file_name ?? null,
                status: doc.status ?? "pending"
            }
        });
        return {
            ...r,
            uploaded_at: dateToISOOrNow(r.uploaded_at)
        };
    }
    async removeKycDocument(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycDocument.delete({
            where: {
                id
            }
        });
    }
    async approveKycAndTransfer(submissionId, reviewedBy) {
        const submission = await this.upsertKycSubmission({
            id: submissionId,
            status: "approved",
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString()
        });
        const sub = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].kycSubmission.findUnique({
            where: {
                id: submissionId
            }
        });
        const partner = sub ? await this.upsertPartner({
            id: sub.partner_id,
            kyc_status: "approved",
            kyc_reviewed_by: reviewedBy,
            kyc_reviewed_at: new Date().toISOString()
        }) : null;
        if (!partner) throw new Error("Partner not found for KYC submission");
        return {
            submission,
            partner
        };
    }
    // ─── Portal RFQs ────────────────────────────────────────────────────────
    async listPortalRfqs(tenantId, params) {
        let where = {
            tenant_id: tenantId
        };
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalRfq.count({
            where
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalRfq.findMany({
            where,
            orderBy: {
                created_at: "desc"
            },
            skip: params?.offset ?? 0,
            take: params?.limit ?? 50
        });
        return {
            items: rows.map((r)=>({
                    ...r,
                    items: parseJSON(r.items, []),
                    created_at: dateToISOOrNow(r.created_at),
                    updated_at: dateToISOOrNow(r.updated_at)
                })),
            total
        };
    }
    async listPortalRfqsByPartner(partnerId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalRfq.findMany({
            where: {
                partner_id: partnerId
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map((r)=>({
                ...r,
                items: parseJSON(r.items, []),
                created_at: dateToISOOrNow(r.created_at),
                updated_at: dateToISOOrNow(r.updated_at)
            }));
    }
    async getPortalRfq(id) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalRfq.findUnique({
            where: {
                id
            }
        });
        return r ? {
            ...r,
            items: parseJSON(r.items, []),
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        } : null;
    }
    async upsertPortalRfq(rfq) {
        const data = {
            tenant_id: rfq.tenant_id ?? "",
            partner_id: rfq.partner_id ?? "",
            title: rfq.title ?? null,
            status: rfq.status ?? "pending",
            items: stringifyJSON(rfq.items) ?? "[]",
            notes: rfq.notes ?? null,
            delivery_address: rfq.delivery_address ?? null,
            desired_delivery_date: rfq.desired_delivery_date ? new Date(rfq.desired_delivery_date) : null
        };
        let r;
        if (rfq.id) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalRfq.update({
                where: {
                    id: rfq.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalRfq.create({
                data
            });
        }
        return {
            ...r,
            items: parseJSON(r.items, []),
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    async deletePortalRfq(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].portalRfq.delete({
            where: {
                id
            }
        });
    }
    // ─── Feature Flags ──────────────────────────────────────────────────────
    async getFeatureFlags(tenantId) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantFeatureFlags.findFirst({
            where: {
                tenant_id: tenantId
            }
        });
        return r ? {
            ...r,
            flags: parseJSON(r.flags, {}),
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        } : null;
    }
    async upsertFeatureFlags(f) {
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantFeatureFlags.findFirst({
            where: {
                tenant_id: f.tenant_id
            }
        });
        const data = {
            tenant_id: f.tenant_id,
            flags: stringifyJSON(f.flags) ?? "{}",
            updated_by: f.updated_by ?? null
        };
        let r;
        if (existing) {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantFeatureFlags.update({
                where: {
                    id: existing.id
                },
                data
            });
        } else {
            r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tenantFeatureFlags.create({
                data
            });
        }
        return {
            ...r,
            flags: parseJSON(r.flags, {}),
            created_at: dateToISOOrNow(r.created_at),
            updated_at: dateToISOOrNow(r.updated_at)
        };
    }
    // ─── Notifications ──────────────────────────────────────────────────────
    async listNotifications(tenantId, userId, unreadOnly) {
        const where = {
            tenant_id: tenantId
        };
        if (userId) where.user_id = userId;
        if (unreadOnly) where.read = false;
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.findMany({
            where,
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map(mapNotificationRow);
    }
    async listNotificationsByPartner(tenantId, partnerId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.findMany({
            where: {
                tenant_id: tenantId,
                OR: [
                    {
                        partner_id: partnerId
                    },
                    {
                        partner_id: null
                    }
                ]
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return rows.map(mapNotificationRow);
    }
    async createNotification(n) {
        const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.create({
            data: {
                tenant_id: n.tenant_id ?? "",
                user_id: n.user_id ?? null,
                type: n.type ?? "info",
                title: n.title ?? "",
                message: n.message ?? "",
                data: stringifyJSON(n.data),
                read: false
            }
        });
        return mapNotificationRow(r);
    }
    async markNotificationRead(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.update({
            where: {
                id
            },
            data: {
                read: true,
                read_at: new Date()
            }
        });
    }
    async markAllNotificationsRead(tenantId, userId) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.updateMany({
            where: {
                tenant_id: tenantId,
                user_id: userId,
                read: false
            },
            data: {
                read: true,
                read_at: new Date()
            }
        });
    }
    async deleteNotification(id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.delete({
            where: {
                id
            }
        });
    }
    async getUnreadCount(tenantId, userId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.count({
            where: {
                tenant_id: tenantId,
                user_id: userId,
                read: false
            }
        });
    }
    // ─── Dashboard ──────────────────────────────────────────────────────────
    async getInsights(tenantId) {
        // Compute dashboard insights from the database
        // Note: Deal and Offer don't have direct tenant_id — filter through Partner relation.
        // Invoice and Partner have direct tenant_id.
        const dealFilter = tenantId ? {
            partner: {
                tenant_id: tenantId
            }
        } : {};
        const offerFilter = tenantId ? {
            partner: {
                tenant_id: tenantId
            }
        } : {};
        const invoiceFilter = tenantId ? {
            tenant_id: tenantId
        } : {};
        const partnerFilter = tenantId ? {
            tenant_id: tenantId
        } : {};
        const [dealCount, activeDeals, wonDeals, lostDeals, offerCount, pendingOffers, invoiceCount, overdueInvoices, partnerCount, productCount, recentAudit] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.count({
                where: dealFilter
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.count({
                where: {
                    stage: {
                        in: [
                            "lead",
                            "qualified",
                            "proposal",
                            "negotiation"
                        ]
                    },
                    ...dealFilter
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.count({
                where: {
                    stage: "won",
                    ...dealFilter
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.count({
                where: {
                    stage: "lost",
                    ...dealFilter
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].offer.count({
                where: offerFilter
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].offer.count({
                where: {
                    status: {
                        in: [
                            "draft",
                            "sent"
                        ]
                    },
                    ...offerFilter
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoice.count({
                where: invoiceFilter
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoice.count({
                where: {
                    status: "overdue",
                    ...invoiceFilter
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].partner.count({
                where: partnerFilter
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].product.count({}),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].auditLog.findMany({
                where: tenantId ? {} : {},
                orderBy: {
                    created_at: "desc"
                },
                take: 5
            })
        ]);
        // Get total deal value
        const deals = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].deal.findMany({
            where: dealFilter
        });
        const totalDealValue = deals.reduce((sum, d)=>sum + (d.value || 0), 0);
        const wonValue = deals.filter((d)=>d.stage === "won").reduce((sum, d)=>sum + (d.value || 0), 0);
        // Get offers with totals
        const offers = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].offer.findMany({
            where: offerFilter
        });
        const totalOfferValue = offers.reduce((sum, o)=>sum + (o.total || 0), 0);
        // Get invoices
        const invoices = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoice.findMany({
            where: invoiceFilter
        });
        const totalInvoiceValue = invoices.reduce((sum, i)=>sum + (i.total || 0), 0);
        const paidInvoiceValue = invoices.filter((i)=>i.status === "paid").reduce((sum, i)=>sum + (i.total || 0), 0);
        // Stage distribution
        const stageDistribution = {};
        for (const d of deals){
            stageDistribution[d.stage] = (stageDistribution[d.stage] || 0) + 1;
        }
        // Deal pipeline — ensure all stages present (matches DashboardInsights.deals_by_stage)
        const order = [
            "lead",
            "qualified",
            "proposal",
            "negotiation",
            "won",
            "lost"
        ];
        const deals_by_stage = order.map((stage)=>({
                stage,
                count: stageDistribution[stage] || 0,
                value: deals.filter((d)=>d.stage === stage).reduce((s, d)=>s + (d.value || 0), 0)
            }));
        return {
            kpis: {
                partners_total: partnerCount,
                partners_active: partnerCount,
                deals_open: activeDeals,
                deals_won_value: wonValue,
                pipeline_value: totalDealValue - wonValue,
                offers_pending: pendingOffers,
                low_stock_count: 0,
                invoices_outstanding: invoiceCount,
                inventory_movements_30d: 0
            },
            deals_by_stage,
            offers_last_30d: [],
            revenue_last_30d: [],
            recent_activity: recentAudit.map(mapAuditLogRow),
            top_partners: [],
            low_stock_products: []
        };
    }
    // ─── ERP stubs (not yet implemented for Prisma) ──────────────────────────
    async listErpAccounts(_tenantId, _params) {
        return {
            items: [],
            total: 0
        };
    }
    async getErpAccount(_id) {
        return null;
    }
    async upsertErpAccount(_a) {
        throw new Error("Not implemented");
    }
    async deleteErpAccount(_id) {
        throw new Error("Not implemented");
    }
    async listFiscalPeriods(_tenantId, _params) {
        return {
            items: [],
            total: 0
        };
    }
    async getFiscalPeriod(_id) {
        return null;
    }
    async upsertFiscalPeriod(_p) {
        throw new Error("Not implemented");
    }
    async closeFiscalPeriod(_id, _closedBy) {
        throw new Error("Not implemented");
    }
    async listErpJournalEntries(_tenantId, _params) {
        return {
            items: [],
            total: 0
        };
    }
    async getErpJournalEntry(_id) {
        return null;
    }
    async upsertErpJournalEntry(_e) {
        throw new Error("Not implemented");
    }
    async postErpJournalEntry(_id, _postedBy) {
        throw new Error("Not implemented");
    }
    async reverseErpJournalEntry(_id, _reversedBy) {
        throw new Error("Not implemented");
    }
    async deleteErpJournalEntry(_id) {
        throw new Error("Not implemented");
    }
    async listErpCostCenters(_tenantId, _params) {
        return {
            items: [],
            total: 0
        };
    }
    async upsertErpCostCenter(_c) {
        throw new Error("Not implemented");
    }
    async deleteErpCostCenter(_id) {
        throw new Error("Not implemented");
    }
    async listErpBankAccounts(_tenantId) {
        return [];
    }
    async upsertErpBankAccount(_b) {
        throw new Error("Not implemented");
    }
    async deleteErpBankAccount(_id) {
        throw new Error("Not implemented");
    }
    async listErpBankTransactions(_tenantId, _bankAccountId, _params) {
        return {
            items: [],
            total: 0
        };
    }
    async upsertErpBankTransaction(_t) {
        throw new Error("Not implemented");
    }
    async reconcileBankTransaction(_id, _journalEntryId) {
        throw new Error("Not implemented");
    }
    async getErpSettings(_tenantId) {
        return null;
    }
    async upsertErpSettings(_s) {
        throw new Error("Not implemented");
    }
    async getTrialBalance(_tenantId, _asOfDate) {
        return {
            items: [],
            total_debit: 0,
            total_credit: 0,
            as_of_date: _asOfDate
        };
    }
    async getBalanceSheet(_tenantId, _asOfDate) {
        return {
            assets: [],
            liabilities: [],
            equity: [],
            total_assets: 0,
            total_liabilities: 0,
            total_equity: 0,
            as_of_date: _asOfDate
        };
    }
    async getProfitAndLoss(_tenantId, _periodStart, _periodEnd) {
        return {
            revenue: [],
            expenses: [],
            total_revenue: 0,
            total_expenses: 0,
            net_profit: 0,
            period_start: _periodStart,
            period_end: _periodEnd
        };
    }
    async getGeneralLedger(_tenantId, _accountId, _dateFrom, _dateTo) {
        return {
            account_id: _accountId,
            account_code: "",
            account_name: "",
            entries: [],
            opening_balance: 0,
            closing_balance: 0,
            total_debit: 0,
            total_credit: 0
        };
    }
    async autoJournalFromInvoice(_invoiceId, _tenantId, _userId) {
        return null;
    }
    async autoJournalFromDeal(_dealId, _tenantId, _userId) {
        return null;
    }
    async autoJournalFromCommission(_commissionId, _tenantId, _userId) {
        return null;
    }
    // ─── User Preferences ──────────────────────────────────────────────────
    async getUserPreference(userId, key) {
        const row = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].userPreference.findUnique({
            where: {
                user_id_preference_key: {
                    user_id: userId,
                    preference_key: key
                }
            }
        });
        if (!row) return null;
        return {
            ...row,
            preference_value: row.preference_value,
            updated_at: dateToISOOrNow(row.updated_at)
        };
    }
    async setUserPreference(userId, key, value) {
        const serialized = JSON.stringify(value);
        const row = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].userPreference.upsert({
            where: {
                user_id_preference_key: {
                    user_id: userId,
                    preference_key: key
                }
            },
            update: {
                preference_value: serialized
            },
            create: {
                user_id: userId,
                preference_key: key,
                preference_value: serialized
            }
        });
        return {
            ...row,
            preference_value: row.preference_value,
            updated_at: dateToISOOrNow(row.updated_at)
        };
    }
    async listUserPreferences(userId) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].userPreference.findMany({
            where: {
                user_id: userId
            }
        });
        return rows.map((r)=>({
                ...r,
                preference_value: r.preference_value,
                updated_at: dateToISOOrNow(r.updated_at)
            }));
    }
}
}),
];

//# sourceMappingURL=src_lib_36936f92._.js.map
module.exports = [
"[project]/src/lib/data/store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Data store interface + factory.
// The app talks to this interface; the concrete implementation is either
// SupabaseStore (production Supabase, default), MockStore (in-memory, empty),
// or PrismaStore (Prisma + SQLite, legacy).
__turbopack_context__.s([
    "getStore",
    ()=>getStore,
    "getStoreSync",
    ()=>getStoreSync
]);
let _impl = null;
async function getStore() {
    if (_impl) return _impl;
    const forced = process.env.DB_BACKEND;
    if (forced === "supabase") {
        const { SupabaseStore } = await __turbopack_context__.A("[project]/src/lib/data/supabase-store.ts [app-route] (ecmascript, async loader)");
        _impl = new SupabaseStore();
    } else if (forced === "mock") {
        console.warn("[store] DB_BACKEND=mock — MockStore has no seed data. Use only for testing.");
        const { MockStore } = await __turbopack_context__.A("[project]/src/lib/data/mock-store.ts [app-route] (ecmascript, async loader)");
        _impl = new MockStore();
    } else if (forced === "prisma") {
        const { PrismaStore } = await __turbopack_context__.A("[project]/src/lib/data/prisma-store.ts [app-route] (ecmascript, async loader)");
        _impl = new PrismaStore();
    } else {
        // Default: use SupabaseStore (production)
        const { SupabaseStore } = await __turbopack_context__.A("[project]/src/lib/data/supabase-store.ts [app-route] (ecmascript, async loader)");
        _impl = new SupabaseStore();
    }
    return _impl;
}
function getStoreSync() {
    return _impl;
}
}),
];

//# sourceMappingURL=src_lib_data_store_ts_704cd8f1._.js.map
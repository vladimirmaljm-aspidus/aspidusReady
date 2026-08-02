(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__8978dbac._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
/**
 * Simple in-memory rate limiter.
 * In production, use Redis or a proper rate-limiting service.
 * This is a basic defense against brute-force attacks.
 */ const rateLimitMap = new Map();
const RATE_LIMITS = {
    "/api/auth/login": {
        maxRequests: 10,
        windowMs: 60_000
    },
    "/api/portal/login": {
        maxRequests: 10,
        windowMs: 60_000
    },
    "/api/setup": {
        maxRequests: 3,
        windowMs: 300_000
    },
    "/api/auth/logout": {
        maxRequests: 20,
        windowMs: 60_000
    }
};
function getRateLimitKey(path, ip) {
    return `${path}:${ip}`;
}
function getIp(req) {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
// Clean up expired entries every 5 minutes
let lastCleanup = Date.now();
function cleanupIfNeeded() {
    const now = Date.now();
    if (now - lastCleanup > 5 * 60_000) {
        for (const [key, val] of rateLimitMap){
            if (val.resetAt < now) rateLimitMap.delete(key);
        }
        lastCleanup = now;
    }
}
function middleware(req) {
    const { pathname } = req.nextUrl;
    const config = RATE_LIMITS[pathname];
    if (!config) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    const ip = getIp(req);
    const key = getRateLimitKey(pathname, ip);
    const now = Date.now();
    cleanupIfNeeded();
    const entry = rateLimitMap.get(key);
    if (!entry || entry.resetAt < now) {
        rateLimitMap.set(key, {
            count: 1,
            resetAt: now + config.windowMs
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    entry.count++;
    if (entry.count > config.maxRequests) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Too many requests. Please try again later."
        }, {
            status: 429,
            headers: {
                "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000))
            }
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/api/auth/login",
        "/api/portal/login",
        "/api/setup",
        "/api/auth/logout"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__8978dbac._.js.map
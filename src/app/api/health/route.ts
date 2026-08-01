import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/health
 * Quick health check — used by Render and for debugging.
 * Returns minimal info to avoid leaking configuration details.
 */
export async function GET() {
  const backend = process.env.DB_BACKEND || "supabase";
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const hasSecretKey = Boolean(process.env.SECRET_KEY);
  const urlFormatOk = supabaseUrl.startsWith("https://");

  // Try a quick DB connection
  let dbOk = false;
  if (backend === "supabase" && supabaseUrl && supabaseKey && urlFormatOk) {
    try {
      const { getStore } = await import("@/lib/data/store");
      const store = await getStore();
      await store.listTenants();
      dbOk = true;
    } catch {
      // Connection failed
    }
  }

  const issues: string[] = [];
  if (!dbOk) issues.push("Database connection issue");
  if (!hasSecretKey) issues.push("Secret key not configured");
  if (backend !== "supabase") issues.push("Non-production backend");

  return NextResponse.json({
    status: issues.length === 0 && dbOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    backend,
    dbConnection: dbOk ? "ok" : "error",
    issues: issues.length > 0 ? issues : undefined,
  });
}

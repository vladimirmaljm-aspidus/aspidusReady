import { getSupabase } from "@/lib/supabase/client";

/**
 * Record that a portal client viewed a document. Updates:
 *   - viewed_at (first-view stays; we overwrite to latest)
 *   - viewed_by_email (portal_access email)
 *   - view_count (+1)
 *   - status "sent" → "viewed" (only on first view)
 *
 * Fire-and-forget: never blocks or throws. If the columns don't exist
 * (older schema), it silently no-ops.
 */
export async function markDocumentViewed(
  table: "offers" | "invoices" | "proformas",
  id: string,
  tenantId: string,
  viewerEmail: string | null,
): Promise<void> {
  try {
    const sb = getSupabase();
    const { data: existing } = await sb
      .from(table)
      .select("view_count, status, viewed_at")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (!existing) return;

    const patch: Record<string, unknown> = {
      viewed_at: new Date().toISOString(),
      viewed_by_email: viewerEmail || null,
      view_count: ((existing as any).view_count || 0) + 1,
    };
    // Only promote status on the very first view.
    if (!(existing as any).viewed_at && (existing as any).status === "sent") {
      patch.status = "viewed";
    }
    await sb.from(table).update(patch).eq("id", id).eq("tenant_id", tenantId);
  } catch (e) {
    console.warn(`[mark-viewed:${table}]`, e);
  }
}

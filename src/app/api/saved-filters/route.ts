import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

/**
 * GET /api/saved-filters?module=partners
 * Lists saved filters for the current user (optionally filtered by module).
 *
 * POST /api/saved-filters
 * Body: { module, name, filters: {...}, columns?: [...], is_default?: bool }
 * Creates or updates a saved filter.
 *
 * DELETE /api/saved-filters?id=xxx&module=xxx
 * Removes a saved filter.
 */

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const module = url.searchParams.get("module");

  const store = await getStore();
  // Saved filters are stored as user preferences with key "saved_filter:{module}:{id}"
  const prefs = await store.listUserPreferences(auth.user.id);
  let filters = prefs.filter((p) => p.preference_key.startsWith("saved_filter:"));

  if (module) {
    filters = filters.filter((p) => p.preference_key.startsWith(`saved_filter:${module}:`));
  }

  const result = filters.map((p) => {
    try {
      const parsed = JSON.parse(p.preference_value);
      return {
        id: p.preference_key.split(":")[2],
        module: p.preference_key.split(":")[1],
        ...parsed,
      };
    } catch {
      return null;
    }
  }).filter(Boolean);

  return NextResponse.json({ items: result });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { module, name, filters, columns, is_default } = body;

  if (!module || !name) {
    return NextResponse.json({ error: "module and name are required." }, { status: 400 });
  }

  // Generate ID from name (slugify)
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const key = `saved_filter:${module}:${id}`;

  const store = await getStore();
  const value = JSON.stringify({ name, filters, columns, is_default: !!is_default });
  await store.setUserPreference(auth.user.id, key, value);

  return NextResponse.json({ id, module, name, filters, columns, is_default });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const module = url.searchParams.get("module");

  if (!id || !module) {
    return NextResponse.json({ error: "id and module are required." }, { status: 400 });
  }

  const key = `saved_filter:${module}:${id}`;
  const store = await getStore();
  // Mark as deleted by setting value to null
  await store.setUserPreference(auth.user.id, key, null);

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * GET /api/tasks
 * Query params:
 *   mine=1        — only tasks assigned to or created by the current user
 *   assigned=1    — only tasks assigned to the current user
 *   status=xxx    — filter by status (todo, in_progress, done, blocked, cancelled)
 *   priority=xxx  — filter by priority (low, medium, high, urgent)
 *   partner_id=xx — filter by linked partner
 *   product_id=xx — filter by linked product
 *   deal_id=xx    — filter by linked deal
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = resolveTenantId(auth, req);
  if (!tid) return NextResponse.json({ items: [] });

  const url = new URL(req.url);
  const mine = url.searchParams.get("mine");
  const assigned = url.searchParams.get("assigned");
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const partnerId = url.searchParams.get("partner_id");
  const productId = url.searchParams.get("product_id");
  const dealId = url.searchParams.get("deal_id");

  // Fetch all tenant tasks (the store doesn't support complex filtering)
  let tasks = await auth.store.listTasks(tid);

  // Tenant isolation: PrismaStore.listTasks ignores _tenantId, so we
  // post-filter for non-super_admin.
  if (!auth.isSuperAdmin && auth.tenantId) {
    tasks = tasks.filter((t) => t.tenant_id === auth.tenantId);
  }

  // Apply filters
  if (mine) {
    tasks = tasks.filter(
      (t) => t.user_id === auth.user.id
    );
  }
  if (assigned) {
    tasks = tasks.filter((t) => t.user_id === auth.user.id);
  }
  if (status) {
    tasks = tasks.filter((t) => (t as any).status === status || (t.done && status === "done"));
  }
  if (priority) {
    tasks = tasks.filter((t) => t.priority === priority);
  }
  if (partnerId) {
    tasks = tasks.filter(
      (t) => t.entity_type === "partner" && t.entity_id === partnerId
    );
  }
  if (productId) {
    tasks = tasks.filter(
      (t) => t.entity_type === "product" && t.entity_id === productId
    );
  }
  if (dealId) {
    tasks = tasks.filter(
      (t) => t.entity_type === "deal" && t.entity_id === dealId
    );
  }

  return NextResponse.json({ items: tasks });
}

/**
 * POST /api/tasks
 * Body:
 *   title (required), description, priority, due_date,
 *   assigned_to (user id — null = unassigned),
 *   partner_id, product_id, deal_id (optional links),
 *   instructions, estimated_hours, tags
 *
 * Admins and managers can assign tasks to any tenant user.
 * Regular staff can only create tasks for themselves.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = resolveTenantId(auth, req);
  if (!tid) return NextResponse.json({ error: "Tenant required." }, { status: 400 });

  const body = await req.json();
  body.tenant_id = tid;
  body.user_id = body.user_id || auth.user.id; // creator

  // Permission check: only admin/manager can assign tasks to others
  const canAssign = auth.isSuperAdmin || auth.user.role === "admin" || auth.user.role === "manager";
  if (body.assigned_to && body.assigned_to !== auth.user.id && !canAssign) {
    return NextResponse.json(
      { error: "You can only create tasks for yourself. Ask a manager to assign tasks to others." },
      { status: 403 }
    );
  }

  // Default done flag
  if (body.done) body.done = true;

  const created = await auth.store.upsertTask(body);
  await audit(auth.store, auth.user, req, body.id ? "task.update" : "task.create", "task", created.id, {
    title: created.title,
  });
  return NextResponse.json(created);
}

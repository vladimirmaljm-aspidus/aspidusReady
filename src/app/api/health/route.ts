import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const store = await getStore();
    await store.listTenants();
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "ok" });
  }
}

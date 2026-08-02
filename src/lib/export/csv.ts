import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Generic CSV export helper.
 * Converts an array of objects into a CSV string with proper escaping.
 */
export function toCSV(rows: Record<string, unknown>[], columns?: string[]): string {
  if (!rows.length) return "";
  const cols = columns || Object.keys(rows[0]);

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const s = typeof val === "object" ? JSON.stringify(val) : String(val);
    // Escape quotes by doubling, wrap in quotes if contains comma/quote/newline
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = cols.map(escape).join(",");
  const body = rows.map((r) => cols.map((c) => escape(r[c])).join(",")).join("\n");
  return `${header}\n${body}`;
}

/**
 * Send a CSV download response with proper headers.
 */
export function csvResponse(filename: string, csv: string): NextResponse {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": Buffer.byteLength(csv, "utf-8").toString(),
    },
  });
}

/**
 * Parse export query params — which columns to include, format.
 */
export function parseExportParams(req: NextRequest): {
  columns: string[] | null;
  format: "csv" | "xlsx";
} {
  const url = new URL(req.url);
  const colsParam = url.searchParams.get("columns");
  const columns = colsParam ? colsParam.split(",").map((c) => c.trim()).filter(Boolean) : null;
  const format = (url.searchParams.get("format") as "csv" | "xlsx") || "csv";
  return { columns, format };
}

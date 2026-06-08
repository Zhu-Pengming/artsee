import { NextResponse } from "next/server";

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function parsePagination(searchParams: URLSearchParams) {
  const rawLimit = Number.parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);
  const rawOffset = Number.parseInt(searchParams.get("offset") || "0", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT) : DEFAULT_LIMIT;
  const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;
  return { limit, offset };
}

export function errorResponse(error: unknown, status = 500) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);
  return NextResponse.json({ success: false, error: message }, { status });
}

export function invalidIdResponse() {
  return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
}

export function notFoundResponse() {
  return NextResponse.json({ success: false, error: "未找到" }, { status: 404 });
}

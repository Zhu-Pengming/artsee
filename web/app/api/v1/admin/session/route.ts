import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  return NextResponse.json({
    success: true,
    user: {
      id: admin.user.id,
      email: admin.user.email ?? null,
    },
  });
}

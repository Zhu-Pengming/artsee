import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const includeInactive = new URL(req.url).searchParams.get("include_inactive") === "true";

    if (includeInactive) {
      const admin = await requireAdmin(req);
      if ("response" in admin) return admin.response;
    }

    const supabase = createServiceClient();
    let query = supabase.from("articles").select("*").eq("id", id);
    if (!includeInactive) query = query.eq("publish_status", "published");

    const { data, error } = await query.maybeSingle();
    if (error) return errorResponse(error);
    if (!data) return notFoundResponse();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("articles")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("articles")
      .update({ publish_status: "archived" })
      .eq("id", id);

    if (error) return errorResponse(error);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

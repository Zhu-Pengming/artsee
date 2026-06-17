import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;
    const { data, error } = await createServiceClient()
      .from("mentors")
      .select("*")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data: data ?? null });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const displayName = cleanText(body.display_name) || cleanText(body.displayName);
    if (!displayName) {
      return NextResponse.json(
        { success: false, error: "请填写导师展示名称" },
        { status: 400 }
      );
    }

    const { data, error } = await createServiceClient()
      .from("mentors")
      .upsert(
        {
          user_id: auth.user.id,
          display_name: displayName,
          bio: cleanText(body.bio) || null,
          university: cleanText(body.university) || null,
          major: cleanText(body.major) || null,
          degree: cleanText(body.degree) || null,
          proof_materials: objectValue(body.proof_materials ?? body.proofMaterials),
          verification_status: "pending",
          status: "draft",
          metadata: objectValue(body.metadata),
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();

    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}

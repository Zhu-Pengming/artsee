import { NextRequest, NextResponse } from "next/server";
import { isAdminProfile, requireUser } from "@/lib/api/authz";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import {
  isOwnedSubmissionMaterialPath,
  materialPathFromUrlOrPath,
  SUBMISSION_MATERIALS_BUCKET,
} from "@/lib/api/submission-materials";

type Body = {
  path?: unknown;
  url?: unknown;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const body = (await req.json().catch(() => ({}))) as Body;
    const raw = cleanText(body.path) || cleanText(body.url);
    const path = materialPathFromUrlOrPath(raw);
    if (!path) {
      return NextResponse.json(
        { success: false, error: "无效材料路径" },
        { status: 400 }
      );
    }

    if (
      !isAdminProfile(auth.profile) &&
      !isOwnedSubmissionMaterialPath(path, auth.user.id)
    ) {
      return NextResponse.json(
        { success: false, error: "无权访问该材料" },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase.storage
      .from(SUBMISSION_MATERIALS_BUCKET)
      .createSignedUrl(path, 10 * 60);
    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      path,
      signed_url: data?.signedUrl ?? null,
      expires_in: 10 * 60,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

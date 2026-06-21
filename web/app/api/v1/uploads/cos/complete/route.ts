import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import { isOwnedTencentCosKey } from "@/lib/api/tencent-cos";

type Body = {
  key?: unknown;
  url?: unknown;
  bucket?: unknown;
  file_type?: unknown;
  scene?: unknown;
  size?: unknown;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const body = (await req.json().catch(() => ({}))) as Body;
    const key = cleanText(body.key);
    const url = cleanText(body.url);
    const bucket = cleanText(body.bucket) || null;
    const fileType = cleanText(body.file_type) || null;
    const scene = cleanText(body.scene) || "uploads";
    const size = Number(body.size);

    if (!key || !url) {
      return NextResponse.json(
        { success: false, error: "缺少文件路径或 URL" },
        { status: 400 }
      );
    }
    if (!isOwnedTencentCosKey(key, auth.user.id)) {
      return NextResponse.json(
        { success: false, error: "无权记录该文件" },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from("upload_files").insert({
      user_id: auth.user.id,
      file_url: url,
      file_type: fileType,
      scene,
      size: Number.isFinite(size) && size >= 0 ? size : null,
      provider: "tencent_cos",
      bucket,
      object_key: key,
    });

    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: {
        provider: "tencent_cos",
        key,
        url,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

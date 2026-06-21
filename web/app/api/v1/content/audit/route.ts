import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { auditContent } from "@/lib/api/content-safety";
import { errorResponse } from "@/lib/api/route-helpers";
import { TencentCloudConfigError } from "@/lib/api/tencent-cloud";

type Body = {
  text?: unknown;
  image_urls?: unknown;
  scene?: unknown;
  data_id?: unknown;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(cleanText).filter(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const body = (await req.json().catch(() => ({}))) as Body;
    const text = cleanText(body.text);
    const imageUrls = cleanStringArray(body.image_urls);
    const scene = cleanText(body.scene) || "community_post";
    const dataId = cleanText(body.data_id) || undefined;

    if (!text && imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "请提供待审核文本或图片" },
        { status: 400 }
      );
    }

    const result = await auditContent({
      userId: auth.user.id,
      text,
      imageUrls,
      scene,
      dataId,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    if (e instanceof TencentCloudConfigError) {
      return NextResponse.json(
        { success: false, error: e.message, missing: e.missing },
        { status: 503 }
      );
    }
    return errorResponse(e);
  }
}

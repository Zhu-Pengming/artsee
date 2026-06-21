import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse } from "@/lib/api/route-helpers";
import { createTencentCosPutSignature } from "@/lib/api/tencent-cos";
import { TencentCloudConfigError } from "@/lib/api/tencent-cloud";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const DOCUMENT_TYPES = new Set([...IMAGE_TYPES, "application/pdf"]);
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;
const DOCUMENT_MAX_SIZE = 10 * 1024 * 1024;

type Body = {
  file_name?: unknown;
  content_type?: unknown;
  size?: unknown;
  scene?: unknown;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isDocumentScene(scene: string) {
  return scene.startsWith("submission-materials") || scene.startsWith("contracts");
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const body = (await req.json().catch(() => ({}))) as Body;
    const fileName = cleanText(body.file_name);
    const contentType = cleanText(body.content_type).toLowerCase();
    const scene = cleanText(body.scene) || "uploads";
    const size = Number(body.size);
    const allowedTypes = isDocumentScene(scene) ? DOCUMENT_TYPES : IMAGE_TYPES;
    const maxSize = isDocumentScene(scene) ? DOCUMENT_MAX_SIZE : DEFAULT_MAX_SIZE;

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "缺少文件名" },
        { status: 400 }
      );
    }
    if (!allowedTypes.has(contentType)) {
      return NextResponse.json(
        { success: false, error: "不支持的文件类型" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(size) || size <= 0) {
      return NextResponse.json(
        { success: false, error: "无效文件大小" },
        { status: 400 }
      );
    }
    if (size > maxSize) {
      return NextResponse.json(
        { success: false, error: `文件大小超过 ${Math.floor(maxSize / 1024 / 1024)}MB 限制` },
        { status: 400 }
      );
    }

    const upload = createTencentCosPutSignature({
      userId: auth.user.id,
      fileName,
      contentType,
      scene,
      expiresIn: Number(process.env.TENCENT_COS_SIGN_EXPIRES_SECONDS) || undefined,
    });

    return NextResponse.json({ success: true, data: upload });
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

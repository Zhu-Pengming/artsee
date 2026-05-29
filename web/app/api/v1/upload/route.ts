import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * POST /api/v1/upload
 * 通用文件上传（头像、社区图片等）
 * Body: multipart/form-data
 *   - file: 文件（必填，图片类型，≤5MB）
 *   - folder: 存储文件夹（可选，默认 "avatars"）
 * 返回: { success: true, url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folder = (form.get("folder") as string) || "avatars";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "缺少文件" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "不支持的文件类型" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "文件大小超过 5MB 限制" },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const timestamp = Date.now();
    const path = `${user.id}/${folder}/${timestamp}_${file.name}`;

    const supabase = createServiceClient();
    const { error } = await supabase.storage.from("avatars").upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    await supabase.from("upload_files").insert({
      user_id: user.id,
      file_url: publicUrlData.publicUrl,
      file_type: file.type,
      scene: folder,
      size: file.size,
    });

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

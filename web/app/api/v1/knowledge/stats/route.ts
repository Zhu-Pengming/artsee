import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";

// GET /api/v1/knowledge/stats - 首页知识库统计（公开读）
export async function GET() {
  try {
    const supabase = createServiceClient();

    const [{ count: chunkCount, error: chunkError }, { count: documentCount, error: documentError }] =
      await Promise.all([
        supabase.from("document_chunks").select("id", { count: "exact", head: true }),
        supabase.from("school_documents").select("id", { count: "exact", head: true }),
      ]);

    if (chunkError) {
      return NextResponse.json({ success: false, error: chunkError.message }, { status: 500 });
    }

    if (documentError) {
      return NextResponse.json({ success: false, error: documentError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        knowledge_count: chunkCount ?? 0,
        document_count: documentCount ?? 0,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

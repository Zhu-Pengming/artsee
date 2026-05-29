import { NextRequest, NextResponse } from "next/server";

// GET /api/v1/tools - 获取申请工具列表
export async function GET(req: NextRequest) {
  try {
    const tools = [
      {
        id: "timeline",
        title: "申请时间线",
        subtitle: "按目标入学季拆解材料、语言、面试节点",
        icon: "timeline",
        color: "#0047AB",
        route: "/tools/timeline",
        enabled: true,
      },
      {
        id: "checklist",
        title: "材料清单",
        subtitle: "成绩单、推荐信、作品集、文书逐项确认",
        icon: "checklist",
        color: "#059669",
        route: "/tools/checklist",
        enabled: true,
      },
      {
        id: "portfolio",
        title: "作品集进度",
        subtitle: "概念、调研、草图、成稿、排版状态追踪",
        icon: "dashboard",
        color: "#7C3AED",
        route: "/tools/portfolio",
        enabled: true,
      },
      {
        id: "documents",
        title: "文书模板",
        subtitle: "PS、Study Plan、Research Proposal 框架",
        icon: "document",
        color: "#E11D48",
        route: "/tools/documents",
        enabled: true,
      },
    ];

    return NextResponse.json({
      success: true,
      data: tools,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

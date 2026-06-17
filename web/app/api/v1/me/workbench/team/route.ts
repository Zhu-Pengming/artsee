import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/api/notifications";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import { requireWorkbenchUser } from "@/lib/api/workbench-access";

type Row = Record<string, unknown>;
type ServiceClient = ReturnType<typeof createServiceClient>;

const MEMBER_ROLES = new Set(["admin", "advisor", "member"]);
const MEMBER_STATUSES = new Set(["active", "invited", "disabled"]);

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return cleanText(value).toLowerCase();
}

function objectMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function mapById(rows: Row[]) {
  const entries: Array<[string, Row]> = [];
  for (const row of rows) {
    const id = asString(row.id);
    if (id) entries.push([id, row]);
  }
  return new Map(entries);
}

async function findUserIdByEmail(supabase: ServiceClient, email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;
  const user = data.users.find(
    (item) => item.email?.trim().toLowerCase() === email
  );
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    if (auth.manageableOrganizationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "仅机构所有者或管理员可查看团队成员" },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();
    const { searchParams } = new URL(req.url);
    const status = cleanText(searchParams.get("status")) || "active";
    if (status !== "all" && !MEMBER_STATUSES.has(status)) {
      return NextResponse.json({ success: false, error: "无效成员状态" }, { status: 400 });
    }

    let memberQuery = supabase
      .from("organization_members")
      .select("id,organization_id,user_id,role,status,metadata,created_at,updated_at")
      .in("organization_id", auth.manageableOrganizationIds)
      .order("created_at", { ascending: true });
    if (status !== "all") memberQuery = memberQuery.eq("status", status);
    const { data: members, error: memberError } = await memberQuery;

    if (memberError) return errorResponse(memberError);

    const rows = (members ?? []) as Row[];
    const userIds = Array.from(
      new Set(
        rows
          .map((member) => asString(member.user_id))
          .filter((id): id is string => Boolean(id))
      )
    );

    const { data: profiles, error: profileError } =
      userIds.length > 0
        ? await supabase
            .from("user_profiles")
            .select("id,nickname,avatar_url,role,user_role,user_type")
            .in("id", userIds)
        : { data: [], error: null };

    if (profileError) return errorResponse(profileError);

    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id,name,type,status")
      .in("id", auth.manageableOrganizationIds);

    if (orgError) return errorResponse(orgError);

    const profilesById = mapById((profiles ?? []) as Row[]);
    const organizationsById = mapById((organizations ?? []) as Row[]);

    const data = rows.map((member) => {
      const userId = asString(member.user_id);
      const organizationId = asString(member.organization_id);
      const profile = userId ? profilesById.get(userId) ?? null : null;
      const organization = organizationId
        ? organizationsById.get(organizationId) ?? null
        : null;
      return {
        ...member,
        profile,
        organization,
        display_name:
          (profile ? asString(profile.nickname) : null) ||
          asString((member.metadata as Row | null)?.display_name) ||
          "机构成员",
      };
    });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      organization_ids: auth.manageableOrganizationIds,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    if (auth.manageableOrganizationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "仅机构所有者或管理员可添加团队成员" },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Row;
    const requestedOrgId = cleanText(body.organization_id);
    const organizationId = requestedOrgId || auth.manageableOrganizationIds[0];
    if (!auth.manageableOrganizationIds.includes(organizationId)) {
      return NextResponse.json({ success: false, error: "无权管理该机构" }, { status: 403 });
    }

    const role = cleanText(body.role) || "advisor";
    if (!MEMBER_ROLES.has(role)) {
      return NextResponse.json({ success: false, error: "无效成员角色" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const email = normalizeEmail(body.email);
    let userId = cleanText(body.user_id);
    if (!userId && email) {
      userId = (await findUserIdByEmail(supabase, email)) ?? "";
    }
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "未找到已注册用户，请先让对方完成注册" },
        { status: 404 }
      );
    }

    const displayName = cleanText(body.display_name);
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id,nickname,avatar_url,role,user_role,user_type")
      .eq("id", userId)
      .maybeSingle();
    const memberName =
      displayName ||
      cleanText((profile as Row | null)?.nickname) ||
      (email ? email.split("@")[0] : "机构成员");

    const { data: existing, error: existingError } = await supabase
      .from("organization_members")
      .select("id,organization_id,user_id,role,status,metadata,created_at,updated_at")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (existingError) return errorResponse(existingError);
    if (existing?.role === "owner") {
      return NextResponse.json(
        { success: false, error: "不能覆盖机构所有者角色" },
        { status: 400 }
      );
    }
    if (existing?.status === "active") {
      return NextResponse.json(
        { success: false, error: "该用户已是机构团队成员" },
        { status: 409 }
      );
    }

    const metadata = {
      ...objectMetadata((existing as Row | null)?.metadata),
      display_name: memberName,
      invited_by_user_id: auth.user.id,
      invited_at: new Date().toISOString(),
      ...(email ? { email } : {}),
    };

    const query = existing
      ? supabase
          .from("organization_members")
          .update({
            role,
            status: "invited",
            metadata,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
      : supabase.from("organization_members").insert({
          organization_id: organizationId,
          user_id: userId,
          role,
          status: "invited",
          metadata,
        });

    const { data: member, error } = await query
      .select("id,organization_id,user_id,role,status,metadata,created_at,updated_at")
      .single();
    if (error) return errorResponse(error);

    await createNotification(supabase, userId, {
      title: "你收到机构团队邀请",
      content: `${memberName}，请在「我的 - 团队邀请」中确认是否加入。`,
      type: "organization_member_invited",
      metadata: {
        organization_id: organizationId,
        member_id: member?.id,
        role,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...member,
          profile: profile ?? null,
          display_name: memberName,
        },
      },
      { status: existing ? 200 : 201 }
    );
  } catch (e) {
    return errorResponse(e);
  }
}

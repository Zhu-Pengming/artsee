import { NextRequest, NextResponse } from "next/server";
import { isAuthzResponse, requireUser } from "@/lib/api/authz";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function mapById(rows: Row[]) {
  const entries: Array<[string, Row]> = [];
  for (const row of rows) {
    const id = asString(row.id);
    if (id) entries.push([id, row]);
  }
  return new Map(entries);
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (isAuthzResponse(auth)) return auth.response;

    const supabase = createServiceClient();
    const { data: invitations, error } = await supabase
      .from("organization_members")
      .select("id,organization_id,user_id,role,status,metadata,created_at,updated_at")
      .eq("user_id", auth.user.id)
      .eq("status", "invited")
      .order("created_at", { ascending: false });

    if (error) return errorResponse(error);

    const rows = (invitations ?? []) as Row[];
    const organizationIds = Array.from(
      new Set(
        rows
          .map((row) => asString(row.organization_id))
          .filter((id): id is string => Boolean(id))
      )
    );
    const inviterIds = Array.from(
      new Set(
        rows
          .map((row) => {
            const metadata = row.metadata;
            if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
              return null;
            }
            return asString((metadata as Row).invited_by_user_id);
          })
          .filter((id): id is string => Boolean(id))
      )
    );

    const { data: organizations, error: organizationError } =
      organizationIds.length > 0
        ? await supabase
            .from("organizations")
            .select("id,name,type,status,verification_status")
            .in("id", organizationIds)
        : { data: [], error: null };
    if (organizationError) return errorResponse(organizationError);

    const { data: inviters, error: inviterError } =
      inviterIds.length > 0
        ? await supabase
            .from("user_profiles")
            .select("id,nickname,avatar_url")
            .in("id", inviterIds)
        : { data: [], error: null };
    if (inviterError) return errorResponse(inviterError);

    const organizationsById = mapById((organizations ?? []) as Row[]);
    const invitersById = mapById((inviters ?? []) as Row[]);
    const data = rows.map((row) => {
      const organizationId = asString(row.organization_id);
      const metadata =
        row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
          ? (row.metadata as Row)
          : {};
      const inviterId = asString(metadata.invited_by_user_id);
      return {
        ...row,
        organization: organizationId ? organizationsById.get(organizationId) ?? null : null,
        inviter: inviterId ? invitersById.get(inviterId) ?? null : null,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

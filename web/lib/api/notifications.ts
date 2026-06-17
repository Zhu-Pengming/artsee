import { createServiceClient } from "./supabase-service";

type ServiceClient = ReturnType<typeof createServiceClient>;

type NotificationPayload = {
  title: string;
  content?: string | null;
  type?: string;
  metadata?: Record<string, unknown>;
};

function uniq(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.length > 0)));
}

export async function createNotification(
  supabase: ServiceClient,
  userId: string | null | undefined,
  payload: NotificationPayload
) {
  if (!userId) return;
  await supabase.from("notifications").insert({
    user_id: userId,
    title: payload.title,
    content: payload.content ?? null,
    type: payload.type ?? "system",
    read_status: "unread",
    metadata: payload.metadata ?? {},
  });
}

export async function createNotifications(
  supabase: ServiceClient,
  userIds: string[],
  payload: NotificationPayload
) {
  const rows = uniq(userIds).map((userId) => ({
    user_id: userId,
    title: payload.title,
    content: payload.content ?? null,
    type: payload.type ?? "system",
    read_status: "unread",
    metadata: payload.metadata ?? {},
  }));
  if (rows.length === 0) return;
  await supabase.from("notifications").insert(rows);
}

export async function getOrganizationMemberUserIds(
  supabase: ServiceClient,
  organizationId: string | null | undefined
) {
  if (!organizationId) return [];
  const { data, error } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", organizationId)
    .eq("status", "active");
  if (error) return [];
  return (
    data
      ?.map((item) => item.user_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0) ??
    []
  );
}

export async function getOrganizationManagerUserIds(
  supabase: ServiceClient,
  organizationId: string | null | undefined
) {
  if (!organizationId) return [];
  const { data, error } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .in("role", ["owner", "admin"]);
  if (error) return [];
  return (
    data
      ?.map((item) => item.user_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0) ??
    []
  );
}

export async function notifyConsultationHandlers(
  supabase: ServiceClient,
  consultation: Record<string, unknown>,
  payload: NotificationPayload,
  excludeUserId?: string
) {
  const userIds: string[] = [];
  if (typeof consultation.assigned_to_user_id === "string") {
    userIds.push(consultation.assigned_to_user_id);
  }
  if (typeof consultation.assigned_to_org_id === "string") {
    userIds.push(
      ...(await getOrganizationMemberUserIds(
        supabase,
        consultation.assigned_to_org_id
      ))
    );
  }
  await createNotifications(
    supabase,
    excludeUserId ? userIds.filter((id) => id !== excludeUserId) : userIds,
    payload
  );
}

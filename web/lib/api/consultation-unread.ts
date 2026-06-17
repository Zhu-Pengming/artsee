import { createServiceClient } from "./supabase-service";

type ServiceClient = ReturnType<typeof createServiceClient>;
type ViewerRole = "student" | "handler";

function isMissingMessagesTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("consultation_messages"))
  );
}

export function isMissingReadColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    Boolean(err.message?.includes("student_last_read_at")) ||
    Boolean(err.message?.includes("handler_last_read_at")) ||
    Boolean(err.message?.includes("schema cache"))
  );
}

export async function attachConsultationUnreadCounts<T extends Record<string, unknown>>(
  supabase: ServiceClient,
  consultations: T[],
  viewerRole: ViewerRole
) {
  const ids = consultations
    .map((item) => item.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  if (ids.length === 0) return consultations.map((item) => ({ ...item, unread_count: 0 }));

  const { data, error } = await supabase
    .from("consultation_messages")
    .select("consultation_id,sender_role,created_at")
    .in("consultation_id", ids);

  if (error) {
    if (isMissingMessagesTable(error)) {
      return consultations.map((item) => ({ ...item, unread_count: 0 }));
    }
    throw error;
  }

  const messages = data ?? [];
  return consultations.map((consultation) => {
    const readRaw =
      viewerRole === "student"
        ? consultation.student_last_read_at
        : consultation.handler_last_read_at;
    const lastRead = typeof readRaw === "string" ? Date.parse(readRaw) : 0;
    const unread = messages.filter((message) => {
      if (message.consultation_id !== consultation.id) return false;
      const role = message.sender_role?.toString();
      if (viewerRole === "student" && role === "student") return false;
      if (viewerRole === "handler" && role !== "student") return false;
      const created = Date.parse(message.created_at ?? "");
      if (Number.isNaN(created)) return false;
      return !lastRead || created > lastRead;
    }).length;
    return { ...consultation, unread_count: unread };
  });
}

export async function markConsultationRead(
  supabase: ServiceClient,
  consultationId: string,
  viewerRole: ViewerRole
) {
  const column =
    viewerRole === "student" ? "student_last_read_at" : "handler_last_read_at";
  const { error } = await supabase
    .from("consultations")
    .update({ [column]: new Date().toISOString() })
    .eq("id", consultationId);
  if (error && !isMissingReadColumn(error)) throw error;
}

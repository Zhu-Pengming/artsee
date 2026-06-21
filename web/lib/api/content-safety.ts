import { requestTencentCloudApi } from "@/lib/api/tencent-cloud";

export type AuditSuggestion = "pass" | "review" | "block";

export type AuditItemResult = {
  type: "text" | "image";
  suggestion: AuditSuggestion;
  label: string | null;
  sub_label: string | null;
  score: number | null;
  request_id: string | null;
  raw: unknown;
};

export type AuditContentInput = {
  userId: string;
  text?: string;
  imageUrls?: string[];
  scene?: string;
  dataId?: string;
};

export type AuditContentResult = {
  provider: "tencent_cloud";
  suggestion: AuditSuggestion;
  audit_status: "approved" | "reviewing" | "rejected";
  items: AuditItemResult[];
};

type TencentModerationEnvelope = {
  Response?: {
    Error?: {
      Code?: string;
      Message?: string;
    };
    Suggestion?: string;
    Label?: string;
    SubLabel?: string;
    Score?: number;
    RequestId?: string;
    [key: string]: unknown;
  };
};

const TEXT_ENDPOINT =
  process.env.TENCENT_CONTENT_SAFETY_TEXT_ENDPOINT || "tms.tencentcloudapi.com";
const IMAGE_ENDPOINT =
  process.env.TENCENT_CONTENT_SAFETY_IMAGE_ENDPOINT || "ims.tencentcloudapi.com";
const TEXT_ACTION = process.env.TENCENT_CONTENT_SAFETY_TEXT_ACTION || "TextModeration";
const IMAGE_ACTION =
  process.env.TENCENT_CONTENT_SAFETY_IMAGE_ACTION || "ImageModeration";
const API_VERSION = process.env.TENCENT_CONTENT_SAFETY_VERSION || "2020-12-29";

function toBase64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function cleanText(value: string | undefined) {
  return value?.trim() ?? "";
}

function normalizeSuggestion(value: unknown): AuditSuggestion {
  const suggestion = String(value ?? "").toLowerCase();
  if (["block", "reject", "forbid"].includes(suggestion)) return "block";
  if (["review", "manual"].includes(suggestion)) return "review";
  return "pass";
}

function auditStatusForSuggestion(suggestion: AuditSuggestion) {
  if (suggestion === "block") return "rejected";
  if (suggestion === "review") return "reviewing";
  return "approved";
}

function mergeSuggestions(items: AuditItemResult[]): AuditSuggestion {
  if (items.some((item) => item.suggestion === "block")) return "block";
  if (items.some((item) => item.suggestion === "review")) return "review";
  return "pass";
}

function parseModerationResponse(
  type: AuditItemResult["type"],
  payload: TencentModerationEnvelope
): AuditItemResult {
  const response = payload.Response ?? {};
  if (response.Error) {
    throw new Error(
      `腾讯云内容安全失败: ${response.Error.Code ?? "Unknown"} ${response.Error.Message ?? ""}`.trim()
    );
  }
  return {
    type,
    suggestion: normalizeSuggestion(response.Suggestion),
    label: typeof response.Label === "string" ? response.Label : null,
    sub_label: typeof response.SubLabel === "string" ? response.SubLabel : null,
    score: typeof response.Score === "number" ? response.Score : null,
    request_id: typeof response.RequestId === "string" ? response.RequestId : null,
    raw: response,
  };
}

async function auditText(input: AuditContentInput) {
  const text = cleanText(input.text);
  if (!text) return null;

  const payload: Record<string, unknown> = {
    Content: toBase64(text),
    DataId: input.dataId || `text-${Date.now()}`,
    User: { UserId: input.userId },
  };
  const bizType = process.env.TENCENT_CONTENT_SAFETY_TEXT_BIZ_TYPE?.trim();
  if (bizType) payload.BizType = bizType;

  const response = await requestTencentCloudApi<TencentModerationEnvelope>({
    service: "tms",
    endpoint: TEXT_ENDPOINT,
    action: TEXT_ACTION,
    version: API_VERSION,
    region: process.env.TENCENT_CLOUD_REGION?.trim(),
    payload,
  });
  return parseModerationResponse("text", response);
}

async function auditImage(input: AuditContentInput, url: string, index: number) {
  const payload: Record<string, unknown> = {
    FileUrl: url,
    DataId: input.dataId ? `${input.dataId}-image-${index}` : `image-${Date.now()}-${index}`,
    User: { UserId: input.userId },
  };
  const bizType = process.env.TENCENT_CONTENT_SAFETY_IMAGE_BIZ_TYPE?.trim();
  if (bizType) payload.BizType = bizType;

  const response = await requestTencentCloudApi<TencentModerationEnvelope>({
    service: "ims",
    endpoint: IMAGE_ENDPOINT,
    action: IMAGE_ACTION,
    version: API_VERSION,
    region: process.env.TENCENT_CLOUD_REGION?.trim(),
    payload,
  });
  return parseModerationResponse("image", response);
}

export async function auditContent(
  input: AuditContentInput
): Promise<AuditContentResult> {
  const imageUrls = (input.imageUrls ?? [])
    .map((url) => url.trim())
    .filter(Boolean);
  const textResult = await auditText(input);
  const imageResults = await Promise.all(
    imageUrls.map((url, index) => auditImage(input, url, index))
  );
  const items = [textResult, ...imageResults].filter(Boolean) as AuditItemResult[];
  const suggestion = mergeSuggestions(items);

  return {
    provider: "tencent_cloud",
    suggestion,
    audit_status: auditStatusForSuggestion(suggestion),
    items,
  };
}

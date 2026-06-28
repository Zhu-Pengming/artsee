import { createHmac } from "crypto";
import { deflateSync } from "zlib";

export class TencentImConfigError extends Error {
  constructor(public readonly missing: string[]) {
    super(`缺少或无效的腾讯云 IM 配置: ${missing.join(", ")}`);
    this.name = "TencentImConfigError";
  }
}

export type TencentImConfig = {
  sdkAppId: number;
  secretKey: string;
  adminUserId: string;
  expireSeconds: number;
  restHost: string;
};

export type TencentImLoginConfig = {
  sdk_app_id: number;
  identifier: string;
  user_sig: string;
  expires_in: number;
  expires_at: string;
  account_sync: "synced" | "skipped" | "failed";
};

type TencentImRestEnvelope = {
  ActionStatus?: string;
  ErrorInfo?: string;
  ErrorCode?: number;
};

type TencentImFriendAddEnvelope = TencentImRestEnvelope & {
  ResultItem?: Array<{
    To_Account?: string;
    ResultCode?: number;
    ResultInfo?: string;
  }>;
  Fail_Account?: string[];
};

const DEFAULT_ADMIN_USER_ID = "administrator";
const DEFAULT_EXPIRE_SECONDS = 7 * 24 * 60 * 60;

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getTencentImConfig(): TencentImConfig {
  const sdkAppIdRaw = process.env.TENCENT_IM_SDK_APP_ID?.trim();
  const secretKey = process.env.TENCENT_IM_SECRET_KEY?.trim();
  const sdkAppId = Number.parseInt(sdkAppIdRaw ?? "", 10);
  const validSdkAppId =
    Boolean(sdkAppIdRaw) &&
    /^\d+$/.test(sdkAppIdRaw!) &&
    Number.isSafeInteger(sdkAppId) &&
    sdkAppId > 0;
  const validSecretKey =
    Boolean(secretKey) &&
    secretKey!.length >= 20 &&
    !/^\d+$/.test(secretKey!);
  const missing = [
    !validSdkAppId ? "TENCENT_IM_SDK_APP_ID" : null,
    !validSecretKey ? "TENCENT_IM_SECRET_KEY" : null,
  ].filter(Boolean) as string[];

  if (missing.length > 0) throw new TencentImConfigError(missing);

  return {
    sdkAppId,
    secretKey: secretKey!,
    adminUserId:
      process.env.TENCENT_IM_ADMIN_USER_ID?.trim() || DEFAULT_ADMIN_USER_ID,
    expireSeconds: parsePositiveInt(
      process.env.TENCENT_IM_USER_SIG_EXPIRES_SECONDS,
      DEFAULT_EXPIRE_SECONDS
    ),
    restHost:
      process.env.TENCENT_IM_REST_HOST?.trim().replace(/^https?:\/\//, "") ||
      "console.tim.qq.com",
  };
}

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "*")
    .replace(/\//g, "-")
    .replace(/=/g, "_");
}

export function buildTencentImIdentifier(userId: string) {
  return `artsee_${userId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

export function generateTencentImUserSig(input: {
  sdkAppId: number;
  secretKey: string;
  identifier: string;
  expireSeconds: number;
  nowSeconds?: number;
}) {
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const signContent = [
    `TLS.identifier:${input.identifier}`,
    `TLS.sdkappid:${input.sdkAppId}`,
    `TLS.time:${now}`,
    `TLS.expire:${input.expireSeconds}`,
    "",
  ].join("\n");
  const sig = createHmac("sha256", input.secretKey)
    .update(signContent, "utf8")
    .digest("base64");
  const payload = {
    "TLS.ver": "2.0",
    "TLS.identifier": input.identifier,
    "TLS.sdkappid": input.sdkAppId,
    "TLS.expire": input.expireSeconds,
    "TLS.time": now,
    "TLS.sig": sig,
  };
  return base64UrlEncode(deflateSync(JSON.stringify(payload)));
}

async function callTencentImRest<T extends TencentImRestEnvelope>(
  command: string,
  body: Record<string, unknown>
): Promise<T> {
  const config = getTencentImConfig();
  const random = Math.floor(Math.random() * 4294967295);
  const userSig = generateTencentImUserSig({
    sdkAppId: config.sdkAppId,
    secretKey: config.secretKey,
    identifier: config.adminUserId,
    expireSeconds: config.expireSeconds,
  });
  const url = new URL(`https://${config.restHost}/v4/${command}`);
  url.searchParams.set("sdkappid", String(config.sdkAppId));
  url.searchParams.set("identifier", config.adminUserId);
  url.searchParams.set("usersig", userSig);
  url.searchParams.set("random", String(random));
  url.searchParams.set("contenttype", "json");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !json) {
    throw new Error(`腾讯云 IM 请求失败: ${response.status} ${response.statusText}`);
  }
  if (json.ActionStatus === "FAIL" && json.ErrorCode !== 0) {
    throw new Error(
      `腾讯云 IM 请求失败: ${json.ErrorCode ?? "Unknown"} ${json.ErrorInfo ?? ""}`.trim()
    );
  }
  return json;
}

export async function ensureTencentImAccount(input: {
  identifier: string;
  nickname?: string | null;
  avatarUrl?: string | null;
}) {
  await callTencentImRest("im_open_login_svc/account_import", {
    UserID: input.identifier,
    Nick: input.nickname || input.identifier,
    FaceUrl: input.avatarUrl || undefined,
  });
}

export async function ensureTencentImAccounts(
  users: Array<{
    userId: string;
    nickname?: string | null;
    avatarUrl?: string | null;
  }>
) {
  if (process.env.TENCENT_IM_SKIP_ACCOUNT_IMPORT === "1") return;
  await Promise.all(
    users.map((user) =>
      ensureTencentImAccount({
        identifier: buildTencentImIdentifier(user.userId),
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      })
    )
  );
}

export async function ensureTencentImFriendship(input: {
  fromUserId: string;
  toUserId: string;
  fromNickname?: string | null;
  fromAvatarUrl?: string | null;
  toNickname?: string | null;
  toAvatarUrl?: string | null;
  addWording?: string | null;
}) {
  if (process.env.TENCENT_IM_SKIP_FRIENDSHIP_SYNC === "1") {
    return { status: "skipped" as const };
  }

  const fromIdentifier = buildTencentImIdentifier(input.fromUserId);
  const toIdentifier = buildTencentImIdentifier(input.toUserId);
  await ensureTencentImAccounts([
    {
      userId: input.fromUserId,
      nickname: input.fromNickname,
      avatarUrl: input.fromAvatarUrl,
    },
    {
      userId: input.toUserId,
      nickname: input.toNickname,
      avatarUrl: input.toAvatarUrl,
    },
  ]);

  const response = await callTencentImRest<TencentImFriendAddEnvelope>(
    "sns/friend_add",
    {
      From_Account: fromIdentifier,
      AddFriendItem: [
        {
          To_Account: toIdentifier,
          Remark: input.toNickname || undefined,
          AddSource: "AddSource_Type_Artsee",
          AddWording: input.addWording || "来自 Artsee 艺见心",
        },
      ],
      AddType: "Add_Type_Both",
      ForceAddFlags: 1,
    }
  );
  const item = response.ResultItem?.[0];
  const resultCode = item?.ResultCode ?? response.ErrorCode ?? 0;
  if (resultCode !== 0 && resultCode !== 30015) {
    throw new Error(
      `腾讯云 IM 添加好友失败: ${resultCode} ${item?.ResultInfo || response.ErrorInfo || ""}`.trim()
    );
  }

  return {
    status: resultCode === 30015 ? ("exists" as const) : ("synced" as const),
    code: resultCode,
  };
}

export async function createTencentImLoginConfig(input: {
  userId: string;
  nickname?: string | null;
  avatarUrl?: string | null;
}): Promise<TencentImLoginConfig> {
  const config = getTencentImConfig();
  const identifier = buildTencentImIdentifier(input.userId);
  let accountSync: TencentImLoginConfig["account_sync"] = "synced";
  if (process.env.TENCENT_IM_SKIP_ACCOUNT_IMPORT === "1") {
    accountSync = "skipped";
  } else {
    try {
      await ensureTencentImAccount({
        identifier,
        nickname: input.nickname,
        avatarUrl: input.avatarUrl,
      });
    } catch (error) {
      accountSync = "failed";
      throw error;
    }
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = new Date(
    (nowSeconds + config.expireSeconds) * 1000
  ).toISOString();

  return {
    sdk_app_id: config.sdkAppId,
    identifier,
    user_sig: generateTencentImUserSig({
      sdkAppId: config.sdkAppId,
      secretKey: config.secretKey,
      identifier,
      expireSeconds: config.expireSeconds,
      nowSeconds,
    }),
    expires_in: config.expireSeconds,
    expires_at: expiresAt,
    account_sync: accountSync,
  };
}

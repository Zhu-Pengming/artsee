import { createHash, createHmac } from "crypto";
import {
  getTencentCloudCredentials,
  TencentCloudConfigError,
} from "@/lib/api/tencent-cloud";

export type TencentCosSignInput = {
  userId: string;
  fileName: string;
  contentType: string;
  scene?: string;
  expiresIn?: number;
};

export type TencentCosSignedUpload = {
  provider: "tencent_cos";
  method: "PUT";
  upload_url: string;
  public_url: string;
  headers: Record<string, string>;
  bucket: string;
  region: string;
  key: string;
  expires_in: number;
};

const DEFAULT_EXPIRES_IN = 15 * 60;

function getCosConfig() {
  const bucket = process.env.TENCENT_COS_BUCKET?.trim();
  const region =
    process.env.TENCENT_COS_REGION?.trim() ||
    process.env.TENCENT_CLOUD_REGION?.trim();
  const missing = [
    !bucket ? "TENCENT_COS_BUCKET" : null,
    !region ? "TENCENT_COS_REGION" : null,
  ].filter(Boolean) as string[];

  if (missing.length > 0) throw new TencentCloudConfigError(missing);

  return {
    bucket: bucket!,
    region: region!,
    publicBaseUrl: process.env.TENCENT_COS_PUBLIC_BASE_URL?.trim() || "",
  };
}

function sha1Hex(value: string) {
  return createHash("sha1").update(value, "utf8").digest("hex");
}

function hmacSha1Hex(key: string | Buffer, value: string) {
  return createHmac("sha1", key).update(value, "utf8").digest("hex");
}

function encodePath(key: string) {
  return `/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function encodeHeader(value: string) {
  return encodeURIComponent(value.trim());
}

function cleanPathPart(value: string, fallback: string) {
  const safe = value.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^_+|_+$/g, "");
  return safe || fallback;
}

function cleanScene(value: string | undefined) {
  return (value || "uploads")
    .split("/")
    .map((part) => cleanPathPart(part, "uploads"))
    .filter(Boolean)
    .join("/");
}

export function buildTencentCosObjectKey(input: TencentCosSignInput) {
  const timestamp = Date.now();
  const scene = cleanScene(input.scene);
  const fileName = cleanPathPart(input.fileName, "file");
  return `uploads/${input.userId}/${scene}/${timestamp}_${fileName}`;
}

export function createTencentCosPutSignature(
  input: TencentCosSignInput
): TencentCosSignedUpload {
  const credentials = getTencentCloudCredentials();
  const config = getCosConfig();
  const expiresIn = Math.max(60, input.expiresIn || DEFAULT_EXPIRES_IN);
  const now = Math.floor(Date.now() / 1000);
  const end = now + expiresIn;
  const keyTime = `${now};${end}`;
  const key = buildTencentCosObjectKey(input);
  const host = `${config.bucket}.cos.${config.region}.myqcloud.com`;
  const path = encodePath(key);
  const uploadUrl = `https://${host}${path}`;
  const publicUrl = config.publicBaseUrl
    ? `${config.publicBaseUrl.replace(/\/+$/, "")}${path}`
    : uploadUrl;

  const signedHeaders: Record<string, string> = {
    "content-type": input.contentType,
    host,
  };
  if (credentials.token) {
    signedHeaders["x-cos-security-token"] = credentials.token;
  }

  const headerKeys = Object.keys(signedHeaders).sort();
  const headerList = headerKeys.join(";");
  const formattedHeaders = headerKeys
    .map((name) => `${name}=${encodeHeader(signedHeaders[name])}`)
    .join("&");
  const httpString = [
    "put",
    path,
    "",
    formattedHeaders,
    "",
  ].join("\n");
  const stringToSign = ["sha1", keyTime, sha1Hex(httpString), ""].join("\n");
  const signingKey = hmacSha1Hex(credentials.secretKey, keyTime);
  const signature = hmacSha1Hex(signingKey, stringToSign);
  const authorization = [
    "q-sign-algorithm=sha1",
    `q-ak=${credentials.secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=${headerList}`,
    "q-url-param-list=",
    `q-signature=${signature}`,
  ].join("&");

  const headers: Record<string, string> = {
    Authorization: authorization,
    "Content-Type": input.contentType,
  };
  if (credentials.token) {
    headers["x-cos-security-token"] = credentials.token;
  }

  return {
    provider: "tencent_cos",
    method: "PUT",
    upload_url: uploadUrl,
    public_url: publicUrl,
    headers,
    bucket: config.bucket,
    region: config.region,
    key,
    expires_in: expiresIn,
  };
}

export function isOwnedTencentCosKey(key: string, userId: string) {
  return key.startsWith(`uploads/${userId}/`);
}

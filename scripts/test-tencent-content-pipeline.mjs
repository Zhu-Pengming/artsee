#!/usr/bin/env node
/**
 * End-to-end smoke test for the Tencent COS + content safety pipeline.
 *
 * Usage:
 *   BASE_URL=https://artiqore.com \
 *   LOGIN_EMAIL=dev.test@artsee.app \
 *   LOGIN_PASSWORD='ArtseeDev2026!' \
 *   node scripts/test-tencent-content-pipeline.mjs
 *
 * Optional:
 *   TEST_IMAGE_AUDIT=1  Also ask Tencent content safety to audit the uploaded image URL.
 */

const BASE_URL = (process.env.BASE_URL || "https://artiqore.com").replace(/\/+$/, "");
const LOGIN_EMAIL = process.env.LOGIN_EMAIL || "dev.test@artsee.app";
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || "ArtseeDev2026!";
const TEST_IMAGE_AUDIT = process.env.TEST_IMAGE_AUDIT === "1";

const png1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const json = await readJson(response);
  return { response, json };
}

async function main() {
  console.log(`Testing Tencent content pipeline against ${BASE_URL}`);

  const login = await api("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD }),
  });
  assert(login.response.ok, `login failed: ${JSON.stringify(login.json)}`);
  const token = login.json.token;
  assert(typeof token === "string" && token.length > 100, "login did not return a usable token");
  console.log("✓ login ok");

  const sign = await api("/api/v1/uploads/cos/sign", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      file_name: `pipeline-test-${Date.now()}.png`,
      content_type: "image/png",
      size: png1x1.length,
      scene: "community",
    }),
  });
  assert(sign.response.ok && sign.json.success, `COS sign failed: ${JSON.stringify(sign.json)}`);
  const signed = sign.json.data;
  assert(signed.upload_url && signed.public_url && signed.key, "COS sign response is incomplete");
  const qAk = String(signed.headers?.Authorization || "").match(/(?:^|&)q-ak=([^&]+)/)?.[1] || "";
  if (qAk && !qAk.startsWith("AKID")) {
    console.warn(
      `! COS signature q-ak is "${qAk}". Tencent SecretId usually starts with "AKID"; check TENCENT_CLOUD_SECRET_ID.`
    );
  }
  console.log(`✓ COS sign ok: ${signed.key}`);

  let putResponse;
  try {
    putResponse = await fetch(signed.upload_url, {
      method: signed.method || "PUT",
      headers: signed.headers || { "Content-Type": "image/png" },
      body: png1x1,
    });
  } catch (error) {
    const cause = error?.cause ? ` cause=${error.cause}` : "";
    throw new Error(`COS PUT request failed before HTTP response: ${error.message || error}${cause}`);
  }
  const putText = await putResponse.text();
  assert(
    putResponse.ok,
    `COS PUT failed: ${putResponse.status} ${putResponse.statusText} ${putText}`
  );
  console.log("✓ COS PUT ok");

  const complete = await api("/api/v1/uploads/cos/complete", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      key: signed.key,
      url: signed.public_url,
      bucket: signed.bucket,
      file_type: "image/png",
      scene: "community",
      size: png1x1.length,
    }),
  });
  assert(
    complete.response.ok && complete.json.success,
    `upload complete failed: ${JSON.stringify(complete.json)}`
  );
  console.log(`✓ upload complete ok: ${complete.json.data?.url || signed.public_url}`);

  const audit = await api("/api/v1/content/audit", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      text: "作品集进度分享，测试正常内容",
      image_urls: TEST_IMAGE_AUDIT ? [signed.public_url] : [],
      scene: "community_post",
      data_id: `pipeline-test-${Date.now()}`,
    }),
  });
  assert(audit.response.ok && audit.json.success, `content audit failed: ${JSON.stringify(audit.json)}`);
  console.log(
    `✓ content audit ok: ${audit.json.data?.audit_status} (${audit.json.data?.suggestion})`
  );

  const post = await api("/api/v1/community/posts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: "腾讯云链路测试",
      body: `自动化测试内容 ${new Date().toISOString()}`,
      image_urls: [],
      metadata: { kind: "pipeline_test" },
    }),
  });
  assert(post.response.ok && post.json.success, `community post failed: ${JSON.stringify(post.json)}`);
  console.log(
    `✓ community post ok: status=${post.json.data?.status}, audit_status=${post.json.data?.audit_status}`
  );

  console.log("All Tencent content pipeline checks passed.");
}

main().catch((error) => {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

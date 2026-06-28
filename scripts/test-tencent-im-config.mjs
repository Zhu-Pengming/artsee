#!/usr/bin/env node
/**
 * Smoke test for Tencent IM UserSig config.
 *
 * Usage:
 *   BASE_URL=https://artiqore.com \
 *   LOGIN_EMAIL=dev.test@artsee.app \
 *   LOGIN_PASSWORD='ArtseeDev2026!' \
 *   node scripts/test-tencent-im-config.mjs
 */

const BASE_URL = (process.env.BASE_URL || "https://artiqore.com").replace(/\/+$/, "");
const LOGIN_EMAIL = process.env.LOGIN_EMAIL || "dev.test@artsee.app";
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || "ArtseeDev2026!";

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
  console.log(`Testing Tencent IM config against ${BASE_URL}`);

  const login = await api("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD }),
  });
  assert(login.response.ok, `login failed: ${JSON.stringify(login.json)}`);
  const token = login.json.token;
  assert(typeof token === "string" && token.length > 100, "login did not return a usable token");
  console.log("✓ login ok");

  const config = await api("/api/v1/im/config", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(config.response.ok && config.json.success, `IM config failed: ${JSON.stringify(config.json)}`);
  const data = config.json.data;
  assert(Number.isInteger(data.sdk_app_id), "sdk_app_id missing");
  assert(typeof data.identifier === "string" && data.identifier.startsWith("artsee_"), "identifier missing");
  assert(typeof data.user_sig === "string" && data.user_sig.length > 100, "user_sig missing");
  assert(typeof data.expires_at === "string", "expires_at missing");

  console.log(`✓ IM config ok: sdk_app_id=${data.sdk_app_id}, identifier=${data.identifier}`);
  console.log(`✓ account sync: ${data.account_sync}`);
  console.log("Tencent IM config check passed.");
}

main().catch((error) => {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

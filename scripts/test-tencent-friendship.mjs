#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || process.env.BASE || "http://localhost:9090";
const email = process.env.TEST_EMAIL || "dev.test@artsee.app";
const password = process.env.TEST_PASSWORD || "ArtseeDev2026!";
const targetUserId = process.env.TARGET_USER_ID || process.argv[2];

if (!targetUserId) {
  console.error("Usage: TARGET_USER_ID=<supabase-user-id> node scripts/test-tencent-friendship.mjs");
  process.exit(1);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok || body?.success === false) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${text}`);
  }
  return body;
}

console.log(`Testing Tencent friendship pipeline against ${baseUrl}`);

const login = await request("/api/v1/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
const token =
  login.token ||
  login.data?.token ||
  login.data?.session?.access_token ||
  login.session?.access_token;

if (!token) {
  throw new Error("Login succeeded but no access token was returned");
}
console.log("✓ login ok");

const added = await request("/api/v1/me/friends", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    target_user_id: targetUserId,
    message: "你好，我在 Artsee 艺见心看到了你的主页。",
  }),
});

console.log(
  `✓ add friend ok: status=${added.data.status}, im_sync=${added.data.im_sync}, im=${added.data.im_identifier}`
);
if (added.data.conversation?.id) {
  console.log(`✓ direct conversation: ${added.data.conversation.id}`);
}

const friends = await request("/api/v1/me/friends?limit=20", {
  headers: { Authorization: `Bearer ${token}` },
});
const found = (friends.data || []).some((item) => item.friend_id === targetUserId);
if (!found) {
  throw new Error("Friend was added but not found in /api/v1/me/friends");
}

console.log(`✓ friend list ok: ${friends.data.length} active friend(s)`);
console.log("Tencent friendship pipeline check passed.");

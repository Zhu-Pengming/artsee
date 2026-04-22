/**
 * 自动化：打开站点 → 邮箱登录（开发者账号）→ 进入 /admin
 *
 * 用法：
 *   1) 先启动 Next：cd web && PORT=3003 npm run dev
 *   2) 项目根：npm run e2e:admin
 *
 * 环境变量（可选）：
 *   BASE_URL        默认 http://127.0.0.1:3003
 *   DEV_EMAIL       默认 dev.test@artsee.app
 *   DEV_PASSWORD    默认 ArtseeDev2026!
 *   CDP_URL         若已用「远程调试」启动 Chrome，可填 http://127.0.0.1:9222 以复用该浏览器
 *   HEADLESS=1      无头模式（CI）
 *   KEEP_OPEN=1     非无头、且非 CDP 时，成功进入 /admin 后先停留约 8s 再关闭脚本启动的 Chromium，便于你查看
 */
import { chromium } from "playwright";

const base = (process.env.BASE_URL || "http://127.0.0.1:3003").replace(/\/$/, "");
const email = process.env.DEV_EMAIL || "dev.test@artsee.app";
const password = process.env.DEV_PASSWORD || "ArtseeDev2026!";
const cdp = process.env.CDP_URL;
const headless = process.env.HEADLESS === "1" || process.env.HEADLESS === "true";
const keepOpen =
  process.env.KEEP_OPEN === "1" || process.env.KEEP_OPEN === "true";

async function main() {
  let browser;
  let page;

  if (cdp) {
    console.log("连接到已有 Chrome (CDP):", cdp);
    browser = await chromium.connectOverCDP(cdp);
    const ctx = browser.contexts()[0] || (await browser.newContext());
    page = ctx.pages()[0] || (await ctx.newPage());
  } else {
    console.log("启动 Chromium 窗口（或设置 CDP_URL 复用本机已开的 Chrome 调试实例）");
    browser = await chromium.launch({ headless, channel: undefined });
    const ctx = await browser.newContext();
    page = await ctx.newPage();
  }

  const loginUrl = `${base}/auth/login?redirect=/admin`;
  console.log("打开:", loginUrl);
  await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });

  await page.locator('input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole("button", { name: "登录" }).click();

  await page.waitForURL("**/admin**", { timeout: 60_000 });
  console.log("已进入管理后台:", page.url());

  if (!headless) {
    console.log("按 Ctrl+C 可结束。使用 CDP 时，断开连接后你当前 Chrome 窗口仍保留；脚本自启的 Chromium 默认会关窗。");
  }

  if (keepOpen && !headless && !cdp) {
    await page.waitForTimeout(8000);
  }

  if (cdp) {
    // 只断开与 CDP 的会话，不退出你已打开的 Chrome
    await browser.close();
  } else {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

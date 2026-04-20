# 开发者指南（扩展版）

**当前请以仓库根目录 [`../AGENTS.md`](../AGENTS.md) 为准**（极短结构 + 调试入口）。

下面保留部分**主题色、API 示例、表结构参考**等长文；架构上请注意：APP 在 `app/`，网站与统一 API 在 `web/`，数据库与迁移在 `supabase/`。

---

## 调试入口（强调）

调试僵局时**必须先读**：

**[`.cursor/skills/jinhui-stack-debug/SKILL.md`](../.cursor/skills/jinhui-stack-debug/SKILL.md)**

---

## 项目架构核心理解（摘要）

- **APP**：`app/`（Flutter）— 核心业务端之一。
- **Web**：`web/`（Next.js）— 站点 + `/api/v1/*` BFF。
- **数据**：Supabase；敏感逻辑走 Next API，勿在客户端暴露 service role。

### 架构关系（示意）

```
用户 → APP (Flutter) → Web API (Next.js) → Database (Supabase)
         │                      │
         └─ 亦可：Supabase Auth / Storage（与后端约定一致）
```

## 青花瓷主题色值

```css
--porcelain-blue-dark: #16315C;
--porcelain-blue: #345C8C;
--porcelain-blue-light: #2279A2;
--porcelain-blue-pale: #9FB7CC;
--porcelain-white: #F7F4EF;
--ink-black: #2B2B2D;
```

## 开发者测试账号

与 `app/lib/config/dev_test_account.dart` 一致；同步用户：`npm run ensure:dev-user`（需根目录 `.env` 中 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`）。

| 字段 | 值 |
|------|-----|
| 邮箱 | `dev.test@artsee.app` |
| 密码 | `ArtseeDev2026!` |

## 注意事项

1. 勿在 APP 暴露 `SUPABASE_SERVICE_ROLE_KEY`。
2. 敏感写操作在 Web 后端完成。
3. 图片等大资源走 Storage/CDN，勿把二进制塞数据库。

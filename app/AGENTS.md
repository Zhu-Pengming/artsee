# Artsee Flutter（`app/`）

更完整的仓库级说明见 [`../docs/AGENTS.md`](../docs/AGENTS.md)。

## 开发者测试账号

与 `lib/config/dev_test_account.dart` 保持一致：

| 字段 | 值 |
|------|-----|
| 邮箱 | `dev.test@artsee.app` |
| 密码 | `ArtseeDev2026!` |

在 Supabase 中创建该用户：项目根目录执行 `npm run ensure:dev-user`（需配置 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`）。

登录页在 **Debug** 或 **`--dart-define=DEV_LOGIN=true`** 下会显示「开发者快速登录」。

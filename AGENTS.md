# UI reference source of truth

For all product frontend UI work, the live code path is the Flutter app in `app/lib/`.

- The production public site (`/`) is Flutter Web built from `app/` and served as static files by Nginx.
- Next.js in `web/` serves `/admin` and `/api/*` only in production.
- `web/app/artiqore-ui/` is an older/adapted React reference shell and must not be treated as the production public frontend.
- Use `artiqore-艺见心-网页版前端与ui(1)/src` only as a visual reference when updating Flutter UI in `app/lib/` or admin UI in `web/app/admin/`.
- Do not use `artlink-reference/` as the current UI baseline. It is an older April 2026 reference and must not override the current 艺见心 design.

# Artsee / Artiqore 艺见心 — Agent 速览

面向 AI 与协作者：**先读本段结构，再改代码。**

## 项目是什么

艺术留学方向产品：**Flutter 移动客户端** + **Next.js 站点与 API**，数据落在 **Supabase**（Auth + Postgres + Storage）。业务上含社区图文、院校项目、案例与论坛等。

## 三部分怎么分

| 部分 | 路径 | 职责 |
|------|------|------|
| **APP / Flutter Web 主站** | `app/` | Flutter 客户端与生产主站前台；登录、首页、发现、合作、学习、我的等。**优先**通过 HTTP 调 `web` 的 `/api/v1/*`（见 `lib/services/backend_api_service.dart`、`lib/config/api_config.dart`），必要时仍可直连 Supabase（如 Auth、Storage）。 |
| **网站后台 / BFF** | `web/` | Next.js：生产只服务 `/admin` 管理后台与 `/api/v1/**` 对外 API（BFF）。本地开发默认端口 **9090**。不要把 `web/app/artiqore-ui/` 当生产前台改。 |
| **通用后端** | `web/app/api/` + Supabase | **业务规则与敏感写操作**放在 Next Route Handlers；数据库模式与 RLS 在 `supabase/migrations/`。不要把 `service_role` 塞进 APP。 |

根目录另有脚本与健康检查：`npm run test:backend`、`npm run test:web`、`scripts/ensure-dev-test-user.mjs`。


## 测试文件位置

| 层级 | 路径 | 如何运行 | 说明 |
|------|------|----------|------|
| **后端（Supabase，重点）** | **`tests/backend/supabase-health.mjs`** | 项目根：`npm run test:backend` | **集成健康检查**：只读探测 DB / Auth / Storage 等，幂等、不写业务数据。需项目根 `.env` 中 **`SUPABASE_URL`** 与 **`SUPABASE_SERVICE_ROLE_KEY`**（脚本会尝试从 `.env` 加载）。与调试技能里「后端优先」约定一致，**改 API 或数据库前后建议先跑通本脚本**。 |
| Web（Next API 契约） | `web/tests/api/contract.test.ts` | `cd web && npm test`（根目录：`npm run test:web`） | Vitest；对部分 Route Handler 做 **HTTP 契约**（如 401/400/503），会 mock `supabase-service`。 |
| Flutter | `app/test/backend_api_parse_test.dart` | `cd app && flutter test` | 模型 `fromJson` 等与后端 JSON 形状对齐的 **单元测试**。 |
| Flutter（示例/待修） | `app/test/widget_test.dart` | 同上 | 默认模板引用 `MyApp`，与当前 `ArtseeApp` 不一致时需自行改写或跳过。 |

**后端测试强调：** 仓库里**唯一定位在「项目根 `tests/backend/`」**、且直接连 **Supabase 真实项目**做探测的，就是 **`supabase-health.mjs`**。它不替代 `web` 里的 Vitest，而是验证 **环境变量与数据库/Auth/存储是否可用**；本地/CI 若未配置上述两个 Supabase 变量，该命令会失败。

**非标准测试脚本（根目录，按需使用，勿与上面混淆）：** 历史上可能存在 `test_db.js`、`test_auth_db.js`、`delete_test_user.js` 等一次性脚本，**不属于**上述规范测试入口；新增自动化测试请放进 `tests/backend/`、`web/tests/` 或 `app/test/`。

## 开发者测试账号（Supabase Auth）

用于 **Next.js / Flutter 本地联调** 的固定账号，由脚本写入 Auth 与 `user_profiles`；与 `app/lib/config/dev_test_account.dart`、`scripts/ensure-dev-test-user.mjs` **必须一致**。

| 字段 | 值 |
|------|-----|
| 邮箱 | `dev.test@artsee.app` |
| 密码 | `ArtseeDev2026!` |
| 默认昵称（`user_profiles.nickname`） | `Artsee开发者` |
| 角色（`user_profiles.role`） | 脚本**尽量**写入 `admin`（若库中无 `role` 列会降级为仅 `nickname` 并告警） |

**权限说明：** 运行 `npm run ensure:dev-user` 时，在表结构支持的前提下会将 `role` 设为 `admin`，以便调用 `requireAdmin` 的写接口。若你本地/远程库尚未有 `role` 列，请先按 `docs/ADMIN_SETUP.md` 加列后重跑脚本，或在 Supabase 中手动将 `user_profiles.role` 设为 `admin`。

**后台说明页：** 登录邮箱账号后访问站点路径 **`/admin`**，可查看 BFF 根址、只读 API 链接及表数据管理提示（不替代 Supabase 控制台）。

**BFF 地址（本地）：** 以你启动 Next 时实际端口为准；Flutter Web 默认 `AppConfig` 中 `WEB_DEV_PORT` 多为 **3003**（portman 分配时亦可能占用该端口），文档亦常写 **9090** —— 以 `http://localhost:<端口>` 为 API 基址即可。

**创建或修复该用户（需 Service Role，勿提交仓库）：** 在项目根配置 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` 后执行：

```bash
npm run ensure:dev-user
```

**说明：** 用户 UUID 由 Supabase Auth 在首次创建时分配；若需核对，可在 Supabase Dashboard → Authentication → Users 中按邮箱搜索。APP 登录页在 Debug 或 `--dart-define=DEV_LOGIN=true` 时会预填上述邮箱与密码，并提供「一键登录」。

## 调试方案（必读技能）

**调试卡住时，先打开并按层排查：**

**[`.cursor/skills/jinhui-stack-debug/SKILL.md`](.cursor/skills/jinhui-stack-debug/SKILL.md)**

核心理念：**很多问题表象在前端，根因在后端/数据/环境/网络**。先验证接口与数据，再改 UI。同目录下还有数据、环境、网络、权限等子文档及测试集/迭代习惯等规范，按需展开。

## 可用 SKILL（第一优先级）

- 为本地开发服务器分配并注入唯一端口号，防止同一台电脑上多个项目的端口冲突。启动任何开发服务器前，务必先通过 portman 脚本从 ~/.port-man 获取端口，并以 PORT=<端口> 原命令 的方式注入启动（例如 PORT=3001 npm run dev）。适用于：(1) 启动 Vite、Webpack、Next.js、后端 API 等开发服务器，(2) 配置多服务项目，(3) 避免与已有项目占用 3000、8080 等常用端口冲突，(4) 查看或更新 ~/.port-man 全局端口注册表。：[port-manager](.kimi/skills/port-manager/SKILL.md)
- 网站和小程序调试的依赖关系排查指南。当调试陷入僵局时，Use this skill to systematically identify which dependency layer is causing the issue: (1) Data dependencies - verify backend before debugging frontend, (2) Environment differences - local vs production issues, (3) Version compatibility - library/framework mismatches, (4) Configuration errors - missing or incorrect configs, (5) State management - component/app state problems, (6) Network layer - CORS, timeouts, connectivity, (7) Permission/authorization - auth and access control, (8) Caching issues - stale code or data, (9) Build process - compilation and bundling problems, (10) Runtime environment - browser/platform differences。：[jinhui-stack-debug](.kimi/skills/jinhui-stack-debug/SKILL.md)

## 编程习惯与规范（精简）

- **小步提交**：改动聚焦需求；风格与现有文件一致（Dart/TS 各自惯例）。
- **密钥**：只放在 `.env` / 托管平台环境变量；仓库内仅有 `*.example`。
- **APP 基址**：模拟器默认连本机 Next（Android 用 `10.0.2.2:9090`）；生产用 `--dart-define=API_BASE_URL=...`。
- **Flutter Web 调试（Chrome）**：`flutter run -d chrome` 会自动启动/复用 Chrome 实例。**不要手动重复打开新 Chrome 窗口**，保持单一调试窗口即可避免端口冲突和调试会话中断。
- **测试**：见上文 **「测试文件位置」**；**后端**以 `tests/backend/supabase-health.mjs` + `npm run test:backend` 为先；`web` 用 Vitest；`app` 用 `flutter test`；关键契约勿只靠手动点。

## 远程服务器访问

| 主机 | SSH 入口 | 说明 |
|------|----------|------|
| 生产/部署服务器（Artsee Web / artiqore.com） | `ssh root@artiqore.com` | 公网解析为 **artiqore.com**（当前 A 记录约 **150.158.44.195**）。站点目录 **`~/website/artsee`**；Next.js 由 **PM2**（应用名 `artsee-web`，端口 **3000**）托管；**Nginx** 反代与 **Let’s Encrypt**（certbot）证书。本地发布：项目根 **`npm run deploy:web`**（`scripts/deploy-web.sh`，默认 `DEPLOY_HOST=artiqore.com`）。任何需要在服务器上执行的操作（部署、日志、重启、清理磁盘等），**请 SSH 登录后再执行**。 |

更细的目录说明与历史内容见 [`docs/AGENTS.md`](docs/AGENTS.md)；Flutter 子目录补充见 [`app/AGENTS.md`](app/AGENTS.md)。

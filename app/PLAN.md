# Artsee / Artiqore APP — 客户端改造 PLAN

> 对照《艺术垂直生态 APP 项目开发计划书》（合同编号 APPDEV-2026-001，节点二范围）盘点 `app/` 当前 Flutter 客户端与目标产品形态的差距，并给出落地清单。
>
> 配套后端 API 在 `web/app/api/v1/**`，本文只关注 **客户端（Flutter）**。本期不要求像素级 UI 完成度，**以"接通节点二接口、跑通核心闭环"为底线**。

---

## 1. 现状速览

当前 `app/lib/` 的产品形态是"艺见心 / Artiqore 艺术留学"客户端（参考 `artiqore-艺见心-网页版前端与ui(1)/`），主要面向 **艺术学子** 的院校与社区场景。

**当前 5 个底部 Tab**（见 `lib/screens/main_scaffold.dart`）：

| 当前 Tab | 对应屏 | 主要内容 |
|---|---|---|
| 首页 | `home/home_screen.dart` | 品牌头 + AI 搜索卡 + 入口卡片（AI 咨询 / 院校 / 灵感 / 社区） |
| 灵感 | `explore/explore_screen.dart` | 4 TabBar：作品 / 资讯 / 社区 / …（接 `BackendApiService`） |
| 院校 | `schools/school_list_screen.dart` | 院校列表 + 详情 + 专业 |
| 社区 | `forum/forum_screen.dart` | "学习页" 3 TabBar（含 AI 咨询入口） |
| 我的 | `profile/profile_screen.dart` | 资料 / 订单 / 主题切换 / 退出 |

**已具备能力**：

- Supabase Auth 登录 / dev 账号一键登录（`config/dev_test_account.dart`）
- 通过 `services/backend_api_service.dart` 走 Next.js BFF（`/api/v1/*`）：院校、专业、案例、社区帖等
- `tools/ai_consult_screen.dart`：AI 对话 + 「对比选校」雷达图
- 主题系统（青花调）、`models/models.dart`、`mock_data`

**与合同目标的整体差距**：合同要求的是一个 **更宽** 的"艺术垂直生态" APP（C 端学子 + 艺术家 + 高端爱好者 + B 端机构），当前客户端只覆盖了"艺术学子"这一支。**信息架构需要重排**，并新增"活动 / 合作机会 / 作品管理 / 认证 / 学习中心 / 通知"等核心模块。

---

## 2. 目标信息架构 vs 当前

合同 §3 给出的目标底部导航是 **首页 / 资讯 / 活动 / 发现 / 我的**。建议按下表迁移：

| 目标 Tab | 合同定义 | 当前对应 | 改造动作 |
|---|---|---|---|
| 首页 | AI 问答聚合入口 + 快捷指令 + 推荐卡片 + 结果卡片 | `home_screen.dart` + `ai_consult_screen.dart` | **保留并强化**：AI 输入框升级为唯一主入口，输出结构化结果卡片（院校 / 活动 / 合作 / 作品 / 课程） |
| 资讯 | 院校 / 专业 / 排名 / 申请工具箱 / 资讯文章 / 对比 | `schools/*` + `explore_screen.dart` 的"资讯"Tab | **合并重组**：把当前"院校" Tab 与"灵感→资讯"合并为一个资讯中心 |
| 活动 | 顶奢酒店艺术活动：列表 / 详情 / 报名 / 审核 / 核销 | **缺失** | **新建** `screens/events/` |
| 发现 | B 端合作机会 / 艺术家库 / 作品 / 线上展厅 | `explore_screen.dart` 的"作品 / 社区"Tab（仅一部分） | **重构**：现 inspiration feed 改造为"合作机会 + 艺术家库 + 作品流" |
| 我的 | 资料 / 认证 / 作品管理 / 合作追踪 / 学习中心 / 收益 / 设置 | `profile/profile_screen.dart`（仅资料 + 订单） | **扩展**：补全认证、作品、合作、学习、收益、通知入口 |

> 实施建议：**先动 `main_scaffold.dart` 的 5 个 Tab 命名与跳转**，把现有页面挂到新位置；再逐 Tab 补能力，避免一次性重写。

---

## 3. 节点二客户端必做清单（按优先级）

### P0 — 与节点二后端接口必须打通

这些是合同 §7.3 验收清单里"核心接口正常调用无报错"的客户端侧体现，**必做**。

- **重排底部导航**：`main_scaffold.dart` 5 Tab 改为 **首页 / 资讯 / 活动 / 发现 / 我的**；中间"+"按钮的语义改为「发起 AI 提问 / 发布作品 / 创建动态」聚合 sheet。
- **首页 AI 入口**：
  - 接 `POST /api/v1/ai/chat`（或现有 `/api/v1/ai/consult`），落库 `ai_sessions` / `ai_messages`。
  - 快捷指令标签（院校 / 活动 / 合作 / 作品集 / 课程）走 `POST /ai/quick-command`。
  - 推荐卡片走 `GET /ai/recommend-cards`，结果支持点击跳转到对应详情页。
  - 结构化结果卡片：在 `_MessageBubble` 中按 `metadata.cards[]` 渲染（type=school/event/opportunity/artwork/course）。
- **认证体系对齐角色**：当前只有 `登录 / 未登录` 两态，需扩展到合同 §2.3 的 7 类角色。
  - 在 `models/` 新增 `UserRole` 枚举；`SupabaseService` 拉取 `user_profiles.role` 并暴露。
  - 受限页面（B 端合作申请、艺术家发布作品等）在入口处做角色 Guard。
- **身份认证提交**：`screens/profile/` 新建"我的认证"页，对接 `POST /verifications` + `GET /verifications/me`，支持 4 类（学子 / 艺术家 / 爱好者 / B 端）资料上传与状态展示。
- **文件上传**：把 `services/storage_service.dart` 的直连 Supabase Storage 替换/补充为 `POST /api/v1/upload`，统一返回 `{url, file_type, scene}`。
- **统一错误码**：`BackendApiService._decodeBody` 现在只抛 `Exception(error)`，需改为解析 `{code, message, data, requestId}`，并在 UI 层根据 `code` 段（4xxxx / 5xxxx）给出可读提示。
- **错误重试与登录失效兜底**：401 / token 过期自动调 `/auth/refresh-token`，失败则跳登录页。

### P1 — 节点二验收功能闭环

- **活动模块（全新）** `screens/events/`：
  - `event_list_screen.dart`：城市 + 时间 + 标签筛选；接 `GET /events`。
  - `event_detail_screen.dart`：嘉宾 / 流程 / 费用 / 名额；接 `GET /events/{id}`。
  - `event_apply_sheet.dart`：报名表单 + 状态轮询；接 `POST /events/{id}/apply` 与 `GET /events/applications/me`。
  - "我的活动"页：报名列表 + 电子票（QR）+ 核销码；接 `POST /events/{id}/checkin`。
- **合作机会模块（全新）** `screens/opportunities/`：
  - 列表（类型 / 预算 / 地域 / 截止）：`GET /opportunities`。
  - 详情 + 申请：`POST /opportunities/{id}/apply`，提交作品 ID 列表 + 报价 + 说明。
  - "我的合作"页：申请状态 + 项目节点；接 `/opportunity-applications/me`、`/projects/me`、`/projects/{id}/status`。
- **资讯 Tab 重组** `screens/news/`：
  - 顶部 TabBar：院校库（沿用现 `school_list_screen`）/ 排名榜单（`GET /rankings`）/ 资讯文章（`GET /articles`）/ 申请工具箱（`/application-tools/me`）。
  - **院校对比页**：当前 `ai_consult_screen` 的"对比选校"独立成 `compare_schools_screen.dart`，接 `POST /schools/compare`。
  - **申请工具箱**：时间线 + 材料清单 + 进度勾选，绑定 `application_tools` 表。
- **发现 Tab 重构** `screens/discover/`：
  - 顶部 TabBar：合作机会 / 艺术家库 / 作品流 / 线上展厅。
  - 艺术家库：`GET /artists`、`GET /artists/{id}`。
  - 作品流：复用 `explore` 现有作品瀑布流，但接 `GET /artworks` 并支持 `category / visibility` 筛选。
- **作品管理（我的）** `screens/profile/artworks/`：
  - 上传 / 编辑 / 软删除：`POST/PUT/DELETE /artworks`。
  - 数据统计页：浏览 / 点赞 / 收藏 / 询盘，接 `GET /artworks/{id}/stats`。
  - 公开范围（公开 / 仅平台 / 仅合作方）UI 控件。
- **学习中心（我的）** `screens/profile/learning/`：
  - 我的课程（`GET /learning/me`）+ 作品集指导（`GET /portfolio-reviews/me`）+ 实训机会（`GET /internships`）。
  - 节点二不接真实支付，"购买课程" → `POST /courses/{id}/enroll` 仅落订单。
- **通知中心**：右上角铃铛入口；接 `GET /notifications`、`PUT /notifications/{id}/read`、`PUT /notifications/read-all`。

### P2 — 体验与质量

- **AI 流式对话**：将 `BackendApiService.aiChat` 替换为 `http.Client().send(Request)` 走 `/api/chat` 流式接口，`_MessageBubble` 支持逐字渲染。
- **AI 回复内嵌可点击卡片**（详见 system memory「AI Home 与 Web API 集成优化方案」）：院校 / 活动 / 合作 卡片直接跳详情。
- **角色 Guard 组件**：`widgets/role_guard.dart`，封装"需登录 / 需认证 / 需 B 端"三档拦截。
- **环境配置**：`config/api_config.dart` 新增 prod baseUrl（`https://artiqore.com`），由 `--dart-define=API_BASE_URL` 覆盖；移除散落的 `localhost:9090` 硬编码。
- **测试**：扩展 `app/test/backend_api_parse_test.dart`，覆盖 events / opportunities / artworks 三个新模型的 `fromJson`。

### P3 — 后续节点（节点二之外）

- 真实支付（活动费 / 课程 / 作品交易 / 合作佣金）
- 收益中心、提现
- 内容审核客户端侧 UI（仅显示状态）
- 站内私信
- 区块链版权存证对接
- B 端管理后台 H5（可独立项目）

---

## 4. 文件级改动建议

```
app/lib/
├── screens/
│   ├── main_scaffold.dart                # ✏️ 5 Tab 重排
│   ├── home/                             # ✏️ 强化 AI 首页 + 推荐卡片
│   ├── news/                             # 🆕 资讯 Tab（合并 schools + explore.资讯）
│   │   ├── news_scaffold.dart
│   │   ├── rankings_screen.dart
│   │   ├── articles_screen.dart
│   │   ├── compare_schools_screen.dart   # ← 从 ai_consult_screen 拆出
│   │   └── application_tools_screen.dart
│   ├── events/                           # 🆕 活动 Tab
│   │   ├── event_list_screen.dart
│   │   ├── event_detail_screen.dart
│   │   ├── event_apply_sheet.dart
│   │   ├── my_events_screen.dart
│   │   └── ticket_qr_screen.dart
│   ├── discover/                         # 🆕 发现 Tab（替代 explore_screen）
│   │   ├── discover_scaffold.dart
│   │   ├── opportunities_screen.dart
│   │   ├── opportunity_detail_screen.dart
│   │   ├── opportunity_apply_screen.dart
│   │   ├── artists_screen.dart
│   │   ├── artist_detail_screen.dart
│   │   └── artworks_feed_screen.dart
│   ├── profile/
│   │   ├── verifications_screen.dart     # 🆕 身份认证
│   │   ├── artworks/                     # 🆕 作品管理
│   │   ├── projects/                     # 🆕 合作追踪
│   │   ├── learning/                     # 🆕 学习中心
│   │   └── notifications_screen.dart     # 🆕
│   └── schools/                          # 保留，挂到 news/ 下
├── services/
│   ├── backend_api_service.dart          # ✏️ 统一错误码 + 新增 events/opportunities/artworks/notifications API
│   ├── upload_service.dart               # 🆕 走 /api/v1/upload
│   └── auth_service.dart                 # ✏️ refresh-token / 角色拉取
├── models/
│   └── models.dart                       # ✏️ +Event/Opportunity/Artwork/Notification/UserRole
└── widgets/
    └── role_guard.dart                   # 🆕
```

---

## 5. 节点二客户端验收口径（建议）

参照合同 §7.3，**客户端侧** 的"过线标准"：

1. **5 个 Tab 信息架构正确**：底部导航为首页 / 资讯 / 活动 / 发现 / 我的，可跳转无崩溃。
2. **登录 + Token 刷新 + 角色 Guard** 三项跑通。
3. **AI 首页**：能发起对话、记录到 `ai_sessions/ai_messages`、推荐卡片可点击进入详情。
4. **资讯**：院校列表 / 详情 / 对比 / 资讯文章 / 申请工具箱五项接口可见可用。
5. **活动**：列表筛选 / 详情 / 报名 / 我的报名 / 核销码 五项可见可用。
6. **发现**：合作机会列表 + 详情 + 申请 + 我的申请，艺术家库列表 + 详情。
7. **我的**：资料编辑 / 身份认证提交 / 作品上传与软删 / 学习中心列表 / 通知。
8. **错误处理**：所有接口失败展示 `code + message`，401 自动 refresh / 跳登录。
9. **不依赖真实第三方支付、短信、AI 真实大模型效果**（合同 §10.2 / §10.6 已豁免）。

---

## 6. 执行建议（节点二窗口内）

按合同 §7.2 节点二排期（D1–D20）与后端并行，客户端建议分 4 轮：

- **R1（约 D2–D6）**：底部导航重排 + AI 首页强化 + 统一错误码与刷新 token。
- **R2（约 D7–D11）**：资讯 Tab 重组（院校 / 排名 / 资讯 / 工具箱 / 对比）。
- **R3（约 D12–D15）**：活动 Tab + 发现 Tab（合作机会 + 艺术家库）。
- **R4（约 D16–D19）**：我的扩展（认证 / 作品 / 合作 / 学习 / 通知）+ 自测 + 修缮。

> 风险与缓解参考合同 §10：节点二客户端**优先保证"接口跑通 + 状态可视"**，UI 像素级精修与真实数据填充放到节点三。

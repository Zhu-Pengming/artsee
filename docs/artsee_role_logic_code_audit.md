# Artsee 角色与产品逻辑代码核对清单

> 用途：对照修改 App、Web 与 BFF/数据库代码。本文只记录当前检查结论与建议，不包含密钥原文。

## 0. 总结

这套角色分析方向是对的，尤其“多重角色、角色冲突、角色距离”很适合 Artsee。但当前代码里的核心问题是：

- 产品画像角色、权限角色、付费权益、认证状态、机构成员身份混在一起。
- App / Web / BFF / Supabase 之间还没有统一的角色语义源头。
- Web 端 auth/profile 契约有明显错位。
- App 仍有直连 Supabase 能力，数据库 RLS 必须兜底，否则 BFF 的业务校验可能被绕过。
- 当前 MVP 更接近“艺术留学 + 会员咨询匹配 + 机构工作台”，艺术家交易、版权授权、收藏交易、酒店采购应先标为 future state。
- 架构纠偏：生产主站 `/` 是 Flutter Web（`app/` 构建产物），Next.js `web/` 在生产只服务 `/admin` 与 `/api/*`。因此前台 UI 修改应落在 `app/lib/`，不要把 `web/app/artiqore-ui/` 当生产前台验收对象。

建议把“角色”拆成六层：

| 层级 | 建议字段 / 来源 | 含义 |
| --- | --- | --- |
| 产品画像 | `student / parent / artist / collector` | 用户当前需求画像，不直接等于权限 |
| 账号类型 | `personal / business` | 个人账号或机构/商家账号 |
| 认证状态 | `pending / verified / rejected` | 平台信任状态 |
| 付费权益 | `free / member / org_subscription` | 会员、机构年费等商业权益 |
| 组织权限 | `owner / admin / advisor / member` | organization 内部工作权限 |
| 平台后台权限 | `user / admin / super_admin` | 管理后台权限 |

## 1. P0：必须优先修

### 1.1 移除并轮换泄露的 Supabase service role key

**现状**

- `docs/SETUP_DATABASE.md` 中出现完整 Supabase `service_role` key。

**风险**

- `service_role` 能绕过 RLS，是最高风险密钥。
- 如果已经提交过 Git 历史，应按泄露处理。

**建议**

- 从文档中删除真实 key，只保留占位符。
- 在 Supabase Dashboard 轮换 service role key。
- 检查 Git 历史和部署环境，确保旧 key 不再有效。

**验收**

- 仓库内 `rg "service_role key 原始片段"` 搜不到真实密钥。
- 新 key 只存在 `.env` 或部署平台环境变量中。

### 1.2 禁止生产环境 internal 支付自动确认

**相关位置**

- `web/lib/api/payment-checkout.ts`
- `web/app/api/v1/orders/[id]/confirm/route.ts`
- `app/lib/screens/profile/membership_center_screen.dart`
- `app/lib/screens/workspace/institution_workspace_screen.dart`
- `app/lib/screens/profile/order_detail_screen.dart`
- `app/lib/screens/mentors/mentor_application_screen.dart`

**现状**

- 没有支付 provider 配置时，checkout 会 fallback 到 `internal`。
- 订单本人可以 confirm `internal` 订单。
- App 多处会自动 confirm internal 订单。

**风险**

- 生产环境支付配置缺失时，用户可能绕过真实支付，直接开通会员或机构年费。

**建议**

- `internal` provider 只允许 `NODE_ENV !== "production"` 或显式 `ALLOW_INTERNAL_PAYMENT=true`。
- 生产环境缺支付配置时直接返回 503。
- `confirm` route 校验 provider、环境和订单状态。
- App 端不要自动 confirm 生产订单。

**验收**

- 生产环境未配置支付 provider 时，checkout 返回 503。
- 普通用户不能通过 `/orders/{id}/confirm` 标记生产订单为 paid。
- 相关测试覆盖 dev internal 与 production forbidden 两种情况。

### 1.3 收紧 `user_profiles` 敏感字段写权限

**相关位置**

- `supabase/migrations/20260520000000_user_profiles_rls.sql`
- 后续新增字段：`membership_status`、`user_type`、`user_role`、`is_verified`、`status`、`admin_note`
- `web/lib/api/authz.ts`
- `web/lib/api/workbench-access.ts`

**现状**

- 当前 RLS 允许用户更新自己的整行 profile。
- App 仍有直连 Supabase 能力。
- BFF admin / business / advisor 判断信任 `user_profiles` 字段。

**风险**

- 客户端理论上可能自改角色、会员、认证状态、机构权限相关字段。
- 可能绕过 `requireAdmin`、`requireBusinessPublisher`、workbench access。

**建议**

- 普通用户只能更新昵称、头像、bio、兴趣等非敏感字段。
- `role`、`user_type`、`user_role`、`is_verified`、`membership_status`、`status` 等只允许 service role 或专用 RPC 更新。
- 所有身份变化通过 BFF route 处理，并记录审计日志。

**验收**

- 使用 anon/authenticated Supabase client 更新敏感字段失败。
- BFF 管理接口仍能通过 service role 正常更新。

### 1.4 给核心业务表补 RLS

**相关位置**

- `supabase/migrations/20260526090000_node2_core_modules.sql`

**现状**

以下表创建后没有看到完整 RLS 兜底：

- `artist_profiles`
- `artworks`
- `artwork_stats`
- `business_profiles`
- `cooperation_projects`
- `event_applications`
- `event_checkins`
- `events`
- `favorites`
- `likes`
- `notifications`
- `opportunities`
- `opportunity_applications`
- `upload_files`
- `user_roles`
- `verifications`

**风险**

- BFF 有业务校验，但 DB 层如果没挡住，直连 Supabase 可能绕过。
- `user_roles` / `verifications` 没 RLS 会直接破坏认证体系可信度。

**建议**

- 所有业务表启用 RLS。
- 公开读只开放已发布、可公开资源。
- 写操作尽量通过 BFF service role。
- 用户自写只限自己的低风险资源，并限制状态字段。

**验收**

- 新增迁移中每张表都有 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`。
- 认证/角色表普通用户不可 insert/update。

## 2. P1：跨端契约与真实功能缺口

### 2.1 统一 BFF auth 返回结构

**相关位置**

- `web/app/api/v1/auth/login/route.ts`
- `web/app/api/v1/auth/signup/route.ts`
- `web/app/api/v1/auth/dev-login/route.ts`
- `web/app/api/v1/auth/profile/route.ts`

**现状**

- 历史 Next React shell client 曾默认读取 `responseData.data`，而部分 auth route 返回顶层 `{ token, user }`。
- 生产前台现已明确为 Flutter Web，`web/app/artiqore-ui` 不再作为生产前台验收对象。
- 但 BFF auth route 仍应保持统一 `{ success, data }` 结构，方便 admin、Flutter Web 或后续客户端复用。

**风险**

- 如果 BFF auth 返回结构漂移，任何使用 BFF 登录/profile 的客户端都会拿错 token/profile。

**建议**

统一为：

```json
{
  "success": true,
  "data": {
    "token": "...",
    "session": {},
    "user": {},
    "profile": {}
  }
}
```

建议优先统一 BFF 返回格式；客户端只做兼容兜底。

**验收**

- BFF 登录后返回 `data.token/session/user/profile`。
- `getProfile()` 能拿到 profile。
- 登录、注册、dev-login 均有 contract test。

### 2.2 修正 BFF profile 更新接口方法/路径

**相关位置**

- `web/app/api/v1/auth/profile/route.ts`
- `web/app/api/v1/auth/update-profile/route.ts`

**现状**

- 历史 Next React shell client 和 BFF profile route 曾存在 `PATCH/POST` 方法错位。
- 生产前台不依赖 `web/app/artiqore-ui`，但 BFF 仍应提供清晰稳定的 profile 更新契约。

**建议**

二选一：

- 方案 A：给 `/auth/profile` 增加 `PATCH`，废弃 `/auth/update-profile`。
- 方案 B：客户端统一使用 `POST /auth/update-profile`。

建议选方案 A，REST 语义更清晰。

**验收**

- 客户端修改昵称、头像、画像字段成功。
- profile update contract test 覆盖 401、400、200。

### 2.3 补 App 案例详情 BFF route

**相关位置**

- `app/lib/services/backend_api_service.dart`
- `app/lib/screens/cases/case_detail_screen.dart`
- `web/app/api/v1/cases/route.ts`

**现状**

- App 调 `/api/v1/cases/:id`。
- Web 只有 `/api/v1/cases`，没有 `/api/v1/cases/[id]`。

**风险**

- 案例列表能打开，点详情失败。

**建议**

- 新增 `web/app/api/v1/cases/[id]/route.ts`。
- 返回结构保持 `{ success, data }`。

**验收**

- App 案例详情页可以加载真实 BFF 数据。
- contract test 覆盖 found/not found。

### 2.4 修正 `super_admin` 漂移

**相关位置**

- `supabase/migrations/20260526090000_node2_core_modules.sql`
- `web/lib/api/require-admin.ts`
- `web/lib/api/authz.ts`
- `web/app/api/v1/admin/users/[id]/route.ts`

**现状**

- DB 里支持 `super_admin`。
- 代码 admin guard 多数只认 `admin`。
- admin users API 的角色枚举也可能不含 `super_admin`。

**建议**

- 明确是否保留 `super_admin`。
- 如果保留，`isAdminProfile` / requireAdmin 应同时接受 `admin` 和 `super_admin`。
- 高危操作可单独要求 `super_admin`。

**验收**

- `super_admin` 用户可进入管理后台。
- 普通 `admin` 与 `super_admin` 权限边界清晰。

## 3. 本轮产品点专项检查

### 3.1 院校对比超过 3/4 所的问题

**相关位置**

- `app/lib/screens/news/news_scaffold.dart`
- `app/lib/screens/profile/application_workspace_screen.dart`
- `app/lib/screens/profile/school_comparison_result_screen.dart`
- `web/app/api/v1/schools/compare/route.ts`

**现状**

- BFF `/schools/compare` 支持最多 5 所。
- 申请工作台选择器也限制 5 所。
- 结果页按 `schools.length` 动态渲染列。
- 但首页/资讯脚手架的“目标池候选”只展示 `schools.take(4)`，容易让用户误以为第 5 所不能加入对比。

**建议**

- 如果产品规则是最多 5 所：把候选展示从 4 改成 5，或明确“展示前 4 所，可点添加院校加入更多”。
- 如果产品规则是最多 3 所：统一 App 文案、BFF slice、结果页布局，不要多处不一致。

**推荐规则**

- MVP 保持 2-5 所。
- 移动端结果页保留横向滚动，最多 5 所。

**验收**

- 用户能从同一入口选择 5 所并完成对比。
- 所有入口文案一致：`选择 2-5 所院校生成对比`。

### 3.2 语音功能不能使用

**相关位置**

- `app/lib/screens/home/home_screen.dart`
- `app/lib/services/backend_api_service.dart`
- `web/app/api/v1/ai/transcribe/route.ts`
- `web/lib/ai/audio-transcriber.ts`

**现状**

- App 首页语音输入使用系统 `speech_to_text`，是实时语音转文字，不走 BFF transcribe。
- App 有 `BackendApiService.transcribeAudio()`，但当前未看到 UI 调用它。
- BFF `/api/v1/ai/transcribe` 存在，依赖 OpenAI Whisper API。
- 生产 Flutter Web 复用 `app/lib`，Next React shell 不作为生产前台验收对象。

**问题判断**

- 如果指 App 首页麦克风：要查系统语音识别权限、设备支持、locale 和 `speech_to_text` 初始化。
- 如果指后端转写：当前 UI 没接入，且 DeepSeek baseURL 不能调用 OpenAI audio transcriptions。
- 如果指网页端：应在 Flutter Web 对应 Dart 页面里接系统/浏览器 STT，而不是改 `web/app/artiqore-ui`。

**建议**

- 统一产品定义：先做“AI 输入框语音转文字”，暂不做实时语音房。
- App 录音后上传 `/ai/transcribe`，或继续用系统 STT，但要移除未接的 `transcribeAudio` 歧义。
- BFF audio transcriber 单独配置 `OPENAI_AUDIO_API_KEY` / `OPENAI_AUDIO_BASE_URL`，不要复用 DeepSeek chat 配置。
- Flutter Web 的语音入口与移动端共用 `app/lib` 逻辑；Next 只保留后端 `/ai/transcribe` 能力。

**当前修改状态（2026-06-22）**

- App 首页继续使用系统 `speech_to_text` 作为 Google/系统自带 STT 路径；Flutter Web 下跳过 `permission_handler`，改由浏览器 Web Speech API 弹出麦克风授权。
- AI 咨询工具页已新增同一套语音输入按钮：移动端走系统/Google 语音，Flutter Web 走 Chrome/Edge 浏览器语音识别，识别结果先进入输入框再发送。
- App 首页图片分析上传已从 `File/path` 改为 `XFile.readAsBytes()` + multipart bytes，避免 Flutter Web 因 `dart:io` 无法编译。
- BFF `/api/v1/ai/transcribe` 保留为后端音频转写能力，但已拆分独立 audio provider 配置，避免复用 DeepSeek chat 配置。
- 已纠偏：`web/app/artiqore-ui` 相关语音 UI 修改已撤回，网页前台已从 Flutter Web 的 Dart 代码处理。

**验收**

- App 麦克风输入在 iOS/Android 真机可用。
- Flutter Web 在支持 Web Speech API 的浏览器中可用，优先 Chrome / Edge。
- 失败时能展示明确原因：权限、系统不支持、服务未配置。
- `/api/v1/ai/transcribe` 有 401、400、503、200 测试。

### 3.3 热议讨论：立场速览、头像/ID、评论互动

**相关位置**

- `app/lib/screens/forum/forum_screen.dart`
- `app/lib/models/models.dart`
- `web/app/api/v1/community/hot-topics/route.ts`
- `supabase/migrations/20260610090000_community_hot_topics.sql`

**现状**

- 立场速览已展示。
- 热议回答卡已显示头像、昵称、handle、身份 chip。
- 头像和 ID 支持从 `answers` JSON 读取，也有前端 fallback。
- 点头像会进入 public profile 展示页。
- 点赞、评论、转发只是本地 state；评论提交只弹 `评论已发布`，不落库。
- 普通社区帖已有真实点赞/评论 API，但 hot topics 没有。

**建议**

- 将 hot topic answer 从 JSON 拆成表，或新增互动表：
  - `community_hot_topic_answers`
  - `community_hot_topic_answer_likes`
  - `community_hot_topic_answer_comments`
- BFF 增加：
  - `POST /api/v1/community/hot-topics/:topicId/answers/:answerId/like`
  - `DELETE /api/v1/community/hot-topics/:topicId/answers/:answerId/like`
  - `GET/POST /api/v1/community/hot-topics/:topicId/answers/:answerId/comments`
- App 评论框提交真实 API，并刷新 comment count。

**验收**

- 热议回答点赞刷新后仍保留。
- 评论能在详情或展开区看到。
- 匿名/未登录用户不能评论，能看公开内容。

### 3.4 个人主页 Ins 风格个人展示

**相关位置**

- `app/lib/screens/profile/profile_screen.dart`
- `app/lib/screens/forum/forum_screen.dart`
- `app/lib/screens/explore/explore_screen.dart`

**现状**

- public profile 展示页已用于热议回答、艺术家卡片等入口。
- 个人展示方向基本已完成。

**建议**

- 明确 public profile 数据源，不要长期依赖页面传参。
- 建议新增或统一：
  - `GET /api/v1/users/:id/public-profile`
  - 展示作品、回答、动态、认证 badge。

**验收**

- 从热议、评论、艺术家库、私信等入口进入同一个 public profile。
- 刷新或深链打开仍能加载真实用户数据。

### 3.5 机构逻辑：个人与机构、商家展示互动空间

**相关位置**

- `app/lib/screens/main_scaffold.dart`
- `app/lib/screens/workspace/institution_workspace_screen.dart`
- `app/lib/screens/workspace/general_business_workspace_screen.dart`
- `app/lib/screens/workspace/gallery_workspace_screen.dart`
- `app/lib/screens/consultation/organization_list_screen.dart`
- `web/app/api/v1/me/organizations`
- `web/app/api/v1/me/workbench/*`
- `web/app/api/v1/organizations/[id]`
- `web/app/api/v1/organizations/nearby`

**现状**

- App 已根据 `user_type/user_role/org membership` 把部分 Tab 替换为工作台。
- 已有机构工作台、通用商家工作台、画廊工作台。
- 机构公开详情页已有服务、案例、团队/艺术家、动态、评价、问答等结构。
- 但“个人账号”和“机构账号/身份”的切换不够显性。
- 机构认证与机构曝光之间还隔着订阅状态。

**建议**

- 做显式身份切换：
  - 个人视角
  - 当前机构视角
  - 多机构时可切换组织
- 机构公开空间统一为 organization public profile：
  - 服务
  - 案例
  - 团队/合作艺术家
  - 动态
  - 问答
  - 评价
  - 联系/咨询
- 工作台内加入“以学生/家长视角预览主页”。
- 机构入驻链路明确三步：
  1. 创建组织
  2. 认证审核
  3. 订阅激活后获得曝光/咨询

**验收**

- 同一用户可以清楚知道当前是在个人身份还是机构身份。
- 机构未订阅时能管理资料，但不会进入公开推荐池。
- 机构可预览公开主页。

### 3.6 艺术家库：先显示认证艺术家 list，再显示入驻

**相关位置**

- `app/lib/screens/explore/explore_screen.dart`
- `app/lib/screens/discover/discover_scaffold.dart`
- `app/lib/screens/publish/publish_artist_screen.dart`
- `web/app/api/v1/artists/route.ts`
- `web/app/api/v1/artists/[id]/route.ts`

**现状**

- Explore 艺术家库已经先显示认证艺术家列表，底部显示入驻面板。
- `/api/v1/artists` 默认只返回 `status = published`。
- App 里的“认证”判断包含 `status == published`、`verification_status == verified/approved` 或 `verification_badges != null`。
- 但 artist profile 表本身更像“审核发布”，不等同于身份认证。
- Discover 里的旧艺术家 tab 仍很简陋，并且读取 `artist['name']`，而 BFF 返回多为 `display_name`。

**建议**

- 产品语义统一：
  - `published` = 公开展示
  - `verification_status=verified` = 身份/资质认证
- 艺术家库标题可改为“已入驻艺术家”，认证 badge 单独展示。
- Discover 旧 tab 复用 Explore 的 ArtistCard，或删除重复入口。
- 入驻提交后的 `reviewing` 不应显示在公开列表，但应在“我的/创作者中心”显示审核状态。

**验收**

- 未审核艺术家不出现在公开列表。
- 已发布但未实名认证的艺术家不会被误标“已认证”。
- 入驻入口始终在列表下方或空状态下可见。

### 3.7 私信 UI 简化

**相关位置**

- `app/lib/screens/messages/light_message_screen.dart`

**现状**

- App 已有轻量消息页。
- 生产网页前台走 Flutter Web，私信 UI 验收以 `app/lib/screens/messages/light_message_screen.dart` 为准。
- 私信与咨询消息、机构 workbench message 容易混在一起。

**当前修改状态（2026-06-21）**

- App `LightMessageScreen` 已压缩为三层：顶部会话条、消息流、输入框。
- 原来的独立身份说明卡已移除，头像、身份、handle/响应时间和“查看主页”入口收进顶部栏。
- 输入区发送按钮改为标准 `send` icon button，减少歧义。
- 仍保留私信 DM 与机构会话的视觉区分，但不再占用大块页面空间。
- 已纠偏：`web/app/artiqore-ui` 私信 UI 修改已撤回，不作为生产前台验收对象。

**建议**

- 私信 MVP 保留三层：
  1. 会话列表
  2. 消息流
  3. 输入框
- 去掉复杂身份说明、过多卡片和装饰状态。
- 明确消息类型：
  - 私信 DM
  - 咨询 consultation message
  - 机构工作台 workbench message

**验收**

- 用户能从个人主页/机构页/艺术家卡片发起一条明确会话。
- 会话列表只显示必要信息：头像、名称、最后消息、时间、未读数。

### 3.8 艺术家库和“我的”界面简化

**相关位置**

- `app/lib/screens/explore/explore_screen.dart`
- `app/lib/screens/profile/profile_screen.dart`

**建议**

- 艺术家库简化为：
  - 搜索
  - 认证/地区/合作筛选
  - 艺术家列表
  - 入驻 CTA
- 我的界面按身份折叠：
  - 个人资料
  - 申请/会员
  - 入驻与认证
  - 工作台入口
  - 设置
- 不要把所有身份功能平铺在同一屏。

**当前修改状态（2026-06-21）**

- App 艺术家库头部已从大面积展示卡改为紧凑工具条：已入驻艺术家、已审核数量、可合作数量、入驻按钮。
- 艺术家库底部入驻入口已压缩为轻量 CTA，不再抢占列表空间。
- App “我的”页个人用户入口已从两列网格改为分组列表：
  - `申请 / 咨询`
  - `创作者 / 入驻`
  - `收藏 / 记录`
- 艺术家用户优先显示“创作中心”，非艺术家个人用户显示“艺术家入驻”。
- 已纠偏：`web/app/artiqore-ui` 艺术家库/我的页修改已撤回；生产网页端同样以 Flutter Web 的 `app/lib` 为准。

**验收**

- 普通个人用户看不到机构工作台噪音。
- 机构成员能看到明确工作台入口。
- 艺术家用户能看到创作者/作品入口。

### 3.9 AI 功能 general 化

**相关位置**

- `app/lib/screens/home/home_screen.dart`
- `app/lib/screens/tools/ai_consult_screen.dart`
- `web/app/api/v1/ai/chat`
- `web/app/api/v1/ai/consult`
- `web/app/api/v1/ai/schools/search`
- `web/lib/pipelines/consult-pipeline.ts`

**现状**

- App 首页已有按画像切换的 AI 文案：学生、艺术家、收藏者/爱好者、机构等。
- 后端已开始从“艺术留学顾问”升级为通用艺术助手协议。
- AI 能力仍有多个垂直入口，但 `chat/consult` 已能承接统一上下文。

**当前修改状态（2026-06-21）**

- 已新增 `web/lib/ai/general-context.ts`，统一解析 `query/messages/persona/intent/context`。
- `/api/v1/ai/consult` 已兼容旧 `{ query, mode }`，同时支持通用入参，并返回 `{ success, data }` 与旧顶层字段。
- `/api/v1/ai/chat` 已接入同一套 persona / intent / context 逻辑，流式入口不再只靠最后一句消息。
- `web/lib/knowledge/prompts/persona.artsee.v1.md` 已从“艺术留学顾问”改为“综合艺术助手”。
- Next React shell 的 `aiService` / `platformApi` 不作为生产前台验收对象；生产前台请求从 Flutter `BackendApiService` 进入。
- App `BackendApiService.aiConsult()` 已扩展 `persona / intent / context / messages` 可选参数；首页 AI 与 AI 工具页已传入当前场景。
- 新增 `web/tests/api/ai-consult-general.test.ts`，覆盖通用协议、旧 query 兼容、空请求校验和敏感 context 过滤。

**建议**

- 继续把 general AI route 作为统一协议：
  - `POST /api/v1/ai/chat`
  - 入参包含 `persona`、`intent`、`context`、`messages`
- intent 示例：
  - `school_planning`
  - `portfolio_review`
  - `artist_profile`
  - `exhibition_opportunity`
  - `collector_guide`
  - `business_workspace`
  - `general_art_question`
- 垂直 route 可以逐步变成 general route 的 wrapper。
- prompt 分层：
  - 平台身份：Artiqore 艺见心
  - 安全/中立规则
  - 用户画像
  - 当前场景 intent
  - 可用工具/知识库
- 后续再把 `schools/search`、结构化分析等垂直能力包装成工具调用或 wrapper，不要直接复制多套 prompt。

**验收**

- 同一个 AI 输入框能回答留学、艺术家主页、展览、收藏、机构运营等问题。
- 院校搜索仍可调用结构化学校数据。
- AI 回复明确标注数据来源或“不确定”。

### 3.10 机构工作台页面细化

**相关位置**

- `app/lib/screens/workspace/institution_workspace_screen.dart`
- `web/app/api/v1/me/workbench/*`

**当前修改状态（2026-06-21）**

- App 机构工作台顶部已新增“当前机构视角”总控面板。
- 面板明确展示个人账号与机构视角的分离：个人账号保留，工作台处理机构服务与协作。
- 面板展示当前机构名称、成员角色、认证状态、启用状态、年费入驻状态。
- 已加入“建档 -> 认证 -> 入驻曝光”步骤条，显性说明认证不等于曝光。
- 已接入“预览主页”，机构成员可从工作台跳转到用户看到的 organization public profile。
- 无机构档案时，主按钮引导创建机构资料。

**建议结构**

机构工作台建议分为：

| 模块 | 功能 |
| --- | --- |
| 总览 | 咨询线索、待处理、转化、订阅状态 |
| 线索池 | 平台分配咨询、用户主动咨询、筛选与分配 |
| 学员/客户 | 档案、申请目标、服务阶段、沟通记录 |
| 方案/推荐 | 学校推荐、服务方案、报价 |
| 合同/订单 | 合同归档、付款状态、退款 |
| 内容/案例 | 录取案例、动态、问答、公开主页内容 |
| 团队 | 顾问、导师、权限、邀请 |
| 公开主页预览 | 学生/家长视角预览 |

**验收**

- owner/admin/advisor/member 权限差异明确。
- 每个工作台操作都有 BFF route 承接。
- 工作台状态与公开机构主页联动。

### 3.11 第三方“申请项目”接入

**现状判断**

- 当前代码能看到申请计划、院校项目、咨询/机构服务，但没有完整第三方申请项目接入抽象。
- 本轮用户明确“先不做第三方申请项目接入”，因此该项暂缓，只保留设计建议。
- 需要先定义“第三方”具体类型：
  - 院校申请系统
  - 作品集机构 CRM
  - 支付/合同系统
  - 展览/机会发布方

**建议 MVP**

先做“外部申请项目记录”，不要一开始做深度 API 集成：

表/模型建议：

- `external_application_projects`
  - `user_id`
  - `provider`
  - `external_url`
  - `school_id`
  - `program_id`
  - `status`
  - `deadline`
  - `metadata`
- `external_application_events`
  - `project_id`
  - `event_type`
  - `payload`
  - `created_at`

BFF 建议：

- `GET /api/v1/me/external-application-projects`
- `POST /api/v1/me/external-application-projects`
- `PATCH /api/v1/me/external-application-projects/:id`

**验收**

- 用户能把外部申请项目挂到自己的申请计划。
- 机构顾问能在授权后查看/更新项目状态。
- 第三方深度集成前，先保留手动录入和链接跳转。

## 4. 角色分析文档应修正的地方

### 4.1 不要把产品画像等同权限

原文中的学生、艺术家、收藏者、家长、机构建议定义为“产品画像角色”。权限必须拆开：

- 免费/会员
- 是否认证
- 是否机构成员
- 机构内角色
- 是否平台管理员

**当前修改状态（2026-06-22）**

- 已纠偏：`web/app/artiqore-ui` 不是生产前台，相关类型/壳层命名修改已撤回。
- 角色语义统一应继续落在 BFF/API、Supabase schema/RLS、Flutter `app/lib` 的画像与工作台逻辑上。

### 4.2 家长是画像角色，不是认证类型

当前认证体系更接近：

- 学生认证
- 艺术家认证
- 收藏者认证
- 机构认证

家长更适合做 persona / onboarding profile，不建议做强认证权限。

### 4.3 机构 Loop 需要补“订阅激活”

机构链路不是：

```text
提交认证 -> 获得曝光
```

而应是：

```text
创建组织 -> 提交认证 -> 审核通过 -> 开通机构订阅 -> 进入公开推荐/咨询池
```

### 4.4 Future state 要标注

以下 Loop 很完整，但当前代码未形成闭环，建议标 P2/P3：

- 艺术家版权授权
- 收藏者购买/估值/交易
- 酒店/文旅空间采购艺术品
- 品牌商业合作全流程
- 家长过程监督的完整协作视图

当前 P0/P1 应聚焦：

- 学生选校/申请计划
- AI 咨询
- 会员咨询匹配
- 机构工作台
- 机构公开主页
- 艺术家入驻与展示

## 5. 建议修复顺序

1. 轮换并移除泄露的 Supabase service role key。
2. 禁止生产 internal 支付 fallback 和自动 confirm。
3. 收紧 `user_profiles`、`user_roles`、`verifications` 等敏感表/字段 RLS。
4. 给 16 张核心业务表补 RLS。
5. 统一 Web auth/profile API 返回结构。
6. 修正 Web profile update 的方法/路径。
7. 补 `GET /api/v1/cases/:id`。
8. 统一角色语义：persona、account type、verification、membership、org role、admin role。
9. 修复院校对比入口 4/5 所展示不一致。
10. 明确语音功能 MVP，并接通 App UI 与系统/浏览器 STT。（已完成 Google/系统自带 STT 路径）
11. 给热议回答补真实点赞/评论 API。
12. 细化机构工作台和公开主页联动。
13. 简化私信、艺术家库、我的界面。
14. 把 AI general route 作为统一入口，垂直功能逐步 wrapper 化。（已完成第一阶段通用协议）
15. 第三方申请项目先做手动挂接与状态同步，再做深度集成。（本轮暂缓）

## 6. 回归验证命令

```bash
npm run test:web
npm run test:backend
cd app && flutter test
cd app && flutter analyze
```

当前已知验证结果：

- `npm run test:web`：通过，36 files / 194 tests。
- `npm run test:backend`：通过，Supabase DB/Auth/Storage 健康检查 OK。
- `flutter test`：已通过，13 tests。
- `cd app && flutter build web --debug`：已通过，确认 Flutter Web 目标可编译。
- `npm run build --workspace=web`：提权后通过；普通沙箱会因 Google Fonts 网络获取失败而中断。Next 16 `next.config.ts` 的旧 `eslint` 配置 warning 已移除。
- `flutter analyze`：仍有大量 info/deprecated；`app/lib/data/mock_data.dart` 中 `null as School` 找不到学校时会崩的问题已修复。

# Artiqore 艺衡 App + Web 落地计划书

> 目标：以 `artiqore-艺见心-网页版前端与ui(1)` 为产品原型，以当前主仓 `D:\files\artsee` 为唯一正式工程仓库，持续完善 Flutter App、Next.js Web/BFF、Supabase 数据层，并为支付、钱包、并发、安全、上线审查预留可执行路径。

## 1. 当前判断

### 1.1 项目定位

当前主仓已经具备正式产品架构：

| 层 | 路径 | 当前职责 | 后续定位 |
|---|---|---|---|
| Flutter App | `app/` | 移动端主入口，已有首页、发现、学习、合作、我的、登录、部分详情页 | 产品主战场，优先完善 |
| Next.js Web | `web/` | 网站 UI + `/api/v1/*` BFF，已有学校、专业、案例、社区、上传、AI、首页内容接口 | 官网、Web 用户端、App 后端网关 |
| Supabase | `supabase/` | 部分迁移、Auth、Postgres、Storage | 统一数据源，敏感写操作由 BFF 代理 |
| 原型目录 | `artiqore-艺见心-网页版前端与ui(1)` | Vite React UI 原型，展示目标功能和视觉 | 不单独上线，只作为设计与功能蓝图 |

### 1.2 原型包含的核心功能

消费者端：

- 首页：内容流、展览、帖子、用户入口、AI 助手。
- 院校库：院校列表、院校详情。
- Club：沙龙、分类、活动详情。
- Social：话题、圈子、问答、社区契约。
- Discover：发现页、详情页。
- Me：个人主页、收藏、申请记录、钱包/设置入口。
- 聊天：用户私聊浮层。
- AI 助手：悬浮入口与咨询交互。

商业端：

- 工作台。
- 艺术家市场。
- 项目管理。
- 联名项目。
- 品牌中心。
- 商业详情页。

### 1.3 当前缺口

当前 App 和 Web 已经有骨架，但仍处在“原型向真实产品迁移”的阶段：

- App 里还有较多 mock、硬编码和假流程。
- 图文发布尚未真正上传图片并创建社区帖。
- 院校/专业已有部分 BFF API，但学校、专业、推荐、详情、收藏尚未完整闭环。
- 社区、圈子、问答、沙龙、商业端缺少完整数据模型。
- 支付/钱包没有设计成合规的资金链路。
- Web 需要按原型补齐正式页面，而不是继续维护 Vite 原型项目。
- 高并发、缓存、限流、日志、审计、压测、监控还需要系统设计。

## 2. 总体路线

### 2.1 工程原则

1. 单一正式仓库：`D:\files\artsee` 是主仓，原型目录只做参考，不并行维护第二套正式 Web。
2. App 优先：Flutter App 是核心端，Web 是官网、后台和 BFF。
3. 敏感逻辑进 BFF：支付、钱包、用户权限、内容审核、写操作都走 `web/app/api/v1/*`。
4. Supabase 只保存可信状态：所有重要业务状态必须可审计、可回滚、可追踪。
5. 先 MVP，后扩展：先上线可用闭环，再做商业端、钱包、聊天、复杂社区。
6. 每个功能必须有：表结构、API、App UI、Web UI、测试、埋点、失败态。

### 2.2 推荐上线顺序

| 版本 | 范围 | 目标 |
|---|---|---|
| MVP 0.1 | 登录、首页、院校/专业、AI 咨询、社区图文、个人资料 | 内测可用 |
| MVP 0.2 | 收藏、点赞、评论、用户主页、案例、基础 Web 官网 | 小范围公开 |
| V1.0 | 沙龙、问答、圈子、通知、内容管理、App Store/应用市场上架 | 正式上线 |
| V1.5 | 商业合作端、项目管理、品牌中心、艺术家市场 | 商业化试点 |
| V2.0 | 支付、订单、平台佣金、钱包/结算/提现 | 交易闭环 |

## 3. 模块落地方案

### 3.1 App Shell 与导航

当前已有：

- `app/lib/main.dart`
- `app/lib/screens/main_scaffold.dart`
- 首页、发现、学习、合作、我的五个主入口。

后续工作：

- 将导航命名和原型统一：`home`、`info/院校`、`club/活动`、`social/社区`、`discover/发现`、`me/我的`。
- 决定是否保留五 Tab 或扩展为原型的六大模块。
- 补全深链路由：帖子详情、用户主页、院校详情、专业详情、沙龙详情。
- 统一返回逻辑，避免页面里到处 `Navigator.push` 无历史控制。
- 增加全局错误页、离线页、登录拦截、空状态组件。

建议代码任务：

- 新增 `app/lib/router/app_routes.dart` 或基于 `go_router` 改造。
- 抽出 `AppShell`、`AppBottomNav`、`AppTopBar`。
- 所有页面入口使用命名路由。

验收：

- 冷启动进入首页。
- 未登录点“我的/发布/收藏”会跳登录。
- 登录后返回原操作。
- Android、iOS、Web 三端导航不溢出。

### 3.2 登录与用户体系

当前已有：

- Supabase Auth 邮箱登录。
- 开发者测试账号。
- 用户资料 `user_profiles` 读取/更新。
- onboarding 兴趣选择。

后续工作：

- 统一 Auth 入口，淘汰旧的硬编码 `AuthService` 端口。
- 手机号验证码是否保留要定：如果保留，需要真实短信服务商。
- 微信登录需拆为“国内应用市场版本”和“海外/App Store 版本”策略。
- 用户角色设计：普通用户、艺术家、机构/品牌、管理员。
- 用户主页从 mock 改真实数据。

建议数据库：

- `user_profiles`
- `user_roles`
- `user_settings`
- `user_interests`
- `user_follows`
- `user_blocks`

建议 API：

- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `GET /api/v1/users/:id`
- `POST /api/v1/users/:id/follow`
- `DELETE /api/v1/users/:id/follow`

验收：

- 注册、登录、退出、编辑资料、上传头像完整可用。
- RLS 禁止用户修改其他用户资料。
- 管理员角色只能服务端授予。

### 3.3 首页

当前已有：

- Flutter 首页已对齐原型的一部分视觉。
- `home_contents` 表和 `/api/v1/home-contents` API。
- 但本地缺 `SUPABASE_SERVICE_ROLE_KEY` 会导致 API 500。

后续工作：

- 首页内容结构升级：banner、推荐院校、热门帖子、展览/活动、AI 入口、专题内容。
- 后台可配置首页内容。
- App 侧保留 fallback，但正常应走 BFF。

建议数据库：

- `home_contents`
- `content_collections`
- `content_collection_items`
- `featured_slots`

建议 API：

- `GET /api/v1/home`
- `GET /api/v1/home-contents`
- `POST /api/v1/home-contents` 管理员
- `PATCH /api/v1/home-contents/:id` 管理员

高并发策略：

- 首页接口聚合，减少 App 多次请求。
- 服务端缓存 30-120 秒。
- 热门内容可预计算。
- CDN 缓存图片。

验收：

- 首页首屏接口 95 线小于 500ms。
- BFF 故障时 App 有兜底内容。
- 图片加载失败有本地占位。

### 3.4 院校与专业

当前已有：

- `schools`、`programs` BFF API。
- Flutter `SchoolListScreen`、`SchoolDetailScreen`、`ProgramListScreen`、`ProgramDetailScreen`。
- 原型里有更丰富的 `InstitutionsView` 和 `InstitutionDetailView`。

后续工作：

- 整理字段：学校排名、国家、城市、学费、申请难度、作品集要求、语言要求、就业率、校友、雷达图。
- 统一 `qs_art_rank` / `qs_art_design_rank` 字段命名。
- 学校详情页接真实学校 + 专业列表。
- 专业详情页接真实录取要求、学费、截止日期。
- 增加收藏、对比、咨询入口。

建议数据库：

- `schools`
- `school_types`
- `school_rankings`
- `school_media`
- `programs`
- `program_admissions`
- `program_fees`
- `program_categories`
- `program_art_categories`
- `user_favorite_schools`
- `user_favorite_programs`
- `school_compare_sets`

建议 API：

- `GET /api/v1/schools`
- `GET /api/v1/schools/:id`
- `GET /api/v1/schools/:id/programs`
- `GET /api/v1/programs`
- `GET /api/v1/programs/:id`
- `POST /api/v1/favorites`
- `DELETE /api/v1/favorites/:id`
- `POST /api/v1/compare/schools`

高并发策略：

- 学校/专业列表加分页、索引、筛选条件索引。
- 搜索先用 Postgres `pg_trgm`，后续可接 Meilisearch/Typesense。
- 热门院校详情可缓存。
- 大文本字段详情页再取，列表只取摘要字段。

验收：

- 列表分页、筛选、搜索可用。
- 学校详情可打开专业列表。
- 收藏状态跨 App/Web 一致。
- 1 万院校/专业级数据下接口仍稳定。

### 3.5 社区图文与内容流

当前已有：

- `community_posts` 表。
- `/api/v1/community/posts`。
- Flutter 创建页面是“假发布”，尚未上传图片/创建真实帖。

后续工作：

- 发布图文真实上传图片到 Storage。
- 内容流按关注、推荐、最新、话题分类展示。
- 帖子详情、评论、点赞、收藏、举报。
- 用户主页展示发布内容。

建议数据库：

- `community_posts`
- `post_images`
- `post_comments`
- `post_likes`
- `post_bookmarks`
- `post_reports`
- `post_topics`
- `topics`

建议 API：

- `GET /api/v1/community/feed`
- `POST /api/v1/community/posts`
- `GET /api/v1/community/posts/:id`
- `PATCH /api/v1/community/posts/:id`
- `DELETE /api/v1/community/posts/:id`
- `POST /api/v1/community/posts/:id/like`
- `DELETE /api/v1/community/posts/:id/like`
- `GET /api/v1/community/posts/:id/comments`
- `POST /api/v1/community/posts/:id/comments`
- `POST /api/v1/reports`

高并发策略：

- 点赞、评论数用计数字段 + 事务/RPC 更新。
- 内容流分页用 cursor，不用大 offset。
- 图片走 Supabase Storage/CDN。
- 写操作加速率限制，防刷帖。
- 热帖排序定时计算，不在请求时复杂排序。

验收：

- 发布、浏览、点赞、评论、收藏闭环。
- 用户只能改删自己的帖子。
- 管理员可下架违规内容。

### 3.6 Club / 沙龙 / 活动

原型能力：

- 沙龙列表。
- 分类详情。
- 沙龙详情。
- 预约/报名入口。

后续工作：

- 定义活动类型：线上讲座、线下沙龙、展览、作品集点评、直播。
- 活动详情页。
- 报名表单。
- 报名状态。
- 活动提醒。
- 若收费，先走订单系统，不直接做钱包。

建议数据库：

- `events`
- `event_sessions`
- `event_categories`
- `event_registrations`
- `event_hosts`
- `event_checkins`

建议 API：

- `GET /api/v1/events`
- `GET /api/v1/events/:id`
- `POST /api/v1/events/:id/register`
- `GET /api/v1/me/event-registrations`

验收：

- 用户可报名免费活动。
- 活动满员后不可报名。
- 管理员可创建/编辑活动。

### 3.7 问答 / 圈子 / 话题

原型能力：

- SocialView 中有话题、圈子、问答。
- 有详情页和聊天入口。

建议 MVP：

- 第一版只做“问答 + 话题标签”，暂缓复杂圈子。

建议数据库：

- `questions`
- `answers`
- `answer_likes`
- `topics`
- `topic_follows`
- `circles`
- `circle_members`

建议 API：

- `GET /api/v1/questions`
- `POST /api/v1/questions`
- `GET /api/v1/questions/:id`
- `POST /api/v1/questions/:id/answers`
- `POST /api/v1/answers/:id/like`

高并发策略：

- 问答详情分段加载。
- 热门回答计数缓存。
- 发布/回答加反垃圾策略。

验收：

- 用户能提问、回答、点赞。
- 详情页数据真实。
- 管理员能隐藏问题或回答。

### 3.8 AI 助手

当前已有：

- Next API `POST /api/v1/ai/schools/search`。
- Flutter `AiConsultScreen` 目前仍大量 mock。
- Web 配了 `MOONSHOT_API_KEY`，也可兼容 OpenAI 风格接口。

后续工作：

- AI 查询统一走 BFF。
- 不在 App 暴露模型 Key。
- AI 输出结构化 JSON，App 负责渲染。
- 增加上下文：用户目标国家、专业、预算、GPA、语言成绩、作品集阶段。
- 增加流式输出可选。
- 增加用量控制、日志、敏感词、失败降级。

建议数据库：

- `ai_conversations`
- `ai_messages`
- `ai_usage_logs`
- `ai_recommendation_snapshots`

建议 API：

- `POST /api/v1/ai/schools/search`
- `POST /api/v1/ai/chat`
- `GET /api/v1/ai/conversations`
- `GET /api/v1/ai/conversations/:id`

高并发策略：

- 按用户限流。
- 相同 query + 数据版本可短期缓存。
- 模型调用超时后返回可恢复错误。
- 记录 token 消耗与成本。

验收：

- AI 咨询能返回院校推荐。
- 未配置模型 Key 时有明确降级。
- 单用户频繁请求会被限流。

### 3.9 商业端

原型能力：

- 工作台。
- 艺术家市场。
- 项目管理。
- 联名项目。
- 品牌中心。

建议策略：

- MVP 不做完整商业端，只保留“合作需求广场 + 申请入口”。
- V1.5 再做商业端后台。

建议数据库：

- `business_profiles`
- `artist_profiles`
- `business_projects`
- `project_applications`
- `project_messages`
- `brand_assets`
- `contracts`

建议 API：

- `GET /api/v1/business/projects`
- `POST /api/v1/business/projects`
- `GET /api/v1/business/projects/:id`
- `POST /api/v1/business/projects/:id/apply`
- `PATCH /api/v1/business/projects/:id/status`

验收：

- 品牌/机构可发需求。
- 艺术家/用户可申请。
- 项目状态可流转。
- 管理员可审核需求。

## 4. Web 重建设计

### 4.1 Web 的定位

正式 Web 不是 Vite 原型，而是当前 `web/` Next.js 项目。它需要承担：

- 官网。
- Web 浏览端。
- 登录入口。
- 内容详情页分享落地。
- SEO。
- 管理/运营入口。
- BFF API。

### 4.2 需要按原型迁移的页面

优先级 P0：

- 首页。
- 院校列表。
- 院校详情。
- 专业列表/详情。
- 社区帖子列表。
- 帖子详情。
- 用户主页。
- 登录页。

优先级 P1：

- 活动/沙龙。
- 问答。
- 发现页。
- AI 咨询页。

优先级 P2：

- 商业端。
- 品牌中心。
- 艺术家市场。

### 4.3 Web 技术方案

- 保持 Next.js App Router。
- UI 参考原型，但不要直接复制 Vite 架构。
- 数据读取统一通过 Supabase server client 或内部 service 层。
- 对外 API 保持 `/api/v1/*`。
- 详情页做 SSR/SEO。
- 图片加 `next/image` 或明确 CDN 策略。

验收：

- Web 首页和核心详情页可独立访问。
- 分享链接打开不是空壳。
- Lighthouse 基础指标达标。
- API 与页面不互相阻塞。

## 5. 支付、钱包、订单与合规

### 5.1 先做订单，不急着做钱包

建议顺序：

1. 免费报名/申请。
2. 付费活动/咨询的一次性订单。
3. 订阅或会员。
4. 平台项目交易。
5. 钱包/余额/提现。

原因：

- “钱包/余额/提现”涉及用户资金留存、结算、备付金、实名、反洗钱、支付牌照边界。
- 中国境内如果自己做储值账户或资金余额，必须高度谨慎。中国人民银行《非银行支付机构监督管理条例》将支付业务分为储值账户运营和支付交易处理，并规定设立非银行支付机构需取得支付业务许可。官方条例还要求支付账户实名、备付金不得挪用等。
- 因此第一版不要做真正“平台钱包”，只做“订单状态 + 第三方支付结果 + 可提现结算记录”。

### 5.2 App Store / Google Play 支付规则

根据 Apple App Review Guidelines：

- App 内购买数字内容、功能、订阅通常需要 IAP。
- 一对一实时服务、线下/实物或 App 外消费服务可以使用其他支付方式。
- App 外消费的实体商品/服务不能用 IAP，应使用 Apple Pay 或传统支付方式。

根据 Google Play Payments policy：

- Google Play 分发的 App，如果在 App 内售卖数字内容、功能或服务，通常必须使用 Google Play Billing。
- 实物商品、线下服务、P2P、在线拍卖等场景不应使用 Google Play Billing。
- 除政策允许的例外，App 内不能引导到其他支付方式。

产品设计影响：

| 商品/服务 | iOS 推荐 | Android 推荐 | Web 推荐 |
|---|---|---|---|
| 会员订阅、数字课程、数字报告 | Apple IAP | Google Play Billing | Stripe/微信/支付宝 |
| 一对一咨询、作品集点评 | 可走外部支付，但需仔细审查具体形态 | 可能可走外部支付 | 微信/支付宝/Stripe |
| 线下沙龙、展览票 | 外部支付 | 外部支付 | 微信/支付宝/Stripe |
| 品牌项目服务费 | 外部支付 | 外部支付 | 微信/支付宝/Stripe/对公转账 |
| 平台钱包余额充值 | 高风险，不建议首版 | 高风险，不建议首版 | 高风险，不建议首版 |

### 5.3 国内支付

微信支付 APP 支付：

- 需要微信支付商户号。
- APP 支付需要商户号与移动应用 AppID 绑定。
- 官方文档说明已有商户号申请 APP 支付权限时，需要填写 APPID、上传 App 页面截图，并提供主流应用市场上架链接，审核通常 7 个工作日内。
- 新商户入驻需提交营业执照、身份证、银行账户等资料并签署协议。

支付宝/Alipay+：

- 需要商户入驻或通过服务商。
- 支持收银台支付等产品。
- 需要提供商户注册信息、网站/App 信息，并完成生产验收。

建议实现：

- 国内首选：微信支付 + 支付宝。
- 服务端统一抽象 `payment_providers`，App 不直接调用支付密钥。
- App 只拿服务端生成的支付参数。
- 支付结果以服务端回调为准，不信任客户端返回。

### 5.4 国际支付 / 市场交易

Stripe：

- 一次性 Web 支付优先 Checkout Sessions。
- 市场/多方分账用 Stripe Connect。
- 新 Connect 集成优先参考 Accounts v2。
- Stripe Connect 可处理 connected accounts onboarding、KYC、payout 等，但仍需要平台处理业务规则、纠纷、税务、退款和风控。

建议：

- 如果未来面向海外艺术家/机构，用 Stripe Connect。
- 国内交易先不要用 Stripe 做主通道，除非业务主体和收款地区匹配。

### 5.5 订单与钱包数据模型

建议先做：

- `orders`
- `order_items`
- `payments`
- `payment_events`
- `refunds`
- `invoices`
- `seller_settlements`
- `payout_requests`

暂缓真正钱包余额：

- `wallet_accounts`
- `wallet_ledger_entries`
- `wallet_holds`
- `wallet_withdrawals`

如果必须做钱包：

- 所有余额必须是 ledger，不允许只存一个 `balance` 字段。
- 每一笔资金变动都有双向流水。
- 提现、退款、冻结、解冻都要可审计。
- 需要法务确认是否触及储值账户或支付业务许可。

## 6. 高并发与稳定性设计

### 6.1 数据库

必须做：

- 为列表筛选字段建索引。
- Feed 使用 cursor pagination。
- RLS 策略避免复杂递归查询。
- 高频计数走 RPC/事务。
- 大表分离详情字段和列表摘要。
- 对 `created_at`、`status`、`author_id`、`school_id`、`program_id` 建组合索引。

建议索引：

- `community_posts(status, created_at desc)`
- `community_posts(author_id, created_at desc)`
- `post_comments(post_id, created_at)`
- `programs(status, school_id)`
- `programs(status, degree_type)`
- `schools(status, country)`
- `user_favorites(user_id, target_type, target_id)`

### 6.2 BFF

必须做：

- API 参数校验。
- 统一错误格式。
- 权限中间件。
- 管理员鉴权。
- 用户限流。
- 幂等键：支付、发布、报名。
- 日志打点：request id、user id、耗时、状态码。

### 6.3 缓存

优先缓存：

- 首页。
- 学校列表。
- 学校详情。
- 专业详情。
- 活动列表。
- 热门内容。

不能随便缓存：

- 我的收藏。
- 我的报名。
- 订单支付状态。
- 钱包余额。

### 6.4 文件与图片

- 用户上传图片限制大小、类型、数量。
- 图片写 Storage。
- 数据库只保存 URL 和 metadata。
- 服务端校验 MIME。
- 后续可接图片压缩/鉴黄/内容安全。

### 6.5 风控

- 登录失败限流。
- AI 请求限流。
- 发布频率限制。
- 评论频率限制。
- 举报机制。
- 管理员内容下架。
- 审计日志。

## 7. 测试与质量

### 7.1 当前必须修复

- `npm run test:web` 需恢复全绿。
- `flutter test` 保持全绿。
- 后端健康检查需要配置 Supabase service role 后跑通。

### 7.2 测试矩阵

App：

- model parse tests。
- service API tests。
- widget smoke tests。
- 登录/发布/浏览关键路径集成测试。

Web：

- API contract tests。
- Route handler 权限测试。
- 页面 smoke tests。
- Playwright E2E。

Database：

- migration apply/reset。
- RLS 测试。
- 性能 explain。
- 健康检查。

支付：

- 创建订单。
- 支付回调。
- 重复回调幂等。
- 退款。
- 超时关闭。
- 失败重试。

## 8. 环境与上线准备

### 8.1 本地开发必备环境变量

`web/.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MOONSHOT_API_KEY=
OPENAI_API_KEY=
OPENAI_BASE_URL=
AI_MODEL=
```

App 通过 dart define：

```bash
--dart-define=WEB_DEV_PORT=3003
--dart-define=API_BASE_URL=https://api.example.com
--dart-define=DEV_LOGIN=true
```

### 8.2 正式部署

Web：

- PM2 或平台托管。
- HTTPS。
- 环境变量只在服务器。
- Nginx 反代。
- 日志轮转。

App：

- Android 包名、签名、隐私政策。
- iOS Bundle ID、证书、App Store 隐私表单。
- 启动图、图标、权限说明。
- App Store / 应用市场支付合规审查。

### 8.3 监控

建议接入：

- Sentry：App + Web 错误。
- Supabase logs。
- API access log。
- 支付 webhook log。
- AI usage log。

## 9. 排期估算

### 9.1 只做可内测 MVP

范围：

- 登录。
- 首页。
- 院校/专业。
- AI 咨询。
- 社区图文发布/浏览。
- 个人资料。
- Web 首页 + 基础详情页。
- 后端测试全绿。

估算：

- 1 个主力开发：6-8 周。
- 2 个开发并行：4-6 周。

### 9.2 做到原型消费者端较完整

范围：

- MVP 全部。
- 沙龙/活动。
- 问答。
- 话题。
- 用户主页。
- 收藏/点赞/评论。
- 通知。
- 基础后台。

估算：

- 1 个主力开发：10-14 周。
- 2-3 个开发并行：7-10 周。

### 9.3 做到消费者端 + 商业端 + 支付

范围：

- 消费者端完整。
- 商业端工作台。
- 项目管理。
- 订单支付。
- 结算/提现初版。
- 管理后台。

估算：

- 2-3 个开发：3-4 个月。
- 如果包含真实钱包、分账、提现、合规审查，建议按 4-6 个月规划。

## 10. 接下来几个小时的执行计划

这几个小时不能“一口气做完整个平台”，但可以一口气完成产品进入工程化开发前最关键的底座。

### 第 0 小时：环境与仓库整理

- 确认 `web/.env.local` 补齐 `SUPABASE_SERVICE_ROLE_KEY`。
- 修正 web 依赖版本/lockfile 状态。
- 修复 `npm run test:web` 两个失败测试。
- 确认 `flutter test` 全绿。

### 第 1 小时：MVP 范围冻结

- 将原型模块映射到 App/Web/API。
- 在 `docs/` 维护 MVP checklist。
- 明确第一版不做真实钱包，只做订单预留。

### 第 2-3 小时：发布图文真实闭环

- App `CreatePostScreen` 接 `StorageService.uploadUserObject`。
- 上传多图到 `/api/v1/upload`。
- 调 `BackendApiService.createCommunityPost`。
- 社区列表读取 `community_posts`。
- 补 Flutter parse test。

### 第 3-4 小时：院校/专业详情闭环

- 修复学校 id 类型和 API 契约。
- 学校详情接真实字段。
- 专业列表点击进入详情。
- 修复 `qs_art_rank` / `qs_art_design_rank` 命名不一致。

### 第 4-5 小时：AI 咨询真实化

- `AiConsultScreen` 调 `/api/v1/ai/schools/search`。
- 保留 mock fallback。
- 加加载态、错误态、限流提示。

### 第 5-6 小时：Web 首页按原型改造第一版

- 将原型首页视觉迁入 `web/app/page.tsx` 或组件。
- 接真实首页/社区/院校数据。
- 保持移动优先。

### 第 6 小时后：回归

- `flutter test`
- `npm run test:web`
- 手动打开 App/Web 核心路径。
- 记录未完成项。

## 11. 风险清单

| 风险 | 影响 | 应对 |
|---|---|---|
| 原型功能太多 | 范围失控 | MVP 冻结，商业端延后 |
| 数据库 schema 不完整 | 换环境不可复现 | 补 migrations |
| 支付/钱包合规复杂 | 上线被拒或违法风险 | 先订单，后钱包，法务确认 |
| App Store IAP 规则 | 支付方案返工 | 数字内容提前按 IAP 设计 |
| 高并发下 feed 慢 | 用户体验差 | cursor、缓存、索引 |
| 图片上传滥用 | 成本和内容风险 | 限制、审核、举报 |
| AI 成本不可控 | 费用失控 | 限流、缓存、用量日志 |
| 三套 UI 分叉 | 维护成本高 | 只保留当前主仓正式 UI |

## 12. 外部开通清单

必须：

- Supabase 项目。
- Supabase service role key。
- 域名与 HTTPS。
- Apple Developer 账号。
- Google Play Developer 账号。
- 隐私政策、用户协议。

AI：

- Moonshot/OpenAI 兼容 API key。
- 模型计费预算。

国内支付：

- 微信支付商户号。
- 微信开放平台移动应用 AppID。
- APP 支付权限。
- 支付宝商户/开放平台应用。

国际支付：

- Stripe 账号。
- Stripe Checkout。
- Stripe Connect，若做 marketplace/payout。

合规/运营：

- 公司主体/个体户主体。
- ICP 备案，若中国大陆服务器/域名运营。
- 内容审核策略。
- 客服与投诉处理机制。
- 发票/税务处理方案。

## 13. 参考资料

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
- 微信支付 APP 支付接入指引: https://pay.wechatpay.cn/static/applyment_guide/applyment_detail_app.shtml
- 微信支付 APP 支付权限申请: https://pay.wechatpay.cn/doc/v3/merchant/4013070174
- Stripe Connect docs: https://docs.stripe.com/connect
- Stripe marketplace guide: https://docs.stripe.com/connect/end-to-end-marketplace
- 中国人民银行《非银行支付机构监督管理条例》: https://www.pbc.gov.cn/tiaofasi/144941/144953/5174993/index.html


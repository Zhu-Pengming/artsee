# APP 端 API 覆盖情况（对照 Web 端 `/api/v1/*`）

> 生成时间：2026-05-26  
> Web 端 API 总数：**62 个路由**  
> APP 端 `backend_api_service.dart` 已实现：**约 45+ 方法**

---

## ✅ 已实现（APP 端有对应方法）

| Web API 路径 | APP 方法 | 说明 |
|-------------|---------|------|
| `POST /ai/consult` | `aiConsult()` | AI 咨询 |
| `POST /ai/schools/search` | `aiSchoolSearch()` | AI 院校搜索 |
| `GET /artists` | `fetchArtists()` | 艺术家列表 |
| `GET /artists/[id]` | `fetchArtistDetail()` | 艺术家详情 |
| `GET /artworks` | `fetchArtworks()` | 作品列表 |
| `GET /artworks/[id]` | `fetchArtwork()` | 作品详情 |
| `POST /artworks` | `createArtwork()` | 创建作品 |
| `PATCH /artworks/[id]` | `updateArtwork()` | 更新作品 |
| `DELETE /artworks/[id]` | `deleteArtwork()` | 删除作品 |
| `POST /artworks/[id]/like` | `likeArtwork()` | 点赞作品 |
| `DELETE /artworks/[id]/like` | `unlikeArtwork()` | 取消点赞 |
| `POST /artworks/[id]/favorite` | `favoriteArtwork()` | 收藏作品 |
| `DELETE /artworks/[id]/favorite` | `unfavoriteArtwork()` | 取消收藏 |
| `GET /artworks/me` | `fetchMyArtworks()` | 我的作品 |
| `POST /auth/signup` | `signup()` | 注册 |
| `POST /auth/complete-onboarding` | `completeOnboarding()` | 完成引导 |
| `GET /cases` | `fetchCases()` | 案例列表 |
| `GET /cases/[id]` | `fetchCaseDetail()` | 案例详情 |
| `GET /community/posts` | `fetchCommunityPosts()` | 社区帖子列表 |
| `GET /community/posts/[id]` | `fetchCommunityPost()` | 帖子详情 |
| `POST /community/posts` | `createCommunityPost()` | 发布帖子 |
| `POST /community/posts/[id]/like` | `likeCommunityPost()` | 点赞帖子 |
| `DELETE /community/posts/[id]/like` | `unlikeCommunityPost()` | 取消点赞 |
| `GET /community/posts/[id]/comments` | `fetchCommunityComments()` | 评论列表 |
| `POST /community/posts/[id]/comments` | `createCommunityComment()` | 发表评论 |
| `GET /events` | `fetchEvents()` | 活动列表 |
| `GET /events/[id]` | `fetchEvent()` | 活动详情 |
| `POST /events` | `createEvent()` | 创建活动（管理员） |
| `PATCH /events/[id]` | `updateEvent()` | 更新活动（管理员） |
| `DELETE /events/[id]` | `archiveEvent()` | 归档活动（管理员） |
| `POST /events/[id]/apply` | `applyEvent()` | 活动报名 |
| `POST /events/[id]/checkin` | `checkinEvent()` | 活动签到 |
| `GET /events/applications/me` | `fetchMyEventApplications()` | 我的活动报名 |
| `POST /admin/event-applications/[id]/review` | `reviewEventApplication()` | 审核活动报名（管理员） |
| `GET /opportunities` | `fetchOpportunities()` | 合作机会列表 |
| `GET /opportunities/[id]` | `fetchOpportunity()` | 合作机会详情 |
| `POST /opportunities` | `createOpportunity()` | 创建合作机会（管理员） |
| `PATCH /opportunities/[id]` | `updateOpportunity()` | 更新合作机会（管理员） |
| `DELETE /opportunities/[id]` | `archiveOpportunity()` | 归档合作机会（管理员） |
| `POST /opportunities/[id]/apply` | `applyOpportunity()` | 申请合作机会 |
| `GET /opportunity-applications/me` | `fetchMyOpportunityApplications()` | 我的合作申请 |
| `POST /admin/opportunity-applications/[id]/review` | `reviewOpportunityApplication()` | 审核合作申请（管理员） |
| `GET /orders` | `fetchMyOrders()` | 我的订单 |
| `POST /payments/checkout` | `createCheckoutSession()` | 创建支付订单 |
| `GET /programs` | `fetchPrograms()` / `fetchProgramsPaginated()` | 专业列表 |
| `GET /programs/[id]` | `fetchProgram()` / `fetchProgramDetail()` | 专业详情 |
| `GET /schools` | `fetchSchools()` | 院校列表 |
| `GET /schools/[id]` | `fetchSchool()` | 院校详情 |
| `POST /verifications` | `submitVerification()` | 提交认证 |
| `GET /verifications/me` | `fetchMyVerifications()` | 我的认证 |
| `POST /admin/verifications/[id]/review` | `reviewVerification()` | 审核认证（管理员） |
| `POST /upload` | `uploadFile()` | 文件上传 |

---

## ❌ 未实现（Web 有但 APP 端缺失）

| Web API 路径 | 说明 | 优先级 |
|-------------|------|--------|
| `POST /ai/analyze` | AI 分析（可能用于作品集诊断） | 中 |
| `POST /ai/chat` | AI 对话（可能与 `/ai/consult` 重复） | 低 |
| `POST /ai/record` | AI 对话记录保存 | 低 |
| `GET /artworks/[id]/stats` | 作品统计数据 | 低 |
| `POST /auth/dev-login` | **开发者登录**（节点二需要） | **高** |
| `POST /auth/login` | 邮箱密码登录（当前 APP 用 Supabase Auth） | 中 |
| `POST /auth/register` | 邮箱密码注册（当前 APP 用 Supabase Auth） | 中 |
| `GET /auth/profile` | 获取用户资料（当前 APP 用 `SupabaseService.fetchProfile()`） | 低 |
| `PATCH /auth/profile` | 更新用户资料 | 中 |
| `GET /auth/profile/export` | 导出用户数据 | 低 |
| `GET /auth/profile/field-history` | 字段修改历史 | 低 |
| `POST /auth/send-sms` | 发送短信验证码 | 中 |
| `POST /auth/verify-sms` | 验证短信验证码 | 中 |
| `PATCH /auth/update-profile` | 更新用户画像 | 中 |
| `GET /home-contents` | 首页内容（可能用于 CMS） | 低 |
| `GET /home-contents/[id]` | 首页内容详情 | 低 |
| `POST /init-db` | 初始化数据库（仅管理员） | 低 |
| `POST /knowledge/search` | 知识库搜索（RAG） | 中 |
| `GET /notifications` | 通知列表 | **高** |
| `POST /notifications/[id]/read` | 标记通知已读 | **高** |
| `POST /notifications/read-all` | 全部已读 | **高** |
| `GET /projects/me` | 我的项目（可能指作品集项目） | 中 |
| `GET /projects/[id]/status` | 项目状态 | 中 |
| `GET /admin/events` | 管理员：活动列表 | 低 |
| `GET /admin/events/[id]` | 管理员：活动详情 | 低 |
| `GET /admin/opportunities` | 管理员：合作机会列表 | 低 |

---

## 🔍 节点二关键缺失（建议补充）

### 1. **通知系统**（高优先级）
- `GET /api/v1/notifications` → `fetchNotifications()`
- `POST /api/v1/notifications/[id]/read` → `markNotificationRead()`
- `POST /api/v1/notifications/read-all` → `markAllNotificationsRead()`

**理由**：节点二要求"通知消息"功能，当前 APP 端完全缺失。

### 2. **开发者登录**（高优先级）
- `POST /api/v1/auth/dev-login` → `devLogin()`

**理由**：当前 APP 端有 `dev_test_account.dart` 配置，但未调用 Web 端的 `/auth/dev-login` 接口，而是直接用 Supabase Auth。建议统一走 BFF。

### 3. **AI 推荐卡片**（节点二新增）
- `GET /api/v1/ai/recommend-cards` → `fetchAiRecommendCards()`

**状态**：✅ 已在本次改造中新增，但 **Web 端接口尚未实现**，需后端补充。

### 4. **知识库搜索**（中优先级）
- `POST /api/v1/knowledge/search` → `searchKnowledge()`

**理由**：可能用于 AI 问答的 RAG 增强，节点二可选。

### 5. **用户资料管理**（中优先级）
- `PATCH /api/v1/auth/profile` → `updateProfile()`
- `GET /api/v1/auth/profile/export` → `exportProfile()`

**理由**：当前 APP 端直接用 Supabase，但节点二要求"认证中心"，可能需要走 BFF 统一管理。

---

## 📊 覆盖率统计

| 类别 | Web 端路由数 | APP 已实现 | 覆盖率 |
|------|-------------|-----------|--------|
| **AI** | 5 | 2 | 40% |
| **艺术家** | 2 | 2 | 100% |
| **作品** | 9 | 8 | 89% |
| **认证/用户** | 11 | 2 | 18% |
| **案例** | 1 | 1 | 100% |
| **社区** | 5 | 5 | 100% |
| **活动** | 5 | 5 | 100% |
| **合作机会** | 5 | 5 | 100% |
| **订单/支付** | 2 | 2 | 100% |
| **专业/院校** | 4 | 4 | 100% |
| **认证审核** | 3 | 3 | 100% |
| **通知** | 3 | 0 | **0%** |
| **其他** | 7 | 0 | 0% |
| **总计** | **62** | **~45** | **~73%** |

---

## ✅ 结论

1. **核心业务接口覆盖良好**：院校、专业、活动、合作机会、社区、作品等节点二关键功能已全部接入。
2. **关键缺失**：
   - **通知系统**（0% 覆盖，节点二必需）
   - **开发者登录**（当前绕过 BFF 直连 Supabase）
   - **AI 推荐卡片**（APP 已调用但 Web 端接口未实现）
3. **建议**：
   - 优先补充通知相关 3 个接口
   - 统一开发者登录走 BFF
   - Web 端补充 `/api/v1/ai/recommend-cards` 实现
   - 其余缺失接口（如短信、知识库搜索）按需补充

**节点二验收前需确保通知系统接口完整。**

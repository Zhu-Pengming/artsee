# Artiqore 角色体系与实施计划

更新日期：2026-06-14

---

## 1. 商业模式

平台采用**会员制信息撮合**模式，收入来源：

| 收入来源 | 对象 | 说明 |
|----------|------|------|
| 用户会员费 | 普通用户 | 解锁「开始咨询」权限，可联系机构 |
| 机构入驻/年费 | 留学机构 | 出现在机构列表、接收会员用户的咨询 |

**平台不参与用户与机构之间的合同、收费、服务交付。**

详细设计见 [`MEMBERSHIP_AND_CONSULTATION_DESIGN.md`](./MEMBERSHIP_AND_CONSULTATION_DESIGN.md)。

---

## 2. 用户角色

### 普通用户（免费）

- 浏览院校信息
- 看社区内容、发帖
- 点「开始咨询」→ 可以看机构列表
- 无法发起会话（弹升级提示）

### 会员用户（付费）

- 以上全部
- 点「开始咨询」→ 进入机构列表
- 选机构 → 选线上/线下
- 线上：直接在 App 内发起会话
- 线下：查看机构地址/联系方式，自行约

### 机构（入驻/年费）

- 出现在机构列表
- 接收会员用户的线上咨询
- 工作台管理咨询、回复
- 线下合同由机构和用户自行签署，平台只做记录存档

---

## 3. 当前代码状态

### 已有基础

- `organizations`、`organization_members`：机构主体与成员
- `consultations`、`consultation_messages`：咨询会话
- `orders`、`payment_events`：支付基础设施
- 工作台 API：`/api/v1/me/workbench/*`
- 管理后台：`/admin/*`（内容审核、用户管理、数据看板）
- 统一授权层、RLS、高风险接口收口
- 创作者等级、内容审核、举报处理

### 暂时搁置（不删不改）

导师交易撮合相关模块：

- `mentors`、`mentor_services`、`mentor_availability_slots`
- `mentor_bookings`、`mentor_reviews`
- `mentor_earnings`、`mentor_withdrawal_requests`
- `payout_batches`、`payout_batch_items`

### 需要新增

- 会员状态字段（`user_profiles`）
- 机构地理位置和排序字段（`organizations`）
- 合同存档表（`contracts`）
- 机构列表 API
- 会员状态和购买 API

---

## 4. 实施优先级

### P0：本周

| 任务 | 说明 |
|------|------|
| 会员状态字段 | `user_profiles` 加 `membership_status`、`membership_expires_at` |
| 机构列表 API | `GET /api/v1/organizations/nearby`，支持城市、领域、服务方式筛选 |
| 会员状态 API | `GET /api/v1/me/membership` |
| Flutter 机构列表页 | 从「开始咨询」入口进入，展示机构卡片 |

### P1：下周

| 任务 | 说明 |
|------|------|
| 会员购买流程 | 复用现有 checkout，新增 `membership_*` 商品类型 |
| 非会员拦截 | 点「线上咨询」或「线下见面」时检查会员状态，弹升级提示 |
| 机构详情页 | 展示机构完整信息、评价、服务方式 |
| 线上咨询创建 | 会员选机构后创建 consultation |

### P2：两周内

| 任务 | 说明 |
|------|------|
| 合同存档 | 用户上传合同，机构工作台可见 |
| 咨询评价 | 会话结束后用户评价，影响机构排序 |
| 机构入驻支付 | 机构年费订阅 |

---

## 5. 数据库变更

### 会员订阅

```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS membership_status TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_started_at TIMESTAMPTZ;
```

### 机构排序字段

```sql
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS supports_online BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS supports_offline BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_count INT NOT NULL DEFAULT 0;
```

### 合同存档

```sql
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  file_url TEXT,
  signed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 6. API 设计

### 新增接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/organizations/nearby` | 按城市/坐标返回机构列表 |
| GET | `/api/v1/me/membership` | 当前用户会员状态 |
| POST | `/api/v1/me/membership/upgrade` | 发起会员购买 |
| GET | `/api/v1/me/contracts` | 用户合同列表 |
| POST | `/api/v1/me/contracts` | 上传合同存档 |
| GET | `/api/v1/me/workbench/contracts` | 机构工作台查看合同 |

### 支付复用

```
POST /api/v1/payments/checkout
  → body: { product_type: 'membership_yearly', ... }

POST /api/v1/payments/webhook/:provider
  → 支付成功后更新 membership_status
```

---

## 7. 测试计划

```bash
npm run test:backend
cd web && npm test
cd app && flutter test
```

重点测试：

- 会员状态 API 契约
- 机构列表筛选和排序
- 非会员拦截逻辑
- 支付 webhook 更新会员状态

---

## 8. 验收账号

| 角色 | 账号 |
|------|------|
| 普通用户 | `dev.test@artsee.app` / `ArtseeDev2026!` |
| 机构 owner | 创建 business onboarding 用户并创建组织 |
| 管理员 | `user_profiles.role = admin` |

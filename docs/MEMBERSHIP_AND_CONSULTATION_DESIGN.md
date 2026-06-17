# Artiqore 会员制商业模式与咨询入口设计

更新日期：2026-06-14

## 1. 商业模式重定位

平台从「交易撮合」转为「会员制信息撮合」，收入来源只有两项：

| 收入来源 | 对象 | 说明 |
|----------|------|------|
| 用户会员费 | 普通用户 | 解锁「开始咨询」权限，可联系机构 |
| 机构入驻/年费 | 留学机构 | 出现在机构列表、接收会员用户的咨询 |

**平台不参与用户与机构之间的合同、收费、服务交付。** 签约之后是机构和用户自己的事，平台只记录合同存档。

### 支付模块复用

原有支付基础设施（checkout、webhook、订单状态）直接复用，只是付款对象变了：

```
orders.product_type:
  原有：mentor_booking（暂时搁置，不删不改）
  新增：membership_monthly / membership_yearly / org_subscription
```

webhook 回调支付成功后，更新 `user_profiles.membership_status = 'member'` 和到期时间，整个支付链路不需要重写。

**搁置的模块**（不删不动，等以后看要不要再做）：
- `mentors`、`mentor_services`、`mentor_availability_slots`
- `mentor_bookings`、`mentor_reviews`
- `mentor_earnings`、`mentor_withdrawal_requests`
- `payout_batches`、`payout_batch_items`

---

## 2. 用户角色简化

### 普通用户（免费）

```
├─ 浏览院校信息
├─ 看社区内容、发帖
├─ 点「开始咨询」→ 可以看机构列表
└─ 无法发起会话（弹升级提示）
```

### 会员用户（付费）

```
├─ 以上全部
├─ 点「开始咨询」→ 进入机构列表
├─ 选机构 → 选线上/线下
└─ 线上：直接在 App 内发起会话
   线下：查看机构地址/联系方式，自行约
```

### 机构（入驻/年费）

```
├─ 出现在机构列表
├─ 接收会员用户的线上咨询
├─ 工作台管理咨询、回复
└─ 线下合同由机构和用户自行签署，平台只做记录存档
```

---

## 3.「开始咨询」触发入口

### 触发位置

| 位置 | 行为 |
|------|------|
| 院校详情页 | 跳转机构列表，默认展示擅长该院校的机构，附带用户定位城市筛选 |
| 院校列表页（探索页） | 全局入口，跳转机构列表，不附带院校上下文，按用户城市和默认排序展示 |

---

## 4. 机构列表页设计

### 定位逻辑

进入机构列表时，系统自动读取用户的定位城市，优先展示同城机构。用户可手动切换城市。

### 排序与筛选

**默认排序**综合以下因素：

```
综合排序权重：
├─ 距离（同城 > 同省 > 全国）
├─ 评分（用户对咨询过程的评价）
└─ 专注领域匹配度（如用户来自院校详情页，优先匹配擅长该院校的机构）
```

**用户可手动筛选**：

```
筛选维度：
├─ 距离（最近优先）
├─ 评分（高分优先）
├─ 专注领域（英国院校 / 美国院校 / 作品集辅导 / ...）
└─ 服务方式（支持线上 / 支持线下）
```

### 机构卡片信息

```
机构卡片展示：
├─ 机构名称、头像
├─ 城市、距离（xx km）
├─ 专注领域标签（英国留学 / RCA / 服务设计...）
├─ 评分（x.x 分，xx 条评价）
└─ 服务方式标签（线上咨询 / 支持线下见面）
```

---

## 5. 非会员的访问体验

**非会员可以**：
- 进入机构列表页，浏览所有机构卡片
- 查看机构基本信息（名称、领域、城市、评分）

**非会员不可以**：
- 点击「线上咨询」发起会话
- 查看机构联系方式（线下入口）

**触发限制时**：弹出「升级会员」浮层，说明会员权益，引导付费。不直接跳走，让用户先看到列表、感知到价值，再转化。

---

## 6. 线上咨询流程

```
会员用户选择机构 → 点「线上咨询」
  ↓
创建 consultation 记录（关联机构、关联院校上下文）
  ↓
进入会话界面（App 内聊天）
  ↓
机构在工作台收到新咨询通知
  ↓
机构老师回复（工作台 → 内部分配给具体老师）
  ↓
用户和老师持续会话
  ↓
会话结束后用户可评价（影响机构排序）
```

---

## 7. 线下咨询流程

```
会员用户选择机构 → 点「线下见面」
  ↓
展示机构地址、电话、企业微信二维码
  ↓
用户自行联系机构（出了平台，机构用企业微信跟进）
  ↓
双方签署留学合同（平台外，机构和用户自己的事）
  ↓
用户回到平台 → 上传合同存档（可选）
  ↓
平台记录「已签约」状态，机构工作台可见
```

**合同存档的价值**：
- **用户**：有记录，避免纠纷
- **机构**：成交数据可展示，提升信任背书
- **平台**：积累真实成交数据，未来可用于机构排序权重

---

## 8. 数据库设计

### 8.1 会员订阅（扩展 user_profiles）

```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS membership_status TEXT NOT NULL DEFAULT 'free',
  -- free / member / expired
  ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_started_at TIMESTAMPTZ;
```

### 8.2 机构列表排序字段（扩展 organizations）

```sql
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- ['uk', 'us', 'portfolio', 'rca', ...]
  ADD COLUMN IF NOT EXISTS supports_online BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS supports_offline BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_count INT NOT NULL DEFAULT 0;
  -- 已存档合同数，用于可信度展示
```

### 8.3 合同存档表

```sql
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  -- 如果来自线上咨询，关联会话
  file_url TEXT,
  -- 合同文件 Storage 链接
  signed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending / confirmed / disputed
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 9. API 设计

### 新增接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/organizations/nearby` | 按城市/坐标返回机构列表，支持筛选和排序 |
| GET | `/api/v1/me/membership` | 当前用户会员状态 |
| POST | `/api/v1/me/membership/upgrade` | 发起会员购买（复用现有支付 checkout） |
| GET | `/api/v1/me/contracts` | 用户合同列表 |
| POST | `/api/v1/me/contracts` | 上传合同存档 |
| GET | `/api/v1/me/workbench/contracts` | 机构工作台查看已存档合同 |

### 现有支付模块复用

```
POST /api/v1/me/membership/upgrade
  → body: { plan: 'monthly' | 'yearly' }
  → 后端按环境变量价格创建 membership_* 订单并复用 checkout

POST /api/v1/me/organizations/:id/subscription/upgrade
  → 后端按环境变量价格创建 org_subscription 订单并复用 checkout

POST /api/v1/payments/checkout
  → 仅用于普通服务订单
  → membership_monthly / membership_yearly / org_subscription 必须走专用接口

POST /api/v1/payments/webhook/:provider
  → 支付成功后更新 user_profiles.membership_status
```

### 过期状态同步

读接口会实时计算会员和机构年费是否已过期，保证业务权限安全；同时提供管理员维护接口把存储状态回写为 `expired`，方便后台筛选、运营导出和人工排查。

```
POST /api/v1/admin/maintenance/expire-subscriptions
  → 管理员登录后可在 /admin/dashboard 手动触发
  → 服务器定时任务可带 x-artiqore-cron-secret 调用
  → 回写 user_profiles.membership_status = 'expired'
  → 回写 organizations.subscription_status = 'expired'
```

建议生产环境每日执行一次：

```bash
curl -X POST https://artiqore.com/api/v1/admin/maintenance/expire-subscriptions \
  -H "x-artiqore-cron-secret: $SUBSCRIPTION_EXPIRATION_CRON_SECRET"
```

---

## 10. 实施优先级

### P0：本周

1. **会员状态字段**：`user_profiles` 加 `membership_status`、`membership_expires_at`
2. **机构列表 API**：`GET /api/v1/organizations/nearby`，支持城市、领域、服务方式筛选
3. **会员状态 API**：`GET /api/v1/me/membership`
4. **Flutter 机构列表页**：从「开始咨询」入口进入，展示机构卡片

### P1：下周

1. **会员购买流程**：复用现有 checkout，新增 `membership_*` 商品类型
2. **非会员拦截**：点「线上咨询」或「线下见面」时检查会员状态，弹升级提示
3. **机构详情页**：展示机构完整信息、评价、服务方式
4. **线上咨询创建**：会员选机构后创建 consultation

### P2：两周内

1. **合同存档**：用户上传合同，机构工作台可见
2. **咨询评价**：会话结束后用户评价，影响机构排序
3. **机构入驻支付**：机构年费订阅

---

## 11. 与现有代码的关系

### 保留并继续使用

- `organizations`、`organization_members`：机构主体与成员
- `consultations`、`consultation_messages`：线上咨询会话
- `orders`、`payment_events`：支付基础设施
- 工作台 API：`/api/v1/me/workbench/*`
- 管理后台：`/admin/*`

### 暂时搁置（不删不改）

- 导师相关：`mentors`、`mentor_services`、`mentor_bookings`、`mentor_reviews`
- 导师收益：`mentor_earnings`、`mentor_withdrawal_requests`
- 打款批次：`payout_batches`、`payout_batch_items`

### 需要新增

- 会员状态字段
- 机构地理位置和排序字段
- 合同存档表
- 机构列表 API
- 会员状态和购买 API

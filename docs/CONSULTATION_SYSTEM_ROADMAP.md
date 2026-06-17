# 咨询系统改造路线

## 一句话定义

艺见心里的“咨询”不应该只是一个表单，也不应该直接理解成“学生联系学校官方”。更准确的产品定义是：

> 学生围绕某个院校、专业、活动或机构发起一条可持续跟进的咨询会话，后端把这条会话作为线索分配给平台顾问或入驻机构处理。

所以它本质是：

- 学生端：咨询入口 + 消息会话
- 后端：线索创建 + 分配路由 + 消息存储 + 状态流转
- 机构/顾问端：咨询工作台 + 回复 + 跟进 + 转化

## 当前状态

已经有的能力：

- App 院校详情页可以提交咨询。
- BFF 已有 `POST /api/v1/me/consultations` 和 `GET /api/v1/me/consultations`。
- Supabase 已有 `consultations` 表，字段包括 `user_id`、`target_type`、`target_id`、`target_name`、`status`、`last_message`。
- App 申请工作台里已经能展示“咨询记录”。

当前主要问题：

- 院校详情页咨询弹窗里的 `TextEditingController` 生命周期不稳，可能触发 `used after being disposed`。
- 咨询现在更像“一次性留言”，不是持续存在的聊天会话。
- 还没有 `consultation_messages` 表保存多条消息。
- 还没有明确“咨询分配给平台顾问还是机构”的后端规则。
- 机构端还没有真正的咨询线索工作台。
- 学生端还没有清晰的全局“消息/咨询”入口。

## 产品原则

1. 院校页面是内容层，不是机构工作台。
2. 学生不需要选择具体机构，学生只需要表达“我想咨询这个学校/方向”。
3. 早期所有咨询默认进入平台顾问池，后续再按入驻机构、专业、地区和在线状态分配。
4. 详情页负责发起咨询，消息中心负责持续沟通。
5. App 不负责决定谁回复，路由和分配由后端完成。

## 推荐用户心智

### 学生看到的是

学生在 RCA 页面点击“咨询顾问”。

提交后看到：

- 已创建咨询会话
- RCA 咨询
- 状态：待回复
- 按钮：查看咨询 / 继续浏览

学生的理解应该是：

> 我已经开了一个咨询窗口，之后的回复都能在消息里看到。

### 平台/机构看到的是

后台看到一条咨询线索：

- 学生是谁
- 咨询对象是什么，比如 RCA
- 目标专业是什么，比如服务设计
- 入学时间是什么，比如 2027 Fall
- 问题内容是什么
- 当前状态是什么
- 分配给谁处理

后台的理解应该是：

> 这是一条待处理线索，可以回复、分配、跟进、关闭，后续可以转预约或订单。

## 阶段 0：先修当前崩溃

目标：不改变业务，只修稳定性。

### App 需要改

把院校详情页里的咨询 bottom sheet 抽成独立 `StatefulWidget`。

当前风险写法：

```dart
final controller = TextEditingController();
await showModalBottomSheet(... TextField(controller: controller) ...);
controller.dispose();
```

推荐写法：

```dart
showModalBottomSheet(
  context: context,
  builder: (_) => ConsultationSheet(
    targetName: targetName,
    onSubmit: submit,
  ),
);
```

`ConsultationSheetState` 内部自己创建和释放 controller：

```dart
class _ConsultationSheetState extends State<ConsultationSheet> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

验收：

- 打开咨询弹窗、输入、关闭、再次打开不报错。
- 提交后关闭弹窗不触发 `TextEditingController was used after being disposed`。
- 不再出现由该异常引发的巨大 RenderFlex overflow。

## 阶段 1：把“咨询申请”改成“咨询顾问”

目标：降低用户理解成本。

### App 需要改

院校详情页按钮文案：

- 主按钮：`加入目标池`
- 次按钮：`加入对比`
- 次按钮：`咨询顾问`

不建议叫 `咨询申请`，因为用户不清楚是在申请什么。`咨询顾问` 更符合真实业务：用户是在找平台顾问问这个院校的问题。

咨询弹窗字段建议：

- 咨询对象：自动展示，比如 `皇家艺术学院`
- 咨询主题：作品集 / 专业选择 / 申请时间线 / 费用预算 / 语言要求
- 目标专业：自由输入或下拉
- 计划入学：2026 Fall / 2027 Fall / 未确定
- 当前阶段：刚开始 / 有作品集 / 已准备材料 / 已递交
- 问题描述：多行输入

第一版可以先只做：

- 咨询主题
- 问题描述

其他字段后续补。

### 后端需要改

`POST /api/v1/me/consultations` 接收更多 metadata：

```json
{
  "target_type": "school",
  "target_id": "ce0cf7d4-1908-45b1-a7f9-6faec1c2aaf2",
  "target_name": "皇家艺术学院",
  "topic": "portfolio",
  "target_major": "服务设计",
  "intake": "2027 Fall",
  "stage": "portfolio_started",
  "message": "我本科工业设计，想申请RCA服务设计，目前只有课程作品，想知道是否需要真实项目。"
}
```

如果暂时不想改表，可以先把这些字段打包进 `metadata jsonb`。

## 阶段 2：把咨询变成会话

目标：用户提交后不是“表单结束”，而是进入一个持续会话。

### 数据库新增表

保留 `consultations` 作为会话主表，新增 `consultation_messages` 保存每条消息。

```sql
create table if not exists consultation_messages (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  sender_role text not null check (
    sender_role in ('student', 'advisor', 'institution', 'system')
  ),
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_consultation_messages_thread
  on consultation_messages (consultation_id, created_at asc);
```

建议给 `consultations` 补字段：

```sql
alter table consultations
  add column if not exists assigned_to_user_id uuid references auth.users(id) on delete set null,
  add column if not exists assigned_to_org_id uuid,
  add column if not exists source text,
  add column if not exists topic text,
  add column if not exists target_major text,
  add column if not exists intake text,
  add column if not exists stage text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;
```

状态建议：

- `new`：刚创建，未处理
- `pending`：已进入队列，等待回复
- `active`：已有回复，正在沟通
- `closed`：已结束

### 后端 API

学生端 API：

```text
POST /api/v1/me/consultations
GET  /api/v1/me/consultations
GET  /api/v1/me/consultations/:id
GET  /api/v1/me/consultations/:id/messages
POST /api/v1/me/consultations/:id/messages
```

后台/顾问端 API：

```text
GET   /api/v1/admin/consultations
PATCH /api/v1/admin/consultations/:id
POST  /api/v1/admin/consultations/:id/messages
```

第一版可以不做实时通信，聊天页打开时拉取，发送后刷新即可。

## 阶段 3：建立咨询分配规则

目标：解决“很多机构，到底给谁”的核心问题。

### 早期推荐规则

早期不要让用户选择机构。

默认规则：

```text
所有院校咨询 -> 平台顾问池
```

原因：

- 绝大多数学校不会在平台上回复。
- 用户不知道该选哪个机构。
- 平台统一接线索，服务质量更可控。

### 中期规则

当机构开始入驻后：

```text
if target_type == institution and institution is active:
  assigned_to_org_id = institution.id
else if school has verified owner institution:
  assigned_to_org_id = institution.id
else:
  assigned_to_user_id = platform_advisor_queue
```

通俗说：

- 用户咨询机构页，就给该机构。
- 用户咨询院校页，默认给平台顾问。
- 如果未来某学校或学校代理有认证账号，再给认证机构。

### 不建议的规则

不建议第一版做：

- 用户手动选择机构列表
- 用户自己选择顾问
- 每个院校页放很多机构入口

这会增加决策成本，降低咨询转化。

## 阶段 4：学生端页面结构

### 院校详情页

只保留一个清晰动作区：

- 加入目标池
- 加入对比
- 咨询顾问

点击“咨询顾问”后：

1. 打开咨询弹窗。
2. 提交到后端。
3. 后端创建 consultation 和第一条 message。
4. App 显示成功态：
   - `已创建咨询会话`
   - `查看咨询`
   - `继续浏览`

### 消息/咨询入口

需要一个全局入口，建议叫：

- `消息`
- 或 `咨询`

入口位置：

- 底部导航新增 `消息`，适合如果消息会成为核心功能。
- 或在“我的”页面放 `我的咨询`，适合第一版轻量上线。

第一版建议：

```text
我的 -> 咨询记录 -> 咨询详情
```

等消息量上来后，再升级为底部导航 `消息`。

### 咨询列表

每张卡显示：

- 咨询对象：皇家艺术学院
- 状态：待回复 / 沟通中 / 已关闭
- 最后一条消息
- 更新时间
- 未读数

### 咨询详情

聊天页显示：

- 顶部：皇家艺术学院咨询
- 副标题：平台顾问将在这里回复
- 消息气泡
- 输入框

如果没有顾问回复：

- 显示系统消息：`咨询已提交，顾问会尽快回复。`

## 阶段 5：机构/顾问端页面结构

不要把机构工作台塞进院校详情页。院校详情页是学生内容页，机构工作台是运营处理页。

### 平台顾问工作台

列表筛选：

- 新咨询
- 未回复
- 沟通中
- 已关闭
- 按目标学校
- 按目标专业

卡片字段：

- 学生昵称
- 咨询对象
- 目标专业
- 入学时间
- 当前阶段
- 最后一条消息
- 状态
- 分配人

操作：

- 回复
- 分配顾问
- 标记已跟进
- 关闭咨询
- 转预约
- 转订单

### 入驻机构工作台

机构只看分配给自己的咨询：

```text
assigned_to_org_id = current_org_id
```

机构不能看到平台全部线索。

## 阶段 6：权限模型

建议角色：

- `student`：只能看自己的咨询。
- `advisor`：看分配给自己的咨询。
- `admin`：看全部咨询和分配。
- `institution_user`：看所属机构的咨询。

后端必须控制权限，App 只负责展示。

## 阶段 7：上线顺序

### 第一步：稳定当前功能

- 修复咨询弹窗 controller dispose 崩溃。
- 把按钮文案改成 `咨询顾问`。
- 提交成功后跳到咨询记录或显示“查看咨询”。

### 第二步：会话化

- 新增 `consultation_messages`。
- 创建咨询时同步创建第一条 message。
- 咨询列表读取 `consultations`。
- 咨询详情读取 `consultation_messages`。

### 第三步：平台顾问池

- 给 `consultations` 增加分配字段。
- 所有学校咨询默认进入平台池。
- 做一个简单 admin/guidance 工作台。

### 第四步：机构入驻

- 增加 `organizations` / `organization_members`。
- 咨询可以分配给机构。
- 机构工作台只看自己的线索。

### 第五步：通知和未读

- 增加 unread count。
- 增加站内消息入口红点。
- 后续接 Push / 邮件。

## 近期最小可交付版本

如果只做一版最小可用，我建议只做这些：

1. 修复咨询弹窗崩溃。
2. 院校详情按钮改成 `咨询顾问`。
3. `consultations` 增加 `metadata` 字段。
4. 创建咨询后跳转到 `申请工作台 -> 咨询记录`。
5. 咨询记录卡片显示：
   - 咨询对象
   - 状态
   - 最后一条消息
   - 创建/更新时间
6. 后端默认所有咨询进入平台顾问池。

这个版本不需要完整聊天，也不需要机构端，就能先让用户感知到：

> 我发起的咨询有地方看，有状态，有后续。

## 不建议现在做的事

- 不建议让用户在院校详情页选择具体机构。
- 不建议把机构工作台放进院校详情的第二个 tab。
- 不建议第一版做复杂实时聊天。
- 不建议把咨询直接当成学校官方客服。
- 不建议 App 自己决定咨询分配给谁。

## 最终目标

最终咨询系统应该形成一条业务漏斗：

```text
浏览院校
  -> 发起咨询
  -> 创建会话
  -> 顾问回复
  -> 预约作品集评审
  -> 申请服务
  -> 成交/订单
```

这条链路跑通后，咨询就不是一个 UI 按钮，而是艺见心从内容浏览进入服务转化的核心入口。

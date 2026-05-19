# Artsee

发现、收藏和分享艺术品的最佳平台。

## skills

- 占用和获取开发端口号：[port-manager](.kimi/skills/port-manager/SKILL.md)
- 开发习惯：[jinhui-stack-debug](.kimi/skills/jinhui-stack-debug/SKILL.md)

## 项目架构

Artsee 采用 **移动优先** 的架构设计，APP 作为核心业务端，Web 作为统一后端服务。

```
┌─────────────────────────────────────────────────────────────────────┐
│                         系统架构                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌──────────────────────────────────────────────────────────┐    │
│    │                         APP (Flutter)                    │    │
│    │                                                          │    │
│    │   • 核心业务端 - 用户主要使用场景                          │    │
│    │   • 作品浏览、收藏、搜索                                   │    │
│    │   • 用户登录 (手机号/微信)                                 │    │
│    │                                                          │    │
│    └────────────────────────┬─────────────────────────────────┘    │
│                             │                                       │
│                             │ HTTPS/REST API                        │
│                             ▼                                       │
│    ┌──────────────────────────────────────────────────────────┐    │
│    │                    Web (Next.js)                         │    │
│    │                                                          │    │
│    │   • 网站展示 + 后端 API                                    │    │
│    │   • 管理后台 Dashboard                                     │    │
│    │   • 统一数据访问层                                         │    │
│    │   • 身份认证 (Supabase Auth)                               │    │
│    │                                                          │    │
│    └────────────────────────┬─────────────────────────────────┘    │
│                             │                                       │
│                             │ SQL/Realtime                          │
│                             ▼                                       │
│    ┌──────────────────────────────────────────────────────────┐    │
│    │              Database (Supabase PostgreSQL)              │    │
│    │                                                          │    │
│    │   • 学校、专业、艺术分类数据                               │    │
│    │   • 用户信息 (扩展 auth.users)                             │    │
│    │   • 收藏、关注关系                                         │    │
│    │                                                          │    │
│    └──────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 核心定位

| 模块 | 定位 | 职责 |
|------|------|------|
| **APP** | 🎯 **核心业务端** | 承载所有用户交互，作品浏览、收藏、搜索 |
| **Web** | 🔧 **网站 + 后端** | 提供管理后台 + 统一 API 服务 + 身份认证 |
| **Database** | 💾 **数据层** | 存储所有业务数据，仅 Web 后端直接访问 |

## 技术栈

### APP 端 (Flutter)
| 技术 | 用途 |
|------|------|
| Flutter | 跨平台移动开发 |
| Dart | 编程语言 |
| supabase_flutter | Supabase 客户端 |
| wechat_kit | 微信登录 SDK |
| Riverpod | 状态管理 |

### Web 端 (Next.js)
| 技术 | 用途 |
|------|------|
| Next.js 15 | React 全栈框架 |
| Tailwind CSS 4 | 样式系统 (青花瓷主题) |
| shadcn/ui | 组件库 |
| Supabase | 数据库 + 认证 |
| TypeScript | 编程语言 |

### 数据库 (Supabase)
| 技术 | 用途 |
|------|------|
| PostgreSQL | 关系型数据库 |
| Supabase Auth | 用户认证系统 |
| Row Level Security | 数据权限控制 |

## 数据库结构

### 核心业务表

```
schools (学校)
  └── programs (项目)
       ├── program_admissions (录取信息)
       ├── program_fees (费用)
       ├── program_evaluations (评估)
       └── art_categories (艺术分类) [多对多]

auth.users (Supabase 内置)
  └── user_profiles (用户资料扩展)
       ├── user_favorites (收藏)
       └── user_follows (关注)
```

### 用户认证系统

支持多种登录方式：

| 方式 | 实现 |
|------|------|
| **手机号 + 验证码** | 自定义 SMS + Supabase Auth |
| **微信登录** | 微信 SDK + OpenID/UnionID 绑定 |
| **邮箱 + 密码** | Supabase Auth 原生支持 |

### 关键表说明

| 表名 | 说明 | 记录数 |
|------|------|--------|
| `schools` | 艺术院校信息 | 待导入 |
| `art_categories` | 艺术专业分类 | 81 条 |
| `programs` | 艺术项目/专业 | 待导入 |
| `program_admissions` | 录取要求 | 一对一 |
| `program_fees` | 学费信息 | 一对一 |
| `program_evaluations` | 申请难度评估 | 一对一 |
| `user_profiles` | 用户资料扩展 | 动态 |
| `user_favorites` | 用户收藏 | 动态 |

详细设计见 [DATABASE_SCHEMA_V2.md](./DATABASE_SCHEMA_V2.md)

## 项目结构

```
artsee/
├── app/                          # 📱 Flutter 移动应用
│   ├── lib/
│   │   ├── main.dart             # 入口，青花瓷主题
│   │   ├── services/             # API 服务层
│   │   │   └── auth_service.dart # 认证服务
│   │   ├── screens/              # 页面
│   │   │   └── login_screen.dart # 登录页
│   │   └── models/               # 数据模型
│   └── pubspec.yaml
│
├── web/                          # 🌐 Next.js 网站 + 后端
│   ├── app/
│   │   ├── page.tsx              # 网站首页
│   │   ├── dashboard/            # 管理后台
│   │   │   └── page.tsx          # Dashboard 页面
│   │   └── api/                  # API 路由
│   │       └── v1/
│   │           └── auth/         # 认证 API
│   ├── lib/
│   │   └── supabase/             # Supabase 配置
│   └── app/globals.css           # 青花瓷主题
│
├── init_data/                    # 🗂️ 数据初始化
│   ├── create_database_v2.sql    # 数据库建表脚本
│   ├── import_from_feishu.py     # 飞书数据导入
│   └── lib/FS.py                 # 飞书 API 工具
│
├── README.md                     # 本文件
├── DATABASE_SCHEMA_V2.md         # 数据库设计文档
├── AUTH_SYSTEM.md                # 认证系统文档
└── DESIGN_SYSTEM.md              # 青花瓷设计系统
```

## 快速开始

### 环境要求
- Node.js 18+
- Flutter SDK 3.11+
- Supabase 账号

### 1. 安装依赖

```bash
# Web 依赖
npm install

# APP 依赖
cd app && flutter pub get
```

### 2. 配置环境变量

创建 `web/.env.local`：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://nufrgmlhlfmhxsqbybfd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 微信登录配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# 短信服务配置
SMS_PROVIDER=aliyun
SMS_ACCESS_KEY_ID=your_key
SMS_ACCESS_KEY_SECRET=your_secret
```

### 3. 初始化数据库

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 进入 SQL Editor
3. 执行 `init_data/create_database_v2.sql`

### 4. 导入数据（可选）

```bash
cd init_data
python3 import_from_feishu.py
```

### 5. 运行开发服务器

```bash
# 运行 Web
npm run dev:web

# 运行 APP (需要连接设备)
npm run dev:app
```

## API 设计

### 认证相关

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/auth/send-sms` | POST | 发送短信验证码 |
| `/api/v1/auth/verify-sms` | POST | 验证短信登录 |
| `/api/v1/auth/wechat` | POST | 微信登录 |
| `/api/v1/auth/logout` | POST | 登出 |

### 业务相关

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/schools` | GET | 获取学校列表 |
| `/api/v1/programs` | GET | 获取项目列表 |
| `/api/v1/programs/:id` | GET | 获取项目详情 |
| `/api/v1/user/favorites` | GET/POST | 用户收藏 |
| `/api/v1/user/profile` | GET/PUT | 用户资料 |

## 近期完成：院校与专业媒体接入

本轮完成了 Supabase Storage 中学校媒体资源到 APP 前端的接入。

### 数据来源

| 类型 | Supabase 位置 | 前端用途 |
|------|---------------|----------|
| 学校 logo / 校徽 | `schools.logo_url` | 院校列表、院校详情、专业详情学校头像 |
| 学校图片组 | `schools.campus_image_urls` | 院校详情大图、专业列表封面、专业详情顶部轮播 |
| 专业封面兜底 | `programs.cover_image_url` 或学校 `campus_image_urls[0]` | 专业列表卡片、专业详情首屏图片 |

Storage bucket 使用 `school-media`，对象路径约定为：

```text
school-media/schools/{school_id}/...
```

### API 行为

`/api/v1/programs` 和 `/api/v1/programs/:id` 会返回学校媒体字段，并在专业自身 `cover_image_url` 为空时自动使用学校图片作为封面：

```json
{
  "cover_image_url": "https://.../school-media/schools/{school_id}/campus-1.jpg",
  "cover_image_urls": ["https://.../campus-1.jpg", "https://.../campus-2.jpg"]
}
```

### APP 呈现

- 院校列表和详情继续使用 `logo_url` 展示学校 logo，并增加图片加载失败占位。
- 专业列表卡片展示专业封面图。
- 专业详情顶部展示学校图片轮播，优先使用 `cover_image_urls`。

## 青花瓷主题

项目采用中国传统青花瓷作为设计主题：

| 颜色 | 色值 | 用途 |
|------|------|------|
| **深蓝** | `#16315C` | 主色调、导航栏 |
| **中蓝** | `#345C8C` | 按钮、链接 |
| **亮蓝** | `#2279A2` | 高亮、悬停 |
| **瓷白** | `#F7F4EF` | 背景色 |
| **墨黑** | `#2B2B2D` | 文字颜色 |

详见 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## 开发路线图

- [x] 青花瓷主题设计系统
- [x] Web Dashboard 管理后台
- [x] 数据库设计 (v2 - 去掉飞书 key)
- [x] 用户认证系统设计
- [ ] 飞书数据导入
- [ ] Web API 路由实现
- [ ] APP API 服务层
- [ ] APP 登录页面
- [ ] APP 首页和作品列表
- [ ] 收藏功能

## 重要文档

| 文档 | 说明 |
|------|------|
| [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | 青花瓷主题设计规范 |
| [DATABASE_SCHEMA_V2.md](./docs/DATABASE_SCHEMA_V2.md) | 数据库结构设计 |
| [AUTH_SYSTEM.md](./docs/AUTH_SYSTEM.md) | 用户认证系统详细文档 |
| [APP_DEVELOPMENT.md](./docs/APP_DEVELOPMENT.md) | APP 开发环境搭建指南（含模拟器安装） |
| [PRD.md](./docs/PRD.md) | 产品需求文档（基于 PDF 分析） |
| [AGENTS.md](./docs/AGENTS.md) | AI 助手开发指南 |

## 许可证

MIT

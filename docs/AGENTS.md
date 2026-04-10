# Artsee - 开发者指南

## 项目架构核心理解

### 🎯 最重要的原则

**APP 是核心业务端，Web 是后端服务。**

- **不要**让 APP 直接访问数据库
- **必须**通过 Web API 进行所有数据交互
- Web 既是网站，也是统一的 BFF (Backend for Frontend) 层

### 架构关系图

```
用户 -> APP (Flutter) -> Web API (Next.js) -> Database (Supabase)
          │                      │
          │                      └-> 飞书多维表格 (外部数据源)
          │
          └-> 核心业务：浏览、收藏、搜索艺术品
```

## 代码组织规范

### APP 端 (`/app`)

```
lib/
├── main.dart              # 入口，青花瓷主题配置
├── config/
│   └── theme.dart         # 主题配置 (已存在)
├── models/                # 数据模型
│   ├── artwork.dart
│   ├── artist.dart
│   └── user.dart
├── services/              # API 服务层 ⭐ 关键
│   ├── api_client.dart    # HTTP 客户端
│   ├── artwork_service.dart
│   └── auth_service.dart
├── screens/               # 页面
│   ├── home_screen.dart
│   ├── artwork_detail_screen.dart
│   └── profile_screen.dart
├── widgets/               # 公共组件
│   ├── artwork_card.dart
│   └── loading_spinner.dart
└── providers/             # 状态管理
    ├── artwork_provider.dart
    └── user_provider.dart
```

### Web 端 (`/web`)

```
app/
├── page.tsx               # 网站首页
├── dashboard/             # 管理后台
│   └── page.tsx
├── api/                   # API 路由 ⭐ 关键
│   └── v1/
│       ├── artworks/
│       │   └── route.ts
│       ├── artists/
│       │   └── route.ts
│       └── auth/
│           └── route.ts
├── layout.tsx             # 根布局
└── globals.css            # 青花瓷主题

lib/
├── supabase/              # 数据库客户端
│   ├── client.ts
│   └── server.ts
└── utils.ts               # 工具函数
```

## 青花瓷主题色值

```css
/* 主色调 */
--porcelain-blue-dark: #16315C     /* 导航栏、主按钮 */
--porcelain-blue: #345C8C          /* 次要强调 */
--porcelain-blue-light: #2279A2    /* 高亮 */
--porcelain-blue-pale: #9FB7CC     /* 装饰 */

/* 背景色 */
--porcelain-white: #F7F4EF         /* 主背景 */
--porcelain-white-ivory: #EEEEEA   /* 卡片背景 */
--porcelain-white-cream: #E2DCCB   /* 边框 */

/* 文字色 */
--ink-black: #2B2B2D               /* 主文字 */
--ink-gray: #4A4A4C                /* 次要文字 */
```

## API 开发规范

### 路由结构

```typescript
// app/api/v1/artworks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/v1/artworks
export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .limit(20)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}

// POST /api/v1/artworks
export async function POST(request: NextRequest) {
  const body = await request.json()
  // ... 处理逻辑
}
```

### APP 端调用示例

```dart
// lib/services/artwork_service.dart
class ArtworkService {
  static const String baseUrl = 'https://api.artsee.com/api/v1';
  
  Future<List<Artwork>> getArtworks() async {
    final response = await http.get(Uri.parse('$baseUrl/artworks'));
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['data'] as List)
        .map((json) => Artwork.fromJson(json))
        .toList();
    }
    
    throw Exception('Failed to load artworks');
  }
}
```

## 状态管理建议

### APP 端使用 Riverpod

```dart
// lib/providers/artwork_provider.dart
@riverpod
class ArtworkList extends _$ArtworkList {
  @override
  Future<List<Artwork>> build() async {
    return ArtworkService().getArtworks();
  }
  
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => ArtworkService().getArtworks());
  }
}
```

## 数据库表结构 (参考)

```sql
-- 作品表
artworks (
  id: uuid
  title: text
  description: text
  image_url: text
  artist_id: uuid -> artists.id
  category: text
  created_at: timestamp
)

-- 艺术家表
artists (
  id: uuid
  name: text
  bio: text
  avatar_url: text
  created_at: timestamp
)

-- 用户收藏表
user_favorites (
  id: uuid
  user_id: uuid -> auth.users.id
  artwork_id: uuid -> artworks.id
  created_at: timestamp
)
```

## 开发者模式与测试账号（Flutter 登录页）

用于在**调试构建**或 **`--dart-define=DEV_LOGIN=true`** 下，从登录/注册页一键登录，无需手输邮箱密码。

### 测试账号（与 `app/lib/config/dev_test_account.dart` 一致）

| 字段 | 值 |
|------|-----|
| 邮箱 | `dev.test@artsee.app` |
| 密码 | `ArtseeDev2026!` |
| 昵称 | `Artsee开发者` |

**在 Supabase 中创建/同步该用户**（需 Service Role，仅本地或 CI 使用）：

```bash
# 项目根目录，已配置 .env 中的 SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY
npm run ensure:dev-user
```

脚本会：若 Auth 中不存在该邮箱则 `createUser`（已确认邮箱）；并 `upsert` `user_profiles`（含 `has_completed_onboarding: true` 与示例 `interested_categories`）。

**APP 侧开关**：Debug 包默认显示「开发者快速登录」；Release 需编译时加上 `DEV_LOGIN=true` 才会显示（勿向最终用户分发此类包）。

## 注意事项

1. **永远不要**在 APP 端暴露 Supabase 的 service_role_key
2. **所有敏感操作**必须在 Web 后端完成
3. **API 返回格式**统一使用 `{ data: ..., error: ... }` 或 `{ data: ..., message: ... }`
4. **错误处理**要友好，APP 端要有重试机制
5. **图片资源**使用 CDN，不要直接存数据库

## 开发优先级

1. ✅ Web Dashboard 管理后台
2. 🔄 Web API 路由 (`/api/v1/*`)
3. ⏳ APP API 服务层
4. ⏳ APP 首页和作品列表
5. ⏳ 用户认证流程
6. ⏳ 收藏功能

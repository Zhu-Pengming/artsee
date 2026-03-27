# Artsee 用户认证系统

## 概述

基于 Supabase Auth 构建的统一认证系统，支持手机号和微信登录，同时适用于 Web 和 APP。

```
┌─────────────────────────────────────────────────────────────┐
│                    认证架构                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   用户登录方式                                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│   │   手机号    │  │   邮箱      │  │   微信登录      │    │
│   │  + 验证码   │  │  + 密码     │  │   (OpenID)      │    │
│   └──────┬──────┘  └──────┬──────┘  └────────┬────────┘    │
│          │                │                    │             │
│          └────────────────┴────────────────────┘             │
│                          │                                  │
│                          ▼                                  │
│               ┌─────────────────────┐                       │
│               │   Supabase Auth     │                       │
│               │   (auth.users)      │                       │
│               └──────────┬──────────┘                       │
│                          │                                  │
│                          ▼                                  │
│               ┌─────────────────────┐                       │
│               │   user_profiles     │                       │
│               │   (扩展资料表)       │                       │
│               └─────────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 数据库表结构

### 1. 核心表关系

| 表名 | 说明 | 来源 |
|------|------|------|
| `auth.users` | Supabase 内置用户表 | Supabase |
| `user_profiles` | 用户资料扩展 | 自定义 |
| `auth_provider_links` | 第三方登录关联 | 自定义 |
| `sms_verifications` | 短信验证码 | 自定义 |

### 2. user_profiles 表

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    
    -- 基本信息
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    country_code VARCHAR(10) DEFAULT '+86',
    
    -- 微信登录信息
    wechat_open_id VARCHAR(100) UNIQUE,
    wechat_union_id VARCHAR(100),
    wechat_nickname VARCHAR(100),
    wechat_avatar_url TEXT,
    
    -- 用户类型和偏好
    user_type VARCHAR(20) DEFAULT 'student',
    language VARCHAR(10) DEFAULT 'zh-CN',
    theme VARCHAR(20) DEFAULT 'light',
    
    -- 统计数据
    following_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    artworks_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    
    -- 状态
    is_verified BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    
    -- 时间戳
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. auth_provider_links 表

```sql
CREATE TABLE auth_provider_links (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    provider VARCHAR(50) NOT NULL, -- wechat, phone, email
    provider_user_id VARCHAR(100) NOT NULL,
    provider_data JSONB,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 登录方式详解

### 1. 手机号 + 验证码登录

#### 流程
```
1. 用户输入手机号
2. 后端发送验证码到手机
3. 用户输入验证码
4. 验证成功，登录/注册
```

#### API
```typescript
// 发送验证码
POST /api/v1/auth/send-sms
{
    "phone": "13800138000",
    "country_code": "+86",
    "purpose": "login" // login, register, reset_password
}

// 验证码登录
POST /api/v1/auth/verify-sms
{
    "phone": "13800138000",
    "country_code": "+86",
    "code": "123456"
}
```

### 2. 微信登录

#### 流程
```
1. APP/小程序调用微信 SDK 获取 code
2. 后端用 code 换取 openid 和 access_token
3. 查询或创建用户
4. 返回 JWT token
```

#### API
```typescript
// 微信登录
POST /api/v1/auth/wechat
{
    "code": "wx_auth_code",
    "platform": "app" // app, mini_program, web
}
```

#### 微信登录表设计
```sql
-- 存储微信登录信息
INSERT INTO auth_provider_links (
    user_id,
    provider,
    provider_user_id,
    provider_data
) VALUES (
    'uuid',
    'wechat',
    'wechat_openid',
    '{"unionid": "xxx", "nickname": "xxx"}'::jsonb
);

-- 同时更新 user_profiles
UPDATE user_profiles SET
    wechat_open_id = 'openid',
    wechat_union_id = 'unionid',
    wechat_nickname = 'nickname',
    wechat_avatar_url = 'avatar'
WHERE id = 'user_uuid';
```

### 3. 邮箱 + 密码登录

使用 Supabase Auth 原生支持：

```typescript
// 注册
const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'password123'
});

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password123'
});
```

## Web 端实现

### 1. 安装依赖

```bash
cd web && npm install @supabase/supabase-js
```

### 2. 配置 Supabase Client

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 3. 登录组件

```typescript
// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function LoginForm() {
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);

    // 发送验证码
    const sendCode = async () => {
        const res = await fetch('/api/v1/auth/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, country_code: '+86', purpose: 'login' })
        });
        
        if (res.ok) {
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown(c => {
                    if (c <= 1) clearInterval(timer);
                    return c - 1;
                });
            }, 1000);
        }
    };

    // 验证码登录
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const res = await fetch('/api/v1/auth/verify-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, country_code: '+86', code })
        });
        
        const data = await res.json();
        
        if (data.session) {
            // 设置 Supabase session
            await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            });
            
            // 跳转到首页
            window.location.href = '/dashboard';
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="手机号"
            />
            <div>
                <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="验证码"
                />
                <button
                    type="button"
                    onClick={sendCode}
                    disabled={countdown > 0}
                >
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
            </div>
            <button type="submit">登录</button>
        </form>
    );
}
```

### 4. API 路由

```typescript
// app/api/v1/auth/send-sms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    const { phone, country_code, purpose } = await req.json();
    
    // 生成验证码
    const code = Math.random().toString().slice(2, 8);
    
    // 保存到数据库
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { error } = await supabase.from('sms_verifications').insert({
        phone,
        country_code,
        verification_code: code,
        purpose,
        expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5分钟过期
    });
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // TODO: 调用短信服务商发送短信
    console.log(`验证码: ${code}`);
    
    return NextResponse.json({ success: true });
}

// app/api/v1/auth/verify-sms/route.ts
export async function POST(req: NextRequest) {
    const { phone, country_code, code } = await req.json();
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // 验证验证码
    const { data: verification } = await supabase
        .from('sms_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('country_code', country_code)
        .eq('verification_code', code)
        .gt('expires_at', new Date().toISOString())
        .eq('verified', false)
        .single();
    
    if (!verification) {
        return NextResponse.json(
            { error: '验证码无效或已过期' },
            { status: 400 }
        );
    }
    
    // 标记验证码已使用
    await supabase
        .from('sms_verifications')
        .update({ verified: true })
        .eq('id', verification.id);
    
    // 查找或创建用户
    const fullPhone = `${country_code}${phone}`;
    
    // 检查是否已有该手机号的用户
    const { data: existingLink } = await supabase
        .from('auth_provider_links')
        .select('user_id')
        .eq('provider', 'phone')
        .eq('provider_user_id', fullPhone)
        .single();
    
    let userId: string;
    
    if (existingLink) {
        userId = existingLink.user_id;
    } else {
        // 创建新用户
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            phone: fullPhone,
            phone_confirm: true,
            user_metadata: {
                phone,
                country_code
            }
        });
        
        if (createError) {
            return NextResponse.json(
                { error: createError.message },
                { status: 500 }
            );
        }
        
        userId = newUser.user!.id;
        
        // 创建 provider link
        await supabase.from('auth_provider_links').insert({
            user_id: userId,
            provider: 'phone',
            provider_user_id: fullPhone,
            is_primary: true
        });
        
        // 创建 user_profile
        await supabase.from('user_profiles').insert({
            id: userId,
            phone,
            country_code
        });
    }
    
    // 创建 session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createUser({
        user_id: userId
    });
    
    // 使用 service role 创建 session
    const { data: { session }, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${userId}@artsee.internal`
    });
    
    // 实际应该使用自定义 JWT 或 Supabase 的 admin API
    // 这里简化处理，实际项目中需要更严谨的实现
    
    return NextResponse.json({
        success: true,
        user: { id: userId, phone }
    });
}
```

## APP 端实现 (Flutter)

### 1. 添加依赖

```yaml
# pubspec.yaml
dependencies:
  supabase_flutter: ^2.0.0
  wechat_kit: ^4.0.0  # 微信登录
```

### 2. 初始化 Supabase

```dart
// lib/main.dart
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://nufrgmlhlfmhxsqbybfd.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZnJnbWxobGZtaHhzcWJ5YmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzA2NDUsImV4cCI6MjA4OTUwNjY0NX0.E90FL3mrUSa18YHMhjyncZQx-yKqCpDTgC18F_ww5to',
  );
  
  runApp(MyApp());
}
```

### 3. 认证服务

```dart
// lib/services/auth_service.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final SupabaseClient _client = Supabase.instance.client;
  
  // 获取当前用户
  User? get currentUser => _client.auth.currentUser;
  
  // 监听登录状态
  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;
  
  // 手机号登录 - 发送验证码
  Future<void> sendSmsCode(String phone) async {
    final response = await _client.functions.invoke(
      'send-sms',
      body: {
        'phone': phone,
        'country_code': '+86',
        'purpose': 'login',
      },
    );
    
    if (response.status != 200) {
      throw Exception('发送验证码失败');
    }
  }
  
  // 手机号登录 - 验证验证码
  Future<AuthResponse> verifySmsCode(String phone, String code) async {
    // 调用后端 API 验证
    final response = await _client.functions.invoke(
      'verify-sms',
      body: {
        'phone': phone,
        'country_code': '+86',
        'code': code,
      },
    );
    
    // 返回的 session 需要设置到 Supabase
    final data = response.data as Map<String, dynamic>;
    
    if (data['session'] != null) {
      await _client.auth.setSession(
        data['session']['access_token'],
      );
    }
    
    return _client.auth.currentSession as AuthResponse;
  }
  
  // 微信登录
  Future<void> signInWithWeChat() async {
    // 调用微信 SDK 获取 code
    // final result = await WechatKit.instance.auth(
    //   scope: 'snsapi_userinfo',
    //   state: 'artsee_auth',
    // );
    
    // 发送 code 到后端
    final response = await _client.functions.invoke(
      'wechat-auth',
      body: {
        'code': 'wechat_auth_code',
        'platform': 'app',
      },
    );
    
    final data = response.data as Map<String, dynamic>;
    
    if (data['session'] != null) {
      await _client.auth.setSession(
        data['session']['access_token'],
      );
    }
  }
  
  // 获取用户资料
  Future<Map<String, dynamic>?> getUserProfile() async {
    final user = currentUser;
    if (user == null) return null;
    
    final response = await _client
        .from('user_profiles')
        .select()
        .eq('id', user.id)
        .single();
    
    return response;
  }
  
  // 更新用户资料
  Future<void> updateProfile(Map<String, dynamic> data) async {
    final user = currentUser;
    if (user == null) throw Exception('未登录');
    
    await _client
        .from('user_profiles')
        .update(data)
        .eq('id', user.id);
  }
  
  // 登出
  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}
```

### 4. 登录页面

```dart
// lib/screens/login_screen.dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../config/theme.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  final _authService = AuthService();
  
  bool _isLoading = false;
  int _countdown = 0;
  
  Future<void> _sendCode() async {
    setState(() => _isLoading = true);
    
    try {
      await _authService.sendSmsCode(_phoneController.text);
      setState(() => _countdown = 60);
      
      // 开始倒计时
      Future.doWhile(() async {
        await Future.delayed(Duration(seconds: 1));
        setState(() => _countdown--);
        return _countdown > 0;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('发送失败: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _login() async {
    setState(() => _isLoading = true);
    
    try {
      await _authService.verifySmsCode(
        _phoneController.text,
        _codeController.text,
      );
      
      // 登录成功，跳转到首页
      Navigator.of(context).pushReplacementNamed('/home');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('登录失败: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PorcelainColors.porcelainWhite,
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    PorcelainColors.porcelainBlueDark,
                    PorcelainColors.porcelainBlue,
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(Icons.palette, color: Colors.white, size: 40),
            ),
            SizedBox(height: 32),
            
            Text(
              '欢迎登录 Artsee',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: PorcelainColors.inkBlack,
              ),
            ),
            SizedBox(height: 32),
            
            // 手机号输入
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                hintText: '手机号',
                prefixIcon: Icon(Icons.phone),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            SizedBox(height: 16),
            
            // 验证码输入
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _codeController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      hintText: '验证码',
                      prefixIcon: Icon(Icons.lock_outline),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _countdown > 0 ? null : _sendCode,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: PorcelainColors.porcelainBlueDark,
                    foregroundColor: Colors.white,
                    padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(_countdown > 0 ? '$_countdown s' : '获取验证码'),
                ),
              ],
            ),
            SizedBox(height: 24),
            
            // 登录按钮
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _login,
                style: ElevatedButton.styleFrom(
                  backgroundColor: PorcelainColors.porcelainBlueDark,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text('登录', style: TextStyle(fontSize: 16)),
              ),
            ),
            SizedBox(height: 24),
            
            // 微信登录
            OutlinedButton.icon(
              onPressed: () {},
              icon: Icon(Icons.wechat, color: Colors.green),
              label: Text('微信登录'),
              style: OutlinedButton.styleFrom(
                foregroundColor: PorcelainColors.inkBlack,
                side: BorderSide(color: PorcelainColors.porcelainBlueDark),
                padding: EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 安全配置

### 1. Supabase Auth 设置

在 Supabase Dashboard -> Authentication -> Providers 中：

- **Email**: 启用，可关闭确认邮件（如果只用手机号）
- **Phone**: 禁用（使用自定义 SMS 实现）

### 2. 环境变量

```bash
# Web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://nufrgmlhlfmhxsqbybfd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 微信配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_MINI_APP_ID=your_mini_app_id

# SMS 服务商
SMS_PROVIDER=aliyun  # 或 tencent
SMS_ACCESS_KEY_ID=your_key
SMS_ACCESS_KEY_SECRET=your_secret
SMS_SIGN_NAME=Artsee
SMS_TEMPLATE_CODE=SMS_123456
```

### 3. Row Level Security

```sql
-- 用户只能查看和修改自己的资料
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);
```

## API 端点汇总

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/auth/send-sms` | POST | 发送短信验证码 |
| `/api/v1/auth/verify-sms` | POST | 验证短信验证码并登录 |
| `/api/v1/auth/wechat` | POST | 微信登录 |
| `/api/v1/auth/logout` | POST | 登出 |
| `/api/v1/auth/refresh` | POST | 刷新 token |
| `/api/v1/user/profile` | GET | 获取用户资料 |
| `/api/v1/user/profile` | PUT | 更新用户资料 |
| `/api/v1/user/favorites` | GET | 获取用户收藏 |
| `/api/v1/user/favorites` | POST | 添加收藏 |

## 测试步骤

1. **创建表**: 执行 `init_data/create_database_v2.sql`
2. **配置 Supabase Auth**: 在 Dashboard 中启用相关提供商
3. **测试短信**: 使用测试手机号发送验证码
4. **测试微信**: 配置微信开放平台，获取 AppID 和 Secret
5. **测试登录**: Web 和 APP 分别测试登录流程

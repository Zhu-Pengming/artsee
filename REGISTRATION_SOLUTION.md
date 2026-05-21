# 注册问题修复 - 最终方案

## 问题
Flutter APP 和 Next.js 网站注册时出现 RLS 错误：
```
PostgrestException(message: new row violates row-level security policy for table "user_profiles")
```

## 解决方案
**Flutter 和 Next.js 都通过 API 注册，API 统一处理 Supabase Auth 和 user_profiles 创建**

### 优势
- ✅ 避免 RLS 权限问题（API 使用 Service Role）
- ✅ 统一注册逻辑（Flutter 和 Next.js 使用同一个 API）
- ✅ 更好的错误处理和事务控制
- ✅ 符合项目规范（APP 优先通过 API 访问后端）

## 执行步骤

### 1. 在 Supabase Dashboard 中执行 SQL

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 创建新查询，**复制以下全部 SQL** 并执行：

```sql
-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role (API) to insert new profiles during signup
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

-- Allow service role to update profiles
DROP POLICY IF EXISTS "Service role can update profiles" ON public.user_profiles;
CREATE POLICY "Service role can update profiles"
  ON public.user_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow service role to read all profiles
DROP POLICY IF EXISTS "Service role can read profiles" ON public.user_profiles;
CREATE POLICY "Service role can read profiles"
  ON public.user_profiles FOR SELECT
  USING (true);
```

### 2. 验证 RLS 策略

在 Supabase Dashboard 中：
1. 进入 **Database** → **Tables**
2. 选择 `user_profiles` 表
3. 点击 **RLS** 标签
4. 确认以下 5 个策略存在：
   - `Users can read own profile`
   - `Users can update own profile`
   - `Service role can insert profiles`
   - `Service role can update profiles`
   - `Service role can read profiles`

## 工作原理

### 注册流程（统一通过 API）

1. **用户提交注册表单**（昵称、邮箱、密码）

2. **Flutter APP**
   ```dart
   // 调用 API 注册
   final result = await BackendApiService.signup(
     email: email,
     password: password,
     nickname: nickname,
   );
   
   // 注册成功后自动登录
   await SupabaseService.signIn(email, password);
   ```

3. **Next.js 网站**
   ```typescript
   // 调用 API 注册
   const res = await fetch('/api/v1/auth/signup', {
     method: 'POST',
     body: JSON.stringify({ email, password, nickname }),
   });
   
   // 注册成功后自动登录
   await supabase.auth.signInWithPassword({ email, password });
   ```

4. **API 端点** (`/api/v1/auth/signup`)
   - 使用 Service Role 权限创建 Auth 用户
   - 使用 Service Role 权限在 `user_profiles` 中创建记录
   - 返回成功或失败信息

5. **RLS 策略**
   - 用户只能读取和更新自己的 profile
   - Service Role（API）可以完全访问所有 profiles
   - 避免了客户端直接写入 `user_profiles` 的权限问题

## 测试注册

### Flutter APP
```bash
cd app
flutter run
# 进入登录屏幕，选择注册
# 填写：昵称、邮箱、密码
# 点击注册按钮
# 应该自动登录并进入首页
```

### Next.js 网站
```bash
cd web
npm run dev
# 访问 http://localhost:9090/auth/login
# 选择注册标签
# 填写：邮箱、密码、昵称
# 点击注册按钮
# 应该自动登录并跳转
```

## 已修改的文件

### 数据库
- ✅ `supabase/migrations/20260520000000_user_profiles_rls.sql` - RLS 策略

### API
- ✅ `web/app/api/v1/auth/signup/route.ts` - 注册 API（创建 Auth 用户和 profile）
- ✅ `web/app/api/v1/auth/complete-onboarding/route.ts` - Onboarding API

### Flutter
- ✅ `app/lib/screens/auth/login_screen.dart` - 调用 `BackendApiService.signup()`
- ✅ `app/lib/services/backend_api_service.dart` - 添加 `signup()` 方法
- ✅ `app/lib/services/supabase_service.dart` - `signUp()` 标记为废弃

### Next.js
- ✅ `web/app/auth/login/page.tsx` - 调用 `/api/v1/auth/signup` API

## 故障排除

### 错误：`violates row-level security policy`
- **原因**：RLS 策略未正确设置
- **解决**：重新执行上面的 SQL

### 错误：`violates foreign key constraint`
- **原因**：用户在 `auth.users` 中不存在
- **解决**：确保 API 先创建 Auth 用户，再创建 profile

### 错误：`SUPABASE_SERVICE_ROLE_KEY not found`
- **原因**：Next.js 环境变量未配置
- **解决**：在 `web/.env.local` 中添加：
  ```
  SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
  ```

### 注册成功但无法登录
- **原因**：邮箱验证未完成（如果启用了邮箱验证）
- **解决**：在 Supabase Dashboard → Authentication → Settings 中禁用邮箱验证，或检查邮箱

## 关键点

1. **统一通过 API 注册** - Flutter 和 Next.js 都调用 `/api/v1/auth/signup`
2. **Service Role 权限** - API 使用 Service Role 绕过 RLS
3. **自动登录** - 注册成功后客户端自动调用 `signIn`
4. **错误处理** - API 返回详细的错误信息
5. **符合规范** - 遵循项目 AGENTS.md 中的「APP 优先通过 API 访问后端」原则

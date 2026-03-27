# 管理员账号与开发模式配置

## 更新内容

### 1. 数据库变更

#### user_profiles 表新增 role 字段
```sql
ALTER TABLE user_profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('user', 'admin', 'moderator'));
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
```

#### 角色说明
| 角色 | 权限 |
|------|------|
| `user` | 普通用户，可浏览、收藏、评论 |
| `admin` | 管理员，可管理内容、用户 |
| `moderator` | 版主，可审核内容 |

### 2. 管理员账号

#### 账号信息
| 项目 | 值 |
|------|-----|
| 手机号 | `13800000000` |
| 验证码 | `123456`（开发模式固定） |
| 角色 | `admin` |
| 昵称 | 管理员 |

#### 设置管理员步骤

1. **使用 APP 注册管理员账号**
   - 打开 APP，进入登录页
   - 输入手机号：`13800000000`
   - 点击"获取验证码"
   - 输入验证码：`123456`
   - 点击"登录"

2. **数据库设置为管理员**
   ```bash
   node init_data/create_admin.js
   ```
   或在 Supabase SQL Editor 中执行：
   ```sql
   UPDATE user_profiles 
   SET role = 'admin', nickname = '管理员' 
   WHERE phone = '13800000000';
   ```

### 3. 开发模式配置

#### 验证码固定为 123456

**Web 后端** (`web/app/api/v1/auth/send-sms/route.ts`):
```typescript
const isDev = process.env.NODE_ENV === "development";
const code = isDev ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
```

**APP 端** (`app/lib/services/auth_service.dart`):
```dart
// 开发模式：验证码固定为 123456
if (code != '123456') {
  return {'success': false, 'error': '验证码错误'};
}
```

#### 登录 API 返回 role

API 响应包含用户角色：
```json
{
  "success": true,
  "user": {
    "id": "...",
    "phone": "13800000000",
    "role": "admin",
    "profile": { ... }
  }
}
```

### 4. Flutter APP 权限判断

```dart
// 获取用户角色
final role = await AuthService().getUserRole();

// 检查是否是管理员
final isAdmin = await AuthService().isAdmin();

// 根据角色显示不同内容
if (isAdmin) {
  // 显示管理员功能
}
```

## 测试步骤

### 1. 普通用户测试
1. 输入手机号：`13912345678`
2. 获取验证码（固定为 `123456`）
3. 登录后检查 role 是否为 `user`

### 2. 管理员测试
1. 输入手机号：`13800000000`
2. 获取验证码：`123456`
3. 登录后检查 role 是否为 `admin`
4. 验证管理员功能是否正常

## 生产环境注意事项

⚠️ **部署到生产环境前必须修改：**

1. 移除开发模式固定验证码逻辑
2. 使用真实的短信服务商（阿里云、腾讯云等）
3. 管理员账号通过安全方式创建
4. 设置强密码和二次验证

## 文件修改清单

| 文件 | 修改内容 |
|------|----------|
| `init_data/create_database_v2.sql` | 添加 role 字段定义 |
| `web/app/api/v1/auth/send-sms/route.ts` | 开发模式验证码固定 123456 |
| `web/app/api/v1/auth/verify-sms/route.ts` | 返回用户 role 信息 |
| `app/lib/services/auth_service.dart` | 添加角色相关方法 |
| `init_data/create_admin.js` | 管理员账号设置脚本 |

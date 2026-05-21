# 禁用邮箱验证 - 开发环境配置

## 问题
注册成功但无法登录，提示 "Email not confirmed"

## 解决方案
在 Supabase Dashboard 中禁用邮箱验证（仅用于开发环境）

## 步骤

1. **打开 Supabase Dashboard**
   - 访问 https://app.supabase.com
   - 选择你的项目

2. **进入 Authentication 设置**
   - 左侧菜单：**Authentication** → **Providers**
   - 找到 **Email** 提供商

3. **禁用邮箱验证**
   - 找到 **"Confirm email"** 选项
   - **取消勾选** "Confirm email"
   - 点击 **Save** 保存

4. **（可选）删除已注册但未验证的用户**
   - 左侧菜单：**Authentication** → **Users**
   - 找到邮箱 `123456789@qq.com`
   - 点击右侧的 **...** → **Delete user**
   - 确认删除

5. **重新注册**
   - 在 Flutter APP 中重新注册
   - 这次应该可以直接登录

## 生产环境注意事项

在生产环境中，**应该启用邮箱验证**以确保安全性。可以通过以下方式处理：

### 方案 1：配置邮件服务
- 在 Supabase Dashboard → **Project Settings** → **Auth** 中配置 SMTP
- 用户注册后会收到验证邮件

### 方案 2：手动验证用户
- 在 Supabase Dashboard → **Authentication** → **Users** 中
- 找到用户，点击 **...** → **Confirm email**

### 方案 3：使用环境变量控制
- 开发环境：禁用邮箱验证
- 生产环境：启用邮箱验证

## 当前状态

✅ **注册功能已修复**
- API 成功创建 Auth 用户
- API 成功创建 `user_profiles` 记录
- RLS 策略正常工作

❌ **邮箱验证阻止登录**
- 需要在 Supabase Dashboard 中禁用
- 或配置邮件服务

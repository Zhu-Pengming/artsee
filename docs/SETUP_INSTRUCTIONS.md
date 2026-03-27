# 数据库设置步骤

## 问题
Supabase JS 客户端不支持直接执行 SQL 语句创建表，需要您在 Dashboard 中手动执行。

## 解决方案

### 步骤 1: 打开 Supabase Dashboard

访问: https://app.supabase.com/project/nufrgmlhlfmhxsqbybfd

### 步骤 2: 进入 SQL Editor

1. 在左侧导航栏点击 "SQL Editor"
2. 点击 "New query" 创建新查询

### 步骤 3: 执行 SQL

1. 打开文件 `init_data/setup_database.sql`
2. 复制全部内容
3. 粘贴到 SQL Editor
4. 点击 "Run" 执行

### 步骤 4: 验证

执行完成后，在左侧导航栏点击 "Table Editor"，应该能看到以下表：

- schools
- art_categories
- programs
- program_admissions
- program_fees
- program_evaluations
- program_art_categories
- user_profiles
- user_favorites
- user_follows
- sms_verifications
- auth_provider_links

### 备选方案: 使用 psql 命令行

如果您有 PostgreSQL 客户端，可以使用以下命令：

```bash
# 获取连接字符串
# 在 Supabase Dashboard -> Project Settings -> Database -> Connection string
# 复制 "URI" 格式的连接字符串

# 使用 psql 执行
psql "postgresql://postgres:[YOUR-PASSWORD]@db.nufrgmlhlfmhxsqbybfd.supabase.co:5432/postgres" -f init_data/setup_database.sql
```

### 备选方案: 使用 Node.js 脚本

```bash
# 安装依赖
npm install pg

# 运行创建脚本（需要输入密码）
node create_tables.js
```

## 需要帮助?

如果执行 SQL 时遇到错误，请检查：

1. **权限**: 确保使用 `postgres` 用户或有创建表权限的用户
2. **网络**: 确保您的 IP 在 Supabase 的允许列表中 (Database -> Network Restrictions)
3. **错误信息**: 如果看到 "relation already exists" 错误，说明表已存在，可以忽略

## 执行成功后

数据库表创建完成后，您可以：

1. 导入飞书数据:
   ```bash
   cd init_data
   python3 import_feishu_to_supabase.py
   ```

2. 启动 Web 服务:
   ```bash
   npm run dev:web
   ```

3. 启动 APP:
   ```bash
   cd app && flutter run
   ```

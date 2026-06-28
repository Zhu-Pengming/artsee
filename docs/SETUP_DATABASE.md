# 数据库设置指南

## 连接信息

环境变量已配置在 `web/.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nufrgmlhlfmhxsqbybfd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

⚠️ **安全提示**: `service_role` 拥有绕过 RLS 的权限，只能放在本地 `.env` 或部署平台环境变量中，不能提交到仓库。

## 创建表

### 方法一：通过 Supabase Dashboard (推荐)

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 `nufrgmlhlfmhxsqbybfd`
3. 进入 **SQL Editor**
4. 复制 `init_data/create_database.sql` 中的内容
5. 点击 **Run** 执行

### 方法二：通过 Supabase CLI

```bash
# 安装 CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref nufrgmlhlfmhxsqbybfd

# 执行 SQL
supabase db execute --file ./init_data/create_database.sql
```

## 表结构概览

### 1. schools (学校表)
- 存储艺术院校信息
- 主键: `id` (UUID)
- 业务键: `school_key` (VARCHAR)

### 2. art_categories (艺术分类表)
- 存储艺术专业分类
- 支持层级结构 (parent_category_key 自关联)
- 主键: `id` (UUID)
- 业务键: `category_key` (VARCHAR)

### 3. programs (项目表)
- 存储各学校的艺术项目
- 外键: `school_key` -> schools.school_key
- 主键: `id` (UUID)
- 业务键: `program_key` (VARCHAR)

### 4. program_admissions (项目录取信息表)
- 一对一关联 programs
- 外键: `program_key` -> programs.program_key

### 5. program_fees (项目费用表)
- 一对一关联 programs
- 外键: `program_key` -> programs.program_key

### 6. program_evaluations (项目评估表)
- 一对一关联 programs
- 外键: `program_key` -> programs.program_key

### 7. program_art_categories (项目分类关联表)
- 多对多关联 programs 和 art_categories
- 外键: `program_key`, `category_key`

## 关系图

```
schools (1) ───< (N) programs (1) ───< (1) program_admissions
                          │
                          ├──< (1) program_fees
                          │
                          ├──< (1) program_evaluations
                          │
                          └──< (N) program_art_categories >─── (N) art_categories
```

## 验证安装

执行以下 SQL 验证表是否创建成功：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看示例数据
SELECT * FROM schools LIMIT 3;
SELECT * FROM art_categories LIMIT 3;
SELECT * FROM programs LIMIT 3;

-- 测试关联查询
SELECT 
    p.program_name,
    s.name_zh as school_name,
    s.country
FROM programs p
JOIN schools s ON p.school_key = s.school_key
LIMIT 5;
```

## 数据导入

从飞书导入数据的步骤：

1. 运行飞书数据导出脚本
2. 转换数据格式
3. 批量插入数据库

详见 `init_data/README.md` (待创建)

## 常用查询示例

### 查询英国的所有学校
```sql
SELECT * FROM schools WHERE country = '英国';
```

### 查询某学校的所有项目
```sql
SELECT p.* FROM programs p
JOIN schools s ON p.school_key = s.school_key
WHERE s.name_zh = '中央圣马丁艺术与设计学院';
```

### 查询某分类的所有项目
```sql
SELECT p.* FROM programs p
JOIN program_art_categories pac ON p.program_key = pac.program_key
JOIN art_categories ac ON pac.category_key = ac.category_key
WHERE ac.name_zh = '平面设计';
```

### 查询项目完整信息
```sql
SELECT 
    p.program_name,
    s.name_zh as school_name,
    pa.ielts_overall,
    pf.international_tuition_fee,
    pe.application_difficulty_score
FROM programs p
JOIN schools s ON p.school_key = s.school_key
LEFT JOIN program_admissions pa ON p.program_key = pa.program_key
LEFT JOIN program_fees pf ON p.program_key = pf.program_key
LEFT JOIN program_evaluations pe ON p.program_key = pe.program_key
WHERE p.program_key = 'xxx';
```

## 注意事项

1. 所有表都有 `*_key` 字段用于与飞书数据同步
2. 使用 UUID 作为主键，与业务键分离
3. 关联查询时使用 `school_key`, `program_key`, `category_key` 等字段
4. JSON 字段用于存储数组类型数据（如 intake_months）

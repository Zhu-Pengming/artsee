# Artsee 数据库设计方案

## 架构概述

基于飞书多维表格的数据结构，设计关系型 PostgreSQL 数据库，支持艺术留学信息管理系统。

```
┌─────────────────────────────────────────────────────────────────────┐
│                        数据库表关系图                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐                                                   │
│   │   schools   │◄─────────────────────────────┐                    │
│   │   (学校表)   │                              │                    │
│   └──────┬──────┘                              │                    │
│          │ 1:N                                 │                    │
│          ▼                                     │                    │
│   ┌─────────────┐     ┌───────────────────┐   │                    │
│   │   programs  │◄────┤ program_art_categories│   │                    │
│   │   (项目表)   │     │   (项目分类关联表)    │   │                    │
│   └──────┬──────┘     └─────────┬─────────┘   │                    │
│          │                      │              │                    │
│     ┌────┴────┐                 │              │                    │
│     │         │                 ▼              │                    │
│     ▼         ▼          ┌─────────────┐      │                    │
│ ┌────────┐ ┌────────┐   │ art_categories│      │                    │
│ │program_│ │program_│   │   (艺术分类表) │      │                    │
│ │admissions│ │  fees  │   └─────────────┘      │                    │
│ │(录取信息)│ │(费用表) │                          │                    │
│ └────────┘ └────────┘                          │                    │
│                                                 │                    │
│ ┌─────────────┐                                │                    │
│ │program_eval-│                                │                    │
│ │  uations    │                                │                    │
│ │ (项目评估)   │                                │                    │
│ └─────────────┘                                │                    │
│                                                 │                    │
└─────────────────────────────────────────────────────────────────────┘
```

## 核心表结构

### 1. schools - 学校表

存储艺术院校的基础信息。

```sql
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_key VARCHAR(50) UNIQUE NOT NULL,      -- 飞书中的唯一标识
    name_zh VARCHAR(200) NOT NULL,                -- 中文名称
    name_en TEXT,                                 -- 英文名称
    country VARCHAR(100),                         -- 国家
    city VARCHAR(100),                            -- 城市
    school_type VARCHAR(50),                      -- 学校类型
    
    -- 排名信息
    qs_art_rank INTEGER,                          -- QS艺术排名
    qs_architecture_rank INTEGER,                 -- QS建筑排名
    qs_overall_rank INTEGER,                      -- QS综合排名
    school_tier VARCHAR(20),                      -- 学校档次
    
    -- 链接
    official_website VARCHAR(500),                -- 官网
    international_students_page VARCHAR(500),     -- 国际生页面
    logo_url TEXT,                                -- Logo图片
    campus_image_urls TEXT,                       -- 校园图片(JSON数组)
    
    -- 其他信息
    founded_year INTEGER,                         -- 建校年份
    description TEXT,                             -- 学校简介
    feature_tags TEXT,                            -- 特色标签(JSON)
    strength_disciplines TEXT,                    -- 优势学科
    notable_alumni TEXT,                          -- 知名校友
    entry_score_requirements TEXT,                -- 入学成绩要求
    annual_intake INTEGER,                        -- 年招生人数
    application_deadline DATE,                    -- 申请截止日期
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active',          -- active/inactive
    
    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_schools_country ON schools(country);
CREATE INDEX idx_schools_city ON schools(city);
CREATE INDEX idx_schools_qs_rank ON schools(qs_art_rank);
CREATE INDEX idx_schools_status ON schools(status);
```

### 2. art_categories - 艺术分类表

存储艺术专业分类，支持层级结构。

```sql
CREATE TABLE art_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_key VARCHAR(50) UNIQUE NOT NULL,     -- 飞书唯一标识
    name_zh VARCHAR(100) NOT NULL,                -- 中文名称
    name_en VARCHAR(100),                         -- 英文名称
    parent_category_key VARCHAR(50),              -- 父分类key(自关联)
    category_code VARCHAR(50),                    -- 分类代码
    level INTEGER DEFAULT 1,                      -- 层级(1=一级,2=二级...)
    
    -- 描述信息
    description TEXT,                             -- 分类描述
    summary TEXT,                                 -- 摘要
    
    -- 热度信息
    popularity_score DECIMAL(5,2),                -- 热度分数
    is_popular BOOLEAN DEFAULT false,             -- 是否热门
    
    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 自关联外键
    FOREIGN KEY (parent_category_key) REFERENCES art_categories(category_key)
);

-- 索引
CREATE INDEX idx_categories_parent ON art_categories(parent_category_key);
CREATE INDEX idx_categories_level ON art_categories(level);
CREATE INDEX idx_categories_popular ON art_categories(is_popular);
```

### 3. programs - 项目表

存储各学校的艺术项目/专业信息。

```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_key VARCHAR(50) UNIQUE NOT NULL,      -- 飞书唯一标识
    school_key VARCHAR(50) NOT NULL,              -- 所属学校
    
    -- 基本信息
    program_name VARCHAR(200) NOT NULL,           -- 项目名称
    degree_type VARCHAR(50),                      -- 学位类型(BA/MA等)
    degree_full_name VARCHAR(200),                -- 学位全称
    program_category VARCHAR(100),                -- 项目分类
    program_code VARCHAR(50),                     -- 项目代码
    ucas_code VARCHAR(50),                        -- UCAS代码
    
    -- 学习信息
    duration_text TEXT,                           -- 学制描述
    duration_months INTEGER,                      -- 学制月数
    study_mode TEXT,                              -- 学习模式(JSON)
    intake_months TEXT,                           -- 入学月份(JSON)
    
    -- 申请要求标记
    requires_portfolio BOOLEAN DEFAULT false,     -- 是否需要作品集
    requires_interview BOOLEAN DEFAULT false,     -- 是否需要面试
    requires_personal_statement BOOLEAN DEFAULT false, -- 是否需要个人陈述
    minimum_education TEXT,                       -- 最低学历要求
    
    -- 项目详情
    program_overview TEXT,                        -- 项目概览
    program_highlights TEXT,                      -- 项目亮点
    accreditation_info TEXT,                      -- 认证信息
    core_courses TEXT,                            -- 核心课程
    career_paths TEXT,                            -- 职业路径
    admission_summary TEXT,                       -- 录取摘要
    
    -- 媒体
    cover_image_url TEXT,                         -- 封面图
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active',          -- active/inactive/pending
    is_recommended BOOLEAN DEFAULT false,         -- 是否推荐
    
    -- 溯源
    source_file VARCHAR(200),                     -- 来源文件
    source_hash VARCHAR(64),                      -- 内容哈希
    
    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键
    FOREIGN KEY (school_key) REFERENCES schools(school_key)
);

-- 索引
CREATE INDEX idx_programs_school ON programs(school_key);
CREATE INDEX idx_programs_degree ON programs(degree_type);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_recommended ON programs(is_recommended);
CREATE INDEX idx_programs_name ON programs(program_name);
```

### 4. program_admissions - 项目录取信息表

存储项目的详细录取要求。

```sql
CREATE TABLE program_admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_key VARCHAR(50) NOT NULL,             -- 关联项目
    
    -- 作品集要求
    portfolio_requirements TEXT,                  -- 作品集要求
    portfolio_format TEXT,                        -- 格式要求(JSON)
    portfolio_deadline DATE,                      -- 作品集截止日期
    
    -- 语言要求
    ielts_overall DECIMAL(3,1),                   -- 雅思总分
    ielts_subscores TEXT,                         -- 雅思小分(JSON)
    toefl_ibt INTEGER,                            -- 托福iBT分数
    other_language_tests TEXT,                    -- 其他语言考试
    
    -- 申请要求
    interview_format TEXT,                        -- 面试形式(JSON)
    reference_count INTEGER,                      -- 推荐信数量
    academic_requirements TEXT,                   -- 学术要求
    
    -- 截止日期
    regular_deadline DATE,                        -- 常规截止日期
    priority_deadline DATE,                       -- 优先截止日期
    deadline_notes TEXT,                          -- 截止日期备注
    
    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键
    FOREIGN KEY (program_key) REFERENCES programs(program_key),
    UNIQUE(program_key)                           -- 一对一关系
);

-- 索引
CREATE INDEX idx_admissions_program ON program_admissions(program_key);
CREATE INDEX idx_admissions_deadline ON program_admissions(regular_deadline);
```

### 5. program_fees - 项目费用表

存储项目的学费信息。

```sql
CREATE TABLE program_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_key VARCHAR(50) NOT NULL,             -- 关联项目
    
    -- 费用信息
    international_tuition_fee DECIMAL(12,2),      -- 国际生学费
    domestic_tuition_fee DECIMAL(12,2),           -- 本地生学费
    currency_code VARCHAR(3) DEFAULT 'GBP',       -- 货币代码
    additional_fees_note TEXT,                    -- 额外费用说明
    
    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键
    FOREIGN KEY (program_key) REFERENCES programs(program_key),
    UNIQUE(program_key)                           -- 一对一关系
);

-- 索引
CREATE INDEX idx_fees_program ON program_fees(program_key);
```

### 6. program_evaluations - 项目评估表

存储项目的申请难度和竞争信息。

```sql
CREATE TABLE program_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_key VARCHAR(50) NOT NULL,             -- 关联项目
    
    -- 评估信息
    application_difficulty_score VARCHAR(20),     -- 申请难度评分
    competition_level VARCHAR(50),                -- 竞争程度
    acceptance_rate DECIMAL(5,2),                 -- 录取率
    
    -- 溯源
    data_source VARCHAR(100),                     -- 数据来源
    source_url TEXT,                              -- 来源链接
    evidence_note TEXT,                           -- 证据说明
    updated_by VARCHAR(100),                      -- 更新人
    
    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键
    FOREIGN KEY (program_key) REFERENCES programs(program_key),
    UNIQUE(program_key)                           -- 一对一关系
);

-- 索引
CREATE INDEX idx_evaluations_program ON program_evaluations(program_key);
CREATE INDEX idx_evaluations_difficulty ON program_evaluations(application_difficulty_score);
```

### 7. program_art_categories - 项目分类关联表

多对多关联表，连接项目和艺术分类。

```sql
CREATE TABLE program_art_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relation_key VARCHAR(50) UNIQUE NOT NULL,     -- 飞书关联标识
    program_key VARCHAR(50) NOT NULL,             -- 项目key
    category_key VARCHAR(50) NOT NULL,            -- 分类key
    
    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键
    FOREIGN KEY (program_key) REFERENCES programs(program_key) ON DELETE CASCADE,
    FOREIGN KEY (category_key) REFERENCES art_categories(category_key) ON DELETE CASCADE,
    
    -- 联合唯一
    UNIQUE(program_key, category_key)
);

-- 索引
CREATE INDEX idx_prog_cat_program ON program_art_categories(program_key);
CREATE INDEX idx_prog_cat_category ON program_art_categories(category_key);
```

## 数据类型映射

| 飞书类型 | PostgreSQL 类型 | 说明 |
|---------|----------------|------|
| 文本 (1) | VARCHAR/TEXT | 根据长度选择 |
| 数字 (2) | INTEGER/DECIMAL | 整数或浮点数 |
| 单选 (3) | VARCHAR | 选项值 |
| 多选 (4) | TEXT | JSON 数组存储 |
| 日期 (5) | DATE | 日期 |
| 复选框 (7) | BOOLEAN | true/false |
| 超链接 (15) | VARCHAR(500) | URL |

## 关键设计决策

### 1. 保留飞书 Key
- 所有表保留 `*_key` 字段用于与飞书数据同步
- 使用 UUID 作为主键，与飞书的 key 分离

### 2. 层级分类
- `art_categories` 使用自关联实现树形结构
- `parent_category_key` 指向父分类

### 3. 一对一关系
- `programs` 与 `program_admissions/fees/evaluations` 是一对一
- 使用 `UNIQUE(program_key)` 约束确保唯一性

### 4. 多对多关系
- `programs` 与 `art_categories` 通过 `program_art_categories` 关联

### 5. JSON 字段
- 数组类型（如 intake_months, feature_tags）使用 JSON 存储
- 便于扩展和查询

## 初始化脚本

```sql
-- 创建更新触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表添加更新触发器
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_art_categories_updated_at BEFORE UPDATE ON art_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_admissions_updated_at BEFORE UPDATE ON program_admissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_fees_updated_at BEFORE UPDATE ON program_fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_evaluations_updated_at BEFORE UPDATE ON program_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## API 查询示例

### 查询学校及其所有项目
```sql
SELECT s.*, p.program_name, p.degree_type
FROM schools s
LEFT JOIN programs p ON s.school_key = p.school_key
WHERE s.country = '英国';
```

### 查询项目及其分类
```sql
SELECT p.*, ac.name_zh as category_name
FROM programs p
JOIN program_art_categories pac ON p.program_key = pac.program_key
JOIN art_categories ac ON pac.category_key = ac.category_key
WHERE ac.name_zh = '平面设计';
```

### 查询项目完整信息
```sql
SELECT 
    p.*,
    pa.ielts_overall,
    pa.portfolio_requirements,
    pf.international_tuition_fee,
    pe.application_difficulty_score
FROM programs p
LEFT JOIN program_admissions pa ON p.program_key = pa.program_key
LEFT JOIN program_fees pf ON p.program_key = pf.program_key
LEFT JOIN program_evaluations pe ON p.program_key = pe.program_key
WHERE p.program_key = 'xxx';
```

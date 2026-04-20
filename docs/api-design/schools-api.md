# 学院（Schools）查询接口设计

## 设计目标
- 支持多维度筛选、排序、分页
- 支持关键词搜索（名称、国家、城市、标签）
- 支持按艺术分类反向查询开设该分类的学院
- 详情页聚合学院基本信息 + 项目列表 + 录取统计
- 推荐/热门学院独立接口，便于首页展示

## 接口清单

| 序号 | 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|------|
| 1 | GET | `/api/v1/schools` | 学院列表（增强筛选/排序/分页） | 公开 |
| 2 | GET | `/api/v1/schools/search` | 关键词搜索学院 | 公开 |
| 3 | GET | `/api/v1/schools/recommended` | 推荐/热门学院 | 公开 |
| 4 | GET | `/api/v1/schools/:id` | 学院详情 | 公开 |
| 5 | GET | `/api/v1/schools/:id/programs` | 学院下的项目列表 | 公开 |
| 6 | GET | `/api/v1/schools/:id/stats` | 学院录取统计 | 公开 |
| 7 | GET | `/api/v1/schools/by-category` | 按艺术分类查学院 | 公开 |
| 8 | POST | `/api/v1/schools/compare` | 学院对比（批量查详情） | 公开 |

---

## 1. GET /api/v1/schools — 学院列表

### 查询参数
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `country` | string | 国家筛选，支持逗号多选，如 `英国,美国` | - |
| `school_type` | string | 学校类型，如 `university,college` | - |
| `school_tier` | string | 档次，如 `top,tier1` | - |
| `min_qs_art_rank` | int | QS 艺术排名最小值（如 1） | - |
| `max_qs_art_rank` | int | QS 艺术排名最大值（如 50） | - |
| `has_programs` | bool | 是否只返回有项目的学院 | `true` |
| `keyword` | string | 关键词（模糊匹配 name_zh / name_en / city） | - |
| `sort_by` | string | 排序字段：`qs_art_rank` / `qs_overall_rank` / `created_at` / `program_count` | `qs_art_rank` |
| `sort_order` | string | `asc` / `desc` | `asc` |
| `limit` | int | 每页条数 | `20` |
| `offset` | int | 偏移量 | `0` |

### 响应示例
```json
{
  "data": [
    {
      "id": 5,
      "name_zh": "中央圣马丁艺术与设计学院",
      "name_en": "Central Saint Martins",
      "country": "United Kingdom",
      "city": "London",
      "school_type": "college",
      "qs_art_rank": 2,
      "qs_overall_rank": null,
      "school_tier": "top",
      "logo_url": "https://.../logo.png",
      "cover_image_url": "https://.../cover.jpg",
      "program_count": 18,
      "founded_year": 1854,
      "feature_tags": ["时装设计", "纯艺", "平面设计"]
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 32,
    "has_more": true
  }
}
```

### 实现要点
- 使用 Supabase `rpc` 或原生 `.from('schools')` 查询。
- `program_count` 建议通过 `rpc` 调用一个 SQL 函数 `get_schools_with_program_count()` 做聚合，避免 N+1。
- 如果不用 RPC，可用子查询：`.select('*, programs:programs(count)')`，但注意 PostgREST 语法版本支持情况。

---

## 2. GET /api/v1/schools/search — 关键词搜索

### 查询参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `q` | string | 搜索关键词（必填） |
| `limit` | int | 默认 `10` |
| `offset` | int | 默认 `0` |

### 响应示例
同 `/api/v1/schools` 列表结构。

### 实现要点
- 使用 PostgreSQL `ilike` 或 `websearch_to_tsquery`（中文需额外配置）。
- 初级阶段推荐多字段 `or` + `ilike`：
  ```ts
  .or(`name_zh.ilike.%${q}%,name_en.ilike.%${q}%,city.ilike.%${q}%,feature_tags.cs.{${q}}`)
  ```
- 后续数据量大时，可迁移至 `pg_trgm` 或全文检索。

---

## 3. GET /api/v1/schools/recommended — 推荐/热门学院

### 查询参数
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `limit` | int | 返回条数 | `6` |
| `country` | string | 按国家过滤 | - |

### 响应示例
```json
{
  "data": [
    {
      "id": 5,
      "name_zh": "中央圣马丁艺术与设计学院",
      "name_en": "Central Saint Martins",
      "country": "United Kingdom",
      "logo_url": "https://...",
      "cover_image_url": "https://...",
      "qs_art_rank": 2,
      "program_count": 18,
      "highlight_programs": ["时装设计", "珠宝设计", "纯艺"]
    }
  ]
}
```

### 实现要点
- 推荐逻辑初级阶段可按 `is_recommended = true` + `qs_art_rank` 排序。
- `highlight_programs` 取该学院下项目数量最多的前 3 个 `art_categories.name_zh`。

---

## 4. GET /api/v1/schools/:id — 学院详情

### 响应示例
```json
{
  "id": 5,
  "name_zh": "中央圣马丁艺术与设计学院",
  "name_en": "Central Saint Martins",
  "country": "United Kingdom",
  "city": "London",
  "school_type": "college",
  "qs_art_rank": 2,
  "qs_architecture_rank": null,
  "qs_overall_rank": null,
  "school_tier": "top",
  "official_website": "https://www.arts.ac.uk/...",
  "logo_url": "https://...",
  "campus_image_urls": ["https://...", "https://..."],
  "founded_year": 1854,
  "description": "中央圣马丁是英国最著名的艺术与设计学院之一...",
  "feature_tags": ["时装设计", "纯艺", "平面设计"],
  "strength_disciplines": "时装设计、珠宝设计、纯艺术",
  "notable_alumni": "Alexander McQueen, Stella McCartney",
  "entry_score_requirements": "雅思 6.5，单项不低于 5.5",
  "annual_intake": 3500,
  "application_deadline": "2026-01-15",
  "program_count": 18,
  "stats": {
    "avg_ielts": 6.5,
    "program_categories": ["时装设计", "珠宝设计", "平面设计", "纯艺"]
  }
}
```

### 实现要点
- 主表 `schools` 单条查询 + `eq('id', id).single()`。
- `program_count` 和 `stats` 中的聚合信息可通过 `rpc` 或额外一次 Supabase 查询补充。

---

## 5. GET /api/v1/schools/:id/programs — 学院下的项目列表

### 查询参数
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `category_id` | int | 按艺术分类筛选 | - |
| `degree_type` | string | 学位类型，如 `BA,MA` | - |
| `requires_portfolio` | bool | 是否需要作品集 | - |
| `sort_by` | string | `created_at` / `program_name` | `created_at` |
| `limit` | int | 每页条数 | `20` |
| `offset` | int | 偏移量 | `0` |

### 响应示例
```json
{
  "data": [
    {
      "id": 12,
      "program_name": "BA Fashion Design",
      "degree_type": "BA",
      "duration_text": "3 years",
      "requires_portfolio": true,
      "requires_interview": true,
      "cover_image_url": "https://...",
      "categories": ["时装设计"],
      "admission": {
        "ielts_overall": 6.5,
        "regular_deadline": "2026-01-15"
      },
      "fees": {
        "international_tuition_fee": 28570,
        "currency_code": "GBP"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 18,
    "has_more": false
  }
}
```

### 实现要点
- 直接复用现有 `GET /api/v1/programs` 逻辑，增加强制 `school_id` 过滤即可。
- 关联 `program_admissions`、`program_fees`、`program_art_categories -> art_categories`。

---

## 6. GET /api/v1/schools/:id/stats — 学院录取统计

### 响应示例
```json
{
  "school_id": 5,
  "total_programs": 18,
  "degree_distribution": {
    "BA": 8,
    "MA": 9,
    "Foundation": 1
  },
  "category_distribution": [
    { "category_id": 3, "name_zh": "时装设计", "count": 4 },
    { "category_id": 7, "name_zh": "珠宝设计", "count": 2 }
  ],
  "avg_ielts": 6.5,
  "tuition_range": {
    "min": 22000,
    "max": 32000,
    "currency": "GBP"
  },
  "portfolio_required_ratio": 0.89,
  "interview_required_ratio": 0.72
}
```

### 实现要点
- 建议在 Supabase 中创建一个 SQL 函数 `get_school_stats(school_id int)`，通过一次数据库调用完成所有聚合。
- Next.js Route Handler 中直接 `supabase.rpc('get_school_stats', { school_id: id })`。

---

## 7. GET /api/v1/schools/by-category — 按艺术分类查学院

### 查询参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `category_id` | int | 分类 ID（必填） |
| `country` | string | 可选国家筛选 |
| `limit` | int | 默认 `20` |
| `offset` | int | 默认 `0` |

### 响应示例
同 `/api/v1/schools` 列表结构。

### 实现要点
- 查询链路：`art_categories -> program_art_categories -> programs -> schools`。
- 通过 `programs` 表的 `school_id` 反向聚合去重学院。
- 推荐在数据库中建立视图或 RPC：
  ```sql
  CREATE OR REPLACE FUNCTION get_schools_by_category(
    p_category_id INT,
    p_country TEXT DEFAULT NULL,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
  )
  RETURNS TABLE (...) AS $$
  BEGIN
    RETURN QUERY
    SELECT DISTINCT s.*
    FROM schools s
    JOIN programs p ON p.school_id = s.id
    JOIN program_art_categories pac ON pac.program_id = p.id
    WHERE pac.category_id = p_category_id
      AND s.status = 'active'
      AND p.status = 'active'
      AND (p_country IS NULL OR s.country = p_country)
    ORDER BY s.qs_art_rank ASC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
  END;
  $$ LANGUAGE plpgsql;
  ```

---

## 8. POST /api/v1/schools/compare — 学院对比

### 请求 Body
```json
{
  "school_ids": [5, 6, 8]
}
```

### 响应示例
```json
{
  "data": [
    {
      "id": 5,
      "name_zh": "中央圣马丁",
      "qs_art_rank": 2,
      "program_count": 18,
      "avg_ielts": 6.5,
      "avg_tuition": 28570,
      "top_categories": ["时装设计", "珠宝设计"]
    },
    {
      "id": 6,
      "name_zh": "伦敦时装学院",
      "qs_art_rank": 8,
      "program_count": 12,
      "avg_ielts": 6.0,
      "avg_tuition": 26000,
      "top_categories": ["时装设计", "化妆品科学"]
    }
  ]
}
```

### 实现要点
- `school_ids` 上限建议 `10` 个，避免查询量过大。
- 使用 `supabase.from('schools').select('...').in('id', school_ids)` 批量查询。
- 聚合字段（`avg_ielts`、`avg_tuition`、`top_categories`）通过 `rpc` 或子查询补充。

---

## 实施建议

### 第一阶段（MVP）
1. 增强现有 `GET /api/v1/schools`（增加 `keyword`、`sort_by`、`min_qs_art_rank` 等参数）。
2. 新增 `GET /api/v1/schools/:id/programs`。
3. 新增 `GET /api/v1/schools/recommended`。

### 第二阶段
4. 新增 `GET /api/v1/schools/search`（独立搜索接口）。
5. 新增 `GET /api/v1/schools/:id/stats`（详情页数据丰富）。
6. 新增 `GET /api/v1/schools/by-category`。
7. 新增 `POST /api/v1/schools/compare`。

### 性能优化
- 对于需要聚合统计的接口（`program_count`、`stats`、`compare`），优先使用 **Supabase RPC + SQL 函数**，避免在 Next.js 中做多次往返查询。
- 列表接口统一返回 `pagination` 信息，前端可据此做无限滚动或分页器。
- 图片字段（`logo_url`、`cover_image_url`、`campus_image_urls`）统一使用 CDN / Storage 公开链接。

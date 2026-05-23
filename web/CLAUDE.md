@AGENTS.md

## Knowledge Base 知识库系统

### 配置
- **Embedding**: 智谱 GLM `embedding-2` (1024 维)
- **向量数据库**: Supabase pgvector
- **doc_type 约定**: `overview` (index.md), `admissions`, `programs` 等

### 文件结构
```
lib/knowledge/
  ├── supabase-admin.ts    # Admin client (service_role key)
  ├── markdown-parser.ts   # 解析 markdown + frontmatter
  ├── chunker.ts          # 分块策略 (100-800 tokens)
  └── embedder.ts         # 智谱 GLM embedding API

scripts/
  └── ingest-wiki.ts      # 摄取脚本

knowledge-base/          # 软链接 → wiki 仓库
```

### 使用
```bash
# 摄取单个学校
npm run ingest -- --school antwerp-royal-academy
```

### 重要提醒
- `supabase-admin.ts` 仅在脚本中使用，绝不在 API 路由中引用
- 第一阶段只处理 index.md，doc_type 固定为 `overview`
- embedding 向量需 `JSON.stringify()` 后写入 Supabase

详细文档: `docs/KNOWLEDGE_BASE.md`

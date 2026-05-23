# Artsee Backend

Artsee 的 Next.js 后端服务，主要提供艺术留学相关 API、AI 咨询、知识库检索、用户资料、学校和项目数据管理能力。

当前仓库以 `app/api/` 为核心，没有完整前端页面目录。对外接口主要位于 `app/api/v1/`，另有流式聊天接口 `app/api/chat`。

## 技术栈

- Next.js 15.1.8
- React 19.1.0
- TypeScript 5
- Supabase/PostgreSQL
- OpenAI 兼容大模型接口
- GLM/本地 Embedding/Xinference/Ollama/OpenAI Embedding
- Vitest
- ESLint 9

注意：本项目使用 Next.js 15，开发前请按 `AGENTS.md` 要求查看 `node_modules/next/dist/docs/` 中的相关文档，避免使用旧版本 API 习惯。

## 快速开始

```bash
npm install
cp .env.development.example .env.local
npm run dev
```

开发服务默认由 `next dev` 启动，通常是：

```text
http://localhost:3000
```

生产启动命令使用 9090 端口：

```bash
npm run build
npm start
```

```text
http://localhost:9090
```

## 常用命令

```bash
npm run dev                 # 启动开发服务
npm run build               # 生产构建
npm start                   # 启动生产服务，端口 9090
npm run lint                # ESLint 检查
npm test                    # 运行 Vitest
npm run test:watch          # 监听模式测试

npm run ingest              # 导入知识库 Markdown
npm run batch-ingest        # 批量导入知识库
npm run reingest-all        # 重新导入全部知识库
npm run test:consult        # 测试知识库问答
npm run import:programs     # 导入项目数据
```

评测脚本集中在 `eval/` 和 `scripts/eval/`：

```bash
npm run eval:validate
npm run eval:recall
npm run eval:faithfulness
npm run eval:quick-test
```

## 环境变量

复制 `.env.development.example` 为 `.env.local` 后配置。

核心变量：

```env
NODE_ENV=development

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini

GLM_API_KEY=
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

Embedding 支持多种方式，通过 `EMBEDDING_PROVIDER` 切换：

```env
EMBEDDING_PROVIDER=xinference
XINFERENCE_BASE_URL=http://localhost:9997/v1
XINFERENCE_API_KEY=dummy
EMBEDDING_MODEL=bge-small-zh-v1.5
EMBEDDING_DIMENSIONS=512
EMBEDDING_BATCH_SIZE=32
```

也可以使用 `glm`、`ollama` 或 `openai`，具体变量见 `.env.development.example`。

## API 概览

后端采用 Next.js Route Handlers。业务接口按版本放在 `app/api/v1/`，聊天流式接口单独放在 `app/api/chat/`。

常见约定：

- 返回 JSON，错误通常包含 `success: false` 或 `error` 信息。
- 需要用户身份的接口通过 Supabase Auth 会话或 `Authorization: Bearer <token>` 获取用户。
- 管理类写操作依赖服务端 Supabase client 和权限校验。
- 开发环境在 `next.config.ts` 中对 `/api/:path*` 放开 CORS，方便本地前端联调。

### AI 与知识库

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/chat` | POST | 流式聊天接口 |
| `/api/v1/ai/consult` | POST | 非流式 AI 咨询 |
| `/api/v1/ai/analyze` | POST | AI 分析 |
| `/api/v1/ai/record` | POST | AI 咨询记录 |
| `/api/v1/ai/schools/search` | POST | AI 选校搜索 |
| `/api/v1/knowledge/search` | POST | 知识库检索 |

核心流程：

- `/api/chat`：面向聊天场景，支持流式输出。默认走统一咨询 Pipeline，可结合历史对话、用户资料、知识库检索结果生成回答。
- `/api/v1/ai/consult`：非流式咨询接口，适合服务端调用、测试或一次性问答。
- `/api/v1/knowledge/search`：只做知识库检索，适合调试召回、检查 chunk 和相似度。
- `/api/v1/ai/schools/search`：读取学校/项目数据后调用 OpenAI 兼容模型，输出选校建议。
- `/api/v1/ai/record`：保存咨询记录，便于后续分析和追踪。

### 用户与认证

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/v1/auth/register` | POST | 注册 |
| `/api/v1/auth/login` | POST | 登录 |
| `/api/v1/auth/dev-login` | POST | 开发登录 |
| `/api/v1/auth/profile` | GET | 获取用户资料 |
| `/api/v1/auth/profile` | DELETE | 删除用户资料 |
| `/api/v1/auth/update-profile` | POST | 更新用户资料 |
| `/api/v1/auth/profile/export` | GET | 导出用户资料 |
| `/api/v1/auth/profile/field-history` | GET | 用户资料字段历史 |
| `/api/v1/auth/send-sms` | POST | 发送短信验证码 |
| `/api/v1/auth/verify-sms` | POST | 验证短信验证码 |

用户资料能力：

- 登录和注册基于 Supabase Auth。
- `user_profiles` 保存业务资料，如昵称、头像、手机号、简介、所在地、角色、认证状态、会员状态等。
- `profile/export` 用于导出用户资料，方便合规和调试。
- `profile/field-history` 用于查看用户资料字段变更历史。
- `lib/memory/` 会读取用户画像，并在 AI 咨询中用于问题改写、召回增强和回答个性化。

### 内容数据

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/v1/schools` | GET/POST | 学校列表和创建 |
| `/api/v1/schools/[id]` | GET/PATCH/DELETE | 学校详情、更新、删除 |
| `/api/v1/programs` | GET/POST | 项目列表和创建 |
| `/api/v1/programs/[id]` | GET/PATCH/DELETE | 项目详情、更新、删除 |
| `/api/v1/cases` | GET | 案例列表 |
| `/api/v1/community/posts` | GET/POST | 社区帖子列表和创建 |
| `/api/v1/community/posts/[id]` | GET/PATCH/DELETE | 帖子详情、更新、删除 |
| `/api/v1/home-contents` | GET/POST | 首页内容列表和创建 |
| `/api/v1/home-contents/[id]` | GET/PATCH/DELETE | 首页内容详情、更新、删除 |
| `/api/v1/upload` | POST | 文件上传 |
| `/api/v1/init-db` | GET/POST | 初始化数据库结构 |

学校和项目数据：

- `schools` 是院校主表，包含 slug、中英文名称、国家、城市、官网、介绍等基础字段。
- `programs` 是项目主表，通常关联学校，保存专业/项目名称、学位、方向、学制、申请要求等信息。
- 学校和项目接口支持列表查询、详情查询、创建、更新和删除。
- `scripts/import-program-data.ts` 用于导入项目数据。
- AI 选校和 RAG 咨询都会复用学校/项目数据，避免只依赖大模型生成。

社区和内容数据：

- `community/posts` 管理社区帖子。
- `cases` 提供申请案例列表。
- `home-contents` 管理首页推荐内容。
- `upload` 负责文件上传，底层使用 Supabase Storage。

## 知识库与 RAG

知识库源文件放在 `knowledge-base/`，以 Markdown 为主。每所学校通常有独立目录，包含整理后的主页内容、来源记录、开放问题和维护日志。

RAG 主要由以下模块组成：

```text
lib/knowledge/chunker.ts           文档切块
lib/knowledge/embedder.ts          Embedding 生成
lib/knowledge/retriever.ts         向量检索
lib/knowledge/hybrid-retriever.ts  混合检索
lib/knowledge/sparse-embedder.ts   稀疏向量处理
lib/knowledge/retrieval-policy.ts  按意图选择召回策略
lib/knowledge/prompt-builder.ts    构造系统提示词和用户消息
lib/pipelines/consult-pipeline.ts  咨询主流程
```

咨询 Pipeline 的大致步骤：

1. 根据对话历史改写当前问题。
2. 读取用户资料和记忆，补充申请背景。
3. 识别问题意图，如硬数据、开放咨询、推荐、选校匹配等。
4. 按意图选择检索策略和召回数量。
5. 从知识库中检索相关 chunk，必要时使用混合检索或多跳检索。
6. 根据用户画像重新排序召回结果。
7. 构造 Prompt，并在低置信度硬数据问题上启用证据约束。
8. 调用模型生成回答，同时返回来源信息。

支持的 Embedding 后端：

- `xinference`：本地 Xinference，适合开发和私有部署。
- `ollama`：本地 Ollama。
- `glm`：智谱 GLM Embedding。
- `openai`：OpenAI Embedding。

常用命令：

```bash
npm run batch-ingest        # 批量切块、Embedding、入库
npm run reingest-all        # 清理后重新导入
npm run test:consult        # 测试咨询接口
npm run eval:recall         # 评估召回
npm run eval:faithfulness   # 评估回答忠实度
```

评测数据在 `eval/golden.jsonl`。评测脚本会检查问题意图、召回 chunk、参考答案和不应出现的错误信息。

## 主要目录

```text
app/api/                    Next.js API routes
lib/api/                    API 侧 Supabase 和权限工具
lib/ai/                     意图识别等 AI 辅助逻辑
lib/knowledge/              知识库切块、Embedding、检索、Prompt
lib/memory/                 用户记忆、历史改写、画像增强
lib/pipelines/              咨询和选校分析 Pipeline
lib/supabase/               Supabase 客户端与类型
knowledge-base/             学校知识库 Markdown 源文件
docs/migrations/            数据库迁移 SQL
scripts/                    导入、测试、维护脚本
scripts/eval/               RAG 评测脚本
eval/                       Golden 数据集与评测说明
tests/                      Vitest 测试
supabase/functions/         Supabase Edge Functions
```

## 数据库与迁移

项目使用 Supabase/PostgreSQL。迁移 SQL 位于：

```text
docs/migrations/
```

可以通过 Supabase Dashboard SQL Editor 执行，也可以使用 Supabase CLI 或 `psql`。详细说明见 `docs/migrations/README.md`。

当前迁移包含聊天日志、用户记忆、记忆抽取、chunk 元数据、稀疏向量等表和 RPC。

## 知识库流程

知识库源文件位于 `knowledge-base/`，每个学校通常包含：

- `index.md`
- `sources.md`
- `sources/*.md`
- `open-questions.md`
- `log.md`

常用流程：

```bash
npm run batch-ingest
npm run test:consult
npm run eval:recall
npm run eval:faithfulness
```

## 部署

项目启用了 Next.js standalone 输出：

```ts
output: "standalone"
```

生产构建：

```bash
npm run build
npm start
```

PM2 配置文件：

```text
ecosystem.config.js
```

## 开发约定

- API 放在 `app/api/v1/`，聊天流式接口放在 `app/api/chat/`。
- 服务端访问 Supabase 优先使用 `lib/api/supabase-service.ts` 或 `lib/supabase/server.ts` 中已有封装。
- 知识库问答相关逻辑优先走 `lib/pipelines/consult-pipeline.ts`。
- 新增或调整数据库结构时，把 SQL 放入 `docs/migrations/`。
- 修改 Next.js 行为前先查看本地 Next.js 15 文档。

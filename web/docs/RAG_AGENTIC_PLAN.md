# RAG / Agentic 升级方案

> Source of truth：本文是「知识检索 + Agentic Pipeline + 评估闭环」三件事的设计基线。
> 与 `docs/PLAN.md`（记忆系统专项）正交：那份管「认识用户」，本份管「回答好问题」。
> 写代码前先读它，写完再回来对照它。

---

## 0. 一句话目标

把 Artsee 后端的回答能力从「单跳向量 RAG + 写死的 chat prompt」升级为
**统一 pipeline + 按意图分流 + 有评估闭环 + 有 LLM 编译产物（实体页）** 的 Agentic RAG 系统。

衡量这件事是否做成的两个数字：

- **Context Recall** ≥ 0.80（人工标注题集上）
- **Faithfulness** ≥ 0.90（LLM-as-judge 打分）

没有这两个数，所有「优化」都是凭手感。

---

## 1. 现状盘点（2026-05 时点）

### 1.1 已经做对的部分

| 资产　　　　　　　　　　　　　　| 位置　　　　　　　　　　　　　　　　 | 价值　　　　　　　　　　　　　　　　　　　　　　　　　　　　　|
| ---------------------------------| --------------------------------------| ---------------------------------------------------------------|
| Intent Router（规则版）　　　　 | `lib/ai/intent.ts:27-125`　　　　　　| 五意图 + 每意图配 ProfileSlots，是 V2 Router RAG 雏形　　　　 |
| Query Rewriting　　　　　　　　 | `lib/memory/query-rewrite.ts:23-104` | 用画像扩写 query，正经的 Agentic 步骤　　　　　　　　　　　　 |
| Profile-aware Rerank　　　　　　| `lib/memory/rerank.ts`　　　　　　　 | 向量召回后用画像加权　　　　　　　　　　　　　　　　　　　　　|
| Memory / Skill / Tool 分层　　　| `lib/memory/` vs `lib/knowledge/`　　| 关注点分离已经做了　　　　　　　　　　　　　　　　　　　　　　|
| Prompt 模板外置 + 版本号　　　　| `lib/knowledge/prompts/*.v1.md`　　　| 有版本意识　　　　　　　　　　　　　　　　　　　　　　　　　　|
| Consult 流水线　　　　　　　　　| `app/api/v1/ai/consult/route.ts`　　 | rewrite → retrieve → rerank → memory → intent → prompt 已串好 |
| 文档 chunker/embedder/retriever | `lib/knowledge/`　　　　　　　　　　 | 基础设施完整，1024 维 GLM 向量　　　　　　　　　　　　　　　　|

按文章分级：**当前位于 V2 (Router RAG) → V2.5 之间**。

### 1.2 关键差距

| 差距 | 位置 / 证据 | 风险 |
|---|---|---|
| **两套大脑** | `app/api/chat/route.ts:13-51` 写死 32 校 / 69 项目；`/api/v1/ai/consult` 走完整 pipeline | 同一用户从不同入口问同题答案差异大；硬编码事实会过期 |
| **Intent 只覆盖信息类** | `lib/ai/intent.ts` 五类全是「查资料」 | 决策类问题（"我能申 Antwerp 吗"）走单跳 RAG，召回维度不全 |
| **关键词匹配脆** | `q.includes('推荐')` 等 | "哪个对我友好"等表达全部漏检 |
| **Skill 没文件化** | `prompts/` 只有 system-base + answer-requirements | 不同意图共享同一 prompt，PM 无法独立改 |
| **没有 Evidence 兜底** | `consult/route.ts:60-69` 召回为空也照常生成 | LLM 在 hard_data 场景会"自信编" |
| **SQL Router 缺位** | `hard_data` 意图也走向量 | "RCA 学费多少"用 embedding 不准、慢、贵 |
| **没有 Multi-hop** | recommendation 类一次 retrieve 全包 | "A vs B" 类比较召回偏 |
| **没有 LLM Wiki / 实体页** | 只有 `documents` + `document_chunks` 两层 | 综述题靠碎片拼，矛盾内容（学费上涨）无主动消解 |
| **没有评估集** | `tests/` 只测 API 契约 | 任何改动都不知道是变好还是变差 |
| **chunk 无来源元数据** | `document_chunks` 没 `source_url` / `source_type` / `fetched_at` | 无法做 citation audit；过期内容无法识别 |
| **chunker 无 overlap** | `lib/knowledge/chunker.ts:15` MAX=500、无 overlap | 跨 section 语义被切断，预计 -5~10% recall |
| **无对话日志持久化** | 没有 `chat_logs` 表；`lib/memory/record.ts` 只存提取后的画像/语义记忆 | 评估集无法从真实流量采样，迭代效率低 |

### 1.3 模型层小问题（顺手）

- `app/api/chat/route.ts:86` `model: 'kimi-k2.5'` 拼写存疑，需确认 Moonshot 实际可用模型名。
- `consult/route.ts:62` `matchThreshold: 0.5` 写死，未按意图分档。

---

## 2. 设计原则

1. **先有评估，再有优化**。任何 P1 之后的改动必须能在评估集上跑出 delta。
2. **优先改一处复用多处**，而不是分别打补丁。chat 复用 consult 是典型例子。
3. **规则 + LLM 兜底**，而不是一上来就 LLM 分类。规则跑不动的部分再让 LLM 兜。
4. **Skill 文件化**：所有 prompt 进 `prompts/*.v1.md`，TS 代码只做拼装。
5. **Memory ≠ Skill ≠ Tool ≠ Knowledge**，互不串味：
   - Memory = 用户是谁（`lib/memory/`）
   - Skill = 怎么把事做好（`lib/knowledge/prompts/`）
   - Tool = 能做什么动作（vector / SQL / 实体页查询）
   - Knowledge = 事实从哪来（`document_chunks` + 未来的 `entity_pages`）
6. **灰度可回滚**：仅对**有行为变更风险**的 Phase 加 env flag（Phase 1、Phase 4.1）。纯增量改动（Phase 2/3/5 新表新路径）不加 flag 避免过度工程。
7. **裁判抽审**：评估裁判 LLM 不能只用一个，必须 10% 抽审用第二个模型，分歧率 >15% 视为 judge prompt 有问题。

---

## 3. 路线图（按 ROI 排）

### Phase 0 — 评估闭环 + 日志基础（必须先做，2 天）

**没有这步，后面所有 Phase 都是凭手感。**

#### P0.1 建 golden 评估集（**60 条**，含 10 条多轮题）

- 文件：`eval/golden.jsonl`（新建）
- **60 条**人工题，按下列分桶（单桶 ≥15 为主，边界题与多轮题单独报数）：
  - **事实题**（15）：单校学费 / 截止日期 / 排名 → `intent=hard_data`
  - **综述题**（15）：「RCA Fine Art 怎么样」→ `intent=open_info`
  - **决策题**（15）：「我这背景能申 X 吗」→ 暂归 `recommendation`，未来切到 `school_fit_analysis`
  - **边界题**（5）：库里没有的内容，期望模型说「不知道」
  - **多轮题**（10）：每条 2-3 轮，最后一轮依赖前轮信息才能检索准（例：第一轮「我想申皇艺纯艺」→ 第二轮「那作品集要几个项目」）→ 验收 Phase 1.5 专用

**为什么加多轮题**：Phase 1.5（对话上下文规范化）的所有价值都体现在“最后一轮能不能读懂在说什么”。如果 golden 集全是单轮题，Phase 1.5 上线后评估集跱不动，等于白做。这 10 条要趋于“后轮主语省略”“代词指代”“话题转移后又转回”这类真实多轮模式。

**问题来源**：当前**没有 `chat_logs` 表**（详见 P0.4），所以这 60 条必须由**业务方手搓真实问法**——不要写「RCA Fine Art MA 学费多少？」这种教科书式问句，要写「皇艺纯艺研究生一年要多少钱啊」「我画画一般能申 RCA 吗」这种半中半英、口语化、表述不规范的真实用户问法。教科书问法上线后真实流量会翻车看不到。

**分工（最终版）**：
1. **用户做（30 分钟）**：手搓 60 条真实问法（50 单轮 + 10 多轮），仅填 `question` + `intent` + 多轮题的 `history`
2. **用户做（1 小时）**：跑现有 retriever，人工标注 `must_cite_chunk_ids`（这是 ground truth，只有人能判断 chunk 内容是否真的回答了问题）
3. **AI 做**：基于 `must_cite_chunk_ids` 对应的 chunk 内容补 `reference_answer` 草稿（有据可查，不是凭训练数据猜）
4. **用户做（15 分钟）**：review 草稿，补 `must_not_say`

单轮题字段：

```jsonc
{
  "id": "Q001",
  "turns": 1,
  "question": "皇艺纯艺研究生一年要多少钱啊",
  "intent_expected": "hard_data",
  "must_cite_chunk_ids": ["doc_xxx_chunk_3"],
  "reference_answer": "约 £32,000/年（2026 学年）",
  "must_not_say": ["£28,000"]   // 防过期答案
}
```

多轮题字段：

```jsonc
{
  "id": "M001",
  "turns": 2,
  "history": [
    { "role": "user",      "content": "我想申皇艺纯艺" },
    { "role": "assistant", "content": "好的，皇艺 Fine Art MA ..." }
  ],
  "question": "那作品集要几个项目",       // 最后一轮，单独拿出去检索会跳
  "intent_expected": "hard_data",
  "must_cite_chunk_ids": ["doc_yyy_chunk_5"],
  "reference_answer": "通常 8-12 个项目 ..."
}
```

#### P0.2 离线脚本：`npm run eval:recall`

- 文件：`scripts/eval-recall.ts`（新建）
- 对每条题：调 `searchKnowledge(question)` → 比较 `must_cite_chunk_ids ⊂ retrieved`
- **零 LLM 成本**，纯集合运算
- 输出 `eval/results/recall-{date}.json`，包含每题命中、整体 recall@5、**按意图分桶分别报数**

**这一步直接告诉你召回率是 80% 还是 40%，决定 P1 重点。**

#### P0.3 离线脚本：`npm run eval:faithfulness`

- 文件：`scripts/eval-faithfulness.ts`（新建）
- 跑 consult pipeline → 拿到 `(retrieved_context, generated_answer)`
- **主裁判 DeepSeek-V3**（国内访问稳，价格 ≈ GPT-4o-mini）拆原子陈述 + 验证
- **抽审：10% 题（5 条）用第二个模型**（GPT-4o-mini 优先，没 Key 退 Moonshot v1）盲审。分歧率 >15% → 回去改 `judge.faithfulness.v1.md`
- Prompt 模板进 `lib/knowledge/prompts/judge.faithfulness.v1.md`
- 50 条预算 ≈ ¥2，可接受

#### P0.4 加 `chat_logs` 表 + 在 `runConsult` 末尾 fire-and-forget 写入

**为什么提前到 Phase 0**：当前没有任何对话日志持久化（`lib/memory/record.ts` 只存提取后的画像和 importance≥0.7 的语义记忆），未来评估集补充、Phase 4-5 的 prompt 调优都需要从真实流量采样。Phase 0 加上，所有后续 Phase 都直接受益。

迁移：`docs/migrations/007-chat-logs.sql`

```sql
CREATE TABLE chat_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id),
  route        TEXT NOT NULL,            -- 'chat' | 'consult'
  query        TEXT NOT NULL,
  rewritten_query TEXT,                  -- Phase 1.5 用
  intent       TEXT,
  retrieved_chunk_ids UUID[],
  answer       TEXT,
  low_confidence BOOLEAN DEFAULT false,
  latency_ms   INT,
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON chat_logs (user_id, created_at DESC);
CREATE INDEX ON chat_logs (intent, created_at DESC);
```

**注意**：写入必须 fire-and-forget（不阻塞响应），且要遵循隐私合规（写之前问产品/法务是否需要脱敏 / 用户授权）。

**验收**：
- 三个脚本能跑出 baseline 数字，写进 `eval/BASELINE.md`
- `chat_logs` 表上线，consult 路径已写入；chat 路径在 Phase 1 统一时一并接入

---

### Phase 1 — 统一两套大脑（1 天，最高 ROI）

#### P1.1 拆 `runConsultStages` + `streamGenerate`（不要做单一 `runConsult`）

**为什么不是单一 `runConsult`**：chat 入口要 streaming，consult 入口不要。如果用单一函数 + `stream: true` 参数，签名要返回 union（`Promise | AsyncIterable`），所有调用方都被迫处理 async iterator。**拆开更干净**：前面非流式部分共享，最后一步生成分两个变体。

- 新文件：`lib/pipelines/consult-pipeline.ts`

```ts
// 共享非流式部分：rewrite → retrieve → rerank → memory → intent → buildPrompt → evidence guard
export async function runConsultStages(input: {
  query: string;
  userId?: string;
  schoolId?: string;
  mode: 'short' | 'report' | 'chat';
  history?: Message[];
}): Promise<{
  systemPrompt: string;
  userMessage: string;
  sources: Source[];
  intent: Intent;
  lowConfidence: boolean;
  retrievedChunkIds: string[];   // for chat_logs
}>

// 两个生成变体
export async function generate(stages, model, opts): Promise<{ answer: string }>
export function streamGenerate(stages, model, opts): AsyncIterable<{ text: string }>
```

- `consult/route.ts` → `await runConsultStages(...)` → `await generate(...)` → JSON 响应
- `chat/route.ts` → `await runConsultStages(...)` → `streamGenerate(...)` → SSE
- 两个入口在响应结束后都用同一个 fire-and-forget 函数写入 `chat_logs`

#### P1.2 删除 chat/route.ts 里的硬编码院校 prompt + 确认 model name

- 现状：`SYSTEM_PROMPT` 里硬编码了 RCA / UAL / 学费区间 / 申请窗口 → 全部由 RAG 接管
- 「Artsee」的人设部分（前 12 行）保留，迁移到 `prompts/persona.artsee.v1.md`
- **硬规则**：persona.md 内**禁止出现任何具体院校 / 项目 / 学费 / 截止日期 / 数字**，只允许身份、语气、能力边界。事实留给 RAG 注入，否则 persona.md 又会变成新的硬编码源头。
- 由 `runConsultStages` 在 `mode='chat'` 时加载
- **顺手确认** `model: 'kimi-k2.5'` 拼写，改为 Moonshot 实际可用模型名（如 `kimi-latest` 或 `moonshot-v1-32k`）

#### P1.3 灰度 flag

- env：`USE_UNIFIED_CONSULT=true`（默认开）
- `chat/route.ts` 内：flag 关 → 走旧的硬编码 prompt 路径；flag 开 → 走新 pipeline
- 生产观察 1 周无 regression 后删除旧路径

**验收**：`/api/chat` 和 `/api/v1/ai/consult` 同一问题答案结构一致；recall 评估在 chat 入口也能跑；`chat_logs` 两路都有数据。

**⚠⚠ Phase 1 完成的那一刻，上下文问题会从“潜伏”变“显性”，必须紧跟 Phase 1.5 接住。**合并前 chat 走硬编码 prompt，多轮问答靠 LLM 自己读 history 尚能吝温；合并后 chat 走 RAG，但 retrieve 只看当前一轮 query，拿到的是错的 chunks，反而把模型带偏。不能停在 Phase 1。

---

### Phase 1.5 — 对话上下文规范化（1 天，Phase 1 后必须紧跟）

**为什么独立成 Phase**：原 PLAN 的 Phase 0-5 都在回答同一个问题——“怎么让答案的事实基础变扎实”。但所有 Phase 都隐含一个假设：**“用户问出的那一句话”是清晰、自包含、可以直接拿去检索的**。多轮对话里这个假设崩了：

- 第一轮：「我想申皇艺纯艺」
- 第二轮：「那作品集要几个项目」← 这句话单独拿去检索，召回的是泛泛作品集建议，不是皇艺
- 第三轮：「英国其他学校呢」← “其他”指代什么，retriever 不知道

**检索质量再高，输入给检索的 query 是残缺的，再强的 retriever 也救不回来**。这不是 Phase 2/3/4/5 能解决的问题——它发生在 retrieve **之前**。

**与现有 query rewriting（`lib/memory/query-rewrite.ts`）的区别**：

| | 现有 query rewrite | Phase 1.5 history rewrite |
|---|---|---|
| 补充什么 | “用户是谁”（画像） | “刚才聊到哪了”（history） |
| 生命周期 | 跨会话持久 | 仅本会话 |
| 文件 | `lib/memory/query-rewrite.ts` | `lib/pipelines/history-rewrite.ts` |
| 调用顺序 | history rewrite 之后 | retrieve 之前、profile rewrite 之前 |

两个模块串联，但不合并：输入、用途、失败模式都不一样。

#### P1.5.1 History-aware query rewriting

**思路**：在 retrieve 之前加一步“问题改写”，把当前轮的残缺 query 改写成一个**自包含**的完整 query，再喂给 retriever。

- 新文件：`lib/pipelines/history-rewrite.ts`
- 接口形状（伪代）：`rewriteWithHistory({ current, history }) → { rewritten, used }`
- 实现：一次极小 LLM 调用（DeepSeek-V3 chat 或同类）
- prompt 模板：`lib/knowledge/prompts/skill.query-rewrite-history.v1.md`
- **接入点**：`runConsultStages` 里，history rewrite → profile rewrite → retrieve，三者顺序不可调
- **退化规则**（基于命名实体识别，不是长度）：
  - `history` 为空 → 跳过
  - **提取公共模块** `lib/pipelines/query-entity-extract.ts`（P1.5.1 和 P4.1 复用）：
    - 规则层：用 `schools.name_en / name_zh / slug` 字典做最长匹配抽 `school_name`
    - 关键词表（学费/tuition/费用、截止/deadline、排名/ranking）抽 `field`
  - 判定逻辑：
    - 含 school name 或 program name → 跳过
    - 含 field 关键词但**无** school name → **不**跳过，需要 history 补 school
    - 都没有 → 不跳过，让 LLM 试试改写
  - 命中跳过规则的、返回 `used: false`；chat_logs 记录该字段以便合理性复盘
- **延迟预期**：200-400ms。hard_data 场景依赖退化规则控住
- **产出**只用于 retrieve，**不替换用户原话**；给 LLM 看的仍是原话（保留语气与细节）

#### P1.5.2 History 窗口策略：近期原文 + 远期摘要

**思路**：不全量传 history，也不简单截断；采用“最近 N 轮原文 + 更早压缩为摘要”的混合策略。

- 默认保留**最近 3 轮**（user+assistant 各一条，共6 条）原文
- 超出部分压缩为 2-3 句摘要，比如「用户目标皇艺 Fine Art MA，已比较过 RCA 和 UAL 作品集要求」
- 摘要缓存位置：**session 内存（不入库）**，会话结束即丢
- **为什么不入库**：入库就变跨会话状态，那是 memory 的范畴；history 只活在当前会话，边界不能破
- **触发阈值**：history 超 6 条才压缩；大多数会话用不到
- **变体（可选）**：如果项目上线后发现会话普遍在 5 轮内结束，P1.5.2 可以先用“简单截断”实现，摘要方案延后

#### P1.5.3 Prompt 里明确拆 memory section 和 history section

**思路**：给 LLM 看的 system prompt 里，“用户画像”和“对话历史”在两个独立 section，标题明确写出来。

prompt 拼接练达：

```
## 用户画像（跨会话持久）
<from memory: profile + semantic memories>

## 当前对话（本次会话）
<from history: 近期原文 + 远期摘要>
```

**为什么重要**：LLM 拼接长 prompt 时，section 标题是认知锚点。揭表混在一起时，模型分不清“皇艺 Fine Art”是画像里写的（持久）还是上一轮刚聊的（临时）。两者对回答策略影响不同：

- 持久信息 → 模型默认用户希望所有回答绥这个方向
- 临时焦点 → 模型该跟随用户话题转移调整

如果画像写着“目标皇艺”、但当前轮用户说“我突然想看看美国学校”，模型应该跟话题走，不是强行拉回皇艺。拆 section 就是给模型这个信号。

**成本**：prompt-builder 调整，零运行时成本。但需要 `runConsultStages` 的 prompt 拼装逻辑把 memory 和 history 作为**两个独立参数**传入，不能现在这样混着。

#### P1.5.4 多轮评估题提前到 Phase 0（已在 P0.1 调整）

详 P0.1 的 10 条多轮题添加。**为什么不能留到 Phase 1.5 再加**：评估集是 PLAN 的硬阻塞，事后补多轮题意味着要重新跑一遇 retriever 填 `must_cite_chunk_ids`，标注成本翻倍。趁 Phase 0 还没动手，一次标完。

#### 与其他 Phase 的依赖关系

- **依赖**：Phase 1（`runConsultStages` 抽象必须先存在）、Phase 0（多轮评估题验收）
- **被复用**：P4.2 `school_fit_analysis` 的多步检索能复用 P1.5.1 的 history-rewrite 模块（两者都是 query-side 改造）
- **不冲突**：与 Phase 2 Evidence Guard 独立。Guard 看的是 retrieve 产出质量，P1.5 提高 retrieve 输入质量，两者串联

#### 验收

- **多轮题桶（10 条）recall@5 提升 ≥ 30pp**（baseline 预期在 30-40%，Phase 1.5 后 ≥ 70%）
  - 多轮题走完整 pipeline（含 history rewrite），最终 retrieve 的 recall@5 即为验收指标
  - 不做 rewritten query 的字面匹配（自然语言改写无唯一正解，embedding 相似度又引入新不确定性）
- `chat_logs` 里 `rewritten_query` 字段有值（用于复盘，不用于自动验收）
- 跨 section 拼装后的 system prompt 能人肉读出「画像」与「但这轮用户在问...」的边界

---

### Phase 2 — Evidence 兜底 + 关键元数据（1 天）

#### P2.1 Chunk 元数据扩展

迁移：`docs/migrations/006-chunk-source-metadata.sql`

```sql
ALTER TABLE document_chunks
  ADD COLUMN source_url   TEXT,
  ADD COLUMN source_type  TEXT  -- official | forum | blog | internal
                          CHECK (source_type IN ('official','forum','blog','internal')),
  ADD COLUMN fetched_at   TIMESTAMPTZ,
  ADD COLUMN confidence   NUMERIC(3,2) DEFAULT 0.80;
```

- `lib/knowledge/chunker.ts` 入口加 `metadata` 透传参数
- `scripts/ingest-wiki.ts` 调整以填充上述字段
- `prompt-builder.ts` 在拼接 chunk 时显式标注来源等级（official > internal > blog > forum）

#### P2.2 Evidence Guard

`runConsult` 中加：

```ts
const lowConfidence =
  knowledgeChunks.length === 0 ||
  avgSimilarity(knowledgeChunks) < 0.6;

if (lowConfidence && intent === 'hard_data') {
  // 在 system prompt 末尾追加强约束
  systemPrompt += loadPrompt('guard.no-evidence.v1.md');
}
```

`prompts/guard.no-evidence.v1.md` 内容大意：「未检索到可靠资料，请回答『我没有这条信息，建议查官网』，禁止编造数字、日期、链接。」

#### P2.3 Chunker 加 overlap + 新表并行重跑 embedding

**Chunk size策略调整**（基于bge-m3 + margin=0.022分析）：

原计划500→900利用bge-m3长上下文，但similarity分布分析显示：
- Must-cite分布很宽（p10=0.360, p90=0.660），说明chunk主题密度不一致
- Margin极小（avg=0.022），说明需要更聚焦的chunk

**决策**：先按**当前500 tokens + overlap 120**重embed，观察margin变化：
- 如果margin提升到0.05+，说明overlap已解决跨section语义断裂问题
- 如果margin仍<0.05，Phase 2.5 hybrid上线后再评估是否需要调整chunk size

**实施步骤**：
- `lib/knowledge/chunker.ts` 加 `OVERLAP_TOKENS = 120` 滑窗（从80提升到120）
- **chunk 边界变了，embedding 必须全量重算**（不只是重切 chunk）
- **新表并行策略**（避免破坏现有 chunk 引用）：
  1. **Dry-run** 先：`SELECT count(*), sum(token_count) FROM document_chunks` 确认现有 chunk 量
  2. 估算时间：79校 × ~25 chunks × ~500 tokens ≈ 1M tokens，bge-m3本地约1小时
  3. 新建 `document_chunks_v2` 表（schema 同现有表 + sparse_vector列）
  4. 写脚本 `scripts/reembed-all.ts`：写入 `document_chunks_v2` → 重跑 `ingest-wiki.ts` 所有 school slugs
  5. 同时生成dense + sparse vector（P2.5需要）
  6. 跑 P0.2 + `eval:analyze-similarity` 对比两版 recall 和 margin
  7. 确认提升后切换 retriever 配置（一行配置）
  8. 旧表保留 2 周后再删
- **成本**：Ollama本地无API费用，时间成本~1.5小时（含sparse生成），脚本要支持断点续传

#### P2.4 简化版 `wiki_conflicts` 表（从 Phase 5 前移）

**为什么前移**：chunk 元数据（P2.1）一上线，跨 chunk 矛盾就能被检测了。这是 chunk metadata 的自然副产品，不该等到 Phase 5。

迁移：`docs/migrations/008-wiki-conflicts.sql`

```sql
CREATE TABLE wiki_conflicts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  TEXT,         -- 'school' | 'program'
  entity_key   TEXT,
  field        TEXT,         -- 'tuition' | 'deadline' | ...
  values       JSONB,        -- [{value, source_chunk_id, fetched_at}, ...]
  status       TEXT DEFAULT 'open',  -- 'open' | 'resolved' | 'ignored'
  detected_at  TIMESTAMPTZ DEFAULT now()
);
```

**P2.4 阶段加矛盾检测脚本**（给 Phase 5 决策提供客观信号）：

- 新脚本：`npm run wiki:detect-conflicts`
- 扫描所有 chunks，对同 entity 的 tuition/deadline 字段做 SQL `GROUP BY entity_key, field HAVING COUNT(DISTINCT value) > 1`
- 结果写入 `wiki_conflicts` 表
- 一次性脚本，半天工作量
- **为什么重要**：给 Phase 5 决策提供独立于 LLM 评分的客观信号。faithfulness 是 LLM 打的分，本身有噪声；矛盾数是 SQL 算出来的事实，更硬。
- Phase 5 的 Lint Cron 上线后可定期运行。hard_data SQL Router（Phase 4.1）在命中多个候选时也可以写入。

#### P2.5 Hybrid Retrieval（**必做，非条件触发**）

**触发依据**：`npm run eval:analyze-similarity` 结果显示 **average margin = 0.022 < 0.05**，信号噪声比严重不足，dense-only检索无法满足要求。

**数据证据**：
- 13个问题中9个margin < 0.05
- 3个问题margin = 0.000（Q001/Q046/Q016）完全无法区分ground truth
- must-cite p50 (0.602) < non-must-cite max (0.683)，重叠严重

**实现方案**：bge-m3 dense + sparse 混合检索

**工程细节**：

1. **Sparse vector存储**
   - 迁移：`docs/migrations/009-sparse-vectors.sql`
   ```sql
   ALTER TABLE document_chunks
     ADD COLUMN sparse_vector JSONB;  -- {token_id: weight, ...}
   
   CREATE INDEX idx_chunks_sparse ON document_chunks 
     USING GIN (sparse_vector jsonb_path_ops);
   ```

2. **Embedding生成**
   - Ollama默认API只返dense，需要用`BGEM3FlagModel`本地跑
   - 新文件：`lib/knowledge/embedder-hybrid.ts`
   - 同时生成dense (1024维) + sparse (词权重字典)
   - P2.3重embed时一并生成sparse vector

3. **检索融合**
   - 新文件：`lib/knowledge/retriever-hybrid.ts`
   - Dense召回 + Sparse召回 → RRF融合（k=60，和Phase 4.2复用逻辑）
   - 对hard_data意图强制走hybrid，其他意图可选

4. **RRF融合公式**
   ```ts
   score(chunk) = Σ 1 / (60 + rank_i(chunk))
   // rank_i = chunk在第i个检索结果中的排名
   ```

5. **灰度策略**
   - env: `USE_HYBRID_RETRIEVAL=true`（默认开）
   - hard_data意图强制hybrid，不受flag控制
   - 其他意图根据flag决定

**预期收益**：
- hard_data桶recall提升 15-25pp（从当前100%的虚高变成真实稳定的召回）
- margin从0.022提升到0.08+
- 对"RCA学费""Parsons截止日期"等专有名词密集查询准确率显著提升

**成本**：
- 开发时间：2天（含sparse embedding生成 + RRF融合 + 测试）
- 重embed时间：~1.5小时（比dense-only多50%，因为要生成sparse）
- 存储：sparse vector约为dense的20%（JSONB压缩后）

**验收**：
- `npm run eval:analyze-similarity` 显示average margin > 0.08
- hard_data桶在更严格的ground truth标注下recall仍≥0.90
- 边界题（库里没有的内容）召回为空的比例提升

---

**Phase 2 总验收**：
- 在边界题上，`hard_data` 意图低置信度时不再编造
- recall 评估提升 ≥ 15 个百分点（主要来自P2.5 hybrid）
- embedding 重算实际花费记录到 `eval/BASELINE.md`
- margin从0.022提升到0.08+

---

### Phase 3 — Threshold 校准 + Skill 文件化 + 检索参数按意图分档（1.5 天）

**前置条件**：Phase 2完成，overlap=120 + hybrid retrieval已上线

#### P3.1 bge-m3 阈值校准（基于Phase 2实测数据）

**实测数据**（Phase 2完成后）：
- Margin avg: 0.060 (overlap提升后)
- Recall@5: 84.6% (11/13)
- Hard_data recall: 100% (8/8)
- 失败案例：Q016 (open_info), Q036 (recommendation)

**校准策略**：
1. **Hard_data**: 当前0.4工作良好，但可以略微放宽到0.38-0.42避免边界case召回为空
2. **Open_info**: 需要更宽松阈值，建议0.32-0.35（Q016失败因为0个召回）
3. **Recommendation**: 涉及多实体比较，建议0.35-0.38

新文件：`lib/knowledge/retrieval-policy.ts`

```ts
// bge-m3 阈值校准（基于Phase 2实测：margin=0.060, recall@5=84.6%）
// Phase 2验证：hard_data在0.4时100%召回，但open_info在0.4时召回为0
export const RETRIEVAL_POLICY: Record<Intent, SearchOptions> = {
  hard_data:           { matchThreshold: 0.40, matchCount: 5, useHybrid: true },   // 保持0.4，强制hybrid
  open_info:           { matchThreshold: 0.33, matchCount: 8, useHybrid: false },  // 降至0.33，Q016需要更宽召回
  recommendation:      { matchThreshold: 0.36, matchCount: 6, useHybrid: false },  // 降至0.36，Q036涉及比较
  application_advice:  { matchThreshold: 0.38, matchCount: 6, useHybrid: false },
  meta:                { matchThreshold: 0.35, matchCount: 3, useHybrid: false },
};
```

**阈值说明**：
- Hard_data保持0.4 + 强制hybrid（Phase 2验证100%召回）
- Open_info降至0.33（解决Q016召回为0问题）
- Recommendation降至0.36（解决Q036多实体比较问题）
- 分档幅度0.33-0.40（比原计划0.35-0.45更紧凑）

**验收**：
- Q016 "皇艺纯艺怎么样啊" 召回 > 0 chunks
- Q036 "皇艺和ual哪个回国认可度高啊" 召回 > 0 chunks
- Hard_data保持100%召回
- Overall recall@5 提升到 90%+

#### P3.2 拆 prompt 文件

```
lib/knowledge/prompts/
  system-base.v1.md
  answer-requirements.v1.md
  persona.artsee.v1.md             ← P1 已建
  skill.hard-data.v1.md            ← 新（数字/日期/链接抽取规范）
  skill.open-info.v1.md            ← 新
  skill.recommendation.v1.md       ← 新
  skill.application-advice.v1.md   ← 新
  skill.school-fit-analysis.v1.md  ← 新（Phase 4 用）
  guard.no-evidence.v1.md          ← P2 已建
  judge.faithfulness.v1.md         ← P0 已建
```

`buildSystemPrompt(options)` 改为：根据 `intent` 加载对应 `skill.*.md` 拼接。

#### P3.3 Hard_data Skill 增强：数字/日期/链接抽取

新文件：`lib/knowledge/prompts/skill.hard-data.v1.md`

**核心要求**：
1. **数字抽取**：
   - 学费必须包含货币符号和范围（如"£31,350-39,750/年"）
   - 避免模糊表述（如"大概3万多"）
   - 如果是多年前数据，必须标注年份

2. **日期抽取**：
   - DDL必须包含完整日期（如"2024年1月15日"）
   - 避免相对时间（如"下个月"）
   - 标注是第几轮（如"第一轮DDL"）

3. **链接抽取**：
   - 官网链接必须完整可点击
   - 避免"请访问官网"等模糊表述
   - 优先使用knowledge base中的链接

**验收**：hard_data回答中数字/日期/链接格式规范，无模糊表述

#### P3.4 Intent分类优化：规则 + LLM 兜底

`lib/ai/intent.ts` 改为两阶段：

```ts
export function classifyIntent(query: string, profile?: UserProfile): IntentResult {
  // Stage 1: Rule-based classification
  const ruleResult = classifyByRules(query, profile);
  
  if (ruleResult.confidence >= 0.7) {
    return ruleResult;
  }
  
  // Stage 2: LLM fallback (for low confidence cases)
  const llmResult = await classifyByLLM(query, profile);
  return llmResult;
}
```

**规则增强**：
- Hard_data关键词：学费/tuition/费用、截止/deadline/ddl、排名/ranking
- Open_info关键词：怎么样/如何/评价/口碑
- Recommendation关键词：哪个/选择/推荐/比较

**LLM兜底**：
- 使用GLM-4-flash（低成本）
- 缓存：(query hash → intent) LRU 100条
- 仅在confidence < 0.7时调用

**验收**：每意图 prompt 独立可改；评估集上各意图分别报数。

---

### Phase 4 — SQL Router + 新增 `school_fit_analysis` 意图（2 天）

#### P4.1 Hard-data 走 SQL，**规则优先 + LLM 兜底**

**关键修订**：原计划写「极小 LLM 调用提取 school_name+field」，这和 P4.3 意图分类的「规则+LLM 兜底」不一致，且 hard_data 是延迟最敏感场景。改为同一思路：

- 新文件：`lib/tools/structured-queries.ts`
- 提供函数：`getTuition(schoolName) / getDeadline(schoolName, term) / getRanking(schoolName) / getWebsite(schoolName)`（共 5-6 个固定函数）
- 抽取流程：
  1. **规则层**：用 `schools.name_en / name_zh / slug` 字典做最长匹配抽 `school_name`；用关键词表（学费/tuition/费用、截止/deadline、排名/ranking）抽 `field`
  2. **命中两个槽**：直接走 SQL，秒回
  3. **抽取失败**：调一次极小 LLM 兜底（一句话 prompt + JSON 输出）
  4. **仍失败**：退回向量检索 + Evidence Guard
- 缓存：(query hash → {school, field}) LRU 200 条
- 灰度 flag：`HARD_DATA_USE_SQL=true`（默认开）

#### P4.2 新意图 `school_fit_analysis` + Multi-hop 合并策略

**触发条件**：
- 用户提到自身背景（作品集风格、专业背景、GPA等）
- 询问可行性/适配度/是否适合
- 示例："我作品偏商业能申rca纯艺吗"、"你觉得rca交互适合我吗"

**新文件**：`lib/knowledge/prompts/skill.school-fit-analysis.v1.md`

**核心要求**：
1. **多维度分析**：
   - 学校定位 vs 用户背景
   - 作品集要求 vs 用户作品风格
   - 录取标准 vs 用户条件
   - 项目特色 vs 用户兴趣

2. **诚实评估**：
   - 明确指出匹配点和gap
   - 不过度乐观也不过度悲观
   - 给出具体改进建议

3. **Evidence-based**：
   - 引用具体的项目要求
   - 引用往届录取案例（如果有）
   - 避免主观臆断

**Pipeline：多步检索 + RRF 合并**（不要简单 flatten）

新文件：`lib/pipelines/school-fit-pipeline.ts`

```ts
async function runSchoolFitAnalysis(
  query: string,
  school: string,
  program: string,
  userProfile: UserProfile
): Promise<FitAnalysisResult> {
  // Multi-hop retrieval plan
  const retrievalPlan = [
    { query: `${school} ${program} 定位 学生画像 录取标准`, k: 3 },
    { query: `${school} ${program} 申请要求 作品集`, k: 3 },
    { query: `${userProfile.portfolio_style} 风格 适配 ${school}`, k: 2 },
  ];
  
  // Execute retrieval for each step
  const resultsPerStep = await Promise.all(
    retrievalPlan.map(step => retrieve(step.query, step.k))
  );
  
  // RRF fusion (reuse from hybrid retrieval)
  const mergedChunks = rrfMerge(resultsPerStep, k=60);
  
  // Top-5 for prompt (avoid information dilution)
  const topChunks = mergedChunks.slice(0, 5);
  
  return { chunks: topChunks, plan: retrievalPlan };
}
```

**合并规则（必须明确，否则 prompt 塞 9 个 chunk LLM 还是漏关键信息）**：

1. **Dedup**：按 `chunk_id` 去重
2. **多次命中合并**：用 **RRF (Reciprocal Rank Fusion)** 算最终分数：
   `score(c) = Σ 1 / (k + rank_i(c))`，`k=60` 经验值（对召回数量不敏感，不需要调）
   不用 max（不稳定）也不用加权和（需调参）
3. **Top-k = 5** 进 prompt（不是 9，太多会稀释关键信息）

写死 2-3 步即可，**不要做 ReAct loop**。

**验收**：
- Q040 "我作品偏商业能申rca纯艺吗" 给出具体分析
- M007 "你觉得rca交互适合我吗" 基于用户profile给出评估
- 回答包含具体evidence（项目要求、录取标准）

#### P4.3 Intent分类增强（已在P3.4实现）

见P3.4，规则 + LLM 兜底已在Phase 3实现。

**验收**：决策题集（P0 的 15 条）recall 与 faithfulness 同步提升。

---

### Phase 5 — LLM Wiki / 实体页（3-5 天，**条件触发，不默认执行**）

**触发规则**（Phase 4 完成后用真实数据决定）：

- **强触发**：综述题 faithfulness < 0.80 → 必须做
- **强触发**：`wiki_conflicts` 表（P2.4 已建）同实体矛盾数 > 10 → 必须做（这是 entity page 的本职）
- **条件触发**：0.80 ≤ faithfulness < 0.90 → 看业务侧反馈（用户投诉、矛盾内容增多）决定
- **不做**：faithfulness ≥ 0.90 且矛盾数 ≤ 10 → 边际收益不够，资源投到别处

下面是真触发后的实施细节：

#### P5.1 表结构

迁移：`docs/migrations/007-entity-pages.sql`

```sql
CREATE TABLE entity_pages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  TEXT NOT NULL CHECK (entity_type IN ('school','program','topic','query')),
  entity_key   TEXT NOT NULL,
  title        TEXT NOT NULL,
  content_md   TEXT NOT NULL,
  embedding    VECTOR(1024),
  source_chunk_ids UUID[],
  confidence   NUMERIC(3,2),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (entity_type, entity_key)
);
CREATE INDEX ON entity_pages USING ivfflat (embedding vector_cosine_ops);
```

#### P5.2 编译流程（Ingest 时触发）

新文件：`lib/wiki/compiler.ts`

```
摄入新文档
  ├─ 切 chunks（已有）
  ├─ 入 document_chunks（已有）
  └─ NEW: 让 LLM 判断「这篇文档涉及哪些实体」
      └─ 对每个涉及的实体：
          ├─ 拉该实体已有的 entity_page（如有）
          ├─ 拉该实体所有相关 chunks
          └─ 调 LLM 重写实体页（合并新信息、标注矛盾、保留 citations）
```

prompt：`prompts/skill.wiki-compile.v1.md`，约束输出格式必须包含 `## 摘要 / ## 关键事实 / ## 矛盾标注 / ## 引用`。

#### P5.3 检索改混合召回

`runConsult` 检索阶段改为：

```ts
const [entityPages, rawChunks] = await Promise.all([
  searchEntityPages(query, { k: 2 }),    // 高权重
  searchKnowledge(query, policy),         // 补充
]);
const merged = mergeWithDedup(entityPages, rawChunks);
```

实体页在 prompt 中放在「## 已编译知识」section，raw chunks 放在「## 参考碎片」section。

#### P5.4 Lint Cron

新 Edge Function：`supabase/functions/wiki-lint/index.ts`

每周一次：

- 找 `fetched_at > 6 个月` 的 chunk → 标记 `stale`
- 找从未被检索命中的孤立 chunk（用 P0.4 的 `chat_logs.retrieved_chunk_ids` 反查）
- 跨实体页比较同字段（如 tuition）→ 矛盾入 `wiki_conflicts` 表

**验收**：综述题集（P0 的 15 条）faithfulness 与 answer relevancy 双双提升 ≥ 10 个百分点；学费上涨等矛盾内容能在实体页里看到「2026 起 ...」标注。

---

## 4. 不做的事（明确拒绝）

- **完整 ReAct / Plan-Execute loop**：当前规模过早。Phase 4 写死 2-3 步检索就够。
- **完整 text2sql**：5-6 个固定 SQL 函数已能覆盖 80% 硬数据问题。
- **Wiki 全量 LLM 重编译**：增量更新即可，全量太贵。
- **多轮对话状态机**：streaming chat 复用 consult pipeline + history 数组就够，不引入 session state。
- **People 实体页**：Phase 5 暂不做，等业务真需要再加。
- **给纯增量 Phase 加灰度 flag**：Phase 2/3/5 是新表新路径，加 flag 是过度工程。仅 Phase 1（重构）和 Phase 4.1（改 hard_data 路径）需要 flag。
- **单一 `runConsult` 函数同时支持流式 + 非流式**：拆 `runConsultStages` + `streamGenerate` 更清晰。
- **把 memory 和 history 合并为同一个上下文块**：Phase 1.5 明确拆 section，跨会话持久 vs 本次会话要区分。
- **把 history rewriting 和 profile rewriting 合并为同一个模块**：两者拼接顺序固定、失败模式不同，拆开调试更容易。

---

## 5. 验收里程碑

评估集 60 条按桶报数（事实 15 / 综述 15 / 决策 15 / 边界 5 / 多轮 10）。

| 里程碑 | Recall@5 | Faithfulness | 备注 |
|---|---|---|---|
| Baseline (Phase 0 完成时) | TBD | TBD | 写进 `eval/BASELINE.md`，每桶分别记录。**预期范围**：事实题 50-70%、多轮题 30-40%（超出范围视为有 bug） |
| Phase 1.5 完成 | 多轮题桶 +30pp | 多轮题桶 +20pp | history-aware rewrite + section 拆分 |
| Phase 2 完成 | 整体 +5pp | 边界题 +10pp | overlap + Evidence Guard |
| Phase 3 完成 | 整体 +3pp | 整体 +3pp | 各意图 prompt 拆分 |
| Phase 4 完成 | hard_data 桶准确率 ≥0.95（绝对值） | 决策题桶 +10pp | SQL + 多步检索 |
| Phase 5（条件触发） | 综述题桶 +10pp | 综述题桶 +15pp | 实体页 |

每个 Phase 合 PR 时必须附 `npm run eval:recall && npm run eval:faithfulness` 的对比输出。

---

## 6. 与现有计划的关系

- `docs/PLAN.md`（记忆系统）：本计划的 **输入**。本计划全程依赖 `loadUserProfile` / `searchUserMemories` / `rerankChunksWithProfile`，不重复造。
- `AGENTS.md`：本计划落地后，需更新「AI 入口」章节为 `runConsultStages` + `streamGenerate` 拆分抽象（Phase 1.1），两个入口（chat / consult）共享前者、分别接后两个生成变体。
- 与前端 `Artsee_web/docs/MEMORY_PLAN.md`：本计划不引入新前端契约；`/api/v1/ai/consult` 响应结构仅在 Phase 2 增加 `lowConfidence` 字段（向后兼容）。Phase 1.5 在 `chat_logs` 表加 `rewritten_query` 字段，但前端不感知。

---

## 7. 立即可动的下一步

按此顺序执行，不要跳：

1. ✅ 写本文档 v2（done）
2. ⏭ **Phase 0.1（用户）**：手搓 60 条真实问法（50 单轮 + 10 多轮）（30-45 分钟）
3. ⏭ **Phase 0.1（AI）**：补 `intent_expected` / `reference_answer` / `must_not_say` 草稿
4. ⏭ **Phase 0.1（用户）**：跑现有 retriever，填 `must_cite_chunk_ids`（1 小时）
5. ⏭ Phase 0.4：建 `chat_logs` 表 + consult 路径写入
6. ⏭ Phase 0.2 + 0.3：写 eval 脚本，跑出 baseline，写进 `eval/BASELINE.md`
7. ⏭ Phase 1：拆 `runConsultStages` + `streamGenerate`，删 chat 硬编码 + 灰度 flag
8. ⏭ **Phase 1.5（紧跟 Phase 1）**：history rewrite + window 策略 + prompt section 拆分。不能跳。

**在 Phase 0 baseline 数字落地之前，禁止开始 Phase 1 之后任何动作。**
**Phase 1 完成后禁止跳过 Phase 1.5 直接进 Phase 2——上下文问题会从潜伏变显性。**

---

## 8. 决策记录（写在文档里防遗忘）

| 决策 | 选择 | 理由 |
|---|---|---|
| Embedding模型 | Ollama bge-m3 (1024维) | 多语言支持、支持dense/sparse/multi-vector、长上下文8192 tokens、中文友好 |
| 相似度阈值 | 0.4工作点 | 实测调整，bge-m3在本语料上分布偏低（must-cite p50=0.602） |
| Hybrid Retrieval | Phase 2.5必做（非条件触发） | margin=0.022<0.05，信号噪声比严重不足，13题中9题margin<0.05，3题margin=0.000 |
| Chunk size策略 | 保持500 tokens + overlap 120 | margin分析显示需要更聚焦的chunk，先加overlap观察效果，hybrid上线后再评估 |
| 阈值分档幅度 | 0.05-0.1（压缩自0.2） | hard_data 0.45 vs open_info 0.35，避免hard_data召回为空频繁触发Evidence Guard |
| 评估裁判主 LLM | DeepSeek-V3 | 国内访问稳，价格 ≈ GPT-4o-mini |
| 评估裁判抽审 LLM | GPT-4o-mini（备：Moonshot v1） | 10% 抽审，分歧率 >15% 视为 judge prompt 有问题 |
| Golden 集大小 | 60（50 单转 + 10 多转） | 单桶 ≥15 条压统计噪声；多转题为 Phase 1.5 验收专用 |
| Golden 集来源 | 用户手搓真实问法 | 当前无 `chat_logs`，无法从流量采样；教科书问法上线翻车看不到 |
| Phase 5 触发 | 条件触发（faithfulness < 0.80 强触发；矛盾数 > 10 强触发；其他看业务） | 32 校规模下不预先承诺，Phase 4 完成后用数据决定 |
| 灰度 flag 范围 | 只 Phase 1 + 4.1 | 纯增量 Phase 加 flag 是过度工程 |
| Streaming 实现 | 拆 stages + streamGenerate | 单一 `runConsult` 会让所有调用方处理 async iterator |
| Persona 内容 | 只搬不改 + 禁止具体事实 | Phase 1 只动「消除两套大脑」一件事；事实留给 RAG |
| Multi-hop 合并 | RRF (k=60), top-k=5 | 比 max 稳定，比加权和不需调参 |
| Hard-data 抽取 | 规则字典 + LLM 兜底 + LRU 缓存 | 与 P4.3 意图分类思路一致；保护延迟敏感场景 |
| chat_logs 表 | Phase 0 加 | 后续所有 Phase 都受益 |
| 对话上下文为什么独立成 Phase 1.5 | 不合进 Phase 1；不延后到 Phase 2 后 | Phase 0-5 都在回答“怎么让答案事实基础变扎实”，但都隐含假设“用户问出的那句话是清晰的”。多转对话里这个假设崩了，是 retrieve **之前**的问题。Phase 1 完成会让这个问题从潜伏变显性，必须紧跟 |
| history rewrite vs profile rewrite | 两个独立模块串联 | 补充代价不同（刚才聊到哪 vs 用户是谁），拆开调试与独立退化 |
| history 摘要不入库 | session 内存 | 进库即跨会话，跨会话是 memory 的范畴，不能破边界 |
| 多转评估题位置 | Phase 0 一次标完 | 迟加要重跑 retriever，标注成本翻倍 |

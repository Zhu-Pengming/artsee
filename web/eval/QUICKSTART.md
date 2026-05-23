# Golden Set 快速上手（20 分钟版）

## 前置条件

```bash
# .env.local 需要这些变量
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
DEEPSEEK_API_KEY=sk-...
```

## 5 步完成 60 条标注（总耗时 ~45 分钟）

### Step 1: 生成候选问法 (5 分钟)

```bash
npm run eval:generate-candidates
```

输出：`eval/question-candidates.jsonl` (100 条 AI 生成的问法)

### Step 2: 筛选 60 条 (15 分钟)

打开 `question-candidates.jsonl`，挑选最真实的 60 条：

**优先选择：**
- ✅ 口语化、混合语言："皇艺纯艺一年多少钱啊"
- ✅ 省略主语、代词指代："那作品集要几个项目"
- ✅ 缩写、俚语："rca ddl 啥时候"
- ✅ 边界 case："帮我写作品集"（应该拒绝）

**避免选择：**
- ❌ 教科书式："RCA Fine Art MA 的学费是多少？"
- ❌ 过于规范："请问皇家艺术学院的申请截止日期是什么时候？"

复制选中的 60 条到 `golden.jsonl`，手动改写让它们更真实。

### Step 3: 预浏览候选 chunks (5 分钟，可选但强烈推荐)

```bash
npm run eval:pre-browse
```

对 60 条题自动：
1. 从问题中提取学校 slug（皇艺 → royal-college-art）
2. 从 note 字段提取关键词（tuition, gpa, portfolio 等）
3. 扩展同义词（学费 → tuition, fee, 费用）
4. 批量 browse 所有相关 chunks
5. 保存到 `eval/candidates/q001.json` 等文件

**优势**：
- 节省 80% 标注时间（1 小时 → 10 分钟）
- 避免遗漏相关 chunks
- 可离线 review 候选列表

### Step 4: 标注 ground truth chunks (5 分钟)

**方案 A：交互式合并候选（推荐）**

```bash
npm run eval:merge-candidates
```

对每条题：
1. 脚本显示 top 10 候选 chunks（path + preview）
2. 你输入 "1,3" 选择相关 chunks，或 "skip kb-missing"
3. 自动保存到 `golden.jsonl`

**优势**：
- 无需手动编辑 JSON
- 实时预览 chunk 内容
- 自动保存，支持中断恢复

**方案 B：手动编辑（备选）**

1. 打开 `eval/candidates/q001.json`
2. 查看候选 chunks 的 `path` 和 `text_preview`
3. 记下相关的 `chunk_id`
4. 手动编辑 `golden.jsonl`，填入 `must_cite_chunk_ids`

**方案 C：原始交互式标注（不推荐）**

```bash
npm run eval:annotate
```

对每条题：
1. 脚本搜索 top 15 chunks
2. 你输入 "1,3,7" 标记哪些 chunks 应该被引用
3. 自动保存到 `golden.jsonl`

**如果检索不到相关 chunk：**
```bash
npm run eval:annotate -- --browse rca
```
浏览该校所有 chunks，手动找 chunk ID。

### Step 4: AI 起草参考答案 (15 分钟)

```bash
npm run eval:draft-answers
```

DeepSeek-V3 基于你标注的 chunks 生成答案草稿。

**重要：必须人工 review！** 如果草稿错了，说明 Step 3 标注的 chunks 有问题。

### Step 5: 补充 `must_not_say` (15 分钟)

打开 `golden.jsonl`，对每条题添加「不该说的内容」：

```jsonl
{"id":"Q001","must_not_say":["£28,000"]}
```

例子：
- 过期学费："£28,000"（去年的）
- 错误项目名："Fine Art MFA"（应该是 MA）
- 已关闭项目："Interaction Design MA"

### 验证完成

```bash
npm run eval:validate
```

应该看到：
```
✅ All validations passed!

📊 Summary:
   Total questions: 60
   With annotations: 60
   With reference answers: 60
```

## 常见问题

### Q: `generate-candidates` 生成的问法太正式怎么办？

A: 手动改写。AI 倾向生成规范问法，你需要加入：
- 口语词："啊"、"吗"、"呢"
- 缩写："rca"、"ddl"
- 混合语言："皇艺 Fine Art"

### Q: `annotate-chunks` 搜不到相关内容？

A: 两种可能：
1. 知识库确实没有 → 这是个好的边界题，标记 `must_cite_chunk_ids: []`
2. 检索失败 → 用 `--browse <school_slug>` 手动找 chunk

### Q: `draft-answers` 生成的答案不对？

A: 回去检查 `must_cite_chunk_ids`，可能标注错了。草稿只用你提供的 chunks，不会用 LLM 训练知识。

### Q: 多轮题怎么标注？

A: `annotate-chunks` 会**故意只用最后一轮问题**搜索（不喂 history），这是为了测试 baseline 在多轮场景的失败模式。你标注的 `must_cite_chunk_ids` 是「Phase 1.5 完成后应该召回的」，不是「baseline 现在召回的」。

## 时间分配

- Step 1: 5 分钟（AI 生成问法）
- Step 2: 15 分钟（筛选 + 改写）
- Step 3: 5 分钟（预浏览候选 chunks）
- Step 4: 5 分钟（交互式标注 ground truth）
- Step 5: 15 分钟（AI 起草答案 + review）
- Step 6: 15 分钟（补 must_not_say）

**总计：~1 小时**（vs. 纯手动 3-4 小时，节省 67%）

**关键优化**：
- Step 3 预浏览 + Step 4 交互式合并 = 10 分钟（vs. 原方案 1 小时）
- 自动保存，支持中断恢复

## 下一步：评估 RAG 系统性能

### Step 6: 召回率评估 (5 分钟)

测试检索器能否召回 ground truth chunks：

```bash
npm run eval:recall
```

**评估指标**：
- **Recall@5**: 前 5 个结果中包含任意 ground truth chunk 的比例
- **Recall@10**: 前 10 个结果中包含任意 ground truth chunk 的比例
- **MRR (Mean Reciprocal Rank)**: ground truth chunk 的平均排名倒数

**输出**：
- 控制台显示每题的召回情况
- `eval/recall-results.json` 保存详细结果

### Step 7: 生成质量评估 (10 分钟)

测试生成的答案是否忠实于检索到的 chunks：

```bash
npm run eval:faithfulness
```

**评估方法**：
- 用 Claude 作为 judge 评估生成答案的忠实度
- 检查是否有幻觉（hallucination）
- 与参考答案对比

**输出**：
- 控制台显示每题的评分
- `eval/faithfulness-results.json` 保存详细结果

# Evaluation Dataset & Scripts

This directory contains the golden evaluation dataset and related scripts for measuring RAG system performance.

## Quick Start

### 1. Generate Question Candidates (AI-assisted - 20 min)

**Option A: AI-generated candidates (recommended)**

```bash
npm run eval:generate-candidates
```

This generates 100 candidate questions to `question-candidates.jsonl`. Then:
1. Review candidates (look for realistic phrasing, edge cases)
2. Select best 60 questions
3. Edit/rewrite to make more realistic
4. Copy to `golden.jsonl`

**Option B: Manual from scratch (30 min)**

Edit `golden.jsonl` and add 60 real-world questions:

```jsonl
{"id":"Q001","turns":1,"question":"皇艺纯艺研究生一年要多少钱啊","intent_expected":"hard_data"}
{"id":"Q002","turns":1,"question":"RCA Fine Art 怎么样","intent_expected":"open_info"}
{"id":"M001","turns":2,"history":[{"role":"user","content":"我想申皇艺纯艺"},{"role":"assistant","content":"好的，皇艺 Fine Art MA ..."}],"question":"那作品集要几个项目","intent_expected":"hard_data"}
```

**Important:** Write questions as real users would ask them:
- ✅ "皇艺纯艺研究生一年要多少钱啊" (colloquial, mixed language)
- ❌ "RCA Fine Art MA 学费多少？" (textbook-style, will pass in dev but fail in production)

### 2. Validate Schema

```bash
npm run eval:validate
```

Checks:
- Required fields present
- Multi-turn history matches `turns` count
- `intent_expected` is valid enum
- (Will check `must_cite_chunk_ids` exist in DB once annotated)

### 3. Annotate Ground Truth Chunks (Manual - 1 hour)

```bash
npm run eval:annotate
```

For each question:
1. Script runs `searchKnowledge()` with top 15 results
2. Shows chunk ID + preview (first 200 chars)
3. You input "1,3,7" to mark which chunks **should** be cited
4. Writes `must_cite_chunk_ids` back to `golden.jsonl`

**For multi-turn questions:** Script intentionally searches with **last question only** (no history) to test baseline retriever failure mode.

**Browse mode** (if retriever misses relevant chunks):
```bash
npm run eval:annotate -- --browse rca
```
Lists all chunks for a school, so you can manually find the right chunk IDs.

### 4. Draft Reference Answers (AI - 15 min)

```bash
npm run eval:draft-answers
```

For each annotated question:
1. Fetches chunk content from `must_cite_chunk_ids`
2. Calls DeepSeek-V3 with strict "only use provided chunks" prompt
3. Writes `reference_answer` to `golden.jsonl`

**You MUST review the drafts.** If a draft is wrong, fix `must_cite_chunk_ids` (ground truth was wrong).

### 5. Add `must_not_say` (Manual - 15 min)

Edit `golden.jsonl` and add outdated/wrong answers to prevent:

```jsonl
{"id":"Q001","must_not_say":["£28,000"]}
```

Examples:
- Old tuition fees
- Deprecated program names
- Outdated deadlines

### 6. Final Validation

```bash
npm run eval:validate
```

Should show:
```
✅ All validations passed!

📊 Summary:
   Total questions: 60
   Single-turn: 50
   Multi-turn: 10
   With annotations: 60
   With reference answers: 60

📋 By intent:
   hard_data: 15
   open_info: 15
   recommendation: 15
   ...
```

## File Structure

```
eval/
├── README.md              # This file
├── golden.jsonl           # 60 hand-crafted questions (source of truth)
└── results/               # Auto-generated eval results
    ├── recall-2026-05-19.json
    └── faithfulness-2026-05-19.json
```

## Schema Reference

### Single-turn Question

```jsonc
{
  "id": "Q001",                              // Unique ID
  "turns": 1,                                // Number of conversation turns
  "question": "皇艺纯艺研究生一年要多少钱啊",  // User's question (real-world phrasing)
  "intent_expected": "hard_data",            // Expected intent classification
  "must_cite_chunk_ids": ["uuid-1", "uuid-2"], // Ground truth chunks (manual annotation)
  "reference_answer": "约 £32,000/年（2026 学年）", // Expected answer (AI-drafted, human-reviewed)
  "must_not_say": ["£28,000"]                // Outdated/wrong info to avoid
}
```

### Multi-turn Question

```jsonc
{
  "id": "M001",
  "turns": 2,
  "history": [
    { "role": "user", "content": "我想申皇艺纯艺" },
    { "role": "assistant", "content": "好的，皇艺 Fine Art MA ..." }
  ],
  "question": "那作品集要几个项目",           // Last turn (depends on history)
  "intent_expected": "hard_data",
  "must_cite_chunk_ids": ["uuid-3"],
  "reference_answer": "通常 8-12 个项目 ..."
}
```

## Valid Intents

- `hard_data` - Factual queries (tuition, deadlines, rankings)
- `open_info` - Overview questions ("How is RCA Fine Art?")
- `recommendation` - Decision support ("Can I apply to X?")
- `school_fit_analysis` - (Future) Personalized fit analysis
- `general_chat` - Chitchat

## Environment Variables

For `eval:draft-answers`:
```bash
DEEPSEEK_API_KEY=sk-...
```

For all scripts:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Workflow Summary

```
1a. npm run eval:generate-candidates (5 min)  → question-candidates.jsonl
1b. Select + edit 60 questions (15 min)       → golden.jsonl (question + intent only)
   ↓
2. npm run eval:validate                      → Check schema
   ↓
3. npm run eval:annotate (1 hour)       → Add must_cite_chunk_ids
   ↓
4. npm run eval:draft-answers (15 min)  → Add reference_answer drafts
   ↓
5. Review drafts + add must_not_say (15 min) → Final golden.jsonl
   ↓
6. npm run eval:validate                → Confirm ready for eval
   ↓
7. npm run eval:recall                  → Measure retriever performance
8. npm run eval:faithfulness            → Measure generation quality
```

**Total time:** ~2 hours (vs. 3-4 hours manual)

## Tips

- **Question quality matters more than quantity.** 60 well-crafted questions > 200 lazy ones.
- **Multi-turn questions are critical** for testing Phase 1.5 (conversation context handling).
- **Boundary questions** (库里没有的内容) test if the model says "I don't know" instead of hallucinating.
- **Keep `must_cite_chunk_ids` minimal.** Only mark chunks that **directly answer** the question.
- **Review AI drafts carefully.** If DeepSeek hallucinates, your ground truth chunks were wrong.

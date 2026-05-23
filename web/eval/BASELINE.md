# Evaluation Baseline

> **Last Updated**: 2026-05-21
> **Phase**: P0.4 Complete (before Phase 1)

## Current Metrics

### Recall Evaluation

**Overall Performance**:
- **Recall@5**: 13/13 (100.0%)
- **Recall@10**: 13/13 (100.0%)
- **MRR**: 1.000

**By Question Type** (all questions currently have school filtering):
- All 13 questions with ground truth achieved 100% recall
- All ground truth chunks ranked at position #1

**Key Findings**:
- ✅ School filtering is working correctly
- ✅ Smart-fix-golden successfully matched chunks to correct schools
- ✅ All questions retrieve relevant chunks from the right school

### Faithfulness Evaluation

**Overall Performance**:
- **Average Faithfulness Score**: 8.3/10
- **Hallucination Rate**: 3/13 (23.1%)

**Low Scoring Questions** (<7/10):
1. **Q001** (4/10): "皇艺纯艺研究生一年要多少钱啊"
   - Issue: Generated answer cited specific price ranges not in retrieved chunks
   
2. **Q011** (5/10): "parsons要不要作品集啊"
   - Issue: Answer made absolute statements not fully supported by chunks
   
3. **Q015** (2/10): "csm纯艺本科作品集是要20张吗"
   - Issue: Answer stated "15-25件作品" but this wasn't clearly in the chunks

**Key Findings**:
- ✅ Most answers (10/13) scored ≥7/10
- ⚠️ Some hallucinations occur when chunks don't contain precise answers
- ⚠️ LLM sometimes infers information not explicitly stated in chunks

## System Configuration

### Retrieval Settings
- **Embedding Model**: Ollama bge-m3 (1024 dimensions, multilingual, supports dense/sparse/multi-vector)
- **Match Threshold**: 0.4 (实测调整，bge-m3在本语料上相似度分布偏低)
- **Match Count**: 5-10 depending on mode
- **School Filtering**: Enabled (extracts school from query)

### bge-m3 Similarity Distribution (已完成分析)

**Must-cite chunk similarities**:
- p10: 0.360
- p50: 0.602
- p90: 0.660
- min: 0.357
- max: 0.694

**Non-must-cite chunk similarities (in top-5)**:
- p10: 0.413
- p50: 0.570
- p90: 0.620
- min: 0.353
- max: 0.683

**Margins (must-cite min - non-must-cite max)**:
- p10: 0.000
- p50: 0.012
- p90: 0.075
- **avg: 0.022** ⚠️

**Critical Issues**:
- ⚠️ **13个问题中9个margin < 0.05**
- 🚨 **3个问题margin = 0.000**（Q001/Q046/Q016）完全无法区分
- 🚨 **non-must-cite max (0.683) > must-cite p50 (0.602)**，重叠严重

**Decision**: **MUST enable hybrid retrieval (Phase 2.5)** - Signal-to-noise ratio is critically poor.

### LLM Settings
- **Answer Generation**: GLM-4-flash
- **Judge Model**: DeepSeek-chat
- **Temperature**: 0.7
- **Max Tokens**: 800 (short mode), 2000 (report mode)

### Knowledge Base
- **Total Chunks**: 8,209
- **Schools Covered**: 79
- **Major Schools**: RCA, CSM, UAL, Parsons, Pratt, RISD, SCAD

## Phase 0 Completion Checklist

- [x] P0.1: Golden evaluation set created (60 questions planned, 13 with ground truth currently)
- [x] P0.2: `npm run eval:recall` script working
- [x] P0.3: `npm run eval:faithfulness` script working
- [x] P0.4: `chat_logs` table created
- [x] P0.4: Fire-and-forget logging added to consult route
- [x] P0.4: Fire-and-forget logging added to chat route (completed in Phase 1)

## Phase 1 Completion Checklist

- [x] P1.1: Created `lib/pipelines/consult-pipeline.ts` with `runConsultStages` + `generate` + `streamGenerate`
- [x] P1.2: Extracted persona to `lib/knowledge/prompts/persona.artsee.v1.md`
- [x] P1.2: Removed hardcoded 32 schools / 69 programs from chat route
- [x] P1.3: Added grayscale flag `USE_UNIFIED_CONSULT` (default: true)
- [x] P1.4: Chat route now uses unified pipeline with chat_logs logging
- [x] Consult route refactored to use unified pipeline
- [x] **Bug fix**: Added automatic school extraction from query (missing in initial implementation)
- [x] Verification: Consult API tested successfully with school-specific and general questions

## Phase 1.5 Completion Checklist

- [x] P1.5.1: Created `lib/memory/history-rewrite.ts` for multi-turn query rewriting
- [x] P1.5.2: Integrated history rewriting into pipeline (before profile rewrite)
- [x] P1.5.3: Golden.jsonl already contains 6 multi-turn questions (M005-M010)
- [x] History rewriting uses GLM-4-flash with temperature=0.3 for deterministic output
- [x] Rewritten query used ONLY for retrieval, original query shown to LLM
- [x] **Fallback**: Rule-based rewriting when LLM API fails
- [ ] Verification: Run recall evaluation on multi-turn questions

## Phase 2 Completion Checklist

- [x] P2.1: Created migration `008-chunk-metadata.sql` for source tracking
- [x] P2.1: Added `ChunkMetadata` interface to chunker with source_url, source_type, confidence
- [x] P2.2: Created Evidence Guard prompt `guard.no-evidence.v1.md`
- [x] P2.2: Integrated Evidence Guard into pipeline (triggers on lowConfidence + hard_data)
- [x] P2.3: Increased chunker overlap from 50 to 120 tokens (OVERLAP_TOKENS constant)
- [x] P2.3: **Verified**: Margin improved from 0.022 to 0.060 (+173% improvement)
- [x] P2.5.1: Created migration `009-sparse-vectors.sql` for sparse vector storage
- [x] P2.5.2: Implemented sparse vector generation (`lib/knowledge/sparse-embedder.ts` with TF-IDF fallback)
- [x] P2.5.3: Implemented hybrid retrieval with RRF fusion (`lib/knowledge/hybrid-retriever.ts`)
- [x] P2.5.4: Integrated hybrid retrieval into pipeline (hard_data queries automatically use hybrid)
- [x] P2.4: Re-embedded all 79 schools with overlap=120 (sparse vectors pending)
- [x] P2.4: Modified ingest script to generate sparse vectors during embedding
- [ ] P2.4: Re-run `npm run reingest-all` to generate sparse vectors for all chunks
- [ ] P2.5.5: Re-run similarity analysis after sparse vectors are generated

## Next Steps

### Phase 1 Verification
- [ ] Test `/api/chat` with unified pipeline (USE_UNIFIED_CONSULT=true)
- [ ] Test `/api/v1/ai/consult` returns same answer for same question
- [ ] Verify chat_logs table receives entries from both routes
- [ ] Run recall evaluation to ensure no regression

### Expected Improvements
- **Phase 1**: No metric change expected (architecture refactor)
- **Phase 1.5**: Multi-turn recall +30pp (when multi-turn questions added)
- **Phase 2**: Overall recall +15pp (主要来自P2.5 hybrid), faithfulness +10pp on boundary questions, **margin从0.022提升到0.08+**
- **Phase 3**: Overall +3pp on both metrics (阈值按bge-m3重新校准)
- **Phase 4**: hard_data accuracy ≥95%, decision questions +10pp faithfulness

## Notes

1. **School Filtering Critical**: Without school filtering, recall drops to ~7%. The smart-fix-golden script correctly identifies schools and retrieves from the right knowledge base.

2. **bge-m3 Threshold at 0.4**: 实测调整到0.4说明相似度分布偏低，可能原因：
   - Chunk语言混杂（中英文院校文档）
   - Chunk size (500 tokens) 可能不够聚焦
   - 或就是本语料的天然分布
   - **Phase 0需记录margin分布决定是否上hybrid retrieval**

3. **Chunk Size Strategy**: 原计划500→900利用bge-m3长上下文，但0.4阈值暗示可能要反向调整：
   - 如果similarity边界窄（0.4-0.5）→ chunk调小（300-400）让主题更聚焦
   - 如果分布分散（0.4-0.7）→ 调大没问题
   - **Phase 0跑完后看分布再决定**

4. **Hybrid Retrieval优先级**: bge-m3支持sparse vector，对专有名词密集查询（"RCA学费"）效果好。0.4工作点说明dense信号弱，hybrid边际收益更高。触发条件：hard_data recall < 0.8（而非原计划的0.7）

5. **Ollama工程风险**: 
   - 并发：默认串行，Phase 2.3重embed和评估时要配`OLLAMA_NUM_PARALLEL`
   - 冷启动：模型加载有延迟，生产环境要keep-alive
   - **建议Phase 0加throughput测试，p99延迟写入baseline**

6. **Faithfulness Issues**: Main source of low faithfulness scores is LLM making inferences beyond what's explicitly in chunks. Phase 2 Evidence Guard should help.

7. **Missing Multi-turn Questions**: Current golden set lacks multi-turn questions. These should be added before Phase 1.5 to properly validate history rewriting.

8. **Evaluation Cost**: Faithfulness evaluation costs ~¥2 for 13 questions using DeepSeek. Embedding用Ollama本地无API费用，但有时间成本（~1h重embed全量）。

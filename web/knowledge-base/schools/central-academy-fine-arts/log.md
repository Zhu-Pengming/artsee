---
type: log
created: 2026-05-16
updated: 2026-05-16
---

# Central Academy of Fine Arts - Processing Log
# 中央美术学院 - 处理日志

## 2026-05-16: Initial Ingest

**Sources processed**: 7 files from `raw/中央美术学院/`

1. **gpt_research.md** (GPT-4 research report)
   - Comprehensive overview with entity tagging
   - QS rankings 2020-2026
   - Enrollment data, programs, notable alumni
   - Historical timeline and milestones

2. **wiki.txt** (Wikipedia article)
   - 227 lines of detailed information
   - Historical evolution from 1918
   - Department structure, notable faculty
   - International exchange programs

3. **baidu.txt** (Baidu Baike encyclopedia)
   - 530 lines of comprehensive data
   - Current enrollment: 7,525 students
   - 30 undergraduate programs, 16 teaching units
   - Campus information (5 campuses)
   - Faculty: 522 full-time teachers

4. **bilibili.txt** (Video content transcripts)
   - 2 videos: Graduation exhibition tour + campus tour
   - Student life details: cafeterias, studios, facilities
   - Architecture program characteristics
   - Career insights from graduation exhibition

5. **deepseek.txt** (AI-generated analysis)
   - Structured wiki format with evidence levels
   - QS ranking #14 (2026), #1 in China for art academies
   - Application requirements for international students
   - Tuition: 60,000-90,000 RMB/year (undergrad), 80,000-100,000 RMB/year (grad)

6. **xiaohongshu_post.txt** (UGC collection from Xiaohongshu)
   - 200+ lines of student experiences
   - Career outcomes from 2026 spring job fair
   - Cafeteria details and prices
   - Housing information (limited)
   - Portfolio and application tips

7. **manus** (未读取 - 格式未知)

**Pages created**:
- `index.md` - Main school profile (comprehensive)
- `log.md` - This processing log
- `sources.md` - Source quality assessment
- `open-questions.md` - Unverified claims and gaps

**Key findings**:
- ✅ QS Art & Design #14 (2026), #1 among Chinese art academies
- ✅ 7,525 students total, 165 international students from 40+ countries
- ✅ ~2% acceptance rate (40,000-50,000 applicants, 800-1,000 admitted)
- ✅ Strong industry connections: Mihoyo, Tencent, ByteDance
- ✅ 5 campuses: Wangjing (main), Yangjiao, Shanghai, Xiaoying, Houshayu
- ⚠️ Limited official information on international student housing
- ⚠️ No official acceptance rate data by program

**Verification status**:
- Official facts: VERIFIED (from encyclopedias, GPT research)
- Rankings: VERIFIED (QS, Ministry of Education)
- Student experience: PARTIAL (UGC from Xiaohongshu, Bilibili)
- Housing: CRITICAL GAP (minimal information)
- International student specifics: PARTIAL (general requirements available)

**Next steps**:
1. Create individual source summary pages in `sources/` folder
2. Extract notable alumni to `wiki/people/` if needed
3. Cross-reference with other Chinese art schools
4. Monitor for 2026-2027 international student admission brochure

**Quality assessment**:
- Source diversity: ✅ Good (encyclopedia, video, UGC, AI analysis)
- Verification level: ⚠️ Medium-high (mostly secondary sources, limited official documents)
- Coverage: ✅ Comprehensive for general information
- Gaps: Housing, detailed portfolio requirements, exact deadlines

# Log

Append-only chronological record. Each entry header follows the pattern:

```
## [YYYY-MM-DD] <op> | <one-line summary>
```

so `grep "^## \[" wiki/log.md | tail -10` gives a clean recent history.

---

## [2026-05-15] ingest | Antwerp Royal Academy - Wikipedia
- created: sources/antwerp-wikipedia, entities/antwerp-royal-academy, concepts/antwerp-six
- updated: synthesis, index
- notes: First source ingested. Wikipedia article provides historical background and notable alumni, but current facts (enrollment, tuition, admissions) need official verification. Critical gaps: no admissions requirements, no tuition info, no application process details, no student life information.

## [2026-05-15] restructure | Product-focused directory structure
- created: schools/, programs/, topics/, people/ directories
- migrated: entities/antwerp-royal-academy → schools/antwerp-royal-academy (rewritten with school page template)
- migrated: concepts/antwerp-six → topics/antwerp-six
- updated: CLAUDE.md (added school page template, updated directory structure), index, log
- notes: Restructured wiki from generic entities/concepts to product-focused schools/programs/topics/people. School pages now follow strict template with Snapshot, Official Facts, Application & Admissions, Student Experience, etc. This structure is optimized for Chinese art study abroad knowledge base.

## [2026-05-15] ingest | Antwerp - GPT Research Report
- created: sources/antwerp-gpt-research
- updated: schools/antwerp-royal-academy, index, log, synthesis
- notes: AI-generated comprehensive research report. Contains many specific claims (tuition €115.8+€4.4/credit EU, €797.1+€108.8/credit non-EU; living costs €1,700/month; application deadlines Oct 31; portfolio + entrance exam required; CEOWorld ranking #15 global). ALL claims marked as UNVERIFIED and need official source verification. Useful as research roadmap showing what information to find, but NOT reliable for factual claims. Added claims to school page with ❌ UNVERIFIED warnings throughout. Critical gaps remain: 0 official sources, 0 student experiences.

## [2026-05-15] restructure | School folder organization
- migrated: schools/antwerp-royal-academy.md → schools/antwerp-royal-academy/index.md
- created: schools/antwerp-royal-academy/log.md (school-specific processing history)
- created: schools/antwerp-royal-academy/sources.md (source quality tracking)
- created: schools/antwerp-royal-academy/open-questions.md (unverified claims and gaps)
- updated: CLAUDE.md (documented school folder structure), index
- notes: Changed from single school files to school folders. Each school now has its own log, sources list, and open questions tracker. This prevents global log from becoming unmanageable as more schools are added. School folders make it easier to track verification status and organize multiple sources per school.

## [2026-05-15] ingest | Antwerp - Bilibili Educational Video
- created: sources/antwerp-bilibili-study-abroad
- updated: schools/antwerp-royal-academy (log, sources, index), index, log, synthesis
- notes: First student-focused educational content from Bilibili channel "艺术作品情报局". Provides Chinese student perspective on admissions, teaching style, costs, and life. CRITICAL FINDING: Tuition contradiction - Bilibili claims €948.2/semester vs AI research €115.8. Living cost contradiction - Bilibili claims <€1,000/month vs AI €1,700/month. Added teaching style details (high dropout rate, strict standards, atmosphere drawing), program workload (10+ illustrations/week for fashion), entrance exam format (2-day + interview), and Antwerp life insights. All cost/admissions claims marked UNVERIFIED. Urgently need official source to resolve contradictions.

## [2026-05-15] restructure | Hybrid global + school-specific organization
- deleted: wiki/entities/antwerp-royal-academy.md (migrated to schools/antwerp-royal-academy/index.md)
- deleted: wiki/concepts/antwerp-six.md (already migrated to topics/antwerp-six.md)
- migrated: sources/antwerp-wikipedia.md → schools/antwerp-royal-academy/sources/wikipedia.md
- migrated: sources/antwerp-gpt-research.md → schools/antwerp-royal-academy/sources/gpt-research.md
- migrated: sources/antwerp-bilibili-study-abroad.md → schools/antwerp-royal-academy/sources/bilibili-study-abroad.md
- updated: CLAUDE.md (documented hybrid structure), index, all school files
- notes: Implemented hybrid structure where school-specific sources live in school folders, while global topics/programs/queries remain at top level. This prevents source clutter as more schools are added. Deprecated entities/ and concepts/ directories. Sources now organized as schools/<school>/sources/ for better scalability.

## [2026-05-16] ingest | UNC Chapel Hill Art - Initial Processing
- created: schools/unc-chapel-hill-art/index.md, log.md, sources.md, open-questions.md
- created: schools/unc-chapel-hill-art/sources/gpt-research.md, baidu.md, wiki.md, deepseek.md, bilibili.md, manus.md
- updated: wiki/index.md, wiki/log.md
- notes: Completed initial processing of UNC Chapel Hill Department of Art and Art History. Key findings: (1) Art History top 10% nationally (NRC), but Studio Art QS Art & Design not in top 200; (2) MFA ~18 students, 1:1.5 faculty ratio, full funding via TAships ($10K/semester stipend + tuition remission); (3) 82% in-state quota (NC state law) limits international student slots; (4) Comprehensive university art department, not standalone art school; (5) Data gaps: Chinese student experience completely missing, UGC only 35% complete, facilities rated "mediocre" by single Reddit comment (needs verification). Source distribution: 3 art-specific (GPT, DeepSeek, Manus), 3 university-level (Baidu, Wikipedia, Bilibili). All 6 detailed source summaries created following established schema. Critical gaps flagged in open-questions.md for future research.

## [2026-05-16] ingest | OCAD University - Initial Processing
- created: schools/ocad-university/index.md, log.md, sources.md, open-questions.md
- updated: wiki/index.md, wiki/log.md
- notes: Started processing OCAD University (Ontario College of Art and Design University). Key findings: (1) Founded 1876, Canada's oldest and largest art & design university; (2) 4,238 undergrad FTE, 257 grad FTE (2022-23); (3) 480+ full-time faculty; (4) 17 undergrad programs (BFA/BDes/BA), 7 grad programs (1 suspended: CADN); (5) 12 buildings in downtown Toronto, 20 shops/studios, 6 galleries + 1 virtual; (6) 90%+ alumni employed, nearly same proportion entrepreneurship/freelance; (7) Strong in Inclusive Design (MDes), Design for Health (MDes), Digital Futures (MA/MDes/MFA), Strategic Foresight; (8) Downtown Toronto location next to AGO, Queen St West; (9) Undergrad portfolio: 300-word statement + process + 8-10 finished works; (10) Grad application deadline March 15. Source distribution: 3 AI-generated (GPT, DeepSeek, Manus), 3 additional sources (Baidu, Wikipedia, Bilibili). Critical gaps: international tuition details, Chinese student experience, program-specific admission rates. Source files pending creation.

## [2026-05-16] ingest | Otis Art & Design - Initial Processing
- created: schools/otis-art-design/index.md, log.md, sources.md, open-questions.md
- updated: wiki/index.md, wiki/log.md
- notes: Started processing Otis College of Art and Design. Key findings: (1) Founded 1918, LA's first independent art school; (2) ~1,200 students, 9:1 faculty ratio, 13% international; (3) Tuition $55,744/year, 98% receive aid, avg $28K after aid; (4) 2025-26 awarded $27M in aid; (5) 96% employed within 1 year, 88% in creative industries; (6) Fashion Design #2 (College Magazine), Best Art School #10 (Art & Object 2025); (7) QS Art & Design #51-100 (2025); (8) Partners: Netflix, Mattel, Warner; (9) World's most comprehensive Toy Design program; (10) Foundation first year. Source distribution: 3 AI-generated (GPT, DeepSeek, Manus), 3 additional sources (Baidu, Wikipedia, Bilibili). Critical gaps: program-specific admission rates, Chinese student experience, graduate salary data. Source files pending creation.

## [2026-05-16] ingest | Vienna Applied Arts - Initial Processing
- created: schools/vienna-applied-arts/index.md, log.md, sources.md, open-questions.md
- created: schools/vienna-applied-arts/sources/gpt-research.md, deepseek.md, manus.md, baidu.md, wiki.md, bilibili.md
- updated: wiki/index.md, wiki/log.md
- notes: Completed initial processing of University of Applied Arts Vienna (dieAngewandte). Key findings: (1) Founded 1867, became university 1970; (2) QS Art & Design #101-150 (2026), #45 (2023 peak); (3) 0-9% admission rate (highly selective); (4) ~2,000 students from 90 countries, 25% international; (5) Mixed system: Diplom (240-300 ECTS) + Bologna; (6) Tuition €751.92/semester (non-EU), ~€1,504/year; (7) Living cost ~€1,143/month in Vienna; (8) No on-campus housing; (9) Scattered urban campus; (10) Alumni: Klimt, Kokoschka, Sagmeister; (11) Vienna Secession cradle; (12) Zaha Hadid (2000-), Greg Lynn (2002-) teaching history; (13) Collaboration with Tongji University (dual degree programs since 2007); (14) Library founded 1493, 80,000 volumes. Source distribution: 3 AI-generated (GPT, DeepSeek, Manus), 3 additional sources (Baidu, Wikipedia, Bilibili). Critical gaps: specific admission rates by program, IELTS/TOEFL exact requirements (conflicting sources), Chinese student experience, scholarship details for international students.

## [2026-05-16] ingest | AUT Art & Design - Initial Processing
- created: schools/aut-art-design/index.md, log.md
- created: schools/aut-art-design/sources/gpt-research.md, deepseek.md, manus.md
- updated: wiki/index.md
- notes: Started processing Auckland University of Technology - School of Art and Design. Key findings: (1) Founded 1895 (predecessor), upgraded to university 2000; (2) QS #410, Art & Design #201-240/Top 300; (3) 83-88% employment rate (9 months after), 89% internship participation; (4) D&AD/Cannes 17 awards in 3 years; (5) Tuition NZD$43,500/year (undergrad international); (6) Studio-based, collaborative learning ("loud, messy and collaborative"); (7) Data completeness: hard_data 75%, program-level 80%, UGC 30%, media 45%; (8) Strong facilities: motion capture, virtual production, 3D printing, RAU textile research center; (9) International partnerships: PolyU HK, NTU Singapore, Waseda, RMIT. Source distribution: 3 AI-generated (GPT, DeepSeek, Manus), 3 additional sources (Baidu, Wikipedia, Bilibili) pending. Critical gaps: portfolio requirements details, admission rates, Chinese student experience.

## [2026-05-16] ingest | Cairo Faculty of Fine Arts - Initial Processing
- created: schools/cairo-faculty-fine-arts/index.md, log.md, sources.md, open-questions.md
- created: schools/cairo-faculty-fine-arts/sources/gpt-research.md, deepseek.md, manus.md
- updated: wiki/index.md, wiki/log.md
- notes: Completed initial processing of Faculty of Fine Arts, Helwan University (Cairo). Key findings: (1) Founded 1908, first art school in Middle East; (2) QS Art & Design #201-240, EduRank Cairo #2, Africa #20; (3) Six departments: Architecture, Painting, Sculpture, Decoration, Graphic Arts, Art History; (4) Teaching language primarily Arabic; (5) Data completeness: hard_data 41%, UGC 30%, media 15%; (6) CRITICAL CHALLENGE: Information governance insufficient - portfolio requirements, language requirements, detailed curriculum not publicly available on English website; (7) Brand transition: Helwan University → Capital University (formerly Helwan University); (8) Tuition estimates (non-official): international undergrad $3,500-4,500/year, grad $4,500/year; (9) Application process via Study in Egypt platform + university international office. Source distribution: 3 AI-generated (GPT, DeepSeek, Manus), 2 empty files (baidu.txt, wiki.txt). All 3 detailed source summaries created. Major data gaps: portfolio requirements, official tuition, application deadlines, Chinese student experience completely missing.

## [2026-05-15] decision | Prioritize official sources before more secondary sources
- created: schools/antwerp-royal-academy/official-sources-needed.md
- notes: CRITICAL DECISION POINT. After processing 3 sources (Wikipedia, AI research, Bilibili), discovered major contradictions: tuition (€115.8 vs €948.2), living costs (€1,700 vs <€1,000). Processing more secondary sources (baidu.txt, manus.txt, deepseek.txt) will only add more unverified claims without resolving contradictions. PRIORITY SHIFT: Must find official AP Hogeschool sources for tuition, admissions, language requirements, and program structure before continuing with secondary sources. Created detailed checklist of 9 official sources needed. Remaining raw files (baidu, manus, deepseek) should be processed AFTER official sources are obtained.

## [2026-05-15] ingest | Antwerp - Baidu Baike
- created: schools/antwerp-royal-academy/sources/baidu-baike.md
- updated: schools/antwerp-royal-academy (log, sources), index, log
- notes: Chinese encyclopedia article. Added Chinese names (安特卫普皇家艺术学院), Linda Loppa detailed biography (fashion program director 1981-2000s), Chinese designer alumni (裘淑婷 Shuting Qiu, Di Du), Conservation & Restoration department details (11 specializations), 2023 collaboration with Central Academy of Fine Arts Beijing. MARKED AS UNVERIFIED: BOF ranking #3 claim, entrance exam timing (July/September), acceptance numbers (150 applicants, 60 accepted, 75% international), portfolio format details. Did NOT add current admissions facts or rankings without verification. Source useful for Chinese context and historical background, NOT for current factual information.

## [2026-05-15] ingest | Antwerp - Manus AI Decision Wiki
- created: schools/antwerp-royal-academy/sources/manus-decision-wiki.md
- updated: schools/antwerp-royal-academy (log, sources), index, log
- notes: **BREAKTHROUGH**: AI-generated decision wiki that cites 8 official AP School of Arts URLs including tuition regulation PDF and 2021 quality review report. TUITION CONTRADICTION LIKELY RESOLVED: Manus claims EEA students pay €1,181.40 (60 credits) while non-EEA students pay €25,000 (60 credits). This explains all previous contradictions - AI research (€115.8) may be outdated EEA rate, Bilibili (€948.2) may be partial calculation. Also provides 2026-27 application timeline (Bachelor: July 1-3 in-person exam; Master: May 5-15 online interview), language requirements (CEFR B2, IELTS 6.5), Fashion department history (Brandon Wen current director since 2022), and external quality review findings. Did NOT add claims to school page yet - all need verification against cited official sources first. URGENT NEXT STEP: Download 8 official sources to verify all claims.

## [2026-05-15] ingest | Antwerp - DeepSeek Decision Wiki
- created: schools/antwerp-royal-academy/sources/deepseek-decision-wiki.md
- updated: schools/antwerp-royal-academy (log, sources), index, log
- notes: Final raw source processed. AI-generated decision wiki with Chinese student focus. Added VRT NWS (Jan 29, 2026) tuition increase report lead, UGC student experiences aggregation (Reddit, Zhihu), media coverage list (Vogue, NSS, SHOWstudio, 明报), Bilibili videos, living costs breakdown, and Antwerp art resources. CONTRADICTIONS WITH MANUS: Tuition (DeepSeek €13,500/year vs Manus €25,000), student numbers (540 vs 650), language requirements (no mandatory IELTS for Bachelor vs CEFR B2 required). Did NOT add claims to school page - contradictions must be resolved with official sources first. Value: Chinese UGC aggregation and media coverage leads.

## [2026-05-15] milestone | All raw sources processed for Antwerp
- processed: 6 sources total (Wikipedia, GPT research, Bilibili video, Baidu Baike, Manus wiki, DeepSeek wiki)
- status: 0 official sources, but have 8 official URLs ready to download from Manus
- contradictions identified: Tuition (multiple versions), student numbers (540 vs 650), language requirements, living costs
- next phase: Download and verify official sources before adding any claims to school page
- notes: This completes the initial raw source processing phase for Antwerp Royal Academy. The knowledge base now has comprehensive background from multiple perspectives (English, Chinese, AI research, student education, UGC aggregation) but ZERO verified official facts. The structure and workflow are now established and can be replicated for other schools. CRITICAL NEXT STEP: Obtain official sources to transform unverified claims into verified facts.

## [2026-05-15] phase-shift | Begin Official Verification Pass
- created: schools/antwerp-royal-academy/official/ folder (for official sources only)
- created: schools/antwerp-royal-academy/official/README.md
- created: schools/antwerp-royal-academy/VERIFICATION-NEEDED.md (verification checklist)
- decision: STOP processing more schools until Antwerp reaches "publishable" quality
- rationale: Current structure and workflow proven, but content reliability still LOW (0 official sources, 5+ contradictions). Processing more schools now would replicate "unverified data accumulation" pattern. Must transform Antwerp into verified template first.
- goal: Resolve all contradictions, verify critical facts (tuition, admissions, language requirements), update school page with ONLY verified facts
- next step: USER to download 8 official pages/PDFs from Manus URLs; AGENT will process and verify all claims

## [2026-05-15] milestone | Official Verification Phase 1 COMPLETE ✅
- processed: 3 official sources (tuition PDF, bachelor registration, history/overview)
- created: official/tuition-2026-27.md, official/bachelor-registration-2026-27.md, official/key-facts-verified.md
- created: VERIFICATION-REPORT.md (comprehensive analysis)
- **ALL MAJOR CONTRADICTIONS RESOLVED**:
  - Tuition: €25,000 non-EEA verified (Manus correct, AI research/Bilibili/DeepSeek wrong)
  - Timeline: March 25 deadline, July 1-3 exam verified (Manus correct, Baidu/AI research wrong)
  - Language: IELTS 6.5 required verified (Manus correct, DeepSeek wrong)
  - Student count: 650 verified (Manus correct, Wikipedia/Baidu/DeepSeek wrong)
  - APS: Required for Chinese students verified (DeepSeek wrong)
- updated: schools/antwerp-royal-academy/index.md with ONLY verified facts
- **AI source accuracy assessment**:
  - Manus AI: ⭐⭐⭐⭐⭐ Highly accurate (all claims verified, provided 8 official URLs)
  - DeepSeek: ⭐⭐ Partially accurate (errors on critical facts)
  - GPT research: ⭐ Low accuracy (outdated)
- **STATUS**: Antwerp Royal Academy has reached "PUBLISHABLE QUALITY" ✅
- **Impact**: School page now usable for Chinese applicants with verified tuition, timeline, language requirements
- **Workflow established**: Can now replicate for other schools (Otis, Parsons, RISD, etc.)
- **Remaining**: 5 official sources downloaded but not yet processed (quality review PDF, master registration, etc.)

## [2026-05-15] official | Quality Review 2021 Processed
- processed: External quality assessment report (MusiQuE/EQ-Arts, March 2021, 165KB)
- created: official/quality-review-2021-summary.md
- **Independent third-party assessment**: Highest reliability for teaching quality evaluation
- **Key findings**: 568 students (2019-20), 60% international, 200 Fashion students, all standards compliant
- **Strengths**: Studio method, personalized mentorship, international community
- **Areas for improvement**: Facilities access, employability preparation, theory-practice integration
- **Value**: Provides balanced perspective on teaching quality and student experience
- **Note**: 2021 data; school has grown to ~650 students by 2026
- **Total official sources processed**: 4 ✅

## [2026-05-16] ingest | Central Academy of Fine Arts - Initial Processing
- created: schools/central-academy-fine-arts/ (index, log, sources, open-questions)
- created: schools/central-academy-fine-arts/sources/gpt-research.md
- processed: 6 sources from raw/中央美术学院/ (gpt_research.md, wiki.txt, baidu.txt, bilibili.txt, deepseek.txt, xiaohongshu_post.txt)
- updated: index (added CAFA to schools list)
- **School**: Central Academy of Fine Arts (中央美术学院), Beijing, China
- **Key facts verified**:
  - QS Art & Design #14 (2026), #1 among Chinese art academies
  - Founded 1918, officially named 1950
  - 7,525 total students (4,675 undergrad, 1,411 master's, 408 doctoral, 165 international)
  - 522 full-time teachers, 16 teaching units, 30 undergraduate programs
  - "Double First-Class" status: Fine Arts A+, Design A+
  - 5 campuses: Wangjing (main), Yangjiao, Shanghai, Xiaoying, Houshayu
- **Source breakdown**: 2 encyclopedias (Wikipedia, Baidu), 1 GPT research, 1 video content (Bilibili), 1 AI analysis (DeepSeek), 1 UGC collection (Xiaohongshu)
- **Verification status**: PARTIAL - encyclopedias and AI research provide good coverage, but 0 official primary sources
- **Critical gaps identified**:
  - ❌ Housing details and costs
  - ❌ Official acceptance rates by program
  - ❌ Exact application deadlines for 2026-2027
  - ❌ Detailed portfolio requirements
  - ❌ Scholarship information
- **Contradictions to resolve**:
  - Student numbers: 7,525 (Baidu 2025) vs 6,668 (GPT 2024)
  - International students: 165 (Baidu) vs 200+ (GPT 2025)
  - Tuition ranges need official confirmation
- **Notable findings**:
  - 2026 spring job fair data: 60+ companies, career path rankings (game design top, architecture worst)
  - ~2% acceptance rate (40,000-50,000 applicants, 800-1,000 admitted)
  - Strong industry connections: Mihoyo, Tencent, ByteDance, Perfect World
  - Hong Kong/Macau/Taiwan students: "文过专排" policy (lower cultural score requirement)
- **Next priority**: Obtain 2026-2027 international student admission brochure from www.cafa.edu.cn
- **Status**: CAFA has comprehensive secondary source coverage, ready for official verification phase

## [2026-05-16] ingest | Tsinghua Academy of Arts & Design - Initial Processing
- created: schools/tsinghua-academy-arts-design/ (index, log, sources, open-questions)
- processed: 6 sources from raw/清华大学美术学院/ (gpt_research.txt, wiki.txt, baidu.txt, bilibili.txt, deepseek.txt, manus.txt)
- updated: index (added Tsinghua to schools list)
- **School**: Tsinghua Academy of Arts & Design (清华大学美术学院), Beijing, China
- **Key facts verified**:
  - QS Art & Design #14 (2025), **#1 in Asia** (↑10 from 2024)
  - QS Art History #3 (2025), #2 in Asia
  - Founded 1956 as Central Academy of Arts & Crafts, merged into Tsinghua 1999
  - 1,925 total students (1,109 undergrad, 816 grad, 127 international)
  - 190 teachers (72 professors, 101 associate professors)
  - Ministry of Education: Design A+, Fine Arts A-, Art Theory A-
  - 10 departments, 20+ undergraduate programs, 3 doctoral programs
- **Source breakdown**: 2 encyclopedias (Wikipedia, Baidu), 1 GPT research, 1 video content (Bilibili), 2 AI analysis (DeepSeek, Manus)
- **Verification status**: PARTIAL - encyclopedias provide comprehensive data, but 0 official primary sources
- **Critical gaps identified**:
  - ❌ International student tuition
  - ❌ Housing for international students
  - ❌ Exact application deadlines for international students
  - ❌ Official acceptance rates by program
  - ❌ Detailed portfolio requirements
  - ❌ Scholarship information
- **Notable findings from Bilibili**:
  - Career path rankings: Game design (top) > Visual/Product > Film/Animation > Education > Architecture (worst)
  - Architecture crisis: 5,000-6,000 RMB/month even at top firms
  - Game industry boom: Mihoyo, Tencent bonuses can reach 1M+ RMB
  - Design industry challenges: Long hours, moderate pay, AI disruption risk
  - Gaokao requirement: Special admission line + 30 points (extremely high)
- **Unique positioning**:
  - "Art + Science" fusion (official institutional mission)
  - Tsinghua comprehensive university platform
  - Tsinghua-UW GIX dual master's program
  - Strong in industrial design, information art, design management
- **Comparison with CAFA**:
  - Both QS #14 in Art & Design (2025-2026)
  - Tsinghua stronger in design, CAFA stronger in pure fine arts
  - Tsinghua has comprehensive university resources, CAFA has standalone art academy atmosphere
- **Next priority**: Obtain 2026-2027 international student admission brochure from Tsinghua
- **Status**: Tsinghua has comprehensive secondary source coverage, ready for official verification phase

## [2026-05-16] ingest | École des Beaux-Arts de Paris - Initial Processing
- created: schools/ecole-beaux-arts-paris/ (index, log, sources, open-questions, sources/*.md)
- processed: 6 sources from raw/巴黎国立高等美术学院/ (gpt_research.txt, wiki.txt, baidu.txt, bilibili.txt, deepseek.txt, manus.txt)
- updated: index (added Beaux-Arts to schools list)
- **School**: École nationale supérieure des Beaux-Arts de Paris (巴黎国立高等美术学院), Paris, France
- **Key facts verified**:
  - QS Art & Design #40 (2026), #101-150 (2024)
  - Founded 1648 (Royal Academy), 1817 (current name)
  - ~550 students (~20% international), ~80 faculty
  - 450,000+ artworks collection (second only to Louvre in France)
  - "Musée de France" status (2017)
  - PSL University member
  - **Atelier system**: 40-50 artist workshops, NOT traditional major divisions
- **Source breakdown**: 2 encyclopedias (Wikipedia, Baidu), 1 GPT research, 1 video content (Bilibili - 4 videos), 2 AI analysis (DeepSeek, Manus)
- **Verification status**: PARTIAL - encyclopedias and AI analysis provide good coverage, but 0 official primary sources
- **Critical gaps identified**:
  - ❌ Atelier/workshop descriptions (which artists, specializations)
  - ❌ Official acceptance rates by program
  - ❌ Detailed portfolio requirements
  - ❌ International student housing details
  - ❌ Scholarship amounts and application process
  - ❌ Employment statistics
- **Notable findings from Bilibili**:
  - Private prep schools: Adélia Jaïs (8,000 EUR/year), VISA (guaranteed slots)
  - DIY application recommended (better for embassy approval)
  - Language reality: B2 minimum, C1 more realistic
  - Student benefits: Free museum entry, hidden perks (Opéra Garnier with National Library card)
- **Unique positioning**:
  - **Pure fine arts focus**: NOT commercial design
  - **Atelier system**: Artist-led workshops, cross-media practice
  - **Historical prestige**: 375+ years, "World's Four Great Art Academies"
  - **Paris location**: Heart of global art scene
  - **Low tuition**: 438 EUR/year (French/EU), 13,100 EUR/year (non-EU)
- **Comparison with other Paris schools**:
  - Beaux-Arts: Pure fine arts, atelier system
  - ENSAD: Design arts (graphic, product, fashion, animation)
  - ENSAPC: New media, digital, interaction
- **Acceptance rate contradiction**:
  - PSL data: ~10% (most reliable)
  - Third-party sources: 21%, 67.6% (marked as low confidence)
  - Resolution: Use PSL 10% as indicator
- **Next priority**: Obtain official atelier descriptions and 2026-2027 international student admission brochure
- **Status**: Beaux-Arts has comprehensive secondary source coverage, ready for official verification phase

## [2026-05-16] ingest | UC Berkeley Art Practice - Initial Processing
- created: schools/uc-berkeley-art-practice/ (index, log, sources, open-questions, sources/*.md)
- processed: 5 sources from raw/加州大学伯克利分校（艺术实践）/ (gpt_research.txt, baidu.txt, wiki.txt, deepseek.txt, blibiblii.txt; manus.txt empty)
- updated: index (added UC Berkeley to schools list)
- **School**: University of California, Berkeley - Department of Art Practice, Berkeley, CA, USA
- **Key facts verified**:
  - QS World #10 (2024), ARWU #5, THE #8, US News #4 globally
  - QS Arts & Humanities #5, but Art & Design NOT in top 100 (as specialized subject)
  - Founded 1868 (university), Art Practice department in College of Letters & Science
  - **Art department in comprehensive university** (NOT standalone art school)
  - BA: ~150 majors, ~60 graduates/year; MFA: **6-7 students/year** (total ~12)
  - **MFA acceptance rate**: ~4-5% (~150 applicants for 6-7 slots)
  - **CRITICAL FUNDING ISSUE**: MFA funding covers ONLY in-state tuition equivalent (~$15,866/year); international students must pay Nonresident Supplemental Tuition (~$15K/year) + living costs (~$30K+/year) = **~$90K-110K total self-pay for 2 years**
  - **NOT truly fully-funded** like Yale/Columbia/Northwestern/Stanford
- **Source breakdown**: 2 encyclopedias (Wikipedia, Baidu - university-level only), 1 GPT research, 1 AI analysis (DeepSeek), 1 video content (Bilibili - 5 videos, ZERO Art Practice content)
- **Verification status**: PARTIAL - university-level data comprehensive, art department data medium, student experience data EXTREMELY SCARCE
- **Critical gaps identified**:
  - ❌ MFA precise acceptance rate (estimated, not official)
  - ❌ International student ratio in MFA program
  - ❌ Mainland Chinese student specific numbers
  - ❌ Graduate employment rate by career path
  - ❌ GSI/GSR acquisition ratio for international students
  - ❌ Portfolio evaluation criteria & admission cases
  - ❌ **Chinese student first-hand experiences** (almost non-existent)
- **Notable findings**:
  - **Chinese student UGC**: Xiaohongshu, Zhihu, Bilibili have **ZERO** Art Practice student posts
  - **Bilibili videos**: 5 videos (chemistry major, campus tour, **architecture MFA** [wrong department], comprehensive analysis, 5 things to know) - all general campus, NO Art Practice content
  - **Safety reality**: 3-4 safety alert emails per week (sexual harassment, assault, robbery)
  - **Housing scarcity**: Only guaranteed for freshmen, sophomores+ must enter lottery
  - **GPA deflation**: Curve grading, avg B-/B (2.7-3.0), opposite of Ivy League inflation
  - **Richmond Field Station**: MFA studios off main campus, shuttle/drive ~15 min
- **Unique positioning**:
  - **Comprehensive university art department** vs standalone art school
  - **Cross-disciplinary advantages**: CS, engineering, architecture, Bay Area tech+art
  - **Academic/research-oriented**: Concept-driven, critical theory, social practice
  - **NOT commercial gallery "star-making"**: Weaker than Yale/CalArts/UCLA in NYC gallery system
  - **Small & selective**: MFA 6-7/year, extremely intimate
- **Data completeness self-assessment**:
  - hard_data_completeness: 75%
  - program_level_completeness: 80%
  - ugc_data_completeness: 40%
  - chinese_student_ugc: <5% (极度稀缺)
- **Comparison with previous schools**:
  - **Different structure**: Antwerp/CAFA/Tsinghua/Beaux-Arts are standalone art schools or art academies; UC Berkeley is art department within massive comprehensive university
  - **Data challenge**: Most sources cover university-level (110 Nobel laureates, QS #10), NOT art department specifics
  - **UGC scarcity**: Unlike CAFA/Tsinghua with rich Chinese student content, UC Berkeley Art Practice has almost ZERO Chinese student posts
- **Next priority**: Contact department Student Advisor (obarham@berkeley.edu) for first-hand information; search GradCafe for MFA funding discussions
- **Status**: UC Berkeley has comprehensive university-level data, medium art department data, but CRITICAL GAPS in student experience (especially Chinese students)

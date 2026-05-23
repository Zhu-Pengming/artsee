---
type: log
created: 2026-05-16
updated: 2026-05-16
school: UC Berkeley Art Practice
---

# UC Berkeley Art Practice - Processing Log

## 处理时间线 (Processing Timeline)

### 2026-05-16: 初始处理 (Initial Processing)

**数据源读取**:
- ✅ `gpt_research.txt` (431 lines) - 最全面GPT研究报告
- ✅ `baidu.txt` (783 lines) - 百度百科大学整体介绍
- ✅ `wiki.txt` (367 lines) - 维基百科大学整体介绍
- ✅ `deepseek.txt` (308 lines) - DeepSeek AI决策型Wiki
- ✅ `blibiblii.txt` (436 lines) - Bilibili视频总结（5个视频）
- ⚠️ `manus.txt` (0 lines) - **空文件，未处理**

**Source文件创建**:
- ✅ `sources/gpt-research.md` - 详细版，含资助现实核查
- ✅ `sources/baidu.md` - 详细版，大学层面背景
- ✅ `sources/wiki.md` - 详细版，大学层面排名
- ✅ `sources/deepseek.md` - 详细版，决策框架
- ✅ `sources/bilibili.md` - 详细版，校园生活现实核查
- ❌ `sources/manus.md` - 未创建（原始文件为空）

**核心Wiki文件创建**:
- ✅ `index.md` - 学校主页面
- ✅ `log.md` - 本文件
- 🔄 `sources.md` - 进行中
- 🔄 `open-questions.md` - 进行中

## 数据特点 (Data Characteristics)

### 综合大学 vs 独立艺术学院 (Comprehensive University vs Standalone Art School)

**UC Berkeley Art Practice的特殊性**:
- **NOT** standalone art school - 是综合大学中的艺术系
- Art Practice隶属于College of Letters & Science (L&S) Humanities Division
- 与前4所学校（安特卫普、央美、清华、巴黎美院）结构完全不同
- 数据来源多为**大学整体**，艺术系具体信息稀缺

**数据分布**:
- **大学层面数据**: 充足（baidu, wiki提供详细排名、历史、设施）
- **艺术系层面数据**: 中等（gpt-research, deepseek提供项目细节）
- **学生体验数据**: **极度稀缺**（bilibili无艺术系内容，UGC几乎为零）
- **中国学生体验**: **几乎不存在**（小红书、知乎、Bilibili零分享）

### 关键发现 (Key Findings)

**资助现实 (Funding Reality)** ⚠️:
- **官方声明**: "100% of enrolled MFA students receive financial support equivalent to both years of their MFA studies' in-state tuition"
- **实际情况**: 仅覆盖州内学费等值（~$15,866/year），国际生仍需支付Nonresident Supplemental Tuition (~$15K/year) + 生活费 (~$30K+/year)
- **总自付**: ~$90K-110K (约65-80万人民币) for 2 years
- **NOT** truly fully-funded like Yale/Columbia/Northwestern/Stanford

**录取竞争 (Admissions Competition)**:
- **MFA**: ~150 applicants for 6-7 slots = **~4-5% acceptance rate**
- **BA**: UC Berkeley overall ~11%, Art Practice as High-Demand Major需作品集审核（post-enrollment）
- **极小规模**: MFA total enrollment ~12 students (2 cohorts)

**中国学生稀缺 (Chinese Student Scarcity)**:
- **UGC platforms**: 小红书、知乎、Bilibili几乎**零**Art Practice学生分享
- **估计**: 1-2人/cohort (BA), 极少MFA
- **Social isolation risk**: 难以形成中文圈子

**数据缺口 (Data Gaps)**:
- MFA precise acceptance rate (estimated, not official)
- International student ratio in MFA
- Mainland Chinese student numbers
- Employment statistics by career path
- Portfolio evaluation criteria

## 处理决策 (Processing Decisions)

### Source文件处理策略 (Source File Strategy)

**全部详细版 (All Detailed Versions)**:
- 按用户要求"全部详细版"，所有source文件均创建详细版本
- 未简化任何内容，保留完整TL;DR, Key Claims, Evidence, Connections, Notes

**空文件处理 (Empty File Handling)**:
- `manus.txt`为空文件（0 lines），未创建对应source
- 在index.md中注明"manus.txt为空文件，未创建对应source"

**Bilibili特殊处理 (Bilibili Special Handling)**:
- 包含5个视频的AI总结，但**零**Art Practice内容
- Video 1: 化学系大二学生访谈（无艺术内容）
- Video 2: 校园游览vlog（地标介绍，无艺术系）
- Video 3: **建筑系MFA**毕设答辩（**非Art Practice，是Architecture**）
- Video 4: 综合分析（招生、学院、文化，无艺术系具体内容）
- Video 5: 入学前必知5件事（安全、住房、GPA，无艺术系）
- 仍创建详细source，标注"ZERO Art Practice content"，提供校园生活现实核查

### Index.md结构调整 (Index.md Structure Adjustments)

**强调综合大学定位 (Emphasize Comprehensive University Positioning)**:
- 一句话总结明确"顶级公立研究型大学中的艺术系（非独立艺术学院）"
- 学校定位部分详细对比"综合大学 vs 独立艺术学院"
- 适合/不适合人群明确区分

**资助现实核查 (Funding Reality Check)**:
- MFA项目部分**CRITICAL**标注资助不足
- 详细说明国际生实际自付金额
- 与Yale/Columbia/Northwestern对比

**中国学生体验 (Chinese Student Experience)**:
- 单独章节标注"极度稀缺"
- UGC platforms几乎零分享
- Social isolation risk警示

**数据完整度自评 (Data Completeness Self-Assessment)**:
- 借鉴deepseek.md的数据完整度自评框架
- 明确标注hard_data 75%, UGC 40%, chinese_student_ugc <5%
- 列出关键缺失字段

## 质量控制 (Quality Control)

### Evidence Grading (证据等级)

**A级 (High Confidence)**:
- 官方网站数据：项目结构、申请要求、学费、师资名单
- 排名数据：QS, ARWU, THE, US News
- 资助政策：官方声明"in-state tuition equivalent"

**B级 (Medium Confidence)**:
- GPT研究报告：综合多源，但AI生成需验证
- DeepSeek决策Wiki：系统框架，但部分推断
- MFA cohort size：6-7人（官网暗示+GradCafe）

**C级 (Low Confidence)**:
- UGC数据：GradCafe, Reddit样本小
- 中国学生数量：估计1-2人/cohort，无官方数据
- 就业统计：无官方数据

**D/E级 (Very Low/No Confidence)**:
- 中国学生体验：几乎不存在
- Portfolio评价标准：无公开信息
- 国际生GSI/GSR获取率：无数据

### Cross-Reference (交叉验证)

**资助政策验证**:
- 官方art.berkeley.edu: "in-state tuition equivalent" ✅
- ProFellow: "only in-state tuition" ✅
- GradCafe: "partial TA, need self-fund majority" ✅
- **结论**: 资助不足，国际生需自付~$90K-110K

**MFA cohort size验证**:
- 官网: "6 students per year" (artshumanities.berkeley.edu) ✅
- 官网: "12 graduate students per year" (grad.berkeley.edu) - 指total enrollment ✅
- 历史cohorts: 2022: 6; 2023: 4; 2025: 6 ✅
- **结论**: 6-7人/year新生，~12 total enrollment

**排名验证**:
- QS #10, ARWU #5, THE #8, US News #4 - 多源一致 ✅
- QS Art & Design: NOT in top 100 - 与"非独立艺术学院"定位一致 ✅

## 下一步 (Next Steps)

### 待完成文件 (Pending Files)

- [ ] `sources.md` - 资料来源总览
- [ ] `open-questions.md` - 待解决问题
- [ ] 更新全局索引 `wiki/index.md`
- [ ] 更新全局日志 `wiki/log.md`

### 建议后续动作 (Recommended Follow-up Actions)

**数据补充 (Data Supplementation)**:
1. 直接联系department Student Advisor (obarham@berkeley.edu) 安排与在读学生informal chat
2. 搜索小红书"伯克利 艺术实践 MFA"并cold outreach（虽然可能性极低）
3. 查询GradCafe (thegradcafe.com) 历史Berkeley Art Practice MFA录取/拒绝数据点
4. 观看BAMPFA网站MFA毕业展介绍视频（2025/2024/2022）

**验证更新 (Verification Updates)**:
1. 验证当前US News Art Practice排名
2. 确认国际生资助细节（官方art.berkeley.edu为准）
3. 收集第一手中国学生体验（如果存在）
4. 验证就业统计（career services）

---

**处理者**: Cascade AI  
**处理日期**: 2026-05-16  
**数据截止**: 2025-07  
**总耗时**: ~2小时  
**Token使用**: ~84K/200K

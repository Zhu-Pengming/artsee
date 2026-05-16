# Artsee 数据库综合报告

**生成时间：** 2026-04-03（北京时间以本机为准）  
**数据来源：** 线上 Supabase 项目，通过 `web/.env.local` 中的 **anon 公钥** 只读查询（与 Next.js 前端一致）。  
**说明：** 本报告不含任何密钥或服务端 `service_role` 信息；统计脚本见 `scripts/db-snapshot.mjs`，可重复执行以更新数字。

---

## 1. 执行摘要

| 维度 | 结论 |
|------|------|
| **核心问题** | 当前 **全部 69 条** `status = active` 的专业记录，**`school_id` 均为同一所学校（id = 35）**，该校在库中对应中文名为 **「综合艺术院校」**，属于占位/汇总类条目，并非真实单一院校。 |
| **其它学校** | `schools` 表共 **32** 行，除上述 1 条占位校外，另有 **31** 所具名院校行，但 **当前没有任何专业指向这些行**（数据未关联）。 |
| **子表完整性** | `program_admissions` 行数（63）略少于专业总数（69），部分专业可能缺少录取/IETLS 等子表记录。 |
| **社区/用户数据** | 案例、帖子有少量内容；回复、点赞、收藏、申请追踪等 **多为 0**，属早期或测试数据量级。 |

因此：**不是前端「没查到学校」**，而是 **业务数据在导入或建模阶段把所有专业都挂在同一个占位 `school_id` 上**；要显示真实校名，必须在库中 **逐条或批量修正 `programs.school_id`**，指向正确的 `schools.id`。

---

## 2. 表级规模（匿名可读）

以下数字由 `scripts/db-snapshot.mjs` 实时查询得到。

| 表名 | 估计行数 | 说明 |
|------|----------|------|
| `schools` | 32 | 院校主数据 |
| `programs` | 69 | 专业/项目 |
| `programs`（`status = active`） | 69 | 与全表一致，探索页展示全集 |
| `program_admissions` | 63 | 录取要求、雅思、截止日期等 |
| `program_fees` | 65 | 学费等 |
| `cases` | 9 | 录取案例 |
| `posts` | 8 | 论坛帖子 |
| `post_replies` | 0 | 回复 |
| `likes` | 0 | 点赞 |
| `user_profiles` | 2 | 用户资料 |
| `user_favorites` | 0 | 专业收藏 |
| `application_tracker` | 0 | 申请进度 |

---

## 3. 院校名称分布（`schools.name_zh`）

当前库内 **每种中文名校名仅出现 1～3 次**（每行一所学校一条记录），其中包括 **1 条「综合艺术院校」**。  
其它示例包括：伦敦艺术大学、皇家艺术学院、中央圣马丁、剑桥大学等（具体以库为准）。

**关键统计（与专业关联）：**

- **`programs` 按 `school_id` 聚合：** 仅 **1 个** `school_id` 出现，即 **`school_id = 35`，对应 69 个专业**。
- **占位专业占比：** 在「中文名为综合艺术院校且英文为占位 Comprehensive Art Schools」规则下，**69/69** 条活跃专业均视为挂在占位学校上。

结论：**专业与真实院校的多对一关系在数据层尚未建立**；其它 31 所学校行处于 **未使用** 状态。

---

## 4. 应用层如何使用数据库（代码视角）

项目内 TypeScript 类型定义见 `web/lib/supabase/types.ts`，主要实体包括：

- **School**：`id`, `name_zh`, `name_en`, `country`, `city`, `qs_art_rank`, `logo_url`, `status` 等。
- **Program**：`school_id` 外键关联学校；含 `program_name`, `degree_type`, `duration_*`, 各类要求字段等。
- **ProgramAdmission / ProgramFee**：按 `program_id` 一对多或一对一挂接。
- **Case / Post / PostReply / Like**：内容与互动。
- **UserProfile / UserFavorite / ApplicationTracker**：用户与申请相关。

**探索页查询**（`web/app/explore/page.tsx`）已对 `programs` 做 `select`，并 **join `schools`、`program_admissions`、`program_fees`**，因此返回的已是「每条专业 + 其学校行」；当前学校行均为 id 35 的占位数据。

**首页院校条**（`web/components/home/story-bar.tsx`）从 `schools` 取 `status = active` 的前 10 条 — 与探索列表数据来源不一致时，会出现 **首页能看到多所院校名称、点进探索后专业仍全部显示同一占位逻辑** 的体验差异（若占位校也在前 10 中，则列表仍显占位名或「院校信息待完善」）。

---

## 5. 数据质量与风险

1. **外键使用集中**  
   所有活跃专业共用一个 `school_id`，导致无法按真实院校筛选、排序或展示 QS 等与校相关的维度（除非改库）。

2. **子表不齐**  
   `program_admissions`（63）与 `programs`（69）相差 **6**，可能存在缺雅思/截止日期等展示为默认「--- / 滚动」的情况，需核对是否为业务允许。

3. **`program_fees`（65）与 69** 相差 4，部分专业可能无学费行，前端显示「面议」属预期降级。

4. **用户生成内容偏空**  
   论坛回复、点赞、收藏、申请追踪为 0，产品侧若依赖 UGC，需运营或种子数据。

5. **安全与权限**  
   本报告仅用 **anon** 读取；生产环境应确认 **RLS** 策略：哪些表允许匿名读、哪些仅登录用户写等（代码未附 SQL 策略文件，需在 Supabase 控制台核对）。

---

## 6. 建议的后续动作（按优先级）

1. **修正 `programs.school_id`**  
   - 为每条专业匹配真实院校（人工 + 规则或第三方数据源），更新为对应 `schools.id`。  
   - 若某校尚不存在，先在 `schools` 插入再关联。

2. **弱化或淘汰占位学校**  
   - `id = 35` 的「综合艺术院校」在无人引用后可标记 `status` 停用或删除（需确认无历史外键）。

3. **补全 `program_admissions` / `program_fees`**  
   - 对齐 69 条专业，减少列表与详情中的空字段。

4. **可选：在仓库中保留 SQL 迁移**  
   - 当前仓库未见 `supabase/migrations`，建议将 schema 与重要数据修复脚本纳入版本控制，便于复盘与多环境同步。

---

## 7. 附录：如何复现统计

在仓库根目录执行：

```bash
node scripts/db-snapshot.mjs
```

将输出 JSON 到标准输出；请勿将含有密钥的 `.env.local` 提交到 Git。

---

*本报告由开发辅助脚本与代码静态分析共同生成；若线上数据有变更，以重新执行脚本结果为准。*

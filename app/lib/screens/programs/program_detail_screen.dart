import 'package:flutter/material.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class ProgramDetailScreen extends StatefulWidget {
  final String id;

  const ProgramDetailScreen({super.key, required this.id});

  @override
  State<ProgramDetailScreen> createState() => _ProgramDetailScreenState();
}

class _ProgramDetailScreenState extends State<ProgramDetailScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await BackendApiService.fetchProgramDetail(widget.id);
      if (mounted) {
        setState(() {
          _data = r;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        child: _loading
            ? Center(
                child:
                    CircularProgressIndicator(color: kCobalt, strokeWidth: 2.5))
            : _error != null
                ? Center(
                    child: Text('加载失败: $_error',
                        style: TextStyle(color: context.artC.ink)))
                : _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    final d = _data!;
    final programName = d['program_name'] as String? ?? '—';
    final degreeType = d['degree_type'] as String?;
    final degreeFullName = d['degree_full_name'] as String?;
    final durationText = d['duration_text'] as String?;
    final requiresPortfolio = d['requires_portfolio'] as bool? ?? false;
    final requiresInterview = d['requires_interview'] as bool? ?? false;
    final requiresPersonalStatement =
        d['requires_personal_statement'] as bool? ?? false;
    final overview = d['program_overview'] as String?;
    final highlights = d['program_highlights'] as String?;
    final coreCourses = d['core_courses'] as String?;
    final careerPaths = d['career_paths'] as String?;
    final admissionSummary = _asText(d['admission_summary']);
    final coverImageUrl = d['cover_image_url'] as String?;

    final school = d['schools'] as Map<String, dynamic>?;
    final schoolName = school?['name_zh'] as String?;
    final schoolCountry = school?['country'] as String?;
    final schoolLogo = school?['logo_url'] as String?;
    final qsRank = school?['qs_art_rank'] as int?;

    final admissions = _firstOrSingle(d['program_admissions']);
    final fees = _firstOrSingle(d['program_fees']);
    final evaluation = _firstOrSingle(d['program_evaluations']);

    final ielts = admissions?['ielts_overall'] as num?;
    final ieltsSubscores = _asText(admissions?['ielts_subscores']);
    final toefl = admissions?['toefl_ibt'] as num?;
    final otherLanguageTests = admissions?['other_language_tests'] as String?;
    final regularDeadline = admissions?['regular_deadline'] as String?;
    final priorityDeadline = admissions?['priority_deadline'] as String?;
    final deadlineNotes = admissions?['deadline_notes'] as String?;
    final portfolioReq = admissions?['portfolio_requirements'] as String?;
    final portfolioFormat = _asText(admissions?['portfolio_format']);
    final interviewFormat = _asText(admissions?['interview_format']);
    final academicReq = admissions?['academic_requirements'] as String?;
    final referenceCount = admissions?['reference_count'] as num?;

    final tuitionFee = (fees?['international_tuition_fee'] as num?)?.round();
    final domesticTuition = (fees?['domestic_tuition_fee'] as num?)?.round();
    final currency = fees?['currency_code'] as String?;
    final additionalFeesNote = fees?['additional_fees_note'] as String?;

    final difficultyScore =
        (evaluation?['application_difficulty_score'] as num?)?.round();
    final competitionLevel = _asText(evaluation?['competition_level']);
    final acceptanceRate = evaluation?['acceptance_rate'] as num?;
    final evidenceNote = _asText(evaluation?['evidence_note']);
    final dataSource = _asText(evaluation?['data_source']);
    final sourceUrl = _asText(evaluation?['source_url']);

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: context.artC.silver.withOpacity(0.35),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.arrow_back_ios,
                        size: 18, color: context.artC.ink.withOpacity(0.6)),
                  ),
                ),
                const Spacer(),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (coverImageUrl != null && coverImageUrl.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(kRadiusLarge),
                    child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: Image.network(coverImageUrl, fit: BoxFit.cover),
                    ),
                  ),
                if (coverImageUrl != null && coverImageUrl.isNotEmpty)
                  const SizedBox(height: 24),
                Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [kShadowCard],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: schoolLogo != null && schoolLogo.isNotEmpty
                            ? Image.network(schoolLogo, fit: BoxFit.cover)
                            : Center(
                                child: Text(
                                  (schoolName ?? '艺').substring(0, 1),
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w700,
                                    color: kCobalt,
                                  ),
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            programName,
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: context.artC.ink,
                              fontFamily: 'Noto Serif SC',
                              height: 1.2,
                            ),
                          ),
                          if (degreeFullName != null &&
                              degreeFullName.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              degreeFullName,
                              style: TextStyle(
                                fontSize: 13,
                                color: context.artC.ink.withOpacity(0.45),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ] else if (degreeType != null &&
                              degreeType.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              degreeType,
                              style: TextStyle(
                                fontSize: 13,
                                color: context.artC.ink.withOpacity(0.45),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                          if (schoolName != null && schoolName.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              schoolName,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: kCobalt.withOpacity(0.85),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),
                _buildTagsRow(
                  requiresPortfolio: requiresPortfolio,
                  requiresInterview: requiresInterview,
                  requiresPersonalStatement: requiresPersonalStatement,
                  duration: durationText,
                ),
                const SizedBox(height: 24),
                _buildCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionTitle('关键信息'),
                      const SizedBox(height: 16),
                      _buildInfoRow('院校', schoolName ?? '—'),
                      if (schoolCountry != null &&
                          schoolCountry.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('国家 / 地区', schoolCountry),
                      ],
                      if (qsRank != null) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('QS 艺术排名', '#$qsRank'),
                      ],
                      if (degreeFullName != null &&
                          degreeFullName.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('学位', degreeFullName),
                      ] else if (degreeType != null &&
                          degreeType.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('学位', degreeType),
                      ],
                      if (durationText != null && durationText.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('学制', durationText),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                if (overview != null && overview.isNotEmpty) ...[
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('项目概述'),
                        const SizedBox(height: 12),
                        Text(
                          overview,
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.6,
                            color: context.artC.ink.withOpacity(0.75),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                if (highlights != null && highlights.isNotEmpty) ...[
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('项目亮点'),
                        const SizedBox(height: 12),
                        Text(
                          highlights,
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.6,
                            color: context.artC.ink.withOpacity(0.75),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                _buildCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionTitle('录取与费用'),
                      const SizedBox(height: 16),
                      if (ielts != null)
                        _buildInfoRow('雅思要求', ielts.toString()),
                      if (ieltsSubscores != null &&
                          ieltsSubscores.isNotEmpty) ...[
                        if (ielts != null) const SizedBox(height: 12),
                        _buildInfoRow('雅思小分', ieltsSubscores),
                      ],
                      if (toefl != null) ...[
                        if (ielts != null || ieltsSubscores != null)
                          const SizedBox(height: 12),
                        _buildInfoRow('TOEFL iBT', toefl.toString()),
                      ],
                      if (otherLanguageTests != null &&
                          otherLanguageTests.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('其他语言', otherLanguageTests),
                      ],
                      if (regularDeadline != null &&
                          regularDeadline.isNotEmpty) ...[
                        if (ielts != null ||
                            ieltsSubscores != null ||
                            toefl != null ||
                            otherLanguageTests != null)
                          const SizedBox(height: 12),
                        _buildInfoRow('常规截止', regularDeadline),
                      ],
                      if (priorityDeadline != null &&
                          priorityDeadline.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('优先截止', priorityDeadline),
                      ],
                      if (deadlineNotes != null &&
                          deadlineNotes.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('截止说明', deadlineNotes),
                      ],
                      if (portfolioReq != null && portfolioReq.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('作品集要求', portfolioReq),
                      ],
                      if (portfolioFormat != null &&
                          portfolioFormat.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('作品集格式', portfolioFormat),
                      ],
                      if (interviewFormat != null &&
                          interviewFormat.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('面试形式', interviewFormat),
                      ],
                      if (referenceCount != null) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('推荐信', '${referenceCount.round()} 封'),
                      ],
                      if (academicReq != null && academicReq.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('学术要求', academicReq),
                      ],
                      if (admissionSummary != null &&
                          admissionSummary.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('申请摘要', admissionSummary),
                      ],
                      if (tuitionFee != null) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow(
                          '国际学费',
                          _formatMoney(tuitionFee, currency),
                        ),
                      ],
                      if (domesticTuition != null) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow(
                            '本地学费', _formatMoney(domesticTuition, currency)),
                      ],
                      if (additionalFeesNote != null &&
                          additionalFeesNote.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('费用说明', additionalFeesNote),
                      ],
                    ],
                  ),
                ),
                if (evaluation != null) ...[
                  const SizedBox(height: 16),
                  _buildEvaluationCard(
                    difficultyScore: difficultyScore,
                    competitionLevel: competitionLevel,
                    acceptanceRate: acceptanceRate,
                    evidenceNote: evidenceNote,
                    dataSource: dataSource,
                    sourceUrl: sourceUrl,
                  ),
                ],
                if (coreCourses != null && coreCourses.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('核心课程'),
                        const SizedBox(height: 12),
                        Text(
                          coreCourses,
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.6,
                            color: context.artC.ink.withOpacity(0.75),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                if (careerPaths != null && careerPaths.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('职业路径'),
                        const SizedBox(height: 12),
                        Text(
                          careerPaths,
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.6,
                            color: context.artC.ink.withOpacity(0.75),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 120),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTagsRow({
    required bool requiresPortfolio,
    required bool requiresInterview,
    required bool requiresPersonalStatement,
    String? duration,
  }) {
    final tags = <Widget>[];
    if (duration != null && duration.isNotEmpty) {
      tags.add(_buildTag(duration));
    }
    if (requiresPortfolio) {
      tags.add(_buildTag('需作品集'));
    }
    if (requiresInterview) {
      tags.add(_buildTag('需面试'));
    }
    if (requiresPersonalStatement) {
      tags.add(_buildTag('需个人陈述'));
    }
    if (tags.isEmpty) return const SizedBox.shrink();
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: tags,
    );
  }

  Widget _buildTag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.35),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: context.artC.ink.withOpacity(0.7),
        ),
      ),
    );
  }

  Widget _buildCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(kRadiusLarge),
        boxShadow: [kShadowCard],
      ),
      child: child,
    );
  }

  Widget _buildSectionTitle(String text) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: context.artC.ink,
      ),
    );
  }

  Widget _buildEvaluationCard({
    required int? difficultyScore,
    required String? competitionLevel,
    required num? acceptanceRate,
    required String? evidenceNote,
    required String? dataSource,
    required String? sourceUrl,
  }) {
    final normalizedScore =
        difficultyScore == null ? null : difficultyScore.clamp(1, 5).toInt();
    final hasSummary = competitionLevel != null && competitionLevel.isNotEmpty;
    final hasEvidence = evidenceNote != null && evidenceNote.isNotEmpty;
    final hasSource = dataSource != null && dataSource.isNotEmpty;
    final hasSourceUrl = sourceUrl != null && sourceUrl.isNotEmpty;

    if (normalizedScore == null &&
        acceptanceRate == null &&
        !hasSummary &&
        !hasEvidence &&
        !hasSource &&
        !hasSourceUrl) {
      return const SizedBox.shrink();
    }

    return _buildCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _buildSectionTitle('申请评估'),
              const Spacer(),
              if (normalizedScore != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: _difficultyColor(normalizedScore).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    _difficultyLabel(normalizedScore),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: _difficultyColor(normalizedScore),
                    ),
                  ),
                ),
            ],
          ),
          if (normalizedScore != null) ...[
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '$normalizedScore',
                  style: TextStyle(
                    fontSize: 34,
                    height: 1,
                    fontWeight: FontWeight.w800,
                    color: _difficultyColor(normalizedScore),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 4, bottom: 3),
                  child: Text(
                    '/ 5',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: context.artC.ink.withOpacity(0.38),
                    ),
                  ),
                ),
                const Spacer(),
                if (acceptanceRate != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _formatAcceptanceRate(acceptanceRate),
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: context.artC.ink,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '参考录取率',
                        style: TextStyle(
                          fontSize: 11,
                          color: context.artC.ink.withOpacity(0.4),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: normalizedScore / 5,
                minHeight: 8,
                backgroundColor: context.artC.silver.withOpacity(0.45),
                valueColor: AlwaysStoppedAnimation<Color>(
                  _difficultyColor(normalizedScore),
                ),
              ),
            ),
          ] else if (acceptanceRate != null) ...[
            const SizedBox(height: 14),
            _buildInfoRow('参考录取率', _formatAcceptanceRate(acceptanceRate)),
          ],
          if (hasSummary) ...[
            const SizedBox(height: 16),
            Text(
              competitionLevel,
              style: TextStyle(
                fontSize: 13,
                height: 1.6,
                color: context.artC.ink.withOpacity(0.72),
              ),
            ),
          ],
          if (hasEvidence) ...[
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: context.artC.silver.withOpacity(0.22),
                borderRadius: BorderRadius.circular(kRadiusSmall),
              ),
              child: Text(
                evidenceNote,
                style: TextStyle(
                  fontSize: 12,
                  height: 1.55,
                  color: context.artC.ink.withOpacity(0.58),
                ),
              ),
            ),
          ],
          if (hasSource || hasSourceUrl) ...[
            const SizedBox(height: 12),
            _buildInfoRow(
              '数据来源',
              dataSource ?? sourceUrl ?? '',
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color: context.artC.ink.withOpacity(0.45),
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: context.artC.ink,
            ),
          ),
        ),
      ],
    );
  }
}

Map<String, dynamic>? _firstOrSingle(dynamic value) {
  if (value == null) return null;
  if (value is Map<String, dynamic>) return value;
  if (value is List && value.isNotEmpty) {
    return value.first as Map<String, dynamic>?;
  }
  return null;
}

String? _asText(dynamic value) {
  if (value == null) return null;
  if (value is String) return value.trim().isEmpty ? null : value.trim();
  if (value is Map || value is List) return value.toString();
  return value.toString();
}

String _formatMoney(int value, String? currency) {
  final symbol = switch ((currency ?? '').toUpperCase()) {
    'GBP' => '£',
    'USD' => '\$',
    'EUR' => '€',
    'CNY' => '¥',
    _ => currency ?? '',
  };
  return '$symbol$value';
}

String _formatAcceptanceRate(num value) {
  final percentage = value <= 1 ? value * 100 : value;
  final fixed = percentage >= 10
      ? percentage.toStringAsFixed(0)
      : percentage.toStringAsFixed(1);
  return '${fixed.replaceAll('.0', '')}%';
}

String _difficultyLabel(int score) {
  return switch (score) {
    1 => '较易申请',
    2 => '相对友好',
    3 => '中等竞争',
    4 => '竞争较强',
    _ => '高度竞争',
  };
}

Color _difficultyColor(int score) {
  return switch (score) {
    1 => const Color(0xFF16A34A),
    2 => const Color(0xFF22C55E),
    3 => const Color(0xFFCA8A04),
    4 => const Color(0xFFEA580C),
    _ => const Color(0xFFDC2626),
  };
}

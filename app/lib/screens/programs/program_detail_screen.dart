import 'package:flutter/material.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class ProgramDetailScreen extends StatefulWidget {
  final int id;

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
            ? Center(child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2.5))
            : _error != null
                ? Center(child: Text('加载失败: $_error', style: TextStyle(color: context.artC.ink)))
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
    final overview = d['program_overview'] as String?;
    final highlights = d['program_highlights'] as String?;
    final coreCourses = d['core_courses'] as String?;
    final careerPaths = d['career_paths'] as String?;
    final coverImageUrl = d['cover_image_url'] as String?;

    final school = d['schools'] as Map<String, dynamic>?;
    final schoolName = school?['name_zh'] as String?;
    final schoolCountry = school?['country'] as String?;
    final schoolLogo = school?['logo_url'] as String?;
    final qsRank = school?['qs_art_rank'] as int?;

    final admissions = _firstOrNull(d['program_admissions'] as List<dynamic>?);
    final fees = _firstOrNull(d['program_fees'] as List<dynamic>?);

    final ielts = admissions?['ielts_overall'] as num?;
    final regularDeadline = admissions?['regular_deadline'] as String?;
    final portfolioReq = admissions?['portfolio_requirements'] as String?;
    final academicReq = admissions?['academic_requirements'] as String?;

    final tuitionFee = fees?['international_tuition_fee'] as int?;
    final currency = fees?['currency_code'] as String?;

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
                    child: Icon(Icons.arrow_back_ios, size: 18, color: context.artC.ink.withOpacity(0.6)),
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
                if (coverImageUrl != null && coverImageUrl.isNotEmpty) const SizedBox(height: 24),
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
                          if (degreeFullName != null && degreeFullName.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              degreeFullName,
                              style: TextStyle(
                                fontSize: 13,
                                color: context.artC.ink.withOpacity(0.45),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ] else if (degreeType != null && degreeType.isNotEmpty) ...[
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
                  duration: durationText,
                ),
                const SizedBox(height: 24),
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
                      if (ielts != null) _buildInfoRow('雅思要求', ielts.toString()),
                      if (regularDeadline != null && regularDeadline.isNotEmpty) ...[
                        if (ielts != null) const SizedBox(height: 12),
                        _buildInfoRow('常规截止', regularDeadline),
                      ],
                      if (portfolioReq != null && portfolioReq.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('作品集要求', portfolioReq),
                      ],
                      if (academicReq != null && academicReq.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('学术要求', academicReq),
                      ],
                      if (tuitionFee != null) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow(
                          '国际学费',
                          '${currency ?? '¥'} ${tuitionFee.toString()}',
                        ),
                      ],
                    ],
                  ),
                ),
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

  Map<String, dynamic>? _firstOrNull(List<dynamic>? list) {
    if (list == null || list.isEmpty) return null;
    return list.first as Map<String, dynamic>?;
  }

  Widget _buildTagsRow({
    required bool requiresPortfolio,
    required bool requiresInterview,
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

import 'package:flutter/material.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class SchoolDetailScreen extends StatefulWidget {
  final String id;

  const SchoolDetailScreen({super.key, required this.id});

  @override
  State<SchoolDetailScreen> createState() => _SchoolDetailScreenState();
}

class _SchoolDetailScreenState extends State<SchoolDetailScreen> {
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
      final r = await BackendApiService.fetchSchool(widget.id);
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
                child: CircularProgressIndicator(
                  color: kCobalt,
                  strokeWidth: 2.5,
                ),
              )
            : _error != null
                ? Center(
                    child: Text(
                      '加载失败: $_error',
                      style: TextStyle(color: context.artC.ink),
                    ),
                  )
                : _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    final d = _data!;
    final nameZh = d['name_zh'] as String? ?? '—';
    final nameEn = d['name_en'] as String?;
    final country = d['country'] as String?;
    final city = d['city'] as String?;
    final schoolType = d['school_type'] as String?;
    final qsRank = d['qs_art_rank'] as int?;
    final qsOverallRank = d['qs_overall_rank'] as int?;
    final description = d['description'] as String?;
    final featureTags = _stringList(d['feature_tags']);
    final disciplines = _stringList(d['strength_disciplines']);
    final alumni = _stringList(d['notable_alumni']);
    final campusImages = _stringList(d['campus_image_urls']);
    final rawWebsite = d['official_website'];
    final website = (rawWebsite is String &&
            rawWebsite.isNotEmpty &&
            rawWebsite != '[object Object]')
        ? rawWebsite
        : null;
    final logoUrl = d['logo_url'] as String?;

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
                    child: Icon(
                      Icons.arrow_back_ios,
                      size: 18,
                      color: context.artC.ink.withOpacity(0.6),
                    ),
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
                Row(
                  children: [
                    Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [kShadowCard],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: logoUrl != null && logoUrl.isNotEmpty
                            ? Image.network(
                                logoUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) =>
                                    _SchoolLogoFallback(nameZh),
                              )
                            : Center(
                                child: Text(
                                  nameZh.substring(0, 1),
                                  style: TextStyle(
                                    fontSize: 36,
                                    fontWeight: FontWeight.w700,
                                    color: kCobalt,
                                    letterSpacing: 2,
                                  ),
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            nameZh,
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: context.artC.ink,
                              height: 1.2,
                            ),
                          ),
                          if (nameEn != null && nameEn.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              nameEn,
                              style: TextStyle(
                                fontSize: 13,
                                color: context.artC.ink.withOpacity(0.45),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                          const SizedBox(height: 10),
                          if (qsRank != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: kCobalt.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'QS 艺术 #$qsRank',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: kCobalt.withOpacity(0.9),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (campusImages.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(kRadiusLarge),
                    child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: Image.network(
                        campusImages.first,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: context.artC.silver.withOpacity(0.35),
                          child: Icon(
                            Icons.image_not_supported_outlined,
                            color: context.artC.ink.withOpacity(0.25),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 28),
                _buildCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionTitle('基本信息'),
                      const SizedBox(height: 16),
                      _buildInfoRow(
                        '国家 / 城市',
                        [
                          if (country != null) country,
                          if (city != null) city,
                        ].join(' · '),
                      ),
                      if (schoolType != null && schoolType.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('学校类型', schoolType),
                      ],
                      if (website != null && website.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('官方网站', website),
                      ],
                    ],
                  ),
                ),
                if (description != null && description.trim().isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('学校介绍'),
                        const SizedBox(height: 12),
                        Text(
                          description.trim(),
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.65,
                            color: context.artC.ink.withOpacity(0.72),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                if (featureTags.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('院校标签'),
                        const SizedBox(height: 14),
                        _buildChips(featureTags),
                      ],
                    ),
                  ),
                ],
                if (disciplines.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('优势方向'),
                        const SizedBox(height: 14),
                        _buildChips(disciplines),
                      ],
                    ),
                  ),
                ],
                if (alumni.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('知名校友'),
                        const SizedBox(height: 12),
                        ...alumni.take(8).map(
                              (name) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 5,
                                      height: 5,
                                      margin: const EdgeInsets.only(top: 8),
                                      decoration: BoxDecoration(
                                        color: kCobalt.withOpacity(0.75),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        name,
                                        style: TextStyle(
                                          fontSize: 14,
                                          height: 1.45,
                                          fontWeight: FontWeight.w600,
                                          color: context.artC.ink.withOpacity(
                                            0.72,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                      ],
                    ),
                  ),
                ],
                if (qsRank != null || qsOverallRank != null) ...[
                  const SizedBox(height: 16),
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('数据概览'),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            if (qsRank != null)
                              Expanded(
                                child: _buildStatItem(
                                  qsRank.toString(),
                                  'QS 艺术排名',
                                ),
                              ),
                            if (qsRank != null && qsOverallRank != null)
                              const SizedBox(width: 16),
                            if (qsOverallRank != null)
                              Expanded(
                                child: _buildStatItem(
                                  qsOverallRank.toString(),
                                  'QS 综合排名',
                                ),
                              ),
                          ],
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

  Widget _buildChips(List<String> values) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: values.take(12).map((value) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: kCobalt.withOpacity(0.07),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: kCobalt.withOpacity(0.08)),
          ),
          child: Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: kCobalt.withOpacity(0.9),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildStatItem(String value, String label, {bool dimmed = false}) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: dimmed ? context.artC.ink.withOpacity(0.25) : kCobalt,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 11,
            color: context.artC.ink.withOpacity(0.4),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _SchoolLogoFallback extends StatelessWidget {
  final String name;

  const _SchoolLogoFallback(this.name);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        name.substring(0, 1),
        style: const TextStyle(
          fontSize: 36,
          fontWeight: FontWeight.w700,
          color: kCobalt,
          letterSpacing: 2,
        ),
      ),
    );
  }
}

List<String> _stringList(dynamic value) {
  if (value is List) {
    return value
        .map((e) => e.toString().trim())
        .where((e) => e.isNotEmpty)
        .toList();
  }
  if (value is String && value.trim().isNotEmpty) {
    return value
        .split(RegExp(r'[,，、\n]'))
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
  }
  return const [];
}

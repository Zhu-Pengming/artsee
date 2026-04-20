import 'package:flutter/material.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';

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
      backgroundColor: kPorcelain,
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2.5))
            : _error != null
                ? Center(child: Text('加载失败: $_error', style: const TextStyle(color: kInk)))
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
    final rawWebsite = d['official_website'];
    final website = (rawWebsite is String && rawWebsite.isNotEmpty && rawWebsite != '[object Object]')
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
                      color: kSilver.withOpacity(0.35),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.arrow_back_ios, size: 18, color: kInk.withOpacity(0.6)),
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
                            ? Image.network(logoUrl, fit: BoxFit.cover)
                            : Center(
                                child: Text(
                                  nameZh.substring(0, 1),
                                  style: const TextStyle(
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
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: kInk,
                              height: 1.2,
                            ),
                          ),
                          if (nameEn != null && nameEn.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              nameEn,
                              style: TextStyle(
                                fontSize: 13,
                                color: kInk.withOpacity(0.45),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                          const SizedBox(height: 10),
                          if (qsRank != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
                const SizedBox(height: 28),
                _buildCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionTitle('基本信息'),
                      const SizedBox(height: 16),
                      _buildInfoRow('国家 / 城市', [if (country != null) country, if (city != null) city].join(' · ')),
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
                if (qsRank != null) ...[
                  const SizedBox(height: 16),
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('数据概览'),
                        const SizedBox(height: 16),
                        Center(
                          child: _buildStatItem(
                            qsRank.toString(),
                            'QS 艺术排名',
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
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: kInk,
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
              color: kInk.withOpacity(0.45),
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: kInk,
            ),
          ),
        ),
      ],
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
            color: dimmed ? kInk.withOpacity(0.25) : kCobalt,
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
            color: kInk.withOpacity(0.4),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

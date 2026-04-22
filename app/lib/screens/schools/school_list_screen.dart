import 'package:flutter/material.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'school_detail_screen.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// 院校列表 — 分页查询
class SchoolListScreen extends StatefulWidget {
  const SchoolListScreen({super.key});

  @override
  State<SchoolListScreen> createState() => _SchoolListScreenState();
}

class _SchoolListScreenState extends State<SchoolListScreen> {
  final List<Map<String, dynamic>> _items = [];
  bool _loading = false;
  bool _hasMore = true;
  String? _error;
  int _offset = 0;
  final int _limit = 20;

  @override
  void initState() {
    super.initState();
    _loadMore();
  }

  Future<void> _loadMore() async {
    if (_loading || !_hasMore) return;
    setState(() => _loading = true);
    try {
      final result = await BackendApiService.fetchSchools(
        limit: _limit,
        offset: _offset,
      );
      final newItems = result.data;
      final total = result.count;
      if (mounted) {
        setState(() {
          _items.addAll(newItems);
          _offset += newItems.length;
          _hasMore = total == null || _offset < total;
          _loading = false;
          _error = null;
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

  Future<void> _refresh() async {
    setState(() {
      _items.clear();
      _offset = 0;
      _hasMore = true;
      _error = null;
    });
    await _loadMore();
  }

  @override
  Widget build(BuildContext context) {
    if (_items.isEmpty && _loading) {
      return Center(
        child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2.5),
      );
    }

    if (_items.isEmpty && _error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('加载失败: $_error', style: TextStyle(color: context.artC.ink)),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _refresh,
              style: ElevatedButton.styleFrom(backgroundColor: kCobalt),
              child: Text('重试'),
            ),
          ],
        ),
      );
    }

    if (_items.isEmpty) {
      return Center(child: Text('暂无院校数据', style: TextStyle(color: context.artC.ink)));
    }

    return RefreshIndicator(
      color: kCobalt,
      onRefresh: _refresh,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
        itemCount: _items.length + (_hasMore ? 1 : 0),
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          if (index >= _items.length) {
            _loadMore();
            return Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2),
                ),
              ),
            );
          }
          final item = _items[index];
          return _SchoolCard(
            data: item,
            onTap: () {
              final id = item['id'] as String?;
              if (id != null && id.isNotEmpty) {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => SchoolDetailScreen(id: id),
                  ),
                );
              }
            },
          );
        },
      ),
    );
  }
}

class _SchoolCard extends StatelessWidget {
  final Map<String, dynamic> data;
  final VoidCallback? onTap;

  const _SchoolCard({required this.data, this.onTap});

  @override
  Widget build(BuildContext context) {
    final nameZh = data['name_zh'] as String? ?? '—';
    final nameEn = data['name_en'] as String?;
    final country = data['country'] as String?;
    final city = data['city'] as String?;
    final qsRank = data['qs_art_rank'] as int?;
    final logoUrl = data['logo_url'] as String?;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(kRadiusLarge),
          boxShadow: [kShadowCard],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: context.artC.silver.withOpacity(0.35),
                borderRadius: BorderRadius.circular(16),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: logoUrl != null && logoUrl.isNotEmpty
                    ? Image.network(logoUrl, fit: BoxFit.cover)
                    : Center(
                        child: Text(
                          nameZh.substring(0, 1),
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: kCobalt,
                            letterSpacing: 2,
                          ),
                        ),
                      ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    nameZh,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: context.artC.ink,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (nameEn != null && nameEn.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      nameEn,
                      style: TextStyle(
                        fontSize: 11,
                        color: context.artC.ink.withOpacity(0.4),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      if (country != null)
                        _MetaChip(country),
                      if (city != null) ...[
                        const SizedBox(width: 6),
                        _MetaChip(city),
                      ],
                      if (qsRank != null) ...[
                        const SizedBox(width: 6),
                        _MetaChip('QS #$qsRank', highlighted: true),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, size: 20, color: context.artC.ink.withOpacity(0.25)),
          ],
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final String text;
  final bool highlighted;

  const _MetaChip(this.text, {this.highlighted = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: highlighted ? kCobalt.withOpacity(0.08) : context.artC.silver.withOpacity(0.4),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: highlighted ? FontWeight.w700 : FontWeight.w500,
          color: highlighted ? kCobalt.withOpacity(0.9) : context.artC.ink.withOpacity(0.55),
        ),
      ),
    );
  }
}

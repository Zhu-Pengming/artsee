import 'package:flutter/material.dart';

import '../../widgets/artsee_ui.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class SchoolComparisonResultScreen extends StatelessWidget {
  final Map<String, dynamic> result;

  const SchoolComparisonResultScreen({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    final schools = (result['schools'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final rows = (result['rows'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final dimensions = (result['dimensions'] as List<dynamic>? ?? [])
        .map((item) => item.toString())
        .toList();

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: context.artC.cardIconBg,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: context.artC.silver.withValues(alpha: 0.42),
                          ),
                        ),
                        child: Icon(
                          Icons.arrow_back_ios_new_rounded,
                          size: 17,
                          color: context.artC.ink.withValues(alpha: 0.62),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '院校多维对比',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ResultCard(
                      title: '综合结论',
                      child: Text(
                        _buildSummary(schools),
                        style: TextStyle(
                          fontSize: 14,
                          height: 1.55,
                          fontWeight: FontWeight.w700,
                          color: context.artC.ink.withValues(alpha: 0.72),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    if (dimensions.isNotEmpty)
                      _ResultCard(
                        title: '6 维评分',
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: dimensions.map(_Tag.new).toList(),
                        ),
                      ),
                    if (dimensions.isNotEmpty) const SizedBox(height: 14),
                    _ResultCard(
                      title: '详细对比',
                      child: _ComparisonTable(schools: schools, rows: rows),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _buildSummary(List<Map<String, dynamic>> schools) {
    if (schools.isEmpty) return '已生成本次院校对比。建议结合排名、城市资源、作品集难度和预算压力综合判断。';
    final names = schools.map(_schoolName).take(5).join('、');
    return '已基于 $names 生成 ${schools.length} 所院校的多维对比。先用于判断目标院校池，专业项目维度会随 programs 数据持续补全。';
  }
}

class _ResultCard extends StatelessWidget {
  final String title;
  final Widget child;

  const _ResultCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ArtseeSurface(
        padding: const EdgeInsets.all(18),
        radius: 18,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w900,
                color: context.artC.ink,
              ),
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}

class _ComparisonTable extends StatelessWidget {
  final List<Map<String, dynamic>> schools;
  final List<Map<String, dynamic>> rows;

  const _ComparisonTable({required this.schools, required this.rows});

  @override
  Widget build(BuildContext context) {
    if (schools.isEmpty || rows.isEmpty) {
      return Text(
        '暂无详细对比数据。',
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: context.artC.ink.withValues(alpha: 0.5),
        ),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
          border:
              Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
        ),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowHeight: 44,
            dataRowMinHeight: 58,
            dataRowMaxHeight: 86,
            horizontalMargin: 12,
            columnSpacing: 16,
            headingTextStyle: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
            dataTextStyle: TextStyle(
              fontSize: 12,
              height: 1.32,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.72),
            ),
            columns: [
              const DataColumn(
                label: SizedBox(width: 72, child: Text('维度')),
              ),
              ...schools.map(
                (school) => DataColumn(
                  label: SizedBox(
                    width: 108,
                    child: Text(
                      _schoolName(school),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ),
              const DataColumn(
                label: SizedBox(width: 78, child: Text('建议')),
              ),
            ],
            rows: rows.map((row) {
              final values = row['values'] as List<dynamic>? ?? [];
              return DataRow(
                cells: [
                  DataCell(
                    SizedBox(
                      width: 72,
                      child: Text(
                        row['label']?.toString() ?? '维度',
                        style: const TextStyle(
                          color: kCobalt,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                  ...List.generate(
                    schools.length,
                    (index) => DataCell(
                      SizedBox(
                        width: 108,
                        child: Text(
                          index < values.length
                              ? values[index].toString()
                              : '-',
                          maxLines: 4,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ),
                  DataCell(
                    Container(
                      constraints: const BoxConstraints(maxWidth: 78),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: kCobalt.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        row['winner']?.toString() ?? '看方向',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: kCobalt,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

String _schoolName(Map<String, dynamic> school) {
  final nameZh = school['name_zh']?.toString();
  if (nameZh != null && nameZh.isNotEmpty) return nameZh;
  final name = school['name']?.toString();
  if (name != null && name.isNotEmpty) return name;
  final nameEn = school['name_en']?.toString();
  if (nameEn != null && nameEn.isNotEmpty) return nameEn;
  return '未命名院校';
}

class _Tag extends StatelessWidget {
  final String label;

  const _Tag(this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: kCobalt,
        ),
      ),
    );
  }
}

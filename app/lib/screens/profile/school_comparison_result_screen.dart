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
                      child: Column(
                        children: rows.map((row) {
                          final label = row['label']?.toString() ?? '维度';
                          final values = (row['values'] as List<dynamic>? ?? [])
                              .map((item) => item.toString())
                              .toList();
                          return _CompareRow(label: label, values: values);
                        }).toList(),
                      ),
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
    final names = schools
        .map((school) =>
            school['name_zh'] ?? school['name'] ?? school['name_en'])
        .whereType<Object>()
        .map((item) => item.toString())
        .take(3)
        .join('、');
    return '已基于 $names 生成院校维度对比。第一版先用于判断目标院校池，专业项目维度会在 programs 数据修复后开放。';
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

class _CompareRow extends StatelessWidget {
  final String label;
  final List<String> values;

  const _CompareRow({required this.label, required this.values});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: kCobalt,
            ),
          ),
          const SizedBox(height: 6),
          ...values.map(
            (value) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  height: 1.35,
                  fontWeight: FontWeight.w700,
                  color: context.artC.ink.withValues(alpha: 0.62),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
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

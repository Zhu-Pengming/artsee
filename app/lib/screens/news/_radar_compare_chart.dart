import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../theme/artsee_ui_colors.dart';
import '../../widgets/common.dart';

class RadarCompareChart extends StatelessWidget {
  final Map<String, dynamic> report;

  const RadarCompareChart({super.key, required this.report});

  @override
  Widget build(BuildContext context) {
    final dimensions = report['dimensions'] as List<dynamic>? ?? [];
    final scores = report['scores'] as List<dynamic>? ?? [];
    final schools = report['schools'] as List<dynamic>? ?? [];

    if (dimensions.isEmpty || scores.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
        ),
        child: const Center(
          child: Text('暂无雷达图数据'),
        ),
      );
    }

    // 颜色方案
    final colors = [
      kCobalt,
      const Color(0xFFFF6B6B),
      const Color(0xFF4ECDC4),
      const Color(0xFFFFA07A),
      const Color(0xFF9B59B6),
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Column(
        children: [
          // 图例
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: List.generate(
              scores.length > 5 ? 5 : scores.length,
              (index) {
                final score = scores[index] as Map<String, dynamic>;
                final schoolId = score['school_id']?.toString() ?? '';
                final school = schools.firstWhere(
                  (s) => s['id']?.toString() == schoolId,
                  orElse: () => {'name_zh': '未知', 'name': ''},
                );
                final name = school['name_zh']?.toString() ??
                    school['name']?.toString() ??
                    '未知';

                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: colors[index % colors.length],
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      name,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: context.artC.ink.withValues(alpha: 0.72),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          // 雷达图
          SizedBox(
            height: 280,
            child: RadarChart(
              RadarChartData(
                radarShape: RadarShape.polygon,
                radarBorderData: BorderSide(
                  color: context.artC.silver.withValues(alpha: 0.3),
                  width: 1,
                ),
                gridBorderData: BorderSide(
                  color: context.artC.silver.withValues(alpha: 0.2),
                  width: 1,
                ),
                tickBorderData: BorderSide(
                  color: context.artC.silver.withValues(alpha: 0.2),
                  width: 1,
                ),
                tickCount: 5,
                ticksTextStyle: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.36),
                  fontSize: 10,
                ),
                radarBackgroundColor: Colors.transparent,
                titleTextStyle: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: context.artC.ink.withValues(alpha: 0.72),
                ),
                getTitle: (index, angle) {
                  if (index >= dimensions.length) return RadarChartTitle(text: '');
                  return RadarChartTitle(
                    text: dimensions[index].toString(),
                    angle: angle,
                  );
                },
                dataSets: List.generate(
                  scores.length > 5 ? 5 : scores.length,
                  (index) {
                    final score = scores[index] as Map<String, dynamic>;
                    final values = score['values'] as List<dynamic>? ?? [];
                    
                    return RadarDataSet(
                      fillColor: colors[index % colors.length].withValues(alpha: 0.1),
                      borderColor: colors[index % colors.length],
                      borderWidth: 2,
                      entryRadius: 3,
                      dataEntries: values
                          .map((v) => RadarEntry(value: (v as num).toDouble()))
                          .toList(),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class DimensionExplanations extends StatelessWidget {
  final Map<String, dynamic> report;

  const DimensionExplanations({super.key, required this.report});

  @override
  Widget build(BuildContext context) {
    final explanations = report['dimension_explanations'] as List<dynamic>? ?? [];

    if (explanations.isEmpty) {
      return const SizedBox.shrink();
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: explanations.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final explanation = explanations[index] as Map<String, dynamic>;
        final label = explanation['label']?.toString() ?? '';
        final summary = explanation['summary']?.toString() ?? '';

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: context.artC.silver.withValues(alpha: 0.42),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 4,
                    height: 16,
                    decoration: BoxDecoration(
                      color: kCobalt,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                summary,
                style: TextStyle(
                  fontSize: 12,
                  height: 1.5,
                  fontWeight: FontWeight.w600,
                  color: context.artC.ink.withValues(alpha: 0.62),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

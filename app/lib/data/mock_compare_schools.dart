/// 对齐 design-reference `MOCK_SCHOOLS` + InfoView 对比表字段
class CompareSchool {
  final String id;
  final String name;
  final String enName;
  final String cityCountry;
  final String tuition;
  final String language;
  final String difficulty;
  final List<String> tags;
  final String image;
  final String gpa;
  final String employmentRate;
  final String avgSalary;

  const CompareSchool({
    required this.id,
    required this.name,
    required this.enName,
    required this.cityCountry,
    required this.tuition,
    required this.language,
    required this.difficulty,
    required this.tags,
    required this.image,
    required this.gpa,
    required this.employmentRate,
    required this.avgSalary,
  });

  /// 雷达图 0–100（示意：与稿件雷达维度一致）
  List<double> get radarScores => switch (id) {
        '1' => [90, 85, 60, 95, 98],
        '2' => [85, 90, 70, 85, 95],
        '3' => [95, 80, 50, 90, 92],
        '4' => [92, 82, 64, 94, 96],
        _ => [75, 75, 75, 75, 75],
      };
}

const List<CompareSchool> kMockCompareSchools = [
  CompareSchool(
    id: '1',
    name: '皇家艺术学院',
    enName: 'Royal College of Art',
    cityCountry: '伦敦, 英国',
    tuition: '£35,000',
    language: '雅思 7.0',
    difficulty: '冲刺',
    tags: ['纯艺', '设计', '创新'],
    image: 'https://picsum.photos/seed/rca/800/600',
    gpa: '3.5+',
    employmentRate: '92%',
    avgSalary: '£45k',
  ),
  CompareSchool(
    id: '2',
    name: '罗德岛设计学院',
    enName: 'RISD',
    cityCountry: '普罗维登斯, 美国',
    tuition: r'$58,000',
    language: '托福 93',
    difficulty: '冲刺',
    tags: ['纯艺', '产品', '平面'],
    image: 'https://picsum.photos/seed/risd/800/600',
    gpa: '3.8+',
    employmentRate: '88%',
    avgSalary: r'$65k',
  ),
  CompareSchool(
    id: '3',
    name: '中央圣马丁学院',
    enName: 'Central Saint Martins',
    cityCountry: '伦敦, 英国',
    tuition: '£28,000',
    language: '雅思 6.5',
    difficulty: '匹配',
    tags: ['时装', '平面', '空间'],
    image: 'https://picsum.photos/seed/csm/800/600',
    gpa: '3.2+',
    employmentRate: '85%',
    avgSalary: '£38k',
  ),
  CompareSchool(
    id: '4',
    name: '伦敦艺术大学',
    enName: 'University of the Arts London (UAL)',
    cityCountry: '伦敦, 英国',
    tuition: '£30,890',
    language: '雅思 6.5-7.0',
    difficulty: '冲刺',
    tags: ['时尚', '传媒', '设计'],
    image: 'https://picsum.photos/seed/ual/800/600',
    gpa: '3.3+',
    employmentRate: '89%',
    avgSalary: '£32k',
  ),
];

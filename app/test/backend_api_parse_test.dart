import 'package:flutter_test/flutter_test.dart';

import 'package:artsee_app/models/models.dart';

void main() {
  test('AppCommunityPost.fromJson 解析 user_profiles 与 image_urls', () {
    final p = AppCommunityPost.fromJson({
      'id': 'a1',
      'title': '测试',
      'body': '正文',
      'image_urls': ['https://x.com/1.jpg'],
      'like_count': 2,
      'comment_count': 1,
      'view_count': 10,
      'created_at': '2026-01-01T00:00:00Z',
      'user_profiles': {'nickname': '小明', 'avatar_url': null},
    });
    expect(p.id, 'a1');
    expect(p.imageUrls.length, 1);
    expect(p.authorNickname, '小明');
  });

  test('AppProgram.fromJson 接受 Next / Supabase 嵌套 schools 与 admissions 数组', () {
    final json = {
      'id': 1,
      'program_name': 'MA Fine Art',
      'degree_type': 'MA',
      'requires_portfolio': true,
      'requires_interview': false,
      'schools': {'name_zh': '某大学', 'qs_art_rank': 3},
      'program_admissions': [
        {'ielts_overall': 6.5, 'regular_deadline': '2026-01-15'},
      ],
      'program_fees': [
        {'international_tuition_fee': 25000, 'currency_code': 'GBP'},
      ],
    };
    final prog = AppProgram.fromJson(json);
    expect(prog.schoolNameZh, '某大学');
    expect(prog.ieltsOverall, 6.5);
    expect(prog.internationalTuitionFee, 25000);
  });
}

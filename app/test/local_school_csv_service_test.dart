import 'package:flutter_test/flutter_test.dart';

import 'package:artsee_app/services/backend_api_service.dart';
import 'package:artsee_app/services/local_school_csv_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('LocalSchoolCsvService loads bundled CSV and maps school fields',
      () async {
    final result = await LocalSchoolCsvService.fetchSchools(limit: 10);

    expect(result.count, greaterThan(0));
    expect(result.data, isNotEmpty);
    expect(
      result.data.any((item) => item['data_source'] == 'local_csv'),
      isTrue,
    );
    expect(result.data.first['name_zh'], isNotEmpty);
    expect(result.data.first['qs_art_rank'], isA<int>());
  });

  test('LocalSchoolCsvService supports keyword and Top 30 filters', () async {
    final result = await LocalSchoolCsvService.fetchSchools(
      keyword: '清华',
      maxRank: 30,
      limit: 20,
    );

    expect(result.data, isNotEmpty);
    expect(
      result.data.every((item) => (item['qs_art_rank'] as int) <= 30),
      isTrue,
    );
    expect(result.data.first['name_zh'].toString(), contains('清华'));
  });

  test('LocalSchoolCsvService uses auxiliary display for abbreviations',
      () async {
    final rca = await LocalSchoolCsvService.fetchSchools(keyword: 'RCA');
    expect(rca.data, isNotEmpty);
    expect(rca.data.first['name_zh'], '皇家艺术学院');
    expect(rca.data.first['is_auxiliary_display'], isTrue);
    expect(
      rca.data.first['remote_school_id'],
      'ce0cf7d4-1908-45b1-a7f9-6faec1c2aaf2',
    );

    final parsons =
        await LocalSchoolCsvService.fetchSchools(keyword: 'parsons');
    expect(parsons.data, isNotEmpty);
    expect(parsons.data.first['name_zh'], '帕森斯设计学院');
    expect(parsons.data.first['is_auxiliary_display'], isTrue);
    expect(
      parsons.data.first['remote_school_id'],
      '53177fa4-1ae6-4145-a03a-05b7d71b33df',
    );
  });

  test('LocalSchoolCsvService enriches existing CSV rows with alias display',
      () async {
    final csm = await LocalSchoolCsvService.fetchSchools(keyword: 'CSM');

    expect(csm.data, isNotEmpty);
    expect(csm.data.first['name_zh'], '中央圣马丁学院');
    expect(csm.data.first['slug'], 'central-saint-martins');
    expect(csm.data.first['data_source'], 'local_csv');
  });

  test('LocalSchoolCsvService ranks exact umbrella alias before colleges',
      () async {
    final ual = await LocalSchoolCsvService.fetchSchools(keyword: 'UAL');

    expect(ual.data, isNotEmpty);
    expect(ual.data.first['name_zh'], '伦敦艺术大学');
    expect(
      ual.data.first['remote_school_id'],
      'a9665370-b362-4bd4-a3e7-3a341286a875',
    );
    expect(ual.data.map((item) => item['name_zh']), contains('中央圣马丁学院'));
    expect(ual.data.map((item) => item['name_zh']), contains('伦敦时装学院'));
  });

  test('LocalSchoolCsvService maps auxiliary-only LCC to Supabase id',
      () async {
    final lcc = await LocalSchoolCsvService.fetchSchools(keyword: 'LCC');

    expect(lcc.data, isNotEmpty);
    expect(lcc.data.first['name_zh'], '伦敦传媒学院');
    expect(lcc.data.first['remote_school_id'],
        'abec56b4-735e-4d52-b970-b245289efc09');
  });

  test('BackendApiService opens auxiliary school detail from local catalog',
      () async {
    final rca = await BackendApiService.fetchSchool('aux-royal-college-art');

    expect(rca['name_zh'], '皇家艺术学院');
    expect(rca['is_auxiliary_display'], isTrue);
    expect(
      rca['remote_school_id'],
      'ce0cf7d4-1908-45b1-a7f9-6faec1c2aaf2',
    );

    final parsons = await BackendApiService.fetchSchool('aux-parsons');
    expect(parsons['name_zh'], '帕森斯设计学院');
    expect(
      parsons['remote_school_id'],
      '53177fa4-1ae6-4145-a03a-05b7d71b33df',
    );
  });
}

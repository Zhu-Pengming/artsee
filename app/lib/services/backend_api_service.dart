import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/api_config.dart';
import '../models/models.dart';

/// 通过 Next.js（`web/`）访问 Supabase 中的业务数据，与 Flutter 直连并存时可逐步迁移。
class BackendApiService {
  BackendApiService._();

  static Uri _api(String path, [Map<String, String>? query]) {
    final base = ApiConfig.baseUrl.replaceAll(RegExp(r'/$'), '');
    final p = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$base$p').replace(queryParameters: query);
  }

  static Future<Map<String, String>> _headers({bool withAuth = false}) async {
    final h = <String, String>{'Content-Type': 'application/json; charset=utf-8'};
    if (withAuth) {
      final t = Supabase.instance.client.auth.currentSession?.accessToken;
      if (t != null) h['Authorization'] = 'Bearer $t';
    }
    return h;
  }

  static Future<List<AppCase>> fetchCases({int limit = 20}) async {
    final r = await http.get(_api('/api/v1/cases', {'limit': '$limit'}), headers: await _headers());
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'cases ${r.statusCode}');
    }
    final list = body['data'] as List<dynamic>? ?? [];
    return list.map((e) => AppCase.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<List<AppCommunityPost>> fetchCommunityPosts({int limit = 20}) async {
    final r = await http.get(
      _api('/api/v1/community/posts', {'limit': '$limit'}),
      headers: await _headers(),
    );
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'community ${r.statusCode}');
    }
    final list = body['data'] as List<dynamic>? ?? [];
    return list.map((e) => AppCommunityPost.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<List<AppProgram>> fetchPrograms({int limit = 80, int offset = 0}) async {
    final r = await http.get(
      _api('/api/v1/programs', {'limit': '$limit', 'offset': '$offset'}),
      headers: await _headers(),
    );
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'programs ${r.statusCode}');
    }
    final list = body['data'] as List<dynamic>? ?? [];
    return list.map((e) => AppProgram.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<AppProgram?> fetchProgram(int id) async {
    final r = await http.get(_api('/api/v1/programs/$id'), headers: await _headers());
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode == 404) return null;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'program ${r.statusCode}');
    }
    return AppProgram.fromJson(body['data'] as Map<String, dynamic>);
  }

  static Future<void> createCommunityPost({
    required String title,
    String? body,
    List<String> imageUrls = const [],
  }) async {
    final r = await http.post(
      _api('/api/v1/community/posts'),
      headers: await _headers(withAuth: true),
      body: jsonEncode({
        'title': title,
        'body': body,
        'image_urls': imageUrls,
      }),
    );
    final decoded = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 && r.statusCode != 201) {
      throw Exception(decoded['error'] ?? '发布失败 ${r.statusCode}');
    }
    if (decoded['success'] != true) {
      throw Exception(decoded['error'] ?? '发布失败');
    }
  }

  /// AI 选校：返回 Next 侧 JSON（含 `result` 表格字段）
  static Future<Map<String, dynamic>> aiSchoolSearch(String query, {int limitPrograms = 40}) async {
    final r = await http.post(
      _api('/api/v1/ai/schools/search'),
      headers: await _headers(),
      body: jsonEncode({'query': query, 'limitPrograms': limitPrograms}),
    );
    final decoded = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200) {
      throw Exception(decoded['error'] ?? 'AI ${r.statusCode}');
    }
    return decoded;
  }
}

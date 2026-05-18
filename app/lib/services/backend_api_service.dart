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
    final h = <String, String>{
      'Content-Type': 'application/json; charset=utf-8'
    };
    if (withAuth) {
      final t = Supabase.instance.client.auth.currentSession?.accessToken;
      if (t != null) h['Authorization'] = 'Bearer $t';
    }
    return h;
  }

  static Future<List<AppCase>> fetchCases({
    int limit = 20,
    int offset = 0,
    String? result,
  }) async {
    final params = <String, String>{
      'limit': '$limit',
      'offset': '$offset',
    };
    if (result != null && result.isNotEmpty) params['result'] = result;
    final r = await http.get(_api('/api/v1/cases', params),
        headers: await _headers());
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'cases ${r.statusCode}');
    }
    final list = body['data'] as List<dynamic>? ?? [];
    return list
        .map((e) => AppCase.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<AppCase?> fetchCaseDetail(String id) async {
    final r = await http.get(
      _api('/api/v1/cases/$id'),
      headers: await _headers(),
    );
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode == 404) return null;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'case ${r.statusCode}');
    }
    return AppCase.fromJson(body['data'] as Map<String, dynamic>);
  }

  static Future<List<AppCommunityPost>> fetchCommunityPosts(
      {int limit = 20}) async {
    final r = await http.get(
      _api('/api/v1/community/posts', {'limit': '$limit'}),
      headers: await _headers(),
    );
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'community ${r.statusCode}');
    }
    final list = body['data'] as List<dynamic>? ?? [];
    return list
        .map((e) => AppCommunityPost.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<AppCommunityPost?> fetchCommunityPost(String id) async {
    final r = await http.get(
      _api('/api/v1/community/posts/$id'),
      headers: await _headers(withAuth: true),
    );
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode == 404) return null;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'community post ${r.statusCode}');
    }
    return AppCommunityPost.fromJson(body['data'] as Map<String, dynamic>);
  }

  static Future<({bool liked, int likeCount})> likeCommunityPost(
      String id) async {
    final r = await http.post(
      _api('/api/v1/community/posts/$id/like'),
      headers: await _headers(withAuth: true),
    );
    final decoded = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || decoded['success'] != true) {
      throw Exception(decoded['error'] ?? '点赞失败 ${r.statusCode}');
    }
    final data = decoded['data'] as Map<String, dynamic>? ?? {};
    return (
      liked: data['liked'] as bool? ?? true,
      likeCount: data['like_count'] as int? ?? 0,
    );
  }

  static Future<({bool liked, int likeCount})> unlikeCommunityPost(
      String id) async {
    final r = await http.delete(
      _api('/api/v1/community/posts/$id/like'),
      headers: await _headers(withAuth: true),
    );
    final decoded = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || decoded['success'] != true) {
      throw Exception(decoded['error'] ?? '取消点赞失败 ${r.statusCode}');
    }
    final data = decoded['data'] as Map<String, dynamic>? ?? {};
    return (
      liked: data['liked'] as bool? ?? false,
      likeCount: data['like_count'] as int? ?? 0,
    );
  }

  static Future<List<AppCommunityComment>> fetchCommunityComments(
    String postId, {
    int limit = 30,
    int offset = 0,
  }) async {
    final r = await http.get(
      _api('/api/v1/community/posts/$postId/comments', {
        'limit': '$limit',
        'offset': '$offset',
      }),
      headers: await _headers(),
    );
    final decoded = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || decoded['success'] != true) {
      throw Exception(decoded['error'] ?? 'comments ${r.statusCode}');
    }
    final list = decoded['data'] as List<dynamic>? ?? [];
    return list
        .map((e) => AppCommunityComment.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<AppCommunityComment> createCommunityComment({
    required String postId,
    required String body,
  }) async {
    final r = await http.post(
      _api('/api/v1/community/posts/$postId/comments'),
      headers: await _headers(withAuth: true),
      body: jsonEncode({'body': body}),
    );
    final decoded = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 201 || decoded['success'] != true) {
      throw Exception(decoded['error'] ?? '评论失败 ${r.statusCode}');
    }
    return AppCommunityComment.fromJson(
        decoded['data'] as Map<String, dynamic>);
  }

  static Future<List<AppProgram>> fetchPrograms(
      {int limit = 80, int offset = 0}) async {
    final r = await http.get(
      _api('/api/v1/programs', {'limit': '$limit', 'offset': '$offset'}),
      headers: await _headers(),
    );
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'programs ${r.statusCode}');
    }
    final list = body['data'] as List<dynamic>? ?? [];
    return list
        .map((e) => AppProgram.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<({List<AppProgram> data, int? count, int limit, int offset})>
      fetchProgramsPaginated({
    int limit = 20,
    int offset = 0,
    String? keyword,
    String? degreeType,
    String? schoolId,
    bool? requiresPortfolio,
  }) async {
    final params = <String, String>{
      'limit': '$limit',
      'offset': '$offset',
    };
    if (keyword != null && keyword.isNotEmpty) params['keyword'] = keyword;
    if (degreeType != null && degreeType.isNotEmpty) {
      params['degree_type'] = degreeType;
    }
    if (schoolId != null) params['school_id'] = schoolId;
    if (requiresPortfolio != null) {
      params['requires_portfolio'] = requiresPortfolio ? 'true' : 'false';
    }

    final r = await http.get(
      _api('/api/v1/programs', params),
      headers: await _headers(),
    );
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'programs ${r.statusCode}');
    }
    final list = body['data'] as List<dynamic>? ?? [];
    final count = body['count'] as int?;
    final pagination = body['pagination'] as Map<String, dynamic>?;
    return (
      data: list
          .map((e) => AppProgram.fromJson(e as Map<String, dynamic>))
          .toList(),
      count: count,
      limit: pagination?['limit'] as int? ?? limit,
      offset: pagination?['offset'] as int? ?? offset,
    );
  }

  static Future<
      ({
        List<Map<String, dynamic>> data,
        int? count,
        int limit,
        int offset
      })> fetchSchools({
    int limit = 20,
    int offset = 0,
    String? keyword,
    String? country,
    String? regionTag,
    String? schoolType,
    String? advantageSubject,
  }) async {
    final params = <String, String>{
      'limit': '$limit',
      'offset': '$offset',
    };
    if (keyword != null && keyword.isNotEmpty) params['keyword'] = keyword;
    if (country != null && country.isNotEmpty) params['country'] = country;
    if (regionTag != null && regionTag.isNotEmpty) {
      params['region_tag'] = regionTag;
    }
    if (schoolType != null && schoolType.isNotEmpty) {
      params['school_type'] = schoolType;
    }
    if (advantageSubject != null && advantageSubject.isNotEmpty) {
      params['advantage_subject'] = advantageSubject;
    }

    final r = await http.get(
      _api('/api/v1/schools', params),
      headers: await _headers(),
    );
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'schools ${r.statusCode}');
    }
    final list =
        (body['data'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();
    final count = body['count'] as int?;
    final pagination = body['pagination'] as Map<String, dynamic>?;
    return (
      data: list,
      count: count,
      limit: pagination?['limit'] as int? ?? limit,
      offset: pagination?['offset'] as int? ?? offset,
    );
  }

  static Future<AppProgram?> fetchProgram(String id) async {
    final r =
        await http.get(_api('/api/v1/programs/$id'), headers: await _headers());
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode == 404) return null;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'program ${r.statusCode}');
    }
    return AppProgram.fromJson(body['data'] as Map<String, dynamic>);
  }

  static Future<Map<String, dynamic>> fetchProgramDetail(String id) async {
    final r =
        await http.get(_api('/api/v1/programs/$id'), headers: await _headers());
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode == 404) throw Exception('专业未找到');
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'program ${r.statusCode}');
    }
    return body['data'] as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> fetchSchool(String id) async {
    final r =
        await http.get(_api('/api/v1/schools/$id'), headers: await _headers());
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode == 404) throw Exception('学校未找到');
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'school ${r.statusCode}');
    }
    return body['data'] as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> aiSchoolConsult(String query,
      {int limitSchools = 20}) {
    return aiSchoolSearch(query, limitSchools: limitSchools);
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

  static Future<Map<String, dynamic>> createCheckoutSession({
    required String subject,
    required int amountTotal,
    String currency = 'cny',
    String itemType = 'service',
    String? itemId,
    Map<String, dynamic>? metadata,
  }) async {
    final r = await http.post(
      _api('/api/v1/payments/checkout'),
      headers: await _headers(withAuth: true),
      body: jsonEncode({
        'subject': subject,
        'amountTotal': amountTotal,
        'currency': currency,
        'itemType': itemType,
        if (itemId != null) 'itemId': itemId,
        if (metadata != null) 'metadata': metadata,
      }),
    );
    final decoded = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || decoded['success'] != true) {
      throw Exception(decoded['error'] ?? '创建支付订单失败 ${r.statusCode}');
    }
    return decoded['data'] as Map<String, dynamic>;
  }

  static Future<List<Map<String, dynamic>>> fetchMyOrders({
    int limit = 20,
    int offset = 0,
  }) async {
    final r = await http.get(
      _api('/api/v1/orders', {'limit': '$limit', 'offset': '$offset'}),
      headers: await _headers(withAuth: true),
    );
    final decoded = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || decoded['success'] != true) {
      throw Exception(decoded['error'] ?? 'orders ${r.statusCode}');
    }
    return (decoded['data'] as List<dynamic>? ?? [])
        .cast<Map<String, dynamic>>();
  }

  /// 首页内容（`home_contents` 表，经 Next `/api/v1/home-contents`）
  static Future<List<HomeContent>> fetchHomeContents(
      {String? sectionType}) async {
    final params = <String, String>{};
    if (sectionType != null && sectionType.isNotEmpty) {
      params['section_type'] = sectionType;
    }
    final r = await http.get(
      _api('/api/v1/home-contents', params),
      headers: await _headers(),
    );
    final body = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200 || body['success'] != true) {
      throw Exception(body['error'] ?? 'home_contents ${r.statusCode}');
    }
    final list = body['data'] as List<dynamic>? ?? [];
    return list
        .map((e) => HomeContent.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// AI 选校：返回 Next 侧 JSON（含 `result` 表格字段）
  static Future<Map<String, dynamic>> aiSchoolSearch(String query,
      {int limitSchools = 40}) async {
    final r = await http.post(
      _api('/api/v1/ai/schools/search'),
      headers: await _headers(),
      body: jsonEncode({'query': query, 'limitSchools': limitSchools}),
    );
    final decoded = jsonDecode(r.body) as Map<String, dynamic>;
    if (r.statusCode != 200) {
      throw Exception(decoded['error'] ?? 'AI ${r.statusCode}');
    }
    return decoded;
  }
}

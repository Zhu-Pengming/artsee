import 'dart:convert';

import 'package:flutter/services.dart';

import '../data/school_display_aliases.dart';

/// Local school catalog backed by a bundled CSV asset.
///
/// This is intentionally shaped like `/api/v1/schools` so the app can keep
/// using the same UI path when the remote Supabase schema is incomplete.
class LocalSchoolCsvService {
  LocalSchoolCsvService._();

  static const assetPath = 'assets/data/local_schools.csv';

  static Future<List<Map<String, dynamic>>>? _cache;

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
    int? minRank,
    int? maxRank,
  }) async {
    final all = await _loadRows();
    var rows = all.where((row) {
      if (!_matchesKeyword(row, keyword)) return false;
      if (!_matchesCountry(row, country)) return false;
      if (!_matchesString(row['region_tag'], regionTag)) return false;
      if (!_matchesString(row['school_type'], schoolType)) return false;
      if (!_matchesAdvantage(row, advantageSubject)) return false;
      if (!_matchesRank(row, minRank: minRank, maxRank: maxRank)) return false;
      return true;
    }).toList();

    _sortRows(rows, keyword);

    final total = rows.length;
    final page = rows.skip(offset).take(limit).toList();
    return (
      data: page,
      count: total,
      limit: limit,
      offset: offset,
    );
  }

  static Future<Map<String, dynamic>?> findSchoolById(String id) async {
    final target = id.trim();
    if (target.isEmpty) return null;

    final rows = await _loadRows();
    for (final row in rows) {
      if (row['id']?.toString() == target ||
          row['remote_school_id']?.toString() == target ||
          row['slug']?.toString() == target) {
        return Map<String, dynamic>.from(row);
      }
    }

    for (final row in rows) {
      if (_rowHasExactAliasMatch(row, target)) {
        return Map<String, dynamic>.from(row);
      }
    }

    return null;
  }

  static Future<List<Map<String, dynamic>>> _loadRows() {
    return _cache ??= _readRows();
  }

  static Future<List<Map<String, dynamic>>> _readRows() async {
    final csvText = await rootBundle.loadString(assetPath);
    final table = _parseCsv(csvText);
    if (table.isEmpty) return const [];

    final headers = table.first.map((item) => item.trim()).toList();
    final rows =
        table.skip(1).where((row) => row.any((cell) => cell.isNotEmpty)).map(
      (row) {
        final raw = <String, String>{};
        for (var i = 0; i < headers.length; i += 1) {
          raw[headers[i]] = i < row.length ? row[i].trim() : '';
        }
        return _enrichWithAlias(_normalizeSchool(raw));
      },
    ).toList();

    _appendAuxiliaryRows(rows);
    return rows;
  }

  static Map<String, dynamic> _normalizeSchool(Map<String, String> raw) {
    final featureTags = _splitPipe(raw['feature_tags']);
    final disciplines = _splitPipe(raw['strength_disciplines']);
    final country = _firstNonEmpty([raw['country'], raw['raw_country']]);
    final qsArtRank = _intOrNull(raw['qs_art_design_rank']);
    final logoUrl = _cleanUrl(raw['logo_url']);

    return {
      'id': raw['id'] ?? '',
      'name_zh': _inferName(raw),
      'name_en': _emptyToNull(raw['name_en']),
      'country': country,
      'raw_country': country,
      'country_code': _emptyToNull(raw['country_code']),
      'city': _emptyToNull(raw['city']),
      'description': _emptyToNull(raw['description']),
      'official_website': _emptyToNull(raw['official_website']) ??
          _emptyToNull(raw['international_students_page']),
      'international_students_page':
          _emptyToNull(raw['international_students_page']),
      'logo_url': logoUrl,
      'feature_tags': featureTags,
      'strength_disciplines': disciplines,
      'school_type': _inferSchoolType(featureTags, disciplines),
      'region_tag': _inferRegionTag(country, raw['country_code'], raw['city']),
      'advantage_subjects': _inferAdvantageSubjects(disciplines, raw),
      'qs_art_rank': qsArtRank,
      'qs_art_design_rank': qsArtRank,
      'qs_overall_rank': _intOrNull(raw['qs_overall_rank']),
      'qs_architecture_built_environment_rank':
          _intOrNull(raw['qs_architecture_built_environment_rank']),
      'qs_art_humanities_rank': _intOrNull(raw['qs_art_humanities_rank']),
      'qs_history_of_art_rank': _intOrNull(raw['qs_history_of_art_rank']),
      'program_count': _intOrNull(raw['program_count']),
      'portfolio_difficulty': _intOrNull(raw['portfolio_difficulty']),
      'city_cost_index': _intOrNull(raw['city_cost_index']),
      'career_resources_rating': _intOrNull(raw['career_resources_rating']),
      'founded_year': _intOrNull(raw['founded_year']),
      'tuition_usd_per_year': _intOrNull(raw['tuition_usd_per_year']),
      'acceptance_rate': _doubleOrNull(raw['acceptance_rate']),
      'application_deadline': _emptyToNull(raw['application_deadline']),
      'major_tags': _decodeJsonOrNull(raw['major_tags']),
      'notable_alumni': _splitComma(raw['notable_alumni']),
      'saved_count': 0,
      'consultation_count': 0,
      'status': 'active',
      'data_source': 'local_csv',
    };
  }

  static Map<String, dynamic> _enrichWithAlias(Map<String, dynamic> row) {
    final alias = _findAliasForRow(row);
    if (alias == null) return row;

    return {
      ...row,
      'name_zh': alias.nameZh,
      'name_en': alias.nameEn,
      'slug': alias.slug,
      'aliases': alias.aliases,
      'school_type': alias.schoolType,
      'display_source': 'auxiliary_alias',
      if (alias.remoteId != null) 'remote_school_id': alias.remoteId,
      if (row['logo_url'] == null && alias.logoUrl != null)
        'logo_url': alias.logoUrl,
      if (row['qs_art_rank'] == null && alias.qsArtRank != null) ...{
        'qs_art_rank': alias.qsArtRank,
        'qs_art_design_rank': alias.qsArtRank,
      },
      if (_stringList(row['feature_tags']).isEmpty)
        'feature_tags': alias.featureTags,
      if (_stringList(row['strength_disciplines']).isEmpty)
        'strength_disciplines': alias.strengthDisciplines,
    };
  }

  static void _appendAuxiliaryRows(List<Map<String, dynamic>> rows) {
    for (final alias in kSchoolDisplayAliases) {
      final exists = rows.any((row) => _rowMatchesAlias(row, alias));
      if (!exists) rows.add(alias.toSchoolRow());
    }
  }

  static List<List<String>> _parseCsv(String input) {
    final rows = <List<String>>[];
    final row = <String>[];
    final field = StringBuffer();
    var inQuotes = false;

    for (var i = 0; i < input.length; i += 1) {
      final char = input[i];
      if (inQuotes) {
        if (char == '"') {
          final next = i + 1 < input.length ? input[i + 1] : '';
          if (next == '"') {
            field.write('"');
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field.write(char);
        }
        continue;
      }

      if (char == '"') {
        inQuotes = true;
      } else if (char == ',') {
        row.add(field.toString());
        field.clear();
      } else if (char == '\n') {
        row.add(field.toString());
        field.clear();
        rows.add(List<String>.from(row));
        row.clear();
      } else if (char != '\r') {
        field.write(char);
      }
    }

    if (field.isNotEmpty || row.isNotEmpty) {
      row.add(field.toString());
      rows.add(List<String>.from(row));
    }
    return rows;
  }

  static bool _matchesKeyword(Map<String, dynamic> row, String? keyword) {
    final q = keyword?.trim().toLowerCase();
    if (q == null || q.isEmpty) return true;
    final haystack = [
      row['name_zh'],
      row['name_en'],
      row['slug'],
      row['country'],
      row['city'],
      row['description'],
      ..._stringList(row['aliases']),
      ..._stringList(row['feature_tags']),
      ..._stringList(row['strength_disciplines']),
    ].whereType<String>().join(' ').toLowerCase();
    if (haystack.contains(q)) return true;

    final matchedAliases = kSchoolDisplayAliases.where(
      (alias) => alias.aliases.any((value) => schoolAliasMatches(q, value)),
    );
    return matchedAliases.any((alias) => _rowMatchesAlias(row, alias));
  }

  static void _sortRows(List<Map<String, dynamic>> rows, String? keyword) {
    rows.sort((a, b) {
      final priorityCompare =
          _searchPriority(a, keyword).compareTo(_searchPriority(b, keyword));
      if (priorityCompare != 0) return priorityCompare;

      final rankCompare = _rankOf(a).compareTo(_rankOf(b));
      if (rankCompare != 0) return rankCompare;

      return (a['name_zh']?.toString() ?? '')
          .compareTo(b['name_zh']?.toString() ?? '');
    });
  }

  static int _searchPriority(Map<String, dynamic> row, String? keyword) {
    final q = keyword?.trim();
    if (q == null || q.isEmpty) return _rankOf(row);

    if (_rowHasExactAliasMatch(row, q)) return 0;
    if (_rowHasNamePrefixMatch(row, q)) return 10;
    if (_rowHasAliasFamilyMatch(row, q)) return 20;
    return 50;
  }

  static bool _rowHasExactAliasMatch(Map<String, dynamic> row, String query) {
    final exactValues = [
      row['name_zh'],
      row['name_en'],
      row['slug'],
      ..._stringList(row['aliases']),
    ].whereType<String>();
    return exactValues.any((value) {
      final normalizedValue = normalizeSchoolAliasText(value);
      final normalizedQuery = normalizeSchoolAliasText(query);
      return normalizedValue == normalizedQuery ||
          schoolAliasMatches(query, value);
    });
  }

  static bool _rowHasNamePrefixMatch(Map<String, dynamic> row, String query) {
    final normalizedQuery = normalizeSchoolAliasText(query);
    if (normalizedQuery.isEmpty) return false;
    return [
      row['name_zh'],
      row['name_en'],
    ].whereType<String>().any(
          (value) =>
              normalizeSchoolAliasText(value).startsWith(normalizedQuery),
        );
  }

  static bool _rowHasAliasFamilyMatch(Map<String, dynamic> row, String query) {
    final matchedAliases = kSchoolDisplayAliases.where(
      (alias) => alias.aliases.any((value) => schoolAliasMatches(query, value)),
    );
    return matchedAliases.any((alias) => _rowMatchesAlias(row, alias));
  }

  static bool _matchesCountry(Map<String, dynamic> row, String? country) {
    if (country == null || country.isEmpty) return true;
    final rowCountry = row['country']?.toString();
    final code = row['country_code']?.toString();
    return rowCountry == country ||
        (country == '英国' && code == 'GB') ||
        (country == '美国' && code == 'US');
  }

  static bool _matchesString(dynamic rowValue, String? expected) {
    if (expected == null || expected.isEmpty) return true;
    return rowValue?.toString() == expected;
  }

  static bool _matchesAdvantage(
    Map<String, dynamic> row,
    String? advantageSubject,
  ) {
    if (advantageSubject == null || advantageSubject.isEmpty) return true;
    final values = _stringList(row['advantage_subjects']) +
        _stringList(row['strength_disciplines']);
    return values.any((item) => item.contains(advantageSubject));
  }

  static bool _matchesRank(
    Map<String, dynamic> row, {
    int? minRank,
    int? maxRank,
  }) {
    final rank = row['qs_art_rank'] as int?;
    if (rank == null) return maxRank == null && minRank == null;
    if (minRank != null && rank < minRank) return false;
    if (maxRank != null && rank > maxRank) return false;
    return true;
  }

  static String _inferName(Map<String, String> raw) {
    final explicit = _firstNonEmpty([
      raw['name_zh'],
      raw['name'],
      raw['school_name'],
      raw['school_name_zh'],
    ]);
    if (explicit.isNotEmpty) return explicit;

    final desc = raw['description']?.trim() ?? '';
    if (desc.isEmpty) return '艺术院校';

    final candidates = <String>[];
    for (final marker in ['，', '是', '位于', '为', '（', '(']) {
      final index = desc.indexOf(marker);
      if (index > 1) candidates.add(desc.substring(0, index));
    }
    candidates.sort((a, b) => a.length.compareTo(b.length));
    return candidates.firstWhere(
      (item) => item.trim().length >= 2,
      orElse: () => desc.length <= 18 ? desc : desc.substring(0, 18),
    );
  }

  static SchoolDisplayAlias? _findAliasForRow(Map<String, dynamic> row) {
    final primary = [
      row['name_zh'],
      row['name_en'],
      row['slug'],
    ].whereType<String>().join(' ');
    for (final alias in kSchoolDisplayAliases) {
      if (_textMatchesAlias(primary, alias)) return alias;
    }

    final secondary = [
      row['description'],
      row['official_website'],
    ].whereType<String>().join(' ');
    for (final alias in kSchoolDisplayAliases) {
      if (_textStartsWithAlias(secondary, alias)) return alias;
    }
    return null;
  }

  static bool _rowMatchesAlias(
    Map<String, dynamic> row,
    SchoolDisplayAlias alias,
  ) {
    if (row['slug'] == alias.slug) return true;
    return _textMatchesAlias(
      [
        row['name_zh'],
        row['name_en'],
        row['description'],
        row['slug'],
        ..._stringList(row['aliases']),
      ].whereType<String>().join(' '),
      alias,
    );
  }

  static bool _textMatchesAlias(String text, SchoolDisplayAlias alias) {
    if (text.trim().isEmpty) return false;
    if (text.contains(alias.nameZh) || text.contains(alias.nameEn)) return true;
    return alias.aliases.any((value) => schoolAliasMatches(text, value));
  }

  static bool _textStartsWithAlias(String text, SchoolDisplayAlias alias) {
    final normalized = normalizeSchoolAliasText(text);
    if (normalized.isEmpty) return false;
    final values = [alias.nameZh, alias.nameEn, ...alias.aliases]
        .map(normalizeSchoolAliasText)
        .where((value) => value.isNotEmpty);
    return values.any(normalized.startsWith);
  }

  static String _inferSchoolType(
    List<String> featureTags,
    List<String> disciplines,
  ) {
    final joined = [...featureTags, ...disciplines].join('|');
    if (joined.contains('建筑')) return 'architecture_school';
    if (joined.contains('电影')) return 'film_school';
    if (joined.contains('表演') || joined.contains('戏剧')) {
      return 'performing_arts';
    }
    if (joined.contains('综合大学') || joined.contains('大学院系')) {
      return 'university_art_dept';
    }
    if (joined.contains('设计')) return 'design_school';
    if (joined.contains('艺术学院')) return 'art_academy';
    return 'multi_disciplinary';
  }

  static String? _inferRegionTag(String country, String? code, String? city) {
    final cityValue = city ?? '';
    if (code == 'US') {
      if (RegExp(r'Los Angeles|Long Beach|Northridge|Pasadena|Berkeley|Santa')
          .hasMatch(cityValue)) {
        return 'us_california_flagship';
      }
      if (RegExp(r'New York|Brooklyn|Providence|Boston|New Haven|Pittsburgh')
          .hasMatch(cityValue)) {
        return 'us_northeast_top';
      }
      if (RegExp(r'Chicago|Detroit|Minneapolis|Madison|Columbus')
          .hasMatch(cityValue)) {
        return 'us_midwest_flagship';
      }
      return 'us_south_southwest';
    }
    if (['丹麦', '瑞典', '挪威', '芬兰', '冰岛'].contains(country)) {
      return 'nordics';
    }
    if ([
      '英国',
      '法国',
      '德国',
      '意大利',
      '荷兰',
      '瑞士',
      '奥地利',
      '比利时',
    ].contains(country)) {
      return 'other_europe';
    }
    if (['埃及', '南非', '肯尼亚', '塞内加尔'].contains(country)) {
      return 'other_africa';
    }
    if (['巴西', '智利', '阿根廷', '哥斯达黎加', '危地马拉'].contains(country)) {
      return 'other_south_america';
    }
    return null;
  }

  static List<String> _inferAdvantageSubjects(
    List<String> disciplines,
    Map<String, String> raw,
  ) {
    final values = <String>{};
    final joined = '${disciplines.join('|')} ${raw['major_tags'] ?? ''}';
    for (final subject in ['纯艺', '交互设计', '插画', '工业设计', '建筑', '时尚']) {
      if (joined.contains(subject)) values.add(subject);
    }
    if (joined.contains('fine_arts') || joined.contains('painting')) {
      values.add('纯艺');
    }
    if (joined.contains('interaction')) values.add('交互设计');
    if (joined.contains('illustration')) values.add('插画');
    if (joined.contains('industrial') || joined.contains('product')) {
      values.add('工业设计');
    }
    if (joined.contains('architecture')) values.add('建筑');
    if (joined.contains('fashion')) values.add('时尚');
    return values.toList();
  }

  static int _rankOf(Map<String, dynamic> row) =>
      (row['qs_art_rank'] as int?) ?? 99999;

  static List<String> _splitPipe(String? value) {
    if (value == null || value.trim().isEmpty) return const [];
    return value
        .split('|')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList();
  }

  static List<String> _splitComma(String? value) {
    if (value == null || value.trim().isEmpty) return const [];
    return value
        .split(RegExp(r'[,，]'))
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList();
  }

  static List<String> _stringList(dynamic value) {
    if (value is List) {
      return value
          .map((item) => item.toString())
          .where((item) => item.isNotEmpty)
          .toList();
    }
    return const [];
  }

  static String _firstNonEmpty(List<String?> values) {
    for (final value in values) {
      final normalized = value?.trim();
      if (normalized != null && normalized.isNotEmpty) return normalized;
    }
    return '';
  }

  static String? _emptyToNull(String? value) {
    final normalized = value?.trim();
    return normalized == null || normalized.isEmpty ? null : normalized;
  }

  static String? _cleanUrl(String? value) {
    final normalized = _emptyToNull(value);
    if (normalized == null || normalized.startsWith('/home/')) return null;
    return normalized;
  }

  static int? _intOrNull(String? value) {
    final normalized = value?.trim();
    if (normalized == null || normalized.isEmpty) return null;
    return int.tryParse(normalized) ?? double.tryParse(normalized)?.round();
  }

  static double? _doubleOrNull(String? value) {
    final normalized = value?.trim();
    if (normalized == null || normalized.isEmpty) return null;
    return double.tryParse(normalized);
  }

  static dynamic _decodeJsonOrNull(String? value) {
    final normalized = value?.trim();
    if (normalized == null || normalized.isEmpty) return null;
    try {
      return jsonDecode(normalized);
    } catch (_) {
      return normalized;
    }
  }
}

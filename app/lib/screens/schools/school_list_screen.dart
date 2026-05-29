import 'package:flutter/material.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'school_detail_screen.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// 院校列表 — 分页查询
class SchoolListScreen extends StatefulWidget {
  const SchoolListScreen({super.key});

  @override
  State<SchoolListScreen> createState() => SchoolListScreenState();
}

class SchoolListScreenState extends State<SchoolListScreen>
    with TickerProviderStateMixin {
  final List<Map<String, dynamic>> _items = [];
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  String? _selectedRegionTag;
  String? _selectedSchoolType;
  String? _selectedAdvantageSubject;
  bool _searchPanelExpanded = false;
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

  @override
  void dispose() {
    _searchFocusNode.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void toggleFilterPanel({bool? expand}) {
    final shouldExpand = expand ?? !_searchPanelExpanded;
    setState(() => _searchPanelExpanded = shouldExpand);
  }

  Future<void> _loadMore() async {
    if (_loading || !_hasMore) return;
    setState(() => _loading = true);
    try {
      final result = await BackendApiService.fetchSchools(
        limit: _limit,
        offset: _offset,
        keyword: _searchController.text.trim(),
        regionTag: _selectedRegionTag,
        schoolType: _selectedSchoolType,
        advantageSubject: _selectedAdvantageSubject,
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

  void _setRegionTag(String? value) {
    setState(() => _selectedRegionTag = value);
    _refresh();
  }

  void _setSchoolType(String? value) {
    setState(() => _selectedSchoolType = value);
    _refresh();
  }

  void _setAdvantageSubject(String? value) {
    setState(() => _selectedAdvantageSubject = value);
    _refresh();
  }

  void _clearFilters() {
    setState(() {
      _selectedRegionTag = null;
      _selectedSchoolType = null;
      _selectedAdvantageSubject = null;
    });
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: context.artC.porcelain,
      child: RefreshIndicator(
        color: kCobalt,
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
          children: [
          AnimatedSize(
            duration: const Duration(milliseconds: 260),
            curve: Curves.easeOutCubic,
            alignment: Alignment.topCenter,
            child: _searchPanelExpanded
                ? Padding(
                    padding: const EdgeInsets.only(top: 0, bottom: 12),
                    child: _FilterPanel(
                      selectedRegionTag: _selectedRegionTag,
                      selectedSchoolType: _selectedSchoolType,
                      selectedAdvantageSubject: _selectedAdvantageSubject,
                      onRegionTagChanged: _setRegionTag,
                      onSchoolTypeChanged: _setSchoolType,
                      onAdvantageSubjectChanged: _setAdvantageSubject,
                      onClear: _clearFilters,
                    ),
                  )
                : const SizedBox.shrink(),
          ),
          if (_items.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(2, 0, 2, 10),
              child: Text(
                '共 ${_items.length}${_hasMore ? '+' : ''} 所院校',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: context.artC.ink.withOpacity(0.38),
                ),
              ),
            ),
          if (_items.isEmpty && _loading)
            Padding(
              padding: const EdgeInsets.only(top: 120),
              child: Center(
                child: CircularProgressIndicator(
                  color: kCobalt,
                  strokeWidth: 2.5,
                ),
              ),
            )
          else if (_items.isEmpty && _error != null)
            Padding(
              padding: const EdgeInsets.only(top: 96),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '加载失败: $_error',
                    style: TextStyle(color: context.artC.ink),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _refresh,
                    style: ElevatedButton.styleFrom(backgroundColor: kCobalt),
                    child: Text('重试'),
                  ),
                ],
              ),
            )
          else if (_items.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 120),
              child: Center(
                child: Text(
                  '暂无匹配院校',
                  style: TextStyle(color: context.artC.ink),
                ),
              ),
            )
          else ...[
            for (var index = 0; index < _items.length; index++) ...[
              _SchoolCard(
                data: _items[index],
                onTap: () {
                  final id = _items[index]['id']?.toString();
                  if (id != null && id.isNotEmpty) {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => SchoolDetailScreen(id: id),
                      ),
                    );
                  }
                },
              ),
              const SizedBox(height: 10),
            ],
          ],
          if (_hasMore)
            Builder(
              builder: (context) {
                if (_items.isNotEmpty && !_loading) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    if (context.mounted) _loadMore();
                  });
                }
                return Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: _loading
                          ? CircularProgressIndicator(
                              color: kCobalt,
                              strokeWidth: 2,
                            )
                          : const SizedBox.shrink(),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterPanel extends StatelessWidget{
  final String? selectedRegionTag;
  final String? selectedSchoolType;
  final String? selectedAdvantageSubject;
  final ValueChanged<String?> onRegionTagChanged;
  final ValueChanged<String?> onSchoolTypeChanged;
  final ValueChanged<String?> onAdvantageSubjectChanged;
  final VoidCallback onClear;

  const _FilterPanel({
    required this.selectedRegionTag,
    required this.selectedSchoolType,
    required this.selectedAdvantageSubject,
    required this.onRegionTagChanged,
    required this.onSchoolTypeChanged,
    required this.onAdvantageSubjectChanged,
    required this.onClear,
  });

  static const regionTags = <_FilterOption>[
    _FilterOption('us_midwest_flagship', '中西部旗舰'),
    _FilterOption('us_california_flagship', '加州旗舰'),
    _FilterOption('us_northeast_top', '东北强校'),
    _FilterOption('us_south_southwest', '南方与西南'),
    _FilterOption('nordics', '北欧'),
    _FilterOption('other_europe', '其他欧洲国家'),
    _FilterOption('other_africa', '其他非洲国家'),
    _FilterOption('other_south_america', '其他南美国家'),
  ];

  static const schoolTypes = <_FilterOption>[
    _FilterOption('art_academy', '艺术学院'),
    _FilterOption('design_school', '设计学院'),
    _FilterOption('university_art_dept', '大学艺术院系'),
    _FilterOption('architecture_school', '建筑学院'),
    _FilterOption('film_school', '电影学院'),
    _FilterOption('performing_arts', '表演艺术'),
    _FilterOption('multi_disciplinary', '综合类'),
  ];

  @override
  Widget build(BuildContext context) {
    final hasFilters = selectedRegionTag != null ||
        selectedSchoolType != null ||
        selectedAdvantageSubject != null;

    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.64),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.32)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasFilters)
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: onClear,
                style: TextButton.styleFrom(
                  foregroundColor: kCobalt,
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text(
                  '清除',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          if (hasFilters) const SizedBox(height: 8),
          _FilterSection(
            label: '院校类型',
            items: schoolTypes,
            selectedValue: selectedSchoolType,
            onChanged: onSchoolTypeChanged,
          ),
          const SizedBox(height: 10),
          _FilterSection(
            label: '区域标签',
            items: regionTags,
            selectedValue: selectedRegionTag,
            onChanged: onRegionTagChanged,
          ),
        ],
      ),
    );
  }
}

class _FilterSection extends StatelessWidget {
  final String label;
  final List<_FilterOption> items;
  final String? selectedValue;
  final ValueChanged<String?> onChanged;

  const _FilterSection({
    required this.label,
    required this.items,
    required this.selectedValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: context.artC.ink.withOpacity(0.42),
          ),
        ),
        const SizedBox(height: 7),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildFilterChip(
                context,
                label: '全部',
                value: null,
                isSelected: selectedValue == null,
              ),
              const SizedBox(width: 8),
              ...items.map((item) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _buildFilterChip(
                      context,
                      label: item.label,
                      value: item.value,
                      isSelected: selectedValue == item.value,
                    ),
                  )),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(
    BuildContext context, {
    required String label,
    required String? value,
    required bool isSelected,
  }) {
    return GestureDetector(
      onTap: () => onChanged(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? kCobalt : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? kCobalt : context.artC.silver.withOpacity(0.4),
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : context.artC.ink.withOpacity(0.7),
          ),
        ),
      ),
    );
  }
}

class _FilterOption {
  final String value;
  final String label;

  const _FilterOption(this.value, this.label);
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
    final schoolType = data['school_type'] as String?;
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
                    ? Image.network(
                        logoUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            _SchoolCardLogoFallback(nameZh),
                      )
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
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      if (country != null) _MetaChip(country),
                      if (city != null) _MetaChip(city),
                      if (schoolType != null && schoolType.isNotEmpty)
                        _MetaChip(schoolType),
                      if (qsRank != null)
                        _MetaChip('QS #$qsRank', highlighted: true),
                    ],
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              size: 20,
              color: context.artC.ink.withOpacity(0.25),
            ),
          ],
        ),
      ),
    );
  }
}

class _SchoolCardLogoFallback extends StatelessWidget {
  final String name;

  const _SchoolCardLogoFallback(this.name);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        name.substring(0, 1),
        style: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: kCobalt,
          letterSpacing: 2,
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
        color: highlighted
            ? kCobalt.withOpacity(0.08)
            : context.artC.silver.withOpacity(0.4),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: highlighted ? FontWeight.w700 : FontWeight.w500,
          color: highlighted
              ? kCobalt.withOpacity(0.9)
              : context.artC.ink.withOpacity(0.55),
        ),
      ),
    );
  }
}

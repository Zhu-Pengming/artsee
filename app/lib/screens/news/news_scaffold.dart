import 'package:flutter/material.dart';
import '../../widgets/common.dart';
import '../schools/school_list_screen.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';
import '../../services/backend_api_service.dart';

class NewsScaffold extends StatefulWidget {
  const NewsScaffold({super.key});

  @override
  State<NewsScaffold> createState() => NewsScaffoldState();
}

class NewsScaffoldState extends State<NewsScaffold>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final GlobalKey<SchoolListScreenState> _schoolKey =
      GlobalKey<SchoolListScreenState>();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void toggleSchoolSearchPanel({bool? expand}) {
    if (_tabController.index != 0) {
      _tabController.animateTo(0);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _schoolKey.currentState?.toggleFilterPanel(expand: expand ?? true);
      });
      return;
    }
    _schoolKey.currentState?.toggleFilterPanel(expand: expand);
  }

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _NewsSegmentTabs(controller: _tabController),
            ),
            const SizedBox(height: 6),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  SchoolListScreen(key: _schoolKey),
                  _RankingTab(bottom: bottom),
                  _ArticlesTab(bottom: bottom),
                  _ToolboxTab(bottom: bottom),
                  _CompareTab(bottom: bottom),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RankingTab extends StatefulWidget {
  final double bottom;

  const _RankingTab({required this.bottom});

  @override
  State<_RankingTab> createState() => _RankingTabState();
}

class _RankingTabState extends State<_RankingTab> {
  List<Map<String, dynamic>> _schools = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadRankings();
  }

  Future<void> _loadRankings() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.fetchSchools(
        limit: 50,
        offset: 0,
      );
      if (mounted) {
        final rankedSchools = result.data
            .where((s) => s['qs_art_design_rank'] != null)
            .toList();
        setState(() {
          _schools = rankedSchools;
          _loading = false;
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

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: kCobalt,
      onRefresh: _loadRankings,
      child: ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
        children: [
          _DarkHeroCard(
            eyebrow: 'ART SCHOOL INDEX 2026',
            title: '全球艺术院校热度榜',
            subtitle: '综合 QS、作品集难度、毕业去向与平台搜索热度生成。',
            icon: Icons.emoji_events_outlined,
          ),
          const SizedBox(height: 18),
          _MetricStrip(
            items: [
              ('收录院校', '${_schools.length}'),
              ('国家地区', '18'),
              ('更新频率', '周更'),
            ],
          ),
          const SizedBox(height: 22),
          _NewsSectionHeader(title: '综合排名', action: 'QS + 平台热度'),
          const SizedBox(height: 12),
          if (_loading)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 60),
              child: Center(
                child: CircularProgressIndicator(
                  color: kCobalt,
                  strokeWidth: 2.5,
                ),
              ),
            )
          else if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Column(
                children: [
                  Text(
                    '加载失败: $_error',
                    style: TextStyle(color: context.artC.ink),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _loadRankings,
                    style: ElevatedButton.styleFrom(backgroundColor: kCobalt),
                    child: const Text('重试'),
                  ),
                ],
              ),
            )
          else if (_schools.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 60),
              child: Center(
                child: Text(
                  '暂无排名数据',
                  style: TextStyle(color: context.artC.ink),
                ),
              ),
            )
          else
            ..._schools.asMap().entries.map(
              (entry) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _RankingCard(
                  school: entry.value,
                  displayRank: entry.key + 1,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ArticlesTab extends StatefulWidget {
  final double bottom;

  const _ArticlesTab({required this.bottom});

  @override
  State<_ArticlesTab> createState() => _ArticlesTabState();
}

class _ArticlesTabState extends State<_ArticlesTab> {
  List<Map<String, dynamic>> _articles = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.fetchArticles(limit: 20);
      if (!mounted) return;
      setState(() {
        _articles = result.data;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Center(
        child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2.5),
      );
    }

    if (_error != null) {
      return _ArticleStateView(
        message: '资讯加载失败',
        detail: _error!,
        action: '重试',
        onTap: _load,
      );
    }

    if (_articles.isEmpty) {
      return _ArticleStateView(
        message: '暂无资讯内容',
        detail: '请在后台或 Supabase articles 表中发布内容。',
        action: '刷新',
        onTap: _load,
      );
    }

    final featured = _articles.firstWhere(
      (item) => item['is_featured'] == true,
      orElse: () => _articles.first,
    );
    final list = _articles.where((item) => item['id'] != featured['id']);

    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
      children: [
        _FeatureArticle(article: featured),
        const SizedBox(height: 22),
        _NewsSectionHeader(title: '精选资讯', action: 'ART NEWS'),
        const SizedBox(height: 12),
        ...list.map(
          (article) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _ArticleCard(article: article),
          ),
        ),
      ],
    );
  }
}

class _ToolboxTab extends StatefulWidget {
  final double bottom;

  const _ToolboxTab({required this.bottom});

  @override
  State<_ToolboxTab> createState() => _ToolboxTabState();
}

class _ToolboxTabState extends State<_ToolboxTab> {
  Map<String, dynamic>? _progress;
  List<Map<String, dynamic>> _tools = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final progressFuture = BackendApiService.fetchApplicationProgress();
      final toolsFuture = BackendApiService.fetchTools();
      final results = await Future.wait([progressFuture, toolsFuture]);
      if (mounted) {
        setState(() {
          _progress = results[0] as Map<String, dynamic>;
          _tools = results[1] as List<Map<String, dynamic>>;
          _loading = false;
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

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: kCobalt,
      onRefresh: _loadData,
      child: ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
        children: [
          if (_loading)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 60),
              child: Center(
                child: CircularProgressIndicator(
                  color: kCobalt,
                  strokeWidth: 2.5,
                ),
              ),
            )
          else if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Column(
                children: [
                  Text(
                    '加载失败: $_error',
                    style: TextStyle(color: context.artC.ink),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _loadData,
                    style: ElevatedButton.styleFrom(backgroundColor: kCobalt),
                    child: const Text('重试'),
                  ),
                ],
              ),
            )
          else ...[
            _ProgressPanel(progress: _progress),
            const SizedBox(height: 22),
            _NewsSectionHeader(title: '申请工具箱', action: 'MVP TOOLS'),
            const SizedBox(height: 12),
            if (_tools.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Center(
                  child: Text(
                    '暂无工具',
                    style: TextStyle(color: context.artC.ink),
                  ),
                ),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _tools.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.92,
                ),
                itemBuilder: (context, index) => _ToolCard(tool: _tools[index]),
              ),
          ],
        ],
      ),
    );
  }
}

class _CompareTab extends StatefulWidget {
  final double bottom;

  const _CompareTab({required this.bottom});

  @override
  State<_CompareTab> createState() => _CompareTabState();
}

class _CompareTabState extends State<_CompareTab> {
  final TextEditingController _searchCtrl = TextEditingController();
  List<Map<String, dynamic>> _schools = const [];
  final List<Map<String, dynamic>> _selected = [];
  Map<String, dynamic>? _report;
  bool _loading = true;
  bool _comparing = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSchools();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadSchools({String? keyword}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.fetchSchools(
        limit: 60,
        keyword: keyword,
      );
      if (!mounted) return;
      setState(() {
        _schools = result.data;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _toggleSchool(Map<String, dynamic> school) {
    final id = school['id']?.toString();
    if (id == null) return;
    final exists = _selected.any((item) => item['id']?.toString() == id);
    setState(() {
      if (exists) {
        _selected.removeWhere((item) => item['id']?.toString() == id);
        _report = null;
      } else if (_selected.length < 5) {
        _selected.add(school);
        _report = null;
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('最多选择 5 所院校')),
        );
      }
    });
  }

  Future<void> _generateReport() async {
    if (_selected.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请至少选择 2 所院校')),
      );
      return;
    }
    setState(() => _comparing = true);
    try {
      final report = await BackendApiService.compareSchools(
        schoolIds: _selected.map((school) => school['id'].toString()).toList(),
      );
      if (!mounted) return;
      setState(() {
        _report = report;
        _comparing = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _comparing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('生成失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
      children: [
        _DarkHeroCard(
          eyebrow: 'COMPARISON CENTER',
          title: '院校深层对比',
          subtitle: '选择 2-5 所院校，把排名、城市资源、作品集方向、费用压力和就业路径放到同一张决策表里。',
          icon: Icons.compare_arrows_rounded,
        ),
        const SizedBox(height: 14),
        _CompareSearchBar(
          controller: _searchCtrl,
          onSubmitted: (value) => _loadSchools(keyword: value.trim()),
          onClear: () {
            _searchCtrl.clear();
            _loadSchools();
          },
        ),
        const SizedBox(height: 14),
        _SelectedCompareStrip(
          selected: _selected,
          onRemove: (id) {
            setState(() {
              _selected.removeWhere((item) => item['id']?.toString() == id);
              _report = null;
            });
          },
          onCompare: _generateReport,
          comparing: _comparing,
        ),
        const SizedBox(height: 14),
        _NewsSectionHeader(title: '选择院校', action: '${_selected.length}/5'),
        const SizedBox(height: 10),
        if (_loading)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 36),
            child: Center(child: CircularProgressIndicator(color: kCobalt)),
          )
        else if (_error != null)
          _CompareEmptyState(title: '院校加载失败', subtitle: _error!, onRetry: () => _loadSchools())
        else
          SizedBox(
            height: 186,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _schools.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final school = _schools[index];
                final id = school['id']?.toString();
                final selected = _selected.any(
                  (item) => item['id']?.toString() == id,
                );
                return SizedBox(
                  width: 176,
                  child: _CompareSchoolCard(
                    school: school,
                    selected: selected,
                    onTap: () => _toggleSchool(school),
                  ),
                );
              },
            ),
          ),
        const SizedBox(height: 20),
        _NewsSectionHeader(
          title: '对比报告',
          action: _report == null ? 'SELECT SCHOOLS' : 'SAVED',
        ),
        const SizedBox(height: 12),
        if (_report == null)
          _CompareEmptyState(
            title: '等待生成对比',
            subtitle: '选择至少两所院校后点击“生成对比”，系统会把结果保存为一份 Supabase 对比快照。',
            onRetry: _generateReport,
          )
        else ...[
          _DynamicCompareTable(report: _report!),
          const SizedBox(height: 14),
          _InsightCard(text: _report!['insight']?.toString()),
        ],
      ],
    );
  }
}

class _CompareSearchBar extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onSubmitted;
  final VoidCallback onClear;

  const _CompareSearchBar({
    required this.controller,
    required this.onSubmitted,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: context.artC.silver.withOpacity(0.34)),
        boxShadow: [
          BoxShadow(
            color: context.artC.ink.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(Icons.search, color: context.artC.ink.withOpacity(0.36), size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: controller,
              textInputAction: TextInputAction.search,
              onSubmitted: onSubmitted,
              decoration: const InputDecoration(
                hintText: '搜索 RCA、UAL、RISD、Parsons...',
                border: InputBorder.none,
                isDense: true,
              ),
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          IconButton(
            onPressed: onClear,
            icon: const Icon(Icons.close_rounded, size: 17),
            color: context.artC.ink.withOpacity(0.32),
          ),
        ],
      ),
    );
  }
}

class _SelectedCompareStrip extends StatelessWidget {
  final List<Map<String, dynamic>> selected;
  final ValueChanged<String> onRemove;
  final VoidCallback onCompare;
  final bool comparing;

  const _SelectedCompareStrip({
    required this.selected,
    required this.onRemove,
    required this.onCompare,
    required this.comparing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.stacked_line_chart_rounded,
                  color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  selected.isEmpty ? '还没有选择院校' : '已选择 ${selected.length} 所',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              GestureDetector(
                onTap: comparing ? null : onCompare,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: selected.length >= 2
                        ? kCobalt
                        : Colors.white.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    comparing ? '生成中' : '生成对比',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            ],
          ),
          if (selected.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: selected.map((school) {
                final id = school['id']?.toString() ?? '';
                final name = _schoolName(school);
                return GestureDetector(
                  onTap: () => onRemove(id),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: Colors.white.withOpacity(0.12)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Icon(Icons.close_rounded,
                            color: Colors.white.withOpacity(0.62), size: 13),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class _CompareSchoolCard extends StatelessWidget {
  final Map<String, dynamic> school;
  final bool selected;
  final VoidCallback onTap;

  const _CompareSchoolCard({
    required this.school,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final rank = school['qs_art_design_rank'] ?? school['qs_art_rank'] ?? school['rank'];
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected ? kCobalt : Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: selected ? kCobalt : context.artC.silver.withOpacity(0.38),
          ),
          boxShadow: selected
              ? [kShadowCard]
              : [
                  BoxShadow(
                    color: context.artC.ink.withOpacity(0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: selected
                        ? Colors.white.withOpacity(0.16)
                        : context.artC.silver.withOpacity(0.22),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(
                    _initials(school),
                    style: TextStyle(
                      color: selected ? Colors.white : kCobalt,
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
                const Spacer(),
                Icon(
                  selected ? Icons.check_circle_rounded : Icons.add_circle_outline,
                  color: selected ? Colors.white : kCobalt,
                  size: 20,
                ),
              ],
            ),
            const Spacer(),
            Text(
              _schoolName(school),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: selected ? Colors.white : context.artC.ink,
                fontSize: 16,
                height: 1.15,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              school['name_en']?.toString() ?? '',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: selected
                    ? Colors.white.withOpacity(0.62)
                    : context.artC.ink.withOpacity(0.34),
                fontSize: 10,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                _MiniCompareChip(
                  text: rank == null ? '暂无排名' : '#$rank',
                  selected: selected,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: _MiniCompareChip(
                    text: school['city']?.toString() ?? '城市待定',
                    selected: selected,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniCompareChip extends StatelessWidget {
  final String text;
  final bool selected;

  const _MiniCompareChip({required this.text, required this.selected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
      decoration: BoxDecoration(
        color: selected
            ? Colors.white.withOpacity(0.12)
            : context.artC.silver.withOpacity(0.28),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          color: selected ? Colors.white : context.artC.ink.withOpacity(0.42),
          fontSize: 9,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _DynamicCompareTable extends StatelessWidget {
  final Map<String, dynamic> report;

  const _DynamicCompareTable({required this.report});

  @override
  Widget build(BuildContext context) {
    final schools = (report['schools'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final rows = (report['rows'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          headingRowHeight: 44,
          dataRowMinHeight: 54,
          dataRowMaxHeight: 76,
          columnSpacing: 22,
          columns: [
            const DataColumn(label: Text('维度')),
            ...schools.map(
              (school) => DataColumn(
                label: SizedBox(
                  width: 96,
                  child: Text(
                    school['name']?.toString() ?? '院校',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ),
            ),
            const DataColumn(label: Text('建议')),
          ],
          rows: rows.map((row) {
            final values = (row['values'] as List<dynamic>? ?? []);
            return DataRow(
              cells: [
                DataCell(Text(
                  row['label']?.toString() ?? '',
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.48),
                    fontWeight: FontWeight.w900,
                  ),
                )),
                ...List.generate(schools.length, (index) {
                  return DataCell(
                    SizedBox(
                      width: 96,
                      child: Text(
                        index < values.length ? values[index].toString() : '-',
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: context.artC.ink,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  );
                }),
                DataCell(Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: kCobalt.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    row['winner']?.toString() ?? '看方向',
                    style: const TextStyle(
                      color: kCobalt,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                )),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _CompareEmptyState extends StatelessWidget {
  final String title;
  final String subtitle;
  final VoidCallback onRetry;

  const _CompareEmptyState({
    required this.title,
    required this.subtitle,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.34)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.compare_arrows_rounded, color: kCobalt),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.44),
                    fontSize: 12,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            color: kCobalt,
          ),
        ],
      ),
    );
  }
}

String _schoolName(Map<String, dynamic> school) {
  return school['name_zh']?.toString().isNotEmpty == true
      ? school['name_zh'].toString()
      : school['name_en']?.toString().isNotEmpty == true
          ? school['name_en'].toString()
          : school['name']?.toString() ?? '未命名院校';
}

String _initials(Map<String, dynamic> school) {
  final raw = school['name_en']?.toString().isNotEmpty == true
      ? school['name_en'].toString()
      : _schoolName(school);
  final words = raw
      .split(RegExp(r'\s+'))
      .where((word) => word.trim().isNotEmpty)
      .toList();
  if (words.length >= 2) {
    return '${words[0][0]}${words[1][0]}'.toUpperCase();
  }
  return raw.characters.take(2).toString().toUpperCase();
}

class _DarkHeroCard extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String subtitle;
  final IconData icon;

  const _DarkHeroCard({
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  eyebrow,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.38),
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.8,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    height: 1.05,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.48),
                    fontSize: 12,
                    height: 1.45,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 18),
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: kCobalt,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
        ],
      ),
    );
  }
}

class _MetricStrip extends StatelessWidget {
  final List<(String label, String value)> items;

  const _MetricStrip({required this.items});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: items.map((item) {
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: item == items.last ? 0 : 8),
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: context.artC.silver.withOpacity(0.35)),
            ),
            child: Column(
              children: [
                Text(
                  item.$2,
                  style: const TextStyle(
                    color: kCobalt,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  item.$1,
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.36),
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _NewsSectionHeader extends StatelessWidget {
  final String title;
  final String action;

  const _NewsSectionHeader({required this.title, required this.action});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.2,
              color: context.artC.ink,
            ),
          ),
        ),
        Text(
          action,
          style: const TextStyle(
            color: kCobalt,
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.4,
          ),
        ),
      ],
    );
  }
}

class _RankingCard extends StatelessWidget {
  final Map<String, dynamic> school;
  final int displayRank;

  const _RankingCard({required this.school, required this.displayRank});

  @override
  Widget build(BuildContext context) {
    final nameZh = school['name_zh'] as String? ?? '—';
    final nameEn = school['name_en'] as String? ?? '';
    final city = school['city'] as String? ?? '';
    final country = school['country'] as String? ?? '';
    final qsRank = school['qs_art_design_rank'] as int?;
    final schoolType = school['school_type'] as String? ?? '';
    final rankStr = displayRank.toString().padLeft(2, '0');
    final score = qsRank != null ? (100 - qsRank).clamp(50, 100) : 75;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Row(
        children: [
          Text(
            rankStr,
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w900,
              fontStyle: FontStyle.italic,
              color: displayRank == 1
                  ? kCobalt
                  : context.artC.ink.withOpacity(0.18),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  nameZh,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '$nameEn · ${city.isNotEmpty ? city : country}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.34),
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    minHeight: 5,
                    value: score / 100,
                    backgroundColor: context.artC.silver.withOpacity(0.35),
                    color: kCobalt,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$score',
                style: const TextStyle(
                  color: kCobalt,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 4),
              if (qsRank != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: kCobalt.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    'QS #$qsRank',
                    style: const TextStyle(
                      color: kCobalt,
                      fontSize: 8,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                )
              else if (schoolType.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: kCobalt.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    schoolType,
                    style: const TextStyle(
                      color: kCobalt,
                      fontSize: 8,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FeatureArticle extends StatelessWidget {
  final Map<String, dynamic> article;

  const _FeatureArticle({required this.article});

  @override
  Widget build(BuildContext context) {
    final title = article['title']?.toString() ?? '艺术资讯';
    final category = article['category']?.toString() ?? 'EDITORIAL PICK';
    final coverUrl = article['cover_url']?.toString();
    final summary = article['summary']?.toString();

    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: Stack(
        children: [
          AspectRatio(
            aspectRatio: 1.45,
            child: coverUrl != null && coverUrl.isNotEmpty
                ? Image.network(coverUrl, fit: BoxFit.cover)
                : Container(
                    color: context.artC.ink,
                    child: const Icon(
                      Icons.article_outlined,
                      color: Colors.white30,
                      size: 64,
                    ),
                  ),
          ),
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [context.artC.ink.withOpacity(0.88), Colors.transparent],
                ),
              ),
            ),
          ),
          Positioned(
            left: 20,
            right: 20,
            bottom: 20,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.16),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    category.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 8,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.6,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    height: 1.08,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                if (summary != null && summary.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    summary,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.58),
                      fontSize: 11,
                      height: 1.35,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ArticleCard extends StatelessWidget {
  final Map<String, dynamic> article;

  const _ArticleCard({required this.article});

  @override
  Widget build(BuildContext context) {
    final title = article['title']?.toString() ?? '未命名资讯';
    final category = article['category']?.toString() ?? '资讯';
    final readCount = article['read_count'] as int? ?? 0;
    final source = article['source']?.toString();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: context.artC.silver.withOpacity(0.24),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.article_outlined, color: kCobalt),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 14,
                    height: 1.25,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '$category · ${_formatReadCount(readCount)} 阅读${source == null || source.isEmpty ? '' : ' · $source'}',
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.34),
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: kCobalt, size: 18),
        ],
      ),
    );
  }
}

class _ArticleStateView extends StatelessWidget {
  final String message;
  final String detail;
  final String action;
  final VoidCallback onTap;

  const _ArticleStateView({
    required this.message,
    required this.detail,
    required this.action,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.article_outlined, color: kCobalt, size: 34),
            const SizedBox(height: 14),
            Text(
              message,
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              detail,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: context.artC.ink.withOpacity(0.42),
                fontSize: 12,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: onTap,
              child: Text(action),
            ),
          ],
        ),
      ),
    );
  }
}

String _formatReadCount(int count) {
  if (count >= 10000) {
    final value = count / 10000;
    return '${value.toStringAsFixed(value >= 10 ? 0 : 1)}w';
  }
  if (count >= 1000) {
    final value = count / 1000;
    return '${value.toStringAsFixed(value >= 10 ? 0 : 1)}k';
  }
  return '$count';
}

class _ProgressPanel extends StatelessWidget {
  final Map<String, dynamic>? progress;

  const _ProgressPanel({this.progress});

  @override
  Widget build(BuildContext context) {
    final percentage = progress?['percentage'] as int? ?? 0;
    final suggestions = (progress?['suggestions'] as List<dynamic>?)?.cast<String>() ?? [];
    final suggestionText = suggestions.isEmpty
        ? '继续保持，完成度很高！'
        : '建议优先补全：${suggestions.join('、')}。';

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_graph, color: kCobalt),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '你的申请准备度',
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
              Text(
                '$percentage%',
                style: const TextStyle(
                  color: kCobalt,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 8,
              value: percentage / 100,
              backgroundColor: context.artC.silver.withOpacity(0.34),
              color: kCobalt,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            suggestionText,
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.45),
              fontSize: 12,
              height: 1.45,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _ToolCard extends StatelessWidget {
  final Map<String, dynamic> tool;

  const _ToolCard({required this.tool});

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'timeline':
        return Icons.timeline_outlined;
      case 'checklist':
        return Icons.checklist_rtl;
      case 'dashboard':
        return Icons.dashboard_customize_outlined;
      case 'document':
        return Icons.edit_document;
      default:
        return Icons.apps;
    }
  }

  Color _getColor(String? colorHex) {
    if (colorHex == null || !colorHex.startsWith('#')) return kCobalt;
    try {
      return Color(int.parse(colorHex.substring(1), radix: 16) + 0xFF000000);
    } catch (e) {
      return kCobalt;
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = tool['title'] as String? ?? '';
    final subtitle = tool['subtitle'] as String? ?? '';
    final iconName = tool['icon'] as String? ?? 'apps';
    final colorHex = tool['color'] as String?;
    final icon = _getIcon(iconName);
    final color = _getColor(colorHex);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const Spacer(),
          Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.4),
              fontSize: 11,
              height: 1.35,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _CompareSchoolTile extends StatelessWidget {
  final String name;
  final String subtitle;

  const _CompareSchoolTile({required this.name, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            name,
            style: const TextStyle(
              color: kCobalt,
              fontSize: 24,
              fontWeight: FontWeight.w900,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.36),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }
}

class _CompareTable extends StatelessWidget {
  final List<(String label, String a, String b, String winner)> rows;

  const _CompareTable({required this.rows});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Column(
        children: rows.map((row) {
          final isLast = row == rows.last;
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              border: isLast
                  ? null
                  : Border(
                      bottom: BorderSide(
                        color: context.artC.silver.withOpacity(0.34),
                      ),
                    ),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 64,
                  child: Text(
                    row.$1,
                    style: TextStyle(
                      color: context.artC.ink.withOpacity(0.36),
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                Expanded(
                  child: Text(
                    row.$2,
                    style: TextStyle(
                      color: context.artC.ink,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                Expanded(
                  child: Text(
                    row.$3,
                    style: TextStyle(
                      color: context.artC.ink,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: kCobalt.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    row.$4,
                    style: const TextStyle(
                      color: kCobalt,
                      fontSize: 8,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _InsightCard extends StatelessWidget {
  final String? text;

  const _InsightCard({this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: kCobalt.withOpacity(0.08),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: kCobalt.withOpacity(0.12)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.auto_awesome, color: kCobalt, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text ??
                  'AI 建议：如果你偏研究型设计与概念深度，优先研究型院校；如果你需要更宽的专业池和行业网络，综合艺术大学更适合做组合申请。',
              style: TextStyle(
                color: context.artC.ink.withOpacity(0.62),
                fontSize: 12,
                height: 1.45,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NewsSegmentTabs extends StatelessWidget {
  final TabController controller;

  const _NewsSegmentTabs({required this.controller});

  @override
  Widget build(BuildContext context) {
    const tabs = [
      (label: '院校', icon: Icons.school_outlined),
      (label: '排名', icon: Icons.leaderboard_outlined),
      (label: '资讯', icon: Icons.article_outlined),
      (label: '工具箱', icon: Icons.inventory_2_outlined),
      (label: '对比', icon: Icons.compare_arrows_rounded),
    ];

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.28),
        borderRadius: BorderRadius.circular(16),
      ),
      child: TabBar(
        controller: controller,
        indicator: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: context.artC.ink.withOpacity(0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: kCobalt,
        unselectedLabelColor: context.artC.ink.withOpacity(0.42),
        labelStyle: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
        tabs: tabs
            .map(
              (tab) => Tab(
                height: 40,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(tab.icon, size: 12),
                    const SizedBox(width: 3),
                    Flexible(
                      child: Text(
                        tab.label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../../widgets/common.dart';
import '../schools/school_list_screen.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';
import '../../services/backend_api_service.dart';
import '_radar_compare_chart.dart';
import '_application_workspace_widgets.dart';

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
    _tabController = TabController(length: 3, vsync: this);
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
        _schoolKey.currentState?.openDecisionFilterSheet();
      });
      return;
    }
    _schoolKey.currentState?.openDecisionFilterSheet();
  }

  /// 设置院校搜索关键词
  void setSchoolSearchKeyword(String keyword) {
    if (_tabController.index != 0) {
      _tabController.animateTo(0);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _schoolKey.currentState?.setSearchKeyword(keyword);
      });
      return;
    }
    _schoolKey.currentState?.setSearchKeyword(keyword);
  }

  /// 获取当前院校搜索关键词
  String get schoolSearchKeyword =>
      _schoolKey.currentState?.searchKeyword ?? '';

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
                  _CompareTab(bottom: bottom),
                  _ToolboxTab(bottom: bottom),
                ],
              ),
            ),
          ],
        ),
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
  int _targetSchoolCount = 0;
  int _materialCount = 0;
  int _completedMaterialCount = 0;

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
          _targetSchoolCount = _progress?['target_school_count'] as int? ?? 0;
          _materialCount = _progress?['material_count'] as int? ?? 0;
          _completedMaterialCount =
              _progress?['completed_material_count'] as int? ?? 0;
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
    final percentage = _progress?['percentage'] as int? ?? 0;
    final hasTargetSchools = _targetSchoolCount > 0;

    return RefreshIndicator(
      color: kCobalt,
      onRefresh: _loadData,
      child: ListView(
        padding: EdgeInsets.fromLTRB(20, 8, 20, widget.bottom + 72),
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
            // 第一层：申请状态总览
            ApplicationStatusOverview(
              percentage: percentage,
              targetSchoolCount: _targetSchoolCount,
              materialCount: _materialCount,
              completedMaterialCount: _completedMaterialCount,
              hasTargetSchools: hasTargetSchools,
            ),
            const SizedBox(height: 14),

            // 第二层：核心工具
            _NewsSectionHeader(title: '核心工具', action: ''),
            const SizedBox(height: 6),
            CoreToolsGrid(
              tools: _tools,
              materialCount: _materialCount,
              completedMaterialCount: _completedMaterialCount,
              hasTargetSchools: hasTargetSchools,
            ),
            const SizedBox(height: 18),

            // 第三层：下一步任务
            if (!hasTargetSchools) ...[
              NextStepTasks(hasTargetSchools: hasTargetSchools),
              const SizedBox(height: 18),
            ],

            // 第四层：申请资源
            _NewsSectionHeader(title: '申请资源', action: ''),
            const SizedBox(height: 6),
            const ApplicationResources(),
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
  final List<Map<String, dynamic>> _selected = [];
  List<Map<String, dynamic>> _targetPool = const [];
  Map<String, dynamic>? _report;
  bool _comparing = false;
  bool _loadingTargetPool = true;

  @override
  void initState() {
    super.initState();
    _loadTargetPool();
  }

  Future<void> _loadTargetPool() async {
    setState(() => _loadingTargetPool = true);
    try {
      final saved = await BackendApiService.fetchSavedSchools(limit: 20);
      if (!mounted) return;
      setState(() {
        _targetPool = saved.data;
        _loadingTargetPool = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _targetPool = const [];
        _loadingTargetPool = false;
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

  void _removeSchool(String id) {
    setState(() {
      _selected.removeWhere((item) => item['id']?.toString() == id);
      _report = null;
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

  void _showAddSchoolSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => _AddSchoolBottomSheet(
        selected: _selected,
        onToggle: (school) {
          _toggleSchool(school);
        },
      ),
    ).then((_) {
      // 关闭后刷新主页面
      if (mounted) setState(() {});
      _loadTargetPool();
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 72),
      children: [
        _NewsSectionHeader(
          title: '目标院校对比',
          action: '已选 ${_selected.length}/5',
        ),
        const SizedBox(height: 16),

        // 已选学校区 或 空状态
        if (_selected.isEmpty)
          _CompareEmptyState(
            title: '先加入目标池，再做对比',
            subtitle: '从院校页点击「目标池」或在这里添加 2-5 所学校，对比排名、作品集难度、预算和城市资源。',
            onRetry: null,
          )
        else
          _SelectedSchoolsPanel(
            selected: _selected,
            onRemove: _removeSchool,
          ),

        if (_selected.isEmpty) ...[
          const SizedBox(height: 14),
          _TargetPoolPanel(
            loading: _loadingTargetPool,
            schools: _targetPool,
            selected: _selected,
            onAdd: _toggleSchool,
            onOpenAddSheet: _showAddSchoolSheet,
          ),
        ],

        const SizedBox(height: 20),

        // 操作按钮区
        _CompareActionButtons(
          selectedCount: _selected.length,
          comparing: _comparing,
          onAddSchool: _showAddSchoolSheet,
          onCompare: _generateReport,
        ),

        // 报告区
        if (_report != null) ...[
          const SizedBox(height: 24),
          _NewsSectionHeader(
            title: '多维对比报告',
            action: '已生成',
          ),
          const SizedBox(height: 12),
          RadarCompareChart(report: _report!),
          const SizedBox(height: 20),
          _InsightCard(text: _report!['insight']?.toString()),
          const SizedBox(height: 20),
          _NewsSectionHeader(title: '维度解读', action: '6 个维度'),
          const SizedBox(height: 12),
          DimensionExplanations(report: _report!),
        ],
      ],
    );
  }
}

// 已选学校面板
class _SelectedSchoolsPanel extends StatelessWidget {
  final List<Map<String, dynamic>> selected;
  final ValueChanged<String> onRemove;

  const _SelectedSchoolsPanel({
    required this.selected,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.stacked_line_chart_rounded,
                  color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Text(
                '已选择 ${selected.length} 所院校',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: selected.map((school) {
              final id = school['id']?.toString() ?? '';
              final name = _schoolName(school);
              return GestureDetector(
                onTap: () => onRemove(id),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(999),
                    border:
                        Border.all(color: Colors.white.withValues(alpha: 0.18)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Icon(Icons.close_rounded,
                          color: Colors.white.withValues(alpha: 0.6), size: 14),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _TargetPoolPanel extends StatelessWidget {
  final bool loading;
  final List<Map<String, dynamic>> schools;
  final List<Map<String, dynamic>> selected;
  final ValueChanged<Map<String, dynamic>> onAdd;
  final VoidCallback onOpenAddSheet;

  const _TargetPoolPanel({
    required this.loading,
    required this.schools,
    required this.selected,
    required this.onAdd,
    required this.onOpenAddSheet,
  });

  @override
  Widget build(BuildContext context) {
    final candidates = schools.take(4).toList();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '目标池候选',
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Text(
                loading ? '加载中' : '${schools.length} 所',
                style: const TextStyle(
                  color: kCobalt,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '目标池是候选学校；对比是在目标池里选择 2-5 所生成分析。',
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.42),
              fontSize: 11,
              height: 1.35,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          if (loading)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child:
                    CircularProgressIndicator(color: kCobalt, strokeWidth: 2),
              ),
            )
          else if (candidates.isEmpty)
            GestureDetector(
              onTap: onOpenAddSheet,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 13),
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.07),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Center(
                  child: Text(
                    '还没有目标院校，先去添加',
                    style: TextStyle(
                      color: kCobalt,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            )
          else
            ...candidates.map((school) {
              final id = school['id']?.toString() ??
                  school['school_id']?.toString() ??
                  '';
              final isSelected =
                  selected.any((item) => item['id']?.toString() == id);
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        _schoolName(school),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: context.artC.ink,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: isSelected ? null : () => onAdd(school),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? context.artC.silver.withValues(alpha: 0.24)
                              : kCobalt.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          isSelected ? '已加入' : '加入对比',
                          style: TextStyle(
                            color: isSelected
                                ? context.artC.ink.withValues(alpha: 0.38)
                                : kCobalt,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

// 操作按钮区
class _CompareActionButtons extends StatelessWidget {
  final int selectedCount;
  final bool comparing;
  final VoidCallback onAddSchool;
  final VoidCallback onCompare;

  const _CompareActionButtons({
    required this.selectedCount,
    required this.comparing,
    required this.onAddSchool,
    required this.onCompare,
  });

  @override
  Widget build(BuildContext context) {
    final canCompare = selectedCount >= 2 && !comparing;
    return Row(
      children: [
        // 添加院校按钮
        Expanded(
          child: GestureDetector(
            onTap: onAddSchool,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kCobalt.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_rounded, color: kCobalt, size: 20),
                  const SizedBox(width: 6),
                  const Text(
                    '去添加院校',
                    style: TextStyle(
                      color: kCobalt,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        // 生成对比按钮
        Expanded(
          child: GestureDetector(
            onTap: canCompare ? onCompare : null,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: canCompare ? kCobalt : kCobalt.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Text(
                  comparing
                      ? '生成中...'
                      : canCompare
                          ? '生成对比'
                          : '至少选择 2 所',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// 添加院校 Bottom Sheet
class _AddSchoolBottomSheet extends StatefulWidget {
  final List<Map<String, dynamic>> selected;
  final ValueChanged<Map<String, dynamic>> onToggle;

  const _AddSchoolBottomSheet({
    required this.selected,
    required this.onToggle,
  });

  @override
  State<_AddSchoolBottomSheet> createState() => _AddSchoolBottomSheetState();
}

class _AddSchoolBottomSheetState extends State<_AddSchoolBottomSheet> {
  List<Map<String, dynamic>> _schools = [];
  bool _loading = false;
  String? _error;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  // 本地维护已选列表，用于 UI 即时更新
  late List<Map<String, dynamic>> _localSelected;

  @override
  void initState() {
    super.initState();
    _localSelected = List.from(widget.selected);
  }

  @override
  void dispose() {
    _searchController.dispose();
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

  bool _isSelected(Map<String, dynamic> school) {
    final id = school['id']?.toString();
    return _localSelected.any((item) => item['id']?.toString() == id);
  }

  void _handleToggle(Map<String, dynamic> school) {
    final id = school['id']?.toString();
    if (id == null) return;

    setState(() {
      final exists = _localSelected.any((item) => item['id']?.toString() == id);
      if (exists) {
        _localSelected.removeWhere((item) => item['id']?.toString() == id);
      } else if (_localSelected.length < 5) {
        _localSelected.add(school);
      }
    });

    // 同步到父组件
    widget.onToggle(school);
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.92,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: context.artC.porcelain,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // 拖动条
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: context.artC.silver.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // 标题
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                child: Row(
                  children: [
                    Text(
                      '添加对比院校',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: context.artC.silver.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.close_rounded,
                          size: 18,
                          color: context.artC.ink.withValues(alpha: 0.6),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // 搜索框
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: context.artC.silver.withValues(alpha: 0.42),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.search,
                        color: context.artC.ink.withValues(alpha: 0.36),
                        size: 22,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          onChanged: (value) {
                            setState(() => _searchQuery = value);
                            if (value.trim().isNotEmpty) {
                              _loadSchools(keyword: value.trim());
                            } else {
                              setState(() {
                                _schools = [];
                                _error = null;
                              });
                            }
                          },
                          decoration: InputDecoration(
                            hintText: '搜索院校名称、城市或国家',
                            hintStyle: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: context.artC.ink.withValues(alpha: 0.36),
                            ),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding:
                                const EdgeInsets.symmetric(vertical: 12),
                          ),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: context.artC.ink,
                          ),
                        ),
                      ),
                      if (_searchQuery.isNotEmpty)
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _searchController.clear();
                              _searchQuery = '';
                              _schools = [];
                              _error = null;
                            });
                          },
                          child: Icon(
                            Icons.clear,
                            color: context.artC.ink.withValues(alpha: 0.36),
                            size: 20,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // 热门标签（搜索为空时显示）
              if (_searchQuery.isEmpty && !_loading)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: _HotSearchTags(
                    onTagTap: (keyword) {
                      _searchController.text = keyword;
                      setState(() => _searchQuery = keyword);
                      _loadSchools(keyword: keyword);
                    },
                  ),
                ),
              const SizedBox(height: 12),
              // 搜索结果列表
              Expanded(
                child: _loading
                    ? const Center(
                        child: CircularProgressIndicator(color: kCobalt))
                    : _error != null
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('搜索失败',
                                    style: TextStyle(color: context.artC.ink)),
                                const SizedBox(height: 8),
                                TextButton(
                                  onPressed: () =>
                                      _loadSchools(keyword: _searchQuery),
                                  child: const Text('重试'),
                                ),
                              ],
                            ),
                          )
                        : _schools.isEmpty
                            ? Center(
                                child: Text(
                                  _searchQuery.isEmpty ? '输入关键词搜索院校' : '未找到院校',
                                  style: TextStyle(
                                    color:
                                        context.artC.ink.withValues(alpha: 0.5),
                                    fontSize: 14,
                                  ),
                                ),
                              )
                            : ListView.separated(
                                controller: scrollController,
                                padding:
                                    const EdgeInsets.fromLTRB(20, 0, 20, 20),
                                itemCount: _schools.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  final school = _schools[index];
                                  final selected = _isSelected(school);
                                  return _CompareSchoolListItem(
                                    school: school,
                                    selected: selected,
                                    onTap: () => _handleToggle(school),
                                  );
                                },
                              ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _HotSearchTags extends StatelessWidget {
  final ValueChanged<String> onTagTap;

  const _HotSearchTags({required this.onTagTap});

  @override
  Widget build(BuildContext context) {
    final tags = ['RCA', 'UAL', 'Parsons', '伦敦', '纽约', '交互设计', '视觉传达'];

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: tags.map((tag) {
        return GestureDetector(
          onTap: () => onTagTap(tag),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(
                color: context.artC.silver.withValues(alpha: 0.42),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.local_fire_department_rounded,
                  size: 14,
                  color: context.artC.ink.withValues(alpha: 0.42),
                ),
                const SizedBox(width: 6),
                Text(
                  tag,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: context.artC.ink.withValues(alpha: 0.72),
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

class _FloatingCompareDock extends StatelessWidget {
  final List<Map<String, dynamic>> selected;
  final ValueChanged<String> onRemove;
  final VoidCallback onCompare;
  final bool comparing;

  const _FloatingCompareDock({
    required this.selected,
    required this.onRemove,
    required this.onCompare,
    required this.comparing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: kCobalt.withValues(alpha: 0.2),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: kCobalt.withValues(alpha: 0.15),
            blurRadius: 24,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.stacked_line_chart_rounded,
                  color: kCobalt,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '已选择 ${selected.length} 所院校',
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              GestureDetector(
                onTap: comparing || selected.length < 2 ? null : onCompare,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: selected.length >= 2
                        ? kCobalt
                        : kCobalt.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    comparing ? '生成中...' : '生成对比',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
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
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: kCobalt.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: kCobalt.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          color: kCobalt,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Icon(
                        Icons.close_rounded,
                        color: kCobalt.withValues(alpha: 0.62),
                        size: 14,
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
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
                    comparing ? '生成中' : '生成多维对比',
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

class _CompareSchoolListItem extends StatelessWidget {
  final Map<String, dynamic> school;
  final bool selected;
  final VoidCallback onTap;

  const _CompareSchoolListItem({
    required this.school,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final name =
        school['name_zh']?.toString() ?? school['name']?.toString() ?? '未知';
    final enName = school['name']?.toString() ?? '';
    final city = school['city']?.toString() ?? '';
    final country = school['country']?.toString() ?? '';
    final ranking = school['qs_ranking']?.toString() ?? '';
    final location = [city, country].where((s) => s.isNotEmpty).join(', ');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? kCobalt.withValues(alpha: 0.08) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected
                ? kCobalt
                : context.artC.silver.withValues(alpha: 0.42),
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          name,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: context.artC.ink,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (ranking.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: kCobalt.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'QS #$ranking',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: kCobalt,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (enName.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      enName,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: context.artC.ink.withValues(alpha: 0.5),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  if (location.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: context.artC.ink.withValues(alpha: 0.36),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            location,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: context.artC.ink.withValues(alpha: 0.42),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: selected ? kCobalt : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color: selected
                      ? kCobalt
                      : context.artC.silver.withValues(alpha: 0.42),
                  width: 2,
                ),
              ),
              child: selected
                  ? const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 18,
                    )
                  : Icon(
                      Icons.add,
                      color: context.artC.ink.withValues(alpha: 0.36),
                      size: 18,
                    ),
            ),
          ],
        ),
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
    final rank =
        school['qs_art_design_rank'] ?? school['qs_art_rank'] ?? school['rank'];
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
                  selected
                      ? Icons.check_circle_rounded
                      : Icons.add_circle_outline,
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
  final VoidCallback? onRetry;

  const _CompareEmptyState({
    required this.title,
    required this.subtitle,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    const dimensions = [
      '排名与声誉',
      '专业匹配度',
      '作品集难度',
      '申请竞争',
      '费用预算',
      '城市与就业资源',
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.34)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
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
              if (onRetry != null)
                IconButton(
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh_rounded),
                  color: kCobalt,
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            '将对比这些维度',
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.62),
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: dimensions.map((item) {
              return Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: kCobalt.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  item,
                  style: const TextStyle(
                    color: kCobalt,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              );
            }).toList(),
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
                  colors: [
                    context.artC.ink.withOpacity(0.88),
                    Colors.transparent
                  ],
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
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
      (label: '找院校', icon: Icons.school_outlined),
      (label: '对比', icon: Icons.compare_arrows_rounded),
      (label: '申请计划', icon: Icons.inventory_2_outlined),
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
          fontSize: 9,
          fontWeight: FontWeight.w900,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 9,
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
                    const SizedBox(width: 2),
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

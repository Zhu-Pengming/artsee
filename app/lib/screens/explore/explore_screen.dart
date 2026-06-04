import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class ExploreScreen extends StatefulWidget {
  final VoidCallback? onTabChanged;

  const ExploreScreen({super.key, this.onTabChanged});

  @override
  State<ExploreScreen> createState() => ExploreScreenState();
}

class ExploreScreenState extends State<ExploreScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final GlobalKey<_OpportunityTabState> _opportunityKey =
      GlobalKey<_OpportunityTabState>();
  final GlobalKey<_ExhibitionTabState> _exhibitionKey =
      GlobalKey<_ExhibitionTabState>();
  final GlobalKey<_ArtistTabState> _artistKey = GlobalKey<_ArtistTabState>();
  String _searchKeyword = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_handleTabChanged);
  }

  @override
  void dispose() {
    _tabController.removeListener(_handleTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _handleTabChanged() {
    if (_tabController.indexIsChanging) return;
    widget.onTabChanged?.call();
    setState(() {});
  }

  int get activeTabIndex => _tabController.index;

  String get searchHint => switch (_tabController.index) {
        0 => '搜索合作机会、驻留、预算、城市',
        1 => '搜索展览、城市、场馆、工作坊',
        2 => '搜索艺术家、风格、城市、合作方向',
        _ => '搜索发现资源',
      };

  void applySearch(String keyword) {
    setState(() => _searchKeyword = keyword.trim());
  }

  void refreshActiveTab() {
    switch (_tabController.index) {
      case 0:
        _opportunityKey.currentState?._load();
        break;
      case 1:
        _exhibitionKey.currentState?._load();
        break;
      case 2:
        _artistKey.currentState?._load();
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        top: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 0),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _SegmentTabs(
                controller: _tabController,
                tabs: const [
                  (label: '合作机会', icon: Icons.business_center_outlined),
                  (label: '展览活动', icon: Icons.grid_view_rounded),
                  (label: '艺术家库', icon: Icons.palette_outlined),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _OpportunityTab(
                    key: _opportunityKey,
                    bottom: bottom,
                    searchKeyword: _searchKeyword,
                  ),
                  _ExhibitionTab(
                    key: _exhibitionKey,
                    bottom: bottom,
                    searchKeyword: _searchKeyword,
                  ),
                  _ArtistTab(
                    key: _artistKey,
                    bottom: bottom,
                    searchKeyword: _searchKeyword,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OpportunityTab extends StatefulWidget {
  final double bottom;
  final String searchKeyword;

  const _OpportunityTab({
    super.key,
    required this.bottom,
    required this.searchKeyword,
  });

  @override
  State<_OpportunityTab> createState() => _OpportunityTabState();
}

class _OpportunityTabState extends State<_OpportunityTab> {
  List<Map<String, dynamic>> _items = const [];
  final Set<String> _appliedIds = {};
  String _quickFilter = '全部';
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
      final result = await BackendApiService.fetchOpportunities(limit: 30);
      if (!mounted) return;
      setState(() {
        _items = result.data;
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

  Future<void> _apply(Map<String, dynamic> item) async {
    final id = item['id'].toString();
    if (_appliedIds.contains(id)) return;
    final submitted = await _showOpportunityApplySheet(item);
    if (!mounted || submitted != true) return;
    setState(() => _appliedIds.add(id));
  }

  Future<bool?> _showOpportunityApplySheet(Map<String, dynamic> item) async {
    final proposalCtrl = TextEditingController();
    final portfolioCtrl = TextEditingController();
    final experienceCtrl = TextEditingController();
    var submitting = false;
    var proposalError = '';
    final title = item['title']?.toString() ?? '未命名机会';

    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => StatefulBuilder(
        builder: (sheetContext, setSheetState) {
          Future<void> submit() async {
            final proposal = proposalCtrl.text.trim();
            setSheetState(() {
              proposalError = proposal.length < 10 ? '申请说明至少写 10 个字' : '';
            });
            if (proposalError.isNotEmpty || submitting) return;
            setSheetState(() => submitting = true);
            try {
              await BackendApiService.applyOpportunity(
                opportunityId: item['id'].toString(),
                proposal: [
                  proposal,
                  if (portfolioCtrl.text.trim().isNotEmpty)
                    '作品集链接：${portfolioCtrl.text.trim()}',
                  if (experienceCtrl.text.trim().isNotEmpty)
                    '相关经验：${experienceCtrl.text.trim()}',
                ].join('\n\n'),
              );
              if (!sheetContext.mounted) return;
              Navigator.of(sheetContext).pop(true);
              if (!mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('申请已提交，可在机会进度里继续追踪')),
              );
            } catch (e) {
              if (!sheetContext.mounted) return;
              setSheetState(() => submitting = false);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('申请失败：$e')),
              );
            }
          }

          return Padding(
            padding: EdgeInsets.only(
              left: 12,
              right: 12,
              bottom: MediaQuery.viewInsetsOf(sheetContext).bottom + 12,
            ),
            child: Container(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 14),
              decoration: BoxDecoration(
                color: context.artC.porcelain,
                borderRadius: BorderRadius.circular(30),
              ),
              child: SafeArea(
                top: false,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 42,
                        height: 4,
                        decoration: BoxDecoration(
                          color: context.artC.silver.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      '申请这个机会',
                      style: TextStyle(
                        color: context.artC.ink,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'Noto Serif SC',
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: context.artC.ink.withOpacity(0.52),
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _ApplyTextField(
                      controller: proposalCtrl,
                      label: '申请说明',
                      hint: '说明你为什么适合这个项目、能提交什么作品或方案。',
                      maxLines: 4,
                      error: proposalError,
                    ),
                    const SizedBox(height: 12),
                    _ApplyTextField(
                      controller: portfolioCtrl,
                      label: '作品集链接',
                      hint: 'https://...',
                    ),
                    const SizedBox(height: 12),
                    _ApplyTextField(
                      controller: experienceCtrl,
                      label: '相关经验',
                      hint: '类似合作、展览、商业项目经验，可选',
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: submitting
                                ? null
                                : () => Navigator.of(sheetContext).pop(false),
                            child: const Text('取消'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: FilledButton(
                            onPressed: submitting ? null : submit,
                            child: Text(submitting ? '提交中' : '提交申请'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
    proposalCtrl.dispose();
    portfolioCtrl.dispose();
    experienceCtrl.dispose();
    return result;
  }

  void _openDetail(Map<String, dynamic> item) {
    final id = item['id'].toString();
    Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => OpportunityDetailScreen(
          item: item,
          applied: _appliedIds.contains(id),
          onApply: () => _apply(item),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return _LoadingState(bottom: widget.bottom);
    if (_error != null) {
      return _ResourceState(
        bottom: widget.bottom,
        title: '机会加载失败',
        subtitle: _error!,
        onRetry: _load,
      );
    }

    final visibleItems = _filterMaps(_items, widget.searchKeyword)
        .where((item) => _matchesOpportunityQuickFilter(item, _quickFilter))
        .toList();
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 88),
      children: [
        _SectionHeader(title: '推荐机会 (Hot)', action: '${visibleItems.length} 条'),
        const SizedBox(height: 8),
        _FilterHintBar(
          chips: const ['全部', '高预算', '同城', '本周截止', '适合学生', '驻留项目'],
          selected: _quickFilter,
          onSelected: (filter) => setState(() => _quickFilter = filter),
        ),
        const SizedBox(height: 14),
        if (visibleItems.isEmpty)
          _EmptyPanel(
            title: widget.searchKeyword.trim().isEmpty ? '暂无合作机会' : '没有匹配机会',
            subtitle: widget.searchKeyword.trim().isEmpty
                ? '点击右上角 + 发布第一条机会。'
                : '换一个关键词，或发布新的合作机会。',
          )
        else
          ...visibleItems.map((item) {
            final id = item['id'].toString();
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _OpportunityCard(
                item: item,
                applied: _appliedIds.contains(id),
                onOpen: () => _openDetail(item),
                onApply: () => _apply(item),
              ),
            );
          }),
      ],
    );
  }
}

class _ExhibitionTab extends StatefulWidget {
  final double bottom;
  final String searchKeyword;

  const _ExhibitionTab({
    super.key,
    required this.bottom,
    required this.searchKeyword,
  });

  @override
  State<_ExhibitionTab> createState() => _ExhibitionTabState();
}

class _ExhibitionTabState extends State<_ExhibitionTab> {
  List<Map<String, dynamic>> _items = const [];
  final Set<String> _appliedIds = {};
  String _quickFilter = '全部';
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
      final result = await BackendApiService.fetchEvents(limit: 30);
      if (!mounted) return;
      setState(() {
        _items = result.data;
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

  Future<void> _apply(Map<String, dynamic> item) async {
    final id = item['id'].toString();
    if (_appliedIds.contains(id)) return;
    final confirmed = await _showEventApplyConfirm(item);
    if (confirmed != true) return;
    try {
      await BackendApiService.applyEvent(
        eventId: id,
        applyNote: '我想报名参加该活动。',
      );
      if (!mounted) return;
      setState(() => _appliedIds.add(id));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('报名已提交，活动通知会进入私信/预约记录')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('报名失败：$e')),
      );
    }
  }

  Future<bool?> _showEventApplyConfirm(Map<String, dynamic> item) {
    final title = item['title']?.toString() ?? '未命名展览';
    final city = item['city']?.toString();
    final venue = item['venue']?.toString();
    return showModalBottomSheet<bool>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => Padding(
        padding: const EdgeInsets.all(12),
        child: Container(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 14),
          decoration: BoxDecoration(
            color: context.artC.porcelain,
            borderRadius: BorderRadius.circular(28),
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '确认报名',
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  title,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  [
                    _formatDate(item['start_time']),
                    if (city != null && city.isNotEmpty) city,
                    if (venue != null && venue.isNotEmpty) venue,
                  ].join(' · '),
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.46),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '报名后将进入待确认状态，活动通知会进入私信/预约记录。',
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.46),
                    fontSize: 12,
                    height: 1.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(sheetContext).pop(false),
                        child: const Text('取消'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton(
                        onPressed: () => Navigator.of(sheetContext).pop(true),
                        child: const Text('确认报名'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openDetail(Map<String, dynamic> item) {
    final id = item['id'].toString();
    Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => ExhibitionDetailScreen(
          item: item,
          applied: _appliedIds.contains(id),
          onApply: () => _apply(item),
        ),
      ),
    );
  }

  void _openSchedule() {
    final appliedItems = _items
        .where((item) => _appliedIds.contains(item['id'].toString()))
        .toList();
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => Padding(
        padding: const EdgeInsets.all(12),
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: context.artC.porcelain,
            borderRadius: BorderRadius.circular(28),
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '我的展览日程',
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 14),
                if (appliedItems.isEmpty)
                  Text(
                    '暂无报名。报名展览、工作坊或导览后会显示在这里。',
                    style: TextStyle(
                      color: context.artC.ink.withOpacity(0.48),
                      fontSize: 13,
                      height: 1.5,
                      fontWeight: FontWeight.w700,
                    ),
                  )
                else
                  ...appliedItems.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _ScheduleRow(item: item),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return _LoadingState(bottom: widget.bottom);
    if (_error != null) {
      return _ResourceState(
        bottom: widget.bottom,
        title: '展览加载失败',
        subtitle: _error!,
        onRetry: _load,
      );
    }
    final visibleItems = _filterMaps(_items, widget.searchKeyword)
        .where((item) => _matchesExhibitionQuickFilter(item, _quickFilter))
        .toList();
    final featured = visibleItems.isNotEmpty ? visibleItems.first : null;
    final featuredId = featured?['id']?.toString();
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 88),
      children: [
        _FeatureExhibition(
          item: featured,
          applied: featuredId != null && _appliedIds.contains(featuredId),
          onOpen: featured == null ? null : () => _openDetail(featured),
          onApply: featured == null ? null : () => _apply(featured),
        ),
        const SizedBox(height: 14),
        _ScheduleSummaryCard(
          appliedCount: _appliedIds.length,
          onTap: _openSchedule,
        ),
        const SizedBox(height: 14),
        _FilterHintBar(
          chips: const ['全部', '本周', '同城', '免费', '预约制', '线上'],
          selected: _quickFilter,
          onSelected: (filter) => setState(() => _quickFilter = filter),
        ),
        const SizedBox(height: 26),
        _SectionHeader(
          title: '展览与活动日历',
          action: '${visibleItems.length} 场',
          icon: Icons.location_on_outlined,
        ),
        const SizedBox(height: 14),
        if (visibleItems.isEmpty)
          _EmptyPanel(
            title: widget.searchKeyword.trim().isEmpty ? '暂无展览活动' : '没有匹配活动',
            subtitle: widget.searchKeyword.trim().isEmpty
                ? '点击右上角 + 发布展览或沙龙。'
                : '换一个关键词，或发布新的展览活动。',
          )
        else
          ...visibleItems.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _ExhibitionCard(
                item: item,
                applied: _appliedIds.contains(item['id'].toString()),
                onOpen: () => _openDetail(item),
                onApply: () => _apply(item),
              ),
            ),
          ),
        const SizedBox(height: 14),
        _MuseumPanel(),
      ],
    );
  }
}

class _ArtistTab extends StatefulWidget {
  final double bottom;
  final String searchKeyword;

  const _ArtistTab({
    super.key,
    required this.bottom,
    required this.searchKeyword,
  });

  @override
  State<_ArtistTab> createState() => _ArtistTabState();
}

class _ArtistTabState extends State<_ArtistTab> {
  List<Map<String, dynamic>> _items = const [];
  bool _loading = true;
  String? _error;
  String _quickFilter = '全部';

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
      final result = await BackendApiService.fetchArtists(limit: 30);
      if (!mounted) return;
      setState(() {
        _items = result.data;
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
    if (_loading) return _LoadingState(bottom: widget.bottom);
    if (_error != null) {
      return _ResourceState(
        bottom: widget.bottom,
        title: '艺术家加载失败',
        subtitle: _error!,
        onRetry: _load,
      );
    }
    final visibleItems = _filterMaps(_items, widget.searchKeyword)
        .where((item) => _matchesArtistQuickFilter(item, _quickFilter))
        .toList();
    final availableCount = _items
        .where((item) =>
            (item['cooperation_status']?.toString() ?? 'available') ==
            'available')
        .length;
    final verifiedCount =
        _items.where((item) => item['verification_badges'] != null).length;

    if (visibleItems.isEmpty) {
      return ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 88),
        children: [
          widget.searchKeyword.trim().isEmpty
              ? _ArtistOnboardingPanel()
              : _EmptyPanel(
                  title: '没有匹配艺术家',
                  subtitle: '换一个艺术方向、城市或合作关键词试试。',
                ),
          const SizedBox(height: 14),
          if (widget.searchKeyword.trim().isEmpty) _ArtistExampleStrip(),
        ],
      );
    }
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 88),
      children: [
        _ArtistLibraryHeader(
          totalCount: _items.length,
          availableCount: availableCount,
          verifiedCount: verifiedCount,
        ),
        const SizedBox(height: 14),
        _FilterHintBar(
          chips: const ['全部', '可合作', '认证', '学生', '新锐', '同城'],
          selected: _quickFilter,
          onSelected: (filter) => setState(() => _quickFilter = filter),
        ),
        const SizedBox(height: 20),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: visibleItems.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 14,
            mainAxisSpacing: 18,
            childAspectRatio: 0.62,
          ),
          itemBuilder: (context, index) => _ArtistCard(
            artist: visibleItems[index],
          ),
        ),
      ],
    );
  }
}

class _SegmentTabs extends StatelessWidget {
  final TabController controller;
  final List<({String label, IconData icon})> tabs;

  const _SegmentTabs({required this.controller, required this.tabs});

  @override
  Widget build(BuildContext context) {
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
        labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
        tabs: tabs
            .map(
              (tab) => Tab(
                height: 40,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(tab.icon, size: 14),
                    const SizedBox(width: 6),
                    Text(tab.label),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _OpportunityCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final bool applied;
  final VoidCallback onOpen;
  final VoidCallback onApply;

  const _OpportunityCard({
    required this.item,
    required this.applied,
    required this.onOpen,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    final title = item['title']?.toString() ?? '未命名机会';
    final type = item['type']?.toString() ?? 'collaboration';
    final city = item['city']?.toString();
    final requirements = item['requirements']?.toString() ?? '';
    final deadline = item['deadline'];
    final budget = _formatBudget(item['budget_min'], item['budget_max']);
    final metadata = item['metadata'] is Map
        ? (item['metadata'] as Map).cast<String, dynamic>()
        : const <String, dynamic>{};
    final organization = metadata['organization']?.toString();
    final showOrganization = metadata['show_organization'] != false;
    final deliverable = metadata['deliverable']?.toString();
    final materials = metadata['required_materials'] is List
        ? (metadata['required_materials'] as List)
            .map((e) => e.toString())
            .toList()
        : const <String>[];

    final tags = _extractOpportunityTags(city, requirements);
    final typeLabel = _opportunityTypeLabel(type);
    final deadlineText = _formatDeadlineUrgency(deadline);

    return GestureDetector(
      onTap: onOpen,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: context.artC.silver.withOpacity(0.38)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _MiniBadge(text: typeLabel, color: kCobalt),
                const Spacer(),
                Text(
                  deadlineText,
                  style: TextStyle(
                    fontSize: 10,
                    color: _deadlineColor(deadline, context),
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 16,
                height: 1.25,
                fontWeight: FontWeight.w900,
                color: context.artC.ink,
                fontFamily: 'Noto Serif SC',
              ),
            ),
            const SizedBox(height: 7),
            _OpportunityDecisionLine(
              label: '合作方',
              value: !showOrganization ||
                      organization == null ||
                      organization.isEmpty
                  ? '平台认证项目方'
                  : organization,
            ),
            const SizedBox(height: 6),
            _OpportunityDecisionLine(
              label: '交付',
              value: deliverable == null || deliverable.isEmpty
                  ? '作品集方案 / 初步合作提案'
                  : deliverable,
            ),
            const SizedBox(height: 6),
            _OpportunityDecisionLine(
              label: '材料',
              value:
                  materials.isEmpty ? '作品集 + 简历 + 初步方案' : materials.join(' + '),
            ),
            const SizedBox(height: 8),
            Text(
              requirements.isEmpty
                  ? '适合：有成熟作品集、可执行方案或合作经验的创作者。'
                  : '适合：$requirements',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                height: 1.45,
                fontWeight: FontWeight.w700,
                color: context.artC.ink.withOpacity(0.46),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 5,
              runSpacing: 5,
              children: tags.map((tag) => _SoftTag(text: tag)).toList(),
            ),
            const SizedBox(height: 12),
            Container(height: 1, color: context.artC.silver.withOpacity(0.26)),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: Text(
                    budget,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: applied ? onOpen : onApply,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                    decoration: BoxDecoration(
                      color: applied
                          ? context.artC.silver.withOpacity(0.2)
                          : kCobalt,
                      borderRadius: BorderRadius.circular(999),
                      border: applied
                          ? Border.all(color: context.artC.silver)
                          : null,
                    ),
                    child: Text(
                      applied ? '查看进度' : '申请',
                      style: TextStyle(
                        color: applied
                            ? context.artC.ink.withOpacity(0.7)
                            : Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
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

class _FeatureExhibition extends StatelessWidget {
  final Map<String, dynamic>? item;
  final bool applied;
  final VoidCallback? onOpen;
  final VoidCallback? onApply;

  const _FeatureExhibition({
    this.item,
    required this.applied,
    this.onOpen,
    this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    final title = item?['title']?.toString() ?? '镜中之镜 - 线上VR大展';
    final coverUrl = item?['cover_url']?.toString();
    final city = item?['city']?.toString();
    final venue = item?['venue']?.toString();
    final date = DateTime.tryParse(item?['start_time']?.toString() ?? '');
    final summary = item?['summary']?.toString();
    return GestureDetector(
      onTap: onOpen,
      child: AspectRatio(
        aspectRatio: 1.25,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(26),
          child: Stack(
            fit: StackFit.expand,
            children: [
              coverUrl != null && coverUrl.isNotEmpty
                  ? Image.network(
                      coverUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: context.artC.silver.withOpacity(0.3),
                        child: Icon(
                          Icons.image_outlined,
                          size: 60,
                          color: context.artC.ink.withOpacity(0.2),
                        ),
                      ),
                    )
                  : Container(
                      color: context.artC.silver.withOpacity(0.3),
                      child: Icon(
                        Icons.photo_library_outlined,
                        size: 60,
                        color: context.artC.ink.withOpacity(0.2),
                      ),
                    ),
              DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      context.artC.ink.withOpacity(0.9),
                      Colors.transparent
                    ],
                  ),
                ),
              ),
              Positioned(
                left: 22,
                right: 22,
                bottom: 22,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'FEATURED EXHIBIT HIGHLIGHTS',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.5),
                        fontSize: 8,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      title,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        height: 1.05,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                        fontFamily: 'Noto Serif SC',
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _FeaturePill(
                            text: date == null ? '预约制' : _formatDate(date)),
                        const SizedBox(width: 8),
                        _FeaturePill(
                          text: [
                            if (city != null && city.isNotEmpty) city,
                            if (venue != null && venue.isNotEmpty) venue,
                          ].join(' · ').isEmpty
                              ? '线上 / 线下活动'
                              : [
                                  if (city != null && city.isNotEmpty) city,
                                  if (venue != null && venue.isNotEmpty) venue,
                                ].join(' · '),
                        ),
                      ],
                    ),
                    if (summary != null && summary.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Text(
                        summary,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.72),
                          fontSize: 12,
                          height: 1.45,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _FeatureActionButton(
                          label: '查看详情',
                          icon: Icons.arrow_forward_rounded,
                          onTap: onOpen,
                          filled: false,
                        ),
                        const SizedBox(width: 8),
                        _FeatureActionButton(
                          label: applied ? '已报名' : '立即报名',
                          icon: applied
                              ? Icons.check_circle_rounded
                              : Icons.event_available_rounded,
                          onTap: applied ? null : onApply,
                          filled: true,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ExhibitionCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final bool applied;
  final VoidCallback onOpen;
  final VoidCallback onApply;

  const _ExhibitionCard({
    required this.item,
    required this.applied,
    required this.onOpen,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    final title = item['title']?.toString() ?? '未命名展览';
    final subtitle = item['summary']?.toString() ??
        item['venue']?.toString() ??
        item['hotel_name']?.toString() ??
        '艺术活动';
    final date = DateTime.tryParse(item['start_time']?.toString() ?? '');
    final month = date == null ? '--' : _monthLabel(date.month);
    final day = date == null ? '--' : date.day.toString().padLeft(2, '0');
    final city = item['city']?.toString();
    final venue = item['venue']?.toString();
    final fee = _formatEventFee(item['fee_amount']);
    return GestureDetector(
      onTap: onOpen,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: context.artC.silver.withOpacity(0.4)),
        ),
        child: Row(
          children: [
            Container(
              width: 64,
              height: 78,
              decoration: BoxDecoration(
                color: context.artC.silver.withOpacity(0.24),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    month,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink.withOpacity(0.38),
                    ),
                  ),
                  Text(
                    day,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: kCobalt,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11,
                      color: context.artC.ink.withOpacity(0.36),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined,
                          size: 11, color: context.artC.ink.withOpacity(0.38)),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          [
                            if (city != null && city.isNotEmpty) city,
                            if (venue != null && venue.isNotEmpty) venue,
                          ].join(' · ').isEmpty
                              ? '待定'
                              : [
                                  if (city != null && city.isNotEmpty) city,
                                  if (venue != null && venue.isNotEmpty) venue,
                                ].join(' · '),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: context.artC.ink.withOpacity(0.48),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          fee,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: context.artC.ink.withOpacity(0.58),
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: applied ? onOpen : onApply,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: applied
                                ? context.artC.silver.withOpacity(0.2)
                                : kCobalt,
                            borderRadius: BorderRadius.circular(999),
                            border: applied
                                ? Border.all(
                                    color: context.artC.silver.withOpacity(0.6))
                                : null,
                          ),
                          child: Text(
                            applied ? '已报名' : '报名',
                            style: TextStyle(
                              fontSize: 11,
                              color: applied
                                  ? context.artC.ink.withOpacity(0.65)
                                  : Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterHintBar extends StatelessWidget {
  final List<String> chips;
  final String? selected;
  final ValueChanged<String>? onSelected;

  const _FilterHintBar({
    required this.chips,
    this.selected,
    this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: chips
            .map(
              (chip) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => onSelected?.call(chip),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: (selected ?? chips.first) == chip
                          ? context.artC.ink
                          : Colors.white,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: context.artC.silver.withOpacity(0.4),
                      ),
                    ),
                    child: Text(
                      chip,
                      style: TextStyle(
                        color: (selected ?? chips.first) == chip
                            ? Colors.white
                            : context.artC.ink.withOpacity(0.58),
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _FeaturePill extends StatelessWidget {
  final String text;

  const _FeaturePill({required this.text});

  @override
  Widget build(BuildContext context) {
    return Flexible(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.18),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: Colors.white.withOpacity(0.18)),
        ),
        child: Text(
          text,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 10,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _FeatureActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback? onTap;
  final bool filled;

  const _FeatureActionButton({
    required this.label,
    required this.icon,
    required this.onTap,
    required this.filled,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: filled ? Colors.white : Colors.white.withOpacity(0.15),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: Colors.white.withOpacity(0.22)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon,
                  size: 14, color: filled ? context.artC.ink : Colors.white),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  color: filled ? context.artC.ink : Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ScheduleSummaryCard extends StatelessWidget {
  final int appliedCount;
  final VoidCallback onTap;

  const _ScheduleSummaryCard({
    required this.appliedCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: context.artC.silver.withOpacity(0.36)),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: kCobalt.withOpacity(0.08),
                borderRadius: BorderRadius.circular(15),
              ),
              child: const Icon(Icons.event_note_outlined, color: kCobalt),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '我的展览日程',
                    style: TextStyle(
                      color: context.artC.ink,
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    appliedCount == 0
                        ? '报名后会在这里管理状态'
                        : '$appliedCount 场已报名 · 待确认',
                    style: TextStyle(
                      color: context.artC.ink.withOpacity(0.42),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: kCobalt),
          ],
        ),
      ),
    );
  }
}

class _ScheduleRow extends StatelessWidget {
  final Map<String, dynamic> item;

  const _ScheduleRow({required this.item});

  @override
  Widget build(BuildContext context) {
    final title = item['title']?.toString() ?? '未命名活动';
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  _formatDate(item['start_time']),
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.42),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          _MiniBadge(text: '待确认', color: kCobalt),
        ],
      ),
    );
  }
}

class ExhibitionDetailScreen extends StatelessWidget {
  final Map<String, dynamic> item;
  final bool applied;
  final VoidCallback onApply;

  const ExhibitionDetailScreen({
    super.key,
    required this.item,
    required this.applied,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    final title = item['title']?.toString() ?? '未命名展览';
    final summary =
        item['summary']?.toString() ?? item['description']?.toString();
    final city = item['city']?.toString();
    final venue = item['venue']?.toString();
    final coverUrl = item['cover_url']?.toString();
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 280,
            backgroundColor: context.artC.ink,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (coverUrl != null && coverUrl.isNotEmpty)
                    Image.network(coverUrl, fit: BoxFit.cover)
                  else
                    Container(color: context.artC.silver.withOpacity(0.28)),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          context.artC.ink.withOpacity(0.88),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 110),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _MiniBadge(text: 'EXHIBITION / EVENT', color: kCobalt),
                  const SizedBox(height: 12),
                  Text(
                    title,
                    style: TextStyle(
                      color: context.artC.ink,
                      fontSize: 28,
                      height: 1.12,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 16),
                  _DetailInfoCard(
                    rows: [
                      ('时间', _formatDate(item['start_time'])),
                      (
                        '地点',
                        [
                          if (city != null && city.isNotEmpty) city,
                          if (venue != null && venue.isNotEmpty) venue,
                        ].join(' · ').isEmpty
                            ? '待定'
                            : [
                                if (city != null && city.isNotEmpty) city,
                                if (venue != null && venue.isNotEmpty) venue,
                              ].join(' · ')
                      ),
                      ('费用', _formatEventFee(item['fee_amount'])),
                      ('状态', applied ? '已报名 / 待确认' : '可报名'),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _DetailSection(
                    title: '活动介绍',
                    body: summary == null || summary.isEmpty
                        ? '这里会展示展览、工作坊或导览的介绍、主题和参与价值。'
                        : summary,
                  ),
                  _DetailSection(
                    title: '适合人群',
                    body: '艺术留学申请者、创作者、策展/艺术市场方向用户，以及希望了解现场资源的人。',
                  ),
                  _DetailSection(
                    title: '报名须知',
                    body: '需提前预约；报名后进入待确认状态；活动通知会进入私信/预约记录。',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
          child: FilledButton.icon(
            onPressed: applied ? null : onApply,
            icon: Icon(applied
                ? Icons.check_circle_rounded
                : Icons.event_available_rounded),
            label: Text(applied ? '已报名' : '立即报名'),
          ),
        ),
      ),
    );
  }
}

class _MuseumPanel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const museums = ['龙美术馆', '艺仓艺术馆', 'UCCA Edge', '复星艺术中心'];
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '热门展馆推荐',
            style: TextStyle(
              color: Colors.white.withOpacity(0.4),
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 16),
          ...museums.map(
            (museum) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      museum,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                  Icon(Icons.chevron_right,
                      size: 18, color: Colors.white.withOpacity(0.5)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ArtistCard extends StatelessWidget {
  final Map<String, dynamic> artist;

  const _ArtistCard({required this.artist});

  @override
  Widget build(BuildContext context) {
    final name = artist['display_name']?.toString() ?? '未命名艺术家';
    final fields = (artist['art_fields'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .where((e) => e.isNotEmpty)
        .join(' / ');
    final city = artist['city']?.toString();
    final coverWorkUrl = artist['cover_work_url']?.toString() ??
        artist['featured_work_url']?.toString() ??
        artist['avatar_url']?.toString();
    final cooperationStatus =
        artist['cooperation_status']?.toString() ?? 'available';
    final portfolioCount = artist['portfolio_count'] is int
        ? artist['portfolio_count'] as int
        : int.tryParse(artist['portfolio_count']?.toString() ?? '') ?? 0;
    final exhibitionCount = artist['exhibition_count'] is int
        ? artist['exhibition_count'] as int
        : int.tryParse(artist['exhibition_count']?.toString() ?? '') ?? 0;
    final hasVerification = artist['verification_badges'] != null;
    final careerStage = artist['career_stage']?.toString();

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ArtistDetailScreen(artist: artist),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: context.artC.silver.withOpacity(0.35)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 0.85,
              child: ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(20)),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    coverWorkUrl != null && coverWorkUrl.isNotEmpty
                        ? Image.network(
                            coverWorkUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              color: context.artC.silver.withOpacity(0.3),
                              child: Icon(
                                Icons.palette_outlined,
                                size: 50,
                                color: context.artC.ink.withOpacity(0.2),
                              ),
                            ),
                          )
                        : Container(
                            color: context.artC.silver.withOpacity(0.3),
                            child: Icon(
                              Icons.palette_outlined,
                              size: 50,
                              color: context.artC.ink.withOpacity(0.2),
                            ),
                          ),
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _cooperationStatusColor(cooperationStatus)
                              .withOpacity(0.95),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          _cooperationStatusLabel(cooperationStatus),
                          style: const TextStyle(
                            fontSize: 8,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    fields.isEmpty ? '艺术家' : fields,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: context.artC.ink.withOpacity(0.48),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (city != null && city.isNotEmpty) ...[
                        Icon(Icons.location_on_outlined,
                            size: 11,
                            color: context.artC.ink.withOpacity(0.38)),
                        const SizedBox(width: 3),
                        Text(
                          city,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: context.artC.ink.withOpacity(0.38),
                          ),
                        ),
                        const SizedBox(width: 6),
                      ],
                      if (careerStage != null && careerStage.isNotEmpty)
                        Text(
                          careerStage,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: context.artC.ink.withOpacity(0.38),
                          ),
                        ),
                    ],
                  ),
                  if (hasVerification) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(Icons.verified, size: 11, color: kCobalt),
                        const SizedBox(width: 3),
                        Text(
                          '已认证',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: kCobalt,
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (portfolioCount > 0 || exhibitionCount > 0) ...[
                    const SizedBox(height: 8),
                    Text(
                      [
                        if (portfolioCount > 0) '$portfolioCount 件作品',
                        if (exhibitionCount > 0) '$exhibitionCount 次展览',
                      ].join(' · '),
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: context.artC.ink.withOpacity(0.32),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ArtistOnboardingPanel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
        boxShadow: [kShadowCard],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: kCobalt.withOpacity(0.08),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Icon(Icons.palette_outlined, color: kCobalt),
          ),
          const SizedBox(height: 18),
          Text(
            '成为 Artiqore 入驻艺术家',
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 24,
              height: 1.12,
              fontWeight: FontWeight.w900,
              fontFamily: 'Noto Serif SC',
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '展示作品集、获得展览曝光、接收品牌合作邀约。',
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.48),
              fontSize: 13,
              height: 1.55,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 18),
          ...[
            '创建个人艺术家主页',
            '上传作品集与履历',
            '申请展览 / 驻留 / 联名项目',
            '被品牌方和策展人发现',
          ].map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded,
                      size: 17, color: kCobalt),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      item,
                      style: TextStyle(
                        color: context.artC.ink,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          FilledButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('点击右上角 +，选择“艺术家入驻”')),
              );
            },
            icon: const Icon(Icons.arrow_upward_rounded, size: 16),
            label: const Text('立即入驻'),
          ),
        ],
      ),
    );
  }
}

class _ArtistExampleStrip extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const examples = [
      ('新锐艺术家', '装置 / 影像 / 纽约'),
      ('学生艺术家', '插画 / 视觉设计 / 上海'),
      ('签约艺术家', '公共艺术 / 商业联名 / 北京'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(title: '示例档案', action: 'SAMPLES'),
        const SizedBox(height: 12),
        ...examples.map(
          (item) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: context.artC.silver.withOpacity(0.35)),
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: context.artC.silver.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.person_outline, color: kCobalt),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.$1,
                        style: TextStyle(
                          color: context.artC.ink,
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        item.$2,
                        style: TextStyle(
                          color: context.artC.ink.withOpacity(0.42),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, color: kCobalt),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String action;
  final IconData? icon;

  const _SectionHeader({required this.title, required this.action, this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
              fontFamily: 'Noto Serif SC',
            ),
          ),
        ),
        if (icon != null) Icon(icon, size: 13, color: kCobalt),
        if (icon != null) const SizedBox(width: 4),
        Text(
          action,
          style: const TextStyle(
            color: kCobalt,
            fontSize: 10,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _MiniBadge extends StatelessWidget {
  final String text;
  final Color color;

  const _MiniBadge({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.07),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withOpacity(0.12)),
      ),
      child: Text(
        text,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w900,
          color: color,
        ),
      ),
    );
  }
}

class _SoftTag extends StatelessWidget {
  final String text;

  const _SoftTag({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: context.artC.silver.withOpacity(0.45)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w800,
          color: context.artC.ink.withOpacity(0.44),
        ),
      ),
    );
  }
}

class _LoadingState extends StatelessWidget {
  final double bottom;

  const _LoadingState({required this.bottom});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 80, 20, bottom),
      children: [
        Center(
          child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2.5),
        ),
      ],
    );
  }
}

class _ResourceState extends StatelessWidget {
  final double bottom;
  final String title;
  final String subtitle;
  final VoidCallback onRetry;

  const _ResourceState({
    required this.bottom,
    required this.title,
    required this.subtitle,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 44, 20, bottom),
      children: [
        _EmptyPanel(title: title, subtitle: subtitle),
        const SizedBox(height: 12),
        Center(
          child: TextButton(onPressed: onRetry, child: const Text('重试')),
        ),
      ],
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  final String title;
  final String subtitle;

  const _EmptyPanel({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Column(
        children: [
          const Icon(Icons.add_circle_outline, color: kCobalt, size: 30),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.42),
              fontSize: 12,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

String _formatBudget(dynamic min, dynamic max) {
  final minValue = min is int ? min : int.tryParse(min?.toString() ?? '');
  final maxValue = max is int ? max : int.tryParse(max?.toString() ?? '');
  String money(int value) {
    if (value >= 10000) return '¥${(value / 10000).toStringAsFixed(0)}w';
    return '¥$value';
  }

  if (minValue != null && maxValue != null) {
    return '${money(minValue)}-${money(maxValue)}';
  }
  if (maxValue != null) return '最高 ${money(maxValue)}';
  if (minValue != null) return '最低 ${money(minValue)}';
  return '预算面议';
}

String _formatDate(dynamic raw) {
  final date = DateTime.tryParse(raw?.toString() ?? '');
  if (date == null) return '长期开放';
  return '${date.year}.${date.month.toString().padLeft(2, '0')}.${date.day.toString().padLeft(2, '0')}';
}

String _formatEventFee(dynamic raw) {
  final value = raw is int ? raw : int.tryParse(raw?.toString() ?? '');
  if (value == null || value <= 0) return '免费 / 预约制';
  return '¥$value';
}

List<Map<String, dynamic>> _filterMaps(
  List<Map<String, dynamic>> items,
  String keyword,
) {
  final query = keyword.trim().toLowerCase();
  if (query.isEmpty) return items;
  return items.where((item) {
    final text = item.entries
        .map((entry) => '${entry.key} ${entry.value}')
        .join(' ')
        .toLowerCase();
    return text.contains(query);
  }).toList();
}

String _monthLabel(int month) {
  const labels = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  return labels[month - 1];
}

bool _matchesOpportunityQuickFilter(Map<String, dynamic> item, String filter) {
  if (filter == '全部') return true;
  final budgetMin = item['budget_min'] is int
      ? item['budget_min'] as int
      : int.tryParse(item['budget_min']?.toString() ?? '');
  final budgetMax = item['budget_max'] is int
      ? item['budget_max'] as int
      : int.tryParse(item['budget_max']?.toString() ?? '');
  final deadline = DateTime.tryParse(item['deadline']?.toString() ?? '');
  final city = item['city']?.toString().toLowerCase() ?? '';
  final tags = item['tags']?.toString().toLowerCase() ?? '';
  final description = item['description']?.toString().toLowerCase() ?? '';

  return switch (filter) {
    '高预算' => (budgetMax != null && budgetMax >= 50000) ||
        (budgetMin != null && budgetMin >= 30000),
    '同城' => city.contains('上海') ||
        city.contains('北京') ||
        city.contains('深圳') ||
        city.contains('广州'),
    '本周截止' =>
      deadline != null && deadline.difference(DateTime.now()).inDays <= 7,
    '适合学生' => tags.contains('学生') ||
        description.contains('学生') ||
        (budgetMax != null && budgetMax <= 10000),
    '驻留项目' => tags.contains('驻留') ||
        description.contains('驻留') ||
        description.contains('residency'),
    _ => true,
  };
}

bool _matchesExhibitionQuickFilter(Map<String, dynamic> item, String filter) {
  if (filter == '全部') return true;
  final raw = item.entries
      .map((entry) => '${entry.key} ${entry.value}')
      .join(' ')
      .toLowerCase();
  final date = DateTime.tryParse(item['start_time']?.toString() ?? '');
  final fee = item['fee_amount'] is int
      ? item['fee_amount'] as int
      : int.tryParse(item['fee_amount']?.toString() ?? '');
  return switch (filter) {
    '本周' => date != null && date.difference(DateTime.now()).inDays <= 7,
    '同城' => raw.contains('上海') ||
        raw.contains('北京') ||
        raw.contains('纽约') ||
        raw.contains('伦敦'),
    '免费' => fee == null || fee <= 0 || raw.contains('免费'),
    '预约制' => raw.contains('预约') || raw.contains('reservation'),
    '线上' => raw.contains('线上') ||
        raw.contains('online') ||
        raw.contains('zoom') ||
        raw.contains('vr'),
    _ => true,
  };
}

class _ApplyTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String hint;
  final int maxLines;
  final String? error;

  const _ApplyTextField({
    required this.controller,
    required this.label,
    required this.hint,
    this.maxLines = 1,
    this.error,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: context.artC.ink,
            fontSize: 13,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(
                color: error != null && error!.isNotEmpty
                    ? Colors.red
                    : context.artC.silver.withOpacity(0.4),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(
                color: error != null && error!.isNotEmpty
                    ? Colors.red
                    : context.artC.silver.withOpacity(0.4),
              ),
            ),
          ),
        ),
        if (error != null && error!.isNotEmpty) ...[
          const SizedBox(height: 6),
          Text(
            error!,
            style: const TextStyle(
              color: Colors.red,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ],
    );
  }
}

class _OpportunityDecisionLine extends StatelessWidget {
  final String label;
  final String value;

  const _OpportunityDecisionLine({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 42,
          child: Text(
            label,
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.34),
              fontSize: 11,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.62),
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ],
    );
  }
}

class OpportunityDetailScreen extends StatelessWidget {
  final Map<String, dynamic> item;
  final bool applied;
  final VoidCallback onApply;

  const OpportunityDetailScreen({
    super.key,
    required this.item,
    required this.applied,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    final title = item['title']?.toString() ?? '未命名机会';
    final description = item['description']?.toString() ?? '暂无详细说明';
    final budget = _formatBudget(item['budget_min'], item['budget_max']);
    final deadline = _formatDate(item['deadline']);
    final city = item['city']?.toString() ?? '不限';

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        foregroundColor: context.artC.ink,
        title: const Text('机会详情'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
              fontFamily: 'Noto Serif SC',
            ),
          ),
          const SizedBox(height: 16),
          _DetailRow(icon: Icons.payments_outlined, text: budget),
          const SizedBox(height: 10),
          _DetailRow(icon: Icons.calendar_today_outlined, text: deadline),
          const SizedBox(height: 10),
          _DetailRow(icon: Icons.location_on_outlined, text: city),
          const SizedBox(height: 24),
          Text(
            description,
            style: TextStyle(
              fontSize: 15,
              height: 1.6,
              color: context.artC.ink.withOpacity(0.7),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(20),
        child: FilledButton(
          onPressed: applied ? null : onApply,
          child: Text(applied ? '已申请' : '申请此机会'),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _DetailRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: kCobalt),
        const SizedBox(width: 8),
        Text(
          text,
          style: TextStyle(
            fontSize: 14,
            color: context.artC.ink.withOpacity(0.6),
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _DetailInfoCard extends StatelessWidget {
  final List<(String, String)> rows;

  const _DetailInfoCard({required this.rows});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.36)),
      ),
      child: Column(
        children: rows
            .map(
              (row) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 58,
                      child: Text(
                        row.$1,
                        style: TextStyle(
                          color: context.artC.ink.withOpacity(0.38),
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        row.$2,
                        style: TextStyle(
                          color: context.artC.ink,
                          fontSize: 13,
                          height: 1.45,
                          fontWeight: FontWeight.w800,
                        ),
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

class _DetailSection extends StatelessWidget {
  final String title;
  final String body;

  const _DetailSection({required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 17,
              fontWeight: FontWeight.w900,
              fontFamily: 'Noto Serif SC',
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.62),
              fontSize: 14,
              height: 1.65,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

Color _cooperationStatusColor(String status) {
  return switch (status) {
    'available' => const Color(0xFF22C55E),
    'busy' => const Color(0xFFF59E0B),
    'unavailable' => const Color(0xFF9CA3AF),
    _ => const Color(0xFF22C55E),
  };
}

String _cooperationStatusLabel(String status) {
  return switch (status) {
    'available' => '可合作',
    'busy' => '档期紧张',
    'unavailable' => '暂不接单',
    _ => '可合作',
  };
}

class ArtistDetailScreen extends StatelessWidget {
  final Map<String, dynamic> artist;

  const ArtistDetailScreen({super.key, required this.artist});

  @override
  Widget build(BuildContext context) {
    final name = artist['display_name']?.toString() ?? '未命名艺术家';
    final fields = (artist['art_fields'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .where((e) => e.isNotEmpty)
        .join(' / ');
    final city = artist['city']?.toString() ?? '不限';
    final bio = artist['bio']?.toString();
    final coverWorkUrl = artist['cover_work_url']?.toString() ??
        artist['featured_work_url']?.toString() ??
        artist['avatar_url']?.toString();
    final cooperationStatus =
        artist['cooperation_status']?.toString() ?? 'available';
    final cooperationIntent = artist['cooperation_intent']?.toString();
    final portfolioCount = artist['portfolio_count'] is int
        ? artist['portfolio_count'] as int
        : int.tryParse(artist['portfolio_count']?.toString() ?? '') ?? 0;
    final exhibitionCount = artist['exhibition_count'] is int
        ? artist['exhibition_count'] as int
        : int.tryParse(artist['exhibition_count']?.toString() ?? '') ?? 0;
    final careerStage = artist['career_stage']?.toString();
    final verificationBadges = artist['verification_badges'];

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 320,
            backgroundColor: context.artC.ink,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (coverWorkUrl != null && coverWorkUrl.isNotEmpty)
                    Image.network(coverWorkUrl, fit: BoxFit.cover)
                  else
                    Container(color: context.artC.silver.withOpacity(0.28)),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          context.artC.ink.withOpacity(0.88),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 110),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _MiniBadge(text: '艺术家', color: kCobalt),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _cooperationStatusColor(cooperationStatus)
                              .withOpacity(0.1),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: _cooperationStatusColor(cooperationStatus),
                          ),
                        ),
                        child: Text(
                          _cooperationStatusLabel(cooperationStatus),
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: _cooperationStatusColor(cooperationStatus),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    name,
                    style: TextStyle(
                      color: context.artC.ink,
                      fontSize: 28,
                      height: 1.12,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    fields.isEmpty ? '艺术家' : fields,
                    style: TextStyle(
                      color: context.artC.ink.withOpacity(0.58),
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined,
                          size: 14, color: context.artC.ink.withOpacity(0.42)),
                      const SizedBox(width: 4),
                      Text(
                        city,
                        style: TextStyle(
                          color: context.artC.ink.withOpacity(0.42),
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (careerStage != null && careerStage.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Text(
                          ' · $careerStage',
                          style: TextStyle(
                            color: context.artC.ink.withOpacity(0.42),
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (verificationBadges != null) ...[
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _VerificationBadge(icon: Icons.verified, label: '实名认证'),
                        _VerificationBadge(icon: Icons.school, label: '学历认证'),
                        _VerificationBadge(icon: Icons.palette, label: '职业认证'),
                      ],
                    ),
                  ],
                  const SizedBox(height: 20),
                  _DetailInfoCard(
                    rows: [
                      ('作品数量', portfolioCount > 0 ? '$portfolioCount 件' : '暂无'),
                      (
                        '展览经历',
                        exhibitionCount > 0 ? '$exhibitionCount 次' : '暂无'
                      ),
                      ('合作状态', _cooperationStatusLabel(cooperationStatus)),
                    ],
                  ),
                  if (bio != null && bio.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    _DetailSection(
                      title: '个人简介',
                      body: bio,
                    ),
                  ],
                  if (cooperationIntent != null &&
                      cooperationIntent.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    _DetailSection(
                      title: '合作意向',
                      body: cooperationIntent,
                    ),
                  ],
                  _DetailSection(
                    title: '作品集',
                    body: '艺术家的代表作品将在这里展示。包括作品图片、标题、年份、媒介和作品说明。',
                  ),
                  _DetailSection(
                    title: '展览经历',
                    body: '参展记录、个展、群展等展览经历将在这里展示。',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('收藏功能开发中')),
                    );
                  },
                  icon: const Icon(Icons.bookmark_outline, size: 18),
                  label: const Text('收藏'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: FilledButton.icon(
                  onPressed: cooperationStatus == 'unavailable'
                      ? null
                      : () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('发起合作功能开发中')),
                          );
                        },
                  icon: const Icon(Icons.handshake_outlined, size: 18),
                  label: Text(
                      cooperationStatus == 'unavailable' ? '暂不接单' : '发起合作'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _VerificationBadge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _VerificationBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: kCobalt),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: kCobalt,
          ),
        ),
      ],
    );
  }
}

bool _matchesArtistQuickFilter(Map<String, dynamic> item, String filter) {
  if (filter == '全部') return true;
  final cooperationStatus =
      item['cooperation_status']?.toString() ?? 'available';
  final hasVerification = item['verification_badges'] != null;
  final careerStage = item['career_stage']?.toString().toLowerCase() ?? '';
  final city = item['city']?.toString().toLowerCase() ?? '';

  return switch (filter) {
    '可合作' => cooperationStatus == 'available',
    '认证' => hasVerification,
    '学生' => careerStage.contains('学生') || careerStage.contains('student'),
    '新锐' => careerStage.contains('新锐') || careerStage.contains('emerging'),
    '同城' => city.contains('上海') ||
        city.contains('北京') ||
        city.contains('深圳') ||
        city.contains('广州'),
    _ => true,
  };
}

class _ArtistLibraryHeader extends StatelessWidget {
  final int totalCount;
  final int availableCount;
  final int verifiedCount;

  const _ArtistLibraryHeader({
    required this.totalCount,
    required this.availableCount,
    required this.verifiedCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            context.artC.ink,
            context.artC.ink.withOpacity(0.88),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: Colors.white.withOpacity(0.3)),
                ),
                child: Text(
                  'ARTIST ARCHIVE',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '艺术家资源库',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w900,
              fontFamily: 'Noto Serif SC',
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '发现可合作的新锐艺术家、设计师与创作者',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _StatChip(
                icon: Icons.people_outline,
                label: '$totalCount 位艺术家',
              ),
              const SizedBox(width: 8),
              _StatChip(
                icon: Icons.handshake_outlined,
                label: '$availableCount 位可合作',
              ),
              const SizedBox(width: 8),
              _StatChip(
                icon: Icons.verified,
                label: '$verifiedCount 位认证',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _StatChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: Colors.white),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

String _opportunityTypeLabel(String type) {
  return switch (type.toLowerCase()) {
    'research' => '研究类',
    'collaboration' => '联名合作',
    'residency' => '驻留项目',
    'competition' => '竞赛征集',
    'exhibition' => '展览邀约',
    'workshop' => '工作坊',
    _ => '合作机会',
  };
}

String _formatDeadlineUrgency(dynamic raw) {
  final deadline = DateTime.tryParse(raw?.toString() ?? '');
  if (deadline == null) return '长期开放';

  final now = DateTime.now();
  final diff = deadline.difference(now).inDays;

  if (diff < 0) return '已截止';
  if (diff == 0) return '今日截止';
  if (diff <= 3) return '即将截止';
  if (diff <= 7) return '本周截止';
  return '剩 $diff 天';
}

Color _deadlineColor(dynamic raw, BuildContext context) {
  final deadline = DateTime.tryParse(raw?.toString() ?? '');
  if (deadline == null) return context.artC.ink.withOpacity(0.38);

  final diff = deadline.difference(DateTime.now()).inDays;

  if (diff < 0) return context.artC.ink.withOpacity(0.28);
  if (diff <= 3) return const Color(0xFFEF4444);
  if (diff <= 7) return const Color(0xFFF59E0B);
  return context.artC.ink.withOpacity(0.48);
}

List<String> _extractOpportunityTags(String? city, String requirements) {
  final tags = <String>[];

  if (city != null && city.isNotEmpty) {
    tags.add(city);
  }

  final reqLower = requirements.toLowerCase();

  if (reqLower.contains('作品集') || reqLower.contains('portfolio')) {
    tags.add('需作品集');
  }
  if (reqLower.contains('学生') || reqLower.contains('student')) {
    tags.add('适合学生');
  }
  if (reqLower.contains('远程') || reqLower.contains('remote')) {
    tags.add('可远程');
  }
  if (reqLower.contains('传统') ||
      reqLower.contains('工艺') ||
      reqLower.contains('craft')) {
    tags.add('传统工艺');
  }
  if (reqLower.contains('设计') || reqLower.contains('design')) {
    tags.add('设计方向');
  }
  if (reqLower.contains('装置') || reqLower.contains('installation')) {
    tags.add('装置方向');
  }

  if (tags.length == 1 && tags[0] == city) {
    tags.add('查看要求');
  }

  return tags;
}

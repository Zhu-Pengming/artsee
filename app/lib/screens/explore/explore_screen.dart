import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../utils/auth_gate.dart';
import '../../widgets/artsee_ui.dart';
import '../../widgets/common.dart';
import '../profile/public_user_profile_screen.dart';
import '../publish/publish_artist_screen.dart';
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
  final List<String> _searchKeywords = List.filled(3, '');

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

  String get searchKeyword => _searchKeywords[_tabController.index];

  String get searchHint => switch (_tabController.index) {
        0 => '搜索合作机会、驻留、预算、城市',
        1 => '搜索展览、城市、场馆、工作坊',
        2 => '搜索艺术家、风格、城市、合作方向',
        _ => '搜索发现资源',
      };

  void applySearch(String keyword) {
    setState(() => _searchKeywords[_tabController.index] = keyword.trim());
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
                    searchKeyword: _searchKeywords[0],
                  ),
                  _ExhibitionTab(
                    key: _exhibitionKey,
                    bottom: bottom,
                    searchKeyword: _searchKeywords[1],
                  ),
                  _ArtistTab(
                    key: _artistKey,
                    bottom: bottom,
                    searchKeyword: _searchKeywords[2],
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

  Future<bool> _apply(Map<String, dynamic> item) async {
    if (!await ensureLoggedIn(context, message: '请先登录后申请合作机会')) {
      return false;
    }
    final id = item['id'].toString();
    if (_appliedIds.contains(id)) return true;
    final submitted = await _showOpportunityApplySheet(item);
    if (!mounted || submitted != true) return false;
    setState(() => _appliedIds.add(id));
    return true;
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

  Future<bool> _apply(Map<String, dynamic> item) async {
    if (!await ensureLoggedIn(context, message: '请先登录后报名活动')) {
      return false;
    }
    final id = item['id'].toString();
    if (_appliedIds.contains(id)) return true;
    final confirmed = await _showEventApplyConfirm(item);
    if (confirmed != true) return false;
    try {
      await BackendApiService.applyEvent(
        eventId: id,
        applyNote: '我想报名参加该活动。',
      );
      if (!mounted) return false;
      setState(() => _appliedIds.add(id));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('报名已提交，活动通知会进入私信/预约记录')),
      );
      return true;
    } catch (e) {
      if (!mounted) return false;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('报名失败：$e')),
      );
      return false;
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
  final TextEditingController _searchCtrl = TextEditingController();
  List<Map<String, dynamic>> _items = const [];
  bool _loading = true;
  String? _error;
  String _artCategory = '全部门类';
  String _region = '全部地区';
  String _verificationLevel = '全部认证';
  String _cooperationType = '全部合作';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
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

  Future<void> _openArtistOnboarding() async {
    if (!await ensureLoggedIn(context, message: '请先登录后创建艺术家档案')) return;
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(builder: (_) => const PublishArtistScreen()),
    );
    if (created == true) _load();
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
    final certifiedItems = _items.where(_isCertifiedArtist).toList();
    final query = [
      widget.searchKeyword,
      _searchCtrl.text,
    ].where((item) => item.trim().isNotEmpty).join(' ');
    final visibleItems = _filterMaps(certifiedItems, query)
        .where(
          (item) => _matchesArtistStructuredFilters(
            item,
            artCategory: _artCategory,
            region: _region,
            verificationLevel: _verificationLevel,
            cooperationType: _cooperationType,
          ),
        )
        .toList();
    final availableCount = certifiedItems
        .where((item) =>
            (item['cooperation_status']?.toString() ?? 'available') ==
            'available')
        .length;

    if (visibleItems.isEmpty) {
      return ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 88),
        children: [
          _ArtistLibraryHeader(
            totalCount: certifiedItems.length,
            availableCount: availableCount,
            onApply: _openArtistOnboarding,
          ),
          const SizedBox(height: 14),
          _ArtistSearchField(
            controller: _searchCtrl,
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 12),
          _ArtistFilterPanel(
            artCategory: _artCategory,
            region: _region,
            verificationLevel: _verificationLevel,
            cooperationType: _cooperationType,
            onArtCategoryChanged: (value) =>
                setState(() => _artCategory = value),
            onRegionChanged: (value) => setState(() => _region = value),
            onVerificationLevelChanged: (value) =>
                setState(() => _verificationLevel = value),
            onCooperationTypeChanged: (value) =>
                setState(() => _cooperationType = value),
          ),
          const SizedBox(height: 14),
          _EmptyPanel(
            title: certifiedItems.isEmpty ? '暂无认证艺术家' : '没有匹配艺术家',
            subtitle: certifiedItems.isEmpty
                ? '认证艺术家通过审核后会显示在这里，可以先申请入驻。'
                : '换一个艺术方向、城市、认证等级或合作关键词试试。',
          ),
          const SizedBox(height: 14),
          _ArtistOnboardingPanel(onStart: _openArtistOnboarding),
        ],
      );
    }
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 88),
      children: [
        _ArtistLibraryHeader(
          totalCount: certifiedItems.length,
          availableCount: availableCount,
          onApply: _openArtistOnboarding,
        ),
        const SizedBox(height: 14),
        _ArtistSearchField(
          controller: _searchCtrl,
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 12),
        _ArtistFilterPanel(
          artCategory: _artCategory,
          region: _region,
          verificationLevel: _verificationLevel,
          cooperationType: _cooperationType,
          onArtCategoryChanged: (value) => setState(() => _artCategory = value),
          onRegionChanged: (value) => setState(() => _region = value),
          onVerificationLevelChanged: (value) =>
              setState(() => _verificationLevel = value),
          onCooperationTypeChanged: (value) =>
              setState(() => _cooperationType = value),
        ),
        const SizedBox(height: 14),
        _ArtistListSummary(
          visibleCount: visibleItems.length,
          totalCount: certifiedItems.length,
        ),
        const SizedBox(height: 12),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: visibleItems.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) => _ArtistCard(
            artist: visibleItems[index],
          ),
        ),
        const SizedBox(height: 16),
        _ArtistOnboardingPanel(onStart: _openArtistOnboarding),
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
    return ArtseeSegmentedTabs(
      controller: controller,
      tabs: tabs
          .map((tab) => ArtseeSegmentTab(label: tab.label, icon: tab.icon))
          .toList(),
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

    return ArtseeSurface(
      onTap: onOpen,
      padding: const EdgeInsets.all(15),
      radius: 18,
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
                    border:
                        applied ? Border.all(color: context.artC.silver) : null,
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
                        letterSpacing: 0,
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
    return ArtseeSurface(
      onTap: onOpen,
      padding: const EdgeInsets.all(15),
      radius: 18,
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
          color: context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(18),
          border:
              Border.all(color: context.artC.silver.withValues(alpha: 0.32)),
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
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.22)),
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

class ExhibitionDetailScreen extends StatefulWidget {
  final Map<String, dynamic> item;
  final bool applied;
  final Future<bool> Function() onApply;

  const ExhibitionDetailScreen({
    super.key,
    required this.item,
    required this.applied,
    required this.onApply,
  });

  @override
  State<ExhibitionDetailScreen> createState() => _ExhibitionDetailScreenState();
}

class _ExhibitionDetailScreenState extends State<ExhibitionDetailScreen> {
  late bool _applied = widget.applied;
  bool _submitting = false;

  Future<void> _handleApply() async {
    if (_applied || _submitting) return;
    setState(() => _submitting = true);
    final applied = await widget.onApply();
    if (!mounted) return;
    setState(() {
      _applied = applied || _applied;
      _submitting = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
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
                      ('状态', _applied ? '已报名 / 待确认' : '可报名'),
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
            onPressed: _applied || _submitting ? null : _handleApply,
            icon: Icon(_applied
                ? Icons.check_circle_rounded
                : Icons.event_available_rounded),
            label: Text(
              _applied
                  ? '已报名'
                  : _submitting
                      ? '提交中'
                      : '立即报名',
            ),
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
              letterSpacing: 0,
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
    final handle = _artistHandle(artist);
    final fields = _artistFields(artist);
    final city = artist['city']?.toString().trim();
    final coverWorkUrl = artist['cover_work_url']?.toString() ??
        artist['featured_work_url']?.toString() ??
        artist['avatar_url']?.toString();
    final avatarUrl = artist['avatar_url']?.toString();
    final cooperationStatus =
        artist['cooperation_status']?.toString() ?? 'available';
    final portfolioCount = _artistInt(artist['portfolio_count']);
    final exhibitionCount = _artistInt(artist['exhibition_count']);
    final cooperationTypes = _artistCooperationTypes(artist);

    return ArtseeSurface(
      onTap: () {
        Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => PublicUserProfileScreen(
              userId: artist['user_id']?.toString(),
              name: name,
              handle: handle,
              avatarUrl: avatarUrl,
              roleLabel: _artistVerificationLabel(artist),
              bio: artist['bio']?.toString(),
              kind: PublicUserProfileKind.artist,
              featuredActivity:
                  '正在展示${fields.isEmpty ? '艺术创作' : fields.join(' / ')}方向的作品与合作意向。',
              featuredAnswerContext: '艺术家观点',
              featuredAnswer: artist['cooperation_intent']?.toString(),
            ),
          ),
        );
      },
      padding: EdgeInsets.zero,
      radius: 8,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 132,
            child: ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(8)),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  coverWorkUrl != null && coverWorkUrl.isNotEmpty
                      ? Image.network(
                          coverWorkUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              _ArtistCoverFallback(name: name),
                        )
                      : _ArtistCoverFallback(name: name),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.08),
                          Colors.black.withValues(alpha: 0.48),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 9, vertical: 5),
                      decoration: BoxDecoration(
                        color: _cooperationStatusColor(cooperationStatus)
                            .withOpacity(0.95),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        _cooperationStatusLabel(cooperationStatus),
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 12,
                    bottom: 12,
                    right: 12,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _ArtistAvatar(name: name, avatarUrl: avatarUrl),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 17,
                                        fontWeight: FontWeight.w900,
                                        fontFamily: 'Noto Serif SC',
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 5),
                                  const Icon(Icons.verified_rounded,
                                      color: Colors.white, size: 16),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                handle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.72),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 7,
                  runSpacing: 7,
                  children: [
                    _MiniBadge(
                        text: _artistVerificationLabel(artist), color: kCobalt),
                    if (city != null && city.isNotEmpty)
                      _MiniBadge(text: city, color: const Color(0xFF047857)),
                    if (cooperationTypes.isNotEmpty)
                      _MiniBadge(
                        text: cooperationTypes.first,
                        color: const Color(0xFF7A6A56),
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  fields.isEmpty ? '艺术家' : fields.join(' / '),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _ArtistWorkStrip(
                        artist: artist,
                        coverUrl: coverWorkUrl,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          [
                            if (portfolioCount > 0) '$portfolioCount 件作品',
                            if (exhibitionCount > 0) '$exhibitionCount 次展览',
                            if (portfolioCount == 0 && exhibitionCount == 0)
                              '作品待补充',
                          ].join(' · '),
                          textAlign: TextAlign.right,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: context.artC.ink.withValues(alpha: 0.42),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _cooperationStatusLabel(cooperationStatus),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                            color: _cooperationStatusColor(cooperationStatus),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                if (artist['cooperation_intent']
                        ?.toString()
                        .trim()
                        .isNotEmpty ==
                    true) ...[
                  const SizedBox(height: 10),
                  Text(
                    artist['cooperation_intent'].toString().trim(),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      height: 1.45,
                      fontWeight: FontWeight.w700,
                      color: context.artC.ink.withValues(alpha: 0.58),
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

class _ArtistCoverFallback extends StatelessWidget {
  final String name;

  const _ArtistCoverFallback({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: context.artC.silver.withValues(alpha: 0.28),
      child: Center(
        child: Text(
          name.isEmpty ? '艺' : name.characters.first,
          style: TextStyle(
            color: kCobalt.withValues(alpha: 0.52),
            fontSize: 42,
            fontWeight: FontWeight.w900,
            fontFamily: 'Noto Serif SC',
          ),
        ),
      ),
    );
  }
}

class _ArtistAvatar extends StatelessWidget {
  final String name;
  final String? avatarUrl;

  const _ArtistAvatar({required this.name, required this.avatarUrl});

  @override
  Widget build(BuildContext context) {
    final url = avatarUrl?.trim();
    return Container(
      width: 48,
      height: 48,
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.92),
        shape: BoxShape.circle,
      ),
      child: ClipOval(
        child: url != null && url.isNotEmpty
            ? Image.network(
                url,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _ArtistAvatarFallback(name: name),
              )
            : _ArtistAvatarFallback(name: name),
      ),
    );
  }
}

class _ArtistAvatarFallback extends StatelessWidget {
  final String name;

  const _ArtistAvatarFallback({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: kCobalt.withValues(alpha: 0.08),
      child: Center(
        child: Text(
          name.isEmpty ? '艺' : name.characters.first,
          style: const TextStyle(
            color: kCobalt,
            fontSize: 18,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _ArtistWorkStrip extends StatelessWidget {
  final Map<String, dynamic> artist;
  final String? coverUrl;

  const _ArtistWorkStrip({required this.artist, required this.coverUrl});

  @override
  Widget build(BuildContext context) {
    final urls = _artistWorkUrls(artist, coverUrl).take(3).toList();
    return Row(
      children: List.generate(3, (index) {
        final url = index < urls.length ? urls[index] : null;
        return Padding(
          padding: EdgeInsets.only(right: index == 2 ? 0 : 6),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: SizedBox(
              width: 42,
              height: 42,
              child: url != null && url.isNotEmpty
                  ? Image.network(
                      url,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          _ArtistWorkFallback(index: index),
                    )
                  : _ArtistWorkFallback(index: index),
            ),
          ),
        );
      }),
    );
  }
}

class _ArtistWorkFallback extends StatelessWidget {
  final int index;

  const _ArtistWorkFallback({required this.index});

  @override
  Widget build(BuildContext context) {
    final colors = [
      const Color(0xFFE7EEF8),
      const Color(0xFFE8F3EE),
      const Color(0xFFF4E8EA),
    ];
    return Container(
      color: colors[index % colors.length],
      child: Icon(
        Icons.image_outlined,
        size: 16,
        color: kCobalt.withValues(alpha: 0.35),
      ),
    );
  }
}

class _ArtistSearchField extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const _ArtistSearchField({
    required this.controller,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 46,
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.38)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 13),
      child: Row(
        children: [
          Icon(Icons.search_rounded,
              color: context.artC.ink.withValues(alpha: 0.34), size: 19),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onChanged,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: '搜索艺术家、方向、城市、标签',
                border: InputBorder.none,
                isDense: true,
                hintStyle: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.34),
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 13,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          if (controller.text.isNotEmpty)
            GestureDetector(
              onTap: () {
                controller.clear();
                onChanged('');
              },
              child: Icon(Icons.close_rounded,
                  color: context.artC.ink.withValues(alpha: 0.3), size: 18),
            ),
        ],
      ),
    );
  }
}

class _ArtistFilterPanel extends StatelessWidget {
  final String artCategory;
  final String region;
  final String verificationLevel;
  final String cooperationType;
  final ValueChanged<String> onArtCategoryChanged;
  final ValueChanged<String> onRegionChanged;
  final ValueChanged<String> onVerificationLevelChanged;
  final ValueChanged<String> onCooperationTypeChanged;

  const _ArtistFilterPanel({
    required this.artCategory,
    required this.region,
    required this.verificationLevel,
    required this.cooperationType,
    required this.onArtCategoryChanged,
    required this.onRegionChanged,
    required this.onVerificationLevelChanged,
    required this.onCooperationTypeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _ArtistFilterRow(
          label: '艺术门类',
          values: const ['全部门类', '绘画', '装置', '影像', '摄影', '设计', '新媒体'],
          selected: artCategory,
          onChanged: onArtCategoryChanged,
        ),
        const SizedBox(height: 8),
        _ArtistFilterRow(
          label: '地区',
          values: const ['全部地区', '北京', '上海', '广州', '深圳', '杭州', '伦敦', '纽约'],
          selected: region,
          onChanged: onRegionChanged,
        ),
        const SizedBox(height: 8),
        _ArtistFilterRow(
          label: '认证等级',
          values: const ['全部认证', '平台认证', '展览认证', '教育背景认证', '职业认证'],
          selected: verificationLevel,
          onChanged: onVerificationLevelChanged,
        ),
        const SizedBox(height: 8),
        _ArtistFilterRow(
          label: '可合作类型',
          values: const ['全部合作', '可合作', '展览', '品牌联名', '公共艺术', '讲座工作坊'],
          selected: cooperationType,
          onChanged: onCooperationTypeChanged,
        ),
      ],
    );
  }
}

class _ArtistFilterRow extends StatelessWidget {
  final String label;
  final List<String> values;
  final String selected;
  final ValueChanged<String> onChanged;

  const _ArtistFilterRow({
    required this.label,
    required this.values,
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: 70,
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.48),
              fontSize: 11,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: values.map((value) {
                final active = value == selected;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => onChanged(value),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 11, vertical: 7),
                      decoration: BoxDecoration(
                        color:
                            active ? context.artC.ink : context.artC.cardIconBg,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: active
                              ? context.artC.ink
                              : context.artC.silver.withValues(alpha: 0.38),
                        ),
                      ),
                      child: Text(
                        value,
                        style: TextStyle(
                          color: active
                              ? Colors.white
                              : context.artC.ink.withValues(alpha: 0.58),
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }
}

class _ArtistListSummary extends StatelessWidget {
  final int visibleCount;
  final int totalCount;

  const _ArtistListSummary({
    required this.visibleCount,
    required this.totalCount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.verified_rounded, color: kCobalt, size: 16),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            '认证艺术家 $visibleCount / $totalCount',
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 13,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        Text(
          '仅展示已认证',
          style: TextStyle(
            color: context.artC.ink.withValues(alpha: 0.42),
            fontSize: 11,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _ArtistOnboardingPanel extends StatelessWidget {
  final VoidCallback onStart;

  const _ArtistOnboardingPanel({required this.onStart});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: kCobalt.withOpacity(0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.verified_user_outlined, color: kCobalt),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '申请成为入驻艺术家',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '创建主页、上传作品，审核通过后进入艺术家库。',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.48),
                    fontSize: 11,
                    height: 1.35,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          OutlinedButton.icon(
            onPressed: onStart,
            icon: const Icon(Icons.add_rounded, size: 17),
            label: const Text('入驻'),
            style: OutlinedButton.styleFrom(
              foregroundColor: kCobalt,
              side: BorderSide(color: kCobalt.withValues(alpha: 0.32)),
              visualDensity: VisualDensity.compact,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              textStyle: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
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

class _ResourceSectionTitle extends StatelessWidget {
  final String title;
  final String action;

  const _ResourceSectionTitle({
    required this.title,
    required this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 13,
              fontWeight: FontWeight.w900,
              letterSpacing: 0,
            ),
          ),
        ),
        Text(
          action,
          style: const TextStyle(
            color: kCobalt,
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 0,
          ),
        ),
      ],
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
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
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

List<({String title, String body})> _opportunityProcessItems(String type) {
  final normalized = type.toLowerCase();
  if (normalized == 'residency') {
    return const [
      (title: '提交申请材料', body: '用作品集、个人说明和驻留计划完成初筛。'),
      (title: '项目方确认', body: '项目方会根据方向、档期和空间资源进行匹配。'),
      (title: '沟通驻留方案', body: '确认驻留周期、产出形式、预算和展示方式。'),
      (title: '进入执行', body: '通过后可继续在机会进度中跟进节点。'),
    ];
  }
  if (normalized == 'exhibition') {
    return const [
      (title: '提交作品资料', body: '上传作品集、简历和适合本展览主题的作品说明。'),
      (title: '策展初筛', body: '策展团队会评估作品方向、媒介和展示条件。'),
      (title: '确认参展细节', body: '沟通运输、保险、布展时间和授权边界。'),
      (title: '展览执行', body: '入选后进入布展、宣传和现场执行阶段。'),
    ];
  }
  return const [
    (title: '提交合作意向', body: '说明你的创作方向、可交付内容和相关经验。'),
    (title: '项目方筛选', body: '项目方会基于作品集、预算和执行能力做初步判断。'),
    (title: '沟通方案', body: '确认创意方向、周期、版权授权和付款节点。'),
    (title: '合作落地', body: '双方确认后进入项目执行与成果验收。'),
  ];
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

class OpportunityDetailScreen extends StatefulWidget {
  final Map<String, dynamic> item;
  final bool applied;
  final Future<bool> Function() onApply;

  const OpportunityDetailScreen({
    super.key,
    required this.item,
    required this.applied,
    required this.onApply,
  });

  @override
  State<OpportunityDetailScreen> createState() =>
      _OpportunityDetailScreenState();
}

class _OpportunityDetailScreenState extends State<OpportunityDetailScreen> {
  late bool _applied = widget.applied;
  bool _submitting = false;

  Future<void> _handleApply() async {
    if (_applied || _submitting) return;
    setState(() => _submitting = true);
    final applied = await widget.onApply();
    if (!mounted) return;
    setState(() {
      _applied = applied || _applied;
      _submitting = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    final title = item['title']?.toString() ?? '未命名机会';
    final description = item['description']?.toString() ?? '暂无详细说明';
    final type = item['type']?.toString() ?? 'collaboration';
    final typeLabel = _opportunityTypeLabel(type);
    final budget = _formatBudget(item['budget_min'], item['budget_max']);
    final deadline = _formatDate(item['deadline']);
    final deadlineUrgency = _formatDeadlineUrgency(item['deadline']);
    final city = item['city']?.toString() ?? '不限';
    final requirements = item['requirements']?.toString() ?? '';
    final metadata = item['metadata'] is Map
        ? (item['metadata'] as Map).cast<String, dynamic>()
        : const <String, dynamic>{};
    final organization = metadata['organization']?.toString();
    final showOrganization = metadata['show_organization'] != false;
    final deliverable = metadata['deliverable']?.toString();
    final materials = metadata['required_materials'] is List
        ? (metadata['required_materials'] as List)
            .map((e) => e.toString())
            .where((e) => e.isNotEmpty)
            .toList()
        : const <String>[];
    final tags = _extractOpportunityTags(city, requirements);
    final partner =
        !showOrganization || organization == null || organization.isEmpty
            ? '平台认证项目方'
            : organization;
    final deliverableText = deliverable == null || deliverable.isEmpty
        ? '作品集方案 / 初步合作提案'
        : deliverable;
    final materialText =
        materials.isEmpty ? '作品集 + 简历 + 初步方案' : materials.join(' + ');

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: context.artC.ink, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '合作机会',
          style: TextStyle(
            color: context.artC.ink,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.bookmark_border_rounded,
                color: context.artC.ink, size: 21),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('机会收藏功能稍后开放')),
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(
          20,
          10,
          20,
          MediaQuery.paddingOf(context).bottom + 118,
        ),
        children: [
          _OpportunityDetailHero(
            title: title,
            typeLabel: typeLabel,
            deadlineUrgency: deadlineUrgency,
            description: description,
            tags: tags,
          ),
          const SizedBox(height: 14),
          _OpportunityMetricRow(
            budget: budget,
            deadline: deadline,
            city: city,
          ),
          const SizedBox(height: 14),
          _OpportunityPartnerCard(
            partner: partner,
            deliverable: deliverableText,
            materials: materialText,
          ),
          const SizedBox(height: 18),
          const _ResourceSectionTitle(title: '项目说明', action: 'BRIEF'),
          const SizedBox(height: 10),
          _OpportunityBodyCard(
            description,
          ),
          const SizedBox(height: 18),
          const _ResourceSectionTitle(title: '申请要求', action: 'MATCH'),
          const SizedBox(height: 10),
          _OpportunityRequirementCard(
            requirements: requirements,
            materials: materials,
            city: city,
          ),
          const SizedBox(height: 18),
          const _ResourceSectionTitle(title: '合作流程', action: 'PROCESS'),
          const SizedBox(height: 10),
          _OpportunityProcessCard(
            items: _opportunityProcessItems(type),
          ),
        ],
      ),
      bottomNavigationBar: _OpportunityDetailBottomBar(
        applied: _applied,
        submitting: _submitting,
        budget: budget,
        deadlineUrgency: deadlineUrgency,
        onApply: _handleApply,
      ),
    );
  }
}

class _OpportunityDetailHero extends StatelessWidget {
  final String title;
  final String typeLabel;
  final String deadlineUrgency;
  final String description;
  final List<String> tags;

  const _OpportunityDetailHero({
    required this.title,
    required this.typeLabel,
    required this.deadlineUrgency,
    required this.description,
    required this.tags,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: context.artC.deepPanel,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: context.artC.ink.withValues(alpha: 0.055),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.business_center_outlined,
                  color: Colors.white,
                  size: 27,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _OpportunityDarkBadge(label: typeLabel, strong: true),
                    _OpportunityDarkBadge(label: deadlineUrgency),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              height: 1.12,
              fontWeight: FontWeight.w900,
              fontFamily: 'Noto Serif SC',
            ),
          ),
          const SizedBox(height: 12),
          Text(
            description,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: 12,
              height: 1.55,
              fontWeight: FontWeight.w700,
            ),
          ),
          if (tags.isNotEmpty) ...[
            const SizedBox(height: 16),
            Wrap(
              spacing: 7,
              runSpacing: 7,
              children: tags
                  .take(4)
                  .map((tag) => _OpportunityDarkBadge(label: '#$tag'))
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class _OpportunityDarkBadge extends StatelessWidget {
  final String label;
  final bool strong;

  const _OpportunityDarkBadge({
    required this.label,
    this.strong = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: strong ? kCobalt : Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: Colors.white.withValues(alpha: strong ? 1 : 0.74),
          fontSize: 9,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _OpportunityMetricRow extends StatelessWidget {
  final String budget;
  final String deadline;
  final String city;

  const _OpportunityMetricRow({
    required this.budget,
    required this.deadline,
    required this.city,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _OpportunityMetricTile(
            icon: Icons.payments_outlined,
            label: '预算',
            value: budget,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _OpportunityMetricTile(
            icon: Icons.calendar_today_outlined,
            label: '截止',
            value: deadline,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _OpportunityMetricTile(
            icon: Icons.location_on_outlined,
            label: '城市',
            value: city,
          ),
        ),
      ],
    );
  }
}

class _OpportunityMetricTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _OpportunityMetricTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 82),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: kCobalt, size: 17),
          const SizedBox(height: 8),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 13,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.36),
              fontSize: 9,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _OpportunityPartnerCard extends StatelessWidget {
  final String partner;
  final String deliverable;
  final String materials;

  const _OpportunityPartnerCard({
    required this.partner,
    required this.deliverable,
    required this.materials,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Column(
        children: [
          _OpportunityInfoLine(
            icon: Icons.verified_user_outlined,
            label: '合作方',
            value: partner,
            strong: true,
          ),
          const SizedBox(height: 14),
          _OpportunityInfoLine(
            icon: Icons.assignment_outlined,
            label: '交付内容',
            value: deliverable,
          ),
          const SizedBox(height: 14),
          _OpportunityInfoLine(
            icon: Icons.folder_copy_outlined,
            label: '申请材料',
            value: materials,
          ),
        ],
      ),
    );
  }
}

class _OpportunityInfoLine extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool strong;

  const _OpportunityInfoLine({
    required this.icon,
    required this.label,
    required this.value,
    this.strong = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: (strong ? kCobalt : context.artC.silver).withValues(
              alpha: strong ? 0.1 : 0.26,
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child:
              Icon(icon, color: strong ? kCobalt : context.artC.ink, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.38),
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 13,
                  height: 1.35,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _OpportunityBodyCard extends StatelessWidget {
  final String body;

  const _OpportunityBodyCard(this.body);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Text(
        body,
        style: TextStyle(
          color: context.artC.ink.withValues(alpha: 0.62),
          fontSize: 13,
          height: 1.65,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _OpportunityRequirementCard extends StatelessWidget {
  final String requirements;
  final List<String> materials;
  final String city;

  const _OpportunityRequirementCard({
    required this.requirements,
    required this.materials,
    required this.city,
  });

  @override
  Widget build(BuildContext context) {
    final rows = [
      requirements.isEmpty ? '适合有成熟作品集、可执行方案或合作经验的创作者。' : requirements,
      '项目城市：$city',
      materials.isEmpty ? '建议准备作品集、简历和初步合作方案。' : '需提交：${materials.join('、')}',
    ];
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Column(
        children: rows
            .map(
              (row) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.check_circle_outline,
                      color: kCobalt,
                      size: 17,
                    ),
                    const SizedBox(width: 9),
                    Expanded(
                      child: Text(
                        row,
                        style: TextStyle(
                          color: context.artC.ink.withValues(alpha: 0.58),
                          fontSize: 12,
                          height: 1.45,
                          fontWeight: FontWeight.w700,
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

class _OpportunityProcessCard extends StatelessWidget {
  final List<({String title, String body})> items;

  const _OpportunityProcessCard({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(26),
      ),
      child: Column(
        children: items
            .asMap()
            .entries
            .map(
              (entry) => _OpportunityProcessRow(
                index: entry.key,
                item: entry.value,
                last: entry.key == items.length - 1,
              ),
            )
            .toList(),
      ),
    );
  }
}

class _OpportunityProcessRow extends StatelessWidget {
  final int index;
  final ({String title, String body}) item;
  final bool last;

  const _OpportunityProcessRow({
    required this.index,
    required this.item,
    required this.last,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color:
                    index == 0 ? kCobalt : Colors.white.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Text(
                '${index + 1}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            if (!last)
              Container(
                width: 1,
                height: 48,
                color: Colors.white.withValues(alpha: 0.14),
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: last ? 0 : 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.body,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.52),
                    fontSize: 11,
                    height: 1.45,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _OpportunityDetailBottomBar extends StatelessWidget {
  final bool applied;
  final bool submitting;
  final String budget;
  final String deadlineUrgency;
  final Future<void> Function() onApply;

  const _OpportunityDetailBottomBar({
    required this.applied,
    required this.submitting,
    required this.budget,
    required this.deadlineUrgency,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = !applied && !submitting;
    final label = applied
        ? '已申请'
        : submitting
            ? '提交中'
            : '申请此机会';
    return Container(
      decoration: BoxDecoration(
        color: context.artC.porcelain.withValues(alpha: 0.96),
        border: Border(
          top: BorderSide(color: context.artC.silver.withValues(alpha: 0.28)),
        ),
      ),
      child: SafeArea(
        minimum: const EdgeInsets.fromLTRB(18, 9, 18, 12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    budget,
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
                    applied ? '可在机会进度里继续追踪' : deadlineUrgency,
                    style: TextStyle(
                      color: context.artC.ink.withValues(alpha: 0.38),
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 14),
            GestureDetector(
              onTap: enabled ? onApply : null,
              behavior: HitTestBehavior.opaque,
              child: Container(
                height: 46,
                padding: const EdgeInsets.symmetric(horizontal: 22),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: enabled
                      ? kCobalt
                      : context.artC.silver.withValues(alpha: 0.42),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  label,
                  style: TextStyle(
                    color: enabled
                        ? Colors.white
                        : context.artC.ink.withValues(alpha: 0.42),
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailInfoCard extends StatelessWidget {
  final List<(String, String)> rows;

  const _DetailInfoCard({required this.rows});

  @override
  Widget build(BuildContext context) {
    return ArtseeSurface(
      padding: const EdgeInsets.all(16),
      radius: 18,
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

bool _isCertifiedArtist(Map<String, dynamic> item) {
  final status = item['status']?.toString().toLowerCase() ?? '';
  final verification =
      item['verification_status']?.toString().toLowerCase() ?? '';
  return status == 'published' ||
      verification == 'verified' ||
      verification == 'approved' ||
      item['verification_badges'] != null;
}

bool _matchesArtistStructuredFilters(
  Map<String, dynamic> item, {
  required String artCategory,
  required String region,
  required String verificationLevel,
  required String cooperationType,
}) {
  final fields = _artistFields(item).join(' ').toLowerCase();
  final city = item['city']?.toString().toLowerCase() ?? '';
  final verificationText = [
    item['verification_status'],
    item['verification_level'],
    item['verification_badges'],
  ].join(' ').toLowerCase();
  final cooperationText = [
    item['cooperation_status'],
    item['cooperation_intent'],
    _artistCooperationTypes(item).join(' '),
  ].join(' ').toLowerCase();

  final categoryOk = artCategory == '全部门类' ||
      switch (artCategory) {
        '绘画' => fields.contains('绘') ||
            fields.contains('painting') ||
            fields.contains('fine_art'),
        '装置' => fields.contains('装置') || fields.contains('installation'),
        '影像' => fields.contains('影像') || fields.contains('video'),
        '摄影' => fields.contains('摄影') || fields.contains('photo'),
        '设计' => fields.contains('设计') || fields.contains('design'),
        '新媒体' => fields.contains('新媒体') || fields.contains('media'),
        _ => fields.contains(artCategory.toLowerCase()),
      };

  final regionOk = region == '全部地区' || city.contains(region.toLowerCase());

  final verificationOk = verificationLevel == '全部认证' ||
      switch (verificationLevel) {
        '平台认证' => _isCertifiedArtist(item),
        '展览认证' => verificationText.contains('展览') ||
            verificationText.contains('exhibition'),
        '教育背景认证' => verificationText.contains('教育') ||
            verificationText.contains('school'),
        '职业认证' => verificationText.contains('职业') ||
            verificationText.contains('career'),
        _ => true,
      };

  final cooperationOk = cooperationType == '全部合作' ||
      switch (cooperationType) {
        '可合作' => (item['cooperation_status']?.toString() ?? 'available') ==
            'available',
        '展览' => cooperationText.contains('展') ||
            cooperationText.contains('exhibition'),
        '品牌联名' =>
          cooperationText.contains('品牌') || cooperationText.contains('brand'),
        '公共艺术' =>
          cooperationText.contains('公共') || cooperationText.contains('public'),
        '讲座工作坊' => cooperationText.contains('讲座') ||
            cooperationText.contains('工作坊') ||
            cooperationText.contains('workshop'),
        _ => cooperationText.contains(cooperationType.toLowerCase()),
      };

  return categoryOk && regionOk && verificationOk && cooperationOk;
}

List<String> _artistFields(Map<String, dynamic> artist) {
  final raw = artist['art_fields'];
  if (raw is List) {
    return raw
        .map((item) => item.toString().trim())
        .where((item) => item.isNotEmpty)
        .toList();
  }
  final text = raw?.toString().trim();
  if (text == null || text.isEmpty) return const [];
  return text.split(RegExp(r'[,，/、]+')).map((item) => item.trim()).toList();
}

List<String> _artistCooperationTypes(Map<String, dynamic> artist) {
  final metadata = _artistMetadata(artist);
  final raw = metadata['cooperation_types'] ?? artist['cooperation_types'];
  if (raw is List) {
    return raw
        .map((item) => _cooperationTypeLabel(item.toString()))
        .where((item) => item.isNotEmpty)
        .toList();
  }
  final intent = artist['cooperation_intent']?.toString().trim();
  if (intent != null && intent.isNotEmpty) {
    if (intent.contains('展')) return const ['展览'];
    if (intent.contains('品牌')) return const ['品牌联名'];
    if (intent.contains('公共')) return const ['公共艺术'];
  }
  return const [];
}

String _cooperationTypeLabel(String value) {
  return switch (value) {
    'exhibition' => '展览',
    'brand' => '品牌联名',
    'public_art' => '公共艺术',
    'workshop' => '讲座工作坊',
    _ => value,
  };
}

Map<String, dynamic> _artistMetadata(Map<String, dynamic> artist) {
  final raw = artist['metadata'];
  if (raw is Map) return Map<String, dynamic>.from(raw);
  return const {};
}

String _artistHandle(Map<String, dynamic> artist) {
  final raw = artist['handle']?.toString() ??
      artist['username']?.toString() ??
      artist['slug']?.toString();
  final text = raw?.trim();
  if (text != null && text.isNotEmpty) {
    return text.startsWith('@') ? text : '@$text';
  }
  final name = artist['display_name']?.toString().trim() ?? 'artist';
  final cleaned = name
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9]+'), '_')
      .replaceAll(RegExp(r'^_+|_+$'), '');
  if (cleaned.isNotEmpty) return '@$cleaned';
  return '@artist_${(name.hashCode.abs() % 99999).toString().padLeft(5, '0')}';
}

String _artistVerificationLabel(Map<String, dynamic> artist) {
  final badges = artist['verification_badges'];
  final text = badges?.toString() ?? '';
  if (text.contains('展')) return '展览认证';
  if (text.contains('学') || text.toLowerCase().contains('school')) {
    return '教育背景认证';
  }
  if (text.contains('职业') || text.toLowerCase().contains('career')) {
    return '职业认证';
  }
  return '平台认证艺术家';
}

int _artistInt(Object? value) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

List<String> _artistWorkUrls(Map<String, dynamic> artist, String? coverUrl) {
  final metadata = _artistMetadata(artist);
  final raw = metadata['portfolio_images'] ??
      metadata['work_urls'] ??
      artist['portfolio_images'] ??
      artist['work_urls'];
  final urls = <String>[
    if (coverUrl != null && coverUrl.trim().isNotEmpty) coverUrl.trim(),
  ];
  if (raw is List) {
    urls.addAll(
      raw
          .map((item) => item.toString().trim())
          .where((item) => item.isNotEmpty),
    );
  }
  return urls.toSet().toList();
}

class _ArtistLibraryHeader extends StatelessWidget {
  final int totalCount;
  final int availableCount;
  final VoidCallback onApply;

  const _ArtistLibraryHeader({
    required this.totalCount,
    required this.availableCount,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 13),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.32)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: kCobalt.withValues(alpha: 0.09),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.palette_outlined, color: kCobalt),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '已入驻艺术家',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '$totalCount 位已审核 · $availableCount 位可合作',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.46),
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          OutlinedButton.icon(
            onPressed: onApply,
            icon: const Icon(Icons.add_rounded, size: 17),
            label: const Text('入驻'),
            style: OutlinedButton.styleFrom(
              foregroundColor: kCobalt,
              side: BorderSide(color: kCobalt.withValues(alpha: 0.32)),
              visualDensity: VisualDensity.compact,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              textStyle: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
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

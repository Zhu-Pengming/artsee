import 'package:flutter/material.dart';

import '../../models/models.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import '../community/community_post_detail_screen.dart';
import 'ask_question_screen.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class ForumScreen extends StatefulWidget {
  final VoidCallback? onTabChanged;

  const ForumScreen({super.key, this.onTabChanged});

  @override
  State<ForumScreen> createState() => ForumScreenState();
}

class ForumScreenState extends State<ForumScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _sortType = '综合';
  String? _highlightQuestionTitle;
  final GlobalKey<_QaCommunityTabState> _qaKey =
      GlobalKey<_QaCommunityTabState>();
  final GlobalKey<_CircleTabState> _circleKey = GlobalKey<_CircleTabState>();
  final GlobalKey<_SalonTabState> _salonKey = GlobalKey<_SalonTabState>();
  String _searchKeyword = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
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
  }

  int get activeTabIndex => _tabController.index;

  String get searchHint => switch (_tabController.index) {
        0 => '搜索问题、学校、作品集经验',
        1 => '搜索圈子、专业方向、学校社群',
        2 => '搜索活动、嘉宾、主题',
        3 => '搜索联系人、合作消息、通知',
        _ => '搜索社区内容',
      };

  IconData get actionIcon => switch (_tabController.index) {
        0 => Icons.question_answer_outlined,
        1 => Icons.group_add_outlined,
        2 => Icons.event_available_outlined,
        3 => Icons.add_comment_outlined,
        _ => Icons.add_rounded,
      };

  void applySearch(String keyword) {
    setState(() => _searchKeyword = keyword.trim());
  }

  Future<void> openQuestionComposer({
    String? initialTitle,
    String? initialCategory,
  }) async {
    final createdTitle = await Navigator.of(context).push<String?>(
      MaterialPageRoute(
        builder: (_) => AskQuestionScreen(
          initialTitle: initialTitle,
          initialCategory: initialCategory,
          searchKeyword: _searchKeyword,
        ),
      ),
    );
    if (!mounted || createdTitle == null) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      setState(() => _highlightQuestionTitle = createdTitle);
      _qaKey.currentState?._load();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('问题已发布，我们会推荐给相关方向用户'),
        ),
      );
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted && _highlightQuestionTitle == createdTitle) {
        setState(() => _highlightQuestionTitle = null);
      }
    });
  }

  void refreshActiveTab() {
    switch (_tabController.index) {
      case 0:
        _qaKey.currentState?._load();
        break;
      case 1:
        _circleKey.currentState?._load();
        break;
      case 2:
        _salonKey.currentState?._load();
        break;
    }
  }

  void addCreatedCircle(Map<String, dynamic> circle) {
    _circleKey.currentState?.addCreatedCircle(circle);
  }

  void openMyReservations() {
    _salonKey.currentState?.openReservations();
  }

  void addCreatedSalon(Map<String, dynamic> salon) {
    _salonKey.currentState?.addCreatedSalon(salon);
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
              child: _SocialTabs(controller: _tabController),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _QaCommunityTab(
                    key: _qaKey,
                    bottom: bottom,
                    searchKeyword: _searchKeyword,
                    sortType: _sortType,
                    highlightedTitle: _highlightQuestionTitle,
                    onAsk: openQuestionComposer,
                    onSortChanged: (value) => setState(() => _sortType = value),
                  ),
                  _CircleTab(
                    key: _circleKey,
                    bottom: bottom,
                    searchKeyword: _searchKeyword,
                  ),
                  _SalonTab(
                    key: _salonKey,
                    bottom: bottom,
                    searchKeyword: _searchKeyword,
                  ),
                  _ChatTab(
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

class _QaCommunityTab extends StatefulWidget {
  final double bottom;
  final String searchKeyword;
  final String sortType;
  final String? highlightedTitle;
  final Future<void> Function({
    String? initialTitle,
    String? initialCategory,
  }) onAsk;
  final ValueChanged<String> onSortChanged;

  const _QaCommunityTab({
    super.key,
    required this.bottom,
    required this.searchKeyword,
    required this.sortType,
    required this.highlightedTitle,
    required this.onAsk,
    required this.onSortChanged,
  });

  @override
  State<_QaCommunityTab> createState() => _QaCommunityTabState();
}

class _QaCommunityTabState extends State<_QaCommunityTab> {
  List<AppCommunityPost> _questions = const [];
  bool _loading = true;
  String? _error;
  String? _selectedBlock;

  static const blocks = [
    (
      title: '艺术留学',
      count: '申请 / 院校',
      color: Color(0xFFEFF6FF),
      text: Color(0xFF2563EB)
    ),
    (
      title: '作品集',
      count: '叙事 / 诊断',
      color: Color(0xFFF5F3FF),
      text: Color(0xFF7C3AED)
    ),
    (
      title: '行业就业',
      count: '岗位 / 合作',
      color: Color(0xFFECFDF5),
      text: Color(0xFF059669)
    ),
    (
      title: '艺术市场',
      count: '收藏 / 展览',
      color: Color(0xFFFFF7ED),
      text: Color(0xFFEA580C)
    ),
  ];

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
      final data = await BackendApiService.fetchCommunityPosts(
        limit: 40,
        kind: 'qa',
      );
      if (!mounted) return;
      setState(() {
        _questions = data;
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
    final sorted = [..._questions];
    if (widget.sortType == '最新') {
      sorted.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    } else if (widget.sortType == '高赞') {
      sorted.sort((a, b) => b.likeCount.compareTo(a.likeCount));
    } else {
      sorted.sort((a, b) => (b.likeCount + b.commentCount)
          .compareTo(a.likeCount + a.commentCount));
    }
    final filteredByBlock = _selectedBlock == null
        ? sorted
        : sorted
            .where((question) => _matchesBlock(question, _selectedBlock!))
            .toList();
    final visibleQuestions = widget.searchKeyword.isEmpty
        ? filteredByBlock
        : filteredByBlock
            .where((question) => _matchesSearch(
                  '${question.title} ${question.body ?? ''}',
                  widget.searchKeyword,
                ))
            .toList();
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 32),
      children: [
        _QuickAskCard(
          onAsk: () => widget.onAsk(initialCategory: _selectedBlock),
        ),
        const SizedBox(height: 14),
        _CommunitySectionHeader(title: '问题方向', action: 'FILTER'),
        const SizedBox(height: 10),
        _BlockChipStrip(
          blocks: blocks,
          selectedBlock: _selectedBlock,
          onSelected: (block) {
            setState(() {
              _selectedBlock = _selectedBlock == block ? null : block;
            });
          },
        ),
        const SizedBox(height: 22),
        Row(
          children: [
            Expanded(
              child: Text(
                '大家都在问',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: context.artC.ink,
                  letterSpacing: 1.2,
                ),
              ),
            ),
            for (final item in const ['综合', '最新', '高赞'])
              GestureDetector(
                onTap: () => widget.onSortChanged(item),
                child: Container(
                  margin: const EdgeInsets.only(left: 6),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: widget.sortType == item
                        ? kCobalt.withOpacity(0.08)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    item,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: widget.sortType == item
                          ? kCobalt
                          : context.artC.ink.withOpacity(0.32),
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        if (_loading)
          const Padding(
            padding: EdgeInsets.only(top: 24),
            child: LoadingIndicator(),
          )
        else if (_error != null)
          _CommunityEmptyState(
            title: '问答加载失败',
            subtitle: _error!,
            onRetry: _load,
          )
        else if (visibleQuestions.isEmpty)
          Column(
            children: [
              _QuestionTemplateStrip(
                selectedBlock: _selectedBlock,
                searchKeyword: widget.searchKeyword,
                onTemplateTap: (title) => widget.onAsk(
                  initialTitle: title,
                  initialCategory: _selectedBlock,
                ),
              ),
              const SizedBox(height: 12),
              _CommunityEmptyState(
                icon: Icons.help_outline_rounded,
                title:
                    _selectedBlock == null ? '还没有相关问题' : '暂无$_selectedBlock问答',
                subtitle: _selectedBlock == null
                    ? '你可以发布第一个问题，或从推荐问题模板开始。'
                    : '当前方向还没有内容，可以发布一个更具体的问题。',
                actionLabel: '提一个问题',
                onRetry: () => widget.onAsk(initialCategory: _selectedBlock),
              ),
            ],
          )
        else ...[
          ...visibleQuestions.map(
            (question) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _QuestionCard(
                question: question,
                highlighted: widget.highlightedTitle == question.title,
              ),
            ),
          ),
          const SizedBox(height: 6),
          _CovenantCard(onTap: _showCovenantDialog),
        ],
      ],
    );
  }

  bool _matchesBlock(AppCommunityPost question, String block) {
    final text = '${question.title} ${question.body ?? ''}'.toLowerCase();
    final keywords = switch (block) {
      '艺术留学' => ['留学', '院校', '申请', 'ual', 'rca', 'risd', '作品集'],
      '作品集' => ['作品集', '叙事', '诊断', '创作', 'portfolio'],
      '行业就业' => ['就业', '岗位', '实习', '合作', '职业', 'job'],
      '艺术市场' => ['市场', '收藏', '展览', '画廊', '拍卖', '藏品'],
      _ => <String>[],
    };
    return keywords.any(text.contains);
  }

  void _showCovenantDialog() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        margin: const EdgeInsets.all(14),
        padding: const EdgeInsets.fromLTRB(24, 18, 24, 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: context.artC.silver.withOpacity(0.28)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 4,
                decoration: BoxDecoration(
                  color: context.artC.silver.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                '艺术创作者公约',
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  fontFamily: 'Noto Serif SC',
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '这里会沉淀平台关于原创、授权、合作、展览与商业邀约的基础规则。当前版本先开放加入意向，后续会接入创作者认证与合作协议。',
                style: TextStyle(
                  color: context.artC.ink.withOpacity(0.58),
                  fontSize: 13,
                  height: 1.6,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 18),
              GestureDetector(
                onTap: () => Navigator.of(ctx).pop(),
                child: Container(
                  width: double.infinity,
                  height: 46,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: context.artC.ink,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    '我知道了',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CircleTab extends StatefulWidget {
  final double bottom;
  final String searchKeyword;

  const _CircleTab({
    super.key,
    required this.bottom,
    required this.searchKeyword,
  });

  @override
  State<_CircleTab> createState() => _CircleTabState();
}

class _CircleTabState extends State<_CircleTab> {
  List<Map<String, dynamic>> _items = const [];
  final Map<String, String> _joinStatusOverrides = {};
  bool _loading = true;
  String? _error;
  String _selectedFilter = '推荐';

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
      final result = await BackendApiService.fetchCommunityCircles(limit: 40);
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
    if (_loading) return const LoadingIndicator();
    if (_error != null) {
      return ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 32),
        children: [
          _CommunityEmptyState(
            icon: Icons.groups_outlined,
            title: '圈子加载失败',
            subtitle: _error!,
            onRetry: _load,
          ),
        ],
      );
    }
    if (_items.isEmpty) {
      return ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 32),
        children: [
          _CommunityEmptyState(
            icon: Icons.groups_outlined,
            title: '还没有圈子',
            subtitle: '根据你的方向创建或加入第一个艺术社群。',
            actionLabel: '刷新圈子',
            onRetry: _load,
          ),
        ],
      );
    }
    final searchItems = widget.searchKeyword.isEmpty
        ? _items
        : _items
            .where((circle) => _matchesSearch(
                  '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''}',
                  widget.searchKeyword,
                ))
            .toList();
    final visibleItems = _filterCircles(searchItems);
    final joinedItems = _items
        .asMap()
        .entries
        .where((entry) => _circleJoinStatus(entry.value, entry.key) == 'joined')
        .map((entry) => entry.value)
        .toList();

    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 72),
      children: [
        _MyCircleStrip(
          items: joinedItems,
          onBrowse: () => setState(() => _selectedFilter = '推荐'),
          onOpen: (circle) {
            final originalIndex = _items.indexOf(circle);
            _openCircleDetail(circle, originalIndex < 0 ? 0 : originalIndex);
          },
        ),
        const SizedBox(height: 18),
        _PillFilterRow(
          values: const ['推荐', '已加入', '留学', '作品集', '同城', '就业', '市场'],
          selected: _selectedFilter,
          onSelected: (value) => setState(() => _selectedFilter = value),
        ),
        const SizedBox(height: 12),
        _CircleResultHeader(
          title: _circleFilterTitle,
          subtitle: _circleFilterSubtitle,
        ),
        const SizedBox(height: 12),
        GridView.builder(
          padding: EdgeInsets.zero,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: visibleItems.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            mainAxisExtent: 250,
          ),
          itemBuilder: (context, index) {
            final circle = visibleItems[index];
            final originalIndex = _items.indexOf(circle);
            final circleIndex = originalIndex < 0 ? index : originalIndex;
            return _CircleCard(
              circle: circle,
              index: circleIndex,
              joinStatus: _circleJoinStatus(circle, circleIndex),
              onOpen: () => _openCircleDetail(circle, circleIndex),
              onAction: () => _handleCircleAction(circle, circleIndex),
            );
          },
        ),
        if (visibleItems.isEmpty)
          _CommunityEmptyState(
            icon: Icons.groups_outlined,
            title: _selectedFilter == '已加入' ? '你还没有加入圈子' : '没有匹配的圈子',
            subtitle: _selectedFilter == '已加入'
                ? '先从推荐、留学或作品集方向选择一个圈子加入。'
                : '换个专业方向、学校或城市关键词试试，也可以创建一个新圈子。',
            actionLabel: _selectedFilter == '已加入' ? '去推荐' : '创建圈子',
            onRetry: () {
              if (_selectedFilter == '已加入') {
                setState(() => _selectedFilter = '推荐');
              } else {
                _load();
              }
            },
          ),
      ],
    );
  }

  List<Map<String, dynamic>> _filterCircles(List<Map<String, dynamic>> source) {
    if (_selectedFilter == '推荐') return source;
    return source
        .asMap()
        .entries
        .where((entry) {
          final circle = entry.value;
          final originalIndex = _items.indexOf(circle);
          final circleIndex = originalIndex < 0 ? entry.key : originalIndex;
          final text =
              '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''} ${circle['city'] ?? ''}'
                  .toLowerCase();
          return switch (_selectedFilter) {
            '已加入' => _circleJoinStatus(circle, circleIndex) == 'joined',
            '留学' =>
              ['留学', '申请', 'ual', 'rca', 'risd', '作品集'].any(text.contains),
            '作品集' => ['作品集', 'portfolio', '诊断', '叙事'].any(text.contains),
            '同城' => ['同城', '上海', '北京', '伦敦', '纽约', 'city'].any(text.contains),
            '就业' => ['就业', '实习', '职业', '岗位', 'career'].any(text.contains),
            '市场' => ['市场', '展览', '收藏', '画廊', 'market'].any(text.contains),
            _ => true,
          };
        })
        .map((entry) => entry.value)
        .toList();
  }

  String _circleJoinStatus(Map<String, dynamic> circle, int index) {
    final id = _circleId(circle, index);
    final override = _joinStatusOverrides[id];
    if (override != null) return override;
    final raw = circle['join_status']?.toString();
    if (raw != null && raw.isNotEmpty) return raw;
    if (index < 2) return 'joined';
    if (index % 5 == 3) return 'pending';
    return 'none';
  }

  String _circleJoinType(Map<String, dynamic> circle, int index) {
    final raw = circle['join_type']?.toString();
    if (raw == 'open' || raw == 'approval' || raw == 'private') return raw!;
    final metadata = circle['metadata'];
    if (metadata is Map) {
      final metaRaw = metadata['join_type']?.toString();
      if (metaRaw == 'open' || metaRaw == 'approval' || metaRaw == 'private') {
        return metaRaw!;
      }
    }
    final text =
        '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''}'
            .toLowerCase();
    if (text.contains('认证') || text.contains('研究') || index % 3 == 0) {
      return 'approval';
    }
    return 'open';
  }

  String _circleId(Map<String, dynamic> circle, int index) =>
      circle['id']?.toString() ?? '${circle['title'] ?? 'circle'}-$index';

  String get _circleFilterTitle => switch (_selectedFilter) {
        '已加入' => '已加入圈子',
        '留学' => '留学圈子',
        '作品集' => '作品集圈子',
        '同城' => '同城圈子',
        '就业' => '就业圈子',
        '市场' => '艺术市场圈子',
        _ => '推荐圈子',
      };

  String get _circleFilterSubtitle => switch (_selectedFilter) {
        '已加入' => '查看你的社群动态和新消息',
        '留学' => '申请、作品集、院校互助相关社群',
        '作品集' => '项目叙事、诊断反馈和作品集经验',
        '同城' => '附近艺术活动、展览和城市社群',
        '就业' => '实习、职业发展和行业资源',
        '市场' => '展览、收藏和艺术市场讨论',
        _ => '根据你的专业方向和社区活跃度推荐',
      };

  void _handleCircleAction(Map<String, dynamic> circle, int index) {
    final status = _circleJoinStatus(circle, index);
    if (status == 'joined') {
      _openCircleDetail(circle, index);
      return;
    }
    if (status == 'pending') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('申请正在审核中')),
      );
      return;
    }
    final id = _circleId(circle, index);
    final joinType = _circleJoinType(circle, index);
    if (joinType == 'private') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('这个圈子暂时不可加入')),
      );
      return;
    }
    final needsApproval = joinType == 'approval';
    setState(() {
      _joinStatusOverrides[id] = needsApproval ? 'pending' : 'joined';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(needsApproval
            ? '申请已提交，审核通过后会通知你'
            : '已加入「${circle['title'] ?? '艺术圈子'}」'),
      ),
    );
  }

  void _openCircleDetail(Map<String, dynamic> circle, int index) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CircleDetailScreen(
          circle: circle,
          index: index,
          joinStatus: _circleJoinStatus(circle, index),
          onJoinChanged: (status) {
            setState(
              () => _joinStatusOverrides[_circleId(circle, index)] = status,
            );
          },
        ),
      ),
    );
  }

  void addCreatedCircle(Map<String, dynamic> circle) {
    final next = {
      ...circle,
      'join_status': 'joined',
      'member_count': circle['member_count'] ?? 1,
      'today_post_count': circle['today_post_count'] ?? 0,
      'hot_topic': circle['hot_topic'] ?? '发布第一条讨论，开启圈子交流',
    };
    setState(() {
      _items = [next, ..._items];
      _joinStatusOverrides[_circleId(next, 0)] = 'joined';
      _selectedFilter = '已加入';
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _openCircleDetail(next, 0);
    });
  }
}

class _SalonTab extends StatefulWidget {
  final double bottom;
  final String searchKeyword;

  const _SalonTab({
    super.key,
    required this.bottom,
    required this.searchKeyword,
  });

  @override
  State<_SalonTab> createState() => _SalonTabState();
}

class _SalonTabState extends State<_SalonTab> {
  List<Map<String, dynamic>> _items = const [];
  final Set<String> _reservedSalonIds = {};
  bool _loading = true;
  String? _error;
  String _selectedFilter = '全部';

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
      final result =
          await BackendApiService.fetchEvents(limit: 30, type: 'salon');
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

  Future<void> _apply(Map<String, dynamic> salon, int index) async {
    final id = salon['id']?.toString() ?? 'salon-$index';
    if (_reservedSalonIds.contains(id)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('你已经预约过这个沙龙')),
      );
      return;
    }
    final confirmed = await _confirmReservation(salon, index);
    if (confirmed != true) return;
    try {
      await BackendApiService.applyEvent(
        eventId: id,
        applyNote: '我想参加这个艺术沙龙。',
      );
      if (!mounted) return;
      setState(() => _reservedSalonIds.add(id));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('预约已提交，你可以在私信中查看活动通知')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('报名失败：$e')),
      );
    }
  }

  Future<bool?> _confirmReservation(Map<String, dynamic> salon, int index) {
    return showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('预约沙龙'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              salon['title']?.toString() ?? '未命名沙龙',
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 12),
            _InfoLine(
              icon: Icons.calendar_today_outlined,
              text: _formatForumDate(salon['start_time']),
            ),
            const SizedBox(height: 8),
            _InfoLine(
              icon: Icons.location_on_outlined,
              text: salon['venue']?.toString().isNotEmpty == true
                  ? salon['venue'].toString()
                  : salon['city']?.toString() ?? '地点待定',
            ),
            const SizedBox(height: 8),
            _InfoLine(
              icon: Icons.payments_outlined,
              text: _formatSalonFeeWithSeats(salon, index),
            ),
            const SizedBox(height: 12),
            Text(
              '预约后，活动通知会发送到私信。',
              style: TextStyle(
                color: context.artC.ink.withOpacity(0.45),
                fontSize: 12,
                height: 1.45,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('确认预约'),
          ),
        ],
      ),
    );
  }

  void openReservations() {
    final reserved = _items.asMap().entries.where((entry) {
      final id = entry.value['id']?.toString() ?? 'salon-${entry.key}';
      return _reservedSalonIds.contains(id);
    }).toList();
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => _ReservationSheet(reserved: reserved),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingIndicator();
    if (_error != null) {
      return ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 32),
        children: [
          _CommunityEmptyState(
            icon: Icons.event_outlined,
            title: '沙龙加载失败',
            subtitle: _error!,
            onRetry: _load,
          ),
        ],
      );
    }
    final searchItems = widget.searchKeyword.isEmpty
        ? _items
        : _items
            .where((salon) => _matchesSearch(
                  '${salon['title'] ?? ''} ${salon['summary'] ?? ''} ${salon['description'] ?? ''} ${salon['venue'] ?? ''} ${salon['city'] ?? ''} ${_salonGuestLine(salon, 0)}',
                  widget.searchKeyword,
                ))
            .toList();
    final visibleItems = searchItems
        .asMap()
        .entries
        .where((entry) {
          return _matchesSalonFilter(entry.value, entry.key, _selectedFilter);
        })
        .map((entry) => entry.value)
        .toList();
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 96),
      children: [
        _PillFilterRow(
          values: const ['全部', '留学', '作品集', '校友', '就业', '市场'],
          selected: _selectedFilter,
          onSelected: (value) => setState(() => _selectedFilter = value),
        ),
        const SizedBox(height: 12),
        _CircleResultHeader(
          title: _salonFilterTitle(_selectedFilter),
          subtitle: _salonFilterSubtitle(_selectedFilter),
        ),
        const SizedBox(height: 14),
        if (visibleItems.isEmpty)
          _CommunityEmptyState(
            icon: Icons.event_outlined,
            title: '暂无${_salonFilterTitle(_selectedFilter)}',
            subtitle: '你可以关注该主题，有新活动时我们会通知你。',
            actionLabel: _selectedFilter == '全部' ? '刷新沙龙' : '查看全部',
            onRetry: () {
              if (_selectedFilter == '全部') {
                _load();
              } else {
                setState(() => _selectedFilter = '全部');
              }
            },
          )
        else
          ...visibleItems.asMap().entries.map(
                (entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: _SalonCard(
                    salon: entry.value,
                    index: entry.key,
                    reserved: _reservedSalonIds.contains(
                      entry.value['id']?.toString() ?? 'salon-${entry.key}',
                    ),
                    onOpen: () => _openSalonDetail(entry.value, entry.key),
                    onApply: () => _apply(entry.value, entry.key),
                  ),
                ),
              ),
      ],
    );
  }

  void _openSalonDetail(Map<String, dynamic> salon, int index) {
    final id = salon['id']?.toString() ?? 'salon-$index';
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => SalonDetailScreen(
          salon: salon,
          index: index,
          reserved: _reservedSalonIds.contains(id),
          onReserve: () async {
            await _apply(salon, index);
            return _reservedSalonIds.contains(id);
          },
        ),
      ),
    );
  }

  void addCreatedSalon(Map<String, dynamic> salon) {
    final next = {
      ...salon,
      'status': salon['status'] ?? 'published',
    };
    setState(() {
      _items = [next, ..._items];
      _selectedFilter = '全部';
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _openSalonDetail(next, 0);
    });
  }
}

class _ChatTab extends StatefulWidget {
  final double bottom;
  final String searchKeyword;

  const _ChatTab({
    required this.bottom,
    required this.searchKeyword,
  });

  @override
  State<_ChatTab> createState() => _ChatTabState();
}

class _ChatTabState extends State<_ChatTab> {
  List<Map<String, dynamic>> _items = const [];
  bool _loading = true;
  String? _error;
  String _selectedFilter = '全部';

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
      final result = await BackendApiService.fetchConversations(limit: 30);
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
    if (_loading) return const LoadingIndicator();
    if (_error != null) {
      return ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 32),
        children: [
          _CommunityEmptyState(
            icon: Icons.mark_chat_unread_outlined,
            title: '私信加载失败',
            subtitle: _error!.contains('401') || _error!.contains('未授权')
                ? '登录后可以查看真实合作邀约、圈子消息和沙龙沟通。'
                : _error!,
            onRetry: _load,
          ),
        ],
      );
    }
    final visibleItems = widget.searchKeyword.isEmpty
        ? _items
        : _items
            .where((conversation) => _matchesSearch(
                  '${conversation['title'] ?? ''} ${conversation['type'] ?? ''} ${conversation['latest_message'] ?? ''}',
                  widget.searchKeyword,
                ))
            .toList();

    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 32),
      children: [
        _PillFilterRow(
          values: const ['全部', '合作', '圈子', '沙龙', '系统'],
          selected: _selectedFilter,
          onSelected: (value) => setState(() => _selectedFilter = value),
        ),
        const SizedBox(height: 16),
        if (visibleItems.isEmpty)
          Column(
            children: [
              const _MessageEmptyActions(),
              const SizedBox(height: 12),
              _CommunityEmptyState(
                icon: Icons.mark_chat_unread_outlined,
                title: widget.searchKeyword.isEmpty ? '暂无私信' : '没有匹配的消息',
                subtitle: widget.searchKeyword.isEmpty
                    ? '当你加入圈子、预约沙龙或收到合作邀约后，消息会显示在这里。'
                    : '换个联系人、合作或通知关键词试试。',
                actionLabel: '刷新消息',
                onRetry: _load,
              ),
            ],
          )
        else
          ...visibleItems.asMap().entries.map(
                (entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _ChatCard(
                    conversation: entry.value,
                    index: entry.key,
                  ),
                ),
              ),
      ],
    );
  }
}

class _SocialTabs extends StatelessWidget {
  final TabController controller;

  const _SocialTabs({required this.controller});

  @override
  Widget build(BuildContext context) {
    const tabs = [
      (label: '问答', icon: Icons.help_outline),
      (label: '圈子', icon: Icons.groups_outlined),
      (label: '沙龙', icon: Icons.auto_awesome),
      (label: '私信', icon: Icons.chat_bubble_outline),
    ];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.34),
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
        labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
        tabs: tabs
            .map(
              (tab) => Tab(
                height: 40,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(tab.icon, size: 13),
                    const SizedBox(width: 4),
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

class _QuickAskCard extends StatelessWidget {
  final VoidCallback onAsk;

  const _QuickAskCard({required this.onAsk});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: context.artC.ink.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(15),
            ),
            child:
                const Icon(Icons.auto_awesome, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '有申请、作品集或就业问题？',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '向校友、导师和行业从业者提问',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.52),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: onAsk,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '提问',
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BlockChipStrip extends StatelessWidget {
  final List<({String title, String count, Color color, Color text})> blocks;
  final String? selectedBlock;
  final ValueChanged<String> onSelected;

  const _BlockChipStrip({
    required this.blocks,
    required this.selectedBlock,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: blocks
            .map(
              (block) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => onSelected(block.title),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 160),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 13,
                      vertical: 9,
                    ),
                    decoration: BoxDecoration(
                      color: selectedBlock == block.title
                          ? block.text
                          : Colors.white,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: selectedBlock == block.title
                            ? block.text
                            : context.artC.silver.withOpacity(0.6),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.tag,
                          size: 12,
                          color: selectedBlock == block.title
                              ? Colors.white
                              : block.text,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          block.title,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                            color: selectedBlock == block.title
                                ? Colors.white
                                : context.artC.ink.withOpacity(0.68),
                          ),
                        ),
                      ],
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

class _QuestionTemplateStrip extends StatelessWidget {
  final String? selectedBlock;
  final String searchKeyword;
  final ValueChanged<String> onTemplateTap;

  const _QuestionTemplateStrip({
    required this.selectedBlock,
    required this.searchKeyword,
    required this.onTemplateTap,
  });

  @override
  Widget build(BuildContext context) {
    final keyword = searchKeyword.trim().isNotEmpty
        ? searchKeyword.trim()
        : selectedBlock ?? '皇家艺术';
    final templates = [
      '$keyword 作品集需要几个项目？',
      '申请 RCA 面试通常会问什么？',
      '纯艺转设计申请可行吗？',
    ];
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.32)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '推荐问题模板',
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          ...templates.map(
            (item) => GestureDetector(
              onTap: () => onTemplateTap(item),
              child: Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Icon(Icons.arrow_outward_rounded,
                        size: 14, color: kCobalt.withOpacity(0.78)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item,
                        style: TextStyle(
                          color: context.artC.ink.withOpacity(0.62),
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CovenantCard extends StatelessWidget {
  final VoidCallback onTap;

  const _CovenantCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
                  const Text(
                    '艺术创作者公约',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '共同定义未来的艺术商业规则。',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.45),
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '立即加入',
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuestionCard extends StatelessWidget {
  final AppCommunityPost question;
  final bool highlighted;

  const _QuestionCard({
    required this.question,
    this.highlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    final category = question.metadata['category']?.toString();
    final school = question.metadata['school']?.toString();
    final anonymous = question.metadata['anonymous'] == true;
    final answerCount = question.commentCount;
    final expertCount = int.tryParse(
          question.metadata['expert_answer_count']?.toString() ?? '',
        ) ??
        (answerCount >= 2 ? 1 : 0);
    final statusLabel = highlighted
        ? '刚刚发布'
        : answerCount == 0
            ? '等待回答'
            : expertCount > 0
                ? '$expertCount 个认证回答'
                : '$answerCount 个回答';
    return GestureDetector(
      onTap: () => _openQuestionDetail(context, false),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color:
                highlighted ? kCobalt : context.artC.silver.withOpacity(0.38),
            width: highlighted ? 1.4 : 1,
          ),
          boxShadow: highlighted
              ? [
                  BoxShadow(
                    color: kCobalt.withOpacity(0.12),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 7,
              runSpacing: 7,
              children: [
                _QuestionBadge(label: category ?? '问答', dark: true),
                if (school != null && school.isNotEmpty)
                  _QuestionBadge(label: school, dark: false),
                if (expertCount > 0)
                  _QuestionBadge(label: '有认证回答', dark: false),
                _QuestionBadge(label: statusLabel, dark: highlighted),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              question.title.isEmpty ? '未命名问题' : question.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 17,
                height: 1.28,
                fontWeight: FontWeight.w900,
                color: context.artC.ink,
                fontFamily: 'Noto Serif SC',
              ),
            ),
            const SizedBox(height: 10),
            Text(
              (question.body ?? '').isEmpty
                  ? '还没有补充说明，点击进入后可以继续讨论。'
                  : question.body!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                height: 1.45,
                color: context.artC.ink.withOpacity(0.52),
              ),
            ),
            const SizedBox(height: 13),
            Text(
              '${anonymous ? '匿名用户' : question.authorNickname ?? 'Artsee 用户'} · ${timeAgo(question.createdAt)}',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: context.artC.ink.withOpacity(0.35),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(
                    '$answerCount 回答 · $expertCount 认证回答 · ${_compactCount(question.viewCount)} 浏览',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink.withOpacity(0.38),
                    ),
                  ),
                ),
                _SmallButton(label: '收藏', dark: false),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _openQuestionDetail(context, true),
                  child: _SmallButton(label: '写回答', dark: true),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _openQuestionDetail(BuildContext context, bool focusAnswer) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CommunityPostDetailScreen(
          postId: question.id,
          initialPost: question,
          focusAnswer: focusAnswer,
        ),
      ),
    );
  }
}

class _QuestionBadge extends StatelessWidget {
  final String label;
  final bool dark;

  const _QuestionBadge({required this.label, required this.dark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: dark ? kCobalt : context.artC.silver.withOpacity(0.34),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: dark ? Colors.white : context.artC.ink.withOpacity(0.54),
          fontSize: 9,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

String _compactCount(int value) {
  if (value >= 10000) return '${(value / 10000).toStringAsFixed(1)}w';
  if (value >= 1000) return '${(value / 1000).toStringAsFixed(1)}k';
  return '$value';
}

class _PillFilterRow extends StatelessWidget {
  final List<String> values;
  final String selected;
  final ValueChanged<String> onSelected;

  const _PillFilterRow({
    required this.values,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: values
            .map(
              (value) => GestureDetector(
                onTap: () => onSelected(value),
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 13,
                    vertical: 9,
                  ),
                  decoration: BoxDecoration(
                    color: selected == value ? context.artC.ink : Colors.white,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: selected == value
                          ? context.artC.ink
                          : context.artC.silver.withOpacity(0.46),
                    ),
                  ),
                  child: Text(
                    value,
                    style: TextStyle(
                      color: selected == value
                          ? Colors.white
                          : context.artC.ink.withOpacity(0.54),
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
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

class _MyCircleStrip extends StatelessWidget {
  final List<Map<String, dynamic>> items;
  final VoidCallback onBrowse;
  final ValueChanged<Map<String, dynamic>> onOpen;

  const _MyCircleStrip({
    required this.items,
    required this.onBrowse,
    required this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return GestureDetector(
        onTap: onBrowse,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: context.artC.ink,
            borderRadius: BorderRadius.circular(22),
          ),
          child: Row(
            children: [
              const Icon(Icons.groups_outlined, color: Colors.white, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '还没有加入圈子',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '选择一个专业方向，找到同频创作者',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.54),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '浏览推荐',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.82),
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ),
      );
    }
    final display = items;
    final totalUnread = display.length * 12;
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '我的圈子',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${display.length} 个已加入 · $totalUnread 条新动态',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.52),
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                'JOINED',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.38),
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.4,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...display.take(2).map(
                (circle) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: GestureDetector(
                    onTap: () => onOpen(circle),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(11),
                          ),
                          child: const Icon(
                            Icons.forum_outlined,
                            size: 16,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            circle['title']?.toString() ?? '艺术圈子',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        Text(
                          '12 新',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.62),
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
        ],
      ),
    );
  }
}

class _CircleResultHeader extends StatelessWidget {
  final String title;
  final String subtitle;

  const _CircleResultHeader({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: TextStyle(
                  color: context.artC.ink.withOpacity(0.42),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        const Icon(Icons.auto_awesome, color: kCobalt, size: 16),
      ],
    );
  }
}

class _MiniTag extends StatelessWidget {
  final String label;

  const _MiniTag({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.42),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: context.artC.ink.withOpacity(0.46),
          fontSize: 8,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _CircleCard extends StatelessWidget {
  final Map<String, dynamic> circle;
  final int index;
  final String joinStatus;
  final VoidCallback onOpen;
  final VoidCallback onAction;

  const _CircleCard({
    required this.circle,
    required this.index,
    required this.joinStatus,
    required this.onOpen,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final title = circle['title']?.toString() ?? '未命名圈子';
    final category = circle['category']?.toString().isNotEmpty == true
        ? circle['category'].toString()
        : 'Art Circle';
    final memberCount = circle['member_count'] ?? (index + 1) * 128;
    final discussions =
        int.tryParse(circle['today_post_count']?.toString() ?? '') ??
            (8 + index * 5);
    final tags = _circleTags(circle, index);
    final hotTopic = _circleHotTopic(circle, index);
    final icon = _circleIcon(circle, index);
    final action = _circleActionStyle(context, circle, index, joinStatus);

    return GestureDetector(
      onTap: onOpen,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: context.artC.silver.withOpacity(0.38)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: context.artC.silver.withOpacity(0.2),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Icon(
                icon,
                color: kCobalt,
                size: 21,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 14,
                height: 1.16,
                fontWeight: FontWeight.w900,
                color: context.artC.ink,
                fontFamily: 'Noto Serif SC',
              ),
            ),
            const SizedBox(height: 4),
            Text(
              circle['subtitle']?.toString().isNotEmpty == true
                  ? circle['subtitle'].toString()
                  : category,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 9,
                color: context.artC.ink.withOpacity(0.46),
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 7),
            Wrap(
              spacing: 5,
              runSpacing: 4,
              children:
                  tags.take(2).map((tag) => _MiniTag(label: tag)).toList(),
            ),
            const SizedBox(height: 8),
            Text(
              '热议：$hotTopic',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: context.artC.ink.withOpacity(0.56),
                fontSize: 10,
                height: 1.35,
                fontWeight: FontWeight.w800,
              ),
            ),
            const Spacer(),
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: Color(0xFF22C55E),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    '$memberCount 人 · 今日 $discussions 条',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink.withOpacity(0.38),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: onAction,
              behavior: HitTestBehavior.opaque,
              child: Container(
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: action.background,
                  borderRadius: BorderRadius.circular(12),
                  border: action.borderColor == null
                      ? null
                      : Border.all(color: action.borderColor!),
                ),
                child: Text(
                  action.label,
                  style: TextStyle(
                    color: action.foreground,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
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

class CircleDetailScreen extends StatefulWidget {
  final Map<String, dynamic> circle;
  final int index;
  final String joinStatus;
  final ValueChanged<String> onJoinChanged;

  const CircleDetailScreen({
    super.key,
    required this.circle,
    required this.index,
    required this.joinStatus,
    required this.onJoinChanged,
  });

  @override
  State<CircleDetailScreen> createState() => _CircleDetailScreenState();
}

class _CircleDetailScreenState extends State<CircleDetailScreen> {
  late String _joinStatus = widget.joinStatus;
  String _selectedSection = '动态';
  final List<({String type, String title, String meta})> _localPosts = [];

  @override
  Widget build(BuildContext context) {
    final title = widget.circle['title']?.toString() ?? '未命名圈子';
    final subtitle = widget.circle['subtitle']?.toString().isNotEmpty == true
        ? widget.circle['subtitle'].toString()
        : widget.circle['category']?.toString() ?? 'Art Circle';
    final memberCount =
        widget.circle['member_count'] ?? (widget.index + 1) * 128;
    final discussions =
        int.tryParse(widget.circle['today_post_count']?.toString() ?? '') ??
            (8 + widget.index * 5);
    final tags = _circleTags(widget.circle, widget.index);
    final action =
        _circleActionStyle(context, widget.circle, widget.index, _joinStatus);

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        foregroundColor: context.artC.ink,
        title: const Text('圈子详情'),
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(
          20,
          12,
          20,
          MediaQuery.paddingOf(context).bottom + 32,
        ),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: context.artC.silver.withOpacity(0.36)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: context.artC.silver.withOpacity(0.22),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Icon(
                        _circleIcon(widget.circle, widget.index),
                        color: kCobalt,
                        size: 28,
                      ),
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
                              fontSize: 22,
                              height: 1.12,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'Noto Serif SC',
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            subtitle,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: context.artC.ink.withOpacity(0.48),
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: tags.map((tag) => _MiniTag(label: tag)).toList(),
                ),
                const SizedBox(height: 16),
                Text(
                  '$memberCount 成员 · 今日 $discussions 条动态',
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.46),
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 16),
                if (_joinStatus == 'joined')
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 44,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: context.artC.silver.withOpacity(0.28),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            '已加入',
                            style: TextStyle(
                              color: context.artC.ink.withOpacity(0.62),
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: GestureDetector(
                          onTap: _openPostComposer,
                          child: Container(
                            height: 44,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: kCobalt,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Text(
                              '发动态',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  )
                else
                  GestureDetector(
                    onTap: _handleAction,
                    child: Container(
                      height: 44,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: action.background,
                        borderRadius: BorderRadius.circular(16),
                        border: action.borderColor == null
                            ? null
                            : Border.all(color: action.borderColor!),
                      ),
                      child: Text(
                        action.label,
                        style: TextStyle(
                          color: action.foreground,
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _CircleAnnouncement(circle: widget.circle, index: widget.index),
          const SizedBox(height: 14),
          _CircleDetailActions(
            onPost: _openPostComposer,
            onAsk: _openAskQuestion,
          ),
          const SizedBox(height: 18),
          _CircleDetailTabs(
            selected: _selectedSection,
            onSelected: (value) => setState(() => _selectedSection = value),
          ),
          const SizedBox(height: 12),
          ..._buildSectionItems(),
        ],
      ),
    );
  }

  List<Widget> _buildSectionItems() {
    final items = switch (_selectedSection) {
      '问答' => _circleQuestionItems(widget.circle, widget.index),
      '活动' => _circleEventItems(widget.circle, widget.index),
      _ => [..._localPosts, ..._circleFeedItems(widget.circle, widget.index)],
    };
    if (items.isEmpty) {
      return [
        _CommunityEmptyState(
          icon: Icons.forum_outlined,
          title: '还没有内容',
          subtitle: '发布第一条动态，或从圈子里发起一个问题。',
          actionLabel: '发动态',
          onRetry: _openPostComposer,
        ),
      ];
    }
    return items
        .map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _CircleFeedItem(item: item),
          ),
        )
        .toList();
  }

  void _handleAction() {
    if (_joinStatus == 'joined') return;
    if (_joinStatus == 'pending') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('申请正在审核中')),
      );
      return;
    }
    final joinType = _circleJoinType(widget.circle, widget.index);
    if (joinType == 'private') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('这个圈子暂时不可加入')),
      );
      return;
    }
    final needsApproval = joinType == 'approval';
    final nextStatus = needsApproval ? 'pending' : 'joined';
    setState(() => _joinStatus = nextStatus);
    widget.onJoinChanged(nextStatus);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(needsApproval
            ? '申请已提交，审核通过后会通知你'
            : '已加入「${widget.circle['title'] ?? '艺术圈子'}」'),
      ),
    );
  }

  Future<void> _openPostComposer() async {
    if (_joinStatus != 'joined') {
      _handleAction();
      return;
    }
    final text = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _PostComposerModal(),
    );
    if (text == null || text.isEmpty || !mounted) return;
    setState(() {
      _selectedSection = '动态';
      _localPosts.insert(
        0,
        (type: '讨论', title: text, meta: '刚刚 · 0 回复'),
      );
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('动态已发布')),
    );
  }

  Future<void> _openAskQuestion() async {
    final title = widget.circle['title']?.toString() ?? '艺术圈子';
    final createdTitle = await Navigator.of(context).push<String?>(
      MaterialPageRoute(
        builder: (_) => AskQuestionScreen(
          initialCategory: _circleQuestionCategory(widget.circle, widget.index),
          initialSchool: _circleRelatedSchool(widget.circle, widget.index),
          sourceCircle: title,
        ),
      ),
    );
    if (createdTitle == null || !mounted) return;
    setState(() => _selectedSection = '问答');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('问题已发布，也会进入问答流')),
    );
  }
}

class _CircleAnnouncement extends StatelessWidget {
  final Map<String, dynamic> circle;
  final int index;

  const _CircleAnnouncement({required this.circle, required this.index});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.campaign_outlined, color: Colors.white, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '圈子公告',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  _circleAnnouncementText(circle, index),
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.58),
                    fontSize: 11,
                    height: 1.45,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CircleDetailActions extends StatelessWidget {
  final VoidCallback onPost;
  final VoidCallback onAsk;

  const _CircleDetailActions({
    required this.onPost,
    required this.onAsk,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _CircleDetailActionButton(
            icon: Icons.edit_square,
            label: '发动态',
            dark: true,
            onTap: onPost,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _CircleDetailActionButton(
            icon: Icons.help_outline,
            label: '提问题',
            dark: false,
            onTap: onAsk,
          ),
        ),
      ],
    );
  }
}

class _CircleDetailActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool dark;
  final VoidCallback onTap;

  const _CircleDetailActionButton({
    required this.icon,
    required this.label,
    required this.dark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          color: dark ? context.artC.ink : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: dark
              ? null
              : Border.all(color: context.artC.silver.withOpacity(0.42)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: dark ? Colors.white : kCobalt),
            const SizedBox(width: 7),
            Text(
              label,
              style: TextStyle(
                color: dark ? Colors.white : context.artC.ink,
                fontSize: 13,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CircleDetailTabs extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onSelected;

  const _CircleDetailTabs({
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    const values = ['动态', '问答', '活动'];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.32),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: values
            .map(
              (value) => Expanded(
                child: GestureDetector(
                  onTap: () => onSelected(value),
                  child: Container(
                    height: 38,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color:
                          selected == value ? Colors.white : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      value,
                      style: TextStyle(
                        color: selected == value
                            ? kCobalt
                            : context.artC.ink.withOpacity(0.42),
                        fontSize: 12,
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

class _CircleFeedItem extends StatelessWidget {
  final ({String type, String title, String meta}) item;

  const _CircleFeedItem({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.artC.silver.withOpacity(0.36)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: context.artC.silver.withOpacity(0.24),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(_feedIcon(item.type), color: kCobalt, size: 19),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '[${item.type}] ${item.title}',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 13,
                    height: 1.25,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.meta,
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.38),
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CircleActionStyle {
  final String label;
  final Color background;
  final Color foreground;
  final Color? borderColor;

  const _CircleActionStyle({
    required this.label,
    required this.background,
    required this.foreground,
    this.borderColor,
  });
}

String _circleJoinType(Map<String, dynamic> circle, int index) {
  final raw = circle['join_type']?.toString();
  if (raw == 'open' || raw == 'approval' || raw == 'private') return raw!;
  final text =
      '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''}'
          .toLowerCase();
  if (text.contains('认证') || text.contains('研究') || index % 3 == 0) {
    return 'approval';
  }
  return 'open';
}

_CircleActionStyle _circleActionStyle(
  BuildContext context,
  Map<String, dynamic> circle,
  int index,
  String status,
) {
  final joinType = _circleJoinType(circle, index);
  if (status == 'joined') {
    return _CircleActionStyle(
      label: '进入',
      background: Colors.white,
      foreground: context.artC.ink,
      borderColor: context.artC.silver.withOpacity(0.55),
    );
  }
  if (status == 'pending') {
    return _CircleActionStyle(
      label: '审核中',
      background: context.artC.silver.withOpacity(0.48),
      foreground: context.artC.ink.withOpacity(0.42),
    );
  }
  if (joinType == 'private') {
    return _CircleActionStyle(
      label: '暂不可加入',
      background: context.artC.silver.withOpacity(0.4),
      foreground: context.artC.ink.withOpacity(0.36),
    );
  }
  if (joinType == 'approval') {
    return _CircleActionStyle(
      label: '申请加入',
      background: context.artC.ink,
      foreground: Colors.white,
    );
  }
  return const _CircleActionStyle(
    label: '加入',
    background: kCobalt,
    foreground: Colors.white,
  );
}

List<String> _circleTags(Map<String, dynamic> circle, int index) {
  final metadata = circle['metadata'];
  if (metadata is Map) {
    final tags = metadata['tags'];
    if (tags is List && tags.isNotEmpty) {
      return tags.map((tag) => tag.toString()).take(3).toList();
    }
    final directions = metadata['directions'];
    if (directions is List && directions.isNotEmpty) {
      return directions.map((item) => '#${item.toString()}').take(3).toList();
    }
  }
  final text =
      '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''}'
          .toLowerCase();
  if (text.contains('ual') ||
      text.contains('rca') ||
      text.contains('留学') ||
      text.contains('申请')) {
    return const ['#UAL', '#RCA', '#申请'];
  }
  if (text.contains('建筑') || text.contains('空间')) {
    return const ['#建筑', '#空间'];
  }
  if (text.contains('媒介') || text.contains('新媒体')) {
    return const ['#媒介艺术', '#作品集'];
  }
  if (text.contains('就业') || text.contains('实习') || text.contains('career')) {
    return const ['#实习', '#职业发展'];
  }
  if (text.contains('市场') || text.contains('收藏') || text.contains('画廊')) {
    return const ['#展览', '#收藏'];
  }
  if (index % 4 == 1) return const ['#作品集', '#诊断'];
  if (index % 4 == 2) return const ['#同城', '#活动'];
  return const ['#作品集', '#留学'];
}

String _circleHotTopic(Map<String, dynamic> circle, int index) {
  final raw = circle['hot_topic']?.toString();
  if (raw != null && raw.trim().isNotEmpty) return raw.trim();
  final metadata = circle['metadata'];
  if (metadata is Map) {
    final metaRaw = metadata['hot_topic']?.toString();
    if (metaRaw != null && metaRaw.trim().isNotEmpty) return metaRaw.trim();
  }
  final text =
      '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''}'
          .toLowerCase();
  if (text.contains('建筑') || text.contains('空间')) return '新中式空间叙事怎么做？';
  if (text.contains('ual') || text.contains('rca') || text.contains('留学')) {
    return 'RCA / UAL 面试作品集怎么讲？';
  }
  if (text.contains('媒介') || text.contains('新媒体')) {
    return '作品集主题如何从材料实验展开？';
  }
  if (text.contains('就业') || text.contains('实习')) return '艺术生第一份实习怎么找？';
  if (text.contains('市场') || text.contains('收藏')) return '年轻艺术家如何进入展览体系？';
  return [
    '作品集主题如何从材料实验展开？',
    '申请季目标院校怎么分层？',
    '项目叙事太散怎么收束？',
  ][index % 3];
}

String _circleAnnouncementText(Map<String, dynamic> circle, int index) {
  final metadata = circle['metadata'];
  if (metadata is Map) {
    final raw = metadata['announcement']?.toString();
    if (raw != null && raw.trim().isNotEmpty) return raw.trim();
  }
  final text =
      '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''}'
          .toLowerCase();
  if (text.contains('ual') || text.contains('rca') || text.contains('留学')) {
    return '本圈用于交流 RCA / UAL 申请、作品集准备、面试经验和材料时间线。';
  }
  if (text.contains('建筑') || text.contains('空间')) {
    return '这里聚合空间叙事、建筑作品集和文旅场景案例，欢迎分享项目过程。';
  }
  return '这里用于交流专业方向、作品集反馈、资源分享和同频创作者机会。';
}

IconData _circleIcon(Map<String, dynamic> circle, int index) {
  final text =
      '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''}'
          .toLowerCase();
  if (_circleJoinType(circle, index) == 'approval') {
    return Icons.verified_user_outlined;
  }
  if (text.contains('伦敦') || text.contains('上海') || text.contains('同城')) {
    return Icons.location_on_outlined;
  }
  if (text.contains('ual') || text.contains('rca') || text.contains('院校')) {
    return Icons.school_outlined;
  }
  if (text.contains('就业') || text.contains('实习')) {
    return Icons.work_outline;
  }
  return Icons.groups_outlined;
}

List<({String type, String title, String meta})> _circleFeedItems(
  Map<String, dynamic> circle,
  int index,
) {
  final hotTopic = _circleHotTopic(circle, index);
  return [
    (
      type: '讨论',
      title: hotTopic,
      meta: '18 分钟前 · 12 个回复',
    ),
    (
      type: '作品集反馈',
      title: '我的第 3 个项目叙事太散，求建议',
      meta: '今天 14:20 · 6 张参考图',
    ),
    (
      type: '资源',
      title: 'UAL 申请材料 checklist',
      meta: '昨天 · 42 人收藏',
    ),
    (
      type: '活动',
      title: '本周六线上作品集诊断',
      meta: '06.08 20:00 · 可预约',
    ),
  ];
}

List<({String type, String title, String meta})> _circleQuestionItems(
  Map<String, dynamic> circle,
  int index,
) {
  final hotTopic = _circleHotTopic(circle, index);
  return [
    (
      type: '问答',
      title: hotTopic,
      meta: '8 回答 · 2 个认证回答',
    ),
    (
      type: '问答',
      title: '这个方向适合申请哪些院校作为主申？',
      meta: '5 回答 · 240 浏览',
    ),
    (
      type: '问答',
      title: '作品集里过程页和最终页比例怎么把握？',
      meta: '12 回答 · 1 个认证回答',
    ),
  ];
}

List<({String type, String title, String meta})> _circleEventItems(
  Map<String, dynamic> circle,
  int index,
) {
  return [
    (
      type: '活动',
      title: '线上作品集诊断小组',
      meta: '06.08 20:00 · 剩余 6 席',
    ),
    (
      type: '活动',
      title: '校友申请经验分享会',
      meta: '06.15 19:30 · 可预约',
    ),
    (
      type: '活动',
      title: '圈子成员作品互评夜',
      meta: '每周三 · 线上',
    ),
  ];
}

String _circleQuestionCategory(Map<String, dynamic> circle, int index) {
  final text =
      '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''}'
          .toLowerCase();
  if (text.contains('市场') || text.contains('收藏') || text.contains('画廊')) {
    return '艺术市场';
  }
  if (text.contains('就业') || text.contains('实习') || text.contains('career')) {
    return '行业就业';
  }
  if (text.contains('作品集') || text.contains('媒介') || text.contains('建筑')) {
    return '作品集';
  }
  return '艺术留学';
}

String? _circleRelatedSchool(Map<String, dynamic> circle, int index) {
  final text =
      '${circle['title'] ?? ''} ${circle['subtitle'] ?? ''} ${circle['category'] ?? ''}'
          .toLowerCase();
  if (text.contains('ual')) return 'UAL';
  if (text.contains('rca') || text.contains('皇艺')) return 'RCA';
  if (text.contains('risd')) return 'RISD';
  return null;
}

IconData _feedIcon(String type) => switch (type) {
      '作品集反馈' => Icons.image_search_outlined,
      '问答' => Icons.help_outline,
      '资源' => Icons.bookmark_border,
      '活动' => Icons.event_available_outlined,
      _ => Icons.forum_outlined,
    };

class _SalonCard extends StatelessWidget {
  final Map<String, dynamic> salon;
  final int index;
  final bool reserved;
  final VoidCallback onOpen;
  final VoidCallback onApply;

  const _SalonCard({
    required this.salon,
    required this.index,
    required this.reserved,
    required this.onOpen,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    final typeLabel = _salonTypeLabel(salon, index);
    final statusLabel = reserved ? '已预约' : _salonStatusLabel(salon, index);
    final seatsLeft = _salonSeatsLeft(salon, index);
    final guest = _salonGuestLine(salon, index);
    final benefit = _salonBenefitLine(salon, index);
    return GestureDetector(
      onTap: onOpen,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: context.artC.silver.withOpacity(0.32)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 2.55,
              child: ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(28)),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    salon['cover_url']?.toString().isNotEmpty == true
                        ? Image.network(
                            salon['cover_url'].toString(),
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              color: context.artC.silver.withOpacity(0.3),
                              child: Icon(
                                Icons.image_outlined,
                                size: 50,
                                color: context.artC.ink.withOpacity(0.2),
                              ),
                            ),
                          )
                        : Container(
                            color: context.artC.silver.withOpacity(0.3),
                            child: Icon(
                              Icons.event_outlined,
                              size: 50,
                              color: context.artC.ink.withOpacity(0.2),
                            ),
                          ),
                    Positioned(
                      top: 14,
                      left: 14,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: context.artC.ink.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          typeLabel,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.6,
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 14,
                      right: 14,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: _salonStatusColor(statusLabel, context),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          statusLabel == '可预约' && seatsLeft <= 6
                              ? '剩余 $seatsLeft 席'
                              : statusLabel,
                          style: TextStyle(
                            color: statusLabel == '已结束' || statusLabel == '回放'
                                ? context.artC.ink
                                : Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    salon['title']?.toString() ?? '未命名沙龙',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 18,
                      height: 1.18,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      color: context.artC.ink,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 7),
                  Text(
                    salon['summary']?.toString().isNotEmpty == true
                        ? salon['summary'].toString()
                        : salon['description']?.toString() ?? '艺术沙龙与线下交流活动。',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      height: 1.42,
                      color: context.artC.ink.withOpacity(0.44),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _InfoLine(icon: Icons.person_outline, text: '嘉宾：$guest'),
                  const SizedBox(height: 7),
                  _InfoLine(
                    icon: Icons.calendar_today_outlined,
                    text: _formatForumDate(salon['start_time']),
                  ),
                  const SizedBox(height: 7),
                  _InfoLine(
                    icon: Icons.location_on_outlined,
                    text: salon['venue']?.toString().isNotEmpty == true
                        ? salon['venue'].toString()
                        : salon['city']?.toString() ?? '地点待定',
                  ),
                  const SizedBox(height: 14),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        _formatSalonFeeWithSeats(salon, index),
                        style: TextStyle(
                          color: context.artC.ink,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          benefit,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: context.artC.ink.withOpacity(0.34),
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: statusLabel == '已结束' || statusLabel == '回放'
                        ? onOpen
                        : reserved
                            ? null
                            : onApply,
                    child: Container(
                      height: 42,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: reserved
                            ? context.artC.silver.withOpacity(0.35)
                            : context.artC.ink,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Text(
                        reserved
                            ? '已预约'
                            : statusLabel == '已结束' || statusLabel == '回放'
                                ? '看回放'
                                : '立即预约 →',
                        style: TextStyle(
                          color: reserved
                              ? context.artC.ink.withOpacity(0.5)
                              : Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
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

class SalonDetailScreen extends StatefulWidget {
  final Map<String, dynamic> salon;
  final int index;
  final bool reserved;
  final Future<bool> Function() onReserve;

  const SalonDetailScreen({
    super.key,
    required this.salon,
    required this.index,
    required this.reserved,
    required this.onReserve,
  });

  @override
  State<SalonDetailScreen> createState() => _SalonDetailScreenState();
}

class _SalonDetailScreenState extends State<SalonDetailScreen> {
  late bool _reserved = widget.reserved;
  bool _submitting = false;

  @override
  Widget build(BuildContext context) {
    final status =
        _reserved ? '已预约' : _salonStatusLabel(widget.salon, widget.index);
    final type = _salonTypeLabel(widget.salon, widget.index);
    final seats = _salonSeatsLeft(widget.salon, widget.index);
    final guest = _salonGuestLine(widget.salon, widget.index);
    final benefit = _salonBenefitLine(widget.salon, widget.index);
    final title = widget.salon['title']?.toString() ?? '未命名沙龙';
    final summary = widget.salon['summary']?.toString().isNotEmpty == true
        ? widget.salon['summary'].toString()
        : widget.salon['description']?.toString() ?? '艺术沙龙与线下交流活动。';

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        foregroundColor: context.artC.ink,
        title: const Text('沙龙详情'),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(20, 10, 20, 16),
        child: FilledButton(
          onPressed:
              _reserved || _submitting || status == '已结束' || status == '回放'
                  ? null
                  : () async {
                      setState(() => _submitting = true);
                      final reserved = await widget.onReserve();
                      if (!mounted) return;
                      setState(() {
                        _reserved = reserved;
                        _submitting = false;
                      });
                    },
          child: Text(_reserved
              ? '已预约'
              : _submitting
                  ? '提交中'
                  : status == '回放'
                      ? '看回放'
                      : '立即预约'),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: AspectRatio(
              aspectRatio: 1.8,
              child: widget.salon['cover_url']?.toString().isNotEmpty == true
                  ? Image.network(widget.salon['cover_url'].toString(),
                      fit: BoxFit.cover)
                  : Container(
                      color: context.artC.silver.withOpacity(0.28),
                      child: Icon(
                        Icons.event_outlined,
                        color: context.artC.ink.withOpacity(0.22),
                        size: 54,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            children: [
              _QuestionBadge(label: type, dark: true),
              _QuestionBadge(
                  label: status == '可预约' ? '剩余 $seats 席' : status, dark: false),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 25,
              height: 1.14,
              fontWeight: FontWeight.w900,
              fontFamily: 'Noto Serif SC',
            ),
          ),
          const SizedBox(height: 10),
          Text(
            summary,
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.52),
              fontSize: 13,
              height: 1.55,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 18),
          _SalonDetailInfoGrid(
            rows: [
              (
                icon: Icons.calendar_today_outlined,
                text: _formatForumDate(widget.salon['start_time'])
              ),
              (
                icon: Icons.location_on_outlined,
                text: widget.salon['venue']?.toString().isNotEmpty == true
                    ? widget.salon['venue'].toString()
                    : widget.salon['city']?.toString() ?? '地点待定'
              ),
              (
                icon: Icons.payments_outlined,
                text: _formatSalonFeeWithSeats(widget.salon, widget.index)
              ),
              (icon: Icons.event_seat_outlined, text: '剩余 $seats 席'),
            ],
          ),
          const SizedBox(height: 20),
          _SalonDetailSection(
            title: '嘉宾介绍',
            body: guest,
          ),
          _SalonDetailSection(
            title: '适合人群',
            bullets: _salonAudience(widget.salon, widget.index),
          ),
          _SalonDetailSection(
            title: '你将获得',
            bullets: [benefit, '校友申请经验与现场 Q&A', '作品集准备和职业路径建议'],
          ),
        ],
      ),
    );
  }
}

class _ReservationSheet extends StatelessWidget {
  final List<MapEntry<int, Map<String, dynamic>>> reserved;

  const _ReservationSheet({required this.reserved});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 22),
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
              '我的预约',
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 22,
                fontWeight: FontWeight.w900,
                fontFamily: 'Noto Serif SC',
              ),
            ),
            const SizedBox(height: 12),
            if (reserved.isEmpty)
              _CommunityEmptyState(
                icon: Icons.event_available_outlined,
                title: '暂无预约',
                subtitle: '预约沙龙后会显示在这里，活动通知也会进入私信。',
                actionLabel: '去看沙龙',
                onRetry: () => Navigator.of(context).pop(),
              )
            else
              ...reserved.map(
                (entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _ReservationRow(salon: entry.value, index: entry.key),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ReservationRow extends StatelessWidget {
  final Map<String, dynamic> salon;
  final int index;

  const _ReservationRow({required this.salon, required this.index});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.artC.silver.withOpacity(0.36)),
      ),
      child: Row(
        children: [
          const Icon(Icons.event_available_outlined, color: kCobalt, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  salon['title']?.toString() ?? '未命名沙龙',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatForumDate(salon['start_time']),
                  style: TextStyle(
                    color: context.artC.ink.withOpacity(0.42),
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          const Text(
            '已预约',
            style: TextStyle(
              color: kCobalt,
              fontSize: 11,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _SalonDetailInfoGrid extends StatelessWidget {
  final List<({IconData icon, String text})> rows;

  const _SalonDetailInfoGrid({required this.rows});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.34)),
      ),
      child: Column(
        children: rows
            .map(
              (row) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 7),
                child: _InfoLine(icon: row.icon, text: row.text),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _SalonDetailSection extends StatelessWidget {
  final String title;
  final String? body;
  final List<String> bullets;

  const _SalonDetailSection({
    required this.title,
    this.body,
    this.bullets = const [],
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          if (body != null)
            Text(
              body!,
              style: TextStyle(
                color: context.artC.ink.withOpacity(0.54),
                fontSize: 12,
                height: 1.55,
                fontWeight: FontWeight.w700,
              ),
            ),
          ...bullets.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 7),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('• ', style: TextStyle(color: kCobalt)),
                  Expanded(
                    child: Text(
                      item,
                      style: TextStyle(
                        color: context.artC.ink.withOpacity(0.54),
                        fontSize: 12,
                        height: 1.45,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatCard extends StatelessWidget {
  final Map<String, dynamic> conversation;
  final int index;

  const _ChatCard({required this.conversation, required this.index});

  @override
  Widget build(BuildContext context) {
    final peer = conversation['peer_profile'];
    final latest = conversation['latest_message'];
    final peerProfile = peer is Map<String, dynamic> ? peer : null;
    final latestMessage = latest is Map<String, dynamic> ? latest : null;
    final title = conversation['title']?.toString().isNotEmpty == true
        ? conversation['title'].toString()
        : peerProfile?['nickname']?.toString().isNotEmpty == true
            ? peerProfile!['nickname'].toString()
            : '合作消息';
    final type = conversation['type']?.toString() ?? 'direct';
    final body = latestMessage?['body']?.toString() ?? '暂无消息内容';
    final time = _formatForumChatTime(
      latestMessage?['created_at'] ?? conversation['updated_at'],
    );
    final unread = conversation['unread_count'] is int
        ? conversation['unread_count'] as int
        : int.tryParse(conversation['unread_count']?.toString() ?? '') ?? 0;
    final avatarUrl = peerProfile?['avatar_url']?.toString();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Row(
        children: [
          Stack(
            children: [
              ClipOval(
                child: avatarUrl != null && avatarUrl.isNotEmpty
                    ? Image.network(
                        avatarUrl,
                        width: 54,
                        height: 54,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            _ChatAvatarFallback(seed: index),
                      )
                    : _ChatAvatarFallback(seed: index),
              ),
              Positioned(
                right: 1,
                bottom: 1,
                child: Container(
                  width: 13,
                  height: 13,
                  decoration: BoxDecoration(
                    color: const Color(0xFF22C55E),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 3),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${_conversationTypeLabel(type)} · $title',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: context.artC.ink,
                          fontSize: 14,
                          fontStyle: FontStyle.italic,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    Text(
                      time,
                      style: TextStyle(
                        color: context.artC.ink.withOpacity(0.24),
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        body,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: context.artC.ink.withOpacity(0.44),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    if (unread > 0)
                      Container(
                        width: 20,
                        height: 20,
                        alignment: Alignment.center,
                        decoration: const BoxDecoration(
                          color: kCobalt,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '$unread',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
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

class _ChatAvatarFallback extends StatelessWidget {
  final int seed;

  const _ChatAvatarFallback({required this.seed});

  @override
  Widget build(BuildContext context) {
    final colors = [
      kCobalt,
      context.artC.ink,
      const Color(0xFF7C3AED),
      const Color(0xFF0F9F7A),
    ];
    final color = colors[seed % colors.length];
    return Container(
      width: 54,
      height: 54,
      alignment: Alignment.center,
      color: color.withOpacity(0.1),
      child: Icon(Icons.person_outline, color: color, size: 24),
    );
  }
}

class _MessageEmptyActions extends StatelessWidget {
  const _MessageEmptyActions();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.32)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ActionTile(
              icon: Icons.groups_outlined,
              title: '去加入圈子',
              subtitle: '产生社群消息',
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _ActionTile(
              icon: Icons.event_available_outlined,
              title: '查看沙龙',
              subtitle: '接收预约通知',
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.28),
        borderRadius: BorderRadius.circular(17),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: kCobalt, size: 18),
          const SizedBox(height: 10),
          Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            subtitle,
            style: TextStyle(
              color: context.artC.ink.withOpacity(0.38),
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _CommunitySectionHeader extends StatelessWidget {
  final String title;
  final String action;

  const _CommunitySectionHeader({required this.title, required this.action});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
              letterSpacing: 1.2,
            ),
          ),
        ),
        Text(
          action,
          style: const TextStyle(
            color: kCobalt,
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.2,
          ),
        ),
        const Icon(Icons.chevron_right, color: kCobalt, size: 14),
      ],
    );
  }
}

class _SmallButton extends StatelessWidget {
  final String label;
  final bool dark;

  const _SmallButton({required this.label, required this.dark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: dark ? context.artC.ink : Colors.transparent,
        borderRadius: BorderRadius.circular(999),
        border:
            Border.all(color: dark ? context.artC.ink : context.artC.silver),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: dark ? Colors.white : context.artC.ink.withOpacity(0.46),
          fontSize: 9,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoLine({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: kCobalt),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: context.artC.ink.withOpacity(0.42),
              letterSpacing: 1,
            ),
          ),
        ),
      ],
    );
  }
}

class _CommunityEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String actionLabel;
  final VoidCallback onRetry;

  const _CommunityEmptyState({
    this.icon = Icons.forum_outlined,
    required this.title,
    required this.subtitle,
    this.actionLabel = '刷新',
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withOpacity(0.32)),
      ),
      child: Column(
        children: [
          Icon(icon, color: kCobalt.withOpacity(0.7), size: 34),
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
              height: 1.5,
            ),
          ),
          const SizedBox(height: 14),
          GestureDetector(
            onTap: onRetry,
            child: _SmallButton(label: actionLabel, dark: true),
          ),
        ],
      ),
    );
  }
}

String _formatForumDate(dynamic raw) {
  final date = DateTime.tryParse(raw?.toString() ?? '');
  if (date == null) return '时间待定';
  return '${date.month.toString().padLeft(2, '0')}.${date.day.toString().padLeft(2, '0')} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
}

String _formatForumChatTime(dynamic raw) {
  final date = DateTime.tryParse(raw?.toString() ?? '');
  if (date == null) return '';
  final now = DateTime.now();
  final diff = now.difference(date);
  if (diff.inMinutes < 1) return '刚刚';
  if (diff.inHours < 1) return '${diff.inMinutes}分钟前';
  if (diff.inDays < 1) return '${diff.inHours}小时前';
  if (diff.inDays < 7) return '${diff.inDays}天前';
  return '${date.month.toString().padLeft(2, '0')}.${date.day.toString().padLeft(2, '0')}';
}

bool _matchesSearch(String text, String keyword) {
  final query = keyword.trim().toLowerCase();
  if (query.isEmpty) return true;
  return text.toLowerCase().contains(query);
}

String _salonTypeLabel(Map<String, dynamic> salon, int index) {
  final metadata = salon['metadata'];
  if (metadata is Map) {
    final salonType = metadata['salon_type']?.toString();
    if (salonType == '留学答疑') return 'ADMISSION Q&A';
    if (salonType == '作品集诊断') return 'PORTFOLIO REVIEW';
    if (salonType == '校友分享') return 'ALUMNI TALK';
    if (salonType == '行业就业') return 'CAREER SALON';
    if (salonType == '艺术市场') return 'ART MARKET';
  }
  final raw =
      '${salon['summary'] ?? ''} ${salon['title'] ?? ''} ${salon['description'] ?? ''}'
          .toLowerCase();
  if (raw.contains('portfolio') || raw.contains('作品集')) {
    return 'PORTFOLIO REVIEW';
  }
  if (raw.contains('校友') || raw.contains('alumni')) return 'ALUMNI TALK';
  if (raw.contains('就业') || raw.contains('career')) return 'CAREER SALON';
  if (raw.contains('市场') || raw.contains('market')) return 'ART MARKET';
  if (raw.contains('申请') || raw.contains('admission')) return 'ADMISSION Q&A';
  const fallback = [
    'ALUMNI TALK',
    'PORTFOLIO REVIEW',
    'ADMISSION Q&A',
    'CAREER SALON',
  ];
  return fallback[index % fallback.length];
}

bool _matchesSalonFilter(Map<String, dynamic> salon, int index, String filter) {
  if (filter == '全部') return true;
  final raw =
      '${salon['summary'] ?? ''} ${salon['title'] ?? ''} ${salon['description'] ?? ''} ${_salonTypeLabel(salon, index)}'
          .toLowerCase();
  return switch (filter) {
    '留学' => ['admission', '申请', '留学', '院校'].any(raw.contains),
    '作品集' => ['portfolio', '作品集', '诊断', '评审'].any(raw.contains),
    '校友' => ['alumni', '校友', 'risd', 'rca', 'ual'].any(raw.contains),
    '就业' => ['career', '就业', '职业', '实习'].any(raw.contains),
    '市场' => ['market', '市场', '画廊', '收藏', '展览'].any(raw.contains),
    _ => true,
  };
}

String _salonFilterTitle(String filter) => switch (filter) {
      '留学' => '留学答疑',
      '作品集' => '作品集诊断',
      '校友' => '校友分享',
      '就业' => '行业就业',
      '市场' => '艺术市场',
      _ => '全部沙龙',
    };

String _salonFilterSubtitle(String filter) => switch (filter) {
      '留学' => '申请、院校和材料准备相关活动',
      '作品集' => '作品集评审、诊断和项目叙事',
      '校友' => '海外艺术院校校友经验分享',
      '就业' => '职业发展、实习和行业路径',
      '市场' => '展览、收藏和艺术市场观察',
      _ => '根据你的申请方向和关注学校推荐',
    };

String _salonStatusLabel(Map<String, dynamic> salon, int index) {
  final start = DateTime.tryParse(salon['start_time']?.toString() ?? '');
  if (start != null) {
    final now = DateTime.now();
    if (start.isBefore(now)) return '回放';
    if (start.difference(now).inHours <= 2) return '即将开始';
  }
  if (index % 5 == 4) return '已结束';
  if (_salonSeatsLeft(salon, index) <= 6) return '名额紧张';
  return '可预约';
}

Color _salonStatusColor(String status, BuildContext context) {
  if (status == '已预约') return const Color(0xFF16A34A);
  if (status == '名额紧张') return const Color(0xFFEA580C);
  if (status == '已结束' || status == '回放') return Colors.white.withOpacity(0.82);
  return kCobalt;
}

int _salonSeatsLeft(Map<String, dynamic> salon, int index) {
  final raw = int.tryParse(salon['seats_left']?.toString() ?? '');
  if (raw != null) return raw;
  final metadata = salon['metadata'];
  if (metadata is Map) {
    final metaRaw = int.tryParse(metadata['seats_left']?.toString() ?? '');
    if (metaRaw != null) return metaRaw;
  }
  final quota = int.tryParse(salon['quota']?.toString() ?? '');
  if (quota != null) return quota;
  return 6 + (index % 5) * 2;
}

String _salonGuestLine(Map<String, dynamic> salon, int index) {
  final raw = salon['guest']?.toString();
  if (raw != null && raw.trim().isNotEmpty) return raw.trim();
  final metadata = salon['metadata'];
  if (metadata is Map) {
    final metaRaw = metadata['guest']?.toString();
    if (metaRaw != null && metaRaw.trim().isNotEmpty) return metaRaw.trim();
  }
  final type = _salonTypeLabel(salon, index);
  if (type == 'PORTFOLIO REVIEW') return 'RCA 校友 / 作品集导师';
  if (type == 'CAREER SALON') return '艺术行业从业者 · 创意招聘顾问';
  if (type == 'ART MARKET') return '画廊策展人 · 艺术市场顾问';
  if (type == 'ADMISSION Q&A') return '艺术留学顾问 · 申请规划师';
  return 'RISD 工业设计校友 · Google UX Designer';
}

String _salonBenefitLine(Map<String, dynamic> salon, int index) {
  final metadata = salon['metadata'];
  if (metadata is Map) {
    final raw = metadata['benefit']?.toString();
    if (raw != null && raw.trim().isNotEmpty) return raw.trim();
  }
  final type = _salonTypeLabel(salon, index);
  if (_formatForumFee(salon['fee_amount']) == '免费') return '线上分享 · 可回放';
  if (type == 'PORTFOLIO REVIEW') return '含作品集点评 · 现场 Q&A';
  if (type == 'ALUMNI TALK') return '含校友交流 · 申请经验';
  return '含主题分享 · 现场交流';
}

List<String> _salonAudience(Map<String, dynamic> salon, int index) {
  final type = _salonTypeLabel(salon, index);
  if (type == 'PORTFOLIO REVIEW') {
    return const [
      '正在准备作品集项目的学生',
      '需要梳理项目叙事和视觉排版的人',
      '准备申请 RCA / UAL / RISD 的申请者',
    ];
  }
  if (type == 'CAREER SALON') {
    return const ['想了解艺术行业职业路径的人', '正在找实习或第一份工作的学生'];
  }
  return const ['准备艺术留学申请的学生', '想了解海外院校学习体验的人', '希望和校友交流的人'];
}

String _conversationTypeLabel(String type) {
  switch (type) {
    case 'opportunity':
      return '合作';
    case 'circle':
      return '圈子';
    case 'salon':
      return '沙龙';
    case 'system':
      return '系统';
    default:
      return '私信';
  }
}

String _formatForumFee(dynamic raw) {
  final value = raw is int ? raw : int.tryParse(raw?.toString() ?? '');
  if (value == null || value <= 0) return '免费/邀请制';
  return '¥$value';
}

String _formatSalonFeeWithSeats(Map<String, dynamic> salon, int index) {
  final metadata = salon['metadata'];
  String? feeMode;
  if (metadata is Map) {
    feeMode = metadata['fee_mode']?.toString();
  }
  final quota = salon['quota'];
  final quotaNum = quota is int ? quota : int.tryParse(quota?.toString() ?? '');
  final seatsText = quotaNum != null && quotaNum > 0 ? '$quotaNum 人小班' : '小班';
  
  if (feeMode == 'free') {
    return '免费 / 预约制';
  } else if (feeMode == 'invite') {
    return '邀请制 / $seatsText';
  } else if (feeMode == 'paid') {
    final fee = _formatForumFee(salon['fee_amount']);
    return '$fee / $seatsText';
  }
  
  final fee = _formatForumFee(salon['fee_amount']);
  if (fee == '免费/邀请制') {
    return '免费 / 预约制';
  }
  return '$fee / $seatsText';
}

class _PostComposerModal extends StatefulWidget {
  const _PostComposerModal();

  @override
  State<_PostComposerModal> createState() => _PostComposerModalState();
}

class _PostComposerModalState extends State<_PostComposerModal> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 16,
      ),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '发动态',
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _controller,
              autofocus: true,
              minLines: 3,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: '分享资源、讨论、作品集进展或活动信息...',
                filled: true,
                fillColor: context.artC.silver.withOpacity(0.22),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(18),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  final value = _controller.text.trim();
                  if (value.isNotEmpty) Navigator.of(context).pop(value);
                },
                child: const Text('发布动态'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

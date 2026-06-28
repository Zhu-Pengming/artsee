import 'dart:async';

import 'package:flutter/material.dart';

import '../../models/models.dart';
import '../../services/backend_api_service.dart';
import '../../services/supabase_service.dart';
import '../../services/tencent_im_service.dart';
import '../../utils/auth_gate.dart';
import '../../widgets/artsee_ui.dart';
import '../../widgets/common.dart';
import 'ask_question_screen.dart';
import '../community/community_post_detail_screen.dart';
import '../messages/light_message_screen.dart';
import '../profile/public_user_profile_screen.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class ForumScreen extends StatefulWidget {
  final VoidCallback? onTabChanged;
  final VoidCallback? onCreateCircle;

  const ForumScreen({super.key, this.onTabChanged, this.onCreateCircle});

  @override
  State<ForumScreen> createState() => ForumScreenState();
}

class ForumScreenState extends State<ForumScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final GlobalKey<_QaCommunityTabState> _qaKey =
      GlobalKey<_QaCommunityTabState>();
  final GlobalKey<_CircleTabState> _circleKey = GlobalKey<_CircleTabState>();
  final GlobalKey<_SalonTabState> _salonKey = GlobalKey<_SalonTabState>();
  final GlobalKey<_ChatTabState> _chatKey = GlobalKey<_ChatTabState>();
  final List<String> _searchKeywords = List.filled(4, '');

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

  String get searchKeyword => _searchKeywords[_tabController.index];

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
        3 => Icons.refresh_rounded,
        _ => Icons.add_rounded,
      };

  void applySearch(String keyword) {
    setState(() => _searchKeywords[_tabController.index] = keyword.trim());
  }

  Future<void> openQuestionComposer({
    String? initialTitle,
    String? initialCategory,
  }) async {
    if (!await ensureLoggedIn(context, message: '请先登录后发布问题')) return;
    final createdTitle = await Navigator.of(context).push<String?>(
      MaterialPageRoute(
        builder: (_) => AskQuestionScreen(
          initialTitle: initialTitle,
          initialCategory: initialCategory,
          searchKeyword: searchKeyword,
        ),
      ),
    );
    if (!mounted || createdTitle == null) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _qaKey.currentState?._load();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('问题已发布，我们会推荐给相关方向用户'),
        ),
      );
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
      case 3:
        _chatKey.currentState?._load();
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
                    searchKeyword: _searchKeywords[0],
                    onAsk: openQuestionComposer,
                  ),
                  _CircleTab(
                    key: _circleKey,
                    bottom: bottom,
                    searchKeyword: _searchKeywords[1],
                    onCreateCircle: widget.onCreateCircle,
                  ),
                  _SalonTab(
                    key: _salonKey,
                    bottom: bottom,
                    searchKeyword: _searchKeywords[2],
                  ),
                  _ChatTab(
                    key: _chatKey,
                    bottom: bottom,
                    searchKeyword: _searchKeywords[3],
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
  final Future<void> Function({
    String? initialTitle,
    String? initialCategory,
  }) onAsk;

  const _QaCommunityTab({
    super.key,
    required this.bottom,
    required this.searchKeyword,
    required this.onAsk,
  });

  @override
  State<_QaCommunityTab> createState() => _QaCommunityTabState();
}

class _QaCommunityTabState extends State<_QaCommunityTab> {
  List<AppCommunityHotTopic> _hotTopics = const [];
  List<AppCommunityPost> _posts = const [];
  bool _hotTopicsLoading = true;
  bool _postsLoading = true;
  String? _hotTopicsError;
  String? _postsError;
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
    await Future.wait([
      _loadHotTopics(),
      _loadPosts(),
    ]);
  }

  Future<void> _loadHotTopics() async {
    setState(() {
      _hotTopicsLoading = true;
      _hotTopicsError = null;
    });
    try {
      final hotTopics = await BackendApiService.fetchCommunityHotTopics(
        limit: 30,
      );
      if (!mounted) return;
      setState(() {
        _hotTopics = hotTopics;
        _hotTopicsLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _hotTopics = const [];
        _hotTopicsError = e.toString();
        _hotTopicsLoading = false;
      });
    }
  }

  Future<void> _loadPosts() async {
    setState(() {
      _postsLoading = true;
      _postsError = null;
    });
    try {
      final posts = await BackendApiService.fetchCommunityPosts(
        limit: 30,
        kind: 'qa',
      );
      if (!mounted) return;
      setState(() {
        _posts = posts;
        _postsLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _posts = const [];
        _postsError = e.toString();
        _postsLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final filteredByBlock = _selectedBlock == null
        ? _hotTopics
        : _hotTopics
            .where((topic) => topic.category == _selectedBlock)
            .toList();
    final visibleHotTopics = widget.searchKeyword.isEmpty
        ? filteredByBlock
        : filteredByBlock
            .where((topic) => _matchesSearch(
                  [
                    topic.title,
                    topic.category,
                    topic.tag,
                    topic.metadata['theme']?.toString() ?? '',
                    ...topic.answers.map(
                      (answer) => '${answer.stance} ${answer.content}',
                    ),
                  ].join(' '),
                  widget.searchKeyword,
                ))
            .toList();
    final filteredPostsByBlock = _selectedBlock == null
        ? _posts
        : _posts
            .where((post) => _postCategory(post) == _selectedBlock)
            .toList();
    final visiblePosts = widget.searchKeyword.isEmpty
        ? filteredPostsByBlock
        : filteredPostsByBlock
            .where((post) => _matchesSearch(
                  [
                    post.title,
                    post.body ?? '',
                    _postCategory(post),
                    post.metadata['school']?.toString() ?? '',
                    post.metadata['program']?.toString() ?? '',
                    post.metadata['source_circle']?.toString() ?? '',
                  ].join(' '),
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
        const _CommunitySectionHeader(title: '问题方向', action: 'FILTER'),
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
        _HotTopicStrip(
          topics: visibleHotTopics,
          loading: _hotTopicsLoading,
          error: _hotTopicsError,
          onRetry: _load,
          onTopicOpen: _openHotTopicDiscussion,
          onTopicAsk: _openHotTopicAsk,
        ),
        const SizedBox(height: 18),
        _QuestionPostStrip(
          posts: visiblePosts,
          loading: _postsLoading,
          error: _postsError,
          onRetry: _loadPosts,
          onOpen: _openQuestionPost,
        ),
      ],
    );
  }

  String _postCategory(AppCommunityPost post) =>
      post.metadata['category']?.toString() ?? '艺术留学';

  void _openQuestionPost(AppCommunityPost post) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CommunityPostDetailScreen(
          postId: post.id,
          initialPost: post,
        ),
      ),
    );
  }

  void _openHotTopicDiscussion(AppCommunityHotTopic topic) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => _HotTopicDiscussionScreen(
          topic: topic,
          onAsk: () => _openHotTopicAsk(topic),
        ),
      ),
    );
  }

  Future<void> _openHotTopicAsk(AppCommunityHotTopic topic) {
    return widget.onAsk(
      initialTitle: topic.title,
      initialCategory: topic.category,
    );
  }
}

class _CircleTab extends StatefulWidget {
  final double bottom;
  final String searchKeyword;
  final VoidCallback? onCreateCircle;

  const _CircleTab({
    super.key,
    required this.bottom,
    required this.searchKeyword,
    this.onCreateCircle,
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
                final onCreateCircle = widget.onCreateCircle;
                if (onCreateCircle != null) {
                  onCreateCircle();
                } else {
                  _load();
                }
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

  Future<void> _handleCircleAction(
      Map<String, dynamic> circle, int index) async {
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
    if (!await ensureLoggedIn(context, message: '请先登录后加入圈子')) return;
    try {
      final updated = await BackendApiService.joinCommunityCircle(id);
      if (!mounted) return;
      final nextStatus = updated['join_status']?.toString() ??
          (joinType == 'approval' ? 'pending' : 'joined');
      setState(() {
        _joinStatusOverrides[id] = nextStatus;
        if (index >= 0 && index < _items.length) {
          _items[index] = {..._items[index], ...updated};
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(nextStatus == 'pending'
              ? '申请已提交，审核通过后会通知你'
              : '已加入「${circle['title'] ?? '艺术圈子'}」'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('加入失败：$e')),
      );
    }
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
    super.key,
    required this.bottom,
    required this.searchKeyword,
  });

  @override
  State<_ChatTab> createState() => _ChatTabState();
}

class _ChatTabState extends State<_ChatTab> {
  List<Map<String, dynamic>> _items = const [];
  List<Map<String, dynamic>> _friends = const [];
  bool _loading = true;
  bool _imConnecting = false;
  bool _imReady = false;
  String? _error;
  String? _imStatusText;
  String _selectedFilter = '全部';
  String? _openingFriendId;

  @override
  void initState() {
    super.initState();
    _load();
    unawaited(_warmTencentIm());
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.fetchConversations(limit: 30);
      var friends = const <Map<String, dynamic>>[];
      try {
        friends = await BackendApiService.fetchFriends(limit: 30);
      } catch (e) {
        debugPrint('Friend shortcuts not loaded: $e');
      }
      if (!mounted) return;
      setState(() {
        _items = result.data;
        _friends = friends;
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

  Future<void> _refreshAll() async {
    unawaited(_warmTencentIm());
    await _load();
  }

  Future<void> _warmTencentIm() async {
    if (_imConnecting) return;
    if (!SupabaseService.isLoggedIn) {
      if (!mounted) return;
      setState(() {
        _imReady = false;
        _imStatusText = '登录后启用腾讯云即时通讯';
      });
      return;
    }

    setState(() {
      _imConnecting = true;
      _imStatusText = '正在连接腾讯云 IM...';
    });
    try {
      final state = await TencentImService.ensureLoggedIn();
      if (!mounted) return;
      setState(() {
        _imConnecting = false;
        _imReady = true;
        _imStatusText =
            state == null ? '腾讯云 IM 已连接' : '腾讯云 IM 已连接：${state.identifier}';
      });
    } catch (e) {
      if (!mounted) return;
      if (e is UnsupportedError && e.message?.contains('Web') == true) {
        setState(() {
          _imConnecting = false;
          _imReady = false;
          _imStatusText = '即时通讯功能仅在移动端可用';
        });
        return;
      }
      setState(() {
        _imConnecting = false;
        _imReady = false;
        _imStatusText =
            '腾讯云 IM 未连接：${e.toString().replaceFirst('Exception: ', '')}';
      });
    }
  }

  bool _matchesConversationFilter(Map<String, dynamic> conversation) {
    if (_selectedFilter == '全部') return true;
    final isOrg = _conversationIsOrganization(conversation);
    return _selectedFilter == '机构' ? isOrg : !isOrg;
  }

  bool _matchesFriendSearch(Map<String, dynamic> friend) {
    if (widget.searchKeyword.isEmpty) return true;
    return _matchesSearch(
      '${_friendName(friend)} ${_friendRoleLabel(friend)} ${friend['friend_id'] ?? ''}',
      widget.searchKeyword,
    );
  }

  Future<void> _openConversation(Map<String, dynamic> conversation) async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => LightMessageScreen(conversation: conversation),
      ),
    );
    if (mounted) unawaited(_refreshAll());
  }

  Future<void> _openFriend(Map<String, dynamic> friend) async {
    final loggedIn = await ensureLoggedIn(context, message: '请先登录后打开私信');
    if (!mounted || !loggedIn) return;
    final friendId = friend['friend_id']?.toString();
    if (friendId == null || friendId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('好友资料还没有完成同步')),
      );
      return;
    }
    if (_openingFriendId != null) return;
    setState(() => _openingFriendId = friendId);
    try {
      final conversation = await BackendApiService.createConversation(
        participantIds: [friendId],
        type: 'direct',
        metadata: {
          'source': 'message_friend_shortcut',
          'target_user_id': friendId,
        },
      );
      if (!mounted) return;
      setState(() => _openingFriendId = null);
      await Navigator.of(context).push<void>(
        MaterialPageRoute<void>(
          builder: (_) => LightMessageScreen(conversation: conversation),
        ),
      );
      if (mounted) unawaited(_refreshAll());
    } catch (e) {
      if (!mounted) return;
      setState(() => _openingFriendId = null);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('打开私信失败：$e')),
      );
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
    final searchItems = widget.searchKeyword.isEmpty
        ? _items
        : _items
            .where((conversation) => _matchesSearch(
                  _conversationSearchText(conversation),
                  widget.searchKeyword,
                ))
            .toList();
    final visibleItems = searchItems.where(_matchesConversationFilter).toList();
    final visibleFriends = _friends.where(_matchesFriendSearch).toList();
    final isFiltered = _selectedFilter != '全部';

    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom + 32),
      children: [
        _PillFilterRow(
          values: const ['全部', '个人', '机构'],
          selected: _selectedFilter,
          onSelected: (value) => setState(() => _selectedFilter = value),
        ),
        const SizedBox(height: 16),
        _TencentImStatusStrip(
          connecting: _imConnecting,
          ready: _imReady,
          text: _imStatusText ?? '腾讯云 IM 待连接',
          onRetry: _warmTencentIm,
        ),
        if (visibleFriends.isNotEmpty) ...[
          const SizedBox(height: 12),
          _FriendShortcutPanel(
            friends: visibleFriends.take(12).toList(),
            openingFriendId: _openingFriendId,
            onOpenFriend: _openFriend,
          ),
        ],
        const SizedBox(height: 14),
        if (visibleItems.isEmpty)
          Column(
            children: [
              _MessageEmptyActions(
                hasFriends: visibleFriends.isNotEmpty,
                onRefresh: _refreshAll,
              ),
              const SizedBox(height: 12),
              _CommunityEmptyState(
                icon: Icons.mark_chat_unread_outlined,
                title: widget.searchKeyword.isNotEmpty
                    ? '没有匹配的消息'
                    : isFiltered
                        ? '暂无$_selectedFilter消息'
                        : '暂无私信',
                subtitle: widget.searchKeyword.isNotEmpty
                    ? '换个联系人、合作或通知关键词试试。'
                    : isFiltered
                        ? '切回全部，或等待新的$_selectedFilter消息。'
                        : visibleFriends.isNotEmpty
                            ? '选择上方好友即可开始腾讯云 IM 单聊。'
                            : '先从公开主页添加好友，或等待合作邀约后在这里沟通。',
                actionLabel: widget.searchKeyword.isEmpty && isFiltered
                    ? '查看全部'
                    : '刷新消息',
                onRetry: widget.searchKeyword.isEmpty && isFiltered
                    ? () => setState(() => _selectedFilter = '全部')
                    : _refreshAll,
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
                    onTap: () => _openConversation(entry.value),
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
    return ArtseeSegmentedTabs(
      controller: controller,
      tabs: tabs
          .map((tab) => ArtseeSegmentTab(label: tab.label, icon: tab.icon))
          .toList(),
      labelFontSize: 11,
      iconSize: 12.5,
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
            color: context.artC.ink.withValues(alpha: 0.08),
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
              color: Colors.white.withValues(alpha: 0.1),
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
                    color: Colors.white.withValues(alpha: 0.52),
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
                          ? block.color.withValues(alpha: 0.14)
                          : context.artC.cardIconBg,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: selectedBlock == block.title
                            ? block.text.withValues(alpha: 0.3)
                            : context.artC.silver.withValues(alpha: 0.44),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.tag,
                          size: 12,
                          color: selectedBlock == block.title
                              ? block.text
                              : block.text,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          block.title,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                            color: selectedBlock == block.title
                                ? block.text
                                : context.artC.ink.withValues(alpha: 0.64),
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

class _HotTopicStrip extends StatelessWidget {
  final List<AppCommunityHotTopic> topics;
  final bool loading;
  final String? error;
  final VoidCallback onRetry;
  final ValueChanged<AppCommunityHotTopic> onTopicOpen;
  final ValueChanged<AppCommunityHotTopic> onTopicAsk;

  const _HotTopicStrip({
    required this.topics,
    required this.loading,
    required this.error,
    required this.onRetry,
    required this.onTopicOpen,
    required this.onTopicAsk,
  });

  @override
  Widget build(BuildContext context) {
    Widget body;
    if (loading) {
      body = const Column(
        children: [
          _HotTopicSkeletonCard(),
          SizedBox(height: 12),
          _HotTopicSkeletonCard(),
        ],
      );
    } else if (error != null) {
      body = _CommunityEmptyState(
        icon: Icons.local_fire_department_outlined,
        title: '热议加载失败',
        subtitle: error!,
        onRetry: onRetry,
      );
    } else if (topics.isEmpty) {
      body = _CommunityEmptyState(
        icon: Icons.forum_outlined,
        title: '暂无匹配热议',
        subtitle: '换个方向或搜索词试试，也可以从顶部提问卡发起新的讨论。',
        actionLabel: '刷新热议',
        onRetry: onRetry,
      );
    } else {
      body = Column(
        children: topics
            .map(
              (topic) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _HotTopicCard(
                  topic: topic,
                  onOpen: () => onTopicOpen(topic),
                  onAsk: () => onTopicAsk(topic),
                ),
              ),
            )
            .toList(),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _CommunitySectionHeader(title: '本周热议'),
        const SizedBox(height: 10),
        body,
      ],
    );
  }
}

class _QuestionPostStrip extends StatelessWidget {
  final List<AppCommunityPost> posts;
  final bool loading;
  final String? error;
  final VoidCallback onRetry;
  final ValueChanged<AppCommunityPost> onOpen;

  const _QuestionPostStrip({
    required this.posts,
    required this.loading,
    required this.error,
    required this.onRetry,
    required this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    Widget body;
    if (loading) {
      body = const Column(
        children: [
          _HotTopicSkeletonCard(),
          SizedBox(height: 12),
          _HotTopicSkeletonCard(),
        ],
      );
    } else if (error != null) {
      body = _CommunityEmptyState(
        icon: Icons.help_outline,
        title: '问答加载失败',
        subtitle: error!,
        onRetry: onRetry,
      );
    } else if (posts.isEmpty) {
      body = _CommunityEmptyState(
        icon: Icons.help_outline,
        title: '暂无匹配问题',
        subtitle: '换个方向或搜索词试试，也可以直接发起一个新问题。',
        actionLabel: '刷新问答',
        onRetry: onRetry,
      );
    } else {
      body = Column(
        children: posts
            .map(
              (post) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _QuestionPostCard(
                  post: post,
                  onTap: () => onOpen(post),
                ),
              ),
            )
            .toList(),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _CommunitySectionHeader(title: '最新问答', action: 'LIVE'),
        const SizedBox(height: 10),
        body,
      ],
    );
  }
}

class _QuestionPostCard extends StatelessWidget {
  final AppCommunityPost post;
  final VoidCallback onTap;

  const _QuestionPostCard({
    required this.post,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final category = post.metadata['category']?.toString() ?? '艺术留学';
    final school = post.metadata['school']?.toString();
    final sourceCircle = post.metadata['source_circle']?.toString();
    final body = post.body?.trim();
    final author = post.authorNickname?.trim().isNotEmpty == true
        ? post.authorNickname!.trim()
        : '匿名用户';
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(18),
          border:
              Border.all(color: context.artC.silver.withValues(alpha: 0.38)),
          boxShadow: [
            BoxShadow(
              color: context.artC.ink.withValues(alpha: 0.026),
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
                _QuestionBadge(label: category, dark: true),
                if (school != null && school.isNotEmpty) ...[
                  const SizedBox(width: 6),
                  _QuestionBadge(label: school, dark: false),
                ] else if (sourceCircle != null && sourceCircle.isNotEmpty) ...[
                  const SizedBox(width: 6),
                  _QuestionBadge(label: sourceCircle, dark: false),
                ],
                const Spacer(),
                Text(
                  timeAgo(post.createdAt),
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.34),
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              post.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 16,
                height: 1.24,
                fontWeight: FontWeight.w900,
                fontFamily: 'Noto Serif SC',
              ),
            ),
            if (body != null && body.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                body,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.52),
                  fontSize: 11,
                  height: 1.45,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  Icons.account_circle_outlined,
                  size: 14,
                  color: context.artC.ink.withValues(alpha: 0.34),
                ),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    author,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: context.artC.ink.withValues(alpha: 0.38),
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                Text(
                  '${post.commentCount} 回复 · ${post.likeCount} 赞',
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.38),
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
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

class _HotTopicCard extends StatelessWidget {
  final AppCommunityHotTopic topic;
  final VoidCallback onOpen;
  final VoidCallback onAsk;

  const _HotTopicCard({
    required this.topic,
    required this.onOpen,
    required this.onAsk,
  });

  @override
  Widget build(BuildContext context) {
    final answers = topic.answers.take(2).toList();
    final theme = topic.metadata['theme']?.toString();
    return GestureDetector(
      onTap: onOpen,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(18),
          border:
              Border.all(color: context.artC.silver.withValues(alpha: 0.38)),
          boxShadow: [
            BoxShadow(
              color: context.artC.ink.withValues(alpha: 0.03),
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
                _QuestionBadge(label: topic.tag, dark: true),
                const SizedBox(width: 6),
                _QuestionBadge(
                  label: theme?.isNotEmpty == true ? theme! : topic.category,
                  dark: false,
                ),
                const Spacer(),
                Text(
                  '已有 ${topic.participantCount} 人',
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.36),
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              topic.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 16,
                height: 1.25,
                fontWeight: FontWeight.w900,
                fontFamily: 'Noto Serif SC',
              ),
            ),
            const SizedBox(height: 12),
            ...answers.map(
              (answer) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 5),
                      width: 5,
                      height: 5,
                      decoration: const BoxDecoration(
                        color: kCobalt,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 7),
                    Expanded(
                      child: Text.rich(
                        TextSpan(
                          children: [
                            TextSpan(
                              text: '${answer.stance} · ',
                              style: const TextStyle(
                                color: kCobalt,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            TextSpan(text: answer.content),
                          ],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: context.artC.ink.withValues(alpha: 0.56),
                          fontSize: 10,
                          height: 1.35,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Spacer(),
                GestureDetector(
                  onTap: onAsk,
                  behavior: HitTestBehavior.opaque,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: context.artC.ink,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '发起讨论',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(
                          Icons.arrow_forward_rounded,
                          color: Colors.white,
                          size: 13,
                        ),
                      ],
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

class _HotTopicDiscussionScreen extends StatelessWidget {
  final AppCommunityHotTopic topic;
  final Future<void> Function() onAsk;

  const _HotTopicDiscussionScreen({
    required this.topic,
    required this.onAsk,
  });

  @override
  Widget build(BuildContext context) {
    final theme = topic.metadata['theme']?.toString();
    final themeLabel = theme?.isNotEmpty == true ? theme! : topic.category;
    final bottom = MediaQuery.paddingOf(context).bottom;
    final answers = topic.answers;
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
          '热议讨论',
          style: TextStyle(
            color: context.artC.ink,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(20, 10, 20, 16),
        child: FilledButton.icon(
          onPressed: () {
            onAsk();
          },
          icon: const Icon(Icons.edit_square, size: 18),
          label: const Text('发起讨论'),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(20, 12, 20, bottom + 24),
        children: [
          _HotTopicDiscussionHero(
            topic: topic,
            themeLabel: themeLabel,
          ),
          const SizedBox(height: 14),
          _HotTopicDiscussionStats(topic: topic),
          const SizedBox(height: 20),
          const _CommunitySectionHeader(title: '真实用户观点'),
          const SizedBox(height: 10),
          if (answers.isEmpty)
            _CommunityEmptyState(
              icon: Icons.forum_outlined,
              title: '暂无观点内容',
              subtitle: '这个话题还在整理中，可以先发起一个具体问题。',
              actionLabel: '发起讨论',
              onRetry: () {
                onAsk();
              },
            )
          else ...[
            ...answers.asMap().entries.map(
                  (entry) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _HotTopicAnswerCard(
                      topicId: topic.id,
                      index: entry.key,
                      answer: entry.value,
                    ),
                  ),
                ),
          ],
          const SizedBox(height: 8),
          _HotTopicDiscussNowCard(
            topic: topic,
            onAsk: onAsk,
          ),
        ],
      ),
    );
  }
}

class _HotTopicDiscussionHero extends StatelessWidget {
  final AppCommunityHotTopic topic;
  final String themeLabel;

  const _HotTopicDiscussionHero({
    required this.topic,
    required this.themeLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: context.artC.ink.withValues(alpha: 0.08),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              _HotTopicHeroBadge(label: topic.tag, strong: true),
              _HotTopicHeroBadge(label: themeLabel),
              if (topic.isPinned) const _HotTopicHeroBadge(label: '置顶'),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            topic.title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              height: 1.16,
              fontWeight: FontWeight.w900,
              fontFamily: 'Noto Serif SC',
            ),
          ),
          const SizedBox(height: 14),
          Text(
            '${topic.category} · 已有 ${topic.participantCount} 人参与 · ${topic.answers.length} 个观点',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.56),
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _HotTopicHeroBadge extends StatelessWidget {
  final String label;
  final bool strong;

  const _HotTopicHeroBadge({
    required this.label,
    this.strong = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: strong ? kCobalt : Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: Colors.white.withValues(alpha: strong ? 1 : 0.76),
          fontSize: 9,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _HotTopicDiscussionStats extends StatelessWidget {
  final AppCommunityHotTopic topic;

  const _HotTopicDiscussionStats({required this.topic});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _HotTopicStatTile(
            label: '参与',
            value: '${topic.participantCount}',
            icon: Icons.people_outline,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _HotTopicStatTile(
            label: '观点',
            value: '${topic.answers.length}',
            icon: Icons.forum_outlined,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _HotTopicStatTile(
            label: '方向',
            value: topic.category,
            icon: Icons.tag_outlined,
          ),
        ),
      ],
    );
  }
}

class _HotTopicStatTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _HotTopicStatTile({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 74),
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
          Icon(icon, color: kCobalt, size: 16),
          const SizedBox(height: 7),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 14,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.38),
              fontSize: 9,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _HotTopicAnswerCard extends StatefulWidget {
  final String topicId;
  final int index;
  final AppCommunityHotTopicAnswer answer;

  const _HotTopicAnswerCard({
    required this.topicId,
    required this.index,
    required this.answer,
  });

  @override
  State<_HotTopicAnswerCard> createState() => _HotTopicAnswerCardState();
}

class _HotTopicAnswerCardState extends State<_HotTopicAnswerCard> {
  late int _likeCount;
  late int _commentCount;
  late int _shareCount;
  bool _liked = false;
  bool _showCommentBox = false;
  bool _commentsLoaded = false;
  bool _commentsLoading = false;
  bool _submittingComment = false;
  List<Map<String, dynamic>> _comments = const [];
  final TextEditingController _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _likeCount = widget.answer.likeCount > 0
        ? widget.answer.likeCount
        : 48 + widget.index * 19;
    _commentCount = widget.answer.commentCount > 0
        ? widget.answer.commentCount
        : 6 + widget.index * 3;
    _shareCount = widget.answer.shareCount > 0
        ? widget.answer.shareCount
        : 2 + widget.index;
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _toggleLike() async {
    if (!await ensureLoggedIn(context, message: '请先登录后赞同观点')) return;
    final previousLiked = _liked;
    final previousCount = _likeCount;
    final nextLiked = !previousLiked;
    setState(() {
      _liked = nextLiked;
      _likeCount += nextLiked ? 1 : -1;
    });

    try {
      final result = nextLiked
          ? await BackendApiService.likeHotTopicAnswer(
              topicId: widget.topicId,
              answerIndex: widget.index,
            )
          : await BackendApiService.unlikeHotTopicAnswer(
              topicId: widget.topicId,
              answerIndex: widget.index,
            );
      if (!mounted) return;
      setState(() {
        _liked = result.liked;
        if (widget.answer.likeCount > 0 || result.likeCount > previousCount) {
          _likeCount = result.likeCount;
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _liked = previousLiked;
        _likeCount = previousCount;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('赞同失败：$e')),
      );
    }
  }

  Future<void> _toggleCommentBox() async {
    setState(() => _showCommentBox = !_showCommentBox);
    if (_showCommentBox) {
      await _loadComments();
    }
  }

  Future<void> _loadComments() async {
    if (_commentsLoaded || _commentsLoading) return;
    setState(() => _commentsLoading = true);
    try {
      final comments = await BackendApiService.fetchHotTopicAnswerComments(
        topicId: widget.topicId,
        answerIndex: widget.index,
        limit: 20,
      );
      if (!mounted) return;
      setState(() {
        _comments = comments;
        _commentsLoaded = true;
        _commentsLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _commentsLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('评论加载失败：$e')),
      );
    }
  }

  Future<void> _submitComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty || _submittingComment) return;
    if (!await ensureLoggedIn(context, message: '请先登录后评论观点')) return;

    setState(() => _submittingComment = true);
    try {
      final comment = await BackendApiService.createHotTopicAnswerComment(
        topicId: widget.topicId,
        answerIndex: widget.index,
        body: text,
      );
      final nextCount = comment['comment_count'] is int
          ? comment['comment_count'] as int
          : _commentCount + 1;
      if (!mounted) return;
      setState(() {
        _commentCount = nextCount;
        _comments = [..._comments, comment];
        _commentsLoaded = true;
        _submittingComment = false;
        _commentController.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('评论已发布')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _submittingComment = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('评论失败：$e')),
      );
    }
  }

  void _share() {
    setState(() => _shareCount += 1);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('已生成转发入口')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final answer = widget.answer;
    final index = widget.index;
    final authorName = _hotTopicAuthorName(answer, index);
    final handle = _hotTopicAuthorHandle(answer, index);
    final role = _hotTopicAuthorRole(answer, index);
    final color = _hotTopicAuthorAccent(role, index);
    final avatarUrl = _hotTopicAuthorAvatar(answer, index);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: () {
              Navigator.of(context).push<void>(
                MaterialPageRoute<void>(
                  builder: (_) => PublicUserProfileScreen(
                    userId: answer.authorId,
                    name: authorName,
                    handle: handle,
                    avatarUrl: avatarUrl,
                    roleLabel: role,
                    kind: _hotTopicProfileKind(role),
                    bio: '$role，参与艺术讨论与作品观点分享。',
                    featuredAnswerContext: '来自热议讨论的回答',
                    featuredAnswer: answer.content,
                  ),
                ),
              );
            },
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _HotTopicAvatar(
                  url: avatarUrl,
                  name: authorName,
                  color: color,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              authorName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: context.artC.ink,
                                fontSize: 14,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Icon(
                            Icons.verified_rounded,
                            color: color,
                            size: 15,
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              handle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: context.artC.ink.withValues(alpha: 0.38),
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          _HotTopicIdentityChip(label: role, color: color),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Text(
            answer.content,
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.68),
              fontSize: 13,
              height: 1.58,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _HotTopicActionButton(
                icon: _liked
                    ? Icons.favorite_rounded
                    : Icons.favorite_border_rounded,
                label: '赞同',
                value: _likeCount,
                active: _liked,
                onTap: _toggleLike,
              ),
              const SizedBox(width: 8),
              _HotTopicActionButton(
                icon: Icons.mode_comment_outlined,
                label: '评论',
                value: _commentCount,
                onTap: _toggleCommentBox,
              ),
              const SizedBox(width: 8),
              _HotTopicActionButton(
                icon: Icons.ios_share_rounded,
                label: '转发',
                value: _shareCount,
                onTap: _share,
              ),
            ],
          ),
          if (_showCommentBox) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.fromLTRB(12, 8, 8, 8),
              decoration: BoxDecoration(
                color: context.artC.porcelain,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: context.artC.silver.withValues(alpha: 0.32),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      minLines: 1,
                      maxLines: 3,
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: '回复 $authorName 的观点...',
                        isDense: true,
                      ),
                      style: TextStyle(
                        color: context.artC.ink,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: _submittingComment ? null : _submitComment,
                    style: FilledButton.styleFrom(
                      backgroundColor: kCobalt,
                      minimumSize: const Size(58, 34),
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                    ),
                    child: const Text(
                      '发送',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (_commentsLoading) ...[
              const SizedBox(height: 10),
              const LinearProgressIndicator(minHeight: 2, color: kCobalt),
            ] else if (_comments.isNotEmpty) ...[
              const SizedBox(height: 10),
              ..._comments.take(3).map(
                    (comment) => _HotTopicCommentPreview(comment: comment),
                  ),
            ],
          ],
        ],
      ),
    );
  }
}

class _HotTopicAvatar extends StatelessWidget {
  final String? url;
  final String name;
  final Color color;

  const _HotTopicAvatar({
    required this.url,
    required this.name,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final fallback = Container(
      width: 46,
      height: 46,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        name.characters.take(1).toString(),
        style: TextStyle(
          color: color,
          fontSize: 15,
          fontWeight: FontWeight.w900,
        ),
      ),
    );

    if (url == null || url!.isEmpty) return fallback;
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Image.network(
        url!,
        width: 46,
        height: 46,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => fallback,
      ),
    );
  }
}

class _HotTopicCommentPreview extends StatelessWidget {
  final Map<String, dynamic> comment;

  const _HotTopicCommentPreview({required this.comment});

  @override
  Widget build(BuildContext context) {
    final profile = comment['user_profiles'];
    final profileMap = profile is Map<String, dynamic> ? profile : null;
    final name = profileMap?['nickname']?.toString().trim();
    final body = comment['body']?.toString().trim() ?? '';
    if (body.isEmpty) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: context.artC.porcelain,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.24)),
      ),
      child: RichText(
        text: TextSpan(
          style: TextStyle(
            color: context.artC.ink.withValues(alpha: 0.66),
            fontSize: 12,
            height: 1.35,
            fontWeight: FontWeight.w700,
          ),
          children: [
            TextSpan(
              text: '${name?.isNotEmpty == true ? name! : '社区用户'}：',
              style: TextStyle(
                color: context.artC.ink,
                fontWeight: FontWeight.w900,
              ),
            ),
            TextSpan(text: body),
          ],
        ),
      ),
    );
  }
}

class _HotTopicIdentityChip extends StatelessWidget {
  final String label;
  final Color color;

  const _HotTopicIdentityChip({
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _HotTopicActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final int value;
  final bool active;
  final VoidCallback onTap;

  const _HotTopicActionButton({
    required this.icon,
    required this.label,
    required this.value,
    required this.onTap,
    this.active = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? kCobalt : context.artC.ink.withValues(alpha: 0.44);
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          height: 38,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: active
                ? kCobalt.withValues(alpha: 0.08)
                : context.artC.porcelain,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 15, color: color),
              const SizedBox(width: 5),
              Flexible(
                child: Text(
                  '$label $value',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: color,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
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

String _hotTopicAuthorName(AppCommunityHotTopicAnswer answer, int index) {
  final name = answer.authorName?.trim();
  if (name != null && name.isNotEmpty) return name;
  const names = ['沈予白', 'Mia Chen', '陆川霖 Lin', '王教授', '艺见心顾问团'];
  return names[index % names.length];
}

String _hotTopicAuthorHandle(AppCommunityHotTopicAnswer answer, int index) {
  final handle = answer.authorHandle?.trim();
  if (handle != null && handle.isNotEmpty) {
    return handle.startsWith('@') ? handle : '@$handle';
  }
  const handles = [
    '@shen-yubai',
    '@mia.chen',
    '@lin-studio',
    '@prof-wang',
    '@artiqore-advisor'
  ];
  return handles[index % handles.length];
}

String _hotTopicAuthorRole(AppCommunityHotTopicAnswer answer, int index) {
  final role = answer.authorRole?.trim();
  if (role != null && role.isNotEmpty) return role;
  const roles = ['认证艺术家', '在读学生', '认证艺术家', '认证导师', '机构顾问'];
  return roles[index % roles.length];
}

PublicUserProfileKind _hotTopicProfileKind(String role) {
  if (role.contains('艺术家')) return PublicUserProfileKind.artist;
  if (role.contains('学生') || role.contains('在读')) {
    return PublicUserProfileKind.student;
  }
  if (role.contains('导师') || role.contains('顾问')) {
    return PublicUserProfileKind.mentor;
  }
  return PublicUserProfileKind.user;
}

Color _hotTopicAuthorAccent(String role, int index) {
  if (role.contains('机构') || role.contains('顾问')) {
    return const Color(0xFF8D5AD7);
  }
  if (role.contains('导师')) {
    return kCobalt;
  }
  if (role.contains('艺术家')) {
    return const Color(0xFF2F9B7A);
  }
  if (role.contains('学生')) {
    return const Color(0xFF7A6A56);
  }
  const colors = [
    kCobalt,
    Color(0xFF2F9B7A),
    Color(0xFF8D5AD7),
    Color(0xFF7A6A56),
  ];
  return colors[index % colors.length];
}

String? _hotTopicAuthorAvatar(AppCommunityHotTopicAnswer answer, int index) {
  final avatar = answer.authorAvatarUrl?.trim();
  if (avatar != null && avatar.isNotEmpty) return avatar;
  return 'https://i.pravatar.cc/160?u=artsee-hot-topic-$index';
}

class _HotTopicDiscussNowCard extends StatelessWidget {
  final AppCommunityHotTopic topic;
  final Future<void> Function() onAsk;

  const _HotTopicDiscussNowCard({
    required this.topic,
    required this.onAsk,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        onAsk();
      },
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: kCobalt,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(15),
              ),
              child: const Icon(
                Icons.edit_square,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 13),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '发起一条新讨论',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    topic.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.62),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_rounded,
              color: Colors.white,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}

class _HotTopicSkeletonCard extends StatelessWidget {
  const _HotTopicSkeletonCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SkeletonLine(width: 92, height: 22, radius: 999),
          SizedBox(height: 18),
          _SkeletonLine(width: 230, height: 16),
          SizedBox(height: 8),
          _SkeletonLine(width: 180, height: 16),
          SizedBox(height: 18),
          _SkeletonLine(width: 240, height: 10),
          SizedBox(height: 10),
          _SkeletonLine(width: 210, height: 10),
          SizedBox(height: 18),
          Align(
            alignment: Alignment.centerRight,
            child: _SkeletonLine(width: 82, height: 28, radius: 999),
          ),
        ],
      ),
    );
  }
}

class _SkeletonLine extends StatelessWidget {
  final double width;
  final double height;
  final double radius;

  const _SkeletonLine({
    required this.width,
    required this.height,
    this.radius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: context.artC.silver.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(radius),
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
                    color: selected == value
                        ? kCobalt.withValues(alpha: 0.08)
                        : context.artC.cardIconBg,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: selected == value
                          ? kCobalt.withValues(alpha: 0.32)
                          : context.artC.silver.withValues(alpha: 0.42),
                    ),
                  ),
                  child: Text(
                    value,
                    style: TextStyle(
                      color: selected == value
                          ? kCobalt
                          : context.artC.ink.withValues(alpha: 0.54),
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
                  letterSpacing: 0,
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

    return ArtseeSurface(
      onTap: onOpen,
      padding: const EdgeInsets.all(14),
      radius: 18,
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
            children: tags.take(2).map((tag) => _MiniTag(label: tag)).toList(),
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
                  letterSpacing: 0,
                ),
              ),
            ),
          ),
        ],
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
  final List<({String type, String title, String meta})> _localQuestions = [];

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

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        foregroundColor: context.artC.ink,
        centerTitle: true,
        title: const Text('圈子'),
        actions: [
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('圈子链接已准备好，稍后开放分享')),
              );
            },
            icon: const Icon(Icons.ios_share_rounded, size: 19),
          ),
        ],
      ),
      bottomNavigationBar: _CircleDetailBottomBar(
        circle: widget.circle,
        index: widget.index,
        joinStatus: _joinStatus,
        onJoin: _handleAction,
        onPost: _openPostComposer,
        onAsk: _openAskQuestion,
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(
          20,
          8,
          20,
          MediaQuery.paddingOf(context).bottom + 104,
        ),
        children: [
          _CircleDetailHero(
            circle: widget.circle,
            index: widget.index,
            title: title,
            subtitle: subtitle,
            tags: tags,
            memberCount: memberCount,
            discussions: discussions,
            joinStatus: _joinStatus,
          ),
          const SizedBox(height: 12),
          _CircleJoinInsightCard(
            circle: widget.circle,
            index: widget.index,
            joinStatus: _joinStatus,
          ),
          const SizedBox(height: 14),
          _CircleAnnouncement(circle: widget.circle, index: widget.index),
          const SizedBox(height: 16),
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
      '问答' => [
          ..._localQuestions,
          ..._circleQuestionItems(widget.circle, widget.index),
        ],
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

  Future<void> _handleAction() async {
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
    if (!await ensureLoggedIn(context, message: '请先登录后加入圈子')) return;
    final id = widget.circle['id']?.toString();
    if (id == null || id.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('圈子缺少 ID，暂时无法加入')),
      );
      return;
    }
    try {
      final updated = await BackendApiService.joinCommunityCircle(id);
      if (!mounted) return;
      final nextStatus = updated['join_status']?.toString() ??
          (joinType == 'approval' ? 'pending' : 'joined');
      widget.circle.addAll(updated);
      setState(() => _joinStatus = nextStatus);
      widget.onJoinChanged(nextStatus);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(nextStatus == 'pending'
              ? '申请已提交，审核通过后会通知你'
              : '已加入「${widget.circle['title'] ?? '艺术圈子'}」'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('加入失败：$e')),
      );
    }
  }

  Future<void> _openPostComposer() async {
    if (_joinStatus != 'joined') {
      await _handleAction();
      if (_joinStatus != 'joined') return;
    }
    final text = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _PostComposerModal(),
    );
    if (text == null || text.isEmpty || !mounted) return;
    final id = widget.circle['id']?.toString();
    if (id == null || id.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('圈子缺少 ID，暂时无法发布')),
      );
      return;
    }
    try {
      await BackendApiService.createCommunityPost(
        title: text,
        body: text,
        metadata: {
          'kind': 'circle',
          'circle_id': id,
          'source_circle': widget.circle['title']?.toString() ?? '艺术圈子',
        },
      );
      if (!mounted) return;
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
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('发布失败：$e')),
      );
    }
  }

  Future<void> _openAskQuestion() async {
    if (!await ensureLoggedIn(context, message: '请先登录后发布问题')) return;
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
    setState(() {
      _selectedSection = '问答';
      _localQuestions.insert(
        0,
        (type: '提问', title: createdTitle, meta: '刚刚 · 0 回答'),
      );
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('问题已发布，也会进入问答流')),
    );
  }
}

class _CircleDetailHero extends StatelessWidget {
  final Map<String, dynamic> circle;
  final int index;
  final String title;
  final String subtitle;
  final List<String> tags;
  final Object memberCount;
  final int discussions;
  final String joinStatus;

  const _CircleDetailHero({
    required this.circle,
    required this.index,
    required this.title,
    required this.subtitle,
    required this.tags,
    required this.memberCount,
    required this.discussions,
    required this.joinStatus,
  });

  @override
  Widget build(BuildContext context) {
    final hotTopic = _circleHotTopic(circle, index);
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: context.artC.ink.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 12),
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
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(21),
                ),
                child: Icon(
                  _circleIcon(circle, index),
                  color: Colors.white,
                  size: 29,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 7,
                      runSpacing: 7,
                      children: [
                        _CircleDarkBadge(
                          label: _circleDetailStatusText(
                              circle, index, joinStatus),
                          strong: true,
                        ),
                        _CircleDarkBadge(
                          label:
                              circle['category']?.toString().isNotEmpty == true
                                  ? circle['category'].toString()
                                  : 'Art Circle',
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      title,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 25,
                        height: 1.12,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'Noto Serif SC',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            subtitle,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.58),
              fontSize: 12,
              height: 1.45,
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
                  .map((tag) => _CircleDarkBadge(label: tag))
                  .toList(),
            ),
          ],
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: _CircleHeroMetric(
                  label: '成员',
                  value: '$memberCount',
                  icon: Icons.people_outline,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _CircleHeroMetric(
                  label: '今日动态',
                  value: '$discussions',
                  icon: Icons.bolt_outlined,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _CircleHeroMetric(
                  label: '加入方式',
                  value: _circleJoinType(circle, index) == 'approval'
                      ? '审核'
                      : _circleJoinType(circle, index) == 'private'
                          ? '私密'
                          : '开放',
                  icon: Icons.verified_user_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.local_fire_department_outlined,
                  color: Colors.white, size: 18),
              const SizedBox(width: 9),
              Expanded(
                child: Text(
                  '正在聊：$hotTopic',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.72),
                    fontSize: 12,
                    height: 1.4,
                    fontWeight: FontWeight.w800,
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

class _CircleDarkBadge extends StatelessWidget {
  final String label;
  final bool strong;

  const _CircleDarkBadge({
    required this.label,
    this.strong = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: strong ? kCobalt : Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: Colors.white.withValues(alpha: strong ? 1 : 0.72),
          fontSize: 9,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _CircleHeroMetric extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _CircleHeroMetric({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white.withValues(alpha: 0.72), size: 16),
        const SizedBox(height: 7),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.42),
            fontSize: 9,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

String _circleDetailStatusText(
  Map<String, dynamic> circle,
  int index,
  String status,
) {
  if (status == 'joined') return '已加入';
  if (status == 'pending') return '审核中';
  final joinType = _circleJoinType(circle, index);
  if (joinType == 'private') return '私密圈子';
  if (joinType == 'approval') return '需审核';
  return '开放加入';
}

({String title, String body, IconData icon, Color color})
    _circleJoinInsightCopy(
  String status,
  String joinType,
) {
  if (status == 'joined') {
    return (
      title: '你已加入这个圈子',
      body: '可以发布动态、发起问题，也可以跟进圈内作品集反馈、活动和资源更新。',
      icon: Icons.check_circle_outline,
      color: const Color(0xFF16A34A),
    );
  }
  if (status == 'pending') {
    return (
      title: '申请正在审核中',
      body: '审核通过后会通知你。通过前可以先浏览圈子公告和公开动态。',
      icon: Icons.hourglass_top_rounded,
      color: const Color(0xFFEA580C),
    );
  }
  if (joinType == 'private') {
    return (
      title: '暂不开放加入',
      body: '这个圈子当前为私密状态，可以先浏览其他推荐圈子或关注后续开放。',
      icon: Icons.lock_outline,
      color: const Color(0xFF64748B),
    );
  }
  if (joinType == 'approval') {
    return (
      title: '需要审核后加入',
      body: '提交申请后由圈子管理员确认。适合认证校友、研究小组或项目协作圈。',
      icon: Icons.verified_user_outlined,
      color: kCobalt,
    );
  }
  return (
    title: '开放加入',
    body: '加入后即可发布动态、提问题、参与作品互评，并接收圈内新活动提醒。',
    icon: Icons.group_add_outlined,
    color: kCobalt,
  );
}

class _CircleJoinInsightCard extends StatelessWidget {
  final Map<String, dynamic> circle;
  final int index;
  final String joinStatus;

  const _CircleJoinInsightCard({
    required this.circle,
    required this.index,
    required this.joinStatus,
  });

  @override
  Widget build(BuildContext context) {
    final joinType = _circleJoinType(circle, index);
    final copy = _circleJoinInsightCopy(joinStatus, joinType);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: copy.color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Icon(copy.icon, color: copy.color, size: 20),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  copy.title,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  copy.body,
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.52),
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

class _CircleDetailBottomBar extends StatelessWidget {
  final Map<String, dynamic> circle;
  final int index;
  final String joinStatus;
  final VoidCallback onJoin;
  final VoidCallback onPost;
  final VoidCallback onAsk;

  const _CircleDetailBottomBar({
    required this.circle,
    required this.index,
    required this.joinStatus,
    required this.onJoin,
    required this.onPost,
    required this.onAsk,
  });

  @override
  Widget build(BuildContext context) {
    final action = _circleActionStyle(context, circle, index, joinStatus);
    return Container(
      decoration: BoxDecoration(
        color: context.artC.porcelain.withValues(alpha: 0.96),
        border: Border(
          top: BorderSide(color: context.artC.silver.withValues(alpha: 0.28)),
        ),
      ),
      child: SafeArea(
        minimum: const EdgeInsets.fromLTRB(20, 10, 20, 14),
        child: joinStatus == 'joined'
            ? Row(
                children: [
                  Expanded(
                    child: _CircleBottomAction(
                      label: '提问题',
                      icon: Icons.help_outline,
                      dark: false,
                      onTap: onAsk,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _CircleBottomAction(
                      label: '发动态',
                      icon: Icons.edit_square,
                      dark: true,
                      onTap: onPost,
                    ),
                  ),
                ],
              )
            : _CircleBottomAction(
                label: action.label,
                icon: _circleJoinType(circle, index) == 'approval'
                    ? Icons.verified_user_outlined
                    : Icons.group_add_outlined,
                dark: action.borderColor == null,
                background: action.background,
                foreground: action.foreground,
                borderColor: action.borderColor,
                onTap: onJoin,
              ),
      ),
    );
  }
}

class _CircleBottomAction extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool dark;
  final Color? background;
  final Color? foreground;
  final Color? borderColor;
  final VoidCallback onTap;

  const _CircleBottomAction({
    required this.label,
    required this.icon,
    required this.dark,
    required this.onTap,
    this.background,
    this.foreground,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    final bg = background ?? (dark ? context.artC.ink : Colors.white);
    final fg = foreground ?? (dark ? Colors.white : context.artC.ink);
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        height: 48,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(17),
          border: Border.all(
            color: borderColor ??
                (dark ? bg : context.artC.silver.withValues(alpha: 0.45)),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: fg, size: 16),
            const SizedBox(width: 7),
            Text(
              label,
              style: TextStyle(
                color: fg,
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
          color: context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: context.artC.silver.withOpacity(0.32)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 2.55,
              child: ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(20)),
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
                            letterSpacing: 0,
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
                      fontSize: 17,
                      height: 1.18,
                      fontWeight: FontWeight.w900,
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

  Future<void> _handleReserve() async {
    if (_submitting || _reserved) return;
    setState(() => _submitting = true);
    final reserved = await widget.onReserve();
    if (!mounted) return;
    setState(() {
      _reserved = reserved;
      _submitting = false;
    });
  }

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
    final venue = _salonVenue(widget.salon);
    final canReserve =
        !_reserved && !_submitting && status != '已结束' && status != '回放';
    final bottom = MediaQuery.paddingOf(context).bottom;

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
          '沙龙详情',
          style: TextStyle(
            color: context.artC.ink,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.ios_share_rounded,
                color: context.artC.ink, size: 20),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('沙龙分享功能稍后开放')),
              );
            },
          ),
        ],
      ),
      bottomNavigationBar: _SalonDetailBottomBar(
        status: status,
        reserved: _reserved,
        submitting: _submitting,
        canReserve: canReserve,
        feeLine: _formatSalonFeeWithSeats(widget.salon, widget.index),
        onReserve: _handleReserve,
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(20, 8, 20, bottom + 120),
        children: [
          _SalonDetailHero(
            salon: widget.salon,
            title: title,
            summary: summary,
            type: type,
            status: status,
            seats: seats,
            venue: venue,
            dateLine: _formatForumDate(widget.salon['start_time']),
          ),
          const SizedBox(height: 14),
          _SalonBookingSnapshot(
            status: status,
            seats: seats,
            fee: _formatSalonFeeWithSeats(widget.salon, widget.index),
          ),
          const SizedBox(height: 14),
          _SalonInvitationCard(summary: summary),
          const SizedBox(height: 14),
          _SalonHostCard(
            guest: guest,
            benefit: benefit,
            type: type,
          ),
          const SizedBox(height: 14),
          _SalonHighlightGrid(
            items: _salonHighlights(widget.salon, widget.index),
          ),
          const SizedBox(height: 18),
          const _CommunitySectionHeader(title: '活动流程', action: 'PLAN'),
          const SizedBox(height: 10),
          _SalonItineraryCard(
            items: _salonItinerary(widget.salon, widget.index),
          ),
          const SizedBox(height: 18),
          const _CommunitySectionHeader(title: '适合人群', action: 'MATCH'),
          const SizedBox(height: 10),
          _SalonAudienceCard(
            items: _salonAudience(widget.salon, widget.index),
          ),
        ],
      ),
    );
  }
}

class _SalonDetailHero extends StatelessWidget {
  final Map<String, dynamic> salon;
  final String title;
  final String summary;
  final String type;
  final String status;
  final int seats;
  final String venue;
  final String dateLine;

  const _SalonDetailHero({
    required this.salon,
    required this.title,
    required this.summary,
    required this.type,
    required this.status,
    required this.seats,
    required this.venue,
    required this.dateLine,
  });

  @override
  Widget build(BuildContext context) {
    final coverUrl = salon['cover_url']?.toString();
    return ClipRRect(
      borderRadius: BorderRadius.circular(32),
      child: SizedBox(
        height: 380,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (coverUrl != null && coverUrl.isNotEmpty)
              Image.network(
                coverUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _SalonHeroFallback(),
              )
            else
              _SalonHeroFallback(),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    context.artC.ink.withValues(alpha: 0.05),
                    context.artC.ink.withValues(alpha: 0.42),
                    context.artC.ink.withValues(alpha: 0.92),
                  ],
                  stops: const [0.08, 0.46, 1],
                ),
              ),
            ),
            Positioned(
              top: 18,
              left: 18,
              right: 18,
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _SalonGlassBadge(label: type, strong: true),
                  _SalonGlassBadge(
                    label:
                        status == '可预约' && seats <= 6 ? '剩余 $seats 席' : status,
                  ),
                ],
              ),
            ),
            Positioned(
              left: 20,
              right: 20,
              bottom: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 27,
                      height: 1.08,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    summary,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.62),
                      fontSize: 12,
                      height: 1.45,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _SalonHeroInfoLine(
                    icon: Icons.calendar_today_outlined,
                    text: dateLine,
                  ),
                  const SizedBox(height: 8),
                  _SalonHeroInfoLine(
                    icon: Icons.location_on_outlined,
                    text: venue,
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

class _SalonHeroFallback extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: context.artC.ink,
      child: Center(
        child: Icon(
          Icons.auto_awesome,
          color: Colors.white.withValues(alpha: 0.24),
          size: 72,
        ),
      ),
    );
  }
}

class _SalonGlassBadge extends StatelessWidget {
  final String label;
  final bool strong;

  const _SalonGlassBadge({
    required this.label,
    this.strong = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
      decoration: BoxDecoration(
        color: strong ? kCobalt : Colors.white.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: Colors.white.withValues(alpha: strong ? 1 : 0.82),
          fontSize: 9,
          fontWeight: FontWeight.w900,
          letterSpacing: 0,
        ),
      ),
    );
  }
}

class _SalonHeroInfoLine extends StatelessWidget {
  final IconData icon;
  final String text;

  const _SalonHeroInfoLine({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: kCobalt, size: 16),
        const SizedBox(width: 9),
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.84),
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ],
    );
  }
}

class _SalonBookingSnapshot extends StatelessWidget {
  final String status;
  final int seats;
  final String fee;

  const _SalonBookingSnapshot({
    required this.status,
    required this.seats,
    required this.fee,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _SalonSnapshotTile(
            icon: Icons.event_available_outlined,
            label: '状态',
            value: status == '可预约' ? '开放预约' : status,
            color: _salonStatusAccent(status),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _SalonSnapshotTile(
            icon: Icons.event_seat_outlined,
            label: '席位',
            value: '$seats 席',
            color: kCobalt,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _SalonSnapshotTile(
            icon: Icons.payments_outlined,
            label: '费用',
            value: fee.split('/').first.trim(),
            color: context.artC.ink,
          ),
        ),
      ],
    );
  }
}

class _SalonSnapshotTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _SalonSnapshotTile({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
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
          Icon(icon, color: color, size: 17),
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

class _SalonInvitationCard extends StatelessWidget {
  final String summary;

  const _SalonInvitationCard({required this.summary});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.local_activity_outlined,
                  color: kCobalt,
                  size: 19,
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Text(
                  '本场邀请',
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            summary,
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.58),
              fontSize: 12,
              height: 1.6,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _SalonHostCard extends StatelessWidget {
  final String guest;
  final String benefit;
  final String type;

  const _SalonHostCard({
    required this.guest,
    required this.benefit,
    required this.type,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(26),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(17),
            ),
            child: const Icon(
              Icons.person_outline,
              color: Colors.white,
              size: 23,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  type,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.38),
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0,
                  ),
                ),
                const SizedBox(height: 7),
                Text(
                  guest,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    height: 1.25,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 7),
                Text(
                  benefit,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.58),
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

class _SalonHighlightGrid extends StatelessWidget {
  final List<({IconData icon, String title, String body})> items;

  const _SalonHighlightGrid({required this.items});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        mainAxisExtent: 132,
      ),
      itemBuilder: (context, index) {
        final item = items[index];
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border:
                Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: context.artC.silver.withValues(alpha: 0.24),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Icon(item.icon, color: kCobalt, size: 18),
              ),
              const SizedBox(height: 9),
              Text(
                item.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                item.body,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.46),
                  fontSize: 10,
                  height: 1.35,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SalonItineraryCard extends StatelessWidget {
  final List<({String time, String title, String body})> items;

  const _SalonItineraryCard({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Column(
        children: items
            .asMap()
            .entries
            .map(
              (entry) => _SalonTimelineRow(
                item: entry.value,
                last: entry.key == items.length - 1,
              ),
            )
            .toList(),
      ),
    );
  }
}

class _SalonTimelineRow extends StatelessWidget {
  final ({String time, String title, String body}) item;
  final bool last;

  const _SalonTimelineRow({
    required this.item,
    required this.last,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 46,
          child: Text(
            item.time,
            style: const TextStyle(
              color: kCobalt,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        Column(
          children: [
            Container(
              width: 9,
              height: 9,
              decoration: const BoxDecoration(
                color: kCobalt,
                shape: BoxShape.circle,
              ),
            ),
            if (!last)
              Container(
                width: 1,
                height: 52,
                color: context.artC.silver.withValues(alpha: 0.46),
              ),
          ],
        ),
        const SizedBox(width: 13),
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: last ? 0 : 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.body,
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.46),
                    fontSize: 11,
                    height: 1.4,
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

class _SalonAudienceCard extends StatelessWidget {
  final List<String> items;

  const _SalonAudienceCard({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      ),
      child: Column(
        children: items
            .map(
              (item) => Padding(
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
                        item,
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

class _SalonDetailBottomBar extends StatelessWidget {
  final String status;
  final bool reserved;
  final bool submitting;
  final bool canReserve;
  final String feeLine;
  final Future<void> Function() onReserve;

  const _SalonDetailBottomBar({
    required this.status,
    required this.reserved,
    required this.submitting,
    required this.canReserve,
    required this.feeLine,
    required this.onReserve,
  });

  @override
  Widget build(BuildContext context) {
    final label = reserved
        ? '已预约'
        : submitting
            ? '提交中'
            : status == '回放'
                ? '看回放'
                : status == '已结束'
                    ? '已结束'
                    : '立即预约';
    final enabled = canReserve;
    return Container(
      decoration: BoxDecoration(
        color: context.artC.porcelain.withValues(alpha: 0.96),
        border: Border(
          top: BorderSide(color: context.artC.silver.withValues(alpha: 0.28)),
        ),
      ),
      child: SafeArea(
        minimum: const EdgeInsets.fromLTRB(20, 10, 20, 14),
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    feeLine,
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
                    reserved ? '活动通知会进入私信' : '预约后可在私信查看通知',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
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
              onTap: enabled ? onReserve : null,
              behavior: HitTestBehavior.opaque,
              child: Container(
                height: 48,
                padding: const EdgeInsets.symmetric(horizontal: 24),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: enabled
                      ? context.artC.ink
                      : context.artC.silver.withValues(alpha: 0.42),
                  borderRadius: BorderRadius.circular(17),
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

String _salonVenue(Map<String, dynamic> salon) {
  final venue = salon['venue']?.toString();
  if (venue != null && venue.trim().isNotEmpty) return venue.trim();
  final city = salon['city']?.toString();
  if (city != null && city.trim().isNotEmpty) return city.trim();
  return '地点待定';
}

Color _salonStatusAccent(String status) {
  if (status == '已预约') return const Color(0xFF16A34A);
  if (status == '名额紧张' || status == '即将开始') {
    return const Color(0xFFEA580C);
  }
  if (status == '回放' || status == '已结束') return const Color(0xFF64748B);
  return kCobalt;
}

List<({IconData icon, String title, String body})> _salonHighlights(
  Map<String, dynamic> salon,
  int index,
) {
  final type = _salonTypeLabel(salon, index);
  if (type == 'PORTFOLIO REVIEW') {
    return const [
      (
        icon: Icons.image_search_outlined,
        title: '作品集点评',
        body: '聚焦项目叙事、过程页和最终呈现'
      ),
      (
        icon: Icons.question_answer_outlined,
        title: '现场 Q&A',
        body: '把申请和创作卡点当场拆开'
      ),
      (icon: Icons.groups_outlined, title: '小班交流', body: '控制人数，保留充分互动时间'),
      (
        icon: Icons.mark_chat_unread_outlined,
        title: '通知跟进',
        body: '预约后活动信息进入私信'
      ),
    ];
  }
  if (type == 'CAREER SALON') {
    return const [
      (icon: Icons.work_outline, title: '行业路径', body: '拆解岗位、能力和第一份实习'),
      (icon: Icons.badge_outlined, title: '简历建议', body: '把作品集转成可投递表达'),
      (icon: Icons.groups_outlined, title: '从业者交流', body: '听真实招聘和团队协作反馈'),
      (icon: Icons.timeline_outlined, title: '行动清单', body: '带走下一步求职准备方向'),
    ];
  }
  if (type == 'ART MARKET') {
    return const [
      (icon: Icons.storefront_outlined, title: '画廊视角', body: '理解展览、收藏和销售链路'),
      (icon: Icons.trending_up_outlined, title: '市场判断', body: '看年轻艺术家的定价与曝光'),
      (icon: Icons.handshake_outlined, title: '合作机会', body: '连接策展、空间和藏家资源'),
      (icon: Icons.verified_outlined, title: '规则意识', body: '聊授权、合同和商业边界'),
    ];
  }
  return const [
    (icon: Icons.school_outlined, title: '校友经验', body: '围绕院校申请和学习体验展开'),
    (icon: Icons.auto_awesome, title: '主题分享', body: '从一个清晰议题进入深聊'),
    (icon: Icons.groups_outlined, title: '同频社交', body: '认识同方向申请者与创作者'),
    (icon: Icons.bookmark_border, title: '资料沉淀', body: '会后可继续跟进重点资源'),
  ];
}

List<({String time, String title, String body})> _salonItinerary(
  Map<String, dynamic> salon,
  int index,
) {
  final type = _salonTypeLabel(salon, index);
  if (type == 'PORTFOLIO REVIEW') {
    return const [
      (time: '00:00', title: '签到与破冰', body: '确认作品集方向和本场点评重点。'),
      (time: '00:15', title: '主题方法分享', body: '讲解项目叙事、页面结构和面试表达。'),
      (time: '00:45', title: '作品集诊断', body: '选取典型案例做拆解式反馈。'),
      (time: '01:20', title: '开放问答', body: '集中处理申请节奏、材料和院校选择问题。'),
    ];
  }
  if (type == 'CAREER SALON') {
    return const [
      (time: '00:00', title: '入场与自我介绍', body: '快速同步专业方向和目标岗位。'),
      (time: '00:15', title: '行业路径拆解', body: '讲清岗位差异、作品要求和招聘节奏。'),
      (time: '00:50', title: '案例复盘', body: '用真实作品或简历看可优化点。'),
      (time: '01:20', title: '行动计划', body: '形成后续投递、改稿和交流清单。'),
    ];
  }
  return const [
    (time: '00:00', title: '签到入场', body: '确认预约信息，进入主题社交场。'),
    (time: '00:15', title: '主理人分享', body: '围绕本场主题做一次高密度导入。'),
    (time: '00:50', title: '圆桌讨论', body: '嘉宾与参与者围绕核心问题展开交流。'),
    (time: '01:20', title: '自由交流', body: '留下合作、申请或作品反馈线索。'),
  ];
}

class _ChatCard extends StatelessWidget {
  final Map<String, dynamic> conversation;
  final int index;
  final VoidCallback onTap;

  const _ChatCard({
    required this.conversation,
    required this.index,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final peer = conversation['peer_profile'];
    final latest = conversation['latest_message'];
    final peerProfile = peer is Map<String, dynamic> ? peer : null;
    final latestMessage = latest is Map<String, dynamic> ? latest : null;
    final isOrg = _conversationIsOrganization(conversation);
    final title = conversation['title']?.toString().isNotEmpty == true
        ? conversation['title'].toString()
        : peerProfile?['nickname']?.toString().isNotEmpty == true
            ? peerProfile!['nickname'].toString()
            : isOrg
                ? '机构会话'
                : 'Artsee 用户';
    final body = latestMessage?['body']?.toString() ?? '暂无消息内容';
    final time = _formatForumChatTime(
      latestMessage?['created_at'] ?? conversation['updated_at'],
    );
    final unread = conversation['unread_count'] is int
        ? conversation['unread_count'] as int
        : int.tryParse(conversation['unread_count']?.toString() ?? '') ?? 0;
    final avatarUrl = peerProfile?['avatar_url']?.toString();
    final identity = isOrg
        ? _conversationOrganizationIdentity(conversation)
        : _conversationPersonIdentityLabel(conversation);

    return ArtseeSurface(
      onTap: onTap,
      padding: const EdgeInsets.all(15),
      radius: 8,
      child: Row(
        children: [
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(isOrg ? 13 : 27),
                child: SizedBox(
                  width: 54,
                  height: 54,
                  child: avatarUrl != null && avatarUrl.isNotEmpty
                      ? Image.network(
                          avatarUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _ChatAvatarFallback(seed: index, org: isOrg),
                        )
                      : _ChatAvatarFallback(seed: index, org: isOrg),
                ),
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
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: context.artC.ink,
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
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
                const SizedBox(height: 6),
                _ChatIdentityTag(label: identity, org: isOrg),
                const SizedBox(height: 6),
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

class _TencentImStatusStrip extends StatelessWidget {
  final bool connecting;
  final bool ready;
  final String text;
  final VoidCallback onRetry;

  const _TencentImStatusStrip({
    required this.connecting,
    required this.ready,
    required this.text,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final color = ready ? const Color(0xFF047857) : kCobalt;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.16)),
      ),
      child: Row(
        children: [
          connecting
              ? SizedBox(
                  width: 15,
                  height: 15,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: color,
                  ),
                )
              : Icon(
                  ready
                      ? Icons.check_circle_outline_rounded
                      : Icons.info_outline_rounded,
                  color: color,
                  size: 17,
                ),
          const SizedBox(width: 9),
          Expanded(
            child: Text(
              text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: context.artC.ink.withValues(alpha: 0.58),
                fontSize: 11,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          IconButton(
            tooltip: '重新连接',
            visualDensity: VisualDensity.compact,
            onPressed: connecting ? null : onRetry,
            icon: Icon(Icons.sync_rounded, color: color, size: 18),
          ),
        ],
      ),
    );
  }
}

class _FriendShortcutPanel extends StatelessWidget {
  final List<Map<String, dynamic>> friends;
  final String? openingFriendId;
  final ValueChanged<Map<String, dynamic>> onOpenFriend;

  const _FriendShortcutPanel({
    required this.friends,
    required this.openingFriendId,
    required this.onOpenFriend,
  });

  @override
  Widget build(BuildContext context) {
    return ArtseeSurface(
      padding: const EdgeInsets.fromLTRB(14, 13, 14, 14),
      radius: 8,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.people_alt_outlined, size: 17, color: kCobalt),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '好友快捷聊天',
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Text(
                '${friends.length} 位',
                style: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.34),
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 94,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: friends.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (_, index) {
                final friend = friends[index];
                final friendId = friend['friend_id']?.toString();
                return _FriendShortcutChip(
                  friend: friend,
                  busy: friendId != null && friendId == openingFriendId,
                  onTap: () => onOpenFriend(friend),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FriendShortcutChip extends StatelessWidget {
  final Map<String, dynamic> friend;
  final bool busy;
  final VoidCallback onTap;

  const _FriendShortcutChip({
    required this.friend,
    required this.busy,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final avatarUrl = _friendAvatarUrl(friend);
    final name = _friendName(friend);
    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: busy ? null : onTap,
      child: SizedBox(
        width: 78,
        child: Column(
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: SizedBox(
                    width: 48,
                    height: 48,
                    child: avatarUrl != null && avatarUrl.isNotEmpty
                        ? Image.network(
                            avatarUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) =>
                                _FriendShortcutFallback(name: name),
                          )
                        : _FriendShortcutFallback(name: name),
                  ),
                ),
                if (busy)
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.72),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Center(
                      child: SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: kCobalt,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 7),
            Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 11,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              _friendRoleLabel(friend),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: context.artC.ink.withValues(alpha: 0.38),
                fontSize: 9,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FriendShortcutFallback extends StatelessWidget {
  final String name;

  const _FriendShortcutFallback({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: kCobalt.withValues(alpha: 0.09),
      alignment: Alignment.center,
      child: Text(
        name.isEmpty ? '艺' : name.characters.first,
        style: const TextStyle(
          color: kCobalt,
          fontSize: 16,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _ChatAvatarFallback extends StatelessWidget {
  final int seed;
  final bool org;

  const _ChatAvatarFallback({required this.seed, this.org = false});

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
      child: Icon(
        org ? Icons.storefront_outlined : Icons.person_outline,
        color: color,
        size: 24,
      ),
    );
  }
}

class _ChatIdentityTag extends StatelessWidget {
  final String label;
  final bool org;

  const _ChatIdentityTag({required this.label, required this.org});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color:
              (org ? const Color(0xFF047857) : kCobalt).withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: org ? const Color(0xFF047857) : kCobalt,
            fontSize: 10,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _MessageEmptyActions extends StatelessWidget {
  final bool hasFriends;
  final VoidCallback onRefresh;

  const _MessageEmptyActions({
    required this.hasFriends,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.32)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ActionTile(
              icon: hasFriends
                  ? Icons.chat_bubble_outline_rounded
                  : Icons.person_add_alt_1_outlined,
              title: hasFriends ? '选择好友' : '先加好友',
              subtitle: hasFriends ? '开始单聊' : '从公开主页添加',
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _ActionTile(
              icon: Icons.sync_rounded,
              title: '刷新消息',
              subtitle: '同步会话状态',
              onTap: onRefresh,
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
  final VoidCallback? onTap;

  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(17),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: context.artC.silver.withValues(alpha: 0.28),
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
                color: context.artC.ink.withValues(alpha: 0.38),
                fontSize: 10,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CommunitySectionHeader extends StatelessWidget {
  final String title;
  final String? action;

  const _CommunitySectionHeader({required this.title, this.action});

  @override
  Widget build(BuildContext context) {
    final actionText = action;
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
              letterSpacing: 0,
            ),
          ),
        ),
        if (actionText != null && actionText.isNotEmpty) ...[
          Text(
            actionText,
            style: const TextStyle(
              color: kCobalt,
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 0,
            ),
          ),
          const Icon(Icons.chevron_right, color: kCobalt, size: 14),
        ],
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
              letterSpacing: 0,
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

String _conversationSearchText(Map<String, dynamic> conversation) {
  final peer = _stringMap(conversation['peer_profile']);
  final latest = _stringMap(conversation['latest_message']);
  final metadata = _stringMap(conversation['metadata']);
  return [
    conversation['title'],
    conversation['type'],
    latest?['body'],
    peer?['nickname'],
    peer?['user_role'],
    peer?['user_type'],
    metadata?['organization_name'],
    metadata?['identity_label'],
  ].whereType<Object>().join(' ');
}

String _friendName(Map<String, dynamic> friend) {
  final profile = _stringMap(friend['profile']);
  final nickname = profile?['nickname']?.toString().trim();
  if (nickname != null && nickname.isNotEmpty) return nickname;
  final id = friend['friend_id']?.toString();
  if (id != null && id.length >= 8) return '用户 ${id.substring(0, 8)}';
  return 'Artsee 用户';
}

String? _friendAvatarUrl(Map<String, dynamic> friend) {
  final profile = _stringMap(friend['profile']);
  final raw = profile?['avatar_url']?.toString().trim();
  return raw == null || raw.isEmpty ? null : raw;
}

String _friendRoleLabel(Map<String, dynamic> friend) {
  final profile = _stringMap(friend['profile']);
  final role =
      profile?['user_role']?.toString() ?? profile?['user_type']?.toString();
  return switch (role) {
    'artist' => '艺术家',
    'mentor' => '导师',
    'student' => '学生',
    'business' => '机构',
    'institution' => '机构',
    _ => '好友',
  };
}

Map<String, dynamic>? _stringMap(dynamic raw) {
  if (raw is Map<String, dynamic>) return raw;
  if (raw is Map) return Map<String, dynamic>.from(raw);
  return null;
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

bool _conversationIsOrganization(Map<String, dynamic> conversation) {
  final peer = conversation['peer_profile'];
  final peerProfile = peer is Map<String, dynamic> ? peer : null;
  final metadataRaw = conversation['metadata'];
  final metadata =
      metadataRaw is Map ? Map<String, dynamic>.from(metadataRaw) : {};
  final type = conversation['type']?.toString() ?? 'direct';
  final userType = peerProfile?['user_type']?.toString() ??
      metadata['peer_type']?.toString() ??
      metadata['target_type']?.toString();
  return userType == 'business' ||
      userType == 'institution' ||
      type == 'organization' ||
      type == 'cooperation' ||
      metadata['organization_name'] != null;
}

String _conversationPersonIdentityLabel(Map<String, dynamic> conversation) {
  final peer = conversation['peer_profile'];
  final peerProfile = peer is Map<String, dynamic> ? peer : null;
  final metadataRaw = conversation['metadata'];
  final metadata =
      metadataRaw is Map ? Map<String, dynamic>.from(metadataRaw) : {};
  final role = peerProfile?['user_role']?.toString() ??
      metadata['user_role']?.toString() ??
      metadata['peer_role']?.toString();
  return switch (role) {
    'artist' => '认证艺术家',
    'mentor' => '导师',
    'student' => '学生',
    _ => metadata['identity_label']?.toString() ?? '用户',
  };
}

String _conversationOrganizationIdentity(Map<String, dynamic> conversation) {
  final metadataRaw = conversation['metadata'];
  final metadata =
      metadataRaw is Map ? Map<String, dynamic>.from(metadataRaw) : {};
  final serviceStatus = metadata['service_status']?.toString();
  final responseTime = metadata['response_time']?.toString();
  if (serviceStatus?.isNotEmpty == true && responseTime?.isNotEmpty == true) {
    return '机构认证 · $serviceStatus · $responseTime';
  }
  if (serviceStatus?.isNotEmpty == true) return '机构认证 · $serviceStatus';
  return '机构认证 · 服务中';
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

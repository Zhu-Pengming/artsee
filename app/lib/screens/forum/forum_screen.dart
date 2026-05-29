import 'package:flutter/material.dart';

import '../../models/models.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class ForumScreen extends StatefulWidget {
  const ForumScreen({super.key});

  @override
  State<ForumScreen> createState() => ForumScreenState();
}

class ForumScreenState extends State<ForumScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _sortType = '综合';
  final GlobalKey<_QaCommunityTabState> _qaKey =
      GlobalKey<_QaCommunityTabState>();
  final GlobalKey<_CircleTabState> _circleKey = GlobalKey<_CircleTabState>();
  final GlobalKey<_SalonTabState> _salonKey = GlobalKey<_SalonTabState>();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
                    sortType: _sortType,
                    onSortChanged: (value) => setState(() => _sortType = value),
                  ),
                  _CircleTab(key: _circleKey, bottom: bottom),
                  _SalonTab(key: _salonKey, bottom: bottom),
                  _ChatTab(bottom: bottom),
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
  final String sortType;
  final ValueChanged<String> onSortChanged;

  const _QaCommunityTab({
    super.key,
    required this.bottom,
    required this.sortType,
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
    (title: '艺术留学', count: '申请 / 院校', color: Color(0xFFEFF6FF), text: Color(0xFF2563EB)),
    (title: '作品集', count: '叙事 / 诊断', color: Color(0xFFF5F3FF), text: Color(0xFF7C3AED)),
    (title: '行业就业', count: '岗位 / 合作', color: Color(0xFFECFDF5), text: Color(0xFF059669)),
    (title: '艺术市场', count: '收藏 / 展览', color: Color(0xFFFFF7ED), text: Color(0xFFEA580C)),
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
      sorted.sort((a, b) =>
          (b.likeCount + b.commentCount).compareTo(a.likeCount + a.commentCount));
    }
    final visibleQuestions = _selectedBlock == null
        ? sorted
        : sorted.where((question) => _matchesBlock(question, _selectedBlock!)).toList();
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
      children: [
        _CommunitySectionHeader(title: '垂直板块', action: 'EXPLORE'),
        GridView.builder(
          padding: const EdgeInsets.only(top: 8),
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: blocks.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.35,
          ),
          itemBuilder: (context, index) {
            final block = blocks[index];
            return _QaBlock(
              block: block,
              selected: _selectedBlock == block.title,
              onTap: () {
                setState(() {
                  _selectedBlock =
                      _selectedBlock == block.title ? null : block.title;
                });
              },
            );
          },
        ),
        const SizedBox(height: 18),
        _CovenantCard(onTap: _showCovenantDialog),
        const SizedBox(height: 26),
        Row(
          children: [
            Expanded(
              child: Text(
                '大家都在问 (TOP)',
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
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
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
          _CommunityEmptyState(
            title: _selectedBlock == null ? '还没有问答' : '暂无$_selectedBlock问答',
            subtitle: _selectedBlock == null
                ? '点击右上角 + 发布第一个艺术问题。'
                : '当前板块还没有内容，可以点右上角 + 发布相关问题。',
            onRetry: () {
              if (_selectedBlock != null) {
                setState(() => _selectedBlock = null);
              } else {
                _load();
              }
            },
          )
        else
          ...visibleQuestions.map(
            (question) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _QuestionCard(question: question),
            ),
          ),
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

  const _CircleTab({super.key, required this.bottom});

  @override
  State<_CircleTab> createState() => _CircleTabState();
}

class _CircleTabState extends State<_CircleTab> {
  List<Map<String, dynamic>> _items = const [];
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
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
        children: [
          _CommunityEmptyState(title: '圈子加载失败', subtitle: _error!, onRetry: _load),
        ],
      );
    }
    if (_items.isEmpty) {
      return ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
        children: [
          _CommunityEmptyState(
            title: '还没有圈子',
            subtitle: '点击右上角 + 创建第一个艺术圈子。',
            onRetry: _load,
          ),
        ],
      );
    }
    return GridView.builder(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
      itemCount: _items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.72,
      ),
      itemBuilder: (context, index) => _CircleCard(circle: _items[index]),
    );
  }
}

class _SalonTab extends StatefulWidget {
  final double bottom;

  const _SalonTab({super.key, required this.bottom});

  @override
  State<_SalonTab> createState() => _SalonTabState();
}

class _SalonTabState extends State<_SalonTab> {
  List<Map<String, dynamic>> _items = const [];
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
      final result = await BackendApiService.fetchEvents(limit: 30, type: 'salon');
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

  Future<void> _apply(String id) async {
    try {
      await BackendApiService.applyEvent(
        eventId: id,
        applyNote: '我想参加这个艺术沙龙。',
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('已提交沙龙报名')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('报名失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingIndicator();
    if (_error != null) {
      return ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
        children: [
          _CommunityEmptyState(title: '沙龙加载失败', subtitle: _error!, onRetry: _load),
        ],
      );
    }
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
      children: [
        if (_items.isEmpty)
          _CommunityEmptyState(
            title: '还没有沙龙',
            subtitle: '点击右上角 + 创建第一个沙龙。',
            onRetry: _load,
          )
        else
          ..._items.map(
            (salon) => Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: _SalonCard(
                salon: salon,
                onApply: () => _apply(salon['id'].toString()),
              ),
            ),
          ),
      ],
    );
  }
}

class _ChatTab extends StatefulWidget {
  final double bottom;

  const _ChatTab({required this.bottom});

  @override
  State<_ChatTab> createState() => _ChatTabState();
}

class _ChatTabState extends State<_ChatTab> {
  List<Map<String, dynamic>> _items = const [];
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
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
        children: [
          _CommunityEmptyState(
            title: '私信加载失败',
            subtitle: _error!.contains('401') || _error!.contains('未授权')
                ? '登录后可以查看真实合作邀约、圈子消息和沙龙沟通。'
                : _error!,
            onRetry: _load,
          ),
        ],
      );
    }
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
      children: [
        if (_items.isEmpty)
          _CommunityEmptyState(
            title: '暂无私信',
            subtitle: '有合作邀约、圈子消息或沙龙沟通时，会在这里显示。',
            onRetry: _load,
          )
        else
          ..._items.asMap().entries.map(
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

class _QaBlock extends StatelessWidget {
  final ({String title, String count, Color color, Color text}) block;
  final bool selected;
  final VoidCallback onTap;

  const _QaBlock({
    required this.block,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
        decoration: BoxDecoration(
          color: selected ? block.text : block.color,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? block.text : Colors.transparent,
            width: 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: block.text.withOpacity(0.22),
                    blurRadius: 18,
                    offset: const Offset(0, 10),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(selected ? 0.22 : 0.58),
                borderRadius: BorderRadius.circular(11),
              ),
              child: Icon(
                selected ? Icons.check_rounded : Icons.tag,
                color: selected ? Colors.white : block.text,
                size: 15,
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  block.title,
                  style: TextStyle(
                    color: selected ? Colors.white : block.text,
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  selected ? '已筛选' : block.count,
                  style: TextStyle(
                    color: selected
                        ? Colors.white.withOpacity(0.62)
                        : context.artC.ink.withOpacity(0.32),
                    fontWeight: FontWeight.w900,
                    fontSize: 9,
                    letterSpacing: 1.2,
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

  const _QuestionCard({required this.question});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: kCobalt,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '问答',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  question.title.isEmpty ? '未命名问题' : question.title,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 16,
                    height: 1.3,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    color: context.artC.ink,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.only(left: 10),
            decoration: BoxDecoration(
              border: Border(left: BorderSide(color: context.artC.silver, width: 2)),
            ),
            child: Text(
              (question.body ?? '').isEmpty
                  ? '还没有补充说明，点击进入后可以继续讨论。'
                  : question.body!,
              style: TextStyle(
                fontSize: 12,
                height: 1.45,
                color: context.artC.ink.withOpacity(0.48),
              ),
            ),
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              Text(
                '${question.authorNickname ?? 'Artsee 用户'} · ${question.commentCount} 人讨论 · ${question.likeCount} 赞',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: context.artC.ink.withOpacity(0.35),
                ),
              ),
              const Spacer(),
              _SmallButton(label: '收藏', dark: false),
              const SizedBox(width: 8),
              _SmallButton(label: '写回答', dark: true),
            ],
          ),
        ],
      ),
    );
  }
}

class _CircleCard extends StatelessWidget {
  final Map<String, dynamic> circle;

  const _CircleCard({required this.circle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: context.artC.silver.withOpacity(0.2),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Icon(Icons.groups_outlined, color: kCobalt, size: 24),
          ),
          const SizedBox(height: 12),
          Text(
            circle['title']?.toString() ?? '未命名圈子',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 15,
              height: 1.2,
              fontWeight: FontWeight.w900,
              fontStyle: FontStyle.italic,
              color: context.artC.ink,
              fontFamily: 'Noto Serif SC',
            ),
          ),
          const SizedBox(height: 6),
          Text(
            circle['subtitle']?.toString().isNotEmpty == true
                ? circle['subtitle'].toString()
                : circle['category']?.toString() ?? 'Art Circle',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 9,
              color: context.artC.ink.withOpacity(0.34),
              fontWeight: FontWeight.w900,
              letterSpacing: 1.0,
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
              Text(
                '${circle['member_count'] ?? 1} Members',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  color: context.artC.ink.withOpacity(0.38),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: context.artC.ink,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              '申请加入',
              style: TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SalonCard extends StatelessWidget {
  final Map<String, dynamic> salon;
  final VoidCallback onApply;

  const _SalonCard({required this.salon, required this.onApply});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: context.artC.silver.withOpacity(0.32)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 2.1,
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  salon['cover_url']?.toString().isNotEmpty == true
                      ? Image.network(
                          salon['cover_url'].toString(),
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
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
                    top: 16,
                    left: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: context.artC.ink.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        'LUXURY SOCIAL',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.6,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  salon['title']?.toString() ?? '未命名沙龙',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 20,
                    height: 1.18,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    color: context.artC.ink,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  salon['summary']?.toString().isNotEmpty == true
                      ? salon['summary'].toString()
                      : salon['description']?.toString() ?? '艺术沙龙与线下交流活动。',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.45,
                    color: context.artC.ink.withOpacity(0.44),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
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
                const SizedBox(height: 18),
                Row(
                  children: [
                    Text(
                      _formatForumFee(salon['fee_amount']),
                      style: TextStyle(
                        color: context.artC.ink,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: onApply,
                      child: const Text(
                        '立即预约 →',
                        style: TextStyle(
                          color: kCobalt,
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
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
        border: Border.all(color: dark ? context.artC.ink : context.artC.silver),
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
  final String title;
  final String subtitle;
  final VoidCallback onRetry;

  const _CommunityEmptyState({
    required this.title,
    required this.subtitle,
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
          Icon(Icons.forum_outlined, color: kCobalt.withOpacity(0.7), size: 34),
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
            child: _SmallButton(label: '刷新', dark: true),
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

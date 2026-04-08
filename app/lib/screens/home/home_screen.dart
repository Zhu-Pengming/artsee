import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../cases/case_detail_screen.dart';
import '../forum/post_detail_screen.dart';

/// ═══════════════════════════════════════════════════════════════
/// 青花瓷典藏版 - 首页
/// ═══════════════════════════════════════════════════════════════

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<AppCase> _cases = [];
  List<AppPost> _posts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([
      SupabaseService.fetchFeedCases(),
      SupabaseService.fetchFeedPosts(),
    ]);
    if (mounted) {
      setState(() {
        _cases = results[0] as List<AppCase>;
        _posts = results[1] as List<AppPost>;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kPorcelain,
      body: RefreshIndicator(
        color: kCobalt,
        backgroundColor: Colors.white,
        onRefresh: _load,
        child: CustomScrollView(
          slivers: [
            // ═══════════════════════════════════════════════════
            // 顶部导航栏（青花瓷风格）
            // ═══════════════════════════════════════════════════
            SliverAppBar(
              floating: true,
              snap: true,
              backgroundColor: Colors.white,
              elevation: 0,
              title: Row(
                children: [
                  // Logo 图标
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: kCobalt,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Center(
                      child: Text(
                        '艺',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          fontFamily: 'PingFang SC',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    '艺见心',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: kInk,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              actions: [
                // 通知按钮
                Container(
                  margin: const EdgeInsets.only(right: 8),
                  child: IconButton(
                    icon: Stack(
                      children: [
                        Icon(Icons.notifications_outlined, color: kInk.withOpacity(0.5), size: 24),
                        Positioned(
                          top: 2,
                          right: 2,
                          child: Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ],
                    ),
                    onPressed: () {},
                  ),
                ),
              ],
            ),

            if (_loading)
              const SliverFillRemaining(child: LoadingIndicator())
            else ...[
              // ═══════════════════════════════════════════════════
              // Hero Banner（青花瓷风格）
              // ═══════════════════════════════════════════════════
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                  child: Container(
                    height: 160,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [kCobalt, kCobaltMuted],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(kRadiusLarge),
                      boxShadow: [
                        BoxShadow(
                          color: kCobalt.withOpacity(0.2),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Stack(
                      children: [
                        // 装饰性背景图案
                        Positioned(
                          right: -20,
                          top: -20,
                          child: Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  '今日精选',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.white70,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 10),
                              const Text(
                                '2026秋季英国艺术留学\n申请季正式开启',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                  height: 1.4,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Text(
                                    '牛津 · 剑桥 · UCL · CSM',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.white70,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Icon(
                                    Icons.arrow_forward,
                                    size: 12,
                                    color: Colors.white.withOpacity(0.7),
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
              ),

              // ═══════════════════════════════════════════════════
              // 快捷入口网格（8个图标）
              // ═══════════════════════════════════════════════════
              SliverToBoxAdapter(child: _QuickAccessGrid()),

              // ═══════════════════════════════════════════════════
              // 学校 Stories
              // ═══════════════════════════════════════════════════
              SliverToBoxAdapter(child: _SchoolStories()),

              // ═══════════════════════════════════════════════════
              // 内容标题
              // ═══════════════════════════════════════════════════
              const SliverToBoxAdapter(
                child: SectionHeader(title: '发现 · 精选', action: '查看全部'),
              ),

              // ═══════════════════════════════════════════════════
              // 混合内容流
              // ═══════════════════════════════════════════════════
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) {
                    final caseIdx = i ~/ 2;
                    final postIdx = i ~/ 2;
                    if (i.isEven && caseIdx < _cases.length) {
                      return _CaseFeedCard(
                        c: _cases[caseIdx],
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CaseDetailScreen(caseId: _cases[caseIdx].id),
                            ),
                          );
                        },
                      );
                    } else if (i.isOdd && postIdx < _posts.length) {
                      return _PostFeedCard(
                        p: _posts[postIdx],
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PostDetailScreen(postId: _posts[postIdx].id),
                            ),
                          );
                        },
                      );
                    }
                    return null;
                  },
                  childCount: (_cases.length + _posts.length),
                ),
              ),

              // 底部留白
              const SliverToBoxAdapter(child: SizedBox(height: 20)),
            ],
          ],
        ),
      ),
    );
  }
}

/// ═══════════════════════════════════════════════════════════════
/// 快捷入口网格（青花瓷风格）
/// ═══════════════════════════════════════════════════════════════
class _QuickAccessGrid extends StatelessWidget {
  final List<_QuickItem> items = const [
    _QuickItem(name: '艺术家库', icon: Icons.people_outline),
    _QuickItem(name: '院校入驻', icon: Icons.apartment_outlined),
    _QuickItem(name: '展览报名', icon: Icons.event_outlined),
    _QuickItem(name: '联名合作', icon: Icons.handshake_outlined),
    _QuickItem(name: '作品集指导', icon: Icons.folder_outlined),
    _QuickItem(name: '国际资讯', icon: Icons.language_outlined),
    _QuickItem(name: '艺术问答', icon: Icons.help_outline),
    _QuickItem(name: '线下活动', icon: Icons.location_on_outlined),
  ];

  const _QuickAccessGrid();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: items.map((item) => _buildItem(item)).toList(),
      ),
    );
  }

  Widget _buildItem(_QuickItem item) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: kSilver.withOpacity(0.5),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(item.icon, size: 22, color: kInk.withOpacity(0.6)),
        ),
        const SizedBox(height: 6),
        Text(
          item.name,
          style: TextStyle(
            fontSize: 9,
            color: kInk.withOpacity(0.7),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _QuickItem {
  final String name;
  final IconData icon;
  const _QuickItem({required this.name, required this.icon});
}

/// ═══════════════════════════════════════════════════════════════
/// 学校 Stories（青花瓷风格）
/// ═══════════════════════════════════════════════════════════════
class _SchoolStories extends StatelessWidget {
  final List<Map<String, String>> schools = const [
    {'name': '牛津大学', 'initial': 'Ox'},
    {'name': '剑桥大学', 'initial': 'Cam'},
    {'name': '中央圣马丁', 'initial': 'CSM'},
    {'name': 'UCL', 'initial': 'UCL'},
    {'name': '皇家艺术学院', 'initial': 'RCA'},
    {'name': '爱丁堡大学', 'initial': 'Edin'},
  ];

  const _SchoolStories();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: schools.length,
        itemBuilder: (ctx, i) {
          final s = schools[i];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: schoolGradient(s['name']),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 3),
                    boxShadow: [
                      BoxShadow(
                        color: kInk.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      s['initial']!,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  s['name']!,
                  style: TextStyle(
                    fontSize: 10,
                    color: kInk.withOpacity(0.7),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// ═══════════════════════════════════════════════════════════════
/// 案例卡片（青花瓷风格）
/// ═══════════════════════════════════════════════════════════════
class _CaseFeedCard extends StatelessWidget {
  final AppCase c;
  final VoidCallback onTap;

  const _CaseFeedCard({required this.c, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(kRadiusLarge),
          boxShadow: [
            BoxShadow(
              color: kInk.withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 图片区域
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(kRadiusLarge)),
              child: Container(
                height: 150,
                decoration: BoxDecoration(
                  gradient: schoolGradient(c.targetSchool),
                ),
                child: Stack(
                  children: [
                    // 类型标签
                    Positioned(
                      top: 14,
                      left: 14,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: kCobalt,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          '案例',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    // 学校标签
                    if (c.targetSchool != null)
                      Positioned(
                        bottom: 14,
                        left: 14,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            c.targetSchool!,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            // 内容区域
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: kInk,
                      height: 1.4,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (c.excerpt != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      c.excerpt!,
                      style: TextStyle(
                        fontSize: 12,
                        color: kInk.withOpacity(0.5),
                        height: 1.5,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 12),
                  // 底部信息栏
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 12,
                        backgroundColor: kCobalt,
                        child: Text(
                          c.isAnonymous ? '匿' : (c.authorNickname?.substring(0, 1) ?? '?'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        c.isAnonymous ? '匿名' : (c.authorNickname ?? '用户'),
                        style: TextStyle(
                          fontSize: 12,
                          color: kInk.withOpacity(0.6),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text('·', style: TextStyle(color: kInk.withOpacity(0.3))),
                      const SizedBox(width: 6),
                      Text(
                        timeAgo(c.createdAt),
                        style: TextStyle(
                          fontSize: 11,
                          color: kInk.withOpacity(0.4),
                        ),
                      ),
                      const Spacer(),
                      Icon(Icons.favorite_border, size: 14, color: kInk.withOpacity(0.3)),
                      const SizedBox(width: 4),
                      Text(
                        '${c.likeCount}',
                        style: TextStyle(
                          fontSize: 11,
                          color: kInk.withOpacity(0.4),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.chat_bubble_outline, size: 14, color: kInk.withOpacity(0.3)),
                      const SizedBox(width: 4),
                      Text(
                        '${c.commentCount}',
                        style: TextStyle(
                          fontSize: 11,
                          color: kInk.withOpacity(0.4),
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

/// ═══════════════════════════════════════════════════════════════
/// 帖子卡片（青花瓷风格）
/// ═══════════════════════════════════════════════════════════════
class _PostFeedCard extends StatelessWidget {
  final AppPost p;
  final VoidCallback onTap;

  const _PostFeedCard({required this.p, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final typeColors = {
      'question': kCobalt,
      'discussion': kCobaltMuted,
      'news': const Color(0xFF4A6FA5),
    };
    final typeLabels = {'question': '问答', 'discussion': '讨论', 'news': '资讯'};
    final color = typeColors[p.type] ?? kCobalt;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(kRadiusLarge),
          boxShadow: [
            BoxShadow(
              color: kInk.withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 顶部类型条
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(kRadiusLarge)),
              child: Container(
                height: 70,
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [color, color.withOpacity(0.8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        typeLabels[p.type] ?? '讨论',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      p.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        height: 1.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
            // 内容区域
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (p.content != null) ...[
                    Text(
                      p.content!,
                      style: TextStyle(
                        fontSize: 12,
                        color: kInk.withOpacity(0.6),
                        height: 1.5,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 12),
                  ],
                  // 底部信息栏
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 12,
                        backgroundColor: kSilver,
                        child: Text(
                          p.authorNickname?.substring(0, 1) ?? '?',
                          style: TextStyle(
                            fontSize: 10,
                            color: kInk.withOpacity(0.7),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        p.authorNickname ?? '用户',
                        style: TextStyle(
                          fontSize: 12,
                          color: kInk.withOpacity(0.6),
                        ),
                      ),
                      const Spacer(),
                      Icon(Icons.favorite_border, size: 14, color: kInk.withOpacity(0.3)),
                      const SizedBox(width: 4),
                      Text(
                        '${p.likeCount}',
                        style: TextStyle(
                          fontSize: 11,
                          color: kInk.withOpacity(0.4),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.chat_bubble_outline, size: 14, color: kInk.withOpacity(0.3)),
                      const SizedBox(width: 4),
                      Text(
                        '${p.answerCount}',
                        style: TextStyle(
                          fontSize: 11,
                          color: kInk.withOpacity(0.4),
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

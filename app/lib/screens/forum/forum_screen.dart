import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import 'post_detail_screen.dart';
import 'new_post_screen.dart';

/// ═══════════════════════════════════════════════════════════════
/// 青花瓷典藏版 - 学习（论坛）
/// ═══════════════════════════════════════════════════════════════

class ForumScreen extends StatefulWidget {
  const ForumScreen({super.key});

  @override
  State<ForumScreen> createState() => _ForumScreenState();
}

class _ForumScreenState extends State<ForumScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<AppPost> _posts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() { if (!_tabController.indexIsChanging) _loadForTab(); });
    _load('question');
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadForTab() async {
    final types = ['question', 'discussion', 'news'];
    await _load(types[_tabController.index]);
  }

  Future<void> _load(String type) async {
    setState(() => _loading = true);
    final data = await SupabaseService.fetchPosts(type: type);
    if (mounted) setState(() { _posts = data; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = mainTabBottomInset(context);
    return Scaffold(
      backgroundColor: kPorcelain,
      appBar: AppBar(
        title: const Text(
          '学习中心',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: kInk,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          // 发帖按钮
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: GestureDetector(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NewPostScreen()),
              ).then((_) => _loadForTab()),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: kCobalt,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.edit, color: Colors.white, size: 14),
                    SizedBox(width: 4),
                    Text(
                      '发帖',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: kCobalt,
          unselectedLabelColor: kInk.withOpacity(0.4),
          indicatorColor: kCobalt,
          indicatorWeight: 2.5,
          indicatorSize: TabBarIndicatorSize.label,
          labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          unselectedLabelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
          tabs: const [
            Tab(text: '问答'),
            Tab(text: '讨论'),
            Tab(text: '资讯'),
          ],
        ),
      ),
      body: RefreshIndicator(
        color: kCobalt,
        backgroundColor: Colors.white,
        onRefresh: _loadForTab,
        child: _loading
          ? const LoadingIndicator()
          : _posts.isEmpty
            ? const EmptyState(emoji: '💬', message: '还没有内容，来发第一帖！')
            : ListView.builder(
                padding: EdgeInsets.fromLTRB(0, 8, 0, bottomPad),
                itemCount: _posts.length,
                itemBuilder: (ctx, i) => _PostCard(
                  post: _posts[i],
                  onTap: () => Navigator.push(ctx, MaterialPageRoute(
                    builder: (_) => PostDetailScreen(postId: _posts[i].id),
                  )),
                ),
              ),
      ),
    );
  }
}

/// ═══════════════════════════════════════════════════════════════
/// 帖子卡片（青花瓷风格）
/// ═══════════════════════════════════════════════════════════════
class _PostCard extends StatelessWidget {
  final AppPost post;
  final VoidCallback onTap;

  const _PostCard({required this.post, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final typeStyle = {
      'question': (label: '问答', color: kCobalt),
      'discussion': (label: '讨论', color: kCobaltMuted),
      'news': (label: '资讯', color: const Color(0xFF4A6FA5)),
    };
    final ts = typeStyle[post.type] ?? typeStyle['discussion']!;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(kRadiusLarge),
          boxShadow: [
            BoxShadow(
              color: kInk.withOpacity(0.03),
              blurRadius: 12,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 用户信息
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: kCobalt,
                  child: Text(
                    post.authorNickname?.substring(0, 1) ?? '?',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  post.authorNickname ?? '用户',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: kInk,
                  ),
                ),
                if (post.isMentorPost) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: kCobalt.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified, size: 11, color: kCobalt),
                        const SizedBox(width: 2),
                        const Text(
                          '导师',
                          style: TextStyle(
                            fontSize: 9,
                            color: kCobalt,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const Spacer(),
                Text(
                  timeAgo(post.createdAt),
                  style: TextStyle(
                    fontSize: 11,
                    color: kInk.withOpacity(0.4),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // 标题和类型
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: ts.color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    ts.label,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: ts.color,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    post.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: kInk,
                      height: 1.4,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            if (post.content != null) ...[
              const SizedBox(height: 8),
              Text(
                post.content!,
                style: TextStyle(
                  fontSize: 12,
                  color: kInk.withOpacity(0.6),
                  height: 1.5,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            if (post.tags.isNotEmpty) ...[
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                children: post.tags.take(3).map((t) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: kSilver.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '#$t',
                    style: TextStyle(
                      fontSize: 10,
                      color: kInk.withOpacity(0.6),
                    ),
                  ),
                )).toList(),
              ),
            ],
            const SizedBox(height: 12),
            // 互动数据
            Row(
              children: [
                Icon(Icons.thumb_up_outlined, size: 14, color: kInk.withOpacity(0.3)),
                const SizedBox(width: 4),
                Text(
                  '${post.likeCount}',
                  style: TextStyle(
                    fontSize: 11,
                    color: kInk.withOpacity(0.4),
                  ),
                ),
                const SizedBox(width: 16),
                Icon(Icons.chat_bubble_outline, size: 14, color: kInk.withOpacity(0.3)),
                const SizedBox(width: 4),
                Text(
                  '${post.answerCount} 回答',
                  style: TextStyle(
                    fontSize: 11,
                    color: kInk.withOpacity(0.4),
                  ),
                ),
                const SizedBox(width: 16),
                Icon(Icons.visibility_outlined, size: 14, color: kInk.withOpacity(0.3)),
                const SizedBox(width: 4),
                Text(
                  '${post.viewCount}',
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
    );
  }
}

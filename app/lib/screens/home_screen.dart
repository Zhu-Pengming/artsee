import 'package:flutter/material.dart';
import '../main.dart';
import '../data/mock_data.dart';

/// 首页 - 发现流混合推荐
/// 包含：推荐内容轮播、热门院校、最新案例、话题讨论
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentBannerIndex = 0;

  @override
  Widget build(BuildContext context) {
    final newsList = MockData.getNews();
    final posts = MockData.getPosts();
    final schools = MockData.getSchools();

    return Scaffold(
      backgroundColor: PorcelainColors.porcelainWhite,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // 顶部导航
            SliverToBoxAdapter(
              child: _buildHeader(),
            ),

            // 轮播横幅 - 最新资讯
            SliverToBoxAdapter(
              child: _buildBanner(newsList),
            ),

            // 快捷入口
            SliverToBoxAdapter(
              child: _buildQuickActions(),
            ),
            SliverToBoxAdapter(
              child: _buildConsultingHighlights(),
            ),
            SliverToBoxAdapter(
              child: _buildSessionCTA(),
            ),

            // 热门院校
            SliverToBoxAdapter(
              child: _buildSectionTitle('热门院校', onMoreTap: () {}),
            ),
            SliverToBoxAdapter(
              child: _buildSchoolList(schools.take(4).toList()),
            ),

            // 推荐内容
            SliverToBoxAdapter(
              child: _buildSectionTitle('推荐内容', onMoreTap: () {}),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _buildPostCard(posts[index]),
                  childCount: posts.length,
                ),
              ),
            ),

            const SliverPadding(padding: EdgeInsets.only(bottom: 32)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Logo
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  PorcelainColors.porcelainDeep,
                  PorcelainColors.porcelain,
                ],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.palette_outlined,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '艺见心',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: PorcelainColors.inkBlack,
                  ),
                ),
                Text(
                  '发现艺术的无限可能',
                  style: TextStyle(
                    fontSize: 12,
                    color: PorcelainColors.inkGray,
                  ),
                ),
              ],
            ),
          ),
          // 搜索按钮
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.search,
              color: PorcelainColors.inkGray,
            ),
          ),
          // 消息按钮
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.notifications_outlined,
              color: PorcelainColors.inkGray,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBanner(List<News> newsList) {
    return SizedBox(
      height: 180,
      child: PageView.builder(
        onPageChanged: (index) {
          setState(() {
            _currentBannerIndex = index;
          });
        },
        itemCount: newsList.length,
        itemBuilder: (context, index) {
          final news = newsList[index];
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  PorcelainColors.porcelainDeep,
                  PorcelainColors.porcelain,
                ],
              ),
            ),
            child: Stack(
              children: [
                Positioned(
                  right: -20,
                  bottom: -20,
                  child: Container(
                    width: 150,
                    height: 150,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          '最新资讯',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        news.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        news.summary,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 13,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {'icon': Icons.school_outlined, 'label': '院校库', 'color': PorcelainColors.porcelain},
      {'icon': Icons.work_outline, 'label': '作品集', 'color': PorcelainColors.porcelainDark},
      {'icon': Icons.people_outline, 'label': '导师', 'color': PorcelainColors.porcelainLight},
      {'icon': Icons.help_outline, 'label': '问答', 'color': PorcelainColors.porcelainPale},
      {'icon': Icons.article_outlined, 'label': '资讯', 'color': PorcelainColors.porcelain},
    ];

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: actions.map((action) {
          return GestureDetector(
            onTap: () {},
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: (action['color'] as Color).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    action['icon'] as IconData,
                    color: action['color'] as Color,
                    size: 28,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  action['label'] as String,
                  style: const TextStyle(
                    fontSize: 12,
                    color: PorcelainColors.inkGray,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSectionTitle(String title, {required VoidCallback onMoreTap}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: PorcelainColors.inkBlack,
            ),
          ),
          GestureDetector(
            onTap: onMoreTap,
            child: Row(
              children: [
                Text(
                  '更多',
                  style: TextStyle(
                    fontSize: 13,
                    color: PorcelainColors.porcelain,
                  ),
                ),
                Icon(
                  Icons.chevron_right,
                  size: 16,
                  color: PorcelainColors.porcelain,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConsultingHighlights() {
    final items = [
      {'label': '认证导师', 'value': '120+', 'icon': Icons.verified_outlined},
      {'label': '本周可约', 'value': '38位', 'icon': Icons.event_available_outlined},
      {'label': '平均回复', 'value': '<2小时', 'icon': Icons.bolt_outlined},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: items.map((item) {
          return Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: PorcelainColors.porcelainCream),
              ),
              child: Column(
                children: [
                  Icon(item['icon'] as IconData, size: 18, color: PorcelainColors.porcelain),
                  const SizedBox(height: 6),
                  Text(
                    item['value'] as String,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: PorcelainColors.inkBlack,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item['label'] as String,
                    style: const TextStyle(fontSize: 11, color: PorcelainColors.inkLight),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSessionCTA() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [PorcelainColors.porcelainDeep, PorcelainColors.porcelain],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            const Icon(Icons.support_agent_outlined, color: Colors.white, size: 28),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '1v1 导师咨询',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  SizedBox(height: 4),
                  Text(
                    '按目标院校和专业快速匹配导师，支持预约与复盘',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () {},
              style: TextButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: PorcelainColors.porcelainDeep,
              ),
              child: const Text('立即预约'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSchoolList(List<School> schools) {
    return SizedBox(
      height: 180,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: schools.length,
        itemBuilder: (context, index) {
          final school = schools[index];
          return Container(
            width: 140,
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: PorcelainColors.porcelain.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 80,
                  decoration: BoxDecoration(
                    color: PorcelainColors.porcelainMuted,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(16),
                    ),
                  ),
                  child: Center(
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          school.name.substring(0, 1),
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: PorcelainColors.porcelain,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        school.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: PorcelainColors.inkBlack,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${school.country} · QS ${school.qsRank}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: PorcelainColors.inkLight,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: PorcelainColors.porcelainMuted,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${school.programs.length}个专业',
                          style: const TextStyle(
                            fontSize: 11,
                            color: PorcelainColors.porcelain,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPostCard(Post post) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: PorcelainColors.porcelain.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 作者信息
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: PorcelainColors.porcelainMuted,
                  child: Text(
                    post.author.nickname.substring(0, 1),
                    style: const TextStyle(
                      color: PorcelainColors.porcelain,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        post.author.nickname,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: PorcelainColors.inkBlack,
                        ),
                      ),
                      Text(
                        _getPostTypeLabel(post.type),
                        style: TextStyle(
                          fontSize: 12,
                          color: PorcelainColors.porcelain,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // 内容
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  post.title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: PorcelainColors.inkBlack,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  post.content,
                  style: const TextStyle(
                    fontSize: 13,
                    color: PorcelainColors.inkGray,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          // 图片
          if (post.images.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 160,
                  color: PorcelainColors.porcelainMuted,
                  child: Center(
                    child: Icon(
                      Icons.image,
                      color: PorcelainColors.porcelain.withOpacity(0.5),
                      size: 48,
                    ),
                  ),
                ),
              ),
            ),
          // 标签和互动
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: Wrap(
                    spacing: 8,
                    children: post.tags.take(3).map((tag) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: PorcelainColors.porcelainMuted,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '#$tag',
                          style: const TextStyle(
                            fontSize: 11,
                            color: PorcelainColors.porcelain,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                Row(
                  children: [
                    Icon(
                      Icons.favorite_outline,
                      size: 18,
                      color: PorcelainColors.inkLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${post.likes}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: PorcelainColors.inkLight,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Icon(
                      Icons.chat_bubble_outline,
                      size: 18,
                      color: PorcelainColors.inkLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${post.comments}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: PorcelainColors.inkLight,
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

  String _getPostTypeLabel(String type) {
    switch (type) {
      case 'offer':
        return '录取分享';
      case 'portfolio':
        return '作品集';
      case 'question':
        return '提问';
      case 'article':
        return '文章';
      default:
        return '动态';
    }
  }
}

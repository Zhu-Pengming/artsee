import 'package:flutter/material.dart';
import '../main.dart';
import '../data/mock_data.dart';

/// 个人中心页面 - 申请进度/收藏/交易记录/个人资料
/// 功能：申请进度管理、作品集管理、收藏内容、交易记录、设置
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

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

  @override
  Widget build(BuildContext context) {
    final user = MockData.getCurrentUser();
    final progress = MockData.getApplicationProgress();

    return Scaffold(
      backgroundColor: PorcelainColors.porcelainWhite,
      body: SafeArea(
        child: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) {
            return [
              // 用户信息头部
              SliverToBoxAdapter(
                child: _buildUserHeader(user),
              ),
              // 数据统计
              SliverToBoxAdapter(
                child: _buildStatsRow(user),
              ),
              SliverToBoxAdapter(
                child: _buildIdentityCard(user),
              ),
              // 申请进度卡片
              SliverToBoxAdapter(
                child: _buildApplicationProgress(progress),
              ),
              // Tab栏
              SliverPersistentHeader(
                pinned: true,
                delegate: _SliverTabBarDelegate(
                  TabBar(
                    controller: _tabController,
                    labelColor: PorcelainColors.porcelain,
                    unselectedLabelColor: PorcelainColors.inkLight,
                    indicatorColor: PorcelainColors.porcelain,
                    indicatorWeight: 3,
                    tabs: const [
                      Tab(text: '申请进度'),
                      Tab(text: '我的作品'),
                      Tab(text: '收藏'),
                    ],
                  ),
                ),
              ),
            ];
          },
          body: TabBarView(
            controller: _tabController,
            children: [
              _buildApplicationTab(),
              _buildPortfolioTab(),
              _buildCollectionTab(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUserHeader(User user) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          // 头像
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  PorcelainColors.porcelain,
                  PorcelainColors.porcelainLight,
                ],
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: PorcelainColors.porcelain.withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Center(
              child: Text(
                user.nickname.substring(0, 1),
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 20),
          // 用户信息
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.nickname,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: PorcelainColors.inkBlack,
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: PorcelainColors.porcelainMuted,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${user.role == 'student' ? '学生' : '艺术家'} · ${user.country}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: PorcelainColors.porcelain,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '目标院校: ${user.targetSchools.join(", ")}',
                  style: const TextStyle(
                    fontSize: 13,
                    color: PorcelainColors.inkGray,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          // 设置按钮
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.settings_outlined,
              color: PorcelainColors.inkGray,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow(User user) {
    final stats = [
      {'label': '作品集', 'value': '${user.portfolioCount}'},
      {'label': '粉丝', 'value': '${user.followers}'},
      {'label': '关注', 'value': '${user.following}'},
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.symmetric(vertical: 16),
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
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: stats.map((stat) {
          return GestureDetector(
            onTap: () {},
            child: Column(
              children: [
                Text(
                  stat['value']!,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: PorcelainColors.inkBlack,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  stat['label']!,
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

  Widget _buildApplicationProgress(List<ApplicationProgress> progress) {
    final inProgress = progress.where((p) => p.status != 'offer').toList();
    final completed = progress.where((p) => p.status == 'offer').toList();

    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            PorcelainColors.porcelain,
            PorcelainColors.porcelainLight,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.school_outlined,
                color: Colors.white,
              ),
              SizedBox(width: 8),
              Text(
                '申请进度',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildProgressStat(
                  label: '进行中',
                  value: '${inProgress.length}',
                ),
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withOpacity(0.3),
              ),
              Expanded(
                child: _buildProgressStat(
                  label: '已录取',
                  value: '${completed.length}',
                ),
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withOpacity(0.3),
              ),
              Expanded(
                child: _buildProgressStat(
                  label: '总申请',
                  value: '${progress.length}',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIdentityCard(User user) {
    final completion = ((user.portfolioCount / 15) * 100).clamp(40, 100).toInt();
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: PorcelainColors.porcelainCream),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.verified_user_outlined, size: 18, color: PorcelainColors.porcelain),
              SizedBox(width: 6),
              Text(
                '身份与可信度',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: PorcelainColors.inkBlack),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: const [
              _IdentityTag(label: '手机号已验证'),
              _IdentityTag(label: '申请身份已认证'),
              _IdentityTag(label: '作品集已上传'),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '资料完整度 $completion%',
            style: const TextStyle(fontSize: 12, color: PorcelainColors.inkGray),
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: completion / 100,
              minHeight: 6,
              backgroundColor: PorcelainColors.porcelainMuted,
              valueColor: const AlwaysStoppedAnimation<Color>(PorcelainColors.porcelain),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressStat({required String label, required String value}) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildApplicationTab() {
    final progress = MockData.getApplicationProgress();

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: progress.length,
      itemBuilder: (context, index) {
        return _buildApplicationCard(progress[index]);
      },
    );
  }

  Widget _buildApplicationCard(ApplicationProgress app) {
    final statusColor = _getStatusColor(app.status);
    final statusText = _getStatusText(app.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
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
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      app.schoolName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: PorcelainColors.inkBlack,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      app.programName,
                      style: const TextStyle(
                        fontSize: 13,
                        color: PorcelainColors.inkGray,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    fontSize: 12,
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // 进度条
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: app.progress / 100,
              backgroundColor: PorcelainColors.porcelainMuted,
              valueColor: AlwaysStoppedAnimation<Color>(
                app.status == 'offer'
                    ? PorcelainColors.porcelainSuccess
                    : PorcelainColors.porcelain,
              ),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '进度 ${app.progress}%',
                style: const TextStyle(
                  fontSize: 12,
                  color: PorcelainColors.inkLight,
                ),
              ),
              Text(
                '${app.tasks.where((t) => t.status == 'completed').length}/${app.tasks.length} 任务完成',
                style: const TextStyle(
                  fontSize: 12,
                  color: PorcelainColors.inkLight,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // 待办任务
          ...app.tasks.where((t) => t.status != 'completed').take(2).map((task) {
            return Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Row(
                children: [
                  Icon(
                    Icons.circle_outlined,
                    size: 14,
                    color: task.priority == 'high'
                        ? PorcelainColors.porcelainDanger
                        : PorcelainColors.inkLight,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      task.title,
                      style: const TextStyle(
                        fontSize: 13,
                        color: PorcelainColors.inkGray,
                      ),
                    ),
                  ),
                  Text(
                    task.deadline,
                    style: const TextStyle(
                      fontSize: 11,
                      color: PorcelainColors.inkLight,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'preparing':
        return PorcelainColors.inkLight;
      case 'submitted':
        return PorcelainColors.porcelain;
      case 'interview':
        return PorcelainColors.porcelainWarning;
      case 'offer':
        return PorcelainColors.porcelainSuccess;
      case 'rejected':
        return PorcelainColors.porcelainDanger;
      default:
        return PorcelainColors.inkLight;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'preparing':
        return '准备中';
      case 'submitted':
        return '已提交';
      case 'interview':
        return '面试中';
      case 'offer':
        return '已录取';
      case 'rejected':
        return '未录取';
      default:
        return '未知';
    }
  }

  Widget _buildPortfolioTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.folder_open_outlined,
            size: 64,
            color: PorcelainColors.inkMuted,
          ),
          const SizedBox(height: 16),
          const Text(
            '暂无作品',
            style: TextStyle(
              fontSize: 16,
              color: PorcelainColors.inkGray,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: PorcelainColors.porcelain,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('上传作品'),
          ),
        ],
      ),
    );
  }

  Widget _buildCollectionTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // 收藏分类
        _buildCollectionCategory(
          icon: Icons.school_outlined,
          title: '收藏的院校',
          count: 5,
          color: PorcelainColors.porcelain,
        ),
        const SizedBox(height: 12),
        _buildCollectionCategory(
          icon: Icons.article_outlined,
          title: '收藏的文章',
          count: 12,
          color: PorcelainColors.porcelainDark,
        ),
        const SizedBox(height: 12),
        _buildCollectionCategory(
          icon: Icons.work_outline,
          title: '收藏的作品集',
          count: 8,
          color: PorcelainColors.porcelainLight,
        ),
        const SizedBox(height: 12),
        _buildCollectionCategory(
          icon: Icons.palette_outlined,
          title: '收藏的艺术品',
          count: 3,
          color: PorcelainColors.porcelainPale,
        ),
      ],
    );
  }

  Widget _buildCollectionCategory({
    required IconData icon,
    required String title,
    required int count,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
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
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: color,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: PorcelainColors.inkBlack,
              ),
            ),
          ),
          Text(
            '$count',
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: PorcelainColors.porcelain,
            ),
          ),
          const SizedBox(width: 8),
          const Icon(
            Icons.chevron_right,
            color: PorcelainColors.inkLight,
          ),
        ],
      ),
    );
  }
}

// 自定义SliverTabBarDelegate
class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;

  _SliverTabBarDelegate(this.tabBar);

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: PorcelainColors.porcelainWhite,
      child: tabBar,
    );
  }

  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  double get minExtent => tabBar.preferredSize.height;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) {
    return false;
  }
}

class _IdentityTag extends StatelessWidget {
  final String label;
  const _IdentityTag({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: PorcelainColors.porcelainMuted,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 11, color: PorcelainColors.inkGray),
      ),
    );
  }
}

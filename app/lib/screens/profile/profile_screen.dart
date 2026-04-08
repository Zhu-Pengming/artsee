import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../auth/login_screen.dart';
import '../cases/case_detail_screen.dart';

/// ═══════════════════════════════════════════════════════════════
/// 青花瓷典藏版 - 我的（个人中心）
/// ═══════════════════════════════════════════════════════════════

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  List<AppCase> _myCases = [];
  bool _loading = true;
  int _tabIndex = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!SupabaseService.isLoggedIn) {
      if (mounted) setState(() => _loading = false);
      return;
    }
    final results = await Future.wait([
      SupabaseService.fetchProfile(),
      SupabaseService.fetchMyCases(),
    ]);
    if (mounted) {
      setState(() {
        _profile = results[0] as Map<String, dynamic>?;
        _myCases = results[1] as List<AppCase>;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!SupabaseService.isLoggedIn) {
      return _NotLoggedInView();
    }

    return Scaffold(
      backgroundColor: kPorcelain,
      body: RefreshIndicator(
        color: kCobalt,
        backgroundColor: Colors.white,
        onRefresh: _load,
        child: CustomScrollView(
          slivers: [
            // ═══════════════════════════════════════════════════
            // 顶部背景（青花瓷风格）
            // ═══════════════════════════════════════════════════
            SliverToBoxAdapter(child: _buildHeader()),

            // ═══════════════════════════════════════════════════
            // 统计数据
            // ═══════════════════════════════════════════════════
            SliverToBoxAdapter(child: _buildStats()),

            // ═══════════════════════════════════════════════════
            // 快捷操作
            // ═══════════════════════════════════════════════════
            SliverToBoxAdapter(child: _buildQuickActions()),

            // ═══════════════════════════════════════════════════
            // Tab 选择器
            // ═══════════════════════════════════════════════════
            SliverToBoxAdapter(child: _buildTabs()),

            // ═══════════════════════════════════════════════════
            // Tab 内容
            // ═══════════════════════════════════════════════════
            if (_loading)
              const SliverFillRemaining(child: LoadingIndicator())
            else
              SliverToBoxAdapter(child: _buildTabContent()),

            // 底部留白
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final nickname = _profile?['nickname'] as String? ?? '艺见用户';
    final bio = _profile?['bio'] as String? ?? '目标：英国艺术院校';

    return Stack(
      clipBehavior: Clip.none,
      children: [
        // 背景渐变
        Container(
          height: 140,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [kCobalt, kCobaltMuted],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        // 设置按钮
        Positioned(
          top: 8,
          right: 8,
          child: SafeArea(
            child: IconButton(
              icon: const Icon(Icons.settings_outlined, color: Colors.white70),
              onPressed: () async {
                await SupabaseService.signOut();
                setState(() { _profile = null; _myCases = []; });
              },
            ),
          ),
        ),
        // 头像
        Positioned(
          bottom: -40,
          left: 24,
          child: Container(
            width: 84,
            height: 84,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              border: Border.all(color: Colors.white, width: 4),
              boxShadow: [
                BoxShadow(
                  color: kInk.withOpacity(0.1),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                '艺',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                  color: kCobalt,
                ),
              ),
            ),
          ),
        ),
        // 用户信息
        Positioned(
          bottom: 16,
          left: 120,
          right: 16,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                nickname,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                bio,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withOpacity(0.7),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStats() {
    final following = _profile?['following_count'] as int? ?? 0;
    final followers = _profile?['followers_count'] as int? ?? 0;

    return Container(
      margin: const EdgeInsets.only(top: 52),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
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
      child: Row(
        children: [
          _buildStatItem('关注', '$following'),
          Container(
            width: 1,
            height: 30,
            color: kSilver,
          ),
          _buildStatItem('粉丝', '$followers'),
          Container(
            width: 1,
            height: 30,
            color: kSilver,
          ),
          _buildStatItem('案例', '${_myCases.length}'),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: kCobalt,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: kInk.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      _QuickActionData(icon: Icons.school_outlined, label: '选校清单', color: kCobalt),
      _QuickActionData(icon: Icons.favorite_outline, label: '我的收藏', color: const Color(0xFFE11D48)),
      _QuickActionData(icon: Icons.description_outlined, label: '文书草稿', color: const Color(0xFF7C3AED)),
      _QuickActionData(icon: Icons.add, label: '分享案例', color: const Color(0xFF10B981)),
    ];

    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.symmetric(vertical: 20),
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
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: actions.map((a) => _buildQuickAction(a)).toList(),
      ),
    );
  }

  Widget _buildQuickAction(_QuickActionData action) {
    return Column(
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: action.color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(action.icon, color: action.color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(
          action.label,
          style: TextStyle(
            fontSize: 11,
            color: kInk.withOpacity(0.7),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildTabs() {
    final tabs = ['申请追踪', '我的案例'];
    return Container(
      margin: const EdgeInsets.only(top: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(kRadiusLarge),
      ),
      child: Row(
        children: List.generate(tabs.length, (i) => Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _tabIndex = i),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: _tabIndex == i ? kCobalt : Colors.transparent,
                    width: 2,
                  ),
                ),
              ),
              child: Text(
                tabs[i],
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: _tabIndex == i ? kCobalt : kInk.withOpacity(0.4),
                ),
              ),
            ),
          ),
        )),
      ),
    );
  }

  Widget _buildTabContent() {
    if (_tabIndex == 0) {
      return Container(
        margin: const EdgeInsets.only(top: 12),
        padding: const EdgeInsets.symmetric(vertical: 40),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(kRadiusLarge),
        ),
        child: const EmptyState(
          emoji: '📋',
          message: '暂无申请追踪\n前往探索页添加心仪院校',
        ),
      );
    }
    if (_myCases.isEmpty) {
      return Container(
        margin: const EdgeInsets.only(top: 12),
        padding: const EdgeInsets.symmetric(vertical: 40),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(kRadiusLarge),
        ),
        child: const EmptyState(emoji: '📝', message: '还没有分享过案例'),
      );
    }
    return Column(
      children: _myCases.map((c) => GestureDetector(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => CaseDetailScreen(caseId: c.id)),
        ),
        child: Container(
          margin: const EdgeInsets.only(top: 10),
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
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: resultGradient(c.result),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      c.targetSchool ?? '',
                      style: TextStyle(
                        fontSize: 12,
                        color: kInk.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: resultBadgeColor(c.result).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  resultLabel(c.result),
                  style: TextStyle(
                    fontSize: 11,
                    color: resultBadgeColor(c.result),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      )).toList(),
    );
  }
}

class _NotLoggedInView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kPorcelain,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: kSilver.withOpacity(0.5),
                shape: BoxShape.circle,
              ),
              child: const Text(
                '艺',
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.w700,
                  color: kCobalt,
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              '登录后解锁全部功能',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: kInk,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '申请追踪 · 案例分享 · 论坛互动',
              style: TextStyle(
                fontSize: 13,
                color: kInk.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: kCobalt,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(kRadiusMedium),
                ),
              ),
              child: const Text(
                '登录 / 注册',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionData {
  final IconData icon;
  final String label;
  final Color color;
  _QuickActionData({required this.icon, required this.label, required this.color});
}

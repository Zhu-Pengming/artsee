import 'package:flutter/material.dart';
import '../widgets/common.dart';
import 'cases/cases_screen.dart';
import 'cases/new_case_screen.dart';
import 'explore/explore_screen.dart';
import 'forum/forum_screen.dart';
import 'forum/new_post_screen.dart';
import 'home/home_screen.dart';
import 'home/new_community_post_screen.dart';
import 'profile/profile_screen.dart';

/// ═══════════════════════════════════════════════════════════════
/// ArtLink 艺衡 · 青花瓷典藏版 — 总入口（对齐艺术家 Web 原型）
/// 底部：悬浮式深色胶囊导航；右下：情境化「+」按钮
/// 子页：首页、发现、合作、学习、我的
/// ═══════════════════════════════════════════════════════════════

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _currentIndex = 0;
  /// 自 FAB 返回后重新挂载列表页，触发 initState 拉取数据（与顶栏「发布」一致）
  int _casesRemount = 0;
  int _forumRemount = 0;

  final List<_NavItem> _navItems = const [
    _NavItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      label: '首页',
    ),
    _NavItem(
      icon: Icons.explore_outlined,
      activeIcon: Icons.explore_rounded,
      label: '发现',
    ),
    _NavItem(
      icon: Icons.handshake_outlined,
      activeIcon: Icons.handshake_rounded,
      label: '合作',
    ),
    _NavItem(
      icon: Icons.school_outlined,
      activeIcon: Icons.school_rounded,
      label: '学习',
    ),
    _NavItem(
      icon: Icons.person_outline,
      activeIcon: Icons.person_rounded,
      label: '我的',
    ),
  ];

  Future<void> _onFabPressed() async {
    switch (_currentIndex) {
      case 2:
        await Navigator.of(context).push<void>(
          MaterialPageRoute<void>(builder: (_) => const NewCaseScreen()),
        );
        if (mounted) setState(() => _casesRemount++);
        return;
      case 3:
        await Navigator.of(context).push<void>(
          MaterialPageRoute<void>(builder: (_) => const NewPostScreen()),
        );
        if (mounted) setState(() => _forumRemount++);
        return;
      case 1:
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('在上方搜索框输入即可筛选院校')),
        );
        return;
      case 4:
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('个人资料与作品可在本页继续编辑')),
        );
        return;
      case 0:
        await Navigator.of(context).push<void>(
          MaterialPageRoute<void>(builder: (_) => const NewCommunityPostScreen()),
        );
        return;
      default:
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('浏览首页推荐，或切换到「合作 / 学习」快速发布')),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kPorcelain,
      extendBody: true,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned.fill(
            child: IndexedStack(
              index: _currentIndex,
              children: [
                const HomeScreen(),
                const ExploreScreen(),
                CasesScreen(key: ValueKey('cases_$_casesRemount')),
                ForumScreen(key: ValueKey('forum_$_forumRemount')),
                const ProfileScreen(),
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Material(
              color: Colors.transparent,
              child: SafeArea(
                top: false,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(right: 16, bottom: 8),
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: _ArtLinkFab(onPressed: _onFabPressed),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
                      child: Center(child: _buildFloatingNav()),
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

  Widget _buildFloatingNav() {
    return Container(
      constraints: const BoxConstraints(maxWidth: 520),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: kInk.withOpacity(0.92),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: kPorcelain.withOpacity(0.12)),
        boxShadow: [
          BoxShadow(
            color: kInk.withOpacity(0.35),
            blurRadius: 28,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_navItems.length, (index) {
            final item = _navItems[index];
            final isSelected = _currentIndex == index;
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 3),
              child: GestureDetector(
                onTap: () => setState(() => _currentIndex = index),
                behavior: HitTestBehavior.opaque,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 320),
                  curve: Curves.easeOutCubic,
                  padding: EdgeInsets.symmetric(
                    horizontal: isSelected ? 14 : 10,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? kPorcelain : Colors.transparent,
                    borderRadius: BorderRadius.circular(999),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: kInk.withOpacity(0.12),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isSelected ? item.activeIcon : item.icon,
                        size: 20,
                        color: isSelected
                            ? kCobalt
                            : kPorcelain.withOpacity(0.42),
                      ),
                      if (isSelected) ...[
                        const SizedBox(width: 6),
                        Text(
                          item.label,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                            color: kInk,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

/// 右下角「+」：不用 InkWell，避免 Web 上方形水波纹与浅蓝渐变伪影
class _ArtLinkFab extends StatelessWidget {
  final VoidCallback onPressed;

  const _ArtLinkFab({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onPressed,
        behavior: HitTestBehavior.opaque,
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: kCobalt,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: kInk.withOpacity(0.22),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Icon(Icons.add, color: Colors.white, size: 28),
        ),
      ),
    );
  }
}

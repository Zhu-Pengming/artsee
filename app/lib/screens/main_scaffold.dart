import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/common.dart';
import 'auth/login_screen.dart';
import 'cases/cases_screen.dart';
import 'create/create_post_screen.dart';
import 'explore/explore_screen.dart';
import 'forum/forum_screen.dart';
import 'home/home_screen.dart';
import 'profile/profile_screen.dart';
import 'tools/ai_consult_screen.dart';
import '../services/supabase_service.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

final _forumKey = GlobalKey<ForumScreenState>();
final _exploreKey = GlobalKey<ExploreScreenState>();

/// ═══════════════════════════════════════════════════════════════
/// Artiqore 艺衡 · 青花瓷典藏版 — 总入口（对齐艺术家 Web 原型）
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
      icon: Icons.school_outlined,
      activeIcon: Icons.school_rounded,
      label: '学习',
    ),
    _NavItem(
      icon: Icons.handshake_outlined,
      activeIcon: Icons.handshake_rounded,
      label: '合作',
    ),
    _NavItem(
      icon: Icons.person_outline,
      activeIcon: Icons.person_rounded,
      label: '我的',
    ),
  ];

  void _openAiConsult() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const AiConsultScreen()),
    );
  }

  Future<void> _openCreatePost() async {
    await Future.delayed(const Duration(milliseconds: 150));
    if (!mounted) return;
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const CreatePostScreen()),
    );
    if (!mounted || created != true) return;
    setState(() => _currentIndex = 1);
    _exploreKey.currentState?.showCommunityFeed(refresh: true);
  }

  void _showCreateSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => ClipRRect(
        borderRadius:
            const BorderRadius.vertical(top: Radius.circular(kRadiusLarge)),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 28, sigmaY: 28),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFFE8EEF5).withOpacity(0.92),
              borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(kRadiusLarge)),
              border:
                  Border.all(color: Colors.white.withOpacity(0.6), width: 1),
            ),
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: context.artC.ink.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: _buildSheetOption(
                          icon: Icons.add_photo_alternate_outlined,
                          label: '发布图文',
                          onTap: () {
                            Navigator.of(ctx).pop();
                            _openCreatePost();
                          },
                        ),
                      ),
                      const Expanded(child: SizedBox()),
                      const Expanded(child: SizedBox()),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSheetOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return TextButton(
      onPressed: onTap,
      style: TextButton.styleFrom(
        foregroundColor: context.artC.ink,
        padding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(kRadiusMedium)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.85),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: kCobalt.withOpacity(0.08),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Icon(icon, color: kCobalt, size: 28),
          ),
          const SizedBox(height: 10),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: context.artC.ink,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openLoginOrProfile() async {
    if (!SupabaseService.isLoggedIn) {
      await Navigator.of(context).push<void>(
        MaterialPageRoute<void>(builder: (_) => const LoginScreen()),
      );
      return;
    }
    setState(() => _currentIndex = 4);
  }

  @override
  Widget build(BuildContext context) {
    final statusBarHeight = MediaQuery.of(context).padding.top;
    const headerHeight = 35.0;

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      extendBody: true,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned(
            top: statusBarHeight + headerHeight,
            left: 0,
            right: 0,
            bottom: 0,
            child: IndexedStack(
              index: _currentIndex,
              children: [
                const HomeScreen(),
                ExploreScreen(key: _exploreKey),
                ForumScreen(key: _forumKey),
                const CasesScreen(),
                const ProfileScreen(),
              ],
            ),
          ),
          Positioned(
            top: statusBarHeight,
            left: 0,
            right: 0,
            child: _Header(
              height: headerHeight,
              onLoginTap: () => _openLoginOrProfile(),
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
                    if (_currentIndex == 1)
                      Padding(
                        padding: const EdgeInsets.only(right: 16, bottom: 8),
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: _ArtiqoreFab(onPressed: _showCreateSheet),
                        ),
                      ),
                    if (_currentIndex == 0)
                      Padding(
                        padding: const EdgeInsets.only(
                          right: 16,
                          bottom: 8,
                          left: 0,
                        ),
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: _AiConsultFab(onPressed: _openAiConsult),
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
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.88),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: context.artC.silver.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(
            color: context.artC.ink.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: List.generate(_navItems.length, (index) {
          final item = _navItems[index];
          return _NavButton(
            item: item,
            isSelected: _currentIndex == index,
            onTap: () {
              if (index == 4 && !SupabaseService.isLoggedIn) {
                _openLoginOrProfile();
                return;
              }
              setState(() => _currentIndex = index);
            },
          );
        }),
      ),
    );
  }
}

class _Header extends StatefulWidget {
  final double height;
  final VoidCallback? onLoginTap;

  const _Header({required this.height, this.onLoginTap});

  @override
  State<_Header> createState() => _HeaderState();
}

class _HeaderState extends State<_Header> {
  User? _user;
  String? _avatarUrl;
  StreamSubscription<AuthState>? _authSub;

  @override
  void initState() {
    super.initState();
    _user = SupabaseService.currentUser;
    _loadAvatar();
    _authSub = Supabase.instance.client.auth.onAuthStateChange.listen((_) {
      if (mounted) {
        setState(() => _user = SupabaseService.currentUser);
        _loadAvatar();
      }
    });
  }

  Future<void> _loadAvatar() async {
    if (!SupabaseService.isLoggedIn) {
      if (mounted) setState(() => _avatarUrl = null);
      return;
    }
    final profile = await SupabaseService.fetchProfile();
    if (mounted) setState(() => _avatarUrl = profile?['avatar_url'] as String?);
  }

  @override
  void dispose() {
    _authSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        color: context.artC.porcelain.withOpacity(0.95),
        border: Border(
          bottom: BorderSide(color: context.artC.silver.withOpacity(0.15)),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Text(
            'Artiqore',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: context.artC.ink,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(width: 12),
          // Search
          Expanded(
            child: Container(
              height: 34,
              decoration: BoxDecoration(
                color: context.artC.silver.withOpacity(0.35),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Row(
                children: [
                  const SizedBox(width: 12),
                  Icon(Icons.search,
                      size: 16, color: context.artC.ink.withOpacity(0.35)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '搜索',
                      style: TextStyle(
                        fontSize: 12,
                        color: context.artC.ink.withOpacity(0.35),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _avatarFallback() {
    final email = _user?.email ?? '';
    final ch = email.isNotEmpty ? email.substring(0, 1).toUpperCase() : 'U';
    return Center(
      child: Text(
        ch,
        style: TextStyle(
            fontSize: 12, fontWeight: FontWeight.w700, color: kCobalt),
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

/// 首页悬浮 AI（对齐稿件 AIAssistant：渐变胶囊 + 星标）
class _AiConsultFab extends StatelessWidget {
  final VoidCallback onPressed;

  const _AiConsultFab({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onPressed,
        behavior: HitTestBehavior.opaque,
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              colors: [kCobalt, Color(0xFF1E3A5F)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: kCobalt.withOpacity(0.25),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(
            Icons.auto_awesome,
            color: Colors.white,
            size: 22,
          ),
        ),
      ),
    );
  }
}

/// 右下角「+」：不用 InkWell，避免 Web 上方形水波纹与浅蓝渐变伪影
class _ArtiqoreFab extends StatelessWidget {
  final VoidCallback onPressed;

  const _ArtiqoreFab({required this.onPressed});

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
                color: context.artC.ink.withOpacity(0.22),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Icon(Icons.add, color: Colors.white, size: 28),
        ),
      ),
    );
  }
}

class _NavButton extends StatefulWidget {
  final _NavItem item;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavButton({
    required this.item,
    required this.isSelected,
    required this.onTap,
  });

  @override
  State<_NavButton> createState() => _NavButtonState();
}

class _NavButtonState extends State<_NavButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedScale(
        scale: _pressed ? 0.85 : 1.0,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOutCubic,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              widget.isSelected ? widget.item.activeIcon : widget.item.icon,
              size: 24,
              color: widget.isSelected
                  ? kCobalt
                  : context.artC.ink.withOpacity(0.32),
            ),
            const SizedBox(height: 6),
            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOutCubic,
              width: widget.isSelected ? 5 : 0,
              height: widget.isSelected ? 5 : 0,
              decoration: BoxDecoration(
                color: kCobalt,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

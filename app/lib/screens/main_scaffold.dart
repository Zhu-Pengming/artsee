import 'dart:ui';

import 'package:flutter/material.dart';
import '../widgets/common.dart';
import 'auth/login_screen.dart';
import 'create/create_post_screen.dart';
import 'home/home_screen.dart';
import 'news/news_scaffold.dart';
import 'explore/explore_screen.dart';
import 'forum/forum_screen.dart';
import 'profile/profile_screen.dart';
import '../services/supabase_service.dart';
import '../services/backend_api_service.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// ═══════════════════════════════════════════════════════════════
/// artiqore 艺见心 — App 总入口
/// 当前主导航：首页 / 院校 / 灵感 / 社区 / 我的。
/// ═══════════════════════════════════════════════════════════════

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  static final GlobalKey<_MainScaffoldState> globalKey = GlobalKey<_MainScaffoldState>();

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  static const double _headerHeight = 54;
  int _currentIndex = 0;
  final GlobalKey<NewsScaffoldState> _newsKey = GlobalKey<NewsScaffoldState>();
  final GlobalKey<ExploreScreenState> _exploreKey =
      GlobalKey<ExploreScreenState>();
  final GlobalKey<ForumScreenState> _forumKey = GlobalKey<ForumScreenState>();

  void switchToTab(int index) {
    if (mounted) {
      setState(() => _currentIndex = index);
    }
  }

  final List<_NavItem> _navItems = const [
    _NavItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      label: '首页',
    ),
    _NavItem(
      icon: Icons.school_outlined,
      activeIcon: Icons.school_rounded,
      label: '院校',
    ),
    _NavItem(
      icon: Icons.explore_outlined,
      activeIcon: Icons.explore_rounded,
      label: '灵感',
    ),
    _NavItem(
      icon: Icons.forum_outlined,
      activeIcon: Icons.forum_rounded,
      label: '社区',
    ),
    _NavItem(
      icon: Icons.person_outline,
      activeIcon: Icons.person_rounded,
      label: '我的',
    ),
  ];

  Future<void> _openCreatePost() async {
    await Future.delayed(const Duration(milliseconds: 150));
    if (!mounted) return;
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const CreatePostScreen()),
    );
    if (!mounted || created != true) return;
  }

  void _showCommunityCreateSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ClipRRect(
        borderRadius:
            const BorderRadius.vertical(top: Radius.circular(kRadiusLarge)),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 28, sigmaY: 28),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFFE8EEF5).withOpacity(0.94),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(kRadiusLarge),
              ),
              border:
                  Border.all(color: Colors.white.withOpacity(0.62), width: 1),
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
                          icon: Icons.help_outline,
                          label: '发布问答',
                          onTap: () {
                            Navigator.of(ctx).pop();
                            _openCommunityDialog(_CommunityCreateKind.qa);
                          },
                        ),
                      ),
                      Expanded(
                        child: _buildSheetOption(
                          icon: Icons.groups_outlined,
                          label: '创建圈子',
                          onTap: () {
                            Navigator.of(ctx).pop();
                            _openCommunityDialog(_CommunityCreateKind.circle);
                          },
                        ),
                      ),
                      Expanded(
                        child: _buildSheetOption(
                          icon: Icons.auto_awesome,
                          label: '创建沙龙',
                          onTap: () {
                            Navigator.of(ctx).pop();
                            _openCommunityDialog(_CommunityCreateKind.salon);
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _openCommunityDialog(_CommunityCreateKind kind) async {
    final titleCtrl = TextEditingController();
    final typeCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    final noteCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    var submitting = false;

    final labels = switch (kind) {
      _CommunityCreateKind.qa => ('发布问答', '问题标题', '话题分类', '城市/地区', '补充说明', '预算'),
      _CommunityCreateKind.circle => ('创建圈子', '圈子名称', '圈子分类', '城市/地区', '圈子简介', '预算'),
      _CommunityCreateKind.salon => ('创建沙龙', '沙龙标题', '沙龙类型', '城市', '地点/活动说明', '费用'),
    };

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) {
          Future<void> submit() async {
            if (!formKey.currentState!.validate() || submitting) return;
            setDialogState(() => submitting = true);
            try {
              if (kind == _CommunityCreateKind.qa) {
                await BackendApiService.createCommunityPost(
                  title: titleCtrl.text.trim(),
                  body: noteCtrl.text.trim(),
                  metadata: {
                    'kind': 'qa',
                    'category': typeCtrl.text.trim(),
                    'city': cityCtrl.text.trim(),
                  },
                );
              } else if (kind == _CommunityCreateKind.circle) {
                await BackendApiService.createCommunityCircle({
                  'title': titleCtrl.text.trim(),
                  'subtitle': noteCtrl.text.trim(),
                  'category': typeCtrl.text.trim().isEmpty
                      ? 'art'
                      : typeCtrl.text.trim(),
                  'city': cityCtrl.text.trim(),
                });
              } else {
                await BackendApiService.createEvent({
                  'title': titleCtrl.text.trim(),
                  'type': 'salon',
                  'city': cityCtrl.text.trim(),
                  'venue': noteCtrl.text.trim(),
                  'summary': typeCtrl.text.trim(),
                  if (int.tryParse(amountCtrl.text.trim()) != null)
                    'fee_amount': int.parse(amountCtrl.text.trim()),
                });
              }
              if (!mounted) return;
              Navigator.of(dialogContext).pop();
              if (_currentIndex == 3) {
                _forumKey.currentState?.refreshActiveTab();
              }
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${labels.$1}成功')),
              );
            } catch (e) {
              if (!mounted) return;
              setDialogState(() => submitting = false);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('提交失败：$e')),
              );
            }
          }

          return AlertDialog(
            title: Text(labels.$1),
            content: Form(
              key: formKey,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ResourceTextField(
                      controller: titleCtrl,
                      label: labels.$2,
                      required: true,
                    ),
                    _ResourceTextField(controller: typeCtrl, label: labels.$3),
                    _ResourceTextField(controller: cityCtrl, label: labels.$4),
                    _ResourceTextField(
                      controller: noteCtrl,
                      label: labels.$5,
                      maxLines: 3,
                    ),
                    if (kind == _CommunityCreateKind.salon)
                      _ResourceTextField(
                        controller: amountCtrl,
                        label: labels.$6,
                        keyboardType: TextInputType.number,
                      ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed:
                    submitting ? null : () => Navigator.of(dialogContext).pop(),
                child: const Text('取消'),
              ),
              FilledButton(
                onPressed: submitting ? null : submit,
                child: Text(submitting ? '提交中' : '发布'),
              ),
            ],
          );
        },
      ),
    ).then((_) {
      titleCtrl.dispose();
      typeCtrl.dispose();
      cityCtrl.dispose();
      noteCtrl.dispose();
      amountCtrl.dispose();
    });
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
                          icon: Icons.business_center_outlined,
                          label: '发布机会',
                          onTap: () {
                            Navigator.of(ctx).pop();
                            _openResourceDialog(_ResourceKind.opportunity);
                          },
                        ),
                      ),
                      Expanded(
                        child: _buildSheetOption(
                          icon: Icons.grid_view_rounded,
                          label: '发布展览',
                          onTap: () {
                            Navigator.of(ctx).pop();
                            _openResourceDialog(_ResourceKind.event);
                          },
                        ),
                      ),
                      Expanded(
                        child: _buildSheetOption(
                          icon: Icons.palette_outlined,
                          label: '艺术家入驻',
                          onTap: () {
                            Navigator.of(ctx).pop();
                            _openResourceDialog(_ResourceKind.artist);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
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

  Future<void> _openResourceDialog(_ResourceKind kind) async {
    final titleCtrl = TextEditingController();
    final typeCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    final noteCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    var submitting = false;

    final labels = switch (kind) {
      _ResourceKind.opportunity => ('发布合作机会', '机会标题', '类型', '城市', '需求说明', '预算上限'),
      _ResourceKind.event => ('发布展览活动', '活动标题', '类型', '城市', '地点/场馆', '费用'),
      _ResourceKind.artist => ('艺术家入驻', '显示名称', '艺术方向', '城市', '履历/合作意向', '合作预算'),
    };

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) {
          Future<void> submit() async {
            if (!formKey.currentState!.validate() || submitting) return;
            setDialogState(() => submitting = true);
            try {
              if (kind == _ResourceKind.opportunity) {
                await BackendApiService.createOpportunity({
                  'title': titleCtrl.text.trim(),
                  'type': typeCtrl.text.trim().isEmpty
                      ? 'collaboration'
                      : typeCtrl.text.trim(),
                  'city': cityCtrl.text.trim(),
                  'requirements': noteCtrl.text.trim(),
                  if (int.tryParse(amountCtrl.text.trim()) != null)
                    'budget_max': int.parse(amountCtrl.text.trim()),
                });
              } else if (kind == _ResourceKind.event) {
                await BackendApiService.createEvent({
                  'title': titleCtrl.text.trim(),
                  'type': typeCtrl.text.trim().isEmpty
                      ? 'exhibition'
                      : typeCtrl.text.trim(),
                  'city': cityCtrl.text.trim(),
                  'venue': noteCtrl.text.trim(),
                  if (int.tryParse(amountCtrl.text.trim()) != null)
                    'fee_amount': int.parse(amountCtrl.text.trim()),
                });
              } else {
                await BackendApiService.upsertArtistProfile({
                  'display_name': titleCtrl.text.trim(),
                  'art_fields': typeCtrl.text
                      .split(RegExp(r'[,，/、]'))
                      .map((e) => e.trim())
                      .where((e) => e.isNotEmpty)
                      .toList(),
                  'experience': noteCtrl.text.trim(),
                  'cooperation_intent': cityCtrl.text.trim(),
                  'status': 'published',
                });
              }
              if (!mounted) return;
              Navigator.of(dialogContext).pop();
              if (_currentIndex == 2) {
                _exploreKey.currentState?.refreshActiveTab();
              }
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${labels.$1}成功')),
              );
            } catch (e) {
              if (!mounted) return;
              setDialogState(() => submitting = false);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('提交失败：$e')),
              );
            }
          }

          return AlertDialog(
            title: Text(labels.$1),
            content: Form(
              key: formKey,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ResourceTextField(controller: titleCtrl, label: labels.$2, required: true),
                    _ResourceTextField(controller: typeCtrl, label: labels.$3),
                    _ResourceTextField(controller: cityCtrl, label: labels.$4),
                    _ResourceTextField(controller: noteCtrl, label: labels.$5, maxLines: 3),
                    if (kind != _ResourceKind.artist)
                      _ResourceTextField(
                        controller: amountCtrl,
                        label: labels.$6,
                        keyboardType: TextInputType.number,
                      ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed:
                    submitting ? null : () => Navigator.of(dialogContext).pop(),
                child: const Text('取消'),
              ),
              FilledButton(
                onPressed: submitting ? null : submit,
                child: Text(submitting ? '提交中' : '发布'),
              ),
            ],
          );
        },
      ),
    ).then((_) {
      titleCtrl.dispose();
      typeCtrl.dispose();
      cityCtrl.dispose();
      noteCtrl.dispose();
      amountCtrl.dispose();
    });
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
    final showTopHeader = _currentIndex == 1 || _currentIndex == 2 || _currentIndex == 3;

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      extendBody: true,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned(
            top: statusBarHeight + (showTopHeader ? _headerHeight : 0),
            left: 0,
            right: 0,
            bottom: 0,
            child: IndexedStack(
              index: _currentIndex,
              children: [
                const HomeScreen(),
                NewsScaffold(key: _newsKey),
                ExploreScreen(key: _exploreKey),
                ForumScreen(key: _forumKey),
                const ProfileScreen(),
              ],
            ),
          ),
          if (showTopHeader)
            Positioned(
              top: statusBarHeight,
              left: 0,
              right: 0,
              child: _TopHeader(
                showCreateIcon: _currentIndex == 2 || _currentIndex == 3,
                onSearchTap: _handleHeaderSearch,
                onActionTap: _handleHeaderAction,
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

  void _handleHeaderSearch() {
    if (_currentIndex == 1) {
      _newsKey.currentState?.toggleSchoolSearchPanel(expand: true);
    }
  }

  void _handleHeaderAction() {
    if (_currentIndex == 1) {
      _newsKey.currentState?.toggleSchoolSearchPanel();
    } else if (_currentIndex == 2) {
      _showCreateSheet();
    } else if (_currentIndex == 3) {
      _showCommunityCreateSheet();
    }
  }
}

class _TopHeader extends StatelessWidget {
  final bool showCreateIcon;
  final VoidCallback onSearchTap;
  final VoidCallback onActionTap;

  const _TopHeader({
    required this.showCreateIcon,
    required this.onSearchTap,
    required this.onActionTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: _MainScaffoldState._headerHeight,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: context.artC.porcelain.withOpacity(0.96),
        border: Border(
          bottom: BorderSide(color: context.artC.silver.withOpacity(0.12)),
        ),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 82,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'artiqore',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 16,
                    height: 0.95,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    letterSpacing: -0.8,
                    color: context.artC.ink,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                Text(
                  '艺见心',
                  style: TextStyle(
                    fontSize: 7,
                    height: 1,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 3,
                    color: context.artC.ink.withOpacity(0.34),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: GestureDetector(
              onTap: onSearchTap,
              child: Container(
                height: 34,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: context.artC.silver.withOpacity(0.34),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Row(
                  children: [
                    Icon(Icons.search, size: 16, color: context.artC.ink.withOpacity(0.35)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '搜索院校、灵感、作品集问题',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          color: context.artC.ink.withOpacity(0.35),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onActionTap,
            child: Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: context.artC.silver.withOpacity(0.34),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                showCreateIcon ? Icons.add_rounded : Icons.tune_rounded,
                size: showCreateIcon ? 23 : 18,
                color: showCreateIcon ? kCobalt : context.artC.ink.withOpacity(0.48),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

enum _ResourceKind { opportunity, event, artist }

enum _CommunityCreateKind { qa, circle, salon }

class _ResourceTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final bool required;
  final int maxLines;
  final TextInputType? keyboardType;

  const _ResourceTextField({
    required this.controller,
    required this.label,
    this.required = false,
    this.maxLines = 1,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        validator: required
            ? (value) =>
                value == null || value.trim().isEmpty ? '请填写$label' : null
            : null,
        decoration: InputDecoration(
          labelText: label,
          isDense: true,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
          ),
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
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 180),
              switchInCurve: Curves.easeOutCubic,
              switchOutCurve: Curves.easeOutCubic,
              child: widget.isSelected
                  ? Padding(
                      key: ValueKey(widget.item.label),
                      padding: const EdgeInsets.only(top: 5),
                      child: Text(
                        widget.item.label,
                        style: const TextStyle(
                          color: kCobalt,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.2,
                        ),
                      ),
                    )
                  : const SizedBox(
                      key: ValueKey('empty'),
                      height: 14,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

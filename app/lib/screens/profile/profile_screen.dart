import 'package:flutter/material.dart';
import '../../config/dev_test_account.dart';
import '../../services/backend_api_service.dart';
import '../../services/supabase_service.dart';
import '../../widgets/artsee_ui.dart';
import '../../widgets/common.dart';
import '../auth/login_screen.dart';
import '../mentors/mentor_application_screen.dart';
import '../mentors/mentor_list_screen.dart';
import '../onboarding/art_interest_onboarding_screen.dart';
import '../programs/program_detail_screen.dart';
import '../schools/school_detail_screen.dart';
import 'application_workspace_screen.dart';
import 'contract_archive_screen.dart';
import 'content_submissions_screen.dart';
import 'creator_center_screen.dart';
import 'identity_verification_screen.dart';
import 'membership_center_screen.dart';
import 'notifications_screen.dart';
import 'orders_screen.dart';
import 'profile_edit_screen.dart';
import 'team_invitations_screen.dart';
import 'package:artsee_app/theme/artsee_theme_controller.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// ═══════════════════════════════════════════════════════════════
/// 我的页 — 完全对齐 _artist_ref ProfileView，接入真实用户数据
/// ═══════════════════════════════════════════════════════════════

class ProfileScreen extends StatefulWidget {
  final ValueChanged<int>? onOpenMainTab;

  const ProfileScreen({super.key, this.onOpenMainTab});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  int _savedSchoolCount = 0;
  int _unreadNotificationCount = 0;
  int _consultationUnreadCount = 0;
  String _planStatus = '待创建';
  bool _loading = true;

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
    final p = await SupabaseService.fetchProfile();
    var savedSchoolCount = 0;
    var unreadNotificationCount = 0;
    var consultationUnreadCount = 0;
    var planStatus = '待创建';
    try {
      final saved = await BackendApiService.fetchSavedSchools(limit: 1);
      savedSchoolCount = saved.count ?? saved.data.length;
    } catch (_) {
      savedSchoolCount = 0;
    }
    try {
      final plan = await BackendApiService.fetchApplicationPlan();
      final tasks = (plan['tasks'] as List<dynamic>? ?? []);
      final todo = tasks.where((task) {
        return task is Map && task['status'] != 'done';
      }).length;
      planStatus = plan['state'] == 'generated' ? '$todo 项待办' : '待创建';
    } catch (_) {}
    try {
      unreadNotificationCount =
          await BackendApiService.fetchUnreadNotificationCount();
    } catch (_) {
      unreadNotificationCount = 0;
    }
    try {
      final consultations = await BackendApiService.fetchConsultations(
        limit: 100,
      );
      consultationUnreadCount = consultations.data.fold<int>(
        0,
        (sum, item) => sum + _asInt(item['unread_count']),
      );
    } catch (_) {
      consultationUnreadCount = 0;
    }
    if (mounted) {
      setState(() {
        _profile = p;
        _savedSchoolCount = savedSchoolCount;
        _unreadNotificationCount = unreadNotificationCount;
        _consultationUnreadCount = consultationUnreadCount;
        _planStatus = planStatus;
        _loading = false;
      });
    }
  }

  Future<void> _openLogin() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(builder: (_) => const LoginScreen()),
    );
    _load();
  }

  Future<void> _signOut() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('退出登录'),
        content: const Text('确定要退出当前账号吗？'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('取消')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('确定')),
        ],
      ),
    );
    if (ok != true) return;
    await SupabaseService.signOut();
    if (mounted) setState(() => _profile = null);
  }

  String get _nickname {
    final n = _profile?['nickname'] as String?;
    if (n != null && n.isNotEmpty) return n;
    final email = SupabaseService.currentUser?.email ?? '';
    if (email.isNotEmpty) return email.split('@').first;
    return 'Artsee用户';
  }

  String get _avatarUrl => _profile?['avatar_url'] as String? ?? '';

  bool get _isVerified => _profile?['is_verified'] == true;

  bool get _isBusinessUser => _profile?['user_type'] == 'business';

  bool get _hasCompletedOnboarding =>
      _profile?['has_completed_onboarding'] == true;

  String get _roleKey => _profile?['user_role']?.toString() ?? '';

  String get _roleLabel {
    const personal = {
      'student': '艺术学生 / 申请者',
      'artist': '艺术家 / 创作者',
      'collector': '艺术爱好者 / 收藏者',
      'parent': '家长 / 陪同决策者',
    };
    const business = {
      'study_abroad_agency': '艺术留学机构',
      'portfolio_training': '艺术培训 / 作品集机构',
      'gallery_exhibition': '画廊 / 展览机构',
      'event_organizer': '艺术活动主办方',
      'hotel_culture_space': '酒店 / 文旅空间',
      'brand_partner': '品牌合作方',
      'art_media_community': '艺术媒体 / 社群',
      'other_service': '其他艺术服务商',
    };
    return (_isBusinessUser ? business[_roleKey] : personal[_roleKey]) ??
        (_isBusinessUser ? '机构 / 商家入驻' : '个人用户');
  }

  String get _stageLabel {
    final raw = _profile?['portfolio_status']?.toString() ??
        _profile?['current_education_stage']?.toString() ??
        '';
    const stages = {
      'exploring': '刚开始了解',
      'target_ready': '已有目标国家 / 学校',
      'portfolio_preparing': '正在准备作品集',
      'works_ready': '已有部分作品',
      'applying': '正在申请中',
      'admitted': '已录取 / 已在读',
      'pending_business_review': '入驻待审核',
      'just_learning': '刚开始了解',
      'child_has_interest': '孩子已有艺术方向',
      'target_country': '已有目标国家 / 院校',
      'application_planning': '正在规划申请',
    };
    return stages[raw] ??
        (raw.isEmpty ? (_isBusinessUser ? '未认证' : '待补全') : raw);
  }

  String get _stageShortLabel {
    final label = _stageLabel;
    const shortLabels = {
      '刚开始了解': '探索中',
      '已有目标国家 / 学校': '定校中',
      '正在准备作品集': '作品集中',
      '已有部分作品': '作品中',
      '正在申请中': '申请中',
      '已录取 / 已在读': '已录取',
      '孩子已有艺术方向': '定方向',
      '已有目标国家 / 院校': '定校中',
      '正在规划申请': '规划中',
      '待补全': '待完善',
    };
    return shortLabels[label] ?? label;
  }

  String get _statusLabel {
    if (!_isBusinessUser) return _isVerified ? '已认证' : '待认证';
    if (_isVerified) return '审核通过';
    if (_stageLabel == '入驻待审核') return '待审核';
    return '待认证';
  }

  String get _cityLabel {
    final city = _profile?['city_preference']?.toString();
    final location = _profile?['location']?.toString();
    return (city != null && city.isNotEmpty)
        ? city
        : (location != null && location.isNotEmpty ? location : '城市待补全');
  }

  String get _businessName {
    for (final item in _asStringList(_profile?['target_majors'])) {
      if (item.startsWith('机构名称：')) {
        return item.replaceFirst('机构名称：', '').trim();
      }
    }
    return _nickname;
  }

  List<String> _asStringList(dynamic value) {
    if (value is List) {
      return value
          .map((item) => item.toString())
          .where((item) => item.isNotEmpty)
          .toList();
    }
    return const [];
  }

  String _joinLabels(List<String> raw, Map<String, String> labels,
      {String fallback = '待补全'}) {
    final items = raw
        .where((item) => !item.startsWith('business_'))
        .map((item) => labels[item] ?? item)
        .take(3)
        .toList();
    return items.isEmpty ? fallback : items.join('、');
  }

  @override
  Widget build(BuildContext context) {
    if (!SupabaseService.isLoggedIn) {
      return _buildGuestView();
    }
    if (_loading) {
      return Scaffold(
        backgroundColor: context.artC.porcelain,
        body: const Center(
            child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2.5)),
      );
    }
    return _buildProfileView();
  }

  Widget _buildGuestView() {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        top: false,
        child: Stack(
          children: [
            Positioned(
              top: 4,
              right: 8,
              child: ListenableBuilder(
                listenable: ArtseeThemeController.instance,
                builder: (context, _) {
                  final dark = ArtseeThemeController.instance.isDark;
                  return IconButton(
                    onPressed: () => ArtseeThemeController.instance.toggle(),
                    icon: Icon(
                      dark ? Icons.wb_sunny_outlined : Icons.nightlight_round,
                      color: context.artC.ink.withValues(alpha: 0.55),
                    ),
                  );
                },
              ),
            ),
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        color: context.artC.silver.withValues(alpha: 0.35),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Text(
                          '艺',
                          style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w700,
                              color: kCobalt),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      '登录后解锁全部功能',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: context.artC.ink),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '申请追踪 · 案例分享 · 论坛互动',
                      style: TextStyle(
                          fontSize: 13,
                          color: context.artC.ink.withValues(alpha: 0.45)),
                    ),
                    const SizedBox(height: 24),
                    GestureDetector(
                      onTap: _openLogin,
                      child: Container(
                        width: double.infinity,
                        height: 48,
                        decoration: BoxDecoration(
                          color: kCobalt,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Center(
                          child: Text(
                            '登录 / 注册',
                            style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: Colors.white),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileView() {
    final bottomSpacer = MediaQuery.of(context).padding.bottom + 200;

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildProfileHeader(),
              const SizedBox(height: 18),
              _buildMenuList(),
              SizedBox(height: bottomSpacer),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    final directions = _directionSummary();
    final title = _isBusinessUser ? _businessName : _nickname;
    final primaryAction = _primaryAction();
    final statusItems = _isBusinessUser
        ? [
            ('入驻状态', _statusLabel),
            ('所在城市', _cityLabel),
            ('机构类型', _roleLabel),
            ('主页状态', _isVerified ? '已开放' : '待审核'),
          ]
        : [
            ('当前阶段', _stageShortLabel),
            ('关注方向', directions),
            ('常用城市', _cityLabel),
            ('画像状态', _hasCompletedOnboarding ? '已完成' : '待完善'),
          ];

    return Container(
      padding: const EdgeInsets.fromLTRB(17, 16, 17, 14),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.22)),
        boxShadow: [
          BoxShadow(
            color: context.artC.ink.withValues(alpha: 0.032),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _InstagramAvatar(
                imageUrl: _avatarUrl,
                fallback: _nickname,
                verified: _isVerified,
                business: _isBusinessUser,
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                        fontFamily: 'Noto Serif SC',
                      ),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _ProfileChip(label: _roleLabel, strong: true),
                        _ProfileChip(label: _statusLabel),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          GridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: 6,
            crossAxisSpacing: 6,
            childAspectRatio: 4.05,
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: statusItems
                .map((item) =>
                    _ProfileStatusItem(label: item.$1, value: item.$2))
                .toList(),
          ),
          if (_isBusinessUser && !_isVerified) ...[
            const SizedBox(height: 10),
            const _NoticeStrip(
              text: '完成身份认证后，可发布活动、服务和合作机会',
              icon: Icons.verified_outlined,
            ),
          ] else if (!_isBusinessUser && !_isVerified) ...[
            const SizedBox(height: 10),
            const _NoticeStrip(
              text: '认证后可解锁完整申请工具、院校数据和咨询服务',
              icon: Icons.verified_outlined,
            ),
          ] else if (!_isBusinessUser && !_hasCompletedOnboarding) ...[
            const SizedBox(height: 10),
            const _NoticeStrip(
              text: '完善画像，获得更准确推荐',
              icon: Icons.auto_awesome_outlined,
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _HeaderActionButton(
                  label: primaryAction.label,
                  onTap: primaryAction.onTap,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _HeaderActionButton(
                  label: _isBusinessUser
                      ? '编辑机构资料'
                      : (_hasCompletedOnboarding ? '编辑个人资料' : '完善画像'),
                  onTap: !_isBusinessUser && !_hasCompletedOnboarding
                      ? _openOnboardingEditor
                      : _openEditProfile,
                  secondary: true,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  ({String label, VoidCallback onTap}) _primaryAction() {
    if (_isBusinessUser) {
      return (label: '查看主页', onTap: () => _openPlaceholder('机构主页'));
    }
    if (_savedSchoolCount == 0) {
      return (
        label: '添加目标院校',
        onTap: () =>
            _openApplicationWorkspace(ApplicationWorkspaceKind.savedSchools),
      );
    }
    if (_savedSchoolCount >= 2 && _planStatus == '待创建') {
      return (
        label: '生成院校对比',
        onTap: () =>
            _openApplicationWorkspace(ApplicationWorkspaceKind.programCompare),
      );
    }
    if (_planStatus == '待创建') {
      return (
        label: '创建申请计划',
        onTap: () =>
            _openApplicationWorkspace(ApplicationWorkspaceKind.applicationPlan),
      );
    }
    return (
      label: '查看今日待办',
      onTap: () =>
          _openApplicationWorkspace(ApplicationWorkspaceKind.applicationPlan),
    );
  }

  String _directionSummary({String fallback = '待补全'}) {
    const directionLabels = {
      'fine_art': '纯艺',
      'design': '设计',
      'photo_video': '影像 / 摄影',
      'new_media': '新媒体',
      'curation': '策展',
      'art_market': '艺术市场',
      'art_education': '艺术教育',
      'space_culture': '空间 / 文旅',
    };
    return _joinLabels(
      _asStringList(_profile?['target_directions']),
      directionLabels,
      fallback: fallback,
    );
  }

  Future<void> _openEditProfile() async {
    final refreshed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ProfileEditScreen(initialProfile: _profile),
      ),
    );
    if (refreshed == true) _load();
  }

  Future<void> _openOnboardingEditor() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => ArtInterestOnboardingScreen(
          onCompleted: () => Navigator.of(context).pop(),
        ),
      ),
    );
    _load();
  }

  void _closeWorkspaceThen(VoidCallback action) {
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) action();
    });
  }

  void _openPlaceholder(String title) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$title - 节点二待实现')),
    );
  }

  Future<void> _openNotifications() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => NotificationsScreen(
          isBusinessUser: _isBusinessUser,
        ),
      ),
    );
    _load();
  }

  Future<void> _openMentors() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(builder: (_) => const MentorListScreen()),
    );
    _load();
  }

  Future<void> _openMentorCenter() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => const MentorServicesScreen(),
      ),
    );
    _load();
  }

  Future<void> _openMentorBookings() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => const MentorBookingsScreen(),
      ),
    );
    _load();
  }

  Future<void> _openCreatorCenter() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => const CreatorCenterScreen(),
      ),
    );
    _load();
  }

  Future<void> _openContentSubmissions() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => const ContentSubmissionsScreen(),
      ),
    );
    _load();
  }

  Future<void> _openIdentityVerification() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => IdentityVerificationScreen(
          initialType: _isBusinessUser ? 'business' : _roleKey,
          initialBusinessRole: _isBusinessUser ? _roleKey : null,
        ),
      ),
    );
    _load();
  }

  Future<void> _openTeamInvitations() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => const TeamInvitationsScreen(),
      ),
    );
    _load();
  }

  Widget _buildMenuList() {
    return Column(
      children: [
        if (_isBusinessUser) ...[
          _buildMenuSection('入驻与认证', [
            _MenuAction(
                '入驻审核', Icons.fact_check_outlined, _openIdentityVerification),
            _MenuAction(
                '身份认证', Icons.verified_outlined, _openIdentityVerification),
            _MenuAction('机构资料', Icons.storefront_outlined, _openEditProfile),
            _MenuAction('AI 展示页预览', Icons.auto_awesome_outlined,
                () => _openPlaceholder('AI 展示页预览')),
          ]),
          _buildMenuSection('内容管理', [
            _MenuAction('案例与作品管理', Icons.layers_outlined,
                () => _openPlaceholder('案例与作品管理')),
            _MenuAction('服务 / 课程管理', Icons.menu_book_outlined,
                () => _openPlaceholder('服务 / 课程管理')),
            _MenuAction('活动 / 展览管理', Icons.event_available_outlined,
                () => _openPlaceholder('活动 / 展览管理')),
            _MenuAction(
                '发布记录', Icons.history_outlined, _openContentSubmissions),
          ]),
          _buildMenuSection('商务与合作', [
            _MenuAction('咨询与订单', Icons.receipt_long_outlined, _openOrders),
            _MenuAction('咨询线索', Icons.support_agent_outlined,
                () => _openPlaceholder('咨询线索')),
            _MenuAction('合作追踪', Icons.business_center_outlined,
                () => _openPlaceholder('合作追踪')),
            _MenuAction(
                '合同 / 报价', Icons.description_outlined, _openContractArchive),
          ]),
        ] else ...[
          _buildContentGridSection(),
        ],
        _buildMenuSection('账号与设置', [
          _MenuAction('消息通知', Icons.notifications_outlined, _openNotifications,
              badgeText: _unreadNotificationCount > 0
                  ? '$_unreadNotificationCount'
                  : null),
          _MenuAction('团队邀请', Icons.group_add_outlined, _openTeamInvitations),
          _MenuAction('导师中心', Icons.school_outlined, _openMentorCenter),
          _MenuAction('导师预约', Icons.event_note_outlined, _openMentorBookings),
          _MenuAction(
            '深色模式',
            ArtseeThemeController.instance.isDark
                ? Icons.wb_sunny_outlined
                : Icons.nightlight_round,
            () => ArtseeThemeController.instance.toggle(),
            switchValue: ArtseeThemeController.instance.isDark,
          ),
          _MenuAction(
              '账号设置', Icons.settings_outlined, () => _openPlaceholder('账号设置')),
          _MenuAction('帮助中心', Icons.help_outline_rounded,
              () => _openPlaceholder('帮助中心')),
          _MenuAction('联系客服', Icons.headset_mic_outlined,
              () => _openPlaceholder('联系客服')),
          _MenuAction('退出登录', Icons.logout, _signOut, destructive: true),
        ]),
        if (devLoginShortcutsEnabled) ...[
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kCobalt.withValues(alpha: 0.04),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kCobalt.withValues(alpha: 0.12)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '开发调试',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: kCobalt.withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildDevButton(
                        '学校详情页',
                        () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const SchoolDetailScreen(
                                id: '3485e258-d84b-4067-b093-62a3d468ac62'),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildDevButton(
                        '专业详情页',
                        () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const ProgramDetailScreen(
                                id: '001f9862-a2c5-4d37-9b7a-720ceeef163e'),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildMenuSection(String title, List<_MenuAction> items) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 0, 4, 9),
            child: Text(
              title,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w900,
                color: context.artC.ink.withValues(alpha: 0.86),
              ),
            ),
          ),
          Container(
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              color: context.artC.cardIconBg,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: context.artC.silver.withValues(alpha: 0.22),
              ),
              boxShadow: [
                BoxShadow(
                  color: context.artC.ink.withValues(alpha: 0.026),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: List.generate(
                items.length,
                (index) => _buildMenuTile(
                  items[index],
                  showDivider: index < items.length - 1,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContentGridSection() {
    final items = [
      _MenuAction(
          '会员中心', Icons.workspace_premium_outlined, _openMembershipCenter),
      _MenuAction('创作中心', Icons.auto_awesome_outlined, _openCreatorCenter),
      _MenuAction('发布记录', Icons.layers_outlined, _openContentSubmissions),
      _MenuAction(
        '咨询记录',
        Icons.forum_outlined,
        () => _openApplicationWorkspace(ApplicationWorkspaceKind.consultations),
        badgeText:
            _consultationUnreadCount > 0 ? '$_consultationUnreadCount' : null,
      ),
      _MenuAction('我的收藏', Icons.favorite_border_rounded,
          () => _openPlaceholder('我的收藏')),
      _MenuAction('导师咨询', Icons.school_outlined, _openMentors),
      _MenuAction('导师预约', Icons.event_note_outlined, _openMentorBookings),
      _MenuAction('身份认证', Icons.verified_outlined, _openIdentityVerification),
      _MenuAction('合同存档', Icons.description_outlined, _openContractArchive),
      _MenuAction(
          '看展记录', Icons.museum_outlined, () => _openPlaceholder('看展记录')),
    ];
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 0, 4, 9),
            child: Text(
              '我的内容',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w900,
                color: context.artC.ink.withValues(alpha: 0.86),
              ),
            ),
          ),
          GridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 3.25,
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: items
                .map(
                  (item) => ArtseeSurface(
                    onTap: item.onTap,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    radius: 16,
                    child: Row(
                      children: [
                        Container(
                          width: 29,
                          height: 29,
                          decoration: BoxDecoration(
                            color: kCobalt.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(item.icon, size: 16, color: kCobalt),
                        ),
                        const SizedBox(width: 9),
                        Expanded(
                          child: Text(
                            item.label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: context.artC.ink.withValues(alpha: 0.82),
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        if (item.badgeText != null) ...[
                          const SizedBox(width: 6),
                          _MenuBadge(text: item.badgeText!),
                        ],
                      ],
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuTile(_MenuAction item, {required bool showDivider}) {
    final color = item.destructive
        ? Colors.red
        : context.artC.ink.withValues(alpha: 0.82);
    final iconColor = item.destructive
        ? Colors.red.withValues(alpha: 0.64)
        : context.artC.ink.withValues(alpha: 0.42);

    return GestureDetector(
      onTap: item.onTap,
      child: Column(
        children: [
          Container(
            height: 56,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: item.destructive
                            ? Colors.red.withValues(alpha: 0.08)
                            : context.artC.silver.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(item.icon, size: 18, color: iconColor),
                    ),
                    const SizedBox(width: 13),
                    Text(
                      item.label,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: color,
                      ),
                    ),
                    if (item.badgeText != null) ...[
                      const SizedBox(width: 8),
                      _MenuBadge(text: item.badgeText!),
                    ],
                  ],
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (item.switchValue != null)
                      ListenableBuilder(
                        listenable: ArtseeThemeController.instance,
                        builder: (context, _) => Switch(
                          value: ArtseeThemeController.instance.isDark,
                          onChanged: (_) => item.onTap(),
                          activeThumbColor: kCobalt,
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                        ),
                      )
                    else ...[
                      Icon(
                        Icons.chevron_right,
                        size: 21,
                        color: item.destructive
                            ? Colors.red.withValues(alpha: 0.28)
                            : context.artC.ink.withValues(alpha: 0.22),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          if (showDivider)
            Padding(
              padding: const EdgeInsets.only(left: 63),
              child: Divider(
                height: 1,
                thickness: 1,
                color: context.artC.silver.withValues(alpha: 0.22),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDevButton(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: kCobalt.withValues(alpha: 0.2)),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: kCobalt.withValues(alpha: 0.9),
          ),
        ),
      ),
    );
  }

  void _openOrders() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const OrdersScreen()),
    );
  }

  void _openMembershipCenter() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const MembershipCenterScreen()),
    );
  }

  void _openContractArchive() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const ContractArchiveScreen()),
    );
  }

  void _openApplicationWorkspace(ApplicationWorkspaceKind kind) {
    Navigator.of(context)
        .push(
      MaterialPageRoute<void>(
        builder: (_) => ApplicationWorkspaceScreen(
          kind: kind,
          onOpenSchools: () => _closeWorkspaceThen(
            () => widget.onOpenMainTab?.call(1),
          ),
          onOpenExplore: () => _closeWorkspaceThen(
            () => widget.onOpenMainTab?.call(2),
          ),
          onOpenProfileSetup: () => _closeWorkspaceThen(_openOnboardingEditor),
        ),
      ),
    )
        .then((_) {
      if (mounted) _load();
    });
  }
}

class _MenuAction {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final bool destructive;
  final bool? switchValue;
  final String? badgeText;

  const _MenuAction(
    this.label,
    this.icon,
    this.onTap, {
    this.destructive = false,
    this.switchValue,
    this.badgeText,
  });
}

class _MenuBadge extends StatelessWidget {
  final String text;

  const _MenuBadge({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: 20),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFFE11D48),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

int _asInt(dynamic value) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

class _ProfileChip extends StatelessWidget {
  final String label;
  final bool strong;

  const _ProfileChip({required this.label, this.strong = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: strong
            ? kCobalt.withValues(alpha: 0.08)
            : context.artC.silver.withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(999),
        border:
            strong ? Border.all(color: kCobalt.withValues(alpha: 0.22)) : null,
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w900,
          color: strong ? kCobalt : context.artC.ink.withValues(alpha: 0.62),
        ),
      ),
    );
  }
}

class _InstagramAvatar extends StatelessWidget {
  final String imageUrl;
  final String fallback;
  final bool verified;
  final bool business;

  const _InstagramAvatar({
    required this.imageUrl,
    required this.fallback,
    required this.verified,
    required this.business,
  });

  @override
  Widget build(BuildContext context) {
    final ch = fallback.isNotEmpty ? fallback.substring(0, 1) : '艺';
    return Stack(
      children: [
        Container(
          width: 48,
          height: 48,
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            color: context.artC.cardIconBg,
            shape: BoxShape.circle,
            border: Border.all(
              color: verified
                  ? kCobalt
                  : context.artC.silver.withValues(alpha: 0.75),
              width: 1.4,
            ),
          ),
          child: Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: context.artC.cardIconBg,
              shape: BoxShape.circle,
            ),
            child: ClipOval(
              child: imageUrl.isNotEmpty
                  ? Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _avatarFallbackText(ch),
                    )
                  : _avatarFallbackText(ch),
            ),
          ),
        ),
        Positioned(
          right: 0,
          bottom: 0,
          child: Container(
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: verified
                  ? kCobalt
                  : context.artC.silver.withValues(alpha: 0.92),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: Icon(
              business ? Icons.storefront_outlined : Icons.person_rounded,
              size: 9,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  Widget _avatarFallbackText(String ch) {
    return Center(
      child: Text(
        ch,
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w900,
          color: kCobalt,
        ),
      ),
    );
  }
}

class _ProfileStatusItem extends StatelessWidget {
  final String label;
  final String value;

  const _ProfileStatusItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 38),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: context.artC.silver.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.28)),
      ),
      child: Row(
        children: [
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: context.artC.ink.withValues(alpha: 0.38),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w900,
                color: context.artC.ink.withValues(alpha: 0.86),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NoticeStrip extends StatelessWidget {
  final String text;
  final IconData icon;

  const _NoticeStrip({required this.text, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kCobalt.withValues(alpha: 0.12)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 17, color: kCobalt),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 12,
                height: 1.35,
                fontWeight: FontWeight.w800,
                color: kCobalt,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeaderActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool secondary;

  const _HeaderActionButton({
    required this.label,
    required this.onTap,
    this.secondary = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color:
              secondary ? context.artC.silver.withValues(alpha: 0.32) : kCobalt,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w900,
            color: secondary
                ? context.artC.ink.withValues(alpha: 0.68)
                : Colors.white,
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../../config/dev_test_account.dart';
import '../../services/backend_api_service.dart';
import '../../services/supabase_service.dart';
import '../../widgets/artsee_ui.dart';
import '../../widgets/common.dart';
import '../auth/login_screen.dart';
import '../consultation/organization_list_screen.dart';
import '../mentors/mentor_application_screen.dart';
import '../mentors/mentor_list_screen.dart';
import '../onboarding/art_interest_onboarding_screen.dart';
import '../programs/program_detail_screen.dart';
import '../publish/publish_artist_screen.dart';
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
import 'public_user_profile_screen.dart';
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
  int _profileShowcaseTab = 0;

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

  String get _profileHandle {
    final raw = _profile?['handle']?.toString() ??
        _profile?['username']?.toString() ??
        SupabaseService.currentUser?.email?.split('@').first;
    final handle = raw?.trim();
    if (handle != null && handle.isNotEmpty) {
      return '@${handle.replaceFirst(RegExp(r'^@'), '').replaceAll(RegExp(r'\s+'), '_')}';
    }
    return '@artsee_user';
  }

  String get _profileBio {
    final raw = _profile?['bio']?.toString() ??
        _profile?['introduction']?.toString() ??
        _profile?['description']?.toString();
    if (raw != null && raw.trim().isNotEmpty) return raw.trim();
    if (_isBusinessUser) {
      return '位于$_cityLabel，提供$_roleLabel相关服务，案例和团队信息会沉淀在公开主页。';
    }
    if (_roleKey == 'artist') {
      return '关注${_directionSummary()}，持续更新作品、创作过程和展览记录。';
    }
    if (_roleKey == 'student') {
      return '正在整理作品集、申请动态和院校经验，关注${_directionSummary()}。';
    }
    if (_roleKey == 'mentor') {
      return '分享作品集案例、申请判断和面试经验，帮助学生理解作品与院校匹配。';
    }
    return '参与艺术社区讨论，收藏作品、院校案例和申请经验。';
  }

  PublicUserProfileKind get _publicProfileKind {
    if (_roleKey == 'artist') return PublicUserProfileKind.artist;
    if (_roleKey == 'student') return PublicUserProfileKind.student;
    if (_roleKey == 'mentor') return PublicUserProfileKind.mentor;
    return PublicUserProfileKind.user;
  }

  int get _followersCount => _profileInt(
        ['followers_count', 'follower_count'],
        _isBusinessUser
            ? 1280
            : _roleKey == 'artist'
                ? 842
                : _roleKey == 'mentor'
                    ? 536
                    : 96,
      );

  int get _profileViews => _profileInt(
        ['view_count', 'views_count', 'profile_views'],
        _isBusinessUser ? 18600 : 3200 + _savedSchoolCount * 120,
      );

  int get _followingCount => _profileInt(
        ['following_count', 'followings_count'],
        28 + _savedSchoolCount,
      );

  int get _worksCount => _profileInt(
        ['works_count', 'artwork_count', 'portfolio_count'],
        _isBusinessUser
            ? 18
            : _roleKey == 'artist'
                ? 24
                : _roleKey == 'student'
                    ? 12
                    : _roleKey == 'mentor'
                        ? 8
                        : 5,
      );

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

  int _profileInt(List<String> keys, int fallback) {
    for (final key in keys) {
      final value = _profile?[key];
      final parsed = _asInt(value);
      if (parsed > 0) return parsed;
    }
    return fallback;
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
              if (_isBusinessUser)
                _buildMenuList()
              else
                _buildProfileShowcaseSection(),
              SizedBox(height: bottomSpacer),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    final title = _isBusinessUser ? _businessName : _nickname;

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
      child: Stack(
        children: [
          Column(
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
                        const SizedBox(height: 4),
                        Text(
                          _profileHandle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: context.artC.ink.withValues(alpha: 0.42),
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
              const SizedBox(height: 12),
              _ProfilePublicStats(
                followers: _followersCount,
                views: _profileViews,
                following: _followingCount,
                works: _worksCount,
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
            ],
          ),
          Positioned(
            top: 0,
            right: 0,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                GestureDetector(
                  onTap: !_isBusinessUser && !_hasCompletedOnboarding
                      ? _openOnboardingEditor
                      : _openEditProfile,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: context.artC.silver.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.edit_outlined,
                      size: 18,
                      color: context.artC.ink.withValues(alpha: 0.68),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _openSettings,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: context.artC.silver.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.settings_outlined,
                      size: 18,
                      color: context.artC.ink.withValues(alpha: 0.68),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  ({String label, VoidCallback onTap}) _primaryAction() {
    if (_isBusinessUser) {
      return (label: '查看主页', onTap: _openBusinessPublicProfile);
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

  void _openSettings() {
    Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => _SettingsScreen(
          isBusinessUser: _isBusinessUser,
          onSignOut: _signOut,
        ),
      ),
    );
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

  void _openPublicProfile() {
    Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => PublicUserProfileScreen(
          name: _isBusinessUser ? _businessName : _nickname,
          handle: _profileHandle,
          avatarUrl: _avatarUrl,
          roleLabel: _roleLabel,
          bio: _profileBio,
          kind: _publicProfileKind,
          featuredAnswerContext: '我的讨论回答',
          featuredAnswer: '回答、评论和社区观点会沉淀在这里，方便别人从讨论进入主页后继续了解我。',
        ),
      ),
    );
  }

  void _openBusinessPublicProfile() {
    final organizationId = _profile?['organization_id']?.toString() ??
        _profile?['primary_organization_id']?.toString();
    Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => OrganizationDetailScreen(
          initialOrg: {
            if (organizationId != null && organizationId.isNotEmpty)
              'id': organizationId,
            'name': _businessName,
            'type': _roleKey,
            'status': _isVerified ? 'active' : 'pending',
            'verification_status': _isVerified ? 'verified' : 'pending',
            'city': _cityLabel,
            'focus_areas': _asStringList(_profile?['target_directions']),
            'supports_online': true,
            'supports_offline': false,
            'rating': 0,
            'review_count': 0,
            'contract_count': 0,
            'metadata': {
              'summary': _profileBio,
              if (_avatarUrl.isNotEmpty) 'avatar_url': _avatarUrl,
              'response_speed': '2小时内',
            },
          },
        ),
      ),
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

  Future<void> _openArtistOnboarding() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(builder: (_) => const PublishArtistScreen()),
    );
    if (created == true) _load();
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

  Widget _buildProfileShowcaseSection() {
    const tabs = ['作品', '动态', '回答', '收藏 / 经历'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _ProfileShowcaseTabStrip(
          tabs: tabs,
          selectedIndex: _profileShowcaseTab,
          onChanged: (index) => setState(() => _profileShowcaseTab = index),
        ),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 180),
          child: _buildProfileShowcaseBody(),
        ),
      ],
    );
  }

  Widget _buildProfileShowcaseBody() {
    return switch (_profileShowcaseTab) {
      0 => _ProfileWorksPreview(
          key: const ValueKey('works'),
          seed: _profileHandle,
        ),
      1 => _ProfileTextPreview(
          key: const ValueKey('activity'),
          icon: Icons.auto_awesome_mosaic_outlined,
          title: _isBusinessUser ? '机构动态' : '最新动态',
          text: _isBusinessUser
              ? '服务更新、团队活动和案例进展会在这里展示。'
              : '作品集进度、创作过程和社区帖子会在这里展示。',
        ),
      2 => _ProfileTextPreview(
          key: const ValueKey('answers'),
          icon: Icons.question_answer_outlined,
          title: _publicProfileKind == PublicUserProfileKind.mentor
              ? '回答 / 案例'
              : '讨论回答',
          text: _publicProfileKind == PublicUserProfileKind.mentor
              ? '回答、案例拆解和经历判断会沉淀在主页，作为信任依据。'
              : '在热议、问答和评论区发布过的回答会沉淀在这里。',
        ),
      _ => _ProfileTextPreview(
          key: const ValueKey('saved'),
          icon: Icons.bookmark_border_rounded,
          title: _publicProfileKind == PublicUserProfileKind.artist
              ? '收藏 / 展览经历'
              : '收藏 / 经历',
          text: _publicProfileKind == PublicUserProfileKind.artist
              ? '展览记录、代表项目和收藏内容会集中展示。'
              : '收藏的案例、院校内容和公开经历会集中展示。',
        ),
    };
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
            _MenuAction('查看机构主页', Icons.open_in_new_rounded,
                _openBusinessPublicProfile),
          ]),
          _buildMenuSection('业务管理', [
            _MenuAction(
                '发布记录', Icons.history_outlined, _openContentSubmissions),
            _MenuAction('咨询与订单', Icons.receipt_long_outlined, _openOrders),
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
          if (!_isBusinessUser) ...[
            _MenuAction('导师中心', Icons.school_outlined, _openMentorCenter),
            _MenuAction('导师预约', Icons.event_note_outlined, _openMentorBookings),
          ],
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
      _MenuAction('艺术家入驻', Icons.palette_outlined, _openArtistOnboarding),
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

String _compactProfileNumber(int value) {
  if (value >= 10000) {
    final v = value / 10000;
    return '${v.toStringAsFixed(v >= 10 ? 0 : 1)}w';
  }
  if (value >= 1000) {
    final v = value / 1000;
    return '${v.toStringAsFixed(v >= 10 ? 0 : 1)}k';
  }
  return '$value';
}

class _ProfilePublicStats extends StatelessWidget {
  final int followers;
  final int views;
  final int following;
  final int works;

  const _ProfilePublicStats({
    required this.followers,
    required this.views,
    required this.following,
    required this.works,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      ('粉丝', followers),
      ('浏览', views),
      ('关注', following),
      ('作品', works),
    ];
    return Row(
      children: items
          .map(
            (item) => Expanded(
              child: Column(
                children: [
                  Text(
                    _compactProfileNumber(item.$2),
                    style: TextStyle(
                      color: context.artC.ink,
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.$1,
                    style: TextStyle(
                      color: context.artC.ink.withValues(alpha: 0.42),
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

class _ProfileShowcaseTabStrip extends StatelessWidget {
  final List<String> tabs;
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  const _ProfileShowcaseTabStrip({
    required this.tabs,
    required this.selectedIndex,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: context.artC.silver.withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: List.generate(tabs.length, (index) {
          final active = selectedIndex == index;
          return Expanded(
            child: GestureDetector(
              onTap: () => onChanged(index),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: active ? context.artC.cardIconBg : Colors.transparent,
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Text(
                  tabs[index],
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: active
                        ? context.artC.ink
                        : context.artC.ink.withValues(alpha: 0.46),
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _ProfileWorksPreview extends StatelessWidget {
  final String seed;

  const _ProfileWorksPreview({super.key, required this.seed});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      itemCount: 9,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 4,
        crossAxisSpacing: 4,
      ),
      itemBuilder: (_, index) {
        final encoded = Uri.encodeComponent('$seed-$index');
        return ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: Image.network(
            'https://picsum.photos/seed/artsee_profile_$encoded/360/360',
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              color: [
                const Color(0xFFE7EEF8),
                const Color(0xFFF0ECE4),
                const Color(0xFFE8F3EE),
                const Color(0xFFF4E8EA),
              ][index % 4],
              child: Icon(
                Icons.image_outlined,
                color: kCobalt.withValues(alpha: 0.34),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ProfileTextPreview extends StatelessWidget {
  final IconData icon;
  final String title;
  final String text;

  const _ProfileTextPreview({
    super.key,
    required this.icon,
    required this.title,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.32)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: kCobalt.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: kCobalt),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  text,
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.64),
                    fontSize: 12,
                    height: 1.48,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
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

class _SettingsScreen extends StatelessWidget {
  final bool isBusinessUser;
  final VoidCallback onSignOut;

  const _SettingsScreen({
    required this.isBusinessUser,
    required this.onSignOut,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('设置'),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          _SettingsSection(
            title: '账号与安全',
            items: [
              _SettingsItem(
                icon: Icons.lock_outline,
                title: '修改密码',
                onTap: () => _showComingSoon(context),
              ),
              _SettingsItem(
                icon: Icons.phone_outlined,
                title: '手机号绑定',
                onTap: () => _showComingSoon(context),
              ),
              _SettingsItem(
                icon: Icons.email_outlined,
                title: '邮箱绑定',
                onTap: () => _showComingSoon(context),
              ),
            ],
          ),
          _SettingsSection(
            title: '通知设置',
            items: [
              _SettingsItem(
                icon: Icons.notifications_outlined,
                title: '推送通知',
                onTap: () => _showComingSoon(context),
              ),
              _SettingsItem(
                icon: Icons.message_outlined,
                title: '消息通知',
                onTap: () => _showComingSoon(context),
              ),
            ],
          ),
          _SettingsSection(
            title: '显示与偏好',
            items: [
              _SettingsItem(
                icon: ArtseeThemeController.instance.isDark
                    ? Icons.wb_sunny_outlined
                    : Icons.nightlight_round,
                title: '深色模式',
                trailing: Switch(
                  value: ArtseeThemeController.instance.isDark,
                  onChanged: (_) => ArtseeThemeController.instance.toggle(),
                  activeColor: kCobalt,
                ),
                onTap: () => ArtseeThemeController.instance.toggle(),
              ),
            ],
          ),
          _SettingsSection(
            title: '关于',
            items: [
              _SettingsItem(
                icon: Icons.info_outline,
                title: '关于艺见心',
                onTap: () => _showComingSoon(context),
              ),
              _SettingsItem(
                icon: Icons.description_outlined,
                title: '用户协议',
                onTap: () => _showComingSoon(context),
              ),
              _SettingsItem(
                icon: Icons.privacy_tip_outlined,
                title: '隐私政策',
                onTap: () => _showComingSoon(context),
              ),
              _SettingsItem(
                icon: Icons.help_outline,
                title: '帮助与反馈',
                onTap: () => _showComingSoon(context),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: OutlinedButton(
              onPressed: () {
                Navigator.of(context).pop();
                onSignOut();
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: const Text(
                '退出登录',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('功能开发中...')),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<_SettingsItem> items;

  const _SettingsSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.5),
            ),
          ),
        ),
        ...items,
      ],
    );
  }
}

class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget? trailing;
  final VoidCallback onTap;

  const _SettingsItem({
    required this.icon,
    required this.title,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: context.artC.ink.withValues(alpha: 0.7)),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: context.artC.ink,
        ),
      ),
      trailing: trailing ??
          Icon(
            Icons.chevron_right,
            color: context.artC.ink.withValues(alpha: 0.3),
          ),
      onTap: onTap,
    );
  }
}

import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'consultation_detail_screen.dart';
import 'service_booking_detail_screen.dart';
import '../schools/school_detail_screen.dart';
import 'school_comparison_result_screen.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

enum ApplicationWorkspaceKind {
  savedSchools,
  programCompare,
  applicationPlan,
  portfolioTasks,
  consultations,
}

class ApplicationWorkspaceScreen extends StatefulWidget {
  final ApplicationWorkspaceKind kind;
  final VoidCallback? onOpenSchools;
  final VoidCallback? onOpenExplore;
  final VoidCallback? onOpenProfileSetup;

  const ApplicationWorkspaceScreen({
    super.key,
    required this.kind,
    this.onOpenSchools,
    this.onOpenExplore,
    this.onOpenProfileSetup,
  });

  @override
  State<ApplicationWorkspaceScreen> createState() =>
      _ApplicationWorkspaceScreenState();
}

class _ApplicationWorkspaceScreenState
    extends State<ApplicationWorkspaceScreen> {
  List<Map<String, dynamic>> _schools = [];
  Map<String, dynamic>? _applicationPlan;
  Map<String, dynamic>? _portfolioTaskData;
  List<Map<String, dynamic>> _consultations = [];
  List<Map<String, dynamic>> _serviceBookings = [];
  bool _loadingSchools = false;
  bool _loadingApplicationPlan = false;
  bool _loadingPortfolioTasks = false;
  bool _loadingConsultations = false;
  bool _generatingApplicationPlan = false;
  String? _schoolError;
  String? _applicationPlanError;
  String? _portfolioTaskError;
  String? _consultationError;
  String? _serviceBookingError;

  @override
  void initState() {
    super.initState();
    if (widget.kind == ApplicationWorkspaceKind.savedSchools) {
      _loadSchools();
    } else if (widget.kind == ApplicationWorkspaceKind.applicationPlan) {
      _loadApplicationPlan();
    } else if (widget.kind == ApplicationWorkspaceKind.portfolioTasks) {
      _loadPortfolioTasks();
    } else if (widget.kind == ApplicationWorkspaceKind.consultations) {
      _loadConsultations();
    }
  }

  Future<void> _loadSchools() async {
    setState(() {
      _loadingSchools = true;
      _schoolError = null;
    });
    try {
      final result = await BackendApiService.fetchSavedSchools(limit: 50);
      if (!mounted) return;
      setState(() {
        _schools = result.data;
        _loadingSchools = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _schoolError = e.toString();
        _loadingSchools = false;
      });
    }
  }

  Future<void> _loadApplicationPlan() async {
    setState(() {
      _loadingApplicationPlan = true;
      _applicationPlanError = null;
    });
    try {
      final data = await BackendApiService.fetchApplicationPlan();
      if (!mounted) return;
      setState(() {
        _applicationPlan = data;
        _loadingApplicationPlan = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _applicationPlanError = e.toString();
        _loadingApplicationPlan = false;
      });
    }
  }

  Future<void> _loadPortfolioTasks() async {
    setState(() {
      _loadingPortfolioTasks = true;
      _portfolioTaskError = null;
    });
    try {
      final data = await BackendApiService.fetchPortfolioTasks();
      if (!mounted) return;
      setState(() {
        _portfolioTaskData = data;
        _loadingPortfolioTasks = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _portfolioTaskError = e.toString();
        _loadingPortfolioTasks = false;
      });
    }
  }

  Future<void> _loadConsultations() async {
    setState(() {
      _loadingConsultations = true;
      _consultationError = null;
      _serviceBookingError = null;
    });
    try {
      final data = await BackendApiService.fetchConsultations();
      var bookings = <Map<String, dynamic>>[];
      String? bookingError;
      try {
        final bookingData = await BackendApiService.fetchMyServiceBookings();
        bookings = bookingData.data;
      } catch (e) {
        bookingError = e.toString();
      }
      if (!mounted) return;
      setState(() {
        _consultations = data.data;
        _serviceBookings = bookings;
        _serviceBookingError = bookingError;
        _loadingConsultations = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _consultationError = e.toString();
        _loadingConsultations = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final meta = _meta(widget.kind);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: _WorkspaceHeader(meta: meta),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
                child: _buildBody(meta),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(_WorkspaceMeta meta) {
    return switch (widget.kind) {
      ApplicationWorkspaceKind.savedSchools => _buildSavedSchools(),
      ApplicationWorkspaceKind.programCompare => _buildProgramCompare(),
      ApplicationWorkspaceKind.applicationPlan => _buildApplicationPlan(),
      ApplicationWorkspaceKind.portfolioTasks => _buildPortfolioTasks(),
      ApplicationWorkspaceKind.consultations => _buildConsultations(),
    };
  }

  void _openSchoolsOrHint() {
    final onOpenSchools = widget.onOpenSchools;
    if (onOpenSchools != null) {
      onOpenSchools();
      return;
    }
    _showToast('可从院校页搜索并收藏目标学校');
  }

  void _openExploreOrHint() {
    final onOpenExplore = widget.onOpenExplore;
    if (onOpenExplore != null) {
      onOpenExplore();
      return;
    }
    _showToast('可从发现页查看合作机会、展览活动和艺术家');
  }

  void _openProfileSetupOrHint() {
    final onOpenProfileSetup = widget.onOpenProfileSetup;
    if (onOpenProfileSetup != null) {
      onOpenProfileSetup();
      return;
    }
    _showToast('请回到我的页点击调整申请画像');
  }

  void _replaceWithKind(ApplicationWorkspaceKind kind) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute<void>(
        builder: (_) => ApplicationWorkspaceScreen(
          kind: kind,
          onOpenSchools: widget.onOpenSchools,
          onOpenExplore: widget.onOpenExplore,
          onOpenProfileSetup: widget.onOpenProfileSetup,
        ),
      ),
    );
  }

  Widget _buildSavedSchools() {
    if (_loadingSchools) {
      return const _LoadingCard(text: '正在加载院校...');
    }
    if (_schoolError != null) {
      return _EmptyWorkspaceCard(
        icon: Icons.error_outline,
        title: '院校加载失败',
        body: '稍后重试，或先去院校页搜索目标学校。',
        actionLabel: '重新加载',
        onAction: _loadSchools,
      );
    }
    if (_schools.isEmpty) {
      return _EmptyWorkspaceCard(
        icon: Icons.school_outlined,
        title: '还没有目标院校',
        body: '先去发现适合你的艺术院校，加入目标院校池后再做对比和计划。',
        actionLabel: '去搜索院校',
        onAction: _openSchoolsOrHint,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _SectionNote(
          text: '先把感兴趣的学校放进目标池，再加入对比或申请计划。',
          icon: Icons.account_tree_outlined,
        ),
        const SizedBox(height: 14),
        ..._schools.map(_buildSchoolCard),
      ],
    );
  }

  Widget _buildSchoolCard(Map<String, dynamic> school) {
    final id = school['id']?.toString();
    final name = school['name_zh']?.toString().isNotEmpty == true
        ? school['name_zh'].toString()
        : (school['name_en']?.toString() ?? '未知院校');
    final nameEn = school['name_en']?.toString();
    final country = school['country']?.toString();
    final city = school['city']?.toString();
    final disciplines = _stringList(school['strength_disciplines']).take(3);
    final rank = school['qs_art_rank'];

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.school_outlined, color: kCobalt),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                    if (nameEn != null && nameEn.isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Text(
                        nameEn,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: context.artC.ink.withValues(alpha: 0.38),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              _Tag('${country ?? '地区待补全'} · ${city ?? '城市待补全'}'),
              if (rank is num) _Tag('艺术排名 #${rank.toInt()}'),
              if (disciplines.isNotEmpty) _Tag(disciplines.join(' / ')),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _MiniAction(
                label: '查看详情',
                onTap: id == null
                    ? () => _showToast('院校详情暂不可用')
                    : () => Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => SchoolDetailScreen(id: id),
                          ),
                        ),
              ),
              const SizedBox(width: 8),
              _MiniAction(
                label: '加入对比',
                primary: true,
                onTap: id == null
                    ? () => _showToast('院校数据不可用')
                    : () => _showSchoolCompareSheet(_schools, initialId: id),
              ),
              const SizedBox(width: 8),
              _MiniAction(
                label: '加入计划',
                onTap: () =>
                    _replaceWithKind(ApplicationWorkspaceKind.applicationPlan),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgramCompare() {
    return FutureBuilder<
        ({List<Map<String, dynamic>> data, int? count, int limit, int offset})>(
      future: BackendApiService.fetchSavedSchools(limit: 5),
      builder: (context, snapshot) {
        final saved = snapshot.data?.data ?? const <Map<String, dynamic>>[];
        final canCompare = saved.length >= 2;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _EmptyWorkspaceCard(
              icon: Icons.compare_arrows_rounded,
              title: '还没有生成院校对比',
              body: '第一版先基于目标院校做多维比较，专业项目对比将在数据完善后开放。',
              actionLabel: '从目标池中选择',
              onAction: () {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  _showToast('正在加载目标院校');
                  return;
                }
                if (!canCompare) {
                  _showToast('目标池至少加入 2 所院校后再生成对比');
                  return;
                }
                _showSchoolCompareSheet(saved);
              },
            ),
            const SizedBox(height: 16),
            const _InsightCard(
              title: '对比会优先给结论',
              body: '综合推荐、6 维评分和详细表格会放在同一页，避免只看硬表格。',
              items: [
                '学术声誉',
                '专业匹配',
                '作品集难度',
                '申请竞争',
                '就业资源',
                '成本友好',
              ],
            ),
          ],
        );
      },
    );
  }

  void _showSchoolCompareSheet(
    List<Map<String, dynamic>> schools, {
    String? initialId,
  }) {
    final selected = <String>{if (initialId != null) initialId};
    var generating = false;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            Future<void> generate() async {
              if (generating) return;
              if (selected.length < 2) {
                _showToast('至少选择 2 所院校进行对比');
                return;
              }
              setSheetState(() => generating = true);
              try {
                final result = await BackendApiService.compareSchools(
                  schoolIds: selected.toList(),
                );
                if (!mounted || !sheetContext.mounted) return;
                Navigator.of(sheetContext).pop();
                Navigator.of(this.context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => SchoolComparisonResultScreen(
                      result: result,
                    ),
                  ),
                );
              } catch (e) {
                if (!mounted || !context.mounted) return;
                setSheetState(() => generating = false);
                _showToast('生成失败：$e');
              }
            }

            return Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
              decoration: BoxDecoration(
                color: context.artC.cardIconBg,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(22)),
                border: Border(
                  top: BorderSide(
                    color: context.artC.silver.withValues(alpha: 0.38),
                  ),
                ),
              ),
              child: SafeArea(
                top: false,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 38,
                        height: 4,
                        decoration: BoxDecoration(
                          color: context.artC.silver.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      '选择要对比的院校',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '请选择 2-5 所院校，先生成院校维度对比。',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: context.artC.ink.withValues(alpha: 0.42),
                      ),
                    ),
                    const SizedBox(height: 14),
                    ...schools.map((school) {
                      final id =
                          (school['id'] ?? school['school_id'])?.toString();
                      final name =
                          school['name_zh']?.toString().isNotEmpty == true
                              ? school['name_zh'].toString()
                              : (school['name_en']?.toString() ?? '未知院校');
                      final checked = id != null && selected.contains(id);
                      return CheckboxListTile(
                        value: checked,
                        contentPadding: EdgeInsets.zero,
                        activeColor: kCobalt,
                        title: Text(
                          name,
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                        onChanged: id == null
                            ? null
                            : (value) {
                                setSheetState(() {
                                  if (value == true) {
                                    if (selected.length >= 5) {
                                      _showToast('最多选择 5 所院校');
                                      return;
                                    }
                                    selected.add(id);
                                  } else {
                                    selected.remove(id);
                                  }
                                });
                              },
                      );
                    }),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: kCobalt,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                        ),
                        onPressed: generating ? null : generate,
                        child: Text(
                          generating ? '生成中...' : '生成对比',
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildApplicationPlan() {
    if (_loadingApplicationPlan) {
      return const _LoadingCard(text: '正在加载申请计划...');
    }
    if (_applicationPlanError != null) {
      return _EmptyWorkspaceCard(
        icon: Icons.error_outline,
        title: '申请计划加载失败',
        body: _applicationPlanError!,
        actionLabel: '重新加载',
        onAction: _loadApplicationPlan,
      );
    }

    final data = _applicationPlan ?? const <String, dynamic>{};
    final state = data['state']?.toString() ?? 'no_profile';
    final tasks = (data['tasks'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final savedSchools = (data['saved_schools'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final savedSchoolCount = data['saved_school_count'] is num
        ? (data['saved_school_count'] as num).toInt()
        : savedSchools.length;

    if (state == 'no_profile') {
      return _EmptyWorkspaceCard(
        icon: Icons.auto_awesome_outlined,
        title: '还不能生成申请计划',
        body: '请先完善申请画像，系统需要知道你的申请阶段、方向和目标城市。',
        actionLabel: '完善申请画像',
        onAction: _openProfileSetupOrHint,
      );
    }
    if (state == 'no_schools') {
      return _EmptyWorkspaceCard(
        icon: Icons.school_outlined,
        title: '还不能生成申请计划',
        body: '请先把至少 1 所学校加入目标院校池。',
        actionLabel: '去目标院校池',
        onAction: () => _replaceWithKind(ApplicationWorkspaceKind.savedSchools),
      );
    }
    if (state == 'ready_to_generate') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _TargetSchoolsCard(
            schools: savedSchools,
            count: savedSchoolCount,
          ),
          const SizedBox(height: 14),
          _EmptyWorkspaceCard(
            icon: Icons.event_note_outlined,
            title: '已具备生成条件',
            body: '系统会根据你的画像和目标院校生成申请时间线。',
            actionLabel: _generatingApplicationPlan ? '生成中...' : '生成申请计划',
            onAction:
                _generatingApplicationPlan ? () {} : _generateApplicationPlan,
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _TargetSchoolsCard(
          schools: savedSchools,
          count: savedSchoolCount,
        ),
        const SizedBox(height: 14),
        _SectionNote(
          text:
              (data['plan'] as Map<String, dynamic>?)?['summary']?.toString() ??
                  '这是根据你的画像和目标院校生成的申请时间线。',
          icon: Icons.route_outlined,
        ),
        const SizedBox(height: 14),
        _TimelinePreview(
          tasks: tasks,
          onToggle: _toggleApplicationPlanTask,
        ),
        const SizedBox(height: 14),
        _MiniAction(
          label: _generatingApplicationPlan ? '重新生成中...' : '按当前目标院校重新生成',
          primary: true,
          onTap: _generatingApplicationPlan ? () {} : _generateApplicationPlan,
        ),
      ],
    );
  }

  Widget _buildPortfolioTasks() {
    if (_loadingPortfolioTasks) {
      return const _LoadingCard(text: '正在加载作品集任务...');
    }
    if (_portfolioTaskError != null) {
      return _EmptyWorkspaceCard(
        icon: Icons.error_outline,
        title: '作品集任务加载失败',
        body: _portfolioTaskError!,
        actionLabel: '重新加载',
        onAction: _loadPortfolioTasks,
      );
    }
    final data = _portfolioTaskData ?? const <String, dynamic>{};
    final state = data['state']?.toString() ?? 'need_profile';
    final groups = (data['groups'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();

    if (state == 'need_profile') {
      return _EmptyWorkspaceCard(
        icon: Icons.auto_awesome_outlined,
        title: '还不能拆解作品集任务',
        body: '请先完善申请方向，系统需要知道你要申请的艺术方向。',
        actionLabel: '完善申请方向',
        onAction: _openProfileSetupOrHint,
      );
    }
    if (state == 'ready_to_generate') {
      return _EmptyWorkspaceCard(
        icon: Icons.task_alt_outlined,
        title: '还没有拆解作品集任务',
        body: '选择目标方向后，系统会把作品集拆成具体步骤。',
        actionLabel: '开始拆解',
        onAction: _generatePortfolioTasks,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _SectionNote(
          text: '作品集任务已拆成可执行步骤，点击圆圈可切换完成状态。',
          icon: Icons.check_circle_outline_rounded,
        ),
        const SizedBox(height: 14),
        _TaskGroupCard(
          groups: groups,
          onToggle: _togglePortfolioTask,
        ),
      ],
    );
  }

  Widget _buildConsultations() {
    if (_loadingConsultations) {
      return const _LoadingCard(text: '正在加载咨询记录...');
    }
    if (_consultationError != null) {
      return _EmptyWorkspaceCard(
        icon: Icons.error_outline,
        title: '咨询记录加载失败',
        body: _consultationError!,
        actionLabel: '重新加载',
        onAction: _loadConsultations,
      );
    }
    if (_consultations.isEmpty && _serviceBookings.isEmpty) {
      return _EmptyWorkspaceCard(
        icon: Icons.chat_bubble_outline_rounded,
        title: '还没有咨询记录',
        body: '你可以在院校、机构或活动页面发起咨询，之后会在这里统一管理。',
        actionLabel: '去发现机会',
        onAction: _openExploreOrHint,
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_serviceBookings.isNotEmpty) ...[
          _buildServiceBookingSection(),
          const SizedBox(height: 16),
        ] else if (_serviceBookingError != null) ...[
          _SectionNote(
            text: '预约服务加载失败：$_serviceBookingError',
            icon: Icons.error_outline,
          ),
          const SizedBox(height: 16),
        ],
        if (_consultations.isNotEmpty)
          ..._consultations.map(_buildConsultationCard)
        else
          const _SectionNote(
            text: '预约服务已从咨询转出，原咨询会话同步后会显示在这里。',
            icon: Icons.forum_outlined,
          ),
      ],
    );
  }

  Widget _buildServiceBookingSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.09),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: const Icon(
                  Icons.event_available_outlined,
                  color: kCobalt,
                  size: 19,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '预约服务',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
              ),
              _Tag('${_serviceBookings.length} 条'),
            ],
          ),
          const SizedBox(height: 12),
          ..._serviceBookings.map(_buildServiceBookingCard),
        ],
      ),
    );
  }

  Future<void> _generateApplicationPlan() async {
    if (_generatingApplicationPlan) return;
    setState(() => _generatingApplicationPlan = true);
    try {
      final data = await BackendApiService.generateApplicationPlan();
      if (!mounted) return;
      setState(() => _applicationPlan = data);
    } catch (e) {
      if (mounted) _showToast('生成失败：$e');
    } finally {
      if (mounted) setState(() => _generatingApplicationPlan = false);
    }
  }

  Future<void> _generatePortfolioTasks() async {
    try {
      final data = await BackendApiService.generatePortfolioTasks();
      if (!mounted) return;
      setState(() => _portfolioTaskData = data);
    } catch (e) {
      if (mounted) _showToast('生成失败：$e');
    }
  }

  Future<void> _toggleApplicationPlanTask(Map<String, dynamic> task) async {
    final id = task['id']?.toString();
    if (id == null) return;
    final next = task['status'] == 'done' ? 'todo' : 'done';
    try {
      await BackendApiService.updateApplicationPlanTask(id, next);
      await _loadApplicationPlan();
    } catch (e) {
      if (mounted) _showToast('更新失败：$e');
    }
  }

  Future<void> _togglePortfolioTask(Map<String, dynamic> task) async {
    final id = task['id']?.toString();
    if (id == null) return;
    final next = task['status'] == 'done' ? 'todo' : 'done';
    try {
      await BackendApiService.updatePortfolioTask(id, next);
      await _loadPortfolioTasks();
    } catch (e) {
      if (mounted) _showToast('更新失败：$e');
    }
  }

  Widget _buildConsultationCard(Map<String, dynamic> item) {
    final status = item['status']?.toString() ?? 'pending';
    final topicLabel = _consultationTopicLabel(item['topic']?.toString());
    final updatedAt = _formatConsultationTime(item['updated_at']);
    final createdAt = _formatConsultationTime(item['created_at']);
    final unread = _intValue(item['unread_count']);
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () async {
        await Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => ConsultationDetailScreen(consultation: item),
          ),
        );
        if (mounted) _loadConsultations();
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: _cardDecoration(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    item['target_name']?.toString() ?? '咨询对象',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                    ),
                  ),
                ),
                if (unread > 0) ...[
                  const SizedBox(width: 8),
                  _UnreadBadge(count: unread),
                ],
              ],
            ),
            const SizedBox(height: 8),
            Text(
              item['last_message']?.toString() ?? '暂无消息',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 13,
                height: 1.4,
                fontWeight: FontWeight.w700,
                color: context.artC.ink.withValues(alpha: 0.48),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _Tag(_consultationStatusLabel(status)),
                if (topicLabel != null) _Tag(topicLabel),
                if (updatedAt != null) _Tag('更新 $updatedAt'),
                if (createdAt != null) _Tag('创建 $createdAt'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceBookingCard(Map<String, dynamic> item) {
    final consultation = _consultationFromServiceBooking(item);
    final title = item['title']?.toString() ?? '预约服务';
    final status = item['status']?.toString() ?? 'requested';
    final scheduledAt = _formatConsultationTime(item['scheduled_at']);
    final updatedAt =
        _formatConsultationTime(item['updated_at'] ?? item['created_at']);
    final targetName = consultation?['target_name']?.toString() ??
        item['service_type']?.toString();

    Future<void> openBooking() async {
      await Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => ServiceBookingDetailScreen(booking: item),
        ),
      );
      if (mounted) _loadConsultations();
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: openBooking,
      child: Container(
        margin: const EdgeInsets.only(top: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: context.artC.porcelain,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: context.artC.silver.withValues(alpha: 0.24),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                    ),
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  color: context.artC.ink.withValues(alpha: 0.3),
                ),
              ],
            ),
            if (targetName != null && targetName.isNotEmpty) ...[
              const SizedBox(height: 5),
              Text(
                targetName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: context.artC.ink.withValues(alpha: 0.48),
                ),
              ),
            ],
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _Tag(_serviceBookingStatusLabel(status)),
                if (scheduledAt != null) _Tag('排期 $scheduledAt'),
                if (updatedAt != null) _Tag('更新 $updatedAt'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showToast(String text) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

String _consultationStatusLabel(String status) {
  switch (status) {
    case 'new':
      return '新咨询';
    case 'pending':
      return '等待回复';
    case 'active':
      return '沟通中';
    case 'closed':
      return '已结束';
    case 'converted':
      return '已转化';
    default:
      return status;
  }
}

String _serviceBookingStatusLabel(String status) {
  switch (status) {
    case 'requested':
      return '待确认';
    case 'confirmed':
      return '已确认';
    case 'scheduled':
      return '已排期';
    case 'completed':
      return '已完成';
    case 'canceled':
      return '已取消';
    default:
      return status;
  }
}

Map<String, dynamic>? _consultationFromServiceBooking(
  Map<String, dynamic> booking,
) {
  final consultation = booking['consultation'];
  return consultation is Map<String, dynamic> ? consultation : null;
}

String? _consultationTopicLabel(String? topic) {
  switch (topic) {
    case 'portfolio':
      return '作品集';
    case 'major':
      return '专业选择';
    case 'timeline':
      return '申请时间线';
    case 'budget':
      return '费用预算';
    case 'language':
      return '语言要求';
    default:
      return topic == null || topic.isEmpty ? null : topic;
  }
}

String? _formatConsultationTime(dynamic raw) {
  final value = raw?.toString();
  if (value == null || value.isEmpty) return null;
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final local = parsed.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${local.year}-${two(local.month)}-${two(local.day)} '
      '${two(local.hour)}:${two(local.minute)}';
}

class _WorkspaceHeader extends StatelessWidget {
  final _WorkspaceMeta meta;

  const _WorkspaceHeader({required this.meta});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: context.artC.cardIconBg,
              shape: BoxShape.circle,
              border: Border.all(
                color: context.artC.silver.withValues(alpha: 0.42),
              ),
            ),
            child: Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 17,
              color: context.artC.ink.withValues(alpha: 0.62),
            ),
          ),
        ),
        const SizedBox(height: 18),
        Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: kCobalt.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(meta.icon, color: kCobalt),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    meta.title,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    meta.subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: context.artC.ink.withValues(alpha: 0.42),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _EmptyWorkspaceCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;
  final String actionLabel;
  final VoidCallback onAction;

  const _EmptyWorkspaceCard({
    required this.icon,
    required this.title,
    required this.body,
    required this.actionLabel,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _cardDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: kCobalt, size: 28),
          const SizedBox(height: 14),
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: TextStyle(
              fontSize: 13,
              height: 1.45,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.44),
            ),
          ),
          const SizedBox(height: 18),
          _MiniAction(label: actionLabel, primary: true, onTap: onAction),
        ],
      ),
    );
  }
}

class _InsightCard extends StatelessWidget {
  final String title;
  final String body;
  final List<String> items;

  const _InsightCard({
    required this.title,
    required this.body,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _cardDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: TextStyle(
              fontSize: 13,
              height: 1.45,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.44),
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: items.map(_Tag.new).toList(),
          ),
        ],
      ),
    );
  }
}

class _TargetSchoolsCard extends StatelessWidget {
  final List<Map<String, dynamic>> schools;
  final int count;

  const _TargetSchoolsCard({required this.schools, required this.count});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _cardDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.school_outlined,
                  color: kCobalt,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '目标院校池',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
              ),
              _Tag('$count 所'),
            ],
          ),
          const SizedBox(height: 12),
          if (schools.isEmpty)
            Text(
              '还没有读取到目标院校。请先从院校详情页加入目标院校池。',
              style: TextStyle(
                fontSize: 13,
                height: 1.45,
                fontWeight: FontWeight.w700,
                color: context.artC.ink.withValues(alpha: 0.44),
              ),
            )
          else
            ...schools.take(5).map((school) {
              final name = school['name_zh']?.toString().isNotEmpty == true
                  ? school['name_zh'].toString()
                  : (school['name_en']?.toString() ?? '目标院校');
              final country = school['country']?.toString();
              final city = school['city']?.toString();
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Icon(
                      Icons.check_circle_rounded,
                      size: 16,
                      color: kCobalt.withValues(alpha: 0.88),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        [
                          name,
                          if (city != null || country != null)
                            [
                              if (city != null) city,
                              if (country != null) country
                            ].join(' · '),
                        ].join(' · '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: context.artC.ink.withValues(alpha: 0.68),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          if (schools.length > 5)
            Text(
              '另有 ${schools.length - 5} 所目标院校已纳入计划。',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: context.artC.ink.withValues(alpha: 0.38),
              ),
            ),
        ],
      ),
    );
  }
}

class _TimelinePreview extends StatelessWidget {
  final List<Map<String, dynamic>> tasks;
  final ValueChanged<Map<String, dynamic>> onToggle;

  const _TimelinePreview({required this.tasks, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    final grouped = <String, List<Map<String, dynamic>>>{};
    for (final task in tasks) {
      final month = task['month_label']?.toString() ?? '待安排';
      grouped.putIfAbsent(month, () => []).add(task);
    }
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _cardDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: grouped.entries
            .map(
              (entry) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 42,
                      child: Text(
                        entry.key,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: kCobalt,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: entry.value
                            .map(
                              (task) => _SimpleCheckRow(
                                task: task,
                                onTap: () => onToggle(task),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _TaskGroupCard extends StatelessWidget {
  final List<Map<String, dynamic>> groups;
  final ValueChanged<Map<String, dynamic>> onToggle;

  const _TaskGroupCard({required this.groups, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _cardDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: groups
            .map(
              (group) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      group['title']?.toString() ?? '任务组',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ...(group['tasks'] as List<dynamic>? ?? [])
                        .whereType<Map<String, dynamic>>()
                        .map(
                          (task) => _SimpleCheckRow(
                            task: task,
                            onTap: () => onToggle(task),
                          ),
                        ),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _SimpleCheckRow extends StatelessWidget {
  final Map<String, dynamic> task;
  final VoidCallback onTap;

  const _SimpleCheckRow({required this.task, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final done = task['status'] == 'done';
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 7),
        child: Row(
          children: [
            Icon(
              done ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
              size: 17,
              color: done ? kCobalt : context.artC.ink.withValues(alpha: 0.28),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                task['title']?.toString() ?? '任务',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  decoration: done ? TextDecoration.lineThrough : null,
                  color: done
                      ? context.artC.ink.withValues(alpha: 0.34)
                      : context.artC.ink.withValues(alpha: 0.62),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionNote extends StatelessWidget {
  final String text;
  final IconData icon;

  const _SectionNote({required this.text, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kCobalt.withValues(alpha: 0.12)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: kCobalt),
          const SizedBox(width: 9),
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

class _MiniAction extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool primary;

  const _MiniAction({
    required this.label,
    required this.onTap,
    this.primary = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
        decoration: BoxDecoration(
          color:
              primary ? kCobalt : context.artC.silver.withValues(alpha: 0.22),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w900,
            color: primary
                ? Colors.white
                : context.artC.ink.withValues(alpha: 0.64),
          ),
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final String label;

  const _Tag(this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: context.artC.silver.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: context.artC.ink.withValues(alpha: 0.5),
        ),
      ),
    );
  }
}

class _UnreadBadge extends StatelessWidget {
  final int count;

  const _UnreadBadge({required this.count});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: 22),
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFE11D48),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        count > 99 ? '99+' : '$count',
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

int _intValue(dynamic value) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

class _LoadingCard extends StatelessWidget {
  final String text;

  const _LoadingCard({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: _cardDecoration(context),
      child: Row(
        children: [
          const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2.4),
          ),
          const SizedBox(width: 12),
          Text(
            text,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: context.artC.ink.withValues(alpha: 0.52),
            ),
          ),
        ],
      ),
    );
  }
}

class _WorkspaceMeta {
  final String title;
  final String subtitle;
  final IconData icon;

  const _WorkspaceMeta(this.title, this.subtitle, this.icon);
}

_WorkspaceMeta _meta(ApplicationWorkspaceKind kind) {
  return switch (kind) {
    ApplicationWorkspaceKind.savedSchools => const _WorkspaceMeta(
        '目标院校池',
        '加入目标池的院校会在这里统一管理',
        Icons.school_outlined,
      ),
    ApplicationWorkspaceKind.programCompare => const _WorkspaceMeta(
        '院校对比',
        '先基于目标院校做多维比较',
        Icons.compare_arrows_rounded,
      ),
    ApplicationWorkspaceKind.applicationPlan => const _WorkspaceMeta(
        '申请计划',
        '根据目标院校和申请阶段生成时间安排',
        Icons.event_note_outlined,
      ),
    ApplicationWorkspaceKind.portfolioTasks => const _WorkspaceMeta(
        '作品集任务',
        '把作品集拆成可执行的小任务',
        Icons.task_alt_outlined,
      ),
    ApplicationWorkspaceKind.consultations => const _WorkspaceMeta(
        '咨询记录',
        '查看你联系过的机构、顾问和服务',
        Icons.chat_bubble_outline_rounded,
      ),
  };
}

BoxDecoration _cardDecoration(BuildContext context) {
  return BoxDecoration(
    color: context.artC.cardIconBg,
    borderRadius: BorderRadius.circular(18),
    border: Border.all(color: context.artC.silver.withValues(alpha: 0.26)),
    boxShadow: [
      BoxShadow(
        color: context.artC.ink.withValues(alpha: 0.026),
        blurRadius: 12,
        offset: const Offset(0, 4),
      ),
    ],
  );
}

List<String> _stringList(dynamic value) {
  if (value is List) {
    return value
        .map((item) => item.toString())
        .where((item) => item.isNotEmpty)
        .toList();
  }
  return const [];
}

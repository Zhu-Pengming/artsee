import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/api_config.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';
import 'workbench_consultation_detail_screen.dart';
import 'workbench_contracts_screen.dart';
import 'workbench_team_screen.dart';

class InstitutionWorkspaceScreen extends StatefulWidget {
  final Map<String, dynamic>? profile;

  const InstitutionWorkspaceScreen({
    super.key,
    this.profile,
  });

  @override
  State<InstitutionWorkspaceScreen> createState() =>
      _InstitutionWorkspaceScreenState();
}

class _InstitutionWorkspaceScreenState
    extends State<InstitutionWorkspaceScreen> {
  List<Map<String, dynamic>> _leads = [];
  List<Map<String, dynamic>> _serviceBookings = [];
  List<Map<String, dynamic>> _organizations = [];
  int _pendingContractCount = 0;
  bool _loading = true;
  bool _bookingLoading = true;
  bool _orgLoading = true;
  bool _contractLoading = false;
  String? _error;
  String? _bookingError;
  String? _orgError;
  String? _contractError;

  @override
  void initState() {
    super.initState();
    _loadLeads();
    _loadServiceBookings();
    _loadOrganizations();
  }

  @override
  void didUpdateWidget(covariant InstitutionWorkspaceScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.profile?['id'] != widget.profile?['id']) {
      _loadLeads();
      _loadServiceBookings();
      _loadOrganizations();
    }
  }

  Future<void> _loadLeads() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.fetchWorkbenchConsultations();
      if (!mounted) return;
      setState(() {
        _leads = result.data;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _loadOrganizations() async {
    setState(() {
      _orgLoading = true;
      _orgError = null;
    });
    try {
      final result = await BackendApiService.fetchMyOrganizations();
      if (!mounted) return;
      setState(() {
        _organizations = result.data;
        _orgLoading = false;
      });
      if (_canManageContractsFor(result.data)) {
        _loadPendingContracts();
      } else {
        setState(() {
          _pendingContractCount = 0;
          _contractLoading = false;
          _contractError = null;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _orgError = e.toString();
        _orgLoading = false;
        _pendingContractCount = 0;
        _contractLoading = false;
      });
    }
  }

  Future<void> _loadPendingContracts() async {
    setState(() {
      _contractLoading = true;
      _contractError = null;
    });
    try {
      final result = await BackendApiService.fetchWorkbenchContracts(
        limit: 1,
        status: 'pending',
      );
      if (!mounted) return;
      setState(() {
        _pendingContractCount = result.count ?? result.data.length;
        _contractLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _pendingContractCount = 0;
        _contractError = e.toString();
        _contractLoading = false;
      });
    }
  }

  Future<void> _loadServiceBookings() async {
    setState(() {
      _bookingLoading = true;
      _bookingError = null;
    });
    try {
      final result = await BackendApiService.fetchWorkbenchServiceBookings();
      if (!mounted) return;
      setState(() {
        _serviceBookings = result.data;
        _bookingLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _bookingError = e.toString();
        _bookingLoading = false;
      });
    }
  }

  int _countStatus(String status) {
    return _leads.where((lead) => lead['status']?.toString() == status).length;
  }

  int get _leadUnreadCount {
    return _leads.fold<int>(
      0,
      (sum, lead) => sum + _intValue(lead['unread_count']),
    );
  }

  bool get _canManageContracts {
    return _canManageContractsFor(_organizations);
  }

  String get _contractActionSubtitle {
    if (_orgLoading) return '同步机构权限';
    if (_orgError != null) return '机构权限待恢复';
    if (_contractLoading) return '同步合同存档';
    if (_contractError != null) return '合同存档待恢复';
    if (_canManageContracts && _pendingContractCount > 0) {
      return '$_pendingContractCount 份待确认';
    }
    if (_canManageContracts) return '确认签约与争议';
    return '仅负责人/管理员可用';
  }

  Future<void> _openLead(Map<String, dynamic> lead) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => WorkbenchConsultationDetailScreen(
          consultation: lead,
        ),
      ),
    );
    if (mounted) {
      _loadLeads();
      _loadServiceBookings();
    }
  }

  Future<void> _openOrganizationProfile() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _OrganizationProfileSheet(
        organizations: _organizations,
        loading: _orgLoading,
        error: _orgError,
        onRetry: _loadOrganizations,
        onCreated: _loadOrganizations,
      ),
    );
  }

  Future<void> _openTeamManagement() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => WorkbenchTeamScreen(
          leads: _leads,
          serviceBookings: _serviceBookings,
        ),
      ),
    );
    if (mounted) {
      _loadLeads();
      _loadServiceBookings();
    }
  }

  Future<void> _openWorkbenchContracts() async {
    if (!_canManageContracts) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('仅机构负责人或管理员可管理合同存档')),
      );
      return;
    }
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => WorkbenchContractsScreen(
          initialStatus: _pendingContractCount > 0 ? 'pending' : 'all',
        ),
      ),
    );
    if (mounted) {
      _loadOrganizations();
    }
  }

  Future<void> _openLeadList(_WorkbenchListMode mode) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => _WorkbenchListSheet(
        mode: mode,
        leads: _leads,
        serviceBookings: _serviceBookings,
        loading: _loading,
        bookingLoading: _bookingLoading,
        error: _error,
        bookingError: _bookingError,
        onRetry: _loadLeads,
        onBookingRetry: _loadServiceBookings,
        onOpen: (lead) {
          Navigator.of(sheetContext).pop();
          _openLead(lead);
        },
      ),
    );
  }

  String _conversionSubtitle(String type, String fallback) {
    if (type == 'service_booking') {
      if (_bookingLoading) return '同步预约记录';
      if (_serviceBookings.isEmpty) return '暂无$fallback记录';
      return '${_serviceBookings.length} 条$fallback记录';
    }
    final count = _leads.where((lead) => _conversionType(lead) == type).length;
    return count == 0 ? '暂无$fallback记录' : '$count 条$fallback记录';
  }

  @override
  Widget build(BuildContext context) {
    final verified = widget.profile?['is_verified'] == true;
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
            child: _LeadStatusStrip(
              items: [
                _WorkbenchMetric(
                  '新线索',
                  '${_countStatus('new')}',
                  '刚分配',
                  Icons.auto_awesome_motion_rounded,
                  kCobalt,
                ),
                _WorkbenchMetric(
                  '待回复',
                  '${_countStatus('pending')}',
                  '等待回复',
                  Icons.mark_chat_unread_rounded,
                  const Color(0xFFD97706),
                ),
                _WorkbenchMetric(
                  '沟通中',
                  '${_countStatus('active')}',
                  '持续跟进',
                  Icons.forum_rounded,
                  const Color(0xFF059669),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(18, 12, 18, 0),
            child: _LeadInboxPreview(
              verified: verified,
              leads: _leads,
              loading: _loading,
              error: _error,
              onRetry: _loadLeads,
              onViewAll: () => _openLeadList(_WorkbenchListMode.leads),
              onOpen: _openLead,
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              18,
              14,
              18,
              mainTabBottomInset(context) + 18,
            ),
            child: _WorkspaceActionGrid(
              items: [
                _WorkbenchAction(
                  icon: Icons.support_agent_outlined,
                  title: '咨询线索',
                  subtitle: _leads.isEmpty
                      ? '处理申请咨询'
                      : _leadUnreadCount > 0
                          ? '${_leads.length} 条可处理 · $_leadUnreadCount 条未读'
                          : '${_leads.length} 条可处理',
                  badgeCount: _leadUnreadCount,
                  onTap: () => _openLeadList(_WorkbenchListMode.leads),
                ),
                _WorkbenchAction(
                  icon: Icons.event_available_outlined,
                  title: '预约服务',
                  subtitle: _conversionSubtitle('service_booking', '转预约'),
                  onTap: () => _openLeadList(_WorkbenchListMode.bookings),
                ),
                _WorkbenchAction(
                  icon: Icons.receipt_long_outlined,
                  title: '订单转化',
                  subtitle: _conversionSubtitle('order', '转订单'),
                  onTap: () => _openLeadList(_WorkbenchListMode.orders),
                ),
                _WorkbenchAction(
                  icon: Icons.groups_2_outlined,
                  title: '团队管理',
                  subtitle: '成员角色与工作量',
                  onTap: _openTeamManagement,
                ),
                _WorkbenchAction(
                  icon: Icons.description_outlined,
                  title: '合同存档',
                  subtitle: _contractActionSubtitle,
                  badgeCount: _pendingContractCount,
                  onTap: _openWorkbenchContracts,
                ),
                _WorkbenchAction(
                  icon: Icons.verified_user_outlined,
                  title: '机构资料',
                  subtitle: _organizationActionSubtitle(
                    _organizations,
                    _orgLoading,
                  ),
                  onTap: _openOrganizationProfile,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _LeadStatusStrip extends StatelessWidget {
  final List<_WorkbenchMetric> items;

  const _LeadStatusStrip({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      decoration: _panelDecoration(context),
      child: Row(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            Expanded(child: _LeadMetricCell(item: items[i])),
            if (i != items.length - 1)
              Container(
                width: 1,
                height: 50,
                color: context.artC.silver.withValues(alpha: 0.28),
              ),
          ],
        ],
      ),
    );
  }
}

class _LeadMetricCell extends StatelessWidget {
  final _WorkbenchMetric item;

  const _LeadMetricCell({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: item.accent.withValues(alpha: 0.09),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(item.icon, size: 15, color: item.accent),
              ),
              const Spacer(),
              Text(
                item.value,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: item.accent,
                ),
              ),
            ],
          ),
          const SizedBox(height: 9),
          Text(
            item.label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            item.caption,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.42),
            ),
          ),
        ],
      ),
    );
  }
}

class _LeadInboxPreview extends StatelessWidget {
  final bool verified;
  final List<Map<String, dynamic>> leads;
  final bool loading;
  final String? error;
  final VoidCallback onRetry;
  final VoidCallback onViewAll;
  final ValueChanged<Map<String, dynamic>> onOpen;

  const _LeadInboxPreview({
    required this.verified,
    required this.leads,
    required this.loading,
    required this.error,
    required this.onRetry,
    required this.onViewAll,
    required this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    final visibleLeads = leads.take(5).toList();
    return Container(
      padding: const EdgeInsets.fromLTRB(15, 15, 15, 16),
      decoration: _panelDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.09),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.mark_chat_unread_outlined,
                  color: kCobalt.withValues(alpha: 0.92),
                  size: 19,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '咨询线索',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '最近分配与未读消息',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        color: context.artC.ink.withValues(alpha: 0.4),
                      ),
                    ),
                  ],
                ),
              ),
              if (!loading && leads.isNotEmpty)
                TextButton(
                  style: TextButton.styleFrom(
                    foregroundColor: kCobalt,
                    visualDensity: VisualDensity.compact,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    textStyle: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  onPressed: onViewAll,
                  child: const Text('查看全部'),
                )
              else
                _StatusPill(
                  label: loading
                      ? '同步中'
                      : verified
                          ? '等待分配'
                          : '先完成认证',
                  strong: verified,
                ),
            ],
          ),
          if (loading || error != null || visibleLeads.isNotEmpty) ...[
            const SizedBox(height: 13),
            if (loading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 18),
                child: Center(
                  child: CircularProgressIndicator(
                    color: kCobalt,
                    strokeWidth: 2.5,
                  ),
                ),
              )
            else if (error != null)
              _LeadInlineError(error: error!, onRetry: onRetry)
            else
              Column(
                children: [
                  for (var i = 0; i < visibleLeads.length; i++) ...[
                    _LeadRow(
                      lead: visibleLeads[i],
                      onTap: () => onOpen(visibleLeads[i]),
                    ),
                    if (i != visibleLeads.length - 1)
                      Divider(
                        height: 1,
                        color: context.artC.silver.withValues(alpha: 0.22),
                      ),
                  ],
                ],
              ),
          ],
        ],
      ),
    );
  }
}

class _LeadRow extends StatelessWidget {
  final Map<String, dynamic> lead;
  final VoidCallback onTap;
  final bool selectionMode;
  final bool selected;
  final VoidCallback? onSelectedChanged;

  const _LeadRow({
    required this.lead,
    required this.onTap,
    this.selectionMode = false,
    this.selected = false,
    this.onSelectedChanged,
  });

  @override
  Widget build(BuildContext context) {
    final targetName = lead['target_name']?.toString() ?? '未命名咨询';
    final lastMessage = lead['last_message']?.toString();
    final status = lead['status']?.toString() ?? 'new';
    final topic = _topicLabel(lead['topic']?.toString());
    final assignmentName = _leadAssignmentName(lead);
    final updatedAt =
        _formatShortTime(lead['updated_at'] ?? lead['created_at']);
    final unread = _intValue(lead['unread_count']);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: selectionMode ? onSelectedChanged : onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Row(
            children: [
              if (selectionMode)
                Checkbox(
                  value: selected,
                  onChanged: (_) => onSelectedChanged?.call(),
                  activeColor: kCobalt,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6),
                  ),
                )
              else
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: kCobalt.withValues(alpha: 0.09),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.school_outlined,
                    color: kCobalt,
                    size: 19,
                  ),
                ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            targetName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: context.artC.ink,
                            ),
                          ),
                        ),
                        if (unread > 0) ...[
                          const SizedBox(width: 8),
                          _LeadUnreadBadge(count: unread),
                        ],
                        if (updatedAt != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            updatedAt,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: context.artC.ink.withValues(alpha: 0.36),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      (lastMessage == null || lastMessage.trim().isEmpty)
                          ? '暂无消息内容'
                          : lastMessage,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: context.artC.ink.withValues(alpha: 0.52),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _MiniLeadTag(label: _statusLabel(status), strong: true),
                        if (topic != null) _MiniLeadTag(label: topic),
                        _MiniLeadTag(label: assignmentName),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.chevron_right_rounded,
                color: context.artC.ink.withValues(alpha: 0.28),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LeadInlineError extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const _LeadInlineError({
    required this.error,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.porcelain,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: context.artC.silver.withValues(alpha: 0.24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '线索加载失败',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            error,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12,
              height: 1.4,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.52),
            ),
          ),
          const SizedBox(height: 10),
          TextButton.icon(
            style: TextButton.styleFrom(foregroundColor: kCobalt),
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('重新加载'),
          ),
        ],
      ),
    );
  }
}

class _MiniLeadTag extends StatelessWidget {
  final String label;
  final bool strong;

  const _MiniLeadTag({
    required this.label,
    this.strong = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: strong
            ? kCobalt.withValues(alpha: 0.09)
            : context.artC.silver.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: strong ? kCobalt : context.artC.ink.withValues(alpha: 0.48),
        ),
      ),
    );
  }
}

class _LeadUnreadBadge extends StatelessWidget {
  final int count;

  const _LeadUnreadBadge({required this.count});

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

class _WorkspaceActionGrid extends StatelessWidget {
  final List<_WorkbenchAction> items;

  const _WorkspaceActionGrid({required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(2, 0, 2, 10),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  '工作入口',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
              ),
              Text(
                '线索 · 预约 · 协作',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: context.artC.ink.withValues(alpha: 0.42),
                ),
              ),
            ],
          ),
        ),
        GridView.builder(
          shrinkWrap: true,
          padding: EdgeInsets.zero,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: items.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.42,
          ),
          itemBuilder: (context, index) {
            final item = items[index];
            final primary = index == 0;
            return Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: item.onTap,
                child: Ink(
                  padding: const EdgeInsets.all(13),
                  decoration: BoxDecoration(
                    color: primary
                        ? kCobalt.withValues(alpha: 0.055)
                        : context.artC.cardIconBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: primary
                          ? kCobalt.withValues(alpha: 0.14)
                          : context.artC.silver.withValues(alpha: 0.26),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: context.artC.ink.withValues(alpha: 0.024),
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
                          Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Container(
                                width: 35,
                                height: 35,
                                decoration: BoxDecoration(
                                  color: primary
                                      ? kCobalt.withValues(alpha: 0.12)
                                      : kCobalt.withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  item.icon,
                                  size: 18,
                                  color: kCobalt,
                                ),
                              ),
                              if ((item.badgeCount ?? 0) > 0)
                                Positioned(
                                  right: -6,
                                  top: -6,
                                  child:
                                      _LeadUnreadBadge(count: item.badgeCount!),
                                ),
                            ],
                          ),
                          const Spacer(),
                          Icon(
                            Icons.chevron_right_rounded,
                            size: 19,
                            color: primary
                                ? kCobalt.withValues(alpha: 0.72)
                                : context.artC.ink.withValues(alpha: 0.24),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Text(
                        item.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: context.artC.ink,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.subtitle,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 10.5,
                          height: 1.22,
                          fontWeight: FontWeight.w700,
                          color: context.artC.ink.withValues(alpha: 0.46),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _WorkbenchListSheet extends StatefulWidget {
  final _WorkbenchListMode mode;
  final List<Map<String, dynamic>> leads;
  final List<Map<String, dynamic>> serviceBookings;
  final bool loading;
  final bool bookingLoading;
  final String? error;
  final String? bookingError;
  final Future<void> Function() onRetry;
  final Future<void> Function() onBookingRetry;
  final ValueChanged<Map<String, dynamic>> onOpen;

  const _WorkbenchListSheet({
    required this.mode,
    required this.leads,
    required this.serviceBookings,
    required this.loading,
    required this.bookingLoading,
    required this.error,
    required this.bookingError,
    required this.onRetry,
    required this.onBookingRetry,
    required this.onOpen,
  });

  @override
  State<_WorkbenchListSheet> createState() => _WorkbenchListSheetState();
}

class _WorkbenchListSheetState extends State<_WorkbenchListSheet> {
  String _status = 'all';
  String _assignment = 'all';
  bool _selectionMode = false;
  bool _bulkAssigning = false;
  final Set<String> _selectedLeadIds = {};
  late List<Map<String, dynamic>> _bookings;

  @override
  void initState() {
    super.initState();
    _bookings = List<Map<String, dynamic>>.from(widget.serviceBookings);
  }

  void _handleBookingUpdated(Map<String, dynamic> booking) {
    final id = booking['id']?.toString();
    if (id == null || id.isEmpty) return;
    setState(() {
      final index =
          _bookings.indexWhere((item) => item['id']?.toString() == id);
      if (index == -1) {
        _bookings.insert(0, booking);
      } else {
        _bookings[index] = booking;
      }
    });
    widget.onBookingRetry();
  }

  void _toggleSelectionMode() {
    setState(() {
      _selectionMode = !_selectionMode;
      _selectedLeadIds.clear();
    });
  }

  void _toggleLeadSelected(Map<String, dynamic> lead) {
    final id = lead['id']?.toString();
    if (id == null || id.isEmpty) return;
    setState(() {
      if (_selectedLeadIds.contains(id)) {
        _selectedLeadIds.remove(id);
      } else {
        _selectedLeadIds.add(id);
      }
    });
  }

  Future<void> _bulkAssignSelected() async {
    if (_selectedLeadIds.isEmpty || _bulkAssigning) return;
    setState(() => _bulkAssigning = true);
    try {
      final team = await BackendApiService.fetchWorkbenchTeam();
      if (!mounted) return;
      if (team.data.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('暂无可分配成员')),
        );
        return;
      }
      final member = await showModalBottomSheet<Map<String, dynamic>>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => _BulkAssignmentSheet(members: team.data),
      );
      if (!mounted || member == null) return;
      final selectedIds = _selectedLeadIds.toList();
      final successes = <String>[];
      final failures = <_BulkAssignmentFailure>[];
      for (final id in selectedIds) {
        try {
          await BackendApiService.assignWorkbenchConsultation(
            id: id,
            memberId: member['id']?.toString(),
            memberUserId: member['user_id']?.toString(),
          );
          successes.add(id);
        } catch (e) {
          failures.add(
            _BulkAssignmentFailure(
              id: id,
              title: _leadTitleForId(id),
              error: _bulkAssignmentErrorText(e),
            ),
          );
        }
      }
      if (!mounted) return;
      await widget.onRetry();
      if (!mounted) return;
      if (failures.isNotEmpty) {
        setState(() {
          _selectionMode = true;
          _selectedLeadIds
            ..clear()
            ..addAll(failures.map((failure) => failure.id));
        });
        await showDialog<void>(
          context: context,
          builder: (_) => _BulkAssignmentResultDialog(
            memberName: _workbenchMemberName(member),
            successCount: successes.length,
            failures: failures,
          ),
        );
        return;
      }
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              '已将 ${selectedIds.length} 条线索分配给 ${_workbenchMemberName(member)}'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('批量分配失败：$e')),
      );
    } finally {
      if (mounted) setState(() => _bulkAssigning = false);
    }
  }

  String _leadTitleForId(String id) {
    for (final lead in widget.leads) {
      if (lead['id']?.toString() != id) continue;
      final targetName = lead['target_name']?.toString().trim();
      if (targetName != null && targetName.isNotEmpty) return targetName;
      final topic = lead['topic']?.toString().trim();
      if (topic != null && topic.isNotEmpty) return topic;
      final targetMajor = lead['target_major']?.toString().trim();
      if (targetMajor != null && targetMajor.isNotEmpty) return targetMajor;
    }
    return '线索 $id';
  }

  List<Map<String, dynamic>> get _filteredLeads {
    final base = switch (widget.mode) {
      _WorkbenchListMode.leads => widget.leads,
      _WorkbenchListMode.bookings => const <Map<String, dynamic>>[],
      _WorkbenchListMode.orders =>
        widget.leads.where((lead) => _conversionType(lead) == 'order').toList(),
    };
    if (widget.mode != _WorkbenchListMode.leads) {
      return base;
    }
    return base.where((lead) {
      final statusMatched =
          _status == 'all' || lead['status']?.toString() == _status;
      if (!statusMatched) return false;
      final key = _leadAssignmentKey(lead);
      return switch (_assignment) {
        'all' => true,
        'unassigned' => key == 'unassigned',
        'assigned' => key != 'unassigned',
        _ => key == _assignment,
      };
    }).toList();
  }

  List<MapEntry<String, String>> get _assignmentOptions {
    final options = <String, String>{
      'all': '全部负责',
      'unassigned': '待分配',
      'assigned': '已分配',
    };
    for (final lead in widget.leads) {
      final key = _leadAssignmentKey(lead);
      if (key != 'unassigned') {
        options[key] = _leadAssignmentName(lead);
      }
    }
    return options.entries.toList();
  }

  @override
  Widget build(BuildContext context) {
    final config = _workbenchListConfig(widget.mode);
    final leads = _filteredLeads;
    final loading = widget.mode == _WorkbenchListMode.bookings
        ? widget.bookingLoading
        : widget.loading;
    final error = widget.mode == _WorkbenchListMode.bookings
        ? widget.bookingError
        : widget.error;
    final count = widget.mode == _WorkbenchListMode.bookings
        ? _bookings.length
        : leads.length;
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * 0.86,
      ),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 12, 8),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 4,
                    decoration: BoxDecoration(
                      color: context.artC.silver.withValues(alpha: 0.52),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    tooltip: '关闭',
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: kCobalt.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(config.icon, color: kCobalt),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          config.title,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: context.artC.ink,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          config.subtitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: context.artC.ink.withValues(alpha: 0.46),
                          ),
                        ),
                      ],
                    ),
                  ),
                  _StatusPill(
                    label: loading ? '同步中' : '$count 条',
                    strong: count > 0,
                  ),
                ],
              ),
            ),
            if (widget.mode == _WorkbenchListMode.leads)
              _WorkbenchStatusFilter(
                value: _status,
                onChanged: (value) => setState(() => _status = value),
              ),
            if (widget.mode == _WorkbenchListMode.leads)
              _WorkbenchAssignmentFilter(
                value: _assignment,
                options: _assignmentOptions,
                onChanged: (value) => setState(() => _assignment = value),
              ),
            if (widget.mode == _WorkbenchListMode.leads)
              _BulkSelectionBar(
                selectionMode: _selectionMode,
                selectedCount: _selectedLeadIds.length,
                assigning: _bulkAssigning,
                onToggleMode: _toggleSelectionMode,
                onAssign: _bulkAssignSelected,
              ),
            Expanded(
              child: loading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: kCobalt,
                        strokeWidth: 2.5,
                      ),
                    )
                  : error != null
                      ? Padding(
                          padding: const EdgeInsets.all(20),
                          child: _LeadInlineError(
                            error: error,
                            onRetry: widget.mode == _WorkbenchListMode.bookings
                                ? widget.onBookingRetry
                                : widget.onRetry,
                          ),
                        )
                      : widget.mode == _WorkbenchListMode.bookings
                          ? _ServiceBookingList(
                              bookings: _bookings,
                              emptyText: config.emptyText,
                              onChanged: _handleBookingUpdated,
                              onOpenConsultation: widget.onOpen,
                            )
                          : leads.isEmpty
                              ? _WorkbenchListEmpty(config.emptyText)
                              : ListView.separated(
                                  padding:
                                      const EdgeInsets.fromLTRB(20, 0, 20, 22),
                                  itemBuilder: (context, index) => _LeadRow(
                                    lead: leads[index],
                                    selectionMode: _selectionMode,
                                    selected: _selectedLeadIds.contains(
                                      leads[index]['id']?.toString(),
                                    ),
                                    onSelectedChanged: () =>
                                        _toggleLeadSelected(leads[index]),
                                    onTap: () => widget.onOpen(leads[index]),
                                  ),
                                  separatorBuilder: (context, index) => Divider(
                                    height: 1,
                                    color: context.artC.silver
                                        .withValues(alpha: 0.22),
                                  ),
                                  itemCount: leads.length,
                                ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WorkbenchStatusFilter extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const _WorkbenchStatusFilter({
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    const options = {
      'all': '全部',
      'new': '新咨询',
      'pending': '待回复',
      'active': '沟通中',
      'converted': '已转化',
      'closed': '已关闭',
    };
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: Row(
        children: options.entries.map((entry) {
          final selected = value == entry.key;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(entry.value),
              selected: selected,
              onSelected: (_) => onChanged(entry.key),
              selectedColor: kCobalt.withValues(alpha: 0.12),
              labelStyle: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: selected
                    ? kCobalt
                    : context.artC.ink.withValues(alpha: 0.52),
              ),
              side: BorderSide(
                color: selected
                    ? kCobalt.withValues(alpha: 0.34)
                    : context.artC.silver.withValues(alpha: 0.28),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _WorkbenchAssignmentFilter extends StatelessWidget {
  final String value;
  final List<MapEntry<String, String>> options;
  final ValueChanged<String> onChanged;

  const _WorkbenchAssignmentFilter({
    required this.value,
    required this.options,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: Row(
        children: options.map((entry) {
          final selected = value == entry.key;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(entry.value),
              selected: selected,
              onSelected: (_) => onChanged(entry.key),
              selectedColor: kCobalt.withValues(alpha: 0.12),
              labelStyle: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: selected
                    ? kCobalt
                    : context.artC.ink.withValues(alpha: 0.52),
              ),
              side: BorderSide(
                color: selected
                    ? kCobalt.withValues(alpha: 0.34)
                    : context.artC.silver.withValues(alpha: 0.28),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _BulkSelectionBar extends StatelessWidget {
  final bool selectionMode;
  final int selectedCount;
  final bool assigning;
  final VoidCallback onToggleMode;
  final VoidCallback onAssign;

  const _BulkSelectionBar({
    required this.selectionMode,
    required this.selectedCount,
    required this.assigning,
    required this.onToggleMode,
    required this.onAssign,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: Row(
        children: [
          OutlinedButton.icon(
            onPressed: assigning ? null : onToggleMode,
            style: OutlinedButton.styleFrom(
              foregroundColor: selectionMode ? context.artC.ink : kCobalt,
              side: BorderSide(color: kCobalt.withValues(alpha: 0.26)),
            ),
            icon: Icon(
              selectionMode ? Icons.close_rounded : Icons.checklist_rtl_rounded,
              size: 18,
            ),
            label: Text(selectionMode ? '取消选择' : '批量分配'),
          ),
          if (selectionMode) ...[
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                selectedCount == 0 ? '请选择线索' : '已选 $selectedCount 条',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: context.artC.ink.withValues(alpha: 0.46),
                ),
              ),
            ),
            FilledButton.icon(
              onPressed: selectedCount == 0 || assigning ? null : onAssign,
              style: FilledButton.styleFrom(backgroundColor: kCobalt),
              icon: assigning
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.assignment_ind_outlined, size: 18),
              label: const Text('分配'),
            ),
          ],
        ],
      ),
    );
  }
}

class _BulkAssignmentSheet extends StatelessWidget {
  final List<Map<String, dynamic>> members;

  const _BulkAssignmentSheet({required this.members});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * 0.72,
      ),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 12, 8),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 4,
                    decoration: BoxDecoration(
                      color: context.artC.silver.withValues(alpha: 0.52),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    tooltip: '关闭',
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: kCobalt.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(
                      Icons.assignment_ind_outlined,
                      color: kCobalt,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '选择负责老师',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: context.artC.ink,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '批量分配后，老师会收到站内通知',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: context.artC.ink.withValues(alpha: 0.46),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 22),
                itemBuilder: (context, index) {
                  final member = members[index];
                  return _BulkMemberRow(
                    member: member,
                    onTap: () => Navigator.of(context).pop(member),
                  );
                },
                separatorBuilder: (context, index) => Divider(
                  height: 1,
                  color: context.artC.silver.withValues(alpha: 0.22),
                ),
                itemCount: members.length,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BulkAssignmentFailure {
  final String id;
  final String title;
  final String error;

  const _BulkAssignmentFailure({
    required this.id,
    required this.title,
    required this.error,
  });
}

class _BulkAssignmentResultDialog extends StatelessWidget {
  final String memberName;
  final int successCount;
  final List<_BulkAssignmentFailure> failures;

  const _BulkAssignmentResultDialog({
    required this.memberName,
    required this.successCount,
    required this.failures,
  });

  @override
  Widget build(BuildContext context) {
    final title = successCount > 0 ? '部分线索未分配' : '批量分配未完成';
    return AlertDialog(
      title: Text(title),
      content: SizedBox(
        width: 360,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              successCount > 0
                  ? '已将 $successCount 条线索分配给 $memberName，以下 ${failures.length} 条失败，已为你保留选中。'
                  : '以下 ${failures.length} 条线索未能分配给 $memberName，已为你保留选中。',
              style: TextStyle(
                fontSize: 13,
                height: 1.45,
                fontWeight: FontWeight.w700,
                color: context.artC.ink.withValues(alpha: 0.68),
              ),
            ),
            const SizedBox(height: 14),
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 280),
              child: ListView.separated(
                shrinkWrap: true,
                itemBuilder: (context, index) {
                  final failure = failures[index];
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: context.artC.porcelain,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: context.artC.silver.withValues(alpha: 0.24),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          failure.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: context.artC.ink,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          failure.error,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            height: 1.35,
                            fontWeight: FontWeight.w700,
                            color: Colors.redAccent,
                          ),
                        ),
                      ],
                    ),
                  );
                },
                separatorBuilder: (context, index) => const SizedBox(height: 8),
                itemCount: failures.length,
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('保留失败项继续处理'),
        ),
      ],
    );
  }
}

class _BulkMemberRow extends StatelessWidget {
  final Map<String, dynamic> member;
  final VoidCallback onTap;

  const _BulkMemberRow({
    required this.member,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final name = _workbenchMemberName(member);
    final role = _memberRoleLabel(member['role']?.toString() ?? 'member');
    final organization = member['organization'];
    final orgName = organization is Map
        ? organization['name']?.toString() ?? '所属机构'
        : '所属机构';
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: kCobalt.withValues(alpha: 0.1),
                child: Text(
                  name.isEmpty ? '成' : name.characters.first,
                  style: const TextStyle(
                    color: kCobalt,
                    fontWeight: FontWeight.w900,
                  ),
                ),
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
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$orgName · $role',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: context.artC.ink.withValues(alpha: 0.46),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                color: context.artC.ink.withValues(alpha: 0.28),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WorkbenchListEmpty extends StatelessWidget {
  final String text;

  const _WorkbenchListEmpty(this.text);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            height: 1.5,
            fontWeight: FontWeight.w800,
            color: context.artC.ink.withValues(alpha: 0.5),
          ),
        ),
      ),
    );
  }
}

class _ServiceBookingList extends StatelessWidget {
  final List<Map<String, dynamic>> bookings;
  final String emptyText;
  final ValueChanged<Map<String, dynamic>> onChanged;
  final ValueChanged<Map<String, dynamic>> onOpenConsultation;

  const _ServiceBookingList({
    required this.bookings,
    required this.emptyText,
    required this.onChanged,
    required this.onOpenConsultation,
  });

  @override
  Widget build(BuildContext context) {
    if (bookings.isEmpty) return _WorkbenchListEmpty(emptyText);
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 22),
      itemBuilder: (context, index) {
        final booking = bookings[index];
        return _ServiceBookingRow(
          booking: booking,
          onTap: () => showModalBottomSheet<void>(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (_) => _ServiceBookingDetailSheet(
              booking: booking,
              onChanged: onChanged,
              onOpenConsultation: onOpenConsultation,
            ),
          ),
        );
      },
      separatorBuilder: (context, index) => Divider(
        height: 1,
        color: context.artC.silver.withValues(alpha: 0.22),
      ),
      itemCount: bookings.length,
    );
  }
}

class _ServiceBookingDetailSheet extends StatefulWidget {
  final Map<String, dynamic> booking;
  final ValueChanged<Map<String, dynamic>> onChanged;
  final ValueChanged<Map<String, dynamic>> onOpenConsultation;

  const _ServiceBookingDetailSheet({
    required this.booking,
    required this.onChanged,
    required this.onOpenConsultation,
  });

  @override
  State<_ServiceBookingDetailSheet> createState() =>
      _ServiceBookingDetailSheetState();
}

class _ServiceBookingDetailSheetState
    extends State<_ServiceBookingDetailSheet> {
  late Map<String, dynamic> _booking;
  String? _savingStatus;
  String? _error;

  @override
  void initState() {
    super.initState();
    _booking = widget.booking;
  }

  Future<void> _setStatus(String status) async {
    final id = _booking['id']?.toString();
    if (id == null || id.isEmpty || _savingStatus != null) return;
    setState(() {
      _savingStatus = status;
      _error = null;
    });
    try {
      final updated = await BackendApiService.updateWorkbenchServiceBooking(
        id: id,
        status: status,
      );
      if (!mounted) return;
      setState(() => _booking = updated);
      widget.onChanged(updated);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _savingStatus = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final consultation = _consultationFromBooking(_booking);
    final title = _booking['title']?.toString() ?? '预约服务';
    final status = _booking['status']?.toString() ?? 'requested';
    final scheduledAt = _formatBookingTime(_booking['scheduled_at']);
    final updatedAt =
        _formatShortTime(_booking['updated_at'] ?? _booking['created_at']);
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * 0.86,
      ),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 42,
                  height: 4,
                  decoration: BoxDecoration(
                    color: context.artC.silver.withValues(alpha: 0.52),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: kCobalt.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(
                      Icons.event_available_outlined,
                      color: kCobalt,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      '预约详情',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: '关闭',
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: context.artC.porcelain,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: context.artC.silver.withValues(alpha: 0.26),
                  ),
                ),
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
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _MiniLeadTag(
                          label: _bookingStatusLabel(status),
                          strong: true,
                        ),
                        if (consultation != null)
                          _MiniLeadTag(
                            label: consultation['target_name']?.toString() ??
                                '关联咨询',
                          ),
                        if (scheduledAt != null)
                          _MiniLeadTag(label: '排期 $scheduledAt'),
                        if (updatedAt != null) _MiniLeadTag(label: updatedAt),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                '预约状态',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: context.artC.ink,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _BookingStatusButton(
                    label: '确认',
                    icon: Icons.check_circle_outline_rounded,
                    active: status == 'confirmed',
                    loading: _savingStatus == 'confirmed',
                    onPressed: () => _setStatus('confirmed'),
                  ),
                  _BookingStatusButton(
                    label: '标记排期',
                    icon: Icons.schedule_outlined,
                    active: status == 'scheduled',
                    loading: _savingStatus == 'scheduled',
                    onPressed: () => _setStatus('scheduled'),
                  ),
                  _BookingStatusButton(
                    label: '完成',
                    icon: Icons.done_all_rounded,
                    active: status == 'completed',
                    loading: _savingStatus == 'completed',
                    onPressed: () => _setStatus('completed'),
                  ),
                  _BookingStatusButton(
                    label: '取消',
                    icon: Icons.cancel_outlined,
                    active: status == 'canceled',
                    loading: _savingStatus == 'canceled',
                    onPressed: () => _setStatus('canceled'),
                  ),
                ],
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(
                  _error!,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Colors.redAccent,
                  ),
                ),
              ],
              if (consultation != null) ...[
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: kCobalt,
                      side: BorderSide(color: kCobalt.withValues(alpha: 0.26)),
                    ),
                    onPressed: () {
                      Navigator.of(context).pop();
                      widget.onOpenConsultation(consultation);
                    },
                    icon: const Icon(Icons.forum_outlined, size: 18),
                    label: const Text('查看关联咨询'),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _BookingStatusButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  final bool loading;
  final VoidCallback onPressed;

  const _BookingStatusButton({
    required this.label,
    required this.icon,
    required this.active,
    required this.loading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      style: OutlinedButton.styleFrom(
        foregroundColor: active ? Colors.white : kCobalt,
        backgroundColor: active ? kCobalt : Colors.transparent,
        side: BorderSide(color: kCobalt.withValues(alpha: 0.28)),
      ),
      onPressed: loading ? null : onPressed,
      icon: loading
          ? SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: active ? Colors.white : kCobalt,
              ),
            )
          : Icon(icon, size: 18),
      label: Text(label),
    );
  }
}

class _ServiceBookingRow extends StatelessWidget {
  final Map<String, dynamic> booking;
  final VoidCallback onTap;

  const _ServiceBookingRow({
    required this.booking,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final consultation = _consultationFromBooking(booking);
    final title = booking['title']?.toString() ?? '预约服务';
    final status = booking['status']?.toString() ?? 'requested';
    final targetName = consultation?['target_name']?.toString() ??
        booking['service_type']?.toString();
    final updatedAt =
        _formatShortTime(booking['updated_at'] ?? booking['created_at']);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.09),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.event_available_outlined,
                  color: kCobalt,
                  size: 19,
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
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
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: context.artC.ink,
                            ),
                          ),
                        ),
                        if (updatedAt != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            updatedAt,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: context.artC.ink.withValues(alpha: 0.36),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      targetName == null || targetName.isEmpty
                          ? '关联咨询'
                          : targetName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: context.artC.ink.withValues(alpha: 0.52),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _MiniLeadTag(
                          label: _bookingStatusLabel(status),
                          strong: true,
                        ),
                        if (consultation != null)
                          _MiniLeadTag(
                            label: _statusLabel(
                              consultation['status']?.toString() ?? 'converted',
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.chevron_right_rounded,
                color: context.artC.ink.withValues(alpha: 0.28),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OrganizationProfileSheet extends StatefulWidget {
  final List<Map<String, dynamic>> organizations;
  final bool loading;
  final String? error;
  final Future<void> Function() onRetry;
  final Future<void> Function() onCreated;

  const _OrganizationProfileSheet({
    required this.organizations,
    required this.loading,
    required this.error,
    required this.onRetry,
    required this.onCreated,
  });

  @override
  State<_OrganizationProfileSheet> createState() =>
      _OrganizationProfileSheetState();
}

class _OrganizationProfileSheetState extends State<_OrganizationProfileSheet> {
  final _name = TextEditingController();
  Map<String, dynamic>? _updatedOrganization;
  String _type = 'study_abroad_agency';
  bool _creating = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final name = _name.text.trim();
    if (name.isEmpty || _creating) {
      setState(() => _error = '请填写机构名称');
      return;
    }
    setState(() {
      _creating = true;
      _error = null;
    });
    try {
      await BackendApiService.createOrganization(
        name: name,
        type: _type,
      );
      await widget.onCreated();
      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('机构资料已创建')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _creating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    final originalOrganization = _firstOrganization(widget.organizations);
    final organization = originalOrganization == null
        ? null
        : (
            organization:
                _updatedOrganization ?? originalOrganization.organization,
            role: originalOrganization.role,
            status: originalOrganization.status,
          );
    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.86,
        ),
        decoration: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 42,
                    height: 4,
                    decoration: BoxDecoration(
                      color: context.artC.silver.withValues(alpha: 0.52),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: kCobalt.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.verified_user_outlined,
                        color: kCobalt,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        '机构资料',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: context.artC.ink,
                        ),
                      ),
                    ),
                    IconButton(
                      tooltip: '关闭',
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close_rounded),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                if (widget.loading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 28),
                    child: Center(
                      child: CircularProgressIndicator(
                        color: kCobalt,
                        strokeWidth: 2.5,
                      ),
                    ),
                  )
                else if (widget.error != null)
                  _OrganizationErrorState(
                    error: widget.error!,
                    onRetry: widget.onRetry,
                  )
                else if (organization != null)
                  _OrganizationSummary(
                    organization: organization.organization,
                    role: organization.role,
                    memberStatus: organization.status,
                    onSubscriptionUpdated: widget.onCreated,
                    onOrganizationUpdated: (updated) async {
                      setState(() => _updatedOrganization = updated);
                      await widget.onCreated();
                    },
                  )
                else
                  _OrganizationCreateForm(
                    name: _name,
                    type: _type,
                    error: _error,
                    creating: _creating,
                    onTypeChanged: (value) => setState(() => _type = value),
                    onSubmit: _create,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OrganizationCreateForm extends StatelessWidget {
  final TextEditingController name;
  final String type;
  final String? error;
  final bool creating;
  final ValueChanged<String> onTypeChanged;
  final VoidCallback onSubmit;

  const _OrganizationCreateForm({
    required this.name,
    required this.type,
    required this.error,
    required this.creating,
    required this.onTypeChanged,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: name,
          enabled: !creating,
          textInputAction: TextInputAction.done,
          decoration: InputDecoration(
            labelText: '机构名称',
            filled: true,
            fillColor: context.artC.porcelain,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
          ),
          onSubmitted: (_) => onSubmit(),
        ),
        const SizedBox(height: 14),
        Text(
          '机构类型',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w900,
            color: context.artC.ink,
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _organizationTypes.entries.map((entry) {
            final selected = type == entry.key;
            return ChoiceChip(
              label: Text(entry.value),
              selected: selected,
              onSelected: creating ? null : (_) => onTypeChanged(entry.key),
              selectedColor: kCobalt.withValues(alpha: 0.12),
              labelStyle: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: selected
                    ? kCobalt
                    : context.artC.ink.withValues(alpha: 0.58),
              ),
              side: BorderSide(
                color: selected
                    ? kCobalt.withValues(alpha: 0.32)
                    : context.artC.silver.withValues(alpha: 0.3),
              ),
            );
          }).toList(),
        ),
        if (error != null) ...[
          const SizedBox(height: 12),
          Text(
            error!,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: Colors.redAccent,
            ),
          ),
        ],
        const SizedBox(height: 18),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(backgroundColor: kCobalt),
            onPressed: creating ? null : onSubmit,
            icon: creating
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.add_business_outlined),
            label: Text(creating ? '创建中' : '创建机构资料'),
          ),
        ),
      ],
    );
  }
}

class _OrganizationSummary extends StatelessWidget {
  final Map<String, dynamic> organization;
  final String role;
  final String memberStatus;
  final Future<void> Function() onSubscriptionUpdated;
  final Future<void> Function(Map<String, dynamic> organization)
      onOrganizationUpdated;

  const _OrganizationSummary({
    required this.organization,
    required this.role,
    required this.memberStatus,
    required this.onSubscriptionUpdated,
    required this.onOrganizationUpdated,
  });

  Future<void> _openEditSheet(BuildContext context) async {
    final updated = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _OrganizationEditSheet(organization: organization),
    );
    if (updated != null) {
      await onOrganizationUpdated(updated);
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = organization['name']?.toString() ?? '未命名机构';
    final type = organization['type']?.toString();
    final verification = organization['verification_status']?.toString();
    final status = organization['status']?.toString();
    final subscriptionStatus =
        organization['subscription_status']?.toString() ?? 'inactive';
    final subscriptionExpiresAt =
        _formatOrganizationDate(organization['subscription_expires_at']);
    final canManageOrganization = role == 'owner' || role == 'admin';
    final city = organization['city']?.toString();
    final focusAreas = _stringList(organization['focus_areas']);
    final supportsOnline = organization['supports_online'] == true;
    final supportsOffline = organization['supports_offline'] == true;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.artC.porcelain,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: context.artC.silver.withValues(alpha: 0.26),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            name,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (type != null && type.isNotEmpty)
                _MiniLeadTag(label: _organizationTypeLabel(type), strong: true),
              _MiniLeadTag(label: _verificationLabel(verification)),
              _MiniLeadTag(label: _memberRoleLabel(role)),
              _MiniLeadTag(label: _organizationStatusLabel(status)),
              _MiniLeadTag(
                label: _subscriptionStatusLabel(
                  subscriptionStatus,
                  subscriptionExpiresAt,
                ),
                strong: subscriptionStatus == 'active',
              ),
              if (memberStatus != 'active') _MiniLeadTag(label: memberStatus),
            ],
          ),
          if ((city ?? '').trim().isNotEmpty || focusAreas.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if ((city ?? '').trim().isNotEmpty)
                  _MiniLeadTag(label: city!.trim()),
                for (final area in focusAreas.take(4))
                  _MiniLeadTag(label: area),
                if (supportsOnline) const _MiniLeadTag(label: '线上咨询'),
                if (supportsOffline) const _MiniLeadTag(label: '线下见面'),
              ],
            ),
          ],
          const SizedBox(height: 14),
          Text(
            '维护城市、专注领域与联系方式后，机构会出现在咨询列表和线下联系入口中。',
            style: TextStyle(
              fontSize: 12.5,
              height: 1.5,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.56),
            ),
          ),
          if (canManageOrganization) ...[
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _openEditSheet(context),
                icon: const Icon(Icons.edit_location_alt_outlined),
                label: const Text('编辑公开资料与联系方式'),
              ),
            ),
            const SizedBox(height: 14),
            _OrganizationSubscriptionButton(
              organizationId: organization['id']?.toString() ?? '',
              active: subscriptionStatus == 'active',
              onDone: onSubscriptionUpdated,
            ),
          ],
        ],
      ),
    );
  }
}

class _OrganizationEditSheet extends StatefulWidget {
  final Map<String, dynamic> organization;

  const _OrganizationEditSheet({required this.organization});

  @override
  State<_OrganizationEditSheet> createState() => _OrganizationEditSheetState();
}

class _OrganizationEditSheetState extends State<_OrganizationEditSheet> {
  late final TextEditingController _name;
  late final TextEditingController _city;
  late final TextEditingController _province;
  late final TextEditingController _latitude;
  late final TextEditingController _longitude;
  late final TextEditingController _focusAreas;
  late final TextEditingController _summary;
  late final TextEditingController _address;
  late final TextEditingController _phone;
  late final TextEditingController _wechatQrUrl;
  late final TextEditingController _contactNote;
  late String _type;
  late bool _supportsOnline;
  late bool _supportsOffline;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final org = widget.organization;
    final metadata = _mapValue(org['metadata']);
    _name = TextEditingController(text: _cleanText(org['name']));
    _city = TextEditingController(text: _cleanText(org['city']));
    _province = TextEditingController(text: _cleanText(org['province']));
    _latitude = TextEditingController(text: _cleanText(org['latitude']));
    _longitude = TextEditingController(text: _cleanText(org['longitude']));
    _focusAreas =
        TextEditingController(text: _stringList(org['focus_areas']).join('，'));
    _summary = TextEditingController(
      text: _cleanText(metadata['summary']).isNotEmpty
          ? _cleanText(metadata['summary'])
          : _cleanText(metadata['description']),
    );
    _address = TextEditingController(text: _cleanText(metadata['address']));
    _phone = TextEditingController(text: _cleanText(metadata['phone']));
    _wechatQrUrl =
        TextEditingController(text: _cleanText(metadata['wechat_qr_url']));
    _contactNote =
        TextEditingController(text: _cleanText(metadata['contact_note']));
    _type = _cleanText(org['type']).isEmpty
        ? 'study_abroad_agency'
        : _cleanText(org['type']);
    _supportsOnline = org['supports_online'] != false;
    _supportsOffline = org['supports_offline'] == true;
  }

  @override
  void dispose() {
    _name.dispose();
    _city.dispose();
    _province.dispose();
    _latitude.dispose();
    _longitude.dispose();
    _focusAreas.dispose();
    _summary.dispose();
    _address.dispose();
    _phone.dispose();
    _wechatQrUrl.dispose();
    _contactNote.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_saving) return;
    final id = widget.organization['id']?.toString() ?? '';
    if (id.isEmpty) {
      setState(() => _error = '机构 ID 缺失');
      return;
    }
    final name = _name.text.trim();
    if (name.isEmpty) {
      setState(() => _error = '请填写机构名称');
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.updateOrganizationProfile(
        organizationId: id,
        name: name,
        type: _type,
        city: _city.text,
        province: _province.text,
        latitude: _latitude.text,
        longitude: _longitude.text,
        focusAreas: _splitTags(_focusAreas.text),
        supportsOnline: _supportsOnline,
        supportsOffline: _supportsOffline,
        metadata: {
          'summary': _summary.text.trim(),
          'address': _address.text.trim(),
          'phone': _phone.text.trim(),
          'wechat_qr_url': _wechatQrUrl.text.trim(),
          'contact_note': _contactNote.text.trim(),
        },
      );
      if (!mounted) return;
      final organization = result['organization'];
      Navigator.of(context).pop(
        organization is Map<String, dynamic> ? organization : result,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('机构资料已更新')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.9,
        ),
        decoration: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 12, 8),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 4,
                      decoration: BoxDecoration(
                        color: context.artC.silver.withValues(alpha: 0.52),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      tooltip: '关闭',
                      onPressed:
                          _saving ? null : () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close_rounded),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                  children: [
                    Text(
                      '编辑机构资料',
                      style: TextStyle(
                        color: context.artC.ink,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '这些信息会用于机构列表排序、筛选和会员线下联系入口。',
                      style: TextStyle(
                        color: context.artC.ink.withValues(alpha: 0.52),
                        fontSize: 12,
                        height: 1.4,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _OrganizationTextField(
                      controller: _name,
                      label: '机构名称',
                      enabled: !_saving,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '机构类型',
                      style: TextStyle(
                        color: context.artC.ink,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _organizationTypes.entries.map((entry) {
                        final selected = _type == entry.key;
                        return ChoiceChip(
                          label: Text(entry.value),
                          selected: selected,
                          onSelected: _saving
                              ? null
                              : (_) => setState(() => _type = entry.key),
                          selectedColor: kCobalt.withValues(alpha: 0.12),
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            color: selected
                                ? kCobalt
                                : context.artC.ink.withValues(alpha: 0.58),
                          ),
                          side: BorderSide(
                            color: selected
                                ? kCobalt.withValues(alpha: 0.32)
                                : context.artC.silver.withValues(alpha: 0.3),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _OrganizationTextField(
                            controller: _province,
                            label: '省份',
                            enabled: !_saving,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _OrganizationTextField(
                            controller: _city,
                            label: '城市',
                            enabled: !_saving,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _OrganizationTextField(
                            controller: _latitude,
                            label: '纬度',
                            enabled: !_saving,
                            keyboardType: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _OrganizationTextField(
                            controller: _longitude,
                            label: '经度',
                            enabled: !_saving,
                            keyboardType: TextInputType.number,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _OrganizationTextField(
                      controller: _focusAreas,
                      label: '专注领域',
                      hint: '英国留学，RCA，作品集',
                      enabled: !_saving,
                    ),
                    const SizedBox(height: 12),
                    _OrganizationTextField(
                      controller: _summary,
                      label: '机构简介',
                      enabled: !_saving,
                      maxLines: 3,
                    ),
                    const SizedBox(height: 12),
                    _OrganizationSwitchTile(
                      title: '支持线上咨询',
                      value: _supportsOnline,
                      enabled: !_saving,
                      onChanged: (value) =>
                          setState(() => _supportsOnline = value),
                    ),
                    const SizedBox(height: 8),
                    _OrganizationSwitchTile(
                      title: '支持线下见面',
                      value: _supportsOffline,
                      enabled: !_saving,
                      onChanged: (value) =>
                          setState(() => _supportsOffline = value),
                    ),
                    const SizedBox(height: 14),
                    _OrganizationTextField(
                      controller: _address,
                      label: '线下地址',
                      enabled: !_saving,
                    ),
                    const SizedBox(height: 12),
                    _OrganizationTextField(
                      controller: _phone,
                      label: '联系电话',
                      enabled: !_saving,
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 12),
                    _OrganizationTextField(
                      controller: _wechatQrUrl,
                      label: '企业微信二维码链接',
                      enabled: !_saving,
                      keyboardType: TextInputType.url,
                    ),
                    const SizedBox(height: 12),
                    _OrganizationTextField(
                      controller: _contactNote,
                      label: '线下联系备注',
                      enabled: !_saving,
                      maxLines: 2,
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        _error!,
                        style: const TextStyle(
                          color: Colors.redAccent,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: FilledButton.icon(
                    style: FilledButton.styleFrom(backgroundColor: kCobalt),
                    onPressed: _saving ? null : _save,
                    icon: _saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Icon(Icons.save_outlined),
                    label: Text(_saving ? '保存中' : '保存机构资料'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OrganizationTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final bool enabled;
  final int maxLines;
  final TextInputType? keyboardType;

  const _OrganizationTextField({
    required this.controller,
    required this.label,
    this.hint,
    required this.enabled,
    this.maxLines = 1,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      enabled: enabled,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: context.artC.porcelain,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}

class _OrganizationSwitchTile extends StatelessWidget {
  final String title;
  final bool value;
  final bool enabled;
  final ValueChanged<bool> onChanged;

  const _OrganizationSwitchTile({
    required this.title,
    required this.value,
    required this.enabled,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: context.artC.porcelain,
        borderRadius: BorderRadius.circular(14),
      ),
      child: SwitchListTile.adaptive(
        value: value,
        onChanged: enabled ? onChanged : null,
        dense: true,
        activeThumbColor: kCobalt,
        contentPadding: EdgeInsets.zero,
        title: Text(
          title,
          style: TextStyle(
            color: context.artC.ink,
            fontSize: 13,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _OrganizationSubscriptionButton extends StatefulWidget {
  final String organizationId;
  final bool active;
  final Future<void> Function() onDone;

  const _OrganizationSubscriptionButton({
    required this.organizationId,
    required this.active,
    required this.onDone,
  });

  @override
  State<_OrganizationSubscriptionButton> createState() =>
      _OrganizationSubscriptionButtonState();
}

class _OrganizationSubscriptionButtonState
    extends State<_OrganizationSubscriptionButton> {
  bool _submitting = false;

  Future<void> _upgrade() async {
    if (_submitting || widget.organizationId.isEmpty) return;
    setState(() => _submitting = true);
    try {
      final checkout =
          await BackendApiService.createOrganizationSubscriptionUpgrade(
        organizationId: widget.organizationId,
      );
      final checkoutUrl = checkout['checkoutUrl']?.toString() ?? '';
      final orderId = _checkoutOrderId(checkout);
      if (checkoutUrl.startsWith('/orders/') && orderId.isNotEmpty) {
        await BackendApiService.confirmExistingOrder(orderId);
        await widget.onDone();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('年度入驻已开通')),
        );
        return;
      }
      await widget.onDone();
      if (!mounted) return;
      if (checkoutUrl.isNotEmpty) {
        final url = checkoutUrl.startsWith('http')
            ? checkoutUrl
            : '${ApiConfig.baseUrl.replaceAll(RegExp(r'/$'), '')}$checkoutUrl';
        final opened = await launchUrl(
          Uri.parse(url),
          mode: LaunchMode.externalApplication,
        );
        if (!mounted) return;
        if (!opened) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('请在浏览器打开：$url')),
          );
          return;
        }
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('年度入驻订单已创建')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('创建年度入驻订单失败：$e')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: _submitting ? null : _upgrade,
        icon: _submitting
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Icon(widget.active
                ? Icons.workspace_premium_outlined
                : Icons.verified_outlined),
        label: Text(
          _submitting
              ? '创建中'
              : widget.active
                  ? '续费年度入驻'
                  : '开通年度入驻',
        ),
      ),
    );
  }
}

class _OrganizationErrorState extends StatelessWidget {
  final String error;
  final Future<void> Function() onRetry;

  const _OrganizationErrorState({
    required this.error,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.porcelain,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '机构资料加载失败',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            error,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12,
              height: 1.4,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.52),
            ),
          ),
          const SizedBox(height: 10),
          TextButton.icon(
            style: TextButton.styleFrom(foregroundColor: kCobalt),
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('重新加载'),
          ),
        ],
      ),
    );
  }
}

typedef _OrganizationMembership = ({
  Map<String, dynamic> organization,
  String role,
  String status,
});

typedef _WorkbenchListConfig = ({
  IconData icon,
  String title,
  String subtitle,
  String emptyText,
});

enum _WorkbenchListMode {
  leads,
  bookings,
  orders,
}

_WorkbenchListConfig _workbenchListConfig(_WorkbenchListMode mode) {
  return switch (mode) {
    _WorkbenchListMode.leads => (
        icon: Icons.support_agent_outlined,
        title: '咨询线索',
        subtitle: '按状态处理分配给你的申请咨询',
        emptyText: '暂无可处理咨询线索。平台分配或学生发起咨询后会出现在这里。',
      ),
    _WorkbenchListMode.bookings => (
        icon: Icons.event_available_outlined,
        title: '预约服务',
        subtitle: '从咨询转出的预约服务跟进',
        emptyText: '暂无转预约记录。顾问在咨询详情里点击“转预约”后会出现在这里。',
      ),
    _WorkbenchListMode.orders => (
        icon: Icons.receipt_long_outlined,
        title: '订单转化',
        subtitle: '从咨询转出的订单成交线索',
        emptyText: '暂无转订单记录。顾问在咨询详情里点击“转订单”后会出现在这里。',
      ),
  };
}

String? _conversionType(Map<String, dynamic> lead) {
  final metadata = lead['metadata'];
  if (metadata is! Map) return null;
  final conversion = metadata['conversion'];
  if (conversion is! Map) return null;
  return conversion['type']?.toString();
}

String _leadAssignmentKey(Map<String, dynamic> lead) {
  final memberId = lead['assigned_to_member_id']?.toString().trim() ?? '';
  if (memberId.isNotEmpty) return 'member:$memberId';
  final userId = lead['assigned_to_user_id']?.toString().trim() ?? '';
  if (userId.isNotEmpty) return 'user:$userId';
  return 'unassigned';
}

String _leadAssignmentName(Map<String, dynamic> lead) {
  if (_leadAssignmentKey(lead) == 'unassigned') return '待分配';
  final metadata = lead['metadata'];
  if (metadata is Map) {
    final assignment = metadata['internal_assignment'];
    if (assignment is Map) {
      final name = assignment['member_name']?.toString().trim();
      if (name != null && name.isNotEmpty) return '负责 $name';
    }
  }
  return '已分配老师';
}

Map<String, dynamic>? _consultationFromBooking(Map<String, dynamic> booking) {
  final consultation = booking['consultation'];
  return consultation is Map<String, dynamic> ? consultation : null;
}

String _bookingStatusLabel(String status) {
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

_OrganizationMembership? _firstOrganization(
  List<Map<String, dynamic>> organizations,
) {
  for (final row in organizations) {
    final organization = row['organization'];
    if (organization is Map<String, dynamic>) {
      return (
        organization: organization,
        role: row['role']?.toString() ?? 'member',
        status: row['status']?.toString() ?? 'active',
      );
    }
  }
  return null;
}

bool _canManageContractsFor(List<Map<String, dynamic>> organizations) {
  return organizations.any((row) {
    final role = row['role']?.toString();
    return role == 'owner' || role == 'admin';
  });
}

String _organizationActionSubtitle(
  List<Map<String, dynamic>> organizations,
  bool loading,
) {
  if (loading) return '同步机构资料';
  final organization = _firstOrganization(organizations);
  if (organization == null) return '创建机构资料并承接分配';
  return organization.organization['name']?.toString() ?? '查看机构资料';
}

const _organizationTypes = {
  'study_abroad_agency': '留学机构',
  'portfolio_training': '作品集机构',
  'event_organizer': '活动主办',
  'gallery_exhibition': '画廊展览',
  'other_service': '其他服务',
};

String _organizationTypeLabel(String type) {
  return _organizationTypes[type] ?? type;
}

String _verificationLabel(String? status) {
  switch (status) {
    case 'verified':
      return '已认证';
    case 'rejected':
      return '认证未通过';
    case 'pending':
    default:
      return '待认证';
  }
}

String _organizationStatusLabel(String? status) {
  switch (status) {
    case 'active':
      return '启用中';
    case 'inactive':
      return '未启用';
    case 'suspended':
      return '已暂停';
    default:
      return status ?? '未知状态';
  }
}

String _subscriptionStatusLabel(String status, String? expiresAt) {
  switch (status) {
    case 'active':
      return expiresAt == null || expiresAt.isEmpty ? '入驻有效' : '入驻至 $expiresAt';
    case 'expired':
      return '入驻已到期';
    case 'inactive':
    default:
      return '未开通入驻';
  }
}

String? _formatOrganizationDate(Object? value) {
  final text = value?.toString().trim() ?? '';
  if (text.length < 10) return null;
  return text.substring(0, 10);
}

String _memberRoleLabel(String role) {
  switch (role) {
    case 'owner':
      return '所有者';
    case 'admin':
      return '管理员';
    case 'advisor':
      return '顾问';
    case 'member':
    default:
      return '成员';
  }
}

String _workbenchMemberName(Map<String, dynamic> member) {
  final profile = member['profile'];
  if (profile is Map) {
    final nickname = profile['nickname']?.toString().trim();
    if (nickname != null && nickname.isNotEmpty) return nickname;
  }
  final displayName = member['display_name']?.toString().trim();
  if (displayName != null && displayName.isNotEmpty) return displayName;
  final metadata = member['metadata'];
  if (metadata is Map) {
    final metadataName = metadata['display_name']?.toString().trim();
    if (metadataName != null && metadataName.isNotEmpty) return metadataName;
  }
  return '机构成员';
}

String _bulkAssignmentErrorText(Object error) {
  final text = error.toString().trim();
  if (text.isEmpty) return '未知错误';
  const exceptionPrefix = 'Exception: ';
  if (text.startsWith(exceptionPrefix)) {
    final cleaned = text.substring(exceptionPrefix.length).trim();
    return cleaned.isEmpty ? '未知错误' : cleaned;
  }
  return text;
}

class _StatusPill extends StatelessWidget {
  final String label;
  final bool strong;

  const _StatusPill({required this.label, this.strong = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: strong
            ? kCobalt.withValues(alpha: 0.1)
            : context.artC.silver.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: strong
              ? kCobalt.withValues(alpha: 0.12)
              : context.artC.silver.withValues(alpha: 0.2),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w900,
          color: strong ? kCobalt : context.artC.ink.withValues(alpha: 0.5),
        ),
      ),
    );
  }
}

class _WorkbenchMetric {
  final String label;
  final String value;
  final String caption;
  final IconData icon;
  final Color accent;

  const _WorkbenchMetric(
    this.label,
    this.value,
    this.caption,
    this.icon,
    this.accent,
  );
}

class _WorkbenchAction {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final int? badgeCount;

  const _WorkbenchAction({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.badgeCount,
  });
}

BoxDecoration _panelDecoration(BuildContext context) {
  return BoxDecoration(
    color: context.artC.cardIconBg,
    borderRadius: BorderRadius.circular(22),
    border: Border.all(color: context.artC.silver.withValues(alpha: 0.24)),
    boxShadow: [
      BoxShadow(
        color: context.artC.ink.withValues(alpha: 0.024),
        blurRadius: 14,
        offset: const Offset(0, 4),
      ),
    ],
  );
}

String _statusLabel(String status) {
  switch (status) {
    case 'new':
      return '新咨询';
    case 'pending':
      return '待回复';
    case 'active':
      return '沟通中';
    case 'closed':
      return '已关闭';
    case 'converted':
      return '已转化';
    default:
      return status;
  }
}

String? _topicLabel(String? topic) {
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

String? _formatShortTime(dynamic raw) {
  final value = raw?.toString();
  if (value == null || value.isEmpty) return null;
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final local = parsed.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(local.month)}-${two(local.day)}';
}

String? _formatBookingTime(dynamic raw) {
  final value = raw?.toString();
  if (value == null || value.isEmpty) return null;
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final local = parsed.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(local.month)}-${two(local.day)} ${two(local.hour)}:${two(local.minute)}';
}

int _intValue(dynamic value) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

String _checkoutOrderId(Map<String, dynamic> checkout) {
  final direct = checkout['orderId']?.toString().trim() ?? '';
  if (direct.isNotEmpty) return direct;
  final order = checkout['order'];
  if (order is Map) return order['id']?.toString().trim() ?? '';
  return '';
}

String _cleanText(dynamic value) {
  return value?.toString().trim() ?? '';
}

Map<String, dynamic> _mapValue(dynamic value) {
  return value is Map<String, dynamic> ? value : const {};
}

List<String> _stringList(dynamic value) {
  if (value is List) {
    return value
        .map((item) => item?.toString().trim() ?? '')
        .where((item) => item.isNotEmpty)
        .toList();
  }
  final text = _cleanText(value);
  if (text.isEmpty) return const [];
  return _splitTags(text);
}

List<String> _splitTags(String text) {
  final seen = <String>{};
  final result = <String>[];
  for (final item in text.split(RegExp(r'[,，、\s]+'))) {
    final tag = item.trim();
    if (tag.isEmpty || seen.contains(tag)) continue;
    seen.add(tag);
    result.add(tag);
  }
  return result;
}

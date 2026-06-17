import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class WorkbenchTeamScreen extends StatefulWidget {
  final List<Map<String, dynamic>> leads;
  final List<Map<String, dynamic>> serviceBookings;

  const WorkbenchTeamScreen({
    super.key,
    this.leads = const [],
    this.serviceBookings = const [],
  });

  @override
  State<WorkbenchTeamScreen> createState() => _WorkbenchTeamScreenState();
}

class _WorkbenchTeamScreenState extends State<WorkbenchTeamScreen> {
  List<Map<String, dynamic>> _members = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.fetchWorkbenchTeam(status: 'all');
      if (!mounted) return;
      setState(() {
        _members = result.data;
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

  Future<void> _openAddMemberSheet() async {
    final created = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _AddMemberSheet(),
    );
    if (created == null || !mounted) return;
    setState(() {
      final index = _members
          .indexWhere((item) => _text(item['id']) == _text(created['id']));
      if (index >= 0) {
        _members[index] = created;
      } else {
        _members.insert(0, created);
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('已邀请 ${_memberName(created)}')),
    );
  }

  Future<void> _updateMember(
    Map<String, dynamic> member, {
    String? role,
    String? status,
  }) async {
    final memberId = _text(member['id']);
    if (memberId.isEmpty) return;
    try {
      final updated = await BackendApiService.updateWorkbenchTeamMember(
        memberId: memberId,
        role: role,
        status: status,
      );
      if (!mounted) return;
      setState(() {
        final index =
            _members.indexWhere((item) => _text(item['id']) == memberId);
        if (index >= 0) {
          _members[index] = {
            ..._members[index],
            ...updated,
          };
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('成员信息已更新')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('更新失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        title: const Text(
          '团队管理',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            tooltip: '添加成员',
            onPressed: _openAddMemberSheet,
            icon: const Icon(Icons.person_add_alt_1_outlined),
          ),
          IconButton(
            tooltip: '刷新',
            onPressed: _load,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: kCobalt,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 28),
          children: [
            _TeamSummaryCard(
              memberCount: _members.length,
              leadCount: widget.leads.length,
              bookingCount: widget.serviceBookings.length,
            ),
            const SizedBox(height: 12),
            if (_loading)
              const Padding(
                padding: EdgeInsets.only(top: 88),
                child: Center(child: CircularProgressIndicator(color: kCobalt)),
              )
            else if (_error != null)
              _TeamEmptyState(
                title: '团队加载失败',
                body: _error!,
                actionLabel: '重试',
                onAction: _load,
              )
            else if (_members.isEmpty)
              const _TeamEmptyState(
                title: '暂无团队成员',
                body: '机构 owner/admin 发送邀请后，可在这里查看成员角色、邀请状态和工作量。',
              )
            else
              ..._members.map(
                (member) => _TeamMemberCard(
                  member: member,
                  primaryLeadCount: _primaryLeadCount(member),
                  collaborateLeadCount: _collaborateLeadCount(member),
                  bookingCount: _bookingCount(member),
                  onSetRole: (role) => _updateMember(member, role: role),
                  onSetStatus: (status) =>
                      _updateMember(member, status: status),
                ),
              ),
          ],
        ),
      ),
    );
  }

  int _primaryLeadCount(Map<String, dynamic> member) {
    final memberId = _text(member['id']);
    final userId = _text(member['user_id']);
    return widget.leads.where((lead) {
      return _text(lead['assigned_to_member_id']) == memberId ||
          _text(lead['assigned_to_user_id']) == userId;
    }).length;
  }

  int _collaborateLeadCount(Map<String, dynamic> member) {
    final memberId = _text(member['id']);
    final userId = _text(member['user_id']);
    return widget.leads.where((lead) {
      return _list(lead['collaborator_ids']).any((item) {
        if (item is String) return item == memberId || item == userId;
        if (item is Map) {
          return _text(item['member_id']) == memberId ||
              _text(item['user_id']) == userId;
        }
        return false;
      });
    }).length;
  }

  int _bookingCount(Map<String, dynamic> member) {
    final memberId = _text(member['id']);
    final userId = _text(member['user_id']);
    return widget.serviceBookings.where((booking) {
      if (_text(booking['assigned_to_user_id']) == userId) return true;
      return _list(booking['assigned_advisors']).any((item) {
        if (item is Map) {
          return _text(item['member_id']) == memberId ||
              _text(item['user_id']) == userId;
        }
        return false;
      });
    }).length;
  }
}

class _TeamSummaryCard extends StatelessWidget {
  final int memberCount;
  final int leadCount;
  final int bookingCount;

  const _TeamSummaryCard({
    required this.memberCount,
    required this.leadCount,
    required this.bookingCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _teamPanelDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: const Icon(Icons.groups_2_outlined, color: kCobalt),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '机构团队',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                  child: _SummaryMetric(label: '成员', value: '$memberCount')),
              Expanded(child: _SummaryMetric(label: '咨询', value: '$leadCount')),
              Expanded(
                  child: _SummaryMetric(label: '预约', value: '$bookingCount')),
            ],
          ),
        ],
      ),
    );
  }
}

class _AddMemberSheet extends StatefulWidget {
  const _AddMemberSheet();

  @override
  State<_AddMemberSheet> createState() => _AddMemberSheetState();
}

class _AddMemberSheetState extends State<_AddMemberSheet> {
  final _emailCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  String _role = 'advisor';
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty || _submitting) {
      setState(() => _error = '请填写已注册用户邮箱');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final member = await BackendApiService.addWorkbenchTeamMember(
        email: email,
        role: _role,
        displayName: _nameCtrl.text.trim(),
      );
      if (!mounted) return;
      Navigator.of(context).pop(member);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _submitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * 0.78,
      ),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
            20,
            12,
            20,
            MediaQuery.viewInsetsOf(context).bottom + 22,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
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
                      Icons.person_add_alt_1_outlined,
                      color: kCobalt,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      '邀请团队成员',
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
              _TeamTextField(
                controller: _emailCtrl,
                label: '用户邮箱',
                hint: '对方需先完成注册，接受后加入团队',
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              _TeamTextField(
                controller: _nameCtrl,
                label: '展示名',
                hint: '例如：张老师，可留空',
              ),
              const SizedBox(height: 12),
              Text(
                '成员角色',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: context.artC.ink.withValues(alpha: 0.72),
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _RoleChoiceChip(
                    label: '顾问',
                    selected: _role == 'advisor',
                    onSelected: () => setState(() => _role = 'advisor'),
                  ),
                  _RoleChoiceChip(
                    label: '管理员',
                    selected: _role == 'admin',
                    onSelected: () => setState(() => _role = 'admin'),
                  ),
                  _RoleChoiceChip(
                    label: '成员',
                    selected: _role == 'member',
                    onSelected: () => setState(() => _role = 'member'),
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
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                height: 46,
                child: FilledButton.icon(
                  onPressed: _submitting ? null : _submit,
                  style: FilledButton.styleFrom(backgroundColor: kCobalt),
                  icon: _submitting
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.person_add_alt_1_outlined, size: 18),
                  label: Text(_submitting ? '发送中' : '发送邀请'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TeamTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String hint;
  final TextInputType? keyboardType;

  const _TeamTextField({
    required this.controller,
    required this.label,
    required this.hint,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: context.artC.porcelain.withValues(alpha: 0.72),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide:
              BorderSide(color: context.artC.silver.withValues(alpha: 0.28)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide:
              BorderSide(color: context.artC.silver.withValues(alpha: 0.28)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: kCobalt.withValues(alpha: 0.5)),
        ),
      ),
    );
  }
}

class _RoleChoiceChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onSelected;

  const _RoleChoiceChip({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onSelected(),
      selectedColor: kCobalt.withValues(alpha: 0.12),
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w900,
        color: selected ? kCobalt : context.artC.ink.withValues(alpha: 0.56),
      ),
      side: BorderSide(
        color: selected
            ? kCobalt.withValues(alpha: 0.24)
            : context.artC.silver.withValues(alpha: 0.32),
      ),
    );
  }
}

class _SummaryMetric extends StatelessWidget {
  final String label;
  final String value;

  const _SummaryMetric({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: context.artC.ink,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: context.artC.ink.withValues(alpha: 0.42),
          ),
        ),
      ],
    );
  }
}

class _TeamMemberCard extends StatelessWidget {
  final Map<String, dynamic> member;
  final int primaryLeadCount;
  final int collaborateLeadCount;
  final int bookingCount;
  final ValueChanged<String> onSetRole;
  final ValueChanged<String> onSetStatus;

  const _TeamMemberCard({
    required this.member,
    required this.primaryLeadCount,
    required this.collaborateLeadCount,
    required this.bookingCount,
    required this.onSetRole,
    required this.onSetStatus,
  });

  @override
  Widget build(BuildContext context) {
    final name = _memberName(member);
    final role = _roleLabel(_text(member['role']));
    final roleKey = _text(member['role']);
    final status = _text(member['status'], fallback: 'active');
    final organization = _map(member['organization']);
    final orgName = _text(organization['name'], fallback: '所属机构');
    final avatar = _text(_map(member['profile'])['avatar_url']);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: _teamPanelDecoration(context),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: kCobalt.withValues(alpha: 0.1),
                backgroundImage: avatar.isEmpty ? null : NetworkImage(avatar),
                child: avatar.isEmpty
                    ? Text(
                        name.isEmpty ? '成' : name.characters.first,
                        style: const TextStyle(
                          color: kCobalt,
                          fontWeight: FontWeight.w900,
                        ),
                      )
                    : null,
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
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      orgName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: context.artC.ink.withValues(alpha: 0.42),
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  _RolePill(
                    label: status == 'disabled'
                        ? '已停用'
                        : status == 'invited'
                            ? '待接受'
                            : role,
                  ),
                  if (roleKey != 'owner')
                    PopupMenuButton<String>(
                      tooltip: '成员操作',
                      onSelected: (value) {
                        switch (value) {
                          case 'role:admin':
                            onSetRole('admin');
                            break;
                          case 'role:advisor':
                            onSetRole('advisor');
                            break;
                          case 'role:member':
                            onSetRole('member');
                            break;
                          case 'status:active':
                            onSetStatus('active');
                            break;
                          case 'status:disabled':
                            onSetStatus('disabled');
                            break;
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'role:admin',
                          child: Text('设为管理员'),
                        ),
                        const PopupMenuItem(
                          value: 'role:advisor',
                          child: Text('设为顾问'),
                        ),
                        const PopupMenuItem(
                          value: 'role:member',
                          child: Text('设为成员'),
                        ),
                        const PopupMenuDivider(),
                        PopupMenuItem(
                          value: status == 'disabled'
                              ? 'status:invited'
                              : 'status:disabled',
                          child: Text(status == 'disabled' ? '重新邀请' : '停用成员'),
                        ),
                      ],
                      icon: Icon(
                        Icons.more_horiz_rounded,
                        color: context.artC.ink.withValues(alpha: 0.46),
                      ),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _WorkloadPill(
                  label: '主责咨询',
                  value: primaryLeadCount,
                  icon: Icons.assignment_ind_outlined,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _WorkloadPill(
                  label: '协作',
                  value: collaborateLeadCount,
                  icon: Icons.group_work_outlined,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _WorkloadPill(
                  label: '预约',
                  value: bookingCount,
                  icon: Icons.event_available_outlined,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RolePill extends StatelessWidget {
  final String label;

  const _RolePill({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w900,
          color: kCobalt,
        ),
      ),
    );
  }
}

class _WorkloadPill extends StatelessWidget {
  final String label;
  final int value;
  final IconData icon;

  const _WorkloadPill({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(9),
      decoration: BoxDecoration(
        color: context.artC.porcelain.withValues(alpha: 0.72),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 15, color: kCobalt),
          const SizedBox(height: 6),
          Text(
            '$value',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 1),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: context.artC.ink.withValues(alpha: 0.42),
            ),
          ),
        ],
      ),
    );
  }
}

class _TeamEmptyState extends StatelessWidget {
  final String title;
  final String body;
  final String? actionLabel;
  final VoidCallback? onAction;

  const _TeamEmptyState({
    required this.title,
    required this.body,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: _teamPanelDecoration(context),
      child: Column(
        children: [
          const Icon(Icons.groups_2_outlined, color: kCobalt, size: 32),
          const SizedBox(height: 10),
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            body,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              height: 1.45,
              fontWeight: FontWeight.w600,
              color: context.artC.ink.withValues(alpha: 0.48),
            ),
          ),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 14),
            FilledButton(
              onPressed: onAction,
              style: FilledButton.styleFrom(backgroundColor: kCobalt),
              child: Text(actionLabel!),
            ),
          ],
        ],
      ),
    );
  }
}

Map<String, dynamic> _map(dynamic value) {
  if (value is Map) return Map<String, dynamic>.from(value);
  return const {};
}

List<dynamic> _list(dynamic value) {
  if (value is List) return value;
  return const [];
}

String _text(dynamic value, {String fallback = ''}) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

String _memberName(Map<String, dynamic> member) {
  final profile = _map(member['profile']);
  return _text(
    member['display_name'],
    fallback: _text(profile['nickname'], fallback: '机构成员'),
  );
}

String _roleLabel(String role) {
  switch (role) {
    case 'owner':
      return '所有者';
    case 'admin':
      return '管理员';
    case 'advisor':
      return '顾问';
    case 'member':
      return '成员';
    default:
      return role.isEmpty ? '成员' : role;
  }
}

BoxDecoration _teamPanelDecoration(BuildContext context) {
  return BoxDecoration(
    color: context.artC.cardIconBg,
    borderRadius: BorderRadius.circular(18),
    border: Border.all(color: context.artC.silver.withValues(alpha: 0.22)),
    boxShadow: [
      BoxShadow(
        color: context.artC.ink.withValues(alpha: 0.026),
        blurRadius: 12,
        offset: const Offset(0, 4),
      ),
    ],
  );
}

import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../theme/artsee_ui_colors.dart';
import '../../utils/auth_gate.dart';
import '../../widgets/common.dart';

class MentorApplicationScreen extends StatefulWidget {
  const MentorApplicationScreen({super.key});

  @override
  State<MentorApplicationScreen> createState() =>
      _MentorApplicationScreenState();
}

class _MentorApplicationScreenState extends State<MentorApplicationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _university = TextEditingController();
  final _major = TextEditingController();
  final _degree = TextEditingController();
  final _bio = TextEditingController();
  Map<String, dynamic>? _application;
  bool _loading = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    _university.dispose();
    _major.dispose();
    _degree.dispose();
    _bio.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!await ensureLoggedIn(context, message: '请先登录后申请导师认证')) {
      if (mounted) setState(() => _loading = false);
      return;
    }
    try {
      final data = await BackendApiService.fetchMyMentorApplication();
      if (!mounted) return;
      _application = data;
      _name.text = data?['display_name']?.toString() ?? '';
      _university.text = data?['university']?.toString() ?? '';
      _major.text = data?['major']?.toString() ?? '';
      _degree.text = data?['degree']?.toString() ?? '';
      _bio.text = data?['bio']?.toString() ?? '';
    } catch (_) {
      // Empty form is fine when the table is not ready in early environments.
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _submitting) return;
    setState(() => _submitting = true);
    try {
      final data = await BackendApiService.submitMentorApplication({
        'display_name': _name.text.trim(),
        'university': _university.text.trim(),
        'major': _major.text.trim(),
        'degree': _degree.text.trim(),
        'bio': _bio.text.trim(),
        'proof_materials': {
          'note': 'proof upload placeholder',
        },
      });
      if (!mounted) return;
      setState(() {
        _application = data;
        _submitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('导师认证已提交审核')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _submitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('提交失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = _application?['verification_status']?.toString();
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        title: const Text(
          '申请成为导师',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kCobalt))
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
                children: [
                  if (status != null) _StatusBanner(status: status),
                  _Field(
                    label: '展示名称',
                    controller: _name,
                    required: true,
                  ),
                  _Field(label: '录取 / 就读院校', controller: _university),
                  _Field(label: '专业方向', controller: _major),
                  _Field(label: '学位 / 身份', controller: _degree),
                  _Field(
                    label: '导师简介',
                    controller: _bio,
                    minLines: 4,
                    maxLines: 7,
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 48,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(backgroundColor: kCobalt),
                      onPressed: _submitting ? null : _submit,
                      icon: _submitting
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.verified_user_outlined),
                      label: const Text('提交审核'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

class MentorServicesScreen extends StatefulWidget {
  const MentorServicesScreen({super.key});

  @override
  State<MentorServicesScreen> createState() => _MentorServicesScreenState();
}

class _MentorServicesScreenState extends State<MentorServicesScreen> {
  List<Map<String, dynamic>> _services = [];
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
      final result = await BackendApiService.fetchMyMentorServices();
      if (!mounted) return;
      setState(() {
        _services = result.data;
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

  Future<void> _create() async {
    final created = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _MentorServiceSheet(),
    );
    if (created == true) _load();
  }

  Future<void> _openApplication() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute(builder: (_) => const MentorApplicationScreen()),
    );
    if (mounted) _load();
  }

  Future<void> _openAvailability() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute(builder: (_) => const MentorAvailabilityScreen()),
    );
    if (mounted) _load();
  }

  Future<void> _openEarnings() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute(builder: (_) => const MentorEarningsScreen()),
    );
    if (mounted) _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        title: const Text(
          '导师服务',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            tooltip: '收益中心',
            onPressed: _openEarnings,
            icon: const Icon(Icons.account_balance_wallet_outlined),
          ),
          IconButton(
            tooltip: '排期管理',
            onPressed: _openAvailability,
            icon: const Icon(Icons.event_available_outlined),
          ),
          IconButton(
            tooltip: '预约记录',
            onPressed: () => Navigator.of(context).push<void>(
              MaterialPageRoute(builder: (_) => const MentorBookingsScreen()),
            ),
            icon: const Icon(Icons.event_note_outlined),
          ),
          IconButton(
            tooltip: '导师认证',
            onPressed: _openApplication,
            icon: const Icon(Icons.verified_user_outlined),
          ),
          IconButton(
            tooltip: '新增服务',
            onPressed: _create,
            icon: const Icon(Icons.add_circle_outline),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: kCobalt,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
          children: [
            if (_loading)
              const Padding(
                padding: EdgeInsets.only(top: 80),
                child: Center(child: CircularProgressIndicator(color: kCobalt)),
              )
            else if (_error != null)
              _EmptyState(
                title: '导师服务加载失败',
                body: _error!,
                actionLabel: '重试',
                onAction: _load,
              )
            else if (_services.isEmpty)
              _EmptyState(
                title: '还没有服务',
                body: '先创建作品集评估、选校咨询等服务，审核通过后学生可以预约。',
                actionLabel: '新增服务',
                onAction: _create,
              )
            else
              ..._services.map((service) => _ServiceRow(service: service)),
          ],
        ),
      ),
    );
  }
}

class MentorEarningsScreen extends StatefulWidget {
  const MentorEarningsScreen({super.key});

  @override
  State<MentorEarningsScreen> createState() => _MentorEarningsScreenState();
}

class _MentorEarningsScreenState extends State<MentorEarningsScreen> {
  Map<String, dynamic> _summary = const {};
  List<Map<String, dynamic>> _earnings = [];
  List<Map<String, dynamic>> _withdrawals = [];
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
      final decoded = await BackendApiService.fetchMyMentorEarnings();
      if (!mounted) return;
      setState(() {
        _summary = _asMap(decoded['summary']);
        _earnings = _listOfMaps(decoded['data']);
        _withdrawals = _listOfMaps(decoded['withdrawals']);
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

  Future<void> _withdraw() async {
    final maxAmount = _intValue(_summary['withdrawable_amount']);
    if (maxAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('暂无可提现余额')),
      );
      return;
    }
    final amount = await showModalBottomSheet<int>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _WithdrawalSheet(maxAmount: maxAmount),
    );
    if (amount == null) return;
    try {
      await BackendApiService.requestMentorWithdrawal(amount: amount);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('提现申请已提交')),
      );
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('提现申请失败：$e')),
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
          '收益中心',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            tooltip: '申请提现',
            onPressed: _withdraw,
            icon: const Icon(Icons.payments_outlined),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: kCobalt,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
          children: [
            if (_loading)
              const Padding(
                padding: EdgeInsets.only(top: 80),
                child: Center(child: CircularProgressIndicator(color: kCobalt)),
              )
            else if (_error != null)
              _EmptyState(
                title: '收益加载失败',
                body: _error!,
                actionLabel: '重试',
                onAction: _load,
              )
            else ...[
              _EarningsSummary(summary: _summary, onWithdraw: _withdraw),
              if (_withdrawals.isNotEmpty) ...[
                const SizedBox(height: 14),
                const _SectionTitle('提现申请'),
                ..._withdrawals
                    .take(3)
                    .map((item) => _WithdrawalRow(item: item)),
              ],
              const SizedBox(height: 14),
              const _SectionTitle('收益明细'),
              if (_earnings.isEmpty)
                const _EmptyState(
                  title: '暂无收益',
                  body: '学生支付导师预约后，完成服务即可进入可提现收益。',
                )
              else
                ..._earnings.map((item) => _EarningRow(item: item)),
            ],
          ],
        ),
      ),
    );
  }
}

class _EarningsSummary extends StatelessWidget {
  final Map<String, dynamic> summary;
  final VoidCallback onWithdraw;

  const _EarningsSummary({required this.summary, required this.onWithdraw});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _MetricTile(
                  label: '可提现',
                  value: _price(summary['withdrawable_amount']),
                ),
              ),
              Expanded(
                child: _MetricTile(
                  label: '待结算',
                  value: _price(summary['pending_amount']),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _MetricTile(
                  label: '提现中',
                  value: _price(summary['requested_withdrawal_amount']),
                ),
              ),
              Expanded(
                child: _MetricTile(
                  label: '已提现',
                  value: _price(summary['withdrawn_amount']),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              style: FilledButton.styleFrom(backgroundColor: kCobalt),
              onPressed: onWithdraw,
              child: const Text('申请提现'),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  final String label;
  final String value;

  const _MetricTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: context.artC.ink.withValues(alpha: 0.52),
            fontSize: 12,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: TextStyle(
            color: context.artC.ink,
            fontSize: 19,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 0, 4, 8),
      child: Text(
        title,
        style: TextStyle(
          color: context.artC.ink,
          fontSize: 15,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _EarningRow extends StatelessWidget {
  final Map<String, dynamic> item;

  const _EarningRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: context.artC.cardIconBg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile(
        title: Text(
          _price(item['net_amount']),
          style: TextStyle(
            color: context.artC.ink,
            fontWeight: FontWeight.w900,
          ),
        ),
        subtitle: Text('平台服务费 ${_price(item['platform_fee_amount'])}'),
        trailing:
            _SlotStatusChip(status: item['status']?.toString() ?? 'pending'),
      ),
    );
  }
}

class _WithdrawalRow extends StatelessWidget {
  final Map<String, dynamic> item;

  const _WithdrawalRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: context.artC.cardIconBg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile(
        title: Text(
          _price(item['amount']),
          style: TextStyle(
            color: context.artC.ink,
            fontWeight: FontWeight.w900,
          ),
        ),
        subtitle: const Text('提现申请'),
        trailing:
            _SlotStatusChip(status: item['status']?.toString() ?? 'requested'),
      ),
    );
  }
}

class _WithdrawalSheet extends StatefulWidget {
  final int maxAmount;

  const _WithdrawalSheet({required this.maxAmount});

  @override
  State<_WithdrawalSheet> createState() => _WithdrawalSheetState();
}

class _WithdrawalSheetState extends State<_WithdrawalSheet> {
  late final TextEditingController _amount;

  @override
  void initState() {
    super.initState();
    _amount = TextEditingController(
      text: (widget.maxAmount / 100).toStringAsFixed(
        widget.maxAmount % 100 == 0 ? 0 : 2,
      ),
    );
  }

  @override
  void dispose() {
    _amount.dispose();
    super.dispose();
  }

  void _submit() {
    final yuan = double.tryParse(_amount.text.trim()) ?? 0;
    final cents = (yuan * 100).round();
    if (cents <= 0 || cents > widget.maxAmount) return;
    Navigator.of(context).pop(cents);
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
        decoration: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '申请提现',
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              _Field(
                label: '提现金额（元）',
                controller: _amount,
                keyboardType: TextInputType.number,
              ),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: kCobalt),
                  onPressed: _submit,
                  child: const Text('提交申请'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class MentorAvailabilityScreen extends StatefulWidget {
  const MentorAvailabilityScreen({super.key});

  @override
  State<MentorAvailabilityScreen> createState() =>
      _MentorAvailabilityScreenState();
}

class _MentorAvailabilityScreenState extends State<MentorAvailabilityScreen> {
  List<Map<String, dynamic>> _slots = [];
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
      final result = await BackendApiService.fetchMyMentorAvailability();
      if (!mounted) return;
      setState(() {
        _slots = result.data;
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

  Future<void> _create() async {
    final draft = await showModalBottomSheet<_AvailabilityDraft>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _AvailabilitySheet(),
    );
    if (draft == null) return;
    try {
      await BackendApiService.createMentorAvailability(
        startsAt: draft.startsAt.toUtc().toIso8601String(),
        endsAt: draft.endsAt.toUtc().toIso8601String(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('排期已开放')),
      );
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('创建排期失败：$e')),
      );
    }
  }

  Future<void> _archive(Map<String, dynamic> slot) async {
    final id = slot['id']?.toString();
    if (id == null) return;
    try {
      await BackendApiService.updateMentorAvailability(
        slotId: id,
        status: 'archived',
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('排期已归档')),
      );
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('归档失败：$e')),
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
          '排期管理',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            tooltip: '新增排期',
            onPressed: _create,
            icon: const Icon(Icons.add_circle_outline),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: kCobalt,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
          children: [
            if (_loading)
              const Padding(
                padding: EdgeInsets.only(top: 80),
                child: Center(child: CircularProgressIndicator(color: kCobalt)),
              )
            else if (_error != null)
              _EmptyState(
                title: '排期加载失败',
                body: _error!,
                actionLabel: '重试',
                onAction: _load,
              )
            else if (_slots.isEmpty)
              _EmptyState(
                title: '还没有开放时间',
                body: '添加可预约时间后，学生预约导师服务时可以直接选择时间段。',
                actionLabel: '新增排期',
                onAction: _create,
              )
            else
              ..._slots.map(
                (slot) => _AvailabilityRow(
                  slot: slot,
                  onArchive: () => _archive(slot),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _AvailabilityRow extends StatelessWidget {
  final Map<String, dynamic> slot;
  final VoidCallback onArchive;

  const _AvailabilityRow({required this.slot, required this.onArchive});

  @override
  Widget build(BuildContext context) {
    final status = slot['status']?.toString() ?? 'open';
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: context.artC.cardIconBg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile(
        title: Text(
          _rangeText(slot),
          style: TextStyle(
            color: context.artC.ink,
            fontWeight: FontWeight.w900,
          ),
        ),
        subtitle: Text(slot['timezone']?.toString() ?? 'Asia/Shanghai'),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _SlotStatusChip(status: status),
            if (status == 'open') ...[
              const SizedBox(width: 6),
              IconButton(
                tooltip: '归档',
                onPressed: onArchive,
                icon: const Icon(Icons.archive_outlined),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SlotStatusChip extends StatelessWidget {
  final String status;

  const _SlotStatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final label = switch (status) {
      'reserved' => '待确认',
      'booked' => '已占用',
      'blocked' => '已锁定',
      'archived' => '已归档',
      'pending' => '待结算',
      'available' => '可提现',
      'withdrawn' => '已提现',
      'requested' => '待审核',
      'approved' => '已通过',
      'paid' => '已打款',
      'rejected' => '未通过',
      'refunded' => '已退款',
      'canceled' => '已取消',
      _ => '开放',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: kCobalt,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class MentorBookingsScreen extends StatefulWidget {
  const MentorBookingsScreen({super.key});

  @override
  State<MentorBookingsScreen> createState() => _MentorBookingsScreenState();
}

class _MentorBookingsScreenState extends State<MentorBookingsScreen> {
  String _role = 'all';
  List<Map<String, dynamic>> _bookings = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!await ensureLoggedIn(context, message: '请先登录后查看导师预约')) {
      if (mounted) setState(() => _loading = false);
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.fetchMyMentorBookings(role: _role);
      if (!mounted) return;
      setState(() {
        _bookings = result.data;
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

  Future<void> _update(
    Map<String, dynamic> booking, {
    required String status,
    String? note,
  }) async {
    final id = booking['id']?.toString();
    if (id == null) return;
    try {
      await BackendApiService.updateMentorBooking(
        bookingId: id,
        status: status,
        advisorNote: _role == 'mentor' ? note : null,
        studentNote: _role == 'student' ? note : null,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('预约已${_statusLabel(status)}')),
      );
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('更新失败：$e')),
      );
    }
  }

  Future<void> _review(Map<String, dynamic> booking) async {
    final id = booking['id']?.toString();
    if (id == null) return;
    final draft = await showModalBottomSheet<_ReviewDraft>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _ReviewSheet(),
    );
    if (draft == null) return;
    try {
      await BackendApiService.reviewMentorBooking(
        bookingId: id,
        rating: draft.rating,
        body: draft.body,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('评价已提交')),
      );
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('评价失败：$e')),
      );
    }
  }

  Future<void> _pay(Map<String, dynamic> booking) async {
    final orderId = booking['order_id']?.toString();
    if (orderId == null || orderId.isEmpty) return;
    try {
      await BackendApiService.checkoutExistingOrder(orderId);
      await BackendApiService.confirmExistingOrder(orderId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('订单已确认支付')),
      );
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('支付失败：$e')),
      );
    }
  }

  void _changeRole(String role) {
    if (_role == role) return;
    setState(() => _role = role);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        title: const Text(
          '导师预约',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
      ),
      body: RefreshIndicator(
        color: kCobalt,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
          children: [
            _RoleTabs(value: _role, onChanged: _changeRole),
            const SizedBox(height: 12),
            if (_loading)
              const Padding(
                padding: EdgeInsets.only(top: 80),
                child: Center(child: CircularProgressIndicator(color: kCobalt)),
              )
            else if (_error != null)
              _EmptyState(
                title: '预约记录加载失败',
                body: _error!,
                actionLabel: '重试',
                onAction: _load,
              )
            else if (_bookings.isEmpty)
              _EmptyState(
                title: '暂无导师预约',
                body: _role == 'mentor'
                    ? '学生提交预约后会出现在这里，你可以确认、拒绝或标记完成。'
                    : '预约导师后可以在这里查看状态，也可以取消待确认的预约。',
              )
            else
              ..._bookings.map(
                (booking) => _BookingRow(
                  booking: booking,
                  role: _role,
                  onConfirm: () => _update(
                    booking,
                    status: 'confirmed',
                    note: '导师已确认预约',
                  ),
                  onReject: () => _update(
                    booking,
                    status: 'rejected',
                    note: '导师暂无法接单',
                  ),
                  onComplete: () => _update(
                    booking,
                    status: 'completed',
                    note: '服务已完成',
                  ),
                  onCancel: () => _update(
                    booking,
                    status: 'canceled',
                    note: '学生取消预约',
                  ),
                  onReview: () => _review(booking),
                  onPay: () => _pay(booking),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _RoleTabs extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const _RoleTabs({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    const items = [
      ('all', '全部'),
      ('student', '我预约的'),
      ('mentor', '学生预约我'),
    ];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: items
            .map(
              (item) => Expanded(
                child: GestureDetector(
                  onTap: () => onChanged(item.$1),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 160),
                    height: 38,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: value == item.$1 ? kCobalt : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      item.$2,
                      style: TextStyle(
                        color:
                            value == item.$1 ? Colors.white : context.artC.ink,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _BookingRow extends StatelessWidget {
  final Map<String, dynamic> booking;
  final String role;
  final VoidCallback onConfirm;
  final VoidCallback onReject;
  final VoidCallback onComplete;
  final VoidCallback onCancel;
  final VoidCallback onReview;
  final VoidCallback onPay;

  const _BookingRow({
    required this.booking,
    required this.role,
    required this.onConfirm,
    required this.onReject,
    required this.onComplete,
    required this.onCancel,
    required this.onReview,
    required this.onPay,
  });

  @override
  Widget build(BuildContext context) {
    final service = _asMap(booking['service']);
    final mentor = _asMap(booking['mentor']);
    final metadata = _asMap(booking['metadata']);
    final title = service['title']?.toString() ??
        metadata['service_title']?.toString() ??
        '导师服务';
    final mentorName = mentor['display_name']?.toString() ?? '认证导师';
    final status = booking['status']?.toString() ?? 'requested';
    final paymentStatus = booking['payment_status']?.toString() ?? 'waived';
    final note = booking['student_note']?.toString();
    final advisorNote = booking['advisor_note']?.toString();
    final review = _asMap(booking['review']);
    final price = service['price_amount'] ?? metadata['price_amount'];
    final duration =
        service['duration_minutes'] ?? metadata['duration_minutes'];

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: context.artC.cardIconBg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      color: context.artC.ink,
                      fontWeight: FontWeight.w900,
                      fontSize: 15,
                    ),
                  ),
                ),
                _StatusChip(status: status),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '$mentorName · ${duration ?? '-'} 分钟 · ${_price(price)}',
              style: TextStyle(
                color: context.artC.ink.withValues(alpha: 0.58),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
            if (paymentStatus != 'waived') ...[
              const SizedBox(height: 8),
              _PaymentChip(status: paymentStatus),
            ],
            if (note != null && note.trim().isNotEmpty) ...[
              const SizedBox(height: 8),
              Text('学生备注：$note',
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.68),
                    fontSize: 12,
                    height: 1.45,
                  )),
            ],
            if (advisorNote != null && advisorNote.trim().isNotEmpty) ...[
              const SizedBox(height: 6),
              Text('导师备注：$advisorNote',
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.68),
                    fontSize: 12,
                    height: 1.45,
                  )),
            ],
            if (role == 'mentor' && status == 'requested') ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onReject,
                      child: const Text('拒绝'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton(
                      style: FilledButton.styleFrom(backgroundColor: kCobalt),
                      onPressed: onConfirm,
                      child: const Text('确认'),
                    ),
                  ),
                ],
              ),
            ] else if (role == 'mentor' &&
                (status == 'confirmed' || status == 'scheduled')) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: kCobalt),
                  onPressed: onComplete,
                  child: const Text('标记完成'),
                ),
              ),
            ] else if (role == 'student' &&
                paymentStatus != 'paid' &&
                paymentStatus != 'waived' &&
                status != 'canceled' &&
                status != 'rejected') ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: kCobalt),
                  onPressed: onPay,
                  child: const Text('支付订单'),
                ),
              ),
            ] else if (role == 'student' &&
                (status == 'requested' || status == 'confirmed')) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: onCancel,
                  child: const Text('取消预约'),
                ),
              ),
            ] else if (role == 'student' &&
                status == 'completed' &&
                review.isEmpty) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: kCobalt),
                  onPressed: onReview,
                  child: const Text('评价导师'),
                ),
              ),
            ] else if (review.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                '${role == 'mentor' ? '学生评价' : '我的评价'}：${review['rating'] ?? '-'} 星',
                style: const TextStyle(
                  color: kCobalt,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        _statusLabel(status),
        style: const TextStyle(
          color: kCobalt,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _PaymentChip extends StatelessWidget {
  final String status;

  const _PaymentChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final label = switch (status) {
      'paid' => '已支付',
      'checkout_created' => '待支付',
      'refunded' => '已退款',
      _ => '待支付',
    };
    final color = status == 'paid' ? const Color(0xFF059669) : kCobalt;
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontSize: 11,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _ReviewDraft {
  final int rating;
  final String body;

  const _ReviewDraft({required this.rating, required this.body});
}

class _ReviewSheet extends StatefulWidget {
  const _ReviewSheet();

  @override
  State<_ReviewSheet> createState() => _ReviewSheetState();
}

class _ReviewSheetState extends State<_ReviewSheet> {
  final _body = TextEditingController();
  int _rating = 5;

  @override
  void dispose() {
    _body.dispose();
    super.dispose();
  }

  void _submit() {
    Navigator.of(context).pop(
      _ReviewDraft(rating: _rating, body: _body.text.trim()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
        decoration: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '评价导师',
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  5,
                  (index) {
                    final value = index + 1;
                    return IconButton(
                      tooltip: '$value 星',
                      onPressed: () => setState(() => _rating = value),
                      icon: Icon(
                        value <= _rating ? Icons.star : Icons.star_border,
                        color: const Color(0xFFF59E0B),
                        size: 32,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
              _Field(
                label: '评价内容',
                controller: _body,
                minLines: 3,
                maxLines: 5,
              ),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: kCobalt),
                  onPressed: _submit,
                  child: const Text('提交评价'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AvailabilityDraft {
  final DateTime startsAt;
  final DateTime endsAt;

  const _AvailabilityDraft({required this.startsAt, required this.endsAt});
}

class _AvailabilitySheet extends StatefulWidget {
  const _AvailabilitySheet();

  @override
  State<_AvailabilitySheet> createState() => _AvailabilitySheetState();
}

class _AvailabilitySheetState extends State<_AvailabilitySheet> {
  late DateTime _start;
  int _duration = 60;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now().add(const Duration(days: 1));
    _start = DateTime(now.year, now.month, now.day, 19);
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _start,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 180)),
    );
    if (picked == null) return;
    setState(() {
      _start = DateTime(
        picked.year,
        picked.month,
        picked.day,
        _start.hour,
        _start.minute,
      );
    });
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: _start.hour, minute: _start.minute),
    );
    if (picked == null) return;
    setState(() {
      _start = DateTime(
        _start.year,
        _start.month,
        _start.day,
        picked.hour,
        picked.minute,
      );
    });
  }

  void _submit() {
    Navigator.of(context).pop(
      _AvailabilityDraft(
        startsAt: _start,
        endsAt: _start.add(Duration(minutes: _duration)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '新增可预约时间',
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _pickDate,
                    icon: const Icon(Icons.calendar_month_outlined),
                    label: Text(_dateText(_start)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _pickTime,
                    icon: const Icon(Icons.schedule_outlined),
                    label: Text(_timeText(_start)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 30, label: Text('30 分')),
                ButtonSegment(value: 60, label: Text('60 分')),
                ButtonSegment(value: 90, label: Text('90 分')),
              ],
              selected: {_duration},
              onSelectionChanged: (values) {
                setState(() => _duration = values.first);
              },
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton(
                style: FilledButton.styleFrom(backgroundColor: kCobalt),
                onPressed: _submit,
                child: const Text('开放这个时间'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MentorServiceSheet extends StatefulWidget {
  const _MentorServiceSheet();

  @override
  State<_MentorServiceSheet> createState() => _MentorServiceSheetState();
}

class _MentorServiceSheetState extends State<_MentorServiceSheet> {
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _duration = TextEditingController(text: '60');
  final _price = TextEditingController(text: '500');
  bool _saving = false;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _duration.dispose();
    _price.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final title = _title.text.trim();
    final duration = int.tryParse(_duration.text.trim()) ?? 0;
    final priceYuan = double.tryParse(_price.text.trim()) ?? -1;
    if (title.isEmpty || duration <= 0 || priceYuan < 0 || _saving) return;
    setState(() => _saving = true);
    try {
      await BackendApiService.createMentorService(
        title: title,
        description: _description.text.trim(),
        durationMinutes: duration,
        priceAmount: (priceYuan * 100).round(),
      );
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('创建失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
        decoration: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '新增导师服务',
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              _Field(label: '服务标题', controller: _title, required: true),
              _Field(
                label: '服务说明',
                controller: _description,
                minLines: 3,
                maxLines: 5,
              ),
              Row(
                children: [
                  Expanded(
                    child: _Field(
                      label: '时长（分钟）',
                      controller: _duration,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _Field(
                      label: '价格（元）',
                      controller: _price,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: kCobalt),
                  onPressed: _saving ? null : _save,
                  child: Text(_saving ? '保存中...' : '保存服务'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final bool required;
  final int minLines;
  final int maxLines;
  final TextInputType? keyboardType;

  const _Field({
    required this.label,
    required this.controller,
    this.required = false,
    this.minLines = 1,
    this.maxLines = 1,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        minLines: minLines,
        maxLines: maxLines,
        keyboardType: keyboardType,
        validator: required
            ? (value) =>
                value == null || value.trim().isEmpty ? '请填写$label' : null
            : null,
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: context.artC.cardIconBg,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }
}

class _StatusBanner extends StatelessWidget {
  final String status;

  const _StatusBanner({required this.status});

  @override
  Widget build(BuildContext context) {
    final label = switch (status) {
      'verified' => '认证已通过',
      'rejected' => '认证未通过',
      'pending' => '认证审核中',
      _ => '草稿',
    };
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: kCobalt,
          fontSize: 13,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _ServiceRow extends StatelessWidget {
  final Map<String, dynamic> service;

  const _ServiceRow({required this.service});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: context.artC.cardIconBg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile(
        title: Text(
          service['title']?.toString() ?? '导师服务',
          style: TextStyle(
            color: context.artC.ink,
            fontWeight: FontWeight.w900,
          ),
        ),
        subtitle: Text(
          '${service['duration_minutes'] ?? '-'} 分钟 · ${_price(service['price_amount'])} · ${service['status'] ?? 'active'}',
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String title;
  final String body;
  final String? actionLabel;
  final VoidCallback? onAction;

  const _EmptyState({
    required this.title,
    required this.body,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 80),
      child: Column(
        children: [
          Icon(Icons.school_outlined,
              size: 36, color: context.artC.ink.withValues(alpha: 0.34)),
          const SizedBox(height: 10),
          Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 15,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            body,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.52),
              fontSize: 12,
              height: 1.45,
              fontWeight: FontWeight.w700,
            ),
          ),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 14),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: kCobalt),
              onPressed: onAction,
              child: Text(actionLabel!),
            ),
          ],
        ],
      ),
    );
  }
}

String _price(dynamic value) {
  final amount =
      value is int ? value : int.tryParse(value?.toString() ?? '') ?? 0;
  if (amount <= 0) return '免费';
  return '¥${(amount / 100).toStringAsFixed(amount % 100 == 0 ? 0 : 2)}';
}

String _rangeText(Map<String, dynamic> slot) {
  final start = DateTime.tryParse(slot['starts_at']?.toString() ?? '');
  final end = DateTime.tryParse(slot['ends_at']?.toString() ?? '');
  if (start == null) return '可预约时间';
  final localStart = start.toLocal();
  final localEnd = end?.toLocal();
  return '${_dateText(localStart)} ${_timeText(localStart)}'
      '${localEnd == null ? '' : '-${_timeText(localEnd)}'}';
}

String _dateText(DateTime value) {
  return '${value.month.toString().padLeft(2, '0')}/${value.day.toString().padLeft(2, '0')}';
}

String _timeText(DateTime value) {
  return '${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';
}

String _statusLabel(String status) {
  return switch (status) {
    'confirmed' => '已确认',
    'scheduled' => '已排期',
    'completed' => '已完成',
    'canceled' => '已取消',
    'rejected' => '未通过',
    _ => '待确认',
  };
}

Map<String, dynamic> _asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) {
    return value.map((key, value) => MapEntry(key.toString(), value));
  }
  return const {};
}

List<Map<String, dynamic>> _listOfMaps(dynamic value) {
  if (value is! List) return const [];
  return value
      .whereType<Map>()
      .map((item) => Map<String, dynamic>.from(item))
      .toList();
}

int _intValue(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.round();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

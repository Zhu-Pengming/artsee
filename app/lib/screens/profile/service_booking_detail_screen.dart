import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';
import 'consultation_detail_screen.dart';

class ServiceBookingDetailScreen extends StatefulWidget {
  final Map<String, dynamic> booking;

  const ServiceBookingDetailScreen({
    super.key,
    required this.booking,
  });

  @override
  State<ServiceBookingDetailScreen> createState() =>
      _ServiceBookingDetailScreenState();
}

class _ServiceBookingDetailScreenState
    extends State<ServiceBookingDetailScreen> {
  late Map<String, dynamic> _booking;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _booking = widget.booking;
    _load();
  }

  Future<void> _load() async {
    final id = _booking['id']?.toString();
    if (id == null || id.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await BackendApiService.fetchMyServiceBooking(id);
      if (!mounted) return;
      setState(() {
        _booking = data;
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

  Future<void> _openConsultation() async {
    final consultation = _asMap(_booking['consultation']);
    if (consultation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('关联咨询暂不可用')),
      );
      return;
    }
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ConsultationDetailScreen(consultation: consultation),
      ),
    );
    if (mounted) _load();
  }

  @override
  Widget build(BuildContext context) {
    final title = _booking['title']?.toString() ?? '预约服务';
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          tooltip: '返回',
          icon: Icon(Icons.arrow_back_ios_new_rounded,
              color: context.artC.ink, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '预约详情',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w900,
            color: context.artC.ink,
          ),
        ),
        actions: [
          IconButton(
            tooltip: '刷新',
            onPressed: _loading ? null : _load,
            icon: const Icon(Icons.refresh_rounded, size: 20),
            color: context.artC.ink.withValues(alpha: 0.56),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: kCobalt,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 28),
          children: [
            if (_loading) const _LoadingStrip(),
            if (_error != null) ...[
              _NoticeCard(
                icon: Icons.error_outline_rounded,
                title: '预约详情加载失败',
                body: _error!,
              ),
              const SizedBox(height: 12),
            ],
            _BookingHeroCard(
              title: title,
              status: _serviceBookingStatusLabel(
                _booking['status']?.toString() ?? 'requested',
              ),
              targetName: _targetName(_booking),
              scheduledAt: _formatDetailTime(_booking['scheduled_at']),
              updatedAt: _formatDetailTime(
                _booking['updated_at'] ?? _booking['created_at'],
              ),
            ),
            const SizedBox(height: 12),
            _InfoCard(
              title: '服务信息',
              rows: [
                _InfoRow(
                  label: '服务类型',
                  value:
                      _serviceTypeLabel(_booking['service_type']?.toString()),
                ),
                _InfoRow(
                  label: '关联咨询',
                  value: _targetName(_booking) ?? '申请咨询',
                ),
                _InfoRow(
                  label: '当前状态',
                  value: _serviceBookingStatusLabel(
                    _booking['status']?.toString() ?? 'requested',
                  ),
                ),
                if (_notBlank(_booking['notes']?.toString()))
                  _InfoRow(label: '备注', value: _booking['notes'].toString()),
              ],
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: kCobalt,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              onPressed: _openConsultation,
              icon: const Icon(Icons.forum_outlined, size: 18),
              label: const Text(
                '查看原咨询',
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LoadingStrip extends StatelessWidget {
  const _LoadingStrip();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: LinearProgressIndicator(
        minHeight: 2,
        color: kCobalt,
        backgroundColor: Color(0x00000000),
      ),
    );
  }
}

class _BookingHeroCard extends StatelessWidget {
  final String title;
  final String status;
  final String? targetName;
  final String? scheduledAt;
  final String? updatedAt;

  const _BookingHeroCard({
    required this.title,
    required this.status,
    required this.targetName,
    required this.scheduledAt,
    required this.updatedAt,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: context.artC.silver.withValues(alpha: 0.28),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.09),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const Icon(
                  Icons.event_available_outlined,
                  color: kCobalt,
                  size: 21,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 18,
                        height: 1.22,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                    if (_notBlank(targetName)) ...[
                      const SizedBox(height: 5),
                      Text(
                        targetName!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: context.artC.ink.withValues(alpha: 0.46),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _StatusPill(label: status),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _MetaPill(
                icon: Icons.schedule_rounded,
                label: scheduledAt == null ? '等待顾问排期' : '排期 $scheduledAt',
              ),
              if (updatedAt != null)
                _MetaPill(icon: Icons.sync_rounded, label: '更新 $updatedAt'),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String title;
  final List<_InfoRow> rows;

  const _InfoCard({
    required this.title,
    required this.rows,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: context.artC.silver.withValues(alpha: 0.24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 12),
          ...rows.map((row) => _InfoLine(row: row)),
        ],
      ),
    );
  }
}

class _InfoRow {
  final String label;
  final String value;

  const _InfoRow({
    required this.label,
    required this.value,
  });
}

class _InfoLine extends StatelessWidget {
  final _InfoRow row;

  const _InfoLine({required this.row});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 70,
            child: Text(
              row.label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: context.artC.ink.withValues(alpha: 0.42),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              row.value,
              style: TextStyle(
                fontSize: 13,
                height: 1.38,
                fontWeight: FontWeight.w800,
                color: context.artC.ink.withValues(alpha: 0.76),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NoticeCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;

  const _NoticeCard({
    required this.icon,
    required this.title,
    required this.body,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.24)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: context.artC.ink.withValues(alpha: 0.48)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  body,
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.38,
                    fontWeight: FontWeight.w700,
                    color: context.artC.ink.withValues(alpha: 0.52),
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

class _StatusPill extends StatelessWidget {
  final String label;

  const _StatusPill({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.09),
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

class _MetaPill extends StatelessWidget {
  final IconData icon;
  final String label;

  const _MetaPill({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: context.artC.porcelain,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: context.artC.ink.withValues(alpha: 0.44)),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: context.artC.ink.withValues(alpha: 0.54),
            ),
          ),
        ],
      ),
    );
  }
}

String _serviceBookingStatusLabel(String status) {
  switch (status) {
    case 'confirmed':
      return '已确认';
    case 'scheduled':
      return '已排期';
    case 'completed':
      return '已完成';
    case 'canceled':
      return '已取消';
    case 'requested':
    default:
      return '待确认';
  }
}

String _serviceTypeLabel(String? type) {
  switch (type) {
    case 'consultation_followup':
      return '咨询后续服务';
    default:
      return type == null || type.isEmpty ? '申请服务' : type;
  }
}

String? _targetName(Map<String, dynamic> booking) {
  final consultation = _asMap(booking['consultation']);
  final name = consultation?['target_name']?.toString();
  if (_notBlank(name)) return name;
  return null;
}

Map<String, dynamic>? _asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return null;
}

bool _notBlank(String? value) => value != null && value.trim().isNotEmpty;

String? _formatDetailTime(dynamic raw) {
  final value = raw?.toString();
  if (value == null || value.isEmpty) return null;
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final local = parsed.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${local.year}-${two(local.month)}-${two(local.day)} '
      '${two(local.hour)}:${two(local.minute)}';
}

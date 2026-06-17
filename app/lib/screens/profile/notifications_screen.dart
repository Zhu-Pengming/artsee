import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import '../workspace/workbench_consultation_detail_screen.dart';
import '../workspace/workbench_contracts_screen.dart';
import 'application_workspace_screen.dart';
import 'consultation_detail_screen.dart';
import 'contract_archive_screen.dart';
import 'identity_verification_screen.dart';
import 'order_detail_screen.dart';
import 'orders_screen.dart';
import 'service_booking_detail_screen.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class NotificationsScreen extends StatefulWidget {
  final bool isBusinessUser;

  const NotificationsScreen({
    super.key,
    required this.isBusinessUser,
  });

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = true;
  String? _error;
  String _filter = 'all';

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
      final result = await BackendApiService.fetchNotifications(
        limit: 50,
        readStatus: _filter == 'unread' ? 'unread' : null,
      );
      if (!mounted) return;
      setState(() {
        _notifications = result.data;
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

  Future<void> _markAllRead() async {
    try {
      await BackendApiService.markAllNotificationsRead();
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('操作失败：$e')),
      );
    }
  }

  Future<void> _openNotification(Map<String, dynamic> notification) async {
    final id = notification['id']?.toString();
    if (id != null && notification['read_status'] != 'read') {
      try {
        await BackendApiService.markNotificationRead(id);
        if (mounted) {
          setState(() {
            notification['read_status'] = 'read';
          });
        }
      } catch (_) {}
    }

    final type = notification['type']?.toString();
    final metadata = notification['metadata'];
    final consultationId =
        metadata is Map ? metadata['consultation_id']?.toString() : null;
    final serviceBookingId =
        metadata is Map ? metadata['service_booking_id']?.toString() : null;
    final orderId = metadata is Map ? metadata['order_id']?.toString() : null;
    if (!mounted) return;
    if (type == 'verification') {
      await Navigator.of(context).push<void>(
        MaterialPageRoute<void>(
          builder: (_) => const IdentityVerificationScreen(),
        ),
      );
      return;
    }
    if (type == 'contract') {
      await Navigator.of(context).push<void>(
        MaterialPageRoute<void>(
          builder: (_) => widget.isBusinessUser
              ? const WorkbenchContractsScreen()
              : const ContractArchiveScreen(),
        ),
      );
      return;
    }
    if (type == 'order') {
      if (orderId != null && orderId.isNotEmpty) {
        try {
          final order = await BackendApiService.fetchMyOrder(orderId);
          if (!mounted) return;
          await Navigator.of(context).push<void>(
            MaterialPageRoute<void>(
              builder: (_) => OrderDetailScreen(order: order),
            ),
          );
          return;
        } catch (_) {}
      }
      if (!mounted) return;
      await Navigator.of(context).push<void>(
        MaterialPageRoute<void>(builder: (_) => const OrdersScreen()),
      );
      return;
    }
    if (!widget.isBusinessUser &&
        type == 'service_booking' &&
        serviceBookingId != null &&
        serviceBookingId.isNotEmpty) {
      try {
        final booking =
            await BackendApiService.fetchMyServiceBooking(serviceBookingId);
        if (!mounted) return;
        await Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => ServiceBookingDetailScreen(booking: booking),
          ),
        );
        return;
      } catch (_) {}
    }
    if (consultationId != null && consultationId.isNotEmpty) {
      try {
        if (widget.isBusinessUser) {
          final consultation =
              await BackendApiService.fetchWorkbenchConsultation(
                  consultationId);
          if (!mounted) return;
          await Navigator.of(context).push<void>(
            MaterialPageRoute<void>(
              builder: (_) => WorkbenchConsultationDetailScreen(
                consultation: consultation,
              ),
            ),
          );
        } else {
          final consultation =
              await BackendApiService.fetchConsultation(consultationId);
          if (!mounted) return;
          await Navigator.of(context).push<void>(
            MaterialPageRoute<void>(
              builder: (_) => ConsultationDetailScreen(
                consultation: consultation,
              ),
            ),
          );
        }
      } catch (_) {
        if (!mounted) return;
        await Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => const ApplicationWorkspaceScreen(
              kind: ApplicationWorkspaceKind.consultations,
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        leading: IconButton(
          tooltip: '返回',
          icon: Icon(Icons.arrow_back_ios, color: context.artC.ink, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '消息通知',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w900,
            color: context.artC.ink,
          ),
        ),
        actions: [
          TextButton(
            onPressed: _notifications.isEmpty ? null : _markAllRead,
            child: const Text('全部已读'),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: kCobalt,
        onRefresh: _load,
        child: Column(
          children: [
            _NotificationFilter(
              value: _filter,
              onChanged: (value) {
                setState(() => _filter = value);
                _load();
              },
            ),
            Expanded(child: _buildBody()),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2.5),
      );
    }
    if (_error != null) {
      return ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const SizedBox(height: 120),
          Icon(
            Icons.notifications_off_outlined,
            size: 40,
            color: context.artC.ink.withValues(alpha: 0.24),
          ),
          const SizedBox(height: 12),
          Text(
            '通知加载失败',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _error!,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              height: 1.4,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.46),
            ),
          ),
          const SizedBox(height: 18),
          Center(
            child: FilledButton(
              style: FilledButton.styleFrom(backgroundColor: kCobalt),
              onPressed: _load,
              child: const Text('重新加载'),
            ),
          ),
        ],
      );
    }
    if (_notifications.isEmpty) {
      return ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const SizedBox(height: 140),
          Icon(
            Icons.notifications_none_rounded,
            size: 44,
            color: context.artC.ink.withValues(alpha: 0.2),
          ),
          const SizedBox(height: 12),
          Text(
            _filter == 'unread' ? '暂无未读通知' : '暂无通知',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
        ],
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 26),
      itemCount: _notifications.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) => _NotificationCard(
        notification: _notifications[index],
        onTap: () => _openNotification(_notifications[index]),
      ),
    );
  }
}

class _NotificationFilter extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const _NotificationFilter({
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    const options = {'all': '全部', 'unread': '未读'};
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 10),
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
                    : context.artC.ink.withValues(alpha: 0.54),
              ),
              side: BorderSide(
                color: selected
                    ? kCobalt.withValues(alpha: 0.3)
                    : context.artC.silver.withValues(alpha: 0.3),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final Map<String, dynamic> notification;
  final VoidCallback onTap;

  const _NotificationCard({
    required this.notification,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final unread = notification['read_status'] != 'read';
    final type = notification['type']?.toString() ?? 'system';
    final title = notification['title']?.toString() ?? '通知';
    final content = notification['content']?.toString();
    final time = _formatNotificationTime(notification['created_at']);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            color: context.artC.cardIconBg,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: unread
                  ? kCobalt.withValues(alpha: 0.22)
                  : context.artC.silver.withValues(alpha: 0.22),
            ),
            boxShadow: [
              BoxShadow(
                color: context.artC.ink.withValues(alpha: 0.024),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: kCobalt.withValues(alpha: 0.09),
                      borderRadius: BorderRadius.circular(13),
                    ),
                    child: Icon(
                      _notificationIcon(type),
                      color: kCobalt,
                      size: 19,
                    ),
                  ),
                  if (unread)
                    Positioned(
                      right: -1,
                      top: -1,
                      child: Container(
                        width: 9,
                        height: 9,
                        decoration: const BoxDecoration(
                          color: Color(0xFFE11D48),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),
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
                              fontWeight:
                                  unread ? FontWeight.w900 : FontWeight.w800,
                              color: context.artC.ink,
                            ),
                          ),
                        ),
                        if (time != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            time,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: context.artC.ink.withValues(alpha: 0.34),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (content != null && content.trim().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        content,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          height: 1.4,
                          fontWeight: FontWeight.w700,
                          color: context.artC.ink.withValues(alpha: 0.52),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

IconData _notificationIcon(String type) {
  if (type.contains('verification')) return Icons.verified_outlined;
  if (type.contains('contract')) return Icons.description_outlined;
  if (type.contains('assessment')) return Icons.assignment_turned_in_outlined;
  if (type.contains('recommendation')) return Icons.route_outlined;
  if (type.contains('booking')) return Icons.event_available_outlined;
  if (type.contains('order')) return Icons.receipt_long_outlined;
  if (type.contains('consultation')) return Icons.forum_outlined;
  return Icons.notifications_outlined;
}

String? _formatNotificationTime(dynamic raw) {
  final value = raw?.toString();
  if (value == null || value.isEmpty) return null;
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final local = parsed.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(local.month)}-${two(local.day)} ${two(local.hour)}:${two(local.minute)}';
}

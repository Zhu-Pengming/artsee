import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';
import 'order_detail_screen.dart';
import 'service_booking_detail_screen.dart';

class ConsultationDetailScreen extends StatefulWidget {
  final Map<String, dynamic> consultation;

  const ConsultationDetailScreen({
    super.key,
    required this.consultation,
  });

  @override
  State<ConsultationDetailScreen> createState() =>
      _ConsultationDetailScreenState();
}

class _ConsultationDetailScreenState extends State<ConsultationDetailScreen> {
  late Map<String, dynamic> _consultation;
  final _input = TextEditingController();
  final _scroll = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  Map<String, dynamic>? _assessment;
  Map<String, dynamic>? _recommendation;
  Map<String, dynamic>? _conversion;
  Map<String, dynamic>? _review;
  bool _loading = true;
  bool _sending = false;
  bool _reviewing = false;
  String? _error;

  String? get _id => _consultation['id']?.toString();

  @override
  void initState() {
    super.initState();
    _consultation = widget.consultation;
    _load();
  }

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final id = _id;
    if (id == null || id.isEmpty) {
      setState(() {
        _loading = false;
        _error = '咨询记录缺少 ID';
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final consultation = await BackendApiService.fetchConsultation(id);
      final messages = await BackendApiService.fetchConsultationMessages(
        consultationId: id,
      );
      final assessment =
          await BackendApiService.fetchConsultationAssessment(id);
      final recommendation =
          await BackendApiService.fetchConsultationRecommendation(id);
      Map<String, dynamic> conversion = {};
      try {
        conversion = await BackendApiService.fetchConsultationConversion(id);
      } catch (_) {
        conversion = {};
      }
      Map<String, dynamic>? review;
      try {
        review = await BackendApiService.fetchConsultationReview(id);
      } catch (_) {
        review = null;
      }
      if (!mounted) return;
      setState(() {
        _consultation = consultation;
        _messages = messages.data;
        _assessment = assessment;
        _recommendation = recommendation;
        _conversion = conversion;
        _review = review;
        _loading = false;
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _openReviewSheet() async {
    final id = _id;
    if (id == null || id.isEmpty || _reviewing) return;
    final draft = await showModalBottomSheet<_ReviewDraft>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _ConsultationReviewSheet(),
    );
    if (draft == null || !mounted) return;
    setState(() => _reviewing = true);
    try {
      final review = await BackendApiService.reviewConsultation(
        consultationId: id,
        rating: draft.rating,
        body: draft.body,
      );
      if (!mounted) return;
      setState(() => _review = review);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('评价已提交')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('评价失败：$e')),
      );
    } finally {
      if (mounted) setState(() => _reviewing = false);
    }
  }

  Future<void> _send() async {
    final id = _id;
    final text = _input.text.trim();
    if (id == null || id.isEmpty || text.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      await BackendApiService.sendConsultationMessage(
        consultationId: id,
        body: text,
      );
      _input.clear();
      await _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('发送失败：$e')),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scroll.hasClients) return;
      _scroll.animateTo(
        _scroll.position.maxScrollExtent,
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOut,
      );
    });
  }

  List<Map<String, dynamic>> _displayMessages() {
    if (_messages.isNotEmpty) return _messages;
    final lastMessage = _consultation['last_message']?.toString();
    if (lastMessage == null || lastMessage.trim().isEmpty) return const [];
    return [
      {
        'sender_role': 'student',
        'body': lastMessage,
        'created_at': _consultation['created_at'],
      }
    ];
  }

  @override
  Widget build(BuildContext context) {
    final targetName = _consultation['target_name']?.toString() ?? '咨询详情';
    final status = _consultation['status']?.toString() ?? 'pending';
    final messages = _displayMessages();
    final canReview = _canReviewOrganizationConsultation(_consultation);
    final hasAdvisorReply = messages.any((message) {
      final role = message['sender_role']?.toString();
      return role == 'advisor' || role == 'institution' || role == 'system';
    });

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        child: Column(
          children: [
            _ConsultationHeader(
              title: '$targetName咨询',
              subtitle: '平台顾问将在这里回复',
              status: _consultationStatusLabel(status),
              onRefresh: _load,
            ),
            if (_loading)
              const Expanded(
                child: Center(
                  child: CircularProgressIndicator(
                    color: kCobalt,
                    strokeWidth: 2.5,
                  ),
                ),
              )
            else if (_error != null)
              Expanded(
                child: _ConsultationErrorState(
                  error: _error!,
                  onRetry: _load,
                ),
              )
            else
              Expanded(
                child: ListView(
                  controller: _scroll,
                  padding: const EdgeInsets.fromLTRB(18, 12, 18, 18),
                  children: [
                    if (_conversionHasData(_conversion)) ...[
                      _ConsultationConversionCard(
                        conversion: _conversion!,
                        onViewBooking: () {
                          final booking =
                              _asMap(_conversion?['service_booking']);
                          if (booking == null) return;
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) =>
                                  ServiceBookingDetailScreen(booking: booking),
                            ),
                          );
                        },
                        onViewOrder: () {
                          final order = _asMap(_conversion?['order']);
                          if (order == null) return;
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => OrderDetailScreen(order: order),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (_assessment != null || _recommendation != null) ...[
                      _ConsultationInsightSection(
                        assessment: _assessment,
                        recommendation: _recommendation,
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (canReview) ...[
                      _ConsultationReviewCard(
                        review: _review,
                        reviewing: _reviewing,
                        onReview: _openReviewSheet,
                      ),
                      const SizedBox(height: 12),
                    ],
                    ...messages.map(
                      (message) => _ConsultationBubble(
                        role: message['sender_role']?.toString() ?? 'student',
                        senderName: _messageSenderName(message),
                        body: message['body']?.toString() ?? '',
                        time: _formatConsultationTime(message['created_at']),
                      ),
                    ),
                    if (!hasAdvisorReply)
                      const _ConsultationBubble(
                        role: 'system',
                        body: '咨询已提交，顾问会尽快回复。',
                      ),
                  ],
                ),
              ),
            _ConsultationInputBar(
              controller: _input,
              sending: _sending,
              enabled: status != 'closed',
              onSend: _send,
            ),
          ],
        ),
      ),
    );
  }

  String? _messageSenderName(Map<String, dynamic> message) {
    final role = message['sender_role']?.toString() ?? '';
    if (role == 'student' || role == 'system') return null;
    final memberName = message['member_name']?.toString().trim() ?? '';
    final metadata = _asMap(_consultation['metadata']);
    final orgName = metadata?['organization_name']?.toString().trim() ?? '';
    if (orgName.isNotEmpty && memberName.isNotEmpty) {
      return '$orgName - $memberName';
    }
    if (memberName.isNotEmpty) return memberName;
    if (orgName.isNotEmpty) return orgName;
    return null;
  }
}

class _ConsultationHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final String status;
  final VoidCallback onRefresh;

  const _ConsultationHeader({
    required this.title,
    required this.subtitle,
    required this.status,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
      child: Row(
        children: [
          IconButton(
            tooltip: '返回',
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
            color: context.artC.ink,
            onPressed: () => Navigator.of(context).pop(),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: context.artC.ink.withValues(alpha: 0.48),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          _StatusChip(label: status),
          IconButton(
            tooltip: '刷新',
            icon: const Icon(Icons.refresh_rounded, size: 20),
            color: context.artC.ink.withValues(alpha: 0.58),
            onPressed: onRefresh,
          ),
        ],
      ),
    );
  }
}

class _ConsultationInsightSection extends StatelessWidget {
  final Map<String, dynamic>? assessment;
  final Map<String, dynamic>? recommendation;

  const _ConsultationInsightSection({
    required this.assessment,
    required this.recommendation,
  });

  @override
  Widget build(BuildContext context) {
    final background = assessment?['background_summary']?.toString();
    final notes = assessment?['notes']?.toString();
    final timeline = recommendation?['timeline']?.toString();
    final portfolio = recommendation?['portfolio_strategy']?.toString();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: context.artC.silver.withValues(alpha: 0.28),
        ),
      ),
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
                child: const Icon(
                  Icons.psychology_alt_outlined,
                  color: kCobalt,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '顾问诊断',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
              ),
            ],
          ),
          if (assessment != null) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 7,
              runSpacing: 7,
              children: [
                _InsightTag(
                  label:
                      '匹配 ${_matchLevelLabel(assessment?['match_level']?.toString())}',
                ),
                _InsightTag(
                  label:
                      '风险 ${_riskLevelLabel(assessment?['risk_level']?.toString())}',
                ),
              ],
            ),
            if (_notBlank(background)) _InsightText(text: background!),
            if (_notBlank(notes)) _InsightText(text: notes!),
          ],
          if (recommendation != null) ...[
            const SizedBox(height: 14),
            Text(
              '申请方案',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: context.artC.ink,
              ),
            ),
            if (_jsonItemLabels(recommendation?['school_list']).isNotEmpty)
              _InsightList(
                title: '学校组合',
                items: _jsonItemLabels(recommendation?['school_list']),
              ),
            if (_notBlank(timeline))
              _InsightList(title: '时间线', items: [timeline!]),
            if (_notBlank(portfolio))
              _InsightList(title: '作品集策略', items: [portfolio!]),
            if (_jsonItemLabels(recommendation?['recommended_services'])
                .isNotEmpty)
              _InsightList(
                title: '推荐服务',
                items: _jsonItemLabels(
                  recommendation?['recommended_services'],
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class _ConsultationConversionCard extends StatelessWidget {
  final Map<String, dynamic> conversion;
  final VoidCallback onViewBooking;
  final VoidCallback onViewOrder;

  const _ConsultationConversionCard({
    required this.conversion,
    required this.onViewBooking,
    required this.onViewOrder,
  });

  @override
  Widget build(BuildContext context) {
    final booking = _asMap(conversion['service_booking']);
    final order = _asMap(conversion['order']);
    final orderAmount = _formatOrderAmount(order);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: kCobalt.withValues(alpha: 0.12),
        ),
      ),
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
                child: const Icon(
                  Icons.route_outlined,
                  color: kCobalt,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '转化进度',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (booking != null)
            _ConversionRow(
              icon: Icons.event_available_outlined,
              title: booking['title']?.toString() ?? '预约服务',
              status: _bookingStatusLabel(booking['status']?.toString()),
              subtitle: _formatConversionTime(booking['scheduled_at']) ??
                  _formatConversionTime(booking['updated_at']),
            ),
          if (booking != null) ...[
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: onViewBooking,
                style: TextButton.styleFrom(
                  foregroundColor: kCobalt,
                  textStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                icon: const Icon(Icons.event_note_outlined, size: 17),
                label: const Text('查看预约'),
              ),
            ),
          ],
          if (order != null) ...[
            if (booking != null) const SizedBox(height: 4),
            _ConversionRow(
              icon: Icons.receipt_long_outlined,
              title: order['subject']?.toString() ?? '申请服务订单',
              status: _orderStatusLabel(order['status']?.toString()),
              subtitle: orderAmount,
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: onViewOrder,
                style: TextButton.styleFrom(
                  foregroundColor: kCobalt,
                  textStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                icon: const Icon(Icons.arrow_forward_rounded, size: 17),
                label: const Text('查看订单'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ConsultationReviewCard extends StatelessWidget {
  final Map<String, dynamic>? review;
  final bool reviewing;
  final VoidCallback onReview;

  const _ConsultationReviewCard({
    required this.review,
    required this.reviewing,
    required this.onReview,
  });

  @override
  Widget build(BuildContext context) {
    final rating = (review?['rating'] as num?)?.toInt() ?? 0;
    final body = review?['body']?.toString().trim() ?? '';
    final reviewed = rating > 0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: context.artC.silver.withValues(alpha: 0.28),
        ),
      ),
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
                child: const Icon(
                  Icons.star_rate_outlined,
                  color: kCobalt,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  reviewed ? '已评价机构' : '评价这次咨询',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
              ),
              if (reviewed) _StatusChip(label: '$rating 星'),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            reviewed
                ? (body.isNotEmpty ? body : '感谢你的反馈，评分会进入机构排序参考。')
                : '咨询结束后的真实评价，会帮助后来的同学判断机构是否合适。',
            style: TextStyle(
              fontSize: 12,
              height: 1.45,
              fontWeight: FontWeight.w700,
              color: context.artC.ink.withValues(alpha: 0.56),
            ),
          ),
          if (!reviewed) ...[
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton.icon(
                onPressed: reviewing ? null : onReview,
                style: FilledButton.styleFrom(backgroundColor: kCobalt),
                icon: reviewing
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Icon(Icons.rate_review_outlined, size: 17),
                label: Text(reviewing ? '提交中' : '提交评价'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ReviewDraft {
  final int rating;
  final String body;

  const _ReviewDraft({required this.rating, required this.body});
}

class _ConsultationReviewSheet extends StatefulWidget {
  const _ConsultationReviewSheet();

  @override
  State<_ConsultationReviewSheet> createState() =>
      _ConsultationReviewSheetState();
}

class _ConsultationReviewSheetState extends State<_ConsultationReviewSheet> {
  final _body = TextEditingController();
  int _rating = 5;

  @override
  void dispose() {
    _body.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: Container(
        padding: const EdgeInsets.fromLTRB(18, 14, 18, 18),
        decoration: BoxDecoration(
          color: context.artC.porcelain,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '评价这次机构咨询',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: '关闭',
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (var value = 1; value <= 5; value++)
                    IconButton(
                      tooltip: '$value 星',
                      onPressed: () => setState(() => _rating = value),
                      icon: Icon(
                        value <= _rating
                            ? Icons.star_rounded
                            : Icons.star_border_rounded,
                        color: kCobalt,
                        size: 32,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _body,
                minLines: 3,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: '评价内容（可选）',
                  prefixIcon: Icon(Icons.notes_outlined),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton(
                style: FilledButton.styleFrom(backgroundColor: kCobalt),
                onPressed: () {
                  Navigator.of(context).pop(
                    _ReviewDraft(
                      rating: _rating,
                      body: _body.text.trim(),
                    ),
                  );
                },
                child: const Text('提交评价'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ConversionRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String status;
  final String? subtitle;

  const _ConversionRow({
    required this.icon,
    required this.title,
    required this.status,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: context.artC.porcelain,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon,
              size: 16, color: context.artC.ink.withValues(alpha: 0.5)),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: context.artC.ink,
                ),
              ),
              if (_notBlank(subtitle)) ...[
                const SizedBox(height: 3),
                Text(
                  subtitle!,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: context.artC.ink.withValues(alpha: 0.46),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(width: 8),
        _StatusChip(label: status),
      ],
    );
  }
}

class _InsightTag extends StatelessWidget {
  final String label;

  const _InsightTag({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: kCobalt,
        ),
      ),
    );
  }
}

class _InsightText extends StatelessWidget {
  final String text;

  const _InsightText({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 9),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12.5,
          height: 1.45,
          fontWeight: FontWeight.w700,
          color: context.artC.ink.withValues(alpha: 0.62),
        ),
      ),
    );
  }
}

class _InsightList extends StatelessWidget {
  final String title;
  final List<String> items;

  const _InsightList({
    required this.title,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 9),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 5),
          ...items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 3),
              child: Text(
                item,
                style: TextStyle(
                  fontSize: 12.5,
                  height: 1.38,
                  fontWeight: FontWeight.w700,
                  color: context.artC.ink.withValues(alpha: 0.58),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ConsultationBubble extends StatelessWidget {
  final String role;
  final String? senderName;
  final String body;
  final String? time;

  const _ConsultationBubble({
    required this.role,
    this.senderName,
    required this.body,
    this.time,
  });

  bool get _isStudent => role == 'student';
  bool get _isSystem => role == 'system';

  @override
  Widget build(BuildContext context) {
    if (_isSystem) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Center(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.sizeOf(context).width * 0.78,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: context.artC.silver.withValues(alpha: 0.24),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              body,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                height: 1.35,
                fontWeight: FontWeight.w800,
                color: context.artC.ink.withValues(alpha: 0.52),
              ),
            ),
          ),
        ),
      );
    }

    final bubble = Container(
      constraints: BoxConstraints(
        maxWidth: MediaQuery.sizeOf(context).width * 0.72,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
      decoration: BoxDecoration(
        color: _isStudent ? context.artC.deepPanel : context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(17).copyWith(
          bottomRight: _isStudent ? const Radius.circular(4) : null,
          bottomLeft: !_isStudent ? const Radius.circular(4) : null,
        ),
        border: _isStudent
            ? null
            : Border.all(color: context.artC.silver.withValues(alpha: 0.42)),
      ),
      child: Column(
        crossAxisAlignment:
            _isStudent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          if (!_isStudent && _notBlank(senderName)) ...[
            Text(
              senderName!,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                color: context.artC.ink.withValues(alpha: 0.48),
              ),
            ),
            const SizedBox(height: 5),
          ],
          Text(
            body,
            style: TextStyle(
              fontSize: 13.5,
              height: 1.48,
              fontWeight: FontWeight.w700,
              color: _isStudent
                  ? Colors.white
                  : context.artC.ink.withValues(alpha: 0.86),
            ),
          ),
          if (time != null) ...[
            const SizedBox(height: 5),
            Text(
              time!,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: _isStudent
                    ? Colors.white.withValues(alpha: 0.62)
                    : context.artC.ink.withValues(alpha: 0.36),
              ),
            ),
          ],
        ],
      ),
    );

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            _isStudent ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [bubble],
      ),
    );
  }
}

class _ConsultationInputBar extends StatelessWidget {
  final TextEditingController controller;
  final bool sending;
  final bool enabled;
  final VoidCallback onSend;

  const _ConsultationInputBar({
    required this.controller,
    required this.sending,
    required this.enabled,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        border: Border(
          top: BorderSide(color: context.artC.silver.withValues(alpha: 0.36)),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  enabled: enabled && !sending,
                  minLines: 1,
                  maxLines: 4,
                  textInputAction: TextInputAction.newline,
                  decoration: InputDecoration(
                    hintText: enabled ? '继续补充你的申请情况...' : '咨询已结束',
                    filled: true,
                    fillColor: context.artC.porcelain,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 11,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 44,
                height: 44,
                child: IconButton.filled(
                  tooltip: '发送',
                  style: IconButton.styleFrom(backgroundColor: kCobalt),
                  onPressed: enabled && !sending ? onSend : null,
                  icon: sending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.arrow_upward_rounded),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ConsultationErrorState extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const _ConsultationErrorState({
    required this.error,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline_rounded,
              color: context.artC.ink.withValues(alpha: 0.38),
              size: 34,
            ),
            const SizedBox(height: 10),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                height: 1.45,
                fontWeight: FontWeight.w700,
                color: context.artC.ink.withValues(alpha: 0.58),
              ),
            ),
            const SizedBox(height: 14),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: kCobalt),
              onPressed: onRetry,
              child: const Text('重新加载'),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;

  const _StatusChip({required this.label});

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

String _matchLevelLabel(String? level) {
  switch (level) {
    case 'strong':
      return '强';
    case 'weak':
      return '弱';
    case 'moderate':
      return '中';
    default:
      return '未定';
  }
}

String _riskLevelLabel(String? level) {
  switch (level) {
    case 'low':
      return '低';
    case 'high':
      return '高';
    case 'medium':
      return '中';
    default:
      return '未定';
  }
}

bool _notBlank(String? value) => value != null && value.trim().isNotEmpty;

Map<String, dynamic>? _asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return null;
}

bool _conversionHasData(Map<String, dynamic>? value) {
  if (value == null) return false;
  final booking = _asMap(value['service_booking']);
  final order = _asMap(value['order']);
  return (booking != null && booking.isNotEmpty) ||
      (order != null && order.isNotEmpty);
}

bool _canReviewOrganizationConsultation(Map<String, dynamic> consultation) {
  final status = consultation['status']?.toString() ?? '';
  if (status != 'closed' && status != 'converted') return false;
  final assignedOrgId = consultation['assigned_to_org_id']?.toString().trim();
  if (assignedOrgId != null && assignedOrgId.isNotEmpty) return true;
  final metadata = _asMap(consultation['metadata']);
  final metadataOrgId = metadata?['organization_id']?.toString().trim();
  return metadataOrgId != null && metadataOrgId.isNotEmpty;
}

String _bookingStatusLabel(String? status) {
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

String _orderStatusLabel(String? status) {
  switch (status) {
    case 'paid':
      return '已支付';
    case 'failed':
      return '支付失败';
    case 'canceled':
      return '已取消';
    case 'expired':
      return '已过期';
    case 'refunded':
      return '已退款';
    case 'pending':
    default:
      return '待支付';
  }
}

String? _formatOrderAmount(Map<String, dynamic>? order) {
  if (order == null) return null;
  final amountTotal = order['amount_total'];
  if (amountTotal is! num) return null;
  final currency = order['currency']?.toString().toUpperCase() ?? 'CNY';
  final amount = amountTotal / 100;
  if (currency == 'CNY') return '¥${amount.toStringAsFixed(2)}';
  return '$currency ${amount.toStringAsFixed(2)}';
}

String? _formatConversionTime(dynamic raw) {
  final value = raw?.toString();
  if (value == null || value.isEmpty) return null;
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final local = parsed.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${local.year}-${two(local.month)}-${two(local.day)} '
      '${two(local.hour)}:${two(local.minute)}';
}

List<String> _jsonItemLabels(dynamic value) {
  if (value is! List) return const [];
  return value
      .map((item) {
        if (item is Map) {
          return (item['name'] ?? item['title'] ?? item['label'])?.toString();
        }
        return item?.toString();
      })
      .whereType<String>()
      .map((item) => item.trim())
      .where((item) => item.isNotEmpty)
      .toList();
}

String? _formatConsultationTime(dynamic raw) {
  final value = raw?.toString();
  if (value == null || value.isEmpty) return null;
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final local = parsed.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(local.month)}-${two(local.day)} '
      '${two(local.hour)}:${two(local.minute)}';
}

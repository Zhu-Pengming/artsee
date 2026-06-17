import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../theme/artsee_ui_colors.dart';
import '../../utils/auth_gate.dart';
import '../../widgets/common.dart';
import 'mentor_application_screen.dart';

class MentorListScreen extends StatefulWidget {
  const MentorListScreen({super.key});

  @override
  State<MentorListScreen> createState() => _MentorListScreenState();
}

class _MentorListScreenState extends State<MentorListScreen> {
  final _keyword = TextEditingController();
  List<Map<String, dynamic>> _mentors = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _keyword.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.fetchMentors(
        keyword: _keyword.text.trim().isEmpty ? null : _keyword.text.trim(),
      );
      if (!mounted) return;
      setState(() {
        _mentors = result.data;
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

  Future<void> _openApplication() async {
    await Navigator.of(context).push<void>(
      MaterialPageRoute(builder: (_) => const MentorApplicationScreen()),
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
          '认证导师',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            tooltip: '申请成为导师',
            onPressed: _openApplication,
            icon: const Icon(Icons.verified_user_outlined),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: kCobalt,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
          children: [
            TextField(
              controller: _keyword,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => _load(),
              decoration: InputDecoration(
                hintText: '搜索导师、院校或专业',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: IconButton(
                  tooltip: '搜索',
                  onPressed: _load,
                  icon: const Icon(Icons.arrow_forward_rounded),
                ),
                filled: true,
                fillColor: context.artC.cardIconBg,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 14),
            if (_loading)
              const Padding(
                padding: EdgeInsets.only(top: 80),
                child: Center(
                  child: CircularProgressIndicator(color: kCobalt),
                ),
              )
            else if (_error != null)
              _InlineState(
                icon: Icons.error_outline_rounded,
                title: '导师列表加载失败',
                body: _error!,
                actionLabel: '重试',
                onAction: _load,
              )
            else if (_mentors.isEmpty)
              _InlineState(
                icon: Icons.school_outlined,
                title: '暂无可预约导师',
                body: '认证通过的导师会显示在这里。',
                actionLabel: '申请成为导师',
                onAction: _openApplication,
              )
            else
              ..._mentors.map(
                (mentor) => _MentorCard(
                  mentor: mentor,
                  onTap: () => Navigator.of(context).push<void>(
                    MaterialPageRoute(
                      builder: (_) => MentorDetailScreen(mentor: mentor),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class MentorDetailScreen extends StatefulWidget {
  final Map<String, dynamic> mentor;

  const MentorDetailScreen({super.key, required this.mentor});

  @override
  State<MentorDetailScreen> createState() => _MentorDetailScreenState();
}

class _MentorDetailScreenState extends State<MentorDetailScreen> {
  late Map<String, dynamic> _mentor;
  List<Map<String, dynamic>> _availability = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _mentor = widget.mentor;
    _load();
  }

  Future<void> _load() async {
    final id = _mentor['id']?.toString();
    if (id == null || id.isEmpty) return;
    setState(() => _loading = true);
    try {
      final data = await BackendApiService.fetchMentor(id);
      final slots = await BackendApiService.fetchMentorAvailability(
        mentorId: id,
      );
      if (mounted) {
        setState(() {
          _mentor = data;
          _availability = slots.data;
        });
      }
    } catch (_) {
      // Keep the list payload if the detail fetch fails.
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _book(Map<String, dynamic> service) async {
    if (!await ensureLoggedIn(context, message: '请先登录后预约导师')) return;
    if (!mounted) return;
    final mentorId = _mentor['id']?.toString();
    final serviceId = service['id']?.toString();
    if (mentorId == null || serviceId == null) return;
    final draft = await showModalBottomSheet<_BookingDraft>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _BookingNoteSheet(
        service: service,
        availability: _availability,
      ),
    );
    if (draft == null) return;
    try {
      final booking = await BackendApiService.bookMentorService(
        mentorId: mentorId,
        serviceId: serviceId,
        availabilitySlotId: draft.availabilitySlotId,
        studentNote: draft.note,
      );
      if (!mounted) return;
      final hasOrder = booking['order_id']?.toString().isNotEmpty == true;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(hasOrder ? '预约已提交，请在导师预约里支付订单' : '预约已提交，等待导师确认'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('预约失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = _mentorName(_mentor);
    final services = _services(_mentor);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        elevation: 0,
        title: Text(
          name,
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
        children: [
          _MentorHeader(mentor: _mentor, loading: _loading),
          const SizedBox(height: 14),
          Text(
            '可预约服务',
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          if (services.isEmpty)
            const _InlineState(
              icon: Icons.event_busy_outlined,
              title: '暂无可预约服务',
              body: '导师服务上架后会显示在这里。',
            )
          else
            ...services.map((service) => _ServiceCard(
                  service: service,
                  onBook: () => _book(service),
                )),
        ],
      ),
    );
  }
}

class _MentorCard extends StatelessWidget {
  final Map<String, dynamic> mentor;
  final VoidCallback onTap;

  const _MentorCard({required this.mentor, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final services = _services(mentor);
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: context.artC.cardIconBg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              _MentorAvatar(name: _mentorName(mentor)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            _mentorName(mentor),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: context.artC.ink,
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        const Icon(Icons.verified, size: 16, color: kCobalt),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      _mentorSubtitle(mentor),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: context.artC.ink.withValues(alpha: 0.52),
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _MiniTag(text: '${services.length} 项服务'),
                        _MiniTag(text: _ratingText(mentor)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.chevron_right_rounded,
                color: context.artC.ink.withValues(alpha: 0.24),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MentorHeader extends StatelessWidget {
  final Map<String, dynamic> mentor;
  final bool loading;

  const _MentorHeader({required this.mentor, required this.loading});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _MentorAvatar(name: _mentorName(mentor), large: true),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        _mentorName(mentor),
                        style: TextStyle(
                          color: context.artC.ink,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    if (loading)
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: kCobalt,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  _mentorSubtitle(mentor),
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.56),
                    fontSize: 13,
                    height: 1.42,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (_text(mentor['bio']).isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Text(
                    _text(mentor['bio']),
                    style: TextStyle(
                      color: context.artC.ink.withValues(alpha: 0.72),
                      fontSize: 13,
                      height: 1.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  final Map<String, dynamic> service;
  final VoidCallback onBook;

  const _ServiceCard({required this.service, required this.onBook});

  @override
  Widget build(BuildContext context) {
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
            Text(
              _text(service['title'], fallback: '导师服务'),
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 15,
                fontWeight: FontWeight.w900,
              ),
            ),
            if (_text(service['description']).isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                _text(service['description']),
                style: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.58),
                  fontSize: 12,
                  height: 1.45,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
            const SizedBox(height: 10),
            Row(
              children: [
                _MiniTag(text: '${_int(service['duration_minutes'])} 分钟'),
                const SizedBox(width: 6),
                _MiniTag(text: _priceText(service)),
                const Spacer(),
                FilledButton.icon(
                  style: FilledButton.styleFrom(backgroundColor: kCobalt),
                  onPressed: onBook,
                  icon: const Icon(Icons.event_available_outlined, size: 16),
                  label: const Text('预约'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _BookingDraft {
  final String note;
  final String? availabilitySlotId;

  const _BookingDraft({required this.note, this.availabilitySlotId});
}

class _BookingNoteSheet extends StatefulWidget {
  final Map<String, dynamic> service;
  final List<Map<String, dynamic>> availability;

  const _BookingNoteSheet({
    required this.service,
    required this.availability,
  });

  @override
  State<_BookingNoteSheet> createState() => _BookingNoteSheetState();
}

class _BookingNoteSheetState extends State<_BookingNoteSheet> {
  final _note = TextEditingController();
  String? _slotId;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '预约 ${_text(widget.service['title'], fallback: '导师服务')}',
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              if (widget.availability.isNotEmpty) ...[
                Text(
                  '选择预约时间',
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.72),
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: widget.availability.take(8).map((slot) {
                    final id = slot['id']?.toString();
                    final selected = id != null && id == _slotId;
                    return ChoiceChip(
                      label: Text(_slotLabel(slot)),
                      selected: selected,
                      onSelected: id == null
                          ? null
                          : (_) =>
                              setState(() => _slotId = selected ? null : id),
                      selectedColor: kCobalt.withValues(alpha: 0.14),
                      labelStyle: TextStyle(
                        color: selected ? kCobalt : context.artC.ink,
                        fontWeight: FontWeight.w800,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),
              ],
              TextField(
                controller: _note,
                minLines: 3,
                maxLines: 5,
                decoration: InputDecoration(
                  hintText: '简单说明你的背景、目标院校或希望导师重点看的问题',
                  filled: true,
                  fillColor: context.artC.porcelain,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: kCobalt),
                  onPressed: () => Navigator.of(context).pop(
                    _BookingDraft(
                      note: _note.text.trim(),
                      availabilitySlotId: _slotId,
                    ),
                  ),
                  child: const Text('提交预约'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MentorAvatar extends StatelessWidget {
  final String name;
  final bool large;

  const _MentorAvatar({required this.name, this.large = false});

  @override
  Widget build(BuildContext context) {
    final size = large ? 58.0 : 46.0;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(large ? 20 : 16),
      ),
      child: Center(
        child: Text(
          name.isEmpty ? '导' : name.substring(0, 1),
          style: TextStyle(
            color: kCobalt,
            fontSize: large ? 22 : 17,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _MiniTag extends StatelessWidget {
  final String text;

  const _MiniTag({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: context.artC.silver.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: context.artC.ink.withValues(alpha: 0.54),
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _InlineState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;
  final String? actionLabel;
  final VoidCallback? onAction;

  const _InlineState({
    required this.icon,
    required this.title,
    required this.body,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 72),
      child: Column(
        children: [
          Icon(icon, size: 36, color: context.artC.ink.withValues(alpha: 0.34)),
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
              color: context.artC.ink.withValues(alpha: 0.5),
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

String _mentorName(Map<String, dynamic> mentor) =>
    _text(mentor['display_name'], fallback: '认证导师');

String _mentorSubtitle(Map<String, dynamic> mentor) {
  final parts = [
    _text(mentor['university']),
    _text(mentor['major']),
    _text(mentor['degree']),
  ].where((item) => item.isNotEmpty).toList();
  return parts.isEmpty ? '作品集与申请咨询' : parts.join(' · ');
}

List<Map<String, dynamic>> _services(Map<String, dynamic> mentor) {
  final raw = mentor['services'];
  if (raw is! List) return const [];
  return raw
      .whereType<Map>()
      .map((item) => Map<String, dynamic>.from(item))
      .toList();
}

String _ratingText(Map<String, dynamic> mentor) {
  final rating = num.tryParse('${mentor['rating'] ?? 0}') ?? 0;
  final count = _int(mentor['review_count']);
  return count > 0 ? '${rating.toStringAsFixed(1)} 分 · $count 评' : '新导师';
}

String _priceText(Map<String, dynamic> service) {
  final amount = _int(service['price_amount']);
  if (amount <= 0) return '免费';
  return '¥${(amount / 100).toStringAsFixed(amount % 100 == 0 ? 0 : 2)}';
}

String _text(dynamic value, {String fallback = ''}) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

int _int(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.round();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

String _slotLabel(Map<String, dynamic> slot) {
  final start = DateTime.tryParse(slot['starts_at']?.toString() ?? '');
  final end = DateTime.tryParse(slot['ends_at']?.toString() ?? '');
  if (start == null) return '可预约时间';
  final localStart = start.toLocal();
  final localEnd = end?.toLocal();
  final date =
      '${localStart.month.toString().padLeft(2, '0')}/${localStart.day.toString().padLeft(2, '0')}';
  final startText =
      '${localStart.hour.toString().padLeft(2, '0')}:${localStart.minute.toString().padLeft(2, '0')}';
  final endText = localEnd == null
      ? ''
      : '-${localEnd.hour.toString().padLeft(2, '0')}:${localEnd.minute.toString().padLeft(2, '0')}';
  return '$date $startText$endText';
}

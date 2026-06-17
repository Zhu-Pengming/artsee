import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/api_config.dart';
import '../../services/backend_api_service.dart';
import '../../services/supabase_service.dart';
import '../../theme/artsee_ui_colors.dart';
import '../../utils/auth_gate.dart';
import '../../widgets/artsee_ui.dart';
import '../../widgets/common.dart';
import '../profile/consultation_detail_screen.dart';
import '../profile/contract_archive_screen.dart';

class OrganizationListScreen extends StatefulWidget {
  final String? schoolId;
  final String? schoolName;

  const OrganizationListScreen({
    super.key,
    this.schoolId,
    this.schoolName,
  });

  @override
  State<OrganizationListScreen> createState() => _OrganizationListScreenState();
}

class _OrganizationListScreenState extends State<OrganizationListScreen> {
  final List<Map<String, dynamic>> _items = [];
  String? _city;
  String _focusArea = 'all';
  String _serviceMode = 'all';
  String _sort = 'comprehensive';
  Map<String, dynamic>? _membership;
  bool _loading = true;
  bool _membershipLoading = false;
  String? _error;

  bool get _isMember => _membership?['is_member'] == true;
  bool get _hasSchoolContext =>
      widget.schoolId != null || (widget.schoolName?.isNotEmpty ?? false);

  @override
  void initState() {
    super.initState();
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    await _loadProfileCity();
    await Future.wait([
      _loadMembership(),
      _loadOrganizations(),
    ]);
  }

  Future<void> _loadProfileCity() async {
    if (!SupabaseService.isLoggedIn) return;
    try {
      final profile = await SupabaseService.fetchProfile();
      final city = _extractCity(
        profile?['city'] ?? profile?['location'] ?? profile?['province'],
      );
      if (!mounted || city == null || city.isEmpty) return;
      setState(() => _city = city);
    } catch (_) {}
  }

  Future<void> _loadMembership() async {
    if (!SupabaseService.isLoggedIn) {
      if (mounted) setState(() => _membership = null);
      return;
    }
    if (mounted) setState(() => _membershipLoading = true);
    try {
      final membership = await BackendApiService.fetchMembership();
      if (!mounted) return;
      setState(() {
        _membership = membership;
        _membershipLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _membership = {'is_member': false, 'status': 'free'};
        _membershipLoading = false;
      });
    }
  }

  Future<void> _loadOrganizations() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await BackendApiService.fetchNearbyOrganizations(
        limit: 50,
        city: _city,
        focusArea: _focusArea == 'all' ? null : _focusArea,
        serviceMode: _serviceMode == 'all' ? null : _serviceMode,
        schoolId: widget.schoolId,
        schoolName: widget.schoolName,
        sort: _sort,
      );
      if (!mounted) return;
      setState(() {
        _items
          ..clear()
          ..addAll(result.data);
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

  Future<void> _setCity(String? city) async {
    setState(() => _city = city);
    await _loadOrganizations();
  }

  Future<void> _editCity() async {
    final controller = TextEditingController(text: _city ?? '');
    final city = await showDialog<String?>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => AlertDialog(
        title: const Text('切换城市'),
        content: TextField(
          controller: controller,
          autofocus: true,
          textInputAction: TextInputAction.done,
          decoration: const InputDecoration(
            labelText: '城市',
            hintText: '例如：成都',
          ),
          onSubmitted: (_) {
            Navigator.of(dialogContext).pop(controller.text.trim());
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(null),
            child: const Text('全部城市'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(_city),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(dialogContext).pop(controller.text.trim());
            },
            child: const Text('应用'),
          ),
        ],
      ),
    );
    controller.dispose();
    if (!mounted || city == _city) return;
    await _setCity(city == null || city.isEmpty ? null : city);
  }

  Future<void> _setFocus(String value) async {
    setState(() => _focusArea = value);
    await _loadOrganizations();
  }

  Future<void> _setServiceMode(String value) async {
    setState(() => _serviceMode = value);
    await _loadOrganizations();
  }

  Future<void> _setSort(String value) async {
    setState(() => _sort = value);
    await _loadOrganizations();
  }

  Future<bool> _ensureMember() async {
    if (!await ensureLoggedIn(context, message: '请先登录后联系机构')) {
      return false;
    }
    if (_membership == null) await _loadMembership();
    if (_isMember) return true;
    if (!mounted) return false;
    await _showUpgradeSheet();
    return false;
  }

  Future<void> _startOnlineConsultation(Map<String, dynamic> org) async {
    if (!await _ensureMember()) return;
    final orgId = org['id']?.toString();
    if (orgId == null || orgId.isEmpty) return;
    final orgName = org['name']?.toString() ?? '机构';
    final targetName = widget.schoolName?.trim().isNotEmpty == true
        ? widget.schoolName!.trim()
        : '留学申请咨询';
    try {
      final consultation = await BackendApiService.createConsultation(
        targetType: _hasSchoolContext ? 'school' : 'organization',
        targetId: widget.schoolId,
        targetName: targetName,
        source: _hasSchoolContext
            ? 'school_detail_organization'
            : 'organization_list',
        organizationId: orgId,
        channel: 'online',
        message: '我想咨询 $targetName，请 $orgName 的老师帮我看一下适合的申请路径。',
        metadata: {
          'entry': _hasSchoolContext ? 'school_detail' : 'organization_list',
          'organization_name': orgName,
          if (widget.schoolName != null) 'school_name': widget.schoolName,
        },
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('已向 $orgName 发起线上咨询')),
      );
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => ConsultationDetailScreen(consultation: consultation),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      if (e is ApiException && e.code == 402) {
        await _showUpgradeSheet();
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('发起咨询失败：$e')),
      );
    }
  }

  Future<void> _showOfflineContact(Map<String, dynamic> org) async {
    if (!await _ensureMember()) return;
    if (!mounted) return;
    final orgId = org['id']?.toString();
    var detail = org;
    if (orgId != null && orgId.isNotEmpty) {
      try {
        detail = await BackendApiService.fetchOrganization(orgId);
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('联系方式加载失败：$e')),
        );
        return;
      }
    }
    if (!mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _OfflineContactSheet(org: detail),
    );
  }

  void _openDetail(Map<String, dynamic> org) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => OrganizationDetailScreen(
          initialOrg: org,
          schoolId: widget.schoolId,
          schoolName: widget.schoolName,
        ),
      ),
    );
  }

  Future<void> _showUpgradeSheet() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MembershipUpgradeSheet(
        loading: _membershipLoading,
        onUpgrade: _openMembershipCheckout,
      ),
    );
  }

  Future<void> _openMembershipCheckout(String plan) async {
    try {
      final checkout = await BackendApiService.createMembershipUpgrade(
        plan: plan,
      );
      final rawUrl = checkout['checkoutUrl']?.toString();
      if (rawUrl == null || rawUrl.isEmpty) return;
      final orderId = _checkoutOrderId(checkout);
      if (_isInternalCheckoutUrl(rawUrl) && orderId.isNotEmpty) {
        await BackendApiService.confirmExistingOrder(orderId);
        await _loadMembership();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('会员已开通')),
        );
        return;
      }
      final url = rawUrl.startsWith('http')
          ? rawUrl
          : '${ApiConfig.baseUrl.replaceAll(RegExp(r'/$'), '')}$rawUrl';
      final opened = await launchUrl(
        Uri.parse(url),
        mode: LaunchMode.externalApplication,
      );
      if (!mounted) return;
      if (!opened) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('请在浏览器打开：$url')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('创建会员订单失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        child: RefreshIndicator(
          color: kCobalt,
          onRefresh: () async {
            await Future.wait([
              _loadMembership(),
              _loadOrganizations(),
            ]);
          },
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 32),
            children: [
              _Header(
                schoolName: widget.schoolName,
                onBack: () => Navigator.of(context).pop(),
              ),
              const SizedBox(height: 16),
              _MembershipBanner(
                isMember: _isMember,
                loading: _membershipLoading,
                expiresAt: _membership?['expires_at']?.toString(),
                onTap: _isMember ? null : _showUpgradeSheet,
              ),
              const SizedBox(height: 14),
              _FilterSection(
                city: _city,
                focusArea: _focusArea,
                serviceMode: _serviceMode,
                sort: _sort,
                onCityChanged: _setCity,
                onCityEdit: _editCity,
                onFocusChanged: _setFocus,
                onServiceChanged: _setServiceMode,
                onSortChanged: _setSort,
              ),
              const SizedBox(height: 18),
              if (_loading)
                const Padding(
                  padding: EdgeInsets.only(top: 96),
                  child: Center(
                    child: CircularProgressIndicator(
                      color: kCobalt,
                      strokeWidth: 2.5,
                    ),
                  ),
                )
              else if (_error != null)
                _StatePanel(
                  icon: Icons.cloud_off_outlined,
                  title: '机构加载失败',
                  subtitle: _error!,
                  action: '重试',
                  onTap: _loadOrganizations,
                )
              else if (_items.isEmpty)
                _StatePanel(
                  icon: Icons.domain_disabled_outlined,
                  title: '暂无匹配机构',
                  subtitle: '换一个城市、领域或服务方式再试试。',
                  action: '清空筛选',
                  onTap: () async {
                    setState(() {
                      _city = null;
                      _focusArea = 'all';
                      _serviceMode = 'all';
                      _sort = 'comprehensive';
                    });
                    await _loadOrganizations();
                  },
                )
              else
                ..._items.map(
                  (org) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _OrganizationCard(
                      org: org,
                      memberLocked: !_isMember,
                      onTap: () => _openDetail(org),
                      onOnline: () => _startOnlineConsultation(org),
                      onOffline: () => _showOfflineContact(org),
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

class _Header extends StatelessWidget {
  final String? schoolName;
  final VoidCallback onBack;

  const _Header({
    required this.schoolName,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final hasSchool = schoolName?.trim().isNotEmpty == true;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        IconButton.filledTonal(
          onPressed: onBack,
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          style: IconButton.styleFrom(
            backgroundColor: context.artC.silver.withValues(alpha: 0.42),
            foregroundColor: context.artC.ink,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '开始咨询',
                  style: TextStyle(
                    fontFamily: 'Noto Serif SC',
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                    letterSpacing: 0,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  hasSchool ? '优先匹配擅长 $schoolName 的入驻机构' : '按城市、评分和专注领域找到合适机构',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.42),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _MembershipBanner extends StatelessWidget {
  final bool isMember;
  final bool loading;
  final String? expiresAt;
  final VoidCallback? onTap;

  const _MembershipBanner({
    required this.isMember,
    required this.loading,
    required this.expiresAt,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final title = loading
        ? '正在确认会员状态'
        : isMember
            ? '会员权益已开启'
            : '升级会员后可联系机构';
    final subtitle = isMember
        ? '线上会话与线下联系方式均已解锁${expiresAt == null ? '' : ' · 到期 $expiresAt'}'
        : '非会员可浏览机构信息，发起会话和查看联系方式需开通会员。';
    return ArtseeSurface(
      onTap: onTap,
      elevated: true,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      radius: 20,
      color:
          isMember ? kCobalt.withValues(alpha: 0.08) : context.artC.cardIconBg,
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isMember
                  ? kCobalt
                  : context.artC.silver.withValues(alpha: 0.45),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              isMember ? Icons.verified_rounded : Icons.lock_outline_rounded,
              color: isMember
                  ? Colors.white
                  : context.artC.ink.withValues(alpha: 0.45),
              size: 20,
            ),
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
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.46),
                    fontSize: 11,
                    height: 1.35,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          if (!isMember && !loading)
            Icon(
              Icons.chevron_right_rounded,
              color: context.artC.ink.withValues(alpha: 0.32),
            ),
        ],
      ),
    );
  }
}

class _FilterSection extends StatelessWidget {
  final String? city;
  final String focusArea;
  final String serviceMode;
  final String sort;
  final ValueChanged<String?> onCityChanged;
  final VoidCallback onCityEdit;
  final ValueChanged<String> onFocusChanged;
  final ValueChanged<String> onServiceChanged;
  final ValueChanged<String> onSortChanged;

  const _FilterSection({
    required this.city,
    required this.focusArea,
    required this.serviceMode,
    required this.sort,
    required this.onCityChanged,
    required this.onCityEdit,
    required this.onFocusChanged,
    required this.onServiceChanged,
    required this.onSortChanged,
  });

  @override
  Widget build(BuildContext context) {
    final cityItems = _cityFilterItems(city);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _ChipRow<String?>(
          label: '城市',
          value: city,
          items: cityItems,
          onChanged: onCityChanged,
        ),
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton.icon(
            onPressed: onCityEdit,
            icon: const Icon(Icons.edit_location_alt_outlined, size: 16),
            label: const Text('输入城市'),
          ),
        ),
        const SizedBox(height: 10),
        _ChipRow<String>(
          label: '领域',
          value: focusArea,
          items: const [
            (value: 'all', label: '全部'),
            (value: 'uk', label: '英国院校'),
            (value: 'us', label: '美国院校'),
            (value: 'portfolio', label: '作品集'),
            (value: 'rca', label: 'RCA'),
          ],
          onChanged: onFocusChanged,
        ),
        const SizedBox(height: 10),
        _ChipRow<String>(
          label: '方式',
          value: serviceMode,
          items: const [
            (value: 'all', label: '全部'),
            (value: 'online', label: '线上咨询'),
            (value: 'offline', label: '线下见面'),
          ],
          onChanged: onServiceChanged,
        ),
        const SizedBox(height: 10),
        _ChipRow<String>(
          label: '排序',
          value: sort,
          items: const [
            (value: 'comprehensive', label: '综合'),
            (value: 'distance', label: '最近'),
            (value: 'rating', label: '评分'),
            (value: 'match', label: '匹配'),
          ],
          onChanged: onSortChanged,
        ),
      ],
    );
  }
}

class _ChipRow<T> extends StatelessWidget {
  final String label;
  final T value;
  final List<({T value, String label})> items;
  final ValueChanged<T> onChanged;

  const _ChipRow({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: context.artC.ink.withValues(alpha: 0.38),
            fontSize: 10,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 7),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: items.map((item) {
              final selected = item.value == value;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(item.label),
                  selected: selected,
                  onSelected: (_) => onChanged(item.value),
                  labelStyle: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: selected
                        ? kCobalt
                        : context.artC.ink.withValues(alpha: 0.56),
                  ),
                  selectedColor: kCobalt.withValues(alpha: 0.1),
                  backgroundColor: context.artC.silver.withValues(alpha: 0.22),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: selected
                          ? kCobalt.withValues(alpha: 0.28)
                          : context.artC.silver.withValues(alpha: 0.2),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _OrganizationCard extends StatelessWidget {
  final Map<String, dynamic> org;
  final bool memberLocked;
  final VoidCallback onTap;
  final VoidCallback onOnline;
  final VoidCallback onOffline;

  const _OrganizationCard({
    required this.org,
    required this.memberLocked,
    required this.onTap,
    required this.onOnline,
    required this.onOffline,
  });

  @override
  Widget build(BuildContext context) {
    final name = org['name']?.toString() ?? '未命名机构';
    final city = org['city']?.toString();
    final province = org['province']?.toString();
    final distance = org['distance_km'];
    final rating = (org['rating'] as num?)?.toDouble() ?? 0;
    final reviewCount = (org['review_count'] as num?)?.toInt() ?? 0;
    final contractCount = (org['contract_count'] as num?)?.toInt() ?? 0;
    final focusAreas = _stringList(org['focus_areas']).take(4).toList();
    final supportsOnline = org['supports_online'] != false;
    final supportsOffline = org['supports_offline'] == true;
    final avatarUrl = org['avatar_url']?.toString();
    final location = [
      if (city != null && city.isNotEmpty) city,
      if (province != null && province.isNotEmpty && province != city) province,
      if (distance is num) '${distance.toStringAsFixed(1)} km',
    ].join(' · ');

    return ArtseeSurface(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      radius: 22,
      elevated: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _OrgAvatar(name: name, avatarUrl: avatarUrl),
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
                        color: context.artC.ink,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 13,
                          color: context.artC.ink.withValues(alpha: 0.3),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            location.isEmpty ? '位置待完善' : location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: context.artC.ink.withValues(alpha: 0.4),
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              _RatingPill(rating: rating, reviewCount: reviewCount),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              ...focusAreas.map(
                (tag) => _MiniTag(label: _focusLabel(tag), color: kCobalt),
              ),
              if (contractCount > 0)
                _MiniTag(
                    label: '$contractCount 份合同存档',
                    color: const Color(0xFF047857)),
            ],
          ),
          const SizedBox(height: 13),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (supportsOnline)
                const _ServiceTag(
                    icon: Icons.chat_bubble_outline_rounded, label: '线上咨询'),
              if (supportsOffline)
                const _ServiceTag(
                    icon: Icons.storefront_outlined, label: '支持线下见面'),
              if (memberLocked)
                const _ServiceTag(
                    icon: Icons.lock_outline_rounded, label: '会员解锁联系'),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              if (supportsOnline)
                Expanded(
                  child: FilledButton.icon(
                    onPressed: onOnline,
                    icon: Icon(
                      memberLocked
                          ? Icons.lock_open_outlined
                          : Icons.send_rounded,
                      size: 16,
                    ),
                    label: Text(memberLocked ? '解锁线上咨询' : '线上咨询'),
                    style: FilledButton.styleFrom(
                      backgroundColor: kCobalt,
                      foregroundColor: Colors.white,
                      textStyle: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
              if (supportsOnline && supportsOffline) const SizedBox(width: 10),
              if (supportsOffline)
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onOffline,
                    icon: Icon(
                      memberLocked
                          ? Icons.lock_outline_rounded
                          : Icons.place_outlined,
                      size: 16,
                    ),
                    label: Text(memberLocked ? '解锁线下方式' : '线下见面'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: context.artC.ink,
                      textStyle: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                      side: BorderSide(
                        color: context.artC.silver.withValues(alpha: 0.6),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class OrganizationDetailScreen extends StatefulWidget {
  final Map<String, dynamic> initialOrg;
  final String? schoolId;
  final String? schoolName;

  const OrganizationDetailScreen({
    super.key,
    required this.initialOrg,
    this.schoolId,
    this.schoolName,
  });

  @override
  State<OrganizationDetailScreen> createState() =>
      _OrganizationDetailScreenState();
}

class _OrganizationDetailScreenState extends State<OrganizationDetailScreen> {
  late Map<String, dynamic> _org;
  Map<String, dynamic>? _membership;
  bool _loading = true;
  bool _membershipLoading = false;
  String? _error;

  bool get _isMember => _membership?['is_member'] == true;
  bool get _hasSchoolContext =>
      widget.schoolId != null || (widget.schoolName?.isNotEmpty ?? false);

  @override
  void initState() {
    super.initState();
    _org = widget.initialOrg;
    _load();
  }

  Future<void> _load() async {
    await Future.wait([
      _loadDetail(),
      _loadMembership(),
    ]);
  }

  Future<void> _loadDetail() async {
    final id = _org['id']?.toString();
    if (id == null || id.isEmpty) {
      if (mounted) setState(() => _loading = false);
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final detail = await BackendApiService.fetchOrganization(id);
      if (!mounted) return;
      setState(() {
        _org = {..._org, ...detail};
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

  Future<void> _loadMembership() async {
    if (!SupabaseService.isLoggedIn) {
      if (mounted) setState(() => _membership = null);
      return;
    }
    if (mounted) setState(() => _membershipLoading = true);
    try {
      final membership = await BackendApiService.fetchMembership();
      if (!mounted) return;
      setState(() {
        _membership = membership;
        _membershipLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _membership = {'is_member': false, 'status': 'free'};
        _membershipLoading = false;
      });
    }
  }

  Future<bool> _ensureMember() async {
    if (!await ensureLoggedIn(context, message: '请先登录后联系机构')) {
      return false;
    }
    if (_membership == null) await _loadMembership();
    if (_isMember) return true;
    if (!mounted) return false;
    await _showUpgradeSheet();
    return false;
  }

  Future<void> _showUpgradeSheet() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MembershipUpgradeSheet(
        loading: _membershipLoading,
        onUpgrade: _openMembershipCheckout,
      ),
    );
  }

  Future<void> _openMembershipCheckout(String plan) async {
    try {
      final checkout = await BackendApiService.createMembershipUpgrade(
        plan: plan,
      );
      final rawUrl = checkout['checkoutUrl']?.toString();
      if (rawUrl == null || rawUrl.isEmpty) return;
      final orderId = _checkoutOrderId(checkout);
      if (_isInternalCheckoutUrl(rawUrl) && orderId.isNotEmpty) {
        await BackendApiService.confirmExistingOrder(orderId);
        await _loadMembership();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('会员已开通')),
        );
        return;
      }
      final url = rawUrl.startsWith('http')
          ? rawUrl
          : '${ApiConfig.baseUrl.replaceAll(RegExp(r'/$'), '')}$rawUrl';
      final opened = await launchUrl(
        Uri.parse(url),
        mode: LaunchMode.externalApplication,
      );
      if (!mounted) return;
      if (!opened) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('请在浏览器打开：$url')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('创建会员订单失败：$e')),
      );
    }
  }

  Future<void> _startOnlineConsultation() async {
    if (!await _ensureMember()) return;
    final orgId = _org['id']?.toString();
    if (orgId == null || orgId.isEmpty) return;
    final orgName = _org['name']?.toString() ?? '机构';
    final targetName = widget.schoolName?.trim().isNotEmpty == true
        ? widget.schoolName!.trim()
        : '留学申请咨询';
    try {
      final consultation = await BackendApiService.createConsultation(
        targetType: _hasSchoolContext ? 'school' : 'organization',
        targetId: widget.schoolId,
        targetName: targetName,
        source: _hasSchoolContext
            ? 'school_detail_organization'
            : 'organization_detail',
        organizationId: orgId,
        channel: 'online',
        message: '我想咨询 $targetName，请 $orgName 的老师帮我看一下适合的申请路径。',
        metadata: {
          'entry': _hasSchoolContext ? 'school_detail' : 'organization_detail',
          'organization_name': orgName,
          if (widget.schoolName != null) 'school_name': widget.schoolName,
        },
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('已向 $orgName 发起线上咨询')),
      );
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => ConsultationDetailScreen(consultation: consultation),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      if (e is ApiException && e.code == 402) {
        await _showUpgradeSheet();
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('发起咨询失败：$e')),
      );
    }
  }

  Future<void> _showOfflineContact() async {
    if (!await _ensureMember()) return;
    await _loadDetail();
    if (!mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _OfflineContactSheet(org: _org),
    );
  }

  @override
  Widget build(BuildContext context) {
    final name = _org['name']?.toString() ?? '未命名机构';
    final city = _org['city']?.toString();
    final province = _org['province']?.toString();
    final summary = _org['summary']?.toString();
    final focusAreas = _stringList(_org['focus_areas']).take(8).toList();
    final rating = (_org['rating'] as num?)?.toDouble() ?? 0;
    final reviewCount = (_org['review_count'] as num?)?.toInt() ?? 0;
    final contractCount = (_org['contract_count'] as num?)?.toInt() ?? 0;
    final reviews = _mapList(_org['reviews']).take(5).toList();
    final supportsOnline = _org['supports_online'] != false;
    final supportsOffline = _org['supports_offline'] == true;
    final contactLocked = _org['contact_locked'] != false;
    final location = [
      if (city != null && city.isNotEmpty) city,
      if (province != null && province.isNotEmpty && province != city) province,
    ].join(' · ');

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        child: RefreshIndicator(
          color: kCobalt,
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 32),
            children: [
              Row(
                children: [
                  IconButton.filledTonal(
                    onPressed: () => Navigator.of(context).pop(),
                    icon:
                        const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                    style: IconButton.styleFrom(
                      backgroundColor:
                          context.artC.silver.withValues(alpha: 0.42),
                      foregroundColor: context.artC.ink,
                    ),
                  ),
                  const Spacer(),
                  if (_loading)
                    const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        color: kCobalt,
                        strokeWidth: 2,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 14),
              ArtseeSurface(
                elevated: true,
                radius: 24,
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        _OrgAvatar(
                          name: name,
                          avatarUrl: _org['avatar_url']?.toString(),
                        ),
                        const SizedBox(width: 13),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: context.artC.ink,
                                  fontSize: 21,
                                  fontFamily: 'Noto Serif SC',
                                  fontWeight: FontWeight.w900,
                                  height: 1.15,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                location.isEmpty ? '位置待完善' : location,
                                style: TextStyle(
                                  color:
                                      context.artC.ink.withValues(alpha: 0.42),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (summary != null && summary.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Text(
                        summary,
                        style: TextStyle(
                          color: context.artC.ink.withValues(alpha: 0.62),
                          fontSize: 13,
                          height: 1.55,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _RatingPill(rating: rating, reviewCount: reviewCount),
                        if (contractCount > 0)
                          _MiniTag(
                            label: '$contractCount 份合同存档',
                            color: const Color(0xFF047857),
                          ),
                      ],
                    ),
                    if (focusAreas.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 7,
                        runSpacing: 7,
                        children: focusAreas
                            .map(
                              (tag) => _MiniTag(
                                label: _focusLabel(tag),
                                color: kCobalt,
                              ),
                            )
                            .toList(),
                      ),
                    ],
                  ],
                ),
              ),
              if (reviews.isNotEmpty) ...[
                const SizedBox(height: 14),
                _OrganizationReviewsPanel(reviews: reviews),
              ],
              const SizedBox(height: 14),
              _MembershipBanner(
                isMember: _isMember,
                loading: _membershipLoading,
                expiresAt: _membership?['expires_at']?.toString(),
                onTap: _isMember ? null : _showUpgradeSheet,
              ),
              const SizedBox(height: 14),
              ArtseeSurface(
                radius: 22,
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '服务方式',
                      style: TextStyle(
                        color: context.artC.ink,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (supportsOnline)
                          const _ServiceTag(
                            icon: Icons.chat_bubble_outline_rounded,
                            label: '线上咨询',
                          ),
                        if (supportsOffline)
                          const _ServiceTag(
                            icon: Icons.storefront_outlined,
                            label: '支持线下见面',
                          ),
                        if (contactLocked && supportsOffline)
                          const _ServiceTag(
                            icon: Icons.lock_outline_rounded,
                            label: '会员解锁联系方式',
                          ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        if (supportsOnline)
                          Expanded(
                            child: FilledButton.icon(
                              onPressed: _startOnlineConsultation,
                              icon: const Icon(Icons.send_rounded, size: 16),
                              label: const Text('线上咨询'),
                              style: FilledButton.styleFrom(
                                backgroundColor: kCobalt,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                            ),
                          ),
                        if (supportsOnline && supportsOffline)
                          const SizedBox(width: 10),
                        if (supportsOffline)
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _showOfflineContact,
                              icon: const Icon(Icons.place_outlined, size: 16),
                              label: Text(contactLocked ? '解锁线下方式' : '线下见面'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: context.artC.ink,
                                side: BorderSide(
                                  color: context.artC.silver
                                      .withValues(alpha: 0.6),
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 14),
                _StatePanel(
                  icon: Icons.cloud_off_outlined,
                  title: '详情加载失败',
                  subtitle: _error!,
                  action: '重试',
                  onTap: _loadDetail,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _OrganizationReviewsPanel extends StatelessWidget {
  final List<Map<String, dynamic>> reviews;

  const _OrganizationReviewsPanel({required this.reviews});

  @override
  Widget build(BuildContext context) {
    return ArtseeSurface(
      radius: 22,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.rate_review_outlined, size: 18, color: kCobalt),
              const SizedBox(width: 8),
              Text(
                '近期评价',
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          for (var i = 0; i < reviews.length; i++) ...[
            _OrganizationReviewTile(review: reviews[i]),
            if (i != reviews.length - 1)
              Divider(
                height: 18,
                color: context.artC.silver.withValues(alpha: 0.32),
              ),
          ],
        ],
      ),
    );
  }
}

class _OrganizationReviewTile extends StatelessWidget {
  final Map<String, dynamic> review;

  const _OrganizationReviewTile({required this.review});

  @override
  Widget build(BuildContext context) {
    final rating = (review['rating'] as num?)?.toInt() ?? 0;
    final body = review['body']?.toString().trim();
    final targetName = review['target_name']?.toString().trim();
    final createdAt = _formatReviewDate(review['created_at']?.toString());
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            ...List.generate(
              5,
              (index) => Icon(
                index < rating ? Icons.star_rounded : Icons.star_border_rounded,
                color: const Color(0xFFF59E0B),
                size: 15,
              ),
            ),
            const Spacer(),
            if (createdAt != null)
              Text(
                createdAt,
                style: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.34),
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
          ],
        ),
        if (body != null && body.isNotEmpty) ...[
          const SizedBox(height: 7),
          Text(
            body,
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.66),
              fontSize: 12,
              height: 1.45,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
        if (targetName != null && targetName.isNotEmpty) ...[
          const SizedBox(height: 6),
          Text(
            targetName,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.36),
              fontSize: 10,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ],
    );
  }
}

class _OrgAvatar extends StatelessWidget {
  final String name;
  final String? avatarUrl;

  const _OrgAvatar({required this.name, required this.avatarUrl});

  @override
  Widget build(BuildContext context) {
    final url = avatarUrl;
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kCobalt.withValues(alpha: 0.08)),
      ),
      clipBehavior: Clip.antiAlias,
      child: url != null && url.isNotEmpty
          ? Image.network(
              url,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _AvatarFallback(name: name),
            )
          : _AvatarFallback(name: name),
    );
  }
}

class _AvatarFallback extends StatelessWidget {
  final String name;

  const _AvatarFallback({required this.name});

  @override
  Widget build(BuildContext context) {
    final initial = name.isEmpty ? '艺' : name.substring(0, 1);
    return Center(
      child: Text(
        initial,
        style: const TextStyle(
          color: kCobalt,
          fontSize: 20,
          fontWeight: FontWeight.w900,
          letterSpacing: 0,
        ),
      ),
    );
  }
}

class _RatingPill extends StatelessWidget {
  final double rating;
  final int reviewCount;

  const _RatingPill({
    required this.rating,
    required this.reviewCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(12),
        border:
            Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.16)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 15),
          const SizedBox(width: 3),
          Text(
            rating > 0 ? rating.toStringAsFixed(1) : '新',
            style: const TextStyle(
              color: Color(0xFF92400E),
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          if (reviewCount > 0) ...[
            const SizedBox(width: 3),
            Text(
              '$reviewCount',
              style: TextStyle(
                color: const Color(0xFF92400E).withValues(alpha: 0.55),
                fontSize: 10,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _MiniTag extends StatelessWidget {
  final String label;
  final Color color;

  const _MiniTag({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _ServiceTag extends StatelessWidget {
  final IconData icon;
  final String label;

  const _ServiceTag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: context.artC.ink.withValues(alpha: 0.36)),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            color: context.artC.ink.withValues(alpha: 0.44),
            fontSize: 10,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _OfflineContactSheet extends StatelessWidget {
  final Map<String, dynamic> org;

  const _OfflineContactSheet({required this.org});

  @override
  Widget build(BuildContext context) {
    final name = org['name']?.toString() ?? '机构';
    final address = org['address']?.toString();
    final phone = org['phone']?.toString();
    final qr = org['wechat_qr_url']?.toString();
    return _SheetShell(
      title: '线下见面',
      subtitle: name,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ContactRow(
            icon: Icons.place_outlined,
            label: '机构地址',
            value: address?.isNotEmpty == true ? address! : '机构尚未填写地址',
          ),
          const SizedBox(height: 10),
          _ContactRow(
            icon: Icons.call_outlined,
            label: '联系电话',
            value: phone?.isNotEmpty == true ? phone! : '机构尚未填写电话',
          ),
          if (qr != null && qr.isNotEmpty) ...[
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: Image.network(
                qr,
                height: 180,
                width: double.infinity,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
          ],
          const SizedBox(height: 16),
          Text(
            '线下服务由用户与机构自行沟通、签约和交付。平台仅提供机构信息与后续合同存档。',
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.42),
              fontSize: 11,
              height: 1.5,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                final navigator = Navigator.of(context);
                navigator.pop();
                navigator.push(
                  MaterialPageRoute<void>(
                    builder: (_) => ContractArchiveScreen(
                      initialOrganizationId: org['id']?.toString(),
                      initialOrganizationName: name,
                      openCreateOnLoad: true,
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.upload_file_outlined, size: 18),
              label: const Text('上传合同存档'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ContactRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.silver.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(icon, color: kCobalt, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.36),
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                SelectableText(
                  value,
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
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

class _MembershipUpgradeSheet extends StatefulWidget {
  final bool loading;
  final Future<void> Function(String plan) onUpgrade;

  const _MembershipUpgradeSheet({
    required this.loading,
    required this.onUpgrade,
  });

  @override
  State<_MembershipUpgradeSheet> createState() =>
      _MembershipUpgradeSheetState();
}

class _MembershipUpgradeSheetState extends State<_MembershipUpgradeSheet> {
  String _plan = 'yearly';
  String? _submittingPlan;

  Future<void> _submit() async {
    if (widget.loading || _submittingPlan != null) return;
    setState(() => _submittingPlan = _plan);
    try {
      await widget.onUpgrade(_plan);
    } finally {
      if (mounted) setState(() => _submittingPlan = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final busy = widget.loading || _submittingPlan != null;
    return _SheetShell(
      title: '升级会员',
      subtitle: '解锁机构咨询权限',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _BenefitRow(
              icon: Icons.chat_bubble_outline_rounded, label: '向入驻机构发起线上会话'),
          const SizedBox(height: 10),
          const _BenefitRow(
              icon: Icons.storefront_outlined, label: '查看线下地址、电话和企业微信'),
          const SizedBox(height: 10),
          const _BenefitRow(
              icon: Icons.description_outlined, label: '签约后可上传合同存档'),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: _MembershipPlanTile(
                  title: '月度会员',
                  subtitle: '先体验咨询权限',
                  selected: _plan == 'monthly',
                  enabled: !busy,
                  onTap: () => setState(() => _plan = 'monthly'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _MembershipPlanTile(
                  title: '年度会员',
                  subtitle: '长期申请周期',
                  selected: _plan == 'yearly',
                  enabled: !busy,
                  onTap: () => setState(() => _plan = 'yearly'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: busy ? null : _submit,
              icon: _submittingPlan == null
                  ? const Icon(Icons.verified_user_outlined, size: 18)
                  : const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    ),
              label: Text(
                busy
                    ? '创建订单中...'
                    : _plan == 'monthly'
                        ? '开通月度会员'
                        : '开通年度会员',
              ),
              style: FilledButton.styleFrom(
                backgroundColor: kCobalt,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
                textStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '平台只做信息撮合与记录存档，不参与用户与机构之间的合同、收费或服务交付。',
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.42),
              fontSize: 11,
              height: 1.45,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _MembershipPlanTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool selected;
  final bool enabled;
  final VoidCallback onTap;

  const _MembershipPlanTile({
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.enabled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor =
        selected ? kCobalt : context.artC.silver.withValues(alpha: 0.28);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: enabled ? onTap : null,
        child: Ink(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: selected
                ? kCobalt.withValues(alpha: 0.08)
                : context.artC.porcelain,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderColor),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    selected
                        ? Icons.radio_button_checked
                        : Icons.radio_button_off,
                    size: 17,
                    color: selected
                        ? kCobalt
                        : context.artC.ink.withValues(alpha: 0.32),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: selected ? kCobalt : context.artC.ink,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.48),
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BenefitRow extends StatelessWidget {
  final IconData icon;
  final String label;

  const _BenefitRow({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: kCobalt.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: kCobalt, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 13,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ],
    );
  }
}

class _SheetShell extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget child;

  const _SheetShell({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 12,
        right: 12,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 12,
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
        decoration: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(28),
          border:
              Border.all(color: context.artC.silver.withValues(alpha: 0.24)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 42,
                  height: 4,
                  decoration: BoxDecoration(
                    color: context.artC.silver.withValues(alpha: 0.7),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                title,
                style: TextStyle(
                  color: context.artC.ink,
                  fontFamily: 'Noto Serif SC',
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.44),
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 18),
              child,
            ],
          ),
        ),
      ),
    );
  }
}

class _StatePanel extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String action;
  final VoidCallback onTap;

  const _StatePanel({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.action,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 80),
      child: Column(
        children: [
          Icon(icon, size: 42, color: context.artC.ink.withValues(alpha: 0.22)),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: context.artC.ink.withValues(alpha: 0.42),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          OutlinedButton(
            onPressed: onTap,
            child: Text(action),
          ),
        ],
      ),
    );
  }
}

String? _extractCity(Object? value) {
  final text = value?.toString().trim();
  if (text == null || text.isEmpty) return null;
  const knownCities = ['北京', '上海', '广州', '深圳', '杭州', '伦敦', '纽约'];
  for (final city in knownCities) {
    if (text.contains(city)) return city;
  }
  return text.split(RegExp(r'[\s,，/]+')).first.trim();
}

List<({String? value, String label})> _cityFilterItems(String? currentCity) {
  final items = <({String? value, String label})>[
    (value: null, label: '全部'),
    (value: '北京', label: '北京'),
    (value: '上海', label: '上海'),
    (value: '广州', label: '广州'),
    (value: '深圳', label: '深圳'),
    (value: '杭州', label: '杭州'),
    (value: '伦敦', label: '伦敦'),
    (value: '纽约', label: '纽约'),
  ];
  final city = currentCity?.trim();
  if (city != null &&
      city.isNotEmpty &&
      !items.any((item) => item.value == city)) {
    items.insert(1, (value: city, label: city));
  }
  return items;
}

List<String> _stringList(Object? value) {
  if (value is List) {
    return value
        .map((item) => item.toString().trim())
        .where((item) => item.isNotEmpty)
        .toList();
  }
  return const [];
}

List<Map<String, dynamic>> _mapList(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<Map>()
      .map((item) => Map<String, dynamic>.from(item))
      .toList();
}

String? _formatReviewDate(String? value) {
  if (value == null || value.trim().isEmpty) return null;
  final date = DateTime.tryParse(value)?.toLocal();
  if (date == null) return null;
  return '${date.month}月${date.day}日';
}

String _focusLabel(String value) {
  const labels = {
    'uk': '英国留学',
    'us': '美国留学',
    'portfolio': '作品集辅导',
    'rca': 'RCA',
    'service_design': '服务设计',
  };
  return labels[value] ?? value;
}

bool _isInternalCheckoutUrl(String value) {
  return value.startsWith('/orders/');
}

String _checkoutOrderId(Map<String, dynamic> checkout) {
  final direct = checkout['orderId']?.toString().trim() ?? '';
  if (direct.isNotEmpty) return direct;
  final order = checkout['order'];
  if (order is Map) return order['id']?.toString().trim() ?? '';
  return '';
}

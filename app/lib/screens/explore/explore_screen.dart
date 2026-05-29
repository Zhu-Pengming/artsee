import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => ExploreScreenState();
}

class ExploreScreenState extends State<ExploreScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final GlobalKey<_OpportunityTabState> _opportunityKey =
      GlobalKey<_OpportunityTabState>();
  final GlobalKey<_ExhibitionTabState> _exhibitionKey =
      GlobalKey<_ExhibitionTabState>();
  final GlobalKey<_ArtistTabState> _artistKey = GlobalKey<_ArtistTabState>();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void refreshActiveTab() {
    switch (_tabController.index) {
      case 0:
        _opportunityKey.currentState?._load();
        break;
      case 1:
        _exhibitionKey.currentState?._load();
        break;
      case 2:
        _artistKey.currentState?._load();
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        top: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 0),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _SegmentTabs(
                controller: _tabController,
                tabs: const [
                  (label: '机会', icon: Icons.business_center_outlined),
                  (label: '展览', icon: Icons.grid_view_rounded),
                  (label: '艺术家', icon: Icons.palette_outlined),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _OpportunityTab(key: _opportunityKey, bottom: bottom),
                  _ExhibitionTab(key: _exhibitionKey, bottom: bottom),
                  _ArtistTab(key: _artistKey, bottom: bottom),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OpportunityTab extends StatefulWidget {
  final double bottom;

  const _OpportunityTab({super.key, required this.bottom});

  @override
  State<_OpportunityTab> createState() => _OpportunityTabState();
}

class _OpportunityTabState extends State<_OpportunityTab> {
  List<Map<String, dynamic>> _items = const [];
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
      final result = await BackendApiService.fetchOpportunities(limit: 30);
      if (!mounted) return;
      setState(() {
        _items = result.data;
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

  Future<void> _apply(String id) async {
    try {
      await BackendApiService.applyOpportunity(
        opportunityId: id,
        proposal: '我对该机会感兴趣，希望进一步沟通。',
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('已提交机会申请')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('申请失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return _LoadingState(bottom: widget.bottom);
    if (_error != null) {
      return _ResourceState(
        bottom: widget.bottom,
        title: '机会加载失败',
        subtitle: _error!,
        onRetry: _load,
      );
    }

    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
      children: [
        Row(
          children: [
            Expanded(
              child: _HeroTile(
                title: '酒店招募',
                subtitle: 'Premium Art',
                icon: Icons.star,
                color: context.artC.ink,
                iconColor: const Color(0xFFFACC15),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _HeroTile(
                title: '装置大赛',
                subtitle: 'Competitions',
                icon: Icons.bubble_chart_outlined,
                color: kCobalt,
                iconColor: Colors.white,
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),
        _SectionHeader(title: '推荐机会 (Hot)', action: '${_items.length} 条'),
        const SizedBox(height: 2),
        if (_items.isEmpty)
          _EmptyPanel(title: '暂无合作机会', subtitle: '点击右上角 + 发布第一条机会。')
        else
          GridView.builder(
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _items.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.78,
            ),
            itemBuilder: (context, index) {
              final item = _items[index];
              return _OpportunityCard(
                item: item,
                onApply: () => _apply(item['id'].toString()),
              );
            },
          ),
      ],
    );
  }
}

class _ExhibitionTab extends StatefulWidget {
  final double bottom;

  const _ExhibitionTab({super.key, required this.bottom});

  @override
  State<_ExhibitionTab> createState() => _ExhibitionTabState();
}

class _ExhibitionTabState extends State<_ExhibitionTab> {
  List<Map<String, dynamic>> _items = const [];
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
      final result = await BackendApiService.fetchEvents(limit: 30);
      if (!mounted) return;
      setState(() {
        _items = result.data;
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

  Future<void> _apply(String id) async {
    try {
      await BackendApiService.applyEvent(
        eventId: id,
        applyNote: '我想报名参加该活动。',
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('已提交活动报名')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('报名失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return _LoadingState(bottom: widget.bottom);
    if (_error != null) {
      return _ResourceState(
        bottom: widget.bottom,
        title: '展览加载失败',
        subtitle: _error!,
        onRetry: _load,
      );
    }
    final featured = _items.isNotEmpty ? _items.first : null;
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
      children: [
        _FeatureExhibition(item: featured),
        const SizedBox(height: 26),
        _SectionHeader(
          title: '线下展览日历',
          action: '${_items.length} 场',
          icon: Icons.location_on_outlined,
        ),
        const SizedBox(height: 14),
        if (_items.isEmpty)
          _EmptyPanel(title: '暂无展览活动', subtitle: '点击右上角 + 发布展览或沙龙。')
        else
          ..._items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _ExhibitionCard(
                item: item,
                onApply: () => _apply(item['id'].toString()),
              ),
            ),
          ),
        const SizedBox(height: 14),
        _MuseumPanel(),
      ],
    );
  }
}

class _ArtistTab extends StatefulWidget {
  final double bottom;

  const _ArtistTab({super.key, required this.bottom});

  @override
  State<_ArtistTab> createState() => _ArtistTabState();
}

class _ArtistTabState extends State<_ArtistTab> {
  List<Map<String, dynamic>> _items = const [];
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
      final result = await BackendApiService.fetchArtists(limit: 30);
      if (!mounted) return;
      setState(() {
        _items = result.data;
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

  @override
  Widget build(BuildContext context) {
    if (_loading) return _LoadingState(bottom: widget.bottom);
    if (_error != null) {
      return _ResourceState(
        bottom: widget.bottom,
        title: '艺术家加载失败',
        subtitle: _error!,
        onRetry: _load,
      );
    }
    if (_items.isEmpty) {
      return ListView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
        children: [
          _EmptyPanel(title: '暂无艺术家入驻', subtitle: '点击右上角 + 创建艺术家档案。'),
        ],
      );
    }
    return GridView.builder(
      padding: EdgeInsets.fromLTRB(20, 0, 20, widget.bottom),
      itemCount: _items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 18,
        childAspectRatio: 0.62,
      ),
      itemBuilder: (context, index) => _ArtistCard(
        artist: _items[index],
      ),
    );
  }
}

class _SegmentTabs extends StatelessWidget {
  final TabController controller;
  final List<({String label, IconData icon})> tabs;

  const _SegmentTabs({required this.controller, required this.tabs});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.28),
        borderRadius: BorderRadius.circular(16),
      ),
      child: TabBar(
        controller: controller,
        indicator: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: context.artC.ink.withOpacity(0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: kCobalt,
        unselectedLabelColor: context.artC.ink.withOpacity(0.42),
        labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
        tabs: tabs
            .map(
              (tab) => Tab(
                height: 40,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(tab.icon, size: 14),
                    const SizedBox(width: 6),
                    Text(tab.label),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _HeroTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final Color iconColor;

  const _HeroTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [kShadowCard],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(icon, color: iconColor, size: 24),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                  ),
                ),
                Text(
                  subtitle.toUpperCase(),
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.42),
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.6,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _OpportunityCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback onApply;

  const _OpportunityCard({required this.item, required this.onApply});

  @override
  Widget build(BuildContext context) {
    final title = item['title']?.toString() ?? '未命名机会';
    final type = item['type']?.toString() ?? 'collaboration';
    final city = item['city']?.toString();
    final requirements = item['requirements']?.toString();
    final deadline = _formatDate(item['deadline']);
    final budget = _formatBudget(item['budget_min'], item['budget_max']);
    final tags = <String>[
      if (city != null && city.isNotEmpty) city,
      if (requirements != null && requirements.isNotEmpty) '需求说明',
    ];

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: _MiniBadge(text: type, color: kCobalt),
              ),
              Text(
                deadline,
                style: TextStyle(
                  fontSize: 8,
                  color: context.artC.ink.withOpacity(0.22),
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            title,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 15,
              height: 1.2,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            requirements == null || requirements.isEmpty
                ? '平台合作机会'
                : requirements,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.2,
              color: context.artC.ink.withOpacity(0.28),
            ),
          ),
          const Spacer(),
          Wrap(
            spacing: 5,
            runSpacing: 5,
            children: tags
                .map((tag) => _SoftTag(text: tag))
                .toList(),
          ),
          const SizedBox(height: 12),
          Container(height: 1, color: context.artC.silver.withOpacity(0.26)),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Text(
                  budget,
                  style: TextStyle(
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
              ),
              GestureDetector(
                onTap: onApply,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: kCobalt,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    '申请',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
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

class _FeatureExhibition extends StatelessWidget {
  final Map<String, dynamic>? item;

  const _FeatureExhibition({this.item});

  @override
  Widget build(BuildContext context) {
    final title = item?['title']?.toString() ?? '镜中之镜 - 线上VR大展';
    final coverUrl = item?['cover_url']?.toString();
    return AspectRatio(
      aspectRatio: 1.25,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(26),
        child: Stack(
          fit: StackFit.expand,
          children: [
            coverUrl != null && coverUrl.isNotEmpty
                ? Image.network(
                    coverUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: context.artC.silver.withOpacity(0.3),
                      child: Icon(
                        Icons.image_outlined,
                        size: 60,
                        color: context.artC.ink.withOpacity(0.2),
                      ),
                    ),
                  )
                : Container(
                    color: context.artC.silver.withOpacity(0.3),
                    child: Icon(
                      Icons.photo_library_outlined,
                      size: 60,
                      color: context.artC.ink.withOpacity(0.2),
                    ),
                  ),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [context.artC.ink.withOpacity(0.9), Colors.transparent],
                ),
              ),
            ),
            Positioned(
              left: 22,
              right: 22,
              bottom: 22,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'FEATURED EXHIBIT HIGHLIGHTS',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 8,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      height: 1.05,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ExhibitionCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback onApply;

  const _ExhibitionCard({required this.item, required this.onApply});

  @override
  Widget build(BuildContext context) {
    final title = item['title']?.toString() ?? '未命名展览';
    final subtitle = item['summary']?.toString() ??
        item['venue']?.toString() ??
        item['hotel_name']?.toString() ??
        '艺术活动';
    final date = DateTime.tryParse(item['start_time']?.toString() ?? '');
    final month = date == null ? '--' : _monthLabel(date.month);
    final day = date == null ? '--' : date.day.toString().padLeft(2, '0');
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 78,
            decoration: BoxDecoration(
              color: context.artC.silver.withOpacity(0.24),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  month,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink.withOpacity(0.38),
                  ),
                ),
                Text(
                  day,
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: kCobalt,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
                    color: context.artC.ink.withOpacity(0.36),
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Icon(Icons.calendar_today_outlined,
                        size: 11, color: context.artC.ink.withOpacity(0.28)),
                    const SizedBox(width: 4),
                    Text(
                      '预约制',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink.withOpacity(0.32),
                      ),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: onApply,
                      child: const Text(
                        '报名参加',
                        style: TextStyle(
                          fontSize: 9,
                          color: kCobalt,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MuseumPanel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const museums = ['龙美术馆', '艺仓艺术馆', 'UCCA Edge', '复星艺术中心'];
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '热门展馆推荐',
            style: TextStyle(
              color: Colors.white.withOpacity(0.4),
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 16),
          ...museums.map(
            (museum) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      museum,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                  Icon(Icons.chevron_right,
                      size: 18, color: Colors.white.withOpacity(0.5)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ArtistCard extends StatelessWidget {
  final Map<String, dynamic> artist;

  const _ArtistCard({required this.artist});

  @override
  Widget build(BuildContext context) {
    final name = artist['display_name']?.toString() ?? '未命名艺术家';
    final fields = (artist['art_fields'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .where((e) => e.isNotEmpty)
        .join(' / ');
    final intent = artist['cooperation_intent']?.toString();
    final avatarUrl = artist['avatar_url']?.toString();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Stack(
              fit: StackFit.expand,
              children: [
                avatarUrl != null && avatarUrl.isNotEmpty
                    ? Image.network(
                        avatarUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          color: context.artC.silver.withOpacity(0.3),
                          child: Icon(
                            Icons.person_outline,
                            size: 60,
                            color: context.artC.ink.withOpacity(0.2),
                          ),
                        ),
                      )
                    : Container(
                        color: context.artC.silver.withOpacity(0.3),
                        child: Icon(
                          Icons.person_outline,
                          size: 60,
                          color: context.artC.ink.withOpacity(0.2),
                        ),
                      ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.92),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFF22C55E),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          'Available',
                          style: TextStyle(
                            fontSize: 8,
                            fontWeight: FontWeight.w900,
                            color: context.artC.ink,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 10),
        Text(
          '艺术家 · $name',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w900,
            color: context.artC.ink,
            fontStyle: FontStyle.italic,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          [
            if (fields.isNotEmpty) fields,
            if (intent != null && intent.isNotEmpty) intent,
          ].join(' | ').isEmpty
              ? '艺术家档案'
              : [
                  if (fields.isNotEmpty) fields,
                  if (intent != null && intent.isNotEmpty) intent,
                ].join(' | '),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
            color: context.artC.ink.withOpacity(0.32),
          ),
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String action;
  final IconData? icon;

  const _SectionHeader({required this.title, required this.action, this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
              fontFamily: 'Noto Serif SC',
            ),
          ),
        ),
        if (icon != null) Icon(icon, size: 13, color: kCobalt),
        if (icon != null) const SizedBox(width: 4),
        Text(
          action,
          style: const TextStyle(
            color: kCobalt,
            fontSize: 10,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _MiniBadge extends StatelessWidget {
  final String text;
  final Color color;

  const _MiniBadge({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.07),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withOpacity(0.12)),
      ),
      child: Text(
        text,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w900,
          color: color,
        ),
      ),
    );
  }
}

class _SoftTag extends StatelessWidget {
  final String text;

  const _SoftTag({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: context.artC.silver.withOpacity(0.45)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w800,
          color: context.artC.ink.withOpacity(0.44),
        ),
      ),
    );
  }
}

class _LoadingState extends StatelessWidget {
  final double bottom;

  const _LoadingState({required this.bottom});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 80, 20, bottom),
      children: [
        Center(
          child: CircularProgressIndicator(color: kCobalt, strokeWidth: 2.5),
        ),
      ],
    );
  }
}

class _ResourceState extends StatelessWidget {
  final double bottom;
  final String title;
  final String subtitle;
  final VoidCallback onRetry;

  const _ResourceState({
    required this.bottom,
    required this.title,
    required this.subtitle,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.fromLTRB(20, 44, 20, bottom),
      children: [
        _EmptyPanel(title: title, subtitle: subtitle),
        const SizedBox(height: 12),
        Center(
          child: TextButton(onPressed: onRetry, child: const Text('重试')),
        ),
      ],
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  final String title;
  final String subtitle;

  const _EmptyPanel({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.artC.silver.withOpacity(0.38)),
      ),
      child: Column(
        children: [
          const Icon(Icons.add_circle_outline, color: kCobalt, size: 30),
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
              color: context.artC.ink.withOpacity(0.42),
              fontSize: 12,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

String _formatBudget(dynamic min, dynamic max) {
  final minValue = min is int ? min : int.tryParse(min?.toString() ?? '');
  final maxValue = max is int ? max : int.tryParse(max?.toString() ?? '');
  String money(int value) {
    if (value >= 10000) return '¥${(value / 10000).toStringAsFixed(0)}w';
    return '¥$value';
  }

  if (minValue != null && maxValue != null) {
    return '${money(minValue)}-${money(maxValue)}';
  }
  if (maxValue != null) return '最高 ${money(maxValue)}';
  if (minValue != null) return '最低 ${money(minValue)}';
  return '预算面议';
}

String _formatDate(dynamic raw) {
  final date = DateTime.tryParse(raw?.toString() ?? '');
  if (date == null) return '长期开放';
  return '${date.year}.${date.month.toString().padLeft(2, '0')}.${date.day.toString().padLeft(2, '0')}';
}

String _monthLabel(int month) {
  const labels = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  return labels[month - 1];
}

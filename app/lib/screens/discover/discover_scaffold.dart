import 'package:flutter/material.dart';
import '../../widgets/artsee_ui.dart';
import '../../widgets/common.dart';
import '../../services/backend_api_service.dart';
import '../../data/mock_data.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class DiscoverScaffold extends StatefulWidget {
  const DiscoverScaffold({super.key});

  @override
  State<DiscoverScaffold> createState() => DiscoverScaffoldState();
}

class DiscoverScaffoldState extends State<DiscoverScaffold>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            const SizedBox(height: 28),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: ArtseeSegmentedTabs(
                controller: _tabController,
                tabs: const [
                  ArtseeSegmentTab(label: '合作', icon: Icons.handshake_outlined),
                  ArtseeSegmentTab(label: '艺术家', icon: Icons.palette_outlined),
                  ArtseeSegmentTab(label: '作品', icon: Icons.grid_view_rounded),
                ],
                labelFontSize: 12,
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  _OpportunitiesTab(),
                  _ArtistsTab(),
                  _ArtworksTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OpportunitiesTab extends StatefulWidget {
  const _OpportunitiesTab();

  @override
  State<_OpportunitiesTab> createState() => _OpportunitiesTabState();
}

class _OpportunitiesTabState extends State<_OpportunitiesTab> {
  List<Opportunity> _opportunities = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      // 优先使用本地 mock 数据
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted) {
        setState(() => _opportunities = MockData.getOpportunities());
      }
    } catch (e) {
      // 如果需要，可以回退到 API
      try {
        final result = await BackendApiService.fetchOpportunities(limit: 30);
        if (mounted) {
          final oppList = result.data
              .map((item) => Opportunity(
                    id: item['id'] as String? ?? '',
                    type: item['type'] as String? ?? '',
                    title: item['title'] as String? ?? '',
                    organization: item['organization'] as String? ?? '',
                    location: item['location'] as String? ?? '',
                    description: item['description'] as String? ?? '',
                    requirements:
                        (item['requirements'] as List?)?.cast<String>() ?? [],
                    publishedAt: item['publishedAt'] as String? ?? '',
                  ))
              .toList();
          setState(() => _opportunities = oppList);
        }
      } catch (apiError) {
        // 忽略 API 错误，使用 mock 数据
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _getTypeLabel(String type) {
    switch (type) {
      case 'job':
        return 'job';
      case 'internship':
        return 'internship';
      case 'collaboration':
        return 'collaboration';
      default:
        return type;
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'job':
        return const Color(0xFF7C3AED);
      case 'internship':
        return const Color(0xFF10B981);
      case 'collaboration':
        return const Color(0xFFF59E0B);
      default:
        return const Color(0xFF7C3AED);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    if (_loading) return const Center(child: CircularProgressIndicator());
    return ListView.builder(
      padding: EdgeInsets.fromLTRB(20, 16, 20, bottom),
      itemCount: _opportunities.length,
      itemBuilder: (context, index) {
        final opp = _opportunities[index];
        final typeColor = _getTypeColor(opp.type);
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: ArtseeSurface(
            padding: const EdgeInsets.all(16),
            radius: 18,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: typeColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    _getTypeLabel(opp.type),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: typeColor,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  '${opp.organization} · ${opp.title}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: context.artC.ink,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _ArtistsTab extends StatefulWidget {
  const _ArtistsTab();

  @override
  State<_ArtistsTab> createState() => _ArtistsTabState();
}

class _ArtistsTabState extends State<_ArtistsTab> {
  List<Map<String, dynamic>> _artists = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final result = await BackendApiService.fetchArtists(limit: 30);
      if (mounted) setState(() => _artists = result.data);
    } catch (e) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    if (_loading) return const Center(child: CircularProgressIndicator());
    return ListView.builder(
      padding: EdgeInsets.fromLTRB(20, 16, 20, bottom),
      itemCount: _artists.length,
      itemBuilder: (context, index) {
        final artist = _artists[index];
        final name = artist['name'] as String? ?? '艺术家';
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: ArtseeSurface(
            padding: const EdgeInsets.all(14),
            radius: 18,
            child: Text(
              name,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: context.artC.ink,
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ArtworksTab extends StatelessWidget {
  const _ArtworksTab();

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 24, 20, bottom),
      child: Text(
        '作品流 - 节点二待实现',
        style: TextStyle(
          fontSize: 14,
          color: context.artC.ink.withOpacity(0.6),
        ),
      ),
    );
  }
}

import 'dart:async';

import 'package:flutter/material.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';
import '../../services/backend_api_service.dart';
import '../../models/models.dart';

/// 对齐稿件 HomeView 核心结构：展览主视觉 + 热门展厅横滑 + 近期展会列表
/// 顶部/底部导航与全局配色由 MainScaffold 统一控制，本页仅负责内容区。

const _greyscale = ColorFilter.matrix([
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0, 0, 0, 1, 0,
]);

/// 硬编码 fallback 数据（API 加载前或加载失败时显示）
const _kFallbackBanner = HomeContent(
  id: 'fallback_banner',
  sectionType: 'hero_banner',
  title: '灵感碎片的万合\n青花新境',
  subtitle: 'SPECIAL / 陶瓷重构专场',
  imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000',
  linkText: '立即观展 (Virtual Access)',
  displayOrder: 0,
  isActive: true,
  createdAt: '',
  updatedAt: '',
);

final _kFallbackHotHalls = <HomeContent>[
  const HomeContent(id: '', sectionType: 'hot_hall', title: '解构青花：数字维度的传统重塑', imageUrl: 'https://images.unsplash.com/photo-1626074311105-0255c4d3609c?auto=format&fit=crop&q=80&w=800', badge: 'LIVE NOW', displayOrder: 0, isActive: true, createdAt: '', updatedAt: ''),
  const HomeContent(id: '', sectionType: 'hot_hall', title: '媒介考古：模拟时代的感官记忆', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800', badge: 'LIVE NOW', displayOrder: 1, isActive: true, createdAt: '', updatedAt: ''),
  const HomeContent(id: '', sectionType: 'hot_hall', title: '光影变迁：叙事性空间的数字边界', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800', badge: 'LIVE NOW', displayOrder: 2, isActive: true, createdAt: '', updatedAt: ''),
  const HomeContent(id: '', sectionType: 'hot_hall', title: '赛博禅意：机械冥想与算法秩序', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800', badge: 'LIVE NOW', displayOrder: 3, isActive: true, createdAt: '', updatedAt: ''),
  const HomeContent(id: '', sectionType: 'hot_hall', title: '极简空间：光影与白墙的对话', imageUrl: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=800', badge: 'LIVE NOW', displayOrder: 4, isActive: true, createdAt: '', updatedAt: ''),
];

final _kFallbackRecentExhibitions = <HomeContent>[
  const HomeContent(id: '', sectionType: 'recent_exhibition', title: '威尼斯双年展中国馆主题发布', imageUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200', displayOrder: 0, isActive: true, createdAt: '', updatedAt: ''),
  const HomeContent(id: '', sectionType: 'recent_exhibition', title: '西岸美术馆：丝绸与光影', imageUrl: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=800', displayOrder: 1, isActive: true, createdAt: '', updatedAt: ''),
  const HomeContent(id: '', sectionType: 'recent_exhibition', title: '当代摄影：城市褶皱', imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800', displayOrder: 2, isActive: true, createdAt: '', updatedAt: ''),
];

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late final PageController _carouselCtrl;
  Timer? _autoTimer;
  int _carouselPage = 0;

  HomeContent _heroBanner = _kFallbackBanner;
  List<HomeContent> _hotHalls = _kFallbackHotHalls;
  List<HomeContent> _recentExhibitions = _kFallbackRecentExhibitions;

  @override
  void initState() {
    super.initState();
    _carouselCtrl = PageController(viewportFraction: 0.82);
    _loadData();
    _autoTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || !_carouselCtrl.hasClients) return;
      final count = _hotHalls.length;
      if (count == 0) return;
      final next = (_carouselPage + 1) % count;
      _carouselCtrl.animateToPage(
        next,
        duration: const Duration(milliseconds: 520),
        curve: Curves.easeOutCubic,
      );
    });
  }

  Future<void> _loadData() async {
    try {
      final contents = await BackendApiService.fetchHomeContents();
      if (!mounted) return;
      final banners = contents.where((c) => c.sectionType == 'hero_banner' && c.isActive).toList()
        ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      final halls = contents.where((c) => c.sectionType == 'hot_hall' && c.isActive).toList()
        ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      final recents = contents.where((c) => c.sectionType == 'recent_exhibition' && c.isActive).toList()
        ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      setState(() {
        if (banners.isNotEmpty) _heroBanner = banners.first;
        if (halls.isNotEmpty) _hotHalls = halls;
        if (recents.isNotEmpty) _recentExhibitions = recents;
      });
    } catch (e) {
      // 静默失败：保留 fallback 数据
      debugPrint('HomeScreen _loadData error: $e');
    }
  }

  @override
  void dispose() {
    _autoTimer?.cancel();
    _carouselCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 6),
              _buildHotHallHeader(),
              const SizedBox(height: 20),
              SizedBox(
                height: 200,
                child: PageView.builder(
                  controller: _carouselCtrl,
                  onPageChanged: (i) => setState(() {
                    _carouselPage = i;
                  }),
                  itemCount: _hotHalls.length,
                  padEnds: false,
                  itemBuilder: (context, i) {
                    final item = _hotHalls[i];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: _HotHallCard(item: item),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_hotHalls.length, (i) {
                  final on = i == _carouselPage;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: on ? 18 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: on ? kCobalt : context.artC.silver.withOpacity(0.35),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 44),
              _buildHeroBanner(),
              const SizedBox(height: 12),
              _buildRecentSection(),
              SizedBox(height: bottom),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroBanner() {
    final banner = _heroBanner;
    final imageUrl = banner.imageUrl ?? 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000';
    return AspectRatio(
      aspectRatio: 16 / 7,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(kRadiusLarge),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Image.asset(
                'assets/images/home_banner.jpg',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(color: context.artC.silver.withOpacity(0.35)),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    context.artC.ink.withOpacity(0.0),
                    context.artC.ink.withOpacity(0.25),
                    context.artC.ink.withOpacity(0.88),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  stops: const [0.0, 0.35, 1.0],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (banner.subtitle != null && banner.subtitle!.isNotEmpty)
                    Text(
                      banner.subtitle!,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: kCobalt.withOpacity(0.95),
                        letterSpacing: 3.2,
                      ),
                    ),
                  if (banner.subtitle != null && banner.subtitle!.isNotEmpty)
                    const SizedBox(height: 8),
                  Flexible(
                    child: Text(
                      banner.title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w300,
                        height: 1.15,
                        color: Colors.white,
                        fontFamily: 'Noto Serif SC',
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (banner.linkText != null && banner.linkText!.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                      decoration: BoxDecoration(
                        color: context.artC.porcelain,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        banner.linkText!,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 2,
                          color: context.artC.ink,
                        ),
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

  Widget _buildHotHallHeader() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '热门展厅',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: context.artC.ink,
                  fontFamily: 'Noto Serif SC',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRecentSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '近期展会',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: context.artC.ink,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 20),
        ..._recentExhibitions.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: _RecentExhibitionTile(item: e),
            )),
      ],
    );
  }
}

class _HotHallCard extends StatelessWidget {
  final HomeContent item;

  const _HotHallCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(32),
      child: Stack(
        fit: StackFit.expand,
        children: [
          ColorFiltered(
            colorFilter: _greyscale,
            child: Image.network(
              item.imageUrl ?? '',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(color: context.artC.silver.withOpacity(0.35)),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  context.artC.ink.withOpacity(0.82),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    fontStyle: FontStyle.italic,
                    color: Colors.white,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 8),
                if (item.badge != null && item.badge!.isNotEmpty)
                  Row(
                    children: [
                      Container(
                        width: 5,
                        height: 5,
                        decoration: const BoxDecoration(
                          color: kCobalt,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        item.badge!,
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.6,
                          color: Colors.white.withOpacity(0.65),
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

class _RecentExhibitionTile extends StatelessWidget {
  final HomeContent item;

  const _RecentExhibitionTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(kRadiusMedium),
      child: SizedBox(
        height: 104,
        child: Row(
          children: [
            SizedBox(
              width: 132,
              child: ColorFiltered(
                colorFilter: _greyscale,
                child: Image.network(
                  item.imageUrl ?? '',
                  fit: BoxFit.cover,
                  height: 104,
                  errorBuilder: (_, __, ___) => Container(color: context.artC.silver.withOpacity(0.35)),
                ),
              ),
            ),
            Expanded(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                alignment: Alignment.centerLeft,
                child: Text(
                  item.title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    height: 1.35,
                    color: context.artC.ink,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

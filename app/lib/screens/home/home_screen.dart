import 'dart:async';

import 'package:flutter/material.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// 对齐稿件 HomeView 核心结构：展览主视觉 + 热门展厅横滑 + 近期展会列表
/// 顶部/底部导航与全局配色由 MainScaffold 统一控制，本页仅负责内容区。

const _greyscale = ColorFilter.matrix([
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0, 0, 0, 1, 0,
]);

class _ExhibitionItem {
  final String title;
  final String img;
  const _ExhibitionItem(this.title, this.img);
}

const List<_ExhibitionItem> _kHotHallCarousel = [
  _ExhibitionItem(
    '解构青花：数字维度的传统重塑',
    'https://images.unsplash.com/photo-1626074311105-0255c4d3609c?auto=format&fit=crop&q=80&w=800',
  ),
  _ExhibitionItem(
    '媒介考古：模拟时代的感官记忆',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
  ),
  _ExhibitionItem(
    '光影变迁：叙事性空间的数字边界',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800',
  ),
  _ExhibitionItem(
    '赛博禅意：机械冥想与算法秩序',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
  ),
  _ExhibitionItem(
    '极简空间：光影与白墙的对话',
    'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=800',
  ),
];

const List<_ExhibitionItem> _kRecentExhibitions = [
  _ExhibitionItem(
    '威尼斯双年展中国馆主题发布',
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200',
  ),
  _ExhibitionItem(
    '西岸美术馆：丝绸与光影',
    'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=800',
  ),
  _ExhibitionItem(
    '当代摄影：城市褶皱',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800',
  ),
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

  @override
  void initState() {
    super.initState();
    _carouselCtrl = PageController(viewportFraction: 0.82);
    _autoTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || !_carouselCtrl.hasClients) return;
      final next = (_carouselPage + 1) % _kHotHallCarousel.length;
      _carouselCtrl.animateToPage(
        next,
        duration: const Duration(milliseconds: 520),
        curve: Curves.easeOutCubic,
      );
    });
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeroBanner(),
              const SizedBox(height: 28),
              _buildHotHallHeader(),
              const SizedBox(height: 14),
              SizedBox(
                height: 200,
                child: PageView.builder(
                  controller: _carouselCtrl,
                  onPageChanged: (i) => setState(() {
                    _carouselPage = i;
                  }),
                  itemCount: _kHotHallCarousel.length,
                  itemBuilder: (context, i) {
                    final item = _kHotHallCarousel[i];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: _HotHallCard(item: item),
                    );
                  },
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_kHotHallCarousel.length, (i) {
                  final on = i == _carouselPage;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: on ? 18 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: on ? kCobalt : context.artC.silver.withOpacity(0.7),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 32),
              _buildRecentSection(),
              SizedBox(height: bottom),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroBanner() {
    return AspectRatio(
      aspectRatio: 21 / 9,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(kRadiusLarge),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/home_banner.jpg',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Image.network(
                'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000',
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
                  Text(
                    'SPECIAL / 陶瓷重构专场',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: kCobalt.withOpacity(0.95),
                      letterSpacing: 3.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '灵感碎片的万合\n青花新境',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w300,
                      height: 1.15,
                      color: Colors.white,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                    decoration: BoxDecoration(
                      color: context.artC.porcelain,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      '立即观展 (Virtual Access)',
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
                '热门展厅 (Discovery)',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  fontStyle: FontStyle.italic,
                  color: context.artC.ink,
                  fontFamily: 'Noto Serif SC',
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Virtual Exhibition Halls • Exploring Multi-dimensions',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 1.2,
                  color: context.artC.ink.withOpacity(0.38),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Text(
          'Virtual Realms',
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w700,
            letterSpacing: 3,
            color: context.artC.ink.withOpacity(0.18),
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
                const SizedBox(height: 2),
                Text(
                  'Upcoming & Ongoing',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 1.4,
                    color: context.artC.ink.withOpacity(0.35),
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        ..._kRecentExhibitions.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: _RecentExhibitionTile(item: e),
            )),
      ],
    );
  }
}

class _HotHallCard extends StatelessWidget {
  final _ExhibitionItem item;

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
              item.img,
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
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    fontStyle: FontStyle.italic,
                    color: Colors.white,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Container(
                      width: 5,
                      height: 5,
                      decoration: BoxDecoration(
                        color: kCobalt,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'LIVE NOW',
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
  final _ExhibitionItem item;

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
                  item.img,
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

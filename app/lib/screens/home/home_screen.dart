import 'package:flutter/material.dart';
import '../../widgets/common.dart';

/// ═══════════════════════════════════════════════════════════════
/// 首页 — 完全对齐 _artist_ref HomeView
/// ═══════════════════════════════════════════════════════════════

const _greyscale = ColorFilter.matrix([
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
]);

class HomeScreen extends StatelessWidget {
  final VoidCallback? onAiConsultTap;
  const HomeScreen({super.key, this.onAiConsultTap});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kPorcelain,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildBanner(),
              const SizedBox(height: 28),
              _buildQuickAccessGrid(),
              const SizedBox(height: 32),
              _buildRecommendedContent(),
              const SizedBox(height: 32),
              _buildAnnouncements(),
              const SizedBox(height: 120), // 底部导航占位
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBanner() {
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
              errorBuilder: (_, __, ___) => Container(color: kSilver.withOpacity(0.35)),
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    kInk.withOpacity(0.0),
                    kInk.withOpacity(0.5),
                    kInk.withOpacity(0.9),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  stops: const [0.0, 0.4, 1.0],
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
                    '重磅展览',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: Colors.white.withOpacity(0.6),
                      letterSpacing: 3,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '感官之维：当代艺术联展',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      height: 1.2,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                    decoration: BoxDecoration(
                      color: kPorcelain,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      '立即观展',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: kCobalt,
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

  Widget _buildQuickAccessGrid() {
    final items = [
      ('AI咨询', Icons.auto_awesome_outlined, onAiConsultTap),
      ('机构入驻', Icons.language_outlined, null),
      ('展览报名', Icons.calendar_today_outlined, null),
      ('联名合作', Icons.handshake_outlined, null),
      ('作品集指导', Icons.description_outlined, null),
      ('国际资讯', Icons.visibility_outlined, null),
      ('艺术家库', Icons.people_outline, null),
      ('线下活动', Icons.location_on_outlined, null),
    ];

    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 16,
      crossAxisSpacing: 8,
      childAspectRatio: 0.85,
      children: items.map((item) {
        return GestureDetector(
          onTap: item.$3 ?? () {},
          child: Column(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: kSilver.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(kRadiusMedium),
                ),
                child: Icon(item.$2, size: 22, color: kInk.withOpacity(0.6)),
              ),
              const SizedBox(height: 8),
              Text(
                item.$1,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: kInk.withOpacity(0.8),
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRecommendedContent() {
    final items = [
      (
        '顶奢酒店联名招募：空间重塑计划',
        '联名项目',
        'https://picsum.photos/seed/art1/800/450'
      ),
      (
        '国际艺术资讯：威尼斯双年展前瞻',
        '国际资讯',
        'https://picsum.photos/seed/art2/800/450'
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '推荐内容',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: kInk,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Curated For You',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: kInk.withOpacity(0.35),
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Text(
                  '查看全部',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: kCobalt.withOpacity(0.9),
                  ),
                ),
                Icon(Icons.arrow_forward_ios, size: 12, color: kCobalt.withOpacity(0.9)),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 16 / 14,
          children: items.map((item) {
            return GestureDetector(
              onTap: () {},
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(kRadiusMedium),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          ColorFiltered(
                            colorFilter: _greyscale,
                            child: Image.network(
                              item.$3,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(color: kSilver.withOpacity(0.35)),
                            ),
                          ),
                          Positioned(
                            top: 10,
                            left: 10,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: kPorcelain.withOpacity(0.92),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                item.$2,
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w700,
                                  color: kCobalt,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item.$1,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: kInk,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildAnnouncements() {
    final items = [
      '艺术市场规则 (2024修订版)',
      '版权声明与创作者权益保护',
      '品牌入驻合作规范',
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: kSilver.withOpacity(0.15),
        borderRadius: BorderRadius.circular(kRadiusLarge),
        border: Border.all(color: kSilver.withOpacity(0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.notifications_none, size: 18, color: kInk.withOpacity(0.35)),
              const SizedBox(width: 8),
              Text(
                '平台公告',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: kInk.withOpacity(0.45),
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...items.map((text) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      text,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: kInk.withOpacity(0.65),
                      ),
                    ),
                  ),
                  Icon(Icons.chevron_right, size: 18, color: kInk.withOpacity(0.25)),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}

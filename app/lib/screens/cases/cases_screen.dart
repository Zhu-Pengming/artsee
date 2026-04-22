import 'package:flutter/material.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// ═══════════════════════════════════════════════════════════════
/// 合作页 — 完全对齐 _artist_ref CollabView
/// ═══════════════════════════════════════════════════════════════

class CasesScreen extends StatefulWidget {
  const CasesScreen({super.key});

  @override
  State<CasesScreen> createState() => _CasesScreenState();
}

class _CasesScreenState extends State<CasesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TabBar(
              controller: _tabController,
              isScrollable: true,
              indicatorColor: kCobalt,
              indicatorWeight: 2,
              labelColor: kCobalt,
              unselectedLabelColor: context.artC.ink.withOpacity(0.35),
              labelStyle: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
              unselectedLabelStyle: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.2,
              ),
              indicatorSize: TabBarIndicatorSize.label,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              dividerColor: context.artC.silver.withOpacity(0.5),
              tabs: const [
                Tab(text: '需求广场'),
                Tab(text: '艺术家库'),
                Tab(text: '展览中心'),
                Tab(text: '联名项目'),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  _PlazaTab(),
                  _ArtistsTab(),
                  _ExhibitionsTab(),
                  _ProjectsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlazaTab extends StatelessWidget {
  const _PlazaTab();

  @override
  Widget build(BuildContext context) {
    final items = [
      ('安缦酒店', '展览场地合作', '¥150k - 300k', '2024.11.15'),
      ('宝格丽', '联名设计', '¥200k - 500k', '2024.12.01'),
      ('UCCA', '艺术家代理', '面议', '2024.10.30'),
      ('路易威登', '礼盒视觉创作', '¥100k - 200k', '2024.11.20'),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: items.map((item) {
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: context.artC.silver.withOpacity(0.12),
              borderRadius: BorderRadius.circular(kRadiusLarge),
              border: Border.all(color: context.artC.silver.withOpacity(0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item.$1,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: context.artC.ink.withOpacity(0.35),
                        letterSpacing: 1,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: kCobalt.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        item.$2,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: kCobalt.withOpacity(0.85),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  '高端商业空间美学重塑计划',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: context.artC.ink,
                    height: 1.25,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '预算区间',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: context.artC.ink.withOpacity(0.3),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.$3,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: kCobalt,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '截止日期',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: context.artC.ink.withOpacity(0.3),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.$4,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: context.artC.ink.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Container(
                  width: double.infinity,
                  height: 44,
                  decoration: BoxDecoration(
                    color: context.artC.ink,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Center(
                    child: Text(
                      '立即申请',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _ArtistsTab extends StatelessWidget {
  const _ArtistsTab();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: GridView.count(
        crossAxisCount: 3,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 0.85,
        children: List.generate(12, (i) {
          return GestureDetector(
            onTap: () {},
            child: Column(
              children: [
                Expanded(
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(kRadiusMedium),
                        child: Image.network(
                          'https://picsum.photos/seed/art$i/400/400',
                          fit: BoxFit.cover,
                          width: double.infinity,
                          height: double.infinity,
                        ),
                      ),
                      Positioned(
                        right: 6,
                        bottom: 6,
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: context.artC.porcelain,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: context.artC.ink.withOpacity(0.1),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                          child: Icon(Icons.verified, size: 14, color: kCobalt),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '艺术家姓名',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: context.artC.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '纯艺 / 先锋',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: context.artC.ink.withOpacity(0.35),
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}

class _ExhibitionsTab extends StatelessWidget {
  const _ExhibitionsTab();

  @override
  Widget build(BuildContext context) {
    final items = [
      (
        '感官之维：当代艺术联展',
        '上海 · Artiqore 美术馆',
        '2024.11.15 - 2025.01.15',
        'https://picsum.photos/seed/exh1/1200/600'
      ),
      (
        '数字游牧：新媒体艺术季',
        '北京 · 798艺术区',
        '2024.12.01 - 2025.02.28',
        'https://picsum.photos/seed/exh2/1200/600'
      ),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: items.map((item) {
          return Container(
            margin: const EdgeInsets.only(bottom: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AspectRatio(
                  aspectRatio: 2 / 1,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(kRadiusLarge),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          item.$4,
                          fit: BoxFit.cover,
                        ),
                        Positioned(
                          top: 14,
                          right: 14,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                            decoration: BoxDecoration(
                              color: context.artC.porcelain.withOpacity(0.92),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              '正在展出',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: kCobalt,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  item.$1,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: context.artC.ink,
                    fontFamily: 'Noto Serif SC',
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.location_on_outlined, size: 14, color: context.artC.ink.withOpacity(0.35)),
                    const SizedBox(width: 4),
                    Text(
                      item.$2,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: context.artC.ink.withOpacity(0.45),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Icon(Icons.calendar_today_outlined, size: 12, color: context.artC.ink.withOpacity(0.35)),
                    const SizedBox(width: 4),
                    Text(
                      item.$3,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: context.artC.ink.withOpacity(0.45),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _ProjectsTab extends StatelessWidget {
  const _ProjectsTab();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(kRadiusLarge + 8),
        child: Container(
          color: context.artC.ink,
          child: Stack(
            children: [
              Positioned(
                top: 0,
                right: 0,
                bottom: 0,
                width: MediaQuery.of(context).size.width * 0.5,
                child: Opacity(
                  opacity: 0.15,
                  child: Image.network(
                    'https://picsum.photos/seed/collab-bg/800/800',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Co-Branding Projects',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: kCobaltMuted.withOpacity(0.85),
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      '联名项目：\n探索商业与艺术的边界',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        height: 1.25,
                        fontFamily: 'Noto Serif SC',
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '我们连接全球顶尖品牌与先锋艺术家，通过空间重塑、产品联名、视觉创作等多种形式，实现艺术价值的商业转化。',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: Colors.white.withOpacity(0.55),
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                      decoration: BoxDecoration(
                        color: context.artC.porcelain,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        '查看往期案例',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
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
      ),
    );
  }
}

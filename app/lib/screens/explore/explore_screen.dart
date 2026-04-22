import 'package:flutter/material.dart';
import '../../widgets/common.dart';
import 'institutions_archive_screen.dart';
import '../programs/program_list_screen.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// ═══════════════════════════════════════════════════════════════
/// 发现页 — 完全对齐 _artist_ref DiscoverView
/// ═══════════════════════════════════════════════════════════════

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen>
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
              isScrollable: false,
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
                Tab(text: '院校'),
                Tab(text: '专业'),
                Tab(text: '推荐'),
                Tab(text: '问答'),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  InstitutionsArchiveScreen(),
                  ProgramListScreen(),
                  _ImageGridTab(),
                  _QaTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ImageGridTab extends StatelessWidget {
  const _ImageGridTab();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 3 / 4.6,
        children: List.generate(8, (i) {
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
                        Image.network(
                          'https://picsum.photos/seed/disc$i/600/800',
                          fit: BoxFit.cover,
                        ),
                        Positioned(
                          left: 10,
                          right: 10,
                          bottom: 10,
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: context.artC.porcelain.withOpacity(0.92),
                              borderRadius: BorderRadius.circular(kRadiusSmall),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  '作品标题 #${i + 1}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: context.artC.ink,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '艺术家名称',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w500,
                                    color: context.artC.ink.withOpacity(0.35),
                                    letterSpacing: 0.5,
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
                const SizedBox(height: 8),
                Text(
                  '先锋艺术探索系列',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: context.artC.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '创作过程 / 技法解析',
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

class _QaTab extends StatelessWidget {
  const _QaTab();

  @override
  Widget build(BuildContext context) {
    final questions = [
      (
        '艺术留学怎么选校？有哪些避坑指南？',
        '128 位艺术家已参与讨论',
        '留学申请'
      ),
      (
        '如何跟顶奢酒店达成长期艺术合作？',
        '86 位策展人已参与讨论',
        '市场与商业'
      ),
      (
        '一二级市场规则是什么？艺术家如何定价？',
        '210 位专业人士已参与讨论',
        '职业发展'
      ),
    ];

    final categories = [
      '留学申请',
      '专业学习',
      '职业发展',
      '市场与商业',
      '版权与法律',
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 问题列表
          ...questions.map((q) {
            return Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: context.artC.silver.withOpacity(0.15),
                borderRadius: BorderRadius.circular(kRadiusMedium),
                border: Border.all(color: Colors.transparent),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: kCobalt.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      q.$3,
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: kCobalt.withOpacity(0.7),
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    q.$1,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: context.artC.ink,
                      height: 1.35,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    q.$2,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: context.artC.ink.withOpacity(0.35),
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 10),
          // 分类卡片
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: context.artC.ink,
              borderRadius: BorderRadius.circular(kRadiusLarge),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '问答分类',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.white.withOpacity(0.55),
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 16),
                ...categories.map((c) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          c,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: Colors.white,
                          ),
                        ),
                        Icon(Icons.chevron_right, size: 16, color: Colors.white.withOpacity(0.4)),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // 提问按钮
          Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              color: kCobalt,
              borderRadius: BorderRadius.circular(999),
              boxShadow: [
                BoxShadow(
                  color: kCobalt.withOpacity(0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Center(
              child: Text(
                '我要提问',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 100),
        ],
      ),
    );
  }
}

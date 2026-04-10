import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import 'case_detail_screen.dart';
import 'new_case_screen.dart';

/// ═══════════════════════════════════════════════════════════════
/// 青花瓷典藏版 - 合作（案例）
/// ═══════════════════════════════════════════════════════════════

class CasesScreen extends StatefulWidget {
  const CasesScreen({super.key});

  @override
  State<CasesScreen> createState() => _CasesScreenState();
}

class _CasesScreenState extends State<CasesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<AppCase> _cases = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() => setState(() {}));
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final data = await SupabaseService.fetchCases();
    if (mounted) setState(() { _cases = data; _loading = false; });
  }

  List<AppCase> get _filtered {
    if (_tabController.index == 1) return _cases.where((c) => c.result == 'admitted').toList();
    if (_tabController.index == 2) return _cases.where((c) => c.result == 'waitlisted').toList();
    return _cases;
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = mainTabBottomInset(context);
    return Scaffold(
      backgroundColor: kPorcelain,
      appBar: AppBar(
        title: const Text(
          '合作案例',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: kInk,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          // 发布按钮
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: GestureDetector(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NewCaseScreen()),
              ).then((_) => _load()),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: kCobalt,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add, color: Colors.white, size: 16),
                    SizedBox(width: 4),
                    Text(
                      '发布',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: kCobalt,
          unselectedLabelColor: kInk.withOpacity(0.4),
          indicatorColor: kCobalt,
          indicatorWeight: 2.5,
          indicatorSize: TabBarIndicatorSize.label,
          labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          unselectedLabelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
          tabs: const [
            Tab(text: '全部案例'),
            Tab(text: '录取'),
            Tab(text: '等候'),
          ],
        ),
      ),
      body: RefreshIndicator(
        color: kCobalt,
        backgroundColor: Colors.white,
        onRefresh: _load,
        child: _loading
          ? const LoadingIndicator()
          : _filtered.isEmpty
            ? const EmptyState(emoji: '📝', message: '暂无案例，来第一个分享吧！')
            : ListView.builder(
                padding: EdgeInsets.fromLTRB(0, 12, 0, bottomPad),
                itemCount: _filtered.length,
                itemBuilder: (ctx, i) => _CaseCard(
                  c: _filtered[i],
                  onTap: () => Navigator.push(ctx, MaterialPageRoute(
                    builder: (_) => CaseDetailScreen(caseId: _filtered[i].id),
                  )),
                ),
              ),
      ),
    );
  }
}

/// ═══════════════════════════════════════════════════════════════
/// 案例卡片（青花瓷风格）
/// ═══════════════════════════════════════════════════════════════
class _CaseCard extends StatelessWidget {
  final AppCase c;
  final VoidCallback onTap;

  const _CaseCard({required this.c, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(kRadiusLarge),
          boxShadow: [
            BoxShadow(
              color: kInk.withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 顶部图片区域
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(kRadiusLarge)),
              child: Stack(
                children: [
                  Container(
                    height: 110,
                    decoration: BoxDecoration(
                      gradient: schoolGradient(c.targetSchool),
                    ),
                  ),
                  // 结果标签
                  Positioned(
                    top: 14,
                    right: 14,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: resultBadgeColor(c.result).withOpacity(0.9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        resultLabel(c.result),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  // 学校标签
                  if (c.targetSchool != null)
                    Positioned(
                      bottom: 14,
                      left: 14,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          c.targetSchool!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // 内容区域
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.excerpt ?? c.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: kInk,
                      height: 1.4,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  // 底部信息栏
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 12,
                        backgroundColor: kCobalt,
                        child: Text(
                          c.isAnonymous ? '匿' : (c.authorNickname?.substring(0, 1) ?? '?'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        c.isAnonymous ? '匿名' : (c.authorNickname ?? '用户'),
                        style: TextStyle(
                          fontSize: 12,
                          color: kInk.withOpacity(0.6),
                        ),
                      ),
                      if (c.gpa != null) ...[
                        Text(
                          ' · ',
                          style: TextStyle(color: kInk.withOpacity(0.3)),
                        ),
                        Text(
                          c.gpa!,
                          style: TextStyle(
                            fontSize: 11,
                            color: kInk.withOpacity(0.5),
                          ),
                        ),
                      ],
                      const Spacer(),
                      Icon(Icons.favorite_border, size: 14, color: kInk.withOpacity(0.3)),
                      const SizedBox(width: 4),
                      Text(
                        '${c.likeCount}',
                        style: TextStyle(
                          fontSize: 11,
                          color: kInk.withOpacity(0.4),
                        ),
                      ),
                    ],
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

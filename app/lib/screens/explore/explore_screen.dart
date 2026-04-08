import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import 'program_detail_screen.dart';

/// ═══════════════════════════════════════════════════════════════
/// 青花瓷典藏版 - 发现（探索院校）
/// ═══════════════════════════════════════════════════════════════

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  List<AppProgram> _programs = [];
  List<AppProgram> _filtered = [];
  bool _loading = true;
  String _search = '';
  String _degreeFilter = '全部';
  String _majorFilter = '全部';

  final List<String> _degreeOptions = ['全部', 'MA', 'MFA', 'MArch', 'MSc'];
  final List<String> _majorOptions = ['全部', '纯艺', '建筑', '设计', '插画', 'IDE'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await SupabaseService.fetchPrograms();
    if (mounted) {
      setState(() {
        _programs = data;
        _filter();
        _loading = false;
      });
    }
  }

  void _filter() {
    var list = _programs;
    if (_degreeFilter != '全部') {
      list = list.where((p) => p.degreeType?.contains(_degreeFilter) == true || p.programName.contains(_degreeFilter)).toList();
    }
    if (_majorFilter != '全部') {
      list = list.where((p) => p.programName.contains(_majorFilter)).toList();
    }
    if (_search.isNotEmpty) {
      list = list.where((p) =>
        p.programName.contains(_search) ||
        (p.schoolNameZh?.contains(_search) ?? false)
      ).toList();
    }
    _filtered = list;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kPorcelain,
      body: CustomScrollView(
        slivers: [
          // ═══════════════════════════════════════════════════
          // 顶部搜索栏（青花瓷风格）
          // ═══════════════════════════════════════════════════
          SliverAppBar(
            floating: true,
            snap: true,
            backgroundColor: Colors.white,
            elevation: 0,
            title: const Text(
              '发现院校',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: kInk,
              ),
            ),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(60),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
                child: Container(
                  decoration: BoxDecoration(
                    color: kSilver.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(kRadiusMedium),
                  ),
                  child: TextField(
                    onChanged: (v) => setState(() { _search = v; _filter(); }),
                    decoration: InputDecoration(
                      hintText: '搜索学校或专业...',
                      hintStyle: TextStyle(
                        fontSize: 13,
                        color: kInk.withOpacity(0.4),
                      ),
                      prefixIcon: Icon(Icons.search, size: 20, color: kInk.withOpacity(0.4)),
                      filled: false,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ═══════════════════════════════════════════════════
          // 学位筛选
          // ═══════════════════════════════════════════════════
          SliverToBoxAdapter(
            child: SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: _degreeOptions.map((d) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: TagChip(
                    label: d,
                    active: _degreeFilter == d,
                    onTap: () => setState(() { _degreeFilter = d; _filter(); }),
                  ),
                )).toList(),
              ),
            ),
          ),

          // ═══════════════════════════════════════════════════
          // 专业筛选
          // ═══════════════════════════════════════════════════
          SliverToBoxAdapter(
            child: SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: _majorOptions.map((m) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: TagChip(
                    label: m,
                    active: _majorFilter == m,
                    onTap: () => setState(() { _majorFilter = m; _filter(); }),
                  ),
                )).toList(),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 12)),

          if (_loading)
            const SliverFillRemaining(child: LoadingIndicator())
          else if (_filtered.isEmpty)
            const SliverFillRemaining(child: EmptyState(emoji: '🔍', message: '没有找到匹配的项目'))
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => _ProgramCard(
                  program: _filtered[i],
                  onTap: () => Navigator.push(ctx, MaterialPageRoute(
                    builder: (_) => ProgramDetailScreen(programId: _filtered[i].id),
                  )),
                ),
                childCount: _filtered.length,
              ),
            ),

          // 底部留白
          const SliverToBoxAdapter(child: SizedBox(height: 20)),
        ],
      ),
    );
  }
}

/// ═══════════════════════════════════════════════════════════════
/// 项目卡片（青花瓷风格）
/// ═══════════════════════════════════════════════════════════════
class _ProgramCard extends StatelessWidget {
  final AppProgram program;
  final VoidCallback onTap;

  const _ProgramCard({required this.program, required this.onTap});

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
          children: [
            // 顶部学校信息
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(kRadiusLarge)),
              child: Container(
                height: 90,
                decoration: BoxDecoration(
                  gradient: schoolGradient(program.schoolNameZh),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            program.schoolNameZh ?? '',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            program.programName,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    if (program.qsArtRank != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(kRadiusSmall),
                        ),
                        child: Text(
                          'QS #${program.qsArtRank}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            // 底部信息
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  _MetaChip(icon: Icons.school_outlined, label: program.degreeType ?? 'MA'),
                  const SizedBox(width: 12),
                  if (program.ieltsOverall != null)
                    _MetaChip(icon: Icons.language_outlined, label: 'IELTS ${program.ieltsOverall}'),
                  if (program.ieltsOverall != null) const SizedBox(width: 12),
                  if (program.durationText != null)
                    _MetaChip(icon: Icons.schedule_outlined, label: program.durationText!),
                  const Spacer(),
                  if (program.requiresPortfolio)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: kCobalt.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        '需作品集',
                        style: TextStyle(
                          fontSize: 10,
                          color: kCobalt,
                          fontWeight: FontWeight.w600,
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
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _MetaChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: kInk.withOpacity(0.4)),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: kInk.withOpacity(0.6),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import '../../widgets/common.dart';
import '../../theme/artsee_ui_colors.dart';
import '../../services/backend_api_service.dart';
import '../main_scaffold.dart';
import '../tools/ai_consult_screen.dart';
import '../tools/writing_helper_screen.dart';
import '../tools/art_calculator_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _aiMode = true;
  final TextEditingController _queryCtrl = TextEditingController();
  List<Map<String, dynamic>> _recommendCards = [];

  @override
  void initState() {
    super.initState();
    _loadRecommendCards();
  }

  @override
  void dispose() {
    _queryCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadRecommendCards() async {
    try {
      final cards = await BackendApiService.fetchAiRecommendCards();
      if (mounted) setState(() => _recommendCards = cards);
    } catch (_) {
    }
  }

  void _openAi([String? query]) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => AiConsultScreen(initialQuery: query),
      ),
    );
  }

  void _submitHeroQuery([String? preset]) {
    final query = (preset ?? _queryCtrl.text).trim();
    if (!_aiMode) {
      _openSchools();
      return;
    }
    _openAi(query.isEmpty ? null : query);
  }

  void _openSchools() {
    // 打开 AI 咨询界面，并切换到"对比选校"标签页
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const AiConsultScreen(initialTabIndex: 1),
      ),
    );
  }

  void _openInspiration() {
    // 切换到底部导航的"灵感"标签页（索引 2）
    final mainScaffold = MainScaffold.globalKey.currentState;
    mainScaffold?.switchToTab(2);
  }

  void _openWritingHelper() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const WritingHelperScreen()),
    );
  }

  void _openCalculator() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const ArtCalculatorScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(20, 36, 20, bottom),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _BrandHeader(onTap: _openAi),
            const SizedBox(height: 12),
            _AiSearchCard(
              aiMode: _aiMode,
              controller: _queryCtrl,
              onModeChanged: (value) => setState(() => _aiMode = value),
              onSubmit: () => _submitHeroQuery(),
            ),
            const SizedBox(height: 10),
            _SuggestionStrip(onTap: _submitHeroQuery),
            const SizedBox(height: 10),
            _ToolGrid(
              onSchools: _openSchools,
              onInspiration: _openInspiration,
              onWriting: _openWritingHelper,
              onCalculator: _openCalculator,
            ),
            if (_recommendCards.isNotEmpty) ...[
              const SizedBox(height: 20),
              _SectionTitle(
                title: 'AI 为你推荐',
                subtitle: 'Personalized for you',
              ),
              const SizedBox(height: 14),
              ..._recommendCards.map((card) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _RecommendCard(card: card),
                  )),
            ],
          ],
        ),
      ),
    );
  }
}

class _BrandHeader extends StatelessWidget {
  final VoidCallback onTap;

  const _BrandHeader({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GestureDetector(
          onTap: onTap,
          child: Stack(
            alignment: Alignment.bottomCenter,
            children: [
              Text(
                'artiqore',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 42,
                  height: 0.95,
                  fontWeight: FontWeight.w900,
                  fontStyle: FontStyle.italic,
                  letterSpacing: -4,
                  fontFamily: 'Noto Serif SC',
                  color: context.artC.ink,
                ),
              ),
              Container(
                width: 140,
                height: 2.5,
                margin: const EdgeInsets.only(bottom: 1),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(999),
                  gradient: const LinearGradient(
                    colors: [Color(0x667C3AED), Color(0x66003399), Color(0x6634D399)],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _hairline(context),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                '艺见心',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 6,
                  color: context.artC.ink.withOpacity(0.3),
                ),
              ),
            ),
            _hairline(context),
          ],
        ),
      ],
    );
  }

  Widget _hairline(BuildContext context) {
    return Container(
      width: 28,
      height: 1,
      color: context.artC.ink.withOpacity(0.06),
    );
  }
}

class _AiSearchCard extends StatelessWidget {
  final bool aiMode;
  final TextEditingController controller;
  final ValueChanged<bool> onModeChanged;
  final VoidCallback onSubmit;

  const _AiSearchCard({
    required this.aiMode,
    required this.controller,
    required this.onModeChanged,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: context.artC.silver.withOpacity(0.35)),
        boxShadow: [
          BoxShadow(
            color: kCobalt.withOpacity(0.08),
            blurRadius: 42,
            offset: const Offset(0, 24),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.zero,
            decoration: BoxDecoration(
              color: context.artC.porcelain.withOpacity(0.55),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _ModeTab(
                  label: '搜索',
                  active: !aiMode,
                  color: kCobalt,
                  onTap: () => onModeChanged(false),
                ),
                _ModeTab(
                  label: '意见 AI',
                  active: aiMode,
                  color: const Color(0xFF7C3AED),
                  onTap: () => onModeChanged(true),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 10, 18),
            child: Row(
              children: [
                Icon(
                  aiMode ? Icons.auto_awesome : Icons.search,
                  color: aiMode ? const Color(0xFF7C3AED) : kCobalt,
                  size: 20,
                ),
                const SizedBox(width: 9),
                Expanded(
                  child: TextField(
                    controller: controller,
                    readOnly: true,
                    showCursor: false,
                    enableInteractiveSelection: false,
                    textInputAction: TextInputAction.search,
                    onTap: onSubmit,
                    onSubmitted: (_) => onSubmit(),
                    decoration: InputDecoration(
                      hintText: aiMode ? '问我：如何优化作品集叙事？' : '搜索院校、专业、展览、帖子',
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                      hintStyle: TextStyle(
                        fontSize: 13.5,
                        color: context.artC.ink.withOpacity(0.38),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    style: TextStyle(
                      fontSize: 13.5,
                      color: context.artC.ink.withOpacity(0.78),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: onSubmit,
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: context.artC.ink,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.arrow_forward, color: Colors.white, size: 23),
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

class _ModeTab extends StatelessWidget {
  final String label;
  final bool active;
  final Color color;
  final VoidCallback onTap;

  const _ModeTab({
    required this.label,
    required this.active,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.4,
                color: active ? color : context.artC.ink.withOpacity(0.2),
              ),
            ),
            const SizedBox(height: 9),
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: active ? 42 : 0,
              height: 2,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SuggestionStrip extends StatelessWidget {
  final ValueChanged<String> onTap;

  const _SuggestionStrip({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final items = ['AI 辅助艺术创作', 'RCA vs UAL 怎么选', '作品集诊断评分'];
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      alignment: WrapAlignment.center,
      children: items.map((item) {
        return GestureDetector(
          onTap: () => onTap(item),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: context.artC.silver.withOpacity(0.35)),
            ),
            child: Text(
              item,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: context.artC.ink.withOpacity(0.46),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _ToolGrid extends StatelessWidget {
  final VoidCallback onSchools;
  final VoidCallback onInspiration;
  final VoidCallback onWriting;
  final VoidCallback onCalculator;

  const _ToolGrid({
    required this.onSchools,
    required this.onInspiration,
    required this.onWriting,
    required this.onCalculator,
  });

  @override
  Widget build(BuildContext context) {
    final tools = [
      (Icons.public, '院校AI比对', kCobalt, onSchools),
      (Icons.auto_awesome, '灵感广场', const Color(0xFF7C3AED), onInspiration),
      (Icons.description_outlined, '文书助手', const Color(0xFFE11D48), onWriting),
      (Icons.calculate_outlined, '艺术计算器', const Color(0xFF059669), onCalculator),
    ];

    return SizedBox(
      height: 74,
      child: Row(
        children: tools.map((tool) {
          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: tool == tools.last ? 0 : 8),
              child: GestureDetector(
                onTap: tool.$4,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(17),
                    border: Border.all(
                      color: context.artC.silver.withOpacity(0.35),
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(tool.$1, color: tool.$3, size: 22),
                      const SizedBox(height: 5),
                      Text(
                        tool.$2,
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          color: context.artC.ink.withOpacity(0.58),
                          height: 1.0,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionTitle({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: context.artC.ink,
            fontFamily: 'Noto Serif SC',
          ),
        ),
        Text(
          subtitle,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.4,
            color: context.artC.ink.withOpacity(0.25),
          ),
        ),
      ],
    );
  }
}

class _RecommendCard extends StatelessWidget {
  final Map<String, dynamic> card;

  const _RecommendCard({required this.card});

  @override
  Widget build(BuildContext context) {
    final cardType = card['card_type'] as String? ?? 'unknown';
    final title = card['title'] as String? ?? '推荐';
    final subtitle = card['reason'] as String? ?? '';

    IconData icon;
    Color color;
    switch (cardType) {
      case 'school':
        icon = Icons.school_outlined;
        color = kCobalt;
        break;
      case 'event':
        icon = Icons.event_outlined;
        color = const Color(0xFFE11D48);
        break;
      case 'opportunity':
        icon = Icons.work_outline;
        color = const Color(0xFF7C3AED);
        break;
      case 'artwork':
        icon = Icons.palette_outlined;
        color = const Color(0xFF059669);
        break;
      case 'course':
        icon = Icons.book_outlined;
        color = const Color(0xFFF59E0B);
        break;
      default:
        icon = Icons.star_outline;
        color = kCobalt;
    }

    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: context.artC.silver.withOpacity(0.35)),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: color.withOpacity(0.08),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: context.artC.ink,
                    ),
                  ),
                  if (subtitle.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 10,
                        color: context.artC.ink.withOpacity(0.4),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            Icon(Icons.chevron_right, size: 16, color: context.artC.ink.withOpacity(0.2)),
          ],
        ),
      ),
    );
  }
}

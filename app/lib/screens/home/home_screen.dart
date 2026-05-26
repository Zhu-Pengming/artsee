import 'package:flutter/material.dart';
import '../../widgets/common.dart';
import '../../theme/artsee_ui_colors.dart';
import '../tools/ai_consult_screen.dart';
import '../schools/school_list_screen.dart';
import '../forum/forum_screen.dart';
import '../explore/explore_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _aiMode = true;

  void _openAi() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const AiConsultScreen()),
    );
  }

  void _openSchools() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const SchoolListScreen()),
    );
  }

  void _openInspiration() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const ExploreScreen()),
    );
  }

  void _openCommunity() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const ForumScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(20, 24, 20, bottom),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 28),
              _BrandHeader(onTap: _openAi),
              const SizedBox(height: 28),
              _AiSearchCard(
                aiMode: _aiMode,
                onModeChanged: (value) => setState(() => _aiMode = value),
                onSubmit: _openAi,
              ),
              const SizedBox(height: 18),
              _SuggestionStrip(onTap: _openAi),
              const SizedBox(height: 28),
              _ToolGrid(
                onSchools: _openSchools,
                onInspiration: _openInspiration,
                onWriting: _openAi,
                onCalculator: _openAi,
              ),
              const SizedBox(height: 28),
              _EditorialBanner(onTap: _openCommunity),
              const SizedBox(height: 28),
              _SectionTitle(
                title: '艺见心导航',
                subtitle: 'Start from one clear next step',
              ),
              const SizedBox(height: 14),
              _QuickRouteCard(
                icon: Icons.school_outlined,
                title: '院校 AI 比对',
                subtitle: '从 RCA、RISD、UAL 到全球艺术院校，建立申请策略。',
                onTap: _openSchools,
              ),
              const SizedBox(height: 12),
              _QuickRouteCard(
                icon: Icons.auto_awesome_mosaic_outlined,
                title: '灵感广场',
                subtitle: '浏览作品、展览、趋势与申请经验，把灵感沉淀成作品集线索。',
                onTap: _openInspiration,
              ),
              const SizedBox(height: 12),
              _QuickRouteCard(
                icon: Icons.forum_outlined,
                title: '社区与问答',
                subtitle: '进入创作者、导师和申请者的实时讨论场。',
                onTap: _openCommunity,
              ),
            ],
          ),
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
                  fontSize: 56,
                  height: 0.95,
                  fontWeight: FontWeight.w900,
                  fontStyle: FontStyle.italic,
                  letterSpacing: -5,
                  fontFamily: 'Noto Serif SC',
                  color: context.artC.ink,
                ),
              ),
              Container(
                width: 190,
                height: 3,
                margin: const EdgeInsets.only(bottom: 2),
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
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _hairline(context),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                '艺见心',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 8,
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
  final ValueChanged<bool> onModeChanged;
  final VoidCallback onSubmit;

  const _AiSearchCard({
    required this.aiMode,
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
            padding: const EdgeInsets.symmetric(horizontal: 18),
            decoration: BoxDecoration(
              color: context.artC.porcelain.withOpacity(0.55),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            ),
            child: Row(
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
            padding: const EdgeInsets.fromLTRB(22, 20, 14, 20),
            child: Row(
              children: [
                Icon(
                  aiMode ? Icons.auto_awesome : Icons.search,
                  color: aiMode ? const Color(0xFF7C3AED) : kCobalt,
                  size: 22,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    aiMode ? '问我：如何优化作品集叙事？' : '搜索院校、专业、展览、帖子',
                    style: TextStyle(
                      fontSize: 15,
                      color: context.artC.ink.withOpacity(0.38),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: onSubmit,
                  child: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: context.artC.ink,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(Icons.arrow_forward, color: Colors.white),
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
  final VoidCallback onTap;

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
          onTap: onTap,
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

    return GridView.count(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      crossAxisCount: 4,
      mainAxisSpacing: 12,
      crossAxisSpacing: 10,
      children: tools.map((tool) {
        return GestureDetector(
          onTap: tool.$4,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: context.artC.silver.withOpacity(0.35)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(tool.$1, color: tool.$3, size: 24),
                const SizedBox(height: 10),
                Text(
                  tool.$2,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: context.artC.ink.withOpacity(0.58),
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _EditorialBanner extends StatelessWidget {
  final VoidCallback onTap;

  const _EditorialBanner({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 150,
        decoration: BoxDecoration(
          color: context.artC.ink,
          borderRadius: BorderRadius.circular(32),
          image: const DecorationImage(
            image: NetworkImage('https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1500'),
            fit: BoxFit.cover,
            colorFilter: ColorFilter.mode(Color(0x991A1A1A), BlendMode.darken),
          ),
          boxShadow: [
            BoxShadow(
              color: context.artC.ink.withOpacity(0.16),
              blurRadius: 28,
              offset: const Offset(0, 14),
            ),
          ],
        ),
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Text(
              '灵感碎片的万合',
              style: TextStyle(
                fontSize: 24,
                height: 1,
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontFamily: 'Noto Serif SC',
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '从灵感、院校、社区到作品集行动',
              style: TextStyle(
                fontSize: 11,
                color: Colors.white.withOpacity(0.58),
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
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

class _QuickRouteCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _QuickRouteCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: context.artC.silver.withOpacity(0.35)),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: kCobalt.withOpacity(0.06),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(icon, color: kCobalt),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      height: 1.45,
                      color: context.artC.ink.withOpacity(0.42),
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward, size: 18, color: context.artC.ink.withOpacity(0.22)),
          ],
        ),
      ),
    );
  }
}

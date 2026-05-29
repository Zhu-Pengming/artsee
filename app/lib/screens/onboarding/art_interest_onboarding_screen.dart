import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class ArtInterestOnboardingScreen extends StatefulWidget {
  const ArtInterestOnboardingScreen({super.key, required this.onCompleted});

  final VoidCallback onCompleted;

  @override
  State<ArtInterestOnboardingScreen> createState() =>
      _ArtInterestOnboardingScreenState();
}

class _ArtInterestOnboardingScreenState
    extends State<ArtInterestOnboardingScreen> {
  int _step = 0;
  bool _saving = false;
  String? _error;

  String? _role;
  final Set<String> _goals = {};
  final Set<String> _directions = {};
  final Set<String> _majors = {};
  String? _city;
  final Set<String> _activityCities = {};
  final Set<String> _eventPreferences = {};
  String? _stage;
  String _verificationIntent = 'later';

  static const _cities = [
    '北京',
    '上海',
    '杭州',
    '广州',
    '深圳',
    '成都',
    '伦敦',
    '纽约',
    '巴黎',
    '米兰',
  ];

  static const _events = [
    '艺术讲座',
    '创作工作坊',
    '藏品私享会',
    '艺术晚宴 / 酒会',
    '展览开幕',
    '高端酒店艺术沙龙',
  ];

  static const _directionGroups = [
    _DirectionGroup('fine_art', '纯艺', [
      '国画',
      '油画',
      '水彩',
      '版画',
      '雕塑',
      '装置',
      '综合材料',
      '当代艺术',
    ]),
    _DirectionGroup('design', '设计', [
      '平面设计',
      '工业设计',
      '空间设计',
      '珠宝设计',
      '服装设计',
      '文创设计',
      '品牌视觉',
      '数字媒体',
    ]),
    _DirectionGroup('contemporary', '先锋 / 当代艺术', [
      '行为艺术',
      '实验影像',
      '声音艺术',
      '新媒体',
      '策展',
      '公共艺术',
    ]),
    _DirectionGroup('documentary', '纪实 / 影像', [
      '摄影',
      '纪录片',
      '视觉叙事',
      '影像装置',
    ]),
    _DirectionGroup('education_market', '教育 / 市场 / 空间', [
      '艺术教育',
      '艺术市场',
      '收藏鉴赏',
      '高端文旅',
      '空间艺术',
    ]),
  ];

  List<_Choice> get _roleChoices => const [
        _Choice(
          id: 'student',
          title: '艺术学子',
          subtitle: '留学、考研、作品集、课程与实训',
          icon: Icons.school_outlined,
        ),
        _Choice(
          id: 'artist',
          title: '专业艺术家',
          subtitle: '展示作品、申请展览、品牌合作与联名',
          icon: Icons.palette_outlined,
        ),
        _Choice(
          id: 'collector',
          title: '艺术爱好者 / 收藏者',
          subtitle: '活动、鉴赏、收藏与高端艺术体验',
          icon: Icons.diamond_outlined,
        ),
      ];

  List<_Choice> get _goalChoices {
    switch (_role) {
      case 'artist':
        return const [
          _Choice(id: 'show_artworks', title: '展示作品'),
          _Choice(id: 'apply_exhibition', title: '申请展览'),
          _Choice(id: 'brand_cooperation', title: '对接品牌合作'),
          _Choice(id: 'hotel_events', title: '参加顶奢酒店艺术活动'),
          _Choice(id: 'joint_project', title: '做联名项目'),
          _Choice(id: 'artwork_license', title: '出售作品 / 版权授权'),
          _Choice(id: 'industry_influence', title: '扩大行业影响力'),
        ];
      case 'collector':
        return const [
          _Choice(id: 'art_salon', title: '参加艺术沙龙'),
          _Choice(id: 'private_view', title: '看展览 / 私享会'),
          _Choice(id: 'collect_artworks', title: '收藏艺术作品'),
          _Choice(id: 'meet_artists', title: '认识艺术家'),
          _Choice(id: 'art_market', title: '了解艺术市场'),
          _Choice(id: 'art_appreciation', title: '学习艺术鉴赏'),
          _Choice(id: 'hotel_events', title: '参加高端酒店艺术活动'),
        ];
      default:
        return const [
          _Choice(id: 'art_abroad', title: '准备艺术留学'),
          _Choice(id: 'postgraduate', title: '准备考研 / 升学'),
          _Choice(id: 'portfolio', title: '提升作品集'),
          _Choice(id: 'course_mentor', title: '找课程 / 导师'),
          _Choice(id: 'internship', title: '找实习 / 实训机会'),
          _Choice(id: 'global_news', title: '看国际艺术资讯'),
          _Choice(id: 'art_events', title: '参加艺术活动'),
        ];
    }
  }

  List<_Choice> get _stageChoices {
    switch (_role) {
      case 'artist':
        return const [
          _Choice(id: 'emerging_creator', title: '新锐创作者'),
          _Choice(id: 'portfolio_ready', title: '有完整作品集'),
          _Choice(id: 'exhibited', title: '有展览经历'),
          _Choice(id: 'commercial_experience', title: '有商业合作经历'),
          _Choice(id: 'stable_sales', title: '有稳定收藏 / 销售记录'),
          _Choice(id: 'mature_artist', title: '已有成熟艺术家履历'),
        ];
      case 'collector':
        return const [
          _Choice(id: 'beginner', title: '刚开始了解艺术'),
          _Choice(id: 'frequent_exhibition', title: '经常看展'),
          _Choice(id: 'event_experience', title: '参加过艺术活动'),
          _Choice(id: 'collection_experience', title: '有收藏经验'),
          _Choice(id: 'market_focus', title: '关注艺术市场'),
          _Choice(id: 'high_end_circle', title: '希望进入高端艺术圈层'),
        ];
      default:
        return const [
          _Choice(id: 'exploring', title: '刚开始了解艺术留学 / 考研'),
          _Choice(id: 'target_ready', title: '已确定目标国家 / 学校'),
          _Choice(id: 'portfolio_preparing', title: '正在准备作品集'),
          _Choice(id: 'works_ready', title: '已有部分作品'),
          _Choice(id: 'applying', title: '正在申请中'),
          _Choice(id: 'admitted', title: '已录取 / 已在读'),
        ];
    }
  }

  String get _roleLabel =>
      _roleChoices.firstWhere((item) => item.id == _role,
          orElse: () => _roleChoices.first).title;

  bool get _canContinue {
    switch (_step) {
      case 0:
        return true;
      case 1:
        return _role != null;
      case 2:
        return _goals.isNotEmpty;
      case 3:
        return _directions.isNotEmpty && _majors.isNotEmpty;
      case 4:
        return _city != null && _eventPreferences.isNotEmpty;
      case 5:
        return _stage != null;
      case 6:
      case 7:
        return true;
      default:
        return false;
    }
  }

  void _next() {
    if (!_canContinue) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('先完成这一项，再继续建立画像')),
      );
      return;
    }
    if (_step < 7) {
      setState(() => _step += 1);
    } else {
      _submit();
    }
  }

  void _back() {
    if (_step == 0) return;
    setState(() => _step -= 1);
  }

  void _toggle(Set<String> target, String value, {int max = 12}) {
    setState(() {
      if (target.contains(value)) {
        target.remove(value);
      } else if (target.length < max) {
        target.add(value);
      }
    });
  }

  Future<void> _submit() async {
    if (_saving) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final userId = SupabaseService.currentUser?.id;
      if (userId == null) throw Exception('用户未登录');
      await BackendApiService.completeOnboarding(
        userId: userId,
        interestedCategories: [..._directions, ..._majors],
        userRole: _role,
        userType: _role,
        primaryGoal: _goals.isEmpty ? null : _goals.first,
        goals: _goals.toList(),
        targetDirections: _directions.toList(),
        targetMajors: _majors.toList(),
        cityPreference: _city,
        activityCities: _activityCities.isEmpty ? [_city!] : _activityCities.toList(),
        eventPreferences: _eventPreferences.toList(),
        currentStage: _stage,
        verificationIntent: _verificationIntent,
      );
      widget.onCompleted();
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        child: Column(
          children: [
            _TopProgress(step: _step, total: 8, onBack: _step == 0 ? null : _back),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 10, 22, 24),
                children: [
                  _buildStep(),
                  if (_error != null) ...[
                    const SizedBox(height: 14),
                    Text(
                      _error!,
                      style: const TextStyle(color: Color(0xFFE11D48), fontSize: 12),
                    ),
                  ],
                ],
              ),
            ),
            _BottomActions(
              step: _step,
              saving: _saving,
              canContinue: _canContinue,
              onSkip: widget.onCompleted,
              onContinue: _next,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 0:
        return _WelcomeStep(onStart: _next, onSkip: widget.onCompleted);
      case 1:
        return _QuestionStep(
          eyebrow: 'Identity',
          title: '你目前更接近哪一种艺术身份？',
          subtitle: '这会影响我们为你推荐的内容、活动和机会。',
          child: _ChoiceList(
            choices: _roleChoices,
            selected: _role == null ? const {} : {_role!},
            onTap: (id) => setState(() {
              _role = id;
              _goals.clear();
              _stage = null;
            }),
          ),
        );
      case 2:
        return _QuestionStep(
          eyebrow: 'Intent',
          title: _role == 'artist'
              ? '你希望平台主要帮你完成什么？'
              : _role == 'collector'
                  ? '你更感兴趣的艺术体验是什么？'
                  : '你现在最想解决什么问题？',
          subtitle: '可以多选，我们会优先组织你的首页推荐。',
          child: _ChipWrap(
            choices: _goalChoices,
            selected: _goals,
            onTap: (id) => _toggle(_goals, id, max: 4),
          ),
        );
      case 3:
        return _QuestionStep(
          eyebrow: 'Direction',
          title: '你关注哪些艺术方向？',
          subtitle: '先选一级方向，再选具体门类。最多选择 5 个具体方向。',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ChipWrap(
                choices: _directionGroups
                    .map((item) => _Choice(id: item.id, title: item.label))
                    .toList(),
                selected: _directions,
                onTap: (id) => _toggle(_directions, id, max: 4),
              ),
              const SizedBox(height: 18),
              ..._directionGroups
                  .where((group) => _directions.contains(group.id))
                  .map(
                    (group) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            group.label,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: context.artC.ink,
                            ),
                          ),
                          const SizedBox(height: 8),
                          _TextChipWrap(
                            items: group.majors,
                            selected: _majors,
                            max: 5,
                            onTap: (item) => _toggle(_majors, item, max: 5),
                          ),
                        ],
                      ),
                    ),
                  ),
            ],
          ),
        );
      case 4:
        return _QuestionStep(
          eyebrow: 'Place',
          title: '你主要在哪座城市活动？',
          subtitle: '活动推荐会优先匹配你常驻和愿意参加线下活动的城市。',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _TextChipWrap(
                items: _cities,
                selected: _city == null ? const {} : {_city!},
                onTap: (city) => setState(() {
                  _city = city;
                  _activityCities.add(city);
                }),
              ),
              const SizedBox(height: 20),
              Text(
                '你愿意参加哪类线下艺术活动？',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: context.artC.ink,
                ),
              ),
              const SizedBox(height: 10),
              _TextChipWrap(
                items: _events,
                selected: _eventPreferences,
                onTap: (item) => _toggle(_eventPreferences, item, max: 4),
              ),
            ],
          ),
        );
      case 5:
        return _QuestionStep(
          eyebrow: 'Stage',
          title: '你目前处于哪个阶段？',
          subtitle: '我们会据此控制推荐深度，避免一上来给你不合适的信息。',
          child: _ChoiceList(
            choices: _stageChoices,
            selected: _stage == null ? const {} : {_stage!},
            compact: true,
            onTap: (id) => setState(() => _stage = id),
          ),
        );
      case 6:
        return _VerificationStep(
          roleLabel: _roleLabel,
          role: _role ?? 'student',
          intent: _verificationIntent,
          onChanged: (value) => setState(() => _verificationIntent = value),
        );
      default:
        return _SummaryStep(
          roleLabel: _roleLabel,
          stage: _stageChoices
              .firstWhere((item) => item.id == _stage,
                  orElse: () => const _Choice(id: '', title: '待补全'))
              .title,
          majors: _majors.toList(),
          goals: _goalChoices
              .where((item) => _goals.contains(item.id))
              .map((item) => item.title)
              .toList(),
          city: _city ?? '待补全',
          events: _eventPreferences.toList(),
        );
    }
  }
}

class _TopProgress extends StatelessWidget {
  final int step;
  final int total;
  final VoidCallback? onBack;

  const _TopProgress({required this.step, required this.total, this.onBack});

  @override
  Widget build(BuildContext context) {
    final progress = (step + 1) / total;
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 10, 18, 6),
      child: Row(
        children: [
          IconButton(
            onPressed: onBack,
            icon: Icon(
              Icons.arrow_back_ios_new,
              size: 17,
              color: onBack == null
                  ? Colors.transparent
                  : context.artC.ink.withOpacity(0.7),
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 3,
                backgroundColor: context.artC.silver.withOpacity(0.28),
                valueColor: const AlwaysStoppedAnimation<Color>(kCobalt),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            '${step + 1} / $total',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: context.artC.ink.withOpacity(0.38),
            ),
          ),
        ],
      ),
    );
  }
}

class _WelcomeStep extends StatelessWidget {
  final VoidCallback onStart;
  final VoidCallback onSkip;

  const _WelcomeStep({required this.onStart, required this.onSkip});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 34),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: kCobalt,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [kShadowCard],
            ),
            child: const Icon(Icons.auto_awesome, color: Colors.white, size: 28),
          ),
          const SizedBox(height: 28),
          Text(
            '建立你的艺术身份档案',
            style: TextStyle(
              fontSize: 30,
              height: 1.08,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            '艺术学习、创作展示、顶奢活动、商业合作与作品变现，将被整合成你的个人艺术路径。',
            style: TextStyle(
              fontSize: 15,
              height: 1.7,
              color: context.artC.ink.withOpacity(0.58),
            ),
          ),
          const SizedBox(height: 34),
          _PorcelainPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _MiniLine(icon: Icons.psychology_outlined, text: '1 分钟生成初始艺术画像'),
                _MiniLine(icon: Icons.event_available_outlined, text: '为首页 AI、活动和课程推荐建立上下文'),
                _MiniLine(icon: Icons.verified_outlined, text: '认证可稍后完成，不会强制打断'),
              ],
            ),
          ),
          const SizedBox(height: 26),
          _PrimaryButton(label: '开始建立我的艺术画像', onPressed: onStart),
          const SizedBox(height: 10),
          _GhostButton(label: '先随便看看', onPressed: onSkip),
        ],
      ),
    );
  }
}

class _QuestionStep extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String subtitle;
  final Widget child;

  const _QuestionStep({
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 18),
        Text(
          eyebrow.toUpperCase(),
          style: const TextStyle(
            color: kCobalt,
            fontSize: 11,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.6,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          title,
          style: TextStyle(
            fontSize: 25,
            height: 1.18,
            fontWeight: FontWeight.w900,
            color: context.artC.ink,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          subtitle,
          style: TextStyle(
            fontSize: 13,
            height: 1.55,
            color: context.artC.ink.withOpacity(0.48),
          ),
        ),
        const SizedBox(height: 24),
        child,
      ],
    );
  }
}

class _ChoiceList extends StatelessWidget {
  final List<_Choice> choices;
  final Set<String> selected;
  final ValueChanged<String> onTap;
  final bool compact;

  const _ChoiceList({
    required this.choices,
    required this.selected,
    required this.onTap,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: choices.map((choice) {
        final on = selected.contains(choice.id);
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _SelectableCard(
            selected: on,
            icon: choice.icon,
            title: choice.title,
            subtitle: choice.subtitle,
            compact: compact,
            onTap: () => onTap(choice.id),
          ),
        );
      }).toList(),
    );
  }
}

class _ChipWrap extends StatelessWidget {
  final List<_Choice> choices;
  final Set<String> selected;
  final ValueChanged<String> onTap;

  const _ChipWrap({
    required this.choices,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: choices.map((choice) {
        final on = selected.contains(choice.id);
        return _Pill(
          label: choice.title,
          selected: on,
          onTap: () => onTap(choice.id),
        );
      }).toList(),
    );
  }
}

class _TextChipWrap extends StatelessWidget {
  final List<String> items;
  final Set<String> selected;
  final ValueChanged<String> onTap;
  final int max;

  const _TextChipWrap({
    required this.items,
    required this.selected,
    required this.onTap,
    this.max = 12,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: items.map((item) {
        final on = selected.contains(item);
        return _Pill(
          label: item,
          selected: on,
          onTap: () {
            if (!on && selected.length >= max) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('最多选择 $max 项')),
              );
              return;
            }
            onTap(item);
          },
        );
      }).toList(),
    );
  }
}

class _VerificationStep extends StatelessWidget {
  final String roleLabel;
  final String role;
  final String intent;
  final ValueChanged<String> onChanged;

  const _VerificationStep({
    required this.roleLabel,
    required this.role,
    required this.intent,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final copy = switch (role) {
      'artist' => (
          need: '作品集、展览经历、合作案例',
          unlock: '品牌合作、作品售卖、B 端邀约、联名项目',
        ),
      'collector' => (
          need: '收藏证明、活动记录或会员资料',
          unlock: '私享会邀请、藏品预约、高端活动优先报名',
        ),
      _ => (
          need: '学生证、录取通知书或在读证明',
          unlock: '申请工具箱、完整院校数据、实训机会、作品集指导',
        ),
    };
    return _QuestionStep(
      eyebrow: 'Verification',
      title: '完成认证后，你可以解锁更多专属权限。',
      subtitle: '认证不会强制进行。你可以先进入首页，之后在「我的」里补全。',
      child: Column(
        children: [
          _PorcelainPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$roleLabel认证',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
                const SizedBox(height: 12),
                _MiniLine(icon: Icons.assignment_outlined, text: '需要：${copy.need}'),
                _MiniLine(icon: Icons.lock_open_outlined, text: '解锁：${copy.unlock}'),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _ChoiceList(
            choices: const [
              _Choice(id: 'now', title: '立即认证，解锁完整权限'),
              _Choice(id: 'later', title: '稍后再说，先进入首页'),
            ],
            selected: {intent},
            compact: true,
            onTap: onChanged,
          ),
        ],
      ),
    );
  }
}

class _SummaryStep extends StatelessWidget {
  final String roleLabel;
  final String stage;
  final List<String> majors;
  final List<String> goals;
  final String city;
  final List<String> events;

  const _SummaryStep({
    required this.roleLabel,
    required this.stage,
    required this.majors,
    required this.goals,
    required this.city,
    required this.events,
  });

  @override
  Widget build(BuildContext context) {
    return _QuestionStep(
      eyebrow: 'Profile',
      title: '你的艺术画像已生成',
      subtitle: '进入首页后，AI 会优先根据这份画像推荐院校、活动、课程和合作机会。',
      child: Column(
        children: [
          _SummaryCard(
            icon: Icons.badge_outlined,
            title: '身份卡',
            text: '路径：$roleLabel\n阶段：$stage\n方向：${majors.take(3).join(' / ')}',
          ),
          _SummaryCard(
            icon: Icons.route_outlined,
            title: '推荐路径',
            text: goals.isEmpty
                ? '先浏览公开内容，再逐步补全画像'
                : goals.take(3).join(' → '),
          ),
          _SummaryCard(
            icon: Icons.auto_awesome_outlined,
            title: 'AI 首页提示',
            text: '你可以直接问我：“我适合申请哪些学校？” 或 “有哪些适合我的艺术活动？”',
          ),
          _SummaryCard(
            icon: Icons.event_outlined,
            title: '活动推荐',
            text: '$city · ${events.take(2).join(' / ')}',
          ),
        ],
      ),
    );
  }
}

class _SelectableCard extends StatelessWidget {
  final bool selected;
  final IconData? icon;
  final String title;
  final String? subtitle;
  final bool compact;
  final VoidCallback onTap;

  const _SelectableCard({
    required this.selected,
    required this.title,
    required this.onTap,
    this.icon,
    this.subtitle,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: EdgeInsets.all(compact ? 14 : 18),
        decoration: BoxDecoration(
          color: selected ? kCobalt.withOpacity(0.08) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: selected ? kCobalt : context.artC.silver.withOpacity(0.5),
            width: selected ? 1.5 : 1,
          ),
          boxShadow: selected ? [kShadowCard] : null,
        ),
        child: Row(
          children: [
            if (icon != null) ...[
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: selected ? kCobalt : context.artC.porcelain,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  icon,
                  color: selected ? Colors.white : kCobalt,
                  size: 21,
                ),
              ),
              const SizedBox(width: 14),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: compact ? 14 : 16,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 5),
                    Text(
                      subtitle!,
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.35,
                        color: context.artC.ink.withOpacity(0.45),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Icon(
              selected ? Icons.check_circle : Icons.circle_outlined,
              color: selected ? kCobalt : context.artC.silver,
              size: 21,
            ),
          ],
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _Pill({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? kCobalt : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: selected ? kCobalt : context.artC.silver.withOpacity(0.55),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: selected ? Colors.white : context.artC.ink.withOpacity(0.72),
          ),
        ),
      ),
    );
  }
}

class _BottomActions extends StatelessWidget {
  final int step;
  final bool saving;
  final bool canContinue;
  final VoidCallback onSkip;
  final VoidCallback onContinue;

  const _BottomActions({
    required this.step,
    required this.saving,
    required this.canContinue,
    required this.onSkip,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    if (step == 0) return const SizedBox.shrink();
    final isLast = step == 7;
    return Container(
      padding: const EdgeInsets.fromLTRB(22, 12, 22, 18),
      decoration: BoxDecoration(
        color: context.artC.porcelain.withOpacity(0.94),
        border: Border(top: BorderSide(color: context.artC.silver.withOpacity(0.35))),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PrimaryButton(
              label: saving
                  ? '正在生成画像...'
                  : isLast
                      ? '进入我的艺术首页'
                      : step == 6
                          ? '生成我的艺术档案'
                          : '继续建立画像',
              onPressed: saving || !canContinue ? null : onContinue,
            ),
            const SizedBox(height: 8),
            _GhostButton(
              label: step == 6 ? '稍后再说，先进入首页' : '先随便看看',
              onPressed: saving ? null : onSkip,
            ),
          ],
        ),
      ),
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const _PrimaryButton({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: kCobalt,
          foregroundColor: Colors.white,
          disabledBackgroundColor: context.artC.silver.withOpacity(0.45),
          padding: const EdgeInsets.symmetric(vertical: 15),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
      ),
    );
  }
}

class _GhostButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const _GhostButton({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      child: Text(
        label,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w800,
          color: context.artC.ink.withOpacity(0.42),
        ),
      ),
    );
  }
}

class _PorcelainPanel extends StatelessWidget {
  final Widget child;

  const _PorcelainPanel({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.artC.silver.withOpacity(0.35)),
        boxShadow: [kShadowCard],
      ),
      child: child,
    );
  }
}

class _MiniLine extends StatelessWidget {
  final IconData icon;
  final String text;

  const _MiniLine({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, size: 18, color: kCobalt),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 13,
                height: 1.35,
                color: context.artC.ink.withOpacity(0.62),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String text;

  const _SummaryCard({
    required this.icon,
    required this.title,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: _PorcelainPanel(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: kCobalt, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: context.artC.ink,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    text,
                    style: TextStyle(
                      fontSize: 12,
                      height: 1.5,
                      color: context.artC.ink.withOpacity(0.56),
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

class _Choice {
  final String id;
  final String title;
  final String? subtitle;
  final IconData? icon;

  const _Choice({
    required this.id,
    required this.title,
    this.subtitle,
    this.icon,
  });
}

class _DirectionGroup {
  final String id;
  final String label;
  final List<String> majors;

  const _DirectionGroup(this.id, this.label, this.majors);
}

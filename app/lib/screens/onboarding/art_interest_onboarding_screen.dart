import 'package:file_picker/file_picker.dart';
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

  String? _entryType;
  String? _role;
  final Set<String> _goals = {};
  final Set<String> _directions = {};
  String? _city;
  String? _stage;

  String? _businessType;
  bool _uploadingBusinessCredential = false;
  String? _businessCredentialUrl;
  String? _businessCredentialFileName;
  final TextEditingController _businessNameCtrl = TextEditingController();
  final TextEditingController _businessCityCtrl = TextEditingController();
  final TextEditingController _businessContactCtrl = TextEditingController();
  final TextEditingController _businessChannelCtrl = TextEditingController();
  final TextEditingController _businessIntroCtrl = TextEditingController();

  static const _businessReviewGoal = 'business_credential_review';
  static const _businessCredentialMaterial = '营业执照或机构证明';

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

  static const _directionGroups = [
    _Choice(id: 'fine_art', title: '纯艺', icon: Icons.brush_outlined),
    _Choice(id: 'design', title: '设计', icon: Icons.design_services_outlined),
    _Choice(
        id: 'photo_video', title: '影像 / 摄影', icon: Icons.camera_alt_outlined),
    _Choice(id: 'new_media', title: '新媒体 / 数字艺术', icon: Icons.blur_on_outlined),
    _Choice(id: 'curation', title: '策展 / 艺术管理', icon: Icons.museum_outlined),
    _Choice(id: 'art_market', title: '艺术市场 / 收藏', icon: Icons.diamond_outlined),
    _Choice(
        id: 'art_education', title: '艺术教育 / 留学', icon: Icons.school_outlined),
    _Choice(
        id: 'space_culture',
        title: '空间 / 文旅 / 酒店艺术',
        icon: Icons.apartment_outlined),
  ];

  static const _entryChoices = [
    _Choice(
      id: 'personal',
      title: '我是个人用户',
      subtitle: '学生、艺术家、爱好者、收藏者、家长或看展用户',
      icon: Icons.person_outline_rounded,
    ),
    _Choice(
      id: 'business',
      title: '机构 / 商家入驻',
      subtitle: '机构、画廊、活动方、酒店文旅空间、品牌合作方',
      icon: Icons.storefront_outlined,
    ),
  ];

  List<_Choice> get _roleChoices => const [
        _Choice(
          id: 'student',
          title: '艺术学生 / 申请者',
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
        _Choice(
          id: 'parent',
          title: '家长 / 陪同决策者',
          subtitle: '帮孩子了解院校、费用、申请路径和作品集机构',
          icon: Icons.family_restroom_outlined,
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
      case 'parent':
        return const [
          _Choice(id: 'art_abroad', title: '了解艺术留学'),
          _Choice(id: 'school_selection', title: '帮孩子选学校'),
          _Choice(id: 'portfolio_agency', title: '找作品集机构'),
          _Choice(id: 'application_timeline', title: '了解申请时间线'),
          _Choice(id: 'cost_career', title: '看费用和就业方向'),
          _Choice(id: 'book_consultation', title: '预约咨询'),
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
      case 'parent':
        return const [
          _Choice(id: 'just_learning', title: '刚开始了解'),
          _Choice(id: 'child_has_interest', title: '孩子已有艺术方向'),
          _Choice(id: 'target_country', title: '已有目标国家 / 院校'),
          _Choice(id: 'portfolio_preparing', title: '正在准备作品集'),
          _Choice(id: 'application_planning', title: '正在规划申请'),
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

  List<_Choice> get _businessTypeChoices => const [
        _Choice(
            id: 'study_abroad_agency',
            title: '艺术留学机构',
            icon: Icons.school_outlined),
        _Choice(
            id: 'portfolio_training',
            title: '艺术培训 / 作品集机构',
            icon: Icons.palette_outlined),
        _Choice(
            id: 'gallery_exhibition',
            title: '画廊 / 展览机构',
            icon: Icons.museum_outlined),
        _Choice(
            id: 'event_organizer',
            title: '艺术活动主办方',
            icon: Icons.event_outlined),
        _Choice(
            id: 'hotel_culture_space',
            title: '酒店 / 文旅空间',
            icon: Icons.apartment_outlined),
        _Choice(
            id: 'brand_partner',
            title: '品牌合作方',
            icon: Icons.handshake_outlined),
        _Choice(
            id: 'art_media_community',
            title: '艺术媒体 / 社群',
            icon: Icons.campaign_outlined),
        _Choice(
            id: 'other_service',
            title: '其他艺术服务商',
            icon: Icons.more_horiz_outlined),
      ];

  bool get _isBusiness => _entryType == 'business';
  int get _totalSteps => 4;
  bool get _isLastStep => _step == _totalSteps - 1;

  List<String> get _businessProofFiles {
    final url = _businessCredentialUrl?.trim();
    return url == null || url.isEmpty ? const [] : [url];
  }

  bool get _canContinue {
    switch (_step) {
      case 0:
        return _entryType != null;
      case 1:
        return _isBusiness ? _businessType != null : _role != null;
      case 2:
        return _isBusiness
            ? _businessNameCtrl.text.trim().isNotEmpty &&
                _businessCityCtrl.text.trim().isNotEmpty &&
                _businessContactCtrl.text.trim().isNotEmpty
            : _goals.isNotEmpty && _stage != null;
      case 3:
        return _isBusiness
            ? _businessProofFiles.isNotEmpty && !_uploadingBusinessCredential
            : _directions.isNotEmpty;
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
    if (!_isLastStep) {
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

  @override
  void dispose() {
    _businessNameCtrl.dispose();
    _businessCityCtrl.dispose();
    _businessContactCtrl.dispose();
    _businessChannelCtrl.dispose();
    _businessIntroCtrl.dispose();
    super.dispose();
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
      final businessProofFiles = _businessProofFiles;
      final businessMaterials =
          _isBusiness ? const [_businessCredentialMaterial] : const <String>[];
      final interestedCategories = _isBusiness
          ? [
              'business_onboarding',
              if (_businessType != null) _businessType!,
              _businessCredentialMaterial,
            ]
          : [..._directions, ..._goals];
      final businessSummary = [
        if (_businessNameCtrl.text.trim().isNotEmpty)
          '机构名称：${_businessNameCtrl.text.trim()}',
        if (_businessContactCtrl.text.trim().isNotEmpty)
          '联系人：${_businessContactCtrl.text.trim()}',
        if (_businessChannelCtrl.text.trim().isNotEmpty)
          '渠道：${_businessChannelCtrl.text.trim()}',
        if (_businessIntroCtrl.text.trim().isNotEmpty)
          '简介：${_businessIntroCtrl.text.trim()}',
      ];
      await BackendApiService.completeOnboarding(
        userId: userId,
        interestedCategories: interestedCategories,
        userRole: _isBusiness ? _businessType : _role,
        userType: _isBusiness ? 'business' : 'personal',
        primaryGoal: _isBusiness
            ? _businessReviewGoal
            : (_goals.isEmpty ? null : _goals.first),
        goals: _isBusiness ? const [_businessReviewGoal] : _goals.toList(),
        targetDirections: _isBusiness
            ? ['business_settlement', if (_businessType != null) _businessType!]
            : _directions.toList(),
        targetMajors:
            _isBusiness ? [...businessMaterials, ...businessSummary] : const [],
        cityPreference: _isBusiness ? _businessCityCtrl.text.trim() : _city,
        activityCities: _isBusiness
            ? [_businessCityCtrl.text.trim()]
            : (_city == null ? const [] : [_city!]),
        eventPreferences: _isBusiness ? const [] : const [],
        currentStage: _isBusiness ? 'pending_business_review' : _stage,
        verificationIntent: _isBusiness ? 'business_review' : 'later',
        businessName: _isBusiness ? _businessNameCtrl.text.trim() : null,
        businessCity: _isBusiness ? _businessCityCtrl.text.trim() : null,
        businessContact: _isBusiness ? _businessContactCtrl.text.trim() : null,
        businessChannel: _isBusiness ? _businessChannelCtrl.text.trim() : null,
        businessIntro: _isBusiness ? _businessIntroCtrl.text.trim() : null,
        businessMaterials:
            _isBusiness ? const [_businessCredentialMaterial] : const [],
        businessProofFiles: _isBusiness ? businessProofFiles : const [],
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
            _TopProgress(
                step: _step,
                total: _totalSteps,
                onBack: _step == 0 ? null : _back),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 10, 22, 24),
                children: [
                  _buildStep(),
                  if (_error != null) ...[
                    const SizedBox(height: 14),
                    Text(
                      _error!,
                      style: const TextStyle(
                          color: Color(0xFFE11D48), fontSize: 12),
                    ),
                  ],
                ],
              ),
            ),
            _BottomActions(
              step: _step,
              isLast: _isLastStep,
              isBusiness: _isBusiness,
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
        return _QuestionStep(
          eyebrow: 'Start',
          title: '你希望以什么身份使用 ArtSee？',
          subtitle: '个人用户快速建立初始画像；机构 / 商家会进入入驻申请流程。',
          child: _ChoiceList(
            choices: _entryChoices,
            selected: _entryType == null ? const {} : {_entryType!},
            onTap: (id) => setState(() {
              _entryType = id;
              _role = null;
              _businessType = null;
              _goals.clear();
              _directions.clear();
              _businessCredentialUrl = null;
              _businessCredentialFileName = null;
              _stage = null;
            }),
          ),
        );
      case 1:
        return _isBusiness
            ? _buildBusinessTypeStep()
            : _buildPersonalRoleStep();
      case 2:
        return _isBusiness
            ? _buildBusinessBasicsStep()
            : _buildPersonalIntentStep();
      case 3:
        return _isBusiness
            ? _buildBusinessMaterialsStep()
            : _buildPersonalDirectionStep();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildPersonalRoleStep() {
    return _QuestionStep(
      eyebrow: 'Identity',
      title: '选择你的艺术身份',
      subtitle: '只需要判断推荐路径，不会在这里要求你完成认证。',
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
  }

  Widget _buildPersonalIntentStep() {
    return _QuestionStep(
      eyebrow: 'Intent',
      title: '你现在最想解决什么？',
      subtitle: '上半部分最多选 3 个目标；下半部分选择当前阶段。',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ChipWrap(
            choices: _goalChoices,
            selected: _goals,
            onTap: (id) => _toggle(_goals, id, max: 3),
          ),
          const SizedBox(height: 22),
          Text(
            '你目前阶段？',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 10),
          _ChoiceList(
            choices: _stageChoices,
            selected: _stage == null ? const {} : {_stage!},
            compact: true,
            onTap: (id) => setState(() => _stage = id),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalDirectionStep() {
    return _QuestionStep(
      eyebrow: 'Direction',
      title: '你关注哪些艺术方向？',
      subtitle: '选择 3 个以内。城市可选，后续点活动频道时也可以再补。',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ChipWrap(
            choices: _directionGroups,
            selected: _directions,
            onTap: (id) => _toggle(_directions, id, max: 3),
          ),
          const SizedBox(height: 24),
          Text(
            '常在哪座城市活动？可跳过',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: context.artC.ink,
            ),
          ),
          const SizedBox(height: 10),
          _TextChipWrap(
            items: _cities,
            selected: _city == null ? const {} : {_city!},
            onTap: (city) =>
                setState(() => _city = _city == city ? null : city),
            max: 1,
          ),
        ],
      ),
    );
  }

  Widget _buildBusinessTypeStep() {
    return _QuestionStep(
      eyebrow: 'Settlement',
      title: '请选择机构 / 商家类型',
      subtitle: '类型会决定后续材料要求和 AI 展示页的生成方向。',
      child: _ChoiceList(
        choices: _businessTypeChoices,
        selected: _businessType == null ? const {} : {_businessType!},
        onTap: (id) => setState(() => _businessType = id),
      ),
    );
  }

  Widget _buildBusinessBasicsStep() {
    return _QuestionStep(
      eyebrow: 'Profile',
      title: '填写基础资料',
      subtitle: 'AI 会根据这些信息生成你的入驻展示页初稿。',
      child: Column(
        children: [
          _TextInputField(
            controller: _businessNameCtrl,
            label: '机构 / 商家名称',
            onChanged: () => setState(() {}),
          ),
          _TextInputField(
            controller: _businessCityCtrl,
            label: '所在城市',
            onChanged: () => setState(() {}),
          ),
          _TextInputField(
            controller: _businessContactCtrl,
            label: '联系人 / 手机 / 邮箱',
            onChanged: () => setState(() {}),
          ),
          _TextInputField(
            controller: _businessChannelCtrl,
            label: '官网 / 小红书 / 公众号 / Instagram，可选',
            onChanged: () => setState(() {}),
          ),
          _TextInputField(
            controller: _businessIntroCtrl,
            label: '一句话简介，可选',
            minLines: 2,
            onChanged: () => setState(() {}),
          ),
        ],
      ),
    );
  }

  Future<void> _uploadBusinessCredential() async {
    if (_uploadingBusinessCredential) return;
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
      allowMultiple: false,
      withData: true,
    );
    final file = result?.files.single;
    if (file == null) return;
    final bytes = file.bytes;
    if (bytes == null) {
      setState(() => _error = '无法读取所选文件');
      return;
    }
    if (bytes.length > 10 * 1024 * 1024) {
      setState(() => _error = '文件大小不能超过 10MB');
      return;
    }
    setState(() {
      _uploadingBusinessCredential = true;
      _error = null;
    });
    try {
      final upload = await BackendApiService.uploadFile(
        bytes: bytes,
        filename: file.name,
        contentType: _mimeForFileName(file.name),
        folder: 'submission-materials/business-onboarding',
      );
      final url = _text(upload['url']);
      if (url.isEmpty) throw Exception('上传结果缺少文件链接');
      if (!mounted) return;
      setState(() {
        _businessCredentialUrl = url;
        _businessCredentialFileName = file.name;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('资质文件已上传')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = '上传资质失败：$e');
    } finally {
      if (mounted) setState(() => _uploadingBusinessCredential = false);
    }
  }

  Widget _buildBusinessMaterialsStep() {
    return _QuestionStep(
      eyebrow: 'Materials',
      title: '上传资质',
      subtitle: '机构用户先上传营业执照或机构证明即可，课程、案例和合作材料后续再补充。',
      child: _BusinessCredentialUploadCard(
        fileName: _businessCredentialFileName,
        uploadedUrl: _businessCredentialUrl,
        uploading: _uploadingBusinessCredential,
        onUpload: _uploadBusinessCredential,
        onRemove: () => setState(() {
          _businessCredentialUrl = null;
          _businessCredentialFileName = null;
        }),
      ),
    );
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
                  : context.artC.ink.withValues(alpha: 0.7),
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 3,
                backgroundColor: context.artC.silver.withValues(alpha: 0.28),
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
              color: context.artC.ink.withValues(alpha: 0.38),
            ),
          ),
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
            letterSpacing: 0,
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
            color: context.artC.ink.withValues(alpha: 0.48),
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

class _BusinessCredentialUploadCard extends StatelessWidget {
  final String? fileName;
  final String? uploadedUrl;
  final bool uploading;
  final VoidCallback onUpload;
  final VoidCallback onRemove;

  const _BusinessCredentialUploadCard({
    required this.fileName,
    required this.uploadedUrl,
    required this.uploading,
    required this.onUpload,
    required this.onRemove,
  });

  bool get _hasFile => uploadedUrl?.trim().isNotEmpty == true;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: _hasFile
            ? kCobalt.withValues(alpha: 0.08)
            : context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: _hasFile
              ? kCobalt.withValues(alpha: 0.28)
              : context.artC.silver.withValues(alpha: 0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: _hasFile
                      ? kCobalt.withValues(alpha: 0.1)
                      : context.artC.porcelain,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  _hasFile
                      ? Icons.verified_outlined
                      : Icons.upload_file_outlined,
                  color: kCobalt,
                  size: 21,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _ArtInterestOnboardingScreenState
                          ._businessCredentialMaterial,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: context.artC.ink,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      _hasFile
                          ? (fileName?.trim().isNotEmpty == true
                              ? fileName!.trim()
                              : '资质文件已上传')
                          : '支持 PDF、JPG、PNG、WEBP，单个文件不超过 10MB',
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.35,
                        color: context.artC.ink.withValues(alpha: 0.45),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                _hasFile ? Icons.check_circle : Icons.circle_outlined,
                color: _hasFile ? kCobalt : context.artC.silver,
                size: 21,
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton.icon(
              onPressed: uploading ? null : onUpload,
              style: OutlinedButton.styleFrom(
                foregroundColor: kCobalt,
                side: BorderSide(color: kCobalt.withValues(alpha: 0.26)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              icon: uploading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: kCobalt,
                      ),
                    )
                  : Icon(
                      _hasFile
                          ? Icons.swap_horiz_outlined
                          : Icons.upload_file_outlined,
                      size: 18,
                    ),
              label: Text(uploading ? '上传中' : (_hasFile ? '重新上传' : '上传资质文件')),
            ),
          ),
          if (_hasFile) ...[
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.center,
              child: TextButton(
                onPressed: uploading ? null : onRemove,
                child: Text(
                  '移除文件',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: context.artC.ink.withValues(alpha: 0.42),
                  ),
                ),
              ),
            ),
          ],
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
          color: selected
              ? kCobalt.withValues(alpha: 0.08)
              : context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: selected
                ? kCobalt.withValues(alpha: 0.28)
                : context.artC.silver.withValues(alpha: 0.5),
            width: 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: context.artC.ink.withValues(alpha: 0.026),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            if (icon != null) ...[
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: selected
                      ? kCobalt.withValues(alpha: 0.08)
                      : context.artC.porcelain,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  icon,
                  color: kCobalt,
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
                        color: context.artC.ink.withValues(alpha: 0.45),
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
          color: selected
              ? kCobalt.withValues(alpha: 0.08)
              : context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: selected
                ? kCobalt.withValues(alpha: 0.28)
                : context.artC.silver.withValues(alpha: 0.55),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color:
                selected ? kCobalt : context.artC.ink.withValues(alpha: 0.72),
          ),
        ),
      ),
    );
  }
}

class _TextInputField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final int minLines;
  final VoidCallback onChanged;

  const _TextInputField({
    required this.controller,
    required this.label,
    required this.onChanged,
    this.minLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        minLines: minLines,
        maxLines: minLines == 1 ? 1 : 4,
        onChanged: (_) => onChanged(),
        decoration: InputDecoration(
          hintText: label,
          hintStyle: TextStyle(
            color: context.artC.ink.withValues(alpha: 0.34),
            fontWeight: FontWeight.w700,
          ),
          filled: true,
          fillColor: context.artC.cardIconBg,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide:
                BorderSide(color: context.artC.silver.withValues(alpha: 0.38)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide:
                BorderSide(color: context.artC.silver.withValues(alpha: 0.38)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: kCobalt, width: 1.4),
          ),
        ),
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: context.artC.ink,
        ),
      ),
    );
  }
}

class _BottomActions extends StatelessWidget {
  final int step;
  final bool isLast;
  final bool isBusiness;
  final bool saving;
  final bool canContinue;
  final VoidCallback onSkip;
  final VoidCallback onContinue;

  const _BottomActions({
    required this.step,
    required this.isLast,
    required this.isBusiness,
    required this.saving,
    required this.canContinue,
    required this.onSkip,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(22, 12, 22, 18),
      decoration: BoxDecoration(
        color: context.artC.porcelain.withValues(alpha: 0.94),
        border: Border(
            top:
                BorderSide(color: context.artC.silver.withValues(alpha: 0.35))),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PrimaryButton(
              label: saving
                  ? (isBusiness ? '正在提交申请...' : '正在生成画像...')
                  : isLast
                      ? (isBusiness ? '提交入驻申请' : '进入首页')
                      : '继续',
              onPressed: saving || !canContinue ? null : onContinue,
            ),
            const SizedBox(height: 8),
            _GhostButton(
              label: '先随便看看',
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
          disabledBackgroundColor: context.artC.silver.withValues(alpha: 0.45),
          padding: const EdgeInsets.symmetric(vertical: 15),
          elevation: 0,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: Text(label,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
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
          color: context.artC.ink.withValues(alpha: 0.42),
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

String _text(Object? value, {String fallback = ''}) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

String _mimeForFileName(String name) {
  final lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

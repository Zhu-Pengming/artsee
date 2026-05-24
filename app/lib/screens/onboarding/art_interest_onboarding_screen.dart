import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../services/backend_api_service.dart';
import '../../services/storage_service.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// 注册后冷启动：采集申请身份、目标、作品集、预算等用户画像字段。
class ArtInterestOnboardingScreen extends StatefulWidget {
  const ArtInterestOnboardingScreen({super.key, required this.onCompleted});

  final VoidCallback onCompleted;

  @override
  State<ArtInterestOnboardingScreen> createState() =>
      _ArtInterestOnboardingScreenState();
}

class _ArtInterestOnboardingScreenState
    extends State<ArtInterestOnboardingScreen> {
  final _currentSchoolCtrl = TextEditingController();
  final _currentMajorCtrl = TextEditingController();
  final _gpaCtrl = TextEditingController();
  final _englishScoreCtrl = TextEditingController();
  final _favoriteCtrl = TextEditingController();

  final Set<String> _targetDirections = {};
  final Set<String> _targetMajors = {};
  final Set<String> _targetCountries = {};
  final Set<String> _selectedSchoolTypes = {};
  final Set<String> _selectedPortfolioStyles = {};
  final Set<String> _priorityFactors = {};
  final Set<String> _uploading = {};

  String? _userRole;
  String? _targetDegree;
  String? _educationStage;
  String? _rankingSensitivity;
  String? _cityPreference;
  String? _portfolioStatus;
  String? _englishTestType;
  String? _budgetRange;
  String? _scholarshipNeed;
  String? _familySupport;
  String? _targetIntake;
  String? _avatarUrl;
  String? _error;
  bool _saving = false;

  static const _userRoles = [
    _ProfileOption('student', '申请学生', Icons.school_outlined),
    _ProfileOption('parent', '家长', Icons.family_restroom_outlined),
    _ProfileOption('working_professional', '转行申请者', Icons.work_outline_rounded),
    _ProfileOption('artist', '独立艺术家', Icons.palette_outlined),
  ];

  static const _targetDegrees = [
    _ProfileOption('foundation', 'Foundation/预科', Icons.auto_stories_outlined,
        description: '艺术基础课程'),
    _ProfileOption('bachelor', '本科 BA/BFA', Icons.workspace_premium_outlined,
        description: '学士学位'),
    _ProfileOption('master', '研究生 MA/MFA', Icons.local_library_outlined,
        description: '硕士学位'),
    _ProfileOption('phd', '博士', Icons.science_outlined, description: '研究型学位'),
    _ProfileOption('non_degree', '非学位课程', Icons.badge_outlined,
        description: '短期课程/证书'),
  ];

  static const _educationStages = [
    _ProfileOption('high_school', '高中在读', Icons.menu_book_outlined),
    _ProfileOption('university_undergrad', '大学在读', Icons.school_outlined),
    _ProfileOption('graduated', '已毕业', Icons.verified_outlined),
    _ProfileOption('working', '在职', Icons.work_outline),
  ];

  static const _directions = [
    _ProfileOption('fine_arts', '纯艺术', Icons.brush_outlined,
        description: '绘画、雕塑、装置'),
    _ProfileOption('design', '设计', Icons.design_services_outlined,
        description: '视觉、产品、时装'),
    _ProfileOption('media_arts', '媒体艺术', Icons.devices_outlined,
        description: '数字媒体、交互、游戏'),
    _ProfileOption('architecture', '建筑', Icons.architecture_outlined,
        description: '建筑设计、城市规划'),
    _ProfileOption('performance', '表演艺术', Icons.theater_comedy_outlined,
        description: '戏剧、舞蹈'),
    _ProfileOption('music', '音乐', Icons.music_note_outlined,
        description: '作曲、演奏、制作'),
    _ProfileOption('film', '电影/摄影', Icons.movie_creation_outlined,
        description: '导演、摄影、剪辑'),
  ];

  static const _majors = [
    _MajorOption('fashion_design', '时装设计', 'design'),
    _MajorOption('textile_design', '纺织品设计', 'design'),
    _MajorOption('graphic_design', '平面设计', 'design'),
    _MajorOption('product_design', '产品设计', 'design'),
    _MajorOption('interior_design', '室内设计', 'design'),
    _MajorOption('jewelry_design', '珠宝设计', 'design'),
    _MajorOption('industrial_design', '工业设计', 'design'),
    _MajorOption('interaction_design', '交互设计', 'media_arts'),
    _MajorOption('game_design', '游戏设计', 'media_arts'),
    _MajorOption('animation', '动画', 'media_arts'),
    _MajorOption('digital_media', '数字媒体', 'media_arts'),
    _MajorOption('painting', '绘画', 'fine_arts'),
    _MajorOption('sculpture', '雕塑', 'fine_arts'),
    _MajorOption('printmaking', '版画', 'fine_arts'),
    _MajorOption('installation', '装置艺术', 'fine_arts'),
    _MajorOption('illustration', '插画', 'design'),
    _MajorOption('photography', '摄影', 'film'),
    _MajorOption('film_production', '电影制作', 'film'),
    _MajorOption('architecture', '建筑设计', 'architecture'),
  ];

  static const _countries = [
    _ProfileOption('US', '美国', Icons.location_city_outlined),
    _ProfileOption('GB', '英国', Icons.location_city_outlined),
    _ProfileOption('FR', '法国', Icons.location_city_outlined),
    _ProfileOption('IT', '意大利', Icons.location_city_outlined),
    _ProfileOption('DE', '德国', Icons.location_city_outlined),
    _ProfileOption('NL', '荷兰', Icons.location_city_outlined),
    _ProfileOption('JP', '日本', Icons.location_city_outlined),
    _ProfileOption('KR', '韩国', Icons.location_city_outlined),
    _ProfileOption('AU', '澳大利亚', Icons.location_city_outlined),
    _ProfileOption('CA', '加拿大', Icons.location_city_outlined),
    _ProfileOption('CN', '中国', Icons.location_city_outlined),
    _ProfileOption('other', '其他', Icons.more_horiz_outlined),
  ];

  static const _schoolTypes = [
    _ProfileOption('comprehensive_university', '综合大学', Icons.account_balance,
        description: '如 Yale, UCLA'),
    _ProfileOption('art_academy', '独立艺术学院', Icons.palette_outlined,
        description: '如 RISD, CSM'),
    _ProfileOption('design_school', '设计学院', Icons.design_services_outlined,
        description: '如 Parsons, Pratt'),
    _ProfileOption('conservatory', '音乐/表演学院', Icons.music_note_outlined,
        description: '如 Juilliard'),
  ];

  static const _rankingSensitivityOptions = [
    _ProfileOption('very_important', '非常重要', Icons.trending_up_outlined,
        description: '优先考虑排名靠前'),
    _ProfileOption('moderately', '适度关注', Icons.tune_outlined,
        description: '排名是参考因素'),
    _ProfileOption('not_important', '不太在意', Icons.explore_outlined,
        description: '更关注教学和氛围'),
  ];

  static const _cityPreferences = [
    _ProfileOption('big_city', '大城市', Icons.apartment_outlined,
        description: '纽约、伦敦、巴黎等'),
    _ProfileOption('small_town', '小城镇', Icons.holiday_village_outlined,
        description: '安静的学院城'),
    _ProfileOption('doesnt_matter', '无所谓', Icons.public_outlined,
        description: '地点不是主要考虑'),
  ];

  static const _portfolioStatuses = [
    _ProfileOption('not_started', '还没开始', Icons.lightbulb_outline,
        description: '正在收集灵感'),
    _ProfileOption('brainstorming', '构思阶段', Icons.psychology_outlined,
        description: '确定主题和方向'),
    _ProfileOption('in_progress', '制作中', Icons.construction_outlined,
        description: '已开始创作项目'),
    _ProfileOption('mostly_done', '接近完成', Icons.task_alt_outlined,
        description: '大部分项目已完成'),
    _ProfileOption('refining', '精修阶段', Icons.auto_fix_high_outlined,
        description: '优化排版和细节'),
  ];

  static const _portfolioStyles = [
    _ProfileOption('conceptual', '概念性', Icons.bubble_chart_outlined),
    _ProfileOption('commercial', '商业性', Icons.storefront_outlined),
    _ProfileOption('craft_based', '工艺性', Icons.handyman_outlined),
    _ProfileOption('experimental', '实验性', Icons.science_outlined),
    _ProfileOption('narrative', '叙事性', Icons.menu_book_outlined),
  ];

  static const _englishTypes = [
    _ProfileOption('toefl', '托福 TOEFL', Icons.language_outlined),
    _ProfileOption('ielts', '雅思 IELTS', Icons.language_outlined),
    _ProfileOption('duolingo', 'Duolingo', Icons.language_outlined),
    _ProfileOption('not_taken', '还没考', Icons.schedule_outlined),
    _ProfileOption('not_planned', '不打算考', Icons.do_not_disturb_alt_outlined),
  ];

  static const _budgetRanges = [
    _ProfileOption('under_30', '30万以下/年', Icons.savings_outlined,
        description: '适合欧洲部分国家'),
    _ProfileOption('30_50', '30-50万/年', Icons.account_balance_wallet_outlined,
        description: '英美公立学校'),
    _ProfileOption('50_80', '50-80万/年', Icons.credit_card_outlined,
        description: '英美私立学校'),
    _ProfileOption('80_plus', '80万以上/年', Icons.diamond_outlined,
        description: '顶尖私立学校'),
  ];

  static const _scholarshipNeeds = [
    _ProfileOption('must_have', '必须有', Icons.priority_high_outlined),
    _ProfileOption('preferred', '最好有', Icons.star_border_outlined),
    _ProfileOption('not_needed', '不需要', Icons.check_circle_outline),
  ];

  static const _familySupportLevels = [
    _ProfileOption('fully', '全额支持', Icons.groups_outlined),
    _ProfileOption('partially', '部分支持', Icons.group_outlined),
    _ProfileOption('self_funded', '自费', Icons.person_outline),
  ];

  static const _targetIntakes = [
    _ProfileOption('2025_fall', '2025 秋季', Icons.event_outlined),
    _ProfileOption('2026_spring', '2026 春季', Icons.event_outlined),
    _ProfileOption('2026_fall', '2026 秋季', Icons.event_outlined),
    _ProfileOption('2027_spring', '2027 春季', Icons.event_outlined),
    _ProfileOption('2027_fall', '2027 秋季', Icons.event_outlined),
    _ProfileOption('flexible', '时间灵活', Icons.all_inclusive_outlined),
  ];

  static const _priorityOptions = [
    _ProfileOption('reputation', '学校声誉', Icons.workspace_premium_outlined),
    _ProfileOption('teaching', '教学质量', Icons.local_library_outlined),
    _ProfileOption('career', '就业前景', Icons.work_outline),
    _ProfileOption('culture', '校园氛围', Icons.palette_outlined),
    _ProfileOption('cost', '费用', Icons.payments_outlined),
    _ProfileOption('location', '地理位置', Icons.place_outlined),
    _ProfileOption('faculty', '教授资源', Icons.person_search_outlined),
    _ProfileOption('alumni', '校友网络', Icons.diversity_3_outlined),
  ];

  @override
  void dispose() {
    _currentSchoolCtrl.dispose();
    _currentMajorCtrl.dispose();
    _gpaCtrl.dispose();
    _englishScoreCtrl.dispose();
    _favoriteCtrl.dispose();
    super.dispose();
  }

  List<_MajorOption> get _visibleMajors {
    if (_targetDirections.isEmpty) return _majors;
    return _majors
        .where((major) => _targetDirections.contains(major.category))
        .toList();
  }

  int get _completionScore {
    var score = 0;
    var total = 0;

    void add(bool filled, int weight) {
      total += weight;
      if (filled) score += weight;
    }

    add(_userRole != null, 10);
    add(_targetDegree != null, 10);
    add(_educationStage != null, 10);
    add(_targetMajors.isNotEmpty, 10);
    add(_targetCountries.isNotEmpty, 10);
    add(_portfolioStatus != null, 10);
    add(_targetIntake != null, 10);

    add(_englishTestType != null, 8);
    add(_budgetRange != null, 8);
    add(_currentSchoolCtrl.text.trim().isNotEmpty, 8);
    add(_currentMajorCtrl.text.trim().isNotEmpty, 8);

    add(_selectedSchoolTypes.isNotEmpty, 5);
    add(_rankingSensitivity != null, 5);
    add(_selectedPortfolioStyles.isNotEmpty, 5);
    add(_englishScoreCtrl.text.trim().isNotEmpty, 5);
    add(_scholarshipNeed != null, 5);
    add(_gpaCtrl.text.trim().isNotEmpty, 5);

    add(_favoriteCtrl.text.trim().isNotEmpty, 3);
    add(_priorityFactors.isNotEmpty, 3);
    add(_cityPreference != null, 3);
    add(_familySupport != null, 3);

    return total == 0 ? 0 : ((score / total) * 100).round();
  }

  void _setSingle(String value, String? current, ValueChanged<String?> set) {
    setState(() => set(current == value ? null : value));
  }

  void _toggle(Set<String> values, String value, {int? max}) {
    setState(() {
      if (values.contains(value)) {
        values.remove(value);
      } else if (max == null || values.length < max) {
        values.add(value);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('最多选择 $max 项')),
        );
      }
    });
  }

  Future<void> _pickAndUploadAvatar() async {
    final picker = ImagePicker();
    final x = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      maxHeight: 1024,
      imageQuality: 85,
    );
    if (x == null) return;
    setState(() {
      _uploading.add('avatar');
      _error = null;
    });
    try {
      final url = await StorageService.uploadAvatarFile(x);
      await SupabaseService.updateAvatarUrl(url);
      if (mounted) {
        setState(() => _avatarUrl = url);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('头像已更新')),
        );
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _uploading.remove('avatar'));
    }
  }

  List<String> _missingRequiredLabels() {
    final missing = <String>[];
    if (_userRole == null) missing.add('身份角色');
    if (_targetDegree == null) missing.add('目标学位');
    if (_educationStage == null) missing.add('当前阶段');
    if (_targetMajors.isEmpty) missing.add('目标专业');
    if (_targetCountries.isEmpty) missing.add('目标国家');
    if (_portfolioStatus == null) missing.add('作品集状态');
    if (_targetIntake == null) missing.add('申请时间');
    return missing;
  }

  Future<void> _submit() async {
    final missing = _missingRequiredLabels();
    if (missing.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('请先补充：${missing.take(3).join('、')}')),
      );
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    final englishScore = _englishScoreCtrl.text.trim();
    final payload = <String, dynamic>{
      'user_role': _userRole,
      'target_degree': _targetDegree,
      'current_education_stage': _educationStage,
      'current_school': _currentSchoolCtrl.text.trim(),
      'current_major': _currentMajorCtrl.text.trim(),
      'gpa_or_grade': _gpaCtrl.text.trim(),
      'target_directions': _targetDirections.toList(),
      'target_majors': _targetMajors.toList(),
      'target_countries': _targetCountries.toList(),
      'school_type_preference': _selectedSchoolTypes.toList(),
      'ranking_sensitivity': _rankingSensitivity,
      'city_preference': _cityPreference,
      'portfolio_status': _portfolioStatus,
      'portfolio_style_tendency': _selectedPortfolioStyles.toList(),
      'english_test_type': _englishTestType,
      'english_test_score': englishScore.isEmpty ? null : englishScore,
      'total_budget_range': _budgetRange,
      'scholarship_need': _scholarshipNeed,
      'family_support_level': _familySupport,
      'target_intake': _targetIntake,
      'favorite_artists_or_styles': _favoriteCtrl.text.trim(),
      'priority_factors': _priorityFactors.toList(),
      'profile_completion_score': _completionScore,
      'application_stage': _educationStage,
      'target_major': _targetMajors.isEmpty ? null : _targetMajors.first,
      'budget_range': _budgetRange,
      'language_level': englishScore.isEmpty ? _englishTestType : englishScore,
      'portfolio_progress': _portfolioStatus,
      'application_timeline': _targetIntake,
      'need_scholarship': _scholarshipNeed == 'must_have',
      'has_completed_onboarding': true,
      'onboarding_completed_at': DateTime.now().toIso8601String(),
    };

    payload.removeWhere((_, value) {
      if (value == null) return true;
      if (value is String && value.trim().isEmpty) return true;
      return false;
    });

    try {
      await BackendApiService.updateUserProfile(payload);
      widget.onCompleted();
    } catch (e) {
      if (mounted) {
        setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final missing = _missingRequiredLabels();
    final canSubmit = missing.isEmpty;

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      bottomNavigationBar: SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
          decoration: BoxDecoration(
            color: context.artC.porcelain.withValues(alpha: 0.97),
            border: Border(
              top: BorderSide(
                  color: context.artC.silver.withValues(alpha: 0.55)),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(999),
                      child: LinearProgressIndicator(
                        minHeight: 6,
                        value: _completionScore / 100,
                        backgroundColor:
                            context.artC.silver.withValues(alpha: 0.7),
                        color: kCobalt,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '$_completionScore%',
                    style: TextStyle(
                      fontSize: 12,
                      color: context.artC.ink.withValues(alpha: 0.55),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _saving ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: canSubmit ? kCobalt : kCobaltMuted,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(kRadiusMedium),
                    ),
                  ),
                  child: _saving
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          canSubmit ? '完成画像' : '补充必填项',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 140),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '完善你的艺术画像',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: context.artC.ink,
                            height: 1.15,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '让 Artiqore 根据你的身份、目标和现实条件推荐更合适的院校与内容。',
                          style: TextStyle(
                            fontSize: 14,
                            color: context.artC.ink.withValues(alpha: 0.55),
                            height: 1.45,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  GestureDetector(
                    onTap: _uploading.contains('avatar')
                        ? null
                        : _pickAndUploadAvatar,
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border:
                            Border.all(color: context.artC.silver, width: 2),
                        boxShadow: [kShadowCard],
                      ),
                      child: _uploading.contains('avatar')
                          ? const Padding(
                              padding: EdgeInsets.all(18),
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: kCobalt,
                              ),
                            )
                          : _avatarUrl != null
                              ? ClipOval(
                                  child: Image.network(
                                    _avatarUrl!,
                                    width: 64,
                                    height: 64,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.add_a_photo_outlined,
                                      color: kCobalt,
                                      size: 24,
                                    ),
                                  ),
                                )
                              : const Icon(
                                  Icons.add_a_photo_outlined,
                                  color: kCobalt,
                                  size: 24,
                                ),
                    ),
                  ),
                ],
              ),
              if (_error != null) ...[
                const SizedBox(height: 14),
                Text(
                  _error!,
                  style: const TextStyle(fontSize: 12, color: Colors.red),
                ),
              ],
              const SizedBox(height: 24),
              _Section(
                index: '01',
                title: '身份角色',
                subtitle: '先确定你是谁，以及准备申请什么层级。',
                child: Column(
                  children: [
                    _ChoiceGrid(
                      options: _userRoles,
                      selectedValue: _userRole,
                      onSelected: (v) => _setSingle(
                        v,
                        _userRole,
                        (next) => _userRole = next,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _ChoiceGrid(
                      options: _targetDegrees,
                      selectedValue: _targetDegree,
                      onSelected: (v) => _setSingle(
                        v,
                        _targetDegree,
                        (next) => _targetDegree = next,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _ChoiceGrid(
                      options: _educationStages,
                      selectedValue: _educationStage,
                      compact: true,
                      onSelected: (v) => _setSingle(
                        v,
                        _educationStage,
                        (next) => _educationStage = next,
                      ),
                    ),
                  ],
                ),
              ),
              _Section(
                index: '02',
                title: '学术背景',
                subtitle: '这些信息用于判断申请档位和课程匹配。',
                child: Column(
                  children: [
                    _ProfileTextField(
                      controller: _currentSchoolCtrl,
                      label: '当前学校',
                      hint: '例如：中央美术学院 / 某国际高中',
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 10),
                    _ProfileTextField(
                      controller: _currentMajorCtrl,
                      label: '当前专业',
                      hint: '例如：视觉传达 / A-Level Art',
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 10),
                    _ProfileTextField(
                      controller: _gpaCtrl,
                      label: 'GPA 或成绩',
                      hint: '例如：3.6/4.0、85/100、AAB',
                      onChanged: (_) => setState(() {}),
                    ),
                  ],
                ),
              ),
              _Section(
                index: '03',
                title: '目标方向',
                subtitle: '可多选方向、专业和国家。',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ChoiceGrid(
                      options: _directions,
                      selectedValues: _targetDirections,
                      onSelected: (v) {
                        setState(() {
                          if (_targetDirections.contains(v)) {
                            _targetDirections.remove(v);
                          } else {
                            _targetDirections.add(v);
                          }
                          _targetMajors.removeWhere((major) {
                            final item =
                                _majors.firstWhere((m) => m.value == major);
                            return _targetDirections.isNotEmpty &&
                                !_targetDirections.contains(item.category);
                          });
                        });
                      },
                    ),
                    const SizedBox(height: 14),
                    _ChipWrap(
                      options: _visibleMajors
                          .map((m) => _ProfileOption(
                              m.value, m.label, Icons.sell_outlined))
                          .toList(),
                      selectedValues: _targetMajors,
                      onSelected: (v) => _toggle(_targetMajors, v, max: 6),
                    ),
                    const SizedBox(height: 14),
                    _ChipWrap(
                      options: _countries,
                      selectedValues: _targetCountries,
                      onSelected: (v) => _toggle(_targetCountries, v, max: 5),
                    ),
                  ],
                ),
              ),
              _Section(
                index: '04',
                title: '学校偏好',
                subtitle: '帮助系统过滤学校类型、排名和城市氛围。',
                child: Column(
                  children: [
                    _ChoiceGrid(
                      options: _schoolTypes,
                      selectedValues: _selectedSchoolTypes,
                      onSelected: (v) => _toggle(_selectedSchoolTypes, v),
                    ),
                    const SizedBox(height: 14),
                    _ChoiceGrid(
                      options: _rankingSensitivityOptions,
                      selectedValue: _rankingSensitivity,
                      onSelected: (v) => _setSingle(
                        v,
                        _rankingSensitivity,
                        (next) => _rankingSensitivity = next,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _ChoiceGrid(
                      options: _cityPreferences,
                      selectedValue: _cityPreference,
                      onSelected: (v) => _setSingle(
                        v,
                        _cityPreference,
                        (next) => _cityPreference = next,
                      ),
                    ),
                  ],
                ),
              ),
              _Section(
                index: '05',
                title: '作品集状态',
                subtitle: '作品集阶段会影响时间线和服务建议。',
                child: Column(
                  children: [
                    _ChoiceGrid(
                      options: _portfolioStatuses,
                      selectedValue: _portfolioStatus,
                      onSelected: (v) => _setSingle(
                        v,
                        _portfolioStatus,
                        (next) => _portfolioStatus = next,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _ChipWrap(
                      options: _portfolioStyles,
                      selectedValues: _selectedPortfolioStyles,
                      onSelected: (v) =>
                          _toggle(_selectedPortfolioStyles, v, max: 3),
                    ),
                  ],
                ),
              ),
              _Section(
                index: '06',
                title: '语言能力',
                subtitle: '填写考试类型和当前分数或状态。',
                child: Column(
                  children: [
                    _ChoiceGrid(
                      options: _englishTypes,
                      selectedValue: _englishTestType,
                      compact: true,
                      onSelected: (v) => _setSingle(
                        v,
                        _englishTestType,
                        (next) => _englishTestType = next,
                      ),
                    ),
                    const SizedBox(height: 10),
                    _ProfileTextField(
                      controller: _englishScoreCtrl,
                      label: '英语成绩',
                      hint: '例如：IELTS 6.5 / TOEFL 92 / 未考',
                      onChanged: (_) => setState(() {}),
                    ),
                  ],
                ),
              ),
              _Section(
                index: '07',
                title: '预算与现实',
                subtitle: '预算、奖学金和家庭支持会影响国家与院校建议。',
                child: Column(
                  children: [
                    _ChoiceGrid(
                      options: _budgetRanges,
                      selectedValue: _budgetRange,
                      onSelected: (v) => _setSingle(
                        v,
                        _budgetRange,
                        (next) => _budgetRange = next,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _ChoiceGrid(
                      options: _scholarshipNeeds,
                      selectedValue: _scholarshipNeed,
                      compact: true,
                      onSelected: (v) => _setSingle(
                        v,
                        _scholarshipNeed,
                        (next) => _scholarshipNeed = next,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _ChoiceGrid(
                      options: _familySupportLevels,
                      selectedValue: _familySupport,
                      compact: true,
                      onSelected: (v) => _setSingle(
                        v,
                        _familySupport,
                        (next) => _familySupport = next,
                      ),
                    ),
                  ],
                ),
              ),
              _Section(
                index: '08',
                title: '时间线',
                subtitle: '选择你计划入学的时间。',
                child: _ChoiceGrid(
                  options: _targetIntakes,
                  selectedValue: _targetIntake,
                  compact: true,
                  onSelected: (v) => _setSingle(
                    v,
                    _targetIntake,
                    (next) => _targetIntake = next,
                  ),
                ),
              ),
              _Section(
                index: '09',
                title: '个性化信号',
                subtitle: '这些会让推荐更接近你的真实偏好。',
                child: Column(
                  children: [
                    _ProfileTextField(
                      controller: _favoriteCtrl,
                      label: '喜欢的艺术家、品牌或风格',
                      hint: '例如：川久保玲、包豪斯、影像装置、手工材料',
                      maxLines: 3,
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 14),
                    _ChipWrap(
                      options: _priorityOptions,
                      selectedValues: _priorityFactors,
                      onSelected: (v) => _toggle(_priorityFactors, v, max: 5),
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

class _Section extends StatelessWidget {
  const _Section({
    required this.index,
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String index;
  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 34,
                height: 34,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: kCobalt.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  index,
                  style: const TextStyle(
                    color: kCobalt,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        color: context.artC.ink,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: context.artC.ink.withValues(alpha: 0.48),
                        fontSize: 12,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _ChoiceGrid extends StatelessWidget {
  const _ChoiceGrid({
    required this.options,
    required this.onSelected,
    this.selectedValue,
    this.selectedValues,
    this.compact = false,
  });

  final List<_ProfileOption> options;
  final String? selectedValue;
  final Set<String>? selectedValues;
  final ValueChanged<String> onSelected;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const gap = 10.0;
        final columns = compact ? 3 : 2;
        final itemWidth =
            (constraints.maxWidth - gap * (columns - 1)) / columns;
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: options.map((option) {
            final selected = selectedValues?.contains(option.value) ??
                selectedValue == option.value;
            return SizedBox(
              width: itemWidth,
              child: _ChoiceTile(
                option: option,
                selected: selected,
                compact: compact,
                onTap: () => onSelected(option.value),
              ),
            );
          }).toList(),
        );
      },
    );
  }
}

class _ChoiceTile extends StatelessWidget {
  const _ChoiceTile({
    required this.option,
    required this.selected,
    required this.onTap,
    required this.compact,
  });

  final _ProfileOption option;
  final bool selected;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        constraints: BoxConstraints(minHeight: compact ? 74 : 96),
        padding: EdgeInsets.all(compact ? 10 : 12),
        decoration: BoxDecoration(
          color: selected ? kCobalt.withValues(alpha: 0.1) : Colors.white,
          borderRadius: BorderRadius.circular(kRadiusMedium),
          border: Border.all(
            color:
                selected ? kCobalt : context.artC.silver.withValues(alpha: 0.9),
            width: selected ? 1.5 : 1,
          ),
          boxShadow: selected ? [kShadowCard] : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              option.icon,
              size: compact ? 21 : 24,
              color:
                  selected ? kCobalt : context.artC.ink.withValues(alpha: 0.42),
            ),
            const SizedBox(height: 8),
            Text(
              option.label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: selected
                    ? kCobalt
                    : context.artC.ink.withValues(alpha: 0.78),
                fontSize: compact ? 12 : 13,
                fontWeight: FontWeight.w700,
                height: 1.2,
              ),
            ),
            if (!compact && option.description != null) ...[
              const SizedBox(height: 4),
              Text(
                option.description!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: context.artC.ink.withValues(alpha: 0.42),
                  fontSize: 11,
                  height: 1.25,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ChipWrap extends StatelessWidget {
  const _ChipWrap({
    required this.options,
    required this.selectedValues,
    required this.onSelected,
  });

  final List<_ProfileOption> options;
  final Set<String> selectedValues;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: options.map((option) {
        final selected = selectedValues.contains(option.value);
        return GestureDetector(
          onTap: () => onSelected(option.value),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: selected ? kCobalt : Colors.white,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(
                color: selected ? kCobalt : context.artC.silver,
              ),
            ),
            child: Text(
              option.label,
              style: TextStyle(
                color: selected
                    ? Colors.white
                    : context.artC.ink.withValues(alpha: 0.66),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _ProfileTextField extends StatelessWidget {
  const _ProfileTextField({
    required this.controller,
    required this.label,
    required this.hint,
    this.maxLines = 1,
    this.onChanged,
  });

  final TextEditingController controller;
  final String label;
  final String hint;
  final int maxLines;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(kRadiusMedium),
          borderSide: BorderSide(color: context.artC.silver),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(kRadiusMedium),
          borderSide: BorderSide(color: context.artC.silver),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(kRadiusMedium),
          borderSide: const BorderSide(color: kCobalt, width: 1.5),
        ),
      ),
    );
  }
}

class _ProfileOption {
  final String value;
  final String label;
  final IconData icon;
  final String? description;

  const _ProfileOption(
    this.value,
    this.label,
    this.icon, {
    this.description,
  });
}

class _MajorOption {
  final String value;
  final String label;
  final String category;

  const _MajorOption(this.value, this.label, this.category);
}

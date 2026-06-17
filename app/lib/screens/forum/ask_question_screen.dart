import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../utils/auth_gate.dart';
import '../../widgets/artsee_ui.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class AskQuestionScreen extends StatefulWidget {
  final String? initialTitle;
  final String? initialCategory;
  final String? searchKeyword;
  final String? initialSchool;
  final String? initialProgram;
  final String? sourceCircle;

  const AskQuestionScreen({
    super.key,
    this.initialTitle,
    this.initialCategory,
    this.searchKeyword,
    this.initialSchool,
    this.initialProgram,
    this.sourceCircle,
  });

  @override
  State<AskQuestionScreen> createState() => _AskQuestionScreenState();
}

class _AskQuestionScreenState extends State<AskQuestionScreen> {
  static const _categories = ['艺术留学', '作品集', '行业就业', '艺术市场', '版权法律'];

  late final TextEditingController _titleCtrl;
  final TextEditingController _bodyCtrl = TextEditingController();
  final TextEditingController _schoolCtrl = TextEditingController();
  final TextEditingController _programCtrl = TextEditingController();
  late String _category;
  bool _anonymous = false;
  bool _submitting = false;

  void _safePop([String? result]) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) Navigator.of(context).pop(result);
    });
  }

  @override
  void initState() {
    super.initState();
    final search = widget.searchKeyword?.trim();
    _titleCtrl = TextEditingController(text: widget.initialTitle ?? '');
    _category = widget.initialCategory != null &&
            _categories.contains(widget.initialCategory)
        ? widget.initialCategory!
        : '艺术留学';
    if (search != null && search.isNotEmpty && _titleCtrl.text.isEmpty) {
      _titleCtrl.text = '想问关于「$search」的问题';
    }
    _schoolCtrl.text = widget.initialSchool ?? '';
    _programCtrl.text = widget.initialProgram ?? '';
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _bodyCtrl.dispose();
    _schoolCtrl.dispose();
    _programCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!await ensureLoggedIn(context, message: '请先登录后发布问题')) return;
    final title = _titleCtrl.text.trim();
    if (title.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('标题再具体一点，会更容易获得有效回答')),
      );
      return;
    }
    if (['求助', '问一下', '有人知道吗'].contains(title)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('标题再具体一点，会更容易获得有效回答')),
      );
      return;
    }
    if (_bodyCtrl.text.trim().isEmpty) {
      final shouldPublish = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('补充背景后，回答会更具体'),
          content: const Text('建议说明你的目标学校、作品集进度和最想解决的问题。'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('继续补充'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('直接发布'),
            ),
          ],
        ),
      );
      if (shouldPublish != true) return;
    }
    if (_submitting) return;
    setState(() => _submitting = true);
    try {
      await BackendApiService.createCommunityPost(
        title: title,
        body: _bodyCtrl.text.trim(),
        metadata: {
          'kind': 'qa',
          'category': _category,
          if (_schoolCtrl.text.trim().isNotEmpty)
            'school': _schoolCtrl.text.trim(),
          if (_programCtrl.text.trim().isNotEmpty)
            'program': _programCtrl.text.trim(),
          if (widget.sourceCircle?.trim().isNotEmpty == true)
            'source_circle': widget.sourceCircle!.trim(),
          'anonymous': _anonymous,
        },
      );
      if (!mounted) return;
      _safePop(title);
    } catch (e) {
      if (!mounted) return;
      setState(() => _submitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('发布失败：$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: context.artC.ink, size: 20),
          onPressed: () => _safePop(),
        ),
        centerTitle: true,
        title: Text(
          '发布问题',
          style: TextStyle(
            color: context.artC.ink,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        actions: [
          TextButton(
            onPressed: _submitting ? null : _submit,
            child: Text(_submitting ? '发布中' : '发布'),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          children: [
            _QuestionFieldCard(
              title: '问题标题',
              child: TextField(
                controller: _titleCtrl,
                autofocus: _titleCtrl.text.isEmpty,
                maxLength: 60,
                maxLines: 2,
                decoration: const InputDecoration(
                  hintText: '例如：RCA 作品集一般需要几个完整项目？',
                  border: InputBorder.none,
                  counterText: '',
                ),
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 22,
                  height: 1.25,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            const SizedBox(height: 14),
            _QuestionFieldCard(
              title: '问题方向',
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _categories
                    .map(
                      (item) => GestureDetector(
                        onTap: () => setState(() => _category = item),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 13,
                            vertical: 9,
                          ),
                          decoration: BoxDecoration(
                            color: _category == item
                                ? kCobalt.withOpacity(0.08)
                                : context.artC.cardIconBg,
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(
                              color: _category == item
                                  ? kCobalt.withOpacity(0.28)
                                  : context.artC.silver.withOpacity(0.65),
                            ),
                          ),
                          child: Text(
                            item,
                            style: TextStyle(
                              color: _category == item
                                  ? kCobalt
                                  : context.artC.ink.withOpacity(0.64),
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),
            const SizedBox(height: 14),
            _QuestionFieldCard(
              title: '补充说明',
              subtitle: '补充背景、目标学校、作品集进度和你卡住的地方。',
              child: TextField(
                controller: _bodyCtrl,
                minLines: 5,
                maxLines: 10,
                decoration: InputDecoration(
                  hintText: '例如：\n- 你申请哪个学校 / 专业？\n- 目前作品集有几个项目？\n- 你希望得到什么建议？',
                  border: InputBorder.none,
                  hintStyle: TextStyle(
                    color: context.artC.ink.withOpacity(0.32),
                    fontSize: 13,
                    height: 1.55,
                  ),
                ),
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 14,
                  height: 1.65,
                ),
              ),
            ),
            const SizedBox(height: 14),
            _QuestionFieldCard(
              title: '相关学校 / 项目',
              subtitle: '可选。关联后，后续可以沉淀到学校详情页的相关问答。',
              child: Column(
                children: [
                  _CompactInput(
                    controller: _schoolCtrl,
                    hint: '相关学校，如 Royal College of Art',
                    icon: Icons.school_outlined,
                  ),
                  const SizedBox(height: 10),
                  _CompactInput(
                    controller: _programCtrl,
                    hint: '相关专业 / 项目，如 MA Design Products',
                    icon: Icons.article_outlined,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            ArtseeSurface(
              padding: const EdgeInsets.all(16),
              radius: 18,
              child: Row(
                children: [
                  Icon(Icons.visibility_off_outlined,
                      color: context.artC.ink.withOpacity(0.54)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '匿名提问',
                          style: TextStyle(
                            color: context.artC.ink,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '匿名后，其他用户不会看到你的昵称和头像。',
                          style: TextStyle(
                            color: context.artC.ink.withOpacity(0.42),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: _anonymous,
                    activeColor: kCobalt,
                    onChanged: (value) => setState(() => _anonymous = value),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: _submitting ? null : _submit,
              child: Container(
                height: 52,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: context.artC.ink,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  _submitting ? '发布中...' : '发布问题',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuestionFieldCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget child;

  const _QuestionFieldCard({
    required this.title,
    this.subtitle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return ArtseeSurface(
      padding: const EdgeInsets.all(16),
      radius: 18,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: context.artC.ink,
              fontSize: 13,
              fontWeight: FontWeight.w900,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(
              subtitle!,
              style: TextStyle(
                color: context.artC.ink.withOpacity(0.38),
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}

class _CompactInput extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;

  const _CompactInput({
    required this.controller,
    required this.hint,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: context.artC.silver.withOpacity(0.18),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.artC.silver.withOpacity(0.32)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 17, color: kCobalt.withOpacity(0.72)),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: controller,
              decoration: InputDecoration(
                hintText: hint,
                border: InputBorder.none,
                hintStyle: TextStyle(
                  color: context.artC.ink.withOpacity(0.32),
                  fontSize: 12,
                ),
              ),
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

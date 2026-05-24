import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class AiHomeScreen extends StatefulWidget {
  final bool navigationRevealed;
  final VoidCallback onRevealNavigation;
  final VoidCallback onHideNavigation;
  final int? sidebarRequestToken;

  const AiHomeScreen({
    super.key,
    required this.navigationRevealed,
    required this.onRevealNavigation,
    required this.onHideNavigation,
    this.sidebarRequestToken,
  });

  @override
  State<AiHomeScreen> createState() => AiHomeScreenState();
}

class AiHomeScreenState extends State<AiHomeScreen> {
  final TextEditingController _input = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  final List<_AiConversation> _conversations = [_AiConversation.seed()];
  String _activeConversationId = 'seed';
  Map<String, dynamic>? _profile;
  bool _sending = false;
  double _gestureDy = 0;

  static const _quickPrompts = [
    '根据我的画像推荐 5 所学校',
    '帮我规划作品集时间线',
    '我的预算适合哪些国家？',
    '用案例判断我的申请档位',
  ];

  @override
  void initState() {
    super.initState();
    _input.addListener(() => setState(() {}));
    _loadProfile();
  }

  @override
  void didUpdateWidget(covariant AiHomeScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    final token = widget.sidebarRequestToken;
    if (token != null && token != oldWidget.sidebarRequestToken) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _openConversationSidebar();
      });
    }
  }

  @override
  void dispose() {
    _input.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    final profile = await SupabaseService.fetchProfile();
    if (mounted) setState(() => _profile = profile);
  }

  Future<void> _send([String? preset]) async {
    final text = (preset ?? _input.text).trim();
    if (text.isEmpty || _sending) return;
    final conversation = _activeConversation;
    setState(() {
      if (conversation.title == '新的咨询') {
        conversation.title =
            text.length > 18 ? '${text.substring(0, 18)}…' : text;
      }
      conversation.messages.add(_AiMessage(role: 'user', text: text));
      _sending = true;
    });
    _input.clear();
    _scrollBottom();

    String reply;
    try {
      final response = await BackendApiService.aiConsult(text);
      reply = _formatConsultReply(response);
    } catch (e) {
      reply = '我暂时连不上完整 AI 服务，但可以先按你的画像给出基础建议。你可以继续补充目标国家、专业、预算、语言成绩和作品集阶段。';
    }
    if (!mounted) return;
    setState(() {
      conversation.messages.add(_AiMessage(role: 'assistant', text: reply));
      conversation.updatedAt = DateTime.now();
      _sending = false;
    });
    _scrollBottom();
  }

  _AiConversation get _activeConversation {
    return _conversations.firstWhere(
      (c) => c.id == _activeConversationId,
      orElse: () => _conversations.first,
    );
  }

  String _formatConsultReply(Map<String, dynamic> response) {
    final lines = <String>[];
    final answer = response['answer']?.toString().trim();
    if (answer != null && answer.isNotEmpty) lines.add(answer);

    final sources = response['sources'];
    if (sources is List && sources.isNotEmpty) {
      final sourceLines = sources
          .take(3)
          .map((source) {
            if (source is! Map) return null;
            final school = source['schoolName']?.toString();
            final heading = source['heading']?.toString();
            return [school, heading]
                .where((v) => v != null && v.isNotEmpty)
                .join(' · ');
          })
          .whereType<String>()
          .where((v) => v.isNotEmpty)
          .toList();
      if (sourceLines.isNotEmpty) {
        lines.add('参考来源：\n${sourceLines.map((s) => '· $s').join('\n')}');
      }
    }
    return lines.isEmpty ? '我已经收到你的问题，但暂时没有结构化建议。' : lines.join('\n\n');
  }

  void _newConversation() {
    final id = DateTime.now().microsecondsSinceEpoch.toString();
    setState(() {
      _conversations.insert(0, _AiConversation(id: id));
      _activeConversationId = id;
    });
  }

  void _openConversationSidebar() {
    showGeneralDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierLabel: '最近聊天',
      barrierColor: Colors.black.withValues(alpha: 0.42),
      transitionDuration: const Duration(milliseconds: 240),
      pageBuilder: (ctx, animation, secondaryAnimation) {
        return Align(
          alignment: Alignment.centerLeft,
          child: _AiConversationSidebar(
            conversations: _conversations,
            activeId: _activeConversationId,
            onNew: () {
              Navigator.of(ctx).pop();
              _newConversation();
            },
            onSelect: (id) {
              Navigator.of(ctx).pop();
              setState(() => _activeConversationId = id);
            },
          ),
        );
      },
      transitionBuilder: (ctx, animation, secondaryAnimation, child) {
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(-1, 0),
            end: Offset.zero,
          ).animate(
              CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
          child: child,
        );
      },
    );
  }

  Widget _buildConversationList(BuildContext context) {
    final messages = _activeConversation.messages;
    return ListView(
      controller: _scrollCtrl,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
      children: [
        _AiHero(
          profile: _profile,
          onOpenHistory: _openConversationSidebar,
          onNewChat: _newConversation,
        ),
        const SizedBox(height: 16),
        _QuickPromptGrid(
          prompts: _quickPrompts,
          onTap: _send,
        ),
        const SizedBox(height: 18),
        Row(
          children: [
            Text(
              _activeConversation.title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: context.artC.ink,
              ),
            ),
            const Spacer(),
            TextButton.icon(
              onPressed: _openConversationSidebar,
              icon: const Icon(Icons.history, size: 17),
              label: const Text('最近聊天'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...messages.map((msg) => _MessageBubble(message: msg)),
        if (_sending)
          Padding(
            padding: const EdgeInsets.only(top: 2, bottom: 10),
            child: Text(
              'Artiqore AI 正在思考…',
              style: TextStyle(
                fontSize: 12,
                color: context.artC.ink.withValues(alpha: 0.42),
              ),
            ),
          ),
        SizedBox(
            height:
                widget.navigationRevealed ? mainTabBottomInset(context) : 16),
      ],
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 280,
          child: _AiConversationSidebar(
            conversations: _conversations,
            activeId: _activeConversationId,
            embedded: true,
            onNew: _newConversation,
            onSelect: (id) => setState(() => _activeConversationId = id),
          ),
        ),
        Expanded(child: _buildConversationList(context)),
      ],
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return _buildConversationList(context);
  }

  bool get _isWide {
    final width = MediaQuery.sizeOf(context).width;
    return width >= 820;
  }

  void _scrollBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollCtrl.hasClients) return;
      _scrollCtrl.animateTo(
        _scrollCtrl.position.maxScrollExtent + 96,
        duration: const Duration(milliseconds: 260),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: Listener(
        onPointerMove: (event) {
          _gestureDy += event.delta.dy;
          if (_gestureDy >= 18) {
            widget.onRevealNavigation();
            _gestureDy = 0;
          } else if (_gestureDy <= -18) {
            widget.onHideNavigation();
            _gestureDy = 0;
          }
        },
        onPointerUp: (_) => _gestureDy = 0,
        onPointerCancel: (_) => _gestureDy = 0,
        child: SafeArea(
          top: false,
          child: Column(
            children: [
              Expanded(
                child: _isWide
                    ? _buildDesktopLayout(context)
                    : _buildMobileLayout(context),
              ),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 220),
                switchInCurve: Curves.easeOutCubic,
                switchOutCurve: Curves.easeInCubic,
                child: widget.navigationRevealed
                    ? const SizedBox.shrink()
                    : _AiInputBar(
                        key: const ValueKey('ai-input-bar'),
                        controller: _input,
                        sending: _sending,
                        onSend: () => _send(),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AiConversation {
  final String id;
  String title;
  DateTime updatedAt;
  final List<_AiMessage> messages;

  _AiConversation({
    required this.id,
    this.title = '新的咨询',
    DateTime? updatedAt,
    List<_AiMessage>? messages,
  })  : updatedAt = updatedAt ?? DateTime.now(),
        messages = messages ??
            [
              const _AiMessage(
                role: 'assistant',
                text:
                    '你好，我是 Artiqore AI。告诉我你的目标国家、专业方向、预算或作品集进度，我可以帮你拆选校、时间线和案例参考。',
              ),
            ];

  factory _AiConversation.seed() {
    return _AiConversation(
      id: 'seed',
      title: '申请规划咨询',
    );
  }
}

class _AiMessage {
  final String role;
  final String text;

  const _AiMessage({required this.role, required this.text});
}

class _AiConversationSidebar extends StatelessWidget {
  final List<_AiConversation> conversations;
  final String activeId;
  final ValueChanged<String> onSelect;
  final VoidCallback onNew;
  final bool embedded;

  const _AiConversationSidebar({
    required this.conversations,
    required this.activeId,
    required this.onSelect,
    required this.onNew,
    this.embedded = false,
  });

  @override
  Widget build(BuildContext context) {
    final panel = Container(
      width:
          embedded ? double.infinity : MediaQuery.sizeOf(context).width * 0.78,
      height: double.infinity,
      color: context.artC.porcelain,
      padding: EdgeInsets.fromLTRB(16, embedded ? 20 : 56, 16, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                '最近聊天',
                style: TextStyle(
                  color: context.artC.ink,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 14),
          GestureDetector(
            onTap: onNew,
            behavior: HitTestBehavior.opaque,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              decoration: BoxDecoration(
                color: kCobalt,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: kCobalt.withValues(alpha: 0.18),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Row(
                children: [
                  Icon(
                    Icons.add_comment_outlined,
                    color: Colors.white,
                    size: 20,
                  ),
                  SizedBox(width: 10),
                  Text(
                    '新对话',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Spacer(),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    color: Colors.white,
                    size: 14,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.separated(
              itemCount: conversations.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = conversations[index];
                final active = item.id == activeId;
                return GestureDetector(
                  onTap: () => onSelect(item.id),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: active
                          ? kCobalt.withValues(alpha: 0.1)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: active
                            ? kCobalt
                            : context.artC.silver.withValues(alpha: 0.55),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          color: active
                              ? kCobalt
                              : context.artC.ink.withValues(alpha: 0.42),
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: active ? kCobalt : context.artC.ink,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '${item.messages.length} 条消息',
                                style: TextStyle(
                                  color:
                                      context.artC.ink.withValues(alpha: 0.38),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );

    if (embedded) return panel;
    return Material(color: Colors.transparent, child: panel);
  }
}

class _AiHero extends StatelessWidget {
  final Map<String, dynamic>? profile;
  final VoidCallback onOpenHistory;
  final VoidCallback onNewChat;

  const _AiHero({
    required this.profile,
    required this.onOpenHistory,
    required this.onNewChat,
  });

  @override
  Widget build(BuildContext context) {
    final countries = (profile?['target_countries'] as List?)?.join(' / ');
    final majors = (profile?['target_majors'] as List?)?.join(' / ');
    final summary = [
      if (profile?['target_degree'] != null) profile!['target_degree'],
      if (majors != null && majors.isNotEmpty) majors,
      if (countries != null && countries.isNotEmpty) countries,
    ].join(' · ');

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: context.artC.ink,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [kShadowCard],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: const BoxDecoration(
                  color: kCobalt,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.auto_awesome,
                    color: Colors.white, size: 26),
              ),
              const Spacer(),
              IconButton(
                onPressed: onOpenHistory,
                icon: const Icon(Icons.history),
                color: Colors.white,
                tooltip: '最近聊天',
              ),
              IconButton(
                onPressed: onNewChat,
                icon: const Icon(Icons.add_circle_outline),
                color: Colors.white,
                tooltip: '新聊天',
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'AI 申请工作台',
            style: TextStyle(
              color: Colors.white,
              fontSize: 28,
              height: 1.1,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            summary.isEmpty ? '先问一个关于选校、作品集、预算或案例的问题。' : '你的方向：$summary',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.68),
              fontSize: 13,
              height: 1.45,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickPromptGrid extends StatelessWidget {
  final List<String> prompts;
  final ValueChanged<String> onTap;

  const _QuickPromptGrid({required this.prompts, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: prompts.map((prompt) {
        return GestureDetector(
          onTap: () => onTap(prompt),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(
                  color: context.artC.silver.withValues(alpha: 0.65)),
            ),
            child: Text(
              prompt,
              style: TextStyle(
                color: context.artC.ink.withValues(alpha: 0.76),
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

class _MessageBubble extends StatelessWidget {
  final _AiMessage message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints:
            BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.82),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isUser ? kCobalt : Colors.white,
          borderRadius: BorderRadius.circular(18).copyWith(
            bottomRight: isUser ? const Radius.circular(4) : null,
            bottomLeft: isUser ? null : const Radius.circular(4),
          ),
          border: isUser
              ? null
              : Border.all(color: context.artC.silver.withValues(alpha: 0.45)),
        ),
        child: Text(
          message.text,
          style: TextStyle(
            color: isUser
                ? Colors.white
                : context.artC.ink.withValues(alpha: 0.82),
            fontSize: 13,
            height: 1.45,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

class _AiInputBar extends StatelessWidget {
  final TextEditingController controller;
  final bool sending;
  final VoidCallback onSend;

  const _AiInputBar({
    super.key,
    required this.controller,
    required this.sending,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        16,
        8,
        16,
        MediaQuery.paddingOf(context).bottom + 10,
      ),
      decoration: BoxDecoration(
        color: context.artC.porcelain.withValues(alpha: 0.96),
        border: Border(
          top: BorderSide(color: context.artC.silver.withValues(alpha: 0.42)),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 32,
            height: 4,
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: context.artC.ink.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          Container(
            constraints: const BoxConstraints(maxWidth: 720),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                  color: context.artC.silver.withValues(alpha: 0.56)),
              boxShadow: [
                BoxShadow(
                  color: context.artC.ink.withValues(alpha: 0.05),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => onSend(),
                    minLines: 1,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: '问问 AI：选校、专业、作品集、案例…',
                      hintStyle: TextStyle(
                        fontSize: 13,
                        color: context.artC.ink.withValues(alpha: 0.32),
                      ),
                      filled: true,
                      fillColor: Colors.transparent,
                      contentPadding: const EdgeInsets.fromLTRB(
                        18,
                        14,
                        10,
                        14,
                      ),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: sending ? null : onSend,
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: sending
                            ? context.artC.ink.withValues(alpha: 0.16)
                            : kCobalt,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.arrow_upward_rounded,
                        color: Colors.white,
                        size: 23,
                      ),
                    ),
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

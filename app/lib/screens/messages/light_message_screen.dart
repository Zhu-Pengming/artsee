import 'package:flutter/material.dart';

import '../../services/backend_api_service.dart';
import '../../services/supabase_service.dart';
import '../../theme/artsee_ui_colors.dart';
import '../../widgets/common.dart';

enum LightMessagePeerKind { person, organization }

class LightMessagePeer {
  final String name;
  final String identityLabel;
  final LightMessagePeerKind kind;
  final String? avatarUrl;
  final String? handle;
  final String? serviceStatus;
  final String? responseTime;
  final String? profileActionLabel;
  final WidgetBuilder? profileBuilder;

  const LightMessagePeer({
    required this.name,
    required this.identityLabel,
    required this.kind,
    this.avatarUrl,
    this.handle,
    this.serviceStatus,
    this.responseTime,
    this.profileActionLabel,
    this.profileBuilder,
  });

  factory LightMessagePeer.person({
    required String name,
    String? avatarUrl,
    String? handle,
    String identityLabel = '社区用户',
    WidgetBuilder? profileBuilder,
  }) {
    return LightMessagePeer(
      name: name,
      avatarUrl: avatarUrl,
      handle: handle,
      identityLabel: identityLabel,
      kind: LightMessagePeerKind.person,
      profileActionLabel: '查看主页',
      profileBuilder: profileBuilder,
    );
  }

  factory LightMessagePeer.organization({
    required String name,
    String? avatarUrl,
    String identityLabel = '机构认证',
    String? serviceStatus,
    String? responseTime,
    WidgetBuilder? profileBuilder,
  }) {
    return LightMessagePeer(
      name: name,
      avatarUrl: avatarUrl,
      identityLabel: identityLabel,
      kind: LightMessagePeerKind.organization,
      serviceStatus: serviceStatus ?? '服务中',
      responseTime: responseTime ?? '2小时内',
      profileActionLabel: '查看机构页',
      profileBuilder: profileBuilder,
    );
  }

  factory LightMessagePeer.fromConversation(Map<String, dynamic> conversation) {
    final peerRaw = conversation['peer_profile'];
    final peer = peerRaw is Map ? Map<String, dynamic>.from(peerRaw) : null;
    final metadataRaw = conversation['metadata'];
    final Map<String, dynamic> metadata = metadataRaw is Map
        ? Map<String, dynamic>.from(metadataRaw)
        : <String, dynamic>{};
    final type = conversation['type']?.toString() ?? 'direct';
    final userType = peer?['user_type']?.toString() ??
        metadata['peer_type']?.toString() ??
        metadata['target_type']?.toString();
    final isOrg = userType == 'business' ||
        userType == 'institution' ||
        type == 'organization' ||
        type == 'cooperation' ||
        metadata['organization_name'] != null;
    final fallbackTitle = conversation['title']?.toString().trim();
    final name = peer?['nickname']?.toString().trim().isNotEmpty == true
        ? peer!['nickname'].toString().trim()
        : metadata['organization_name']?.toString().trim().isNotEmpty == true
            ? metadata['organization_name'].toString().trim()
            : fallbackTitle?.isNotEmpty == true
                ? fallbackTitle!
                : isOrg
                    ? '机构会话'
                    : 'Artsee 用户';
    final avatarUrl = peer?['avatar_url']?.toString() ??
        metadata['avatar_url']?.toString() ??
        metadata['logo_url']?.toString();

    if (isOrg) {
      return LightMessagePeer.organization(
        name: name,
        avatarUrl: avatarUrl,
        serviceStatus: metadata['service_status']?.toString() ?? '服务中',
        responseTime: metadata['response_time']?.toString() ?? '2小时内',
      );
    }
    return LightMessagePeer.person(
      name: name,
      avatarUrl: avatarUrl,
      handle: metadata['handle']?.toString(),
      identityLabel: _conversationPersonIdentity(peer, metadata),
    );
  }
}

class LightMessageScreen extends StatefulWidget {
  final Map<String, dynamic>? conversation;
  final LightMessagePeer? peer;
  final String? initialMessage;

  const LightMessageScreen({
    super.key,
    this.conversation,
    this.peer,
    this.initialMessage,
  });

  @override
  State<LightMessageScreen> createState() => _LightMessageScreenState();
}

class _LightMessageScreenState extends State<LightMessageScreen> {
  final TextEditingController _input = TextEditingController();
  final ScrollController _scroll = ScrollController();
  List<Map<String, dynamic>> _messages = const [];
  bool _loading = false;
  bool _sending = false;
  String? _error;

  String? get _conversationId => widget.conversation?['id']?.toString();

  LightMessagePeer get _peer =>
      widget.peer ??
      (widget.conversation != null
          ? LightMessagePeer.fromConversation(widget.conversation!)
          : LightMessagePeer.person(name: 'Artsee 用户'));

  @override
  void initState() {
    super.initState();
    final id = _conversationId;
    if (id != null && id.isNotEmpty) {
      _loadMessages();
    } else {
      _messages = [
        {
          'sender_role': 'peer',
          'body': widget.initialMessage ?? '你好，可以先简单说说想沟通的内容。',
          'created_at': DateTime.now().toIso8601String(),
        }
      ];
    }
  }

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    final id = _conversationId;
    if (id == null || id.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result =
          await BackendApiService.fetchConversationMessages(conversationId: id);
      if (!mounted) return;
      setState(() {
        _messages = result.data.reversed.toList();
        _loading = false;
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    final id = _conversationId;
    try {
      if (id != null && id.isNotEmpty) {
        final message = await BackendApiService.sendConversationMessage(
          conversationId: id,
          body: text,
        );
        if (!mounted) return;
        _input.clear();
        setState(() => _messages = [..._messages, message]);
      } else {
        _input.clear();
        setState(() {
          _messages = [
            ..._messages,
            {
              'sender_id': 'local_me',
              'body': text,
              'created_at': DateTime.now().toIso8601String(),
            }
          ];
        });
      }
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('发送失败：$e')),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _openProfile() {
    final builder = _peer.profileBuilder;
    if (builder == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${_peer.profileActionLabel ?? '主页'}资料同步中')),
      );
      return;
    }
    Navigator.of(context).push<void>(
      MaterialPageRoute<void>(builder: builder),
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scroll.hasClients) return;
      _scroll.animateTo(
        _scroll.position.maxScrollExtent,
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final peer = _peer;
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        child: Column(
          children: [
            _LightMessageTopBar(peer: peer),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
              child: _PeerIdentityCard(peer: peer, onOpenProfile: _openProfile),
            ),
            Expanded(
              child: _loading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: kCobalt,
                        strokeWidth: 2.5,
                      ),
                    )
                  : _error != null
                      ? _MessageErrorState(
                          error: _error!, onRetry: _loadMessages)
                      : ListView.builder(
                          controller: _scroll,
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
                          itemCount: _messages.length,
                          itemBuilder: (_, index) => _MessageBubbleLite(
                            message: _messages[index],
                            peer: peer,
                          ),
                        ),
            ),
            _LightMessageInputBar(
              controller: _input,
              sending: _sending,
              onSend: _send,
            ),
          ],
        ),
      ),
    );
  }
}

class _LightMessageTopBar extends StatelessWidget {
  final LightMessagePeer peer;

  const _LightMessageTopBar({required this.peer});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 6, 12, 6),
      child: Row(
        children: [
          IconButton(
            tooltip: '返回',
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
            color: context.artC.ink,
            onPressed: () => Navigator.of(context).pop(),
          ),
          Expanded(
            child: Text(
              peer.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: context.artC.ink,
                fontSize: 17,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PeerIdentityCard extends StatelessWidget {
  final LightMessagePeer peer;
  final VoidCallback onOpenProfile;

  const _PeerIdentityCard({
    required this.peer,
    required this.onOpenProfile,
  });

  @override
  Widget build(BuildContext context) {
    final isOrg = peer.kind == LightMessagePeerKind.organization;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.32)),
      ),
      child: Row(
        children: [
          _PeerAvatar(peer: peer, size: 48),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        peer.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: context.artC.ink,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(
                      isOrg
                          ? Icons.storefront_outlined
                          : Icons.verified_outlined,
                      size: 16,
                      color: kCobalt,
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    _LightIdentityChip(label: peer.identityLabel),
                    if (!isOrg && peer.handle?.isNotEmpty == true)
                      _LightIdentityChip(label: peer.handle!),
                    if (isOrg) _LightIdentityChip(label: peer.serviceStatus!),
                    if (isOrg) _LightIdentityChip(label: peer.responseTime!),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          OutlinedButton(
            onPressed: onOpenProfile,
            style: OutlinedButton.styleFrom(
              foregroundColor: context.artC.ink,
              side:
                  BorderSide(color: context.artC.silver.withValues(alpha: 0.6)),
              visualDensity: VisualDensity.compact,
            ),
            child: Text(peer.profileActionLabel ?? '查看主页'),
          ),
        ],
      ),
    );
  }
}

class _PeerAvatar extends StatelessWidget {
  final LightMessagePeer peer;
  final double size;

  const _PeerAvatar({required this.peer, required this.size});

  @override
  Widget build(BuildContext context) {
    final url = peer.avatarUrl?.trim();
    return ClipRRect(
      borderRadius: BorderRadius.circular(
        peer.kind == LightMessagePeerKind.organization ? 12 : size / 2,
      ),
      child: SizedBox(
        width: size,
        height: size,
        child: url != null && url.isNotEmpty
            ? Image.network(
                url,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _PeerAvatarFallback(peer: peer),
              )
            : _PeerAvatarFallback(peer: peer),
      ),
    );
  }
}

class _PeerAvatarFallback extends StatelessWidget {
  final LightMessagePeer peer;

  const _PeerAvatarFallback({required this.peer});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: kCobalt.withValues(alpha: 0.08),
      child: Center(
        child: Text(
          peer.name.isEmpty ? '艺' : peer.name.characters.first,
          style: const TextStyle(
            color: kCobalt,
            fontSize: 18,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _LightIdentityChip extends StatelessWidget {
  final String label;

  const _LightIdentityChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: kCobalt,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _MessageBubbleLite extends StatelessWidget {
  final Map<String, dynamic> message;
  final LightMessagePeer peer;

  const _MessageBubbleLite({required this.message, required this.peer});

  @override
  Widget build(BuildContext context) {
    final mine = _isMine(message);
    final body = message['body']?.toString() ?? '';
    if (body.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment:
            mine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!mine) ...[
            _PeerAvatar(peer: peer, size: 30),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
              decoration: BoxDecoration(
                color: mine ? kCobalt : context.artC.cardIconBg,
                borderRadius: BorderRadius.circular(8),
                border: mine
                    ? null
                    : Border.all(
                        color: context.artC.silver.withValues(alpha: 0.34),
                      ),
              ),
              child: Text(
                body,
                style: TextStyle(
                  color: mine ? Colors.white : context.artC.ink,
                  fontSize: 13,
                  height: 1.45,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
          if (mine) const SizedBox(width: 38),
        ],
      ),
    );
  }
}

class _LightMessageInputBar extends StatelessWidget {
  final TextEditingController controller;
  final bool sending;
  final VoidCallback onSend;

  const _LightMessageInputBar({
    required this.controller,
    required this.sending,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.artC.porcelain,
        border: Border(
          top: BorderSide(color: context.artC.silver.withValues(alpha: 0.4)),
        ),
      ),
      padding: const EdgeInsets.fromLTRB(14, 9, 14, 9),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 13),
                decoration: BoxDecoration(
                  color: context.artC.cardIconBg,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: context.artC.silver.withValues(alpha: 0.52),
                  ),
                ),
                child: TextField(
                  controller: controller,
                  minLines: 1,
                  maxLines: 4,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => onSend(),
                  decoration: InputDecoration(
                    hintText: '写一条消息...',
                    border: InputBorder.none,
                    hintStyle: TextStyle(
                      color: context.artC.ink.withValues(alpha: 0.34),
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  style: TextStyle(
                    color: context.artC.ink,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            GestureDetector(
              onTap: sending ? null : onSend,
              child: Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: sending ? kCobalt.withValues(alpha: 0.45) : kCobalt,
                  shape: BoxShape.circle,
                ),
                child: sending
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Icon(Icons.arrow_upward_rounded,
                        color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MessageErrorState extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const _MessageErrorState({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off_outlined,
                color: context.artC.ink.withValues(alpha: 0.25), size: 36),
            const SizedBox(height: 10),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: context.artC.ink.withValues(alpha: 0.5),
                fontSize: 12,
                height: 1.45,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('重试')),
          ],
        ),
      ),
    );
  }
}

bool _isMine(Map<String, dynamic> message) {
  final currentUserId = SupabaseService.currentUser?.id;
  final senderId = message['sender_id']?.toString();
  final role = message['sender_role']?.toString();
  return senderId == 'local_me' ||
      (currentUserId != null && senderId == currentUserId) ||
      role == 'me' ||
      role == 'user';
}

String _conversationPersonIdentity(
  Map<String, dynamic>? peer,
  Map<String, dynamic> metadata,
) {
  final role = peer?['user_role']?.toString() ??
      metadata['user_role']?.toString() ??
      metadata['peer_role']?.toString();
  return switch (role) {
    'artist' => '认证艺术家',
    'mentor' => '导师',
    'student' => '学生',
    _ => metadata['identity_label']?.toString() ?? '用户',
  };
}

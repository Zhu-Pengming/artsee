import 'package:flutter/material.dart';

import '../messages/light_message_screen.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

enum PublicUserProfileKind { artist, student, mentor, user }

class PublicUserProfileScreen extends StatefulWidget {
  final String name;
  final String? handle;
  final String? avatarUrl;
  final String? roleLabel;
  final String? bio;
  final PublicUserProfileKind kind;
  final String? featuredAnswer;
  final String? featuredAnswerContext;
  final String? featuredActivity;

  const PublicUserProfileScreen({
    super.key,
    required this.name,
    this.handle,
    this.avatarUrl,
    this.roleLabel,
    this.bio,
    this.kind = PublicUserProfileKind.user,
    this.featuredAnswer,
    this.featuredAnswerContext,
    this.featuredActivity,
  });

  @override
  State<PublicUserProfileScreen> createState() =>
      _PublicUserProfileScreenState();
}

class _PublicUserProfileScreenState extends State<PublicUserProfileScreen> {
  late int _selectedTab;
  bool _following = false;

  @override
  void initState() {
    super.initState();
    _selectedTab = _initialTabFor(widget.kind);
  }

  @override
  Widget build(BuildContext context) {
    final profile = _PublicProfileData.fromWidget(widget);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: context.artC.porcelain,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon:
              Icon(Icons.arrow_back_ios_new, size: 18, color: context.artC.ink),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          profile.handle,
          style: TextStyle(
            color: context.artC.ink,
            fontSize: 15,
            fontWeight: FontWeight.w900,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _PublicProfileHeader(
                profile: profile,
                following: _following,
                onFollow: () => setState(() => _following = !_following),
                onMessage: () {
                  Navigator.of(context).push<void>(
                    MaterialPageRoute<void>(
                      builder: (_) => LightMessageScreen(
                        peer: LightMessagePeer.person(
                          name: profile.name,
                          avatarUrl: profile.avatarUrl,
                          handle: profile.handle,
                          identityLabel: profile.roleLabel,
                          profileBuilder: (_) => PublicUserProfileScreen(
                            name: profile.name,
                            handle: profile.handle,
                            avatarUrl: profile.avatarUrl,
                            roleLabel: profile.roleLabel,
                            bio: profile.bio,
                            kind: profile.kind,
                            featuredAnswer: profile.featuredAnswer,
                            featuredAnswerContext:
                                profile.featuredAnswerContext,
                            featuredActivity: profile.featuredActivity,
                          ),
                        ),
                        initialMessage: '你好，我对你的作品和主页内容感兴趣，想先简单聊聊。',
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 18),
              _PublicProfileTabs(
                selectedIndex: _selectedTab,
                onChanged: (index) => setState(() => _selectedTab = index),
              ),
              const SizedBox(height: 14),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 180),
                child: _buildTabBody(profile),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabBody(_PublicProfileData profile) {
    return switch (_selectedTab) {
      0 => _WorksGrid(profile: profile, key: const ValueKey('works')),
      1 => _ActivityList(profile: profile, key: const ValueKey('activity')),
      2 => _AnswerList(profile: profile, key: const ValueKey('answers')),
      _ => _ExperienceList(profile: profile, key: const ValueKey('saved')),
    };
  }
}

class _PublicProfileData {
  final String name;
  final String handle;
  final String avatarUrl;
  final String roleLabel;
  final String bio;
  final PublicUserProfileKind kind;
  final int followers;
  final int views;
  final int following;
  final int works;
  final String seed;
  final String? featuredAnswer;
  final String? featuredAnswerContext;
  final String? featuredActivity;

  const _PublicProfileData({
    required this.name,
    required this.handle,
    required this.avatarUrl,
    required this.roleLabel,
    required this.bio,
    required this.kind,
    required this.followers,
    required this.views,
    required this.following,
    required this.works,
    required this.seed,
    this.featuredAnswer,
    this.featuredAnswerContext,
    this.featuredActivity,
  });

  factory _PublicProfileData.fromWidget(PublicUserProfileScreen widget) {
    final cleanName =
        widget.name.trim().isEmpty ? 'Artsee 用户' : widget.name.trim();
    final seed = _stableSeed(widget.handle ?? cleanName);
    return _PublicProfileData(
      name: cleanName,
      handle: _normalizeHandle(widget.handle, seed),
      avatarUrl: widget.avatarUrl?.trim() ?? '',
      roleLabel: widget.roleLabel?.trim().isNotEmpty == true
          ? widget.roleLabel!.trim()
          : _defaultRoleLabel(widget.kind),
      bio: widget.bio?.trim().isNotEmpty == true
          ? widget.bio!.trim()
          : _defaultBio(widget.kind, cleanName),
      kind: widget.kind,
      followers: 180 + (seed.hashCode.abs() % 8200),
      views: 1200 + (seed.hashCode.abs() % 78000),
      following: 24 + (seed.hashCode.abs() % 240),
      works: _defaultWorksCount(widget.kind, seed),
      seed: seed,
      featuredAnswer: widget.featuredAnswer?.trim(),
      featuredAnswerContext: widget.featuredAnswerContext?.trim(),
      featuredActivity: widget.featuredActivity?.trim(),
    );
  }
}

class _PublicProfileHeader extends StatelessWidget {
  final _PublicProfileData profile;
  final bool following;
  final VoidCallback onFollow;
  final VoidCallback onMessage;

  const _PublicProfileHeader({
    required this.profile,
    required this.following,
    required this.onFollow,
    required this.onMessage,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _PublicAvatar(profile: profile, size: 82),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profile.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: context.artC.ink,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'Noto Serif SC',
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    profile.handle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: context.artC.ink.withValues(alpha: 0.46),
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 9),
                  _IdentityChip(label: profile.roleLabel),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Text(
          profile.bio,
          style: TextStyle(
            color: context.artC.ink.withValues(alpha: 0.72),
            fontSize: 13,
            height: 1.5,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 16),
        _StatsRow(profile: profile),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _ProfileCommandButton(
                label: following ? '已关注' : '关注',
                icon: following ? Icons.check_rounded : Icons.add_rounded,
                filled: !following,
                onTap: onFollow,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _ProfileCommandButton(
                label: '私信',
                icon: Icons.chat_bubble_outline_rounded,
                filled: false,
                onTap: onMessage,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _PublicAvatar extends StatelessWidget {
  final _PublicProfileData profile;
  final double size;

  const _PublicAvatar({required this.profile, required this.size});

  @override
  Widget build(BuildContext context) {
    final initial = profile.name.characters.first.toUpperCase();
    return Container(
      width: size,
      height: size,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: kCobalt.withValues(alpha: 0.42), width: 1.4),
      ),
      child: ClipOval(
        child: profile.avatarUrl.isNotEmpty
            ? Image.network(
                profile.avatarUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _AvatarFallback(initial: initial),
              )
            : _AvatarFallback(initial: initial),
      ),
    );
  }
}

class _AvatarFallback extends StatelessWidget {
  final String initial;

  const _AvatarFallback({required this.initial});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: kCobalt.withValues(alpha: 0.08),
      child: Center(
        child: Text(
          initial,
          style: const TextStyle(
            color: kCobalt,
            fontSize: 26,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _IdentityChip extends StatelessWidget {
  final String label;

  const _IdentityChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: kCobalt.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: kCobalt.withValues(alpha: 0.18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.verified_rounded, size: 14, color: kCobalt),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              color: kCobalt,
              fontSize: 11,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final _PublicProfileData profile;

  const _StatsRow({required this.profile});

  @override
  Widget build(BuildContext context) {
    final stats = [
      ('粉丝', _compact(profile.followers)),
      ('浏览', _compact(profile.views)),
      ('关注', '${profile.following}'),
      ('作品', '${profile.works}'),
    ];
    return Row(
      children: stats
          .map(
            (item) => Expanded(
              child: Column(
                children: [
                  Text(
                    item.$2,
                    style: TextStyle(
                      color: context.artC.ink,
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.$1,
                    style: TextStyle(
                      color: context.artC.ink.withValues(alpha: 0.42),
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

class _ProfileCommandButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool filled;
  final VoidCallback onTap;

  const _ProfileCommandButton({
    required this.label,
    required this.icon,
    required this.filled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 42,
        decoration: BoxDecoration(
          color: filled ? kCobalt : context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(10),
          border: filled
              ? null
              : Border.all(color: context.artC.silver.withValues(alpha: 0.55)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 17,
              color: filled ? Colors.white : context.artC.ink,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: filled ? Colors.white : context.artC.ink,
                fontSize: 13,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PublicProfileTabs extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  const _PublicProfileTabs({
    required this.selectedIndex,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    const tabs = ['作品', '动态', '回答', '收藏 / 经历'];
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: context.artC.silver.withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: List.generate(tabs.length, (index) {
          final active = selectedIndex == index;
          return Expanded(
            child: GestureDetector(
              onTap: () => onChanged(index),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: active ? context.artC.cardIconBg : Colors.transparent,
                  borderRadius: BorderRadius.circular(9),
                  boxShadow: active
                      ? [
                          BoxShadow(
                            color: context.artC.ink.withValues(alpha: 0.045),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ]
                      : null,
                ),
                child: Text(
                  tabs[index],
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: active
                        ? context.artC.ink
                        : context.artC.ink.withValues(alpha: 0.46),
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _WorksGrid extends StatelessWidget {
  final _PublicProfileData profile;

  const _WorksGrid({super.key, required this.profile});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 9,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 4,
        crossAxisSpacing: 4,
      ),
      itemBuilder: (_, index) => _WorkTile(profile: profile, index: index),
    );
  }
}

class _WorkTile extends StatelessWidget {
  final _PublicProfileData profile;
  final int index;

  const _WorkTile({required this.profile, required this.index});

  @override
  Widget build(BuildContext context) {
    final seed = Uri.encodeComponent('${profile.seed}_${index + 1}');
    return ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.network(
            'https://picsum.photos/seed/artsee_$seed/420/420',
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _WorkFallback(index: index),
          ),
          if (index == 0)
            Positioned(
              left: 6,
              bottom: 6,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.48),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  '代表作',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _WorkFallback extends StatelessWidget {
  final int index;

  const _WorkFallback({required this.index});

  @override
  Widget build(BuildContext context) {
    final colors = [
      const Color(0xFFE7EEF8),
      const Color(0xFFF0ECE4),
      const Color(0xFFE8F3EE),
      const Color(0xFFF4E8EA),
    ];
    return Container(
      color: colors[index % colors.length],
      child: Icon(
        Icons.image_outlined,
        color: kCobalt.withValues(alpha: 0.36),
      ),
    );
  }
}

class _ActivityList extends StatelessWidget {
  final _PublicProfileData profile;

  const _ActivityList({super.key, required this.profile});

  @override
  Widget build(BuildContext context) {
    final activity = profile.featuredActivity?.isNotEmpty == true
        ? profile.featuredActivity!
        : switch (profile.kind) {
            PublicUserProfileKind.artist => '更新了 3 张装置作品过程图，正在整理展览现场记录。',
            PublicUserProfileKind.student => '发布了最新作品集进度，并补充了申请时间线。',
            PublicUserProfileKind.mentor => '分享了一组作品集面试复盘和案例拆解。',
            PublicUserProfileKind.user => '参与了社区讨论，并收藏了新的院校案例。',
          };
    return Column(
      key: key,
      children: [
        _TextCard(
          icon: Icons.auto_awesome_mosaic_outlined,
          title: '最新动态',
          subtitle: activity,
        ),
        const SizedBox(height: 10),
        const _TextCard(
          icon: Icons.photo_library_outlined,
          title: '作品更新',
          subtitle: '新增作品图集，包含草图、过程稿和最终呈现。',
        ),
      ],
    );
  }
}

class _AnswerList extends StatelessWidget {
  final _PublicProfileData profile;

  const _AnswerList({super.key, required this.profile});

  @override
  Widget build(BuildContext context) {
    final featured = profile.featuredAnswer?.isNotEmpty == true
        ? profile.featuredAnswer!
        : switch (profile.kind) {
            PublicUserProfileKind.mentor => '我会先看作品集的叙事线，再判断项目数量，而不是只看单张完成度。',
            PublicUserProfileKind.artist => '创作陈述里最重要的是材料、现场和观看关系是否能互相支撑。',
            PublicUserProfileKind.student =>
              '申请准备里，最好把调研、实验和成品图分开整理，面试时更容易讲清楚。',
            PublicUserProfileKind.user => '这个话题可以从真实案例和申请阶段拆开看，不同背景的结论会不一样。',
          };
    return Column(
      key: key,
      children: [
        _TextCard(
          icon: Icons.question_answer_outlined,
          title: profile.featuredAnswerContext?.isNotEmpty == true
              ? profile.featuredAnswerContext!
              : '讨论回答',
          subtitle: featured,
        ),
        const SizedBox(height: 10),
        const _TextCard(
          icon: Icons.forum_outlined,
          title: '社区观点',
          subtitle: '围绕作品集、院校选择和职业路径持续参与讨论。',
        ),
      ],
    );
  }
}

class _ExperienceList extends StatelessWidget {
  final _PublicProfileData profile;

  const _ExperienceList({super.key, required this.profile});

  @override
  Widget build(BuildContext context) {
    final title = switch (profile.kind) {
      PublicUserProfileKind.mentor => '案例 / 经历',
      PublicUserProfileKind.artist => '展览 / 收藏',
      PublicUserProfileKind.student => '收藏 / 经历',
      PublicUserProfileKind.user => '收藏 / 参与',
    };
    return Column(
      key: key,
      children: [
        _TextCard(
          icon: Icons.bookmark_border_rounded,
          title: title,
          subtitle: _experienceText(profile.kind),
        ),
        const SizedBox(height: 10),
        const _TextCard(
          icon: Icons.visibility_outlined,
          title: '公开记录',
          subtitle: '收藏内容、参与讨论和可公开经历会沉淀在这里。',
        ),
      ],
    );
  }
}

class _TextCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _TextCard({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.artC.cardIconBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.32)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: kCobalt.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: kCobalt, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
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
                const SizedBox(height: 6),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: context.artC.ink.withValues(alpha: 0.64),
                    fontSize: 12,
                    height: 1.48,
                    fontWeight: FontWeight.w700,
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

int _initialTabFor(PublicUserProfileKind kind) {
  return switch (kind) {
    PublicUserProfileKind.artist => 0,
    PublicUserProfileKind.student => 0,
    PublicUserProfileKind.mentor => 2,
    PublicUserProfileKind.user => 1,
  };
}

String _defaultRoleLabel(PublicUserProfileKind kind) {
  return switch (kind) {
    PublicUserProfileKind.artist => '认证艺术家',
    PublicUserProfileKind.student => '在读学生',
    PublicUserProfileKind.mentor => '导师 / 顾问',
    PublicUserProfileKind.user => '社区用户',
  };
}

String _defaultBio(PublicUserProfileKind kind, String name) {
  return switch (kind) {
    PublicUserProfileKind.artist => '$name 正在展示作品、展览记录和创作观点。',
    PublicUserProfileKind.student => '$name 关注作品集、申请经验和院校选择。',
    PublicUserProfileKind.mentor => '$name 分享作品集案例、申请判断和面试经验。',
    PublicUserProfileKind.user => '$name 参与艺术社区讨论，收藏作品与案例。',
  };
}

int _defaultWorksCount(PublicUserProfileKind kind, String seed) {
  final offset = seed.hashCode.abs() % 12;
  return switch (kind) {
    PublicUserProfileKind.artist => 18 + offset,
    PublicUserProfileKind.student => 8 + offset,
    PublicUserProfileKind.mentor => 6 + offset,
    PublicUserProfileKind.user => 3 + offset,
  };
}

String _experienceText(PublicUserProfileKind kind) {
  return switch (kind) {
    PublicUserProfileKind.artist => '展览经历、代表项目和公开收藏会在这里集中展示。',
    PublicUserProfileKind.student => '作品集节点、申请经历和收藏案例会沉淀在这里。',
    PublicUserProfileKind.mentor => '辅导案例、院校方向和从业经历会作为信任依据展示。',
    PublicUserProfileKind.user => '收藏的内容和参与过的讨论会帮助别人理解兴趣方向。',
  };
}

String _normalizeHandle(String? raw, String seed) {
  final text = raw?.trim();
  if (text != null && text.isNotEmpty) {
    final prefixed = text.startsWith('@') ? text : '@$text';
    return prefixed.replaceAll(RegExp(r'\s+'), '_');
  }
  return '@artsee_$seed';
}

String _stableSeed(String raw) {
  final cleaned = raw
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9]+'), '_')
      .replaceAll(RegExp(r'^_+|_+$'), '');
  if (cleaned.isNotEmpty) return cleaned;
  return (raw.hashCode.abs() % 99999).toString().padLeft(5, '0');
}

String _compact(int value) {
  if (value >= 10000) {
    final v = value / 10000;
    return '${v.toStringAsFixed(v >= 10 ? 0 : 1)}w';
  }
  if (value >= 1000) {
    final v = value / 1000;
    return '${v.toStringAsFixed(v >= 10 ? 0 : 1)}k';
  }
  return '$value';
}

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../services/backend_api_service.dart';
import '../../services/storage_service.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// 注册后冷启动：选择感兴趣的艺术领域（写入 `user_profiles.interested_categories`）
class ArtInterestOnboardingScreen extends StatefulWidget {
  const ArtInterestOnboardingScreen({super.key, required this.onCompleted});

  final VoidCallback onCompleted;

  @override
  State<ArtInterestOnboardingScreen> createState() => _ArtInterestOnboardingScreenState();
}

class _ArtInterestOnboardingScreenState extends State<ArtInterestOnboardingScreen> {
  final Set<String> _selected = {};
  final Set<String> _uploading = {};
  bool _saving = false;
  String? _error;
  String? _avatarUrl;

  static const List<_Topic> _topics = [
    _Topic('painting', '绘画', Icons.brush_outlined),
    _Topic('sculpture', '雕塑', Icons.view_in_ar_outlined),
    _Topic('design', '设计', Icons.design_services_outlined),
    _Topic('photography', '摄影', Icons.camera_alt_outlined),
    _Topic('fashion', '时尚', Icons.checkroom_outlined),
    _Topic('architecture', '建筑', Icons.architecture),
    _Topic('film', '影视', Icons.movie_outlined),
    _Topic('music', '音乐', Icons.music_note_outlined),
    _Topic('ceramics', '陶艺', Icons.coffee_outlined),
    _Topic('calligraphy', '书法', Icons.edit_outlined),
    _Topic('digital_art', '数字艺术', Icons.computer_outlined),
    _Topic('crafts', '手工艺', Icons.handyman_outlined),
  ];

  void _toggle(String id) {
    setState(() {
      if (_selected.contains(id)) {
        _selected.remove(id);
      } else if (_selected.length < 8) {
        _selected.add(id);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('最多选择 8 个领域')),
        );
      }
    });
  }

  Future<void> _pickAndUploadAvatar() async {
    final picker = ImagePicker();
    final x = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1024, maxHeight: 1024, imageQuality: 85);
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
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _uploading.remove('avatar'));
    }
  }

  Future<void> _submit() async {
    if (_selected.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请至少选择 2 个感兴趣的领域')),
      );
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final userId = SupabaseService.currentUser?.id;
      if (userId == null) {
        throw Exception('用户未登录');
      }
      print('[ArtInterestOnboardingScreen] Submitting onboarding with userId: $userId, categories: ${_selected.toList()}');
      await BackendApiService.completeOnboarding(
        userId: userId,
        interestedCategories: _selected.toList(),
      );
      print('[ArtInterestOnboardingScreen] Onboarding completed successfully');
      widget.onCompleted();
    } catch (e) {
      print('[ArtInterestOnboardingScreen] Error: $e');
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '完善你的艺术画像',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: context.artC.ink,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '选择你感兴趣或擅长的领域，帮助我们为你推荐更相关的内容。',
                      style: TextStyle(
                        fontSize: 14,
                        color: context.artC.ink.withOpacity(0.55),
                        height: 1.45,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      '头像（可选）',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: context.artC.ink.withOpacity(0.75),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        GestureDetector(
                          onTap: _uploading.contains('avatar') ? null : _pickAndUploadAvatar,
                          child: Container(
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(color: context.artC.silver, width: 2),
                              boxShadow: [kShadowCard],
                            ),
                            child: _uploading.contains('avatar')
                                ? Padding(
                                    padding: EdgeInsets.all(20),
                                    child: CircularProgressIndicator(strokeWidth: 2, color: kCobalt),
                                  )
                                : _avatarUrl != null
                                    ? ClipOval(
                                        child: Image.network(
                                          _avatarUrl!,
                                          width: 72,
                                          height: 72,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => Icon(Icons.add_a_photo_outlined, color: kCobalt, size: 28),
                                        ),
                                      )
                                    : Icon(Icons.add_a_photo_outlined, color: kCobalt, size: 28),
                          ),
                        ),
                      ],
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(_error!, style: TextStyle(fontSize: 12, color: Colors.red)),
                    ],
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 0.92,
                ),
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) {
                    final t = _topics[i];
                    final on = _selected.contains(t.id);
                    return GestureDetector(
                      onTap: () => _toggle(t.id),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        decoration: BoxDecoration(
                          color: on ? kCobalt.withOpacity(0.12) : Colors.white,
                          borderRadius: BorderRadius.circular(kRadiusMedium),
                          border: Border.all(
                            color: on ? kCobalt : context.artC.silver.withOpacity(0.8),
                            width: on ? 1.5 : 1,
                          ),
                          boxShadow: on ? [kShadowCard] : null,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(t.icon, color: on ? kCobalt : context.artC.ink.withOpacity(0.45), size: 26),
                            const SizedBox(height: 6),
                            Text(
                              t.label,
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: on ? kCobalt : context.artC.ink.withOpacity(0.75),
                                height: 1.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  childCount: _topics.length,
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                child: Column(
                  children: [
                    Text(
                      '已选 ${_selected.length} / 8（至少 2 个）',
                      style: TextStyle(fontSize: 12, color: context.artC.ink.withOpacity(0.45)),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _saving ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: kCobalt,
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
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : Text('进入 Artiqore', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Topic {
  final String id;
  final String label;
  final IconData icon;

  const _Topic(this.id, this.label, this.icon);
}

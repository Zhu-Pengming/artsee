import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../services/backend_api_service.dart';
import '../../services/storage_service.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';

/// 发布社区图文（图 + 文），图片入 Supabase Storage，元数据经 Next `/api/v1/community/posts` 写入 `community_posts`
class NewCommunityPostScreen extends StatefulWidget {
  const NewCommunityPostScreen({super.key});

  @override
  State<NewCommunityPostScreen> createState() => _NewCommunityPostScreenState();
}

class _NewCommunityPostScreenState extends State<NewCommunityPostScreen> {
  final _title = TextEditingController();
  final _body = TextEditingController();
  final _picker = ImagePicker();
  final List<String> _urls = [];
  bool _busy = false;

  @override
  void dispose() {
    _title.dispose();
    _body.dispose();
    super.dispose();
  }

  Future<void> _pick() async {
    final x = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (x == null) return;
    if (!SupabaseService.isLoggedIn) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('请先登录')));
      }
      return;
    }
    setState(() => _busy = true);
    try {
      final bytes = await x.readAsBytes();
      final name = 'community/${DateTime.now().millisecondsSinceEpoch}_${x.name.split('/').last}';
      final url = await StorageService.uploadUserObject(
        relativePath: name,
        bytes: bytes,
        contentType: 'image/jpeg',
      );
      setState(() => _urls.add(url));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('上传失败：$e')));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _submit() async {
    if (!SupabaseService.isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('请先登录')));
      return;
    }
    final title = _title.text.trim();
    final body = _body.text.trim();
    if (title.isEmpty && body.isEmpty && _urls.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('请填写标题或正文，或添加图片')));
      return;
    }
    setState(() => _busy = true);
    try {
      await BackendApiService.createCommunityPost(
        title: title.isEmpty ? '作品分享' : title,
        body: body.isEmpty ? null : body,
        imageUrls: _urls,
      );
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('发布失败：$e')));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kPorcelain,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('发布作品', style: TextStyle(color: kInk, fontWeight: FontWeight.w700)),
        actions: [
          TextButton(
            onPressed: _busy ? null : _submit,
            child: Text(_busy ? '…' : '发布', style: const TextStyle(color: kCobalt, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: _title,
            decoration: const InputDecoration(
              labelText: '标题',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _body,
            minLines: 4,
            maxLines: 10,
            decoration: const InputDecoration(
              labelText: '正文',
              alignLabelWithHint: true,
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final u in _urls)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(u, width: 72, height: 72, fit: BoxFit.cover),
                ),
              OutlinedButton.icon(
                onPressed: _busy ? null : _pick,
                icon: const Icon(Icons.add_photo_alternate_outlined),
                label: const Text('添加图片'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

/// 小红书风格图文发布编辑器
class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key});

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final List<XFile> _images = [];
  final TextEditingController _titleCtrl = TextEditingController();
  final TextEditingController _contentCtrl = TextEditingController();
  bool _publishing = false;

  Future<void> _pickImages() async {
    final picker = ImagePicker();
    final picked = await picker.pickMultiImage();
    if (picked.isNotEmpty) {
      setState(() => _images.addAll(picked));
    }
  }

  Future<void> _publish() async {
    if (_images.isEmpty && _titleCtrl.text.trim().isEmpty && _contentCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请至少添加一张图片或输入一些内容')),
      );
      return;
    }
    setState(() => _publishing = true);
    await Future.delayed(const Duration(seconds: 1));
    if (!mounted) return;
    setState(() => _publishing = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('发布成功')),
    );
    Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _contentCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: context.artC.ink, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '发布图文',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: context.artC.ink),
        ),
        actions: [
          TextButton(
            onPressed: _publishing ? null : _publish,
            child: _publishing
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: kCobalt),
                  )
                : Text(
                    '发布',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: kCobalt,
                    ),
                  ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 图片选择区
              SizedBox(
                height: 110,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _images.length + 1,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (ctx, i) {
                    if (i == _images.length) {
                      return _buildAddImageBox();
                    }
                    return _buildImageThumb(_images[i], i);
                  },
                ),
              ),
              const SizedBox(height: 20),
              // 标题
              TextField(
                controller: _titleCtrl,
                decoration: InputDecoration(
                  hintText: '填写标题会有更多赞哦~',
                  hintStyle: TextStyle(fontSize: 18, color: context.artC.silver, fontWeight: FontWeight.w600),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: context.artC.ink),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              // 正文
              TextField(
                controller: _contentCtrl,
                decoration: InputDecoration(
                  hintText: '添加正文…',
                  hintStyle: TextStyle(fontSize: 14, color: context.artC.silver),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
                style: TextStyle(fontSize: 14, height: 1.6, color: context.artC.ink),
                maxLines: null,
                minLines: 6,
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAddImageBox() {
    return GestureDetector(
      onTap: _pickImages,
      child: Container(
        width: 110,
        height: 110,
        decoration: BoxDecoration(
          color: context.artC.silver.withOpacity(0.25),
          borderRadius: BorderRadius.circular(kRadiusMedium),
          border: Border.all(color: context.artC.silver.withOpacity(0.6), width: 1),
        ),
        child: Icon(Icons.add_photo_alternate_outlined, color: kCobaltMuted, size: 32),
      ),
    );
  }

  Widget _buildImageThumb(XFile file, int index) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(kRadiusMedium),
      child: Stack(
        children: [
          Image.network(
            file.path,
            width: 110,
            height: 110,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: 110,
              height: 110,
              color: context.artC.silver.withOpacity(0.35),
              child: Icon(Icons.broken_image_outlined, color: context.artC.silver),
            ),
          ),
          Positioned(
            top: 4,
            right: 4,
            child: GestureDetector(
              onTap: () => setState(() => _images.removeAt(index)),
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.black45,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.close, size: 14, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

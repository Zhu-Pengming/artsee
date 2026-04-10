import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../../models/models.dart';
import '../../widgets/common.dart';

class CommunityPostDetailScreen extends StatelessWidget {
  final AppCommunityPost post;

  const CommunityPostDetailScreen({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    final ago = timeago.format(DateTime.tryParse(post.createdAt) ?? DateTime.now());

    return Scaffold(
      backgroundColor: kPorcelain,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('作品动态', style: TextStyle(color: kInk, fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: kSilver,
                child: Text(
                  (post.authorNickname?.isNotEmpty == true) ? post.authorNickname!.substring(0, 1) : '?',
                  style: TextStyle(color: kInk.withOpacity(0.7), fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(post.authorNickname ?? '用户', style: const TextStyle(fontWeight: FontWeight.w700)),
                    Text(ago, style: TextStyle(fontSize: 12, color: kInk.withOpacity(0.45))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(post.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, height: 1.35)),
          if (post.body != null && post.body!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(post.body!, style: TextStyle(fontSize: 14, height: 1.55, color: kInk.withOpacity(0.85))),
          ],
          if (post.imageUrls.isNotEmpty) ...[
            const SizedBox(height: 16),
            ...post.imageUrls.map(
              (url) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(kRadiusMedium),
                  child: Image.network(
                    url,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 120,
                      color: kSilver,
                      alignment: Alignment.center,
                      child: const Text('图片加载失败'),
                    ),
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(height: 24),
          Row(
            children: [
              Icon(Icons.favorite_border, size: 18, color: kInk.withOpacity(0.4)),
              const SizedBox(width: 6),
              Text('${post.likeCount}', style: TextStyle(color: kInk.withOpacity(0.5))),
              const SizedBox(width: 20),
              Icon(Icons.chat_bubble_outline, size: 18, color: kInk.withOpacity(0.4)),
              const SizedBox(width: 6),
              Text('${post.commentCount}', style: TextStyle(color: kInk.withOpacity(0.5))),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../main.dart';

/// 发布页面 - 作品/文章/提问
/// 功能：发布作品、写文章、提问
class CreateScreen extends StatelessWidget {
  const CreateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PorcelainColors.porcelainWhite,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 标题
              const Text(
                '创建内容',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: PorcelainColors.inkBlack,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                '分享你的作品、经验或提出问题',
                style: TextStyle(
                  fontSize: 14,
                  color: PorcelainColors.inkGray,
                ),
              ),
              const SizedBox(height: 32),

              // 发布选项
              Expanded(
                child: ListView(
                  children: [
                    _buildCreateOption(
                      icon: Icons.image_outlined,
                      title: '发布作品集',
                      subtitle: '展示你的创作，获得更多关注',
                      color: PorcelainColors.porcelain,
                      onTap: () {},
                    ),
                    const SizedBox(height: 16),
                    _buildCreateOption(
                      icon: Icons.article_outlined,
                      title: '写文章',
                      subtitle: '分享申请经验、学习心得',
                      color: PorcelainColors.porcelainDark,
                      onTap: () {},
                    ),
                    const SizedBox(height: 16),
                    _buildCreateOption(
                      icon: Icons.help_outline,
                      title: '提问题',
                      subtitle: '向社区寻求帮助和建议',
                      color: PorcelainColors.porcelainLight,
                      onTap: () {},
                    ),
                    const SizedBox(height: 16),
                    _buildCreateOption(
                      icon: Icons.celebration_outlined,
                      title: '分享录取',
                      subtitle: '分享你的Offer喜讯',
                      color: PorcelainColors.porcelainPale,
                      onTap: () {},
                    ),
                  ],
                ),
              ),

              // 草稿箱提示
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: PorcelainColors.porcelainMuted,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.drafts_outlined,
                      color: PorcelainColors.inkGray,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '草稿箱',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: PorcelainColors.inkBlack,
                            ),
                          ),
                          Text(
                            '你有 2 个未完成的草稿',
                            style: TextStyle(
                              fontSize: 12,
                              color: PorcelainColors.inkLight,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.chevron_right,
                      color: PorcelainColors.inkLight,
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

  Widget _buildCreateOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: PorcelainColors.porcelain.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                icon,
                color: color,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: PorcelainColors.inkBlack,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 13,
                      color: PorcelainColors.inkGray,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: PorcelainColors.inkLight,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}

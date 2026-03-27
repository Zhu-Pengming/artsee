import 'package:flutter/material.dart';
import '../main.dart';
import '../data/mock_data.dart';

/// 市场页面 - 资源对接/艺术文旅/艺术品交易
/// 功能：艺术游学、写生营地、艺术品购买/拍卖
class MarketScreen extends StatefulWidget {
  const MarketScreen({super.key});

  @override
  State<MarketScreen> createState() => _MarketScreenState();
}

class _MarketScreenState extends State<MarketScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PorcelainColors.porcelainWhite,
      body: SafeArea(
        child: Column(
          children: [
            // 顶部标题
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Text(
                    '艺术市场',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: PorcelainColors.inkBlack,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () {},
                    icon: const Icon(
                      Icons.search,
                      color: PorcelainColors.inkGray,
                    ),
                  ),
                  IconButton(
                    onPressed: () {},
                    icon: const Icon(
                      Icons.shopping_cart_outlined,
                      color: PorcelainColors.inkGray,
                    ),
                  ),
                ],
              ),
            ),

            // Tab栏
            Container(
              color: Colors.white,
              child: TabBar(
                controller: _tabController,
                labelColor: PorcelainColors.porcelain,
                unselectedLabelColor: PorcelainColors.inkLight,
                indicatorColor: PorcelainColors.porcelain,
                indicatorWeight: 3,
                tabs: const [
                  Tab(text: '艺术文旅'),
                  Tab(text: '艺术品'),
                  Tab(text: '资源对接'),
                ],
              ),
            ),

            // 内容区域
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildArtTourTab(),
                  _buildArtworkTab(),
                  _buildResourceTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 艺术文旅标签页
  Widget _buildArtTourTab() {
    final resources = MockData.getArtResources();

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: resources.length,
      itemBuilder: (context, index) {
        return _buildArtTourCard(resources[index]);
      },
    );
  }

  Widget _buildArtTourCard(ArtResource resource) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: PorcelainColors.porcelain.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 封面图
          Container(
            height: 180,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  PorcelainColors.porcelain,
                  PorcelainColors.porcelainLight,
                ],
              ),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
            ),
            child: Stack(
              children: [
                Center(
                  child: Icon(
                    Icons.landscape,
                    size: 64,
                    color: Colors.white.withOpacity(0.5),
                  ),
                ),
                Positioned(
                  left: 16,
                  top: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _getResourceTypeLabel(resource.type),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: PorcelainColors.porcelain,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // 内容
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  resource.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: PorcelainColors.inkBlack,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 16,
                      color: PorcelainColors.inkLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      resource.location,
                      style: const TextStyle(
                        fontSize: 13,
                        color: PorcelainColors.inkGray,
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Icon(
                      Icons.schedule,
                      size: 16,
                      color: PorcelainColors.inkLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      resource.duration,
                      style: const TextStyle(
                        fontSize: 13,
                        color: PorcelainColors.inkGray,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  resource.description,
                  style: const TextStyle(
                    fontSize: 13,
                    color: PorcelainColors.inkGray,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                // 亮点
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: resource.highlights.take(4).map((highlight) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: PorcelainColors.porcelainMuted,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        highlight,
                        style: const TextStyle(
                          fontSize: 11,
                          color: PorcelainColors.porcelain,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '¥${resource.price}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: PorcelainColors.porcelain,
                          ),
                        ),
                        const Text(
                          '起/人',
                          style: TextStyle(
                            fontSize: 12,
                            color: PorcelainColors.inkLight,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: PorcelainColors.porcelain,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('立即报名'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getResourceTypeLabel(String type) {
    switch (type) {
      case 'tour':
        return '艺术游学';
      case 'camp':
        return '写生营地';
      case 'course':
        return '暑期课程';
      case 'exhibition':
        return '展览';
      default:
        return '艺术活动';
    }
  }

  // 艺术品标签页
  Widget _buildArtworkTab() {
    final artworks = MockData.getArtworks();

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.7,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: artworks.length,
      itemBuilder: (context, index) {
        return _buildArtworkCard(artworks[index]);
      },
    );
  }

  Widget _buildArtworkCard(Artwork artwork) {
    return Container(
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 图片区域
          Expanded(
            flex: 3,
            child: Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    PorcelainColors.porcelain,
                    PorcelainColors.porcelainLight,
                  ],
                ),
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Icon(
                      Icons.palette,
                      size: 48,
                      color: Colors.white.withOpacity(0.5),
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.favorite_outline,
                        size: 16,
                        color: PorcelainColors.inkLight,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // 信息区域
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: PorcelainColors.porcelainMuted,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      artwork.category,
                      style: const TextStyle(
                        fontSize: 10,
                        color: PorcelainColors.porcelain,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    artwork.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: PorcelainColors.inkBlack,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'by ${artwork.artist.nickname}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: PorcelainColors.inkLight,
                    ),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Text(
                        '¥${artwork.price}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: PorcelainColors.porcelain,
                        ),
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          const Icon(
                            Icons.favorite,
                            size: 14,
                            color: PorcelainColors.porcelainDanger,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${artwork.likes}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: PorcelainColors.inkLight,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 资源对接标签页
  Widget _buildResourceTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // 需求方入口
        _buildResourceCard(
          title: '我是需求方',
          subtitle: '寻找原创艺术作品、艺术家合作',
          icon: Icons.business_outlined,
          color: PorcelainColors.porcelain,
        ),
        const SizedBox(height: 16),
        // 供给方入口
        _buildResourceCard(
          title: '我是艺术家',
          subtitle: '展示作品、寻找商业合作机会',
          icon: Icons.palette_outlined,
          color: PorcelainColors.porcelainDark,
        ),
        const SizedBox(height: 24),
        // 成功案例
        const Text(
          '成功案例',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: PorcelainColors.inkBlack,
          ),
        ),
        const SizedBox(height: 16),
        _buildSuccessCaseCard(
          title: '某精品酒店艺术装饰项目',
          description: '平台艺术家作品被选为酒店公共空间装饰，实现商业变现。',
          artist: '青年艺术家A',
        ),
      ],
    );
  }

  Widget _buildResourceCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Container(
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
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              icon,
              color: color,
              size: 32,
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
                    fontWeight: FontWeight.bold,
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
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: color,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text('进入'),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessCaseCard({
    required String title,
    required String description,
    required String artist,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: PorcelainColors.porcelainMuted,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: PorcelainColors.porcelainSuccess,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: PorcelainColors.inkBlack,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: const TextStyle(
              fontSize: 13,
              color: PorcelainColors.inkGray,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                Icons.person_outline,
                size: 14,
                color: PorcelainColors.inkLight,
              ),
              const SizedBox(width: 4),
              Text(
                artist,
                style: const TextStyle(
                  fontSize: 12,
                  color: PorcelainColors.inkLight,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../main.dart';
import '../data/mock_data.dart';

/// 探索页面 - 院校/课程/专业查询
/// 功能：院校搜索、专业筛选、院校详情、课程对比
class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedCountry = '全部';
  String _searchQuery = '';

  final List<String> _countries = ['全部', '英国', '美国', '欧洲', '亚洲'];

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
            // 搜索栏
            _buildSearchBar(),

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
                  Tab(text: '院校'),
                  Tab(text: '专业'),
                  Tab(text: '导师'),
                ],
              ),
            ),

            // 内容区域
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildSchoolTab(),
                  _buildProgramTab(),
                  _buildMentorTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: PorcelainColors.porcelainIvory,
                borderRadius: BorderRadius.circular(22),
              ),
              child: Row(
                children: [
                  const SizedBox(width: 12),
                  Icon(
                    Icons.search,
                    color: PorcelainColors.inkLight,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(
                        hintText: '搜索院校、专业、导师...',
                        hintStyle: TextStyle(
                          fontSize: 14,
                          color: PorcelainColors.inkLight,
                        ),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onChanged: (value) {
                        setState(() {
                          _searchQuery = value;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: PorcelainColors.porcelainMuted,
              borderRadius: BorderRadius.circular(22),
            ),
            child: const Icon(
              Icons.tune,
              color: PorcelainColors.porcelain,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSchoolTab() {
    final schools = MockData.getSchools();

    return Column(
      children: [
        // 国家筛选
        Container(
          height: 50,
          color: Colors.white,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _countries.length,
            itemBuilder: (context, index) {
              final country = _countries[index];
              final isSelected = country == _selectedCountry;
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedCountry = country;
                  });
                },
                child: Container(
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? PorcelainColors.porcelain
                        : PorcelainColors.porcelainIvory,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Center(
                    child: Text(
                      country,
                      style: TextStyle(
                        fontSize: 14,
                        color: isSelected ? Colors.white : PorcelainColors.inkGray,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        // 院校列表
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: schools.length,
            itemBuilder: (context, index) {
              return _buildSchoolCard(schools[index]);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSchoolCard(School school) {
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
            height: 120,
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
                Positioned(
                  right: 16,
                  top: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.star,
                          size: 14,
                          color: Colors.amber,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'QS ${school.qsRank}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: PorcelainColors.inkBlack,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  left: 16,
                  bottom: 16,
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        school.name.substring(0, 1),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: PorcelainColors.porcelain,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // 信息
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            school.name,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: PorcelainColors.inkBlack,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            school.nameEn,
                            style: const TextStyle(
                              fontSize: 13,
                              color: PorcelainColors.inkLight,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () {},
                      icon: const Icon(
                        Icons.favorite_outline,
                        color: PorcelainColors.inkLight,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildInfoTag(Icons.location_on_outlined, '${school.country} · ${school.city}'),
                    const SizedBox(width: 12),
                    _buildInfoTag(Icons.school_outlined, '${school.programs.length}个专业'),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  school.description,
                  style: const TextStyle(
                    fontSize: 13,
                    color: PorcelainColors.inkGray,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTag(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: PorcelainColors.porcelainMuted,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: PorcelainColors.inkLight,
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: PorcelainColors.inkGray,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgramTab() {
    // 获取所有专业
    final List<Program> allPrograms = [];
    for (var school in MockData.getSchools()) {
      allPrograms.addAll(school.programs);
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: allPrograms.length,
      itemBuilder: (context, index) {
        return _buildProgramCard(allPrograms[index]);
      },
    );
  }

  Widget _buildProgramCard(Program program) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: PorcelainColors.porcelain.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  program.degree,
                  style: const TextStyle(
                    fontSize: 12,
                    color: PorcelainColors.porcelain,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: PorcelainColors.porcelainMuted,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  program.duration,
                  style: const TextStyle(
                    fontSize: 12,
                    color: PorcelainColors.inkGray,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            program.name,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: PorcelainColors.inkBlack,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            program.nameEn,
            style: const TextStyle(
              fontSize: 13,
              color: PorcelainColors.inkLight,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                Icons.language,
                size: 16,
                color: PorcelainColors.inkLight,
              ),
              const SizedBox(width: 4),
              Text(
                program.language,
                style: const TextStyle(
                  fontSize: 13,
                  color: PorcelainColors.inkGray,
                ),
              ),
              const SizedBox(width: 16),
              Icon(
                Icons.attach_money,
                size: 16,
                color: PorcelainColors.inkLight,
              ),
              const SizedBox(width: 4),
              Text(
                '£${program.tuition}/年',
                style: const TextStyle(
                  fontSize: 13,
                  color: PorcelainColors.inkGray,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMentorTab() {
    final mentors = MockData.getMentors();

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: mentors.length,
      itemBuilder: (context, index) {
        return _buildMentorCard(mentors[index]);
      },
    );
  }

  Widget _buildMentorCard(Mentor mentor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
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
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  PorcelainColors.porcelain,
                  PorcelainColors.porcelainLight,
                ],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(
                mentor.name.substring(0, 1),
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  mentor.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: PorcelainColors.inkBlack,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  mentor.title,
                  style: const TextStyle(
                    fontSize: 13,
                    color: PorcelainColors.porcelain,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: mentor.specialties.take(3).map((specialty) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: PorcelainColors.porcelainMuted,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        specialty,
                        style: const TextStyle(
                          fontSize: 11,
                          color: PorcelainColors.inkGray,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.star,
                      size: 16,
                      color: Colors.amber[600],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${mentor.rating}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: PorcelainColors.inkBlack,
                      ),
                    ),
                    Text(
                      ' (${mentor.reviewCount}评价)',
                      style: const TextStyle(
                        fontSize: 12,
                        color: PorcelainColors.inkLight,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '¥${mentor.price}/小时',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: PorcelainColors.porcelain,
                      ),
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
}

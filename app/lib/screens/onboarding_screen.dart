import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'main_screen.dart';

// 青花配色
class _PorcelainColors {
  static const Color porcelainDeep = Color(0xFF183b90);
  static const Color porcelainDark = Color(0xFF425691);
  static const Color porcelain = Color(0xFF4074b1);
  static const Color porcelainLight = Color(0xFF5A8FC9);
  static const Color porcelainPale = Color(0xFFA8C4E0);
  static const Color porcelainWhite = Color(0xFFf2f0e9);
  static const Color porcelainIvory = Color(0xFFE8E6DF);
  static const Color inkBlack = Color(0xFF1A2332);
  static const Color inkGray = Color(0xFF3A4A5C);
  static const Color inkLight = Color(0xFF6A7A8C);
}

// 艺术领域选项
final List<Map<String, dynamic>> artCategories = [
  {'id': 'painting', 'name': '绘画', 'icon': Icons.brush, 'color': Color(0xFFE57373)},
  {'id': 'sculpture', 'name': '雕塑', 'icon': Icons.account_balance, 'color': Color(0xFF81C784)},
  {'id': 'design', 'name': '设计', 'icon': Icons.design_services, 'color': Color(0xFF64B5F6)},
  {'id': 'photography', 'name': '摄影', 'icon': Icons.camera_alt, 'color': Color(0xFFFFB74D)},
  {'id': 'fashion', 'name': '时尚', 'icon': Icons.checkroom, 'color': Color(0xFFBA68C8)},
  {'id': 'architecture', 'name': '建筑', 'icon': Icons.architecture, 'color': Color(0xFF4DB6AC)},
  {'id': 'film', 'name': '影视', 'icon': Icons.movie, 'color': Color(0xFFFF8A65)},
  {'id': 'music', 'name': '音乐', 'icon': Icons.music_note, 'color': Color(0xFF7986CB)},
  {'id': 'ceramics', 'name': '陶艺', 'icon': Icons.villa, 'color': Color(0xFFA1887F)},
  {'id': 'calligraphy', 'name': '书法', 'icon': Icons.edit, 'color': Color(0xFF90A4AE)},
  {'id': 'digital_art', 'name': '数字艺术', 'icon': Icons.computer, 'color': Color(0xFF4DD0E1)},
  {'id': 'crafts', 'name': '手工艺', 'icon': Icons.handyman, 'color': Color(0xFFF06292)},
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _authService = AuthService();
  final Set<String> _selectedCategories = {};
  final TextEditingController _nicknameController = TextEditingController();
  bool _isLoading = false;
  int _currentStep = 0;

  @override
  void dispose() {
    _nicknameController.dispose();
    super.dispose();
  }

  void _toggleCategory(String id) {
    setState(() {
      if (_selectedCategories.contains(id)) {
        _selectedCategories.remove(id);
      } else {
        if (_selectedCategories.length < 5) {
          _selectedCategories.add(id);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('最多选择5个感兴趣的领域'),
              backgroundColor: _PorcelainColors.porcelainDark,
            ),
          );
        }
      }
    });
  }

  Future<void> _completeOnboarding() async {
    if (_nicknameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('请输入昵称'),
          backgroundColor: _PorcelainColors.porcelainDark,
        ),
      );
      return;
    }

    if (_selectedCategories.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('请至少选择一个感兴趣的领域'),
          backgroundColor: _PorcelainColors.porcelainDark,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final result = await _authService.updateUserProfile(
      nickname: _nicknameController.text.trim(),
      interestedCategories: _selectedCategories.toList(),
    );

    setState(() {
      _isLoading = false;
    });

    if (result['success'] == true) {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const MainScreen()),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['error'] ?? '保存失败，请重试'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _nextStep() {
    if (_currentStep == 0) {
      if (_nicknameController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('请输入昵称'),
            backgroundColor: _PorcelainColors.porcelainDark,
          ),
        );
        return;
      }
    }
    setState(() {
      _currentStep++;
    });
  }

  void _previousStep() {
    setState(() {
      _currentStep--;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _PorcelainColors.porcelainWhite,
      body: SafeArea(
        child: Column(
          children: [
            // 顶部进度条
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 4,
                      decoration: BoxDecoration(
                        color: _currentStep >= 0
                            ? _PorcelainColors.porcelain
                            : _PorcelainColors.porcelainPale.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      height: 4,
                      decoration: BoxDecoration(
                        color: _currentStep >= 1
                            ? _PorcelainColors.porcelain
                            : _PorcelainColors.porcelainPale.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 跳过按钮
            Align(
              alignment: Alignment.centerRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 24),
                child: TextButton(
                  onPressed: _isLoading ? null : _completeOnboarding,
                  child: const Text(
                    '跳过',
                    style: TextStyle(
                      color: _PorcelainColors.inkLight,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ),

            // 主内容区
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _currentStep == 0 ? _buildStep1() : _buildStep2(),
              ),
            ),

            // 底部按钮
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  if (_currentStep > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _isLoading ? null : _previousStep,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _PorcelainColors.porcelain,
                          side: const BorderSide(color: _PorcelainColors.porcelain),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text('上一步'),
                      ),
                    ),
                  if (_currentStep > 0) const SizedBox(width: 16),
                  Expanded(
                    flex: _currentStep == 0 ? 1 : 2,
                    child: Container(
                      height: 56,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: const LinearGradient(
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                          colors: [
                            _PorcelainColors.porcelainDark,
                            _PorcelainColors.porcelain,
                          ],
                        ),
                      ),
                      child: ElevatedButton(
                        onPressed: _isLoading
                            ? null
                            : (_currentStep == 0 ? _nextStep : _completeOnboarding),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : Text(
                                _currentStep == 0 ? '下一步' : '完成',
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 第一步：设置昵称
  Widget _buildStep1() {
    return Padding(
      key: const ValueKey(1),
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '欢迎加入艺见心',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: _PorcelainColors.inkBlack,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            '让我们先认识一下你',
            style: TextStyle(
              fontSize: 16,
              color: _PorcelainColors.inkGray,
            ),
          ),
          const SizedBox(height: 48),
          const Text(
            '你的昵称',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: _PorcelainColors.inkBlack,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: _PorcelainColors.porcelainIvory,
              borderRadius: BorderRadius.circular(12),
            ),
            child: TextField(
              controller: _nicknameController,
              maxLength: 20,
              style: const TextStyle(
                fontSize: 16,
                color: _PorcelainColors.inkBlack,
              ),
              decoration: InputDecoration(
                hintText: '输入你喜欢的昵称',
                hintStyle: TextStyle(
                  color: _PorcelainColors.inkLight.withOpacity(0.6),
                ),
                prefixIcon: const Icon(
                  Icons.person_outline,
                  color: _PorcelainColors.porcelain,
                ),
                filled: true,
                fillColor: Colors.transparent,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: _PorcelainColors.porcelain,
                    width: 2,
                  ),
                ),
                counterText: '',
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '这个昵称将会展示在你的个人主页',
            style: TextStyle(
              fontSize: 12,
              color: _PorcelainColors.inkLight.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  // 第二步：选择艺术领域
  Widget _buildStep2() {
    return Padding(
      key: const ValueKey(2),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '选择你感兴趣的艺术领域',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: _PorcelainColors.inkBlack,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  '我们会根据你的选择为你推荐相关内容（可多选）',
                  style: TextStyle(
                    fontSize: 14,
                    color: _PorcelainColors.inkGray,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 0.85,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: artCategories.length,
              itemBuilder: (context, index) {
                final category = artCategories[index];
                final isSelected = _selectedCategories.contains(category['id']);
                
                return GestureDetector(
                  onTap: () => _toggleCategory(category['id']),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? (category['color'] as Color).withOpacity(0.15)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? category['color'] as Color
                            : _PorcelainColors.porcelainPale.withOpacity(0.3),
                        width: isSelected ? 2 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: (category['color'] as Color).withOpacity(0.2),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ]
                          : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? (category['color'] as Color).withOpacity(0.2)
                                : (category['color'] as Color).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            category['icon'] as IconData,
                            color: category['color'] as Color,
                            size: 28,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          category['name'] as String,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                            color: isSelected
                                ? category['color'] as Color
                                : _PorcelainColors.inkGray,
                          ),
                        ),
                        if (isSelected)
                          Container(
                            margin: const EdgeInsets.only(top: 4),
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: category['color'] as Color,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          // 已选择数量提示
          if (_selectedCategories.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: _PorcelainColors.porcelain.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '已选择 ${_selectedCategories.length} 个领域',
                    style: const TextStyle(
                      fontSize: 14,
                      color: _PorcelainColors.porcelain,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

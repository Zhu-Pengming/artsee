import 'package:flutter/material.dart';
import '../main.dart';
import 'home_screen.dart';
import 'explore_screen.dart';
import 'create_screen.dart';
import 'market_screen.dart';
import 'profile_screen.dart';

/// 主页面 - 包含底部导航栏
/// 五个入口：首页、探索、发布、市场、我的
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),      // 首页 - 发现流
    const ExploreScreen(),   // 探索 - 院校/课程
    const CreateScreen(),    // 发布 - 作品/文章/提问
    const MarketScreen(),    // 市场 - 资源/文旅/交易
    const ProfileScreen(),   // 我的 - 个人中心
  ];

  final List<String> _titles = [
    '首页',
    '探索',
    '发布',
    '市场',
    '我的',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: PorcelainColors.porcelain.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.white,
            selectedItemColor: PorcelainColors.porcelain,
            unselectedItemColor: PorcelainColors.inkLight,
            selectedFontSize: 12,
            unselectedFontSize: 12,
            elevation: 0,
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home),
                label: '首页',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.explore_outlined),
                activeIcon: Icon(Icons.explore),
                label: '探索',
              ),
              BottomNavigationBarItem(
                icon: Container(
                  width: 48,
                  height: 32,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        PorcelainColors.porcelain,
                        PorcelainColors.porcelainLight,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(
                    Icons.add,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                label: '发布',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.store_outlined),
                activeIcon: Icon(Icons.store),
                label: '市场',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.person_outline),
                activeIcon: Icon(Icons.person),
                label: '我的',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

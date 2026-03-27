import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/login_screen.dart';
import 'screens/main_screen.dart';
import 'services/auth_service.dart';

// 青花配色 - 浅色霁风 配色常量
class PorcelainColors {
  // 主色系列
  static const Color porcelainDeep = Color(0xFF183b90);   // 珠明料 - 最深强调
  static const Color porcelainDark = Color(0xFF425691);   // 元子 - 深色强调
  static const Color porcelain = Color(0xFF4074b1);       // 平等青 - 主色调
  static const Color porcelainLight = Color(0xFF5A8FC9);  // 浅平等青
  static const Color porcelainPale = Color(0xFFA8C4E0);   // 霁蓝 - 装饰色
  static const Color porcelainMuted = Color(0xFFD4E4F0);  // 极浅蓝
  
  // 背景系列 - 高白泥
  static const Color porcelainWhite = Color(0xFFf2f0e9);  // 高白泥 - 米白主背景
  static const Color porcelainIvory = Color(0xFFE8E6DF);  // 浅白泥
  static const Color porcelainCream = Color(0xFFDEDCD5);  // 奶油白
  static const Color porcelainPure = Color(0xFFFFFFFF);   // 纯白
  
  // 文字颜色
  static const Color inkBlack = Color(0xFF1A2332);        // 墨黑 - 主标题
  static const Color inkGray = Color(0xFF3A4A5C);         // 灰黑 - 次要文字
  static const Color inkLight = Color(0xFF6A7A8C);        // 浅灰 - 提示文字
  static const Color inkMuted = Color(0xFF9AA8B8);        // 更浅灰
  
  // 辅助色
  static const Color porcelainDanger = Color(0xFFB85C5C);  // 危险红
  static const Color porcelainSuccess = Color(0xFF5C8B7A); // 成功绿
  static const Color porcelainWarning = Color(0xFFB89A5C); // 警告橙
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 设置系统UI样式 - 青花配色主题
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: PorcelainColors.porcelainWhite,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '艺见心',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        // 青花配色 - 浅色霁风 配色方案
        colorScheme: const ColorScheme.light(
          primary: PorcelainColors.porcelain,
          secondary: PorcelainColors.porcelainDark,
          surface: PorcelainColors.porcelainWhite,
          background: PorcelainColors.porcelainWhite,
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: PorcelainColors.inkBlack,
          onBackground: PorcelainColors.inkBlack,
        ),
        scaffoldBackgroundColor: PorcelainColors.porcelainWhite,
        // 字体配置
        fontFamily: 'NotoSansSC',
        // AppBar 主题
        appBarTheme: const AppBarTheme(
          backgroundColor: PorcelainColors.porcelainWhite,
          foregroundColor: PorcelainColors.inkBlack,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: PorcelainColors.inkBlack,
            letterSpacing: 0.02,
          ),
        ),
        // 按钮主题
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: PorcelainColors.porcelain,
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        // 输入框主题
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: PorcelainColors.porcelainIvory,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: PorcelainColors.porcelain,
              width: 2,
            ),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          hintStyle: const TextStyle(
            color: PorcelainColors.inkLight,
            fontSize: 14,
          ),
        ),
        // 卡片主题
        cardTheme: const CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(16)),
          ),
          margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
        // 底部导航栏主题
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: PorcelainColors.porcelain,
          unselectedItemColor: PorcelainColors.inkLight,
          type: BottomNavigationBarType.fixed,
          elevation: 8,
        ),
        // 分割线主题
        dividerTheme: const DividerThemeData(
          color: PorcelainColors.porcelainCream,
          thickness: 1,
          space: 1,
        ),
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final _authService = AuthService();

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    await Future.delayed(const Duration(seconds: 2)); // 显示启动页2秒
    
    final isLoggedIn = await _authService.isLoggedIn();
    
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => isLoggedIn ? const MainScreen() : const LoginScreen(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PorcelainColors.porcelainWhite,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo - 青花配色风格
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    PorcelainColors.porcelainDeep,
                    PorcelainColors.porcelainDark,
                    PorcelainColors.porcelain,
                  ],
                ),
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: PorcelainColors.porcelain.withOpacity(0.25),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: const Icon(
                Icons.palette_outlined,
                color: Colors.white,
                size: 48,
              ),
            ),
            const SizedBox(height: 28),
            // 应用名称
            const Text(
              '艺见心',
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                color: PorcelainColors.inkBlack,
                letterSpacing: 0.05,
              ),
            ),
            const SizedBox(height: 12),
            // 副标题
            const Text(
              '发现艺术的无限可能',
              style: TextStyle(
                fontSize: 14,
                color: PorcelainColors.inkGray,
                letterSpacing: 0.1,
              ),
            ),
            const SizedBox(height: 56),
            // 加载指示器
            SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(
                  PorcelainColors.porcelain.withOpacity(0.8),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

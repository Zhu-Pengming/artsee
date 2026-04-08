import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/main_scaffold.dart';
import 'widgets/common.dart';

const supabaseUrl = 'https://nufrgmlhlfmhxsqbybfd.supabase.co';
const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZnJnbWxobGZtaHhzcWJ5YmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzA2NDUsImV4cCI6MjA4OTUwNjY0NX0.E90FL3mrUSa18YHMhjyncZQx-yKqCpDTgC18F_ww5to';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );

  // 设置状态栏样式
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarColor: kPorcelain,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));

  runApp(const ArtseeApp());
}

class ArtseeApp extends StatelessWidget {
  const ArtseeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '艺见心',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        // ═══════════════════════════════════════════════════════
        // 青花瓷典藏版配色
        // ═══════════════════════════════════════════════════════
        colorScheme: const ColorScheme.light(
          primary: kCobalt,
          onPrimary: Colors.white,
          primaryContainer: kCobaltMuted,
          onPrimaryContainer: Colors.white,
          secondary: kSilver,
          onSecondary: kInk,
          surface: Colors.white,
          onSurface: kInk,
          background: kPorcelain,
          onBackground: kInk,
          error: Color(0xFFDC2626),
          onError: Colors.white,
        ),
        // ═══════════════════════════════════════════════════════
        // 字体配置
        // ═══════════════════════════════════════════════════════
        fontFamily: 'PingFang SC',
        textTheme: const TextTheme(
          headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: kInk, height: 1.2),
          headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: kInk, height: 1.3),
          headlineSmall: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: kInk, height: 1.4),
          titleLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: kInk),
          titleMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: kInk),
          titleSmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: kInk),
          bodyLarge: TextStyle(fontSize: 15, color: kInk, height: 1.5),
          bodyMedium: TextStyle(fontSize: 13, color: kInk, height: 1.5),
          bodySmall: TextStyle(fontSize: 11, color: kInk, height: 1.4),
          labelLarge: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: kInk),
          labelMedium: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: kInk),
          labelSmall: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: kInk, letterSpacing: 0.5),
        ),
        // ═══════════════════════════════════════════════════════
        // AppBar 主题
        // ═══════════════════════════════════════════════════════
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: kInk,
          elevation: 0,
          scrolledUnderElevation: 0.5,
          centerTitle: true,
          titleTextStyle: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: kInk,
            letterSpacing: 0.5,
          ),
          iconTheme: IconThemeData(color: kInk, size: 22),
          actionsIconTheme: IconThemeData(color: kInk, size: 22),
        ),
        // ═══════════════════════════════════════════════════════
        // 底部导航栏主题
        // ═══════════════════════════════════════════════════════
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: kCobalt,
          unselectedItemColor: kSilver,
          selectedLabelStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.3),
          unselectedLabelStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
          type: BottomNavigationBarType.fixed,
          elevation: 8,
          showSelectedLabels: true,
          showUnselectedLabels: true,
        ),
        // ═══════════════════════════════════════════════════════
        // 卡片主题
        // ═══════════════════════════════════════════════════════
        cardTheme: CardTheme(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(kRadiusLarge),
          ),
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        ),
        // ═══════════════════════════════════════════════════════
        // 按钮主题
        // ═══════════════════════════════════════════════════════
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: kCobalt,
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(kRadiusMedium),
            ),
            textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: kCobalt,
            side: const BorderSide(color: kCobalt, width: 1.5),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(kRadiusMedium),
            ),
            textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: kCobalt,
            textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
        ),
        // ═══════════════════════════════════════════════════════
        // 输入框主题
        // ═══════════════════════════════════════════════════════
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: kSilver.withOpacity(0.5),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadiusMedium),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadiusMedium),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadiusMedium),
            borderSide: const BorderSide(color: kCobalt, width: 1.5),
          ),
          hintStyle: TextStyle(fontSize: 13, color: kInk.withOpacity(0.4)),
          prefixIconColor: kInk.withOpacity(0.4),
        ),
        // ═══════════════════════════════════════════════════════
        // 悬浮按钮主题
        // ═══════════════════════════════════════════════════════
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: kCobalt,
          foregroundColor: Colors.white,
          elevation: 4,
          shape: CircleBorder(),
        ),
        // ═══════════════════════════════════════════════════════
        // 标签栏主题
        // ═══════════════════════════════════════════════════════
        tabBarTheme: const TabBarTheme(
          labelColor: kCobalt,
          unselectedLabelColor: kSilver,
          indicatorColor: kCobalt,
          labelStyle: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          unselectedLabelStyle: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
        ),
        // ═══════════════════════════════════════════════════════
        // Chip 主题
        // ═══════════════════════════════════════════════════════
        chipTheme: ChipThemeData(
          backgroundColor: kSilver.withOpacity(0.5),
          selectedColor: kCobalt,
          labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
          secondaryLabelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(kRadiusSmall),
          ),
        ),
        // ═══════════════════════════════════════════════════════
        // 分割线主题
        // ═══════════════════════════════════════════════════════
        dividerTheme: DividerThemeData(
          color: kSilver.withOpacity(0.5),
          thickness: 1,
          space: 1,
        ),
        // ═══════════════════════════════════════════════════════
        // 列表瓦片主题
        // ═══════════════════════════════════════════════════════
        listTileTheme: const ListTileThemeData(
          contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          minLeadingWidth: 24,
          titleTextStyle: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: kInk),
          subtitleTextStyle: TextStyle(fontSize: 12, color: kSilver),
        ),
        // 背景色
        scaffoldBackgroundColor: kPorcelain,
      ),
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        // Always show main scaffold; auth-required pages redirect to login
        return const MainScaffold();
      },
    );
  }
}

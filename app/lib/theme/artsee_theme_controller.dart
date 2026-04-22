import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// 全局：仅在「我的」页用图标切换；持久化在本地 SharedPreferences
class ArtseeThemeController extends ChangeNotifier {
  ArtseeThemeController._();
  static final ArtseeThemeController instance = ArtseeThemeController._();

  static const _key = 'artsee_is_dark';
  bool _isDark = false;
  bool get isDark => _isDark;
  ThemeMode get mode => _isDark ? ThemeMode.dark : ThemeMode.light;

  Future<void> load() async {
    final p = await SharedPreferences.getInstance();
    _isDark = p.getBool(_key) ?? false;
    notifyListeners();
  }

  Future<void> setDark(bool v) async {
    if (_isDark == v) return;
    _isDark = v;
    notifyListeners();
    final p = await SharedPreferences.getInstance();
    await p.setBool(_key, v);
  }

  Future<void> toggle() => setDark(!_isDark);
}

import 'dart:io' show Platform;
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html show window;

import 'package:flutter/foundation.dart' show kDebugMode, kIsWeb;

/// ═══════════════════════════════════════════════════════════════
/// 全局环境配置（开发 / 生产）
/// ═══════════════════════════════════════════════════════════════
///
/// 编译时可通过 `--dart-define` 注入：
///   --dart-define=DEV_MODE=true
///   --dart-define=DEV_LOGIN=true
///   --dart-define=API_BASE_URL=https://api.example.com
///
class AppConfig {
  AppConfig._();

  static const bool _devMode =
      bool.fromEnvironment('DEV_MODE', defaultValue: false);
  static const bool _devLogin =
      bool.fromEnvironment('DEV_LOGIN', defaultValue: false);
  static const String _apiBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const String _webDevPort =
      String.fromEnvironment('WEB_DEV_PORT', defaultValue: '3003');

  /// 是否处于开发模式
  /// - Debug 构建自动为 true
  /// - Release 构建可传 `--dart-define=DEV_MODE=true`
  static bool get isDev => kDebugMode || _devMode;

  /// 是否处于生产模式
  static bool get isProd => !isDev;

  /// 是否启用登录页的「开发者一键登录」
  static bool get devLoginEnabled => kDebugMode || _devLogin || _devMode;

  /// Next.js BFF 基地址
  static String get apiBaseUrl {
    if (_apiBaseUrl.isNotEmpty) return _apiBaseUrl;
    if (kIsWeb) return _webApiBaseUrl;
    if (Platform.isAndroid) return 'http://10.0.2.2:$_webDevPort';
    return 'http://127.0.0.1:$_webDevPort';
  }

  static String get _webApiBaseUrl {
    if (!kIsWeb) return 'http://localhost:$_webDevPort';
    
    // Web 环境：从浏览器 window.location 获取当前域名（运行时）
    final location = html.window.location;
    final host = location.hostname;
    final scheme = location.protocol.replaceAll(':', '');
    
    // 如果是生产域名（非本地），使用当前域名
    if (host != null && host.isNotEmpty && !_isLocalWebHost(host)) {
      // 生产环境：https://artiqore.com
      return '$scheme://$host';
    }
    
    // 本地开发：http://localhost:3003
    return 'http://localhost:$_webDevPort';
  }

  static bool _isLocalWebHost(String host) {
    final normalized = host.toLowerCase();
    return normalized == 'localhost' ||
        normalized == '127.0.0.1' ||
        normalized == '::1';
  }
}

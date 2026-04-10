import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

/// Next.js 后端基地址（`npm run dev` 默认端口 3333）。
/// 构建时可传：`--dart-define=API_BASE_URL=https://api.example.com`
class ApiConfig {
  ApiConfig._();

  static const String _fromDefine = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_fromDefine.isNotEmpty) return _fromDefine;
    if (kIsWeb) return 'http://localhost:3333';
    if (Platform.isAndroid) return 'http://10.0.2.2:3333';
    return 'http://127.0.0.1:3333';
  }
}

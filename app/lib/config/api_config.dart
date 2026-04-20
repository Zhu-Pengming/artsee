import 'app_config.dart';

/// Next.js 后端基地址（`npm run dev` 默认端口 9090）。
/// 构建时可传：`--dart-define=API_BASE_URL=https://api.example.com`
class ApiConfig {
  ApiConfig._();

  static String get baseUrl => AppConfig.apiBaseUrl;
}

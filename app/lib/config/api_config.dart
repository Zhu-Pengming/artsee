import 'app_config.dart';

/// Next.js 后端基地址（`npm run dev` 默认端口 9090）。
/// 构建时可传：`--dart-define=API_BASE_URL=https://api.example.com`
class ApiConfig {
  ApiConfig._();

  static String get baseUrl => AppConfig.apiBaseUrl;

  /// 院校数据源：
  /// - remote/default: 远端优先，失败时自动 fallback 到本地 CSV
  /// - local: 直接使用 `assets/data/local_schools.csv`
  static const schoolsDataSource =
      String.fromEnvironment('SCHOOLS_DATA_SOURCE', defaultValue: 'remote');

  static bool get forceLocalSchoolsData =>
      schoolsDataSource.toLowerCase() == 'local';
}

import 'package:flutter/foundation.dart';

/// 是否在登录页显示「开发者快速登录」。
/// - Debug 构建：默认可用
/// - Release：需编译时开启 `--dart-define=DEV_LOGIN=true`
bool get devLoginShortcutsEnabled =>
    kDebugMode || const bool.fromEnvironment('DEV_LOGIN', defaultValue: false);

/// 与仓库 `docs/AGENTS.md` 中「开发者测试账号」保持一致（勿用于生产环境）。
abstract final class DevTestAccount {
  static const String email = 'dev.test@artsee.app';
  static const String password = 'ArtseeDev2026!';
  static const String nickname = 'Artsee开发者';
}

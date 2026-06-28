// Stub implementation for Web platform (Tencent IM SDK doesn't support Web)

class TencentImLoginState {
  final int sdkAppId;
  final String identifier;
  final String expiresAt;
  final String accountSync;

  const TencentImLoginState({
    required this.sdkAppId,
    required this.identifier,
    required this.expiresAt,
    required this.accountSync,
  });

  factory TencentImLoginState.fromJson(Map<String, dynamic> json) {
    return TencentImLoginState(
      sdkAppId: json['sdk_app_id'] is int
          ? json['sdk_app_id'] as int
          : int.parse(json['sdk_app_id'].toString()),
      identifier: json['identifier'].toString(),
      expiresAt: json['expires_at'].toString(),
      accountSync: json['account_sync']?.toString() ?? 'unknown',
    );
  }
}

class TencentImService {
  TencentImService._();

  static Future<TencentImLoginState?> ensureLoggedIn() async {
    throw UnsupportedError('腾讯云 IM 不支持 Web 平台');
  }

  static Future<Map<String, dynamic>> sendC2CText({
    required String peerIdentifier,
    required String text,
  }) async {
    throw UnsupportedError('腾讯云 IM 不支持 Web 平台');
  }

  static Future<void> addTextMessageHandler(
    void Function(Map<String, dynamic>) handler,
  ) async {
    // No-op on Web
  }

  static Future<void> removeTextMessageHandler(
    void Function(Map<String, dynamic>) handler,
  ) async {
    // No-op on Web
  }

  static Future<void> logout() async {
    // No-op on Web
  }

  static void resetLocalState() {
    // No-op on Web
  }
}

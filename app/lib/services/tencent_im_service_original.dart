import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:tencent_cloud_chat_sdk/enum/V2TimAdvancedMsgListener.dart';
import 'package:tencent_cloud_chat_sdk/enum/log_level_enum.dart';
import 'package:tencent_cloud_chat_sdk/manager/v2_tim_manager.dart';
import 'package:tencent_cloud_chat_sdk/tencent_im_sdk_plugin.dart';

import 'backend_api_service.dart';

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

  static int? _initializedSdkAppId;
  static String? _loggedInIdentifier;
  static Future<TencentImLoginState?>? _loginFuture;
  static V2TimAdvancedMsgListener? _advancedMsgListener;
  static final Set<void Function(Map<String, dynamic>)> _messageHandlers = {};

  static V2TIMManager get _manager => TencentImSDKPlugin.v2TIMManager;

  static Future<TencentImLoginState?> ensureLoggedIn() {
    _loginFuture ??= _login();
    return _loginFuture!.whenComplete(() => _loginFuture = null);
  }

  static Future<TencentImLoginState?> _login() async {
    final config = await BackendApiService.fetchTencentImConfig();
    final sdkAppId = config['sdk_app_id'] is int
        ? config['sdk_app_id'] as int
        : int.parse(config['sdk_app_id'].toString());
    final identifier = config['identifier']?.toString() ?? '';
    final userSig = config['user_sig']?.toString() ?? '';

    if (sdkAppId <= 0 || identifier.isEmpty || userSig.isEmpty) {
      throw StateError('腾讯云 IM 登录配置不完整');
    }

    if (_initializedSdkAppId != sdkAppId) {
      final init = await _manager.initSDK(
        sdkAppID: sdkAppId,
        loglevel: kDebugMode
            ? LogLevelEnum.V2TIM_LOG_DEBUG
            : LogLevelEnum.V2TIM_LOG_INFO,
        showImLog: kDebugMode,
      );
      _throwIfFailed('腾讯云 IM 初始化失败', init.code, init.desc);
      _initializedSdkAppId = sdkAppId;
    }

    if (_loggedInIdentifier == identifier) {
      return TencentImLoginState.fromJson(config);
    }

    final login = await _manager.login(userID: identifier, userSig: userSig);
    _throwIfFailed('腾讯云 IM 登录失败', login.code, login.desc);
    _loggedInIdentifier = identifier;

    return TencentImLoginState.fromJson(config);
  }

  static Future<Map<String, dynamic>> sendC2CText({
    required String peerIdentifier,
    required String text,
  }) async {
    final loginState = await ensureLoggedIn();
    final body = text.trim();
    if (body.isEmpty) {
      throw ArgumentError.value(text, 'text', '消息内容不能为空');
    }
    final messageManager = _manager.getMessageManager();
    final created = await messageManager.createTextMessage(text: body);
    _throwIfFailed('腾讯云 IM 创建消息失败', created.code, created.desc);
    final createdInfo = created.data;
    final sent = await messageManager.sendMessage(
      // The current Web bridge still uses the create-message id.
      // ignore: deprecated_member_use
      id: createdInfo?.id,
      message: createdInfo?.messageInfo,
      receiver: peerIdentifier,
      groupID: '',
    );
    _throwIfFailed('腾讯云 IM 消息发送失败', sent.code, sent.desc);

    final imMessage = sent.data;
    final mapped = _messageToMap(
      imMessage,
      fallbackBody: body,
      fallbackPeerIdentifier: peerIdentifier,
      fallbackSenderIdentifier: loginState?.identifier,
      fallbackIsSelf: true,
    );
    if (mapped == null) {
      throw StateError('腾讯云 IM 消息发送成功，但返回内容无法解析');
    }
    return mapped;
  }

  static Future<void> addTextMessageHandler(
    void Function(Map<String, dynamic>) handler,
  ) async {
    _messageHandlers.add(handler);
    if (_advancedMsgListener != null) return;

    await ensureLoggedIn();
    _advancedMsgListener = V2TimAdvancedMsgListener(
      onRecvNewMessage: (message) {
        final mapped = _messageToMap(message);
        if (mapped == null) return;
        for (final listener in List.of(_messageHandlers)) {
          listener(mapped);
        }
      },
    );
    await _manager.getMessageManager().addAdvancedMsgListener(
          listener: _advancedMsgListener!,
        );
  }

  static Future<void> removeTextMessageHandler(
    void Function(Map<String, dynamic>) handler,
  ) async {
    _messageHandlers.remove(handler);
    if (_messageHandlers.isNotEmpty || _advancedMsgListener == null) return;

    final listener = _advancedMsgListener;
    _advancedMsgListener = null;
    await _manager.getMessageManager().removeAdvancedMsgListener(
          listener: listener,
        );
  }

  static Future<void> logout() async {
    final shouldLogout = _loggedInIdentifier != null;
    final listener = _advancedMsgListener;
    if (!shouldLogout && listener == null) return;
    _advancedMsgListener = null;
    _messageHandlers.clear();
    try {
      if (listener != null) {
        await _manager.getMessageManager().removeAdvancedMsgListener(
              listener: listener,
            );
      }
      if (shouldLogout) {
        await _manager.logout();
      }
    } finally {
      _loggedInIdentifier = null;
    }
  }

  static void resetLocalState() {
    _loggedInIdentifier = null;
    _loginFuture = null;
  }

  static Map<String, dynamic>? _messageToMap(
    dynamic message, {
    String? fallbackBody,
    String? fallbackPeerIdentifier,
    String? fallbackSenderIdentifier,
    bool? fallbackIsSelf,
  }) {
    final body = _dynamicString(message?.textElem?.text) ?? fallbackBody;
    if (body == null || body.trim().isEmpty) return null;

    final isSelf = _dynamicBool(message?.isSelf) ?? fallbackIsSelf ?? false;
    final msgId = _dynamicString(message?.msgID) ?? _dynamicString(message?.id);
    final peerIdentifier =
        _dynamicString(message?.userID) ?? fallbackPeerIdentifier;
    final senderIdentifier =
        _dynamicString(message?.sender) ?? fallbackSenderIdentifier;

    return <String, dynamic>{
      if (msgId != null && msgId.isNotEmpty) 'id': 'im_$msgId',
      'sender_id': senderIdentifier,
      'sender_role': isSelf ? 'me' : 'peer',
      'body': body,
      'message_type': 'text',
      'created_at': _timestampToIso(message?.timestamp),
      'metadata': <String, dynamic>{
        'provider': 'tencent_im',
        if (msgId != null && msgId.isNotEmpty) 'im_msg_id': msgId,
        if (peerIdentifier != null && peerIdentifier.isNotEmpty)
          'peer_im_identifier': peerIdentifier,
        if (senderIdentifier != null && senderIdentifier.isNotEmpty)
          'sender_im_identifier': senderIdentifier,
        'is_self': isSelf,
      },
    };
  }

  static String _timestampToIso(dynamic raw) {
    final timestamp = raw is int ? raw : int.tryParse(raw?.toString() ?? '');
    if (timestamp == null || timestamp <= 0) {
      return DateTime.now().toIso8601String();
    }
    final milliseconds = timestamp > 20000000000 ? timestamp : timestamp * 1000;
    return DateTime.fromMillisecondsSinceEpoch(milliseconds).toIso8601String();
  }

  static String? _dynamicString(dynamic value) {
    final text = value?.toString();
    return text == null || text.isEmpty ? null : text;
  }

  static bool? _dynamicBool(dynamic value) {
    if (value is bool) return value;
    if (value == null) return null;
    return value.toString() == 'true';
  }

  static void _throwIfFailed(String prefix, int code, String desc) {
    if (code == 0) return;
    throw StateError('$prefix: $code $desc');
  }
}

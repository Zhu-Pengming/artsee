import 'dart:typed_data';

import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'supabase_service.dart';

/// 基于 Supabase Storage 的对象存储封装；所有用户图片（头像、后续 UGC）经此上传。
/// Bucket：`avatars`（公开读），路径：`{user_id}/...`，由 RLS 限制仅本人可写。
class StorageService {
  StorageService._();

  static const String userBucket = 'avatars';

  static SupabaseClient get _client => Supabase.instance.client;

  /// 上传任意用户文件到 `{uid}/{relativePath}`，如 `posts/cover_1.jpg`
  static Future<String> uploadUserObject({
    required String relativePath,
    required Uint8List bytes,
    String? contentType,
  }) async {
    final uid = SupabaseService.currentUser?.id;
    if (uid == null) throw StateError('未登录');
    final path = '$uid/$relativePath';
    await _client.storage.from(userBucket).uploadBinary(
          path,
          bytes,
          fileOptions: FileOptions(
            upsert: true,
            contentType: contentType ?? 'application/octet-stream',
          ),
        );
    return _client.storage.from(userBucket).getPublicUrl(path);
  }

  /// 头像：固定路径 `{uid}/avatar.{ext}`，便于覆盖与缓存刷新
  static Future<String> uploadAvatarFile(XFile file) async {
    final uid = SupabaseService.currentUser?.id;
    if (uid == null) throw StateError('未登录');
    final name = file.name;
    final ext = name.contains('.') ? name.split('.').last.toLowerCase() : 'jpg';
    final safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].contains(ext) ? ext : 'jpg';
    final path = '$uid/avatar.$safeExt';
    final bytes = await file.readAsBytes();
    final mime = _mimeForExt(safeExt);
    await _client.storage.from(userBucket).uploadBinary(
          path,
          bytes,
          fileOptions: FileOptions(upsert: true, contentType: mime),
        );
    return _client.storage.from(userBucket).getPublicUrl(path);
  }

  static String _mimeForExt(String ext) {
    switch (ext) {
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/jpeg';
    }
  }
}

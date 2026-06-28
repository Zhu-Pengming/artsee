import 'dart:io' show Platform;

String resolveApiBaseUrl(String webDevPort) {
  if (Platform.isAndroid) return 'http://10.0.2.2:$webDevPort';
  return 'http://127.0.0.1:$webDevPort';
}

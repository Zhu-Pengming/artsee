import 'package:web/web.dart' as web;

String resolveApiBaseUrl(String webDevPort) {
  final location = web.window.location;
  final host = location.hostname;
  final scheme = location.protocol.replaceAll(':', '');

  if (host.isNotEmpty && !_isLocalWebHost(host)) {
    return '$scheme://$host';
  }

  return 'http://localhost:$webDevPort';
}

bool _isLocalWebHost(String host) {
  final normalized = host.toLowerCase();
  return normalized == 'localhost' ||
      normalized == '127.0.0.1' ||
      normalized == '::1';
}

export 'api_base_url_resolver_stub.dart'
    if (dart.library.html) 'api_base_url_resolver_web.dart'
    if (dart.library.io) 'api_base_url_resolver_io.dart';

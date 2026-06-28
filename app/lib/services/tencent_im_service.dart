// Conditional export for platform-specific implementations
export 'tencent_im_service_stub.dart'
    if (dart.library.io) 'tencent_im_service_original.dart'
    if (dart.library.html) 'tencent_im_service_stub.dart';

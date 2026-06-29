// Conditional export for platform-specific implementations.
// Tencent Cloud Chat SDK is used on mobile/desktop IO targets; Web keeps a
// stub because the SDK package does not support Flutter Web.
export 'tencent_im_service_stub.dart'
    if (dart.library.io) 'tencent_im_service_original.dart'
    if (dart.library.html) 'tencent_im_service_stub.dart';

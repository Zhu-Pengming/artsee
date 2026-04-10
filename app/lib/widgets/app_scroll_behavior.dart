import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// 减轻列表在边界处「整块画面被拉长」的弹性过度滚动（常见于 Android 模拟器 + Material 3）。
/// 下拉刷新仍可正常使用。
class ArtseeScrollBehavior extends MaterialScrollBehavior {
  const ArtseeScrollBehavior();

  /// 不包裹 [StretchingOverscrollIndicator]，避免顶/底拖拽时的拉伸动画。
  @override
  Widget buildOverscrollIndicator(
    BuildContext context,
    Widget child,
    ScrollableDetails details,
  ) {
    return child;
  }

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) {
    // Android / Web：夹紧物理，无 iOS 式大幅回弹（模拟器上观感更接近「到顶即停」）
    if (kIsWeb ||
        Theme.of(context).platform == TargetPlatform.android ||
        Theme.of(context).platform == TargetPlatform.fuchsia) {
      return const ClampingScrollPhysics();
    }
    return super.getScrollPhysics(context);
  }
}

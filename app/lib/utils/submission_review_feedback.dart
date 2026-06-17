import 'package:flutter/material.dart';

import '../screens/profile/content_submissions_screen.dart';

void showSubmissionReviewSnackBar({
  required ScaffoldMessengerState messenger,
  required NavigatorState navigator,
  String message = '提交成功，等待审核',
}) {
  messenger.hideCurrentSnackBar();
  messenger.showSnackBar(
    SnackBar(
      content: Text(message),
      action: SnackBarAction(
        label: '查看记录',
        onPressed: () {
          navigator.push(
            MaterialPageRoute<void>(
              builder: (_) => const ContentSubmissionsScreen(),
            ),
          );
        },
      ),
    ),
  );
}

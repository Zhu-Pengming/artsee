import 'package:flutter/material.dart';

import '../screens/auth/login_screen.dart';
import '../services/supabase_service.dart';

Future<bool> ensureLoggedIn(
  BuildContext context, {
  String message = '请先登录后继续',
}) async {
  if (SupabaseService.isLoggedIn) return true;
  await Navigator.of(context).push<void>(
    MaterialPageRoute<void>(builder: (_) => const LoginScreen()),
  );
  if (SupabaseService.isLoggedIn) return true;
  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
  return false;
}

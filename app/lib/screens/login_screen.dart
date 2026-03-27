import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'main_screen.dart';
import 'onboarding_screen.dart';

// 导入配色常量（从 main.dart 复制一份或共享）
class _PorcelainColors {
  static const Color porcelainDeep = Color(0xFF183b90);
  static const Color porcelainDark = Color(0xFF425691);
  static const Color porcelain = Color(0xFF4074b1);
  static const Color porcelainLight = Color(0xFF5A8FC9);
  static const Color porcelainPale = Color(0xFFA8C4E0);
  static const Color porcelainWhite = Color(0xFFf2f0e9);
  static const Color porcelainIvory = Color(0xFFE8E6DF);
  static const Color porcelainCream = Color(0xFFDEDCD5);
  static const Color inkBlack = Color(0xFF1A2332);
  static const Color inkGray = Color(0xFF3A4A5C);
  static const Color inkLight = Color(0xFF6A7A8C);
  static const Color inkMuted = Color(0xFF9AA8B8);
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  final _authService = AuthService();
  
  bool _isLoading = false;
  int _countdown = 0;
  String? _errorMessage;

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _sendCode() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty || phone.length != 11) {
      setState(() {
        _errorMessage = '请输入正确的手机号';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _authService.sendSmsCode(phone);

    setState(() {
      _isLoading = false;
    });

    if (result['success'] == true) {
      setState(() {
        _countdown = 60;
      });
      
      // 倒计时
      Future.doWhile(() async {
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) {
          setState(() {
            _countdown--;
          });
        }
        return _countdown > 0;
      });

      // 开发环境显示验证码
      if (result['code'] != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('验证码: ${result["code"]}'),
            backgroundColor: _PorcelainColors.porcelainDark,
          ),
        );
      }
    } else {
      setState(() {
        _errorMessage = result['error'] ?? '发送失败';
      });
    }
  }

  Future<void> _login() async {
    final phone = _phoneController.text.trim();
    final code = _codeController.text.trim();

    if (phone.isEmpty || code.isEmpty) {
      setState(() {
        _errorMessage = '请填写手机号和验证码';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _authService.verifySmsCode(phone, code);

    setState(() {
      _isLoading = false;
    });

    if (result['success'] == true) {
      // 登录成功后，检查是否为新用户
      final isNewUser = result['isNewUser'] == true;
      
      if (mounted) {
        if (isNewUser) {
          // 新用户进入引导页面
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const OnboardingScreen()),
          );
        } else {
          // 老用户直接进入主页
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const MainScreen()),
          );
        }
      }
    } else {
      setState(() {
        _errorMessage = result['error'] ?? '登录失败';
      });
    }
  }

  Future<void> _loginWithWeChat() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // TODO: 实现微信登录逻辑
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('微信登录功能开发中...'),
        backgroundColor: _PorcelainColors.porcelainDark,
      ),
    );

    setState(() {
      _isLoading = false;
    });
  }

  // 开发者一键登录
  Future<void> _devLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _authService.devLogin();

    setState(() {
      _isLoading = false;
    });

    if (result['success'] == true) {
      // 登录成功后，检查是否为新用户
      final isNewUser = result['isNewUser'] == true;
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('开发者登录成功！角色: ${result['user']?['role'] ?? 'admin'}'),
            backgroundColor: const Color(0xFF07C160),
          ),
        );
        
        if (isNewUser) {
          // 新用户进入引导页面
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const OnboardingScreen()),
          );
        } else {
          // 老用户直接进入主页
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const MainScreen()),
          );
        }
      }
    } else {
      setState(() {
        _errorMessage = result['error'] ?? '开发者登录失败';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _PorcelainColors.porcelainWhite,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              // Logo - 青花配色渐变
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      _PorcelainColors.porcelainDeep,
                      _PorcelainColors.porcelainDark,
                      _PorcelainColors.porcelain,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: _PorcelainColors.porcelain.withOpacity(0.25),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.palette_outlined,
                  color: Colors.white,
                  size: 44,
                ),
              ),
              const SizedBox(height: 32),
              
              // 标题
              const Text(
                '欢迎登录 艺见心',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: _PorcelainColors.inkBlack,
                  letterSpacing: 0.02,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                '发现、收藏和分享艺术品',
                style: TextStyle(
                  fontSize: 14,
                  color: _PorcelainColors.inkGray,
                  letterSpacing: 0.05,
                ),
              ),
              const SizedBox(height: 40),
              
              // 错误提示
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(14),
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF5F5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFFD4D4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.error_outline,
                        color: Color(0xFFB85C5C),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(
                            color: Color(0xFFB85C5C),
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              
              // 手机号输入
              Container(
                decoration: BoxDecoration(
                  color: _PorcelainColors.porcelainIvory,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  maxLength: 11,
                  style: const TextStyle(
                    color: _PorcelainColors.inkBlack,
                    fontSize: 16,
                  ),
                  decoration: InputDecoration(
                    hintText: '请输入手机号',
                    hintStyle: const TextStyle(
                      color: _PorcelainColors.inkLight,
                    ),
                    prefixIcon: const Icon(
                      Icons.phone_outlined,
                      color: _PorcelainColors.porcelain,
                    ),
                    filled: true,
                    fillColor: Colors.transparent,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: _PorcelainColors.porcelain,
                        width: 2,
                      ),
                    ),
                    counterText: '',
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // 验证码输入
              Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: _PorcelainColors.porcelainIvory,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: TextField(
                        controller: _codeController,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        style: const TextStyle(
                          color: _PorcelainColors.inkBlack,
                          fontSize: 16,
                        ),
                        decoration: InputDecoration(
                          hintText: '验证码',
                          hintStyle: const TextStyle(
                            color: _PorcelainColors.inkLight,
                          ),
                          prefixIcon: const Icon(
                            Icons.lock_outline,
                            color: _PorcelainColors.porcelain,
                          ),
                          filled: true,
                          fillColor: Colors.transparent,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: _PorcelainColors.porcelain,
                              width: 2,
                            ),
                          ),
                          counterText: '',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _countdown > 0 || _isLoading ? null : _sendCode,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _countdown > 0
                            ? _PorcelainColors.porcelainPale
                            : _PorcelainColors.porcelain,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        _countdown > 0 ? '${_countdown}s' : '获取验证码',
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),
              
              // 登录按钮
              Container(
                width: double.infinity,
                height: 56,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: const LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [
                      _PorcelainColors.porcelainDark,
                      _PorcelainColors.porcelain,
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: _PorcelainColors.porcelain.withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          '登录',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.05,
                          ),
                        ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              // 分隔线
              Row(
                children: [
                  Expanded(
                    child: Divider(
                      color: _PorcelainColors.porcelainCream,
                      thickness: 1,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      '或使用以下方式登录',
                      style: TextStyle(
                        fontSize: 12,
                        color: _PorcelainColors.inkMuted,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Divider(
                      color: _PorcelainColors.porcelainCream,
                      thickness: 1,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // 其他登录方式图标
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // 微信登录图标
                  InkWell(
                    onTap: _isLoading ? null : _loginWithWeChat,
                    borderRadius: BorderRadius.circular(28),
                    child: Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: const Color(0xFF07C160),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF07C160).withOpacity(0.25),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.chat_bubble,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 20),
              
              // 开发者一键登录按钮
              InkWell(
                onTap: _isLoading ? null : _devLogin,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: _PorcelainColors.porcelain.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _PorcelainColors.porcelain.withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.developer_mode,
                        color: _PorcelainColors.porcelain,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '开发者一键登录',
                        style: TextStyle(
                          fontSize: 12,
                          color: _PorcelainColors.porcelain,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              // 底部提示
              Text(
                '未注册手机号验证后将自动创建账号',
                style: TextStyle(
                  fontSize: 12,
                  color: _PorcelainColors.inkMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

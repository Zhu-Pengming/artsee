import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../config/dev_test_account.dart';
import '../../services/supabase_service.dart';
import '../../services/backend_api_service.dart';
import '../../widgets/common.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

const _greyscale = ColorFilter.matrix([
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
]);

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _nicknameCtrl = TextEditingController();

  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _nicknameFocus = FocusNode();

  bool _isLogin = true;
  bool _loading = false;
  bool _isColorful = false;
  String? _error;

  @override
  void initState() {
    super.initState();

    _emailCtrl.addListener(_updateColorfulState);
    _passwordCtrl.addListener(_updateColorfulState);
    _nicknameCtrl.addListener(_updateColorfulState);

    _emailFocus.addListener(() {
      print('📧 Email focus changed: ${_emailFocus.hasFocus}');
      _updateColorfulState();
    });
    _passwordFocus.addListener(() {
      print('🔒 Password focus changed: ${_passwordFocus.hasFocus}');
      _updateColorfulState();
    });
    _nicknameFocus.addListener(() {
      print('👤 Nickname focus changed: ${_nicknameFocus.hasFocus}');
      _updateColorfulState();
    });
    
    print('✅ LoginScreen initState completed');
  }

  void _updateColorfulState() {
    final hasFocus = _emailFocus.hasFocus ||
        _passwordFocus.hasFocus ||
        _nicknameFocus.hasFocus;
    final hasText = _emailCtrl.text.isNotEmpty ||
        _passwordCtrl.text.isNotEmpty ||
        _nicknameCtrl.text.isNotEmpty;
    final colorful = hasFocus || hasText;
    if (colorful != _isColorful) {
      setState(() => _isColorful = colorful);
    }
  }

  @override
  void dispose() {
    _emailCtrl.removeListener(_updateColorfulState);
    _passwordCtrl.removeListener(_updateColorfulState);
    _nicknameCtrl.removeListener(_updateColorfulState);

    _emailFocus.removeListener(_updateColorfulState);
    _passwordFocus.removeListener(_updateColorfulState);
    _nicknameFocus.removeListener(_updateColorfulState);

    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _nicknameCtrl.dispose();

    _emailFocus.dispose();
    _passwordFocus.dispose();
    _nicknameFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (_isLogin) {
        final res = await SupabaseService.signIn(
          _emailCtrl.text.trim(),
          _passwordCtrl.text,
        );
        if (res.user == null) throw Exception('登录失败，请检查邮箱和密码');
        if (mounted) Navigator.pop(context);
      } else {
        if (_nicknameCtrl.text.trim().isEmpty) throw Exception('请填写昵称');
        
        // 通过 API 注册（统一处理 Auth 和 user_profiles）
        final result = await BackendApiService.signup(
          email: _emailCtrl.text.trim(),
          password: _passwordCtrl.text,
          nickname: _nicknameCtrl.text.trim(),
        );
        
        if (result['success'] != true) {
          throw Exception(result['error'] ?? '注册失败');
        }
        
        // 注册成功后自动登录
        final res = await SupabaseService.signIn(
          _emailCtrl.text.trim(),
          _passwordCtrl.text,
        );
        if (res.user == null) throw Exception('注册成功，但登录失败，请手动登录');
        
        if (mounted) Navigator.pop(context);
      }
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(
        () => _error = e.toString().replaceFirst('Exception: ', ''),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _devQuickLogin() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await SupabaseService.signIn(
        DevTestAccount.email,
        DevTestAccount.password,
      );
      if (res.user == null) throw Exception('登录失败');
      if (mounted) Navigator.pop(context);
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() {
        _error =
            '测试账号无法登录。请在项目根执行：npm run ensure:dev-user（需配置 SUPABASE_SERVICE_ROLE_KEY）。\n${e.toString()}';
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    print('🏗️ LoginScreen build - isLogin: $_isLogin, loading: $_loading, colorful: $_isColorful');
    final size = MediaQuery.sizeOf(context);
    final imageHeight = size.height * 0.42;

    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Column(
            children: [
              SizedBox(
                height: imageHeight,
                width: double.infinity,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(
                      'assets/images/login_hero.png',
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          Container(color: context.artC.silver.withOpacity(0.35)),
                    ),
                    AnimatedOpacity(
                      opacity: _isColorful ? 0.0 : 1.0,
                      duration: const Duration(milliseconds: 600),
                      curve: Curves.easeOut,
                      child: ColorFiltered(
                        colorFilter: _greyscale,
                        child: Image.asset(
                          'assets/images/login_hero.png',
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              Container(color: context.artC.silver.withOpacity(0.35)),
                        ),
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            context.artC.ink.withOpacity(0.45),
                            context.artC.ink.withOpacity(0.1),
                            Colors.transparent,
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          stops: const [0.0, 0.4, 1.0],
                        ),
                      ),
                    ),
                    SafeArea(
                      bottom: false,
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(24, 8, 24, 48),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                GestureDetector(
                                  onTap: () => Navigator.pop(context),
                                  child: Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: context.artC.porcelain.withOpacity(0.12),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.close,
                                      size: 20,
                                      color: context.artC.porcelain.withOpacity(0.9),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const Spacer(),
                            Text(
                              'Artiqore',
                              style: TextStyle(
                                fontSize: 40,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: -0.5,
                                height: 1.1,
                                shadows: [
                                  Shadow(
                                    color: context.artC.ink.withOpacity(0.25),
                                    blurRadius: 12,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '连接先锋创作与奢侈品收藏的桥梁',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                                height: 1.4,
                                shadows: [
                                  Shadow(
                                    color: context.artC.ink.withOpacity(0.35),
                                    blurRadius: 10,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(child: ColoredBox(color: context.artC.porcelain)),
            ],
          ),
          Positioned(
            top: imageHeight - 28,
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: BoxDecoration(
                color: context.artC.porcelain,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(32),
                ),
              ),
              child: SafeArea(
                top: false,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(28, 32, 28, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (!_isLogin)
                            GestureDetector(
                              onTap: () => setState(() => _isLogin = true),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                child: Icon(
                                  Icons.arrow_back_ios,
                                  size: 18,
                                  color: context.artC.ink.withOpacity(0.45),
                                ),
                              ),
                            ),
                          if (!_isLogin) const SizedBox(width: 8),
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 200),
                            transitionBuilder: (child, animation) {
                              return FadeTransition(
                                opacity: animation,
                                child: SlideTransition(
                                  position: Tween<Offset>(
                                    begin: const Offset(0, 0.08),
                                    end: Offset.zero,
                                  ).animate(animation),
                                  child: child,
                                ),
                              );
                            },
                            child: Text(
                              _isLogin ? '登录' : '注册',
                              key: ValueKey<bool>(_isLogin),
                              style: TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w700,
                                color: context.artC.ink,
                                height: 1.2,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 28),
                      Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (!_isLogin) ...[
                              _buildInput(
                                controller: _nicknameCtrl,
                                focusNode: _nicknameFocus,
                                hint: '昵称',
                                icon: Icons.person_outline,
                                validator: (v) =>
                                    v!.isEmpty ? '请填写昵称' : null,
                              ),
                              const SizedBox(height: 16),
                            ],
                            _buildInput(
                              controller: _emailCtrl,
                              focusNode: _emailFocus,
                              hint: '邮箱',
                              icon: Icons.email_outlined,
                              keyboardType: TextInputType.emailAddress,
                              validator: (v) => v!.isEmpty
                                  ? '请填写邮箱'
                                  : (!v.contains('@')
                                      ? '邮箱格式不正确'
                                      : null),
                            ),
                            const SizedBox(height: 16),
                            _buildInput(
                              controller: _passwordCtrl,
                              focusNode: _passwordFocus,
                              hint: '密码',
                              icon: Icons.lock_outline,
                              obscureText: true,
                              validator: (v) =>
                                  v!.length < 6 ? '密码至少6位' : null,
                            ),
                            if (_error != null) ...[
                              const SizedBox(height: 16),
                              Text(
                                _error!,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFC62828),
                                  height: 1.5,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                            const SizedBox(height: 28),
                            SizedBox(
                              height: 54,
                              child: ElevatedButton(
                                onPressed: _loading ? null : _submit,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: kCobalt,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                child: _loading
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : Text(
                                        _isLogin ? '登录' : '注册',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.48),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(
                                  color: context.artC.silver.withOpacity(0.42),
                                ),
                              ),
                              child: Column(
                                children: [
                                  _AuthSecondaryAction(
                                    icon: _isLogin
                                        ? Icons.person_add_alt_1_outlined
                                        : Icons.login_rounded,
                                    title: _isLogin ? '还没有账号？' : '已有账号？',
                                    subtitle: _isLogin
                                        ? '创建你的艺术身份档案'
                                        : '返回邮箱密码登录',
                                    action: _isLogin ? '去注册' : '去登录',
                                    onTap: () =>
                                        setState(() => _isLogin = !_isLogin),
                                  ),
                                  if (_isLogin) ...[
                                    const SizedBox(height: 10),
                                    Divider(
                                      height: 1,
                                      color: context.artC.silver.withOpacity(0.5),
                                    ),
                                    const SizedBox(height: 10),
                                    _AuthSecondaryAction(
                                      icon: Icons.chat_bubble_outline,
                                      title: '微信登录',
                                      subtitle: '后续接入微信授权',
                                      action: '预留',
                                      onTap: () {
                                        // TODO: 微信登录
                                      },
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),
                            GestureDetector(
                              onTap: () =>
                                  Navigator.of(context).maybePop(),
                              child: Container(
                                height: 42,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: context.artC.silver.withOpacity(0.24),
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Text(
                                  '先随便看看',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: context.artC.ink.withOpacity(0.48),
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 30),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          if (devLoginShortcutsEnabled)
            Positioned(
              bottom: 10,
              left: 0,
              right: 0,
              child: Center(
                child: GestureDetector(
                  onTap: _loading ? null : _devQuickLogin,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.72),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: context.artC.silver.withOpacity(0.5),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.bolt_outlined,
                          size: 14,
                          color: context.artC.ink.withOpacity(0.42),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '开发测试登录',
                          style: TextStyle(
                            fontSize: 10,
                            color: context.artC.ink.withOpacity(0.42),
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildInput({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String hint,
    required IconData icon,
    bool obscureText = false,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return GestureDetector(
      onTap: () {
        print('🔵 [$hint] GestureDetector onTap triggered');
        FocusScope.of(context).requestFocus(focusNode);
      },
      child: TextFormField(
        controller: controller,
        focusNode: focusNode,
        obscureText: obscureText,
        keyboardType: keyboardType,
        textInputAction:
            obscureText ? TextInputAction.done : TextInputAction.next,
        onTap: () {
          print('🟢 [$hint] TextFormField onTap triggered');
          print('   - hasFocus: ${focusNode.hasFocus}');
          print('   - text: ${controller.text}');
          
          // 强制请求焦点并显示键盘
          if (!focusNode.hasFocus) {
            FocusScope.of(context).requestFocus(focusNode);
          }
          
          // iOS 模拟器需要手动触发键盘
          WidgetsBinding.instance.addPostFrameCallback((_) {
            SystemChannels.textInput.invokeMethod('TextInput.show');
            print('⌨️ [$hint] Keyboard show invoked');
          });
        },
        onFieldSubmitted: (_) {
          print('🟡 [$hint] onFieldSubmitted');
          if (obscureText) {
            _submit();
          } else {
            FocusScope.of(context).requestFocus(_passwordFocus);
          }
        },
        onChanged: (value) {
          print('🟣 [$hint] onChanged: $value');
        },
        validator: validator,
        decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(
          fontSize: 14,
          color: context.artC.ink.withOpacity(0.35),
        ),
        filled: true,
        fillColor: context.artC.silver.withOpacity(0.35),
        prefixIcon:
            Icon(icon, size: 20, color: context.artC.ink.withOpacity(0.35)),
        contentPadding: const EdgeInsets.symmetric(vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: kCobalt.withOpacity(0.45), width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: kCobalt.withOpacity(0.45), width: 1.2),
        ),
        ),
        style: TextStyle(fontSize: 15, color: context.artC.ink),
      ),
    );
  }
}

class _AuthSecondaryAction extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String action;
  final VoidCallback? onTap;

  const _AuthSecondaryAction({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.action,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: kCobalt.withOpacity(0.06),
              borderRadius: BorderRadius.circular(13),
            ),
            child: Icon(icon, size: 18, color: kCobalt),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: context.artC.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: context.artC.ink.withOpacity(0.36),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              color: context.artC.ink,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              action,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

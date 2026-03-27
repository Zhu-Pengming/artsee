"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 发送验证码
  const sendCode = async () => {
    if (!phone || phone.length !== 11) {
      setError("请输入正确的手机号");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          country_code: "+86",
          purpose: "login",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) {
              clearInterval(timer);
              return 0;
            }
            return c - 1;
          });
        }, 1000);

        // 开发环境显示验证码
        if (data.code) {
          console.log("验证码:", data.code);
        }
      } else {
        setError(data.error || "发送失败");
      }
    } catch (err: any) {
      setError(err.message || "网络错误");
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !code) {
      setError("请填写手机号和验证码");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/verify-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          code,
          country_code: "+86",
        }),
      });

      const data = await res.json();

      if (data.success) {
        // 保存用户信息到 localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        // 跳转到首页或dashboard
        router.push("/dashboard");
      } else {
        setError(data.error || "登录失败");
      }
    } catch (err: any) {
      setError(err.message || "网络错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen porcelain-pattern flex items-center justify-center p-4">
      {/* 装饰背景 - 山水意境 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-porcelain/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-porcelain-deep/5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="bg-white rounded-2xl shadow-porcelain-lg p-8 w-full max-w-md relative z-10">
        {/* Logo - 青花渐变 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl porcelain-gradient flex items-center justify-center mb-4 shadow-porcelain relative overflow-hidden">
            <div className="absolute inset-0 porcelain-gloss" />
            <svg
              className="w-10 h-10 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink-black">欢迎登录 艺见心</h1>
          <p className="text-sm text-ink-gray mt-2">发现、收藏和分享艺术品</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-porcelain-danger/10 border border-porcelain-danger/20 rounded-xl text-porcelain-danger text-sm">
            {error}
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* 手机号输入 - 高白泥背景 */}
          <div>
            <label className="block text-sm font-medium text-ink-black mb-1">
              手机号
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-gray">
                +86
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                maxLength={11}
                className="w-full pl-14 pr-4 py-3.5 bg-porcelain-ivory border border-transparent rounded-xl focus:outline-none focus:border-porcelain focus:ring-2 focus:ring-porcelain/20 transition-all text-ink-black placeholder:text-ink-light"
              />
            </div>
          </div>

          {/* 验证码输入 */}
          <div>
            <label className="block text-sm font-medium text-ink-black mb-1">
              验证码
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入验证码"
                maxLength={6}
                className="flex-1 px-4 py-3.5 bg-porcelain-ivory border border-transparent rounded-xl focus:outline-none focus:border-porcelain focus:ring-2 focus:ring-porcelain/20 transition-all text-ink-black placeholder:text-ink-light"
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={countdown > 0 || isLoading}
                className="px-5 py-3.5 bg-porcelain text-white rounded-xl font-medium hover:bg-porcelain-light transition-colors disabled:bg-porcelain-pale disabled:cursor-not-allowed whitespace-nowrap shadow-porcelain"
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </button>
            </div>
          </div>

          {/* 登录按钮 - 青花渐变 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 porcelain-gradient text-white rounded-xl font-medium hover:shadow-porcelain-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                登录中...
              </>
            ) : (
              "登录"
            )}
          </button>
        </form>

        {/* 微信登录 */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-porcelain-cream"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-ink-gray">其他登录方式</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full py-3.5 border-2 border-porcelain text-porcelain rounded-xl font-medium hover:bg-porcelain hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
            </svg>
            微信登录
          </button>
        </div>

        {/* 提示 */}
        <p className="mt-6 text-center text-xs text-ink-light">
          未注册手机号验证后将自动创建账号
        </p>
      </div>
    </div>
  );
}

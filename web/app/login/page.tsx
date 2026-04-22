"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        localStorage.setItem("user", JSON.stringify(data.user));
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
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 md:px-12 lg:px-24 py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Visual / Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hidden lg:block lg:col-span-7"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">返回首页</span>
          </Link>
          <h1 className="text-5xl xl:text-6xl font-extrabold font-headline leading-[0.95] tracking-tight text-on-surface mb-8 whitespace-pre-line">
            {'Artiqore:\n你的艺术留学\n第一站'}
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-md leading-relaxed mb-10 font-light">
            连接先锋创作与奢侈品收藏的桥梁。加入我们，开启你的艺术留学之旅。
          </p>
          <div className="aspect-[4/3] bg-surface-container-high overflow-hidden rounded-md shadow-2xl max-w-md">
            <img
              alt="Art Installation"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
              src="https://images.unsplash.com/photo-1545989253-02cc26577f88?w=800&q=80"
            />
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0"
        >
          <div className="lg:hidden mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">返回首页</span>
            </Link>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-md bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/10">
              <span className="text-on-primary text-2xl font-bold font-headline">艺</span>
            </div>
            <h2 className="text-2xl font-bold font-headline text-on-surface">欢迎登录 Artiqore</h2>
            <p className="text-sm text-on-surface-variant mt-1">发现、收藏和分享艺术品</p>
          </div>

          <div className="bg-surface-container-lowest rounded-md shadow-ambient p-8 border border-outline-variant/10 relative z-10">
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                  手机号
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                    +86
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入手机号"
                    maxLength={11}
                    className="w-full pl-14 pr-4 py-3.5 bg-surface border border-outline-variant/20 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-on-surface placeholder:text-on-surface-variant/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                  验证码
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="请输入验证码"
                    maxLength={6}
                    className="flex-1 px-4 py-3.5 bg-surface border border-outline-variant/20 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-on-surface placeholder:text-on-surface-variant/40"
                  />
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={countdown > 0 || isLoading}
                    className="px-5 py-3.5 bg-primary text-on-primary rounded-md font-medium hover:bg-primary-dim transition-colors disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:cursor-not-allowed whitespace-nowrap text-sm"
                  >
                    {countdown > 0 ? `${countdown}s` : "获取验证码"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary text-on-primary rounded-md font-semibold text-sm hover:bg-primary-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                登录
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-surface-container-lowest text-on-surface-variant">其他登录方式</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 w-full py-3.5 border border-outline-variant/30 text-on-surface rounded-md font-medium hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.7 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                </svg>
                微信登录
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-on-surface-variant/70">
              未注册手机号验证后将自动创建账号。<br className="hidden sm:block" />
              继续即表示同意
              <Link href="/terms" className="text-primary hover:underline underline-offset-2">用户协议</Link>
              和
              <Link href="/privacy" className="text-primary hover:underline underline-offset-2">隐私政策</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

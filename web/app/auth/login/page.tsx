'use client'

import { Suspense, useState } from 'react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/** 与仓库 AGENTS.md / `npm run ensure:dev-user` 中开发账号一致；可选覆盖 NEXT_PUBLIC_DEV_TEST_* */
const DEV_TEST_EMAIL = process.env.NEXT_PUBLIC_DEV_TEST_EMAIL ?? 'dev.test@artsee.app'
const DEV_TEST_PASSWORD = process.env.NEXT_PUBLIC_DEV_TEST_PASSWORD ?? 'ArtseeDev2026!'

function isWebDevMode() {
  return (
    process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_LOGIN === 'true'
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(redirect)
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { nickname } }
        })
        if (error) throw error
        if (data.user) {
          await supabase.from('user_profiles').upsert({
            id: data.user.id,
            nickname: nickname || email.split('@')[0],
            user_type: 'student',
            role: 'user',
          })
          setSuccess('注册成功！请检查邮箱完成验证，然后登录。')
          setMode('login')
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '操作失败'
      if (msg.includes('Invalid login credentials')) setError('邮箱或密码错误')
      else if (msg.includes('User already registered')) setError('该邮箱已注册，请直接登录')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleDevQuickLogin() {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: DEV_TEST_EMAIL,
        password: DEV_TEST_PASSWORD,
      })
      if (error) throw error
      router.push(redirect)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败'
      if (msg.includes('Invalid login credentials')) {
        setError('开发账号未就绪：请先在项目根执行 npm run ensure:dev-user 创建/同步该用户')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const showDevLogin = isWebDevMode()

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
          {/* Mobile back link */}
          <div className="lg:hidden mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">返回首页</span>
            </Link>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-md bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/10">
              <span className="text-on-primary text-2xl font-bold font-headline">艺</span>
            </div>
            <h2 className="text-2xl font-bold font-headline text-on-surface">Artiqore</h2>
            <p className="text-sm text-on-surface-variant mt-1">艺术留学一站式平台</p>
          </div>

          {/* Card */}
          <div className="bg-surface-container-lowest rounded-md shadow-ambient p-8 border border-outline-variant/10">
            {/* Tab */}
            <div className="flex bg-surface-container-low rounded-md p-1 mb-8">
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess('') }}
                  className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                    mode === m ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  {m === 'login' ? '登录' : '注册'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block uppercase tracking-wider">昵称</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="你的昵称（可后续修改）"
                    className="w-full px-4 py-3.5 rounded-md border border-outline-variant/20 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/40"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block uppercase tracking-wider">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3.5 rounded-md border border-outline-variant/20 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block uppercase tracking-wider">密码</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? '至少6位' : '请输入密码'}
                    required
                    minLength={6}
                    className="w-full px-4 py-3.5 pr-10 rounded-md border border-outline-variant/20 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-700 text-xs px-4 py-3 rounded-md">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-on-primary rounded-md font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:bg-primary-dim"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'login' ? '登录' : '创建账号'}
              </button>
            </form>

            <p className="text-center text-xs text-on-surface-variant/70 mt-6">
              继续即表示同意
              <Link href="/terms" className="text-primary hover:underline underline-offset-2">用户协议</Link>
              和
              <Link href="/privacy" className="text-primary hover:underline underline-offset-2">隐私政策</Link>
            </p>
          </div>

          {showDevLogin && (
            <div className="mt-5 rounded-md border border-amber-500/45 bg-amber-50/90 dark:border-amber-500/35 dark:bg-amber-950/35 px-4 py-3">
              <p className="text-[11px] leading-relaxed text-amber-950/90 dark:text-amber-100/90 mb-2.5 text-left">
                开发者模式：一键登录预置开发账号（需已执行 <code className="font-mono text-[10px]">npm run ensure:dev-user</code>，以同步管理员
                <code className="font-mono text-[10px]"> user_profiles.role</code> 等数据）。
              </p>
              <button
                type="button"
                onClick={handleDevQuickLogin}
                disabled={loading}
                className="w-full text-sm font-semibold text-amber-950 dark:text-amber-50 bg-amber-200/90 dark:bg-amber-800/55 hover:bg-amber-300 dark:hover:bg-amber-700/55 disabled:opacity-50 px-4 py-2.5 rounded-md transition-colors"
              >
                快捷登录（开发 / 管理员账号）
              </button>
            </div>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full text-center text-sm text-on-surface-variant mt-6 py-2 hover:text-primary transition-colors"
          >
            先逛逛，不登录 →
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-md bg-primary flex items-center justify-center mb-3 shadow-lg animate-pulse" />
            <div className="h-6 w-24 bg-surface-container-high rounded animate-pulse" />
          </div>
          <div className="bg-surface-container-lowest rounded-md shadow-ambient p-6 border border-outline-variant/10 h-80 animate-pulse" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

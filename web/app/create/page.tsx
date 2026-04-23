"use client";

import Link from "next/link";

// 发布页面 - WEB端
export default function CreatePage() {
  const createOptions = [
    {
      id: "portfolio",
      title: "发布作品集",
      subtitle: "展示你的创作，获得更多关注",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "porcelain",
      bgColor: "bg-porcelain/10",
      textColor: "text-porcelain",
      borderColor: "border-porcelain/20",
    },
    {
      id: "article",
      title: "写文章",
      subtitle: "分享申请经验、学习心得",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: "porcelain-dark",
      bgColor: "bg-porcelain-dark/10",
      textColor: "text-porcelain-dark",
      borderColor: "border-porcelain-dark/20",
    },
    {
      id: "question",
      title: "提问题",
      subtitle: "向社区寻求帮助和建议",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "porcelain-light",
      bgColor: "bg-porcelain-light/10",
      textColor: "text-porcelain-light",
      borderColor: "border-porcelain-light/20",
    },
    {
      id: "offer",
      title: "分享录取",
      subtitle: "分享你的Offer喜讯",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: "porcelain-pale",
      bgColor: "bg-porcelain-pale/10",
      textColor: "text-porcelain-deep",
      borderColor: "border-porcelain-pale/20",
    },
  ];

  return (
    <main className="min-h-screen bg-surface">
      {/* 顶部导航 */}
      <nav className="bg-card border-b border-outline-variant/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-ink-gray hover:text-porcelain transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-ink-black">创建内容</h1>
            </div>
            <Link href="/" className="text-ink-gray hover:text-porcelain transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-ink-black">分享你的创作</h2>
          <p className="text-ink-gray mt-2">选择合适的类型，开始创作吧</p>
        </div>

        {/* 发布选项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {createOptions.map((option) => (
            <button
              key={option.id}
              className={`group bg-card rounded-2xl p-6 shadow-porcelain hover-lift text-left border-2 ${option.borderColor} hover:border-porcelain transition-all`}
            >
              <div className={`w-16 h-16 rounded-2xl ${option.bgColor} ${option.textColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                {option.icon}
              </div>
              <h3 className="text-lg font-bold text-ink-black group-hover:text-porcelain transition-colors">
                {option.title}
              </h3>
              <p className="text-sm text-ink-gray mt-2">{option.subtitle}</p>
              <div className="flex items-center gap-2 mt-4 text-porcelain">
                <span className="text-sm font-medium">立即创建</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* 草稿箱 */}
        <div className="mt-12 bg-card rounded-2xl shadow-porcelain p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-porcelain-muted flex items-center justify-center">
                <svg className="w-6 h-6 text-porcelain" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-ink-black">草稿箱</h3>
                <p className="text-sm text-ink-gray">你有 2 个未完成的草稿</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-ink-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* 发布规范提示 */}
        <div className="mt-8 bg-porcelain-muted/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-porcelain flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-ink-gray">
              <p className="font-medium text-ink-black mb-1">发布规范</p>
              <p>请确保你的内容原创或已获得授权，禁止发布侵权、虚假或违法违规内容。</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

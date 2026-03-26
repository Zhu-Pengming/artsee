"use client";
import Link from "next/link";
import { newsList, posts, schools } from "@/lib/mock";

export default function Home() {
  const news = newsList;
  const postList = posts.slice(0, 3);
  const schoolList = schools.slice(0, 4);

  return (
    <main className="min-h-screen bg-gradient-to-br from-porcelain-white via-white to-porcelain-ivory">
      {/* 顶部导航 - 使用青花渐变 */}
      <nav className="porcelain-gradient text-white shadow-porcelain-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {/* Logo - 山水意境 */}
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <svg
                  className="w-6 h-6 text-white"
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
              <span className="text-xl font-bold tracking-wide">艺见心</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white/80 hover:text-white transition-colors">
                首页
              </Link>
              <Link href="/explore" className="text-white/80 hover:text-white transition-colors">
                探索
              </Link>
              <Link href="/market" className="text-white/80 hover:text-white transition-colors">
                市场
              </Link>
              <Link href="/profile" className="text-white/80 hover:text-white transition-colors">
                我的
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {/* 发布按钮 */}
              <Link 
                href="/create"
                className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-colors border border-white/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                发布
              </Link>
            <a 
              href="/login"
              className="bg-white text-porcelain-deep px-5 py-2 rounded-lg font-medium hover:bg-porcelain-white transition-colors shadow-lg"
            >
              登录
            </a>
          </div>
        </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-porcelain p-8">
            <p className="text-sm text-porcelain font-medium">面向艺术留学的咨询与成长平台</p>
            <h1 className="text-4xl font-bold text-ink-black mt-3 leading-tight">
              从院校选择到作品集优化，<br />全流程陪伴申请
            </h1>
            <p className="text-ink-gray mt-4 max-w-xl">
              借鉴成熟咨询产品的信息层级，优先呈现可预约导师、真实案例和进度管理，让用户更快做决策。
            </p>
            <div className="flex gap-3 mt-6">
              <Link href="/explore" className="px-5 py-3 rounded-xl bg-porcelain text-white font-medium">开始匹配院校</Link>
              <Link href="/market" className="px-5 py-3 rounded-xl border border-porcelain text-porcelain font-medium">查看导师咨询</Link>
            </div>
          </div>
          <div className="lg:col-span-2 bg-gradient-to-br from-porcelain-deep to-porcelain rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold">平台信任数据</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div><p className="text-2xl font-bold">120+</p><p className="text-white/80 text-sm">认证导师</p></div>
              <div><p className="text-2xl font-bold">38</p><p className="text-white/80 text-sm">本周可约</p></div>
              <div><p className="text-2xl font-bold">&lt; 2h</p><p className="text-white/80 text-sm">平均回复</p></div>
              <div><p className="text-2xl font-bold">4.8/5</p><p className="text-white/80 text-sm">服务评分</p></div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-ink-black">热门院校</h2>
            <Link href="/explore" className="text-sm text-porcelain">查看全部</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {schoolList.map((school) => (
              <div key={school.id} className="bg-white rounded-xl p-4 shadow-porcelain">
                <p className="font-semibold text-ink-black">{school.name}</p>
                <p className="text-sm text-ink-light mt-1">{school.country} · QS {school.qsRank}</p>
                <p className="text-xs text-ink-gray mt-2 line-clamp-2">{school.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-ink-black">咨询案例与动态</h2>
              <Link href="/explore" className="text-sm text-porcelain">更多内容</Link>
            </div>
            <div className="space-y-4">
              {postList.map((post) => (
                <div key={post.id} className="bg-white rounded-xl p-5 shadow-porcelain">
                  <p className="font-semibold text-ink-black">{post.title}</p>
                  <p className="text-sm text-ink-gray mt-2 line-clamp-2">{post.content}</p>
                  <div className="mt-3 text-xs text-ink-light">{post.author.nickname} · {post.likes} 赞 · {post.comments} 评论</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-porcelain">
            <h3 className="text-lg font-semibold text-ink-black">最新资讯</h3>
            <div className="mt-4 space-y-3">
              {news.map((item) => (
                <div key={item.id} className="pb-3 border-b border-porcelain-cream last:border-0">
                  <p className="text-sm font-medium text-ink-black">{item.title}</p>
                  <p className="text-xs text-ink-light mt-1">{item.category} · {item.views} 浏览</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 页脚 */}
      <footer className="porcelain-gradient text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center border border-white/30">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="font-semibold">艺见心 ArtSee</span>
            </div>
            <p className="text-white/60 text-sm">
              © 2024 艺见心. 探索艺术的无限可能
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

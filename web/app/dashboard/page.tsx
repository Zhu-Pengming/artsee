"use client";

import { useState } from "react";

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [currentLang, setCurrentLang] = useState<"zh" | "en">("zh");

  const menuItems = [
    { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "首页" },
    { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "作品集" },
    { icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", label: "艺术家" },
    { icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", label: "收藏" },
    { icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", label: "设置" },
  ];

  return (
    <div className="min-h-screen bg-porcelain-white flex">
      {/* 侧边栏 */}
      <aside
        className={`bg-porcelain-blue-dark text-porcelain-white flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo 区域 */}
        <div className="h-16 flex items-center px-4 border-b border-porcelain-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Ceylon 图标 */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-porcelain-blue-pale to-porcelain-white flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-porcelain-blue-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            {/* 品牌文字 - 收起时隐藏 */}
            <span
              className={`text-lg font-bold tracking-wide whitespace-nowrap transition-all duration-300 ${
                sidebarCollapsed ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              艺见心
            </span>
          </div>
        </div>

        {/* 菜单项 */}
        <nav className="flex-1 py-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center gap-3 px-4 py-3 text-porcelain-white/80 hover:text-porcelain-white hover:bg-porcelain-white/10 transition-all duration-200 group ${
                index === 0 ? "bg-porcelain-white/10 text-porcelain-white" : ""
              }`}
              title={sidebarCollapsed ? item.label : ""}
            >
              <svg
                className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                }`}
              >
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        {/* 收起/展开按钮 - 移除用户头像区域 */}
        <div className="p-4 border-t border-porcelain-white/10">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-porcelain-white/10 hover:bg-porcelain-white/20 transition-all duration-200 group"
            title={sidebarCollapsed ? "展开" : "收起"}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span
              className={`text-sm whitespace-nowrap transition-all duration-300 ${
                sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              }`}
            >
              收起侧边栏
            </span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 - 高度缩小为约原来的 2/3 (h-16 -> h-11) */}
        <header className="h-11 bg-white border-b border-porcelain-white-cream flex items-center justify-between px-4 shadow-sm">
          {/* 左侧 - 面包屑 */}
          <div className="flex items-center gap-2 text-ink-gray">
            <span className="text-sm">首页</span>
            <span className="text-porcelain-blue-pale">/</span>
            <span className="text-sm text-ink-black">概览</span>
          </div>

          {/* 中间 - 搜索框 */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-gray"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索项目..."
                className="w-full h-8 pl-9 pr-4 text-sm bg-porcelain-white-ivory border border-porcelain-white-cream rounded-lg focus:outline-none focus:border-porcelain-blue focus:ring-1 focus:ring-porcelain-blue transition-colors"
              />
            </div>
          </div>

          {/* 右侧 - 用户操作 */}
          <div className="flex items-center gap-3">
            {/* 通知图标 */}
            <button className="relative p-1.5 text-ink-gray hover:text-porcelain-blue-dark transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-porcelain-blue-light rounded-full"></span>
            </button>

            {/* 用户头像 - 带下拉菜单 */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-porcelain-white-ivory transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-porcelain-blue to-porcelain-blue-light flex items-center justify-center text-white text-xs font-medium">
                  U
                </div>
                <svg
                  className={`w-4 h-4 text-ink-gray transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 用户下拉菜单 */}
              {userMenuOpen && (
                <>
                  {/* 遮罩层 - 点击外部关闭 */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  {/* 菜单内容 */}
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-porcelain-lg border border-porcelain-white-cream z-50 py-1 overflow-hidden">
                    {/* 用户信息 */}
                    <div className="px-4 py-3 border-b border-porcelain-white-cream">
                      <p className="text-sm font-medium text-ink-black">用户名称</p>
                      <p className="text-xs text-ink-gray">user@example.com</p>
                    </div>

                    {/* 个人账号 */}
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-black hover:bg-porcelain-white-ivory transition-colors"
                    >
                      <svg className="w-4 h-4 text-ink-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      个人账号
                    </a>

                    {/* 设置 */}
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-black hover:bg-porcelain-white-ivory transition-colors"
                    >
                      <svg className="w-4 h-4 text-ink-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      设置
                    </a>

                    <div className="border-t border-porcelain-white-cream my-1" />

                    {/* 语言选择 */}
                    <div className="px-4 py-2">
                      <p className="text-xs text-ink-gray mb-2">语言</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentLang("zh")}
                          className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${
                            currentLang === "zh"
                              ? "bg-porcelain-blue-dark text-white"
                              : "bg-porcelain-white-ivory text-ink-black hover:bg-porcelain-white-cream"
                          }`}
                        >
                          中文
                        </button>
                        <button
                          onClick={() => setCurrentLang("en")}
                          className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${
                            currentLang === "en"
                              ? "bg-porcelain-blue-dark text-white"
                              : "bg-porcelain-white-ivory text-ink-black hover:bg-porcelain-white-cream"
                          }`}
                        >
                          English
                        </button>
                      </div>
                    </div>

                    {/* 颜色主题 */}
                    <div className="px-4 py-2">
                      <p className="text-xs text-ink-gray mb-2">主题</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentTheme("light")}
                          className={`flex-1 py-1.5 text-xs rounded-md flex items-center justify-center gap-1 transition-colors ${
                            currentTheme === "light"
                              ? "bg-porcelain-blue-dark text-white"
                              : "bg-porcelain-white-ivory text-ink-black hover:bg-porcelain-white-cream"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          浅色
                        </button>
                        <button
                          onClick={() => setCurrentTheme("dark")}
                          className={`flex-1 py-1.5 text-xs rounded-md flex items-center justify-center gap-1 transition-colors ${
                            currentTheme === "dark"
                              ? "bg-porcelain-blue-dark text-white"
                              : "bg-porcelain-white-ivory text-ink-black hover:bg-porcelain-white-cream"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          深色
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-porcelain-white-cream my-1" />

                    {/* 退出登录 */}
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      退出登录
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto p-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-porcelain p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-gray mb-1">累计咨询</p>
                  <p className="text-2xl font-bold text-ink-black">128 次</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-porcelain-blue-dark to-porcelain-blue flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-porcelain p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-gray mb-1">在跟进申请</p>
                  <p className="text-2xl font-bold text-ink-black">42 项</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-porcelain-blue to-porcelain-blue-light flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-porcelain p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-gray mb-1">收藏案例</p>
                  <p className="text-2xl font-bold text-ink-black">86 篇</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-porcelain-blue-light to-porcelain-blue-pale flex items-center justify-center">
                  <svg className="w-6 h-6 text-porcelain-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 最近活动 */}
          <div className="bg-white rounded-xl shadow-porcelain">
            <div className="px-6 py-4 border-b border-porcelain-white-cream">
              <h2 className="text-lg font-semibold text-ink-black">最近活动</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-3 border-b border-porcelain-white-ivory last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-porcelain-white-ivory flex items-center justify-center">
                      <svg className="w-5 h-5 text-porcelain-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-black">浏览了作品《艺术之光》</p>
                      <p className="text-xs text-ink-gray">2 小时前</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

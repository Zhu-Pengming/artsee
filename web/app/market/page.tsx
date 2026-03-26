"use client";

import { useState } from "react";
import { artResources, artworks } from "@/lib/mock";

// 市场页面 - 艺术文旅/艺术品交易/资源对接
export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<"tours" | "artworks" | "resources">("tours");

  return (
    <main className="min-h-screen bg-porcelain-white">
      {/* 顶部标题 */}
      <div className="bg-white border-b border-porcelain-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink-black">艺术市场</h1>
              <p className="text-sm text-ink-gray mt-1">艺术文旅、作品交易、资源对接</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2.5 text-ink-gray hover:text-porcelain transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2.5 text-ink-gray hover:text-porcelain transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 border-b border-porcelain-cream">
            {[
              { id: "tours" as const, label: "艺术文旅" },
              { id: "artworks" as const, label: "艺术品" },
              { id: "resources" as const, label: "资源对接" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-porcelain"
                    : "text-ink-light hover:text-ink-gray"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-porcelain rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 艺术文旅 Tab */}
        {activeTab === "tours" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {artResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-2xl shadow-porcelain overflow-hidden hover-lift">
                {/* 封面 */}
                <div className="h-56 bg-gradient-to-br from-porcelain to-porcelain-light relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-20 h-20 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-porcelain">
                      {resource.type === "tour" ? "艺术游学" : resource.type === "camp" ? "写生营地" : "暑期课程"}
                    </span>
                  </div>
                </div>
                
                {/* 内容 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-ink-black">{resource.title}</h3>
                  
                  <div className="flex items-center gap-6 mt-3 text-sm text-ink-gray">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {resource.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {resource.duration}
                    </span>
                  </div>
                  
                  <p className="text-sm text-ink-gray mt-4 line-clamp-2">{resource.description}</p>
                  
                  {/* 亮点 */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {resource.highlights.slice(0, 4).map((highlight) => (
                      <span key={highlight} className="px-3 py-1 bg-porcelain-muted text-porcelain text-xs rounded-lg">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-porcelain-cream">
                    <div>
                      <span className="text-2xl font-bold text-porcelain">¥{resource.price.toLocaleString()}</span>
                      <span className="text-sm text-ink-light ml-1">起/人</span>
                    </div>
                    <button className="px-6 py-2.5 bg-porcelain text-white rounded-xl font-medium hover:bg-porcelain-light transition-colors">
                      立即报名
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 艺术品 Tab */}
        {activeTab === "artworks" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="bg-white rounded-2xl shadow-porcelain overflow-hidden hover-lift">
                {/* 图片 */}
                <div className="aspect-[3/4] bg-gradient-to-br from-porcelain to-porcelain-light relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-ink-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* 信息 */}
                <div className="p-4">
                  <span className="text-xs text-porcelain font-medium">{artwork.category}</span>
                  <h3 className="font-bold text-ink-black mt-1">{artwork.title}</h3>
                  <p className="text-sm text-ink-light">by {artwork.artist.nickname}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-porcelain">¥{artwork.price.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-sm text-ink-light">
                      <svg className="w-4 h-4 text-porcelain-danger" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      {artwork.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 资源对接 Tab */}
        {activeTab === "resources" && (
          <div className="max-w-3xl mx-auto">
            {/* 角色选择 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white rounded-2xl shadow-porcelain p-8 hover-lift">
                <div className="w-16 h-16 rounded-2xl bg-porcelain/10 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-porcelain" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-ink-black">我是需求方</h3>
                <p className="text-ink-gray mt-2">寻找原创艺术作品、艺术家合作</p>
                <button className="w-full mt-6 py-3 bg-porcelain text-white rounded-xl font-medium hover:bg-porcelain-light transition-colors">
                  发布需求
                </button>
              </div>
              
              <div className="bg-white rounded-2xl shadow-porcelain p-8 hover-lift">
                <div className="w-16 h-16 rounded-2xl bg-porcelain-dark/10 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-porcelain-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-ink-black">我是艺术家</h3>
                <p className="text-ink-gray mt-2">展示作品、寻找商业合作机会</p>
                <button className="w-full mt-6 py-3 bg-porcelain-dark text-white rounded-xl font-medium hover:bg-porcelain-deep transition-colors">
                  入驻平台
                </button>
              </div>
            </div>

            {/* 成功案例 */}
            <h3 className="text-xl font-bold text-ink-black mb-6">成功案例</h3>
            <div className="space-y-4">
              {[
                { title: "某精品酒店艺术装饰项目", artist: "青年艺术家A", desc: "平台艺术家作品被选为酒店公共空间装饰，实现商业变现。" },
                { title: "品牌联名合作", artist: "青年艺术家B", desc: "与知名品牌合作推出联名产品，获得广泛市场认可。" },
              ].map((item, index) => (
                <div key={index} className="bg-porcelain-muted/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-porcelain-success" />
                    <h4 className="font-semibold text-ink-black">{item.title}</h4>
                  </div>
                  <p className="text-sm text-ink-gray">{item.desc}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-ink-light">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {item.artist}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

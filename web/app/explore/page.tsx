"use client";

import { useState } from "react";
import { schools, mentors } from "@/lib/mock";

// 探索页面 - 院校/课程/导师
export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"schools" | "programs" | "mentors">("schools");
  const [selectedCountry, setSelectedCountry] = useState("全部");
  const countries = ["全部", "英国", "美国", "欧洲", "亚洲"];

  return (
    <main className="min-h-screen bg-porcelain-white">
      {/* 顶部搜索 */}
      <div className="bg-white border-b border-porcelain-cream sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="搜索院校、专业、导师..."
                className="w-full pl-12 pr-4 py-3 bg-porcelain-ivory border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-porcelain/20 text-ink-black placeholder:text-ink-light"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="p-3 bg-porcelain-muted rounded-xl text-porcelain hover:bg-porcelain-muted/80 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 border-b border-porcelain-cream">
            {[
              { id: "schools" as const, label: "院校" },
              { id: "programs" as const, label: "专业" },
              { id: "mentors" as const, label: "导师" },
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
        {/* 院校 Tab */}
        {activeTab === "schools" && (
          <>
            {/* 国家筛选 */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCountry === country
                      ? "bg-porcelain text-white"
                      : "bg-white text-ink-gray hover:bg-porcelain-muted"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>

            {/* 院校列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map((school) => (
                <div key={school.id} className="bg-white rounded-2xl shadow-porcelain overflow-hidden hover-lift">
                  {/* 封面 */}
                  <div className="h-40 bg-gradient-to-br from-porcelain to-porcelain-light relative">
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-ink-black">QS {school.qsRank}</span>
                    </div>
                    <div className="absolute -bottom-8 left-6">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-porcelain">{school.name[0]}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 信息 */}
                  <div className="pt-10 pb-6 px-6">
                    <h3 className="text-lg font-bold text-ink-black">{school.name}</h3>
                    <p className="text-sm text-ink-light mt-1">{school.nameEn}</p>
                    
                    <div className="flex items-center gap-4 mt-4 text-sm text-ink-gray">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {school.country} · {school.city}
                      </span>
                    </div>
                    
                    <p className="text-sm text-ink-gray mt-3 line-clamp-2">{school.description}</p>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-porcelain-cream">
                      <span className="text-sm text-porcelain font-medium">{school.programs.length} 个专业</span>
                      <button className="text-sm text-porcelain hover:text-porcelain-dark font-medium">查看详情 →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 专业 Tab */}
        {activeTab === "programs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.flatMap((s) => s.programs).map((program) => (
              <div key={program.id} className="bg-white rounded-xl shadow-porcelain p-6 hover-lift">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-porcelain/10 text-porcelain text-xs font-medium rounded-lg">
                        {program.degree}
                      </span>
                      <span className="px-2.5 py-1 bg-porcelain-muted text-ink-gray text-xs rounded-lg">
                        {program.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-ink-black">{program.name}</h3>
                    <p className="text-sm text-ink-light">{program.nameEn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 text-sm text-ink-gray">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    {program.language}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    £{program.tuition.toLocaleString()}/年
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 导师 Tab */}
        {activeTab === "mentors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-2xl shadow-porcelain p-6 hover-lift">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-porcelain to-porcelain-light flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-white">{mentor.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink-black">{mentor.name}</h3>
                    <p className="text-sm text-porcelain">{mentor.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-ink-black">{mentor.rating}</span>
                      <span className="text-sm text-ink-light">({mentor.reviewCount}评价)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {mentor.specialties.slice(0, 3).map((specialty) => (
                    <span key={specialty} className="px-2.5 py-1 bg-porcelain-muted text-ink-gray text-xs rounded-lg">
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <p className="text-sm text-ink-gray mt-4 line-clamp-2">{mentor.bio}</p>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-porcelain-cream">
                  <div>
                    <span className="text-lg font-bold text-porcelain">¥{mentor.price}</span>
                    <span className="text-sm text-ink-light">/小时</span>
                  </div>
                  <button className="px-5 py-2 bg-porcelain text-white rounded-xl text-sm font-medium hover:bg-porcelain-light transition-colors">
                    预约咨询
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

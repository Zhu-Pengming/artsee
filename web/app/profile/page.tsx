"use client";

import { useState } from "react";
import { currentUser, applicationProgress } from "@/lib/mock";

// 个人中心页面 - 申请进度/作品集/收藏
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"applications" | "portfolio" | "collections">("applications");
  const user = currentUser;
  const progress = applicationProgress;

  return (
    <main className="min-h-screen bg-porcelain-white">
      {/* 用户信息头部 */}
      <div className="bg-white border-b border-porcelain-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-6">
            {/* 头像 */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-porcelain to-porcelain-light flex items-center justify-center shadow-porcelain">
              <span className="text-4xl font-bold text-white">{user.nickname[0]}</span>
            </div>
            
            {/* 信息 */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-ink-black">{user.nickname}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-porcelain-muted text-porcelain text-sm font-medium rounded-full">
                      {user.role === "student" ? "学生" : "艺术家"} · {user.country}
                    </span>
                  </div>
                  <p className="text-sm text-ink-gray mt-3">目标院校: {user.targetSchools.join(", ")}</p>
                </div>
                <button className="p-2.5 text-ink-gray hover:text-porcelain transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              {/* 数据统计 */}
              <div className="flex gap-12 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ink-black">{user.portfolioCount}</div>
                  <div className="text-sm text-ink-gray">作品集</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ink-black">{user.followers}</div>
                  <div className="text-sm text-ink-gray">粉丝</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ink-black">{user.following}</div>
                  <div className="text-sm text-ink-gray">关注</div>
                </div>
              </div>
              <div className="mt-6 bg-porcelain-muted/40 rounded-xl p-4">
                <p className="text-sm font-medium text-ink-black">身份信息</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2.5 py-1 text-xs bg-white rounded-full text-ink-gray">手机号已验证</span>
                  <span className="px-2.5 py-1 text-xs bg-white rounded-full text-ink-gray">申请身份已认证</span>
                  <span className="px-2.5 py-1 text-xs bg-white rounded-full text-ink-gray">资料完整度 82%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 申请进度概览 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-gradient-to-r from-porcelain to-porcelain-light rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <span className="font-semibold">申请进度</span>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{progress.filter(p => p.status !== "offer").length}</div>
                <div className="text-white/80 text-sm">进行中</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-3xl font-bold">{progress.filter(p => p.status === "offer").length}</div>
                <div className="text-white/80 text-sm">已录取</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{progress.length}</div>
                <div className="text-white/80 text-sm">总申请</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 border-b border-porcelain-cream">
            {[
              { id: "applications" as const, label: "申请进度" },
              { id: "portfolio" as const, label: "我的作品" },
              { id: "collections" as const, label: "收藏" },
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
        {/* 申请进度 Tab */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            {progress.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-porcelain p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-ink-black">{app.schoolName}</h3>
                    <p className="text-ink-gray">{app.programName}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    app.status === "offer"
                      ? "bg-porcelain-success/10 text-porcelain-success"
                      : app.status === "interview"
                      ? "bg-porcelain-warning/10 text-porcelain-warning"
                      : "bg-porcelain/10 text-porcelain"
                  }`}>
                    {app.status === "offer" ? "已录取" : app.status === "interview" ? "面试中" : "已提交"}
                  </span>
                </div>
                
                {/* 进度条 */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-ink-light">进度 {app.progress}%</span>
                    <span className="text-ink-light">{app.tasks.filter(t => t.status === "completed").length}/{app.tasks.length} 任务</span>
                  </div>
                  <div className="h-2 bg-porcelain-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        app.status === "offer" ? "bg-porcelain-success" : "bg-porcelain"
                      }`}
                      style={{ width: `${app.progress}%` }}
                    />
                  </div>
                </div>
                
                {/* 待办任务 */}
                {app.tasks.some(t => t.status !== "completed") && (
                  <div className="mt-6 space-y-3">
                    {app.tasks.filter(t => t.status !== "completed").slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === "high" ? "bg-porcelain-danger" : "bg-ink-light"
                        }`} />
                        <span className="flex-1 text-sm text-ink-gray">{task.title}</span>
                        <span className="text-xs text-ink-light">{task.deadline}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 作品集 Tab */}
        {activeTab === "portfolio" && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-porcelain-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-ink-black">暂无作品</h3>
            <p className="text-ink-gray mt-2">上传你的作品，展示你的才华</p>
            <button className="mt-6 px-8 py-3 bg-porcelain text-white rounded-xl font-medium hover:bg-porcelain-light transition-colors">
              上传作品
            </button>
          </div>
        )}

        {/* 收藏 Tab */}
        {activeTab === "collections" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "school", title: "收藏的院校", count: 5, bgClass: "bg-porcelain/10", textClass: "text-porcelain" },
              { icon: "article", title: "收藏的文章", count: 12, bgClass: "bg-porcelain-dark/10", textClass: "text-porcelain-dark" },
              { icon: "work", title: "收藏的作品集", count: 8, bgClass: "bg-porcelain-light/10", textClass: "text-porcelain-light" },
              { icon: "palette", title: "收藏的艺术品", count: 3, bgClass: "bg-porcelain-pale/10", textClass: "text-porcelain-deep" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl shadow-porcelain p-5 flex items-center justify-between hover-lift cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${item.bgClass} flex items-center justify-center`}>
                    <svg className={`w-6 h-6 ${item.textClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon === "school" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />}
                      {item.icon === "article" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                      {item.icon === "work" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                      {item.icon === "palette" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />}
                    </svg>
                  </div>
                  <span className="font-medium text-ink-black">{item.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-porcelain">{item.count}</span>
                  <svg className="w-5 h-5 text-ink-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

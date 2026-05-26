// @ts-nocheck
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Zap, Mail, ChevronRight, MessageCircle, Star, Crown, Lock, Bell, Search, Filter, Hash, MoreHorizontal, User, Play, Heart, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SectionDetailProps {
  type: 'fans' | 'selection' | 'paid' | 'followers' | 'following' | 'vindex' | 'stats' | 'video' | 'supertopic' | 'album' | 'feed' | 'weibo';
  onClose: () => void;
}

// --- Followers / Following Detail ---
export const UserListDetail = ({ title, isInline }: { title: string, isInline?: boolean }) => (
  <div className={cn("flex flex-col bg-white", !isInline && "h-full")}>
    <div className="bg-white p-6 md:p-10 border-b border-silver/10 flex items-center justify-between sticky top-0 z-10">
      <div className="space-y-1">
        <h2 className="text-xl md:text-3xl font-serif font-black italic text-ink">{title}</h2>
        <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Community Network</p>
      </div>
    </div>
    <div className={cn("flex-1 p-6 md:p-10", !isInline && "overflow-y-auto no-scrollbar")}>
      <div className="max-w-2xl mx-auto space-y-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-porcelain shrink-0 overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i + (title === '关注' ? 10 : 0)}`} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm md:text-base font-bold text-ink italic">User_{i} Artifact</h4>
                <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Artist • Curator</p>
              </div>
            </div>
            <button className="px-6 py-2 bg-porcelain hover:bg-ink hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">
              {title === '关注' ? '已关注' : '关注'}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Fans Group Detail ---
export const FansGroupDetail = () => (
  <div className="flex flex-col h-full bg-porcelain">
    {/* Header */}
    <div className="bg-white p-6 md:p-10 border-b border-silver/10 flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-xl md:text-3xl font-serif font-black italic text-ink">粉丝社群 / Fans Groups</h2>
        <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Active Communities</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-porcelain rounded-full text-[10px] font-bold text-ink/40 uppercase tracking-widest">
           <Users size={14} /> 12.4k Members
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10">
       <div className="max-w-4xl mx-auto space-y-8">
          {[
            { name: 'ArtNews 核心交流1群', members: '498/500', desc: '每日同步全球最前沿艺术资讯与独家点评。', active: true },
            { name: '作品集深度复盘群', members: '240/300', desc: '专注 Top 10 艺术院校作品集修改与策略讨论。', active: false },
            { name: '欧洲艺术留学生活指南', members: '156/200', desc: '柏林、伦敦、巴黎线下聚会与生活避坑建议。', active: true }
          ].map((group, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-silver/10 flex flex-col md:flex-row items-center gap-8 group hover:shadow-xl transition-all"
            >
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-porcelain flex items-center justify-center text-cobalt relative shrink-0">
                  <Users size={32} />
                  {group.active && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white" />}
               </div>
               <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                     <h4 className="text-lg font-bold text-ink italic">{group.name}</h4>
                     <span className="text-[10px] font-mono text-ink/30 uppercase font-black">{group.members}</span>
                  </div>
                  <p className="text-sm text-ink/40 leading-relaxed max-w-xl">{group.desc}</p>
               </div>
               <button className="px-10 h-14 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt transition-all shadow-xl shadow-ink/10">
                  申请加入
               </button>
            </motion.div>
          ))}
       </div>
    </div>
  </div>
);

// --- Selection (Editor's Pick) Detail ---
export const SelectionDetail = () => (
  <div className="flex flex-col h-full bg-white">
     <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar/Filter (Desktop) */}
        <aside className="hidden md:flex w-80 border-r border-silver/10 flex-col p-12 space-y-12">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">Collections</h3>
              <div className="space-y-2">
                 {['全部精选', '深度院校', '作品集指南', '艺术市场趋势', '访谈录'].map((tab, i) => (
                   <button key={i} className={cn(
                     "w-full text-left px-6 py-4 rounded-2xl text-sm font-bold italic transition-all",
                     i === 0 ? "bg-ink text-white shadow-xl shadow-ink/20" : "text-ink/40 hover:bg-porcelain hover:text-ink"
                   )}>
                      {tab}
                   </button>
                 ))}
              </div>
           </div>
           <div className="p-6 bg-porcelain rounded-3xl space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-ink/20 italic">Curated by</p>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-ink" />
                 <div>
                    <h4 className="text-xs font-bold text-ink italic">ArtNews Official</h4>
                    <p className="text-[8px] text-ink/40 font-black uppercase tracking-widest">Verified Editor</p>
                 </div>
              </div>
           </div>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-12 space-y-12">
           <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-serif font-black italic tracking-tighter text-ink leading-none">博主精选 / Selection</h2>
              <p className="text-xs text-cobalt font-black uppercase tracking-[0.4em]">Insights & Strategies</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: '伦艺 CSM 交互设计录取全过程复盘', date: 'APR 24', views: '12K', img: 'https://picsum.photos/seed/art1/600/400' },
                { title: '2026 全球艺术院校申请趋势蓝皮书', date: 'APR 20', views: '45K', img: 'https://picsum.photos/seed/art2/600/400' },
                { title: '如何通过 AI 工具提升作品集的叙事感？', date: 'APR 15', views: '28K', img: 'https://picsum.photos/seed/art3/600/400' },
                { title: '对话纽约当代艺术馆策展人：美学的消解', date: 'APR 02', views: '8K', img: 'https://picsum.photos/seed/art4/600/400' }
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer space-y-6">
                   <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-porcelain border border-silver/10 transition-all duration-700 group-hover:rotate-1 group-hover:scale-[1.02]">
                      <img src={item.img} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div className="px-2 space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-mono font-bold text-ink/20">{item.date} • {item.views} VIEWS</span>
                         <Star size={14} className="text-ink/10 group-hover:text-cobalt transition-colors" />
                      </div>
                      <h4 className="text-xl md:text-2xl font-serif font-bold italic text-ink leading-tight group-hover:text-cobalt transition-colors">{item.title}</h4>
                   </div>
                </div>
              ))}
           </div>
        </div>
     </div>
  </div>
);

// --- Paid Column Detail ---
export const PaidColumnDetail = () => (
  <div className="flex flex-col h-full bg-ink text-white">
     <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] flex flex-col justify-end p-8 md:p-20 overflow-hidden">
           <div className="absolute inset-0 opacity-20 pointer-events-none">
              <img src="https://picsum.photos/seed/paidhero/1200/800" className="w-full h-full object-cover" alt="" />
           </div>
           <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
           
           <div className="relative z-10 space-y-6 max-w-4xl">
              <div className="flex items-center gap-3">
                 <div className="px-4 py-2 bg-cobalt rounded-full text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                    <Crown size={12} fill="white" /> VVIP EXCLUSIVE
                 </div>
                 <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">44 Subscribers</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-serif font-black italic tracking-tighter text-white leading-[0.9]">付费专栏 / <br/>The Intelligence</h2>
              <p className="text-lg md:text-2xl font-light text-white/50 leading-relaxed max-w-2xl italic">
                 “这里不只有资讯，还有那些无法在公开场合谈论的艺术申请潜规则。”
              </p>
           </div>
        </div>

        {/* Column List */}
        <div className="p-8 md:p-20 space-y-16">
           <div className="grid md:grid-cols-2 gap-12">
              {[
                { title: '顶级院校教授私下访谈录：他们到底想要什么样的学生？', price: '¥199', desc: '包含 5 段独家录音整理与核心需求点提炼。' },
                { title: '2026 作品集申请全策略：从定题到交付的 48 个关键点', price: '¥299', desc: '保姆级全流程操作手册，助你规避 90% 的低级错误。' }
              ].map((column, i) => (
                <div key={i} className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-8 flex flex-col justify-between hover:bg-white/10 transition-all">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <Lock size={20} className="text-cobalt" />
                         <span className="text-2xl font-serif font-bold italic text-white">{column.price}</span>
                      </div>
                      <h4 className="text-2xl font-serif font-bold italic text-white leading-tight">{column.title}</h4>
                      <p className="text-sm text-white/40 leading-relaxed font-light">{column.desc}</p>
                   </div>
                   <button className="w-full h-16 bg-white text-ink rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all shadow-2xl">
                      立即订阅专栏
                   </button>
                </div>
              ))}
           </div>

           {/* Newsletter */}
           <div className="bg-white/5 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cobalt blur-[150px] rounded-full" />
              </div>
              <div className="relative z-10 max-w-xl mx-auto space-y-6">
                 <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-cobalt mx-auto">
                    <Mail size={32} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-3xl font-serif font-black italic">订阅特权更新</h3>
                    <p className="text-sm text-white/40 font-medium">获取每一期情报更新的即时通知</p>
                 </div>
                 <div className="flex flex-col md:flex-row gap-4">
                    <input className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cobalt/20" placeholder="Enter your email..." />
                    <button className="h-16 px-10 bg-cobalt text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-cobalt/20">Notify Me</button>
                 </div>
              </div>
           </div>
        </div>
     </div>
  </div>
);

// --- V-Index Detail ---
export const VIndexDetail = () => (
  <div className="flex flex-col h-full bg-white">
    <div className="bg-white p-8 md:p-12 border-b border-silver/10 flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl md:text-4xl font-serif font-black italic text-ink">V指数 / Influence</h2>
        <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Artist Impact Score</p>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-12 space-y-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="bg-porcelain rounded-[3rem] p-12 text-center space-y-6">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt italic">Current Rating</span>
           <div className="text-8xl md:text-[10rem] font-serif font-black italic text-ink tracking-tighter leading-none">60.36</div>
           <p className="text-sm font-bold text-ink/40">排名超过 92% 的艺术类创作者</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[
             { label: '活跃度', value: '88.5', color: 'text-cobalt' },
             { label: '互动率', value: '72.1', color: 'text-orange-500' },
             { label: '传播力', value: '94.2', color: 'text-blue-500' },
             { label: '作品质量', value: '98.0', color: 'text-green-500' }
           ].map((stat, i) => (
             <div key={i} className="p-8 bg-white border border-silver/20 rounded-3xl flex items-center justify-between">
                <span className="text-sm font-bold text-ink italic">{stat.label}</span>
                <span className={cn("text-2xl font-serif font-black italic", stat.color)}>{stat.value}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Stats Detail ---
export const StatsDetail = () => (
  <div className="flex flex-col h-full bg-ink text-white">
     <div className="p-8 md:p-12 border-b border-white/10 flex items-center justify-between">
        <div className="space-y-1">
           <h2 className="text-2xl md:text-4xl font-serif font-black italic">数据中心 / Analytics</h2>
           <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Real-time Performance</p>
        </div>
     </div>
     <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-12 space-y-12">
        <div className="max-w-4xl mx-auto space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: '昨日阅读', value: '1.2W+', change: '+12%', color: 'bg-white/5' },
                { label: '互动总数', value: '37', change: '-2%', color: 'bg-white/10' },
                { label: '新增关注', value: '24', change: '+105%', color: 'bg-cobalt' }
              ].map((s, i) => (
                <div key={i} className={cn("p-8 rounded-[2.5rem] border border-white/10 space-y-4", s.color)}>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{s.label}</p>
                   <div className="text-3xl md:text-4xl font-serif font-black italic">{s.value}</div>
                   <span className="text-[10px] font-bold text-white/60">{s.change} From last week</span>
                </div>
              ))}
           </div>
           
           <div className="h-[1px] bg-white/10" />

           <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 italic">Recent Engagement</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                 {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                   <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="flex-1 bg-white/10 rounded-t-xl group relative cursor-pointer hover:bg-cobalt transition-all"
                   >
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-ink px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {Math.floor(h * 150)} Reads
                     </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
     </div>
  </div>
);

// --- Video Detail ---
export const VideoDetail = ({ isInline }: { isInline?: boolean }) => (
  <div className={cn("flex flex-col bg-[#f2f2f2]", !isInline && "h-full")}>
    {/* Sub-tabs inspired by the screenshot */}
    <div className="bg-white px-4 py-3 flex gap-4 overflow-x-auto no-scrollbar border-b border-[#f2f2f2]">
       {[
         { icon: <Star size={14} />, label: '精选' },
         { label: '近期热门' },
         { label: '实战好招' },
         { label: '关键词' },
         { label: '精彩集锦' }
       ].map((tab, i) => (
         <button key={i} className={cn(
           "px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors",
           i === 0 ? "bg-[#f2f2f2] text-[#333]" : "bg-white text-[#666] border border-gray-100"
         )}>
           {tab.icon}
           {tab.label}
         </button>
       ))}
    </div>

    <div className={cn("flex-1 p-3", !isInline && "overflow-y-auto no-scrollbar")}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[
          { title: '#掘金2比3森林狼# 【@明尼苏达森林狼 113-125@丹...', plays: '5469', duration: '04:25', time: '32分钟前', likes: 9 },
          { title: '#NBA季后赛# 【季后赛经典时刻：吉诺比利三分绝...', plays: '1.8万', duration: '00:19', time: '2小时前', likes: 24 },
          { title: '雷霆4比0横扫太阳 【SGA系列赛末节不仅投...', plays: '6.8万', duration: '00:26', time: '2小时前', likes: 73 },
          { title: '活塞vs魔术', plays: '1万', duration: '04:14', time: '2小时前', likes: 10 },
          { title: '精彩瞬间回顾', plays: '2.4万', duration: '01:01', time: '3小时前', likes: 15 },
          { title: '明日预告', plays: '8900', duration: '02:04', time: '5小时前', likes: 5 }
        ].map((v, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[4/5] md:aspect-video bg-gray-200">
               <img src={`https://picsum.photos/seed/vid${i}/400/500`} className="w-full h-full object-cover" alt="" />
               <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white font-bold bg-black/20 px-1 rounded backdrop-blur-sm">
                  <Play size={10} fill="white" />
                  {v.plays}
               </div>
               <div className="absolute bottom-2 right-2 text-[10px] text-white font-bold bg-black/20 px-1 rounded backdrop-blur-sm">
                  {v.duration}
               </div>
            </div>
            <div className="p-2 space-y-2 flex-1 flex flex-col justify-between">
               <h4 className="text-[13px] font-bold text-[#333] line-clamp-2 leading-tight">{v.title}</h4>
               <div className="flex items-center justify-between text-[10px] text-[#939393]">
                  <span>{v.time}</span>
                  <div className="flex items-center gap-1"><Heart size={10} /> {v.likes}</div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// --- SuperTopic Detail ---
export const SuperTopicDetail = ({ isInline }: { isInline?: boolean }) => (
  <div className={cn("flex flex-col bg-[#f2f2f2]", !isInline && "h-full")}>
    {/* SuperTopic Header - Mobile Style */}
    <div className="bg-white p-4 space-y-4 border-b border-[#f2f2f2]">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <Hash size={24} />
             </div>
             <div>
                <h2 className="text-base font-bold text-[#333] flex items-center gap-1">NBA <img src="https://cdn-icons-png.flaticon.com/512/2111/2111710.png" className="w-3.5 h-3.5" alt="" /></h2>
                <div className="text-[11px] text-[#939393] flex items-center gap-2">
                   <span>今日新增 1190</span>
                   <span>今日互动 1.8万</span>
                </div>
                <div className="text-[11px] text-[#939393] flex items-center gap-2 mt-0.5">
                   <span className="text-orange-500">NBA超话No.1</span>
                   <span>热门No.46</span>
                </div>
             </div>
          </div>
          <button className="px-4 py-1.5 bg-orange-50 border border-orange-200 text-orange-500 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
             <Star size={12} fill="currentColor" /> 签到
          </button>
       </div>
       
       <button className="w-full py-2 bg-gray-50 rounded-lg text-xs font-bold text-[#666] flex items-center justify-center gap-1 italic">
          进入超话，发帖支持TA &gt;
       </button>
    </div>

    {/* Section Title */}
    <div className="bg-white px-4 py-3 flex items-center justify-between mt-2 border-b border-[#f2f2f2]">
       <h3 className="text-sm font-bold text-[#333]">精华帖</h3>
       <span className="text-xs text-[#939393]">更多 &gt;</span>
    </div>
    
    <div className={cn("flex-1", !isInline && "overflow-y-auto no-scrollbar")}>
       <div className="space-y-2 pb-20">
          {[1, 2].map((_, i) => (
            <div key={i} className="bg-white p-4 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                        <img src="https://i.pravatar.cc/100?u=nba" className="w-full h-full object-cover" alt="" />
                     </div>
                     <div>
                        <div className="flex items-center gap-1">
                           <span className="text-[13px] font-bold text-[#333]">NBA</span>
                           <span className="text-orange-500 font-black italic text-[10px]">V</span>
                        </div>
                        <p className="text-[10px] text-[#939393]">4-16 来自微博网页版</p>
                     </div>
                  </div>
               </div>
               
               <p className="text-[14px] text-[#333] leading-relaxed">
                  【76人晋级】费城 76 人今日在附加赛中战胜魔术，正式以 7 号种子的身份晋级东部季后赛，他们将会首轮面对凯尔特人，祝他们好运！#76人首轮碰凯尔特人##NBA季后赛##NBA超话#
               </p>

               <div className="rounded-xl overflow-hidden border border-[#f2f2f2] bg-gray-50">
                  <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200" className="w-full max-h-[300px] object-cover" alt="" />
               </div>

               <div className="flex items-center justify-between pt-3 text-[#939393]">
                  <button className="flex items-center gap-1.5"><Share2 size={16} /> <span className="text-xs">转发</span></button>
                  <button className="flex items-center gap-1.5"><MessageCircle size={16} /> <span className="text-xs">456</span></button>
                  <button className="flex items-center gap-1.5"><Heart size={16} /> <span className="text-xs">1.2万</span></button>
               </div>
            </div>
          ))}
       </div>
    </div>
  </div>
);

// --- Album Detail ---
export const AlbumDetail = ({ isInline }: { isInline?: boolean }) => (
  <div className={cn("flex flex-col bg-white", !isInline && "h-full")}>
     {/* Category Scroll inspired by screenshot */}
     <div className="bg-white p-4 flex gap-6 overflow-x-auto no-scrollbar border-b border-[#f2f2f2] px-6">
        {[
          { label: '赞过', icon: '👍', color: 'bg-red-50' },
          { label: '地点', icon: '📍', color: 'bg-blue-50' },
          { label: '头像', icon: '👤', color: 'bg-orange-50' },
          { label: '面孔', icon: '😊', color: 'bg-green-50' },
          { label: '视频', icon: '📹', color: 'bg-purple-50' }
        ].map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
             <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-105", c.color)}>
                {c.icon}
             </div>
             <span className="text-[12px] font-bold text-[#333]">{c.label}</span>
          </div>
        ))}
     </div>

     <div className={cn("flex-1", !isInline && "overflow-y-auto no-scrollbar")}>
        <div className="p-1 space-y-8">
           <div className="space-y-4">
              <div className="px-5 pt-6 flex items-baseline gap-1">
                 <span className="text-2xl font-bold text-[#333]">04</span>
                 <span className="text-xs text-[#939393] font-bold">月</span>
              </div>
              <div className="grid grid-cols-3 gap-0.5">
                 {[...Array(12)].map((_, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: i * 0.02 }}
                     className="aspect-square bg-gray-100 relative group overflow-hidden"
                   >
                     <img 
                       src={`https://picsum.photos/seed/alb04${i}/500/500`} 
                       className="w-full h-full object-cover" 
                       alt="" 
                     />
                     <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </motion.div>
                 ))}
              </div>
           </div>

           <div className="space-y-4 pb-20">
              <div className="px-5 flex items-baseline gap-1">
                 <span className="text-2xl font-bold text-[#333]">03</span>
                 <span className="text-xs text-[#939393] font-bold">月</span>
              </div>
              <div className="grid grid-cols-3 gap-0.5">
                 {[...Array(9)].map((_, i) => (
                   <motion.div 
                     key={i}
                     className="aspect-square bg-gray-100 overflow-hidden"
                   >
                     <img src={`https://picsum.photos/seed/alb03${i}/500/500`} className="w-full h-full object-cover" alt="" />
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
     </div>
  </div>
);

// --- Feed/Weibo Summary Detail ---
export const FeedDetail = ({ title, isInline }: { title: string, isInline?: boolean }) => (
  <div className={cn("flex flex-col bg-white", !isInline && "h-full")}>
     <div className="bg-white p-8 md:p-12 border-b border-silver/10">
        <div className="space-y-1">
           <h2 className="text-2xl md:text-4xl font-serif font-black italic text-ink">{title} / Archives</h2>
           <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Detailed History</p>
        </div>
     </div>
     <div className={cn("flex-1 p-8 md:p-12", !isInline && "overflow-y-auto no-scrollbar")}>
        <div className="max-w-3xl mx-auto space-y-16">
           {[
             { date: '2026.04.28', content: '今天在艺术中心参观了最新的数字化展览，深感感官边界的模糊。', images: 3 },
             { date: '2026.04.25', content: '新一期的付费专栏已经更新，欢迎大家阅读。', images: 1 },
             { date: '2026.04.20', content: '关于作品集叙事感的讨论，我想补充几点...', images: 0 }
           ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="relative pl-12 border-l border-silver/20 space-y-4"
             >
                <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-cobalt ring-8 ring-cobalt/10" />
                <span className="text-[10px] font-mono font-bold text-cobalt tracking-widest uppercase">{item.date}</span>
                <h4 className="text-xl md:text-2xl font-serif font-bold italic text-ink leading-relaxed">{item.content}</h4>
                {item.images > 0 && (
                   <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                      {[...Array(item.images)].map((_, j) => (
                         <div key={j} className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-porcelain shrink-0 overflow-hidden border border-silver/10 shadow-sm">
                            <img src={`https://picsum.photos/seed/post${i}${j}/400/400`} className="w-full h-full object-cover opacity-80" alt="" />
                         </div>
                      ))}
                   </div>
                )}
             </motion.div>
           ))}
        </div>
     </div>
  </div>
);

// --- Main Container ---
export const UserProfileSectionDetail = ({ type, onClose }: SectionDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-8"
    >
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="relative w-full h-full max-h-screen md:max-h-[90vh] md:max-w-[1200px] bg-white md:rounded-[4rem] overflow-hidden shadow-4xl"
      >
        {/* Shared Mobile Header */}
        <div className="md:hidden absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 z-50 bg-white/80 backdrop-blur-md border-b border-silver/10">
           <button onClick={onClose} className="p-2 -ml-2 text-ink/40">
              <X size={24} />
           </button>
           <span className="text-[10px] font-black uppercase tracking-widest">Detail View</span>
           <div className="w-10 h-10" />
        </div>

        {/* Shared Desktop Close */}
        <button 
          onClick={onClose}
          className="hidden md:flex absolute top-12 right-12 z-50 w-20 h-20 bg-white/80 backdrop-blur-md rounded-full shadow-2xl items-center justify-center text-ink hover:bg-ink hover:text-white transition-all border border-silver/10 outline-none"
        >
          <X size={24} />
        </button>

        <div className="h-full pt-16 md:pt-0">
           {type === 'fans' && <FansGroupDetail />}
           {type === 'selection' && <SelectionDetail />}
           {type === 'paid' && <PaidColumnDetail />}
           {type === 'followers' && <UserListDetail title="粉丝" />}
           {type === 'following' && <UserListDetail title="关注" />}
           {type === 'vindex' && <VIndexDetail />}
           {type === 'stats' && <StatsDetail />}
           {type === 'video' && <VideoDetail />}
           {type === 'supertopic' && <SuperTopicDetail />}
           {type === 'album' && <AlbumDetail />}
           {type === 'feed' && <FeedDetail title="动态" />}
           {type === 'weibo' && <FeedDetail title="微博" />}
        </div>
      </motion.div>
    </motion.div>
  );
};

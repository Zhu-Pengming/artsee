import React from 'react';
import { ChevronLeft, Share2, Users, MapPin, Globe, Calendar, MessageSquare, ArrowRight, ShieldCheck, Heart, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface CircleDetailViewProps {
  circle: { title: string; count: string };
  onBack: () => void;
  onOpenChat: (id: string, name: string, avatar: string, type: string) => void;
  onEnterRoom?: () => void;
}

export const CircleDetailView = ({ circle, onBack, onOpenChat, onEnterRoom }: CircleDetailViewProps) => {
  return (
    <div className="bg-white min-h-screen selection:bg-cobalt selection:text-white">
      {/* Immersive Header */}
      <header className="fixed top-0 inset-x-0 h-16 lg:h-24 bg-white/60 backdrop-blur-3xl z-[100] border-b border-silver/10 px-4 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="group w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center rounded-2xl hover:bg-porcelain border border-silver/20 transition-all active:scale-95"
          >
            <ChevronLeft size={20} lg:size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-ink/20 italic leading-none mb-1">Circle Detail</h2>
            <p className="text-xs font-black uppercase tracking-widest text-ink/60 truncate max-w-[200px]">{circle.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-6">
          <button className="w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center rounded-2xl hover:bg-porcelain transition-all text-ink/40 hover:text-cobalt">
            <Share2 size={18} lg:size={22} />
          </button>
          <button className="px-6 lg:px-10 h-10 lg:h-14 bg-ink text-white rounded-2xl lg:rounded-[1.25rem] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] hover:bg-cobalt transition-all shadow-xl shadow-ink/10 active:scale-95">
            Apply Access
          </button>
        </div>
      </header>

      {/* Hero Section - Minimalist & Bold */}
      <section className="pt-24 lg:pt-40 px-4 lg:px-12 pb-12 lg:pb-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-end gap-8 lg:gap-16">
          <div className="flex-1 space-y-6 lg:space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-px bg-cobalt" />
              <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.5em] text-cobalt italic">Global Creative Hub</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-8xl font-serif font-black italic leading-[0.9] lg:leading-[0.8] tracking-tighter text-ink"
            >
              {circle.title.split('').map((char, i) => (
                <span key={i} className="inline-block hover:text-cobalt transition-colors duration-500">{char}</span>
              ))}
            </motion.h1>

            <div className="flex flex-wrap items-center gap-4 lg:gap-12 pt-8 lg:pt-12">
               <div className="space-y-1 lg:space-y-2">
                 <p className="text-[10px] lg:text-xs font-black p-1 bg-porcelain rounded uppercase tracking-widest text-ink/20 inline-block">Active Members</p>
                 <p className="text-3xl lg:text-6xl font-serif italic text-ink">{circle.count}<span className="text-cobalt text-xs font-sans tracking-tight ml-2">Verified</span></p>
               </div>
               <div className="space-y-1 lg:space-y-2">
                 <p className="text-[10px] lg:text-xs font-black p-1 bg-porcelain rounded uppercase tracking-widest text-ink/20 inline-block">Visionary Index</p>
                 <p className="text-3xl lg:text-6xl font-serif italic text-cobalt">+5.2%</p>
               </div>
               <div className="hidden lg:block w-px h-16 bg-silver/10" />
               <div className="flex -space-x-3 mt-2">
                 {[1, 2, 3, 4, 5].map(i => (
                   <img key={i} src={`https://i.pravatar.cc/100?u=h${i}`} className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-4 border-white object-cover" alt="" referrerPolicy="no-referrer" />
                 ))}
                 <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-porcelain border-4 border-white flex items-center justify-center text-[10px] font-black italic">+82</div>
               </div>
            </div>
          </div>
          
          <div className="shrink-0 w-full lg:w-[400px] aspect-[6/5] lg:aspect-[4/5] rounded-[3rem] lg:rounded-[5rem] overflow-hidden bg-porcelain border border-silver/10 shadow-2xl relative group">
             <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt="" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-10 flex flex-col justify-end">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-2">Primary Base</span>
                <h4 className="text-2xl font-serif italic text-white flex items-center gap-3">
                  <MapPin size={24} className="text-cobalt" />
                  London / Global
                </h4>
             </div>
          </div>
        </div>
      </section>

      {/* Split Content View */}
      <section className="bg-white px-4 lg:px-12 py-12 lg:py-24 border-t border-silver/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="flex-1 space-y-16 lg:space-y-32">
            {/* Vision Quote */}
            <div className="space-y-8 lg:space-y-12">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-porcelain flex items-center justify-center text-cobalt">
                    <ShieldCheck size={20} />
                 </div>
                 <h3 className="text-xs font-black uppercase tracking-[0.4em] text-ink/20 italic">Curatorial Vision</h3>
               </div>
               <p className="text-2xl lg:text-5xl font-serif italic text-ink leading-[1.2] lg:leading-[1.1] tracking-tight">
                 “本圈子致力于建立一个跨越地理边界的深度学术与实战交流网络。<span className="text-cobalt font-black">我们分享不仅仅是资讯</span>，更鼓励每一位成员投身于高频次的灵感碰撞与协作。”
               </p>
            </div>

            {/* Feed Section - Editorial Grid */}
            <div className="space-y-12">
              <div className="flex items-end justify-between border-b border-silver/10 pb-6 lg:pb-8">
                <div className="space-y-2">
                  <h3 className="text-3xl lg:text-5xl font-serif font-black italic italic leading-none">最近动态</h3>
                  <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.5em] text-ink/20">The Daily Insight Feed</p>
                </div>
                <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] group">
                   Scroll All <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>

              <div className="grid gap-8 lg:gap-16">
                 {[1, 2].map(i => (
                   <div key={i} className="group cursor-pointer">
                      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 group">
                         <div className="shrink-0 w-full lg:w-[480px] aspect-[2/1] lg:aspect-[4/3] rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden bg-porcelain relative shadow-lg">
                            <img src={`https://picsum.photos/seed/n-${i+10}/1000/750`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30">
                              <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Shared Insight</span>
                            </div>
                         </div>
                         <div className="flex-1 py-4 space-y-6 lg:space-y-8 flex flex-col">
                            <div className="space-y-4 flex-1">
                               <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">
                                  <span>Archive {i}</span>
                                  <div className="w-1 h-1 rounded-full bg-silver/30" />
                                  <span>Report</span>
                               </div>
                               <h4 className="text-2xl lg:text-4xl font-serif font-black italic text-ink leading-tight group-hover:text-cobalt transition-colors">关于 2026 年新媒介展陈的灯光控制系统复盘：感官与技术的深层互文。</h4>
                               <p className="text-sm lg:text-lg text-ink/40 leading-relaxed italic font-medium line-clamp-3">
                                 在这半年的实践中，我们尝试了一套全新的 DMX 与 AI 环境感知融合方案，让每一个光束都成为空间的语言。在这里我们将深度拆解光场数据与感官反馈的映射逻辑...
                               </p>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-silver/10">
                               <div className="flex items-center gap-3 lg:gap-4">
                                  <img src={`https://i.pravatar.cc/100?u=p${i}`} className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl object-cover border border-silver/10" alt="" referrerPolicy="no-referrer" />
                                  <div>
                                    <p className="text-xs lg:text-sm font-black italic">Zhang Wei</p>
                                    <p className="text-[9px] lg:text-[10px] uppercase font-black tracking-widest text-ink/20">Creative Lead</p>
                                  </div>
                               </div>
                               <div className="flex gap-4 lg:gap-8">
                                  <button className="flex items-center gap-2 text-ink/20 hover:text-red-500 transition-colors">
                                     <Heart size={20} />
                                     <span className="text-[10px] font-mono mt-1">2.4k</span>
                                  </button>
                                  <button className="flex items-center gap-2 text-ink/20 hover:text-cobalt transition-colors">
                                     <MessageSquare size={20} />
                                     <span className="text-[10px] font-mono mt-1">128</span>
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Right Context Sidebar */}
          <aside className="w-full lg:w-[420px] space-y-12 lg:space-y-16">
            {/* Quick Access Card */}
            <div className="bg-porcelain/50 rounded-[3.5rem] p-8 lg:p-12 space-y-8 lg:space-y-12 border border-silver/5">
               <div className="space-y-2">
                  <h3 className="text-2xl lg:text-4xl font-serif font-black italic">研讨空间</h3>
                  <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.5em] text-ink/20 italic">Live Lab Access</p>
               </div>

               <div className="p-6 bg-white rounded-[2.5rem] border border-silver/10 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic text-ink">Talking Now</span>
                     </div>
                     <span className="text-[10px] font-mono p-1 bg-porcelain rounded text-ink/30 px-3">128 Online</span>
                  </div>
                  
                  <div className="space-y-2">
                     <p className="text-sm font-black leading-snug italic">“2026年度数字沉浸艺术展：物理极限与感官重构的交叉论证”</p>
                     <p className="text-[10px] font-black uppercase text-cobalt tracking-widest">Ongoing Discussion</p>
                  </div>

                  <button 
                    onClick={onEnterRoom}
                    className="w-full py-5 bg-ink text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.6em] hover:bg-cobalt transition-all shadow-2xl active:scale-95 leading-none"
                  >
                    Join The Lab
                  </button>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Language', value: 'CN/EN/FR' },
                    { label: 'Founded', value: 'Oct 2023' },
                    { label: 'Projects', value: '42 Active' },
                    { label: 'Rank', value: 'TOP 1%' }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white/50 backdrop-blur rounded-[2rem] border border-silver/5 space-y-1">
                       <p className="text-[8px] font-black uppercase tracking-widest text-ink/20">{stat.label}</p>
                       <p className="text-md font-serif italic text-ink tracking-tight">{stat.value}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Core Network */}
            <div className="space-y-8">
               <div className="flex items-end justify-between border-b border-silver/10 pb-4">
                  <h3 className="text-xl lg:text-2xl font-serif font-black italic">核心网络</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-ink/20">Network 01</p>
               </div>
               
               <div className="grid grid-cols-2 gap-6 lg:gap-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="group cursor-pointer" onClick={() => onOpenChat(`c-${i}`, 'Core Member', `https://i.pravatar.cc/100?u=c${i}`, '组员')}>
                       <div className="space-y-4">
                          <div className="relative inline-block">
                             <img src={`https://i.pravatar.cc/100?u=cc${i}`} className="w-16 lg:w-20 aspect-square rounded-[1.5rem] lg:rounded-[2rem] object-cover grayscale group-hover:grayscale-0 transition-all border border-silver/10 group-hover:border-cobalt" alt="" referrerPolicy="no-referrer" />
                             <div className="absolute -bottom-1 -right-1 w-6 h-6 lg:w-8 lg:h-8 bg-cobalt rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                <Plus size={12} className="text-white" />
                             </div>
                          </div>
                          <div>
                             <h5 className="text-xs lg:text-sm font-black italic group-hover:text-cobalt transition-colors duration-300">Member {i}</h5>
                             <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-ink/20">Studio Lead</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Global Security Badge Footer Section */}
      <footer className="bg-porcelain py-20 lg:py-32 px-4 lg:px-12 border-t border-silver/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10 lg:space-y-16">
           <div className="w-20 h-20 lg:w-32 lg:h-32 bg-white rounded-[2.5rem] lg:rounded-[4rem] flex items-center justify-center text-cobalt shadow-2xl border border-silver/10 scale-110 lg:scale-100">
              <ShieldCheck size={40} lg:size={64} strokeWidth={1.5} />
           </div>
           <div className="space-y-4 lg:space-y-6">
              <h2 className="text-2xl lg:text-5xl font-serif font-black italic text-ink leading-tight">安全与学术共识协议<br /><span className="text-ink/20">Security & Academic Protocol</span></h2>
              <p className="text-sm lg:text-xl text-ink/40 max-w-2xl font-medium italic opacity-60">
                本研讨空间所有内容受 E2E 加密保护。加入本圈子意味着您同意共同维护一个严谨、开放且尊重的学术交流环境。任何未经授权的分发都将被永久取消访问权限。
              </p>
           </div>
           <button className="flex items-center gap-4 text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] text-cobalt group">
              Read Protocols <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>
      </footer>
    </div>
  );
};

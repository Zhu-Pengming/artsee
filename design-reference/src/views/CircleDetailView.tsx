import React from 'react';
import { ChevronLeft, Share2, Users, MapPin, Globe, Calendar, MessageSquare, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface CircleDetailViewProps {
  circle: { title: string; count: string };
  onBack: () => void;
  onOpenChat: (id: string, name: string, avatar: string, type: string) => void;
}

export const CircleDetailView = ({ circle, onBack, onOpenChat }: CircleDetailViewProps) => {
  return (
    <div className="bg-porcelain min-h-screen pb-32">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-20 bg-white/50 backdrop-blur-3xl border-b border-silver/30 z-50 flex items-center justify-between px-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 p-2 -ml-2 hover:bg-black/5 rounded-full transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-silver/20 group-hover:text-cobalt">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-bold text-ink uppercase tracking-[0.4em] italic">Back to Social</span>
        </button>

        <div className="flex items-center gap-4">
          <button className="p-3 hover:bg-black/5 rounded-full transition-all text-ink/40 hover:text-cobalt">
            <Share2 size={20} />
          </button>
          <button className="px-8 py-3 bg-cobalt text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-ink transition-all shadow-xl shadow-cobalt/20">
            申请加入
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[4rem] overflow-hidden bg-white border border-silver/30 p-12 md:p-24 shadow-2xl flex flex-col md:flex-row items-center gap-16">
            <div className="shrink-0 w-48 h-48 bg-porcelain rounded-[3rem] flex items-center justify-center text-cobalt border border-silver/30 shadow-inner relative overflow-hidden group">
              <Users size={80} strokeWidth={1} className="relative z-10" />
              <div className="absolute inset-0 bg-cobalt opacity-0 group-hover:opacity-5 transition-opacity" />
            </div>
            
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-4">
                <span className="bg-cobalt text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">Official Circle</span>
                <div className="flex items-center gap-2 text-ink/30">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-bold uppercase">Verified Group</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-serif font-light text-ink italic leading-tight">
                {circle.title}
              </h1>
              
              <div className="flex flex-wrap gap-8 items-center pt-8 border-t border-silver/20">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Members</span>
                  <p className="text-2xl font-serif italic">{circle.count}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Weekly Growth</span>
                  <p className="text-2xl font-serif italic text-cobalt">+5.2%</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Activity Level</span>
                  <div className="flex gap-1 h-2 items-end">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={cn("w-2 bg-silver/30 rounded-full", i < 5 ? "bg-cobalt h-full" : "h-2")}></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-8 mt-24 grid lg:grid-cols-12 gap-16">
        {/* Feed & Members */}
        <div className="lg:col-span-8 space-y-24">
          {/* About */}
          <section className="space-y-8">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-cobalt">Circle Vision</h2>
            <p className="text-2xl font-serif italic text-ink/60 leading-relaxed max-w-4xl">
              “本圈子致力于建立一个跨越地理边界的深度学术与实战交流网络。我们不仅分享行业资讯，更鼓励每一位成员投身于高频次的灵感碰撞与跨界协作，共同产出具有国际话语权的研究报告与艺术作品。”
            </p>
          </section>

          {/* Recent Moments */}
          <section className="space-y-12">
            <div className="flex justify-between items-center border-b border-silver/30 pb-6">
              <h3 className="text-sm font-bold text-ink uppercase tracking-widest">圈子动态 (Feed)</h3>
              <button className="text-[10px] font-bold text-cobalt">VIEW ALL</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
               {[1, 2].map(i => (
                 <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden border border-silver/20 shadow-sm group">
                   <div className="aspect-[4/3] relative">
                     <img src={`https://picsum.photos/seed/circle-${i}/600/450`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" referrerPolicy="no-referrer" />
                     <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                       <span className="text-[9px] font-bold text-white uppercase tracking-widest">Shared Project</span>
                     </div>
                   </div>
                   <div className="p-8 space-y-4">
                     <h4 className="text-lg font-serif font-bold italic text-ink">关于 2026 年新媒介展陈的灯光控制系统复盘</h4>
                     <p className="text-xs text-ink/40 leading-relaxed line-clamp-2">在这半年的实践中，我们尝试了一套全新的 DMX 与 AI 环境感知融合方案，效果惊艳...</p>
                     <div className="flex items-center justify-between pt-6 border-t border-silver/10">
                       <div className="flex items-center gap-3">
                         <img src={`https://i.pravatar.cc/100?u=mem${i}`} className="w-6 h-6 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                         <span className="text-[10px] font-bold text-ink/40 italic">Zhang Wei</span>
                       </div>
                       <div className="flex gap-4 text-ink/20">
                          <Heart size={14} />
                          <MessageSquare size={14} />
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Members Highlights */}
          <section className="bg-ink p-12 md:p-20 rounded-[4rem] text-white">
            <div className="mb-12">
              <span className="text-[10px] font-bold text-cobalt uppercase tracking-[0.5em]">Network</span>
              <h3 className="text-4xl font-serif italic mt-4">核心成员 (Core Members)</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center space-y-4 group cursor-pointer" onClick={() => onOpenChat(`circle-m-${i}`, 'Circle Member', `https://i.pravatar.cc/100?u=cm${i}`, '组员')}>
                  <div className="relative inline-block">
                    <img src={`https://i.pravatar.cc/100?u=cm${i}`} className="w-24 h-24 rounded-[2rem] border-2 border-white/10 group-hover:border-cobalt transition-all" alt="" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cobalt rounded-full flex items-center justify-center border-4 border-ink">
                      <MessageSquare size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold group-hover:text-cobalt transition-colors">李艺凡 {i}</h5>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Technical Lead</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <section className="bg-white rounded-[3rem] p-10 border border-silver/30 shadow-xl space-y-10">
            <h3 className="text-sm font-bold text-ink uppercase tracking-widest border-b border-silver/20 pb-4">Circle Info</h3>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <MapPin size={20} className="text-cobalt shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-ink uppercase tracking-widest">Base Location</h5>
                  <p className="text-lg font-serif italic text-ink/60">Global Virtual / London</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Globe size={20} className="text-cobalt shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-ink uppercase tracking-widest">Language</h5>
                  <p className="text-lg font-serif italic text-ink/60">CN / EN / FR</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Calendar size={20} className="text-cobalt shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-ink uppercase tracking-widest">Founded Date</h5>
                  <p className="text-lg font-serif italic text-ink/60">Oct 2023</p>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-silver/20">
              <div className="p-6 bg-porcelain rounded-3xl border border-silver/10 space-y-4">
                <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Last Activity</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-sm font-bold text-ink uppercase italic">Live Discussion Now</p>
                </div>
                <button className="w-full h-16 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt transition-all">
                  进入语音研讨室
                </button>
              </div>
            </div>
          </section>

          <section className="bg-silver/10 p-10 rounded-[3rem] space-y-6">
            <h4 className="text-[10px] font-bold text-ink/40 uppercase tracking-[0.3em]">Join Requirements</h4>
            <p className="text-xs text-ink/60 leading-relaxed font-medium italic">
              - 需提供有效的作品集/研究成果链接<br />
              - 通过内部核心成员的 15 分钟线上面试<br />
              - 承诺每月至少参与一次深度研讨
            </p>
            <button className="text-[10px] font-bold text-cobalt flex items-center gap-2 group">
              READ GUIDELINES <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

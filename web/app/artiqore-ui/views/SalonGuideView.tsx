// @ts-nocheck
'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Sparkles, Target, Zap, ShieldCheck, Star, Users } from 'lucide-react';

interface SalonGuideViewProps {
  onBack: () => void;
}

export const SalonGuideView = ({ onBack }: SalonGuideViewProps) => {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-6 md:px-12 md:py-12 border-b border-silver/10 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-10 h-10 md:w-14 md:h-14 bg-porcelain rounded-2xl flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-serif font-black italic text-ink">沙龙参与指南</h1>
            <p className="text-[10px] md:text-xs text-ink/40 font-black uppercase tracking-[0.4em] mt-1 italic">Salon Participation Protocol</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24 space-y-24">
        {/* Intro */}
        <section className="space-y-8">
           <div className="inline-flex items-center gap-3 px-4 py-2 bg-cobalt/5 rounded-full">
              <Sparkles size={14} className="text-cobalt" />
              <span className="text-[10px] font-black text-cobalt tracking-widest uppercase">Expert Guidance</span>
           </div>
           <h2 className="text-4xl md:text-6xl font-serif font-light leading-tight italic text-ink">
             如何在沙龙活动中<br />
             <span className="text-cobalt">最大化您的艺术价值？</span>
           </h2>
           <p className="text-lg md:text-xl text-ink/40 font-light leading-relaxed max-w-2xl">
             每一次沙龙不仅是一次社交，更是一场关于感官、灵感与商业机遇的精准对齐。
           </p>
        </section>

        {/* Protocol Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {[
            { 
              icon: <Target className="text-cobalt" />, 
              title: "着装规范 (Dress Code)", 
              desc: "建议穿着符合活动主题的“前卫正式”装。我们鼓励通过服装表达您的艺术立场，但请保持质感。" 
            },
            { 
              icon: <Zap className="text-orange-500" />, 
              title: "对话礼仪 (Discourse)", 
              desc: "在深入讨论前，建议先倾听。我们推崇高质量的提问而非漫长的自我陈述。" 
            },
            { 
              icon: <ShieldCheck className="text-emerald-500" />, 
              title: "版权保护 (IP Guard)", 
              desc: "沙龙内的所有草图与构思受版权保护。未经允许，严禁对作品进行拍摄或公开发布。" 
            },
            { 
              icon: <Star className="text-purple-600" />, 
              title: "会员特权 (Privilege)", 
              desc: "Art-Elite 会员拥有与主讲嘉宾进行 10 分钟私密对谈的优先预约权。" 
            },
          ].map((item, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="p-10 bg-porcelain rounded-[3rem] space-y-6 border border-silver/10 hover:border-cobalt/30 transition-all group"
            >
               <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
               </div>
               <h3 className="text-xl font-bold italic text-ink">{item.title}</h3>
               <p className="text-sm text-ink/50 leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Community Call */}
        <section className="bg-ink rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 w-80 h-80 bg-cobalt/20 blur-[100px] rounded-full" />
           <div className="relative z-10 space-y-10">
              <Users size={48} className="mx-auto text-cobalt" />
              <div className="space-y-4">
                 <h2 className="text-3xl md:text-5xl font-serif font-black italic">准备好开启极致体验了吗？</h2>
                 <p className="text-white/40 text-[10px] md:text-sm font-black uppercase tracking-[0.5em]">Join the Elite Resonance</p>
              </div>
              <button onClick={onBack} className="px-12 py-6 bg-white text-ink rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-cobalt hover:text-white transition-all active:scale-95">返回活动首页 (CONFIRM)</button>
           </div>
        </section>
      </main>
      
      <footer className="px-6 py-12 border-t border-silver/10 text-center">
         <p className="text-[10px] text-ink/20 font-black uppercase tracking-[0.5em]">artiqore Intelligence Strategy Report</p>
      </footer>
    </div>
  );
};

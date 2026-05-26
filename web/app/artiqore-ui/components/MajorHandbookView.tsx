// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, GraduationCap, Building2, Briefcase, ChevronRight, Target, Sparkles, Star, Zap, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { MajorSectionDetail } from './MajorSectionDetails';

interface MajorHandbookViewProps {
  isOpen: boolean;
  onClose: () => void;
  majorName: string;
}

export const MajorHandbookView = ({ isOpen, onClose, majorName }: MajorHandbookViewProps) => {
  const [activeDetail, setActiveDetail] = useState<'philosophy' | 'curriculum' | 'career' | null>(null);

  const sections = [
    {
      id: 'philosophy' as const,
      title: "核心理念 / Philosophy",
      icon: <Target size={18} />,
      content: "该专业不仅关注视觉审美的输出，更强调‘设计作为一种社会工具’的职能。通过对未来媒介、生态系统及人类行为的深度解构，培养具备全球视野的战略型创作者。"
    },
    {
      id: 'curriculum' as const,
      title: "课程体系 / Curriculum",
      icon: <GraduationCap size={18} />,
      list: ["设计批评与史论", "动态媒介实验室", "社会创新专题研究", "高级原型开发与交付", "毕业设计：系统化叙事"]
    },
    {
      id: 'career' as const,
      title: "就业方向 / Career Path",
      icon: <Briefcase size={18} />,
      list: ["顶尖互联网公司设计专家", "独立创意机构创始人", "当代艺术家/策展人", "可持续设计战略官"]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col md:flex-row bg-white selection:bg-cobalt selection:text-white overflow-hidden">
      {/* Sidebar - Desktop only / Top Header - Mobile only */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-silver/10 p-6 md:p-10 flex flex-col gap-10 shrink-0 bg-porcelain/30">
        <div className="flex items-center justify-between md:flex-col md:items-start md:gap-8">
           <button 
             onClick={onClose}
             className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white border border-silver/20 flex items-center justify-center text-ink/40 hover:text-ink hover:border-ink transition-all shadow-sm"
           >
             <X size={24} />
           </button>
           
           <div className="space-y-2 md:space-y-4">
              <span className="text-[9px] md:text-[10px] font-black text-cobalt uppercase tracking-[0.4em] italic">Major Handbook</span>
              <h2 className="text-xl md:text-3xl font-serif font-black italic text-ink leading-tight">{majorName}</h2>
           </div>

           <div className="hidden md:flex flex-col gap-4">
              <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest mt-10">录取难度测评</p>
              <div className="flex items-center gap-1">
                 {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} className={cn("fill-cobalt text-cobalt", i > 4 && "opacity-20")} />
                 ))}
                 <span className="text-xs font-serif font-bold italic ml-2">Hard</span>
              </div>
           </div>
        </div>

        <nav className="hidden md:flex flex-col gap-2">
           {sections.map((s, i) => (
             <button 
               key={i} 
               onClick={() => setActiveDetail(s.id)}
               className="flex items-center justify-between p-5 rounded-2xl bg-white border border-silver/10 hover:border-cobalt hover:text-cobalt transition-all group"
             >
                <div className="flex items-center gap-4">
                   <div className="text-ink/20 group-hover:text-cobalt transition-colors">{s.icon}</div>
                   <span className="text-[11px] font-bold uppercase tracking-widest">{s.title.split(' / ')[0]}</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
             </button>
           ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
         <div className="max-w-4xl mx-auto px-6 py-12 md:px-20 md:py-24 space-y-20 md:space-y-32">
            
            {/* Hero Quote */}
            <section className="relative">
               <div className="absolute -top-10 -left-6 md:-top-20 md:-left-12 text-[120px] md:text-[200px] font-serif font-black italic text-ink/[0.03] pointer-events-none select-none">“</div>
               <p className="text-2xl md:text-5xl font-serif font-light italic text-ink leading-[1.4] relative z-10">
                 我们培养的不是<span className="text-cobalt">装饰者</span>，而是未来文明形态的<span className="text-cobalt">重构者</span>。在这里，技术只是媒介，思想才是驱动。
               </p>
            </section>

            {/* Sections */}
            {sections.map((section, idx) => (
               <motion.section 
                 key={idx}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 onClick={() => setActiveDetail(section.id)}
                 className="space-y-8 md:space-y-12 cursor-pointer group"
               >
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-porcelain flex items-center justify-center text-cobalt shadow-sm group-hover:bg-cobalt group-hover:text-white transition-all">
                        {section.icon}
                     </div>
                     <h3 className="text-xl md:text-3xl font-serif font-bold italic text-ink group-hover:text-cobalt transition-colors flex items-center gap-4">
                        {section.title}
                        <ArrowRight size={20} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cobalt" />
                     </h3>
                  </div>

                  {section.content ? (
                    <p className="text-base md:text-2xl text-ink/50 leading-relaxed italic font-light group-hover:text-ink/80 transition-colors">
                       {section.content}
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                       {section.list?.map((item, i) => (
                         <div key={i} className="p-6 md:p-8 bg-porcelain/30 rounded-3xl border border-silver/5 hover:border-cobalt/20 transition-all group-hover:bg-white flex items-start gap-4 shadow-sm group-hover:shadow-xl">
                            <div className="w-2 h-2 rounded-full bg-cobalt/20 mt-2 group-hover:scale-150 transition-all" />
                            <span className="text-sm md:text-lg font-medium text-ink italic leading-tight">{item}</span>
                         </div>
                       ))}
                    </div>
                  )}
               </motion.section>
            ))}

            {/* Application Tips Sticky Box */}
            <section className="bg-ink p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-cobalt/20 blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <Sparkles className="text-cobalt" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">Pro Tips</span>
                  </div>
                  <h4 className="text-2xl md:text-4xl font-serif font-light italic leading-tight">想要获得该专业的青睐？<br />你的作品集需要体现出强烈的<span className="text-cobalt">实验精神</span>。</h4>
                  <div className="flex flex-col md:flex-row gap-6 pt-6">
                     <button className="h-14 md:h-16 px-10 bg-white text-ink rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all shadow-xl">预约作品集解析</button>
                     <button className="h-14 md:h-16 px-10 border border-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">下载完整教学大纲</button>
                  </div>
               </div>
            </section>
         </div>

         {/* Bottom Spacer */}
         <div className="h-32" />
      </main>

      {/* Floating Action Button - Mobile only */}
      <div className="md:hidden fixed bottom-6 inset-x-6 z-[210]">
         <button className="w-full h-16 bg-cobalt text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl flex items-center justify-center gap-4">
            <Zap size={18} /> 获取最新申请模型
         </button>
      </div>

      <AnimatePresence>
        {activeDetail && (
          <MajorSectionDetail 
            type={activeDetail} 
            majorName={majorName}
            onClose={() => setActiveDetail(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};


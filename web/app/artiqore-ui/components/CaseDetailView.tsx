// @ts-nocheck
'use client';

import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, GraduationCap, MapPin, Sparkles, ArrowRight, UserCheck, Quote, Star, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface CaseDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  institutionName: string;
}

export const CaseDetailView = ({ isOpen, onClose, institutionName }: CaseDetailViewProps) => {
  const cases = [
    {
      student: "Aron Z.",
      background: "本科：清华美院 (GPA 3.8)",
      major: "MFA Interaction Design",
      highlight: "将中国传统皮影戏与数字传感结合的交互装置，深刻解析了跨文化叙事价值。",
      portfolio_img: `https://picsum.photos/seed/${institutionName}-1/800/1000`
    },
    {
      student: "Liya Chen",
      background: "本科：伦艺 LCC (First Class)",
      major: "MA Visual Communication",
      highlight: "探索生态危机下的品牌视觉重塑，运用生物材料打印技术展示了设计的多样表达。",
      portfolio_img: `https://picsum.photos/seed/${institutionName}-2/800/1000`
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Header PC / Mobile */}
      <header className="fixed top-0 inset-x-0 h-16 md:h-24 px-6 md:px-12 flex items-center justify-between bg-white/80 backdrop-blur-xl z-50 border-b border-silver/10">
         <div className="flex items-center gap-6">
            <button 
              onClick={onClose}
              className="w-10 h-10 md:w-12 md:h-12 bg-porcelain rounded-full flex items-center justify-center text-ink/40 hover:bg-ink hover:text-white transition-all"
            >
              <X size={20} />
            </button>
            <div className="hidden md:block">
               <h2 className="text-xl font-serif font-black italic text-ink">{institutionName} 录取案例库</h2>
               <p className="text-[10px] text-ink/20 font-black uppercase tracking-widest mt-0.5">Success Case Studies Database</p>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
               <p className="text-[9px] font-black text-ink/20 uppercase tracking-widest">Total Offers</p>
               <p className="text-sm font-serif font-bold italic text-cobalt">1,248 Records Found</p>
            </div>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-cobalt rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Trophy size={20} />
            </div>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pt-20 md:pt-32">
         <div className="max-w-7xl mx-auto px-6 py-10 md:px-12 md:py-20">
            
            {/* Filter tags - PC Desktop only */}
            <div className="hidden md:flex items-center gap-4 mb-20">
               {['全部维度', '作品集优异', '背景逆袭', 'GPA 突出', '艺术探索性'].map((tag, i) => (
                 <button key={i} className={cn(
                   "px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                   i === 0 ? "bg-ink text-white" : "border border-silver/20 text-ink/40 hover:border-ink hover:text-ink"
                 )}>{tag}</button>
               ))}
            </div>

            {/* Cases Grid */}
            <div className="grid lg:grid-cols-2 gap-12 md:gap-24">
               {cases.map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="group space-y-8"
                 >
                    {/* Image Mockup */}
                    <div className="aspect-[4/5] rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-porcelain relative shadow-2xl">
                       <img 
                          src={item.portfolio_img} 
                          alt="Portfolio" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                          referrerPolicy="no-referrer"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-10 flex flex-col justify-end">
                          <p className="text-white text-base md:text-xl font-serif italic italic leading-relaxed">
                            “{item.highlight}”
                          </p>
                       </div>
                       <div className="absolute top-6 right-6 md:top-10 md:right-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-6 rounded-3xl text-white">
                          <ImageIcon size={24} />
                       </div>
                    </div>

                    {/* Metadata */}
                    <div className="px-4 md:px-8 space-y-6">
                       <div className="flex items-center justify-between">
                          <div>
                             <h3 className="text-2xl md:text-4xl font-serif font-black italic text-ink">{item.student}</h3>
                             <p className="text-cobalt text-[10px] md:text-xs font-black uppercase tracking-widest mt-1">Accepted: {item.major}</p>
                          </div>
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-porcelain rounded-full flex items-center justify-center text-ink/20 group-hover:bg-ink group-hover:text-white transition-all">
                             <UserCheck size={24} />
                          </div>
                       </div>
                       
                       <div className="space-y-4 pt-6 border-t border-silver/10">
                          <div className="flex items-center gap-4 text-ink/40">
                             <GraduationCap size={16} />
                             <span className="text-sm font-medium italic">{item.background}</span>
                          </div>
                          <div className="flex items-center gap-4 text-ink/40">
                             <Sparkles size={16} className="text-cobalt/40" />
                             <span className="text-sm font-medium italic">作品集标签：深度叙事, 跨媒介装配, 交互原型</span>
                          </div>
                       </div>

                       <button className="flex items-center gap-3 text-[10px] font-black text-ink uppercase tracking-[0.4em] pt-6 group/btn hover:text-cobalt transition-colors">
                          解锁完整灵感手册 <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                       </button>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* Load More Feature */}
         <div className="max-w-7xl mx-auto px-6 py-20 md:py-40 flex flex-col items-center gap-12">
            <div className="h-[1px] w-32 bg-silver/20" />
            <p className="text-xs text-ink/20 font-black uppercase tracking-[0.8em] italic">Articqore Exclusive Archive</p>
            <button className="w-full max-w-sm h-16 md:h-20 bg-porcelain border border-silver/10 rounded-2xl md:rounded-3xl text-[10px] font-bold text-ink uppercase tracking-widest hover:bg-ink hover:text-white transition-all">加载更多案例 (Next 24)</button>
         </div>
      </main>
    </div>
  );
};

// @ts-nocheck
'use client';

import React from 'react';
import { ChevronLeft, Share2, Heart, MessageSquare, ArrowRight, TrendingUp, Users, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TopicDetailViewProps {
  topic: { title: string; count: string; color: string; text: string };
  onBack: () => void;
  onTrendClick?: (trend: string) => void;
  onPostClick?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
}

export const TopicDetailView = ({ topic, onBack, onTrendClick, onPostClick, onUserClick }: TopicDetailViewProps) => {
  const [likedPosts, setLikedPosts] = React.useState<Record<number, boolean>>({});

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-porcelain min-h-screen pb-32 selection:bg-cobalt antialiased">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 h-16 md:h-20 bg-white/50 backdrop-blur-3xl border-b border-silver/30 z-50 flex items-center justify-between px-4 md:px-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 md:gap-3 p-1 md:p-2 -ml-1 md:-ml-2 hover:bg-black/5 rounded-full transition-all active:scale-95"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-silver/20 group-hover:text-cobalt">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-ink uppercase tracking-[0.4em] italic">Back to Social</span>
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 md:p-3 hover:bg-black/5 rounded-full transition-all text-ink/40 hover:text-cobalt active:scale-90">
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className={cn("pt-32 pb-24 px-8 border-b border-silver/20", topic.color)}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                 <Hash size={24} className={topic.text} />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Premium Topic Community</span>
            </div>
            <h1 className={cn("text-3xl md:text-5xl font-serif font-bold italic leading-tight", topic.text)}>
              {topic.title}
            </h1>
            <p className="text-xl text-ink/50 max-w-2xl font-light leading-relaxed">
              在这里，汇聚了全球数千名在该领域的顶尖创作者。我们讨论前沿技术、分享实战经验，并共同探索艺术与商业的下一种形态。
            </p>
          </motion.div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-3xl font-serif italic text-ink">{topic.count.split(' ')[0]}</span>
            <span className="text-[10px] font-bold text-ink/20 uppercase tracking-[0.5em]">{topic.count.split(' ')[1]} Global Contributors</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-8 mt-24">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between border-b border-silver/30 pb-6">
              <h3 className="text-sm font-bold text-ink uppercase tracking-widest">精选深度讨论 (Curated)</h3>
              <div className="flex gap-4">
                <button className="text-[10px] font-bold text-cobalt bg-cobalt/5 px-4 py-2 rounded-full">HOT</button>
                <button className="text-[10px] font-bold text-ink/30 px-4 py-2">NEW</button>
              </div>
            </div>

            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  onClick={() => onPostClick?.(String(i))}
                  className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-silver/30 group hover:border-cobalt transition-all cursor-pointer shadow-sm hover:shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      onClick={(e) => { e.stopPropagation(); onUserClick?.(String(i)); }}
                      className="relative shrink-0 active:scale-95 transition-transform"
                    >
                      <img src={`https://i.pravatar.cc/100?u=topic${i}`} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-silver/20 object-cover" alt="" referrerPolicy="no-referrer" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-orange-400 rounded-full border-2 border-white flex items-center justify-center text-[7px] md:text-[8px] text-white italic font-black shadow-sm">V</div>
                    </div>
                    <div>
                      <h5 className="text-[13px] md:text-sm font-black text-ink hover:text-cobalt transition-colors" onClick={(e) => { e.stopPropagation(); onUserClick?.(String(i)); }}>@Creator_X{i}</h5>
                      <p className="text-[8px] md:text-[9px] text-ink/30 uppercase tracking-widest font-black">Featured Researcher</p>
                    </div>
                  </div>
                  
                  <h4 className="text-xl md:text-3xl font-serif font-black text-ink mb-6 italic leading-[1.1] group-hover:text-cobalt transition-all">
                    关于“{topic.title}”在 2026 年的结构性变迁：从感知交互到生态共生的深度思考。
                  </h4>
                  
                  <p className="text-sm md:text-lg text-ink/40 leading-relaxed font-light mb-8 line-clamp-3 italic">
                    在这篇长文中，我试图拆解当前市场对于“{topic.title}”的过度简化理解。我们不能仅仅停留在视觉层面的优化，而应该深入到底层逻辑的重构。尤其是在跨媒介叙事的语境下，每一个细小的交互节点都承载着品牌叙事的核心价值...
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-silver/10">
                    <div className="flex gap-4 md:gap-8">
                      <button 
                        onClick={(e) => toggleLike(e, i)}
                        className={cn("flex items-center gap-2 transition-all active:scale-90", likedPosts[i] ? "text-red-500" : "text-ink/30 hover:text-red-500")}
                      >
                        <Heart size={16} fill={likedPosts[i] ? "currentColor" : "none"} className={likedPosts[i] ? "animate-pulse" : ""} />
                        <span className="text-[10px] md:text-xs font-black">{1200 + (likedPosts[i] ? 1 : 0)}</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onPostClick?.(String(i)); }}
                        className="flex items-center gap-2 text-ink/30 hover:text-cobalt transition-all active:scale-90"
                      >
                        <MessageSquare size={16} />
                        <span className="text-[10px] md:text-xs font-black">450</span>
                      </button>
                    </div>
                    
                    <button className="text-[10px] md:text-xs font-black text-cobalt uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-2 transition-all">
                      Read Full Article <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
             <div className="bg-ink p-10 rounded-[3rem] text-white space-y-10 shadow-2xl hfr-layer relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cobalt blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
               
               <TrendingUp className="text-cobalt relative z-10" size={32} />
               <h3 className="text-2xl md:text-3xl font-serif font-black italic text-white leading-tight relative z-10">
                 本周趋势<br />
                 <span className="text-white/20">(Weekly Trends)</span>
               </h3>
               
               <div className="space-y-6 relative z-10">
                 {['结构重构', '系统思维', '跨界共生'].map((tag, i) => (
                   <motion.div 
                     key={i} 
                     whileHover={{ x: 8 }}
                     onClick={() => onTrendClick?.(tag)}
                     className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-4 last:border-0"
                   >
                     <span className="text-sm font-light text-white/60 group-hover:text-cobalt transition-colors"># {tag}</span>
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-cobalt tracking-widest">+ 42.5%</span>
                       <ArrowRight size={12} className="text-white/0 group-hover:text-cobalt group-hover:translate-x-1 transition-all" />
                     </div>
                   </motion.div>
                 ))}
               </div>
               
               <button 
                onClick={() => onTrendClick?.('weekly_report')}
                className="w-full py-5 bg-white text-ink rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-cobalt hover:text-white transition-all shadow-xl active:scale-95 relative z-10 hfr-layer"
               >
                 开启相关调研
               </button>
             </div>

             <div className="bg-white p-10 rounded-[3rem] border border-silver/30 space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Active Circles</h4>
                  <Users size={16} className="text-ink/20" />
                </div>
                <div className="space-y-6">
                   {[1, 2].map(i => (
                     <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 bg-silver/10 rounded-2xl flex items-center justify-center text-ink/20 group-hover:bg-cobalt group-hover:text-white transition-all">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink group-hover:text-cobalt transition-colors italic">{topic.title}精英研讨组</p>
                          <p className="text-[9px] text-ink/30 font-bold uppercase tracking-widest">480 Members</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

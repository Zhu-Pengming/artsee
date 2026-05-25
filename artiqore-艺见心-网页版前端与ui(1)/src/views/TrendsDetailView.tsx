import React from 'react';
import { ChevronLeft, Share2, TrendingUp, Zap, Target, BarChart3, ArrowUpRight, Flame, Layers, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TrendsDetailViewProps {
  trend: string;
  onBack: () => void;
}

export const TrendsDetailView = ({ trend, onBack }: TrendsDetailViewProps) => {
  const trendName = trend === 'weekly_report' ? '本周全域艺术趋势' : `# ${trend}`;
  
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-32 overflow-x-hidden selection:bg-cobalt antialiased">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 h-16 md:h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 z-50 flex items-center justify-between px-4 md:px-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 md:gap-3 p-1 md:p-2 -ml-1 md:-ml-2 hover:bg-white/5 rounded-full transition-all active:scale-95"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-silver/20">
            <ChevronLeft size={18} className="text-ink group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic truncate max-w-[120px] md:max-w-none">Art Insight Lab</span>
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 md:p-3 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-cobalt active:scale-90">
            <Share2 size={18} md:size={20} />
          </button>
        </div>
      </header>

      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-cobalt/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 md:pt-48 pb-16 md:pb-32 px-4 md:px-8">
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-full"
              >
                <TrendingUp size={14} className="text-cobalt" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-cobalt">Insight Engine active</span>
              </motion.div>
              
              <div className="space-y-4 md:space-y-8">
                 <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-8xl lg:text-9xl font-serif font-black italic tracking-tighter leading-[0.9] md:leading-[0.85]"
                 >
                   {trendName}
                 </motion.h1>
                 <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg md:text-3xl text-white/40 max-w-4xl font-light italic leading-tight"
                 >
                   基于深度学习的多维艺术数据分析，洞察当前创意场域的结构性动态与未来引力中心。
                 </motion.p>
              </div>

              {/* Stats - Responsive */}
              <div className="grid grid-cols-3 gap-4 md:gap-12 pt-8 md:pt-12 items-end border-t border-white/5">
                 {[
                   { label: '热度指数', val: '98.4', color: 'text-cobalt' },
                   { label: '情绪均值', val: 'Bullish', color: 'text-emerald-400' },
                   { label: '关联度', val: '82%', color: 'text-orange-400' }
                 ].map((stat, i) => (
                   <div key={i} className="space-y-1 md:space-y-2">
                      <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">{stat.label}</p>
                      <p className={cn("text-xl md:text-5xl font-serif italic tracking-widest", stat.color)}>{stat.val}</p>
                   </div>
                 ))}
              </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-20">
          <div className="grid lg:grid-cols-12 gap-12 md:gap-24">
            {/* Analysis Left Column */}
            <div className="lg:col-span-7 space-y-20 md:space-y-32">
              {/* Core Narrative */}
              <section className="space-y-8 md:space-y-16">
                 <div className="flex items-center gap-4 md:gap-6 group">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-ink transition-all">
                      <Zap size={24} md:size={32} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-black italic">核心叙事</h2>
                 </div>
                 
                 <div className="space-y-8 md:space-y-12 text-lg md:text-2xl font-light text-white/60 leading-relaxed italic border-l border-white/5 pl-6 md:pl-10">
                    <p>
                      在当下的艺术生态中，<span className="text-white font-black">{trendName}</span> 正在从边缘的实验性话题演变为核心的创作驱动力。这种转变不仅体现在视觉符号的堆砌上，更深层次地触及了社会、技术、与感官的重新校准。
                    </p>
                    <p className="hidden md:block">
                      根据过去 48 小时内的全球艺术社区数据监测，我们观察到三个主要的引力异常点。不仅是媒介的混合，更是敘事維度的坍缩与重构。
                    </p>
                 </div>

                 {/* Anchor Cards */}
                 <div className="grid md:grid-cols-2 gap-4 md:gap-8">
                    {[
                      { id: '01', title: '跨时空叙事链', desc: '传统的线性叙事正在被“瞬间并发”的非线性结构所取代，创作者更倾向于构建一种自成一体的微型宇宙。' },
                      { id: '02', title: '生成式反馈闭环', desc: 'AI 不再只是工具，而是作为一个共生实体，实时参与到艺术形态的生成与演化中。' }
                    ].map(card => (
                      <div key={card.id} className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 space-y-6 group hover:bg-white/10 transition-all">
                         <span className="text-[10px] font-black text-cobalt uppercase tracking-[0.4em]">Anchor {card.id}</span>
                         <h4 className="text-xl md:text-2xl font-black italic">{card.title}</h4>
                         <p className="text-sm md:text-lg text-white/30 leading-relaxed italic font-light">{card.desc}</p>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Market Resonance */}
              <section className="space-y-12 md:space-y-16">
                 <div className="flex items-center gap-4 md:gap-6 group">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-cobalt group-hover:bg-cobalt group-hover:text-white transition-all">
                      <Target size={24} md:size={32} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-black italic">市场共振系数</h2>
                 </div>

                 <div className="space-y-10 md:space-y-12">
                    {[
                      { label: '商业化潜力', value: 92, desc: '跨国奢侈品牌正密切关注该趋势在下一季视觉方案中的应用。' },
                      { label: '社交媒体扩散力', value: 75, desc: '关键词检索量在过去 72 小时内由于几次重磅开幕而激增。' },
                      { label: '学术讨论密度', value: 88, desc: '多家顶级艺术学院已将其整合入本学年的核心研讨课程。' }
                    ].map((item, i) => (
                      <div key={i} className="space-y-4 md:space-y-6">
                         <div className="flex justify-between items-end">
                            <span className="text-sm md:text-xl font-black italic text-white/70">{item.label}</span>
                            <span className="text-xl md:text-3xl font-serif italic text-white">{item.value}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.value}%` }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              className="h-full bg-cobalt shadow-[0_0_20px_#2563eb]"
                            />
                         </div>
                         <p className="text-xs md:text-sm text-white/20 italic max-w-xl">{item.desc}</p>
                      </div>
                    ))}
                 </div>
              </section>
            </div>

            {/* Sidebar / Experts Column */}
            <div className="lg:col-span-5 space-y-12 md:space-y-16">
               {/* Expert Insights - Cards */}
               <div className="bg-white/5 p-8 md:p-14 rounded-[3rem] md:rounded-[4rem] border border-white/10 space-y-12 hfr-layer lg:sticky lg:top-28">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">专家视点</h3>
                     <BarChart3 size={20} className="text-white/20" />
                  </div>
                  <div className="space-y-12 md:space-y-16">
                     {[1, 2].map(i => (
                       <div key={i} className="space-y-6 group cursor-pointer">
                          <div className="flex items-center gap-4 md:gap-6">
                             <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl overflow-hidden grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all border border-white/10">
                                <img src={`https://i.pravatar.cc/150?u=expert${i}`} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                             </div>
                             <div>
                                <p className="text-base md:text-xl font-black italic leading-none">{i === 1 ? 'Sebastian' : 'Elena'}</p>
                                <p className="text-[8px] md:text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-2">{i === 1 ? 'DIGITAL ARTS @ UdK' : 'CHIEF CURATOR'}</p>
                             </div>
                          </div>
                          <p className="text-sm md:text-lg text-white/40 leading-relaxed italic border-l-2 border-white/5 pl-6 py-1 group-hover:border-cobalt transition-all">
                            “我们不能忽视 <span className="text-white font-bold">{trendName}</span> 中潜在的非人性化倾向，但这正是讨论当代性最有力的切口。”
                          </p>
                       </div>
                     ))}
                  </div>

                  <div className="pt-8 border-t border-white/5">
                     <button className="w-full py-5 md:py-6 bg-white text-ink rounded-2xl md:rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-cobalt hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3">
                        解锁专家深度分析
                        <ArrowUpRight size={16} />
                     </button>
                  </div>
               </div>

               {/* Semantic Map */}
               <div className="px-4 md:px-14 space-y-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 italic">语义关联图谱</h3>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                     {['后人类主义', '算法偏见', '物理反馈', '数字孪生', '赛博朋克', '去中心化', '生态危机', '沉浸式叙事'].map((keyword, i) => (
                       <span key={i} className="px-5 md:px-8 py-3 md:py-4 bg-white/5 border border-white/5 rounded-full text-[10px] md:text-sm font-black text-white/30 hover:text-white hover:bg-cobalt/20 hover:border-cobalt/40 cursor-pointer transition-all">
                         {keyword}
                       </span>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Global Context Footer */}
      <footer className="fixed bottom-6 md:bottom-12 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[600px] flex gap-4 md:gap-12 px-6 md:px-10 py-4 md:py-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-full z-40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] hfr-layer items-center justify-between md:justify-center">
         <div className="flex items-center gap-3 md:gap-4 md:pr-12 md:border-r border-white/10">
            <Globe size={18} className="text-cobalt animate-pulse shrink-0" />
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Global Sync</span>
               <span className="text-sm md:text-xl font-mono font-black text-white tracking-widest leading-none">78.4%</span>
            </div>
         </div>
         <div className="flex items-center gap-3 md:gap-4">
            <Flame size={18} className="text-orange-500 animate-bounce shrink-0" />
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Momentum</span>
               <span className="text-sm md:text-xl font-mono font-black text-white tracking-widest leading-none">RISING</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

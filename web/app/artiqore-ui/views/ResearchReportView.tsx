// @ts-nocheck
'use client';

import React from 'react';
import { ChevronLeft, Share2, TrendingUp, Zap, Target, BarChart3, ArrowUpRight, Flame, Layers, Globe, Shield, Activity, Microscope, PieChart } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ResearchReportViewProps {
  onBack: () => void;
}

export const ResearchReportView = ({ onBack }: ResearchReportViewProps) => {
  return (
    <div className="bg-[#050505] min-h-screen text-white pb-32 overflow-x-hidden selection:bg-cobalt cursor-default antialiased">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 h-16 md:h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 z-50 flex items-center justify-between px-4 md:px-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 md:gap-3 p-1 md:p-2 -ml-1 md:-ml-2 hover:bg-white/5 rounded-full transition-all active:scale-95"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-silver/20">
            <ChevronLeft size={18} className="text-ink group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em] md:tracking-[0.4em] italic truncate max-w-[120px] md:max-w-none">Intelligence Bureau</span>
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 md:p-3 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-cobalt active:scale-90">
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cobalt/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 md:pt-48 pb-16 md:pb-32 px-4 md:px-8">
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2 bg-cobalt/10 border border-cobalt/20 rounded-full"
            >
              <Activity size={14} className="text-cobalt animate-pulse" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-cobalt">Insight stream live</span>
            </motion.div>
            
            <div className="space-y-4 md:space-y-8">
               <motion.div
                 initial={{ opacity: 0, y: 40 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
               >
                 <span className="text-cobalt font-black tracking-[0.4em] md:tracking-[0.6em] uppercase text-[10px] md:text-xs mb-2 md:mb-4 block">Strategic Forecast</span>
                 <h1 className="text-3xl md:text-6xl lg:text-7xl font-serif font-black italic tracking-tighter leading-[0.95] md:leading-[0.9]">
                   本周全域<br />
                   <span className="text-white/20">趋势研报</span>
                 </h1>
               </motion.div>
               <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-3xl text-white/40 max-w-4xl font-light italic leading-tight"
               >
                 跨媒介聚合分析报告：深度解读 42k+ 顶尖艺术家的实时交互热度与审美引力场。
               </motion.p>
            </div>

            {/* Stats Grid - Mobile adapted */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pt-8 md:pt-10 items-center border-t border-white/5">
               {[
                 { label: '覆盖创作者', val: '42.8k', color: 'text-white' },
                 { label: '信噪比指标', val: '0.92', color: 'text-cobalt' },
                 { label: '预测准确率', val: '89.4%', color: 'text-emerald-400' },
                 { label: '数据更新', val: '2m ago', color: 'text-white/40' }
               ].map((stat, i) => (
                 <div key={i} className="space-y-1 p-4 md:p-0 bg-white/5 md:bg-transparent rounded-2xl md:rounded-none">
                    <p className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{stat.label}</p>
                    <p className={cn("text-xl md:text-2xl font-serif italic tracking-widest", stat.color)}>{stat.val}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-20">
          <div className="grid lg:grid-cols-12 gap-12 md:gap-24">
            
            {/* LEFT COLUMN / MOBILE CONTENT */}
            <div className="lg:col-span-8 space-y-20 md:space-y-32">
              
              {/* Desktop Detail Intro */}
              <div className="hidden lg:flex items-center gap-6 group">
                <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-cobalt group-hover:text-white transition-all duration-500">
                  <Microscope size={28} />
                </div>
                <h2 className="text-5xl font-serif font-black italic">趋势场域详解</h2>
              </div>

              {/* Trend Cards - Re-designed for Mobile First but looking Premium on Desktop */}
              <div className="space-y-12 md:space-y-24">
                {[
                  { 
                    id: '01', 
                    title: '结构重构: 物理与虚构的坍缩', 
                    growth: '+42.5%', 
                    desc: '创作者正试图将数字逻辑反向输出到物理场域，形成一种“数字原生、物理介入”的新范式。',
                    longDesc: '这种趋势的核心在于对“物质性”的重新博弈。不再是单纯的 3D 打印或投影，而是通过生物工程、柔性电子元件将数字交互逻辑植入物理媒介本身。',
                    tags: ['数字双生', '物质性介入', '触感反馈'],
                    icon: <Layers size={24} />
                  },
                  { 
                    id: '02', 
                    title: '系统思维: 叙事即算法', 
                    growth: '+38.2%', 
                    desc: '叙事结构正在从线性序列转向网状涌现。作品被视为一个个自运行的系统，产生不可预测的分叉。',
                    longDesc: '当 AI 参与叙事，创作的重点就从“讲什么”变成了“设定什么规则”。每一个观众的每一次视线停留都是对算法参数的一次扰动。',
                    tags: ['涌现叙事', '参数化创作', '非线性交互'],
                    icon: <Activity size={24} />
                  },
                  { 
                    id: '03', 
                    title: '跨界共生: 媒介边界的消亡', 
                    growth: '+27.8%', 
                    desc: '媒介隔阂彻底消失。时尚、建筑、声音与生物艺术正在被同一种底层逻辑整合。',
                    longDesc: '未来的创作者将是“全栈艺术家”。他们操作的不是某种特定的乐器或画笔，而是概念在不同感官维度（嗅觉、听觉、物理触觉）的投影与映射。',
                    tags: ['多维投影', '跨媒介合成', '概念流动'],
                    icon: <Globe size={24} />
                  }
                ].map((item, i) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative"
                  >
                    {/* Visual Connector Desktop */}
                    <div className="hidden md:block absolute -left-12 top-0 bottom-0 w-px bg-white/5 group-hover:bg-cobalt/30 transition-colors" />
                    
                    <div className="space-y-8">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4 md:gap-6">
                            <span className="text-4xl md:text-6xl font-serif font-black italic text-white/5 group-hover:text-cobalt/20 transition-colors">{item.id}</span>
                            <div className="space-y-1">
                               <h3 className="text-xl md:text-4xl font-black italic group-hover:text-cobalt transition-colors">{item.title}</h3>
                               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">{item.growth} MOMENTUM</span>
                            </div>
                          </div>
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-cobalt group-hover:text-white transition-all shadow-xl">
                            {item.icon}
                          </div>
                       </div>
                       
                       <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                          <p className="text-white/40 text-base md:text-xl font-light italic leading-relaxed">
                            {item.desc}
                          </p>
                          <p className="text-white/20 text-sm md:text-lg font-light leading-relaxed hidden md:block">
                            {item.longDesc}
                          </p>
                       </div>

                       <div className="flex flex-wrap gap-2 md:gap-4">
                          {item.tags.map(tag => (
                            <span key={tag} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/30 border border-white/5 px-3 md:px-5 py-2 rounded-full bg-white/5 hover:bg-white hover:text-ink transition-all cursor-pointer">
                              {tag}
                            </span>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Strategy Map - Responsive Card */}
              <section className="bg-white/5 p-8 md:p-20 rounded-[3rem] md:rounded-[5rem] border border-white/10 space-y-12 md:space-y-16 relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 w-80 h-80 bg-cobalt/10 blur-[120px] rounded-full" />
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-cobalt">Strategic Roadmap</h4>
                        <h2 className="text-3xl md:text-6xl font-serif font-black italic">180 天策略图谱</h2>
                     </div>
                     <div className="flex items-center gap-4 text-white/20">
                        <Target size={32} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Future Trajectory</span>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 md:gap-16 pt-8 relative z-10">
                     {[
                       { q: 'Q2', title: '感知拓展期', desc: '重点关注可穿戴设备与传统纺织工艺的数字化融合实验。', color: 'text-cobalt' },
                       { q: 'Q3', title: '算法生态期', desc: '大规模部署生成式辅助设计，建立个人化的数据集与美学秩序。', color: 'text-purple-400' },
                       { q: 'Q4', title: '虚实共振期', desc: '线下沉浸式展览将成为常态，实体作品作为数字资产锚点。', color: 'text-emerald-400' }
                     ].map((item, i) => (
                       <div key={i} className="space-y-4 md:space-y-6">
                         <div className={cn("text-5xl md:text-6xl font-serif font-black italic text-white/5", item.color)}> {item.q} </div>
                         <h5 className="text-xl md:text-2xl font-black italic">{item.title}</h5>
                         <p className="text-sm md:text-lg text-white/30 font-light italic leading-relaxed">{item.desc}</p>
                       </div>
                     ))}
                  </div>
              </section>
            </div>

            {/* RIGHT COLUMN / DESKTOP SIDEBAR - Adapted for Mobile as stacking below */}
            <div className="lg:col-span-4 space-y-8 md:space-y-16">
               
               {/* Data Visualization / Insight Card */}
               <div className="bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] text-ink space-y-12 hfr-layer lg:sticky lg:top-28">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-ink/30">场域引力分布</h3>
                     <BarChart3 size={24} className="text-cobalt" />
                  </div>

                  <div className="space-y-10">
                     {[
                       { label: '数字时尚', weight: 88, color: 'bg-cobalt' },
                       { label: '交互建筑', weight: 72, color: 'bg-ink' },
                       { label: '算法绘画', weight: 65, color: 'bg-cobalt/40' },
                       { label: '声音装置', weight: 45, color: 'bg-ink/20' }
                     ].map(field => (
                       <div key={field.label} className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-sm md:text-lg font-black italic">{field.label}</span>
                            <span className="text-[10px] font-mono font-bold text-ink/40">{field.weight}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-ink/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${field.weight}%` }}
                              transition={{ duration: 1.2, ease: "circOut" }}
                              className={cn("h-full rounded-full", field.color)}
                            />
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="pt-8 border-t border-ink/5">
                     <button className="w-full py-5 md:py-6 bg-ink text-white rounded-2xl md:rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-cobalt transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                        导出完整 PDF 数据集
                        <ArrowUpRight size={16} />
                     </button>
                  </div>
               </div>

               {/* Related Insights - Mobile Carousel style or simple stack */}
               <div className="p-4 md:p-10 space-y-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 italic">Pulse Feed</h3>
                  <div className="space-y-6">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="flex gap-6 items-center group cursor-pointer p-4 hover:bg-white/5 rounded-3xl transition-all">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white group-hover:text-ink transition-all">
                            <Zap size={20} className="text-white/20 group-hover:text-ink" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm md:text-lg font-black italic group-hover:text-cobalt transition-colors">#{i === 1 ? '后传统重构' : i === 2 ? '算法偏见实验' : '物理反馈革命'}</p>
                             <div className="flex items-center gap-3">
                                <span className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">ID-45{i}N</span>
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                <span className="text-[8px] md:text-[10px] text-emerald-400/60 font-black tracking-widest">STABLE</span>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Global Status Footer */}
      <footer className="fixed bottom-6 md:bottom-12 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[600px] flex gap-4 md:gap-12 px-6 md:px-10 py-4 md:py-6 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-full z-40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] hfr-layer items-center justify-between md:justify-center">
         <div className="flex items-center gap-3 md:gap-4 md:pr-12 md:border-r border-white/10">
            <div className="w-8 h-8 rounded-full border-2 border-cobalt border-t-transparent animate-spin flex items-center justify-center shrink-0">
               <div className="w-4 h-4 bg-cobalt rounded-full shadow-[0_0_10px_#2563eb]" />
            </div>
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Global Resonance</span>
               <span className="text-sm md:text-xl font-mono font-black text-white tracking-widest leading-none">92.4%</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <Activity size={18} className="text-emerald-400 animate-pulse shrink-0" />
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Field Stability</span>
               <span className="text-sm md:text-xl font-mono font-black text-emerald-400 tracking-widest leading-none">OPTIMAL</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

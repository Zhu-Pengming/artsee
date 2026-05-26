// @ts-nocheck
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layout, Languages, FileText, UserCheck, ChevronRight, CheckCircle2, Sparkles, BookOpen, MessageSquare, Award, Clock, Globe, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface EnrollmentSectionDetailProps {
  type: 'portfolio' | 'language' | 'statement' | 'interview' | 'templates';
  onClose: () => void;
}

// --- Portfolio Detail ---
const PortfolioDetail = () => (
  <div className="flex flex-col md:flex-row h-full">
    <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden bg-porcelain">
      <div className="absolute inset-x-8 top-12 md:top-24 space-y-4 z-10">
         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">Phase 01</span>
         <h2 className="text-4xl md:text-6xl font-serif font-black italic text-ink">作品集准备</h2>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pt-20">
         <div className="grid grid-cols-2 gap-4 p-8">
            {[1,2,3,4].map(i => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "w-32 h-44 md:w-40 md:h-56 bg-white rounded-2xl shadow-2xl border border-silver/10 overflow-hidden",
                  i % 2 === 0 ? "mt-8" : ""
                )}
              >
                <img src={`https://picsum.photos/seed/port${i}/400/600`} className="w-full h-full object-cover opacity-60" alt="" />
              </motion.div>
            ))}
         </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-porcelain via-transparent to-transparent md:bg-gradient-to-l" />
    </div>
    
    <div className="flex-1 bg-white p-8 md:p-20 overflow-y-auto no-scrollbar space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-4 text-cobalt">
          <div className="w-10 h-[1px] bg-cobalt" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Core Requirements</span>
        </div>
        <p className="text-xl md:text-2xl font-serif font-bold italic text-ink leading-relaxed">
          “作品集不是展示你画得有多好，而是展示你思考得有多深。”
        </p>
        <div className="p-8 bg-porcelain rounded-[2.5rem] space-y-6 border border-silver/10">
           <div className="flex items-start gap-4">
              <CheckCircle2 size={20} className="text-cobalt mt-1" />
              <div className="space-y-1">
                 <h4 className="text-sm font-bold text-ink">15-20件原创作品</h4>
                 <p className="text-xs text-ink/40 font-medium leading-relaxed">包含你最得意的项目，以及 2-3 个正在进行中的实验性草图。</p>
              </div>
           </div>
           <div className="flex items-start gap-4">
              <CheckCircle2 size={20} className="text-cobalt mt-1" />
              <div className="space-y-1">
                 <h4 className="text-sm font-bold text-ink">完整的创作过程</h4>
                 <p className="text-xs text-ink/40 font-medium leading-relaxed">通过 Sketchbook 展示灵感来源、材质研究、模型迭代以及最终产出。</p>
              </div>
           </div>
        </div>
      </section>

      <section className="space-y-6">
         <h3 className="text-[10px] font-black uppercase tracking-widest text-ink/20 italic">Expert Advice</h3>
         <div className="flex gap-4 p-6 bg-ink rounded-3xl text-white">
            <Sparkles size={24} className="text-cobalt shrink-0" />
            <p className="text-xs font-medium leading-loose italic opacity-80">
               评审教授平均只会在你的作品集上停留 3-5 分钟。第一页的视觉张力与最后一页的情绪留白至关重要。
            </p>
         </div>
      </section>

      <button className="w-full h-16 bg-cobalt text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-cobalt/20 hover:bg-ink transition-all">
         获取作品集排版模版 (Download Templates)
      </button>
    </div>
  </div>
);

// --- Language Detail ---
const LanguageDetail = () => (
  <div className="flex flex-col md:flex-row h-full">
    <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden bg-ink flex items-center justify-center p-12">
       <div className="text-center space-y-6 relative z-10">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="w-40 h-40 md:w-64 md:h-64 rounded-full border border-white/10 flex items-center justify-center"
          >
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-cobalt flex items-center justify-center text-white">
                <span className="text-5xl md:text-7xl font-serif font-black italic">6.5+</span>
             </div>
          </motion.div>
          <div className="space-y-1">
             <h2 className="text-3xl font-serif font-black italic text-white uppercase tracking-tighter">语言成绩</h2>
             <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em]">Language Standards</p>
          </div>
       </div>
       <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-4 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
             <span key={i} className="text-2xl font-mono text-white select-none">IELTS TOEFL GRE DET</span>
          ))}
       </div>
    </div>

    <div className="flex-1 bg-white p-8 md:p-20 overflow-y-auto no-scrollbar space-y-12">
       <section className="space-y-8">
          <div className="flex items-center gap-4 text-cobalt">
            <div className="w-10 h-[1px] bg-cobalt" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Score Requirements</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
             <div className="p-8 border border-silver/20 rounded-3xl space-y-4 hover:border-cobalt transition-colors group">
                <div className="flex items-center justify-between">
                   <h4 className="text-xl font-serif font-bold italic text-ink">雅思 (IELTS)</h4>
                   <span className="text-sm font-bold text-cobalt">Min 6.5</span>
                </div>
                <p className="text-xs text-ink/40 leading-relaxed font-medium">单项不低于 6.0，排名靠前院校建议 7.0。</p>
             </div>
             <div className="p-8 border border-silver/20 rounded-3xl space-y-4 hover:border-cobalt transition-colors group">
                <div className="flex items-center justify-between">
                   <h4 className="text-xl font-serif font-bold italic text-ink">托福 (TOEFL)</h4>
                   <span className="text-sm font-bold text-cobalt">Min 90</span>
                </div>
                <p className="text-xs text-ink/40 leading-relaxed font-medium">建议 100+，听力与口语部分权重较高。</p>
             </div>
          </div>
       </section>

       <div className="p-8 bg-porcelain rounded-[2.5rem] flex items-center gap-6">
          <Languages size={32} className="text-ink/10" />
          <div className="space-y-1">
             <h4 className="text-xs font-bold text-ink italic">多邻国 (Duolingo)</h4>
             <p className="text-[10px] text-ink/40 font-bold leading-relaxed">部分院校已接受该成绩替代雅思，分数线通常为 110-125。</p>
          </div>
       </div>

       <button className="w-full h-16 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl hover:bg-cobalt transition-all">
          预约语言实战测评 (Book Exam)
       </button>
    </div>
  </div>
);

// --- Statement Detail ---
const StatementDetail = () => (
  <div className="flex flex-col md:flex-row h-full">
    <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden bg-porcelain p-12 flex flex-col justify-center">
       <div className="max-w-md space-y-8">
          <div className="space-y-2">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">Phase 03</span>
             <h2 className="text-4xl md:text-6xl font-serif font-black italic text-ink">个人陈述</h2>
          </div>
          <div className="space-y-4 opacity-40">
             <div className="h-2 w-3/4 bg-ink/20 rounded-full" />
             <div className="h-2 w-full bg-ink/20 rounded-full" />
             <div className="h-2 w-5/6 bg-ink/20 rounded-full" />
             <div className="h-2 w-2/3 bg-ink/20 rounded-full" />
          </div>
       </div>
       <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent hidden md:block" />
    </div>

    <div className="flex-1 bg-white p-8 md:p-20 overflow-y-auto no-scrollbar space-y-12">
       <section className="space-y-8">
          <div className="flex items-center gap-4 text-cobalt">
            <div className="w-10 h-[1px] bg-cobalt" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Writing Strategy</span>
          </div>
          <p className="text-xl font-serif font-bold italic text-ink leading-relaxed">
             “不仅要说你做了什么，更要说你为什么要这么做。”
          </p>
          <div className="space-y-6">
             {[
               { title: '艺术见解', desc: '你对当代艺术或特定领域的独特理解与批判性思考。' },
               { title: '研究目标', desc: '详细说明你想在研究生阶段攻克的艺术课题或实验方向。' },
               { title: '择校动机', desc: '为什么这所院校、这个专业是你的不二之选？' }
             ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                   <div className="w-10 h-10 rounded-full bg-porcelain flex items-center justify-center text-xs font-mono font-black text-ink/20 group-hover:bg-cobalt group-hover:text-white transition-all">{i+1}</div>
                   <div className="space-y-1 flex-1 pb-6 border-b border-silver/10">
                      <h4 className="text-base font-bold text-ink italic">{item.title}</h4>
                      <p className="text-xs text-ink/40 font-medium leading-relaxed">{item.desc}</p>
                   </div>
                </div>
             ))}
          </div>
       </section>

       <div className="flex items-center gap-4 text-ink/20 pt-8 border-t border-silver/10">
          <BookOpen size={24} />
          <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
             500-800 字精华篇幅<br />逻辑清晰 · 文笔灵动 · 拒绝模板
          </p>
       </div>
    </div>
  </div>
);

// --- Interview Detail ---
const InterviewDetail = () => (
  <div className="flex flex-col h-full bg-porcelain">
     {/* Mobile/Desktop Split View */}
     <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Visual Panel */}
        <div className="w-full md:w-2/5 h-64 md:h-full relative overflow-hidden bg-ink">
           <img src="https://picsum.photos/seed/inter/800/1200" className="w-full h-full object-cover opacity-60" alt="" />
           <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
           <div className="absolute bottom-12 left-12 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">Final Step</span>
              <h2 className="text-3xl md:text-5xl font-serif font-black italic text-white uppercase tracking-tighter">导师面试</h2>
           </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-white p-8 md:p-16 overflow-y-auto no-scrollbar space-y-12">
           <div className="space-y-8">
              <div className="flex items-center gap-4 text-cobalt">
                <div className="w-10 h-[1px] bg-cobalt" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Interview Preparation</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { label: '对话时长', value: '15-30 Min', icon: <Clock /> },
                   { label: '形式', value: 'Video Call / F2F', icon: <Globe /> },
                   { label: '核心诉求', value: '创造性潜力', icon: <Zap /> },
                   { label: '导师关注', value: '逻辑表达能力', icon: <MessageSquare /> }
                 ].map((stat, i) => (
                   <div key={i} className="p-6 bg-porcelain border border-silver/10 rounded-3xl flex items-center gap-4">
                      <div className="text-cobalt">{React.cloneElement(stat.icon as any, { size: 20 })}</div>
                      <div>
                         <p className="text-[9px] font-black text-ink/30 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                         <p className="text-sm font-bold text-ink italic leading-none">{stat.value}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-ink/20 italic">Key Focus Points</h3>
                <div className="space-y-4">
                   {[
                     '项目背后的叙事与逻辑是否一致？',
                     '面对批评时的开放态度与反思能力？',
                     '你对未来三年的艺术实践路径有何构想？',
                     '现场命题小练习的即兴反应。'
                   ].map((point, i) => (
                      <div key={i} className="flex gap-4 items-start pb-4 border-b border-silver/5">
                         <div className="w-1.5 h-1.5 rounded-full bg-cobalt mt-1.5 shrink-0" />
                         <p className="text-sm text-ink/60 font-medium leading-relaxed">{point}</p>
                      </div>
                   ))}
                </div>
              </div>
           </div>

           <button className="w-full h-16 bg-cobalt text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-cobalt/20 hover:bg-ink transition-all">
              预约 1对1 模拟面试 (Book Mock Interview)
           </button>
        </div>
     </div>
  </div>
);

// --- Templates Detail ---
const TemplatesDetail = () => {
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);

  const templates = [
    { 
      name: 'Minimalist Grid', 
      category: 'Graphic / UI', 
      downloads: '1.2k',
      previewImg: 'https://picsum.photos/seed/temp0/800/1000',
      description: '强调负空间与严谨网格系统的布局，适合展示高度提炼的几何图形与极简作品。',
      features: ['12-Column Grid', 'Optimized for Typography', 'Variable Font Support', 'Auto-Layout Ready'],
      pages: ['Cover Section', 'About the Creator', 'Project Deep-Dive', 'Impact Analytics']
    },
    { 
      name: 'Brutalist Archive', 
      category: 'Fine Arts', 
      downloads: '850',
      previewImg: 'https://picsum.photos/seed/temp1/800/1000',
      description: '原始、甚至有些粗粝的视觉表达，适合纯艺术、实验装置等需要强烈情绪输出的作品。',
      features: ['Unfiltered Styles', 'Heavy Contrast', 'Layered Compositions', 'Organic Textures'],
      pages: ['Manifesto Page', 'Exhibition Log', 'Process Experiments', 'Contact Card']
    },
    { 
      name: 'Industrial Flow', 
      category: 'Product Design', 
      downloads: '2.1k',
      previewImg: 'https://picsum.photos/seed/temp2/800/1000',
      description: '注重跨学科的设计流程展示，从市场调研、人机工程到最终渲染的全链路视觉引导。',
      features: ['Flow Tracking', 'Material Study Blocks', 'Ergonomic Specs', 'Assembly Charts'],
      pages: ['User Persona Study', 'Ideation Sketches', 'CAD Render Library', 'Technical Specs']
    },
    { 
      name: 'Narrative Storyboard', 
      category: 'Animation', 
      downloads: '1.5k',
      previewImg: 'https://picsum.photos/seed/temp3/800/1000',
      description: '为叙事而生。动态的分镜感布局，适合定格动画、短篇叙事以及沉浸式戏剧作品集。',
      features: ['Cinematic Aspect Ratios', 'Pacing Controls', 'Lighting Moodboards', 'Storyboard Cells'],
      pages: ['Main Narrative Arc', 'Character Sheet', 'Environment Design', 'Final Stills']
    },
    { 
      name: 'Architectural Blueprint', 
      category: 'Architecture', 
      downloads: '3.2k',
      previewImg: 'https://picsum.photos/seed/temp4/800/1000',
      description: '专业建筑师级别的布局水准。包含平立剖、大样图以及各种体量研究的高级排版。',
      features: ['Technical Line Weights', 'Scalable Vectors', 'Material Palette', 'Urban Context'],
      pages: ['Context Analysis', 'Master Plan', 'Structural Detail', 'Rendering Suite']
    }
  ];

  return (
    <div className="flex flex-col h-full bg-porcelain relative">
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-[100] bg-white flex flex-col"
          >
            {/* Header */}
            <div className="p-8 md:px-20 md:py-12 bg-white border-b border-silver/10 flex items-center justify-between sticky top-0 z-10">
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="flex items-center gap-3 text-ink/40 hover:text-ink transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-porcelain flex items-center justify-center shadow-sm border border-silver/10 group-hover:scale-110 transition-transform">
                  <ChevronRight size={20} className="rotate-180" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest italic">Back to Templates</span>
              </button>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt mb-1 block italic">{selectedTemplate.category} / Selection</span>
                <h3 className="text-lg md:text-2xl font-serif font-black italic text-ink">{selectedTemplate.name}</h3>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
               <div className="flex flex-col lg:flex-row min-h-full">
                  {/* Left: Preview */}
                  <div className="w-full lg:w-1/2 p-8 md:p-16 lg:sticky lg:top-0">
                     <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-4xl border border-silver/10">
                        <img src={selectedTemplate.previewImg} className="w-full h-full object-cover" alt="" />
                     </div>
                  </div>

                  {/* Right: Specs */}
                  <div className="flex-1 p-8 md:p-16 lg:p-24 space-y-20">
                     <div className="space-y-8">
                        <div className="flex items-center gap-4 text-cobalt">
                           <div className="w-10 h-[2px] bg-cobalt" />
                           <span className="text-[10px] font-black uppercase tracking-widest italic">Design Philosophy</span>
                        </div>
                        <p className="text-2xl md:text-4xl font-serif font-light italic leading-loose text-ink">
                           {selectedTemplate.description}
                        </p>
                     </div>

                     <div className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-ink/20 italic">Integrated Sheets</h4>
                        <div className="grid grid-cols-2 gap-4">
                           {selectedTemplate.pages.map((page: string, i: number) => (
                             <div key={i} className="px-6 py-4 bg-porcelain rounded-2xl border border-silver/10 text-xs font-bold text-ink/60 italic">
                                {page}
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-ink/20 italic">Technical Highlights</h4>
                        <div className="grid grid-cols-1 gap-4">
                           {selectedTemplate.features.map((feature: string, i: number) => (
                             <div key={i} className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-cobalt" />
                                <span className="text-sm font-bold text-ink italic opacity-80">{feature}</span>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="pt-12 border-t border-silver/10">
                        <button className="w-full py-6 bg-ink text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-cobalt transition-all shadow-2xl flex items-center justify-center gap-4 group">
                           Request Access & Sync Assets
                           <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-6 md:p-10 border-b border-silver/10 flex items-center justify-between">
        <div className="space-y-1">
           <h2 className="text-xl md:text-3xl font-serif font-black italic text-ink uppercase tracking-tighter">作品集模板 / Templates</h2>
           <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Professional Layouts</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {templates.map((t, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedTemplate(t)}
                className="group bg-white rounded-[2.5rem] border border-silver/10 overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer"
              >
                 <div className="aspect-[4/5] bg-porcelain relative overflow-hidden">
                    <img src={t.previewImg || `https://picsum.photos/seed/temp${i}/600/800`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="px-8 py-4 bg-white text-ink rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl">Preview Template</button>
                    </div>
                 </div>
                 <div className="p-8 space-y-2">
                    <div className="flex items-center justify-between">
                       <h4 className="text-lg font-bold text-ink italic">{t.name}</h4>
                       <Award size={16} className="text-cobalt" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black text-ink/30 uppercase tracking-widest">
                       <span>{t.category}</span>
                       <span>{t.downloads} Downloads</span>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Container ---
export const EnrollmentSectionDetail = ({ type, onClose }: EnrollmentSectionDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] flex items-center justify-center p-0 md:p-8"
    >
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="relative w-full h-full max-h-screen md:max-h-[90vh] md:max-w-[1200px] bg-white md:rounded-[4rem] overflow-hidden shadow-4xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 md:top-12 md:right-12 z-50 w-12 h-12 md:w-20 md:h-20 bg-white/80 backdrop-blur-md rounded-full border border-silver/10 shadow-2xl flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-all outline-none"
        >
          <X size={24} />
        </button>

        <div className="h-full">
           {type === 'portfolio' && <PortfolioDetail />}
           {type === 'language' && <LanguageDetail />}
           {type === 'statement' && <StatementDetail />}
           {type === 'interview' && <InterviewDetail />}
           {type === 'templates' && <TemplatesDetail />}
        </div>
      </motion.div>
    </motion.div>
  );
};

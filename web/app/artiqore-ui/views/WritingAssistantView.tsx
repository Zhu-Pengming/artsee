// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, PenTool, Sparkles, Wand2, FileEdit, Trash2, Send, Zap, BookOpen, Quote, Languages, Copy, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface WritingAssistantViewProps {
  onBack: () => void;
}

export const WritingAssistantView = ({ onBack }: WritingAssistantViewProps) => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'polish' | 'brainstorm' | 'translate'>('polish');

  const handleProcess = () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setResult(`[AI 优化内容] \n\n在当代艺术语境下，我更倾向于将创作视为一种“叙事空间的重构”。通过对日常物质性的解构，我试图在二维平面与三维空间之间建立一种动态的张力。这次作品集的创作核心，在于对“记忆碎片”的物化处理，通过炭笔与数字媒介的交织，呈现出一种徘徊于虚幻与真实边缘的视觉隐喻。`);
      setIsProcessing(false);
    }, 2000);
  };

  const templates = [
    "个人陈述 (Personal Statement) 润色",
    "作品集项目描述 (Project Context)",
    "艺术陈述 (Artist Statement) 构思",
    "院校申请邮件沟通"
  ];

  return (
    <div className="min-h-screen bg-white md:bg-porcelain/30">
      {/* Header */}
      <header className="px-6 py-4 md:px-12 md:py-8 border-b border-silver/10 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-2 text-ink/40 hover:text-ink">
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-serif font-black italic text-ink">超级文书助手</h1>
              <p className="text-[9px] md:text-[10px] text-ink/40 font-black uppercase tracking-[0.4em] mt-0.5">Narrative Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-ink/40 uppercase tracking-widest">Model: GPT-4 Art-Optimized</span>
                <span className="text-xs font-bold text-cobalt italic">Stable Connection</span>
             </div>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cobalt flex items-center justify-center text-white shadow-lg shadow-cobalt/20">
                <PenTool size={20} />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Sidebar - Templates & Tools */}
        <aside className="hidden lg:flex flex-col w-80 p-10 border-r border-silver/10 space-y-12 shrink-0">
          <div className="space-y-6">
             <p className="text-[10px] font-black text-ink/40 uppercase tracking-[0.4em]">快速模板 / Templates</p>
             <div className="space-y-3">
                {templates.map((t, i) => (
                  <button 
                    key={i} 
                    className="w-full text-left p-4 rounded-xl border border-silver/30 text-[11px] font-bold text-ink/60 hover:bg-white hover:border-cobalt hover:text-cobalt transition-all italic leading-relaxed"
                  >
                    {t}
                  </button>
                ))}
             </div>
          </div>

          <div className="p-6 bg-ink rounded-[2rem] text-white relative overflow-hidden group">
             <Quote size={40} className="absolute -right-4 -bottom-4 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
             <p className="text-[10px] font-black uppercase tracking-widest text-cobalt mb-4 italic">Writing Tip</p>
             <p className="text-xs font-light leading-relaxed text-white/60 italic">
               “避免过度装饰的词汇，院校更倾向于看到你对创作逻辑的诚实反思。”
             </p>
          </div>
        </aside>

        {/* Workspace */}
        <section className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
           
           {/* Editor Area */}
           <div className="flex-1 flex flex-col p-6 md:p-10 space-y-6 border-r border-silver/10 bg-white">
              <div className="flex items-center gap-4 bg-porcelain/50 p-1 rounded-xl w-fit">
                 {[
                   { id: 'polish', label: '润色', icon: <Wand2 size={14} /> },
                   { id: 'brainstorm', label: '灵感', icon: <Zap size={14} /> },
                   { id: 'translate', label: '翻译', icon: <Languages size={14} /> },
                 ].map(tab => (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={cn(
                       "flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                       activeTab === tab.id ? "bg-white text-cobalt shadow-sm" : "text-ink/40 hover:text-ink/60"
                     )}
                   >
                     {tab.icon}
                     {tab.label}
                   </button>
                 ))}
              </div>

              <div className="flex-1 relative">
                 <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="请输入或粘贴您的文书内容、艺术家陈述或灵感碎片..."
                    className="w-full h-full p-8 md:p-12 text-base md:text-lg font-light leading-relaxed text-ink outline-none resize-none placeholder:text-ink/30 italic bg-porcelain/20 rounded-3xl border border-silver/20 focus:border-cobalt/30 transition-all custom-scrollbar"
                 />
                 <div className="absolute bottom-6 right-8 flex items-center gap-4 text-ink/40 text-[10px] font-black uppercase tracking-widest">
                    <span>{text.length} Characters</span>
                    <button onClick={() => setText('')} className="p-2 hover:text-red-500 transition-colors">
                       <Trash2 size={16} />
                    </button>
                 </div>
              </div>

              <button 
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full h-16 md:h-20 bg-ink text-white rounded-2xl md:rounded-[2.5rem] text-sm font-bold uppercase tracking-[0.4em] hover:bg-cobalt shadow-2xl transition-all shadow-ink/20 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-30"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI 深度重构中...</span>
                  </>
                ) : (
                  <>开始智能优化 (Optimize)</>
                )}
              </button>
           </div>

           {/* Result Area */}
           <div className="flex-1 flex flex-col p-6 md:p-10 bg-porcelain/30 relative">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                       <Sparkles size={16} />
                    </div>
                    <span className="text-[10px] font-black text-ink/50 uppercase tracking-[0.4em]">优化提案 / Suggestion</span>
                 </div>
                 {result && (
                   <button className="flex items-center gap-2 text-[10px] font-black text-cobalt uppercase tracking-widest hover:underline transition-all">
                      <Copy size={12} />
                      一键复制
                   </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                 <AnimatePresence mode="wait">
                    {result ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-silver/30 shadow-sm min-h-full space-y-8"
                      >
                         <p className="text-base md:text-lg font-medium leading-relaxed italic text-ink whitespace-pre-wrap select-text">
                            {result}
                         </p>
                         
                         <div className="pt-8 border-t border-silver/10 space-y-6">
                            <p className="text-[10px] font-black text-ink/40 uppercase tracking-widest">关键修饰点 / Analysis</p>
                            <div className="space-y-3">
                               {[
                                 "增强了叙事逻辑的连贯性",
                                 "运用了更贴合当代艺术语境的词汇",
                                 "优化了句式结构，提升专业感"
                               ].map((tip, idx) => (
                                 <div key={idx} className="flex items-center gap-3 text-emerald-600">
                                    <CheckCircle size={14} />
                                    <span className="text-[11px] font-bold italic">{tip}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-12">
                         <div className="w-20 h-20 bg-white rounded-3xl border border-silver/30 flex items-center justify-center text-ink/10 shadow-sm">
                            <FileEdit size={32} />
                         </div>
                         <div>
                            <p className="text-sm font-serif italic text-ink/30">等待输入内容进行处理...</p>
                            <p className="text-[8px] text-ink/10 uppercase font-black tracking-widest mt-2">Waiting for input</p>
                         </div>
                      </div>
                    )}
                 </AnimatePresence>
              </div>

              {/* Action Bar Mobile */}
              <div className="md:hidden pt-6">
                 <button className="w-full h-14 bg-white border border-silver/30 rounded-xl text-[10px] font-black uppercase tracking-widest italic text-ink/40">保存至我的文书库</button>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
};

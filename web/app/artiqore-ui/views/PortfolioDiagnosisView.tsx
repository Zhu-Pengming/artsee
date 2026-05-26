// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle, AlertCircle, BarChart3, ChevronLeft, Sparkles, FileSearch, Target, Zap, ArrowRight, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

interface PortfolioDiagnosisViewProps {
  onBack: () => void;
}

export const PortfolioDiagnosisView = ({ onBack }: PortfolioDiagnosisViewProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setReport({
        score: 88,
        dimensions: [
          { name: '视觉表现力', score: 92, status: 'excellent' },
          { name: '叙事完整度', score: 78, status: 'warning' },
          { name: '创新实验性', score: 85, status: 'good' },
          { name: '技法纯熟度', score: 89, status: 'good' },
        ],
        summary: "作品集呈现了极强的个人审美风格，构图与色彩把控能力卓越。但在核心叙事的逻辑连贯性上仍有提升空间，建议深入挖掘作品背后的实验性过程。",
        suggestions: [
          "增加核心项目的前期调研过程图",
          "优化作品排版的逻辑节奏感",
          "提升跨媒介材料的综合运用"
        ]
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Universal Header */}
      <header className="px-6 py-6 md:px-12 md:py-10 border-b border-silver/10 flex items-center justify-between bg-white relative z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-10 h-10 md:w-12 md:h-12 bg-porcelain rounded-full flex items-center justify-center text-ink/40 hover:bg-ink hover:text-white transition-all shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-serif font-black italic text-ink">AI 文书与作品集诊断</h1>
            <p className="text-[10px] md:text-xs text-ink/50 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mt-1 italic pl-[0.2em]">Curation Intelligence</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-ink/40 uppercase tracking-widest">Diagnostic Status</p>
              <p className="text-xs font-bold text-cobalt italic">System Ready</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-cobalt/5 flex items-center justify-center">
              <Zap size={20} className="text-cobalt" />
           </div>
        </div>
      </header>

      <main className="max-w-3xl md:max-w-4xl lg:max-w-3xl mx-auto px-6 py-4 md:py-4 mb-10">
        <AnimatePresence mode="wait">
          {!report && !isUploading && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6 md:space-y-6"
            >
              {/* Hero Call to Action */}
              <div className="text-center max-w-xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cobalt/5 rounded-full">
                  <Sparkles size={12} className="text-cobalt" />
                  <span className="text-[9px] font-black text-cobalt tracking-widest uppercase">Deep Neural Analysis</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-light leading-tight italic text-ink">
                  以评审之眼，<br />
                  <span className="text-ink/60">反向推演作品竞争力</span>
                </h2>
                <p className="text-xs md:text-sm text-ink/40 font-light leading-relaxed">
                  基于 10,000+ 枚 Offer 成功案例，AI 将全维度扫描您的作品集逻辑、排版与视觉强度。
                </p>
              </div>

              {/* Upload Dropzone */}
              <div 
                onClick={handleUpload}
                className="group relative w-full aspect-[16/5] md:aspect-[21/5] lg:aspect-[6/1] max-w-4xl mx-auto bg-porcelain rounded-[2.5rem] border-2 border-dashed border-silver/50 hover:border-cobalt hover:bg-white transition-all cursor-pointer overflow-hidden flex items-center justify-center p-4 md:px-10 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cobalt/5 via-transparent to-emerald-500/5 opacity-50" />
                
                <div className="relative z-10 flex items-center gap-6 md:gap-10 w-full justify-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-ink/10 group-hover:bg-cobalt group-hover:text-white transition-all duration-500 shrink-0">
                    <Upload size={24} className="group-hover:translate-y-[-2px] transition-transform" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3">
                       <h3 className="text-lg md:text-xl font-serif font-black italic text-ink">上传您的作品集文件</h3>
                       <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-cobalt/20" />
                       <span className="hidden md:inline-block text-[9px] font-black text-cobalt/40 uppercase tracking-widest">Diagnostic Ready</span>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-ink/30 font-black uppercase tracking-[0.4em]">Support: PDF, PPTX (MAX 200MB)</p>
                  </div>
                </div>
              </div>

              {/* Steps Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {[
                  { icon: <Target className="text-cobalt" />, title: "维度扫描", desc: "从视觉质量到叙事逻辑，AI 将进行 40+ 个维度的深度扫描。" },
                  { icon: <FileSearch className="text-purple-600" />, title: "竞品比对", desc: "实时锁定目标院校的 Offer 线，计算与成功案例的匹配值。" },
                  { icon: <Sparkles className="text-emerald-500" />, title: "改进路径", desc: "不仅是诊断，更为您提供具体的修改策略与灵感修正。" },
                ].map((step, i) => (
                  <div key={i} className="space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-lg border border-silver/20 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <h4 className="text-base font-bold italic text-ink">{step.title}</h4>
                    <p className="text-sm text-ink/50 font-light leading-relaxed italic">{step.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {isUploading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[60vh] flex flex-col items-center justify-center gap-10"
            >
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 border-[6px] border-silver/20 border-t-cobalt rounded-full animate-spin" />
                <FileSearch size={32} className="absolute inset-0 m-auto text-cobalt animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl md:text-2xl font-serif font-black italic text-ink">深度神经扫描中...</h3>
                <p className="text-[10px] md:text-xs text-ink/50 font-black uppercase tracking-[0.5em] animate-pulse">Running Diagnosis Logic</p>
                <div className="w-48 h-1 bg-porcelain rounded-full overflow-hidden mx-auto mt-6">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-1/2 h-full bg-cobalt"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {report && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 md:space-y-16 max-w-4xl mx-auto"
            >
              {/* Report Header */}
              <div className="bg-ink rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-3xl">
                <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-cobalt/20 to-transparent blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-20">
                  <div className="relative">
                     <svg className="w-40 h-40 md:w-48 md:h-48 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" className="stroke-white/5 fill-none" strokeWidth="8" />
                        <motion.circle 
                          initial={{ strokeDashoffset: 440 }}
                          animate={{ strokeDashoffset: 440 - (440 * report.score / 100) }}
                          transition={{ duration: 1.5, delay: 0.3 }}
                          cx="80" cy="80" r="70" className="stroke-cobalt fill-none" strokeWidth="8" strokeDasharray="440" strokeLinecap="round" 
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl md:text-5xl font-serif font-black italic">{report.score}</span>
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-1">Total Score</span>
                     </div>
                  </div>
                  <div className="flex-1 space-y-6 text-center md:text-left">
                     <h2 className="text-3xl md:text-5xl font-serif italic font-light leading-tight">扫描结果显示：<br /><span className="text-cobalt">极具视觉冲击力</span></h2>
                     <p className="text-base text-white/50 leading-relaxed italic">{report.summary}</p>
                  </div>
                </div>
              </div>

              {/* Dimension Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.dimensions.map((dim: any, i: number) => (
                  <div key={i} className="bg-white border border-silver/30 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all space-y-6 group">
                    <div className="flex items-center justify-between">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-ink/60">{dim.name}</h4>
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                         dim.status === 'excellent' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                       )}>{dim.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-porcelain rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${dim.score}%` }}
                         transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                         className={cn(
                           "h-full rounded-full transition-all",
                           dim.status === 'excellent' ? "bg-green-500" : "bg-orange-500"
                         )}
                       />
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="bg-porcelain/50 rounded-[3rem] p-10 md:p-16 space-y-12 border border-silver/20">
                 <div className="space-y-4">
                    <h3 className="text-2xl font-serif font-bold italic text-ink">针对性改进路径</h3>
                    <p className="text-[10px] text-ink/30 uppercase font-black tracking-widest">Optimized Evolution</p>
                 </div>

                 <div className="space-y-4">
                    {report.suggestions.map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-6 p-6 md:p-8 bg-white rounded-2xl md:rounded-3xl border border-silver/20 hover:border-cobalt transition-all group shadow-sm">
                         <div className="w-10 h-10 md:w-12 md:h-12 bg-cobalt/5 rounded-2xl flex items-center justify-center text-cobalt shadow-sm shrink-0">
                            <Sparkles size={18} />
                         </div>
                         <p className="text-sm md:text-base font-medium text-ink italic leading-relaxed">{s}</p>
                         <ArrowRight size={16} className="text-ink/10 ml-auto group-hover:text-cobalt transition-colors" />
                      </div>
                    ))}
                 </div>

                 <div className="flex flex-col md:flex-row gap-6 pt-10">
                    <button className="flex-1 h-16 bg-ink text-white rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] hover:bg-cobalt shadow-2xl transition-all shadow-ink/20 active:scale-95">下载诊断报告 (PDF)</button>
                    <button className="flex-1 h-16 border-2 border-silver/30 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-ink/40 hover:border-ink hover:text-ink transition-all">导师一对一咨询</button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

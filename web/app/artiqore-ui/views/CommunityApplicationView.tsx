// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ChevronLeft, Share2, Send, Zap, Shield, Target, Globe, ArrowRight, User, Mail, Briefcase, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface CommunityApplicationViewProps {
  onBack: () => void;
}

export const CommunityApplicationView = ({ onBack }: CommunityApplicationViewProps) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-[#050505] min-h-screen text-white flex items-center justify-center p-8 selection:bg-cobalt antialiased">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xs w-full p-8 md:p-12 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-cobalt/10 blur-[80px] -z-10" />
          <div className="w-16 h-16 bg-cobalt rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_#2563eb] animate-bounce">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-serif font-black italic">申请已提交</h2>
            <p className="text-[10px] md:text-xs text-white/40 font-light italic leading-relaxed">
              您的先锋艺术家资格正在通过 L-Chain 验证。
            </p>
          </div>
          <button 
            onClick={onBack}
            className="w-full py-3 bg-white text-ink rounded-xl text-[8px] font-black uppercase tracking-[0.4em] hover:bg-cobalt hover:text-white transition-all shadow-2xl active:scale-95"
          >
            返回
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20 selection:bg-cobalt antialiased">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 h-14 md:h-16 bg-black/60 backdrop-blur-3xl border-b border-white/5 z-50 flex items-center justify-between px-4 md:px-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 md:gap-3 p-1 hover:bg-white/5 rounded-full transition-all active:scale-95"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-white shadow-sm">
            <ChevronLeft size={16} className="text-ink group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em] italic hidden sm:block">Abort</span>
        </button>

        <div className="hidden md:flex items-center gap-4">
           <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[7px] font-black text-white/40 uppercase tracking-[0.4em]">
              Security v4.0
           </div>
        </div>
      </header>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] right-[-5%] w-[40vw] h-[40vw] bg-cobalt/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] left-[-5%] w-[30vw] h-[30vw] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 pt-20 md:pt-32 px-4 md:px-12">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-12 md:gap-24 items-center">
          
          {/* Left Column: Visuals & Mission */}
          <div className="lg:col-span-7 space-y-6 md:space-y-10">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-4"
             >
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-cobalt" />
                   <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.6em] text-cobalt">L-Chain Verification Active</span>
                </div>
                <h1 className="text-xl md:text-3xl font-serif font-black italic tracking-tighter leading-tight">
                  加入学术<br />
                  <span className="text-white/20 italic">社区空间</span>
                </h1>
                <p className="text-[10px] md:text-xs text-white/30 font-light italic leading-loose max-w-sm">
                  这是一个专为 1% 的艺术先锋设计的闭门场域。我们需要能够拆解叙事、重构逻辑的创造者。
                </p>
             </motion.div>

             <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-md">
                {[
                  { icon: <Shield size={14} />, title: '身份验证', desc: '信用评估与学术验证。' },
                  { icon: <Zap size={14} />, title: '即时共鸣', desc: '顶尖实验室数据流。' },
                  { icon: <Target size={14} />, title: '精准对接', desc: '美学引力伙伴匹配。' },
                  { icon: <Globe size={14} />, title: '节点协作', desc: '分布式场域共建。' }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 + 0.2 }}
                    className="space-y-1.5"
                  >
                    <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-white/20">
                      {item.icon}
                    </div>
                    <h4 className="text-[11px] font-bold italic">{item.title}</h4>
                    <p className="text-[8px] text-white/20 font-light leading-relaxed italic">{item.desc}</p>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Right Column: Multi-step Form - Significantly Smaller */}
          <div className="lg:col-span-5 flex justify-end">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden w-full max-w-xs"
             >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cobalt/5 blur-[50px] rounded-full pointer-events-none" />
                
                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 relative z-10">
                   {/* Progress */}
                   <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={cn("w-1 h-1 rounded-full transition-all duration-500", step >= i ? "bg-cobalt shadow-[0_0_5px_rgba(37,99,235,0.5)]" : "bg-white/10")} />
                        ))}
                      </div>
                      <span className="text-[6px] font-black uppercase tracking-[0.4em] text-white/20">0{step} / 03</span>
                   </div>

                   <AnimatePresence mode="wait">
                      {step === 1 && (
                        <motion.div 
                          key="step1"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-5"
                        >
                           <div className="space-y-0.5">
                              <h3 className="text-sm md:text-base font-serif font-black italic">基本验证信息</h3>
                              <p className="text-[9px] text-white/20 italic">请输入您的先锋代号与全球通讯链路。</p>
                           </div>

                           <div className="space-y-4">
                              <div className="group space-y-1.5">
                                 <label className="flex items-center gap-1.5 text-[6px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within:text-cobalt transition-colors">
                                    <User size={8} /> Full Alias / 艺术代号
                                 </label>
                                 <input 
                                  type="text" 
                                  required
                                  placeholder="e.g. Creator_X99" 
                                  className="w-full bg-transparent border-b border-white/5 py-1.5 text-xs md:text-sm font-serif italic text-white placeholder:text-white/5 focus:outline-none focus:border-cobalt transition-all"
                                />
                              </div>
                              <div className="group space-y-1.5">
                                 <label className="flex items-center gap-1.5 text-[6px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within:text-cobalt transition-colors">
                                    <Mail size={8} /> Data Stream / 常用邮箱
                                 </label>
                                 <input 
                                  type="email" 
                                  required
                                  placeholder="link@intelligence.io" 
                                  className="w-full bg-transparent border-b border-white/5 py-1.5 text-xs md:text-sm font-serif italic text-white placeholder:text-white/5 focus:outline-none focus:border-cobalt transition-all"
                                />
                              </div>
                           </div>

                           <button 
                            type="button"
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-white text-ink rounded-lg text-[8px] font-black uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                           >
                             Next Phase <ArrowRight size={10} />
                           </button>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div 
                          key="step2"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-5"
                        >
                           <div className="space-y-0.5">
                              <h3 className="text-sm md:text-base font-serif font-black italic">专业领域定位</h3>
                              <p className="text-[9px] text-white/20 italic">选择您的叙事维度与交互媒介。</p>
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              {['数字时尚', '交互装置', '算法绘画', '策展'].map(item => (
                                <button key={item} type="button" className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-[7px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:border-cobalt hover:text-white transition-all text-left">
                                   {item}
                                </button>
                              ))}
                           </div>

                           <div className="flex gap-2">
                             <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 text-white/20 rounded-lg text-[7px] font-black uppercase tracking-widest hover:text-white transition-all">Prev</button>
                             <button type="button" onClick={() => setStep(3)} className="flex-[2] py-3 bg-white text-ink rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all">Next</button>
                           </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div 
                          key="step3"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-5"
                        >
                           <div className="space-y-0.5">
                              <h3 className="text-sm md:text-base font-serif font-black italic">愿景验证</h3>
                              <p className="text-[9px] text-white/20 italic">简单描述您的“审美引力场”。</p>
                           </div>

                           <div className="space-y-4">
                              <textarea 
                                className="w-full h-20 bg-white/5 border border-white/5 rounded-xl p-3 text-[9px] font-serif italic text-white placeholder:text-white/5 focus:outline-none focus:border-cobalt transition-all resize-none"
                                placeholder="..."
                              />
                              <div className="p-3 bg-cobalt/5 border border-cobalt/10 rounded-xl flex items-center gap-3">
                                 <div className="w-6 h-6 bg-cobalt rounded flex items-center justify-center text-white shrink-0">
                                    <Database size={10} />
                                 </div>
                                 <div className="space-y-0.5">
                                    <p className="text-[6px] font-black uppercase tracking-[0.1em] text-cobalt">Final Validation Active</p>
                                    <p className="text-[5px] text-white/10 italic">Data encrypted</p>
                                 </div>
                              </div>
                           </div>

                           <button 
                            type="submit"
                            className="w-full py-3.5 bg-white text-ink rounded-xl text-[9px] font-black uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95"
                           >
                             确认提交
                           </button>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </form>
             </motion.div>
          </div>
        </div>
      </div>

      {/* Global Status Footer */}
      <footer className="fixed bottom-6 left-6 hidden md:flex items-center gap-4 z-40">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20">Secure Link Established</span>
         </div>
      </footer>
    </div>
  );
};

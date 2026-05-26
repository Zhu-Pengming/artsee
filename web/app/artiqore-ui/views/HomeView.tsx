// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Image as ImageIcon, FileText, Globe, BookOpen, Calculator, MoreHorizontal, ArrowRight, Mic, Camera, HelpCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface HomeViewProps {
  onViewChange: (view: string) => void;
  onSearchOpen?: (query: string) => void;
  onAIGuideOpen?: (prompt: string) => void;
  onDiagnosisOpen?: () => void;
  onCalculatorOpen?: () => void;
  onWritingAssistantOpen?: () => void;
  onComparisonOpen?: () => void;
}

export const HomeView = ({ 
  onViewChange, 
  onSearchOpen,
  onAIGuideOpen, 
  onDiagnosisOpen, 
  onCalculatorOpen, 
  onWritingAssistantOpen,
  onComparisonOpen 
}: HomeViewProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeMode, setActiveMode] = useState<'search' | 'ai'>('ai');

  const handleSearchTrigger = () => {
    if (searchValue.trim()) {
      if (activeMode === 'ai') {
        onAIGuideOpen?.(searchValue);
      } else {
        onSearchOpen?.(searchValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchTrigger();
    }
  };

  const suggestions = [
    { text: '如何用 AI 辅助艺术创作？', icon: '🎨' },
    { text: '柏林艺术大学与伦艺怎么选？', icon: '📐' },
    { text: 'AI 文书诊断：我的作品集评分？', icon: '✍️' },
  ];

  const tools = [
    { name: '院校AI比对', icon: <Globe size={24} className="text-blue-600" />, id: 'comparison' },
    { name: '灵感广场', icon: <Sparkles size={24} className="text-purple-600" />, id: 'feed' },
    { name: '文书助手', icon: <FileText size={24} className="text-rose-600" />, id: 'writing' },
    { name: '艺术计算器', icon: <Calculator size={24} className="text-emerald-600" />, id: 'calculator' },
  ];

  return (
    <div className="h-full md:h-screen bg-white flex flex-col items-center justify-center px-4 md:px-0 font-sans text-ink overflow-hidden select-none">
      
      {/* Container - Centered vertically on desktop with slight upward bias for optical balance */}
      <div className="w-full max-w-6xl flex flex-col items-center md:-translate-y-12">
        
        {/* Top Section: Logo - Minimalist & Elegant */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6 md:mb-14"
        >
          <div className="relative group cursor-default">
            <h1 className="text-6xl md:text-8xl font-serif font-black tracking-[-0.08em] italic text-ink relative z-10 selection:bg-cobalt selection:text-white">
              artiqore
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
              className="absolute -bottom-1 left-0 h-[2px] md:h-[3px] bg-gradient-to-r from-purple-600/40 via-cobalt/40 to-emerald-400/40 rounded-full" 
            />
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-6">
            <div className="h-px w-6 bg-ink/5" />
            <span className="text-[10px] md:text-xs font-serif font-medium text-ink/30 tracking-[0.8em] italic uppercase pl-[0.8em]">艺见心</span>
            <div className="h-px w-6 bg-ink/5" />
          </div>
        </motion.div>

        {/* AI Center Search Bar - Clean & Integrated */}
        <div className="w-full max-w-2xl mb-8 md:mb-16">
          <motion.div 
            animate={{
              scale: isFocused ? 1.01 : 1,
              boxShadow: isFocused ? '0 40px 100px -20px rgba(30,58,138,0.12)' : '0 4px 20px -5px rgba(0,0,0,0.03)'
            }}
            className={cn(
              "bg-white rounded-[2rem] transition-all duration-500 overflow-hidden",
              isFocused ? "ring-1 ring-cobalt/20" : "border border-silver/20"
            )}
          >
            {/* Mode Switcher - Thinner & Cleaner */}
            <div className="flex items-center px-8 border-b border-silver/5 bg-porcelain/10">
               <div 
                 onClick={() => setActiveMode('search')}
                 className={cn(
                   "px-5 py-2 text-xs font-black uppercase tracking-widest cursor-pointer transition-all relative",
                   activeMode === 'search' ? "text-cobalt" : "text-ink/20 hover:text-ink/40"
                 )}
               >
                 搜索
                 {activeMode === 'search' && <motion.div layoutId="modeUnderline" className="absolute bottom-0 left-5 right-5 h-0.5 bg-cobalt rounded-full shadow-[0_0_8px_rgba(30,58,138,0.2)]" />}
               </div>
               <div 
                 onClick={() => setActiveMode('ai')}
                 className={cn(
                   "px-5 py-2 text-xs font-black uppercase tracking-widest cursor-pointer transition-all relative flex items-center gap-1.5",
                   activeMode === 'ai' ? "text-purple-600" : "text-ink/20 hover:text-ink/40"
                 )}
               >
                 意见 AI
                 {activeMode === 'ai' && <motion.div layoutId="modeUnderline" className="absolute bottom-0 left-5 right-5 h-0.5 bg-purple-600 rounded-full" />}
               </div>
            </div>

            <div className="px-5 py-3 md:px-8 md:py-6 flex items-center gap-4 md:gap-5">
              <button onClick={handleSearchTrigger} className="flex items-center justify-center">
                {activeMode === 'ai' ? (
                  <Sparkles size={20} className="text-purple-500 hover:scale-110 transition-transform cursor-pointer" />
                ) : (
                  <Search size={22} className="text-ink/20 hover:text-cobalt hover:scale-110 transition-all cursor-pointer" />
                )}
              </button>
              
              <input 
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeMode === 'ai' ? "我是意见AI，帮您解决艺考留学难题..." : "搜索灵感、院校或项目..."}
                className="flex-1 bg-transparent border-none text-base md:text-xl focus:ring-0 focus:outline-none placeholder:text-ink/10 font-bold"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />

              <div className="flex items-center gap-3 md:gap-4 text-ink/10">
                <Mic size={20} className="hover:text-purple-600 cursor-pointer transition-colors" />
                <Camera size={20} className="hover:text-emerald-500 cursor-pointer transition-colors" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* content Area - Landscape distribution with enhanced visibility */}
        <div className="w-full flex flex-col md:flex-row md:items-start justify-center gap-6 md:gap-32 opacity-95 transition-opacity duration-700">
          
          {/* AI Suggestions */}
          <div className="w-full max-w-sm md:max-w-[300px]">
            <p className="text-[10px] font-black text-ink/30 uppercase tracking-[0.6em] text-center md:text-left mb-4 md:mb-6">意见知识问答</p>
            <div className="flex flex-col gap-2 md:gap-3">
              {suggestions.map((item, idx) => (
                <motion.button
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    if (item.text.includes('文书诊断')) {
                      onDiagnosisOpen?.();
                    } else {
                      onAIGuideOpen?.(item.text);
                    }
                  }}
                  className="group w-full bg-white hover:bg-porcelain/50 border border-silver/30 shadow-sm px-5 py-3 md:px-6 md:py-4 rounded-xl flex items-center justify-between transition-all duration-300"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                    <span className="text-sm font-bold text-ink/80 group-hover:text-ink transition-colors text-left">{item.text}</span>
                  </div>
                  <ArrowRight size={14} className="text-ink/10 group-hover:text-cobalt group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Tools Grid */}
          <div className="w-full max-w-sm md:max-w-[240px] px-6 md:px-0">
            <p className="hidden md:block text-[10px] font-black text-ink/30 uppercase tracking-[0.6em] mb-6">超级工具覆盖</p>
            <div className="grid grid-cols-4 md:grid-cols-2 gap-y-6 md:gap-y-8 gap-x-6">
              {tools.map((tool, idx) => (
                <motion.button
                  key={tool.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (idx * 0.05) }}
                  onClick={() => {
                    if (tool.id === 'comparison') onComparisonOpen?.();
                    else if (tool.id === 'writing') onWritingAssistantOpen?.();
                    else if (tool.id === 'calculator') onCalculatorOpen?.();
                    else onViewChange(tool.id);
                  }}
                  className="flex flex-col items-center md:items-start gap-2 group"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center border border-silver/20 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                    <div className="scale-75 md:scale-100">{tool.icon}</div>
                  </div>
                  <span className="text-xs font-black text-ink/40 group-hover:text-ink transition-colors uppercase tracking-tight text-center md:text-left">
                    {tool.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, User, ChevronLeft, Bot, MessageSquare, Zap, Globe, BookOpen, Search, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIGuideViewProps {
  initialPrompt?: string;
  onBack: () => void;
}

export const AIGuideView = ({ initialPrompt = '', onBack }: AIGuideViewProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是 Articqore AI 指导顾问。在此，我将为您深度解析艺术留学、作品集规划以及全球艺术院校的申请策略。请问今天有什么我可以帮到您的？',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [input, setInput] = useState(initialPrompt);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: `针对您关于“${content}”的问题，我已基于全球 200+ 顶尖艺校的最新数据为您生成了深度分析建议。在艺术创作与留学的路径上，建议您重点关注院校背景与个人风格的契合度，并持续打磨作品的核心叙事能力。`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const suggestions = [
    "如何用 AI 辅助艺术创作？",
    "柏林艺术大学与伦艺怎么选？",
    "如何提升作品集的叙事性？",
    "目前的艺术留学趋势如何？"
  ];

  return (
    <div className="flex flex-col h-screen bg-white md:bg-porcelain/30">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-silver/20 bg-white sticky top-0 z-30">
        <button onClick={onBack} className="p-2 -ml-2 text-ink/40 hover:text-ink">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-serif font-black italic text-ink">artiqore AI</span>
          <span className="text-[9px] text-ink/40 font-black uppercase tracking-widest">Guide Assistant</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-porcelain flex items-center justify-center">
           <Zap size={16} className="text-cobalt" />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full h-full overflow-hidden">
        
        {/* Sidebar - PC Desktop Version */}
        <aside className="hidden md:flex flex-col w-80 p-8 border-r border-silver/20 space-y-10 shrink-0">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold italic text-ink">意见 AI 指引</h2>
            <p className="text-[10px] text-ink/40 uppercase font-black tracking-widest">Cognitive Strategy</p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-ink/40 uppercase tracking-[0.4em]">启发式问题</p>
            <div className="space-y-2">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="w-full text-left p-4 rounded-xl border border-silver/30 text-[11px] font-bold text-ink/60 hover:bg-white hover:border-cobalt hover:text-cobalt transition-all group"
                >
                  <span className="line-clamp-2 italic">{s}</span>
                  <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <ArrowUpRight size={14} className="text-cobalt" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-6 bg-ink rounded-3xl text-white relative overflow-hidden">
            <Sparkles size={40} className="absolute -right-4 -bottom-4 text-white/5" />
            <p className="text-[10px] font-black uppercase tracking-widest text-cobalt mb-2">Pro Access</p>
            <p className="text-xs font-light leading-relaxed text-white/60 italic">
              解锁实时院校招生库与 AI 导师一对一深度辅导。
            </p>
          </div>
        </aside>

        {/* Chat Area - PC/Mobile Adaptive */}
        <main className="flex-1 flex flex-col h-full bg-white relative">
          
          {/* Top Info Bar - PC only */}
          <div className="hidden md:flex items-center justify-between px-10 py-6 border-b border-silver/10 sticky top-0 bg-white/80 backdrop-blur-xl z-20">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-cobalt flex items-center justify-center text-white shadow-lg shadow-cobalt/20">
                   <Bot size={20} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-ink italic">Articqore LLM-4</h3>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] text-ink/50 uppercase font-black">System Online • Ultra Response</span>
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <button className="px-4 py-2 rounded-lg border border-silver/30 text-[10px] font-bold text-ink/40 hover:bg-porcelain transition-all uppercase tracking-widest">导出对话</button>
                <div className="h-6 w-[1px] bg-silver/20" />
                <button onClick={onBack} className="p-2 text-ink/20 hover:text-ink transition-colors">
                   <ChevronLeft size={24} />
                </button>
             </div>
          </div>

          {/* Messages List */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-8 no-scrollbar"
          >
            {messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={cn(
                  "flex gap-4 md:gap-6",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === 'user' ? "bg-porcelain text-ink/40" : "bg-cobalt text-white"
                )}>
                  {msg.role === 'user' ? <User size={16} md:size={20} /> : <Bot size={16} md:size={20} />}
                </div>
                
                <div className={cn(
                  "max-w-[85%] md:max-w-[70%] space-y-2",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-4 md:p-6 rounded-2xl md:rounded-3xl text-sm md:text-base leading-relaxed tracking-tight font-light",
                    msg.role === 'user' 
                      ? "bg-porcelain/50 text-ink rounded-tr-none border border-silver/20 italic" 
                      : "bg-white text-ink/90 rounded-tl-none border border-silver/30 shadow-[0_10px_40px_-20px_rgba(30,58,138,0.1)]"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-ink/40 uppercase font-black tracking-widest px-1">{msg.timestamp}</span>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex gap-4 md:gap-6">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-cobalt flex items-center justify-center text-white shrink-0">
                  <Bot size={16} md:size={20} />
                </div>
                <div className="bg-white border border-silver/30 p-4 rounded-2xl md:rounded-3xl flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-cobalt rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-cobalt rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-cobalt rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 md:p-10 border-t border-silver/10 bg-white/80 backdrop-blur-xl">
             <div className="max-w-4xl mx-auto relative group">
                <div className="absolute inset-0 bg-cobalt/5 blur-2xl group-focus-within:bg-cobalt/10 transition-all opacity-0 group-focus-within:opacity-100" />
                <div className="relative flex items-center bg-porcelain/50 md:bg-white rounded-2xl md:rounded-3xl border border-silver/30 md:border-silver/40 p-1 md:p-2 shadow-sm group-focus-within:border-cobalt transition-all">
                   <button className="p-3 text-ink/20 hover:text-cobalt transition-colors hidden md:block">
                      <BookOpen size={20} />
                   </button>
                   <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                      placeholder="咨询艺术作品集、院校申请或创作灵感..."
                      className="flex-1 bg-transparent px-4 py-3 md:py-4 text-sm md:text-base outline-none font-medium placeholder:text-ink/40"
                   />
                   <div className="flex items-center gap-1 md:gap-2 pr-2">
                      <button className="p-3 text-ink/20 hover:text-ink transition-colors">
                        <Search size={20} />
                      </button>
                      <button 
                        onClick={() => handleSend(input)}
                        className="w-10 h-10 md:w-12 md:h-12 bg-ink text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-cobalt transition-all shadow-lg active:scale-95"
                      >
                         <Send size={18} md:size={20} />
                      </button>
                   </div>
                </div>
             </div>
             <p className="text-center mt-4 text-[8px] md:text-[10px] text-ink/40 font-black uppercase tracking-[0.4em]">AI Power generated by Articqore Intelligent Research</p>
          </div>
        </main>
      </div>
    </div>
  );
};

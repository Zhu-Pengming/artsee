import React from 'react';
import { motion } from 'motion/react';
import { X, MessageCircle, Phone, Send, User, ChevronLeft, Mic, Paperclip, Smile, PhoneCall, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChannelDetailProps {
  onBack: () => void;
  institutionName: string;
  key?: string;
}

export const ChatDetail = ({ onBack, institutionName }: ChannelDetailProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full bg-white relative z-10"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-silver/10 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onBack} className="p-2 -ml-2 text-ink/40 hover:text-ink transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center text-cobalt overflow-hidden">
               <User size={20} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">Sarah (录取教研组)</h4>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">在线</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar pb-32">
        <div className="self-center py-2 px-4 bg-porcelain rounded-full text-[9px] font-bold text-ink/20 uppercase tracking-widest">
          今日
        </div>

        <div className="flex gap-3 max-w-[85%]">
          <div className="w-8 h-8 rounded-lg bg-cobalt/10 flex items-center justify-center text-cobalt shrink-0">
             <User size={16} />
          </div>
          <div className="bg-porcelain p-4 rounded-2xl rounded-tl-none space-y-2">
            <p className="text-xs text-ink leading-relaxed">
              您好！我是 Sarah。我刚根据您的兴趣查看了 {institutionName} 最新的政策变化。请问您目前的作品集准备到哪个阶段了？
            </p>
            <p className="text-[9px] text-ink/20 font-bold text-right italic">10:32 AM</p>
          </div>
        </div>

        <div className="self-end max-w-[85%] flex flex-col items-end gap-2">
          <div className="bg-ink text-white p-4 rounded-2xl rounded-tr-none">
            <p className="text-xs leading-relaxed">
              我想咨询一下那边的交互设计专业。目前作品集只做了一半。
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2">
             <CheckCircle2 size={10} className="text-cobalt" />
             <span className="text-[9px] text-ink/20 font-bold italic uppercase">Read 10:35 AM</span>
          </div>
        </div>

        <div className="flex gap-3 max-w-[85%]">
          <div className="w-8 h-8 rounded-lg bg-cobalt/10 flex items-center justify-center text-cobalt shrink-0">
             <User size={16} />
          </div>
          <div className="bg-porcelain p-4 rounded-2xl rounded-tl-none space-y-2">
            <p className="text-xs text-ink leading-relaxed">
              您的背景不错。交互专业非常看重流程推演。我们可以先帮您做个免费的 AI 竞争力分析。
            </p>
            <p className="text-[9px] text-ink/20 font-bold text-right italic">10:36 AM</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-6 border-t border-silver/10 bg-white sticky bottom-0">
        <div className="flex items-end gap-3 max-w-lg mx-auto">
          <div className="flex-1 bg-porcelain rounded-2xl p-2 flex flex-col">
            <textarea 
              rows={1}
              placeholder="输入您的消息..."
              className="w-full px-3 py-2 bg-transparent outline-none resize-none text-xs font-medium placeholder:text-ink/20"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex gap-2">
                <button className="p-1.5 text-ink/30 hover:text-cobalt transition-colors"><Mic size={16} /></button>
                <button className="p-1.5 text-ink/30 hover:text-cobalt transition-colors"><Paperclip size={16} /></button>
                <button className="p-1.5 text-ink/30 hover:text-cobalt transition-colors"><Smile size={16} /></button>
              </div>
              <button className="w-8 h-8 bg-ink text-white rounded-xl flex items-center justify-center hover:bg-cobalt transition-all">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const PhoneDetail = ({ onBack, institutionName }: ChannelDetailProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full bg-ink text-white overflow-hidden relative"
    >
      <div className="p-6 relative z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/40 hover:text-white transition-all bg-white/5 rounded-full">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 text-center space-y-10 md:space-y-16 relative z-10">
        <div className="space-y-8">
          <div className="relative mx-auto w-28 h-28 md:w-40 md:h-40">
            <div className="absolute inset-0 bg-cobalt animate-ping rounded-full opacity-20" />
            <div className="relative w-full h-full rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center overflow-hidden">
               <User size={60} className="text-white/20" />
               <div className="absolute inset-0 bg-gradient-to-t from-cobalt/40 to-transparent" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl md:text-3xl font-serif font-black italic">Sarah (Advisor)</h3>
            <p className="text-[10px] text-cobalt font-black uppercase tracking-[0.4em] animate-pulse">Connecting...</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
            <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">状态</p>
            <p className="text-xs font-bold italic">可通话</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
            <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">等待时长</p>
            <p className="text-xs font-bold italic">{'<'} 1 min</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
           <button className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-3xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all group">
             <PhoneCall size={28} fill="white" className="group-hover:animate-bounce" />
           </button>
           <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] max-w-[15rem] leading-relaxed">
             点击呼叫 Sarah 进行一对一深度评估
           </p>
        </div>
      </div>

      <div className="p-8 border-t border-white/5 bg-white/5 mt-auto relative z-10">
        <div className="flex items-center gap-4 max-w-sm mx-auto">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cobalt shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white uppercase tracking-widest">智能预约</p>
            <p className="text-[9px] text-white/20 font-medium leading-relaxed">如果不方便立即通话，也可以预约 Sarah 的线下访谈时间。</p>
          </div>
        </div>
      </div>

      {/* Decorative background gradients */}
      <div className="absolute top-1/4 -right-20 w-64 h-64 bg-cobalt/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-blue-900/10 blur-[80px] rounded-full" />
    </motion.div>
  );
};

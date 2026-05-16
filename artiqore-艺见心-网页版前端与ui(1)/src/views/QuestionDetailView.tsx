import React from 'react';
import { ChevronLeft, Share2, Heart, MessageSquare, ArrowRight, UserPlus, Send, Flag, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface QuestionDetailViewProps {
  question: { title: string; count: string };
  onBack: () => void;
  onOpenChat: (id: string, name: string, avatar: string, type: string) => void;
}

export const QuestionDetailView = ({ question, onBack, onOpenChat }: QuestionDetailViewProps) => {
  return (
    <div className="bg-porcelain min-h-screen pb-64">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 h-20 bg-white/50 backdrop-blur-3xl border-b border-silver/30 z-50 flex items-center justify-between px-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 p-2 -ml-2 hover:bg-black/5 rounded-full transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-silver/20 group-hover:text-cobalt">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-bold text-ink uppercase tracking-[0.4em] italic">Back to Social</span>
        </button>

        <div className="flex items-center gap-4">
          <button className="p-3 hover:bg-black/5 rounded-full transition-all text-ink/40">
            <Bookmark size={20} />
          </button>
          <button className="p-3 hover:bg-black/5 rounded-full transition-all text-ink/40 hover:text-cobalt">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* Hero: Question Section */}
      <section className="pt-32 pb-24 px-8 border-b border-silver/20 bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex items-center gap-4">
            <span className="bg-cobalt/5 text-cobalt text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">艺术留学咨询</span>
            <span className="text-[10px] text-ink/20 font-bold uppercase tracking-widest">Edited 2h ago</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-light text-ink italic leading-tight">
            {question.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=qav${i}`} className="w-10 h-10 rounded-full border-4 border-white object-cover" alt="" referrerPolicy="no-referrer" />
                  ))}
               </div>
               <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">
                 <span className="text-ink">128 人</span> 正在讨论该话题
               </p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black text-cobalt uppercase underline underline-offset-4 tracking-widest">
              关注话题
            </button>
          </div>
        </div>
      </section>

      {/* Answers Section */}
      <main className="max-w-4xl mx-auto px-8 mt-24 space-y-16">
        <div className="flex items-center justify-between border-b border-silver/30 pb-6">
          <h3 className="text-sm font-bold text-ink uppercase tracking-widest">精选回答 (14 Answers)</h3>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-ink cursor-pointer">最热</span>
            <span className="text-[10px] font-bold text-ink/20 cursor-pointer hover:text-ink">最新</span>
          </div>
        </div>

        <div className="space-y-16">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={`https://i.pravatar.cc/100?u=ans${i}`} className="w-14 h-14 rounded-2xl border border-silver/20" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-base font-bold text-ink italic">王教授 (Faculty of Arts)</h4>
                      <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest">Verified Academic Advisor</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onOpenChat(`advisor-${i}`, '王教授', `https://i.pravatar.cc/100?u=ans${i}`, '导师')}
                    className="flex items-center gap-3 px-6 py-2.5 bg-silver/5 hover:bg-cobalt hover:text-white rounded-full text-[9px] font-bold uppercase tracking-widest transition-all"
                  >
                    <UserPlus size={14} /> 咨询TA
                  </button>
               </div>

               <div className="text-lg text-ink/60 font-light leading-relaxed prose prose-ink">
                  <p>
                    关于这个问题，我觉得核心不在于你用的渲染引擎多高级，而在于你的 “Design Decision” 是否建立在扎实的用户调研之上。
                  </p>
                  <p className="mt-4">
                    在伦敦艺术大学（UAL）或者皇家艺术学院（RCA）的交互设计评审中，面试官通常会问你：<strong>“Why this? Why now?”</strong>。如果你能从叙事深度出发，解释为什么在特定的节点选择了这种多维度的感官反馈，即使技术广度稍微逊色，也会让你的作品集脱颖而出。
                  </p>
                  <ul className="mt-6 space-y-3 list-disc pl-5">
                    <li>强调社会实验的可行性</li>
                    <li>展示失败的原型并说明从中学到了什么</li>
                    <li>不仅仅是 App，更关注跨媒介的整体体验</li>
                  </ul>
               </div>

               <div className="flex items-center justify-between pt-8 border-t border-silver/10">
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-cobalt/5 text-cobalt rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all">
                       有用 (425)
                    </button>
                    <button className="p-3 text-ink/30 hover:text-red-500 transition-colors">
                       <Heart size={18} />
                    </button>
                    <button className="p-3 text-ink/30">
                       <Flag size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-ink/20">
                     <MessageSquare size={16} />
                     <span className="text-[10px] font-bold uppercase">12 条追问</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sticky Bottom Answer Bar */}
      <div className="fixed bottom-0 inset-x-0 h-32 bg-white/80 backdrop-blur-3xl border-t border-silver/30 z-50 flex items-center px-8">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-6">
           <div className="flex-1 relative">
             <input 
               type="text" 
               placeholder="写下你的见解，与顶尖创作者同步..." 
               className="w-full h-16 bg-porcelain px-8 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cobalt/20 border border-silver/20"
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                 <button className="p-2 text-ink/20 hover:text-ink"><MessageSquare size={18} /></button>
             </div>
           </div>
           <button className="w-16 h-16 bg-ink text-white rounded-2xl flex items-center justify-center hover:bg-cobalt transition-all shadow-3xl shadow-cobalt/20">
              <Send size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};

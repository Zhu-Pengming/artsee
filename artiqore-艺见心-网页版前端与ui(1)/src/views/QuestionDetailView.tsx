import React, { useState } from 'react';
import { ChevronLeft, Share2, Heart, MessageSquare, ArrowRight, UserPlus, Send, Flag, Bookmark, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface QuestionDetailViewProps {
  question: { title: string; count: string };
  onBack: () => void;
  onOpenChat: (id: string, name: string, avatar: string, type: string) => void;
  onAuthorClick?: (authorId: string) => void;
}

export const QuestionDetailView = ({ question, onBack, onOpenChat, onAuthorClick }: QuestionDetailViewProps) => {
  const [isFollowed, setIsFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState<'hot' | 'latest'>('hot');
  const [commentInput, setCommentInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'info' } | null>(null);
  const [likedAnswers, setLikedAnswers] = useState<Record<number, boolean>>({});
  const [usefulCounts, setUsefulCounts] = useState<Record<number, number>>({
    1: 425,
    2: 12
  });
  const [localAnswers, setLocalAnswers] = useState([
    {
      id: 1,
      author: { name: '王教授 (Faculty of Arts)', role: 'Verified Academic Advisor', avatar: 'https://i.pravatar.cc/100?u=ans1' },
      content: '关于这个问题，我觉得核心不在于你用的渲染引擎多高级，而在于你的 “Design Decision” 是否建立在扎实的用户调研之上。在伦敦艺术大学（UAL）或者皇家艺术学院（RCA）的交互设计评审中，面试官通常会问你：“Why this? Why now?”。如果你能从叙事深度出发，解释为什么在特定的节点选择了这种多维度的感官反馈，即使技术广度稍微逊色，也会让你的作品集脱颖而出。'
    },
    {
      id: 2,
      author: { name: '李老师 (Creative Tech)', role: 'Senior Mentor', avatar: 'https://i.pravatar.cc/100?u=ans2' },
      content: '跨学科的尝试非常值得鼓励。建议在作品集中加入一个关于失败尝试的章节，这反而能体现你的反思深度。不仅仅是 App，更关注跨媒介的整体体验。'
    }
  ]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSend = () => {
    if (!commentInput.trim() || isSending) return;
    
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      const newAnswer = {
        id: Date.now(),
        author: { name: '我', role: 'Contributor', avatar: 'https://i.pravatar.cc/100?u=me' },
        content: commentInput
      };
      setLocalAnswers([newAnswer, ...localAnswers]);
      setIsSending(false);
      setCommentInput('');
      showToast('评论已发布 (Published)');
    }, 1000);
  };

  const handleLike = (id: number) => {
    setLikedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
    if (!likedAnswers[id]) {
      showToast('已点赞 (Liked)');
    }
  };

  const handleUseful = (id: number) => {
    setUsefulCounts(prev => ({
      ...prev,
      [id]: prev[id] + 1
    }));
    showToast('收录到有用内容 (Marked as Useful)');
  };

  const handleShare = () => {
    showToast('链接已复制到剪贴板', 'info');
  };

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
            <button 
              onClick={handleShare}
              className="p-3 hover:bg-black/5 rounded-full transition-all text-ink/40 hover:text-cobalt"
            >
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
          
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-ink italic leading-tight">
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
            <button 
              onClick={() => {
                setIsFollowed(!isFollowed);
                showToast(isFollowed ? '已取消关注话题' : '已关注话题', 'success');
              }}
              className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                isFollowed ? "text-ink/40" : "text-cobalt underline underline-offset-4"
              )}
            >
              {isFollowed ? '已关注话题' : '关注话题'}
            </button>
          </div>
        </div>
      </section>

      {/* Answers Section */}
      <main className="max-w-4xl mx-auto px-8 mt-24 space-y-16">
        <div className="flex items-center justify-between border-b border-silver/30 pb-6">
          <h3 className="text-sm font-bold text-ink uppercase tracking-widest">精选回答 (14 Answers)</h3>
          <div className="flex items-center gap-6">
            <span 
              onClick={() => setActiveTab('hot')}
              className={cn(
                "text-[10px] font-bold cursor-pointer transition-colors",
                activeTab === 'hot' ? "text-ink" : "text-ink/20 hover:text-ink"
              )}
            >
              最热
            </span>
            <span 
              onClick={() => setActiveTab('latest')}
              className={cn(
                "text-[10px] font-bold cursor-pointer transition-colors",
                activeTab === 'latest' ? "text-ink" : "text-ink/20 hover:text-ink"
              )}
            >
              最新
            </span>
          </div>
        </div>

        <div className="space-y-16">
          {[...localAnswers].sort((a, b) => {
            if (activeTab === 'latest') return b.id - a.id;
            // For 'hot', we just keep original or could sort by useful counts if available
            return 0; 
          }).map((answer, i) => (
            <div key={answer.id} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => onAuthorClick?.(`advisor-${answer.id}`)}
                      className="cursor-pointer group"
                    >
                      <img src={answer.author.avatar} className="w-14 h-14 rounded-2xl border border-silver/20 group-hover:scale-105 group-hover:border-cobalt transition-all" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div 
                      onClick={() => onAuthorClick?.(`advisor-${answer.id}`)}
                      className="cursor-pointer"
                    >
                      <h4 className="text-base font-bold text-ink italic hover:text-cobalt transition-colors">{answer.author.name}</h4>
                      <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest">{answer.author.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onOpenChat(`advisor-${answer.id}`, answer.author.name, answer.author.avatar, '导师')}
                    className="flex items-center gap-3 px-6 py-2.5 bg-silver/5 hover:bg-cobalt hover:text-white rounded-full text-[9px] font-bold uppercase tracking-widest transition-all"
                  >
                    <UserPlus size={14} /> 咨询TA
                  </button>
                </div>

               <div className="text-lg text-ink/60 font-light leading-relaxed prose prose-ink">
                  <p>{answer.content}</p>
               </div>

               <div className="flex items-center justify-between pt-8 border-t border-silver/10">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleUseful(answer.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-cobalt/5 text-cobalt rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all"
                    >
                       有用 ({usefulCounts[answer.id] || 0})
                    </button>
                    <button 
                      onClick={() => handleLike(answer.id)}
                      className={cn(
                        "p-3 transition-colors",
                        likedAnswers[answer.id] ? "text-red-500 fill-red-500" : "text-ink/30 hover:text-red-500"
                      )}
                    >
                       <Heart size={18} />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-3 text-ink/30 hover:text-cobalt"
                    >
                       <Share2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-ink/20 cursor-pointer hover:text-cobalt transition-colors" onClick={() => setCommentInput(`@${answer.author.name} `)}>
                     <MessageSquare size={16} />
                     <span className="text-[10px] font-bold uppercase">12 条追问</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sticky Bottom Answer Bar */}
      <div className="fixed bottom-0 inset-x-0 h-32 bg-white/80 backdrop-blur-3xl border-t border-silver/30 z-[100] flex items-center px-8">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-6">
           <div className="flex-1 relative">
             <input 
               type="text" 
               value={commentInput}
               onChange={(e) => setCommentInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="写下你的见解，与顶尖创作者同步..." 
               className="w-full h-16 bg-porcelain px-8 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cobalt/20 border border-silver/20"
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                 <button className="p-2 text-ink/20 hover:text-ink"><MessageSquare size={18} /></button>
             </div>
           </div>
           <button 
             onClick={handleSend}
             disabled={!commentInput.trim() || isSending}
             className={cn(
               "w-16 h-16 bg-ink text-white rounded-2xl flex items-center justify-center transform transition-all active:scale-95 shadow-3xl shadow-cobalt/20",
               (!commentInput.trim() || isSending) ? "opacity-50 cursor-not-allowed" : "hover:bg-cobalt"
             )}
           >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
           </button>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 px-8 py-4 bg-ink text-white rounded-2xl shadow-4xl z-[110] flex items-center gap-3"
          >
            {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="text-cobalt" /> : <Share2 size={18} className="text-cobalt" />}
            <span className="text-[10px] font-black uppercase tracking-widest italic">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronLeft, Heart, MessageCircle, MessageSquare, Share2, Bookmark, Send, ExternalLink, Copy, Check, X, CheckCircle2, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../types';
import { cn } from '../lib/utils';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

const ShareSheet = ({ isOpen, onClose, post }: ShareSheetProps) => {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    { name: '微信', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670183.png', color: 'bg-green-50' },
    { name: '朋友圈', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670183.png', color: 'bg-green-100' },
    { name: '微博', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111710.png', color: 'bg-red-50' },
    { name: '小红书', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670183.png', color: 'bg-red-100' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-[101] shadow-2xl p-10 lg:p-16"
          >
            <div className="max-w-xl mx-auto space-y-12">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-ink italic">分享艺术感悟</h3>
                <button onClick={onClose} className="p-2 bg-silver/20 rounded-full hover:bg-silver/40 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-8">
                {shareOptions.map((opt) => (
                  <button key={opt.name} className="flex flex-col items-center gap-3 group">
                    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm", opt.color)}>
                      <img src={opt.icon} alt={opt.name} className="w-10 h-10 object-contain transition-all" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">{opt.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-silver/30">
                <button 
                  onClick={handleCopyLink}
                  className="w-full h-16 bg-porcelain rounded-2xl flex items-center px-6 justify-between group hover:bg-silver/20 transition-all border border-silver/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-cobalt shadow-sm">
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </div>
                    <span className="text-xs font-bold text-ink/60 uppercase tracking-widest">
                      {copied ? '已复制链接' : '复制作品链接'}
                    </span>
                  </div>
                  <ExternalLink size={18} className="text-ink/20 group-hover:text-cobalt transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface PostDetailViewProps {
  post: Post;
  onBack: () => void;
  onAuthorClick: (userId: string) => void;
  onArticleClick?: (articleId: string) => void;
  onCommunityClick?: () => void;
}

export const PostDetailView = ({ post, onBack, onAuthorClick, onArticleClick, onCommunityClick }: PostDetailViewProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState(1); // 0: Retweet, 1: Comment, 2: Like
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [localComments, setLocalComments] = useState(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    
    const newComment = {
      id: `local-${Date.now()}`,
      author: {
        name: '我',
        avatar: 'https://i.pravatar.cc/100?u=me'
      },
      content: commentInput,
      timestamp: '刚刚',
      likes: 0
    };

    setLocalComments([newComment, ...localComments]);
    setCommentInput('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleCommentLike = (commentId: string) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  return (
    <div className="bg-[#f8f8f8] min-h-screen selection:bg-cobalt selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-silver/10 px-4 md:px-8 py-2 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-4">
          <button 
            onClick={onBack} 
            className="p-2 -ml-1 text-ink/60 hover:text-ink hover:bg-porcelain rounded-full transition-all active:scale-95"
          >
            <ChevronLeft size={22} md:size={24} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onAuthorClick(post.author.name)}>
            <img src={post.author.avatar} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-silver/10 group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <h3 className="text-[13px] md:text-base font-black text-ink tracking-tight group-hover:text-cobalt transition-colors">{post.author.name}</h3>
                <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-orange-400 rounded-full flex items-center justify-center text-[7px] md:text-[8px] text-white italic font-black shadow-sm">V</div>
              </div>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-ink/20 leading-none">Perspective</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-3">
          <button 
            onClick={() => setIsShareOpen(true)}
            className="p-2 text-ink/40 hover:text-cobalt hover:bg-porcelain rounded-full transition-all active:scale-90"
          >
            <Share2 size={18} md:size={20} />
          </button>
          <button className="p-2 text-ink/40 hover:bg-porcelain rounded-full transition-all active:scale-90">
             <div className="flex flex-col gap-0.5 md:gap-1">
               <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-ink/40 rounded-full" />
               <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-ink/40 rounded-full" />
               <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-ink/40 rounded-full" />
             </div>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 px-0 lg:px-8 lg:pt-8">
        <div className="flex-1 bg-white min-h-[calc(100vh-120px)] shadow-sm lg:rounded-[3rem] overflow-hidden border-x lg:border border-silver/10">
          {/* Main Content Area */}
          <div className="p-5 md:p-10 space-y-8">
            {/* User Info Header in Content */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-5">
                <img 
                  src={post.author.avatar} 
                  alt="" 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] object-cover border border-silver/10 cursor-pointer shadow-sm active:scale-95 transition-transform" 
                  onClick={() => onAuthorClick(post.author.id)}
                  referrerPolicy="no-referrer" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="text-base md:text-xl font-black text-[#fa7d3c] cursor-pointer hover:underline"
                      onClick={() => onAuthorClick(post.author.id)}
                    >
                      {post.author.name}
                    </span>
                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-orange-400 rounded-full flex items-center justify-center text-[7px] md:text-[8px] text-white italic font-black shadow-sm">V</div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] md:text-sm text-ink/30 font-medium uppercase tracking-[0.1em]">{post.timestamp}</span>
                    <div className="w-1 h-1 rounded-full bg-silver/30" />
                    <span className="text-[10px] md:text-sm text-ink/30 font-medium italic">来自 深度专栏</span>
                  </div>
                </div>
              </div>
              <button className="px-5 md:px-8 py-2 md:py-3 border-2 border-[#fa7d3c] text-[#fa7d3c] text-[10px] md:text-xs font-black rounded-full hover:bg-orange-50 transition-all active:scale-95 uppercase tracking-widest shadow-sm shadow-orange-100">+ Follow</button>
            </div>

            {/* Text Content */}
            <div className="space-y-4 md:space-y-6">
              <div className="text-[16px] md:text-2xl text-ink leading-relaxed break-words whitespace-pre-wrap font-serif italic">
                {post.content.split('#')[0]}
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 text-[#fa7d3c]">
                {post.content.split('#').slice(1).map((tag, i) => (
                  <span key={i} className="text-xs md:text-xl font-black italic hover:underline cursor-pointer tracking-tight">#{tag.trim()}</span>
                ))}
              </div>
            </div>

            {/* Grid of Images */}
            <div className={cn(
              "grid gap-3 md:gap-4 mt-8",
              post.images.length === 1 ? "grid-cols-1" : 
              post.images.length === 2 ? "grid-cols-2" : 
              "grid-cols-3"
            )}>
              {post.images.map((img, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className={cn(
                    "overflow-hidden bg-porcelain cursor-pointer group relative shadow-inner",
                    post.images.length === 1 ? "rounded-3xl max-h-[600px]" : "aspect-square rounded-2xl md:rounded-[2rem]"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Related Recommendations for Mobile */}
          <div className="lg:hidden p-5 md:p-10 space-y-10 border-t border-silver/10 mt-10">
             <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-ink/20 italic">Recommended Reading</h4>
             <div className="grid grid-cols-1 gap-6 md:gap-8">
                {[1, 2].map(i => (
                  <div 
                    key={i} 
                    onClick={() => onArticleClick?.(String(i))}
                    className="flex gap-4 md:gap-6 group active:scale-98 transition-all px-1"
                  >
                    <img src={`https://picsum.photos/seed/${i + 20}/200/200`} className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] object-cover shadow-md grayscale group-hover:grayscale-0 transition-all" alt="" />
                    <div className="flex-1 space-y-2">
                       <p className="text-sm md:text-xl font-black italic leading-tight group-hover:text-[#fa7d3c] transition-colors line-clamp-2">
                         2026 艺术市场深度研报：从数字孪生到物理共生的引力迁移。
                       </p>
                       <div className="flex items-center gap-3 text-[7px] md:text-xs font-black text-ink/20 uppercase tracking-[0.3em]">
                          <span>3.1K Views</span>
                          <div className="w-1 h-1 rounded-full bg-silver" />
                          <span>Report</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
             
             <div 
               onClick={() => onCommunityClick?.()}
               className="bg-[#fa7d3c] p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl shadow-orange-200/50 space-y-4 md:space-y-6 relative overflow-hidden active:scale-95 transition-all group"
             >
                <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform">
                  <TrendingUp size={100} />
                </div>
                <h4 className="text-xl md:text-3xl font-serif font-black italic relative z-10 leading-tight">加入学术社群<br/><span className="text-white/40">Exclusive Insight</span></h4>
                <p className="text-[9px] md:text-xs uppercase font-black tracking-[0.4em] md:tracking-[0.6em] relative z-10 opacity-70">Lab Access Priority</p>
             </div>
          </div>

          {/* Interaction Tabs */}
          <div className="flex border-b border-silver/5 mt-10 sticky top-[52px] md:top-[72px] bg-white/90 backdrop-blur-3xl z-20">
            {[`转发 0`, `评论 ${post.commentsCount + localComments.length - (post.comments?.length || 0)}`, `赞 ${post.likes + (isLiked ? 1 : 0)}`].map((tab, i) => (
              <button 
                key={i}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "flex-1 py-5 text-[11px] md:text-base font-black text-center transition-all relative uppercase tracking-widest",
                  activeTab === i ? "text-ink" : "text-ink/20"
                )}
              >
                {tab.split(' ')[0]} <span className="font-mono text-[9px] md:text-xs bg-porcelain px-2 py-0.5 rounded-full ml-1 opacity-50">{tab.split(' ')[1]}</span>
                {activeTab === i && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 md:w-12 h-[3px] bg-[#fa7d3c] rounded-full" />}
              </button>
            ))}
          </div>

          {/* Dynamic Content Section based on Tabs */}
          <div className="min-h-[400px] bg-porcelain/30">
            {activeTab === 1 ? (
              <div className="p-5 md:p-10 space-y-10">
                {localComments.length > 0 ? (
                  localComments.map(comment => (
                    <motion.div 
                      key={comment.id} 
                      className="flex gap-4 md:gap-6 group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <img 
                        src={comment.author.avatar} 
                        alt="" 
                        className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover shrink-0 cursor-pointer border border-silver/10 shadow-sm active:scale-95 transition-transform" 
                        onClick={() => onAuthorClick(comment.author.name)}
                        referrerPolicy="no-referrer" 
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span 
                              className="text-[13px] md:text-base font-black text-[#fa7d3c] cursor-pointer hover:underline"
                              onClick={() => onAuthorClick(comment.author.name)}
                            >
                              {comment.author.name}
                            </span>
                            <p className="text-sm md:text-xl text-ink/80 leading-relaxed font-light italic">{comment.content}</p>
                          </div>
                          <button 
                            onClick={() => toggleCommentLike(comment.id)}
                            className={cn("flex flex-col items-center gap-1 transition-all active:scale-90 p-2 -mr-2", likedComments[comment.id] ? "text-red-500" : "text-ink/20 hover:text-red-500")}
                          >
                            <Heart size={16} md:size={18} fill={likedComments[comment.id] ? "currentColor" : "none"} />
                            <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{12 + (likedComments[comment.id] ? 1 : 0)}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-medium text-ink/20 uppercase tracking-widest">{comment.timestamp}</span>
                          <button className="text-[10px] font-black uppercase text-[#fa7d3c] tracking-[0.2em] hover:opacity-80 active:scale-95">Reply</button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-32 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-porcelain rounded-[2.5rem] flex items-center justify-center text-ink/10 shadow-inner">
                      <MessageCircle size={32} />
                    </div>
                    <p className="text-xs md:text-lg text-ink/20 font-black uppercase tracking-[0.4em] italic leading-tight">No Insights Yet<br/>Claim the Space First</p>
                  </div>
                )}
              </div>
            ) : activeTab === 0 ? (
              <div className="py-40 text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-porcelain rounded-[2.5rem] flex items-center justify-center text-ink/10 shadow-inner">
                  <Share2 size={32} />
                </div>
                <p className="text-xs md:text-lg text-ink/20 font-black uppercase tracking-[0.4em] italic">Zero Retransmissions</p>
              </div>
            ) : (
              <div className="p-8 md:p-16 space-y-12">
                <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-10 gap-3 md:gap-5">
                   {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <img 
                          src={`https://i.pravatar.cc/100?u=like${i}`} 
                          className="w-full aspect-square rounded-2xl border border-silver/10 object-cover cursor-pointer hover:border-cobalt hover:scale-110 transition-all shadow-sm" 
                          alt="" 
                          referrerPolicy="no-referrer" 
                        />
                      </motion.div>
                   ))}
                </div>
                <div className="py-10 text-center border-t border-silver/10">
                  <p className="text-sm md:text-xl text-ink/20 font-serif italic">
                    Backed by <span className="text-ink/60 font-black tracking-tight">{post.likes + (isLiked ? 1 : 0)} visionary creators</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sidebar (Related) */}
        <aside className="hidden lg:block w-96 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-silver/10 shadow-sm space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-ink/20 italic">Curated Connections</h4>
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  onClick={() => onArticleClick?.(String(i))}
                  className="flex gap-4 group cursor-pointer active:scale-98 transition-all"
                >
                  <img src={`https://picsum.photos/seed/${i}/120/120`} className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-md" alt="" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-black line-clamp-2 leading-tight group-hover:text-[#fa7d3c] transition-all duration-300 italic">如何评价 2026 年威尼斯双年展的展馆布局？</p>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-ink/20">
                       <span>2.4k Access</span>
                       <div className="w-0.5 h-0.5 bg-silver rounded-full" />
                       <span>Perspective</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div 
            onClick={() => onCommunityClick?.()}
            className="bg-[#fa7d3c] p-10 rounded-[3rem] text-white shadow-2xl shadow-orange-200 space-y-6 relative overflow-hidden group cursor-pointer hover:shadow-orange-300/50 transition-all"
          >
            <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700">
              <TrendingUp size={120} />
            </div>
            <h4 className="text-2xl font-serif font-black italic relative z-10 leading-tight">加入学术社群<br/><span className="text-white/40">Lab Access</span></h4>
            <p className="text-[10px] uppercase font-black tracking-[0.5em] relative z-10 opacity-70 uppercase tracking-widest">Priority Pass Membership</p>
            <button className="w-full py-5 bg-white text-ink rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] hover:bg-ink hover:text-white transition-all shadow-lg active:scale-95 relative z-10">
              Apply Now
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom Sticky Interaction Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-3xl border-t border-silver/10 px-4 md:px-8 py-2 md:py-4 z-[60] flex items-center gap-3">
        <div className="flex-1 relative flex items-center">
          <input 
            type="text" 
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
            placeholder="Share your perspective..."
            className="w-full h-10 md:h-12 bg-porcelain rounded-full px-5 pr-12 text-sm md:text-base font-medium text-ink placeholder:text-ink/20 focus:outline-none focus:ring-1 focus:ring-[#fa7d3c]/20 transition-all"
          />
          <MessageSquare size={16} className="absolute right-5 text-ink/20" />
        </div>
        
        <button 
          onClick={handleSendComment}
          disabled={!commentInput.trim()}
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all active:scale-90",
            commentInput.trim() ? "bg-[#fa7d3c] text-white shadow-lg shadow-orange-200" : "bg-porcelain text-ink/20"
          )}
        >
          <Send size={18} md:size={20} />
        </button>

        <div className="flex items-center gap-4 md:gap-8 ml-2 mr-2">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={cn("transition-all active:scale-90 p-2 hover:bg-porcelain rounded-full", isLiked ? "text-red-500" : "text-ink/40")}
          >
            <Heart size={22} md:size={24} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => setIsShareOpen(true)}
            className="text-ink/40 p-2 hover:bg-porcelain rounded-full active:scale-90 transition-all font-black uppercase tracking-tighter"
          >
            <Share2 size={22} md:size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 px-6 py-3 bg-ink text-white rounded-2xl shadow-xl z-[70] flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="text-[#fa7d3c]" />
            <span className="text-[11px] font-bold tracking-widest uppercase">发布成功 (Published)</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareSheet 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        post={post} 
      />
    </div>
  );
};

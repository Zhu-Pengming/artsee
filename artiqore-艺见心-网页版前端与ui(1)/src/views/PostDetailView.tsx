import React, { useState } from 'react';
import { ChevronLeft, Heart, MessageCircle, Share2, Bookmark, Send, ExternalLink, Copy, Check, X } from 'lucide-react';
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
                      <img src={opt.icon} alt={opt.name} className="w-10 h-10 object-contain grayscale transition-all group-hover:grayscale-0" referrerPolicy="no-referrer" />
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
}

export const PostDetailView = ({ post, onBack, onAuthorClick }: PostDetailViewProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="bg-porcelain min-h-screen selection:bg-cobalt selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/50 backdrop-blur-2xl border-b border-silver/30 px-8 py-6 flex items-center justify-between">
        <button onClick={onBack} className="p-3 -ml-3 hover:bg-black/5 rounded-full transition-all group">
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onAuthorClick(post.author.name)}>
          <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover border border-white shadow-sm" referrerPolicy="no-referrer" />
          <div>
            <h3 className="text-sm font-bold text-ink tracking-tight group-hover:text-cobalt transition-colors">{post.author.name}</h3>
            <p className="text-[9px] text-ink/40 font-bold uppercase tracking-[0.2em] leading-none mt-1">{post.author.type}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsShareOpen(true)}
          className="p-3 bg-black/5 rounded-full hover:bg-cobalt hover:text-white transition-all"
        >
          <Share2 size={20} />
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-20 lg:grid lg:grid-cols-12 lg:gap-24">
        {/* Left: Images */}
        <div className="lg:col-span-7 space-y-12">
          {post.images.map((img, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="rounded-[3rem] overflow-hidden shadow-2xl border border-white"
            >
              <img src={img} alt="" className="w-full h-auto object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" referrerPolicy="no-referrer" />
            </motion.div>
          ))}
        </div>

        {/* Right: Content & Comments */}
        <div className="lg:col-span-5 mt-16 lg:mt-0 space-y-20">
          <section className="space-y-12">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cobalt font-bold uppercase tracking-[0.4em] bg-cobalt/5 px-6 py-2.5 rounded-full border border-cobalt/10">
                {post.type}
              </span>
              <span className="text-[10px] text-ink/20 font-bold uppercase tracking-[0.2em]">{post.timestamp}</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-serif font-light leading-[1.1] italic text-ink tracking-tight">
                {post.content.split('#')[0]}
              </h1>
              <div className="flex flex-wrap gap-3">
                {post.content.split('#').slice(1).map((tag, i) => (
                  <span key={i} className="text-xs font-bold text-cobalt/40 uppercase tracking-widest hover:text-cobalt cursor-pointer">#{tag.trim()}</span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-10 py-10 border-y border-silver/50">
               <button onClick={() => setIsLiked(!isLiked)} className={cn("flex items-center gap-3 transition-all hover:scale-110", isLiked ? "text-red-500" : "text-ink/40 hover:text-red-500")}>
                  <Heart size={28} fill={isLiked ? "currentColor" : "none"} strokeWidth={1.5} />
                  <span className="font-bold text-lg tracking-tighter">{post.likes + (isLiked ? 1 : 0)}</span>
               </button>
               <button className="flex items-center gap-3 text-ink/40 hover:text-cobalt transition-all hover:scale-110">
                  <MessageCircle size={28} strokeWidth={1.5} />
                  <span className="font-bold text-lg tracking-tighter">{post.commentsCount}</span>
               </button>
               <button className="flex items-center gap-3 text-ink/40 hover:text-cobalt transition-all ml-auto hover:bg-black/5 p-4 rounded-2xl">
                  <Bookmark size={28} strokeWidth={1.5} />
               </button>
            </div>
          </section>

          {/* Comments */}
          <section className="space-y-12">
            <div className="flex justify-between items-baseline border-b border-silver/50 pb-6">
              <h3 className="text-xl font-serif font-light italic text-ink">评论与见地</h3>
              <span className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Discussion · {post.commentsCount}</span>
            </div>
            
            <div className="space-y-10">
              {post.comments.length > 0 ? (
                post.comments.map(comment => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={comment.id} 
                    className="flex gap-6 group"
                  >
                    <img src={comment.author.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all border border-white shadow-sm" referrerPolicy="no-referrer" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-ink tracking-tight">{comment.author.name}</span>
                        <span className="text-[9px] text-ink/20 font-bold uppercase tracking-widest">{comment.timestamp}</span>
                      </div>
                      <p className="text-[15px] text-ink/60 leading-relaxed font-light">{comment.content}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 bg-porcelain rounded-[3rem] text-center border-2 border-dashed border-silver/50">
                  <p className="text-[10px] text-ink/20 font-bold uppercase tracking-[0.4em]">虚位以待 · 虚席以听</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="sticky bottom-10 bg-white/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white shadow-2xl shadow-black/5 flex items-center gap-6">
              <img src="https://i.pravatar.cc/150?u=me" alt="" className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-white shadow-sm" referrerPolicy="no-referrer" />
              <input 
                type="text" 
                placeholder="共鸣，或是独到见解..." 
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm placeholder:text-ink/20 font-light"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
              />
              <button className={cn(
                "h-14 px-8 rounded-2xl transition-all text-[10px] font-bold uppercase tracking-widest",
                commentInput.trim() ? "bg-cobalt text-white shadow-xl shadow-cobalt/30 active:scale-95" : "bg-black/5 text-ink/20 pointer-events-none"
              )}>
                发表
              </button>
            </div>
          </section>
        </div>
      </div>

      <ShareSheet 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        post={post} 
      />
    </div>
  );
};

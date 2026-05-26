// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Heart, MessageCircle, Share2, Bookmark, ArrowRight, X, Copy, Check, ExternalLink, Sparkles, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { MOCK_POSTS } from '../data';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ChatUser, Post } from '../types';

// Share Sheet Component
interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

const ShareSheet = ({ isOpen, onClose, post }: ShareSheetProps) => {
  const [copied, setCopied] = useState(false);
  if (!post) return null;

  const shareOptions = [
    { name: '微信', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670183.png', color: 'bg-green-50' },
    { name: '朋友圈', icon: 'https://cdn-icons-png.flaticon.com/512/2108/2108620.png', color: 'bg-green-100' },
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
                      <img src={opt.icon} alt={opt.name} className="w-10 h-10 object-contain transition-all" />
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

const TABS = ['推荐', '关注', '同城', '热门'];

const EXHIBITIONS = [
  { title: '解构青花：数字维度的传统重塑', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1200' },
  { title: '媒介考古：模拟时代的感官记忆', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200' },
  { title: '光影变迁：数字边界的叙事空间', img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1200' },
  { title: '赛博禅意：机械冥想与算法秩序', img: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=1200' },
  { title: '无尽之维：数学拓扑的视觉实验', img: 'https://images.unsplash.com/photo-1515405299443-f71bb76807d5?auto=format&fit=crop&q=80&w=1200' },
  { title: '生态共生：生物艺术的感官拓展', img: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=1200' },
];

const AutoSlider = ({ onExhibitionClick }: { onExhibitionClick: (id: string) => void }) => {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % EXHIBITIONS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (containerRef.current) {
      isAutoScrolling.current = true;
      const cardWidth = containerRef.current.offsetWidth * 0.85; 
      containerRef.current.scrollTo({
        left: index * (cardWidth + 12),
        behavior: 'smooth'
      });
      const timer = setTimeout(() => {
        isAutoScrolling.current = false;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [index]);

  const handleScroll = () => {
    if (!containerRef.current || isAutoScrolling.current) return;
    const scrollPos = containerRef.current.scrollLeft;
    const cardWidth = containerRef.current.offsetWidth * 0.85;
    const curIndex = Math.round(scrollPos / (cardWidth + 12));
    if (curIndex !== index && curIndex >= 0 && curIndex < EXHIBITIONS.length) {
      setIndex(curIndex);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-ink italic">热门展厅</h3>
          <p className="text-ink/40 text-[8px] md:text-[9px] tracking-widest uppercase mt-0.5 whitespace-nowrap">Virtual Halls • Discovery</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => setIndex((prev) => (prev - 1 + EXHIBITIONS.length) % EXHIBITIONS.length)}
            className="p-2 rounded-full border border-silver/50 text-ink/40 hover:bg-ink hover:text-white transition-all shadow-sm"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <button 
            onClick={() => setIndex((prev) => (prev + 1) % EXHIBITIONS.length)}
            className="p-2 rounded-full border border-silver/50 text-ink/40 hover:bg-ink hover:text-white transition-all shadow-sm"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>
      
      <div 
        className="relative"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 md:gap-5 -mx-4 px-4 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {EXHIBITIONS.map((exh, i) => (
            <div 
              key={i}
              className="min-w-[85%] md:min-w-[260px] h-32 md:h-56 snap-center bg-silver/10 rounded-xl md:rounded-2xl overflow-hidden shadow-sm md:shadow-md cursor-pointer relative shrink-0 transition-all duration-500 md:hover:shadow-lg md:active:scale-[0.98] will-change-transform group"
              onClick={() => onExhibitionClick(`exh-${exh.title}`)}
            >
              <img 
                src={exh.img} 
                alt={exh.title} 
                className="w-full h-full object-cover md:brightness-90 md:group-hover:brightness-100 transition-all duration-1000"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                loading="lazy"
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '1';
                }}
                style={{ opacity: 0 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
                <h4 className="text-white font-serif font-bold text-sm md:text-xl italic leading-tight">
                  {exh.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-2">
                   <div className="w-1 h-1 rounded-full bg-cobalt animate-pulse"></div>
                   <span className="text-[6px] md:text-[9px] text-white/60 font-bold uppercase tracking-widest leading-none">Live Now</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Dots */}
        <div className="flex justify-center gap-1.5 mt-3 md:hidden">
          {EXHIBITIONS.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setIndex(i)}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === index ? "w-4 bg-cobalt" : "w-1.5 bg-silver/40"
              )} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const FeedView = ({ 
  onChatRequest,
  onPostClick,
  onUserClick,
  onExhibitionClick,
  onViewChange,
  onComparisonOpen,
  posts = MOCK_POSTS
}: { 
  onChatRequest: (user: ChatUser) => void,
  onPostClick: (postId: string) => void,
  onUserClick: (userId: string) => void,
  onExhibitionClick: (id: string) => void,
  onViewChange: (view: string) => void,
  onComparisonOpen: () => void,
  posts?: Post[]
}) => {
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const feedPosts = Array.isArray(posts) && posts.length > 0 ? posts : MOCK_POSTS;

  return (
    <div className="space-y-4 md:space-y-12">
      {/* Comparison Center CTA */}
      <section 
        onClick={onComparisonOpen}
        className="group relative h-32 md:h-[320px] rounded-xl md:rounded-[2.5rem] bg-ink overflow-hidden cursor-pointer shadow-xl border border-white/5 hover:border-cobalt/30 transition-all duration-1000 active:scale-100 md:active:scale-[0.99]"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-1/4 -right-1/4 w-full h-[150%] bg-gradient-to-bl from-cobalt/30 via-transparent to-transparent blur-[100px] mix-blend-screen pointer-events-none transition-all duration-1000 group-hover:from-cobalt/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000 group-hover:scale-110">
           <span className="text-[8rem] md:text-[10rem] font-black italic tracking-tighter text-white opacity-[0.02] select-none group-hover:opacity-[0.04] transition-opacity">VS</span>
        </div>

        <div className="h-full flex items-center justify-between px-6 md:px-16 relative z-10">
          <div className="space-y-3 md:space-y-6 max-w-4xl">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-6 h-[1px] bg-cobalt/50 group-hover:w-10 transition-all duration-700" />
              <div className="flex items-center gap-2 text-cobalt">
                <Sparkles size={12} className="animate-pulse" />
                <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] italic opacity-80 leading-none">Intelligence Engine</span>
              </div>
            </motion.div>
            
            <div className="space-y-1 md:space-y-3">
              <h3 className="text-xl md:text-5xl font-serif font-light text-white italic tracking-tighter leading-[1] transition-all duration-700 group-hover:translate-x-2">
                院校智能<br />
                <span className="text-white/20 group-hover:text-white/40 transition-colors">对比中心</span>
              </h3>
              <p className="text-white/20 text-[10px] md:text-sm font-light max-w-md hidden sm:block italic leading-tight border-l border-white/5 pl-4 ml-1">
                多维指标量化分析，AI 实时推演择校逻辑。
              </p>
            </div>
            
            <div className="flex gap-4 pt-1">
              <button className="bg-white text-ink px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-full text-[8px] font-bold uppercase tracking-[0.2em] hover:bg-cobalt hover:text-white transition-all duration-700 shadow-xl group/btn relative overflow-hidden">
                <span className="relative z-10">立即开启</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="hidden xl:flex -space-x-8 perspective-1000 scale-[0.8]">
                {[1,2,3,4,5].map(i => (
                  <motion.div 
                    key={i} 
                    initial={{ rotateY: 30, rotateZ: (i - 3) * 10 }}
                    animate={{ rotateY: 0, rotateX: 0 }}
                    whileHover={{ y: -20, scale: window.innerWidth > 768 ? 1.15 : 1.0, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                    className="w-20 h-32 rounded-[1.5rem] border-[3px] border-ink bg-white overflow-hidden shadow-2xl transition-all duration-700"
                  >
                    <img src={`https://picsum.photos/seed/academy-hq-${i}/200/300`} alt="" className="w-full h-full object-cover md:brightness-90 md:group-hover:brightness-105 transition-all duration-1000" />
                  </motion.div>
                ))}
             </div>
             <motion.div 
               whileHover={{ 
                 scale: typeof window !== 'undefined' && window.innerWidth > 768 ? 1.1 : 1.0, 
                 rotate: typeof window !== 'undefined' && window.innerWidth > 768 ? 90 : 0 
               }} 
               className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white group-hover:bg-cobalt transition-all shadow-xl"
             >
                <ArrowRight size={24} className="group-hover:-rotate-45 transition-transform duration-500" />
             </motion.div>
          </div>
        </div>
      </section>

      {/* Banner / Hero */}
      <section className="relative h-32 md:h-56 rounded-xl md:rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer border border-white/5 transition-all active:scale-100 md:active:scale-[0.995]">
        <img 
          src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1500" 
          alt="Hero" 
          className="w-full h-full object-cover transition-all duration-1000 md:group-hover:scale-105 brightness-90 group-hover:brightness-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-1000" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-10">
          <motion.div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2">
               <div className="w-4 h-[1px] bg-white/40" />
               <span className="text-white/60 text-[5px] md:text-[6px] font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">Limited Exhibition</span>
            </div>
            <h2 className="text-white text-base md:text-3xl font-light leading-none tracking-tighter italic">
              灵感碎片的万合：<br />
              <span className="text-white/30 italic">青花新境 Digital Archive</span>
            </h2>
            <div className="flex gap-4 items-center pt-0.5 md:pt-1">
                <button onClick={(e) => { e.stopPropagation(); onExhibitionClick('blue-white'); }} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-ink transition-all duration-500">进入 (Access)</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auto Slider */}
      <div className="relative">
        <div className="absolute -top-6 left-0 text-[10px] font-bold uppercase tracking-[0.5em] text-ink/20">Virtual Realms</div>
        <AutoSlider onExhibitionClick={onExhibitionClick} />
      </div>

      {/* Global Academies Feature Section */}
      <section 
        onClick={() => onViewChange('info')}
        className="py-4 px-4 md:px-8 bg-white md:bg-white/50 rounded-xl border border-silver/30 shadow-sm relative overflow-hidden group cursor-pointer hover:border-cobalt/30 transition-all"
      >
         <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-cobalt/[0.02] to-transparent blur-3xl -z-10" />
         <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
            <div className="flex-1 space-y-3">
               <div className="flex items-center gap-2 text-cobalt">
                  <div className="w-4 h-[1px] bg-cobalt/30" />
                  <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-[0.2em] italic opacity-70">Academy Guide</span>
               </div>
               <div className="space-y-1.5">
                <h2 className="text-xl md:text-2xl font-serif font-light text-ink italic leading-tight tracking-tighter">全球院校指南</h2>
                <p className="text-[10px] md:text-xs text-ink/50 font-light leading-relaxed max-w-sm border-l border-cobalt/20 pl-3 italic">精选 70 所世界艺术摇篮，开启您的探索之旅。</p>
               </div>
               <div className="flex items-center gap-4 pt-1">
                 <button onClick={() => onViewChange('info')} className="h-8 md:h-10 px-4 md:px-6 bg-ink text-white rounded-lg text-[8px] font-bold uppercase tracking-[0.1em] hover:bg-cobalt transition-all shadow-md active:scale-100 md:active:scale-95">开启探索</button>
                 <span className="text-[6px] font-bold text-ink/10 uppercase tracking-widest hidden lg:block">Explore elite academies</span>
               </div>
            </div>
            <div className="flex-1 w-full relative perspective-1000">
               <div className="grid grid-cols-2 gap-2 opacity-90 scale-90 lg:scale-100">
                  <div className="space-y-2 pt-4">
                     <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg border border-white/40">
                        <img src="https://picsum.photos/seed/coll-hq-1/400/600" alt="" className="w-full h-full object-cover transition-all duration-1000" />
                     </div>
                     <div className="aspect-square rounded-lg overflow-hidden shadow-lg border border-white/40 translate-x-4 -translate-y-4 scale-105 relative z-10">
                        <img src="https://picsum.photos/seed/coll-hq-2/400/400" alt="" className="w-full h-full object-cover transition-all duration-1000" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="aspect-square rounded-lg overflow-hidden shadow-lg border border-white/40 -translate-x-4 scale-105 relative z-10">
                        <img src="https://picsum.photos/seed/coll-hq-3/400/400" alt="" className="w-full h-full object-cover transition-all duration-1000" />
                     </div>
                     <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg border border-white/40">
                        <img src="https://picsum.photos/seed/coll-hq-4/400/600" alt="" className="w-full h-full object-cover transition-all duration-1000" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Feed Grid */}
      <section className="space-y-4 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-silver/30 pb-3 md:pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <div className="w-4 md:w-6 h-[2px] bg-cobalt" />
               <h3 className="text-xl md:text-2xl font-serif font-light italic text-ink tracking-tight">推荐灵感 / Feeds</h3>
            </div>
            <p className="text-ink/30 text-[6px] md:text-[7px] tracking-[0.3em] uppercase pl-6 md:pl-8">Design Narratives</p>
          </div>
          <button className="bg-porcelain border border-silver hover:border-cobalt/50 text-ink/60 hover:text-cobalt px-4 md:px-6 py-1.5 md:py-2.5 rounded-full text-[7px] md:text-[8px] font-bold flex items-center gap-2 transition-all uppercase tracking-widest group shadow-sm">
            查看更多 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12">
          {feedPosts.map((post, idx) => (
            <motion.article 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              key={post.id} 
              className="group flex flex-col bg-white md:bg-transparent rounded-2xl md:rounded-none p-4 md:p-0 shadow-sm md:shadow-none hover:bg-white/40 md:hover:bg-white/5 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4 md:mb-8 min-h-[48px] md:min-h-0">
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="relative p-0.5 md:p-1 rounded-xl md:rounded-[1.2rem] border border-transparent group-hover:border-cobalt/30 transition-all duration-500 shrink-0">
                    <img 
                      src={post.author.avatar} 
                      className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl object-cover border-2 border-white shadow-md cursor-pointer md:group-hover:scale-105 transition-all duration-700" 
                      referrerPolicy="no-referrer" 
                      alt="" 
                      onClick={() => onUserClick(post.author.id)}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-[#fa7d3c] rounded-full border-[2px] md:border-[3px] border-white shadow-sm flex items-center justify-center text-[7px] md:text-[8px] text-white italic font-black">V</div>
                  </div>
                  <div className="flex flex-col md:h-16 overflow-hidden">
                    <h3 className="text-base md:text-lg font-bold text-ink italic tracking-tight hover:text-[#fa7d3c] cursor-pointer transition-colors line-clamp-1" onClick={() => onUserClick(post.author.id)}>{post.author.name}</h3>
                    <p className="text-xs md:text-sm text-ink/30 font-black uppercase tracking-[0.2em] mt-0.5">{post.author.type}</p>
                  </div>
                </div>
                <button className="text-silver hover:text-cobalt transition-all p-2 md:p-3 hover:bg-cobalt/5 rounded-xl md:rounded-2xl active:scale-90"><Bookmark size={18} /></button>
              </div>

              <div className="mb-4 md:mb-8 md:h-20 overflow-hidden">
                <p className="text-base md:text-xl text-ink/80 md:text-ink/60 leading-relaxed font-light cursor-pointer tracking-tight hover:text-ink transition-colors italic line-clamp-3 md:line-clamp-2" onClick={() => onPostClick(post.id)}>“{post.content}”</p>
              </div>

              {post.images.length > 0 && (
                <div className="w-full aspect-video rounded-2xl md:rounded-[2.5rem] overflow-hidden mb-4 md:mb-8 relative cursor-pointer shadow-md md:shadow-3xl shadow-silver/20 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] transition-all duration-1000 flex-shrink-0" onClick={() => onPostClick(post.id)}>
                  <img src={post.images[0]} className="w-full h-full object-cover scale-100 md:group-hover:scale-110 transition-all duration-1000 ease-out brightness-[0.95] group-hover:brightness-105" referrerPolicy="no-referrer" alt="" />
                  <div className="absolute inset-0 bg-ink/5 group-hover:bg-transparent transition-colors duration-1000" />
                  <div className="absolute bottom-2 left-2 md:bottom-8 md:left-8 right-2 md:right-8 flex justify-between items-end opacity-0 group-hover:opacity-100 translate-y-2 md:translate-y-0 transition-all duration-700">
                     <div className="bg-white/80 backdrop-blur-md px-1.5 py-0.5 md:px-5 md:py-2 rounded md:rounded-xl border border-white/40">
                        <span className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-ink text-center">Open</span>
                     </div>
                  </div>
                </div>
              )}

              <div className="pt-2 md:pt-2 mt-auto">
                  <PostActions post={post} onChatRequest={onChatRequest} onPostClick={onPostClick} onShareClick={() => setSharePost(post)} />
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <ShareSheet isOpen={!!sharePost} onClose={() => setSharePost(null)} post={sharePost} />
    </div>
  );
};

const PostActions = ({ post, onChatRequest, onPostClick, onShareClick }: { post: any, onChatRequest: (user: ChatUser) => void, onPostClick: (postId: string) => void, onShareClick: () => void }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-silver/30">
      <div className="flex gap-4">
        <button onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }} className={cn("flex items-center gap-1.5 transition-colors", isLiked ? "text-red-500" : "text-ink/40 hover:text-red-500")}>
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold">{post.likes + (isLiked ? 1 : 0)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-ink/40 hover:text-cobalt transition-colors" onClick={(e) => { e.stopPropagation(); onPostClick(post.id); }}>
          <MessageCircle size={16} />
          <span className="text-[10px] font-bold">{post.commentsCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-ink/40 hover:text-cobalt transition-colors" onClick={(e) => { e.stopPropagation(); onShareClick(); }}>
          <Share2 size={16} />
        </button>
      </div>
      <span className="text-[10px] text-ink/20 font-medium uppercase tracking-widest">{post.timestamp}</span>
    </div>
  );
};

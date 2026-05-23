import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Heart, MessageCircle, Share2, Bookmark, ArrowRight, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, X, Copy, Check, ExternalLink } from 'lucide-react';
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
                      <img src={opt.icon} alt={opt.name} className="w-10 h-10 object-contain grayscale transition-all group-hover:grayscale-0 focus:grayscale-0" />
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
  { title: '解构青花：数字维度的传统重塑', img: 'https://images.unsplash.com/photo-1626074311105-0255c4d3609c?auto=format&fit=crop&q=80&w=800' },
  { title: '媒介考古：模拟时代的感官记忆', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800' },
  { title: '光影变迁：叙事性空间的数字边界', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800' },
  { title: '赛博禅意：机械冥想与算法秩序', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800' },
  { title: '无尽之维：数学拓扑的视觉实验', img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800' },
  { title: '时间刻度：关于瞬间永恒的定格', img: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80&w=800' },
  { title: '流动叙事：液态美学下的未来想象', img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800' },
  { title: '极简空间：光影与白墙的对话', img: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=800' },
  { title: '生态共生：生物艺术的感官拓展', img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800' },
  { title: '触感边界：软材料与软叙事', img: 'https://images.unsplash.com/photo-1515405299443-673bbec24250?auto=format&fit=crop&q=80&w=800' },
];

const AutoSlider = ({ onExhibitionClick }: { onExhibitionClick: (id: string) => void }) => {
  // Use a triple-cloned array for seamless infinite looping
  const DISPLAY_ITEMS = [...EXHIBITIONS, ...EXHIBITIONS, ...EXHIBITIONS];
  const [index, setIndex] = useState(EXHIBITIONS.length);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const itemPureWidth = 300;
  const gap = 24;
  const itemTotalWidth = itemPureWidth + gap;

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [index, isPaused]);

  const handleNext = () => {
    setIsTransitioning(true);
    setIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setIndex((prev) => prev - 1);
  };

  const checkBoundaries = () => {
    if (index >= EXHIBITIONS.length * 2) {
      setIsTransitioning(false);
      setIndex(EXHIBITIONS.length);
    } else if (index < EXHIBITIONS.length) {
      setIsTransitioning(false);
      setIndex(EXHIBITIONS.length * 2 - 1);
    }
  };

  // Calculate the centered offset
  // We want the viewport center to align with the center of the indexed item
  const centeredX = viewportWidth / 2 - (index * itemTotalWidth + itemPureWidth / 2);

  return (
    <section className="space-y-6" ref={containerRef}>
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-serif font-bold text-ink italic">热门展厅 (Discovery)</h3>
          <p className="text-ink/40 text-[10px] tracking-widest uppercase mt-1">Virtual Exhibition Halls • Exploring Multi-dimensions</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrev}
            className="p-2 rounded-full border border-silver/50 text-ink/40 hover:bg-ink hover:text-white transition-all shadow-sm active:scale-90"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <button 
            onClick={handleNext}
            className="p-2 rounded-full border border-silver/50 text-ink/40 hover:bg-ink hover:text-white transition-all shadow-sm active:scale-90"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>
      
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden -mx-4 px-4 overflow-x-visible"
      >
        <motion.div 
          ref={carousel}
          animate={{ x: centeredX }}
          transition={isTransitioning ? {
            type: "spring",
            stiffness: 70,
            damping: 18,
            mass: 0.8
          } : { duration: 0 }}
          onAnimationComplete={checkBoundaries}
          className="flex gap-6 cursor-grab active:cursor-grabbing"
          style={{ width: DISPLAY_ITEMS.length * itemTotalWidth }}
        >
          {DISPLAY_ITEMS.map((exh, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              animate={{ 
                scale: i === index ? 1 : 0.9
              }}
              className="min-w-[300px] aspect-[16/10] bg-white rounded-[2rem] overflow-hidden shadow-md cursor-pointer relative group shrink-0"
              onClick={() => onExhibitionClick(`exh-${exh.title}`)}
            >
              <img 
                src={exh.img} 
                alt={exh.title} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent flex flex-col justify-end p-6 font-serif">
                <h4 className="text-white font-bold text-lg italic whitespace-nowrap overflow-hidden text-ellipsis border-b border-white/20 pb-2 inline-block w-fit max-w-full">
                  {exh.title}
                </h4>
                <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-1.5 h-1.5 rounded-full bg-cobalt animate-pulse"></div>
                   <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest">Live Now</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export const HomeView = ({ 
  onChatRequest,
  onPostClick,
  onUserClick,
  onExhibitionClick,
  onViewChange
}: { 
  onChatRequest: (user: ChatUser) => void,
  onPostClick: (postId: string) => void,
  onUserClick: (userId: string) => void,
  onExhibitionClick: (id: string) => void,
  onViewChange: (view: string) => void
}) => {
  const [sharePost, setSharePost] = useState<Post | null>(null);

  return (
    <div className="space-y-12">
      {/* Banner / Hero */}
      <section className="relative aspect-[21/9] md:aspect-[25/9] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer">
        <img 
          src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000" 
          alt="Hero" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:brightness-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent flex flex-col justify-end p-8 md:p-20 font-serif">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-cobalt text-[10px] font-bold tracking-[0.4em] mb-4 uppercase">Special / 陶瓷重构专场</span>
            <h2 className="text-white text-5xl md:text-[7rem] font-light leading-[0.85] tracking-tighter mb-12 max-w-4xl italic">
              灵感碎片的万合：<br />
              <span className="text-white/40">青花新境</span>
            </h2>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => onExhibitionClick('blue-white')}
                className="bg-white text-ink px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all duration-500 shadow-2xl"
              >
                立即观展 (Virtual Access)
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Exhibitions Auto Slider */}
      <div className="relative">
        <div className="absolute -top-6 left-0 text-[10px] font-bold uppercase tracking-[0.5em] text-ink/20">Virtual Realms</div>
        <AutoSlider onExhibitionClick={onExhibitionClick} />
      </div>

      {/* Global Academies Feature Section */}
      <section className="py-24 px-12 md:px-20 bg-white rounded-[4rem] border border-silver/30 shadow-2xl shadow-silver/10 relative overflow-hidden group">
         {/* Atmospheric backgrounds */}
         <div className="absolute top-0 right-0 w-[40%] h-full bg-cobalt/5 blur-[120px] -mr-32 -z-10 group-hover:bg-cobalt/10 transition-all duration-1000" />
         
         <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10">
               <div className="flex items-center gap-4 text-cobalt">
                  <div className="w-12 h-[1px] bg-cobalt" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] italic">artiqore Academy Directory</span>
               </div>
               
               <h3 className="text-5xl md:text-7xl font-serif font-light text-ink italic leading-[1.1] tracking-tight">
                 全球顶级<br />艺术院校指南
               </h3>
               
               <p className="text-xl text-ink/40 font-light leading-relaxed max-w-xl">
                 汇集全球 7 大核心艺术产区，精选 70 所影响世界的创意摇篮。从申请门槛到未来趋势，开启您的全球艺术学府探索之旅。
               </p>

               <div className="flex flex-wrap gap-6">
                 <button 
                   onClick={() => onViewChange('info')}
                   className="h-20 px-16 bg-cobalt text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-ink transition-all shadow-2xl shadow-cobalt/20 active:scale-95"
                 >
                    立即探索 (Explore)
                 </button>
                 <div className="flex items-center gap-4 text-ink/20 font-serif italic text-sm py-4">
                    <span>#QS_Top_Ranking</span>
                    <span>•</span>
                    <span>#Design_Excellence</span>
                 </div>
               </div>
            </div>

            <div className="flex-1 w-full max-w-2xl relative">
               <div className="grid grid-cols-2 gap-6 rotate-[-2deg] group-hover:rotate-0 transition-all duration-1000">
                  <div className="space-y-6 pt-12">
                     <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white grayscale group-hover:grayscale-0 transition-all">
                        <img src="https://picsum.photos/seed/college1/600/800" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                     <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white translate-x-12 translate-y-[-24px] grayscale group-hover:grayscale-0 transition-all">
                        <img src="https://picsum.photos/seed/college2/600/600" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white -translate-x-12 grayscale group-hover:grayscale-0 transition-all">
                        <img src="https://picsum.photos/seed/college3/600/600" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                     <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white grayscale group-hover:grayscale-0 transition-all">
                        <img src="https://picsum.photos/seed/college4/600/800" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                  </div>
               </div>
               
               {/* Decorative Badge */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-white rounded-full flex flex-col items-center justify-center p-6 text-center shadow-3xl shadow-silver/30 border border-silver/30 group-hover:scale-110 transition-all">
                  <span className="text-[9px] font-bold text-cobalt uppercase tracking-[0.3em]">Directory</span>
                  <span className="text-4xl font-serif italic text-ink">70+</span>
                  <span className="text-[9px] font-bold text-ink/20 uppercase tracking-[0.2em] mt-1">Institutions</span>
               </div>
            </div>
         </div>
      </section>

      {/* Feed Grid */}
      <section className="space-y-12">
        <div className="flex justify-between items-end border-b border-silver pb-8">
          <div>
            <h3 className="text-4xl font-serif font-light italic">推荐灵感</h3>
            <p className="text-ink/30 text-[10px] tracking-[0.4em] uppercase mt-2">Personalized Design Perspectives</p>
          </div>
          <button className="text-cobalt text-[10px] font-bold flex items-center gap-2 hover:opacity-70 transition-all uppercase tracking-widest group">
            查看更多 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {MOCK_POSTS.map((post, idx) => (
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              key={post.id} 
              className="group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={post.author.avatar} 
                      className="w-12 h-12 rounded-2xl object-cover border border-white shadow-sm cursor-pointer hover:scale-105 transition-all" 
                      referrerPolicy="no-referrer" 
                      alt="" 
                      onClick={() => onUserClick(post.author.name)}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cobalt rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h3 
                      className="text-sm font-bold text-ink underline-offset-4 hover:underline cursor-pointer tracking-tight"
                      onClick={() => onUserClick(post.author.name)}
                    >
                      {post.author.name}
                    </h3>
                    <p className="text-[9px] text-ink/40 font-bold uppercase tracking-widest mt-0.5">{post.author.type}</p>
                  </div>
                </div>
                <button className="text-silver hover:text-cobalt transition-colors p-2 hover:bg-silver/10 rounded-xl">
                  <Bookmark size={18} />
                </button>
              </div>

              {post.images.length > 0 && (
                <div 
                  className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 relative cursor-pointer shadow-sm group-hover:shadow-2xl transition-all duration-700"
                  onClick={() => onPostClick(post.id)}
                >
                  <img src={post.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" alt="" />
                  <div className="absolute inset-0 bg-ink/10 group-hover:bg-transparent transition-colors" />
                </div>
              )}

              <div className="space-y-4">
                <p 
                  className="text-[15px] text-ink/80 leading-relaxed font-light line-clamp-3 cursor-pointer"
                  onClick={() => onPostClick(post.id)}
                >
                  {post.content}
                </p>
                <PostActions 
                  post={post} 
                  onChatRequest={onChatRequest} 
                  onPostClick={onPostClick}
                  onShareClick={() => setSharePost(post)}
                />
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <ShareSheet 
        isOpen={!!sharePost} 
        onClose={() => setSharePost(null)} 
        post={sharePost} 
      />
    </div>
  );
};

const PostActions = ({ 
  post, 
  onChatRequest, 
  onPostClick,
  onShareClick
}: { 
  post: any, 
  onChatRequest: (user: ChatUser) => void,
  onPostClick: (postId: string) => void,
  onShareClick: () => void
}) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-silver/30">
      <div className="flex gap-4">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={cn(
            "flex items-center gap-1.5 transition-colors",
            isLiked ? "text-red-500" : "text-ink/40 hover:text-red-500"
          )}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold">{post.likes + (isLiked ? 1 : 0)}</span>
        </button>
        <button 
          className="flex items-center gap-1.5 text-ink/40 hover:text-cobalt transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onPostClick(post.id);
          }}
        >
          <MessageCircle size={16} />
          <span className="text-[10px] font-bold">{post.commentsCount}</span>
        </button>
        <button 
          className="flex items-center gap-1.5 text-ink/40 hover:text-cobalt transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onShareClick();
          }}
        >
          <Share2 size={16} />
        </button>
      </div>
      <span className="text-[10px] text-ink/20 font-medium uppercase tracking-widest">{post.timestamp}</span>
    </div>
  );
};

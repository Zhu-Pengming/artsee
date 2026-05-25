import React from 'react';
import { ChevronLeft, Share2, Bookmark, Heart, MessageSquare, ArrowRight, Eye, Clock, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ArticleDetailViewProps {
  articleId: string;
  onBack: () => void;
  onAuthorClick?: (authorId: string) => void;
}

export const ArticleDetailView = ({ articleId, onBack, onAuthorClick }: ArticleDetailViewProps) => {
  // Mock data based on the screenshot text
  const article = {
    id: articleId,
    title: "如何评价 2026 年威尼斯双年展的展馆布局？",
    subtitle: "深度剖析当代艺术展陈逻辑的结构性演变与空间叙事重构",
    author: {
      name: "Prof. Sebastian",
      avatar: "https://i.pravatar.cc/150?u=expert1",
      role: "Digital Arts Head @ UdK",
      id: "expert1"
    },
    cover: "https://picsum.photos/seed/article1/1200/600",
    date: "2026.04.28",
    views: "2.4K",
    readTime: "12 min",
    content: [
      { type: 'p', text: '威尼斯双年展，作为全球艺术的风向标，其 2026 年的展馆布局（Pavilion Layout）展现出了一种前所未有的“场域流动性”。以往那种板块分明的国家边界正在被一种跨主权的、基于问题的空间叙事所取代。' },
      { type: 'h2', text: '从“物理隔断”到“感知网络”' },
      { type: 'p', text: '今年的布局核心在于“去中心化”。策展团队打破了传统的线性游览路径，引入了基于算法推荐的“游荡模型”。观众在进入展区时，其移动设备会自动接入动态导航系统，根据其实时感知到的情绪波动建议下一个参观的方向。' },
      { type: 'img', src: 'https://picsum.photos/seed/venice1/1000/500', cap: '2026 威尼斯双年展主展馆动态光影装置' },
      { type: 'p', text: '这种布局不仅是物理空间上的挑战，更是对观众注意力的一次深层博弈。每一处转角、每一道光线都被精确计算，旨在制造一种“可控的迷失”。' },
      { type: 'quote', text: '“展馆不再是容器，而是作品本身。布局逻辑即是艺术逻辑。” —— Sebastian' }
    ]
  };

  return (
    <div className="bg-white min-h-screen selection:bg-cobalt selection:text-white antialiased">
      {/* Navigation - Floating for Desktop, Fixed for Mobile */}
      <header className="fixed top-0 inset-x-0 h-16 md:h-24 bg-white/80 backdrop-blur-3xl border-b border-silver/10 z-50 flex items-center justify-between px-4 md:px-12">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 md:gap-4 p-1 md:p-2 -ml-1 md:-ml-2 hover:bg-porcelain rounded-full transition-all active:scale-95"
        >
          <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-ink text-white shadow-lg shadow-ink/20">
            <ChevronLeft size={18} md:size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[9px] md:text-sm font-black text-ink uppercase tracking-[0.2em] md:tracking-[0.4em] italic hidden xs:block">Back</span>
        </button>

        <div className="flex items-center gap-2 md:gap-6">
          <button className="hidden md:flex items-center gap-2 px-6 py-3 border border-silver/30 rounded-full text-xs font-black uppercase tracking-widest hover:border-cobalt hover:text-cobalt transition-all">
            <Bookmark size={16} /> Save to Archive
          </button>
          <button className="p-2 md:p-4 hover:bg-porcelain rounded-full transition-all text-ink active:scale-90">
            <Share2 size={18} md:size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area - Mobile Centered, Desktop Wide with Sidebar */}
      <div className="pt-20 md:pt-40 max-w-7xl mx-auto px-4 md:px-12 pb-32">
        <div className="grid lg:grid-cols-12 gap-12 md:gap-24">
          
          {/* Main Article Content */}
          <article className="lg:col-span-8 space-y-10 md:space-y-16">
            {/* Hero Header */}
            <div className="space-y-4 md:space-y-8">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
               >
                 <h1 className="text-2xl md:text-5xl lg:text-6xl font-serif font-black italic tracking-tighter leading-[1.2] md:leading-[1.1]">
                   {article.title}
                 </h1>
               </motion.div>
               
               <p className="text-sm md:text-xl text-ink/40 font-light italic leading-relaxed border-l-2 border-cobalt pl-4 md:pl-8">
                 {article.subtitle}
               </p>

               <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10 pt-6 md:pt-8 border-t border-silver/10">
                  <div className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => onAuthorClick?.(article.author.id)}>
                    <img src={article.author.avatar} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-[13px] md:text-lg font-black italic group-hover:text-cobalt transition-colors leading-tight">{article.author.name}</p>
                      <p className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] text-ink/30 mt-0.5">{article.author.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 md:gap-8 text-[8px] md:text-xs font-black uppercase tracking-widest text-ink/20">
                    <div className="flex items-center gap-1.5"><Eye size={12} md:size={14} /> {article.views}</div>
                    <div className="flex items-center gap-1.5"><Clock size={12} md:size={14} /> {article.readTime}</div>
                    <div className="hidden sm:block">Published {article.date}</div>
                  </div>
               </div>
            </div>

            {/* Featured Image */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="rounded-2xl md:rounded-[3rem] overflow-hidden shadow-xl relative aspect-[16/9] md:aspect-[2/1] bg-porcelain"
            >
               <img src={article.cover} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </motion.div>

            {/* Body Text */}
            <div className="space-y-8 md:space-y-12">
               {article.content.map((block, i) => {
                 if (block.type === 'p') return (
                   <p key={i} className="text-sm md:text-xl text-ink/70 leading-relaxed font-light italic">
                     {block.text}
                   </p>
                 );
                 if (block.type === 'h2') return (
                   <h2 key={i} className="text-xl md:text-3xl font-serif font-black italic text-ink pt-4 md:pt-6">
                     {block.text}
                   </h2>
                 );
                 if (block.type === 'img') return (
                   <div key={i} className="space-y-2 md:space-y-3">
                      <img src={block.src} className="w-full rounded-xl md:rounded-3xl shadow-lg" alt="" referrerPolicy="no-referrer" />
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-ink/20 text-center italic leading-none">{block.cap}</p>
                   </div>
                 );
                 if (block.type === 'quote') return (
                   <div key={i} className="py-8 md:py-16 px-6 md:px-12 bg-porcelain rounded-2xl md:rounded-[3rem] border-l-4 md:border-l-8 border-cobalt">
                      <p className="text-base md:text-3xl font-serif italic text-ink font-bold leading-[1.4] md:leading-tight">
                        {block.text}
                      </p>
                   </div>
                 );
                 return null;
               })}
            </div>
          </article>

          {/* RIGHT SIDEBAR - Desktop only, Stacks on Mobile */}
          <aside className="lg:col-span-4 space-y-12">
             {/* Interaction Bar Desktop */}
             <div className="hidden lg:block bg-porcelain p-12 rounded-[5rem] border border-silver/20 space-y-10 shadow-sm sticky top-40">
                <div className="flex flex-col gap-8 items-center">
                   <div className="w-full flex justify-between px-6">
                      <div className="flex flex-col items-center gap-3 group cursor-pointer">
                         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-ink/20 group-hover:text-red-500 group-hover:shadow-xl transition-all shadow-sm">
                            <Heart size={28} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-ink/30">Celebrate</span>
                      </div>
                      <div className="flex flex-col items-center gap-3 group cursor-pointer">
                         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-ink/20 group-hover:text-cobalt group-hover:shadow-xl transition-all shadow-sm">
                            <MessageSquare size={28} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-ink/30">Connect</span>
                      </div>
                      <div className="flex flex-col items-center gap-3 group cursor-pointer">
                         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-ink/20 group-hover:text-emerald-500 group-hover:shadow-xl transition-all shadow-sm">
                            <Bookmark size={28} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-ink/30">Archive</span>
                      </div>
                   </div>
                   
                   <div className="w-full p-8 bg-ink rounded-[3rem] text-white space-y-6">
                      <div className="flex items-center gap-3">
                         <Sparkles size={20} className="text-cobalt" />
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Lab Access</span>
                      </div>
                      <p className="text-sm font-light italic text-white/60 leading-relaxed">
                        加入 2026 威尼斯双年展的闭门研讨小组，获取第一手深度观察。
                      </p>
                      <button className="w-full py-4 bg-white text-ink rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all active:scale-95">
                        Apply for Invitation
                      </button>
                   </div>
                </div>
             </div>

             {/* More in this section */}
             <div className="space-y-8 md:space-y-10 pt-10 border-t lg:border-t-0 border-silver/10">
                <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.5em] text-ink/20 italic">相关延伸阅读</h3>
                <div className="grid grid-cols-1 gap-6">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex gap-4 md:gap-6 group cursor-pointer bg-white lg:bg-transparent p-4 md:p-6 lg:p-0 rounded-2xl md:rounded-3xl border lg:border-0 border-silver/10 shadow-sm lg:shadow-none hover:shadow-lg lg:hover:shadow-none transition-all active:scale-98">
                        <img src={`https://picsum.photos/seed/${i + 10}/200/200`} className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-3xl object-cover shadow-md group-hover:grayscale-0 grayscale transition-all" alt="" />
                        <div className="flex-1 space-y-1 md:space-y-2">
                           <p className="text-xs md:text-xl font-black italic leading-tight group-hover:text-cobalt transition-colors duration-500 line-clamp-2">
                             算法时代下的视觉叙事变迁：不仅仅是像素的排列组合。
                           </p>
                           <div className="flex items-center gap-2 text-[7px] md:text-[10px] font-black text-ink/20 uppercase tracking-widest">
                             <span>2.1K Views</span>
                             <div className="w-1 h-1 rounded-full bg-silver" />
                             <span>Research</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </aside>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <footer className="fixed lg:hidden bottom-0 inset-x-0 h-16 md:h-20 bg-white/90 backdrop-blur-3xl border-t border-silver/10 flex items-center justify-between px-6 md:px-8 z-50">
          <div className="flex gap-6 md:gap-10">
             <div className="flex flex-col items-center gap-0.5 group">
                <Heart size={18} md:size={20} className="text-ink/30 active:text-red-500" />
                <span className="text-[7px] md:text-[8px] font-black text-ink/20 leading-none">1.2K</span>
             </div>
             <div className="flex flex-col items-center gap-0.5">
                <MessageSquare size={18} md:size={20} className="text-ink/30" />
                <span className="text-[7px] md:text-[8px] font-black text-ink/20 leading-none">45</span>
             </div>
             <div className="flex flex-col items-center gap-0.5">
                <Bookmark size={18} md:size={20} className="text-ink/30" />
                <span className="text-[7px] md:text-[8px] font-black text-ink/20 leading-none">Save</span>
             </div>
          </div>
          <button className="h-10 md:h-12 px-5 md:px-8 bg-ink text-white rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-xl shadow-ink/20">
             Explore Details
          </button>
      </footer>
    </div>
  );
};

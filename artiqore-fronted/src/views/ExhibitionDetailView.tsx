import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Heart, Info, MapPin, Calendar, Users, ArrowRight, Play, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ExhibitionDetailViewProps {
  onBack: () => void;
}

export const ExhibitionDetailView = ({ onBack }: ExhibitionDetailViewProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [activeRoom, setActiveRoom] = useState(0);

  const rooms = [
    { title: "序章：解构传统", desc: "从碎裂的瓷片中寻找几何的秩序", img: "https://images.unsplash.com/photo-1626074311105-0255c4d3609c?auto=format&fit=crop&q=80&w=1920" },
    { title: "中篇：算法重组", desc: "AI 模拟苏麻离青在宣德年间的自然晕散", img: "https://images.unsplash.com/photo-1614741487239-78a8582af2b3?auto=format&fit=crop&q=80&w=1920" },
    { title: "末章：蓝白永恒", desc: "数字维度下的永恒性探索", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1920" }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden selection:bg-cobalt selection:text-white">
      {/* Immersive Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cobalt/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cobalt/10 blur-[120px] rounded-full" />
        {/* Subtle Porcelain Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstripe-dark.png')] opacity-[0.05] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-tr from-cobalt/5 via-transparent to-white/5" />
      </div>

      {/* Immersive Header / Hero */}
      <section className="relative h-[100vh] w-full overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRoom}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img 
              src={rooms[activeRoom].img} 
              className="w-full h-full object-cover brightness-[0.6] grayscale-[0.1]"
              referrerPolicy="no-referrer"
              alt="Exhibition Background"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/porcelain${activeRoom}/1920/1080?grayscale`;
              }}
            />
            {/* Elegant vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Rail */}
        <div className="absolute inset-x-0 top-0 p-8 flex justify-between items-center z-50">
          <button 
            onClick={onBack} 
            className="p-4 bg-white/5 backdrop-blur-2xl rounded-full hover:bg-white/10 transition-all border border-white/10 group flex items-center gap-3 pr-8"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">返回首页 (Exit)</span>
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className={cn(
                "p-4 backdrop-blur-2xl rounded-full transition-all border border-white/10 flex items-center gap-3 px-6", 
                isLiked ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-white hover:bg-white/10"
              )}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-[10px] font-bold tracking-widest">{isLiked ? '已收藏' : '收藏'}</span>
            </button>
            <button className="p-4 bg-white/5 backdrop-blur-2xl rounded-full hover:bg-white/10 transition-all border border-white/10">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div className="relative mt-auto p-8 md:p-24 pb-32">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            className="max-w-6xl space-y-12"
          >
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-[1px] bg-cobalt"></div>
                 <span className="text-cobalt text-[10px] font-bold tracking-[0.5em] uppercase">Immersive Digital Art</span>
               </div>
               <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
                 <Users size={12} /> <span className="text-white/60">1,248</span> 正在共同探索
               </div>
            </div>
            
            <h1 className="text-6xl md:text-[8rem] font-serif font-light leading-[0.9] tracking-tighter">
              灵感碎片的万合<br />
              <span className="text-white/40 italic">青花新境</span>
            </h1>
            
            <div className="grid md:grid-cols-2 gap-16 items-end">
              <p className="text-lg text-white/50 font-light leading-relaxed max-w-xl">
                算法重构了历史的笔触，将传统的宁静转化为数字维度的永恒。
                <span className="block mt-4 text-sm text-cobalt font-medium">#AI_Ceramics #Digital_Heritage #Blue_And_White</span>
              </p>
              
              <div className="flex gap-4">
                 <button className="flex-1 h-20 bg-cobalt text-white rounded-[1.25rem] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-cobalt/80 transition-all shadow-2xl shadow-cobalt/20 group">
                   立即进入展厅 <Play size={14} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
                 </button>
                 <button className="flex-1 h-20 bg-white/5 text-white border border-white/10 rounded-[1.25rem] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                   观展指南 <Info size={14} />
                 </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <div className="w-[1px] h-12 bg-gradient-to-t from-white to-transparent"></div>
          <span className="text-[9px] font-bold uppercase tracking-[0.5em] rotate-90 origin-left translate-x-1.5 whitespace-nowrap">Scroll Down</span>
        </div>
      </section>

      {/* Main Content Pane */}
      <section className="relative z-10 bg-[#050505] border-t border-white/5 pt-32 pb-48">
        <div className="max-w-7xl mx-auto px-8 space-y-48">
          
          {/* Detailed Content / Bento Expansion */}
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-6">
                <span className="text-cobalt text-[10px] font-bold tracking-[0.5em] uppercase px-4 py-2 border border-cobalt/20 rounded-full inline-block">Chapter 01</span>
                <h2 className="text-4xl md:text-5xl font-serif font-light italic">笔触的量子纠缠</h2>
                <p className="text-white/40 text-lg leading-relaxed max-w-2xl font-light">
                  我们提取了 15,000 个明清纹样的像素模型，让 AI 学习“苏麻离青”的下凹特征。在虚拟空间中，这些颜色不仅仅是色块，它们具有物理厚度和光的折射属性。
                </p>
              </div>
              
              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-8 pt-12 border-t border-white/5">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cobalt border border-white/10">
                    <Maximize2 size={20} />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest italic">8K 材质重构</h4>
                  <p className="text-xs text-white/30 leading-relaxed">每一个像素点都承载了历史的质感与现代的精度</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cobalt border border-white/10">
                    <Users size={20} />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest italic">多维社交交互</h4>
                  <p className="text-xs text-white/30 leading-relaxed">在艺术的维度中与同好共鸣，分享你的独特视角</p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative group">
              <div className="absolute inset-0 bg-cobalt/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative rounded-[3rem] overflow-hidden aspect-[3/4] border border-white/10 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?auto=format&fit=crop&q=80&w=1200" alt="Detail" className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-12 flex flex-col justify-end">
                   <p className="text-xs font-bold text-cobalt mb-4 tracking-widest uppercase">Micro Texture</p>
                   <h3 className="text-2xl font-serif font-light">数字时代的“铁锈斑”探秘</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Immersive Gallery Switcher */}
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="space-y-4">
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.5em]">The Archives</span>
                <h3 className="text-3xl md:text-5xl font-serif font-light">展厅流转 (Galleries)</h3>
              </div>
              <div className="flex gap-4">
                {rooms.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveRoom(i)}
                    className={cn(
                      "group flex flex-col items-center gap-2 transition-all",
                      activeRoom === i ? "opacity-100" : "opacity-30 hover:opacity-100"
                    )}
                  >
                    <span className="text-[10px] font-mono mb-2">0{i+1}</span>
                    <div className={cn("w-16 h-1 transition-all rounded-full", activeRoom === i ? "bg-cobalt w-24" : "bg-white/20")} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rooms.map((room, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -12 }}
                  onClick={() => setActiveRoom(i)}
                  className={cn(
                    "relative aspect-[16/11] rounded-[2.5rem] overflow-hidden cursor-pointer border transition-all duration-500",
                    activeRoom === i ? "border-cobalt/50 shadow-2xl shadow-cobalt/20 scale-[1.02]" : "border-white/5 grayscale hover:grayscale-0"
                  )}
                >
                  <img src={room.img} alt={room.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                    <span className="text-[10px] text-cobalt font-bold uppercase tracking-widest mb-2">Room 0{i+1}</span>
                    <h4 className="text-xl font-bold mb-2">{room.title}</h4>
                    <p className="text-xs text-white/40 line-clamp-1">{room.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Final Call to Action - Immersive Terminal */}
          <div className="relative group">
            <div className="absolute inset-0 bg-cobalt/10 blur-[150px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
            <div className="relative bg-white/[0.02] border border-white/5 rounded-[5rem] p-24 md:p-32 text-center backdrop-blur-3xl overflow-hidden">
               <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-cobalt/10 blur-[120px] rounded-full animate-pulse" />
               </div>
               <div className="relative z-10 space-y-12">
                 <div className="space-y-4">
                   <p className="text-cobalt text-[10px] font-bold uppercase tracking-[0.8em] animate-pulse">Connection Established</p>
                   <h2 className="text-5xl md:text-7xl font-serif font-light italic leading-tight max-w-5xl mx-auto">
                     在数字的蓝白交锋中<br />
                     <span className="text-white/20">开启您的跨维度共鸣</span>
                   </h2>
                 </div>
                 <button className="h-24 px-16 bg-white text-ink rounded-2xl text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-cobalt hover:text-white transition-all shadow-2xl shadow-white/10 group">
                    立即接入 VR 空间 (Access Now)
                 </button>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Rail */}
      <footer className="px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 bg-ink">
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold">AL</div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 italic">artiqore Virtual Museum · Project #001</p>
         </div>
         <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/20">
            <a href="#" className="hover:text-cobalt transition-colors italic">Curatorial</a>
            <a href="#" className="hover:text-cobalt transition-colors italic">Privacy</a>
            <a href="#" className="hover:text-cobalt transition-colors italic">Access</a>
         </div>
      </footer>
    </div>
  );
};

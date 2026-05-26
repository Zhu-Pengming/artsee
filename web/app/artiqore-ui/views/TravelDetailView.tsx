// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Calendar, Clock, Camera, Heart, Share2, Sparkles, Star, ArrowLeft, ChevronRight, Zap, Image as ImageIcon, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { TravelSectionDetail } from '../components/TravelSectionDetails';

interface TravelDetailViewProps {
  onBack: () => void;
  onBook?: () => void;
  onContact?: () => void;
  onViewRooms?: () => void;
}

export const TravelDetailView = ({ onBack, onBook, onContact, onViewRooms }: TravelDetailViewProps) => {
  const [activeSection, setActiveSection] = useState<'hotel' | 'photo' | 'style' | 'report' | null>(null);

  const gallery = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200',
  ];

  const packageIncludes = [
    { id: 'hotel' as const, title: '五星级艺术酒店', desc: '全程入住 W酒店 或 瑰丽酒店 顶级客房', icon: <Star size={16} /> },
    { id: 'photo' as const, title: '资深摄影指导', desc: '陈漫工作室签约摄影师全程跟拍指导', icon: <Camera size={16} /> },
    { id: 'style' as const, title: '妆造与服饰', desc: '提供 3 套艺术风格妆造及独立设计师品牌服饰', icon: <Sparkles size={16} /> },
    { id: 'report' as const, title: '私人策展报告', desc: '行程结束后获得专属个人旅拍电子影展', icon: <ImageIcon size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative h-[60vh] md:h-[30vh] overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover"
            alt="Travel Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/90" />
        </motion.div>

        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">EDITOR'S PICK</span>
             <div className="flex items-center gap-1 text-white/60">
                <Star size={12} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">4.9 HIGH RATING</span>
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black italic text-white leading-tight max-w-3xl">
            旅拍：在星级酒店<br/>开启艺术之旅
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin size={16} className="text-cobalt" />
              <span className="text-xs font-bold uppercase tracking-widest">珠江新城 · 广州</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Calendar size={16} className="text-cobalt" />
              <span className="text-xs font-bold uppercase tracking-widest">2026.05.15 - 05.17</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-16">
          <section className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cobalt flex items-center gap-4">
              <div className="w-12 h-[1px] bg-cobalt" />
              EXPERIENCE OVERVIEW
            </h2>
            <p className="text-lg text-ink/80 leading-relaxed font-serif italic">
               这不是一次传统的旅行，而是一场多维度的审美实验。我们将坐标锁定在城市最顶级的星级酒店，利用其独特的建筑语言与软装美学，为您打造一套极具张力的艺术肖像。
               <br/><br/>
               从 W酒店 的赛博前卫到 瑰丽酒店 的静谧东韵，每一处场景都将由知名策展型摄影师亲自执导，让您穿梭在光影与空间之间，重新发现自我的艺术表达。
            </p>
          </section>

          <section className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ink/40">PACKAGE INCLUDES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packageIncludes.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveSection(item.id)}
                  className="p-8 bg-porcelain rounded-3xl border border-silver/10 space-y-4 hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-silver/20 flex items-center justify-center text-cobalt group-hover:bg-cobalt group-hover:text-white transition-all">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-ink italic group-hover:text-cobalt transition-colors">{item.title}</h4>
                    <p className="text-xs text-ink/40 font-bold uppercase tracking-widest leading-relaxed mt-1 group-hover:text-ink/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
             <div className="flex items-center justify-between">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ink/40">VISUAL GALLERY</h3>
               <button className="text-[10px] font-black uppercase tracking-widest text-cobalt flex items-center gap-2 group">
                 VIEW MORE <ChevronRight size={14} className="group-hover:translate-x-1 transition-all" />
               </button>
             </div>
             <div className="grid grid-cols-2 gap-4">
               {gallery.map((img, i) => (
                 <div key={i} className={cn(
                   "rounded-3xl overflow-hidden group cursor-pointer",
                   i === 0 ? "col-span-2 aspect-[21/9]" : "aspect-[4/3]"
                 )}>
                   <img 
                    src={img} 
                    className="w-full h-full object-cover transition-all duration-1000 scale-100 hover:scale-110" 
                    alt="Gallery" 
                   />
                 </div>
               ))}
             </div>
          </section>
        </div>

        {/* Sidebar Booking Card - Desktop Design */}
        <aside className="hidden md:block space-y-6">
          <div className="sticky top-28 p-7 bg-[#121212] text-white rounded-[2.5rem] shadow-3xl border border-white/5 space-y-6">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Starts From</p>
                  <p className="text-3xl font-serif font-black italic">¥2,880</p>
               </div>
               <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <Star size={18} className="text-cobalt" />
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-[1.5rem] border border-white/5 group hover:bg-white/[0.06] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center text-cobalt">
                     <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Duration</p>
                    <p className="text-xs font-bold italic">3 DAYS 2 NIGHTS</p>
                  </div>
               </div>

               <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-[1.5rem] border border-white/5 group hover:bg-white/[0.06] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center text-cobalt">
                     <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Capacity</p>
                    <p className="text-xs font-bold italic">8 SLOTS ONLY</p>
                  </div>
               </div>
            </div>

            <div className="space-y-3 pt-2">
               <button 
                onClick={onBook}
                className="w-full h-14 bg-cobalt text-white rounded-xl text-[10px] font-black uppercase tracking-[0.5em] shadow-xl shadow-cobalt/10 hover:scale-[1.02] active:scale-95 transition-all"
               >
                 立即预定席位
               </button>
               <button 
                onClick={onContact}
                className="w-full h-14 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
               >
                 <Zap size={14} className="text-cobalt" />
                 咨询主理人
               </button>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center gap-3">
               <div className="flex -space-x-2.5">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-[#121212] bg-white/10 overflow-hidden">
                      <img src={`https://picsum.photos/seed/artist${i}/80/80`} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                   </div>
                 ))}
               </div>
               <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">5 Artists Already Booked</span>
            </div>
          </div>
        </aside>

        {/* Mobile Booking Section - Based on Screenshot Design */}
        <div className="md:hidden space-y-8">
           <div className="p-8 bg-ink rounded-[2.5rem] space-y-8">
              <div className="flex justify-between items-start">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Starts From</p>
                 <p className="text-3xl font-serif font-black italic text-white leading-none">¥2,880</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <div className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-cobalt/20 flex items-center justify-center text-cobalt">
                       <Clock size={20} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Duration</p>
                       <p className="text-sm font-bold text-white">3 DAYS 2 NIGHTS</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-cobalt/20 flex items-center justify-center text-cobalt">
                       <Users size={20} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Capacity</p>
                       <p className="text-sm font-bold text-white">8 SLOTS ONLY</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                  onClick={onBook}
                  className="w-full h-16 bg-cobalt text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl"
                 >
                    立即预定席位
                 </button>
                 <button 
                  onClick={onContact}
                  className="w-full h-16 bg-white/5 text-white/80 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                 >
                    <Zap size={14} className="text-cobalt" />
                    咨询主理人
                 </button>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center gap-4">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-ink bg-white/10 overflow-hidden">
                          <img src={`https://picsum.photos/seed/mobileartist${i}/80/80`} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                       </div>
                    ))}
                 </div>
                 <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">5 Artists Already Booked</span>
              </div>
           </div>
        </div>
      </div>

      {/* Floating Bottom Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 h-24 bg-white/80 backdrop-blur-2xl border-t border-silver/10 px-6 flex items-center justify-between z-40">
         <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-ink/40">Starts At</span>
            <span className="text-xl font-serif font-black italic text-ink">¥2,880</span>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={onContact}
              className="w-12 h-12 bg-ink text-white rounded-xl flex items-center justify-center"
            >
              <Zap size={18} />
            </button>
            <button 
              onClick={onBook}
              className="px-8 h-12 bg-cobalt text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cobalt/20"
            >
              立即预定
            </button>
         </div>
      </div>

      <AnimatePresence>
        {activeSection && (
          <TravelSectionDetail 
            type={activeSection} 
            onClose={() => setActiveSection(null)} 
            onViewRooms={() => {
              setActiveSection(null);
              onViewRooms?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

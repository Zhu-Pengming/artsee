// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ChevronLeft, Share2, MapPin, Calendar, Clock, Users, ArrowRight, Heart, Sparkles, GlassWater, Music, Utensils, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { LoungeDetail, MusicDetail, DiningDetail, MemberBenefitsDetail } from '../components/SalonHighlightDetails';
import { BookingDetail } from '../components/BookingDetail';

interface SalonDetailViewProps {
  event: { 
    title: string; 
    location: string; 
    date: string; 
    price: string; 
    clubName: string;
    images?: string[];
  };
  onBack: () => void;
  onGuideOpen?: () => void;
}

export const SalonDetailView = ({ event, onBack, onGuideOpen }: SalonDetailViewProps) => {
  const [activeHighlight, setActiveHighlight] = useState<'lounge' | 'music' | 'dining' | 'benefits' | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const highlights = [
    { id: 'lounge' as const, icon: <GlassWater size={20} />, title: '顶层奢华酒廊', desc: '在城市天际线之上，尊享主理人调制的艺术主题特饮。' },
    { id: 'music' as const, icon: <Music size={20} />, title: '沉浸式大提琴演奏', desc: '特邀交响乐团首席，为您呈现跨越古典与现代的听觉盛宴。' },
    { id: 'dining' as const, icon: <Utensils size={20} />, title: '五星级定制私宴', desc: 'W 酒店行政主厨亲撰菜单，将食材之美转化为视觉与味觉的双重艺术。' },
  ];

  return (
    <div className="bg-porcelain min-h-screen pb-32">
      {/* Immersive Hero */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear" }}
          src={event.images?.[0] || "https://picsum.photos/seed/salon-hero/1920/1080"} 
          className="w-full h-full object-cover opacity-100"
          alt="Salon Hero"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        
        {/* Navigation */}
        <header className="absolute top-0 inset-x-0 h-24 flex items-center justify-between px-8 z-50">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-4">
             <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all">
               <Share2 size={20} />
             </button>
             <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-red-500 transition-all">
               <Heart size={20} />
             </button>
          </div>
        </header>

        <div className="absolute bottom-20 left-8 right-8 max-w-7xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-widest border border-white/30">
               {event.clubName} · 高端私享
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-5xl font-serif font-bold text-white italic leading-tight"
          >
            {event.title}
          </motion.h1>

          <div className="flex flex-wrap gap-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-4 text-white">
              <Calendar size={20} className="text-cobalt" />
              <div>
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Date</p>
                 <p className="text-lg font-serif italic">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white">
              <MapPin size={20} className="text-cobalt" />
              <div>
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Venue</p>
                 <p className="text-lg font-serif italic">{event.location}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-8 mt-24">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left: Description */}
          <div className="lg:col-span-8 space-y-24">
             <section className="space-y-12">
                <div className="flex items-center gap-4 text-cobalt">
                   <div className="w-12 h-[1px] bg-cobalt" />
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] italic">The Invitation</h3>
                </div>
                <p className="text-xl md:text-2xl font-serif font-bold text-ink leading-relaxed italic">
                  “打着艺术名号的社交，让灵魂在奢华的场域中重修旧好。这不仅是一场讲座，更是一场关于审美、品位与社交资本的深度显化。”
                </p>
                <div className="text-lg text-ink/40 font-light leading-relaxed prose prose-ink">
                  在该专场活动中，我们联动了当地顶尖的五星级酒店，为您打造一个极致私密的艺术交流场面。我们相信，伟大的创意往往诞生于碰杯指尖的最佳氛围中。
                </div>
             </section>

             {/* Highlights */}
             <section className="grid md:grid-cols-3 gap-8">
               {highlights.map((h, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ y: -10 }}
                   onClick={() => setActiveHighlight(h.id)}
                   className="p-10 bg-white rounded-[3rem] border border-silver/30 shadow-sm space-y-6 group hover:border-cobalt transition-all cursor-pointer"
                 >
                    <div className="w-14 h-14 bg-silver/10 rounded-2xl flex items-center justify-center text-ink/20 group-hover:bg-cobalt group-hover:text-white transition-all">
                      {h.icon}
                    </div>
                    <h4 className="text-lg font-bold text-ink italic leading-tight">{h.title}</h4>
                    <p className="text-xs text-ink/40 leading-relaxed font-medium">{h.desc}</p>
                 </motion.div>
               ))}
             </section>

             {/* Itinerary */}
             <section className="bg-ink p-12 md:p-24 rounded-[4rem] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[40%] h-full bg-cobalt/10 blur-[100px] pointer-events-none" />
                <div className="relative z-10 space-y-12">
                   <h3 className="text-3xl font-serif italic text-white/50">活动流程 (Itinerary)</h3>
                   <div className="space-y-10">
                      {[
                        { time: '19:00', title: '签到与迎宾酒', desc: '在露台享受特调冷餐与鸡尾酒。' },
                        { time: '19:42', title: '艺术主旨讲座', desc: '听大咖聊 2026 年艺术趋势与商业联动。' },
                        { time: '20:30', title: '自由沙龙社交', desc: '在音乐与灯光中寻找您的艺术伙伴。' },
                        { time: '21:30', title: '盲盒家宴 / 晚宴', desc: '开启味蕾的艺术探索之旅。' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-8 group">
                           <span className="text-xl font-serif text-cobalt mt-1">{item.time}</span>
                           <div className="space-y-2 border-l border-white/10 pl-8 relative pb-8">
                              <div className="absolute -left-[4.5px] top-3 w-2 h-2 rounded-full bg-white group-hover:bg-cobalt transition-colors" />
                              <h5 className="text-xl font-bold italic">{item.title}</h5>
                              <p className="text-sm text-white/30 font-light">{item.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </section>
          </div>

          {/* Right: Booking */}
          <div className="lg:col-span-4 space-y-10">
            <section className="sticky top-28 bg-white rounded-[3rem] p-10 border border-silver/30 shadow-2xl space-y-10">
               <div className="flex items-center justify-between border-b border-silver/10 pb-6">
                 <div>
                    <p className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Entry Fee</p>
                    <p className="text-3xl font-serif font-black text-ink italic">{event.price}</p>
                 </div>
                 <div className="flex items-center gap-2 text-green-500">
                    <Sparkles size={16} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Unlimited Slots</span>
                 </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-3 text-xs font-bold text-ink/60 italic">
                    <Clock size={16} /> 即将满员，建议尽快上车
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-ink/60 italic">
                    <ShieldCheck size={16} className="text-cobalt" /> 实名身份认证 · 高端圈子保证
                  </div>
               </div>

               <div className="flex -space-x-3 pt-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=salon${i}`} className="w-12 h-12 rounded-full border-4 border-white object-cover" alt="" referrerPolicy="no-referrer" />
                  ))}
                  <div className="w-12 h-12 rounded-full bg-porcelain border-4 border-white flex items-center justify-center text-[10px] font-bold text-ink/20">+42</div>
               </div>

               <button 
                 onClick={() => setIsBookingOpen(true)}
                 className="w-full h-20 bg-cobalt text-white rounded-2xl text-xs font-bold uppercase tracking-[0.4em] shadow-3xl shadow-cobalt/20 hover:bg-ink transition-all active:scale-95"
               >
                 立即抢占名额
               </button>

               <div className="text-center pt-4">
                 <button 
                   onClick={() => setActiveHighlight('benefits')}
                   className="text-[10px] font-bold text-ink/20 uppercase tracking-widest hover:text-ink transition-colors"
                 >
                   了解会员特权
                 </button>
               </div>
            </section>

            <section className="bg-silver/5 p-8 rounded-[2.5rem] border border-silver/20 space-y-6">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-cobalt/10 flex items-center justify-center text-cobalt">
                    <Sparkles size={14} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Exclusive Concierge</span>
               </div>
               <p className="text-xs text-ink/40 font-medium leading-relaxed italic">
                 该活动配备专属生活管家，如需代订交通或住宿服务，请联系 artiqore 私人助理。
               </p>
               <button className="text-xs font-bold text-cobalt uppercase underline underline-offset-4 tracking-widest">
                 联系管家
               </button>
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {activeHighlight === 'lounge' && <LoungeDetail onClose={() => setActiveHighlight(null)} onGuideOpen={onGuideOpen} />}
        {activeHighlight === 'music' && <MusicDetail onClose={() => setActiveHighlight(null)} onGuideOpen={onGuideOpen} />}
        {activeHighlight === 'dining' && <DiningDetail onClose={() => setActiveHighlight(null)} onGuideOpen={onGuideOpen} />}
        {activeHighlight === 'benefits' && <MemberBenefitsDetail onClose={() => setActiveHighlight(null)} />}
        {isBookingOpen && <BookingDetail event={event} onClose={() => setIsBookingOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

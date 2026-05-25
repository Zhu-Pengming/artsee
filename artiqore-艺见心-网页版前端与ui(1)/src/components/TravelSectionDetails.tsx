import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Camera, Sparkles, Image as ImageIcon, ChevronRight, MapPin, ShieldCheck, Zap, Heart, Search, Layout, Globe, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface TravelSectionDetailProps {
  type: 'hotel' | 'photo' | 'style' | 'report';
  onClose: () => void;
  onViewRooms: () => void;
}

// --- Hotel Detail ---
const HotelDetail = ({ onViewRooms }: { onViewRooms: () => void }) => (
  <div className="flex flex-col md:flex-row h-full">
    <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200" 
        className="w-full h-full object-cover" 
        alt="Art Hotel" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
      <div className="absolute bottom-8 left-8 right-8 text-white">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">Premium Accommodation</span>
        <h2 className="text-3xl md:text-5xl font-serif font-black italic">五星级艺术酒店</h2>
      </div>
    </div>
    <div className="flex-1 bg-white p-8 md:p-20 overflow-y-auto no-scrollbar space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-4 text-cobalt">
          <div className="w-10 h-[1px] bg-cobalt" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">The Living Space</span>
        </div>
        <p className="text-xl md:text-2xl font-serif font-bold italic text-ink leading-relaxed">
          “最好的跨界，是把艺术住进生活里。”
        </p>
        <p className="text-sm md:text-base text-ink/50 leading-loose">
          我们与全球顶尖酒店集团深度合作。在广州，您可以选择入住 W酒店 的“酷角房”，享受赛博朋克风的城市天际线；亦或是 瑰丽酒店 的“云端府邸”，在 100 层之上的静谧空间中，品味顶级大理石与东方丝绸的触感碰撞。
        </p>
      </section>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-porcelain rounded-3xl border border-silver/10 space-y-2">
          <MapPin size={16} className="text-cobalt" />
          <h4 className="text-sm font-bold text-ink">黄金坐标</h4>
          <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest leading-relaxed">珠江新城核心区直达</p>
        </div>
        <div className="p-6 bg-porcelain rounded-3xl border border-silver/10 space-y-2">
          <ShieldCheck size={16} className="text-cobalt" />
          <h4 className="text-sm font-bold text-ink">艺术特权</h4>
          <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest leading-relaxed">客房内设独立微型画廊</p>
        </div>
      </div>
      <button 
        onClick={onViewRooms}
        className="w-full h-16 bg-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] font-sans hover:bg-cobalt transition-all"
      >
        了解房型详情 (View Rooms)
      </button>
    </div>
  </div>
);

// --- Photography Detail ---
const PhotoDetail = () => (
  <div className="flex flex-col md:flex-row h-full">
    <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200" 
        className="w-full h-full object-cover" 
        alt="Pro Photography" 
      />
      <div className="absolute inset-0 bg-ink/40" />
      <div className="absolute bottom-8 left-8 right-8 text-white">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">Professional Vision</span>
        <h2 className="text-3xl md:text-5xl font-serif font-black italic">资深摄影指导</h2>
      </div>
    </div>
    <div className="flex-1 bg-porcelain p-8 md:p-20 overflow-y-auto no-scrollbar space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-4 text-cobalt">
          <div className="w-10 h-[1px] bg-cobalt" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">The Creator Portfolio</span>
        </div>
        <p className="text-xl md:text-2xl font-serif font-bold italic text-ink leading-relaxed">
          “捕捉那些被日常忽略的、快门后的灵魂。”
        </p>
        <div className="space-y-8">
           {[
             { name: 'Ethan Chen', bio: '时尚杂志《VOGUE》长期合作摄影师，擅长光影氛围构建。' },
             { name: 'Sarah Zhang', bio: '独立人像摄影家，陈漫工作室首席执行摄影及视觉风格把控。' }
           ].map((artist, i) => (
             <div key={i} className="flex gap-6 p-6 bg-white rounded-3xl border border-silver/10 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-ink shrink-0 overflow-hidden">
                   <User className="m-auto mt-4 text-white/20" size={32} />
                </div>
                <div className="space-y-1">
                   <h4 className="text-lg font-serif font-bold italic text-ink">{artist.name}</h4>
                   <p className="text-xs text-ink/40 font-medium leading-relaxed">{artist.bio}</p>
                </div>
             </div>
           ))}
        </div>
      </section>
      <div className="p-8 bg-ink rounded-[2rem] text-white/60 space-y-4">
         <p className="text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-4">Equipment & Quality</p>
         <ul className="text-[10px] font-bold uppercase tracking-[0.2em] space-y-2">
            <li>• PHASE ONE 1亿像素中画幅后背</li>
            <li>• 全线 PROFOTO 专业灯光系统</li>
            <li>• 12bit 超采样 RAW 格式无损存储</li>
         </ul>
      </div>
    </div>
  </div>
);

// --- Style Detail ---
const StyleDetail = () => (
  <div className="flex flex-col md:flex-row h-full">
    <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200" 
        className="w-full h-full object-cover" 
        alt="Fashion Style" 
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />
      <div className="absolute bottom-8 left-8 right-8 text-white">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">Artistic Wardrobe</span>
        <h2 className="text-3xl md:text-5xl font-serif font-black italic">妆造与服饰</h2>
      </div>
    </div>
    <div className="flex-1 bg-white p-8 md:p-20 overflow-y-auto no-scrollbar space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-4 text-cobalt">
          <div className="w-10 h-[1px] bg-cobalt" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Style Strategy</span>
        </div>
        <p className="text-xl font-serif font-bold italic text-ink leading-relaxed">
          每一个像素点出的高光，都是为了成就您独特的艺术肖像。
        </p>
        <div className="grid grid-cols-1 gap-4">
           {[
             { title: '独立设计师联名', desc: '甄选来自巴黎、上海独立设计师的孤品服饰。', icon: <Star /> },
             { title: '定制妆面设计', desc: '根据拍摄场景（赛博、极简、复古）定制专属妆发。', icon: <Sparkles /> }
           ].map((f, i) => (
             <div key={i} className="flex gap-6 p-8 bg-porcelain rounded-3xl border border-silver/5">
                <div className="text-cobalt shrink-0">{React.cloneElement(f.icon as any, { size: 24 })}</div>
                <div className="space-y-1">
                   <h4 className="text-base font-bold text-ink italic">{f.title}</h4>
                   <p className="text-xs text-ink/40 font-medium leading-relaxed">{f.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </section>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
         {[1,2,3,4].map(i => (
           <div key={i} className="w-32 h-44 rounded-2xl bg-porcelain border border-silver/10 overflow-hidden shrink-0">
              <img src={`https://picsum.photos/seed/fashion${i}/300/400`} className="w-full h-full object-cover" alt="" />
           </div>
         ))}
      </div>
    </div>
  </div>
);

// --- Report Detail ---
const ReportDetail = () => (
  <div className="flex flex-col md:flex-row h-full">
    <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden bg-ink">
       <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-64 border-4 border-white/10 rounded-[3rem] relative flex items-center justify-center">
             <div className="w-40 h-56 bg-white/5 rounded-[2.5rem] flex items-center justify-center">
                <ImageIcon size={48} className="text-cobalt/40" />
             </div>
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="absolute -top-4 -right-4 w-16 h-16 bg-cobalt rounded-2xl flex items-center justify-center shadow-xl shadow-cobalt/40"
             >
                <Zap size={24} className="text-white" />
             </motion.div>
          </div>
       </div>
       <div className="absolute bottom-8 left-8 right-8 text-white text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">Personal Legacy</span>
          <h2 className="text-3xl md:text-5xl font-serif font-black italic">私人策展报告</h2>
       </div>
    </div>
    <div className="flex-1 bg-white p-8 md:p-20 overflow-y-auto no-scrollbar space-y-12">
       <section className="space-y-6">
          <div className="flex items-center gap-4 text-cobalt">
             <div className="w-10 h-[1px] bg-cobalt" />
             <span className="text-[10px] font-black uppercase tracking-widest italic">Digital Archive</span>
          </div>
          <p className="text-xl font-serif font-bold italic text-ink leading-relaxed">
             不再只是存储在相册里的碎片。
          </p>
          <div className="space-y-6">
             <div className="p-8 bg-porcelain rounded-3xl border border-silver/10 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-ink/30 mb-2 italic">Feature Insights</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs font-bold text-ink italic">
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cobalt" /> 4K 动态交互展厅 (H5)</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cobalt" /> 全球首个 AI 视觉权重分析</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cobalt" /> 限量版实体艺术影集定制</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cobalt" /> AR 增强现实观展特权</li>
                </ul>
             </div>
             <p className="text-sm text-ink/40 leading-relaxed font-light">
                行程结束后，我们的策展团队将花费 72 小时，对您的拍摄作品进行深度的“影评级”后期与版式设计。这份报告不仅记录了画面，也记录了当天的艺术温度。
             </p>
          </div>
       </section>
       <button className="w-full h-16 bg-cobalt text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] font-sans hover:bg-ink transition-all shadow-xl shadow-cobalt/20">
         预览示例报告 (Sample)
       </button>
    </div>
  </div>
);

export const TravelSectionDetail = ({ type, onClose, onViewRooms }: TravelSectionDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-8"
    >
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="relative w-full h-full max-h-screen md:max-h-[85vh] md:max-w-[1200px] bg-white md:rounded-[4rem] overflow-hidden shadow-4xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 md:top-12 md:right-12 z-50 w-12 h-12 md:w-20 md:h-20 bg-white/80 backdrop-blur-md rounded-full border border-silver/10 shadow-2xl flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-all outline-none"
        >
          <X size={24} />
        </button>

        <div className="h-full">
           {type === 'hotel' && <HotelDetail onViewRooms={onViewRooms} />}
           {type === 'photo' && <PhotoDetail />}
           {type === 'style' && <StyleDetail />}
           {type === 'report' && <ReportDetail />}
        </div>
      </motion.div>
    </motion.div>
  );
};

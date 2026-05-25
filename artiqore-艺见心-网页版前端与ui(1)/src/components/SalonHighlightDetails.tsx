import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, Volume2, Music, GlassWater, Utensils, Star, Info, Clock, MapPin, Sparkles, Send, User } from 'lucide-react';
import { cn } from '../lib/utils';

// --- Shared Detail Layout Component ---
interface HighlightDetailProps {
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ReactNode;
  img: string;
  onClose: () => void;
  onGuideOpen?: () => void;
}

const HighlightDetailLayout = ({ title, subtitle, desc, icon, img, onClose, onGuideOpen }: HighlightDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-ink/90 backdrop-blur-2xl" onClick={onClose} />
      
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl bg-white md:rounded-[4rem] overflow-hidden shadow-4xl flex flex-col md:flex-row"
      >
        {/* Navigation for Mobile */}
        <div className="md:hidden absolute top-0 inset-x-0 h-20 flex items-center justify-between px-6 z-50">
           <button 
             onClick={onClose}
             className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
           >
             <ChevronLeft size={20} />
           </button>
        </div>

        {/* Hero / Image Section */}
        <div className="w-full h-[40vh] md:h-auto md:w-1/2 relative overflow-hidden">
           <img 
             src={img} 
             className="w-full h-full object-cover brightness-75"
             alt={title}
             referrerPolicy="no-referrer"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent md:bg-gradient-to-l" />
           <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white mb-4">
                 {icon}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{subtitle}</p>
              <h2 className="text-3xl font-serif font-black italic tracking-tight">{title}</h2>
           </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 bg-white p-8 md:p-20 overflow-y-auto no-scrollbar relative">
           <button 
             onClick={onClose}
             className="hidden md:flex absolute top-12 right-12 w-16 h-16 rounded-full bg-porcelain flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-all shadow-sm"
           >
             <X size={24} />
           </button>

           <div className="space-y-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-4 text-cobalt">
                    <div className="w-10 h-[1px] bg-cobalt" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic font-sans">Highlight Insight</span>
                 </div>
                 <p className="text-lg md:text-2xl font-serif font-bold text-ink italic leading-relaxed">
                   {desc}
                 </p>
                 <div className="text-base text-ink/40 font-light leading-relaxed font-sans">
                   我们致力于为您打造极致的感官体验。从视觉到听觉，再到每一寸指尖触碰到的质感，都经过严谨的设计与筛选。在这个空间里，艺术不再是挂在墙上的装饰，而是可以被嗅吸、被聆听、被饮入的生命力。
                 </div>
              </div>

              {/* Dynamic Stats / Info */}
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-porcelain/50 p-8 rounded-[2rem] border border-silver/10 space-y-2">
                    <p className="text-[9px] text-ink/30 font-black uppercase tracking-widest">Experience Level</p>
                    <p className="text-xl font-serif font-bold text-ink italic">Ultra-Exclusive</p>
                 </div>
                 <div className="bg-porcelain/50 p-8 rounded-[2rem] border border-silver/10 space-y-2">
                    <p className="text-[9px] text-ink/30 font-black uppercase tracking-widest">Atmosphere</p>
                    <p className="text-xl font-serif font-bold text-ink italic">Luminous & Deep</p>
                 </div>
              </div>

              {/* Action */}
              <div className="pt-10 border-t border-silver/10">
                 <button 
                  onClick={() => {
                    onClose();
                    onGuideOpen?.();
                  }}
                  className="w-full h-16 md:h-20 bg-ink text-white rounded-[1.5rem] flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-cobalt transition-all group"
                 >
                    加载完整指南 (Guide)
                    <ChevronLeft size={16} className="rotate-180 group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Specific Content Components ---

export const LoungeDetail = ({ onClose, onGuideOpen }: { onClose: () => void, onGuideOpen?: () => void }) => (
  <HighlightDetailLayout 
    onClose={onClose}
    onGuideOpen={onGuideOpen}
    icon={<GlassWater size={24} />}
    title="顶层奢华酒廊 (Lounge)"
    subtitle="Skyline Sanctuary"
    desc="“高度决定视野，而特调鸡尾酒则决定了灵魂沟通的深度。” 在海拔 300 米的私人会所，享受由 top-tier 调酒师为您定制的艺术主题饮品。"
    img="https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&q=80&w=1200"
  />
);

export const MusicDetail = ({ onClose, onGuideOpen }: { onClose: () => void, onGuideOpen?: () => void }) => (
  <HighlightDetailLayout 
    onClose={onClose}
    onGuideOpen={onGuideOpen}
    icon={<Music size={24} />}
    title="沉浸式大提琴演奏 (Live)"
    subtitle="Acoustic Journey"
    desc="“音符在皮革与大理石之间跳跃。” 特邀交响乐团首席，在私密的环境中为您近距离独奏，呈现一场超越物理空间的听觉圣殿。"
    img="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=1200"
  />
);

export const DiningDetail = ({ onClose, onGuideOpen }: { onClose: () => void, onGuideOpen?: () => void }) => (
  <HighlightDetailLayout 
    onClose={onClose}
    onGuideOpen={onGuideOpen}
    icon={<Utensils size={24} />}
    title="五星级定制私宴 (Dining)"
    subtitle="Epicurean Art"
    desc="“每一道菜都是一幅画作。” Ｗ 酒店行政主厨亲自掌镜，将顶级食材与现代烹饪艺术融合，在舌尖开启一场不可思议的蒙太奇。"
    img="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200"
  />
);

export const MemberBenefitsDetail = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-ink/90 backdrop-blur-3xl" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-4xl p-8 md:p-16 text-center space-y-10"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-porcelain flex items-center justify-center text-ink"
        >
          <X size={20} />
        </button>

        <div className="w-20 h-20 bg-cobalt/10 rounded-[2rem] flex items-center justify-center text-cobalt mx-auto">
          <Star size={32} />
        </div>

        <div className="space-y-4">
           <h2 className="text-3xl md:text-5xl font-serif font-black italic tracking-tighter text-ink">会员专属特权</h2>
           <p className="text-[10px] md:text-xs text-cobalt font-black uppercase tracking-[0.4em] font-sans">Strategic Membership Insight</p>
        </div>

        <div className="space-y-6 text-left">
           {[
             { label: '优先席位', desc: '所有沙龙活动享受首行 VIP 席位保留权。' },
             { label: '私人管家', desc: '7x24 小年代订顶级餐厅、私人交通与限量艺术珍品。' },
             { label: '限量联名', desc: '每年获赠 artiqore 联动顶尖艺术家出品的限定艺术品。' }
           ].map((item, i) => (
             <div key={i} className="flex gap-6 p-6 bg-porcelain rounded-3xl border border-silver/10">
                <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-cobalt shrink-0 shadow-sm font-serif italic text-lg font-bold">
                   0{i + 1}
                </div>
                <div className="space-y-1">
                   <h4 className="text-sm font-bold text-ink italic">{item.label}</h4>
                   <p className="text-xs text-ink/40 font-medium leading-relaxed">{item.desc} </p>
                </div>
             </div>
           ))}
        </div>

        <button className="w-full h-16 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] font-sans hover:bg-cobalt transition-all shadow-xl">
          升级至 Art-Elite 会员 (Upgrade)
        </button>
      </motion.div>
    </motion.div>
  );
};

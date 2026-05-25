import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Maximize2, Wind, Wifi, Coffee, Star, MapPin, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface RoomDetailViewProps {
  onBack: () => void;
}

const rooms = [
  {
    id: 'w-hotel',
    hotel: 'W 酒店 (W Hotel)',
    name: '酷角房 (Cool Corner Room)',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200',
    description: '270度落地窗设计，坐拥珠江新城全景。赛博朋克风格内饰，配备顶级音响系统。',
    size: '65㎡',
    features: ['全景视野', '智能控制', 'Bose音响', '高层景观'],
    price: '+￥200/晚',
    recommended: true
  },
  {
    id: 'rosewood',
    hotel: '瑰丽酒店 (Rosewood)',
    name: '云端府邸 (Manor Suite)',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200',
    description: '位于全球最高酒店建筑之巅，融合现代美学与传统东方工艺。尊享管家式服务。',
    size: '80㎡',
    features: ['云端视野', '私人管家', '艺术藏品', '顶级大理石'],
    price: '+￥800/晚',
    recommended: false
  }
];

export const RoomDetailView = ({ onBack }: RoomDetailViewProps) => {
  return (
    <div className="min-h-screen bg-porcelain text-ink selection:bg-cobalt">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-50 h-16 px-6 flex items-center justify-between border-b border-silver/10">
        <button onClick={onBack} className="p-2 -ml-2 text-ink/40 hover:text-ink transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest italic">房型选择 (Rooms)</h1>
        <div className="w-8" />
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-0 inset-x-0 h-20 px-12 items-center justify-between z-50 pointer-events-none">
        <button 
          onClick={onBack} 
          className="pointer-events-auto p-4 bg-white rounded-full border border-silver/10 shadow-xl text-ink hover:bg-ink hover:text-white transition-all"
        >
          <X size={20} />
        </button>
        <div className="px-8 py-3 bg-white/80 backdrop-blur-md border border-silver/10 rounded-full shadow-lg">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-cobalt">Premium Living Curation</span>
        </div>
        <div className="w-12" />
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 md:pt-32 pb-24">
        <section className="space-y-4 mb-16">
          <div className="flex items-center gap-4 text-cobalt">
            <div className="w-12 h-[1px] bg-cobalt" />
            <span className="text-xs font-black uppercase tracking-widest italic">Luxury Accommodations</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-black italic text-ink leading-tight">
            甄选房型详情
          </h2>
          <p className="text-sm md:text-lg text-ink/40 font-medium max-w-2xl">
            我们为您甄选了两家顶尖艺术酒店的代表房型，不同的视野与风格，为您带来全然不同的居住灵感。
          </p>
        </section>

        <div className="space-y-12 md:space-y-24">
          {rooms.map((room, index) => (
            <motion.div 
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "flex flex-col md:flex-row gap-12 md:gap-20",
                index % 2 === 1 && "md:flex-row-reverse"
              )}
            >
              <div className="w-full md:w-3/5 group">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] md:rounded-[4rem] border border-silver/20 shadow-2xl">
                  <img 
                    src={room.image} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                    alt={room.name} 
                  />
                  {room.recommended && (
                    <div className="absolute top-8 left-8 px-6 py-2 bg-cobalt text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                      Highly Recommended
                    </div>
                  )}
                  <div className="absolute bottom-8 right-8 flex gap-3">
                     <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-white">
                        <Maximize2 size={20} />
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-8 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cobalt">{room.hotel}</span>
                    <span className="text-xl font-serif font-black italic">{room.price}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif font-black italic">{room.name}</h3>
                </div>

                <p className="text-sm md:text-base text-ink/60 leading-loose">
                  {room.description}
                </p>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 pb-8 border-b border-silver/10">
                   {room.features.map(f => (
                     <div key={f} className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-cobalt" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{f}</span>
                     </div>
                   ))}
                </div>

                <div className="flex items-center gap-8">
                   <div className="flex items-center gap-3">
                      <Wind size={16} className="text-cobalt" />
                      <span className="text-xs font-bold italic">{room.size}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Wifi size={16} className="text-cobalt" />
                      <span className="text-xs font-bold italic">High Speed</span>
                   </div>
                </div>

                <div className="pt-4">
                   <button className="h-16 px-12 bg-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-cobalt transition-all">
                      选择此房型
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="mt-24 md:mt-40 p-12 md:p-20 bg-ink text-white rounded-[3rem] md:rounded-[5rem] relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(65,105,225,0.1),transparent)]" />
           <div className="relative z-10 space-y-10 max-w-2xl">
              <div className="flex items-center gap-4 text-cobalt">
                <div className="w-12 h-[1px] bg-cobalt" />
                <span className="text-xs font-black uppercase tracking-widest italic">Amenities & Services</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-black italic leading-tight">
                入住艺术，<br/>尊享每一刻灵感。
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-6">
                 {[
                   { icon: <Coffee />, label: '艺术下午茶' },
                   { icon: <Star />, label: '奢华备品' },
                   { icon: <MapPin />, label: 'CBD核心位置' }
                 ].map((item, i) => (
                   <div key={i} className="space-y-3">
                      <div className="text-cobalt">{item.icon}</div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{item.label}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      <footer className="py-12 bg-white border-t border-silver/10 text-center">
         <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-ink/20 italic">Curated Living · L-Chain Art Network</p>
      </footer>
    </div>
  );
};

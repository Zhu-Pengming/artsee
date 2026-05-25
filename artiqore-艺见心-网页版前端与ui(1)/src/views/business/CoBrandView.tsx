import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const CoBrandView = ({ onDetailClick }: { onDetailClick?: (id: string) => void }) => {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-ink italic">平台自营合作 (IP)</h2>
          <p className="text-ink/40 text-[10px] tracking-[0.3em] uppercase mt-2 font-bold">Exclusive Platform-Led Co-Branding Projects</p>
        </div>
      </div>

      <div className="relative rounded-[3.5rem] overflow-hidden group shadow-2xl h-[300px] flex items-center bg-ink">
        <div className="absolute inset-0 opacity-40">
           <img 
            src="https://picsum.photos/seed/cobrand/1920/400" 
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" 
            referrerPolicy="no-referrer"
            alt=""
           />
        </div>
        <div className="relative z-10 p-16 space-y-4">
           <span className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-[0.4em] border border-white/20">Featured Series</span>
           <h3 className="text-4xl font-serif font-black text-white italic italic leading-tight max-w-2xl">
             "ORIENTAL ZEN" - 上海香格里拉大酒店巡回艺术展
           </h3>
           <p className="text-white/60 text-sm max-w-lg font-medium">作为首批品牌合作伙伴入驻，尊享平台全资源位推广及顶级艺术家定向委托权力。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            onClick={() => onDetailClick?.(`大师联营方案 ${i}`)}
            className="bg-white p-10 rounded-[2.5rem] border border-silver/40 shadow-sm space-y-8 group hover:shadow-2xl hover:shadow-cobalt/5 transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]"
          >
             <div className="space-y-6">
               <div className="w-16 h-16 bg-cobalt text-white rounded-3xl flex items-center justify-center shadow-lg shadow-cobalt/20">
                  <Sparkles size={32} strokeWidth={1.5} />
               </div>
               <div>
                  <h4 className="text-2xl font-serif font-bold text-ink italic leading-tight">大师联营方案 {i}</h4>
                  <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest mt-2 font-bold">Master Collaboration Tier</p>
               </div>
               <ul className="space-y-4">
                  {['独家艺术家版权授权', '线下展览节点赞助权益', '全网全媒体矩阵流量包', '专属艺术家见面会'].map(benefit => (
                    <li key={benefit} className="flex items-center gap-3 text-xs font-bold text-ink/60">
                      <ShieldCheck size={14} className="text-cobalt" />
                      {benefit}
                    </li>
                  ))}
               </ul>
             </div>

             <div className="space-y-4">
               <div className="flex items-center justify-between pt-6 border-t border-silver/30">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-orange-500" />
                    <span className="text-[10px] font-black text-ink uppercase tracking-widest">限量 2 席位</span>
                  </div>
                  <button className="text-[11px] font-black text-cobalt uppercase underline underline-offset-4 group/btn hover:translate-x-1 transition-transform">
                    申请加入合作 <ArrowRight size={14} className="inline ml-1" />
                  </button>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

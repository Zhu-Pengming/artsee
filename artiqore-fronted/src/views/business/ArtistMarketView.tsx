import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Star, 
  MessageSquare, 
  Zap, 
  Grid, 
  List,
  Radar,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const FILTERS = [
  { label: '艺术门类', options: ['当代艺术', '油画', '雕塑', '数字艺术', '装置'] },
  { label: '商业报价', options: ['5万以下', '5-20万', '20-50万', '面议'] },
  { label: '职业阶段', options: ['大师级', '知名艺术家', '新锐', '应届优选'] },
  { label: '所在地', options: ['上海', '北京', '伦敦', '巴黎', '纽约'] },
];

export const ArtistMarketView = ({ onDetailClick }: { onDetailClick?: (id: string) => void }) => {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-10">
      {/* Search & Global Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ink/20" size={20} />
          <input 
            type="text" 
            placeholder="搜索艺术家、风格、材料或特定奖项..."
            className="w-full pl-16 pr-6 py-5 bg-white border border-silver/40 rounded-3xl focus:outline-none focus:ring-4 focus:ring-cobalt/5 transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex bg-silver/30 p-1 rounded-2xl">
             <button 
               onClick={() => setViewType('grid')}
               className={cn("p-3 rounded-xl transition-all", viewType === 'grid' ? "bg-white text-cobalt shadow-md" : "text-ink/30 hover:text-ink/60")}
             >
               <Grid size={18} />
             </button>
             <button 
               onClick={() => setViewType('list')}
               className={cn("p-3 rounded-xl transition-all", viewType === 'list' ? "bg-white text-cobalt shadow-md" : "text-ink/30 hover:text-ink/60")}
             >
               <List size={18} />
             </button>
           </div>
           
           <button className="flex items-center gap-2 px-8 py-4 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-cobalt transition-all">
             精准匹配算法 (AI)
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-silver/40 shadow-sm space-y-8 sticky top-24">
              <div className="flex items-center justify-between border-b border-silver/30 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
                  <Filter size={12} />
                  高级筛选器
                </span>
                <button className="text-[9px] font-black text-cobalt uppercase underline">重置</button>
              </div>

              {FILTERS.map(filter => (
                <div key={filter.label} className="space-y-4">
                  <div className="flex items-center justify-between group cursor-pointer">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">{filter.label}</h4>
                    <ChevronDown size={14} className="text-ink/20 group-hover:text-cobalt transition-colors" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filter.options.map(opt => (
                      <button key={opt} className="px-3 py-1.5 bg-silver/10 hover:bg-cobalt hover:text-white border border-silver/30 rounded-lg text-[9px] font-bold uppercase tracking-tighter transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 space-y-4">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">平台信用等级 (S/A/B)</h4>
                <div className="flex gap-2">
                  {['S', 'A', 'B'].map(rank => (
                    <button key={rank} className="flex-1 py-2 border border-silver/30 rounded-xl text-xs font-black text-ink/30 hover:text-cobalt hover:border-cobalt transition-all">
                      {rank}
                    </button>
                  ))}
                </div>
              </div>
           </div>
        </aside>

        {/* Artist Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(9)].map((_, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={i}
              onClick={() => onDetailClick?.(`查看艺术家 ${['陈星宇', 'Sofia Rossi', 'Lin Mo', 'Elena Weber'][i % 4]} 的完整作品集与商业画像`)}
              className="bg-white rounded-[3rem] border border-silver/40 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-cobalt/5 transition-all group cursor-pointer active:scale-[0.98]"
            >
               <div className="aspect-[4/3] relative overflow-hidden">
                 <img 
                    src={`https://picsum.photos/seed/artistbiz${i}/800/600`} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                    alt=""
                 />
                 <div className="absolute top-6 left-6 flex items-center gap-2">
                   <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-cobalt flex items-center gap-1 shadow-xl">
                      <Star size={10} fill="currentColor" />
                      S级合作艺术家
                   </span>
                 </div>
                 <div className="absolute bottom-6 left-6 flex gap-2 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-ink hover:bg-cobalt hover:text-white shadow-xl transition-all">
                      <Radar size={18} />
                    </button>
                    <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-ink hover:bg-cobalt hover:text-white shadow-xl transition-all">
                      <MessageSquare size={18} />
                    </button>
                 </div>
               </div>

               <div className="p-8 space-y-6">
                 <div>
                   <div className="flex justify-between items-start">
                     <h3 className="text-xl font-serif font-bold text-ink italic group-hover:text-cobalt transition-colors">艺术家 · {['陈星宇', 'Sofia Rossi', 'Lin Mo', 'Elena Weber'][i % 4]}</h3>
                     <span className="text-[10px] text-ink/20 font-bold uppercase tracking-widest">毕业于 {['RCA', 'UAL', 'Brera', 'ECAL'][i % 4]}</span>
                   </div>
                   <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest mt-2">{['抽象油画 | 当代装置', '数字媒体 | AI生成', '极简主义 | 雕塑'][i % 3]}</p>
                 </div>

                 <div className="flex flex-wrap gap-2 pb-4 border-b border-silver/30">
                    {['品牌联名', '定制创作', '艺术沙龙'].map(tag => (
                      <span key={tag} className="text-[8px] font-bold text-ink/40 border border-silver/60 bg-silver/10 px-2 py-0.5 rounded-md uppercase tracking-tighter">{tag}</span>
                    ))}
                 </div>

                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-silver/30 flex items-center justify-center text-cobalt">
                        <Zap size={14} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-ink/40 uppercase tracking-tighter">极速响应时间</p>
                        <p className="text-xs font-bold text-ink">平均 2.4h</p>
                      </div>
                   </div>
                   <button className="flex items-center gap-2 text-[10px] font-black text-cobalt uppercase underline underline-offset-4 group/btn">
                    发起邀约 <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                 </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

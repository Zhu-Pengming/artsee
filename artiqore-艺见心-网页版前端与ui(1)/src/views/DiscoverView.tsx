import React, { useState } from 'react';
import { Briefcase, LayoutGrid, Palette, Calendar, MapPin, ChevronRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const OPPORTUNITIES = [
  { 
    title: '迪奥艺术联名：中国纹样重构主题', 
    brand: 'DIOR ARTIST SERIES', 
    type: '品牌联名', 
    budget: '独家签约', 
    deadline: '2026.05.20',
    tags: ['皮具定制', '数字艺术']
  },
  { 
    title: '上海新天地艺术节 - 2026驻留计划', 
    brand: 'XINTIANDI', 
    type: '艺术驻留', 
    budget: '¥150k + 差旅', 
    deadline: '2026.06.15',
    tags: ['景观装置', '先锋影像']
  },
  { 
    title: '爱马仕：传统手工艺现代转化研究员', 
    brand: 'Hermès Art Lab', 
    type: '学术科研', 
    budget: '月薪 ¥45k+', 
    deadline: '2026.05.30',
    tags: ['竹编', '可持续设计']
  },
  { 
    title: '腾讯 T-Labs：元宇宙虚拟服饰设计师', 
    brand: 'Tencent Games', 
    type: '数字潮流', 
    budget: '年薪 ¥600k+', 
    deadline: '2026.07.10',
    tags: ['3D渲染', '物理仿真']
  }
];

export const DiscoverView = ({ onDetailClick, onPaymentRequest }: { 
  onDetailClick?: (item: any) => void,
  onPaymentRequest?: (info: { amount: string, title: string, itemTitle: string }) => void
}) => {
  const [activeTab, setActiveTab] = useState('opportunity');

  return (
    <div className="space-y-6 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-serif font-light text-ink italic leading-tight">资源与机会</h2>
          <p className="text-ink/40 text-[7px] md:text-[10px] tracking-widest uppercase mt-0.5">Networking & Resources Library</p>
        </div>
        
        <div className="flex bg-silver/30 p-1 rounded-xl w-full md:w-auto self-start overflow-x-auto no-scrollbar">
          {[
            { id: 'opportunity', label: '机会', icon: <Briefcase size={12} /> },
            { id: 'exhibition', label: '展览', icon: <LayoutGrid size={12} /> },
            { id: 'artist', label: '艺术家', icon: <Palette size={12} /> },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                activeTab === t.id ? "bg-white text-cobalt shadow-sm" : "text-ink/40 hover:text-ink/60"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 md:space-y-12">
        {activeTab === 'opportunity' && (
          <div className="space-y-6 md:space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              <div 
                onClick={() => onDetailClick?.({ title: '顶奢酒店艺术招募专场', brand: 'PREMIUM RECRUITMENT', type: '招募专场', budget: '¥500k+', deadline: '2026.08.01' })}
                className="bg-ink text-white p-6 md:p-10 rounded-xl md:rounded-[2.5rem] flex flex-col justify-between aspect-square md:aspect-auto shadow-xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-cobalt blur-[80px] opacity-20 transition-opacity"></div>
                 <Star size={24} className="text-yellow-400 relative z-10" strokeWidth={1.5} />
                 <div className="relative z-10">
                   <h3 className="text-sm md:text-2xl font-serif font-bold leading-tight italic">酒店招募</h3>
                   <p className="text-[6px] md:text-[10px] text-white/40 mt-1.5 uppercase tracking-widest">Premium Art</p>
                 </div>
              </div>
              <div 
                onClick={() => onDetailClick?.({ title: '城市更新装置大赛', brand: 'CITY DESIGN COUNCIL', type: '艺术竞赛', budget: '¥1.2M', deadline: '2026.09.15' })}
                className="bg-cobalt text-white p-6 md:p-10 rounded-xl md:rounded-[2.5rem] flex flex-col justify-between aspect-square md:aspect-auto shadow-xl group cursor-pointer active:scale-95 transition-all"
              >
                 <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></div>
                 </div>
                 <div>
                   <h3 className="text-sm md:text-2xl font-serif font-bold leading-tight italic">装置大赛</h3>
                   <p className="text-[6px] md:text-[10px] text-white/40 mt-1.5 uppercase tracking-widest">Competitions</p>
                 </div>
              </div>
               <div 
                onClick={() => onDetailClick?.({ title: '作品版权托管', brand: 'ART TRUST', type: '版权服务', budget: '按比例分成', deadline: '长期有效' })}
                className="hidden lg:flex bg-white border border-silver/50 p-10 rounded-[2.5rem] flex-col justify-between shadow-sm hover:border-cobalt transition-colors group cursor-pointer active:scale-95"
               >
                 <div className="w-12 h-12 bg-silver/30 rounded-2xl flex items-center justify-center text-cobalt">
                   <Palette size={24} />
                 </div>
                 <div>
                   <h3 className="text-xl font-serif font-bold leading-tight text-ink group-hover:text-cobalt transition-colors uppercase">作品版权托管</h3>
                   <p className="text-[10px] text-ink/30 mt-3 uppercase tracking-widest font-bold">Copyright Management Service</p>
                 </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-silver/50 pb-4">
                <h3 className="text-2xl font-serif font-bold text-ink">推荐机会 (Hot)</h3>
                <button className="text-sm font-bold text-cobalt hover:opacity-70 transition-opacity underline underline-offset-4">查看全部类别</button>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {OPPORTUNITIES.map((opp, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={opp.title} 
                    onClick={() => onDetailClick?.(opp)}
                    className="bg-white border border-silver/40 rounded-xl p-4 md:p-8 shadow-sm group hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3 md:mb-6">
                        <span className="text-[6px] md:text-[9px] font-bold text-cobalt bg-cobalt/5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full uppercase tracking-widest border border-cobalt/10">{opp.type}</span>
                        <span className="text-[7px] text-ink/20 font-bold uppercase tracking-widest leading-none">{opp.deadline}</span>
                      </div>
                      <h4 className="text-sm md:text-xl font-bold text-ink group-hover:text-cobalt transition-colors mb-1 md:mb-2 leading-tight line-clamp-2 md:h-16 overflow-hidden">{opp.title}</h4>
                      <p className="text-[7px] md:text-[10px] text-ink/30 font-bold uppercase tracking-widest mb-4 md:mb-6 md:h-6 overflow-hidden">{opp.brand}</p>
                    </div>
                    
                    <div className="space-y-4 md:space-y-6 md:h-20 flex flex-col justify-end">
                      <div className="flex flex-wrap gap-1 md:h-8 overflow-hidden items-end">
                        {opp.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[6px] font-bold text-ink/40 border border-silver/60 bg-silver/5 mt-1 px-1.5 py-0.5 rounded uppercase">{t}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-silver/20">
                        <span className="text-[10px] md:text-xs font-serif font-bold text-ink italic italic">{opp.budget}</span>
                        <ChevronRight size={12} className="text-ink/20 group-hover:text-cobalt transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exhibition' && (
          <div className="space-y-12">
            <div 
              onClick={() => onDetailClick?.({ title: '镜中之镜 - 线上VR大展', month: 'ALL', day: 'VR', subtitle: '浸润式数字艺术探索' })}
              className="relative rounded-[3rem] overflow-hidden h-[400px] group cursor-pointer shadow-2xl md:active:scale-[0.99] transition-all"
            >
              <img src="https://picsum.photos/seed/exhview/1200/800" className="w-full h-full object-cover transition-all duration-1000 md:group-hover:scale-105" referrerPolicy="no-referrer" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent flex flex-col justify-end p-12">
                 <p className="text-[10px] text-white/50 uppercase tracking-[0.4em] mb-4 font-bold">Featured Exhibit Highlights</p>
                 <h2 className="text-4xl md:text-6xl font-serif font-bold text-white italic max-w-2xl leading-[1.1]">镜中之镜 - 线上VR大展</h2>
                 <p className="text-white/60 mt-6 text-sm max-w-lg leading-relaxed hidden md:block">沉浸式多维艺术探索，打破物理维度的限制。集结全球20位新锐顶尖数字艺术家，带来跨时代的美学冲击。</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-8">
                <div className="flex justify-between items-center border-b border-silver/50 pb-4">
                  <h3 className="text-2xl font-serif font-bold text-ink italic">线下展览日历</h3>
                  <div className="flex items-center gap-2 text-[10px] text-cobalt font-bold uppercase tracking-widest bg-cobalt/5 px-3 py-1.5 rounded-full">
                    <MapPin size={12} />
                    上海地区 (SHANGHAI)
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { month: 'MAY', day: '15', title: '西岸美术馆：本源之形', subtitle: '蓬皮杜中心特展系列' },
                    { month: 'MAY', day: '22', title: '龙美术馆：光影诗画', subtitle: '当代数字艺术群展' },
                    { month: 'JUN', day: '05', title: 'UCCA Edge：机器之魂', subtitle: 'AI与人类创造力的边界' },
                    { month: 'JUN', day: '18', title: '复星艺术中心：流动的盛宴', subtitle: '沉浸式多感官展览' },
                  ].map((exh, i) => (
                    <div 
                      key={i} 
                      onClick={() => onDetailClick?.(exh)}
                      className="flex gap-6 group cursor-pointer bg-white p-6 rounded-[2rem] border border-silver/40 hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                      <div className="w-20 h-24 bg-silver/30 rounded-2xl flex flex-col items-center justify-center border border-silver/50 shrink-0 group-hover:bg-cobalt group-hover:border-cobalt/20 transition-all">
                        <span className="text-[10px] font-bold text-ink/40 group-hover:text-white/60 uppercase tracking-widest">{exh.month}</span>
                        <span className="text-3xl font-serif font-black text-cobalt group-hover:text-white transition-all">{exh.day}</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1 md:h-24">
                        <div>
                          <h4 className="text-lg font-bold text-ink leading-tight group-hover:text-cobalt transition-colors md:h-14 overflow-hidden">{exh.title}</h4>
                          <p className="text-sm text-ink/30 mt-1 uppercase tracking-tight font-medium truncate">{exh.subtitle}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[10px] text-ink/30 font-bold uppercase flex items-center gap-1"><Calendar size={10} /> 预约制</span>
                          <span className="text-[10px] text-cobalt font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">View Details</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 bg-ink p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[3/4] lg:aspect-auto">
                 <div className="relative z-10">
                   <h4 className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 mb-8 border-b border-white/10 pb-4">热门展馆推荐</h4>
                   <ul className="space-y-6">
                     {['龙美术馆 (LONG MUSEUM)', '艺仓艺术馆 (MAM)', 'UCCA Edge', '复星艺术中心'].map(m => (
                       <li 
                        key={m} 
                        onClick={() => onDetailClick?.({ title: m, month: 'ALL', day: '館', subtitle: '展馆详细信息与策展计划' })}
                        className="flex items-center justify-between group cursor-pointer text-sm font-serif italic text-white/70 hover:text-white transition-all"
                       >
                         <span>{m}</span>
                         <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                       </li>
                     ))}
                   </ul>
                 </div>
                 <button 
                    onClick={() => onPaymentRequest?.({ amount: '¥29.90', title: '城市展览榜单订阅', itemTitle: '全年全球主流城市艺术展览更新提醒服务' })}
                    className="relative z-10 w-full py-4 rounded-2xl bg-white text-ink text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    订阅城市展览榜单
                  </button>

                 <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <img src="https://picsum.photos/seed/ink/600/800" className="w-full h-full object-cover mix-blend-overlay" referrerPolicy="no-referrer" alt="" />
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'artist' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            {[
              { name: '陈星宇', major: '当代油画', school: '柏林艺术大学' },
              { name: '林若冰', major: '数字媒体', school: '皇家艺术学院' },
              { name: 'Sofia R.', major: '时尚摄影', school: '帕森斯设计学院' },
              { name: '张墨凡', major: '交互设计', school: '埃因霍温设计学院' },
              { name: 'Elena W.', major: '策展研究', school: '中央圣马丁' },
              { name: '佐藤健', major: '建筑设计', school: '东京艺术大学' },
              { name: 'David Lee', major: '概念美术', school: 'RISD' },
              { name: '吴艺凡', major: '装置艺术', school: '耶鲁艺术学院' },
              { name: 'Emma G.', major: '陶瓷设计', school: '阿尔托大学' },
              { name: '徐清然', major: '视觉传达', school: '弘益大学' },
              { name: 'Lucia M.', major: '新媒体艺术', school: '米兰理工' },
              { name: '韩子谦', major: '工业设计', school: '多摩美术大学' },
            ].map((artist, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                key={i} 
                onClick={() => onDetailClick?.(artist)}
                className="flex flex-col group cursor-pointer md:active:scale-95 transition-all"
              >
                 <div className="aspect-[3/4] rounded-[2rem] overflow-hidden mb-4 relative shadow-md border border-silver/40">
                    <img src={`https://picsum.photos/seed/artp${i}/600/800`} className="w-full h-full object-cover transition-all duration-700 md:group-hover:scale-105" referrerPolicy="no-referrer" alt="" />
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                       <span className="text-[9px] font-bold text-ink uppercase tracking-tighter">Available</span>
                    </div>
                 </div>
                 <div className="px-2 md:h-12 flex flex-col justify-center">
                   <h4 className="text-base font-bold text-ink group-hover:text-cobalt transition-colors truncate italic">艺术家 · {artist.name}</h4>
                   <p className="text-xs text-ink/30 font-bold uppercase tracking-widest mt-1 truncate">{artist.major} | {artist.school}</p>
                 </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

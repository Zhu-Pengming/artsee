// @ts-nocheck
'use client';

import React from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Globe, 
  ShieldCheck, 
  ChevronRight, 
  ArrowUpRight,
  Clock,
  Palette,
  LayoutGrid,
  FileText,
  Share2,
  Bookmark,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DiscoverDetailViewProps {
  item: any;
  onBack?: () => void;
}

export const DiscoverDetailView: React.FC<DiscoverDetailViewProps> = ({ item, onBack }) => {
  const [showApplication, setShowApplication] = React.useState(false);
  const isOpportunity = !!item.brand;
  const isExhibition = !!item.month;
  const isArtist = item.major && item.school;

  const renderContent = () => {
    if (isOpportunity) {
      return (
        <div className="space-y-10">
          <header className="space-y-4">
            <div className="inline-block px-4 py-1 bg-cobalt text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em]">{item.type}</div>
            <h2 className="text-4xl font-serif font-extrabold text-ink italic leading-tight">{item.title}</h2>
            <div className="flex items-center gap-6">
              <p className="text-ink/60 text-sm font-bold uppercase tracking-widest">{item.brand}</p>
              <div className="h-4 w-px bg-silver/40"></div>
              <p className="text-ink/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> 截止日期: {item.deadline}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <div className="bg-white p-12 rounded-[3.5rem] border border-silver/40 shadow-sm space-y-8">
                <section className="space-y-6">
                  <h3 className="text-sm font-black text-ink uppercase tracking-[0.3em] border-b border-silver/30 pb-4">项目详述 (Overview)</h3>
                  <p className="text-sm text-ink/70 leading-relaxed font-medium">
                    本项目旨在探索传统工艺与现代美学的交汇点。我们寻找能够深度解析文化符号，并能将其转化为具有全球竞争力的当代设计语言的创作者。
                    入选者将获得品牌总部的全方位支持，包括材料研发实验室的使用权以及全球联名发布的宣发预算。
                  </p>
                </section>

                <section className="space-y-6">
                  <h3 className="text-sm font-black text-ink uppercase tracking-[0.3em] border-b border-silver/30 pb-4">核心要求 (Requirements)</h3>
                  <ul className="space-y-4">
                    {[
                      '具备 5 年以上相关领域从业经验，有成功的跨界作品案例。',
                      '对特定门类的非遗技艺有深刻见解（如：苏州织造、景泰蓝等）。',
                      '能熟练使用 3D 建模工具并具备基础的数字艺术转换能力。',
                      '具备优秀的跨文化沟通能力，能与全球团队协同。'
                    ].map((req, i) => (
                      <li key={i} className="flex gap-4 items-start text-xs text-ink/60 leading-relaxed font-medium">
                        <CheckCircleIcon className="text-green-500 shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

               <div className="bg-ink p-12 rounded-[3.5rem] text-white space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif font-bold italic">合作权益 (Benefits)</h3>
                    <TrendingUpIcon className="text-cobalt" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { icon: <Briefcase size={20} />, title: '商业授权利金', desc: '根据最终成交额提供 3% - 5% 的销售分成。' },
                      { icon: <Globe size={20} />, title: '全球巡展资源', desc: '作品将在巴黎、伦敦、纽约等六大旗舰店巡回展示。' },
                      { icon: <Users size={20} />, title: '媒体矩阵覆盖', desc: '包括 Vogue, V MAGAZINE 在内的顶尖媒体专题报道。' },
                      { icon: <ShieldCheck size={20} />, title: '版权归属明确', desc: '创作者保留核心知识产权，品牌持有特定年限商业权。' },
                    ].map((b, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="text-cobalt bg-white/5 p-3 rounded-2xl">{b.icon}</div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">{b.title}</p>
                          <p className="text-[10px] text-white/40 leading-relaxed">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-silver/40 text-center space-y-6">
                <div>
                   <p className="text-[10px] font-bold text-ink/20 uppercase tracking-widest mb-2">项目预算区间</p>
                   <p className="text-3xl font-serif font-black text-ink italic">{item.budget}</p>
                </div>
                <button 
                  onClick={() => setShowApplication(true)}
                  className="w-full py-5 bg-ink text-white rounded-3xl text-sm font-black uppercase tracking-[0.3em] hover:bg-cobalt transition-all shadow-xl active:scale-95"
                >
                  立即申请 (APPLY NOW)
                </button>
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-silver/30">
                  <button className="flex items-center gap-2 text-[9px] font-bold text-ink/40 hover:text-cobalt transition-colors uppercase"><Bookmark size={14} /> 收藏机会</button>
                  <button className="flex items-center gap-2 text-[9px] font-bold text-ink/40 hover:text-cobalt transition-colors uppercase"><Share2 size={14} /> 分享详情</button>
                </div>
              </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-silver/40 space-y-6">
                <h4 className="text-[10px] font-black text-ink uppercase tracking-[0.2em] border-b border-silver/30 pb-4 flex items-center gap-2">
                  <Star size={14} className="text-yellow-500" />
                  申请进度 (Applicant Info)
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-ink/40">已申请人数</span>
                    <span className="text-ink">128 人</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-ink/40">通过初筛</span>
                    <span className="text-green-600">8 人</span>
                  </div>
                  <div className="w-full h-1.5 bg-silver/20 rounded-full overflow-hidden">
                    <div className="h-full bg-cobalt" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      );
    }

    if (isExhibition) {
      return (
        <div className="space-y-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-cobalt text-white rounded-3xl flex flex-col items-center justify-center border-4 border-white shadow-2xl">
                    <span className="text-[10px] font-bold uppercase">{item.month}</span>
                    <span className="text-2xl font-serif font-black">{item.day}</span>
                 </div>
                 <div>
                    <h2 className="text-3xl font-serif font-bold text-ink italic leading-tight">{item.title}</h2>
                    <p className="text-ink/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">{item.subtitle}</p>
                 </div>
              </div>
            </div>
            <button className="px-8 py-3 bg-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cobalt shadow-xl transition-all">立即预约门票</button>
          </header>

          <div className="aspect-[21/9] rounded-[4rem] overflow-hidden border border-silver/40 shadow-2xl relative group">
            <img src="https://picsum.photos/seed/exhdetail/1600/900" className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt="" />
            <div className="absolute inset-0 bg-ink/5 group-hover:bg-transparent transition-all"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-silver/40 hover:border-cobalt/20 transition-all space-y-8">
                  <h3 className="text-xl font-serif font-bold italic border-b border-silver/30 pb-4">展览综构 (Conceptual Summary)</h3>
                  <p className="text-sm text-ink/70 leading-relaxed font-medium">
                    本次展览汇集了全球最具前瞻性的当代创作者，致力于通过跨媒介的呈现方式探索“生命之形”在数字时代的重塑。
                    从古典质感的再发现到算法驱动的叙事逻辑，展览横跨三个主要展厅，为您呈现一场多维感官触达的艺术盛宴。
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-white p-8 rounded-[2.5rem] border border-silver/40 flex items-center gap-4">
                      <div className="w-12 h-12 bg-silver/20 rounded-2xl flex items-center justify-center text-cobalt"><MapPin size={24} /></div>
                      <div>
                        <p className="text-[9px] font-black text-ink/20 uppercase tracking-widest">展馆地址</p>
                        <p className="text-xs font-bold text-ink">西岸美术馆 · 二层展厅</p>
                      </div>
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] border border-silver/40 flex items-center gap-4">
                      <div className="w-12 h-12 bg-silver/20 rounded-2xl flex items-center justify-center text-cobalt"><Users size={24} /></div>
                      <div>
                        <p className="text-[9px] font-black text-ink/20 uppercase tracking-widest">观展人数</p>
                        <p className="text-xs font-bold text-ink">剩余 842 席位 (本周)</p>
                      </div>
                   </div>
                </div>
             </div>

             <aside className="lg:col-span-4 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-silver/40 space-y-8">
                   <h4 className="text-xs font-black text-ink uppercase tracking-widest border-b border-silver/30 pb-4">参展及门票说明</h4>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-ink/40 uppercase">常规票 (STANDARD)</span>
                        <span className="text-ink font-serif italic text-lg">¥128</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-ink/40 uppercase">VIP 通行证 (ALL-ACCESS)</span>
                        <span className="text-ink font-serif italic text-lg">¥320</span>
                      </div>
                   </div>
                   <div className="p-6 bg-porcelain rounded-3xl space-y-3">
                      <p className="text-[10px] font-bold text-ink/40 leading-none flex items-center gap-2">
                        <ArrowUpRightIcon className="text-cobalt" size={12} /> 会员权益叠加
                      </p>
                      <p className="text-[9px] font-medium text-ink/60">艺享会员可享 85 折门票优惠及专属导览册一份。</p>
                   </div>
                </div>
             </aside>
          </div>
        </div>
      );
    }

    if (isArtist) {
      return (
        <div className="space-y-10">
          <header className="flex justify-between items-start">
            <div className="flex gap-8 items-center">
               <img src={`https://picsum.photos/seed/${item.name}/300/300`} className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover" referrerPolicy="no-referrer" alt="" />
               <div>
                  <h2 className="text-4xl font-serif font-black text-ink italic leading-tight">艺术家 · {item.name}</h2>
                  <p className="text-ink/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 font-black">{item.major} | {item.school}</p>
               </div>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-cobalt transition-all">关注</button>
              <button className="px-8 py-3 bg-white text-ink border border-silver/40 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-silver/10 transition-all">合作意向</button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             <div className="lg:col-span-8 space-y-10">
                <div className="grid grid-cols-2 gap-4">
                   {[1, 2, 3, 4].map(i => (
                     <div key={i} className="aspect-square rounded-[3rem] overflow-hidden border border-silver/40 group relative cursor-pointer">
                        <img src={`https://picsum.photos/seed/artistart${i}/800/800`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" alt="" />
                     </div>
                   ))}
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] border border-silver/40 shadow-sm space-y-6">
                   <h3 className="text-xl font-serif font-bold italic">艺术主张 (Statement)</h3>
                   <p className="text-sm text-ink/70 leading-relaxed font-serif italic text-lg pb-4 border-b border-silver/30">
                     “每一次创作都是对物理边界与感知极限的重新丈量。”
                   </p>
                   <p className="text-xs text-ink/50 leading-relaxed font-medium">
                     其创作多聚焦于媒介的物理属性与文化转场，通过极具视觉穿透力的表达构建起观者与空间的深层场域。其作品曾多次受邀参加国际知名艺博会。
                   </p>
                </div>
             </div>

             <aside className="lg:col-span-4 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-silver/40 space-y-8">
                   <h4 className="text-xs font-black text-ink uppercase tracking-widest border-b border-silver/30 pb-4">成就与荣誉</h4>
                   <div className="space-y-6">
                      {[
                        '2025 亚洲先锋艺术家奖提名',
                        '“光影交织”数字影像竞赛一等奖',
                        '柏林艺术协会年度驻留学者',
                        '作品被多家顶级艺术基金会收藏'
                      ].map((award, i) => (
                        <div key={i} className="flex gap-4 items-start text-xs font-bold group">
                           <Star size={16} className="text-cobalt group-hover:fill-cobalt transition-colors shrink-0" />
                           <span className="text-ink/60 group-hover:text-ink transition-colors">{award}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-ink p-10 rounded-[3rem] text-white">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-8">艺术家商业画像</h4>
                  <div className="space-y-6">
                     {[
                       { label: '商业配合度', value: 'High' },
                       { label: '创意转化率', value: 'Excellent' },
                       { label: '合作信誉分', value: '98/100' },
                     ].map(info => (
                       <div key={info.label} className="space-y-1">
                         <p className="text-[9px] font-black text-cobalt uppercase tracking-widest">{info.label}</p>
                         <p className="text-base font-serif font-bold italic">{info.value}</p>
                       </div>
                     ))}
                  </div>
                </div>
             </aside>
          </div>
        </div>
      );
    }

    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-ink/20 font-bold uppercase tracking-widest animate-pulse">Context assembling...</p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 pt-6 md:pt-10"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-12">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-cobalt group hover:opacity-70 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-cobalt/5 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
             <ArrowLeft size={16} strokeWidth={3} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">Back To Exploration</span>
        </button>
      </div>
      {renderContent()}

      <motion.div>
        {showApplication && (
          <div className="fixed inset-0 z-50 bg-white md:bg-black/5 md:backdrop-blur-xl flex items-center justify-center p-0 md:p-10">
             <div className="w-full h-full md:max-w-5xl md:h-[90vh] bg-white md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 md:p-10 border-b border-silver/10 flex items-center justify-between sticky top-0 bg-white z-10">
                  <button onClick={() => setShowApplication(false)} className="p-3 bg-porcelain rounded-2xl text-ink hover:text-cobalt transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-serif font-black italic text-ink">项目申请 (Application)</h3>
                    <p className="text-[9px] text-ink/30 font-bold uppercase tracking-widest mt-1">Proposal Submission</p>
                  </div>
                  <div className="w-12" />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-16">
                  <div className="max-w-2xl mx-auto space-y-12">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-cobalt uppercase tracking-[0.3em]">01. 基础信息</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-ink/40 uppercase">联系姓名</label>
                          <input type="text" className="w-full p-4 bg-porcelain rounded-2xl border border-transparent focus:border-cobalt transition-all outline-none text-sm font-bold" placeholder="您的称呼" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-ink/40 uppercase">个人主页/作品集</label>
                          <input type="text" className="w-full p-4 bg-porcelain rounded-2xl border border-transparent focus:border-cobalt transition-all outline-none text-sm font-bold" placeholder="https://" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-cobalt uppercase tracking-[0.3em]">02. 作品提案</h4>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-ink/40 uppercase">创作构思 (Concept)</label>
                        <textarea className="w-full p-4 bg-porcelain rounded-3xl border border-transparent focus:border-cobalt transition-all outline-none text-sm font-bold h-40 resize-none" placeholder="简述您针对该项目的创作切入点..." />
                      </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xs font-black text-cobalt uppercase tracking-[0.3em]">03. 附件上传</h4>
                       <div className="border-2 border-dashed border-silver/40 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-cobalt/40 transition-colors cursor-pointer group">
                          <div className="w-16 h-16 bg-porcelain rounded-2xl flex items-center justify-center text-ink/20 group-hover:text-cobalt group-hover:scale-110 transition-all">
                            <Plus size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-ink">点击或拖拽上传</p>
                            <p className="text-[10px] text-ink/30 mt-1 uppercase font-black">Supported: PDF, JPG, MP4 (Max 50MB)</p>
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={() => setShowApplication(false)}
                      className="w-full py-6 bg-ink text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-cobalt transition-all active:scale-95"
                    >
                       确认提交 (FINALIZE SUBMISSION)
                    </button>
                  </div>
                </div>
             </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const ArrowLeft = (props: any) => (
  <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CheckCircleIcon = (props: any) => (
  <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const TrendingUpIcon = (props: any) => (
  <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ArrowUpRightIcon = (props: any) => (
  <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

import React from 'react';
import { 
  Camera, 
  Settings, 
  BarChart3, 
  FileEdit, 
  Globe, 
  Share2, 
  Info,
  ChevronRight,
  Eye,
  Heart,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const BrandCenterView = ({ onDetailClick }: { onDetailClick?: (id: string) => void }) => {
  return (
    <div className="space-y-12">
      {/* Brand Profile Banner */}
      <div className="relative rounded-[3.5rem] overflow-hidden group shadow-2xl h-[450px]">
        <img 
          src="https://picsum.photos/seed/brandbanner/1920/600" 
          className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-all duration-1000" 
          referrerPolicy="no-referrer"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent flex flex-col justify-end p-16">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex items-center gap-10">
                <div className="relative">
                  <img 
                    src="https://picsum.photos/seed/shangrila/200/200" 
                    className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl object-cover bg-white" 
                    referrerPolicy="no-referrer"
                    alt=""
                  />
                  <button className="absolute -bottom-2 -right-2 p-2.5 bg-cobalt text-white rounded-xl border-4 border-ink shadow-xl hover:scale-110 transition-transform">
                    <Camera size={16} strokeWidth={3} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-serif font-black text-white italic">香格里拉大酒店</h1>
                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] border border-white/20">专业版会员</span>
                  </div>
                  <p className="text-white/60 text-sm max-w-xl font-medium tracking-wide">
                    追求极致优雅与东方美学的现代奢华地标。我们致力于将艺术融入宾客每一刻的触达体验中。
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-white text-ink rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all shadow-xl">预览品牌页</button>
                <button className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all">装修控制台</button>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-8 bg-white p-10 rounded-[3rem] border border-silver/40 shadow-sm text-center">
             <button onClick={() => onDetailClick?.('主页访客详细漏斗分析')} className="space-y-1 hover:bg-silver/10 rounded-2xl py-2 transition-all active:scale-95">
                <p className="text-2xl font-serif font-black text-ink italic">42.5k</p>
                <p className="text-[10px] text-ink/30 font-bold uppercase tracking-[0.2em]">主页总访客</p>
             </button>
             <button onClick={() => onDetailClick?.('已收藏您的艺术家名录')} className="border-x border-silver/30 space-y-1 hover:bg-silver/10 rounded-2xl py-2 transition-all active:scale-95">
                <p className="text-2xl font-serif font-black text-ink italic">1,248</p>
                <p className="text-[10px] text-ink/30 font-bold uppercase tracking-[0.2em]">艺术家收藏数</p>
             </button>
             <button onClick={() => onDetailClick?.('管理当前活跃项目动态')} className="space-y-1 hover:bg-silver/10 rounded-2xl py-2 transition-all active:scale-95">
                <p className="text-2xl font-serif font-black text-ink italic">12</p>
                <p className="text-[10px] text-ink/30 font-bold uppercase tracking-[0.2em]">活跃项目动态</p>
             </button>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-silver/50 pb-4">
              <h3 className="text-xl font-serif font-bold text-ink italic uppercase tracking-wider">内容展示管理</h3>
              <button className="flex items-center gap-2 text-[10px] font-black text-cobalt uppercase underline underline-offset-4">
                <Plus size={14} />
                发布艺术动态
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <button 
                  key={i} 
                  onClick={() => onDetailClick?.(`内容编辑器：编辑第 ${i} 篇艺术动态`)}
                  className="bg-white rounded-[2.5rem] border border-silver/40 overflow-hidden shadow-sm group hover:shadow-2xl transition-all text-left active:scale-[0.98]"
                >
                   <div className="aspect-video relative overflow-hidden">
                     <img 
                        src={`https://picsum.photos/seed/content${i}/800/600`} 
                        className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-all duration-1000" 
                        referrerPolicy="no-referrer"
                        alt=""
                     />
                     <div className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                       <FileEdit size={14} className="text-cobalt" />
                     </div>
                   </div>
                   <div className="p-8">
                     <h4 className="text-lg font-bold text-ink mb-4 leading-tight group-hover:text-cobalt transition-colors italic">艺术驻留项目：探寻静谧之蓝的深处</h4>
                     <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink/20">
                        <span className="flex items-center gap-2"><Eye size={12} /> 1.2k 阅读</span>
                        <span className="flex items-center gap-2"><Heart size={12} /> 245 喜欢</span>
                     </div>
                   </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-8">
           <div className="bg-white p-8 rounded-[3rem] border border-silver/40 shadow-sm space-y-6">
              <h4 className="text-xs font-bold text-ink uppercase tracking-[0.2em] mb-4 flex items-center gap-2 pb-4 border-b border-silver/30">
                品牌资产配置 (ASSETS)
              </h4>
              <div className="space-y-2">
                {[
                  { label: '品牌视觉识别系统', icon: <Globe size={18} /> },
                  { label: '合作品牌手册 (PDF)', icon: <Info size={18} /> },
                  { label: '官方社交媒体矩阵', icon: <Share2 size={18} /> },
                  { label: '核心粉丝群体画像', icon: <BarChart3 size={18} /> },
                  { label: '品牌通用入驻协议', icon: <Settings size={18} /> },
                ].map((item, idx) => (
                  <button 
                    key={item.label}
                    onClick={() => onDetailClick?.(item.label)}
                    className="w-full flex items-center justify-between py-4 group hover:px-2 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-ink/20 group-hover:text-cobalt transition-all">{item.icon}</div>
                      <span className="text-xs font-bold text-ink uppercase tracking-widest">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-ink/20 group-hover:text-cobalt group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
           </div>

           <div className="bg-cobalt p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 text-center">
                 <h3 className="text-3xl font-serif font-black italic mb-2 tracking-tighter">Premium VIP</h3>
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 mb-10">Exclusive Access & Support</p>
                 <p className="text-xs font-bold leading-relaxed mb-10 text-white/60">您的专属客户经理: **王希雅 (Xiya)** {"\n"} 随时陪伴您的艺术升级之旅</p>
                 <button className="w-full py-4 rounded-xl bg-white text-cobalt text-[10px] font-black uppercase tracking-[0.3em] hover:bg-ink hover:text-white transition-all shadow-xl">拨打专属热线</button>
              </div>
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/gray-floral.png')]"></div>
           </div>
        </aside>
      </div>
    </div>
  );
};

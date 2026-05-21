import React from 'react';
import { Settings, ShieldCheck, Heart, Bookmark, History, CreditCard, ChevronRight, BookOpen, PenTool, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

export const MeView = ({ 
  onSwitchRole, 
  onEditProfile,
  onStatClick,
  onReportClick,
  onModuleClick,
  onMenuClick,
  onLogout
}: { 
  onSwitchRole?: () => void;
  onEditProfile?: () => void;
  onStatClick?: (type: 'works' | 'fans' | 'likes') => void;
  onReportClick?: () => void;
  onModuleClick?: (id: string) => void;
  onMenuClick?: (label: string) => void;
  onLogout?: () => void;
}) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Profile & Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div 
            onClick={onEditProfile}
            className="group bg-white p-12 rounded-[3.5rem] shadow-sm border border-silver/40 relative overflow-hidden flex flex-col items-center text-center cursor-pointer hover:shadow-xl hover:border-cobalt/20 transition-all active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cobalt/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
            
            {/* Role Switcher Floating Action */}
            {onSwitchRole && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSwitchRole();
                }}
                className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-cobalt text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all z-20"
              >
                进入B端管理后台
              </button>
            )}
            <div className="relative group/avatar">
              <div className="w-32 h-32 rounded-full border-8 border-porcelain shadow-2xl overflow-hidden bg-porcelain">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  referrerPolicy="no-referrer"
                  alt="Avatar"
                />
              </div>
              <div className="absolute bottom-2 right-2 bg-cobalt text-white p-2 rounded-2xl border-4 border-white shadow-xl group-hover/avatar:scale-110 transition-transform z-10">
                <ShieldCheck size={18} strokeWidth={3} />
              </div>
            </div>
            <div className="mt-8 transition-transform group-hover:translate-y-1">
              <h2 className="text-3xl font-serif font-bold text-ink italic leading-tight">陆川霖 Lin</h2>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="text-[10px] font-bold text-cobalt bg-cobalt/5 px-4 py-1 rounded-full uppercase tracking-widest border border-cobalt/10">认证艺术家</span>
              </div>
              <p className="mt-4 text-xs text-ink/30 font-medium uppercase tracking-widest">Contemporary Sculpture / Installation</p>
            </div>
            
            <div className="mt-12 w-full grid grid-cols-3 gap-4 border-t border-silver/30 pt-8">
              <button 
                onClick={(e) => { e.stopPropagation(); onStatClick?.('works'); }}
                className="hover:bg-porcelain/50 rounded-xl py-2 transition-colors"
              >
                <p className="text-xl font-serif font-bold text-ink italic">1.2k</p>
                <p className="text-[9px] text-ink/20 font-bold uppercase tracking-[0.2em] mt-1">Works</p>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onStatClick?.('fans'); }}
                className="hover:bg-porcelain/50 rounded-xl py-2 border-x border-silver/30 transition-colors"
              >
                <p className="text-xl font-serif font-bold text-ink italic">8.5k</p>
                <p className="text-[9px] text-ink/20 font-bold uppercase tracking-[0.2em] mt-1">Fans</p>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onStatClick?.('likes'); }}
                className="hover:bg-porcelain/50 rounded-xl py-2 transition-colors"
              >
                <p className="text-xl font-serif font-bold text-ink italic">24k</p>
                <p className="text-[9px] text-ink/20 font-bold uppercase tracking-[0.2em] mt-1">Likes</p>
              </button>
            </div>
          </div>

          <div 
            onClick={onReportClick}
            className="bg-ink p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer hover:shadow-cobalt/20 transition-all border border-transparent hover:border-white/10"
          >
             <div className="relative z-10">
               <h3 className="text-lg font-serif font-bold italic mb-4 group-hover:text-cobalt transition-colors">创作灵感周报</h3>
               <p className="text-xs text-white/40 leading-relaxed mb-8">本周你的作品《无尽之维》收到了来自 DIOR 策展人的特别关注。继续保持创作！</p>
               <button 
                onClick={(e) => { e.stopPropagation(); onReportClick?.(); }}
                className="px-8 py-3 bg-white text-ink text-[10px] font-bold rounded-full uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all shadow-xl active:scale-95"
               >
                查看详情
               </button>
             </div>
             <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-cobalt/20 blur-[100px] group-hover:scale-150 transition-transform"></div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          {/* Core Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <button 
              onClick={() => onModuleClick?.('creation')}
              className="bg-white p-10 rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-8 shadow-sm hover:shadow-2xl hover:shadow-cobalt/5 active:scale-[0.98] transition-all group"
             >
                <div className="w-14 h-14 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <PenTool size={24} />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-serif font-bold text-ink italic">创作中心</h4>
                  <p className="text-[10px] text-ink/30 mt-2 uppercase tracking-[0.2em] font-bold">Creation Studio & Portfolio</p>
                </div>
                <div className="w-full h-1.5 bg-silver/20 rounded-full overflow-hidden">
                  <div className="w-[70%] h-full bg-blue-600 group-hover:w-full transition-all duration-1000"></div>
                </div>
             </button>
             
             <button 
              onClick={() => onModuleClick?.('projects')}
              className="bg-white p-10 rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-8 shadow-sm hover:shadow-2xl hover:shadow-cobalt/5 active:scale-[0.98] transition-all group"
             >
                <div className="w-14 h-14 bg-purple-50 rounded-[1.5rem] flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <LayoutGrid size={24} />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-serif font-bold text-ink italic">项目管理</h4>
                  <p className="text-[10px] text-ink/30 mt-2 uppercase tracking-[0.2em] font-bold">Project & Collaborations</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                  <span className="text-[9px] font-bold text-purple-600 uppercase">3 活跃项目</span>
                </div>
             </button>
             
             <button 
              onClick={() => onModuleClick?.('academic')}
              className="bg-white p-10 rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-8 shadow-sm hover:shadow-2xl hover:shadow-cobalt/5 active:scale-[0.98] transition-all group"
             >
                <div className="w-14 h-14 bg-green-50 rounded-[1.5rem] flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <BookOpen size={24} />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-serif font-bold text-ink italic">学术研习</h4>
                  <p className="text-[10px] text-ink/30 mt-2 uppercase tracking-[0.2em] font-bold">Academic & Art Learning</p>
                </div>
                <p className="text-[10px] font-bold text-ink/40 uppercase tracking-tighter">本月已学习 24 小时</p>
             </button>
             
             <button 
              onClick={() => onModuleClick?.('revenue')}
              className="bg-white p-10 rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-8 shadow-sm hover:shadow-2xl hover:shadow-cobalt/5 active:scale-[0.98] transition-all group"
             >
                <div className="w-14 h-14 bg-orange-50 rounded-[1.5rem] flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <CreditCard size={24} />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-serif font-bold text-ink italic">收益报表</h4>
                  <p className="text-[10px] text-ink/30 mt-2 uppercase tracking-[0.2em] font-bold">Revenue & Payout Analytics</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-xs font-bold text-ink group-hover:text-cobalt transition-colors">CNY</span>
                  <span className="text-xl font-serif font-bold italic line-clamp-1 group-hover:text-cobalt transition-colors">12,450.00</span>
                </div>
             </button>
          </div>

          {/* Menu List & Settings */}
          <div className="bg-white p-8 rounded-[3rem] border border-silver/40 shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
               {[
                 { label: '我的收藏与喜欢', icon: <Heart size={18} /> },
                 { label: '灵感书签库', icon: <Bookmark size={18} /> },
                 { label: '项目申请记录', icon: <History size={18} /> },
                 { label: '艺术家隐私保护', icon: <ShieldCheck size={18} /> },
                 { label: '支付与钱包安全', icon: <CreditCard size={18} /> },
                 { label: '平台账户偏好', icon: <Settings size={18} /> },
               ].map((item, idx) => (
                 <button 
                   key={item.label}
                   onClick={() => onMenuClick?.(item.label)}
                   className="w-full flex items-center justify-between py-5 border-b border-silver/30 last:border-none group hover:px-2 transition-all active:translate-x-1"
                 >
                   <div className="flex items-center gap-4">
                     <div className="text-ink/20 group-hover:text-cobalt transition-colors">{item.icon}</div>
                     <span className="text-xs font-bold text-ink uppercase tracking-widest">{item.label}</span>
                   </div>
                   <ChevronRight size={14} className="text-ink/20 group-hover:text-cobalt group-hover:translate-x-1 transition-all" />
                 </button>
               ))}
             </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full py-8 text-xs font-black text-red-500 uppercase tracking-[0.4em] hover:bg-red-50 rounded-full transition-all active:scale-95"
          >
             Terminate Session / 退出登录
          </button>
        </div>
      </div>
    </div>
  );
};

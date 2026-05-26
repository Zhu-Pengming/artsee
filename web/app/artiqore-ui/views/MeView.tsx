// @ts-nocheck
'use client';

import React from 'react';
import { Settings, ShieldCheck, Heart, Bookmark, History, CreditCard, ChevronRight, BookOpen, PenTool, LayoutGrid, Users, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export const MeView = ({ 
  onSwitchRole, 
  onEditProfile,
  onStatClick,
  onReportClick,
  onModuleClick,
  onMenuClick,
  onLogout,
  onPaymentRequest
}: { 
  onSwitchRole?: () => void;
  onEditProfile?: () => void;
  onStatClick?: (type: 'works' | 'fans' | 'likes') => void;
  onReportClick?: () => void;
  onModuleClick?: (id: string) => void;
  onMenuClick?: (label: string) => void;
  onLogout?: () => void;
  onPaymentRequest?: (info: { amount: string, title: string, itemTitle: string }) => void;
}) => {
  return (
    <div className="space-y-6 md:space-y-12 pb-12">
      {/* Profile & Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
        <div className="lg:col-span-4 space-y-4 md:space-y-8">
          <div 
            onClick={onEditProfile}
            className="group bg-white p-6 md:p-12 rounded-2xl md:rounded-[3.5rem] shadow-sm border border-silver/40 relative overflow-hidden flex flex-col items-center text-center cursor-pointer hover:shadow-lg transition-all active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cobalt/5 rounded-full -mr-16 -mt-16 transition-transform md:group-hover:scale-150 duration-700"></div>
            
            {/* Role Switcher Floating Action */}
            {onSwitchRole && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSwitchRole();
                }}
                className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-cobalt text-white rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all z-20"
              >
                管理端
              </button>
            )}
            <div className="relative group/avatar">
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 md:border-8 border-porcelain shadow-xl overflow-hidden bg-porcelain">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                  referrerPolicy="no-referrer"
                  alt="Avatar"
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-cobalt text-white p-1.5 rounded-xl border-2 border-white shadow-xl md:group-hover/avatar:scale-110 transition-transform z-10">
                <ShieldCheck size={12} strokeWidth={3} />
              </div>
            </div>
            <div className="mt-4 md:mt-8">
              <h2 className="text-xl md:text-3xl font-serif font-bold text-ink italic leading-tight">陆川霖 Lin</h2>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-[7px] md:text-[10px] font-bold text-cobalt bg-cobalt/5 px-3 py-0.5 md:py-1 rounded-full uppercase tracking-widest border border-cobalt/10">艺术家</span>
              </div>
            </div>
            
            <div className="mt-6 md:mt-12 w-full grid grid-cols-3 gap-2 border-t border-silver/30 pt-6">
              <button 
                onClick={(e) => { e.stopPropagation(); onStatClick?.('works'); }}
                className="hover:bg-porcelain/50 rounded-lg py-1.5 transition-colors"
              >
                <p className="text-sm md:text-xl font-serif font-bold text-ink italic">1.2k</p>
                <p className="text-[7px] text-ink/20 font-bold uppercase tracking-widest mt-0.5">Works</p>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onStatClick?.('fans'); }}
                className="hover:bg-porcelain/50 rounded-lg py-1.5 border-x border-silver/30 transition-colors"
              >
                <p className="text-sm md:text-xl font-serif font-bold text-ink italic">8.5k</p>
                <p className="text-[7px] text-ink/20 font-bold uppercase tracking-widest mt-0.5">Fans</p>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onStatClick?.('likes'); }}
                className="hover:bg-porcelain/50 rounded-lg py-1.5 transition-colors"
              >
                <p className="text-sm md:text-xl font-serif font-bold text-ink italic">24k</p>
                <p className="text-[7px] text-ink/20 font-bold uppercase tracking-widest mt-0.5">Likes</p>
              </button>
            </div>
          </div>

          <div 
            onClick={onReportClick}
            className="bg-ink p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group cursor-pointer border border-transparent hover:border-white/10"
          >
             <div className="relative z-10">
               <h3 className="text-base md:text-lg font-serif font-bold italic mb-2 md:mb-4 group-hover:text-cobalt transition-colors">创作灵感周报</h3>
               <p className="text-[10px] md:text-xs text-white/40 leading-relaxed mb-4 md:mb-8">你本周收到了来自 DIOR 策展人的特别关注。</p>
               <button 
                onClick={(e) => { e.stopPropagation(); onReportClick?.(); }}
                className="px-6 py-2 bg-white text-ink text-[8px] md:text-[10px] font-bold rounded-lg md:rounded-full uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all shadow-xl active:scale-95"
               >
                查看详情
               </button>
             </div>
             <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-cobalt/20 blur-[100px] md:group-hover:scale-125 transition-transform"></div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4 md:space-y-12">
          {/* Core Modules Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-8">
             <button 
              onClick={() => onModuleClick?.('creation')}
              className="bg-white p-6 md:p-10 rounded-xl md:rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-4 md:gap-8 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all group"
             >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 rounded-lg md:rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <PenTool size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-base md:text-xl font-serif font-bold text-ink italic leading-tight">创作中心</h4>
                  <p className="text-[6px] md:text-[10px] text-ink/30 mt-1 uppercase tracking-widest font-bold">Studio</p>
                </div>
             </button>
             
             <button 
              onClick={() => onModuleClick?.('applications')}
              className="bg-white p-6 md:p-10 rounded-xl md:rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-4 md:gap-8 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all group"
             >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-purple-50 rounded-lg md:rounded-[1.5rem] flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <LayoutGrid size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-base md:text-xl font-serif font-bold text-ink italic leading-tight">申请管理</h4>
                  <p className="text-[6px] md:text-[10px] text-ink/30 mt-1 uppercase tracking-widest font-bold">Application</p>
                </div>
             </button>
             
             <button 
              onClick={() => onModuleClick?.('mentorship')}
              className="bg-white p-6 md:p-10 rounded-xl md:rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-4 md:gap-8 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all group"
             >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-pink-50 rounded-lg md:rounded-[1.5rem] flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-all">
                  <Users size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-base md:text-xl font-serif font-bold text-ink italic leading-tight">导师计划</h4>
                  <p className="text-[6px] md:text-[10px] text-ink/30 mt-1 uppercase tracking-widest font-bold">Mentorship</p>
                </div>
             </button>
             
             <button 
              onClick={() => onModuleClick?.('roadmap')}
              className="bg-white p-6 md:p-10 rounded-xl md:rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-4 md:gap-8 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all group"
             >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-cobalt/5 rounded-lg md:rounded-[1.5rem] flex items-center justify-center text-cobalt group-hover:bg-cobalt group-hover:text-white transition-all">
                  <TrendingUp size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-base md:text-xl font-serif font-bold text-ink italic leading-tight">成长路径</h4>
                  <p className="text-[6px] md:text-[10px] text-ink/30 mt-1 uppercase tracking-widest font-bold">Roadmap</p>
                </div>
             </button>

             <button 
              onClick={() => onModuleClick?.('academic')}
              className="bg-white p-6 md:p-10 rounded-xl md:rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-4 md:gap-8 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all group"
             >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-green-50 rounded-lg md:rounded-[1.5rem] flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <BookOpen size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-base md:text-xl font-serif font-bold text-ink italic leading-tight">学术研习</h4>
                  <p className="text-[6px] md:text-[10px] text-ink/30 mt-1 uppercase tracking-widest font-bold">Academic</p>
                </div>
             </button>
             
             <button 
              onClick={() => onModuleClick?.('revenue')}
              className="bg-white p-6 md:p-10 rounded-xl md:rounded-[2.5rem] border border-silver/40 flex flex-col items-start gap-4 md:gap-8 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all group"
             >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-orange-50 rounded-lg md:rounded-[1.5rem] flex items-center justify-center text-orange-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <CreditCard size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-base md:text-xl font-serif font-bold text-ink italic leading-tight">收益报表</h4>
                  <p className="text-[6px] md:text-[10px] text-ink/30 mt-1 uppercase tracking-widest font-bold">Revenue</p>
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
                   onClick={() => {
                      if (item.label === '支付与钱包安全') {
                        onPaymentRequest?.({ amount: '¥99.00', title: '钱包余额充值', itemTitle: '艺术家创作基金账户充值' });
                      } else {
                        onMenuClick?.(item.label);
                      }
                    }}

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

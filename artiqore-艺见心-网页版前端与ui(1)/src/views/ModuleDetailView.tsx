import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  PenTool, 
  LayoutGrid, 
  BookOpen, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Heart,
  Bookmark,
  History,
  Settings as SettingsIcon,
  Search,
  Filter,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ModuleDetailViewProps {
  moduleId: string;
}

export const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({ moduleId }) => {
  const renderContent = () => {
    switch (moduleId) {
      case 'academic':
        return (
          <div className="space-y-10">
            <header>
              <h2 className="text-3xl font-serif font-bold text-ink italic">学术研习 (Art Learning)</h2>
              <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Deep Dive into Theory & Practice</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: '本月学习时长', value: '24.5h', change: '+12%', color: 'text-green-600' },
                { label: '已修完课程', value: '12', change: '+2', color: 'text-cobalt' },
                { label: '研习积分', value: '1,280', change: '+150', color: 'text-orange-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-silver/40 shadow-sm">
                  <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest mb-4">{stat.label}</p>
                  <h3 className="text-2xl font-serif font-black text-ink italic">{stat.value}</h3>
                  <p className={cn("text-[9px] font-bold mt-2", stat.color)}>{stat.change} Since last session</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold italic border-b border-silver/30 pb-4">在研课题 (Current Research)</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: '当代雕塑中的“负空间”叙事', progress: 85, instructor: 'Prof. Zhang', deadline: '2026-05-12' },
                  { title: '生成式 AI 与艺术版权的边界', progress: 40, instructor: 'Dr. Lee', deadline: '2026-06-01' },
                  { title: '公共艺术中的沉浸式交互设计', progress: 10, instructor: 'Elena Weber', deadline: '2026-07-20' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-silver/40 flex items-center justify-between group hover:border-cobalt/30 transition-all cursor-pointer">
                    <div className="space-y-2 flex-1">
                      <h4 className="text-sm font-bold text-ink group-hover:text-cobalt transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-4 text-[9px] font-bold text-ink/30 uppercase tracking-widest">
                        <span>导师: {item.instructor}</span>
                        <span>截止: {item.deadline}</span>
                      </div>
                    </div>
                    <div className="w-32 flex flex-col items-end gap-2">
                      <span className="text-[10px] font-bold text-cobalt">{item.progress}%</span>
                      <div className="w-full h-1 bg-silver/20 rounded-full overflow-hidden">
                        <div className="h-full bg-cobalt transition-all duration-1000" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-10">
             <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-serif font-bold text-ink italic">收益报表 (Analytics)</h2>
                <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Financial Performance & Forecast</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">可提现余额 (Available)</p>
                <p className="text-2xl font-serif font-black text-cobalt italic">CNY 8,420.50</p>
              </div>
            </header>

            <div className="bg-ink p-10 rounded-[3rem] text-white flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">本年度累计总收益</p>
                <h3 className="text-5xl font-serif font-black italic">¥12,450.00</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                    <TrendingUp size={14} />
                    <span>同比增长 128.5%</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <button className="px-10 py-4 bg-cobalt text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-cobalt/40 hover:scale-105 active:scale-95 transition-all">
                  立即提现 (WITHDRAW)
                </button>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-center border-b border-silver/30 pb-4">
                <h3 className="text-xl font-serif font-bold italic">收益明细 (Transactions)</h3>
                <div className="flex gap-2">
                  <button className="p-2 border border-silver/30 rounded-xl text-ink/30 hover:text-cobalt"><Filter size={16} /></button>
                  <button className="p-2 border border-silver/30 rounded-xl text-ink/30 hover:text-cobalt"><Search size={16} /></button>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: '香格里拉大酒店沙龙分红', date: '2026-04-12', amount: '+ 4,200.00', type: 'collab' },
                  { label: '作品《重力》版画售出', date: '2026-04-08', amount: '+ 1,850.00', type: 'sale' },
                  { label: '平台创作激励 (三月份)', date: '2026-04-01', amount: '+ 240.00', type: 'incentive' },
                  { label: '私人定制佣金 (预付款)', date: '2026-03-25', amount: '+ 5,000.00', type: 'collab' },
                ].map((tx, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-silver/40 flex items-center justify-between hover:bg-porcelain/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        tx.type === 'collab' ? "bg-cobalt/5 text-cobalt" : "bg-orange-50 text-orange-600"
                      )}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">{tx.label}</p>
                        <p className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">{tx.date}</p>
                      </div>
                    </div>
                    <p className="text-lg font-serif font-black text-ink italic">{tx.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'creation':
        return (
          <div className="space-y-10">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold text-ink italic">创作中心 (Studio)</h2>
                <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Manage Your Creative Output</p>
              </div>
              <button className="p-4 bg-ink text-white rounded-2xl hover:bg-cobalt transition-all shadow-xl active:scale-95">
                <Plus size={24} />
              </button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: '近期草图', count: '48', icon: <PenTool size={18} /> },
                { label: '成品库', count: '124', icon: <LayoutGrid size={18} /> },
                { label: '协作中', count: '3', icon: <History size={18} /> },
                { label: '已售出', count: '12', icon: <CheckCircle2 size={18} /> },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-silver/40 shadow-sm text-center space-y-3 hover:border-cobalt/30 transition-all cursor-pointer group">
                  <div className="text-ink/20 group-hover:text-cobalt transition-colors flex justify-center">{stat.icon}</div>
                  <div>
                    <p className="text-xl font-serif font-black italic">{stat.count}</p>
                    <p className="text-[9px] font-bold text-ink/30 uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold italic">作品集预览 (Portfolio Preview)</h3>
                <button className="text-[10px] font-bold text-cobalt uppercase underline underline-offset-4">查看完整版</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square rounded-3xl overflow-hidden border border-silver/40 group relative cursor-pointer">
                    <img 
                      src={`https://picsum.photos/seed/creation${i}/600/600`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" 
                      referrerPolicy="no-referrer"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all p-4">
                      <p className="text-white text-[10px] font-bold uppercase tracking-widest text-center">编辑详情</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'report':
        return (
          <div className="max-w-2xl mx-auto space-y-12">
            <header className="text-center space-y-4">
              <div className="inline-block px-4 py-1 bg-cobalt text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em]">Insight / Weekly</div>
              <h2 className="text-4xl font-serif font-extrabold text-ink italic leading-tight">创作灵感周报</h2>
              <p className="text-ink/30 text-[10px] font-black uppercase tracking-[0.4em]">2026.04.14 - 2026.04.20</p>
            </header>

            <div className="bg-white p-12 rounded-[3.5rem] border border-silver/40 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 space-y-10">
                  <section className="space-y-6">
                    <h3 className="text-xs font-black text-cobalt uppercase tracking-[0.3em] flex items-center gap-2">
                       <TrendingUp size={16} /> 趋势洞察
                    </h3>
                    <p className="text-ink/80 leading-relaxed font-serif text-lg italic">
                      “当前上海地区对‘生物形态雕塑’的搜索量环比增长了 **42%**。您的作品《无尽之维》正好切中了这一审美趋势。”
                    </p>
                  </section>

                  <section className="space-y-6 border-t border-silver/30 pt-10">
                    <h3 className="text-xs font-black text-cobalt uppercase tracking-[0.3em] flex items-center gap-2">
                       <History size={16} /> 特别关注
                    </h3>
                    <div className="flex gap-6 items-center p-6 bg-porcelain rounded-3xl">
                      <img src="https://picsum.photos/seed/dior/100/100" className="w-16 h-16 rounded-2xl object-cover grayscale" referrerPolicy="no-referrer" alt="" />
                      <div>
                        <p className="text-sm font-bold text-ink italic">Dior 策展团队</p>
                        <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest mt-1">三分钟前停留过您的个人页</p>
                      </div>
                    </div>
                    <p className="text-xs text-ink/60 leading-normal">
                      来自 Dior 的策展团队近期活跃在“空间材质”标签下。建议在近期增加两篇关于材料实验的动态，以增加曝光覆盖面。
                    </p>
                  </section>

                  <section className="space-y-6 border-t border-silver/30 pt-10 pb-4 text-center">
                    <p className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.4em]">End of report</p>
                    <button className="w-full py-5 bg-ink text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cobalt transition-all shadow-xl">
                      分享此报告 (SHARE)
                    </button>
                  </section>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-cobalt/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>
          </div>
        );

      case 'collections':
      case 'bookmarks':
      case 'applications':
        const titleMap: Record<string, string> = {
          collections: '我的收藏与喜欢',
          bookmarks: '灵感书签库',
          applications: '项目申请记录'
        };
        return (
          <div className="space-y-10">
             <header>
              <h2 className="text-3xl font-serif font-bold text-ink italic">{titleMap[moduleId]}</h2>
              <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Archive & Personal Curation</p>
            </header>

            <div className="flex bg-silver/30 p-1.5 rounded-2xl w-fit">
              {['全部', '本月', '今年'].map(filter => (
                <button key={filter} className="px-6 py-2 rounded-xl text-[10px] font-bold uppercase transition-all hover:bg-white/50 active:scale-95">
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-silver/40 shadow-sm group hover:shadow-xl transition-all cursor-pointer">
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden mb-6 relative">
                    <img src={`https://picsum.photos/seed/${moduleId}${i}/600/800`} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" referrerPolicy="no-referrer" alt="" />
                    <div className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {moduleId === 'collections' ? <Heart size={14} className="text-red-500 fill-red-500" /> : <Bookmark size={14} className="text-cobalt fill-cobalt" />}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-ink italic truncate">
                    {moduleId === 'applications' ? '香格里拉大酒店沙龙项目' : '当代艺术展：《流动的边界》'}
                  </h4>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">2026-04-12</span>
                    {moduleId === 'applications' && (
                      <span className="text-[9px] font-black text-cobalt bg-cobalt/5 px-3 py-1 rounded-full uppercase">审核中</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'privacy':
      case 'wallet':
      case 'settings':
        const settingsTitleMap: Record<string, string> = {
          privacy: '艺术家隐私保护',
          wallet: '支付与钱包安全',
          settings: '平台账户偏好'
        };
        const settingsDescMap: Record<string, string> = {
          privacy: '控制您的作品可见性与商业授权范围',
          wallet: '管理提现渠道与交易凭证安全',
          settings: '个性化您的浏览体验与智能推送策略'
        };

        return (
          <div className="max-w-2xl mx-auto space-y-10">
            <header className="space-y-2">
              <h2 className="text-3xl font-serif font-bold text-ink italic">{settingsTitleMap[moduleId]}</h2>
              <p className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em]">{settingsDescMap[moduleId]}</p>
            </header>

            <div className="bg-white rounded-[3rem] border border-silver/40 shadow-sm overflow-hidden divide-y divide-silver/30">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="p-8 flex items-center justify-between hover:bg-porcelain/30 transition-all cursor-pointer group">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-ink">配置项示例 {idx}</p>
                    <p className="text-xs text-ink/40">这是一个关于该设置项的简要描述和当前状态。</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-ink/20 uppercase">已开启</span>
                    <div className="w-10 h-6 bg-cobalt rounded-full p-1 flex justify-end">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-ink/5 rounded-3xl border border-silver/40">
              <div className="flex gap-4">
                <ShieldCheck className="text-cobalt shrink-0" size={24} />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-widest">安全建议 (Secured)</h4>
                  <p className="text-xs text-ink/60 leading-relaxed">
                    我们采用了端到端加密技术保护您的商业数据。建议定期检查您的授权列表，以确保艺术权益未被滥用。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-96 flex items-center justify-center">
            <p className="text-ink/20 font-bold uppercase tracking-widest animate-pulse">Building context...</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24"
    >
      {renderContent()}
    </motion.div>
  );
};

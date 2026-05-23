import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Users, 
  Calendar,
  MessageCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface BusinessDetailViewProps {
  detailId: string;
}

export const BusinessDetailView: React.FC<BusinessDetailViewProps> = ({ detailId }) => {
  const renderContent = () => {
    // Basic mapping of detailId to content
    if (detailId.includes('报表') || detailId.includes('金额') || detailId.includes('数据分析')) {
      return (
        <div className="space-y-10">
          <header>
            <h2 className="text-3xl font-serif font-bold text-ink italic">商业数据深度分析</h2>
            <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Detailed Financial & Engagement Breakdown</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: '季度总营收', value: '¥482,000', change: '+15.2%', up: true },
              { label: '平均月活存留', value: '82.4%', change: '+2.1%', up: true },
              { label: '获客成本 (CAC)', value: '¥12.50', change: '-5.4%', up: false },
              { label: '合作转化率', value: '18.6%', change: '+0.8%', up: true },
            ].map(stat => (
              <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-silver/40 shadow-sm">
                <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest mb-4">{stat.label}</p>
                <h3 className="text-2xl font-serif font-black text-ink italic">{stat.value}</h3>
                <div className={cn("flex items-center gap-1 text-[9px] font-bold mt-2", stat.up ? "text-green-600" : "text-red-500")}>
                  {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-silver/40 shadow-sm">
            <h3 className="text-xl font-serif font-bold italic mb-10">渠道贡献分布 (Revenue by Channel)</h3>
            <div className="h-64 flex items-end gap-12 px-4 pb-4">
              {[60, 85, 45, 95, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full bg-silver/10 rounded-2xl relative overflow-hidden group-hover:bg-cobalt/5 transition-all" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 left-0 w-full bg-cobalt transition-all duration-1000 group-hover:bg-ink" style={{ height: `${h}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-ink/30 uppercase tracking-tighter">CH {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (detailId.includes('项目') || detailId.includes('管理') || detailId.includes('策划')) {
      return (
        <div className="space-y-10">
          <header className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-serif font-bold text-ink italic">{detailId.replace('进入项目', '').replace('的管理控制台', '') || '项目管理详情'}</h2>
              <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Project Operations & Delivery</p>
            </div>
            <div className="px-6 py-2 bg-cobalt/5 text-cobalt rounded-full text-[10px] font-black uppercase tracking-widest border border-cobalt/10">
              运行中 (ACTIVE)
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <div className="bg-white p-10 rounded-[3.5rem] border border-silver/40 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-bold italic">当前里程碑 (Current Milestone)</h3>
                  <span className="text-[10px] font-bold text-ink/30">待交付日期: 2026.05.20</span>
                </div>
                <div className="space-y-6">
                  {[
                    { label: '初步概念设计审核', done: true },
                    { label: '艺术家联络与签约', done: true },
                    { label: '物料准备与现场勘测', done: false, active: true },
                    { label: '正式发布与 PR 启动', done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-6 group">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                        step.done ? "bg-green-500 border-green-500 text-white" : 
                        step.active ? "border-cobalt text-cobalt animate-pulse" : "border-silver/40 text-ink/20"
                      )}>
                        {step.done ? <CheckCircle2 size={16} /> : <div className="text-[10px] font-black">{i + 1}</div>}
                      </div>
                      <span className={cn(
                        "text-sm font-bold transition-all",
                        step.done ? "text-ink/40 line-through" : step.active ? "text-ink" : "text-ink/20"
                      )}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-silver/40 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-serif font-bold italic">近期讨论 (Collaborative Activity)</h3>
                    <button className="text-[10px] font-black text-cobalt uppercase underline">打开群聊</button>
                 </div>
                 <div className="space-y-6">
                    {[1, 2].map(i => (
                      <div key={i} className="flex gap-4 items-start">
                         <img src={`https://i.pravatar.cc/100?u=proj${i}`} className="w-10 h-10 rounded-2xl border-2 border-silver/20" alt="" />
                         <div className="bg-silver/10 p-5 rounded-2xl flex-1">
                            <p className="text-xs text-ink/80 leading-relaxed font-medium">关于现场大屏的分辨率要求，我已经同步给艺术家了。对方表示将在周五前提供初步方案。</p>
                            <p className="text-[9px] font-black text-ink/20 uppercase tracking-widest mt-4">Xiya Wang · 24m ago</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-ink p-10 rounded-[3rem] text-white space-y-8">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">项目经理 (PM)</h4>
                  <p className="text-lg font-serif font-black italic">王希雅 (Xiya Wang)</p>
                </div>
                <div className="space-y-4">
                  <button className="w-full py-4 bg-white text-ink rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all">
                    在线通话
                  </button>
                  <button className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/20 transition-all">
                    查看通讯录
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-silver/40 space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-ink/30 border-b border-silver/30 pb-4">资产托管 (Shared Assets)</h4>
                <div className="space-y-3">
                  {[
                    { name: '策划案草案_v2.pdf', size: '4.2MB' },
                    { name: 'VI识别手册_Final.zip', size: '128MB' },
                    { name: '合同协议文本.docx', size: '42KB' },
                  ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-ink/20 group-hover:text-cobalt transition-colors" />
                        <span className="text-[10px] font-bold text-ink uppercase tracking-tight truncate max-w-[120px]">{file.name}</span>
                      </div>
                      <span className="text-[8px] font-black text-ink/20">{file.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      );
    }

    if (detailId.includes('艺术家')) {
      return (
        <div className="space-y-10">
          <header className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-ink italic">{detailId.replace('查看艺术家', '').replace('的完整作品集与商业画像', '') || '艺术家详情'}</h2>
              <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Professional Profile & Market Analytics</p>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-cobalt transition-all">发送邀约</button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-10">
               <div className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-silver/40">
                <img src="https://picsum.photos/seed/artistdetail/1200/900" className="w-full h-full object-cover grayscale" alt="" />
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-silver/40 space-y-6">
                <h3 className="text-xl font-serif font-bold italic">艺术家自述 (Artist Statement)</h3>
                <p className="text-sm text-ink/60 leading-relaxed">
                  我的创作始终围绕着人类知觉与空间尺度的张力展开。通过对工业材料的非典型解构，我试图在嘈杂的都市语境中重塑一种“静谧的抵抗”。
                </p>
              </div>
            </div>

            <div className="space-y-10">
               <div className="bg-white p-10 rounded-[3rem] border border-silver/40 space-y-8">
                  <h3 className="text-xl font-serif font-bold italic">商业价值分析 (Market Value)</h3>
                  <div className="space-y-6">
                     {[
                       { label: '平台信誉分', value: 'S Grade (98/100)' },
                       { label: '历史合作履约率', value: '100% (No disputes)' },
                       { label: '商业化适配门类', value: '奢侈品联名 / 酒店装置 / 艺术沙龙' },
                       { label: '核心受众画像', value: '高净值人群 / 线美主义者' },
                     ].map(info => (
                       <div key={info.label} className="space-y-1">
                         <p className="text-[10px] font-black text-cobalt uppercase tracking-[0.2em]">{info.label}</p>
                         <p className="text-sm font-bold text-ink">{info.value}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-ink p-10 rounded-[3rem] text-white">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-cobalt">
                       <BarChart3 size={32} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">合作预期指数</p>
                      <p className="text-3xl font-serif font-black italic">Excellent</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed mb-8 font-medium">该艺术家在过去的三次类似项目中均展现了极高的项目推进效率。系统评估其为本项目的高意向且低风险合作人選。</p>
                  <button className="w-full py-4 bg-white text-ink rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all">申请深度评测报告 (PDF)</button>
               </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Case (Fallback)
    return (
      <div className="space-y-10">
        <header>
          <h2 className="text-3xl font-serif font-bold text-ink italic">{detailId}</h2>
          <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Detailed View & Configuration</p>
        </header>
        <div className="bg-white p-20 rounded-[3rem] border border-silver/40 text-center space-y-6">
           <AlertCircle size={48} className="text-silver mx-auto" />
           <div>
              <h3 className="text-xl font-serif font-black italic">数据加载与解析中...</h3>
              <p className="text-xs text-ink/40 mt-2 font-bold uppercase tracking-widest">Detail view for {detailId} is coming soon.</p>
           </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="pb-24"
    >
      {renderContent()}
    </motion.div>
  );
};

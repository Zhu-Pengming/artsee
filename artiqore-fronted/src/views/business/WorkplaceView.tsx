import React from 'react';
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';

const DATA_CARDS = [
  { label: '累计合作金额', value: '¥1,580,000', change: '+12.5%', icon: <TrendingUp size={24} />, color: 'text-cobalt bg-cobalt/5' },
  { label: '正在执行项目', value: '8', change: '本月新增 2', icon: <Briefcase size={24} />, color: 'text-green-600 bg-green-50' },
  { label: '已合作艺术家', value: '42', change: '+3.2%', icon: <Users size={24} />, color: 'text-purple-600 bg-purple-50' },
  { label: '品牌主页曝光', value: '245k', change: '+18.4%', icon: <Eye size={24} />, color: 'text-orange-600 bg-orange-50' },
];

const CHART_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 550 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 900 },
];

const STATUS_COLUMNS = [
  { id: 'recruiting', label: '招募中', count: 3 },
  { id: 'negotiating', label: '洽谈中', count: 2 },
  { id: 'executing', label: '执行中', count: 2 },
  { id: 'completed', label: '已完成', count: 1 },
];

export const WorkplaceView = ({ onDetailClick }: { onDetailClick?: (id: string) => void }) => {
  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink italic">下午好, 陆川霖 (香格里拉大酒店)</h1>
          <p className="text-ink/40 text-[10px] tracking-[0.3em] uppercase mt-2 font-bold">Business Data Dashboard & Workplace Overview</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-silver/50 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:border-cobalt transition-all">
            <FileText size={14} />
            年度回顾报告
          </button>
          <button className="flex items-center gap-2 px-8 py-3 bg-cobalt text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-cobalt/20 hover:scale-105 active:scale-95 transition-all">
            <PlusCircle size={14} />
            发布项目
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {DATA_CARDS.map((card, idx) => (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={card.label}
            onClick={() => onDetailClick?.(card.label)}
            className="bg-white p-8 rounded-[2.5rem] border border-silver/40 shadow-sm flex items-start justify-between group hover:shadow-2xl hover:shadow-cobalt/5 transition-all text-left active:scale-95"
          >
            <div>
              <p className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em] mb-4">{card.label}</p>
              <h3 className="text-2xl font-serif font-black text-ink italic leading-none">{card.value}</h3>
              <p className="text-[10px] font-bold text-green-600 mt-4 flex items-center gap-1">
                <ArrowUpRight size={10} />
                {card.change}
              </p>
            </div>
            <div className={cn("p-4 rounded-2xl transition-transform group-hover:rotate-12 group-hover:scale-110", card.color)}>
              {card.icon}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <div 
          onClick={() => onDetailClick?.('深度数据分析中心')}
          className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-silver/40 shadow-sm cursor-pointer hover:shadow-xl transition-all group active:scale-[0.99]"
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-serif font-bold text-ink italic group-hover:text-cobalt transition-colors">合作品牌声量趋势</h3>
              <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest mt-1">Collab Recognition & Trends</p>
            </div>
            <select 
              onClick={(e) => e.stopPropagation()}
              className="bg-silver/20 border-none rounded-xl px-4 py-2 text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-cobalt/20 cursor-pointer"
            >
              <option>最近六个月 (6 MONTHS)</option>
              <option>全年数据 (YEARLY)</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003399" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#003399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#141414', 
                    border: 'none', 
                    borderRadius: '16px', 
                    color: '#FFF',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '12px'
                  }} 
                  itemStyle={{ color: '#FFF' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#003399" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-ink p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-square lg:aspect-auto h-full">
              <div className="relative z-10">
                <h3 className="text-xl font-serif font-bold italic mb-4">智能项目预警</h3>
                <p className="text-xs text-white/40 leading-relaxed mb-8 font-bold uppercase tracking-widest">Project Risk Assessment</p>
                
                <div className="space-y-6">
                  {[
                    { label: '春节特献联名', date: '剩 2 天截止', progress: 85, color: 'bg-orange-500' },
                    { label: '酒店大堂装置案', date: '正常推进', progress: 35, color: 'bg-cobalt' },
                  ].map(risk => (
                    <div key={risk.label} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                         <span>{risk.label}</span>
                         <span className="opacity-40">{risk.date}</span>
                       </div>
                       <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                         <div className={cn("h-full rounded-full transition-all duration-1000", risk.color)} style={{ width: `${risk.progress}%` }}></div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="relative z-10 w-full py-4 rounded-2xl bg-white text-ink text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all shadow-xl mt-10">查看全部风险预警</button>
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                 <img src="https://picsum.photos/seed/bizbg/600/800" className="w-full h-full object-cover mix-blend-overlay grayscale" referrerPolicy="no-referrer" alt="" />
              </div>
           </div>
        </div>
      </div>

      {/* Project Kanban Placeholder Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-center border-b border-silver/50 pb-4">
          <h3 className="text-xl font-serif font-bold text-ink italic tracking-wide">项目管理看板 (Kanban)</h3>
          <button className="text-[10px] font-bold text-cobalt hover:opacity-70 transition-opacity underline underline-offset-4 uppercase tracking-[0.2em]">进入完整项目中心</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUS_COLUMNS.map(col => (
             <div key={col.id} className="space-y-6">
                <div 
                  onClick={() => onDetailClick?.(`管理 ${col.label} 队列`)}
                  className="flex items-center justify-between px-2 cursor-pointer group/col"
                >
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-ink uppercase tracking-widest group-hover/col:text-cobalt transition-colors">{col.label}</span>
                      <span className="w-5 h-5 rounded-lg bg-silver text-ink/40 text-[9px] font-black flex items-center justify-center group-hover/col:bg-cobalt group-hover/col:text-white transition-all">{col.count}</span>
                   </div>
                   <PlusCircle size={14} className="text-ink/20 group-hover/col:text-cobalt transition-colors" />
                </div>
                
                <div className="space-y-4">
                  {[1].map(i => (
                    <div 
                      key={i} 
                      onClick={() => onDetailClick?.('Dior 2026 春季艺术沙龙策划案')}
                      className="bg-white p-6 rounded-[2rem] border border-silver/40 shadow-sm hover:shadow-2xl hover:border-cobalt/20 transition-all cursor-pointer group active:scale-95"
                    >
                       <div className="flex justify-between items-start mb-4">
                         <span className="text-[8px] font-bold text-cobalt bg-cobalt/5 px-2 py-0.5 rounded-md uppercase tracking-tighter border border-cobalt/10">奢侈品联名</span>
                         <Clock size={12} className="text-ink/20 group-hover:text-cobalt transition-colors" />
                       </div>
                       <h4 className="text-sm font-bold text-ink leading-snug group-hover:text-cobalt transition-colors italic">Dior 2026 春季艺术沙龙策划案</h4>
                       <div className="mt-8 flex items-center justify-between">
                         <div className="flex -space-x-2">
                            {[1, 2].map(j => (
                              <img key={j} src={`https://i.pravatar.cc/100?u=proj${col.id}${j}`} className="w-6 h-6 rounded-full border-2 border-white object-cover" referrerPolicy="no-referrer" alt="Team member" />
                            ))}
                         </div>
                         <div className="flex items-center gap-1 text-[9px] font-bold text-ink/30 uppercase tracking-tighter">
                            <CheckCircle2 size={10} className="text-green-500" />
                            4/12 任务已完成
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

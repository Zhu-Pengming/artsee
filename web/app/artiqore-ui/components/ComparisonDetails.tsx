// @ts-nocheck
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Briefcase, GraduationCap, DollarSign, TrendingUp, Compass, Target, Info, Search, MapPin, Users, Award, BookOpen, Clock, Building2, Globe, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';

// --- Alumni Story Detail ---
interface AlumniStoryDetailProps {
  alumnus: {
    name: string;
    school: string;
    role: string;
    img: string;
  };
  onClose: () => void;
}

export const AlumniStoryDetail = ({ alumnus, onClose }: AlumniStoryDetailProps) => {
  const [view, setView] = React.useState<'path' | 'connect'>('path');

  const pathData = [
    { date: '2018-2022', title: `${alumnus.school} 学部`, desc: '获得 BFA 环境设计学位，专注可持续空间。', icon: <GraduationCap size={16} /> },
    { date: '2021 Summer', title: '顶级工作室实习', desc: '在纽约著名事务所参与城市微更新项目。', icon: <Compass size={16} /> },
    { date: '2022 Graduate', title: '斩获年度金奖', desc: '毕业设计获得国际设计奖，并成功就业。', icon: <Award size={16} /> },
    { date: 'Now', title: alumnus.role, desc: '在当前岗位主导多个千万级项目，担任核心设计职务。', icon: <Briefcase size={16} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-xl" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col md:flex-row h-full max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-silver/20"
        >
          <X size={20} />
        </button>

        {/* Sidebar / Profile Card */}
        <div className="w-full md:w-80 bg-ink p-8 md:p-12 text-white flex flex-col items-center text-center space-y-8 h-full">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl">
            <img src={alumnus.img} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif italic font-bold">{alumnus.name}</h3>
            <p className="text-cobalt text-xs font-black uppercase tracking-widest">{alumnus.school} ALUMNI</p>
          </div>
          
          <div className="w-full space-y-4 pt-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
              <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Current Salary Range</p>
              <p className="text-lg font-mono font-bold">$120k - $185k</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
              <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Career Velocity</p>
              <p className="text-lg font-mono font-bold">Top 5%</p>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button 
              onClick={() => setView(view === 'path' ? 'connect' : 'path')}
              className="w-full py-4 bg-cobalt text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
            >
              {view === 'path' ? 'Connect via Mentor Hub' : 'Back to Pathway'}
            </button>
          </div>
        </div>

        {/* Path / Experience Content or Connect Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar bg-porcelain/30 relative">
          <AnimatePresence mode="wait">
            {view === 'path' ? (
              <motion.div 
                key="path"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div>
                  <h2 className="text-2xl md:text-4xl font-serif font-black italic text-ink mb-4">晋升全路径解析</h2>
                  <p className="text-ink/60 font-light leading-relaxed max-w-xl">
                    校友的成功并非偶然。我们解析了其从入校到顶尖企业核心岗位的每一个关键节点，为您提供可复制的成长参考。
                  </p>
                </div>

                {/* Timeline */}
                <div className="space-y-8 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-[2px] before:bg-silver/20">
                  {pathData.map((item, i) => (
                    <div key={i} className="relative pl-16 group">
                      <div className="absolute left-0 top-0 w-12 h-12 bg-white rounded-2xl border border-silver/30 shadow-sm flex items-center justify-center text-cobalt group-hover:bg-cobalt group-hover:text-white transition-all z-10">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-ink/20 uppercase tracking-[0.2em]">{item.date}</span>
                        <h4 className="text-lg font-bold text-ink italic">{item.title}</h4>
                        <p className="text-sm text-ink/50 font-light max-w-lg leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills & Core Strengths */}
                <div className="pt-8 border-t border-silver/20 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-ink/30 italic">Skill Ecosystem</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Computational Design', 'UX Research', 'Project Management', 'Sustainability', 'Strategy'].map(skill => (
                      <span key={skill} className="px-5 py-2 bg-white border border-silver/30 rounded-xl text-[10px] font-bold text-ink italic shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="connect"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="space-y-12">
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-serif font-black italic text-ink">申请与导师对话</h2>
                    <p className="text-ink/60 font-light leading-relaxed max-w-xl">
                      我们将为您开启与 {alumnus.name} 的 1-on-1 预约通道。
                    </p>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-ink/30 tracking-widest">您的意向话题 (Topic)</label>
                       <div className="grid grid-cols-2 gap-3">
                         {['作品集优化', '职场生存建议', '大厂内推', '设计调研方法'].map(topic => (
                           <button key={topic} className="px-6 py-4 bg-white border border-silver/30 rounded-2xl text-xs font-bold text-ink italic hover:border-cobalt hover:text-cobalt transition-all text-left">
                             {topic}
                           </button>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-ink/30 tracking-widest">期望沟通时间 (Availability)</label>
                       <div className="flex gap-3">
                          {['周一 19:00', '周四 20:00', '周六 10:00'].map(time => (
                            <button key={time} className="px-4 py-2 bg-porcelain rounded-xl text-[10px] font-bold text-ink/60 italic hover:bg-silver/10 transition-all border border-transparent">
                              {time}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => {
                        alert('预约申请已提交！');
                        setView('path');
                      }}
                      className="flex-1 py-5 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-cobalt transition-all shadow-xl"
                    >
                      发送连接请求 (Send)
                    </button>
                    <button 
                      onClick={() => setView('path')}
                      className="flex-1 py-5 bg-white border border-silver/30 text-ink/40 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-porcelain transition-all"
                    >
                      返回全路径 (Return)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};


// --- Career Analytics Detail ---
interface CareerAnalyticsDetailProps {
  type: 'salary' | 'industry' | 'mentor';
  onClose: () => void;
}

const salaryData = [
  { name: '0-1 Yr', rca: 45000, risd: 42000, polyu: 35000 },
  { name: '3-5 Yr', rca: 78000, risd: 75000, polyu: 62000 },
  { name: '5-10 Yr', rca: 125000, risd: 118000, polyu: 95000 },
  { name: '10+ Yr', rca: 185000, risd: 175000, polyu: 145000 },
];

const industryData = [
  { name: 'Tech / UX', value: 45, color: '#1E3A8A' },
  { name: 'Consulting', value: 25, color: '#6366F1' },
  { name: 'Creative Studio', value: 15, color: '#10B981' },
  { name: 'Fashion', value: 10, color: '#F59E0B' },
  { name: 'Other', value: 5, color: '#94A3B8' },
];

export const CareerAnalyticsDetail = ({ type, onClose }: CareerAnalyticsDetailProps) => {
  const getTitle = () => {
    switch(type) {
      case 'salary': return '全球起薪与薪资动态分析';
      case 'industry': return '跨国行业分布与就业热点';
      case 'mentor': return '全球校友导师网络地图';
      default: return '职业晋升全路径数据';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12"
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-3xl" onClick={onClose} />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-6xl bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-4xl flex flex-col h-full max-h-[90vh]"
      >
        <div className="p-8 md:p-12 border-b border-silver/20 flex items-center justify-between bg-porcelain/30">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-4xl font-serif font-black italic tracking-tight">{getTitle()}</h2>
            <p className="text-[10px] text-ink/30 uppercase tracking-[0.4em] font-black">Strategic Career Intelligence</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 md:w-16 md:h-16 bg-white border border-silver/20 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar space-y-16">
          {/* Main Chart Section */}
          <section className="grid lg:grid-cols-2 gap-12">
            <div className="bg-ink p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cobalt/20 blur-[60px]" />
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-bold tracking-tight italic">校友薪资增长曲线 (USD)</h3>
                   <TrendingUp size={16} className="text-cobalt" />
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salaryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="rca" stroke="#1E3A8A" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="risd" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-900" />
                     <span className="text-[10px] text-white/40 font-bold uppercase">RCA</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-indigo-500" />
                     <span className="text-[10px] text-white/40 font-bold uppercase">RISD</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-porcelain/50 border border-silver/30 p-8 md:p-12 rounded-[2.5rem] flex flex-col justify-center space-y-10">
               <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold italic leading-tight">就业行业权重分布</h3>
                  <p className="text-sm text-ink/50 font-light">基于 5000+ 近五年毕业生脱敏数据的深度解析。</p>
               </div>
               
               <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="h-[200px] w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={industryData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {industryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-4">
                     {industryData.map(item => (
                       <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                             <span className="text-[10px] font-bold text-ink/60 uppercase">{item.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-ink">{item.value}%</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </section>

          {/* Detailed ROI Insights */}
          <section className="space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-silver" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-ink/30 italic">Investment ROI Analysis</h4>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
                {[
                  { label: '平均留存年限', val: '4.2yr', icon: <Clock /> },
                  { label: '创业成功率评估', val: '18%', icon: <TrendingUp /> },
                  { label: '校友内推权重', val: 'High', icon: <Target /> }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-silver/20 p-8 rounded-3xl flex items-center gap-6 shadow-sm">
                    <div className="w-12 h-12 bg-porcelain rounded-2xl flex items-center justify-center text-cobalt">
                       {React.cloneElement(stat.icon as any, { size: 20 })}
                    </div>
                    <div>
                      <p className="text-[10px] text-ink/30 font-black uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-serif font-black italic text-ink">{stat.val}</p>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Recent Comparison Detail ---
interface RecentComparisonDetailProps {
  label: string;
  tag: string;
  onClose: () => void;
  onExplore: () => void;
}

export const RecentComparisonDetail = ({ label, tag, onClose, onExplore }: RecentComparisonDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-xl" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-4xl p-8 md:p-12 text-center space-y-8"
      >
        <div className="w-20 h-20 bg-cobalt/10 rounded-[2rem] flex items-center justify-center text-cobalt mx-auto">
          <Layers size={32} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl md:text-5xl font-serif font-black italic tracking-tighter text-ink">{label}</h2>
          <p className="text-[10px] md:text-xs text-cobalt font-black uppercase tracking-[0.4em]">{tag}</p>
        </div>

        <p className="text-ink/50 font-light leading-relaxed max-w-md mx-auto">
          这是一组被高频检索的对比组合。系统已为您预置了该组合的深度实测数据与 AI 择校建议报告。
        </p>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-porcelain p-6 rounded-3xl border border-silver/20 text-left">
              <p className="text-[10px] text-ink/30 font-black uppercase tracking-widest mb-1">Search Volume</p>
              <p className="text-xl font-mono font-bold text-ink">High</p>
           </div>
           <div className="bg-porcelain p-6 rounded-3xl border border-silver/20 text-left">
              <p className="text-[10px] text-ink/30 font-black uppercase tracking-widest mb-1">AI Recommendation</p>
              <p className="text-xl font-mono font-bold text-ink">Ready</p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={onExplore}
            className="flex-1 h-16 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-cobalt transition-all shadow-xl"
          >
            加载对比模版 (Load)
          </button>
          <button 
            onClick={onClose}
            className="flex-1 h-16 bg-white border border-silver/30 text-ink/40 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-porcelain transition-all"
          >
            返回中心
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowLeftRight, Check, Plus, X } from 'lucide-react';
import { MOCK_SCHOOLS } from '../data';
import { cn } from '../lib/utils';
import { School } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export const InfoView = () => {
  const [mode, setMode] = useState<'search' | 'compare'>('search');
  const [selectedSchools, setSelectedSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = MOCK_SCHOOLS.filter(s => 
    s.name.includes(searchQuery) || s.enName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleComparison = (school: School) => {
    if (selectedSchools.find(s => s.id === school.id)) {
      setSelectedSchools(selectedSchools.filter(s => s.id !== school.id));
    } else if (selectedSchools.length < 5) {
      setSelectedSchools([...selectedSchools, school]);
    }
  };

  const radarData = [
    { subject: '排名', A: 90, B: 85, C: 95 },
    { subject: '就业', A: 85, B: 90, C: 80 },
    { subject: '费用', A: 60, B: 70, C: 50 },
    { subject: '设施', A: 95, B: 85, C: 90 },
    { subject: '声誉', A: 98, B: 95, C: 92 },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-ink italic">全球顶尖艺术院校</h2>
          <p className="text-ink/40 text-[10px] tracking-widest uppercase mt-1">Research & Comparison Tool</p>
        </div>
        
        <div className="flex bg-silver/50 p-1.5 rounded-2xl w-full md:w-auto self-start">
          <button 
            onClick={() => setMode('search')}
            className={cn(
              "flex-1 md:flex-none px-8 py-2.5 text-xs font-bold rounded-xl transition-all",
              mode === 'search' ? "bg-white text-cobalt shadow-lg" : "text-ink/40 hover:text-ink/60"
            )}
          >
            智能检索
          </button>
          <button 
            onClick={() => setMode('compare')}
            className={cn(
              "flex-1 md:flex-none px-8 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              mode === 'compare' ? "bg-white text-cobalt shadow-lg" : "text-ink/40 hover:text-ink/60"
            )}
          >
            对比中心 <span className="bg-cobalt/10 text-cobalt px-1.5 py-0.5 rounded-md text-[10px]">{selectedSchools.length}</span>
          </button>
        </div>
      </div>

      {mode === 'search' ? (
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex-1 bg-white border border-silver/50 rounded-2xl px-6 py-4 flex items-center gap-4 focus-within:border-cobalt transition-colors shadow-sm group">
              <Search size={20} className="text-ink/20 group-focus-within:text-cobalt" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索伦敦艺术大学、罗德岛设计学院..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-ink/20"
              />
            </div>
            <button className="bg-white border border-silver/50 p-4 rounded-2xl hover:bg-silver/10 transition-colors shadow-sm">
              <SlidersHorizontal size={20} className="text-cobalt" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredSchools.map((school, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                key={school.id} 
                className="bg-white rounded-[2rem] border border-silver/40 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-cobalt/5 transition-all group"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={school.image} className="w-full h-full object-cover transition-all duration-700" referrerPolicy="no-referrer" alt="" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {school.tags.slice(0, 2).map(t => (
                      <span key={t} className="bg-white/90 backdrop-blur-md text-ink text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-tighter">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => toggleComparison(school)}
                    className={cn(
                      "absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md transition-all active:scale-90 shadow-xl",
                      selectedSchools.find(s => s.id === school.id) 
                        ? "bg-cobalt text-white" 
                        : "bg-white/80 text-ink/60 hover:bg-white hover:text-cobalt"
                    )}
                  >
                    {selectedSchools.find(s => s.id === school.id) ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-ink group-hover:text-cobalt transition-colors leading-tight line-clamp-1">{school.name}</h3>
                      <p className="text-[10px] text-ink/30 font-medium mt-1 uppercase tracking-widest">{school.enName}</p>
                    </div>
                    <div className="bg-silver/30 px-3 py-1 rounded-lg text-right">
                      <p className="text-[10px] font-bold text-cobalt">#{school.rankings.qs || school.rankings.artDesign}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink/40">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      伦敦, 英国
                    </div>
                    <div className="text-ink/80">
                      {school.tuition}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {selectedSchools.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
              {/* Radar Visualization */}
              <div className="xl:col-span-4 bg-white rounded-[2.5rem] border border-silver/50 p-8 shadow-sm relative overflow-hidden backdrop-blur-sm">
                <div className="mb-8">
                   <h4 className="text-sm font-bold text-ink uppercase tracking-widest">能力多维对比</h4>
                   <p className="text-[10px] text-ink/30 uppercase tracking-[0.2em] mt-1 font-serif italic">Comparative Data Visualization</p>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#E9ECEF" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#141414' }} />
                      <Radar name="A" dataKey="A" stroke="#003399" fill="#003399" fillOpacity={0.6} />
                      <Radar name="B" dataKey="B" stroke="#4A6FA5" fill="#4A6FA5" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="xl:col-span-8 overflow-x-auto no-scrollbar pb-12">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="border-b border-ink/10">
                        <th className="py-6 pr-8 w-32">
                          <span className="text-[10px] font-bold text-ink/20 uppercase tracking-[0.3em]">Analytics</span>
                        </th>
                        {selectedSchools.map(school => (
                          <th key={school.id} className="py-6 px-4 align-top min-w-[200px]">
                            <div className="relative p-4 rounded-2xl bg-white border border-silver/40 group">
                              <button 
                                onClick={() => toggleComparison(school)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-silver/50 rounded-full flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-all shadow-lg"
                              >
                                <X size={12} />
                              </button>
                              <h5 className="text-xs font-bold line-clamp-2 leading-tight h-8 mb-2 italic">{school.name}</h5>
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded",
                                school.difficulty === '冲刺' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                              )}>
                                {school.difficulty}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-medium text-ink/70">
                      {[
                        { label: '预计学费/年', key: 'tuition' },
                        { label: '语言成绩要求', key: 'language' },
                        { label: '硕士就业率', key: 'employmentRate', sub: true },
                        { label: 'GPA录取建议', key: 'gpa', sub: true },
                        { label: '毕业平均起薪', key: 'avgSalary', sub: true },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-silver/30 hover:bg-silver/10 transition-colors">
                          <td className="py-6 pr-8 text-ink/30 font-bold uppercase tracking-tighter">{row.label}</td>
                          {selectedSchools.map(school => (
                            <td key={school.id} className="py-6 px-4 font-bold text-ink">
                              {row.sub ? (school.details as any)[row.key] : (school as any)[row.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-silver/30 shadow-inner">
              <div className="w-20 h-20 bg-silver/30 rounded-[2rem] flex items-center justify-center text-ink/20 mb-6 scale-motion">
                <ArrowLeftRight size={32} />
              </div>
              <h3 className="text-lg font-serif font-bold text-ink italic">对比中心暂无数据</h3>
              <p className="text-xs text-ink/30 mt-2 max-w-[300px] leading-relaxed">
                在上方 “智能检索” 中浏览感兴趣的院校，点击其封面上的 “+” 即可在此开启多维度的深度对比分析。
              </p>
              <button 
                onClick={() => setMode('search')}
                className="mt-8 px-12 py-3.5 bg-ink text-white text-xs font-bold rounded-full uppercase tracking-widest hover:bg-cobalt transition-all shadow-2xl shadow-ink/10"
              >
                开始探索
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

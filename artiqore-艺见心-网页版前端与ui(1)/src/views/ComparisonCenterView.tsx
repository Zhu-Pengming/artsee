import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { Plus, X, Sparkles, Trophy, Target, CreditCard, Users, Briefcase, BarChart3, Info, Search, Filter, Layers, Zap, EyeOff, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Institution, INSTITUTIONS_DATA } from '../data/institutions';
import { analyzeInstitutions } from '../services/aiService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { AlumniStoryDetail, CareerAnalyticsDetail, RecentComparisonDetail } from '../components/ComparisonDetails';

interface ComparisonCenterViewProps {
  onBack: () => void;
  onInstitutionClick?: (inst: Institution) => void;
}

export const ComparisonCenterView = ({ onBack, onInstitutionClick }: ComparisonCenterViewProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['eu-1', 'us-1']); 
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail Views State
  const [selectedAlumnus, setSelectedAlumnus] = useState<any | null>(null);
  const [selectedCareerType, setSelectedCareerType] = useState<'salary' | 'industry' | 'mentor' | null>(null);
  const [selectedRecentComp, setSelectedRecentComp] = useState<any | null>(null);

  // Feature toggles
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [highlightAdvantages, setHighlightAdvantages] = useState(false);

  const allInstitutions = useMemo(() => Object.values(INSTITUTIONS_DATA).flat(), []);
  const selectedInstitutions = useMemo(() => 
    allInstitutions.filter(inst => selectedIds.includes(inst.id)), 
    [selectedIds, allInstitutions]
  );

  const filteredInstitutions = useMemo(() => 
    allInstitutions.filter(inst => 
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inst.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [allInstitutions, searchQuery]
  );

  // Perspectives
  const [activePerspective, setActivePerspective] = useState<'overview' | 'career' | 'experience'>('overview');

  const perspectives = {
    overview: [
      { key: 'rank', label: '全球排名', icon: <Trophy size={14} /> },
      { key: 'admissionDifficulty', label: '录取率', icon: <Target size={14} /> },
      { key: 'portfolioReq', label: '作品集要求', icon: <Briefcase size={14} /> },
      { key: 'annualCost', label: '学杂总开支', icon: <CreditCard size={14} /> },
    ],
    career: [
      { key: 'employmentRate', label: '就业率', icon: <Users size={14} /> },
      { key: 'alumniNetwork', label: '校友资源', icon: <Users size={14} /> },
      { key: 'majorStrengths', label: '核心强势专业', icon: <Sparkles size={14} /> },
      { key: 'innovation', label: '创新力评分', icon: <Zap size={14} /> },
    ],
    experience: [
      { key: 'studentFacultyRatio', label: '师生比例', icon: <Layers size={14} /> },
      { key: 'scholarshipRate', label: '奖学金比例', icon: <Sparkles size={14} /> },
      { key: 'campusFacility', label: '校区设施', icon: <Info size={14} /> },
    ]
  };

  const currentMetrics = useMemo(() => {
    const base = perspectives[activePerspective];
    if (!showDiffOnly) return base;
    return base.filter(m => {
      if (selectedInstitutions.length < 2) return true;
      const values = selectedInstitutions.map(inst => (inst as any)[m.key]);
      const stringifiedValues = values.map(v => Array.isArray(v) ? v.join(',') : v);
      return new Set(stringifiedValues).size > 1;
    });
  }, [activePerspective, showDiffOnly, selectedInstitutions]);

  const [isExporting, setIsExporting] = useState(false);
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('AI 对比报告已生成并发送至您的预留邮箱。');
    }, 2000);
  };

  const handleAnalyze = async () => {
    if (selectedInstitutions.length < 2) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    const result = await analyzeInstitutions(selectedInstitutions);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const comparisonPresets = [
    { name: '美东顶尖设计', ids: ['us-1', 'us-4'] },
    { name: '伦敦创意之巅', ids: ['eu-1', 'eu-2'] },
    { name: '港新双雄', ids: ['hk-1', 'as-1'] },
  ];

  return (
    <div className="space-y-16 pb-32">
      {/* Header Section */}
      <section className="bg-ink rounded-3xl md:rounded-[4rem] p-6 md:p-8 lg:py-10 lg:px-20 text-white relative overflow-hidden shadow-3xl">
        <div className="absolute top-0 right-0 w-[80%] md:w-[60%] h-full bg-gradient-to-l from-cobalt/20 to-transparent blur-[80px] md:blur-[120px]" />
        <div className="absolute -bottom-12 -left-12 md:-bottom-24 md:-left-24 w-48 md:w-96 h-48 md:h-96 bg-white/5 rounded-full blur-[60px] md:blur-[100px]" />
        
        <div className="max-w-4xl relative z-10 space-y-3 md:space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 md:gap-4 text-cobalt"
          >
            <Sparkles size={18} md:size={24} className="animate-pulse" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em] italic">artiqore Intelligence</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-6xl font-serif font-black italic leading-[1.1] md:leading-[1] tracking-tighter"
          >
            院校深层对比 <br />
            <span className="text-white/50">Architecture of Choice</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-white/60 font-light leading-relaxed max-w-2xl italic"
          >
            数字化择校的决策引擎。全维度解析排名、作品集与产业路径，为您构建艺术晋升坐标。
          </motion.p>
        </div>
      </section>

      {/* Perspective Tabs */}
      <div className="flex justify-start md:justify-center gap-2 md:gap-4 overflow-x-auto no-scrollbar px-4 -mx-4 md:mx-0 py-2">
        {(['overview', 'career', 'experience'] as const).map(p => (
          <button
            key={p}
            onClick={() => setActivePerspective(p)}
            className={cn(
              "px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all border shrink-0",
              activePerspective === p 
                ? "bg-cobalt text-white border-cobalt shadow-xl shadow-cobalt/20 scale-105" 
                : "bg-white text-ink/40 border-silver/30 hover:border-cobalt/50"
            )}
          >
            {p === 'overview' ? '核心概览' : p === 'career' ? '职业前景' : '就读体验'}
          </button>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-4 bg-white/90 backdrop-blur-2xl border border-silver/20 rounded-2xl md:rounded-3xl relative z-[30] shadow-xl shadow-silver/10 mt-0 md:mt-[-2.5rem] mb-8 mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full py-1">
            <span className="text-[8px] md:text-[9px] font-bold text-ink/20 uppercase tracking-widest mr-1 md:mr-2 shrink-0">推荐:</span>
            {comparisonPresets.map(preset => (
              <button 
                key={preset.name}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIds(preset.ids);
                }}
                className={cn(
                  "text-[8px] md:text-[9px] font-bold px-3 py-1.5 border rounded-full transition-all whitespace-nowrap shrink-0 active:scale-95",
                  selectedIds.length === preset.ids.length && preset.ids.every(id => selectedIds.includes(id))
                    ? "bg-cobalt text-white border-cobalt"
                    : "bg-white/50 border-silver/30 text-ink/60 hover:border-cobalt hover:text-cobalt"
                )}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <div className="hidden md:block h-4 w-[1px] bg-silver/30" />
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDiffOnly(!showDiffOnly);
              }}
              className={cn(
                "flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all px-3 py-1.5 rounded-full active:scale-95",
                showDiffOnly ? "bg-ink text-white shadow-lg" : "bg-white/50 border border-silver/20 text-ink/40 hover:text-ink"
              )}
            >
              <EyeOff size={12} />
              <span className="whitespace-nowrap">{showDiffOnly ? "全显" : "隐藏相同"}</span>
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setHighlightAdvantages(!highlightAdvantages);
              }}
              className={cn(
                "flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all px-3 py-1.5 rounded-full active:scale-95",
                highlightAdvantages ? "bg-cobalt text-white shadow-lg shadow-cobalt/20" : "bg-white/50 border border-silver/20 text-ink/40 hover:text-cobalt"
              )}
            >
              <Zap size={12} />
              <span className="whitespace-nowrap">{highlightAdvantages ? "已高亮" : "优势高亮"}</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 border-t md:border-t-0 border-silver/10 pt-3 md:pt-0">
          <button 
            onClick={handleExport}
            disabled={isExporting || selectedInstitutions.length < 2}
            className={cn(
              "flex items-center gap-2 text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all px-3 md:px-4 py-1.5 rounded-full border border-silver/30",
              isExporting ? "bg-silver/10 text-ink/20" : "text-ink/40 hover:text-cobalt hover:border-cobalt"
            )}
          >
            {isExporting ? "导出中..." : "导出 (PDF)"}
          </button>
          <div className="h-4 w-[1px] bg-silver/30" />
          <span className="text-[8px] md:text-[9px] font-bold text-ink/20 uppercase tracking-widest">
            {selectedInstitutions.length} / 4 Selected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Main Comparison Table */}
        <div className="lg:col-span-8 space-y-8 md:space-y-12">
          <div className="bg-white rounded-2xl md:rounded-[3.5rem] border border-silver/30 shadow-2xl shadow-silver/10 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="bg-porcelain/30">
                    <th className="w-28 md:w-64 sticky left-0 bg-white/80 backdrop-blur-md z-10 p-2 md:p-10 text-left border-r border-silver/20">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileActive={{ scale: 0.98 }}
                        onClick={() => setShowAddModal(true)}
                        className="w-full aspect-[4/5] bg-white rounded-lg md:rounded-3xl flex flex-col items-center justify-center gap-1 md:gap-4 border-2 border-dashed border-silver/50 text-ink/20 hover:border-cobalt hover:text-cobalt transition-all group shadow-sm"
                      >
                        <div className="w-6 h-6 md:w-12 md:h-12 bg-silver/10 rounded-md md:rounded-2xl flex items-center justify-center group-hover:bg-cobalt/10 transition-colors">
                          <Plus size={12} md:size={24} className="group-hover:rotate-90 transition-transform" />
                        </div>
                        <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-tight md:tracking-[0.2em] px-1 md:px-4 text-center">添加院校</span>
                      </motion.button>
                    </th>
                    <LayoutGroup>
                      {selectedInstitutions.map((inst, idx) => (
                        <motion.th 
                          layout
                          key={inst.id} 
                          className={cn(
                            "min-w-[200px] md:min-w-[280px] p-4 md:p-10 relative group",
                            onInstitutionClick && "cursor-pointer"
                          )}
                          onClick={() => onInstitutionClick?.(inst)}
                        >
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIds(prev => prev.filter(id => id !== inst.id));
                            }}
                            className="absolute top-2 right-2 md:top-4 md:right-4 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-20"
                          >
                            <X size={10} md:size={14} />
                          </button>
                          
                          <div className="space-y-4 md:space-y-6">
                            <motion.div 
                              layoutId={`img-${inst.id}`}
                              className="aspect-[4/5] rounded-xl md:rounded-3xl overflow-hidden shadow-lg border border-silver/30 group-hover:scale-105 transition-all duration-700"
                            >
                              <img src={inst.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            </motion.div>
                            <div className="text-center">
                              <h4 className="text-sm md:text-base font-serif font-bold text-ink italic leading-tight mb-1 md:mb-2 line-clamp-2 md:line-clamp-none">{inst.name}</h4>
                              <p className="text-[9px] md:text-[10px] text-ink/30 uppercase font-black tracking-widest line-clamp-1 md:line-clamp-none">{inst.originalName}</p>
                            </div>
                          </div>
                        </motion.th>
                      ))}
                    </LayoutGroup>
                    
                    {Array.from({ length: Math.max(0, 2 - selectedInstitutions.length) }).map((_, i) => (
                      <th key={`empty-${i}`} className="min-w-[200px] md:min-w-[280px] p-4 md:p-10 opacity-10">
                        <div className="aspect-[4/5] bg-porcelain rounded-xl md:rounded-3xl border-2 border-dashed border-silver/50" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <AnimatePresence mode='popLayout'>
                    {currentMetrics.map((metric) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        key={metric.key} 
                        className="border-t border-silver/10 hover:bg-porcelain/20 transition-colors group"
                      >
                        <td className="sticky left-0 bg-white/80 backdrop-blur-md z-10 p-4 md:p-10 border-r border-silver/10 font-bold text-ink">
                          <div className="flex items-center gap-2 md:gap-4">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-silver/10 flex items-center justify-center text-cobalt group-hover:bg-cobalt group-hover:text-white transition-all">
                              {React.cloneElement(metric.icon as React.ReactElement, { size: 10 })}
                            </div>
                            <span className="text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest">{metric.label}</span>
                          </div>
                        </td>
                        {selectedInstitutions.map((inst) => (
                          <td key={inst.id} className="p-4 md:p-10 text-center relative">
                            <div className={cn(
                              "text-ink/60 font-medium transition-all py-1 md:py-2 px-2 md:px-4 rounded-lg md:rounded-xl text-[10px] md:text-sm",
                              highlightAdvantages && idxMax(metric.key, selectedInstitutions) === inst.id && "bg-green-50 text-green-700 ring-1 ring-green-200"
                            )}>
                              {renderMetricValue(metric.key, inst)}
                            </div>
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI & Viz Panel */}
        <div className="lg:col-span-4 space-y-8 md:space-y-12">
          {/* Advanced Radar */}
          <div className="bg-ink p-6 md:p-12 rounded-3xl md:rounded-[3.5rem] text-white shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cobalt/20 blur-[60px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-2xl bg-white/5 flex items-center justify-center">
                  <BarChart3 size={16} md:size={20} className="text-cobalt" />
                </div>
                <div>
                   <h3 className="text-xs md:text-sm font-bold tracking-tight italic">竞争维度分析</h3>
                   <p className="text-[8px] md:text-[9px] text-white/20 uppercase font-black mt-0.5">Competitive Matrix</p>
                </div>
              </div>
              <Info size={14} md:size={16} className="text-white/10" />
            </div>

            <div className="h-[240px] md:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={generateRadarData(selectedInstitutions)}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  {selectedInstitutions.map((inst, i) => (
                    <Radar
                      key={inst.id}
                      name={inst.name}
                      dataKey={inst.id}
                      stroke={radarColors[i]}
                      fill={radarColors[i]}
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              {selectedInstitutions.map((inst, i) => (
                <div key={inst.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: radarColors[i] }} />
                  <span className="text-[10px] font-bold text-white/40 italic">{inst.originalName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced AI Consultant */}
          <div className="bg-white rounded-3xl md:rounded-[3.5rem] p-6 md:p-12 border border-silver/30 shadow-2xl space-y-6 md:space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-porcelain blur-[60px] -z-10" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-cobalt rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-cobalt/20">
                  <Sparkles size={20} md:size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-serif font-bold text-ink italic leading-tight">AI 智能决策顾问</h4>
                  <p className="text-[8px] md:text-[10px] text-ink/30 uppercase tracking-[0.2em] font-black mt-1">Strategic Genius</p>
                </div>
              </div>
            </div>

            <div className="min-h-[150px] md:min-h-[200px] flex flex-col">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div 
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-center items-center gap-6 py-12"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-silver/20 border-t-cobalt rounded-full animate-spin" />
                      <Sparkles size={16} className="absolute inset-0 m-auto text-cobalt animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-bold text-ink italic">正在深度模拟决策模型...</p>
                      <p className="text-[10px] text-ink/30 uppercase font-black animate-pulse">Running Neural Analysis</p>
                    </div>
                  </motion.div>
                ) : analysis ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1"
                  >
                    <div className="prose prose-sm prose-slate max-w-none">
                      <div className="text-[15px] text-ink/80 leading-relaxed font-light whitespace-pre-wrap italic bg-porcelain/50 p-8 rounded-3xl border border-silver/20 select-text">
                        {analysis}
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileActive={{ scale: 0.98 }}
                      onClick={handleAnalyze}
                      className="w-full mt-8 py-5 border-2 border-silver/30 rounded-2xl text-[10px] font-bold text-ink/40 uppercase tracking-[0.3em] hover:border-cobalt hover:text-cobalt transition-all"
                    >
                      重新生成分析报告 (Regenerate)
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-porcelain rounded-[2.5rem] flex items-center justify-center">
                      <Layers className="text-ink/10" size={32} />
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs text-ink/30 leading-relaxed max-w-[200px] mx-auto italic">
                        请添加至少两所院校，开启 AI 实测数据推演与择校建议。
                      </p>
                      <button 
                        onClick={handleAnalyze}
                        disabled={selectedInstitutions.length < 2}
                        className="px-10 py-4 bg-ink text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt transition-all disabled:opacity-30 shadow-xl"
                      >
                        生成决策摘要 (Generate)
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Selection Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-ink/80 backdrop-blur-lg z-[100]"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed inset-x-4 top-10 bottom-10 md:inset-x-24 md:top-24 md:bottom-24 bg-white rounded-3xl md:rounded-[4rem] z-[101] shadow-4xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-8 md:px-16 md:py-12 border-b border-silver/20 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 bg-porcelain/30">
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-xl md:text-3xl font-serif font-bold italic tracking-tight">智选艺术坐标</h3>
                  <p className="text-[8px] md:text-[10px] text-ink/40 uppercase font-black tracking-[0.2em] md:tracking-[0.4em]">Selection Engine</p>
                </div>
                
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="relative group flex-1 md:flex-none">
                    <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-ink/20 group-focus-within:text-cobalt transition-colors" size={16} md:size={20} />
                    <input 
                      type="text" 
                      placeholder="搜索院校..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-80 h-12 md:h-16 pl-12 md:pl-16 pr-4 md:pr-8 bg-white rounded-xl md:rounded-2xl border border-silver/30 focus:border-cobalt focus:ring-4 focus:ring-cobalt/5 transition-all outline-none text-xs md:text-sm font-medium"
                    />
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-all border border-silver/20 shrink-0"
                  >
                    <X size={20} md:size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-16 custom-scrollbar">
                {filteredInstitutions.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                    {filteredInstitutions.map((inst) => (
                      <motion.div 
                        layout
                        key={inst.id}
                        className={cn(
                          "group relative cursor-pointer rounded-2xl md:rounded-[2.5rem] border-2 transition-all p-3 md:p-6 space-y-3 md:space-y-6",
                          selectedIds.includes(inst.id) ? "border-cobalt bg-cobalt/5 shadow-2xl shadow-cobalt/10" : "border-transparent hover:bg-porcelain/50"
                        )}
                      >
                        <div className="aspect-[4/3] rounded-xl md:rounded-3xl overflow-hidden relative shadow-md" onClick={() => toggleSelection(inst.id)}>
                          <img src={inst.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" referrerPolicy="no-referrer" />
                          <AnimatePresence>
                            {selectedIds.includes(inst.id) && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute inset-0 bg-cobalt/60 backdrop-blur-sm flex items-center justify-center"
                              >
                                <CheckCircle2 size={32} md:size={48} className="text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <div className="space-y-1" onClick={() => onInstitutionClick?.(inst)}>
                          <div className="flex items-center justify-between gap-2">
                             <h4 className="text-[10px] md:text-sm font-bold text-ink italic truncate">{inst.name}</h4>
                             <span className="text-[8px] md:text-[10px] font-black text-cobalt shrink-0">{inst.rank}</span>
                          </div>
                          <p className="text-[7px] md:text-[10px] text-ink/30 font-medium uppercase tracking-widest truncate">{inst.originalName}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <Filter className="text-ink/10" size={48} md:size={64} />
                    <div>
                      <p className="text-lg md:text-xl font-serif italic text-ink/40">未能找到匹配的学府</p>
                      <p className="text-[8px] md:text-[10px] text-ink/20 uppercase tracking-widest mt-2 font-black">Adjust search</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-8 md:px-16 md:py-12 border-t border-silver/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-porcelain/30">
                <div className="flex gap-4 items-center">
                  <div className="flex -space-x-3">
                    {selectedInstitutions.slice(0, 4).map(inst => (
                      <div key={inst.id} className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border-2 md:border-4 border-white bg-silver overflow-hidden shadow-sm">
                        <img src={inst.image} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] md:text-xs font-serif italic text-ink/40">
                    已选 {selectedIds.length} / 4
                  </span>
                </div>
                
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-full md:w-auto md:px-20 h-14 md:h-16 bg-ink text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] hover:bg-cobalt transition-all shadow-3xl shadow-ink/20 active:scale-95"
                >
                  确认即刻对比 (Confirm)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NEW: Recent Comparisons Cache */}
      <section className="space-y-8 mt-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-[1px] bg-silver" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-ink/30 italic">Recently Compared</h3>
        </div>
        <div className="flex flex-wrap gap-6">
          {[
            { label: 'RISD vs Parsons', tag: 'Top Tier', ids: ['us-1', 'us-4'] },
            { label: 'RCA vs UAL', tag: 'London Choice', ids: ['eu-1', 'eu-2'] },
            { label: 'PolyU vs CityU', tag: 'Asia Insight', ids: ['hk-1', 'hk-5'] }
          ].map((item, i) => (
            <motion.div 
               whileHover={{ y: -5 }}
               key={i} 
               onClick={() => setSelectedRecentComp(item)}
               className="bg-white border border-silver/30 px-8 py-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-xl hover:border-cobalt/30 transition-all cursor-pointer group"
            >
               <BarChart3 size={14} className="text-cobalt/40 group-hover:text-cobalt" />
               <div>
                  <p className="text-xs font-bold text-ink italic">{item.label}</p>
                  <p className="text-[8px] text-ink/20 font-black uppercase tracking-widest mt-0.5">{item.tag}</p>
               </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW: Success Pathways */}
      <section className="bg-porcelain rounded-[3.5rem] p-12 md:p-20 border border-silver/20 overflow-hidden relative group mt-20">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-cobalt/5 blur-[120px] pointer-events-none group-hover:bg-cobalt/10 transition-all duration-1000" />
        
        <div className="flex flex-col lg:flex-row gap-20">
           <div className="flex-1 space-y-8">
              <div className="flex items-center gap-4 text-cobalt">
                <Sparkles size={20} />
                <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Success Story Database</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-serif font-light italic text-ink leading-tight">
                 从院校对比到<br />
                 <span className="text-ink/40 underline decoration-cobalt/30 underline-offset-8">职业晋升全路径</span>
              </h3>
              <p className="text-lg text-ink/50 font-light leading-relaxed max-w-lg">
                我们的数据库不仅包含院校数据，还追踪了 5000+ 顶尖校友的起薪、行业分布与创业成功率。通过模型为您呈现最为真实的“投资回报率”。
              </p>
              <div className="flex gap-4">
                 {[
                   { label: '起薪分析', key: 'salary' as const, color: 'bg-green-50 text-green-600' },
                   { label: '行业分布', key: 'industry' as const, color: 'bg-blue-50 text-blue-600' },
                   { label: '全球导师库', key: 'mentor' as const, color: 'bg-purple-50 text-purple-600' }
                 ].map(tag => (
                   <button 
                     key={tag.label} 
                     onClick={() => setSelectedCareerType(tag.key)}
                     className={cn("px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-sm", tag.color)}
                   >
                     {tag.label}
                   </button>
                 ))}
              </div>
           </div>
           
           <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { name: 'Sarah Chen', school: 'RISD', role: 'Design Lead @ Apple', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
                { name: 'Alex Wang', school: 'RCA', role: 'Founder, Studio X', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
                { name: 'Lisa Kim', school: 'Parsons', role: 'Fashion Dir @ Vogue', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
                { name: 'Tom Hardy', school: 'PolyU', role: 'UX Consultant @ Tech', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }
              ].map((alumnus, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedAlumnus(alumnus)}
                  className="bg-white p-4 rounded-3xl border border-silver/30 shadow-sm flex items-center gap-4 hover:shadow-xl transition-all h-24 cursor-pointer"
                >
                   <img src={alumnus.img} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                   <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-cobalt truncate">{alumnus.name}</p>
                      <p className="text-[9px] text-ink/40 font-bold tracking-tight truncate">{alumnus.school} • {alumnus.role}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedAlumnus && (
          <AlumniStoryDetail 
            alumnus={selectedAlumnus} 
            onClose={() => setSelectedAlumnus(null)} 
          />
        )}
        {selectedCareerType && (
          <CareerAnalyticsDetail 
            type={selectedCareerType} 
            onClose={() => setSelectedCareerType(null)} 
          />
        )}
        {selectedRecentComp && (
          <RecentComparisonDetail 
            label={selectedRecentComp.label} 
            tag={selectedRecentComp.tag} 
            onClose={() => setSelectedRecentComp(null)}
            onExplore={() => {
              setSelectedIds(selectedRecentComp.ids);
              setSelectedRecentComp(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Helpers
const radarColors = ['#1E3A8A', '#6366F1', '#10B981', '#F59E0B'];

const generateRadarData = (selected: Institution[]) => {
  const subjects = [
    { subject: '学术/Academic', key: 'academic' },
    { subject: '就业/Outcome', key: 'employment' },
    { subject: '设施/Facilities', key: 'facility' },
    { subject: '开支/Cost', key: 'cost' },
    { subject: '名望/Prestige', key: 'reputation' },
    { subject: '创新/Inno', key: 'innovation' },
  ];

  return subjects.map(s => {
    const item: any = { subject: s.subject };
    selected.forEach(inst => {
      item[inst.id] = (inst.radarData as any)?.[s.key] || 0;
    });
    return item;
  });
};

const renderMetricValue = (key: string, inst: Institution) => {
  const val = (inst as any)[key];
  if (Array.isArray(val)) return val.join(', ');
  return val || 'N/A';
};

const idxMax = (key: string, selected: Institution[]) => {
  if (selected.length < 2) return null;
  
  // Custom logic for different metrics
  if (key === 'rank') {
    return selected.reduce((prev, curr) => {
      const pRank = parseInt(prev.rank?.match(/\d+/)?.[0] || '999');
      const cRank = parseInt(curr.rank?.match(/\d+/)?.[0] || '999');
      return pRank < cRank ? prev : curr;
    }).id;
  }
  
  if (key === 'admissionDifficulty') {
    return selected.reduce((prev, curr) => {
      const pVal = parseInt(prev.admissionDifficulty?.match(/\d+/)?.[0] || '100');
      const cVal = parseInt(curr.admissionDifficulty?.match(/\d+/)?.[0] || '100');
      // For录取率, lower is usually more "prestigious"
      return pVal < cVal ? prev : curr;
    }).id;
  }

  if (key === 'employmentRate') {
    return selected.reduce((prev, curr) => {
      const pVal = parseInt(prev.employmentRate?.match(/\d+/)?.[0] || '0');
      const cVal = parseInt(curr.employmentRate?.match(/\d+/)?.[0] || '0');
      return pVal > cVal ? prev : curr;
    }).id;
  }

  return null;
};

const Check = ({ size, strokeWidth, className }: { size: number, strokeWidth: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 6L9 17L4 12" />
  </svg>
);

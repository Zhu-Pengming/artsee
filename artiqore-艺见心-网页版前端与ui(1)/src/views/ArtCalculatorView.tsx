import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Calculator, GraduationCap, Plane, Wallet, CreditCard, Sparkles, Zap, ArrowRight, BarChart3, Info, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

interface ArtCalculatorViewProps {
  onBack: () => void;
}

export const ArtCalculatorView = ({ onBack }: ArtCalculatorViewProps) => {
  const [level, setLevel] = useState<'undergraduate' | 'graduate'>('undergraduate');
  const [region, setRegion] = useState<'us' | 'uk' | 'eu' | 'as'>('us');
  const [years, setYears] = useState(2);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const regionData: Record<string, any> = {
    us: { tuition: 55000, living: 20000, insurance: 3000, flights: 2000, currency: '$' },
    uk: { tuition: 30000, living: 15000, insurance: 1500, flights: 1000, currency: '£' },
    eu: { tuition: 5000, living: 12000, insurance: 1000, flights: 1000, currency: '€' },
    as: { tuition: 20000, living: 10000, insurance: 1000, flights: 500, currency: '¥' },
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const base = regionData[region];
      const annual = base.tuition + base.living + base.insurance;
      const total = annual * years + base.flights;
      
      setResult({
        annual,
        total,
        breakdown: [
          { label: '学费/Tuition', value: base.tuition * years, percent: 65, icon: <GraduationCap size={14} />, color: 'bg-cobalt' },
          { label: '生活开支/Living', value: base.living * years, percent: 25, icon: <Wallet size={14} />, color: 'bg-emerald-400' },
          { label: '保险与机票/Other', value: (base.insurance * years) + base.flights, percent: 10, icon: <Plane size={14} />, color: 'bg-purple-500' },
        ],
        currency: base.currency
      });
      setIsCalculating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-8 md:px-16 md:py-12 border-b border-silver/10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-10 h-10 md:w-14 md:h-14 bg-porcelain rounded-2xl flex items-center justify-center text-ink/40 hover:bg-ink hover:text-white transition-all shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-4xl font-serif font-black italic text-ink">艺术留学成本计算器</h1>
            <p className="text-[10px] md:text-sm text-ink/60 uppercase font-black tracking-[0.5em] mt-2 italic">Investment Projections</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Calculator size={24} />
           </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
          
          {/* Config Panel */}
          <div className="space-y-12 md:space-y-16">
            <div className="space-y-6">
               <label className="text-[10px] font-black uppercase text-ink/50 tracking-[0.4em] block">学位等级</label>
               <div className="grid grid-cols-2 gap-4">
                  {(['undergraduate', 'graduate'] as const).map(l => (
                    <button 
                      key={l}
                      onClick={() => setLevel(l)}
                      className={cn(
                        "h-16 md:h-20 rounded-2xl md:rounded-3xl border-2 transition-all text-xs md:text-sm font-bold uppercase tracking-widest",
                        level === l ? "border-cobalt bg-cobalt/5 text-cobalt" : "border-silver/20 text-ink/40 hover:border-silver/40"
                      )}
                    >
                      {l === 'undergraduate' ? '本科 BA' : '研究生 MA/MFA'}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <label className="text-[10px] font-black uppercase text-ink/50 tracking-[0.4em] block">目标地区</label>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'us', label: '美国 / USA', icon: '🇺🇸' },
                    { id: 'uk', label: '英国 / UK', icon: '🇬🇧' },
                    { id: 'eu', label: '欧洲 / EU', icon: '🇮🇹' },
                    { id: 'as', label: '亚洲 / ASIA', icon: '🇯🇵' },
                  ].map(r => (
                    <button 
                      key={r.id}
                      onClick={() => setRegion(r.id as any)}
                      className={cn(
                        "h-16 md:h-20 rounded-2xl md:rounded-3xl border-2 transition-all p-4 flex items-center gap-4",
                        region === r.id ? "border-cobalt bg-cobalt/5" : "border-silver/20 hover:border-silver/40"
                      )}
                    >
                      <span className="text-xl md:text-2xl">{r.icon}</span>
                      <span className={cn(
                        "text-[10px] md:text-xs font-bold uppercase tracking-widest",
                        region === r.id ? "text-cobalt" : "text-ink/60"
                      )}>{r.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-ink/50 tracking-[0.4em]">学习年限</label>
                  <span className="text-xl font-serif font-black italic text-cobalt">{years} Years</span>
               </div>
               <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value))}
                  className="w-full h-2 bg-porcelain rounded-full appearance-none cursor-pointer accent-cobalt"
               />
               <div className="flex justify-between text-[10px] font-black text-ink/10 uppercase tracking-widest">
                  <span>1 yr</span>
                  <span>5 yrs</span>
               </div>
            </div>

            <button 
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full h-16 md:h-20 bg-ink text-white rounded-2xl md:rounded-3xl text-sm font-bold uppercase tracking-[0.4em] hover:bg-cobalt shadow-2xl transition-all shadow-ink/20 active:scale-95 flex items-center justify-center gap-4"
            >
              {isCalculating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>计算中...</span>
                </>
              ) : (
                <>生成投资预算报告</>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-ink rounded-[3rem] p-10 md:p-16 text-white space-y-12 shadow-4xl relative overflow-hidden h-full"
                >
                  <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
                  
                  <div className="space-y-8 relative z-10">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">Estimated Total Investment</h3>
                           <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Digital Projection</p>
                        </div>
                        <Sparkles size={24} className="text-emerald-400" />
                     </div>
                     
                     <div className="flex items-baseline gap-4">
                        <span className="text-5xl md:text-7xl font-serif font-black italic">{result.currency}{result.total.toLocaleString()}</span>
                        <span className="text-xl md:text-2xl text-white/20 font-serif italic">/ {years}Yrs</span>
                     </div>
                  </div>

                  <div className="space-y-8 relative z-10 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                     <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">成本构成解析</h4>
                     <div className="space-y-6">
                        {result.breakdown.map((item: any, i: number) => (
                          <div key={i} className="space-y-3">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-white/60">
                                   {item.icon}
                                   <span className="text-xs font-bold">{item.label}</span>
                                </div>
                                <span className="text-xs font-black text-white">{result.currency}{item.value.toLocaleString()}</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.percent}%` }}
                                  transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                  className={cn("h-full rounded-full", item.color)}
                                />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <p className="text-[8px] font-black uppercase text-white/20 mb-2">Annual Average</p>
                        <p className="text-xl font-serif font-black italic">{result.currency}{result.annual.toLocaleString()}</p>
                     </div>
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <p className="text-[8px] font-black uppercase text-white/20 mb-2">Financial Risk</p>
                        <p className="text-xl font-serif font-black italic text-emerald-400">Low-Moderate</p>
                     </div>
                  </div>

                  <div className="pt-4 text-center">
                     <p className="text-[10px] text-white/20 font-light leading-relaxed italic">
                        * 数据基于 2024 年度公开学费标准与生活指数。实际开支受汇率与通胀波动影响。
                     </p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] rounded-[3rem] border-2 border-dashed border-silver/30 flex flex-col items-center justify-center p-12 text-center space-y-8 bg-porcelain/10">
                   <div className="w-24 h-24 bg-porcelain rounded-[2.5rem] flex items-center justify-center text-ink/10">
                      <CreditCard size={48} />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-xl font-serif font-bold italic text-ink/30">配置您的留学背景</h3>
                      <p className="text-sm text-ink/20 font-light max-w-[280px] leading-relaxed italic">
                        AI 对比中心将为您生成精确的财务模型，涵盖学费、保险、生活费及通货膨胀预测。
                      </p>
                   </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Detail Analysis Footer */}
      <section className="bg-ink py-20 px-6 md:px-16 text-white overflow-hidden relative">
         <PieChart size={200} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="space-y-6 flex-1">
               <h3 className="text-3xl font-serif font-light italic leading-tight">投资回报率 (ROI) 精准测算</h3>
               <p className="text-base text-white/40 font-light leading-relaxed max-w-xl">
                  除了开支，我们还为您提供毕业后的起薪预测。基于目标学费与平均就业回报，计算您的教育投资回收周期。
               </p>
               <button className="px-10 py-4 bg-cobalt text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-cobalt/20">查看 ROI 对比报告</button>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-8 md:gap-12">
               {[
                 { label: '平均起薪', val: '$75k+', tag: '+12% vs last yr' },
                 { label: '奖学金覆盖', val: '45%', tag: 'Avg for art lore' },
               ].map((stat, i) => (
                 <div key={i} className="space-y-2 border-l-2 border-white/10 pl-8">
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">{stat.label}</p>
                    <p className="text-4xl font-serif font-black italic">{stat.val}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase italic">{stat.tag}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

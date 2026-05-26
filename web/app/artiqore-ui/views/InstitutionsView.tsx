// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INSTITUTIONS_DATA, Institution } from '../data/institutions';
import { Search, MapPin, ExternalLink, GraduationCap, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { ShareSheet } from '../components/ShareSheet';
import { fetchSchoolsForUi } from '../services/platformApi';

interface InstitutionsViewProps {
  onInstitutionClick: (inst: Institution) => void;
  onCompareOpen: () => void;
}

export const InstitutionsView = ({ onInstitutionClick, onCompareOpen }: InstitutionsViewProps) => {
  const [activeRegion, setActiveRegion] = useState("中国香港");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareInst, setShareInst] = useState<Institution | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>(() => Object.values(INSTITUTIONS_DATA).flat());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchSchoolsForUi({ limit: 100 }).then((items) => {
      if (alive && Array.isArray(items) && items.length > 0) {
        setInstitutions(items);
      }
    }).finally(() => {
      if (alive) setIsLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const regions = useMemo(() => {
    const values = institutions
      .map((inst) => inst.location?.split(',').pop()?.trim() || inst.location)
      .filter(Boolean);
    const unique = [...new Set(values)];
    return unique.length ? unique.slice(0, 12) : Object.keys(INSTITUTIONS_DATA);
  }, [institutions]);
  const allInstitutions = institutions;
  
  const currentInstitutions = searchQuery.trim() !== ""
    ? allInstitutions.filter(inst => 
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allInstitutions.filter((inst) => inst.location?.includes(activeRegion));

  const visibleInstitutions = currentInstitutions.length > 0 || searchQuery.trim()
    ? currentInstitutions
    : allInstitutions;

  return (
    <div className="bg-porcelain min-h-screen pb-20 selection:bg-cobalt selection:text-white">
      {/* Decorative Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cobalt/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-silver/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pt-10 relative z-10">
        {/* Header Section */}
        <header className="mb-8 space-y-4">
           <div className="flex items-center gap-3 text-cobalt">
              <div className="w-8 h-[1px] bg-cobalt" />
              <span className="text-[8px] md:text-[11px] font-bold uppercase tracking-[0.2em] italic">ArtLink Global Archive</span>
           </div>
           
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-serif font-light text-ink italic leading-[1] tracking-tight">
                全球顶尖艺术院校
              </h1>
              <p className="text-sm text-ink/40 font-light max-w-lg leading-relaxed">
                汇聚真实院校数据与 AI 择校判断，探索通往艺术殿堂的学术路径。
              </p>
              <button 
                onClick={onCompareOpen}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-cobalt text-white rounded-full text-[8px] md:text-[11px] font-bold uppercase tracking-widest hover:bg-ink transition-all shadow-lg shadow-cobalt/10"
              >
                <Sparkles size={12} />
                进入智能对比中心
              </button>
            </div>

            {/* Enhanced Search */}
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20 group-focus-within:text-cobalt transition-colors" size={14} />
              <input 
                type="text" 
                placeholder={searchQuery.trim() ? "搜索..." : `快速检索...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white/50 backdrop-blur-xl border border-silver/30 rounded-xl text-[10px] focus:outline-none focus:ring-0 focus:border-cobalt/30 transition-all placeholder:text-ink/20"
              />
            </div>
          </div>
        </header>

        {/* Region Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <nav className="flex flex-wrap gap-2 p-1 bg-silver/10 rounded-xl backdrop-blur-sm w-fit">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => {
                  setActiveRegion(region);
                  setSearchQuery(""); 
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-[8px] md:text-[11px] font-bold uppercase tracking-[0.1em] transition-all",
                  activeRegion === region && !searchQuery.trim()
                    ? "bg-white text-cobalt shadow-sm" 
                    : "text-ink/40 hover:text-ink hover:bg-white/50"
                )}
              >
                {region}
              </button>
            ))}
          </nav>
          {isLoading && (
            <span className="text-[9px] font-bold text-ink/20 uppercase tracking-widest">同步院校数据库中...</span>
          )}
        </div>

        {/* List Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AnimatePresence mode="wait">
            {visibleInstitutions.map((inst, index) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => onInstitutionClick(inst)}
                className="group bg-white rounded-2xl md:rounded-xl p-4 md:p-5 border border-silver/20 hover:border-cobalt/30 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="flex flex-col h-full">
                  {/* Top Header: Identity (Weibo style) - Fixed height on MD for alignment */}
                  <div className="flex items-start justify-between md:h-14 mb-2">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 md:w-10 md:h-10 bg-porcelain rounded-full md:rounded-lg flex items-center justify-center text-ink/20 group-hover:bg-cobalt group-hover:text-white transition-all overflow-hidden border border-silver/10 shrink-0">
                           <GraduationCap size={16} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <h3 className="text-sm md:text-base font-bold text-ink leading-tight truncate">{inst.name}</h3>
                          <span className="text-[10px] md:text-[10px] text-ink/30 font-bold uppercase tracking-widest leading-none mt-1 truncate">{inst.location}</span>
                        </div>
                     </div>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setShareInst(inst);
                       }} 
                       className="p-2 -mr-2 text-ink/10 hover:text-cobalt transition-colors shrink-0"
                     >
                        <ExternalLink size={14} />
                     </button>
                  </div>

                  {/* Middle Content: Tags - Fixed height/min-height on MD for alignment */}
                  <div className="flex flex-wrap gap-2 md:h-12 mb-4 content-start">
                    {inst.majorStrengths?.slice(0, 3).map(tag => (
                      <span key={tag} className="px-3 py-1 bg-cobalt/5 text-cobalt rounded-full text-[9px] font-bold uppercase tracking-widest border border-cobalt/10 whitespace-nowrap">{tag}</span>
                    ))}
                  </div>

                  {/* Media Content: Large centered image */}
                  <div className="aspect-video md:aspect-[16/9] w-full rounded-xl overflow-hidden relative shadow-inner mb-4">
                    <img 
                      src={inst.image} 
                      alt={inst.name} 
                      className="w-full h-full object-cover md:group-hover:scale-105 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>

                  {/* Bottom Footer: Analysis interaction */}
                  <div className="pt-4 mt-auto border-t border-silver/10 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="bg-cobalt/10 p-1.5 rounded-lg">
                          <Zap size={10} className="text-cobalt" />
                        </div>
                        <span className="text-[9px] md:text-[11px] font-bold text-ink/20 uppercase tracking-[0.2em]">Institutional Analysis</span>
                     </div>
                     <button 
                       onClick={() => onInstitutionClick(inst)}
                       className="flex items-center gap-2 px-4 py-2 bg-silver/5 hover:bg-cobalt text-ink/30 hover:text-white rounded-full transition-all group/btn"
                     >
                        <span className="text-[9px] font-black uppercase tracking-widest">Detail</span>
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {visibleInstitutions.length === 0 && (
          <div className="py-32 text-center space-y-4">
             <div className="w-16 h-16 bg-silver/10 rounded-full flex items-center justify-center mx-auto text-silver">
                <Search size={24} />
             </div>
             <p className="text-ink/30 font-serif italic text-xl">未能找到相关院校</p>
          </div>
        )}

        <ShareSheet 
          isOpen={!!shareInst}
          onClose={() => setShareInst(null)}
          title="分享艺术院校"
          itemTitle={shareInst?.name}
        />
      </div>
    </div>
  );
};

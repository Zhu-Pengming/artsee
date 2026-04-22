import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INSTITUTIONS_DATA, Institution } from '../data/institutions';
import { Search, MapPin, ExternalLink, GraduationCap, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { ShareSheet } from '../components/ShareSheet';

interface InstitutionsViewProps {
  onInstitutionClick: (inst: Institution) => void;
}

export const InstitutionsView = ({ onInstitutionClick }: InstitutionsViewProps) => {
  const [activeRegion, setActiveRegion] = useState("中国香港");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareInst, setShareInst] = useState<Institution | null>(null);

  const regions = Object.keys(INSTITUTIONS_DATA);
  const currentInstitutions = INSTITUTIONS_DATA[activeRegion].filter(inst => 
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-porcelain min-h-screen pb-20 selection:bg-cobalt selection:text-white">
      {/* Decorative Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cobalt/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-silver/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-24 relative z-10">
        {/* Header Section */}
        <header className="mb-20 space-y-8">
           <div className="flex items-center gap-4 text-cobalt">
              <div className="w-12 h-[1px] bg-cobalt" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] italic">Artiqore Global Archive</span>
           </div>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-serif font-light text-ink italic leading-none tracking-tight">
                  全球顶尖<br />艺术院校
                </h1>
                <p className="text-xl text-ink/40 font-light max-w-lg leading-relaxed">
                  汇聚全球最具影响力的创意硅谷，探索通往艺术殿堂的学术路径。
                </p>
              </div>

              {/* Enhanced Search */}
              <div className="relative group w-full md:w-96">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ink/20 group-focus-within:text-cobalt transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="搜索院校名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-20 pl-16 pr-8 bg-white/50 backdrop-blur-xl border border-silver/30 rounded-2xl text-sm focus:outline-none focus:ring-0 focus:border-cobalt/30 transition-all placeholder:text-ink/20"
                />
              </div>
           </div>
        </header>

        {/* Region Selector */}
        <nav className="flex flex-wrap gap-4 mb-20 p-2 bg-silver/10 rounded-3xl backdrop-blur-sm w-fit">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={cn(
                "px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                activeRegion === region 
                  ? "bg-white text-cobalt shadow-xl shadow-cobalt/5" 
                  : "text-ink/40 hover:text-ink hover:bg-white/50"
              )}
            >
              {region}
            </button>
          ))}
        </nav>

        {/* List Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="wait">
            {currentInstitutions.map((inst, index) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group bg-white rounded-[3rem] p-10 md:p-14 border border-silver/20 hover:border-cobalt/30 transition-all shadow-sm hover:shadow-2xl hover:shadow-cobalt/5"
              >
                <div className="flex flex-col h-full justify-between gap-10">
                  <div className="space-y-6">
                    <div className="aspect-[21/10] w-full rounded-[2rem] overflow-hidden relative group-hover:shadow-2xl transition-all duration-700">
                      <img 
                        src={inst.image} 
                        alt={inst.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>

                    <div className="flex items-start justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-porcelain rounded-2xl flex items-center justify-center text-ink/20 group-hover:bg-cobalt group-hover:text-white transition-all">
                             <GraduationCap size={20} />
                          </div>
                          <span className="text-[9px] font-bold text-ink/20 uppercase tracking-[0.3em]">No. {String(index + 1).padStart(2, '0')}</span>
                       </div>
                       <button onClick={() => setShareInst(inst)} className="p-3 text-ink/20 hover:text-cobalt transition-colors">
                          <ExternalLink size={18} />
                       </button>
                    </div>

                    <div className="space-y-2">
                       <h3 className="text-3xl font-serif font-light text-ink group-hover:text-cobalt transition-colors italic">
                         {inst.name}
                       </h3>
                       {inst.originalName && (
                         <p className="text-[10px] text-ink/30 font-bold uppercase tracking-[0.2em]">
                           {inst.originalName}
                         </p>
                       )}
                    </div>

                    <p className="text-ink/50 font-light leading-relaxed text-lg">
                      {inst.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-silver/30">
                    <div className="flex items-center gap-3 text-ink/30">
                      <MapPin size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{inst.location}</span>
                    </div>
                    
                    <button 
                       onClick={() => onInstitutionClick(inst)}
                       className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.4em] text-ink group-hover:text-cobalt transition-all"
                    >
                       查看详情 <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {currentInstitutions.length === 0 && (
          <div className="py-40 text-center space-y-6">
             <div className="w-24 h-24 bg-silver/10 rounded-full flex items-center justify-center mx-auto text-silver">
                <Search size={32} />
             </div>
             <p className="text-ink/30 font-serif italic text-2xl">未能找到相关院校</p>
          </div>
        )}

        <ShareSheet 
          isOpen={!!shareInst}
          onClose={() => setShareInst(null)}
          title="分享顶尖艺术院校"
          itemTitle={shareInst?.name}
        />
      </div>
    </div>
  );
};

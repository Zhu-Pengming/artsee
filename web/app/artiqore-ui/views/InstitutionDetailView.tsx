// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ChevronLeft, Share2, MapPin, Globe, GraduationCap, Award, BookOpen, MessageSquare, ClipboardCheck, ArrowRight, Heart, Users, Star, Sparkles, Zap, ChevronRight, ImageIcon, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Institution } from '../data/institutions';
import { cn } from '../lib/utils';
import { ShareSheet } from '../components/ShareSheet';
import { ConsultationSheet } from '../components/ConsultationSheet';
import { MajorHandbookView } from '../components/MajorHandbookView';
import { CaseDetailView } from '../components/CaseDetailView';
import { EnrollmentSectionDetail } from '../components/EnrollmentSectionDetails';

interface InstitutionDetailViewProps {
  institution: Institution;
  onBack: () => void;
}

export const InstitutionDetailView = ({ institution, onBack }: InstitutionDetailViewProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [activeMajor, setActiveMajor] = useState<string | null>(null);
  const [activeEnrollmentStep, setActiveEnrollmentStep] = useState<'portfolio' | 'language' | 'statement' | 'interview' | 'templates' | null>(null);
  const [isCaseViewOpen, setIsCaseViewOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Mock detailed data
  const isElite = institution.rank?.includes('1') || institution.id.includes('-1');
  
  const majors = [
    { name: '交互设计 (Interaction Design)', desc: '融合人类体验与数字系统的核心学科，探索未来人机交互的无限可能。' },
    { name: '视觉传达 (Visual Communication)', desc: '通过媒介叙事与设计语言，构建极具影响力的品牌与视觉体系。' },
    { name: '工业/产品设计 (Industrial Design)', desc: '重塑物理世界的形态与功能，致力于可持续的社会创新解决方案。' },
    { name: '纯艺术 (Fine Arts)', desc: '深度学术研究与前卫实践并重，在批判性思维中重构当代艺术语境。' },
  ];

  const steps = [
    { title: '作品集准备', desc: '需包含15-20件原创作品，强调创作过程与设计逻辑。' },
    { title: '语言成绩', desc: 'IELTS 6.5+ 或 TOEFL 90+，具体视院系要求而定。' },
    { title: '个人陈述', desc: '阐述艺术见解、研究目标以及为何选择本校。' },
    { title: '导师面试', desc: '通过作品集演示与深度对谈，展现你的创造潜能。' },
  ];

  const campusScenes = [
    { label: '数字工厂', img: `https://picsum.photos/seed/scene-1-${institution.id}/600/600` },
    { label: '沉浸影厅', img: `https://picsum.photos/seed/scene-2-${institution.id}/600/600` },
    { label: '核心展厅', img: `https://picsum.photos/seed/scene-3-${institution.id}/600/600` },
  ];

  return (
    <div className="bg-porcelain min-h-screen pb-32 selection:bg-cobalt selection:text-white">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cobalt/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-silver/10 blur-[100px] rounded-full" />
      </div>

      {/* Navigation Rail */}
      <header className="fixed top-0 inset-x-0 h-16 md:h-20 bg-white/50 backdrop-blur-3xl border-b border-silver/30 z-50 flex items-center justify-between px-4 md:px-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 md:gap-3 p-1 md:p-2 -ml-1 md:-ml-2 hover:bg-black/5 rounded-full transition-all"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-silver/20 group-hover:text-cobalt">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-bold text-ink uppercase tracking-[0.4em] italic hidden md:block">Back to Directory</span>
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsShareOpen(true)}
            className="p-2 md:p-3 hover:bg-black/5 rounded-full transition-all text-ink/40 hover:text-cobalt"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={cn("p-2 md:p-3 rounded-full transition-all", isLiked ? "text-red-500 bg-red-50" : "text-ink/40 hover:text-red-500 hover:bg-black/5")}
          >
            <Heart size={18} className={cn(isLiked && "fill-current")} />
          </button>
          <div className="h-5 md:h-6 w-[1px] bg-silver/30 mx-1 md:mx-2" />
          <button 
            onClick={() => setIsConsultOpen(true)}
            className="px-4 md:px-8 py-2 md:py-3 bg-ink text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt transition-all shadow-xl shadow-ink/10"
          >
            预约咨询
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl md:rounded-[4rem] overflow-hidden aspect-[4/5] md:aspect-[4/1] shadow-3xl shadow-cobalt/5 group"
        >
          <img 
            src={institution.image} 
            alt={institution.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent p-6 md:p-12 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <span className="bg-cobalt text-white text-[8px] md:text-[9px] font-bold px-4 py-1.5 md:px-6 md:py-2 rounded-full uppercase tracking-[0.4em] shadow-2xl">
                  {institution.location}
                </span>
                {isElite && (
                  <span className="bg-white/10 backdrop-blur-md text-white text-[8px] md:text-[9px] font-bold px-4 py-1.5 md:px-6 md:py-2 rounded-full uppercase tracking-[0.4em] border border-white/20">
                    QS Top Ranked
                  </span>
                )}
                <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-[8px] md:text-[9px] font-bold px-4 py-1.5 md:px-6 md:py-2 rounded-full uppercase tracking-[0.4em] border border-emerald-500/20">
                   Online Consultation Active
                </span>
              </div>
              <h1 className="text-3xl md:text-6xl font-serif font-black text-white leading-tight tracking-tight italic">
                {institution.name}
              </h1>
              {institution.originalName && (
                <p className="text-lg md:text-2xl text-white/40 font-serif italic tracking-wider">
                  {institution.originalName}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-24 grid lg:grid-cols-12 gap-8 md:gap-16">
        {/* Left: About & Majors */}
        <div className="lg:col-span-8 space-y-16 md:space-y-24">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
             {[
               { label: '全球综合排名', val: institution.rank || 'No. 12', icon: <Award size={14} />, color: 'text-cobalt' },
               { label: '官方录取率', val: '12.5%', icon: <Target size={14} />, color: 'text-rose-500' },
               { label: '学生满意度', val: '98%', icon: <Star size={14} />, color: 'text-emerald-500' },
               { label: '师生配比', val: '1:12', icon: <Users size={14} />, color: 'text-purple-500' },
             ].map((stat, i) => (
               <div key={i} className="bg-white p-6 md:p-8 rounded-3xl border border-silver/10 shadow-sm space-y-3">
                  <div className={cn("w-8 h-8 rounded-xl bg-porcelain flex items-center justify-center", stat.color)}>
                     {stat.icon}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-ink/20 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-serif font-black italic mt-1">{stat.val}</p>
                  </div>
               </div>
             ))}
          </div>

          {/* About */}
          <section className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-3 md:gap-4 text-cobalt">
              <div className="w-8 md:w-12 h-[1px] bg-cobalt" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] italic">Deep Insight</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-black text-ink italic leading-tight">
              关于院校剖析
            </h2>
            <p className="text-base md:text-lg text-ink/60 leading-relaxed font-light italic">
              {institution.description} 该校不仅是一个学术殿堂，更是一场关于未来文明形态的实验场。在这里，传统的界限被打破，学科的融合催生出最具革命性的艺术表达。
            </p>
          </section>

          {/* Popular Majors */}
          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl md:text-3xl font-serif font-black text-ink italic">王牌专业百科</h3>
              <p className="text-[9px] font-black text-ink/30 uppercase tracking-widest">Major Encyclopedias</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              {majors.map((major, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveMajor(major.name)}
                  className="group w-full text-left bg-white rounded-3xl md:rounded-[2.5rem] p-8 md:p-10 border border-silver/20 hover:border-cobalt hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 bg-silver/10 rounded-2xl flex items-center justify-center text-ink/20 group-hover:bg-cobalt group-hover:text-white transition-all">
                      <BookOpen size={20} />
                    </div>
                    <div className="px-4 py-1 bg-porcelain rounded-full text-[9px] font-black text-ink/30 uppercase tracking-widest">Detail Handbook</div>
                  </div>
                  <h4 className="text-xl md:text-2xl font-serif font-bold text-ink mb-3 md:mb-4 group-hover:text-cobalt transition-colors italic">{major.name}</h4>
                  <p className="text-xs md:text-sm text-ink/40 leading-relaxed font-light line-clamp-2 italic">{major.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-8 md:space-y-10">
          <section className="bg-white rounded-3xl md:rounded-[3rem] p-8 md:p-10 border border-silver/20 shadow-xl lg:sticky lg:top-28">
            <h3 className="text-lg md:text-xl font-serif font-black text-ink italic mb-6 md:mb-8 border-b border-silver/20 pb-6 uppercase tracking-widest">申请全路径 (Enroll)</h3>
            <div className="space-y-10">
              {steps.map((step, i) => (
                <div 
                  key={i} 
                  className="flex gap-4 md:gap-6 group cursor-pointer" 
                  onClick={() => {
                    const types: ('portfolio' | 'language' | 'statement' | 'interview')[] = ['portfolio', 'language', 'statement', 'interview'];
                    setActiveEnrollmentStep(types[i]);
                  }}
                >
                  <div className="shrink-0 w-8 h-8 rounded-2xl bg-porcelain flex items-center justify-center text-ink/20 group-hover:bg-cobalt group-hover:text-white transition-all text-[11px] font-black italic">
                    {i + 1}
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs md:text-sm font-bold text-ink italic group-hover:text-cobalt transition-colors">{step.title}</h5>
                    <p className="text-[11px] md:text-xs text-ink/30 leading-relaxed font-medium italic">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-12 border-t border-silver/30 space-y-6">
              <button 
                onClick={() => setActiveEnrollmentStep('templates')}
                className="w-full h-16 md:h-20 bg-cobalt text-white rounded-[2rem] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-ink transition-all shadow-3xl shadow-cobalt/20 active:scale-95"
              >
                获取作品集模板 <ArrowRight size={14} />
              </button>
            </div>
          </section>

          <section className="bg-white p-8 md:p-12 rounded-3xl md:rounded-[3rem] border border-silver/20 space-y-8 shadow-sm">
             <div className="flex items-center gap-3 text-ink/60">
                <Users size={16} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Alumni Network</span>
             </div>
             <p className="text-xs text-ink/40 font-medium leading-relaxed italic">已有 12,482 名创作者通过 artiqore 成功申请该校。加入我们的校友网络，获取最新一手的名校笔试与面试真题。</p>
             <button 
               onClick={() => setIsCaseViewOpen(true)}
               className="w-full py-4 border border-silver/20 rounded-2xl text-[9px] md:text-[10px] font-bold text-cobalt uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all flex items-center justify-center gap-3"
             >
               查看往届录取作品集 <ImageIcon size={14} />
             </button>
          </section>
        </div>
      </div>

      <div className="h-32" />

      {/* Floating Action Button */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] md:w-[45%] max-w-2xl"
      >
        <div className="bg-ink/95 backdrop-blur-3xl text-white p-3 md:p-4 rounded-2xl md:rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 shadow-[0_32px_64px_-16px_rgba(30,58,138,0.3)] border border-white/5">
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
            <div className="w-4 h-4 md:w-6 md:h-6 rounded-md md:rounded-lg bg-white/10 flex items-center justify-center text-cobalt overflow-hidden shrink-0 border border-white/10">
               <img src={institution.image} className="w-full h-full object-cover scale-150" alt="" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-[7px] md:text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">artiqore AI Strategy</p>
              <h5 className="text-sm md:text-base font-serif font-black italic tracking-tight">定制您的院校申请全案</h5>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsConsultOpen(true)}
              className="flex-1 md:flex-none px-8 md:px-10 h-10 md:h-12 bg-white text-ink rounded-xl md:rounded-2xl text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all shadow-lg text-center whitespace-nowrap"
            >
              立即咨询
            </button>
          </div>
        </div>
      </motion.div>

      {/* Overlays */}
      <ShareSheet 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="分享顶尖艺术院校"
        itemTitle={institution.name}
      />

      <ConsultationSheet 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        institutionName={institution.name}
      />

      <MajorHandbookView 
        isOpen={!!activeMajor}
        onClose={() => setActiveMajor(null)}
        majorName={activeMajor || ''}
      />

      <CaseDetailView 
        isOpen={isCaseViewOpen}
        onClose={() => setIsCaseViewOpen(false)}
        institutionName={institution.name}
      />

      <AnimatePresence>
        {activeEnrollmentStep && (
          <EnrollmentSectionDetail 
            type={activeEnrollmentStep} 
            onClose={() => setActiveEnrollmentStep(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronLeft, Share2, MapPin, Globe, GraduationCap, Award, BookOpen, MessageSquare, ClipboardCheck, ArrowRight, Heart, Users, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Institution } from '../data/institutions';
import { cn } from '../lib/utils';
import { ShareSheet } from '../components/ShareSheet';

interface InstitutionDetailViewProps {
  institution: Institution;
  onBack: () => void;
}

export const InstitutionDetailView = ({ institution, onBack }: InstitutionDetailViewProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  // Mock detailed data for specific colleges based on their name
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

  return (
    <div className="bg-porcelain min-h-screen pb-32 selection:bg-cobalt selection:text-white">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cobalt/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-silver/10 blur-[100px] rounded-full" />
      </div>

      {/* Navigation Rail */}
      <header className="fixed top-0 inset-x-0 h-20 bg-white/50 backdrop-blur-3xl border-b border-silver/30 z-50 flex items-center justify-between px-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 p-2 -ml-2 hover:bg-black/5 rounded-full transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-silver/20 group-hover:text-cobalt">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-bold text-ink uppercase tracking-[0.4em] italic hidden md:block">Back to Directory</span>
        </button>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsShareOpen(true)}
            className="p-3 hover:bg-black/5 rounded-full transition-all text-ink/40 hover:text-cobalt"
          >
            <Share2 size={20} />
          </button>
          <button className="p-3 hover:bg-black/5 rounded-full transition-all text-ink/40 hover:text-red-500">
            <Heart size={20} />
          </button>
          <div className="h-6 w-[1px] bg-silver/30 mx-2" />
          <button className="px-8 py-3 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt transition-all shadow-xl shadow-ink/10">
            预约咨询
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[4rem] overflow-hidden aspect-[21/9] shadow-3xl shadow-cobalt/5 group"
        >
          <img 
            src={institution.image} 
            alt={institution.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent p-12 md:p-24 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <span className="bg-cobalt text-white text-[9px] font-bold px-6 py-2 rounded-full uppercase tracking-[0.4em] shadow-2xl">
                  {institution.location}
                </span>
                {isElite && (
                  <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-bold px-6 py-2 rounded-full uppercase tracking-[0.4em] border border-white/20">
                    QS World Top Ranked
                  </span>
                )}
              </div>
              <h1 className="text-5xl md:text-8xl font-serif font-light text-white leading-none tracking-tight italic">
                {institution.name}
              </h1>
              {institution.originalName && (
                <p className="text-xl md:text-2xl text-white/40 font-serif italic tracking-wider">
                  {institution.originalName}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-8 mt-24 grid lg:grid-cols-12 gap-16">
        {/* Left: About & Majors */}
        <div className="lg:col-span-8 space-y-24">
          {/* About */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-cobalt">
              <div className="w-12 h-[1px] bg-cobalt" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] italic">The Profile</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-ink italic leading-tight">
              关于院校
            </h2>
            <p className="text-xl text-ink/50 font-light leading-relaxed">
              {institution.description} 该校以其深厚的学术积淀和前瞻性的创新理念闻名于世。院校不仅致力于培养学生卓越的技术表现力，更强调跨学科的深度思考与社会责任感。在数字媒体、交互设计以及可持续设计领域，其研究成果始终处于全球领先地位。
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-silver/30">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Global Rank</p>
                <p className="text-3xl font-serif italic">{institution.rank || 'No. 12'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Acceptance</p>
                <p className="text-3xl font-serif italic">12.5%</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Student Sat.</p>
                <p className="text-3xl font-serif italic">98%</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Faculty Rate</p>
                <p className="text-3xl font-serif italic">1:12</p>
              </div>
            </div>
          </section>

          {/* Popular Majors */}
          <section className="space-y-12">
            <h3 className="text-3xl font-serif font-light text-ink italic">王牌专业 (Elite Majors)</h3>
            <div className="grid sm:grid-cols-2 gap-8">
              {majors.map((major, i) => (
                <div key={i} className="group bg-white rounded-[2.5rem] p-10 border border-silver/20 hover:border-cobalt/30 transition-all shadow-sm hover:shadow-2xl hover:shadow-cobalt/5">
                  <div className="w-12 h-12 bg-silver/10 rounded-2xl flex items-center justify-center text-ink/20 group-hover:bg-cobalt group-hover:text-white transition-all mb-8">
                    <BookOpen size={20} />
                  </div>
                  <h4 className="text-xl font-bold text-ink mb-4 group-hover:text-cobalt transition-colors">{major.name}</h4>
                  <p className="text-sm text-ink/40 leading-relaxed font-light">{major.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Alumni */}
          {institution.notableAlumni && institution.notableAlumni.length > 0 && (
            <section className="space-y-12 bg-ink p-12 md:p-20 rounded-[4rem] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[40%] h-full bg-cobalt/10 blur-[100px] -mr-20 pointer-events-none" />
              <div className="relative z-10 space-y-12">
                <div>
                  <span className="text-cobalt text-[10px] font-bold tracking-[0.5em] uppercase">Historical Resonance</span>
                  <h3 className="text-4xl md:text-5xl font-serif font-light italic mt-4">著名校友</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                  {institution.notableAlumni.map((alumnus, i) => (
                    <div key={i} className="flex items-center gap-6 group cursor-default">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-cobalt border border-white/10 group-hover:bg-cobalt group-hover:text-white transition-all">
                        <Star size={24} />
                      </div>
                      <span className="text-xl font-serif italic text-white/80 group-hover:text-white transition-colors">{alumnus}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right: Application Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          {/* Application Steps */}
          <section className="bg-white rounded-[3rem] p-10 border border-silver/20 shadow-xl sticky top-28">
            <h3 className="text-xl font-serif font-bold text-ink italic mb-8 border-b border-silver/20 pb-4">申请指南 (Enrollment)</h3>
            <div className="space-y-10">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className="shrink-0 w-8 h-8 rounded-full border border-cobalt/30 flex items-center justify-center text-cobalt text-[10px] font-black">
                    0{i + 1}
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-ink">{step.title}</h5>
                    <p className="text-xs text-ink/30 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-12 border-t border-silver/30 space-y-6">
              <div className="bg-porcelain p-6 rounded-2xl border border-silver/20">
                <div className="flex items-center gap-3 mb-2">
                  <ClipboardCheck size={16} className="text-cobalt" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Next Deadline</span>
                </div>
                <p className="text-xl font-serif font-bold italic text-ink">2026年 12月 15日</p>
              </div>
              
              <button className="w-full h-20 bg-cobalt text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-ink transition-all shadow-3xl shadow-cobalt/20 active:scale-95">
                获取作品集模板 <ArrowRight size={14} />
              </button>
            </div>
          </section>

          {/* Quick FAQ / Contacts */}
          <section className="bg-silver/5 p-10 rounded-[3rem] border border-silver/10 space-y-8">
             <div className="flex items-center gap-3 text-ink/60">
                <Users size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Alumni Directory</span>
             </div>
             <p className="text-xs text-ink/40 font-medium leading-relaxed">已有 12,482 名创作者通过 artiqore 成功申请该校。加入我们的校友网络，获取最新一手的名校笔试与面试真题。</p>
             <button className="text-[10px] font-bold text-cobalt uppercase underline underline-offset-4 tracking-widest">
               查看往届录取作品
             </button>
          </section>
        </div>
      </div>

      {/* Campus Atmosphere Feature */}
      <section className="max-w-7xl mx-auto px-8 mt-48 mb-24">
         <div className="bg-white rounded-[4rem] p-12 md:p-24 overflow-hidden relative shadow-2xl border border-white">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-cobalt/5 text-cobalt rounded-full">
                     <Globe size={14} />
                     <span className="text-[9px] font-bold uppercase tracking-widest">Campus Scene</span>
                  </div>
                  <h3 className="text-4xl md:text-6xl font-serif font-light text-ink italic leading-tight">
                    在这里，<br />重定义你的艺术坐标
                  </h3>
                  <p className="text-lg text-ink/40 font-light leading-relaxed max-w-lg">
                    该校园区坐拥极具现代感的艺术地标，提供 24/7 全天候开放的顶级工作室、数字化原型工坊以及沉浸式的展览空间，为你的每一次灵感闪耀提供最坚实的技术基座。
                  </p>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-3 text-xs font-bold text-ink group">
                      在线参观校园 <div className="w-8 h-8 rounded-full border border-silver/50 flex items-center justify-center group-hover:bg-cobalt group-hover:text-white transition-all"><ArrowRight size={14} /></div>
                    </button>
                  </div>
               </div>
               
               <div className="relative">
                  <div className="aspect-square rounded-[3.5rem] overflow-hidden rotate-3 shadow-3xl hover:rotate-0 transition-transform duration-700">
                    <img 
                      src={`https://picsum.photos/seed/campus-${institution.id}/800/800`} 
                      alt="Campus" 
                      className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white p-6 rounded-3xl shadow-2xl -rotate-6 hidden md:block">
                     <p className="text-[10px] font-black uppercase tracking-widest text-cobalt mb-2">Editor's Note</p>
                     <p className="text-[11px] font-serif italic text-ink/60">"The studio atmosphere here is arguably the most dynamic in the world."</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Bottom Sticky Action */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
      >
        <div className="bg-ink/90 backdrop-blur-3xl text-white p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-cobalt overflow-hidden">
               <img src={institution.image} className="w-full h-full object-cover scale-150" alt="" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">artiqore Counselor</p>
              <h5 className="text-lg font-serif italic">获取专属申请评估</h5>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-12 py-5 bg-white text-ink rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-cobalt hover:text-white transition-all">
              立即咨询
            </button>
            <button className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/10">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      <ShareSheet 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="分享顶尖艺术院校"
        itemTitle={institution.name}
      />
    </div>
  );
};

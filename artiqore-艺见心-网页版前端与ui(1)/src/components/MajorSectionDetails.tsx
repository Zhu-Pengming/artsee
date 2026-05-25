import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, Target, GraduationCap, Briefcase, Star, Search, MapPin, TrendingUp, Globe, Sparkles, BookOpen, Quote, Layout, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface SectionDetailProps {
  type: 'philosophy' | 'curriculum' | 'career';
  majorName: string;
  onClose: () => void;
}

// --- Philosophy Detail ---
const PhilosophyDetail = ({ majorName, onClose }: { majorName: string; onClose: () => void }) => {
  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Visual Side (Desktop) / Header (Mobile) */}
      <div className="w-full md:w-1/2 bg-ink p-8 md:p-20 text-white flex flex-col justify-center relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cobalt blur-[120px] rounded-full animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900 blur-[150px] rounded-full" />
        </div>
        
        <div className="relative z-10 space-y-8 md:space-y-12">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-cobalt">
            <Target size={40} className="md:w-12 md:h-12" />
          </div>
          <div className="space-y-4">
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-white/40">Core Philosophy</span>
            <h2 className="text-3xl md:text-6xl font-serif font-black italic italic-none text-white leading-tight tracking-tighter">驱动未来文明的<br />设计主义</h2>
          </div>
          <p className="text-lg md:text-2xl font-light text-white/60 leading-relaxed max-w-xl">
             在 {majorName} 领域，我们拒绝平庸的装饰。我们追求的是通过设计对现实社会结构进行“无害化手术”。
          </p>
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 bg-porcelain p-8 md:p-20 overflow-y-auto no-scrollbar space-y-16">
        <div className="space-y-12">
          <div className="flex items-center gap-4 text-cobalt">
            <div className="w-10 h-[2px] bg-cobalt" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Philosophy Manifesto</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: '设计即权利', desc: '设计不只是美学，更是分配注意力、重新定义交互层级的一种权力。我们教导学生如何平衡这种权力。' },
              { title: '批判性技术', desc: '不盲从工具。我们强调对媒介本身的批判，探讨 AI、算法与生态系统在设计中的真正边界。' },
              { title: '社会化生产', desc: '项目必须在真实的社会噪音中诞生，而非真空中。解决真实世界中那些“难以言喻”的痛点。' },
              { title: '可持续叙事', desc: '不仅仅是环保材料，更是观念的可持续。如何创造一个能跨越时间、引起几代人共鸣的叙事结构。' }
            ].map((item, i) => (
              <div key={i} className="space-y-4 p-8 bg-white rounded-[2rem] shadow-sm border border-silver/10 hover:shadow-xl transition-all">
                <h4 className="text-xl font-serif font-bold italic text-ink">{item.title}</h4>
                <p className="text-sm text-ink/50 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-ink p-10 md:p-16 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
             <Quote size={48} className="text-cobalt/20 absolute -top-4 -right-4" />
             <p className="text-2xl md:text-4xl font-serif font-light italic leading-tight relative z-10">
               “设计是最终的<span className="text-cobalt">解药</span>，也是最初的<span className="text-cobalt">陷阱</span>。我们的理念是教你如何在使用解药的同时，绕过陷阱。”
             </p>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
                   <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" alt="" />
                </div>
                <div>
                   <p className="text-xs font-bold italic">Prof. Alexander Voss</p>
                   <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Head of Strategic Design</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Curriculum Detail ---
const CurriculumDetail = ({ majorName, onClose }: { majorName: string; onClose: () => void }) => {
  const [selectedModule, setSelectedModule] = React.useState<any>(null);

  const modules = [
    { 
      year: 'Year 1', 
      title: '思维重塑与原型研究', 
      desc: '打破传统艺术边界，学习计算建模与生成式设计的基础逻辑。', 
      tags: ['Computational Art', 'Critical Theory'],
      details: {
        syllabus: [
          { title: '媒介考古学', desc: '追溯交互设计的源头，理解数字媒介的物质性基础。' },
          { title: '算法美学入门', desc: '使用 Processing 与 P5.js 探索非线性几何与随机性生成的视觉规律。' },
          { title: '实体原型研究', desc: 'Arduino 与传感器的基础应用，实现基础的物理空间交互。' },
          { title: '批判性技术工作坊', desc: '针对当前社交媒介的成瘾机制，设计一个“反向干扰”原型。' }
        ],
        outcome: '建立起对数字艺术的底层逻辑认知，能够独立完成由代码生成的系列静态及动态作品。',
        mentor: { name: 'Dr. Elena Zhou', role: 'Digital Media Pioneer' }
      }
    },
    { 
      year: 'Year 2', 
      title: '社会化实验与系统工程', 
      desc: '进入真实的社会场景，针对特定政策或生态痛点进行系统性设计，包含跨媒介叙事。', 
      tags: ['Social Design', 'System Thinking'],
      details: {
        syllabus: [
          { title: '参与式设计工作坊', desc: '深入社区进行定性调研，理解复杂利益相关者的真实诉求。' },
          { title: '行为经济学与交互', desc: '探讨如何通过轻微的设计“推力”改变公众在公共空间的行为决策。' },
          { title: '跨媒介品牌叙事', desc: '不仅是视觉，更是一套覆盖全感官的系统性品牌身份定义。' },
          { title: '投机性设计专题', desc: '虚构一个 2050 年的社会危机，并为此设计一套缓解机制。' }
        ],
        outcome: '掌握系统思维，能够处理多维度变量的设计难题，初步具备商业逻辑与社会价值的平衡能力。',
        mentor: { name: 'Prof. Marcus Chen', role: 'System Architect' }
      }
    },
    { 
      year: 'Year 3', 
      title: '前沿实验室与极客协同', 
      desc: '与行业顶级实验室联动，研究 AI、脑机接口或生物设计，探索人类未来的居住可能。', 
      tags: ['Speculative Design', 'Bio-Art'],
      details: {
        syllabus: [
          { title: 'AI 伦理与共创', desc: '深入理解大语言模型与扩散模型，训练企业级私有设计模型。' },
          { title: '后人类主义实验室', desc: '结合合成生物学与可穿戴设计，探讨人类感官的边界拓宽。' },
          { title: '智慧城市底层协议', desc: '研究去中心化治理结构在未来居住环境中的空间表现。' },
          { title: '跨国协作挑战赛', desc: '与伦敦/柏林姊妹院校同步协作，完成一个全球视野的实验装置。' }
        ],
        outcome: '站在技术前沿，具备与工程师、科学家跨学科对话的能力，产出具前瞻性的实验项目。',
        mentor: { name: 'Sarah Miller', role: 'Bio-Design Researcher' }
      }
    },
    { 
      year: 'Year 4', 
      title: 'Thesis: 高维叙事与商业交付', 
      desc: '整合四年的学识，完成具备行业破坏力的毕业设计，并进行全球化预路演。', 
      tags: ['Thesis Project', 'Strategy'],
      details: {
        syllabus: [
          { title: '个人宣言与叙事', desc: '定义你作为设计师的未来十年职业坐标，完成深度调研报告。' },
          { title: '高保真原型交付', desc: '追求像素级与工业级的完美呈现，确保项目的可落地性。' },
          { title: '策展与媒体沟通', desc: '学习如何将复杂的项目转化为具备传播力的公众展示逻辑。' },
          { title: '初创企业投融资', desc: '针对具备商业潜力的项目，由行业投资合伙人进行一对一辅导。' }
        ],
        outcome: '完成一件足以作为行业敲门砖的高水准作品，定义个人独特的设计语言。',
        mentor: { name: 'Prof. Alexander Voss', role: 'Head of Strategic Design' }
      }
    }
  ];

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden relative">
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-[100] bg-white flex flex-col"
          >
            {/* Module Detail Header */}
            <div className="p-8 md:px-20 md:py-12 bg-porcelain border-b border-silver/10 flex items-center justify-between sticky top-0 z-10">
              <button 
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-3 text-ink/40 hover:text-ink transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-silver/10 group-hover:scale-110 transition-transform">
                  <ChevronLeft size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest italic">Wait, go back</span>
              </button>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt mb-1 block italic">{selectedModule.year} / Module Focus</span>
                <h3 className="text-lg md:text-2xl font-serif font-black italic text-ink">{selectedModule.title}</h3>
              </div>
            </div>

            {/* Module Detail Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-24 bg-white">
               <div className="max-w-4xl mx-auto space-y-20">
                  {/* Summary */}
                  <div className="space-y-8">
                     <div className="flex items-center gap-4 text-cobalt">
                        <div className="w-10 h-[2px] bg-cobalt" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Core Syllabus</span>
                     </div>
                     <div className="grid md:grid-cols-2 gap-8">
                        {selectedModule.details.syllabus.map((item: any, i: number) => (
                          <div key={i} className="p-8 bg-porcelain/50 rounded-[2rem] border border-silver/10 space-y-4 hover:bg-white hover:shadow-xl transition-all group">
                             <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-mono font-bold text-cobalt shadow-sm">0{i+1}</span>
                             <h4 className="text-xl font-serif font-bold italic text-ink group-hover:text-cobalt transition-colors">{item.title}</h4>
                             <p className="text-sm text-ink/50 font-light leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Mentorship & Outcome */}
                  <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-silver/10">
                     <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-ink/20 italic">Learning Outcome</h4>
                        <p className="text-xl font-serif font-light italic leading-loose text-ink">
                           {selectedModule.details.outcome}
                        </p>
                     </div>
                     <div className="bg-ink p-10 rounded-[3rem] text-white flex flex-col justify-between">
                        <div className="space-y-4">
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Lead Mentor</span>
                           <h5 className="text-2xl font-serif font-bold italic">{selectedModule.details.mentor.name}</h5>
                           <p className="text-xs text-cobalt font-black uppercase tracking-widest">{selectedModule.details.mentor.role}</p>
                        </div>
                        <div className="pt-8">
                           <button className="w-full py-4 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-ink transition-all">
                              View Portfolio Profile
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Timeline Controls (Desktop) */}
      <aside className="hidden md:flex w-24 bg-ink border-r border-white/5 flex-col items-center py-12 gap-8 shrink-0">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="flex flex-col items-center gap-3">
               <div className={cn("w-1 h-12 rounded-full", idx === 1 ? "bg-cobalt" : "bg-white/10")} />
               <span className={cn("text-[10px] font-black uppercase rotate-90 my-4", idx === 1 ? "text-white" : "text-white/20")}>Year {idx}</span>
            </div>
          ))}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-porcelain">
        {/* Header Hero */}
        <div className="p-8 md:p-20 bg-white border-b border-silver/10 space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-cobalt">
                <GraduationCap size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Adaptive Learning System</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-serif font-black italic tracking-tighter text-ink leading-[0.9]">教学体系<br />深度解构</h2>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-ink/20 mb-2 italic">Credits Required</p>
              <p className="text-4xl font-mono font-bold text-ink">180</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: '核心专业课', val: '65%', color: 'bg-cobalt' },
              { label: '跨学科选修', val: '25%', color: 'bg-indigo-400' },
              { label: '商业/行业实践', val: '10%', color: 'bg-emerald-400' }
            ].map(item => (
              <div key={item.label} className="bg-porcelain/50 p-6 rounded-3xl border border-silver/10 space-y-4">
                 <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black uppercase text-ink/40 tracking-widest">{item.label}</p>
                   <p className="text-sm font-mono font-bold text-ink">{item.val}</p>
                 </div>
                 <div className="h-1.5 w-full bg-ink/5 rounded-full overflow-hidden">
                    <div className={cn("h-full", item.color)} style={{ width: item.val }} />
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Semester Modules */}
        <div className="p-8 md:p-20 space-y-16">
          <section className="space-y-10">
             <div className="flex items-center gap-4">
               <Layout size={18} className="text-cobalt" />
               <h3 className="text-xl md:text-3xl font-serif font-black italic text-ink">阶段重点模块 / Core Modules</h3>
             </div>

             <div className="space-y-6">
               {modules.map((module, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedModule(module)}
                    className="group bg-white p-8 md:p-12 rounded-[2.5rem] border border-silver/10 hover:border-cobalt transition-all flex flex-col md:flex-row gap-8 md:items-center cursor-pointer"
                  >
                    <div className="shrink-0 flex md:flex-col items-center gap-2">
                       <span className="text-xs font-serif font-black italic text-cobalt">{module.year}</span>
                       <div className="hidden md:block w-px h-12 bg-silver/20" />
                    </div>
                    <div className="flex-1 space-y-4">
                       <h4 className="text-xl md:text-2xl font-serif font-bold italic text-ink group-hover:text-cobalt transition-colors">{module.title}</h4>
                       <p className="text-sm md:text-base text-ink/50 font-light leading-relaxed max-w-2xl">{module.desc}</p>
                       <div className="flex flex-wrap gap-2 pt-2">
                          {module.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-porcelain rounded-lg text-[9px] font-bold uppercase tracking-widest text-ink/40 group-hover:bg-cobalt/5 group-hover:text-cobalt transition-all">#{tag}</span>
                          ))}
                       </div>
                    </div>
                    <div className="md:w-16 flex items-center justify-center">
                       <ChevronLeft size={24} className="rotate-180 text-ink/10 group-hover:text-cobalt transition-all" />
                    </div>
                 </div>
               ))}
             </div>
          </section>

          {/* Student Success Box */}
          <div className="bg-cobalt/5 rounded-[3rem] p-10 md:p-16 border border-cobalt/10 flex flex-col md:flex-row gap-12">
             <div className="w-full md:w-1/3 aspect-[4/5] rounded-[2rem] overflow-hidden border border-cobalt/20 shrink-0">
                <img src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="" />
             </div>
             <div className="space-y-8 flex-1">
                <div className="space-y-4">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cobalt">Featured Studio Project</span>
                   <h4 className="text-3xl md:text-5xl font-serif font-black italic text-ink">"Synaptic City" 联觉城市</h4>
                   <p className="text-base text-ink/60 font-light leading-relaxed">
                      该项目由大三学生团队与 Google AI 实验室联合开发，探讨了情绪数据如何通过动态建筑立面实时反馈给居住者，被提名当年 INDEX 设计大奖。
                   </p>
                </div>
                <button className="h-14 px-8 border border-cobalt text-cobalt rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all">案例深度解析 (Case Study)</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Career Detail ---
const CareerDetail = ({ majorName, onClose }: { majorName: string; onClose: () => void }) => {
  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Strategic Board (Desktop) */}
      <div className="w-full md:w-1/2 bg-porcelain p-8 md:p-20 overflow-y-auto no-scrollbar space-y-16">
        <div className="space-y-12">
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-cobalt">
                <Briefcase size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Career Intelligence</span>
             </div>
             <h2 className="text-4xl md:text-7xl font-serif font-black italic tracking-tighter text-ink leading-[0.9]">就业趋势<br />与行业权重</h2>
          </div>

          {/* Salary Data */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-silver/10 space-y-8">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-ink/30 italic">Graduate Salary (USD)</h4>
                <TrendingUp size={16} className="text-cobalt" />
             </div>
             <div className="space-y-6">
                {[
                  { label: '起步薪资', val: '$85k - $120k', p: 80 },
                  { label: '三年经验', val: '$140k - $210k', p: 95 },
                  { label: '五年+战略岗', val: '$280k+', p: 100 }
                ].map(item => (
                  <div key={item.label} className="space-y-3">
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-ink italic">{item.label}</span>
                        <span className="text-xs font-mono font-bold text-cobalt">{item.val}</span>
                     </div>
                     <div className="h-2 w-full bg-porcelain rounded-full overflow-hidden">
                        <div className="h-full bg-cobalt" style={{ width: `${item.p}%` }} />
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Industry Distribution */}
          <div className="grid grid-cols-2 gap-6">
             {[
               { label: 'Tech Giants', val: '42%', icon: <Globe /> },
               { label: 'Creative Org', val: '28%', icon: <Sparkles /> },
               { label: 'Public Sector', val: '15%', icon: <MapPin /> },
               { label: 'Entrepreneurs', val: '15%', icon: <TrendingUp /> }
             ].map(item => (
               <div key={item.label} className="bg-white p-8 rounded-[2.5rem] border border-silver/10 space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-porcelain flex items-center justify-center text-cobalt">
                     {React.cloneElement(item.icon as any, { size: 18 })}
                  </div>
                  <div className="space-y-1">
                     <p className="text-2xl font-serif font-black italic text-ink">{item.val}</p>
                     <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">{item.label}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Partners / Alumni Side */}
      <div className="flex-1 bg-ink text-white p-8 md:p-20 overflow-y-auto no-scrollbar relative">
         <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,#1d4ed8_0%,transparent_50%)]" />
         
         <div className="relative z-10 space-y-20">
            {/* Top Recruiters */}
            <div className="space-y-12">
               <div className="flex items-center gap-4 text-white/40">
                  <div className="w-10 h-[1px] bg-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Top Recruitment Partners</span>
               </div>
               <div className="grid grid-cols-2 gap-x-12 gap-y-16">
                  {['Google', 'Tesla', 'IDEO', 'Meta', 'Apple', 'Frog Design'].map(brand => (
                    <div key={brand} className="text-2xl md:text-4xl font-serif font-bold italic opacity-20 hover:opacity-100 transition-all cursor-crosshair">
                      {brand}
                    </div>
                  ))}
               </div>
            </div>

            {/* Career Velocity Box */}
            <div className="bg-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem] border border-white/10 space-y-10">
               <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-[0.4em] text-cobalt">Alumni Career Velocity</h4>
                  <p className="text-xl md:text-3xl font-serif font-light italic leading-loose text-white/60">
                     我们的毕业生平均在入职第 <span className="text-white font-black">2.4</span> 年晋升至中高层决策岗位，职业增速远超行业平均水平 <span className="text-white font-black">1.8</span> 倍。
                  </p>
               </div>
               
               <div className="flex flex-col gap-4">
                  {[
                    { name: 'David W.', role: 'Senior UX Lead @ Airbnb', desc: '从毕业设计到硅谷独角兽核心团队仅用时 18 个月。' },
                    { name: 'Chen L.', role: 'Founder of "Nova" Studio', desc: '主导了亚太区多个地标型数字艺术装置设计与交付。' }
                  ].map((alumnus, i) => (
                    <div key={i} className="flex gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                       <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0">
                          <User size={24} className="m-auto mt-3 text-white/20" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-cobalt">{alumnus.name}</p>
                          <p className="text-sm font-bold italic">{alumnus.role}</p>
                          <p className="text-[10px] text-white/30 font-medium">{alumnus.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <button className="w-full h-20 bg-white text-ink rounded-3xl text-xs font-bold uppercase tracking-[0.3em] hover:bg-cobalt hover:text-white transition-all shadow-2xl shadow-cobalt/20">
               获取定制就业报告 (Full Report)
            </button>
         </div>
      </div>
    </div>
  );
};

// --- Main Container ---
export const MajorSectionDetail = ({ type, majorName, onClose }: SectionDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] flex items-center justify-center p-0 md:p-8"
    >
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="relative w-full h-full max-h-screen md:max-h-[85vh] md:max-w-[1400px] bg-white md:rounded-[4rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)]"
      >
        {/* Navigation / Close */}
        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-50 flex items-center gap-4">
           <button 
             onClick={onClose}
             className="w-12 h-12 md:w-20 md:h-20 bg-white/80 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-all border border-silver/10"
           >
             <X size={24} />
           </button>
        </div>

        <div className="h-full">
           {type === 'philosophy' && <PhilosophyDetail majorName={majorName} onClose={onClose} />}
           {type === 'curriculum' && <CurriculumDetail majorName={majorName} onClose={onClose} />}
           {type === 'career' && <CareerDetail majorName={majorName} onClose={onClose} />}
        </div>
      </motion.div>
    </motion.div>
  );
};

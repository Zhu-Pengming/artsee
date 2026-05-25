import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  PenTool, 
  LayoutGrid, 
  BookOpen, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Heart,
  Bookmark,
  History,
  Settings as SettingsIcon,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  ArrowLeft,
  Share2,
  Users,
  FileText,
  Calendar,
  Sparkles,
  Star,
  Lock,
  MessageCircle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ModuleDetailViewProps {
  moduleId: string;
  onUserClick?: (userId: string) => void;
}

// --- Sub-View: Application Form ---
const ApplicationForm = ({ onClose }: { onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed inset-0 z-50 bg-white md:bg-black/5 md:backdrop-blur-xl flex items-center justify-center p-0 md:p-10"
  >
    <div className="w-full h-full md:max-w-5xl md:h-[90vh] bg-white md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
      <div className="p-6 md:p-10 border-b border-silver/10 flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={onClose} className="p-3 bg-porcelain rounded-2xl text-ink hover:text-cobalt transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-serif font-black italic text-ink">项目申请 (Application)</h3>
          <p className="text-[9px] text-ink/30 font-bold uppercase tracking-widest mt-1">Proposal Submission</p>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-16">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-cobalt uppercase tracking-[0.3em]">01. 基础信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink/40 uppercase">联系姓名</label>
                <input type="text" className="w-full p-4 bg-porcelain rounded-2xl border border-transparent focus:border-cobalt transition-all outline-none text-sm font-bold" placeholder="您的称呼" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink/40 uppercase">个人主页/作品集</label>
                <input type="text" className="w-full p-4 bg-porcelain rounded-2xl border border-transparent focus:border-cobalt transition-all outline-none text-sm font-bold" placeholder="https://" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-cobalt uppercase tracking-[0.3em]">02. 作品提案</h4>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-ink/40 uppercase">创作构思 (Concept)</label>
              <textarea className="w-full p-4 bg-porcelain rounded-3xl border border-transparent focus:border-cobalt transition-all outline-none text-sm font-bold h-40 resize-none" placeholder="简述您针对该项目的创作切入点..." />
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-xs font-black text-cobalt uppercase tracking-[0.3em]">03. 附件上传</h4>
             <div className="border-2 border-dashed border-silver/40 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-cobalt/40 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-porcelain rounded-2xl flex items-center justify-center text-ink/20 group-hover:text-cobalt group-hover:scale-110 transition-all">
                  <Plus size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-ink">点击或拖拽上传</p>
                  <p className="text-[10px] text-ink/30 mt-1 uppercase font-black">Supported: PDF, JPG, MP4 (Max 50MB)</p>
                </div>
             </div>
          </div>

          <button onClick={onClose} className="w-full py-6 bg-ink text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-cobalt transition-all active:scale-95">
             确认提交 (FINALIZE SUBMISSION)
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Sub-View: Progress Detail ---
const ProgressDetail = ({ onClose }: { onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, x: '100%' }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: '100%' }}
    className="fixed inset-0 z-50 bg-white flex flex-col h-full"
  >
    <div className="p-6 md:p-10 border-b border-silver/10 flex items-center justify-between sticky top-0 bg-white z-10">
      <button onClick={onClose} className="p-3 bg-porcelain rounded-2xl text-ink hover:text-cobalt transition-colors">
        <ArrowLeft size={20} />
      </button>
      <h3 className="text-xl font-serif font-black italic">申请进度 (Live Feed)</h3>
      <button className="p-3 bg-porcelain rounded-2xl text-ink">
        <MoreHorizontal size={20} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Stats */}
        <div className="bg-ink p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="space-y-4 text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">当前申请状态</p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                 <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="text-white" size={32} />
                 </div>
                 <h2 className="text-4xl font-serif font-black italic">极具潜力</h2>
              </div>
           </div>
           <div className="flex gap-12">
              <div className="text-center">
                 <p className="text-2xl font-serif font-black italic">128</p>
                 <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">总申请人数</p>
              </div>
              <div className="text-center">
                 <p className="text-2xl font-serif font-black italic text-green-400">8</p>
                 <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">通过初筛</p>
              </div>
           </div>
        </div>

        {/* Timeline */}
        <div className="space-y-10">
          <h4 className="text-xs font-black text-ink uppercase tracking-[0.3em] flex items-center gap-2">
            <History size={16} /> 审核进程 (Timeline)
          </h4>
          <div className="relative space-y-12 pl-12 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-ink/5">
             {[
               { title: '在线面试预约', time: '2026.04.30', status: 'pending', desc: '您的作品已获策展组关注，请选择合适的视频面试时段。' },
               { title: '通过作品集初筛', time: '2026.04.28', status: 'completed', desc: '恭喜！您的《物理空间探索》系列已通过专家组评审。' },
               { title: '简历与资质审核', time: '2026.04.27', status: 'completed', desc: '认证艺术家身份通过，背景资料核实无误。' },
               { title: '申请已提交', time: '2026.04.26', status: 'completed', desc: '已接收到您的申请材料，排队等待审核中。' }
             ].map((step, i) => (
               <div key={i} className="relative group">
                  <div className={cn(
                    "absolute -left-12 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all",
                    step.status === 'completed' ? "bg-green-500 text-white" : "bg-porcelain text-ink/20 animate-pulse"
                  )}>
                    {step.status === 'completed' ? <CheckCircle2 size={12} /> : <div className="w-2 h-2 bg-ink/20 rounded-full" />}
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center gap-3">
                        <h5 className="text-base font-bold text-ink">{step.title}</h5>
                        <span className="text-[10px] font-bold text-ink/20 uppercase">{step.time}</span>
                     </div>
                     <p className="text-xs text-ink/50 leading-relaxed max-w-lg">{step.desc}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({ moduleId, onUserClick }) => {
  const [showApplication, setShowApplication] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

// --- Sub-View: Workshop/Booking Detail (Based on workshop data) ---
const WorkshopBookingDetail = ({ onClose }: { onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="fixed inset-0 z-[60] bg-[#111] overflow-y-auto no-scrollbar pb-20"
  >
    <div className="max-w-md mx-auto min-h-screen px-6 py-12 flex flex-col justify-between">
      <header className="flex justify-between items-center mb-16">
        <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"><Share2 size={18} /></button>
          <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"><MoreHorizontal size={18} /></button>
        </div>
      </header>

      <div className="space-y-12">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Starts From</span>
          <h2 className="text-5xl font-serif font-black text-white tracking-tight italic">¥2,880</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex items-center gap-6 group cursor-pointer hover:bg-white/10 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Duration</p>
              <p className="text-xl font-black text-white uppercase mt-0.5">3 DAYS 2 NIGHTS</p>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex items-center gap-6 group cursor-pointer hover:bg-white/10 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white/40">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Capacity</p>
              <p className="text-xl font-black text-white uppercase mt-0.5">8 SLOTS ONLY</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button className="w-full py-7 bg-[#0047bb] text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-900/20 active:scale-95 transition-transform">
            立即预定席位
          </button>
          <button className="w-full py-7 bg-white/5 border border-white/10 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <Zap size={20} className="text-blue-500" />
            咨询主理人
          </button>
        </div>
      </div>

      <footer className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
         <div className="flex -space-x-4">
           {[1,2,3].map(i => (
             <img key={i} src={`https://i.pravatar.cc/100?u=a${i}`} className="w-10 h-10 rounded-full border-4 border-[#111]" alt="" />
           ))}
         </div>
         <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">5 Artists Already Booked</p>
      </footer>
    </div>
  </motion.div>
);

  const renderContent = () => {
    switch (moduleId) {
      case 'mentorship':
        return (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="space-y-4">
                 <h2 className="text-4xl md:text-6xl font-serif font-black italic text-ink leading-none">精英导师计划</h2>
                 <p className="text-ink/40 text-[10px] md:text-sm font-bold uppercase tracking-[0.4em]">Premium Mentorship Sessions</p>
              </div>
              <div className="flex gap-4">
                 <button className="p-4 bg-ink text-white rounded-2xl"><Filter size={20} /></button>
                 <button className="p-4 bg-porcelain text-ink rounded-2xl"><Search size={20} /></button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: '王教授', title: '艺术史专家', focus: '叙事性表达', price: '¥1,500/hr' },
                { name: '李老师', title: '跨学科艺术家', focus: '数字孪生', price: '¥2,880/Workshop' },
                { name: 'Dr. Zhang', title: '独立策展人', focus: '商业运作', price: '¥1,200/hr' }
              ].map((m, i) => (
                <div 
                  key={i} 
                  onClick={() => onUserClick?.(`mentor_${i}`)}
                  className="bg-white p-8 rounded-[3rem] border border-silver/40 shadow-sm hover:shadow-2xl transition-all group cursor-pointer"
                >
                  <div className="w-20 h-20 bg-porcelain rounded-3xl overflow-hidden mb-6">
                    <img src={`https://i.pravatar.cc/150?u=${m.name}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                  </div>
                  <h3 className="text-xl font-bold text-ink italic">{m.name}</h3>
                  <p className="text-[10px] font-bold text-cobalt uppercase tracking-widest mt-1">{m.title}</p>
                  <p className="text-xs text-ink/40 mt-4 leading-relaxed line-clamp-2">专注于在{m.focus}领域提供深度的学术指导与职业规划建议。</p>
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-silver/10">
                     <span className="text-sm font-black italic">{m.price}</span>
                     <ChevronRight size={16} className="text-ink/20 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'academic':
        return (
          <div className="space-y-10">
            <header>
              <h2 className="text-3xl font-serif font-bold text-ink italic">学术研习 (Art Learning)</h2>
              <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Deep Dive into Theory & Practice</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: '本月学习时长', value: '24.5h', change: '+12%', color: 'text-green-600' },
                { label: '已修完课程', value: '12', change: '+2', color: 'text-cobalt' },
                { label: '研习积分', value: '1,280', change: '+150', color: 'text-orange-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-silver/40 shadow-sm">
                   <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest mb-4">{stat.label}</p>
                   <h3 className="text-2xl font-serif font-black text-ink italic">{stat.value}</h3>
                   <p className={cn("text-[9px] font-bold mt-2", stat.color)}>{stat.change} Since last session</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold italic border-b border-silver/30 pb-4">在研课题 (Current Research)</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: '当代雕塑中的“负空间”叙事', progress: 85, instructor: 'Prof. Zhang', deadline: '2026-05-12' },
                  { title: '生成式 AI 与艺术版权的边界', progress: 40, instructor: 'Dr. Lee', deadline: '2026-06-01' },
                  { title: '公共艺术中的沉浸式交互设计', progress: 10, instructor: 'Elena Weber', deadline: '2026-07-20' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-silver/40 flex items-center justify-between group hover:border-cobalt/30 transition-all cursor-pointer">
                    <div className="space-y-2 flex-1">
                      <h4 className="text-sm font-bold text-ink group-hover:text-cobalt transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-4 text-[9px] font-bold text-ink/30 uppercase tracking-widest">
                        <span>导师: {item.instructor}</span>
                        <span>截止: {item.deadline}</span>
                      </div>
                    </div>
                    <div className="w-32 flex flex-col items-end gap-2">
                       <span className="text-[10px] font-bold text-cobalt">{item.progress}%</span>
                       <div className="w-full h-1 bg-silver/20 rounded-full overflow-hidden">
                         <div className="h-full bg-cobalt transition-all duration-1000" style={{ width: `${item.progress}%` }}></div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'roadmap':
        return (
          <div className="space-y-12 pb-20">
            <header className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-serif font-black italic text-ink leading-tight">成长路径 (Roadmap)</h2>
              <div className="flex items-center gap-4">
                <span className="px-4 py-1 bg-ink text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em]">Expert Track</span>
                <span className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em]">Tier 04 / Contemporary Sculptor</span>
              </div>
            </header>

            <div className="flex flex-col md:flex-row gap-16">
               <div className="md:w-1/3 space-y-8">
                  <div className="bg-porcelain p-10 rounded-[3rem] space-y-6">
                     <p className="text-[10px] font-black text-ink/30 uppercase tracking-widest">总体进度 (Progress)</p>
                     <div className="flex items-end gap-4">
                        <span className="text-5xl font-serif font-black italic">68%</span>
                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden mb-2">
                           <div className="h-full bg-cobalt" style={{ width: '68%' }}></div>
                        </div>
                     </div>
                     <p className="text-xs text-ink/50 leading-relaxed font-bold italic">
                        您已完成基础科研与材料探索。目前的重点在于“跨媒介叙事”的构建。
                     </p>
                  </div>
                  
                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-ink uppercase tracking-[0.3em]">待解锁里程碑</h4>
                     {[1, 2].map(i => (
                        <div key={i} className="p-6 bg-white border border-silver/40 rounded-3xl opacity-50 flex items-center gap-4">
                           <Lock size={16} className="text-ink/20" />
                           <span className="text-sm font-bold text-ink italic">未来展览规划 {i}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex-1 space-y-16">
                  {[
                    { label: '第一阶段: 物质性研究', status: 'completed', tasks: ['金属热着色实验', '空间占比分析'] },
                    { label: '第二阶段: 感官交互设计', status: 'active', tasks: ['AR 虚拟重力模拟', '低频音波震动整合'] },
                    { label: '第三阶段: 公共场域接入', status: 'pending', tasks: ['社区参与式艺术调研', '快闪展览策划'] }
                  ].map((phase, i) => (
                    <div key={i} className="relative pl-12 before:absolute before:left-4 before:top-2 before:bottom-0 before:w-[2px] before:bg-ink/5">
                       <div className={cn(
                         "absolute -left-0 w-8 h-8 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-all",
                         phase.status === 'completed' ? "bg-green-500 text-white" : (phase.status === 'active' ? "bg-cobalt text-white scale-110" : "bg-porcelain text-ink/20")
                       )}>
                         {phase.status === 'completed' ? <CheckCircle2 size={12} /> : (phase.status === 'active' ? <TrendingUp size={12} /> : <div className="w-2 h-2 bg-black/20 rounded-full" />)}
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-xl font-bold text-ink italic">{phase.label}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {phase.tasks.map((task, j) => (
                               <div key={j} className="p-5 bg-white border border-silver/40 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-cobalt/40 transition-all">
                                  <span className="text-sm font-bold text-ink italic opacity-70 group-hover:opacity-100">{task}</span>
                                  <ArrowUpRight size={14} className="text-ink/20 group-hover:text-cobalt" />
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="space-y-12">
             <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="space-y-4">
                   <h2 className="text-4xl md:text-6xl font-serif font-black italic text-ink leading-tight">智能创作分析</h2>
                   <p className="text-ink/40 text-[10px] md:text-sm font-bold uppercase tracking-[0.4em]">AI-Powered Creative Intelligence</p>
                </div>
                <button className="px-8 py-4 bg-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">深度报告</button>
             </header>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-ink p-12 rounded-[4rem] text-white space-y-12 relative overflow-hidden group">
                   <div className="relative z-10 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">创作完整度评估</p>
                      <h3 className="text-7xl font-serif font-black italic tracking-tighter">82%</h3>
                   </div>
                   <div className="relative z-10 flex items-center gap-4 text-green-400 font-bold">
                      <TrendingUp size={24} />
                      <span className="text-sm italic">Compared to baseline (+12%)</span>
                   </div>
                   <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cobalt opacity-20 rounded-full blur-[100px] group-hover:scale-110 transition-transform"></div>
                </div>

                <div className="bg-white p-12 rounded-[4rem] border border-silver/40 space-y-8 shadow-sm">
                   <h4 className="text-xs font-black text-ink uppercase tracking-[0.3em]">市场情感偏好 (Market Sentiment)</h4>
                   <div className="flex flex-wrap gap-4">
                      {['极简主义', '工业叙事', '未来主义', '有机形态', '沉静感'].map(tag => (
                        <span key={tag} className="px-6 py-3 bg-porcelain rounded-2xl text-xs font-bold text-ink italic hover:bg-cobalt hover:text-white transition-all cursor-default">{tag}</span>
                      ))}
                   </div>
                   <p className="text-xs text-ink/40 leading-relaxed italic border-t border-silver/10 pt-6">
                      当前市场对“重构工业材料”的艺术作品表现出强烈的收藏意向。
                   </p>
                </div>
             </div>
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="space-y-4">
                 <h2 className="text-4xl md:text-6xl font-serif font-black italic text-ink leading-tight">创作工具 (Creative Tools)</h2>
                 <p className="text-ink/40 text-[10px] md:text-sm font-bold uppercase tracking-[0.4em]">Powered by Generative Intelligence</p>
              </div>
              <div className="flex bg-porcelain p-1.5 rounded-2xl">
                 {['AI 辅助', '作品集', '商业'].map(t => (
                   <button key={t} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">{t}</button>
                 ))}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: '作品集一键生成', icon: <Sparkles size={24} />, color: 'bg-cobalt', desc: '基于您的近期作品，智能排版并生成 PDF 作品集。' },
                { title: 'AI 策展助理', icon: <PenTool size={24} />, color: 'bg-orange-500', desc: '根据空间布局建议最佳的作品陈列方案。' },
                { title: '材料成本计算器', icon: <LayoutGrid size={24} />, color: 'bg-green-600', desc: '精准核算不同材质在大型装置中的成本占比。' },
                { title: '灵感对撞机', icon: <Zap size={24} />, color: 'bg-[#111]', desc: '随机提取世界名画与现代建筑的视觉锚点进行融合。' }
              ].map((tool, i) => (
                <div key={i} className="bg-white p-10 rounded-[3.5rem] border border-silver/40 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-[400px]">
                   <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-8", tool.color)}>
                      {tool.icon}
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-2xl font-serif font-black italic text-ink leading-tight">{tool.title}</h4>
                      <p className="text-xs text-ink/40 font-bold leading-relaxed">{tool.desc}</p>
                   </div>
                   <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-ink group-hover:text-cobalt transition-colors mt-8">
                      立即尝试 <ChevronRight size={14} />
                   </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'community':
        return (
          <div className="space-y-12 max-w-5xl mx-auto">
             <header className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-cobalt rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                   <Users size={40} />
                </div>
                <div className="space-y-2">
                   <h2 className="text-4xl md:text-6xl font-serif font-black italic text-ink tracking-tight">艺术共振社区</h2>
                   <p className="text-ink/30 text-[10px] font-black uppercase tracking-[0.4em]">Where Visionaries Connect</p>
                </div>
                <div className="flex gap-4">
                   <button className="px-8 py-3 bg-porcelain text-ink rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-silver/20">加入社群</button>
                   <button className="px-8 py-3 bg-ink text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">发起讨论</button>
                </div>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="bg-white p-8 rounded-[3rem] border border-silver/40 shadow-sm space-y-6 group cursor-pointer hover:border-cobalt transition-all">
                        <div className="flex items-center gap-4" onClick={(e) => {
                           e.stopPropagation();
                           onUserClick?.(`artist_${i}`);
                        }}>
                           <img src={`https://i.pravatar.cc/100?u=c${i}`} className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" alt="" />
                           <div>
                              <p className="text-sm font-bold text-ink italic">艺术家 {i}</p>
                              <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest">2小时前 · 柏林</p>
                           </div>
                        </div>
                        <p className="text-base text-ink/80 leading-relaxed font-serif italic">
                           “关于数字化景观对个人身份的消解，大家怎么看？最近我在尝试将动态追踪数据转化为 3D 打印的物理结构...”
                        </p>
                        <div className="flex items-center gap-8 pt-4">
                           <div className="flex items-center gap-2 text-ink/30 font-bold text-xs"><Heart size={16} /> 1.2k</div>
                           <div className="flex items-center gap-2 text-ink/30 font-bold text-xs"><MessageCircle size={16} /> 45</div>
                           <div className="flex items-center gap-2 text-ink/30 font-bold text-xs"><Share2 size={16} /> 12</div>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="space-y-8">
                   <div className="bg-porcelain p-8 rounded-[3rem] space-y-6">
                      <h4 className="text-xs font-black text-ink uppercase tracking-[0.3em] italic">热门超话</h4>
                      <div className="space-y-4">
                         {['#材料实验录#', '#跨媒体叙事#', '#当代装置#'].map(t => (
                           <div key={t} className="flex items-center justify-between text-sm font-bold text-ink italic hover:text-cobalt cursor-pointer transition-colors">
                              <span>{t}</span>
                              <TrendingUp size={14} className="text-ink/20" />
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-10">
             <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-serif font-bold text-ink italic">收益报表 (Analytics)</h2>
                <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Financial Performance & Forecast</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">可提现余额 (Available)</p>
                <p className="text-2xl font-serif font-black text-cobalt italic">CNY 8,420.50</p>
              </div>
            </header>

            <div className="bg-ink p-10 rounded-[3rem] text-white flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">本年度累计总收益</p>
                <h3 className="text-5xl font-serif font-black italic">¥12,450.00</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                    <TrendingUp size={14} />
                    <span>同比增长 128.5%</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <button className="px-10 py-4 bg-cobalt text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-cobalt/40 hover:scale-105 active:scale-95 transition-all">
                  立即提现 (WITHDRAW)
                </button>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-center border-b border-silver/30 pb-4">
                <h3 className="text-xl font-serif font-bold italic">收益明细 (Transactions)</h3>
                <div className="flex gap-2">
                  <button className="p-2 border border-silver/30 rounded-xl text-ink/30 hover:text-cobalt"><Filter size={16} /></button>
                  <button className="p-2 border border-silver/30 rounded-xl text-ink/30 hover:text-cobalt"><Search size={16} /></button>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: '香格里拉大酒店沙龙分红', date: '2026-04-12', amount: '+ 4,200.00', type: 'collab' },
                  { label: '作品《重力》版画售出', date: '2026-04-08', amount: '+ 1,850.00', type: 'sale' },
                  { label: '平台创作激励 (三月份)', date: '2026-04-01', amount: '+ 240.00', type: 'incentive' },
                  { label: '私人定制佣金 (预付款)', date: '2026-03-25', amount: '+ 5,000.00', type: 'collab' },
                ].map((tx, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-silver/40 flex items-center justify-between hover:bg-porcelain/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        tx.type === 'collab' ? "bg-cobalt/5 text-cobalt" : "bg-orange-50 text-orange-600"
                      )}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">{tx.label}</p>
                        <p className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">{tx.date}</p>
                      </div>
                    </div>
                    <p className="text-lg font-serif font-black text-ink italic">{tx.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'creation':
        return (
          <div className="space-y-10">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold text-ink italic">创作中心 (Studio)</h2>
                <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Manage Your Creative Output</p>
              </div>
              <button className="p-4 bg-ink text-white rounded-2xl hover:bg-cobalt transition-all shadow-xl active:scale-95">
                <Plus size={24} />
              </button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: '近期草图', count: '48', icon: <PenTool size={18} /> },
                { label: '成品库', count: '124', icon: <LayoutGrid size={18} /> },
                { label: '协作中', count: '3', icon: <History size={18} /> },
                { label: '已售出', count: '12', icon: <CheckCircle2 size={18} /> },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-silver/40 shadow-sm text-center space-y-3 hover:border-cobalt/30 transition-all cursor-pointer group">
                  <div className="text-ink/20 group-hover:text-cobalt transition-colors flex justify-center">{stat.icon}</div>
                  <div>
                    <p className="text-xl font-serif font-black italic">{stat.count}</p>
                    <p className="text-[9px] font-bold text-ink/30 uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold italic">作品集预览 (Portfolio Preview)</h3>
                <button className="text-[10px] font-bold text-cobalt uppercase underline underline-offset-4">查看完整版</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square rounded-3xl overflow-hidden border border-silver/40 group relative cursor-pointer">
                    <img 
                      src={`https://picsum.photos/seed/creation${i}/600/600`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all p-4">
                      <p className="text-white text-[10px] font-bold uppercase tracking-widest text-center">编辑详情</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'report':
        return (
          <div className="max-w-2xl mx-auto space-y-12">
            <header className="text-center space-y-4">
              <div className="inline-block px-4 py-1 bg-cobalt text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em]">Insight / Weekly</div>
              <h2 className="text-4xl font-serif font-extrabold text-ink italic leading-tight">创作灵感周报</h2>
              <p className="text-ink/30 text-[10px] font-black uppercase tracking-[0.4em]">2026.04.14 - 2026.04.20</p>
            </header>

            <div className="bg-white p-12 rounded-[3.5rem] border border-silver/40 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 space-y-10">
                  <section className="space-y-6">
                    <h3 className="text-xs font-black text-cobalt uppercase tracking-[0.3em] flex items-center gap-2">
                       <TrendingUp size={16} /> 趋势洞察
                    </h3>
                    <p className="text-ink/80 leading-relaxed font-serif text-lg italic">
                      “当前上海地区对‘生物形态雕塑’的搜索量环比增长了 **42%**。您的作品《无尽之维》正好切中了这一审美趋势。”
                    </p>
                  </section>

                  <section className="space-y-6 border-t border-silver/30 pt-10">
                    <h3 className="text-xs font-black text-cobalt uppercase tracking-[0.3em] flex items-center gap-2">
                       <History size={16} /> 特别关注
                    </h3>
                    <div className="flex gap-6 items-center p-6 bg-porcelain rounded-3xl">
                      <img src="https://picsum.photos/seed/dior/100/100" className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" alt="" />
                      <div>
                        <p className="text-sm font-bold text-ink italic">Dior 策展团队</p>
                        <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest mt-1">三分钟前停留过您的个人页</p>
                      </div>
                    </div>
                    <p className="text-xs text-ink/60 leading-normal">
                      来自 Dior 的策展团队近期活跃在“空间材质”标签下。建议在近期增加两篇关于材料实验的动态，以增加曝光覆盖面。
                    </p>
                  </section>

                  <section className="space-y-6 border-t border-silver/30 pt-10 pb-4 text-center">
                    <p className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.4em]">End of report</p>
                    <button className="w-full py-5 bg-ink text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cobalt transition-all shadow-xl">
                      分享此报告 (SHARE)
                    </button>
                  </section>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-cobalt/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>
          </div>
        );

      case 'collections':
      case 'bookmarks':
      case 'applications':
        return (
          <div className="space-y-10">
            <header>
              <h2 className="text-3xl font-serif font-bold text-ink italic">项目详情 (Opportunity Detail)</h2>
              <p className="text-ink/30 text-[10px] tracking-[0.3em] uppercase mt-2 font-black">Strategic Partnership & Grant</p>
            </header>

            {/* Main Application Card based on user's screenshot */}
            <div className="bg-white rounded-[3.5rem] border border-silver/40 shadow-2xl overflow-hidden p-8 md:p-16 flex flex-col items-center text-center space-y-10 relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-porcelain rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
               
               <div className="space-y-4 relative z-10">
                  <p className="text-[10px] font-black text-ink/30 uppercase tracking-[0.4em]">项目预算区间 (Budget range)</p>
                  <h3 className="text-4xl md:text-7xl font-serif font-black italic text-ink tracking-tighter leading-tight">
                    按比例分成
                  </h3>
               </div>

               <button 
                onClick={() => setShowApplication(true)}
                className="w-full md:w-auto px-16 py-7 bg-[#111] text-white rounded-[2.5rem] text-sm md:text-lg font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-cobalt transition-all hover:scale-[1.02] active:scale-[0.98]"
               >
                 立即申请 (APPLY NOW)
               </button>

               <div className="flex items-center gap-10 text-[10px] font-black text-ink/30 uppercase tracking-widest pt-4">
                  <button className="flex items-center gap-2 hover:text-ink transition-colors">
                    <Bookmark size={14} /> 收藏机会
                  </button>
                  <button className="flex items-center gap-2 hover:text-ink transition-colors">
                    <Share2 size={14} /> 分享详情
                  </button>
               </div>
            </div>

            {/* Applicant Info Progress Card based on user's screenshot */}
            <div 
              onClick={() => setShowProgress(true)}
              className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-silver/40 shadow-md group cursor-pointer hover:border-cobalt transition-all"
            >
               <div className="flex items-center gap-3 mb-10">
                  <Star size={18} className="text-orange-400" />
                  <h4 className="text-xs md:text-sm font-black text-ink uppercase tracking-[0.3em]">申请进度 (APPLICANT INFO)</h4>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="font-bold text-ink/50 italic">已申请人数</span>
                    <span className="font-black text-ink">128 人</span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="font-bold text-ink/50 italic">通过初筛</span>
                    <span className="font-black text-green-500">8 人</span>
                  </div>
                  
                  <div className="pt-4">
                    <div className="w-full h-1.5 bg-silver/20 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-cobalt" 
                       />
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6 pt-10">
               <h4 className="text-xs font-black text-ink uppercase tracking-[0.3em]">项目亮点 (Highlights)</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: '商业授权', desc: '包含全球范围内的数字版权商业授权收益计划。', icon: <FileText size={18} /> },
                    { label: '跨界合作', desc: '与顶级时尚品牌建立长期的装置艺术合作关系。', icon: <Sparkles size={18} /> },
                  ].map((h, i) => (
                    <div key={i} className="p-8 bg-porcelain rounded-[2.5rem] flex gap-4">
                       <div className="shrink-0 text-cobalt">{h.icon}</div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-ink italic">{h.label}</p>
                          <p className="text-[11px] text-ink/40 font-bold leading-relaxed">{h.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );

      case 'privacy':
      case 'wallet':
      case 'settings':
        const settingsTitleMap: Record<string, string> = {
          privacy: '艺术家隐私保护',
          wallet: '支付与钱包安全',
          settings: '平台账户偏好'
        };
        const settingsDescMap: Record<string, string> = {
          privacy: '控制您的作品可见性与商业授权范围',
          wallet: '管理提现渠道与交易凭证安全',
          settings: '个性化您的浏览体验与智能推送策略'
        };

        return (
          <div className="max-w-2xl mx-auto space-y-10">
            <header className="space-y-2">
              <h2 className="text-3xl font-serif font-bold text-ink italic">{settingsTitleMap[moduleId]}</h2>
              <p className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em]">{settingsDescMap[moduleId]}</p>
            </header>

            <div className="bg-white rounded-[3rem] border border-silver/40 shadow-sm overflow-hidden divide-y divide-silver/30">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="p-8 flex items-center justify-between hover:bg-porcelain/30 transition-all cursor-pointer group">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-ink">配置项示例 {idx}</p>
                    <p className="text-xs text-ink/40">这是一个关于该设置项的简要描述和当前状态。</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-ink/20 uppercase">已开启</span>
                    <div className="w-10 h-6 bg-cobalt rounded-full p-1 flex justify-end">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-ink/5 rounded-3xl border border-silver/40">
              <div className="flex gap-4">
                <ShieldCheck className="text-cobalt shrink-0" size={24} />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-widest">安全建议 (Secured)</h4>
                  <p className="text-xs text-ink/60 leading-relaxed">
                    我们采用了端到端加密技术保护您的商业数据。建议定期检查您的授权列表，以确保艺术权益未被滥用。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-96 flex items-center justify-center">
            <p className="text-ink/20 font-bold uppercase tracking-widest animate-pulse">Building context...</p>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="pb-24"
      >
        {renderContent()}
      </motion.div>

      <AnimatePresence>
        {showApplication && <ApplicationForm onClose={() => setShowApplication(false)} />}
        {showProgress && <ProgressDetail onClose={() => setShowProgress(false)} />}
      </AnimatePresence>
    </div>
  );
};

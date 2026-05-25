import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Layers, 
  ClipboardCheck, 
  MessageSquare, 
  FileText,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const PROJECTS = [
  {
    id: 'P001',
    name: '香格里拉大酒店 2026 春季艺术沙龙',
    type: '展览策划',
    status: '招募中',
    budget: '¥200,000 - ¥500,000',
    applicants: 24,
    deadline: '2026-05-15',
    priority: 'high'
  },
  {
    id: 'P002',
    name: 'Dior "Art \& Spirit" 限定联名礼盒',
    type: '联名设计',
    status: '洽谈中',
    budget: '¥1,000,000+',
    applicants: 5,
    deadline: '2026-06-20',
    priority: 'medium'
  },
  {
    id: 'P003',
    name: '西岸美术馆公共空间艺术装置定制',
    type: '定制创作',
    status: '执行中',
    budget: '¥150,000',
    applicants: 1,
    deadline: '2026-04-30',
    priority: 'high'
  }
];

export const ProjectManagementView = ({ onDetailClick }: { onDetailClick?: (id: string) => void }) => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-ink italic">项目合作中心</h2>
          <p className="text-ink/40 text-[10px] tracking-[0.3em] uppercase mt-2 font-bold">Comprehensive Project Lifecycle Management</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-4 bg-ink text-white rounded-[1.5rem] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-cobalt transition-all">
          <Plus size={16} />
          新建合作需求
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Main Section */}
        <div className="flex-1 w-full space-y-8">
           {/* Tabs & Search */}
           <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between bg-white p-4 rounded-3xl border border-silver/40 shadow-sm">
             <div className="flex gap-2">
               {['all', 'recruiting', 'executing', 'completed'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-ink text-white shadow-lg" : "text-ink/30 hover:text-ink hover:bg-silver/10"
                  )}
                 >
                   {tab === 'all' && '全部项目'}
                   {tab === 'recruiting' && '招募中'}
                   {tab === 'executing' && '执行中'}
                   {tab === 'completed' && '已完成'}
                 </button>
               ))}
             </div>
             
             <div className="relative md:w-72">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={16} />
               <input 
                 type="text" 
                 placeholder="搜索项目编号或名称..."
                 className="w-full pl-12 pr-4 py-2.5 bg-silver/10 border-none rounded-xl focus:outline-none focus:ring-0 text-[10px] font-medium"
               />
             </div>
           </div>

           {/* Project List */}
           <div className="grid grid-cols-1 gap-6">
             {PROJECTS.map((proj, idx) => (
               <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={proj.id}
                className="bg-white p-8 rounded-[2.5rem] border border-silver/40 shadow-sm group hover:shadow-2xl hover:shadow-cobalt/5 transition-all flex flex-col lg:flex-row lg:items-center gap-8 cursor-pointer active:scale-[0.99]"
                onClick={() => onDetailClick?.(`进入项目 ${proj.name} 的管理控制台`)}
               >
                 <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-3">
                     <span className={cn(
                       "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                       proj.status === '招募中' ? "bg-orange-50 text-orange-600" :
                       proj.status === '洽谈中' ? "bg-blue-50 text-blue-600" :
                       "bg-green-50 text-green-600"
                     )}>
                       {proj.status}
                     </span>
                     <span className="text-[10px] text-ink/20 font-bold uppercase tracking-widest">#{proj.id}</span>
                     {proj.priority === 'high' && <AlertCircle size={14} className="text-red-500" />}
                   </div>
                   
                   <h3 className="text-xl font-serif font-bold text-ink italic group-hover:text-cobalt transition-colors">{proj.name}</h3>
                   
                   <div className="flex flex-wrap gap-6 mt-4">
                     <div className="flex items-center gap-2 text-[10px] text-ink/40 font-bold uppercase tracking-widest">
                       <Layers size={14} />
                       {proj.type}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] text-ink/40 font-bold uppercase tracking-widest">
                       <Clock size={14} />
                       截止日期: {proj.deadline}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] text-ink/40 font-bold uppercase tracking-widest">
                       <Users size={14} />
                       申请艺术家: {proj.applicants}
                     </div>
                   </div>
                 </div>

                 <div className="lg:w-48 space-y-2 text-right">
                   <p className="text-[9px] text-ink/20 font-bold uppercase tracking-widest mb-2">预计预算区间</p>
                   <p className="text-lg font-serif font-bold text-ink italic">{proj.budget}</p>
                 </div>

                 <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-silver/30 pt-6 lg:pt-0 lg:pl-10">
                    <button className="p-3 rounded-2xl bg-silver/20 text-ink/40 hover:bg-cobalt hover:text-white transition-all">
                      <MessageSquare size={18} />
                    </button>
                    <button className="flex items-center gap-3 px-8 py-3 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest group/btn hover:bg-cobalt transition-all">
                      管理项目 <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                 </div>
               </motion.div>
             ))}
           </div>
        </div>

        {/* Sidebar Info */}
        <aside className="w-full lg:w-80 space-y-8 lg:sticky lg:top-24">
           <div className="bg-white p-8 rounded-[2.5rem] border border-silver/40 shadow-sm space-y-8">
              <div>
                <h4 className="text-xs font-bold text-ink uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <ClipboardCheck size={14} className="text-cobalt" />
                  项目待办事项 (TODOS)
                </h4>
                <div className="space-y-4">
                  {[
                    { text: '审核 D001 的初步方案', project: '香格里拉沙龙', urgent: true },
                    { text: '确认 Dior 签约条款', project: 'Dior 联名', urgent: false },
                    { text: '支付西岸艺术装置尾款', project: '西岸装置', urgent: true },
                  ].map((todo, i) => (
                    <div 
                      key={i} 
                      onClick={() => alert(`正在进入 “${todo.text}” 的任务处理流程...`)}
                      className="flex gap-4 p-4 hover:bg-silver/10 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-silver/40 active:scale-95"
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-all group-hover:scale-150", todo.urgent ? "bg-red-500" : "bg-silver")}></div>
                      <div>
                        <p className="text-xs font-bold text-ink leading-tight">{todo.text}</p>
                        <p className="text-[9px] text-ink/30 font-bold uppercase tracking-widest mt-1">{todo.project}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-silver/30">
                 <h4 className="text-xs font-bold text-ink uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <FileText size={14} className="text-purple-600" />
                  智能合规助手
                </h4>
                <div className="p-6 bg-purple-50 rounded-2xl space-y-3">
                   <p className="text-[10px] font-bold text-purple-700 leading-relaxed uppercase tracking-tighter">
                     您有 2 个合同即将到期，建议提前 7 天发起续约或结项流程。
                   </p>
                   <button className="text-[9px] font-black text-purple-900 uppercase underline decoration-2">立即处理</button>
                </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};
